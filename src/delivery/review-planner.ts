import type { DeliveryScope, DeliveryValidationOptions, ReviewBinding } from './types.js';
import { canonical } from './manifest.js';
import { designReviewReady, validateDelivery, deliveryDesignReviewBinding, deliveryReleaseReviewBinding, deliveryReviewBinding, deliveryScopeDigest, readDeliveryRequirements } from './validation.js';
import { deliveryChangePolicy } from './lifecycle.js';

import { requiredReviewRoles, reviewRoleSatisfies } from './review-policy.js';
import type { ReviewPurpose } from './review-policy.js';
export type { ReviewPurpose } from './review-policy.js';
export interface ReviewPlan {
  action: 'review' | 'reuse' | 'blocked';
  binding: ReviewBinding;
  reason: string;
  decisionIds: string[];
  missingRoles: ('owner' | 'independent' | 'agent')[];
}
const same = (a: string[], b: string[]) => canonical([...new Set(a)].sort()) === canonical([...new Set(b)].sort()) && new Set(a).size === a.length;
/** Call before dispatching a reviewer. A new session is not a new review input. */
export function planDeliveryReview(scope: DeliveryScope, kind: ReviewPurpose, outcomeIds: string[], options: Pick<DeliveryValidationOptions, 'trustedReviewProvider'> = {}): ReviewPlan {
  const m = scope.manifest; const requirements = readDeliveryRequirements(scope);
  if (!['scope-review','design-review','acceptance','release-review'].includes(kind)) throw new Error('delivery: unknown review purpose');
  if (!outcomeIds.length || new Set(outcomeIds).size !== outcomeIds.length || outcomeIds.some(id => !m.outcomes.some(o => o.id === id))) throw new Error('delivery: invalid review outcomes');
  const all = m.outcomes.map(o => o.id).sort();
  if (['scope-review','release-review'].includes(kind) && !same(outcomeIds, all)) throw new Error('delivery: original-scope reviews must cover the complete outcome ledger');
  const binding = kind === 'scope-review' ? { scopeDigest: deliveryScopeDigest(m), outcomeIds: all, artifactDigests: [...new Set([...m.sourceInputs, ...requirements.originalSources].map(s => s.sha256))].sort() }
    : kind === 'design-review' ? deliveryDesignReviewBinding(scope, outcomeIds)
    : kind === 'release-review' ? deliveryReleaseReviewBinding(scope)
    : deliveryReviewBinding(scope, outcomeIds);
  const roles = requiredReviewRoles(m.authorization, kind);
  const current = m.decisionRefs.filter(d => {
    if (d.kind !== kind || d.scopeDigest !== binding.scopeDigest || !same(d.outcomeIds, binding.outcomeIds) || !same(d.artifactDigests, binding.artifactDigests)) return false;
    if (d.reviewer.role === 'independent' && d.reviewer.contextId === m.authorization.implementerContextId) return false;
    try { return options.trustedReviewProvider?.verify(d, binding) === true; } catch { return false; }
  });
  const missingRoles = [...roles].filter(role => !current.some(d => d.result === 'approved' && reviewRoleSatisfies(d.reviewer.role, role)));
  const rejected = current.filter(d => d.result === 'rejected');
  if (rejected.length) return { action: 'blocked', binding, missingRoles, decisionIds: rejected.map(d => d.id), reason: 'Unchanged inputs have a trusted rejection. Resolve its finding or record an authorized source change; do not dispatch another identical review.' };
  let ready = true;
  if (kind === 'design-review') ready = planDeliveryReview(scope, 'scope-review', all, options).action === 'reuse' && designReviewReady(scope, outcomeIds);
  if (kind === 'acceptance' || kind === 'release-review') {
    const status = validateDelivery(scope.runDirectory, { ...options, stage: 'plan' });
    const applicable = m.outcomes.filter(o => outcomeIds.includes(o.id) && o.applicability === 'applicable');
    ready = status.valid && applicable.every(o => status.completion.technicallyVerifiedOutcomeIds.includes(o.id) &&
      (!requirements.designs.some(d => d.surfaceId === o.surfaceId) || status.completion.designAcceptedOutcomeIds.includes(o.id)));
    if (kind === 'release-review') ready &&= applicable.filter(o => o.releaseRequired).every(o => status.completion.acceptedOutcomeIds.includes(o.id));
  }
  if (!ready) return { action: 'blocked', binding, missingRoles, decisionIds: current.map(d => d.id), reason: 'Required source validation, execution, or composed experience evidence is missing, failed or unverified. Repair the evidence/result before dispatching a review.' };
  if (!missingRoles.length) return { action: 'reuse', binding, missingRoles, decisionIds: current.map(d => d.id), reason: 'Current inputs already have every required trusted review. Retain the judgment; run only applicable execution checks.' };
  return { action: 'review', binding, missingRoles, decisionIds: current.map(d => d.id), reason: 'Review only the missing roles for these source/evidence inputs. Review availability does not establish acceptance.' };
}

/** This policy authorizes a workflow, not a database operation. Callers must
 * verify the actual reset target before any authorized destructive command. */
export function getDeliveryChangePolicy(scope: DeliveryScope, targetId: string, options: Pick<DeliveryValidationOptions, 'trustedReviewProvider'> = {}) {
  if (!scope.manifest.surfaces.some(s => s.target.id === targetId)) throw new Error('delivery: unknown lifecycle target');
  const review = planDeliveryReview(scope, 'scope-review', scope.manifest.outcomes.map(o => o.id), options);
  return deliveryChangePolicy(readDeliveryRequirements(scope).lifecycle, review.action === 'reuse', targetId);
}
