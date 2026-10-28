import * as fs from 'node:fs';
import * as path from 'node:path';
import type { DeliveryDecision, DeliveryScope, DeliveryValidationOptions, ReviewBinding, TrustedReviewProvider } from './types.js';
import { canonical, parseDeliveryManifest } from './manifest.js';
import { planDeliveryReview } from './review-planner.js';
import type { ReviewPlan, ReviewPurpose } from './review-planner.js';
import { deliveryUnitReviewBinding, validateDelivery, readDeliveryRequirements } from './validation.js';

export interface DeliveryReviewRequest {
  kind: ReviewPurpose | 'unit-completion';
  role: 'independent' | 'agent';
  binding: ReviewBinding;
  unitId?: string;
  implementerContextId: string;
  projectRoot: string;
  runDirectory: string;
}
/** Read ONLY from an authenticated host session store, outside producer control.
 * The session actor/context comes from that store, never from the model's reply. */
export interface DeliveryHostReviewReceipt {
  decision: DeliveryDecision;
  binding: ReviewBinding;
  session: { actorId: string; contextId: string; role: DeliveryDecision['reviewer']['role'] };
}
export interface DeliveryReviewHost {
  readReceipt(reference: string): DeliveryHostReviewReceipt | undefined;
  /** Run a real separate review session and retain its original result. Never
   * synthesize approval from a successful command or the implementer's report. */
  dispatch(request: Readonly<DeliveryReviewRequest>): Promise<string>;
}

const sameSet = (a: string[], b: string[]) => Array.isArray(a) && new Set(a).size === a.length && canonical([...a].sort()) === canonical([...b].sort());

export function createHostReviewProvider(host: DeliveryReviewHost): TrustedReviewProvider {
  return { verify(decision, binding) {
    try {
      const receipt = host.readReceipt(decision.provenance.reference);
      return !!receipt && decision.provenance.kind === 'review-session' &&
        decision.scopeDigest === binding.scopeDigest && decision.releaseScopeId === binding.releaseScopeId && sameSet(decision.outcomeIds, binding.outcomeIds) && sameSet(decision.artifactDigests, binding.artifactDigests) &&
        receipt.session.actorId === decision.reviewer.id && receipt.session.contextId === decision.reviewer.contextId && receipt.session.role === decision.reviewer.role &&
        canonical(receipt.decision) === canonical(decision) && canonical(receipt.binding) === canonical(binding);
    } catch { return false; }
  } };
}

export function planDeliveryUnitReview(scope: DeliveryScope, unitId: string, options: Pick<DeliveryValidationOptions, 'trustedReviewProvider' | 'trustedAuthorizationProvider' | 'requireAuthenticatedAuthorization'> = {}): ReviewPlan {
  const binding = deliveryUnitReviewBinding(scope, unitId);
  const unit = scope.manifest.slices.flatMap(s => s.units).find(u => u.id === unitId)!;
  const provider = options.trustedReviewProvider;
  const current = scope.manifest.decisionRefs.filter(d => {
    if (d.kind !== 'unit-completion' || d.unitId !== unitId || d.reviewer.role !== 'independent' || d.reviewer.contextId === scope.manifest.authorization.implementerContextId) return false;
    if (canonical(d.outcomeIds) !== canonical(binding.outcomeIds) || canonical(d.artifactDigests) !== canonical(binding.artifactDigests) || d.scopeDigest !== binding.scopeDigest) return false;
    try { return provider?.verify(d, binding) === true; } catch { return false; }
  });
  const rejected = current.filter(d => d.result === 'rejected');
  const report = validateDelivery(scope.runDirectory, { ...options, stage: 'plan' });
  const designs = readDeliveryRequirements(scope).designs;
  const ready = report.valid && unit.outcomeIds.every(id => report.completion.technicallyVerifiedOutcomeIds.includes(id) &&
    (!designs.some(d => d.surfaceId === scope.manifest.outcomes.find(o => o.id === id)?.surfaceId) || report.completion.designAcceptedOutcomeIds.includes(id)));
  if (rejected.length || !ready) return { action: 'blocked', binding, missingRoles: ['independent'], decisionIds: rejected.map(d => d.id), reason: rejected.length ? 'Current completed-unit proof has a trusted rejection; repair it before redispatch.' : 'Full current outcome and design evidence, source review and bounded detail are required before retiring this unit.' };
  if (current.some(d => d.result === 'approved')) return { action: 'reuse', binding, missingRoles: [], decisionIds: current.map(d => d.id), reason: 'Exact completed-unit proof already has an independent review.' };
  return { action: 'review', binding, missingRoles: ['independent'], decisionIds: [], reason: 'Review the completed unit and full current outcome proof before releasing its pending detail budget.' };
}

/** Dispatch only ready missing roles; returns receipts for the caller to persist.
 * Owner duties remain a visible human checkpoint. No approval is fabricated. */
export async function dispatchDeliveryReview(scope: DeliveryScope, input: { kind: ReviewPurpose; outcomeIds: string[]; releaseScopeId?: string } | { kind: 'unit-completion'; unitId: string }, host: DeliveryReviewHost, options: Pick<DeliveryValidationOptions, 'trustedReviewProvider' | 'trustedAuthorizationProvider' | 'requireAuthenticatedAuthorization'> = {}): Promise<{ plan: ReviewPlan; decisions: DeliveryDecision[] }> {
  const manifestPath = path.join(scope.runDirectory, 'delivery-manifest.json');
  const manifestBytes = fs.readFileSync(manifestPath, 'utf8');
  const manifestIdentity = canonical(scope.manifest);
  if (canonical(parseDeliveryManifest(JSON.parse(manifestBytes))) !== manifestIdentity) throw new Error('delivery: review scope is stale relative to the current manifest');
  const hostProvider = createHostReviewProvider(host);
  const provider: TrustedReviewProvider = { verify: (d, b) => hostProvider.verify(d, b) || options.trustedReviewProvider?.verify(d, b) === true };
  const plan = input.kind === 'unit-completion' ? planDeliveryUnitReview(scope, input.unitId, { ...options, trustedReviewProvider: provider })
    : planDeliveryReview(scope, input.kind, input.outcomeIds, { ...options, trustedReviewProvider: provider, releaseScopeId: input.releaseScopeId });
  const decisions: DeliveryDecision[] = [];
  if (plan.action !== 'review') return { plan, decisions };
  for (const role of plan.missingRoles) {
    if (role === 'owner') continue;
    const request: DeliveryReviewRequest = { kind: input.kind, role, binding: plan.binding, implementerContextId: scope.manifest.authorization.implementerContextId,
      projectRoot: scope.projectRoot, runDirectory: scope.runDirectory, ...(input.kind === 'unit-completion' ? { unitId: input.unitId } : {}) };
    const reference = await host.dispatch(request);
    const receipt = host.readReceipt(reference);
    const decision = receipt?.decision;
    if (!decision || decision.provenance.reference !== reference || decision.kind !== input.kind || decision.unitId !== request.unitId ||
      decision.reviewer.role !== role || decision.reviewer.contextId === request.implementerContextId || !hostProvider.verify(decision, plan.binding)) throw new Error('delivery: review host returned an unauthenticated, mismatched or implementer-authored receipt');
    if (scope.manifest.decisionRefs.some(d => d.id === decision.id) || decisions.some(d => d.id === decision.id)) throw new Error('delivery: review host returned a duplicate decision ID');
    parseDeliveryManifest({ ...scope.manifest, decisionRefs: [...scope.manifest.decisionRefs, ...decisions, decision] });
    decisions.push(decision);
  }
  if (fs.readFileSync(manifestPath, 'utf8') !== manifestBytes || canonical(scope.manifest) !== manifestIdentity) throw new Error('delivery: manifest changed while the review host was running');
  const latestPlan = input.kind === 'unit-completion' ? planDeliveryUnitReview(scope, input.unitId, { ...options, trustedReviewProvider: provider })
    : planDeliveryReview(scope, input.kind, input.outcomeIds, { ...options, trustedReviewProvider: provider, releaseScopeId: input.releaseScopeId });
  if (latestPlan.action === 'blocked' || canonical(latestPlan.binding) !== canonical(plan.binding)) throw new Error('delivery: reviewed inputs changed or became unready while the review host was running');
  return { plan, decisions };
}
