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
- `prompts/outputs/current/source-ledger.md` if it exists (required
  evidence for regulated, cloud-provider, security/privacy, AI, or
  current-best-practice claims).
- `prompts/outputs/current/ui-reference-source-map.md` if it exists
  (UI architecture is part of the blueprint).
- `prompts/orchestrators/research-and-fanout-policy.md` when its
  triggers apply. Use it to decide which claims need citations and
  whether worker fan-out should inspect specialist slices.
- One or more **technology-stack modules** from
  `.ai-prompts/prompts/modules/technology-stacks/` selected via
  `module-selection-index.md`. These modules contain stack-specific
  best practices and patterns — load the ones that match the
  project's platform and domain.
- Domain architecture modules from `module-selection-index.md` when
  applicable, especially bounded-context/state-ownership, Tier 0
  data integrity, regulated cloud landing zone, audit evidence/WORM,
  UK healthcare, controlled drugs, clinical safety, and the selected
  cloud provider module.

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

## Bounded contexts & state ownership
| Context | Owns / writes | Reads from | Public interface | Must not do |
|---|---|---|---|---|
| <Context> | <entities / commands> | <events / projections> | <API/events> | <write-boundary exclusions> |

Portals, apps, dashboards, and admin consoles are UI surfaces unless
the feature set explicitly makes them independent products. They must
not be treated as source-of-truth boundaries. The plan must name each
durable write owner and system of record.

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

## Scale, availability, and data-integrity budgets
| Workflow / component | Target | Mechanism | Validation |
|---|---|---|---|
| <Tier 0 workflow> | <RPO/RTO/SLO> | <transaction/outbox/idempotency/backup/DR mechanism> | <restore/replay/failover test> |

For "zero data loss" language, be precise: define the Tier 0 workflows,
their RPO/RTO, commit boundary, region failure assumptions, backup/PITR,
restore drills, and caveats. Do not imply physics-defying zero loss
across every outage mode.

## Cloud landing zone & deployment topology
Include when a cloud provider is in scope. For Google Cloud, name the
chosen region(s), project/folder separation, Cloud Run/GKE/App Engine
choice, Cloud SQL/Spanner/Firestore choice, Pub/Sub transport, Cloud
Storage evidence/data buckets, BigQuery analytics/export role, VPC
Service Controls/perimeters, Cloud Armor, Cloud KMS/CMEK, Secret
Manager, IAM/PAM, Security Command Center, logging/monitoring, backup
and DR posture. For other providers, use provider-native equivalents.

## Regulated controls matrix
| Requirement / risk | Control | Evidence artifact | Source-ledger rows |
|---|---|---|---|
| <e.g. UK health data residency> | <architecture control> | <log/report/config/export> | <SRC-001, SRC-002> |

If the target market is UK healthcare or controlled drugs, include UK
GDPR/Data Protection Act, DSPT/DTAC/NHS integration where applicable,
clinical safety DCB0129/DCB0160, CQC/GPhC/MHRA/Home Office boundaries
where applicable, and pharmacy/prescription/CD Register controls. Do
not output HIPAA-only guidance for a UK market.

## Eventing, ordering, and replay
For event-driven systems, name the durable source of truth separately
from transport. Pub/Sub, Kafka, SQS, and queues are delivery mechanisms,
not legal or clinical source-of-truth stores. Include transactional
outbox/inbox, idempotency keys, ordering keys where required, DLQs,
replay procedure, poison-message handling, and audit linkage.

## Audit, evidence, and retention
Define which audit events are fail-closed, which store is the immutable
legal/evidence anchor (for example locked Cloud Storage / locked Cloud
Logging sink, not BigQuery alone), hash/sequence integrity verification,
retention classes, export procedure, and chain-of-custody controls.

## AI and human authority
If AI automation, LLMs, triage, clinical decision support, prescribing,
dispensing, identity verification, or high-stakes recommendations are
in scope, define where AI may assist, where human approval is mandatory,
what DecisionTrace/evidence is captured, kill-switch behavior, and
which actions AI is never allowed to finalize.

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

## Source-backed assumptions
List every source-backed regulatory, cloud-provider, security, AI, or
current-best-practice assumption used above:

| Assumption | Source-ledger row(s) | Confidence | What would change the decision |
|---|---|---|---|
| <Assumption> | <SRC-001> | high/medium/low | <trigger to revisit> |
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

8. **Provider and regulator specificity.** If the brief names Google
   Cloud, UK healthcare, controlled drugs, or another specific provider
   / jurisdiction, the blueprint must use that provider/jurisdiction's
   services, obligations, and source-ledger citations. Generic cloud
   or HIPAA-only output is a defect.

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
- **GCP request with generic cloud or AWS-only architecture.** Google
  Cloud plans must name GCP services and account/project/network/key
  boundaries.
- **UK healthcare or medical cannabis plan with HIPAA-only controls.**
  HIPAA may be a comparison point, not the governing UK framework.
- **Portals as write owners.** Patient/clinic/pharmacy portals are UI
  surfaces unless explicitly modelled otherwise; bounded contexts own
  state and commands.
- **Queue as source of truth.** Pub/Sub or any queue cannot be the
  durable authority for prescriptions, payments, identity, or audit.
- **Zero data loss without a scope and caveat.** Define Tier 0
  workflows, RPO/RTO, commit boundary, and outage assumptions.
- **AI final authority in clinical/legal/dispensing workflows.** High-
  stakes actions require human approval and traceable evidence.

## Output checkpoint

Before presenting the checkpoint, run:

```bash
bash .ai-prompts/scripts/validate-regulated-architecture.sh prompts/outputs/current
```

If it fails, revise `architecture.md` and `source-ledger.md` before
continuing.

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
