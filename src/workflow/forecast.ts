import type { ForecastScope, Prerequisite, RunContract, Work } from './contract.js';
import { dependencyClosure, releaseClosure } from './graph.js';

/** Follow outcome prerequisites through their producers as well as their own prerequisites. */
function producerClosure(run: RunContract, seeds: Prerequisite[]): string[] {
  let pending = [...seeds]; const work = new Set<string>(), outcomes = new Set<string>();
  while (pending.length) {
    const closure = dependencyClosure(run,pending); pending = [];
    closure.workIds.forEach(id => work.add(id));
    for (const id of closure.outcomeIds) if (!outcomes.has(id)) {
      outcomes.add(id);
      run.work.filter(w => w.outcomeIds.includes(id)).forEach(w => pending.push({kind:'work',id:w.id}));
    }
  }
  return [...work].sort();
}
/** Unique producer and prerequisite work within an explicitly selected boundary. */
export function scopeWorkIds(run: RunContract, scope: ForecastScope): string[] {
  if (scope.kind === 'all-work') return run.work.map(w => w.id).sort();
  if (scope.kind === 'milestone') {
    const m = run.milestones?.find(m => m.id === scope.id);
    if (!m) return [];
    // A declared outcome is a coverage claim, not an instruction to include every
    // related future item. Its prerequisites do need their actual producers.
    return producerClosure(run,[...m.workIds.map(id => ({kind:'work' as const,id})),...run.outcomes.filter(o => m.outcomeIds.includes(o.id)).flatMap(o => o.inputs)]);
  }
  const release = run.releases.find(r => r.id === scope.id);
  if (!release) return [];
  const closure = releaseClosure(run,scope.id);
  const selected = run.work.filter(w => w.outcomeIds.some(id => closure.outcomeIds.includes(id)) || w.criterionIds.some(id => closure.criterionIds.includes(id)));
  return producerClosure(run,[...release.outcomeIds.map(id => ({kind:'outcome' as const,id})),...release.inputs,...selected.map(w => ({kind:'work' as const,id:w.id}))]);
}
/** A milestone must not imply a complete outcome when linked work was left out. */
export function milestoneMissingWork(run: RunContract, id: string): string[] {
  const milestone=run.milestones?.find(m => m.id===id); if (!milestone) return [];
  const selected=new Set(scopeWorkIds(run,{kind:'milestone',id}));
  return run.work.filter(w => w.outcomeIds.some(oid => milestone.outcomeIds.includes(oid)) && !selected.has(w.id)).map(w => w.id).sort();
}
/** Report missing in-scope producers; external resources remain external inputs. */
export function scopeMissingProducers(run: RunContract, scope: ForecastScope): string[] {
  const ids = scopeWorkIds(run,scope), selected = run.work.filter(w => ids.includes(w.id));
  const seeds: Prerequisite[] = selected.map(w => ({kind:'work',id:w.id}));
  let outcomeIds: string[], criteriaIds: string[];
  if (scope.kind === 'all-work') {
    outcomeIds=run.outcomes.map(o => o.id); criteriaIds=run.criteria.map(c => c.id); seeds.push(...run.outcomes.flatMap(o => o.inputs));
  } else if (scope.kind === 'milestone') {
    const m=run.milestones?.find(m => m.id===scope.id); if (!m) return ['unknown milestone'];
    outcomeIds=m.outcomeIds; const declared=run.outcomes.filter(o => outcomeIds.includes(o.id)); criteriaIds=declared.flatMap(o => o.criterionIds); seeds.push(...declared.flatMap(o => o.inputs));
  } else {
    const r=run.releases.find(r => r.id===scope.id); if (!r) return ['unknown release'];
    const closure=releaseClosure(run,r.id); outcomeIds=closure.outcomeIds; criteriaIds=closure.criterionIds; seeds.push(...r.inputs);
  }
  const reached=dependencyClosure(run,seeds); outcomeIds=[...new Set([...outcomeIds,...reached.outcomeIds])];
  criteriaIds=[...new Set([...criteriaIds,...reached.criterionIds,...run.outcomes.filter(o => outcomeIds.includes(o.id)).flatMap(o => o.criterionIds)])];
  return [...outcomeIds.filter(id => !selected.some(w => w.outcomeIds.includes(id))).map(id => `outcome:${id}`),...criteriaIds.filter(id => !selected.some(w => w.criterionIds.includes(id))).map(id => `criterion:${id}`)];
}
export function allocations(w: Work): { role: string; hours: [number, number] | null }[] {
  if (!w.estimate) return [];
  return w.estimate.allocations ?? [{role:w.estimate.role!,hours:w.estimate.hours!}];
}
export function forecastWork(run: RunContract, ids: string[]) {
  const unique = [...new Set(ids)]; const work = run.work.filter(w => unique.includes(w.id));
  const hours: [number,number] = [0,0], roles: Record<string,[number,number]> = {}, unknown: string[] = [], unknownWait: string[] = [], unknownTouchpoints: string[] = [];
  const wait: [number,number] = [0,0]; let touchpoints=0;
  for (const w of work) {
    const rows=allocations(w); if (!rows.length || rows.some(a => !a.hours)) unknown.push(w.id);
    for (const a of rows) if (a.hours) { const r=roles[a.role] ??= [0,0]; r[0]+=a.hours[0];r[1]+=a.hours[1];hours[0]+=a.hours[0];hours[1]+=a.hours[1]; }
    if (w.estimate?.ownerDelayHours) { wait[0]+=w.estimate.ownerDelayHours[0]; wait[1]+=w.estimate.ownerDelayHours[1]; } else unknownWait.push(w.id);
    if (w.estimate?.ownerTouchpoints == null) unknownTouchpoints.push(w.id); else touchpoints+=w.estimate.ownerTouchpoints;
  }
  return {workIds:unique,hours,roles,unknown,wait,unknownWait,touchpoints,unknownTouchpoints};
}
/** Bind only milestones and scoped capacity relevant to the selected work. */
export function forecastContext(run: RunContract, workId: string) {
  const milestones=(run.milestones ?? []).filter(m => scopeWorkIds(run,{kind:'milestone',id:m.id}).includes(workId));
  const capacity=run.capacity && (!run.capacity.scope || scopeWorkIds(run,run.capacity.scope).includes(workId)) ? run.capacity : undefined;
  const ids = new Set(milestones.flatMap(m => scopeWorkIds(run,{kind:'milestone',id:m.id})));
  if (capacity?.scope) scopeWorkIds(run,capacity.scope).forEach(id => ids.add(id));
  const work = run.work.filter(w => ids.has(w.id)).map(w => ({id:w.id,inputs:w.inputs,estimate:w.estimate}));
  const missingOutcomeWork = milestones.map(m => ({id:m.id,workIds:milestoneMissingWork(run,m.id),missingProducers:scopeMissingProducers(run,{kind:'milestone',id:m.id})}));
  const capacityBoundary = capacity?.scope ? { scope:capacity.scope, release:capacity.scope.kind === 'release' ? run.releases.find(r => r.id === (capacity.scope as {id:string}).id) : undefined, missingProducers:scopeMissingProducers(run,capacity.scope) } : undefined;
  return { milestones,capacity,work,missingOutcomeWork,capacityBoundary };
}
