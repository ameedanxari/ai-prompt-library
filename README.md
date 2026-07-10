# AI Prompt Library

A prompt library that turns a short project brief into a set of atomic,
implementation-ready tasks — designed to run on **small context windows**
so a lower-end coding model can build production software one task at a
time without needing the whole project in context.

The library offers two engines, picked automatically based on what you ask:

**Greenfield — `drill-down-engine.md`** (new project from a brief)
1. **Seed** — user brief → 5–7 epics.
2. **Features** — each epic → 6–10 features with data model + API contract.
3. **Tasks** — each feature → atomic tasks (real file, real signature,
   real API shape).

**Gap-closure — `audit-and-remediate.md`** (existing codebase needs
review / finishing / productionizing)
1. **Component audit** — what exists, what works, what is broken.
2. **Gap list** — ordered by severity, with dependencies.
3. **Remediation tasks** — atomic tasks pointing at real existing files.

Each step runs in its own context, so token cost stays flat as the
project grows. A finalize/readiness gate builds typed artifacts
(`task-contract.json`, delivery order, phase order, baseline coverage,
design review checkpoints) and blocks the executor on any schema or
ordering violation. The executor then writes real code, runs tests,
and logs progress.

```
 brief           ──────────► external-input-handler (if reference material)
   │                                        │
   ▼                                        ▼
 drill-down-engine  /  audit-and-remediate ─► epics + features + tasks + external-accounts
                           (one context per step)
                                            │
                                            ▼
                                   finalize + readiness gate
                                   (executor_gate: pass|fail)
                                            │
                              pass ─────────┴───────── fail (regen once, else stop)
                                            │
                                            ▼
                                       executor
                                (code + tests + execution-log.md)
```

---

## Quick start

**→ See [`QUICK_START.md`](QUICK_START.md) for the single copy-paste
prompt.** Paste it into any agentic AI chat inside an empty folder, answer
one question, and the library handles everything else — installation,
project scaffolding, planning, and implementation.

If you want the manual path instead, use one of these install modes.

**Git submodule (recommended for app projects):**

1. `git submodule add https://github.com/ameedanxari/ai-prompt-library .ai-prompts`
2. `bash .ai-prompts/scripts/bootstrap-project-integration.sh` — creates
   `AGENTS.md`, copies `MY_PROJECT.md` from the template, wires IDE
   steering.
3. Edit `MY_PROJECT.md` — fill in the **Brief** (only required field).
   Leave everything else blank to get the production-readiness defaults
   (web + Android + iOS, auth + admin, i18n, a11y, tests, CI/CD, etc.).
4. In your AI chat: "Read `.ai-prompts/prompts/AGENTS.md` and
   `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`, follow
   its routing, do not stop between steps."

**npm package (useful for CI, validators, and API consumers):**

```bash
npm install --save-dev ai-prompt-library
ln -sfn node_modules/ai-prompt-library .ai-prompts
bash .ai-prompts/scripts/bootstrap-project-integration.sh
npx ai-prompt-ready prompts/outputs/current
```

The package expects Node.js 20+, npm, Python 3, and Bash. The npm
install publishes the prompt library, shell validators, and typed
task-contract API. The `.ai-prompts` symlink keeps the agent-facing
paths identical to the submodule flow while `npx` exposes the
mechanical gates.

Programmatic task-contract example:

```js
import { buildTaskContractReportForDirectory } from 'ai-prompt-library/task-contract';

const report = buildTaskContractReportForDirectory('prompts/outputs/current');
console.log(report.summary);
```

CLI bins:

| Command | Purpose |
|---|---|
| `npx ai-prompt-ready [target-dir]` | Runs the full pre-executor readiness gate. |
| `npx ai-prompt-finalize [target-dir]` | Repairs mechanical schema aliases, rebuilds ledgers/contracts, and runs revise. |
| `npx ai-prompt-build-task-contract [target-dir]` | Writes `task-contract.json` from task files. |
| `npx ai-prompt-validate-task-contract [target-dir]` | Validates task schema, dependencies, phases, paths, and tests. |
| `npx ai-prompt-validate-phase-order [target-dir]` | Writes and validates `phase-order-report.md`. |
| `npx ai-prompt-validate-baseline-task-coverage [target-dir]` | Writes and validates scoped production baseline coverage. |
| `npx ai-prompt-validate-user-review-checkpoints [target-dir]` | Enforces design review checkpoints before dependent UI work. |
| `npx ai-prompt-validate-screenshot-matrix [target-dir-or-file]` | Validates app-store screenshot task matrices across locale, device, and frame axes. |
| `npx ai-prompt-validate-ui-reference-source-map <file>` | Validates UI reference source-map rows and non-copy boundaries. |
| `npx ai-prompt-generate-design-review <source-map> <output-html>` | Generates the design-system review HTML artifact. |
| `npx ai-prompt-validate-design-review <html> [source-map]` | Validates design-review HTML structure and source-map traceability. |
| `npx ai-prompt-validate-resumption-checkpoint <file>` | Validates selective context reload checkpoints. |
| `npx ai-prompt-validate-release-readiness [repo-root]` | Checks package metadata, docs examples, bin executability, and npm pack dry-run contents before tagging or publishing. |
| `npx ai-prompt-repair-task-schema-fields [target-dir]` | Normalizes explicit task-card field aliases before validation. |
| `npx ai-prompt-validate-instantiation [target-dir]` | Runs the broad plan instantiation validator. |

---

## What the agent will do

Given the brief in `MY_PROJECT.md`, the agent runs a 7-stage pipeline
and produces these files under `prompts/outputs/current/`:

| Stage | Output | Role |
|---|---|---|
| External-input (if `working_copy/` has files) | `project-context.md` | Entities, roles, flows, constraints extracted from your designs/specs/code |
| Seed | `epics.md` | 5–7 feature epics + ~12 production-readiness baseline epics (auth, admin/RBAC, observability, i18n/RTL, theming/whitelabel, a11y, tests, CI/CD, IaC, app-store, debug, privacy) |
| Seed | `brief-keywords.md` | Distinctive keywords from your brief mapped to epics (covered) or scoped out (out-of-scope). Prevents silent dropout of specific requirements — validator check 0d. |
| Expand | `features-<epic>.md` | One per epic, with concrete data models and API contracts |
| Expand | `ui-reference-source-map.md` | Conditional artifact for greenfield UI-heavy products with no supplied Design Context. Converts research/reference categories into product-specific component, token, state, responsive, accessibility, and non-copy decisions. |
| Services roll-up | `external-accounts.md` | Every third-party service the project touches — signup URL, env vars, free-tier notes, production caveats |
| Atomize | `tasks-<feature>.md` | Atomic tasks. Each names a real file, exactly one file path, a real function signature, a change type (`create-new` / `edit-existing` / `delete`), a precise change, ≥3 verifiable acceptance criteria, a named test, and a `Depends on` line with reason. Every task closes a user story (`As a ... I want ... so that ...`). |
| Finalize | `task-schema-repair-report.md` | Records conservative field-alias repairs before validation. |
| Finalize | `path-ledger.md`, `delivery-order.md` | Authoritative file ownership and phase-aware task order. |
| Finalize | `task-contract.json`, `task-graph.json` | Typed task contract, dependency graph, path claims, and blocking contract issues. |
| Finalize | `phase-order-report.md`, `baseline-task-coverage.md`, `user-review-checkpoints.md` | Deterministic checks for lifecycle order, scoped baseline topics, design-review approval before dependent UI work, and screenshot matrices when present. |
| Validate | `revise-report.md`, `ready-to-execute-report.md` | Final gate reports. `executor_gate: pass` and `ready_to_execute: true` mean execution is cleared. |
| Execute | `execution-log.md` | Per-task journal + YAML handoff envelope (session_id, next_task, blocked, failed, test suite state). Any new session resumes from this envelope alone. |

**Mechanical gates:** `scripts/finalize.sh` is the canonical
post-planning gate. It runs task schema repair, path ledger generation,
delivery order generation, task-contract validation, task graph
generation, phase/order validation, baseline coverage validation,
user-review checkpoint validation, screenshot matrix validation when
screenshot task files exist, and the revise gate. The executor
preflight runs `scripts/validate-ready-to-execute.sh`, which wraps
finalize and writes `ready-to-execute-report.md` with machine-readable
`blocking_artifacts`, `blocking_issues`, and `recommended_step`
frontmatter fields.

`scripts/validate-instantiation.sh` remains the broad template and
plan-shape validator. It refuses to pass when template leaks,
placeholders, tautological acceptance, directory-as-file-path,
multi-file collapse, missing external-accounts, missing reports,
missing brief-keywords coverage, missing task fields, invalid UI
reference citations, or a failing `executor_gate` are present.

**Executor-side safeguards** (added after a field test on a
StorageCleaner build uncovered three failure modes the planning gates
could not see):

- **Canonical-paths ledger** (`scripts/build-path-ledger.sh`) — emits
  `path-ledger.md` alongside `revise-report.md`. The executor reads
  it before every file write; if the path it is about to create is
  not in the ledger, it stops rather than invent a new folder tree.
  Catches the "`filter/` vs `filters/`" duplicate-class pattern at
  plan time rather than compile time.
- **Build-green gate** (`scripts/build-gate.sh`) — runs a cheap
  whole-project compile check after every task (`:app:compileDebugKotlin`,
  `xcodebuild build`, `npm run typecheck` / `tsc --noEmit`,
  `py_compile`, `go build`). A task whose unit test passes but whose
  change breaks the project compile is `failed`, not `done`.
- **Honest handoff envelope** (`scripts/validate-execution-envelope.sh`)
  — checks every plan `T<n>/R<n>` against both the disk and the
  envelope's `blocked`/`failed`/`deferred` lists before allowing
  `next_task: null`. Any task with no file on disk and no excuse is a
  silent skip; the executor cannot declare the run complete until
  each one is either executed or explicitly marked.

## Completion semantics

The library treats completion as a set of independent dimensions, not
one product-facing word. A run can be planning-complete or
artifact-complete while still lacking production-flow verification or
release readiness.

| Dimension | Meaning |
|---|---|
| Planning | The engine produced instantiated plan files and the revise gate passed. |
| Artifact accounting | Every declared `File:` path exists or is explicitly blocked, failed, or deferred. |
| Fixture verification | Fixture or harness evidence passed for the declared fixture graph. |
| Production verification | Required production composition roots and primary flows passed their evidence gates. |
| Partial / blocked state | Blocked, failed, deferred, or unresolved external tasks remain visible. |
| Release readiness | Machine-readable release and promotion gates passed. |

`next_task: null` means only that no locally runnable task remains. It
does not imply verified production behavior, release readiness, store
approval, external-account completion, or human-review approval. Older
path-only reports should be interpreted as artifact accounting evidence
only. When unresolved blockers remain, the handoff state is `partial`
or `blocked`; the executor must not collapse that state into bare
product completion.

**Stage guard during Step 3:** `scripts/step3-progress.sh` scans the
features files on disk and lists every feature with `[x]` (tasks file
present) or `[ ]` (still missing). The engine consults it between
task-file writes so it never jumps to the next stage while any
feature remains unplanned — the disk is the source of truth, not the
agent's memory.

**Steering guard:** a short IDE-level rule (auto-deployed to
`.kiro/steering/`, `.cursor/rules/`, `.windsurf/rules/`,
`.vscode/ai-steering/`, `.continue/rules/`) tells the agent that when
your prompt contains execute-signal words ("fix", "implement", "close
the gaps", "write the tests", etc.), it should not output an A/B/C/D
preference menu — you already authorised the run.

---

## Who this is for

- A non-technical user who wants to turn an idea into a concrete,
  ordered task list without having to design the architecture themselves.
- A lower-end coding model (SWE 1.6-class) asked to implement one task at
  a time — each task is small enough to fit a modest context window.
- Engineers who want an opinionated scaffold for turning vague briefs
  into atomic work items.

---

## What this is NOT

- Not a code generator. The library produces specs/tasks; the implementing
  model writes the code.
- Not a substitute for code review, security review, or SRE discipline.
  Producing atomic, spec'd tasks does not by itself make the resulting
  software enterprise-grade; a reviewer still needs to check what the
  implementing model actually wrote.
- Not a runtime or a harness. The 3-step isolation is a prompt-level
  contract, not an enforced subprocess boundary.

---

## Key files

| File | Purpose |
|---|---|
| `QUICK_START.md` | The single copy-paste prompt for non-technical users. |
| `MY_PROJECT.md.template` | Brief template. Only **Brief** is required. |
| `prompts/AGENTS.md` | Single source of truth for AI agents. Read this first. |
| `prompts/steering/library-context.md` | Auto-deployed to IDE steering dirs. Carries the execute-signal guard. |
| `prompts/orchestrators/ai-agent-entry-point.md` | Routes every request into one of four modes. |
| `prompts/orchestrators/drill-down-engine.md` | Greenfield engine: Seed → Features → Tasks. |
| `prompts/orchestrators/audit-and-remediate.md` | Gap-closure engine: Audit → Gaps → Remediation. |
| `prompts/orchestrators/executor.md` | Runs the plan against real code. Maintains `execution-log.md` with handoff envelope. |
| `prompts/orchestrators/revise-outputs.md` | Nine coverage + schema checks on engine outputs. Regenerates failures once; blocks the executor if still failing. |
| `prompts/orchestrators/baseline-task-shapes.md` | Per-topic schema rules for the 12 baseline epics (enforces per-locale × per-device screenshots, per-platform auth tasks, etc.). |
| `prompts/orchestrators/external-input-handler.md` | Runs first when user supplies designs/specs/code. |
| `prompts/orchestrators/module-selection-index.md` | Intent → single-module lookup. |
| `prompts/orchestrators/self-maintain.md` | Runs the library's engines on the library itself (maintainer tool). |
| `prompts/modules/` | Load-on-demand domain modules. Engine loads the relevant module during expansion instead of carrying every capability in one prompt. |
| `src/task-contract/` | Typed parser/report API for task files, dependency graphs, phases, path claims, and package consumers. |
| `scripts/validate-instantiation.sh` | Mechanical validator. Refuses to pass on template leaks, schema violations, missing companions, missing brief-keyword coverage, or failing revise gate. |
| `scripts/revise.sh` | Wraps the validator and writes `revise-report.md` with YAML frontmatter. Canonical producer — never hand-write the report. |
| `scripts/step3-progress.sh` | Disk-derived checklist of features vs. task files. Engine consults between task-file writes to avoid jumping stages on memory. |
| `scripts/finalize.sh` | **Mandatory post-Step-3 command.** Runs schema repair, ledgers, task contract, task graph, phase/order, baseline, user-review checkpoints, screenshot matrices, and revise. Agents cannot declare the drill-down complete without seeing `executor_gate: pass` from this script. |
| `scripts/validate-ready-to-execute.sh` | Executor preflight. Wraps finalize and writes `ready-to-execute-report.md`. |
| `scripts/build-task-contract.sh` | Writes `task-contract.json` using the TypeScript task-contract implementation. |
| `scripts/validate-task-contract.sh` | Validates task-card schema, dependency graph, phases, file paths, test markers, and duplicate path claims. |
| `scripts/build-delivery-order.sh` | Writes `delivery-order.md` from the task contract. |
| `scripts/build-task-graph.sh` | Writes `task-graph.json` from the task contract. |
| `scripts/validate-phase-order.sh` | Writes `phase-order-report.md` and blocks phase inversions or mixed-phase task files. |
| `scripts/validate-baseline-task-coverage.sh` | Writes `baseline-task-coverage.md` and enforces scoped production-readiness topics. |
| `scripts/validate-user-review-checkpoints.sh` | Writes `user-review-checkpoints.md` and blocks dependent UI work from bypassing design review. |
| `scripts/validate-screenshot-matrix.sh` | Validates app-store screenshot task matrices: tooling tasks, locale × device × frame coverage, concrete PNG paths, verifier commands, and localized-copy acceptance. |
| `scripts/validate-ui-reference-source-map.sh` | Validates UI source-map evidence, MAP rows, non-copy boundaries, category drift, states, and escaped-pipe tables. |
| `scripts/generate-design-system-review-artifact.sh` | Generates `docs/design-system/review/index.html` from a UI reference source map. |
| `scripts/validate-design-system-review-artifact.sh` | Validates design-review HTML and source-map traceability. |
| `scripts/validate-resumption-checkpoint.sh` | Validates selective context reload checkpoints. |
| `scripts/validate-release-readiness.sh` | Pre-tag / pre-publish package gate for metadata, docs examples, executable bins, and npm pack dry-run contents. |
| `scripts/repair-task-schema-fields.sh` | Normalizes explicit task-card field aliases and mechanical shorthands before validation. |
| `scripts/build-path-ledger.sh` | Emits `path-ledger.md` — the one authoritative list of every `**File:**` path the plan owns. Detects collisions (same path under two tasks; same source basename under two directories of the same role). Executor consults before writing any source file. |
| `scripts/build-gate.sh` | After-each-task compile gate. Auto-detects Gradle / xcodebuild / Node / Python / Go and runs the cheapest compile-only check for each. Stops a task from being marked done when its unit test passes but the whole project stops compiling. |
| `scripts/validate-execution-envelope.sh` | Honest-handoff gate. Refuses `next_task: null` when plan tasks have no file on disk and no entry in `blocked_tasks` / `failed_tasks` / `deferred_tasks`. Catches silent skips. |
| `scripts/fix-user-stories.sh` | Auto-fixer for the mechanical "missing comma before 'so that'" pattern in `Closes user story` lines. Idempotent. |
| `scripts/scaffold-screenshot-captures.sh` | Generates the full app-store screenshot task matrix (2 tooling + locales × devices × frames captures) with canonical schema pre-filled, so weak models don't have to expand the matrix by hand. |
| `scripts/reset-integration.sh` | Force-reset for consumer projects (purges stale state, refreshes steering, rewrites `AGENTS.md`). |
| `docs/optional/` | Load-on-demand safeguard docs. |

---

## Tests

```bash
npm install
npm test
npm run validate:release
```

The suite includes property-based tests over every module, integration
tests for the library's internal structure, package metadata tests,
public entrypoint smoke tests, and validator coverage for the
mechanical gates. Treat `npm test` as the source of truth for the
current count.

Before cutting a new release tag, run `npm run validate:release` to
check package metadata, docs examples, and dry-run package contents.
Also run the acceptance probe — see
[`docs/acceptance-probe.md`](docs/acceptance-probe.md). Unit tests
cover the mechanical gates; the probe covers the top-level claim that
a low-end model can ship end-to-end from a one-paragraph brief.

---

## License

See `LICENSE`.
