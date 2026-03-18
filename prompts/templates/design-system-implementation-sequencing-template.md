# Design System Implementation Sequencing Template

## Purpose
Enforce reusable component-system implementation before screen-level feature development in Stage 06.

## Required Output
`prompts/outputs/specifications/design-system-implementation-sequencing.md`

## Scope Activation Rule
Apply when any UI implementation track exists in Stage 06 (`mobile`, `web`, `admin`, desktop UI).

## Hard Rules
1. Define one design-system foundation task per UI track before screen-level tasks.
2. Foundation tasks must include token wiring, component primitives, and state variants.
3. All screen-level UI tasks must depend (directly or transitively) on design-system foundation tasks.
4. Include explicit mapping from component IDs to task IDs.
5. Include validation commands that confirm token/component reuse and no ad hoc styling drift.

## Forbidden
- UI task ordering where screen tasks appear before design-system foundation tasks.
- Ambiguous dependencies such as "all previous" without concrete references.
- Missing validation commands for design-system conformance.

## Required Sections
```markdown
# Design System Implementation Sequencing

Date: [YYYY-MM-DD]
Mode: [Dry-Run|Execution]

## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/design-system-implementation-sequencing-template.md`
- `.ai-prompts/prompts/modules/design-system/component-implementation-sequencing.md`
- `.ai-prompts/prompts/stages/stage-06-implementation/platform-agnostic.md`

## UI Surface Tracks
| Surface | Foundation Task ID | Screen Task Range | Dependency Rule |
|---|---|---|---|
| mobile-app | `M-1.2` | `M-2.x`, `M-3.x`, `M-4.x` | all screen tasks depend on `M-1.2` |
| admin-web | `A-1.0` | `A-1.x`, `A-2.x` | all screen tasks depend on `A-1.0` |

## Component-to-Task Mapping
| Component ID | Foundation Task | Consuming Tasks |
|---|---|---|

## Validation Gates
- [ ] Task ordering enforces foundation-before-screens
- [ ] Token/component references present in task files and implementation prompts
- [ ] No unresolved design-system gaps without follow-up tasks
```

## Validation Checklist
- [ ] Sequencing file exists for UI scope projects
- [ ] Every UI track has a design-system foundation task
- [ ] Screen tasks have dependency linkage to foundation task IDs
