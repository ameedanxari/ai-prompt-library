import { resolveDeliveryScope } from '../delivery/manifest.js';
import { validateDelivery } from '../delivery/validation.js';
import { preflightDelivery } from '../delivery/preflight.js';
import type { DeliveryReport, DeliveryValidationOptions } from '../delivery/types.js';

export * from '../delivery/types.js';
export { validatePlanningIntegrity, matchesPlanningGlob } from '../delivery/planning-integrity.js';
export type { PlanningContext, PlanningIssue, PlanningReport } from '../delivery/planning-integrity.js';
export { planDeliveryReview, getDeliveryChangePolicy } from '../delivery/review-planner.js';
export { OWNER_ATTESTATION_DIGEST_PREFIX, createOwnerAttestedScopeReview, isOwnerAttested, ownerAttestationProblem, ownerAttestationPrompt, ownerAttestationProvider } from '../delivery/attestation.js';
export type { ReviewPlan, ReviewPurpose } from '../delivery/review-planner.js';
export type { DeliveryChangePolicy } from '../delivery/lifecycle.js';
export { parseDeliveryManifest, resolveDeliveryScope } from '../delivery/manifest.js';
export { assertDeliveryReleaseAuthority, deliveryReleaseSelection } from '../delivery/release.js';
export type { DeliveryReleaseSelection } from '../delivery/release.js';
export {
  deliveryScopeDigest, deliveryEvidenceBinding, deliveryReviewBinding, deliveryDesignReviewBinding, deliveryReleaseReviewBinding, readDeliveryRequirements,
} from '../delivery/validation.js';

/** One gate for the package API and shell entry points. Resolve unsafe or
 * malformed contracts before reading executable detail; report all safe local
 * defects even when scope authority is still pending. */
export function validateDeliveryRun(targetDir: string, options: DeliveryValidationOptions): DeliveryReport {
  let scope;
  try { scope = resolveDeliveryScope(targetDir, { allowLegacy: false }); }
  catch { return validateDelivery(targetDir, options); }
  if (!scope) return validateDelivery(targetDir, options);
  return preflightDelivery(scope, options);
}

export * from '../delivery/comparison.js';
export * from '../delivery/planning-quality.js';
export * from '../delivery/execution-policy.js';
export * from '../delivery/review-host.js';
export { deliveryUnitReviewBinding } from '../delivery/validation.js';
export { preflightDelivery } from '../delivery/preflight.js';
