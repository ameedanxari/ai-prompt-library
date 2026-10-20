import { afterEach, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'rotate-execution-log.sh');
const SLICE = path.join(REPO_ROOT, 'scripts', 'execution-log-slice.sh');

const roots: string[] = [];

afterEach(() => {
  while (roots.length) fs.rmSync(roots.pop()!, { recursive: true, force: true });
});

function fence(...taskIds: string[]): string {
  const records = taskIds.map((taskId) => ({ taskId, status: 'done', filler: 'x'.repeat(80) }));
  return '```execution-status-record\n' + JSON.stringify(records.length === 1 ? records[0] : records, null, 2) + '\n```';
}

function section(prompt: string, status = 'done', unit = 'T1'): string {
  return [`### \`${prompt}\` — ${status}`, `- **Test result:** pass`, fence(`${prompt}#${unit}`), ''].join('\n');
}

interface Fixture {
  root: string;
  current: string;
  logPath: string;
}

type Entry = string | [prompt: string, status: string];

/** Sections are written in order; the record in position n (1-based) has unit id `T<n>`. */
function fixture(options: {
  sections?: Entry[];
  nextTask?: string;
  blocked?: string;
  extraFrontmatter?: string[];
  extraBody?: string[];
} = {}): Fixture {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rotate-log-'));
  roots.push(root);
  const current = path.join(root, 'prompts', 'outputs', 'current');
  fs.mkdirSync(current, { recursive: true });
  const entries = options.sections ?? ['tasks-a.md', 'tasks-a.md', 'tasks-b.md', 'tasks-b.md'];
  const log = [
    '---',
    'session_id: abc',
    `next_task: ${options.nextTask ?? 'null'}`,
    `blocked_tasks: ${options.blocked ?? '[]'}`,
    'failed_tasks: []',
    'deferred_tasks: []',
    ...(options.extraFrontmatter ?? []),
    '---',
    '',
    '# Execution Log',
    '',
    ...entries.map((entry, index) => {
      const [prompt, status] = typeof entry === 'string' ? [entry, 'done'] : entry;
      return section(prompt, status, `T${index + 1}`);
    }),
    ...(options.extraBody ?? []),
  ].join('\n');
  const logPath = path.join(current, 'execution-log.md');
  fs.writeFileSync(logPath, log);
  return { root, current, logPath };
}

function run(args: string[]): { code: number; out: string; err: string } {
  const result = spawnSync('/bin/bash', [SCRIPT, ...args], { encoding: 'utf8' });
  return { code: result.status ?? -1, out: result.stdout, err: result.stderr };
}

const headers = (text: string): string[] =>
  [...text.matchAll(/^### `([^`]+)`/gm)].map((match) => match[1]!);

describe('rotate-execution-log.sh', () => {
  it('is executable', () => {
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('does nothing when the log is under the limit', () => {
    const fx = fixture();
    const before = fs.readFileSync(fx.logPath, 'utf8');
    const result = run([fx.current]);
    expect(result.code).toBe(0);
    expect(result.out).toMatch(/execution log: \d+ bytes, no rotation needed/);
    expect(fs.readFileSync(fx.logPath, 'utf8')).toBe(before);
    expect(fs.existsSync(path.join(fx.root, 'prompts', 'outputs', 'archive'))).toBe(false);
  });

  it('moves superseded and settled done sections but keeps the last --keep done ones', () => {
    const fx = fixture({ sections: ['tasks-a.md', 'tasks-a.md', 'tasks-b.md', 'tasks-b.md', 'tasks-c.md', 'tasks-c.md'] });
    const before = fs.readFileSync(fx.logPath, 'utf8');
    const result = run([fx.current, '--max-bytes', '100', '--keep', '1']);
    expect(result.code).toBe(0);

    // c2 is the single kept done section; every other section is superseded or settled.
    const archivePath = path.join(fx.root, 'prompts', 'outputs', 'archive', 'execution-log-001.md');
    const archive = fs.readFileSync(archivePath, 'utf8');
    expect(archive).toMatch(/^---\narchived_from: execution-log\.md\narchived_at: \d{4}-\d{2}-\d{2}T[\d:]+Z\nsections: 5\n---\n/);
    expect(headers(archive)).toEqual(['tasks-a.md', 'tasks-a.md', 'tasks-b.md', 'tasks-b.md', 'tasks-c.md']);
    expect(archive).toContain('tasks-a.md#T1');
    expect(archive).toContain('tasks-c.md#T5');

    const after = fs.readFileSync(fx.logPath, 'utf8');
    expect(headers(after)).toEqual(['tasks-c.md']);
    expect(after).toContain('tasks-c.md#T6');
    expect(after).not.toContain('tasks-a.md#T1');
    expect(after).toContain('journal_archives:\n  - prompts/outputs/archive/execution-log-001.md\n---');
    expect(after).toContain('## Archived entries');
    expect(after).toContain('- `tasks-a.md` — done → prompts/outputs/archive/execution-log-001.md');
    expect(after).toContain('- `tasks-c.md` — done → prompts/outputs/archive/execution-log-001.md');
    expect(before).toContain(section('tasks-a.md', 'done', 'T1'));
    expect(archive).toContain(section('tasks-a.md', 'done', 'T1'));
    expect(archive).toContain(section('tasks-b.md', 'done', 'T4'));
    expect(result.out).toMatch(/moved 5 section\(s\); log \d+ -> \d+ bytes; archive prompts\/outputs\/archive\/execution-log-001\.md/);
  });

  it('moves a lone done section unless it is kept or is next_task', () => {
    const fx = fixture({ sections: ['tasks-a.md', 'tasks-b.md', 'tasks-c.md', ['tasks-d.md', 'blocked']], nextTask: 'tasks-b.md' });
    expect(run([fx.current, '--max-bytes', '100', '--keep', '1']).code).toBe(0);
    // a moves (settled); b is next_task; c is the one kept done section; d is a lone blocked section.
    expect(headers(fs.readFileSync(fx.logPath, 'utf8'))).toEqual(['tasks-b.md', 'tasks-c.md', 'tasks-d.md']);
    const archive = fs.readFileSync(path.join(fx.root, 'prompts', 'outputs', 'archive', 'execution-log-001.md'), 'utf8');
    expect(headers(archive)).toEqual(['tasks-a.md']);
  });

  it('moves earlier sections of any status and keeps the latest one', () => {
    const fx = fixture({
      sections: [['tasks-a.md', 'done'], ['tasks-a.md', 'blocked'], ['tasks-a.md', 'blocked']],
      blocked: '[tasks-a.md#T3]',
    });
    const result = run([fx.current, '--max-bytes', '100', '--keep', '0']);
    expect(result.code).toBe(0);
    const archive = fs.readFileSync(path.join(fx.root, 'prompts', 'outputs', 'archive', 'execution-log-001.md'), 'utf8');
    expect([...archive.matchAll(/^### `[^`]+` — (\w+)/gm)].map((match) => match[1])).toEqual(['done', 'blocked']);
    expect(archive).toContain('tasks-a.md#T1');
    expect(archive).toContain('tasks-a.md#T2');
    const after = fs.readFileSync(fx.logPath, 'utf8');
    expect(headers(after)).toEqual(['tasks-a.md']);
    expect(after).toContain('tasks-a.md#T3');
    expect(after).not.toContain('tasks-a.md#T2');
    expect(after).toContain('- `tasks-a.md` — done → prompts/outputs/archive/execution-log-001.md');
    expect(after).toContain('- `tasks-a.md` — blocked → prompts/outputs/archive/execution-log-001.md');
  });

  it('never moves the only section of a prompt, whatever its status or next_task', () => {
    const fx = fixture({
      sections: [['tasks-a.md', 'blocked'], ['tasks-b.md', 'done'], ['tasks-c.md', 'failed'], ['tasks-d.md', 'deferred']],
      nextTask: 'tasks-b.md',
      blocked: '[tasks-a.md#T1]',
    });
    const before = fs.readFileSync(fx.logPath, 'utf8');
    const result = run([fx.current, '--max-bytes', '100', '--keep', '0']);
    expect(result.code).toBe(1);
    expect(fs.readFileSync(fx.logPath, 'utf8')).toBe(before);
    expect(fs.existsSync(path.join(fx.root, 'prompts', 'outputs', 'archive'))).toBe(false);
  });

  it('keeps the latest section of next_task and blocked prompts but archives their history', () => {
    const fx = fixture({
      sections: [['tasks-a.md', 'done'], ['tasks-a.md', 'done'], ['tasks-b.md', 'blocked'], ['tasks-b.md', 'blocked']],
      nextTask: 'tasks-a.md',
      blocked: '[tasks-b.md]',
    });
    expect(run([fx.current, '--max-bytes', '100', '--keep', '0']).code).toBe(0);
    expect(headers(fs.readFileSync(fx.logPath, 'utf8'))).toEqual(['tasks-a.md', 'tasks-b.md']);
    const archive = fs.readFileSync(path.join(fx.root, 'prompts', 'outputs', 'archive', 'execution-log-001.md'), 'utf8');
    expect(archive).toContain('tasks-a.md#T1');
    expect(archive).toContain('tasks-b.md#T3');
  });

  it('exits 1 when over the limit but nothing is eligible', () => {
    const lone = fixture({ sections: [['tasks-a.md', 'blocked'], ['tasks-b.md', 'failed'], ['tasks-c.md', 'deferred'], 'tasks-d.md'] });
    expect(run([lone.current, '--max-bytes', '100', '--keep', '1']).code).toBe(1);
    expect(fs.existsSync(path.join(lone.root, 'prompts', 'outputs', 'archive'))).toBe(false);
    const kept = fixture({ sections: ['tasks-a.md', 'tasks-b.md'] });
    expect(run([kept.current, '--max-bytes', '100', '--keep', '10']).code).toBe(1);
  });

  it('exits 2 on usage and precondition errors', () => {
    expect(run(['/nonexistent-dir-for-rotate']).code).toBe(2);
    const fx = fixture();
    expect(run([fx.current, '--bogus']).code).toBe(2);
    expect(run([fx.current, '--keep', 'abc']).code).toBe(2);
    fs.rmSync(fx.logPath);
    expect(run([fx.current]).code).toBe(2);
  });

  it('appends to an existing journal_archives list and writes execution-log-002.md on a second rotation', () => {
    const fx = fixture({ sections: ['tasks-a.md', 'tasks-a.md', 'tasks-b.md', 'tasks-b.md'] });
    expect(run([fx.current, '--max-bytes', '100', '--keep', '0']).code).toBe(0);
    fs.appendFileSync(fx.logPath, '\n' + section('tasks-a.md', 'done', 'T7') + '\n' + section('tasks-b.md', 'blocked', 'T8'));
    const second = run([fx.current, '--max-bytes', '100', '--keep', '0']);
    expect(second.code).toBe(0);

    const archiveDir = path.join(fx.root, 'prompts', 'outputs', 'archive');
    expect(fs.readdirSync(archiveDir).sort()).toEqual(['execution-log-001.md', 'execution-log-002.md']);
    const second002 = fs.readFileSync(path.join(archiveDir, 'execution-log-002.md'), 'utf8');
    expect(second002).toContain('tasks-a.md#T7');
    expect(second002).not.toContain('tasks-b.md#T8');

    const after = fs.readFileSync(fx.logPath, 'utf8');
    expect(after).toContain(
      'journal_archives:\n  - prompts/outputs/archive/execution-log-001.md\n  - prompts/outputs/archive/execution-log-002.md\n---',
    );
    expect(after.match(/^## Archived entries$/gm)).toHaveLength(1);
    const index = after.slice(after.indexOf('## Archived entries'));
    expect(index).toContain('- `tasks-a.md` — done → prompts/outputs/archive/execution-log-001.md');
    expect(index).toContain('- `tasks-a.md` — done → prompts/outputs/archive/execution-log-002.md');
    expect(after).toContain('tasks-b.md#T8');
    expect(after).not.toContain('tasks-a.md#T7');
  });

  it('dry-run reports the plan and writes nothing', () => {
    const fx = fixture();
    const before = fs.readFileSync(fx.logPath, 'utf8');
    const result = run([fx.current, '--max-bytes', '100', '--keep', '0', '--dry-run']);
    expect(result.code).toBe(0);
    expect(result.out).toContain('would move 4 section(s)');
    expect(result.out).toContain('`tasks-a.md` — done');
    expect(fs.readFileSync(fx.logPath, 'utf8')).toBe(before);
    expect(fs.existsSync(path.join(fx.root, 'prompts', 'outputs', 'archive'))).toBe(false);
  });

  it('moves an outside-section record fence only when every record in it is superseded later', () => {
    const outside = (...fences: string[]) => ['', '## Canonical task-unit records', '', ...fences.flatMap((f) => [f, ''])];
    // Fence 1 holds x and y; a later fence supersedes x only.
    const partial = fixture({
      extraBody: outside(fence('tasks-x.md#T9', 'tasks-y.md#T9'), fence('tasks-x.md#T9')),
    });
    expect(run([partial.current, '--max-bytes', '100', '--keep', '0']).code).toBe(0);
    const partialAfter = fs.readFileSync(partial.logPath, 'utf8');
    expect(partialAfter.match(/tasks-x\.md#T9/g)).toHaveLength(2);
    expect(partialAfter).toContain('tasks-y.md#T9');

    // Both fences: fence 1 fully superseded by fence 2 (x) and fence 3 (y).
    const full = fixture({
      extraBody: outside(fence('tasks-x.md#T9', 'tasks-y.md#T9'), fence('tasks-x.md#T9'), fence('tasks-y.md#T9')),
    });
    expect(run([full.current, '--max-bytes', '100', '--keep', '0']).code).toBe(0);
    const fullAfter = fs.readFileSync(full.logPath, 'utf8');
    const fullArchive = fs.readFileSync(path.join(full.root, 'prompts', 'outputs', 'archive', 'execution-log-001.md'), 'utf8');
    expect(fullArchive).toContain('tasks-x.md#T9');
    expect(fullArchive).toContain('tasks-y.md#T9');
    expect(fullAfter.match(/tasks-x\.md#T9/g)).toHaveLength(1);
    expect(fullAfter.match(/tasks-y\.md#T9/g)).toHaveLength(1);
  });

  it('does not move a section that would reverse "last record wins" for a task', () => {
    // tasks-p (lone blocked section, stays) precedes tasks-r's first section and shares a taskId with it,
    // so neither r section may move ahead of it.
    const fx = fixture({ sections: [['tasks-p.md', 'blocked'], 'tasks-r.md', 'tasks-r.md'] });
    fs.writeFileSync(fx.logPath, fs.readFileSync(fx.logPath, 'utf8').replace('tasks-r.md#T2', 'tasks-p.md#T1'));
    expect(run([fx.current, '--max-bytes', '100', '--keep', '0']).code).toBe(1);
  });

  it('leaves the archived log readable through execution-log-slice.sh', () => {
    const fx = fixture();
    expect(run([fx.current, '--max-bytes', '100', '--keep', '0']).code).toBe(0);
    const slice = spawnSync('/bin/bash', [SLICE, fx.current, 'tasks-a.md'], { encoding: 'utf8' });
    expect(slice.status).toBe(0);
    expect(slice.stdout).toContain('tasks-a.md#T1');
    expect(slice.stdout).toContain('tasks-a.md#T2');
    expect(slice.stdout).toContain('journal_archives:');
  });
});
