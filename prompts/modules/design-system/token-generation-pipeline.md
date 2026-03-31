# Design System: Token Generation Pipeline

## Purpose
Establish a single-source-of-truth for design tokens and enforce synchronization across all implementation layers (Tailwind config, React constants, mobile themes, design documentation).

## Problem Solved
Without this module, design tokens are manually copied to multiple locations (design HTML, tailwind.config.js, TypeScript constants, mobile theme files), creating synchronization risks and making governance impossible.

## Instructions

### 1. Identify Token Source of Truth
- Primary source: Design system file (Figma tokens, design HTML, or exported JSON)
- Establish one canonical location where designers/product manage all tokens
- Document the source file location and how it's maintained
- Create audit trail of token changes (versioning, changelog)

### 2. Create Token Extraction Model
Define how tokens will be extracted/compiled:
- **Format**: Canonical token model (JSON schema recommended for language-agnostic format)
- **Structure**:
  ```json
  {
    "version": "1.0.0",
    "tokens": {
      "color": {
        "primary": {
          "50": "#f5f3ff",
          "600": "#7c3aed",
          "900": "#4c1d95"
        }
      },
      "spacing": { "xs": "4px", "md": "16px" },
      "radius": { "card": "12px" },
      "shadow": { "card": "0 2px 10px rgba(0,0,0,0.08)" },
      "typography": { "family": "Inter", "weights": [300, 400, 600, 700] }
    },
    "metadata": {
      "exportedAt": "2026-03-31T00:00:00Z",
      "exportedBy": "design-system-generator",
      "sourceFile": "working_copy/design_repo/..."
    }
  }
  ```

### 3. Generate Platform-Specific Output
From canonical token model, generate:

#### A. Tailwind Config (`tailwind.config.js`)
- Automatically generate `theme.extend.colors`, `theme.extend.spacing`, `theme.extend.boxShadow`, `theme.extend.fontFamily`
- Include script: `scripts/generate-tailwind-config.js` that reads token JSON and outputs valid `tailwind.config.js`

#### B. TypeScript Constants (`src/core/design-tokens/tokens.ts`)
- Generate platform-specific token constants:
  ```typescript
  export const designTokens = {
    colors: { primary: { "50": "#f5f3ff", ... } },
    spacing: { xs: "4px", ... },
    shadows: { card: "..." },
    typography: { family: "Inter", weights: [...] }
  } as const;
  ```
- Type-safe export for component usage

#### C. CSS Variables (`src/core/design-tokens/variables.css` or PostCSS file)
- Generate CSS custom properties:
  ```css
  :root {
    --color-primary-50: #f5f3ff;
    --color-primary-600: #7c3aed;
    --space-xs: 4px;
    --radius-card: 12px;
    --shadow-card: 0 2px 10px rgba(0,0,0,0.08);
  }
  ```

#### D. Mobile Theme (Flutter/React Native)
- Generate platform-specific theme constants matching web token structure

#### E. Design Documentation
- Auto-generate design system reference docs that stay in sync with tokens

### 4. Create Synchronization Enforcement

#### CI/CD Validation Script
```bash
#!/bin/bash
# .github/workflows/validate-tokens.yml

# 1. Extract tokens from source file
yarn generate-tokens

# 2. Validate all generated outputs exist and are consistent
# 3. Check for unmaintained token usage in codebase (scanning for hardcoded colors/spacing)
# 4. Verify component library uses only token constants
# 5. Block merge if discrepancies found
```

#### Pre-commit Hook
```bash
# .husky/pre-commit
lint-staged:
  - "Check generated token files are in sync"
  - "Scan for hardcoded color/spacing values in tokens-dependent packages"
```

### 5. Component Implementation Rules

When components are built, enforce token usage:

**GOOD (Token-based):**
```typescript
export function Button({ variant = "primary" }: ButtonProps) {
  return (
    <button
      className={`
        px-[var(--space-md)] py-[var(--space-sm)]
        rounded-[var(--radius-card)]
        bg-[var(--color-primary-600)]
        text-white
        transition-[var(--motion-fast)]
      `}
    >
      {children}
    </button>
  );
}
```

**ANTI-PATTERN (Hardcoded Strings - Forbidden):**
```typescript
export function Button({ variant = "primary" }: ButtonProps) {
  return (
    <button className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700">
      {children}
    </button>
  );
}
```

## Required Deliverables

1. **Token Canon File** (`src/core/design-tokens/tokens.json`)
   - Single source of truth in canonical JSON format
   - Versioned and tracked in version control

2. **Generation Script** (`scripts/generate-design-tokens.js`)
   - Reads `tokens.json`
   - Outputs Tailwind config, TypeScript constants, CSS variables
   - Idempotent and reproducible

3. **Validation Script** (`scripts/validate-token-usage.js`)
   - Scans codebase for hardcoded color/spacing values
   - Reports violations
   - Used in CI/CD pipeline

4. **Token Usage Reference** (`docs/DESIGN_TOKENS.md`)
   - Auto-generated doc showing all available tokens
   - Component → token mapping guide
   - Update instructions for designers/developers

5. **CI/CD Integration** (`.github/workflows/design-token-validation.yml`)
   - Runs on every PR
   - Validates consistency across all layers
   - Blocks merge if violations detected

## Acceptance Criteria
- ✅ Single source of truth exists for all design tokens
- ✅ All generated outputs (Tailwind, TS constants, CSS vars) are identical in value
- ✅ No hardcoded color/spacing values in component library
- ✅ CI/CD enforces token usage in all modified files
- ✅ Token changes are automatically propagated to all platforms
- ✅ Design documentation auto-generates from canonical tokens

## Example Usage in Stage 06 Task

When generating component implementation tasks (A-1.0, M-1.2, etc.):

```
## Files to Create/Modify
- src/core/design-tokens/tokens.json [CREATED]
- scripts/generate-design-tokens.js [CREATED]
- scripts/validate-token-usage.js [CREATED]
- apps/admin_web/tailwind.config.js [GENERATED from tokens.json]
- apps/admin_web/src/core/design-tokens/tokens.ts [GENERATED]
- .github/workflows/design-token-validation.yml [CREATED]

## Pre-Implementation Validation
- [ ] Run `yarn generate-tokens` and verify all outputs match canonical values
- [ ] Run `yarn validate:tokens` and confirm no violations
```

## Platform Mapping Reference

| Token Layer | File | Platform | Format |
|---|---|---|---|
| Canonical | `src/core/design-tokens/tokens.json` | language-agnostic | JSON schema |
| Web (Tailwind) | `apps/admin_web/tailwind.config.js` | Web | JavaScript object |
| Web (React) | `apps/admin_web/src/core/design-tokens/tokens.ts` | Web | TypeScript const |
| Web (CSS) | `apps/admin_web/src/core/design-tokens/variables.css` | Web | CSS custom properties |
| Mobile (Flutter) | `apps/mobile_student/lib/core/theme/app_tokens.dart` | Mobile | Dart class |
| Docs | `docs/DESIGN_TOKENS.md` | Reference | Markdown (auto-generated) |
