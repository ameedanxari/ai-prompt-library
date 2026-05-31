# Quick Start

## The single prompt (copy this into an AI chat on an empty folder)

Open an agentic AI chat — **Claude Code, Cursor, Windsurf, Kiro,
Continue, Aider, etc.** — inside the folder you want to build your
project in, and paste exactly this:

---

```
Hey AI — set up a new project for me using the AI Prompt Library.

Do the following, in order. At each checkpoint (marked ⏸), stop and
show me a summary of what was just completed, then wait for me to say
"Continue" before proceeding. If a step is already done, skip it.

1. Initialize git if needed. If ".git/" does not exist in this folder,
   run: git init

2. Install the AI Prompt Library. If ".ai-prompts/" does not exist, run:
     git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
     git submodule update --init --recursive
   If ".ai-prompts/" already exists, run:
     git submodule update --remote .ai-prompts

3. Run the bootstrap script. This creates AGENTS.md, MY_PROJECT.md from
   the template, and wires steering files for whichever IDE I'm using:
     bash .ai-prompts/scripts/bootstrap-project-integration.sh

4. ⏸ Ask me exactly ONE question, then wait for my answer:

     "In a paragraph (or less), what do you want to build?
      Be as vague or specific as you like — 'a music app like Spotify
      but with crypto payments', 'a todo app for small teams',
      'a medical records system for dentists'. I'll fill in everything
      else with industry-standard defaults."

   When I answer, fully customize MY_PROJECT.md by acting as an
   experienced product owner and solutions architect:

   a. Put my paragraph under the "Brief (required)" section.
   b. Read my brief carefully and fill in EVERY other section that
      can be inferred. The template is a master list of possibilities —
      your job is to compose a coherent, project-specific spec:
      - **Product identity:** infer a stable product name, short name,
        bundle IDs / package IDs, store listing title, and default
        locale. If I provide a bundle-id base like "use com.example",
        apply it consistently to iOS and Android IDs.
      - **Platforms:** infer from the brief (e.g. "native android and
        ios" → Android, iOS only — do NOT default to web+Android+iOS
        when the brief specifies otherwise).
      - **Tech preferences:** infer stack choices from the brief
        (e.g. "on-device AI" → Core ML + ML Kit, not cloud services).
      - **Users / roles:** infer from the product concept.
      - **Constraints:** extract explicit and implicit constraints
        (e.g. "no network access for user data" → privacy constraint).
      - **Restrict:** list baseline topics that genuinely don't apply
        to this project (e.g. Admin & RBAC for a single-user local
        app, Infrastructure as Code for a no-backend app).
      - **Non-goals:** infer what the product is NOT.

   Do NOT ask me additional questions about platforms, tech, roles,
   constraints, or non-goals. Infer them from my brief. If something
   is genuinely ambiguous, make a sensible default and note it in the
   file — I'll correct it at the first checkpoint if needed.

5. Check whether I dropped anything into working_copy/. If that folder
   exists and has files, the engine will read them as authoritative
   reference material (designs, mockups, specs, brand). If not, skip.

6. Run the PLANNING phase. Read .ai-prompts/prompts/AGENTS.md and
   .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md, then
   follow the entry point's routing. The engine will:

   a. ⏸ Generate epics — feature epics from my brief PLUS a
      production-readiness baseline. Show me the epics and wait.
   b. ⏸ Expand each epic into features — with data models, API
      contracts, and external services. Show me a summary and wait.
   c. ⏸ Expand each feature into atomic task prompts — each task
      is a complete, standalone instruction for an AI to implement
      one piece of the project. Show me progress after each epic’s
      worth of tasks and wait.
   d. ⏸ Run the finalize/readiness gate. Report the result and STOP.

   The output of planning is a checklist of high-quality task prompts
   under prompts/outputs/current/tasks-*.md. Each prompt contains the
   exact file to create, the exact function signature to write, what
   the code must do, and 3+ testable acceptance criteria.

   Only stop planning if a hard blocker appears (ambiguous requirement
   that needs my decision, or the finalize/readiness gate fails).

7. Run the EXECUTION phase (only after I approve the plan). When I
   say "Execute" or "Continue" after the planning summary:

   Read .ai-prompts/prompts/orchestrators/executor.md and execute
   each task prompt one at a time:
   - Read the task prompt from tasks-*.md.
   - Write the actual code as instructed by the prompt.
   - Run the test specified in the prompt.
   - Log the result in execution-log.md.
   - ⏸ Report what was done (file, test result, acceptance) and wait.

   This is the task checklist. Each task gets ticked off as it
   completes. If I say "Continue 5", run 5 tasks before the next
   checkpoint.

   Only stop execution if: a test regression appears, 3+ tasks
   block consecutively, external credentials are needed, or I
   interrupt.

8. When everything is done, report to me:
   - Every file under prompts/outputs/current/ with a one-line purpose.
     Expect: project-context.md (optional), epics.md, brief-keywords.md,
     features-*.md, external-accounts.md, tasks-*.md,
     task-schema-repair-report.md, path-ledger.md, delivery-order.md,
     task-contract.json, task-graph.json, phase-order-report.md,
     baseline-task-coverage.md, user-review-checkpoints.md,
     revise-report.md, ready-to-execute-report.md, execution-log.md.
   - A tree of what got created in the app (src/, backend/, frontend/,
     android/, ios/, infrastructure/).
   - One command I can run to start the app locally.
   - One command I can run to run the tests.
   - A list of any external keys/accounts I need to create (Stripe,
     Firebase, AWS, etc.), with a one-line "where to get it" for each.
     This comes from external-accounts.md — don't re-invent it.
   - A short summary from execution-log.md: how many tasks done, how
     many blocked on external credentials, which tests are green/red.

Start now.
```

---

## What happens after you paste

1. The agent runs shell commands for ~10 seconds — setup.
2. The agent asks you **one** question: "What do you want to build?"
3. Answer in a sentence or a paragraph. Vague is fine.
4. The agent starts the **planning phase** and stops at each
   checkpoint (⏸) to show you what it produced:
   - Epics → Features → Task prompts → Finalize/readiness gate.
   - Say "Continue" at each checkpoint to advance.
   - If something looks wrong, give feedback and the agent adjusts.
5. After the readiness gate passes, the agent shows you the full task
   checklist and asks you to say "Execute" to begin building.
6. The agent enters the **execution phase**, implementing one task
   at a time. After each task it shows you the result and waits.
   Say "Continue" to advance, or "Continue 5" to batch.
7. If the IDE closes or context runs out, start a new session and
   say "Continue where you left off" — the agent picks up from
   `execution-log.md`.

## NPM install alternative

The copy-paste prompt uses a git submodule because that gives agents a
stable `.ai-prompts/` path. For CI, validators, and package consumers
you can install from npm and keep the same path with a symlink:

```bash
npm install --save-dev ai-prompt-library
ln -sfn node_modules/ai-prompt-library .ai-prompts
bash .ai-prompts/scripts/bootstrap-project-integration.sh
npx ai-prompt-ready prompts/outputs/current
```

Prerequisites: Node.js 20+, npm, Python 3, and Bash.

Common `npx` commands:

| Command | Use |
|---|---|
| `npx ai-prompt-ready prompts/outputs/current` | Run the full pre-executor gate. |
| `npx ai-prompt-finalize prompts/outputs/current` | Rebuild all planning ledgers and run revise. |
| `npx ai-prompt-build-task-contract prompts/outputs/current` | Write `task-contract.json`. |
| `npx ai-prompt-validate-task-contract prompts/outputs/current` | Check task schema, dependencies, phases, paths, and tests. |
| `npx ai-prompt-validate-screenshot-matrix prompts/outputs/current` | Check app-store screenshot task matrix coverage. |
| `npx ai-prompt-generate-design-review prompts/outputs/current/ui-reference-source-map.md docs/design-system/review/index.html` | Generate the design review HTML artifact. |
| `npx ai-prompt-validate-design-review docs/design-system/review/index.html prompts/outputs/current/ui-reference-source-map.md` | Validate design review HTML against the source map. |
| `npx ai-prompt-validate-release-readiness .` | Check package metadata, docs examples, bins, and npm pack dry-run contents before release. |

Programmatic API example:

```js
import { buildTaskContractReportForDirectory } from 'ai-prompt-library/task-contract';

const report = buildTaskContractReportForDirectory('prompts/outputs/current');
console.log(report.summary.blocked);
```

## Expected output layout

After a successful run, `prompts/outputs/current/` contains:

| File | Who writes it | What it's for |
|---|---|---|
| `project-context.md` | external-input-handler (if you dropped files in `working_copy/`) | Extracted entities, roles, flows, constraints |
| `epics.md` | drill-down Step 1 | 5–7 feature epics + ~12 production-readiness baseline epics |
| `brief-keywords.md` | drill-down Step 1 | Distinctive keywords from your brief mapped to epics or scoped out — prevents silent dropout of specific requirements |
| `features-<epic>.md` | drill-down Step 2 | One per epic, with data models and API contracts |
| `ui-reference-source-map.md` | drill-down Step 2 | Conditional artifact for greenfield UI-heavy apps when no design files or existing theme were supplied |
| `external-accounts.md` | drill-down Step 2.5 | Every third-party service + signup URL + env vars (your to-do list) |
| `tasks-<feature>.md` | drill-down Step 3 | Atomic tasks — real file paths, signatures, acceptance criteria, named test, change type |
| `task-schema-repair-report.md` | `scripts/repair-task-schema-fields.sh` | Conservative field-alias repairs before validation |
| `path-ledger.md` | `scripts/build-path-ledger.sh` | Authoritative list of planned file paths |
| `delivery-order.md` | `scripts/build-delivery-order.sh` | Phase-aware execution order |
| `task-contract.json` | `scripts/build-task-contract.sh` | Typed task contract, path claims, and dependency graph inputs |
| `task-graph.json` | `scripts/build-task-graph.sh` | Machine-readable task dependency graph |
| `phase-order-report.md` | `scripts/validate-phase-order.sh` | Phase/order validation report |
| `baseline-task-coverage.md` | `scripts/validate-baseline-task-coverage.sh` | Scoped production baseline coverage report |
| `user-review-checkpoints.md` | `scripts/validate-user-review-checkpoints.sh` | Design review checkpoint ordering report |
| `tasks-*screenshots*.md` | `scripts/validate-screenshot-matrix.sh` | App-store screenshot matrix coverage when screenshot task files exist |
| `revise-report.md` | `scripts/revise.sh` | Coverage + schema check results. `executor_gate: pass` means the plan passed revise. `scripts/step3-progress.sh` is the in-progress checklist the agent runs between task-file generations. |
| `ready-to-execute-report.md` | `scripts/validate-ready-to-execute.sh` | Final pre-executor verdict. `ready_to_execute: true` means execution is cleared; failures include `blocking_artifacts`, `blocking_issues`, and `recommended_step`. |
| `execution-log.md` | executor | YAML handoff envelope + per-task journal |

You generally don't need to read these. The agent's final summary
tells you everything you need to act on (start command, test command,
external accounts to create). The files are there for the agent to
resume from — or for you to inspect if something goes sideways.

## If you want more control

The defaults in `MY_PROJECT.md.template` (web + Android + iOS + full
production-readiness baseline) are aggressive. If your project is
smaller in scope and you want the library to skip some of that, open
`MY_PROJECT.md` after step 3 and:

- List only the platforms you want under **Platforms** (e.g. "web
  only").
- List what to skip under **Restrict** (e.g. "Android", "iOS",
  "app store release prep", "i18n").
- Pin specific tech choices under **Tech preferences**.

Then tell the agent to continue — it will re-read `MY_PROJECT.md` and
apply your restrictions.

## If something goes wrong mid-run, or you need to resume

Paste this and the agent will pick up where it left off:

```
Continue where you left off. Read .ai-prompts/prompts/AGENTS.md and
.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first. The
entry point will detect current state from prompts/outputs/current/
and execution-log.md. Resume from the last checkpoint.
```

The agent will:
- If still in planning: resume task file generation from the progress
  script and present the next checkpoint.
- If in execution: read the `next_task` from `execution-log.md` and
  continue implementing from there.

## If you want to start completely fresh

Paste this:

```
Force reset everything library-related: purge any NEXT_ACTION.md,
PROJECT_STATE.md, IMPLEMENTATION_STATUS.md, or similar state files at
the project root; refresh the IDE steering files; clear
prompts/outputs/current/. Then run the Quick Start prompt again from
step 1.
```

## What works well vs. what doesn't (yet)

**Works well:**
- New CRUD apps with auth, database, and a REST API.
- Small-to-medium web apps (React, Next.js).
- Backends (Node / Python / Go) with clear data model.
- Mobile apps when you describe the screens up front.
- Adding features to an existing codebase (switch the prompt to "review
  this existing project and fix the gaps" — triggers gap-closure mode).

**Less well:**
- Projects whose core value is a novel algorithm or ML model — the
  library targets standard stacks with well-known patterns, not
  research.
- Pixel-perfect branded UI without mockups in `working_copy/` — the
  library produces plausible UI, not your specific brand.
- Very large existing codebases where the audit can't fit a fair
  sampling of every file into one context.
