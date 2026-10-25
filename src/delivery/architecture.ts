/** Domain architecture contract for runs with persistent data or roles. Read-only. */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { confined, sha256 } from './manifest.js';
import type { PlanningIssue } from './planning-integrity.js';
import type { DeliveryLifecycle, DeliveryScope, RequirementRecord } from './types.js';

export const ARCHITECTURE_FILE = 'architecture.json';
type Row = Record<string, any>;
const object = (v: unknown): v is Row => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= 2000;
const strings = (v: unknown): v is string[] => Array.isArray(v) && v.every(text);
function shape(v: unknown, fields: string, required: string, label: string): asserts v is Row {
  if (!object(v) || Object.keys(v).some(k => !fields.split(' ').includes(k)) || required.split(' ').filter(Boolean).some(k => !(k in v))) throw new Error(`invalid ${label} fields`);
}
function list(v: unknown, label: string, key = 'id'): Row[] {
  if (!Array.isArray(v) || !v.every(r => object(r) && text(r[key])) || new Set(v.map(r => r[key])).size !== v.length) throw new Error(`invalid or duplicate ${label} ${key}s`);
  return v;
}

/** External capabilities a requirement implies; each needs a recorded provider decision. */
export const IMPLIED_CAPABILITIES: readonly { capability: string; pattern: RegExp }[] = [
  { capability: 'authentication', pattern: /\b(sign[- ]?up|sign[- ]?in|log[- ]?in|passwords?|authenticat\w*|sso|oauth|magic links?)\b/i },
  { capability: 'geocoding', pattern: /\b(radius|geocod\w*|geolocat\w*|distance|nearby|proximity|postal codes?|latitude|longitude)\b/i },
  { capability: 'search', pattern: /\b(search\w*|full[- ]text)\b/i },
  { capability: 'email', pattern: /\b(e-?mails?|newsletters?)\b/i },
  { capability: 'sms', pattern: /\b(sms|text messag\w*)\b/i },
  { capability: 'file-storage', pattern: /\b(uploads?|uploaded|attachments?|file storage)\b/i },
  { capability: 'payments', pattern: /\b(checkout|card payments?|online payments?|subscriptions?|billing)\b/i },
];
const PERSISTENCE = /\b(persist\w*|databases?|stored|storage|accounts?|profiles?|tenants?|roles?|permissions?|rls|records?|sign[- ]?up|log[- ]?in|uploads?)\b/i;
const STATE_FIELD = /^(status|state|stage|phase)$/i;
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'RPC', 'EVENT'];
const requirementText = (r: RequirementRecord) => [r.description, ...r.checks.map(c => c.description)].join(' ');

/** Reasons the run keeps persistent data or distinct roles; empty when neither applies. */
export function architectureRequiredReasons(scope: DeliveryScope, requirements: RequirementRecord[], lifecycle?: DeliveryLifecycle): string[] {
  const m = scope.manifest; const reasons: string[] = [];
  const actors = new Set(m.outcomes.map(o => o.actor.trim()));
  if (actors.size > 1) reasons.push(`${actors.size} outcome actors`);
  if (lifecycle) reasons.push('declared data lifecycle');
  if (m.surfaces.some(s => s.kind === 'data')) reasons.push('data surface');
  const persistent = requirements.filter(r => PERSISTENCE.test(requirementText(r))).map(r => r.id);
  if (persistent.length) reasons.push(`persistent-data requirements ${persistent.slice(0, 5).join(', ')}${persistent.length > 5 ? ', …' : ''}`);
  return reasons;
}

/** Bound documents are architecture, not task detail: exempt them from pending-detail caps. */
export function architectureDocumentPaths(scope: DeliveryScope): string[] {
  try {
    const c = JSON.parse(fs.readFileSync(confined(scope.runDirectory, ARCHITECTURE_FILE), 'utf8'));
    return Array.isArray(c?.documents) ? c.documents.filter((d: Row) => object(d) && text(d.path)).map((d: Row) => confined(scope.projectRoot, d.path)) : [];
  } catch { return []; }
}

export function validateArchitectureContract(scope: DeliveryScope, requirements: RequirementRecord[], lifecycle: DeliveryLifecycle | undefined, ownerDecisionIds: string[]): PlanningIssue[] {
  const issues: PlanningIssue[] = []; const add = (code: string, target: string, message: string) => issues.push({ code, target, message });
  const m = scope.manifest; const file = path.join(scope.runDirectory, ARCHITECTURE_FILE);
  const reasons = architectureRequiredReasons(scope, requirements, lifecycle);
  if (!fs.existsSync(file)) {
    if (reasons.length) add('ARCHITECTURE_CONTRACT_MISSING', '*', `Run has persistent data or roles (${reasons.join('; ')}); add ${ARCHITECTURE_FILE} with entities, access matrix, state machines, routes, API and provider decisions before the first integration unit`);
    return issues;
  }
  try {
    const c = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(fs.readFileSync(confined(scope.runDirectory, ARCHITECTURE_FILE))));
    shape(c, 'schemaVersion documents roles entities access stateMachines routes api providers', 'schemaVersion roles entities access stateMachines routes api providers', 'architecture contract');
    if (c.schemaVersion !== 1) throw new Error('unsupported architecture contract version');
    for (const d of c.documents ?? []) {
      shape(d, 'path sha256', 'path sha256', 'architecture document');
      const bytes = fs.readFileSync(confined(scope.projectRoot, d.path));
      if (!bytes.length || sha256(bytes) !== d.sha256) throw new Error(`stale or empty architecture document ${d.path}`);
      // Exempt from caps only while it stays architecture; task sections belong in a slice.
      if (/^#{1,6}\s*(?:T\d+\b|task\s+\d+)/im.test(bytes.toString('utf8'))) add('ARCHITECTURE_TASK_DETAIL', d.path, 'Task sections are slice detail and count toward pending-detail caps');
    }
    const roles = list(c.roles, 'role'); const entities = list(c.entities, 'entity');
    const roleIds = new Set(roles.map(r => r.id)); const principals = new Set([...roleIds, 'public', 'system']);
    for (const r of roles) { shape(r, 'id actors', 'id actors', 'role'); if (!strings(r.actors)) throw new Error(`invalid role ${r.id}`); }
    for (const actor of new Set(m.outcomes.map(o => o.actor.trim()))) if (!roles.some(r => r.actors.some((a: string) => a.trim() === actor))) add('ARCHITECTURE_ROLE_UNMAPPED', actor, 'Outcome actor has no role in the access matrix');
    if (!entities.length) add('ARCHITECTURE_ENTITIES_MISSING', '*', 'Declare the persistent entities and their fields');
    for (const e of entities) {
      shape(e, 'id fields', 'id fields', 'entity');
      if (!list(e.fields, `entity ${e.id} field`, 'name').length) add('ARCHITECTURE_ENTITIES_MISSING', e.id, 'Entity needs its fields');
      for (const f of e.fields) { shape(f, 'name type', 'name type', 'entity field'); if (!text(f.type)) throw new Error(`invalid field ${e.id}.${f.name}`); }
    }
    const access = Array.isArray(c.access) ? c.access : (() => { throw new Error('access must be an array'); })();
    for (const row of access) {
      shape(row, 'entityId roleId read create update delete', 'entityId roleId read create update delete', 'access row');
      if (!['read', 'create', 'update', 'delete'].every(op => text(row[op]))) throw new Error(`invalid access ${row.entityId}/${row.roleId}`);
      if (!entities.some(e => e.id === row.entityId) || !roleIds.has(row.roleId)) add('ARCHITECTURE_ACCESS_UNKNOWN', `${row.entityId}/${row.roleId}`, 'Access row names an unknown entity or role');
    }
    for (const e of entities) for (const r of roles) {
      const n = access.filter((row: Row) => row.entityId === e.id && row.roleId === r.id).length;
      if (n !== 1) add('ARCHITECTURE_ACCESS_INCOMPLETE', `${e.id}/${r.id}`, n ? 'Duplicate access rows' : 'Every entity and role pair needs explicit read/create/update/delete policy (RLS/grants)');
    }
    const machines = list(c.stateMachines, 'state machine');
    for (const sm of machines) {
      shape(sm, 'id entityId field states initial transitions', 'id entityId field states initial transitions', 'state machine');
      const entity = entities.find(e => e.id === sm.entityId);
      if (!entity || !entity.fields.some((f: Row) => f.name === sm.field) || !strings(sm.states) || !sm.states.length || new Set(sm.states).size !== sm.states.length || !sm.states.includes(sm.initial) || !Array.isArray(sm.transitions)) { add('ARCHITECTURE_STATE_MACHINE_INVALID', sm.id, 'State machine needs a known entity field, unique states and an initial state'); continue; }
      for (const t of sm.transitions) {
        shape(t, 'from to roleIds', 'from to roleIds', 'state transition');
        if (!sm.states.includes(t.from) || !sm.states.includes(t.to) || !strings(t.roleIds) || !t.roleIds.length || t.roleIds.some((id: string) => !principals.has(id))) add('ARCHITECTURE_STATE_MACHINE_INVALID', sm.id, `Invalid transition ${t.from}→${t.to}`);
      }
      const reached = new Set([sm.initial]);
      for (let round = 0; round < sm.states.length; round++) for (const t of sm.transitions) if (reached.has(t.from)) reached.add(t.to);
      for (const state of sm.states) if (!reached.has(state)) add('ARCHITECTURE_STATE_MACHINE_INVALID', sm.id, `State ${state} is unreachable from ${sm.initial}`);
    }
    for (const e of entities) for (const f of e.fields) {
      if ((f.type === 'state' || STATE_FIELD.test(f.name)) && !machines.some(sm => sm.entityId === e.id && sm.field === f.name)) add('ARCHITECTURE_STATE_MACHINE_MISSING', `${e.id}.${f.name}`, 'Lifecycle field needs explicit states and permitted transitions');
    }
    const routes = Array.isArray(c.routes) ? c.routes : (() => { throw new Error('routes must be an array'); })();
    for (const r of routes) {
      shape(r, 'path surfaceId access', 'path surfaceId access', 'route');
      if (!text(r.path) || !r.path.startsWith('/') || !m.surfaces.some(s => s.id === r.surfaceId) || !strings(r.access) || !r.access.length || r.access.some((id: string) => !principals.has(id))) add('ARCHITECTURE_ROUTE_INVALID', String(r.path), 'Route needs an absolute path, a known surface and public/role access');
    }
    if (new Set(routes.map((r: Row) => `${r.surfaceId} ${r.path}`)).size !== routes.length) add('ARCHITECTURE_ROUTE_INVALID', '*', 'Duplicate route');
    for (const s of m.surfaces.filter(s => ['web', 'native', 'desktop'].includes(s.kind))) if (!routes.some((r: Row) => r.surfaceId === s.id)) add('ARCHITECTURE_ROUTES_MISSING', s.id, 'Visual surface needs its public and private URL map');
    const api = list(c.api, 'API operation');
    if (!api.length) add('ARCHITECTURE_API_MISSING', '*', 'Declare the API contract: operations, callers, request, response and error cases');
    for (const op of api) {
      shape(op, 'id method path roleIds request response errors', 'id method path roleIds request response errors', 'API operation');
      if (!METHODS.includes(op.method) || !text(op.path) || !strings(op.roleIds) || !op.roleIds.length || op.roleIds.some((id: string) => !principals.has(id)) || !text(op.request) || !text(op.response) || !strings(op.errors) || !op.errors.length) add('ARCHITECTURE_API_INVALID', op.id, 'Operation needs method, path, known callers, request, response and at least one error case');
    }
    const providers = list(c.providers, 'provider decision', 'capability');
    for (const p of providers) {
      shape(p, 'capability status provider ownerDecisionId reason requirementIds', 'capability status requirementIds', 'provider decision');
      if (!strings(p.requirementIds)) throw new Error(`invalid provider decision ${p.capability}`);
      const valid = p.status === 'decided' ? text(p.provider) : p.status === 'open' ? text(p.ownerDecisionId) && ownerDecisionIds.includes(p.ownerDecisionId) : p.status === 'not-required' ? text(p.reason) && p.reason.trim().split(/\s+/).length >= 6 : false;
      if (!valid) add('ARCHITECTURE_PROVIDER_INVALID', p.capability, 'Use decided with a provider, open with a registered owner decision, or not-required with a reason');
    }
    for (const { capability, pattern } of IMPLIED_CAPABILITIES) {
      const implied = requirements.filter(r => pattern.test(requirementText(r))).map(r => r.id);
      if (implied.length && !providers.some(p => p.capability === capability)) add('ARCHITECTURE_PROVIDER_UNDECIDED', capability, `Requirements ${implied.join(', ')} imply ${capability}; record the provider decision`);
    }
  } catch (e) { add('ARCHITECTURE_CONTRACT_INVALID', ARCHITECTURE_FILE, String(e)); }
  return issues;
}
