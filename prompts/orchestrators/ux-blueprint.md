# UX Blueprint Orchestrator

Produces `prompts/outputs/current/ux-flows.md` — the canonical screen
map, per-screen specifications, interaction details, and accessibility
acceptance criteria. Downstream UI task generation cites this file
instead of re-deriving screen behaviour per task. Without it, weak
models build the same screen with different state coverage across
features.

This is the artifact most-frequently missing in DPROMPT outputs vs
competitor planners. `ui-reference-source-map.md` (already produced
by drill-down Step 2.6) covers *design language* — colours, motion,
inspirations. `ux-flows.md` covers *screen behaviour* — what each
screen does, every state it can be in, how the user navigates.

## When to run

Runs **after** `architecture-blueprint.md` (so screens align with
the chosen tech stack and layer boundaries) and **before** any
UI-heavy `tasks-*.md` is generated. The entry point invokes this
orchestrator automatically when:

- The plan is greenfield, AND
- At least one feature in `features-*.md` is UI-heavy (screen,
  flow, dashboard, dialog, swipe interface, list, form).

Skip when the project is purely backend / CLI / library. Skip for
audit-and-remediate runs — existing UI is the truth.

## Inputs

- `prompts/outputs/current/product-vision.md` (positioning sets the
  UX tone — "privacy-first" implies trust-building copy; "speed-first"
  implies aggressive defaults; "delight-first" implies haptic +
  motion polish).
- `prompts/outputs/current/architecture.md` (tech stack constrains
  what interactions are even possible — SwiftUI vs UIKit, Compose
  vs Views, Tailwind vs vanilla).
- `prompts/outputs/current/ui-reference-source-map.md` if it exists
  (design language reference — non-copy boundaries, components,
  tokens).
- All UI-heavy `features-*.md` (each feature drives 1+ screens).
- Relevant **design-research** and **design-system** modules from
  `.ai-prompts/prompts/modules/` (e.g. mobile screen patterns,
  dashboard patterns, Tailwind UI patterns) selected via
  `module-selection-index.md`.

Do NOT load every feature — only those where `features-*.md`
mentions a screen, flow, dialog, or UI surface.

## Output schema

Write to `prompts/outputs/current/ux-flows.md`:

```markdown
---
generated_at: <ISO 8601>
project_name: <from product-vision.md>
platforms: <comma-separated>
total_screens: <N>
---

# UX Flows — <Project Name>

## Design principles
3–5 product-specific principles. NOT generic ("be clear, be fast")
— specific to this product ("show storage savings live", "never
require the user to wait for ML to finish to act"). These
principles tie every decision below back to the product vision.

## Screen map
<ASCII tree or mermaid diagram of every screen and how the user
navigates between them. Each screen has a stable name (used as
the section anchor below). Example:

  Splash
   └─ Onboarding (first run only)
       ├─ Welcome
       ├─ Privacy promise
       ├─ Permission education
       └─ Permission request → OS dialog
   └─ Home
       ├─ Filter picker (push)
       │   └─ Swipe deck (modal)
       │       └─ Review pending (push)
       │           └─ OS deletion dialog
       ├─ Storage dashboard (tab)
       └─ Settings (push)
>

## Navigation rules
- Push vs modal vs tab — when each applies.
- Back-stack expectations.
- Deep-link entry points (if any).
- "Where the user lands after kill-and-relaunch" (resumption).

## Per-screen specifications

(One subsection per leaf screen in the map above. Branching screens
without leaf content can be summarised in one line.)

### <Screen name>

- **Purpose:** <one sentence>
- **Entry points:** <where the user comes from>
- **Exit points:** <where the user goes next>
- **Primary action:** <the single most important thing on this screen>
- **Components:** <list of named UI components — primitives + composed>
- **State matrix:** (ALL SIX must be addressed, even if "N/A" with reason)
  | State | Behaviour |
  |---|---|
  | default | <what the user sees on first visit with normal data> |
  | loading | <what shows while data fetches; skeleton vs spinner vs progress> |
  | empty | <what shows when there's no data; CTA to populate> |
  | error | <which errors are possible; per-error copy + recovery action> |
  | disabled | <when interactions are disabled and why> |
  | success | <what confirms a successful action — toast, transition, sound, haptic> |

- **Interactions:** (gestures + thresholds, when applicable)
  - <e.g. swipe left ≥ 30% screen width → commit delete, heavy haptic, card animates off-screen with rotation>
- **Animation / motion:** spring/duration/easing curves, reduced-motion fallback.
- **Accessibility AC:**
  - VoiceOver / TalkBack label per interactive element.
  - Touch targets ≥ 44×44 pt iOS / 48×48 dp Android.
  - Dynamic Type / system font scale honoured up to the platform max.
  - Reduced-motion: <which animations are replaced and with what>.
  - Color contrast ≥ WCAG AA (4.5:1 normal, 3.0:1 large + UI).
- **Localisation:** <RTL behaviour, max string length tolerated, locale-specific date/number formatting>.

## Cross-screen patterns
- **Empty data on first launch:** <how the whole app behaves when the user has yet to populate it>.
- **Permission revoked mid-session:** <recovery path>.
- **Offline / no-network:** <which screens degrade, how>.
- **Crash recovery:** <what the user sees when they relaunch after a crash; what was preserved>.

## Open UX risks
- <UX-specific risk that doesn't fit the product-vision register>
```

## Generation rules

1. **One screen per logical workspace, not per visual variant.** A
   "settings screen with three sections" is ONE screen; a "first-run
   onboarding with five steps" is FIVE screens (each is its own
   workspace).

2. **State matrix is non-negotiable.** Every leaf screen must
   address every state. If a state genuinely doesn't apply, say
   `N/A (reason)` — same discipline as `Test: N/A (reason)` in
   tasks. Empty state is the one weak models always miss.

3. **Accessibility AC is mandatory.** Five fields per screen
   (VoiceOver, touch targets, dynamic type, reduced motion,
   contrast). A screen spec missing any of these is rejected by
   C14. The library's a11y baseline epic verifies this from the
   task side; here we verify it from the spec side.

4. **Reuse `ui-reference-source-map.md` for design language.** Do
   not re-research patterns here. If the source map says the swipe
   metaphor follows the Tinder pattern with non-copy boundaries,
   cite the source map row by name — do NOT re-describe the
   pattern.

5. **One screen → multiple tasks is fine.** A complex screen like
   "swipe deck" will be split into 3–5 tasks (card interaction,
   queue builder, undo, haptic feedback, animation). The blueprint
   names the screen once; tasks slice it.

6. **Navigation rules need to be testable.** "User taps Back" is
   not testable. "Back gesture pops one level in the navigation
   stack; if at root, asks for confirmation before exiting the
   app" is testable.

7. **Length: 400–1200 lines for a typical 8–15 screen mobile app.**
   Below 400 means hollow per-screen specs; above 1200 means the
   specs have absorbed business-logic detail that belongs in
   features-*.md.

## Anti-patterns (auto-rejected by C14)

- **State matrix incomplete.** Caught mechanically by checking
  that every screen subsection contains the words `default`,
  `loading`, `empty`, `error`, `disabled`, `success` (the same
  check pattern as drill-down's UI state-coverage gate).
- **Missing accessibility AC.** Caught mechanically by checking
  for `VoiceOver`/`TalkBack`, `44×44`/`48×48` (or `44`/`48` with
  context), `Dynamic Type`/`font scale`, `reduced motion`,
  `WCAG`/`contrast`. A screen missing 3+ of these is rejected.
- **Generic interaction language.** "Swipe to delete" without
  threshold, haptic, animation timing, or spring-back is rejected.
- **No navigation rules.** Push-vs-modal-vs-tab and back-stack
  behaviour are not optional — they decide the architecture of the
  navigation host.
- **Screens with no entry/exit points.** Orphan screens are dead
  weight; either wire them or drop them.
- **More than 30 screens for an MVP-scope plan.** Almost always
  means screen-creep. Consolidate.

## Output checkpoint

After writing `ux-flows.md`, **STOP and present** to the user:

1. The screen-map outline (just the tree).
2. The list of design principles (just labels, not bodies).
3. The line: `"UX blueprint is ready at
   prompts/outputs/current/ux-flows.md. Say **Continue** to
   proceed to Step 3 (atomic task generation) — which will cite
   this blueprint per UI task — or give feedback to adjust first."`

This is the last checkpoint where re-grading a screen is cheap.
Once tasks reference a screen by name, renaming or merging is more
expensive.

## See also

- `drill-down-engine.md` Step 3 — consumes this file when emitting
  UI-heavy tasks.
- `ui-reference-source-map.md` — design-language reference,
  consumed in parallel.
- `architecture-blueprint.md` — tech-stack constraint upstream.
- `product-vision.md` — UX tone constraint upstream.
- `revise-outputs.md` C14 — validates this file's schema.
