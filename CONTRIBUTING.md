# Contributing

Improve verified useful outcomes while keeping the workflow small. Read [the entry point](prompts/orchestrators/ai-agent-entry-point.md) and [the model](docs/model.md) before changing behavior. The canonical run owns facts; reports derive from them.

Report failures with the original request/sources, library version, actual output, expected behavior, relevant raw evidence and known limits. Preserve first attempts and interventions. Classify the cause: missing/contradictory guidance, model noncompliance, representation defect, actual missing input or unresolved uncertainty. Do not automatically add a warning, schema field, gate or reviewer for every failure.

Prefer one shared rule or mechanism that removes duplicate work. New references must answer a concrete decision/failure question, be accurate within stated limits and avoid invented scope. Do not restore generic implementation dumps or impose catalogue counts. Research current technical facts only when required by a changed claim.

Test behavior at the public boundary. Use valid fixtures and one-defect negatives for represented invariants, CLI/API parity, path containment, stale evidence, target ownership, dependency cycles, authority and truthful review provenance. Do not test exact prompt phrases as a substitute for a consumer outcome. Preserve meaningful source, security, visual, recovery and release duties.

Run `npm test`, `npm run typecheck`, `npm run build` and the relevant CLI/package checks. Inspect the diff and packed files. Change docs/examples with the interface; repeated values should come from one definition. Never delete ignored/untracked consumer outputs or migrate a run without authorization.

Fresh prompt evaluations need frozen original inputs, an ordinary request, a fresh producer context, an independent reviewer and retained first/final artifacts. Use materially different briefs and actual useful consumer/recovery evidence. Record review, coordination, integration and rework; report observed usage only. A plan-only or shape-test result does not establish delivered quality or savings.

Version 2 is intentionally a breaking replacement. Retired files remain recoverable through [the baseline and inventory](docs/retirement.md); compatibility inspection stays read-only. Do not reintroduce old completion flags as another authority.
