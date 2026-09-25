# Quick Start

## Before you paste — the 60-second checklist

Do these five checks **before** you paste the prompt below. They
prevent the five most common first-run failures (see
[Troubleshooting](#troubleshooting) if you skipped this and something
broke).

- [ ] **You're in a desktop AI coding app, not a website.** Cursor,
      Windsurf, Kiro, the Claude desktop app, the ChatGPT desktop app,
      Continue, or Aider — anything that can run terminal commands and
      write files. **chatgpt.com and claude.ai in a browser will not
      work** — the agent needs to run commands and create files on
      your computer.
- [ ] **You have an empty folder** for the project, and you know where
      the app's chat box is (that's where you'll paste the prompt).
- [ ] **The agent can run commands.** Quick test — type this in the
      chat box first and make sure it runs:
      `Please run the command "echo hello" in my terminal and tell me what it printed.`
      If it prints `hello`, you're good.
- [ ] **You know what you'll be asked.** Exactly **one** question:
      "What do you want to build?" — answer in a sentence or a
      paragraph. Then you'll approve each stage by saying
      **Continue** — expect about **4 approvals during planning**,
      and use **"Continue 5"** to batch approvals while the app is
      being built. Planning takes roughly 1–3 hours (mostly the agent
      working, not you); building takes days. See
      [What to expect](#what-to-expect) below.
- [ ] **You have an AI tool to run this in.** No account yet? Start
      with [FREE_RESOURCES.md](docs/FREE_RESOURCES.md) — free AI
      coding apps and free tiers, no credit card needed.

---

## What to expect

> **Time.** Planning: answer 1 question (~1 minute), then about
> **4 "Continue" approvals** as you review what the agent produced
> (epics → features → task prompts → readiness gate). Expect 1–3
> hours of elapsed time — the agent does the work between your
> approvals; you just review and type Continue. Building
> (execution): one approval per task, so batch with **"Continue 5"**.
> A real project is dozens to 100+ tasks — days of agent time, not
> minutes. You set the pace; nothing advances without your approval.
>
> **Cost.** Many people do the whole planning phase on a free tier.
> Execution is the expensive part because it's a lot of AI work.
> Start with the free tools in
> [FREE_RESOURCES.md](docs/FREE_RESOURCES.md); upgrade only if you
> run out.
>
> **Which model.** Any current Claude- or GPT-class model running
> **inside a desktop AI coding app** works — e.g. Claude in the
> Claude desktop app or in Cursor, GPT in the ChatGPT desktop app.
> (The docs elsewhere say "SWE 1.6-class / small context windows" —
> that just means a decent mid-range coding model, not the most
> expensive one. Each task is written small enough that the model
> doesn't need your whole project in context.) Do **not** use the
> web versions (chatgpt.com, claude.ai) — they can't run commands or
> write files.

---

## The single prompt (copy this into an AI chat on an empty folder)

Open an agentic AI chat — **Claude Code, Cursor, Windsurf, Kiro,
Continue, Aider, the Claude desktop app, the ChatGPT desktop app,
etc.** — inside the folder you want to build your project in, and
paste exactly this:

---

```
Hey AI — set up a new project for me using the AI Prompt Library.

Do the following, in order. At each checkpoint (marked ⏸), stop and
show me a summary of what was just completed, then wait for my
approval before proceeding. I may say "Continue", "Continue 5", or a
natural acknowledgment like "looks good, keep going" — treat ALL of
these as approval to proceed. If a step is already done, skip it.

1. Initialize git if needed. If ".git/" does not exist in this folder,
   run: git init

2. Install the AI Prompt Library. If ".ai-prompts/" does not exist, run:
     git clone --depth 1 https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
   If ".ai-prompts/" already exists, leave it as is and continue.
   (Optional refresh: git -C .ai-prompts pull)

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
   checkpoint. Treat natural acknowledgments ("looks good, keep
   going", "go ahead", "yep") the same as "Continue".

   Only stop execution if: a test regression appears, 3+ tasks
   block consecutively, external credentials are needed, or I
   interrupt.

   After the final implementation task, checkpoint into the semantic-review
   phase. Run all seven independent review dimensions, functional validation,
   synthesis, and the blind completion challenge. If findings remain, create
   remediation tasks and resume execution. Do not claim completion until
   validate-semantic-review.sh exits 0.

8. When everything is done, report to me:
   - Every file under prompts/outputs/current/ with a one-line purpose.
     Expect: project-context.md (optional), epics.md, brief-keywords.md,
     features-*.md, external-accounts.md, tasks-*.md,
     task-schema-repair-report.md, path-ledger.md, delivery-order.md,
     task-contract.json, task-graph.json, phase-order-report.md,
     baseline-task-coverage.md, user-review-checkpoints.md,
     revise-report.md, ready-to-execute-report.md, execution-log.md.
     Also expect review/*.json and review/remediation-plan.md when findings
     require follow-up.
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

1. The agent runs setup commands for a minute or so — git init, the
   library download, and the bootstrap script.
2. The agent asks you **one** question: "What do you want to build?"
3. Answer in a sentence or a paragraph. Vague is fine — but the more
   specific you are, the less the library has to guess (see the
   [Brief guidance](MY_PROJECT.md.template#brief-required--the-only-required-field)
   on what a good brief answers).
4. The agent starts the **planning phase** and stops at each
   checkpoint (⏸) to show you what it produced — expect about
   **4 approvals**: epics → features → task prompts → the
   finalize/readiness gate. On a large brief the agent may also pause
   once per epic's worth of task prompts; say "Continue 3" to batch
   those. **You don't have to type the exact word "Continue"** —
   "looks good, keep going", "go ahead", or "yep" all work. If
   something looks wrong, give feedback and the agent adjusts.
5. After the readiness gate passes, the agent shows you the full task
   checklist and stops. Say "Execute" to begin building.
6. The agent enters the **execution phase**, implementing one task
   at a time. After each task it shows you the result and waits.
   Say "Continue" to advance, or "Continue 5" to batch five tasks.
7. If the IDE closes or context runs out, start a new session and
   say "Continue where you left off" — the agent picks up from
   `execution-log.md`.
8. After implementation, the agent performs independent semantic review. A
   verified decision proceeds to honest handoff; unresolved findings become
   the next remediation tasks.

## A worked example, end to end

Here's what a real run looks like for a small brief, so the file
names and checkpoint summaries above aren't abstract.

**The brief** (2 sentences, pasted as the answer to the one question):

> A room-booking app for a 10-person yoga studio in Portland.
> Customers book and pay for classes from their phones; the owner
> manages the weekly schedule and sees who paid, from a simple
> dashboard.

**What the agent writes into `epics.md`** (excerpt — the real file has
~15 lines per epic plus ~12 production-readiness baseline epics):

```markdown
_Project platforms: web, android, ios_
_Feature epics: 4 · Baseline epics: 12 · Total: 16_

## Feature epics

### 1. Class schedule & booking
- **Category:** feature
- **Goal:** Customers can browse the weekly class schedule and book a spot from their phone.
- **Acceptance:**
  - Weekly schedule view shows all classes with remaining spots
  - Booking holds a spot and confirms instantly
- **Complexity:** M
- **Applies to:** web, android, ios
- **Phase:** mvp

### 2. Payments for classes
- **Category:** feature
- **Goal:** Customers pay for a class (or class pack) at booking time via Stripe.
- **Acceptance:**
  - Successful payment confirms the booking
  - Failed payment releases the held spot
- **Complexity:** M
- **Applies to:** web, android, ios
- **Phase:** mvp

## Baseline epics

### B1. Onboarding & consent
- **Category:** baseline
- **Goal:** First-run signup, login, and consent capture.
...
```

**What a ⏸ checkpoint summary looks like** (after the epics stage):

> ⏸ **Checkpoint — Epics complete**
> 1. **Done:** Wrote `epics.md` — 4 feature epics (schedule & booking,
>    payments, customer accounts, owner dashboard) + 12 baseline epics
>    (auth, admin, payments plumbing, notifications, …), and
>    `brief-keywords.md` mapping your brief's key phrases to epics.
> 2. **Progress:** Planning step 1 of 4.
> 3. **Next:** Expand each epic into features with data models and API
>    contracts.
> 4. Say **Continue** to proceed, or give feedback (e.g. "drop the
>    class-pack idea for now").

**What the final report looks like** (after execution + review):

> ✅ **Done — honest handoff**
> - **Start the app:** `cd yoga-studio-app && npm run dev` → open
>   http://localhost:3000
> - **Run the tests:** `npm test` (142 passed, 0 failed)
> - **External accounts you still need to create:**
>   Stripe (stripe.com → Developers → API keys) — payments won't work
>   until you paste the test key into `.env`
> - **Summary:** 87 tasks done, 2 blocked on the Stripe key above,
>   all green otherwise.
> - ⚠️ Honest caveat: the plan is complete and every task's tests
>   pass, but nobody has clicked through the real app in production
>   yet — try the booking flow yourself before telling customers
>   about it. See [From handoff to live app](#from-handoff-to-live-app).

The full file inventory is in [Expected output layout](#expected-output-layout)
below — read this example first, then that table is a reference, not
a wall.

## From handoff to live app

When the agent says it's done, here's what you actually have — and
what's still on you.

**What you have:** a working app in your project folder, with its
tests, plus the full plan (`prompts/outputs/current/`) and a journal
of everything the agent did (`execution-log.md`). If the agent ever
needs to pick the work back up, those files are how it resumes.

**The 3 common remainders** (things the agent cannot do for you):

1. **External accounts.** Anything with a signup — Stripe, Firebase,
   AWS, email providers — is listed in `external-accounts.md` with
   the signup link and which keys to paste where. Creating accounts
   and copying keys is your job; the agent can't sign up as you.
2. **The start command.** The final report gives you one command to
   run the app locally and one to run the tests. Run them. If the
   app doesn't start, paste the error back to the agent — that's a
   normal part of the process, not a failure.
3. **Deploy.** "Runs on my laptop" isn't "live on the internet."
   The plan includes deployment tasks, but picking a host (Vercel,
   Railway, Fly.io, …) and pointing your domain at it is a human
   decision. The agent can walk you through it when you're ready.

**The honest-handoff caveat, in plain language:** when the agent's
log says `next_task: null`, that means *the plan is finished* — every
task was either done or explicitly marked blocked/failed. It does
**not** mean the app is verified to work in production. The
semantic-review step checks that the code faithfully implements the
plan, but nobody — human or AI — has watched a real customer use it
yet. Click through the important flows yourself before you launch.

## Troubleshooting

The five likeliest first-run failures. Find your symptom, paste the
**exact sentence** back to the agent.

**1. You pasted into a web chat (chatgpt.com / claude.ai) instead of
the desktop app.**
Symptom: the agent says it can't run commands, asks *you* to run
things, and no files ever appear in your folder.
Paste back:
> Stop here. I pasted this prompt into a web chat by mistake — it
> needs a desktop AI coding app that can run terminal commands and
> write files. I'm going to restart this in a desktop app. Nothing
> for you to do.

**2. `git` not found.**
Symptom: the agent reports `git: command not found` (or similar) and
the install step fails.
Paste back:
> Git isn't installed on my computer. Please give me the exact steps
> to install git for my operating system. I'll install it and tell
> you when it's done — then continue from the install step.

**3. The library download hangs.**
Symptom: step 2 sits for many minutes with no progress.
Paste back:
> The download seems stuck. Stop it and retry once with exactly this:
> git clone --depth 1 https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
> Then continue from the bootstrap step.

**4. The agent asks more than one question.**
Symptom: after the brief question it keeps asking about platforms,
tech stack, user roles, and more.
Paste back:
> No more questions. The prompt says: ask exactly ONE question, then
> infer everything else from my brief. Make sensible defaults, write
> them into MY_PROJECT.md, and I'll correct them at the first
> checkpoint.

**5. The agent skips ⏸ checkpoints.**
Symptom: it barrels through planning or execution stages without
stopping to show you summaries.
Paste back:
> You skipped a ⏸ checkpoint. Stop right now, show me the summary of
> what you just finished (what was done, progress so far, what comes
> next), and wait for me to say Continue.

## FAQ

**How much does this cost?**
The library itself is free and open source. What costs money (or
free-tier allowance) is the AI model doing the work. Many people get
through the whole planning phase on a free tier — start with the
free tools in [FREE_RESOURCES.md](docs/FREE_RESOURCES.md). Execution
is the expensive part because it's a lot of AI work; you control the
pace with your Continue approvals, so costs scale with how much you
approve, not with surprises.

**How long does it take?**
Roughly: planning takes 1–3 hours of elapsed time (you answer one
question and approve ~4 checkpoints; the agent works in between).
Execution is dozens to 100+ tasks — expect days of agent working
time for a real project. Use "Continue 5" to batch approvals.

**Which model / app should I use?**
Any current Claude- or GPT-class model inside a desktop AI coding
app: Claude in the Claude desktop app or Cursor, GPT in the ChatGPT
desktop app, or the models built into Windsurf, Kiro, Continue, or
Aider. The one hard requirement is the desktop app (terminal +
files), not the website. If you're starting from zero, the free
options in [FREE_RESOURCES.md](docs/FREE_RESOURCES.md) are the
cheapest way to try.

**Can I change my mind mid-run?**
Yes. During planning, give feedback at any ⏸ checkpoint ("drop the
class packs", "web only for now") and the agent reworks that stage.
During execution, describe the change and the agent adds or edits
tasks — small changes just continue. For a big scope change, edit
`MY_PROJECT.md` and ask the agent to re-run planning for the
affected parts; execution always resumes from `execution-log.md`,
so completed work isn't lost.

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
| `review/*.json` | semantic-review orchestrator | Independent dimension reports, synthesis, completion decision, and validator report |
| `review/remediation-plan.md` | remediation planner (when needed) | Finding-linked next tasks when completion is not verified |

You generally don't need to read these. The agent's final summary
tells you everything you need to act on (start command, test command,
external accounts to create). The files are there for the agent to
resume from — or for you to inspect if something goes sideways.

## If you want more control

The defaults in `MY_PROJECT.md.template` (web + Android + iOS + full
production-readiness baseline) are aggressive — a full build is a
big run. If your project is smaller in scope, the highest-leverage
thing you can do is **Restrict** the scope *before* planning starts.
Open `MY_PROJECT.md` after step 3 and paste one of the recipes from
the template's **Restrict** section — e.g. "web only" skips the
mobile apps and app-store packaging entirely, which is roughly
two-thirds fewer tasks for a typical brief.

You can also:

- List only the platforms you want under **Platforms** (e.g. "web
  only").
- List what to skip under **Restrict** (e.g. "Android", "iOS",
  "app store release prep", "i18n").
- Pin specific tech choices under **Tech preferences**.

Then tell the agent to continue — it will re-read `MY_PROJECT.md` and
apply your restrictions.

## Other install modes

The copy-paste prompt above needs nothing installed except a desktop
AI coding app and `git` — the agent downloads the library itself with
a plain `git clone`. If you prefer a different setup, two
alternatives:

**Git submodule** (keeps the library pinned as a submodule of your
repo — the agent-facing paths are identical):

```bash
git submodule add https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
git submodule update --init --recursive
bash .ai-prompts/scripts/bootstrap-project-integration.sh
```

**npm package** (useful for CI, validators, and API consumers):

```bash
npm install --save-dev ai-prompt-library
ln -sfn node_modules/ai-prompt-library .ai-prompts
bash .ai-prompts/scripts/bootstrap-project-integration.sh
npx ai-prompt-ready prompts/outputs/current
```

The npm path expects Node.js 20+, npm, Python 3, and Bash. The npm
install publishes the prompt library, shell validators, and typed
task-contract API. The `.ai-prompts` symlink keeps the agent-facing
paths identical to the clone flow while `npx` exposes the
mechanical gates.

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
| `npx ai-prompt-validate-semantic-review prompts/outputs/current` | Validate semantic reports and the completion decision before honest handoff. |
| `npx ai-prompt-validate-release-readiness .` | Check package metadata, docs examples, bins, and npm pack dry-run contents before release. |

Programmatic API example:

```js
import { buildTaskContractReportForDirectory } from 'ai-prompt-library/task-contract';

const report = buildTaskContractReportForDirectory('prompts/outputs/current');
console.log(report.summary.blocked);
```

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
