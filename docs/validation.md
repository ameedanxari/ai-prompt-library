# Validation record

## 2026-11-01 — v3 first run on Logisrch (stages 1–2 of 5)

**Setup.** Each stage ran in a fresh Claude Opus 5.5 agent. Each agent saw only `00-RULES.md`, its stage prompt, the 28 Logisrch source files and earlier `plan/` outputs. The scoring key and prior plans were not available to it. The same person who wrote the prompts wrote the key, before the prompts.

| Stage | Output | Result |
|---|---|---|
| 1 Inventory | 28 sources, 26 contradictions, 25 missing inputs; about 5,700 words; 34 tool calls | All 8 contradictions in the key were found, each with the expected resolution. Six contract-overriding resolutions were correctly flagged for written confirmation. One minor isolation slip: a line count listed one non-source file name, which was not opened. |
| 2 Understand | 178 requirements, 41 assumptions, 4 owner questions; about 15,000 words; 24 tool calls | A term-level check found every critical item in the key present, for example the milestones and payments, the five-point verification, hard filters before scoring, the matching weights, the grants rule, MFA and the 5-business-day window. **No full item-by-item score yet.** |
| 3 Decompose | — | Not run: the account's weekly usage limit stopped the agent. |
| 4–5 | — | Not run. |

**Compared with v2.** The v2 runs on the same sources were rejected six times in one planning pass and never reached a scored final plan. In v3, stages 1–2 finished on the first pass with no repairs. That is one run per stage, so it is not yet evidence of reliability.

**Concerns to watch.**
- Output length: stage 2 runs to about 15,000 words, which raises later stages' token cost. A length budget may be needed.
- One assumption makes production email wait for a missing legal mailing address. That is defensible for anti-spam law, but it is a blocking dependency to keep visible.

**Not yet validated:**
- stages 3–5 and the coverage check on a real plan
- stage 7 implementation
- Briefs A and B
- an independent scorer

Version 3 was merged to `main` on the owner's instruction before these were done.
