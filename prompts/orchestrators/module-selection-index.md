# Module Selection Index

Deterministic intent → single module mapping. The drill-down engine uses this
to pick exactly one module per expansion context (Step 2 or Step 3).

## How to use

1. Identify the epic or feature's primary intent.
2. Match the intent keyword below to **one** module path.
3. If multiple intents apply, pick the one that carries the most
   domain-specific constraints (e.g. `healthcare/hipaa-compliance` beats
   `security/data-encryption` for a patient records feature).
4. If no intent matches, skip module loading — the engine can proceed without
   one.

Paths are relative to the repository root.

## Auth & Identity

| Intent | Module |
|---|---|
| Sign up / sign in with email+password | `prompts/modules/feature-patterns/auth-oauth.md` |
| OAuth / social login / SSO (consumer) | `prompts/modules/feature-patterns/auth-oauth.md` |
| Enterprise SSO (SAML, OIDC) | `prompts/modules/enterprise-saas/sso-integration.md` |
| Role-based permissions | `prompts/modules/feature-patterns/auth-rbac.md` |
| Enterprise RBAC with audit | `prompts/modules/enterprise-saas/rbac-enterprise.md` |
| Multi-factor / biometric | `prompts/modules/security/multi-factor-auth.md` |

## Data

| Intent | Module |
|---|---|
| CRUD with a database | `prompts/modules/feature-patterns/data-crud.md` |
| Encryption at rest / in transit | `prompts/modules/security/data-encryption.md` |
| Data pipelines / ETL | `prompts/modules/data-processing/data-pipelines.md` |
| Sync across devices | `prompts/modules/integration/data-synchronization.md` |
| Offline-first / local-first | `prompts/modules/feature-patterns/perf-offline.md` |

## Commerce

| Intent | Module |
|---|---|
| Product catalog / inventory | `prompts/modules/commerce/product-catalog.md` |
| Shopping cart | `prompts/modules/commerce/shopping-cart.md` |
| Checkout | `prompts/modules/commerce/checkout-workflow.md` |
| Payments (cards, etc.) | `prompts/modules/commerce/payment-processing.md` |
| Subscriptions / recurring | `prompts/modules/commerce/payment-subscriptions.md` |
| PCI compliance | `prompts/modules/commerce/payment-security.md` |
| Orders & fulfillment | `prompts/modules/commerce/order-management.md` |
| Marketplace (multi-seller) | `prompts/modules/commerce/marketplace-features.md` |

## Social & Community

| Intent | Module |
|---|---|
| User profiles | `prompts/modules/social/user-profiles.md` |
| Follow / friend graphs | `prompts/modules/social/social-graphs.md` |
| Feeds / timelines | `prompts/modules/social/content-feeds.md` |
| Real-time messaging / chat | `prompts/modules/social/real-time-messaging.md` |
| Moderation / reporting | `prompts/modules/content-management/content-moderation.md` |

## Real-time

| Intent | Module |
|---|---|
| WebSocket infrastructure | `prompts/modules/real-time-communication/websocket-management.md` |
| Presence / online status | `prompts/modules/real-time-communication/presence-systems.md` |
| Live streaming | `prompts/modules/real-time-communication/live-streaming.md` |
| Video / voice conferencing | `prompts/modules/real-time-communication/video-conferencing.md` |

## Notifications

| Intent | Module |
|---|---|
| Multi-channel (email/push/SMS) | `prompts/modules/notifications/notification-channels.md` |
| In-app notifications | `prompts/modules/notifications/real-time-notifications.md` |

## Search & Discovery

| Intent | Module |
|---|---|
| Full-text search | `prompts/modules/search-discovery/full-text-search.md` |
| Recommendations | `prompts/modules/search-discovery/recommendation-systems.md` |
| Semantic / vector search | `prompts/modules/search-discovery/semantic-search.md` |

## Location

| Intent | Module |
|---|---|
| GPS tracking | `prompts/modules/location-services/gps-tracking.md` |
| Geofencing | `prompts/modules/location-services/geofencing.md` |
| Matching (Uber-style) | `prompts/modules/location-services/service-matching.md` |
| Dynamic pricing | `prompts/modules/location-services/dynamic-pricing.md` |
| Maps | `prompts/modules/location-services/map-integration.md` |

## Media

| Intent | Module |
|---|---|
| CDN / streaming delivery | `prompts/modules/media-streaming/cdn-integration.md` |
| Playlists / libraries | `prompts/modules/media-streaming/playlist-management.md` |
| Offline media sync | `prompts/modules/media-streaming/offline-sync.md` |

## Fintech

| Intent | Module |
|---|---|
| Accounts / balances / ledger | `prompts/modules/fintech/account-management.md` |
| Transactions | `prompts/modules/fintech/transaction-processing.md` |
| Fraud detection | `prompts/modules/fintech/fraud-detection.md` |
| Compliance reporting | `prompts/modules/fintech/financial-reporting.md` |
| Investments | `prompts/modules/fintech/investment-management.md` |

## Healthcare

| Intent | Module |
|---|---|
| HIPAA scope | `prompts/modules/healthcare/hipaa-compliance.md` |
| Patient records | `prompts/modules/healthcare/patient-data-management.md` |
| Telemedicine | `prompts/modules/healthcare/telemedicine.md` |
| Appointment scheduling | `prompts/modules/healthcare/appointment-scheduling.md` |
| Prescriptions | `prompts/modules/healthcare/prescription-management.md` |

## Enterprise SaaS

| Intent | Module |
|---|---|
| Multi-tenant isolation | `prompts/modules/enterprise-saas/multi-tenancy.md` |
| Billing / metering | `prompts/modules/enterprise-saas/enterprise-billing.md` |
| Audit trails | `prompts/modules/enterprise-saas/audit-trails.md` |
| Admin workflows | `prompts/modules/enterprise-saas/workflow-automation.md` |

## Analytics

| Intent | Module |
|---|---|
| Product analytics / events | `prompts/modules/analytics/user-analytics.md` |
| A/B testing | `prompts/modules/analytics/ab-testing.md` |
| Real-time dashboards | `prompts/modules/analytics/real-time-analytics.md` |

## Ops / Platform

| Intent | Module |
|---|---|
| CI/CD | `prompts/modules/deployment/ci-cd-pipelines.md` |
| Containerization | `prompts/modules/deployment/containerization.md` |
| Cloud hosting | `prompts/modules/deployment/cloud-deployment.md` |
| Observability | `prompts/modules/deployment/monitoring-observability.md` |
| Disaster recovery | `prompts/modules/deployment/disaster-recovery.md` |

## Ops / Readiness (gap-closure / productionize)

For `audit-and-remediate.md` Step 3 when the gap is about taking an
existing codebase to production. Pick whichever is most specific to the gap.

| Intent | Module |
|---|---|
| Production deployment readiness (secrets, envs, DNS, SSL) | `prompts/modules/deployment/environment-management.md` |
| CI/CD pipeline (build → test → deploy) | `prompts/modules/deployment/ci-cd-pipelines.md` |
| Container orchestration (k8s, ECS, Fargate) | `prompts/modules/deployment/kubernetes-deployment.md` |
| Blue/green, canary, feature flags | `prompts/modules/deployment/modern-deployment-patterns.md` |
| Observability (logs + metrics + traces + alerts) | `prompts/modules/deployment/monitoring-observability.md` |
| Disaster recovery / backups / RPO/RTO | `prompts/modules/deployment/disaster-recovery.md` |
| Zero-downtime migrations / rollback | `prompts/modules/deployment/modern-deployment-patterns.md` |
| Security audit / vulnerability scan | `prompts/modules/security/threat-detection.md` |
| Penetration testing scope | `prompts/modules/testing/security-testing.md` |
| Load / performance testing | `prompts/modules/testing/performance-testing.md` |
| Chaos engineering | `prompts/modules/testing/chaos-engineering.md` |
| Integration test coverage (backend API) | `prompts/modules/testing/test-automation.md` |
| Accessibility audit (WCAG) | `prompts/modules/testing/accessibility-testing.md` |
| Mobile app store submission (iOS) | `prompts/modules/technology-stacks/ios-deployment-distribution.md` |
| Mobile app store submission (Android) | `prompts/modules/technology-stacks/kotlin-android-development.md` |
| Beta / TestFlight / internal testing | `prompts/modules/testing/test-automation.md` |
| Documentation / runbook readiness | `prompts/modules/best-practices/coding-standards.md` |
| Compliance readiness (GDPR, HIPAA, PCI) | pick from the domain sections above (`healthcare/hipaa-compliance.md`, `commerce/payment-security.md`, `security/data-encryption.md`) |

## Design System (UI)

| Intent | Module |
|---|---|
| Design tokens | `prompts/modules/design-system/token-architecture.md` |
| Component system | `prompts/modules/design-system/component-system.md` |
| Design-to-code validation | `prompts/modules/design-system/design-to-code-validation.md` |

## Testing

| Intent | Module |
|---|---|
| Test automation strategy | `prompts/modules/testing/test-automation.md` |
| Property-based tests | `prompts/modules/testing/property-based-testing.md` |
| Centralized mock data | `prompts/modules/testing/centralized-mock-data.md` |

## Rules

- **Never load more than one module in a single expansion context.** If two
  intents apply, split the feature into two features, one per intent.
- **If uncertain, skip module loading** rather than guessing. The engine can
  produce tasks from the epic/feature block alone.
- **A path listed here might not exist on disk** for edge cases. If the
  path resolves to a missing file, skip the module — do not substitute a
  different module from the catalog.
