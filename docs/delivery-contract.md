# Delivery contract

New delivery runs use `schemaVersion: 1`, `kind: outcome-delivery` in an isolated `prompts/outputs/runs/<run-id>/delivery-manifest.json`. The canonical schema is `.ai-prompts/src/delivery/types.ts`; package APIs and shell wrappers share its resolver. This guide describes behavior, not a second schema or completion authority.

The root `prompts/outputs/current/resumption-checkpoint.md` selects a run via `run_directory`. Resolve/confine the directory before reading tasks. A missing manifest after migration or an unknown/invalid schema fails closed. Explicit legacy operation can continue old records but cannot produce an outcome-verified release claim.

The manifest includes `runId`, `scopeRevision`, `projectRoot`, `sourceInputs`, `surfaces`, `authorization`, `planningBudget`, `outcomes`, `slices`, `activeSlice`, `firstProofSlice`, optional `nextSlice`, `evidenceRefs`, `decisionRefs` and optional `releaseCandidate`. Source-input JSON documents retain original-source path/digest bindings and authoritative requirement records, so an implementer cannot invent a smaller set of release gates. Outcome IDs map back to those requirements; source and decision history remain versioned inputs.

Targets identify environment, provider mode, real bindings and surface-specific identity: native OS/device, SDK consumer/version, data/ML input/evaluation set. Outcomes identify actor, actual entry, surface, applicability/reason, success/recovery check IDs, evidence kinds, release relevance and technical/accepted dependencies. Exclusions retain scope and decision provenance; non-waivable applicable safety/legal duties stay required. Changing an explicit requirement needs owner authority.

Each slice contains outcome-level cohesive units and every detailed file. Unit IDs match canonical task IDs such as `tasks-proof.md#T1`; existing task metadata/parser checks still apply. A useful unit can own necessary source, test, config, docs and assets across multiple paths. Preserve `filePaths`/affected-path ownership rather than forcing per-file task envelopes or commits. Use parser-supported multi-path metadata; do not invent a replacement task syntax.

Before accepted proof the pending-detail cap is one slice, five units and 4,000 words. After proof it is one active plus at most one next slice, eight units and 6,000 words total. Corpus scan roots must cover every pending detailed document regardless of location/name; ledger files stay concise. Accepted completed history is excluded only with retained lifecycle/evidence proof. Bounded reviewed extensions need concrete dependency/risk reasons before expansion. Mechanical size checks complement human cohesion review; a thousand-step unit is not acceptable.

Authorization records execution, checkpoints (`every-slice` or `autonomous`), design acceptance (`owner`, `independent` or `agent`), scope-change authority and independent-review requirements plus implementer context. Record the trusted user instruction behind the selected policy. Ordinary autonomy persists across chats; owner-reserved acceptance and required user checkpoints remain binding.

Evidence binds outcome/check, exact target/snapshot digests, command, observed result/time, raw nonempty artifact path/digest and production-composition status. UI image captures identify the actual composed entry/success/recovery state and viewport. Controlled/fake-provider proof retains production-integration duties. Relevant source/configuration/dependency changes stale affected acceptance transitively. Carry-forward needs explicit reviewed dependency scope. Release evidence must identify one consistent candidate.

Decisions bind scope/artifact digests, reviewer identity/context/role, result and trusted provenance. A copied session ID or hashed agent-written receipt cannot authenticate acceptance. A trusted host can supply a review-verifier module outside the project through the CLI's `--review-verifier` option; it must resolve the original trusted owner/reviewer/external receipt and verify actor, context and bindings. The implementer must never write a verifier that simply returns true. Without trusted provenance access, acceptance remains unverified/pending; plan integrity alone can still be assessed.

Run from the consumer project root:

```bash
bash .ai-prompts/scripts/validate-delivery.sh prompts/outputs/runs/example --stage plan
bash .ai-prompts/scripts/validate-delivery.sh prompts/outputs/runs/example --stage execute
bash .ai-prompts/scripts/validate-delivery.sh prompts/outputs/runs/example --stage advance
bash .ai-prompts/scripts/validate-delivery.sh prompts/outputs/runs/example --stage release
```

Replace `example` with the actual selected run. `plan` checks bounded executable scope. `execute` additionally enforces execution authorization and current scope approval before construction. `advance` requires current proof/acceptance for eligible transitions. `release` evaluates the authoritative full obligation set and current release-candidate evidence. Read actual failures; never turn a passing schema/build into product acceptance. Plan-ready, proof-accepted, slice-accepted and release-ready remain distinct derived decisions. Task contracts, completion reports and logs project this state.

Actual visual surfaces require captured composed screens and human/reviewer inspection; nonvisual work requires real consumer/operational evidence. Mixed systems combine profiles. Evidence gates do not authorize applies, destructive drills, charges, publishing or other consequential actions. Use authorized disposable targets and preserve pending owner inputs while pursuing independent local work.

Measure prompt words/bytes, unit counts, review rounds and rework. Report tokens only when observed; byte estimates do not prove charged usage or fixed savings. Behavioral tests, installed-package checks and field validation determine what the implementation actually supports.

A slice may use `acceptanceDecisionIds` for cumulative approval receipts; the singular `acceptanceDecisionId` remains compatible. When policy requires owner design acceptance and independent review, both duties must be satisfied by appropriate trusted receipts bound to the reviewed artifacts/scope. One role's receipt cannot silently substitute for the other. Relevant unit/slice content changes invalidate slice acceptance. Original-source coverage approval remains separate from implementation-plan review.

Use repeated `**File:**` fields or a pipe-separated list (for example `src/handler.ts | tests/handler.test.ts`) for cohesive units spanning files. Task requirement IDs must exactly match the union referenced by the unit outcomes; task dependencies and normalized affected paths must match the manifest.

`--project` emits the active task contract, path ledger and delivery order. These derived reports are exempt from the pending-detail budget only when their complete bytes match canonical regeneration; edits or extra instructions are rejected. Reports do not grant execution or acceptance.

Evidence captured with `targetContextDigest` can be carried forward after harmless source changes only with its original authenticated acceptance, an explicit fresh `carry-forward` decision naming `evidenceIds`, and fresh current slice acceptance. The original observation record and artifact remain immutable. Target environment, provider, identity, or production/release attribution cannot be upgraded through carry-forward; changed target context needs new execution evidence.
