/**
 * G6 Option B — store-submission.md conditional companion tests.
 *
 * store-submission.md is required only when plan files mention mobile
 * artifacts: reverse-DNS bundle IDs (com./io./app.), bundle ID /
 * applicationId declarations, xcodeproj, xcworkspace, TestFlight,
 * Play Console, Google Play, App Store, .ipa, .aab, .apk.
 * Non-mobile runs skip it entirely — no stub file is needed.
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

function validRemediationFile(extraLine = ''): string {
  return [
    '## T1 · thing one',
    '- **Closes user story:** As a dev, I want x, so that y.',
    '- **Change type:** create-new',
    '- **File:** `src/a.ts`',
    '- **Precise change:** add function a.',
    extraLine,
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

function writeFile(dir: string, name: string, content = '# stub.\n'): void {
  fs.writeFileSync(path.join(dir, name), content);
}

// Every mobile indicator from the G6 spec must trigger the requirement.
const MOBILE_INDICATORS: Array<[string, string]> = [
  ['reverse-DNS bundle ID (com.)', 'ships under the com.acme.taskapp bundle'],
  ['reverse-DNS bundle ID (io.)', 'ships under the io.acme.taskapp bundle'],
  ['reverse-DNS bundle ID (app.)', 'ships under the app.acme.taskapp bundle'],
  ['bundle ID wording', 'Bundle ID: com.acme.taskapp'],
  ['applicationId', 'applicationId "com.acme.taskapp"'],
  ['xcodeproj', 'open ios/Runner.xcodeproj to sign'],
  ['xcworkspace', 'open ios/Runner.xcworkspace to sign'],
  ['TestFlight', 'upload the build to TestFlight'],
  ['Play Console', 'create the release in Play Console'],
  ['Google Play', 'publish the listing on Google Play'],
  ['App Store', 'submit the listing to the App Store'],
  ['.ipa artifact', 'sign the app-release.ipa'],
  ['.aab artifact', 'upload the app-release.aab'],
  ['.apk artifact', 'sideload the app-debug.apk'],
];

describe('validate-instantiation store-submission scoping (G6 Option B)', () => {
  it.each(MOBILE_INDICATORS)(
    'requires store-submission.md when a plan file mentions %s',
    (_label, indicator) => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'store-submission-mobile-'));
      try {
        writeFile(
          dir,
          'remediation-alpha.md',
          validRemediationFile(`- **Note:** ${indicator}.`),
        );
        writeFile(dir, 'external-accounts.md');
        writeFile(dir, 'delivery-order.md');
        // Deliberately omit store-submission.md.

        const { code, out } = runValidator(dir);
        expect(code).toBe(1);
        expect(out).toMatch(/missing required companion: .*store-submission\.md/);
      } finally {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    },
  );

  it('does not require store-submission.md for a non-mobile plan', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'store-submission-nomobile-'));
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

  it('passes when mobile artifacts are mentioned and store-submission.md exists', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'store-submission-mobile-ok-'));
    try {
      writeFile(
        dir,
        'tasks-alpha.md',
        validRemediationFile('- **Note:** upload the build to TestFlight.'),
      );
      writeFile(dir, 'external-accounts.md');
      writeFile(dir, 'delivery-order.md');
      writeFile(dir, 'product-vision.md');
      writeFile(dir, 'architecture.md');
      writeFile(dir, 'release-plan.md');
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
