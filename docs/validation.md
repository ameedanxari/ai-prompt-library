# Validation record

## 2026-11-01 — v3 run-01 on Logisrch (stages 1–5, prompts 3.0.0)

**Setup.** Each stage ran in a fresh Claude Opus 5.5 agent. Each agent saw only `00-RULES.md`, its stage prompt, the 28 Logisrch source files and earlier `plan/` outputs. The scoring key and prior plans were not available to it. The same person who wrote the prompts wrote the key, before the prompts. Stage 4 ran its 15 modules in parallel. Because 3.0.0 told each module to append to the shared assumption register, the harness had them write assumptions in their own files instead. 3.1.0 makes that the rule.

| Stage | Output | Result |
|---|---|---|
| 1 Inventory | 28 sources, 26 contradictions; about 5,700 words | All 8 contradictions in the key found, each with the expected resolution |
| 2 Understand | 178 requirements, 41 assumptions; about 15,000 words | Every key item present. The proposal's "working unsubscribe" was lost |
| 3 Decompose | 15 modules, 31 entities, ADRs; 9,500 words | Every requirement has exactly one owning module; excluded work appears only as seams |
| 4 Elaborate | 488 acceptance criteria, 228 tasks, 208 module assumptions; 138,000 words | Coverage: 0 errors |
| 5 Integrate | Roadmap of 6 milestones with demo scripts and gates; 26 cross-module fixes | Coverage PASS. Missed one limit conflict between modules. The 3.1.0 dependency check later found 3 ordering errors in it |

**Score against the key** (Claude Sonnet scorer, which may read the key, with spot-checks by hand): **119/120**, no critical item at 0, all four must-not rules pass. The one point lost is the unsubscribe (stage 2).

**What the key does not measure: proportionality.** The forecast was 1,846 h against the sources' 168 h (about 11×), with no scope cut. The module files totalled 138,000 words, and there were 257 assumptions. Likely causes:
- Day-sized tasks (0.5 day minimum × 228 tasks put a floor of 114 days under the forecast).
- Requirements written from an adopted prior plan's implementation detail (127 of 178 cite it).
- No length budgets.

3.1.0 addresses these. The next run is scored on proportionality as well as the key.

**Compared with v2.** The v2 runs on the same sources were rejected six times in one planning pass and never reached a scored final plan. v3 run-01 finished all five planning stages on the first pass.

**Not yet validated:** a run with 3.1.0 prompts, stage 6 critique, stage 7 implementation, Briefs A and B, and an independent (non-Claude) scorer.
