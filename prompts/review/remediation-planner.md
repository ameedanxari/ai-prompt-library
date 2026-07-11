# Review Remediation Planner

## Objective

Convert unresolved semantic review findings into executable, dependency-ordered
work before completion is claimed.

## Inputs

- Review synthesis and completion decision.
- Original requirement, flow, feature, and task IDs.
- Existing task contract, graph, delivery order, and path ledger.

## Planning method

1. Create a coverage row for every unresolved finding ID.
2. Group findings only when one atomic change and one evidence strategy closes
   them together.
3. Split runtime, test, docs, config, asset, generated-evidence, and external
   action work into separate task units.
4. Order production composition, migrations, primary flows, and safety fixes
   before breadth, polish, or evidence generation.
5. Add explicit validation tasks when implementation exists but proof is weak.
6. Preserve prior IDs and dependencies. Add reviewed overrides for intentional
   semantic changes.

## Required task fields

Every `## R<n>` task includes:

- Closes user story
- Finding IDs
- Requirement IDs
- Artifact kind
- Evidence level
- Runtime reachability
- Change type
- File
- Depends on
- Precise change
- Acceptance
- Test
- Estimated LOC
- Phase

## Hard rules

- Every unresolved finding appears in at least one task.
- Every task closes a named finding and requirement or validation claim.
- Do not create documentation as a proxy for missing runtime behavior.
- Do not weaken thresholds or delete evidence to close a finding.
- Do not patch generated product output during canary or review evaluation.

## Output

Write `review/remediation-plan.md`, then materialize its task units as normal
`remediation-review-<slug>.md` files. Rebuild task contract, graph, delivery
order, and checkpoint. Update `completion-decision.json.nextTask` to the first
runnable remediation task.
