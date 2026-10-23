# Explicit Legacy Workflow

This path supports existing task/remediation contracts and preserves historical IDs, logs and evidence. It is not the default for new runs. Do not invoke it after a migrated checkpoint loses its manifest, or after an invalid/unknown manifest version. Those cases fail closed.

Confirm the selected legacy output directory and state that its completion claims use the old contract. Existing `tasks-*.md`/`remediation-*.md`, task-contract/graph, delivery order, machine-authored revise report and execution log remain intact. Load only the active task and relevant dependencies. Use existing `finalize.sh`, `revise.sh`, `validate-ready-to-execute.sh`, semantic validators and execution helpers with that explicit directory. Never hand-author a passing mechanical revise report or bypass a failing gate. Follow the existing task schema and dependency order where those tools require them.

Execute concrete changes and named tests; preserve useful/recovery evidence, owner authorization, fixture isolation, secrets/legal/safety limits and required user checkpoints. Do not rewrite old history to satisfy a new schema. Mechanical task completion cannot create a new outcome-verified release claim.

For migration create an isolated outcome run using the shared rolling-delivery workflow. Map original source requirements and applicable release obligations into the full ledger; import old tasks/evidence as historical claims. Require current target-bound evidence and reviews before accepting outcomes. A legacy report, owner-decisions row or source file count does not supply that proof. Migration must not reset/delete consumer runtime state or old evidence.

For legacy planning only, `bash .ai-prompts/scripts/step3-progress.sh <legacy-directory>` reports whether declared feature task files exist. It is a file-presence checklist, not evidence that behavior works or scope/release is complete. Outcome runs dispatch this compatibility wrapper to the shared manifest gate rather than exhaustive feature expansion.
