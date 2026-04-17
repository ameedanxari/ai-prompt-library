# AI Prompt Library — Steering

This file is auto-deployed by the library to every IDE's steering directory
(`.kiro/steering/`, `.cursor/rules/`, `.windsurf/rules/`, `.vscode/ai-steering/`,
`.ai-steering/`, `.continue/rules/`). It is loaded by the IDE at every session.

**Keep it short.** Anything longer than a page ships context-bloat to every
session the user opens.

---

## The flow

For any non-trivial request ("build a todo app", "add user auth", "spec out a
marketplace"), the agent must:

1. Read `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`.
2. Read `.ai-prompts/prompts/orchestrators/drill-down-engine.md`.
3. If user-provided designs/specs/code exist under `working_copy/` or
   `prompts/working_copy/`, also read
   `.ai-prompts/prompts/orchestrators/external-input-handler.md`.
4. Execute the engine's three-step expansion (Seed → Features → Tasks) and
   write outputs to `prompts/outputs/current/`.

Trivial requests (rename a variable, tweak copy, fix a one-line bug) bypass
the engine — just do the work.

## Do NOT auto-load

- `prompts/stages/**` — deprecated waterfall, kept only so old tests pass.
- Any orchestrator under `prompts/orchestrators/` except the three above —
  each deprecated file carries a banner saying so.
- `docs/optional/` — safeguard docs, on-demand only.
- Full module catalog `prompts/modules/**` — the engine loads one module at
  a time during expansion.

## Authority

`.ai-prompts/prompts/AGENTS.md` is the single source of truth. If anything in
this steering file ever drifts from `AGENTS.md`, `AGENTS.md` wins.
