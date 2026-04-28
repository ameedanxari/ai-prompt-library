/**
 * step3-progress.sh — the checklist the agent runs during Step 3.
 * Derived from disk state, grouped by epic, [x] or [ ] per feature.
 */

import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'step3-progress.sh');

const run = (dir: string): { out: string; code: number } => {
  let out = '';
  let code = 0;
  try {
    out = execSync(`bash "${SCRIPT}" "${dir}"`, { encoding: 'utf8' });
  } catch (e) {
    const err = e as { stdout?: Buffer; status?: number };
    out = err.stdout?.toString() ?? '';
    code = err.status ?? 0;
  }
  return { out, code };
};

describe('step3-progress.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('exits 2 when no features-*.md present', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'step3-nofeat-'));
    try {
      const { code } = run(sandbox);
      expect(code).toBe(2);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('exits 0 and reports 100% when every feature has a tasks file', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'step3-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-auth.md'),
        ['# Features — Auth', '', '## Sign up', 'x', '', '## Sign in', 'x'].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'tasks-sign-up.md'), '## T1 · x\n');
      fs.writeFileSync(path.join(sandbox, 'tasks-sign-in.md'), '## T1 · x\n');
      const { out, code } = run(sandbox);
      expect(code).toBe(0);
      expect(out).toMatch(/Progress: 2 \/ 2 \(100%\)/);
      expect(out).toMatch(/Step 3 complete/);
      expect(out).toMatch(/- \[x\] `tasks-sign-up\.md`/);
      expect(out).toMatch(/- \[x\] `tasks-sign-in\.md`/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('exits 1 and lists unchecked items when tasks files are missing', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'step3-partial-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-auth.md'),
        [
          '# Features — Auth',
          '',
          '## Sign up',
          'x',
          '',
          '## Sign in',
          'x',
          '',
          '## Password reset',
          'x',
        ].join('\n'),
      );
      fs.writeFileSync(path.join(sandbox, 'tasks-sign-up.md'), '## T1 · x\n');
      const { out, code } = run(sandbox);
      expect(code).toBe(1);
      expect(out).toMatch(/Progress: 1 \/ 3/);
      expect(out).toMatch(/- \[x\] `tasks-sign-up\.md`/);
      expect(out).toMatch(/- \[ \] `tasks-sign-in\.md`/);
      expect(out).toMatch(/- \[ \] `tasks-password-reset\.md`/);
      expect(out).toMatch(/Step 3 incomplete/);
      expect(out).toMatch(/Do NOT advance/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('groups the checklist by epic', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'step3-groups-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-auth.md'),
        ['# Features — Auth', '', '## Sign up', 'x'].join('\n'),
      );
      fs.writeFileSync(
        path.join(sandbox, 'features-billing.md'),
        ['# Features — Billing', '', '## Checkout', 'x'].join('\n'),
      );
      const { out } = run(sandbox);
      expect(out).toMatch(/## auth/);
      expect(out).toMatch(/## billing/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});

describe('integration with engine + steering + revise', () => {
  it('engine Step 3 section references the progress script', () => {
    const body = fs.readFileSync(
      path.join(
        REPO_ROOT,
        'prompts',
        'orchestrators',
        'drill-down-engine.md',
      ),
      'utf8',
    );
    expect(body).toMatch(/bash \.ai-prompts\/scripts\/step3-progress\.sh/);
    expect(body).toMatch(/Do NOT advance to the Revise Gate/);
  });

  it('steering file carries the progress-checklist guard', () => {
    const body = fs.readFileSync(
      path.join(REPO_ROOT, 'prompts', 'steering', 'library-context.md'),
      'utf8',
    );
    expect(body).toMatch(/Progress-checklist guard/);
    expect(body).toMatch(/step3-progress\.sh/);
  });

  it('revise.sh points at progress script from the coverage-gap section', () => {
    const body = fs.readFileSync(
      path.join(REPO_ROOT, 'scripts', 'revise.sh'),
      'utf8',
    );
    expect(body).toMatch(/step3-progress\.sh/);
  });
});
