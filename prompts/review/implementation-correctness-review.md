# Implementation Correctness Review

## Objective

Review the actual implementation and surrounding code for behavioral defects,
regressions, unsafe assumptions, and maintainability risks.

## Inputs

- Relevant diff and full surrounding modules.
- Runtime entry points and composition roots.
- Tests and raw test output.
- Requirement and task IDs for the reviewed code.

## Review method

Inspect control flow, state transitions, error paths, boundary validation,
concurrency, retries, idempotency, persistence, authorization, destructive
actions, migrations, compatibility, and cleanup. Verify that tests exercise the
real implementation rather than restating it.

## Finding rules

- Lead with defects, not summaries.
- Cite file and locator evidence.
- Explain the failing scenario and user or system impact.
- Do not report style preferences unless they create correctness or operational
  risk.
- A test gap is a finding only when it leaves a concrete behavior unproved.

## Output

Write `review/implementation-review.json` using the dimension report contract
with `dimension: implementation-correctness`.
