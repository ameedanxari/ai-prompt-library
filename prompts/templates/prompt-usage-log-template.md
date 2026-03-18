# Prompt Usage Log Template

## Purpose
Provide a strict, stage-by-stage execution log proving which prompt-library blocks were used and what files they produced.

## Instructions
Use this template for `prompts/outputs/specifications/prompt-usage-log.md`.

Hard requirements:
1. Add one routing section for each routed request.
2. Add one section for each completed stage (`stage-01` ... `stage-10`).
3. Use concrete file paths for every selected block and output.
4. Include "gaps/follow-up" even when empty (`none`).

## Template
```markdown
# Prompt Usage Log

Date: [YYYY-MM-DD]
Mode: [Dry-Run|Execution]

## [UTC Timestamp] - Routing
- Request summary: [one line]
- Route selected: [SETUP|ATOMIC|PIPELINE|CONTINUE|ARCHIVE]
- Selected prompt blocks:
  - `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`
  - `.ai-prompts/prompts/orchestrators/auto-request-router.md`
- Outputs produced:
  - `prompts/outputs/ROUTING_DECISIONS.md`
- Gaps / follow-up:
  - none

## [UTC Timestamp] - stage-04-features
- Request summary: [one line]
- Selected prompt blocks:
  - `.ai-prompts/prompts/stages/stage-04-features/platform-agnostic.md`
  - `.ai-prompts/prompts/modules/integration/api-management.md`
  - `.ai-prompts/prompts/modules/design-system/screen-fidelity-audit.md`
  - `.ai-prompts/prompts/templates/api-delivery-plan-template.md`
- Why selected:
  - [reason 1]
  - [reason 2]
- Outputs produced:
  - `prompts/outputs/specifications/features.md`
  - `prompts/outputs/specifications/api-delivery-plan.md`
  - `prompts/outputs/specifications/screen-fidelity-matrix.md`
- Gaps / follow-up:
  - none
```

## Validation
- [ ] Routing entry exists for this request
- [ ] Stage entries exist for all completed stages
- [ ] Every selected block is a concrete `.ai-prompts/prompts/...` path
- [ ] Every output is a concrete `prompts/outputs/...` path
- [ ] No grouped labels (for example `stage-01..stage-10`, `task lists`)
