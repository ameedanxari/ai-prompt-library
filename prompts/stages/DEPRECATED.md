# ⚠️ DEPRECATED — Legacy 10-Stage Waterfall

Every file under `prompts/stages/` belongs to the old 10-stage waterfall
pipeline (Stage 01 Intake → Stage 10 Handoff). This flow has been replaced.

## What to use instead

`prompts/orchestrators/drill-down-engine.md` — routed from
`prompts/orchestrators/ai-agent-entry-point.md`.

## Why the files are still here

Several TypeScript tests under `tests/` and `src/` verify the existence and
structure of stage files. Deleting the directory would break the test suite.
The files are retained on disk for test compatibility only; they are
**not referenced** from the current entry point, steering, or `AGENTS.md`.

## Rule for any AI agent browsing this directory

Stop reading. Return to `prompts/orchestrators/ai-agent-entry-point.md`.
