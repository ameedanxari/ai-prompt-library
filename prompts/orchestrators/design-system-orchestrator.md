# Orchestrator: Design System-First Implementation

## Purpose
Orchestrate the complete design system workflow from specification through implementation, validation, and governance, ensuring single-source-of-truth and enforcement across all platforms.

## Problem Solved
Previous workflows:
- ❌ Specified tokens and components but didn't enforce extraction from design source
- ❌ Built components without standardized pattern or infrastructure
- ❌ No automated validation that code matched design
- ❌ No governance preventing design drift
- ❌ No mechanism to synchronize changes across platforms

This orchestrator ensures:
- ✅ Tokens extracted once and distributed to all platforms
- ✅ Components implemented using standardized, token-based patterns
- ✅ Design-to-code fidelity validated automatically and manually
- ✅ Governance and change control enforced
- ✅ Long-term sustainability built-in

## Workflow Map

```
┌─────────────────────────────────────────────────────────────────────┐
│ Stage 01: Intake & Specification                                   │
│ - Extract design system from hi-fi mockups                         │
│ - Define tokens, components, accessibility requirements            │
│ - Create design system registry and governance charter             │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
        Module Selection (Below this orchestrator)
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Output: Design System Specification                                │
│ - design-system-foundation.md                                       │
│ - design-system-component-catalog.md                               │
│ - DESIGN_SYSTEM_GOVERNANCE.md                                      │
│ - DESIGN_TOKENS.md (docs template)                                 │
│ - design-system-implementation-sequencing.md                       │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Stage 06: Implementation (Design System Foundation Phase)          │
│                                                                     │
│ Phase 1: Token Infrastructure                                      │
│ - Create src/core/design-tokens/tokens.json (canonical source)     │
│ - Create generation scripts (generate-design-tokens.js)            │
│ - Create validation scripts (validate-*.js)                        │
│ - Set up CI/CD pipeline (.github/workflows/design-token-*.yml)     │
│ - Set up pre-commit hooks (.husky/pre-commit)                      │
│                                                                     │
│ Phase 2: Component Foundation (A-1.0, M-1.2)                       │
│ - Generate Tailwind config from tokens.json                        │
│ - Generate TypeScript token constants                              │
│ - Implement primitive components (Button, Card, Badge, etc.)       │
│ - Implement admin-shell-layout with token-based styling            │
│ - Implement setup for mobile theme                                 │
│                                                                     │
│ Phase 3: Governance & Maintenance Setup                            │
│ - Create DESIGN_SYSTEM_REGISTRY.md                                 │
│ - Establish design system owner role                               │
│ - Create change review process                                     │
│ - Set up communication channels                                    │
│                                                                     │
│ Validation:                                                         │
│ - yarn generate-tokens (verify all outputs)                        │
│ - yarn validate:tokens (no mismatches)                             │
│ - yarn lint -- --plugin design-tokens (no hardcoded values)        │
│ - Visual QA: Compare rendered components to design mockups         │
│ - Component test coverage: All variants × states                   │
│                                                                     │
│ Exit Criteria:                                                      │
│ ✓ Token generation pipeline working end-to-end                    │
│ ✓ Primitive components using only token constants                 │
│ ✓ CI/CD validation passing                                        │
│ ✓ Documentation complete and auto-generating                      │
│ ✓ Governance process documented and ready                         │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Stage 06: Implementation (Screen Implementation Phase)             │
│ - All subsequent screen tasks (A-1.1, M-2.1, etc.) depend on       │
│   design system foundation tasks                                    │
│ - Screens use only primitive components + token constants          │
│ - Component implementation pattern enforced in code review         │
│ - Design-to-code validation run on every screen task               │
└─────────────────────────────────────────────────────────────────────┘
                                  ↓
┌─────────────────────────────────────────────────────────────────────┐
│ Stage 09: Quality Assurance & Verification                         │
│ - Run design fidelity audit (full audit matrix)                    │
│ - Visual regression detection                                      │
│ - Cross-platform token consistency check                           │
│ - Accessibility audit (WCAG AA via tokens)                         │
│ - Performance review (CSS bundle size)                             │
│ - Design system health check                                       │
└─────────────────────────────────────────────────────────────────────┘
```

## Execution Strategy

### When to Invoke This Orchestrator

**Trigger 1: New Product with Design System**
```
User Request: "Build new platform with web + mobile + admin surfaces"
↓
Route to this orchestrator
↓
Use all design-system modules in sequence
↓
Build token infrastructure first
↓
Implement component foundation before any screens
```

**Trigger 2: Existing Project Needing Design System Alignment**
```
User Request: "Align implementation to hi-fi designs, establish single source of truth"
↓
Route to this orchestrator in remediation mode
↓
Use subset of design-system modules (focus on infrastructure)
↓
Retrofitting phase: Migrate existing components to token-based patterns
↓
Stage: 06-REMEDIATION or special track
```

**Trigger 3: Design System Enhancement/Maintenance**
```
User Request: "Add new token" or "Create new component"
↓
Route through governance process from governance-and-maintenance.md
↓
Use component-implementation-pattern.md or token-generation-pipeline.md
↓
Validation: design-to-code-validation.md, CI/CD passes
↓
Deploy: Follow versioning from governance-and-maintenance.md
```

## Module Sequencing

### Stage 01 Input Phase (Design System Definition)

Compose these modules:
```
#[[module:design-system/token-architecture.md]]
#[[module:design-system/component-system.md]]
#[[module:design-system/loading-states-and-animations.md]]
#[[module:design-system/component-implementation-sequencing.md]]
#[[module:design-system/screen-fidelity-audit.md]]
```

Expected outputs:
- design-system-foundation.md (tokens defined)
- design-system-component-catalog.md (components defined)
- MOTION_DESIGN_TOKENS.md (motion tokens and loading indicators defined)
- design-system-implementation-sequencing.md (task sequencing)
- screen-fidelity-matrix.md (fidelity targets)

### Stage 06 Implementation Phase (Infrastructure Setup)

Compose these for foundation tasks (A-1.0, M-1.2):
```
#[[module:design-system/token-generation-pipeline.md]]
#[[module:design-system/component-implementation-pattern.md]]
#[[module:design-system/loading-states-and-animations.md]]
#[[module:design-system/governance-and-maintenance.md]]
#[[module:design-system/design-to-code-validation.md]]
#[[module:design-system/screen-fidelity-audit.md]]
```

Expected outputs from foundation tasks:
- Canonical token file (src/core/design-tokens/tokens.json)
- Generation scripts (scripts/generate-design-tokens.js, etc.)
- Validation scripts (scripts/validate-*.js)
- ESLint rules (eslint-plugin-design-tokens)
- CI/CD pipelines (.github/workflows/design-token-*.yml)
- Pre-commit hooks (.husky/pre-commit)
- Primitive component implementations including loading indicators
- Loading components library (src/core/ui/loading/)
- Motion design tokens documentation (docs/MOTION_DESIGN_TOKENS.md)
- Governance charter (docs/DESIGN_SYSTEM_GOVERNANCE.md)
- Versioning policy (docs/DESIGN_SYSTEM_VERSIONING.md)
- Component template (templates/component-implementation-template.tsx)

### Stage 06 Screen Implementation Phase (Dependent Tasks)

All subsequent screen tasks depend on foundation tasks and use:
- Token constants from token-generation-pipeline
- Component pattern from component-implementation-pattern.md
- Validation from design-to-code-validation.md

Example A-1.1 task prompt would include:
```
## Prerequisites
- ✓ Complete A-1.0 (Design System Foundation)
- ✓ Verify: yarn generate-tokens passes
- ✓ Verify: yarn lint -- --plugin design-tokens passes

## Implementation Rules
- Use only designTokens constants (no hardcoded colors/spacing)
- Use primitive components from A-1.0 foundation
- Follow component-implementation-pattern.md structure
- Include data-component, data-variant, data-state attributes
- Test all variants × all states

## Code Review Checklist
- [ ] No hardcoded color/spacing values (linter enforced)
- [ ] Visual fidelity: Compare to working_copy/design_repo/... mockup
- [ ] Component token usage matches design specifications
- [ ] Accessibility: WCAG AA contrast maintained via tokens
- [ ] Test coverage: All variants × states

## Validation
- yarn lint (design-tokens plugin)
- yarn test:component
- yarn validate:visual-fidelity [component-name]
```

### Stage 09 Quality Phase (Verification)

Compose design-to-code-validation.md to run:
```
## Quality Gates
- [ ] Design fidelity audit: All properties match tokens
- [ ] Visual regression detection: Screenshots vs mockups
- [ ] Linter pass: No design-tokens violations
- [ ] CI/CD pass: All token validation workflows
- [ ] Accessibility audit: WCAG AA via tokens
- [ ] Cross-platform alignment: Web/mobile/admin tokens in sync
```

## Integration Points

### With Auto-Request Router
```
Route detection:
- "design system" + "governance" → governance-and-maintenance.md
- "design system" + "infrastructure" → token-generation-pipeline.md
- "component" + "pattern" → component-implementation-pattern.md
- "fidelity" + "validation" → design-to-code-validation.md
- "design system" + "full project" → this orchestrator
```

### With Stage Pipeline
```
Stage 01 detection:
- Input: Hi-fidelity design files present → Include design-system modules
- Output: design-system-*.md specifications and governance charter

Stage 06 sequencing:
- A-1.0 task: token-generation-pipeline + governance-and-maintenance
- A-1.1+ tasks: Depend on A-1.0, use component-implementation-pattern
- M-1.2 task: token-generation-pipeline for mobile platform
- All layout tasks: design-to-code-validation enforced in CI/CD

Stage 09 quality gate:
- Include design-to-code-validation requirements
- Verify no design drift since implementation start
```

### With Code Generation
```
When generating task prompts:
- Include design-tokens installation step if not present
- Include pre-commit hook setup if not present
- Include CI/CD workflow setup for validation
- Link to component-implementation-pattern.md template
- Link to governance process for modifications
```

## Error Recovery

If design system work detected as incomplete or diverged:

### Scenario: "Code has hardcoded colors but tokens exist"
```
Detection: Linter finds hardcoded '#7c3aed' in component
↓
Remediation:
  1. Identify the token: search tokens.json for matching value
  2. Update component: backgroundColor: designTokens.colors.primary["600"]
  3. Re-run linter: yarn lint -- --plugin design-tokens
  4. Document: Add comment explaining token selection
```

### Scenario: "Tailwind config drifted from tokens.json"
```
Detection: yarn validate:tailwind-config reports mismatch
↓
Remediation:
  1. Reset tailwind.config.js to auto-generated state
  2. Run: yarn generate-tokens
  3. Verify: yarn validate:tailwind-config
  4. Commit generated changes
  5. Investigate: What caused drift? Educate team on process
```

### Scenario: "Component visual doesn't match design mockup"
```
Detection: Visual regression test fails or manual QA finds issues
↓
Remediation:
  1. Compare component screenshot to design mockup
  2. Identify divergence: color? spacing? shadow?
  3. Trace to token: Is token value correct?
  4. Trace to implementation: Is component using token correctly?
  5. Fix: Update token or component
  6. Re-validate: yarn validate:visual-fidelity [component]
  7. Code review: Document what was wrong and how fixed
```

## Success Metrics

After this orchestrator completes:

- ✅ Single source of truth exists (tokens.json)
- ✅ Design tokens distributed to all platforms automatically
- ✅ Zero hardcoded color/spacing values in component library
- ✅ CI/CD enforces design system compliance on every PR
- ✅ Visual fidelity matches design mockups pixel-for-pixel
- ✅ Governance process prevents future drift
- ✅ Component implementation pattern standardized
- ✅ Design changes propagated to all platforms in <1 hour
- ✅ New team members onboarded to design system in <30 min
- ✅ Breaking changes managed with clear migration paths

## Transition to Maintenance

Once design system foundation is complete:

1. **Ownership Transfer**
   - Design System Owner identified and empowered
   - Team trained on governance process (governance-and-maintenance.md)
   - Communication channels established

2. **Ongoing Maintenance**
   - Weekly review of proposed changes
   - Monthly health checks
   - Quarterly strategic reviews

3. **Future Enhancements**
   - New tokens added through governance process
   - New components follow component-implementation-pattern.md
   - All changes validated through CI/CD
   - Breaking changes managed with deprecation timeline

4. **Documentation Handoff**
   - DESIGN_TOKENS.md (auto-generated, kept current)
   - DESIGN_SYSTEM_GOVERNANCE.md (governance reference)
   - DESIGN_SYSTEM_VERSIONING.md (version strategy)
   - DESIGN_SYSTEM_SOURCES.md (component mapping)
   - CHANGELOG.md (version history with migration guides)
