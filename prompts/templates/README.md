# `prompts/templates/` — legacy templates

This directory contains older template artefacts from pre-v1.0 versions
of the library. They are **not loaded by the v1.0 engine** — see
`prompts/orchestrators/drill-down-engine.md:301` which explicitly
instructs agents not to read from here.

They are retained because a handful of `src/*-processor.ts` validators
still scan them and would fail if the files vanished. Those validators
ensure that if someone revives any of these templates, they still have
the required shape. New work should live in `prompts/orchestrators/`,
`prompts/modules/`, or the v1.0 engine flow, not here.

## What remains

### User input & brief

- `user-input-template.md` — intake form for project requirements.
- `brief-validation.md` — validates a user brief has the needed shape.
- `feature-breakdown.md` — decomposes a feature spec.

### Implementation

- `implementation-prompt-generation.md` — generates per-task
  implementation prompts.
- `feature-implementation-prompt.md` — feature-level implementation
  prompt.
- `implementation-prompt-pack-template.md` — per-task executable
  prompt pack output shape.
- `implementation-dry-run.md` — dry-run framework for an
  implementation plan.
- `dry-run-framework.md` — generic dry-run structure.

### Testing

- `testing-strategy-generation.md` — test strategy scaffolding.
- `property-based-testing.md` — property-based test shape.
- `unit-testing-specification.md` — unit test spec shape.

### Design system

- `design-system-generation.md` — design system generation prompt.
- `design-system-foundation-template.md` — token architecture and
  platform mapping output.
- `design-system-component-catalog-template.md` — reusable component
  inventory output.
- `design-system-implementation-sequencing-template.md` — sequencing
  template for design-system-first implementation.
- `design-system-verification-report-template.md` — quality
  verification template.
- `screen-fidelity-matrix-template.md` — screen-by-screen mockup
  fidelity matrix.

### Contracts & delivery

- `integration-contracts-spec-template.md` — API/integration contract
  structure.
- `api-delivery-plan-template.md` — endpoint-level rollout plan.

### Token management

- `token-usage-management.md` — token usage optimisation.
- `token-chunking-validation.md` — token-chunk validation shape.

### Library self-introspection

- `library-vision-document.md` — vision doc output shape.
- `library-dependency-map.md` — module/template dependency map shape.
- `library-change-assessment.md` — change-impact assessment shape.

### Prompt traceability

- `prompt-usage-log-template.md` — per-stage prompt composition log.
- `prompt-composition-index-template.md` — output-to-prompt-block
  mapping index.

### Misc

- `examples/task-prompt-example.md` — sample.
- `gitignore-template.txt` — a `.gitignore` to seed new projects.

## If you're deciding whether to delete something here

Check whether any `src/*.ts` processor reads the file:

```bash
grep -rln "<filename>" src/ tests/
```

If nothing references it, it is safe to delete. If something does
reference it but that reference is clearly legacy (e.g. the processor
validates a feature the v1.0 engine replaced), consider deleting the
processor, its test, and the template together.
