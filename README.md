# AI Prompt Library

Staged prompts that turn a project's documents into a complete, traceable development plan, and then build it. They follow the conventional order:

1. Understand the work from the docs.
2. Split it into modules, with the docs as guardrails.
3. Detail each module with its own focused prompt.
4. Assemble a roadmap whose milestones each end in something a user can try.

Gaps get stated defaults instead of stopping the work. Every requirement cites its source. A plan is judged first on alignment with the development goal: would a team building from it deliver what the documents want built? Hours are a forecast to compare against, never a reason to drop scope.

## Install

In your project root:

```bash
git clone --depth 1 https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
node .ai-prompts/scripts/bootstrap.mjs
```

Bootstrap adds a short managed block to `AGENTS.md` that points agents at the pipeline. It also creates `MY_PROJECT.md` from the template if that file is absent, and records the installed version in `.ai-prompts-version`. It changes nothing else. Node.js 22.12 or newer is needed only for the scripts; there are no dependencies to install.

## Use

Ask your agent, for example: "Use ai-prompt-library to plan this project from the documents in `docs/`, then build milestone 1." See the [quick start](QUICK_START.md) for more prompts.

The agent follows [prompts/README.md](prompts/README.md):

| Stage | Prompt | Output in `plan/` |
|---|---|---|
| 1 Inventory | [01-inventory.md](prompts/01-inventory.md) | `01-SOURCES.md`: sources, authority order, contradictions |
| 2 Understand | [02-understand.md](prompts/02-understand.md) | `02-BRIEF.md`: scope, requirements, assumption register |
| 3 Decompose | [03-decompose.md](prompts/03-decompose.md) | `03-ARCHITECTURE.md`, `03-MODULES.md` |
| 4 Elaborate | [04-elaborate.md](prompts/04-elaborate.md) | `modules/M-##.md`: behaviour, data, interfaces, acceptance criteria, tests, tasks |
| 5 Integrate | [05-integrate.md](prompts/05-integrate.md) | `05-ROADMAP.md`: milestones, demo scripts, gates, forecast |
| 6 Critique | [06-critique.md](prompts/06-critique.md) | `reviews/<stage>.md` |
| 7 Implement | [07-implement.md](prompts/07-implement.md) | Code and tests, milestone by milestone |

Every stage also follows [00-RULES.md](prompts/00-RULES.md). Run each stage in a fresh context; stages communicate only through the files in `plan/`. Stage 4 runs once per module, and modules can run in parallel.

Two scripts check the plan:

```bash
node .ai-prompts/scripts/coverage.mjs plan   # traceability and dependency order
node .ai-prompts/scripts/status.mjs plan     # which stages are stale for this library version
```

## Upgrade

```bash
git -C .ai-prompts pull
node .ai-prompts/scripts/bootstrap.mjs
```

Bootstrap refreshes the `AGENTS.md` block and `.ai-prompts-version`, re-points any IDE steering links an earlier version left behind, and reports whether your plan is stale. Each plan file is stamped with the library version and stage that wrote it. When a stage's prompt changes, plans it wrote become stale, and the status script names the earliest stage to re-run. Then ask your agent: "ai-prompt-library was upgraded; bring the plan up to date." Re-runs update the files in place and keep their IDs. See [docs/upgrading.md](docs/upgrading.md).

## What the gates are for

- **Coverage** catches dropped requirements, untested requirements, tasks that trace to nothing, dangling IDs, and tasks scheduled before their dependencies.
- **Status** catches plans written by an older version of a stage.
- **Critique** is a fixed checklist, run by a reviewer who did not write the stage and who judges against the sources. Fixes are checked once; what is still open is recorded, not looped on.
- **Tests and CI** come during implementation. Every acceptance criterion becomes an automated test where feasible.

There is no provenance bookkeeping. The gates exist to protect the product.

## Limits

Prompts do not guarantee a correct plan. The highest-value human time is two optional 15-minute reviews: the assumption register after stage 2, and the module split after stage 3. See [docs/validation.md](docs/validation.md) for what has been tested so far, and [evaluation/](evaluation/README.md) for how to test changes.
