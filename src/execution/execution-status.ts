import type { CompletionState } from '../completion/completion-state.js';
import type { EvidenceLevel } from '../task-contract/task-parser.js';

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
  /** Repo-relative paths this evidence covers; present together with pathsDigest. */
  coveredPaths?: string[];
  /** `sha256:<64 hex>` over sorted `<path>\t<blob>\n` lines (see scripts/check-evidence-currency.sh --digest). */
  pathsDigest?: string;
}

export const BLOCKED_ON_KINDS = ['owner-decision', 'dependency', 'environment'] as const;
export type BlockedOnKind = (typeof BLOCKED_ON_KINDS)[number];

/** Why a blocked record is blocked; `owner-decision` ids resolve to `## <id>` headings in owner-decisions.md. */
export interface BlockedOnReference {
  kind: BlockedOnKind;
  id?: string;
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
  /** Marks a later record for a taskId already recorded; the last record in log order is authoritative. */
  followUp?: boolean;
  blockedOn?: BlockedOnReference;
}

/** Separator between archives and the main log (a `##` line ends any journal section). */
export const EXECUTION_LOG_ARCHIVE_BOUNDARY = '\n## (journal archive boundary)\n\n';

const FRONTMATTER_PATTERN = /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;

function splitFrontmatter(text: string): { frontmatter: string; rest: string } {
  const match = FRONTMATTER_PATTERN.exec(text);
  if (!match) return { frontmatter: '', rest: text };
  return { frontmatter: match[1] ?? '', rest: text.slice(match[0].length) };
}

/**
 * Archive paths (relative to the project root) listed under `journal_archives`
 * in the execution log's frontmatter, as block or inline YAML list.
 */
export function parseJournalArchives(logText: string): string[] {
  const { frontmatter } = splitFrontmatter(logText);
  const lines = frontmatter.split(/\r?\n/);
  const unquote = (value: string): string => value.trim().replace(/^["']|["']$/g, '');
  for (let index = 0; index < lines.length; index += 1) {
    const match = /^journal_archives:\s*(.*)$/.exec(lines[index] ?? '');
    if (!match) continue;
    const inline = (match[1] ?? '').trim();
    if (inline.startsWith('[')) {
      return inline.replace(/^\[/, '').replace(/\]$/, '').split(',').map(unquote).filter(Boolean);
    }
    if (inline && inline !== 'null' && inline !== '~') return [unquote(inline)];
    const items: string[] = [];
    for (const follow of lines.slice(index + 1)) {
      const item = /^\s+-\s+(.*?)\s*$/.exec(follow);
      if (!item) break;
      const value = unquote(item[1] ?? '');
      if (value) items.push(value);
    }
    return items;
  }
  return [];
}

/**
 * Logical execution log: archives in listed order (they are older), then the
 * main log, so "the last record in log order is authoritative" still holds.
 * `archiveTexts` are the archive file contents in `parseJournalArchives` order.
 */
export function composeLogicalExecutionLog(mainLogText: string, archiveTexts: string[]): string {
  if (archiveTexts.length === 0) return mainLogText;
  const bodies = archiveTexts.map((archive) => splitFrontmatter(archive).rest);
  return bodies.join(EXECUTION_LOG_ARCHIVE_BOUNDARY) + EXECUTION_LOG_ARCHIVE_BOUNDARY + mainLogText;
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
  const recordsById = new Map<string, TaskUnitExecutionRecord>();

  const addTaskReason = (taskId: string, reason: string, blocking = false): void => {
    const taskEntries = taskReasons[taskId] ?? [];
    taskEntries.push(reason);
    taskReasons[taskId] = taskEntries;
    (blocking ? blockingReasons : reasons).push(`${taskId}: ${reason}`);
  };

  // A later record for the same task is legal only as an explicit follow-up
  // (`followUp: true`); the last record in log order is authoritative.
  for (const record of records) {
    const isFollowUp = record.followUp === true;
    if (recordsById.has(record.taskId)) {
      if (!isFollowUp) {
        addTaskReason(record.taskId, 'duplicate canonical execution record', true);
      }
      // Last wins in both cases, matching scripts/validate-execution-status.sh.
      recordsById.set(record.taskId, record);
    } else if (isFollowUp) {
      addTaskReason(record.taskId, 'follow-up record has no earlier canonical record', true);
    } else {
      recordsById.set(record.taskId, record);
    }
  }

  for (const requiredTaskId of gates.requiredTaskIds ?? []) {
    if (!recordsById.has(requiredTaskId)) {
      addTaskReason(requiredTaskId, 'canonical execution record is missing');
    }
  }

  const authoritativeRecords = [...recordsById.values()];

  for (const record of authoritativeRecords) {
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
    const evidenceIds = new Set(record.testEvidence.map((evidence) => evidence.id));
    for (const acceptance of record.acceptance) {
      if (!acceptance.met) {
        addTaskReason(record.taskId, `acceptance ${acceptance.id} is unmet`);
      } else if (acceptance.evidenceIds.length === 0) {
        addTaskReason(record.taskId, `acceptance ${acceptance.id} has no evidence links`);
      } else if (acceptance.evidenceIds.some((evidenceId) => !evidenceIds.has(evidenceId))) {
        addTaskReason(record.taskId, `acceptance ${acceptance.id} links unknown evidence`);
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
    authoritativeRecords.filter((record) => record.status === 'blocked').map((record) => record.taskId),
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
