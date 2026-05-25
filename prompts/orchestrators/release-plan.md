# Release Plan Orchestrator

Produces `prompts/outputs/current/release-plan.md` — a phased
delivery roadmap that converts the technical Phase tags
(`foundation | mvp | expand | polish`) into release stages
(`alpha | beta | ga | post-ga`) with explicit ship-gates,
deferred-work lists, and rollback strategy.

Without this file, the team has no shared answer to "when can we
ship?" — every Phase boundary becomes an ad-hoc judgement call,
and tasks tagged `polish` get either pulled forward (delaying GA)
or silently skipped (degrading the product).

## When to run

Runs **after** `drill-down-engine.md` Step 3.8
(`delivery-order.md` written), and **before** the Revise Gate.
The entry point invokes this orchestrator automatically for
greenfield runs. Audit-and-remediate runs do NOT trigger it —
existing products have an existing release process; the audit's
remediation tasks feed back into that process.

## Inputs

- `prompts/outputs/current/product-vision.md` (success metrics
  define what "shippable" means — a release-gate uses one or more
  metrics as its acceptance signal).
- `prompts/outputs/current/architecture.md` (performance budgets
  feed release gates).
- `prompts/outputs/current/delivery-order.md` (the Phase
  groupings — this is the spine of the release plan).
- All `prompts/outputs/current/tasks-*.md` (so we can name
  specific tasks per release stage; we DON'T re-read them in
  full, only their metadata headers).
- `prompts/outputs/current/external-accounts.md` (account-readiness
  gates — TestFlight, Play Console, etc.).

## Output schema

Write to `prompts/outputs/current/release-plan.md`:

```markdown
---
generated_at: <ISO 8601>
project_name: <from product-vision.md>
platforms: <comma-separated>
stages: [alpha, beta, ga, post-ga]
---

# Release Plan — <Project Name>

## Stage map
| Stage | What ships | Audience | Distribution |
|---|---|---|---|
| Alpha | Foundation + walking-skeleton MVP | Internal team only | Direct install / TestFlight internal / Play internal track |
| Beta | All MVP + selected Expand | Invited testers | TestFlight external / Play closed testing |
| GA   | All MVP + Expand + Polish | Public | App Store / Play Store |
| Post-GA | Stretch features | Public | Updates |

Stage-to-phase mapping (default; override only with explicit reason):
- **Alpha** ⊇ all `foundation` tasks + first vertical slice of `mvp`
- **Beta** ⊇ all `mvp` + select `expand` tasks (those that round out the MVP user journey)
- **GA** ⊇ all `mvp` + `expand` + `polish` tasks
- **Post-GA** ⊇ tasks deferred from the original plan + new feature work

## Stage details

### Alpha
- **Target date / ETA:** <date or "T + N weeks from start"; mark "TBD" if unknown>
- **Tasks in this stage:** <count + sample (3–6) of canonical task filenames>
- **Ship gate (all must pass to advance to Beta):**
  - [ ] All `foundation` tasks marked `done` in `execution-log.md`.
  - [ ] At least one end-to-end user journey runs without crashes
    (the "walking skeleton" test).
  - [ ] Build-gate green on both platforms / all targets.
  - [ ] CI pipeline runs all unit + integration tests on every PR.
  - [ ] Performance budget for cold launch met on the slowest
    supported device.
  - [ ] (Optionally) one product-vision metric instrumented and
    emitting data, even if values are baseline.
- **Known issues / deferred:** <items deliberately punted out of
  this stage, with one-line reason and the stage they ship in>
- **Rollback:** <what does "back out of Alpha" look like — usually
  uninstall + branch revert; document the steps>

### Beta
- **Target date / ETA:** <…>
- **Tasks in this stage:** <…>
- **Ship gate (all must pass to advance to GA):**
  - [ ] All `mvp` tasks marked `done`.
  - [ ] Selected `expand` tasks (named explicitly) marked `done`.
  - [ ] Privacy review complete (nutrition labels / data-safety
    forms filled — see `store-submission.md`).
  - [ ] Beta tester crash-free rate ≥ <target>%.
  - [ ] All accessibility AC from `ux-flows.md` verified manually
    on at least one device per platform.
  - [ ] Localisation: all `MY_PROJECT.md` locales render correctly
    (no truncation, RTL works).
  - [ ] Performance budgets met on representative devices.
- **Known issues / deferred:** <…>
- **Rollback:** <how a Beta cohort gets pulled back if a critical
  bug surfaces>

### GA
- **Target date / ETA:** <…>
- **Tasks in this stage:** <…>
- **Ship gate (all must pass to release publicly):**
  - [ ] All `mvp` + `expand` + `polish` tasks marked `done`.
  - [ ] Store-listing assets uploaded (screenshots × locale ×
    device class — see `store-submission.md`).
  - [ ] Final security review (no INTERNET permission for offline
    apps; no third-party SDKs not in `external-accounts.md`).
  - [ ] Final accessibility audit (automated + manual).
  - [ ] Final regression run — full test suite green.
  - [ ] Crash-free rate from Beta ≥ <target>%.
  - [ ] Post-launch monitoring plan in place — name the dashboard,
    alert, or daily check.
- **Known issues / deferred:** <items shipping in Post-GA>
- **Rollback:** <staged-rollout strategy — Apple phased release /
  Play staged rollout — and what triggers a pause or pull>

### Post-GA
- **Cadence:** <weekly / bi-weekly / monthly>
- **Deferred tasks ready to pick up:** <list from above stages>
- **Backlog (new work surfaced after GA):** <empty at planning time;
  populated as work continues>

## Cross-stage release gates

These apply to every stage, regardless of which Phase tasks
belong to:

- **Build-green gate** (`scripts/build-gate.sh`) is part of every
  task's execution and must remain green at stage boundaries.
- **Regression gate** — broader test suite runs at phase boundaries
  (already enforced by executor; see `executor.md` phase-boundary
  regression check).
- **External-accounts gate** — every service named in
  `external-accounts.md` has working credentials before the stage
  that needs it. Apple Developer / Play Console must be live
  before Alpha if internal distribution requires it; both must
  be production-ready before Beta.

## Risk register (release-specific)

Distinct from `product-vision.md`'s product/market risks — these
are about delivery:

| Risk | Stage where it surfaces | Mitigation |
|---|---|---|
| <risk> | <alpha/beta/ga> | <plan> |

Examples: "Apple review rejects on first submission" (mitigation:
submit metadata 1 week before code freeze, leave headroom for two
review rounds); "ML model accuracy regresses on real-user data"
(mitigation: ship Beta with telemetry on confidence buckets).

## Communication plan
- **Internal:** <when + how the team learns about stage transitions>
- **Beta testers:** <how Beta cohort is invited, supported, and
  reads release notes>
- **Public launch:** <changelog, marketing trigger, store-listing
  update timing>
```

## Generation rules

1. **Tasks in a stage are listed by canonical filename, not
   re-described.** The reader has the task files; the release
   plan just names them. Listing 3–6 representative tasks per
   stage is enough; the full list is `delivery-order.md`.

2. **Ship gates are checkable bullet items.** Every gate is a
   `[ ]` checklist item that can be ticked from a single
   command, log, or human verification step. "Quality is high"
   is not a gate. "Crash-free rate ≥ 99.5%" is.

3. **Every stage has a rollback.** Even Alpha. Especially Alpha.
   Internal builds need a clear "what we do if Alpha collapses"
   answer — usually "branch revert + reinstall last green build."

4. **Default stage-to-phase mapping unless brief says otherwise.**
   The default works for most products. Override only when the
   brief explicitly calls for unusual phasing (e.g. "ship just
   the iOS MVP first, then Android in a second release").

5. **Target dates are optional but useful.** When the user's
   brief or `MY_PROJECT.md` includes a target date, anchor stages
   to it. Otherwise use relative timing ("T + 2 weeks") or
   "TBD" — never fabricate a deadline.

6. **Reference downstream artifacts, don't duplicate them.** The
   release plan points at `store-submission.md` for asset
   readiness, at `ux-flows.md` for accessibility, at
   `architecture.md` for performance budgets. Duplicating those
   contents here causes drift.

7. **Length: 200–500 lines for a typical 3-stage release.** The
   release plan is a scaffold, not an essay.

## Anti-patterns (auto-rejected by C15)

- **Ship gate without a check.** "We feel ready" is not a gate.
  Every gate cites a command, log line, or named human step.
- **No rollback section.** Mandatory for every stage.
- **Phase inversion in stage content.** A stage that includes
  `polish` tasks but excludes some `mvp` tasks is incoherent —
  the executor would have to skip an earlier-phase task to honour
  the stage cut. Flag and re-grade.
- **All tasks land in one stage.** A release plan that says "all
  71 tasks ship in GA" is just a task list — it's not a plan.
  Force the cut.
- **Target dates with no math.** A "ship in 3 weeks" claim with
  no link to task estimates or team capacity is fantasy.

## Output checkpoint

After writing `release-plan.md`, **STOP and present** to the
user:

1. The stage map (one line per stage).
2. The task-count per stage (e.g. "Alpha: 15 tasks; Beta: 28
   tasks; GA: 13 tasks").
3. The top three release-specific risks (one line each).
4. The line: `"Release plan is ready at
   prompts/outputs/current/release-plan.md. Say **Continue** to
   run the Revise Gate, or give feedback to adjust the staging
   first."`

If the user pushes back on the stage cut, that's the cheapest
moment to re-grade Phase tags or re-distribute tasks across
stages — before the executor commits hours to building them in
the wrong order.

## See also

- `delivery-order.md` — the Phase-grouped, topologically-sorted
  task list that this plan builds on.
- `product-vision.md` — success metrics that feed ship gates.
- `architecture.md` — performance budgets that feed ship gates.
- `store-submission.md` — asset-readiness gates referenced from
  Beta and GA.
- `revise-outputs.md` C15 — validates this file's schema.
