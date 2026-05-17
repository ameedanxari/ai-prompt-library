import { describe, expect, it } from 'vitest';
import { ExecutionRuntime } from '../../src/execution/execution-runtime';
import { ExecutionMonitor } from '../../src/execution/execution-monitor';
import { QualityGateEnforcer } from '../../src/execution/quality-gate-enforcer';
import { RepairLoop } from '../../src/execution/repair-loop';

describe('Execution runtime components', () => {
  it('executes plan steps in dependency order and passes dependency outputs', async () => {
    const runtime = new ExecutionRuntime();
    const executed: string[] = [];

    runtime.registerSkillExecutor('base', async (input) => {
      executed.push('base');
      return { value: input.value + 1 };
    });
    runtime.registerSkillExecutor('dependent', async (input) => {
      executed.push('dependent');
      return { value: input.dependencyOutputs.first.value + 1 };
    });

    const result = await runtime.executePlan({
      id: 'plan-1',
      name: 'Dependency plan',
      steps: [
        { id: 'second', skillId: 'dependent', input: {}, dependencies: ['first'] },
        { id: 'first', skillId: 'base', input: { value: 1 }, dependencies: [] },
      ],
    });

    expect(result.status).toBe('completed');
    expect(executed).toEqual(['base', 'dependent']);
    expect(result.output).toMatchObject({ second: { value: 3 } });
  });

  it('checkpoints and restores execution context', async () => {
    const runtime = new ExecutionRuntime();
    runtime.registerSkillExecutor('echo', input => ({ input }));
    const context = await runtime.executeSkill('echo', { ok: true });

    const checkpointId = await runtime.checkpoint(context.taskId);
    await runtime.rollback(context.taskId);
    const restored = await runtime.restoreCheckpoint(checkpointId);

    expect(restored.status).toBe('completed');
    expect(restored.output).toEqual({ input: { ok: true } });
  });

  it('records deterministic monitor anomalies', () => {
    const monitor = new ExecutionMonitor();
    monitor.setThreshold('maxMemoryMb', 10);
    monitor.recordMetrics('task-1', {
      durationMs: 100,
      cpuUsage: 0.1,
      memoryUsageMb: 42,
      networkRequests: 0,
      diskReadBytes: 0,
      diskWriteBytes: 0,
    });

    expect(monitor.getAnomalies('task-1')).toHaveLength(1);
  });

  it('enforces quality gates from execution output metrics', async () => {
    const gate = new QualityGateEnforcer();
    await expect(gate.evaluate({
      taskId: 'task-1',
      startTime: new Date(),
      status: 'completed',
      input: {},
      output: { metrics: { testCoverage: 50, securityVulnerabilities: 1 } },
      artifacts: [],
    })).resolves.toMatchObject({ passed: false });
  });

  it('generates deterministic repair validations', async () => {
    const repairLoop = new RepairLoop();
    const result = await repairLoop.repair({
      taskId: 'task-1',
      startTime: new Date(),
      status: 'failed',
      input: {},
      error: 'timeout while running tests',
      artifacts: [],
    });

    expect(result).toMatchObject({ success: true, regressionsDetected: false });
  });
});
