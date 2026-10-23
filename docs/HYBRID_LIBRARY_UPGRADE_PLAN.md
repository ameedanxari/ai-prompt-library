# Outcome delivery integration notes

The reviewed policy change is documented in `OUTCOME_DELIVERY_DESIGN.md`; this page maps it to library surfaces. Implementation and field verification status must be established by actual checks and retained evidence, not this document.

New runs use the versioned outcome contract and a single shared scope resolver across package APIs, public wrappers, planning, execution and release. Legacy contracts remain explicitly selectable; invalid/unknown outcome manifests fail closed. Root checkpoints select isolated runs via `run_directory`. Preserve consumer runtime state and historical evidence during migration.

Update together: entry routing, both planning engines, executor, external intake, shared rolling delivery, revise/semantic review, baseline/module guidance, IDE/bootstrap steering, templates and CLI documentation. Remove full-upfront expansion and mandatory per-file ticket/commit rules from the new workflow. Keep all requested scope in a concise authoritative ledger, then prove representative value before breadth.

The proof budget is one slice/five units/4,000 detailed words before acceptance; afterward one active plus at most one next slice/eight units/6,000 words total. Count pending detail across every location. Mechanical checks require cohesion review and cannot detect all megaslices. Evidence/decisions bind original requirements, source/target/configuration, raw outputs, scope and trusted provenance. Separate plan readiness, technical verification, proof/slice acceptance and full release readiness.

Validation must cover missing first-proof evidence, omitted entry/homepage, broken fallback, stale/cross-environment images, palette-only approval, invented approval, empty release gates, hidden scope removal, downgrade, budget evasion, megaslices, cross-slice prerequisites and fake-provider release. Exercise passing UI/headless/native/mixed fixtures, direct package APIs, wrappers, installed package, resumption/migration and transitive invalidation. Run full tests, typecheck/build and package checks before claiming library verification.

After local review/checks and an authorized local commit, field-trial the existing product in an isolated run, retain the full brief, then execute reviewed bounded slices on actual targets. Applicable real integrations, user roles, operational/distribution gates and owner decisions determine readiness. A fixture pass, local commit or improved homepage alone does not complete delivery. Push only after the user's required tangible product/release verification and authorization.

Measure actual words/bytes, unit counts, review rounds and rework. Record tokens only from observed usage; neither bytes nor API price estimates prove subscription usage or fixed savings.
