import { describe, expect, it } from 'vitest';
import {
  buildFileDependencyGraph,
  buildTaskUnitDependencyGraph,
  extractDependencyRefs,
  extractFilePaths,
  parsePlanTaskFile,
} from '../../src/task-contract/task-parser';

describe('task contract parser', () => {
  it('parses a top-level task metadata block', () => {
    const parsed = parsePlanTaskFile(
      'tasks-sign-up.md',
      [
        '# Prompt — Sign Up',
        '',
        '- **Closes user story:** As a user, I want to sign up, so that I can save my profile.',
        '- **Change type:** create-new',
        '- **File:** `src/auth/signup.ts`',
        '- **Depends on:** none',
        '- **Test:** `npm test -- signup`',
        '- **Estimated LOC:** ~80',
        '- **Phase:** mvp',
        '',
        '## Context',
        'Build the signup flow.',
      ].join('\n'),
    );

    expect(parsed.kind).toBe('tasks');
    expect(parsed.slug).toBe('sign-up');
    expect(parsed.units).toHaveLength(1);
    expect(parsed.units[0]).toMatchObject({
      id: 'TASK',
      canonicalId: 'tasks-sign-up.md#TASK',
      changeType: 'create-new',
      filePaths: ['src/auth/signup.ts'],
      dependencies: [],
      phase: 'mvp',
    });
  });

  it('parses multiple task sections with file and local dependencies', () => {
    const parsed = parsePlanTaskFile(
      'remediation-auth.md',
      [
        '# Remediation — Auth',
        '',
        '## R1 · Auth model',
        '- **Change type:** create-new',
        '- **File:** `src/auth/model.ts`',
        '- **Depends on:** none',
        '- **Test:** `npm test -- auth-model`',
        '- **Estimated LOC:** +40',
        '- **Phase:** foundation',
        '',
        '## R2 · Auth service',
        '- **Change type:** modify-existing',
        '- **File:** `src/auth/service.ts`',
        '- **Depends on:** R1 (requires the model shape)',
        '- **Test:** `npm test -- auth-service`',
        '- **Estimated LOC:** +90',
        '- **Phase:** mvp',
      ].join('\n'),
    );

    expect(parsed.kind).toBe('remediation');
    expect(parsed.units.map((unit) => unit.id)).toEqual(['R1', 'R2']);
    expect(parsed.units[1].dependencies).toEqual([{ raw: 'R1', localTaskId: 'R1' }]);
  });

  it('extracts pipe-separated platform paths from one File field', () => {
    expect(
      extractFilePaths(
        '`ios/App/Services/DuplicateDetector.swift` | `android/app/src/main/java/app/DuplicateDetector.kt`',
      ),
    ).toEqual([
      'ios/App/Services/DuplicateDetector.swift',
      'android/app/src/main/java/app/DuplicateDetector.kt',
    ]);
  });

  it('extracts file and local dependency references without duplicates', () => {
    expect(
      extractDependencyRefs(
        '`tasks-design-tokens.md`, T1, T1, remediation-privacy.md (requires tokens and privacy copy)',
      ),
    ).toEqual([
      { raw: 'tasks-design-tokens.md', file: 'tasks-design-tokens.md' },
      { raw: 'remediation-privacy.md', file: 'remediation-privacy.md' },
      { raw: 'T1', localTaskId: 'T1' },
    ]);
  });

  it('builds a file-level dependency graph and reports missing dependencies', () => {
    const files = [
      parsePlanTaskFile(
        'tasks-alpha.md',
        [
          '## T1 · alpha',
          '- **File:** `src/alpha.ts`',
          '- **Depends on:** tasks-foundation.md (needs foundation first), tasks-missing.md (missing)',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
      parsePlanTaskFile(
        'tasks-foundation.md',
        ['## T1 · foundation', '- **File:** `src/foundation.ts`', '- **Depends on:** none', '- **Phase:** foundation'].join('\n'),
      ),
    ];

    const graph = buildFileDependencyGraph(files);

    expect(graph.topologicalOrder).toEqual(['tasks-foundation.md', 'tasks-alpha.md']);
    expect(graph.missingDependencies).toEqual({
      'tasks-alpha.md': ['tasks-missing.md'],
    });
    expect(graph.cycleNodes).toEqual([]);
  });

  it('builds task-unit graph dependencies inside one file', () => {
    const files = [
      parsePlanTaskFile(
        'tasks-auth.md',
        [
          '## T1 · model',
          '- **File:** `src/auth/model.ts`',
          '- **Depends on:** none',
          '- **Phase:** foundation',
          '',
          '## T2 · service',
          '- **File:** `src/auth/service.ts`',
          '- **Depends on:** T1 (requires model)',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
    ];

    const graph = buildTaskUnitDependencyGraph(files);

    expect(graph.topologicalOrder).toEqual(['tasks-auth.md#T1', 'tasks-auth.md#T2']);
    expect(graph.nodes.find((node) => node.id === 'tasks-auth.md#T2')?.dependencies).toEqual([
      'tasks-auth.md#T1',
    ]);
  });

  it('detects cycles at the task-unit level', () => {
    const files = [
      parsePlanTaskFile(
        'tasks-cycle.md',
        [
          '## T1 · one',
          '- **File:** `src/one.ts`',
          '- **Depends on:** T2 (cycle)',
          '- **Phase:** mvp',
          '',
          '## T2 · two',
          '- **File:** `src/two.ts`',
          '- **Depends on:** T1 (cycle)',
          '- **Phase:** mvp',
        ].join('\n'),
      ),
    ];

    const graph = buildTaskUnitDependencyGraph(files);

    expect(graph.topologicalOrder).toEqual([]);
    expect(graph.cycleNodes).toEqual(['tasks-cycle.md#T1', 'tasks-cycle.md#T2']);
  });

  it('records invalid phase values without normalizing them away', () => {
    const parsed = parsePlanTaskFile(
      'tasks-phase.md',
      ['## T1 · bad phase', '- **File:** `src/x.ts`', '- **Depends on:** none', '- **Phase:** critical'].join('\n'),
    );

    expect(parsed.units[0].phase).toBeUndefined();
    expect(parsed.units[0].invalidPhase).toBe('critical');
  });
});
