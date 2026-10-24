import { describe, expect, it } from 'vitest';
import { deliveryChangePolicy, readDeliveryLifecycle } from '../../src/delivery/lifecycle.js';
import type { DeliveryLifecycle } from '../../src/delivery/types.js';

const originals = [{ path: 'brief.md', sha256: '0'.repeat(64) }];
const declaration = (change: Partial<DeliveryLifecycle> = {}): DeliveryLifecycle => ({ stage: 'pre-launch', dataPolicy: 'disposable', sourceRef: 'brief.md', sourceLocation: 'Development lifecycle and disposable staging authorization', resetTargetIds: ['staging'], ...change });
const conservative = { stage: 'unknown', allowBreakingChanges: false, allowSchemaConsolidation: false, allowDataReset: false, requireMigrations: true, requireCompatibility: true, requireRecovery: true };

describe('source-bound lifecycle change policy', () => {
  it('treats missing lifecycle and unverified scope as conservative unknown state', () => {
    expect(readDeliveryLifecycle(undefined, originals, ['staging'])).toBeUndefined();
    expect(deliveryChangePolicy(undefined, true, 'staging')).toEqual(conservative);
    expect(deliveryChangePolicy(declaration(), false, 'staging')).toEqual(conservative);
    expect(deliveryChangePolicy(declaration({ stage: 'live', resetTargetIds: [] }), false, 'staging')).toEqual(conservative);
  });
  it('permits consolidation and breaking contracts on approved pre-launch disposable targets', () => {
    const lifecycle = readDeliveryLifecycle(declaration(), originals, ['staging']);
    expect(deliveryChangePolicy(lifecycle, true, 'staging')).toEqual({ stage: 'pre-launch', allowBreakingChanges: true, allowSchemaConsolidation: true, allowDataReset: true, requireMigrations: false, requireCompatibility: false, requireRecovery: true });
  });
  it('never treats disposable status alone as permission to reset another target', () => {
    const lifecycle = readDeliveryLifecycle(declaration(), originals, ['staging', 'production']);
    expect(deliveryChangePolicy(lifecycle, true, 'production')).toMatchObject({ allowBreakingChanges: true, allowDataReset: false, requireMigrations: true, requireRecovery: true });
    expect(deliveryChangePolicy(declaration({ resetTargetIds: [] }), true, 'staging')).toMatchObject({ allowDataReset: false, requireMigrations: true });
    expect(deliveryChangePolicy(lifecycle, true, 'unknown')).toMatchObject({ allowDataReset: false, requireMigrations: true });
  });
  it('preserves valuable pre-launch data while permitting contract and schema redesign', () => {
    const lifecycle = readDeliveryLifecycle(declaration({ dataPolicy: 'retain', resetTargetIds: [] }), originals, ['staging']);
    expect(deliveryChangePolicy(lifecycle, true, 'staging')).toEqual({ stage: 'pre-launch', allowBreakingChanges: true, allowSchemaConsolidation: true, allowDataReset: false, requireMigrations: true, requireCompatibility: false, requireRecovery: true });
  });
  it.each(['retain', 'disposable'] as const)('keeps live %s targets compatible and recoverable', dataPolicy => {
    const lifecycle = readDeliveryLifecycle(declaration({ stage: 'live', dataPolicy, resetTargetIds: [] }), originals, ['staging']);
    expect(deliveryChangePolicy(lifecycle, true, 'staging')).toEqual({ ...conservative, stage: 'live' });
  });
  it.each([
    { sourceRef: 'unretained.md' }, { sourceLocation: '' }, { stage: 'unknown' }, { stage: 'development' },
    { dataPolicy: 'maybe' }, { resetTargetIds: ['production'] }, { resetTargetIds: ['staging', 'staging'] },
    { resetTargetIds: 'staging' }, { resetTargetIds: Array.from({ length: 97 }, (_, i) => `target-${i}`) },
    { stage: 'live' }, { dataPolicy: 'retain' }, { force: true },
  ])('rejects invalid authority or reset scope %j', change => {
    expect(() => readDeliveryLifecycle({ ...declaration(), ...change }, originals, ['staging'])).toThrow('delivery lifecycle:');
  });
  it('does not mutate lifecycle or issue a reset as part of selecting policy', () => {
    const lifecycle = Object.freeze({ ...declaration(), resetTargetIds: Object.freeze(['staging']) }) as unknown as DeliveryLifecycle;
    const before = JSON.stringify(lifecycle);
    deliveryChangePolicy(lifecycle, true, 'staging'); deliveryChangePolicy(lifecycle, false, 'staging');
    expect(JSON.stringify(lifecycle)).toBe(before);
  });
});
