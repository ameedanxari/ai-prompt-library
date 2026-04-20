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

If the plan has NOT been validated, run the validator first and fix any
issues before executing. Never execute against an unvalidated plan —
directory paths, tautological acceptance, and placeholders will all
produce broken work.

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
Append-only with one section per task attempt. Schema:

```markdown
# Execution Log

_Started: <timestamp>_
_Plan source: audit-and-remediate.md | drill-down-engine.md_

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

### R2 · ...
```

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
