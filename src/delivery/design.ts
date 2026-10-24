import type { DesignComparison, DesignContract, DeliveryEvidence, DeliveryOutcome, DeliverySurface, FileBinding } from './types.js';

const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max = 1000): v is string => typeof v === 'string' && !!v.trim() && v.length <= max;
const keys = (v: object, allowed: string) => Object.keys(v).every(k => allowed.split(' ').includes(k));
const unique = (values: string[]) => new Set(values).size === values.length;
const coreDimensions = ['intent', 'composition', 'hierarchy', 'responsive'];
const strings = (v: unknown, min = 0, max = 12): v is string[] => Array.isArray(v) && v.length >= min && v.length <= max && v.every(s => text(s, 800)) && unique(v);
export const visualSurface = (kind: string) => ['web', 'native', 'desktop'].includes(kind);
function requireDesign(ok: unknown, message: string): asserts ok {
  if (!ok) throw new Error(`design: ${message}`);
}

/** Small source-derived contract, not a second backlog or a machine aesthetic score. */
export function readDesignContracts(value: unknown, originals: FileBinding[]): DesignContract[] {
  if (value === undefined) return [];
  requireDesign(Array.isArray(value), 'designs must be an array');
  for (const d of value) {
    requireDesign(object(d) && keys(d, 'surfaceId sourceRefs criteria contexts') && text(d.surfaceId), 'invalid surface design contract');
    requireDesign(Array.isArray(d.sourceRefs) && d.sourceRefs.length && unique(d.sourceRefs) && d.sourceRefs.every((ref: unknown) => text(ref) && originals.some(s => s.path === ref)), 'design authority must reference retained original sources');
    requireDesign(Array.isArray(d.criteria) && d.criteria.length >= 4 && d.criteria.length <= 12, 'use 4–12 concise design criteria');
    for (const c of d.criteria) {
      requireDesign(object(c) && keys(c, 'id dimension sourceRef sourceLocation expectation applicability') && text(c.id, 100) && [...coreDimensions,'typography','imagery','interaction'].includes(String(c.dimension)) && d.sourceRefs.includes(c.sourceRef) && text(c.sourceLocation, 300) && text(c.expectation, 800), 'criterion needs a source/location and observable expectation');
      const a = c.applicability;
      requireDesign(object(a) && keys(a, 'outcomeIds exclusions') && strings(a.outcomeIds, 0, 96) && Array.isArray(a.exclusions) && a.exclusions.length <= 96, 'criterion needs explicit outcome applicability; migrate legacy design criteria explicitly');
      for (const exclusion of a.exclusions) {
        requireDesign(object(exclusion) && keys(exclusion, 'outcomeId sourceRef sourceLocation reason') && text(exclusion.outcomeId, 100) && d.sourceRefs.includes(exclusion.sourceRef) && text(exclusion.sourceLocation, 300) && text(exclusion.reason, 800), 'criterion exclusion needs retained source authority, location and reason');
      }
      const outcomeIds = a.outcomeIds;
      requireDesign(unique(a.exclusions.map(e => e.outcomeId)) && a.exclusions.every(e => !outcomeIds.includes(e.outcomeId)), 'criterion applicability must not overlap or duplicate exclusions');
      requireDesign(a.outcomeIds.length + a.exclusions.length > 0, 'criterion applicability cannot be empty');
    }
    requireDesign(unique(d.criteria.map(c => c.id)), 'duplicate criterion IDs');
    const criteria = d.criteria;
    requireDesign(d.sourceRefs.every(ref => criteria.some(c => c.sourceRef === ref)), 'every declared design source needs a comparison criterion');
    for (const dimension of coreDimensions) requireDesign(d.criteria.some(c => c.dimension === dimension), `missing ${dimension} criterion; token compliance alone is insufficient`);
    requireDesign(Array.isArray(d.contexts) && d.contexts.length && d.contexts.length <= 8, 'use 1–8 required capture contexts');
    for (const c of d.contexts) requireDesign(object(c) && keys(c, 'id viewport theme') && text(c.id, 100) && typeof c.viewport === 'string' && /^[1-9]\d{1,3}x[1-9]\d{1,3}$/.test(c.viewport) && text(c.theme, 100), 'context needs explicit viewport and theme');
    requireDesign(unique(d.contexts.map(c => c.id)) && unique(d.contexts.map(c => `${c.viewport}/${c.theme}`)), 'duplicate design contexts');
  }
  return value as DesignContract[];
}

export function validateDesignCoverage(designs: DesignContract[], surfaces: DeliverySurface[], outcomes: DeliveryOutcome[]): void {
  requireDesign(unique(designs.map(d => d.surfaceId)), 'duplicate surface contracts');
  for (const d of designs) {
    requireDesign(surfaces.some(s => s.id === d.surfaceId && visualSurface(s.kind)), `unknown/nonvisual design surface ${d.surfaceId}`);
    const surfaceOutcomes = outcomes.filter(o => o.surfaceId === d.surfaceId && o.applicability === 'applicable');
    for (const c of d.criteria) {
      const a = c.applicability;
      requireDesign([...a.outcomeIds, ...a.exclusions.map(e => e.outcomeId)].every(id => surfaceOutcomes.some(o => o.id === id)), `criterion ${c.id} references unknown/nonapplicable outcome`);
      for (const o of surfaceOutcomes) requireDesign(a.outcomeIds.includes(o.id) || a.exclusions.some(e => e.outcomeId === o.id), `criterion ${c.id} needs explicit applicability for outcome ${o.id}`);
    }
    for (const o of surfaceOutcomes) {
      for (const dimension of coreDimensions) requireDesign(d.criteria.some(c => c.dimension === dimension && c.applicability.outcomeIds.includes(o.id)), `outcome ${o.id} needs applicable ${dimension} criterion; core experience cannot be excluded`);
    }
  }
  for (const s of surfaces.filter(s => visualSurface(s.kind))) {
    const d = designs.find(d => d.surfaceId === s.id);
    requireDesign(d, `surface ${s.id} needs source-bound design criteria before planning (migrate visual v1 runs explicitly)`);
    if (s.kind === 'web') {
      const widths = d.contexts.map(c => Number(c.viewport.split('x')[0]));
      requireDesign(widths.some(w => w <= 480) && widths.some(w => w >= 1024), `web surface ${s.id} needs phone and desktop capture contexts`);
    }
  }
}

export function parseDesignComparison(raw: Buffer): DesignComparison {
  const report: unknown = JSON.parse(raw.toString('utf8'));
  requireDesign(object(report) && report.schemaVersion === 2, 'comparison schemaVersion 2 required; explicitly migrate legacy comparisons with applicability and an independently reviewed experience verdict');
  requireDesign(keys(report, 'schemaVersion comparisons experience') && Array.isArray(report.comparisons) && report.comparisons.length > 0 && report.comparisons.length <= 96, 'invalid comparison report');
  for (const c of report.comparisons) {
    requireDesign(object(c) && keys(c, 'criterionId contextId imageEvidenceId observation result') && text(c.criterionId, 100) && text(c.contextId, 100) && (c.imageEvidenceId === undefined || text(c.imageEvidenceId)) && text(c.observation, 800) && ['pass','fail','not-applicable','unverified'].includes(String(c.result)), 'comparison requires criterion, context, observed design and an honest result');
    requireDesign(!['pass','fail'].includes(String(c.result)) || text(c.imageEvidenceId), 'observed pass/fail comparison requires an image; uncaptured states are unverified');
  }
  requireDesign(Array.isArray(report.experience) && report.experience.length > 0 && report.experience.length <= 8, 'a separate composed experience verdict is required for every context');
  for (const e of report.experience) {
    requireDesign(object(e) && keys(e, 'contextId imageEvidenceId result observedStrengths contraryEvidence rationale blockingFindings') && text(e.contextId, 100) && (e.imageEvidenceId === undefined || text(e.imageEvidenceId)) && ['pass','fail','unverified'].includes(String(e.result)) && strings(e.observedStrengths) && strings(e.contraryEvidence) && text(e.rationale, 800) && strings(e.blockingFindings), 'experience verdict needs observed strengths, contrary evidence, rationale, blocking findings and an honest result');
    requireDesign(e.result !== 'pass' || (text(e.imageEvidenceId) && e.observedStrengths.length > 0), 'passing experience needs an actual image and observed strengths; uncaptured states are unverified');
  }
  return report as unknown as DesignComparison;
}

/** Referenced captures have already passed source/target/artifact validation.
 * A trusted reviewer must judge actual experience; this validator cannot judge beauty. */
export function validateDesignComparison(report: DesignComparison, contract: DesignContract, outcome: DeliveryOutcome, currentImages: DeliveryEvidence[]): void {
  requireDesign(report.comparisons.length === contract.criteria.length * contract.contexts.length, 'comparison must cover every criterion/context exactly once');
  const imageForContext = (imageId: string | undefined, context: DesignContract['contexts'][number]) => {
    const image = currentImages.find(e => e.id === imageId && e.kind === 'image' && e.outcomeId === outcome.id);
    requireDesign(image && image.capture?.composed && image.capture.surfaceId === outcome.surfaceId && image.capture.state === 'entry' && image.capture.route === outcome.entryPoint && image.capture.viewport === context.viewport && image.capture.theme === context.theme, `context ${context.id} needs current composed entry capture at the exact route/viewport/theme`);
  };
  const pairs = new Set<string>();
  for (const c of report.comparisons) {
    const context = contract.contexts.find(x => x.id === c.contextId);
    const criterion = contract.criteria.find(x => x.id === c.criterionId);
    requireDesign(context && criterion, 'unknown criterion/context');
    const pair = JSON.stringify([c.criterionId, c.contextId]);
    requireDesign(!pairs.has(pair), 'duplicate criterion/context comparison'); pairs.add(pair);
    const applicable = criterion.applicability.outcomeIds.includes(outcome.id);
    if (!applicable) {
      requireDesign(criterion.applicability.exclusions.some(e => e.outcomeId === outcome.id) && c.result === 'not-applicable', `criterion ${c.criterionId} needs authorized not-applicable result for outcome ${outcome.id}`);
      if (c.imageEvidenceId !== undefined) imageForContext(c.imageEvidenceId, context);
      continue;
    }
    requireDesign(c.result === 'pass', `rejected or unverified design criterion ${c.criterionId}/${c.contextId}; applicable criteria cannot be marked not-applicable`);
    imageForContext(c.imageEvidenceId, context);
  }
  requireDesign(report.experience.length === contract.contexts.length, 'experience verdict must cover every context exactly once');
  const contexts = new Set<string>();
  for (const e of report.experience) {
    const context = contract.contexts.find(c => c.id === e.contextId);
    requireDesign(context && !contexts.has(e.contextId), 'unknown/duplicate experience context'); contexts.add(e.contextId);
    requireDesign(e.result === 'pass' && e.blockingFindings.length === 0, `rejected or unverified composed experience ${e.contextId}; blocking findings cannot be overridden by criterion/token passes`);
    imageForContext(e.imageEvidenceId, context);
  }
}
