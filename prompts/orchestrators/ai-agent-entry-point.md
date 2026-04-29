# AI Agent Entry Point

Minimal, low-context entry for any user request. Maximum files auto-loaded
at startup: **2** (this file + `drill-down-engine.md`).

## Startup sequence (total: 2 file reads)

1. **Read this file.**
2. **Read `prompts/orchestrators/drill-down-engine.md`.**

That is the entire auto-load list at startup. If step D below routes to
gap-closure mode, you will also read `audit-and-remediate.md` (one more
file). Nothing else loads automatically — not safeguards, not stage
files, not modules, not templates, not router orchestrators. All of
those are opt-in, on demand, one at a time.

## Routing

After the two startup reads, execute these checks **in order** and do NOT
stop between them. Each step flows into the next without user confirmation.

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
- `MY_PROJECT.md` lists external material under "External material"

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
  plan) OR `tasks-*.md` (greenfield plan), AND those plan files pass
  `scripts/validate-instantiation.sh`.
- The user's ask signals execution, not re-planning: "fix", "implement",
  "execute", "run the plan", "do the work", "build it", "ship", "close
  the gaps", "write the tests", "make it pass".

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
  - OR `MY_PROJECT.md` "External material" section lists source
    directories with completion percentages (e.g. "95% complete",
    "85% complete").
- Mode 2 does NOT apply (either no plan exists or the user explicitly
  wants a fresh audit).

Route to `prompts/orchestrators/audit-and-remediate.md` and follow its
5-step flow (Component audit → Gap list → Remediation tasks → Validate
→ Chain to executor).

The orchestrator's Step 5 inspects the user's prompt for execute signals
("fix", "implement", "close the gaps", "write the tests", etc.) and
chains into Mode 2 automatically when any match. That chain is MANDATORY
— SWE 1.6 failed this in an earlier test by treating chain language as
optional. Trust Step 5; do not second-guess it.

#### Mode 4 — Greenfield (drill-down engine)

Use when the project is empty of meaningful source OR the user's brief
describes something new to build. This is the default when none of
modes 1-3 apply.

Route to `drill-down-engine.md` and follow its 3-step flow
(Seed → Features → Tasks → Validate).

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

**Resumability:** If the IDE closes or context is exhausted mid-run,
the user can start a new session and say:

```
Continue where you left off. Read .ai-prompts/prompts/AGENTS.md and
.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.
```

The entry point will detect current state from
`prompts/outputs/current/` and `execution-log.md` and resume from the
last checkpoint.

## Context Management & Continuity

### The "New Chat" Recommendation
For complex projects, starting a **NEW CHAT** for each major planning or execution step is the most reliable way to avoid context-compaction artifacts and hallucinations.

### Mandatory Re-load on Continuity
If you are continuing an existing session or resuming work:
1. **You MUST re-read all relevant project files from disk.** Do not rely on previous context or history.
2. **Explicit Override:** If continuing in a long chat history, ask the user: *"I see we are continuing in this chat. To ensure maximum precision for this next step, should I restart in a fresh chat, or would you like me to re-load all context from disk and continue here?"*

This protocol ensures every implementation prompt and every code change is based on the current, accurate state of the repository.

## What NOT to auto-load

| File / group | Load when |
|---|---|
| `docs/optional/` (PREVENTION_CHECKLIST, COMMIT_GUIDELINES, SAFEGUARDS) | User explicitly asks for safeguard / commit-policy / change-impact guidance |
| `prompts/stages/**` | Never. The stage pipeline is superseded by the drill-down engine. |
| `prompts/orchestrators/stage-pipeline-orchestrator.md` | Never auto-load |
| `prompts/orchestrators/auto-setup-orchestrator.md` | Only on first-run project setup |
| Other orchestrators under `prompts/orchestrators/` | Only when their specific capability is requested |
| Full module catalog `prompts/modules/**` | Never all at once. The drill-down engine loads at most one module per expansion context. |

## Rules of engagement

1. **Isolation first.** Each expansion step starts from a minimal context.
   Do not carry prior-step artifacts into the next context beyond the
   specific slice being expanded.
2. **Two-file startup budget.** If you find yourself loading a third file
   before routing, stop — you're back in waterfall mode.
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

Agent loads: ai-agent-entry-point.md, drill-down-engine.md   (2 files)
Agent checks: working_copy/ empty → skip external handler
Agent checks: project-context.md missing → skip precedence load
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

Agent loads: ai-agent-entry-point.md, drill-down-engine.md   (2 files)
Agent detects: working_copy/ has files → load external-input-handler.md
Agent runs: external-input-handler
  → writes prompts/outputs/current/project-context.md
Agent runs: drill-down-engine Step 1 loading project-context.md first
  → epics reflect real screen names, real entities from the mockups
⏸ CHECKPOINT: shows epics, waits for "Continue"

[...same checkpoint flow as above...]
```

## Example session (resuming after context exhaustion)

```
User: "Continue where you left off"

Agent loads: ai-agent-entry-point.md
Agent detects: execution-log.md exists with next_task: E15.T1
Agent routes: Mode 2 (execute existing plan)
Agent reads: executor.md
Agent resumes: from E15.T1
  → implements task, logs result
⏸ CHECKPOINT: shows result, waits for "Continue"
```

## Scope

This entry point handles **any** user request: new projects, feature additions,
refactors, bug fixes. For atomic one-off tasks (e.g. "rename this variable"),
skip the engine entirely and do the work directly — the engine is for
generating spec-to-task expansions, not for trivial edits.
