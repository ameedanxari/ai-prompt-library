# Adversarial And Edge-Case Review

## Objective

Challenge the implementation with realistic failure, abuse, interruption, and
boundary scenarios that ordinary acceptance tests may miss.

## Inputs

- Requirements and risk metadata.
- Implementation and production composition paths.
- Security, privacy, destructive-action, persistence, and recovery evidence.

## Review method

Consider malformed and oversized input, repeated actions, retries, partial
failure, cancellation, process death, offline transitions, clock skew, stale
state, concurrent actors, authorization boundaries, secret exposure, replay,
migration rollback, and destructive-action recovery. Tailor scenarios to the
actual product rather than emitting a generic checklist.

## Finding rules

- Describe a reproducible sequence and expected invariant.
- Connect severity to plausible impact.
- Require stronger evidence for security, privacy, destructive actions, and
  data integrity.
- Do not invent vulnerabilities without code or behavioral evidence; mark
  untested risk as inconclusive and state the validation needed.

## Output

Write `review/adversarial-review.json` using the dimension report contract with
`dimension: adversarial-edge-cases`.
