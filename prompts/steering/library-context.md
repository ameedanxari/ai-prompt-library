# AI Prompt Library — Steering

Auto-deployed to IDE steering directories (`.kiro/steering/`, `.cursor/rules/`,
`.windsurf/rules/`, `.vscode/ai-steering/`, `.ai-steering/`, `.continue/rules/`).
Loaded by the IDE at every session. Keep it short.

---

## The flow (for non-trivial requests)

1. Read `.ai-prompts/prompts/AGENTS.md`.
2. Read `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`.
3. The entry point chooses one of four modes:
   - **Trivial** (single-file edit) → skip engines, just do the work.
   - **Execute** (a validated plan exists and user says fix/implement/
     do-the-work) → `executor.md`.
   - **Gap-closure** (existing codebase; user asks to review, audit,
     fix gaps, productionize, write tests, finish) →
     `audit-and-remediate.md`. Chains into Execute automatically when
     the plan passes validation and the user's ask implied execution.
   - **Greenfield** (new project) → `drill-down-engine.md`.
4. If external material exists (designs/specs/source code under
   `working_copy/`, `prompts/working_copy/`, or project has real
   `src/`/`backend/`/`frontend/`/`android/`/`ios/` directories), also
   read `.ai-prompts/prompts/orchestrators/external-input-handler.md`.
5. Follow the chosen engine end-to-end. Do NOT stop between steps.

## IDE-native spec kits

Do NOT use Kiro's `.kiro/specs/`, Cursor's `.cursor/plans/`, or any
other IDE-native spec workflow in place of the library's engines. Our
outputs are richer and verifiable. Write to `prompts/outputs/current/`
regardless of which IDE is running.

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
