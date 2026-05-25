# Product Vision Orchestrator

Produces `prompts/outputs/current/product-vision.md` — a one-page
product narrative that downstream orchestrators (epics, architecture,
UX, release plan, store submission) all consume. Without this file,
every later stage has to re-derive positioning and target users from
the freeform brief, and weak models drift differently each time.

## When to run

Runs **after** `external-input-handler.md` (if applicable) and
**before** `drill-down-engine.md` Step 1 (Seed). The entry point
invokes this orchestrator automatically when:

- The plan is greenfield (`epics.md` does not yet exist).
- `MY_PROJECT.md` or the user's brief is the input.

Audit-and-remediate (gap-closure) runs do NOT trigger this — the
product vision was set when the project was originally built; the
audit consumes the existing codebase instead.

## Inputs

- `MY_PROJECT.md` (the user's brief + Restrict + Platforms).
- `prompts/outputs/current/project-context.md` (optional — supplied
  by external-input-handler when designs/specs/code were attached).

That's it. No modules, no other orchestrators, no other outputs.
Isolation discipline from drill-down carries over.

## Output schema

Write to `prompts/outputs/current/product-vision.md`:

```markdown
---
generated_at: <ISO 8601>
project_name: <from MY_PROJECT.md>
platforms: <comma-separated, from MY_PROJECT.md>
---

# Product Vision — <Project Name>

## Identity
- **Name:** <project name>
- **One-liner:** <a single sentence a stranger could repeat>
- **Positioning:** <one short paragraph — who this is for, what it
  does, what makes it different from the obvious alternatives>
- **Platforms:** <ios | android | web | desktop — from MY_PROJECT.md>

## Personas (1–3, no more)
### <Persona name — a real-feeling label, not a marketing word>
- **Role / context:** <who they are and when they reach for this>
- **Primary goal:** <the one job they hire this product to do>
- **Frustrations today:** <what's broken about how they do it now>
- **What "good" looks like for them:** <the felt outcome>

## Success metrics (3–5, measurable)
| Metric | Target | How we measure |
|---|---|---|
| <metric> | <target value> | <data source / instrumentation> |

These metrics MUST be measurable. "Users love the product" is not
a metric. "Day-7 retention ≥ 35%" is. If a metric needs new
instrumentation to measure, name the instrumentation source.

## Non-goals (explicit, 3–5)
- <thing the product is NOT trying to do, and why that's deliberate>

Every non-goal is a future-feature-request you're pre-empting. The
purpose is to let the engineering plan exclude these without
guilt later.

## Risks & assumptions (3–7, ranked by impact)
| Risk / assumption | Impact if wrong | Mitigation / how we'd know |
|---|---|---|
| <risk> | <what breaks> | <signal that the risk fired + what we'd do> |

Include both technical risks (e.g. "Apple may reject privacy
nutrition labels for ML inference disclosure") and product risks
("users may not understand the swipe metaphor without onboarding").

## Out-of-scope-this-version
- <work that's product-vision-aligned but explicitly punted>

Distinct from "non-goals." Non-goals are "we never want this."
Out-of-scope-this-version is "yes, eventually, but not yet."
```

## Generation rules

1. **Read MY_PROJECT.md in full.** Every section. Do not summarise
   from the title alone. The brief is usually 100–500 words; reading
   it carefully is cheaper than misreading it.

2. **Identity — write the one-liner first.** If you can't write the
   one-liner in 12 words or fewer, the product is over-scoped or
   under-specified. Surface that to the user as a clarifying question
   instead of papering over it with vague language.

3. **Personas — 1 to 3, NEVER more.** Weak models invent five
   personas to "cover everyone." The result is a plan that serves
   no one. If the brief mentions one user type, write ONE persona.
   The presence of an explicit secondary persona implies the team
   will spend budget on that persona; only include them when the
   brief warrants it.

4. **Metrics — three rules:**
   - Each metric has a unit and a target value.
   - Each metric names how it will be measured (existing tool,
     server log, on-device instrumentation, A/B platform).
   - At least one metric is a **leading** indicator (something we
     can read within the first weeks), not just a lagging one
     (revenue, retention at 90 days). Without a leading indicator,
     the team has nothing to course-correct on.

5. **Non-goals — they MUST be exclusions, not features.** A non-goal
   like "social login" means we are deliberately not building it
   even when users ask. If the brief mentions social login as a
   future feature, that goes under out-of-scope-this-version, not
   non-goals.

6. **Risks — at least one technical AND at least one product risk.**
   A vision doc that lists only product risks is naive about
   delivery; one that lists only technical risks is naive about
   adoption. Both kinds matter.

7. **No hedging.** Avoid "may", "might", "could potentially". The
   product vision is the team's bet — state it as a bet. If a fact
   is uncertain, surface it as a risk or assumption, not as soft
   product copy.

8. **Length: 200–500 lines.** Less than 200 means hollow; more than
   500 means the vision is doing the architecture's job.

## What this file does NOT contain

- Tech stack choices (those go in `architecture.md`).
- UI screens (those go in `ux-flows.md`).
- Release dates / phasing (those go in `release-plan.md`).
- Store metadata copy (that goes in `store-submission.md`).
- Per-feature acceptance criteria (those go in `features-*.md`).

The product vision is *upstream* of all of those. Mixing concerns
defeats the purpose of having a separate doc.

## Anti-patterns (auto-rejected by C12)

- **Marketing copy without measurement.** "Delightful, intuitive,
  best-in-class" with no metric to back it. Either it's a metric
  (NPS ≥ 50) or it's deleted.
- **Persona with no frustration.** A persona that has no current
  pain has no reason to switch to this product. Reject.
- **More than 3 personas.** Forces scope discipline.
- **Empty risk register.** Every product has risks. An empty
  register means the writer didn't think.
- **"All users" / "anyone" / "people who want X."** Personas are
  specific or they are useless.
- **Non-goals identical to out-of-scope-this-version.** The
  distinction must be respected — one is a permanent exclusion,
  the other is a near-term defer.

## Output checkpoint

After writing `product-vision.md`, **STOP and present** to the user:

1. The one-liner.
2. Persona names (just the labels, not the bodies).
3. The metric list (just metric name + target).
4. Top three risks (just one line each).
5. The line: `"Product vision draft is ready at
   prompts/outputs/current/product-vision.md. Say **Continue** to
   proceed to Step 1 (Seed) — generate epics — or give feedback to
   adjust the vision first."`

The vision is the upstream anchor for the whole plan; landing it
wrong here propagates into every later artifact. Slow down on this
checkpoint.

## See also

- `drill-down-engine.md` — consumes this file in Step 1 (Seed).
- `architecture-blueprint.md` — consumes positioning + non-goals
  to scope the tech choices.
- `release-plan.md` — consumes success metrics to define release
  gates.
- `revise-outputs.md` C12 — validates this file's schema.
