/**
 * safety-check-commit.sh — per-task commit scope/revert protection.
 *
 * Verdict contract:
 *   safe                 — exit 0, no warnings
 *   safe_with_warnings   — exit 0, scope drift or large-deletion warning
 *   unsafe               — exit 1, unauthorized file delete OR --strict + warnings
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'safety-check-commit.sh');

function makeRepo(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'safety-check-'));
  execSync(`git init -q --initial-branch=main "${dir}"`);
  execSync('git config user.email test@example.com', { cwd: dir });
  execSync('git config user.name test', { cwd: dir });
  fs.writeFileSync(path.join(dir, 'README.md'), '# init\n', 'utf8');
  execSync('git add README.md', { cwd: dir });
  execSync('git -c commit.gpgsign=false commit -q -m init', { cwd: dir });
  return dir;
}

function writeTask(repo: string, name: string, files: string[]) {
  const taskPath = path.join(repo, name);
  const body = [
    '# Task',
    '',
    '## T1',
    ...files.map((f) => `- **File:** \`${f}\``),
    '',
  ].join('\n');
  fs.writeFileSync(taskPath, body, 'utf8');
  return taskPath;
}

function run(
  repo: string,
  taskFile: string,
  opts: { strict?: boolean; reportPath?: string } = {},
): { code: number; out: string; report: Record<string, unknown> | null } {
  const reportPath = opts.reportPath ?? path.join(repo, 'safety-report.json');
  const args = [`--task "${taskFile}"`, `--report "${reportPath}"`];
  if (opts.strict) args.push('--strict');
  let out = '';
  let code = 0;
  try {
    out = execSync(`bash "${SCRIPT}" ${args.join(' ')}`, {
      encoding: 'utf8',
      cwd: repo,
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number };
    out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
    code = err.status ?? 0;
  }
  let report: Record<string, unknown> | null = null;
  if (fs.existsSync(reportPath)) {
    try {
      report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    } catch {
      report = null;
    }
  }
  return { code, out, report };
}

describe('safety-check-commit.sh', () => {
  let repo = '';
  beforeEach(() => {
    repo = makeRepo();
  });
  afterEach(() => {
    if (repo) fs.rmSync(repo, { recursive: true, force: true });
  });

  it('script is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('verdict=safe when all modified files are in task scope', () => {
    fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'src', 'foo.ts'), 'export const foo = 1;\n', 'utf8');
    const task = writeTask(repo, 'tasks-foo.md', ['src/foo.ts']);
    const { code, report } = run(repo, task);
    expect(code).toBe(0);
    expect(report?.verdict).toBe('safe');
    expect(report?.out_of_scope_files).toEqual([]);
  });

  it('verdict=safe_with_warnings on scope drift (non-strict)', () => {
    fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'src', 'foo.ts'), 'export const foo = 1;\n', 'utf8');
    fs.writeFileSync(path.join(repo, 'src', 'rogue.ts'), 'export const rogue = 2;\n', 'utf8');
    const task = writeTask(repo, 'tasks-foo.md', ['src/foo.ts']);
    const { code, report } = run(repo, task);
    expect(code).toBe(0);
    expect(report?.verdict).toBe('safe_with_warnings');
    expect((report?.out_of_scope_files as string[])).toContain('src/rogue.ts');
  });

  it('verdict=unsafe (exit 1) in --strict when scope drift', () => {
    fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'src', 'rogue.ts'), 'export const rogue = 2;\n', 'utf8');
    const task = writeTask(repo, 'tasks-foo.md', ['src/declared-but-unwritten.ts']);
    const { code } = run(repo, task, { strict: true });
    expect(code).toBe(1);
  });

  it('verdict=unsafe (exit 1) when files outside scope are deleted', () => {
    fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
    fs.writeFileSync(path.join(repo, 'src', 'precious.ts'), 'export const precious = 42;\n', 'utf8');
    execSync('git add src/precious.ts', { cwd: repo });
    execSync('git -c commit.gpgsign=false commit -q -m add', { cwd: repo });
    fs.unlinkSync(path.join(repo, 'src', 'precious.ts'));
    execSync('git add -A', { cwd: repo });
    const task = writeTask(repo, 'tasks-foo.md', ['src/something-else.ts']);
    const { code, report } = run(repo, task);
    expect(code).toBe(1);
    expect((report?.unauthorized_deletes as string[])).toContain('src/precious.ts');
  });

  it('always allows engine-output files (execution-log.md, etc.) even if not in task scope', () => {
    fs.mkdirSync(path.join(repo, 'prompts', 'outputs', 'current'), { recursive: true });
    fs.writeFileSync(
      path.join(repo, 'prompts', 'outputs', 'current', 'execution-log.md'),
      '# log\n',
      'utf8',
    );
    fs.writeFileSync(
      path.join(repo, 'prompts', 'outputs', 'current', 'resumption-checkpoint.md'),
      'phase: execution\n',
      'utf8',
    );
    const task = writeTask(repo, 'tasks-foo.md', ['src/never-touched.ts']);
    const { code, report } = run(repo, task);
    expect(code).toBe(0);
    expect(report?.verdict).toBe('safe');
  });
});
