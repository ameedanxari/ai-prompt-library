import storage from '../../scripts/lib/task-contract.cjs';
import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'select-impacted-tests.sh');

const dirs: string[] = [];

function git(repo: string, ...args: string[]): void {
  execFileSync('git', ['-C', repo, ...args], { stdio: 'pipe' });
}

function write(repo: string, rel: string, content: string): void {
  const full = path.join(repo, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content);
}

function commit(repo: string, message: string): void {
  git(repo, 'add', '-A');
  git(repo, '-c', 'user.name=t', '-c', 'user.email=t@example.com', 'commit', '-q', '-m', message);
}

/** Temp git repo with a contract and one baseline commit. */
function fixture(): { repo: string; plan: string } {
  const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'impacted-tests-'));
  dirs.push(repo);
  git(repo, 'init', '-q');
  const plan = path.join(repo, 'prompts', 'outputs', 'current');
  const unit = (id: string, file: string[], test: string) => ({
    id,
    canonicalId: `remediation-a.md#${id}`,
    file: 'remediation-a.md',
    filePaths: file,
    test,
  });
  write(repo, 'prompts/outputs/current/task-contract.json', JSON.stringify({
    units: [
      unit('R1', ['src/a.ts'], 'npm test -- a'),
      unit('R2', ['src/b.ts'], 'npm test -- b'),
      unit('R3', ['src/shared.ts'], 'npm test -- a'),
      unit('R4', ['src/shared.ts'], 'npm run typecheck'),
      unit('R5', ['src/untested.ts'], ''),
      unit('R6', ['src/c.ts'], 'npx vitest run tests/c.test.ts'),
    ],
  }));
  write(repo, 'src/a.ts', 'a0');
  write(repo, 'src/b.ts', 'b0');
  write(repo, 'src/shared.ts', 's0');
  write(repo, 'src/unclaimed.ts', 'u0');
  write(repo, 'src/untested.ts', 'x0');
  write(repo, 'tests/c.test.ts', 'c0');
  write(repo, 'tests/other.test.ts', 'o0');
  write(repo, 'README.md', 'r0');
  commit(repo, 'base');
  return { repo, plan };
}

function run(args: string[]): { code: number; out: string; err: string } {
  const result = spawnSync('/bin/bash', [SCRIPT, ...args], { encoding: 'utf8' });
  return { code: result.status ?? -1, out: result.stdout, err: result.stderr };
}

afterEach(() => {
  while (dirs.length) fs.rmSync(dirs.pop()!, { recursive: true, force: true });
});

describe('select-impacted-tests.sh', () => {
  it('maps changed paths from a sharded contract', () => {
    const { repo, plan } = fixture();
    const filename = path.join(plan, 'task-contract.json');
    const value = JSON.parse(fs.readFileSync(filename, 'utf8'));
    value.padding = 'x'.repeat(6000);
    storage.writeTaskContract(filename, value, { maxBytes: 4096 });
    write(repo, 'src/a.ts', 'a1');
    commit(repo, 'change');
    const result = run([plan]);
    expect(result.code).toBe(0);
    expect(result.out.trim()).toBe('npm test -- a');
  });
  it('maps changed paths to unique declared test commands in a stable order', () => {
    const { repo, plan } = fixture();
    write(repo, 'src/b.ts', 'b1');
    write(repo, 'src/a.ts', 'a1');
    write(repo, 'src/shared.ts', 's1');
    commit(repo, 'change');
    const { code, out, err } = run([plan]);
    expect(code).toBe(0);
    expect(out.trim().split('\n')).toEqual([
      'npm test -- a',
      'npm test -- b',
      'npm run typecheck',
    ]);
    expect(err).toBe('');
  });

  it('reports unmapped paths on stderr and keeps stdout to commands', () => {
    const { repo, plan } = fixture();
    write(repo, 'src/a.ts', 'a1');
    write(repo, 'src/unclaimed.ts', 'u1');
    commit(repo, 'change');
    const { code, out, err } = run([plan]);
    expect(code).toBe(0);
    expect(out.trim()).toBe('npm test -- a');
    expect(err).toContain('src/unclaimed.ts');
  });

  it('prints no tests impacted when only docs or planning output changed', () => {
    const { repo, plan } = fixture();
    write(repo, 'README.md', 'r1');
    write(repo, 'prompts/outputs/current/execution-log.md', 'log');
    write(repo, 'prompts/outputs/current/readiness.json', '{}');
    commit(repo, 'docs');
    const { code, out, err } = run([plan]);
    expect(code).toBe(0);
    expect(out.trim()).toBe('no tests impacted');
    expect(err).toBe('');
  });

  it('honours --base and --head', () => {
    const { repo, plan } = fixture();
    write(repo, 'src/a.ts', 'a1');
    commit(repo, 'one');
    write(repo, 'src/b.ts', 'b1');
    commit(repo, 'two');
    const wide = run([plan, '--base', 'HEAD~2', '--head', 'HEAD']);
    expect(wide.out.trim().split('\n')).toEqual(['npm test -- a', 'npm test -- b']);
    const narrow = run([plan, '--base', 'HEAD~2', '--head', 'HEAD~1']);
    expect(narrow.out.trim()).toBe('npm test -- a');
  });

  it('includes uncommitted and untracked changes only with --worktree', () => {
    const { repo, plan } = fixture();
    write(repo, 'README.md', 'r1');
    commit(repo, 'docs');
    write(repo, 'src/b.ts', 'b-dirty');
    write(repo, 'src/new-file.ts', 'untracked');
    expect(run([plan]).out.trim()).toBe('no tests impacted');
    const wt = run([plan, '--worktree']);
    expect(wt.code).toBe(0);
    expect(wt.out.trim()).toBe('npm test -- b');
    expect(wt.err).toContain('src/new-file.ts');
  });

  it('--json prints changed paths, impacted units, commands and unmapped paths', () => {
    const { repo, plan } = fixture();
    write(repo, 'src/a.ts', 'a1');
    write(repo, 'src/unclaimed.ts', 'u1');
    commit(repo, 'change');
    const { code, out } = run([plan, '--json']);
    expect(code).toBe(0);
    const parsed = JSON.parse(out);
    expect(parsed.changedPaths).toEqual(['src/a.ts', 'src/unclaimed.ts']);
    expect(parsed.impactedUnits).toEqual([
      { taskId: 'remediation-a.md#R1', file: 'src/a.ts', test: 'npm test -- a' },
    ]);
    expect(parsed.commands).toEqual(['npm test -- a']);
    expect(parsed.unmappedPaths).toEqual(['src/unclaimed.ts']);
  });

  it('maps a changed test file named verbatim in a unit test command to that command', () => {
    const { repo, plan } = fixture();
    write(repo, 'tests/c.test.ts', 'c1');
    commit(repo, 'change');
    const { code, out, err } = run([plan, '--json']);
    expect(code).toBe(0);
    const parsed = JSON.parse(out);
    expect(parsed.commands).toEqual(['npx vitest run tests/c.test.ts']);
    expect(parsed.impactedUnits).toEqual([
      { taskId: 'remediation-a.md#R6', file: 'tests/c.test.ts', test: 'npx vitest run tests/c.test.ts' },
    ]);
    expect(parsed.changedTests).toEqual([]);
    expect(parsed.unmappedPaths).toEqual([]);
    expect(err).toBe('');
  });

  it('does not treat a longer path as a verbatim match', () => {
    const { repo, plan } = fixture();
    write(repo, 'tests/sub/c.test.ts', 'new');
    commit(repo, 'change');
    const parsed = JSON.parse(run([plan, '--json']).out);
    expect(parsed.commands).toEqual([]);
    expect(parsed.changedTests).toEqual(['tests/sub/c.test.ts']);
  });

  it('lists unclaimed test files as changedTests with a run-directly note', () => {
    const { repo, plan } = fixture();
    write(repo, 'tests/other.test.ts', 'o1');
    write(repo, 'pkg/test_thing.py', 'p');
    write(repo, 'pkg/thing_test.go', 'g');
    write(repo, 'pkg/widget.spec.tsx', 'w');
    write(repo, 'src/unclaimed.ts', 'u1');
    commit(repo, 'change');
    const plain = run([plan]);
    expect(plain.code).toBe(0);
    expect(plain.out).toBe('');
    for (const f of ['tests/other.test.ts', 'pkg/test_thing.py', 'pkg/thing_test.go', 'pkg/widget.spec.tsx']) {
      expect(plain.err).toContain(`run directly: ${f}`);
    }
    const parsed = JSON.parse(run([plan, '--json']).out);
    expect(parsed.changedTests).toEqual([
      'pkg/test_thing.py',
      'pkg/thing_test.go',
      'pkg/widget.spec.tsx',
      'tests/other.test.ts',
    ]);
    expect(parsed.unmappedPaths).toEqual(['src/unclaimed.ts']);
  });

  it('reports claimed paths whose unit declares no test as untestedUnits', () => {
    const { repo, plan } = fixture();
    write(repo, 'src/untested.ts', 'x1');
    commit(repo, 'change');
    const plain = run([plan]);
    expect(plain.out).toBe('');
    expect(plain.err).toContain('remediation-a.md#R5 claims src/untested.ts but declares no test');
    const parsed = JSON.parse(run([plan, '--json']).out);
    expect(parsed.untestedUnits).toEqual([{ taskId: 'remediation-a.md#R5', file: 'src/untested.ts' }]);
    expect(parsed.impactedUnits).toEqual([]);
    expect(parsed.unmappedPaths).toEqual([]);
  });

  it('exits 2 on usage errors, a missing contract and a non-repo directory', () => {
    const { plan } = fixture();
    expect(run([plan, '--bogus']).code).toBe(2);
    expect(run([plan, '--base']).code).toBe(2);
    expect(run([plan, 'extra-dir']).code).toBe(2);
    const empty = fs.mkdtempSync(path.join(os.tmpdir(), 'impacted-tests-empty-'));
    dirs.push(empty);
    const missing = run([empty]);
    expect(missing.code).toBe(2);
    expect(missing.err).toContain('task contract not found');
  });

  it('exits 2 when git cannot resolve the revisions', () => {
    const { plan } = fixture();
    const { code, err } = run([plan, '--base', 'no-such-rev']);
    expect(code).toBe(2);
    expect(err).toContain('git');
  });
});
