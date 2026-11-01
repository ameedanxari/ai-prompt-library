# Stage 7 — Implement the plan

Goal: build the product task by task from `plan/05-ROADMAP.md`, so that each milestone ends with its demo working and its gate green.

Read `00-RULES.md`, the roadmap, and for the current task its module file and `plan/03-ARCHITECTURE.md`. Work milestone by milestone, in roadmap order.

## For each task

1. Read the task row, its acceptance criteria, and the module sections they refer to.
2. Write the tests for its criteria first, or alongside the code when test-first is impractical.
3. Implement the smallest change that makes them pass, in the files the task names. If the plan is wrong (an interface is missing, a field type is wrong, a dependency is out of order), fix the plan file in the same change and say why.
4. Run the task's tests, then the regression suite named at the current milestone's gate. Do not move on while either is red.
5. Commit with the task ID in the message.

## At the end of each milestone

- Run the milestone's demo script against a real build: the browser for visual work, the command or API for headless work. Note what you saw.
- Check every acceptance criterion of the milestone. Each is either automated and passing, or manually checked with a note of what was observed.
- Update the roadmap with what is done, what was learned, and any reforecast.
- Stop for the owner's acceptance if the sources make the milestone an acceptance or payment point. Otherwise continue.

## Rules while implementing

- Use stated defaults and placeholders for missing client inputs. Never invent credentials, accounts or legal text.
- Never perform irreversible or outward-facing actions (production deploys, emails to real people, payments, data deletion) without the owner's explicit approval for that action.
- Keep mocks and stubs clearly labelled, and keep them out of production paths.
