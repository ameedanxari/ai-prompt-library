# Technology Stack: Tailwind CSS

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder, including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names, MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->

## Purpose

Use Tailwind CSS as the implementation contract for web UI while keeping
design tokens, existing theming, and component rules authoritative.

## Context

Prefer modern Tailwind theme variables when a project is new or already uses
Tailwind v4. Existing projects may still use `tailwind.config.js`; preserve
that setup unless migration is explicitly requested. Tailwind utilities should
express approved design decisions, not replace research, tokens, or component
governance.

## Core Components

```css
@import "tailwindcss";

@theme {
  --color-brand-50: #f8fafc;
  --color-brand-600: #2563eb;
  --color-surface-card: #ffffff;
  --color-text-muted: #64748b;
  --spacing-card: 1rem;
  --radius-control: 0.5rem;
  --shadow-card: 0 1px 3px rgb(15 23 42 / 0.12);
}
```

```typescript
interface TailwindDesignContract {
  tokenSource: "theme-css" | "tailwind-config" | "existing-design-system";
  themeFile: string;
  componentLayer: string;
  forbiddenPatterns: string[];
  validationCommand: string;
}
```

## Implementation Requirements

1. Identify the project's Tailwind version and current configuration before
   proposing changes.
2. For new projects, define theme variables for color, spacing, radius,
   elevation, typography, motion, and breakpoints before screen tasks.
3. For existing projects, extend the current theme and component conventions;
   do not replace class naming, tokens, or design primitives without an
   explicit migration task.
4. Use semantic token names for product meaning, not visual guesses such as
   `purpleThing` or arbitrary per-screen colors.
5. Avoid one-off arbitrary values unless they reference CSS variables from the
   token source, for example `rounded-[var(--radius-control)]`.
6. Keep chart rendering in the chart library. Use Tailwind for chart cards,
   legends, tooltips, skeletons, filters, and responsive containers.

## Integration Points

- Token generation writes theme CSS or updates the existing Tailwind config.
- Component implementation uses the token source through utilities or CSS
  variables.
- Design-to-code validation checks generated CSS/theme output against the
  canonical token model.

## Security Considerations

- Do not inject user-controlled class strings without safelisting and
  validation.
- Keep dynamic class names constrained to known variants to prevent broken
  production builds from Tailwind content scanning.
- Do not load remote fonts or assets unless the project policy allows them.

## Testing Considerations

- Validate generated theme variables or Tailwind config against token JSON.
- Lint component files for hardcoded hex, rgb, hsl, and ad hoc spacing values.
- Screenshot core screens at defined breakpoints.
- Test dark mode or tenant theme variants when the product supports them.

## Acceptance Criteria

- Tailwind configuration is derived from or aligned with the canonical design
  token source.
- Components do not introduce unapproved hardcoded color or spacing values.
- Existing Tailwind projects keep their current conventions unless migration is
  explicitly in scope.
- UI tasks include theme/token validation and responsive screenshot QA.

