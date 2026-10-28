#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveDeliveryScope, validateDeliveryRun, dispatchDeliveryReview, createHostReviewProvider, deliveryReleaseSelection, readDeliveryRequirements, deliveryAuthorizationBinding, getDeliveryExecutionPolicy } from './delivery-gate.js';
import type { DeliveryStage, TrustedReviewProvider, TrustedAuthorizationProvider, DeliveryReviewHost, ReviewPurpose } from './delivery-gate.js';
import { deliveryProjections } from './delivery-projections.js';
import { ownerAttestationPrompt, ownerAttestationProvider } from '../delivery/attestation.js';
import { planDeliveryReview } from '../delivery/review-planner.js';

function within(root: string, file: string): boolean {
  const relative = path.relative(root, file);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

/** Only an explicitly selected, host-owned adapter may authenticate review.
 * Never load executable code named by the project manifest or a receipt. */
async function verifier(file: string | undefined, projectRoot: string): Promise<{ trustedReviewProvider?: TrustedReviewProvider; trustedAuthorizationProvider?: TrustedAuthorizationProvider; deliveryReviewHost?: DeliveryReviewHost }> {
  if (!file) return {};
  if (!path.isAbsolute(file)) throw new Error('--review-verifier must be an absolute host-owned module path');
  const real = fs.realpathSync(file);
  if (within(projectRoot, real)) throw new Error('Review verifier must be outside the reviewed project');
  const module = await import(pathToFileURL(real).href);
  if (typeof module.trustedReviewProvider?.verify !== 'function' && typeof module.trustedAuthorizationProvider?.verify !== 'function' && !(typeof module.deliveryReviewHost?.readReceipt === 'function' && typeof module.deliveryReviewHost?.dispatch === 'function')) {
    throw new Error('Host adapter must export trustedReviewProvider.verify, trustedAuthorizationProvider.verify or deliveryReviewHost');
  }
  return module;
}

export async function runDeliveryCli(args: string[]): Promise<number> {
  if (args.includes('--help')) {
    console.log('validate-delivery <run-directory-or-checkpoint> --stage plan|execute|advance|release [--release-scope <train-id>] [--review-verifier /host/adapter.mjs] [--dispatch-review scope-review|design-review|acceptance|release-review --outcomes O1,O2 | --review-unit tasks-proof.md#T1] [--authorization-binding | --execution-policy] [--owner-attestation] [--resolve] [--project] [--scope-binding]');
    return 0;
  }
  try {
    const target = args[0];
    if (!target || target.startsWith('--')) throw new Error('A run directory or checkpoint is required');
    let stage: DeliveryStage = 'plan';
    let adapter: string | undefined = process.env.AI_PROMPT_REVIEW_VERIFIER;
    let resolveOnly = false;
    let project = false;
    let ownerAttestation = false;
    let scopeBinding = false;
    let releaseScopeId: string | undefined;
    let dispatchKind: ReviewPurpose | undefined;
    let reviewUnit: string | undefined;
    let reviewOutcomes: string[] | undefined;
    let authorizationBinding = false;
    let executionPolicy = false;
    for (let index = 1; index < args.length; index++) {
      const arg = args[index];
      if (arg === '--stage') {
        const candidate = args[++index];
        if (!['plan', 'execute', 'advance', 'release'].includes(candidate)) throw new Error('Invalid delivery stage');
        stage = candidate as DeliveryStage;
      } else if (arg === '--review-verifier') {
        adapter = args[++index];
        if (!adapter) throw new Error('--review-verifier requires a path');
      } else if (arg === '--release-scope') {
        releaseScopeId = args[++index];
        if (!releaseScopeId || releaseScopeId.startsWith('--')) throw new Error('--release-scope requires a train id');
      } else if (arg === '--dispatch-review') {
        const kind = args[++index];
        if (!['scope-review','design-review','acceptance','release-review'].includes(kind)) throw new Error('Invalid dispatch review purpose');
        dispatchKind = kind as ReviewPurpose;
      } else if (arg === '--review-unit') {
        reviewUnit = args[++index]; if (!reviewUnit || reviewUnit.startsWith('--')) throw new Error('--review-unit requires a canonical unit id');
      } else if (arg === '--outcomes') {
        const ids = args[++index]; if (!ids || ids.startsWith('--')) throw new Error('--outcomes requires comma-separated outcome ids');
        reviewOutcomes = ids.split(',');
      } else if (arg === '--authorization-binding') authorizationBinding = true;
      else if (arg === '--execution-policy') executionPolicy = true;
      else if (arg === '--resolve') resolveOnly = true;
      else if (arg === '--project') project = true;
      else if (arg === '--owner-attestation') ownerAttestation = true;
      else if (arg === '--scope-binding') scopeBinding = true;
      else throw new Error(`Unknown argument: ${arg}`);
    }
    if (reviewUnit && dispatchKind || reviewOutcomes && !dispatchKind) throw new Error('Select either --dispatch-review (with optional --outcomes) or --review-unit');
    if ([resolveOnly, scopeBinding, authorizationBinding, executionPolicy].filter(Boolean).length > 1 || (dispatchKind || reviewUnit) && (resolveOnly || scopeBinding || authorizationBinding || executionPolicy || project)) throw new Error('Read/resolve/project modes cannot be combined with review dispatch');
    if (releaseScopeId !== undefined && (stage !== 'release' || resolveOnly || scopeBinding || project)) throw new Error('--release-scope requires stage release and cannot resolve, project or request a scope binding');
    const scope = resolveDeliveryScope(target, { allowLegacy: false });
    if (!scope) throw new Error('A delivery manifest is required');
    if (resolveOnly) {
      console.log(JSON.stringify({ runDirectory: scope.runDirectory, projectRoot: scope.projectRoot, activeFiles: scope.activeFiles }));
      return 0;
    }
    if (scopeBinding) {
      // Values an owner-attested scope review must bind, plus the confirmation to show the owner.
      const { binding } = planDeliveryReview(scope, 'scope-review', scope.manifest.outcomes.map(o => o.id));
      console.log(JSON.stringify({ binding, prompt: ownerAttestationPrompt(binding) }, null, 2));
      return 0;
    }
    if (authorizationBinding) { console.log(JSON.stringify(deliveryAuthorizationBinding(scope), null, 2)); return 0; }
    const host = await verifier(adapter, scope.projectRoot);
    const reviewHostProvider = host.deliveryReviewHost ? createHostReviewProvider(host.deliveryReviewHost) : undefined;
    // The library's own reference adapter accepts only complete owner-attested scope reviews.
    const provider: TrustedReviewProvider = { verify: (decision, binding) => (ownerAttestation && ownerAttestationProvider.verify(decision, binding)) || reviewHostProvider?.verify(decision, binding) === true || host.trustedReviewProvider?.verify(decision, binding) === true };
    const options = { stage, releaseScopeId, trustedReviewProvider: provider, trustedAuthorizationProvider: host.trustedAuthorizationProvider };
    if (executionPolicy) { const policy = getDeliveryExecutionPolicy(scope, options); console.log(JSON.stringify(policy, null, 2)); return policy.problem ? 1 : 0; }
    if (dispatchKind || reviewUnit) {
      if (!host.deliveryReviewHost) throw new Error('Review dispatch requires a configured host adapter with deliveryReviewHost; no review was performed');
      const manifestPath = path.join(scope.runDirectory, 'delivery-manifest.json');
      const before = fs.readFileSync(manifestPath, 'utf8');
      const outcomeIds = reviewOutcomes ?? (dispatchKind === 'scope-review' ? scope.manifest.outcomes.map(o => o.id) : dispatchKind === 'release-review' ? deliveryReleaseSelection(scope, readDeliveryRequirements(scope).requirements, releaseScopeId).outcomeIds : scope.manifest.slices.find(s => s.id === scope.manifest.activeSlice)!.outcomeIds);
      const result = await dispatchDeliveryReview(scope, reviewUnit ? { kind: 'unit-completion', unitId: reviewUnit } : { kind: dispatchKind!, outcomeIds, releaseScopeId }, host.deliveryReviewHost, options);
      if (fs.readFileSync(manifestPath, 'utf8') !== before) throw new Error('Manifest changed during review dispatch; no receipts were persisted');
      if (result.decisions.length) {
        scope.manifest.decisionRefs.push(...result.decisions);
        if (dispatchKind === 'acceptance') for (const slice of scope.manifest.slices) {
          if (JSON.stringify([...slice.outcomeIds].sort()) === JSON.stringify([...outcomeIds].sort())) slice.acceptanceDecisionIds = [...new Set([...(slice.acceptanceDecisionIds ?? []), ...result.decisions.map(d => d.id)])];
        }
        const temporary = `${manifestPath}.review-pending`;
        fs.writeFileSync(temporary, JSON.stringify(scope.manifest, null, 2) + '\n', { flag: 'wx' });
        fs.renameSync(temporary, manifestPath);
      }
      const report = validateDeliveryRun(target, options);
      console.log(JSON.stringify({ review: result.plan, decisionIds: result.decisions.map(d => d.id), report }, null, 2));
      return !report.valid || result.plan.action === 'blocked' || result.plan.missingRoles.includes('owner') || result.decisions.some(d => d.result === 'rejected') ? 1 : 0;
    }
    const report = validateDeliveryRun(target, options);
    if (project && report.valid) {
      for (const [file, content] of deliveryProjections(scope)) fs.writeFileSync(file, content);
    }
    console.log(JSON.stringify(report, null, 2));
    return report.valid ? 0 : 1;
  } catch (error) {
    console.error(`Delivery validation failed: ${error instanceof Error ? error.message : String(error)}`);
    return 2;
  }
}

if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runDeliveryCli(process.argv.slice(2));
}
