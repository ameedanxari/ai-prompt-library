# Design System: Governance & Maintenance

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
Establish clear ownership, change control, and evolution processes for the design system to prevent drift and ensure long-term sustainability.

## Problem Solved
Without governance:
- Design decisions made ad-hoc without cross-team awareness
- Breaking changes introduced without migration path
- No version history or rollback capability
- Unclear who owns design system decisions
- Inconsistent implementation across teams

## Instructions

### 1. Ownership & Roles

Define clear accountability:

```
# Design System Governance

## Ownership
- **Design System Owner**: Product/Design Lead
  - Approves token changes
  - Reviews component additions
  - Sets roadmap priorities
  
- **Implementation Lead**: Tech Lead (Web/Mobile)
  - Ensures timely implementation of approved designs
  - Validates fidelity across platforms
  - Maintains generator scripts and CI/CD
  
- **Accessibility Reviewer**: Accessibility Champion
  - Audits token values for WCAG AA compliance
  - Reviews component state handling
  - Tests keyboard/screen reader support

## Review Protocol
- Proposed token changes: 2+ approvals (Design Owner + 1 Tech Lead)
- New components: Design Owner + Implementation Lead agreement
- Breaking changes: Requires migration documentation + deprecation notice
```

### 2. Token Change Process

```
## Token Change Workflow

### 1. Proposal Phase
Designer/Engineer proposes change in GitHub issue:
- Current value and proposed value
- Rationale (design refinement, accessibility fix, etc.)
- Affected components (auto-detected by linter)
- Migration impact assessment

### 2. Review Phase
- Design System Owner: Visual/UX alignment check
- Tech Lead: Implementation feasibility
- Accessibility Reviewer: WCAG AA compliance check

### 3. Decision Phase
- Approved: Proceed to implementation
- Request Changes: Address feedback and resubmit
- Rejected: Document rationale in issue, close

### 4. Implementation Phase
1. Update src/core/design-tokens/tokens.json
2. Add CHANGELOG entry (semantic versioning)
3. Run yarn generate-tokens (auto-generates all outputs)
4. CI validates all outputs consistent
5. Open PR with generated changes
6. Auto-comment affected components

### 5. Deployment Phase
- Merge to main with all validations passing
- Tag release with semantic version (v1.1.0, etc.)
- Trigger dependent build pipelines
- Notify teams of breaking changes (if any)

### 6. Communication Phase
- Post summary in team Slack
- Update DESIGN_TOKENS.md documentation
- Link to migration guide for breaking changes
```

### 3. Component Addition Process

```
## Component Addition Workflow

### Before Implementation
1. Design spec created: Designer adds mockup to design system file
2. Component spec documented: Added to design-system-component-catalog.md
3. Token dependencies identified: Documented in component spec
4. Accessibility requirements: Defined with WCAG AA rules

### During Implementation
1. Task created: A-1.0, M-1.2, etc. with explicit design mockup link
2. Component template used: Uses component-implementation-pattern.md
3. Token usage validated: Linter ensures no hardcoded values
4. Visual fidelity verified: Screenshots compared to design mockup
5. Accessibility tested: Keyboard, screen reader, color contrast

### Code Review Checklist
- [ ] Component uses only designTokens constants
- [ ] data-component, data-variant, data-state attributes present
- [ ] All variants × all states implemented and tested
- [ ] Visual fidelity matches design mockup pixel-for-pixel
- [ ] No hardcoded color/spacing values (linter passed)
- [ ] Accessibility requirements met (WCAG AA)
- [ ] Documentation complete (TypeDoc, Storybook, test scenarios)

### After Merge
- Component added to next release notes
- Teams notified of new component availability
- Update design system documentation site
```

### 4. Versioning Strategy

```
# Design System Versioning

## Semantic Versioning: MAJOR.MINOR.PATCH

### MAJOR (Breaking Changes)
Examples:
- Rename color token: primary-blue → primary-brand (requires code updates)
- Change spacing scale: 4px → 2px base (all spacing affected)
- Remove component: button → use new ButtonPrimary instead

Process:
1. Clear migration guide required
2. Deprecation notice: One release cycle before removal
3. Blog post: Explain rationale
4. Migration script: If possible, automate updates
5. Version bump: Publish as MAJOR
6. Release notes: Detailed migration instructions

### MINOR (Additions)
Examples:
- Add new color: success-light
- Add new component: Tooltip
- Add new state: "readonly"

Impact: Backward compatible, opt-in usage
Process: Standard addition workflow (above)
Release notes: Document new tokens/components

### PATCH (Fixes)
Examples:
- Fix contrast ratio in warning-500
- Fix spacing in Card component
- Update shadow blur radius

Impact: No code changes required, visual improvements
Process: Quick review, auto-deploy
Release notes: Minor fixes and improvements
```

### 5. Design System Registry (`docs/design-system-registry.md`)

```markdown
# Design System Registry

## Current Version
- Version: 1.2.0 (released 2026-03-31)
- Last Updated: 2026-03-31
- Owner: @product-lead
- Status: Stable

## Token Counts
- Colors: 42 tokens (7 color families × 6 shades each)
- Typography: 8 tokens (family + 4 weights)
- Spacing: 7 tokens (xs → xl)
- Radius: 3 tokens
- Shadows: 4 tokens
- Motion: 2 tokens
- Breakpoints: 4 tokens

## Component Status
| Component | Version | Status | Last Updated | Owner |
|---|---|---|---|---|
| Button | 1.2.0 | Stable | 2026-03-31 | @web-lead |
| Card | 1.2.0 | Stable | 2026-03-30 | @web-lead |
| Badge | 1.1.0 | Stable | 2026-03-15 | @web-lead |
| Tooltip | NEW | In Development | 2026-03-31 | @web-lead |

## Recent Changes
- [1.2.0] Added Tooltip component
- [1.2.0] Fixed primary-600 contrast for WCAG AAA
- [1.1.0] Added light variants to all semantic colors

## Deprecation Timeline
| Token/Component | Deprecated | Removal Target | Migration |
|---|---|---|---|
| info-color | 1.0.0 | 2.0.0 | Use primary-500 instead |
| ButtonOld | 0.9.0 | 1.5.0 | Use Button (v1.0+) |
```

### 6. Communication Templates

#### Token Change Notification (Slack Template)

```
📢 Design System Update: [Change Description]

Token Changed:
- From: primary-600 = #7c3aed
- To: primary-600 = #7d3bef (+1px brightness)

Impact: [Button, Badge, Header components]

Action Required:
- [ ] Regenerate local design tokens: yarn generate-tokens
- [ ] Re-build affected components
- [ ] Visual QA against design mockups
- [ ] No code changes needed (automatic via token generation)

Migration Guide: [Link to DESIGN_TOKENS.md]
Questions? Ask in #design-system-chat
```

#### Breaking Change Migration Guide

```markdown
# Migration Guide: v2.0 Breaking Changes

## What's Changing
The `info-color` token is being replaced with a dual semantic system.

## Why
Semantic colors better align with design system intent and WCAG compliance.

## Migration Steps

### Step 1: Update Token References
```typescript
// Before (v1.x)
backgroundColor: designTokens.colors.info

// After (v2.x)
backgroundColor: designTokens.colors.primary["500"]
```

### Step 2: Regenerate Outputs
```bash
yarn generate-tokens
yarn lint -- --plugin design-tokens  # Verify no violations
```

### Step 3: Visual QA
Compare rendered components against design mockups.

### Step 4: Deploy
All changes are backward compatible in rendering.

## Rollback
If issues discovered: `git checkout package.json && yarn install`

## Timeline
- Deprecated: v1.0.0 (released 2026-01-01)
- Breaking: v2.0.0 (released 2026-04-01)
- Removal: v3.0.0+ (future)
```

### 7. Maintenance Schedule

```
# Design System Maintenance Cadence

## Weekly
- [ ] Review new token/component proposals
- [ ] Validate no breaking changes pending review

## Monthly
- [ ] Design system health check
  - Run all validation scripts
  - Check for unused tokens
  - Audit hardcoded values in codebase
- [ ] Update DESIGN_SYSTEM_SOURCES.md with verification timestamps
- [ ] Publish fidelity report

## Quarterly
- [ ] Accessibility audit: WCAG AA/AAA compliance check
- [ ] Performance review: Check CSS bundle size
- [ ] Deprecation review: Mark old tokens for removal
- [ ] Release planning: Identify features for next MINOR/MAJOR

## Semi-Annually
- [ ] Design system retrospective
  - What worked well?
  - What's causing pain?
  - Roadmap refinement
- [ ] Platform alignment review: Ensure web/mobile/admin in sync
```

### 8. Anti-Patterns & Enforcement

```
# Design System Anti-Patterns

## ❌ Hardcoded Values
```typescript
// FORBIDDEN - Will fail linter and CI/CD
backgroundColor: "#7c3aed"
padding: "16px"
borderRadius: "12px"
```

✅ Remediation: Use designTokens constants

## ❌ Component Divergence
Creating Button variant for one surface specific style instead of 
adding to component spec and rolling out across all platforms.

✅ Remediation: Propose token/component change through governance process

## ❌ Ad-Hoc Token Changes
Updating tailwind.config.js directly without updating tokens.json.

✅ Remediation: Update tokens.json, run yarn generate-tokens

## ❌ Skipped Validation
Committing code that fails design-tokens linter.

✅ Remediation: Pre-commit hooks block violations

## ❌ Design Drift
Implementing screen without comparing to design mockup.

✅ Remediation: Visual fidelity check mandatory in code review
```

## Required Deliverables

1. **Governance Charter** (`docs/DESIGN_SYSTEM_GOVERNANCE.md`)
   - Roles and responsibilities
   - Decision-making process
   - Review protocols
   - Escalation paths

2. **Versioning Policy** (`docs/DESIGN_SYSTEM_VERSIONING.md`)
   - Semantic versioning rules
   - CHANGELOG template
   - Deprecation process
   - Migration guide template

3. **Design System Registry** (`docs/design-system-registry.md`)
   - Authoritative token/component inventory
   - Version history
   - Deprecation timeline
   - Status dashboard

4. **Change Communication Templates** (`templates/`)
   - Token change notification (Slack)
   - Breaking change migration guide
   - Release notes template
   - Team onboarding template

5. **Maintenance Runbook** (`docs/DESIGN_SYSTEM_MAINTENANCE.md`)
   - Weekly/monthly/quarterly checklists
   - Health check scripts
   - Escalation procedures

6. **Anti-Pattern Enforcement** (Built into tooling)
   - ESLint rules for violations
   - Pre-commit hooks
   - CI/CD validation
   - Code review checklist

## Acceptance Criteria

- ✅ Clear owner identified and empowered
- ✅ Token change process documented and enforced
- ✅ Versioning strategy defined (Semantic Versioning)
- ✅ Communication templates created and used
- ✅ Maintenance schedule documented and followed
- ✅ Anti-patterns detectable and enforceable via tooling
- ✅ Design system registry maintained and current
- ✅ Governance decisions traceable (GitHub issues, PRs)

## Integration with Stage 02 Planning (Charter)

```
## Design System Governance Section
When creating Stage 02 Charter:
- [ ] Identify design system owner
- [ ] Document review process
- [ ] Define maintainer responsibilities
- [ ] Establish escalation path for disputes
- [ ] Create communication channels (Slack, meetings, etc.)
```
