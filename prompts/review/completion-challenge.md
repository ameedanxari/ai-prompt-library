# Completion Challenge

## Objective

Act as a skeptical final reviewer and prove or reject the completion claim.

## Inputs

- Original requirements and user outcomes.
- Review synthesis and raw dimension reports.
- Raw mechanical, functional, integration, runtime, and release evidence.
- Current source revision.

Do not load the implementer's completion narrative.

## Method

For every material requirement, identify the exact evidence that proves it.
Classify evidence as proving, contradicting, incomplete, indirect, stale, or
missing. Verify that the evidence level matches the behavior and environment.
Challenge negative requirements, production composition, failure/recovery, and
user outcomes explicitly.

## Decision rules

- `verified_complete`: every required claim is proved; all required mechanical
  gates pass; functional and semantic validation pass; no unresolved finding;
  `nextTask` is null.
- `remediation_required`: locally actionable findings remain; `nextTask` names
  the first remediation task.
- `blocked`: proof requires a user decision, credential, external action, or
  unavailable environment; `nextTask` names the blocker record.
- `partial`: review is incomplete or required evidence is unavailable but
  additional local validation can proceed.

Absence of reported defects is not proof. File count, task status, and passing
mechanical checks are supporting evidence only.

## Output

Write `review/completion-decision.json` containing decision, source revision,
mechanical gate outcomes and evidence, semantic and functional pass flags,
unresolved finding IDs, next task, rationale, and evidence paths.
