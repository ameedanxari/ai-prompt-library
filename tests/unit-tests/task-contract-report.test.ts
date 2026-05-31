import { describe, expect, it } from 'vitest';
import { buildTaskContractReport } from '../../src/task-contract/task-contract-report';
import { parsePlanTaskFile } from '../../src/task-contract/task-parser';

function taskFile(
  filename: string,
  opts: {
    id?: string;
    title?: string;
    userStory?: string;
    changeType?: string;
    file?: string;
    preciseChange?: string;
    acceptance?: string[];
    phase?: string;
    depends?: string;
    test?: string;
    estimatedLoc?: string;
  },
) {
  const lines = [
    `## ${opts.id ?? 'T1'} - ${opts.title ?? filename}`,
  ];

  if (opts.userStory !== undefined) lines.push(`- **Closes user story:** ${opts.userStory}`);
  else lines.push('- **Closes user story:** As a user, I want this task, so that the app progresses.');

  if (opts.changeType !== undefined) lines.push(`- **Change type:** ${opts.changeType}`);
  else lines.push('- **Change type:** create-new');

  if (opts.file !== undefined) lines.push(`- **File:** ${opts.file}`);
  if (opts.preciseChange !== undefined) lines.push(`- **Precise change:** ${opts.preciseChange}`);
  else lines.push('- **Precise change:** implement the described task delta in the named file.');

  lines.push('- **Acceptance:**');
  for (const bullet of opts.acceptance ?? [
    'The file contains the described implementation.',
    'The task-specific behavior is covered by the named test.',
    'No unrelated files are changed by this task.',
  ]) {
    lines.push(`  - ${bullet}`);
  }

  if (opts.test !== undefined) lines.push(`- **Test:** ${opts.test}`);
  if (opts.depends !== undefined) lines.push(`- **Depends on:** ${opts.depends}`);
  if (opts.estimatedLoc !== undefined) lines.push(`- **Estimated LOC:** ${opts.estimatedLoc}`);
  else lines.push('- **Estimated LOC:** +10');
  if (opts.phase !== undefined) lines.push(`- **Phase:** ${opts.phase}`);

  return parsePlanTaskFile(filename, lines.join('\n'));
}

describe('task contract report', () => {
  it('builds a clean machine-readable contract for valid plan tasks', () => {
    const report = buildTaskContractReport([
      taskFile('tasks-feature.md', {
        file: '`src/feature.ts`',
        phase: 'mvp',
        depends: 'tasks-foundation.md (requires API)',
        test: '`npm test -- feature`',
      }),
      taskFile('tasks-foundation.md', {
        file: '`src/foundation.ts`',
        phase: 'foundation',
        depends: 'none',
        test: '`npm test -- foundation`',
      }),
    ], { sourceDirectory: 'prompts/outputs/current' });

    expect(report.schemaVersion).toBe(1);
    expect(report.sourceDirectory).toBe('prompts/outputs/current');
    expect(report.summary).toMatchObject({
      fileCount: 2,
      taskFileCount: 2,
      remediationFileCount: 0,
      taskUnitCount: 2,
      phaseCounts: {
        foundation: 1,
        mvp: 1,
        expand: 0,
        polish: 0,
      },
      blocked: false,
    });
    expect(report.issues).toEqual([]);
    expect(report.files.map((file) => file.filename)).toEqual([
      'tasks-feature.md',
      'tasks-foundation.md',
    ]);
    expect(report.graphs.files.topologicalOrder).toEqual([
      'tasks-foundation.md',
      'tasks-feature.md',
    ]);
    expect(report.graphs.taskUnits.topologicalOrder).toEqual([
      'tasks-foundation.md#T1',
      'tasks-feature.md#T1',
    ]);
  });

  it('reports dependency, phase, file path, and test contract issues', () => {
    const report = buildTaskContractReport([
      taskFile('tasks-feature.md', {
        file: '`src/feature.ts`',
        phase: 'critical',
        depends: 'tasks-missing.md (missing)',
      }),
      taskFile('tasks-local.md', {
        depends: 'T9 (missing local task)',
      }),
    ]);

    expect(report.summary).toMatchObject({
      fileCount: 2,
      taskUnitCount: 2,
      missingPhaseCount: 1,
      invalidPhaseCount: 1,
      blocked: true,
    });
    expect(report.summary.issueCounts).toEqual({
      error: 8,
      warning: 0,
    });
    expect(report.issues.map((issue) => issue.code)).toEqual([
      'invalid-phase',
      'missing-file-dependency',
      'missing-file-path',
      'missing-phase',
      'missing-task-dependency',
      'missing-task-dependency',
      'missing-test',
      'missing-test',
    ]);
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'missing-file-dependency',
      file: 'tasks-feature.md',
      dependency: 'tasks-missing.md',
    }));
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'missing-task-dependency',
      canonicalId: 'tasks-local.md#T1',
      dependency: 'tasks-local.md#T9',
    }));
  });

  it('tracks duplicate file-path ownership without blocking execution', () => {
    const report = buildTaskContractReport([
      taskFile('tasks-a.md', {
        file: '`src/shared.ts`',
        phase: 'mvp',
        depends: 'none',
        test: '`npm test -- shared-a`',
      }),
      parsePlanTaskFile(
        'remediation-b.md',
        [
          '## R1 - shared remediation',
          '- **Closes user story:** As a maintainer, I want shared remediation, so that the app stays consistent.',
          '- **Change type:** modify-existing',
          '- **File:** `src/shared.ts`',
          '- **Precise change:** update the shared file for the remediation.',
          '- **Acceptance:**',
          '  - The shared remediation is implemented.',
          '  - The shared behavior is covered by the named test.',
          '  - No unrelated files are changed.',
          '- **Depends on:** none',
          '- **Test:** `npm test -- shared-b`',
          '- **Estimated LOC:** +10',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
    ]);

    expect(report.summary.blocked).toBe(false);
    expect(report.summary.issueCounts).toEqual({
      error: 0,
      warning: 1,
    });
    expect(report.duplicatePathClaims).toEqual([
      {
        path: 'src/shared.ts',
        owners: [
          {
            file: 'remediation-b.md',
            unitId: 'R1',
            canonicalId: 'remediation-b.md#R1',
          },
          {
            file: 'tasks-a.md',
            unitId: 'T1',
            canonicalId: 'tasks-a.md#T1',
          },
        ],
      },
    ]);
    expect(report.issues[0]).toMatchObject({
      code: 'duplicate-file-path',
      severity: 'warning',
      path: 'src/shared.ts',
      owners: ['remediation-b.md#R1', 'tasks-a.md#T1'],
    });
  });

  it('blocks task files that contain no parseable task units', () => {
    const report = buildTaskContractReport([
      parsePlanTaskFile(
        'tasks-empty.md',
        [
          '# Tasks — Empty',
          '',
          'This file has prose, but no task heading or top-level task metadata.',
        ].join('\n'),
      ),
    ]);

    expect(report.summary).toMatchObject({
      fileCount: 1,
      taskUnitCount: 0,
      blocked: true,
    });
    expect(report.issues).toEqual([
      expect.objectContaining({
        code: 'empty-task-file',
        severity: 'error',
        file: 'tasks-empty.md',
      }),
    ]);
  });

  it('surfaces task-unit dependency cycles as blocking contract errors', () => {
    const report = buildTaskContractReport([
      parsePlanTaskFile(
        'tasks-cycle.md',
        [
          '## T1 - first',
          '- **Closes user story:** As a user, I want the first task, so that the cycle fixture is complete.',
          '- **Change type:** create-new',
          '- **File:** `src/one.ts`',
          '- **Precise change:** add the first file.',
          '- **Acceptance:**',
          '  - The first file is created.',
          '  - The first behavior is tested.',
          '  - No unrelated files are changed.',
          '- **Depends on:** T2 (requires the second task)',
          '- **Test:** `npm test -- one`',
          '- **Estimated LOC:** +10',
          '- **Phase:** mvp',
          '',
          '## T2 - second',
          '- **Closes user story:** As a user, I want the second task, so that the cycle fixture is complete.',
          '- **Change type:** create-new',
          '- **File:** `src/two.ts`',
          '- **Precise change:** add the second file.',
          '- **Acceptance:**',
          '  - The second file is created.',
          '  - The second behavior is tested.',
          '  - No unrelated files are changed.',
          '- **Depends on:** T1 (requires the first task)',
          '- **Test:** `npm test -- two`',
          '- **Estimated LOC:** +10',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
    ]);

    expect(report.summary.blocked).toBe(true);
    expect(report.graphs.taskUnits.cycleNodes).toEqual([
      'tasks-cycle.md#T1',
      'tasks-cycle.md#T2',
    ]);
    expect(report.issues).toEqual([
      expect.objectContaining({
        code: 'task-dependency-cycle',
        severity: 'error',
        owners: ['tasks-cycle.md#T1', 'tasks-cycle.md#T2'],
      }),
    ]);
  });
});
