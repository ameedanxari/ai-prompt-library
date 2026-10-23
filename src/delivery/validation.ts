import * as fs from 'node:fs';
import * as path from 'node:path';
import type { DeliveryDecision, DeliveryEvidence, DeliveryManifest, DeliveryOutcome, DeliveryReport, DeliveryScope, DeliverySlice, DeliveryValidationOptions, FileBinding, RequirementDocument, RequirementRecord, ReviewBinding } from './types.js';
import { canonical, confined, digest, resolveDeliveryScope, sha256 } from './manifest.js';

function checkedFile(root: string, binding: FileBinding): Buffer {
  const file = confined(root, binding.path);
  if (!fs.statSync(file).isFile()) throw new Error(`delivery: expected file ${binding.path}`);
  const content = fs.readFileSync(file);
  if (!content.length || sha256(content) !== binding.sha256) throw new Error(`delivery: empty, stale or mismatched artifact ${binding.path}`);
  return content;
}
export function readDeliveryRequirements(scope: DeliveryScope): { requirements: RequirementRecord[]; originalSources: FileBinding[] } {
  const requirements: RequirementRecord[] = []; const originalSources: FileBinding[] = [];
  const onlyKeys = (value: object, allowed: string) => Object.keys(value).every(k => allowed.split(' ').includes(k));
  for (const source of scope.manifest.sourceInputs) {
    const doc = JSON.parse(checkedFile(scope.projectRoot, source).toString('utf8')) as RequirementDocument;
    if (!onlyKeys(doc, 'schemaVersion originalSources requirements') || doc.schemaVersion !== 1 || !Array.isArray(doc.requirements) || !doc.requirements.length || !Array.isArray(doc.originalSources) || !doc.originalSources.length) throw new Error(`delivery: invalid authoritative requirement document ${source.path}`);
    for (const original of doc.originalSources) { if (!onlyKeys(original, 'path sha256')) throw new Error('delivery: original source bindings must remain concise'); checkedFile(scope.projectRoot, original); originalSources.push(original); }
    for (const r of doc.requirements) {
      if (!r || !onlyKeys(r, 'id description sourceRefs explicit nonWaivable releaseRequired surfaceIds checks') || r.description?.trim().split(/\s+/).length > 120 || typeof r.id !== 'string' || !r.id.trim() || typeof r.description !== 'string' || !r.description.trim() || !Array.isArray(r.sourceRefs) || !r.sourceRefs.length || !r.sourceRefs.every(ref => doc.originalSources.some(s => s.path === ref)) || typeof r.explicit !== 'boolean' || typeof r.nonWaivable !== 'boolean' || typeof r.releaseRequired !== 'boolean' || !Array.isArray(r.surfaceIds) || !r.surfaceIds.length || !Array.isArray(r.checks) || !r.checks.length || !r.checks.every(c => c && onlyKeys(c, 'id kind description') && c.description?.trim().split(/\s+/).length <= 80 && typeof c.id === 'string' && c.id.trim() && ['success','recovery'].includes(c.kind) && typeof c.description === 'string' && c.description.trim()) || new Set(r.checks.map(c => c.id)).size !== r.checks.length) throw new Error(`delivery: invalid authoritative requirement ${r?.id}`);
      requirements.push(r);
    }
  }
  if (new Set(requirements.map(r => r.id)).size !== requirements.length) throw new Error('delivery: duplicate authoritative requirement IDs');
  return { requirements, originalSources };
}
/** Full source/obligation contract, for owner scope coverage/change decisions. */
export function deliveryScopeDigest(manifest: DeliveryManifest): string {
  return digest({ runId: manifest.runId, projectRoot: manifest.projectRoot, scopeRevision: manifest.scopeRevision, sourceInputs: manifest.sourceInputs, surfaces: manifest.surfaces, outcomes: manifest.outcomes, authorization: manifest.authorization });
}
/** Actual current content is hashed, rather than trusting revision labels. Relevant
 * dependency fingerprints are recursive so stale prerequisites propagate. */
export function deliveryEvidenceBinding(scope: DeliveryScope, outcomeId: string): { targetDigest: string; targetContextDigest: string; snapshotDigest: string } {
  const { requirements, originalSources } = readDeliveryRequirements(scope);
  const visiting = new Set<string>(); const cache = new Map<string, { targetDigest: string; targetContextDigest: string; snapshotDigest: string }>();
  const visit = (id: string): { targetDigest: string; targetContextDigest: string; snapshotDigest: string } => {
    const previous = cache.get(id); if (previous) return previous;
    if (visiting.has(id)) throw new Error(`delivery: cyclic outcome dependency ${id}`); visiting.add(id);
    const outcome = scope.manifest.outcomes.find(o => o.id === id); if (!outcome) throw new Error(`delivery: unknown outcome ${id}`);
    const surface = scope.manifest.surfaces.find(s => s.id === outcome.surfaceId); if (!surface) throw new Error(`delivery: unknown surface ${outcome.surfaceId}`);
    const actualBindings = surface.target.bindings.map(b => ({ path: b.path, sha256: sha256(fs.readFileSync(confined(scope.projectRoot, b.path))) }));
    const targetDigest = digest({ ...surface, target: { ...surface.target, bindings: actualBindings } });
    const { bindings: _bindings, ...context } = surface.target;
    const targetContextDigest = digest({ surfaceId: surface.id, kind: surface.kind, entryPoint: surface.entryPoint, target: context });
    const dependencies = outcome.dependencies.map(d => ({ ...d, snapshotDigest: visit(d.outcomeId).snapshotDigest }));
    const result = { targetDigest, targetContextDigest, snapshotDigest: digest({ runId: scope.manifest.runId, projectRoot: scope.projectRoot, outcome, requirements: requirements.filter(r => outcome.requirementIds.includes(r.id)), originalSources, targetDigest, dependencies }) };
    visiting.delete(id); cache.set(id, result); return result;
  };
  return visit(outcomeId);
}
export function deliveryReviewBinding(scope: DeliveryScope, outcomeIds: string[], evidence: DeliveryEvidence[] = scope.manifest.evidenceRefs): ReviewBinding {
  const ids = [...outcomeIds].sort();
  return { outcomeIds: ids, scopeDigest: digest(ids.map(id => ({ id, ...deliveryEvidenceBinding(scope, id) }))), artifactDigests: [...new Set([...evidence.filter(e => ids.includes(e.outcomeId)).flatMap(e => [e.artifact.sha256, digest({ evidenceRecord: e })]), ...scope.manifest.slices.filter(s => s.outcomeIds.some(id => ids.includes(id))).flatMap(s => s.detailedFiles.map(f => sha256(fs.readFileSync(confined(scope.runDirectory, f)))))])].sort() };
}
function sameSet(a: string[], b: string[]): boolean { return canonical([...new Set(a)].sort()) === canonical([...new Set(b)].sort()) && new Set(a).size === a.length; }
function isImage(data: Buffer): boolean {
  const png = data.length > 44 && data.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])) && data.toString('ascii',12,16) === 'IHDR' && data.readUInt32BE(16) > 0 && data.readUInt32BE(20) > 0 && data.includes(Buffer.from('IEND'));
  const jpeg = data.length > 32 && data[0] === 255 && data[1] === 216 && data[data.length - 2] === 255 && data[data.length - 1] === 217;
  const webp = data.length > 32 && data.toString('ascii',0,4) === 'RIFF' && data.toString('ascii',8,12) === 'WEBP' && ['VP8 ','VP8L','VP8X'].includes(data.toString('ascii',12,16)) && data.readUInt32LE(4) === data.length - 8;
  return png || jpeg || webp;
}
const visual = (kind: string) => ['web','native','desktop'].includes(kind);

export function validateDelivery(targetDir: string, options: DeliveryValidationOptions): DeliveryReport {
  const report: DeliveryReport = { valid: false, stage: options.stage, issues: [], metrics: { pendingWords: 0, pendingBytes: 0, pendingUnits: 0, pendingSlices: 0, reviewRounds: 0, reworkUnits: 0 }, completion: { planReady: false, proofAccepted: false, sliceAccepted: false, releaseReady: false, acceptedOutcomeIds: [], technicallyVerifiedOutcomeIds: [], excludedOutcomeIds: [], staleOutcomeIds: [] } };
  const issue = (s: string) => { if (!report.issues.includes(s)) report.issues.push(s); };
  if (!['plan','execute','advance','release'].includes(options.stage)) { issue('delivery: invalid validation stage'); return report; }
  try {
    const scope = resolveDeliveryScope(targetDir, { allowLegacy: false })!; const m = scope.manifest;
    const { requirements, originalSources } = readDeliveryRequirements(scope);
    const allIds = m.outcomes.map(o => o.id); const outcomeById = new Map(m.outcomes.map(o => [o.id, o])); const sliceById = new Map(m.slices.map(s => [s.id, s]));
    const trusted = (d: DeliveryDecision | undefined, binding: ReviewBinding, role?: 'owner' | 'independent' | 'agent'): boolean => {
      if (!d || d.result !== 'approved' || d.scopeDigest !== binding.scopeDigest || !sameSet(d.artifactDigests, binding.artifactDigests) || !sameSet(d.outcomeIds, binding.outcomeIds)) return false;
      if (role === 'owner' && d.reviewer.role !== 'owner') return false;
      if (role === 'independent' && (d.reviewer.role !== 'independent' || d.reviewer.contextId === m.authorization.implementerContextId)) return false;
      if (d.reviewer.role === 'independent' && d.reviewer.contextId === m.authorization.implementerContextId) return false;
      try { return options.trustedReviewProvider?.verify(d, binding) === true; } catch { return false; }
    };
    const acceptanceRoles: ('owner' | 'independent' | 'agent')[] = [];
    if (m.authorization.checkpoints === 'every-slice' || m.authorization.designAcceptance === 'owner') acceptanceRoles.push('owner');
    if (m.authorization.independentReview || m.authorization.designAcceptance === 'independent') acceptanceRoles.push('independent');
    if (!acceptanceRoles.length) acceptanceRoles.push('agent');
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
    const scopeBinding: ReviewBinding = { scopeDigest: deliveryScopeDigest(m), outcomeIds: [...allIds].sort(), artifactDigests: [...new Set([...m.sourceInputs, ...originalSources].map(s => s.sha256))].sort() };
    const coverageDecision = m.decisionRefs.find(d => d.kind === 'scope-review' && trusted(d, scopeBinding, m.authorization.designAcceptance));
    if (!coverageDecision) issue('scope: original-source coverage review pending or provenance unverified');
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
      for (const id of slice.outcomeIds) if (!slice.units.some(u => u.outcomeIds.includes(id))) issue(`scope: slice outcome ${id} lacks an implementation unit`);
    }
    const evidenceByOutcome = new Map<string, DeliveryEvidence[]>(); const evidenceFailures = new Map<string, string[]>();
    for (const e of m.evidenceRefs) {
      const fail = (s: string) => { const failures = evidenceFailures.get(e.outcomeId) ?? []; failures.push(`evidence ${e.id}: ${s}`); evidenceFailures.set(e.outcomeId, failures); };
      try {
        const outcome = outcomeById.get(e.outcomeId); if (!outcome) { issue(`evidence: unknown outcome ${e.outcomeId}`); continue; }
        const surface = m.surfaces.find(s => s.id === outcome.surfaceId)!;
        const binding = deliveryEvidenceBinding(scope, outcome.id);
        if (!outcome.checks.some(c => c.id === e.checkId)) throw new Error('unknown acceptance check');
        if (e.targetId !== surface.target.id || (e.targetDigest !== binding.targetDigest || e.snapshotDigest !== binding.snapshotDigest) && !canCarryForward(e, binding.targetContextDigest)) throw new Error('stale source, contract, dependency or target binding');
        // A changed manifest expected hash is itself stale, even if an evidence author rehashes current files.
        for (const b of surface.target.bindings) checkedFile(scope.projectRoot, b);
        const time = Date.parse(e.observedAt); if (!Number.isFinite(time) || time > (options.now ?? new Date()).getTime() + 60_000) throw new Error('invalid/future observation time');
        const raw = checkedFile(scope.projectRoot, e.artifact);
        if (e.result !== 'pass') throw new Error('observed execution failed');
        if (e.kind === 'image' && (!isImage(raw) || !e.capture || !e.capture.composed || e.capture.surfaceId !== outcome.surfaceId)) throw new Error('actual composed image capture required');
        if (['consumer','operation','evaluation','render'].includes(e.kind) && !e.consumer?.trim()) throw new Error('consumer/operation identity required');
        if (options.stage === 'release' && (!m.releaseCandidate || e.releaseCandidate !== m.releaseCandidate || !e.productionComposition || surface.target.providerMode !== 'real')) throw new Error('real production composition and consistent release candidate required');
        const items = evidenceByOutcome.get(outcome.id) ?? []; items.push(e); evidenceByOutcome.set(outcome.id, items);
      } catch (error) { fail((error as Error).message); }
    }
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
      if (!slice.outcomeIds.every(id => technical.has(id))) return false;
      const ids = new Set([...(slice.acceptanceDecisionIds ?? []), ...(slice.acceptanceDecisionId ? [slice.acceptanceDecisionId] : [])]);
      const decisions = m.decisionRefs.filter(d => ids.has(d.id) && d.kind === 'acceptance');
      const items = m.evidenceRefs.filter(e => slice.outcomeIds.includes(e.outcomeId));
      const binding = deliveryReviewBinding(scope, slice.outcomeIds, items);
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
    for (const id of active.outcomeIds) for (const dependency of outcomeById.get(id)?.dependencies ?? []) {
      if (active.outcomeIds.includes(dependency.outcomeId)) continue;
      if (!(dependency.kind === 'technical' ? technical : accepted).has(dependency.outcomeId)) issue(`dependency: ${id} requires ${dependency.kind} prerequisite ${dependency.outcomeId}`);
    }
    validateBudget(scope, acceptedSlices, report, trusted, scopeBinding, new Set([...evidenceByOutcome.values()].flat().map(e => confined(scope.projectRoot, e.artifact.path))), options.trustedProjectionProvider);
    const planIssues = report.issues.length;
    report.completion.planReady = planIssues === 0;
    if (options.stage === 'advance' || options.stage === 'release') {
      const requiredIds = options.stage === 'release' ? m.outcomes.filter(o => o.applicability === 'applicable' && o.releaseRequired).map(o => o.id) : active.outcomeIds;
      for (const id of requiredIds) {
        if (!technical.has(id)) { issue(`acceptance: outcome ${id} lacks current success/recovery and required surface evidence`); for (const failure of evidenceFailures.get(id) ?? []) issue(failure); }
        if (!accepted.has(id)) issue(`acceptance: outcome ${id} review pending or provenance unverified`);
      }
      if (options.stage === 'release') {
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

function validateBudget(scope: DeliveryScope, acceptedSlices: Set<string>, report: DeliveryReport, trusted: (decision: DeliveryDecision | undefined, binding: ReviewBinding, role?: 'owner' | 'independent' | 'agent') => boolean, scopeBinding: ReviewBinding, currentEvidenceArtifacts: Set<string>, trustedProjectionProvider?: DeliveryValidationOptions['trustedProjectionProvider']): void {
  const m = scope.manifest; const issue = (message: string) => { if (!report.issues.includes(message)) report.issues.push(message); };
  const proofAccepted = acceptedSlices.has(m.firstProofSlice); let limits = proofAccepted ? { maxUnits: 8, maxWords: 6000, maxBytes: 48000, maxSlices: 2 } : { maxUnits: 5, maxWords: 4000, maxBytes: 32000, maxSlices: 1 };
  if (m.planningBudget.extensionDecisionId) {
    const extension = m.decisionRefs.find(d => d.id === m.planningBudget.extensionDecisionId && d.kind === 'budget-extension');
    if (!extension?.budget || extension.reason.trim().split(/\s+/).length < 6 || !trusted(extension, scopeBinding, 'independent')) issue('budget: extension needs bounded limits, dependency/risk reason and trusted independent review');
    else limits = extension.budget;
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
  const seen = new Set<string>(); const scanned = new Set<string>();
  const scan = (dir: string) => {
    if (scanned.has(dir)) return; scanned.add(dir);
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const raw = path.join(dir, entry.name); const file = confined(scope.projectRoot, path.relative(scope.projectRoot, raw)); const stat = fs.statSync(file);
      if (stat.isDirectory()) { scan(file); continue; }
      if (!stat.isFile() || file === path.join(scope.runDirectory, 'delivery-manifest.json')) continue;
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
  if (report.metrics.pendingUnits > limits.maxUnits) issue(`budget: ${report.metrics.pendingUnits} pending units exceeds ${limits.maxUnits}`);
  if (report.metrics.pendingSlices > limits.maxSlices) issue(`budget: ${report.metrics.pendingSlices} pending slices exceeds ${limits.maxSlices}`);
  if (report.metrics.pendingWords > limits.maxWords) issue(`budget: ${report.metrics.pendingWords} pending words exceeds ${limits.maxWords}`);
  if (report.metrics.pendingBytes > limits.maxBytes) issue(`budget: ${report.metrics.pendingBytes} pending bytes exceeds ${limits.maxBytes}`);
}
