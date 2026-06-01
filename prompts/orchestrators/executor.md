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
- The plan passed `scripts/validate-ready-to-execute.sh`.

## Preflight gate (MUST run before ANY task execution)

The executor refuses to run if ANY of the following is true. These are
hard gates — you cannot "explain them away" or work around them by
writing task entries anyway. Your first action on invocation is:

```bash
bash .ai-prompts/scripts/validate-ready-to-execute.sh prompts/outputs/current
```

This command runs the single pre-executor readiness gate. It invokes
`finalize.sh`, which rebuilds `path-ledger.md`, `delivery-order.md`,
`task-schema-repair-report.md`, `task-contract.json`,
`task-graph.json`, `phase-order-report.md`,
`baseline-task-coverage.md`, `user-review-checkpoints.md`, and
`revise-report.md`, then writes a fresh `ready-to-execute-report.md`
reflecting the CURRENT state of the plan directory. Running it is
idempotent — if the plan is clean it just re-confirms
`ready_to_execute: true`.

Act on the exit code:

- **Exit 0** → `ready_to_execute: true`. External-accounts.md,
  revise-report.md, task-schema-repair-report.md, delivery-order.md,
  task-contract.json, task-graph.json, phase-order-report.md,
  baseline-task-coverage.md, user-review-checkpoints.md, and
  path-ledger.md are present and valid.
  Proceed to the execution loop.
- **Non-zero exit** → stop immediately. Do NOT start writing
  `execution-log.md`. Read `ready-to-execute-report.md` first. Its
  YAML frontmatter names `blocking_artifacts`, `blocking_issues`, and
  `recommended_step`; use those fields as the authoritative failure
  summary instead of scraping finalize logs. Then open the named
  artifact that failed (`revise-report.md`, `delivery-order.md`,
  `task-contract.json`, `task-graph.json`, `phase-order-report.md`,
  `baseline-task-coverage.md`, `user-review-checkpoints.md`, or
  `path-ledger.md`). Report the specific files to the user, then name
  which engine step needs to re-run:
  - Missing `external-accounts.md` → audit-and-remediate Step 3.5
    (or drill-down Step 2.5) was skipped.
  - Missing or invalid `delivery-order.md` → drill-down Step 3.8 was skipped.
    Re-run `bash .ai-prompts/scripts/build-delivery-order.sh prompts/outputs/current`.
  - Phase/order failures in `phase-order-report.md` →
    re-grade the offending tasks' `Phase:` or remove the inverted
    edge, then re-run `validate-ready-to-execute.sh`.
  - Missing or invalid `task-graph.json` → drill-down Step 3.8 was skipped.
    Re-run `bash .ai-prompts/scripts/build-task-graph.sh prompts/outputs/current`.
  - Missing dependencies / cycles in `task-graph.json` →
    fix the offending `Depends on:` edges, then re-run
    `build-task-graph.sh`.
  - Missing or invalid `user-review-checkpoints.md` →
    regenerate the design-system foundation task or its dependent
    screen tasks so the HTML review artifact is presented for
    visual-review feedback before dependent screen-level work.
  - Missing or failing `revise-report.md` → the revise gate caught a
    violation. Regenerate the offending `tasks-*.md` /
    `remediation-*.md` via the engine's Step 3, then re-invoke
    `bash .ai-prompts/scripts/validate-ready-to-execute.sh` until exit 0.

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

1. `prompts/outputs/current/delivery-order.md` — **the authoritative
   execution order.** Each numbered entry names exactly one task
   filename. The executor iterates this list top to bottom; do NOT
   re-sort, do NOT iterate filesystem listings, do NOT skip ahead
   past a phase. If the file is missing or stale, run
   `bash .ai-prompts/scripts/build-delivery-order.sh prompts/outputs/current`
   yourself before the first task. The Phase field on each task is
   already baked into the manifest's order — you do not need to
   re-derive it.
2. `prompts/outputs/current/gap-list.md` (gap-closure) OR
   `prompts/outputs/current/epics.md` (greenfield) — for progress
   grouping and user-facing summaries, not execution ordering.
3. `prompts/outputs/current/execution-log.md` if it exists — resume
   point.
4. `prompts/outputs/current/path-ledger.md` — the authoritative list of
   every file path the plan owns. Keep this open (or re-read on demand)
   before every file write. If `finalize.sh` wrote the ledger as part
   of the gate, it is up to date; if it is missing, run
   `bash .ai-prompts/scripts/build-path-ledger.sh prompts/outputs/current`
   yourself before the first task write.
5. `prompts/outputs/current/task-graph.json` — the authoritative task
   dependency graph and topological order. If it is missing, run
   `bash .ai-prompts/scripts/build-task-graph.sh prompts/outputs/current`
   before selecting a task.

Do NOT load every remediation/task file at startup. Load each one only
when you are about to execute its tasks. Isolation discipline from the
planning engines carries over here.

## Toolchain setup (MUST run before first task — Task 0)

Before writing any application code, the executor MUST ensure the
development environment is ready. This is the equivalent of onboarding
a new developer to the project.

### Step 1: Scaffold from project templates

The library includes starter project templates under
`.ai-prompts/project-templates/`. For native mobile projects:

1. **Copy template to project root** if the target directory doesn't
   exist yet:
   - iOS: copy `.ai-prompts/project-templates/ios/` → `ios/`
   - Android: copy `.ai-prompts/project-templates/android/` → `android/`
2. **Rename and customize** the template:
   - Replace `AppTemplate` / `com.example.app` with the actual project
     name and bundle ID from `MY_PROJECT.md`.
   - Rename directories to match (e.g. `AppTemplate.xcodeproj` →
     `<ProjectName>.xcodeproj`).
3. **Verify the scaffold builds** by running `build-gate.sh`. If the
   template builds clean, the project has a working baseline.

### Step 2: Detect and verify toolchain

Identify required build tools from the plan and verify availability:

| Platform | Required | Check command |
|----------|----------|--------------|
| iOS | Xcode + xcodebuild | `xcodebuild -version` |
| Android | Android SDK + Gradle | `./gradlew --version` (from android/) |
| Web (Node) | Node.js + npm | `node --version && npm --version` |
| Python | Python + pip | `python3 --version` |
| Go | Go compiler | `go version` |

If a required tool is missing:
1. **Report to the user** with exact installation steps (e.g. "Install
   Xcode from the Mac App Store" or "Install Android Studio and
   configure ANDROID_HOME").
2. **Log as a prerequisite** in `execution-log.md` with status
   `blocked` and a clear one-line action for the user.
3. **Do NOT proceed** with tasks that require the missing tool.

### Step 3: Generate dev setup script

Create an idempotent setup script at `scripts/dev-setup.sh` (or
`scripts/dev-setup.bat` for Windows) that:
- Installs project dependencies (`npm install`, `pod install`, etc.)
- Sets up the database if needed
- Seeds fixtures / test data
- Verifies the build compiles clean
- Prints a "Ready to develop" message with the start command

This script is also the onboarding path for future developers joining
the project. Log the creation in `execution-log.md` as Task 0.

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
last_completed_task: tasks-signup.md  # filename of the last completed prompt; null if none yet
next_task: tasks-login.md              # computed from dependency graph
blocked_tasks: [tasks-stripe.md]
failed_tasks: []
deferred_tasks: [tasks-dashboard.md]   # waiting on a dependency
test_suite_state: green | red | unknown
regressions_since_green: []            # prompt filenames that introduced red
external_keys_needed: [STRIPE_SECRET_KEY, FIREBASE_SERVER_KEY]
harness_recoveries: []     # appended by the diagnose-harness pipeline; each entry is { task, classification, action, result, at }
---

# Execution Log

## <Epic or Gap Name>

### `tasks-<feature>.md` (or `remediation-<gap>.md`) — <status>
- **Attempted:** <timestamp>
- **Change made:** <one-line diff summary — which files, what function, what delta>
- **Test run:** `<exact command>`
- **Test result:** pass | fail | error
- **Acceptance verified:**
  - ✅ <bullet from plan — met>
  - ❌ <bullet from plan — not met, with one-line reason>
- **Status:** done | blocked | deferred | failed
- **Notes:** <one sentence; only if status is not `done`>
- **Session:** <session_id> (which session completed this task — lets a future agent reconstruct order across multiple sessions)

### `tasks-<next-feature>.md` ...
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
read delivery-order.md
  parse its numbered list of task filenames in order; this IS the
  execution order. The list is already phase-grouped (foundation →
  mvp → expand → polish) and topologically sorted within each phase
  by Depends-on edges, with lexical filename as the final tiebreak.
read task-graph.json
  use it to verify each selected task's dependencies and to compute
  the next unblocked task for the execution-log envelope. If the
  delivery-order and graph disagree, stop and rebuild both artifacts
  with finalize.sh.

repeat:
  for each task filename in delivery-order.md, in the order listed:
    if already `done` in execution-log.md: skip
    if blocked/deferred/failed by a previous attempt: respect the
      envelope's blocked_tasks / failed_tasks / deferred_tasks list
      and skip — do not retry without user input.
    if task-graph.json says any dependency is not `done`: stop.
      The plan order is stale or a dependency was skipped; rebuild the
      graph/order or complete the dependency first.

    execute the task:
      1. Read the full contents of the chosen prompt file.
         This IS the implementation prompt — it contains all the
         context, guidance, patterns, and constraints the AI needs.
      2. Implement the feature as described in the prompt.
         The prompt is self-contained: treat it the same way you
         would if a user had copy-pasted it into a fresh chat.
      3. Run the build-green gate AND the task's named test
         (see below). Capture stderr to a file. If either fails,
         run the **Harness-Diagnosis pipeline** (see below) before
         marking the prompt `failed`. Diagnosis may recover the
         harness or apply a deterministic code fix and warrant ONE
         retry; only after recovery fails does the prompt become
         `failed` or `blocked`.
      4. Verify the implementation matches the prompt's guidance.
      5. Run the **Auto-commit pipeline** (see below). It validates
         the diff against the task's declared scope, then commits.
      6. Append a log entry.
      7. Present the ⏸ CHECKPOINT (see below).

    if status != `done`:
      surface the blocker to the user and stop the current phase.
      Do NOT skip ahead to a later phase — a foundation/mvp failure
      almost always implies later tasks will fail too. Move on only
      when the user gives explicit guidance.

    after each phase boundary in delivery-order.md (when the next
    task in the list belongs to a later phase): run broader
    regression check (see below).

  when every task in delivery-order.md is accounted for: run the
    honest-handoff gate (see below). It validates execution-log order
    against task-graph.json before allowing `next_task: null`, and
    only then produce the summary.
```

### Why delivery-order.md and task-graph.json

Iterating filesystem listings (`ls tasks-*.md`) produces alphabetical
order, which hides the phase grouping and mixes foundation tasks with
expand/polish tasks. The Phase field exists specifically to fix this,
but the field alone does not change iteration order — the executor
must read a canonical sorted list. That list is `delivery-order.md`,
written by `scripts/build-delivery-order.sh` during finalize.

**Never substitute filesystem order for delivery-order.md.** If the
manifest is missing or out of date, regenerate it via:

```bash
bash .ai-prompts/scripts/build-delivery-order.sh prompts/outputs/current
```

The script also re-validates that no task depends on a later-phase
task (phase inversion) and no cycle exists. Both conditions are
fatal to the executor.

`task-graph.json`, written by `scripts/build-task-graph.sh`, is the
machine-readable DAG used for dependency checks, resume math, and final
execution-order validation. It catches missing dependency references
and cycles even when the human-readable delivery manifest looks sane.

### Phase-boundary regression check

Every transition from one Phase to the next (foundation → mvp,
mvp → expand, expand → polish) is a natural checkpoint where the
whole project should still build and the broader regression test
should still pass. Treat each phase boundary the same way the old
loop treated an epic boundary: run the broader regression check
before crossing into the next phase. If foundation tasks all pass
individually but the regression check fails at the foundation/mvp
boundary, do NOT start MVP — surface to the user.

### ⏸ CHECKPOINT — After each prompt

After executing each prompt, appending its log entry, and updating the `execution-log.md` YAML envelope, **write the resumption checkpoint** and then **STOP and present the result to the user**.

**Update `prompts/outputs/current/resumption-checkpoint.md`:**
```yaml
---
phase: execution
engine: executor
step: "Task N of M"
last_completed: "<filename of the just-completed tasks-*.md or remediation-*.md>"
next_action: "Execute <next task filename> (or complete if all done)"
re_load_files:
  - prompts/outputs/current/execution-log.md
  - prompts/outputs/current/<next-task-filename>
updated_at: <current ISO 8601 timestamp>
---
```
*(If this was the final task, set `next_action: "Run honest-handoff gate"` and list only `execution-log.md` in `re_load_files`.)*

Show:

1. **Prompt file** (e.g. `tasks-signup-endpoint.md`).
2. **What was built** — one-paragraph summary of the implementation.
3. **Files created/modified** — list of all files touched.
4. **Build result** (green / red / error).
5. **Status** (done / blocked / failed).
6. **Overall progress** — `N / M prompts complete (P%)`.
   Include counts: `done: X, blocked: Y, failed: Z, remaining: W`.
7. **Design-system review handoff** — if the prompt created or updated
   `docs/design-system/review/index.html`, include:
   - absolute or repo-relative path to the HTML artifact
   - Mobbin/Figma/product/platform/free-reference URLs or file paths that
     appear in the artifact
   - one explicit question asking the user for visual-review feedback
     before dependent screen-level prompts proceed
8. If status is `done`:
   `"Prompt complete. Say **Continue** to proceed to the next prompt. If starting a new chat, paste exactly: **Continue where you left off. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.**"`
   If status is `blocked` or `failed`:
   `"Prompt [status]. [One-line explanation]. Say **Continue** to skip
   to the next prompt, or provide guidance. If starting a new chat, paste exactly: **Continue where you left off. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first.**"`

**Wait for the user to say "Continue".** Do NOT auto-advance.

Do **NOT** attempt to execute multiple prompts in one turn or suggest a "Continue N" loop. Context overflow is the primary cause of AI steering off-track and hallucinating code. After executing one prompt, updating the codebase, and writing the status to `execution-log.md`, you must fully stop and strongly recommend the user start a new chat for the next task.

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

### Harness-Diagnosis pipeline (run on every test/build failure)

A test or build-gate failure is **not** automatically a `failed` task.
Simulators crash. ADB servers go offline. Vite caches corrupt. Many
"failures" are harness issues that resolve with a deterministic
recipe; some are genuine code crashes the catalog already knows how
to patch. Both cases must NOT cost the user a wasted re-run later.

Before marking a task `failed`, invoke the diagnosis pipeline:

```bash
bash .ai-prompts/scripts/diagnose-harness.sh \
    --task <current task filename> \
    --exit-code <captured exit code> \
    --stderr <path to captured stderr> \
    --output prompts/outputs/current/harness-diagnosis.json
```

The script auto-detects the stack from the task's `**File:**` paths
(or you can pass `--stack ios|android|web|flutter|bash` explicitly),
matches stderr against
`.ai-prompts/prompts/modules/harness-recovery/<stack>.yaml`, writes
the structured `harness-diagnosis.json`, and returns one of four
exit codes that drives the executor:

| Exit | Meaning | Executor action |
|---|---|---|
| 0 | `not_crashed` — real test logic failure | Mark task `failed` exactly as today. Surface the test output to the user. |
| 1 | `harness_crash` — recipe applied successfully | Re-run the same task EXACTLY ONCE. Do not modify code; the harness is now healthy. |
| 2 | `code_crash_known` — structured `code_fix` in JSON | Read `remediation.code_fix` from the JSON. Apply the patch conservatively (read the named file, derive the value from the task's feature spec as the catalog hints, do not invent generic copy). Re-run the task EXACTLY ONCE. |
| 3 | `code_crash_unknown` — no recipe and no catalog match | Mark task `blocked` with `remediation.evidence.report_paths` and `remediation.evidence.key_lines` copied into the journal entry. The user reviews. |

**Loop protection.** The dispatcher reads `harness_recoveries` in
`execution-log.md` and refuses to recover twice within the same task.
A second crash of the same signature in the same task forces exit 3
(blocked) regardless of catalog match. This is non-negotiable.

**Conservative code-fix discipline.** When the JSON says
`remediation.type == "code_fix"`, you (the AI executor) apply the
patch — the script never edits source files itself. Two hard rules:

1. The patch must be confined to the file in `remediation.code_fix.file`.
   Do not edit unrelated files because the catalog hint is vague.
2. The value the patch inserts (e.g. usage-description copy, runtime
   permission rationale) must come from the **task's feature spec**.
   Never use generic strings like `"App needs camera"`. If the spec
   doesn't specify the copy, leave the patch unapplied and surface
   the JSON to the user — better to block than to commit a fix that
   reverts the task's intent.

**Record the recovery in the envelope.** Whether a recipe ran or a
code-fix was applied, append an entry to `execution-log.md`:

```yaml
harness_recoveries:
  - task: tasks-<feature-or-gap>.md
    classification: <id from catalog>
    action: recipe | code_fix
    result: recovered | escalated | blocked
    at: <ISO 8601 timestamp>
```

So flake patterns become visible across sessions. The
`Selective Disk-State Loading` guard in the entry point already
reads this list (via `execution-log.md` envelope) so a resumed
session knows where the last recovery happened.

See `.ai-prompts/prompts/modules/harness-recovery/README.md` for
the catalog schema and per-stack details.

### Auto-commit pipeline (run after every task that goes done)

The library produces atomic tasks; the executor must produce atomic
commits. Without auto-commit, a 50-task run leaves the user with a
single uncommitted blob and the burden of inferring the boundary
between tasks. With auto-commit, every successful task is one
reviewable commit on the branch.

After build-gate is green and acceptance bullets are verified, but
BEFORE writing the log entry / checkpoint, run:

```bash
# 1. Validate diff scope.
bash .ai-prompts/scripts/safety-check-commit.sh \
    --task <current task filename> \
    --report .ai-prompts/safety-report.json

# 2. Commit only if exit 0.
bash .ai-prompts/scripts/commit-task.sh \
    --task <current task filename> \
    --change-line "<one-liner you would have written into execution-log Change made>" \
    --safety-report .ai-prompts/safety-report.json
```

The safety check enforces two invariants that protect the user from
silent damage:

1. **Scope drift.** Every modified file must appear in the task's
   `**File:**` lines OR in `path-ledger.md`. Engine-output artifacts
   (`execution-log.md`, `resumption-checkpoint.md`, `path-ledger.md`,
   `harness-diagnosis.json`, `revise-report.md`, `delivery-order.md`)
   are always allowed.
   Anything else triggers a warning — the executor includes the
   list in the commit's `Safety-Check:` trailer.
2. **Reverted logic.** If the diff deletes more than 80 lines AND
   the net deletion is more than 2× the additions, the safety check
   surfaces this as a warning. If the deletion includes files not
   in the task scope, it's a hard error (exit 1) — commit blocked,
   surfaced to user.

The commit message follows conventional-commits with the form:

```
<type>(<scope>): <subject>

Task: <task filename>
Safety-Check: <verdict> (warnings if any)
```

Type is inferred from the slug (`test`, `docs`, `fix` for
remediation, `feat` for tasks-*). Scope is derived from the task
slug. Subject is the executor's `Change made` one-liner.

**Push policy.** Auto-commit is NEVER auto-push. The executor only
pushes when:
- The user explicitly says "push" in chat, OR
- A gap/epic completes and `MY_PROJECT.md` declares `auto_push: true`
  for gap/epic boundaries.

Pushing per task would flood CI on every task and dilute the
review unit. Commits per task + push per gap is the right cadence.

**Failure mode.** If the safety check returns 1 (unsafe), do NOT
commit. Surface the report's `errors`/`warnings` to the user and
ask for guidance. The task journal entry records the verdict so the
audit trail is complete even when the commit didn't happen.

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
bash .ai-prompts/scripts/build-task-graph.sh prompts/outputs/current
bash .ai-prompts/scripts/validate-execution-order.sh prompts/outputs/current
bash .ai-prompts/scripts/validate-execution-envelope.sh prompts/outputs/current
```

The graph/order checks ensure the executor did not run dependents
before their declared prerequisites. The envelope script reads every
`tasks-*.md` / `remediation-*.md`, extracts
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
- `scripts/validate-ready-to-execute.sh` — the single pre-executor
  readiness gate this orchestrator refuses to run without.
- `scripts/validate-phase-order.sh` — phase/order contract gate
  invoked by the readiness/finalize flow.
- `scripts/validate-baseline-task-coverage.sh` — baseline-topic
  coverage gate invoked by the readiness/finalize flow.
- `scripts/validate-screenshot-matrix.sh` — app-store screenshot matrix
  gate invoked by the readiness/finalize flow when screenshot task files
  exist.
- `scripts/validate-instantiation.sh` — the lower-level instantiation
  validator invoked by the readiness/finalize flow.
- `scripts/build-path-ledger.sh` — emits the canonical-paths ledger
  the executor must consult before writing any source file.
- `scripts/build-gate.sh` — the after-each-task build-green gate.
- `scripts/diagnose-harness.sh` + per-stack scripts and
  `prompts/modules/harness-recovery/*.yaml` — the diagnosis pipeline
  the executor runs on every test/build failure before marking a
  task `failed`.
- `scripts/safety-check-commit.sh` + `scripts/commit-task.sh` — the
  per-task auto-commit pipeline with scope and revert-protection
  invariants.
- `scripts/validate-execution-envelope.sh` — the honest-handoff gate
  that refuses `next_task: null` when files are missing without a
  blocked/failed/deferred entry.
