# Design System: Review Artifact

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder, including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names, MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real paths, concrete token/component names, real
   reference evidence, and project-specific review instructions.
-->

## Purpose

Create a static, reviewable HTML artifact for the product design system so
the user can visually inspect tokens, components, states, and the reference
evidence behind design choices before screen-level implementation proceeds.

## Context

Use this module whenever a task creates or materially changes the design
system foundation: tokens, component catalog, component library, visual
language, native theme primitives, or cross-platform UI foundations.

This artifact is not a marketing page and not runtime product UI. It is a
local documentation surface for design review, feedback, and traceability.

## Required Project Artifact

Create or update:

`docs/design-system/review/index.html`

The HTML must be static and openable from disk or the project's docs server.
It must not require paid design-tool access or external network calls to
render. If the project already has a docs site, place this page at the
equivalent design-system review route and link to it from
`docs/design-system/README.md`.

## Required HTML Sections

The artifact must include:

- **Design direction summary** — product surface, density, navigation model,
  style authority, and redesign/rebrand status.
- **Reference evidence panel** — rows copied from
  `ui-reference-source-map.md` or the audit's existing-style source map:
  source type, product/file, flow/screen, URL/path/availability, inspected
  date, evidence quality, non-copy boundary, and the design decision it led
  to. Mobbin/Figma/App Store/platform guideline URLs must be links when
  available. If research was unavailable, show the `research-unavailable`
  reason visibly instead of hiding it.
- **Token swatches** — color, typography, spacing, radius, elevation, motion,
  and semantic aliases, with platform mappings.
- **Component gallery** — every foundation primitive and composed component
  planned for screen work, including variants.
- **State matrix** — default, loading, empty, error, disabled, and success
  examples for components that have those states.
- **Responsive previews** — mobile, tablet, desktop, and large desktop or the
  native platform equivalents for mobile-only projects.
- **Accessibility notes** — contrast guardrails, focus/touch target rules,
  reduced-motion behavior, and screen-reader labels where relevant.
- **Feedback checklist** — a short user-review checklist covering visual
  direction, reference alignment, missing states, accessibility concerns, and
  approval/blocking feedback.

## Task Requirements

When writing a task from this module:

1. The task's `File:` field should name `docs/design-system/review/index.html`
   when the review artifact is the primary deliverable. If the task primarily
   changes token/source files, list the HTML review artifact in precise
   changes and acceptance criteria.
2. Include the exact reference rows or URLs/paths that must appear in the
   HTML. Do not say "include references" generically.
3. Add acceptance criteria requiring the user-facing checkpoint to present
   the HTML path plus the reference URLs/paths and ask for review feedback.
4. Require a lightweight verification command, such as an HTML link checker,
   a Playwright smoke test, or a local file existence/content check that
   confirms the artifact includes token swatches, component states, and
   reference evidence.
5. Keep external references as pattern evidence only. Do not copy reference
   screenshots, brand assets, exact layouts, icon sets, or proprietary
   illustrations.

## Acceptance Criteria

- `docs/design-system/review/index.html` exists and can be opened locally.
- The page displays tokens, components, states, responsive examples, and
  accessibility notes.
- The page displays reference evidence with links/paths/availability and
  non-copy boundaries.
- The executor checkpoint surfaces the HTML artifact and reference evidence
  to the user and explicitly asks for feedback before subsequent screen work.
