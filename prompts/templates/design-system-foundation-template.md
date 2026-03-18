# Design System Foundation Template

## Purpose
Generate a production-ready, token-driven design foundation that can be implemented consistently across all in-scope UI platforms.

## Required Output
`prompts/outputs/specifications/design-system-foundation.md`

## Scope Activation Rule
Apply this template whenever project scope includes any UI surface (mobile app, web app, admin portal, desktop UI).

## Hard Rules
1. Define concrete token families: color, typography, spacing, radius, elevation, motion, breakpoints.
2. Include both raw tokens and semantic aliases (for example: `color.blue.600` -> `surface.brand.primary`).
3. Provide platform mappings for each in-scope platform (for example Flutter theme, CSS variables, React Native style tokens).
4. Include accessibility constraints tied to tokens (contrast, focus, target size, reduced motion behavior).
5. Link every major token family back to source design references or mockup files.
6. Include token governance rules (naming/versioning/deprecation/change approval).

## Forbidden
- Generic style prose without concrete token names.
- Token sets that are not mapped to implementation platforms.
- Missing accessibility guardrails.

## Required Sections
```markdown
# Design System Foundation

Date: [YYYY-MM-DD]
Mode: [Dry-Run|Execution]

## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/design-system-foundation-template.md`
- `.ai-prompts/prompts/modules/design-system/token-architecture.md`
- `.ai-prompts/prompts/stages/stage-01-intake/platform-agnostic.md`

## Scope
- In-scope surfaces: [mobile/web/admin/etc]
- Source references: [working_copy paths]

## Token Dictionary
| Token ID | Raw Value | Semantic Alias | Usage | Source Reference |
|---|---|---|---|---|
| `color.blue.600` | `#...` | `surface.brand.primary` | primary CTA | `working_copy/...` |

## Platform Mapping
| Semantic Token | Web (CSS) | Flutter | React Native | Notes |
|---|---|---|---|---|
| `surface.brand.primary` | `--surface-brand-primary` | `AppColors.brandPrimary` | `tokens.surface.brandPrimary` | |

## Accessibility Guardrails
- [Concrete rule list]

## Governance
- Naming conventions
- Versioning strategy
- Deprecation/replacement policy
```

## Validation Checklist
- [ ] All in-scope UI surfaces have platform mappings
- [ ] Token names are concrete and referenceable by implementation tasks
- [ ] Accessibility constraints are token-linked, not generic
- [ ] `Prompt Blocks Applied` contains concrete `.ai-prompts/prompts/...` paths
