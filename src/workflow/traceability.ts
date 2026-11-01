import type { RunContract } from './contract.js';
import { releaseClosure } from './graph.js';
import { canonical } from './evidence.js';

/** Review navigation only: links and observations do not decide semantic coverage or authenticity. */
export function traceabilityPacket(run: RunContract, previous?: RunContract) {
  if (previous && previous.runId !== run.runId) throw new Error('TRACEABILITY_RUN_MISMATCH: Previous run must have the same runId');
  const project = (state: RunContract) => ({
    runId:state.runId,
    revision:state.revision,
    sources:state.sources,
    requirements:state.requirements.map(q => ({ ...q, outcomeIds:state.outcomes.filter(o => o.requirementIds.includes(q.id)).map(o => o.id) })),
    criteria:state.criteria.map(c => ({ ...c, effectiveReleaseRole:c.releaseRole ?? 'delivered', evidenceIds:state.evidence.filter(e => e.criterionId === c.id).map(e => e.id) })),
    targets:state.targets,
    outcomes:state.outcomes,
    releases:state.releases.map(r => ({ ...r, closure:releaseClosure(state,r.id) })),
    unmappedSourceIds:state.sources.filter(s => !state.requirements.some(q => q.sourceRefs.some(ref => ref.sourceId === s.id))).map(s => s.id),
  });
  const current = project(run);
  // Navigation for a human source reviewer, not an assessment of meaning. Keep
  // unmapped sources visible: absence of a requirement is itself a question.
  const sourceComparison = run.sources.map(source => ({
    source,
    obligations: run.requirements.filter(q => q.sourceRefs.some(ref => ref.sourceId === source.id)).map(q => ({
      id:q.id, description:q.description, mandatory:q.mandatory,
      locators:q.sourceRefs.filter(ref => ref.sourceId === source.id).map(ref => ref.locator),
      declaredReleaseIds:q.releaseIds,
      criterionIds:q.criterionIds,
    })),
  }));
  const prior = previous ? project(previous) : undefined;
  // Only changed records are retained: IDs link each mapping to its normalized records.
  const diff = <T extends { id:string }>(before: T[], after: T[]) =>
    [...new Set([...before.map(x => x.id),...after.map(x => x.id)])].flatMap(id => {
      const oldRecord = before.find(x => x.id === id) ?? null;
      const newRecord = after.find(x => x.id === id) ?? null;
      return canonical(oldRecord) === canonical(newRecord) ? [] : [{ id,before:oldRecord,after:newRecord }];
    });
  // New navigation remains field-level so unrelated records are not repeated.
  const fieldChanges = (before: Record<string,unknown> | null, after: Record<string,unknown> | null) =>
    [...new Set([...Object.keys(before ?? {}),...Object.keys(after ?? {})])].filter(key => key !== 'id').flatMap(key => {
      const beforePresent = before !== null && Object.hasOwn(before,key), afterPresent = after !== null && Object.hasOwn(after,key);
      return beforePresent === afterPresent && canonical(before?.[key]) === canonical(after?.[key]) ? [] :
        [{ field:key, beforePresent, afterPresent, before:before?.[key] ?? null, after:after?.[key] ?? null }];
    });
  const recordChanges = <T extends { id:string }>(before: T[], after: T[]) =>
    [...new Set([...before.map(x => x.id),...after.map(x => x.id)])].flatMap(id => {
      const oldRecord = before.find(x => x.id === id) ?? null, newRecord = after.find(x => x.id === id) ?? null;
      const fields = fieldChanges(oldRecord as Record<string,unknown> | null,newRecord as Record<string,unknown> | null);
      return fields.length ? [{ id, change:oldRecord === null ? 'added' : newRecord === null ? 'removed' : 'changed', fields }] : [];
    });
  const consumers = (kind:'work'|'resource'|'decision', id:string) => {
    const states = previous ? [previous,run] : [run];
    const ids = <T extends {id:string;inputs:{kind:string;id:string}[]}>(select:(s:RunContract)=>T[]) =>
      [...new Set(states.flatMap(s => select(s).filter(x => x.inputs.some(p => p.kind === kind && p.id === id)).map(x => x.id)))].sort();
    return { workIds:ids(s=>s.work),outcomeIds:ids(s=>s.outcomes),decisionIds:ids(s=>s.decisions),releaseIds:ids(s=>s.releases) };
  };
  const union = (values:string[][]) => [...new Set(values.flat())].sort();
  const states = previous ? [previous,run] : [run];
  const directWorkLinks = (id:string) => ({
    producedDecisionIds:union(states.map(s=>s.decisions.filter(d=>d.producedBy.includes(id)).map(d=>d.id))),
    producedResourceIds:union(states.map(s=>s.resources.filter(r=>(r.producedBy ?? []).includes(id)).map(r=>r.id))),
    declaredMilestoneIds:union(states.map(s=>{
      const outcomes=s.work.find(w=>w.id===id)?.outcomeIds ?? [];
      return (s.milestones ?? []).filter(m=>m.workIds.includes(id) || m.outcomeIds.some(oid=>outcomes.includes(oid))).map(m=>m.id);
    })),
  });
  const changes = prior ? {
    sources:diff(prior.sources,current.sources),
    requirements:diff(prior.requirements,current.requirements),
    criteria:diff(prior.criteria,current.criteria),
    targets:diff(prior.targets,current.targets),
    outcomes:diff(prior.outcomes,current.outcomes),
    releases:diff(prior.releases,current.releases),
    work:recordChanges(previous!.work,run.work).map(change => {
      const rows=[previous!.work.find(w=>w.id===change.id),run.work.find(w=>w.id===change.id)].filter(w=>w !== undefined);
      return { ...change, affected:{ outcomeIds:union(rows.map(w=>w.outcomeIds)),criterionIds:union(rows.map(w=>w.criterionIds)),targetIds:union(rows.map(w=>w.targetIds)),consumers:consumers('work',change.id),direct:directWorkLinks(change.id) } };
    }),
    resources:recordChanges(previous!.resources,run.resources).map(change => ({ ...change,consumers:consumers('resource',change.id),producerWorkIds:union(states.map(s=>s.resources.find(x=>x.id===change.id)?.producedBy ?? [])) })),
    decisions:recordChanges(previous!.decisions,run.decisions).map(change => ({ ...change,consumers:consumers('decision',change.id),producerWorkIds:union(states.map(s=>s.decisions.find(x=>x.id===change.id)?.producedBy ?? [])) })),
    policy:fieldChanges(previous!.policy as unknown as Record<string,unknown>,run.policy as unknown as Record<string,unknown>),
    milestones:recordChanges(previous!.milestones ?? [],run.milestones ?? []).map(change => ({ ...change,declaredWorkIds:union(states.map(s=>s.milestones?.find(x=>x.id===change.id)?.workIds ?? [])),declaredOutcomeIds:union(states.map(s=>s.milestones?.find(x=>x.id===change.id)?.outcomeIds ?? [])) })),
    capacity:fieldChanges((previous!.capacity ?? null) as Record<string,unknown> | null,(run.capacity ?? null) as Record<string,unknown> | null),
    root:fieldChanges({proofOutcomeIds:previous!.proofOutcomeIds,activeWorkIds:previous!.activeWorkIds},{proofOutcomeIds:run.proofOutcomeIds,activeWorkIds:run.activeWorkIds}),
    unmappedSourceIds:{ before:prior.unmappedSourceIds,after:current.unmappedSourceIds },
  } : undefined;
  return {
    ...current,
    sourceComparison,
    ...(changes ? { previous:{ runId:prior!.runId,revision:prior!.revision },changes } : {}),
    reviewerQuestions:[
      'Against each original source and locator, do the requirement and linked criteria preserve every obligation, qualifier, exception and release duty? Inspect unmapped, partially inspected and unread sources for omissions.',
      'For every changed or removed mapping, did any previous requirement, source reference, criterion or acceptance condition disappear or change meaning?',
      'Do the selected release closures cover all required delivered behavior and reachable recovery on the actual target, including shared criteria and dependencies?',
      'Which criteria and observations describe staging or rehearsal, and which establish the delivered production behavior? Are supporting classifications justified by the source?',
      'Does the source require a production environment, or is the actual local tool/artifact the delivered result? Verify release composition and productionRequired against that distinction; do not relabel local evidence.',
      'Do raw observations and their target, revision, lifecycle and provenance support the claim, and what remains unknown or unverified?',
    ],
  };
}
