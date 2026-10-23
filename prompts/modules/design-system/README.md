# Design System Modules

## Purpose
Provide explicit prompt modules for building and enforcing a design system alongside the active composed-screen proof.

## Modules
- `token-architecture.md` - Defines design tokens, naming, and platform mappings.
- `token-generation-pipeline.md` - **[NEW]** Establishes single-source-of-truth for tokens with extraction, generation, and synchronization across platforms.
- `component-system.md` - Defines core component primitives, variants, states, and usage rules.
- `component-implementation-pattern.md` - **[NEW]** Standardized component structure enforcing token usage, eliminating hardcoded styles.
- `loading-states-and-animations.md` - **[NEW]** Motion design tokens, loading indicators (spinner/shimmer/skeleton), and animations integrated with design tokens.
- `design-to-code-validation.md` - **[NEW]** Automated verification that implementation matches design specifications.
- `governance-and-maintenance.md` - **[NEW]** Ownership, change control, versioning, and long-term sustainability processes.
- `design-system-review-artifact.md` - Static HTML design-system review
  page with tokens, components, states, responsive previews, reference
  evidence, and user feedback checklist.
- `dashboard-screen-patterns.md` - Dashboard shell, KPI, filter, table, and state planning for admin and analytics screens.
- `data-visualization-system.md` - Chart/graph contracts, state handling, tokenized colors, and accessibility summaries.
- `native-visual-effects-and-motion.md` - Platform-native material, glass,
  depth, and motion rules for artful native UI without sacrificing
  accessibility.
- `screen-fidelity-audit.md` - Verifies screen output fidelity against provided mockups.
- `component-implementation-sequencing.md` - Sequences necessary reusable components within the active slice.

## Slice-scoped use

Select only modules needed for the actual visual outcome or concrete design risk. Create only useful supporting artifacts; no automatic governance, token-generation or catalogue inventory is required before composed screens. Existing tokens/components should be reused and extended.

Inspect actual provided visual references and preserve source constraints; inaccessible references remain uncertainty. The active slice includes relevant content, accessibility, responsive/device states and recovery. A catalogue or token approval cannot establish composed-screen acceptance: capture and inspect the actual application entry, useful success and relevant recovery on its declared target.

Keep detailed work within the shared slice budget and preserve deferred scope concisely. Required owner/independent review needs trustworthy provenance bound to reviewed artifacts and scope. Module examples are guidance, not authorization to invent scope, external actions or approval.

Consumer-project `docs/…` paths in modules are examples for applicable supporting artifacts. Library documentation uses `.ai-prompts/docs/…`. Dissolve guidance into project-specific instructions rather than referencing templates in executable output.
