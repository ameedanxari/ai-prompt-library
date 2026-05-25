/**
 * Unit tests for scripts/finalize.sh — the one-command finisher for
 * drill-down Step 3. Wraps fix-user-stories.sh + revise.sh and surfaces
 * a clear gate verdict so agents cannot declare "done" without seeing
 * whether executor_gate is pass or fail.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { writeStreamAStubs } from '../test-helpers/stream-a-stubs';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const FINALIZE = path.join(REPO_ROOT, 'scripts', 'finalize.sh');

function run(cmd: string): { out: string; code: number } {
  try {
    return { out: execSync(cmd, { encoding: 'utf8' }), code: 0 };
  } catch (e) {
    const err = e as { stdout?: Buffer; status?: number };
    return {
      out: err.stdout?.toString() ?? '',
      code: err.status ?? 0,
    };
  }
}

describe('finalize.sh', () => {
  it('exits 0 and writes a pass revise-report.md on a clean plan', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-auth.md'),
        '# Features — Auth\n\n## Sign up\nx\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-sign-up.md'),
        [
          '## T1 · x',
          '- **Closes user story:** As a user, I want x, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/a.ts`',
          '- **Depends on:** none',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          '- **Estimated LOC:** ~10',
          '- **Phase:** mvp',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      writeStreamAStubs(sandbox);
      const { out, code } = run(`bash "${FINALIZE}" "${sandbox}"`);
      expect(code).toBe(0);
      expect(out).toMatch(/executor_gate: pass/);
      // The canonical revise-report.md exists and is fresh.
      const report = fs.readFileSync(path.join(sandbox, 'revise-report.md'), 'utf8');
      expect(report.split('\n')[0]).toBe('---');
      expect(report).toMatch(/executor_gate: pass/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('auto-fixes the missing-comma user-story pattern before the gate runs', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-fix-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-x.md'),
        '# Features — X\n\n## sign up\nx\n',
      );
      // Missing comma before "so that" — the auto-fixer should repair this.
      fs.writeFileSync(
        path.join(sandbox, 'tasks-sign-up.md'),
        [
          '## T1 · sign up',
          '- **Closes user story:** As a user, I want to sign up so that I can log in.',
          '- **Change type:** create-new',
          '- **File:** `src/signup.ts`',
          '- **Depends on:** none',
          '- **Precise change:** add signup().',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/signup.test.ts`',
          '- **Estimated LOC:** ~10',
          '- **Phase:** mvp',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      writeStreamAStubs(sandbox);
      const { out, code } = run(`bash "${FINALIZE}" "${sandbox}"`);
      expect(code).toBe(0);
      expect(out).toMatch(/executor_gate: pass/);
      // Verify the mechanical fix was applied.
      const taskFile = fs.readFileSync(
        path.join(sandbox, 'tasks-sign-up.md'),
        'utf8',
      );
      expect(taskFile).toMatch(/I want to sign up, so that I can log in/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('exits non-zero on a failing plan and directs the agent back to the report', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-fail-'));
    try {
      // Feature without a tasks file → coverage gap → gate fail.
      fs.writeFileSync(
        path.join(sandbox, 'features-x.md'),
        '# Features — X\n\n## alpha\nx\n\n## beta\nx\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-alpha.md'),
        [
          '## T1 · alpha',
          '- **Closes user story:** As a user, I want alpha, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/alpha.ts`',
          '- **Depends on:** none',
          '- **Precise change:** add alpha().',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/alpha.test.ts`',
          '- **Estimated LOC:** ~10',
          '- **Phase:** mvp',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      writeStreamAStubs(sandbox);
      const { out, code } = run(`bash "${FINALIZE}" "${sandbox}"`);
      expect(code).not.toBe(0);
      expect(out).toMatch(/executor_gate: fail/);
      expect(out).toMatch(/Do NOT declare the drill-down complete yet/);
      // A revise-report.md must exist so the agent has a single file to act on.
      expect(fs.existsSync(path.join(sandbox, 'revise-report.md'))).toBe(true);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('is idempotent — running twice on a clean plan produces the same gate state', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-idem-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-x.md'),
        '# Features — X\n\n## alpha\nx\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-alpha.md'),
        [
          '## T1 · alpha',
          '- **Closes user story:** As a user, I want alpha, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/alpha.ts`',
          '- **Depends on:** none',
          '- **Precise change:** add alpha().',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/alpha.test.ts`',
          '- **Estimated LOC:** ~10',
          '- **Phase:** mvp',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      writeStreamAStubs(sandbox);
      const first = run(`bash "${FINALIZE}" "${sandbox}"`);
      const second = run(`bash "${FINALIZE}" "${sandbox}"`);
      expect(first.code).toBe(0);
      expect(second.code).toBe(0);
      expect(first.out).toMatch(/executor_gate: pass/);
      expect(second.out).toMatch(/executor_gate: pass/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a missing / invalid target directory', () => {
    const { code, out } = run(`bash "${FINALIZE}" "/nonexistent/dir-that-does-not-exist"`);
    expect(code).not.toBe(0);
    expect(out).toMatch(/target directory does not exist/);
  });
});
