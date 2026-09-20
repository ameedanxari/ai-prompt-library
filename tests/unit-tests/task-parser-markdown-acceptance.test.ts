import { describe, expect, it } from 'vitest';
import { buildTaskContractReport } from '../../src/task-contract/task-contract-report';
import {
  buildFileDependencyGraph,
  buildTaskUnitDependencyGraph,
  parsePlanTaskFile,
} from '../../src/task-contract/task-parser';

describe('task-parser markdown acceptance', () => {
  it('accepts the colon-outside-bold field style (**Field**: value)', () => {
    const parsed = parsePlanTaskFile(
      'tasks-colon-outside.md',
      [
        '## T1 · widget',
        '- **Closes user story**: As a user, I want a widget, so that I can fidget.',
        '- **Change type**: create-new',
        '- **File**: `src/widget.ts`',
        '- **Depends on**: none',
        '- **Test**: `npm test -- widget`',
        '- **Estimated LOC**: ~40',
        '- **Phase**: mvp',
      ].join('\n'),
    );

    expect(parsed.units).toHaveLength(1);
    expect(parsed.units[0]).toMatchObject({
      id: 'T1',
      changeType: 'create-new',
      filePaths: ['src/widget.ts'],
      dependencies: [],
      phase: 'mvp',
      closesUserStory: 'As a user, I want a widget, so that I can fidget.',
    });
  });

  it('accepts mixed field styles in one file', () => {
    const parsed = parsePlanTaskFile(
      'tasks-mixed.md',
      [
        '## T1 · first',
        '- **File:** `src/a.ts`',
        '- **Depends on**: T2 (needs the second task)',
        '- **Phase:** foundation',
        '',
        '## T2 · second',
        '- **File**: `src/b.ts`',
        '- **Depends on:** none',
        '- **Phase**: mvp',
      ].join('\n'),
    );

    expect(parsed.units[0].filePaths).toEqual(['src/a.ts']);
    expect(parsed.units[0].dependencies).toEqual([{ raw: 'T2', localTaskId: 'T2' }]);
    expect(parsed.units[1].filePaths).toEqual(['src/b.ts']);
    expect(parsed.units[1].phase).toBe('mvp');
  });

  it('accepts unindented acceptance bullets', () => {
    const parsed = parsePlanTaskFile(
      'tasks-bullets.md',
      [
        '## T1 · widget',
        '- **Acceptance:**',
        '- first criterion',
        '- second criterion',
        '* third criterion',
        '- **Depends on:** none',
        '- **Phase:** mvp',
      ].join('\n'),
    );

    expect(parsed.units[0].acceptanceBullets).toEqual([
      'first criterion',
      'second criterion',
      'third criterion',
    ]);
  });

  it('still stops acceptance bullets at the next field or heading', () => {
    const parsed = parsePlanTaskFile(
      'tasks-bullets-stop.md',
      [
        '## T1 · widget',
        '- **Acceptance:**',
        '- first criterion',
        '- **Depends on:** none',
        '',
        '## T2 · other',
        '- **Acceptance:**',
        '- only criterion',
      ].join('\n'),
    );

    expect(parsed.units[0].acceptanceBullets).toEqual(['first criterion']);
    expect(parsed.units[1].acceptanceBullets).toEqual(['only criterion']);
  });

  it('reports duplicate task IDs as blocking errors', () => {
    const files = [
      parsePlanTaskFile(
        'tasks-dup.md',
        [
          '## T1 · first',
          '- **File:** `src/a.ts`',
          '- **Depends on:** none',
          '- **Phase:** foundation',
          '',
          '## T1 · second with same id',
          '- **File:** `src/b.ts`',
          '- **Depends on:** none',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
    ];

    const report = buildTaskContractReport(files);
    const duplicateIssues = report.issues.filter((issue) => issue.code === 'duplicate-task-id');

    expect(duplicateIssues).toHaveLength(1);
    expect(duplicateIssues[0]).toMatchObject({
      severity: 'error',
      canonicalId: 'tasks-dup.md#T1',
    });
    expect(report.summary.blocked).toBe(true);
  });

  it('reports self-dependencies instead of silently filtering them', () => {
    const files = [
      parsePlanTaskFile(
        'tasks-self.md',
        [
          '## T1 · loops on itself',
          '- **File:** `src/a.ts`',
          '- **Depends on:** T1 (circular by mistake)',
          '- **Phase:** foundation',
        ].join('\n'),
      ),
    ];

    const graph = buildTaskUnitDependencyGraph(files);
    const node = graph.nodes.find((candidate) => candidate.id === 'tasks-self.md#T1');

    expect(node?.selfDependencies).toEqual(['tasks-self.md#T1']);
    expect(node?.dependencies).toEqual([]);
    expect(graph.cycleNodes).toEqual([]);

    const report = buildTaskContractReport(files);
    const selfIssues = report.issues.filter((issue) => issue.code === 'self-dependency');

    expect(selfIssues).toHaveLength(1);
    expect(selfIssues[0]).toMatchObject({
      severity: 'error',
      canonicalId: 'tasks-self.md#T1',
    });
    expect(report.summary.blocked).toBe(true);
  });

  it('reports file-level self-dependencies on the file graph', () => {
    const files = [
      parsePlanTaskFile(
        'tasks-selffile.md',
        [
          '## T1 · loops on its own file',
          '- **File:** `src/a.ts`',
          '- **Depends on:** tasks-selffile.md (mistake)',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
    ];

    const graph = buildFileDependencyGraph(files);
    const node = graph.nodes.find((candidate) => candidate.id === 'tasks-selffile.md');

    expect(node?.selfDependencies).toEqual(['tasks-selffile.md']);
    expect(node?.dependencies).toEqual([]);

    const report = buildTaskContractReport(files);
    expect(
      report.issues.some(
        (issue) => issue.code === 'self-dependency' && issue.file === 'tasks-selffile.md',
      ),
    ).toBe(true);
  });

  it('blocks an empty plan-file set with a no-plan-files error', () => {
    const report = buildTaskContractReport([], { sourceDirectory: '/tmp/empty-plans' });

    expect(report.issues).toHaveLength(1);
    expect(report.issues[0]).toMatchObject({
      code: 'no-plan-files',
      severity: 'error',
    });
    expect(report.issues[0].message).toContain('/tmp/empty-plans');
    expect(report.summary.blocked).toBe(true);
    expect(report.summary.issueCounts.error).toBe(1);
  });

  it('keeps remediation-* files matched by the derived dependency pattern', () => {
    const files = [
      parsePlanTaskFile(
        'tasks-alpha.md',
        [
          '## T1 · alpha',
          '- **File:** `src/alpha.ts`',
          '- **Depends on:** remediation-privacy.md (needs privacy copy)',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
    ];

    const graph = buildFileDependencyGraph(files);
    expect(graph.nodes[0].dependencies).toEqual(['remediation-privacy.md']);
    expect(graph.missingDependencies).toEqual({
      'tasks-alpha.md': ['remediation-privacy.md'],
    });
  });
});
