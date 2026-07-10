import { describe, expect, it } from 'vitest';
import {
  deriveExecutionTerminalState,
  satisfiesEvidenceLevel,
  type TaskUnitExecutionRecord,
} from '../../src/execution/execution-status';

const doneRecord = (
  overrides: Partial<TaskUnitExecutionRecord> = {},
): TaskUnitExecutionRecord => ({
  taskId: 'tasks-cleanup.md#T1',
  status: 'done',
  requiredEvidenceLevel: 'integration',
  testEvidence: [{
    id: 'test-integration',
    level: 'integration',
    outcome: 'pass',
    command: 'npm test -- cleanup',
    recordedAt: '2026-07-10T00:00:00Z',
  }],
  acceptance: [{ id: 'A1', met: true, evidenceIds: ['test-integration'] }],
  buildEvidence: {
    outcome: 'pass',
    command: 'npm run typecheck',
    recordedAt: '2026-07-10T00:01:00Z',
    current: true,
    sourceRevision: 'abc123',
  },
  risks: ['integration'],
  ...overrides,
});

const passingGates = {
  nextTask: null,
  productionVerificationPassed: true,
  releaseReadinessPassed: false,
  claimedCompletionState: 'verified_production' as const,
  envelopeBlockedTaskIds: [],
  requiredTaskIds: ['tasks-cleanup.md#T1'],
};

describe('execution status derivation', () => {
  it('derives verified production only from complete passing records and gates', () => {
    expect(deriveExecutionTerminalState([doneRecord()], passingGates)).toMatchObject({
      state: 'verified_production',
      reasons: [],
    });
  });

  it('derives partial when a done record has failed test evidence', () => {
    const report = deriveExecutionTerminalState([doneRecord({
      testEvidence: [{
        id: 'test-integration',
        level: 'integration',
        outcome: 'fail',
        command: 'npm test -- cleanup',
        recordedAt: '2026-07-10T00:00:00Z',
      }],
    })], passingGates);

    expect(report.state).toBe('partial');
    expect(report.taskReasons['tasks-cleanup.md#T1']).toContain(
      'done task has failed or errored test evidence',
    );
  });

  it('never treats a blocked record and null next task as product-ready', () => {
    const report = deriveExecutionTerminalState([doneRecord({
      status: 'blocked',
      reason: 'device approval pending',
      testEvidence: [],
    })], {
      ...passingGates,
      envelopeBlockedTaskIds: ['tasks-cleanup.md#T1'],
    });

    expect(report.state).toBe('blocked');
    expect(report.reasons).toContain('next_task is null while unresolved blockers remain');
  });

  it('reports required evidence gaps by task ID', () => {
    const report = deriveExecutionTerminalState([doneRecord({
      testEvidence: [{
        id: 'test-static',
        level: 'static',
        outcome: 'pass',
        command: 'rg cleanup src',
        recordedAt: '2026-07-10T00:00:00Z',
      }],
    })], passingGates);

    expect(report.state).toBe('partial');
    expect(report.missingEvidenceByTask).toEqual({
      'tasks-cleanup.md#T1': 'integration',
    });
  });

  it('fails closed on missing evidence for tier-zero risks', () => {
    const report = deriveExecutionTerminalState([doneRecord({
      requiredEvidenceLevel: 'device',
      testEvidence: [],
      risks: ['destructive-action', 'data-integrity'],
    })], passingGates);

    expect(report.state).toBe('blocked');
    expect(report.missingEvidenceByTask['tasks-cleanup.md#T1']).toBe('device');
  });

  it('uses explicit evidence-level satisfaction rather than file existence', () => {
    expect(satisfiesEvidenceLevel('integration', 'static')).toBe(false);
    expect(satisfiesEvidenceLevel('integration', 'unit')).toBe(false);
    expect(satisfiesEvidenceLevel('integration', 'device')).toBe(true);
    expect(satisfiesEvidenceLevel('external', 'device')).toBe(false);
  });
});
