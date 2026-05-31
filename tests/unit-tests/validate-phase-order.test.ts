import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const VALIDATOR = path.join(REPO_ROOT, 'scripts', 'validate-phase-order.sh');

function runValidator(targetDir: string): { code: number; out: string } {
  try {
    return {
      code: 0,
      out: execSync(`bash "${VALIDATOR}" "${targetDir}"`, { encoding: 'utf8' }),
    };
  } catch (error) {
    const err = error as { status?: number; stdout?: Buffer; stderr?: Buffer };
    return {
      code: err.status ?? 1,
      out: `${err.stdout?.toString() ?? ''}${err.stderr?.toString() ?? ''}`,
    };
  }
}

function withSandbox(run: (sandbox: string) => void) {
  const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'phase-order-'));
  try {
    run(sandbox);
  } finally {
    fs.rmSync(sandbox, { recursive: true, force: true });
  }
}

function writeTask(
  dir: string,
  filename: string,
  opts: {
    id?: string;
    title: string;
    file: string;
    phase?: string;
    depends?: string;
    extraSections?: string[];
  },
) {
  const lines = [
    `## ${opts.id ?? 'T1'} - ${opts.title}`,
    '- **Closes user story:** As a user, I want this task, so that the app progresses.',
    '- **Change type:** create-new',
    `- **File:** \`${opts.file}\``,
    `- **Depends on:** ${opts.depends ?? 'none'}`,
    '- **Precise change:** add the declared file.',
    '- **Acceptance:**',
    '  - First behavior is present.',
    '  - Second behavior is present.',
    '  - Third behavior is present.',
    '- **Test:** `npm test -- task`',
    '- **Estimated LOC:** ~10',
  ];
  if (opts.phase !== undefined) lines.push(`- **Phase:** ${opts.phase}`);
  fs.writeFileSync(
    path.join(dir, filename),
    `${[...lines, ...(opts.extraSections ?? [])].join('\n')}\n`,
    'utf8',
  );
}

describe('validate-phase-order.sh', () => {
  it('passes a greenfield plan with foundation before MVP', () => withSandbox((sandbox) => {
    fs.writeFileSync(path.join(sandbox, 'epics.md'), '# Epics\n');
    writeTask(sandbox, 'tasks-foundation.md', {
      title: 'foundation',
      file: 'src/foundation.ts',
      phase: 'foundation',
    });
    writeTask(sandbox, 'tasks-feature.md', {
      title: 'feature',
      file: 'src/feature.ts',
      phase: 'mvp',
      depends: 'tasks-foundation.md (requires the foundation API)',
    });

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    expect(result.out).toMatch(/phase-order: pass/);
    expect(fs.readFileSync(path.join(sandbox, 'phase-order-report.md'), 'utf8'))
      .toMatch(/mvp_task_count: 1/);
  }));

  it('rejects missing and invalid Phase fields from the task contract', () => withSandbox((sandbox) => {
    writeTask(sandbox, 'tasks-missing.md', {
      title: 'missing phase',
      file: 'src/missing.ts',
    });
    writeTask(sandbox, 'tasks-invalid.md', {
      title: 'invalid phase',
      file: 'src/invalid.ts',
      phase: 'critical',
    });

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/missing a Phase field/);
    expect(result.out).toMatch(/invalid Phase value critical/);
  }));

  it('rejects phase inversions across task files', () => withSandbox((sandbox) => {
    writeTask(sandbox, 'tasks-foundation.md', {
      title: 'foundation',
      file: 'src/foundation.ts',
      phase: 'foundation',
      depends: 'tasks-mvp.md (incorrectly depends on later phase)',
    });
    writeTask(sandbox, 'tasks-mvp.md', {
      title: 'mvp',
      file: 'src/mvp.ts',
      phase: 'mvp',
    });

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/depends on later-phase tasks-mvp\.md/);
    const report = fs.readFileSync(path.join(sandbox, 'phase-order-report.md'), 'utf8');
    expect(report).toMatch(/file-phase-inversion/);
    expect(report).toMatch(/task-phase-inversion/);
  }));

  it('rejects mixed phases inside one file because file-level ordering is ambiguous', () => withSandbox((sandbox) => {
    writeTask(sandbox, 'tasks-mixed.md', {
      title: 'foundation unit',
      file: 'src/foundation.ts',
      phase: 'foundation',
      extraSections: [
        '',
        '## T2 - mvp unit',
        '- **Closes user story:** As a user, I want this task, so that the app progresses.',
        '- **Change type:** create-new',
        '- **File:** `src/mvp.ts`',
        '- **Depends on:** T1 (requires local setup)',
        '- **Precise change:** add the declared file.',
        '- **Acceptance:**',
        '  - First behavior is present.',
        '  - Second behavior is present.',
        '  - Third behavior is present.',
        '- **Test:** `npm test -- task`',
        '- **Estimated LOC:** ~10',
        '- **Phase:** mvp',
      ],
    });

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/contains multiple task phases/);
  }));

  it('rejects greenfield plans with zero MVP tasks', () => withSandbox((sandbox) => {
    fs.writeFileSync(path.join(sandbox, 'epics.md'), '# Epics\n');
    writeTask(sandbox, 'tasks-foundation.md', {
      title: 'foundation',
      file: 'src/foundation.ts',
      phase: 'foundation',
    });

    const result = runValidator(sandbox);

    expect(result.code).toBe(1);
    expect(result.out).toMatch(/zero tasks in the mvp phase/);
  }));

  it('allows remediation-only plans without MVP tasks', () => withSandbox((sandbox) => {
    writeTask(sandbox, 'remediation-observability.md', {
      id: 'R1',
      title: 'observability fix',
      file: 'src/logging.ts',
      phase: 'foundation',
    });

    const result = runValidator(sandbox);

    expect(result.code).toBe(0);
    expect(fs.readFileSync(path.join(sandbox, 'phase-order-report.md'), 'utf8'))
      .toMatch(/greenfield: false/);
  }));
});
