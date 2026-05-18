# Design System: Dashboard Screen Patterns

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

Define production dashboard patterns for admin panels, reporting surfaces,
analytics consoles, and operational tools.

## Context

Dashboards are work surfaces. They should favor scan density, predictable
navigation, clear filters, readable tables, and direct action over marketing
composition. For existing products, preserve the current shell, density,
spacing, typography, and component behavior unless the user explicitly asks
for redesign.

## Core Components

```typescript
interface DashboardSurfaceSpec {
  shell: "sidebar" | "topnav" | "split-nav" | "embedded";
  kpis: Array<{ label: string; valueSource: string; trend?: string }>;
  filters: Array<{ key: string; control: "date-range" | "select" | "search" | "segmented" }>;
  charts: Array<{ id: string; chartType: string; dataSource: string }>;
  tables: Array<{ id: string; rowEntity: string; primaryAction?: string }>;
  states: {
    loading: string;
    empty: string;
    error: string;
    disabled: string;
    success: string;
  };
}
```

## Implementation Requirements

1. Plan the dashboard shell first: navigation, header, filter bar, content
   grid, and table/action region.
2. Define KPI cards with source metrics, comparison periods, and loading and
   unavailable-data behavior.
3. Define chart regions with title, summary, filter dependencies, legend,
   tooltip, and no-data state.
4. Define table density, columns, sorting, filtering, pagination, row actions,
   bulk actions, and error/empty states.
5. Use product tokens for spacing, borders, text hierarchy, status colors, and
   chart accents. Do not invent a separate dashboard palette.
6. For responsive behavior, specify how KPI rows, filters, charts, and tables
   collapse on tablet and mobile.

## Integration Points

- Use analytics modules for event tracking and metric definitions.
- Use data-visualization patterns for chart grammar and accessibility.
- Use Tailwind CSS theme variables for web shell layout and component states.
- Use design-to-code validation for screenshot checks across key dashboard
  breakpoints.

## Security Considerations

- Respect role-based visibility for KPI cards, columns, filters, and row
  actions.
- Avoid leaking restricted aggregate metrics through client-side hidden fields.
- Ensure export/share actions preserve authorization checks.

## Testing Considerations

- Test loading, empty, error, disabled, and success states for each dashboard
  region.
- Test filter combinations, date ranges, and zero-result states.
- Test responsive layout at mobile, tablet, desktop, and large desktop widths.
- Test keyboard navigation through filters, chart summaries, table headers,
  pagination, and row actions.

## Acceptance Criteria

- Dashboard tasks define KPI, filter, chart, table, tooltip/legend, and state
  behavior before implementation.
- Dashboard layout uses the product's existing shell and design tokens.
- Empty/loading/error states are explicit for every data-dependent region.
- Visual QA includes at least one screenshot check for each major breakpoint.

