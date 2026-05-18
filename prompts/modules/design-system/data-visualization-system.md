# Design System: Data Visualization System

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

Define chart, graph, and reporting visualization standards that work across
dashboards, analytics pages, admin consoles, and product insight screens.

## Context

Tailwind should style chart containers, legends, filters, tooltips, typography,
spacing, and responsive layout. It is not the chart engine. Use the project's
chosen visualization library for rendering, and use design tokens for colors,
states, and surrounding UI.

## Core Components

```typescript
interface ChartSpec {
  id: string;
  type: "line" | "bar" | "stacked-bar" | "area" | "pie" | "heatmap" | "funnel" | "cohort" | "scatter";
  dataSource: string;
  xAxis?: string;
  yAxis?: string;
  colorTokenSet: string[];
  summaryText: string;
  states: {
    loading: string;
    empty: string;
    error: string;
    disabled: string;
    success: string;
  };
  accessibilitySummary: string;
}
```

## Implementation Requirements

1. Select chart type based on the question being answered:
   trend, comparison, composition, distribution, relationship, funnel, or
   retention/cohort.
2. Define data contract, units, aggregation period, timezone handling, and
   missing-data behavior.
3. Use tokenized chart colors with semantic meaning. Do not use arbitrary
   rainbow palettes or hardcoded series colors.
4. Specify tooltip content, legend behavior, axis labels, gridlines, value
   formatting, and threshold markers.
5. Provide non-visual summaries for screen readers and compact text summaries
   for small screens.
6. Include loading, empty, error, disabled, and success states for each chart.

## Integration Points

- Analytics modules define event and metric semantics.
- Dashboard modules define placement, filters, and table pairings.
- Tailwind CSS modules style the chart card, legend, tooltip, skeleton, and
  responsive container.

## Security Considerations

- Redact or aggregate sensitive data before chart rendering.
- Do not expose restricted raw data in chart payloads or tooltip JSON.
- Ensure export/download actions enforce the same authorization rules as the
  source view.

## Testing Considerations

- Unit test data transforms, aggregation, timezone boundaries, and formatter
  output.
- Component test each chart state: loading, empty, error, disabled, success.
- Visual test representative data, zero data, long labels, many series, and
  mobile widths.
- Accessibility test keyboard focus, text summary, and color-independent
  interpretation.

## Acceptance Criteria

- Every chart task specifies chart type, data contract, formatting, tooltip,
  legend, accessibility summary, and all required states.
- Chart colors map to product tokens.
- Rendering library choice is preserved if the project already has one.
- Tailwind is used for layout and surrounding UI, not as the graph renderer.

