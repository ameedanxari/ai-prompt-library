# Implementation Prompt Pack Template

## Purpose
Convert Stage 06 task lists into executable, per-task prompts that any agent can run without prior chat context.

## Required Outputs
- `prompts/outputs/implementation-prompts/prompt-pack-index.md`
- `prompts/outputs/implementation-prompts/<track>-<task-id>.md` (one file per task)

## Hard Rules
1. Every per-task prompt must be fully populated and executable in isolation.
2. Placeholder text is forbidden in generated output files, including:
   - `[implementation file paths for ...]`
   - `[test file paths for ...]`
   - `[project-specific lint/test/build commands for ...]`
   - `- \` placeholder lines
3. `Prompt Blocks Applied` in every per-task prompt must contain concrete `.ai-prompts/prompts/...` paths.
4. UI tracks (`mobile-app`, `admin-web`, `web`) must include design-system foundation/component tasks before screen-specific tasks.
5. Every task ID in task-list files must have exactly one row in `prompt-pack-index.md`.
6. Every per-task prompt must include at least:
   - one **semantic module** path from `.ai-prompts/prompts/modules/...` selected by task intent (auth/profile/booking/payment/notification/design-system/etc.).
   - one **technology-stack module** path from `.ai-prompts/prompts/modules/technology-stacks/...` selected from the project's stack.
   - intent-specific semantic routing for these intents:
     - `profile` -> include at least one of:
       - `.ai-prompts/prompts/modules/social/user-profiles.md`
       - `.ai-prompts/prompts/modules/social/user-verification.md`
     - `discovery/search` -> include at least one of:
       - `.ai-prompts/prompts/modules/search-discovery/full-text-search.md`
       - `.ai-prompts/prompts/modules/search-discovery/semantic-search.md`
       - `.ai-prompts/prompts/modules/search-discovery/recommendation-systems.md`
       - `.ai-prompts/prompts/modules/search-discovery/search-personalization.md`
       - `.ai-prompts/prompts/modules/search-discovery/faceted-search.md`
       - `.ai-prompts/prompts/modules/social/social-discovery.md`
       - `.ai-prompts/prompts/modules/commerce/product-search.md`
     - `analytics/reporting` -> include at least one of:
       - `.ai-prompts/prompts/modules/analytics/business-metrics.md`
       - `.ai-prompts/prompts/modules/analytics/custom-reporting.md`
       - `.ai-prompts/prompts/modules/analytics/user-analytics.md`
       - `.ai-prompts/prompts/modules/analytics/cohort-analysis.md`
       - `.ai-prompts/prompts/modules/analytics/real-time-analytics.md`
       - `.ai-prompts/prompts/modules/search-discovery/search-analytics.md`
       - `.ai-prompts/prompts/modules/notifications/notification-analytics.md`
     - `moderation/review` -> include at least one of:
       - `.ai-prompts/prompts/modules/content-management/content-moderation.md`
       - `.ai-prompts/prompts/modules/social/content-moderation.md`
       - `.ai-prompts/prompts/modules/social/communication-moderation.md`
       - `.ai-prompts/prompts/modules/enterprise-saas/audit-trails.md`
   - `.ai-prompts/prompts/modules/integration/service-integration.md` is allowed as a supporting module, but it must not be the only semantic module when one of the above intents is detected.
7. Per-task prompt `Files to Create/Modify` paths must anchor to real project roots (for example existing top-level directories) and avoid synthetic placeholder trees.
8. `prompt-pack-index.md` must include explicit semantic and stack prompt block columns per task row.

## Semantic Intent Routing Matrix (Required)

Use this matrix before writing each per-task prompt. Match by task title, objective, and acceptance criteria keywords.

| Intent | Trigger Keywords (examples) | Required Semantic Module Family |
|---|---|---|
| Profile / Identity Data | `profile`, `onboarding`, `verification`, `avatar`, `bio`, `certification` | `social/user-profiles`, `social/user-verification` |
| Discovery / Search | `discover`, `search`, `browse`, `catalog`, `recommend`, `listing`, `feed` | `search-discovery/*`, `social/social-discovery`, `commerce/product-search` |
| Analytics / Reporting | `analytics`, `metrics`, `dashboard`, `report`, `insight`, `kpi`, `cohort` | `analytics/*`, `search-discovery/search-analytics`, `notifications/notification-analytics` |
| Moderation / Review / Audit | `moderation`, `review`, `approve`, `reject`, `queue`, `audit`, `compliance` | `content-management/content-moderation`, `social/*moderation`, `enterprise-saas/audit-trails` |

If multiple intents match, include one semantic module per matched intent category.

## Task Prompt File Structure (Required)
```markdown
# Task Prompt: [Track]-[Task ID] - [Title]

## Metadata
- Task ID: [M-1.1]
- Track: [mobile-app]
- Dependencies: [ids]
- Estimated Effort: [30-60 min]

## Objective
[single clear outcome]

## Context
- Specifications: [absolute file references]
- Design assets: [mockup file references]
- API contracts: [contract IDs and endpoint rows]
- Data architecture references: [collections/tables/indexes]

## Files to Create/Modify
- [path] - [change]

## Acceptance Criteria
- [ ] [testable criterion]
- [ ] [integration criterion]
- [ ] [design fidelity criterion]

## Validation Commands
- [project-specific test/lint/build commands]

## Prompt Blocks Applied
- `.ai-prompts/prompts/templates/task-prompt-template.md`
- `.ai-prompts/prompts/templates/implementation-prompt-generation.md`
- `.ai-prompts/prompts/modules/[semantic-module].md`
- `.ai-prompts/prompts/modules/technology-stacks/[stack-module].md`
- `.ai-prompts/prompts/stages/stage-06-implementation/[platform].md`
```

## Prompt Pack Index (Required)
```markdown
# Implementation Prompt Pack Index

| Task ID | Prompt File | Semantic Prompt Blocks | Stack Prompt Blocks | Depends On | Status |
|---|---|---|---|---|---|
| M-1.1 | prompts/outputs/implementation-prompts/mobile-app-m-1-1.md | `.ai-prompts/prompts/modules/design-system/component-system.md` | `.ai-prompts/prompts/modules/technology-stacks/mobile-flutter.md` | none | ready |
```

## Validation Checklist
- [ ] Every task from task lists has a prompt file
- [ ] Every prompt includes objective, references, acceptance criteria, and validation commands
- [ ] No placeholder text remains in generated prompt files
- [ ] Every prompt has concrete prompt lineage entries under `Prompt Blocks Applied`
- [ ] Every prompt includes at least one semantic module and one technology-stack module
- [ ] Profile/discovery/analytics/moderation tasks include intent-specific semantic modules (not only `integration/service-integration`)
- [ ] Index has one row per task with dependency order
- [ ] Index contains explicit semantic and stack prompt block mappings for every task
