# Design Research: UI Reference Source Map

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

Create a central, schema-backed design research artifact before UI task
generation so greenfield products have an explicit design direction and
existing products have a traceable answer for any named reference-research
gaps.

## Context

Use this module when a project includes UI-heavy features and either no
authoritative `project-context.md` Design Context exists, or Design Context
exists but `Reference/research needs` names missing Mobbin/Figma/product/
platform reference patterns. It turns product brief language and reference
research into a traceable source map that screen, dashboard, component, and
chart tasks must cite.

Existing products should prefer the extracted Design Context or audit
theme findings. This source map may still be used for missing patterns,
but it cannot override established product style without explicit
redesign/rebrand approval.

## Core Components

```typescript
interface UIReferenceMapRow {
  referenceCategory: string;
  observedPattern: string;
  productDecision: string;
  nonCopyBoundary: string;
  componentsAffected: string[];
  tokensAffected: string[];
  statesAffected: Array<"default" | "loading" | "empty" | "error" | "disabled" | "success">;
  responsiveNotes: string;
  accessibilityNotes: string;
}
```

## Required Artifact

Generate `prompts/outputs/current/ui-reference-source-map.md` when
greenfield UI-heavy planning has no existing Design Context, or when
existing-product Design Context records non-none `Reference/research needs`.

Required sections:

```markdown
# UI Reference Source Map

## Product Design Direction
- **Existing style authority:** no
- **Design intent:** <product-specific visual/interaction direction>
- **Primary surfaces:** <mobile | web | admin | desktop>
- **Non-copy rule:** references are pattern inspiration only

## Reference Evidence
| Row ID | Source Type | Product / File | Flow / Screen | URL / Path / Availability | Inspected At | Evidence Quality | Notes |
|---|---|---|---|---|---|---|---|
| REF-1 | mobbin \| figma \| existing-product \| app-store \| platform-guideline \| manual-note \| research-unavailable | <name> | <flow> | <url/path or unavailable reason> | <date> | inspected \| fallback \| unavailable | <why this source is relevant> |

## Reference Map
| Row ID | Evidence Row | Reference Category | Observed Pattern | Product Decision | Non-copy Boundary | Components Affected | Tokens Affected | States Affected | Responsive Notes | Accessibility Notes |
|---|---|---|---|---|---|---|---|---|---|---|
| MAP-1 | REF-1 | <category> | <pattern> | <decision> | <boundary> | <components> | <tokens> | default, loading, empty, error, disabled, success | <notes> | <notes> |

## Open Design Risks
- <risk or `none`>
```

## Implementation Requirements

1. Record 3-5 inspected reference evidence rows when no canonical
   product design exists. For existing products with named reference needs,
   cite current product files/screenshots first, then add evidence for only
   the missing patterns. If external research is unavailable, include a
   `research-unavailable` evidence row with the concrete reason and use
   fallback sources such as platform HIG/Material guidance, App Store
   screenshots, local product screenshots, or user-provided mockups.
2. Use product-specific reference categories, not vague phrases such as
   "modern apps" or "nice UI".
3. Every map row must point to an evidence row ID.
4. Every row must include a product decision and a non-copy boundary.
5. Every UI row must list components, tokens, all six states, responsive
   notes, and accessibility notes.
6. Native products must distinguish iOS and Android behavior when platform
   conventions differ.
7. Dashboard/chart rows must include chart states, legend/tooltip behavior,
   and non-visual summaries.

## Integration Points

- `drill-down-engine.md` writes this artifact before Step 3 for greenfield
  UI-heavy projects without external design context.
- UI task prompts cite this artifact in their UI design plan.
- `validate-instantiation.sh` checks that the artifact exists and has the
  required schema columns when UI-heavy task files are present without
  project/audit design context.

## Security Considerations

- Do not copy screenshots, brand systems, logos, icon sets, or proprietary
  assets from external references.
- Avoid storing paid-reference exports in the repository.
- Treat reference names as research notes, not source licenses.

## Testing Considerations

- Validator fixture should fail a greenfield UI task set with no
  `ui-reference-source-map.md`.
- Validator fixture should fail a malformed source map that lacks required
  columns.
- Validator fixture should fail a source map with only generic reference
  categories and no `Reference Evidence` rows or explicit
  `research-unavailable` rationale.
- Validator fixture should pass when the source map contains required
  evidence columns, map columns, and task files cite source-map row IDs.

## Acceptance Criteria

- Greenfield UI planning has a central design research artifact.
- Screen-level tasks cite the artifact instead of inventing ad hoc style.
- Existing-product theme precedence remains intact.
- References are converted into original, project-specific decisions.
