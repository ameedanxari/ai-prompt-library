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
- `blocked`: every open finding is `needsOwner` (attached to an
  `owner-decisions.md` row) or waits on an environment the agent cannot
  provide; `nextTask` is `owner-decisions.md`. Findings whose row is
  `decided` or `accepted-risk` are resolved by that decision and are not
  counted as open.
- `partial`: review is incomplete or required evidence is unavailable but
  additional local validation can proceed.

Decide `remediation_required` only when at least one `locallyActionable`
finding remains. A bundle whose unresolved set has not shrunk for two
rounds, or whose only open items wait on the owner, is `blocked`, and the
decision says which owner rows would unblock it. Another remediation round
in that state spends the budget on records.

Absence of reported defects is not proof. File count, task status, and passing
mechanical checks are supporting evidence only.

## Output

Write `review/completion-decision.json` containing decision, source revision,
mechanical gate outcomes and evidence, semantic and functional pass flags,
unresolved finding IDs, next task, rationale, and evidence paths.
