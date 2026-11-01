import type { EvaluationContext, GateResult, Judgment, ReviewPlan, ReviewRequest, Role, RunContract } from './contract.js';
import { canonical, check, freshTime, gate, reviewBinding } from './evidence.js';
import { reviewPrerequisites } from './evaluate.js';

const same = (a: string[], b: string[]) => canonical([...a].sort()) === canonical([...b].sort());
export function requiredRoles(run: RunContract, request: ReviewRequest): Role[] {
  if (request.purpose === 'decision') return [...new Set(run.decisions.filter(d => request.subjectIds.includes(d.id)).flatMap(d => d.requiredRoles))];
  return run.policy.reviews[request.purpose];
}
export function requestProblem(run: RunContract, request: ReviewRequest): string | undefined {
  const ids = request.purpose === 'scope' ? run.requirements.map(q => q.id) : request.purpose === 'semantic' || request.purpose === 'design' ? run.criteria.map(c => c.id) : request.purpose === 'decision' ? run.decisions.map(d => d.id) : run.releases.map(r => r.id);
  if (!request.subjectIds.length || new Set(request.subjectIds).size !== request.subjectIds.length || request.subjectIds.some(id => !ids.includes(id))) return 'Review subjects are empty, duplicated or unknown';
  if (request.purpose === 'scope' && !same(request.subjectIds, ids)) return 'Original-source scope review must cover every retained requirement';
  return undefined;
}
/** Only host-authenticated, current receipts establish an actual reviewer judgment. */
export function currentJudgments(run: RunContract, request: ReviewRequest, context: EvaluationContext): Judgment[] {
  return run.judgments.filter(j => {
    if (j.purpose !== request.purpose || !j.subjectIds.some(id => request.subjectIds.includes(id)) || requestProblem(run, j)) return false;
    if (request.purpose === 'scope' && !same(j.subjectIds, request.subjectIds)) return false;
    if (!freshTime(j.observedAt, context)) return false;
    if (j.reviewer.role === 'independent' && (j.reviewer.contextId === run.policy.implementerContextId || j.reviewer.id === run.policy.implementerId)) return false;
    try { const binding = reviewBinding(run, j); return j.fingerprint === binding.fingerprint && context.host?.verifyJudgment(j, binding) === true; } catch { return false; }
  });
}
export function judgmentGate(run: RunContract, request: ReviewRequest, context: EvaluationContext): GateResult {
  const problem = requestProblem(run, request);
  if (problem) return gate([check('fail','REVIEW_SUBJECT_INVALID', request.purpose, problem)]);
  const current = currentJudgments(run, request, context);
  const checks = [];
  for (const id of request.subjectIds) {
    const applicable = current.filter(j => j.subjectIds.includes(id));
    const rejected = applicable.filter(j => j.result === 'rejected' || j.findings.some(f => ['P0','P1'].includes(f.severity) && (!f.criterionIds.length || f.criterionIds.includes(id) || request.purpose === 'scope' || request.purpose === 'release' || request.purpose === 'decision')));
    if (rejected.length) { checks.push(check('fail','CURRENT_REVIEW_REJECTED', id, 'A current authenticated rejection or unresolved blocking finding remains', { judgmentIds: rejected.map(j => j.id) })); continue; }
    const roles = request.purpose === 'decision' ? run.decisions.find(d => d.id === id)!.requiredRoles : requiredRoles(run, request);
    for (const role of roles) {
      const approved = applicable.filter(j => j.result === 'approved' && (j.reviewer.role === role || role === 'agent' && ['owner','independent'].includes(j.reviewer.role)));
      checks.push(approved.length ? check('pass','REVIEW_RECORDED', id, `Current authenticated ${role} ${request.purpose} judgment recorded`, { judgmentIds: approved.map(j => j.id) }) : check('pending','REVIEW_REQUIRED', id, `Missing current authenticated ${role} ${request.purpose} judgment`));
    }
  }
  return gate(checks);
}
export function planReview(run: RunContract, request: ReviewRequest, context: EvaluationContext): ReviewPlan {
  const problem = requestProblem(run, request);
  const prerequisites = problem ? gate([check('fail','REVIEW_SUBJECT_INVALID', request.purpose, problem)]) : reviewPrerequisites(run, request, context);
  // Invalid selections must never create a plausible empty-scope binding.
  const binding = problem ? { runId: run.runId, ...request, fingerprint: '' } : reviewBinding(run, request);
  const current = problem ? [] : currentJudgments(run, request, context);
  const judgments = problem ? prerequisites : judgmentGate(run, request, context);
  const missingRoles = problem ? [] : requiredRoles(run, request).filter(role => request.subjectIds.some(id => !current.some(j => j.subjectIds.includes(id) && j.result === 'approved' && (j.reviewer.role === role || role === 'agent' && ['owner','independent'].includes(j.reviewer.role)))));
  return { action: prerequisites.status !== 'pass' || judgments.status === 'fail' ? 'blocked' : judgments.status === 'pass' ? 'reuse' : 'review', binding, missingRoles, judgmentIds: current.map(j => j.id), prerequisites };
}
