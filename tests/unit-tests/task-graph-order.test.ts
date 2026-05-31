import { describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

const REPO_ROOT = path.resolve(__dirname, '..', '..');
const BUILD_GRAPH = path.join(REPO_ROOT, 'scripts', 'build-task-graph.sh');
const BUILD_ORDER = path.join(REPO_ROOT, 'scripts', 'build-delivery-order.sh');
const VALIDATE_ORDER = path.join(REPO_ROOT, 'scripts', 'validate-execution-order.sh');

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
  file: string;
  phase: 'foundation' | 'mvp' | 'expand' | 'polish';
  depends?: string;
}) {
  return [
    `## T1 - ${opts.title}`,
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
    `- **Phase:** ${opts.phase}`,
  ];
}

describe('task graph and delivery-order scripts', () => {
  it('build-task-graph.sh writes dependency metadata and topological order', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'graph-ok-'));
    try {
      writeTask(sandbox, 'tasks-foundation.md', taskLines({
        title: 'Foundation',
        file: 'src/foundation.ts',
        phase: 'foundation',
      }));
      writeTask(sandbox, 'tasks-feature.md', taskLines({
        title: 'Feature',
        file: 'src/feature.ts',
        phase: 'mvp',
        depends: 'tasks-foundation.md (requires the foundation API)',
      }));

      const result = run(`bash "${BUILD_GRAPH}" "${sandbox}"`);
      expect(result.code).toBe(0);

      const graph = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-graph.json'), 'utf8'));
      const contract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      expect(graph.node_count).toBe(2);
      expect(graph.source_contract).toBe(path.join(sandbox, 'task-contract.json'));
      expect(graph.topological_order).toEqual(['tasks-foundation.md', 'tasks-feature.md']);
      expect(graph.nodes.find((node: { id: string }) => node.id === 'tasks-feature.md').dependencies)
        .toEqual(['tasks-foundation.md']);
      expect(contract.summary).toMatchObject({
        fileCount: 2,
        taskUnitCount: 2,
      });
      expect(contract.graphs.files.topologicalOrder).toEqual([
        'tasks-foundation.md',
        'tasks-feature.md',
      ]);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('build-task-graph.sh rejects missing dependency files', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'graph-missing-'));
    try {
      writeTask(sandbox, 'tasks-feature.md', taskLines({
        title: 'Feature',
        file: 'src/feature.ts',
        phase: 'mvp',
        depends: 'tasks-missing.md (requires missing task)',
      }));

      const result = run(`bash "${BUILD_GRAPH}" "${sandbox}"`);
      expect(result.code).toBe(1);
      expect(result.out).toMatch(/missing dependency file/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('build-delivery-order.sh orders by phase before independent mvp tasks', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'order-ok-'));
    try {
      writeTask(sandbox, 'tasks-z-mvp.md', taskLines({
        title: 'MVP',
        file: 'src/mvp.ts',
        phase: 'mvp',
      }));
      writeTask(sandbox, 'tasks-a-foundation.md', taskLines({
        title: 'Foundation',
        file: 'src/foundation.ts',
        phase: 'foundation',
      }));

      const result = run(`bash "${BUILD_ORDER}" "${sandbox}"`);
      expect(result.code).toBe(0);

      const contract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      const order = fs.readFileSync(path.join(sandbox, 'delivery-order.md'), 'utf8');
      expect(contract.graphs.files.topologicalOrder).toEqual([
        'tasks-a-foundation.md',
        'tasks-z-mvp.md',
      ]);
      expect(order.indexOf('`tasks-a-foundation.md`')).toBeLessThan(
        order.indexOf('`tasks-z-mvp.md`'),
      );
      expect(order).toMatch(/phase_counts:\n  foundation: 1\n  mvp: 1/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('build-delivery-order.sh rejects phase inversions', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'order-inversion-'));
    try {
      writeTask(sandbox, 'tasks-foundation.md', taskLines({
        title: 'Foundation',
        file: 'src/foundation.ts',
        phase: 'foundation',
        depends: 'tasks-mvp.md (incorrectly depends on later phase)',
      }));
      writeTask(sandbox, 'tasks-mvp.md', taskLines({
        title: 'MVP',
        file: 'src/mvp.ts',
        phase: 'mvp',
      }));

      const result = run(`bash "${BUILD_ORDER}" "${sandbox}"`);
      expect(result.code).toBe(1);
      expect(result.out).toMatch(/phase inversions detected/);
      const order = fs.readFileSync(path.join(sandbox, 'delivery-order.md'), 'utf8');
      expect(order).toMatch(/Phase inversions/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('build-delivery-order.sh writes missing phase metadata from task-contract units', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'order-missing-phase-'));
    try {
      writeTask(sandbox, 'tasks-foundation.md', [
        '## T1 - Foundation',
        '- **Closes user story:** As a user, I want this task, so that the app progresses.',
        '- **Change type:** create-new',
        '- **File:** `src/foundation.ts`',
        '- **Depends on:** none',
        '- **Precise change:** add the declared file.',
        '- **Acceptance:**',
        '  - First behavior is present.',
        '  - Second behavior is present.',
        '  - Third behavior is present.',
        '- **Test:** `npm test -- task`',
        '- **Estimated LOC:** ~10',
      ]);

      const result = run(`bash "${BUILD_ORDER}" "${sandbox}"`);

      expect(result.code).toBe(0);
      const order = fs.readFileSync(path.join(sandbox, 'delivery-order.md'), 'utf8');
      expect(order).toMatch(/missing_phase_field:\n  - tasks-foundation\.md/);
      const contract = JSON.parse(fs.readFileSync(path.join(sandbox, 'task-contract.json'), 'utf8'));
      expect(contract.summary.missingPhaseCount).toBe(1);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });

  it('validate-execution-order.sh rejects done logs before dependencies', () => {
    const sandbox = fs.mkdtempSync(path.join(os.tmpdir(), 'execution-order-'));
    try {
      writeTask(sandbox, 'tasks-foundation.md', taskLines({
        title: 'Foundation',
        file: 'src/foundation.ts',
        phase: 'foundation',
      }));
      writeTask(sandbox, 'tasks-feature.md', taskLines({
        title: 'Feature',
        file: 'src/feature.ts',
        phase: 'mvp',
        depends: 'tasks-foundation.md (requires the foundation API)',
      }));
      expect(run(`bash "${BUILD_GRAPH}" "${sandbox}"`).code).toBe(0);
      fs.writeFileSync(
        path.join(sandbox, 'execution-log.md'),
        [
          '---',
          'next_task: null',
          'blocked_tasks: []',
          'failed_tasks: []',
          'deferred_tasks: []',
          '---',
          '',
          '# Execution Log',
          '',
          '### `tasks-feature.md` \u2014 done',
          '### `tasks-foundation.md` \u2014 done',
        ].join('\n'),
        'utf8',
      );

      const result = run(`bash "${VALIDATE_ORDER}" "${sandbox}"`);
      expect(result.code).toBe(1);
      expect(result.out).toMatch(/logged at #1 before dependency tasks-foundation.md at #2/);
    } finally {
      fs.rmSync(sandbox, { recursive: true, force: true });
    }
  });
});
