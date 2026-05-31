import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { writeStreamAStubs } from '../test-helpers/stream-a-stubs';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const SCRIPT = path.join(REPO_ROOT, 'scripts', 'validate-ready-to-execute.sh');
const SCAFFOLD_SCREENSHOTS = path.join(REPO_ROOT, 'scripts', 'scaffold-screenshot-captures.sh');

function run(targetDir: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${SCRIPT}" "${targetDir}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { stdout?: Buffer; stderr?: Buffer; status?: number };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function writeExternalAccounts(dir: string): void {
  fs.writeFileSync(path.join(dir, 'external-accounts.md'), '# External Accounts Required\n');
}

function writeFeature(dir: string, featureName: string): void {
  fs.writeFileSync(
    path.join(dir, `features-${featureName}.md`),
    [`# Features - ${featureName}`, '', `## ${featureName}`, 'x', ''].join('\n'),
  );
}

function writeTask(dir: string, slug: string): void {
  fs.writeFileSync(
    path.join(dir, `tasks-${slug}.md`),
    [
      `## T1 - ${slug}`,
      `- **Closes user story:** As a user, I want ${slug}, so that I can use it.`,
      '- **Change type:** create-new',
      `- **File:** \`src/${slug}.ts\``,
      '- **Depends on:** none',
      `- **Precise change:** add ${slug} implementation.`,
      '- **Acceptance:**',
      '  - First behavior is present.',
      '  - Second behavior is present.',
      '  - Third behavior is present.',
      `- **Test:** \`npm test -- ${slug}\``,
      '- **Estimated LOC:** ~10',
      '- **Phase:** mvp',
      '',
    ].join('\n'),
  );
}

function writeScreenshotFeature(dir: string): void {
  fs.writeFileSync(
    path.join(dir, 'features-screenshots-ios.md'),
    [
      '# Features - screenshots-ios',
      '',
      '## Screenshots iOS',
      'Create store listing copy, privacy nutrition/data safety notes, a fastlane screenshot matrix, signing/distribution readiness, and metadata upload steps for App Store Connect.',
      '',
    ].join('\n'),
  );
}

function scaffoldMinimalScreenshotMatrix(dir: string): void {
  execSync(
    [
      `bash "${SCAFFOLD_SCREENSHOTS}"`,
      `--target "${dir}"`,
      '--platform ios',
      '--app-name App',
      '--locales en-US',
      '--devices iphone-6.7-inch',
      '--frames home,detail,results',
    ].join(' '),
    { encoding: 'utf8' },
  );
}

describe('validate-ready-to-execute.sh', () => {
  it('is executable', () => {
    expect(fs.existsSync(SCRIPT)).toBe(true);
    expect((fs.statSync(SCRIPT).mode & 0o111) !== 0).toBe(true);
  });

  it('exits 2 when the target directory is missing', () => {
    const missing = path.join(os.tmpdir(), `ready-missing-${Date.now()}`);

    const result = run(missing);

    expect(result.code).toBe(2);
    expect(result.out).toMatch(/target directory does not exist/);
  });

  it('passes and writes a readiness report for a finalized plan', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ready-ok-'));
    try {
      writeFeature(sandbox, 'alpha');
      writeTask(sandbox, 'alpha');
      writeExternalAccounts(sandbox);
      writeStreamAStubs(sandbox);

      const result = run(sandbox);

      expect(result.code).toBe(0);
      expect(result.out).toMatch(/ready-to-execute gate: pass/);
      const report = fs.readFileSync(path.join(sandbox, 'ready-to-execute-report.md'), 'utf8');
      expect(report).toMatch(/ready_to_execute: true/);
      expect(report).toMatch(/finalize_exit_code: 0/);
      expect(report).toMatch(/recommended_step: execute_task_loop/);
      expect(report).toMatch(/blocking_artifacts: \[\]/);
      expect(report).toMatch(/blocking_issues: \[\]/);
      expect(report).toMatch(/Blocking artifacts: none/);
      expect(report).toMatch(/Blocking issues: none/);
      expect(report).toMatch(/\| `task-schema-repair-report\.md` \| present \|/);
      expect(report).toMatch(/\| `delivery-order\.md` \| present \|/);
      expect(report).toMatch(/\| `task-contract\.json` \| present \|/);
      expect(report).toMatch(/\| `task-graph\.json` \| present \|/);
      expect(report).toMatch(/\| `phase-order-report\.md` \| present \|/);
      expect(report).toMatch(/\| `baseline-task-coverage\.md` \| present \|/);
      expect(report).toMatch(/\| `revise-report\.md` \| present \|/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('fails and writes a readiness report when finalize rejects the plan', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ready-fail-'));
    try {
      fs.writeFileSync(
        path.join(sandbox, 'features-workflow.md'),
        '# Features - Auth\n\n## alpha\nx\n\n## beta\nx\n',
      );
      writeTask(sandbox, 'alpha');
      writeExternalAccounts(sandbox);
      writeStreamAStubs(sandbox);

      const result = run(sandbox);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/ready-to-execute gate: fail/);
      const report = fs.readFileSync(path.join(sandbox, 'ready-to-execute-report.md'), 'utf8');
      expect(report).toMatch(/ready_to_execute: false/);
      expect(report).toMatch(/finalize_exit_code: [1-9]/);
      expect(report).toMatch(/recommended_step: repair_plan_then_rerun_ready_gate/);
      expect(report).toMatch(/blocking_artifacts:/);
      expect(report).toMatch(/blocking_issues:/);
      expect(report).toMatch(/- "finalize exited with code [1-9]"/);
      expect(report).toMatch(/- `revise-report\.md`/);
      expect(report).toMatch(/executor_gate: fail/);
      expect(report).toMatch(/revise-report\.md/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('surfaces screenshot matrix failures as structured blocking metadata', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'ready-screenshot-matrix-'));
    try {
      scaffoldMinimalScreenshotMatrix(sandbox);
      writeScreenshotFeature(sandbox);
      writeExternalAccounts(sandbox);
      writeStreamAStubs(sandbox);

      const taskPath = path.join(sandbox, 'tasks-screenshots-ios.md');
      const body = fs.readFileSync(taskPath, 'utf8');
      fs.writeFileSync(
        taskPath,
        body.replace(
          'tools/app-store/verify-screenshot.sh fastlane/screenshots/en-US/iphone-6.7-inch/3_home.png',
          'tools/app-store/verify-screenshot.sh fastlane/screenshots/en-US/iphone-6.7-inch/999_home.png',
        ),
        'utf8',
      );

      const result = run(sandbox);

      expect(result.code).toBe(1);
      expect(result.out).toMatch(/ready-to-execute gate: fail/);
      const report = fs.readFileSync(path.join(sandbox, 'ready-to-execute-report.md'), 'utf8');
      expect(report).toMatch(/- "tasks-\*screenshots\*\.md"/);
      expect(report).toMatch(/- "screenshot matrix validation failed"/);
      expect(report).toMatch(/- `tasks-\*screenshots\*\.md`/);
      expect(report).toMatch(/screenshot matrix validation has/);
      expect(report).toMatch(/expected fastlane\/screenshots\/en-US\/iphone-6\.7-inch\/3_home\.png/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
