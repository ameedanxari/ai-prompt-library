import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { createOwnerAttestedScopeReview, ownerAttestationProvider, planDeliveryReview, resolveDeliveryScope, sha256, validateDelivery } from '../../src/delivery/index.js';
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
  const decision = createOwnerAttestedScopeReview(scope, { id: 'owner-scope-attested', reviewerId: 'owner', contextId: 'owner-chat', reference: 'chat:canary', quote: `approve scope ${code}`, messageAt: '2026-10-25T12:00:00Z', reason: 'Owner confirmed in chat that the ledger covers the original sources.' });
  edit(decision);
  const manifest = JSON.parse(fs.readFileSync(path.join(run, 'delivery-manifest.json'), 'utf8'));
  manifest.decisionRefs = [...manifest.decisionRefs.filter((d: DeliveryDecision) => d.id !== decision.id), decision];
  fs.writeFileSync(path.join(run, 'delivery-manifest.json'), JSON.stringify(manifest, null, 2));
};
const plan = (run: string) => validateDelivery(run, { stage: 'plan', trustedReviewProvider: ownerAttestationProvider });
const pending = 'scope: original-source coverage review pending or provenance unverified';

describe.skipIf(!source)('real-run canary: current consumer plan with controlled defects', () => {
  function validControl() {
    const copy = copyRun(source!);
    expect(plan(copy.run).issues).toEqual([pending]);
    // Synthetic owner record exists only in this disposable test copy.
    attest(copy.run);
    expect(plan(copy.run).issues).toEqual([]);
    return copy;
  }
  function bindPlanning(copy: ReturnType<typeof copyRun>, contract: unknown) {
    const current = copy.read('delivery-manifest.json') as DeliveryManifest;
    const changed = copy.write('planning-integrity.json', contract);
    current.planningInputs = current.planningInputs!.map(b => b.path.endsWith('/planning-integrity.json') ? changed : b);
    current.decisionRefs = [];
    copy.write('delivery-manifest.json', current);
    attest(copy.run);
  }

  it('passes the current structural control without granting execution or independent approval', () => {
    const copy = validControl();
    expect(plan(copy.run).scopeReview).toMatchObject({ approved: true, provenance: 'owner-attested' });
    expect(validateDelivery(copy.run, { stage: 'execute', trustedReviewProvider: ownerAttestationProvider }).issues).toEqual(expect.arrayContaining([pending, 'authorization: execution has not been granted']));
    attest(copy.run, d => { d.provenance.attestation!.quote = `Do not approve scope ${d.scopeDigest.slice(0, 8)}. I reject it.`; });
    expect(plan(copy.run).issues).toContain(pending);
  });

  it('rejects an omitted domain contract from an otherwise valid current run', () => {
    const copy = validControl();
    const current = copy.read('delivery-manifest.json') as DeliveryManifest;
    fs.rmSync(path.join(copy.run, 'architecture.json'));
    current.planningInputs = current.planningInputs!.filter(b => !b.path.endsWith('/architecture.json'));
    current.decisionRefs = []; copy.write('delivery-manifest.json', current); attest(copy.run);
    const report = plan(copy.run);
    expect(report.issues).toContainEqual(expect.stringMatching(/^ARCHITECTURE_CONTRACT_MISSING:/));
    expect(report.issues).not.toContain(pending);
  });

  it('rejects base payment coupling to a proposed change order with a named diagnostic', () => {
    const copy = validControl(); const contract = copy.read('planning-integrity.json');
    const base = contract.releaseScopes.find((s: any) => s.kind === 'base-contract');
    const extra = contract.releaseScopes.find((s: any) => s.kind === 'change-order' && s.status === 'proposed');
    expect(base).toBeDefined(); expect(extra).toBeDefined();
    const producer = contract.nodes.find((n: any) => n.releaseScope === extra.id && n.provides.length);
    const payment = contract.milestones.filter((m: any) => m.payment && (m.releaseScope ?? base.id) === base.id).sort((a: any, b: any) => b.stage - a.stage)[0];
    expect(producer).toBeDefined(); expect(payment).toBeDefined();
    payment.requires.push(producer.provides[0]); bindPlanning(copy, contract);
    expect(plan(copy.run).issues).toContainEqual(expect.stringMatching(new RegExp(`^RELEASE_TRAIN_COUPLED: ${payment.id}:`)));
  });

  it('rejects mistyped conflict scope instead of silently clearing affected execution', () => {
    const copy = validControl(); const contract = copy.read('planning-integrity.json');
    expect(contract.conflicts.length).toBeGreaterThan(0);
    contract.conflicts[0].targets = ['misspelled-target']; bindPlanning(copy, contract);
    expect(plan(copy.run).issues).toContainEqual(expect.stringMatching(/^SOURCE_CONFLICT_TARGET_UNKNOWN:/));
  });
});
