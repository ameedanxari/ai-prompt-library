import * as fs from 'node:fs';
import * as path from 'node:path';
import { createHash } from 'node:crypto';
import type { DeliveryManifest, DeliveryScope } from './types.js';

export function sha256(data: string | Buffer): string { return createHash('sha256').update(data).digest('hex'); }
export function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`;
  if (value !== null && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`).join(',')}}`;
  return JSON.stringify(value);
}
export function digest(value: unknown): string { return sha256(canonical(value)); }
export function confined(root: string, relative: string, mustExist = true): string {
  if (typeof relative !== 'string' || !relative.trim() || path.isAbsolute(relative)) throw new Error(`delivery: expected a relative path: ${relative}`);
  const base = fs.realpathSync(root);
  const candidate = path.resolve(base, relative);
  if (candidate !== base && !candidate.startsWith(base + path.sep)) throw new Error(`delivery: path escapes root: ${relative}`);
  let real = candidate;
  if (fs.existsSync(candidate)) real = fs.realpathSync(candidate);
  else if (mustExist) throw new Error(`delivery: missing file: ${relative}`);
  else { let parent = path.dirname(candidate); while (!fs.existsSync(parent)) parent = path.dirname(parent); real = path.join(fs.realpathSync(parent), path.relative(parent, candidate)); }
  if (real !== base && !real.startsWith(base + path.sep)) throw new Error(`delivery: symlink escapes root: ${relative}`);
  return real;
}
function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(`delivery manifest: ${message}`); }
const record = (x: unknown): x is Record<string, any> => !!x && typeof x === 'object' && !Array.isArray(x);
const text = (x: unknown) => typeof x === 'string' && x.trim().length > 0 && x.length <= 2000;
function keys(value: Record<string, any>, allowed: string, label: string): void { assert(Object.keys(value).every(k => allowed.split(' ').includes(k)), `unknown fields in ${label}; detailed appendices belong in the counted corpus`); }
const strings = (x: unknown): x is string[] => Array.isArray(x) && x.every(text);
const hash = (x: unknown) => typeof x === 'string' && /^[a-f0-9]{64}$/.test(x);
function unique(items: { id: string }[], label: string): void { assert(new Set(items.map(x => x.id)).size === items.length, `duplicate ${label} IDs`); }
export function parseDeliveryManifest(value: unknown): DeliveryManifest {
  assert(record(value), 'expected object'); const m = value;
  keys(m, 'schemaVersion kind runId scopeRevision projectRoot sourceInputs planningInputs surfaces authorization planningBudget outcomes slices activeSlice nextSlice firstProofSlice evidenceRefs decisionRefs releaseCandidate', 'manifest');
  assert([1, 2].includes(m.schemaVersion) && m.kind === 'outcome-delivery', 'unknown schemaVersion or kind (refusing legacy downgrade)');
  assert(text(m.runId) && Number.isInteger(m.scopeRevision) && m.scopeRevision > 0 && text(m.projectRoot), 'invalid run identity');
  for (const field of ['sourceInputs', 'surfaces', 'outcomes', 'slices', 'evidenceRefs', 'decisionRefs']) assert(Array.isArray(m[field]), `${field} must be an array`);
  for (const field of ['sourceInputs', 'surfaces', 'outcomes', 'slices']) assert(m[field].length > 0, `${field} must not be empty`);
  for (const field of ['sourceInputs', 'surfaces', 'outcomes', 'slices', 'evidenceRefs', 'decisionRefs']) { assert(m[field].every((x: unknown) => record(x) && text(x.id)), `invalid ${field} IDs`); unique(m[field], field); }
  const binding = (b: any) => record(b) && text(b.path) && hash(b.sha256);
  assert(m.sourceInputs.every(binding), 'invalid source input binding');
  assert(m.schemaVersion !== 2 || Array.isArray(m.planningInputs) && [2, 3].includes(m.planningInputs.length), 'version 2 requires both planning input bindings');
  if (m.planningInputs !== undefined) { assert(Array.isArray(m.planningInputs) && m.planningInputs.every(binding), 'invalid planning input bindings'); for (const b of m.planningInputs) keys(b, 'path sha256', 'planning binding'); }
  for (const b of m.sourceInputs) keys(b, 'id path sha256', 'sourceInputs');
  const kinds = ['web','native','desktop','api','sdk','cli','automation','data','ml','infrastructure','document','media'];
  for (const s of m.surfaces) {
    keys(s, 'id kind entryPoint target', 'surface');
    assert(kinds.includes(s.kind) && text(s.entryPoint) && record(s.target), `invalid surface ${s.id}`);
    const t = s.target; keys(t, 'id environment providerMode bindings identity revision sharedPaths', 'target'); assert(text(t.id) && text(t.environment) && ['real','controlled','fake'].includes(t.providerMode), `invalid target ${s.id}`);
    assert(Array.isArray(t.bindings) && t.bindings.length && t.bindings.every(binding) && record(t.identity) && Object.values(t.identity).every(text), `missing source/config/input bindings or identity for ${s.id}`);
    assert(t.revision === undefined || text(t.revision), 'invalid target revision');
    assert(t.sharedPaths === undefined || strings(t.sharedPaths) && new Set(t.sharedPaths).size === t.sharedPaths.length, 'invalid shared dependency paths');
    assert(new Set(t.bindings.map((b: any) => b.path)).size === t.bindings.length, 'duplicate target binding paths');
    for (const b of t.bindings) keys(b, 'path sha256', 'target binding');
    if (s.kind === 'native') assert(text(t.identity.os) && text(t.identity.device), `native target ${s.id} requires os/device`);
    if (s.kind === 'sdk') assert(text(t.identity.consumer) && text(t.identity.version), `SDK target ${s.id} requires consumer/version`);
    if (['data','ml'].includes(s.kind)) assert(text(t.identity.input) && text(t.identity.evaluationSet), `data target ${s.id} requires input/evaluationSet`);
  }
  assert(new Set(m.surfaces.map((s: any) => s.target.id)).size === m.surfaces.length, 'target IDs must be unique');
  const evidenceKinds = ['execution','recovery','image','consumer','operation','evaluation','render','production-integration','design-review'];
  const checks = (cs: any) => Array.isArray(cs) && cs.length > 0 && cs.every((c: any) => record(c) && text(c.id) && ['success','recovery'].includes(c.kind) && text(c.description)) && new Set(cs.map((c: any) => c.id)).size === cs.length;
  for (const o of m.outcomes) {
    keys(o, 'id releaseScopeId requirementIds actor entryPoint surfaceId applicability applicabilityReason releaseRequired requiredEvidenceKinds checks dependencies decisionId bindingPaths', 'outcome');
    assert(o.releaseScopeId === undefined || text(o.releaseScopeId), `invalid release scope for outcome ${o.id}`);
    assert(o.bindingPaths === undefined || strings(o.bindingPaths) && o.bindingPaths.length > 0 && new Set(o.bindingPaths).size === o.bindingPaths.length, 'invalid outcome dependency paths');
    for (const c of o.checks ?? []) keys(c, 'id kind description', 'check');
    for (const d of o.dependencies ?? []) keys(d, 'outcomeId kind', 'dependency');
    assert(strings(o.requirementIds) && o.requirementIds.length && text(o.actor) && text(o.entryPoint) && text(o.surfaceId), `invalid outcome ${o.id}`);
    assert(['applicable','excluded'].includes(o.applicability) && text(o.applicabilityReason) && typeof o.releaseRequired === 'boolean', `invalid applicability ${o.id}`);
    assert(checks(o.checks) && strings(o.requiredEvidenceKinds) && o.requiredEvidenceKinds.every((k: string) => evidenceKinds.includes(k)), `invalid acceptance checks ${o.id}`);
    assert(Array.isArray(o.dependencies) && o.dependencies.every((d: any) => record(d) && text(d.outcomeId) && ['technical','accepted'].includes(d.kind)), `invalid dependencies ${o.id}`);
  }
  for (const s of m.slices) {
    keys(s, 'id kind outcomeIds deferredOutcomeIds units detailedFiles acceptanceDecisionId acceptanceDecisionIds', 'slice');
    for (const u of s.units ?? []) keys(u, 'id planningNodeIds outcomeIds acceptance affectedPaths dependsOn', 'unit');
    assert(['proof','delivery'].includes(s.kind) && strings(s.outcomeIds) && s.outcomeIds.length && strings(s.detailedFiles) && Array.isArray(s.units), `invalid slice ${s.id}`);
    assert(s.units.length && s.units.every((u: any) => record(u) && text(u.id) && strings(u.outcomeIds) && u.outcomeIds.length && text(u.acceptance) && strings(u.affectedPaths) && u.affectedPaths.length && strings(u.dependsOn)), `invalid implementation units ${s.id}`);
    if (s.deferredOutcomeIds !== undefined) {
      assert(m.schemaVersion === 2 && s.kind === 'proof' && s.id === m.firstProofSlice, 'deferredOutcomeIds is restricted to the version 2 first proof slice');
      assert(strings(s.deferredOutcomeIds) && new Set(s.deferredOutcomeIds).size === s.deferredOutcomeIds.length, 'deferredOutcomeIds must contain unique outcome IDs');
      assert(s.deferredOutcomeIds.every((id: string) => s.outcomeIds.includes(id) && m.outcomes.some((o: any) => o.id === id && o.applicability === 'applicable')), 'deferredOutcomeIds must be applicable outcomes within the proof slice');
      assert(s.units.every((u: any) => !u.outcomeIds.some((id: string) => s.deferredOutcomeIds.includes(id))), 'deferred outcomes must not have implementation units until refined');
    }
    unique(s.units, `slice ${s.id} unit`);
    if (m.schemaVersion === 2) assert(s.units.every((u: any) => strings(u.planningNodeIds) && u.planningNodeIds.length > 0), 'version 2 units require planningNodeIds');
    assert(s.acceptanceDecisionIds === undefined || strings(s.acceptanceDecisionIds), `invalid acceptanceDecisionIds ${s.id}`);
  }
  assert(text(m.activeSlice) && text(m.firstProofSlice) && (m.nextSlice === undefined || text(m.nextSlice)), 'missing active/proof slice');
  const a = m.authorization; assert(record(a), 'invalid authorization'); keys(a, 'execution checkpoints designAcceptance scopeChange independentReview implementerContextId instruction', 'authorization'); assert(record(a) && typeof a.execution === 'boolean' && ['every-slice','autonomous'].includes(a.checkpoints) && ['owner','independent','agent'].includes(a.designAcceptance) && ['owner','agent-applicability'].includes(a.scopeChange) && typeof a.independentReview === 'boolean' && text(a.implementerContextId), 'invalid authorization');
  if (a.instruction !== undefined) {
    const i = a.instruction; assert(record(i), 'invalid authorization instruction'); keys(i, 'source quote sourceLocation messageAt reference stopAfter', 'authorization instruction');
    assert(binding(i.source) && text(i.quote) && text(i.sourceLocation) && text(i.messageAt) && text(i.reference) && ['planning','none'].includes(i.stopAfter), 'invalid source-bound authorization instruction'); keys(i.source, 'path sha256', 'authorization source');
  }
  const p = m.planningBudget; assert(record(p), 'invalid planning budget'); keys(p, 'corpusRoots ledgerFiles extensionDecisionId observedTokens reviewRounds reworkUnits', 'planning budget'); assert(record(p) && strings(p.corpusRoots) && p.corpusRoots.length && strings(p.ledgerFiles) && Number.isInteger(p.reviewRounds) && p.reviewRounds >= 0 && Number.isInteger(p.reworkUnits) && p.reworkUnits >= 0 && (p.observedTokens === undefined || Number.isInteger(p.observedTokens) && p.observedTokens >= 0), 'invalid planning budget');
  for (const e of m.evidenceRefs) {
    keys(e, 'id outcomeId checkId kind targetId targetDigest targetContextDigest snapshotDigest reviewDigest artifact command observedResult observedAt result capture consumer productionComposition releaseCandidate', 'evidence');
    if (record(e.artifact)) keys(e.artifact, 'path sha256', 'artifact');
    if (record(e.capture)) keys(e.capture, 'surfaceId state viewport theme route composed', 'capture');
    assert(text(e.outcomeId) && text(e.checkId) && evidenceKinds.includes(e.kind) && text(e.targetId) && hash(e.targetDigest) && hash(e.snapshotDigest) && binding(e.artifact), `invalid evidence ${e.id}`);
    assert(e.reviewDigest === undefined || hash(e.reviewDigest), 'invalid reviewDigest');
    assert(e.targetContextDigest === undefined || hash(e.targetContextDigest), `invalid targetContextDigest ${e.id}`);
    assert(text(e.command) && text(e.observedResult) && text(e.observedAt) && ['pass','fail'].includes(e.result) && typeof e.productionComposition === 'boolean', `invalid execution record ${e.id}`);
    if (e.capture !== undefined) assert(record(e.capture) && text(e.capture.surfaceId) && ['entry','success','recovery'].includes(e.capture.state) && text(e.capture.viewport) && (e.capture.theme === undefined || text(e.capture.theme)) && (e.capture.route === undefined || text(e.capture.route)) && typeof e.capture.composed === 'boolean', `invalid capture ${e.id}`);
  }
  for (const d of m.decisionRefs) {
    keys(d, 'id kind releaseScopeId outcomeIds scopeDigest artifactDigests reviewer provenance result reason requirementIds evidenceIds budget unitId', 'decision');
    assert(d.kind === 'unit-completion' ? text(d.unitId) : d.unitId === undefined, 'unitId is required only for unit-completion');
    assert(d.releaseScopeId === undefined || d.kind === 'release-review' && text(d.releaseScopeId) && d.releaseScopeId !== '*', `invalid release scope for decision ${d.id}`);
    if (record(d.reviewer)) keys(d.reviewer, 'id contextId role', 'reviewer');
    if (record(d.provenance)) keys(d.provenance, 'kind reference attestation', 'provenance');
    if (record(d.budget)) keys(d.budget, 'maxUnits maxWords maxBytes maxSlices', 'extension limits');
    assert(['scope-review','acceptance','scope-change','budget-extension','carry-forward','design-review','release-review','unit-completion'].includes(d.kind) && strings(d.outcomeIds) && hash(d.scopeDigest) && strings(d.artifactDigests) && d.artifactDigests.every(hash), `invalid decision ${d.id}`);
    assert(record(d.reviewer) && text(d.reviewer.id) && text(d.reviewer.contextId) && ['owner','independent','agent'].includes(d.reviewer.role) && record(d.provenance) && ['owner-message','review-session','external','owner-attested'].includes(d.provenance.kind) && text(d.provenance.reference) && ['approved','rejected'].includes(d.result) && text(d.reason), `invalid reviewer provenance ${d.id}`);
    if (d.provenance.kind === 'owner-attested') { assert(record(d.provenance.attestation), `owner-attested decision ${d.id} requires attestation`); keys(d.provenance.attestation, 'quote messageAt scopeDigest', 'owner attestation'); }
    else assert(d.provenance.attestation === undefined, `attestation is restricted to owner-attested provenance ${d.id}`);
    if (d.requirementIds !== undefined) assert(strings(d.requirementIds), `invalid requirement IDs ${d.id}`);
    if (d.evidenceIds !== undefined) assert(strings(d.evidenceIds), `invalid evidence IDs ${d.id}`);
    if (d.budget !== undefined) assert(record(d.budget) && ['maxUnits','maxWords','maxBytes','maxSlices'].every(k => Number.isInteger(d.budget[k]) && d.budget[k] > 0), `invalid budget extension ${d.id}`);
  }
  return m as DeliveryManifest;
}
function findProjectRoot(start: string): string {
  let current = start;
  while (true) {
    if (fs.existsSync(path.join(current, 'MY_PROJECT.md')) || fs.existsSync(path.join(current, '.git')) || fs.existsSync(path.join(current, 'AGENTS.md'))) return current;
    const parent = path.dirname(current); if (parent === current) return start; current = parent;
  }
}
/** Resolve before any task parsing. A checkpoint with run_directory is migrated:
 * a missing manifest is an error, including when allowLegacy was requested. */
export function resolveDeliveryScope(targetDir: string, options: { allowLegacy?: boolean } = {}): DeliveryScope | null {
  const requestedPath = fs.realpathSync(targetDir);
  const requested = fs.statSync(requestedPath).isFile() ? path.dirname(requestedPath) : requestedPath;
  assert(fs.statSync(requested).isDirectory(), 'target directory must exist');
  let runDirectory = requested;
  // Files/nested directories cannot bypass an enclosing delivery contract.
  let ancestor = requested;
  while (!fs.existsSync(path.join(runDirectory, 'delivery-manifest.json'))) {
    if (fs.existsSync(path.join(ancestor, 'AGENTS.md')) || fs.existsSync(path.join(ancestor, '.git'))) break;
    const parent = path.dirname(ancestor); if (parent === ancestor) break; ancestor = parent;
    if (fs.existsSync(path.join(ancestor, 'delivery-manifest.json'))) { runDirectory = ancestor; break; }
  }
  const projectHint = findProjectRoot(requested);
  const candidates = [...new Set([path.join(requested, 'resumption-checkpoint.md'), path.join(requested, 'prompts/outputs/current/resumption-checkpoint.md'), ...(!fs.existsSync(path.join(runDirectory, 'delivery-manifest.json')) ? [path.join(projectHint, 'resumption-checkpoint.md'), path.join(projectHint, 'prompts/outputs/current/resumption-checkpoint.md')] : [])])];
  let migrated = false;
  for (const cp of candidates) {
    if (!fs.existsSync(cp)) continue;
    const content = fs.readFileSync(cp, 'utf8');
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(content)?.[1] ?? '';
    const match = /^run_directory:\s*(.*?)\s*$/m.exec(frontmatter);
    migrated ||= /^(?:delivery_mode:\s*outcome-delivery|manifest(?:_path)?:.*delivery-manifest\.json|kind:\s*outcome-delivery)\s*$/m.test(frontmatter);
    if (match) {
      let pointer = match[1].replace(/\s+#.*$/, '').trim();
      if ((pointer.startsWith('"') && pointer.endsWith('"')) || (pointer.startsWith("'") && pointer.endsWith("'"))) pointer = pointer.slice(1, -1);
      if (!pointer || ['null','~'].includes(pointer)) throw new Error('delivery: invalid checkpoint run_directory');
      const root = findProjectRoot(path.dirname(cp));
      runDirectory = confined(root, pointer); migrated = true; break;
    }
  }
  const manifestPath = path.join(runDirectory, 'delivery-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    if (migrated || options.allowLegacy === false) throw new Error('delivery: manifest required; missing migrated/new-run manifest (refusing legacy downgrade)');
    return null;
  }
  const manifest = parseDeliveryManifest(JSON.parse(fs.readFileSync(manifestPath, 'utf8')));
  // projectRoot may legitimately be an ancestor of an isolated run.
  const projectRoot = fs.realpathSync(path.resolve(runDirectory, manifest.projectRoot));
  if (runDirectory !== projectRoot && !runDirectory.startsWith(projectRoot + path.sep)) throw new Error('delivery: run directory must be within projectRoot');
  const active = manifest.slices.find(s => s.id === manifest.activeSlice);
  assert(active, 'activeSlice does not resolve');
  const activeFiles = active.detailedFiles.map(file => confined(runDirectory, file));
  return { runDirectory, projectRoot, manifest, activeFiles };
}
