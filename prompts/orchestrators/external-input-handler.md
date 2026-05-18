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
- Modules from `prompts/modules/` (except one relevant to the current task)
- The drill-down engine file
- Any steering files

You are reading the user's material fresh, not interpreting it through a
pre-existing lens.

## Extraction schema

Read all external material, then produce ONE file at
`prompts/outputs/current/project-context.md` with exactly these sections:

```markdown
# Project Context

_Derived from:_
- `<exact file or directory path>` — <what it provided>
- `<...>` — <...>

## Roles
- `<role name>`: <one-line responsibility>   # every role in the system, even if one isn't mentioned in a mockup but is implied by the brief (e.g. "Admin")

## Product Identity
- **Product name:** <canonical name, if known>
- **Short name / code name:** <short name, if known>
- **iOS bundle ID:** <bundle ID, if known>
- **Android application ID:** <application ID, if known>
- **Web app slug:** <slug, if known>
- **Store listing title:** <title, if known>
- **Default locale:** <locale from user/material; otherwise user's current locale>

## Design Context
- **UI surfaces present:** <mobile | web | admin | desktop | none observed>
- **Existing theme authority:** <yes | no | unknown> — <one-line reason>
- **Design source files inspected:** <paths to mockups, screenshots, CSS/theme files, component libraries, or `none`>
- **Token/source of truth:** <tokens.json, Tailwind theme CSS, tailwind.config, Figma/design file, CSS variables, native theme file, or unknown>
- **Tailwind usage:** <v4 theme variables | tailwind.config | utility-only | not present | unknown>
- **CSS/UI framework:** <Tailwind, shadcn/ui, Material UI, SwiftUI, Jetpack Compose, Flutter, custom CSS, unknown>
- **Component library:** <existing primitives/components and paths, or unknown>
- **Typography style:** <font family, scale, weight patterns, or unknown>
- **Color/style notes:** <brand colors, semantic colors, light/dark mode, density, radius, elevation>
- **Navigation style:** <sidebar, top nav, tab bar, bottom nav, split nav, unknown>
- **Visual density:** <compact | standard | spacious | unknown>
- **Reference/research needs:** <Mobbin-style reference categories needed, or none because existing product style is authoritative>
- **Redesign requested:** <yes | no> — <quote or source if yes>

## Entities
- `EntityName { field: type, field: type }`  # real field names only

## Relationships
- `<Entity A>` <verb> `<Entity B>` (cardinality)  # e.g. "Business owned_by User (1:1)"

## Flows
- `<flow name>`: step → step → step  # concrete labels from the material

## Constraints
- <constraint>  # e.g. "offline-first", "WCAG 2.1 AA", "p95 < 200ms"

## Tech Decisions
- <decision>  # already-committed choices only

## Existing Implementation Status
# Only if the material includes real source code, not just designs/specs.
- `<component path>`: <% complete> — <what's working, what's not>

## Open Questions
- <question>  # list only; do not answer
```

Rules for each section:
- **Roles:** every distinct user type. If `MY_PROJECT.md` lists 4 roles but
  the mockups only show 2, include all 4 and flag the missing ones in
  Open Questions.
- **Product Identity:** keep naming and IDs stable across generated
  project files, bundle IDs, package IDs, screenshots, store metadata,
  and CI/release tasks. Do not invent a broad locale set; if none is
  specified, use the user's current locale only.
- **Entities:** pull real field names from the material. No generic `User` /
  `Thing` unless the material literally says so. Include types only when the
  material specifies them; otherwise note `type: unspecified`.
- **Relationships:** extract foreign keys, ownership, and cardinality
  explicitly. This is what Step 2 uses to decide data-model boundaries.
- **Flows:** name concrete screens, endpoints, or actions by the labels used
  in the source material (e.g. "Sign In" not "authenticate"). At least one
  flow per role.
- **Constraints:** only include constraints explicitly stated or strongly
  implied by the material (e.g. HIPAA badge in mockup → HIPAA constraint).
- **Design Context:** inspect existing source and design material for
  theming before inventing UI direction. If source code already contains
  substantial UI, set **Existing theme authority: yes** unless the user
  explicitly asked for redesign/rebrand. Record Tailwind usage when visible:
  modern `@theme` CSS variables, legacy `tailwind.config.*`, or utility-only
  usage. If no UI surface exists, state `none observed` rather than inventing
  a theme.
- **Tech Decisions:** only include decisions the user has already made. If
  the material shows Tailwind classes, record "Tailwind CSS". Do NOT invent
  decisions. Include version numbers when visible (e.g. "Node.js 18+").
- **Existing Implementation Status:** if the material is *code* (not just
  designs), estimate completion per top-level component (e.g. `backend/` ≈
  95%, `ios/` ≈ 85%). This tells Step 1 to produce gap-oriented epics
  rather than greenfield ones.
- **Open Questions:** list, don't answer. Downstream steps resolve these
  with the user. Include every role that wasn't fully represented in the
  material, every missing endpoint spec, and every inconsistency between
  the brief and the code.

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

## After writing — DO NOT STOP

This handler is not a terminal step. The moment `project-context.md` is
written to disk, you MUST immediately continue with:

**Next action (mandatory, no confirmation needed from the user):**

1. Open `prompts/orchestrators/drill-down-engine.md`.
2. Execute **Step 1 — Seed** using `project-context.md` + the user's brief.
3. Write `prompts/outputs/current/epics.md`.
4. Stop at the Step 1 checkpoint defined by the drill-down engine and
   wait for user review.

Do NOT tell the user "extraction complete, ready for next step" and wait.
Do NOT ask "should I proceed with Step 1?". Proceed.

The only acceptable reason to stop before Step 3 finishes is if a stop
condition in the engine trips and you must report it to the user for a
decision. Simply finishing the extraction is not a stop condition.

## Special case: existing codebase

If the project already has substantial implementation (you extracted
entities from real source files rather than designs/specs), the engine
should behave differently in Step 1:

- Epics may be **gap-oriented** ("finish iOS Xcode target setup",
  "wire CI/CD") rather than greenfield ("build authentication").
- Record each existing implementation's completion percentage in the
  `Open Questions` section, e.g. `iOS target setup: ~85% complete`.
- Flag any pre-existing code that conflicts with the brief as a
  decision the user must resolve before Step 2 expands features.
