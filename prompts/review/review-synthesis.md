# Review Synthesis

## Objective

Merge independent dimension reports into one canonical, lossless review result.

## Inputs

All eight required dimension reports for one source revision.

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
- Classify every canonical finding by who can close it. `locallyActionable`
  findings go to the remediation planner. `needsOwner` findings (closure
  needs a credential, account, money, legal or policy call, risk
  acceptance or external capacity) get a `decisionId` from
  the selected run’s `owner-decisions.md`: reuse the row that already
  covers the same question, otherwise add one row with options and a
  recommendation. One row per question, never one per finding.
- A decision closes only what its actual authority/provenance permits. It cannot prove missing behavior, erase explicit requirements without owner authority, or waive non-waivable duties. Retain exclusions as exclusions and preserve unresolved proof obligations.
- Collapse repeats across dimensions: eight reports describing the same
  defect in the same behaviour are one canonical finding with eight
  sources, not eight findings.

## Output

Write `review/review-synthesis.json` with:

- `schemaVersion`, `synthesisId`, `sourceRevision`, and `synthesizedAt`.
- `includedReviewIds` containing all eight review IDs.
- `canonicalFindings` containing every unique finding, each with
  `closure: "locallyActionable" | "needsOwner"` and, for `needsOwner`,
  its `decisionId`.
- `resolvedByDecision` and `needsOwner` ID lists beside the open,
  blocking and resolved lists; `reviewerDefects` for re-raised items.
- `disagreements` preserving dissent.
- `unresolvedFindingIds`, `blockingFindingIds`, and `resolvedFindingIds`.
- `completionRecommendation`.
- `rationale` and evidence references.

For outcome acceptance/release also run `validate-delivery.sh` at the appropriate stage. Inspect actual raw outputs and independently exercise the primary result. Authenticate reviewer/owner provenance through trusted receipts bound to scope/artifact digests; self-authored identity/approval flags are insufficient. Required reviews stay pending without that access.
