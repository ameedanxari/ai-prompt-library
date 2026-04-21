# Changelog

All notable changes to the AI Prompt Library are documented in this file.

Format loosely follows [Keep a Changelog](https://keepachangelog.com/),
with versions tagged as `vMAJOR.MINOR.PATCH`.

## [v1.0.0] — 2026-04-16

First release where a low-end coding model (SWE 1.6-class) can take a
one-paragraph brief and ship production software end-to-end without a
human intervening between planning stages.

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
  (`prompts/orchestrators/module-selection-index.md`): 248 entries
  across 28 categories. Consulted at expansion time, not pre-loaded.
  Engine loads at most one module per expansion context.
- **Module catalog**: 266 dissolvable templates across domains
  (auth, payments, AI/ML, performance, accessibility, i18n, IaC,
  tech stacks, etc.).

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

- 944 passing tests (property-based over all modules, integration,
  unit tests over the instantiation validator, orchestrator schema
  tests).
- 141 unit tests specifically over `validate-instantiation.sh`.
- 4 known-failing tests against a legacy Template Architecture Guard
  (pre-existing, documented in `README.md`).

### Removed

- ~25 legacy auxiliary orchestrators (auto-setup, auto-routing,
  stage-pipeline, state-management, quality-gates, error-recovery,
  COVE, A/B testing, parallel-execution, self-healing,
  intelligent-caching, template-composition, etc.). All had drifted
  from the engine architecture.
- `prompts/stages/**` waterfall — kept only so legacy tests pass, but
  never auto-loaded. Deprecated banners on every file.
- Legacy state files (`PROJECT_STATE.md`, `EXECUTION_PROGRESS.md`,
  `DEVELOPMENT_LOG.md`, `NEXT_ACTION.md`, etc.). The engine uses only
  `MY_PROJECT.md` + `prompts/outputs/current/`.
- `asset-management` and `template-composition` legacy module clusters
  (7 files + meta-modules, never integrated).

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
failure modes. See `docs/rewrite-history/` for the detailed
engineering notes.
