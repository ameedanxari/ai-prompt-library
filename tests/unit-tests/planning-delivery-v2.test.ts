import { afterEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { spawnSync } from 'node:child_process';
import { architectureRequiredReasons, canonical, deliveryScopeDigest, planDeliveryReview, validateDelivery, dispatchDeliveryReview } from '../../src/delivery/index.js';
import { validatePlanningIntegrity } from '../../src/delivery/planning-integrity.js';
import { validateDeliveryRun } from '../../src/execution/delivery-gate.js';
import { createDeliveryFixture, deliveryFixtureRoots } from './delivery-fixture.js';
import { planningFixture } from './planning-integrity-fixture.js';
import { architectureContract } from './architecture-fixture.js';

const packageRoot = path.resolve(__dirname, '../..');
const otherRoots: string[] = [];
afterEach(() => [...deliveryFixtureRoots.splice(0), ...otherRoots.splice(0)].forEach(root => fs.rmSync(root, { recursive: true, force: true })));

function fixture() {
  const f = createDeliveryFixture(); const p = planningFixture(); otherRoots.push(p.root);
  const contract = structuredClone(p.contract); const register = structuredClone(p.register); const architecture = architectureContract(f.manifest);
  contract.sources[0].binding = f.requirements.originalSources[0]; register.reviewedInputs = [f.requirements.originalSources[0]];
  for (const binding of [p.config, p.decision, p.review]) f.write(binding.path, fs.readFileSync(path.join(p.root, binding.path)));
  contract.checks[0].unitId = 'tasks-proof.md#T1'; contract.checks[0].requiredFiles = ['app.ts','package-lock.json'];
  const files = ['app.ts','src/queue.integration.test.ts','tests/setup.ts','package-lock.json'];
  f.manifest.schemaVersion = 2;
  const unit = f.manifest.slices[0].units[0]; unit.affectedPaths = files;
  (unit as any).planningNodeIds = ['queue'];
  f.write('runs/current/tasks-proof.md', [
    '## T1 - Queue journey', '- **Closes user story:** As a user, I want a manual queue, so that requests persist and recover.',
    '- **Change type:** modify-existing', '- **File:** ' + files.map(file => '`' + file + '`').join(' | '),
    '- **Precise change:** implement persistent request and reachable recovery.', '- **Acceptance:**',
    '  - Valid consumer requests produce a persisted result.', '  - Invalid requests preserve existing state.', '  - Failed requests reach a useful recovery action.',
    '- **Depends on:** none', '- **Test:** `vitest run src/queue.integration.test.ts`', '- **Estimated LOC:** ~20', '- **Phase:** mvp',
    '- **Task schema:** v2', '- **Artifact kind:** runtime-source', '- **Requirement IDs:** R1', '- **Evidence level:** integration',
    '- **Runtime reachability:** production queue endpoint', '- **Production owner:** app.ts', '- **Composition map:** production',
    '- **Risk:** medium', '- **Model tier:** standard', '- **Turn budget:** 20', '',
  ].join('\n'));
  const savePlanning = () => {
    const planning = f.write('runs/current/planning-integrity.json', JSON.stringify(contract));
    const findings = f.write('runs/current/review-findings.json', JSON.stringify(register));
    const domain = f.write('runs/current/architecture.json', JSON.stringify(architecture));
    f.manifest.planningInputs = [planning, findings, domain]; f.save();
  };
  const approve = () => {
    f.manifest.decisionRefs = f.manifest.decisionRefs.filter(d => d.kind !== 'scope-review');
    const binding = { scopeDigest: deliveryScopeDigest(f.manifest), outcomeIds: ['O1'], artifactDigests: [...new Set([...f.manifest.sourceInputs, ...f.manifest.planningInputs!, ...f.requirements.originalSources].map(b => b.sha256))].sort() };
    const decision: any = { id: 'v2-scope', kind: 'scope-review', ...binding, reviewer: { id: 'reviewer', contextId: 'review-context', role: 'independent' }, provenance: { kind: 'review-session', reference: 'trusted://v2-source-review' }, result: 'approved', reason: 'Reviewed current original sources and both current planning sidecars.' };
    f.trust(decision, binding); return { decision, binding };
  };
  const api = () => { f.save(); return validateDeliveryRun(f.run, { stage: 'execute', trustedReviewProvider: f.provider }); };
  savePlanning(); const approval = approve();
  const adapterRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'planning-host-review-')); otherRoots.push(adapterRoot);
  const adapter = path.join(adapterRoot, 'verifier.mjs');
  const refreshAdapter = (entry = approval) => fs.writeFileSync(adapter, `const d=${JSON.stringify(canonical(entry.decision))};const b=${JSON.stringify(canonical(entry.binding))};\nfunction canonical(v){if(Array.isArray(v))return '['+v.map(canonical).join(',')+']';if(v&&typeof v==='object')return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+canonical(v[k])).join(',')+'}';return JSON.stringify(v);}\nexport const trustedReviewProvider={verify:(decision,binding)=>canonical(decision)===d&&canonical(binding)===b};\n`);
  refreshAdapter();
  const shell = (script = 'validate-ready-to-execute.sh', extraArgs: string[] = []) => {
    f.save(); const result = spawnSync('bash', [path.join(packageRoot, 'scripts', script), f.run, ...extraArgs], { encoding: 'utf8', env: { ...process.env, AI_PROMPT_REVIEW_VERIFIER: adapter } });
    return { code: result.status, out: result.stdout + result.stderr };
  };
  return { ...f, contract, register, architecture, savePlanning, approve, api, shell, refreshAdapter };
}

describe('version 2 planning delivery integration', () => {
  it('reports canonical task and runner coverage defects before scope review and dispatches no reviewer', async () => {
    const f = fixture();
    f.manifest.decisionRefs = [];
    f.contract.runners[0].include = ['**/*.unit.test.ts'];
    const task = path.join(f.run, 'tasks-proof.md');
    fs.writeFileSync(task, fs.readFileSync(task, 'utf8').replace('modify-existing', 'add').replace('- **Risk:** medium\n', ''));
    f.savePlanning();
    const report = f.api();
    expect(report.issues.join(' ')).toContain('original-source coverage review pending');
    expect(report.issues.join(' ')).toContain('invalid-change-type');
    expect(report.issues.join(' ')).toContain('RISK_METADATA_MISSING');
    expect(report.issues.join(' ')).toContain('EVIDENCE_TARGET_EXCLUDED');
    let calls = 0;
    const result = await dispatchDeliveryReview(f.scope(), { kind: 'scope-review', outcomeIds: ['O1'] }, { readReceipt: () => undefined, dispatch: async () => { calls++; throw new Error('must not dispatch'); } });
    expect(calls).toBe(0); expect(result.plan.action).toBe('blocked');
    expect(result.plan.preflightIssues?.join(' ')).toContain('EVIDENCE_TARGET_EXCLUDED');
    expect(f.manifest.decisionRefs).toEqual([]);
  });
  it('accepts a complete bound plan through delivery API, executable gate and actual readiness shell', () => {
    const f = fixture();
    expect(validateDelivery(f.run, { stage: 'execute', trustedReviewProvider: f.provider }).issues).toEqual([]);
    expect(f.api().issues).toEqual([]);
    const result = f.shell(); expect(result.code, result.out).toBe(0);
    expect(JSON.parse(result.out).valid).toBe(true);
    const direct = f.shell('validate-planning-integrity.sh'); expect(direct.code, direct.out).toBe(0);
    expect(JSON.parse(direct.out)).toMatchObject({ valid: true, assessed: true, issues: [] });
  }, 20000);

  it('requires both current-run planning sidecars instead of interpreting absence as clean', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    delete f.manifest.planningInputs; f.save();
    expect(f.api().issues.join('\n')).toContain('version 2 requires both planning input bindings');
    const result = f.shell(); expect(result.code).not.toBe(0); expect(result.out).toContain('version 2 requires both planning input bindings');
  }, 20000);

  it('rejects stale planning bindings before it can reuse source approval', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    f.write('runs/current/review-findings.json', JSON.stringify({ ...f.register, ownerDecisions: [{ id: 'changed' }] }));
    const report = f.api(); expect(report.valid).toBe(false); expect(report.issues.join('\n')).toContain('empty, stale or mismatched artifact runs/current/review-findings.json');
    const result = f.shell(); expect(result.code).not.toBe(0); expect(result.out).toContain('empty, stale or mismatched artifact runs/current/review-findings.json');
  }, 20000);

  it('invalidates prior source approval when sidecar content is rebound, then accepts a fresh approved plan', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    f.contract.capacity.hours = 24; f.savePlanning();
    expect(f.api().issues).toContain('scope: original-source coverage review pending or provenance unverified');
    const approval = f.approve(); f.refreshAdapter(approval);
    expect(f.api().issues).toEqual([]); expect(f.shell().code).toBe(0);
  }, 20000);

  it('blocks open findings mapped to the active unit planning node in API and shell', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    f.register.findings.push({ id: 'F1', source: { ...f.contract.variants[0].decision, path: 'audit.md', sha256: f.write('audit.md', 'P1 queue recovery defect').sha256 }, severity: 'P1', status: 'open', targets: ['queue'], blocks: ['execute'] });
    f.savePlanning(); const approval = f.approve(); f.refreshAdapter(approval);
    const report = f.api(); expect(report.issues.join('\n')).toContain('REVIEW_FINDING_OPEN: F1');
    const result = f.shell(); expect(result.code).toBe(1); expect(result.out).toContain('REVIEW_FINDING_OPEN: F1');
  }, 20000);

  it.each(['review-findings.json', 'planning-integrity.json'])('does not downgrade direct v2 planning shell validation when %s disappears', sidecar => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    fs.unlinkSync(path.join(f.run, sidecar));
    const result = f.shell('validate-planning-integrity.sh');
    expect(result.code).toBe(2); expect(result.out).toContain(`PLANNING_CHECKER_FAILED: Error: delivery: missing file: runs/current/${sidecar}`);
    expect(result.out).not.toContain('Legacy planning contract is unassessed');
  }, 20000);
  it('rejects a valid but stale bound sidecar through the direct planning shell too', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    f.write('runs/current/review-findings.json', JSON.stringify(f.register, null, 2));
    const result = f.shell('validate-planning-integrity.sh');
    expect(result.code).not.toBe(0);
    expect(result.out).toContain('runs/current/review-findings.json');
    expect(result.out).toMatch(/stale|mismatched/);
  }, 20000);

  it('fails a misspelled finding target instead of bypassing active-scope review', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    const source = f.write('audit.md', 'P1 queue recovery defect');
    f.register.findings.push({ id: 'F1', source, severity: 'P1', status: 'open', targets: ['queeue'], blocks: ['execute'] });
    f.savePlanning(); const approval = f.approve(); f.refreshAdapter(approval);
    expect(f.api().issues.join('\n')).toContain('REVIEW_REGISTER_INVALID: *: Error: unknown affected target in F1');
    const result = f.shell(); expect(result.code).toBe(1); expect(result.out).toContain('unknown affected target in F1');
  }, 20000);
  it('fails a misspelled source-conflict target through the API and readiness shell', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    f.contract.facts = [{ id: 'A', clauseId: 'C1', key: 'scope', value: 'included' }, { id: 'B', clauseId: 'C1', key: 'scope', value: 'excluded' }];
    f.contract.conflicts = [{ id: 'scope-conflict', factIds: ['A', 'B'], status: 'open', targets: ['queue'] }];
    f.savePlanning(); f.approve(); expect(f.api().issues.join('\n')).toContain('SOURCE_CONFLICT_OPEN: scope-conflict');
    f.contract.conflicts[0].targets = ['queeu']; f.savePlanning(); const approval = f.approve(); f.refreshAdapter(approval);
    expect(f.api().issues.join('\n')).toContain('SOURCE_CONFLICT_TARGET_UNKNOWN: scope-conflict');
    const result = f.shell(); expect(result.code).toBe(1); expect(result.out).toContain('SOURCE_CONFLICT_TARGET_UNKNOWN: scope-conflict');
  }, 20000);

  it('rejects raw zero-test results even when the receipt falsely claims a collected test', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    const files = f.manifest.slices[0].units[0].affectedPaths;
    const inputs = [...files.map(file => f.write(file, file === 'app.ts' ? fs.readFileSync(path.join(f.root, file)) : file.endsWith('.json') ? '{}' : 'export {};')), ...f.contract.runners[0].configBindings];
    const artifact = f.write('runner-result.json', JSON.stringify({ numTotalTests: 1, success: true }));
    f.contract.checks[0].receipt = { artifact, inputs, collected: 1, exitCode: 0, environment: 'real-local' };
    f.savePlanning(); f.approve(); expect(f.api().issues).toEqual([]);
    f.contract.checks[0].receipt.artifact = f.write('runner-result.json', JSON.stringify({ numTotalTests: 0, success: true }));
    f.savePlanning(); const approval = f.approve(); f.refreshAdapter(approval);
    const report = f.api(); expect(report.issues.join('\n')).toContain('EVIDENCE_EMPTY: queue-test');
    expect(report.issues.join('\n')).toContain('EVIDENCE_RESULT_MISMATCH: queue-test');
    const result = f.shell(); expect(result.code).toBe(1); expect(result.out).toContain('EVIDENCE_EMPTY: queue-test');
  }, 20000);

  it('requires actual receipts for the active node at advance, despite complete consumer proof', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    const files = f.manifest.slices[0].units[0].affectedPaths;
    const inputs = [...files.map(file => f.write(file, file === 'app.ts' ? fs.readFileSync(path.join(f.root, file)) : file.endsWith('.json') ? '{}' : 'export {};')), ...f.contract.runners[0].configBindings];
    const artifact = f.write('runner-result.json', JSON.stringify({ numTotalTests: 1, success: true }));
    f.contract.checks[0].receipt = { artifact, inputs, collected: 1, exitCode: 0, environment: 'real-local' };
    f.contract.checks[1].receipt = { artifact: f.write('production-build.log', 'Production build completed.'), inputs, collected: 0, exitCode: 0, environment: 'real-local' };
    f.savePlanning(); f.approve(); f.evidence(); f.accept();
    expect(validateDeliveryRun(f.run, { stage: 'advance', trustedReviewProvider: f.provider }).issues).toEqual([]);
    delete f.contract.checks[0].receipt; f.savePlanning(); f.approve();
    const report = validateDeliveryRun(f.run, { stage: 'advance', trustedReviewProvider: f.provider });
    expect(report.issues.join('\n')).toContain('EVIDENCE_NOT_RUN: queue-test');
  }, 20000);

  it('rejects an unknown caller scope instead of passing a vacuous review selection', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    const source = f.write('audit.md', 'P1 queue recovery defect');
    f.register.findings.push({ id: 'F1', source, severity: 'P1', status: 'open', targets: ['queue'], blocks: ['execute'] });
    f.savePlanning(); f.approve();
    const base = { projectRoot: f.root, runDirectory: f.run, stage: 'execute' as const,
      knownTargets: ['proof','O1','tasks-proof.md#T1'], units: [{ id: 'tasks-proof.md#T1', nodeIds: ['queue'], filePaths: f.manifest.slices[0].units[0].affectedPaths }] };
    expect(validatePlanningIntegrity({ ...base, targetIds: ['queue'] }).issues.map(i => i.code)).toContain('REVIEW_FINDING_OPEN');
    const invalid = validatePlanningIntegrity({ ...base, targetIds: ['typo-queue'] });
    expect(invalid.issues.map(i => i.code)).toContain('PLANNING_TARGET_UNKNOWN');
    const result = f.shell('validate-planning-integrity.sh', ['--target-id', 'typo-queue']);
    expect(result.code).toBe(1); expect(result.out).toContain('PLANNING_TARGET_UNKNOWN'); expect(result.out).toContain('typo-queue');
  }, 20000);

  it('refuses source-review reuse when actual sidecar bytes no longer match the signed input', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    expect(planDeliveryReview(f.scope(), 'scope-review', ['O1'], { trustedReviewProvider: f.provider }).action).toBe('reuse');
    f.write('runs/current/review-findings.json', JSON.stringify(f.register, null, 2));
    expect(() => planDeliveryReview(f.scope(), 'scope-review', ['O1'], { trustedReviewProvider: f.provider }))
      .toThrow('empty, stale or mismatched artifact runs/current/review-findings.json');
  });

  it('reuses a current source review that binds both v2 planning inputs', () => {
    const f = fixture(); expect(f.api().issues).toEqual([]);
    const existing = planDeliveryReview(f.scope(), 'scope-review', ['O1'], { trustedReviewProvider: f.provider });
    expect(existing.action).toBe('reuse');
    expect(existing.binding.artifactDigests).toEqual(expect.arrayContaining(f.manifest.planningInputs!.map(b => b.sha256)));
    f.contract.capacity.hours = 24; f.savePlanning();
    expect(planDeliveryReview(f.scope(), 'scope-review', ['O1'], { trustedReviewProvider: f.provider }).action).toBe('review');
    f.approve(); expect(planDeliveryReview(f.scope(), 'scope-review', ['O1'], { trustedReviewProvider: f.provider }).action).toBe('reuse');
  });

});

describe('version 2 architecture contract', () => {
  const plan = (f: ReturnType<typeof fixture>) => { f.save(); return validateDeliveryRun(f.run, { stage: 'plan', trustedReviewProvider: f.provider }); };
  const codes = (f: ReturnType<typeof fixture>) => plan(f).issues.map(i => i.split(':')[0]).filter(code => code.startsWith('ARCHITECTURE_'));
  const rebind = (f: ReturnType<typeof fixture>) => { f.savePlanning(); f.approve(); };
  const describeRequirement = (f: ReturnType<typeof fixture>, description: string) => {
    f.requirements.requirements[0].description = description;
    f.manifest.sourceInputs[0] = { id: 'brief-requirements', ...f.write('requirements.json', JSON.stringify(f.requirements)) };
  };

  it('fails --stage plan for a persistent-data run without a domain contract', () => {
    const f = fixture(); expect(plan(f).issues).toEqual([]);
    fs.unlinkSync(path.join(f.run, 'architecture.json')); f.manifest.planningInputs = f.manifest.planningInputs!.filter(b => !b.path.endsWith('architecture.json')); f.approve();
    const report = plan(f); expect(report.valid).toBe(false); expect(report.completion.planReady).toBe(false);
    expect(report.issues).toEqual([expect.stringMatching(/^ARCHITECTURE_CONTRACT_MISSING: \*: Run has persistent data or roles \(persistent-data requirements R1\)/)]);
  });
  it('binds a present contract into the reviewed planning scope', () => {
    const f = fixture(); f.manifest.planningInputs = f.manifest.planningInputs!.filter(b => !b.path.endsWith('architecture.json'));
    expect(plan(f).issues.join('\n')).toContain('current run sidecars must be bound in planningInputs (planning-integrity.json, review-findings.json, architecture.json)');
    f.savePlanning(); expect(plan(f).issues).toEqual([]);
    f.architecture.api[0].errors.push('409 duplicate request'); f.savePlanning();
    expect(plan(f).issues).toEqual(['scope: original-source coverage review pending or provenance unverified']);
  });
  it('requires provider decisions for capabilities the requirements imply', () => {
    const f = fixture(); describeRequirement(f, 'Seekers search listings within a radius and receive an email confirmation'); rebind(f);
    expect(plan(f).issues.filter(i => i.startsWith('ARCHITECTURE_'))).toEqual(['geocoding', 'search', 'email'].map(c => expect.stringContaining(`ARCHITECTURE_PROVIDER_UNDECIDED: ${c}: Requirements R1 imply ${c}`)));
    f.architecture.providers = [{ capability: 'geocoding', status: 'decided', provider: 'PostGIS with Mapbox geocoding', requirementIds: ['R1'] }, { capability: 'search', status: 'decided', provider: 'Postgres full-text search', requirementIds: ['R1'] }, { capability: 'email', status: 'open', ownerDecisionId: 'D-SENDER', requirementIds: ['R1'] }];
    rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_PROVIDER_INVALID']);
    f.register.ownerDecisions.push({ id: 'D-SENDER', source: f.contract.variants[0].decision, status: 'open', targets: ['queue'], blocks: ['execute'] });
    rebind(f); expect(plan(f).issues).toEqual([]);
    f.architecture.providers[2] = { capability: 'email', status: 'not-required', reason: 'too short', requirementIds: ['R1'] }; rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_PROVIDER_INVALID']);
  });
  it('requires roles, a complete access matrix, state machines and an API contract', () => {
    const f = fixture(); expect(plan(f).issues).toEqual([]);
    f.architecture.roles[0].actors = ['someone else']; rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_ROLE_UNMAPPED']);
    f.architecture.roles[0].actors = ['consumer']; f.architecture.roles.push({ id: 'admin', actors: [] }); rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_ACCESS_INCOMPLETE']);
    f.architecture.roles.pop(); f.architecture.stateMachines = []; rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_STATE_MACHINE_MISSING']);
    f.architecture.stateMachines = architectureContract(f.manifest).stateMachines; f.architecture.stateMachines[0].transitions.splice(0, 1); f.architecture.stateMachines[0].transitions[0].to = 'failed'; rebind(f);
    expect(plan(f).issues.filter(i => i.startsWith('ARCHITECTURE_'))).toEqual([expect.stringContaining('State fulfilled is unreachable from open')]);
    f.architecture.stateMachines = architectureContract(f.manifest).stateMachines; f.architecture.api = []; rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_API_MISSING']);
    f.architecture.api = architectureContract(f.manifest).api; f.architecture.api[0].errors = []; rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_API_INVALID']);
    f.architecture.api[0].errors = ['422']; Object.assign(f.architecture, { entities: [], access: [], stateMachines: [] }); rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_ENTITIES_MISSING']);
  });
  it('exempts bound architecture documents from pending-detail caps but not task sections', () => {
    const f = fixture(); expect(plan(f).issues).toEqual([]);
    const prose = '# Domain model\n\n' + 'Listings belong to an organization and publish only after verification. '.repeat(700);
    f.architecture.documents = [f.write('runs/current/architecture.md', prose)]; rebind(f);
    const report = plan(f); expect(report.issues).toEqual([]); expect(report.metrics.pendingWords).toBeLessThan(1000);
    f.architecture.documents = [f.write('runs/current/architecture.md', prose + '\n## T2 - Build listings\n')]; rebind(f); expect(codes(f)).toEqual(['ARCHITECTURE_TASK_DETAIL']);
    delete f.architecture.documents; rebind(f); expect(plan(f).issues.join('\n')).toMatch(/budget: unregistered pending detail runs\/current\/architecture.md[\s\S]*pending words exceeds/);
  });
  it('does not require a contract for a single-actor run without persistent data', () => {
    const f = fixture(); const scope = f.scope();
    const stateless = f.requirements.requirements.map(r => ({ ...r, description: 'Render the brochure page', checks: r.checks.map(c => ({ ...c, description: 'Visitor sees the page' })) }));
    expect(architectureRequiredReasons(scope, stateless)).toEqual([]);
    expect(architectureRequiredReasons(scope, f.requirements.requirements)).toEqual(['persistent-data requirements R1']);
  });
});

