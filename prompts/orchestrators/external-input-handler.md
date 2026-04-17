# External-Input Handler

Runs ONCE, before the drill-down engine, whenever the user provides designs,
specs, or existing code. Its job is to extract project-specific context into
a single canonical file that downstream steps load INSTEAD of generic
templates.

## When to run

Trigger if any of the following exist:
- `working_copy/` or `prompts/working_copy/` has files (designs, mockups, HTML, images)
- User attached a spec document (PRD, RFC, architecture doc)
- Project already contains source code the user wants to extend

If none of these apply, skip this orchestrator and go straight to
`drill-down-engine.md` Step 1.

## Isolation rule

This orchestrator runs in **its own context**. Load ONLY the external
material the user provided. Do NOT load:
- Stage files
- Modules from `prompts/modules/`
- Templates from `prompts/templates/`
- The drill-down engine file
- Any steering files

You are reading the user's material fresh, not interpreting it through a
pre-existing lens.

## Extraction schema

Read all external material, then produce ONE file at
`prompts/outputs/current/project-context.md` with exactly these sections:

```markdown
# Project Context

_Derived from: <list each source file by path>_

## Entities
- `EntityName { field: type, field: type }` — one line per entity, real names

## Flows
- `<flow name>: step → step → step` — user-visible flows, concrete steps

## Constraints
- <constraint> — e.g. "must support offline mode", "PCI-DSS in scope",
  "response time < 200ms p95"

## Tech Decisions
- <decision> — e.g. "PostgreSQL 15", "Next.js 14 app router",
  "Stripe for payments (pre-approved)"

## Open Questions
- <question> — anything the material does not resolve
```

Rules for each section:
- **Entities:** pull real field names from the material. No generic `User` /
  `Thing` unless the material literally says so. Include types only when the
  material specifies them; otherwise note `type: unspecified`.
- **Flows:** name concrete screens, endpoints, or actions by the labels used
  in the source material (e.g. "Sign In" not "authenticate").
- **Constraints:** only include constraints explicitly stated or strongly
  implied by the material (e.g. HIPAA badge in mockup → HIPAA constraint).
- **Tech Decisions:** only include decisions the user has already made. If
  the material shows Tailwind classes, record "Tailwind CSS". Do NOT invent
  decisions.
- **Open Questions:** list, don't answer. Downstream steps resolve these
  with the user.

## Precedence rule (enforced downstream)

Once `project-context.md` exists, every subsequent orchestrator step (Steps
1–3 of `drill-down-engine.md`) MUST:

1. Load `project-context.md` BEFORE any template.
2. Treat `project-context.md` as authoritative whenever it conflicts with a
   template's default patterns, field names, endpoints, or tech choices.
3. Never overwrite a `project-context.md` decision with a template default.

**Templates are subordinate to project context, never the reverse.**

## Size target

`project-context.md` ≤ 200 lines. If it grows past that, you are copying
material instead of extracting. Re-read and compress to the schema above.

## Output

- Write to: `prompts/outputs/current/project-context.md`
- Do not write anywhere else.
- After writing, hand control back to the caller (usually the entry point,
  which then routes to `drill-down-engine.md` Step 1).
