# Design System: Design-to-Code Validation

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
Establish automated verification that UI implementation matches hi-fidelity design specifications across all properties: colors, typography, spacing, layout, shadows, and interactive states.

## Problem Solved
Without systematic validation:
- Visual regressions introduced silently (shadow value drift, spacing changes)
- Design mockups diverge from code over time
- No audit trail of when/why implementation deviated
- Manual review becomes the only safeguard (error-prone, slow)

## Instructions

### 1. Fidelity Audit Checklist

Create a structured audit matrix comparing design specs to implementation:

| Category | Property | Design Value | Implementation | Status | Verified By |
|---|---|---|---|---|---|
| **Colors** | primary-50 | #f5f3ff | --color-primary-50: #f5f3ff | ✓ | CSS inspection |
| **Colors** | primary-600 | #7c3aed | designTokens.colors.primary[600] | ✓ | Code constant |
| **Typography** | font-family | Inter | Tailwind theme/config + @import | ✓ | CSS rule |
| **Typography** | font-weight (heading) | 700 | className="font-bold" | ✓ | Tailwind utility |
| **Typography** | font-size (body) | 14px | className="text-sm" | ✓ | Tailwind default |
| **Spacing** | padding (card) | 24px | --space-lg (24px) | ✓ | CSS variable |
| **Spacing** | gap (grid) | 16px | --space-md (16px) | ✓ | CSS variable |
| **Radius** | card | 16px | --radius-card (16px) | ✓ | CSS variable |
| **Shadow** | card | 0 2px 10px rgba(0,0,0,0.08) | --shadow-card match | ✓ | CSS value |
| **Responsive** | breakpoint (md) | 768px | Tailwind theme/config | ✓ | Config |
| **Motion** | transition speed | 150ms | --motion-fast | ✓ | CSS variable |

### 2. Automated Validation Scripts

#### A. CSS Variable Validator (`scripts/validate-css-variables.js`)

```bash
#!/usr/bin/env node

/**
 * Validate all CSS custom properties match declared tokens
 * 
 * Scans:
 * 1. src/core/design-tokens/tokens.json (canonical)
 * 2. src/**/*.css, *.tsx files for CSS variable usage
 * 3. Reports mismatches or missing declarations
 */

const tokens = require("../src/core/design-tokens/tokens.json");
const fs = require("fs");
const path = require("path");

// Parse CSS files for --var usage
// Cross-reference against tokens.json
// Report: ✓ valid, ✗ missing, ⚠ mismatch
```

**Exit on success:** `0`  
**Exit on failure:** `1` (also run in CI/CD)

#### B. Tailwind Theme Validator (`scripts/validate-tailwind-theme.js`)

```bash
#!/usr/bin/env node

/**
 * Verify Tailwind theme output was generated from tokens.json
 * 
 * Checks:
 * 1. @theme variables or tailwind.config theme.extend.colors match tokens.colors
 * 2. spacing variables/config match tokens.spacing
 * 3. shadow variables/config match tokens.shadow
 * 4. font variables/config match tokens.typography
 * 5. existing projects keep their current Tailwind setup unless migration is explicit
 * 
 * Output: Report any divergence with suggested fixes
 */
```

#### C. Component Token Usage Linter (ESLint Plugin)

```bash
#!/usr/bin/env node

/**
 * eslint-plugin-design-tokens
 * 
 * Rules enforced:
 * 1. no-hardcoded-colors - Flag hex/rgb/hsl color literals
 * 2. no-hardcoded-spacing - Flag pixel/rem values for space
 * 3. require-token-constants - Require designTokens.* usage
 * 4. design-token-completeness - All component data-* attributes present
 * 
 * Example:
 * backgroundColor: "#7c3aed" ❌
 * backgroundColor: designTokens.colors.primary["600"] ✅
 */

module.exports = {
  rules: {
    "no-hardcoded-colors": require("./rules/no-hardcoded-colors"),
    "no-hardcoded-spacing": require("./rules/no-hardcoded-spacing"),
    "require-token-constants": require("./rules/require-token-constants"),
  },
};
```

#### D. Visual Regression Detection (`scripts/validate-visual-fidelity.js`)

```bash
#!/usr/bin/env node

/**
 * Compare rendered component screenshots against design mockup
 * 
 * Using Playwright or Puppeteer:
 * 1. Render component in each state variant
 * 2. Capture screenshot
 * 3. Diff against design mockup image
 * 4. Report pixel-level discrepancies
 * 
 * Note: Requires Storybook or component preview harness
 */

// For each component in design-system-component-catalog.md:
// 1. Find corresponding design mockup file
// 2. Render component in preview
// 3. Compare visual output
// 4. Report failed matches with image diff
```

### 3. CI/CD Integration

#### GitHub Actions Workflow (`.github/workflows/design-fidelity-validation.yml`)

```yaml
name: Design Fidelity Validation

on: [pull_request, push]

jobs:
  validate-tokens:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Validate CSS Variables
        run: yarn validate:css-variables
        
      - name: Validate Tailwind Theme
        run: yarn validate:tailwind-theme
        
      - name: Lint Token Usage
        run: yarn lint -- --plugin design-tokens
        
      - name: Validate Visual Fidelity
        run: yarn validate:visual-fidelity
        
      - name: Report Violations
        if: failure()
        run: |
          echo "Design fidelity validation FAILED"
          echo "See the violations above and:"
          echo "1. Update src/core/design-tokens/tokens.json"
          echo "2. Run yarn generate-tokens"
          echo "3. Re-commit"
          exit 1
```

### 4. Pre-Commit Hook Integration

```bash
# .husky/pre-commit

#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Stage 1: Validate design tokens haven't changed inconsistently
yarn validate:css-variables
yarn validate:tailwind-theme

# Stage 2: Lint new component code
yarn lint -- --plugin design-tokens -- app/src

# Stage 3: If design tokens modified, regenerate all outputs
if git diff --cached --name-only | grep -q "design-tokens/tokens.json"; then
  yarn generate-tokens
  git add \
    "apps/admin_web/src/core/design-tokens/theme.css" \
    "apps/admin_web/src/core/design-tokens/tokens.ts" \
    "docs/DESIGN_TOKENS.md"
fi
```

### 5. Design Source Verification

#### Design Mockup Registry (`docs/DESIGN_SYSTEM_SOURCES.md`)

```markdown
# Design System Source Files

## Canonical Design Sources
- Admin Portal: `working_copy/design_repo/TutorHub Admin Design System.html`
- Mobile App: `working_copy/design_repo/TutorHub App Design System.html`

## Component Mapping
| Component | Design File | Last Verified | Verified By |
|---|---|---|---|
| Button | TutorHub Admin Design System.html (Line 450) | 2026-03-31 | design-audit |
| Card | TutorHub Admin Design System.html (Line 520) | 2026-03-31 | design-audit |
| Typography | Both files (Header sections) | 2026-03-31 | design-audit |

## Verification Process
1. Designer updates design file with new token value
2. Engineer extracts and updates `src/core/design-tokens/tokens.json`
3. `yarn generate-tokens` regenerates all platform outputs
4. CI validates all outputs match canonical source
5. Merge blocked if validation fails
```

### 6. Change Notification System

When design tokens change, track and notify:

```typescript
// scripts/design-token-change-tracker.js

/**
 * Track changes to design tokens between versions
 * 
 * Detects differences in:
 * - New tokens added
 * - Existing tokens modified
 * - Deprecated tokens removed
 * 
 * Output: CHANGELOG entry documenting:
 * - What changed
 * - Which components affected
 * - Migration path for implementers
 * 
 * Example:
 * 
 * ## v1.1.0 - 2026-04-01
 * 
 * ### Changed
 * - primary-600: #7c3aed → #7d3bef (1px brightness increase)
 * - Affected components: Button, Badge, Navigation
 * 
 * ### Added
 * - success-soft: #d1fae5 (new light success background)
 * 
 * ### Deprecated
 * - info-color: use primary-500 instead
 */
```

### 7. Component Fidelity Contract

Every screen-level component must include fidelity declaration:

```typescript
/**
 * Component Fidelity Declaration
 * 
 * Visual Properties Verified Against Design:
 * ✓ Colors: All UI colors use design token values
 * ✓ Typography: Font family, weight, size match design system
 * ✓ Spacing: Padding, margins, gaps use standard spacing scale
 * ✓ Radius: Border radius values from design token library
 * ✓ Shadows: Drop shadows match defined elevation system
 * ✓ Motion: Transitions/animations use standard motion times
 * ✓ States: Loading, error, disabled states use design tokens
 * ✓ Responsive: Layout adapts at design system breakpoints
 * ✓ Accessibility: WCAG AA contrast maintained via tokens
 * 
 * Last Verified: 2026-03-31
 * Verified Against: working_copy/design_repo/TutorHub Admin Design System.html
 * 
 * If any of above is ✗, component is OUT OF SPEC and must be fixed before merge.
 */
```

## Required Deliverables

1. **Fidelity Audit Matrix** (`docs/DESIGN_FIDELITY_AUDIT.md`)
   - Complete property-by-property verification checklist
   - Generated from token audit + manual visual inspection
   - Updated on every token change

2. **Validation Scripts** (`scripts/validate-*.js`)
   - CSS variable validator
   - Tailwind theme/config validator
   - Design token linter (ESLint plugin)
   - Visual regression detector
   - Change tracker

3. **CI/CD Pipeline** (`.github/workflows/design-fidelity-validation.yml`)
   - Runs on every PR
   - Blocks merge on validation failure
   - Reports violations with remediation steps

4. **Pre-commit Hooks** (`.husky/pre-commit`)
   - Validates tokens before commit
   - Auto-regenerates outputs if tokens changed
   - Lints component code for token compliance

5. **Design Source Registry** (`docs/DESIGN_SYSTEM_SOURCES.md`)
   - Maps each component to its source design file
   - Tracks verification timestamps
   - Documents migration path for token updates

## Acceptance Criteria

- ✅ All CSS variables match `tokens.json` values (CI validated)
- ✅ Tailwind theme/config auto-generated from tokens (no manual edits)
- ✅ UI reference source map or existing-style source map is present for UI screens
- ✅ Dashboard/chart tasks include default, loading, empty, error, disabled, and success states
- ✅ No hardcoded color/spacing values in components (linter enforced)
- ✅ Visual fidelity verified manually against design mockups (human review)
- ✅ CI/CD pipeline blocks merge if validations fail
- ✅ Design token changes trigger notification and CHANGELOG entry
- ✅ Component fidelity declarations present and up-to-date

## Integration with Quality Gate Stage (Stage 09)

```
## Quality Validation Tasks
- [ ] Run design fidelity audit: yarn validate:fidelity
- [ ] Generate fidelity report: docs/DESIGN_FIDELITY_AUDIT.md
- [ ] Manual visual review: Compare all screens to design mockups
- [ ] Accessibility audit: Verify WCAG AA via token-based contrast
- [ ] Linter pass: No design-token violations
- [ ] CI/CD green: All validation workflows pass
```
