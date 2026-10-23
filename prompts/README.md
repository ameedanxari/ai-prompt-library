# Library content

Agents start at `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md`; `AGENTS.md` summarizes shared rules. `orchestrators/` contains four-mode routing, planning/execution, shared rolling delivery and on-demand specialists. `modules/` contains domain/stack guidance loaded only for the current slice. `review/` contains semantic review dimensions. `steering/` supplies IDE steering.

New outputs live in isolated `outputs/runs/<run-id>/`; the root checkpoint under `outputs/current/` selects the run. Existing legacy outputs remain supported explicitly. `working_copy/` is optional source/reference material. Other top-level domain directories are indexed in `TAXONOMY.md`; do not bulk-load them.

Preserve full requested outcome/release scope concisely and detail the bounded next slice. Actual target evidence and required trusted review establish acceptance; task volume and mechanically valid files alone do not.
