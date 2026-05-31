# Module Selection Index

Deterministic intent → module mapping. The drill-down engine uses this
to pick the modules needed for the current expansion context (Step 2 or
Step 3).

## How to use

1. Identify the epic or feature's intents.
2. Match each relevant intent keyword below to its module path.
3. Load as many matched modules as the current task genuinely needs.
   Prefer the modules with the most domain-specific constraints (e.g.
   `healthcare/hipaa-compliance` beats `security/data-encryption` for a
   patient records feature), but do not discard a second module when it
   carries a separate required concern.
4. If no intent matches, skip module loading — the engine can proceed without
   one.

Paths are relative to the repository root.

## Auth & Identity

| Intent | Module |
|---|---|
| Sign up / sign in with email+password | `prompts/modules/feature-patterns/auth-oauth.md` |
| OAuth / social login / SSO (consumer) | `prompts/modules/feature-patterns/auth-oauth.md` |
| Enterprise SSO (SAML, OIDC) | `prompts/modules/enterprise-saas/sso-integration.md` |
| Identity federation across providers | `prompts/modules/security/identity-federation.md` |
| Role-based permissions | `prompts/modules/feature-patterns/auth-rbac.md` |
| Enterprise RBAC with audit | `prompts/modules/enterprise-saas/rbac-enterprise.md` |
| Advanced authorization (ABAC, policy engines, OPA) | `prompts/modules/security/advanced-authorization.md` |
| Multi-factor / biometric | `prompts/modules/security/multi-factor-auth.md` |
| Adaptive / risk-based authentication | `prompts/modules/security/adaptive-authentication.md` |
| Zero-trust architecture | `prompts/modules/security/zero-trust-architecture.md` |
| Privacy controls (consent, preferences, data-subject rights) | `prompts/modules/security/privacy-controls.md` |

## Data

| Intent | Module |
|---|---|
| CRUD with a database | `prompts/modules/feature-patterns/data-crud.md` |
| Encryption at rest / in transit | `prompts/modules/security/data-encryption.md` |
| Encryption (cross-platform pattern — web/mobile/server, GDPR/HIPAA/SOC2) | `prompts/modules/feature-patterns/security-encryption.md` |
| Data pipelines / ETL | `prompts/modules/data-processing/data-pipelines.md` |
| Data ingestion (streaming + batch sources) | `prompts/modules/data-processing/data-ingestion.md` |
| Data transformation / shaping / enrichment | `prompts/modules/data-processing/data-transformation.md` |
| Data quality (validation, profiling, lineage) | `prompts/modules/data-processing/data-quality.md` |
| Data governance (catalog, policy, compliance) | `prompts/modules/data-processing/data-governance.md` |
| Data security (masking, classification, access) | `prompts/modules/data-processing/data-security.md` |
| Big data / scalable architectures | `prompts/modules/data-processing/scalable-architectures.md` |
| Big data processing (Spark, Flink, etc.) | `prompts/modules/data-processing/big-data-processing.md` |
| Sync across devices | `prompts/modules/integration/data-synchronization.md` |
| Offline-first / local-first | `prompts/modules/feature-patterns/perf-offline.md` |
| Local-only persistence / resumable progress / snapshots | `prompts/modules/feature-patterns/local-persistence-progress.md` |
| Native phone storage cleanup / Photos / MediaStore / scoped storage | `prompts/modules/feature-patterns/native-storage-cleanup.md` |
| Native phone storage cleanup / memory cleanup / free up space OS capability matrix | `prompts/modules/technology-stacks/mobile-os-capability-matrix.md` |

## Architecture & Data Integrity

| Intent | Module |
|---|---|
| Portals / bounded contexts / state ownership / write boundaries / source-of-truth boundaries | `prompts/modules/architecture/bounded-context-state-ownership.md` |
| Tier 0 workflows / zero data loss / RPO/RTO / outbox / ordering / replay / audit fail-closed | `prompts/modules/architecture/tier-zero-data-integrity.md` |

## AI & ML

| Intent | Module |
|---|---|
| LLM integration / chatbot / AI assistant | `prompts/modules/ai-native/llm-integration.md` |
| AI model deployment / serving (server or remote inference) | `prompts/modules/ai-native/model-serving.md` |
| ML-driven autoscaling / workload forecasting | `prompts/modules/ai-native/predictive-scaling.md` |
| On-device ML — iOS (Core ML, Vision, Create ML) | `prompts/modules/ai-native/on-device-ml-ios.md` |
| On-device ML — Android (ML Kit, TensorFlow Lite, MediaPipe) | `prompts/modules/ai-native/on-device-ml-android.md` |
| Blurry photo detection / low-quality image detection on iOS | `prompts/modules/ai-native/on-device-ml-ios.md` |
| Blurry photo detection / low-quality image detection on Android | `prompts/modules/ai-native/on-device-ml-android.md` |
| Near-duplicate photo detection / visual similarity on iOS | `prompts/modules/ai-native/on-device-ml-ios.md` |
| Near-duplicate photo detection / visual similarity on Android | `prompts/modules/ai-native/on-device-ml-android.md` |
| Sensitive document detection / OCR classification on iOS | `prompts/modules/ai-native/on-device-ml-ios.md` |
| Sensitive document detection / OCR classification on Android | `prompts/modules/ai-native/on-device-ml-android.md` |
| Duplicate video detection / video fingerprinting on iOS | `prompts/modules/ai-native/on-device-ml-ios.md` |
| Duplicate video detection / video fingerprinting on Android | `prompts/modules/ai-native/on-device-ml-android.md` |
| Local-only media AI for gallery cleanup | `prompts/modules/feature-patterns/native-storage-cleanup.md` |

If the brief mentions privacy, local-only processing, no network, device
AI/ML, phone media, or on-device inference, prefer the on-device modules
above over model serving. Use model serving only when the feature
explicitly needs server-side or remote inference infrastructure.

## Mobile UX Patterns

| Intent | Module |
|---|---|
| Swipe / gesture-based card UI (tinder-style, card stack) | `prompts/modules/feature-patterns/gesture-card-ui.md` |
| Haptic feedback / tactile interactions | `prompts/modules/feature-patterns/haptic-feedback.md` |

## Commerce

| Intent | Module |
|---|---|
| Product catalog / inventory | `prompts/modules/commerce/product-catalog.md` |
| Product search (within a catalog) | `prompts/modules/commerce/product-search.md` |
| Product reviews / ratings / Q&A | `prompts/modules/commerce/product-reviews.md` |
| Inventory management (stock, warehousing, thresholds) | `prompts/modules/commerce/inventory-management.md` |
| Shopping cart | `prompts/modules/commerce/shopping-cart.md` |
| Checkout | `prompts/modules/commerce/checkout-workflow.md` |
| Payments (cards, etc.) | `prompts/modules/commerce/payment-processing.md` |
| Payment methods (Apple Pay, Google Pay, alternative) | `prompts/modules/commerce/payment-methods.md` |
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
| User content creation (posts, photos, stories) | `prompts/modules/social/content-creation.md` |
| Likes / comments / reactions / engagement | `prompts/modules/social/engagement-features.md` |
| People discovery / follow suggestions | `prompts/modules/social/social-discovery.md` |
| Identity verification (blue-check, authenticity) | `prompts/modules/social/user-verification.md` |
| Real-time messaging / chat | `prompts/modules/social/real-time-messaging.md` |
| E2E message encryption | `prompts/modules/social/message-encryption.md` |
| Voice / video calls (WebRTC) | `prompts/modules/social/voice-video-calls.md` |
| Social content moderation | `prompts/modules/social/content-moderation.md` |
| DM / communication moderation | `prompts/modules/social/communication-moderation.md` |
| Generic content moderation (non-social apps) | `prompts/modules/content-management/content-moderation.md` |

## Real-time

| Intent | Module |
|---|---|
| WebSocket infrastructure | `prompts/modules/real-time-communication/websocket-management.md` |
| Presence / online status | `prompts/modules/real-time-communication/presence-systems.md` |
| Live streaming | `prompts/modules/real-time-communication/live-streaming.md` |
| Live events (virtual events, webinars) | `prompts/modules/real-time-communication/live-events.md` |
| Video / voice conferencing | `prompts/modules/real-time-communication/video-conferencing.md` |
| Real-time collaboration (CRDT, cursors, presence editing) | `prompts/modules/real-time-communication/real-time-collaboration.md` |
| Real-time sync (multi-device state sync) | `prompts/modules/real-time-communication/real-time-sync.md` |
| Streaming analytics on real-time data | `prompts/modules/real-time-communication/streaming-analytics.md` |
| Message queuing / pub-sub (app layer) | `prompts/modules/real-time-communication/message-queuing.md` |

## Notifications

| Intent | Module |
|---|---|
| Multi-channel (email/push/SMS) | `prompts/modules/notifications/notification-channels.md` |
| In-app notifications | `prompts/modules/notifications/real-time-notifications.md` |
| Rich notifications (images, actions, deep links) | `prompts/modules/notifications/rich-notifications.md` |
| Personalisation / targeting / segmentation | `prompts/modules/notifications/notification-personalization.md` |
| Compliance (opt-in, CAN-SPAM, GDPR) | `prompts/modules/notifications/notification-compliance.md` |
| Notification analytics (delivery, open, CTR) | `prompts/modules/notifications/notification-analytics.md` |
| Automated comms / drip campaigns | `prompts/modules/notifications/communication-automation.md` |
| Enterprise comms (internal, escalations) | `prompts/modules/notifications/enterprise-communications.md` |

## Search & Discovery

| Intent | Module |
|---|---|
| Full-text search | `prompts/modules/search-discovery/full-text-search.md` |
| Faceted search / filters | `prompts/modules/search-discovery/faceted-search.md` |
| Search personalisation (ranking per user) | `prompts/modules/search-discovery/search-personalization.md` |
| Voice search | `prompts/modules/search-discovery/voice-search.md` |
| Visual / image search | `prompts/modules/search-discovery/visual-search.md` |
| Search analytics (queries, CTR, zero-results) | `prompts/modules/search-discovery/search-analytics.md` |
| Recommendations | `prompts/modules/search-discovery/recommendation-systems.md` |
| Semantic / vector search | `prompts/modules/search-discovery/semantic-search.md` |

## Location

| Intent | Module |
|---|---|
| GPS tracking | `prompts/modules/location-services/gps-tracking.md` |
| Geofencing | `prompts/modules/location-services/geofencing.md` |
| Matching (Uber-style) | `prompts/modules/location-services/service-matching.md` |
| Booking management (slots, scheduling) | `prompts/modules/location-services/booking-management.md` |
| Fleet management (vehicles, routing, dispatch) | `prompts/modules/location-services/fleet-management.md` |
| Dynamic pricing | `prompts/modules/location-services/dynamic-pricing.md` |
| Maps | `prompts/modules/location-services/map-integration.md` |
| Location privacy (consent, anonymisation) | `prompts/modules/location-services/location-privacy.md` |

## Media

| Intent | Module |
|---|---|
| CDN / streaming delivery | `prompts/modules/media-streaming/cdn-integration.md` |
| Playlists / libraries | `prompts/modules/media-streaming/playlist-management.md` |
| Offline media sync | `prompts/modules/media-streaming/offline-sync.md` |
| Media search within a catalog | `prompts/modules/media-streaming/content-search.md` |
| Media processing (transcode, thumbnails, waveforms) | `prompts/modules/media-streaming/media-processing.md` |
| Photo near-duplicates / duplicate videos in local device gallery | `prompts/modules/feature-patterns/native-storage-cleanup.md` |
| Streaming quality (ABR, bitrate, DRM) | `prompts/modules/media-streaming/streaming-quality.md` |
| Recommendation engine (collaborative filtering) | `prompts/modules/media-streaming/recommendation-engine.md` |
| Artist / creator tools (uploads, analytics, payouts) | `prompts/modules/media-streaming/artist-creator-tools.md` |

## Gamification

| Intent | Module |
|---|---|
| Points system (earn, spend, balance, anti-fraud) | `prompts/modules/gamification/point-systems.md` |
| Achievements / badges / unlocks | `prompts/modules/gamification/achievement-systems.md` |
| Leaderboards | `prompts/modules/gamification/leaderboards.md` |
| Progression / levels / XP | `prompts/modules/gamification/progression-systems.md` |
| Rewards (digital + real-world) | `prompts/modules/gamification/reward-systems.md` |
| Streaks / daily challenges | `prompts/modules/gamification/streak-tracking.md` |
| Social challenges / competitive play | `prompts/modules/gamification/social-challenges.md` |
| Engagement psychology (retention, flow, loops) | `prompts/modules/gamification/engagement-psychology.md` |

## IoT

| Intent | Module |
|---|---|
| Device discovery + pairing + connectivity | `prompts/modules/iot/device-connectivity.md` |
| Device fleet management + lifecycle | `prompts/modules/iot/device-management.md` |
| Edge computing / local-first IoT processing | `prompts/modules/iot/edge-computing.md` |
| Sensor data ingestion + processing | `prompts/modules/iot/sensor-data-processing.md` |
| IoT analytics (real-time + predictive maintenance) | `prompts/modules/iot/iot-analytics.md` |
| IoT automation / rules engine | `prompts/modules/iot/iot-automation.md` |
| IoT security (device identity, secure provisioning) | `prompts/modules/iot/iot-security.md` |
| Industrial IoT / SCADA / OT integration | `prompts/modules/iot/industrial-iot.md` |

## Blockchain / Web3

| Intent | Module |
|---|---|
| Smart contracts (Solidity, deployment, lifecycle) | `prompts/modules/blockchain/smart-contracts.md` |
| Wallet integration (MetaMask, WalletConnect) | `prompts/modules/blockchain/wallet-integration.md` |
| Token management (ERC-20, minting, transfers) | `prompts/modules/blockchain/token-management.md` |
| NFTs (ERC-721/1155, marketplaces, royalties) | `prompts/modules/blockchain/nft-functionality.md` |
| DeFi protocols (lending, AMM, staking) | `prompts/modules/blockchain/defi-protocols.md` |
| On-chain governance / DAO voting | `prompts/modules/blockchain/governance-systems.md` |
| Cross-chain bridges + multi-chain apps | `prompts/modules/blockchain/cross-chain.md` |
| Enterprise blockchain (permissioned, consortium) | `prompts/modules/blockchain/enterprise-blockchain.md` |

## Fintech

| Intent | Module |
|---|---|
| Accounts / balances / ledger | `prompts/modules/fintech/account-management.md` |
| Transactions | `prompts/modules/fintech/transaction-processing.md` |
| Fraud detection | `prompts/modules/fintech/fraud-detection.md` |
| Compliance reporting | `prompts/modules/fintech/financial-reporting.md` |
| Investments | `prompts/modules/fintech/investment-management.md` |
| Budgeting / personal finance | `prompts/modules/fintech/budgeting-tools.md` |
| Credit scoring | `prompts/modules/fintech/credit-scoring.md` |
| Lending platform | `prompts/modules/fintech/lending-platform.md` |

## Healthcare

| Intent | Module |
|---|---|
| HIPAA scope | `prompts/modules/healthcare/hipaa-compliance.md` |
| UK healthcare / NHS / DTAC / DSPT / CQC / DCB0129 / DCB0160 / UK GDPR | `prompts/modules/healthcare/uk-regulated-healthcare.md` |
| Medical cannabis / CBPM / controlled drug / Schedule 2 or 3 / CD Register / FP10CD / pharmacy governance | `prompts/modules/healthcare/controlled-drugs-uk.md` |
| Clinical safety / SaMD / DCB0129 / DCB0160 / DecisionTrace / human approval for AI or automation | `prompts/modules/healthcare/clinical-safety-dcb0129.md` |
| Patient records | `prompts/modules/healthcare/patient-data-management.md` |
| Electronic medical records (EMR/EHR) | `prompts/modules/healthcare/medical-records.md` |
| Telemedicine | `prompts/modules/healthcare/telemedicine.md` |
| Appointment scheduling | `prompts/modules/healthcare/appointment-scheduling.md` |
| Prescriptions | `prompts/modules/healthcare/prescription-management.md` |
| Wearable / device integration (Apple Health, Fitbit) | `prompts/modules/healthcare/wearable-integration.md` |
| Healthcare-specific security controls | `prompts/modules/healthcare/healthcare-security.md` |

## Enterprise SaaS

| Intent | Module |
|---|---|
| Multi-tenant isolation | `prompts/modules/enterprise-saas/multi-tenancy.md` |
| Billing / metering | `prompts/modules/enterprise-saas/enterprise-billing.md` |
| Audit trails | `prompts/modules/enterprise-saas/audit-trails.md` |
| Admin workflows | `prompts/modules/enterprise-saas/workflow-automation.md` |
| Enterprise API gateway (rate limit, dev portal, webhooks) | `prompts/modules/enterprise-saas/api-management.md` |
| White-labelling / per-tenant branding | `prompts/modules/enterprise-saas/white-labeling.md` |

## Analytics

| Intent | Module |
|---|---|
| Product analytics / events | `prompts/modules/analytics/user-analytics.md` |
| A/B testing | `prompts/modules/analytics/ab-testing.md` |
| Real-time dashboards | `prompts/modules/analytics/real-time-analytics.md` |
| Business metrics (KPIs, OKRs, finance) | `prompts/modules/analytics/business-metrics.md` |
| Cohort analysis / retention | `prompts/modules/analytics/cohort-analysis.md` |
| Custom reporting / scheduled exports | `prompts/modules/analytics/custom-reporting.md` |
| Predictive analytics (forecasting, churn) | `prompts/modules/analytics/predictive-analytics.md` |
| Privacy-preserving analytics (DP, aggregation) | `prompts/modules/analytics/privacy-analytics.md` |

## Design Research & UI Planning

| Intent | Module |
|---|---|
| Mobbin / product reference research / UI inspiration / app pattern research | `prompts/modules/design-research/mobbin-reference-intake.md` |
| UI reference source map / greenfield design context / design research schema | `prompts/modules/design-research/ui-reference-source-map.md` |
| Existing product UI extension / follow existing theme / preserve current styling / no redesign | `prompts/modules/design-research/mobbin-reference-intake.md` |
| Dashboard / admin dashboard / reporting dashboard / analytics console / operational panel | `prompts/modules/design-system/dashboard-screen-patterns.md` |
| Graph / chart / data visualization / data table with charts / KPI reporting | `prompts/modules/design-system/data-visualization-system.md` |
| Mobile app screen / app flow / screen-level UI / web app screen / frontend screen | `prompts/modules/design-research/mobbin-reference-intake.md` |
| Liquid glass / glassmorphism / native material surfaces / aesthetic animations | `prompts/modules/design-system/native-visual-effects-and-motion.md` |

## Performance

| Intent | Module |
|---|---|
| Caching (in-memory, distributed, CDN, invalidation) | `prompts/modules/performance/caching-strategies.md` |
| Application performance monitoring (APM) | `prompts/modules/performance/performance-monitoring.md` |
| Resource optimization (memory, CPU, storage, network) | `prompts/modules/performance/resource-optimization.md` |
| Horizontal scaling / load balancing / sharding | `prompts/modules/performance/scalability-patterns.md` |

## Ops / Platform

| Intent | Module |
|---|---|
| CI/CD | `prompts/modules/deployment/ci-cd-pipelines.md` |
| Containerization | `prompts/modules/deployment/containerization.md` |
| Kubernetes orchestration | `prompts/modules/deployment/kubernetes-orchestration.md` |
| Serverless at scale (Lambda, Cloud Run) | `prompts/modules/deployment/serverless-orchestration-scale.md` |
| Cloud hosting | `prompts/modules/deployment/cloud-deployment.md` |
| Google Cloud / GCP / Cloud Run / Cloud SQL / Spanner / Pub/Sub / VPC-SC / CMEK / Cloud Armor | `prompts/modules/technology-stacks/cloud-gcp.md` |
| Regulated cloud landing zone / project segmentation / data residency / non-prod synthetic data / privileged access | `prompts/modules/deployment/regulated-cloud-landing-zone.md` |
| Immutable audit evidence / WORM / locked logs / hash chains / evidence export / chain of custody | `prompts/modules/security/audit-evidence-worm.md` |
| Multi-cloud deployment strategies | `prompts/modules/deployment/multi-cloud-deployment-strategies.md` |
| Edge computing deployment (CDN workers, POPs) | `prompts/modules/deployment/edge-computing-deployment.md` |
| Zero-trust deployment architecture | `prompts/modules/deployment/zero-trust-deployment-architectures.md` |
| IaC evolution (Terraform → Pulumi → CDK patterns) | `prompts/modules/deployment/infrastructure-as-code-evolution.md` |
| GitOps advanced workflows (ArgoCD, Flux) | `prompts/modules/deployment/gitops-advanced-workflows.md` |
| Enterprise deployment (change windows, approvals) | `prompts/modules/deployment/enterprise-deployment.md` |
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
| Native mobile screenshot capture / app-store screenshots | `prompts/modules/testing/mobile-screenshot-ui-testing.md` |
| Mobile app store submission (iOS) | `prompts/modules/technology-stacks/ios-deployment-distribution.md` |
| Mobile app store submission (Android) | `prompts/modules/technology-stacks/kotlin-android-development.md` |
| Beta / TestFlight / internal testing | `prompts/modules/testing/test-automation.md` |
| iOS simulator / xcodebuild crash recovery (planning of test tasks) | `prompts/modules/harness-recovery/ios.md` |
| Android emulator / gradle daemon crash recovery | `prompts/modules/harness-recovery/android.md` |
| Web (Vitest / Jest / Playwright / Node) test harness crashes | `prompts/modules/harness-recovery/web.md` |
| Flutter test harness crash recovery | `prompts/modules/harness-recovery/flutter.md` |
| Bash / shell script crash recovery | `prompts/modules/harness-recovery/bash.md` |
| Documentation / runbook readiness | `prompts/modules/best-practices/coding-standards.md` |
| Compliance readiness (GDPR, HIPAA, PCI) | pick from the domain sections above (`healthcare/hipaa-compliance.md`, `commerce/payment-security.md`, `security/data-encryption.md`) |

## Design System (UI)

| Intent | Module |
|---|---|
| Design tokens (architecture) | `prompts/modules/design-system/token-architecture.md` |
| Design tokens (generation pipeline — single source of truth across platforms) | `prompts/modules/design-system/token-generation-pipeline.md` |
| Component system | `prompts/modules/design-system/component-system.md` |
| Component implementation pattern (from tokens, no hardcoded styles) | `prompts/modules/design-system/component-implementation-pattern.md` |
| Design system HTML review artifact / style guide preview / component catalog review / user design feedback | `prompts/modules/design-system/design-system-review-artifact.md` |
| Loading states / skeletons / motion tokens | `prompts/modules/design-system/loading-states-and-animations.md` |
| Design-to-code validation | `prompts/modules/design-system/design-to-code-validation.md` |
| Design system governance / ownership / change control | `prompts/modules/design-system/governance-and-maintenance.md` |
| Screen fidelity / visual QA / reference source map | `prompts/modules/design-system/screen-fidelity-audit.md` |
| Design-system-first implementation sequencing | `prompts/modules/design-system/component-implementation-sequencing.md` |
| Dashboard shell / KPI cards / filters / tables | `prompts/modules/design-system/dashboard-screen-patterns.md` |
| Chart system / graph states / visualization accessibility | `prompts/modules/design-system/data-visualization-system.md` |
| Native visual effects / liquid glass / material motion / reduced-motion fallback | `prompts/modules/design-system/native-visual-effects-and-motion.md` |

## Cross-platform parity (web + mobile)

| Intent | Module |
|---|---|
| Capability / feature-parity matrix across platforms | `prompts/modules/cross-platform/parity-matrix.md` |
| Shared API contracts + data models across platforms | `prompts/modules/cross-platform/shared-contracts.md` |
| Tests validating functional equivalence across platforms | `prompts/modules/cross-platform/parity-validation-tests.md` |
| Parity documentation for team visibility | `prompts/modules/cross-platform/parity-documentation.md` |
| Per-feature parity verification tasks | `prompts/modules/cross-platform/parity-verification-tasks.md` |
| Dry-run parity check (structural only, no full gen) | `prompts/modules/cross-platform/parity-dry-run.md` |

## Accessibility & Internationalization

| Intent | Module |
|---|---|
| WCAG compliance / screen-reader / keyboard nav | `prompts/modules/accessibility/accessibility-compliance.md` |
| i18n / translation / RTL / locale formatting | `prompts/modules/accessibility/internationalization.md` |
| Regional customization / cultural adaptation | `prompts/modules/accessibility/cultural-adaptation.md` |
| Advanced responsive design (fluid type, container queries) | `prompts/modules/accessibility/responsive-design-advanced.md` |
| Responsive UI pattern (mobile-first, cross-device, a11y) | `prompts/modules/feature-patterns/ui-responsive.md` |

## Integration & APIs

| Intent | Module |
|---|---|
| API management (versioning, keys, throttling) | `prompts/modules/integration/api-management.md` |
| Service integration (between internal services) | `prompts/modules/integration/service-integration.md` |
| Event-driven architecture (event bus, CQRS) | `prompts/modules/integration/event-driven-architecture.md` |
| Message queues (Kafka, RabbitMQ, SQS, pub-sub) | `prompts/modules/integration/message-queues.md` |
| Webhook systems (incoming + outgoing) | `prompts/modules/integration/webhook-systems.md` |
| Enterprise integration (ESB, iPaaS, legacy SOAP) | `prompts/modules/integration/enterprise-integration.md` |
| Integration monitoring (delivery, retries, DLQ) | `prompts/modules/integration/integration-monitoring.md` |

## Content Management

| Intent | Module |
|---|---|
| Content creation (CMS authoring, rich text, media) | `prompts/modules/content-management/content-creation.md` |
| Content organisation (taxonomies, tags, collections) | `prompts/modules/content-management/content-organization.md` |
| Content workflow (draft → review → publish) | `prompts/modules/content-management/content-workflow.md` |
| Content versioning / history / rollback | `prompts/modules/content-management/content-versioning.md` |
| Content moderation (generic) | `prompts/modules/content-management/content-moderation.md` |
| Content security (DRM, access control) | `prompts/modules/content-management/content-security.md` |
| Content compliance (GDPR, takedowns) | `prompts/modules/content-management/content-compliance.md` |
| Content analytics (performance, engagement) | `prompts/modules/content-management/content-analytics.md` |

## Technology Stacks (pick when the project uses / targets this stack)

### Web

| Intent | Module |
|---|---|
| React web app | `prompts/modules/technology-stacks/web-react.md` |
| Tailwind CSS / Tailwind theme / Tailwind UI implementation | `prompts/modules/technology-stacks/tailwind-css.md` |
| Progressive Web App (installable, offline) | `prompts/modules/technology-stacks/progressive-web-apps.md` |
| WebAssembly (perf-critical web features) | `prompts/modules/technology-stacks/webassembly.md` |

### Mobile

| Intent | Module |
|---|---|
| Native iOS (Swift / SwiftUI) | `prompts/modules/technology-stacks/swift-ios-development.md` |
| iOS UI / UX patterns | `prompts/modules/technology-stacks/ios-ui-ux-patterns.md` |
| iOS performance optimisation | `prompts/modules/technology-stacks/ios-performance-optimization.md` |
| iOS testing (XCTest, XCUITest) | `prompts/modules/technology-stacks/ios-testing-comprehensive.md` |
| iOS deployment / App Store | `prompts/modules/technology-stacks/ios-deployment-distribution.md` |
| Native Android (Kotlin / Jetpack Compose) | `prompts/modules/technology-stacks/kotlin-android-development.md` |
| Cross-platform React Native | `prompts/modules/technology-stacks/mobile-react-native.md` |
| Cross-platform Flutter | `prompts/modules/technology-stacks/mobile-flutter.md` |
| Mobile OS capability matrix / OS permissions / unsupported native capability / memory cleanup constraints | `prompts/modules/technology-stacks/mobile-os-capability-matrix.md` |

### Backend

| Intent | Module |
|---|---|
| Node.js / TypeScript backend (use per-intent modules above — no dedicated Node module) | — |
| Go microservices | `prompts/modules/technology-stacks/go-microservices.md` |
| Java Spring Boot | `prompts/modules/technology-stacks/java-spring-boot.md` |
| Python ecosystem (Django / FastAPI / Flask) | `prompts/modules/technology-stacks/python-ecosystem.md` |
| Ruby on Rails | `prompts/modules/technology-stacks/ruby-on-rails.md` |
| PHP ecosystem (Laravel, Symfony) | `prompts/modules/technology-stacks/php-ecosystem.md` |
| .NET ecosystem (C#, ASP.NET Core) | `prompts/modules/technology-stacks/dotnet-ecosystem.md` |
| Elixir / Phoenix web | `prompts/modules/technology-stacks/elixir-phoenix-web.md` |
| Scala functional programming | `prompts/modules/technology-stacks/scala-functional-programming.md` |
| Rust systems programming (high-perf services, CLI) | `prompts/modules/technology-stacks/rust-systems-programming.md` |
| C++ high-performance | `prompts/modules/technology-stacks/cpp-high-performance.md` |

### BaaS / Cloud

| Intent | Module |
|---|---|
| Firebase backend-as-a-service | `prompts/modules/technology-stacks/backend-firebase.md` |
| AWS cloud (EC2, ECS, RDS, S3, Lambda) | `prompts/modules/technology-stacks/cloud-aws.md` |
| Google Cloud Platform / GCP (Cloud Run, Cloud SQL, Pub/Sub, Cloud Storage, BigQuery, VPC-SC, CMEK) | `prompts/modules/technology-stacks/cloud-gcp.md` |

### Desktop / specialised hardware

| Intent | Module |
|---|---|
| Electron desktop app | `prompts/modules/technology-stacks/electron-desktop.md` |
| Tauri desktop app (lightweight alternative to Electron) | `prompts/modules/technology-stacks/tauri-desktop.md` |
| Apple CarPlay integration | `prompts/modules/technology-stacks/apple-carplay.md` |
| Android Auto integration | `prompts/modules/technology-stacks/android-auto.md` |

## Desktop Apps

| Intent | Module |
|---|---|
| Native OS integrations (system APIs, protocol handlers) | `prompts/modules/desktop/native-integrations.md` |
| Desktop offline-first with sync + conflict resolution | `prompts/modules/desktop/offline-first.md` |

## Testing

| Intent | Module |
|---|---|
| Test automation strategy | `prompts/modules/testing/test-automation.md` |
| Native mobile UI screenshot testing (iOS XCUITest / Android instrumentation) | `prompts/modules/testing/mobile-screenshot-ui-testing.md` |
| Property-based tests | `prompts/modules/testing/property-based-testing.md` |
| Centralized mock data | `prompts/modules/testing/centralized-mock-data.md` |
| Fake backend generator (local API doubles) | `prompts/modules/testing/fake-backend-generator.md` |
| Mock consolidation / DRY test fixtures | `prompts/modules/testing/mock-consolidation.md` |
| Mock validation (drift between real + mock) | `prompts/modules/testing/mock-validation.md` |
| Test data management (factories, fixtures, seeding) | `prompts/modules/testing/test-data-management.md` |
| Test management (plans, reports, traceability) | `prompts/modules/testing/test-management.md` |
| Cross-browser testing | `prompts/modules/testing/cross-browser-testing.md` |
| Domain-specific testing patterns | `prompts/modules/testing/domain-testing.md` |
| CI/CD testing (pipeline-integrated tests) | `prompts/modules/testing/ci-cd-testing.md` |
| Debug-menu integration (dev toggles in app) | `prompts/modules/testing/debug-menu-integration.md` |
| Quality metrics (coverage, flake rate, MTTR) | `prompts/modules/testing/quality-metrics.md` |

## Rules

- **Load modules by need.** If two or more intents apply to the current
  expansion, load the corresponding modules. If the module set grows because
  the feature is too broad, split the feature into smaller features/tasks.
- **If uncertain, skip module loading** rather than guessing. The engine can
  produce tasks from the epic/feature block alone.
- **A path listed here might not exist on disk** for edge cases. If the
  path resolves to a missing file, skip the module — do not substitute a
  different module from the catalog.
