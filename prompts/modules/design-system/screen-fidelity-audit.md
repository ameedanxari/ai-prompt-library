# Design System: Screen Fidelity Audit

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
Verify that generated implementation plans preserve provided mockups and design intent with measurable, screen-level fidelity gates.

## Instructions
1. Build a screen inventory from `working_copy/` and `prompts/working_copy/`.
1a. If HTML/CSS mockups or clickable flow docs exist, generate `ui-fidelity-source-map.md` first and use it as source-of-truth.
2. For each screen, map:
   - source file/reference
   - source frame/artboard ID
   - existing product style source files when the product is already built
   - Mobbin-style reference category when no canonical design exists
   - app surface (`mobile`, `web`, `admin`)
   - required components
   - required tokens
   - exact visible text/copy requirements
   - key interactions/states
3. Record expected parity level and acceptable deviations (must be explicit and approved).
3a. For strict/high parity screens, assign visual evidence baseline IDs and clickflow IDs.
4. Add measurable checks for:
   - shell composition (sidebar/topbar/header/footer/navigation)
   - typography hierarchy (family, size, weight, line-height)
   - spacing rhythm (section spacing, gutters, card padding, table rhythm)
   - color and gradient treatment
   - iconography consistency
   - interaction/state treatment (default/hover/focus/disabled/loading/empty/error)
5. Flag unresolved design gaps as blockers before implementation.
6. Reject completion for any screen with scaffold/placeholder substitutions in parity-required scope.
7. For existing products, treat current theming and component patterns as
   authoritative. New references can inform missing patterns, but cannot
   override existing style without an explicit redesign/rebrand decision.

## Required Output
Generate `prompts/outputs/specifications/screen-fidelity-matrix.md` with:
- Screen-by-screen mapping
- Fidelity criteria (layout, spacing, typography, color, interactions)
- Status (`ready`, `needs-clarification`, `blocked`)
- Owner and follow-up actions for each gap

If high-fidelity UI sources exist, also require:
- `prompts/outputs/specifications/ui-fidelity-source-map.md`

Required columns:
- `Screen ID`
- `Flow`
- `Source Mockup File`
- `Source Frame ID`
- `Existing Style Source`
- `Reference Research Source`
- `Platform Surface`
- `Tokens Required`
- `Components Required`
- `Exact Copy Checks`
- `Shell Composition Checks`
- `Typography Checks`
- `Spacing Checks`
- `Color/Gradient Checks`
- `Iconography Checks`
- `Interaction Checks`
- `Status`
- `Owner`
- `Follow-up Task ID`

Forbidden:
- Grouped rows (for example "Student Onboarding" as one row)
- Missing source mockup references
- Missing source frame IDs for UI surfaces unless the row is explicitly
  based on existing-product style source files
- Missing existing-style source for already-built products
- Missing task IDs for unresolved gaps
- Status `ready` without measurable checks
- Marking placeholder/scaffold screens as complete parity
- Reinterpreting source HTML/prototype composition without explicit approved deviation
- Introducing unrelated visual language into an existing product without
  explicit redesign/rebrand approval

## Acceptance Criteria
- 100% of in-scope screens are mapped.
- Each mapped screen has measurable fidelity checks.
- Blocking gaps are explicitly listed, not silently assumed.
- `ready` status is used only when all fidelity checks pass for that screen.

## Examples

```markdown
| Screen ID | Flow | Source Mockup File | Source Frame ID | Existing Style Source | Reference Research Source | Platform Surface | Tokens Required | Components Required | Exact Copy Checks | Shell Composition Checks | Typography Checks | Spacing Checks | Color/Gradient Checks | Iconography Checks | Interaction Checks | Status | Owner | Follow-up Task ID |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| A-1.0 | Admin Foundation | prompts/working_copy/admin-design.fig | Frame-1024 | apps/admin/src/styles/theme.css | Mobbin: admin analytics dashboards, pattern only | admin | brand/purple-500, text/main | sidebar, topbar, stats-card, data-table | Header/title/button labels match source | Sidebar widths + topbar search/action placement match source | Display/Heading scale matches source | Section/card/table spacing rhythm matches source | Primary gradient + dark surface treatment matches source | Line icon set and sizing match source | Hover/focus/disabled states match source behavior | ready | Design Lead | N/A |
```
