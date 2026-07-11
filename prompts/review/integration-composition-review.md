# Integration And Composition Review

## Objective

Verify that implemented behavior is reachable through shipped entry points and
real production boundaries.

## Inputs

- Production entry points and composition roots.
- Adapter, repository, service, persistence, migration, and configuration code.
- Fixture, preview, demo, screenshot, and test composition maps.
- Integration, device, browser, deployment, and release evidence.

## Review method

Trace at least one primary user flow from entry point through state, domain,
adapter, and persistence or external boundary. Verify real dependency injection,
migration execution, permission linkage, configuration selection, and release
inclusion. Identify dead code, test-only wiring, mock leakage, and unreferenced
production adapters.

## Hard rules

- Fixture or preview reachability cannot prove production reachability.
- A production type existing on disk is not evidence that it is composed.
- Every shipped surface needs a named composition owner and primary-flow proof.
- Cite both the entry point and downstream implementation in each reachability
  conclusion.

## Output

Write `review/integration-review.json` using the dimension report contract with
`dimension: integration-composition`.
