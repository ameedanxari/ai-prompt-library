# Rolling Outcome Delivery

Shared by Greenfield, Gap-closure and Execute for new runs. Use the canonical versioned manifest/API and `.ai-prompts/docs/delivery-contract.md`; do not invent an alternate writable completion authority. Legacy operation is isolated in `.ai-prompts/prompts/orchestrators/legacy-workflow.md`.

## 1. Establish the full contract

Create `prompts/outputs/runs/<run-id>/delivery-manifest.json` and a root `prompts/outputs/current/resumption-checkpoint.md` pointing to it with `run_directory`. Bind source inputs to paths and digests. Capture all explicit requirements, actors/consumers, actual entry points, delivery targets, constraints and highest uncertainties. Reuse verified existing context.

Keep a concise ledger of every requested outcome and applicable baseline/release obligation: stable ID and source requirement IDs, observable result, success/recovery check IDs, applicability/reason, target, required evidence, dependencies, release relevance and ownership. Unknowns remain visible. Do not hide detailed implementation in ledger rows. Infer the smallest platform set consistent with the brief; absent preferences do not imply accounts, admin, mobile apps, monetization or unrelated features. Applicable safety/reliability obligations remain required. Non-waivable applicable safety/legal duties cannot be excluded. Changing an explicit user requirement needs recorded owner provenance; supported applicability judgments require delegated authority and never erase requested work.

Record authorization separately: execution permission, required user checkpoints, design-acceptance policy, scope-change authority and independent-review policy. Source requirements, captured evidence and decisions are versioned inputs; eligibility/completion is derived. A model-authored success boolean or accepted-risk row cannot remove a hard obligation.

For every visual surface preserve authoritative written and visual design intent in concise `RequirementDocument.designs` criteria and capture contexts, bound to the original source documents. Require intent, composition, hierarchy and responsive dimensions, with phone and desktop contexts for web. If no guidance exists, bind and explicitly review a small proposed direction; do not fabricate source authority. See `.ai-prompts/docs/delivery-contract.md` for the canonical comparison record.

## 2. Detail one representative proof

Choose the real entry through the first valuable outcome and its reachable recovery path, sufficient to expose integration and experience risks. For an existing product inspect the actual entry and linked primary/recovery actions before choosing repairs; do not trust file counts, previous task status or component approval. First render the smallest representative design and compare it against the authoritative documents before detailing backend breadth or the full journey. Until the first proof's visual outcomes have current design acceptance, retain one slice, at most **two units, 1,200 words and 9,600 bytes** of pending detail; budget extensions cannot waive this boundary. After design acceptance and before accepted full proof, the cap becomes **five outcome-level implementation units, 4,000 words and 32,000 bytes** in one slice. The concise scope ledger is outside this word budget.

A unit is a useful change across its necessary source, test, config, asset and documentation files. Name affected paths and ownership, production consumer/composition, dependencies, concrete change, success and recovery acceptance, verification commands/actions, target, evidence and risks. Do not force a separate ticket/full metadata envelope/commit per file. Do not wrap hundreds of substeps in one unit. Order dependencies within the slice; foundations exist to enable its outcome, not an all-project foundation phase.

Select only relevant modules using `.ai-prompts/prompts/orchestrators/module-selection-index.md`. Apply `.ai-prompts/prompts/orchestrators/baseline-task-shapes.md` as applicability/check guidance. Design, implementation, integration, recovery, verification and presentation belong together in the slice. A prototype can settle design uncertainty; fake-provider/prototype evidence cannot settle production integration or release readiness.

Run `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage plan` and the active-slice revise review. Present scope, bounded plan, runnable acceptance route and unresolved owner inputs at the declared checkpoint. Plan-ready grants no proof/release acceptance. Follow persisted execution authorization; if a user planning checkpoint is required, stop. Before construction run `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage execute`, which also requires the current scope approval and execution authority.

## 3. Execute and inspect

Use `.ai-prompts/prompts/orchestrators/executor.md`. Capture raw evidence of the actual built/deployed/installed composition, both useful success and relevant failure/recovery. Inspect composed UI captures for visual surfaces; exercise real consumers/operations for headless surfaces. A build, test fixture, palette sheet or component catalogue alone cannot prove a product journey.

For early design review capture the actual composed entry for each required viewport/theme, with `capture.route` exactly matching the outcome entry point. Retain `design-review` evidence comparing every criterion/context to a current entry image for that same outcome. Observations must explain how the screen meets or misses source intent, material treatment, hierarchy, content and mobile behavior. Obtain a separate trusted `design-review` decision using `deliveryDesignReviewBinding`; functional approval and token/font approval cannot substitute. A rejection or missing review keeps repairs in the same proof and blocks unrelated breadth. Design review does not prove functional success or recovery.

Every evidence record binds outcome/check, source and dependency snapshot, exact target/configuration/environment/fixture/provider mode, command/action, observed result, time and retained raw artifact with digests. Hash actual composition and dependencies. Reject missing, empty, stale, mismatched or escaping artifacts. Native binds OS/device, SDK consumer/version, data/ML input/evaluation set. Keep production obligations open after controlled-provider proof.

Required reviewers inspect raw outputs and independently exercise the primary result. Bind review decisions to scope/artifact digests and trusted owner message, distinct reviewer-session/tool receipt or verifiable external approval. Resolve provenance; copying a session ID or hashing a model-authored receipt cannot authenticate it. An offline validator lacking access reports provenance unverified and acceptance stays pending. Self-review never satisfies independent review. Slice `acceptanceDecisionIds` can retain cumulative owner and independent receipts; when policy requires both, one role cannot substitute for the other. The singular `acceptanceDecisionId` remains compatible.

Run `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage advance`. Repair a failed first proof before unrelated breadth. Technical verification may unlock related construction while owner acceptance is pending, but cannot bypass the first-proof boundary or mandatory product review.

## 4. Advance in bounded slices

After accepted proof, detail one active and at most one next slice, at most **eight units and 6,000 words total**. Pending outcomes remain concise ledger rows. Count all unimplemented detail regardless of filenames, nesting, appendices, research packets or archive relocation. Exclude completed history only with retained accepted evidence and lifecycle records. Review cohesion as well as mechanical size. Budget pressure narrows the slice, never drops scope. Extensions require a concrete risk/dependency explanation, bounded revised limits and the declared review before expansion; a new chat is no extension.

When source, contract, dependencies or target configuration changes, invalidate affected acceptance and dependent eligibility transitively; preserve historical receipts. Cross-slice prerequisites resolve to accepted outcomes with retained current evidence, never fake task stubs. Carry-forward needs dependency-scope justification and explicit review. Unrelated harmless changes need not invalidate everything. A later slice may introduce new foundations without reopening every completed phase.

Design comparisons and their referenced captures must remain fresh; they cannot use carry-forward. The dedicated design binding excludes plan files so accepted design can unlock bounded planning without its own expansion invalidating the review. Full visual slice acceptance still requires current design acceptance alongside functional evidence and required acceptance receipts.

At each declared checkpoint show actual target, actions, states, evidence, limitations and next slice; stop where required by authorization. Required owner/reviewer absence remains pending while independent authorized work continues. Preserve source and decision history.

## 5. Release against full scope

Run `bash .ai-prompts/scripts/validate-delivery.sh <run-directory> --stage release` against one consistent release candidate and the authoritative complete obligation set, not an implementer-selected subset of gates. Evaluate security, privacy, safety, data, accessibility, performance, operations and distribution as applicable. Every required outcome needs current evidence and required review. An authorized exclusion is still an exclusion, never success. Empty gates, stale screenshots or fake provider success cannot prove release-ready.

Measure actual prompt words/bytes, unit counts, review rounds and rework. Record token usage only when observed; generated bytes do not establish charged context or guaranteed savings. Report actual validation limits honestly.

Evidence never authorizes an infrastructure apply, destructive drill, financial transaction, paid service, publish or other consequential action. Use authorized disposable targets and stop for missing authority. Never disclose secrets or use production fixtures unsafely.
