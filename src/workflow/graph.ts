import type { Diagnostic, Prerequisite, RunContract } from './contract.js';
import * as path from 'node:path';

export const visualTarget = (kind: string): boolean => ['web','native','desktop'].includes(kind);
/** References and causal cycles are checked on one graph, including decision producers. */
export function validateGraph(run: RunContract): Diagnostic[] {
  const issues: Diagnostic[] = [];
  const add = (code: string, subject: string, message: string, causes?: string[]) => issues.push({ code, subject, message, ...(causes ? { causes } : {}) });
  const sets = { source: new Set(run.sources.map(x => x.id)), target: new Set(run.targets.map(x => x.id)), criterion: new Set(run.criteria.map(x => x.id)), requirement: new Set(run.requirements.map(x => x.id)), work: new Set(run.work.map(x => x.id)), resource: new Set(run.resources.map(x => x.id)), decision: new Set(run.decisions.map(x => x.id)), outcome: new Set(run.outcomes.map(x => x.id)), release: new Set(run.releases.map(x => x.id)) };
  const refs = (ids: string[], kind: keyof typeof sets, owner: string) => { for (const id of ids) if (!sets[kind].has(id)) add('REFERENCE_UNKNOWN', owner, `Unknown ${kind} ${id}`); };
  const sourceRefs = (rows: { sourceId: string }[], owner: string) => refs(rows.map(x => x.sourceId), 'source', owner);
  const edges = new Map<string, string[]>();
  const inputs = (owner: string, rows: Prerequisite[]) => { for (const row of rows) refs([row.id], row.kind, owner); edges.set(owner, rows.map(row => `${row.kind}:${row.id}`)); };
  for (const q of run.requirements) { sourceRefs(q.sourceRefs, q.id); refs(q.criterionIds, 'criterion', q.id); refs(q.releaseIds, 'release', q.id); }
  refs([run.policy.instruction.sourceId], 'source', 'policy.instruction');
  for (const purpose of ['scope','semantic','release'] as const) if (!run.policy.reviews[purpose].includes('independent')) add('INDEPENDENT_REVIEW_REQUIRED', `policy.reviews.${purpose}`, 'Outcome runs require an actual distinct independent review duty');
  if (run.targets.some(t => visualTarget(t.kind)) && !run.policy.reviews.design.includes('independent')) add('INDEPENDENT_REVIEW_REQUIRED', 'policy.reviews.design', 'Composed visual acceptance requires a distinct independent reviewer');
  if (run.capacity) sourceRefs(run.capacity.sourceRefs, 'capacity');
  for (const g of run.policy.grants) { refs(g.targetIds, 'target', g.id); sourceRefs([g.sourceRef], g.id); }
  for (const t of run.targets) if (t.lifecycle.sourceRef) sourceRefs([t.lifecycle.sourceRef], t.id);
  for (const c of run.criteria) {
    refs([c.targetId], 'target', c.id);
    if (c.captures?.length && !c.evidenceKinds.includes('image')) add('CAPTURE_KIND_MISSING', c.id, 'Capture requirements require image evidence');
    if (c.captures?.some(x => !x.composed)) add('CAPTURE_NOT_COMPOSED', c.id, 'Visual criteria require composed states');
    if (c.evidenceKinds.includes('test') && !c.minimumCollected) add('TEST_COLLECTION_UNDEFINED', c.id, 'Substantive tests require a positive minimumCollected');
  }
  for (const o of run.outcomes) {
    refs(o.requirementIds, 'requirement', o.id); refs(o.criterionIds, 'criterion', o.id); refs([o.targetId], 'target', o.id); inputs(`outcome:${o.id}`, o.inputs);
    const criteria = run.criteria.filter(c => o.criterionIds.includes(c.id));
    if (!criteria.some(c => c.scenario === 'success') || !criteria.some(c => c.scenario === 'recovery')) add('OUTCOME_SCENARIOS_MISSING', o.id, 'An outcome needs useful success and reachable recovery criteria');
    if (criteria.some(c => c.targetId !== o.targetId)) add('CRITERION_TARGET_MISMATCH', o.id, 'An outcome criterion must observe its owning target');
    const target = run.targets.find(t => t.id === o.targetId);
    if (target && visualTarget(target.kind)) {
      const captures = criteria.flatMap(c => c.captures ?? []);
      for (const state of ['entry','success','recovery']) if (!captures.some(c => c.state === state && c.composed)) add('VISUAL_STATE_MISSING', o.id, `Missing composed ${state} criterion`);
    } else if (target && !['document','media'].includes(target.kind)) for (const scenario of ['success','recovery']) {
      if (!criteria.some(c => c.scenario === scenario && c.evidenceKinds.some(k => ['consumer','operation'].includes(k)))) add('CONSUMER_CRITERION_MISSING', o.id, `A headless outcome needs actual ${scenario} consumer or operational evidence`);
    }
  }
  for (const q of run.requirements) for (const criterionId of q.criterionIds) if (!run.outcomes.some(o => o.requirementIds.includes(q.id) && o.criterionIds.includes(criterionId))) add('OBLIGATION_UNCOVERED', q.id, `No owning outcome covers criterion ${criterionId}`);
  for (const w of run.work) {
    refs(w.outcomeIds, 'outcome', w.id); refs(w.criterionIds, 'criterion', w.id); refs(w.targetIds, 'target', w.id); inputs(`work:${w.id}`, w.inputs);
    for (const cid of w.criterionIds) {
      const criterion = run.criteria.find(c => c.id === cid);
      if (criterion && !w.targetIds.includes(criterion.targetId)) add('WORK_TARGET_MISMATCH', w.id, `Criterion ${cid} observes an unowned target`);
      if (!run.outcomes.some(o => w.outcomeIds.includes(o.id) && o.criterionIds.includes(cid))) add('WORK_CRITERION_UNOWNED', w.id, `Criterion ${cid} is outside this work's outcomes`);
    }
    if (w.action !== 'read' && w.files.length === 0) add('WORK_FILES_MISSING', w.id, 'Mutation work requires explicit file ownership');
  }
  for (const r of run.resources) { refs([r.targetId], 'target', r.id); sourceRefs(r.sourceRefs, r.id); refs(r.producedBy ?? [],'work',r.id); edges.set(`resource:${r.id}`, (r.producedBy ?? []).map(id => `work:${id}`)); }
  for (const d of run.decisions) { sourceRefs(d.sourceRefs, d.id); refs(d.producedBy, 'work', d.id); inputs(`decision:${d.id}`, [...d.inputs, ...d.producedBy.map(id => ({ kind: 'work' as const, id }))]); }
  for (const r of run.releases) {
    refs(r.outcomeIds, 'outcome', r.id); refs(r.sharedCriterionIds, 'criterion', r.id); sourceRefs(r.sourceRefs, r.id); inputs(`release:${r.id}`, [...r.inputs, ...r.outcomeIds.map(id => ({ kind: 'outcome' as const, id }))]);
    const criterionIds = new Set(releaseClosure(run,r.id).criterionIds);
    for (const q of run.requirements.filter(q => q.mandatory && (q.releaseIds.length === 0 || q.releaseIds.includes(r.id)))) for (const cid of q.criterionIds) if (!criterionIds.has(cid)) add('RELEASE_OBLIGATION_OMITTED', r.id, `Mandatory ${q.id}/${cid} is absent from the release boundary`);
    const executable = [...criterionIds].some(id => { const criterion = run.criteria.find(c => c.id === id); const target = run.targets.find(t => t.id === criterion?.targetId); return target && !['document','media'].includes(target.kind); });
    if (executable && ![...criterionIds].some(id => run.criteria.find(c => c.id === id)?.evidenceKinds.includes('build'))) add('RELEASE_BUILD_MISSING', r.id, 'An executable release boundary requires actual build evidence');
  }
  refs(run.proofOutcomeIds, 'outcome', 'proof'); refs(run.activeWorkIds, 'work', 'activeWork');
  for (const e of run.evidence) { refs([e.criterionId], 'criterion', e.id); refs([e.targetId], 'target', e.id); }
  for (const j of run.judgments) {
    const kind = j.purpose === 'scope' ? 'requirement' : j.purpose === 'semantic' || j.purpose === 'design' ? 'criterion' : j.purpose;
    refs(j.subjectIds, kind, j.id); for (const f of j.findings) refs(f.criterionIds, 'criterion', f.id);
  }
  const done = new Set<string>(); const stack: string[] = [];
  const visit = (id: string) => {
    if (done.has(id)) return;
    const index = stack.indexOf(id);
    if (index !== -1) { const chain = [...stack.slice(index), id]; add('DEPENDENCY_CYCLE', id, `Causal dependency cycle: ${chain.join(' → ')}`, chain); return; }
    stack.push(id); for (const dep of edges.get(id) ?? []) visit(dep); stack.pop(); done.add(id);
  };
  for (const id of edges.keys()) visit(id);
  const mutations = run.work.filter(w => run.activeWorkIds.includes(w.id) && w.action !== 'read');
  for (let i = 0; i < mutations.length; i++) for (let j = i + 1; j < mutations.length; j++) {
    const a = mutations[i]; const b = mutations[j];
    const overlap = a.files.filter(file => b.files.some(other => path.posix.normalize(file) === path.posix.normalize(other)));
    if (overlap.length && !workOrdered(run,a.id,b.id)) add('WORK_OWNERSHIP_COLLISION',`${a.id},${b.id}`,`Unordered active mutation ownership overlaps: ${overlap.join(', ')}`);
  }
  return issues;
}

/** A real typed prerequisite must order shared mutation ownership in one direction. */
export function workOrdered(run: RunContract, a: string, b: string): boolean {
  const precedes = (first: string, second: string): boolean => {
    const visited = new Set<string>();
    const walk = (p: Prerequisite): boolean => {
      const key = `${p.kind}:${p.id}`; if (visited.has(key)) return false; visited.add(key);
      if (p.kind === 'work') { if (p.id === first) return true; return run.work.find(w => w.id === p.id)?.inputs.some(walk) ?? false; }
      if (p.kind === 'decision') { const d = run.decisions.find(d => d.id === p.id); return !!d && (d.producedBy.some(id => walk({ kind:'work',id })) || d.inputs.some(walk)); }
      if (p.kind === 'resource') return run.resources.find(r => r.id === p.id)?.producedBy?.some(id => walk({ kind:'work',id })) ?? false;
      const o = run.outcomes.find(o => o.id === p.id);
      return !!o && (o.inputs.some(walk) || run.work.filter(w => w.outcomeIds.includes(o.id)).some(w => walk({ kind:'work',id:w.id })));
    };
    return run.work.find(w => w.id === second)?.inputs.some(walk) ?? false;
  };
  return precedes(a,b) !== precedes(b,a);
}

/** Release selection retains recursive typed dependencies and shared criteria. */
export interface DependencyClosure { outcomeIds: string[]; criterionIds: string[]; workIds: string[]; decisionIds: string[]; resourceIds: string[] }
export function releaseClosure(run: RunContract, releaseId: string): DependencyClosure {
  const release = run.releases.find(r => r.id === releaseId);
  if (!release) throw new Error(`REFERENCE_UNKNOWN: release ${releaseId}`);
  return dependencyClosure(run,[...release.outcomeIds.map(id => ({ kind:'outcome' as const,id })),...release.inputs],release.sharedCriterionIds);
}
export function dependencyClosure(run: RunContract, seeds: Prerequisite[], initialCriteria: string[] = []): DependencyClosure {
  const outcomes = new Set<string>(); const criteria = new Set(initialCriteria); const visited = new Set<string>();
  const work = new Set<string>(); const decisions = new Set<string>(); const resources = new Set<string>();
  const walk = (p: Prerequisite): void => {
    const key = `${p.kind}:${p.id}`; if (visited.has(key)) return; visited.add(key);
    if (p.kind === 'outcome') { const o = run.outcomes.find(o => o.id === p.id); if (o) { outcomes.add(o.id); o.criterionIds.forEach(id => criteria.add(id)); o.inputs.forEach(walk); } }
    if (p.kind === 'decision') { const d = run.decisions.find(d => d.id === p.id); if (d) { decisions.add(d.id); d.inputs.forEach(walk); d.producedBy.forEach(id => walk({ kind: 'work', id })); } }
    if (p.kind === 'work') { const w = run.work.find(w => w.id === p.id); if (w) { work.add(w.id); w.criterionIds.forEach(id => criteria.add(id)); w.inputs.forEach(walk); } }
    if (p.kind === 'resource') { const r = run.resources.find(r => r.id === p.id); if (r) { resources.add(r.id); r.producedBy?.forEach(id => walk({ kind:'work',id })); } }
  };
  seeds.forEach(walk);
  return { outcomeIds:[...outcomes].sort(),criterionIds:[...criteria].sort(),workIds:[...work].sort(),decisionIds:[...decisions].sort(),resourceIds:[...resources].sort() };
}

/** Work needed to produce the first proof includes its causal preparations. */
export function proofWorkClosure(run: RunContract): Set<string> {
  const workIds = new Set<string>(); const visited = new Set<string>();
  const visit = (p: Prerequisite): void => {
    const key = `${p.kind}:${p.id}`; if (visited.has(key)) return; visited.add(key);
    if (p.kind === 'work') { const w = run.work.find(w => w.id === p.id); if (w) { workIds.add(w.id); w.inputs.forEach(visit); } }
    if (p.kind === 'decision') { const d = run.decisions.find(d => d.id === p.id); if (d) { d.inputs.forEach(visit); d.producedBy.forEach(id => visit({ kind:'work',id })); } }
    if (p.kind === 'resource') run.resources.find(r => r.id === p.id)?.producedBy?.forEach(id => visit({ kind:'work',id }));
    if (p.kind === 'outcome') {
      const o = run.outcomes.find(o => o.id === p.id); if (o) o.inputs.forEach(visit);
      run.work.filter(w => w.outcomeIds.includes(p.id)).forEach(w => visit({ kind:'work',id:w.id }));
    }
  };
  run.proofOutcomeIds.forEach(id => visit({ kind:'outcome',id }));
  return workIds;
}
