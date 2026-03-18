# Design System: Token Architecture

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
