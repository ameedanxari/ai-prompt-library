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

  it('records every concrete file in a coherent unit using canonical field and fence parsing', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-multifile-'));
    try {
      const retained = '{"retained":"do not replace"}\n';
      fs.writeFileSync(path.join(sandbox, 'task-contract.json'), retained);
      writeTask(sandbox, 'tasks-search.md', [
        '## T1 · Deliver search and its regression coverage',
        '- **Change type**: create-new',
        '- **File**: `src/search.ts`, `src/search.test.ts`, `package-lock.json`, `public/search.svg`',
        '```md',
        '## T99 · Example task is inert',
        '- **File:** `src/fake.ts`',
        '```',
      ].join('\n'));
      const { code, ledger } = run(sandbox);
      expect(code).toBe(0);
      expect(ledger).toContain('total_paths: 4');
      for (const file of ['src/search.ts', 'src/search.test.ts', 'package-lock.json', 'public/search.svg']) {
        expect(ledger).toContain(`\`${file}\` — tasks-search.md:T1 (create-new)`);
      }
      expect(ledger).not.toContain('src/fake.ts');
      expect(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8')).toBe(retained);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('detects a collision on the second declared file of a coherent unit', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-second-path-'));
    try {
      writeTask(sandbox, 'tasks-search.md', [
        '## T1 · Search',
        '- **Change type:** create-new',
        '- **File:** `src/search.ts`, `src/search.test.ts`',
        '## T2 · Duplicate regression owner',
        '- **Change type:** create-new',
        '- **File:** `src/search.test.ts`',
      ].join('\n'));
      const { code, ledger } = run(sandbox);
      expect(code).toBe(1);
      expect(ledger).toContain('Same path claimed by multiple tasks');
      expect(ledger).toContain('src/search.test.ts');
      expect(ledger).toContain('total_paths: 3');
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

  describe('creator + modifiers', () => {
    const withSandbox = (fn: (dir: string) => void) => {
      const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ledger-creator-'));
      try {
        fn(sandbox);
      } finally {
        fs.rmSync(sandbox, { recursive: true, force: true });
      }
    };

    it('treats one creator plus two modifiers as clean and lists all claimants, creator first', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'tasks-core.md',
          [
            '## T1 · create',
            '- **Change type:** new-file',
            '- **File:** `src/core/engine.ts`',
            '## T2 · tweak',
            '- **Change type:** modify-existing',
            '- **File:** `src/core/engine.ts`',
          ].join('\n'),
        );
        writeTask(
          sandbox,
          'tasks-extra.md',
          [
            '## T1 · tweak elsewhere',
            '- **Change type:** modify-existing',
            '- **File:** `src/core/engine.ts`',
          ].join('\n'),
        );
        const { code, ledger, out } = run(sandbox);
        expect(code).toBe(0);
        expect(out).not.toMatch(/ordering warnings/);
        expect(ledger!).toMatch(/ledger_state: clean/);
        expect(ledger!).toMatch(/ordering_warnings: 0/);
        expect(ledger!).not.toMatch(/## Ordering warnings/);
        const lines = ledger!.split('\n').filter((l) => l.includes('`src/core/engine.ts`'));
        expect(lines).toHaveLength(1);
        expect(lines[0]).toMatch(/^- `src\/core\/engine\.ts` — tasks-core\.md:T1 \(new-file\)/);
        expect(lines[0]).toContain('tasks-core.md:T2 (modify-existing)');
        expect(lines[0]).toContain('tasks-extra.md:T1 (modify-existing)');
      });
    });

    it('still flags two creators of the same path as a collision (exit 1)', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'tasks-a.md',
          ['## T1 · a', '- **Change type:** new-file', '- **File:** `src/x/thing.ts`'].join('\n'),
        );
        writeTask(
          sandbox,
          'tasks-b.md',
          [
            '## T1 · b',
            '- **Change type:** new-file',
            '- **File:** `src/x/thing.ts`',
            '## T2 · c',
            '- **Change type:** modify-existing',
            '- **File:** `src/x/thing.ts`',
          ].join('\n'),
        );
        const { code, ledger } = run(sandbox);
        expect(code).toBe(1);
        expect(ledger!).toMatch(/ledger_state: collisions_detected/);
        expect(ledger!).toMatch(/Same path claimed by multiple tasks/);
      });
    });

    it('warns (exit 0) when a modifier is numbered before the creator in the same plan file', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'remediation-fix.md',
          [
            '## R2 · early modify',
            '- **Change type:** modify-existing',
            '- **File:** `src/fix/helper.ts`',
            '## R5 · late create',
            '- **Change type:** new-file',
            '- **File:** `src/fix/helper.ts`',
          ].join('\n'),
        );
        const { code, ledger, out } = run(sandbox);
        expect(code).toBe(0);
        expect(out).toMatch(/modify-before-create/);
        expect(ledger!).toMatch(/ledger_state: clean/);
        expect(ledger!).toMatch(/ordering_warnings: 1/);
        expect(ledger!).toMatch(/## Ordering warnings/);
        expect(ledger!).toMatch(/`src\/fix\/helper\.ts` \| remediation-fix\.md:R2 modifies it before remediation-fix\.md:R5/);
      });
    });

    it('does not warn when the modifier is in a different plan file than the creator', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'tasks-a.md',
          ['## T5 · create', '- **Change type:** new-file', '- **File:** `src/a/mod.ts`'].join('\n'),
        );
        writeTask(
          sandbox,
          'tasks-b.md',
          ['## T1 · modify', '- **Change type:** modify-existing', '- **File:** `src/a/mod.ts`'].join('\n'),
        );
        const { code, ledger } = run(sandbox);
        expect(code).toBe(0);
        expect(ledger!).toMatch(/ordering_warnings: 0/);
      });
    });

    it('keeps modify-only paths clean with one line per claimant', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'tasks-a.md',
          ['## T1 · m1', '- **Change type:** modify-existing', '- **File:** `src/old/legacy.ts`'].join('\n'),
        );
        writeTask(
          sandbox,
          'tasks-b.md',
          ['## T1 · m2', '- **Change type:** modify-existing', '- **File:** `src/old/legacy.ts`'].join('\n'),
        );
        const { code, ledger } = run(sandbox);
        expect(code).toBe(0);
        expect(ledger!).toMatch(/ledger_state: clean/);
        expect(ledger!).toContain('- `src/old/legacy.ts` — tasks-a.md:T1 (modify-existing)');
        expect(ledger!).toContain('- `src/old/legacy.ts` — tasks-b.md:T1 (modify-existing)');
        expect(ledger!).not.toMatch(/also modified by/);
      });
    });

    it('does not let a unit without a change type inherit the previous unit\'s change type', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'tasks-inherit.md',
          [
            '## T1 · modify one',
            '- **Change type:** modify-existing',
            '- **File:** `src/one.ts`',
            '## T2 · no change type',
            '- **File:** `src/two.ts`',
            '## T3 · create two',
            '- **Change type:** create-new',
            '- **File:** `src/two.ts`',
          ].join('\n'),
        );
        const { code, ledger, out } = run(sandbox);
        expect(code).toBe(1);
        expect(out).not.toMatch(/modify-before-create/);
        expect(ledger!).toMatch(/ledger_state: collisions_detected/);
        expect(ledger!).toMatch(/Same path claimed by multiple tasks/);
        expect(ledger!).toContain('(unspecified)');
      });
    });

    it('treats unspecified + modify-existing on one path as clean, with no ordering warning', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'tasks-unspec.md',
          [
            '## T1 · unspecified creator',
            '- **File:** `src/shared.ts`',
            '## T2 · modify',
            '- **Change type:** modify-existing',
            '- **File:** `src/shared.ts`',
          ].join('\n'),
        );
        const { code, ledger } = run(sandbox);
        expect(code).toBe(0);
        expect(ledger!).toMatch(/ledger_state: clean/);
        expect(ledger!).toMatch(/ordering_warnings: 0/);
        expect(ledger!).toMatch(/\(unspecified\); also modified by: tasks-unspec\.md:T2 \(modify-existing\)/);
      });
    });

    it('labels remediation claimants with their real plan file name', () => {
      withSandbox((sandbox) => {
        writeTask(
          sandbox,
          'remediation-fix.md',
          [
            '## R1 · create',
            '- **Change type:** new-file',
            '- **File:** `src/fix/a.ts`',
            '## R2 · modify',
            '- **Change type:** modify-existing',
            '- **File:** `src/fix/a.ts`',
          ].join('\n'),
        );
        const { code, ledger } = run(sandbox);
        expect(code).toBe(0);
        expect(ledger!).toContain('- `src/fix/a.ts` — remediation-fix.md:R1 (new-file); also modified by: remediation-fix.md:R2 (modify-existing)');
        expect(ledger!).not.toContain('tasks-fix.md');
      });
    });
  });
});
