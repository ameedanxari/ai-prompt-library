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
const SCAFFOLD_SCREENSHOTS = path.join(REPO_ROOT, 'scripts', 'scaffold-screenshot-captures.sh');

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

function writeScreenshotFeature(dir: string): void {
  fs.writeFileSync(
    path.join(dir, 'features-screenshots-ios.md'),
    [
      '# Features — screenshots-ios',
      '',
      '## Screenshots iOS',
      'Create store listing copy, privacy nutrition/data safety notes, a fastlane screenshot matrix, signing/distribution readiness, and metadata upload steps for App Store Connect.',
      '',
    ].join('\n'),
  );
}

function scaffoldMinimalScreenshotMatrix(dir: string): string {
  return execSync(
    [
      `bash "${SCAFFOLD_SCREENSHOTS}"`,
      `--target "${dir}"`,
      '--platform ios',
      '--app-name App',
      '--locales en-US',
      '--devices iphone-6.7-inch',
      '--frames home,detail,results',
    ].join(' '),
    { encoding: 'utf8' },
  );
}

describe('finalize.sh', () => {
  it('exits 0 and writes a pass revise-report.md on a clean plan', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-alpha.md'),
        '# Features — Alpha\n\n## alpha\nx\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-alpha.md'),
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
      expect(out).toMatch(/Toolchain provenance: library=1\.0\.0 node=v?\d+/);
      expect(out).toMatch(/sanitized_path=pass/);
      const provenance = JSON.parse(
        fs.readFileSync(path.join(sandbox, 'finalize-provenance.json'), 'utf8'),
      );
      expect(provenance).toMatchObject({
        generated_by: 'scripts/finalize.sh',
        library_version: '1.0.0',
        sanitized_path_check: 'pass',
        atomic_write_status: 'success',
        executor_gate: 'pass',
      });
      expect(provenance.node_version).toMatch(/^v?\d+/);
      expect(provenance.npm_version).not.toBe('unavailable');
      expect(provenance.script_path).toBe(FINALIZE);
      expect(provenance.target_dir).toBe(sandbox);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('auto-fixes the missing-comma user-story pattern before the gate runs', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-fix-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-x.md'),
        '# Features — X\n\n## cancel\nx\n',
      );
      // Missing comma before "so that" — the auto-fixer should repair this.
      fs.writeFileSync(
        path.join(sandbox, 'tasks-cancel.md'),
        [
          '## T1 · cancel',
          '- **Closes user story:** As a user, I want to cancel so that I can return to the previous workflow.',
          '- **Change type:** create-new',
          '- **File:** `src/cancel.ts`',
          '- **Depends on:** none',
          '- **Precise change:** add cancel().',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/cancel.test.ts`',
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
        path.join(sandbox, 'tasks-cancel.md'),
        'utf8',
      );
      expect(taskFile).toMatch(/I want to cancel, so that I can return to the previous workflow/);
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

  it('promotes invalid screenshot matrices to a failing finalize gate', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-screenshot-matrix-'));
    try {
      scaffoldMinimalScreenshotMatrix(sandbox);
      writeScreenshotFeature(sandbox);
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      writeStreamAStubs(sandbox);

      const taskPath = path.join(sandbox, 'tasks-screenshots-ios.md');
      const body = fs.readFileSync(taskPath, 'utf8');
      fs.writeFileSync(
        taskPath,
        body.replace(
          'tools/app-store/verify-screenshot.sh fastlane/screenshots/en-US/iphone-6.7-inch/3_home.png',
          'tools/app-store/verify-screenshot.sh fastlane/screenshots/en-US/iphone-6.7-inch/999_home.png',
        ),
        'utf8',
      );

      const { out, code } = run(`bash "${FINALIZE}" "${sandbox}"`);

      expect(code).not.toBe(0);
      expect(out).toMatch(/screenshot matrix validation has/);
      expect(out).toMatch(/executor_gate: fail/);
      expect(out).toMatch(/expected fastlane\/screenshots\/en-US\/iphone-6\.7-inch\/3_home\.png/);
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

  it('fails before mutating plan reports when Node discovery is unavailable', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'finalize-prerequisite-'));
    try {
      const taskPath = path.join(sandbox, 'tasks-alpha.md');
      const priorReport = '---\nexecutor_gate: pass\n---\n';
      const uncorrectedTask = [
        '## T1 - alpha',
        '- **Closes user story:** As a user, I want alpha so that beta.',
      ].join('\n');
      fs.writeFileSync(path.join(sandbox, 'revise-report.md'), priorReport, 'utf8');
      fs.writeFileSync(taskPath, uncorrectedTask, 'utf8');

      const command = [
        '/usr/bin/env -i',
        `HOME="${os.homedir()}"`,
        'PATH="/usr/bin:/bin"',
        'AI_PROMPT_TOOLCHAIN_LOCAL_LOOKUP=0',
        'AI_PROMPT_TOOLCHAIN_PATH_LOOKUP=0',
        `/bin/bash "${FINALIZE}" "${sandbox}" 2>&1`,
      ].join(' ');
      const { out, code } = run(command);

      expect(code).toBe(2);
      expect(out.match(/toolchain prerequisite error:/g)).toHaveLength(1);
      expect(fs.readFileSync(path.join(sandbox, 'revise-report.md'), 'utf8')).toBe(priorReport);
      expect(fs.readFileSync(taskPath, 'utf8')).toBe(uncorrectedTask);
      const attempt = JSON.parse(
        fs.readFileSync(path.join(sandbox, 'finalize.failed-attempt.json'), 'utf8'),
      );
      expect(attempt).toMatchObject({
        status: 'prerequisite-failed',
        script_name: 'scripts/finalize.sh',
        missing_tool: 'node',
      });
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
