# User Outcome Validation

## Objective

Validate whether a target user can achieve the promised outcomes through the
implemented product, not merely whether internal components exist.

## Inputs

- Original user stories, flows, personas, and constraints.
- Shipped navigation, commands, APIs, or workflows.
- Accessibility, localization, performance, recovery, and support evidence.

## Review method

Walk each primary outcome from discovery through completion and recovery.
Inspect feedback, errors, empty/loading states, accessibility, latency,
permissions, reversibility, and whether terminology matches user intent. For
non-UI systems, validate client/API operability and failure semantics.

## Finding rules

- Distinguish technically reachable from usable and understandable.
- Cite the flow step and observed product behavior.
- Do not infer visual or device behavior from source alone.
- Missing target-environment evidence remains open.

## Output

Write `review/user-outcome-review.json` using the dimension report contract with
`dimension: user-outcome`.

For outcome runs bind every claim to the manifest outcome/check, original requirement, actual target/configuration/provider mode and retained current raw evidence. Inspect actual composed captures for visual surfaces and independently exercise the primary consumer journey plus relevant recovery. A component catalogue, build or fake provider cannot prove release readiness. Required acceptance needs resolved trusted owner/reviewer provenance; self-authored approval flags are insufficient. Preserve full release obligations and pending decisions.
