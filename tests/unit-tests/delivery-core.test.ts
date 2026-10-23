import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { deliveryReviewBinding, deliveryScopeDigest, resolveDeliveryScope, validateDelivery } from '../../src/delivery/index.js';

import { createDeliveryFixture as fixture, deliveryFixtureRoots as roots } from './delivery-fixture.js';
afterEach(() => { for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true }); });

describe('outcome delivery source, evidence and acceptance contract', () => {
  it.each(['api','cli','sdk','data','ml','infrastructure','document','web','native','desktop'] as const)('accepts a complete %s proof and consistent real release', kind => {
    const f = fixture(kind); f.reviewScope(); expect(f.validate().issues).toEqual([]); f.evidence(); f.accept();
    expect(f.validate('advance').issues).toEqual([]); const release = f.validate('release'); expect(release.issues).toEqual([]); expect(release.completion.releaseReady).toBe(true);
  });
  it('does not equate a bounded executable plan with accepted first proof', () => {
    const f = fixture(); f.reviewScope(); expect(f.validate().valid).toBe(true); const advance = f.validate('advance'); expect(advance.valid).toBe(false); expect(advance.completion.proofAccepted).toBe(false);
  });
  it('retains pending original-scope review offline; invented sessions cannot authenticate it', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept(); expect(f.validate('advance', false).issues.join('\n')).toContain('provenance unverified');
    f.manifest.decisionRefs.forEach(d => { d.provenance.reference = 'trusted://copied-session-id'; }); expect(f.validate('advance').valid).toBe(false);
  });
  it('rejects self-review disguised as independent review', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept(); const d = f.manifest.decisionRefs.find(d => d.kind === 'acceptance')!; d.reviewer.contextId = 'builder-context';
    // Even a receipt signed by the fake host must obey independent context policy.
    f.trust({ ...d, id: 'bad-self' }, deliveryReviewBinding(f.scope(), ['O1'])); f.manifest.slices[0].acceptanceDecisionId = 'bad-self'; expect(f.validate('advance').valid).toBe(false);
  });
  it.each(['every-slice','autonomous'] as const)('preserves cumulative owner and independent acceptance duties with %s transitions', checkpoints => {
    const f = fixture(); f.manifest.authorization.checkpoints = checkpoints; f.manifest.authorization.designAcceptance = 'owner';
    // Scope coverage itself is owner-reserved too.
    const sourceBinding = { scopeDigest: deliveryScopeDigest(f.manifest), outcomeIds: ['O1'], artifactDigests: [...f.manifest.sourceInputs.map(s => s.sha256), ...f.requirements.originalSources.map(s => s.sha256)].sort() };
    f.trust({ id: 'owner-scope', kind: 'scope-review', ...sourceBinding, reviewer: { id: 'owner', role: 'owner', contextId: 'owner-context' }, provenance: { kind: 'owner-message', reference: 'trusted://owner-scope' }, reason: 'Owner reviewed full original requirement coverage', result: 'approved' }, sourceBinding);
    f.evidence(); f.accept(); expect(f.validate('advance').valid).toBe(false); // independent alone loses owner duty
    const binding = deliveryReviewBinding(f.scope(), ['O1']); const ownerDecision = { id: 'owner-accept', kind: 'acceptance' as const, ...binding, reviewer: { id: 'owner', role: 'owner' as const, contextId: 'owner-context' }, provenance: { kind: 'owner-message' as const, reference: 'trusted://owner-accept' }, reason: 'Owner inspected complete product result and recovery', result: 'approved' as const };
    f.trust(ownerDecision, binding); const independentId = f.manifest.slices[0].acceptanceDecisionId!; f.manifest.slices[0].acceptanceDecisionId = ownerDecision.id;
    expect(f.validate('advance').valid).toBe(false); // owner alone loses independent duty
    f.manifest.slices[0].acceptanceDecisionIds = [independentId, ownerDecision.id]; expect(f.validate('advance').issues).toEqual([]);
  });
  it('requires owner acceptance when checkpoints are owner-reserved', () => {
    const f = fixture(); f.manifest.authorization.checkpoints = 'every-slice'; f.reviewScope(); f.evidence(); f.accept(); expect(f.validate('advance').issues.join('\n')).toContain('review pending');
  });
  it('catches homepage/entry omission and source requirement removal', () => {
    const f = fixture('web'); f.manifest.outcomes[0].entryPoint = '/hidden-component'; f.reviewScope(); expect(f.validate().issues.join('\n')).toContain('entry point omitted');
    f.manifest.outcomes[0].requirementIds = ['invented']; f.reviewScope(); expect(f.validate().issues.join('\n')).toContain('missing authoritative requirement');
  });
  it('rejects deleting authoritative recovery check or demoting required release scope', () => {
    const f = fixture(); f.manifest.outcomes[0].checks = f.manifest.outcomes[0].checks.filter(c => c.kind !== 'recovery'); f.manifest.outcomes[0].releaseRequired = false; f.reviewScope(); const result = f.validate(); expect(result.valid).toBe(false); expect(result.issues.join('\n')).toContain('demoted'); expect(result.issues.join('\n')).toContain('authoritative check');
  });
  it('detects original source drift even if generated requirements were left unchanged', () => {
    const f = fixture(); f.reviewScope(); f.write('brief.md', 'Actually all roles and a new release duty are required.'); expect(f.validate().issues.join('\n')).toContain('stale or mismatched');
  });
  it('requires raw original sources, rather than a model-generated requirement document alone', () => {
    const f = fixture(); f.requirements.originalSources = []; f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) }; expect(f.validate().valid).toBe(false);
  });
  it('fails UI proof when the fallback was unvisited or approval only saw a palette', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.manifest.evidenceRefs = f.manifest.evidenceRefs.filter(e => e.capture?.state !== 'recovery'); f.accept(); expect(f.validate('advance').issues.join('\n')).toContain('required surface evidence');
    f.evidence(); f.manifest.evidenceRefs.filter(e => e.capture).forEach(e => { e.capture!.composed = false; }); f.accept(); expect(f.validate('advance').valid).toBe(false);
  });
  it('rejects renamed text screenshots, empty artifacts and escaped artifact paths', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); const screenshot = f.manifest.evidenceRefs.find(e => e.kind === 'image')!; screenshot.artifact = f.write(screenshot.artifact.path, 'This text file claims to be a screenshot'); f.accept(); expect(f.validate('advance').issues.join('\n')).toContain('composed image capture');
    screenshot.artifact = f.write(screenshot.artifact.path, Buffer.alloc(0)); f.accept(); expect(f.validate('advance').valid).toBe(false);
    screenshot.artifact.path = '../outside.png'; expect(f.validate('advance').valid).toBe(false);
  });
  it('rejects stale and cross-environment screenshot bindings', () => {
    const f = fixture('web'); f.reviewScope(); f.evidence(); f.accept(); f.manifest.surfaces[0].target.environment = 'different-staging'; f.reviewScope(); const result = f.validate('advance'); expect(result.valid).toBe(false); expect(result.issues.join('\n')).toContain('stale source, contract, dependency or target');
  });
  it('requires actual headless consumer evidence without adding irrelevant screenshots', () => {
    const f = fixture('api'); f.reviewScope(); f.evidence(); f.manifest.evidenceRefs[0].kind = 'execution'; f.accept(); expect(f.validate('advance').valid).toBe(false);
  });
  it('preserves controlled-provider proof but blocks fake-provider release and candidate mixing', () => {
    const f = fixture(); f.manifest.surfaces[0].target.providerMode = 'controlled'; f.reviewScope(); f.evidence(); f.accept(); expect(f.validate('advance').valid).toBe(true); expect(f.validate('release').valid).toBe(false);
    const g = fixture(); g.reviewScope(); g.evidence(); g.manifest.evidenceRefs[0].releaseCandidate = 'old-build'; g.accept(); expect(g.validate('release').valid).toBe(false);
  });
  it('carries source-stale evidence only with authenticated historical and fresh current-scope inspections', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept();
    f.manifest.surfaces[0].target.bindings[0] = f.write('app.ts', 'export const production = true; // harmless documentation change'); f.reviewScope(); expect(f.validate('advance').valid).toBe(false);
    const binding = deliveryReviewBinding(f.scope(), ['O1']); const carrier = { id: 'carry', kind: 'carry-forward' as const, ...binding, evidenceIds: f.manifest.evidenceRefs.map(e => e.id), reviewer: { id: 'reviewer', role: 'independent' as const, contextId: 'review-context' }, provenance: { kind: 'review-session' as const, reference: 'trusted://carry' }, reason: 'Independently inspected current diff and re-exercised result; original observation remains applicable', result: 'approved' as const };
    f.manifest.decisionRefs.push(carrier); f.accept(); expect(f.validate('advance').valid).toBe(false); // local forged receipt is insufficient
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.id !== 'carry'); f.trust(carrier, binding); f.accept(); expect(f.validate('advance').issues).toEqual([]);
    f.manifest.evidenceRefs[0].command = 'rewritten original observation'; f.accept(); expect(f.validate('advance').valid).toBe(false);
  });
  it('can recapture and approve current checks while retaining stale historical evidence records', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept(); const oldIds = f.manifest.evidenceRefs.map(e => e.id);
    f.manifest.surfaces[0].target.bindings[0] = f.write('app.ts', 'export const changedComposition = true;'); f.reviewScope(); f.evidence(); f.accept(); const result = f.validate('release'); expect(result.issues).toEqual([]); expect(oldIds.every(id => f.manifest.evidenceRefs.some(e => e.id === id))).toBe(true);
    expect(result.completion.staleOutcomeIds).toContain('O1'); expect(result.completion.releaseReady).toBe(true);
  });
  it('never carries evidence across provider/environment changes or production attribution uplift', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept(); f.manifest.surfaces[0].target.environment = 'other-environment'; f.reviewScope(); const binding = deliveryReviewBinding(f.scope(), ['O1']);
    f.trust({ id: 'carry', kind: 'carry-forward', ...binding, evidenceIds: f.manifest.evidenceRefs.map(e => e.id), reviewer: { id: 'reviewer', role: 'independent', contextId: 'review-context' }, provenance: { kind: 'review-session', reference: 'trusted://carry' }, reason: 'Changed target but falsely treating it as harmless source change', result: 'approved' }, binding); f.accept(); expect(f.validate('advance').valid).toBe(false);
  });
  it('invalidates composition acceptance when reviewed source or detailed plan changes', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); f.accept(); f.write('app.ts', 'export const production = false;'); expect(f.validate('advance').completion.acceptedOutcomeIds).toEqual([]);
    const g = fixture(); g.reviewScope(); g.evidence(); g.accept(); g.write('runs/current/tasks-proof.md', 'Different unreviewed implementation and acceptance'); expect(g.validate('advance').completion.acceptedOutcomeIds).toEqual([]);
  });
  it('accepts mixed composed UI and headless production proof with both profiles', () => {
    const f = fixture('web'); const secondSource = f.write('worker.ts', 'export const consumer = true;');
    f.manifest.surfaces.push({ id: 'service', kind: 'api', entryPoint: '/consume', target: { id: 'service-target', environment: 'production-equivalent', providerMode: 'real', identity: { consumer: 'production mobile app' }, bindings: [secondSource] } });
    f.requirements.requirements[0].surfaceIds.push('service'); f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) };
    f.manifest.outcomes.push({ ...f.manifest.outcomes[0], id: 'O2', surfaceId: 'service', entryPoint: '/consume', requiredEvidenceKinds: ['consumer'], dependencies: [] }); f.manifest.slices[0].outcomeIds.push('O2'); f.manifest.slices[0].units.push({ id: 'tasks-proof.md#T2', outcomeIds: ['O2'], acceptance: 'Real service consumer and recovery', affectedPaths: ['worker.ts'], dependsOn: [] });
    f.reviewScope(); f.evidence(); f.evidence('O2'); f.accept(); expect(f.validate('release').issues).toEqual([]);
  });
  it('invalidates prerequisite eligibility transitively even when dependent own source did not change', () => {
    const f = fixture(); const secondSource = f.write('worker.ts', 'export const downstream = true;');
    f.manifest.surfaces.push({ id: 'service', kind: 'api', entryPoint: '/consume', target: { id: 'service-target', environment: 'production-equivalent', providerMode: 'real', identity: { consumer: 'downstream' }, bindings: [secondSource] } });
    f.requirements.requirements[0].surfaceIds.push('service'); f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) };
    f.manifest.outcomes.push({ ...f.manifest.outcomes[0], id: 'O2', surfaceId: 'service', entryPoint: '/consume', dependencies: [{ outcomeId: 'O1', kind: 'technical' }] }); f.manifest.slices[0].outcomeIds.push('O2'); f.manifest.slices[0].units.push({ id: 'tasks-proof.md#T2', outcomeIds: ['O2'], acceptance: 'Downstream consumer and recovery', affectedPaths: ['worker.ts'], dependsOn: ['tasks-proof.md#T1'] });
    f.reviewScope(); f.evidence(); f.evidence('O2'); f.accept(); expect(f.validate('advance').valid).toBe(true);
    f.manifest.surfaces[0].target.bindings[0] = f.write('app.ts', 'export const changedContract = true;'); f.reviewScope(); let result = f.validate('advance'); expect(result.completion.staleOutcomeIds.sort()).toEqual(['O1','O2']);
    f.evidence('O1'); result = f.validate('advance'); expect(result.completion.technicallyVerifiedOutcomeIds).toContain('O1'); expect(result.completion.technicallyVerifiedOutcomeIds).not.toContain('O2');
  });
  it('does not silently waive explicit or non-waivable source duties', () => {
    const f = fixture(); f.manifest.outcomes[0].applicability = 'excluded'; f.reviewScope(); expect(f.validate().issues.join('\n')).toContain('lacks authorized');
    f.requirements.requirements[0].nonWaivable = true; f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) }; f.reviewScope(); expect(f.validate().issues.join('\n')).toContain('non-waivable obligation');
  });
});

describe('bounded planning corpus and resolver fail-closed behavior', () => {
  it('separates permission to execute a plan from completion of the active slice', () => {
    const f = fixture(); f.manifest.authorization.execution = false; f.reviewScope(); expect(f.validate('plan').valid).toBe(true); f.save(); expect(validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: f.provider }).issues.join(' ')).toContain('execution has not been granted');
    f.manifest.authorization.execution = true; f.reviewScope(); f.save(); expect(validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: f.provider }).valid).toBe(true); expect(f.validate('advance').valid).toBe(false);
  });
  it('exempts derived projections only after exact canonical host verification', () => {
    const f = fixture(); f.reviewScope(); const generated = 'canonical derived task report'; f.write('runs/current/task-contract.json', generated); f.save();
    const options = { stage: 'plan' as const, trustedReviewProvider: f.provider, trustedProjectionProvider: { verify: (file: string, content: Buffer) => path.basename(file) === 'task-contract.json' && content.toString('utf8') === generated } };
    expect(validateDelivery(f.run, options).valid).toBe(true); f.write('runs/current/task-contract.json', 'unimplemented hidden detail'); expect(validateDelivery(f.run, options).valid).toBe(false);
    f.write('runs/current/other.txt', generated); expect(validateDelivery(f.run, { ...options, trustedProjectionProvider: { verify: () => true } }).valid).toBe(false);
  });

  it.each(['.cache/packet.md','dist/packet.prompt','node_modules/packet.weird','hidden.detail'])('counts pending detail at %s without extension/directory exemptions', file => {
    const f = fixture(); f.reviewScope(); f.write(`runs/current/${file}`, 'pending '.repeat(4100)); const result = f.validate(); expect(result.metrics.pendingWords).toBeGreaterThan(4100); expect(result.valid).toBe(false);
  });
  it('does not exempt failed evidence artifacts from the pending planning corpus', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); const e = f.manifest.evidenceRefs[0]; e.artifact = f.write('runs/current/packet.prompt', 'hidden planning '.repeat(4100)); e.result = 'fail'; const result = f.validate(); expect(result.metrics.pendingWords).toBeGreaterThan(4100); expect(result.valid).toBe(false);
  });
  it('binds approval to the full evidence record, including production/release attribution', () => {
    const f = fixture(); f.reviewScope(); f.evidence(); const e = f.manifest.evidenceRefs[0]; e.productionComposition = false; e.releaseCandidate = 'old-build'; f.accept(); expect(f.validate('advance').valid).toBe(true); expect(f.validate('release').valid).toBe(false);
    e.productionComposition = true; e.releaseCandidate = f.manifest.releaseCandidate; e.command = 'different unreviewed production invocation'; expect(f.validate('release').valid).toBe(false);
  });

  it('counts nested and archived pending detail independent of filename or declared registration', () => {
    const f = fixture(); f.reviewScope(); f.write('runs/current/archive/research-packet.yaml', 'pending '.repeat(4100)); const result = f.validate(); expect(result.metrics.pendingWords).toBeGreaterThan(4100); expect(result.issues.join('\n')).toContain('unregistered pending detail'); expect(result.issues.join('\n')).toContain('exceeds 4000');
  });
  it('counts unregistered corpusRoots outside the active run', () => {
    const f = fixture(); f.manifest.planningBudget.corpusRoots.push('archive'); f.write('archive/feature-appendix.txt', 'detail '.repeat(4100)); f.reviewScope(); expect(f.validate().metrics.pendingWords).toBeGreaterThan(4100);
  });
  it('rejects detailed content hidden in a ledger and oversized indivisible units', () => {
    const f = fixture(); f.write('runs/current/ledger.md', 'detail '.repeat(700)); f.manifest.planningBudget.ledgerFiles.push('runs/current/ledger.md'); f.manifest.slices[0].units[0].affectedPaths = Array.from({ length: 31 }, (_, i) => `file-${i}.ts`); f.reviewScope(); expect(f.validate().issues.join('\n')).toContain('disguised as concise ledger'); expect(f.validate().issues.join('\n')).toContain('megaslice');
  });
  it('caps actual prompt bytes as well as word counts and does not fabricate token estimates', () => {
    const f = fixture(); f.write('runs/current/tasks-proof.md', 'a'.repeat(33000)); f.reviewScope(); const result = f.validate(); expect(result.metrics.pendingWords).toBe(1); expect(result.issues.join('\n')).toContain('pending bytes exceeds'); expect(result.metrics).not.toHaveProperty('observedTokens');
  });
  it('excludes completed detail only with retained current artifact-bound review', () => {
    const f = fixture(); f.write('runs/current/tasks-proof.md', 'completed '.repeat(6500)); f.reviewScope(); f.evidence(); f.accept(); expect(f.validate('advance').metrics.pendingWords).toBe(0); expect(f.validate('advance').valid).toBe(true);
    f.write('runs/current/tasks-proof.md', 'unreviewed '.repeat(6500)); const result = f.validate(); expect(result.metrics.pendingWords).toBe(6500); expect(result.valid).toBe(false);
  });
  it('does not treat arbitrary session restarts as budget extensions', () => {
    const f = fixture(); f.manifest.planningBudget.extensionDecisionId = 'invented-extension'; f.reviewScope(); expect(f.validate().issues.join('\n')).toContain('extension needs');
  });
  it('blocks unrelated breadth before first proof, even with technical prerequisite evidence', () => {
    const f = fixture(); f.evidence(); f.manifest.slices.push({ ...f.manifest.slices[0], id: 'second', kind: 'delivery', units: [{ ...f.manifest.slices[0].units[0], id: 'tasks-next.md#T1' }], detailedFiles: ['tasks-next.md'] }); f.write('runs/current/tasks-next.md', 'Implement unrelated breadth'); f.manifest.activeSlice = 'second'; f.reviewScope(); const result = f.validate(); expect(result.issues.join('\n')).toContain('first proof must be accepted'); expect(result.issues.join('\n')).toContain('pending slices exceeds 1');
  });
  it('returns null only for genuine legacy and rejects malformed/unknown/missing migrated manifests', () => {
    const f = fixture(); fs.unlinkSync(path.join(f.run, 'delivery-manifest.json')); expect(resolveDeliveryScope(f.run)).toBeNull(); expect(() => resolveDeliveryScope(f.run, { allowLegacy: false })).toThrow('manifest required');
    f.write('runs/current/resumption-checkpoint.md', '---\nrun_directory: runs/current\n---\n'); expect(() => resolveDeliveryScope(f.run)).toThrow('refusing legacy downgrade');
    fs.rmSync(path.join(f.run, 'resumption-checkpoint.md')); f.save(); const m = JSON.parse(fs.readFileSync(path.join(f.run, 'delivery-manifest.json'), 'utf8')); m.schemaVersion = 999; f.write('runs/current/delivery-manifest.json', JSON.stringify(m)); expect(() => resolveDeliveryScope(f.run)).toThrow('unknown schemaVersion');
  });
  it('cannot bypass migration by addressing a run/task file after its manifest disappears', () => {
    const f = fixture(); f.write('prompts/outputs/current/resumption-checkpoint.md', '---\nrun_directory: runs/current\n---\n'); fs.unlinkSync(path.join(f.run, 'delivery-manifest.json'));
    expect(() => resolveDeliveryScope(f.run)).toThrow('manifest required'); expect(() => resolveDeliveryScope(path.join(f.run, 'tasks-proof.md'))).toThrow('manifest required');
  });
  it('follows checkpoint selected isolated run and returns absolute active files only', () => {
    const f = fixture(); f.write('resumption-checkpoint.md', '---\nrun_directory: runs/current\n---\n'); const resolved = resolveDeliveryScope(f.root)!; expect(resolved.runDirectory).toBe(f.run); expect(resolved.activeFiles).toEqual([path.join(f.run, 'tasks-proof.md')]);
  });
  it.each(['./app.ts','nested/../app.ts','app-alias.ts'])('canonicalizes ownership paths before checking collisions: %s', alias => {
    const f = fixture(); fs.mkdirSync(path.join(f.root, 'nested')); fs.symlinkSync(path.join(f.root,'app.ts'),path.join(f.root,'app-alias.ts')); f.manifest.slices[0].units.push({ ...f.manifest.slices[0].units[0], id: 'tasks-proof.md#T2', affectedPaths: [alias], dependsOn: [] }); f.reviewScope(); expect(f.validate('execute').issues.join(' ')).toContain('unordered ownership collision');
    f.manifest.slices[0].units[1].dependsOn = ['tasks-proof.md#T1']; expect(f.validate('execute').valid).toBe(true);
  });
  it('rejects duplicate aliases within one implementation unit', () => {
    const f = fixture(); f.manifest.slices[0].units[0].affectedPaths = ['app.ts','./app.ts']; f.reviewScope(); expect(f.validate('execute').issues.join(' ')).toContain('duplicate/aliased');
  });
  it('rejects symlink escapes and cyclic outcome dependencies', () => {
    const f = fixture(); const outside = fs.mkdtempSync(path.join(os.tmpdir(), 'delivery-outside-')); roots.push(outside); fs.writeFileSync(path.join(outside, 'escape.md'), 'escape'); fs.symlinkSync(path.join(outside, 'escape.md'), path.join(f.run, 'escape.md')); f.manifest.slices[0].detailedFiles = ['escape.md']; f.save(); expect(() => resolveDeliveryScope(f.run)).toThrow('symlink escapes');
    const g = fixture(); g.manifest.outcomes[0].dependencies = [{ outcomeId: 'O1', kind: 'technical' }]; g.reviewScope(); expect(g.validate().valid).toBe(false);
  });
});
