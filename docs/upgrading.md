# Upgrade from version 1

Version 2 of the package uses schema version 3 `run.json`. It replaces the manifest/companion/task-authority workflow and does not silently migrate historical consumer state. Public APIs and old executable wrappers are a breaking change. Pin the earlier library version if an existing run depends on them; inspect the historical record before choosing any new work.

The `inspect-legacy` command is read-only. It summarizes supported historical files without executing work or treating their completion flags as current outcome acceptance. Unknown or invalid new state must be diagnosed, never sent down a legacy fallback.

For an authorized transition, create a separate version 3 run. Preserve originals, historical IDs and raw evidence. Reconcile original obligations into the new model, mark existing claims as historical/unverified and obtain current target evidence where needed. Do not copy approval booleans or invent reviewers/operators. Keep actual execution authority and owner stops explicit. No migration implies permission to reset consumer data, deploy or publish.

The exact old tracked library is recoverable at `archive/pre-overhaul-2026-10-29`; see [retirement decisions](retirement.md). Consumer ignored outputs and source material remain consumer-owned and must not be removed by library cleanup.
