# AI Prompt Library — Steering

For nontrivial work read `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` first. It selects exactly one of Trivial, Execute, Gap-closure or Greenfield and conditionally loads external intake/research. Do not load the whole module catalog or substitute IDE-native full-spec workflows.

New runs use a versioned `delivery-manifest.json` in isolated `prompts/outputs/runs/<run-id>/`. The root checkpoint's `run_directory` selects it; validate before loading the active slice. New chats reuse verified inputs and bounded reload files. Invalid/missing migrated manifests fail closed. Existing legacy task contracts continue only through the explicitly selected legacy path; preserve history and consumer state.

Preserve full requested scope and applicable release duties in a concise ledger. Detail one representative entry-to-value proof slice before breadth: at most five units/4,000 words before accepted proof; afterward one active and at most one next slice, eight units/6,000 words total. Count all unimplemented detail regardless of name/location. Units are useful changes across necessary files; no automatic per-file tickets or exhaustive upfront epic/feature/task corpus.

Use `.ai-prompts/prompts/orchestrators/rolling-delivery.md` and `.ai-prompts/scripts/validate-delivery.sh` for plan, execute, advance and release. Actual composed UI captures or real headless consumer/operational evidence establish useful behavior; builds/component catalogues/fake-provider success cannot establish release readiness. Required reviews need trusted provenance and raw evidence. Preserve plan-ready, proof-accepted, slice-accepted and release-ready as distinct decisions.

Follow persisted explicit authorization; required user checkpoints and owner-reserved decisions stop. Never self-grant acceptance, erase hard obligations, auto-reset state, expose secrets or treat evidence requests as external-action authority.
