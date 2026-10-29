import type { RunContract } from './contract.js';

export class WorkflowError extends Error {
  constructor(public readonly code: string, message: string) { super(`${code}: ${message}`); this.name = 'WorkflowError'; }
}
type Row = Record<string, any>;
function assert(ok: unknown, at: string, message: string): asserts ok { if (!ok) throw new WorkflowError('CONTRACT_INVALID', `${at}: ${message}`); }
function shape(value: unknown, fields: string, required: string, at: string): Row {
  assert(!!value && typeof value === 'object' && !Array.isArray(value), at, 'expected object');
  const row = value as Row;
  assert(Object.keys(row).every(k => fields.split(' ').includes(k)), at, 'unknown field');
  assert(required.split(' ').filter(Boolean).every(k => k in row), at, 'missing field');
  return row;
}
const text = (value: unknown, max = 2000): value is string => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
const hash = (value: unknown): value is string => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const strings = (value: unknown, empty = true): value is string[] => Array.isArray(value) && (empty || value.length > 0) && value.every(v => text(v)) && new Set(value).size === value.length;
const choices = (value: unknown, values: string[]) => typeof value === 'string' && values.includes(value);
const integer = (value: unknown, min = 0): value is number => Number.isSafeInteger(value) && Number(value) >= min;
const refs = (value: unknown, at: string) => { assert(Array.isArray(value), at, 'expected refs'); for (const ref of value) sourceRef(ref, at); };
function sourceRef(value: unknown, at: string): void { const r = shape(value, 'sourceId locator', 'sourceId locator', at); assert(text(r.sourceId) && text(r.locator), at, 'invalid source location'); }
export function isRelativePath(value: unknown): value is string {
  return text(value, 1000) && !value.startsWith('/') && !value.includes('\\') && !/^[A-Za-z]:/.test(value) && !value.split('/').includes('..') && !value.includes('\0');
}
function binding(value: unknown, at: string): void { const b = shape(value, 'path sha256', 'path sha256', at); assert(isRelativePath(b.path) && hash(b.sha256), at, 'invalid relative path or SHA-256'); }
function bindings(value: unknown, at: string): void { assert(Array.isArray(value), at, 'expected bindings'); for (const b of value) binding(b, at); assert(new Set(value.map(b => b.path)).size === value.length, at, 'duplicate binding path'); }
function rows(value: unknown, at: string): Row[] {
  assert(Array.isArray(value), at, 'expected array');
  assert(value.every(v => !!v && typeof v === 'object' && !Array.isArray(v) && text(v.id)), at, 'rows require IDs');
  assert(new Set(value.map(v => v.id)).size === value.length, at, 'duplicate ID'); return value;
}
function inputs(value: unknown, at: string): void {
  assert(Array.isArray(value), at, 'expected prerequisites');
  for (const input of value) { const p = shape(input, 'kind id', 'kind id', at); assert(choices(p.kind, ['resource','decision','work','outcome']) && text(p.id), at, 'invalid prerequisite'); }
  assert(new Set(value.map(p => `${p.kind}:${p.id}`)).size === value.length, at, 'duplicate prerequisite');
}
const roles = (value: unknown, at: string) => assert(strings(value, false) && value.every(v => ['owner','independent','agent'].includes(v)), at, 'nonempty review roles required');
function capture(value: unknown, at: string): void { const c = shape(value, 'state context composed', 'state context composed', at); assert(choices(c.state, ['entry','success','recovery']) && text(c.context) && typeof c.composed === 'boolean', at, 'invalid capture'); }
function range(value: unknown): boolean { return value === null || Array.isArray(value) && value.length === 2 && value.every(n => typeof n === 'number' && Number.isFinite(n) && n >= 0) && value[0] <= value[1]; }
const actionKinds = ['read','local-write','live-write','deploy','send','spend','delete'];
const evidenceKinds = ['execution','consumer','image','operation','build','test','document'];

/** Parse only v3. Structural parsing never certifies source semantics or authority. */
export function parseRun(value: unknown): RunContract {
  const names = 'schemaVersion kind runId revision projectRoot sources requirements targets criteria outcomes work resources decisions releases policy proofOutcomeIds activeWorkIds evidence judgments';
  const r = shape(value, `${names} capacity`, names, 'run');
  if (r.schemaVersion !== 3 || r.kind !== 'canonical-workflow') throw new WorkflowError('CONTRACT_UNSUPPORTED', 'Only canonical-workflow schemaVersion 3 is supported; historical state is read-only.');
  assert(text(r.runId) && integer(r.revision, 1) && isRelativePath(r.projectRoot), 'run', 'invalid run identity/root');
  for (const name of ['sources','requirements','targets','criteria','outcomes','work','resources','decisions','releases','evidence','judgments']) rows(r[name], name);
  assert(['sources','requirements','targets','criteria','outcomes'].every(k => r[k].length > 0), 'run', 'sources/requirements/targets/criteria/outcomes cannot be empty');
  assert(strings(r.proofOutcomeIds, false) && strings(r.activeWorkIds), 'run', 'invalid proof/active work selection');
  if (r.capacity !== undefined) {
    const c = shape(r.capacity, 'period hours roles ownerTouchpoints sourceRefs', 'period hours roles ownerTouchpoints sourceRefs', 'capacity'); refs(c.sourceRefs, 'capacity');
    assert(text(c.period) && typeof c.hours === 'number' && Number.isFinite(c.hours) && c.hours >= 0 && (c.ownerTouchpoints === null || integer(c.ownerTouchpoints)) && Array.isArray(c.roles), 'capacity', 'invalid capacity');
    for (const v of c.roles) { const row = shape(v, 'role hours', 'role hours', 'capacity.roles'); assert(text(row.role) && typeof row.hours === 'number' && Number.isFinite(row.hours) && row.hours >= 0, 'capacity.roles', 'invalid role availability'); }
    assert(new Set(c.roles.map((v: Row) => v.role)).size === c.roles.length, 'capacity.roles', 'duplicate role');
  }
  for (const s of r.sources) {
    shape(s, 'id binding authority inspection', 'id binding authority inspection', s.id); binding(s.binding, s.id);
    assert(choices(s.authority, ['user','contract','reference']) && choices(s.inspection, ['complete','partial','unread']), s.id, 'invalid source authority/inspection');
  }
  for (const q of r.requirements) {
    shape(q, 'id description sourceRefs criterionIds releaseIds mandatory', 'id description sourceRefs criterionIds releaseIds mandatory', q.id); refs(q.sourceRefs, q.id);
    assert(text(q.description) && q.sourceRefs.length > 0 && strings(q.criterionIds, false) && strings(q.releaseIds) && typeof q.mandatory === 'boolean', q.id, 'invalid obligation');
  }
  for (const t of r.targets) {
    shape(t, 'id kind identity environment providerMode revision bindings lifecycle', 'id kind identity environment providerMode revision bindings lifecycle', t.id);
    assert(choices(t.kind, ['web','native','desktop','api','sdk','cli','automation','data','ml','infrastructure','document','media']) && choices(t.environment, ['local','staging','production','unknown']) && choices(t.providerMode, ['real','controlled','fake','unknown']), t.id, 'invalid target kind/environment/provider');
    assert(t.identity === null || !!t.identity && typeof t.identity === 'object' && !Array.isArray(t.identity) && Object.keys(t.identity).length > 0 && Object.entries(t.identity).every(([k,v]) => text(k) && text(v)), t.id, 'identity must be known nonempty object or null');
    assert(t.revision === null || text(t.revision), t.id, 'invalid target revision'); bindings(t.bindings, t.id);
    const l = shape(t.lifecycle, 'stage dataPolicy sourceRef', 'stage dataPolicy sourceRef', t.id);
    assert(choices(l.stage, ['pre-launch','live','unknown']) && choices(l.dataPolicy, ['disposable','retain','unknown']), t.id, 'invalid lifecycle'); if (l.sourceRef !== null) sourceRef(l.sourceRef, t.id);
  }
  for (const c of r.criteria) {
    shape(c, 'id description scenario targetId evidenceKinds inputs productionRequired captures minimumCollected', 'id description scenario targetId evidenceKinds inputs productionRequired', c.id);
    assert(text(c.description) && choices(c.scenario, ['success','recovery']) && text(c.targetId) && strings(c.evidenceKinds, false) && c.evidenceKinds.every((k: string) => evidenceKinds.includes(k)) && typeof c.productionRequired === 'boolean', c.id, 'invalid criterion'); bindings(c.inputs, c.id);
    if (c.captures !== undefined) { assert(Array.isArray(c.captures), c.id, 'invalid captures'); for (const v of c.captures) capture(v, c.id); assert(new Set(c.captures.map((v: Row) => `${v.state}:${v.context}`)).size === c.captures.length, c.id, 'duplicate capture'); }
    assert(c.minimumCollected === undefined || integer(c.minimumCollected, 1), c.id, 'minimumCollected must be positive');
  }
  for (const o of r.outcomes) {
    shape(o, 'id title requirementIds criterionIds targetId inputs', 'id title requirementIds criterionIds targetId inputs', o.id); inputs(o.inputs, o.id);
    assert(text(o.title) && strings(o.requirementIds, false) && strings(o.criterionIds, false) && text(o.targetId), o.id, 'invalid outcome');
  }
  for (const w of r.work) {
    shape(w, 'id title outcomeIds criterionIds targetIds action inputs files instructions estimate', 'id title outcomeIds criterionIds targetIds action inputs files instructions', w.id); inputs(w.inputs, w.id);
    assert(text(w.title) && strings(w.outcomeIds, false) && strings(w.criterionIds, false) && strings(w.targetIds, false) && choices(w.action, actionKinds) && strings(w.files) && w.files.every(isRelativePath) && typeof w.instructions === 'string' && w.instructions.length <= 100_000, w.id, 'invalid work');
    if (w.estimate !== undefined) { const e = shape(w.estimate, 'hours role ownerDelayHours ownerTouchpoints', 'hours role ownerDelayHours ownerTouchpoints', w.id); assert(range(e.hours) && range(e.ownerDelayHours) && text(e.role) && (e.ownerTouchpoints === null || integer(e.ownerTouchpoints)), w.id, 'invalid estimate'); }
  }
  for (const x of r.resources) {
    shape(x, 'id description kind targetId status sourceRefs producedBy reference binding', 'id description kind targetId status sourceRefs', x.id); refs(x.sourceRefs, x.id);
    assert(text(x.description) && choices(x.kind, ['access','input','authority']) && text(x.targetId) && choices(x.status, ['available','missing','unknown']) && (x.reference === undefined || text(x.reference)), x.id, 'invalid resource'); if (x.binding !== undefined) binding(x.binding, x.id);
    assert(x.producedBy === undefined || strings(x.producedBy), x.id, 'invalid resource producers');
  }
  for (const d of r.decisions) {
    shape(d, 'id description sourceRefs producedBy inputs requiredRoles', 'id description sourceRefs producedBy inputs requiredRoles', d.id); refs(d.sourceRefs, d.id); inputs(d.inputs, d.id); roles(d.requiredRoles, d.id);
    assert(text(d.description) && d.sourceRefs.length > 0 && strings(d.producedBy), d.id, 'invalid decision producer');
  }
  for (const x of r.releases) { shape(x, 'id title outcomeIds sharedCriterionIds sourceRefs inputs', 'id title outcomeIds sharedCriterionIds sourceRefs inputs', x.id); refs(x.sourceRefs, x.id); inputs(x.inputs, x.id); assert(text(x.title) && strings(x.outcomeIds, false) && strings(x.sharedCriterionIds), x.id, 'invalid release'); }
  const p = shape(r.policy, 'instruction execution checkpoints implementerId implementerContextId reviews grants budget checkpointAcknowledgment', 'instruction execution checkpoints implementerId implementerContextId reviews grants budget', 'policy');
  const i = shape(p.instruction, 'sourceId locator quote reference issuedAt', 'sourceId locator quote reference issuedAt', 'instruction'); assert(Object.values(i).every(v => text(v)), 'instruction', 'invalid retained instruction');
  assert(choices(p.execution, ['plan-only','reversible']) && choices(p.checkpoints, ['every-proof','autonomous']) && text(p.implementerId) && text(p.implementerContextId), 'policy', 'invalid authority policy');
  const pr = shape(p.reviews, 'scope semantic design release', 'scope semantic design release', 'reviews'); for (const key of Object.keys(pr)) roles(pr[key], `reviews.${key}`);
  for (const g of rows(p.grants, 'grants')) { shape(g, 'id targetIds actions sourceRef reference', 'id targetIds actions sourceRef reference', g.id); sourceRef(g.sourceRef, g.id); assert(strings(g.targetIds, false) && strings(g.actions, false) && g.actions.every((a: string) => actionKinds.includes(a)) && text(g.reference), g.id, 'invalid grant'); }
  const b = shape(p.budget, 'maxActiveWork maxDetailBytes', 'maxActiveWork maxDetailBytes', 'budget'); assert(integer(b.maxActiveWork, 1) && integer(b.maxDetailBytes, 1), 'budget', 'positive limits required');
  if (p.checkpointAcknowledgment !== undefined) {
    const a = shape(p.checkpointAcknowledgment,'proofFingerprint instruction','proofFingerprint instruction','checkpointAcknowledgment'); assert(hash(a.proofFingerprint),'checkpointAcknowledgment','invalid proof fingerprint');
    const ci = shape(a.instruction,'source locator quote reference issuedAt','source locator quote reference issuedAt','checkpointAcknowledgment.instruction'); binding(ci.source,'checkpointAcknowledgment.instruction'); assert([ci.locator,ci.quote,ci.reference,ci.issuedAt].every(v => text(v)),'checkpointAcknowledgment.instruction','invalid retained instruction');
  }
  for (const e of r.evidence) {
    shape(e, 'id criterionId targetId kind fingerprint artifact command observedAt result observer production consumer capture test', 'id criterionId targetId kind fingerprint artifact command observedAt result observer production', e.id); binding(e.artifact, e.id);
    const ob = shape(e.observer, 'id contextId reference', 'id contextId reference', e.id); assert(Object.values(ob).every(v => text(v)), e.id, 'invalid observer');
    assert(text(e.criterionId) && text(e.targetId) && choices(e.kind, evidenceKinds) && hash(e.fingerprint) && text(e.command) && text(e.observedAt) && choices(e.result, ['pass','fail']) && typeof e.production === 'boolean' && (e.consumer === undefined || text(e.consumer)), e.id, 'invalid evidence');
    if (e.capture !== undefined) capture(e.capture, e.id);
    if (e.test !== undefined) { const t = shape(e.test, 'format collected failed exitCode', 'format collected failed exitCode', e.id); assert(choices(t.format, ['vitest-json','junit']) && integer(t.collected) && integer(t.failed) && integer(t.exitCode), e.id, 'invalid test receipt'); }
  }
  for (const j of r.judgments) {
    shape(j, 'id purpose subjectIds fingerprint result reviewer reference observedAt observations findings', 'id purpose subjectIds fingerprint result reviewer reference observedAt observations findings', j.id);
    const reviewer = shape(j.reviewer, 'id contextId role', 'id contextId role', j.id); assert(text(reviewer.id) && text(reviewer.contextId) && choices(reviewer.role, ['owner','independent','agent']), j.id, 'invalid reviewer');
    assert(choices(j.purpose, ['scope','semantic','design','decision','release']) && strings(j.subjectIds, false) && hash(j.fingerprint) && choices(j.result, ['approved','rejected']) && text(j.reference) && text(j.observedAt) && strings(j.observations, false), j.id, 'invalid judgment');
    for (const f of rows(j.findings, `${j.id}.findings`)) { shape(f, 'id severity criterionIds message', 'id severity criterionIds message', f.id); assert(choices(f.severity, ['P0','P1','P2','P3']) && strings(f.criterionIds) && text(f.message), f.id, 'invalid finding'); }
  }
  return structuredClone(r) as RunContract;
}
