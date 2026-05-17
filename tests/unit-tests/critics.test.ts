import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { ConsensusEngine } from '../../src/critics/consensus-engine';
import { LearningCritic } from '../../src/critics/learning-critic';
import {
  MultiPerspectiveCritic,
  SecurityCritic,
  PerformanceCritic,
  ArchitectureCritic,
} from '../../src/critics/multi-perspective-critic';
import { ExecutionContext } from '../../src/execution/execution-runtime';

function context(overrides: Partial<ExecutionContext> = {}): ExecutionContext {
  return {
    taskId: 'task-1',
    startTime: new Date(Date.now() - 1_000),
    endTime: new Date(),
    status: 'completed',
    input: {},
    output: {},
    artifacts: ['artifact-1'],
    ...overrides,
  };
}

describe('critic agents', () => {
  it('blocks critical security issues with actionable recommendations', async () => {
    const critic = new SecurityCritic();
    const result = await critic.critique(context({ output: { code: 'eval(userInput)' } }));

    expect(result.passed).toBe(false);
    expect(result.issues[0]).toMatchObject({ type: 'security', severity: 'critical' });
    expect(result.improvements[0]).toContain('sandbox');
  });

  it('aggregates multi-perspective critic results and blockers', async () => {
    const critics = new MultiPerspectiveCritic();
    critics.registerCritic(new SecurityCritic());
    critics.registerCritic(new PerformanceCritic());
    critics.registerCritic(new ArchitectureCritic());

    const result = await critics.critiqueAll(context({ output: { code: 'secret=value' } }));

    expect(result.results.size).toBe(3);
    expect(result.passed).toBe(false);
    expect(result.blockers).toHaveLength(1);
  });

  it('resolves consensus with weighted scores and deduplicated issues', async () => {
    const issue = {
      id: 'issue-1',
      type: 'bug' as const,
      severity: 'medium' as const,
      message: 'Repeated issue',
    };
    const decision = new ConsensusEngine().resolve([
      { agentId: 'a', perspective: 'security', timestamp: new Date(), score: 80, issues: [issue], improvements: [], passed: true },
      { agentId: 'b', perspective: 'performance', timestamp: new Date(), score: 60, issues: [issue], improvements: [], passed: true },
    ]);

    expect(decision.agreedScore).toBeGreaterThan(60);
    expect(decision.resolvedIssues).toHaveLength(1);
  });

  it('keeps consensus scores bounded for arbitrary critic score sets', () => {
    fc.assert(fc.property(
      fc.array(fc.float({ min: 0, max: 100, noNaN: true }), { minLength: 1, maxLength: 10 }),
      (scores) => {
        const decision = new ConsensusEngine().resolve(scores.map((score, index) => ({
          agentId: `critic-${index}`,
          perspective: index % 2 === 0 ? 'security' : 'performance',
          timestamp: new Date(0),
          score,
          issues: [],
          improvements: [],
          passed: score >= 70,
        })));
        return decision.agreedScore >= 0
          && decision.agreedScore <= 100
          && decision.confidence >= 0
          && decision.confidence <= 1;
      }
    ));
  });

  it('learns from human feedback without producing out-of-range scores', async () => {
    const critic = new LearningCritic();
    await critic.learnFromFeedback({
      contextId: 'task-1',
      originalScore: 95,
      humanScore: 75,
      identifiedIssues: [],
      missedIssues: ['coverage'],
    });

    const result = await critic.critique(context());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    expect(critic.getModelSummary().historyCount).toBe(1);
  });
});
