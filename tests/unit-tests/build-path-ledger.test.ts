/**
 * build-path-ledger.sh — derives path-ledger.md from every File: field
 * in the plan, refuses to pass when the plan declares collisions.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'build-path-ledger.sh');

const run = (dir: string): { out: string; code: number; ledger: string | null } => {
  let out = '';
  let code = 0;
  try {
    out = execSync(`bash "${SCRIPT}" "${dir}"`, { encoding: 'utf8' });
  } catch (e) {
    const err = e as { stdout?: Buffer; stderr?: Buffer; status?: number };
    out = (err.stdout?.toString() ?? '') + (err.stderr?.toString() ?? '');
    code = err.status ?? 0;
  }
  const ledgerPath = path.join(dir, 'path-ledger.md');
  const ledger = fs.existsSync(ledgerPath) ? fs.readFileSync(ledgerPath, 'utf8') : null;
  return { out, code, ledger };
};

const writeTask = (dir: string, name: string, body: string) => {
  fs.writeFileSync(path.join(dir, name), body);
};

describe('build-path-ledger.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('exits 2 when no plan files are present', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-empty-'));
    try {
      const { code } = run(sandbox);
      expect(code).toBe(2);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('emits a clean ledger when the plan has no collisions', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-clean-'));
    try {
      writeTask(
        sandbox,
        'tasks-auth.md',
        [
          '# Tasks — Auth',
          '## T1 · Signup',
          '- **File:** `src/auth/signup.ts`',
          '## T2 · Login',
          '- **File:** `src/auth/login.ts`',
        ].join('\n'),
      );
      writeTask(
        sandbox,
        'tasks-user.md',
        ['# Tasks — User', '## T1 · Profile', '- **File:** `src/user/profile.ts`'].join('\n'),
      );
      const { code, ledger } = run(sandbox);
      expect(code).toBe(0);
      expect(ledger).toBeTruthy();
      expect(ledger!).toMatch(/ledger_state: clean/);
      expect(ledger!).toMatch(/total_paths: 3/);
      expect(ledger!).toMatch(/`src\/auth\/signup\.ts`/);
      expect(ledger!).toMatch(/`src\/user\/profile\.ts`/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('flags Collision A: same path claimed by two tasks', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-collide-a-'));
    try {
      writeTask(
        sandbox,
        'tasks-a.md',
        ['## T1 · X', '- **File:** `src/shared/util.ts`'].join('\n'),
      );
      writeTask(
        sandbox,
        'tasks-b.md',
        ['## T1 · Y', '- **File:** `src/shared/util.ts`'].join('\n'),
      );
      const { code, ledger } = run(sandbox);
      expect(code).toBe(1);
      expect(ledger!).toMatch(/ledger_state: collisions_detected/);
      expect(ledger!).toMatch(/Same path claimed by multiple tasks/);
      expect(ledger!).toMatch(/src\/shared\/util\.ts/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('flags Collision B: same basename, same role, different dirs (singular/plural)', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-collide-b-'));
    try {
      writeTask(
        sandbox,
        'tasks-a.md',
        ['## T1 · age', '- **File:** `android/app/src/main/filter/AgeFilter.kt`'].join('\n'),
      );
      writeTask(
        sandbox,
        'tasks-b.md',
        ['## T1 · age2', '- **File:** `android/app/src/main/filters/AgeFilter.kt`'].join('\n'),
      );
      const { code, ledger } = run(sandbox);
      expect(code).toBe(1);
      expect(ledger!).toMatch(/Same basename under two directories/);
      expect(ledger!).toMatch(/AgeFilter\.kt/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('does NOT flag a models/ class + behaviour class of the same basename', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-legit-pair-'));
    try {
      writeTask(
        sandbox,
        'tasks-rec.md',
        [
          '## T1 · behaviour',
          '- **File:** `android/app/src/main/storage/AppRecommender.kt`',
          '## T3 · model',
          '- **File:** `android/app/src/main/models/AppRecommendation.kt`',
        ].join('\n'),
      );
      const { code } = run(sandbox);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('does NOT flag reused asset basenames across device/locale dirs (screenshots)', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-assets-'));
    try {
      writeTask(
        sandbox,
        'tasks-screenshots.md',
        [
          '## T1 · pixel_7 en',
          '- **File:** `fastlane/screenshots/en-US/pixel_7/1_dashboard.png`',
          '## T2 · iphone en',
          '- **File:** `fastlane/screenshots/en-US/iphone-6.7-inch/1_dashboard.png`',
        ].join('\n'),
      );
      const { code } = run(sandbox);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('skips File: entries that are N/A / none / TBD', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-skip-'));
    try {
      writeTask(
        sandbox,
        'tasks-api.md',
        [
          '## T1 · docs',
          '- **File:** `docs/api.md`',
          '## T2 · skipped',
          '- **File:** N/A',
          '## T3 · also skipped',
          '- **File:** none',
        ].join('\n'),
      );
      const { code, ledger } = run(sandbox);
      expect(code).toBe(0);
      expect(ledger!).toMatch(/total_paths: 1/);
      expect(ledger!).toMatch(/`docs\/api\.md`/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
