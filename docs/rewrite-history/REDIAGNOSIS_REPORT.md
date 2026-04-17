# Re-Diagnosis Report

Generated: 2026-04-16 (post-rewrite + hardening)

---

## Session auto-load budget (the number that matters)

A weak model arriving at this repo and asked for any non-trivial request
will load, in order:

| # | File | Lines | Condition |
|---|---|---|---|
| 1 | `prompts/AGENTS.md` | 131 | Always (authoritative instructions) |
| 2 | `prompts/orchestrators/ai-agent-entry-point.md` | 116 | Always |
| 3 | `prompts/orchestrators/drill-down-engine.md` | 253 | Always |
| 4 | `prompts/orchestrators/external-input-handler.md` | 95 | Only if user provided designs/specs |
| 5 | `prompts/orchestrators/module-selection-index.md` | 175 | Only during Step 2 or Step 3 expansion |

**Mandatory startup load: 3 files / 500 lines ≈ 2,000 tokens.**
**Max startup with external material: 4 files / 595 lines ≈ 2,380 tokens.**
During expansion, at most one additional module is loaded per expansion
context (see Section 4).

Comparison to the original baseline from `DIAGNOSIS_REPORT.md`:

| Metric | Pre-rewrite | Post-hardening | Δ |
|---|---|---|---|
| Pre-Stage-01 entry chain | 2,366 lines / ~9,464 tokens | 500 lines / ~2,000 tokens | **−78.9%** |
| Strict-glob session-loadable | 13,331 lines / ~53,324 tokens | ~950 lines / ~3,800 tokens for the auto-load perimeter | **−92.9%** |

_The strict-glob comparison is apples-to-apples only for the steering + new
orchestrator set; legacy files still sit on disk (see Section 5)._

---

## Steering files (what an IDE auto-loads)

IDEs that use `prompts/steering/*.md` (Cursor, Kiro, Windsurf, VSCode, etc.)
now auto-load:

| File | Lines | Status |
|---|---|---|
| `prompts/steering/library-context.md` | 40 | Rewritten; points only at drill-down engine |
| `prompts/steering/architecture-guard.md` | 60 | Unchanged (no waterfall references) |
| `prompts/steering/change-review.md` | 80 | Unchanged (no waterfall references) |

Total steering: **180 lines / ~720 tokens**. Previous
`library-context.md` was 196 lines of waterfall-era instructions (10-stage
pipeline, auto-stabilization, state files); now 40 lines pointing solely at
the drill-down flow.

---

## Entry-point chain (trace)

Starting from any user request, the files actually loaded before Step 1 of
the engine fires:

```
1. prompts/AGENTS.md                                   (131)
2. prompts/orchestrators/ai-agent-entry-point.md       (116)
3. prompts/orchestrators/drill-down-engine.md          (253)
4. [conditional] external-input-handler.md             (95)
```

Items that previously loaded and **no longer** do:

- `auto-request-router.md` (475 lines) — deprecated, banner added
- `auto-setup-orchestrator.md` (467 lines with banner) — deprecated
- `stage-pipeline-orchestrator.md` (337 lines) — deprecated
- `PREVENTION_CHECKLIST.md`, `COMMIT_GUIDELINES.md`, `SAFEGUARDS.md` — moved to `docs/optional/`
- `validate-safeguards.sh` auto-invocation — removed from entry point
- 25 auxiliary orchestrators under `prompts/orchestrators/` — all carry a
  `⚠️ DEPRECATED — DO NOT AUTO-LOAD` banner at the top of the file

---

## Trap inventory (deprecated but still on disk, for tests)

| Path | Size | Why retained | Mitigation |
|---|---|---|---|
| `prompts/stages/` | ~36,622 lines / 40 files | `tests/property-tests/stage-pipeline.test.ts`, `tests/integration-tests/stage-workflow-integration.test.ts` reference them | `prompts/stages/DEPRECATED.md` added; steering and AGENTS.md instruct agents to ignore |
| `prompts/orchestrators/*.md` (25 deprecated) | ~8,600 lines combined | Tests / safeguard script reference some by name | Every file has a `⚠️ DEPRECATED` banner as line 1 |
| `prompts/AGENTS.md` (pre-rewrite) | n/a — rewritten in place | — | Went from 1,470 lines (full waterfall protocol) to 131 lines |
| `prompts/EXECUTION_PHASE_GUIDE.md` (877 lines), `prompts/DESIGN_SYSTEM_ENHANCEMENTS_ANALYSIS.md` (445 lines), `prompts/README.md` (270 lines) | Human-facing docs | Not referenced from entry point; AGENTS.md tells agents to ignore human docs |
| Root `README.md` (743 lines), `SETUP_GUIDE.md` (287 lines) | Human-facing | Same |

**Residual risk:** a weak model that ignores `AGENTS.md` and browses
`prompts/` or `prompts/orchestrators/` by directory listing could still
pick up one of these files. The deprecation banner on line 1 of each
deprecated orchestrator is the primary defense.

---

## Expansion-time context discipline

During drill-down engine execution, each expansion context loads:

| Step | Files in context | Upper bound |
|---|---|---|
| Step 1 — Seed | user brief + (optional) project-context.md | 2 files |
| Step 2 — Expand epic | the single epic block + (optional) project-context.md + (optional) one module | 3 files |
| Step 3 — Atomize feature | the single feature block + (optional) project-context.md + (optional) one module/template | 3 files |

No step loads more than one module from `prompts/modules/`. The
`module-selection-index.md` (175 lines) is a deterministic intent → module
lookup; it is not loaded into the expansion context itself — the agent
consults it to pick a path, then loads that single module.

---

## New guardrails added this session

1. **Deprecation banners** (25 orchestrator files): `⚠️ DEPRECATED — DO NOT
   AUTO-LOAD` at line 1.
2. **`prompts/stages/DEPRECATED.md`**: explicit notice inside the stages tree.
3. **`prompts/AGENTS.md`**: full rewrite (1,470 → 131 lines) — single source
   of truth, explicit auto-load list, explicit ignore list, hard rules.
4. **`prompts/steering/library-context.md`**: full rewrite (196 → 40 lines).
5. **Entry point**: full rewrite (755 → 116 lines) with 2-file auto-load
   budget and explicit `do-not-auto-load` table.
6. **`drill-down-engine.md`**: added a good-vs-bad dissolution example and
   six hard stop conditions (no placeholder, no bare directory as
   file_path, ≥3 acceptance criteria, no tautological acceptance, etc.).
7. **`scripts/validate-instantiation.sh`**: bash validator scanning for
   `.ai-prompts/prompts/`, `{{…}}`, `<TBD>`, `[project name]`.
8. **`tests/unit-tests/instantiation-validation.test.ts`**: vitest test
   that runs the validator and asserts every `tasks-*.md` is clean. Fails
   the build on any template leak.
9. **`prompts/orchestrators/module-selection-index.md`**: intent → single
   module path catalogue (175 lines, covers 15 intent families).
10. **`MY_PROJECT.md.template`**: a 40-line brief template so users know
    what to put where.
11. **`scripts/bootstrap-project-integration.sh`**: rewritten bootstrap to
    create an `AGENTS.md` that points at the new flow, not the waterfall.

---

## Test suite

| Run | Files | Tests passed | Tests failed |
|---|---|---|---|
| Original baseline | 83 | 848 | 4 |
| After drill-down rewrite (first 5 changes) | 83 | 848 | 4 |
| After hardening (this session) | 84 | 851 | 4 |

3 new tests added (instantiation validation), all passing. The 4
pre-existing failures are Template Architecture Guard assertions unrelated
to this rewrite.

---

## Honest assessment (updated)

**Now substantially better** for a low-end model, specifically:

- Auto-load cost cut ~79% from baseline; IDE steering cut from 196 to 40
  lines.
- Every trap file carries an explicit do-not-load signal.
- A weak model that reads the auto-load chain in order (`AGENTS.md` →
  `ai-agent-entry-point.md` → `drill-down-engine.md`) now has a clear,
  unambiguous flow with concrete good-vs-bad examples and hard stop
  conditions.
- The `validate-instantiation` test is an actual enforcement, not a
  suggestion — template leaks fail the build.

**Still unproven / unresolved:**

1. **No runtime isolation harness.** Steps 1–3 are supposed to run in
   separate contexts; this relies on the executing model honoring the
   instruction. Only a real subprocess-based runner can enforce that, and
   building one is out of scope here.
2. **Low-end-model eval not yet run.** The verification outputs
   (`epics.md`, `tasks-user-registration.md`) were hand-written by me
   (Opus 4.7) to demonstrate format. Quality on the target weaker model
   is the next experiment — that is what the user will run next.
3. **Legacy file mass.** ~45,000 lines of deprecated material remain on
   disk because tests reference them. Banners and steering instructions
   tell agents to skip, but a sufficiently confused model could still
   wander in. A future cleanup would migrate the relevant tests so the
   legacy files can be deleted outright.
4. **"Enterprise-grade" claim.** The engine produces atomic tasks. It
   does not guarantee that the *executed* code meets SOC 2, HIPAA, PCI,
   SRE runbook, or audit-log requirements — those properties depend on
   how the implementing model uses the tasks and what review loop the
   human operator adds on top.

Readiness for the user's next experiment (low-end model runs setup for an
app) is **green**. The failure modes will be informative.
