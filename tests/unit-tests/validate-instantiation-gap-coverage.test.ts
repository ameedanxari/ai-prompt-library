/**
 * Gap→remediation coverage (C3) tests for scripts/validate-instantiation.sh.
 *
 * When gap-list.md exists, every "## Gn · <slug>" heading must have a
 * matching remediation-<slug>.md on disk, and orphan remediation files
 * (matching no gap heading) must fail. Without gap-list.md the check
 * does not run.
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

function validRemediationFile(filePath = 'src/a.ts'): string {
  return [
    '## T1 · thing one',
    '- **Closes user story:** As a dev, I want x, so that y.',
    '- **Change type:** create-new',
    `- **File:** \`${filePath}\``,
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

function writeFile(dir: string, name: string, content = '# stub.\n'): void {
  fs.writeFileSync(path.join(dir, name), content);
}

function writeGapList(dir: string, slugs: string[]): void {
  const lines = ['# Gaps', ''];
  slugs.forEach((slug, i) => {
    lines.push(`## G${i + 1} · ${slug}`, 'x', '');
  });
  writeFile(dir, 'gap-list.md', lines.join('\n'));
}

function writeModeCompanions(dir: string): void {
  writeFile(dir, 'external-accounts.md');
  writeFile(dir, 'delivery-order.md');
  writeFile(dir, 'store-submission.md');
}

describe('validate-instantiation gap→remediation coverage (C3)', () => {
  it('passes when every gap has a matching remediation file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gapcov-ok-'));
    try {
      writeGapList(dir, ['alpha-work', 'beta work!']);
      writeFile(dir, 'remediation-alpha-work.md', validRemediationFile('src/a.ts'));
      writeFile(dir, 'remediation-beta-work.md', validRemediationFile('src/b.ts'));
      writeModeCompanions(dir);

      const { code, out } = runValidator(dir);
      expect(out).not.toMatch(/❌ coverage:/);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails naming the slug when a remediation file is missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gapcov-missing-'));
    try {
      writeGapList(dir, ['alpha-work', 'beta-work']);
      writeFile(dir, 'remediation-alpha-work.md', validRemediationFile());
      writeModeCompanions(dir);

      const { code, out } = runValidator(dir);
      expect(code).toBe(1);
      expect(out).toMatch(/❌ coverage: 1 gap\(s\) declared but have no remediation-<gap>\.md/);
      expect(out).toMatch(/remediation-beta-work\.md/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('fails on an orphan remediation file matching no gap heading', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gapcov-orphan-'));
    try {
      writeGapList(dir, ['alpha-work']);
      writeFile(dir, 'remediation-alpha-work.md', validRemediationFile('src/a.ts'));
      writeFile(dir, 'remediation-phantom.md', validRemediationFile('src/b.ts'));
      writeModeCompanions(dir);

      const { code, out } = runValidator(dir);
      expect(code).toBe(1);
      expect(out).toMatch(/remediation-<slug>\.md file\(s\) have no matching gap heading/);
      expect(out).toMatch(/remediation-phantom\.md/);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });

  it('does not run when gap-list.md is absent', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'gapcov-absent-'));
    try {
      writeFile(dir, 'remediation-alpha-work.md', validRemediationFile());
      writeModeCompanions(dir);

      const { code, out } = runValidator(dir);
      expect(out).not.toMatch(/❌ coverage:/);
      expect(code).toBe(0);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
});
