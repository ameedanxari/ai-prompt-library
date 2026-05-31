# Modules

## Purpose

Reusable domain-specific prompt modules. The drill-down engine and
audit-and-remediate engine consult
`prompts/orchestrators/module-selection-index.md`
to pick the module set needed for the current expansion context based
on the feature's intents. Each module is a self-contained pattern
document with real code examples for a specific domain.

## How modules get used

1. The engine identifies a feature's primary intent (e.g. "checkout
   workflow", "GPS tracking", "leaderboards"). If the feature spans
   multiple real concerns, it identifies each relevant intent.
2. It looks up those intents in `module-selection-index.md` and picks
   the matching module paths.
3. It loads only those directly relevant modules into the Step 2/3
   expansion context. If the list grows broad, the feature should be
   split rather than loading the catalog.
4. The engine **dissolves** the module's patterns into project-specific
   tasks — real file paths, real function signatures, real acceptance
   criteria. The module filename never appears in the output.

See `prompts/AGENTS.md` for the full engine flow.

## Category tree

| Category | Description |
|---|---|
| [accessibility](./accessibility/README.md) | WCAG compliance, i18n, RTL, regional adaptation, responsive design |
| [ai-native](./ai-native/README.md) | LLM integration, model serving, AI-driven autoscaling |
| [analytics](./analytics/README.md) | Product analytics, A/B tests, cohort analysis, predictive, privacy-preserving |
| [architecture](./architecture/README.md) | Bounded contexts, state ownership, Tier 0 workflows, data-integrity guardrails |
| [best-practices](./best-practices/README.md) | Coding standards |
| [blockchain](./blockchain/README.md) | Smart contracts, wallets, tokens, NFTs, DeFi, governance |
| [commerce](./commerce/README.md) | Catalog, cart, checkout, payments, subscriptions, marketplace |
| [content-management](./content-management/README.md) | CMS authoring, workflow, versioning, moderation, security |
| [cross-platform](./cross-platform/README.md) | Parity matrix, shared contracts, validation across platforms |
| [data-processing](./data-processing/README.md) | Pipelines, ingestion, quality, governance, big data |
| [deployment](./deployment/README.md) | CI/CD, k8s, serverless, cloud, GitOps, IaC, DR, observability |
| [design-research](./design-research/README.md) | Mobbin-style reference research and existing-product style intake |
| [design-system](./design-system/README.md) | Tokens, component patterns, loading states, governance |
| [desktop](./desktop/README.md) | Native OS integrations, offline-first desktop apps |
| [enterprise-saas](./enterprise-saas/README.md) | Multi-tenancy, SSO, RBAC, billing, audit, white-label |
| [feature-patterns](./feature-patterns/README.md) | Auth, RBAC, CRUD, offline, responsive, encryption |
| [fintech](./fintech/README.md) | Accounts, transactions, fraud, lending, budgeting, credit |
| [gamification](./gamification/README.md) | Points, achievements, leaderboards, progression, rewards |
| [healthcare](./healthcare/README.md) | HIPAA, EMR, telemedicine, prescriptions, wearables |
| [integration](./integration/README.md) | API management, event-driven, webhooks, queues, enterprise ESB |
| [iot](./iot/README.md) | Device connectivity, fleet, edge, sensors, automation, security |
| [location-services](./location-services/README.md) | GPS, geofencing, maps, matching, fleet, privacy |
| [media-streaming](./media-streaming/README.md) | CDN, playlists, processing, quality, recommendations |
| [notifications](./notifications/README.md) | Multi-channel, in-app, rich, personalisation, compliance |
| [performance](./performance/README.md) | Caching, APM, resource optimization, scalability |
| [real-time-communication](./real-time-communication/README.md) | WebSocket, presence, live streaming, collaboration |
| [search-discovery](./search-discovery/README.md) | Full-text, faceted, visual, voice, semantic, analytics |
| [security](./security/README.md) | Encryption, MFA, zero-trust, identity federation, privacy |
| [social](./social/README.md) | Profiles, feeds, messaging, moderation, verification, calls |
| [technology-stacks](./technology-stacks/README.md) | React, Swift/Kotlin, Go, Python, Rust, Flutter, Electron, etc. |
| [testing](./testing/README.md) | Test automation, mocks, property-based, chaos, quality metrics |

## Rules

- **Load modules by need.** Multiple modules are allowed when the task
  genuinely spans multiple concerns; a broad module list is a signal to
  split the feature.
- **Modules are dissolved, not referenced.** The template filename,
  placeholder tokens, and `.ai-prompts/prompts/` paths must not appear
  in engine output (enforced by `scripts/validate-instantiation.sh`).
- **If the intent index doesn't match any module**, the engine should
  proceed without one. Do not guess.
