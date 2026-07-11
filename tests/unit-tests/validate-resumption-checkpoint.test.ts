import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'validate-resumption-checkpoint.sh');

function run(target: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${SCRIPT}" "${target}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function makeOutputDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'checkpoint-'));
}

function writeFile(dir: string, filename: string, content = '# artifact\n') {
  fs.writeFileSync(path.join(dir, filename), content, 'utf8');
}

function writeCheckpoint(dir: string, lines: string[]) {
  fs.writeFileSync(path.join(dir, 'resumption-checkpoint.md'), `${lines.join('\n')}\n`, 'utf8');
}

describe('validate-resumption-checkpoint.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('accepts a valid planning checkpoint by output directory', () => {
    const dir = makeOutputDir();
    try {
      writeFile(dir, 'epics.md');
      writeFile(dir, 'brief-keywords.md');
      writeCheckpoint(dir, [
        '---',
        'phase: planning',
        'engine: drill-down',
        'step: "Step 1 — Seed"',
        'last_completed: "epics.md"',
        'next_action: "Expand epics into features (Step 2)"',
        're_load_files:',
        '  - prompts/outputs/current/epics.md',
        '  - prompts/outputs/current/brief-keywords.md',
        'updated_at: 2026-05-30T20:00:00Z',
        '---',
      ]);

      const result = run(dir);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/resumption checkpoint valid/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('accepts a final execution checkpoint with only execution-log reload', () => {
    const dir = makeOutputDir();
    try {
      writeFile(dir, 'execution-log.md');
      writeCheckpoint(dir, [
        '---',
        'phase: execution',
        'engine: executor',
        'step: "Task 4 of 4"',
        'last_completed: "tasks-final.md"',
        'next_action: "Run honest-handoff gate"',
        're_load_files:',
        '  - prompts/outputs/current/execution-log.md',
        'updated_at: 2026-05-30T20:00:00Z',
        '---',
      ]);

      const result = run(path.join(dir, 'resumption-checkpoint.md'));

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/resumption checkpoint valid/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('accepts a semantic-review checkpoint with the trusted orchestrator', () => {
    const dir = makeOutputDir();
    try {
      writeFile(dir, 'execution-log.md');
      writeCheckpoint(dir, [
        '---',
        'phase: execution',
        'engine: executor',
        'step: "Semantic review"',
        'last_completed: "tasks-final.md"',
        'next_action: "Run semantic review and validation"',
        're_load_files:',
        '  - prompts/outputs/current/execution-log.md',
        '  - prompts/orchestrators/semantic-review-and-validation.md',
        'updated_at: 2026-05-30T20:00:00Z',
        '---',
      ]);

      const result = run(dir);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/resumption checkpoint valid/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects a semantic-review checkpoint without the trusted orchestrator', () => {
    const dir = makeOutputDir();
    try {
      writeFile(dir, 'execution-log.md');
      writeCheckpoint(dir, [
        '---',
        'phase: execution',
        'engine: executor',
        'step: "Semantic review"',
        'last_completed: "tasks-final.md"',
        'next_action: "Run semantic review and validation"',
        're_load_files:',
        '  - prompts/outputs/current/execution-log.md',
        'updated_at: 2026-05-30T20:00:00Z',
        '---',
      ]);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/trusted semantic-review orchestrator/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects missing required fields and bad timestamps', () => {
    const dir = makeOutputDir();
    try {
      writeFile(dir, 'epics.md');
      writeCheckpoint(dir, [
        '---',
        'phase: planning',
        'engine: drill-down',
        're_load_files:',
        '  - prompts/outputs/current/epics.md',
        'updated_at: <current ISO 8601 timestamp>',
        '---',
      ]);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing required field: step/);
      expect(result.out).toMatch(/updated_at must be an ISO 8601 UTC timestamp/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects placeholder or stale reload files', () => {
    const dir = makeOutputDir();
    try {
      writeCheckpoint(dir, [
        '---',
        'phase: planning',
        'engine: drill-down',
        'step: "Step 3 — Atomize feature"',
        'last_completed: "tasks-last.md"',
        'next_action: "Generate next epic"',
        're_load_files:',
        '  - prompts/outputs/current/tasks-<feature-slug>.md',
        '  - prompts/outputs/current/tasks-missing.md',
        'updated_at: 2026-05-30T20:00:00Z',
        '---',
      ]);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/placeholder/);
      expect(result.out).toMatch(/does not exist on disk/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects non-final execution checkpoints without execution log and next task', () => {
    const dir = makeOutputDir();
    try {
      writeCheckpoint(dir, [
        '---',
        'phase: execution',
        'engine: executor',
        'step: "Task 2 of 4"',
        'last_completed: "tasks-one.md"',
        'next_action: "Execute tasks-two.md"',
        're_load_files:',
        '  - prompts/outputs/current/revise-report.md',
        'updated_at: 2026-05-30T20:00:00Z',
        '---',
      ]);

      const result = run(dir);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/execution-log\.md/);
      expect(result.out).toMatch(/must reload the next task/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
