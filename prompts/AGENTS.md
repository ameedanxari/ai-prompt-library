# AI Agent Instructions — AI Prompt Library

**Single source of truth for every AI agent working in this repository.**

If anything elsewhere in this repo contradicts this file, this file wins.

---

## The only flow you need

1. Read `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` (the entry point).
2. The entry point selects one of four modes and then loads the matching engine:
   - **Trivial** — one-file edit. Skip engines, just do the work. (no engine load)
   - **Execute** — a validated plan (`remediation-*.md` or `tasks-*.md`)
     already exists and the user says "fix", "implement", "execute",
     "do the work". Loads `.ai-prompts/prompts/orchestrators/executor.md`.
   - **Gap-closure** — user has an existing codebase and asks to
     "review", "audit", "fix gaps", "productionize", or similar. Loads
     `.ai-prompts/prompts/orchestrators/audit-and-remediate.md`. It stops
     after the planning revise gate and waits for explicit execution
     authorization.
   - **Greenfield** — user is building something new. Loads
     `.ai-prompts/prompts/orchestrators/drill-down-engine.md`.
3. If external material is present (designs/specs/existing code), read
   `.ai-prompts/prompts/orchestrators/external-input-handler.md` first. It produces
   `prompts/outputs/current/project-context.md` and hands off to the
   selected engine.
4. Write outputs to `prompts/outputs/current/`.

Engines are checkpoint-driven. At each `⏸ CHECKPOINT`, stop, summarize
the output just produced, and wait for the user to say `Continue` before
advancing. When planning reaches its final hard stop, wait for the user
to say `Execute` or `Continue` before reading `executor.md`.

Auto-load budget: **1 file at session start** (the entry point). After
routing, exactly **one engine** is loaded for the chosen mode (or none in
Mode 1). External material adds one conditional read for
`external-input-handler.md`. Total ceiling before doing work: 3 files.

---

## What to IGNORE (these are legacy or on-demand)

| Path / group | Status | Load when |
|---|---|---|
| `prompts/orchestrators/*.md` | **Active Engine Assets.** | Follow the entry-point routing. |
| `.kiro/specs/`, `.cursor/plans/`, or other IDE-native spec workflows | Do NOT let the IDE's default spec workflow override our engine. Write to `prompts/outputs/current/` regardless of IDE. | Never. |
| `docs/optional/` (PREVENTION_CHECKLIST, COMMIT_GUIDELINES, SAFEGUARDS) | Optional | Only if user asks about safeguards/commit policy. |
| `prompts/modules/**` (template files across 29 categories) | Load only the modules needed for the current Step 2 / Step 3 expansion context. | Never all at once. |
| `README.md`, `QUICK_START.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `prompts/README.md`, `docs/acceptance-probe.md` | Human-facing docs. | Never as steering. |

If a weak model finds itself reading any legacy file or long-form README 
during routing, it is off-track. Stop, return to the entry point, and 
restart.

---

## The flows (summary — full details in each orchestrator)

### Greenfield: drill-down-engine.md

| Step | Input context | Output |
|---|---|---|
| **1 — Seed** | user brief + optional `project-context.md` | `epics.md` (5–7 epics, <500 tokens) **AND** `brief-keywords.md` (every distinctive brief keyword mapped to `covered` or `out-of-scope` with the epic/reason) |
| **2 — Expand epic** | one epic block + optional `project-context.md` + the modules needed for that epic | `features-<epic>.md` (6–10 features per epic), plus `ui-reference-source-map.md` when greenfield UI exists without external Design Context |
| **3 — Atomize feature** | one feature block + optional `project-context.md` / `ui-reference-source-map.md` + the modules needed for that feature | `tasks-<feature>.md` (verbose implementation prompts — each is a self-contained guide with Context, What to build, Implementation guidance, and Testing approach derived from modules) |

### Gap-closure: audit-and-remediate.md

| Step | Input context | Output |
|---|---|---|
| **1 — Component audit** | 5–10 key files per component + `project-context.md` | `audit-report.md` (≤ 300 lines, factual, per component) |
| **2 — Gap list** | `audit-report.md` | `gap-list.md` (ordered by severity, with blocking deps) |
| **3 — Remediation per gap** | one gap + relevant audit slice + the modules needed for that gap | `remediation-<gap>.md` (verbose implementation prompts following the same self-contained schema as greenfield tasks) |

### Execute: executor.md

| Step | Input context | Output |
|---|---|---|
| Loop | one `remediation-<gap>.md` or `tasks-<feature>.md` at a time, plus `execution-log.md` for resume | Code changes in the app, test runs, entries in `execution-log.md` per task, one commit per successful task |

The executor picks tasks in severity + dependency order, runs the
Precise change, runs the named Test, checks Acceptance bullets, logs
the outcome. Stops on regressions, 3+ consecutive blockers, or user
interrupt.

On test/build failure the executor runs the **harness-diagnosis
pipeline** (`scripts/diagnose-harness.sh` + per-stack catalogs under
`prompts/modules/harness-recovery/`) before marking a task `failed`.
Diagnosis can apply a deterministic recipe (simulator restart, port
free, cache clear) or surface a structured `code_fix` that the
executor's AI step applies conservatively. One retry per task; the
second crash always blocks.

On task success the executor runs the **auto-commit pipeline**
(`scripts/safety-check-commit.sh` + `scripts/commit-task.sh`) so
every successful task becomes one reviewable commit. Push is NEVER
auto — it happens only on user request or at gap/epic boundaries
when `MY_PROJECT.md` opts in.

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
- `execution-log.md` → produced by the executor (`.ai-prompts/prompts/orchestrators/executor.md`), one entry per task.

---

## Context Management & Continuity

### The "New Chat" Recommendation
To ensure maximum attention to detail and prevent context overflow (which leads to shallow planning or hallucinations), it is **strongly recommended** to start a **NEW CHAT** for each major transition:
- Between Step 1 and Step 2 of the Drill-Down Engine.
- Between Step 2 and Step 3 of the Drill-Down Engine.
- Between Step 3 and the Executor (planning to execution).
- For every new "Epic" during Step 3 task generation.

A fresh context window ensures the model focuses entirely on the single slice of work it is expanding, without being weighed down by the history of prior steps.

### Selective Checkpoint Resumption (Continuity & Token Optimization)
If you continue in the same chat, or resume a session, the entry point picks ONE of the following paths in order:

1. **Always Read Entry Point First.** Start by reading `ai-agent-entry-point.md`. It contains the full routing logic; you don't also need to pre-read `AGENTS.md`.
2. **Checkpoint Resumption (preferred).** If `prompts/outputs/current/resumption-checkpoint.md` exists and the user did NOT ask to force-reload, run `scripts/validate-resumption-checkpoint.sh` first, then parse its YAML envelope and ONLY load the files listed in `re_load_files`. This is the ~85%-token-saving path.
3. **Execution-Phase Fast Path.** If `resumption-checkpoint.md` is missing but `prompts/outputs/current/execution-log.md` exists with a non-null `next_task`, skip the planning re-read entirely. Route directly to `executor.md`; its preflight will read the envelope and resume from `next_task`. Do not pre-load any `epics.md` / `features-*.md` / `tasks-*.md` other than the one named by `next_task`.
4. **Force-Reload Escape Hatch (last resort).** Only if BOTH the above are unavailable (no checkpoint AND no in-flight execution-log) — OR the user explicitly asks to "rebuild", "force reload", "re-read all", "refresh context" — perform a full re-read of `epics.md`, all `features-*.md`, and all `tasks-*.md`. After it succeeds, write a fresh `resumption-checkpoint.md` so the next resumption hits path 2.
5. **Ambiguous-Resumption Guard.** If the user's prompt is a bare resumption verb (case-insensitive: `continue`, `continue please`, `go`, `go on`, `proceed`, `next`, `resume`, `keep going`) AND `resumption-checkpoint.md` is missing AND `execution-log.md` is missing or its `next_task` is `null`, fail fast with a helpful error directing them to either (a) use the robust long-form resumption prompt — *"Continue where you left off. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first."* — or (b) describe the work they want to start. Do NOT introspect on "is this a new chat?" — base the decision on disk facts alone.

Following this protocol prevents the "shallow task card" failure mode and ensures every implementation prompt carries the full weight of its source module.

---

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
`baseline-task-shapes.md` and `baseline-task-coverage.md`),
external-services manifest, user-story linkage, platform coverage,
regression-against-prior-pass. Fails the executor gate if any check
remains failing after one regeneration attempt. Emits
`revise-report.md`.

Phase coverage/order is validated by `phase-order-report.md`, generated
from `task-contract.json` by `scripts/validate-phase-order.sh`.
Mechanical schema alias repairs are recorded in
`task-schema-repair-report.md`, generated by
`scripts/repair-task-schema-fields.sh`.

**If the revise gate fails, stop.** Do not hand off to the executor.
The fail means the plan is not ready — surface `remaining_issues` to
the user instead.

### Baseline task-shape rules: baseline-task-shapes.md

Consulted during Step 3 of either engine when expanding a baseline
epic/gap. Enforces per-topic requirements (e.g. onboarding/consent is
separate from account identity; app-store prep requires one screenshot
task per locale × per device class; localization requires a
completeness test; theming requires a visual-regression test; privacy
requires explicit data-export and data-deletion tasks).

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
| `ui-reference-source-map.md` | drill-down Step 2 conditional output for greenfield UI-heavy planning when no authoritative Design Context exists |
| `external-accounts.md` | drill-down Step 2.5 / audit-remediate Step 3.5 |
| `tasks-<feature>.md` | drill-down Step 3 |
| `audit-report.md` | audit-remediate Step 1 (gap-closure only) |
| `gap-list.md` | audit-remediate Step 2 |
| `remediation-<gap>.md` | audit-remediate Step 3 |
| `revise-report.md` | `scripts/revise.sh` (writes YAML frontmatter; never hand-write) |
| `execution-log.md` | executor (includes YAML handoff envelope) |
| `resumption-checkpoint.md` | written at checkpoints to enable selective context loading |

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

4. **Load modules by need, not by an artificial count.** Step 2 and Step 3
   may consult multiple modules from `prompts/modules/` when the current
   epic / feature genuinely spans several concerns (for example native
   iOS + native Android + on-device ML + gesture UI). Keep the context
   narrow: load only modules that directly inform the current expansion.
   If the module list grows because the feature is doing too much, split
   the feature into smaller features/tasks.

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

7. **Follow the explicit checkpoint protocol.**
   After the external-input-handler writes `project-context.md`, proceed
   immediately to Step 1. After Step 1 writes `epics.md` **and**
   `brief-keywords.md`, stop only at the Step 1 checkpoint defined by
   the engine. After Step 2 writes all `features-*.md`,
   `external-accounts.md`, and any required `ui-reference-source-map.md`,
   stop only at the Step 2 checkpoint. During
   Step 3, stop at the engine's task-generation checkpoints. Do not add
   extra ad hoc prompts, and do not bypass a checkpoint that says to
   wait for the user.

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
- **"Continue"** / **"Continue where you left off"** → Read `ai-agent-entry-point.md` first. It picks one of: (a) checkpoint resumption if `resumption-checkpoint.md` exists — load only `re_load_files`; (b) execution-phase fast path if `execution-log.md` has a non-null `next_task` — go straight to `executor.md`; (c) full force-reload if neither artifact is usable; or (d) ambiguous-resumption error if both are missing and the prompt is a bare resumption verb.
- **"Reset" / "Start over"** → delete `prompts/outputs/current/*` and
  re-run from Step 1.
- **"Use Stage X"** → inform the user that the waterfall stages have been fully deprecated and removed in v1.0. Direct them to use the drill-down engine (Greenfield mode).
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
