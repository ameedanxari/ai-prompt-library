#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolveDeliveryScope, validateDeliveryRun } from './delivery-gate.js';
import type { DeliveryStage, TrustedReviewProvider } from './delivery-gate.js';
import { deliveryProjections } from './delivery-projections.js';
import { ownerAttestationPrompt, ownerAttestationProvider } from '../delivery/attestation.js';
import { planDeliveryReview } from '../delivery/review-planner.js';

function within(root: string, file: string): boolean {
  const relative = path.relative(root, file);
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative));
}

/** Only an explicitly selected, host-owned adapter may authenticate review.
 * Never load executable code named by the project manifest or a receipt. */
async function verifier(file: string | undefined, projectRoot: string): Promise<TrustedReviewProvider | undefined> {
  if (!file) return undefined;
  if (!path.isAbsolute(file)) throw new Error('--review-verifier must be an absolute host-owned module path');
  const real = fs.realpathSync(file);
  if (within(projectRoot, real)) throw new Error('Review verifier must be outside the reviewed project');
  const module = await import(pathToFileURL(real).href);
  if (typeof module.trustedReviewProvider?.verify !== 'function') {
    throw new Error('Review verifier must export trustedReviewProvider.verify');
  }
  return module.trustedReviewProvider as TrustedReviewProvider;
}

export async function runDeliveryCli(args: string[]): Promise<number> {
  if (args.includes('--help')) {
    console.log('validate-delivery <run-directory-or-checkpoint> --stage plan|execute|advance|release [--review-verifier /host/adapter.mjs] [--owner-attestation] [--resolve] [--project] [--scope-binding]');
    return 0;
  }
  try {
    const target = args[0];
    if (!target || target.startsWith('--')) throw new Error('A run directory or checkpoint is required');
    let stage: DeliveryStage = 'plan';
    let adapter: string | undefined;
    let resolveOnly = false;
    let project = false;
    let ownerAttestation = false;
    let scopeBinding = false;
    for (let index = 1; index < args.length; index++) {
      const arg = args[index];
      if (arg === '--stage') {
        const candidate = args[++index];
        if (!['plan', 'execute', 'advance', 'release'].includes(candidate)) throw new Error('Invalid delivery stage');
        stage = candidate as DeliveryStage;
      } else if (arg === '--review-verifier') {
        adapter = args[++index];
        if (!adapter) throw new Error('--review-verifier requires a path');
      } else if (arg === '--resolve') resolveOnly = true;
      else if (arg === '--project') project = true;
      else if (arg === '--owner-attestation') ownerAttestation = true;
      else if (arg === '--scope-binding') scopeBinding = true;
      else throw new Error(`Unknown argument: ${arg}`);
    }
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
    const host = await verifier(adapter, scope.projectRoot);
    // The library's own reference adapter accepts only complete owner-attested scope reviews.
    const provider: TrustedReviewProvider | undefined = ownerAttestation
      ? { verify: (decision, binding) => ownerAttestationProvider.verify(decision, binding) || host?.verify(decision, binding) === true }
      : host;
    const report = validateDeliveryRun(target, { stage, trustedReviewProvider: provider });
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
