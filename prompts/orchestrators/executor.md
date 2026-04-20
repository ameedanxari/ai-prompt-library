# Executor Orchestrator

Executes the remediation plan produced by `audit-and-remediate.md` (or
the task plan produced by `drill-down-engine.md`). Turns plan files
under `prompts/outputs/current/` into real code changes, test runs, and
a durable progress log.

## When to use

The entry point routes here when ALL of these are true:
- `prompts/outputs/current/` contains one or more `remediation-*.md`
  files (gap-closure plan) or `tasks-*.md` files (greenfield plan).
- The user's prompt signals execution: "fix", "implement", "execute",
  "run the plan", "do the work", "build it", "ship", "write the tests",
  "close the gaps", or similar.
- The plan passed `scripts/validate-instantiation.sh`.

## Preflight gate (MUST run before ANY task execution)

The executor refuses to run if ANY of the following is true. These are
hard gates — you cannot "explain them away" or work around them by
writing task entries anyway. Your first action on invocation is:

```bash
bash scripts/validate-instantiation.sh prompts/outputs/current
```

Act on the exit code:

- **Exit 0** → validator passed, including the presence and shape of
  `external-accounts.md` and `revise-report.md` with
  `executor_gate: pass`. Proceed to the execution loop.
- **Non-zero exit** → stop immediately. Do NOT start writing
  `execution-log.md`. Report the validator's output verbatim to the
  user and tell them which engine step failed to complete:
  - Missing `external-accounts.md` → audit-and-remediate Step 3.5
    (or drill-down Step 2.5) was skipped.
  - Missing `revise-report.md` → audit-and-remediate Step 4.5 (or
    drill-down Revise Gate) was skipped.
  - `executor_gate: fail` → the revise gate caught a violation that
    was not regenerated. Re-run the engine's revise step with the
    failing check's regeneration rule.

This gate exists because field tests repeatedly showed weak models
treating Steps 3.5/4.5 as optional and starting the executor on an
incomplete plan. The executor must refuse that — there is no "let's
just start with what we have" path.

If `execution-log.md` already exists (a prior session was in progress),
the preflight still runs. If the plan has been re-planned since the
last session and the revise gate is now failing, the executor stops
with a clear message — resuming across a broken plan would compound
drift.

## Startup load

On top of the entry-point + this file, load:

1. `prompts/outputs/current/gap-list.md` (gap-closure) OR
   `prompts/outputs/current/epics.md` (greenfield) — for ordering.
2. `prompts/outputs/current/execution-log.md` if it exists — resume
   point.

Do NOT load every remediation/task file at startup. Load each one only
when you are about to execute its tasks. Isolation discipline from the
planning engines carries over here.

## Output artifact: execution-log.md

Maintained continuously under `prompts/outputs/current/execution-log.md`.
**Two parts**: a YAML-frontmatter handoff envelope (machine-parseable,
kept up-to-date at every task completion) and an append-only per-task
journal. Schema:

```markdown
---
session_id: <run the shell command `uuidgen` yourself, then paste the 36-char UUID value here — do NOT write the literal string "$(uuidgen)" or the placeholder>
parent_session: <previous session_id, or null on first run>
plan_source: audit-and-remediate | drill-down-engine
started_at: <ISO 8601 — e.g. 2026-04-19T22:45:03Z>
updated_at: <ISO 8601 — set on every task completion>
platforms: [web, android, ios]   # from MY_PROJECT.md or inferred
last_completed_task: G1.R3        # or E1.T3; null if none yet
next_task: G1.R4                   # computed from dependency graph
blocked_tasks: [G2.R1, G5.R7]
failed_tasks: []
deferred_tasks: [G3.R2]            # waiting on a dependency
test_suite_state: green | red | unknown
regressions_since_green: []        # task ids that introduced red
external_keys_needed: [STRIPE_SECRET_KEY, FIREBASE_SERVER_KEY]
---

# Execution Log

## G1 · <gap-slug>  (or E1 · <epic-slug>)

### R1 · <task objective>   — <status>
- **Attempted:** <timestamp>
- **Change made:** <one-line diff summary — which files, what function,
  what delta>
- **Test run:** `<exact command>`
- **Test result:** pass | fail | error
- **Acceptance verified:**
  - ✅ <bullet from plan — met>
  - ❌ <bullet from plan — not met, with one-line reason>
- **Status:** done | blocked | deferred | failed
- **Notes:** <one sentence; only if status is not `done`>
- **Session:** <session_id> (which session completed this task — lets a
  future agent reconstruct order across multiple sessions)

### R2 · ...
```

### Handoff envelope — maintenance rules

- On first write (no existing `execution-log.md`), generate a new
  `session_id` and leave `parent_session: null`.
- On later writes, if `execution-log.md` exists with a previous
  envelope, generate a NEW `session_id`, set `parent_session` to the
  old one, and keep every prior journal entry intact. The executor is
  append-only for journal entries and atomic-replace for the envelope.
- `updated_at` ticks on every task transition.
- `next_task` is computed: first task in dependency+severity order that
  is not in `done` / `blocked` / `deferred` / `failed`.
- A new agent resuming work reads ONLY the envelope first. If every
  task is `done`, report done. Otherwise continue from `next_task`.

### Session resumption contract

Any new agent can produce correct continuation behaviour by following
**only** these steps:

1. Read the YAML frontmatter of `execution-log.md` (lines between `---`).
2. Parse `next_task`. If `null`, the plan is complete — run a final
   regression check and report.
3. Open the remediation/tasks file that contains `next_task`.
4. Resume the execution loop from that task.

A weak model must not re-run the audit when an envelope exists. The
envelope is the source of truth for "where we are".

`status` values:
- `done` — code changed, test passed, all acceptance met.
- `blocked` — cannot proceed without user decision (e.g. API mismatch
  requires rewriting tests vs. implementing new code).
- `deferred` — another task must close first (dependency).
- `failed` — attempted, test failed or acceptance not met; needs retry
  after user guidance.

## Execution loop

```
repeat:
  read gap-list.md (or epics.md)
  for each gap/epic in severity + dependency order:
    if every R<n> in this gap has status `done` in execution-log.md:
      continue  // gap is closed
    read remediation-<gap>.md  (fresh context per gap)
    for each task R<n> in this gap:
      if R<n> status is already `done` in execution-log.md: skip
      if R<n>'s Depends on lists a task not yet `done`: skip (deferred)
      execute R<n>:
        1. Apply the Precise change to the named File.
        2. Run the named Test command.
        3. Evaluate each Acceptance bullet: pass/fail.
        4. Append a log entry.
      if status != `done`:
        surface the blocker to the user and stop this gap.
        move to next gap (do NOT retry blocked tasks without user input).
    after gap: run broader regression check (see below).
  when all gaps processed: produce summary (see below).
```

### Broader regression check after each gap

After closing every task in a gap, run the most general test suite the
project has (`npm test`, `./gradlew test`, `swift test`, `pytest`, etc.
— inspect `package.json` / `build.gradle.kts` / `Package.swift` for the
command). If that suite was green before this gap and is red after,
pause, surface the regression, and do not proceed to the next gap.

## Task execution rules

1. **One file, one change.** The plan specifies exactly one file per
   task. Do not edit additional files unless a test failure reveals a
   missing prerequisite — in which case, stop and log the discovery
   rather than opportunistically editing.

2. **Run the named test, not a substitute.** If the plan says run
   `backend/tests/websocket/test-order-events.test.ts`, run that file
   (e.g. `npm test -- backend/tests/websocket/test-order-events.test.ts`).
   Don't substitute the full test suite for a targeted test; both
   happen, but at different phases (task vs. post-gap regression).

3. **Acceptance bullets are binary.** For each bullet, you either met
   it with an observable action or you didn't. No "mostly met."

4. **Stop on the first API mismatch / missing prerequisite / external
   blocker.** Do not attempt to fabricate APIs that don't exist. Do not
   rewrite the plan on the fly. Log it as `blocked` and move on to the
   next gap, then surface the collected blockers at the end.

5. **Never skip the test.** If the test cannot be run (environment
   missing, simulator absent, credentials unavailable), the task is
   `blocked`, not `done`.

## When to stop

Stop the loop and report when any of the following is true:
- Every gap has all tasks marked `done`.
- A broader regression check failed after a gap closure.
- More than 3 consecutive tasks land in `blocked` status (the plan is
  probably wrong for this codebase; re-audit).
- The user interrupted.

## Report format (final output to user)

```
Execution complete. Summary:

  Gaps closed:     <n> / <total>
  Tasks done:      <n> / <total>
  Tasks blocked:   <n>   (see execution-log.md § Blockers)
  Tasks failed:    <n>   (see execution-log.md § Failures)

  Regression state:  <all green | N tests red — see log>

Blockers requiring your decision:
  - G<x> R<y>: <one-line summary + what the user needs to decide>

Next step options:
  [A] Fix the blocker and resume → re-invoke the executor.
  [B] Re-audit (plan drifted from reality) → re-invoke audit-and-remediate.
  [C] Accept current state as done (blockers become known-issues).
```

## See also

- `prompts/orchestrators/ai-agent-entry-point.md` — routes here.
- `prompts/orchestrators/audit-and-remediate.md` — produces the plan
  this orchestrator executes (gap-closure).
- `prompts/orchestrators/drill-down-engine.md` — produces the plan for
  greenfield builds; same execution semantics apply.
- `scripts/validate-instantiation.sh` — the gate this orchestrator
  refuses to run without.
