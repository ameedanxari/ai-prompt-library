# Retired versions

Each earlier version is preserved exactly by a Git tag. Recover any file with `git show <tag>:<path>`, or check out the tag.

| Tag | Commit | What it holds |
|---|---|---|
| `archive/v2-final-2026-11-01` | `a97cada` | Version 2 as merged on `main`: canonical `run.json` workflow, CLI, host coordinator |
| `archive/v2-semantic-source-preservation-2026-11-01` | `2645b99` | Unmerged v2 repair branch (pull request 7), closed without merging when v3 replaced v2 |
| `archive/pre-logisrch-rerun-2026-10-31` | `d0aa56e` | Version 2 before the Logisrch reruns |
| `archive/pre-overhaul-2026-10-29` | `e91c5bf` | Version 1 template catalogue, before the v2 overhaul |

## Why version 2 was retired

Twenty repair rounds on a real project did not converge: external scores went 12→13, 16→19, then 21→21 out of 24, and a fixed regression came back. Its design worked against the goal:

- It detailed only the next work item.
- It blocked on missing inputs instead of defaulting.
- It modelled proof and authority in eleven cross-linked collections.

Each repair added rules on top of that design. Version 3 starts again from the conventional plan-then-build sequence.
