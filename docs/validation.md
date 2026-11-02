# Validation record

## 2026-11-02 — upgrading Logisrch to 3.2.0 and regenerating its plan in place

**Setup.**
- Logisrch's plan was seeded from run-02 as it stood after the critique. Its files predate stamps, so they were stamped 3.1.0, the version that generated them.
- Bootstrap then upgraded the project:
  - refreshed the `AGENTS.md` block
  - replaced the v2 commit hash in `.ai-prompts-version`
  - re-pointed six dangling v2 steering links in `.cursor`, `.windsurf`, `.kiro`, `.idea`, `.vscode` and `.ai-steering`
  - warned that `MY_PROJECT.md` still sent agents to the v2 run
- `status.mjs` named stage 2 as stale. After stage 2 re-ran, it named stages 3–5, then stage 5 alone, and finally reported the plan current.
- Each stage re-ran in place in a fresh Claude Opus 5.5 agent. Stage 4 ran its 12 modules in parallel.

| Measure | Result |
|---|---|
| IDs | No ID removed or renumbered. New: R-177–R-181, 6 tasks, about 20 acceptance criteria |
| Coverage | PASS: 181 requirements, 379 criteria, 143 tasks all placed |
| Golden score (Claude Sonnet scorer, spot-checked) | **118/120**, no critical item at 0, all must-not rules pass |
| Forecast | 615 task hours, 713 h with fixing (687 h before), against the 168 h plan of record |

**What the new stage 2 rules changed.** The brief now names Option A as the build, and G-A1 rose from 1 to 2. The brief again excluded the unsubscribe, this time citing a higher source as the new rule requires ("no marketing email in R1" in the adopted architecture contract). The key still scores that item 1.

**Points lost.**
- The unsubscribe item, as above.
- `/search` is disallowed in `robots.txt` and also marked noindex, so crawlers never see the noindex. Run-02 had the same design but a different scorer gave it 2, which shows how much scores vary between scorers.

**Found and fixed while doing this.** An independent review of the new scripts found two real bugs, both now fixed and covered by tests:
- a plan where only the stale stage had been re-run reported as current
- a dangling `AGENTS.md` symlink would have been replaced by a regular file

Stage 3 also showed that downstream re-runs could not tell what had changed, so the rules now require a `## Changes` line on every in-place re-run.

## 2026-11-02 — v3 run-02 on Logisrch (stages 1–6, prompts 3.1.0)

**Setup.** Same as run-01: a fresh Claude Opus 5.5 agent per stage, the same 28 sources, no access to the key or earlier runs. Stage 4 ran its 12 modules in parallel, as 3.1.0 now allows.

| Measure | Run-01 (3.0.0) | Run-02 (3.1.0) |
|---|---|---|
| Golden score | 119/120 | 117/120, no critical item at 0, all must-not rules pass |
| Forecast | 1,846 h (8.2× the 224 h re-estimate) | 570 h (2.5×), with the gap explained per package |
| Modules, criteria, tasks | 15, 488, 228 | 12, 321, 129 |
| Module specs | 138,000 words | 68,000 words (4.7–6.2k each) |
| Assumptions | 257 | 112 (5–8 per module) |

**Still too large.** 65 of 175 requirements rest only on the adopted prior plan's detail. Stage 1 recorded that this detail is a design reference, but stage 2 still made it required. Stage 4 then priced schema, access rules and tests for every table. The scorer found 6 places that build more than the sources ask for, such as admin tooling for a privacy process the owner said is manual in R1, and test automation beyond the manual browser checks the proposal prices. The unsubscribe point was lost again, this time because the brief reasoned that R1 sends no marketing email.

**Stage 6 critique on run-02.** Round 1 (16 Opus reviewers) found 0 critical, 75 major and 138 minor problems, mostly real defects. All 75 majors were fixed and checked closed in round 2. The fixes introduced 2 new majors, which are left as residual issues. **The critique converged within its two rounds**; v2 never converged. But the critique only adds work: the fixes raised the forecast from 570 h to 687 h and the module specs from about 66k to 83k words. It flagged none of the 6 over-scope items the scorer found, because it judges each output against the brief rather than against cheaper options in the sources.

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

**Not yet validated:** repeated runs (run-to-run variation), a stage 6 critique after an in-place regeneration, stage 7 implementation, Briefs A and B, and an independent (non-Claude) scorer.
