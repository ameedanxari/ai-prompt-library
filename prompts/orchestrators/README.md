# Orchestrators

## Active (the only three you should auto-load)

| File | Purpose |
|---|---|
| `ai-agent-entry-point.md` | Primary entry. Routes every request. |
| `drill-down-engine.md` | Three-step expansion: Seed → Features → Tasks. |
| `external-input-handler.md` | Runs once when user provides designs/specs/code. |

See `../AGENTS.md` for the full flow.

## Deprecated (retained for legacy tests only)

Every other `*.md` file in this directory carries a
**`⚠️ DEPRECATED — DO NOT AUTO-LOAD`** banner at the top. They document the
legacy 10-stage waterfall pipeline and its auxiliary orchestrators (auto
setup, auto routing, stage pipeline, state management, quality gates,
error recovery, COVE, A/B testing, parallel execution, self-healing,
intelligent caching, template composition, etc.).

These files are still on disk because:
- Some tests under `tests/` reference the waterfall structure.
- The safeguard script checks for their existence.

**Do not auto-load them during session startup, routing, or engine
execution.** Load one only if the user explicitly names it and asks for
that specific capability.
