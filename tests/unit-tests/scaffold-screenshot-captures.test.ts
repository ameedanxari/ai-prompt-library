/**
 * Unit tests for scripts/scaffold-screenshot-captures.sh.
 *
 * The scaffolder generates the app-store screenshot task matrix —
 * 2 tooling tasks + (locales × devices × frames) capture tasks, each
 * conforming to the canonical task schema. Output must pass the
 * validator without edits.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCAFFOLD = path.join(REPO_ROOT, 'scripts', 'scaffold-screenshot-captures.sh');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-instantiation.sh');

function scaffold(args: string[]): string {
  const quoted = args.map((a) => `"${a}"`).join(' ');
  return execSync(`bash "${SCAFFOLD}" ${quoted}`, { encoding: 'utf8' });
}

function passingReviseReport(): string {
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  return [
    '---',
    `revised_at: ${now}`,
    'engine: drill-down-engine',
    'plan_files: 2',
    'checks_run: [C1]',
    'checks_passed: [all]',
    'checks_failed: []',
    'regenerations_performed: []',
    'remaining_issues: []',
    'executor_gate: pass',
    '---',
    '',
  ].join('\n');
}

describe('scaffold-screenshot-captures.sh', () => {
  it('iOS defaults: 5 locales × 3 devices × 1 frame = 15 captures + 2 tooling', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-ios-'));
    try {
      const out = scaffold(['--target', dir, '--platform', 'ios', '--app-name', 'TestApp']);
      expect(out).toMatch(/total tasks: 17 \(2 tooling \+ 15 captures\)/);
      const body = fs.readFileSync(path.join(dir, 'tasks-screenshots-ios.md'), 'utf8');
      // Tooling tasks
      expect(body).toMatch(/## T1 · Fastlane config for ios/);
      expect(body).toMatch(/## T2 · Screenshot verification helper/);
      expect(body).toMatch(/`fastlane\/Snapfile`/);
      // 15 capture tasks, one per locale × device
      const captureHeadings = body.match(/^## T\d+ · Screenshot — /gm) ?? [];
      expect(captureHeadings.length).toBe(15);
      // All capture tasks use a concrete PNG File path
      const imageFiles = body.match(/\*\*File:\*\* `[^`]+\.png`/g) ?? [];
      expect(imageFiles.length).toBe(15);
      // No capture task collapses axes — each mentions exactly one locale and one device
      for (const m of body.matchAll(/^## T(\d+) · Screenshot — (\S+) \/ (\S+) \/ (\S+)$/gm)) {
        const [, , locale, device, frame] = m;
        expect(locale).not.toContain(',');
        expect(device).not.toContain(',');
        expect(frame).not.toContain(',');
      }
      // Concrete fastlane snapshot command present
      expect(body).toMatch(/bundle exec fastlane snapshot --devices \S+ --languages \S+ --only_testing/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('Android uses fastlane screengrab and Screengrabfile, not Snapfile', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-and-'));
    try {
      scaffold(['--target', dir, '--platform', 'android', '--app-name', 'TestApp']);
      const body = fs.readFileSync(path.join(dir, 'tasks-screenshots-android.md'), 'utf8');
      expect(body).toMatch(/`fastlane\/Screengrabfile`/);
      expect(body).toMatch(/bundle exec fastlane screengrab --devices/);
      expect(body).not.toMatch(/Snapfile/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('respects --locales, --devices, --frames and computes the matrix count', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-matrix-'));
    try {
      const out = scaffold([
        '--target', dir, '--platform', 'ios',
        '--app-name', 'App',
        '--locales', 'en-US,ja-JP',
        '--devices', 'iphone-6.7-inch,iphone-5.5-inch',
        '--frames', 'home,settings,detail',
      ]);
      // 2 × 2 × 3 = 12 captures
      expect(out).toMatch(/total tasks: 14 \(2 tooling \+ 12 captures\)/);
      const body = fs.readFileSync(path.join(dir, 'tasks-screenshots-ios.md'), 'utf8');
      expect(body.match(/^## T\d+ · Screenshot — /gm)!.length).toBe(12);
      // All three frames represented
      expect(body).toMatch(/\/ home$/m);
      expect(body).toMatch(/\/ settings$/m);
      expect(body).toMatch(/\/ detail$/m);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('scaffolded output passes the instantiation validator without edits', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-val-'));
    try {
      scaffold(['--target', dir, '--platform', 'ios', '--app-name', 'TestApp']);
      fs.writeFileSync(
        path.join(dir, 'features-screenshots-ios.md'),
        '# Features — screenshots-ios\n\n## Screenshots iOS\nx\n',
      );
      fs.writeFileSync(
        path.join(dir, 'external-accounts.md'),
        '# External Accounts Required\n',
      );
      fs.writeFileSync(path.join(dir, 'revise-report.md'), passingReviseReport());
      const out = execSync(`bash "${VALIDATOR}" "${dir}"`, { encoding: 'utf8' });
      expect(out).toMatch(/✅/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('refuses to overwrite an existing file unless --force is passed', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-force-'));
    try {
      scaffold(['--target', dir, '--platform', 'ios']);
      let code = 0;
      try {
        scaffold(['--target', dir, '--platform', 'ios']);
      } catch (e) {
        const err = e as { status?: number };
        code = err.status ?? 0;
      }
      expect(code).toBe(2);
      // With --force, it must succeed
      const out = scaffold(['--target', dir, '--platform', 'ios', '--force']);
      expect(out).toMatch(/scaffolded/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('rejects a missing or invalid --platform', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scaffold-bad-plat-'));
    try {
      // No platform
      let code1 = 0;
      try {
        execSync(`bash "${SCAFFOLD}" --target "${dir}"`, { encoding: 'utf8' });
      } catch (e) {
        code1 = (e as { status?: number }).status ?? 0;
      }
      expect(code1).toBe(1);
      // Invalid platform
      let code2 = 0;
      try {
        execSync(`bash "${SCAFFOLD}" --target "${dir}" --platform windows`, {
          encoding: 'utf8',
        });
      } catch (e) {
        code2 = (e as { status?: number }).status ?? 0;
      }
      expect(code2).toBe(1);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
