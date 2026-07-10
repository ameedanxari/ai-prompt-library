import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-walking-skeleton.sh');

function run(contract: Record<string, unknown>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'walking-skeleton-'));
  fs.writeFileSync(path.join(dir, 'task-contract.json'), JSON.stringify(contract), 'utf8');
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
    report: JSON.parse(fs.readFileSync(path.join(dir, 'walking-skeleton-report.json'), 'utf8')),
    cleanup: () => fs.rmSync(dir, { recursive: true, force: true }),
  };
}

function skeleton(overrides: Record<string, unknown> = {}) {
  return {
    canonicalId: 'tasks-mvp-walking-skeleton-ios.md#T1',
    file: 'tasks-mvp-walking-skeleton-ios.md',
    title: 'MVP walking skeleton for iOS',
    artifactKind: 'runtime-source',
    evidenceLevel: 'integration',
    productionOwner: 'iOS application shell',
    runtimeReachability: 'task-type=cross-feature-composition; product-surface=ios; primary-flow=FLOW-CLEANUP-001; production-composition-root=ios/App/App.swift; release-gate=mvp-walking-skeleton',
    filePaths: ['ios/App/App.swift'],
    phase: 'mvp',
    dependencies: [],
    ...overrides,
  };
}

describe('validate-walking-skeleton.sh', () => {
  it('is executable', () => {
    expect((fs.statSync(VALIDATOR).mode & 0o111) !== 0).toBe(true);
  });

  it('records docs-only and library plans as not applicable', () => {
    const result = run({ summary: { taskFileCount: 0 }, units: [{ artifactKind: 'docs' }] });
    try {
      expect(result.code).toBe(0);
      expect(result.report).toMatchObject({ status: 'not-applicable', applicable: false });
    } finally {
      result.cleanup();
    }
  });

  it('supports a target directory expressed relative to the current working directory', () => {
    const dir = fs.mkdtempSync(path.join(REPO_ROOT, '.walking-skeleton-relative-'));
    try {
      fs.writeFileSync(path.join(dir, 'task-contract.json'), JSON.stringify({ units: [] }), 'utf8');
      const relative = path.relative(REPO_ROOT, dir);
      const out = execFileSync('/bin/bash', [VALIDATOR, relative], {
        cwd: REPO_ROOT,
        encoding: 'utf8',
      });
      expect(out).toMatch(/status=not-applicable/);
      expect(JSON.parse(
        fs.readFileSync(path.join(dir, 'walking-skeleton-report.json'), 'utf8'),
      )).toMatchObject({ status: 'not-applicable' });
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('names a product surface that has no walking skeleton', () => {
    const result = run({
      units: [{
        canonicalId: 'tasks-home.md#T1',
        file: 'tasks-home.md',
        artifactKind: 'runtime-source',
        evidenceLevel: 'unit',
        runtimeReachability: 'product-surface=ios; production-composition-root=ios/App/App.swift',
        filePaths: ['ios/App/Home.swift'],
        phase: 'mvp',
      }],
    });
    try {
      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing-walking-skeleton \[ios\]/);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'missing-walking-skeleton',
        surface: 'ios',
      }));
    } finally {
      result.cleanup();
    }
  });

  it('passes production wiring and an expansion dependency for the same surface', () => {
    const result = run({
      units: [
        skeleton(),
        {
          canonicalId: 'tasks-smart-groups.md#T1',
          file: 'tasks-smart-groups.md',
          artifactKind: 'runtime-source',
          evidenceLevel: 'integration',
          runtimeReachability: 'product-surface=ios; primary-flow=FLOW-CLEANUP-001',
          filePaths: ['ios/App/SmartGroups.swift'],
          phase: 'expand',
          dependencies: [{ file: 'tasks-mvp-walking-skeleton-ios.md' }],
        },
      ],
    });
    try {
      expect(result.code).toBe(0);
      expect(result.report).toMatchObject({ status: 'pass', applicable: true, issues: [] });
    } finally {
      result.cleanup();
    }
  });

  it('rejects fixture-only skeleton evidence without paired production wiring', () => {
    const result = run({
      units: [skeleton({
        artifactKind: 'test-source',
        title: 'Fixture-only MVP walking skeleton for iOS',
        runtimeReachability: 'task-type=cross-feature-composition; product-surface=ios; primary-flow=FLOW-CLEANUP-001; release-gate=mvp-walking-skeleton; test-only=true',
      })],
    });
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues.map((issue: { code: string }) => issue.code)).toEqual(
        expect.arrayContaining(['missing-production-composition-root', 'fixture-only-skeleton']),
      );
    } finally {
      result.cleanup();
    }
  });

  it('reports an expansion task that bypasses the surface skeleton', () => {
    const result = run({
      units: [
        skeleton(),
        {
          canonicalId: 'tasks-broad-feature.md#T2',
          file: 'tasks-broad-feature.md',
          artifactKind: 'runtime-source',
          runtimeReachability: 'product-surface=ios',
          filePaths: ['ios/App/BroadFeature.swift'],
          phase: 'expand',
          dependencies: [],
        },
      ],
    });
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'expansion-missing-skeleton-dependency',
        file: 'tasks-broad-feature.md',
        taskId: 'tasks-broad-feature.md#T2',
      }));
    } finally {
      result.cleanup();
    }
  });

  it('rejects static-only skeleton evidence', () => {
    const result = run({ units: [skeleton({ evidenceLevel: 'static' })] });
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'insufficient-skeleton-evidence',
      }));
    } finally {
      result.cleanup();
    }
  });

  it('rejects duplicate skeleton owners for one surface', () => {
    const result = run({
      units: [
        skeleton(),
        skeleton({
          canonicalId: 'tasks-second-walking-skeleton-ios.md#T1',
          file: 'tasks-second-walking-skeleton-ios.md',
        }),
      ],
    });
    try {
      expect(result.code).toBe(1);
      expect(result.report.issues).toContainEqual(expect.objectContaining({
        code: 'duplicate-walking-skeleton',
        surface: 'ios',
      }));
    } finally {
      result.cleanup();
    }
  });
});
