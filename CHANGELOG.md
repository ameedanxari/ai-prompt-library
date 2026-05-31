# Changelog

All notable changes to the AI Prompt Library are documented in this file.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/),
with versions tagged as `vMAJOR.MINOR.PATCH`.

## [Unreleased] — executor-side safeguards

Field test on a StorageCleaner (native Android + iOS) brief exposed
three failure modes that the existing gates did not catch. The plan
was well-formed and the revise gate cleared, but the executor (SWE
1.6-class) still produced an unbuildable tree while reporting 167/167
tasks "done". This release adds three after-planning gates that close
the holes the previous gates were not in a position to see.

### Added — `scripts/build-path-ledger.sh`

Derives `prompts/outputs/current/path-ledger.md` from every
`**File:**` field in the plan. Refuses to pass when:

- **Collision A** — two tasks claim the same path (e.g. one task's
  `create-new` clashes with another's under the same file).
- **Collision B** — the same source-code basename is declared in two
  different directories of the same architectural role (e.g.
  `filter/AgeFilter.kt` + `filters/AgeFilter.kt`). Asset paths and
  legitimate `models/Foo.kt` + `services/Foo.kt` pairs are not flagged.

The executor is now required to consult the ledger before writing any
source file. That prevents the field-tested "executor invents
`filters/` partway through the run" failure mode, which produced 67
duplicate class files in the StorageCleaner run.

Wired into `finalize.sh` so the ledger is always fresh when the revise
gate clears, and into `drill-down-engine.md` Step 3 wrap-up prose.

### Added — `scripts/build-gate.sh`

After-each-task compile-only gate. Auto-detects every buildable stack
at the project root (Gradle, xcodebuild, Node/TypeScript, Python, Go)
and runs each stack's cheapest compile check. Exits 0 when every
detected stack compiles, 1 when any fails, 2 when no buildable stack
is found or a required tool is missing.

For Node projects, prefers project-declared `npm run typecheck` or
`npm run build` over bare `tsc --noEmit`, so projects that rely on
transpile-time type-checking (vitest, esbuild) are not forced into
strict-tsc without their consent.

The executor now runs the gate after each task. A task with a passing
unit test but a failing whole-project compile is `failed`, not `done`.
This is the single largest piece of leverage uncovered by the field
test — syntax errors, duplicate top-level declarations, and broken
imports all land under it.

### Added — `scripts/validate-execution-envelope.sh`

Honest-handoff gate. The executor cannot set `next_task: null` unless
every plan `T<n>/R<n>` either:

1. Has a file on disk at its declared `**File:**` path, OR
2. Is listed in the envelope's `blocked_tasks` / `failed_tasks` /
   `deferred_tasks`, with a matching journal entry.

Any task failing both is a "silent skip" — the executor produced no
file for it and did not report why. The script writes
`envelope-report.md` listing each silent skip with the slug and
declared path, grouped for easy remediation. This directly addresses
the StorageCleaner run's 374-task silent skip, where the envelope
reported 167/167 done while ~70% of planned files had never been
written.

### Changed — `scripts/finalize.sh`

Now a 3-step wrapper: auto-fixers → path ledger → revise gate. A
clean revise gate is promoted to `fail` when the ledger surfaces plan
collisions, so duplicate-path bugs do not slip past to the executor.

### Changed — library self-typecheck

Introduced `tsconfig.typecheck.json` and `npm run typecheck` (scoped
to `src/**` so pre-existing test-file type noise does not block the
gate the library itself dogfoods). Fixed one pre-existing `any` /
indexed-access error in `src/commerce-template-validator.ts` so
`build-gate.sh .` is green on the library's own repo.

### Notes

The library still does not enforce an app-shell preflight (Android
manifest + `res/` + launcher activity; iOS non-template root view);
integration tasks after per-file tasks; or a visible-output review
phase. Those remain planned extensions — the three gates shipped here
are the ones that would have prevented ~70% of the StorageCleaner
run's failures on their own.

## [v1.0.0] — 2026-04-22

First release where a low-end coding model (SWE 1.6-class) can take a
one-paragraph brief and ship production software end-to-end without a
human intervening between planning stages.

The pipeline, gates, and guards in this release are the result of
**six** field-test iterations on top of earlier rewrite rounds.
Each test surfaced specific weak-model gaming patterns — hand-written
revise reports, deleted baseline features, collapsed screenshot
matrices, multi-file `File:` fields, create-new collisions on shared
workflow files — which are now closed by mechanical validator checks
rather than prose guidance.

### Field-test-driven gate additions (v1.0.0)

- **Revise-report tamper detection** — `revised_at` must be within 48h
  of file mtime; `checks_passed` + `checks_failed` cannot both be
  empty (script always writes real check names).
- **Screenshot capture minimum** — `tasks-*screenshots*.md` requires
  ≥3 image-File tasks; collapse language in Acceptance (not just
  Precise change) triggers the collapse detector.
- **Orphan tasks** — every `tasks-<slug>.md` must map to a feature
  heading, with a tolerance exception for scaffolder-emitted
  `tasks-screenshots-{ios,android}.md`.
- **Per-baseline keyword coverage** — four baseline epics (App Store
  Release Prep, Privacy/PII & compliance, Testing & QA, CI/CD &
  release) are scanned for required-topic keywords so
  "delete features to game the gate" is impossible.
- **Multi-file `File:` rejection** — comma-separated backticked paths
  in the File field fail validation; each task writes exactly one file.
- **Create-new collision detection** — cross-file scan for multiple
  tasks declaring `Change type: create-new` on the same path; executor
  cannot process that state, so the gate refuses.
- **Dangling Depends-on** — every `tasks-<slug>.md` referenced in a
  Depends-on line must exist on disk.
- **N/A justification required** — `Test: N/A` and `Signature: N/A`
  without a parenthetical reason fail validation. Accepted shapes:
  `N/A (image asset)`, `N/A (GitHub UI configuration)`,
  `N/A (text metadata — length asserted in acceptance)`.

### Tooling added to prevent recurrence

- `scripts/finalize.sh` — the ONE mandatory post-Step-3 command.
  Chains `fix-user-stories.sh` + `revise.sh`; agents cannot declare
  complete without seeing `executor_gate: pass`.
- `scripts/fix-user-stories.sh` — mechanical auto-fixer for missing
  `, so that` commas. Idempotent.
- `scripts/scaffold-screenshot-captures.sh` — generates the full
  locale × device screenshot capture matrix with canonical schema
  pre-filled.

### Bootstrap + infrastructure fixes

- Validator's required-companion check for `revise-report.md` is
  skipped when called with `VALIDATOR_SKIP_GATE_CHECK=1`; without
  this, every first Step-3 finalize would fail forever.
- ADR pattern for N/A baseline epics added to
  `baseline-task-shapes.md` — local-only apps use
  `docs/adr/NNN-*.md` with Context/Decision/Alternatives/Consequences
  headings instead of stub `NoAdminPortal.kt` Kotlin objects.
- Canonical user-story form accepts `As <a|an|the> <role>, I
  <want|need> ...` so infrastructure tasks have legitimate
  stakeholders (`As the app`, `As the developer`, `As the
  maintainer`).

---

### Earlier (pre-final-delivery) work

The pipeline, gates, and guards in this release are the result of
thirteen field tests against low-end models. Each test surfaced a
specific failure mode; the fix for each is mechanical (a validator
check, a steering rule, a script) rather than prose guidance.

### Added — Engines

- **Drill-down engine** (`prompts/orchestrators/drill-down-engine.md`):
  greenfield 3-step flow. Seed → Expand → Atomize. Each step runs in
  isolated context.
- **Audit-and-remediate engine**
  (`prompts/orchestrators/audit-and-remediate.md`): gap-closure 5-step
  flow for existing codebases. Chains into the executor automatically
  when the user's prompt contains execute-signal words.
- **Executor** (`prompts/orchestrators/executor.md`): runs a validated
  plan against real code. Emits `execution-log.md` with a YAML handoff
  envelope at the top so any future session can resume without
  re-planning.
- **External-input handler**
  (`prompts/orchestrators/external-input-handler.md`): when the user
  drops designs/specs/code under `working_copy/`, extracts entities,
  roles, flows, and constraints into `project-context.md` before the
  engine runs.
- **Entry point** (`prompts/orchestrators/ai-agent-entry-point.md`):
  routes every request into Trivial / Execute / Gap-closure /
  Greenfield mode.

### Added — Mechanical gates

- **Validator** (`scripts/validate-instantiation.sh`): refuses to pass
  on template leaks, placeholders, tautological acceptance bullets,
  directory-as-file-path, multi-file collapse, missing
  `external-accounts.md`, missing `revise-report.md`, missing
  `brief-keywords.md`, missing task `change_type` / `Test` / reasoned
  `Depends on`, or a failing `executor_gate`.
- **Revise gate** (`scripts/revise.sh`): runs the validator, writes
  `revise-report.md` with YAML frontmatter and `executor_gate: pass|fail`,
  emits separate "failing files" vs "coverage gaps" lists and batch-size
  guidance when defects are high. Sets `VALIDATOR_SKIP_GATE_CHECK=1` to
  avoid a self-referential loop with the validator.
- **Executor preflight**: runs the same validator before the first task
  and refuses to start on a red gate.
- **Step 3 progress checklist** (`scripts/step3-progress.sh`):
  disk-derived checklist that the engine consults between task-file
  writes. Prevents the agent from jumping to the next stage on memory
  while features still have no `tasks-*.md`.

### Added — Schema enforcement

- **Task schema (both engines)**: each task names exactly one real file
  path, a real function signature, a `change_type`
  (`create-new` / `edit-existing` / `delete`), a `precise_change`,
  ≥3 verifiable acceptance bullets, a named `Test`, and a `Depends on`
  line that is either `none` or includes a reason. Drill-down and
  audit-and-remediate now share this shape — validator rejects drift.
- **Baseline task-shape rules**
  (`prompts/orchestrators/baseline-task-shapes.md`): per-topic
  requirements for the 12 production-readiness epics (per-locale ×
  per-device screenshots for app-store, per-platform auth tasks,
  localization completeness test, theming visual-regression test,
  explicit data-export and data-deletion tasks for privacy, etc.).
- **Brief-keyword coverage** (`brief-keywords.md`): mandatory companion
  to `epics.md`. Every distinctive keyword from the user's brief is
  mapped to an epic (`covered`) or explicitly scoped out
  (`out-of-scope`) with a reason. Validator check 0d enforces shape;
  revise gate cross-checks that no keyword has silently vanished.
- **User-story linkage**: every task closes a user story
  (`As a ... I want ... so that ...`). Revise gate check C7 flags
  orphans.

### Added — Module discoverability

- **Module selection index**
  (`prompts/orchestrators/module-selection-index.md`): 258 entries
  across 29 categories. Consulted at expansion time, not pre-loaded.
  Engine loads at most one module per expansion context.
- **Module catalog**: 252 dissolvable template files across 29
  domain categories (auth, payments, AI/ML, performance,
  accessibility, i18n, IaC, tech stacks, etc.).

### Added — Steering

- **Execute-signal guard**: auto-deployed to `.kiro/steering/`,
  `.cursor/rules/`, `.windsurf/rules/`, `.vscode/ai-steering/`,
  `.continue/rules/`. When the user's prompt contains words like
  "fix", "implement", "build", "close the gaps", the agent is
  forbidden from offering an A/B/C/D preference menu — the user
  already authorised end-to-end execution.
- **Progress-checklist guard**: steering rule that tells the agent to
  run `step3-progress.sh` between task-file writes and never advance
  while any feature is still `[ ]`.

### Added — Canonical artifacts

- `revise-report.md` and `execution-log.md` are machine-produced.
  First line is always `---` (YAML frontmatter fence). Validator
  rejects hand-written narrative look-alikes as "not the canonical
  form".

### Added — Tests

- 768 passing tests, 0 failing (property-based over all modules,
  integration, unit tests over the instantiation validator,
  orchestrator schema tests, helper scripts, finalize wrapper).
- 141 unit tests specifically over `validate-instantiation.sh`.
- `scripts/finalize.sh` — the mandatory one-command finisher for
  drill-down Step 3. Chains `fix-user-stories.sh` + `revise.sh`,
  writes the canonical `revise-report.md`, and exits with the
  gate verdict. Agents cannot declare the drill-down complete
  without seeing `executor_gate: pass` from this script. Closes
  the field-test failure where weak models skipped the Revise
  Gate entirely and declared "Successfully completed" on invalid
  plans.
- `scripts/fix-user-stories.sh` — mechanical auto-fixer for the
  common "missing comma before 'so that'" pattern in
  Closes-user-story lines. Idempotent. Invoked by finalize.sh;
  also referenced from the validator's error message.
- `scripts/scaffold-screenshot-captures.sh` — generates the full
  app-store screenshot task matrix (2 tooling + N locales × M
  devices captures) with the canonical task schema pre-filled.
  Closes the persistent field-test failure where weak models
  can't expand the locale × device matrix by hand.
- Validator bootstrap fix: on first Step 3 completion the
  validator no longer insists that `revise-report.md` already
  exists when called through revise.sh — revise.sh is the very
  thing that creates it, so the old requirement was a
  bootstrap paradox that forced every first-run gate to fail.
- ADR pattern for genuinely N/A baseline epics added to
  `baseline-task-shapes.md`. Local-only apps now have a
  principled way to declare admin-rbac or infrastructure-as-code
  not-applicable: a single ADR task under `docs/adr/NNN-*.md`
  with Context / Decision / Alternatives / Consequences — not
  a stub `NoAdminPortal.kt` Kotlin object.

### Removed

- ~25 legacy auxiliary orchestrators (auto-setup, auto-routing,
  stage-pipeline, state-management, quality-gates, error-recovery,
  COVE, A/B testing, parallel-execution, self-healing,
  intelligent-caching, template-composition, etc.). All had drifted
  from the engine architecture.
- **Legacy waterfall TypeScript engine** — the entire parallel
  implementation that ran the deprecated 10-stage pipeline in code:
  `stage-pipeline-controller`, `stage-pipeline-processor`,
  `state-manager`, `task-generator`, `task-generation-engine`,
  `validation-tools`, `error-recovery-system`, `quality-gate-system`,
  `output-directory-manager`, `documentation-traceability-system`,
  `archive-manager`, and seven prompt-scanning processors
  (`deployment-`, `quality-assurance-`, `self-maintenance-`,
  `functionality-preservation-`, `large-repetitive-changes-`,
  `build-command-`, `documentation-processor.ts`), plus their 20+
  tests. None were reachable from the v1.0 engine; all validated
  deprecated concepts (PROJECT_STATE.md, NEXT_ACTION.md, 10-stage
  prerequisites).
- **Legacy `prompts/stages/**`** — removed 9 of 10 stage directories
  (intake, charter, architecture, features, implementation, deployment,
  documentation, quality, handoff). Only `stage-05-testing/` remains,
  kept because three active template-validator processors reference
  it. No orchestrator or engine ever auto-loaded these.
- **Legacy `prompts/templates/**`** — removed 40 of 68 legacy templates
  that were unreferenced after the processor sweep, including every
  file referencing NEXT_ACTION.md, PROJECT_STATE.md, COVE, or a 10-stage
  pipeline (cove-quick-reference, cove-stage-integration,
  cove-verification-framework, cove-examples/\*, execution-phase,
  execution-progress-template, next-feature-orchestrator,
  project-state-files, project-state-tracking, stage-orchestration,
  stage-output-generation, state-management-orchestration,
  task-router, and others).
- Legacy state files (`PROJECT_STATE.md`, `EXECUTION_PROGRESS.md`,
  `DEVELOPMENT_LOG.md`, `NEXT_ACTION.md`, etc.). The engine uses only
  `MY_PROJECT.md` + `prompts/outputs/current/`.
- `asset-management` and `template-composition` legacy module clusters
  (7 files + meta-modules, never integrated).
- Remaining COVE inline references in `prompts/modules/ai-native/*.md`
  content files — rewritten to use generic "self-verification"
  language that doesn't depend on a removed orchestrator.

### Developer experience

- `QUICK_START.md`: one copy-paste prompt that handles bootstrap,
  installation, engine run, and executor handoff.
- `scripts/bootstrap-project-integration.sh`: one-shot setup in a
  consumer project — creates `AGENTS.md`, copies `MY_PROJECT.md` from
  template, deploys steering to the detected IDE.
- `scripts/reset-integration.sh`: force-reset for consumer projects —
  purges stale state files, refreshes steering, rewrites `AGENTS.md`.

---

## Pre-v1.0 history

Prior commits built up the module library, added tech-stack templates,
experimented with a waterfall pipeline, and collected field-test
failure modes. Historical rewrite notes were removed from the active
tree before the v1.0 package release to keep the library surface
focused on supported workflows.
