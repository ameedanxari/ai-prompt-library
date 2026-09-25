# Cross-Platform Parity Validation Test Generator

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by .ai-prompts/scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
Generate comprehensive test suites that validate functional equivalence and consistent behavior across all target platforms in a cross-platform application.

## Integration Points

This template integrates with the following v2 templates for comprehensive domain testing:

### Domain-Specific Parity Testing
- **Commerce** (`commerce/*.md`): Product, cart, checkout, and payment parity
- **Social** (`social/*.md`): Messaging, feeds, and profile parity
- **Healthcare** (`healthcare/*.md`): HIPAA-compliant data handling parity
- **Fintech** (`fintech/*.md`): Transaction and account parity
- **Media Streaming** (`media-streaming/*.md`): Playback and streaming parity
- **Enterprise SaaS** (`enterprise-saas/*.md`): Multi-tenant feature parity
- **IoT** (`iot/*.md`): Device connectivity and data parity
- **Blockchain** (`blockchain/*.md`): Wallet and transaction parity

### Cross-Cutting Parity Testing
- **Security** (`security/*.md`): Authentication and authorization parity
- **Analytics** (`analytics/*.md`): Event tracking parity
- **Notifications** (`notifications/*.md`): Notification delivery parity
- **Search** (`search-discovery/*.md`): Search functionality parity
- **Real-Time** (`real-time-communication/*.md`): WebSocket and sync parity

## Context Variables
- `{{target_platforms}}` - List of target platforms (web, ios, android, desktop)
- `{{features_to_test}}` - List of features requiring parity validation
- `{{test_framework}}` - Testing framework to use (jest, cypress, detox, etc.)
- `{{project_name}}` - Name of the project for test organization
- `{{api_base_url}}` - Base URL for API testing

## Prompt Template

You are tasked with generating parity validation tests for {{project_name}}. These tests will ensure functional equivalence and consistent behavior across all target platforms.

### Target Platforms
{{#each target_platforms}}
- {{this}}
{{/each}}

### Features to Test
{{#each features_to_test}}
- {{this}}
{{/each}}

### Testing Framework: {{test_framework}}


## When to use this module

- Generating test suites that validate functional equivalence and consistent behavior across target platforms (iOS/Android/web).
- API, UI component, functional, platform-specific, and performance parity testing.

## Essential checklist

- **Structure the suite**: project layout plus shared test data and utilities.
- **API parity**: generate tests validating API behavior consistency across platforms.
- **UI component parity**: generate tests for UI component consistency.
- **Functional parity**: generate tests for feature behavior consistency.
- **Platform-specific validation**: OS capabilities, permissions, fallbacks, store-policy risk.
- **Performance parity**: generate tests for performance consistency.

## Expandable detail

This brief is the short core: what the module is, when to use it, and the essential checklist. The full substance lives in the expandable detail files below — load them via this brief when you need them.

- `.ai-prompts/prompts/modules/cross-platform/parity-validation-tests.detail-1-instructions.md` (~3.1k est / ~4.6k max tokens) — The six test-generation steps in full — read when authoring the parity suite.
- `.ai-prompts/prompts/modules/cross-platform/parity-validation-tests.detail-2-fake-backend-integration.md` (~4.1k est / ~6.2k max tokens) — Fake-backend integration for parity testing — read when tests need a shared fake backend.
- `.ai-prompts/prompts/modules/cross-platform/parity-validation-tests.detail-3-parity-suite-structure.md` (~2.3k est / ~3.5k max tokens) — Complete worked suite part 1: project structure, shared data, API parity tests.
- `.ai-prompts/prompts/modules/cross-platform/parity-validation-tests.detail-4-parity-suite-cases.md` (~2.8k est / ~4.2k max tokens) — Complete worked suite part 2: UI, functional, and platform-specific validation tests.
- `.ai-prompts/prompts/modules/cross-platform/parity-validation-tests.detail-5-templates-composition.md` (~4.1k est / ~6.1k max tokens) — Integration points, module references, domain-specific test templates, composition rules — read for template authoring.

Token budgets use one uniform heuristic: estimated tokens ≈ file bytes ÷ 4; max budget = ⌈est × 1.5⌉. Detail budgets are per-file, listed above.
