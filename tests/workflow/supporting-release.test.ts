import { afterEach, describe, expect, it } from 'vitest';
import { createFixture } from './fixture.js';
import { evaluateRun } from '../../src/workflow/evaluate.js';
import { scopeFingerprint } from '../../src/workflow/evidence.js';
import { validateGraph } from '../../src/workflow/graph.js';
import { parseRun } from '../../src/workflow/schema.js';

// Fixture host receipts are simulated; the underlying greeting CLI is real.
const fixtures: ReturnType<typeof createFixture>[] = [];
function mixed() {
  const f = createFixture(); fixtures.push(f);
  const base = f.run.targets[0];
  f.run.targets.push({ ...structuredClone(base), id:'disposable', providerMode:'controlled' },
    { ...structuredClone(base), id:'document', kind:'document', providerMode:'controlled' });
  const original = f.run.criteria[0];
  f.run.criteria.push({ ...structuredClone(original), id:'C-RESTORE', targetId:'disposable', evidenceKinds:['consumer'], releaseRole:'supporting' },
    { ...structuredClone(original), id:'C-DOCUMENT', targetId:'document', evidenceKinds:['document'], releaseRole:'supporting' });
  f.run.releases[0].sharedCriterionIds = ['C-RESTORE','C-DOCUMENT'];
  return f;
}
function complete(f: ReturnType<typeof mixed>) {
  f.judge('scope',['R-GREETING']);
  f.observe('C-OK'); f.observe('C-OK','build'); f.observe('C-RECOVER');
  f.observe('C-RESTORE','consumer',{ production:false }); f.observe('C-DOCUMENT','document',{ production:false });
  f.judge('semantic',['C-OK','C-RECOVER','C-RESTORE','C-DOCUMENT']); f.judge('release',['R1']);
}
const codes = (f: ReturnType<typeof mixed>) => evaluateRun(f.run,f.context).releases.R1.checks.map(c => c.code);
afterEach(() => fixtures.splice(0).forEach(f => f.cleanup()));

describe('supporting release criteria', () => {
  it('accepts a delivered CLI with controlled disposable and documentary supporting observations', () => {
    const f = mixed(); complete(f);
    expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('pass');
    expect(codes(f)).not.toContain('REAL_RELEASE_TARGET_REQUIRED');
    expect(codes(f)).not.toContain('RELEASE_COMPOSITION_REQUIRED');
  });
  it('rejects a release without a directly selected delivered outcome criterion', () => {
    const f = mixed(); f.run.criteria.slice(0,2).forEach(c => c.releaseRole = 'supporting');
    expect(validateGraph(f.run).map(d => d.code)).toContain('RELEASE_DELIVERED_OUTCOME_REQUIRED');
    expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('fail');
  });
  it('blocks missing, stale and failing supporting evidence', () => {
    const missing = mixed(); complete(missing); missing.run.evidence = missing.run.evidence.filter(e => e.criterionId !== 'C-RESTORE');
    expect(codes(missing)).toContain('EVIDENCE_MISSING');
    const stale = mixed(); complete(stale); stale.run.targets.find(t => t.id === 'disposable')!.revision = 'changed';
    expect(codes(stale)).toContain('EVIDENCE_MISSING');
    const failing = mixed(); complete(failing); const evidence = failing.run.evidence.find(e => e.criterionId === 'C-RESTORE')!;
    evidence.result = 'fail'; failing.authenticateEvidence(evidence);
    expect(codes(failing)).toContain('OBSERVED_FAILURE');
  });
  it('retains lifecycle and host verification for supporting criteria', () => {
    const f = mixed(); complete(f);
    expect(evaluateRun(f.run,{ projectRoot:f.root }).releases.R1.status).not.toBe('pass');
    f.run.targets.find(t => t.id === 'disposable')!.lifecycle.dataPolicy = 'unknown';
    expect(codes(f)).toContain('RELEASE_LIFECYCLE_REQUIRED');
  });
  it('still enforces explicit production proof for supporting criteria', () => {
    const f = mixed(); f.run.criteria.find(c => c.id === 'C-RESTORE')!.productionRequired = true; complete(f);
    expect(codes(f)).toContain('PRODUCTION_PROOF_MISSING');
    expect(evaluateRun(f.run,f.context).releases.R1.status).toBe('fail');
  });
  it('binds role classification to scope review and rejects invalid roles', () => {
    const f = mixed(); complete(f); const before = scopeFingerprint(f.run);
    f.run.criteria.find(c => c.id === 'C-RESTORE')!.releaseRole = 'delivered';
    expect(scopeFingerprint(f.run)).not.toBe(before);
    expect(evaluateRun(f.run,f.context).planReviewed.status).toBe('pending');
    (f.run.criteria[0] as { releaseRole?: string }).releaseRole = 'waived';
    expect(() => parseRun(f.run)).toThrow();
  });
});
