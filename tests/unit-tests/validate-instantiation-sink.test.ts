/**
 * Injection-sink regression tests for scripts/validate-instantiation.sh.
 *
 * The 0a tamper-detection block reads `revise-report.md` — an
 * attacker-influenced file by design (it exists to catch hand-written
 * mimics). These tests prove report contents are never interpolated into
 * interpreted code: values travel to python3 via environment variables,
 * and the temp file uses mktemp instead of a predictable /tmp path.
 *
 * The hostile `revised_at` fixture below is shaped like the original
 * breakout payload, but it is INERT DATA to the fixed script — it is
 * passed via the environment and rejected by ISO-8601 validation. The
 * test asserts it never executes (no canary file, clean rejection, no
 * Python traceback). This file never attempts to verify exploitability
 * of the original code; it only verifies the fixed code is a closed sink.
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
    const out = execFileSync('/bin/bash', [VALIDATOR, dir], { encoding: 'utf8' });
    return { code: 0, out: out.toString() };
  } catch (error) {
    const failure = error as { status?: number; stdout?: unknown; stderr?: unknown };
    const stdout = failure.stdout?.toString() ?? '';
    const stderr = failure.stderr?.toString() ?? '';
    return { code: failure.status ?? 1, out: `${stdout}${stderr}` };
  }
}

function minimalTasksFile(): string {
  return [
    '## T1 · thing',
    '- **Closes user story:** As a dev, I want x, so that y.',
    '- **Change type:** create-new',
    '- **File:** `src/a.ts`',
    '- **Precise change:** add function.',
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

describe('validate-instantiation.sh injection sinks', () => {
  it('is executable', () => {
    expect((fs.statSync(VALIDATOR).mode & 0o111) !== 0).toBe(true);
  });

  it('does not execute a quote-breakout payload in revised_at', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'val-sink-'));
    // Spaceless so `tr -d '[:space:]'` cannot mangle it; unique per run.
    const canary = path.join(os.tmpdir(), `dprompt-sink-canary-${process.pid}`);
    // Shaped like the original python3 -c breakout: closes the single-quoted
    // string, runs code, reopens it. To the FIXED script this is inert data
    // passed via the REVISED_AT environment variable.
    const hostileRevisedAt = `';__import__("pathlib").Path("${canary}").write_text("x");s='x:00:00`;
    try {
      fs.writeFileSync(path.join(dir, 'tasks-x.md'), minimalTasksFile());
      fs.writeFileSync(
        path.join(dir, 'revise-report.md'),
        [
          '---',
          `revised_at: ${hostileRevisedAt}`,
          'checks_passed: [C1]',
          'checks_failed: []',
          'executor_gate: pass',
          '---',
          '',
        ].join('\n'),
      );

      const { code, out } = runValidator(dir);

      expect(fs.existsSync(canary)).toBe(false);
      expect(code).toBe(1);
      expect(out).toMatch(/not a parseable ISO-8601 timestamp/);
      expect(out).not.toMatch(/Traceback/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
      fs.rmSync(canary, { force: true });
    }
  });

  it('handles a single quote in the target directory path', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), `val-sink-quote'-`));
    try {
      fs.writeFileSync(path.join(dir, 'tasks-x.md'), minimalTasksFile());
      const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      fs.writeFileSync(
        path.join(dir, 'revise-report.md'),
        [
          '---',
          `revised_at: ${now}`,
          'checks_passed: [C1]',
          'checks_failed: []',
          'executor_gate: pass',
          '---',
          '',
        ].join('\n'),
      );

      const { out } = runValidator(dir);

      // If $TARGET_DIR were interpolated into the python3 -c source, the
      // quote would break the Python string: getmtime would fail and the
      // report would be flagged "not within 48h of file mtime" (or a
      // traceback would leak). The env-var passing keeps the path intact.
      expect(out).not.toMatch(/not within 48h of file mtime/);
      expect(out).not.toMatch(/Traceback/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not create predictable /tmp/revise-head.* files', () => {
    const before = new Set(
      fs.readdirSync(os.tmpdir()).filter((name) => name.startsWith('revise-head.')),
    );
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'val-sink-tmp-'));
    try {
      fs.writeFileSync(path.join(dir, 'tasks-x.md'), minimalTasksFile());
      const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
      fs.writeFileSync(
        path.join(dir, 'revise-report.md'),
        [
          '---',
          `revised_at: ${now}`,
          'checks_passed: [C1]',
          'checks_failed: []',
          'executor_gate: pass',
          '---',
          '',
        ].join('\n'),
      );

      runValidator(dir);

      const after = fs
        .readdirSync(os.tmpdir())
        .filter((name) => name.startsWith('revise-head.') && !before.has(name));
      expect(after).toEqual([]);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
