# Design System Modules

## Purpose
Provide explicit prompt modules for building and enforcing a production-ready design system before screen-level implementation.

## Modules
- `token-architecture.md` - Defines design tokens, naming, and platform mappings.
- `component-system.md` - Defines core component primitives, variants, states, and usage rules.
- `screen-fidelity-audit.md` - Verifies screen output fidelity against provided mockups.
- `component-implementation-sequencing.md` - Enforces reusable component foundation tasks before screen-level implementation.

## Required Outputs
When these modules are selected, they should drive:
- `prompts/outputs/specifications/design-system-foundation.md`
- `prompts/outputs/specifications/design-system-component-catalog.md`
- `prompts/outputs/specifications/ui-fidelity-source-map.md` (when high-fidelity UI source files exist)
- `prompts/outputs/specifications/screen-fidelity-matrix.md`
- Stage 06 task tracks that sequence design-system component implementation before screens
- `prompts/outputs/specifications/design-system-implementation-sequencing.md` (UI scope)
- `prompts/outputs/quality/design-system-verification-report.md` (UI scope)

## Complementary Templates
- `.ai-prompts/prompts/templates/design-system-foundation-template.md`
- `.ai-prompts/prompts/templates/design-system-component-catalog-template.md`
- `.ai-prompts/prompts/templates/ui-fidelity-source-map-template.md`
- `.ai-prompts/prompts/templates/design-system-implementation-sequencing-template.md`
- `.ai-prompts/prompts/templates/design-system-verification-report-template.md`

## Example Composition
```markdown
#[[module:design-system/token-architecture.md]]
#[[module:design-system/component-system.md]]
#[[module:design-system/component-implementation-sequencing.md]]
#[[module:design-system/screen-fidelity-audit.md]]
```
