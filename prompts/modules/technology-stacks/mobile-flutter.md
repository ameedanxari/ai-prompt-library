# Flutter Technology Stack Module

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

## Example Prompt Block Usage
```markdown
## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/task-prompt-template.md`
- `.ai-prompts/prompts/templates/implementation-prompt-generation.md`
- `.ai-prompts/prompts/modules/technology-stacks/mobile-flutter.md`
- `.ai-prompts/prompts/modules/design-system/component-system.md`
- `.ai-prompts/prompts/stages/stage-06-implementation/mobile.md`
```

## Validation Expectations
- `flutter analyze`
- `flutter test`
- `flutter test integration_test`

## Integration Notes
- If backend stack is Firebase, pair with:
  - `.ai-prompts/prompts/modules/technology-stacks/backend-firebase.md`
  - `.ai-prompts/prompts/modules/integration/service-integration.md`
