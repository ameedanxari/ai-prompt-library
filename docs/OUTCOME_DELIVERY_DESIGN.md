# Outcome-driven delivery: reviewed design

Status: implemented and independently reviewed locally. Behavioral, type, build and package checks are required before commit. The Villa field trial and origin push remain pending.

## Problem and decision

The VillaRenovations field run generated 138 task files and over one million
words of task specifications before execution. Its first integrated journey
was scheduled at position 89. The deployed review homepage remained a scaffold;
its plans link reached an empty catalogue and its contact fallback a missing page.
Component approval and mechanically valid task records did not establish a
usable product. These observations justify changing the delivery model, not
adding another mandatory report to the existing full-project expansion loop.

Replace all-upfront implementation decomposition with a persistent outcome
contract and bounded, executable slices. Preserve the full requested scope in
the contract; detail only the next slice. Prove representative product value
before expanding breadth. Review correctness, usefulness and presentation
together at slice boundaries, with full-scope verification before release.

This applies to every supported domain. Visual evidence is mandatory for visual
surfaces; real consumer/operational evidence is mandatory for headless work.
Neither a screenshot nor a successful build substitutes for the other.

## Workflow and states

1. Establish intent, scope, constraints, actual delivery targets and the highest
   uncertainty. Reuse verified existing material. Do not restart ingestion or
   regenerate a plan merely because a new chat begins.
2. Record every requested outcome and applicable baseline obligation at a useful
   level of granularity. Include its source, actor/consumer, observable result,
   acceptance method, target and release relevance. Mark unknowns explicitly.
   Defaults infer the smallest platform set consistent with the brief; missing
   preferences do not authorize three platforms, accounts, admin, or other
   unrelated product features. Relevant safety and reliability remain required.
3. Design and implement one representative proof slice: the real entry point
   through the first valuable outcome, with sufficient real composition to
   expose integration and experience risks. A prototype may settle design;
   prototype or fake-provider evidence cannot settle production readiness.
4. Inspect the result on the actual surface, challenge its acceptance evidence,
   and obtain the review required by the declared policy. Only then detail the
   next small slice. Repair a failed proof before expanding unrelated breadth.
5. Repeat for remaining outcomes. Each slice includes appropriate design,
   implementation, integration, recovery and verification; visual quality is
   not deferred globally to a final polish phase.
6. Evaluate the complete release scope on the intended deployment/package,
   including operational, security, privacy, data, accessibility, performance
   and distribution obligations that apply. Any unproved required outcome
   prevents a release-ready claim.

Keep distinct decisions: plan-ready, proof-accepted, slice-accepted and
release-ready. An execution permission is not design acceptance; accepted
component tokens are not accepted composed screens. A blocked external release
condition does not prevent independent local work, and cannot be silently
reclassified as completed.

Persist authorization separately: allowed execution, required user checkpoints,
design-acceptance policy, scope-change authority and independent-review policy.
Explicit autonomy permits ordinary slice transitions and agent review within
that authority; user-requested checkpoints and owner-reserved decisions still
stop. A required independent review must come from a distinct reviewer context
with the relevant evidence. If none is available, report the limitation and keep
acceptance pending; never silently count self-review as independent review.

## Contract and planning budget

Introduce explicitly versioned `delivery-manifest.json` as the common source of
truth for scope, active slice, evidence policy and continuation. Reuse the
existing task parser and execution machinery where their semantics fit; do not
build a second competing completion system.

The manifest retains stable outcome IDs, source references, applicability,
release obligations, acceptance checks, dependencies, current slice ownership,
evidence references and review decisions. Deferred detail remains visible as
unimplemented scope. Removing, waiving or changing required scope needs an
explicit recorded decision; no model-created omission or accepted-risk row may
erase a hard release obligation.
Changing an explicit user requirement requires the owner's decision provenance.
An agent may make supported applicability judgments within granted authority,
but cannot turn that into authority to exclude requested work.

Minimum schema boundary (field names to stabilize before implementation):
`schemaVersion`, `kind: outcome-delivery`, `runId`, `scopeRevision`,
`sourceInputs` (paths/digests), `surfaces`, `authorization`, `planningBudget`,
`outcomes`, `activeSlice`, `evidenceRefs` and `decisionRefs`. Each outcome has
an ID, source requirement IDs, actor/consumer, entry point, success and recovery
checks with stable IDs, applicability/reason, target identity, required evidence
kinds, dependencies and release relevance. Classify hard applicable safety/legal
obligations as non-waivable. Targets bind build/source/configuration, environment
and fixture/provider mode; native binds OS/device, SDK binds consumer/version,
and data/ML binds input and evaluation-set identity.

Source requirements, captured evidence and decisions are versioned input records;
eligibility and completion are derived, never hand-authored success flags.
Dependencies distinguish technical verification from product acceptance. Technical
verification may unlock related construction while owner acceptance is pending;
it cannot bypass the first-proof boundary or mandatory product review. Release
checks cover the authoritative full obligation set, not merely gates supplied
by the implementer. An authorized exclusion remains an exclusion, not success.

Default planning limits, to be exercised in tests and the field trial:

- Before the first accepted proof: one active slice, at most five outcome-level
  implementation units, and at most 4,000 words of detailed implementation
  prompts. The concise full-scope ledger remains outside this word budget.
- After proof: detail one active slice and at most one next slice, at most eight
  units and 6,000 words in total. Pending outcomes remain concise ledger rows.
- Count all unimplemented detailed content regardless of filename, nesting,
  archive relocation, or whether it is called a feature, task, research packet,
  or appendix. Exclude completed-slice history only when retained acceptance
  evidence and lifecycle records establish its completion. Do not
  hide detailed plans in the ledger or wrap hundreds of substeps in one unit.
  Mechanical size checks supplement a review of unit cohesion and scope;
  word counts alone cannot detect a disguised megaslice.
- Extensions require a concrete dependency/risk explanation, bounded revised
  limits, and review before expansion. Resetting a session is not an extension.
  Budget pressure narrows the active slice; it never drops required scope.
- Measure actual prompt words/bytes, unit counts, review rounds and rework.
  Record token usage only when observed. Do not advertise estimated token
  savings or equate generated bytes with charged model context.

Units represent useful changes across their necessary files, with concrete
acceptance and affected paths. Preserve file ownership/collision detection
without forcing a separate ticket, full metadata envelope and commit per file.
Order dependencies within the active slice. A later slice may legitimately
introduce a new foundation without reopening every completed phase.

## Evidence and acceptance

Every evidence item binds an outcome/check to the source snapshot, target,
configuration or package under test, command/action, observed result, time and
retained raw artifact. Hash local artifacts and relevant inputs; reject missing,
stale, mismatched, empty or path-escaping evidence. A matching revision string
or a narrative saying "pass" is not evidence of current execution.

Bind approval to the reviewed artifacts and scope, with reviewer provenance.
Content or composition changes invalidate affected acceptance. A harmless
unrelated source change need not invalidate every result: record dependency
scope and require explicit review of carried-forward evidence. Final release
needs a consistent release-candidate evidence set.

On relevant source, contract, dependency or target-configuration change, mark
the affected current acceptance stale and invalidate dependent eligibility
transitively. Preserve historical receipts. The next slice cannot rely on those
prerequisites until affected checks and reviews pass again. Hashes must cover
the actual composition and dependencies, not only files convenient to the claim.

The validator can establish integrity and completeness, not aesthetic quality
or truthfulness by itself. A reviewer must inspect raw outputs and independently
exercise the primary result. Reviewer independence and approval claims need
actual session/decision provenance; self-authored approval fields are insufficient.
When required reviewer or owner input is absent, retain pending status.
Supported provenance is a trusted owner message, an independently produced
review-session/tool receipt, or a verifiable external approval. The receipt
references artifact and scope digests. A copied session ID is insufficient:
resolve it through the trusted source or an explicit reviewer inspection. An
offline validator without that access must report provenance as unverified;
hashing a model-authored receipt cannot authenticate it.

Each checkpoint presents the runnable target/artifact, entry/action sequence,
captured relevant states, known limitations and evidence links. UI acceptance
requires actual image captures from the tested composed application, including
the relevant recovery path; a generated component catalogue cannot substitute.

| Surface | Minimum representative proof | Release additions when applicable |
| --- | --- | --- |
| Web/native/desktop UI | Rendered entry and primary journey; real composed screens at representative sizes/devices; hierarchy, content, trust and domain fit; fresh and populated states; reachable fallback/recovery | Actual deployed/built target, authentication and role boundaries, accessibility, real data/provider composition, packaging/distribution |
| API/service/SDK | Real consumer invocation through production composition; meaningful persisted/output result; contract, authorization and failure path | Deployment/configuration, provider integration, compatibility, operational recovery and monitoring |
| CLI/automation | Installed invocation from a clean environment; useful output and side effects; help/error/retry/exit behavior | Packaging, permissions, scheduling/idempotency and platform support |
| Data/ML/AI | Representative input-to-output run with independently assessed correctness; provenance, failure modes and declared evaluation criteria | Data quality/privacy, adversarial cases, measured model behavior, repeatability, monitoring and human intervention where needed |
| Infrastructure/operations | Isolated real apply or equivalent operation, service reachability and failure/recovery demonstration | Least privilege, secrets, migration, backup/restore, rollback, production capacity and actual operational ownership |
| Documents/media/other artifacts | Open/render/export in the intended consumer and inspect substantive correctness and presentation | Format compatibility, accessibility and distribution requirements |

Combine profiles for mixed systems. A backend behind a mobile UI needs both;
nonvisual systems do not acquire irrelevant screenshots. Domain modules add
necessary risk-specific checks (e.g. healthcare, finance, IoT), not automatic
feature inventories. Research must inspect actual visual references when visual
claims are made; unavailable references remain an explicit uncertainty requiring
a reviewed original design, never fabricated inspiration or automatic approval.
Evidence requirements never authorize infrastructure applies, destructive drills,
financial transactions or other consequential actions. Use authorized disposable
targets and stop for missing authority. Early controlled-provider proof must be
labelled and retains the unsatisfied production-integration obligations.

## Integration and migration

One scope resolver must serve entry routing, feature/gap completeness, baseline
coverage, path ownership, dependency ordering, finalize/readiness, execution,
semantic review and release/completion. Every public CLI and package path must
use it; a prompt-only fix would otherwise be rejected by existing full-corpus
validators or bypassed by another entry point.
The canonical implementation belongs in the package's TypeScript API; shell
wrappers delegate to it. The checkpoint's `run_directory` selects an isolated
run containing `delivery-manifest.json`. Resolve and validate that directory
before reading tasks. Existing task-contract and completion reports project
this state; they are not competing independently writable authorities.

Support existing manifests and task records without rewriting their history.
New runs use the new delivery contract by default. Importing an existing project
preserves old task IDs/evidence as historical claims and maps the original brief
and applicable release duties into the outcome ledger. Only current evidence can
accept an outcome. An absent new manifest in a legacy project permits explicit
legacy operation, not a new outcome/release-ready claim. An invalid or unknown
manifest version must fail closed rather than silently downgrade to legacy.
New-run initialization requires the manifest. A previously migrated checkpoint
whose manifest disappears fails closed. Explicit legacy invocation can inspect
or continue old work under its existing contract, but cannot emit a new global
outcome-verified release claim without the outcome/evidence gates.

Run directories isolate the new audit from historical plans. The checkpoint
selects the active run and only its next slice. Cross-slice dependencies resolve
to accepted outcomes with retained evidence, not thousands of fake task stubs.
Existing safety, legal, secrets, fixture-isolation and owner-authorization gates
remain enforceable. Do not reset or delete consumer state during migration.

Update all normative instructions together: entry, both planning engines,
executor, external intake, review/revise, self-maintain, baseline task shapes,
module-selection guidance, agent/IDE bootstrap steering, onboarding/template
defaults and published CLI documentation. Remove contradictory full-expansion
rules rather than layering an exception paragraph over them. Existing specialist
modules remain available on demand; audit their orchestration assumptions with
representative domains and an automated reference/consistency check.

## Verification and rollout

Implement the shared contract/resolver, executable evidence/budget gates and
workflow/documentation changes as a coordinated library change. Test meaningful
negative cases: missing first-proof evidence, homepage omission, unvisited broken
fallback, stale/cross-environment screenshots, palette-only approval, invented
approval, empty release gates, hidden scope removal, legacy downgrade, budget
evasion, megaslices, unproved cross-slice prerequisites and fake-provider release.
Include passing headless, UI, native and mixed-system fixtures, upgrade/resumption,
and installed-package CLI coverage. Tests must fail for the old failure mechanism,
not merely assert that new prose contains expected words.
Exercise direct package APIs as well as wrappers, including transitive evidence
invalidation and accepted-history budget accounting.

Required sequence:

1. Review this design and implementation independently. Fix identified conflicts.
   Run the library's relevant behavioral suites, full tests, typecheck, build,
   package/release checks and diff review. Commit the library locally; do not push.
2. With that commit, dry-run the Villa re-audit in an isolated output directory.
   Preserve the full brief (all roles, core journeys and release obligations),
   produce a bounded first slice and concrete acceptance criteria, and review
   them against the original brief, live behavior and the new quality standard.
   Dry-run planning must not alter application/runtime state or old evidence.
3. Execute the reviewed slices through the revised library. The first slice must
   settle the actual public experience and a usable entry into membership, not
   just hide the empty state. Continue through the remaining outcomes to go-live
   readiness. Keep release-dependent owner inputs explicit and pursue other work.
4. Verify the running project visually and functionally on its actual target,
   with new/returning users and required staff/vendor/field roles. Exercise real
   integrations and applicable release/operational gates; a fake payment provider
   or laptop-only worker cannot prove production readiness. Obtain required
   owner decisions; do not invent commercial/legal values or enable charges.
5. Independently compare the result with the brief and retained before/after
   evidence. Recheck library tests after any field-driven changes and commit
   those locally too. Only after tangible product verification and the applicable
   release gates pass may the reviewed library changes be pushed to origin.

This is a delivery-policy change, not a smaller definition of the requested
product. A successful fixture run, local commit or improved homepage alone does
not complete the user's goal.
