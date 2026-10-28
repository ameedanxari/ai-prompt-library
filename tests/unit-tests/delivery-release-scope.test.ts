import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawnSync } from 'node:child_process';
import { canonical, deliveryReleaseReviewBinding, deliveryReleaseSelection, deliveryScopeDigest, planDeliveryReview, validateDelivery } from '../../src/delivery/index.js';
import { validateDeliveryRun } from '../../src/execution/delivery-gate.js';
import { createDeliveryFixture, deliveryFixtureRoots } from './delivery-fixture.js';
import { planningFixture } from './planning-integrity-fixture.js';
import { architectureContract } from './architecture-fixture.js';

const extraRoots: string[] = [];
afterEach(() => [...deliveryFixtureRoots.splice(0), ...extraRoots.splice(0)].forEach(root => fs.rmSync(root, { recursive: true, force: true })));

function task(id: string, requirements: string[]) {
  return [`## T1 - ${id}`, '- **Closes user story:** As a consumer, I want a useful result, so that I can recover from failure.',
    '- **Change type:** modify-existing', '- **File:** `app.ts`', '- **Precise change:** implement the real consumer result and reachable recovery.',
    '- **Acceptance:**', '  - Valid calls return the source-required result.', '  - Invalid calls preserve previously persisted state.', '  - Failed calls offer a reachable recovery action.',
    '- **Depends on:** none', '- **Test:** `npm run build`', '- **Estimated LOC:** ~20', '- **Phase:** mvp', '- **Task schema:** v2',
    '- **Artifact kind:** runtime-source', `- **Requirement IDs:** ${requirements.join(', ')}`, '- **Evidence level:** integration',
    '- **Runtime reachability:** production consumer entry', '- **Production owner:** app.ts', '- **Composition map:** production',
    '- **Risk:** medium', '- **Model tier:** standard', '- **Turn budget:** 20', ''].join('\n');
}

/** Synthetic authenticated receipt store; no product execution is asserted. */
function fixture() {
  const f = createDeliveryFixture(); const p = planningFixture(); extraRoots.push(p.root);
  const contract = structuredClone(p.contract); const register = structuredClone(p.register);
  f.manifest.schemaVersion = 2;
  f.requirements.requirements[0].releaseScopeId = 'R1';
  f.requirements.requirements.push({ ...structuredClone(f.requirements.requirements[0]), id: 'R2', releaseScopeId: 'R2', description: 'Additional consumer result and recovery' },
    { ...structuredClone(f.requirements.requirements[0]), id: 'RG', releaseScopeId: '*', nonWaivable: true, description: 'Shared release health and recovery duty' });
  f.manifest.outcomes[0].releaseScopeId = 'R1';
  f.manifest.outcomes.push({ ...structuredClone(f.manifest.outcomes[0]), id: 'O2', releaseScopeId: 'R2', requirementIds: ['R2'] },
    { ...structuredClone(f.manifest.outcomes[0]), id: 'OG', releaseScopeId: '*', requirementIds: ['RG'] });
  const proof = f.manifest.slices[0]; proof.outcomeIds.push('OG'); proof.units[0].outcomeIds.push('OG'); proof.units[0].planningNodeIds = ['queue', 'shared'];
  f.write('runs/current/tasks-proof.md', task('Base and shared duties', ['R1', 'RG']));
  contract.sources[0].binding = f.requirements.originalSources[0]; register.reviewedInputs = [f.requirements.originalSources[0]];
  for (const id of ['R2', 'RG']) contract.clauses.push({ ...contract.clauses[0], id: 'C-' + id, requirementIds: [id] });
  contract.nodes.push(p.node('delta', { stage: 1, origin: 'added', originRef: 'C-R2', releaseScope: 'R2' }), p.node('shared', { stage: 1, originRef: 'C-RG', releaseScope: 'R1' }));
  contract.releaseScopes = [{ id: 'R1', kind: 'base-contract', sourceRef: 'C1' }, { id: 'R2', kind: 'change-order', sourceRef: 'C-R2', status: 'proposed' }];
  contract.capacity.nodeIds.push('delta', 'shared'); contract.capacity.hours = 32;
  contract.runners = [];
  const build = (id: string, nodeId: string, unitId?: string) => ({ id, nodeId, ...(unitId ? { unitId } : {}), kind: 'build', command: 'npm run build', targets: [], requiredFiles: ['app.ts'], collection: 'substantive', environment: 'real-local', bootstrapPaths: [] });
  contract.checks = [build('base-build', 'queue', 'tasks-proof.md#T1'), build('shared-build', 'shared', 'tasks-proof.md#T1'), build('delta-build', 'delta')];
  contract.milestones[0].evidenceIds = ['base-build', 'shared-build']; contract.variants[0].obligations[0].evidenceIds = ['base-build'];
  contract.variants[0].decision = f.write('owner.md', 'Owner selects the verified manual operator path.');
  register.ownerDecisions.push({ id: 'D-DELTA', source: contract.variants[0].decision, status: 'open', targets: ['delta'], blocks: ['execute', 'release'] });
  const receipt = (index: number) => {
    contract.checks[index].receipt = { artifact: f.write(`build-${index}.log`, 'Production build fixture completed.'), inputs: [f.write('app.ts', fs.readFileSync(path.join(f.root, 'app.ts')))], exitCode: 0, collected: 0, environment: 'real-local' };
  };
  receipt(0); receipt(1);
  let serial = 0;
  const saveInputs = () => {
    f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) };
    f.manifest.planningInputs = [f.write('runs/current/planning-integrity.json', JSON.stringify(contract)), f.write('runs/current/review-findings.json', JSON.stringify(register)), f.write('runs/current/architecture.json', JSON.stringify(architectureContract(f.manifest)))]; f.save();
  };
  const approveScope = () => {
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'scope-review');
    const binding = { scopeDigest: deliveryScopeDigest(f.manifest), outcomeIds: f.manifest.outcomes.map(o => o.id).sort(), artifactDigests: [...new Set([...f.manifest.sourceInputs, ...f.manifest.planningInputs!, ...f.requirements.originalSources].map(b => b.sha256))].sort() };
    const id = `train-scope-${serial++}`;
    f.trust({ id, kind: 'scope-review', ...binding, reviewer: { id: 'reviewer', contextId: 'source-context', role: 'independent' }, provenance: { kind: 'review-session', reference: `trusted://${id}` }, result: 'approved', reason: 'Inspected original sources, complete train membership and retained shared hard duties.' }, binding);
  };
  const releaseReview = (releaseScopeId?: string) => {
    const binding = deliveryReleaseReviewBinding(f.scope(), releaseScopeId); const id = `train-release-${serial++}`;
    f.trust({ id, kind: 'release-review', ...binding, reviewer: { id: 'reviewer', contextId: 'release-context', role: 'independent' }, provenance: { kind: 'review-session', reference: `trusted://${id}` }, result: 'approved', reason: 'Inspected selected train, shared duties, dependency closure and real production evidence.' }, binding);
  };
  const validate = (releaseScopeId?: string) => { f.save(); return validateDeliveryRun(f.run, { stage: 'release', releaseScopeId, trustedReviewProvider: f.provider }); };
  const approveDelta = () => { contract.releaseScopes[1] = { ...contract.releaseScopes[1], status: 'approved', price: { amount: 1000, currency: 'CAD', sourceRef: 'C-R2' }, decision: contract.variants[0].decision }; register.ownerDecisions = []; receipt(2); };
  const addDeltaSlice = () => {
    f.manifest.slices.push({ id: 'delta-slice', kind: 'delivery', outcomeIds: ['O2'], units: [{ id: 'tasks-delta.md#T1', planningNodeIds: ['delta'], outcomeIds: ['O2'], acceptance: 'Additional useful result and recovery', affectedPaths: ['app.ts'], dependsOn: [] }], detailedFiles: ['tasks-delta.md'] });
    f.write('runs/current/tasks-delta.md', task('Additional result', ['R2']));
  };
  saveInputs(); approveScope(); f.evidence('O1'); f.evidence('OG'); f.accept();
  f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'release-review'); f.save();
  return { ...f, contract, register, saveInputs, approveScope, releaseReview, validate, approveDelta, addDeltaSlice, receipt };
}

describe('named runtime release boundaries', () => {
  it('releases proved R1 with shared duties while pending R2 blocks the default union', () => {
    const f = fixture(); const ids = deliveryReleaseSelection(f.scope(), f.requirements.requirements, 'R1').outcomeIds;
    expect(ids).toEqual(['O1', 'OG']);
    const review = planDeliveryReview(f.scope(), 'release-review', ids, { trustedReviewProvider: f.provider, releaseScopeId: 'R1' });
    expect(review.action, review.reason).toBe('review'); f.releaseReview('R1');
    const report = f.validate('R1'); expect(report.issues).toEqual([]); expect(report.releaseScopeId).toBe('R1'); expect(report.completion.releaseReady).toBe(true);
    expect(planDeliveryReview(f.scope(), 'release-review', ids, { trustedReviewProvider: f.provider, releaseScopeId: 'R1' }).action).toBe('reuse');
    const union = f.validate(); expect(union.valid).toBe(false); expect(union.issues.join('\n')).toContain('OWNER_DECISION_OPEN: D-DELTA'); expect(union.issues.join('\n')).toContain('acceptance: outcome O2');
  });

  it('retains successful full-union release and independently releases an approved change order', () => {
    const f = fixture(); f.approveDelta(); f.addDeltaSlice(); f.saveInputs(); f.approveScope(); f.evidence('O2'); f.accept('delta-slice');
    expect(f.validate().issues).toEqual([]);
    f.releaseReview('R2'); expect(f.validate('R2').issues).toEqual([]);
    expect(deliveryReleaseReviewBinding(f.scope(), 'R2').outcomeIds).toEqual(['O1', 'O2', 'OG']);
  });

  it('cannot release or dispatch a complete mapped union while its change order is proposed', () => {
    const f = fixture(); f.approveDelta(); f.addDeltaSlice(); f.saveInputs(); f.approveScope(); f.evidence('O2'); f.accept('delta-slice');
    expect(f.validate().issues).toEqual([]);
    const approved = structuredClone(f.contract.releaseScopes[1]);
    f.contract.releaseScopes[1] = { id: 'R2', kind: 'change-order', sourceRef: 'C-R2', status: 'proposed' };
    f.saveInputs(); f.approveScope(); f.releaseReview();
    expect(f.validate().issues).toEqual([expect.stringContaining('change order R2 must be approved, priced and decision-bound')]);
    expect(planDeliveryReview(f.scope(), 'release-review', ['O1', 'O2', 'OG'], { trustedReviewProvider: f.provider }).action).toBe('blocked');
    f.contract.releaseScopes[1] = approved; f.saveInputs(); f.approveScope(); f.releaseReview();
    expect(f.validate().issues).toEqual([]);
  });

  it('does not demand unrelated R2 runtime evidence or its stale receipt for R1', () => {
    const f = fixture(); const old = f.write('delta.ts', 'old delta implementation');
    f.contract.checks[2].requiredFiles = ['delta.ts'];
    f.contract.checks[2].receipt = { artifact: f.write('old-delta-build.log', 'Old delta result'), inputs: [old], exitCode: 0, collected: 0, environment: 'real-local' };
    f.write('delta.ts', 'changed delta implementation'); f.saveInputs(); f.approveScope(); f.releaseReview('R1');
    expect(f.validate('R1').issues).toEqual([]); expect(f.validate().issues.join('\n')).toContain('EVIDENCE_STALE: delta-build');
  });

  it('retains a later train surface in source scope without demanding its unbuilt runtime for R1', () => {
    const f = fixture();
    f.manifest.surfaces.push({ ...structuredClone(f.manifest.surfaces[0]), id: 'delta-api', target: { ...structuredClone(f.manifest.surfaces[0].target), id: 'delta-target', bindings: [{ path: 'future-delta.ts', sha256: 'a'.repeat(64) }] } });
    f.requirements.requirements[1].surfaceIds = ['delta-api']; f.manifest.outcomes[1].surfaceId = 'delta-api';
    f.saveInputs(); f.approveScope(); f.releaseReview('R1'); expect(f.validate('R1').issues).toEqual([]);
    expect(f.manifest.outcomes.find(o => o.id === 'O2')!.releaseRequired).toBe(true);
    expect(f.validate().valid).toBe(false);
  });

  it.each(['missing-requirement', 'missing-outcome', 'unknown-train', 'wrong-outcome', 'mixed-slice'])('fails closed for incomplete or ambiguous %s membership', mutation => {
    const f = fixture(); expect(deliveryReleaseSelection(f.scope(), f.requirements.requirements, 'R1').outcomeIds).toEqual(['O1', 'OG']);
    if (mutation === 'missing-requirement') delete f.requirements.requirements[1].releaseScopeId;
    if (mutation === 'missing-outcome') delete f.manifest.outcomes[1].releaseScopeId;
    if (mutation === 'unknown-train') f.requirements.requirements[1].releaseScopeId = 'typo';
    if (mutation === 'wrong-outcome') f.manifest.outcomes[1].releaseScopeId = 'R1';
    if (mutation === 'mixed-slice') f.manifest.slices[0].outcomeIds.push('O2');
    f.saveInputs(); f.approveScope(); expect(f.validate('R1').issues.join('\n')).toContain('RELEASE_SCOPE_INVALID:'); expect(f.validate().valid).toBe(false);
  });

  it('requires a declared exact mapping and rejects unknown train or wrong-stage selection', () => {
    const f = fixture(); expect(f.validate('unknown').issues.join('\n')).toContain('unknown named train unknown');
    expect(validateDelivery(f.run, { stage: 'plan', releaseScopeId: 'R1' }).issues).toEqual(['RELEASE_SCOPE_INVALID: a named release scope is only valid at stage release']);
    expect(() => planDeliveryReview(f.scope(), 'scope-review', ['O1', 'O2', 'OG'], { releaseScopeId: 'R1' })).toThrow('restricted to release review');
    for (const row of [...f.requirements.requirements, ...f.manifest.outcomes]) delete row.releaseScopeId;
    f.saveInputs(); f.approveScope(); expect(f.validate('R1').issues.join('\n')).toContain('missing or unknown membership');
  });

  it('keeps shared duties independent of change-order slice acceptance', () => {
    const f = fixture(); f.releaseReview('R1'); expect(f.validate('R1').valid).toBe(true);
    f.addDeltaSlice(); f.manifest.slices[1].outcomeIds.push('OG'); f.saveInputs(); f.approveScope();
    expect(f.validate('R1').issues.join('\n')).toContain('ties shared duties to a change order');
  });

  it('blocks selected source conflicts and their prerequisite targets while retaining unrelated conflicts', () => {
    const f = fixture();
    f.contract.facts = [{ id: 'A', clauseId: 'C1', key: 'contract', value: 'included' }, { id: 'B', clauseId: 'C1', key: 'contract', value: 'excluded' }];
    f.contract.conflicts = [{ id: 'contract-conflict', factIds: ['A', 'B'], status: 'open', targets: ['delta'] }];
    f.saveInputs(); f.approveScope(); f.releaseReview('R1'); expect(f.validate('R1').issues).toEqual([]);
    f.contract.conflicts[0].targets = ['environment']; f.saveInputs(); f.approveScope(); f.releaseReview('R1');
    expect(f.validate('R1').issues.join('\n')).toContain('SOURCE_CONFLICT_OPEN: contract-conflict');
  });

  it('requires trusted current full-union source approval for a named release', () => {
    const f = fixture(); f.releaseReview('R1'); expect(f.validate('R1').valid).toBe(true);
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'scope-review');
    expect(f.validate('R1').issues.join('\n')).toContain('scope: original-source coverage review pending');
    f.approveScope(); f.releaseReview('R1'); expect(f.validate('R1').valid).toBe(true);
    f.manifest.outcomes[1].applicabilityReason = 'Changed original-scope interpretation of the later train'; f.save();
    expect(f.validate('R1').issues.join('\n')).toContain('scope: original-source coverage review pending');
  });

  it('retains shared hard duties and current production evidence', () => {
    const f = fixture(); f.releaseReview('R1'); expect(f.validate('R1').valid).toBe(true);
    f.manifest.evidenceRefs = f.manifest.evidenceRefs.filter(e => e.outcomeId !== 'OG'); f.save();
    const failed = f.validate('R1'); expect(failed.valid).toBe(false); expect(failed.issues.join('\n')).toContain('acceptance: outcome OG');
    expect(planDeliveryReview(f.scope(), 'release-review', ['O1', 'OG'], { trustedReviewProvider: f.provider, releaseScopeId: 'R1' }).action).toBe('blocked');
    f.evidence('OG'); f.accept(); f.releaseReview('R1'); expect(f.validate('R1').valid).toBe(true);
    for (const e of f.manifest.evidenceRefs.filter(e => e.outcomeId === 'O1')) e.productionComposition = false;
    expect(f.validate('R1').issues.join('\n')).toContain('real production composition');
  });

  it('requires accepted recursive cross-train dependencies even when the edge says technical', () => {
    const f = fixture(); f.approveDelta(); f.addDeltaSlice();
    f.manifest.outcomes[0].dependencies = [{ outcomeId: 'O2', kind: 'technical' }];
    f.saveInputs(); f.approveScope(); f.evidence('O2'); f.evidence('O1'); f.accept('proof');
    expect(deliveryReleaseSelection(f.scope(), f.requirements.requirements, 'R1').outcomeIds).toEqual(['O1', 'O2', 'OG']);
    expect(f.validate('R1').issues.join('\n')).toContain('acceptance: outcome O2 review pending');
    expect(() => planDeliveryReview(f.scope(), 'release-review', ['O1', 'OG'], { releaseScopeId: 'R1' })).toThrow('dependency closure');
    f.accept('delta-slice'); f.releaseReview('R1'); expect(f.validate('R1').issues).toEqual([]);
    f.manifest.surfaces[0].target.providerMode = 'controlled'; expect(f.validate('R1').valid).toBe(false);
  });

  it('scopes owner blockers and refuses unapproved change-order release', () => {
    const f = fixture(); f.releaseReview('R1'); expect(f.validate('R1').valid).toBe(true);
    expect(f.validate('R2').issues.join('\n')).toContain('must be approved, priced and decision-bound');
    f.register.ownerDecisions[0].targets = ['queue']; f.saveInputs(); f.approveScope(); f.releaseReview('R1');
    expect(f.validate('R1').issues.join('\n')).toContain('OWNER_DECISION_OPEN: D-DELTA');
  });

  it('does not reuse a union review or a different named train approval', () => {
    const f = fixture(); f.releaseReview(); expect(f.validate('R1').issues.join('\n')).toContain('release: independent original-brief completeness');
    f.releaseReview('R1'); expect(f.validate('R1').valid).toBe(true);
    const d = f.manifest.decisionRefs.find(d => d.kind === 'release-review' && d.releaseScopeId === 'R1')!;
    const union = deliveryReleaseReviewBinding(f.scope()); const named = deliveryReleaseReviewBinding(f.scope(), 'R1');
    expect(union.scopeDigest).not.toBe(named.scopeDigest); d.releaseScopeId = 'R2';
    expect(f.validate('R1').valid).toBe(false);
  });

  it('accepts R1 through the actual CLI with a host adapter and rejects unknown selection', () => {
    const f = fixture(); f.releaseReview('R1'); expect(f.validate('R1').issues).toEqual([]);
    const adapterRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'release-host-')); extraRoots.push(adapterRoot); const adapter = path.join(adapterRoot, 'verifier.mjs');
    const records = f.manifest.decisionRefs.map(d => canonical(d));
    fs.writeFileSync(adapter, `const records=${JSON.stringify(records)}; function canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);} export const trustedReviewProvider={verify:d=>records.includes(canonical(d))};`);
    const script = path.resolve('scripts/validate-delivery.sh');
    const run = (scope: string) => spawnSync('bash', [script, f.run, '--stage', 'release', '--release-scope', scope, '--review-verifier', adapter], { encoding: 'utf8' });
    const good = run('R1'); expect(good.status, good.stdout + good.stderr).toBe(0); expect(JSON.parse(good.stdout).releaseScopeId).toBe('R1');
    const bad = run('typo'); expect(bad.status).toBe(1); expect(bad.stdout).toContain('unknown named train typo');
  }, 30000);
});
