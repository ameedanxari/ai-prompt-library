/**
 * Instantiation validation
 *
 * Guards output-quality invariants shared by both engines:
 *   - No template references (.ai-prompts/prompts/) or placeholder tokens.
 *   - File: fields name exactly one concrete file (no dir, no "multiple
 *     files", no grouping).
 *   - Acceptance criteria are not tautological.
 *
 * The bash validator (scripts/validate-instantiation.sh) does the same
 * checks; these tests also exercise it against synthetic fixtures to
 * prove it catches violations (not just the natural all-pass case).
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-instantiation.sh');
const TASKS_DIR = path.join(REPO_ROOT, 'prompts', 'outputs', 'current');

describe('validator — script exists', () => {
  it('exists and is executable', () => {
    expect(fs.existsSync(VALIDATOR)).toBe(true);
    const stat = fs.statSync(VALIDATOR);
    expect((stat.mode & 0o111) !== 0).toBe(true);
  });
});

describe('validator — clean fixture passes', () => {
  it('runs cleanly against repo outputs (no tasks/remediation present here)', () => {
    const result = execSync(`bash "${VALIDATOR}" "${TASKS_DIR}"`, {
      cwd: REPO_ROOT,
      encoding: 'utf8',
    });
    expect(result).toMatch(/✅|nothing to validate/);
  });

  it('accepts a well-formed remediation file with companion files', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-good.md'),
        [
          '# Remediation — good',
          '',
          '## R1 · do the thing',
          '- **Closes user story:** As a developer, I want a hello function, so that I can smoke-test the module.',
          '- **Change type:** modify-existing',
          '- **File:** `src/app.ts`',
          '- **Precise change:** add `export function hello()` returning `"hi"`.',
          '- **Acceptance:**',
          '  - `hello()` returns the exact string `hi`.',
          '  - File exports exactly one symbol named `hello`.',
          '  - `tsc --noEmit` exits 0 after the edit.',
          '- **Test:** `src/app.test.ts` (new) — calls hello, asserts return.',
          '- **Estimated LOC delta:** +5',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n\nNo new external services required.\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        [
          '---',
          'revised_at: 2026-04-20T00:00:00Z',
          'engine: audit-and-remediate',
          'checks_run: [C3, C4, C6, C7, C8]',
          'checks_passed: [C3, C4, C6, C7, C8]',
          'checks_failed: []',
          'regenerations_performed: []',
          'remaining_issues: []',
          'executor_gate: pass',
          '---',
          '',
          '# Revise Report',
          'all checks passed.',
          '',
        ].join('\n'),
      );
      const out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
        encoding: 'utf8',
      });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a remediation dir missing external-accounts.md', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-noext-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-x.md'),
        [
          '## R1 · stuff',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A is present.',
          '  - B is present.',
          '  - C is present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        '---\nexecutor_gate: pass\n---\n',
      );
      let code = 0;
      let out = '';
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/missing required companion.*external-accounts/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a remediation dir missing revise-report.md', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-norev-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-x.md'),
        [
          '## R1 · stuff',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A is present.',
          '  - B is present.',
          '  - C is present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      let code = 0;
      let out = '';
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/missing required companion.*revise-report/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a hand-written narrative revise-report.md (no YAML frontmatter)', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-narr-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-x.md'),
        [
          '## R1 · stuff',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A is present.',
          '  - B is present.',
          '  - C is present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      // Narrative report — no YAML frontmatter on line 1.
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        [
          '# Revise Report',
          '',
          '## Overview',
          'All features validated successfully.',
          '',
          '### Results',
          '- Feature 1: ✅',
          '- Feature 2: ✅',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/hand-written narrative/);
      expect(out).toMatch(/bash scripts\/revise\.sh/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a hand-written narrative execution-log.md', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-exec-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-x.md'),
        [
          '## R1 · stuff',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A is present.',
          '  - B is present.',
          '  - C is present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        '---\nexecutor_gate: pass\n---\n',
      );
      // Narrative execution log.
      fs.writeFileSync(
        path.join(sandbox, 'execution-log.md'),
        [
          '# Execution Log — Project',
          '',
          '## Summary',
          'Completed all tasks successfully.',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/hand-written narrative/);
      expect(out).toMatch(/session_id/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('revise.sh converges from a prior fail state to pass on clean plan', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-converge-'));
    const REVISE = path.resolve(REPO_ROOT, 'scripts', 'revise.sh');
    try {
      // One feature, one matching tasks file — a clean plan.
      fs.writeFileSync(
        path.join(sandbox, 'features-auth.md'),
        ['# Features — Auth', '', '## Sign up', 'x', ''].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-sign-up.md'),
        [
          '## T1 · x',
          '- **Closes user story:** As a user, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      // Seed a stale revise-report with executor_gate: fail. Without the
      // env-flag fix this would make revise.sh rewrite it as fail forever.
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        [
          '---',
          'executor_gate: fail',
          'failing_files: ["tasks-sign-up.md"]',
          '---',
          '',
          'old report body',
          '',
        ].join('\n'),
      );

      const out = execSync(`bash "${REVISE}" "${sandbox}"`, {
        encoding: 'utf8',
      });
      expect(out).toMatch(/revise gate: pass/);

      const body = fs.readFileSync(
        path.join(sandbox, 'revise-report.md'),
        'utf8',
      );
      expect(body).toMatch(/executor_gate:\s*pass/);
      expect(body).toMatch(/failing_files:\s*\[\]/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('standalone validator still flags revise-report.md with executor_gate: fail', () => {
    // The env-flag gate-check bypass must NOT leak to direct callers —
    // executor preflight / standalone CI runs must still see fail.
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-standalone-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-auth.md'),
        ['# Features — Auth', '', '## Sign up', 'x', ''].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-sign-up.md'),
        [
          '## T1 · x',
          '- **Closes user story:** As a user, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        '---\nexecutor_gate: fail\n---\n',
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/executor_gate is not 'pass'/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a revise-report.md with executor_gate: fail', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-gatefail-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-x.md'),
        [
          '## R1 · stuff',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A is present.',
          '  - B is present.',
          '  - C is present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        [
          '---',
          'executor_gate: fail',
          'remaining_issues: [C5: screenshots collapsed]',
          '---',
          '',
        ].join('\n'),
      );
      let code = 0;
      let out = '';
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/executor_gate is not 'pass'/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});

describe('validator — user-story linkage', () => {
  it('rejects a task missing Closes user story', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-nostory-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-nostory.md'),
        [
          '# Remediation — no story',
          '',
          '## R1 · do the thing',
          '- **Change type:** modify-existing',
          '- **File:** `src/app.ts`',
          '- **Precise change:** add `hello()`.',
          '- **Acceptance:**',
          '  - `hello()` returns `hi`.',
          '  - Only one export named `hello`.',
          '  - File size stays under 100 lines.',
          '- **Test:** `src/app.test.ts`',
          '- **Estimated LOC delta:** +5',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/Closes user story/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a screenshot task that collapses across device sizes', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-collapse-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-app-store-prep.md'),
        [
          '# Remediation — app store prep',
          '',
          '## R1 · Create iOS app screenshots',
          '- **Closes user story:** As a reviewer, I want screenshots, so that I can approve the app.',
          '- **Change type:** create-new',
          '- **File:** `ios/screenshots/en-US/iPhone-6.7/screen-1.png`',
          '- **Precise change:** Generate 6 screenshots for each device size: iPhone 6.7", 6.5", and 5.5". Use fastlane snapshot.',
          '- **Acceptance:**',
          '  - Directory exists.',
          '  - 6 files per size.',
          '  - Dimensions match spec.',
          '- **Test:** `ios/scripts/check.sh`',
          '- **Estimated LOC delta:** +0',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/collapse|per locale|per device/i);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a task whose Acceptance lists multiple files that must exist', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-multifile-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-multifile.md'),
        [
          '# Remediation — multi-file collapse',
          '',
          '## R1 · Create screenshot placeholders',
          '- **Closes user story:** As a reviewer, I want screenshots, so that I can approve the app.',
          '- **Change type:** create-new',
          '- **File:** `ios/screenshots/en/phone-1.png`',
          '- **Precise change:** Create one screenshot.',
          '- **Acceptance:**',
          '  - `ios/screenshots/en/phone-1.png` file exists and is PNG format with dimensions 1290x2796px.',
          '  - `ios/screenshots/en/phone-2.png` file exists and is PNG format with dimensions 1290x2796px.',
          '  - `ios/screenshots/en/phone-3.png` file exists and is PNG format with dimensions 1290x2796px.',
          '- **Test:** `ios/scripts/check.sh`',
          '- **Estimated LOC delta:** +0',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/Acceptance (lists|names) multiple|implicit collapse/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('does NOT reject a test task that references the source-under-test', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-testref-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-middleware-tests.md'),
        [
          '# Remediation — middleware tests',
          '',
          '## R1 · Add auth middleware tests',
          '- **Closes user story:** As a maintainer, I want middleware covered, so that regressions are caught.',
          '- **Change type:** modify-existing',
          '- **File:** `backend/tests/authMiddleware.test.ts`',
          '- **Precise change:** Add 10 tests covering valid token, expired token, invalid signature, missing token, wrong algorithm, wrong issuer, happy path, 401 on invalid, context set on success.',
          '- **Acceptance:**',
          '  - `backend/tests/authMiddleware.test.ts` has at least 10 tests covering all branches.',
          '  - `npm test -- backend/tests/authMiddleware.test.ts` passes.',
          '  - Coverage for `backend/src/middleware/auth.ts` increases from 40% to 90%.',
          '- **Test:** `npm test -- backend/tests/authMiddleware.test.ts`',
          '- **Estimated LOC delta:** +80',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n\nNo new external services required.\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        '---\nexecutor_gate: pass\n---\n',
      );
      const out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
        encoding: 'utf8',
      });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects an app-icon task that collapses across platforms or locales', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-icon-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-icons.md'),
        [
          '# Remediation — icons',
          '',
          '## R1 · Create app icons',
          '- **Closes user story:** As a user, I want icons, so that I can recognize the app.',
          '- **Change type:** create-new',
          '- **File:** `assets/icons/android-icon.png`',
          '- **Precise change:** Generate app icons for all platforms and all required sizes.',
          '- **Acceptance:**',
          '  - Icons exist in correct paths.',
          '  - Sizes match platform specs.',
          '  - No placeholder images remain.',
          '- **Test:** `scripts/check-icons.sh`',
          '- **Estimated LOC delta:** +0',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/collapse|per locale|per device/i);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('revise.sh emits batch-size guidance when defects total >= 20', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-batch-'));
    const REVISE = path.resolve(REPO_ROOT, 'scripts', 'revise.sh');
    try {
      // Declare 22 features in one features file, create zero tasks files.
      // That yields 22 coverage gaps — more than the 20 threshold.
      const headings: string[] = [];
      for (let i = 1; i <= 22; i++) {
        headings.push(`## Feature ${i}`);
        headings.push('**Description:** x');
        headings.push('');
      }
      fs.writeFileSync(
        path.join(sandbox, 'features-big.md'),
        ['# Features — Big', '', ...headings].join('\n'),
      );
      // Need at least one tasks file for revise.sh to recognise this as
      // a drill-down output dir.
      fs.writeFileSync(
        path.join(sandbox, 'tasks-feature-1.md'),
        [
          '## T1 · x',
          '- **Closes user story:** As a user, I want x, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );

      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${REVISE}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);

      // Report body should carry the batch-size warning header and
      // instructions.
      const report = fs.readFileSync(
        path.join(sandbox, 'revise-report.md'),
        'utf8',
      );
      expect(report).toMatch(/Large defect batch/);
      expect(report).toMatch(/FIRST 5 files/);
      expect(report).toMatch(/Work in batches/i);
      // Coverage-gap section must say files do not exist yet.
      expect(report).toMatch(/DO NOT EXIST YET|do not attempt to read/i);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a plan with features that have no matching tasks file (coverage gap)', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-cov-'));
    try {
      // One features file with 3 features declared…
      fs.writeFileSync(
        path.join(sandbox, 'features-auth.md'),
        [
          '# Features — Auth',
          '',
          '## Sign up',
          '**Description:** x',
          '',
          '## Sign in',
          '**Description:** x',
          '',
          '## Password reset',
          '**Description:** x',
          '',
        ].join('\n'),
      );
      // …but only one tasks file on disk.
      fs.writeFileSync(
        path.join(sandbox, 'tasks-sign-up.md'),
        [
          '## T1 · signup handler',
          '- **Closes user story:** As a new user, I want to sign up, so that I can use the app.',
          '- **File:** `src/signup.ts`',
          '- **Precise change:** add signup().',
          '- **Acceptance:**',
          '  - A is present.',
          '  - B is present.',
          '  - C is present.',
          '- **Test:** `src/signup.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        '---\nexecutor_gate: pass\n---\n',
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/coverage:\s+2 feature\(s\) declared/);
      expect(out).toMatch(/tasks-sign-in\.md/);
      expect(out).toMatch(/tasks-password-reset\.md/);
      // Must explicitly instruct regeneration via engine, not hand-edit.
      expect(out).toMatch(/Regenerate via the engine, not by hand/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('user-story error message names the canonical form and gives an example', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-us-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-bad.md'),
        [
          '## R1 · x',
          '- **Closes user story:** As the app I want something so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A is present.',
          '  - B is present.',
          '  - C is present.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        '---\nexecutor_gate: pass\n---\n',
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      // Error must include the exact canonical form and an example.
      expect(out).toMatch(/As a <role>, I want <outcome>, so that <value>/);
      expect(out).toMatch(/Example:/);
      expect(out).toMatch(/NOT 'As the'/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a task with fewer than 3 acceptance bullets', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-sparse-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-sparse.md'),
        [
          '# Remediation — sparse',
          '',
          '## R1 · thin acceptance',
          '- **Closes user story:** As a maintainer, I want a thing, so that y.',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - It returns the expected value.',
          '  - File compiles with tsc.',
          '- **Test:** `src/a.test.ts`',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/fewer than 3 acceptance bullet|only 2 acceptance bullet/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a malformed user story line', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-badstory-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-badstory.md'),
        [
          '# Remediation — bad story',
          '',
          '## R1 · do the thing',
          '- **Closes user story:** users need the hello function',
          '- **Change type:** modify-existing',
          '- **File:** `src/app.ts`',
          '- **Precise change:** add `hello()`.',
          '- **Acceptance:**',
          '  - `hello()` returns `hi`.',
          '  - Only one export named `hello`.',
          '  - File size stays under 100 lines.',
          '- **Test:** `src/app.test.ts`',
          '- **Estimated LOC delta:** +5',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/As a <role>, I want <outcome>, so that <value>/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});

describe('validator — rejects quality violations', () => {
  type Case = { name: string; body: string; pattern: RegExp };

  const cases: Case[] = [
    {
      name: 'template reference path',
      body: [
        '## R1 · x',
        '- **File:** `.ai-prompts/prompts/modules/feature-patterns/auth-oauth.md`',
      ].join('\n'),
      pattern: /\.ai-prompts\/prompts\//,
    },
    {
      name: 'placeholder token',
      body: ['## R1 · x', '- **File:** `src/{{name}}.ts`'].join('\n'),
      pattern: /forbidden pattern/,
    },
    {
      name: 'File field is a directory',
      body: ['## R1 · x', '- **File:** `android/app/src/test/`'].join('\n'),
      pattern: /points at a directory/,
    },
    {
      name: 'File field says multiple files',
      body: [
        '## R1 · x',
        '- **File:** `android/app/src/test/` (multiple files modify)',
      ].join('\n'),
      pattern: /points at a directory|names a group/,
    },
    {
      name: 'File field says several files',
      body: [
        '## R1 · x',
        '- **File:** `src/foo.ts` (several test files)',
      ].join('\n'),
      pattern: /names a group/,
    },
    {
      name: 'tautological acceptance — tests pass',
      body: [
        '## R1 · x',
        '- **File:** `src/app.ts`',
        '- **Acceptance:**',
        '  - Tests pass',
      ].join('\n'),
      pattern: /tautological/,
    },
    {
      name: 'tautological acceptance — it works',
      body: [
        '## R1 · x',
        '- **File:** `src/app.ts`',
        '- **Acceptance:**',
        '  - It works.',
      ].join('\n'),
      pattern: /tautological/,
    },
  ];

  it.each(cases)('rejects: $name', ({ body, pattern }) => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-bad-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-bad.md'),
        `# Remediation — bad\n\n${body}\n`,
      );
      let stderr = '';
      let stdout = '';
      let exitCode = 0;
      try {
        stdout = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
          encoding: 'utf8',
        });
      } catch (e) {
        // Validator exits non-zero on failure; capture output.
        const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number };
        stdout = err.stdout?.toString() ?? '';
        stderr = err.stderr?.toString() ?? '';
        exitCode = err.status ?? 0;
      }
      expect(exitCode).not.toBe(0);
      expect(stdout + stderr).toMatch(pattern);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
