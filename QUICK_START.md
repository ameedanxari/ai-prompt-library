# Quick start

1. Install and bootstrap, as shown in the [README](README.md).
2. Put the project's documents somewhere in the repository, for example `docs/`. Optionally fill in `MY_PROJECT.md` with anything the documents do not say.
3. Ask the agent to plan (prompts below). It runs stages 1–5 in order, each in a fresh context, writing to `plan/`. Stage 4 runs once per module, in parallel if your agent can.
4. Optionally spend 15 minutes on `plan/02-BRIEF.md` → *Assumption register*, and 15 minutes on `plan/03-MODULES.md`. Correct anything wrong, then ask the agent to re-run the stages after the one you changed.
5. When `node .ai-prompts/scripts/coverage.mjs plan` prints `PASS`, ask the agent to build.

Everything the agent needs is in `plan/`, so any session can pick up where the last one stopped.

## Prompts to give your agent

**Plan:**
> Use ai-prompt-library to plan this project from the documents in `docs/`. Run stages 1–5, each in a fresh context, then run the coverage check.

**Plan with review:**
> Use ai-prompt-library to plan this project from `docs/`. After each stage, run the stage 6 critique with a separate reviewer and fix the critical and major findings before moving on.

**Build:**
> Build milestone 1 of `plan/05-ROADMAP.md` with ai-prompt-library stage 7.

**After upgrading the library:**
> ai-prompt-library was upgraded. Run `node .ai-prompts/scripts/status.mjs plan` and re-run the stages it names, in order, updating the plan in place and keeping its IDs. Then run the coverage check.

**After the documents change:**
> The documents in `docs/` changed. Re-run ai-prompt-library from stage 1, updating the plan in place and keeping its IDs.

**Resume:**
> Continue the ai-prompt-library plan from stage 4, module M-03. (Or: continue building from task T-03-02.)
