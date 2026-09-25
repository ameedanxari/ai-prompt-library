# Top-level taxonomy — index

Nine category directories live at `prompts/` top level **alongside**
`modules/` rather than inside it. They are not orphans: module files
cross-reference them as top-level siblings (e.g.
`.ai-prompts/prompts/modules/ai-native/llm-integration.md` cites
`.ai-prompts/prompts/security/ai-security.md`),
and two orchestrators load them by their top-level path. Counts verified
2026-09-22.

| Directory | Files | Role |
|---|---|---|
| `review/` | 12 | **Semantic review prompt suite.** Loaded verbatim by `.ai-prompts/prompts/orchestrators/semantic-review-and-validation.md` (8 review dimensions + synthesis). Has its own `README.md`. |
| `security/` | 1 (`ai-security.md`) | LLM security patterns. Referenced by `.ai-prompts/prompts/orchestrators/external-input-handler.md` and `modules/ai-native/*`. |
| `ai-native/` | 2 | Context management + prompt engineering. Referenced from `modules/ai-native/*`. |
| `testing/` | 2 | AI testing + desktop testing. Referenced from `.ai-prompts/prompts/modules/ai-native/README.md`. |
| `deployment/` | 5 | Supplementary deployment files (auto-scaling, CDN, cost, desktop distribution, model deployment). Distinct from `modules/deployment/*`. |
| `desktop/` | 3 | Desktop security + performance optimization (+ README). Distinct from `modules/desktop/*`. |
| `performance/` | 3 | AI optimization, caching, optimization. Distinct from `modules/performance/*`. |
| `monitoring/` | 1 (`observability.md`) | Observability. Referenced from `.ai-prompts/prompts/modules/ai-native/autonomous-debugging.md`. |
| `technology-stacks/` | 1 (`rust.md`) | Rust notes. Distinct from `.ai-prompts/prompts/modules/technology-stacks/rust-systems-programming.md`. |

## Decision (2026-09-22): keep, do not merge or delete

These directories stay where they are. Rationale:

1. **Live references.** Moving them under `modules/` would break the
   cross-references above, which address them at their top-level path
   (`.ai-prompts/prompts/security/ai-security.md`, `.ai-prompts/prompts/review/README.md`, …). Several
   of those refs are inside fenced example blocks or module prose that
   CI's reference sweep deliberately does not rewrite.
2. **Distinct content.** Where a same-named `modules/<category>/`
   exists, the top-level files are different files, not duplicates —
   merging would create name collisions, not consolidation.
3. **No engine confusion.** The engine loads modules per
   `module-selection-index.md`; these top-level files are only ever
   loaded via explicit reference, never by directory scan.

If a future maintainer wants to consolidate, the safe move is to move
the files AND update every referencing file (including fenced examples)
in one pass, then re-run
`bash .ai-prompts/scripts/check-reference-integrity.sh`. Until then,
new category content goes under `modules/`; these nine stay indexed here.
