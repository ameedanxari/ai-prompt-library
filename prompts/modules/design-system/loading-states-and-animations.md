# Design System: Loading States and Animations

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
Define a comprehensive loading state system with motion tokens and reusable animation components that maintain design system fidelity while providing clear visual feedback to users. Ensure all loading indicators (spinners, shimmer effects, skeleton loaders, progress indicators) derive from design tokens and integrate seamlessly without deviating from the established visual language.

## Problem Solved
Loading states are often implemented inconsistently, causing:
- Multiple animation styles across the app (incompatible easing, durations, delays)
- Hardcoded keyframes and animation durations scattered throughout components
- Loading indicators that clash with design system colors/sizes
- No accessible loading state feedback for assistive technologies
- Shimmer/skeleton loaders that don't match component dimensions or spacing
- Performance issues from unoptimized animations
- Maintenance burden when animation timing needs updating globally

## Instructions

### 1. Motion Design Tokens

Define motion tokens in your canonical `tokens.json` alongside existing color/spacing tokens:

```json
{
  "motion": {
    "duration": {
      "fast": "150ms",
      "normal": "300ms",
      "slow": "500ms",
      "verySlow": "800ms"
    },
    "easing": {
      "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
      "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      "ease-out-cubic": "cubic-bezier(0.33, 0.66, 0.66, 1)"
    },
    "delay": {
      "immediate": "0ms",
      "quick": "50ms",
      "standard": "100ms"
    }
  },
  "loading": {
    "spinner": {
      "sizeXs": "16px",
      "sizeSm": "20px",
      "sizeMd": "24px",
      "sizeLg": "32px",
      "sizeXl": "48px",
      "strokeWidth": "2px",
      "trackOpacity": "0.12",
      "trackColor": "{color.neutral.200}"
    },
    "shimmer": {
      "backgroundColor": "{color.neutral.50}",
      "shimmerColor": "{color.neutral.100}",
      "shimmerWidth": "100px",
      "duration": "2000ms"
    },
    "skeleton": {
      "backgroundColor": "{color.neutral.100}",
      "animationDuration": "1600ms",
      "pulseOpacityMin": "0.6",
      "pulseOpacityMax": "1"
    }
  }
}
```

### 2. Loading State Classification

Classify loading states across three categories. Include in all relevant components:

**Category 1: Full Page / Modal Loading**
- Use when entire view/modal is fetching data
- Display centered spinner with optional label
- Block interaction (overlay with opacity)
- Minimum display time: 300ms (avoid flashing)

**Category 2: Inline / Component Loading**
- Use when specific component/section is fetching
- Replace content with shimmer or skeleton
- Maintain layout (no layout shift)
- Show spinner with reduced opacity overlay (optional)

**Category 3: Button / Action Loading**
- Use when action is processing
- Replace button text with spinner icon (or animated label)
- Disable button interaction
- Maintain button dimensions (no space collapse)

### 3. Loading Indicator Components

#### 3.1 Spinner Component Pattern

```typescript
// src/core/ui/LoadingSpinner.tsx

import React from "react";
import { designTokens } from "../design-tokens/tokens";

export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl";
export type SpinnerVariant = "primary" | "secondary" | "inverted";

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  label?: string;
  ariaLabel?: string;
  testId?: string;
}

const sizeMap: Record<SpinnerSize, string> = {
  xs: designTokens.loading.spinner.sizeXs,
  sm: designTokens.loading.spinner.sizeSm,
  md: designTokens.loading.spinner.sizeMd,
  lg: designTokens.loading.spinner.sizeLg,
  xl: designTokens.loading.spinner.sizeXl,
};

const variantColorMap: Record<SpinnerVariant, string> = {
  primary: designTokens.colors.primary["600"],
  secondary: designTokens.colors.secondary["600"],
  inverted: "#ffffff",
};

export function LoadingSpinner({
  size = "md",
  variant = "primary",
  label,
  ariaLabel = "Loading",
  testId = "loading-spinner",
}: LoadingSpinnerProps): JSX.Element {
  const spinnerSize = sizeMap[size];
  const color = variantColorMap[variant];
  const strokeWidth = designTokens.loading.spinner.strokeWidth;
  const trackOpacity = designTokens.loading.spinner.trackOpacity;
  const trackColor = designTokens.loading.spinner.trackColor;

  return (
    <div
      className="flex flex-col items-center justify-center gap-2"
      data-testid={testId}
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
    >
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes spin-reverse {
          0% { transform: rotate(360deg); }
          100% { transform: rotate(0deg); }
        }
        .spinner-svg {
          animation: spin ${designTokens.motion.duration.normal} 
            ${designTokens.motion.easing["ease-in-out"]} infinite;
        }
      `}</style>

      <svg
        className="spinner-svg"
        width={spinnerSize}
        height={spinnerSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Track (background circle) */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={trackColor}
          strokeWidth={strokeWidth}
          opacity={trackOpacity}
        />

        {/* Spinner (animated arc) */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray="62.83"
          strokeDashoffset="15.7"
          strokeLinecap="round"
        />
      </svg>

      {label && (
        <span
          className="text-sm font-medium"
          style={{ color: designTokens.colors.neutral["600"] }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
```

#### 3.2 Shimmer/Skeleton Component Pattern

```typescript
// src/core/ui/SkeletonLoader.tsx

import React from "react";
import { designTokens } from "../design-tokens/tokens";

export type SkeletonVariant = "text" | "heading" | "avatar" | "card" | "custom";

export interface SkeletonLoaderProps {
  variant?: SkeletonVariant;
  width?: string;
  height?: string;
  count?: number;
  className?: string;
  testId?: string;
}

const variantDimensions: Record<SkeletonVariant, { width: string; height: string }> = {
  text: { width: "100%", height: designTokens.spacing.md },
  heading: { width: "70%", height: designTokens.spacing.lg },
  avatar: { width: designTokens.loading.spinner.sizeLg, height: designTokens.loading.spinner.sizeLg },
  card: { width: "100%", height: "200px" },
  custom: { width: "100%", height: designTokens.spacing.md },
};

export function SkeletonLoader({
  variant = "text",
  width,
  height,
  count = 1,
  className = "",
  testId = "skeleton-loader",
}: SkeletonLoaderProps): JSX.Element {
  const dimensions = variantDimensions[variant];
  const finalWidth = width || dimensions.width;
  const finalHeight = height || dimensions.height;
  const backgroundColor = designTokens.loading.skeleton.backgroundColor;
  const animationDuration = designTokens.loading.skeleton.animationDuration;
  const pulseOpacityMin = designTokens.loading.skeleton.pulseOpacityMin;
  const pulseOpacityMax = designTokens.loading.skeleton.pulseOpacityMax;

  return (
    <div
      className={`space-y-2 ${className}`}
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% {
            opacity: ${pulseOpacityMax};
          }
          50% {
            opacity: ${pulseOpacityMin};
          }
        }
        .skeleton-item {
          animation: skeleton-pulse ${animationDuration} 
            ${designTokens.motion.easing["ease-in-out"]} infinite;
          background-color: ${backgroundColor};
          border-radius: ${designTokens.radius.card};
        }
      `}</style>

      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="skeleton-item"
          style={{
            width: finalWidth,
            height: finalHeight,
          }}
        />
      ))}
    </div>
  );
}
```

#### 3.3 Shimmer Effect Component

```typescript
// src/core/ui/ShimmerLoader.tsx

import React from "react";
import { designTokens } from "../design-tokens/tokens";

export interface ShimmerLoaderProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  count?: number;
  className?: string;
  testId?: string;
}

export function ShimmerLoader({
  width = "100%",
  height = "200px",
  borderRadius = designTokens.radius.card,
  count = 1,
  className = "",
  testId = "shimmer-loader",
}: ShimmerLoaderProps): JSX.Element {
  const baseColor = designTokens.loading.shimmer.backgroundColor;
  const shimmerColor = designTokens.loading.shimmer.shimmerColor;
  const shimmerWidth = designTokens.loading.shimmer.shimmerWidth;
  const duration = designTokens.loading.shimmer.duration;

  return (
    <div
      className={`space-y-3 ${className}`}
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-label="Loading content"
    >
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -${shimmerWidth} 0;
          }
          100% {
            background-position: calc(100% + ${shimmerWidth}) 0;
          }
        }
        .shimmer-item {
          background: linear-gradient(
            90deg,
            ${baseColor} 0%,
            ${shimmerColor} 50%,
            ${baseColor} 100%
          );
          background-size: ${shimmerWidth} 100%;
          animation: shimmer ${duration} infinite;
          border-radius: ${borderRadius};
        }
      `}</style>

      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="shimmer-item"
          style={{
            width,
            height,
          }}
        />
      ))}
    </div>
  );
}
```

### 4. Loading State Integration in Components

Every component using loading states must follow this pattern:

```typescript
// src/core/ui/UserCard.tsx
import React, { useState } from "react";
import { designTokens } from "../design-tokens/tokens";
import { LoadingSpinner } from "./LoadingSpinner";
import { SkeletonLoader } from "./SkeletonLoader";

export type CardState = "default" | "loading" | "error" | "empty";

export interface UserCardProps {
  userId?: string;
  state?: CardState;
}

/**
 * Loading state strategy:
 * - state="loading" → Display SkeletonLoader matching card dimensions
 * - Include loading token dependencies in component header comment
 */
export function UserCard({ userId, state = "default" }: UserCardProps): JSX.Element {
  if (state === "loading") {
    return (
      <div
        style={{
          padding: designTokens.spacing.lg,
          backgroundColor: designTokens.colors.neutral["50"],
          borderRadius: designTokens.radius.card,
          border: `1px solid ${designTokens.colors.neutral["200"]}`,
        }}
      >
        <SkeletonLoader
          variant="avatar"
          className="mb-4"
        />
        <SkeletonLoader
          variant="heading"
          count={1}
          className="mb-2"
        />
        <SkeletonLoader
          variant="text"
          count={2}
          width="80%"
        />
      </div>
    );
  }

  // ... rest of component implementation
}
```

### 5. Loading Animations Best Practices

**Duration Guidelines:**
- Fast interactions (button feedback): `motion.duration.fast` (150ms)
- Standard transitions: `motion.duration.normal` (300ms)
- Complex animations: `motion.duration.slow` (500ms)
- Very slow (loading indicators): `motion.duration.verySlow` (800ms)

**Easing Functions:**
- Action feedback: `ease-out` (starts fast, ends slow)
- Modal entrance: `ease-in-out` (smooth both directions)
- Loading spinners: `ease-in-out` (continuous smooth rotation)

**Accessibility Rules:**
- Always include `role="status"` and `aria-live="polite"` on loading indicators
- Provide semantic `ariaLabel` for screen readers
- Respect `prefers-reduced-motion` media query:

```typescript
export function getMotionPreference(): "reduced" | "normal" {
  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "reduced"
      : "normal";
  }
  return "normal";
}

// In component:
const duration = getMotionPreference() === "reduced" 
  ? "0ms" 
  : designTokens.motion.duration.normal;
```

**Performance Optimization:**
- Use `will-change: transform` on animated elements
- Prefer `transform` and `opacity` animations (GPU-accelerated)
- Avoid animating `width`, `height`, `left`, `top` (causes layout thrashing)
- Limit simultaneous animations to avoid jank
- Use `requestAnimationFrame` for frame-synchronized animations

```typescript
// ❌ AVOID - causes layout recalculation
.spinner { animation: widthChange 2s infinite; }

// ✅ GOOD - GPU-accelerated
.spinner { animation: spin 2s infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
```

### 6. Component Testing Requirements

Every loading state component must have:

```typescript
describe("LoadingSpinner", () => {
  it("renders with correct size token", () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "width",
      designTokens.loading.spinner.sizeLg
    );
  });

  it("renders animation with correct easing from tokens", () => {
    const { container } = render(<LoadingSpinner />);
    const style = window.getComputedStyle(container.querySelector("svg"));
    expect(style.animation).toContain(designTokens.motion.easing["ease-in-out"]);
  });

  it("includes accessibility attributes", () => {
    const { getByRole } = render(<LoadingSpinner ariaLabel="Fetching data" />);
    expect(getByRole("status")).toHaveAttribute("aria-label", "Fetching data");
  });

  it("respects prefers-reduced-motion", () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
    }));
    // Verify animation duration changes accordingly
  });
});
```

## Required Deliverables

1. **Motion Token Definitions** (`docs/MOTION_DESIGN_TOKENS.md`)
   - Comprehensive reference of all motion/loading tokens
   - Duration guidelines (when to use fast/normal/slow)
   - Easing function documentation with visual examples
   - Accessibility considerations (reduced-motion support)

2. **Loading Components Library** (`src/core/ui/loading/`)
   - `LoadingSpinner.tsx` — Reusable spinner in all sizes/variants
   - `SkeletonLoader.tsx` — Pulsing skeleton for content replacement
   - `ShimmerLoader.tsx` — Shimmer effect for progressive loading
   - `LoadingOverlay.tsx` — Full-page/modal loading overlay
   - `ButtonLoadingState.tsx` — Button-specific loading state
   - All with full storybook stories (`.stories.tsx`)

3. **Loading State Implementation Guide** (`docs/LOADING_STATES_IMPLEMENTATION.md`)
   - When to use each loading indicator type (full-page vs inline vs button)
   - Code examples for common patterns
   - Copy-paste templates for different scenarios
   - Anti-patterns to avoid

4. **Token Generation Updates** (`.ai-prompts/prompts/modules/design-system/token-generation-pipeline.md` updated)
   - Add motion/loading tokens to auto-generation script
   - Generate motion/loading tokens for Tailwind config
   - Generate TypeScript constants for durations/easings
   - Include in CI/CD validation

5. **Component Implementation Checklist** (`docs/LOADING_STATE_CHECKLIST.md`)
   - Template for auditing existing components
   - Verification steps for "all loading states use tokens"
   - Accessibility audit template

6. **CSS Animation Standard Library** (`src/styles/animations.css`)
   - Reusable keyframe definitions (spin, pulse, shimmer, slide)
   - All derived from motion design tokens
   - Documented with which components use each

## Acceptance Criteria

- [x] All motion tokens defined in canonical `tokens.json` with spacing/color precedence
- [x] All loading indicators (spinner, skeleton, shimmer) implemented as reusable components
- [x] Every loading indicator component:
  - Uses design tokens exclusively (no hardcoded durations/colors/sizes/easings)
  - Includes `role="status"` and `aria-live="polite"` for accessibility
  - Has `ariaLabel` parameter for screen readers
  - Respects `prefers-reduced-motion` media query
  - Has full test coverage (renders, uses correct tokens, accessibility)
  - Includes Storybook story with all variants
- [x] Loading API fully documented:
  - When to use full-page vs inline vs button loading states
  - Code examples for common patterns
  - Copy-paste templates available
- [x] No component uses hardcoded animation durations, easings, or colors in loading states
  - All derive from `designTokens.motion` or `designTokens.loading`
- [x] Component audit checklist created and verified against existing codebase
- [x] CI/CD validation rule: reject any CSS/JS animations not derived from motion tokens
- [x] All loading animations GPU-accelerated (use `transform`/`opacity` only)
- [x] Performance validated:
  - No layout thrashing animation properties
  - Simultaneous loading states don't cause jank
  - `will-change` applied to animated elements
- [x] Token generation pipeline updated to output motion/loading tokens to all platforms
- [x] Migration guide for existing hardcoded loading states → token-based

---

## Integration Points

**Integrates with:**
- `token-generation-pipeline.md` — Motion tokens generated and distributed
- `component-implementation-pattern.md` — Loading state pattern follows component structure
- `design-to-code-validation.md` — Validation rules verify animation token usage
- `governance-and-maintenance.md` — Animation timing changes governed by versioning process

**Used in Stage 06:**
- Component implementation sequencing includes loading state requirements
- Every component has loading state variants documented
- Button, Card, Modal, Form components include loading examples

**Used in Stage 09:**
- Design fidelity audit includes motion/animation verification
- Performance regression detection for animation frame rates
