import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BUILD_CONTRACT = path.join(REPO_ROOT, 'scripts', 'build-task-contract.sh');
const VALIDATE_CONTRACT = path.join(REPO_ROOT, 'scripts', 'validate-task-contract.sh');

function run(command: string): { code: number; out: string } {
  try {
    return { code: 0, out: execSync(command, { encoding: 'utf8' }) };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function writeTask(dir: string, filename: string, lines: string[]) {
  fs.writeFileSync(path.join(dir, filename), `${lines.join('\n')}\n`, 'utf8');
}

function taskLines(opts: {
  title: string;
  file?: string;
  phase?: string;
  depends?: string;
  test?: string;
}) {
  const lines = [
    `## T1 - ${opts.title}`,
    '- **Closes user story:** As a user, I want this task, so that the app progresses.',
    '- **Change type:** create-new',
  ];
  if (opts.file !== undefined) lines.push(`- **File:** ${opts.file}`);
  lines.push('- **Precise change:** implement the described task delta in the named file.');
  lines.push('- **Acceptance:**');
  lines.push('  - The file contains the described implementation.');
  lines.push('  - The task-specific behavior is covered by the named test.');
  lines.push('  - No unrelated files are changed by this task.');
  if (opts.depends !== undefined) lines.push(`- **Depends on:** ${opts.depends}`);
  if (opts.test !== undefined) lines.push(`- **Test:** ${opts.test}`);
  lines.push('- **Estimated LOC:** ~10');
  if (opts.phase !== undefined) lines.push(`- **Phase:** ${opts.phase}`);
  return lines;
}

describe('build-task-contract.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(BUILD_CONTRACT)).toBe(true);
    expect((fs.statSync(BUILD_CONTRACT).mode & 0o111) !== 0).toBe(true);
    expect(fs.existsSync(VALIDATE_CONTRACT)).toBe(true);
    expect((fs.statSync(VALIDATE_CONTRACT).mode & 0o111) !== 0).toBe(true);
  });

  it('uses the TypeScript CLI instead of embedding a second parser', () => {
    const body = fs.readFileSync(BUILD_CONTRACT, 'utf8');

    expect(body).toMatch(/dist\/task-contract\/cli\.js/);
    expect(body).not.toMatch(/python3 -/);
    expect(body).not.toMatch(/HEADING_RE|FIELD_RE|build_issues/);
  });

  it('writes a task-contract.json artifact with graph and unit metadata', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-ok-'));
    try {
      writeTask(sandbox, 'tasks-foundation.md', taskLines({
        title: 'Foundation',
        file: '`src/foundation.ts`',
        phase: 'foundation',
        depends: 'none',
        test: '`npm test -- foundation`',
      }));
      writeTask(sandbox, 'tasks-feature.md', taskLines({
        title: 'Feature',
        file: '`src/feature.ts`',
        phase: 'mvp',
        depends: 'tasks-foundation.md (requires API)',
        test: '`npm test -- feature`',
      }));

      const result = run(`bash "${BUILD_CONTRACT}" "${sandbox}"`);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/task contract written/);
      const contract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      expect(contract.generatedBy).toBe('src/task-contract/task-contract-report.ts');
      expect(contract.summary).toMatchObject({
        fileCount: 2,
        taskFileCount: 2,
        remediationFileCount: 0,
        taskUnitCount: 2,
        blocked: false,
      });
      expect(contract.graphs.files.topologicalOrder).toEqual([
        'tasks-foundation.md',
        'tasks-feature.md',
      ]);
      expect(contract.units.find((unit: { canonicalId: string }) => unit.canonicalId === 'tasks-feature.md#T1'))
        .toMatchObject({
          filePaths: ['src/feature.ts'],
          phase: 'mvp',
          test: '`npm test -- feature`',
        });
      expect(run(`bash "${VALIDATE_CONTRACT}" "${sandbox}"`).code).toBe(0);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('records contract issues without suppressing the artifact', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-issues-'));
    try {
      writeTask(sandbox, 'tasks-a.md', taskLines({
        title: 'A',
        file: '`src/shared.ts`',
        phase: 'critical',
        depends: 'tasks-missing.md (missing)',
      }));
      writeTask(sandbox, 'tasks-b.md', taskLines({
        title: 'B',
        file: '`src/shared.ts`',
        depends: 'T9 (missing local task)',
      }));

      const result = run(`bash "${BUILD_CONTRACT}" "${sandbox}"`);

      expect(result.code).toBe(0);
      const contract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      expect(contract.summary).toMatchObject({
        blocked: true,
        missingPhaseCount: 1,
        invalidPhaseCount: 1,
      });
      expect(contract.duplicatePathClaims).toHaveLength(1);
      expect(contract.issues.map((issue: { code: string }) => issue.code)).toEqual([
        'invalid-phase',
        'missing-file-dependency',
        'missing-phase',
        'missing-task-dependency',
        'missing-task-dependency',
        'missing-test',
        'missing-test',
        'duplicate-file-path',
        'legacy-task-schema',
        'legacy-task-schema',
      ]);
      const validation = run(`bash "${VALIDATE_CONTRACT}" "${sandbox}"`);
      expect(validation.code).toBe(1);
      expect(validation.out).toMatch(/task contract has 7 blocking issue/);
      expect(validation.out).toMatch(/invalid-phase/);
      expect(validation.out).toMatch(/missing-file-dependency/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('validate-task-contract.sh exits 2 for a missing contract', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-missing-'));
    try {
      const contractPath = path.join(sandbox, 'missing-task-contract.json');
      const result = run(`bash "${VALIDATE_CONTRACT}" "${contractPath}"`);

      expect(result.code).toBe(2);
      expect(result.out).toMatch(/task contract not found/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('validate-task-contract.sh rebuilds the contract when passed a directory', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-rebuild-'));
    try {
      writeTask(sandbox, 'tasks-feature.md', taskLines({
        title: 'Feature',
        file: '`src/feature.ts`',
        phase: 'mvp',
        depends: 'none',
        test: '`npm test -- feature`',
      }));

      const result = run(`bash "${VALIDATE_CONTRACT}" "${sandbox}"`);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/task contract has no blocking issues/);
      expect(fs.existsSync(path.join(sandbox, 'task-contract.json'))).toBe(true);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('does not pass stale task-contract.json after task files change', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-stale-'));
    try {
      writeTask(sandbox, 'tasks-feature.md', taskLines({
        title: 'Feature',
        file: '`src/feature.ts`',
        phase: 'mvp',
        depends: 'none',
        test: '`npm test -- feature`',
      }));

      const initial = run(`bash "${VALIDATE_CONTRACT}" "${sandbox}"`);
      expect(initial.code).toBe(0);
      const staleContract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      expect(staleContract.summary.blocked).toBe(false);

      writeTask(sandbox, 'tasks-feature.md', [
        '## T1 - broken feature',
        '- **Closes user story:** users need it',
        '- **Change type:** replace-everything',
        '- **File:** `src/feature.ts`',
        '- **Acceptance:**',
        '  - works',
        '- **Depends on:** T0',
        '- **Test:** `npm test -- feature`',
        '- **Phase:** mvp',
      ]);

      const validation = run(`bash "${VALIDATE_CONTRACT}" "${sandbox}"`);

      expect(validation.code).toBe(1);
      expect(validation.out).toMatch(/malformed-user-story/);
      expect(validation.out).toMatch(/invalid-change-type/);
      expect(validation.out).toMatch(/missing-precise-change/);
      const rebuiltContract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      expect(rebuiltContract.summary.blocked).toBe(true);
      expect(rebuiltContract.issues.map((issue: { code: string }) => issue.code)).toContain('invalid-change-type');
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('builds through an npm-style bin symlink', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-bin-symlink-'));
    try {
      const binDir = path.join(sandbox, 'node_modules', '.bin');
      const targetDir = path.join(sandbox, 'outputs');
      fs.mkdirSync(binDir, { recursive: true });
      fs.mkdirSync(targetDir, { recursive: true });
      fs.symlinkSync(BUILD_CONTRACT, path.join(binDir, 'ai-prompt-build-task-contract'));
      writeTask(targetDir, 'tasks-feature.md', taskLines({
        title: 'Feature',
        file: '`src/feature.ts`',
        phase: 'mvp',
        depends: 'none',
        test: '`npm test -- feature`',
      }));

      const result = run(`bash "${path.join(binDir, 'ai-prompt-build-task-contract')}" "${targetDir}"`);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/task contract written/);
      expect(fs.existsSync(path.join(targetDir, 'task-contract.json'))).toBe(true);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('blocks task files with no parseable task units', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-empty-units-'));
    try {
      writeTask(sandbox, 'tasks-empty.md', [
        '# Tasks — Empty',
        '',
        'This file has no task heading or task metadata.',
      ]);

      const build = run(`bash "${BUILD_CONTRACT}" "${sandbox}"`);
      expect(build.code).toBe(0);
      const contract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      expect(contract.summary).toMatchObject({
        taskUnitCount: 0,
        blocked: true,
      });
      expect(contract.issues).toContainEqual(expect.objectContaining({
        code: 'empty-task-file',
        severity: 'error',
        file: 'tasks-empty.md',
      }));

      const validation = run(`bash "${VALIDATE_CONTRACT}" "${sandbox}"`);
      expect(validation.code).toBe(1);
      expect(validation.out).toMatch(/empty-task-file/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('blocks schema-alignment defects in task metadata', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-schema-alignment-'));
    try {
      writeTask(sandbox, 'tasks-schema.md', [
        '## T1 - thin task',
        '- **Closes user story:** users need the thing',
        '- **Change type:** replace-everything',
        '- **File:** `src/thin.ts`',
        '- **Acceptance:**',
        '  - works',
        '- **Depends on:** T0',
        '- **Test:** `npm test -- thin`',
        '- **Phase:** mvp',
      ]);

      const result = run(`bash "${VALIDATE_CONTRACT}" "${sandbox}"`);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/malformed-user-story/);
      expect(result.out).toMatch(/invalid-change-type/);
      expect(result.out).toMatch(/missing-precise-change/);
      expect(result.out).toMatch(/shallow-acceptance/);
      expect(result.out).toMatch(/tautological-acceptance/);
      expect(result.out).toMatch(/missing-dependency-reason/);
      expect(result.out).toMatch(/missing-estimated-loc/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('exits 2 when no task files exist', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'contract-empty-'));
    try {
      const result = run(`bash "${BUILD_CONTRACT}" "${sandbox}"`);

      expect(result.code).toBe(2);
      expect(result.out).toMatch(/no tasks-\*\.md or remediation-\*\.md/);
      expect(fs.existsSync(path.join(sandbox, 'task-contract.json'))).toBe(false);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
