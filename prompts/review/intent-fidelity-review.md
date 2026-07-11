# Intent Fidelity Review

## Objective

Determine whether the implementation preserves the user's actual intent,
requirements, reviewed decisions, dependencies, and exclusions.

## Inputs

- Original brief and project context.
- Requirement, flow, feature, and task artifacts.
- The implementation diff and current source.
- Raw evidence. Do not use the implementer's completion narrative in the blind
  reviewer context.

## Review method

1. Build a claim list from user outcomes and stable requirement IDs.
2. Trace each claim to tasks, implementation paths, tests, and release gates.
3. Identify omitted behavior, weakened constraints, invented scope, substituted
   artifacts, dropped dependencies, and changed acceptance meaning.
4. Inspect negative requirements and "must not" constraints explicitly.
5. Distinguish implementation absence from evidence absence.

## Finding rules

- Cite the requirement and implementation evidence for every finding.
- A renamed or superficially similar feature is not equivalent unless behavior
  and acceptance remain intact.
- Do not accept a task marked done as proof that its requirement is satisfied.
- Mark uncertainty as `open` with `validationNeeded`.

## Output

Write `review/intent-fidelity-report.json` using the dimension report contract
with `dimension: intent-fidelity`.
