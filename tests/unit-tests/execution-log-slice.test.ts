import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'execution-log-slice.sh');

const dirs: string[] = [];

function record(taskId: string, extra: Record<string, unknown> = {}) {
  return '```execution-status-record\n' + JSON.stringify({ taskId, status: 'done', ...extra }, null, 2) + '\n```';
}

function fixture(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-log-slice-'));
  dirs.push(dir);
  const log = [
    '---',
    'session_id: abc',
    'status: in_progress',
    '---',
    '',
    '# Execution Log',
    '',
    '## G01 · alpha',
    '',
    '### `remediation-alpha.md` — done',
    '- **Scope:** done',
    record('remediation-alpha.md#R1'),
    record('remediation-alpha.md#R2'),
    '',
    '## G02 · beta',
    '',
    '### `tasks-beta.md` — done',
    '- **Scope:** beta only',
    record('tasks-beta.md#T1'),
    '',
    '### `remediation-alpha.md` — in_progress',
    '- **Scope:** alpha second pass',
    record('remediation-alpha.md#R3'),
    '',
    '## G03 · gamma',
    '',
    '### `remediation-gamma.md` — done',
    '- **Scope:** gamma only',
    '',
  ].join('\n');
  fs.writeFileSync(path.join(dir, 'execution-log.md'), log);
  return dir;
}

function run(args: string[]): { code: number; out: string; err: string } {
  const result = spawnSync('/bin/bash', [SCRIPT, ...args], { encoding: 'utf8' });
  return { code: result.status ?? -1, out: result.stdout, err: result.stderr };
}

afterEach(() => {
  while (dirs.length) fs.rmSync(dirs.pop()!, { recursive: true, force: true });
});

describe('execution-log-slice.sh', () => {
  it('prints frontmatter and only the matching entries', () => {
    const dir = fixture();
    const { code, out } = run([dir, 'remediation-alpha.md']);
    expect(code).toBe(0);
    expect(out).toContain('session_id: abc');
    expect(out).toContain('### `remediation-alpha.md` — done');
    expect(out).toContain('### `remediation-alpha.md` — in_progress');
    expect(out).toContain('remediation-alpha.md#R3');
    expect(out).not.toContain('tasks-beta.md');
    expect(out).not.toContain('gamma');
    expect(out).not.toContain('# Execution Log');
  });

  it('accepts a path for PLAN_FILE and reduces it to the file name', () => {
    const dir = fixture();
    const { code, out } = run([dir, 'prompts/outputs/current/tasks-beta.md']);
    expect(code).toBe(0);
    expect(out).toContain('beta only');
    expect(out).not.toContain('alpha second pass');
  });

  it('--records-only prints a JSON array of the matching records', () => {
    const dir = fixture();
    const { code, out } = run([dir, 'remediation-alpha.md', '--records-only']);
    expect(code).toBe(0);
    const parsed = JSON.parse(out);
    expect(parsed.map((r: { taskId: string }) => r.taskId)).toEqual([
      'remediation-alpha.md#R1',
      'remediation-alpha.md#R2',
      'remediation-alpha.md#R3',
    ]);
    expect(out).not.toContain('session_id');
  });

  it('exits 1 when no entry matches', () => {
    const dir = fixture();
    const { code, out, err } = run([dir, 'remediation-missing.md']);
    expect(code).toBe(1);
    expect(out).toBe('');
    expect(err).toContain('remediation-missing.md');
  });

  it('exits 1 for --records-only when the entry has no records', () => {
    const dir = fixture();
    const { code } = run([dir, 'remediation-gamma.md', '--records-only']);
    expect(code).toBe(1);
  });

  it('exits 2 on usage errors', () => {
    const dir = fixture();
    expect(run([]).code).toBe(2);
    expect(run([dir, 'remediation-alpha.md', '--bogus']).code).toBe(2);
    expect(run([dir, 'a.md', 'b.md']).code).toBe(2);
  });

  it('exits 2 when the log is missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'exec-log-slice-empty-'));
    dirs.push(dir);
    const { code, err } = run([dir, 'remediation-alpha.md']);
    expect(code).toBe(2);
    expect(err).toContain('execution log not found');
  });
});
