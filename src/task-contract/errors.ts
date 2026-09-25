/**
 * Typed error hierarchy for the task-contract tooling (item 16).
 *
 * Every CLI in this package (src/task-contract/cli.ts, src/review/cli.ts)
 * translates these errors into process exit codes:
 *
 *   0 — success (the report was written, even if it contains issues)
 *   1 — unexpected internal error (TaskContractError)
 *   2 — usage error: bad arguments, missing directory, no task files found
 *       (TaskContractUsageError)
 *   3 — input error: the inputs exist but are malformed or unreadable
 *       (TaskContractInputError)
 *
 * "Report written" always exits 0, even when the report is full of issues:
 * the report itself carries the verdict (summary.blocked), so a nonzero exit
 * would conflate "the tool broke" with "the plan has problems".
 */
export class TaskContractError extends Error {
  /** Machine-readable error code, stable across releases. */
  readonly code: string = 'internal-error';
  /** Process exit code for CLIs. */
  readonly exitCode: number = 1;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TaskContractError';
  }
}

export class TaskContractUsageError extends TaskContractError {
  override readonly code = 'usage-error';
  override readonly exitCode = 2;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TaskContractUsageError';
  }
}

export class TaskContractInputError extends TaskContractError {
  override readonly code = 'input-error';
  override readonly exitCode = 3;

  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'TaskContractInputError';
  }
}

/**
 * Converts any thrown value into a TaskContractError, preserving typed
 * errors and wrapping unknown failures as internal errors.
 */
export function toTaskContractError(error: unknown): TaskContractError {
  if (error instanceof TaskContractError) return error;
  return new TaskContractError(error instanceof Error ? error.message : String(error));
}
