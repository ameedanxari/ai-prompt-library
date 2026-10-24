import * as fs from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { planDeliveryReview } from '../../src/delivery/index.js';
import type { DeliveryDecision, ReviewPurpose } from '../../src/delivery/index.js';
import { createDeliveryFixture as fixture, deliveryFixtureRoots } from './delivery-fixture.js';

afterEach(() => { for (const root of deliveryFixtureRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });
type Fixture = ReturnType<typeof fixture>;
type Role = DeliveryDecision['reviewer']['role'];
const options = (f: Fixture) => ({ trustedReviewProvider: f.provider });
function approve(f: Fixture, kind: ReviewPurpose, role: Role) {
  const binding = planDeliveryReview(f.scope(), kind, ['O1'], options(f)).binding;
  const id = `${kind}-${role}-${f.manifest.decisionRefs.length}`;
  const decision: DeliveryDecision = { id, kind, ...binding, reviewer: { id: role, contextId: `${role}-review-context`, role }, provenance: { kind: role === 'owner' ? 'owner-message' : 'review-session', reference: `trusted://${id}` }, result: 'approved', reason: 'Inspected the original source and current bound outcome evidence for this specific review duty.' };
  f.trust(decision, binding);
  if (kind === 'acceptance') {
    const slice = f.manifest.slices[0];
    slice.acceptanceDecisionIds = [...new Set([...(slice.acceptanceDecisionIds ?? []), ...(slice.acceptanceDecisionId ? [slice.acceptanceDecisionId] : []), id])];
  }
}

describe('review planner and acceptance gates share cumulative duties', () => {
  it.each([
    { policy: 'owner', only: 'owner', missing: 'independent' },
    { policy: 'owner', only: 'independent', missing: 'owner' },
    { policy: 'agent', only: 'agent', missing: 'independent' },
  ] as const)('keeps scope pending with $policy policy and only $only approval', ({ policy, only, missing }) => {
    const f = fixture(); f.manifest.authorization.designAcceptance = policy;
    f.manifest.authorization.independentReview = true; approve(f, 'scope-review', only);
    const pending = planDeliveryReview(f.scope(), 'scope-review', ['O1'], options(f));
    expect(pending.action).toBe('review'); expect(pending.missingRoles).toEqual([missing]);
    expect(f.validate('plan').issues.join(' ')).toContain('original-source coverage review');
    approve(f, 'scope-review', missing);
    expect(planDeliveryReview(f.scope(), 'scope-review', ['O1'], options(f)).action).toBe('reuse');
    expect(f.validate('plan').valid).toBe(true);
  });
  it('accepts independent scope review without dispatching a redundant agent review', () => {
    const f = fixture(); f.manifest.authorization.designAcceptance = 'agent'; f.manifest.authorization.independentReview = true;
    approve(f, 'scope-review', 'independent');
    const review = planDeliveryReview(f.scope(), 'scope-review', ['O1'], options(f));
    expect(review.action).toBe('reuse'); expect(review.missingRoles).toEqual([]);
    expect(f.validate('plan').valid).toBe(true);
  });
  it('accepts a trusted owner under agent-permitted policy without requiring a second agent receipt', () => {
    const f = fixture(); f.manifest.authorization.designAcceptance = 'agent'; f.manifest.authorization.independentReview = false;
    approve(f, 'scope-review', 'owner');
    const review = planDeliveryReview(f.scope(), 'scope-review', ['O1'], options(f));
    expect(review.action).toBe('reuse'); expect(review.missingRoles).toEqual([]);
    expect(f.validate('plan').valid).toBe(true);
  });
  it.each(['owner', 'independent'] as const)('keeps release pending with only %s completeness approval', only => {
    const f = fixture(); f.manifest.authorization.designAcceptance = 'owner'; f.manifest.authorization.independentReview = true;
    f.reviewScope(); approve(f, 'scope-review', 'owner'); f.evidence(); f.accept(); approve(f, 'acceptance', 'owner');
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'release-review');
    approve(f, 'release-review', only);
    const missing = only === 'owner' ? 'independent' : 'owner';
    const pending = planDeliveryReview(f.scope(), 'release-review', ['O1'], options(f));
    expect(pending.action).toBe('review'); expect(pending.missingRoles).toEqual([missing]);
    expect(f.validate('advance').valid).toBe(true);
    expect(f.validate('release').issues.join(' ')).toContain('original-brief completeness');
    approve(f, 'release-review', missing);
    expect(planDeliveryReview(f.scope(), 'release-review', ['O1'], options(f)).action).toBe('reuse');
    expect(f.validate('release').valid).toBe(true);
  });
});

describe('exact current design captures obey execution metadata checks', () => {
  it.each(['future', 'invalid-time', 'unknown-check', 'failed', 'wrong-target', 'wrong-candidate', 'nonproduction'])('cannot use a current desktop capture with %s metadata', mutation => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    expect(f.validate('release').valid).toBe(true);
    const image = f.manifest.evidenceRefs.find(e => e.id.includes('design-desktop'))!;
    if (mutation === 'future') image.observedAt = '2999-01-01T00:00:00Z';
    if (mutation === 'invalid-time') image.observedAt = 'not-an-observation-time';
    if (mutation === 'unknown-check') image.checkId = 'never-observed';
    if (mutation === 'failed') image.result = 'fail';
    if (mutation === 'wrong-target') image.targetId = 'different-target';
    if (mutation === 'wrong-candidate') image.releaseCandidate = 'different-candidate';
    if (mutation === 'nonproduction') image.productionComposition = false;
    // Renew unrelated functional/release receipts: rejection must come from capture
    // integrity, rather than merely a stale receipt after its authored record changes.
    f.accept();
    const stage = mutation === 'wrong-candidate' || mutation === 'nonproduction' ? 'release' : 'advance';
    const report = f.validate(stage);
    expect(report.completion.technicallyVerifiedOutcomeIds).toEqual(['O1']);
    expect(report.completion.designAcceptedOutcomeIds).toEqual([]);
    expect(report.completion.proofAccepted).toBe(false);
    expect(report.valid).toBe(false);
    expect(report.issues.join(' ')).toContain('requires current criterion/context comparisons');
  });
});
