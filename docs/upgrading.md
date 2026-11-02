# Upgrading

## Any version 3 release

1. Update the checkout and re-run bootstrap:

   ```bash
   git -C .ai-prompts pull
   node .ai-prompts/scripts/bootstrap.mjs
   ```

   Bootstrap:
   - replaces the managed block in `AGENTS.md` in place, leaving the rest of the file alone
   - writes the new version to `.ai-prompts-version`
   - re-points IDE steering links that target files inside `.ai-prompts/`, including links an earlier version left dangling, at `prompts/steering.md`
   - warns if `MY_PROJECT.md` still refers to version 2 run files
   - prints the plan's status

2. Check the plan:

   ```bash
   node .ai-prompts/scripts/status.mjs plan
   ```

   Every plan file starts with a stamp naming the library version and stage that wrote it. [`prompts/stage-versions.json`](../prompts/stage-versions.json) records the version in which each stage last changed its output. A file older than its stage is **stale**. A file with no stamp predates stamping and is treated as 3.0.0. The script names the earliest stage to re-run; `--check` exits 1 while anything is stale, for use in CI.

3. Re-run from that stage through stage 5, in order. Ask your agent: "ai-prompt-library was upgraded; bring the plan up to date." Each re-run updates the existing files in place:
   - IDs of items that still apply are kept
   - removed IDs are never reused
   - new items are numbered after the highest existing ID
   - progress marks, such as done tasks and accepted milestones, are kept

   Implementation already built stays traced to the same task IDs.

4. Run the coverage check. Review files from stage 6 are kept as history, and a re-run never requires them.

The [changelog](../CHANGELOG.md) says which stages each release changed.

## From version 2

Version 3 replaces version 2's single `run.json` workflow with staged markdown prompts. Version 3 has no CLI, schema, host adapter or reviewer-receipt store, and nothing migrates automatically.

- **Existing v2 runs** under `prompts/outputs/runs/` stay as they are. To continue a project on v3, start at stage 1 with the original documents, not the v2 run. The v2 run is a prior plan: stage 1 lists it as reference only, unless an owner decision adopts it.
- **Update the checkout and bootstrap** as above. Bootstrap also replaces the v2 managed block and the v2 commit hash in `.ai-prompts-version`, and repairs the v2 steering links in `.cursor/rules`, `.windsurf/rules`, `.kiro/steering`, `.idea/ai-rules`, `.vscode/ai-steering` and `.ai-steering`.
- **Update `MY_PROJECT.md`** if it points agents at v2 run files.
- **Old commands** (`ai-prompt-workflow`, `ai-prompt-host`, `validate --boundary …`) are gone. The scripts are `scripts/coverage.mjs`, `scripts/status.mjs` and `scripts/bootstrap.mjs`.
- **Recovering v2:** see [retirement.md](retirement.md).
