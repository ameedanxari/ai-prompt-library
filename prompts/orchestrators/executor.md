# Executor Orchestrator

Executes the implementation prompts produced by `drill-down-engine.md`
(or the remediation plan from `audit-and-remediate.md`). Each prompt
file under `prompts/outputs/current/` is a self-contained implementation
guide. The executor picks the next prompt, feeds it to the AI, verifies
the result, and logs progress.

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
bash .ai-prompts/scripts/revise.sh prompts/outputs/current
```

This command runs the full instantiation validator and writes a fresh
`revise-report.md` reflecting the CURRENT state of the plan directory.
Running it is idempotent — if the plan is clean it just re-confirms
`executor_gate: pass`.

Act on the exit code:

- **Exit 0** → `executor_gate: pass`. External-accounts.md and
  revise-report.md are both present and valid. Proceed to the
  execution loop.
- **Non-zero exit** → stop immediately. Do NOT start writing
  `execution-log.md`. Read `revise-report.md`'s `failing_files:` list
  and report the specific files to the user, then name which engine
  step needs to re-run:
  - Missing `external-accounts.md` → audit-and-remediate Step 3.5
    (or drill-down Step 2.5) was skipped.
  - Missing or failing `revise-report.md` → the revise gate caught a
    violation. Regenerate the offending `tasks-*.md` /
    `remediation-*.md` via the engine's Step 3, then re-invoke
    `bash .ai-prompts/scripts/revise.sh` until exit 0.

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
3. `prompts/outputs/current/path-ledger.md` — the authoritative list of
   every file path the plan owns. Keep this open (or re-read on demand)
   before every file write. If `finalize.sh` wrote the ledger as part
   of the gate, it is up to date; if it is missing, run
   `bash .ai-prompts/scripts/build-path-ledger.sh prompts/outputs/current`
   yourself before the first task write.

Do NOT load every remediation/task file at startup. Load each one only
when you are about to execute its tasks. Isolation discipline from the
planning engines carries over here.

### Canonical-paths contract

Before writing ANY source file, check that the path you are about to
write appears verbatim in `path-ledger.md`. The ledger enforces one
canonical path per concept and is the reason field-tested weak models
produce duplicate trees (`filter/` vs `filters/`, `classifier/` vs
`scanner/`, `Settings/` vs `Storage/`). If your intended path is not
in the ledger:

1. Look for a close variant (same basename, singular vs plural, or
   sibling directory). If one IS in the ledger, that is the canonical
   path — use it.
2. If nothing close is in the ledger, STOP. Do not invent a path. The
   plan does not declare it. Either open the source `tasks-*.md` to
   confirm the declared path matches what the ledger recorded, or
   regenerate the task via drill-down-engine Step 3 so the plan names
   the path you need.

Never write a source file to a path that is not in the ledger. Weak
models that diverge here produce duplicate classes that break the
build and cause the same test file to pass twice.

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
  read epics.md (or gap-list.md)
  for each epic in dependency order:
    if every prompt in this epic is `done` in execution-log.md:
      continue  // epic is complete
    for each tasks-<feature>.md in this epic:
      if already `done` in execution-log.md: skip
      execute the prompt:
        1. Read the full contents of tasks-<feature>.md.
           This IS the implementation prompt — it contains all the
           context, guidance, patterns, and constraints the AI needs.
        2. Implement the feature as described in the prompt.
           The prompt is self-contained: treat it the same way you
           would if a user had copy-pasted it into a fresh chat.
        3. Run the build-green gate (see below). If it fails,
           the prompt is `failed` — do NOT mark done.
        4. Verify the implementation matches the prompt's guidance.
        5. Append a log entry.
        6. Present the ⏸ CHECKPOINT (see below).
      if status != `done`:
        surface the blocker to the user and stop this epic.
        move to next epic (do NOT retry without user input).
    after epic: run broader regression check (see below).
  when all epics processed: run the honest-handoff gate (see below)
    and only then produce the summary.
```

### ⏸ CHECKPOINT — After each prompt

After executing each prompt and appending its log entry, **STOP and
present the result to the user**. Show:

1. **Prompt file** (e.g. `tasks-signup-endpoint.md`).
2. **What was built** — one-paragraph summary of the implementation.
3. **Files created/modified** — list of all files touched.
4. **Build result** (green / red / error).
5. **Status** (done / blocked / failed).
6. **Overall progress** — `N / M prompts complete (P%)`.
   Include counts: `done: X, blocked: Y, failed: Z, remaining: W`.
7. If status is `done`:
   `"Prompt complete. Say **Continue** to proceed to the next prompt."`
   If status is `blocked` or `failed`:
   `"Prompt [status]. [One-line explanation]. Say **Continue** to skip
   to the next prompt, or provide guidance."`

**Wait for the user to say "Continue".** Do NOT auto-advance.

If the user says "Continue N" (e.g. "Continue 5"), execute N prompts
before the next checkpoint. Each prompt still gets a log entry, but
only the last one triggers the visible checkpoint.

If context is exhausted before the user responds, the next session
can resume from `execution-log.md`'s `next_task` field.

### Build-green gate (after every task)

A test passing on a newly-created file does not prove the whole
project still builds. The library ships `build-gate.sh` to catch the
failure mode where a task's unit test compiles fine but the rest of
the codebase — imports, duplicate top-level declarations, manifest
merges, schema files — is now broken.

```bash
bash .ai-prompts/scripts/build-gate.sh
```

This auto-detects Gradle, xcodebuild, Node/TypeScript, Python, and Go
stacks at the project root and runs each stack's cheapest compile-only
check. Exit codes:

- `0` → every detected stack compiled cleanly. Mark the task done
  and append the log entry.
- `1` → at least one stack fails to compile. The task is `failed`.
  Do NOT append a done entry. Either undo the change and log the
  task as `failed` with the specific compile error, or fix the break
  inside the same task loop before logging. Do not move to the next
  task until the build is green.
- `2` → no buildable stack detected OR required tool missing from
  PATH. Surface this to the user; it usually means the executor was
  invoked outside a real project tree.

If the gate blames a path that is not in `path-ledger.md`, that is a
canonical-paths violation — re-read the contract above.

### Broader regression check after each gap

After closing every task in a gap, run the most general test suite the
project has (`npm test`, `./gradlew test`, `swift test`, `pytest`, etc.
— inspect `package.json` / `build.gradle.kts` / `Package.swift` for the
command). If that suite was green before this gap and is red after,
pause, surface the regression, and do not proceed to the next gap.

## Prompt execution rules

1. **The prompt IS the instruction.** Each `tasks-*.md` file contains
   everything the AI needs to implement one use case. Read and follow
   it as if a user had pasted it into chat. Do not hallucinate beyond
   what the prompt specifies.

2. **One prompt = one atomic deliverable.** A prompt may span multiple
   files — that is expected. The scope is one end-to-end use case,
   not one file.

3. **Follow the prompt's testing approach.** If the prompt describes
   specific tests to write or commands to run, do exactly that.

4. **Stop on the first missing prerequisite or blocker.** Do not
   fabricate APIs or dependencies that don't exist. Log as `blocked`
   and move on to the next prompt, surfacing blockers at the end.

5. **Never skip verification.** If the build gate or tests cannot run
   (environment missing, credentials unavailable), the prompt is
   `blocked`, not `done`.

## When to stop

Stop the loop and report when any of the following is true:
- Every gap has all tasks marked `done`.
- A broader regression check failed after a gap closure.
- More than 3 consecutive tasks land in `blocked` status (the plan is
  probably wrong for this codebase; re-audit).
- The user interrupted.

## Honest-handoff gate (MANDATORY before setting `next_task: null`)

Before declaring a run complete — that is, before setting `next_task:
null` in the envelope — run:

```bash
bash .ai-prompts/scripts/validate-execution-envelope.sh prompts/outputs/current
```

This script reads every `tasks-*.md` / `remediation-*.md`, extracts
the `**File:**` path declared by each T<n>/R<n>, and checks that
either (a) the file exists on disk under the project root, OR (b) the
task id is listed in `blocked_tasks` / `failed_tasks` /
`deferred_tasks` in the envelope. Any task that fails BOTH is a
"silent skip" — the executor produced no file for it and did not
explain why.

Exit codes:
- `0` → every plan task is accounted for. `next_task: null` is
  permitted. Produce the final summary.
- `1` → silent skips detected. `envelope-report.md` lists each skipped
  task's id and declared path. Do NOT set `next_task: null`. For each
  listed row, either execute the task now or add it to
  `blocked_tasks` / `failed_tasks` / `deferred_tasks` with a one-line
  reason and a matching journal entry.

Field tests repeatedly produced an envelope reporting
`next_task: null` with 167/167 done while ~70% of planned files were
never written. This gate exists specifically to catch that — a weak
model cannot declare a run complete without accounting for every task
in the plan.

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
- `scripts/validate-instantiation.sh` — the preflight gate this
  orchestrator refuses to run without.
- `scripts/build-path-ledger.sh` — emits the canonical-paths ledger
  the executor must consult before writing any source file.
- `scripts/build-gate.sh` — the after-each-task build-green gate.
- `scripts/validate-execution-envelope.sh` — the honest-handoff gate
  that refuses `next_task: null` when files are missing without a
  blocked/failed/deferred entry.
