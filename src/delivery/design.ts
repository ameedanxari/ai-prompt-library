import type { DesignComparison, DesignContract, DeliveryEvidence, DeliveryOutcome, DeliverySurface, FileBinding } from './types.js';

const object = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
const text = (v: unknown, max = 1000): v is string => typeof v === 'string' && !!v.trim() && v.length <= max;
const keys = (v: object, allowed: string) => Object.keys(v).every(k => allowed.split(' ').includes(k));
const unique = (values: string[]) => new Set(values).size === values.length;
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
      requireDesign(object(c) && keys(c, 'id dimension sourceRef sourceLocation expectation') && text(c.id, 100) && ['intent','composition','hierarchy','responsive','typography','imagery','interaction'].includes(String(c.dimension)) && d.sourceRefs.includes(c.sourceRef) && text(c.sourceLocation, 300) && text(c.expectation, 800), 'criterion needs a source/location and observable expectation');
    }
    requireDesign(unique(d.criteria.map(c => c.id)), 'duplicate criterion IDs');
    const criteria = d.criteria;
    requireDesign(d.sourceRefs.every(ref => criteria.some(c => c.sourceRef === ref)), 'every declared design source needs a comparison criterion');
    for (const dimension of ['intent','composition','hierarchy','responsive']) requireDesign(d.criteria.some(c => c.dimension === dimension), `missing ${dimension} criterion; token compliance alone is insufficient`);
    requireDesign(Array.isArray(d.contexts) && d.contexts.length && d.contexts.length <= 8, 'use 1–8 required capture contexts');
    for (const c of d.contexts) requireDesign(object(c) && keys(c, 'id viewport theme') && text(c.id, 100) && typeof c.viewport === 'string' && /^[1-9]\d{1,3}x[1-9]\d{1,3}$/.test(c.viewport) && text(c.theme, 100), 'context needs explicit viewport and theme');
    requireDesign(unique(d.contexts.map(c => c.id)) && unique(d.contexts.map(c => `${c.viewport}/${c.theme}`)), 'duplicate design contexts');
  }
  return value as DesignContract[];
}

export function validateDesignCoverage(designs: DesignContract[], surfaces: DeliverySurface[]): void {
  requireDesign(unique(designs.map(d => d.surfaceId)), 'duplicate surface contracts');
  for (const d of designs) requireDesign(surfaces.some(s => s.id === d.surfaceId && visualSurface(s.kind)), `unknown/nonvisual design surface ${d.surfaceId}`);
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
  requireDesign(object(report) && keys(report, 'schemaVersion comparisons') && report.schemaVersion === 1 && Array.isArray(report.comparisons) && report.comparisons.length > 0 && report.comparisons.length <= 96, 'invalid comparison report');
  for (const c of report.comparisons) requireDesign(object(c) && keys(c, 'criterionId contextId imageEvidenceId observation result') && text(c.criterionId, 100) && text(c.contextId, 100) && text(c.imageEvidenceId) && text(c.observation, 800) && ['pass','fail'].includes(String(c.result)), 'comparison requires criterion, context, image, observed design and pass/fail');
  return report as unknown as DesignComparison;
}

/** Referenced captures have already passed source/target/artifact validation. */
export function validateDesignComparison(report: DesignComparison, contract: DesignContract, outcome: DeliveryOutcome, currentImages: DeliveryEvidence[]): void {
  requireDesign(report.comparisons.length === contract.criteria.length * contract.contexts.length, 'comparison must cover every criterion/context exactly once');
  const pairs = new Set<string>();
  for (const c of report.comparisons) {
    const context = contract.contexts.find(x => x.id === c.contextId);
    requireDesign(context && contract.criteria.some(x => x.id === c.criterionId), 'unknown criterion/context');
    const pair = JSON.stringify([c.criterionId, c.contextId]);
    requireDesign(!pairs.has(pair), 'duplicate criterion/context comparison'); pairs.add(pair);
    requireDesign(c.result === 'pass', `rejected design criterion ${c.criterionId}/${c.contextId}`);
    const image = currentImages.find(e => e.id === c.imageEvidenceId && e.kind === 'image' && e.outcomeId === outcome.id);
    requireDesign(image && image.capture?.composed && image.capture.surfaceId === outcome.surfaceId && image.capture.state === 'entry' && image.capture.route === outcome.entryPoint && image.capture.viewport === context.viewport && image.capture.theme === context.theme, `comparison ${pair} needs current composed entry capture at the exact route/viewport/theme`);
  }
}
