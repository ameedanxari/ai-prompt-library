This project plans and builds with ai-prompt-library, installed in `.ai-prompts/`.

- To plan or build from the project's documents, follow `.ai-prompts/prompts/README.md`. Run stages 1–5 in order, each in a fresh context, writing to `plan/`. Stage 6 (critique) is optional; stage 7 builds the plan milestone by milestone.
- Before planning or building, run `node .ai-prompts/scripts/status.mjs plan`. If it reports stale or missing stages (for example after a library upgrade), re-run them from the earliest one it names, updating the existing files in place and keeping their IDs.
- Fill gaps with stated defaults instead of stopping, and cite a source for every requirement. Check traceability with `node .ai-prompts/scripts/coverage.mjs plan`.
- Small, straightforward changes can be made and verified directly.
