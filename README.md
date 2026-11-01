# AI Prompt Library

Staged prompts that turn a project's documents into a complete, traceable development plan, and then build it. They follow the conventional order:

1. Understand the work from the docs.
2. Split it into modules, with the docs as guardrails.
3. Detail each module with its own focused prompt.
4. Assemble a roadmap whose milestones each end in something a user can try.

Gaps get stated defaults instead of stopping the work. Every requirement cites its source. A small script checks that every requirement reaches a module, an acceptance criterion and a task.

## Install

In your project root:

```bash
git clone --depth 1 https://github.com/ameedanxari/ai-prompt-library.git .ai-prompts
node .ai-prompts/scripts/bootstrap.mjs
```

Bootstrap adds a short managed block to `AGENTS.md`, pointing agents at the pipeline. It also creates `MY_PROJECT.md` from the template if that file is absent, and changes nothing else. Node.js 22.12 or newer is needed only for the scripts; there are no dependencies to install.

## Use

Ask your agent, for example: "Use ai-prompt-library to plan this project from the documents in `docs/`, then build milestone 1."

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

Every stage also follows [00-RULES.md](prompts/00-RULES.md). Run each stage in a fresh context; stages communicate only through the files in `plan/`.

Check traceability at any point after stage 4:

```bash
node .ai-prompts/scripts/coverage.mjs plan
```

## What the gates are for

- **Coverage** catches dropped requirements, untested requirements, tasks that trace to nothing, and dangling IDs.
- **Critique** is a fixed checklist, run by a reviewer who did not write the stage and who judges against the sources.
- **Tests and CI** come during implementation. Every acceptance criterion becomes an automated test where feasible.

There is no provenance bookkeeping. The gates exist to protect the product.

## Limits

Prompts do not guarantee a correct plan. The highest-value human time is two optional 15-minute reviews: the assumption register after stage 2, and the module split after stage 3. See [docs/validation.md](docs/validation.md) for what has been tested so far, and [evaluation/](evaluation/README.md) for how to test changes.

Upgrading from version 2: see [docs/upgrading.md](docs/upgrading.md).
