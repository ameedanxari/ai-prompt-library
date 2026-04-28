# AI Agent Instructions — AI Prompt Library

**Single source of truth for every AI agent working in this repository.**

If anything elsewhere in this repo contradicts this file, this file wins.

---

## The only flow you need

1. Read `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` (the entry point).
2. Read `.ai-prompts/prompts/orchestrators/drill-down-engine.md` (the greenfield engine).
3. The entry point selects one of four modes:
   - **Trivial** — one-file edit. Skip engines, just do the work.
   - **Execute** — a validated plan (`remediation-*.md` or `tasks-*.md`)
     already exists and the user says "fix", "implement", "execute",
     "do the work". Use `.ai-prompts/prompts/orchestrators/executor.md`.
   - **Gap-closure** — user has an existing codebase and asks to
     "review", "audit", "fix gaps", "productionize", or similar. Use
     `.ai-prompts/prompts/orchestrators/audit-and-remediate.md`. Its Step 5
     **mandatorily** chains into Execute mode when the user's ask
     contains any execute signal ("fix", "implement", "close the
     gaps", "write the tests", etc.). Do NOT treat the chain as
     optional — a field test failed because an earlier agent did.
   - **Greenfield** — user is building something new. Use the drill-down
     engine.
4. If external material is present (designs/specs/existing code), read
   `.ai-prompts/prompts/orchestrators/external-input-handler.md` first. It produces
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
| `prompts/modules/**` (252 template files across 29 categories) | Load one at a time, during engine Step 2 or Step 3 only. | Never all at once. |
| `README.md`, `QUICK_START.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `prompts/README.md`, `docs/acceptance-probe.md` | Human-facing docs. | Never as steering. |

If a weak model finds itself reading any legacy orchestrator, stage file, or
long-form README during routing, it is off-track. Stop, return to the entry
point, and restart.

---

## The flows (summary — full details in each orchestrator)

### Greenfield: drill-down-engine.md

| Step | Input context | Output |
|---|---|---|
| **1 — Seed** | user brief + optional `project-context.md` | `epics.md` (5–7 epics, <500 tokens) **AND** `brief-keywords.md` (every distinctive brief keyword mapped to `covered` or `out-of-scope` with the epic/reason) |
| **2 — Expand epic** | one epic block + optional `project-context.md` + ≤1 module | `features-<epic>.md` (6–10 features per epic) |
| **3 — Atomize feature** | one feature block + optional `project-context.md` + ≤1 module | `tasks-<feature>.md` (verbose implementation prompts — each is a self-contained guide with Context, What to build, Implementation guidance, and Testing approach derived from a module) |

### Gap-closure: audit-and-remediate.md

| Step | Input context | Output |
|---|---|---|
| **1 — Component audit** | 5–10 key files per component + `project-context.md` | `audit-report.md` (≤ 300 lines, factual, per component) |
| **2 — Gap list** | `audit-report.md` | `gap-list.md` (ordered by severity, with blocking deps) |
| **3 — Remediation per gap** | one gap + relevant audit slice + ≤1 module | `remediation-<gap>.md` (verbose implementation prompts following the same self-contained schema as greenfield tasks) |

### Execute: executor.md

| Step | Input context | Output |
|---|---|---|
| Loop | one `remediation-<gap>.md` or `tasks-<feature>.md` at a time, plus `execution-log.md` for resume | Code changes in the app, test runs, entries in `execution-log.md` per task |

The executor picks tasks in severity + dependency order, runs the
Precise change, runs the named Test, checks Acceptance bullets, logs
the outcome. Stops on regressions, 3+ consecutive blockers, or user
interrupt.

`execution-log.md` carries a YAML handoff envelope (session_id,
parent_session, last_completed_task, next_task, blocked_tasks,
test_suite_state, regressions_since_green, external_keys_needed).
A new agent resuming work reads only the envelope and continues from
`next_task`. Cross-session continuity requires no other state.

## Canonical artifacts: never hand-write `revise-report.md` or `execution-log.md`

Both files are **machine-produced**. Their first line is always `---`
(YAML frontmatter fence). The validator rejects narrative look-alikes
as "not the canonical form" and refuses to let the executor start.

- `revise-report.md` → produced by `.ai-prompts/scripts/revise.sh prompts/outputs/current`.
- `execution-log.md` → produced by the executor (`.ai-prompts/prompts/orchestrators/executor.md`), one
  YAML envelope + one journal entry per task.

If you are tempted to write either file by hand as a narrative summary,
stop. The summary the user wants is what `scripts/revise.sh` already
writes into the report body — let the script do it.

### Revise (review / gap / fix loop): revise-outputs.md

Runs as a **mandatory gate inside each planning engine** (not as a
separate entry-point step). Triggered by:
- `drill-down-engine.md` after Step 3 (Atomize), following the
  validator.
- `audit-and-remediate.md` at Step 4.5, following the validator.

Nine coverage checks (C1–C9): epic→feature, feature→task,
gap→remediation, task schema, baseline-topic completeness (via
`baseline-task-shapes.md`), external-services manifest, user-story
linkage, platform coverage, regression-against-prior-pass. Fails the
executor gate if any check remains failing after one regeneration
attempt. Emits `revise-report.md`.

**If the revise gate fails, stop.** Do not hand off to the executor.
The fail means the plan is not ready — surface `remaining_issues` to
the user instead.

### Baseline task-shape rules: baseline-task-shapes.md

Consulted during Step 3 of either engine when expanding a baseline
epic/gap. Enforces per-topic requirements (e.g. app-store prep
requires one screenshot task per locale × per device class;
localization requires a completeness test; theming requires a visual-
regression test; privacy requires explicit data-export and data-
deletion tasks).

### Self-maintain: self-maintain.md

Runs the library's engines on the library itself. For maintainers,
not end users. Writes to `prompts/outputs/self-maintain/` so it never
collides with a user project's `prompts/outputs/current/`.

## Output artefacts an engine run leaves behind

Under `prompts/outputs/current/`:

| File | Produced by |
|---|---|
| `project-context.md` | external-input-handler (when external material exists) |
| `epics.md` | drill-down Step 1 (greenfield only) |
| `brief-keywords.md` | drill-down Step 1 (greenfield only; required companion to `epics.md`) |
| `features-<epic>.md` | drill-down Step 2 |
| `external-accounts.md` | drill-down Step 2.5 / audit-remediate Step 3.5 |
| `tasks-<feature>.md` | drill-down Step 3 |
| `audit-report.md` | audit-remediate Step 1 (gap-closure only) |
| `gap-list.md` | audit-remediate Step 2 |
| `remediation-<gap>.md` | audit-remediate Step 3 |
| `revise-report.md` | `scripts/revise.sh` (writes YAML frontmatter; never hand-write) |
| `execution-log.md` | executor (includes YAML handoff envelope) |

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
   `bash .ai-prompts/scripts/validate-instantiation.sh` before declaring tasks ready.
   Any match against forbidden patterns means regenerate the offending file.

6. **Check the progress script between Step 3 task-file writes.** Run
   `bash .ai-prompts/scripts/step3-progress.sh prompts/outputs/current` after each
   `tasks-<feature>.md` is written. It prints a checklist of every
   declared feature marked `- [x]` (tasks file on disk) or `- [ ]` (still
   missing). Do NOT advance past Step 3 while any `- [ ]` remains, and
   do NOT rely on your own memory of which files you've written — the
   disk is the source of truth.

7. **Do not stop between the handler and Step 1, or between engine steps.**
   After the external-input-handler writes `project-context.md`, proceed
   immediately to Step 1. After Step 1 writes `epics.md` **and**
   `brief-keywords.md`, proceed to Step 2. After Step 2 writes all
   `features-*.md`, proceed to Step 3. Do not ask the user "should I
   continue?" — the engine is designed to run end-to-end in one
   session.

8. **Reset when the user asks, OR when stale markers appear.** Two
   independent triggers, both hard:
   - **Explicit user request** (unconditional): if the user's prompt
     contains "force reset", "reset", "re-integrate", "start fresh",
     "fresh start", "clean up", "clean slate", "wipe", or "remove all
     library working data", run
     `bash .ai-prompts/scripts/reset-integration.sh --yes` immediately.
     Do NOT inspect project state first to decide if reset is "needed"
     — the user asked, so it runs.
   - **Detected stale markers**: pre-existing `NEXT_ACTION.md` /
     `PROJECT_STATE.md` / `IMPLEMENTATION_STATUS.md` / similar, OR a
     root `AGENTS.md` referencing deleted orchestrators
     (`execution-orchestrator.md`, `auto-request-router.md`,
     `stage-pipeline-orchestrator.md`, etc.).
   After running reset, verify `prompts/outputs/current/` no longer
   contains `audit-report.md`, `gap-list.md`, or `remediation-*.md` from
   a previous run. If those files persist, the reset did not run
   correctly — stop and surface the failure.

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
