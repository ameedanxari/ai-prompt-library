# Design System: Component System

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
Define a reusable component library aligned to the product’s mockups and interaction patterns.

## Instructions
1. Identify core primitives: button, input, card, modal, list, nav, table, badge, toast, tabs.
2. Define each component’s variants, states, and behavior contracts.
3. Map each component to token usage and accessibility requirements.
4. Document platform differences while preserving semantic parity.
5. Produce implementation guidance that can be turned into tasks directly.
6. For existing products, extend the current component library, density,
   typography, navigation, and theme conventions unless the user explicitly
   requested redesign or rebrand.
7. Pair component catalog work with a static design-system review artifact
   at `docs/design-system/review/index.html` so the user can visually review
   components, variants, states, and reference evidence before screen work.

## Required Output Sections
Ensure `design-system-component-catalog.md` includes:
- Component inventory table
- Variant/state matrix
- State coverage for `default`, `loading`, `empty`, `error`, `disabled`,
  and `success`
- Token usage map per component
- UI reference source map or existing-style source map
- Static HTML review artifact path (`docs/design-system/review/index.html`)
  with linked Mobbin/Figma/product/platform reference URLs or paths
- Interaction/accessibility notes
- Dependencies and composition rules

## Acceptance Criteria
- Every major screen can be composed using the cataloged components.
- No high-priority screen depends on undefined components.
- State behavior (`default`, `loading`, `empty`, `error`, `disabled`,
  `success`) is specified for core components.
- Existing product components are reused before new primitives are created.
