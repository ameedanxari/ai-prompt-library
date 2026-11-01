# Planning pipeline

Turns a project's documents into a complete, granular development plan, then builds it. It follows the conventional order:

1. Understand the work.
2. Split it into modules.
3. Detail each module.
4. Assemble the roadmap.

Each stage is one prompt. Each stage writes readable markdown under `plan/` in the consumer project. A gap gets a stated default; the pipeline never stops to wait for one.

| Stage | Prompt | Writes |
|---|---|---|
| 1 Inventory | `01-inventory.md` | `plan/01-SOURCES.md` |
| 2 Understand | `02-understand.md` | `plan/02-BRIEF.md` |
| 3 Decompose | `03-decompose.md` | `plan/03-ARCHITECTURE.md`, `plan/03-MODULES.md` |
| 4 Elaborate | `04-elaborate.md` | `plan/modules/<id>.md`, one run per module |
| 5 Integrate | `05-integrate.md` | `plan/05-ROADMAP.md` |
| 6 Critique | `06-critique.md` | `plan/reviews/<stage>.md`, after any stage |
| 7 Implement | `07-implement.md` | Code, tests and roadmap updates, milestone by milestone |

## Running a stage

Give the agent `00-RULES.md`, the stage prompt, and the location of the sources and the `plan/` folder. Run each stage in a fresh context; later stages read earlier outputs rather than relying on conversation memory. After a stage, optionally run stage 6 on its output with a different agent. The producer fixes critical and major findings, for at most two rounds.

Optional owner checkpoints, about 15 minutes each:

- after stage 2, review the assumption register
- after stage 3, review the module split

The pipeline continues on its defaults if nobody reviews.

## Gates

- **Coverage check** (`node .ai-prompts/scripts/coverage.mjs plan`): every requirement maps to a module, at least one acceptance criterion and at least one task; no dangling IDs.
- **Critique**: the stage 6 checklist, judged against the sources.
- **Tests and CI** during implementation: every acceptance criterion becomes an automated test where feasible.
