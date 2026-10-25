import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { IMPLIED_CAPABILITIES, createOwnerAttestedScopeReview, ownerAttestationProvider, planDeliveryReview, resolveDeliveryScope, sha256, validateDelivery } from '../../src/delivery/index.js';
import type { DeliveryDecision, DeliveryManifest } from '../../src/delivery/index.js';

/** Structural canary on a real consumer run (the Logisrch Option A v2 plan). It never
 * touches the original: set AI_PROMPT_REAL_RUN to its absolute run directory and the
 * run plus every file it binds is copied to a temporary project root first. */
const source = process.env.AI_PROMPT_REAL_RUN;
const roots: string[] = [];
afterEach(() => roots.splice(0).forEach(root => fs.rmSync(root, { recursive: true, force: true })));

function copyRun(runDirectory: string) {
  const manifest = JSON.parse(fs.readFileSync(path.join(runDirectory, 'delivery-manifest.json'), 'utf8')) as DeliveryManifest;
  const projectRoot = path.resolve(runDirectory, manifest.projectRoot);
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'real-run-canary-'))); roots.push(root);
  const relativeRun = path.relative(projectRoot, runDirectory);
  fs.cpSync(runDirectory, path.join(root, relativeRun), { recursive: true });
  fs.writeFileSync(path.join(root, 'AGENTS.md'), 'Temporary canary project root\n');
  const bound = new Set<string>();
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) { value.forEach(walk); return; }
    if (!value || typeof value !== 'object') return;
    const row = value as Record<string, unknown>;
    if (typeof row.path === 'string' && typeof row.sha256 === 'string') bound.add(row.path);
    Object.values(row).forEach(walk);
  };
  for (const file of fs.readdirSync(runDirectory).filter(f => f.endsWith('.json'))) walk(JSON.parse(fs.readFileSync(path.join(runDirectory, file), 'utf8')));
  for (const file of bound) {
    if (file.startsWith(relativeRun + '/')) continue;
    fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.copyFileSync(path.join(projectRoot, file), path.join(root, file));
  }
  const run = path.join(root, relativeRun);
  const read = (name: string) => JSON.parse(fs.readFileSync(path.join(run, name), 'utf8'));
  const write = (name: string, value: unknown) => { const bytes = JSON.stringify(value, null, 2); fs.writeFileSync(path.join(run, name), bytes); return { path: path.posix.join(relativeRun, name), sha256: sha256(bytes) }; };
  return { root, run, relativeRun, read, write };
}

const attest = (run: string, edit: (d: DeliveryDecision) => void = () => {}) => {
  const scope = resolveDeliveryScope(run)!;
  const code = planDeliveryReview(scope, 'scope-review', scope.manifest.outcomes.map(o => o.id)).binding.scopeDigest.slice(0, 8);
  const decision = createOwnerAttestedScopeReview(scope, { id: 'owner-scope-attested', reviewerId: 'owner', contextId: 'owner-chat', reference: 'chat:canary', quote: `I approve scope ${code} as the complete Option A ledger.`, messageAt: '2026-10-25T12:00:00Z', reason: 'Owner confirmed in chat that the ledger covers the original sources.' });
  edit(decision);
  const manifest = JSON.parse(fs.readFileSync(path.join(run, 'delivery-manifest.json'), 'utf8'));
  manifest.decisionRefs = [...manifest.decisionRefs.filter((d: DeliveryDecision) => d.id !== decision.id), decision];
  fs.writeFileSync(path.join(run, 'delivery-manifest.json'), JSON.stringify(manifest, null, 2));
};
const plan = (run: string) => validateDelivery(run, { stage: 'plan', trustedReviewProvider: ownerAttestationProvider });
const pending = 'scope: original-source coverage review pending or provenance unverified';

describe.skipIf(!source)('real-run canary: Logisrch Option A v2 plan gate', () => {
  it('fails L2 and L3 as generated, and clears only the scope gate with a valid owner attestation', () => {
    const copy = copyRun(source!);
    const before = plan(copy.run);
    expect(before.issues).toContain(pending);
    expect(before.issues).toContainEqual(expect.stringMatching(/^ARCHITECTURE_CONTRACT_MISSING: \*: Run has persistent data or roles/));
    expect(before.issues).toContainEqual(expect.stringMatching(/^RELEASE_TRAIN_COUPLED: FINAL-HANDOVER: Base-contract payment requires accepted-parity, which depends on added work/));
    expect(before.issues.filter(i => i.startsWith('RELEASE_TRAIN_COUPLED: WEEK2-MLP'))).toEqual([]);

    attest(copy.run, d => { d.provenance.attestation!.scopeDigest = 'a'.repeat(64); d.provenance.attestation!.quote = 'approve scope aaaaaaaa'; });
    expect(plan(copy.run).issues).toContain(pending);
    attest(copy.run);
    const after = plan(copy.run);
    expect(after.issues).not.toContain(pending); expect(after.scopeReview?.provenance).toBe('owner-attested');
    expect(after.issues).toEqual(before.issues.filter(i => i !== pending));
  });

  it('passes --stage plan once the domain contract exists and parity moves to its own change-order train', () => {
    const copy = copyRun(source!);
    const contract = copy.read('planning-integrity.json');
    const base = 'docs/01-final-proposal/PROPOSAL.md';
    const changeOrderSource = contract.nodes.find((n: any) => n.id === 'change-order').originRef;
    const changeOrderNodes = ['legacy-review', 'change-order', 'parity-review', 'parity-ui', 'data-decision', 'migration-cutover'];
    contract.releaseScopes = [{ id: 'R1-OPTION-A', kind: 'base-contract', sourceRef: base }, { id: 'R2-PARITY', kind: 'change-order', sourceRef: changeOrderSource, status: 'proposed' }];
    for (const n of contract.nodes) if (n.origin === 'added') n.releaseScope = changeOrderNodes.includes(n.id) ? 'R2-PARITY' : 'R1-OPTION-A';
    const release = contract.nodes.find((n: any) => n.id === 'release');
    release.dependsOn = release.dependsOn.filter((id: string) => !['parity-ui', 'migration-cutover'].includes(id));
    release.consumes = release.consumes.filter((c: string) => !['accepted-parity', 'safe-cutover'].includes(c));
    const final = contract.milestones.find((m: any) => m.id === 'FINAL-HANDOVER');
    final.requires = final.requires.filter((c: string) => !['accepted-parity', 'safe-cutover'].includes(c));
    final.evidenceIds = final.evidenceIds.filter((id: string) => id !== 'CHECK-migration-cutover');
    contract.milestones.push({ id: 'R2-PARITY-CUTOVER', stage: 4, releaseScope: 'R2-PARITY', requires: ['accepted-parity', 'safe-cutover'], acceptanceNodeId: 'acceptance-definition', evidenceIds: ['BUILD-FINAL', 'CHECK-migration-cutover'] });

    const manifest = copy.read('delivery-manifest.json') as DeliveryManifest;
    const requirements = copy.read('requirements.json');
    const actors = [...new Set(manifest.outcomes.map(o => o.actor))];
    const web = manifest.surfaces.find(s => s.kind === 'web')!;
    const decided: Record<string, string> = { authentication: 'Supabase Auth', geocoding: 'PostGIS with a geocoding adapter', search: 'Postgres full-text search', email: 'Resend', 'file-storage': 'Supabase Storage private buckets' };
    const implied = IMPLIED_CAPABILITIES.filter(({ pattern }) => requirements.requirements.some((r: any) => pattern.test([r.description, ...r.checks.map((c: any) => c.description)].join(' '))));
    const architecture = {
      schemaVersion: 1,
      roles: [{ id: 'operator', actors: actors.slice(0, 1) }, { id: 'member', actors: actors.slice(1) }],
      entities: [{ id: 'listing', fields: [{ name: 'id', type: 'uuid' }, { name: 'organization_id', type: 'uuid' }, { name: 'status', type: 'state' }] }, { id: 'storage_request', fields: [{ name: 'id', type: 'uuid' }, { name: 'seeker_id', type: 'uuid' }, { name: 'status', type: 'state' }] }],
      access: ['listing', 'storage_request'].flatMap(entityId => [{ entityId, roleId: 'operator', read: 'all', create: 'all', update: 'all', delete: 'none' }, { entityId, roleId: 'member', read: entityId === 'listing' ? 'published or own organization' : 'own', create: 'own organization', update: 'own while draft', delete: 'none' }]),
      stateMachines: [
        { id: 'listing-status', entityId: 'listing', field: 'status', states: ['draft', 'pending', 'published', 'retired'], initial: 'draft', transitions: [{ from: 'draft', to: 'pending', roleIds: ['member'] }, { from: 'pending', to: 'published', roleIds: ['operator'] }, { from: 'pending', to: 'draft', roleIds: ['operator'] }, { from: 'published', to: 'retired', roleIds: ['member', 'operator'] }] },
        { id: 'request-status', entityId: 'storage_request', field: 'status', states: ['draft', 'matched', 'quoting', 'selected', 'booked', 'closed'], initial: 'draft', transitions: [{ from: 'draft', to: 'matched', roleIds: ['operator'] }, { from: 'matched', to: 'quoting', roleIds: ['operator'] }, { from: 'quoting', to: 'selected', roleIds: ['member'] }, { from: 'selected', to: 'booked', roleIds: ['operator'] }, { from: 'booked', to: 'closed', roleIds: ['operator'] }, { from: 'draft', to: 'closed', roleIds: ['member'] }] },
      ],
      routes: [{ path: '/', surfaceId: web.id, access: ['public'] }, { path: '/app', surfaceId: web.id, access: ['member'] }, { path: '/admin', surfaceId: web.id, access: ['operator'] }],
      api: [{ id: 'create-request', method: 'POST', path: '/api/v1/requests', roleIds: ['member'], request: '{ location, radiusKm, capacity }', response: '{ id, status }', errors: ['422 invalid requirement preserves the draft', '401 expired session returns to login'] }],
      providers: implied.map(({ capability }) => decided[capability]
        ? { capability, status: 'decided', provider: decided[capability], requirementIds: [] }
        : { capability, status: 'not-required', reason: 'Outside the Option A base contract until the parity change order is priced', requirementIds: [] }),
    };
    const planning = copy.write('planning-integrity.json', contract);
    const domain = copy.write('architecture.json', architecture);
    manifest.planningInputs = [planning, manifest.planningInputs!.find(b => b.path.endsWith('review-findings.json'))!, domain];
    copy.write('delivery-manifest.json', manifest);
    expect(plan(copy.run).issues).toEqual([pending]);
    attest(copy.run);
    const report = plan(copy.run);
    expect(report.issues).toEqual([]); expect(report.valid).toBe(true); expect(report.completion.planReady).toBe(true);
    expect(report.scopeReview).toMatchObject({ approved: true, provenance: 'owner-attested' });
    // Execution remains gated: no authorization and no independent scope review.
    expect(validateDelivery(copy.run, { stage: 'execute', trustedReviewProvider: ownerAttestationProvider }).issues).toEqual(expect.arrayContaining([pending, 'authorization: execution has not been granted']));
  });
});
