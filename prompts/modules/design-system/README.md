# Design System Modules

## Purpose
Provide explicit prompt modules for building and enforcing a production-ready design system before screen-level implementation.

## Modules
- `token-architecture.md` - Defines design tokens, naming, and platform mappings.
- `token-generation-pipeline.md` - **[NEW]** Establishes single-source-of-truth for tokens with extraction, generation, and synchronization across platforms.
- `component-system.md` - Defines core component primitives, variants, states, and usage rules.
- `component-implementation-pattern.md` - **[NEW]** Standardized component structure enforcing token usage, eliminating hardcoded styles.
- `loading-states-and-animations.md` - **[NEW]** Motion design tokens, loading indicators (spinner/shimmer/skeleton), and animations integrated with design tokens.
- `design-to-code-validation.md` - **[NEW]** Automated verification that implementation matches design specifications.
- `governance-and-maintenance.md` - **[NEW]** Ownership, change control, versioning, and long-term sustainability processes.
- `dashboard-screen-patterns.md` - Dashboard shell, KPI, filter, table, and state planning for admin and analytics screens.
- `data-visualization-system.md` - Chart/graph contracts, state handling, tokenized colors, and accessibility summaries.
- `native-visual-effects-and-motion.md` - Platform-native material, glass,
  depth, and motion rules for artful native UI without sacrificing
  accessibility.
- `screen-fidelity-audit.md` - Verifies screen output fidelity against provided mockups.
- `component-implementation-sequencing.md` - Enforces reusable component foundation tasks before screen-level implementation.

## Required Outputs
When these modules are selected, they should drive:
- `prompts/outputs/current/ui-reference-source-map.md` when greenfield
  UI exists without authoritative design context.
- `prompts/outputs/current/features-*.md` feature specs that identify
  token, component, state, responsive, and accessibility requirements.
- `prompts/outputs/current/tasks-*.md` implementation prompts that
  sequence token/component foundation before screen work.
- `docs/DESIGN_TOKENS.md` (auto-generated)
- `docs/DESIGN_FIDELITY_AUDIT.md` (auto-generated)
- `docs/DESIGN_SYSTEM_GOVERNANCE.md` (governance charter)
- `docs/DESIGN_SYSTEM_VERSIONING.md` (versioning policy)
- `.github/workflows/design-token-validation.yml` (CI/CD enforcement)
- Infrastructure: `src/core/design-tokens/tokens.json`, generation scripts, linting rules
- Current task prompts must dissolve module guidance directly. Do not
  reference legacy template paths in generated output.

## Example Composition
```markdown
#[[module:design-system/token-architecture.md]]
#[[module:design-system/token-generation-pipeline.md]]
#[[module:design-system/component-system.md]]
#[[module:design-system/component-implementation-pattern.md]]
#[[module:design-system/loading-states-and-animations.md]]
#[[module:design-system/design-to-code-validation.md]]
#[[module:design-system/governance-and-maintenance.md]]
#[[module:design-system/dashboard-screen-patterns.md]]
#[[module:design-system/data-visualization-system.md]]
#[[module:design-system/native-visual-effects-and-motion.md]]
#[[module:design-system/component-implementation-sequencing.md]]
#[[module:design-system/screen-fidelity-audit.md]]
```

This composition ensures:
1. Tokens extracted and documented (token-architecture)
2. Token generation infrastructure established (token-generation-pipeline)
3. Components defined (component-system)
4. Component structure standardized (component-implementation-pattern)
5. Loading states and animations defined with motion tokens (loading-states-and-animations)
6. Design-to-code alignment enforced (design-to-code-validation)
7. Governance and maintenance processes established (governance-and-maintenance)
8. Implementation sequencing enforced (component-implementation-sequencing)
9. Fidelity audits performed (screen-fidelity-audit)
