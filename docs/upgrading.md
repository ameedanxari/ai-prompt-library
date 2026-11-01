# Upgrading from version 2

Version 3 replaces version 2's single `run.json` workflow with staged markdown prompts. Version 3 has no CLI, schema, host adapter or reviewer-receipt store, and nothing migrates automatically.

- **Existing v2 runs** under `prompts/outputs/runs/` stay as they are. To continue a project on v3, start at stage 1 with the original documents, not the v2 run. The v2 run is a prior plan: stage 1 lists it as reference only, unless an owner decision adopts it.
- **Update the checkout:** `git -C .ai-prompts pull`, then `node .ai-prompts/scripts/bootstrap.mjs`. Bootstrap replaces the old managed block in `AGENTS.md` in place and leaves the rest of the file alone.
- **Old commands** (`ai-prompt-workflow`, `ai-prompt-host`, `validate --boundary …`) are gone. The only script is `scripts/coverage.mjs`.
- **Recovering v2:** see [retirement.md](retirement.md).
