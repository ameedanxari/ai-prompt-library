import { describe, expect, it } from 'vitest';
import {
  COMPLETION_STATES,
  NEXT_TASK_NULL_MEANING,
  buildCompletionReport,
  createCompletionGateResult,
  deriveCompletionState,
  type CompletionDimension,
  type CompletionGateResult,
} from '../../src/completion/completion-state';

const gate = (
  dimension: CompletionDimension,
  status: CompletionGateResult['status'],
  options: Partial<CompletionGateResult> = {},
): CompletionGateResult => createCompletionGateResult(dimension, status, `${dimension} ${status}`, {
  required: options.required,
  blockingReasons: options.blockingReasons,
  evidence: options.evidence,
});

const dimensions = (
  overrides: Partial<Record<CompletionDimension, CompletionGateResult>> = {},
): Record<CompletionDimension, CompletionGateResult> => ({
  planning: gate('planning', 'pass'),
  artifact_accounting: gate('artifact_accounting', 'pass'),
  fixture_verification: gate('fixture_verification', 'fail', {
    blockingReasons: ['fixture evidence missing'],
  }),
  production_verification: gate('production_verification', 'fail', {
    blockingReasons: ['production flow evidence missing'],
  }),
  partial_blocked_state: gate('partial_blocked_state', 'pass'),
  release_readiness: gate('release_readiness', 'fail', {
    blockingReasons: ['release gates missing'],
  }),
  ...overrides,
});

describe('completion state model', () => {
  it('does not expose a bare complete terminal state', () => {
    expect(COMPLETION_STATES).not.toContain('complete');
  });

  it('keeps artifact accounting separate from production verification', () => {
    const report = buildCompletionReport({
      generatedBy: 'test',
      nextTask: null,
      dimensions: dimensions(),
    });

    expect(report.dimensions.artifact_accounting.status).toBe('pass');
    expect(report.dimensions.production_verification.status).toBe('fail');
    expect(report.state).toBe('partial');
  });

  it('does not upgrade fixture evidence to production verification', () => {
    expect(deriveCompletionState(dimensions({
      fixture_verification: gate('fixture_verification', 'pass'),
      production_verification: gate('production_verification', 'fail'),
      release_readiness: gate('release_readiness', 'fail'),
    }))).toBe('partial');
  });

  it('marks unresolved blocker state as blocked', () => {
    expect(deriveCompletionState(dimensions({
      partial_blocked_state: gate('partial_blocked_state', 'fail', {
        blockingReasons: ['external approval pending'],
      }),
    }))).toBe('blocked');
  });

  it('documents that next_task null only means no local task remains', () => {
    const report = buildCompletionReport({
      generatedBy: 'test',
      nextTask: null,
      dimensions: dimensions(),
    });

    expect(report.nextTaskMeaning).toBe(NEXT_TASK_NULL_MEANING);
    expect(report.nextTaskMeaning).toMatch(/does not imply verified production behavior/);
  });
});
