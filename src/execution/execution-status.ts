import type { CompletionState } from '../completion/completion-state';
import type { EvidenceLevel } from '../task-contract/task-parser';

export const TASK_EXECUTION_STATUSES = [
  'pending',
  'running',
  'done',
  'blocked',
  'failed',
  'deferred',
] as const;

export const EXECUTION_RISKS = [
  'primary-flow',
  'security',
  'privacy',
  'destructive-action',
  'persistence',
  'integration',
  'data-integrity',
] as const;

export type TaskExecutionStatus = (typeof TASK_EXECUTION_STATUSES)[number];
export type ExecutionRisk = (typeof EXECUTION_RISKS)[number];
export type ExecutionEvidenceOutcome = 'pass' | 'fail' | 'error';
export type ExecutionTerminalState = 'verified_production' | 'partial' | 'blocked';

export interface ExecutionEvidenceRecord {
  id: string;
  level: EvidenceLevel;
  outcome: ExecutionEvidenceOutcome;
  command: string;
  recordedAt: string;
  artifact?: string;
  environment?: string;
}

export interface AcceptanceExecutionRecord {
  id: string;
  met: boolean;
  evidenceIds: string[];
  reason?: string;
}

export interface BuildEvidenceRecord {
  outcome: ExecutionEvidenceOutcome;
  command: string;
  recordedAt: string;
  current: boolean;
  sourceRevision?: string;
}

export interface TaskUnitExecutionRecord {
  taskId: string;
  status: TaskExecutionStatus;
  requiredEvidenceLevel: EvidenceLevel;
  testEvidence: ExecutionEvidenceRecord[];
  acceptance: AcceptanceExecutionRecord[];
  buildEvidence?: BuildEvidenceRecord;
  risks: ExecutionRisk[];
  reason?: string;
}

export interface ExecutionGateState {
  nextTask: string | null;
  productionVerificationPassed: boolean;
  releaseReadinessPassed?: boolean;
  claimedCompletionState?: CompletionState;
  envelopeBlockedTaskIds?: string[];
  requiredTaskIds?: string[];
}

export interface ExecutionTerminalReport {
  state: ExecutionTerminalState;
  reasons: string[];
  taskReasons: Record<string, string[]>;
  missingEvidenceByTask: Record<string, EvidenceLevel>;
}

const CRITICAL_RISKS = new Set<ExecutionRisk>(EXECUTION_RISKS);

const EVIDENCE_SATISFACTION: Record<EvidenceLevel, EvidenceLevel[]> = {
  static: ['static', 'compile', 'unit', 'integration', 'ui-fixture', 'device', 'manual-review', 'external'],
  compile: ['compile', 'unit', 'integration', 'ui-fixture', 'device'],
  unit: ['unit', 'integration', 'ui-fixture', 'device'],
  integration: ['integration', 'ui-fixture', 'device'],
  'ui-fixture': ['ui-fixture', 'device'],
  device: ['device'],
  'manual-review': ['manual-review'],
  external: ['external'],
};

export function satisfiesEvidenceLevel(
  required: EvidenceLevel,
  actual: EvidenceLevel,
): boolean {
  return EVIDENCE_SATISFACTION[required].includes(actual);
}

export function deriveExecutionTerminalState(
  records: TaskUnitExecutionRecord[],
  gates: ExecutionGateState,
): ExecutionTerminalReport {
  const reasons: string[] = [];
  const blockingReasons: string[] = [];
  const taskReasons: Record<string, string[]> = {};
  const missingEvidenceByTask: Record<string, EvidenceLevel> = {};
  const recordsById = new Map(records.map((record) => [record.taskId, record]));

  const addTaskReason = (taskId: string, reason: string, blocking = false): void => {
    const taskEntries = taskReasons[taskId] ?? [];
    taskEntries.push(reason);
    taskReasons[taskId] = taskEntries;
    (blocking ? blockingReasons : reasons).push(`${taskId}: ${reason}`);
  };

  for (const requiredTaskId of gates.requiredTaskIds ?? []) {
    if (!recordsById.has(requiredTaskId)) {
      addTaskReason(requiredTaskId, 'canonical execution record is missing');
    }
  }

  for (const record of records) {
    if (record.status === 'blocked') {
      addTaskReason(record.taskId, record.reason || 'task is blocked', true);
      continue;
    }
    if (record.status === 'failed') {
      addTaskReason(record.taskId, record.reason || 'task failed', true);
      continue;
    }
    if (record.status !== 'done') {
      addTaskReason(record.taskId, `task status is ${record.status}`);
      continue;
    }

    if (record.testEvidence.length === 0) {
      addTaskReason(record.taskId, 'done task has no test evidence');
    } else if (record.testEvidence.some((evidence) => evidence.outcome !== 'pass')) {
      addTaskReason(record.taskId, 'done task has failed or errored test evidence');
    }

    if (record.acceptance.length === 0) {
      addTaskReason(record.taskId, 'done task has no acceptance records');
    }
    for (const acceptance of record.acceptance) {
      if (!acceptance.met) {
        addTaskReason(record.taskId, `acceptance ${acceptance.id} is unmet`);
      } else if (acceptance.evidenceIds.length === 0) {
        addTaskReason(record.taskId, `acceptance ${acceptance.id} has no evidence links`);
      }
    }

    if (!record.buildEvidence) {
      addTaskReason(record.taskId, 'done task has no build evidence');
    } else if (record.buildEvidence.outcome !== 'pass' || !record.buildEvidence.current) {
      addTaskReason(record.taskId, 'done task lacks current passing build evidence');
    }

    const passingEvidence = record.testEvidence.filter((evidence) => evidence.outcome === 'pass');
    const requiredEvidencePresent = passingEvidence.some((evidence) => (
      satisfiesEvidenceLevel(record.requiredEvidenceLevel, evidence.level)
    ));
    if (!requiredEvidencePresent) {
      missingEvidenceByTask[record.taskId] = record.requiredEvidenceLevel;
      const noEvidenceWasRecorded = record.testEvidence.length === 0;
      const criticalEvidenceGap = noEvidenceWasRecorded
        && record.risks.some((risk) => CRITICAL_RISKS.has(risk));
      addTaskReason(
        record.taskId,
        `required ${record.requiredEvidenceLevel} evidence is missing`,
        criticalEvidenceGap,
      );
    }
  }

  const recordBlockedIds = new Set(
    records.filter((record) => record.status === 'blocked').map((record) => record.taskId),
  );
  const envelopeBlockedIds = new Set(gates.envelopeBlockedTaskIds ?? []);
  for (const taskId of new Set([...recordBlockedIds, ...envelopeBlockedIds])) {
    if (recordBlockedIds.has(taskId) !== envelopeBlockedIds.has(taskId)) {
      addTaskReason(taskId, 'blocked status disagrees with the handoff envelope', true);
    }
  }

  if (blockingReasons.length > 0) {
    if (gates.nextTask === null) {
      blockingReasons.push('next_task is null while unresolved blockers remain');
    }
    return {
      state: 'blocked',
      reasons: [...blockingReasons, ...reasons],
      taskReasons,
      missingEvidenceByTask,
    };
  }

  if (gates.nextTask !== null) {
    reasons.push(`next task remains runnable: ${gates.nextTask}`);
  }
  if (!gates.productionVerificationPassed) {
    reasons.push('production verification gate has not passed');
  }
  if (gates.claimedCompletionState === 'release_ready' && !gates.releaseReadinessPassed) {
    reasons.push('completion report claims release_ready while release gates are not passing');
  }

  if (reasons.length > 0) {
    return {
      state: 'partial',
      reasons,
      taskReasons,
      missingEvidenceByTask,
    };
  }

  return {
    state: 'verified_production',
    reasons: [],
    taskReasons,
    missingEvidenceByTask,
  };
}
