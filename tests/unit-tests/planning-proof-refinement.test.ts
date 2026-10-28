import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { deliveryScopeDigest, parseDeliveryManifest, planDeliveryReview } from '../../src/delivery/index.js';
import { validateDeliveryRun } from '../../src/execution/delivery-gate.js';
import type { DeliverySurface } from '../../src/delivery/types.js';
import { createDeliveryFixture, deliveryFixtureRoots } from './delivery-fixture.js';
import { planningFixture } from './planning-integrity-fixture.js';
import { architectureContract } from './architecture-fixture.js';

const extraRoots: string[] = [];
afterEach(() => [...deliveryFixtureRoots.splice(0), ...extraRoots.splice(0)].forEach(root => fs.rmSync(root, { recursive: true, force: true })));
function fixture(kind: DeliverySurface['kind'] = 'api') {
  const f = createDeliveryFixture(kind); const p = planningFixture(); extraRoots.push(p.root);
  f.manifest.schemaVersion = 2;
  const proof = f.manifest.slices[0]; proof.outcomeIds.push('O2'); proof.deferredOutcomeIds = ['O2'];
  proof.units[0].planningNodeIds = ['health'];
  f.requirements.requirements.push({ ...f.requirements.requirements[0], id: 'R2', description: 'A user completes the manual MLP request and reaches recovery.' });
  f.manifest.outcomes.push({ ...f.manifest.outcomes[0], id: 'O2', requirementIds: ['R2'], entryPoint: '/queue', dependencies: [] });
  for (const design of f.requirements.designs ?? []) for (const criterion of design.criteria) criterion.applicability.outcomeIds.push('O2');
  const contract = { schemaVersion: 1, sources: f.requirements.originalSources.map((binding, i) => ({ id: `S${i + 1}`, binding, status: 'inspected', authority: 'original source' })),
    clauses: [{ id: 'C1', sourceId: 'S1', locator: 'line 1', requirementIds: ['R1','R2'], disposition: 'required' }], facts: [], conflicts: [],
    nodes: [p.node('health', { provides: ['health'], consumes: [] }), p.node('queue', { stage: 1, provides: ['manual-queue'], consumes: [], dependsOn: [] })],
    milestones: [], runners: [], checks: [], variants: [], capacity: { hours: 20, reserveHours: 4, nodeIds: ['health','queue'], disposition: 'committed' },
  };
  const register = { schemaVersion: 1, reviewedInputs: f.requirements.originalSources, findings: [] as any[], ownerDecisions: [] };
  function task(unit = proof.units[0]) {
    const requirementIds = f.manifest.outcomes.filter(o => unit.outcomeIds.includes(o.id)).flatMap(o => o.requirementIds);
    return [
      `## ${unit.id.split('#')[1]} - ${unit.acceptance}`,
      '- **Closes user story:** As a consumer, I want this useful change, so that I can use the application safely.',
      '- **Change type:** create-new', '- **File:** ' + unit.affectedPaths.map(file => '`' + file + '`').join(' | '),
      '- **Precise change:** ' + unit.acceptance, '- **Acceptance:**',
      '  - The consumer reaches the declared result.', '  - Invalid input preserves existing state.', '  - Failure exposes a useful recovery action.',
      '- **Depends on:** none', '- **Test:** `npm run test:health`', '- **Estimated LOC:** ~20', '- **Phase:** mvp',
      '- **Artifact kind:** runtime-source', '- **Requirement IDs:** ' + requirementIds.join(', '), '- **Evidence level:** unit',
      '- **Runtime reachability:** production entry point', '- **Production owner:** app.ts', '- **Composition map:** production',
      '- **Risk:** medium', '- **Model tier:** standard', '- **Turn budget:** 20', '',
    ].join('\n');
  }
  const saveTasks = () => f.write('runs/current/tasks-proof.md', proof.units.map(unit => task(unit)).join('\n'));
  const savePlanning = () => {
    f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) };
    f.manifest.planningInputs = [f.write('runs/current/planning-integrity.json', JSON.stringify(contract)), f.write('runs/current/review-findings.json', JSON.stringify(register)), f.write('runs/current/architecture.json', JSON.stringify(architectureContract(f.manifest)))]; f.save();
  };
  const approve = () => {
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'scope-review');
    const binding = { scopeDigest: deliveryScopeDigest(f.manifest), outcomeIds: f.manifest.outcomes.map(o => o.id).sort(), artifactDigests: [...new Set([...f.manifest.sourceInputs, ...f.manifest.planningInputs!, ...f.requirements.originalSources].map(b => b.sha256))].sort() };
    f.trust({ id: 'source-review', kind: 'scope-review', ...binding, reviewer: { id: 'reviewer', contextId: 'review-context', role: 'independent' }, provenance: { kind: 'review-session', reference: 'trusted://bounded-proof-scope' }, result: 'approved', reason: 'Reviewed full original obligations and retained deferred proof outcomes.' }, binding);
  };
  const addUnit = (outcomeIds: string[], node = 'health') => {
    const number = proof.units.length + 1;
    proof.units.push({ id: `tasks-proof.md#T${number}`, planningNodeIds: [node], outcomeIds, acceptance: 'Implement the declared bounded consumer behavior and recovery', affectedPaths: [`src/part-${number}.ts`], dependsOn: [] }); saveTasks();
  };
  saveTasks(); savePlanning(); approve();
  return { ...f, proof, contract, register, savePlanning, saveTasks, approve, addUnit };
}

function scopedVisualFixture() {
  const f = fixture('web');
  const sourceDesign = structuredClone(f.requirements.designs![0]);
  f.requirements.designs![0].criteria.forEach(criterion => { criterion.applicability.outcomeIds = ['O1']; });
  const app = { ...structuredClone(f.manifest.surfaces[0]), id: 'app', entryPoint: '/queue' }; app.target.id = 'app-target';
  f.manifest.surfaces.push(app); f.manifest.outcomes[1].surfaceId = 'app'; f.requirements.requirements[1].surfaceIds = ['app'];
  const appDesign = { ...structuredClone(sourceDesign), surfaceId: 'app' }; appDesign.criteria.forEach(criterion => { criterion.applicability.outcomeIds = ['O2']; });
  f.requirements.designs!.push(appDesign);
  const admin = { ...structuredClone(app), id: 'admin', entryPoint: '/admin' }; admin.target.id = 'admin-target'; f.manifest.surfaces.push(admin);
  f.manifest.outcomes.push({ ...structuredClone(f.manifest.outcomes[1]), id: 'O3', requirementIds: ['R3'], surfaceId: 'admin', entryPoint: '/admin' });
  f.requirements.requirements.push({ ...structuredClone(f.requirements.requirements[1]), id: 'R3', surfaceIds: ['admin'] });
  const adminDesign = { ...structuredClone(sourceDesign), surfaceId: 'admin' }; adminDesign.criteria.forEach(criterion => { criterion.applicability.outcomeIds = ['O3']; });
  f.requirements.designs!.push(adminDesign); f.proof.outcomeIds.push('O3'); f.proof.deferredOutcomeIds!.push('O3'); f.contract.clauses[0].requirementIds.push('R3');
  const ops: DeliverySurface = { ...structuredClone(app), id: 'ops', kind: 'infrastructure', entryPoint: 'operator check' }; ops.target.id = 'ops-target'; f.manifest.surfaces.push(ops);
  const addIndependent = () => {
    const number = f.manifest.outcomes.length + 1; const id = `O${number}`; const requirementId = `R${number}`;
    f.manifest.outcomes.push({ ...structuredClone(f.manifest.outcomes[0]), id, requirementIds: [requirementId], surfaceId: 'ops', entryPoint: 'operator check' });
    f.requirements.requirements.push({ ...structuredClone(f.requirements.requirements[0]), id: requirementId, surfaceIds: ['ops'] });
    f.proof.outcomeIds.push(id); f.contract.clauses[0].requirementIds.push(requirementId); f.addUnit([id]);
  };
  addIndependent(); f.savePlanning(); f.approve();
  const approvePublic = () => { f.evidence('O1'); f.acceptDesign(['O1']); };
  const detailApp = () => { f.proof.deferredOutcomeIds = f.proof.deferredOutcomeIds!.filter(id => id !== 'O2'); f.addUnit(['O2']); };
  const extension = (maxUnits: number) => {
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.id !== 'larger-proof'); f.manifest.planningBudget.extensionDecisionId = 'larger-proof';
    const binding = { scopeDigest: deliveryScopeDigest(f.manifest), outcomeIds: f.manifest.outcomes.map(o => o.id).sort(), artifactDigests: [...new Set([...f.manifest.sourceInputs, ...f.manifest.planningInputs!, ...f.requirements.originalSources].map(b => b.sha256))].sort() };
    f.trust({ id: 'larger-proof', kind: 'budget-extension', ...binding, reviewer: { id: 'reviewer', contextId: 'independent-extension', role: 'independent' }, provenance: { kind: 'review-session', reference: `trusted://larger-proof/${maxUnits}` }, result: 'approved', reason: 'This cohesive proof needs bounded independent operational units before all deferred journeys can be accepted.', budget: { maxUnits, maxWords: 4000, maxBytes: 32000, maxSlices: 1 } }, binding);
  };
  return { ...f, addIndependent, approvePublic, detailApp, extension };
}

describe('bounded first proof refinement', () => {
  it('retains the real MLP proof target while allowing only its honest detailed units to execute', () => {
    const f = fixture();
    expect(f.validate('plan').issues).toEqual([]);
    expect(validateDeliveryRun(f.run, { stage: 'execute', trustedReviewProvider: f.provider }).issues).toEqual([]);
    expect(f.proof.outcomeIds).toEqual(['O1','O2']); expect(f.proof.deferredOutcomeIds).toEqual(['O2']);
    expect(f.manifest.slices).toHaveLength(1);
    expect(f.validate('execute').completion).toMatchObject({ planReady: true, proofAccepted: false, sliceAccepted: false, releaseReady: false });
  });

  it.each(['advance','release'] as const)('blocks %s until refinement even with complete evidence and authenticated acceptance metadata', stage => {
    const f = fixture(); expect(f.validate('plan').issues).toEqual([]);
    f.evidence('O1'); f.evidence('O2'); f.accept();
    const report = f.validate(stage);
    expect(report.completion.technicallyVerifiedOutcomeIds).toEqual(['O1','O2']);
    expect(report.completion.proofAccepted).toBe(false); expect(report.completion.sliceAccepted).toBe(false); expect(report.completion.releaseReady).toBe(false);
    expect(report.issues).toContain(`PROOF_REFINEMENT_PENDING: proof: refine deferred outcomes before ${stage}: O2`);
    expect(planDeliveryReview(f.scope(), 'acceptance', ['O1','O2'], { trustedReviewProvider: f.provider }).action).toBe('blocked');
    // Refinement supplies real executable ownership; the same useful journey,
    // rather than a separately invented prototype proof, can now be accepted.
    f.proof.deferredOutcomeIds = []; f.addUnit(['O2'], 'queue'); f.save(); f.evidence('O1'); f.evidence('O2'); f.accept();
    expect(f.validate(stage).issues).toEqual([]); expect(f.validate(stage).completion.proofAccepted).toBe(true);
  });

  it.each(['v1','delivery','other-proof','duplicate','outside','excluded','implemented'] as const)('rejects invalid deferral form: %s', mutation => {
    const f = fixture(); expect(f.validate('plan').issues).toEqual([]);
    const manifest = structuredClone(f.manifest); const proof = manifest.slices[0];
    if (mutation === 'v1') manifest.schemaVersion = 1;
    if (mutation === 'delivery') proof.kind = 'delivery';
    if (mutation === 'other-proof') manifest.firstProofSlice = 'other-proof';
    if (mutation === 'duplicate') proof.deferredOutcomeIds = ['O2','O2'];
    if (mutation === 'outside') proof.deferredOutcomeIds = ['O-unregistered'];
    if (mutation === 'excluded') manifest.outcomes[1].applicability = 'excluded';
    if (mutation === 'implemented') proof.units[0].outcomeIds.push('O2');
    expect(() => parseDeliveryManifest(manifest)).toThrow(mutation === 'duplicate' ? /unique outcome/ : mutation === 'outside' || mutation === 'excluded' ? /applicable outcomes within/ : mutation === 'implemented' ? /must not have implementation units/ : /restricted to the version 2 first proof/);
  });

  it('does not let a future UI finding or future prerequisite block independent detailed foundation work', () => {
    const f = fixture(); expect(f.validate('plan').issues).toEqual([]);
    const future = { ...f.manifest.outcomes[1], id: 'O3', entryPoint: '/later', requirementIds: ['R3'] };
    f.manifest.outcomes.push(future);
    f.requirements.requirements.push({ ...f.requirements.requirements[1], id: 'R3' }); f.contract.clauses[0].requirementIds.push('R3');
    f.manifest.outcomes[1].dependencies = [{ outcomeId: 'O3', kind: 'accepted' }];
    const source = f.write('future-ui-review.md', 'The future queue screen requires owner review before construction.');
    f.register.findings.push({ id: 'UI-P1', source, severity: 'P1', status: 'open', targets: ['O2'], blocks: ['execute'] }, { id: 'QUEUE-P1', source, severity: 'P1', status: 'open', targets: ['queue'], blocks: ['execute'] });
    f.savePlanning(); f.approve();
    expect(f.validate('plan').issues).toEqual([]);
    const executed = validateDeliveryRun(f.run, { stage: 'execute', trustedReviewProvider: f.provider });
    expect(executed.issues).toEqual([]); expect(executed.planningIntegrity?.blockers.map(b => b.target)).toEqual(['UI-P1','QUEUE-P1']);
    f.register.findings[0].blocks = ['plan']; f.savePlanning(); f.approve();
    expect(f.validate('plan').issues.join(' ')).toContain('REVIEW_FINDING_OPEN: UI-P1');
    expect(f.validate('execute').issues).toEqual([]);
    // Making detailed work depend on the deferred result must restore the block.
    f.register.findings[0].blocks = ['execute']; f.savePlanning();
    f.manifest.outcomes[0].dependencies.push({ outcomeId: 'O2', kind: 'technical' }); f.approve();
    expect(f.validate('execute').issues).toContain('dependency: O1 requires technical prerequisite O2');
    expect(f.validate('execute').issues.join(' ')).toContain('REVIEW_FINDING_OPEN: UI-P1');
  });

  it('preserves the two-unit cap before visual acceptance while retaining future journey outcomes', () => {
    const f = fixture('web'); expect(f.validate('plan').issues).toEqual([]);
    f.addUnit(['O1']); f.save(); expect(f.validate('plan').issues).toEqual([]);
    f.addUnit(['O1']); f.save();
    const report = f.validate('plan'); expect(report.metrics.pendingUnits).toBe(3);
    expect(report.issues).toContain('budget: 3 pending units exceeds 2');
    expect(report.issues).toContain('design: validate the rendered design against its sources before expanding detailed planning');
  });

  it('unlocks independent work after public design approval while app/admin remain deferred and unaccepted', () => {
    const f = scopedVisualFixture(); expect(f.validate('plan').issues).toEqual([]);
    f.addIndependent(); f.savePlanning(); f.approve();
    expect(f.validate('plan').issues).toContain('budget: 3 pending units exceeds 2');
    f.approvePublic(); const plan = f.validate('plan'); expect(plan.issues).toEqual([]);
    expect(plan.completion.designAcceptedOutcomeIds).toEqual(['O1']); expect(plan.metrics.pendingUnits).toBe(3);
    expect(plan.completion).toMatchObject({ proofAccepted: false, sliceAccepted: false, releaseReady: false });
    for (const stage of ['advance', 'release'] as const) expect(f.validate(stage).issues).toContain(`PROOF_REFINEMENT_PENDING: proof: refine deferred outcomes before ${stage}: O2, O3`);
  });

  it('bounds each new unapproved visual scope while approved and nonvisual units use the overall budget', () => {
    const f = scopedVisualFixture(); f.approvePublic(); f.detailApp(); f.addUnit(['O2']);
    expect(f.validate('plan').issues).toEqual([]); expect(f.validate('plan').metrics.pendingUnits).toBe(4);
    f.addUnit(['O2']); const report = f.validate('plan'); expect(report.metrics.pendingUnits).toBe(5);
    expect(report.issues).toEqual(['design: surface app has 3 unreviewed units exceeds 2']);
  });

  it.each(['words', 'bytes'] as const)('keeps the initial and new-scope %s ceiling despite a trusted overall extension', metric => {
    const f = scopedVisualFixture(); f.extension(8);
    const text = metric === 'words' ? 'x '.repeat(1201) : '界'.repeat(3300);
    f.write('runs/current/tasks-proof.md', fs.readFileSync(path.join(f.run, 'tasks-proof.md'), 'utf8') + text);
    expect(f.validate('plan').issues.join('\n')).toContain(metric === 'words' ? 'pending words exceeds 1200' : 'pending bytes exceeds 9600');
    f.saveTasks(); f.approvePublic(); f.detailApp();
    f.write('runs/current/tasks-proof.md', fs.readFileSync(path.join(f.run, 'tasks-proof.md'), 'utf8') + text);
    const report = f.validate('plan');
    expect(report.issues).toEqual([expect.stringMatching(new RegExp(`^design: surface app has \\d+ unreviewed ${metric} exceeds ${metric === 'words' ? 1200 : 9600}$`))]);
  });

  it('attributes owned approved/nonvisual sections separately and shared auxiliary detail conservatively', () => {
    const f = scopedVisualFixture(); f.approvePublic();
    f.write('runs/current/tasks-proof.md', fs.readFileSync(path.join(f.run, 'tasks-proof.md'), 'utf8') + 'operator-detail '.repeat(1201));
    f.proof.deferredOutcomeIds = f.proof.deferredOutcomeIds!.filter(id => id !== 'O2');
    const number = f.proof.units.length + 1;
    f.proof.units.push({ id: `tasks-app.md#T${number}`, planningNodeIds: ['queue'], outcomeIds: ['O2'], acceptance: 'Render the app entry and review its composed recovery design', affectedPaths: ['app-preview.ts'], dependsOn: [] });
    f.proof.detailedFiles.push('tasks-app.md');
    f.write('runs/current/tasks-app.md', `## T${number} - App entry design\n- **File:** \`app-preview.ts\`\n- **Precise change:** Render and review the app entry before further screen detail.\n`);
    expect(f.validate('plan').issues).toEqual([]);
    f.proof.detailedFiles.push('app-notes.md'); f.write('runs/current/app-notes.md', 'shared-detail '.repeat(1201));
    expect(f.validate('plan').issues.join('\n')).toMatch(/design: surface app has \d+ unreviewed words exceeds 1200/);
  });

  it.each(['untrusted', 'stale'] as const)('does not unlock independent breadth with %s design approval', defect => {
    const f = scopedVisualFixture(); f.addIndependent(); f.savePlanning(); f.approve(); f.approvePublic();
    expect(f.validate('plan').issues).toEqual([]);
    if (defect === 'stale') f.write('app.ts', 'export const changedComposition = true;');
    const report = f.validate('plan', defect !== 'untrusted');
    expect(report.completion.designAcceptedOutcomeIds).toEqual([]); expect(report.issues).toContain('budget: 3 pending units exceeds 2');
  });

  it('requires the accepted representative to belong to actually detailed work, not a deferred future screen', () => {
    const f = scopedVisualFixture(); f.addIndependent(); f.savePlanning(); f.approve();
    f.evidence('O2'); f.acceptDesign(['O2']);
    const report = f.validate('plan'); expect(report.completion.designAcceptedOutcomeIds).toEqual(['O2']);
    expect(report.issues).toContain('budget: 3 pending units exceeds 2');
    f.approvePublic(); expect(f.validate('plan').issues).toEqual([]);
  });

  it.each(['NUL', 'invalid UTF-8', 'binary control'] as const)('rejects %s in pending detail instead of bypassing the initial word ceiling', format => {
    const f = scopedVisualFixture(); expect(f.validate('plan').issues).toEqual([]);
    const file = path.join(f.run, 'tasks-proof.md'); const normal = fs.readFileSync(file, 'utf8') + 'x '.repeat(1201);
    f.write('runs/current/tasks-proof.md', normal);
    expect(f.validate('plan').issues.join('\n')).toContain('pending words exceeds 1200');
    const marker = format === 'NUL' ? Buffer.from([0]) : format === 'invalid UTF-8' ? Buffer.from([0xc3, 0x28]) : Buffer.from([1]);
    const bytes = Buffer.concat([Buffer.from(normal), marker]); f.write('runs/current/tasks-proof.md', bytes);
    const report = f.validate('plan');
    expect(report.valid).toBe(false); expect(report.metrics.pendingBytes).toBe(bytes.length);
    expect(report.issues.join('\n')).toContain('pending detail must be UTF-8 text without binary control characters runs/current/tasks-proof.md');
  });

  it('rejects the same NUL-marked visual task that previously evaded the scoped word ceiling', () => {
    const f = scopedVisualFixture(); f.approvePublic(); f.detailApp(); expect(f.validate('plan').issues).toEqual([]);
    const normal = fs.readFileSync(path.join(f.run, 'tasks-proof.md'), 'utf8') + 'x '.repeat(1201);
    f.write('runs/current/tasks-proof.md', normal);
    expect(f.validate('plan').issues.join('\n')).toMatch(/design: surface app has \d+ unreviewed words exceeds 1200/);
    f.write('runs/current/tasks-proof.md', normal + '\0');
    const report = f.validate('plan');
    expect(report.valid).toBe(false); expect(report.metrics.pendingBytes).toBe(Buffer.byteLength(normal) + 1);
    expect(report.issues.join('\n')).toContain('pending detail must be UTF-8 text without binary control characters runs/current/tasks-proof.md');
  });

  it('retains byte accounting and undeclared-path diagnostics for binary pending files', () => {
    const f = scopedVisualFixture(); const baseline = f.validate('plan'); expect(baseline.issues).toEqual([]);
    f.write('runs/current/unowned.bin', Buffer.from([0, 255])); const report = f.validate('plan');
    expect(report.metrics.pendingBytes).toBe(baseline.metrics.pendingBytes + 2);
    expect(report.issues).toEqual([
      'budget: pending detail must be UTF-8 text without binary control characters runs/current/unowned.bin',
      'budget: unregistered pending detail runs/current/unowned.bin',
    ]);
  });

  it('preserves legitimate bound binary source, architecture and current image-evidence exemptions', () => {
    const f = scopedVisualFixture();
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9eQAAAAASUVORK5CYII=', 'base64');
    const original = f.write('runs/current/input-image.png', png); f.requirements.originalSources.push(original);
    f.contract.sources.push({ id: 'S3', binding: original, status: 'inspected', authority: 'Synthetic original input fixture' }); f.savePlanning();
    const diagram = f.write('runs/current/domain-diagram.png', png);
    const domain = JSON.parse(fs.readFileSync(path.join(f.run, 'architecture.json'), 'utf8')); domain.documents = [diagram];
    f.manifest.planningInputs![2] = f.write('runs/current/architecture.json', JSON.stringify(domain)); f.approve(); f.approvePublic();
    f.manifest.planningBudget.corpusRoots.push('evidence');
    expect(f.validate('plan').issues).toEqual([]);
  });

  it('requires a current trusted larger-proof exception and never lets it waive scoped design limits', () => {
    const f = scopedVisualFixture(); for (let n = 0; n < 4; n++) f.addIndependent(); f.savePlanning(); f.approve(); f.extension(8);
    expect(f.validate('plan').issues).toContain('budget: 6 pending units exceeds 2');
    f.approvePublic(); expect(f.validate('plan').issues).toEqual([]);
    f.manifest.planningBudget.extensionDecisionId = undefined;
    expect(f.validate('plan').issues).toEqual(['budget: 6 pending units exceeds 5']);
    f.manifest.planningBudget.extensionDecisionId = 'larger-proof'; f.detailApp(); f.addUnit(['O2']);
    expect(f.validate('plan').issues).toEqual([]);
    f.extension(9); f.addUnit(['O2']);
    expect(f.validate('plan').issues).toEqual(['design: surface app has 3 unreviewed units exceeds 2']);
    f.contract.capacity.hours = 24; f.savePlanning(); f.approve();
    expect(f.validate('plan').issues.join('\n')).toContain('budget: extension needs bounded limits, dependency/risk reason and trusted independent review');
  });
});
