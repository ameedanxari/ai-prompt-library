# Content Experience Review

## Objective

Validate what the product SAYS and what a brand-new account SEES — as the
end-user persona, not as an engineer. This dimension exists because every
other dimension can pass while the product explains its architecture to the
user, presents fixture people as the user's real team, and greets a fresh
account with internal delivery vocabulary. Reviews that check whether claims
are TRUE do not check whether they belong in front of a user; this one does.

## Inputs

- `product-vision.md` personas and the activation milestone.
- `content-system.md` (voice pack, glossary, content model, first-run spec,
  seed/demo policy) and `content-lint.config.json`.
- `ux-flows.md` screen map and state matrices.
- Digest-bound authoritative written design documents and visual references, plus the surface's `RequirementDocument.designs` criteria and required viewport/theme contexts. Where none exist, use the explicitly reviewed proposed direction and preserve that distinction.
- The shipped UI source, rendered screens or screenshots when available, and
  `content-inventory.json`.
- `content-lint-report.json` (mechanical pre-pass — cite it, do not repeat it).
- A FRESH account in the running product whenever the environment allows:
  sign up, do not seed, and walk the first-value journey.

## Review method

Perform the fresh-account dry-run checklist. Every item is pass/fail with
evidence; any failure is a finding (severity high or critical):

1. **Persona read.** Read every string on the post-auth landing, onboarding,
   and primary-journey screens aloud in the persona's voice. Spec-flavored
   copy (acceptance criteria, invariant wording, engineering nouns) is a
   finding even when the statement is technically true.
2. **No identifier-derived strings.** No user-visible string contains a raw
   or derived identifier (UUID fragments as names, slug echoes, hash prefixes).
3. **Zero banned terms.** `content-lint-report.json` shows zero
   banned-surface-term, fixture-data-in-ui-source, duplicate-shortcut, and
   identifier-derived-display-name issues.
4. **Live data is live.** Rosters, lists, and dashboards render the
   account's actual data: the signed-in user appears in their own member
   roster; the active workspace appears in the workspace list; two accounts
   with different data see different pages. Fixture entities rendering in a
   non-demo session is a CRITICAL finding — fake data presented as real is a
   defect class of its own, not a wiring backlog item.
5. **Navigation honesty.** Every reachable navigation target lands on real
   content or the declared honest coming-soon state; no unmarked stub, no
   internal delivery vocabulary anywhere a user can navigate.
6. **States render.** Empty, loading, error, and partial states exist and
   use content-model copy — not raw state names, not placeholder text.
7. **Modes explained.** Every badge, mode, and status visible to a fresh
   account has its glossary explanation reachable (tooltip, caption, or
   linked page) and, where applicable, an action.
8. **First value is the first action.** The first suggested action advances
   the activation milestone; governance and consent appear as reassurance or
   required in-line steps, never as the destination. The first-value journey
   is completable end to end within governance constraints.
9. **Demo policy holds.** Ordinary signups receive no demo content; demo
   accounts (when the project declares them) are README-documented with
   credentials and roles, and their sessions are visibly labeled.
10. **Inventory accounts for the strings.** `content-inventory.json` exists,
    matches the content model, and covers the screens walked.

## Finding rules

- Compare actual composed entry captures against each source criterion at every required context (phone and desktop for web). Judge intent, material/warmth, composition, hierarchy, content density and responsive behavior; approved tokens/fonts or working navigation cannot prove fidelity. Retain concise `design-review` comparisons with criterion/context IDs, same-outcome current entry image IDs, observations and pass/fail results. The entry capture route must exactly match the outcome entry point. A failed/missing comparison or rejected review blocks design acceptance and unrelated breadth; repair the same proof.
- Design acceptance needs a separate policy-appropriate trusted `design-review` decision bound by `deliveryDesignReviewBinding`, not a functional acceptance receipt. Comparisons and captures cannot use carry-forward. Automated validation enforces coverage, freshness and provenance; visual fidelity remains the reviewer's judgment.

- Judge from the persona's chair; "technically accurate" is not a defense.
- Cite the screen, the exact string or element, and the checklist item.
- A fresh-account walk is the preferred evidence; when the environment
  cannot run one, findings from source and screenshots remain open (not
  resolved) until a dry-run confirms them.
- Do not soften fixture-as-live-data findings into "wire live data later"
  recommendations — removing the false presentation is release-blocking
  even when the live wiring is deferred.

## Output

Write `review/content-experience-review.json` using the dimension report
contract with `dimension: content-experience`. Record the checklist as
`validationScenarios` (one scenario per item above, with outcome and
evidence). This report is the primary evidence for the `fresh-account`
release gate (`GATE-FRESH-ACCOUNT-001`).

For outcome runs bind every claim to the manifest outcome/check, original requirement, actual target/configuration/provider mode and retained current raw evidence. Inspect actual composed captures for visual surfaces and independently exercise the primary consumer journey plus relevant recovery. A component catalogue, build or fake provider cannot prove release readiness. Required acceptance needs resolved trusted owner/reviewer provenance; self-authored approval flags are insufficient. Preserve full release obligations and pending decisions.
