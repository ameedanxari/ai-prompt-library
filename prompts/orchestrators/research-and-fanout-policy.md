# Research, Fan-Out, and Source-Ledger Policy

This policy is a mandatory support asset for every planning engine,
architecture blueprint, audit/remediation run, and self-maintenance run.
It exists to prevent generic output when the brief depends on current
external facts, large local corpora, regulated domains, cloud-provider
best practices, or safety-critical architecture.

## When Research Is Mandatory

Before writing product, architecture, compliance, security, privacy,
deployment, or AI-safety decisions, perform targeted research when any
trigger below is present in the user brief, `MY_PROJECT.md`,
`project-context.md`, `brief-keywords.md`, or source material:

- Regulated domains: healthcare, finance, education records, child
  safety, legal, insurance, identity, controlled substances, medical
  devices, clinical decision support, SaMD, or patient safety.
- Compliance and privacy terms: GDPR, HIPAA, PCI, SOC 2, ISO 27001,
  DTAC, DSPT, DCB0129, DCB0160, CQC, GPhC, MHRA, NHS, ICO, Caldicott,
  DPIA, RoPA, DSAR, breach, PHI, PII, WORM, retention, audit trail.
- Cloud or infrastructure terms: Google Cloud, GCP, AWS, Azure,
  Cloud Run, GKE, Cloud SQL, Spanner, Pub/Sub, VPC Service Controls,
  KMS, CMEK, Cloud Armor, Cloud Logging, Cloud Storage, BigQuery,
  multi-region, disaster recovery, zero data loss, millions of users,
  concurrent users, production grade.
- The user asks for "latest", "current", "best practices", "verify",
  "official", "compliant", "production-grade", or similar language.
- A template default conflicts with local project context or would
  choose a provider, jurisdiction, or regulatory framework not named by
  the user.

Use primary sources first:

- Official cloud-provider documentation for provider-specific controls.
- Regulator, standards-body, or government/NHS/ICO/CQC/GPhC/MHRA pages
  for legal, clinical safety, and governance facts.
- Vendor docs for named third-party services.
- Local project files remain primary for product facts, workflows,
  naming, domain entities, and committed decisions.

Do not use blogs, forum posts, search snippets, or secondary summaries
for regulated decisions unless primary sources are unavailable. When
primary sources are unavailable, record that as a source-ledger risk.

## Source Ledger

When research is mandatory, write or update:

`prompts/outputs/current/source-ledger.md`

Use this schema:

```markdown
# Source Ledger

_Generated at: <ISO 8601>_
_Research triggers: <comma-separated triggers found in the brief/context>_

## Sources

| ID | Type | Source | Retrieved / inspected at | Facts extracted | Decisions influenced | Conflicts / caveats |
|---|---|---|---|---|---|---|
| SRC-001 | local-spec | working_copy/Clinic Portal - Docs/Feature G- Audit Trail & Activity Logs.pdf | <ISO 8601> | Audit events need tenant, actor, timestamp, object, before/after hashes. | Audit event schema and evidence workflow. | none |
| SRC-002 | official-docs | https://cloud.google.com/run/docs/... | <ISO 8601> | Cloud Run supports direct VPC egress/private resource access. | Cloud Run protected-service network posture. | confirm service-specific limits before build |

## Research Decisions

| Decision ID | Decision | Source IDs | Confidence | Follow-up |
|---|---|---|---|---|
| RD-001 | Use Cloud Run with private egress for launch APIs unless long-lived gateway needs force GKE. | SRC-002, SRC-003 | high | Re-check limits during load test |

## Unresolved Conflicts

- <conflict or `none`>
```

Rules:

- Every non-local research claim in architecture, compliance, security,
  cloud, privacy, or AI-safety output must cite at least one `SRC-*`
  row by ID.
- Local source rows must include exact file paths when files are
  available on disk.
- Official web source rows must include URL and retrieval date.
- If local project context conflicts with an external source, do not
  silently choose. Record the conflict and create an ADR/open question
  unless the external source exposes a clear compliance or security
  blocker.
- Do not paste large copyrighted source text. Extract facts.

## When To Fan Out

Fan out when the input corpus or risk profile is too broad for one
linear pass to preserve important facts. Triggers:

- More than 20 source files, more than 3 product portals, or a corpus
  that spans multiple legal/operational domains.
- Regulated architecture with separate product, cloud, compliance,
  data, audit, and AI-safety concerns.
- A prompt asks for "all expected features and use cases" across
  multiple roles, portals, or business contexts.

Recommended workers:

- Domain extractor per major product area or portal.
- Compliance researcher.
- Cloud/SRE architecture critic.
- Security/privacy/audit critic.
- Data architecture and state-ownership critic.
- AI clinical/safety critic when AI affects recommendations or
  workflow decisions.
- Final synthesizer.

Each worker must output only this schema:

```markdown
## Worker Result - <scope>

### Facts Found
- <fact> [source: SRC-001 or local path]

### Risks
- <risk + why it matters>

### Recommended Decisions
- <decision + sources>

### Conflicts
- <conflict or `none`>

### Open Questions
- <question or `none`>

### Confidence
- high | medium | low - <reason>
```

The final synthesizer is responsible for one coherent output. It must
resolve conflicts into ADRs, not preserve contradictory recommendations
from multiple workers.

## Architecture-Specific Guardrails

For regulated cloud architecture, the output must include:

- Bounded contexts and canonical state ownership.
- Tier 0 workflows and what must fail closed.
- Data residency and jurisdiction caveats.
- Audit/evidence architecture, including immutable anchor and
  verification jobs.
- Eventing semantics, ordering, idempotency, DLQ, replay, and the
  source of truth.
- DR posture with RPO/RTO by workflow and explicit regional-outage
  caveats.
- AI/human-approval boundaries for clinical, legal, prescribing,
  dispensing, financial, and controlled-drug actions.
- A source ledger and ADRs for disputed or high-risk choices.
