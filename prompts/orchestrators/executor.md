# Executor

Resolve the checkpoint's `run_directory` before loading tasks. For a supported outcome manifest use `.ai-prompts/prompts/orchestrators/rolling-delivery.md`; explicitly selected legacy execution uses `.ai-prompts/prompts/orchestrators/legacy-workflow.md`. Invalid/missing migrated manifests are errors, not legacy fallback.

## Preflight

Read the current manifest, bounded active slice, authorization, unresolved owner decisions and exact next unit. Run `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage execute`. The execute stage checks plan integrity, scope approval and persisted execution authority before starting construction. Refuse invalid plan/dependencies/budget or missing execution authority. Do not reread or regenerate all future detail. Project/task logs are projections of the authoritative scope resolver, never independent success flags.

For visual work, first implement the smallest rendered representative entry and compare it with digest-bound authoritative design documents. Until first-proof design acceptance, stay within two units/1,200 words/9,600 bytes in one slice; do not detail backend breadth or the full journey. Extensions cannot waive this limit. Read the source criteria and required viewport/theme contexts, including phone and desktop for web; tokens/fonts alone do not establish design fidelity.

## Cohesive unit loop

1. Check source/target/dependency changes since planning and invalidate affected evidence/acceptance transitively. Resolve cross-slice dependencies to accepted outcomes with retained current evidence. Technical verification does not substitute for required product acceptance.
2. Inspect affected paths and ownership before changes; preserve existing work and secrets. Implement the useful change across its necessary files, integration, content and recovery. Follow repository checks and actual runtime contracts. Do not create documentation as a proxy for missing behavior.
3. Run meaningful checks and the declared actual entry/action path. Capture source/target-bound raw evidence, including relevant failure/recovery. For visual surfaces capture and inspect the composed application at representative sizes/devices and fresh/populated states. For headless work exercise the real consumer/installed invocation/operational result. Fake fixtures are labelled and leave production duties open.
4. Diagnose failures rather than weakening assertions. `.ai-prompts/scripts/diagnose-harness.sh` and the relevant harness-recovery module can distinguish environment faults from code faults. Bound recovery attempts, preserve failed evidence, and stop when safe recovery/authority is unavailable. Never erase failures to close a unit.
5. Record the observed result and evidence through canonical tooling. For each visual outcome retain `design-review` comparisons of every criterion/context against current composed entry images for that same outcome; record exact entry route, viewport and theme. Obtain the policy-appropriate trusted `design-review` decision bound by `deliveryDesignReviewBinding`, separately from functional acceptance. Compare intent/materials, composition, hierarchy, content and mobile behavior; do not substitute token/font, component/palette or navigation approval. Missing, failed or rejected design review requires repair within the same proof before unrelated breadth. Task success establishes only its proved claims. Obtain required owner/independent review with trusted provenance; do not self-author approval or infer it from silence.
6. Run stage `advance` at the slice boundary. Repair failed proof before unrelated breadth. Honor required checkpoints and present the actual runnable target, entry/actions, relevant states, limitations and evidence links. Persist the next action and bounded reload set in the root checkpoint.

Use `.ai-prompts/prompts/orchestrators/semantic-review-and-validation.md` for the acceptance challenge. At release run stage `release` for the complete authoritative scope and consistent release candidate. Report incomplete, excluded, owner-blocked and unverified obligations honestly. An unproved required release condition remains open even when local work is useful and complete.

Keep `designAcceptedOutcomeIds` distinct from technical verification, accepted full proof and release readiness. Design comparisons/captures cannot carry forward across changed source/target bindings; recapture and review. Plan-file expansion alone does not invalidate the dedicated design binding.

## Authorization and changes

Explicit autonomy persists across chats and allows ordinary transitions within scope. Required user checkpoints and owner-reserved design/commercial/legal/safety decisions still stop. Continue independent authorized work while inputs are pending. Evidence requests do not authorize external applies, destructive drills, charges, publishing or paid services.

Commits follow the user's/repository's policy; there is no mandatory commit per file. Run `.ai-prompts/scripts/safety-check-commit.sh` before any authorized commit and preserve logical reviewable units. Push only when authorized. Never auto-reset a run or consumer state.
