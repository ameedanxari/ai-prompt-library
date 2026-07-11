# AI Agent Entry Point

Minimal, low-context entry for any user request. Auto-loaded at startup: **1 file** (this one). The engine for the chosen mode loads after routing decides which mode applies.

## Startup sequence

1. **Read this file.**

That is the only startup auto-load. The mode-specific engine loads after
the routing logic below selects it:

| Mode chosen at step D | Engine to load |
|---|---|
| Mode 1 — Trivial | None (just do the edit) |
| Mode 2 — Execute existing plan | `prompts/orchestrators/executor.md` |
| Mode 3 — Gap-closure | `prompts/orchestrators/audit-and-remediate.md` |
| Mode 4 — Greenfield | `prompts/orchestrators/drill-down-engine.md` |

If `working_copy/` contains external material, also load
`prompts/orchestrators/external-input-handler.md` before the engine
(it runs first and hands off).

If the request involves regulated domains, cloud/provider architecture,
security/privacy, AI automation, current/latest best practices, or a
large corpus that benefits from split inspection, also load
`prompts/orchestrators/research-and-fanout-policy.md` and follow it.

Base auto-load before doing work: **2 files** (this one + the chosen
engine). Mode 3 inherits one extra read for the external-input handler
when external material exists. Regulated/cloud/security/AI/current-best-
practice work inherits one extra read for the research/fan-out policy.
Nothing else loads automatically — not
safeguards, not stage files, not modules, not templates, not router
orchestrators. All of those are opt-in, on demand, one at a time.

## Routing

After reading this file, execute these checks **in order** and do NOT
stop between them. Each step flows into the next without user confirmation.
The engine for the chosen mode is loaded at step D once routing decides it.

### Guard: Ambiguous-Resumption Detection

This guard catches the case where the user issues a bare resumption verb but the project has no on-disk state to resume from. The check is **disk-fact based** — do not introspect on "is this a new chat?" because that is unreliable.

**Trigger condition (ALL three must be true):**

1. The user's prompt is a bare resumption verb. Match case-insensitively against this enumerated list (with optional trailing `.` or `!` and surrounding whitespace; nothing else on the line):
   - `continue`
   - `continue please`
   - `go`
   - `go on`
   - `proceed`
   - `next`
   - `resume`
   - `keep going`
2. `prompts/outputs/current/resumption-checkpoint.md` is missing.
3. `prompts/outputs/current/execution-log.md` is missing **OR** its YAML envelope's `next_task` is `null` / absent.

If all three are true, surface this exact ERROR message immediately and stop:

```
I see you said 'Continue' but I have no checkpoint (`resumption-checkpoint.md`) and no in-flight execution log (`execution-log.md`) to resume from. There is no state on disk that tells me where to pick up.

If you have an in-flight project, please use the standard resumption command:
**Continue where you left off. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.**

If you are starting fresh, please tell me the brief or task you'd like to begin.
```

If conditions 2 or 3 are FALSE (i.e., disk has state to resume from), there is no ambiguity. Skip this guard and continue to Guard B — the agent will resume from disk regardless of whether the chat is new or existing.

---

### Guard: Selective Disk-State Loading via Checkpoint

If the user's prompt is `"Continue"` or `"Continue where you left off"` (or equivalent resumption request), evaluate these conditions in order. The first match wins — do not also run later paths.

**Precondition — detect force-reload intent.** Set `force_reload = true` if the user's prompt contains any of (case-insensitive): `rebuild`, `force reload`, `re-read all`, `refresh context`. Otherwise `force_reload = false`. Force-reload always overrides the cheap paths below.

1. **Path 1 — Force-Reload Escape Hatch.** If `force_reload == true`, take this path immediately (skip the cheap paths even when a checkpoint or execution-log exists; the user is explicitly asking to rebuild context):
   - Perform a **full project context re-read**: `epics.md`, `brief-keywords.md`, all `features-*.md`, and all `tasks-*.md` if they exist. If an `execution-log.md` is also present, load it too.
   - Then proceed through Steps A–F below to verify state and route.
   - After the re-read succeeds, write a fresh `resumption-checkpoint.md` reflecting the current phase/step so that the next resumption hits Path 2.

2. **Path 2 — Checkpoint Resumption (preferred when `force_reload == false`).** If `prompts/outputs/current/resumption-checkpoint.md` is present:
   - **Do NOT** load all prior files or task files from disk.
   - First run:
     ```bash
     bash .ai-prompts/scripts/validate-resumption-checkpoint.sh prompts/outputs/current/resumption-checkpoint.md
     ```
     If this fails, do not trust the selective reload list; continue to
     Path 3 if an execution log can resume, otherwise use Path 4.
   - Parse the YAML frontmatter envelope in `resumption-checkpoint.md`.
   - Read the active `phase` (planning | execution), the active `step`, and the array of files under `re_load_files`.
   - **Only load the files listed in `re_load_files`** (this restricts context loading to the active slice, e.g. a specific epic or task file).
   - Route directly to the corresponding engine/phase at that designated step:
     - If `phase: execution`, route to `prompts/orchestrators/executor.md` and load `execution-log.md` plus the current task.
     - If `phase: planning` and the engine is Greenfield, route to `prompts/orchestrators/drill-down-engine.md` at the step and load the specified files.
     - If `phase: planning` and the engine is Gap-closure, route to `prompts/orchestrators/audit-and-remediate.md` at the step and load the specified files.

3. **Path 3 — Execution-Phase Fast Path (fallback when checkpoint missing but execution is in flight).** If Path 2 didn't apply (no checkpoint) **and** `force_reload == false`, look for `prompts/outputs/current/execution-log.md`. If it exists with a parseable YAML envelope whose `next_task` is non-null:
   - **Skip the planning re-read entirely.** Do NOT load `epics.md`, `brief-keywords.md`, `features-*.md`, or any `tasks-*.md` other than the one named by `next_task`.
   - Route directly to `prompts/orchestrators/executor.md`. The executor's own preflight will run `scripts/validate-ready-to-execute.sh`, confirm `ready_to_execute: true`, and read the envelope to resume from `next_task`.
   - This branch is the correct behavior for any in-flight project whose planning is already complete; the planning artifacts are stable on disk and do not need to be re-read into context.

4. **Path 4 — No-State Force-Reload (last resort).** If none of the above matched (i.e. `force_reload == false`, no checkpoint, and no usable execution-log), there is no cheap path. Fall back to the same full re-read as Path 1: read `epics.md`, `brief-keywords.md`, all `features-*.md`, and all `tasks-*.md` if they exist. Proceed through Steps A–F to route. Write a fresh `resumption-checkpoint.md` afterward so the next resumption hits Path 2.

Note: the **Guard: Ambiguous-Resumption Detection** above runs *before* this guard. If the prompt was a bare resumption verb and there was no disk state, that guard has already surfaced an error and stopped — Path 4 only fires when there's some disk state but no cheap shortcut.

---

### A. Stale-integration check (run FIRST — before anything else)

Trigger A1 — **explicit user request**. If the user's prompt contains ANY
of these phrases (case-insensitive), run the reset script unconditionally.
This is NOT optional. Do not evaluate whether the project state looks
clean — the user asked, so we reset:

- "force reset"
- "reset" (as a request, not a description)
- "re-integrate" / "reintegrate"
- "start fresh" / "fresh start"
- "clean up" / "clean slate"
- "remove all library ... working data"
- "wipe" (library / integration / state / outputs)

Trigger A2 — **detected stale markers**. If any of these pre-existing
integration artifacts live at the project root, also run reset:

- Legacy state files: `NEXT_ACTION.md`, `PROJECT_STATE.md`,
  `DEVELOPMENT_LOG.md`, `EXECUTION_PROGRESS.md`,
  `IMPLEMENTATION_STATUS.md`, `IMPLEMENTATION_SUMMARY.md`,
  `PRODUCTION_COMPLETION_REPORT.md`, `QUICK_STATUS.md`,
  `COMPLETED_FEATURES.md`, `ARCHITECTURE_DECISIONS.md`,
  `KNOWN_ISSUES.md`
- A root `AGENTS.md` that references deleted orchestrators (e.g.
  `execution-orchestrator.md`, `auto-request-router.md`,
  `stage-pipeline-orchestrator.md`, `quality-gate-orchestrator.md`,
  `task-generation-orchestrator.md`)
- `.kiro/steering/` or `.cursor/rules/` that mentions "10-stage pipeline",
  "stage-01-intake", or "COVE" (all deprecated)

If trigger A1 OR trigger A2 fires, run:

```bash
bash .ai-prompts/scripts/reset-integration.sh --yes
```

Verify the script succeeded by checking that `prompts/outputs/current/`
is empty (or contains only `project-context.md` if an in-progress handler
run existed). If the directory still contains `audit-report.md`,
`gap-list.md`, or `remediation-*.md` from a previous run, the reset did
NOT run correctly — surface that failure to the user and stop.

Then continue to step B. Do not stop to ask the user — they already asked
for reset or the stale state is unambiguous.

### B. External input check

Is there user-provided external material? Check for any of:
- Non-empty `working_copy/` or `prompts/working_copy/`
- Attached spec / PRD / RFC
- Existing source code the user wants to extend (e.g. `src/`, `backend/`,
  `frontend/`, `android/`, `ios/` with non-trivial content)
- `MY_PROJECT.md` lists external/reference material under either
  "External material" or "Reference material"

If yes:
1. Read `prompts/orchestrators/external-input-handler.md` (file #3).
2. Execute it to produce `prompts/outputs/current/project-context.md`.
3. The handler itself continues to step C when it finishes — do not wait.

If no, continue directly to step C.

### C. Context precedence

Does `prompts/outputs/current/project-context.md` exist?
- **Yes:** load it before Step 1 of the engine. It takes precedence over any
  template defaults.
- **No:** skip.

### C.5 Research / fan-out trigger

If the prompt, `project-context.md`, `MY_PROJECT.md`, or external material
contains any of the following, read
`prompts/orchestrators/research-and-fanout-policy.md` before executing the
selected engine:

- Regulated or high-stakes domains: healthcare, clinical safety,
  controlled substances, finance, legal, identity, payments, child
  safety, critical infrastructure.
- Cloud/provider planning: Google Cloud, AWS, Azure, Kubernetes,
  production-grade scale, disaster recovery, RPO/RTO, multi-region,
  data residency, zero data loss, audit evidence.
- Security/privacy: sensitive data, data breach, encryption, key
  management, audit trails, compliance, threat model, privacy rights.
- AI automation in consequential workflows.
- "latest", "current", "best practice", "today", or a named external
  product/regulator/provider whose guidance can change.
- Large external corpus or multi-component system where parallel
  read-only inspection would improve coverage.

When triggered, the selected engine must create or update
`prompts/outputs/current/source-ledger.md` before making source-backed
architecture, regulatory, security, or provider claims. If fan-out is
available, use read-only workers for discovery/critique slices and merge
their findings; do not delegate final planning responsibility.

### D. Mode selection — four modes

Decide ONE of four modes based on the user's ask AND the project state.
Check in this order (first match wins):

#### Mode 1 — Trivial (skip engines entirely)

Use when the user's ask is a single-file edit or a one-line change:
"rename X", "fix typo", "tweak copy in file Y", "change the color".
Just do the work directly. Do not run any engine.

#### Mode 2 — Execute existing plan

Use when BOTH of these are true:
- `prompts/outputs/current/` contains `remediation-*.md` (gap-closure
  plan) OR `tasks-*.md` (greenfield plan), AND the plan passes
  `scripts/validate-ready-to-execute.sh`.
- The user's ask signals execution, not re-planning: "fix", "implement",
  "execute", "run the plan", "do the work", "build it", "ship", "close
  the gaps", "write the tests", "make it pass", "continue", "next task".

Route to `prompts/orchestrators/executor.md`. Do NOT re-run the audit
— a plan already exists. The executor will resume from
`execution-log.md` if it exists, or start at the first task otherwise.

**Why this mode exists:** planning and execution are separate phases.
The library's engines produce plans; this orchestrator runs them.
Without this mode, an agent facing "fix the gaps" on a project that
already has a plan will either re-plan wastefully or try to execute
without structure. Both were observed failure modes.

#### Mode 3 — Gap-closure (existing-project audit + remediation)

Use when ALL of these are true:
- Project has real source directories (`src/`, `backend/`, `frontend/`,
  `android/`, `ios/`, or similar) with non-trivial content (more than a
  few files).
- User's prompt OR `MY_PROJECT.md` indicates existing-work:
  - Prompt contains any of: "review", "audit", "fix gaps",
    "productionize", "production-ready", "finish", "complete",
    "test coverage", "deploy-ready", "functional completeness", "QA".
  - OR `MY_PROJECT.md` "External material" / "Reference material"
    section lists source directories with completion percentages
    (e.g. "95% complete", "85% complete").
- Mode 2 does NOT apply (either no plan exists or the user explicitly
  wants a fresh audit).

Route to `prompts/orchestrators/audit-and-remediate.md` and follow its
5-step flow (Component audit → Gap list checkpoint → Remediation tasks
→ Validate/revise → Planning hard stop).

When the request specifically asks to review completed work, validate
functionality, challenge a completion claim, or plan work from semantic
findings, the gap-closure engine MUST load
`prompts/orchestrators/semantic-review-and-validation.md` during its audit.
Mechanical checks alone are not a substitute for this review path.

The orchestrator ends with a planning hard stop after the revise gate
passes. Do not auto-chain into the executor from the user's original
prompt. The user must explicitly authorize execution after reviewing the
generated audit, gaps, remediation prompts, and revise result.

#### Mode 4 — Greenfield (drill-down engine)

Use when the project is empty of meaningful source OR the user's brief
describes something new to build. This is the default when none of
modes 1-3 apply.

Route to `drill-down-engine.md` and follow its 3-step flow
(Seed → Features → Tasks → Validate).

**Architecture-planning submode:** if the user asks specifically for an
architecture plan, architecture diagram, target-state architecture,
cloud architecture, security architecture, or production architecture
and does not ask for implementation tasks, stay inside Mode 4 but stop
after Step 2.7 (`architecture.md`) plus the source-ledger when required.
Do not continue into Step 3 task generation unless the user later says
`Continue` or asks for an implementation plan.

**Do NOT let an IDE's native spec-kit workflow (e.g. `.kiro/specs/`,
`.cursor/plans/`) override the mode selection above.** Our outputs are
richer and verifiable. If the IDE tries to produce its own spec files,
ignore that and write to `prompts/outputs/current/` per the engine's
rules.

### E. Execute the chosen engine (checkpoint-driven)

Run the engine following its internal checkpoint protocol. Each engine
defines explicit **⏸ CHECKPOINT** points where you STOP, present a
summary of what was just completed, and **wait for the user to say
"Continue"** before proceeding.

**Checkpoint protocol (applies to all engines):**

At each ⏸ CHECKPOINT, present to the user:
1. What was just completed (step name + key outputs).
2. Current progress (e.g. "Step 2 of 3", "15 / 42 task files").
3. What comes next.
4. A clear prompt: `"Say **Continue** to proceed, or give feedback."`

Then STOP and wait. Do NOT auto-advance past a checkpoint. Do NOT say
"I'll continue" or "proceeding to...". The user drives the pace.

If the user provides feedback at a checkpoint, incorporate it into
the relevant outputs before advancing.

If the user says "Continue N" (e.g. "Continue 3"), run N checkpoints
before the next stop.

Each engine runs its own internal pipeline:

- **drill-down-engine.md**: Seed ⏸ → Expand epics ⏸ → Atomize tasks
  (⏸ per epic) → Revise ⏸ → **HARD STOP** (planning complete).
- **audit-and-remediate.md**: Audit → Gap list ⏸ → Remediation → Roll
  up external services → Validate → Revise ⏸ → **HARD STOP**.

The Revise gate (inside each engine) is non-optional. It runs every
time. If `revise-report.md` reports `executor_gate: fail`, the engine
stops and surfaces `remaining_issues` — do not attempt to continue.

The only valid stop points are:
- A ⏸ CHECKPOINT defined by the engine.
- A hard stop condition in the engine trips (placeholder remains,
  acceptance criteria insufficient, etc.) — report to user.
- The revise gate fails — report `remaining_issues` to the user.
- **HARD STOP** at the end of planning — wait for user to say
  "Execute" before transitioning to the executor.

### F. Executor (invoked only when user explicitly authorizes)

The engines present a **HARD STOP** when planning is complete. The
user must say "Execute" or "Continue" to authorize the transition.
Do NOT auto-invoke the executor based on execute-signal words in the
original prompt — the planning phase always completes first with user
review.

Once authorized, read `prompts/orchestrators/executor.md`. The
executor processes tasks one at a time, with a ⏸ CHECKPOINT after
each task. It maintains `execution-log.md` (with YAML handoff
envelope) and stops on regressions, 3+ consecutive blockers, or user
interrupt.

**Resumability:** If the IDE closes or context is exhausted mid-run, the user can start a new session and paste this exact line:

```
Continue where you left off. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.
```

The entry point will detect the current state from `prompts/outputs/current/resumption-checkpoint.md` (or `execution-log.md`) and perform a token-efficient resumption by loading only the active files under `re_load_files`. If neither file exists, the entry point surfaces an ambiguous-resumption error and stops.

## Context Management & Continuity

### The "New Chat" Recommendation
For complex projects, starting a **NEW CHAT** for each major planning or execution step is the most reliable way to avoid context-compaction artifacts and hallucinations.

### Selective Checkpoint Resumption (Continuity & Token Optimization)
If you are continuing an existing session or resuming work:
1. **Unified State Manifest:** Read `resumption-checkpoint.md` first. Only load the specific files under `re_load_files` (e.g., a specific epic's features or the current execution task) to preserve token space.
2. **Force-Reload Escape Hatch:** If the context is suspected to be corrupted, or on explicit request ("force reload", "rebuild context"), read all outputs under `prompts/outputs/current/` to perform a full re-build/re-read from disk.

This protocol ensures every implementation prompt and every code change is based on the current, accurate state of the repository.

## What NOT to auto-load

| File / group | Load when |
|---|---|
| `docs/optional/` (PREVENTION_CHECKLIST, COMMIT_GUIDELINES, SAFEGUARDS) | User explicitly asks for safeguard / commit-policy / change-impact guidance |
| Other orchestrators under `prompts/orchestrators/` | Only via the entry-point routing logic |
| Full module catalog `prompts/modules/**` | Never all at once. The drill-down engine loads only the modules needed for the current expansion context. |

## Rules of engagement

1. **Isolation first.** Each expansion step starts from a minimal context.
   Do not carry prior-step artifacts into the next context beyond the
   specific slice being expanded.
2. **One-file startup budget.** Read only this file before routing. The
   engine loads after Mode D selects it. If you find yourself loading a
   second orchestrator before routing decides the mode, stop — you're
   back in waterfall mode.
3. **No defensive auto-loads.** Safeguard, impact-guard, and self-healing
   orchestrators run on explicit request only.
4. **Templates subordinate to project context.** If
   `project-context.md` exists, it wins every conflict with a template.
5. **Dissolve, don't reference.** Task outputs must contain concrete file
   paths, function signatures, and API shapes — never template filenames
   or `.ai-prompts/prompts/` paths.

## Example session (typical flow with checkpoints)

```
User: "A todo app with user auth and team workspaces"

Agent loads: ai-agent-entry-point.md                          (1 file)
Agent checks: working_copy/ empty → skip external handler
Agent checks: project-context.md missing → skip precedence load
Agent routes: Mode 4 (greenfield)
Agent loads: drill-down-engine.md                             (2 files total)
Agent runs: drill-down-engine Step 1 (seed)
  → writes prompts/outputs/current/epics.md (5 feature + 12 baseline)
  → writes prompts/outputs/current/brief-keywords.md
⏸ CHECKPOINT: shows epics to user, waits for "Continue"

User: "Continue"

Agent runs: Step 2 per epic (fresh context each)
  → writes features-<epic>.md per epic
  → writes external-accounts.md
⏸ CHECKPOINT: shows feature summary, waits for "Continue"

User: "Continue"

Agent runs: Step 3 for first epic's features
  → writes tasks-<feature>.md per feature in epic 1
⏸ CHECKPOINT: shows progress (e.g. 8/42 task files), waits

User: "Continue"

[...repeats per epic...]

Agent runs: Revise gate
  → executor_gate: pass
⏸ HARD STOP: shows planning summary + task checklist, waits

User: "Execute"

Agent reads: executor.md
Agent runs: first task from tasks-*.md
  → writes code, runs test, logs result
⏸ CHECKPOINT: shows task result, waits for "Continue"

User: "Continue"

[...repeats per task...]
```

## Example session (with external material)

```
User: "Here are Figma exports in working_copy/ — build this"

Agent loads: ai-agent-entry-point.md                          (1 file)
Agent detects: working_copy/ has files → load external-input-handler.md
Agent runs: external-input-handler
  → writes prompts/outputs/current/project-context.md
Agent routes: Mode 4 (greenfield)
Agent loads: drill-down-engine.md                             (3 files total)
Agent runs: drill-down-engine Step 1 loading project-context.md first
  → epics reflect real screen names, real entities from the mockups
⏸ CHECKPOINT: shows epics, waits for "Continue"

[...same checkpoint flow as above...]
```

## Example session (resuming after context exhaustion)

```
User: "Continue where you left off"

Agent loads: ai-agent-entry-point.md
Agent detects: resumption-checkpoint.md exists (phase: execution, next_task: tasks-signup.md)
Agent loads: re_load_files (execution-log.md, tasks-signup.md)
Agent routes: Mode 2 (execute existing plan)
Agent reads: executor.md
Agent resumes: from tasks-signup.md
  → implements task, logs result, updates resumption-checkpoint.md
⏸ CHECKPOINT: shows result, waits for "Continue"
```

## Scope

This entry point handles **any** user request: new projects, feature additions,
refactors, bug fixes. For atomic one-off tasks (e.g. "rename this variable"),
skip the engine entirely and do the work directly — the engine is for
generating spec-to-task expansions, not for trivial edits.
