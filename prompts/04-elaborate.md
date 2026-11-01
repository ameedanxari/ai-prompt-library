# Stage 4 — Elaborate one module

Goal: a module specification complete enough that a developer can build it task by task without coming back with questions.

Run this stage once per module, each in a fresh context. You are given one module ID (for example `M-04`). Read `plan/02-BRIEF.md`, `plan/03-ARCHITECTURE.md` and `plan/03-MODULES.md`. Read other module files in `plan/modules/` only to check an interface you depend on. Go back to a source only to check a requirement's locator or detail.

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
7. **Write the tasks.** Break the work into tasks of 0.5–2 days. Each task:
   - names the files or areas it touches
   - lists what it depends on
   - states a done-definition that includes its tests passing
   - covers requirement IDs, or is marked `enabler` with a reason

   Order the tasks so each one leaves the module working. Build the thinnest end-to-end path first, then the remaining cases.
8. **Note assumptions** you had to make. Append them to the assumption register in `plan/02-BRIEF.md` with new IDs.

## IDs

Acceptance criteria and tasks are prefixed with the module number, so module files never collide: `AC-04-01`, `T-04-01`. Never renumber them after another stage has used them.

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
| ID | Task | Covers | Criteria | Files / areas | Depends on | Estimate (days) | Done when |
```

In the Tasks table, `Covers` lists `R-###` IDs or the word `enabler` followed by the reason.

## Self-check

- Every requirement this module owns has at least one acceptance criterion and at least one task.
- Every acceptance criterion is proved by at least one test-plan row and one task.
- Every data access rule matches the authorization design in `03-ARCHITECTURE.md`.
- Every interface this module calls exists in the module that owns it, or is listed as a dependency to be added there.
- No task exceeds 2 days, and no task lacks a done-definition with tests.
- Nothing deferred or excluded in the brief is being built.
