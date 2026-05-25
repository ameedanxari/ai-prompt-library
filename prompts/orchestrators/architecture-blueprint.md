# Architecture Blueprint Orchestrator

Produces `prompts/outputs/current/architecture.md` — the single
source of truth for tech-stack choices, layer boundaries, data flow,
performance budgets, and architectural decision records (ADRs).
Downstream task generation (drill-down Step 3) cites this file
instead of re-deriving stack choices per task. Without it, weak
models pick a different framework per task and the resulting
codebase is incoherent.

## When to run

Runs **after** `drill-down-engine.md` Step 2 (Expansion, all
`features-*.md` written) and **before** Step 3 (atomic task
generation). Specifically: after the external-services rollup, after
`ui-reference-source-map.md` if applicable, and before any
`tasks-*.md` file is written.

The entry point invokes this orchestrator automatically for
greenfield runs. Audit-and-remediate runs do NOT trigger it — the
existing codebase already encodes the architecture.

## Inputs

- `prompts/outputs/current/product-vision.md` (positioning + non-goals
  constrain stack choice — e.g. "no network access" forbids cloud
  services).
- `prompts/outputs/current/epics.md` (platform list, complexity sense).
- All `prompts/outputs/current/features-*.md` (data model, API
  contracts, dependencies — aggregated to derive entity catalog).
- `prompts/outputs/current/external-accounts.md` (third-party services
  that constrain stack choices).
- `prompts/outputs/current/project-context.md` if it exists (existing
  codebase already commits to a stack — preserve it).
- `prompts/outputs/current/ui-reference-source-map.md` if it exists
  (UI architecture is part of the blueprint).
- One or more **technology-stack modules** from
  `.ai-prompts/prompts/modules/technology-stacks/` selected via
  `module-selection-index.md`. These modules contain stack-specific
  best practices and patterns — load the ones that match the
  project's platform and domain.

Do NOT load individual feature modules — too much detail.

## Output schema

Write to `prompts/outputs/current/architecture.md`:

```markdown
---
generated_at: <ISO 8601>
project_name: <from product-vision.md>
platforms: <comma-separated>
existing_codebase: <yes | no>
---

# Architecture — <Project Name>

## Layer map
<ASCII diagram, mermaid block, or labelled list naming each layer
and the responsibility boundary. Examples of layers a typical
mobile project would have: Presentation (SwiftUI / Compose) →
Application (use cases / view models) → Domain (entities, business
rules) → Data (repositories, local persistence) → Platform
(PhotoKit, MediaStore, Core ML, ML Kit). For backend: Edge → API →
Service → Repository → Storage.>

## Tech stack (per platform / per layer)
| Platform / layer | Choice | Why this, not the alternative |
|---|---|---|
| <e.g. iOS · Presentation> | SwiftUI + Observation framework | Native iOS 18+ stack; UIKit interop only where AVKit/PhotoKit forces it. |
| ... | | |

Every row's "Why this" must name the alternative that was rejected
and the reason for rejection. "Because it's modern" is not a
reason — performance characteristic, license, team familiarity,
platform restriction, ecosystem maturity ARE reasons.

## Data flow
<One paragraph + a diagram. Describe the end-to-end path of the
product's core workflow: where data originates, which layers it
passes through, where it is persisted, where it is consumed.
Highlight zero-network points if applicable. Highlight
backpressure / batching / caching points.>

## Domain entities (aggregated from features-*.md)
| Entity | Fields | Lives in | Lifecycle |
|---|---|---|---|
| <Entity> | <field: type, …> | <local DB / memory / disk> | <created when / deleted when> |

Aggregation rule: walk every `features-*.md`, collect its
`data_model:` declarations, dedupe by entity name. When two
features declare the same entity with different fields, MERGE the
fields and add a note. When two features declare entities with the
same role under different names, surface the conflict — a
canonical name has to be chosen before tasks are generated.

## API contracts (aggregated)
| Surface | Endpoints / signatures | Owned by feature |
|---|---|---|
| <e.g. Auth HTTP API> | `POST /auth/signup` → req `{email,password}` → res `{token}`; `POST /auth/login` → … | features-account-identity.md |

For local-only / no-backend projects, this section becomes "Local
contracts" — Swift protocols, Kotlin interfaces, internal pub/sub
topics — but the discipline is the same: name them once.

## Performance budgets (3–7, measurable)
| Operation | Budget | Measured how |
|---|---|---|
| Cold launch (iOS, iPhone 15 Pro) | ≤ 2.0s to first interactive | Instruments App Launch template |
| ML inference per photo | ≤ 200ms p95 | XCTest with deterministic fixture |
| Library scan 10k assets | ≤ 30s on-device | Integration test in CI |

Budgets must be platform-specific (different devices have different
floors). Each budget names a test or telemetry source — a budget
that can't be measured is a wish.

## Privacy & security posture
- **Network surface:** <what leaves the device — "none", or
  specific endpoints>
- **At-rest encryption:** <how local data is protected>
- **Sensitive data classes:** <PII / health / financial — and how
  each is handled>
- **Tracking SDKs:** <list, or "none">
- **Third-party services:** <list, or reference to
  external-accounts.md>

For privacy-first products, this section is often the most-cited
across tasks. Make it explicit; don't bury it in prose.

## Architectural decisions (ADRs)
ADRs are short and numbered. Each has:
- **ID:** ADR-001
- **Status:** proposed | accepted | superseded-by-ADR-NNN
- **Context:** what forced the decision (constraint, requirement,
  trade-off).
- **Decision:** the choice, in one sentence.
- **Consequences:** what becomes easier, what becomes harder.

Aim for 5–10 ADRs in a typical greenfield plan. Examples:

- **ADR-001:** Local-only data model (no backend).
- **ADR-002:** SwiftUI + Compose, no cross-platform UI framework.
- **ADR-003:** Use platform-native ML (Core ML / ML Kit) instead of
  a portable model runtime.
- **ADR-004:** SQLite via SwiftData + Room, encrypted with
  CryptoKit / SQLCipher.

## Open architecture risks
- <risk + how we'd detect it firing + fallback>

Distinct from the product-vision risk register: those are about
product/market; these are about the architecture itself ("Core ML
quantisation may degrade accuracy on iPhone SE 2nd-gen").
```

## Generation rules

1. **Reuse, don't reinvent, when an existing codebase is present.**
   If `project-context.md` declares an existing stack, the blueprint
   documents what's there — it does NOT propose a rewrite unless
   the user explicitly asked for one. Greenfield projects get to
   pick freely; brownfield projects inherit.

2. **One choice per layer per platform.** Do not list "SwiftUI or
   UIKit" — pick one and say why the other was rejected. Indecision
   in the blueprint propagates as inconsistency across 50 tasks.

3. **Performance budgets need devices and test sources.** A budget
   without a device name and a measurement source is fiction. The
   simplest disciplined form: `<operation> ≤ <number><unit> on
   <device class> measured by <tool/test>`.

4. **ADRs are the receipts.** When a task later asks "why this
   choice?" the answer is an ADR. If you can't write an ADR for a
   choice, the choice isn't yet a decision.

5. **Dissolve modules; don't cite them.** As with task generation,
   technology-stack modules feed the blueprint but their filenames
   must NOT appear in the output. Quote patterns; rename to
   project-specific shapes.

6. **No template references, no placeholders.** `<TBD>`, `[project
   name]`, `.ai-prompts/prompts/` are all forbidden — same hard
   rule as drill-down outputs. The validator enforces this.

7. **Length: 250–600 lines.** Below 250 means too thin to function
   as the project's spine; above 600 means absorbing detail that
   belongs in tasks.

## Anti-patterns (auto-rejected by C13)

- **No alternative-rejection in tech-stack rationale.** "We use
  PostgreSQL because it is a database" is not rationale. The "why
  not the alternative" column must be filled.
- **Budget without a measurement source.** Mentioned above.
- **ADR with status: proposed but no consequences listed.**
  Proposed ADRs are fine, but the consequences (and the prompt for
  the decision) must still be articulated.
- **More than 12 ADRs.** That's not a blueprint — that's a thesis.
  Combine related decisions; defer the truly small ones to feature
  context.
- **Diagrams with unlabelled boxes/arrows.** "Box → Box → Box"
  tells no one anything. Every node names what it represents;
  every arrow names what flows.
- **Privacy posture missing the "network surface" line.** Even if
  the answer is "yes, full internet" or "no, never", that line is
  mandatory; future plans cite it.

## Output checkpoint

After writing `architecture.md`, **STOP and present** to the user:

1. The layer map (one line per layer).
2. The tech-stack table (just platform / layer / choice — skip the
   "why" column for the summary).
3. The performance-budget headers (operation + budget).
4. The list of ADR titles (just status + title).
5. The line: `"Architecture blueprint is ready at
   prompts/outputs/current/architecture.md. Say **Continue** to
   proceed to Step 3 (atomic task generation) — which will cite
   this blueprint — or give feedback to adjust first."`

This checkpoint is where to catch wrong stack choices early. A
choice made in the blueprint propagates into ~50–80 tasks; reversing
it later is expensive.

## See also

- `drill-down-engine.md` Step 3 — consumes this file as the canonical
  stack/layer reference.
- `module-selection-index.md` — intent → module path mapping for
  technology stacks.
- `product-vision.md` — upstream constraint source.
- `ux-blueprint.md` — UI architecture is partially specified here
  and elaborated there.
- `revise-outputs.md` C13 — validates this file's schema.
