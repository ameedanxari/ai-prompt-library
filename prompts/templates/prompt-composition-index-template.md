# Prompt Composition Index Template

## Purpose
Create a complete, auditable map from every generated artifact to the exact library prompt files used.

## Required Output
`prompts/outputs/specifications/prompt-composition-index.md`

## Hard Rules
1. Every generated markdown artifact under `prompts/outputs/` must have exactly one row in this index.
2. `Output File` must be a concrete path. Wildcards and grouped labels are forbidden.
3. `Prompt Blocks Applied` must be concrete prompt file paths (stage/module/template/orchestrator files).
4. If any artifact changes, update both this index and that artifact's `## Prompt Blocks Applied` section.
5. Do not mark stage complete if this index is missing rows.
6. `(none listed)` is forbidden in `Prompt Blocks Applied`.
7. Each row must include at least one `.ai-prompts/prompts/...` path.

## Forbidden Patterns
- `design-system*.md`
- `task lists`
- `deployment package`
- `stage-01..stage-10`
- any row where output path is not a real file path

## Required Structure
```markdown
# Prompt Composition Index

Date: [YYYY-MM-DD]
Mode: [Dry-Run|Execution]

## Stage 01 - Intake
| Output File | Prompt Blocks Applied | Why These Blocks |
|---|---|---|
| `prompts/outputs/specifications/requirements.md` | `.ai-prompts/prompts/stages/stage-01-intake/platform-agnostic.md`; `.ai-prompts/prompts/modules/asset-management/asset-scanner.md` | Extract requirements from source corpus |
| `prompts/outputs/specifications/asset-mapping.md` | `.ai-prompts/prompts/modules/asset-management/asset-scanner.md`; `.ai-prompts/prompts/modules/asset-management/mapping-generator.md` | Build auditable asset inventory |

## Stage 02 - Charter
| Output File | Prompt Blocks Applied | Why These Blocks |
|---|---|---|
| `prompts/outputs/specifications/charter.md` | `.ai-prompts/prompts/stages/stage-02-charter/platform-agnostic.md` | Scope and success criteria |

[... repeat for every stage ...]
```

## Validation Checklist
- [ ] No wildcard/grouped output labels
- [ ] Every row references a real output file path
- [ ] Every row references concrete `.ai-prompts/prompts/...` files
- [ ] No row contains `(none listed)` in `Prompt Blocks Applied`
- [ ] Row count equals number of generated markdown artifacts in `prompts/outputs/`
