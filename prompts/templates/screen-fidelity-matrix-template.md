# Screen Fidelity Matrix Template

## Purpose
Guarantee screen-by-screen traceability from source mockups to implementation tasks with measurable parity checks.

## Required Output
`prompts/outputs/specifications/screen-fidelity-matrix.md`

## Required Rules
1. One row per in-scope screen (no grouped rows).
2. Every row must reference an exact source design file.
3. Every row must map required tokens and components.
4. Every row must include measurable checks and owner.

## Required Matrix
```markdown
| Screen ID | Flow | Source Mockup File | Tokens Required | Components Required | Interaction Checks | Status | Owner | Follow-up Task ID |
|---|---|---|---|---|---|---|---|---|
| STU-WELCOME-01 | Student onboarding | working_copy/design_repo/.../Tutor Hub 2 - Welcome.html | color.surface.primary, spacing.16, text.h1 | app-header, primary-button, hero-card | CTA tap -> onboarding step 2 | ready | design+mobile | M-1.3 |
```

## Validation Checklist
- [ ] Screen coverage equals in-scope screen inventory count
- [ ] No grouped labels (for example `Student Auth/Onboarding`)
- [ ] Every row includes source file + task ID
- [ ] Every row has status and owner
