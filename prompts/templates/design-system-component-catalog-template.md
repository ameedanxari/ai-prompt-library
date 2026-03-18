# Design System Component Catalog Template

## Purpose
Generate a reusable component catalog that composes all in-scope screens and enforces shared behavior/state contracts.

## Required Output
`prompts/outputs/specifications/design-system-component-catalog.md`

## Scope Activation Rule
Apply this template whenever project scope includes any UI screens.

## Hard Rules
1. Define primitives and domain components with stable IDs.
2. For each component, define variants and state matrix (`default`, `loading`, `empty`, `error`, `disabled`, `success` where applicable).
3. Map each component to required tokens from `design-system-foundation.md`.
4. Define accessibility behavior per component (keyboard/focus/screen-reader/touch target).
5. Map components to consuming screen IDs from `screen-fidelity-matrix.md` (or planned screen inventory if Stage 04 not complete).
6. Explicitly identify unresolved components and assign follow-up tasks.

## Forbidden
- Component lists without variants/states.
- Screen plans that require components not present in the catalog.
- Missing token mapping.

## Required Sections
```markdown
# Design System Component Catalog

Date: [YYYY-MM-DD]
Mode: [Dry-Run|Execution]

## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/design-system-component-catalog-template.md`
- `.ai-prompts/prompts/modules/design-system/component-system.md`
- `.ai-prompts/prompts/stages/stage-01-intake/platform-agnostic.md`

## Component Inventory
| Component ID | Type | Purpose | Consuming Screens |
|---|---|---|---|
| `button.primary` | primitive | primary action | `STU-ONB-01`, `ADM-TUT-01` |

## Variant and State Matrix
| Component ID | Variants | States | Platform Notes |
|---|---|---|---|
| `input.text` | `default`, `dense` | `default`, `error`, `disabled` | shared semantics |

## Token Mapping
| Component ID | Token Dependencies |
|---|---|
| `button.primary` | `surface.brand.primary`, `text.inverse`, `space.12` |

## Accessibility Contracts
- [Concrete behavior list]

## Gaps and Follow-up Tasks
| Gap | Impact | Follow-up Task ID | Owner |
|---|---|---|---|
```

## Validation Checklist
- [ ] Every in-scope screen can be composed from cataloged components
- [ ] Every component has variant/state definitions
- [ ] Every component has token mapping and accessibility behavior
- [ ] Gaps are tracked with follow-up task IDs
