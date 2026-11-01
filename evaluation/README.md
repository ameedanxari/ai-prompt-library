# Evaluating prompt changes

## Fixtures

- **Logisrch** (private, in its own project): 28 real source documents, with a hand-written scoring key of 52 requirements (21 critical), 8 contradictions and 4 must-not rules. The key was written before the v3 prompts and is never shown to a run.
- [Brief A: archive preparation](brief-a.md): a data move with retained and live targets, and a quote that comes before a purchase decision.
- [Brief B: meter ledger](brief-b.md): a small headless CLI with exact integer accounting and atomic publication.

## Procedure

1. Run the stage under test in a fresh context. Give it only the rules file, the stage prompt, the fixture sources and the earlier stages' `plan/` files. No scoring key, no prior plans.
2. Score the output against the fixture's key:
   - each item is 2 (present, correctly scoped and traced), 1 (present but vague or untraced) or 0 (missing or contradicted)
   - any critical item at 0 fails the run
3. Run `node scripts/coverage.mjs <plan>` once stage 4 or 5 has run.
4. For implementation runs, the real test is whether milestone 1 builds from the plan and its tests pass.
5. Record the result in [docs/validation.md](../docs/validation.md), with the limits: one run per model, the scorer's independence, and anything not checked.

Tune one stage at a time, and re-run only that stage. A full cold run is for confirming the end-to-end result, not for finding which stage is weak.
