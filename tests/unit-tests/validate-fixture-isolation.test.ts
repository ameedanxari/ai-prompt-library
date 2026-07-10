import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-fixture-isolation.sh');

function run(units: Record<string, unknown>[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fixture-isolation-'));
  fs.writeFileSync(path.join(dir, 'task-contract.json'), JSON.stringify({ units }), 'utf8');
  let code = 0;
  let out = '';
  try {
    out = execFileSync('/bin/bash', [VALIDATOR, dir], { encoding: 'utf8' });
  } catch (error) {
    const failure = error as { status?: number; stdout?: Buffer; stderr?: Buffer };
    code = failure.status ?? 1;
    out = `${failure.stdout?.toString() ?? ''}${failure.stderr?.toString() ?? ''}`;
  }
  return {
    code,
    out,
    report: JSON.parse(fs.readFileSync(path.join(dir, 'fixture-isolation-report.json'), 'utf8')),
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

function fixture(overrides: Record<string, unknown> = {}) {
  return {
    id: 'T1',
    canonicalId: 'tasks-fixture.md#T1',
    file: 'tasks-fixture.md',
    compositionMap: 'test-fixture',
    fixtureAllowance: 'owner=Platform; expiry=2099-12-31; reason=service pending',
    fixtureRetirementTask: 'tasks-production.md#T1',
    releaseExclusionCheck: 'npm run verify:no-fixtures',
    evidenceLevel: 'ui-fixture',
    artifactKind: 'runtime-source',
    productionOwner: 'Application shell',
    runtimeReachability: 'primary-flow composition root',
    dependencies: [],
    ...overrides,
  };
}

function production(overrides: Record<string, unknown> = {}) {
  return {
    id: 'T1',
    canonicalId: 'tasks-production.md#T1',
    file: 'tasks-production.md',
    compositionMap: 'production',
    evidenceLevel: 'integration',
    artifactKind: 'runtime-source',
    productionOwner: 'Application shell',
    runtimeReachability: 'production composition root',
    dependencies: [{ file: 'tasks-fixture.md' }],
    ...overrides,
  };
}

describe('validate-fixture-isolation.sh', () => {
  it('is executable', () => {
    expect((fs.statSync(VALIDATOR).mode & 0o111) !== 0).toBe(true);
  });

  it('records plans without fixture composition as not applicable', () => {
    const result = run([{ compositionMap: 'production' }]);
    try {
      expect(result.code).toBe(0);
      expect(result.report).toMatchObject({ status: 'not-applicable', applicable: false });
    } finally {
      result.cleanup();
    }
  });

  it('rejects primary-flow fixture wiring without retirement metadata', () => {
    const result = run([fixture({
      fixtureAllowance: 'owner=Platform; expiry=2099-12-31',
      fixtureRetirementTask: undefined,
      releaseExclusionCheck: undefined,
    })]);
    try {
      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing-fixture-retirement-task/);
      expect(result.report.allowances[0]).toMatchObject({
        owner: 'Platform',
        expiry: '2099-12-31',
        replacementTask: null,
      });
      expect(result.report.issues.map((issue: { code: string }) => issue.code)).toEqual(
        expect.arrayContaining([
          'missing-fixture-retirement-task',
          'missing-release-exclusion-check',
          'fixture-only-production-verification',
        ]),
      );
    } finally {
      result.cleanup();
    }
  });

  it('passes an owned, expiring allowance with retirement, dependency, exclusion, and production evidence', () => {
    const result = run([fixture(), production()]);
    try {
      expect(result.code).toBe(0);
      expect(result.report).toMatchObject({ status: 'pass', applicable: true, issues: [] });
      expect(result.report.allowances[0]).toMatchObject({
        owner: 'Platform',
        expiry: '2099-12-31',
        replacementResolved: 'tasks-production.md#T1',
        dependencyEdge: true,
        productionWiringEvidenceTask: 'tasks-production.md#T1',
        missingChecks: [],
      });
    } finally {
      result.cleanup();
    }
  });

  it('does not let fixture evidence certify production without integration wiring', () => {
    const result = run([fixture(), production({ evidenceLevel: 'unit' })]);
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'fixture-only-production-verification',
        taskId: 'tasks-fixture.md#T1',
      }));
    } finally {
      result.cleanup();
    }
  });

  it('requires an explicit dependency edge to retirement work', () => {
    const result = run([fixture(), production({ dependencies: [] })]);
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'missing-fixture-retirement-dependency',
      }));
    } finally {
      result.cleanup();
    }
  });

  it('requires an allowance owner and an unexpired calendar date', () => {
    const result = run([
      fixture({ fixtureAllowance: 'expiry=2099-02-30; reason=invalid exception' }),
      production(),
    ]);
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues.map((issue: { code: string }) => issue.code)).toEqual(
        expect.arrayContaining(['missing-fixture-owner', 'invalid-fixture-expiry']),
      );
    } finally {
      result.cleanup();
    }
  });

  it('requires fixture tests to declare ui-fixture evidence', () => {
    const result = run([fixture({ evidenceLevel: 'integration' }), production()]);
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'fixture-evidence-level-mismatch',
      }));
    } finally {
      result.cleanup();
    }
  });

  it('allows isolated preview composition without a production allowance', () => {
    const result = run([{
      id: 'T1',
      canonicalId: 'tasks-preview.md#T1',
      file: 'tasks-preview.md',
      compositionMap: 'preview',
      evidenceLevel: 'ui-fixture',
      artifactKind: 'test-source',
      runtimeReachability: 'preview-only component catalog',
      dependencies: [],
    }]);
    try {
      expect(result.code).toBe(0);
      expect(result.report).toMatchObject({ status: 'pass', applicable: true });
      expect(result.report.allowances[0]).toMatchObject({ productionOwned: false });
    } finally {
      result.cleanup();
    }
  });
});
