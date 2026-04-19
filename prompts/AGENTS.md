# AI Agent Instructions — AI Prompt Library

**Single source of truth for every AI agent working in this repository.**

If anything elsewhere in this repo contradicts this file, this file wins.

---

## The only flow you need

1. Read `prompts/orchestrators/ai-agent-entry-point.md` (the entry point).
2. Read `prompts/orchestrators/drill-down-engine.md` (the greenfield engine).
3. The entry point selects one of three modes:
   - **Greenfield** — user is building something new. Use the drill-down
     engine.
   - **Gap-closure** — user has an existing codebase and asks to
     "review", "audit", "fix gaps", "productionize", or similar. Use
     `prompts/orchestrators/audit-and-remediate.md` instead.
   - **Trivial** — one-file edit. Skip the engines, just do the work.
4. If external material is present (designs/specs/existing code), read
   `prompts/orchestrators/external-input-handler.md` first. It produces
   `prompts/outputs/current/project-context.md` and hands off to the
   selected engine.
5. Write outputs to `prompts/outputs/current/`.

Total auto-load budget at session start: **2 files** (entry point +
drill-down engine). In gap-closure mode, add one more read
(`audit-and-remediate.md`). Conditional extra read for
`external-input-handler.md` when external material exists.

---

## What to IGNORE (these are legacy or on-demand)

| Path / group | Status | Load when |
|---|---|---|
| `prompts/stages/**` | **Deprecated waterfall.** Retained only so old tests pass. | Never. |
| `prompts/orchestrators/*.md` (all except the 4 active ones) | **Deprecated.** Each has a `DEPRECATED — DO NOT AUTO-LOAD` banner. | Only if the user explicitly names the file. |
| `.kiro/specs/`, `.cursor/plans/`, or other IDE-native spec workflows | Do NOT let the IDE's default spec workflow override our engine. Write to `prompts/outputs/current/` regardless of IDE. | Never. |
| `docs/optional/` (PREVENTION_CHECKLIST, COMMIT_GUIDELINES, SAFEGUARDS) | Optional | Only if user asks about safeguards/commit policy. |
| `docs/archive/` | Historical | Never. |
| `prompts/modules/**` (266 files) | Load one at a time, during engine Step 2 or Step 3 only. | Never all at once. |
| `README.md`, `SETUP_GUIDE.md`, `prompts/README.md`, `prompts/EXECUTION_PHASE_GUIDE.md`, etc. | Human-facing docs. | Never as steering. |

If a weak model finds itself reading any legacy orchestrator, stage file, or
long-form README during routing, it is off-track. Stop, return to the entry
point, and restart.

---

## The flows (summary — full details in each orchestrator)

### Greenfield: drill-down-engine.md

| Step | Input context | Output |
|---|---|---|
| **1 — Seed** | user brief + optional `project-context.md` | `epics.md` (5–7 epics, <500 tokens) |
| **2 — Expand epic** | one epic block + optional `project-context.md` + ≤1 module | `features-<epic>.md` (6–10 features per epic) |
| **3 — Atomize feature** | one feature block + optional `project-context.md` + ≤1 template | `tasks-<feature>.md` (atomic tasks — real file paths, signatures, API shapes) |

### Gap-closure: audit-and-remediate.md

| Step | Input context | Output |
|---|---|---|
| **1 — Component audit** | 5–10 key files per component + `project-context.md` | `audit-report.md` (≤ 300 lines, factual, per component) |
| **2 — Gap list** | `audit-report.md` | `gap-list.md` (ordered by severity, with blocking deps) |
| **3 — Remediation per gap** | one gap + relevant audit slice + ≤1 module | `remediation-<gap>.md` (atomic tasks naming real existing files) |

Each step runs in a **fresh context**. Do not carry the previous step's full
artifact forward; load only the specific slice the current step is expanding.

---

## Hard rules

1. **No placeholders in output.** `{{var}}`, `<TBD>`, `[project name]`, generic
   `implementFeature()`, etc. are all rejected. Every task names a real file
   path, a real function signature, and a real API shape.

2. **No template references in output.** The string `.ai-prompts/prompts/`
   must not appear in any file under `prompts/outputs/current/`. Template
   filenames (`auth-oauth.md`, etc.) must not appear either. Templates get
   **dissolved** into project-specific content.

3. **Templates are subordinate to project context.** If
   `prompts/outputs/current/project-context.md` exists, it takes precedence
   in every conflict. Never overwrite a decision made in project-context with
   a template default.

4. **Only one module per expansion context.** If Step 2 or Step 3 needs to
   consult a module from `prompts/modules/`, load exactly one. If you need
   two, you're expanding too many things at once — split into smaller
   features/tasks.

5. **Run validation after Step 3.** Run
   `bash scripts/validate-instantiation.sh` before declaring tasks ready.
   Any match against forbidden patterns means regenerate the offending file.

6. **Do not stop between the handler and Step 1, or between engine steps.**
   After the external-input-handler writes `project-context.md`, proceed
   immediately to Step 1. After Step 1 writes `epics.md`, proceed to
   Step 2. After Step 2 writes all `features-*.md`, proceed to Step 3.
   Do not ask the user "should I continue?" — the engine is designed to
   run end-to-end in one session.

7. **Reset stale integration before routing.** If the project root has
   pre-existing library-state files (`NEXT_ACTION.md`, `PROJECT_STATE.md`,
   `IMPLEMENTATION_STATUS.md`, `QUICK_STATUS.md`, etc.) OR the root
   `AGENTS.md` references orchestrators that no longer exist
   (`execution-orchestrator.md`, `auto-request-router.md`,
   `stage-pipeline-orchestrator.md`, `quality-gate-orchestrator.md`,
   `task-generation-orchestrator.md`, etc.), run
   `bash .ai-prompts/scripts/reset-integration.sh --yes` before anything
   else. This refreshes steering, rewrites the project `AGENTS.md`, and
   clears old outputs.

---

## Minimal project state

You do not need any of the legacy state files (`PROJECT_STATE.md`,
`EXECUTION_PROGRESS.md`, `DEVELOPMENT_LOG.md`, `NEXT_ACTION.md`,
`COMPLETED_FEATURES.md`, `ARCHITECTURE_DECISIONS.md`, `KNOWN_ISSUES.md`,
`PROJECT_STATUS.md`). The engine uses exactly these files:

| File | Purpose |
|---|---|
| `MY_PROJECT.md` (project root) | User's brief. Required. |
| `prompts/outputs/current/project-context.md` | Extracted from user-provided material. Optional. |
| `prompts/outputs/current/epics.md` | Step 1 output. |
| `prompts/outputs/current/features-<epic>.md` | Step 2 outputs, one per epic. |
| `prompts/outputs/current/tasks-<feature>.md` | Step 3 outputs, one per feature. |

If `MY_PROJECT.md` is missing, ask the user for a 2–3 sentence brief.
Do not invent one.

---

## When the user asks something else

- **"Fix this bug" / "Rename X" / "Tweak copy"** → just do it. Don't run the
  engine. The engine is for generating spec-to-task expansions, not trivial
  edits.
- **"Continue"** → look at what exists under `prompts/outputs/current/` and
  resume from the first missing output. Do NOT consult legacy
  `NEXT_ACTION.md`.
- **"Reset" / "Start over"** → delete `prompts/outputs/current/*` and
  re-run from Step 1.
- **"Use Stage X"** → the user is invoking the legacy flow explicitly. Honor
  it, but warn them once that the default flow is the drill-down engine.
- **Commit-policy / safeguard / pre-commit questions** → load
  `docs/optional/` on demand.

---

## What "production-grade" means here

The library produces specs and atomic tasks, not running code. A person
using a low-end model to execute the resulting tasks still needs:

- A working runtime (Node, Python, etc.) with dependencies installed.
- A database, hosting, secrets management — the engine does not provision
  these.
- Code review discipline — the engine emits tasks with acceptance criteria,
  but it cannot guarantee the executing model writes secure or correct code.

The engine's contribution is: **every task is small, concrete, and
independently executable**, so a weak model can handle one task at a time
without needing broad context.
