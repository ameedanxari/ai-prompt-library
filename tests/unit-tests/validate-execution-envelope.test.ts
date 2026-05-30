/**
 * validate-execution-envelope.sh — honest-handoff gate. Refuses
 * `next_task: null` unless every plan T<n>/R<n> either has a file on
 * disk at its **File:** path or is listed in blocked/failed/deferred.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'validate-execution-envelope.sh');
const BUILD_GRAPH = path.join(REPO_ROOT, 'scripts', 'build-task-graph.sh');

type FixtureResult = {
  out: string;
  code: number;
  report: string | null;
};

const run = (planDir: string, projectRoot: string): FixtureResult => {
  let out = '';
  let code = 0;
  try {
    out = execSync(`bash "${SCRIPT}" "${planDir}" "${projectRoot}"`, { encoding: 'utf8' });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number };
    out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
    code = err.status ?? 0;
  }
  const reportPath = path.join(planDir, 'envelope-report.md');
  const report = fs.existsSync(reportPath) ? fs.readFileSync(reportPath, 'utf8') : null;
  return { out, code, report };
};

const mkFixture = () => {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'envelope-'));
  const planDir = path.join(sandbox, 'prompts', 'outputs', 'current');
  fs.mkdirSync(planDir, { recursive: true });
  return { projectRoot: sandbox, planDir };
};

const writeLog = (
  planDir: string,
  envelope: Record<string, string>,
): void => {
  const lines = ['---'];
  for (const [k, v] of Object.entries(envelope)) {
    lines.push(`${k}: ${v}`);
  }
  lines.push('---', '', '# Execution Log', '');
  fs.writeFileSync(path.join(planDir, 'execution-log.md'), lines.join('\n'));
};

const buildGraph = (planDir: string): void => {
  execSync(`bash "${BUILD_GRAPH}" "${planDir}"`, { encoding: 'utf8' });
};

describe('validate-execution-envelope.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('exits 2 when execution-log.md is missing', () => {
    const { projectRoot, planDir } = mkFixture();
    try {
      fs.writeFileSync(
        path.join(planDir, 'tasks-foo.md'),
        '## T1 · x\n- **File:** `src/foo.ts`\n',
      );
      const { code } = run(planDir, projectRoot);
      expect(code).toBe(2);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('passes when every declared File: exists on disk', () => {
    const { projectRoot, planDir } = mkFixture();
    try {
      fs.writeFileSync(
        path.join(planDir, 'tasks-auth.md'),
        [
          '## T1 · Signup',
          '- **File:** `src/auth/signup.ts`',
          '## T2 · Login',
          '- **File:** `src/auth/login.ts`',
        ].join('\n'),
      );
      fs.mkdirSync(path.join(projectRoot, 'src', 'auth'), { recursive: true });
      fs.writeFileSync(path.join(projectRoot, 'src', 'auth', 'signup.ts'), '// impl');
      fs.writeFileSync(path.join(projectRoot, 'src', 'auth', 'login.ts'), '// impl');
      writeLog(planDir, {
        session_id: '00000000-0000-0000-0000-000000000000',
        next_task: 'null',
        blocked_tasks: '[]',
        failed_tasks: '[]',
        deferred_tasks: '[]',
      });
      buildGraph(planDir);
      const { code, report } = run(planDir, projectRoot);
      expect(code).toBe(0);
      expect(report!).toMatch(/envelope_state: honest/);
      expect(report!).toMatch(/silent_skips: 0/);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('fails with a silent-skip row when a task has no file on disk and no excuse', () => {
    const { projectRoot, planDir } = mkFixture();
    try {
      fs.writeFileSync(
        path.join(planDir, 'tasks-auth.md'),
        [
          '## T1 · Signup',
          '- **File:** `src/auth/signup.ts`',
          '## T2 · Login',
          '- **File:** `src/auth/login.ts`',
        ].join('\n'),
      );
      // Only signup.ts exists; login.ts is a silent skip.
      fs.mkdirSync(path.join(projectRoot, 'src', 'auth'), { recursive: true });
      fs.writeFileSync(path.join(projectRoot, 'src', 'auth', 'signup.ts'), '// impl');
      writeLog(planDir, {
        session_id: '00000000-0000-0000-0000-000000000000',
        next_task: 'null',
        blocked_tasks: '[]',
        failed_tasks: '[]',
        deferred_tasks: '[]',
      });
      buildGraph(planDir);
      const { code, report } = run(planDir, projectRoot);
      expect(code).toBe(1);
      expect(report!).toMatch(/envelope_state: silent_skips_detected/);
      expect(report!).toMatch(/silent_skips: 1/);
      expect(report!).toMatch(/auth:T2/);
      expect(report!).toMatch(/src\/auth\/login\.ts/);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('excuses a missing file that is explicitly listed in blocked_tasks', () => {
    const { projectRoot, planDir } = mkFixture();
    try {
      fs.writeFileSync(
        path.join(planDir, 'tasks-auth.md'),
        [
          '## T1 · Signup',
          '- **File:** `src/auth/signup.ts`',
          '## T2 · Login',
          '- **File:** `src/auth/login.ts`',
        ].join('\n'),
      );
      fs.mkdirSync(path.join(projectRoot, 'src', 'auth'), { recursive: true });
      fs.writeFileSync(path.join(projectRoot, 'src', 'auth', 'signup.ts'), '// impl');
      writeLog(planDir, {
        session_id: '00000000-0000-0000-0000-000000000000',
        next_task: 'null',
        blocked_tasks: '[auth:T2]',
        failed_tasks: '[]',
        deferred_tasks: '[]',
      });
      buildGraph(planDir);
      const { code, report } = run(planDir, projectRoot);
      expect(code).toBe(0);
      expect(report!).toMatch(/excused_blocked_failed_deferred: 1/);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });

  it('accepts the tasks-foo.md:T2 excuse notation', () => {
    const { projectRoot, planDir } = mkFixture();
    try {
      fs.writeFileSync(
        path.join(planDir, 'tasks-auth.md'),
        ['## T1 · Login', '- **File:** `src/auth/login.ts`'].join('\n'),
      );
      writeLog(planDir, {
        session_id: '00000000-0000-0000-0000-000000000000',
        next_task: 'null',
        blocked_tasks: '[]',
        failed_tasks: '[tasks-auth.md:T1]',
        deferred_tasks: '[]',
      });
      buildGraph(planDir);
      const { code } = run(planDir, projectRoot);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(projectRoot, { recursive: true, force: true });
    }
  });
});
