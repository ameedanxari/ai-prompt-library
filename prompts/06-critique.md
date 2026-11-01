# Stage 6 — Critique a stage output

You are reviewing one stage's output for a team that will build from it. You did not write it. Read `00-RULES.md`, the stage prompt that produced the output, the output itself, and the sources it cites. Judge whether a team building from this output would build the right product. Formatting is secondary.

## Process

1. Read the output in full.
2. Run the checklist for that stage, plus the general checks.
3. For each problem, write a finding with:
   - the location in the output
   - what is wrong
   - the evidence: a source locator, or the contradicting line
   - the concrete fix
   - severity: **critical** (wrong product, missed must-have, contract or safety breach), **major** (missing or untestable detail that will cause rework) or **minor**
4. Do not report style preferences or restate the checklist. If an item passes, say nothing about it.

The producer fixes critical and major findings, and you check the fixes once. Anything still open after two rounds goes into "Residual issues" and does not block the next stage.

## General checks (every stage)

- Pick three sections of the plan of record and two owner decisions at random. Trace each obligation into the output. Report anything dropped, softened or contradicted.
- Anything the sources exclude or defer must not appear as work.
- Every gap is resolved by a stated default, never left as TBD or a stop.
- Nothing is invented without a source or an enabler reason.
- IDs are unique, references resolve, and no earlier ID has been renumbered.

## Stage 1 — Inventory

- Every supplied file is listed and was actually read. Unreadable files are flagged.
- Editions and duplicates are identified by content.
- The authority order has a basis. A precedence clause in a source is honoured.
- The contract is compared clause by clause with the plan of record on scope, money, dates and windows. List any contradiction the output missed.
- Label traps, such as the same name used for different things across documents, are called out.

## Stage 2 — Brief

- Every requirement is checkable from its own line and keeps the source's qualifiers.
- Source coverage is complete for owner decisions, contracts and the plan of record.
- Every contradiction resolution from stage 1 is applied.
- Assumptions are reasonable for this kind of product, and each states the impact if it is wrong.
- Milestones, acceptance triggers and windows match the sources that win under the authority order.
- Hour or budget envelopes are not used to drop required scope.

## Stage 3 — Architecture and modules

- The stack and design match the sources; departures are ADRs with reasons.
- Access rules exist for every entity and every state transition. Tenancy is enforced where the sources require it.
- Every requirement has one owning module, and the build order meets every milestone.
- Modules are business capabilities of buildable size, not technical layers.
- The seams named for later phases are present without building those phases now.
- Pick one end-to-end user journey from the brief, from signup to final status. Walk it through the entities, state machines and modules. Report any step with no owner, data or transition.

## Stage 4 — Module specification

- Every owned requirement has acceptance criteria that keep the source's numbers and roles. Failure and recovery paths are covered where the sources name them.
- A developer could build each task from this file and the architecture alone, with no open questions.
- Data access rules and transitions match the architecture. Nothing lets one tenant or role reach another's data.
- Tests are automated wherever feasible. Each manual check says why it is manual.
- Tasks are 0.5–2 days and ordered thin end-to-end path first. Each has a done-definition with tests.

## Stage 5 — Roadmap

- The coverage check passes.
- Each milestone's result is something a user can do, and its demo script proves it.
- Milestone gates match the sources' acceptance and payment triggers.
- The forecast is honest against the sources' envelope and lists levers without dropping scope.
- Outside inputs have a needed-by date and a placeholder, so work is not blocked.

## Output: `plan/reviews/<stage>.md`

```markdown
# Review — <stage>, round <n>
## Findings
| # | Severity | Location | Problem | Evidence | Fix |
## Residual issues (after round 2)
```
