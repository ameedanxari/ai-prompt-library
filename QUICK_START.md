# Quick start

1. Install and bootstrap, as shown in the [README](README.md).
2. Put the project's documents somewhere in the repository, for example `docs/`. Optionally fill in `MY_PROJECT.md` with anything the documents do not say.
3. Ask the agent: "Use ai-prompt-library to plan this project from `docs/`."
4. The agent runs stages 1–5 in order, each in a fresh context, writing to `plan/`. After each stage it may run the critique (stage 6) with a separate reviewer.
5. Optionally spend 15 minutes on `plan/02-BRIEF.md` → *Assumption register*, and 15 minutes on `plan/03-MODULES.md`. Correct anything wrong; the next stages pick it up.
6. When `node .ai-prompts/scripts/coverage.mjs plan` prints `PASS`, ask: "Build milestone 1."

To resume, say which stage or milestone to continue from. Everything the agent needs is in `plan/`.
