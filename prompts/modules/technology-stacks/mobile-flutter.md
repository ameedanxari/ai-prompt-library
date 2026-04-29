# Flutter Technology Stack Module

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
Provide production-ready guidance for Flutter mobile applications with clear patterns for architecture, state management, routing, testing, and release operations.

## When to Use
- Mobile scope includes Flutter or Dart.
- A single mobile app must support multiple role-based flows (for example Student + Tutor).
- Design-system token/component reuse is required across many screens.

## Implementation Focus
1. Use a feature-first folder structure and typed domain models.
2. Establish a design-system layer first (`AppColors`, `AppSpacing`, reusable primitives).
3. Enforce role-aware routing with guarded navigation and deterministic deep-link handling.
4. Integrate API contracts with explicit error envelopes and retry/backoff behavior.
5. Build test coverage across unit/widget/integration tiers with stable CI commands.

## Recommended Structure
```text
lib/
  core/
    design_system/
    networking/
    routing/
  features/
    auth/
    discovery/
    booking/
    payments/
    tutor/
    admin_support/
```


## Validation Expectations
- `flutter analyze`
- `flutter test`
- `flutter test integration_test`

## Integration Notes
- If backend stack is Firebase, pair with:
  - `.ai-prompts/prompts/modules/technology-stacks/backend-firebase.md`
  - `.ai-prompts/prompts/modules/integration/service-integration.md`
