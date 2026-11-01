# Stage 5 — Integrate the roadmap

Goal: one roadmap that orders every task into milestones a team can execute top to bottom, where each milestone ends in something a user can try and the sources can accept.

Read `plan/02-BRIEF.md`, `plan/03-ARCHITECTURE.md`, `plan/03-MODULES.md` and every file in `plan/modules/`.

## Steps

1. **Check consistency across modules.**
   - An interface one module calls must match what the owning module defines: names, inputs, errors and authorization.
   - A table or field must have exactly one owner.
   - A state transition must have one implementer.
   - The same work must not appear in two modules.

   Fix mismatches in the module files. Keep IDs stable: add new IDs rather than renumbering old ones.
2. **Set the milestones** from the brief's delivery shape. Each milestone gets:
   - the user-visible result: what someone can now do, end to end
   - the acceptance criteria that prove it
   - the source's acceptance or payment trigger, if any
3. **Place every task** in exactly one milestone. A task belongs to the earliest milestone that needs it. Its dependencies must be in the same or an earlier milestone. Within a milestone, order tasks so the thinnest end-to-end path works first.
4. **Forecast.** Sum the task estimates per milestone and per role, and add time for integration, review and fixing. Compare the total with any budget, hour envelope or deadline in the sources, and state the gap honestly. If it does not fit, list the levers the sources allow (deferrals, scope valves, change orders) and their effect. Never silently drop required scope to make it fit.
5. **List what each milestone needs from outside the team**: client inputs, accounts, approvals, legal copy. Say by when it is needed and which task needs it. Link each item to the assumption or placeholder that lets work continue without it.
6. **Define the gates**: what must be true to call each milestone done. These are its acceptance criteria passing as automated tests where feasible, the demo script, and the manual checks named in module test plans. Name the regression suite that must stay green from then on.

## Output: `plan/05-ROADMAP.md`

```markdown
# Roadmap

## Milestones
| Milestone | Due | User-visible result | Acceptance trigger | Source |

## <Milestone name>
**Result:** what a user can do at the end, end to end.
**Demo script:** numbered steps someone can follow to see it.
**Acceptance criteria:** AC IDs.
**Tasks, in order:**
| Order | Task | Module | Depends on | Estimate (days) |
**Needs from outside the team:** item, needed by, which task, placeholder meanwhile.
**Gate:** what must pass; the regression suite from here on.

## Forecast
| Milestone | Days by role | Integration and fixing | Total | Envelope from sources | Gap |
Levers if it does not fit: …

## Cross-module fixes made
| Change | Files | Reason |

## Risks to the schedule
| Risk | Effect | Mitigation | Source |
```

## Self-check

- Run the coverage check (`node .ai-prompts/scripts/coverage.mjs plan` from the project root) and fix every error it reports.
- Every task appears in exactly one milestone, and every dependency is in the same or an earlier milestone.
- Every milestone has a demo script a non-developer could follow.
- Every acceptance or payment trigger in the sources maps to a milestone gate.
- The forecast compares against the sources' envelope and states the gap, without cutting scope.
