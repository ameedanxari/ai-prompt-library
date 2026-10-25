import type { DeliveryManifest } from '../../src/delivery/types.js';

/** Minimal complete domain contract for the synthetic delivery fixture. */
export function architectureContract(manifest: DeliveryManifest): any {
  return {
    schemaVersion: 1,
    roles: [{ id: 'consumer', actors: [...new Set(manifest.outcomes.map(o => o.actor))] }],
    entities: [{ id: 'request', fields: [{ name: 'id', type: 'uuid' }, { name: 'detail', type: 'text' }, { name: 'status', type: 'state' }] }],
    access: [{ entityId: 'request', roleId: 'consumer', read: 'own', create: 'own', update: 'own while open', delete: 'none' }],
    stateMachines: [{ id: 'request-status', entityId: 'request', field: 'status', states: ['open', 'fulfilled', 'failed'], initial: 'open', transitions: [{ from: 'open', to: 'fulfilled', roleIds: ['system'] }, { from: 'open', to: 'failed', roleIds: ['system'] }, { from: 'failed', to: 'open', roleIds: ['consumer'] }] }],
    routes: manifest.surfaces.filter(s => ['web', 'native', 'desktop'].includes(s.kind)).map(s => ({ path: '/', surfaceId: s.id, access: ['public'] })),
    api: [{ id: 'create-request', method: 'POST', path: '/api/v1/requests', roleIds: ['consumer'], request: '{ detail }', response: '{ id, status }', errors: ['422 invalid detail preserves existing state', '503 failure offers retry'] }],
    providers: [],
  };
}
