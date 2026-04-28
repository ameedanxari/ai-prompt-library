# Orchestrators

## Active (the only files you should auto-load)

| File | Purpose |
|---|---|
| `ai-agent-entry-point.md` | Primary entry. Routes every request into one of four modes. |
| `drill-down-engine.md` | **Greenfield mode.** Seed → Features → Tasks. Emits user-brief feature epics PLUS the production-readiness baseline. |
| `audit-and-remediate.md` | **Gap-closure mode.** For existing codebases. Audit → Gaps → Remediation. |
| `executor.md` | **Execute mode.** Runs an existing plan against real code. Maintains a YAML handoff envelope in `execution-log.md` for cross-session resume. |
| `revise-outputs.md` | Runs between the planning engine and the executor. Checks C1–C9 for coverage, schema, baseline completeness, external-services manifest, user-story linkage, platform coverage, brief-keyword coverage. Canonical `revise-report.md` is written by `scripts/revise.sh`, not by hand. |
| `external-input-handler.md` | Runs first when user provides designs / specs / existing code. |
| `module-selection-index.md` | Intent → single-module lookup. Consulted at expansion time (not pre-loaded). |
| `baseline-task-shapes.md` | Schema rules for baseline epics (auth, admin, i18n, theming, a11y, tests, CI/CD, IaC, app-store, debug, privacy). Consulted during Step 3 of either engine. |
| `self-maintain.md` | Runs the library's engines on the library itself. For maintainer use. Writes to `prompts/outputs/self-maintain/`, not `prompts/outputs/current/`. |

See `../AGENTS.md` for the full flow, mode-selection logic, and hard
rules.

## Deprecated (not present — reference only)

Earlier versions of this library shipped ~25 auxiliary orchestrators
(auto setup, auto routing, stage pipeline, state management, quality
gates, error recovery, COVE, A/B testing, parallel execution, self-
healing, intelligent caching, template composition, etc.). Those have
all been removed. If you encounter a consumer project whose
`AGENTS.md` still references any of those files, run
`bash .ai-prompts/scripts/reset-integration.sh --yes` from that project's root.
