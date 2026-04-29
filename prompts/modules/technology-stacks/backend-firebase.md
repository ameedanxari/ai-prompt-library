# Firebase Backend Technology Stack Module

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
Provide production-ready implementation guidance for Firebase backend architecture (Auth, Firestore, Cloud Functions, Messaging, rules, and indexes).

## When to Use
- Backend infrastructure includes Firebase Auth, Firestore, Cloud Functions, or FCM.
- Contracts require webhook processing, idempotency, role claims, and moderation/audit flows.
- Project needs rapid delivery with managed infrastructure and strong security-rule enforcement.

## Implementation Focus
1. Define Firestore schema, composite indexes, and security rules before feature endpoint coding.
2. Implement Cloud Functions with contract-first handlers (request/response/error envelopes).
3. Enforce idempotency and replay safety for payment/webhook and lifecycle transitions.
4. Use role claims + rule checks for least-privilege access boundaries.
5. Add emulator-backed contract/integration tests and staged rollout controls.


## Validation Expectations
- `firebase emulators:exec --only firestore \"npm test\"`
- `npm test -- integration`

## Integration Notes
- For payment flows, pair with:
  - `.ai-prompts/prompts/modules/commerce/payment-processing.md`
  - `.ai-prompts/prompts/modules/fintech/transaction-processing.md`
