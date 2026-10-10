import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'check-evidence-currency.sh');

const cleanup: string[] = [];
afterEach(() => {
  while (cleanup.length > 0) {
    fs.rmSync(cleanup.pop() as string, { recursive: true, force: true });
  }
});

function git(repo: string, ...args: string[]): string {
  return execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim();
}

function commit(repo: string, message: string): void {
  git(repo, 'add', '-A');
  git(repo, '-c', 'user.name=test', '-c', 'user.email=test@example.com', 'commit', '-q', '-m', message);
}

function script(args: string[]): { code: number; out: string } {
  const result = spawnSync('/bin/bash', [SCRIPT, ...args], { encoding: 'utf8' });
  return { code: result.status ?? 1, out: `${result.stdout}${result.stderr}` };
}

function digest(repo: string, paths: string[], rev?: string): string {
  const result = script(['--digest', '--repo', repo, ...(rev ? ['--rev', rev] : ['--worktree']), ...paths]);
  expect(result.code).toBe(0);
  return result.out.trim();
}

function writeLog(planDir: string, records: Record<string, unknown>[]): void {
  fs.writeFileSync(path.join(planDir, 'execution-log.md'), [
    '---',
    'next_task: null',
    '---',
    '',
    ...records.flatMap((entry) => ['```execution-status-record', JSON.stringify(entry, null, 2), '```', '']),
  ].join('\n'), 'utf8');
}

function build(extra: Record<string, unknown> = {}) {
  return { outcome: 'pass', command: 'npm run typecheck', recordedAt: '2026-07-10T00:01:00Z', current: true, ...extra };
}

function setup() {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'evidence-currency-'));
  cleanup.push(repo);
  git(repo, 'init', '-q');
  fs.mkdirSync(path.join(repo, 'src'));
  fs.writeFileSync(path.join(repo, 'src', 'covered.ts'), 'export const a = 1;\n');
  fs.writeFileSync(path.join(repo, 'src', 'other.ts'), 'export const b = 1;\n');
  commit(repo, 'initial');
  const planDir = path.join(repo, 'plan');
  fs.mkdirSync(planDir);
  return { repo, planDir };
}

function check(repo: string, planDir: string) {
  const result = script([planDir, '--repo', repo]);
  const reportPath = path.join(planDir, 'evidence-currency-report.json');
  return {
    ...result,
    report: fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : null,
  };
}

describe('check-evidence-currency.sh', () => {
  it('is executable', () => {
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('prints a stable sha256 digest and treats absent paths as missing', () => {
    const { repo } = setup();
    const first = digest(repo, ['src/covered.ts', 'src/gone.ts']);
    expect(first).toMatch(/^sha256:[0-9a-f]{64}$/);
    expect(digest(repo, ['src/gone.ts', 'src/covered.ts'])).toBe(first);
    expect(digest(repo, ['src/covered.ts'])).not.toBe(first);
  });

  it('defaults --digest to the working tree and keeps --rev for committed blobs', () => {
    const { repo } = setup();
    const committed = digest(repo, ['src/covered.ts'], 'HEAD');
    expect(script(['--digest', '--repo', repo, 'src/covered.ts']).out.trim()).toBe(committed);
    fs.writeFileSync(path.join(repo, 'src', 'covered.ts'), 'export const a = 99;\n');
    const bare = script(['--digest', '--repo', repo, 'src/covered.ts']).out.trim();
    expect(bare).not.toBe(committed);
    expect(bare).toBe(digest(repo, ['src/covered.ts'])); // explicit --worktree
    expect(digest(repo, ['src/covered.ts'], 'HEAD')).toBe(committed); // --rev ignores the working tree
  });

  it('rejects --rev together with --worktree', () => {
    const { repo } = setup();
    expect(script(['--digest', '--repo', repo, '--rev', 'HEAD', '--worktree', 'src/covered.ts']).code).toBe(2);
  });

  it('stays current on the commit that records a worktree digest', () => {
    const { repo, planDir } = setup();
    const covered = ['src/covered.ts', 'src/new.ts'];
    fs.writeFileSync(path.join(repo, 'src', 'covered.ts'), 'export const a = 3;\n');
    fs.writeFileSync(path.join(repo, 'src', 'new.ts'), 'export const n = 1;\n');
    const pre = digest(repo, covered); // uncommitted change, worktree blobs
    writeLog(planDir, [{
      taskId: 'remediation-foo.md#R1',
      status: 'done',
      buildEvidence: build({ coveredPaths: covered, pathsDigest: pre }),
    }]);
    commit(repo, 'code and log together');
    const result = check(repo, planDir);
    expect(result.code).toBe(0);
    expect(result.report).toMatchObject({ checked: 1, current: 1, stale: [] });
    // Old behaviour: a committed-blob digest computed before the commit would not match.
    expect(digest(repo, covered, 'HEAD')).toBe(pre);
    expect(digest(repo, covered, 'HEAD~1')).not.toBe(pre);
    // Report mode can also verify against the working tree.
    const wt = script([planDir, '--repo', repo, '--worktree']);
    expect(wt.code).toBe(0);
    fs.writeFileSync(path.join(repo, 'src', 'new.ts'), 'export const n = 2;\n');
    expect(script([planDir, '--repo', repo, '--worktree']).code).toBe(1);
    expect(check(repo, planDir).code).toBe(0); // HEAD still current
  });

  it('matches the documented digest construction', () => {
    const { repo } = setup();
    const blob = git(repo, 'rev-parse', 'HEAD:src/covered.ts');
    const crypto = require('node:crypto') as typeof import('node:crypto');
    const expected = `sha256:${crypto.createHash('sha256').update(`src/covered.ts\t${blob}\nsrc/zzz.ts\tmissing\n`).digest('hex')}`;
    expect(digest(repo, ['src/zzz.ts', 'src/covered.ts'])).toBe(expected);
  });

  it('reports current evidence, stays current for uncovered changes, and goes stale for covered changes', () => {
    const { repo, planDir } = setup();
    const covered = ['src/covered.ts'];
    writeLog(planDir, [{
      taskId: 'remediation-foo.md#R1',
      status: 'done',
      buildEvidence: build({ coveredPaths: covered, pathsDigest: digest(repo, covered) }),
    }]);

    let result = check(repo, planDir);
    expect(result.code).toBe(0);
    expect(result.report).toMatchObject({
      generated_by: 'scripts/check-evidence-currency.sh',
      rev: 'HEAD',
      checked: 1,
      current: 1,
      stale: [],
      revisionBound: 0,
    });

    fs.writeFileSync(path.join(repo, 'src', 'other.ts'), 'export const b = 2;\n');
    commit(repo, 'touch uncovered file');
    result = check(repo, planDir);
    expect(result.code).toBe(0);
    expect(result.report.current).toBe(1);

    fs.writeFileSync(path.join(repo, 'src', 'covered.ts'), 'export const a = 2;\n');
    commit(repo, 'touch covered file');
    result = check(repo, planDir);
    expect(result.code).toBe(1);
    expect(result.report.stale).toEqual([
      { taskId: 'remediation-foo.md#R1', candidatePaths: ['src/covered.ts'] },
    ]);
    expect(result.report.current).toBe(0);
    expect(result.out).toContain('remediation-foo.md#R1');

    // The older revision still verifies.
    const older = script([planDir, '--repo', repo, '--rev', 'HEAD~2']);
    expect(older.code).toBe(0);
  });

  it('counts records without coveredPaths as revisionBound', () => {
    const { repo, planDir } = setup();
    writeLog(planDir, [
      { taskId: 'remediation-foo.md#R1', status: 'done', buildEvidence: build({ sourceRevision: 'abc123' }) },
      { taskId: 'remediation-foo.md#R2', status: 'done' },
    ]);
    const result = check(repo, planDir);
    expect(result.code).toBe(0);
    expect(result.report).toMatchObject({ checked: 0, current: 0, stale: [], revisionBound: 2 });
  });

  it('checks only the authoritative (last) record of a follow-up chain', () => {
    const { repo, planDir } = setup();
    const covered = ['src/covered.ts'];
    const goodDigest = digest(repo, covered);
    writeLog(planDir, [
      {
        taskId: 'remediation-foo.md#R1',
        status: 'done',
        buildEvidence: build({ coveredPaths: covered, pathsDigest: `sha256:${'0'.repeat(64)}` }),
      },
      {
        taskId: 'remediation-foo.md#R1',
        followUp: true,
        status: 'done',
        buildEvidence: build({ coveredPaths: covered, pathsDigest: goodDigest }),
      },
    ]);
    const result = check(repo, planDir);
    expect(result.code).toBe(0);
    expect(result.report).toMatchObject({ checked: 1, current: 1, stale: [] });
  });

  it('exits 2 on missing inputs, bad revisions, and usage errors', () => {
    const { repo, planDir } = setup();
    expect(script([planDir, '--repo', repo]).code).toBe(2); // no execution-log.md
    expect(script([path.join(planDir, 'nope'), '--repo', repo]).code).toBe(2);
    writeLog(planDir, []);
    expect(script([planDir, '--repo', repo, '--rev', 'no-such-rev']).code).toBe(2);
    expect(script(['--bogus']).code).toBe(2);
    expect(script(['--digest', '--repo', repo]).code).toBe(2);
    expect(script([planDir, 'extra', '--repo', repo]).code).toBe(2);
  });
});
