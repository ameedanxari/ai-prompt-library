/**
 * Companion-scoping tests for scripts/validate-instantiation.sh.
 *
 * Gap-closure (remediation-only) runs must NOT be forced to produce the
 * greenfield Stream A artifacts (product-vision.md, architecture.md,
 * release-plan.md). Those are required only when tasks-*.md files exist.
 *
 * store-submission.md is a conditional companion (G6, Option B): required
 * only when plan files mention mobile artifacts (bundle IDs, xcodeproj,
 * TestFlight, Play Console, …). Non-mobile runs skip it entirely.
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-instantiation.sh');

function runValidator(dir: string): { code: number; out: string } {
  try {
    const out = execFileSync('/bin/bash', [VALIDATOR, dir], {
      encoding: 'utf8',
      env: { ...process.env, VALIDATOR_SKIP_GATE_CHECK: '1' },
    });
    return { code: 0, out: out.toString() };
  } catch (error) {
    const failure = error as { status?: number; stdout?: unknown; stderr?: unknown };
    const stdout = failure.stdout?.toString() ?? '';
    const stderr = failure.stderr?.toString() ?? '';
    return { code: failure.status ?? 1, out: `${stdout}${stderr}` };
  }
}

function validRemediationFile(): string {
  return [
    '## T1 · thing one',
    '- **Closes user story:** As a dev, I want x, so that y.',
    '- **Change type:** create-new',
    '- **File:** `src/a.ts`',
    '- **Precise change:** add function a.',
    '- **Acceptance:**',
    '  - A is present.',
    '  - B is present.',
    '  - C is present.',
    '- **Test:** `src/a.test.ts`',
    '- **Estimated LOC:** +5',
    '- **Depends on:** none',
    '- **Phase:** mvp',
    '',
  ].join('\n');
}

function validTasksFile(): string {
  return validRemediationFile();
}

function writeFile(dir: string, name: string, content = '# stub.\n'): void {
  fs.writeFileSync(path.join(dir, name), content);
}

describe('validate-instantiation companion scoping', () => {
  it('remediation-only run passes without Stream A artifacts', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'companions-remediation-'));
    try {
      writeFile(dir, 'remediation-alpha.md', validRemediationFile());
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'delivery-order.md');
      writeFile(dir, 'store-submission.md');

      const { code, out } = runValidator(dir);
      expect(out).not.toMatch(/missing required companion/);
      expect(out).not.toMatch(/product-vision\.md/);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('remediation-only run fails naming delivery-order.md when it is missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'companions-missing-'));
    try {
      writeFile(dir, 'remediation-alpha.md', validRemediationFile());
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'store-submission.md');

      const { code, out } = runValidator(dir);
      expect(code).toBe(1);
      expect(out).toMatch(/missing required companion: .*delivery-order\.md/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('tasks-mode run still requires product-vision.md', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'companions-tasks-'));
    try {
      writeFile(dir, 'tasks-alpha.md', validTasksFile());
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'delivery-order.md');
      writeFile(dir, 'store-submission.md');
      // Deliberately omit product-vision.md / architecture.md / release-plan.md.

      const { code, out } = runValidator(dir);
      expect(code).toBe(1);
      expect(out).toMatch(/missing required companion: .*product-vision\.md/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('tasks-mode run passes with the full Stream A set', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'companions-tasks-ok-'));
    try {
      writeFile(dir, 'tasks-alpha.md', validTasksFile());
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'delivery-order.md');
      writeFile(dir, 'store-submission.md');
      writeFile(dir, 'product-vision.md');
      writeFile(dir, 'architecture.md');
      writeFile(dir, 'release-plan.md');

      const { code, out } = runValidator(dir);
      expect(out).not.toMatch(/missing required companion/);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('G6 Option B: skips store-submission.md when no mobile artifacts are mentioned', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'companions-nomobile-'));
    try {
      writeFile(dir, 'remediation-alpha.md', validRemediationFile());
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'delivery-order.md');
      // Deliberately omit store-submission.md; the fixture mentions no
      // mobile artifacts (File: src/a.ts).

      const { code, out } = runValidator(dir);
      expect(out).toMatch(/store-submission\.md not required/);
      expect(out).not.toMatch(/missing required companion/);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('G6 Option B: requires store-submission.md when a plan file names an iOS plist', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'companions-mobile-'));
    try {
      const mobile = validRemediationFile().replace(
        '- **File:** `src/a.ts`',
        '- **File:** `ios/Runner/Info.plist`',
      );
      writeFile(dir, 'remediation-alpha.md', mobile);
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'delivery-order.md');
      // Deliberately omit store-submission.md.

      const { code, out } = runValidator(dir);
      expect(code).toBe(1);
      expect(out).toMatch(/missing required companion: .*store-submission\.md/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('G6 Option B: passes when mobile artifacts are mentioned and store-submission.md exists', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'companions-mobile-ok-'));
    try {
      const mobile = validRemediationFile().replace(
        '- **File:** `src/a.ts`',
        '- **File:** `android/app/src/main/AndroidManifest.xml`',
      );
      writeFile(dir, 'remediation-alpha.md', mobile);
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'delivery-order.md');
      writeFile(dir, 'store-submission.md');

      const { code, out } = runValidator(dir);
      expect(out).not.toMatch(/missing required companion/);
      expect(out).not.toMatch(/store-submission\.md not required/);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
