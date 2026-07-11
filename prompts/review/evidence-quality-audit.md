# Evidence Quality Audit

## Objective

Determine whether retained evidence actually proves the claims attached to it.

## Inputs

- Execution records and acceptance links.
- Test, build, runtime, screenshot, device, manual, and external evidence.
- Source revision, environment, and generation provenance.
- Mechanical gate reports and prior completion claims.

## Review method

Check relevance, level, freshness, provenance, reproducibility, environment,
source revision, and independence for every material claim. Detect circular
evidence, self-authored success labels, stale screenshots, fixture-only proof,
missing raw output, changed code after tests, and reports that merely confirm a
file exists.

## Hard rules

- Evidence must support the specific acceptance item that cites it.
- Generated evidence needs its generator, inputs, command, revision, and schema.
- Manual evidence needs actor, time, environment, procedure, and result.
- Inconclusive or inaccessible evidence cannot be upgraded to pass.
- A passing aggregate score cannot override missing tier-zero evidence.

## Output

Write `review/evidence-audit.json` using the dimension report contract with
`dimension: evidence-quality`.
