/**
 * diagnose-harness.sh — harness-crash diagnosis pipeline.
 *
 * Exit-code contract (mirrors executor.md):
 *   0 not_crashed        | 1 harness_crash (recipe applied)
 *   2 code_crash_known   | 3 code_crash_unknown / blocked / undetected stack
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const DISPATCHER = path.join(REPO_ROOT, 'scripts', 'diagnose-harness.sh');

type RunResult = { code: number; out: string; json: Record<string, unknown> | null };

function run(
  cwd: string,
  args: { stack: string; stderr: string; exitCode?: number; task?: string },
): RunResult {
  const stderrFile = path.join(cwd, 'stderr.txt');
  fs.writeFileSync(stderrFile, args.stderr, 'utf8');
  const outputJson = path.join(cwd, 'prompts', 'outputs', 'current', 'harness-diagnosis.json');
  fs.mkdirSync(path.dirname(outputJson), { recursive: true });
  const cmd = [
    `bash "${DISPATCHER}"`,
    `--stack "${args.stack}"`,
    `--stderr "${stderrFile}"`,
    `--exit-code ${args.exitCode ?? 1}`,
    `--task "${args.task ?? 'tasks-test.md'}"`,
    `--output "${outputJson}"`,
  ].join(' ');

  let out = '';
  let code = 0;
  try {
    out = execSync(cmd, { encoding: 'utf8', cwd, stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number };
    out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
    code = err.status ?? 0;
  }
  let json: Record<string, unknown> | null = null;
  if (fs.existsSync(outputJson)) {
    try {
      json = JSON.parse(fs.readFileSync(outputJson, 'utf8'));
    } catch {
      json = null;
    }
  }
  return { code, out, json };
}

function sandbox(suffix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `diagnose-harness-${suffix}-`));
  fs.writeFileSync(path.join(dir, 'package.json'), '{}', 'utf8'); // allow auto-detect fallback
  return dir;
}

describe('diagnose-harness.sh', () => {
  it('dispatcher is executable', () => {
    expect(fs.existsSync(DISPATCHER)).toBe(true);
    expect((fs.statSync(DISPATCHER).mode & 0o111) !== 0).toBe(true);
  });

  it('web — EADDRINUSE classifies as harness_crash with port-in-use id', () => {
    const dir = sandbox('web-port');
    try {
      const { code, json } = run(dir, {
        stack: 'web',
        stderr: 'Error: listen EADDRINUSE: address already in use :::3000',
      });
      expect(code).toBe(1);
      expect(json?.classification).toBe('port-in-use');
      expect(json?.harness_status).toBe('harness_crash');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('web — missing module classifies as code_crash_known (exit 2)', () => {
    const dir = sandbox('web-missing-dep');
    try {
      const { code, json } = run(dir, {
        stack: 'web',
        stderr: "Error: Cannot find module 'react-router-dom'",
      });
      expect(code).toBe(2);
      expect(json?.classification).toBe('missing-dependency');
      expect((json?.remediation as Record<string, unknown> | undefined)?.type).toBe('code_fix');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('ios — missing usage description classifies as code_crash_known', () => {
    const dir = sandbox('ios-usage-desc');
    try {
      const { code, json } = run(dir, {
        stack: 'ios',
        stderr:
          'This app has crashed because it attempted to access privacy-sensitive data without a usage description. NSCameraUsageDescription',
      });
      expect(code).toBe(2);
      expect(json?.classification).toBe('missing-usage-description');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('android — gradle daemon dead classifies as harness_crash', () => {
    const dir = sandbox('android-gradle');
    try {
      const { code, json } = run(dir, {
        stack: 'android',
        stderr: 'FAILED: Could not start Gradle build daemon. Could not connect to daemon.',
      });
      expect([1, 3]).toContain(code); // recipe may not be applicable in CI (no gradlew)
      expect(json?.classification).toBe('gradle-daemon-dead');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('bash — exit 137 (Killed) classifies as signal-killed (harness_crash)', () => {
    const dir = sandbox('bash-killed');
    try {
      const { code, json } = run(dir, {
        stack: 'bash',
        stderr: 'Killed',
        exitCode: 137,
      });
      expect([1, 3]).toContain(code);
      expect(json?.classification).toBe('signal-killed');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('flutter — missing pubspec dependency classifies as code_crash_known', () => {
    const dir = sandbox('flutter-pub');
    try {
      const { code, json } = run(dir, {
        stack: 'flutter',
        stderr: "Target of URI doesn't exist: 'package:provider/provider.dart'",
      });
      expect(code).toBe(2);
      expect(json?.classification).toBe('missing-pubspec-dependency');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('unmatched stderr → code_crash_unknown (exit 3) with classification=unmatched', () => {
    const dir = sandbox('unmatched');
    try {
      const { code, json } = run(dir, {
        stack: 'web',
        stderr: 'AssertionError: expected 1 to equal 2',
      });
      expect(code).toBe(3);
      expect(json?.classification).toBe('unmatched');
      expect(json?.harness_status).toBe('code_crash_unknown');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('retry cap: a second crash of the same task forces exit 3', () => {
    const dir = sandbox('retry-cap');
    try {
      // Pre-populate execution-log.md with a prior recovery for the same task.
      const log = path.join(dir, 'prompts', 'outputs', 'current', 'execution-log.md');
      fs.mkdirSync(path.dirname(log), { recursive: true });
      fs.writeFileSync(
        log,
        [
          '---',
          'session_id: aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
          'parent_session: null',
          'plan_source: drill-down-engine',
          'started_at: 2026-05-20T00:00:00Z',
          'updated_at: 2026-05-20T00:00:00Z',
          'next_task: tasks-test.md',
          'harness_recoveries:',
          '  - task: tasks-test.md',
          '    classification: port-in-use',
          '    action: recipe',
          '    result: recovered',
          '    at: 2026-05-20T00:01:00Z',
          '---',
          '',
          '# Execution Log',
        ].join('\n'),
        'utf8',
      );
      const { code } = run(dir, {
        stack: 'web',
        stderr: 'Error: listen EADDRINUSE: address already in use :::3000',
        task: 'tasks-test.md',
      });
      expect(code).toBe(3);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
