# Self-Maintain Orchestrator

Runs the library's own engines on the library itself. The founding
vision: "this prompt library should be helpful for self-maintaining
itself and generate release/future versions of itself based on changes
and updates in the AI landscape."

This orchestrator is the entry point for that.

## When to run

- A maintainer wants to audit the library for drift against its stated
  vision.
- A field test (a real project run against the library) produced
  observations about where the library underperformed, and those
  observations live in `prompts/outputs/field-tests/<run-name>.md`.
- The AI landscape changed (new model, new model behaviour) and the
  library's instructions may need updating.

## Inputs

- The library itself (`prompts/orchestrators/`, `prompts/modules/`,
  `prompts/AGENTS.md`, `prompts/steering/`, `scripts/`, `tests/`).
- `docs/rewrite-history/` — previous vision-alignment reports.
- Optional: `prompts/outputs/field-tests/<run-name>.md` — free-form
  observations about a specific end-to-end run, including what the
  user asked, what the agent did, what failed, what surprised the
  agent.
- Optional: recent `git log` of the library repo.

## How it works

The self-maintain flow re-uses `audit-and-remediate.md` with a narrow
scope: the "project" being audited is this library.

1. Run `external-input-handler.md` with `working_copy/` pointing at
   the library's own root — extract entities (orchestrators, modules,
   scripts, tests), flows (entry-point routing, engine steps), and
   constraints (auto-load budget, validator rules).
2. Run `audit-and-remediate.md` Step 1 against components:
   - `prompts/orchestrators/` (the 7 active orchestrators)
   - `prompts/modules/` (266 templates — sample, don't read all)
   - `prompts/steering/`
   - `scripts/`
   - `tests/`
   - `QUICK_START.md` + `README.md` + `MY_PROJECT.md.template`
3. In the audit's "What is broken or missing" section, explicitly
   compare against the founding vision and any attached field-test
   observations. Flag:
   - Instructions that a weak model couldn't follow in the field.
   - Instructions that contradict each other across files.
   - Coverage gaps (e.g. a module referenced by module-selection-
     index that does not exist; a stop condition documented but
     not enforced).
   - New AI-landscape facts the library does not yet account for.
4. Produce `gap-list.md` and `remediation-*.md` under
   `prompts/outputs/self-maintain/` (NOT `prompts/outputs/current/` —
   we don't want self-maintenance output to collide with an end-user
   project run).
5. Each remediation task targets a file in the library itself
   (`prompts/orchestrators/executor.md`, `scripts/validate-
   instantiation.sh`, etc.). Same task-shape rules apply — one file
   per task, precise change, closes a user story (where the "user"
   is another AI agent running the library).

## Execution contract

Self-maintain remediation tasks are not auto-executed. A human
maintainer must review and apply them, because:

- Library changes affect every downstream project; blast radius is
  high.
- Instruction rewrites benefit from human judgment about tone,
  precision, and cross-file consistency.
- The executor's sandbox assumptions (the library's own tests pass as
  a gate) apply, so maintainers should run `npm test` after each
  remediation batch.

## Output layout

```
prompts/outputs/self-maintain/
├── project-context.md              (library description, extracted)
├── audit-report.md                 (per-component library audit)
├── gap-list.md                     (library gaps, severity-ordered)
├── remediation-<gap-slug>.md       (one per gap)
└── external-accounts.md            (usually "No external services")
```

## Field-test input format

A maintainer or end-user can drop a free-form observation file into
`prompts/outputs/field-tests/<YYYY-MM-DD-run-name>.md`. No required
schema — the self-maintain flow's external-input-handler extracts what
matters. Useful sections:

```markdown
# Field Test — <run name>

## What the user asked
<verbatim prompt>

## What the agent did (summary)
<bullets>

## What worked
<bullets>

## What did not work
<bullets>

## Agent's own reasoning or complaints
<quotes or paraphrase>

## Model + context window used
<SWE 1.6 / Claude Opus 4.x / GPT-5 / etc.>
```

Once self-maintain runs, the field-test file is treated as input-only
(never modified) and a pointer to it lives in the generated
`audit-report.md`.

## See also

- `audit-and-remediate.md` — the engine this wraps.
- `external-input-handler.md` — pulls library structure into context.
- `revise-outputs.md` — run after self-maintain to check the library
  audit's own completeness.
- `docs/rewrite-history/` — historical self-maintenance artefacts.
