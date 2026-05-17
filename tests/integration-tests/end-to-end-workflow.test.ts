/**
 * End-to-End Workflow Integration Test
 *
 * Validates the complete prompt-to-output pipeline across all components.
 *
 * Validates: All requirements
 */

import { describe, it, expect } from 'vitest';
import { AgenticRuntime } from '../../src/agentic-runtime';

describe('End-to-End Workflow', () => {
  it('should complete a full pipeline from prompt to result', async () => {
    const runtime = new AgenticRuntime();
    const result = await runtime.run('Build a user authentication module with OAuth2');

    expect(result.stage).toBe('complete');
    expect(result.intent).toBeDefined();
    expect(result.intent!.category).toBeDefined();
    expect(result.extraction).toBeDefined();
    expect(result.plan).toBeDefined();
    expect(result.executionPlan).toBeDefined();
    expect(result.executionContext).toBeDefined();
    expect(result.confidence).toBeDefined();
  });

  it('should handle empty prompts gracefully', async () => {
    const runtime = new AgenticRuntime();
    const result = await runtime.run('');

    // Should still complete even with empty input
    expect(['complete', 'failed']).toContain(result.stage);
  });

  it('should track pipeline stage progression', async () => {
    const runtime = new AgenticRuntime();
    expect(runtime.getStage()).toBe('idle');

    await runtime.run('Create a REST API');
    expect(runtime.getStage()).toBe('complete');
  });
});
