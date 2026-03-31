# UI Fidelity Source Map Template

## Purpose
Create a source-of-truth map from provided high-fidelity assets (including HTML prototypes and clickable flows) so implementation can reproduce the design with measurable parity.

## Required Output
`prompts/outputs/specifications/ui-fidelity-source-map.md`

## Scope Activation Rule
Apply when ANY in-scope UI surface has source assets in `working_copy/` or `prompts/working_copy/` (mockups, HTML/CSS, prototype flows, design exports).

## Hard Rules
1. Inventory every UI source file used for parity (no implied or missing references).
2. For HTML/CSS mockups, capture reusable implementation anchors:
   - semantic regions (sidebar/topbar/content/footer)
   - component candidates
   - typography/color/spacing token candidates
   - interaction/state behavior visible in source
3. For clickable flows, map every transition (trigger -> destination screen/state).
4. Declare parity priority per screen (`strict`, `high`, `medium`) and list allowed deviations explicitly.
5. Mark unresolved source ambiguity as `blocked` with owner + follow-up task.

## Forbidden
- Reconstructing screens without listing source assets first.
- "Best judgment" parity decisions when source HTML/prototype is available.
- Grouped screen entries (for example "Auth Flow" as one row).

## Required Sections
```markdown
# UI Fidelity Source Map

Date: [YYYY-MM-DD]
Mode: [Dry-Run|Execution]

## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/ui-fidelity-source-map-template.md`
- `.ai-prompts/prompts/modules/design-system/screen-fidelity-audit.md`
- `.ai-prompts/prompts/stages/stage-01-intake/platform-agnostic.md`

## Source Asset Inventory
| Asset ID | File Path | Type | Surface | Notes |
|---|---|---|---|---|
| `ADM-HTML-01` | `working_copy/designs/admin/sign-in.html` | `html` | `admin` | Primary sign-in source |

## Screen Extraction Map
| Screen ID | Source Asset ID | Source Frame/Section | Parity Priority | Reuse Strategy | Status | Owner | Follow-up Task ID |
|---|---|---|---|---|---|---|---|
| `ADM-DASH-01` | `ADM-HTML-02` | `#dashboard-overview` | `strict` | Reuse shell composition + copy + chart hierarchy | `ready` | `design+web` | `ADM-6.4` |

## Clickable Flow Map
| Flow ID | Trigger Source | Trigger Event | Destination Screen ID | Expected State | Notes |
|---|---|---|---|---|---|
| `ADM-FLOW-04` | `ADM-SIGNIN-01` | `Sign In` click | `ADM-DASH-01` | `default` | Redirect after auth success |

## State Coverage Requirements
| Screen ID | Required States | Source Evidence | Gaps | Owner |
|---|---|---|---|---|
| `ADM-SIGNIN-01` | default, loading, error, empty | `working_copy/designs/admin/sign-in.html` | none | `design+web` |

## Source Ambiguities and Blockers
| Blocker | Impact | Owner | Follow-up Task ID | Due Date |
|---|---|---|---|---|
```

## Validation Checklist
- [ ] Every in-scope screen is traceable to concrete source files.
- [ ] Clickflow transitions are mapped screen-to-screen.
- [ ] HTML/CSS sources have explicit reuse strategy (not reinterpretation).
- [ ] All unresolved ambiguities are tracked with owner + task ID.
