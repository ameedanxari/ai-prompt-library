/**
 * UI-task pattern regression tests for scripts/validate-instantiation.sh.
 *
 * The bare "graph" token was removed from UI_TASK_PATTERN because it
 * matched backend/tooling usage (build-task-graph.sh, task-graph.json,
 * "dependency graph") and misclassified non-UI work as UI-heavy.
 * These tests pin the narrowed pattern: tooling names no longer match,
 * every remaining alternative still matches, and the end-to-end 4c gate
 * behaves accordingly. The pattern is extracted from the script file,
 * never duplicated, so the test cannot silently diverge.
 */
import { describe, expect, it } from 'vitest';
import { execFileSync, spawnSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-instantiation.sh');

function getPattern(): string {
  const script = fs.readFileSync(VALIDATOR, 'utf8');
  const m = script.match(/^UI_TASK_PATTERN='(.*)'$/m);
  expect(m).not.toBeNull();
  return (m as RegExpMatchArray)[1];
}

function getAlternatives(pattern: string): string[] {
  // Pattern shape: (^|[^[:alpha:]])(alt1|alt2|...)([^[:alpha:]]|$).
  // The alternatives are the middle parenthesized group (no nested parens).
  const groups = [...pattern.matchAll(/\(([^()]*)\)/g)].map((m) => m[1]);
  expect(groups.length).toBe(3);
  return groups[1].split('|');
}

/** Native ERE matching via grep, since the pattern uses POSIX classes. */
function matches(pattern: string, subject: string): boolean {
  const r = spawnSync('grep', ['-Eiq', '--', pattern], { input: subject });
  return r.status === 0;
}

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

function taskFile(fileField: string, preciseChange: string): string {
  return [
    '## T1 · thing one',
    '- **Closes user story:** As a dev, I want x, so that y.',
    '- **Change type:** modify-existing',
    `- **File:** \`${fileField}\``,
    `- **Precise change:** ${preciseChange}`,
    '- **Acceptance:**',
    '  - A is present.',
    '  - B is present.',
    '  - C is present.',
    '- **Test:** `npx vitest --run tests/unit-tests/x.test.ts`',
    '- **Estimated LOC:** +5',
    '- **Depends on:** none',
    '- **Phase:** mvp',
    '',
  ].join('\n');
}

describe('UI_TASK_PATTERN narrowing', () => {
  it('no longer contains the bare graph token', () => {
    expect(getAlternatives(getPattern())).not.toContain('graph');
  });

  it('does not match tooling names', () => {
    const pattern = getPattern();
    for (const tooling of [
      'scripts/build-task-graph.sh',
      'task-graph.json',
      'dependency graph',
    ]) {
      expect(matches(pattern, tooling)).toBe(false);
    }
  });

  it('every remaining alternative still matches its intended strings', () => {
    const pattern = getPattern();
    const alts = getAlternatives(pattern);
    expect(alts.length).toBeGreaterThan(10);
    for (const alt of alts) {
      const rep = alt.replace(/\[ -\]/g, ' ');
      expect(matches(pattern, `x ${rep} y`)).toBe(true);
    }
  });

  it('end-to-end: task-graph builder task passes the 4c gate', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uipat-ok-'));
    try {
      fs.writeFileSync(
        path.join(dir, 'remediation-graph.md'),
        taskFile('scripts/build-task-graph.sh', 'fix the topological ordering'),
      );
      for (const name of ['external-accounts.md', 'delivery-order.md', 'store-submission.md']) {
        fs.writeFileSync(path.join(dir, name), '# stub.\n');
      }
      const { code, out } = runValidator(dir);
      expect(out).not.toMatch(/UI-heavy task lacks design evidence/);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('end-to-end: genuine UI task still fails without design evidence', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'uipat-still-'));
    try {
      fs.writeFileSync(
        path.join(dir, 'remediation-ui.md'),
        taskFile('src/a.ts', 'restyle the frontend header'),
      );
      for (const name of ['external-accounts.md', 'delivery-order.md', 'store-submission.md']) {
        fs.writeFileSync(path.join(dir, name), '# stub.\n');
      }
      const { code, out } = runValidator(dir);
      expect(code).toBe(1);
      expect(out).toMatch(/UI-heavy task lacks design evidence/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
