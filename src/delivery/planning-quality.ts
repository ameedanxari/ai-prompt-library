/** Advisory calculations only. Inputs and human judgments are not authenticated here. */
export type HoursRange = { min: number; max: number };
export type PlanningWorkKind = 'build' | 'review' | 'evidence' | 'coordination' | 'integration' | 'recovery';
export interface PlanningQualityInput {
  executionAuthorized: boolean | null;
  nodes: { id: string; dependsOn: string[]; complete: boolean; authorized: boolean | null;
    blockers: string[]; elapsedHours: HoursRange | null; ownerDelayHours: HoursRange | null; ownerTouchpoints: number | null }[];
  /** Each activity appears exactly once. Reserve is not added again to its component activities. */
  work: { id: string; nodeId: string; role: string; kind: PlanningWorkKind; hours: HoursRange | null }[];
  milestones: { id: string; nodeIds: string[]; deadlineHours: number | null;
    roleAvailability: Record<string, HoursRange | null>; ownerTouchpointAvailability: number | null }[];
  openDecisionIds: string[];
  ownerBrief: { id: string; question: string; options: string[]; recommendation: string; deadline: string; blocks: string[] }[];
  mindmapLeaves: { id: string; nodeId: string }[];
}
export interface PlanningQualityReport {
  valid: boolean;
  issues: string[];
  advisories: string[];
  executableNow: string[];
  blocked: { nodeId: string; reasons: string[] }[];
  milestones: { id: string; laborByRole: Record<string, HoursRange | null>;
    laborByKind: Record<PlanningWorkKind, HoursRange | null>; criticalPathHours: HoursRange | null;
    ownerTouchpoints: number | null; provisional: boolean }[];
}
const kinds: PlanningWorkKind[] = ['build', 'review', 'evidence', 'coordination', 'integration', 'recovery'];
const rangeValid = (r: HoursRange | null) => r === null || (Number.isFinite(r.min) && Number.isFinite(r.max) && r.min >= 0 && r.max >= r.min);
const add = (a: HoursRange | null, b: HoursRange | null): HoursRange | null => a && b ? { min: a.min + b.min, max: a.max + b.max } : null;
const zero = (): HoursRange => ({ min: 0, max: 0 });
const sum = (items: (HoursRange | null)[]) => items.reduce<HoursRange | null>(add, zero());
const unique = (ids: string[]) => new Set(ids).size === ids.length && ids.every(id => id.trim().length > 0);
const finiteNonnegative = (n: number | null) => n === null || (Number.isFinite(n) && n >= 0);

export function assessPlanningQuality(input: PlanningQualityInput): PlanningQualityReport {
  const issues: string[] = []; const advisories: string[] = [];
  const nodes = new Map(input.nodes.map(n => [n.id, n]));
  for (const [label, ids] of [['nodes', input.nodes.map(n => n.id)], ['work', input.work.map(w => w.id)],
    ['milestones', input.milestones.map(m => m.id)], ['open decisions', input.openDecisionIds],
    ['owner brief', input.ownerBrief.map(d => d.id)], ['mindmap leaves', input.mindmapLeaves.map(l => l.id)]] as const) {
    if (!unique([...ids])) issues.push(`${label}: IDs must be nonempty and unique`);
  }
  const visiting = new Set<string>(); const visited = new Set<string>();
  function visit(id: string): void {
    if (visiting.has(id)) { issues.push(`dependency cycle at ${id}`); return; }
    if (visited.has(id)) return;
    const node = nodes.get(id); if (!node) { issues.push(`unknown dependency ${id}`); return; }
    visiting.add(id); node.dependsOn.forEach(visit); visiting.delete(id); visited.add(id);
  }
  for (const node of input.nodes) {
    visit(node.id);
    if (!unique(node.dependsOn)) issues.push(`${node.id}: duplicate/empty dependency`);
    if (!rangeValid(node.elapsedHours) || !rangeValid(node.ownerDelayHours)) issues.push(`${node.id}: invalid elapsed/delay range`);
    if (!finiteNonnegative(node.ownerTouchpoints) || (node.ownerTouchpoints !== null && !Number.isInteger(node.ownerTouchpoints))) issues.push(`${node.id}: invalid owner touchpoints`);
  }
  for (const work of input.work) {
    if (!nodes.has(work.nodeId)) issues.push(`${work.id}: unknown work node ${work.nodeId}`);
    if (!work.role.trim() || !kinds.includes(work.kind) || !rangeValid(work.hours)) issues.push(`${work.id}: invalid role/kind/labor range`);
  }
  for (const milestone of input.milestones) {
    if (!unique(milestone.nodeIds) || !milestone.nodeIds.length || milestone.nodeIds.some(id => !nodes.has(id))) issues.push(`${milestone.id}: invalid milestone nodes`);
    if (!finiteNonnegative(milestone.deadlineHours) || !finiteNonnegative(milestone.ownerTouchpointAvailability)) issues.push(`${milestone.id}: invalid availability/deadline`);
    for (const [role, availability] of Object.entries(milestone.roleAvailability)) if (!role.trim() || !rangeValid(availability)) issues.push(`${milestone.id}: invalid role availability`);
  }
  for (const id of input.openDecisionIds) if (!input.ownerBrief.some(d => d.id === id)) issues.push(`owner brief missing open decision ${id}`);
  for (const decision of input.ownerBrief) {
    if (!decision.question.trim() || decision.options.length < 2 || decision.options.some(o => !o.trim()) || !decision.recommendation.trim() || !decision.deadline.trim() || !decision.blocks.length || decision.blocks.some(b => !b.trim())) issues.push(`${decision.id}: incomplete owner decision`);
    const text = [decision.question, ...decision.options, decision.recommendation, decision.deadline, ...decision.blocks].join(' ');
    if (/\b(receipt|digest|provenance|comparison-v2|positive collection)\b/i.test(text)) advisories.push(`${decision.id}: owner wording may contain internal jargon; human review required`);
  }
  for (const leaf of input.mindmapLeaves) if (!nodes.has(leaf.nodeId)) issues.push(`${leaf.id}: unknown mindmap node ${leaf.nodeId}`);
  for (const id of nodes.keys()) if (input.mindmapLeaves.filter(l => l.nodeId === id).length !== 1) issues.push(`${id}: expected exactly one mindmap leaf`);
  const report: PlanningQualityReport = { valid: !issues.length, issues, advisories, executableNow: [], blocked: [], milestones: [] };
  // Invalid graphs/arithmetic never produce a partial ready list.
  if (issues.length) return report;
  const closure = (ids: string[], result = new Set<string>()): Set<string> => {
    for (const id of ids) if (!result.has(id)) { result.add(id); closure(nodes.get(id)!.dependsOn, result); }
    return result;
  };
  const paths = new Map<string, HoursRange | null>();
  function path(id: string): HoursRange | null {
    if (paths.has(id)) return paths.get(id)!;
    const node = nodes.get(id)!; const parents = node.dependsOn.map(path);
    const prior = parents.some(p => p === null) ? null : { min: Math.max(0, ...parents.map(p => p!.min)), max: Math.max(0, ...parents.map(p => p!.max)) };
    const result = add(prior, add(node.elapsedHours, node.ownerDelayHours)); paths.set(id, result); return result;
  }
  for (const node of input.nodes.filter(n => !n.complete)) {
    const reasons = [...node.blockers];
    if (input.executionAuthorized !== true) reasons.push('execution authority absent or unknown');
    if (node.authorized !== true) reasons.push('unit authority absent or unknown');
    for (const id of node.dependsOn) if (!nodes.get(id)!.complete) reasons.push(`dependency incomplete: ${id}`);
    if (reasons.length) report.blocked.push({ nodeId: node.id, reasons }); else report.executableNow.push(node.id);
  }
  for (const milestone of input.milestones) {
    const scope = closure(milestone.nodeIds); const selectedNodes = input.nodes.filter(n => scope.has(n.id));
    const work = input.work.filter(w => scope.has(w.nodeId));
    const laborByRole: Record<string, HoursRange | null> = {};
    for (const role of new Set(work.map(w => w.role))) laborByRole[role] = sum(work.filter(w => w.role === role).map(w => w.hours));
    const laborByKind = Object.fromEntries(kinds.map(kind => [kind, !work.some(w => w.kind === kind) ? null : sum(work.filter(w => w.kind === kind).map(w => w.hours))])) as Record<PlanningWorkKind, HoursRange | null>;
    const nodePaths = milestone.nodeIds.map(path);
    const criticalPathHours = nodePaths.some(p => !p) ? null : { min: Math.max(...nodePaths.map(p => p!.min)), max: Math.max(...nodePaths.map(p => p!.max)) };
    const ownerTouchpoints = selectedNodes.some(n => n.ownerTouchpoints === null) ? null : selectedNodes.reduce((total, n) => total + n.ownerTouchpoints!, 0);
    let provisional = criticalPathHours === null || milestone.deadlineHours === null || ownerTouchpoints === null || milestone.ownerTouchpointAvailability === null;
    for (const kind of kinds) if (!work.some(w => w.kind === kind) || laborByKind[kind] === null) {
      provisional = true; advisories.push(`${milestone.id}: ${kind} effort unestimated; record a milestone-level estimate or explicit zero if inapplicable`);
    }
    for (const node of selectedNodes) if (!work.some(w => w.nodeId === node.id)) {
      provisional = true; advisories.push(`${milestone.id}/${node.id}: no work estimate; milestone totals are incomplete`);
    }
    for (const [role, labor] of Object.entries(laborByRole)) {
      const available = milestone.roleAvailability[role];
      if (!labor || !available) { provisional = true; advisories.push(`${milestone.id}/${role}: labor or availability unknown`); }
      else if (labor.min > available.max) { provisional = true; advisories.push(`${milestone.id}/${role}: minimum labor exceeds maximum availability`); }
      else if (labor.max > available.min) { provisional = true; advisories.push(`${milestone.id}/${role}: labor range risks exceeding availability`); }
    }
    if (ownerTouchpoints !== null && milestone.ownerTouchpointAvailability !== null && ownerTouchpoints > milestone.ownerTouchpointAvailability) { provisional = true; advisories.push(`${milestone.id}: owner touchpoints exceed availability`); }
    if (criticalPathHours && milestone.deadlineHours !== null) {
      if (criticalPathHours.min > milestone.deadlineHours) { provisional = true; advisories.push(`${milestone.id}: minimum dependency path exceeds deadline`); }
      else if (criticalPathHours.max > milestone.deadlineHours) { provisional = true; advisories.push(`${milestone.id}: dependency path risks exceeding deadline`); }
    }
    report.milestones.push({ id: milestone.id, laborByRole, laborByKind, criticalPathHours, ownerTouchpoints, provisional });
  }
  return report;
}

export interface PlanningTrialInput {
  generatedAt: string;
  frozenAt: string;
  /** Hashes bind records; this function cannot verify their contents or origin. */
  frozen: Record<'sources' | 'ownerAnswers' | 'libraryRevision' | 'startingState' | 'producerPrompt' | 'hiddenRubric' | 'budget', string>;
  producerInvocationHash: string;
  outputHash: string;
  producerContextId: string;
  reviewerContextId: string;
  priorGeneratedMaterialProvided: boolean;
  rubricProvidedToProducer: boolean;
  generatorSuppliedPlanningContent: boolean;
  evaluationStage: 'planning' | 'delivered';
}
export function assessPlanningTrial(input: PlanningTrialInput): {
  valid: boolean; classification: 'invalid' | 'assisted' | 'cold-start-candidate'; issues: string[];
  superiorityEstablished: false; provenanceAuthenticated: false; evidenceScope: 'planning' | 'delivered';
} {
  const issues: string[] = [];
  const frozenAt = Date.parse(input.frozenAt); const generatedAt = Date.parse(input.generatedAt);
  if (!Number.isFinite(frozenAt) || !Number.isFinite(generatedAt) || frozenAt >= generatedAt) issues.push('inputs and hidden rubric must be frozen before generation');
  const keys: (keyof PlanningTrialInput['frozen'])[] = ['sources', 'ownerAnswers', 'libraryRevision', 'startingState', 'producerPrompt', 'hiddenRubric', 'budget'];
  for (const key of keys) if (!/^[a-f0-9]{64}$/i.test(input.frozen[key] ?? '')) issues.push(`missing/invalid frozen ${key} hash`);
  for (const [label, hash] of [['producer invocation', input.producerInvocationHash], ['output', input.outputHash]]) if (!/^[a-f0-9]{64}$/i.test(hash ?? '')) issues.push(`missing/invalid ${label} hash`);
  if (!input.producerContextId.trim() || !input.reviewerContextId.trim() || input.producerContextId === input.reviewerContextId) issues.push('a distinct reviewer context is required');
  const assisted = input.priorGeneratedMaterialProvided || input.rubricProvidedToProducer || input.generatorSuppliedPlanningContent;
  return { valid: !issues.length, classification: issues.length ? 'invalid' : assisted ? 'assisted' : 'cold-start-candidate', issues,
    superiorityEstablished: false, provenanceAuthenticated: false, evidenceScope: input.evaluationStage };
}
