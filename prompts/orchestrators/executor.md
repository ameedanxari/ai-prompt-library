# Executor

Resolve and validate the checkpoint's `run_directory`, manifest and active slice before construction. Invalid/missing migrated state fails closed; only explicitly selected legacy runs use `.ai-prompts/prompts/orchestrators/legacy-workflow.md`. Review-only requests never authorize execution.

Load `.ai-prompts/prompts/orchestrators/rolling-delivery.md` once: it is the canonical authority for budgets, source scope, lifecycle, evidence, review reuse, acceptance and release. Read original obligations and affected sources, current authorization and blockers; reuse unchanged context. Run `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage execute`. Report executable-now units and the concrete next unblocker; structural validity alone grants no authority.

## Cohesive unit loop

1. Inspect actual paths, dependencies and consumers. Invalidate affected evidence on change; preserve historical receipts. Confirm the active milestone's useful success/recovery criteria and resources exist before their consumers.
2. Implement the cohesive change, including necessary source, tests, runner/bootstrap configuration and lockfile. Use the chosen production stack for prototypes; mocks remain labelled. Keep pending detail within the shared design/proof caps. Independent work needs no invented visual dependency.
3. Run focused meaningful tests and the actual entry-to-value and recovery route. At usable, milestone and release boundaries require the corresponding actual production build through `.ai-prompts/scripts/build-gate.sh`; typechecking is distinct. Capture current composed screens or actual headless consumer/operational evidence. Empty tests and fake providers cannot establish production readiness.
4. Diagnose rather than weaken checks. Use the relevant harness-recovery guidance when needed; retain failures and stop at missing authority or unrecoverable conditions.
5. Record raw evidence and required separate design/functional reviews under the shared contract. Use `.ai-prompts/prompts/orchestrators/semantic-review-and-validation.md` to challenge actual behavior. Never self-author owner or independent approval.
6. Run stage `advance`, repair failed proof before breadth, then update and validate matching manifest/checkpoint state. Present the target, entry/actions, states, evidence, limitations and next slice. Required user checkpoints still stop; prior autonomy covers only authorized ordinary transitions.

## Commits and release

Run `.ai-prompts/scripts/safety-check-commit.sh` before authorized commits. With `commit-task.sh`, retain prepared work/evidence, require successful commit or verified exact-tree recovery, and only then advance the checkpoint. Failure never advances it. Preserve unrelated work and secrets; no mandatory commit per file. Push only when authorized.

Release uses the full original brief and authoritative release scope, fresh exact-candidate proof and its separate trusted release review as specified in the shared contract. Report incomplete, excluded, blocked and unverified obligations. Evidence alone never authorizes external applies, destructive resets, purchases or publication.
