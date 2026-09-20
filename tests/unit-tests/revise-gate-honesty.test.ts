/**
 * Revise-gate honesty tests for scripts/revise.sh.
 *
 * Phase 0 trust fix: the old revise-report.md claimed C1–C18 checks that
 * no script performed. These tests pin the honest contract —
 * `checks_run` lists ONLY what the two validators mechanically execute,
 * `remaining_issues` is a machine-derived YAML list (schema v2), and the
 * exit code matches `executor_gate`.
 */
import { describe, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const REVISE = path.join(REPO_ROOT, 'scripts', 'revise.sh');

// The ONLY C-checks the mechanical core can claim. Everything else
// (C1, C8, C9, C10, C12–C18) is agent judgment performed by
// following prompts/orchestrators/revise-outputs.md, never by the script.
// C3 (gap→remediation coverage) is mechanical only for gap-closure runs
// where gap-list.md exists.
const MECHANICAL_CHECKS = new Set(['C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C11']);

function runRevise(dir: string): { code: number; out: string } {
  try {
    const out = execFileSync('/bin/bash', [REVISE, dir], { encoding: 'utf8' });
    return { code: 0, out: out.toString() };
  } catch (error) {
    const failure = error as { status?: number; stdout?: unknown; stderr?: unknown };
    const stdout = failure.stdout?.toString() ?? '';
    const stderr = failure.stderr?.toString() ?? '';
    return { code: failure.status ?? 1, out: `${stdout}${stderr}` };
  }
}

function validTasksFile(): string {
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

function brokenTasksFile(): string {
  // Missing the **Test:** field → C4 schema violation.
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
    '- **Estimated LOC:** +5',
    '- **Depends on:** none',
    '- **Phase:** mvp',
    '',
  ].join('\n');
}

function writeCompanionStubs(dir: string): void {
  for (const name of [
    'external-accounts.md',
    'delivery-order.md',
    'product-vision.md',
    'architecture.md',
    'release-plan.md',
    'store-submission.md',
    'ux-flows.md',
  ]) {
    fs.writeFileSync(path.join(dir, name), '# stub for test fixture.\n');
  }
}

function readReport(dir: string): string {
  return fs.readFileSync(path.join(dir, 'revise-report.md'), 'utf8');
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

function writeRemediationCompanions(dir: string): void {
  // Gap-closure mode companions only: no Stream A artifacts.
  for (const name of [
    'external-accounts.md',
    'delivery-order.md',
    'store-submission.md',
  ]) {
    fs.writeFileSync(path.join(dir, name), '# stub for test fixture.\n');
  }
}

function checksFailed(report: string): string {
  const line = report.split('\n').find((l) => l.startsWith('checks_failed:'));
  expect(line).toBeDefined();
  return line as string;
}

function checksPassed(report: string): string {
  const line = report.split('\n').find((l) => l.startsWith('checks_passed:'));
  expect(line).toBeDefined();
  return line as string;
}

function checksRun(report: string): string[] {
  const line = report.split('\n').find((l) => l.startsWith('checks_run:'));
  expect(line).toBeDefined();
  return [...(line as string).matchAll(/C\d+/g)].map((m) => m[0]);
}

describe('revise.sh gate honesty', () => {
  it('is executable', () => {
    expect((fs.statSync(REVISE).mode & 0o111) !== 0).toBe(true);
  });

  it('fails honestly on a schema violation: exit 1, gate fail, machine-readable remaining_issues', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revise-honesty-fail-'));
    try {
      fs.writeFileSync(path.join(dir, 'tasks-x.md'), brokenTasksFile());
      writeCompanionStubs(dir);

      const { code } = runRevise(dir);
      expect(code).toBe(1);

      const report = readReport(dir);
      expect(report).toMatch(/executor_gate: fail/);
      expect(report).toMatch(/report_schema_version: 2/);

      // remaining_issues is a non-empty machine-readable list.
      const issuesBlock = report.split('remaining_issues:')[1].split('failing_files:')[0];
      expect(issuesBlock).toMatch(/- \{file: "tasks-x\.md", issue: /);

      // checks_run claims no check the script cannot perform.
      for (const check of checksRun(report)) {
        expect(MECHANICAL_CHECKS.has(check)).toBe(true);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('passes honestly on a valid plan: exit 0, gate pass, empty remaining_issues', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revise-honesty-pass-'));
    try {
      fs.writeFileSync(path.join(dir, 'tasks-x.md'), validTasksFile());
      writeCompanionStubs(dir);

      const { code } = runRevise(dir);
      expect(code).toBe(0);

      const report = readReport(dir);
      expect(report).toMatch(/executor_gate: pass/);
      expect(report).toMatch(/report_schema_version: 2/);
      expect(report).toMatch(/remaining_issues: \[\]/);

      for (const check of checksRun(report)) {
        expect(MECHANICAL_CHECKS.has(check)).toBe(true);
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  // G1 fail-path contract: checks_failed / checks_passed name real checks,
  // never narrative dodges.
  it('fail path names the failing check: schema violation → checks_failed lists C4', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revise-honesty-failpath-'));
    try {
      fs.writeFileSync(path.join(dir, 'tasks-x.md'), brokenTasksFile());
      writeCompanionStubs(dir);

      const { code } = runRevise(dir);
      expect(code).toBe(1);

      const report = readReport(dir);
      expect(report).toMatch(/executor_gate: fail/);

      const failed = checksFailed(report);
      expect(failed).toMatch(/C4/);
      expect(failed).not.toMatch(/see regenerations_performed/);
      expect(failed).not.toMatch(/validator reported issues/);

      const passed = checksPassed(report);
      expect(passed).not.toMatch(/see regenerations_performed/);
      expect(passed).not.toMatch(/validator reported issues/);
      // C4 failed, so it must not appear in checks_passed.
      expect(passed).not.toMatch(/C4/);

      // Every C-number in both lists belongs to the honest set.
      for (const line of [failed, passed]) {
        for (const m of line.matchAll(/C\d+/g)) {
          expect(MECHANICAL_CHECKS.has(m[0])).toBe(true);
        }
      }
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fail path derives C3 for a missing remediation file (gap-closure)', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'revise-honesty-c3-'));
    try {
      fs.writeFileSync(
        path.join(dir, 'gap-list.md'),
        ['# Gaps', '', '## G1 · alpha', 'x', '', '## G2 · beta', 'x', ''].join('\n'),
      );
      fs.writeFileSync(path.join(dir, 'remediation-alpha.md'), validRemediationFile());
      writeRemediationCompanions(dir);

      const { code } = runRevise(dir);
      expect(code).toBe(1);

      const report = readReport(dir);
      expect(report).toMatch(/executor_gate: fail/);

      // The missing remediation-beta.md is a C3 gap-coverage failure.
      const failed = checksFailed(report);
      expect(failed).toMatch(/C3/);

      // Gap-closure runs include C3 in the honest checks_run set.
      for (const check of checksRun(report)) {
        expect(MECHANICAL_CHECKS.has(check)).toBe(true);
      }
      expect(checksRun(report)).toContain('C3');
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
