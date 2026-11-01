# Changelog

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
