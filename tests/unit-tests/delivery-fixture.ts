import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { canonical, deliveryEvidenceBinding, deliveryReviewBinding, deliveryScopeDigest, resolveDeliveryScope, sha256, validateDelivery } from '../../src/delivery/index.js';
import type { DeliveryDecision, DeliveryManifest, DeliveryScope, DeliverySurface, RequirementDocument, ReviewBinding, TrustedReviewProvider } from '../../src/delivery/index.js';
export const deliveryFixtureRoots: string[] = [];
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9eQAAAAASUVORK5CYII=', 'base64');

/** This fixture is the executable minimal v1 schema example. The receipt store
 * represents a host-owned source; a model-authored local receipt is never trusted. */
export function createDeliveryFixture(kind: DeliverySurface['kind'] = 'api') {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'delivery-core-'))); deliveryFixtureRoots.push(root);
  const run = path.join(root, 'runs', 'current'); fs.mkdirSync(run, { recursive: true });
  const write = (relative: string, content: string | Buffer) => { const file = path.join(root, relative); fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); return { path: relative, sha256: sha256(content) }; };
  write('AGENTS.md', 'Project root marker'); const original = write('brief.md', 'Deliver a useful consumer result and reachable recovery.'); const source = write('app.ts', 'export const production = true;');
  const requirements: RequirementDocument = { schemaVersion: 1, originalSources: [original], requirements: [{ id: 'R1', description: 'Useful result and recovery', sourceRefs: ['brief.md'], explicit: true, nonWaivable: false, releaseRequired: true, surfaceIds: ['main'], checks: [{ id: 'success', kind: 'success', description: 'Consumer receives useful persisted result' }, { id: 'recovery', kind: 'recovery', description: 'Consumer reaches recovery after failure' }] }] };
  const input = write('requirements.json', JSON.stringify(requirements));
  const visual = ['web','native','desktop'].includes(kind);
  write('runs/current/tasks-proof.md', '# Proof\n\n## T1\nImplement useful result and its recovery with real composition.\n');
  const manifest: DeliveryManifest = {
    schemaVersion: 1, kind: 'outcome-delivery', runId: 'run-1', scopeRevision: 1, projectRoot: '../..', sourceInputs: [{ id: 'brief-requirements', ...input }],
    surfaces: [{ id: 'main', kind, entryPoint: '/', target: { id: 'target-1', environment: 'disposable-production-equivalent', providerMode: 'real', bindings: [source], identity: kind === 'native' ? { os: 'iOS 18', device: 'iPhone' } : kind === 'sdk' ? { consumer: 'sample app', version: '1' } : ['data','ml'].includes(kind) ? { input: 'representative-1', evaluationSet: 'holdout-1' } : { consumer: 'real invocation' } } }],
    authorization: { execution: true, checkpoints: 'autonomous', designAcceptance: 'independent', scopeChange: 'owner', independentReview: true, implementerContextId: 'builder-context' },
    planningBudget: { corpusRoots: ['runs/current'], ledgerFiles: [], reviewRounds: 1, reworkUnits: 0 },
    outcomes: [{ id: 'O1', requirementIds: ['R1'], actor: 'consumer', entryPoint: '/', surfaceId: 'main', applicability: 'applicable', applicabilityReason: 'Explicitly requested', releaseRequired: true, requiredEvidenceKinds: visual ? ['image'] : [], checks: requirements.requirements[0].checks, dependencies: [] }],
    slices: [{ id: 'proof', kind: 'proof', outcomeIds: ['O1'], units: [{ id: 'tasks-proof.md#T1', outcomeIds: ['O1'], acceptance: 'Useful result and reachable recovery', affectedPaths: ['app.ts'], dependsOn: [] }], detailedFiles: ['tasks-proof.md'] }], activeSlice: 'proof', firstProofSlice: 'proof', evidenceRefs: [], decisionRefs: [], releaseCandidate: 'candidate-1',
  };
  const store = new Map<string, { decision: string; binding: string }>();
  const provider: TrustedReviewProvider = { verify: (decision, binding) => { const receipt = store.get(decision.provenance.reference); return !!receipt && receipt.decision === canonical(decision) && receipt.binding === canonical(binding); } };
  const save = () => fs.writeFileSync(path.join(run, 'delivery-manifest.json'), JSON.stringify(manifest));
  const scope = (): DeliveryScope => { save(); return resolveDeliveryScope(run)!; };
  const trust = (d: DeliveryDecision, binding: ReviewBinding) => { manifest.decisionRefs.push(d); store.set(d.provenance.reference, { decision: canonical(d), binding: canonical(binding) }); save(); };
  const reviewScope = () => {
    manifest.decisionRefs = manifest.decisionRefs.filter(d => d.kind !== 'scope-review');
    const binding = { scopeDigest: deliveryScopeDigest(manifest), outcomeIds: manifest.outcomes.map(o => o.id).sort(), artifactDigests: [...new Set([...manifest.sourceInputs.map(s => s.sha256), ...requirements.originalSources.map(s => s.sha256)])].sort() };
    const d: DeliveryDecision = { id: 'scope-review', kind: 'scope-review', ...binding, reviewer: { id: 'reviewer', contextId: 'review-context', role: 'independent' }, provenance: { kind: 'review-session', reference: `trusted://scope/${store.size}` }, result: 'approved', reason: 'Compared every original brief requirement to the ledger and required release duties' }; trust(d, binding);
  };
  const evidence = (outcomeId = 'O1') => {
    const o = manifest.outcomes.find(o => o.id === outcomeId)!; const surface = manifest.surfaces.find(s => s.id === o.surfaceId)!; const b = deliveryEvidenceBinding(scope(), outcomeId);
    const kinds = ['web','native','desktop'].includes(surface.kind) ? ['execution','recovery','image-entry','image-success','image-recovery'] : [['data','ml'].includes(surface.kind) ? 'evaluation' : surface.kind === 'infrastructure' ? 'operation' : ['document','media'].includes(surface.kind) ? 'render' : 'consumer', 'recovery'];
    for (const kind of kinds) {
      const id = `${outcomeId}-${kind}-${manifest.evidenceRefs.length}`; const image = kind.startsWith('image-');
      const artifact = write(`evidence/${id}.${image ? 'png' : 'log'}`, image ? png : `Executed production consumer: ${outcomeId} ${kind}; meaningful output retained; recovered successfully.`);
      manifest.evidenceRefs.push({ id, outcomeId, checkId: kind.includes('recovery') ? 'recovery' : 'success', kind: image ? 'image' : kind as any, targetId: surface.target.id, ...b, artifact, command: image ? 'capture actual composed target' : 'installed-consumer --clean --exercise-result-and-recovery', observedResult: 'Observed useful result and real recovery', observedAt: '2026-01-01T00:00:00Z', result: 'pass', consumer: 'installed real consumer 1.0', productionComposition: true, releaseCandidate: manifest.releaseCandidate, ...(image ? { capture: { surfaceId: surface.id, state: kind.slice(6) as any, viewport: '390x844', composed: true } } : {}) });
    }
    save();
  };
  const accept = (sliceId = 'proof') => {
    const slice = manifest.slices.find(s => s.id === sliceId)!; const binding = deliveryReviewBinding(scope(), slice.outcomeIds);
    const id = `accept-${sliceId}-${store.size}`; const d: DeliveryDecision = { id, kind: 'acceptance', ...binding, reviewer: { id: 'reviewer', contextId: 'review-context', role: 'independent' }, provenance: { kind: 'review-session', reference: `trusted://${id}` }, result: 'approved', reason: 'Independently exercised consumer and inspected all retained raw artifacts' };
    slice.acceptanceDecisionId = id; trust(d, binding);
  };
  const validate = (stage: 'plan'|'execute'|'advance'|'release' = 'plan', trustedReviews = true) => { save(); return validateDelivery(run, { stage, trustedReviewProvider: trustedReviews ? provider : undefined }); };
  save(); return { root, run, manifest, requirements, write, save, scope, trust, reviewScope, evidence, accept, validate, provider };
}

