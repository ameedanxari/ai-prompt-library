import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { createHash } from 'node:crypto';

const SCRIPT = path.resolve(__dirname, '../../scripts/commit-task.sh');
const ENV = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith('GIT_')));
let repo: string;
const git = (...args: string[]) => {
  const result = spawnSync('git', args, { cwd: repo, env: ENV, encoding: 'utf8' });
  if (result.status) throw new Error(result.stderr);
  return result.stdout.trim();
};
function write(file: string, text = file + '\n') {
  fs.mkdirSync(path.dirname(path.join(repo, file)), { recursive: true });
  fs.writeFileSync(path.join(repo, file), text);
}
function task(files: string[], extra = '') {
  write('tasks-feature.md', ['## T1 - Feature', ...files.map(file => `* **File**: \`${file}\``), extra].join('\n'));
}
function run(...args: string[]) {
  const result = spawnSync('bash', [SCRIPT, '--task', 'tasks-feature.md', ...args], {
    cwd: repo, env: ENV, encoding: 'utf8',
  });
  return { code: result.status, out: result.stdout + result.stderr };
}
function state() {
  return { head: git('rev-parse', 'HEAD'), index: git('write-tree'), status: git('status', '--porcelain') };
}

beforeEach(() => {
  repo = fs.mkdtempSync(path.join(os.tmpdir(), 'commit-task-'));
  git('init', '-q');
  git('config', 'user.email', 'test@example.com');
  git('config', 'user.name', 'Test');
  git('config', 'commit.gpgsign', 'false');
  write('README.md', 'initial\n');
  git('add', 'README.md');
  git('commit', '-qm', 'initial');
});
afterEach(() => fs.rmSync(repo, { recursive: true, force: true }));

describe('commit-task real Git integration', () => {
  it('commits every declared source, test, config and asset in one commit using the canonical Markdown parser', () => {
    const files = ['src/app.ts', 'test/app.test.ts', 'config/app.json', 'assets/logo.svg'];
    files.forEach(file => write(file));
    task(files);
    const before = git('rev-list', '--count', 'HEAD');
    expect(run()).toMatchObject({ code: 0 });
    expect(git('show', '--format=', '--name-only', 'HEAD').split('\n')).toEqual([...files].sort());
    expect(Number(git('rev-list', '--count', 'HEAD'))).toBe(Number(before) + 1);
    expect(git('diff', '--cached', '--name-only')).toBe('');
    expect(git('show', 'HEAD:src/app.ts')).toBe('src/app.ts');
  }, 20000);

  it('blocks a named test omitted from File declarations before committing', () => {
    write('src/app.ts'); write('src/app.test.ts');
    task(['src/app.ts'], '- **Test:** `node --test src/app.test.ts`');
    const before = state();
    expect(run()).toMatchObject({ code: 2, out: expect.stringContaining('undeclared test artifact') });
    expect(state()).toEqual(before);
    task(['src/app.ts', 'src/app.test.ts'], '- **Test:** `node --test src/app.test.ts`');
    expect(run().code).toBe(0);
    expect(git('show', '--format=', '--name-only', 'HEAD').split('\n')).toEqual(['src/app.test.ts','src/app.ts']);
  }, 20000);

  it('blocks an unrelated staged file without changing its staged or working content', () => {
    write('src/app.ts');
    task(['src/app.ts']);
    write('README.md', 'staged unrelated\n');
    git('add', 'README.md');
    write('README.md', 'unstaged unrelated\n');
    const before = state();
    expect(run()).toMatchObject({ code: 2, out: expect.stringContaining('unrelated staged paths') });
    expect(state()).toEqual(before);
    expect(git('show', ':README.md')).toBe('staged unrelated');
    expect(fs.readFileSync(path.join(repo, 'README.md'), 'utf8')).toBe('unstaged unrelated\n');
  }, 20000);

  it('detects both sides of a staged rename when its old path is unrelated', () => {
    git('mv', 'README.md', 'renamed.md');
    task(['renamed.md']);
    const before = state();
    expect(run()).toMatchObject({ code: 2, out: expect.stringContaining('README.md') });
    expect(state()).toEqual(before);
  }, 20000);

  it('does not commit unrelated unstaged changes', () => {
    write('src/app.ts');
    task(['src/app.ts']);
    write('README.md', 'unrelated unstaged\n');
    expect(run().code).toBe(0);
    expect(git('show', '--format=', '--name-only')).toBe('src/app.ts');
    expect(git('diff', '--name-only')).toBe('README.md');
  }, 20000);

  it('fails missing required declarations before staging or advancing progress', () => {
    write('src/app.ts');
    task(['src/app.ts', 'test/missing.ts']);
    write('prompts/outputs/current/execution-log.md', 'next_task: T1\n');
    const before = state();
    expect(run()).toMatchObject({ code: 2, out: expect.stringContaining('required declared file is missing') });
    expect(state()).toEqual(before);
    expect(fs.readFileSync(path.join(repo, 'prompts/outputs/current/execution-log.md'), 'utf8')).toBe('next_task: T1\n');
  }, 20000);

  it.each([false, true])('commits a legitimate tracked deletion (already staged: %s)', staged => {
    write('src/deleted.ts');
    git('add', 'src/deleted.ts');
    git('commit', '-qm', 'seed');
    fs.unlinkSync(path.join(repo, 'src/deleted.ts'));
    if (staged) git('add', '-u');
    task(['src/deleted.ts']);
    expect(run().code).toBe(0);
    expect(git('show', '--format=', '--name-status')).toBe('D\tsrc/deleted.ts');
    expect(git('diff', '--cached', '--name-only')).toBe('');
  }, 20000);

  it('preserves the exact original index and progress bytes when a real commit hook fails', () => {
    write('src/app.ts');
    task(['src/app.ts']);
    write('prompts/outputs/current/resumption-checkpoint.md', 'next_task: T1\n');
    write('.git/hooks/pre-commit', '#!/bin/sh\nexit 1\n');
    fs.chmodSync(path.join(repo, '.git/hooks/pre-commit'), 0o755);
    const before = state();
    const indexBefore = fs.readFileSync(path.join(repo, '.git/index'));
    expect(run()).toMatchObject({ code: 2, out: expect.stringContaining('git commit failed') });
    expect(fs.readFileSync(path.join(repo, '.git/index'))).toEqual(indexBefore);
    expect(state()).toEqual(before);
    expect(fs.readFileSync(path.join(repo, 'prompts/outputs/current/resumption-checkpoint.md'), 'utf8')).toBe('next_task: T1\n');
  }, 20000);

  it('requires individual file paths instead of accidentally staging an entire directory', () => {
    write('src/app.ts');
    write('src/unrelated.ts');
    task(['src']);
    const before = state();
    expect(run()).toMatchObject({ code: 2, out: expect.stringContaining('individual files') });
    expect(state()).toEqual(before);
  }, 20000);

  it('selects one multifile unit without requiring deferred packet files', () => {
    write('src/app.ts');
    write('test/app.ts');
    task(['src/app.ts', 'test/app.ts'], '## T2 - Later\n- **File:** `src/later.ts`');
    expect(run('--unit', 'T1').code).toBe(0);
    expect(git('show', '--format=', '--name-only').split('\n')).toEqual(['src/app.ts', 'test/app.ts']);
  }, 20000);

  it('safely recovers after commit before index reconciliation, without duplicating the commit', () => {
    write('src/app.ts');
    task(['src/app.ts']);
    const base = git('rev-parse', 'HEAD');
    const originalTree = git('write-tree');
    const indexBefore = fs.readFileSync(path.join(repo, '.git/index'));
    git('add', 'src/app.ts');
    git('commit', '-qm', 'task already committed');
    const committed = git('rev-parse', 'HEAD');
    const tree = git('rev-parse', 'HEAD^{tree}');
    fs.writeFileSync(path.join(repo, '.git/index'), indexBefore);
    const taskPath = path.join(repo, 'tasks-feature.md');
    const identity = createHash('sha256').update(fs.readFileSync(taskPath)).digest('hex') + ':packet';
    write('.git/ai-prompt-task-commit.json', JSON.stringify({
      base, tree, original_tree: originalTree, task: fs.realpathSync(taskPath), identity, paths: ['src/app.ts'],
    }));
    expect(run()).toMatchObject({ code: 0, out: expect.stringContaining('recovered') });
    expect(git('rev-parse', 'HEAD')).toBe(committed);
    expect(git('diff', '--cached', '--name-only')).toBe('');
    expect(fs.existsSync(path.join(repo, '.git/ai-prompt-task-commit.json'))).toBe(false);
  });

  it('recovers a real process crash in the post-commit hook without repeating the task commit', () => {
    write('src/app.ts');
    task(['src/app.ts']);
    // Hook -> git -> commit driver. Kill only this disposable repository's
    // driver after Git has published the commit, before it reconciles index.
    write('.git/hooks/post-commit', '#!/bin/sh\ndriver=$(ps -o ppid= -p "$PPID" | tr -d " ")\nkill -KILL "$driver"\n');
    fs.chmodSync(path.join(repo, '.git/hooks/post-commit'), 0o755);
    const before = git('rev-parse', 'HEAD');
    expect(run().code).not.toBe(0);
    const committed = git('rev-parse', 'HEAD');
    expect(committed).not.toBe(before);
    expect(fs.existsSync(path.join(repo, '.git/ai-prompt-task-commit.json'))).toBe(true);
    fs.unlinkSync(path.join(repo, '.git/hooks/post-commit'));
    expect(run()).toMatchObject({ code: 0, out: expect.stringContaining('recovered') });
    expect(git('rev-parse', 'HEAD')).toBe(committed);
    expect(git('diff', '--cached', '--name-only')).toBe('');
  }, 20000);

  it('refuses crash recovery when the user stages new work after the crash', () => {
    write('src/app.ts');
    task(['src/app.ts']);
    write('.git/hooks/post-commit', '#!/bin/sh\ndriver=$(ps -o ppid= -p "$PPID" | tr -d " ")\nkill -KILL "$driver"\n');
    fs.chmodSync(path.join(repo, '.git/hooks/post-commit'), 0o755);
    expect(run().code).not.toBe(0);
    fs.unlinkSync(path.join(repo, '.git/hooks/post-commit'));
    write('README.md', 'new user work\n');
    git('add', 'README.md');
    const before = state();
    expect(run()).toMatchObject({ code: 2, out: expect.stringContaining('needs review') });
    expect(state()).toEqual(before);
    expect(git('show', ':README.md')).toBe('new user work');
  }, 20000);

  it('supports the first task in a newly initialized repository with no HEAD', () => {
    fs.rmSync(path.join(repo, '.git'), { recursive: true, force: true });
    git('init', '-q');
    git('config', 'user.email', 'test@example.com');
    git('config', 'user.name', 'Test');
    git('config', 'commit.gpgsign', 'false');
    write('src/app.ts');
    task(['src/app.ts']);
    expect(run()).toMatchObject({ code: 0 });
    expect(git('show', '--format=', '--name-only')).toBe('src/app.ts');
    expect(git('diff', '--cached', '--name-only')).toBe('');
  }, 20000);

  it('clean checkout with unchanged declarations creates no commit', () => {
    task(['README.md']);
    const before = state();
    expect(run()).toMatchObject({ code: 1, out: expect.stringContaining('no staged changes') });
    expect(state()).toEqual(before);
  }, 20000);
});
