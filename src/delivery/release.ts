/** Explicit release boundaries preserve the complete source ledger and default union. */
import * as fs from 'node:fs';
import { confined } from './manifest.js';
import type { DeliveryScope, RequirementRecord } from './types.js';

export interface DeliveryReleaseSelection {
  releaseScopeId?: string;
  outcomeIds: string[];
  requirementIds: string[];
  /** Mapped runs prove base/shared surfaces first; later train surfaces retain their own proof. */
  proofSurfaceIds?: string[];
  /** Includes selected train nodes and all selected outcome/unit prerequisites. */
  planningTargetIds?: string[];
}

/** Mapping is optional for union-only historical runs. Once introduced it must
 * cover every requirement/outcome exactly, even when validating the full union. */
export function deliveryReleaseSelection(scope: DeliveryScope, requirements: RequirementRecord[], releaseScopeId?: string): DeliveryReleaseSelection {
  const m = scope.manifest;
  const fail = (message: string): never => { throw new Error(`RELEASE_SCOPE_INVALID: ${message}`); };
  const mapped = requirements.some(r => r.releaseScopeId !== undefined) || m.outcomes.some(o => o.releaseScopeId !== undefined);
  if (!mapped && releaseScopeId === undefined) return { outcomeIds: m.outcomes.map(o => o.id).sort(), requirementIds: requirements.map(r => r.id).sort() };
  if (m.schemaVersion !== 2) fail('named release mapping requires a version 2 run');
  const planning = JSON.parse(fs.readFileSync(confined(scope.runDirectory, 'planning-integrity.json'), 'utf8'));
  const scopes: { id: string; kind: string; status?: string; price?: unknown; decision?: unknown }[] = planning.releaseScopes;
  if (!Array.isArray(scopes) || !scopes.length || scopes.some(s => !s || typeof s.id !== 'string' || !s.id.trim() || s.id === '*') || new Set(scopes.map(s => s.id)).size !== scopes.length || scopes.filter(s => s.kind === 'base-contract').length !== 1) fail('declare distinct releaseScopes with exactly one base contract');
  const ids = new Set<string>(scopes.map(s => s.id));
  for (const row of [...requirements, ...m.outcomes]) if (!row.releaseScopeId || row.releaseScopeId !== '*' && !ids.has(row.releaseScopeId)) fail(`missing or unknown membership for ${row.id}`);
  for (const r of requirements) if (r.releaseScopeId === '*' && (!r.nonWaivable || !r.releaseRequired)) fail(`shared duty ${r.id} must remain non-waivable and release-required`);
  for (const o of m.outcomes) {
    if (!o.requirementIds.length || o.requirementIds.some(id => requirements.find(r => r.id === id)?.releaseScopeId !== o.releaseScopeId)) fail(`outcome ${o.id} mixes or changes authoritative requirement membership; split cross-train outcomes`);
  }
  for (const id of ids) if (!requirements.some(r => r.releaseScopeId === id) || !m.outcomes.some(o => o.releaseScopeId === id)) fail(`train ${id} lacks exact requirement/outcome membership`);
  const base = scopes.find(s => s.kind === 'base-contract')!.id;
  for (const slice of m.slices) {
    const memberships = slice.outcomeIds.map(id => m.outcomes.find(o => o.id === id)?.releaseScopeId);
    const trainIds = new Set(memberships.filter(id => id !== '*'));
    if (trainIds.size > 1) fail(`slice ${slice.id} mixes release trains; separate acceptance boundaries`);
    if (memberships.includes('*') && [...trainIds].some(id => id !== base)) fail(`slice ${slice.id} ties shared duties to a change order; keep them in base or independent shared slices`);
  }
  if (m.slices.find(s => s.id === m.firstProofSlice)?.outcomeIds.some(id => ![base, '*'].includes(m.outcomes.find(o => o.id === id)?.releaseScopeId ?? ''))) fail('representative first proof must belong to the base train or shared duties');
  const proofSurfaceIds = [...new Set(m.outcomes.filter(o => [base, '*'].includes(o.releaseScopeId!)).map(o => o.surfaceId))];
  if (releaseScopeId === undefined) return { outcomeIds: m.outcomes.map(o => o.id).sort(), requirementIds: requirements.map(r => r.id).sort(), proofSurfaceIds };
  if (!ids.has(releaseScopeId)) fail(`unknown named train ${releaseScopeId}`);
  const selectedScope = scopes.find(s => s.id === releaseScopeId)!;
  if (selectedScope.kind === 'change-order' && (selectedScope.status !== 'approved' || !selectedScope.price || !selectedScope.decision)) fail(`change order ${releaseScopeId} must be approved, priced and decision-bound before release`);
  const selected = new Set([...m.outcomes.filter(o => o.releaseScopeId === releaseScopeId || o.releaseScopeId === '*').map(o => o.id), ...(m.slices.find(s => s.id === m.firstProofSlice)?.outcomeIds ?? [])]);
  const pending = [...selected];
  for (let at = 0; at < pending.length; at++) {
    const outcome = m.outcomes.find(o => o.id === pending[at]) ?? fail(`unknown dependency ${pending[at]}`);
    for (const dependency of outcome.dependencies) if (!selected.has(dependency.outcomeId)) { selected.add(dependency.outcomeId); pending.push(dependency.outcomeId); }
  }
  for (const id of new Set(m.outcomes.filter(o => selected.has(o.id)).map(o => o.releaseScopeId))) {
    const dependencyScope = scopes.find(s => s.id === id);
    if (dependencyScope?.kind === 'change-order' && (dependencyScope.status !== 'approved' || !dependencyScope.price || !dependencyScope.decision)) fail(`dependency train ${id} must be approved, priced and decision-bound before release`);
  }
  const selectedSlices = m.slices.filter(slice => slice.outcomeIds.some(id => selected.has(id)));
  const nodes: { id: string; releaseScope?: string }[] = planning.nodes ?? [];
  const planningTargetIds = [...selected, ...selectedSlices.flatMap(slice => [slice.id, ...slice.units.filter(u => u.outcomeIds.some(id => selected.has(id))).flatMap(u => [u.id, ...(u.planningNodeIds ?? [])])]), ...nodes.filter(n => (n.releaseScope ?? base) === releaseScopeId).map(n => n.id)];
  return { releaseScopeId, outcomeIds: [...selected].sort(), requirementIds: [...new Set(m.outcomes.filter(o => selected.has(o.id)).flatMap(o => o.requirementIds))].sort(), planningTargetIds: [...new Set(planningTargetIds)], proofSurfaceIds };
}

/** Technical/source review cannot substitute for an agreed change order. This
 * runtime duty also applies when a caller omits the named selector. */
export function assertDeliveryReleaseAuthority(scope: DeliveryScope, requirements: RequirementRecord[], releaseScopeId?: string): void {
  const selection = deliveryReleaseSelection(scope, requirements, releaseScopeId);
  if (!requirements.some(r => r.releaseScopeId !== undefined)) return;
  const planning = JSON.parse(fs.readFileSync(confined(scope.runDirectory, 'planning-integrity.json'), 'utf8'));
  const included = new Set(scope.manifest.outcomes.filter(o => selection.outcomeIds.includes(o.id)).map(o => o.releaseScopeId));
  for (const train of planning.releaseScopes) if (included.has(train.id) && train.kind === 'change-order' && (train.status !== 'approved' || !train.price || !train.decision)) throw new Error(`RELEASE_SCOPE_INVALID: change order ${train.id} must be approved, priced and decision-bound before release`);
}
