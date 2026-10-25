import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createOwnerAttestedScopeReview, ownerAttestationProvider, parseDeliveryManifest, planDeliveryReview, validateDelivery } from '../../src/delivery/index.js';
import type { DeliveryDecision, TrustedReviewProvider } from '../../src/delivery/index.js';
import { createDeliveryFixture, deliveryFixtureRoots } from './delivery-fixture.js';

const packageRoot = path.resolve(__dirname, '../..');
afterEach(() => deliveryFixtureRoots.splice(0).forEach(root => fs.rmSync(root, { recursive: true, force: true })));
const pending = 'scope: original-source coverage review pending or provenance unverified';

/** Single-owner consultancy policy: owner design acceptance plus independent AI review. */
function fixture() {
  const f = createDeliveryFixture();
  Object.assign(f.manifest.authorization, { designAcceptance: 'owner', checkpoints: 'every-slice', independentReview: true });
  const code = () => planDeliveryReview(f.scope(), 'scope-review', ['O1']).binding.scopeDigest.slice(0, 8);
  const attest = (edit: (d: DeliveryDecision) => void = () => {}) => {
    const d = createOwnerAttestedScopeReview(f.scope(), { id: 'owner-scope', reviewerId: 'owner', contextId: 'owner-chat', reference: 'chat:owner/2026-10-25T10:00:00Z', quote: `Yes, approve scope ${code()}, the ledger covers my brief.`, messageAt: '2026-10-25T10:00:00Z', reason: 'Owner confirmed in chat that the outcome ledger covers the original sources.' });
    edit(d); f.manifest.decisionRefs.push(d); f.save(); return d;
  };
  const plan = (provider: TrustedReviewProvider | undefined = ownerAttestationProvider, stage: 'plan' | 'execute' = 'plan') => { f.save(); return validateDelivery(f.run, { stage, trustedReviewProvider: provider }); };
  return { ...f, code, attest, plan };
}
const always: TrustedReviewProvider = { verify: () => true };

describe('owner-attested scope review', () => {
  it('makes the plan ready with a complete attested record, without claiming authentication', () => {
    const f = fixture(); expect(f.plan().issues).toEqual([pending]);
    f.attest();
    const report = f.plan(); expect(report.issues).toEqual([]); expect(report.completion.planReady).toBe(true);
    expect(report.scopeReview).toEqual({ approved: true, provenance: 'owner-attested', missingRoles: ['independent'] });
    // Execution still needs the separately authenticated independent review.
    expect(f.plan(ownerAttestationProvider, 'execute').issues).toContain(pending);
    expect(planDeliveryReview(f.scope(), 'scope-review', ['O1'], { trustedReviewProvider: ownerAttestationProvider })).toMatchObject({ action: 'review', missingRoles: ['independent'] });
  });

  it('satisfies the owner duty at execute when an authenticated independent review also exists', () => {
    const f = fixture(); f.reviewScope(); f.attest();
    const both: TrustedReviewProvider = { verify: (d, b) => ownerAttestationProvider.verify(d, b) || f.provider.verify(d, b) };
    const report = f.plan(both, 'execute'); expect(report.issues).toEqual([]);
    expect(report.scopeReview).toMatchObject({ approved: true, provenance: 'owner-attested', missingRoles: [] });
    expect(f.plan(f.provider, 'execute').issues).toContain(pending);
  });

  it('rejects model-only records, even with owner role or a matching binding', () => {
    const f = fixture(); const { binding } = planDeliveryReview(f.scope(), 'scope-review', ['O1']);
    f.manifest.decisionRefs.push({ id: 'agent-scope', kind: 'scope-review', ...binding, reviewer: { id: 'agent', contextId: 'builder-context', role: 'agent' }, provenance: { kind: 'review-session', reference: 'local://agent-review' }, result: 'approved', reason: 'Agent compared the sources with the ledger.' });
    f.manifest.decisionRefs.push({ id: 'owner-message', kind: 'scope-review', ...binding, reviewer: { id: 'owner', contextId: 'owner-chat', role: 'owner' }, provenance: { kind: 'owner-message', reference: 'chat:unverified' }, result: 'approved', reason: 'Owner said yes somewhere.' });
    expect(f.plan().issues).toEqual([pending]);
  });

  it.each([
    ['a digest mismatch', (d: DeliveryDecision) => { d.provenance.attestation!.scopeDigest = 'f'.repeat(64); d.provenance.attestation!.quote = 'approve scope ffffffff'; }],
    ['a missing quote', (d: DeliveryDecision) => { d.provenance.attestation!.quote = '  '; }],
    ['a quote that does not repeat the scope code', (d: DeliveryDecision) => { d.provenance.attestation!.quote = 'Yes, looks good.'; }],
    ['a future message time', (d: DeliveryDecision) => { d.provenance.attestation!.messageAt = '2999-01-01T00:00:00Z'; }],
    ['a non-owner reviewer', (d: DeliveryDecision) => { d.reviewer.role = 'independent'; }],
  ])('fails the plan gate with %s', (_label, edit) => {
    const f = fixture(); f.attest(edit);
    expect(f.plan().issues).toEqual([pending]);
    // A permissive host verifier cannot rescue an incomplete attestation.
    expect(f.plan(always).issues).toEqual([pending]);
  });

  it('stops applying once the attested scope changes', () => {
    const f = fixture(); f.attest(); expect(f.plan().issues).toEqual([]);
    f.manifest.outcomes[0].applicabilityReason = 'Explicitly requested, reworded'; f.save();
    expect(f.plan().issues).toEqual([pending]);
  });

  it('honours an attested rejection over an authenticated approval', () => {
    const f = fixture(); f.reviewScope(); f.attest(d => { d.result = 'rejected'; });
    const both: TrustedReviewProvider = { verify: (d, b) => ownerAttestationProvider.verify(d, b) || f.provider.verify(d, b) };
    expect(f.plan(both).issues).toEqual([pending]);
  });

  it('never counts an attestation as an independent review or another decision kind', () => {
    const f = fixture(); f.attest();
    expect(f.plan(always, 'execute').issues).toContain(pending);
    const { binding } = planDeliveryReview(f.scope(), 'scope-review', ['O1']);
    const acceptance = { ...f.manifest.decisionRefs[0], id: 'attested-acceptance', kind: 'acceptance' as const };
    expect(ownerAttestationProvider.verify(acceptance, binding)).toBe(false);
  });

  it('refuses to build a record whose quote does not confirm this scope, and rejects malformed provenance', () => {
    const f = fixture();
    expect(() => createOwnerAttestedScopeReview(f.scope(), { id: 'x', reviewerId: 'owner', contextId: 'chat', reference: 'chat:1', quote: 'yes', messageAt: '2026-10-25T10:00:00Z', reason: 'Owner confirmed.' })).toThrow('does not repeat the first 8 characters');
    const d = f.attest(); const manifest = JSON.parse(fs.readFileSync(path.join(f.run, 'delivery-manifest.json'), 'utf8'));
    const attested = manifest.decisionRefs.find((r: DeliveryDecision) => r.id === d.id);
    delete attested.provenance.attestation; expect(() => parseDeliveryManifest(manifest)).toThrow('requires attestation');
    attested.provenance = { kind: 'review-session', reference: 'x', attestation: d.provenance.attestation }; expect(() => parseDeliveryManifest(manifest)).toThrow('restricted to owner-attested provenance');
  });

  it('works through the shell gate with the built-in reference adapter', () => {
    const f = fixture();
    f.write('runs/current/tasks-proof.md', [
      '## T1 - Useful result', '- **Closes user story:** As a consumer, I want a useful result, so that I can recover from failure.',
      '- **Change type:** modify-existing', '- **File:** `app.ts`', '- **Precise change:** return the useful result and a reachable recovery.', '- **Acceptance:**',
      '  - Valid requests produce the useful result.', '  - Invalid requests preserve existing state.', '  - Failed requests reach a useful recovery action.',
      '- **Depends on:** none', '- **Test:** `npm test`', '- **Estimated LOC:** ~20', '- **Phase:** mvp', '- **Artifact kind:** runtime-source', '- **Requirement IDs:** R1',
      '- **Evidence level:** unit', '- **Runtime reachability:** production entry point', '- **Production owner:** app.ts', '- **Composition map:** production', '',
    ].join('\n')); f.save();
    const run = (...args: string[]) => { const r = spawnSync('bash', [path.join(packageRoot, 'scripts/validate-delivery.sh'), f.run, ...args], { encoding: 'utf8' }); return { code: r.status, out: r.stdout + r.stderr }; };
    const binding = run('--scope-binding'); expect(binding.code, binding.out).toBe(0);
    expect(JSON.parse(binding.out).prompt).toContain(`approve scope ${f.code()}`);
    f.attest();
    const without = run('--stage', 'plan'); expect(without.code).toBe(1); expect(without.out).toContain(pending);
    const withAdapter = run('--stage', 'plan', '--owner-attestation'); expect(withAdapter.code, withAdapter.out).toBe(0);
    expect(JSON.parse(withAdapter.out).scopeReview.provenance).toBe('owner-attested');
  }, 60000);
});
