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
project grows. A revise gate (nine coverage + schema checks) runs
after each engine and blocks the executor on any schema violation.
The executor then writes real code, runs tests, and logs progress.

```
 brief           ──────────► external-input-handler (if reference material)
   │                                        │
   ▼                                        ▼
 drill-down-engine  /  audit-and-remediate ─► epics + features + tasks + external-accounts
                           (one context per step)
                                            │
                                            ▼
                                   validator + revise gate
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

If you want the manual path instead:

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
| Services roll-up | `external-accounts.md` | Every third-party service the project touches — signup URL, env vars, free-tier notes, production caveats |
| Atomize | `tasks-<feature>.md` | Atomic tasks. Each names a real file, exactly one file path, a real function signature, a change type (`create-new` / `edit-existing` / `delete`), a precise change, ≥3 verifiable acceptance criteria, a named test, and a `Depends on` line with reason. Every task closes a user story (`As a ... I want ... so that ...`). |
| Validate | `revise-report.md` | Nine coverage + schema checks (C1–C9) plus brief-keyword coverage. Sets `executor_gate: pass` or `fail`. A failure regenerates the offending file once; if still failing, execution halts with a named `remaining_issues` list. Produced by `scripts/revise.sh`. |
| Execute | `execution-log.md` | Per-task journal + YAML handoff envelope (session_id, next_task, blocked, failed, test suite state). Any new session resumes from this envelope alone. |

**Mechanical gates:** `scripts/validate-instantiation.sh` runs at
multiple points and refuses to pass when template leaks, placeholders,
tautological acceptance, directory-as-file-path, multi-file collapse,
missing external-accounts, missing revise-report, missing
brief-keywords coverage, missing task `change_type` / `Test` /
reasoned `Depends on`, or a failing `executor_gate` are present. The
executor's preflight runs this same validator and refuses to start on
a red gate.

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
| `prompts/modules/` | 266 dissolvable templates by domain. Engine loads one per expansion. |
| `scripts/validate-instantiation.sh` | Mechanical validator. Refuses to pass on template leaks, schema violations, missing companions, missing brief-keyword coverage, or failing revise gate. |
| `scripts/revise.sh` | Wraps the validator and writes `revise-report.md` with YAML frontmatter. Canonical producer — never hand-write the report. |
| `scripts/step3-progress.sh` | Disk-derived checklist of features vs. task files. Engine consults between task-file writes to avoid jumping stages on memory. |
| `scripts/reset-integration.sh` | Force-reset for consumer projects (purges stale state, refreshes steering, rewrites `AGENTS.md`). |
| `docs/optional/` | Load-on-demand safeguard docs. |
| `docs/rewrite-history/` | Historical reports from the rewrite. |

---

## Tests

```bash
npm install
npm test
```

The suite includes property-based tests over all 266 modules, integration
tests for the library's internal structure, and the instantiation
validator. 944 tests pass; 4 are known-failing against the Template
Architecture Guard (pre-existing, unrelated to the new engine).

Before cutting a new release tag, also run the acceptance probe —
see [`docs/acceptance-probe.md`](docs/acceptance-probe.md). Unit
tests cover the mechanical gates; the probe covers the top-level
claim that a low-end model can ship end-to-end from a one-paragraph
brief.

---

## License

See `LICENSE`.
