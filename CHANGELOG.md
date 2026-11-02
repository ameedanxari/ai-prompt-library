# Changelog

## 3.1.0 — tuning from the first full Logisrch run

Changes driven by the first run of stages 1–5 on Logisrch (see [validation](docs/validation.md)). That run traced every requirement, but its forecast came out about 11 times the sources' hours and its module files totalled about 138,000 words.

- **Estimates in hours.** Tasks are 2–16 focused hours, not 0.5–2 days; the old day-sized minimum put a floor under every forecast. Stage 4 compares its module total with any source hour line and removes design detail the sources don't require before reporting a gap. Required behaviour is never dropped.
- **Proportionate design.** The rules say to use the simplest mechanism that meets the requirement, and to treat prior plans, even adopted ones, as design references rather than requirement sources.
- **Length budgets** for stages 2, 3 and 4. The brief describes behaviour, not implementation. Assumptions are recorded only when they change what a user, tester or the budget would notice.
- **Parallel module runs.** Stage 4 writes only its own file: module assumptions use `A-MM-NN` IDs, and cross-module needs go in a `Needs from other modules` section that stage 5 resolves. Stage 4 runs the coverage check for its own IDs.
- **Stage 5** also checks that shared values (limits, sizes, windows, names) agree across modules, and compares the forecast with each source package line.
- **Coverage check** now fails a roadmap that places a task before a task in its `Depends on` cell, or a dependency on an unknown task. It also prints estimate totals per module. On the Logisrch run it found three ordering errors that stage 5 had reported as clean, plus one free-text note in a dependency cell.

## 3.0.0 — staged planning pipeline

Breaking replacement of version 2. The library is now eight short markdown prompts that run in order:

1. inventory the sources
2. write the brief and requirements
3. architecture and modules
4. detail each module
5. integrate the roadmap
6. critique
7. implement

Stages communicate through readable files in `plan/`. Gaps get stated defaults instead of blocking. Every module is fully elaborated. One zero-dependency script, `scripts/coverage.mjs`, checks requirement → module → acceptance criterion → task → roadmap traceability.

Removed: the `run.json` schema, the `ai-prompt-workflow` and `ai-prompt-host` CLIs, the TypeScript sources and build, the host coordinator, the reviewer-receipt and evidence model, and the old references. Version 2 is preserved at tag `archive/v2-final-2026-11-01`; see [retirement](docs/retirement.md) and [upgrading](docs/upgrading.md). First validation results are in [docs/validation.md](docs/validation.md).

## 2.0.0 — canonical workflow overhaul

Breaking replacement of the multiple planning sidecars, Markdown task parser and legacy command chains with one schema-version-3 `run.json`, typed prerequisites, per-target lifecycle, scoped authenticated evidence/review and derived views. The public CLI is `ai-prompt-workflow`; old CLI/package subpaths are not silently redirected.

Plan reviewability, source review, execution eligibility, verification, acceptance and release are separate results. Decision producers cannot depend on their own acceptance. User stops and external-action authority remain distinct from product proof. Atomic revision-checked updates preserve evidence/judgment history; projections never create authority.

The active prompt surface is a compact workflow and focused references. The template catalogue, architecture-locking tests and mechanical gate-accretion guidance are retired. Tests instead exercise consumer behavior, causal graph errors, target/authority boundaries, evidence freshness, package use and recovery. Passing these tests is not a guarantee of semantic source completeness or production quality.

See [upgrade guidance](docs/upgrading.md) and [retirement inventory](docs/retirement.md). The complete previous implementation and its history remain at Git tag `archive/pre-overhaul-2026-10-29` (commit `e91c5bf`). Existing consumer artifacts are not migrated or rewritten by installation.
