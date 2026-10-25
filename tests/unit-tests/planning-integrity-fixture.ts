import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { sha256 } from '../../src/delivery/manifest.js';
import { validatePlanningIntegrity, type PlanningContext } from '../../src/delivery/planning-integrity.js';
export function planningFixture() {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'planning-integrity-')));
  const run = path.join(root, 'plan'); fs.mkdirSync(run);
  const write = (name: string, content: string) => { fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true }); fs.writeFileSync(path.join(root, name), content); return { path: name, sha256: sha256(content) }; };
  const brief = write('brief.md', 'Deliver a manual request queue by week two; retain deletion and operational recovery.');
  const config = write('vitest.config.ts', "export default { test: { include: ['src/**/*.integration.test.ts'] } };");
  const review = write('audit.md', 'Independent audit of requirements and executable scope.');
  const decision = write('owner.md', 'Owner explicitly selects manual deletion with verified operator fulfillment.');
  const node = (id: string, extra: object = {}) => ({ id, stage: 0, kind: 'work', dependsOn: [], provides: [], consumes: [], visual: false, reviewFor: [], origin: 'required', originRef: 'C1', risk: 'medium', riskReason: 'Persistence and operator permissions need recovery verification', acceptance: 'Consumer completes the useful request and reaches recovery', effortHours: [2, 4], ...extra });
  const contract: any = {
    schemaVersion: 1, sources: [{ id: 'S1', binding: brief, status: 'inspected', authority: 'owner brief' }],
    clauses: [{ id: 'C1', sourceId: 'S1', locator: 'line 1', requirementIds: ['R1'], disposition: 'required' }], facts: [], conflicts: [],
    nodes: [node('acceptance', { kind: 'acceptance', provides: ['acceptance-defined'] }), node('health', { provides: ['health', 'app-entry'] }), node('environment', { kind: 'resource', provides: ['db-ready', 'mail-address'] }), node('queue', { stage: 1, dependsOn: ['health','environment','acceptance'], provides: ['manual-queue','delete'], consumes: ['health','db-ready','mail-address','acceptance-defined'] })],
    milestones: [{ id: 'week-2', stage: 1, requires: ['manual-queue'], acceptanceNodeId: 'acceptance', evidenceIds: ['build','queue-test'], payment: { amount: 1750, currency: 'CAD', sourceRef: 'C1' } }],
    runners: [{ id: 'integration', root: '.', include: ['src/**/*.integration.test.ts'], exclude: ['e2e/**'], configBindings: [config], environment: 'real-local', bootstrapPaths: ['tests/setup.ts'] }],
    checks: [{ id: 'queue-test', nodeId: 'queue', unitId: 'tasks-queue.md#T1', kind: 'integration', command: 'vitest run src/queue.integration.test.ts', runnerId: 'integration', targets: ['src/queue.integration.test.ts'], requiredFiles: ['src/queue.ts','package-lock.json'], collection: 'substantive', environment: 'real-local', bootstrapPaths: ['tests/setup.ts'] }, { id: 'build', nodeId: 'queue', kind: 'build', command: 'npm run build', targets: [], requiredFiles: [], collection: 'substantive', environment: 'real-local', bootstrapPaths: [] }],
    variants: [{ id: 'manual-delete', selected: true, decision, obligations: [{ requirementId: 'R1', nodeIds: ['queue'], evidenceIds: ['queue-test'] }] }],
    capacity: { hours: 20, reserveHours: 4, nodeIds: ['health','queue'], disposition: 'committed' },
  };
  const register: any = { schemaVersion: 1, reviewedInputs: [brief], findings: [], ownerDecisions: [] };
  const context: PlanningContext = { projectRoot: root, runDirectory: run, stage: 'plan', required: true, originalSources: [brief], requirementIds: ['R1'], units: [{ id: 'tasks-queue.md#T1', filePaths: ['src/queue.ts','src/queue.integration.test.ts','tests/setup.ts','package-lock.json'] }] };
  const save = () => { write('plan/planning-integrity.json', JSON.stringify(contract)); write('plan/review-findings.json', JSON.stringify(register)); };
  const validate = (overrides: Partial<PlanningContext> = {}) => { save(); return validatePlanningIntegrity({ ...context, ...overrides }); };
  const receipt = (collected = 1) => {
    const inputs = context.units![0].filePaths.map(p => write(p, p.endsWith('.json') ? '{}' : 'export {};'));
    const artifact = write('test-results.json', JSON.stringify({ numTotalTests: collected, success: true }));
    contract.checks[0].receipt = { artifact, inputs, collected, exitCode: 0, environment: 'real-local' };
  };
  save(); return { root, run, write, node, brief, config, review, decision, contract, register, context, save, validate, receipt };
}
