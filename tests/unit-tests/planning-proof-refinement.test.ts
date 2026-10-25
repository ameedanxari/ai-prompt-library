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
});
