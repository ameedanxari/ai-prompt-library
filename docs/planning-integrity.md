# Planning integrity

New outcome manifests use `schemaVersion: 2`. Each run requires `planning-integrity.json` and `review-findings.json` beside `delivery-manifest.json`; both companion documents use `schemaVersion: 1`. The version 2 manifest has one `planningInputs` file binding for each companion, plus a third for `architecture.json` when that file exists (see [Architecture contract](#architecture-contract)), using project-relative paths and current SHA-256 digests. They participate in the scope digest and scope-review artifact bindings: changing either companion invalidates reuse of its prior scope review. Keep these as two compact records, with existing source files and evidence, rather than a new package of planning reports. Version 2 units also declare nonempty `planningNodeIds` linking active work to these nodes; prerequisite closure determines which blockers apply. Unknown target IDs fail closed. The manifest remains the delivery authority. See [delivery contract](delivery-contract.md) and the implementation in `src/delivery/planning-integrity.ts`.

A version 1 manifest remains an explicit legacy run: missing planning integrity is **unassessed**, not evidence that these checks passed. Preserve its identity, decisions, source bindings and history. Migrate only when authorized: retain old artifacts, populate and validate the companions, then explicitly change the manifest version. An existing Markdown findings register requires migration; never silently ignore or overwrite it. A request to inspect an existing plan stays read-only, including when a checkpoint exists; report findings and proposed repairs before any separately authorized change.

## Authoring the contract

Inspect all inventoried authoritative sources before claiming full coverage. Mark partial/unread sources honestly. Map each source clause to exact requirements or a justified excluded, duplicate, superseded or unresolved disposition. Keep provenance and follow duplicate/superseded chains to their terminal clause. Compare authoritative facts across document editions: scope lists, acceptance terms, payment triggers, dates, prices and deployment commitments. Keep feedback targets and formal acceptance windows as distinct facts. Genuine contradictions need a recorded conflict and authorized resolution, not an agent-selected interpretation.

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
| `nodes` | `id`, `stage` (nonnegative integer), `kind` (`work`, `review`, `decision`, `resource`, `acceptance`), `dependsOn[]`, `provides[]`, `consumes[]`, `visual` (boolean), `reviewFor[]`, `origin` (`required`, `added`), `originRef`, `risk` (`low`, `medium`, `high`), `riskReason`, `acceptance`, `effortHours?` (`[low, high]`), `releaseScope?` (release scope ID; defaults to the base contract) |
| `milestones` | `id`, `stage`, `requires[]` (capabilities), `acceptanceNodeId`, `evidenceIds[]`, `payment?` (`{ amount, currency, sourceRef }`; nonnegative number, currency text, inspectable source reference; preserve precise commercial terms in source facts), `releaseScope?` |
| `runners` | `id`, `root`, `include[]`, `exclude[]`, `configBindings[]`, `environment`, `bootstrapPaths[]`, `resultFormat?` (`vitest-json` default or `junit`) |
| `checks` | `id`, `nodeId`, `kind` (`unit`, `integration`, `build`, `manual`, `operation`, `review`), `command`, `targets[]` (concrete file paths), `requiredFiles[]`, `collection` (`substantive`, `scaffold`), `environment`, `bootstrapPaths[]`, `unitId?` (active executable unit only; omit on deferred outcome checks), `runnerId?`, `receipt?` |
| `variants` | `id`, `selected` (boolean), `decision` (binding when selected; use `null` while unselected), `obligations[]` containing `requirementId`, `nodeIds[]`, `evidenceIds[]` |
| `releaseScopes?` | `id`, `kind` (`base-contract`, `change-order`), `sourceRef` (clause ID or inventoried source path), and for change orders `status` (`proposed`, `approved`, `rejected`), `price?` (`{ amount, currency, sourceRef }`), `decision?` (binding, required when approved). Exactly one base-contract scope. See [Release trains](#release-trains) |
| `capacity` | One object: `hours` (nonnegative number or `null`), `reserveHours`, `nodeIds[]`, `disposition` (`committed`, `provisional`, `change-request`), `decision?` (binding for an approved change request) |

A check receipt has `artifact` (binding), `inputs[]` (nonempty bindings), `exitCode`, `collected` and `environment`. Retain current input digests and actual command output. Substantive unit/integration checks require a positive collection count. The checker reads retained Vitest JSON or JUnit counts/failure status and rejects contradictory receipt counters; it does not authenticate who ran the command. Covered source, test, bootstrap and required artifact inputs must be digest-bound. Integration environments are `real-local` or `real-staging`. Runner globs support `*`, `**` and `?`; expand brace alternatives and explicit excludes rather than relying on unsupported syntax. Planned commands alone do not establish advancement or release evidence.

Runner `configBindings` must be nonempty and bind real current configuration; runner/check environments must agree, and integration bootstrap must be declared and owned. A plan may retain substantive run-local configuration that the future runner will consume. `resultFormat` must match the artifact emitted by the declared command: plain `unittest` text is not JUnit. For unsupported native output, detail a project-owned adapter in the active unit, declare its adapter/configuration/bootstrap/test paths, and invoke it explicitly to emit actual JUnit counts and failures while preserving raw output. For example, a planned `tools/run_tests.py --config <existing-config> --junit <output>` can consume that real configuration once implemented. Do not claim a receipt until the adapter exists and runs; do not relabel text or invent passing counts.

`review-findings.json` contains `schemaVersion: 1`, nonempty `reviewedInputs[]` bindings, `findings[]` and `ownerDecisions[]`:

| Row | Fields |
| --- | --- |
| Finding | `id`, `source` (binding), `severity` (`P0`–`P3`), `status` (`open`, `resolved`), `targets[]`, `blocks[]`, `closure?` (binding required when resolved) |
| Owner decision | `id`, `source` (binding), `status` (`open`, `decided`), `targets[]`, `blocks[]`, `resolution?` (binding required when decided) |

The shared row parser also permits optional `resolution` on findings and optional `severity`/`closure` on owner decisions; use the status-specific closure field shown above. Targets use declared target IDs or `*`; blocked stages are `plan`, `execute`, `advance`, `release`. Open P0/P1 findings and owner decisions block their declared stages and targets. Preserve closure/resolution evidence and unresolved duties when advancing independent work. A source conflict may be recorded during planning, but unresolved affected execution stays blocked. A change request needs its decision before affected execution. A decision file binding proves retained bytes, not authorization by itself; the upstream trusted scope review must cover its authority.

## Release trains

A base contract and each change order are separate release trains. Every milestone and every payment belongs to exactly one of them. The checker follows each base-contract payment milestone's required capabilities and evidence checks back through their producers and prerequisite closure. It reports `RELEASE_TRAIN_COUPLED` when every producer path, or any evidence producer, depends on change-order work that is not both approved and priced. A capability is coupled only when no clean producer exists.

- **Without `releaseScopes`**, the whole contract is the base train, and `origin: added` work has no proven approval or price. A payment milestone that depends on added work fails, so a plan cannot let the final base payment silently wait on extra scope. To fix it, declare the trains and assign the added work explicitly.
- **With `releaseScopes`**, every `added` node must name its scope (`RELEASE_SCOPE_UNASSIGNED`). Unknown scope IDs fail (`RELEASE_SCOPE_UNKNOWN`). A base payment may depend on a change order only after the change order is `approved`, has a `price` and has a bound `decision`. A rejected or proposed change order never qualifies.
- A payment milestone inside a change-order train needs that change order approved and priced (`RELEASE_SCOPE_UNPRICED`). An approved change order without a price is also `RELEASE_SCOPE_UNPRICED`.

Splitting a run usually means removing change-order capabilities and evidence from the base milestone, removing them from the base release node's prerequisites, and adding a change-order milestone, with no payment until the change order is priced, that requires them. A decision binding proves retained bytes, not authorization; the trusted scope review must cover the change order's authority.

## Architecture contract

A version 2 run with persistent data or roles needs `architecture.json` beside the manifest before its first integration unit, and `--stage plan` fails without it (`ARCHITECTURE_CONTRACT_MISSING`). The run qualifies when its outcomes name more than one actor, its requirements declare a data lifecycle, it has a `data` surface, or a requirement or check mentions persistence, accounts, roles, permissions, tenants, records, storage, login or uploads. The file is a domain contract, not task detail. It and the documents it binds are exempt from the pending-detail caps, but a bound document containing task sections (`## T1`, `## Task 2`) fails `ARCHITECTURE_TASK_DETAIL`. When present, it must be bound in `planningInputs`, so it is part of the reviewed scope and changing it invalidates scope approval.

| Field | Row fields | Checks |
| --- | --- | --- |
| `schemaVersion` | `1` | |
| `documents?` | bindings to prose, diagrams or OpenAPI files | current digests; no task sections |
| `roles` | `id`, `actors[]` | every outcome actor maps to a role |
| `entities` | `id`, `fields[]` of `{name, type}` | nonempty |
| `access` | `entityId`, `roleId`, `read`, `create`, `update`, `delete` (policy text such as `none`, `own`, `tenant`, `published`) | exactly one row per entity and role: the RLS/grants matrix |
| `stateMachines` | `id`, `entityId`, `field`, `states[]`, `initial`, `transitions[]` of `{from, to, roleIds[]}` | required for every field of type `state` or named `status`, `state`, `stage` or `phase`; every state reachable from `initial` |
| `routes` | `path` (absolute), `surfaceId`, `access[]` (`public`, `system` or role IDs) | at least one route per web, native or desktop surface |
| `api` | `id`, `method` (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `RPC`, `EVENT`), `path`, `roleIds[]`, `request`, `response`, `errors[]` | nonempty; each operation names callers and at least one error case |
| `providers` | `capability`, `status` (`decided` with `provider`, `open` with an `ownerDecisionId` from `review-findings.json`, `not-required` with a reason of at least six words), `requirementIds[]` | one per capability the requirements imply |

Implied capabilities come from requirement and check text (`IMPLIED_CAPABILITIES` in `src/delivery/architecture.ts`): authentication (sign-up, login, password), geocoding (radius, distance, proximity, postal code), search, email, SMS, file storage (uploads, attachments) and payments (checkout, billing, subscriptions). An `open` decision keeps planning honest while its owner decision blocks the stages it declares. Version 1 runs are not assessed.

## Verification boundaries

Use the normal delivery stage gate plus `bash .ai-prompts/scripts/build-gate.sh <project-root> --boundary usable`, `--boundary milestone` or `--boundary release` at the corresponding boundary. Those boundaries require an actual production build; a cheap task check/typecheck remains distinct and cannot stand in for that build. Python production boundaries require `--build-command` with the actual project build; task `compileall` checks syntax only. Every milestone declares build evidence and a complete prerequisite path, with acceptance defined in time for implementation.

Structural checks can catch missing mappings, inconsistent facts, late prerequisites, excluded tests, stale receipts, open findings and capacity gaps. They cannot discover an omitted source clause, interpret a commercial agreement, judge visual quality or prove semantic fidelity merely from copied IDs. Independent review must inspect original clauses and raw behavior, including wrong-behavior negative controls and operator/handover results. Text regression tests protect instructions only; they are not semantic proof. Measure actual coverage, useful outcomes, review effort and rework before claiming this library beats a plain prompt; word counts or generated artifacts alone do not establish that claim.

Review registers may cover a scoped subset of inputs; they do not establish full-corpus review by themselves. The separate source inventory and trusted original-source scope review provide that duty. Legacy owner-decisions.md remains effective: open rows block their listed task targets, and project-wide readiness reports them. Malformed owner statuses cannot silently become decisions.

## Named runtime release boundaries

A sidecar milestone split alone does not split final runtime acceptance. To release one train independently, assign `releaseScopeId` on **every** authoritative requirement and manifest outcome. Values name declared `releaseScopes` IDs; reserved `*` is only for shared non-waivable, release-required duties. Each outcome must match all its requirement memberships; split mixed-train outcomes and acceptance slices. Shared duties cannot sit inside change-order acceptance slices; keep them in shared/base boundaries to avoid recoupling the base release. The first proof belongs to the base/shared scope. Unmapped historical runs remain union-only.

Use `validate-delivery.sh <run> --stage release --release-scope R1` for a named train. It validates that train, shared duties, the mandatory base/shared first proof and recursive outcome prerequisites, including accepted dependencies from other trains. It retains the complete original ledger and full source scope approval; unrelated R2 pending outcomes do not establish or prevent R1 acceptance. Proposed/unpriced change orders cannot become releasable through the selector. Missing/unknown/partial mappings fail closed. Omit the selector for the unchanged full-union release check.

Named release review uses `deliveryReleaseReviewBinding(scope, 'R1')` and `planDeliveryReview(scope, 'release-review', selectedOutcomeIds, { releaseScopeId: 'R1', trustedReviewProvider })`. The selection and dependency closure are bound into the decision; another train or union review cannot substitute. Reports identify the selected boundary. A scoped release-ready result means only that named boundary is ready, never that all product scope is complete. Selection is restricted to release validation/review; it cannot narrow source review, authorize work or waive hard duties.

For scheduling and owner-facing output, see [planning quality](planning-quality.md) and [advisory API](planning-quality-api.md). Those reports measure represented assumptions; the delivery manifest and actual evidence remain authoritative.
