import * as fs from 'node:fs';
import { afterEach, describe, expect, it } from 'vitest';
import { deliveryEvidenceBinding, deliveryDesignReviewBinding, deliveryScopeDigest, getDeliveryChangePolicy, planDeliveryReview } from '../../src/delivery/index.js';
import { createDeliveryFixture as fixture, deliveryFixtureRoots } from './delivery-fixture.js';

afterEach(() => { for (const root of deliveryFixtureRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });
type Fixture = ReturnType<typeof fixture>;
const options = (f: Fixture) => ({ trustedReviewProvider: f.provider });
function changeSources(f: Fixture) { f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) }; }
function scopedFixture() {
  const f = fixture('api'); const t = f.manifest.surfaces[0].target;
  t.sharedPaths = ['shared.ts']; t.bindings.push(f.write('shared.ts', 'shared contract'), f.write('other.ts', 'other route'));
  f.manifest.outcomes[0].bindingPaths = ['app.ts'];
  f.manifest.outcomes.push({ ...f.manifest.outcomes[0], id: 'O2', entryPoint: '/other', bindingPaths: ['other.ts'], dependencies: [] });
  f.reviewScope(); f.evidence(); f.accept(); return f;
}
function freshCaptures(f: Fixture) {
  const b = deliveryEvidenceBinding(f.scope(), 'O1');
  const captures = f.manifest.evidenceRefs.filter(e => e.kind === 'image');
  const fresh = captures.map(e => ({ ...e, ...b, id: `fresh-${e.id}`, observedAt: '2026-01-02T00:00:00Z', releaseCandidate: f.manifest.releaseCandidate, capture: { ...e.capture! } }));
  f.manifest.evidenceRefs.push(...fresh); return fresh;
}

describe('impact-scoped original-source and visual reviews', () => {
  it('preserves original-source approval and accepted unaffected outcome on another route change', () => {
    const f = scopedFixture(); const before = deliveryEvidenceBinding(f.scope(), 'O1'); const scope = deliveryScopeDigest(f.manifest);
    f.manifest.surfaces[0].target.bindings[2] = f.write('other.ts', 'other route repaired');
    expect(deliveryScopeDigest(f.manifest)).toBe(scope);
    expect(deliveryEvidenceBinding(f.scope(), 'O1')).toEqual(before);
    expect(planDeliveryReview(f.scope(), 'scope-review', ['O1','O2'], options(f)).action).toBe('reuse');
    expect(f.validate('advance').valid).toBe(true);
  });
  it.each(['own','shared','unclassified','dependency'])('invalidates relevant or uncertain change: %s', change => {
    const f = scopedFixture();
    if (change === 'unclassified') f.manifest.surfaces[0].target.bindings.push(f.write('unknown.ts', 'unclassified dependency'));
    if (change === 'dependency') f.manifest.outcomes[0].dependencies.push({ outcomeId: 'O2', kind: 'technical' });
    const before = deliveryEvidenceBinding(f.scope(), 'O1');
    const file = change === 'own' ? 'app.ts' : change === 'shared' ? 'shared.ts' : change === 'dependency' ? 'other.ts' : 'unknown.ts';
    const index = f.manifest.surfaces[0].target.bindings.findIndex(b => b.path === file);
    f.manifest.surfaces[0].target.bindings[index] = f.write(file, 'changed relevant implementation');
    expect(deliveryEvidenceBinding(f.scope(), 'O1').reviewDigest).not.toBe(before.reviewDigest);
  });
  it('requires renewed source approval for a dependency-map change', () => {
    const f = scopedFixture(); f.manifest.outcomes[0].bindingPaths = ['other.ts'];
    expect(planDeliveryReview(f.scope(), 'scope-review', ['O1','O2'], options(f)).action).toBe('review');
    expect(f.validate('execute').valid).toBe(false);
  });
  it('does not drop original obligations while optimizing scope fingerprints', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    f.requirements.requirements.push({ ...f.requirements.requirements[0], id: 'R-missing', description: 'Member sees completed job and operations sees labour minutes' });
    changeSources(f); f.reviewScope();
    expect(f.validate('release').issues.join(' ')).toContain('missing authoritative requirement R-missing');
  });
  it('keeps a design judgment only after fresh identical captures on a new deployment', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    const binding = deliveryDesignReviewBinding(f.scope(), ['O1']); const exact = deliveryEvidenceBinding(f.scope(), 'O1');
    f.manifest.surfaces[0].target.revision = 'deployment-2';
    expect(deliveryEvidenceBinding(f.scope(), 'O1').targetDigest).not.toBe(exact.targetDigest);
    expect(deliveryEvidenceBinding(f.scope(), 'O1').reviewDigest).toBe(exact.reviewDigest);
    expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual([]);
    freshCaptures(f);
    expect(deliveryDesignReviewBinding(f.scope(), ['O1'])).toEqual(binding);
    expect(planDeliveryReview(f.scope(), 'design-review', ['O1'], options(f)).action).toBe('reuse');
    expect(f.validate('advance').completion.designAcceptedOutcomeIds).toEqual(['O1']);
    expect(f.validate('release').valid).toBe(false); // old functional execution still cannot prove a release
  });
  it('reuses functional judgment after fresh identical execution on a new deployment, but requires a fresh release review', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    f.manifest.surfaces[0].target.revision = 'new-deployment'; f.manifest.releaseCandidate = 'candidate-2';
    freshCaptures(f);
    const b = deliveryEvidenceBinding(f.scope(), 'O1');
    f.manifest.evidenceRefs.push(...f.manifest.evidenceRefs.filter(e => ['execution','recovery'].includes(e.kind)).map(e => ({ ...e, ...b, id: `fresh-${e.id}`, releaseCandidate: 'candidate-2', observedAt: '2026-01-02T00:00:00Z' })));
    expect(f.validate('advance').valid).toBe(true);
    expect(planDeliveryReview(f.scope(), 'acceptance', ['O1'], options(f)).action).toBe('reuse');
    expect(f.validate('release').issues.join(' ')).toContain('original-brief completeness');
  });
  it.each(['pixels','source','theme','route','missing','future','failed','check','candidate','composition'])('refuses stale or dishonest design reuse: %s', change => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept(); f.manifest.surfaces[0].target.revision = 'deployment-2';
    const captures = freshCaptures(f);
    if (change === 'pixels') for (const e of captures) e.artifact = f.write(`evidence/${e.id}.png`, 'changed pixels');
    if (change === 'source') f.manifest.surfaces[0].target.bindings[0] = f.write('app.ts', 'changed composition');
    if (change === 'theme') for (const e of captures) e.capture!.theme = 'wrong-theme';
    if (change === 'route') for (const e of captures) e.capture!.route = '/wrong';
    if (change === 'missing') f.manifest.evidenceRefs = f.manifest.evidenceRefs.filter(e => !e.id.startsWith('fresh-'));
    if (change === 'future') for (const e of captures) e.observedAt = '2999-01-01T00:00:00Z';
    if (change === 'failed') for (const e of captures) e.result = 'fail';
    if (change === 'check') for (const e of captures) e.checkId = 'unknown';
    if (change === 'candidate') for (const e of captures) e.releaseCandidate = 'wrong';
    if (change === 'composition') for (const e of captures) e.productionComposition = false;
    expect(f.validate(change === 'candidate' || change === 'composition' ? 'release' : 'advance').completion.designAcceptedOutcomeIds).toEqual([]);
  });
});

describe('review dispatch avoids repetition without waiving findings', () => {
  it('blocks review dispatch until there is a complete evidence packet', () => {
    const f = fixture('web'); f.reviewScope();
    expect(planDeliveryReview(f.scope(), 'design-review', ['O1'], options(f)).action).toBe('blocked');
    expect(planDeliveryReview(f.scope(), 'acceptance', ['O1'], options(f)).action).toBe('blocked');
    f.evidence();
    expect(planDeliveryReview(f.scope(), 'design-review', ['O1'], options(f)).action).toBe('review');
  });
  it.each(['future','check','target','scope'])('blocks design dispatch on invalid comparison metadata or scope: %s', change => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    const report = f.manifest.evidenceRefs.find(e => e.kind === 'design-review')!;
    if (change === 'future') report.observedAt = '2999-01-01T00:00:00Z';
    if (change === 'check') report.checkId = 'unknown';
    if (change === 'target') report.targetId = 'unknown';
    if (change === 'scope') f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'scope-review');
    expect(planDeliveryReview(f.scope(), 'design-review', ['O1'], options(f)).action).toBe('blocked');
  });
  it('reuses current trusted approvals, but never untrusted receipts', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    expect(planDeliveryReview(f.scope(), 'acceptance', ['O1'], options(f)).action).toBe('reuse');
    expect(planDeliveryReview(f.scope(), 'acceptance', ['O1']).action).toBe('blocked');
  });
  it('blocks another review of unchanged rejected inputs, even with a competing approval', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept();
    const binding = deliveryDesignReviewBinding(f.scope(), ['O1']);
    f.trust({ id: 'reject', kind: 'design-review', ...binding, reviewer: { id: 'owner', contextId: 'owner-chat', role: 'owner' }, provenance: { kind: 'owner-message', reference: 'trusted://reject' }, result: 'rejected', reason: 'The screen is generic and fails the original experiential brief.' }, binding);
    expect(planDeliveryReview(f.scope(), 'design-review', ['O1'], options(f)).action).toBe('blocked');
    expect(f.validate('advance').valid).toBe(false);
  });
  it('keeps a trusted acceptance rejection blocking despite another approval', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    const binding = planDeliveryReview(f.scope(), 'acceptance', ['O1'], options(f)).binding;
    f.trust({ id: 'reject-completeness', kind: 'acceptance', ...binding, reviewer: { id: 'reviewer', contextId: 'another-review', role: 'independent' }, provenance: { kind: 'review-session', reference: 'trusted://reject-completeness' }, result: 'rejected', reason: 'The cross-role handoff does not meet the original requirement.' }, binding);
    expect(f.validate('advance').completion.proofAccepted).toBe(false);
  });
  it('requests only the missing owner role and never treats independent approval as owner acceptance', () => {
    const f = fixture(); f.manifest.authorization.checkpoints = 'every-slice'; f.reviewScope(); f.evidence(); f.accept();
    const result = planDeliveryReview(f.scope(), 'acceptance', ['O1'], options(f));
    expect(result.action).toBe('review'); expect(result.missingRoles).toEqual(['owner']);
  });
  it('requires a distinct current original-brief/cross-journey review for release', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'release-review');
    expect(f.validate('advance').valid).toBe(true);
    expect(f.validate('release').issues.join(' ')).toContain('original-brief completeness');
  });
  it('rejects relabelling original signed observations as a new deployment', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    f.manifest.surfaces[0].target.revision = 'new-deployment';
    const binding = deliveryEvidenceBinding(f.scope(), 'O1');
    for (const e of f.manifest.evidenceRefs) Object.assign(e, binding);
    expect(f.validate('advance').valid).toBe(false);
    expect(planDeliveryReview(f.scope(), 'acceptance', ['O1'], options(f)).action).not.toBe('reuse');
  });
  it('rejects copied old timestamps as fresh execution on a new deployment', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept(); f.manifest.surfaces[0].target.revision = 'new-deployment';
    const binding = deliveryEvidenceBinding(f.scope(), 'O1');
    f.manifest.evidenceRefs.push(...f.manifest.evidenceRefs.map(e => ({ ...e, ...binding, id: `copy-${e.id}` })));
    expect(f.validate('advance').issues.join(' ')).toContain('newer than retained historical evidence');
  });
  it('does not carry functional execution across a changed deployment revision', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    const old = deliveryEvidenceBinding(f.scope(), 'O1');
    f.manifest.surfaces[0].target.revision = 'new-deployment';
    expect(deliveryEvidenceBinding(f.scope(), 'O1').targetContextDigest).not.toBe(old.targetContextDigest);
    f.accept(); expect(f.validate('release').valid).toBe(false);
  });
  it('does not reopen acceptance when only stale historical evidence is added', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    f.manifest.evidenceRefs.push({ ...f.manifest.evidenceRefs[0], id: 'history', targetDigest: '0'.repeat(64), snapshotDigest: '0'.repeat(64) });
    expect(planDeliveryReview(f.scope(), 'acceptance', ['O1'], options(f)).action).toBe('reuse');
    expect(f.validate('advance').valid).toBe(true);
  });
  it('does not enable prelaunch resets from an unsigned, stale or rejected lifecycle assertion', () => {
    const f = fixture(); f.requirements.lifecycle = { stage: 'pre-launch', dataPolicy: 'disposable', sourceRef: 'brief.md', sourceLocation: 'Owner authorizes disposable preview resets', resetTargetIds: ['target-1'] }; changeSources(f);
    expect(getDeliveryChangePolicy(f.scope(), 'target-1', options(f)).allowDataReset).toBe(false);
    f.reviewScope(); expect(getDeliveryChangePolicy(f.scope(), 'target-1', options(f)).allowDataReset).toBe(true);
    f.requirements.lifecycle.stage = 'live'; f.requirements.lifecycle.resetTargetIds = []; changeSources(f);
    expect(getDeliveryChangePolicy(f.scope(), 'target-1', options(f)).allowBreakingChanges).toBe(false);
    f.reviewScope(); expect(getDeliveryChangePolicy(f.scope(), 'target-1', options(f)).requireMigrations).toBe(true);
  });
});
