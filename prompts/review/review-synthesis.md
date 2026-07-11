# Review Synthesis

## Objective

Merge independent dimension reports into one canonical, lossless review result.

## Inputs

All seven required dimension reports for one source revision.

## Method

1. Verify report identity, revision, scope, independence, and verdict fields.
2. Preserve every finding ID before deduplication.
3. Group only findings with the same observed defect and affected behavior.
4. Retain all evidence, requirement IDs, task IDs, severity opinions, and
   confidence values in the canonical finding.
5. Record disagreements with every perspective, resolution rationale, and
   `dissentPreserved: true`.
6. Derive open, blocking, and resolved lists from dispositions and severity.
7. Recommend completion conservatively. Inconclusive means unresolved.

## Hard rules

- Do not average away a blocker.
- Do not drop a minority finding because other reviewers did not observe it.
- Do not mark a finding resolved without post-fix evidence on the reviewed
  source revision.
- Critical accepted risk is still blocking.
- `verified_complete` requires zero unresolved findings and passing functional
  validation.

## Output

Write `review/review-synthesis.json` with:

- `schemaVersion`, `synthesisId`, `sourceRevision`, and `synthesizedAt`.
- `includedReviewIds` containing all seven review IDs.
- `canonicalFindings` containing every unique finding.
- `disagreements` preserving dissent.
- `unresolvedFindingIds`, `blockingFindingIds`, and `resolvedFindingIds`.
- `completionRecommendation`.
- `rationale` and evidence references.
