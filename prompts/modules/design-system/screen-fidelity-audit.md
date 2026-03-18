# Design System: Screen Fidelity Audit

## Purpose
Verify that generated implementation plans preserve provided mockups and design intent.

## Instructions
1. Build a screen inventory from `working_copy/` and `prompts/working_copy/`.
2. For each screen, map:
   - source file/reference
   - required components
   - required tokens
   - key interactions/states
3. Record expected parity level and acceptable deviations.
4. Flag unresolved design gaps as blockers before implementation.

## Required Output
Generate `prompts/outputs/specifications/screen-fidelity-matrix.md` with:
- Screen-by-screen mapping
- Fidelity criteria (layout, spacing, typography, color, interactions)
- Status (`ready`, `needs-clarification`, `blocked`)
- Owner and follow-up actions for each gap

Required columns:
- `Screen ID`
- `Flow`
- `Source Mockup File`
- `Tokens Required`
- `Components Required`
- `Interaction Checks`
- `Status`
- `Owner`
- `Follow-up Task ID`

Forbidden:
- Grouped rows (for example "Student Onboarding" as one row)
- Missing source mockup references
- Missing task IDs for unresolved gaps

## Acceptance Criteria
- 100% of in-scope screens are mapped.
- Each mapped screen has measurable fidelity checks.
- Blocking gaps are explicitly listed, not silently assumed.
