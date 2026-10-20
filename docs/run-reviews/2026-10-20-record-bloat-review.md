# Run review, 2026-10-20: records without delivery

Two projects driven by this library were reviewed after their owner asked
why a build plan "has been going on for several days with no end in
sight". This note records what the runs did, why the library let them,
and what changed. It is a maintainer record; nothing in it is steering.

## Summary

- The gap-closure run (LeadEnricher, go-live rounds 6 to 14) wrote
  2.64 million lines of records against 303 thousand lines of product
  code and tests over two weeks. Since 2026-10-13 the ratio is 2.6
  million to 20 thousand. Zero of 34 release gates moved in that time.
- 637 of its 739 blocked units had been `done` and were demoted by
  acceptance bullets no unit could prove: "a second reviewer confirms"
  (597 units) and "a failing run is retained before the fix" (393).
- Eight full review rounds each re-raised the same findings: 73 finding
  ids were unresolved in three or more rounds, 26 in eight or more.
  Unresolved went 126, 103, 95, 89, 81, 55, 47, then back up to 79.
- The external inputs the gates needed (credentials, legal sign-off,
  cloud capacity, payment approval) were never put to the owner as
  questions. They sat in a 27-row table while the loop planned 777 units
  around them. The owner sent five messages in the retained sessions;
  the coordinator sent 242 subagent briefs.
- The greenfield run (VillaRenovations, 114 of 138 tasks) ships code at
  a normal pace and does ask policy questions, but records are 70% of
  its output, its log is 17 MB (146 KB per task on average), and it
  wrote 164 "compatibility follow-up" records whose only purpose was to
  keep old evidence current. It then patched the library's
  oversized-file check to let the log keep growing.

## Evidence

### LeadEnricher, lines changed per day (added plus deleted)

| Day | Commits | Product | Tests | Records |
|---|---|---|---|---|
| 10-06 | 44 | 48,498 | 35,003 | 85,713 |
| 10-07 | 11 | 41,043 | 51,362 | 122,880 |
| 10-08 | 13 | 12,446 | 9,738 | 38,253 |
| 10-10 | 2 | 12,776 | 11,916 | 22,390 |
| 10-11 | 3 | 1,678 | 283 | 39,802 |
| 10-12 | 14 | 12,064 | 13,246 | 125,149 |
| 10-13 | 71 | 9,704 | 21,029 | 615,393 |
| 10-14 | 25 | 2,276 | 3,620 | 258,128 |
| 10-18 | 8 | 362 | 270 | 76,874 |
| 10-19 | 41 | 3,631 | 11,889 | 1,259,287 |

One representative commit, the namesake-identity fix: 36 lines of
product code, 213 of test, 14,676 of evidence (duplicated pytest logs,
process snapshots, SHA256 sums, a patch of its own diff, a 1,144-line
append to the execution log).

### LeadEnricher, why 739 units are blocked

| Class | Units |
|---|---|
| Records and evidence bullets (second reviewer, retained failing run, stale digest) | 663 |
| Another blocked unit | 52 |
| Code not written yet | 19 |
| Owner or external input, stated as the unit's reason | 0 |

The owner-dependent work was real (31 of 34 gates say "no retained
receipt proves this gate" and the receipts need real credentials), but it
was never represented at unit level, so the loop never saw a reason to
stop.

### VillaRenovations

| Measure | Value |
|---|---|
| Lines added, product + tests | 419,329 |
| Lines added, records | 983,682 |
| Execution log | 17.4 MB, 119 task sections, median 39 KB per task |
| Follow-up records that only re-attach evidence | 164 |
| Tasks done / blocked | 113 / 1 (a missing Docker daemon) |

The library copy there had six local commits. Four are honest validator
fixes. Two exempt `execution-log.md` and `task-contract.json` from the
10 MB oversized-file check. They were not carried upstream; rotation
replaces them.

### Adoption of the 2026-10-09 cost-discipline change

That change added delta reviews, file-bound evidence, per-unit model tier
and turn budget, and impacted-test selection. In the runs reviewed:

| Feature | LeadEnricher | VillaRenovations |
|---|---|---|
| Delta review used | no (`review-scope.json` says `full`) | no bundle |
| `Model tier` / `Turn budget` on units | 0 of 41 round-14 units | 11 of 138 tasks |
| `select-impacted-tests.sh` runs | 0 | 0 |
| Full regression directories in round 13 alone | 7 (9 to 11 MB each) | n/a |
| File-bound evidence records | 1,333 | 2,844 |

Optional features were not used; the one feature the agents did use
(file-bound evidence) produced its own treadmill, because the agents
read "stale" as "must re-evidence now".

## Root causes in the library, in rank order

1. No stop rule for owner-dependent work. The loop ended only on
   `verified_complete`, which needs zero unresolved findings, and a
   finding that needs a credential can never resolve. There was no
   artifact in which to ask the owner a question, so the agents planned
   around the questions instead.
2. The planner had to make a unit for every unresolved finding, with no
   cap and no class for "needs the owner". Eight dimensions reporting
   one defect became several units.
3. Nothing forbade acceptance bullets a unit cannot prove. Once a round
   added "a second reviewer confirms" to the acceptance text, the honest
   record rules demoted every finished unit, and the executor spent the
   following rounds re-evidencing instead of building.
4. Full review was mandatory after implementation and delta review was
   optional; "full" is the safe-looking choice, so agents chose it every
   round, at the cost of eight reviewer contexts and the same findings.
5. The execution log was append-only with no rotation, and evidence
   requirements named only "an artifact path", so agents invented ever
   larger artifacts to satisfy the evidence-quality reviewer.
6. Two contradictory rules on blocked units (stop the phase; move on and
   surface at the end). Agents followed the second, so a run never
   stopped, and the owner never saw a consolidated question.

## What changed

See the `CHANGELOG.md` entry "run economy". In one line each:

- `owner-decisions.md` with `assumable` and `needs-owner` rows, a
  recommendation and a default on every row, and `decision_policy` in the
  envelope so a standing "decide on your recommendation" is recorded once.
- The executor stops when nothing is runnable and reports decisions, not
  units; the entry point routes `next_task: owner-decisions.md` to the
  owner, never to the executor.
- Acceptance must be provable by the unit's own test; `done` is never
  demoted by a later rule; evidence is a pointer, not a copy; no
  docs-only "retain" commits; no re-attachment follow-ups.
- Rounds are capped at 25 runnable units with a backlog; `Risk`,
  `Model tier` and `Turn budget` are required.
- Delta review is the default; no review without runtime changes; a
  convergence guard stops the loop and asks the owner when findings stop
  falling.
- `rotate-execution-log.sh` plus archive-aware validators; the log stays
  under 1 MiB and resumption never loads the archives.
- `blockedOn` on records, validated against the decisions file, so
  "blocked" can no longer hide "waiting for the owner".

### Rotation, checked on the real logs

`rotate-execution-log.sh` was run on scratch copies of both logs with
`validate-execution-status.sh` before and after; the reports were
byte-identical apart from the generator stamp.

| Project | Sections moved | Log before | Log after | Archive |
|---|---|---|---|---|
| LeadEnricher | 320 | 6.16 MB | 2.09 MB | 4.10 MB |
| VillaRenovations | 108 | 17.42 MB | 5.17 MB | 12.25 MB |

What stays is the latest section per prompt. On LeadEnricher those latest
sections are still large because each carries every record the round
re-stated; the evidence-economy rules stop that going forward.

## Resuming the two projects on the new revision

LeadEnricher:

1. Pull the library, run `rotate-execution-log.sh` once (expect several
   archive files), and commit the result with the task that follows.
2. Convert `development/external-decisions.md` into
   `owner-decisions.md`: one row per question, class, options, a
   recommendation, what it unblocks. The 27 external rows should collapse
   to roughly ten questions.
3. One-time repair, recorded as a single decision row the owner confirms:
   units whose only unmet bullets are second-reviewer or retained-failing-run
   bullets get a follow-up record restoring `done`, with the bullet
   moved to the release gate it belongs to. That is a records change, so
   it gets no review round.
4. Finish the one runtime unit in flight (G01 production profile
   bootstrap), run one regression, and let the executor reach the "no
   runnable task" stop. The owner then answers the rows.

VillaRenovations:

1. Rebase the four honest validator fixes onto the new revision and
   drop the two size-check exemptions.
2. Run rotation; stop writing compatibility follow-ups; let the next
   phase-boundary regression stamp the stale records.
3. Record the one environment blocker (Docker daemon) as an owner row.

## How to measure the improvement

Compare, per project, before and after the pull:

| Metric | Before (LeadEnricher) | Target |
|---|---|---|
| Record lines per product+test line, per day | about 90 since 10-13 | under 2 |
| Units reaching `done` per round | 0 to 23 | over 20 of 25 |
| Review rounds per round that changed runtime code | 1 full | 1 delta, 0 when no runtime change |
| Execution log size | 6.1 MB | under 1 MiB after rotation |
| Owner questions asked per stuck finding | 0 | 1 row per question, recommendation on each |
| Release gates moved per round | 0 | at least the gates the owner rows unblock |

## Still open in the library

- The orchestrator prompts total about 430 KB; `executor.md` alone is
  over 50 KB. A weak model with limited context cannot hold it. The next
  change should split it into the loop (always loaded) and reference
  sections (loaded by need), and move examples out.
- Acceptance-bullet provability is a prompt rule. A parser warning for
  bullets that mention reviewers, receipts or retained runs would catch
  it mechanically.
- Per-round budgets are a prompt rule. The envelope could carry a
  running tool-call count per round so the validator can enforce the
  25-unit cap.
