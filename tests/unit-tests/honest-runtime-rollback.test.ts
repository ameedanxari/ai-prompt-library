/**
 * Honest-behavior tests for item 15c: execution-runtime and rollback-manager.
 */
import { describe, expect, it } from 'vitest';
import { ExecutionRuntime } from '../../src/execution/execution-runtime.js';
import { RollbackManager } from '../../src/migration/rollback-manager.js';

describe('item 15c: execution-runtime uses the skill-graph implementation', () => {
  it('invokes a callable skill-graph implementation and reports its real output', async () => {
    const runtime = new ExecutionRuntime({
      getSkillImplementation: () => ({
        implementation: async (input: any) => ({ doubled: input.n * 2 }),
        dependencies: [],
      }),
    } as any);

    const context = await runtime.executeSkill('doubler', { n: 21 });
    expect(context.status).toBe('completed');
    expect(context.output).toEqual({ doubled: 42 });
  });

  it('refuses to mark completed when the implementation is not callable', async () => {
    const runtime = new ExecutionRuntime({
      getSkillImplementation: () => ({ implementation: { not: 'a function' }, dependencies: [] }),
    } as any);

    await expect(runtime.executeSkill('broken', {})).rejects.toThrow(/no callable implementation/);
  });

  it('still throws when no executor and no skill graph are available', async () => {
    const runtime = new ExecutionRuntime();
    await expect(runtime.executeSkill('missing', {})).rejects.toThrow(/No executor registered/);
  });
});

describe('item 15c: rollback-manager is honest without a restore handler', () => {
  it('returns success:false when no restore handler is registered', async () => {
    const manager = new RollbackManager();
    const id = manager.takeSnapshot('v1', 'test', ['a.md'], { x: 1 });
    const result = await manager.rollback(id);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/No restore handler registered/);
  });

  it('returns success:true and invokes the handler when one is registered', async () => {
    const manager = new RollbackManager();
    const restored: string[] = [];
    manager.setRestoreHandler(async (snapshot) => {
      restored.push(snapshot.id);
    });
    const id = manager.takeSnapshot('v1', 'test', ['a.md'], { x: 1 });
    const result = await manager.rollback(id);
    expect(result.success).toBe(true);
    expect(restored).toEqual([id]);
  });

  it('still reports unknown snapshots as failures', async () => {
    const manager = new RollbackManager();
    manager.setRestoreHandler(() => {});
    const result = await manager.rollback('nope');
    expect(result.success).toBe(false);
  });
});
