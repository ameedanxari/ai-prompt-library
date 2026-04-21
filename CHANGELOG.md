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

- 735 passing tests, 0 failing (property-based over all modules,
  integration, unit tests over the instantiation validator,
  orchestrator schema tests).
- 141 unit tests specifically over `validate-instantiation.sh`.

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
failure modes. See `docs/rewrite-history/` for the detailed
engineering notes.
