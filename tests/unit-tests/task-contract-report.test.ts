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
    artifactKind?: string;
    requirementIds?: string;
    evidenceLevel?: string;
    runtimeReachability?: string;
    productionOwner?: string;
    legacy?: boolean;
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
  if (!opts.legacy) {
    lines.push(`- **Artifact kind:** ${opts.artifactKind ?? 'runtime-source'}`);
    if (opts.requirementIds !== undefined) lines.push(`- **Requirement IDs:** ${opts.requirementIds}`);
    else lines.push('- **Requirement IDs:** REQ-DEFAULT-001');
    lines.push(`- **Evidence level:** ${opts.evidenceLevel ?? 'unit'}`);
    lines.push(`- **Runtime reachability:** ${opts.runtimeReachability ?? 'production runtime path'}`);
    if (opts.productionOwner !== undefined) lines.push(`- **Production owner:** ${opts.productionOwner}`);
  }

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

    expect(report.schemaVersion).toBe(2);
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
      schemaVersionCounts: { current: 2, legacy: 0 },
      artifactKindCounts: expect.objectContaining({ 'runtime-source': 2 }),
      evidenceLevelCounts: expect.objectContaining({ unit: 2 }),
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
          '- **Artifact kind:** runtime-source',
          '- **Requirement IDs:** REQ-SHARED-002',
          '- **Evidence level:** unit',
          '- **Runtime reachability:** shared runtime module',
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
          '- **Artifact kind:** runtime-source',
          '- **Requirement IDs:** REQ-CYCLE-001',
          '- **Evidence level:** unit',
          '- **Runtime reachability:** production runtime path',
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
          '- **Artifact kind:** runtime-source',
          '- **Requirement IDs:** REQ-CYCLE-002',
          '- **Evidence level:** unit',
          '- **Runtime reachability:** production runtime path',
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

  it('warns without blocking when a complete old task uses the legacy schema', () => {
    const report = buildTaskContractReport([
      taskFile('tasks-legacy.md', {
        file: '`docs/legacy.md`',
        phase: 'foundation',
        depends: 'none',
        test: '`npm test -- legacy`',
        legacy: true,
      }),
    ]);

    expect(report.summary).toMatchObject({
      schemaVersionCounts: { current: 0, legacy: 1 },
      blocked: false,
      issueCounts: { error: 0, warning: 1 },
    });
    expect(report.units[0].schemaVersion).toBe('legacy');
    expect(report.issues).toEqual([
      expect.objectContaining({
        code: 'legacy-task-schema',
        severity: 'warning',
        canonicalId: 'tasks-legacy.md#T1',
      }),
    ]);
  });

  it('blocks missing and invalid typed metadata without hiding actual values', () => {
    const report = buildTaskContractReport([
      taskFile('tasks-invalid-metadata.md', {
        file: '`src/feature.ts`',
        phase: 'mvp',
        depends: 'none',
        test: '`npm test -- feature`',
        artifactKind: 'unknown-kind',
        requirementIds: '',
        evidenceLevel: 'unknown-level',
        runtimeReachability: '',
      }),
    ]);

    expect(report.summary.blocked).toBe(true);
    expect(report.units[0]).toMatchObject({
      schemaVersion: 2,
      invalidArtifactKind: 'unknown-kind',
      requirementIds: [],
      invalidEvidenceLevel: 'unknown-level',
      runtimeReachability: '',
    });
    expect(report.issues.map((issue) => issue.code)).toEqual([
      'invalid-artifact-kind',
      'invalid-evidence-level',
      'missing-requirement-ids',
      'missing-runtime-reachability',
    ]);
  });

  it('blocks partially migrated tasks until every required typed field is present', () => {
    const parsed = parsePlanTaskFile(
      'tasks-partial.md',
      [
        '## T1 - partial migration',
        '- **Closes user story:** As a planner, I want typed metadata, so that task evidence is explicit.',
        '- **Change type:** create-new',
        '- **File:** `src/partial.ts`',
        '- **Precise change:** add the partial implementation contract.',
        '- **Acceptance:**',
        '  - The implementation has a named file.',
        '  - The contract is machine-readable.',
        '  - The named test covers the contract.',
        '- **Depends on:** none',
        '- **Test:** `npm test -- partial`',
        '- **Estimated LOC:** +10',
        '- **Phase:** foundation',
        '- **Requirement IDs:** REQ-PARTIAL-001',
      ].join('\n'),
    );
    const report = buildTaskContractReport([parsed]);

    expect(report.units[0].schemaVersion).toBe(2);
    expect(report.issues.map((issue) => issue.code)).toEqual([
      'missing-artifact-kind',
      'missing-evidence-level',
      'missing-runtime-reachability',
    ]);
  });

  it('blocks non-runtime artifacts that claim Swift or Kotlin runtime paths', () => {
    const report = buildTaskContractReport([
      taskFile('tasks-docs.md', {
        file: '`ios/App/StoragePolicy.swift` | `android/app/src/main/java/app/StoragePolicy.kt`',
        phase: 'foundation',
        depends: 'none',
        test: '`npm test -- docs`',
        artifactKind: 'docs',
        evidenceLevel: 'manual-review',
        runtimeReachability: 'not runtime-reachable',
      }),
    ]);

    expect(report.summary.artifactKindCounts.docs).toBe(1);
    expect(report.summary.evidenceLevelCounts['manual-review']).toBe(1);
    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'artifact-runtime-path-mismatch',
      severity: 'error',
    }));
  });

  it('rejects static-only evidence for behavior-heavy work', () => {
    const report = buildTaskContractReport([
      taskFile('tasks-deletion.md', {
        title: 'safe deletion behavior',
        file: '`src/delete.ts`',
        phase: 'mvp',
        depends: 'none',
        test: '`npm test -- deletion`',
        artifactKind: 'runtime-source',
        evidenceLevel: 'static',
        runtimeReachability: 'deletion service runtime path',
      }),
    ]);

    expect(report.issues).toContainEqual(expect.objectContaining({
      code: 'static-only-behavioral-closure',
      severity: 'error',
    }));
  });
});
