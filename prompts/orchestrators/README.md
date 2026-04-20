# Orchestrators

## Active (the only files you should auto-load)

| File | Purpose |
|---|---|
| `ai-agent-entry-point.md` | Primary entry. Routes every request into one of four modes. |
| `drill-down-engine.md` | **Greenfield mode.** Seed → Features → Tasks. |
| `audit-and-remediate.md` | **Gap-closure mode.** For existing codebases. Audit → Gaps → Remediation. |
| `executor.md` | **Execute mode.** Runs an existing plan (remediation or tasks) against real code. |
| `external-input-handler.md` | Runs first when user provides designs / specs / existing code. |
| `module-selection-index.md` | Intent → single-module lookup. Not loaded into session context; consulted at expansion time. |

See `../AGENTS.md` for the full flow and mode-selection logic.

## Deprecated (not present — reference only)

Earlier versions of this library shipped ~25 auxiliary orchestrators
(auto setup, auto routing, stage pipeline, state management, quality
gates, error recovery, COVE, A/B testing, parallel execution, self-
healing, intelligent caching, template composition, etc.). Those have
all been removed. If you encounter a consumer project whose
`AGENTS.md` still references any of those files, run
`bash scripts/reset-integration.sh --yes` from that project's root.
