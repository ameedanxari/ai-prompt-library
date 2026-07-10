export const COMPLETION_DIMENSIONS = [
  'planning',
  'artifact_accounting',
  'fixture_verification',
  'production_verification',
  'partial_blocked_state',
  'release_readiness',
] as const;

export type CompletionDimension = (typeof COMPLETION_DIMENSIONS)[number];

export const COMPLETION_STATES = [
  'planning_complete',
  'artifact_complete',
  'verified_fixture',
  'verified_production',
  'release_ready',
  'partial',
  'blocked',
] as const;

export type CompletionState = (typeof COMPLETION_STATES)[number];

export type CompletionGateStatus = 'pass' | 'fail' | 'not_applicable';

export interface CompletionGateResult {
  dimension: CompletionDimension;
  status: CompletionGateStatus;
  required: boolean;
  summary: string;
  blockingReasons: string[];
  evidence: string[];
}

export interface CompletionReport {
  generatedBy: string;
  state: CompletionState;
  nextTask: string | null;
  nextTaskMeaning: string;
  dimensions: Record<CompletionDimension, CompletionGateResult>;
}

export const NEXT_TASK_NULL_MEANING =
  'next_task: null means no locally runnable task remains; it does not imply verified production behavior or release readiness.';

export function createCompletionGateResult(
  dimension: CompletionDimension,
  status: CompletionGateStatus,
  summary: string,
  options: {
    required?: boolean;
    blockingReasons?: string[];
    evidence?: string[];
  } = {},
): CompletionGateResult {
  return {
    dimension,
    status,
    required: options.required ?? true,
    summary,
    blockingReasons: options.blockingReasons ?? [],
    evidence: options.evidence ?? [],
  };
}

export function deriveCompletionState(
  dimensions: Record<CompletionDimension, CompletionGateResult>,
): CompletionState {
  if (dimensions.partial_blocked_state.status === 'fail') {
    return 'blocked';
  }

  const requiredFailures = Object.values(dimensions).filter(
    (dimension) => dimension.required && dimension.status === 'fail',
  );
  if (requiredFailures.length > 0) {
    return 'partial';
  }

  if (dimensions.release_readiness.status === 'pass') {
    return 'release_ready';
  }
  if (dimensions.production_verification.status === 'pass') {
    return 'verified_production';
  }
  if (dimensions.fixture_verification.status === 'pass') {
    return 'verified_fixture';
  }
  if (dimensions.artifact_accounting.status === 'pass') {
    return 'artifact_complete';
  }

  return 'planning_complete';
}

export function buildCompletionReport(input: {
  generatedBy: string;
  nextTask: string | null;
  dimensions: Record<CompletionDimension, CompletionGateResult>;
}): CompletionReport {
  return {
    generatedBy: input.generatedBy,
    state: deriveCompletionState(input.dimensions),
    nextTask: input.nextTask,
    nextTaskMeaning: input.nextTask === null
      ? NEXT_TASK_NULL_MEANING
      : 'next_task names the next locally runnable task selected by the executor.',
    dimensions: input.dimensions,
  };
}
