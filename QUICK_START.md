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

   When I answer, overwrite MY_PROJECT.md: put my paragraph under the
   "Brief (required)" section. Leave every other section of the template
   EMPTY — the library will auto-assume the defaults documented in that
   template (web + Android + iOS, production-readiness baseline, etc.).

   Do NOT ask me additional questions about platforms, tech, roles,
   constraints, or non-goals. The library infers those.

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
   d. ⏸ Run the revise gate. Report the result and STOP.

   The output of planning is a checklist of high-quality task prompts
   under prompts/outputs/current/tasks-*.md. Each prompt contains the
   exact file to create, the exact function signature to write, what
   the code must do, and 3+ testable acceptance criteria.

   Only stop planning if a hard blocker appears (ambiguous requirement
   that needs my decision, or the revise gate fails).

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
     Expect: project-context.md (optional), epics.md, features-*.md,
     external-accounts.md, tasks-*.md, revise-report.md,
     execution-log.md.
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
   - Epics → Features → Task prompts → Revise gate.
   - Say "Continue" at each checkpoint to advance.
   - If something looks wrong, give feedback and the agent adjusts.
5. After the revise gate passes, the agent shows you the full task
   checklist and asks you to say "Execute" to begin building.
6. The agent enters the **execution phase**, implementing one task
   at a time. After each task it shows you the result and waits.
   Say "Continue" to advance, or "Continue 5" to batch.
7. If the IDE closes or context runs out, start a new session and
   say "Continue where you left off" — the agent picks up from
   `execution-log.md`.

## Expected output layout

After a successful run, `prompts/outputs/current/` contains:

| File | Who writes it | What it's for |
|---|---|---|
| `project-context.md` | external-input-handler (if you dropped files in `working_copy/`) | Extracted entities, roles, flows, constraints |
| `epics.md` | drill-down Step 1 | 5–7 feature epics + ~12 production-readiness baseline epics |
| `brief-keywords.md` | drill-down Step 1 | Distinctive keywords from your brief mapped to epics or scoped out — prevents silent dropout of specific requirements |
| `features-<epic>.md` | drill-down Step 2 | One per epic, with data models and API contracts |
| `external-accounts.md` | drill-down Step 2.5 | Every third-party service + signup URL + env vars (your to-do list) |
| `tasks-<feature>.md` | drill-down Step 3 | Atomic tasks — real file paths, signatures, acceptance criteria, named test, change type |
| `revise-report.md` | `scripts/revise.sh` (revise gate) | Coverage + schema check results. `executor_gate: pass` means execution is cleared. `scripts/step3-progress.sh` is the in-progress checklist the agent runs between task-file generations. |
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
