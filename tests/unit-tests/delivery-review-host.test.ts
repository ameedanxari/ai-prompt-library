import * as fs from 'node:fs';
import * as path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHostReviewProvider, dispatchDeliveryReview, deliveryUnitReviewBinding, planDeliveryUnitReview, validateDelivery } from '../../src/delivery/index.js';
import type { DeliveryDecision, DeliveryHostReviewReceipt, DeliveryReviewHost, DeliveryReviewRequest } from '../../src/delivery/index.js';
import { runDeliveryCli } from '../../src/execution/delivery-cli.js';
import { createDeliveryFixture, deliveryFixtureRoots } from './delivery-fixture.js';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllEnvs(); for (const root of deliveryFixtureRoots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });
function hostFixture() {
  // Test double for the authenticated host session store. Runtime clients cannot
  // add receipts by inserting decisions in the producer's manifest.
  const records = new Map<string, DeliveryHostReviewReceipt>(); const requests: DeliveryReviewRequest[] = [];
  const host: DeliveryReviewHost = {
    readReceipt: reference => structuredClone(records.get(reference)),
    async dispatch(request) {
      requests.push(structuredClone(request));
      const id = `host-review-${records.size}`; const reference = `host://session/${id}`;
      const session = { actorId: 'separate-reviewer', contextId: `distinct-session-${records.size}`, role: request.role };
      const decision: DeliveryDecision = { id, kind: request.kind, ...request.binding, ...(request.unitId ? { unitId: request.unitId } : {}), reviewer: { id: session.actorId, contextId: session.contextId, role: session.role }, provenance: { kind: 'review-session', reference }, result: 'approved', reason: 'Test host session inspected the original requirements, exact bound plan and retained execution evidence.' };
      records.set(reference, structuredClone({ decision, binding: request.binding, session })); return reference;
    },
  };
  return { host, records, requests, provider: createHostReviewProvider(host) };
}

describe('configured review host', () => {
  it('dispatches missing independent roles, authenticates exact host actor/context and reuses current decisions', async () => {
    const f = createDeliveryFixture(); const h = hostFixture();
    const result = await dispatchDeliveryReview(f.scope(), { kind: 'scope-review', outcomeIds: ['O1'] }, h.host);
    expect(h.requests).toHaveLength(1); expect(result.decisions).toHaveLength(1);
    f.manifest.decisionRefs.push(...result.decisions); f.save();
    expect(validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: h.provider }).valid).toBe(true);
    expect((await dispatchDeliveryReview(f.scope(), { kind: 'scope-review', outcomeIds: ['O1'] }, h.host)).plan.action).toBe('reuse');
    expect(h.requests).toHaveLength(1);
    const forged = structuredClone(result.decisions[0]); forged.reason = 'Producer substituted its own approval';
    expect(h.provider.verify(forged, result.plan.binding)).toBe(false);
    expect(h.provider.verify(result.decisions[0], { ...result.plan.binding, artifactDigests: [] })).toBe(false);
  });
  it('keeps owner duties for actual human decisions while dispatching independent review', async () => {
    const f = createDeliveryFixture(); f.manifest.authorization.designAcceptance = 'owner'; const h = hostFixture();
    const result = await dispatchDeliveryReview(f.scope(), { kind: 'scope-review', outcomeIds: ['O1'] }, h.host);
    expect(result.plan.missingRoles).toEqual(['owner','independent']); expect(h.requests.map(r => r.role)).toEqual(['independent']);
  });
  it.each(['same-context', 'forged-actor', 'wrong-binding', 'wrong-decision-binding', 'malformed-decision', 'unregistered', 'source-changed'] as const)('rejects %s host results', async change => {
    const f = createDeliveryFixture(); const h = hostFixture(); const dispatch = h.host.dispatch;
    h.host.dispatch = async request => {
      const reference = await dispatch(request); const receipt = h.records.get(reference)!;
      if (change === 'same-context') receipt.session.contextId = receipt.decision.reviewer.contextId = request.implementerContextId;
      if (change === 'forged-actor') receipt.decision.reviewer.id = 'forged-actor';
      if (change === 'wrong-binding') receipt.binding.artifactDigests = [];
      if (change === 'wrong-decision-binding') receipt.decision.scopeDigest = '0'.repeat(64);
      if (change === 'malformed-decision') receipt.decision.reason = '';
      if (change === 'unregistered') h.records.delete(reference);
      if (change === 'source-changed') f.write('brief.md', 'Source was edited while reviewer ran');
      return reference;
    };
    await expect(dispatchDeliveryReview(f.scope(), { kind: 'scope-review', outcomeIds: ['O1'] }, h.host)).rejects.toThrow();
    expect(f.manifest.decisionRefs).toEqual([]);
  });
  it('does not dispatch acceptance before real consumer evidence exists', async () => {
    const f = createDeliveryFixture(); f.reviewScope(); const h = hostFixture();
    const result = await dispatchDeliveryReview(f.scope(), { kind: 'acceptance', outcomeIds: ['O1'] }, h.host, { trustedReviewProvider: f.provider });
    expect(result.plan.action).toBe('blocked'); expect(h.requests).toHaveLength(0);
  });
  it('rejects unchanged declared hashes when raw outcome proof becomes invalid during review', async () => {
    const f = createDeliveryFixture(); f.reviewScope(); f.evidence(); const h = hostFixture(); const dispatch = h.host.dispatch;
    h.host.dispatch = async request => {
      const reference = await dispatch(request);
      f.write(f.manifest.evidenceRefs[0].artifact.path, 'Changed raw proof after dispatch');
      return reference;
    };
    const before = JSON.stringify(f.manifest.decisionRefs);
    await expect(dispatchDeliveryReview(f.scope(), { kind: 'acceptance', outcomeIds: ['O1'] }, h.host, { trustedReviewProvider: f.provider })).rejects.toThrow('became unready');
    expect(JSON.stringify(f.manifest.decisionRefs)).toBe(before);
  });
  it('rejects stale API scopes and on-disk manifest changes during dispatch', async () => {
    const f = createDeliveryFixture(); const h = hostFixture(); const scope = f.scope();
    f.manifest.outcomes[0].actor = 'changed actor'; f.save();
    await expect(dispatchDeliveryReview(scope, { kind: 'scope-review', outcomeIds: ['O1'] }, h.host)).rejects.toThrow('scope is stale');
    expect(h.requests).toHaveLength(0);
    const current = f.scope(); const dispatch = h.host.dispatch;
    h.host.dispatch = async request => { const reference = await dispatch(request); f.manifest.outcomes[0].actor = 'changed during review'; f.save(); return reference; };
    await expect(dispatchDeliveryReview(current, { kind: 'scope-review', outcomeIds: ['O1'] }, h.host)).rejects.toThrow('manifest changed');
    expect(f.manifest.decisionRefs).toEqual([]);
  });
  it('fails clearly when CLI dispatch has no configured host', async () => {
    const f = createDeliveryFixture();
    vi.spyOn(console, 'error').mockImplementation(() => {}); vi.stubEnv('AI_PROMPT_REVIEW_VERIFIER', '');
    expect(await runDeliveryCli([f.run, '--dispatch-review', 'scope-review'])).toBe(2);
  });
  it('CLI dispatches through an explicitly selected outside-project host module and persists authenticated receipts', async () => {
    const f = createDeliveryFixture(); const h = hostFixture();
    const output = vi.spyOn(console, 'log').mockImplementation(() => {});
    f.write('runs/current/tasks-proof.md', `# Proof\n\n## T1\n**Closes user story:** As a consumer, I want a useful result, so that I can recover from failure.\n**Change type:** modify-existing\n**Precise change:** Implement useful consumer success and recovery\n**File:** app.ts\n**Depends on:** none\n**Test:** Exercise the real consumer result and recovery\n**Estimated LOC:** 25\n**Phase:** foundation\n**Requirement IDs:** R1\n**Artifact kind:** runtime-source\n**Evidence level:** unit\n**Runtime reachability:** production entry point\n**Production owner:** app.ts\n**Composition map:** production\n**Acceptance:**\n- Consumer receives useful persisted result\n- Failed consumer can reach recovery\n- Real invocation produces retained evidence\n`);
    // A host-owned module/registry is outside this reviewed fixture project. The
    // module delegates to the test host, rather than trusting project JSON.
    const hostRoot = fs.mkdtempSync(path.join(path.dirname(f.root), 'delivery-host-')); deliveryFixtureRoots.push(hostRoot);
    const adapter = path.join(hostRoot, 'adapter.mjs'); const key = `deliveryHostTest${Date.now()}`;
    (globalThis as Record<string, unknown>)[key] = h.host;
    fs.writeFileSync(adapter, `export const deliveryReviewHost = globalThis[${JSON.stringify(key)}];\n`);
    try {
      const code = await runDeliveryCli([f.run, '--review-verifier', adapter, '--dispatch-review', 'scope-review']);
      expect(JSON.parse(String(output.mock.calls.at(-1)![0])).report.issues).toEqual([]);
      expect(code).toBe(0);
      const persisted = JSON.parse(fs.readFileSync(path.join(f.run, 'delivery-manifest.json'), 'utf8'));
      expect(persisted.decisionRefs).toHaveLength(1); expect(h.provider.verify(persisted.decisionRefs[0], h.requests[0].binding)).toBe(true);
      vi.stubEnv('AI_PROMPT_REVIEW_VERIFIER', adapter);
      expect(await runDeliveryCli([f.run, '--dispatch-review', 'scope-review'])).toBe(0);
      expect(h.requests).toHaveLength(1);
    } finally { delete (globalThis as Record<string, unknown>)[key]; }
  });
});

function rollingFixture() {
  const f = createDeliveryFixture(); const slice = f.manifest.slices[0];
  const addUnits = (total: number) => {
    slice.units = Array.from({ length: total }, (_, i) => ({ id: `tasks-proof.md#T${i + 1}`, outcomeIds: ['O1'], acceptance: `Verified completed consumer work ${i + 1}`, affectedPaths: ['app.ts'], dependsOn: i ? [`tasks-proof.md#T${i}`] : [] }));
    f.write('runs/current/tasks-proof.md', '# Retained proof history\n\n' + slice.units.map((u, i) => `## T${i + 1}\n${(`Bound implementation step ${i + 1} with meaningful verification and retained results. `).repeat(45)}\n`).join('\n'));
    f.save();
  };
  addUnits(5); f.reviewScope(); f.evidence();
  const retire = (index: number) => {
    const unitId = `tasks-proof.md#T${index}`; const binding = deliveryUnitReviewBinding(f.scope(), unitId); const id = `unit-${index}`;
    const d: DeliveryDecision = { id, kind: 'unit-completion', unitId, ...binding, reviewer: { id: 'reviewer', contextId: 'independent-unit-session', role: 'independent' }, provenance: { kind: 'review-session', reference: `trusted://${id}` }, result: 'approved', reason: 'Inspected completed task and full current technical/design outcome proof; retire only bounded detail.' };
    f.trust(d, binding);
  };
  return { ...f, addUnits, retire };
}

describe('rolling bounded proof refinement', () => {
  it('supports nine retained units through reviewed windows without raising caps or accepting the proof', () => {
    const f = rollingFixture(); expect(f.validate().valid).toBe(true);
    for (let i = 1; i <= 4; i++) f.retire(i);
    const completed = f.validate(); expect(completed.metrics.pendingUnits).toBe(1); expect(completed.metrics.pendingWords).toBeLessThan(600);
    f.addUnits(9); const report = f.validate();
    expect(report.issues).toEqual([]); expect(report.metrics.pendingUnits).toBe(5); expect(report.completion.proofAccepted).toBe(false);
    expect(f.validate('advance').valid).toBe(false);
    f.accept(); expect(f.validate('advance').valid).toBe(true);
  });
  it.each(['changed-task', 'failed-evidence', 'forged-receipt', 'self-review'] as const)('restores pending budget after %s', change => {
    const f = rollingFixture(); for (let i = 1; i <= 4; i++) f.retire(i); f.addUnits(9);
    if (change === 'changed-task') {
      const task = path.join(f.run, 'tasks-proof.md'); fs.writeFileSync(task, fs.readFileSync(task, 'utf8').replace('Bound implementation step 1', 'Changed implementation step 1'));
    }
    if (change === 'failed-evidence') f.write(f.manifest.evidenceRefs[0].artifact.path, 'Failed result substituted');
    if (change === 'forged-receipt') f.manifest.decisionRefs.find(d => d.kind === 'unit-completion')!.reason = 'Forged reason';
    if (change === 'self-review') f.manifest.decisionRefs.find(d => d.kind === 'unit-completion')!.reviewer.contextId = f.manifest.authorization.implementerContextId;
    const report = f.validate(); expect(report.valid).toBe(false); expect(report.metrics.pendingUnits).toBeGreaterThan(5);
  });
  it('keeps preambles, unowned sections and auxiliary detail in the counted budget', () => {
    const f = rollingFixture(); for (let i = 1; i <= 4; i++) f.retire(i); f.addUnits(9);
    f.write('runs/current/unowned.md', 'Unregistered retained future task detail '.repeat(1000));
    const report = f.validate(); expect(report.issues.join(' ')).toContain('unregistered pending detail'); expect(report.metrics.pendingWords).toBeGreaterThan(4000);
  });
  it('blocks unit review without full current outcome proof or required composed design acceptance', () => {
    const f = createDeliveryFixture('web'); f.reviewScope();
    expect(planDeliveryUnitReview(f.scope(), f.manifest.slices[0].units[0].id, { trustedReviewProvider: f.provider }).action).toBe('blocked');
    f.evidence();
    expect(planDeliveryUnitReview(f.scope(), f.manifest.slices[0].units[0].id, { trustedReviewProvider: f.provider }).action).toBe('blocked');
    f.acceptDesign();
    expect(planDeliveryUnitReview(f.scope(), f.manifest.slices[0].units[0].id, { trustedReviewProvider: f.provider }).action).toBe('review');
  });
});
