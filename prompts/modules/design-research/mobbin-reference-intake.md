# Design Research: Public UI Reference Intake

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

Use Mobbin-style and free/public product references as design research
input so generated UI tasks are grounded in mature interaction patterns
while still producing an original interface for the current product.

## Context

This module applies to screen design, app flows, dashboards, onboarding,
settings, commerce, reporting, and other user-facing surfaces. It is a
research workflow, not a runtime dependency. If the product already has a
visual system, existing theme, component patterns, density, navigation,
and token usage are the primary source of truth; references may fill gaps
but must not replace the established style without an explicit redesign
decision.

## Core Components

```typescript
interface UIReferenceSource {
  source: "mobbin" | "figma" | "existing-product" | "app-store" | "play-store" | "product-site" | "free-reference-site" | "platform-guideline" | "screenshot" | "manual-note" | "research-unavailable";
  productOrFile: string;
  flowOrScreen: string;
  patternObserved: string;
  applicableDecision: string;
  nonCopyBoundary: string;
}

interface UIReferencePacket {
  productSurface: "mobile" | "web" | "admin" | "desktop";
  useCase: "dashboard" | "chart" | "app-screen" | "settings" | "onboarding" | "commerce" | "content";
  existingStyleAuthority: boolean;
  sources: UIReferenceSource[];
  tokenImplications: string[];
  componentImplications: string[];
  interactionStates: Array<"default" | "loading" | "empty" | "error" | "disabled" | "success">;
}
```

## Implementation Requirements

1. Classify the UI request by surface and use case before writing tasks:
   dashboard, data table, graph/chart, mobile app screen, web app screen,
   auth/onboarding, checkout/paywall, settings/profile, content, or
   marketing.
2. Collect and record 3-5 relevant inspected references when no canonical
   product design exists. Each reference must include source type, product
   or file name, flow/screen, URL/path or availability note, inspection date,
   the pattern being borrowed, and the part that must not be copied.
3. If Mobbin, Figma, or a paid/design-account source is unavailable, do
   not stop at `research-unavailable`. First perform online research and
   use inspectable free/public alternatives. Preferred fallback hierarchy:
   - supplied hi-fi designs, screenshots, or source files in `working_copy/`
   - existing product source/screenshots in the repository
   - official platform guidelines such as Apple HIG and Android Material
   - App Store and Google Play listings with screenshots/descriptions
   - product marketing pages with real app screenshots or flows
   - free UI reference libraries such as UIguana, Scrnshts, ASOInspo,
     AppLaunchpad screenshot inspiration, Page Flows public previews,
     UXArchive/archived flow libraries, Screenlane archives, Banani
     references, Litscreen, Supply UI, Handheld Design, Land-book-style
     galleries, or other inspectable public libraries relevant to the
     product surface
   - manually inspected competitor apps only when screenshots/pages are
     publicly visible or supplied by the user
4. Use `research-unavailable` only after the fallback hierarchy has been
   attempted and no inspectable public evidence exists, or browsing is
   unavailable. The source-map notes must state what was attempted and why
   the fallback could not be inspected.
5. For existing products, inspect current code/design files first and record
   existing visual language as authoritative. New design work must extend the
   current system unless the user explicitly requested redesign or rebrand.
6. Convert references into a UI reference source map with evidence row IDs,
   observed pattern, product-specific decision, tokens, components,
   interaction states, responsive behavior, and accessibility implications.
7. Do not output generic phrases like "make it beautiful" or "use modern UI".
   Every design decision must map to a concrete layout, component, token, or
   interaction rule.

## Integration Points

- `project-context.md` Design Context is loaded first and overrides generic
  reference patterns.
- Design-system modules convert the source map into tokens, components, and
  screen fidelity checks.
- Tailwind CSS modules translate decisions into theme variables and utilities
  for web surfaces.

## Security and Compliance

- Do not copy screenshots, brand marks, icon sets, proprietary illustrations,
  or exact screen composition from references.
- Do not include private Mobbin account data, exported images, or paid-source
  assets in generated project files.
- Treat references as pattern evidence only; implementation must be original
  and project-specific.

## Testing Considerations

- Verify each UI task cites specific source-map row IDs or contains an
  explicit "existing style is authoritative" note.
- Verify the source map contains inspected evidence rows or an explicit
  research-unavailable rationale; generic categories alone are not evidence.
- Verify every UI task names components, tokens, responsive behavior, and all
  required states: default, loading, empty, error, disabled, success.
- For existing products, verify new UI does not introduce unrelated colors,
  typography, spacing scales, or navigation patterns without an explicit
  redesign decision.

## Acceptance Criteria

- Every UI-heavy task has design research evidence or existing-style evidence.
- Reference patterns are translated into project-specific design decisions.
- Existing product theming takes precedence over new inspiration.
- The final task gives enough implementation detail to avoid ad hoc styling.
- A final design direction is recorded: chosen archetype, rejected
  archetypes, density, navigation model, core components, and visual QA
  targets.
