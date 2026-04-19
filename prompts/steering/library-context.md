# AI Prompt Library — Steering

Auto-deployed to IDE steering directories (`.kiro/steering/`, `.cursor/rules/`,
`.windsurf/rules/`, `.vscode/ai-steering/`, `.ai-steering/`, `.continue/rules/`).
Loaded by the IDE at every session. Keep it short.

---

## The flow (for non-trivial requests)

1. Read `.ai-prompts/prompts/AGENTS.md`.
2. Read `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`.
3. Read `.ai-prompts/prompts/orchestrators/drill-down-engine.md`.
4. If user-provided designs/specs/existing code exist under `working_copy/`,
   `prompts/working_copy/`, or the project has source directories like
   `src/`, `backend/`, `frontend/`, `android/`, `ios/`, also read
   `.ai-prompts/prompts/orchestrators/external-input-handler.md`.
5. Follow the entry point's routing end-to-end. Do NOT stop between the
   handler and Step 1, or between engine steps — the engine is designed
   to run through to validation in one session.

Trivial requests (rename a variable, one-line bug fix, copy tweak) bypass
the engine — just do the work.

## Reset signal

If the user asks to "reset", "re-integrate", "start fresh", OR the project
root contains `NEXT_ACTION.md`, `PROJECT_STATE.md`,
`IMPLEMENTATION_STATUS.md`, `QUICK_STATUS.md`, or any stale `AGENTS.md`
referencing `execution-orchestrator.md` / `auto-request-router.md` /
`stage-pipeline-orchestrator.md`, run this first:

```bash
bash .ai-prompts/scripts/reset-integration.sh --yes
```

## Do NOT auto-load

- `.ai-prompts/prompts/stages/**` — deprecated waterfall, kept only so old tests pass.
- Any orchestrator under `.ai-prompts/prompts/orchestrators/` except the four above.
- `.ai-prompts/docs/optional/` — safeguard docs, on-demand only.
- The full module catalog — the engine loads one module at a time during expansion.

## Authority

`.ai-prompts/prompts/AGENTS.md` is the single source of truth. If anything
in this file drifts from it, `AGENTS.md` wins.
