# Quick Start

## The single prompt (copy this into an AI chat on an empty folder)

Open an agentic AI chat — **Claude Code, Cursor, Windsurf, Kiro,
Continue, Aider, etc.** — inside the folder you want to build your
project in, and paste exactly this:

---

```
Hey AI — set up a new project for me using the AI Prompt Library.

Do ALL of the following, in order, without stopping between steps and
without asking me "shall I continue?" between steps. Only pause at the
single question in step 4. If a step is already done, skip it.

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

4. Ask me exactly ONE question, then wait for my answer:

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

6. Run the library end-to-end. Read .ai-prompts/prompts/AGENTS.md and
   .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md, then
   follow the entry point's routing. This will automatically:
   - Pick Greenfield mode.
   - Produce epics.md (feature epics PLUS the production-readiness
     baseline — auth, admin, RBAC, observability, i18n, theming, a11y,
     CI/CD, infra, release prep, onboarding, privacy).
   - Expand each epic into features-*.md (one per platform where
     applicable — web, Android, iOS).
   - Expand each feature into atomic tasks-*.md.
   - Validate the outputs with scripts/validate-instantiation.sh.
   - Chain into the executor, which writes the actual code under
     src/, backend/, frontend/, android/, ios/, infrastructure/, etc.,
     runs tests, and appends progress to execution-log.md.

   Do NOT stop between any of these steps. Do NOT ask for confirmation.
   Only stop if a hard blocker appears (external credentials needed,
   ambiguous requirement that needs my decision, or a test regression
   after a gap closes).

7. When everything is done, report to me:
   - Every file under prompts/outputs/current/ with a one-line purpose.
   - A tree of what got created in the app (src/, backend/, frontend/,
     android/, ios/, infrastructure/).
   - One command I can run to start the app locally.
   - One command I can run to run the tests.
   - A list of any external keys/accounts I need to create (Stripe,
     Firebase, AWS, etc.), with a one-line "where to get it" for each.

Start now.
```

---

## What happens after you paste

1. The agent runs shell commands for ~10 seconds — setup.
2. The agent asks you **one** question: "What do you want to build?"
3. Answer in a sentence or a paragraph. Vague is fine.
4. The agent works for a while — anywhere from 20 minutes to several
   hours depending on scope and which model is running it. You can walk
   away; it won't need you again unless it hits a real blocker.
5. When it's done, the agent tells you how to run the app, how to run
   the tests, and what external accounts/keys (if any) you still need.

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

## If something goes wrong mid-run

Paste this second prompt and the agent will pick up where it left off:

```
Continue where you left off. Read .ai-prompts/prompts/AGENTS.md and
.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md first. The
entry point will detect current state from prompts/outputs/current/
and execution-log.md. Do not ask me "shall I continue?" — just continue.
```

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
