import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import type { CheckResult, Criterion, EvaluationContext, Evidence, EvidenceBinding, FileBinding, GateResult, ReviewBinding, ReviewRequest, RunContract, Status } from './contract.js';
import { WorkflowError } from './schema.js';
import { dependencyClosure, proofWorkClosure, releaseClosure } from './graph.js';

export function canonical(value: unknown): string {
  if (value === undefined) return 'null';
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a],[b]) => a.localeCompare(b)).map(([k,v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export const sha256 = (data: string | Buffer): string => createHash('sha256').update(data).digest('hex');
export const digest = (value: unknown): string => sha256(canonical(value));
export function confined(root: string, relative: string, mustExist = true): string {
  if (!relative || path.isAbsolute(relative) || relative.includes('\\')) throw new WorkflowError('PATH_UNSAFE', `Expected relative path: ${relative}`);
  const base = fs.realpathSync(root); const candidate = path.resolve(base, relative);
  if (candidate !== base && !candidate.startsWith(base + path.sep)) throw new WorkflowError('PATH_UNSAFE', `Path escapes project: ${relative}`);
  let real: string;
  if (mustExist) real = fs.realpathSync(candidate);
  else {
    let existing = candidate;
    while (true) {
      try { fs.lstatSync(existing); break; }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
        const parent = path.dirname(existing); if (parent === existing) throw error; existing = parent;
      }
    }
    const actual = fs.realpathSync(existing);
    if (existing !== candidate && !fs.statSync(existing).isDirectory()) throw new WorkflowError('PATH_UNSAFE', `Owned path has a non-directory parent: ${relative}`);
    real = path.join(actual,path.relative(existing,candidate));
  }
  if (real !== base && !real.startsWith(base + path.sep)) throw new WorkflowError('PATH_UNSAFE', `Symlink escapes project: ${relative}`);
  return real;
}
export function readBinding(root: string, binding: FileBinding): Buffer {
  const file = confined(root, binding.path);
  if (!fs.statSync(file).isFile()) throw new WorkflowError('BINDING_INVALID', `Not a regular file: ${binding.path}`);
  const data = fs.readFileSync(file);
  if (!data.length || sha256(data) !== binding.sha256) throw new WorkflowError('BINDING_STALE', `Missing, empty or changed bytes: ${binding.path}`);
  return data;
}
/** Scope binds source meaning and the complete declared contract, never mutable receipts. */
export function scopeFingerprint(run: RunContract): string {
  const { checkpointAcknowledgment, ...policy } = run.policy;
  return digest({ runId: run.runId, sources: run.sources, requirements: run.requirements,
    targets: run.targets.map(({ bindings, revision, ...t }) => t),
    criteria: run.criteria.map(({ inputs, ...c }) => c),
    outcomes: run.outcomes, work: run.work.map(({ instructions, files, estimate, ...w }) => w),
    resources: run.resources.map(({ status, reference, binding, ...r }) => r),
    decisions: run.decisions, releases: run.releases, policy, proofOutcomeIds: run.proofOutcomeIds });
}
export function authorizationBinding(run: RunContract): { runId: string; fingerprint: string } { const { checkpointAcknowledgment, ...policy } = run.policy; return { runId:run.runId,fingerprint:digest({ runId:run.runId,instruction:run.policy.instruction,policy,sources:run.sources.map(s => s.binding) }) }; }
function proofInputs(run: RunContract) {
  const work = proofWorkClosure(run);
  const closure = dependencyClosure(run,[...run.proofOutcomeIds.map(id => ({ kind:'outcome' as const,id })),...[...work].map(id => ({ kind:'work' as const,id }))]);
  return { scope:scopeFingerprint(run),proofOutcomeIds:run.proofOutcomeIds,closure,
    bindings:closure.criterionIds.map(id => evidenceBinding(run,id)),evidence:run.evidence.filter(e => closure.criterionIds.includes(e.criterionId)),
    judgments:run.judgments.filter(j => j.purpose === 'scope' || (j.purpose === 'semantic' || j.purpose === 'design') && j.subjectIds.some(id => closure.criterionIds.includes(id)) || j.purpose === 'decision' && j.subjectIds.some(id => closure.decisionIds.includes(id))) };
}
export const proofFingerprint = (run: RunContract): string => digest(proofInputs(run));
export function proofObservedAt(run: RunContract): number { const inputs = proofInputs(run); return Math.max(...inputs.evidence.map(e => Date.parse(e.observedAt)),...inputs.judgments.map(j => Date.parse(j.observedAt)),0); }
export function checkpointBinding(run: RunContract): { runId: string; proofFingerprint: string; fingerprint: string } { const proof = proofFingerprint(run); return { runId:run.runId,proofFingerprint:proof,fingerprint:digest({ runId:run.runId,proofFingerprint:proof,acknowledgment:run.policy.checkpointAcknowledgment }) }; }
function targetAuthorityContext(run: RunContract, targetId: string) {
  const target = run.targets.find(t => t.id === targetId);
  if (!target) throw new WorkflowError('REFERENCE_UNKNOWN', `Unknown target ${targetId}`);
  const { bindings,revision,...context } = target;
  return context;
}
function authoritySources(run: RunContract, ids: string[]) { return run.sources.filter(s => ids.includes(s.id)).map(s => ({ id:s.id,binding:s.binding,authority:s.authority })); }
export function resourceBinding(run: RunContract, id: string): { runId: string; fingerprint: string } {
  const resource = run.resources.find(r => r.id === id);
  if (!resource) throw new WorkflowError('REFERENCE_UNKNOWN', `Unknown resource ${id}`);
  const target = targetAuthorityContext(run,resource.targetId);
  return { runId:run.runId,fingerprint:digest({ runId:run.runId,resource,target,sources:authoritySources(run,[...resource.sourceRefs.map(r => r.sourceId),...(target.lifecycle.sourceRef ? [target.lifecycle.sourceRef.sourceId] : [])]) }) };
}
export function grantBinding(run: RunContract, id: string): { runId: string; fingerprint: string } {
  const grant = run.policy.grants.find(g => g.id === id);
  if (!grant) throw new WorkflowError('REFERENCE_UNKNOWN', `Unknown grant ${id}`);
  const targets = grant.targetIds.map(id => targetAuthorityContext(run,id));
  return { runId:run.runId,fingerprint:digest({ runId:run.runId,grant,instruction:run.policy.instruction,targets,sources:authoritySources(run,[grant.sourceRef.sourceId,run.policy.instruction.sourceId,...targets.flatMap(t => t.lifecycle.sourceRef ? [t.lifecycle.sourceRef.sourceId] : [])]) }) };
}
export function evidenceBinding(run: RunContract, criterionId: string): EvidenceBinding {
  const criterion = run.criteria.find(c => c.id === criterionId);
  if (!criterion) throw new WorkflowError('REFERENCE_UNKNOWN', `Unknown criterion ${criterionId}`);
  const target = run.targets.find(t => t.id === criterion.targetId);
  const requirements = run.requirements.filter(q => q.criterionIds.includes(criterionId));
  const sourceIds = new Set(requirements.flatMap(q => q.sourceRefs.map(r => r.sourceId)));
  const outcomes = run.outcomes.filter(o => o.criterionIds.includes(criterionId));
  const work = run.work.filter(w => w.criterionIds.includes(criterionId)).map(({ estimate, ...w }) => w);
  return { runId: run.runId, criterionId, targetId: criterion.targetId, fingerprint: digest({ runId: run.runId, criterion, target, requirements, sources: run.sources.filter(s => sourceIds.has(s.id)), work, outcomeDependencies: outcomes.map(o => ({ id: o.id, inputs: o.inputs })) }) };
}
export function reviewBinding(run: RunContract, request: ReviewRequest): ReviewBinding {
  const subjectIds = [...request.subjectIds].sort();
  let inputs: unknown;
  if (request.purpose === 'scope') inputs = scopeFingerprint(run);
  else if (request.purpose === 'semantic' || request.purpose === 'design') inputs = subjectIds.map(id => ({ binding: evidenceBinding(run, id), evidence: run.evidence.filter(e => e.criterionId === id && e.fingerprint === evidenceBinding(run, id).fingerprint) }));
  else if (request.purpose === 'decision') inputs = subjectIds.map(id => {
    const decision = run.decisions.find(d => d.id === id);
    const workIds = decision?.producedBy ?? [];
    const criteria = run.work.filter(w => workIds.includes(w.id)).flatMap(w => w.criterionIds);
    return { decision, sources: run.sources, producerEvidence: run.evidence.filter(e => criteria.includes(e.criterionId)), resources: run.resources.filter(r => decision?.inputs.some(p => p.kind === 'resource' && p.id === r.id)) };
  });
  else inputs = subjectIds.map(id => {
    const closure = releaseClosure(run, id);
    return { release: run.releases.find(r => r.id === id), closure, scope: scopeFingerprint(run),
      bindings: closure.criterionIds.map(cid => evidenceBinding(run, cid)), evidence: run.evidence.filter(e => closure.criterionIds.includes(e.criterionId)),
      judgments: run.judgments.filter(j => j.purpose !== 'release' && (j.purpose === 'scope' || j.subjectIds.some(s => closure.criterionIds.includes(s)) || j.purpose === 'decision' && j.subjectIds.some(s => closure.decisionIds.includes(s)))) };
  });
  return { runId: run.runId, purpose: request.purpose, subjectIds, fingerprint: digest({ runId: run.runId, purpose: request.purpose, subjectIds, inputs }) };
}
export function gate(checks: CheckResult[]): GateResult {
  const priority: Status[] = ['fail','pending','unassessed'];
  const status = priority.find(s => checks.some(c => c.status === s)) ?? (checks.length && checks.every(c => c.status === 'not-applicable') ? 'not-applicable' : 'pass');
  return { status, checks };
}
export const check = (status: Status, code: string, subject: string, message: string, extra: Partial<CheckResult> = {}): CheckResult => ({ status, code, subject, message, ...extra });
export function freshTime(value: string, context: EvaluationContext): boolean { const time = Date.parse(value); return Number.isFinite(time) && time <= (context.now ?? new Date()).getTime() + 60_000; }
function image(data: Buffer): boolean {
  return data.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])) || data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff || ['GIF87a','GIF89a'].includes(data.subarray(0,6).toString()) || data.subarray(0,4).toString() === 'RIFF' && data.subarray(8,12).toString() === 'WEBP';
}
function junitCases(xml: string): { collected: number; failed: number; passed: number } {
  const token = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+/gy;
  const stack: string[] = []; let root = ''; let ended = false; let cursor = 0;
  let current: { failed: boolean; skipped: boolean } | undefined;
  let collected = 0; let failed = 0; let skipped = 0; let passed = 0;
  let totals: Record<string,string> = {};
  const finishCase = () => { if (!current) throw new Error('Malformed JUnit testcase'); if (current.failed) failed++; else if (current.skipped) skipped++; else passed++; current = undefined; };
  for (;;) {
    token.lastIndex = cursor; const match = token.exec(xml); if (!match) break;
    const value = match[0]; cursor = token.lastIndex;
    if (value.startsWith('<!--') || value.startsWith('<?')) continue;
    if (value.startsWith('<![CDATA[')) { if (!stack.length) throw new Error('JUnit content outside root'); continue; }
    if (!value.startsWith('<')) { if (!stack.length && value.trim()) throw new Error('JUnit content outside root'); continue; }
    if (value.startsWith('</')) {
      const name = /^<\/([A-Za-z_][\w:.-]*)\s*>$/.exec(value)?.[1];
      if (!name || stack.pop() !== name) throw new Error('Malformed JUnit nesting');
      if (name === 'testcase') finishCase(); if (!stack.length) ended = true; continue;
    }
    const opening = /^<([A-Za-z_][\w:.-]*)([\s\S]*?)(\/?)>$/.exec(value);
    if (!opening || ended) throw new Error('Malformed or unsupported JUnit XML');
    const [,name,attributes,selfClosing] = opening;
    const attrPattern = /([A-Za-z_][\w:.-]*)\s*=\s*(["'])([\s\S]*?)\2/g;
    const attrs: Record<string,string> = {};
    for (const attr of attributes.matchAll(attrPattern)) { if (attr[1] in attrs) throw new Error('Duplicate JUnit attribute'); attrs[attr[1]] = attr[3]; }
    if (attributes.replace(attrPattern,'').trim()) throw new Error('Malformed JUnit attributes');
    if (!stack.length) { if (root || !['testsuite','testsuites'].includes(name)) throw new Error('Not a JUnit suite'); root = name; totals = attrs; }
    if (name === 'testcase') { if (current) throw new Error('Nested JUnit testcase'); current = { failed:false,skipped:false }; collected++; }
    if (['failure','error'].includes(name)) {
      if (!current) throw new WorkflowError('TEST_RECEIPT_INVALID', 'JUnit reports a suite-level failure or error');
      current.failed = true;
    }
    if (current && name === 'skipped') current.skipped = true;
    if (selfClosing) { if (name === 'testcase') finishCase(); if (!stack.length) ended = true; }
    else stack.push(name);
  }
  if (cursor !== xml.length || !root || !ended || stack.length || current) throw new Error('Incomplete JUnit XML');
  for (const key of ['tests','failures','errors','skipped']) if (totals[key] !== undefined && !/^\d+$/.test(totals[key])) throw new Error('Invalid JUnit totals');
  if (totals.tests !== undefined && Number(totals.tests) !== collected || totals.skipped !== undefined && Number(totals.skipped) !== skipped || (totals.failures !== undefined || totals.errors !== undefined) && Number(totals.failures ?? 0) + Number(totals.errors ?? 0) !== failed) throw new Error('JUnit totals contradict actual test cases');
  return { collected,failed,passed };
}
function validateTest(e: Evidence, criterion: Criterion, data: Buffer, context: EvaluationContext): void {
  if (!e.test || e.test.collected < (criterion.minimumCollected ?? 1) || e.test.failed !== 0 || e.test.exitCode !== 0) throw new WorkflowError('TEST_RECEIPT_INVALID', 'Substantive tests require positive executed collection, zero failures and a successful exit');
  let collected: number; let failed: number; let passed: number;
  if (e.test.format === 'vitest-json') {
    const value = JSON.parse(data.toString('utf8'));
    const count = (key: string, fallback?: number): number => { const n = value[key] ?? fallback; if (!Number.isSafeInteger(n) || n < 0) throw new WorkflowError('TEST_RECEIPT_INVALID', `Invalid runner count ${key}`); return n; };
    collected = count('numTotalTests'); failed = count('numFailedTests');
    const pending = count('numPendingTests',0); const todo = count('numTodoTests',0);
    if (value.success !== true || count('numRuntimeErrorTestSuites',0) > 0 || count('numFailedTestSuites',0) > 0) throw new WorkflowError('TEST_RECEIPT_INVALID','Runner reports failure');
    // Summary counters alone are neither collection nor execution evidence.
    if (!Array.isArray(value.testResults) || !value.testResults.length) throw new WorkflowError('TEST_ASSERTIONS_MISSING','Actual runner suite/assertion records are required');
    const assertions: { status: string }[] = [];
    const boundPaths = new Set(criterion.inputs.map(b => confined(context.projectRoot,b.path)));
    for (const suite of value.testResults) {
      if (!suite || suite.status !== 'passed' || typeof suite.name !== 'string' || !Array.isArray(suite.assertionResults)) throw new WorkflowError('TEST_RECEIPT_INVALID','Actual runner suite is missing or failed');
      const actualSuite = path.isAbsolute(suite.name) ? fs.realpathSync(suite.name) : confined(context.projectRoot,suite.name);
      if (!boundPaths.has(actualSuite)) throw new WorkflowError('TEST_INPUT_UNBOUND','The actual test suite must be bound among criterion inputs');
      for (const assertion of suite.assertionResults) {
        if (!assertion || typeof assertion.fullName !== 'string' || !assertion.fullName.trim() || !['passed','failed','skipped','pending','todo'].includes(assertion.status) || !Array.isArray(assertion.failureMessages) || assertion.failureMessages.some((m: unknown) => typeof m !== 'string') || assertion.status === 'passed' && assertion.failureMessages.length) throw new WorkflowError('TEST_RECEIPT_INVALID','Malformed or contradictory actual assertion result');
        assertions.push(assertion);
      }
    }
    passed = assertions.filter(a => a.status === 'passed').length;
    if (assertions.length !== collected || assertions.filter(a => a.status === 'failed').length !== failed || assertions.filter(a => ['skipped','pending'].includes(a.status)).length !== pending || assertions.filter(a => a.status === 'todo').length !== todo || count('numPassedTests') !== passed) throw new WorkflowError('TEST_RECEIPT_CONTRADICTED','Actual assertion records contradict runner totals');
  } else ({ collected,failed,passed } = junitCases(data.toString('utf8')));
  if (!Number.isSafeInteger(collected) || !Number.isSafeInteger(failed) || collected !== e.test.collected || failed !== e.test.failed) throw new WorkflowError('TEST_RECEIPT_CONTRADICTED', 'Raw runner output contradicts declared collection/failure counts');
  if (passed < (criterion.minimumCollected ?? 1)) throw new WorkflowError('TEST_EXECUTION_MISSING','Substantive evidence requires positive actually executed passing cases; skipped/todo cases do not count');
}
export function validateEvidence(run: RunContract, e: Evidence, context: EvaluationContext): CheckResult {
  try {
    const criterion = run.criteria.find(c => c.id === e.criterionId);
    if (!criterion) throw new WorkflowError('REFERENCE_UNKNOWN', 'Unknown criterion');
    const target = run.targets.find(t => t.id === criterion.targetId)!;
    const binding = evidenceBinding(run, criterion.id);
    if (e.targetId !== criterion.targetId || e.fingerprint !== binding.fingerprint) throw new WorkflowError('EVIDENCE_STALE', 'Evidence binds another target or outdated inputs');
    if (!target.identity || target.environment === 'unknown' || target.providerMode === 'unknown' || !target.revision || !target.bindings.length) throw new WorkflowError('TARGET_UNRESOLVED', 'Actual target identity, revision and input/config bindings are required');
    for (const b of [...target.bindings, ...criterion.inputs]) readBinding(context.projectRoot, b);
    if (!freshTime(e.observedAt, context)) throw new WorkflowError('OBSERVATION_TIME_INVALID', 'Observation timestamp is invalid or in the future');
    if (context.host?.verifyEvidence(e, binding) !== true) return check('pending','EVIDENCE_UNAUTHENTICATED', e.id, 'Actual observer receipt is missing or unverified');
    const data = readBinding(context.projectRoot, e.artifact);
    if (e.result !== 'pass') return check('fail','OBSERVED_FAILURE', criterion.id, 'Actual observation failed', { evidenceIds: [e.id] });
    if (!criterion.evidenceKinds.includes(e.kind)) throw new WorkflowError('EVIDENCE_KIND_WRONG', 'Evidence kind is outside the criterion contract');
    if (criterion.productionRequired && (!e.production || target.providerMode !== 'real' || target.environment !== 'production')) throw new WorkflowError('PRODUCTION_PROOF_MISSING', 'Criterion requires the actual production composition');
    if (e.kind === 'image' && (!image(data) || !e.capture?.composed)) throw new WorkflowError('CAPTURE_INVALID', 'A composed capture requires a real image and state/context metadata');
    if (e.kind === 'consumer' && !e.consumer?.trim()) throw new WorkflowError('CONSUMER_MISSING', 'Actual consumer identity is required');
    if (e.kind === 'test') validateTest(e, criterion, data, context);
    return check('pass','EVIDENCE_VERIFIED', criterion.id, 'Current target-bound observer receipt and raw artifact verified', { evidenceIds: [e.id] });
  } catch (error) { return check('fail', error instanceof WorkflowError ? error.code : 'EVIDENCE_INVALID', e.id, error instanceof Error ? error.message : String(error)); }
}
export function criterionGate(run: RunContract, criterionId: string, context: EvaluationContext): GateResult {
  const criterion = run.criteria.find(c => c.id === criterionId);
  if (!criterion) return gate([check('fail','REFERENCE_UNKNOWN', criterionId, 'Unknown criterion')]);
  const fingerprint = evidenceBinding(run, criterionId).fingerprint;
  const current = run.evidence.filter(e => e.criterionId === criterionId && e.fingerprint === fingerprint);
  const checks: CheckResult[] = [];
  const pick = (kind: string, capture?: { state: string; context: string }) => {
    const candidates = current.filter(e => e.kind === kind && (!capture || e.capture?.state === capture.state && e.capture.context === capture.context));
    if (!candidates.length) checks.push(check('pending','EVIDENCE_MISSING', criterionId, `Missing current ${kind}${capture ? ` ${capture.state}/${capture.context}` : ''} observation`));
    else {
      // An ID is not a clock. Contradictory same-time observations stay failed.
      const invalidTime = candidates.filter(e => !Number.isFinite(Date.parse(e.observedAt)));
      const latest = Math.max(...candidates.map(e => Date.parse(e.observedAt)).filter(Number.isFinite));
      for (const e of [...invalidTime,...candidates.filter(e => Date.parse(e.observedAt) === latest)]) checks.push(validateEvidence(run,e,context));
    }
  };
  for (const kind of criterion.evidenceKinds) if (kind !== 'image' || !criterion.captures?.length) pick(kind);
  for (const c of criterion.captures ?? []) pick('image', c);
  return gate(checks);
}
