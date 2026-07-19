import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-fixture-isolation.sh');

// Regression suite for the 2026-07 SignalForge audit finding: the gate
// keyed only off Composition map, so a task contract carrying
// `Evidence level: ui-fixture` on 47 units reported not-applicable and
// the one check built to catch fixtures-as-live-data never ran.

function run(units: Record<string, unknown>[]) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fixture-keying-'));
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
  const report = JSON.parse(fs.readFileSync(path.join(dir, 'fixture-isolation-report.json'), 'utf8'));
  fs.rmSync(dir, { recursive: true, force: true });
  return { code, out, report };
}

function unit(overrides: Record<string, unknown> = {}) {
  return {
    id: 'T1',
    canonicalId: 'tasks-surface.md#T1',
    file: 'tasks-surface.md',
    evidenceLevel: 'ui-fixture',
    artifactKind: 'runtime-source',
    runtimeReachability: 'mounted at /surface route',
    dependencies: [],
    ...overrides,
  };
}

describe('fixture isolation keys off evidence level, not composition map alone', () => {
  it('fails (not not-applicable) when ui-fixture evidence appears without any composition map', () => {
    const { code, report } = run([
      unit(),
      unit({ id: 'T2', canonicalId: 'tasks-other.md#T2', file: 'tasks-other.md' }),
    ]);
    expect(report.applicable).toBe(true);
    expect(report.status).toBe('fail');
    expect(code).toBe(1);
    const codes = report.issues.map((issue: { code: string }) => issue.code);
    expect(codes.filter((value: string) => value === 'missing-composition-map')).toHaveLength(2);
  });

  it('rejects a production composition map resting on ui-fixture evidence', () => {
    const { report } = run([unit({ compositionMap: 'production' })]);
    expect(report.status).toBe('fail');
    expect(report.issues.map((issue: { code: string }) => issue.code))
      .toContain('production-map-fixture-evidence');
  });

  it('stays not-applicable only when no unit carries either fixture signal', () => {
    const { code, report } = run([
      unit({ evidenceLevel: 'integration' }),
      unit({ id: 'T2', canonicalId: 'tasks-b.md#T2', file: 'tasks-b.md', evidenceLevel: 'device' }),
    ]);
    expect(report.status).toBe('not-applicable');
    expect(report.applicable).toBe(false);
    expect(code).toBe(0);
  });

  it('rejects composition maps outside the declared vocabulary', () => {
    const { report } = run([unit({ compositionMap: 'sandbox' })]);
    expect(report.status).toBe('fail');
    expect(report.issues.map((issue: { code: string }) => issue.code))
      .toContain('unknown-composition-map');
  });
});
