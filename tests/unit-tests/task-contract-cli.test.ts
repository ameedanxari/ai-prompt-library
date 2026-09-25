/**
 * CLI exit-code and --help tests (item 16).
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import {
  TaskContractError,
  TaskContractInputError,
  TaskContractUsageError,
  toTaskContractError,
} from '../../src/task-contract/errors.js';

const TASK_CONTRACT_CLI = join('dist', 'task-contract', 'cli.js');
const REVIEW_CLI = join('dist', 'review', 'cli.js');

function run(cli: string, args: string[]): { code: number; out: string } {
  try {
    const out = execFileSync('node', [cli, ...args], { encoding: 'utf8' });
    return { code: 0, out };
  } catch (error: any) {
    return { code: error.status ?? 1, out: `${error.stdout ?? ''}${error.stderr ?? ''}` };
  }
}

describe('item 16: task-contract error hierarchy', () => {
  it('maps error classes to the documented exit codes', () => {
    expect(new TaskContractError('x').exitCode).toBe(1);
    expect(new TaskContractUsageError('x').exitCode).toBe(2);
    expect(new TaskContractInputError('x').exitCode).toBe(3);
  });

  it('wraps unknown failures as internal errors', () => {
    const wrapped = toTaskContractError(new Error('boom'));
    expect(wrapped).toBeInstanceOf(TaskContractError);
    expect(wrapped.exitCode).toBe(1);
    expect(toTaskContractError(new TaskContractUsageError('u'))).toBeInstanceOf(TaskContractUsageError);
  });
});

describe('item 16: task-contract CLI', () => {
  it('--help exits 0 and documents the exit-code table', () => {
    const result = run(TASK_CONTRACT_CLI, ['--help']);
    expect(result.code).toBe(0);
    expect(result.out).toMatch(/Exit codes:/);
    expect(result.out).toMatch(/0  report written/);
  });

  it('exits 2 when no task files exist', () => {
    const dir = mkdtempSync(join(tmpdir(), 'contract-cli-'));
    try {
      const result = run(TASK_CONTRACT_CLI, [dir]);
      expect(result.code).toBe(2);
      expect(result.out).toMatch(/no tasks-\*\.md or remediation-\*\.md/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('exits 0 even when the written report is blocked', () => {
    const dir = mkdtempSync(join(tmpdir(), 'contract-cli-'));
    try {
      writeFileSync(join(dir, 'tasks-001.md'), '# T1\n\nNo metadata here.\n');
      const result = run(TASK_CONTRACT_CLI, [dir, join(dir, 'out.json')]);
      expect(result.code).toBe(0);
      expect(result.out).toMatch(/task contract written/);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('item 16: review CLI', () => {
  it('--help exits 0 and documents the exit-code table', () => {
    const result = run(REVIEW_CLI, ['--help']);
    expect(result.code).toBe(0);
    expect(result.out).toMatch(/Exit codes:/);
  });

  it('exits 2 when required arguments are missing', () => {
    const result = run(REVIEW_CLI, []);
    expect(result.code).toBe(2);
    expect(result.out).toMatch(/usage: semantic-review-cli/);
  });
});
