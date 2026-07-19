# Semantic Review And Validation Orchestrator

Use this orchestrator after implementation and before any final completion
claim. It supplements mechanical checks with independent AI review, executable
functional validation, evidence scrutiny, and remediation planning.

## Inputs

Load authoritative sources from disk:

- Original brief and project context.
- Requirement, flow, feature, and task artifacts.
- `task-contract.json`, `task-graph.json`, and `execution-log.md`.
- The implementation diff and relevant surrounding source.
- Raw test, build, runtime, device, browser, manual, and release evidence.
- Existing completion, envelope, fixture, walking-skeleton, and release reports.

Treat implementation summaries and prior completion claims as untrusted claims,
not evidence.

## Outputs

Write under `prompts/outputs/current/review/`:

1. `intent-fidelity-report.json`
2. `implementation-review.json`
3. `functional-validation-report.json`
4. `integration-review.json`
5. `adversarial-review.json`
6. `evidence-audit.json`
7. `user-outcome-review.json`
8. `review-synthesis.json`
9. `completion-decision.json`
10. `remediation-plan.md` when completion is not verified

Follow `prompts/review/README.md` exactly.

## Phase 0: Review preflight

1. Capture one source revision for the complete review bundle. If the worktree
   is dirty, use a deterministic fingerprint and record the changed paths.
2. Run the applicable mechanical gates. Retain commands, outcomes, and report
   paths for the completion challenge's `mechanicalGates` evidence. For any
   project whose plan includes `content-system.md`, the gates include
   `bash .ai-prompts/scripts/validate-content-lint.sh prompts/outputs/current .`
   (banned surface terms, identifier-derived display names, fixture data in
   UI source, duplicate shortcuts, content-inventory cross-check).
3. Build seven context packets. Each packet contains only the inputs needed for
   its dimension.
4. Assign unique `contextId` values and at least three reviewer perspectives.
5. Mark at least one packet blind: omit the implementation narrative and set
   `implementationNarrativeReceived: false`.
6. Do not start synthesis until all dimension reports are written.

## Phase 1: Independent dimension reviews

Run these prompts independently:

1. `prompts/review/intent-fidelity-review.md`
2. `prompts/review/implementation-correctness-review.md`
3. `prompts/review/functional-validation-designer.md`
4. `prompts/review/integration-composition-review.md`
5. `prompts/review/adversarial-edge-case-review.md`
6. `prompts/review/evidence-quality-audit.md`
7. `prompts/review/user-outcome-validation.md`

Parallel read-only reviewers are preferred when available. Each reviewer writes
only its own report and cannot edit implementation files, plans, evidence, or
another report.

## Phase 2: Review synthesis

Run `prompts/review/review-synthesis.md` with all seven reports.

The synthesizer must:

- Verify all reports review the same source revision.
- Preserve every finding ID and its evidence.
- Deduplicate only when findings describe the same observed defect.
- Preserve dissent and confidence instead of averaging it away.
- Treat critical and high findings as blocking while open.
- Treat inconclusive evidence as unresolved, never passing.
- Produce canonical open, blocking, resolved, and accepted-risk ID lists.
- Recommend `verified_complete` only when no unresolved finding remains.

## Phase 3: Completion challenge

Run `prompts/review/completion-challenge.md` without the implementer's narrative.
Give it the synthesis, original requirements, raw evidence, and mechanical gate
reports. It writes `completion-decision.json`.

The challenger must prove completion claim by claim. Absence of a finding is not
proof. Missing, stale, indirect, fixture-only, or circular evidence results in
`partial`, `blocked`, or `remediation_required`.

## Phase 4: Remediation planning

When the decision is not `verified_complete`, run
`prompts/review/remediation-planner.md`.

The plan must:

- Cover every unresolved finding ID.
- Preserve requirement, flow, task, and dependency IDs.
- Split work by artifact kind.
- Name exact files, tests, evidence levels, acceptance criteria, and runtime
  reachability.
- Put production composition and primary-flow fixes before breadth or polish.
- Add validation tasks for claims that lack executable proof.
- Set `nextTask` in the completion decision to the first runnable remediation.

Merge generated review remediation into the normal task-contract, graph,
delivery-order, execution-log, and checkpoint flow. Do not hand-edit generated
product output merely to make review evidence pass.

## Phase 5: Mechanical review validation

Run:

```bash
bash .ai-prompts/scripts/validate-semantic-review.sh prompts/outputs/current
```

- Exit `0`: semantic review permits honest handoff.
- Exit `1`: review is honest but remediation or a blocker remains. Resume the
  executor from the named next task.
- Exit `2`: review artifacts are missing or inconsistent. Repair the review
  process, not the implementation verdict.

Never set `next_task: null` until this validator exits `0` and the existing
honest-handoff gates also pass.

## Checkpoint

Semantic review is its own execution checkpoint. After implementation tasks are
accounted for, set:

```yaml
phase: execution
engine: executor
step: "Semantic review"
last_completed: "<last implementation prompt>"
next_action: "Run semantic review and validation"
re_load_files:
  - prompts/outputs/current/execution-log.md
  - .ai-prompts/prompts/orchestrators/semantic-review-and-validation.md
updated_at: <ISO 8601 UTC>
```

Stop and wait for `Continue`. Do not compress implementation and independent
review into one self-approval turn.
