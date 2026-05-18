# Design System: Component Implementation Pattern

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
Enforce a standardized pattern for building reusable UI components that directly derive from design tokens, eliminating hardcoded styles and ensuring consistency with hi-fidelity designs.

## Problem Solved
Components built without a consistent pattern lead to:
- Hardcoded color/spacing values scattered throughout component files
- Divergence from design system over time as components are copied/modified
- Difficulty maintaining component fidelity when design tokens change
- No clear mapping between design and implementation
- New work that ignores an already-built product's theme and creates an
  unrelated visual system

## Instructions

### 1. Component Structure Template

Every reusable component must follow this structure:

```typescript
// src/core/ui/ComponentName.tsx

import React, { type ReactNode, type HTMLAttributes } from "react";
import { designTokens } from "../design-tokens/tokens";

/**
 * Component Purpose
 *
 * Visual specs from design system:
 * - Design source: working_copy/design_repo/.../ComponentName.html
 * - Existing style source: src/core/ui/Button.tsx, src/styles/theme.css
 * - Token dependencies: --color-primary-600, --space-md, --radius-card
 * - State variants: default, loading, empty, error, disabled, success
 * - External references: pattern inspiration only; do not copy brand assets
 */

export type ComponentVariant = "primary" | "secondary";
export type ComponentState = "default" | "loading" | "empty" | "error" | "disabled" | "success";

export interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: ComponentVariant;
  state?: ComponentState;
}

/**
 * Variant mapping to design tokens
 * Source: Extracted from design system component spec
 */
const variantTokenMap: Record<ComponentVariant, Record<string, string>> = {
  primary: {
    background: designTokens.colors.primary["600"],
    text: "#ffffff",
    border: "transparent",
    shadow: designTokens.shadows.card,
  },
  secondary: {
    background: designTokens.colors.secondary["50"],
    text: designTokens.colors.secondary["900"],
    border: `1px solid ${designTokens.colors.secondary["200"]}`,
    shadow: designTokens.shadows.soft,
  },
};

/**
 * State modifier overrides
 */
const stateModifiers: Record<ComponentState, Record<string, string | number>> = {
  default: { opacity: 1, pointerEvents: "auto" },
  loading: { opacity: 0.6, pointerEvents: "none" },
  empty: { opacity: 1 },
  error: { borderColor: designTokens.colors.danger["500"] },
  disabled: { opacity: 0.5, pointerEvents: "none", cursor: "not-allowed" },
  success: { borderColor: designTokens.colors.success["500"] },
};

export function ComponentName({
  variant = "primary",
  state = "default",
  children,
  className = "",
  ...rest
}: ComponentProps): JSX.Element {
  const tokens = variantTokenMap[variant];
  const modifiers = stateModifiers[state];

  return (
    <div
      className={`
        inline-flex items-center justify-center
        transition-all duration-[var(--motion-fast)]
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-[var(--color-primary-600)]
        ${className}
      `}
      style={{
        backgroundColor: tokens.background,
        color: tokens.text,
        border: tokens.border,
        boxShadow: tokens.shadow,
        padding: `${designTokens.spacing.sm} ${designTokens.spacing.md}`,
        borderRadius: designTokens.radius.card,
        ...modifiers,
      }}
      data-component="ComponentName"
      data-variant={variant}
      data-state={state}
      {...rest}
    >
      {state === "loading" && <span>Loading...</span>}
      {state !== "loading" && children}
    </div>
  );
}

/**
 * Document expected usage and variants
 *
 * Usage:
 * - <ComponentName variant="primary">Click me</ComponentName>
 * - <ComponentName variant="secondary" state="disabled">Disabled</ComponentName>
 */
```

### 2. Token Dependency Declaration

Every component file must include:

```typescript
/**
 * Design System Token Dependencies
 * These tokens MUST be present in src/core/design-tokens/tokens.json
 * If any token is missing, the component build will fail (CI/CD validation).
 *
 * @tokens
 * - colors.primary.[50, 600, 700]
 * - colors.secondary.[50, 200, 900]
 * - colors.danger.[500]
 * - spacing.[sm, md, lg]
 * - radius.card
 * - shadows.[card, soft]
 * - typography.family
 * - motion.fast
 */
```

### 3. Component Test Requirements

Every reusable component must have matching test file with token validation:

```typescript
// src/core/ui/ComponentName.test.tsx

import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { ComponentName } from "./ComponentName";
import { designTokens } from "../design-tokens/tokens";

describe("ComponentName", () => {
  it("should apply variant styling from design tokens", () => {
    const { container } = render(
      <ComponentName variant="primary">Test</ComponentName>
    );
    const element = container.firstChild as HTMLElement;

    // Verify tokens are applied
    expect(element).toHaveStyle({
      backgroundColor: designTokens.colors.primary["600"],
      color: "#ffffff",
    });
  });

  it("should respect state modifiers", () => {
    const { container } = render(
      <ComponentName state="disabled">Test</ComponentName>
    );
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveStyle({ opacity: "0.5", pointerEvents: "none" });
  });

  it("should have proper accessibility attributes", () => {
    const { container } = render(
      <ComponentName>Test</ComponentName>
    );
    const element = container.firstChild as HTMLElement;

    expect(element).toHaveAttribute("data-component");
    expect(element).toHaveAttribute("data-variant");
  });
});
```

### 4. Component Documentation

Every component must have accompanying documentation:

```typescript
// src/core/ui/ComponentName.stories.tsx (or docs file)

/**
 * # ComponentName
 *
 * Reusable UI component building block.
 *
 * ## Design Source
 * - Hi-fidelity mockup: working_copy/design_repo/TutorHub - AdminFlow/.../ComponentName.html
 * - Component spec: prompts/outputs/specifications/design-system-component-catalog.md
 *
 * ## Variants
 * - `primary`: Primary action styling (token: --color-primary-600)
 * - `secondary`: Secondary action styling (token: --color-secondary-50)
 *
 * ## States
 * - `default`: Normal interactive state
 * - `loading`: Content loading, pointer events disabled
 * - `error`: Error state with danger color border
 * - `disabled`: Disabled state, not interactive
 *
 * ## Usage
 *
 * ```tsx
 * <ComponentName variant="primary" state="default">
 *   Click me
 * </ComponentName>
 * ```
 *
 * ## Token Dependencies
 * - colors.primary.[50, 600, 700]
 * - colors.secondary.[50, 200, 900]
 * - spacing.[sm, md]
 * - radius.card
 * - motion.fast
 *
 * ## Accessibility
 * - WCAG AA compliant contrast ratios via token definitions
 * - Focus-visible outline using primary color token
 * - Keyboard accessible all interactive states
 * - Semantic HTML structure
 */
```

### 5. Component Usage Rules

**REQUIRED patterns:**

1. **Token constants, never hardcoded literals:**
   ```typescript
   // ✅ GOOD
   backgroundColor: designTokens.colors.primary["600"]
   
   // ❌ FORBIDDEN
   backgroundColor: "#7c3aed"
   ```

2. **Variant/state mappings, never inline conditionals:**
   ```typescript
   // ✅ GOOD
   const variantTokenMap = { primary: {...}, secondary: {...} };
   style={{ ...variantTokenMap[variant] }}
   
   // ❌ FORBIDDEN
   style={{ backgroundColor: variant === "primary" ? "#7c3aed" : "#f8fafc" }}
   ```

3. **Datasheet attributes for testing and debugging:**
   ```typescript
   // ✅ GOOD
   <button data-component="Button" data-variant={variant} data-state={state} />
   
   // ❌ FORBIDDEN
   <button className="th-button th-primary" />
   ```

4. **State isolation - no prop spreading beyond intent:**
   ```typescript
   // ✅ GOOD
   <div style={{ color: tokens.text, ...modifiers }} {...rest} />
   
   // ❌ FORBIDDEN
   <div style={arbitraryStylesFromProps} />
   ```

### 6. Platform-Specific Component Rules

#### Web (React + Tailwind)
- Use Tailwind utilities only when they resolve to approved tokens,
  `@theme` variables, CSS variables, or the existing Tailwind config.
- Avoid `.css` files with hardcoded values
- Use `data-*` attributes instead of className combinations
- Preserve existing component and class conventions unless migration is
  explicitly in scope.

#### Mobile (Flutter)
- Use ThemeData extensions that reference token constants
- Never hardcode color hex or spacing values
- All components extend ThemeData styles

#### Admin (React + CSS)
- Use CSS custom properties (`var(--color-primary-600)`)
- Fallback to inline styles with `designTokens` constants
- Document which approach is authoritative

## Required Deliverables

1. **Component Template** (`templates/component-implementation-template.tsx`)
   - Standardized structure all components must follow
   - Included in every new component task

2. **Linting Rules** (`.eslintrc` addition or `eslint-plugin-design-tokens`)
   - Flag any hardcoded color/spacing values
   - Enforce token constant usage
   - Validate component structure compliance

3. **Component Audit Report** (Auto-generated)
   - Scan all components for token usage compliance
   - Report violations: hardcoded values, missing documentation, improper state handling
   - Included in CI/CD validation

## Acceptance Criteria

- ✅ Component only uses `designTokens` constants, never hardcoded values
- ✅ Variant/state mappings are declarative, not conditional
- ✅ Component has comprehensive test coverage for all variants/states:
  default, loading, empty, error, disabled, success
- ✅ `data-component`, `data-variant`, `data-state` attributes present
- ✅ TypeDoc comments include design source and token dependencies
- ✅ Linter passes with no `design-tokens` violations
- ✅ Component matches hi-fidelity design mockup visually
- ✅ Existing product styling is preserved unless redesign/rebrand is explicit

## Integration with Stage 06 Tasks

When generating component implementation tasks:

```
## Pattern Enforcement
- All components must use design-tokens constants exclusively
- Use template: `.ai-prompts/prompts/templates/component-implementation-template.tsx`
- Linting rule: `yarn lint -- --rule design-tokens`
- Test coverage requirement: all variants × all states
- Code review: verify no hardcoded color/spacing values

## Validation
- Pre-commit: Check component token usage
- CI: Run design-tokens linter
- Code review: Visual fidelity check against design mockup
```
