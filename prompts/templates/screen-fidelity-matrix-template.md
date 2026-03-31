# Screen Fidelity Matrix Template

## Purpose
Guarantee screen-by-screen traceability from source mockups to implementation tasks with measurable parity checks.

## Required Output
`prompts/outputs/specifications/screen-fidelity-matrix.md`

## Required Rules
1. One row per in-scope screen (no grouped rows).
2. Every row must reference an exact source design file.
3. Every row must include exact source frame/section IDs.
4. Every row must map required tokens and components.
5. Every row must include measurable checks and owner.
6. Every row must include clickflow IDs and required interaction/state coverage.
7. Every row must include parity priority (`strict|high|medium`) and visual evidence baseline ID.

## Required Matrix
```markdown
| Screen ID | Flow | Source Mockup File | Source Frame ID | Platform Surface | Clickflow ID(s) | Parity Priority | Tokens Required | Components Required | Exact Copy Checks | Shell Composition Checks | State Coverage | Visual Evidence Baseline | Status | Owner | Follow-up Task ID |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| STU-WELCOME-01 | Student onboarding | working_copy/design_repo/.../Tutor Hub 2 - Welcome.html | `#welcome-screen` | web | FLOW-ONB-01 | strict | color.surface.primary, spacing.16, text.h1 | app-header, primary-button, hero-card | Heading/body/CTA copy exact match | Header/hero/footer composition must match source | default, hover, focus, loading, error | baseline-stu-welcome-01-v1 | ready | design+web | W-1.3 |
```

## Validation Checklist
- [ ] Screen coverage equals in-scope screen inventory count
- [ ] No grouped labels (for example `Student Auth/Onboarding`)
- [ ] Every row includes source file + frame ID + task ID
- [ ] Every row includes clickflow IDs and state coverage
- [ ] Every row includes parity priority and visual evidence baseline
- [ ] Every row has status and owner
