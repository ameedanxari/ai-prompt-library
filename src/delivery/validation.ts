import * as fs from 'node:fs';
import { validatePlanningIntegrity } from './planning-integrity.js';
import * as path from 'node:path';
import type { DesignContract, DeliveryDecision, DeliveryEvidence, DeliveryManifest, DeliveryOutcome, DeliveryReport, DeliveryScope, DeliverySlice, DeliveryValidationOptions, FileBinding, RequirementDocument, RequirementRecord, ReviewBinding } from './types.js';
import { parseDesignComparison, readDesignContracts, validateDesignComparison, validateDesignCoverage, visualSurface } from './design.js';
import { requiredReviewRoles } from './review-policy.js';
import { readDeliveryLifecycle, deliveryChangePolicy } from './lifecycle.js';
import type { DeliveryLifecycle } from './types.js';
import { canonical, confined, digest, resolveDeliveryScope, sha256 } from './manifest.js';
import { isOwnerAttested, ownerAttestationProblem } from './attestation.js';
import { ARCHITECTURE_FILE, architectureDocumentPaths, validateArchitectureContract } from './architecture.js';

function checkedFile(root: string, binding: FileBinding): Buffer {
  const file = confined(root, binding.path);
  if (!fs.statSync(file).isFile()) throw new Error(`delivery: expected file ${binding.path}`);
  const content = fs.readFileSync(file);
  if (!content.length || sha256(content) !== binding.sha256) throw new Error(`delivery: empty, stale or mismatched artifact ${binding.path}`);
  return content;
}
export function readDeliveryRequirements(scope: DeliveryScope): { requirements: RequirementRecord[]; originalSources: FileBinding[]; designs: DesignContract[]; lifecycle?: DeliveryLifecycle } {
  const requirements: RequirementRecord[] = []; const originalSources: FileBinding[] = []; const designs: DesignContract[] = []; let lifecycle: DeliveryLifecycle | undefined;
  const onlyKeys = (value: object, allowed: string) => Object.keys(value).every(k => allowed.split(' ').includes(k));
  for (const source of scope.manifest.sourceInputs) {
    const doc = JSON.parse(checkedFile(scope.projectRoot, source).toString('utf8')) as RequirementDocument;
    if (!onlyKeys(doc, 'schemaVersion originalSources requirements designs lifecycle') || doc.schemaVersion !== 1 || !Array.isArray(doc.requirements) || !doc.requirements.length || !Array.isArray(doc.originalSources) || !doc.originalSources.length) throw new Error(`delivery: invalid authoritative requirement document ${source.path}`);
    for (const original of doc.originalSources) { if (!onlyKeys(original, 'path sha256')) throw new Error('delivery: original source bindings must remain concise'); checkedFile(scope.projectRoot, original); originalSources.push(original); }
    const declaredLifecycle = readDeliveryLifecycle(doc.lifecycle, doc.originalSources, scope.manifest.surfaces.map(s => s.target.id));
    if (declaredLifecycle) {
      if (lifecycle && canonical(lifecycle) !== canonical(declaredLifecycle)) throw new Error('delivery: conflicting lifecycle declarations');
      lifecycle = declaredLifecycle;
    }
    designs.push(...readDesignContracts(doc.designs, doc.originalSources));
    for (const r of doc.requirements) {
      if (!r || !onlyKeys(r, 'id description sourceRefs explicit nonWaivable releaseRequired surfaceIds checks') || r.description?.trim().split(/\s+/).length > 120 || typeof r.id !== 'string' || !r.id.trim() || typeof r.description !== 'string' || !r.description.trim() || !Array.isArray(r.sourceRefs) || !r.sourceRefs.length || !r.sourceRefs.every(ref => doc.originalSources.some(s => s.path === ref)) || typeof r.explicit !== 'boolean' || typeof r.nonWaivable !== 'boolean' || typeof r.releaseRequired !== 'boolean' || !Array.isArray(r.surfaceIds) || !r.surfaceIds.length || !Array.isArray(r.checks) || !r.checks.length || !r.checks.every(c => c && onlyKeys(c, 'id kind description') && c.description?.trim().split(/\s+/).length <= 80 && typeof c.id === 'string' && c.id.trim() && ['success','recovery'].includes(c.kind) && typeof c.description === 'string' && c.description.trim()) || new Set(r.checks.map(c => c.id)).size !== r.checks.length) throw new Error(`delivery: invalid authoritative requirement ${r?.id}`);
      requirements.push(r);
    }
  }
  if (new Set(requirements.map(r => r.id)).size !== requirements.length) throw new Error('delivery: duplicate authoritative requirement IDs');
  validateDesignCoverage(designs, scope.manifest.surfaces, scope.manifest.outcomes);
  return { requirements, originalSources, designs, lifecycle };
}
/** Source review and validation must inspect the same exact current sidecars. */
export function readDeliveryPlanningInputs(scope: DeliveryScope): FileBinding[] {
  const inputs = scope.manifest.planningInputs ?? [];
  const actual = inputs.map(binding => { checkedFile(scope.projectRoot, binding); return confined(scope.projectRoot, binding.path); }).sort();
  if (scope.manifest.schemaVersion === 2) {
    // A present architecture contract is part of the reviewed planning scope.
    const sidecars = ['planning-integrity.json', 'review-findings.json', ...(fs.existsSync(path.join(scope.runDirectory, ARCHITECTURE_FILE)) ? [ARCHITECTURE_FILE] : [])];
    const expected = sidecars.map(file => path.join(scope.runDirectory, file)).sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error(`planning: current run sidecars must be bound in planningInputs (${sidecars.join(', ')})`);
  }
  return inputs;
}

/** Source/obligation and reviewed dependency map, never deployment churn. */
export function deliveryScopeDigest(manifest: DeliveryManifest): string {
  const surfaces = manifest.surfaces.map(s => ({ ...s, target: { ...s.target, revision: undefined, bindings: s.target.bindings.map(b => b.path).sort() } }));
  return digest({ runId: manifest.runId, projectRoot: manifest.projectRoot, scopeRevision: manifest.scopeRevision, sourceInputs: manifest.sourceInputs, planningInputs: manifest.planningInputs, surfaces, outcomes: manifest.outcomes, authorization: manifest.authorization });
}

function outcomeBindings(scope: DeliveryScope, outcome: DeliveryOutcome): FileBinding[] {
  const surface = scope.manifest.surfaces.find(s => s.id === outcome.surfaceId);
  if (!surface) throw new Error(`delivery: unknown surface ${outcome.surfaceId}`);
  const target = surface.target;
  const classified = new Set([...(target.sharedPaths ?? []), ...scope.manifest.outcomes.filter(o => o.surfaceId === surface.id).flatMap(o => o.bindingPaths ?? [])]);
  for (const p of classified) if (!target.bindings.some(b => b.path === p)) throw new Error(`delivery: dependency path missing from target bindings: ${p}`);
  // Partial/unknown maps fail conservatively: no implementer-supplied omission can
  // silently turn an unclassified source into an unrelated change.
  const selective = target.sharedPaths !== undefined && outcome.bindingPaths !== undefined && target.bindings.every(b => classified.has(b.path));
  const paths = new Set([...(target.sharedPaths ?? []), ...(outcome.bindingPaths ?? [])]);
  return target.bindings.filter(b => !selective || paths.has(b.path)).map(b => ({ path: b.path, sha256: sha256(fs.readFileSync(confined(scope.projectRoot, b.path))) }));
}

/** Exact execution and stable review identities have deliberately different jobs. */
export function deliveryEvidenceBinding(scope: DeliveryScope, outcomeId: string): { targetDigest: string; targetContextDigest: string; snapshotDigest: string; reviewDigest: string } {
  const { requirements, originalSources, designs, lifecycle } = readDeliveryRequirements(scope);
  type Binding = { targetDigest: string; targetContextDigest: string; snapshotDigest: string; reviewDigest: string };
  const visiting = new Set<string>(); const cache = new Map<string, Binding>();
  const visit = (id: string): Binding => {
    const previous = cache.get(id); if (previous) return previous;
    if (visiting.has(id)) throw new Error(`delivery: cyclic outcome dependency ${id}`); visiting.add(id);
    const outcome = scope.manifest.outcomes.find(o => o.id === id); if (!outcome) throw new Error(`delivery: unknown outcome ${id}`);
    const surface = scope.manifest.surfaces.find(s => s.id === outcome.surfaceId)!;
    const actualBindings = outcomeBindings(scope, outcome);
    const { bindings: _bindings, revision: _revision, ...context } = surface.target;
    const targetDigest = digest({ ...surface, target: { ...surface.target, bindings: actualBindings } });
    const semanticTargetDigest = digest({ surfaceId: surface.id, kind: surface.kind, entryPoint: surface.entryPoint, target: context });
    const targetContextDigest = digest({ semanticTargetDigest, revision: surface.target.revision });
    const deps = outcome.dependencies.map(d => ({ ...d, binding: visit(d.outcomeId) }));
    const relevantRequirements = requirements.filter(r => outcome.requirementIds.includes(r.id));
    const relevantDesigns = designs.filter(d => d.surfaceId === surface.id);
    const sourceRefs = new Set([...relevantRequirements.flatMap(r => r.sourceRefs), ...relevantDesigns.flatMap(d => d.sourceRefs)]);
    const common = { lifecycle, runId: scope.manifest.runId, projectRoot: scope.projectRoot, outcome, requirements: relevantRequirements, originalSources: originalSources.filter(s => sourceRefs.has(s.path)), designs: relevantDesigns };
    const result = { targetDigest, targetContextDigest,
      snapshotDigest: digest({ ...common, targetDigest, dependencies: deps.map(d => ({ outcomeId: d.outcomeId, kind: d.kind, snapshotDigest: d.binding.snapshotDigest })) }),
      reviewDigest: digest({ ...common, semanticTargetDigest, bindings: actualBindings, dependencies: deps.map(d => ({ outcomeId: d.outcomeId, kind: d.kind, reviewDigest: d.binding.reviewDigest })) }) };
    visiting.delete(id); cache.set(id, result); return result;
  };
  return visit(outcomeId);
}
/** Outcome judgment covers observed behavior; fresh execution provenance remains
 * exact-target-bound in validation and in the final release review. */
function acceptanceEvidenceDigest(e: DeliveryEvidence): string {
  return digest({ outcomeId: e.outcomeId, checkId: e.checkId, kind: e.kind, artifact: e.artifact.sha256, command: e.command, observedResult: e.observedResult, result: e.result, capture: e.capture, consumer: e.consumer, productionComposition: e.productionComposition });
}
export function deliveryReviewBinding(scope: DeliveryScope, outcomeIds: string[], evidence?: DeliveryEvidence[]): ReviewBinding {
  const ids = [...outcomeIds].sort();
  const current = (evidence ?? scope.manifest.evidenceRefs).filter(e => { if (!ids.includes(e.outcomeId) || !evidence && e.kind === 'design-review') return false; if (evidence) return true; const b = deliveryEvidenceBinding(scope, e.outcomeId); return e.targetDigest === b.targetDigest && e.snapshotDigest === b.snapshotDigest; });
  const reviewedRecords = current.map(e => {
    if (evidence) return e;
    // Retain the ORIGINAL full signed observation, never overwrite it with new
    // target labels. A separately retained current observation proves freshness.
    return scope.manifest.evidenceRefs.find(old => old.kind !== 'design-review' && old.reviewDigest === e.reviewDigest && acceptanceEvidenceDigest(old) === acceptanceEvidenceDigest(e) && Date.parse(old.observedAt) <= Date.parse(e.observedAt)) ?? e;
  });
  return { outcomeIds: ids, scopeDigest: digest(ids.map(id => ({ id, reviewDigest: deliveryEvidenceBinding(scope, id).reviewDigest }))), artifactDigests: [...new Set([...reviewedRecords.flatMap(e => [e.artifact.sha256, digest({ evidenceRecord: e })]), ...scope.manifest.slices.filter(s => s.outcomeIds.some(id => ids.includes(id))).flatMap(s => s.detailedFiles.map(f => sha256(fs.readFileSync(confined(scope.runDirectory, f)))))])].sort() };
}

/** Reuse only a judgment whose source inputs are unchanged and whose referenced
 * pixels have been captured again on the exact current execution target. */
function reusableDesignEvidence(scope: DeliveryScope, ids: string[], options?: DeliveryValidationOptions): { reports: DeliveryEvidence[]; images: DeliveryEvidence[] } {
  const reports: DeliveryEvidence[] = []; const images: DeliveryEvidence[] = [];
  for (const e of scope.manifest.evidenceRefs.filter(e => ids.includes(e.outcomeId) && e.kind === 'design-review')) {
    try {
      const b = deliveryEvidenceBinding(scope, e.outcomeId);
      const outcome = scope.manifest.outcomes.find(o => o.id === e.outcomeId)!;
      const target = scope.manifest.surfaces.find(s => s.id === outcome.surfaceId)!.target;
      const observedAt = Date.parse(e.observedAt);
      if (e.targetId !== target.id || !outcome.checks.some(c => c.id === e.checkId) || !Number.isFinite(observedAt) || observedAt > (options?.now ?? new Date()).getTime() + 60_000) continue;
      const exact = e.targetDigest === b.targetDigest && e.snapshotDigest === b.snapshotDigest;
      if (!exact && e.reviewDigest !== b.reviewDigest) continue;
      if (e.result !== 'pass') continue;
      const comparison = parseDesignComparison(checkedFile(scope.projectRoot, e.artifact));
      const imageIds = new Set([...comparison.comparisons, ...comparison.experience].flatMap(c => c.imageEvidenceId ? [c.imageEvidenceId] : []));
      const referenced: DeliveryEvidence[] = [];
      for (const id of imageIds) {
        const old = scope.manifest.evidenceRefs.find(i => i.id === id && i.kind === 'image' && i.outcomeId === e.outcomeId);
        if (!old) throw new Error('missing design image');
        checkedFile(scope.projectRoot, old.artifact);
        const outcome = scope.manifest.outcomes.find(o => o.id === e.outcomeId)!;
        const surface = scope.manifest.surfaces.find(s => s.id === outcome.surfaceId)!;
        const eligible = (i: DeliveryEvidence) => {
          const observedAt = Date.parse(i.observedAt);
          return outcome.checks.some(c => c.id === i.checkId) && Number.isFinite(observedAt) && observedAt <= (options?.now ?? new Date()).getTime() + 60_000 &&
            (options?.stage !== 'release' || !!scope.manifest.releaseCandidate && i.releaseCandidate === scope.manifest.releaseCandidate && i.productionComposition && surface.target.providerMode === 'real');
        };
        const current = scope.manifest.evidenceRefs.find(i => (i.targetDigest === old.targetDigest || Date.parse(i.observedAt) > Date.parse(old.observedAt)) && eligible(i) && i.kind === 'image' && i.outcomeId === e.outcomeId && i.targetId === e.targetId && i.targetDigest === b.targetDigest && i.snapshotDigest === b.snapshotDigest && i.result === 'pass' && i.artifact.sha256 === old.artifact.sha256 && canonical(i.capture) === canonical(old.capture));
        if (!current) throw new Error('missing fresh equivalent capture');
        if (!isImage(checkedFile(scope.projectRoot, current.artifact))) throw new Error('invalid rendered image');
        referenced.push(old);
      }
      reports.push(e); images.push(...referenced);
    } catch { /* Invalid reports cannot be reused or approved. */ }
  }
  return { reports, images: [...new Map(images.map(e => [e.id, e])).values()] };
}
/** Readiness is separate from approval: do not spend a reviewer call on an
 * incomplete capture packet or a comparison that already records a failure. */
export function designReviewReady(scope: DeliveryScope, outcomeIds: string[]): boolean {
  try {
    const { designs } = readDeliveryRequirements(scope);
    const selected = reusableDesignEvidence(scope, outcomeIds);
    return outcomeIds.every(id => {
      const outcome = scope.manifest.outcomes.find(o => o.id === id);
      const contract = designs.find(d => d.surfaceId === outcome?.surfaceId);
      const reports = selected.reports.filter(e => e.outcomeId === id);
      if (!outcome || !contract || !reports.length) return false;
      for (const report of reports) validateDesignComparison(parseDesignComparison(checkedFile(scope.projectRoot, report.artifact)), contract, outcome, selected.images);
      return true;
    });
  } catch { return false; }
}
export function deliveryDesignReviewBinding(scope: DeliveryScope, outcomeIds: string[]): ReviewBinding {
  const ids = [...outcomeIds].sort(); const selected = reusableDesignEvidence(scope, ids);
  return { outcomeIds: ids, scopeDigest: digest(ids.map(id => ({ id, reviewDigest: deliveryEvidenceBinding(scope, id).reviewDigest }))), artifactDigests: [...new Set([
    ...[...selected.reports, ...selected.images].flatMap(e => [e.artifact.sha256, digest({ evidenceRecord: e })]),
  ])].sort() };
}
export function deliveryReleaseReviewBinding(scope: DeliveryScope): ReviewBinding {
  const { originalSources } = readDeliveryRequirements(scope);
  const binding = deliveryReviewBinding(scope, scope.manifest.outcomes.map(o => o.id));
  return { ...binding, scopeDigest: digest({ scope: deliveryScopeDigest(scope.manifest), releaseCandidate: scope.manifest.releaseCandidate, execution: scope.manifest.outcomes.map(o => ({ id: o.id, ...deliveryEvidenceBinding(scope, o.id) })) }), artifactDigests: [...new Set([...binding.artifactDigests, ...scope.manifest.evidenceRefs.filter(e => { const b = deliveryEvidenceBinding(scope, e.outcomeId); return e.targetDigest === b.targetDigest && e.snapshotDigest === b.snapshotDigest; }).map(e => digest({ evidenceRecord: e })), ...originalSources.map(s => s.sha256)])].sort() };
}
function sameSet(a: string[], b: string[]): boolean { return canonical([...new Set(a)].sort()) === canonical([...new Set(b)].sort()) && new Set(a).size === a.length; }
function isImage(data: Buffer): boolean {
  const png = data.length > 44 && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && data.toString('ascii',12,16) === 'IHDR' && data.readUInt32BE(16) > 0 && data.readUInt32BE(20) > 0 && data.includes(Buffer.from('IEND'));
  const jpeg = data.length > 32 && data[0] === 255 && data[1] === 216 && data[data.length - 2] === 255 && data[data.length - 1] === 217;
  const webp = data.length > 32 && data.toString('ascii',0,4) === 'RIFF' && data.toString('ascii',8,12) === 'WEBP' && ['VP8 ','VP8L','VP8X'].includes(data.toString('ascii',12,16)) && data.readUInt32LE(4) === data.length - 8;
  return png || jpeg || webp;
}
const visual = visualSurface;

/** Outcomes whose current inputs can block execution of the detailed units. */
export function deliveryExecutionOutcomeIds(manifest: DeliveryManifest, slice: DeliverySlice): string[] {
  const selected = new Set(slice.units.flatMap(unit => unit.outcomeIds));
  const pending = [...selected];
  for (let index = 0; index < pending.length; index++) {
    for (const dependency of manifest.outcomes.find(outcome => outcome.id === pending[index])?.dependencies ?? []) {
      if (!selected.has(dependency.outcomeId)) { selected.add(dependency.outcomeId); pending.push(dependency.outcomeId); }
    }
  }
  return [...selected];
}

export function validateDelivery(targetDir: string, options: DeliveryValidationOptions): DeliveryReport {
  const report: DeliveryReport = { valid: false, stage: options.stage, issues: [], metrics: { pendingWords: 0, pendingBytes: 0, pendingUnits: 0, pendingSlices: 0, reviewRounds: 0, reworkUnits: 0 }, completion: { planReady: false, proofAccepted: false, sliceAccepted: false, releaseReady: false, acceptedOutcomeIds: [], designAcceptedOutcomeIds: [], technicallyVerifiedOutcomeIds: [], excludedOutcomeIds: [], staleOutcomeIds: [] } };
  const issue = (s: string) => { if (!report.issues.includes(s)) report.issues.push(s); };
  if (!['plan','execute','advance','release'].includes(options.stage)) { issue('delivery: invalid validation stage'); return report; }
  try {
    const scope = resolveDeliveryScope(targetDir, { allowLegacy: false })!; const m = scope.manifest;
    const { requirements, originalSources, designs } = readDeliveryRequirements(scope);
    readDeliveryPlanningInputs(scope);

    const activePlan = m.slices.find(s => s.id === m.activeSlice)!;
    const executeOutcomeIds = [...new Set(activePlan.units.flatMap(unit => unit.outcomeIds))];
    const planning = validatePlanningIntegrity({ projectRoot: scope.projectRoot, runDirectory: scope.runDirectory, stage: options.stage,
      required: m.schemaVersion === 2, originalSources, requirementIds: requirements.map(r => r.id),
      units: m.slices.find(s => s.id === m.activeSlice)!.units.map(u => ({ id: u.id, filePaths: u.affectedPaths, nodeIds: u.planningNodeIds })),
      knownTargets: [...m.outcomes.map(o => o.id), ...m.slices.flatMap(s => [s.id, ...s.units.map(u => u.id)])],
      targetIds: options.stage === 'release' ? undefined : [m.activeSlice, ...(options.stage === 'execute' ? deliveryExecutionOutcomeIds(m, activePlan) : activePlan.outcomeIds), ...activePlan.units.map(u => u.id)],
    });
    report.planningIntegrity = { assessed: planning.assessed, blockers: planning.blockers, warnings: planning.warnings };
    for (const problem of planning.issues) issue(`${problem.code}: ${problem.target}: ${problem.message}`);
    if (m.schemaVersion === 2) {
      let ownerDecisionIds: string[] = [];
      try { const register = JSON.parse(fs.readFileSync(confined(scope.runDirectory, 'review-findings.json'), 'utf8')); ownerDecisionIds = (register.ownerDecisions ?? []).map((d: { id: string }) => d.id); } catch { /* Planning integrity reports the malformed register. */ }
      for (const problem of validateArchitectureContract(scope, requirements, readDeliveryRequirements(scope).lifecycle, ownerDecisionIds)) issue(`${problem.code}: ${problem.target}: ${problem.message}`);
    }

    const allIds = m.outcomes.map(o => o.id); const outcomeById = new Map(m.outcomes.map(o => [o.id, o])); const sliceById = new Map(m.slices.map(s => [s.id, s]));
    const authenticated = (d: DeliveryDecision | undefined, binding: ReviewBinding, role?: 'owner' | 'independent' | 'agent'): boolean => {
      if (!d || d.scopeDigest !== binding.scopeDigest || !sameSet(d.artifactDigests, binding.artifactDigests) || !sameSet(d.outcomeIds, binding.outcomeIds)) return false;
      if (role === 'owner' && d.reviewer.role !== 'owner') return false;
      if (role === 'independent' && (d.reviewer.role !== 'independent' || d.reviewer.contextId === m.authorization.implementerContextId)) return false;
      if (d.reviewer.role === 'independent' && d.reviewer.contextId === m.authorization.implementerContextId) return false;
      // Owner attestation is never authentication: only a complete scope review accepts it, never for an independent duty.
      if (isOwnerAttested(d) && (d.kind !== 'scope-review' || role === 'independent' || ownerAttestationProblem(d, binding, options.now) !== undefined)) return false;
      try { return options.trustedReviewProvider?.verify(d, binding) === true; } catch { return false; }
    };
    const trusted = (d: DeliveryDecision | undefined, binding: ReviewBinding, role?: 'owner' | 'independent' | 'agent') => d?.result === 'approved' && authenticated(d, binding, role);
    const acceptanceRoles = requiredReviewRoles(m.authorization, 'acceptance');
    const canCarryForward = (e: DeliveryEvidence, currentContextDigest: string): boolean => {
      if (!e.targetContextDigest || e.targetContextDigest !== currentContextDigest) return false;
      // Authenticate the immutable old observation in the original trusted review,
      // then authenticate an explicit inspection against the CURRENT source scope.
      const historical = m.decisionRefs.filter(d => d.kind === 'acceptance' && d.outcomeIds.includes(e.outcomeId) && d.artifactDigests.includes(e.artifact.sha256) && d.artifactDigests.includes(digest({ evidenceRecord: e })));
      if (!acceptanceRoles.every(role => historical.some(d => trusted(d, { scopeDigest: d.scopeDigest, artifactDigests: d.artifactDigests, outcomeIds: d.outcomeIds }, role)))) return false;
      return m.decisionRefs.some(d => {
        if (d.kind !== 'carry-forward' || !d.evidenceIds?.includes(e.id) || new Set(d.evidenceIds).size !== d.evidenceIds.length) return false;
        const items = d.evidenceIds.map(id => m.evidenceRefs.find(item => item.id === id));
        if (items.some(item => !item) || !sameSet([...new Set(items.map(item => item!.outcomeId))], d.outcomeIds)) return false;
        const binding = deliveryReviewBinding(scope, d.outcomeIds, items as DeliveryEvidence[]);
        return trusted(d, binding, m.authorization.independentReview ? 'independent' : m.authorization.designAcceptance);
      });
    };
    const scopeBinding: ReviewBinding = { scopeDigest: deliveryScopeDigest(m), outcomeIds: [...allIds].sort(), artifactDigests: [...new Set([...m.sourceInputs, ...(m.planningInputs ?? []), ...originalSources].map(s => s.sha256))].sort() };
    const scopeRoles = requiredReviewRoles(m.authorization, 'scope-review');
    const scopeTrusted = (role: 'owner' | 'independent' | 'agent', allowAttested: boolean) => m.decisionRefs.some(d => d.kind === 'scope-review' && (allowAttested || !isOwnerAttested(d)) && trusted(d, scopeBinding, role));
    const scopeRejected = m.decisionRefs.some(d => d.kind === 'scope-review' && d.result === 'rejected' && authenticated(d, scopeBinding));
    const missingScopeRoles = scopeRoles.filter(role => !scopeTrusted(role, true));
    const scopeFullyApproved = !missingScopeRoles.length && !scopeRejected;
    // Plan readiness may rest on an owner-attested scope review; execution still needs every required role.
    const scopeApproved = scopeFullyApproved || options.stage === 'plan' && !scopeRejected && m.decisionRefs.some(d => d.kind === 'scope-review' && isOwnerAttested(d) && trusted(d, scopeBinding, 'owner'));
    report.scopeReview = { approved: scopeApproved, provenance: !scopeApproved ? 'none' : scopeRoles.every(role => scopeTrusted(role, false)) ? 'authenticated' : 'owner-attested', missingRoles: missingScopeRoles };
    if (!scopeApproved) issue('scope: original-source coverage review pending or provenance unverified');
    report.changePolicies = Object.fromEntries(m.surfaces.map(s => [s.target.id, deliveryChangePolicy(readDeliveryRequirements(scope).lifecycle, scopeFullyApproved, s.target.id)]));
    const active = sliceById.get(m.activeSlice)!; const proof = sliceById.get(m.firstProofSlice);
    if (!proof || proof.kind !== 'proof') issue('scope: firstProofSlice must identify a representative proof slice');
    if (m.nextSlice && (!sliceById.has(m.nextSlice) || m.nextSlice === m.activeSlice)) issue('scope: invalid nextSlice');
    for (const requirement of requirements) {
      for (const surfaceId of requirement.surfaceIds) {
        if (!m.surfaces.some(s => s.id === surfaceId)) issue(`scope: requirement ${requirement.id} names unknown surface ${surfaceId}`);
        const covering = m.outcomes.filter(o => o.requirementIds.includes(requirement.id) && o.surfaceId === surfaceId);
        if (!covering.length) issue(`scope: missing authoritative requirement ${requirement.id} on ${surfaceId}`);
        for (const c of requirement.checks) if (!covering.some(o => o.checks.some(oc => oc.id === c.id && oc.kind === c.kind && oc.description === c.description))) issue(`scope: missing or changed authoritative check ${requirement.id}/${c.id} on ${surfaceId}`);
        if (requirement.releaseRequired && covering.some(o => !o.releaseRequired)) issue(`scope: required release obligation ${requirement.id} was demoted`);
      }
    }
    for (const o of m.outcomes) {
      if (!m.surfaces.some(s => s.id === o.surfaceId)) issue(`scope: unknown surface ${o.surfaceId}`);
      for (const id of o.requirementIds) if (!requirements.some(r => r.id === id)) issue(`scope: outcome ${o.id} references unknown source requirement ${id}`);
      if (!o.checks.some(c => c.kind === 'success') || !o.checks.some(c => c.kind === 'recovery')) issue(`scope: outcome ${o.id} needs success and recovery checks`);
      for (const dep of o.dependencies) if (dep.outcomeId === o.id || !outcomeById.has(dep.outcomeId)) issue(`scope: invalid prerequisite ${o.id}/${dep.outcomeId}`);
      if (o.applicability === 'excluded') {
        const reqs = requirements.filter(r => o.requirementIds.includes(r.id)); const decision = m.decisionRefs.find(d => d.id === o.decisionId && d.kind === 'scope-change');
        const role = reqs.some(r => r.explicit) || m.authorization.scopeChange === 'owner' ? 'owner' : 'agent';
        if (reqs.some(r => r.nonWaivable)) issue(`scope: non-waivable obligation excluded: ${o.id}`);
        if (!decision || !sameSet(decision.requirementIds ?? [], o.requirementIds) || !trusted(decision, scopeBinding, role)) issue(`scope: exclusion ${o.id} lacks authorized source-bound scope decision`);
        report.completion.excludedOutcomeIds.push(o.id);
      }
    }
    for (const surface of m.surfaces) {
      if (!m.outcomes.some(o => o.surfaceId === surface.id && o.entryPoint === surface.entryPoint && o.applicability === 'applicable')) issue(`scope: entry point omitted for surface ${surface.id}`);
    }
    const unitIds = m.slices.flatMap(s => s.units.map(u => u.id));
    if (new Set(unitIds).size !== unitIds.length) issue('scope: implementation unit IDs must be unique across slices');
    for (const slice of m.slices) {
      if (!slice.detailedFiles.length) issue(`scope: slice ${slice.id} has no executable detail`);
      for (const id of slice.outcomeIds) if (!outcomeById.has(id)) issue(`scope: slice ${slice.id} references unknown outcome ${id}`);
      const preceding = new Set<string>(); const owners = new Map<string, string>();
      for (const unit of slice.units) {
        // Cohesive outcome-level units cannot wrap an entire unrelated catalogue.
        if (unit.outcomeIds.length > 3 || unit.acceptance.split(/\s+/).length > 250 || unit.affectedPaths.length > 30) issue(`budget: unit ${unit.id} requires cohesion review; oversized megaslice`);
        if (!unit.outcomeIds.every(id => slice.outcomeIds.includes(id))) issue(`scope: unit ${unit.id} escapes slice outcomes`);
        if (!unit.dependsOn.every(id => preceding.has(id))) issue(`scope: unit ${unit.id} has unordered or unknown dependencies`);
        const unitPaths = new Set<string>();
        for (const file of unit.affectedPaths) {
          const canonicalPath = confined(scope.projectRoot, file, false);
          if (unitPaths.has(canonicalPath)) issue(`scope: duplicate/aliased affected path in ${unit.id}: ${file}`);
          unitPaths.add(canonicalPath);
          const owner = owners.get(canonicalPath); if (owner && !unit.dependsOn.includes(owner)) issue(`scope: unordered ownership collision ${file}`); owners.set(canonicalPath, unit.id);
        }
        preceding.add(unit.id);
      }
      for (const id of slice.outcomeIds) if (!slice.deferredOutcomeIds?.includes(id) && !slice.units.some(u => u.outcomeIds.includes(id))) issue(`scope: slice outcome ${id} lacks an implementation unit`);
    }
    const reusable = reusableDesignEvidence(scope, allIds, options);
    const evidenceByOutcome = new Map<string, DeliveryEvidence[]>(); const evidenceFailures = new Map<string, string[]>();
    for (const e of m.evidenceRefs) {
      const fail = (s: string) => { const failures = evidenceFailures.get(e.outcomeId) ?? []; failures.push(`evidence ${e.id}: ${s}`); evidenceFailures.set(e.outcomeId, failures); };
      try {
        const outcome = outcomeById.get(e.outcomeId); if (!outcome) { issue(`evidence: unknown outcome ${e.outcomeId}`); continue; }
        const surface = m.surfaces.find(s => s.id === outcome.surfaceId)!;
        const binding = deliveryEvidenceBinding(scope, outcome.id);
        if (!outcome.checks.some(c => c.id === e.checkId)) throw new Error('unknown acceptance check');
        if (e.targetId !== surface.target.id || (e.targetDigest !== binding.targetDigest || e.snapshotDigest !== binding.snapshotDigest) && !(e.kind === 'design-review' && reusable.reports.some(r => r.id === e.id)) && (e.kind === 'design-review' || e.kind === 'image' || !canCarryForward(e, binding.targetContextDigest))) throw new Error('stale source, contract, dependency or target binding');
        // A changed manifest expected hash is itself stale, even if an evidence author rehashes current files.
        for (const b of surface.target.bindings) checkedFile(scope.projectRoot, b);
        if (e.targetDigest === binding.targetDigest && m.evidenceRefs.slice(0, m.evidenceRefs.indexOf(e)).some(old => old.id !== e.id && old.targetDigest !== e.targetDigest && old.reviewDigest === e.reviewDigest && acceptanceEvidenceDigest(old) === acceptanceEvidenceDigest(e) && Date.parse(e.observedAt) <= Date.parse(old.observedAt))) throw new Error('new-target observation must be newer than retained historical evidence');
        const time = Date.parse(e.observedAt); if (!Number.isFinite(time) || time > (options.now ?? new Date()).getTime() + 60_000) throw new Error('invalid/future observation time');
        const raw = checkedFile(scope.projectRoot, e.artifact);
        if (e.result !== 'pass') throw new Error('observed execution failed');
        if (e.kind === 'image' && (!isImage(raw) || !e.capture || !e.capture.composed || e.capture.surfaceId !== outcome.surfaceId)) throw new Error('actual composed image capture required');
        if (['consumer','operation','evaluation','render'].includes(e.kind) && !e.consumer?.trim()) throw new Error('consumer/operation identity required');
        if (options.stage === 'release' && e.kind !== 'design-review' && (!m.releaseCandidate || e.releaseCandidate !== m.releaseCandidate || !e.productionComposition || surface.target.providerMode !== 'real')) throw new Error('real production composition and consistent release candidate required');
        const items = evidenceByOutcome.get(outcome.id) ?? []; items.push(e); evidenceByOutcome.set(outcome.id, items);
      } catch (error) { fail((error as Error).message); }
    }
    // A pass/fail comparison cannot be substituted with a screenshot or generic acceptance.
    const designCompared = new Set<string>();
    for (const o of m.outcomes) {
      const contract = designs.find(d => d.surfaceId === o.surfaceId);
      if (!contract) continue;
      const items = evidenceByOutcome.get(o.id) ?? [];
      let rejectedComparison = false;
      for (const e of items.filter(e => e.kind === 'design-review')) {
        try {
          validateDesignComparison(parseDesignComparison(checkedFile(scope.projectRoot, e.artifact)), contract, o, [...items, ...reusable.images.filter(i => i.outcomeId === o.id && items.some(current => current.kind === 'image' && current.artifact.sha256 === i.artifact.sha256 && canonical(current.capture) === canonical(i.capture)))]);
          designCompared.add(o.id);
        } catch (error) {
          rejectedComparison = true;
          const failures = evidenceFailures.get(o.id) ?? [];
          failures.push(`evidence ${e.id}: ${(error as Error).message}`); evidenceFailures.set(o.id, failures);
          evidenceByOutcome.set(o.id, (evidenceByOutcome.get(o.id) ?? []).filter(item => item.id !== e.id));
        }
      }
      if (rejectedComparison) designCompared.delete(o.id);
    }
    const designAccepted = new Set<string>();
    const designRoles = requiredReviewRoles(m.authorization, 'design-review');
    for (const o of m.outcomes.filter(o => designCompared.has(o.id))) {
      const candidates = m.decisionRefs.filter(d => d.kind === 'design-review' && d.outcomeIds.includes(o.id));
      const approved = candidates.filter(d => d.outcomeIds.every(id => designCompared.has(id)) && trusted(d, deliveryDesignReviewBinding(scope, d.outcomeIds)));
      const rejected = candidates.some(d => d.result === 'rejected' && authenticated(d, deliveryDesignReviewBinding(scope, d.outcomeIds)));
      if (!rejected && designRoles.every(role => approved.some(d => trusted(d, deliveryDesignReviewBinding(scope, d.outcomeIds), role)))) designAccepted.add(o.id);
    }
    report.completion.designAcceptedOutcomeIds = [...designAccepted];
    const technical = new Set<string>(); const accepted = new Set<string>(); const technicalVisiting = new Set<string>();
    const ownChecksPass = (o: DeliveryOutcome): boolean => {
      if (o.applicability !== 'applicable') return false;
      const items = evidenceByOutcome.get(o.id) ?? []; const surface = m.surfaces.find(s => s.id === o.surfaceId); if (!surface) return false;
      if (!o.checks.every(c => items.some(e => e.checkId === c.id && (c.kind === 'recovery' ? e.kind === 'recovery' : ['execution','consumer','operation','evaluation','render'].includes(e.kind))))) return false;
      if (!o.requiredEvidenceKinds.every(kind => items.some(e => e.kind === kind))) return false;
      if (visual(surface.kind) && !['entry','success','recovery'].every(state => items.some(e => e.kind === 'image' && e.capture?.state === state))) return false;
      const needed = ['api','sdk','cli','automation'].includes(surface.kind) ? 'consumer' : ['data','ml'].includes(surface.kind) ? 'evaluation' : surface.kind === 'infrastructure' ? 'operation' : ['document','media'].includes(surface.kind) ? 'render' : undefined;
      if (needed && !items.some(e => e.kind === needed)) return false;
      return true;
    };
    const isTechnical = (id: string): boolean => {
      if (technical.has(id)) return true; if (technicalVisiting.has(id)) return false;
      technicalVisiting.add(id); const o = outcomeById.get(id);
      const ok = !!o && ownChecksPass(o) && o.dependencies.every(d => isTechnical(d.outcomeId)); technicalVisiting.delete(id); if (ok) technical.add(id); return ok;
    };
    for (const o of m.outcomes) { deliveryEvidenceBinding(scope, o.id); isTechnical(o.id); }
    const sliceAccepted = (slice: DeliverySlice): boolean => {
      if (slice.deferredOutcomeIds?.length) return false;
      if (!slice.outcomeIds.every(id => technical.has(id) && (!visual(m.surfaces.find(s => s.id === outcomeById.get(id)?.surfaceId)?.kind ?? '') || designAccepted.has(id)))) return false;
      const ids = new Set([...(slice.acceptanceDecisionIds ?? []), ...(slice.acceptanceDecisionId ? [slice.acceptanceDecisionId] : [])]);
      const decisions = m.decisionRefs.filter(d => ids.has(d.id) && d.kind === 'acceptance');
      const binding = deliveryReviewBinding(scope, slice.outcomeIds);
      if (m.decisionRefs.some(d => d.kind === 'acceptance' && d.result === 'rejected' && authenticated(d, binding))) return false;
      return acceptanceRoles.every(role => decisions.some(decision => trusted(decision, binding, role)));
    };
    const acceptedSlices = new Set<string>();
    // Only accept after mandatory product dependencies, never via technical-only gate.
    for (let round = 0; round < m.slices.length + 1; round++) for (const slice of m.slices) {
      if (acceptedSlices.has(slice.id)) continue;
      if (slice.outcomeIds.every(id => outcomeById.get(id)?.dependencies.every(d => d.kind === 'technical' || accepted.has(d.outcomeId) || slice.outcomeIds.includes(d.outcomeId))) && sliceAccepted(slice)) { acceptedSlices.add(slice.id); slice.outcomeIds.forEach(id => accepted.add(id)); }
    }
    report.completion.proofAccepted = !!proof && acceptedSlices.has(proof.id);
    report.completion.sliceAccepted = acceptedSlices.has(active.id);
    report.completion.acceptedOutcomeIds = [...accepted]; report.completion.technicallyVerifiedOutcomeIds = [...technical];
    report.completion.staleOutcomeIds = m.outcomes.filter(o => evidenceFailures.has(o.id)).map(o => o.id);
    // Proof covers every declared delivery surface; an API behind a UI needs both.
    if (proof) for (const surface of m.surfaces) if (!proof.outcomeIds.some(id => outcomeById.get(id)?.surfaceId === surface.id)) issue(`proof: representative proof omits surface ${surface.id}`);
    if (!report.completion.proofAccepted && active.id !== proof?.id) issue('proof: first proof must be accepted before advancing breadth');
    if (!m.authorization.execution && options.stage !== 'plan') issue('authorization: execution has not been granted');
    // Only declared units execute while the proof is being refined. A detailed
    // unit cannot skip readiness for an outcome whose implementation is deferred.
    const readinessOutcomeIds = active.deferredOutcomeIds?.length && ['plan','execute'].includes(options.stage) ? executeOutcomeIds : active.outcomeIds;
    for (const id of readinessOutcomeIds) for (const dependency of outcomeById.get(id)?.dependencies ?? []) {
      if (readinessOutcomeIds.includes(dependency.outcomeId)) continue;
      if (!(dependency.kind === 'technical' ? technical : accepted).has(dependency.outcomeId)) issue(`dependency: ${id} requires ${dependency.kind} prerequisite ${dependency.outcomeId}`);
    }
    validateBudget(scope, acceptedSlices, designAccepted, report, trusted, scopeBinding, new Set([...evidenceByOutcome.values()].flat().map(e => confined(scope.projectRoot, e.artifact.path))), options.trustedProjectionProvider);
    const planIssues = report.issues.length;
    report.completion.planReady = planIssues === 0;
    if (options.stage === 'advance' || options.stage === 'release') {
      for (const slice of options.stage === 'release' ? m.slices : [active]) {
        if (slice.deferredOutcomeIds?.length) issue(`PROOF_REFINEMENT_PENDING: ${slice.id}: refine deferred outcomes before ${options.stage}: ${slice.deferredOutcomeIds.join(', ')}`);
      }
      const requiredIds = options.stage === 'release' ? m.outcomes.filter(o => o.applicability === 'applicable' && o.releaseRequired).map(o => o.id) : active.outcomeIds;
      for (const id of requiredIds) {
        const outcome = outcomeById.get(id)!;
        if (visual(m.surfaces.find(s => s.id === outcome.surfaceId)?.kind ?? '') && !designAccepted.has(id)) {
          issue(`design: outcome ${id} requires current criterion/context comparisons and trusted design review`);
          for (const failure of evidenceFailures.get(id) ?? []) issue(failure);
        }
        if (!technical.has(id)) { issue(`acceptance: outcome ${id} lacks current success/recovery and required surface evidence`); for (const failure of evidenceFailures.get(id) ?? []) issue(failure); }
        if (!accepted.has(id)) issue(`acceptance: outcome ${id} review pending or provenance unverified`);
      }
      if (options.stage === 'release') {
        const releaseBinding = deliveryReleaseReviewBinding(scope);
        if (!requiredReviewRoles(m.authorization, 'release-review').every(role => m.decisionRefs.some(d => d.kind === 'release-review' && trusted(d, releaseBinding, role))) || m.decisionRefs.some(d => d.kind === 'release-review' && d.result === 'rejected' && authenticated(d, releaseBinding))) issue('release: independent original-brief completeness and cross-journey review required');
        if (!report.completion.proofAccepted) issue('release: representative first proof not accepted');
        if (!m.releaseCandidate) issue('release: releaseCandidate identity required');
        if (!m.outcomes.some(o => o.releaseRequired && o.applicability === 'applicable')) issue('release: no applicable required outcomes');
        for (const r of requirements.filter(r => r.releaseRequired)) for (const surface of r.surfaceIds) {
          const rows = m.outcomes.filter(o => o.requirementIds.includes(r.id) && o.surfaceId === surface);
          if (!rows.every(o => accepted.has(o.id) || o.applicability === 'excluded' && !r.nonWaivable)) issue(`release: authoritative obligation ${r.id} unproved`);
        }
      }
    }
    report.valid = report.issues.length === 0;
    report.completion.releaseReady = options.stage === 'release' && report.valid;
  } catch (error) { issue((error as Error).message); }
  return report;
}

function validateBudget(scope: DeliveryScope, acceptedSlices: Set<string>, designAccepted: Set<string>, report: DeliveryReport, trusted: (decision: DeliveryDecision | undefined, binding: ReviewBinding, role?: 'owner' | 'independent' | 'agent') => boolean, scopeBinding: ReviewBinding, currentEvidenceArtifacts: Set<string>, trustedProjectionProvider?: DeliveryValidationOptions['trustedProjectionProvider']): void {
  const m = scope.manifest; const issue = (message: string) => { if (!report.issues.includes(message)) report.issues.push(message); };
  const proofAccepted = acceptedSlices.has(m.firstProofSlice); let limits = proofAccepted ? { maxUnits: 8, maxWords: 6000, maxBytes: 48000, maxSlices: 2 } : { maxUnits: 5, maxWords: 4000, maxBytes: 32000, maxSlices: 1 };
  if (m.planningBudget.extensionDecisionId) {
    const extension = m.decisionRefs.find(d => d.id === m.planningBudget.extensionDecisionId && d.kind === 'budget-extension');
    if (!extension?.budget || extension.reason.trim().split(/\s+/).length < 6 || !trusted(extension, scopeBinding, 'independent')) issue('budget: extension needs bounded limits, dependency/risk reason and trusted independent review');
    else limits = extension.budget;
  }
  const proof = m.slices.find(s => s.id === m.firstProofSlice);
  const earlyDesignPending = m.surfaces.some(s => visual(s.kind) && (!proof?.outcomeIds.some(id => m.outcomes.some(o => o.id === id && o.surfaceId === s.id)) || proof.outcomeIds.some(id => m.outcomes.some(o => o.id === id && o.surfaceId === s.id) && !designAccepted.has(id))));
  if (earlyDesignPending) {
    limits = { maxUnits: Math.min(limits.maxUnits, 2), maxWords: Math.min(limits.maxWords, 1200), maxBytes: Math.min(limits.maxBytes, 9600), maxSlices: 1 };
  }
  const pending = m.slices.filter(s => !acceptedSlices.has(s.id));
  const allowed = new Set([m.activeSlice, ...(proofAccepted && m.nextSlice ? [m.nextSlice] : [])]);
  for (const s of pending) if (!allowed.has(s.id)) issue(`budget: unimplemented detailed slice ${s.id} lies outside active/next window`);
  report.metrics.pendingUnits = pending.reduce((n,s) => n + s.units.length, 0); report.metrics.pendingSlices = pending.length;
  report.metrics.reviewRounds = m.planningBudget.reviewRounds; report.metrics.reworkUnits = m.planningBudget.reworkUnits;
  if (m.planningBudget.observedTokens !== undefined) report.metrics.observedTokens = m.planningBudget.observedTokens;
  const pendingFiles = new Set(pending.flatMap(s => s.detailedFiles.map(f => confined(scope.runDirectory, f))));
  const completedFiles = new Set(m.slices.filter(s => acceptedSlices.has(s.id)).flatMap(s => s.detailedFiles.map(f => confined(scope.runDirectory, f))).filter(f => !pendingFiles.has(f)));
  const declaredFiles = new Set(m.slices.flatMap(s => s.detailedFiles.map(f => confined(scope.runDirectory, f))));
  const ledgerFiles = new Set(m.planningBudget.ledgerFiles.map(f => confined(scope.projectRoot, f)));
  const originalPaths = new Set(readDeliveryRequirements(scope).originalSources.map(s => confined(scope.projectRoot, s.path)));
  const architectureDocuments = new Set(m.schemaVersion === 2 ? architectureDocumentPaths(scope) : []);
  const seen = new Set<string>(); const scanned = new Set<string>();
  const scan = (dir: string) => {
    if (scanned.has(dir)) return; scanned.add(dir);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const raw = path.join(dir, entry.name); const file = confined(scope.projectRoot, path.relative(scope.projectRoot, raw)); const stat = fs.statSync(file);
      if (stat.isDirectory()) { scan(file); continue; }
      if (!stat.isFile() || file === path.join(scope.runDirectory, 'delivery-manifest.json')) continue;
      if (path.dirname(file) === scope.runDirectory && ['planning-integrity.json', 'review-findings.json', ARCHITECTURE_FILE].includes(path.basename(file))) continue;
      // The domain contract is not slice detail; its own validator rejects embedded task sections.
      if (architectureDocuments.has(file)) continue;
      // Retained raw artifacts and versioned authoritative source records are not implementation prompts.
      if (currentEvidenceArtifacts.has(file) || m.sourceInputs.some(s => confined(scope.projectRoot, s.path) === file) || originalPaths.has(file)) continue;
      if (seen.has(file)) continue; seen.add(file);
      const rawContent = fs.readFileSync(file);
      if (path.dirname(file) === scope.runDirectory && ['task-contract.json','path-ledger.md','delivery-order.md'].includes(path.basename(file)) && trustedProjectionProvider?.verify(file, rawContent) === true) continue;
      const decoded = rawContent.toString('utf8'); const words = decoded.includes('\0') ? 0 : decoded.trim().split(/\s+/).filter(Boolean).length;
      if (ledgerFiles.has(file)) {
        if (words > Math.max(500, m.outcomes.length * 100) || /(?:^|\n)\s*(?:#{1,6}\s*(?:T\d+|implementation|task\s+\d+)|(?:\d+\.){2,}|```(?:ts|js|python|bash))/im.test(rawContent.toString('utf8'))) issue(`budget: detailed content disguised as concise ledger ${path.relative(scope.projectRoot,file)}`);
        continue;
      }
      if (completedFiles.has(file)) continue;
      report.metrics.pendingWords += words; report.metrics.pendingBytes += rawContent.length;
      if (!declaredFiles.has(file)) issue(`budget: unregistered pending detail ${path.relative(scope.projectRoot,file)}`);
    }
  };
  // Always scan the entire isolated run, including archives and nested packets.
  scan(scope.runDirectory);
  for (const root of m.planningBudget.corpusRoots) scan(confined(scope.projectRoot, root));
  for (const file of declaredFiles) if (!seen.has(file)) issue(`budget: detailed file outside scanned corpus ${file}`);
  if (earlyDesignPending && (report.metrics.pendingUnits > limits.maxUnits || report.metrics.pendingWords > limits.maxWords || report.metrics.pendingBytes > limits.maxBytes || report.metrics.pendingSlices > limits.maxSlices)) issue('design: validate the rendered design against its sources before expanding detailed planning');
  if (report.metrics.pendingUnits > limits.maxUnits) issue(`budget: ${report.metrics.pendingUnits} pending units exceeds ${limits.maxUnits}`);
  if (report.metrics.pendingSlices > limits.maxSlices) issue(`budget: ${report.metrics.pendingSlices} pending slices exceeds ${limits.maxSlices}`);
  if (report.metrics.pendingWords > limits.maxWords) issue(`budget: ${report.metrics.pendingWords} pending words exceeds ${limits.maxWords}`);
  if (report.metrics.pendingBytes > limits.maxBytes) issue(`budget: ${report.metrics.pendingBytes} pending bytes exceeds ${limits.maxBytes}`);
}
