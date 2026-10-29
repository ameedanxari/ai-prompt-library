# Retirement decisions

The previous library is preserved exactly by Git tag `archive/pre-overhaul-2026-10-29` at `e91c5bf`. Recover a file with `git show archive/pre-overhaul-2026-10-29:<path>`. The overhaul replaces the active product; it does not ship a second archive of the old catalogue.

[The path inventory](retired-files.json) records all 970 baseline tracked paths, their original SHA-256, and retained/rewritten/retired disposition, including runtime, command chains, tests, prompts, documentation and scaffolds. Only tracked baseline files were selected for removal; ignored and untracked consumer outputs were not selected.

| Previous surface | Decision and reason |
| --- | --- |
| Domain/stack template catalogue and top-level supplemental prompts | Retired. Generic code, feature inventories and cross-domain integration lists encouraged broad scope and duplicated current provider expertise. No count/category obligation survives. |
| Four engines, rolling/revise/schema/baseline contracts and review suite | Replaced by one compact entry workflow and specific review questions. Repeated rules and independently authored readiness records created consistency work. |
| Bundled iOS/Android gallery application and screenshot templates | Retired. A domain-specific scaffold is not a general delivery workflow and should not become an implied product default. |
| Historical plans, upgrade notes, optional safeguards and API guides | Retired from current documentation. Exact history remains in Git; current docs describe actual shipped behavior. |
| Free-tier/tool marketing | Retired. Time-sensitive claims and interaction estimates were unsupported and not needed for the workflow. |
| Public install/start/contribution/brief guides | Rewritten for the new model, tooling, limits and compatibility boundary. |

A specialist mechanism survives only if it offers unique actionable guidance for a real decision/failure, has truthful limits, applies to bounded work and creates neither product scope nor a duplicate mandatory artifact. Selected mechanisms were rewritten into four short [references](../prompts/README.md): source/decision handling, state/operations, composed visual proof and consumer/test recovery. The whole old corpus was inventoried, not individually certified as current or incorrect.

The redesign is motivated by observed operational inconsistency, not a demonstrated absence of instructions. Earlier evaluations found source and readiness errors despite instructions covering them. Text/shape tests do not prove prompt efficacy. Fresh consumer trials and independent reviews must judge the replacement's behavior; no autonomous production-quality or superiority claim follows from cleanup.
