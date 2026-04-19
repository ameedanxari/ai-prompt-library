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

  it('accepts a well-formed remediation file', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'val-ok-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'remediation-good.md'),
        [
          '# Remediation — good',
          '',
          '## R1 · do the thing',
          '- **Change type:** modify-existing',
          '- **File:** `src/app.ts`',
          '- **Precise change:** add `export function hello()` returning `"hi"`.',
          '- **Acceptance:**',
          '  - `hello()` returns the exact string `hi`.',
          '  - File exports exactly one symbol named `hello`.',
          '- **Test:** `src/app.test.ts` (new) — calls hello, asserts return.',
          '- **Estimated LOC delta:** +5',
          '- **Depends on:** none',
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
