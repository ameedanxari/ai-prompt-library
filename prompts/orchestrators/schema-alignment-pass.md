# Active-slice Schema Alignment

Use the canonical parser/task metadata for the bounded active slice only. Slice unit IDs match task IDs (`tasks-proof.md#T1` or `remediation-proof.md#R1`); useful changes may span necessary paths through supported multi-path metadata. Do not split runtime, tests, config, docs or assets merely to enforce a single-file rule.

Align exact affected paths/ownership, change intent, outcome/requirement linkage, production consumer, dependencies, concrete acceptance, meaningful verification, phase/risk and evidence fields required by current tooling. Preserve implementation substance; metadata cannot substitute for a useful behavior specification. Resolve cross-slice prerequisites through current accepted outcome evidence, not fake task stubs.

Run `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage plan` and fix reported issues. Do not hand-author a passing readiness report. Detail/budget checks cover every pending document and the active/next slice, never require tasks for every ledger row. External-service/account needs remain explicit owner decisions where authority is missing.

Legacy schema repair/phase/finalize tooling remains available under `.ai-prompts/prompts/orchestrators/legacy-workflow.md` for explicitly selected old contracts. Preserve historical IDs/logs/evidence; do not impose new claims on old records or silently downgrade an invalid outcome manifest.
