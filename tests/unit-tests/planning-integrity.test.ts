import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { spawnSync } from 'node:child_process';
import { planningFixture } from './planning-integrity-fixture.js';
import { validatePlanningIntegrity, matchesPlanningGlob } from '../../src/delivery/planning-integrity.js';
import { undeclaredTestTargets } from '../../src/task-contract/artifact-declarations.js';
import { parsePlanTaskFile } from '../../src/task-contract/task-parser.js';
const roots: string[] = [];
const fixture = () => { const f = planningFixture(); roots.push(f.root); expect(f.validate().issues).toEqual([]); return f; };
afterEach(() => { for (const p of roots.splice(0)) fs.rmSync(p, { recursive: true, force: true }); });
const codes = (f: ReturnType<typeof fixture>) => f.validate().issues.map(i => i.code);

describe('planning integrity: passing controls precede each single-defect mutation', () => {
  it('preserves valid plan, scoped review blockers, and unresolved owner inputs truthfully', () => {
    const f = fixture();
    f.register.findings.push({ id: 'F1', source: f.review, severity: 'P1', status: 'open', targets: ['queue'], blocks: ['execute','release'] });
    f.register.ownerDecisions.push({ id: 'D11', source: f.decision, status: 'open', targets: ['queue'], blocks: ['execute'] });
    expect(f.validate().valid).toBe(true);
    expect(f.validate().blockers.map(i => i.code)).toEqual(['REVIEW_FINDING_OPEN','OWNER_DECISION_OPEN']);
    expect(f.validate({ stage: 'execute', targetIds: ['health'] }).valid).toBe(true);
    expect(f.validate({ stage: 'execute', targetIds: ['queue'] }).issues.map(i => i.code)).toEqual(['REVIEW_FINDING_OPEN','OWNER_DECISION_OPEN']);
    expect(f.validate({ stage: 'execute' }).valid).toBe(false);
  });
  it('retains open legacy owner decisions in project readiness', () => { const f = fixture(); f.write('plan/owner-decisions.md', '## D-011 · Mailing address\n- **Status:** open\n- **Class:** needs-owner\n- **Unblocks:** tasks-queue.md\n'); expect(f.validate({ stage: 'execute' }).issues.map(i => i.code)).toContain('OWNER_DECISION_OPEN'); expect(f.validate({ stage: 'execute', targetIds: ['health'] }).valid).toBe(true); });
  it('requires real closure evidence and checks freshness', () => {
    const f = fixture(); f.register.findings.push({ id: 'F1', source: f.review, severity: 'P1', status: 'resolved', targets: ['*'], blocks: ['execute'] });
    expect(codes(f)).toContain('REVIEW_REGISTER_INVALID');
    f.register.findings[0].closure = f.write('closure.md', 'Repaired and verified against current source.'); expect(f.validate().valid).toBe(true);
    f.write('brief.md', 'Changed source'); expect(codes(f)).toContain('REVIEW_REGISTER_INVALID');
  });
  it('fails missing and malformed registers without mutating their inputs', () => {
    const f = fixture(); fs.unlinkSync(path.join(f.run, 'review-findings.json')); expect(validatePlanningIntegrity(f.context).issues.map(i => i.code)).toContain('REVIEW_REGISTER_MISSING');
    f.write('plan/review-findings.json', '{'); const before = fs.readFileSync(path.join(f.run, 'review-findings.json')); expect(validatePlanningIntegrity(f.context).issues.map(i => i.code)).toContain('REVIEW_REGISTER_INVALID'); expect(fs.readFileSync(path.join(f.run, 'review-findings.json'))).toEqual(before);
  });
  it('does not silently ignore a Markdown findings register', () => { const f = fixture(); f.write('plan/review-findings.md', '# Open P1 findings'); expect(codes(f)).toContain('REVIEW_REGISTER_MIGRATION_REQUIRED'); });
  it('requires original-source inventory and complete extraction', () => { const f = fixture(); f.contract.sources[0].status = 'partial'; expect(codes(f)).toContain('SOURCE_COVERAGE_UNKNOWN'); f.contract.sources = []; expect(codes(f)).toContain('SOURCE_INVENTORY_MISSING'); });
  it('requires dispositions, catches dangling successors and cycles', () => {
    const f = fixture(); f.contract.clauses[0].disposition = 'unresolved'; expect(codes(f)).toContain('SOURCE_DISPOSITION_MISSING');
    f.contract.clauses[0].disposition = 'superseded'; f.contract.clauses[0].successor = 'C2'; expect(codes(f)).toContain('SOURCE_DISPOSITION_INVALID');
    f.contract.clauses.push({ ...f.contract.clauses[0], id: 'C2', successor: 'C1' }); expect(codes(f)).toContain('SOURCE_DISPOSITION_INVALID');
    f.contract.clauses[1].disposition = 'required'; delete f.contract.clauses[1].successor; expect(f.validate().valid).toBe(true);
  });
  it('compares included/excluded editions but distinguishes response target from defect deadline', () => {
    const f = fixture(); f.contract.facts = [{ id: 'long-form', clauseId: 'C1', key: 'scope.AI', value: 'included' }, { id: 'short-form', clauseId: 'C1', key: 'scope.AI', value: 'excluded' }, { id: 'feedback', clauseId: 'C1', key: 'feedback.target', value: 'about 2 business days' }, { id: 'defects', clauseId: 'C1', key: 'acceptance.defect-window', value: '5 business days' }];
    expect(f.validate().issues.map(i => i.target)).toEqual(['scope.AI','scope.AI']);
    f.contract.conflicts = [{ id: 'scope-conflict', factIds: ['long-form','short-form'], status: 'open', targets: ['queue'] }];
    expect(f.validate().valid).toBe(true); expect(f.validate({ stage: 'execute', targetIds: ['queue'] }).issues.map(i => i.code)).toContain('SOURCE_CONFLICT_OPEN');
    f.contract.conflicts[0].status = 'resolved'; f.contract.conflicts[0].resolution = f.decision; expect(f.validate().valid).toBe(true);
  });
  it.each(['health','environment','acceptance'])('rejects late %s producer before a paid milestone', id => { const f = fixture(); f.contract.nodes.find((n: any) => n.id === id).stage = 2; const found = codes(f); expect(found).toContain('PREREQUISITE_LATE'); expect(found).toContain('MILESTONE_NOT_CLOSED'); if (id === 'acceptance') expect(found).toContain('ACCEPTANCE_DEFINED_LATE'); });
  it('rejects the queue itself scheduled after the manual milestone', () => { const f = fixture(); f.contract.nodes[3].stage = 2; expect(codes(f)).toContain('MILESTONE_NOT_CLOSED'); expect(codes(f)).toContain('MILESTONE_EVIDENCE_LATE'); });
  it('requires explicitly connected provisioning and app-entry prerequisites', () => { const f = fixture(); f.contract.nodes[3].dependsOn = ['health','acceptance']; expect(codes(f)).toContain('PREREQUISITE_MISSING'); });
  it('enforces visual approval only for dependent screens', () => {
    const f = fixture(); f.contract.nodes.push(f.node('screen', { stage: 1, visual: true, dependsOn: ['visual-review'] }), f.node('visual-review', { kind: 'review', visual: true, reviewFor: ['screen'] })); f.contract.capacity.nodeIds.push('screen');
    expect(f.validate().valid).toBe(true);
    f.contract.nodes[3].dependsOn.push('visual-review'); expect(codes(f)).toContain('REVIEW_DEPENDENCY_OVERBROAD'); f.contract.nodes[3].dependsOn.pop();
    f.contract.nodes.find((n: any) => n.id === 'screen').dependsOn = []; expect(codes(f)).toContain('REVIEW_DEPENDENCY_MISSING');
  });
  it.each(['src/queue.test.ts', 'e2e/support/data.test.ts'])('rejects excluded integration target %s', target => { const f = fixture(); f.contract.checks[0].targets = [target]; f.context.units![0].filePaths.push(target); expect(codes(f)).toContain('EVIDENCE_TARGET_EXCLUDED'); });
  it('rejects empty-suite allowances and empty substantive results', () => { const f = fixture(); f.contract.checks[0].command += ' --passWithNoTests'; expect(codes(f)).toContain('EVIDENCE_EMPTY_ALLOWED'); f.contract.checks[0].command = 'vitest run src/queue.integration.test.ts'; f.receipt(0); expect(codes(f)).toContain('EVIDENCE_EMPTY'); f.receipt(2); expect(f.validate().valid).toBe(true); });
  it('rejects a claimed positive count contradicted by retained runner JSON', () => { const f = fixture(); f.receipt(0); f.contract.checks[0].receipt.collected = 1; expect(codes(f)).toContain('EVIDENCE_EMPTY'); expect(codes(f)).toContain('EVIDENCE_RESULT_MISMATCH'); });
  it('allows explicit scaffold checks but never milestone acceptance from them', () => { const f = fixture(); f.contract.checks[0].collection = 'scaffold'; expect(codes(f)).toContain('EVIDENCE_SCAFFOLD_NOT_ACCEPTANCE'); f.contract.milestones[0].evidenceIds = ['build']; expect(f.validate().valid).toBe(true); });
  it('rejects mocks and missing bootstrap offered for real integration', () => { const f = fixture(); f.contract.checks[0].environment = 'mock'; expect(codes(f)).toContain('EVIDENCE_ENVIRONMENT_MISMATCH'); f.contract.checks[0].environment = 'real-local'; f.contract.checks[0].bootstrapPaths = []; expect(codes(f)).toContain('EVIDENCE_BOOTSTRAP_MISSING'); });
  it.each(['src/queue.integration.test.ts','package-lock.json','tests/setup.ts'])('requires declared artifact %s', file => { const f = fixture(); f.context.units![0].filePaths = f.context.units![0].filePaths.filter(p => p !== file); expect(codes(f)).toContain('ARTIFACT_UNDECLARED'); });
  it('invalidates receipt inputs but not unrelated receipt-only metadata', () => { const f = fixture(); f.receipt(); expect(f.validate().valid).toBe(true); f.write('receipt-note.md','unrelated'); expect(f.validate().valid).toBe(true); f.write('src/queue.ts','changed'); expect(codes(f)).toContain('EVIDENCE_STALE'); });
  it('requires inputs actually under test in a receipt', () => { const f = fixture(); f.receipt(); f.contract.checks[0].receipt.inputs = [f.brief]; expect(codes(f)).toContain('EVIDENCE_INPUT_UNBOUND'); });
  it('does not accept typecheck as milestone build or planned commands as runtime results', () => { const f = fixture(); f.contract.checks[1].command = 'npm run typecheck'; expect(codes(f)).toContain('BUILD_BOUNDARY_MISSING'); f.contract.checks[1].command = 'npm run build'; expect(f.validate({ stage: 'release' }).issues.map(i => i.code)).toContain('EVIDENCE_NOT_RUN'); });
  it('checks alternate scope even before activation and preserves deletion obligation', () => { const f = fixture(); f.contract.variants[0].selected = false; f.contract.variants[0].obligations[0].evidenceIds = ['nonexistent-self-service-test']; expect(codes(f)).toContain('VARIANT_OBLIGATION_UNSATISFIED'); f.contract.variants[0].obligations[0].evidenceIds = ['queue-test']; expect(f.validate().valid).toBe(true); });
  it('rejects missing risk, budgets and double-counted work; allows honest provisional scope', () => {
    const f = fixture(); delete f.contract.nodes[0].risk; expect(codes(f)).toContain('PLANNING_CONTRACT_INVALID'); f.contract.nodes[0].risk = 'medium';
    delete f.contract.nodes[1].effortHours; expect(codes(f)).toContain('CAPACITY_UNKNOWN'); f.contract.nodes[1].effortHours = [30,40]; expect(codes(f)).toContain('CAPACITY_EXCEEDED');
    f.contract.capacity.disposition = 'provisional'; expect(f.validate().valid).toBe(true); expect(f.validate().warnings).toHaveLength(1);
    f.contract.capacity.nodeIds.push('health'); expect(codes(f)).toContain('PLANNING_CONTRACT_INVALID');
  });
  it('rejects invented origins and implausibly low risk on declared consequential capabilities', () => { const f = fixture(); f.contract.nodes[3].originRef = 'unrecorded-addition'; expect(codes(f)).toContain('WORK_ORIGIN_UNKNOWN'); f.contract.nodes[3].originRef = 'C1'; f.contract.nodes[3].provides.push('account-deletion'); f.contract.nodes[3].risk = 'low'; expect(codes(f)).toContain('RISK_UNDERCLASSIFIED'); });
  it('requires nonempty retained obligations in every scope alternative', () => { const f = fixture(); f.contract.variants[0].obligations = []; expect(codes(f)).toContain('PLANNING_CONTRACT_INVALID'); });
  it('keeps future requirements even when implementation detail is deferred', () => { const f = fixture(); f.context.requirementIds!.push('R2'); expect(codes(f)).toContain('SOURCE_REQUIREMENT_UNMAPPED'); });
  it('permits harmless ordering changes without changing verdict', () => { const f = fixture(); f.contract.nodes.reverse(); f.contract.checks.reverse(); f.contract.capacity.nodeIds.reverse(); expect(f.validate().valid).toBe(true); });
  it('limits runner glob syntax and matches root/nested tests', () => { expect(matchesPlanningGlob('src/a.integration.test.ts', 'src/**/*.integration.test.ts')).toBe(true); expect(() => matchesPlanningGlob('x.ts','**/*.{ts,js}')).toThrow(/expand/); });
  it('finds bounded test references without treating command prose as staging authority', () => { expect(undeclaredTestTargets('pnpm --filter web test -- src/foo.test.ts', ['apps/web/src/foo.test.ts'])).toEqual([]); expect(undeclaredTestTargets('vitest run src/foo.test.ts', ['src/foo.ts'])).toEqual(['src/foo.test.ts']); expect(undeclaredTestTargets('npm test -- queue', [])).toEqual([]); expect(undeclaredTestTargets('vitest src/foo.test.ts', ['a/src/foo.test.ts','b/src/foo.test.ts'])).toEqual(['src/foo.test.ts']); });
  it('ignores field-looking text inside fenced examples', () => { const parsed = parsePlanTaskFile('tasks-proof.md', '## T1\n- **File:** `src/a.ts`\n```md\n- **File:** `secrets.txt`\n- **Risk:** low\n```\n- **Risk:** high\n'); expect(parsed.units[0].filePaths).toEqual(['src/a.ts']); expect(parsed.units[0].risk).toBe('high'); });
  it('real runner zero-test success is rejected by the evidence checker', () => {
    const f = fixture(); const runner = path.resolve('node_modules/vitest/vitest.mjs');
    f.write('vitest.config.mjs', "export default { test: { include: ['src/**/*.integration.test.js'] } };"); f.write('src/queue.test.js', "import { test, expect } from 'vitest'; test('queue', () => expect(true).toBe(true));");
    const output = path.join(f.root, 'actual-results.json');
    const result = spawnSync(process.execPath, [runner, 'run', '--root', f.root, '--config', path.join(f.root,'vitest.config.mjs'), '--passWithNoTests', '--reporter=json', '--outputFile', output], { encoding: 'utf8' });
    expect(result.status, result.stderr).toBe(0); expect(result.stdout + result.stderr).toMatch(/No test files found/); const collected = 0;
    f.receipt(collected); expect(codes(f)).toContain('EVIDENCE_EMPTY');
  });
});

describe('planning integrity: release trains keep base payments off unpriced change orders', () => {
  // Base week-2 payment plus change-order parity work that the milestone also requires.
  const coupled = () => {
    const f = fixture();
    f.contract.nodes.push(f.node('change-order', { kind: 'decision', origin: 'added', provides: ['delta-approved'] }), f.node('parity', { stage: 1, origin: 'added', dependsOn: ['change-order'], provides: ['accepted-parity'], consumes: ['delta-approved'] }));
    f.contract.checks.push({ id: 'parity-build', nodeId: 'parity', kind: 'build', command: 'npm run build', targets: [], requiredFiles: [], collection: 'substantive', environment: 'real-local', bootstrapPaths: [] });
    f.contract.capacity.nodeIds.push('parity');
    return f;
  };
  const scopes = (f: ReturnType<typeof fixture>, changeOrder: object) => {
    f.contract.releaseScopes = [{ id: 'R1', kind: 'base-contract', sourceRef: 'C1' }, { id: 'R2', kind: 'change-order', sourceRef: 'C1', ...changeOrder }];
    for (const n of f.contract.nodes) if (n.origin === 'added') n.releaseScope = 'R2';
  };
  const issuesFor = (f: ReturnType<typeof fixture>, code: string) => f.validate().issues.filter(i => i.code === code);

  it('passes added change-order work that no base payment requires', () => {
    const f = coupled(); expect(f.validate().issues).toEqual([]);
    scopes(f, { status: 'proposed' }); expect(f.validate().issues).toEqual([]);
  });
  it('fails an undeclared base payment that requires added work', () => {
    const f = coupled(); f.contract.milestones[0].requires.push('accepted-parity');
    expect(issuesFor(f, 'RELEASE_TRAIN_COUPLED')).toEqual([expect.objectContaining({ target: 'week-2', message: expect.stringMatching(/accepted-parity.*added work with no declared release scope: parity, change-order/) })]);
  });
  it('fails a base payment that requires a proposed, unpriced change order and passes once parity moves to R2', () => {
    const f = coupled(); scopes(f, { status: 'proposed' }); f.contract.milestones[0].requires.push('accepted-parity');
    expect(issuesFor(f, 'RELEASE_TRAIN_COUPLED')).toEqual([expect.objectContaining({ target: 'week-2', message: expect.stringContaining('unapproved or unpriced change-order work: parity, change-order') })]);
    f.contract.milestones[0].requires.pop();
    f.contract.milestones.push({ id: 'parity-release', stage: 1, releaseScope: 'R2', requires: ['accepted-parity'], acceptanceNodeId: 'acceptance', evidenceIds: ['parity-build'] });
    expect(f.validate().issues).toEqual([]);
  });
  it('fails base payment evidence produced by change-order work', () => {
    const f = coupled(); scopes(f, { status: 'proposed' }); f.contract.milestones[0].evidenceIds.push('parity-build');
    expect(issuesFor(f, 'RELEASE_TRAIN_COUPLED').map(i => i.message)).toEqual([expect.stringContaining('evidence parity-build depends on unapproved or unpriced change-order work: parity, change-order')]);
  });
  it('accepts the coupling only after the change order is approved, priced and decision-bound', () => {
    const f = coupled(); f.contract.milestones[0].requires.push('accepted-parity');
    scopes(f, { status: 'approved', decision: f.decision });
    expect(f.validate().issues.map(i => [i.code, i.target])).toEqual([['RELEASE_SCOPE_UNPRICED', 'R2'], ['RELEASE_TRAIN_COUPLED', 'week-2']]);
    scopes(f, { status: 'approved', decision: f.decision, price: { amount: 2400, currency: 'CAD', sourceRef: 'C1' } }); expect(f.validate().issues).toEqual([]);
    scopes(f, { status: 'approved', price: { amount: 2400, currency: 'CAD', sourceRef: 'C1' } }); expect(codes(f)).toEqual(['PLANNING_CONTRACT_INVALID']);
    scopes(f, { status: 'rejected', decision: f.decision, price: { amount: 2400, currency: 'CAD', sourceRef: 'C1' } }); expect(codes(f)).toEqual(['RELEASE_TRAIN_COUPLED']);
  });
  it('fails a change-order payment milestone before the change order is approved and priced', () => {
    const f = coupled(); scopes(f, { status: 'proposed' });
    f.contract.milestones.push({ id: 'parity-release', stage: 1, releaseScope: 'R2', requires: ['accepted-parity'], acceptanceNodeId: 'acceptance', evidenceIds: ['parity-build'], payment: { amount: 2400, currency: 'CAD', sourceRef: 'C1' } });
    expect(f.validate().issues.map(i => [i.code, i.target])).toEqual([['RELEASE_SCOPE_UNPRICED', 'parity-release']]);
  });
  it('requires declared scopes to be complete and known', () => {
    const f = coupled(); scopes(f, { status: 'proposed' }); delete f.contract.nodes.find((n: any) => n.id === 'parity').releaseScope;
    expect(issuesFor(f, 'RELEASE_SCOPE_UNASSIGNED').map(i => i.target)).toEqual(['parity']);
    f.contract.nodes.find((n: any) => n.id === 'parity').releaseScope = 'R3'; expect(issuesFor(f, 'RELEASE_SCOPE_UNKNOWN').map(i => i.target)).toEqual(['parity']);
    f.contract.nodes.find((n: any) => n.id === 'parity').releaseScope = 'R2'; f.contract.releaseScopes[1].sourceRef = 'C9'; expect(codes(f)).toEqual(['RELEASE_SCOPE_ORIGIN_UNKNOWN']);
    f.contract.releaseScopes[1] = { id: 'R2', kind: 'base-contract', sourceRef: 'C1' }; expect(codes(f)).toEqual(['PLANNING_CONTRACT_INVALID']);
  });
});
