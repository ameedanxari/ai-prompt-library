# Semantic Review Prompt Suite

This directory defines the AI review phase that follows implementation and
precedes the executor's honest handoff. Mechanical gates remain mandatory, but
they cannot independently establish semantic correctness or functional
completion.

## Canonical review dimensions

| Dimension | Prompt | Required report |
|---|---|---|
| `intent-fidelity` | `intent-fidelity-review.md` | `review/intent-fidelity-report.json` |
| `implementation-correctness` | `implementation-correctness-review.md` | `review/implementation-review.json` |
| `functional-validation` | `functional-validation-designer.md` | `review/functional-validation-report.json` |
| `integration-composition` | `integration-composition-review.md` | `review/integration-review.json` |
| `adversarial-edge-cases` | `adversarial-edge-case-review.md` | `review/adversarial-review.json` |
| `evidence-quality` | `evidence-quality-audit.md` | `review/evidence-audit.json` |
| `user-outcome` | `user-outcome-validation.md` | `review/user-outcome-review.json` |
| `content-experience` | `content-experience-review.md` | `review/content-experience-review.json` |

All paths are relative to `prompts/outputs/current/`.

## Reviewer isolation

- Run each dimension in a distinct independent context packet with a unique
  `contextId`.
- Use at least three reviewer identities or perspectives across the eight
  dimensions.
- At least one reviewer MUST be blind to the implementer's completion summary
  and implementation narrative. That report sets
  `implementationNarrativeReceived: false`.
- Reviewers receive original requirements, the relevant source/diff, and raw
  evidence. They do not receive another reviewer's verdict before writing their
  own report.
- A reviewer may cite another report only during synthesis, never during the
  independent dimension pass.

## Finding contract

Every finding uses this shape:

```json
{
  "findingId": "FIND-INTENT-001",
  "dimension": "intent-fidelity",
  "severity": "high",
  "disposition": "open",
  "claim": "The production adapter is integrated.",
  "expectedBehavior": "The shipped composition root constructs the production adapter.",
  "observedBehavior": "Only the test composition root references the adapter.",
  "evidence": [
    {
      "kind": "code",
      "source": "src/app/composition.ts",
      "locator": "createApplication",
      "outcome": "fail"
    }
  ],
  "requirementIds": ["REQ-INTEGRATION-001"],
  "taskIds": ["tasks-production-wiring.md#T1"],
  "confidence": 0.96,
  "validationNeeded": "Run the production composition integration test.",
  "recommendedAction": "Wire the adapter in the shipped entry point and add integration evidence.",
  "remediationRequired": true
}
```

Allowed severities are `critical`, `high`, `medium`, `low`, and `info`.
Allowed dispositions are `open`, `resolved`, `accepted-risk`, and
`false-positive`. Accepted risk requires an approval artifact in evidence and
cannot close a critical finding.

Evidence must identify a source and outcome. A statement such as "tests pass"
without a command, report, runtime observation, code locator, or review record
is not evidence.

## Dimension report contract

Each required report uses `schemaVersion: 1` and includes:

```json
{
  "schemaVersion": 1,
  "reviewId": "REVIEW-INTENT-001",
  "dimension": "intent-fidelity",
  "sourceRevision": "<git revision or deterministic worktree fingerprint>",
  "reviewedAt": "<ISO 8601 UTC timestamp>",
  "reviewer": {
    "reviewerId": "reviewer-requirements",
    "contextId": "context-intent-001",
    "promptFile": "prompts/review/intent-fidelity-review.md",
    "independentContext": true,
    "implementationNarrativeReceived": false
  },
  "scope": {
    "requirementIds": ["REQ-001"],
    "taskIds": ["tasks-feature.md#T1"],
    "files": ["src/feature.ts"]
  },
  "claimsReviewed": ["The primary workflow is implemented and reachable."],
  "validationScenarios": [],
  "findings": [],
  "verdict": "pass"
}
```

`functional-validation` MUST include non-empty `validationScenarios`. Every
scenario names its evidence level, command or procedure, expected behavior,
observed behavior, outcome, and evidence sources.

## Synthesis and completion

`review-synthesis.json` must include every dimension report and every finding.
It may deduplicate findings but cannot drop them. Disagreements preserve each
position, resolution rationale, and dissent. Scores and majority votes never
erase a critical or high finding.

`completion-decision.json` uses exactly one decision:

- `verified_complete`
- `partial`
- `blocked`
- `remediation_required`

Only `verified_complete` may use `nextTask: null`. Every other decision names a
locally runnable next task or an explicit blocker and requires
`review/remediation-plan.md` covering every unresolved finding.

Run:

```bash
bash .ai-prompts/scripts/validate-semantic-review.sh prompts/outputs/current
```

Exit `0` permits the executor to proceed to honest handoff. Exit `1` means the
review is structurally valid but remediation or a blocker remains. Exit `2`
means the review bundle is missing or internally inconsistent.
