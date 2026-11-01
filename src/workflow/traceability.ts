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
  const prior = previous ? project(previous) : undefined;
  // Only changed records are retained: IDs link each mapping to its normalized records.
  const diff = <T extends { id:string }>(before: T[], after: T[]) =>
    [...new Set([...before.map(x => x.id),...after.map(x => x.id)])].flatMap(id => {
      const oldRecord = before.find(x => x.id === id) ?? null;
      const newRecord = after.find(x => x.id === id) ?? null;
      return canonical(oldRecord) === canonical(newRecord) ? [] : [{ id,before:oldRecord,after:newRecord }];
    });
  const changes = prior ? {
    sources:diff(prior.sources,current.sources),
    requirements:diff(prior.requirements,current.requirements),
    criteria:diff(prior.criteria,current.criteria),
    targets:diff(prior.targets,current.targets),
    outcomes:diff(prior.outcomes,current.outcomes),
    releases:diff(prior.releases,current.releases),
    unmappedSourceIds:{ before:prior.unmappedSourceIds,after:current.unmappedSourceIds },
  } : undefined;
  return {
    ...current,
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
