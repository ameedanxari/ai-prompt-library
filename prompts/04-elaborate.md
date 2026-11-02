# Stage 4 — Elaborate one module

Goal: a module specification complete enough that a developer can build it task by task without coming back with questions.

Run this stage once per module, each in a fresh context; modules may run in parallel, so write only your module file. You are given one module ID (for example `M-04`). Read `plan/02-BRIEF.md`, `plan/03-ARCHITECTURE.md` and `plan/03-MODULES.md`. Read other module files in `plan/modules/` only to check an interface you depend on; they may not exist yet. Go back to a source only to check a requirement's locator or detail.

Length budget: about 2,000–5,000 words. Use tables, cite brief and architecture IDs instead of restating them, and specify only what this module adds.

## Steps

1. **Collect the requirements** this module owns or contributes to, from the requirement map. Re-read each one with its source locator, so qualifiers are not lost.
2. **Specify behaviour.**
   - For each user or system flow: the trigger, the steps, the result, and what the actor sees.
   - For each failure: what is wrong, what the actor sees, and how they recover.
   - Cover empty, invalid, unauthorized, duplicate, concurrent and out-of-order cases wherever they can happen.
3. **Specify data**: the tables or entities this module owns, with field types, constraints, indexes, access rules per role, and the migrations that create them. List the state transitions this module performs, and who may perform each one.
4. **Specify interfaces.**
   - For each endpoint, function, job or event: inputs, outputs, errors and authorization.
   - For each screen: purpose, fields, actions, and states (loading, empty, error, success).
   - For each email or notification: trigger, recipient and content outline.
5. **Write acceptance criteria.** Each criterion is a Given/When/Then statement a tester can run, and cites the requirement(s) it proves. Every requirement this module owns needs at least one success criterion. Where the brief or sources name a failure or recovery path, it needs one for that too. Keep the sources' numbers: thresholds, limits, windows, roles.
6. **Write the test plan.** Map each criterion to a test level: unit, integration, end-to-end or manual. Name the fixtures and test data it needs. Prefer automated tests. Manual checks are only for what cannot reasonably be automated, and say why.
7. **Write the tasks.** Break the work into tasks of 2–16 focused hours, typically 4–8. Estimate the hours an experienced developer who knows the stack needs, including the task's tests; do not round small work up to fill a day. Each task:
   - names the files or areas it touches
   - lists in `Depends on` only the IDs of tasks (in any module) that must finish first, nothing else
   - states a done-definition that includes its tests passing
   - covers requirement IDs, or is marked `enabler` with a reason

   Order the tasks so each one leaves the module working. Build the thinnest end-to-end path first, then the remaining cases.
8. **Check the size.** Total your task hours. If the sources give an hour line for this work, state your total next to it under "Purpose and requirements". If yours is more than about 1.5 times that line, look for design detail the sources do not require (see "Keep the design proportionate" in the rules) and remove it; then state the remaining gap in one line. Never drop required behaviour to close the gap.
9. **Note assumptions and cross-module needs** in your own file, not in shared files:
   - `## New assumptions`: only those that change what a user, tester or the budget would notice, with IDs `A-MM-NN`. Usually fewer than eight.
   - `## Needs from other modules`: anything you call that the owning module does not yet list. Stage 5 resolves these.

## IDs

Acceptance criteria, tasks and assumptions are prefixed with the module number, so module files never collide: `AC-04-01`, `T-04-01`, `A-04-01`. Never renumber them after another stage has used them.

## Output: `plan/modules/<module ID>.md` (for example `plan/modules/M-04.md`)

```markdown
# M-04 — <module name>

## Purpose and requirements
| Requirement | Role here (owner / contributor) | Summary |

## Behaviour
### <Flow name>
Trigger · Steps · Result · Failures and recovery

## Data
| Entity / table | Fields (type, constraints) | Access by role | Migration |
### Transitions performed

## Interfaces
### API / functions / jobs
| Name | Input | Output | Errors | Who may call |
### Screens
| Screen | Purpose | Fields and actions | States |
### Notifications
| Trigger | Recipient | Content |

## Acceptance criteria
| ID | Given / When / Then | Requirements |

## Test plan
| Criterion | Level | Fixtures / data | Notes |

## Tasks
| ID | Task | Covers | Criteria | Files / areas | Depends on | Estimate (h) | Done when |

## New assumptions
| ID | Assumption | Why | Impact if wrong |

## Needs from other modules
| Module | What | Why |
```

In the Tasks table, `Covers` lists `R-###` IDs or the word `enabler` followed by the reason.

## Self-check

- Every requirement this module owns has at least one acceptance criterion and at least one task.
- Every acceptance criterion is proved by at least one test-plan row and one task.
- Every data access rule matches the authorization design in `03-ARCHITECTURE.md`.
- Every interface this module calls exists in the module that owns it, or is listed as a dependency to be added there.
- No task exceeds 16 hours, and no task lacks a done-definition with tests.
- The module total is compared with any source hour line, and any gap over about 1.5 times is explained.
- Run `node .ai-prompts/scripts/coverage.mjs plan` from the project root. Fix every error that names your module's IDs; errors about modules not yet written are expected.
- Nothing deferred or excluded in the brief is being built.
