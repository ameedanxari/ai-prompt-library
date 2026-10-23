# Module Selection Index

Select modules for a bounded active outcome slice, not an all-project feature expansion. First identify the real consumer, target and applicable risks; then match relevant intent below. Prefer specific domain constraints and load only necessary core/detail files. Missing modules or uncertain applicability remain explicit; never fabricate their contents.

Modules contribute requirements/checks and implementation guidance, not authority to invent platforms or features. Dissolve applicable guidance into project-specific units. Units can cohesively span runtime, test, config, docs and assets across necessary files. Split only at meaningful outcome, dependency, authority or risk boundaries; preserve path ownership without per-file tickets.

Use `.ai-prompts/prompts/orchestrators/baseline-task-shapes.md` for applicability and `.ai-prompts/prompts/orchestrators/rolling-delivery.md` for budgets, real-target evidence and acceptance. Review design/content/integration/recovery in the proof, rather than deferring presentation to global polish. Bytes are not charged-token estimates; record observed usage only.

## Artifact expertise before domain lookup

Identify each affected artifact's real role, consumer and evidence before choosing modules; artifact kinds do not force separate units.

| Artifact | Appropriate guidance/evidence |
| --- | --- |
| Policy, privacy inventory, terms | `docs`: substantive assertions, authoritative facts, intended-reader render/review |
| App Store / Play listing copy | `docs`/`asset`: actual identity, accurate content and declared distribution scope |
| Store-console upload or account action | `external-action`: actual authority/account/target; never runtime code as a proxy |
| CI workflow or package/provider metadata | `config`: syntax/schema/provider and actual deployment/package checks |
| Static media/localization/store screenshots | `asset`: format/dimensions, declared matrix, provenance and actual visual evidence |
| Generated report or screenshot evidence | `generated-evidence`: raw retained artifact, source/target bindings and repeatable regeneration |
| Test harness/fixture/assertions | `test-source`: meaningful tests, fixture isolation and actual production-consumer distinction |
| Executable app/service behavior | `runtime-source`: named real in-app/deployed/installed consumer, composition and success/recovery |

Runtime modules require a real runtime consumer. Words such as privacy, policy or store do not justify new screens, persistence or backend services. A useful unit may cohesively combine these artifact kinds and affected paths; split only when authority, risk, independent dependencies or useful acceptance boundaries justify it.

## Auth & Identity

| Intent | Module |
|---|---|
| Sign up / sign in with email+password | `.ai-prompts/prompts/modules/feature-patterns/auth-oauth.md` |
| OAuth / social login / SSO (consumer) | `.ai-prompts/prompts/modules/feature-patterns/auth-oauth.md` |
| Enterprise SSO (SAML, OIDC) | `.ai-prompts/prompts/modules/enterprise-saas/sso-integration.md` |
| Identity federation across providers | `.ai-prompts/prompts/modules/security/identity-federation.md` |
| Role-based permissions | `.ai-prompts/prompts/modules/feature-patterns/auth-rbac.md` |
| Enterprise RBAC with audit | `.ai-prompts/prompts/modules/enterprise-saas/rbac-enterprise.md` |
| Advanced authorization (ABAC, policy engines, OPA) | `.ai-prompts/prompts/modules/security/advanced-authorization.md` |
| Multi-factor / biometric | `.ai-prompts/prompts/modules/security/multi-factor-auth.md` |
| Adaptive / risk-based authentication | `.ai-prompts/prompts/modules/security/adaptive-authentication.md` |
| Zero-trust architecture | `.ai-prompts/prompts/modules/security/zero-trust-architecture.md` |
| Privacy controls (consent, preferences, data-subject rights) | `.ai-prompts/prompts/modules/security/privacy-controls.md` |

## Data

| Intent | Module |
|---|---|
| CRUD with a database | `.ai-prompts/prompts/modules/feature-patterns/data-crud.md` |
| Encryption at rest / in transit | `.ai-prompts/prompts/modules/security/data-encryption.md` |
| Encryption (cross-platform pattern — web/mobile/server, GDPR/HIPAA/SOC2) | `.ai-prompts/prompts/modules/feature-patterns/security-encryption.md` |
| Data pipelines / ETL | `.ai-prompts/prompts/modules/data-processing/data-pipelines.md` |
| Data ingestion (streaming + batch sources) | `.ai-prompts/prompts/modules/data-processing/data-ingestion.md` |
| Data transformation / shaping / enrichment | `.ai-prompts/prompts/modules/data-processing/data-transformation.md` |
| Data quality (validation, profiling, lineage) | `.ai-prompts/prompts/modules/data-processing/data-quality.md` |
| Data governance (catalog, policy, compliance) | `.ai-prompts/prompts/modules/data-processing/data-governance.md` |
| Data security (masking, classification, access) | `.ai-prompts/prompts/modules/data-processing/data-security.md` |
| Big data / scalable architectures | `.ai-prompts/prompts/modules/data-processing/scalable-architectures.md` |
| Big data processing (Spark, Flink, etc.) | `.ai-prompts/prompts/modules/data-processing/big-data-processing.md` |
| Sync across devices | `.ai-prompts/prompts/modules/integration/data-synchronization.md` |
| Offline-first / local-first | `.ai-prompts/prompts/modules/feature-patterns/perf-offline.md` |
| Local-only persistence / resumable progress / snapshots | `.ai-prompts/prompts/modules/feature-patterns/local-persistence-progress.md` |
| Native phone storage cleanup / Photos / MediaStore / scoped storage | `.ai-prompts/prompts/modules/feature-patterns/native-storage-cleanup.md` |
| Native phone storage cleanup / memory cleanup / free up space OS capability matrix | `.ai-prompts/prompts/modules/technology-stacks/mobile-os-capability-matrix.md` |

## Architecture & Data Integrity

| Intent | Module |
|---|---|
| Portals / bounded contexts / state ownership / write boundaries / source-of-truth boundaries | `.ai-prompts/prompts/modules/architecture/bounded-context-state-ownership.md` |
| Tier 0 workflows / zero data loss / RPO/RTO / outbox / ordering / replay / audit fail-closed | `.ai-prompts/prompts/modules/architecture/tier-zero-data-integrity.md` |

## AI & ML

| Intent | Module |
|---|---|
| LLM integration / chatbot / AI assistant | `.ai-prompts/prompts/modules/ai-native/llm-integration.md` |
| AI model deployment / serving (server or remote inference) | `.ai-prompts/prompts/modules/ai-native/model-serving.md` |
| ML-driven autoscaling / workload forecasting | `.ai-prompts/prompts/modules/ai-native/predictive-scaling.md` |
| On-device ML — iOS (Core ML, Vision, Create ML) | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` |
| On-device ML — Android (ML Kit, TensorFlow Lite, MediaPipe) | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` |
| Blurry photo detection / low-quality image detection on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` |
| Blurry photo detection / low-quality image detection on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` |
| Near-duplicate photo detection / visual similarity on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` |
| Near-duplicate photo detection / visual similarity on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` |
| Sensitive document detection / OCR classification on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` |
| Sensitive document detection / OCR classification on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` |
| Duplicate video detection / video fingerprinting on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` |
| Duplicate video detection / video fingerprinting on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` |
| Local-only media AI for gallery cleanup | `.ai-prompts/prompts/modules/feature-patterns/native-storage-cleanup.md` |

If the brief mentions privacy, local-only processing, no network, device
AI/ML, phone media, or on-device inference, prefer the on-device modules
above over model serving. Use model serving only when the feature
explicitly needs server-side or remote inference infrastructure.

## Mobile UX Patterns

| Intent | Module |
|---|---|
| Swipe / gesture-based card UI (tinder-style, card stack) | `.ai-prompts/prompts/modules/feature-patterns/gesture-card-ui.md` |
| Haptic feedback / tactile interactions | `.ai-prompts/prompts/modules/feature-patterns/haptic-feedback.md` |

## Commerce

| Intent | Module |
|---|---|
| Product catalog / inventory | `.ai-prompts/prompts/modules/commerce/product-catalog.md` |
| Product search (within a catalog) | `.ai-prompts/prompts/modules/commerce/product-search.md` |
| Product reviews / ratings / Q&A | `.ai-prompts/prompts/modules/commerce/product-reviews.md` |
| Inventory management (stock, warehousing, thresholds) | `.ai-prompts/prompts/modules/commerce/inventory-management.md` |
| Shopping cart | `.ai-prompts/prompts/modules/commerce/shopping-cart.md` |
| Checkout | `.ai-prompts/prompts/modules/commerce/checkout-workflow.md` |
| Payments (cards, etc.) | `.ai-prompts/prompts/modules/commerce/payment-processing.md` |
| Payment methods (Apple Pay, Google Pay, alternative) | `.ai-prompts/prompts/modules/commerce/payment-methods.md` |
| Subscriptions / recurring | `.ai-prompts/prompts/modules/commerce/payment-subscriptions.md` |
| PCI compliance | `.ai-prompts/prompts/modules/commerce/payment-security.md` |
| Orders & fulfillment | `.ai-prompts/prompts/modules/commerce/order-management.md` |
| Marketplace (multi-seller) | `.ai-prompts/prompts/modules/commerce/marketplace-features.md` |

## Social & Community

| Intent | Module |
|---|---|
| User profiles | `.ai-prompts/prompts/modules/social/user-profiles.md` |
| Follow / friend graphs | `.ai-prompts/prompts/modules/social/social-graphs.md` |
| Feeds / timelines | `.ai-prompts/prompts/modules/social/content-feeds.md` |
| User content creation (posts, photos, stories) | `.ai-prompts/prompts/modules/social/content-creation.md` |
| Likes / comments / reactions / engagement | `.ai-prompts/prompts/modules/social/engagement-features.md` |
| People discovery / follow suggestions | `.ai-prompts/prompts/modules/social/social-discovery.md` |
| Identity verification (blue-check, authenticity) | `.ai-prompts/prompts/modules/social/user-verification.md` |
| Real-time messaging / chat | `.ai-prompts/prompts/modules/social/real-time-messaging.md` |
| E2E message encryption | `.ai-prompts/prompts/modules/social/message-encryption.md` |
| Voice / video calls (WebRTC) | `.ai-prompts/prompts/modules/social/voice-video-calls.md` |
| Social content moderation | `.ai-prompts/prompts/modules/social/content-moderation.md` |
| DM / communication moderation | `.ai-prompts/prompts/modules/social/communication-moderation.md` |
| Generic content moderation (non-social apps) | `.ai-prompts/prompts/modules/content-management/content-moderation.md` |

## Real-time

| Intent | Module |
|---|---|
| WebSocket infrastructure | `.ai-prompts/prompts/modules/real-time-communication/websocket-management.md` |
| Presence / online status | `.ai-prompts/prompts/modules/real-time-communication/presence-systems.md` |
| Live streaming | `.ai-prompts/prompts/modules/real-time-communication/live-streaming.md` |
| Live events (virtual events, webinars) | `.ai-prompts/prompts/modules/real-time-communication/live-events.md` |
| Video / voice conferencing | `.ai-prompts/prompts/modules/real-time-communication/video-conferencing.md` |
| Real-time collaboration (CRDT, cursors, presence editing) | `.ai-prompts/prompts/modules/real-time-communication/real-time-collaboration.md` |
| Real-time sync (multi-device state sync) | `.ai-prompts/prompts/modules/real-time-communication/real-time-sync.md` |
| Streaming analytics on real-time data | `.ai-prompts/prompts/modules/real-time-communication/streaming-analytics.md` |
| Message queuing / pub-sub (app layer) | `.ai-prompts/prompts/modules/real-time-communication/message-queuing.md` |

## Notifications

| Intent | Module |
|---|---|
| Multi-channel (email/push/SMS) | `.ai-prompts/prompts/modules/notifications/notification-channels.md` |
| In-app notifications | `.ai-prompts/prompts/modules/notifications/real-time-notifications.md` |
| Rich notifications (images, actions, deep links) | `.ai-prompts/prompts/modules/notifications/rich-notifications.md` |
| Personalisation / targeting / segmentation | `.ai-prompts/prompts/modules/notifications/notification-personalization.md` |
| Compliance (opt-in, CAN-SPAM, GDPR) | `.ai-prompts/prompts/modules/notifications/notification-compliance.md` |
| Notification analytics (delivery, open, CTR) | `.ai-prompts/prompts/modules/notifications/notification-analytics.md` |
| Automated comms / drip campaigns | `.ai-prompts/prompts/modules/notifications/communication-automation.md` |
| Enterprise comms (internal, escalations) | `.ai-prompts/prompts/modules/notifications/enterprise-communications.md` |

## Search & Discovery

| Intent | Module |
|---|---|
| Full-text search | `.ai-prompts/prompts/modules/search-discovery/full-text-search.md` |
| Faceted search / filters | `.ai-prompts/prompts/modules/search-discovery/faceted-search.md` |
| Search personalisation (ranking per user) | `.ai-prompts/prompts/modules/search-discovery/search-personalization.md` |
| Voice search | `.ai-prompts/prompts/modules/search-discovery/voice-search.md` |
| Visual / image search | `.ai-prompts/prompts/modules/search-discovery/visual-search.md` |
| Search analytics (queries, CTR, zero-results) | `.ai-prompts/prompts/modules/search-discovery/search-analytics.md` |
| Recommendations | `.ai-prompts/prompts/modules/search-discovery/recommendation-systems.md` |
| Semantic / vector search | `.ai-prompts/prompts/modules/search-discovery/semantic-search.md` |

## Location

| Intent | Module |
|---|---|
| GPS tracking | `.ai-prompts/prompts/modules/location-services/gps-tracking.md` |
| Geofencing | `.ai-prompts/prompts/modules/location-services/geofencing.md` |
| Matching (Uber-style) | `.ai-prompts/prompts/modules/location-services/service-matching.md` |
| Booking management (slots, scheduling) | `.ai-prompts/prompts/modules/location-services/booking-management.md` |
| Fleet management (vehicles, routing, dispatch) | `.ai-prompts/prompts/modules/location-services/fleet-management.md` |
| Dynamic pricing | `.ai-prompts/prompts/modules/location-services/dynamic-pricing.md` |
| Maps | `.ai-prompts/prompts/modules/location-services/map-integration.md` |
| Location privacy (consent, anonymisation) | `.ai-prompts/prompts/modules/location-services/location-privacy.md` |

## Media

| Intent | Module |
|---|---|
| CDN / streaming delivery | `.ai-prompts/prompts/modules/media-streaming/cdn-integration.md` |
| Playlists / libraries | `.ai-prompts/prompts/modules/media-streaming/playlist-management.md` |
| Offline media sync | `.ai-prompts/prompts/modules/media-streaming/offline-sync.md` |
| Media search within a catalog | `.ai-prompts/prompts/modules/media-streaming/content-search.md` |
| Media processing (transcode, thumbnails, waveforms) | `.ai-prompts/prompts/modules/media-streaming/media-processing.md` |
| Photo near-duplicates / duplicate videos in local device gallery | `.ai-prompts/prompts/modules/feature-patterns/native-storage-cleanup.md` |
| Streaming quality (ABR, bitrate, DRM) | `.ai-prompts/prompts/modules/media-streaming/streaming-quality.md` |
| Recommendation engine (collaborative filtering) | `.ai-prompts/prompts/modules/media-streaming/recommendation-engine.md` |
| Artist / creator tools (uploads, analytics, payouts) | `.ai-prompts/prompts/modules/media-streaming/artist-creator-tools.md` |

## Gamification

| Intent | Module |
|---|---|
| Points system (earn, spend, balance, anti-fraud) | `.ai-prompts/prompts/modules/gamification/point-systems.md` |
| Achievements / badges / unlocks | `.ai-prompts/prompts/modules/gamification/achievement-systems.md` |
| Leaderboards | `.ai-prompts/prompts/modules/gamification/leaderboards.md` |
| Progression / levels / XP | `.ai-prompts/prompts/modules/gamification/progression-systems.md` |
| Rewards (digital + real-world) | `.ai-prompts/prompts/modules/gamification/reward-systems.md` |
| Streaks / daily challenges | `.ai-prompts/prompts/modules/gamification/streak-tracking.md` |
| Social challenges / competitive play | `.ai-prompts/prompts/modules/gamification/social-challenges.md` |
| Engagement psychology (retention, flow, loops) | `.ai-prompts/prompts/modules/gamification/engagement-psychology.md` |

## IoT

| Intent | Module |
|---|---|
| Device discovery + pairing + connectivity | `.ai-prompts/prompts/modules/iot/device-connectivity.md` |
| Device fleet management + lifecycle | `.ai-prompts/prompts/modules/iot/device-management.md` |
| Edge computing / local-first IoT processing | `.ai-prompts/prompts/modules/iot/edge-computing.md` |
| Sensor data ingestion + processing | `.ai-prompts/prompts/modules/iot/sensor-data-processing.md` |
| IoT analytics (real-time + predictive maintenance) | `.ai-prompts/prompts/modules/iot/iot-analytics.md` |
| IoT automation / rules engine | `.ai-prompts/prompts/modules/iot/iot-automation.md` |
| IoT security (device identity, secure provisioning) | `.ai-prompts/prompts/modules/iot/iot-security.md` |
| Industrial IoT / SCADA / OT integration | `.ai-prompts/prompts/modules/iot/industrial-iot.md` |

## Blockchain / Web3

| Intent | Module |
|---|---|
| Smart contracts (Solidity, deployment, lifecycle) | `.ai-prompts/prompts/modules/blockchain/smart-contracts.md` |
| Wallet integration (MetaMask, WalletConnect) | `.ai-prompts/prompts/modules/blockchain/wallet-integration.md` |
| Token management (ERC-20, minting, transfers) | `.ai-prompts/prompts/modules/blockchain/token-management.md` |
| NFTs (ERC-721/1155, marketplaces, royalties) | `.ai-prompts/prompts/modules/blockchain/nft-functionality.md` |
| DeFi protocols (lending, AMM, staking) | `.ai-prompts/prompts/modules/blockchain/defi-protocols.md` |
| On-chain governance / DAO voting | `.ai-prompts/prompts/modules/blockchain/governance-systems.md` |
| Cross-chain bridges + multi-chain apps | `.ai-prompts/prompts/modules/blockchain/cross-chain.md` |
| Enterprise blockchain (permissioned, consortium) | `.ai-prompts/prompts/modules/blockchain/enterprise-blockchain.md` |

## Fintech

| Intent | Module |
|---|---|
| Accounts / balances / ledger | `.ai-prompts/prompts/modules/fintech/account-management.md` |
| Transactions | `.ai-prompts/prompts/modules/fintech/transaction-processing.md` |
| Fraud detection | `.ai-prompts/prompts/modules/fintech/fraud-detection.md` |
| Compliance reporting | `.ai-prompts/prompts/modules/fintech/financial-reporting.md` |
| Investments | `.ai-prompts/prompts/modules/fintech/investment-management.md` |
| Budgeting / personal finance | `.ai-prompts/prompts/modules/fintech/budgeting-tools.md` |
| Credit scoring | `.ai-prompts/prompts/modules/fintech/credit-scoring.md` |
| Lending platform | `.ai-prompts/prompts/modules/fintech/lending-platform.md` |

## Healthcare

| Intent | Module |
|---|---|
| HIPAA scope | `.ai-prompts/prompts/modules/healthcare/hipaa-compliance.md` |
| UK healthcare / NHS / DTAC / DSPT / CQC / DCB0129 / DCB0160 / UK GDPR | `.ai-prompts/prompts/modules/healthcare/uk-regulated-healthcare.md` |
| Medical cannabis / CBPM / controlled drug / Schedule 2 or 3 / CD Register / FP10CD / pharmacy governance | `.ai-prompts/prompts/modules/healthcare/controlled-drugs-uk.md` |
| Clinical safety / SaMD / DCB0129 / DCB0160 / DecisionTrace / human approval for AI or automation | `.ai-prompts/prompts/modules/healthcare/clinical-safety-dcb0129.md` |
| Patient records | `.ai-prompts/prompts/modules/healthcare/patient-data-management.md` |
| Electronic medical records (EMR/EHR) | `.ai-prompts/prompts/modules/healthcare/medical-records.md` |
| Telemedicine | `.ai-prompts/prompts/modules/healthcare/telemedicine.md` |
| Appointment scheduling | `.ai-prompts/prompts/modules/healthcare/appointment-scheduling.md` |
| Prescriptions | `.ai-prompts/prompts/modules/healthcare/prescription-management.md` |
| Wearable / device integration (Apple Health, Fitbit) | `.ai-prompts/prompts/modules/healthcare/wearable-integration.md` |
| Healthcare-specific security controls | `.ai-prompts/prompts/modules/healthcare/healthcare-security.md` |

## Enterprise SaaS

| Intent | Module |
|---|---|
| Multi-tenant isolation | `.ai-prompts/prompts/modules/enterprise-saas/multi-tenancy.md` |
| Billing / metering | `.ai-prompts/prompts/modules/enterprise-saas/enterprise-billing.md` |
| Audit trails | `.ai-prompts/prompts/modules/enterprise-saas/audit-trails.md` |
| Admin workflows | `.ai-prompts/prompts/modules/enterprise-saas/workflow-automation.md` |
| Enterprise API gateway (rate limit, dev portal, webhooks) | `.ai-prompts/prompts/modules/enterprise-saas/api-management.md` |
| White-labelling / per-tenant branding | `.ai-prompts/prompts/modules/enterprise-saas/white-labeling.md` |

## Analytics

| Intent | Module |
|---|---|
| Product analytics / events | `.ai-prompts/prompts/modules/analytics/user-analytics.md` |
| A/B testing | `.ai-prompts/prompts/modules/analytics/ab-testing.md` |
| Real-time dashboards | `.ai-prompts/prompts/modules/analytics/real-time-analytics.md` |
| Business metrics (KPIs, OKRs, finance) | `.ai-prompts/prompts/modules/analytics/business-metrics.md` |
| Cohort analysis / retention | `.ai-prompts/prompts/modules/analytics/cohort-analysis.md` |
| Custom reporting / scheduled exports | `.ai-prompts/prompts/modules/analytics/custom-reporting.md` |
| Predictive analytics (forecasting, churn) | `.ai-prompts/prompts/modules/analytics/predictive-analytics.md` |
| Privacy-preserving analytics (DP, aggregation) | `.ai-prompts/prompts/modules/analytics/privacy-analytics.md` |

## Design Research & UI Planning

| Intent | Module |
|---|---|
| Mobbin / free public UI references / App Store screenshots / Play Store screenshots / product reference research / UI inspiration / app pattern research | `.ai-prompts/prompts/modules/design-research/mobbin-reference-intake.md` |
| UI reference source map / greenfield design context / design research schema | `.ai-prompts/prompts/modules/design-research/ui-reference-source-map.md` |
| Existing product UI extension / follow existing theme / preserve current styling / no redesign | `.ai-prompts/prompts/modules/design-research/mobbin-reference-intake.md` |
| Dashboard / admin dashboard / reporting dashboard / analytics console / operational panel | `.ai-prompts/prompts/modules/design-system/dashboard-screen-patterns.md` |
| Graph / chart / data visualization / data table with charts / KPI reporting | `.ai-prompts/prompts/modules/design-system/data-visualization-system.md` |
| Mobile app screen / app flow / screen-level UI / web app screen / frontend screen | `.ai-prompts/prompts/modules/design-research/mobbin-reference-intake.md` |
| Liquid glass / glassmorphism / native material surfaces / aesthetic animations | `.ai-prompts/prompts/modules/design-system/native-visual-effects-and-motion.md` |

## Performance

| Intent | Module |
|---|---|
| Caching (in-memory, distributed, CDN, invalidation) | `.ai-prompts/prompts/modules/performance/caching-strategies.md` |
| Application performance monitoring (APM) | `.ai-prompts/prompts/modules/performance/performance-monitoring.md` |
| Resource optimization (memory, CPU, storage, network) | `.ai-prompts/prompts/modules/performance/resource-optimization.md` |
| Horizontal scaling / load balancing / sharding | `.ai-prompts/prompts/modules/performance/scalability-patterns.md` |

## Ops / Platform

| Intent | Module |
|---|---|
| CI/CD | `.ai-prompts/prompts/modules/deployment/ci-cd-pipelines.md` |
| Containerization | `.ai-prompts/prompts/modules/deployment/containerization.md` |
| Kubernetes orchestration | `.ai-prompts/prompts/modules/deployment/kubernetes-orchestration.md` |
| Serverless at scale (Lambda, Cloud Run) | `.ai-prompts/prompts/modules/deployment/serverless-orchestration-scale.md` |
| Cloud hosting | `.ai-prompts/prompts/modules/deployment/cloud-deployment.md` |
| Google Cloud / GCP / Cloud Run / Cloud SQL / Spanner / Pub/Sub / VPC-SC / CMEK / Cloud Armor | `.ai-prompts/prompts/modules/technology-stacks/cloud-gcp.md` |
| Regulated cloud landing zone / project segmentation / data residency / non-prod synthetic data / privileged access | `.ai-prompts/prompts/modules/deployment/regulated-cloud-landing-zone.md` |
| Immutable audit evidence / WORM / locked logs / hash chains / evidence export / chain of custody | `.ai-prompts/prompts/modules/security/audit-evidence-worm.md` |
| Multi-cloud deployment strategies | `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.md` |
| Edge computing deployment (CDN workers, POPs) | `.ai-prompts/prompts/modules/deployment/edge-computing-deployment.md` |
| Zero-trust deployment architecture | `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.md` |
| IaC evolution (Terraform → Pulumi → CDK patterns) | `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.md` |
| GitOps advanced workflows (ArgoCD, Flux) | `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.md` |
| Enterprise deployment (change windows, approvals) | `.ai-prompts/prompts/modules/deployment/enterprise-deployment.md` |
| Observability | `.ai-prompts/prompts/modules/deployment/monitoring-observability.md` |
| Disaster recovery | `.ai-prompts/prompts/modules/deployment/disaster-recovery.md` |

## Ops / Readiness (gap-closure / productionize)

For `audit-and-remediate.md` Step 3 when the gap is about taking an
existing codebase to production. Pick whichever is most specific to the gap.

| Intent | Module |
|---|---|
| Production deployment readiness (secrets, envs, DNS, SSL) | `.ai-prompts/prompts/modules/deployment/environment-management.md` |
| CI/CD pipeline (build → test → deploy) | `.ai-prompts/prompts/modules/deployment/ci-cd-pipelines.md` |
| Container orchestration (k8s, ECS, Fargate) | `.ai-prompts/prompts/modules/deployment/kubernetes-deployment.md` |
| Blue/green, canary, feature flags | `.ai-prompts/prompts/modules/deployment/modern-deployment-patterns.md` |
| Observability (logs + metrics + traces + alerts) | `.ai-prompts/prompts/modules/deployment/monitoring-observability.md` |
| Disaster recovery / backups / RPO/RTO | `.ai-prompts/prompts/modules/deployment/disaster-recovery.md` |
| Zero-downtime migrations / rollback | `.ai-prompts/prompts/modules/deployment/modern-deployment-patterns.md` |
| Security audit / vulnerability scan | `.ai-prompts/prompts/modules/security/threat-detection.md` |
| Penetration testing scope | `.ai-prompts/prompts/modules/testing/security-testing.md` |
| Load / performance testing | `.ai-prompts/prompts/modules/testing/performance-testing.md` |
| Chaos engineering | `.ai-prompts/prompts/modules/testing/chaos-engineering.md` |
| Integration test coverage (backend API) | `.ai-prompts/prompts/modules/testing/test-automation.md` |
| Accessibility audit (WCAG) | `.ai-prompts/prompts/modules/testing/accessibility-testing.md` |
| Native mobile screenshot capture / app-store screenshots | `.ai-prompts/prompts/modules/testing/mobile-screenshot-ui-testing.md` |
| Mobile app store submission (iOS) | `.ai-prompts/prompts/modules/technology-stacks/ios-deployment-distribution.md` |
| Mobile app store submission (Android) | `.ai-prompts/prompts/modules/technology-stacks/kotlin-android-development.md` |
| Beta / TestFlight / internal testing | `.ai-prompts/prompts/modules/testing/test-automation.md` |
| iOS simulator / xcodebuild crash recovery (planning of test tasks) | `.ai-prompts/prompts/modules/harness-recovery/ios.md` |
| Android emulator / gradle daemon crash recovery | `.ai-prompts/prompts/modules/harness-recovery/android.md` |
| Web (Vitest / Jest / Playwright / Node) test harness crashes | `.ai-prompts/prompts/modules/harness-recovery/web.md` |
| Flutter test harness crash recovery | `.ai-prompts/prompts/modules/harness-recovery/flutter.md` |
| Bash / shell script crash recovery | `.ai-prompts/prompts/modules/harness-recovery/bash.md` |
| Documentation / runbook readiness | `.ai-prompts/prompts/modules/best-practices/coding-standards.md` |
| Compliance readiness (GDPR, HIPAA, PCI) | pick from the domain sections above (`healthcare/hipaa-compliance.md`, `commerce/payment-security.md`, `security/data-encryption.md`) | — |

## Design System (UI)

| Intent | Module |
|---|---|
| Design tokens (architecture) | `.ai-prompts/prompts/modules/design-system/token-architecture.md` |
| Design tokens (generation pipeline — single source of truth across platforms) | `.ai-prompts/prompts/modules/design-system/token-generation-pipeline.md` |
| Component system | `.ai-prompts/prompts/modules/design-system/component-system.md` |
| Component implementation pattern (from tokens, no hardcoded styles) | `.ai-prompts/prompts/modules/design-system/component-implementation-pattern.md` |
| Design system HTML review artifact / style guide preview / component catalog review / user design feedback | `.ai-prompts/prompts/modules/design-system/design-system-review-artifact.md` |
| Loading states / skeletons / motion tokens | `.ai-prompts/prompts/modules/design-system/loading-states-and-animations.md` |
| Design-to-code validation | `.ai-prompts/prompts/modules/design-system/design-to-code-validation.md` |
| Design system governance / ownership / change control | `.ai-prompts/prompts/modules/design-system/governance-and-maintenance.md` |
| Screen fidelity / visual QA / reference source map | `.ai-prompts/prompts/modules/design-system/screen-fidelity-audit.md` |
| Design-system-first implementation sequencing | `.ai-prompts/prompts/modules/design-system/component-implementation-sequencing.md` |
| Dashboard shell / KPI cards / filters / tables | `.ai-prompts/prompts/modules/design-system/dashboard-screen-patterns.md` |
| Chart system / graph states / visualization accessibility | `.ai-prompts/prompts/modules/design-system/data-visualization-system.md` |
| Native visual effects / liquid glass / material motion / reduced-motion fallback | `.ai-prompts/prompts/modules/design-system/native-visual-effects-and-motion.md` |

## Cross-platform parity (web + mobile)

| Intent | Module |
|---|---|
| Capability / feature-parity matrix across platforms | `.ai-prompts/prompts/modules/cross-platform/parity-matrix.md` |
| Shared API contracts + data models across platforms | `.ai-prompts/prompts/modules/cross-platform/shared-contracts.md` |
| Tests validating functional equivalence across platforms | `.ai-prompts/prompts/modules/cross-platform/parity-validation-tests.md` |
| Parity documentation for team visibility | `.ai-prompts/prompts/modules/cross-platform/parity-documentation.md` |
| Per-feature parity verification tasks | `.ai-prompts/prompts/modules/cross-platform/parity-verification-tasks.md` |
| Dry-run parity check (structural only, no full gen) | `.ai-prompts/prompts/modules/cross-platform/parity-dry-run.md` |

## Accessibility & Internationalization

| Intent | Module |
|---|---|
| WCAG compliance / screen-reader / keyboard nav | `.ai-prompts/prompts/modules/accessibility/accessibility-compliance.md` |
| i18n / translation / RTL / locale formatting | `.ai-prompts/prompts/modules/accessibility/internationalization.md` |
| Regional customization / cultural adaptation | `.ai-prompts/prompts/modules/accessibility/cultural-adaptation.md` |
| Advanced responsive design (fluid type, container queries) | `.ai-prompts/prompts/modules/accessibility/responsive-design-advanced.md` |
| Responsive UI pattern (mobile-first, cross-device, a11y) | `.ai-prompts/prompts/modules/feature-patterns/ui-responsive.md` |

## Integration & APIs

| Intent | Module |
|---|---|
| API management (versioning, keys, throttling) | `.ai-prompts/prompts/modules/integration/api-management.md` |
| Service integration (between internal services) | `.ai-prompts/prompts/modules/integration/service-integration.md` |
| Event-driven architecture (event bus, CQRS) | `.ai-prompts/prompts/modules/integration/event-driven-architecture.md` |
| Message queues (Kafka, RabbitMQ, SQS, pub-sub) | `.ai-prompts/prompts/modules/integration/message-queues.md` |
| Webhook systems (incoming + outgoing) | `.ai-prompts/prompts/modules/integration/webhook-systems.md` |
| Enterprise integration (ESB, iPaaS, legacy SOAP) | `.ai-prompts/prompts/modules/integration/enterprise-integration.md` |
| Integration monitoring (delivery, retries, DLQ) | `.ai-prompts/prompts/modules/integration/integration-monitoring.md` |

## Content Management

| Intent | Module |
|---|---|
| Content creation (CMS authoring, rich text, media) | `.ai-prompts/prompts/modules/content-management/content-creation.md` |
| Content organisation (taxonomies, tags, collections) | `.ai-prompts/prompts/modules/content-management/content-organization.md` |
| Content workflow (draft → review → publish) | `.ai-prompts/prompts/modules/content-management/content-workflow.md` |
| Content versioning / history / rollback | `.ai-prompts/prompts/modules/content-management/content-versioning.md` |
| Content moderation (generic) | `.ai-prompts/prompts/modules/content-management/content-moderation.md` |
| Content security (DRM, access control) | `.ai-prompts/prompts/modules/content-management/content-security.md` |
| Content compliance (GDPR, takedowns) | `.ai-prompts/prompts/modules/content-management/content-compliance.md` |
| Content analytics (performance, engagement) | `.ai-prompts/prompts/modules/content-management/content-analytics.md` |

## Technology Stacks (pick when the project uses / targets this stack)

### Web

| Intent | Module |
|---|---|
| React web app | `.ai-prompts/prompts/modules/technology-stacks/web-react.md` |
| Tailwind CSS / Tailwind theme / Tailwind UI implementation | `.ai-prompts/prompts/modules/technology-stacks/tailwind-css.md` |
| Progressive Web App (installable, offline) | `.ai-prompts/prompts/modules/technology-stacks/progressive-web-apps.md` |
| WebAssembly (perf-critical web features) | `.ai-prompts/prompts/modules/technology-stacks/webassembly.md` |

### Mobile

| Intent | Module |
|---|---|
| Native iOS (Swift / SwiftUI) | `.ai-prompts/prompts/modules/technology-stacks/swift-ios-development.md` |
| iOS UI / UX patterns | `.ai-prompts/prompts/modules/technology-stacks/ios-ui-ux-patterns.md` |
| iOS performance optimisation | `.ai-prompts/prompts/modules/technology-stacks/ios-performance-optimization.md` |
| iOS testing (XCTest, XCUITest) | `.ai-prompts/prompts/modules/technology-stacks/ios-testing-comprehensive.md` |
| iOS deployment / App Store | `.ai-prompts/prompts/modules/technology-stacks/ios-deployment-distribution.md` |
| Native Android (Kotlin / Jetpack Compose) | `.ai-prompts/prompts/modules/technology-stacks/kotlin-android-development.md` |
| Cross-platform React Native | `.ai-prompts/prompts/modules/technology-stacks/mobile-react-native.md` |
| Cross-platform Flutter | `.ai-prompts/prompts/modules/technology-stacks/mobile-flutter.md` |
| Mobile OS capability matrix / OS permissions / unsupported native capability / memory cleanup constraints | `.ai-prompts/prompts/modules/technology-stacks/mobile-os-capability-matrix.md` |

### Backend

| Intent | Module |
|---|---|
| Node.js / TypeScript backend (use per-intent modules above — no dedicated Node module) | — | — |
| Go microservices | `.ai-prompts/prompts/modules/technology-stacks/go-microservices.md` |
| Java Spring Boot | `.ai-prompts/prompts/modules/technology-stacks/java-spring-boot.md` |
| Python ecosystem (Django / FastAPI / Flask) | `.ai-prompts/prompts/modules/technology-stacks/python-ecosystem.md` |
| Ruby on Rails | `.ai-prompts/prompts/modules/technology-stacks/ruby-on-rails.md` |
| PHP ecosystem (Laravel, Symfony) | `.ai-prompts/prompts/modules/technology-stacks/php-ecosystem.md` |
| .NET ecosystem (C#, ASP.NET Core) | `.ai-prompts/prompts/modules/technology-stacks/dotnet-ecosystem.md` |
| Elixir / Phoenix web | `.ai-prompts/prompts/modules/technology-stacks/elixir-phoenix-web.md` |
| Scala functional programming | `.ai-prompts/prompts/modules/technology-stacks/scala-functional-programming.md` |
| Rust systems programming (high-perf services, CLI) | `.ai-prompts/prompts/modules/technology-stacks/rust-systems-programming.md` |
| C++ high-performance | `.ai-prompts/prompts/modules/technology-stacks/cpp-high-performance.md` |

### BaaS / Cloud

| Intent | Module |
|---|---|
| Firebase backend-as-a-service | `.ai-prompts/prompts/modules/technology-stacks/backend-firebase.md` |
| AWS cloud (EC2, ECS, RDS, S3, Lambda) | `.ai-prompts/prompts/modules/technology-stacks/cloud-aws.md` |
| Google Cloud Platform / GCP (Cloud Run, Cloud SQL, Pub/Sub, Cloud Storage, BigQuery, VPC-SC, CMEK) | `.ai-prompts/prompts/modules/technology-stacks/cloud-gcp.md` |

### Desktop / specialised hardware

| Intent | Module |
|---|---|
| Electron desktop app | `.ai-prompts/prompts/modules/technology-stacks/electron-desktop.md` |
| Tauri desktop app (lightweight alternative to Electron) | `.ai-prompts/prompts/modules/technology-stacks/tauri-desktop.md` |
| Apple CarPlay integration | `.ai-prompts/prompts/modules/technology-stacks/apple-carplay.md` |
| Android Auto integration | `.ai-prompts/prompts/modules/technology-stacks/android-auto.md` |

## Desktop Apps

| Intent | Module |
|---|---|
| Native OS integrations (system APIs, protocol handlers) | `.ai-prompts/prompts/modules/desktop/native-integrations.md` |
| Desktop offline-first with sync + conflict resolution | `.ai-prompts/prompts/modules/desktop/offline-first.md` |

## Testing

| Intent | Module |
|---|---|
| Test automation strategy | `.ai-prompts/prompts/modules/testing/test-automation.md` |
| Native mobile UI screenshot testing (iOS XCUITest / Android instrumentation) | `.ai-prompts/prompts/modules/testing/mobile-screenshot-ui-testing.md` |
| Property-based tests | `.ai-prompts/prompts/modules/testing/property-based-testing.md` |
| Centralized mock data | `.ai-prompts/prompts/modules/testing/centralized-mock-data.md` |
| Fake backend generator (local API doubles) | `.ai-prompts/prompts/modules/testing/fake-backend-generator.md` |
| Mock consolidation / DRY test fixtures | `.ai-prompts/prompts/modules/testing/mock-consolidation.md` |
| Mock validation (drift between real + mock) | `.ai-prompts/prompts/modules/testing/mock-validation.md` |
| Test data management (factories, fixtures, seeding) | `.ai-prompts/prompts/modules/testing/test-data-management.md` |
| Test management (plans, reports, traceability) | `.ai-prompts/prompts/modules/testing/test-management.md` |
| Cross-browser testing | `.ai-prompts/prompts/modules/testing/cross-browser-testing.md` |
| Domain-specific testing patterns | `.ai-prompts/prompts/modules/testing/domain-testing.md` |
| CI/CD testing (pipeline-integrated tests) | `.ai-prompts/prompts/modules/testing/ci-cd-testing.md` |
| Debug-menu integration (dev toggles in app) | `.ai-prompts/prompts/modules/testing/debug-menu-integration.md` |
| Quality metrics (coverage, flake rate, MTTR) | `.ai-prompts/prompts/modules/testing/quality-metrics.md` |

## Rules

Load only guidance needed for the slice or a concrete high-risk decision. If a slice requires excessive unrelated modules, narrow it while retaining deferred scope in the ledger. Modules cannot override explicit requirements, safety duties, authorization or evidence/review gates. Cross-platform modules apply only to requested targets. A fake backend/prototype helps controlled proof, never production readiness. Inspect actual visual references before citing inspiration; unresolved access stays uncertain.
