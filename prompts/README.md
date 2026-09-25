# `prompts/` — library content

| Subdirectory | Purpose |
|---|---|
| `AGENTS.md` | **Read this first.** Authoritative instructions for any AI agent. |
| `orchestrators/` | 19 files: the entry point (`ai-agent-entry-point.md`), the two planning engines (`drill-down-engine.md`, `audit-and-remediate.md`), the executor (`executor.md`), the revise gate (`revise-outputs.md`), the semantic-review gate (`semantic-review-and-validation.md`), and supporting blueprints/policies (product-vision, architecture, UX, content-system, release-plan, store-submission, external-input-handler, research-and-fanout-policy, baseline-task-shapes, module-selection-index, schema-alignment-pass, self-maintain). |
| `modules/` | 313 domain templates across 32 category directories. The engine loads only the modules needed for the current step — never all at once. |
| `review/`, `security/`, `ai-native/`, `testing/`, `deployment/`, `desktop/`, `performance/`, `monitoring/`, `technology-stacks/` | 9 top-level category directories (30 files) that sit alongside `modules/` rather than inside it. `review/` is the semantic-review suite loaded by `semantic-review-and-validation.md`; the rest are cross-referenced from module files as top-level siblings. Indexed in `TAXONOMY.md` — read it before touching these. |
| `steering/` | IDE steering files (`library-context.md`, `architecture-guard.md`, `change-review.md`). Auto-deployed to the detected IDE by `.ai-prompts/scripts/bootstrap-project-integration.sh`. |
| `outputs/` | Where the engine writes. Generated outputs go under `outputs/current/`. |
| `working_copy/` | Optional user-supplied designs / mockups / specs. Loaded by `external-input-handler.md`. |

There are no `templates/` or `stages/` directories. Any reference to
them is stale — the old template/stage system was removed; do not
follow such references.

Everything an agent needs to know about the flow is in `AGENTS.md`. Do not
auto-load anything else in this tree beyond what that file lists.
