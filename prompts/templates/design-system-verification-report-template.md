# Design System Verification Report Template

## Purpose
Provide a quality-stage report proving design-system usage and screen fidelity outcomes for UI scope projects.

## Required Output
`prompts/outputs/quality/design-system-verification-report.md`

## Scope Activation Rule
Apply in Stage 09 when project scope includes UI surfaces.

## Hard Rules
1. Report must cover token adoption, component reuse, and screen-fidelity checks.
2. Include measurable pass/fail criteria and unresolved gaps with owners.
3. Tie findings to task IDs and source mockup references.
4. Identify drift from `design-system-foundation.md` and `design-system-component-catalog.md`.
5. Include release recommendation (`go`, `go-with-waivers`, `no-go`) with rationale.

## Forbidden
- Pure narrative summary with no metrics.
- Gaps without owners or follow-up tasks.
- Declaring full fidelity without per-screen evidence.

## Required Sections
```markdown
# Design System Verification Report

Date: [YYYY-MM-DD]
Mode: [Dry-Run|Execution]

## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/design-system-verification-report-template.md`
- `.ai-prompts/prompts/modules/design-system/screen-fidelity-audit.md`
- `.ai-prompts/prompts/stages/stage-09-quality/platform-agnostic.md`

## Coverage Summary
| Area | Result | Evidence |
|---|---|---|
| Token adoption | pass/fail | [artifact refs] |
| Component reuse | pass/fail | [artifact refs] |
| Screen fidelity | pass/fail | [matrix refs] |

## Screen-Level Findings
| Screen ID | Fidelity Status | Gaps | Owner | Follow-up Task ID |
|---|---|---|---|---|

## System-Level Drift
| Drift Type | Severity | Source of Truth | Current State | Action |
|---|---|---|---|---|

## Release Recommendation
- Decision: `go|go-with-waivers|no-go`
- Rationale: [concise]
```

## Validation Checklist
- [ ] Metrics are concrete and evidence-backed
- [ ] Every unresolved issue has owner + follow-up task
- [ ] Decision is explicit and auditable
