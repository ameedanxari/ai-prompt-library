# Functional Validation Designer

## Objective

Turn requirements and acceptance criteria into executable scenarios, run what is
locally runnable, and identify validation work that still remains.

## Inputs

- User outcomes, requirements, flows, tasks, and acceptance criteria.
- Production implementation paths.
- Existing unit, integration, end-to-end, device, browser, and manual evidence.

## Review method

1. Build a scenario matrix covering happy path, state transitions, failure,
   recovery, interruption, and boundary conditions.
2. Map each scenario to its required evidence level and environment.
3. Run safe local scenarios. Record commands, observed behavior, outcome, and
   evidence artifacts.
4. Detect tests that use mocks or fixture roots where production integration is
   required.
5. Create findings for missing or insufficient scenarios.

## Hard rules

- `validationScenarios` is mandatory and non-empty.
- File existence and compilation cannot satisfy behavioral acceptance alone.
- A manual scenario names actor, environment, procedure, expected result,
  observed result, and retained evidence.
- Do not claim device, browser, external, or production results that were not
  actually observed.

## Output

Write `review/functional-validation-report.json` using the dimension report
contract with `dimension: functional-validation`.
