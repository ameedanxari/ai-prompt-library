# AI Agent Entry Point

Read only this file before routing. Inspect disk state before generating anything; a new chat does not require new ingestion or a new plan. Select ONE mode and load its engine, with conditional external intake/research only where needed.

## Review existing plans without mutation

An audit, critique or review of an existing plan is a read-only request, even when a resumption checkpoint exists. Inspect the named plan, original sources, existing findings and targeted validator results; report defects and proposed repairs. Do not resume implementation, regenerate planning artifacts, create a replacement run or migrate its schema unless the user requested that change. This is the review operation within Gap-closure, not a fifth mode. A checkpoint identifies context; it does not change review into execution permission.

## Resume first

1. For `Continue`, `resume`, `next`, `proceed` or equivalent, inspect `prompts/outputs/current/resumption-checkpoint.md`. Validate it with `bash .ai-prompts/scripts/validate-resumption-checkpoint.sh prompts/outputs/current/resumption-checkpoint.md`.
2. A checkpoint with `run_directory` selects an isolated outcome run. Resolve it inside the library output tree, require its valid supported `delivery-manifest.json`, and load only the manifest, named active slice and `re_load_files`. Require checkpoint phase, active slice and next action to agree with the manifest before continuing; diagnose mismatches rather than acting on mixed state. Missing/invalid manifest, unsafe paths or an invalid migrated checkpoint fail closed. Never fall through to legacy.
3. A checkpoint without `run_directory`, or an existing legacy `execution-log.md` with non-null `next_task`, is resumable only as an explicitly identified legacy run. Load `.ai-prompts/prompts/orchestrators/legacy-workflow.md` and the active task/log; preserve its history. Do not reinterpret old claims as outcome acceptance.
4. With no resumable disk state, a bare resumption verb is ambiguous. Report that no checkpoint or in-flight execution log identifies work; ask the user to describe the work or point to its run. Do not manufacture a plan.
5. Explicit `force reload`, `rebuild context` or `re-read all` reloads the selected run's contract and relevant source inputs, scope changes and evidence. It does not regenerate all deferred implementation detail, delete state, expand scope or bypass acceptance.

## Four modes (first match wins)

| Mode | Condition | Engine |
| --- | --- | --- |
| Trivial | Small straightforward edit needing no delivery run | None; edit and verify directly |
| Execute | Existing valid active-slice plan and execution authorization | `.ai-prompts/prompts/orchestrators/executor.md` |
| Gap-closure | Existing product or plan; audit, finish, productionize or challenge completion requested | `.ai-prompts/prompts/orchestrators/audit-and-remediate.md` |
| Greenfield | New product/outcome work or no other match | `.ai-prompts/prompts/orchestrators/drill-down-engine.md` |

For outcome Execute, validate the selected run at stage `execute` before execution. A task file's existence alone is insufficient. For legacy Execute, explicitly select the legacy contract. A specific architecture-only request stays in Greenfield and stops after the requested architecture artifact; it does not authorize implementation.

## Conditional reads

If `working_copy/`, existing source or listed external/reference material exists, load `.ai-prompts/prompts/orchestrators/external-input-handler.md` before planning. Reuse its verified digest-bound context if unchanged. External intake never restarts merely because context was compacted.

For regulated/high-stakes domains, provider/cloud architecture, security/privacy, consequential AI, current guidance or a large corpus needing split inspection, load `.ai-prompts/prompts/orchestrators/research-and-fanout-policy.md`. Use current authoritative sources for affected claims and retain the source ledger. Neither routing nor domain keywords authorize unrelated features.

New generated manifests use `schemaVersion: 2` and require `planning-integrity.json` plus `review-findings.json`; use `.ai-prompts/docs/planning-integrity.md` for the compact schema and source/milestone/runner checks. Version 1 remains explicitly legacy/unassessed for these checks. Migrate only with authorization and retained history.

Each planning engine loads the shared `.ai-prompts/prompts/orchestrators/rolling-delivery.md` for the new outcome workflow. Other orchestrators/modules are on demand; never load the catalog wholesale. IDE-native plans do not supersede the selected contract.

For completion challenges, the Gap-closure engine loads `.ai-prompts/prompts/orchestrators/semantic-review-and-validation.md` on demand.

## Authorization and checkpoints

Preserve all original obligations: read original source requirements before derived completion narratives and check both source-to-outcome completeness and outcome-to-source traceability. Scope approval covers source obligations and reviewed path classification, while execution/release proof binds the exact deployment. Persist the actual user instructions governing execution, required user checkpoints, design acceptance, scope changes and independent review in the manifest. At a required checkpoint present the runnable target/artifact, entry/action sequence, relevant captured states, limitations and evidence links; write a short checkpoint with `run_directory`, engine, phase, step, next action and bounded `re_load_files`. Update the manifest and checkpoint together, then validate their agreement before handoff. Stop and wait for `Continue` where required. Explicit prior autonomy can authorize ordinary transitions; it cannot self-grant owner-reserved acceptance or cancel a user-required checkpoint. Do not repeatedly ask permission already granted.

Never automatically reset on stale markers, `clean up`, or a new audit. An authorized new audit run is isolated; inspecting an existing plan preserves its run unchanged. An explicit reset still requires preserving consumer files and historical evidence; follow the requested scope rather than a destructive blanket reset.

Review dispatch, impact-scoped reuse, separate owner/independent duties and fresh release evidence follow the shared rolling-delivery contract. Load it once for the selected engine; a new chat alone does not invalidate current evidence. Migrate incompatible evidence contracts explicitly, preserving history and required proof.
