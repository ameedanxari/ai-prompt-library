import { describe, expect, it } from 'vitest';
import { assessPlanningQuality, assessPlanningTrial, type PlanningQualityInput, type PlanningTrialInput, type PlanningWorkKind } from '../../src/delivery/planning-quality.js';

const r = (min: number, max = min) => ({ min, max });
function fixture(): PlanningQualityInput {
  const kinds: PlanningWorkKind[] = ['build', 'review', 'evidence', 'coordination', 'integration', 'recovery'];
  return {
    executionAuthorized: true,
    nodes: [
      { id: 'supply', dependsOn: [], complete: true, authorized: true, blockers: [], elapsedHours: r(8, 10), ownerDelayHours: r(2), ownerTouchpoints: 1 },
      { id: 'intake', dependsOn: [], complete: true, authorized: true, blockers: [], elapsedHours: r(6, 8), ownerDelayHours: r(0), ownerTouchpoints: 1 },
      { id: 'concierge', dependsOn: ['supply', 'intake'], complete: false, authorized: true, blockers: [], elapsedHours: r(4, 6), ownerDelayHours: r(1), ownerTouchpoints: 1 },
    ],
    work: ['supply', 'intake', 'concierge'].flatMap(nodeId => kinds.map(kind => ({ id: `${nodeId}-${kind}`, nodeId,
      role: kind === 'review' ? 'owner' : 'engineer', kind, hours: kind === 'build' ? r(4, 6) : kind === 'review' ? r(1) : r(0) }))),
    milestones: [{ id: 'manual-marketplace', nodeIds: ['concierge'], deadlineHours: 24, roleAvailability: { engineer: r(24), owner: r(4) }, ownerTouchpointAvailability: 4 }],
    openDecisionIds: ['sender'], ownerBrief: [{ id: 'sender', question: 'Which address should customer emails show?', options: ['Registered office', 'Operating office'], recommendation: 'Registered office', deadline: 'Before customer email', blocks: ['Customer email'] }],
    mindmapLeaves: ['supply', 'intake', 'concierge'].map(nodeId => ({ id: `leaf-${nodeId}`, nodeId })),
  };
}

describe('planning quality advisory', () => {
  it('counts shared dependency work once and parallel elapsed paths by maximum, with owner delay', () => {
    const input = fixture(); input.milestones[0].nodeIds.push('supply');
    const result = assessPlanningQuality(input);
    expect(result.valid).toBe(true);
    expect(result.milestones[0]).toMatchObject({ laborByRole: { engineer: r(12, 18), owner: r(3) }, criticalPathHours: r(15, 19), ownerTouchpoints: 3, provisional: false });
    expect(result.advisories).toEqual([]);
    expect(result.executableNow).toEqual(['concierge']);
  });
  it('detects role constraints hidden by adequate total team hours and owner overload', () => {
    const input = fixture(); input.milestones[0].roleAvailability = { engineer: r(5), owner: r(100) };
    input.milestones[0].ownerTouchpointAvailability = 2;
    const result = assessPlanningQuality(input);
    expect(result.advisories).toContain('manual-marketplace/engineer: minimum labor exceeds maximum availability');
    expect(result.advisories).toContain('manual-marketplace: owner touchpoints exceed availability');
    expect(result.milestones[0].provisional).toBe(true);
  });
  it('distinguishes known impossible deadlines from upper-range risks', () => {
    const input = fixture(); input.milestones[0].deadlineHours = 14;
    expect(assessPlanningQuality(input).advisories).toContain('manual-marketplace: minimum dependency path exceeds deadline');
    expect(assessPlanningQuality(input).milestones[0].provisional).toBe(true);
    input.milestones[0].deadlineHours = 17;
    expect(assessPlanningQuality(input).advisories).toContain('manual-marketplace: dependency path risks exceeding deadline');
    expect(assessPlanningQuality(input).milestones[0].provisional).toBe(true);
  });
  it('keeps unknown duration, staffing and missing effort categories provisional instead of treating them as zero', () => {
    const input = fixture(); input.nodes[0].elapsedHours = null;
    delete input.milestones[0].roleAvailability.engineer;
    input.work = input.work.filter(w => w.kind !== 'recovery');
    const result = assessPlanningQuality(input);
    expect(result.milestones[0]).toMatchObject({ criticalPathHours: null, laborByKind: { recovery: null }, provisional: true });
    expect(result.advisories).toContain('manual-marketplace/engineer: labor or availability unknown');
    expect(result.advisories.some(a => a.includes('recovery effort unestimated'))).toBe(true);
  });
  it('allows aggregate process estimates once per milestone without six rows on every node', () => {
    const input = fixture();
    input.work = input.work.filter(w => w.kind === 'build' || w.nodeId === 'concierge');
    const result = assessPlanningQuality(input);
    expect(result.valid).toBe(true); expect(result.advisories).toEqual([]);
    expect(result.milestones[0]).toMatchObject({ provisional: false, laborByRole: { engineer: r(12, 18), owner: r(1) } });
    input.work = input.work.filter(w => w.nodeId !== 'supply');
    const missing = assessPlanningQuality(input);
    expect(missing.milestones[0].provisional).toBe(true);
    expect(missing.advisories).toContain('manual-marketplace/supply: no work estimate; milestone totals are incomplete');
  });
  it('requires explicit global and unit authority plus completed dependencies and supplied inputs', () => {
    const input = fixture(); input.executionAuthorized = null; input.nodes[2].authorized = false;
    input.nodes[0].complete = false; input.nodes[2].blockers = ['Verified sending domain'];
    const result = assessPlanningQuality(input);
    expect(result.executableNow).toEqual([]);
    expect(result.blocked.find(b => b.nodeId === 'concierge')!.reasons).toEqual([
      'Verified sending domain', 'execution authority absent or unknown', 'unit authority absent or unknown', 'dependency incomplete: supply',
    ]);
    input.executionAuthorized = true; input.nodes[2].authorized = true;
    expect(assessPlanningQuality(input).executableNow).toEqual(['supply']);
  });
  it.each(['cycle', 'unknown dependency', 'duplicate activity', 'invalid effort'])(
    'rejects %s without producing a misleading ready list', defect => {
      const input = fixture();
      if (defect === 'cycle') input.nodes[0].dependsOn = ['concierge'];
      if (defect === 'unknown dependency') input.nodes[2].dependsOn.push('missing');
      if (defect === 'duplicate activity') input.work.push({ ...input.work[0] });
      if (defect === 'invalid effort') input.work[0].hours = r(5, 2);
      const result = assessPlanningQuality(input);
      expect(result.valid).toBe(false); expect(result.issues.length).toBeGreaterThan(0); expect(result.executableNow).toEqual([]);
    });
  it('requires every open decision in a usable brief but treats jargon detection only as an advisory', () => {
    const input = fixture(); input.openDecisionIds.push('migration');
    expect(assessPlanningQuality(input).issues).toContain('owner brief missing open decision migration');
    input.openDecisionIds.pop(); input.ownerBrief[0].question = 'Approve the digest?';
    const result = assessPlanningQuality(input);
    expect(result.valid).toBe(true); expect(result.advisories).toContain('sender: owner wording may contain internal jargon; human review required');
    input.ownerBrief[0].deadline = '';
    expect(assessPlanningQuality(input).issues).toContain('sender: incomplete owner decision');
  });
  it('requires exact mindmap coverage and rejects unknown or multiply mapped nodes', () => {
    const input = fixture(); input.mindmapLeaves[0].nodeId = 'intake';
    expect(assessPlanningQuality(input).issues).toEqual(expect.arrayContaining(['supply: expected exactly one mindmap leaf', 'intake: expected exactly one mindmap leaf']));
    input.mindmapLeaves[0].nodeId = 'phantom';
    expect(assessPlanningQuality(input).issues).toContain('leaf-supply: unknown mindmap node phantom');
  });
  it('keeps unestimated work and owner availability unknown even with a generous deadline', () => {
    const input = fixture(); input.work[0].hours = null; input.nodes[1].ownerTouchpoints = null;
    input.milestones[0].deadlineHours = 1000;
    const milestone = assessPlanningQuality(input).milestones[0];
    expect(milestone.laborByRole.engineer).toBeNull(); expect(milestone.ownerTouchpoints).toBeNull(); expect(milestone.provisional).toBe(true);
  });
});

const hash = 'a'.repeat(64);
function trial(): PlanningTrialInput {
  return { frozenAt: '2026-10-28T08:00:00Z', generatedAt: '2026-10-28T09:00:00Z',
    frozen: { sources: hash, ownerAnswers: hash, libraryRevision: hash, startingState: hash, producerPrompt: hash, hiddenRubric: hash, budget: hash },
    producerInvocationHash: hash, outputHash: hash, producerContextId: 'producer', reviewerContextId: 'independent',
    priorGeneratedMaterialProvided: false, rubricProvidedToProducer: false, generatorSuppliedPlanningContent: false, evaluationStage: 'planning' };
}
describe('planning trial provenance declarations', () => {
  it('recognizes a cold-start candidate while refusing authentication or superiority claims', () => {
    expect(assessPlanningTrial(trial())).toMatchObject({ valid: true, classification: 'cold-start-candidate', evidenceScope: 'planning', superiorityEstablished: false, provenanceAuthenticated: false });
  });
  it.each(['generatorSuppliedPlanningContent', 'rubricProvidedToProducer', 'priorGeneratedMaterialProvided'] as const)(
    'labels %s assisted despite complete frozen hashes', field => {
      const input = trial(); input[field] = true;
      expect(assessPlanningTrial(input)).toMatchObject({ valid: true, classification: 'assisted', superiorityEstablished: false });
    });
  it('rejects post-generation freezing, missing source evidence and same-context review', () => {
    const input = trial(); input.frozenAt = input.generatedAt; input.frozen.sources = ''; input.reviewerContextId = input.producerContextId;
    const result = assessPlanningTrial(input);
    expect(result.classification).toBe('invalid'); expect(result.issues).toHaveLength(3);
  });
  it('does not infer superiority from the caller declaring a delivered trial', () => {
    const input = trial(); input.evaluationStage = 'delivered';
    expect(assessPlanningTrial(input)).toMatchObject({ evidenceScope: 'delivered', superiorityEstablished: false, provenanceAuthenticated: false });
  });
});
