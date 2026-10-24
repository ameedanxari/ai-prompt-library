import type { DeliveryLifecycle, FileBinding } from './types.js';

const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max = 300): v is string => typeof v === 'string' && !!v.trim() && v.length <= max;
function requireLifecycle(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`delivery lifecycle: ${message}`);
}

/** Read declared source authority, never infer launch state from names, domains or code. */
export function readDeliveryLifecycle(value: unknown, originals: FileBinding[], targetIds: string[]): DeliveryLifecycle | undefined {
  if (value === undefined) return undefined;
  requireLifecycle(object(value) && Object.keys(value).every(k => ['stage','dataPolicy','sourceRef','sourceLocation','resetTargetIds'].includes(k)), 'invalid declaration');
  requireLifecycle(['pre-launch','live'].includes(String(value.stage)) && ['disposable','retain'].includes(String(value.dataPolicy)), 'stage and data policy must be explicit');
  requireLifecycle(text(value.sourceRef, 1000) && originals.some(s => s.path === value.sourceRef) && text(value.sourceLocation), 'declaration needs a retained original source and location');
  requireLifecycle(Array.isArray(value.resetTargetIds) && value.resetTargetIds.length <= 96 && value.resetTargetIds.every(id => text(id, 100) && targetIds.includes(id)) && new Set(value.resetTargetIds).size === value.resetTargetIds.length, 'reset authorization must name unique known targets');
  requireLifecycle(value.resetTargetIds.length === 0 || (value.stage === 'pre-launch' && value.dataPolicy === 'disposable'), 'live or retained data cannot authorize disposable resets');
  return value as unknown as DeliveryLifecycle;
}

export interface DeliveryChangePolicy {
  stage: 'pre-launch' | 'live' | 'unknown';
  allowBreakingChanges: boolean;
  allowSchemaConsolidation: boolean;
  allowDataReset: boolean;
  requireMigrations: boolean;
  requireCompatibility: boolean;
  /** Disposable resets recover by reseeding; retained/live data needs rollback or restoration. */
  requireRecovery: boolean;
}

/** The caller authenticates CURRENT scope review (including any current rejection).
 * This is planning policy only: it never authorizes or performs a destructive operation.
 * Even pre-launch declarations preserve data unless this exact target is disposable
 * and explicitly listed in the approved source-bound reset authorization. */
export function deliveryChangePolicy(lifecycle: DeliveryLifecycle | undefined, scopeReviewVerified: boolean, targetId: string): DeliveryChangePolicy {
  const stage = scopeReviewVerified && lifecycle ? lifecycle.stage : 'unknown';
  const preLaunch = stage === 'pre-launch';
  const allowDataReset = preLaunch && lifecycle?.dataPolicy === 'disposable' && lifecycle.resetTargetIds.includes(targetId);
  return {
    stage,
    allowBreakingChanges: preLaunch,
    allowSchemaConsolidation: preLaunch,
    allowDataReset,
    requireMigrations: !allowDataReset,
    requireCompatibility: !preLaunch,
    requireRecovery: true,
  };
}
