import type { DeliveryDecision, DeliveryScope, OwnerAttestation, ReviewBinding, TrustedReviewProvider } from './types.js';
import { canonical } from './manifest.js';
import { planDeliveryReview } from './review-planner.js';

/** Characters of the scope digest the owner must repeat in the confirming message. */
export const OWNER_ATTESTATION_DIGEST_PREFIX = 8;
const sameSet = (a: string[], b: string[]) => new Set(a).size === a.length && canonical([...a].sort()) === canonical([...new Set(b)].sort());

export function isOwnerAttested(decision: Readonly<DeliveryDecision> | undefined): boolean {
  return decision?.provenance?.kind === 'owner-attested';
}

/** Owner attestation is a recorded chat confirmation, not authentication: it proves
 * the record is complete and bound to this exact scope, never who typed the quote.
 * Only original-source scope review accepts it. Returns the first defect, if any. */
export function ownerAttestationProblem(decision: Readonly<DeliveryDecision>, binding: Readonly<ReviewBinding>, now: Date = new Date()): string | undefined {
  const a = decision.provenance?.attestation as Partial<OwnerAttestation> | undefined;
  if (!isOwnerAttested(decision)) return 'not an owner-attested record';
  if (decision.kind !== 'scope-review') return 'owner attestation only covers original-source scope review';
  if (decision.reviewer?.role !== 'owner') return 'owner attestation requires reviewer role owner';
  if (!a || typeof a !== 'object') return 'attestation record missing';
  if (typeof a.quote !== 'string' || !a.quote.trim()) return 'owner chat quote missing';
  if (a.quote.length > 4000) return 'owner chat quote exceeds 4000 characters';
  const at = typeof a.messageAt === 'string' ? Date.parse(a.messageAt) : NaN;
  if (!Number.isFinite(at) || at > now.getTime() + 60_000) return 'owner message timestamp missing, invalid or in the future';
  if (typeof a.scopeDigest !== 'string' || !/^[a-f0-9]{64}$/.test(a.scopeDigest)) return 'attested scope digest missing or malformed';
  if (a.scopeDigest !== decision.scopeDigest || a.scopeDigest !== binding.scopeDigest) return 'attested scope digest does not match the current scope';
  if (!a.quote.toLowerCase().includes(a.scopeDigest.slice(0, OWNER_ATTESTATION_DIGEST_PREFIX))) return `owner quote does not repeat the first ${OWNER_ATTESTATION_DIGEST_PREFIX} characters of the scope digest`;
  if (!sameSet(decision.outcomeIds, binding.outcomeIds) || !sameSet(decision.artifactDigests, binding.artifactDigests)) return 'attested outcomes or artifacts do not match the current scope';
  return undefined;
}

/** Reference host adapter for `--review-verifier` or `--owner-attestation`. It
 * accepts only complete owner-attested scope reviews and verifies nothing else,
 * so it can never authenticate an agent, independent or acceptance receipt. */
export const ownerAttestationProvider: TrustedReviewProvider = {
  verify: (decision, binding) => isOwnerAttested(decision) && ownerAttestationProblem(decision, binding) === undefined,
};
export const trustedReviewProvider = ownerAttestationProvider;

/** Message the agent shows before recording; the owner's reply must repeat the code. */
export function ownerAttestationPrompt(binding: Readonly<ReviewBinding>): string {
  return `Reply "approve scope ${binding.scopeDigest.slice(0, OWNER_ATTESTATION_DIGEST_PREFIX)}" to confirm that the outcome ledger (${binding.outcomeIds.length} outcomes) covers your original sources for scope digest ${binding.scopeDigest}.`;
}

/** Build the record only after the owner's explicit chat confirmation; copy the
 * reply verbatim. The caller appends it to manifest.decisionRefs. */
export function createOwnerAttestedScopeReview(scope: DeliveryScope, input: { id: string; reviewerId: string; contextId: string; reference: string; quote: string; messageAt: string; result?: 'approved' | 'rejected'; reason: string }): DeliveryDecision {
  const { binding } = planDeliveryReview(scope, 'scope-review', scope.manifest.outcomes.map(o => o.id));
  const decision: DeliveryDecision = {
    id: input.id, kind: 'scope-review', ...binding,
    reviewer: { id: input.reviewerId, contextId: input.contextId, role: 'owner' },
    provenance: { kind: 'owner-attested', reference: input.reference, attestation: { quote: input.quote, messageAt: input.messageAt, scopeDigest: binding.scopeDigest } },
    result: input.result ?? 'approved', reason: input.reason,
  };
  const problem = ownerAttestationProblem(decision, binding);
  if (problem) throw new Error(`delivery: ${problem}`);
  return decision;
}
