# Planning integrity

New outcome manifests use `schemaVersion: 2`. Each run requires `planning-integrity.json` and `review-findings.json` beside `delivery-manifest.json`; both companion documents use `schemaVersion: 1`. The version 2 manifest has exactly two `planningInputs` file bindings, one for each companion, using project-relative paths and current SHA-256 digests. They participate in the scope digest and scope-review artifact bindings: changing either companion invalidates reuse of its prior scope review. Keep these as two compact records, with existing source files and evidence, rather than a new package of planning reports. Version 2 units also declare nonempty `planningNodeIds` linking active work to these nodes; prerequisite closure determines which blockers apply. Unknown target IDs fail closed. The manifest remains the delivery authority. See [delivery contract](delivery-contract.md) and the implementation in `src/delivery/planning-integrity.ts`.

A version 1 manifest remains an explicit legacy run: missing planning integrity is **unassessed**, not evidence that these checks passed. Preserve its identity, decisions, source bindings and history. Migrate only when authorized: retain old artifacts, populate and validate the companions, then explicitly change the manifest version. An existing Markdown findings register requires migration; never silently ignore or overwrite it. A request to inspect an existing plan stays read-only, including when a checkpoint exists; report findings and proposed repairs before any separately authorized change.

## Authoring the contract

Inspect all inventoried authoritative sources before claiming full coverage. Mark partial/unread sources honestly. Map each source clause to exact requirements or a justified excluded, duplicate, superseded or unresolved disposition. Keep provenance and follow duplicate/superseded chains to their terminal clause. Compare authoritative facts across documents: AI inclusion versus exclusion, a feedback target versus a formal acceptance window, commercial milestone deliverables/payment triggers, dates and scope limits. Keep feedback targets and formal acceptance windows as distinct facts. Genuine contradictions need a recorded conflict and authorized resolution, not an agent-selected interpretation.

Plan from source obligations and the actual target. Define acceptance before implementation; place the app entry, first usable/manual MLP delivery, necessary critical resources and health checks before their consumers and promised milestone. Include success, failure/recovery, operator setup, monitoring, account/resource ownership and handover outcomes where the source or deployment requires them. A visible screen without the resources needed to use it does not close a milestone. Review copied requirement IDs against actual behavior: an ID match cannot prove that a different or missing behavior is implemented.

Keep visual review dependencies on the screens they govern. Independent authorized infrastructure can proceed when it does not depend on that visual decision. Keep all pending detail within the rolling slice budget. Conditional variants retain achievable requirement/evidence paths before selection; selected alternatives need the authorized decision. Give required and added work explicit origin, risk and acceptance. `originRef` points to an inspectable source clause or decision; a nonempty string cannot authenticate authority. Use realistic effort ranges plus review, integration and recovery reserve; unknown estimates cannot support a fixed-envelope commitment. Record an over-capacity plan as provisional or a change request, preserving scope and approval duties.

Declare every changed production, test, fixture, runner configuration, bootstrap and lockfile path in the owning multi-file unit. Confirm concrete test targets match the actual runner root/include/exclude configuration. Integration evidence uses its isolated real environment and initializes bootstrap before importing production composition; a mock-only unit environment cannot prove integration. Empty collection is allowed only as explicitly labelled scaffold work, never substantive or milestone evidence.

## Compact schema reference

All objects reject unknown fields. Array rows have unique nonempty `id` strings; validated text fields are at most 2,000 characters. A binding is `{ "path": "project-relative/file", "sha256": "64 lowercase hex characters" }`; its nonempty file must exist with matching bytes. Paths are confined to the project root. The following fields are required unless marked `?`. Empty arrays express an intentional absence, not an assertion that a source was inspected.

`planning-integrity.json` has `schemaVersion: 1` and these fields:

| Field | Row fields or value |
| --- | --- |
| `sources` | `id`, `binding`, `status` (`inspected`, `partial`, `unread`), `authority` |
| `clauses` | `id`, `sourceId`, `locator`, `requirementIds[]`, `disposition` (`required`, `excluded`, `duplicate`, `superseded`, `unresolved`), `successor?` (clause ID for duplicate/superseded) |
| `facts` | `id`, `clauseId`, `key`, `value` (nonempty text; use comparable keys across source documents) |
| `conflicts` | `id`, `factIds[]` (at least two), `status` (`open`, `resolved`), `targets[]`, `resolution?` (binding required when resolved) |
| `nodes` | `id`, `stage` (nonnegative integer), `kind` (`work`, `review`, `decision`, `resource`, `acceptance`), `dependsOn[]`, `provides[]`, `consumes[]`, `visual` (boolean), `reviewFor[]`, `origin` (`required`, `added`), `originRef`, `risk` (`low`, `medium`, `high`), `riskReason`, `acceptance`, `effortHours?` (`[low, high]`) |
| `milestones` | `id`, `stage`, `requires[]` (capabilities), `acceptanceNodeId`, `evidenceIds[]`, `payment?` (`{ amount, currency, sourceRef }`; nonnegative number, currency text, inspectable source reference; preserve precise commercial terms in source facts) |
| `runners` | `id`, `root`, `include[]`, `exclude[]`, `configBindings[]`, `environment`, `bootstrapPaths[]`, `resultFormat?` (`vitest-json` default or `junit`) |
| `checks` | `id`, `nodeId`, `kind` (`unit`, `integration`, `build`, `manual`, `operation`, `review`), `command`, `targets[]` (concrete file paths), `requiredFiles[]`, `collection` (`substantive`, `scaffold`), `environment`, `bootstrapPaths[]`, `unitId?` (active executable unit only; omit on deferred outcome checks), `runnerId?`, `receipt?` |
| `variants` | `id`, `selected` (boolean), `decision` (binding when selected; use `null` while unselected), `obligations[]` containing `requirementId`, `nodeIds[]`, `evidenceIds[]` |
| `capacity` | One object: `hours` (nonnegative number or `null`), `reserveHours`, `nodeIds[]`, `disposition` (`committed`, `provisional`, `change-request`), `decision?` (binding for an approved change request) |

A check receipt has `artifact` (binding), `inputs[]` (nonempty bindings), `exitCode`, `collected` and `environment`. Retain current input digests and actual command output. Substantive unit/integration checks require a positive collection count. The checker reads retained Vitest JSON or JUnit counts/failure status and rejects contradictory receipt counters; it does not authenticate who ran the command. Covered source, test, bootstrap and required artifact inputs must be digest-bound. Integration environments are `real-local` or `real-staging`. Runner globs support `*`, `**` and `?`; expand brace alternatives and explicit excludes rather than relying on unsupported syntax. Planned commands alone do not establish advancement or release evidence.

`review-findings.json` contains `schemaVersion: 1`, nonempty `reviewedInputs[]` bindings, `findings[]` and `ownerDecisions[]`:

| Row | Fields |
| --- | --- |
| Finding | `id`, `source` (binding), `severity` (`P0`–`P3`), `status` (`open`, `resolved`), `targets[]`, `blocks[]`, `closure?` (binding required when resolved) |
| Owner decision | `id`, `source` (binding), `status` (`open`, `decided`), `targets[]`, `blocks[]`, `resolution?` (binding required when decided) |

The shared row parser also permits optional `resolution` on findings and optional `severity`/`closure` on owner decisions; use the status-specific closure field shown above. Targets use declared target IDs or `*`; blocked stages are `plan`, `execute`, `advance`, `release`. Open P0/P1 findings and owner decisions block their declared stages and targets. Preserve closure/resolution evidence and unresolved duties when advancing independent work. A source conflict may be recorded during planning, but unresolved affected execution stays blocked. A change request needs its decision before affected execution. A decision file binding proves retained bytes, not authorization by itself; the upstream trusted scope review must cover its authority.

## Verification boundaries

Use the normal delivery stage gate plus `bash .ai-prompts/scripts/build-gate.sh <project-root> --boundary usable`, `--boundary milestone` or `--boundary release` at the corresponding boundary. Those boundaries require an actual production build; a cheap task check/typecheck remains distinct and cannot stand in for that build. Python production boundaries require `--build-command` with the actual project build; task `compileall` checks syntax only. Every milestone declares build evidence and a complete prerequisite path, with acceptance defined in time for implementation.

Structural checks can catch missing mappings, inconsistent facts, late prerequisites, excluded tests, stale receipts, open findings and capacity gaps. They cannot discover an omitted source clause, interpret a commercial agreement, judge visual quality or prove semantic fidelity merely from copied IDs. Independent review must inspect original clauses and raw behavior, including wrong-behavior negative controls and operator/handover results. Text regression tests protect instructions only; they are not semantic proof. Measure actual coverage, useful outcomes, review effort and rework before claiming this library beats a plain prompt; word counts or generated artifacts alone do not establish that claim.

Review registers may cover a scoped subset of inputs; they do not establish full-corpus review by themselves. The separate source inventory and trusted original-source scope review provide that duty. Legacy owner-decisions.md remains effective: open rows block their listed task targets, and project-wide readiness reports them. Malformed owner statuses cannot silently become decisions.
