# Contributing to the AI Prompt Library

Thank you for taking the time to contribute.

This document covers how to make changes that stay aligned with the
engine architecture. Read it before sending a PR — the library has
tight invariants and some surface area that looks editable but is not.

---

## Ways to contribute

### Report a failure mode

The library's value is that low-end coding models (SWE 1.6-class) can
finish a project without a human mediating between planning stages. If
you ran it and the model got stuck, went off-track, or silently
dropped a requirement, that's the contribution we want most.

Open an issue with:

- The exact prompt and brief you used.
- The IDE / model combination.
- What the agent did (a transcript, not a summary — the specific
  wrong output matters).
- What you expected instead.

### Fix a failure mode

Each failure mode in the current library is closed by a mechanical
gate, not prose guidance. Follow the same pattern:

1. Write a failing unit test in `tests/unit-tests/` that reproduces
   the agent's wrong output as a fixture.
2. Add the validator check to `scripts/validate-instantiation.sh`
   (bash/awk — see existing checks for the style).
3. Add the corresponding assertion to
   `tests/unit-tests/instantiation-validation.test.ts`.
4. If the check has steering implications, add a short rule to
   `prompts/steering/library-context.md` (stay under the line cap).

Prose-only fixes ("added a paragraph telling the agent not to do X")
tend to regress the next time the underlying model changes. Prefer a
mechanical gate.

### Add a module

Modules live in `prompts/modules/<category>/`. A module is a single
template that the engine can dissolve into project-specific content
during Step 2 or Step 3.

1. Put the file under the right category (run
   `ls prompts/modules/` to see existing categories).
2. Add an entry to `prompts/orchestrators/module-selection-index.md`
   mapping the intent to the module path.
3. If a property-based test fails, your module's shape is drifting —
   align with a neighboring module rather than loosening the test.

### Add documentation

Keep docs and engines in lock-step. If you add a validator check or
a new output artifact, also update:

- `README.md` (pipeline table + key files list)
- `QUICK_START.md` (expected output layout table)
- `prompts/AGENTS.md` (output artefacts table + hard rules if relevant)
- `prompts/orchestrators/README.md` (if an orchestrator changed)

A PR that adds a new artifact without updating all four will be
blocked on documentation drift.

---

## Things NOT to edit

- `prompts/outputs/current/**` — this is where a user's engine run
  writes its outputs. It is per-project, not part of the library.
- `prompts/outputs/self-maintain/**` — this is where the library's
  self-maintain mode writes. Also per-run, not committed content.
- Canonical-artifact producers — `revise-report.md` and
  `execution-log.md` are machine-produced. Don't "clean up" their
  YAML frontmatter by hand.

If in doubt whether a file is library content or per-run output,
check whether it's in `.gitignore`.

---

## Development setup

```bash
git clone https://github.com/ameedanxari/ai-prompt-library.git
cd ai-prompt-library
npm install
npm test
```

The test suite takes ~30 seconds. You should see over 700 tests pass and
none failing.

Run a single test file:

```bash
npm test -- tests/unit-tests/instantiation-validation.test.ts
```

---

## Commit and PR conventions

- One logical change per commit. Don't bundle a new validator check
  with a documentation refresh and a module addition — reviewers will
  ask you to split.
- Commit message format: `<type>(<scope>): <imperative summary>`,
  e.g. `feat(validator): reject multi-file tasks`,
  `fix(revise): avoid circular gate-check`,
  `docs: update output artefacts table`.
- PR body: describe the failure mode being closed, link to the field
  test where it was found if there is one, and call out any new
  validator checks so reviewers can verify the gate is mechanical.

---

## Code of conduct

Be precise, be honest, and don't paper over failures. If a field
test revealed that the agent did something unexpected, say so — the
library gets stronger from named failure modes, not from smoothed-over
anecdotes.

---

## Questions

- Discussions: <https://github.com/ameedanxari/ai-prompt-library/discussions>
- Issues: <https://github.com/ameedanxari/ai-prompt-library/issues>
