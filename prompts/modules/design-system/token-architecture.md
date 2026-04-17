# Design System: Token Architecture

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
Define a token-driven visual system that is implementation-ready across web, mobile, and admin surfaces.

## Instructions
1. Extract visual primitives from source mockups/design files.
2. Define token groups: color, typography, spacing, radius, elevation, motion, breakpoints.
3. Create semantic token aliases (for example: `surface.primary`, `text.muted`).
4. Map tokens to each platform implementation layer (CSS vars, Flutter theme, etc.).
5. Document accessibility constraints (contrast, focus visibility, touch targets).

## Required Output Sections
Ensure `design-system-foundation.md` includes:
- Token dictionary with raw + semantic values
- Naming convention and versioning strategy
- Platform mapping table
- Theming strategy (brand/light/dark if applicable)
- Accessibility guardrails tied to tokens

## Acceptance Criteria
- No major UI style is left "free-form" outside token usage.
- Tokens are referenceable by engineering tasks.
- Platform mapping is concrete enough for direct implementation.
