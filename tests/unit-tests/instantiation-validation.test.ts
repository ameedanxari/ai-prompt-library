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

// Minimal canonical revise-report.md for passing fixtures. The validator
// now verifies `revised_at` is close to the file's mtime and that the
// check arrays are non-empty — a bare stub was previously OK but hides
// hand-written reports with placeholder timestamps. Tests that exercise
// the tamper-detection itself still write their own frontmatter.
function passingReviseReport(): string {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  return [
    '---',
    `revised_at: ${now}`,
    'engine: drill-down-engine',
    'plan_files: 0',
    'checks_run: [C1, C2, C3]',
    'checks_passed: [all]',
    'checks_failed: []',
    'regenerations_performed: []',
    'remaining_issues: []',
    'executor_gate: pass',
    '---',
    '',
  ].join('\n');
}

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
          `revised_at: ${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}`,
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
        passingReviseReport(),
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
        passingReviseReport(),
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
          '- **Change type:** create-new',
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
        passingReviseReport(),
      );
      const out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
        encoding: 'utf8',
      });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('accepts "As the app/developer/maintainer" canonical form for infrastructure tasks', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-as-the-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-infra.md'),
        [
          '# Remediation — infrastructure',
          '',
          '## R1 · Seed the MediaItem data model',
          '- **Closes user story:** As the app, I need a MediaItem data structure, so that downstream filters and the UI share one canonical type.',
          '- **Change type:** create-new',
          '- **File:** `android/app/src/main/java/com/creatrixe/cleaner/data/model/MediaItem.kt`',
          '- **Signature:** `data class MediaItem(val id: String, val uri: Uri, val sizeBytes: Long, val createdAt: Instant)`',
          '- **Precise change:** Add `data class MediaItem` with fields id, uri, sizeBytes, createdAt. Make it Parcelable. Add companion factory `fromCursor(cursor: Cursor): MediaItem`.',
          '- **Acceptance:**',
          '  - `MediaItem` compiles without warnings under Kotlin 1.9.',
          '  - `MediaItem.fromCursor(mockCursor)` returns an instance whose id, uri, sizeBytes, createdAt match the cursor values.',
          '  - `MediaItem` is Parcelable and round-trips through `Bundle.putParcelable` / `getParcelable` unchanged.',
          '- **Test:** `android/app/src/test/java/com/creatrixe/cleaner/data/model/MediaItemTest.kt`',
          '- **Estimated LOC delta:** +40',
          '- **Depends on:** none',
          '',
          '## R2 · Wire the debug menu entry',
          '- **Closes user story:** As the developer, I need a debug-only entry to reset local state, so that I can repro onboarding flows without reinstalling the app.',
          '- **Change type:** modify-existing',
          '- **File:** `android/app/src/main/java/com/creatrixe/cleaner/debug/DebugMenuFragment.kt`',
          '- **Signature:** `override fun onViewCreated(view: View, savedInstanceState: Bundle?)`',
          '- **Precise change:** Append a `ListPreference` titled "Reset local state" to the existing `onViewCreated`. Gate behind `BuildConfig.DEBUG`. On click, call `LocalStateResetter.reset()` and toast the result.',
          '- **Acceptance:**',
          '  - The new preference appears only in debug builds.',
          '  - Tapping it clears SharedPreferences under namespace `com.creatrixe.cleaner.local`.',
          '  - A toast announces "Local state cleared" on success.',
          '- **Test:** `android/app/src/androidTest/java/com/creatrixe/cleaner/debug/DebugMenuFragmentTest.kt`',
          '- **Estimated LOC delta:** +22',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n\nNo new external services required.\n',
      );
      fs.writeFileSync(path.join(sandbox, 'revise-report.md'), passingReviseReport());
      const out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects revise-report.md with a placeholder revised_at timestamp', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-placeholder-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-x.md'),
        '# x\n\n## R1 · x\n- **Closes user story:** As a user, I want x, so that y.\n- **Change type:** create-new\n- **File:** `src/a.ts`\n- **Precise change:** add.\n- **Acceptance:**\n  - A present.\n  - B present.\n  - C present.\n- **Test:** `src/a.test.ts`\n',
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# External Accounts Required\n');
      // Hand-written-mimic: matches canonical shape but placeholder date.
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        [
          '---',
          'revised_at: 2025-01-01T00:00:00Z',
          'engine: drill-down-engine',
          'plan_files: 1',
          'checks_run: [C1, C2]',
          'checks_passed: [all]',
          'checks_failed: []',
          'regenerations_performed: []',
          'remaining_issues: []',
          'executor_gate: pass',
          '---',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/revised_at.*not within 48h/i);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects revise-report.md with both checks_passed and checks_failed empty', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-empty-checks-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-x.md'),
        '# x\n\n## R1 · x\n- **Closes user story:** As a user, I want x, so that y.\n- **Change type:** create-new\n- **File:** `src/a.ts`\n- **Precise change:** add.\n- **Acceptance:**\n  - A present.\n  - B present.\n  - C present.\n- **Test:** `src/a.test.ts`\n',
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# External Accounts Required\n');
      const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        [
          '---',
          `revised_at: ${now}`,
          'engine: drill-down-engine',
          'plan_files: 1',
          'checks_run: [C1, C2]',
          'checks_passed: []',
          'checks_failed: []',
          'regenerations_performed: []',
          'remaining_issues: []',
          'executor_gate: pass',
          '---',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/checks_passed and checks_failed are empty/i);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('does NOT flag a screenshot tooling task (source file, iterates internally)', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-tooling-'));
    try {
      const capture = (num: number, locale: string, device: string, frame: string) =>
        [
          `## T${num} · ${locale} ${device} ${frame} screenshot (Android)`,
          `- **Closes user story:** As a reviewer, I want the ${locale} ${device} ${frame} screenshot, so that I can approve the Play listing for ${locale}.`,
          '- **Change type:** create-new',
          `- **File:** \`fastlane/screenshots/${locale}/${device}/${num}_${frame}.png\``,
          `- **Signature:** PNG captured from ${frame}UITest.testFirstLaunch`,
          `- **Precise change:** Run \`bundle exec fastlane snapshot --devices ${device} --languages ${locale} --only_testing AppUITests/${frame}UITest/testFirstLaunch\`. Writes the PNG to the File path above.`,
          '- **Acceptance:**',
          `  - File \`fastlane/screenshots/${locale}/${device}/${num}_${frame}.png\` exists.`,
          '  - PNG dimensions match device form factor.',
          `  - OCR contains ${locale}-localised strings for the ${frame} screen.`,
          `- **Test:** \`tools/app-store/verify-screenshot.sh fastlane/screenshots/${locale}/${device}/${num}_${frame}.png\``,
          '- **Estimated LOC delta:** +0',
          '- **Depends on:** T1 (Snapfile drives the capture)',
          '',
        ].join('\n');

      fs.writeFileSync(
        path.join(sandbox, 'tasks-android-screenshots.md'),
        [
          '# Tasks — Android screenshots',
          '',
          '## T1 · Fastlane Snapfile (Android screenshot driver)',
          '- **Closes user story:** As a release engineer, I want a reusable snapshot config, so that every locale and device combination captures the same frames.',
          '- **Change type:** create-new',
          '- **File:** `fastlane/Snapfile`',
          '- **Signature:** fastlane snapshot config',
          '- **Precise change:** Declare devices, languages, and output_directory. Snapfile iterates across all supported locales and all required device classes at capture time; each iteration writes one PNG.',
          '- **Acceptance:**',
          '  - `bundle exec fastlane snapshot --verify_only` exits 0.',
          '  - File `fastlane/Snapfile` contains `devices [` and `languages [` declarations.',
          '  - `languages` list length matches the 5 brief-keyword locales.',
          '- **Test:** `bundle exec fastlane snapshot --verify_only`',
          '- **Estimated LOC delta:** +20',
          '- **Depends on:** none',
          '',
          capture(2, 'en-US', 'pixel_7', 'dashboard'),
          capture(3, 'es-ES', 'pixel_7', 'dashboard'),
          capture(4, 'fr-FR', 'pixel_7', 'dashboard'),
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n\nNo new external services required.\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      const out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, {
        encoding: 'utf8',
      });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a screenshot CAPTURE task (image File) that collapses across locales', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-capture-collapse-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'tasks-ios-screenshots.md'),
        [
          '# Tasks — iOS screenshots',
          '',
          '## T1 · Multi-locale iPhone screenshot',
          '- **Closes user story:** As a reviewer, I want screenshots, so that I can approve the iOS listing.',
          '- **Change type:** create-new',
          '- **File:** `fastlane/screenshots/en-US/iphone-6.5/1_feature.png`',
          '- **Signature:** 1284x2778 PNG',
          '- **Precise change:** Capture the feature screenshot for each locale (en-US, es-ES, fr-FR, de-DE, ja-JP) on the iPhone 6.5" device class.',
          '- **Acceptance:**',
          '  - File exists at the declared path.',
          '  - PNG dimensions match iPhone 6.5".',
          '  - Text is localised.',
          '- **Test:** `./scripts/verify-shot.sh fastlane/screenshots/en-US/iphone-6.5/1_feature.png`',
          '- **Estimated LOC delta:** +0',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/capture task collapses|per locale|per device/i);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a screenshot task file that has only tooling and zero capture tasks', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-no-captures-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'tasks-android-screenshots.md'),
        [
          '# Tasks — Android screenshots',
          '',
          '## T1 · Fastlane Snapfile',
          '- **Closes user story:** As a release engineer, I want a snapshot config, so that captures are reproducible.',
          '- **Change type:** create-new',
          '- **File:** `fastlane/Snapfile`',
          '- **Signature:** fastlane config',
          '- **Precise change:** Declare devices and languages in the Snapfile.',
          '- **Acceptance:**',
          '  - `fastlane snapshot --verify_only` exits 0.',
          '  - Snapfile declares three devices.',
          '  - Snapfile declares five languages.',
          '- **Test:** `bundle exec fastlane snapshot --verify_only`',
          '- **Estimated LOC delta:** +20',
          '- **Depends on:** none',
          '',
          '## T2 · Screenshot organizer script',
          '- **Closes user story:** As a release engineer, I want outputs organised by locale, so that uploads work.',
          '- **Change type:** create-new',
          '- **File:** `tools/app-store/organize.sh`',
          '- **Signature:** bash organiser',
          '- **Precise change:** Read output_directory from Snapfile; group files by locale; move to fastlane/metadata structure.',
          '- **Acceptance:**',
          '  - `tools/app-store/organize.sh` exits 0 on a sample tree.',
          '  - Files are grouped under per-locale directories.',
          '  - Script writes a summary to stdout.',
          '- **Test:** `bats tools/app-store/organize.bats`',
          '- **Estimated LOC delta:** +40',
          '- **Depends on:** T1 (Snapfile defines output_directory)',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n\nNo new external services required.\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/no capture tasks/i);
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
        passingReviseReport(),
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
        passingReviseReport(),
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
      expect(out).toMatch(/As <a\|an\|the> <role>, I <want\|need> <outcome>, so that <value>/);
      expect(out).toMatch(/Example:/);
      expect(out).toMatch(/'As a', 'As an', or 'As the'/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a greenfield plan missing brief-keywords.md', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-nokw-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'epics.md'),
        '# Epics\n\n## 1. Thing\n- Goal: x\n- Acceptance:\n  - y\n- Complexity: S\n- Applies to: web\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-thing.md'),
        [
          '## T1 · x',
          '- **Closes user story:** As a user, I want x, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# X\n');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      // Deliberately no brief-keywords.md.

      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/brief-keywords\.md/);
      expect(out).toMatch(/silent dropout|covered\|out-of-scope/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('accepts a plan with a well-formed brief-keywords.md', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-kw-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'epics.md'),
        '# Epics\n\n## 1. Thing\n- Goal: x\n- Acceptance:\n  - y\n- Complexity: S\n- Applies to: web\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-thing.md'),
        [
          '## T1 · x',
          '- **Closes user story:** As a user, I want x, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# X\n');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      fs.writeFileSync(
        path.join(sandbox, 'brief-keywords.md'),
        [
          '# Brief Keywords',
          '',
          '| Keyword | Status | Covered by / reason |',
          '|---|---|---|',
          '| liquid glass | covered | B5 Theming — UIVisualEffectView + tonalElevation |',
          '| tinder-like swipe | covered | Epic: Swipe interface |',
          '| on-device AI/ML | covered | Epic: Media scanner & analyzer |',
          '',
        ].join('\n'),
      );

      const out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a brief-keywords.md with fewer than 3 rows', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-kw-thin-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'epics.md'),
        '# Epics\n\n## 1. Thing\n',
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-thing.md'),
        [
          '## T1 · x',
          '- **Closes user story:** As a user, I want x, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A.',
          '  - B.',
          '  - C.',
          '- **Test:** `src/a.test.ts`',
          '- **Depends on:** none',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# X\n');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      fs.writeFileSync(
        path.join(sandbox, 'brief-keywords.md'),
        [
          '# Brief Keywords',
          '',
          '| Keyword | Status | Covered by / reason |',
          '|---|---|---|',
          '| x | covered | Epic A |',
          '',
        ].join('\n'),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/only 1 keyword row|need >= 3/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a Depends-on line without a reason', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-dep-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-dep.md'),
        [
          '## R1 · x',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          // Depends on with just a task id and no reason — the exact
          // shape of invented ordering the MenuMaker run produced.
          '- **Depends on:** T0',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# X\n');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/\*\*Depends on:\*\* lines lack a reason/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('accepts a Depends-on line with a parenthetical reason', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-dep-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-dep-ok.md'),
        [
          '## R1 · x',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '- **Test:** `src/a.test.ts`',
          '- **Depends on:** T0 (requires the schema from T0 to exist)',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# X\n');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      const out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a task missing **Change type:**', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-nochange-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-nochange.md'),
        [
          '## R1 · x',
          '- **Closes user story:** As a dev, I want x, so that y.',
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
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# X\n');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/missing \*\*Change type:\*\*/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a task missing **Test:**', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-notest-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-notest.md'),
        [
          '## R1 · x',
          '- **Closes user story:** As a dev, I want x, so that y.',
          '- **Change type:** create-new',
          '- **File:** `src/a.ts`',
          '- **Precise change:** add function.',
          '- **Acceptance:**',
          '  - A present.',
          '  - B present.',
          '  - C present.',
          '',
        ].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'external-accounts.md'), '# X\n');
      fs.writeFileSync(
        path.join(sandbox, 'revise-report.md'),
        passingReviseReport(),
      );
      let out = '';
      let code = 0;
      try {
        out = execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' });
      } catch (e) {
        const err = e as { stdout?: Buffer; status?: number };
        out = err.stdout?.toString() ?? '';
        code = err.status ?? 0;
      }
      expect(code).not.toBe(0);
      expect(out).toMatch(/missing \*\*Test:\*\*/);
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
      expect(out).toMatch(/As <a\|an\|the> <role>, I <want\|need> <outcome>, so that <value>/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});

describe('validator — orphan tasks and baseline coverage', () => {
  function runValidator(sandbox: string): { out: string; code: number } {
    try {
      return {
        out: execSync(`bash "${VALIDATOR}" "${sandbox}"`, { encoding: 'utf8' }),
        code: 0,
      };
    } catch (e) {
      const err = e as { stdout?: Buffer; status?: number };
      return {
        out: err.stdout?.toString() ?? '',
        code: err.status ?? 0,
      };
    }
  }

  function minimalGoodTask(): string {
    return [
      '## T1 · x',
      '- **Closes user story:** As a user, I want x, so that y.',
      '- **Change type:** create-new',
      '- **File:** `src/a.ts`',
      '- **Precise change:** add function.',
      '- **Acceptance:**',
      '  - A present.',
      '  - B present.',
      '  - C present.',
      '- **Test:** `src/a.test.ts`',
      '',
    ].join('\n');
  }

  it('rejects orphan tasks files whose slug has no declared feature', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-orphan-'));
    try {
      // Declare only "alpha" but produce tasks for "alpha" AND "beta".
      // "beta" is the orphan — no feature heading.
      fs.writeFileSync(
        path.join(sandbox, 'features-x.md'),
        '# Features — X\n\n## alpha\nx\n',
      );
      fs.writeFileSync(path.join(sandbox, 'tasks-alpha.md'), minimalGoodTask());
      fs.writeFileSync(path.join(sandbox, 'tasks-beta.md'), minimalGoodTask());
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(path.join(sandbox, 'revise-report.md'), passingReviseReport());
      const { code, out } = runValidator(sandbox);
      expect(code).not.toBe(0);
      expect(out).toMatch(/tasks-<slug>\.md file\(s\) have no matching feature heading/);
      expect(out).toMatch(/tasks-beta\.md/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('tolerates scaffolded screenshot task files even without a matching feature', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-scaffold-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-x.md'),
        '# Features — X\n\n## alpha\nx\n',
      );
      fs.writeFileSync(path.join(sandbox, 'tasks-alpha.md'), minimalGoodTask());
      // The two scaffolder output files — no matching feature heading,
      // but accepted by policy.
      const scaffoldedBody = [
        '# Tasks — Screenshots (ios)',
        '',
        '## T1 · Fastlane config for ios',
        '- **Closes user story:** As the app, I need a snapshot config, so that captures are consistent.',
        '- **Change type:** create-new',
        '- **File:** `fastlane/Snapfile`',
        '- **Signature:** fastlane snapshot configuration',
        '- **Precise change:** declare devices and languages.',
        '- **Acceptance:**',
        '  - A present.',
        '  - B present.',
        '  - C present.',
        '- **Test:** `bundle exec fastlane snapshot --verify_only`',
        '- **Depends on:** none',
        '',
        '## T2 · Screenshot — en-US / iphone-6.7-inch / dashboard',
        '- **Closes user story:** As the app, I need a en-US iphone-6.7-inch dashboard screenshot, so that the en-US listing shows localised content.',
        '- **Change type:** create-new',
        '- **File:** `fastlane/screenshots/en-US/iphone-6.7-inch/2_dashboard.png`',
        '- **Signature:** PNG asset',
        '- **Precise change:** run snapshot scoped to en-US and iphone-6.7-inch.',
        '- **Acceptance:**',
        '  - A present.',
        '  - B present.',
        '  - C present.',
        '- **Test:** `tools/app-store/verify-screenshot.sh fastlane/screenshots/en-US/iphone-6.7-inch/2_dashboard.png`',
        '- **Depends on:** T1 (Snapfile)',
        '',
        '## T3 · Screenshot — es-ES / iphone-6.7-inch / dashboard',
        '- **Closes user story:** As the app, I need a es-ES iphone-6.7-inch dashboard screenshot, so that the es-ES listing shows localised content.',
        '- **Change type:** create-new',
        '- **File:** `fastlane/screenshots/es-ES/iphone-6.7-inch/3_dashboard.png`',
        '- **Signature:** PNG asset',
        '- **Precise change:** run snapshot scoped to es-ES and iphone-6.7-inch.',
        '- **Acceptance:**',
        '  - A present.',
        '  - B present.',
        '  - C present.',
        '- **Test:** `tools/app-store/verify-screenshot.sh fastlane/screenshots/es-ES/iphone-6.7-inch/3_dashboard.png`',
        '- **Depends on:** T1 (Snapfile)',
        '',
        '## T4 · Screenshot — fr-FR / iphone-6.7-inch / dashboard',
        '- **Closes user story:** As the app, I need a fr-FR iphone-6.7-inch dashboard screenshot, so that the fr-FR listing shows localised content.',
        '- **Change type:** create-new',
        '- **File:** `fastlane/screenshots/fr-FR/iphone-6.7-inch/4_dashboard.png`',
        '- **Signature:** PNG asset',
        '- **Precise change:** run snapshot scoped to fr-FR and iphone-6.7-inch.',
        '- **Acceptance:**',
        '  - A present.',
        '  - B present.',
        '  - C present.',
        '- **Test:** `tools/app-store/verify-screenshot.sh fastlane/screenshots/fr-FR/iphone-6.7-inch/4_dashboard.png`',
        '- **Depends on:** T1 (Snapfile)',
        '',
      ].join('\n');
      fs.writeFileSync(path.join(sandbox, 'tasks-screenshots-ios.md'), scaffoldedBody);
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(path.join(sandbox, 'revise-report.md'), passingReviseReport());
      const { code, out } = runValidator(sandbox);
      expect(code).toBe(0);
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects an app-store features file missing screenshot / icon / signing / privacy-label coverage', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-baseline-'));
    try {
      // An app-store-release-prep features file that only mentions
      // launch screen, description, privacy URL, bundle ID — exactly the
      // StorageCleaner field-test gaming pattern.
      fs.writeFileSync(
        path.join(sandbox, 'features-app-store-release-prep.md'),
        [
          '# Features — App store release prep',
          '',
          '## Launch screen design',
          'x',
          '',
          '## Store description writing',
          'x',
          '',
          '## Privacy policy URL',
          'x',
          '',
          '## Bundle ID configuration',
          'x',
          '',
        ].join('\n'),
      );
      // Give each declared feature a tasks file so the forward
      // coverage check passes — the baseline-keyword check is what we
      // want to see fire here.
      for (const slug of [
        'launch-screen-design',
        'store-description-writing',
        'privacy-policy-url',
        'bundle-id-configuration',
      ]) {
        fs.writeFileSync(path.join(sandbox, `tasks-${slug}.md`), minimalGoodTask());
      }
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(path.join(sandbox, 'revise-report.md'), passingReviseReport());
      const { code, out } = runValidator(sandbox);
      expect(code).not.toBe(0);
      expect(out).toMatch(/baseline coverage: App Store Release Prep is missing required features/);
      expect(out).toMatch(/- screenshot/);
      expect(out).toMatch(/- icon/);
      expect(out).toMatch(/- signing/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('accepts an app-store features file that covers all required keyword families', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-baseline-ok-'));
    try {
      // A realistic features file — the "screenshots" topic splits into
      // per-platform feature headings whose slugs match the scaffolder's
      // tasks-screenshots-<platform>.md output filenames.
      fs.writeFileSync(
        path.join(sandbox, 'features-app-store-release-prep.md'),
        [
          '# Features — App store release prep',
          '',
          '## Store listing description and metadata',
          'x',
          '',
          '## App icon adaptive assets',
          'x',
          '',
          '## Screenshots android',
          'x',
          '',
          '## Screenshots ios',
          'x',
          '',
          '## Privacy nutrition labels / data safety form',
          'x',
          '',
          '## Signing and distribution keystore provisioning testflight play internal',
          'x',
          '',
        ].join('\n'),
      );
      // Non-screenshot tasks use the minimal-good body; screenshot files
      // carry 3+ canonical captures (the validator's minimum).
      const screenshotBody = ((devicePath: string) => {
        const cap = (num: number, locale: string) =>
          [
            `## T${num} · Screenshot — ${locale} / ${devicePath} / dashboard`,
            `- **Closes user story:** As the app, I need a ${locale} screenshot, so that the listing shows localised content.`,
            '- **Change type:** create-new',
            `- **File:** \`fastlane/screenshots/${locale}/${devicePath}/${num}_dashboard.png\``,
            '- **Signature:** PNG asset',
            `- **Precise change:** run snapshot scoped to ${locale} and ${devicePath}.`,
            '- **Acceptance:**',
            '  - A present.',
            '  - B present.',
            '  - C present.',
            `- **Test:** \`tools/app-store/verify-screenshot.sh fastlane/screenshots/${locale}/${devicePath}/${num}_dashboard.png\``,
            '- **Depends on:** none',
            '',
          ].join('\n');
        return [cap(1, 'en-US'), cap(2, 'es-ES'), cap(3, 'fr-FR')].join('\n');
      });
      fs.writeFileSync(
        path.join(sandbox, 'tasks-store-listing-description-and-metadata.md'),
        minimalGoodTask(),
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-app-icon-adaptive-assets.md'),
        minimalGoodTask(),
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-screenshots-android.md'),
        screenshotBody('pixel_7'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-screenshots-ios.md'),
        screenshotBody('iphone-6.7-inch'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-privacy-nutrition-labels-data-safety-form.md'),
        minimalGoodTask(),
      );
      fs.writeFileSync(
        path.join(sandbox, 'tasks-signing-and-distribution-keystore-provisioning-testflight-play-internal.md'),
        minimalGoodTask(),
      );
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(path.join(sandbox, 'revise-report.md'), passingReviseReport());
      const { code, out } = runValidator(sandbox);
      expect(code).toBe(0);
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('rejects a privacy-pii features file missing consent / delete / pii-classification', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-priv-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-privacy-pii-compliance.md'),
        [
          '# Features — Privacy, PII & compliance',
          '',
          '## Data export option',
          'x',
          '',
          '## Privacy policy statement',
          'x',
          '',
        ].join('\n'),
      );
      for (const slug of ['data-export-option', 'privacy-policy-statement']) {
        fs.writeFileSync(path.join(sandbox, `tasks-${slug}.md`), minimalGoodTask());
      }
      fs.writeFileSync(
        path.join(sandbox, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(path.join(sandbox, 'revise-report.md'), passingReviseReport());
      const { code, out } = runValidator(sandbox);
      expect(code).not.toBe(0);
      expect(out).toMatch(/Privacy, PII & compliance is missing required features/);
      expect(out).toMatch(/- consent/);
      expect(out).toMatch(/- delet/);
      expect(out).toMatch(/- pii/);
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
