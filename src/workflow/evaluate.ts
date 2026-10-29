import type { Boundary, CheckResult, EvaluationContext, GateResult, Prerequisite, ReviewRequest, RunAssessment, RunContract } from './contract.js';
import { authorizationBinding, check, checkpointBinding, confined, criterionGate, freshTime, gate, grantBinding, proofFingerprint, proofObservedAt, readBinding, resourceBinding } from './evidence.js';
import { proofWorkClosure, releaseClosure, validateGraph, visualTarget, workOrdered } from './graph.js';
import * as fs from 'node:fs';
import { judgmentGate, requestProblem } from './review.js';
import { parseRun } from './schema.js';

const combine = (...results: GateResult[]): GateResult => gate(results.flatMap(r => r.checks));
const pending = (code: string, subject: string, message: string): GateResult => gate([check('pending',code,subject,message)]);
const failed = (code: string, subject: string, message: string): GateResult => gate([check('fail',code,subject,message)]);
function evaluator(run: RunContract, context: EvaluationContext) {
  run = parseRun(run);
  const issues = validateGraph(run);
  const integrityChecks = issues.map(i => check('fail',i.code,i.subject,i.message,{ causes: i.causes }));
  const owners = new Map<string,string[]>();
  for (const w of run.work.filter(w => run.activeWorkIds.includes(w.id) && w.action !== 'read')) for (const file of w.files) try {
    const actual = confined(context.projectRoot,file,false);
    if (fs.existsSync(actual) && !fs.statSync(actual).isFile()) throw new Error('Owned path is not a file');
    const existing = owners.get(actual) ?? [];
    for (const other of existing) if (other !== w.id && !workOrdered(run,other,w.id)) integrityChecks.push(check('fail','WORK_OWNERSHIP_COLLISION',`${other},${w.id}`,`Unordered active mutation ownership names the same actual file: ${file}`));
    owners.set(actual,[...existing,w.id]);
  } catch (error) { integrityChecks.push(check('fail','OWNED_PATH_UNSAFE',w.id,`Unsafe owned path ${file}: ${String(error)}`)); }
  for (const source of run.sources) try { readBinding(context.projectRoot, source.binding); } catch (error) { integrityChecks.push(check('fail','SOURCE_BINDING_INVALID',source.id,String(error))); }
  const instructionSource = run.sources.find(s => s.id === run.policy.instruction.sourceId);
  if (instructionSource) try {
    const data = readBinding(context.projectRoot, instructionSource.binding).toString('utf8');
    if (!data.includes(run.policy.instruction.quote)) integrityChecks.push(check('fail','INSTRUCTION_QUOTE_MISSING','policy.instruction','The retained original source does not contain the actual user instruction quote'));
  } catch { /* source binding diagnostic above */ }
  if (!freshTime(run.policy.instruction.issuedAt, context)) integrityChecks.push(check('fail','INSTRUCTION_TIME_INVALID','policy.instruction','Instruction timestamp is invalid or in the future'));
  const integrity = gate(integrityChecks.length ? integrityChecks : [check('pass','CONTRACT_INTEGRITY','run','References, causal graph and original source bytes are coherent')]);
  const valid = integrity.status === 'pass';
  const blockedIntegrity = () => gate([check('fail','CONTRACT_INTEGRITY_REQUIRED','run','Repair contract integrity before evaluating this boundary'), ...integrity.checks.filter(c => c.status !== 'pass')]);
  const basePlanChecks: CheckResult[] = [];
  for (const source of run.sources) if (source.inspection !== 'complete') basePlanChecks.push(check('pending','SOURCE_INSPECTION_PENDING',source.id,`Original source inspection is ${source.inspection}`));
  const active = run.work.filter(w => run.activeWorkIds.includes(w.id));
  if (active.length > run.policy.budget.maxActiveWork) basePlanChecks.push(check('fail','ACTIVE_WORK_BUDGET_EXCEEDED','activeWork',`${active.length} active work items exceed ${run.policy.budget.maxActiveWork}`));
  for (const w of active) if (!w.instructions.trim()) basePlanChecks.push(check('pending','WORK_DETAIL_MISSING',w.id,'Refine the selected bounded work before execution'));
  const ownVerified = new Map(run.work.map(w => [w.id, valid ? combine(...w.criterionIds.map(id => criterionGate(run,id,context))) : blockedIntegrity()]));
  const pendingDetail = run.work.filter(w => ownVerified.get(w.id)?.status !== 'pass');
  const detailBytes = pendingDetail.reduce((n,w) => n + Buffer.byteLength(w.instructions,'utf8'),0);
  if (detailBytes > run.policy.budget.maxDetailBytes) basePlanChecks.push(check('fail','DETAIL_BUDGET_EXCEEDED','work',`${detailBytes} pending instruction bytes exceed ${run.policy.budget.maxDetailBytes}`));
  for (const w of pendingDetail) if (w.instructions.trim() && !run.activeWorkIds.includes(w.id)) basePlanChecks.push(check('fail','DEFERRED_WORK_DETAILED',w.id,'Unverified deferred work must remain bounded, without executable instructions'));
  const planReviewable = valid ? combine(integrity, gate(basePlanChecks)) : blockedIntegrity();
  const scopeRequest: ReviewRequest = { purpose: 'scope', subjectIds: run.requirements.map(q => q.id) };
  const planReviewed = valid ? combine(planReviewable,judgmentGate(run,scopeRequest,context)) : blockedIntegrity();
  const cache = new Map<string,GateResult>(); const evaluating = new Set<string>();
  const proofPreparations = proofWorkClosure(run);
  const once = (key: string, compute: () => GateResult): GateResult => {
    if (cache.has(key)) return cache.get(key)!;
    if (!valid) return blockedIntegrity();
    if (evaluating.has(key)) return failed('DEPENDENCY_CYCLE',key,'Causal dependency cycle');
    evaluating.add(key); const result = compute(); evaluating.delete(key); cache.set(key,result); return result;
  };
  const resource = (id: string): GateResult => once(`resource:${id}`, () => {
    const r = run.resources.find(r => r.id === id); if (!r) return failed('REFERENCE_UNKNOWN',id,'Unknown resource');
    if (r.status !== 'available' || !r.reference) return pending('RESOURCE_REQUIRED',id,`Required ${r.kind} resource is ${r.status}`);
    try { if (r.binding) readBinding(context.projectRoot,r.binding); if (context.host?.verifyResource?.(r,resourceBinding(run,id)) === true) return combine(...(r.producedBy ?? []).map(verified),gate([check('pass','RESOURCE_VERIFIED',id,'Host verified the actual supplied resource')])); } catch { return failed('RESOURCE_INVALID',id,'Resource binding or host verification failed'); }
    return pending('RESOURCE_UNAUTHENTICATED',id,'Host must verify the actual supplied resource');
  });
  const inputs = (rows: Prerequisite[]): GateResult => combine(...rows.map(p => p.kind === 'resource' ? resource(p.id) : p.kind === 'decision' ? decision(p.id) : p.kind === 'work' ? verified(p.id) : outcome(p.id)));
  const verified = (id: string): GateResult => ownVerified.get(id) ?? failed('REFERENCE_UNKNOWN',id,'Unknown work');
  const decisionPrerequisites = (id: string): GateResult => {
    const d = run.decisions.find(d => d.id === id); if (!d) return failed('REFERENCE_UNKNOWN',id,'Unknown decision');
    return combine(planReviewed,inputs(d.inputs),...d.producedBy.map(verified));
  };
  const decision = (id: string): GateResult => once(`decision:${id}`, () => combine(decisionPrerequisites(id),judgmentGate(run,{ purpose:'decision',subjectIds:[id] },context)));
  const semantic = (criterionIds: string[]): GateResult => combine(...criterionIds.map(id => judgmentGate(run,{ purpose:'semantic',subjectIds:[id] },context)));
  const design = (criterionIds: string[]): GateResult => combine(...criterionIds.filter(id => visualTarget(run.targets.find(t => t.id === run.criteria.find(c => c.id === id)?.targetId)?.kind ?? '')).map(id => judgmentGate(run,{ purpose:'design',subjectIds:[id] },context)));
  const outcomePrerequisites = (id: string): GateResult => {
    const o = run.outcomes.find(o => o.id === id); if (!o) return failed('REFERENCE_UNKNOWN',id,'Unknown outcome');
    return combine(planReviewed,inputs(o.inputs),...o.criterionIds.map(cid => criterionGate(run,cid,context)));
  };
  const outcome = (id: string): GateResult => once(`outcome:${id}`, () => {
    const o = run.outcomes.find(o => o.id === id); if (!o) return failed('REFERENCE_UNKNOWN',id,'Unknown outcome');
    return combine(outcomePrerequisites(id),semantic(o.criterionIds),design(o.criterionIds));
  });
  const proof = (): GateResult => once('proof', () => combine(...run.proofOutcomeIds.map(outcome)));
  const releasePrerequisites = (id: string): GateResult => {
    const r = run.releases.find(r => r.id === id); if (!r) return failed('REFERENCE_UNKNOWN',id,'Unknown release');
    const closure = releaseClosure(run,id); const production: CheckResult[] = [];
    for (const cid of closure.criterionIds) {
      const c = run.criteria.find(c => c.id === cid)!; const target = run.targets.find(t => t.id === c.targetId)!;
      if (target.providerMode !== 'real') production.push(check('pending','REAL_RELEASE_TARGET_REQUIRED',cid,'A controlled/fake/unknown target cannot establish release readiness'));
      if (target.lifecycle.stage === 'unknown' || target.lifecycle.dataPolicy === 'unknown' || !target.lifecycle.sourceRef) production.push(check('pending','RELEASE_LIFECYCLE_REQUIRED',cid,'Release needs the actual target lifecycle and retained source authority'));
      const selectedIds = new Set(criterionGate(run,cid,context).checks.flatMap(c => c.evidenceIds ?? []));
      const records = run.evidence.filter(e => selectedIds.has(e.id));
      if (!records.length || records.some(e => !e.production)) production.push(check('pending','RELEASE_COMPOSITION_REQUIRED',cid,'Every selected release observation must use the actual production composition'));
    }
    const selectedProof = run.proofOutcomeIds.filter(oid => closure.outcomeIds.includes(oid));
    return combine(planReviewed,...selectedProof.map(outcome),inputs(r.inputs),...closure.outcomeIds.map(outcome),...closure.criterionIds.map(cid => criterionGate(run,cid,context)),semantic(closure.criterionIds),design(closure.criterionIds),gate(production));
  };
  const release = (id: string): GateResult => once(`release:${id}`, () => combine(releasePrerequisites(id),judgmentGate(run,{ purpose:'release',subjectIds:[id] },context)));
  const authorization = (): GateResult => {
    if (run.policy.execution === 'plan-only') return pending('USER_PLANNING_STOP','policy','The user required a stop after planning');
    try { if (context.host?.verifyAuthorization(run.policy.instruction,authorizationBinding(run)) === true) return gate([check('pass','EXECUTION_AUTHENTICATED','policy','Host verified the original execution instruction')]); } catch { /* fail closed */ }
    return pending('EXECUTION_UNAUTHENTICATED','policy','Original execution instruction needs host authentication');
  };
  const executable = (id: string): GateResult => once(`execute:${id}`, () => {
    const w = run.work.find(w => w.id === id); if (!w) return failed('REFERENCE_UNKNOWN',id,'Unknown work');
    if (verified(id).status === 'pass') return gate([check('not-applicable','WORK_ALREADY_VERIFIED',id,'Current work outputs already have verified observations')]);
    const checks: CheckResult[] = [];
    if (!run.activeWorkIds.includes(id)) checks.push(check('pending','WORK_NOT_ACTIVE',id,'Select and refine this bounded work before execution'));
    if (!w.instructions.trim()) checks.push(check('pending','WORK_DETAIL_MISSING',id,'Executable instructions are deferred'));
    if (!proofPreparations.has(w.id) && proof().status !== 'pass') checks.push(check('pending','FIRST_PROOF_REQUIRED',id,'Accept the first useful proof before expanding independent breadth'));
    for (const tid of w.targetIds) {
      const t = run.targets.find(t => t.id === tid)!;
      if (!t.identity || t.environment === 'unknown') checks.push(check('pending','TARGET_UNRESOLVED',tid,'Actual target identity/environment is required for this work'));
      if (w.action === 'local-write' && (t.lifecycle.stage === 'live' || t.environment === 'production')) checks.push(check('fail','ACTION_TARGET_MISMATCH',id,'Local mutation cannot name a live/production target; classify and authorize the actual operation'));
      if (w.action !== 'read' && (t.lifecycle.stage === 'unknown' || t.lifecycle.dataPolicy === 'unknown' || !t.lifecycle.sourceRef)) checks.push(check('pending','LIFECYCLE_REQUIRED',tid,'Mutation needs the actual target lifecycle and retained source authority'));
      if (['live-write','deploy','send','spend','delete'].includes(w.action)) {
        const grant = run.policy.grants.find(g => g.targetIds.includes(tid) && g.actions.includes(w.action));
        let authenticated = false; try { authenticated = !!grant && context.host?.verifyGrant?.(grant,grantBinding(run,grant.id)) === true; } catch { /* fail closed */ }
        if (!authenticated) checks.push(check('pending','ACTION_AUTHORITY_REQUIRED',id,`Actual ${w.action} authority for ${tid} is missing or unverified`));
        if (w.action === 'delete' && (t.lifecycle.stage !== 'pre-launch' || t.lifecycle.dataPolicy !== 'disposable')) checks.push(check('pending','RETAINED_DELETION_UNSUPPORTED',tid,'Retained/live deletion needs a separately reviewed recovery and preservation contract'));
      }
    }
    if (run.policy.checkpoints === 'every-proof' && proof().status === 'pass' && !proofPreparations.has(w.id)) {
      const acknowledgment = run.policy.checkpointAcknowledgment;
      let acknowledged = false;
      if (acknowledgment && acknowledgment.proofFingerprint === proofFingerprint(run)) try {
        const actual = readBinding(context.projectRoot,acknowledgment.instruction.source).toString('utf8');
        acknowledged = actual.includes(acknowledgment.instruction.quote) && freshTime(acknowledgment.instruction.issuedAt,context) && Date.parse(acknowledgment.instruction.issuedAt) >= proofObservedAt(run) && context.host?.verifyCheckpoint?.(acknowledgment,checkpointBinding(run)) === true;
      } catch { /* actual instruction and authenticated named proof are required */ }
      if (!acknowledged) checks.push(check('pending','USER_CHECKPOINT_REQUIRED',id,'A user-reserved checkpoint needs a current host-authenticated acknowledgment of this exact proof'));
    }
    return combine(planReviewed,authorization(),inputs(w.inputs),gate(checks));
  });
  const reviewReady = (request: ReviewRequest): GateResult => {
    const problem = requestProblem(run,request); if (problem) return failed('REVIEW_SUBJECT_INVALID',request.purpose,problem);
    if (request.purpose === 'scope') return planReviewable;
    if (request.purpose === 'decision') return combine(...request.subjectIds.map(decisionPrerequisites));
    if (request.purpose === 'release') return combine(...request.subjectIds.map(releasePrerequisites));
    const affectedOutcomes = run.outcomes.filter(o => o.criterionIds.some(id => request.subjectIds.includes(id)));
    const ownEvidence = request.subjectIds.map(id => criterionGate(run,id,context));
    return combine(planReviewed,...ownEvidence,...affectedOutcomes.map(o => inputs(o.inputs)));
  };
  return { integrity,planReviewable,planReviewed,verified,executable,decision,outcome,release,proof,reviewReady };
}

export function evaluateRun(run: RunContract, context: EvaluationContext): RunAssessment {
  const e = evaluator(run,context);
  const work = Object.fromEntries(run.work.map(w => [w.id,{ executable:e.executable(w.id),verified:e.verified(w.id) }]));
  return { runId:run.runId,revision:run.revision,integrity:e.integrity,planReviewable:e.planReviewable,planReviewed:e.planReviewed,proof:e.proof(),work,
    decisions:Object.fromEntries(run.decisions.map(d => [d.id,e.decision(d.id)])),outcomes:Object.fromEntries(run.outcomes.map(o => [o.id,e.outcome(o.id)])),releases:Object.fromEntries(run.releases.map(r => [r.id,e.release(r.id)])),
    executableNow:run.work.filter(w => work[w.id].executable.status === 'pass').map(w => w.id) };
}
export function evaluateBoundary(run: RunContract, boundary: Boundary, context: EvaluationContext): GateResult {
  const e = evaluator(run,context);
  switch (boundary.kind) {
    case 'plan-reviewable': return e.planReviewable;
    case 'plan-reviewed': return e.planReviewed;
    case 'proof': return e.proof();
    case 'work-executable': return e.executable(boundary.id);
    case 'work-verified': return e.verified(boundary.id);
    case 'outcome': return e.outcome(boundary.id);
    case 'decision': return e.decision(boundary.id);
    case 'release': return e.release(boundary.id);
  }
}
export function reviewPrerequisites(run: RunContract, request: ReviewRequest, context: EvaluationContext): GateResult { return evaluator(run,context).reviewReady(request); }
