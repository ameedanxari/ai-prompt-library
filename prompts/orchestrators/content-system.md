# Content System Orchestrator

Produces `prompts/outputs/current/content-system.md` — the end-user
persona voice pack, voice-and-tone guide, terminology glossary,
page-level content model, first-run experience spec, and seed/demo
data policy — plus `prompts/outputs/current/content-lint.config.json`,
the machine-readable config consumed by
`scripts/validate-content-lint.sh`.

This stage exists because structure and copy fail differently.
`ux-flows.md` decides what each screen *does*; this file decides what
each screen *says* and what a brand-new account *sees*. Without it,
each UI task invents copy in isolation: acceptance criteria leak
verbatim into helper text, internal delivery vocabulary ("walking
skeleton", "owning feature task") ships as page bodies, fixtures
masquerade as live data, and two components on one page say the same
thing twice. Every one of those defects shipped in a real audit
(SignalForge, 2026-07) and every one is prevented here.

## When to run

Runs **after** `ux-blueprint.md` (Step 2.8 — the screen map names the
surfaces whose strings this file owns) and **before** any UI-heavy
`tasks-*.md` is generated (Step 3). The engine invokes this
orchestrator automatically when the plan is greenfield and
`ux-flows.md` exists.

For audit-and-remediate runs: generate this file when remediation
touches user-visible copy, first-run state, or seed data — the audit's
gap list decides. Existing UI is evidence of what users see today, not
authority over what they should read.

Skip only for projects with no user-facing surface (pure backend /
CLI / library).

## Inputs

- `prompts/outputs/current/product-vision.md` — personas (voice
  anchor) and the activation milestone (first-value definition).
- `prompts/outputs/current/ux-flows.md` — screen map, per-screen state
  matrices, first-run expectations.
- `prompts/outputs/current/features-*.md` — `invariants` fields
  (never-display) and `user_stories` (the user's own vocabulary).
- `MY_PROJECT.md` — domain vocabulary the brief itself uses.

Do NOT load modules, architecture, or task files. Copy decisions are
audience decisions, not implementation decisions.

## Output schema

Write to `prompts/outputs/current/content-system.md`:

```markdown
---
generated_at: <ISO 8601>
project_name: <from product-vision.md>
personas: <comma-separated persona names from product-vision.md>
screens_covered: <N — must equal ux-flows.md total_screens>
---

# Content System — <Project Name>

## Persona voice pack

(One subsection per product-vision persona. This extends the vision's
persona with the language layer — it never redefines the persona.)

### <Persona name>
- **Words they use:** <8–15 domain words this person actually says —
  from the brief and user stories, not from the architecture>
- **Words they never say:** <internal vocabulary that must be
  translated before it reaches them — seeded from `invariants` and
  the banned-term list below>
- **Reading level / register:** <e.g. "plain professional English,
  ~8th-grade sentences, no jargon without an inline explanation">
- **What reassures them:** <the guarantees they care about, phrased
  as they would phrase them>
- **What alienates them:** <tones and framings to avoid — e.g.
  "compliance-speak before value", "engineering pride in the UI">

## Voice and tone

- **Voice (always):** 3–5 adjectives with one sentence each on what
  that adjective permits and forbids.
- **Tone by moment:** table — onboarding, success, error, waiting,
  destructive confirmation, empty state. Tone shifts; voice does not.
- **Example rewrites (MANDATORY, ≥ 6):**
  | Internal / spec phrasing | User-facing rewrite | Why |
  |---|---|---|
  | "Progress is stage-based and persisted. A partial result never reads as complete." | "Research runs in stages — you can leave and come back without losing progress." | Persistence is a database word; the user cares about safe interruption. |
  | "Signed in with a verified, server-owned session" | "You're securely signed in" | Session architecture is an invariant, not a message. |
  <...at least four more, drawn from THIS project's invariants...>

## Terminology glossary

| Internal concept | User word | Never display | Notes |
|---|---|---|---|
| <e.g. enrichment snapshot> | <e.g. saved research version> | — | <when each applies> |
| <e.g. draft-only mode> | <user phrase + one-line explanation affordance> | — | every mode badge gets an explanation |
| <internal term with no user surface> | — | ✓ | never appears in UI |

Every `invariants` entry from `features-*.md` appears here with either
a user translation or a `Never display ✓` mark. Every mode, badge, or
status a screen can show appears here with its explanation copy and,
where applicable, the action that changes it.

## Content model

(One subsection per screen in the ux-flows screen map. This is the
single source of truth for user-visible strings. UI tasks cite entries
by String ID; the executor adds entries here — with provenance — for
any string a task discovers it needs.)

### <Screen name>
| String ID | Element | Copy | State | Source |
|---|---|---|---|---|
| STR-<SCREEN>-001 | <heading/label/helper/badge/empty-state/error> | <the string> | <default/loading/empty/error/disabled/success/all> | <persona-pack / glossary / rewrite-table / FRE> |

Rules for every entry:
- Written in the persona's voice; passes the read-aloud test ("would
  <persona name> say this to a colleague?").
- No banned surface term (see lint config below).
- Empty, error, and loading states have real copy here — not "TBD",
  not the state name restated.
- Headings are unique within a screen; keyboard shortcuts declared in
  any screen's entries are unique across the whole model.
- A route that ships deferred (see stub policy below) has a
  STR-<SCREEN>-COMING-SOON entry written as honest user-facing copy —
  what this area will do and what to use meanwhile — never internal
  delivery vocabulary.

## First-run experience

- **Activation milestone:** <copied from product-vision.md — the
  user action that constitutes first value, and the target time>.
- **First-value journey:** ordered screen list from first sign-in to
  the milestone. The FIRST suggested action on the post-auth landing
  screen advances this journey. Governance, consent, and boundary
  education appear as reassurance alongside the journey or as required
  in-line steps — never as the destination.
- **Fresh account state, per screen:** for every screen in the map,
  what a brand-new account sees. Default is honest emptiness with a
  populate CTA (per the ux-flows empty state). List exactly what is
  seeded (settings defaults, locale, workspace name captured at
  signup) — and nothing else.
- **Identity capture:** signup captures or generates a human-readable
  name for every top-level entity it creates (workspace, organization,
  profile). Display names are NEVER derived from identifiers — no
  UUID fragments, no slug echoes. If a name is not captured, generate
  a warm default ("<First name>'s workspace") and make it renameable.
- **Empty-state inventory:** every `empty` row from every ux-flows
  state matrix, with its content-model String ID.

## Seed and demo data policy

- **Production accounts are production.** A normal signup — including
  the very first user of a fresh deployment — NEVER receives demo
  content, sample records, or fixture entities. The first-run
  experience above is what they get. The library plans and delivers
  functionality for production use; demo mode is never the default
  and is never forced.
- **Demo accounts are explicit.** If the project wants demo content,
  it lives ONLY behind designated demo account(s): named fixture data,
  seeded by an explicit script or flag, scoped to those accounts. The
  project README documents each demo account — credentials (or how to
  obtain them), role, and what it demonstrates.
- **Demo data is labeled in the UI.** A demo account's session shows a
  persistent "Demo workspace" indicator drawn from the content model.
- **Fixture realism, fixture honesty.** Demo fixtures use realistic
  names and `.example`/`.test` reserved domains, but fixture data may
  never render in a non-demo session. Test fixtures live under the
  fixture composition-map rules (`Evidence level: ui-fixture`) and are
  retired per the fixture-retirement contract — they are not a
  substitute for first-run design.

## Content risks

- <copy or first-run risks that don't fit the vision's register —
  e.g. "draft-only needs explanation or users will think sending is
  broken">
```

Also write `prompts/outputs/current/content-lint.config.json`:

```json
{
  "schemaVersion": 1,
  "projectName": "<project>",
  "uiSourceGlobs": ["<globs for files that contain user-visible strings, e.g. apps/web/src/**/*.tsx>"],
  "excludeGlobs": ["<tests, storybook, fixtures-by-design, e.g. **/*.test.*, **/*.fixtures.*>"],
  "bannedSurfaceTerms": [
    { "term": "persisted", "reason": "database word", "allowedContexts": [] },
    { "term": "server-owned", "reason": "session architecture", "allowedContexts": [] },
    { "term": "walking skeleton", "reason": "delivery-stage vocabulary", "allowedContexts": [] },
    { "term": "owning feature task", "reason": "delivery-stage vocabulary", "allowedContexts": [] },
    { "term": "planned capability", "reason": "delivery-stage vocabulary", "allowedContexts": [] },
    { "term": "adapter", "reason": "implementation noun", "allowedContexts": [] },
    { "term": "canonical", "reason": "implementation noun", "allowedContexts": [] }
  ],
  "identifierDerivedNamePatterns": [
    "slice\\s*\\(\\s*0\\s*,\\s*\\d+\\s*\\)",
    "substring\\s*\\(\\s*0\\s*,\\s*\\d+\\s*\\)"
  ],
  "demoAccountDocumentation": "<README path documenting demo accounts, or null when the project has none>"
}
```

Project-specific banned terms are ADDED to (never replace) the
starter set above. Terms come from the glossary's `Never display`
column and the features' `invariants` vocabulary. `allowedContexts`
lists narrow, justified exceptions (e.g. a developer-facing settings
page) as glob patterns — empty means banned everywhere user-visible.

## Generation rules

1. **Voice before strings.** Write the persona voice pack and rewrite
   table before the content model. Strings written first become
   spec-speak that the voice section then rationalizes.

2. **Coverage equals the screen map.** `screens_covered` must equal
   `ux-flows.md` `total_screens`. A screen with no content-model
   subsection is a screen whose copy will be invented under deadline
   by whoever builds it.

3. **The glossary is exhaustive over invariants.** Every `invariants`
   entry in every `features-*.md` lands in the glossary as either a
   translation or `Never display ✓`. This is the mechanical bridge
   that keeps the never-display channel closed at the copy layer.

4. **Read-aloud test is the acceptance test.** For each screen,
   read the default + empty + error strings aloud in the persona's
   voice. Any string the persona wouldn't say to a colleague gets
   rewritten. Record "passes persona read" per screen in the front
   matter of the section (one line).

5. **First-run is designed, not defaulted.** "Empty list" is not a
   first-run design. Every screen's fresh-account state names what
   the user sees AND the single next action that moves them toward
   the activation milestone.

6. **Demo is opt-in, documented, and labeled — production is never
   demo.** The policy section above is a contract, not guidance. A
   plan that seeds fixture entities into ordinary signups fails C18
   and the content lint.

7. **Length: 250–800 lines** for a typical 8–15 screen product.
   Below 250 means hollow per-screen coverage; above 800 means
   implementation detail has leaked into the content layer.

## Anti-patterns (auto-rejected by C18)

- **Spec transcription.** Any content-model string that reproduces an
  acceptance criterion, `invariants` wording, or a banned surface
  term verbatim.
- **Identifier-as-name.** Any copy pattern that renders an ID
  fragment as a display name ("Organization bc0c6494").
- **Fixture-as-first-run.** Seed/demo section that gives ordinary
  accounts sample data, or omits README documentation for a declared
  demo account.
- **Unexplained modes.** A badge or mode in the glossary without
  explanation copy (a "Draft-only" badge whose meaning the user must
  guess).
- **Duplicate shortcuts / duplicate headings** inside the content
  model.
- **Missing states.** A screen section with no empty or error
  strings.
- **Compliance-first onboarding.** A first-run section whose first
  suggested action is a reading exercise instead of a step toward
  first value.

## Output checkpoint

After writing both files, **STOP and present** to the user:

1. The persona voice labels and the 3–5 voice adjectives.
2. Three example rewrites (internal → user-facing).
3. The activation milestone and the first-value journey (screen list).
4. The demo-account decision (none, or which accounts + README path).
5. The line: `"Content system is ready at
   prompts/outputs/current/content-system.md. Say **Continue** to
   proceed to Step 3 (atomic task generation) — UI tasks will cite
   this content model per string — or give feedback to adjust
   first."`

## See also

- `ux-blueprint.md` — upstream screen map and state matrices.
- `product-vision.md` — personas and activation milestone upstream.
- `drill-down-engine.md` Step 3 — UI tasks cite the content model.
- `executor.md` rule 6 — surface-copy hygiene at execution time.
- `revise-outputs.md` C18 — validates this file's schema.
- `scripts/validate-content-lint.sh` — mechanical enforcement against
  the built application source.
