# Contributing

Keep the library small. A stage prompt should stay at or under about 800 words, concrete, with one output template and one self-check. Before adding a rule, ask whether an existing rule already covers the failure. Fix the stage where the failure starts, not a later one.

## Changing a prompt

1. Reproduce the problem on a fixture: the Logisrch run, or the briefs in [evaluation/](evaluation/README.md).
2. Change the one stage responsible.
3. Re-run that stage alone, in a fresh context, and compare with the previous output and the scoring key.
4. Record the result in [docs/validation.md](docs/validation.md): what changed, the before and after, and the limits.

Prompts must stay generic. Never copy project-specific content into them.

## Changing scripts

Scripts use only the Node.js standard library. Run `npm run check` before proposing a change: it runs the tests and checks local Markdown links. Add a test for each behaviour you change, including one failing case.
