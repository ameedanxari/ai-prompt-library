# Module Selection Index

Deterministic intent → module mapping. The drill-down engine uses this
to pick the modules needed for the current expansion context (Step 2 or
Step 3).

## How to use

1. Classify the task's artifact kind using the routing table below.
2. Identify the epic or feature's intents only after the artifact shape is fixed.
3. Match each relevant intent keyword below to its module path.
4. Load as many matched modules as the current task genuinely needs.
   Prefer the modules with the most domain-specific constraints (e.g.
   `healthcare/hipaa-compliance` beats `security/data-encryption` for a
   patient records feature), but do not discard a second module when it
   carries a separate required concern.
5. If no intent matches, skip module loading — the engine can proceed without
   one.

## Token budgets

Every module entry below carries an explicit token budget: estimated tokens +
a max budget, computed with one uniform heuristic — **estimated tokens ≈
brief-file bytes ÷ 4; max budget = ⌈est × 1.5⌉**. Budgets reflect the short
core brief at the listed path (the file the engine loads by default). Modules
split into brief + expandable detail list per-detail-file budgets in the
brief's "Expandable detail" section; load detail files only when the brief's
checklist is insufficient for the task.

Paths are relative to the repository root.

## Artifact-kind routing (run before domain-module lookup)

Artifact ownership chooses the task shape before intent keywords choose domain
knowledge. Start with `.ai-prompts/prompts/orchestrators/baseline-task-shapes.md` and use
this routing table. Domain modules may supply content constraints, but they do
not change a non-runtime task into a runtime feature.

| Intent or output | Artifact kind / route | Module-selection rule |
|---|---|---|
| Policy, privacy inventory, data-safety narrative, terms, support boundaries | `docs` | Use the docs/policy shape. A privacy/security module may inform required content, but do not inherit repositories, persistence, UI state, or platform source. |
| App Store / Play listing copy, release notes, package README, publication guide | `docs` | Route to document assertions and length/content checks. Store upload itself is a separate `external-action`. |
| Store-console upload, account creation, signing approval, DNS/provider console action | `external-action` | Require account checklist linkage and `manual-review` or `external` evidence. Do not create source code as a proxy. |
| CI workflow, package metadata, manifest, policy-as-code, release configuration | `config` | Use syntax/schema/provider checks. Load deployment modules only for concrete config semantics. |
| Icon, localization catalog, store screenshot, static media | `asset` | Use dimensions, format, matrix, provenance, and visual/manual evidence. UI modules do not imply an in-app screen task. |
| Generated report, scan, scorecard, screenshot evidence, review artifact | `generated-evidence` | Require provenance, schema assertions, and an idempotent regeneration command. |
| Test harness, fixture, assertion source | `test-source` | Load testing modules only; production modules require a separate runtime consumer task. |
| Executable app/service behavior with a named in-app or deployed consumer | `runtime-source` | Consult domain/runtime modules and name the real production path, owner, and behavioral evidence. |

Runtime modules are permitted only when the unit names a real in-app or
deployed consumer. The presence of words such as privacy, store, release,
analytics, or policy does not itself justify runtime code. If one requested
outcome mixes runtime and non-runtime artifacts, split it into separate task
units with dependency edges. A reviewed override record must name `source`,
`artifact_kind`, `runtime_consumer`, `rationale`, `approval`, `scope`, and
`expiry`; an unreviewed mixed `File` list is rejected.

## Auth & Identity

| Intent | Module | Token budget |
|---|---|---|
| Sign up / sign in with email+password | `.ai-prompts/prompts/modules/feature-patterns/auth-oauth.md` | ~7.2k est / ~10.8k max |
| OAuth / social login / SSO (consumer) | `.ai-prompts/prompts/modules/feature-patterns/auth-oauth.md` | ~7.2k est / ~10.8k max |
| Enterprise SSO (SAML, OIDC) | `.ai-prompts/prompts/modules/enterprise-saas/sso-integration.md` | ~8.0k est / ~12.0k max |
| Identity federation across providers | `.ai-prompts/prompts/modules/security/identity-federation.md` | ~7.2k est / ~10.8k max |
| Role-based permissions | `.ai-prompts/prompts/modules/feature-patterns/auth-rbac.md` | ~6.7k est / ~10.1k max |
| Enterprise RBAC with audit | `.ai-prompts/prompts/modules/enterprise-saas/rbac-enterprise.md` | ~6.7k est / ~10.0k max |
| Advanced authorization (ABAC, policy engines, OPA) | `.ai-prompts/prompts/modules/security/advanced-authorization.md` | ~6.7k est / ~10.0k max |
| Multi-factor / biometric | `.ai-prompts/prompts/modules/security/multi-factor-auth.md` | ~5.5k est / ~8.2k max |
| Adaptive / risk-based authentication | `.ai-prompts/prompts/modules/security/adaptive-authentication.md` | ~6.7k est / ~10.0k max |
| Zero-trust architecture | `.ai-prompts/prompts/modules/security/zero-trust-architecture.md` | ~6.3k est / ~9.4k max |
| Privacy controls (consent, preferences, data-subject rights) | `.ai-prompts/prompts/modules/security/privacy-controls.md` | ~4.6k est / ~6.8k max |

## Data

| Intent | Module | Token budget |
|---|---|---|
| CRUD with a database | `.ai-prompts/prompts/modules/feature-patterns/data-crud.md` | ~8.0k est / ~12.1k max |
| Encryption at rest / in transit | `.ai-prompts/prompts/modules/security/data-encryption.md` | ~3.9k est / ~5.8k max |
| Encryption (cross-platform pattern — web/mobile/server, GDPR/HIPAA/SOC2) | `.ai-prompts/prompts/modules/feature-patterns/security-encryption.md` | ~1.1k est / ~1.7k max |
| Data pipelines / ETL | `.ai-prompts/prompts/modules/data-processing/data-pipelines.md` | ~5.0k est / ~7.4k max |
| Data ingestion (streaming + batch sources) | `.ai-prompts/prompts/modules/data-processing/data-ingestion.md` | ~5.7k est / ~8.5k max |
| Data transformation / shaping / enrichment | `.ai-prompts/prompts/modules/data-processing/data-transformation.md` | ~6.0k est / ~9.1k max |
| Data quality (validation, profiling, lineage) | `.ai-prompts/prompts/modules/data-processing/data-quality.md` | ~7.2k est / ~10.8k max |
| Data governance (catalog, policy, compliance) | `.ai-prompts/prompts/modules/data-processing/data-governance.md` | ~6.1k est / ~9.2k max |
| Data security (masking, classification, access) | `.ai-prompts/prompts/modules/data-processing/data-security.md` | ~5.5k est / ~8.3k max |
| Big data / scalable architectures | `.ai-prompts/prompts/modules/data-processing/scalable-architectures.md` | ~5.9k est / ~8.9k max |
| Big data processing (Spark, Flink, etc.) | `.ai-prompts/prompts/modules/data-processing/big-data-processing.md` | ~5.1k est / ~7.6k max |
| Sync across devices | `.ai-prompts/prompts/modules/integration/data-synchronization.md` | ~5.6k est / ~8.4k max |
| Offline-first / local-first | `.ai-prompts/prompts/modules/feature-patterns/perf-offline.md` | ~8.4k est / ~12.5k max |
| Local-only persistence / resumable progress / snapshots | `.ai-prompts/prompts/modules/feature-patterns/local-persistence-progress.md` | ~1.5k est / ~2.2k max |
| Native phone storage cleanup / Photos / MediaStore / scoped storage | `.ai-prompts/prompts/modules/feature-patterns/native-storage-cleanup.md` | ~2.2k est / ~3.3k max |
| Native phone storage cleanup / memory cleanup / free up space OS capability matrix | `.ai-prompts/prompts/modules/technology-stacks/mobile-os-capability-matrix.md` | ~1.0k est / ~1.5k max |

## Architecture & Data Integrity

| Intent | Module | Token budget |
|---|---|---|
| Portals / bounded contexts / state ownership / write boundaries / source-of-truth boundaries | `.ai-prompts/prompts/modules/architecture/bounded-context-state-ownership.md` | ~578 est / ~867 max |
| Tier 0 workflows / zero data loss / RPO/RTO / outbox / ordering / replay / audit fail-closed | `.ai-prompts/prompts/modules/architecture/tier-zero-data-integrity.md` | ~532 est / ~798 max |

## AI & ML

| Intent | Module | Token budget |
|---|---|---|
| LLM integration / chatbot / AI assistant | `.ai-prompts/prompts/modules/ai-native/llm-integration.md` | ~3.7k est / ~5.5k max |
| AI model deployment / serving (server or remote inference) | `.ai-prompts/prompts/modules/ai-native/model-serving.md` | ~1.2k est / ~1.8k max |
| ML-driven autoscaling / workload forecasting | `.ai-prompts/prompts/modules/ai-native/predictive-scaling.md` | ~962 est / ~1.4k max |
| On-device ML — iOS (Core ML, Vision, Create ML) | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` | ~1.8k est / ~2.7k max |
| On-device ML — Android (ML Kit, TensorFlow Lite, MediaPipe) | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` | ~2.0k est / ~3.1k max |
| Blurry photo detection / low-quality image detection on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` | ~1.8k est / ~2.7k max |
| Blurry photo detection / low-quality image detection on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` | ~2.0k est / ~3.1k max |
| Near-duplicate photo detection / visual similarity on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` | ~1.8k est / ~2.7k max |
| Near-duplicate photo detection / visual similarity on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` | ~2.0k est / ~3.1k max |
| Sensitive document detection / OCR classification on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` | ~1.8k est / ~2.7k max |
| Sensitive document detection / OCR classification on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` | ~2.0k est / ~3.1k max |
| Duplicate video detection / video fingerprinting on iOS | `.ai-prompts/prompts/modules/ai-native/on-device-ml-ios.md` | ~1.8k est / ~2.7k max |
| Duplicate video detection / video fingerprinting on Android | `.ai-prompts/prompts/modules/ai-native/on-device-ml-android.md` | ~2.0k est / ~3.1k max |
| Local-only media AI for gallery cleanup | `.ai-prompts/prompts/modules/feature-patterns/native-storage-cleanup.md` | ~2.2k est / ~3.3k max |

If the brief mentions privacy, local-only processing, no network, device
AI/ML, phone media, or on-device inference, prefer the on-device modules
above over model serving. Use model serving only when the feature
explicitly needs server-side or remote inference infrastructure.

## Mobile UX Patterns

| Intent | Module | Token budget |
|---|---|---|
| Swipe / gesture-based card UI (tinder-style, card stack) | `.ai-prompts/prompts/modules/feature-patterns/gesture-card-ui.md` | ~1.1k est / ~1.6k max |
| Haptic feedback / tactile interactions | `.ai-prompts/prompts/modules/feature-patterns/haptic-feedback.md` | ~2.0k est / ~3.0k max |

## Commerce

| Intent | Module | Token budget |
|---|---|---|
| Product catalog / inventory | `.ai-prompts/prompts/modules/commerce/product-catalog.md` | ~8.2k est / ~12.2k max |
| Product search (within a catalog) | `.ai-prompts/prompts/modules/commerce/product-search.md` | ~8.6k est / ~12.8k max |
| Product reviews / ratings / Q&A | `.ai-prompts/prompts/modules/commerce/product-reviews.md` | ~9.4k est / ~14.2k max |
| Inventory management (stock, warehousing, thresholds) | `.ai-prompts/prompts/modules/commerce/inventory-management.md` | ~8.7k est / ~13.1k max |
| Shopping cart | `.ai-prompts/prompts/modules/commerce/shopping-cart.md` | ~5.3k est / ~7.9k max |
| Checkout | `.ai-prompts/prompts/modules/commerce/checkout-workflow.md` | ~6.5k est / ~9.7k max |
| Payments (cards, etc.) | `.ai-prompts/prompts/modules/commerce/payment-processing.md` | ~3.5k est / ~5.3k max |
| Payment methods (Apple Pay, Google Pay, alternative) | `.ai-prompts/prompts/modules/commerce/payment-methods.md` | ~6.8k est / ~10.3k max |
| Subscriptions / recurring | `.ai-prompts/prompts/modules/commerce/payment-subscriptions.md` | ~8.8k est / ~13.2k max |
| PCI compliance | `.ai-prompts/prompts/modules/commerce/payment-security.md` | ~5.4k est / ~8.1k max |
| Orders & fulfillment | `.ai-prompts/prompts/modules/commerce/order-management.md` | ~9.6k est / ~14.4k max |
| Marketplace (multi-seller) | `.ai-prompts/prompts/modules/commerce/marketplace-features.md` | ~8.9k est / ~13.4k max |

## Social & Community

| Intent | Module | Token budget |
|---|---|---|
| User profiles | `.ai-prompts/prompts/modules/social/user-profiles.md` | ~3.3k est / ~5.0k max |
| Follow / friend graphs | `.ai-prompts/prompts/modules/social/social-graphs.md` | ~3.9k est / ~5.8k max |
| Feeds / timelines | `.ai-prompts/prompts/modules/social/content-feeds.md` | ~4.1k est / ~6.2k max |
| User content creation (posts, photos, stories) | `.ai-prompts/prompts/modules/social/content-creation.md` | ~4.1k est / ~6.1k max |
| Likes / comments / reactions / engagement | `.ai-prompts/prompts/modules/social/engagement-features.md` | ~4.1k est / ~6.2k max |
| People discovery / follow suggestions | `.ai-prompts/prompts/modules/social/social-discovery.md` | ~4.2k est / ~6.3k max |
| Identity verification (blue-check, authenticity) | `.ai-prompts/prompts/modules/social/user-verification.md` | ~4.1k est / ~6.1k max |
| Real-time messaging / chat | `.ai-prompts/prompts/modules/social/real-time-messaging.md` | ~3.9k est / ~5.8k max |
| E2E message encryption | `.ai-prompts/prompts/modules/social/message-encryption.md` | ~4.0k est / ~5.9k max |
| Voice / video calls (WebRTC) | `.ai-prompts/prompts/modules/social/voice-video-calls.md` | ~4.0k est / ~5.9k max |
| Social content moderation | `.ai-prompts/prompts/modules/social/content-moderation.md` | ~4.3k est / ~6.4k max |
| DM / communication moderation | `.ai-prompts/prompts/modules/social/communication-moderation.md` | ~4.2k est / ~6.2k max |
| Generic content moderation (non-social apps) | `.ai-prompts/prompts/modules/content-management/content-moderation.md` | ~6.1k est / ~9.2k max |

## Real-time

| Intent | Module | Token budget |
|---|---|---|
| WebSocket infrastructure | `.ai-prompts/prompts/modules/real-time-communication/websocket-management.md` | ~4.3k est / ~6.5k max |
| Presence / online status | `.ai-prompts/prompts/modules/real-time-communication/presence-systems.md` | ~6.9k est / ~10.4k max |
| Live streaming | `.ai-prompts/prompts/modules/real-time-communication/live-streaming.md` | ~8.7k est / ~13.0k max |
| Live events (virtual events, webinars) | `.ai-prompts/prompts/modules/real-time-communication/live-events.md` | ~830 est / ~1.2k max |
| Video / voice conferencing | `.ai-prompts/prompts/modules/real-time-communication/video-conferencing.md` | ~11.5k est / ~17.2k max |
| Real-time collaboration (CRDT, cursors, presence editing) | `.ai-prompts/prompts/modules/real-time-communication/real-time-collaboration.md` | ~10.1k est / ~15.2k max |
| Real-time sync (multi-device state sync) | `.ai-prompts/prompts/modules/real-time-communication/real-time-sync.md` | ~9.6k est / ~14.4k max |
| Streaming analytics on real-time data | `.ai-prompts/prompts/modules/real-time-communication/streaming-analytics.md` | ~1.1k est / ~1.7k max |
| Message queuing / pub-sub (app layer) | `.ai-prompts/prompts/modules/real-time-communication/message-queuing.md` | ~5.3k est / ~8.0k max |

## Notifications

| Intent | Module | Token budget |
|---|---|---|
| Multi-channel (email/push/SMS) | `.ai-prompts/prompts/modules/notifications/notification-channels.md` | ~6.9k est / ~10.4k max |
| In-app notifications | `.ai-prompts/prompts/modules/notifications/real-time-notifications.md` | ~6.5k est / ~9.8k max |
| Rich notifications (images, actions, deep links) | `.ai-prompts/prompts/modules/notifications/rich-notifications.md` | ~5.4k est / ~8.1k max |
| Personalisation / targeting / segmentation | `.ai-prompts/prompts/modules/notifications/notification-personalization.md` | ~5.5k est / ~8.2k max |
| Compliance (opt-in, CAN-SPAM, GDPR) | `.ai-prompts/prompts/modules/notifications/notification-compliance.md` | ~5.7k est / ~8.6k max |
| Notification analytics (delivery, open, CTR) | `.ai-prompts/prompts/modules/notifications/notification-analytics.md` | ~5.8k est / ~8.7k max |
| Automated comms / drip campaigns | `.ai-prompts/prompts/modules/notifications/communication-automation.md` | ~6.3k est / ~9.4k max |
| Enterprise comms (internal, escalations) | `.ai-prompts/prompts/modules/notifications/enterprise-communications.md` | ~6.4k est / ~9.7k max |

## Search & Discovery

| Intent | Module | Token budget |
|---|---|---|
| Full-text search | `.ai-prompts/prompts/modules/search-discovery/full-text-search.md` | ~8.6k est / ~12.9k max |
| Faceted search / filters | `.ai-prompts/prompts/modules/search-discovery/faceted-search.md` | ~7.5k est / ~11.3k max |
| Search personalisation (ranking per user) | `.ai-prompts/prompts/modules/search-discovery/search-personalization.md` | ~7.7k est / ~11.6k max |
| Voice search | `.ai-prompts/prompts/modules/search-discovery/voice-search.md` | ~6.4k est / ~9.6k max |
| Visual / image search | `.ai-prompts/prompts/modules/search-discovery/visual-search.md` | ~5.0k est / ~7.5k max |
| Search analytics (queries, CTR, zero-results) | `.ai-prompts/prompts/modules/search-discovery/search-analytics.md` | ~8.3k est / ~12.5k max |
| Recommendations | `.ai-prompts/prompts/modules/search-discovery/recommendation-systems.md` | ~4.8k est / ~7.3k max |
| Semantic / vector search | `.ai-prompts/prompts/modules/search-discovery/semantic-search.md` | ~6.4k est / ~9.6k max |

## Location

| Intent | Module | Token budget |
|---|---|---|
| GPS tracking | `.ai-prompts/prompts/modules/location-services/gps-tracking.md` | ~5.6k est / ~8.3k max |
| Geofencing | `.ai-prompts/prompts/modules/location-services/geofencing.md` | ~9.9k est / ~14.9k max |
| Matching (Uber-style) | `.ai-prompts/prompts/modules/location-services/service-matching.md` | ~8.4k est / ~12.6k max |
| Booking management (slots, scheduling) | `.ai-prompts/prompts/modules/location-services/booking-management.md` | ~9.2k est / ~13.8k max |
| Fleet management (vehicles, routing, dispatch) | `.ai-prompts/prompts/modules/location-services/fleet-management.md` | ~10.0k est / ~15.0k max |
| Dynamic pricing | `.ai-prompts/prompts/modules/location-services/dynamic-pricing.md` | ~9.3k est / ~13.9k max |
| Maps | `.ai-prompts/prompts/modules/location-services/map-integration.md` | ~10.8k est / ~16.2k max |
| Location privacy (consent, anonymisation) | `.ai-prompts/prompts/modules/location-services/location-privacy.md` | ~11.1k est / ~16.7k max |

## Media

| Intent | Module | Token budget |
|---|---|---|
| CDN / streaming delivery | `.ai-prompts/prompts/modules/media-streaming/cdn-integration.md` | ~5.2k est / ~7.8k max |
| Playlists / libraries | `.ai-prompts/prompts/modules/media-streaming/playlist-management.md` | ~10.5k est / ~15.7k max |
| Offline media sync | `.ai-prompts/prompts/modules/media-streaming/offline-sync.md` | ~7.7k est / ~11.6k max |
| Media search within a catalog | `.ai-prompts/prompts/modules/media-streaming/content-search.md` | ~10.9k est / ~16.4k max |
| Media processing (transcode, thumbnails, waveforms) | `.ai-prompts/prompts/modules/media-streaming/media-processing.md` | ~6.7k est / ~10.0k max |
| Photo near-duplicates / duplicate videos in local device gallery | `.ai-prompts/prompts/modules/feature-patterns/native-storage-cleanup.md` | ~2.2k est / ~3.3k max |
| Streaming quality (ABR, bitrate, DRM) | `.ai-prompts/prompts/modules/media-streaming/streaming-quality.md` | ~8.0k est / ~12.0k max |
| Recommendation engine (collaborative filtering) | `.ai-prompts/prompts/modules/media-streaming/recommendation-engine.md` | ~9.8k est / ~14.8k max |
| Artist / creator tools (uploads, analytics, payouts) | `.ai-prompts/prompts/modules/media-streaming/artist-creator-tools.md` | ~1.8k est / ~2.7k max |

## Gamification

| Intent | Module | Token budget |
|---|---|---|
| Points system (earn, spend, balance, anti-fraud) | `.ai-prompts/prompts/modules/gamification/point-systems.md` | ~9.0k est / ~13.5k max |
| Achievements / badges / unlocks | `.ai-prompts/prompts/modules/gamification/achievement-systems.md` | ~10.2k est / ~15.3k max |
| Leaderboards | `.ai-prompts/prompts/modules/gamification/leaderboards.md` | ~9.6k est / ~14.5k max |
| Progression / levels / XP | `.ai-prompts/prompts/modules/gamification/progression-systems.md` | ~10.2k est / ~15.3k max |
| Rewards (digital + real-world) | `.ai-prompts/prompts/modules/gamification/reward-systems.md` | ~8.6k est / ~12.9k max |
| Streaks / daily challenges | `.ai-prompts/prompts/modules/gamification/streak-tracking.md` | ~8.6k est / ~13.0k max |
| Social challenges / competitive play | `.ai-prompts/prompts/modules/gamification/social-challenges.md` | ~7.5k est / ~11.3k max |
| Engagement psychology (retention, flow, loops) | `.ai-prompts/prompts/modules/gamification/engagement-psychology.md` | ~9.7k est / ~14.6k max |

## IoT

| Intent | Module | Token budget |
|---|---|---|
| Device discovery + pairing + connectivity | `.ai-prompts/prompts/modules/iot/device-connectivity.md` | ~6.5k est / ~9.8k max |
| Device fleet management + lifecycle | `.ai-prompts/prompts/modules/iot/device-management.md` | ~6.6k est / ~9.9k max |
| Edge computing / local-first IoT processing | `.ai-prompts/prompts/modules/iot/edge-computing.md` | ~6.2k est / ~9.3k max |
| Sensor data ingestion + processing | `.ai-prompts/prompts/modules/iot/sensor-data-processing.md` | ~6.8k est / ~10.2k max |
| IoT analytics (real-time + predictive maintenance) | `.ai-prompts/prompts/modules/iot/iot-analytics.md` | ~5.1k est / ~7.7k max |
| IoT automation / rules engine | `.ai-prompts/prompts/modules/iot/iot-automation.md` | ~6.4k est / ~9.6k max |
| IoT security (device identity, secure provisioning) | `.ai-prompts/prompts/modules/iot/iot-security.md` | ~6.8k est / ~10.2k max |
| Industrial IoT / SCADA / OT integration | `.ai-prompts/prompts/modules/iot/industrial-iot.md` | ~5.4k est / ~8.1k max |

## Blockchain / Web3

| Intent | Module | Token budget |
|---|---|---|
| Smart contracts (Solidity, deployment, lifecycle) | `.ai-prompts/prompts/modules/blockchain/smart-contracts.md` | ~7.4k est / ~11.1k max |
| Wallet integration (MetaMask, WalletConnect) | `.ai-prompts/prompts/modules/blockchain/wallet-integration.md` | ~5.5k est / ~8.2k max |
| Token management (ERC-20, minting, transfers) | `.ai-prompts/prompts/modules/blockchain/token-management.md` | ~6.5k est / ~9.7k max |
| NFTs (ERC-721/1155, marketplaces, royalties) | `.ai-prompts/prompts/modules/blockchain/nft-functionality.md` | ~7.1k est / ~10.6k max |
| DeFi protocols (lending, AMM, staking) | `.ai-prompts/prompts/modules/blockchain/defi-protocols.md` | ~6.2k est / ~9.3k max |
| On-chain governance / DAO voting | `.ai-prompts/prompts/modules/blockchain/governance-systems.md` | ~4.7k est / ~7.0k max |
| Cross-chain bridges + multi-chain apps | `.ai-prompts/prompts/modules/blockchain/cross-chain.md` | ~4.7k est / ~7.1k max |
| Enterprise blockchain (permissioned, consortium) | `.ai-prompts/prompts/modules/blockchain/enterprise-blockchain.md` | ~5.4k est / ~8.1k max |

## Fintech

| Intent | Module | Token budget |
|---|---|---|
| Accounts / balances / ledger | `.ai-prompts/prompts/modules/fintech/account-management.md` | ~4.5k est / ~6.8k max |
| Transactions | `.ai-prompts/prompts/modules/fintech/transaction-processing.md` | ~5.9k est / ~8.8k max |
| Fraud detection | `.ai-prompts/prompts/modules/fintech/fraud-detection.md` | ~6.8k est / ~10.3k max |
| Compliance reporting | `.ai-prompts/prompts/modules/fintech/financial-reporting.md` | ~7.7k est / ~11.5k max |
| Investments | `.ai-prompts/prompts/modules/fintech/investment-management.md` | ~5.6k est / ~8.4k max |
| Budgeting / personal finance | `.ai-prompts/prompts/modules/fintech/budgeting-tools.md` | ~8.4k est / ~12.6k max |
| Credit scoring | `.ai-prompts/prompts/modules/fintech/credit-scoring.md` | ~6.9k est / ~10.3k max |
| Lending platform | `.ai-prompts/prompts/modules/fintech/lending-platform.md` | ~9.6k est / ~14.3k max |

## Healthcare

| Intent | Module | Token budget |
|---|---|---|
| HIPAA scope | `.ai-prompts/prompts/modules/healthcare/hipaa-compliance.md` | ~8.4k est / ~12.7k max |
| UK healthcare / NHS / DTAC / DSPT / CQC / DCB0129 / DCB0160 / UK GDPR | `.ai-prompts/prompts/modules/healthcare/uk-regulated-healthcare.md` | ~928 est / ~1.4k max |
| Medical cannabis / CBPM / controlled drug / Schedule 2 or 3 / CD Register / FP10CD / pharmacy governance | `.ai-prompts/prompts/modules/healthcare/controlled-drugs-uk.md` | ~746 est / ~1.1k max |
| Clinical safety / SaMD / DCB0129 / DCB0160 / DecisionTrace / human approval for AI or automation | `.ai-prompts/prompts/modules/healthcare/clinical-safety-dcb0129.md` | ~734 est / ~1.1k max |
| Patient records | `.ai-prompts/prompts/modules/healthcare/patient-data-management.md` | ~5.1k est / ~7.7k max |
| Electronic medical records (EMR/EHR) | `.ai-prompts/prompts/modules/healthcare/medical-records.md` | ~8.0k est / ~11.9k max |
| Telemedicine | `.ai-prompts/prompts/modules/healthcare/telemedicine.md` | ~11.1k est / ~16.7k max |
| Appointment scheduling | `.ai-prompts/prompts/modules/healthcare/appointment-scheduling.md` | ~9.3k est / ~13.9k max |
| Prescriptions | `.ai-prompts/prompts/modules/healthcare/prescription-management.md` | ~9.6k est / ~14.4k max |
| Wearable / device integration (Apple Health, Fitbit) | `.ai-prompts/prompts/modules/healthcare/wearable-integration.md` | ~8.0k est / ~12.0k max |
| Healthcare-specific security controls | `.ai-prompts/prompts/modules/healthcare/healthcare-security.md` | ~9.7k est / ~14.6k max |

## Enterprise SaaS

| Intent | Module | Token budget |
|---|---|---|
| Multi-tenant isolation | `.ai-prompts/prompts/modules/enterprise-saas/multi-tenancy.md` | ~4.2k est / ~6.3k max |
| Billing / metering | `.ai-prompts/prompts/modules/enterprise-saas/enterprise-billing.md` | ~10.9k est / ~16.3k max |
| Audit trails | `.ai-prompts/prompts/modules/enterprise-saas/audit-trails.md` | ~9.8k est / ~14.7k max |
| Admin workflows | `.ai-prompts/prompts/modules/enterprise-saas/workflow-automation.md` | ~11.1k est / ~16.6k max |
| Enterprise API gateway (rate limit, dev portal, webhooks) | `.ai-prompts/prompts/modules/enterprise-saas/api-management.md` | ~7.4k est / ~11.1k max |
| White-labelling / per-tenant branding | `.ai-prompts/prompts/modules/enterprise-saas/white-labeling.md` | ~10.4k est / ~15.6k max |

## Analytics

| Intent | Module | Token budget |
|---|---|---|
| Product analytics / events | `.ai-prompts/prompts/modules/analytics/user-analytics.md` | ~8.1k est / ~12.1k max |
| A/B testing | `.ai-prompts/prompts/modules/analytics/ab-testing.md` | ~9.3k est / ~14.0k max |
| Real-time dashboards | `.ai-prompts/prompts/modules/analytics/real-time-analytics.md` | ~11.2k est / ~16.9k max |
| Business metrics (KPIs, OKRs, finance) | `.ai-prompts/prompts/modules/analytics/business-metrics.md` | ~6.7k est / ~10.1k max |
| Cohort analysis / retention | `.ai-prompts/prompts/modules/analytics/cohort-analysis.md` | ~8.3k est / ~12.4k max |
| Custom reporting / scheduled exports | `.ai-prompts/prompts/modules/analytics/custom-reporting.md` | ~9.2k est / ~13.9k max |
| Predictive analytics (forecasting, churn) | `.ai-prompts/prompts/modules/analytics/predictive-analytics.md` | ~8.5k est / ~12.8k max |
| Privacy-preserving analytics (DP, aggregation) | `.ai-prompts/prompts/modules/analytics/privacy-analytics.md` | ~8.3k est / ~12.4k max |

## Design Research & UI Planning

| Intent | Module | Token budget |
|---|---|---|
| Mobbin / free public UI references / App Store screenshots / Play Store screenshots / product reference research / UI inspiration / app pattern research | `.ai-prompts/prompts/modules/design-research/mobbin-reference-intake.md` | ~1.6k est / ~2.5k max |
| UI reference source map / greenfield design context / design research schema | `.ai-prompts/prompts/modules/design-research/ui-reference-source-map.md` | ~1.9k est / ~2.8k max |
| Existing product UI extension / follow existing theme / preserve current styling / no redesign | `.ai-prompts/prompts/modules/design-research/mobbin-reference-intake.md` | ~1.6k est / ~2.5k max |
| Dashboard / admin dashboard / reporting dashboard / analytics console / operational panel | `.ai-prompts/prompts/modules/design-system/dashboard-screen-patterns.md` | ~958 est / ~1.4k max |
| Graph / chart / data visualization / data table with charts / KPI reporting | `.ai-prompts/prompts/modules/design-system/data-visualization-system.md` | ~893 est / ~1.3k max |
| Mobile app screen / app flow / screen-level UI / web app screen / frontend screen | `.ai-prompts/prompts/modules/design-research/mobbin-reference-intake.md` | ~1.6k est / ~2.5k max |
| Liquid glass / glassmorphism / native material surfaces / aesthetic animations | `.ai-prompts/prompts/modules/design-system/native-visual-effects-and-motion.md` | ~1.0k est / ~1.5k max |

## Performance

| Intent | Module | Token budget |
|---|---|---|
| Caching (in-memory, distributed, CDN, invalidation) | `.ai-prompts/prompts/modules/performance/caching-strategies.md` | ~5.1k est / ~7.7k max |
| Application performance monitoring (APM) | `.ai-prompts/prompts/modules/performance/performance-monitoring.md` | ~6.0k est / ~9.0k max |
| Resource optimization (memory, CPU, storage, network) | `.ai-prompts/prompts/modules/performance/resource-optimization.md` | ~5.2k est / ~7.8k max |
| Horizontal scaling / load balancing / sharding | `.ai-prompts/prompts/modules/performance/scalability-patterns.md` | ~4.9k est / ~7.4k max |

## Ops / Platform

| Intent | Module | Token budget |
|---|---|---|
| CI/CD | `.ai-prompts/prompts/modules/deployment/ci-cd-pipelines.md` | ~5.9k est / ~8.9k max |
| Containerization | `.ai-prompts/prompts/modules/deployment/containerization.md` | ~5.0k est / ~7.5k max |
| Kubernetes orchestration | `.ai-prompts/prompts/modules/deployment/kubernetes-orchestration.md` | ~7.5k est / ~11.2k max |
| Serverless at scale (Lambda, Cloud Run) | `.ai-prompts/prompts/modules/deployment/serverless-orchestration-scale.md` | ~11.6k est / ~17.4k max |
| Cloud hosting | `.ai-prompts/prompts/modules/deployment/cloud-deployment.md` | ~5.5k est / ~8.3k max |
| Google Cloud / GCP / Cloud Run / Cloud SQL / Spanner / Pub/Sub / VPC-SC / CMEK / Cloud Armor | `.ai-prompts/prompts/modules/technology-stacks/cloud-gcp.md` | ~1.5k est / ~2.2k max |
| Regulated cloud landing zone / project segmentation / data residency / non-prod synthetic data / privileged access | `.ai-prompts/prompts/modules/deployment/regulated-cloud-landing-zone.md` | ~598 est / ~897 max |
| Immutable audit evidence / WORM / locked logs / hash chains / evidence export / chain of custody | `.ai-prompts/prompts/modules/security/audit-evidence-worm.md` | ~640 est / ~960 max |
| Multi-cloud deployment strategies | `.ai-prompts/prompts/modules/deployment/multi-cloud-deployment-strategies.md` | ~975 est / ~1.5k max |
| Edge computing deployment (CDN workers, POPs) | `.ai-prompts/prompts/modules/deployment/edge-computing-deployment.md` | ~10.4k est / ~15.6k max |
| Zero-trust deployment architecture | `.ai-prompts/prompts/modules/deployment/zero-trust-deployment-architectures.md` | ~1.2k est / ~1.7k max |
| IaC evolution (Terraform → Pulumi → CDK patterns) | `.ai-prompts/prompts/modules/deployment/infrastructure-as-code-evolution.md` | ~994 est / ~1.5k max |
| GitOps advanced workflows (ArgoCD, Flux) | `.ai-prompts/prompts/modules/deployment/gitops-advanced-workflows.md` | ~967 est / ~1.5k max |
| Enterprise deployment (change windows, approvals) | `.ai-prompts/prompts/modules/deployment/enterprise-deployment.md` | ~5.7k est / ~8.6k max |
| Observability | `.ai-prompts/prompts/modules/deployment/monitoring-observability.md` | ~6.2k est / ~9.4k max |
| Disaster recovery | `.ai-prompts/prompts/modules/deployment/disaster-recovery.md` | ~5.5k est / ~8.3k max |

## Ops / Readiness (gap-closure / productionize)

For `audit-and-remediate.md` Step 3 when the gap is about taking an
existing codebase to production. Pick whichever is most specific to the gap.

| Intent | Module | Token budget |
|---|---|---|
| Production deployment readiness (secrets, envs, DNS, SSL) | `.ai-prompts/prompts/modules/deployment/environment-management.md` | ~5.2k est / ~7.7k max |
| CI/CD pipeline (build → test → deploy) | `.ai-prompts/prompts/modules/deployment/ci-cd-pipelines.md` | ~5.9k est / ~8.9k max |
| Container orchestration (k8s, ECS, Fargate) | `.ai-prompts/prompts/modules/deployment/kubernetes-deployment.md` | ~6.0k est / ~9.0k max |
| Blue/green, canary, feature flags | `.ai-prompts/prompts/modules/deployment/modern-deployment-patterns.md` | ~7.5k est / ~11.3k max |
| Observability (logs + metrics + traces + alerts) | `.ai-prompts/prompts/modules/deployment/monitoring-observability.md` | ~6.2k est / ~9.4k max |
| Disaster recovery / backups / RPO/RTO | `.ai-prompts/prompts/modules/deployment/disaster-recovery.md` | ~5.5k est / ~8.3k max |
| Zero-downtime migrations / rollback | `.ai-prompts/prompts/modules/deployment/modern-deployment-patterns.md` | ~7.5k est / ~11.3k max |
| Security audit / vulnerability scan | `.ai-prompts/prompts/modules/security/threat-detection.md` | ~5.6k est / ~8.4k max |
| Penetration testing scope | `.ai-prompts/prompts/modules/testing/security-testing.md` | ~1.2k est / ~1.8k max |
| Load / performance testing | `.ai-prompts/prompts/modules/testing/performance-testing.md` | ~1.1k est / ~1.6k max |
| Chaos engineering | `.ai-prompts/prompts/modules/testing/chaos-engineering.md` | ~7.1k est / ~10.6k max |
| Integration test coverage (backend API) | `.ai-prompts/prompts/modules/testing/test-automation.md` | ~5.5k est / ~8.3k max |
| Accessibility audit (WCAG) | `.ai-prompts/prompts/modules/testing/accessibility-testing.md` | ~8.6k est / ~12.9k max |
| Native mobile screenshot capture / app-store screenshots | `.ai-prompts/prompts/modules/testing/mobile-screenshot-ui-testing.md` | ~5.4k est / ~8.1k max |
| Mobile app store submission (iOS) | `.ai-prompts/prompts/modules/technology-stacks/ios-deployment-distribution.md` | ~7.4k est / ~11.1k max |
| Mobile app store submission (Android) | `.ai-prompts/prompts/modules/technology-stacks/kotlin-android-development.md` | ~11.0k est / ~16.5k max |
| Beta / TestFlight / internal testing | `.ai-prompts/prompts/modules/testing/test-automation.md` | ~5.5k est / ~8.3k max |
| iOS simulator / xcodebuild crash recovery (planning of test tasks) | `.ai-prompts/prompts/modules/harness-recovery/ios.md` | ~681 est / ~1.0k max |
| Android emulator / gradle daemon crash recovery | `.ai-prompts/prompts/modules/harness-recovery/android.md` | ~506 est / ~759 max |
| Web (Vitest / Jest / Playwright / Node) test harness crashes | `.ai-prompts/prompts/modules/harness-recovery/web.md` | ~555 est / ~833 max |
| Flutter test harness crash recovery | `.ai-prompts/prompts/modules/harness-recovery/flutter.md` | ~527 est / ~791 max |
| Bash / shell script crash recovery | `.ai-prompts/prompts/modules/harness-recovery/bash.md` | ~549 est / ~824 max |
| Documentation / runbook readiness | `.ai-prompts/prompts/modules/best-practices/coding-standards.md` | ~924 est / ~1.4k max |
| Compliance readiness (GDPR, HIPAA, PCI) | pick from the domain sections above (`healthcare/hipaa-compliance.md`, `commerce/payment-security.md`, `security/data-encryption.md`) | — |

## Design System (UI)

| Intent | Module | Token budget |
|---|---|---|
| Design tokens (architecture) | `.ai-prompts/prompts/modules/design-system/token-architecture.md` | ~566 est / ~849 max |
| Design tokens (generation pipeline — single source of truth across platforms) | `.ai-prompts/prompts/modules/design-system/token-generation-pipeline.md` | ~2.1k est / ~3.1k max |
| Component system | `.ai-prompts/prompts/modules/design-system/component-system.md` | ~639 est / ~959 max |
| Component implementation pattern (from tokens, no hardcoded styles) | `.ai-prompts/prompts/modules/design-system/component-implementation-pattern.md` | ~2.9k est / ~4.3k max |
| Design system HTML review artifact / style guide preview / component catalog review / user design feedback | `.ai-prompts/prompts/modules/design-system/design-system-review-artifact.md` | ~1.3k est / ~2.0k max |
| Loading states / skeletons / motion tokens | `.ai-prompts/prompts/modules/design-system/loading-states-and-animations.md` | ~4.8k est / ~7.2k max |
| Design-to-code validation | `.ai-prompts/prompts/modules/design-system/design-to-code-validation.md` | ~2.9k est / ~4.3k max |
| Design system governance / ownership / change control | `.ai-prompts/prompts/modules/design-system/governance-and-maintenance.md` | ~3.0k est / ~4.5k max |
| Screen fidelity / visual QA / reference source map | `.ai-prompts/prompts/modules/design-system/screen-fidelity-audit.md` | ~1.3k est / ~2.0k max |
| Design-system-first implementation sequencing | `.ai-prompts/prompts/modules/design-system/component-implementation-sequencing.md` | ~533 est / ~800 max |
| Dashboard shell / KPI cards / filters / tables | `.ai-prompts/prompts/modules/design-system/dashboard-screen-patterns.md` | ~958 est / ~1.4k max |
| Chart system / graph states / visualization accessibility | `.ai-prompts/prompts/modules/design-system/data-visualization-system.md` | ~893 est / ~1.3k max |
| Native visual effects / liquid glass / material motion / reduced-motion fallback | `.ai-prompts/prompts/modules/design-system/native-visual-effects-and-motion.md` | ~1.0k est / ~1.5k max |

## Cross-platform parity (web + mobile)

| Intent | Module | Token budget |
|---|---|---|
| Capability / feature-parity matrix across platforms | `.ai-prompts/prompts/modules/cross-platform/parity-matrix.md` | ~2.3k est / ~3.5k max |
| Shared API contracts + data models across platforms | `.ai-prompts/prompts/modules/cross-platform/shared-contracts.md` | ~7.7k est / ~11.5k max |
| Tests validating functional equivalence across platforms | `.ai-prompts/prompts/modules/cross-platform/parity-validation-tests.md` | ~1.3k est / ~1.9k max |
| Parity documentation for team visibility | `.ai-prompts/prompts/modules/cross-platform/parity-documentation.md` | ~4.0k est / ~6.1k max |
| Per-feature parity verification tasks | `.ai-prompts/prompts/modules/cross-platform/parity-verification-tasks.md` | ~4.2k est / ~6.3k max |
| Dry-run parity check (structural only, no full gen) | `.ai-prompts/prompts/modules/cross-platform/parity-dry-run.md` | ~3.0k est / ~4.5k max |

## Accessibility & Internationalization

| Intent | Module | Token budget |
|---|---|---|
| WCAG compliance / screen-reader / keyboard nav | `.ai-prompts/prompts/modules/accessibility/accessibility-compliance.md` | ~5.1k est / ~7.7k max |
| i18n / translation / RTL / locale formatting | `.ai-prompts/prompts/modules/accessibility/internationalization.md` | ~4.8k est / ~7.2k max |
| Regional customization / cultural adaptation | `.ai-prompts/prompts/modules/accessibility/cultural-adaptation.md` | ~4.7k est / ~7.1k max |
| Advanced responsive design (fluid type, container queries) | `.ai-prompts/prompts/modules/accessibility/responsive-design-advanced.md` | ~5.0k est / ~7.5k max |
| Responsive UI pattern (mobile-first, cross-device, a11y) | `.ai-prompts/prompts/modules/feature-patterns/ui-responsive.md` | ~6.9k est / ~10.3k max |

## Integration & APIs

| Intent | Module | Token budget |
|---|---|---|
| API management (versioning, keys, throttling) | `.ai-prompts/prompts/modules/integration/api-management.md` | ~6.1k est / ~9.1k max |
| Service integration (between internal services) | `.ai-prompts/prompts/modules/integration/service-integration.md` | ~6.6k est / ~9.9k max |
| Event-driven architecture (event bus, CQRS) | `.ai-prompts/prompts/modules/integration/event-driven-architecture.md` | ~5.6k est / ~8.3k max |
| Message queues (Kafka, RabbitMQ, SQS, pub-sub) | `.ai-prompts/prompts/modules/integration/message-queues.md` | ~6.1k est / ~9.1k max |
| Webhook systems (incoming + outgoing) | `.ai-prompts/prompts/modules/integration/webhook-systems.md` | ~5.0k est / ~7.5k max |
| Enterprise integration (ESB, iPaaS, legacy SOAP) | `.ai-prompts/prompts/modules/integration/enterprise-integration.md` | ~5.8k est / ~8.7k max |
| Integration monitoring (delivery, retries, DLQ) | `.ai-prompts/prompts/modules/integration/integration-monitoring.md` | ~6.4k est / ~9.6k max |

## Content Management

| Intent | Module | Token budget |
|---|---|---|
| Content creation (CMS authoring, rich text, media) | `.ai-prompts/prompts/modules/content-management/content-creation.md` | ~5.8k est / ~8.6k max |
| Content organisation (taxonomies, tags, collections) | `.ai-prompts/prompts/modules/content-management/content-organization.md` | ~7.4k est / ~11.0k max |
| Content workflow (draft → review → publish) | `.ai-prompts/prompts/modules/content-management/content-workflow.md` | ~9.4k est / ~14.1k max |
| Content versioning / history / rollback | `.ai-prompts/prompts/modules/content-management/content-versioning.md` | ~7.5k est / ~11.3k max |
| Content moderation (generic) | `.ai-prompts/prompts/modules/content-management/content-moderation.md` | ~6.1k est / ~9.2k max |
| Content security (DRM, access control) | `.ai-prompts/prompts/modules/content-management/content-security.md` | ~7.0k est / ~10.6k max |
| Content compliance (GDPR, takedowns) | `.ai-prompts/prompts/modules/content-management/content-compliance.md` | ~6.5k est / ~9.7k max |
| Content analytics (performance, engagement) | `.ai-prompts/prompts/modules/content-management/content-analytics.md` | ~5.7k est / ~8.6k max |

## Technology Stacks (pick when the project uses / targets this stack)

### Web

| Intent | Module | Token budget |
|---|---|---|
| React web app | `.ai-prompts/prompts/modules/technology-stacks/web-react.md` | ~7.8k est / ~11.6k max |
| Tailwind CSS / Tailwind theme / Tailwind UI implementation | `.ai-prompts/prompts/modules/technology-stacks/tailwind-css.md` | ~981 est / ~1.5k max |
| Progressive Web App (installable, offline) | `.ai-prompts/prompts/modules/technology-stacks/progressive-web-apps.md` | ~1.4k est / ~2.0k max |
| WebAssembly (perf-critical web features) | `.ai-prompts/prompts/modules/technology-stacks/webassembly.md` | ~3.5k est / ~5.3k max |

### Mobile

| Intent | Module | Token budget |
|---|---|---|
| Native iOS (Swift / SwiftUI) | `.ai-prompts/prompts/modules/technology-stacks/swift-ios-development.md` | ~8.4k est / ~12.6k max |
| iOS UI / UX patterns | `.ai-prompts/prompts/modules/technology-stacks/ios-ui-ux-patterns.md` | ~11.2k est / ~16.8k max |
| iOS performance optimisation | `.ai-prompts/prompts/modules/technology-stacks/ios-performance-optimization.md` | ~9.7k est / ~14.5k max |
| iOS testing (XCTest, XCUITest) | `.ai-prompts/prompts/modules/technology-stacks/ios-testing-comprehensive.md` | ~10.7k est / ~16.1k max |
| iOS deployment / App Store | `.ai-prompts/prompts/modules/technology-stacks/ios-deployment-distribution.md` | ~7.4k est / ~11.1k max |
| Native Android (Kotlin / Jetpack Compose) | `.ai-prompts/prompts/modules/technology-stacks/kotlin-android-development.md` | ~11.0k est / ~16.5k max |
| Cross-platform React Native | `.ai-prompts/prompts/modules/technology-stacks/mobile-react-native.md` | ~5.0k est / ~7.5k max |
| Cross-platform Flutter | `.ai-prompts/prompts/modules/technology-stacks/mobile-flutter.md` | ~526 est / ~789 max |
| Mobile OS capability matrix / OS permissions / unsupported native capability / memory cleanup constraints | `.ai-prompts/prompts/modules/technology-stacks/mobile-os-capability-matrix.md` | ~1.0k est / ~1.5k max |

### Backend

| Intent | Module | Token budget |
|---|---|---|
| Node.js / TypeScript backend (use per-intent modules above — no dedicated Node module) | — | — |
| Go microservices | `.ai-prompts/prompts/modules/technology-stacks/go-microservices.md` | ~8.8k est / ~13.3k max |
| Java Spring Boot | `.ai-prompts/prompts/modules/technology-stacks/java-spring-boot.md` | ~11.7k est / ~17.5k max |
| Python ecosystem (Django / FastAPI / Flask) | `.ai-prompts/prompts/modules/technology-stacks/python-ecosystem.md` | ~6.9k est / ~10.4k max |
| Ruby on Rails | `.ai-prompts/prompts/modules/technology-stacks/ruby-on-rails.md` | ~8.7k est / ~13.1k max |
| PHP ecosystem (Laravel, Symfony) | `.ai-prompts/prompts/modules/technology-stacks/php-ecosystem.md` | ~10.6k est / ~15.9k max |
| .NET ecosystem (C#, ASP.NET Core) | `.ai-prompts/prompts/modules/technology-stacks/dotnet-ecosystem.md` | ~11.5k est / ~17.3k max |
| Elixir / Phoenix web | `.ai-prompts/prompts/modules/technology-stacks/elixir-phoenix-web.md` | ~5.8k est / ~8.8k max |
| Scala functional programming | `.ai-prompts/prompts/modules/technology-stacks/scala-functional-programming.md` | ~10.9k est / ~16.3k max |
| Rust systems programming (high-perf services, CLI) | `.ai-prompts/prompts/modules/technology-stacks/rust-systems-programming.md` | ~6.4k est / ~9.6k max |
| C++ high-performance | `.ai-prompts/prompts/modules/technology-stacks/cpp-high-performance.md` | ~6.0k est / ~9.0k max |

### BaaS / Cloud

| Intent | Module | Token budget |
|---|---|---|
| Firebase backend-as-a-service | `.ai-prompts/prompts/modules/technology-stacks/backend-firebase.md` | ~497 est / ~746 max |
| AWS cloud (EC2, ECS, RDS, S3, Lambda) | `.ai-prompts/prompts/modules/technology-stacks/cloud-aws.md` | ~1.9k est / ~2.9k max |
| Google Cloud Platform / GCP (Cloud Run, Cloud SQL, Pub/Sub, Cloud Storage, BigQuery, VPC-SC, CMEK) | `.ai-prompts/prompts/modules/technology-stacks/cloud-gcp.md` | ~1.5k est / ~2.2k max |

### Desktop / specialised hardware

| Intent | Module | Token budget |
|---|---|---|
| Electron desktop app | `.ai-prompts/prompts/modules/technology-stacks/electron-desktop.md` | ~6.7k est / ~10.1k max |
| Tauri desktop app (lightweight alternative to Electron) | `.ai-prompts/prompts/modules/technology-stacks/tauri-desktop.md` | ~6.5k est / ~9.7k max |
| Apple CarPlay integration | `.ai-prompts/prompts/modules/technology-stacks/apple-carplay.md` | ~1.6k est / ~2.3k max |
| Android Auto integration | `.ai-prompts/prompts/modules/technology-stacks/android-auto.md` | ~1.3k est / ~2.0k max |

## Desktop Apps

| Intent | Module | Token budget |
|---|---|---|
| Native OS integrations (system APIs, protocol handlers) | `.ai-prompts/prompts/modules/desktop/native-integrations.md` | ~3.4k est / ~5.0k max |
| Desktop offline-first with sync + conflict resolution | `.ai-prompts/prompts/modules/desktop/offline-first.md` | ~2.5k est / ~3.7k max |

## Testing

| Intent | Module | Token budget |
|---|---|---|
| Test automation strategy | `.ai-prompts/prompts/modules/testing/test-automation.md` | ~5.5k est / ~8.3k max |
| Native mobile UI screenshot testing (iOS XCUITest / Android instrumentation) | `.ai-prompts/prompts/modules/testing/mobile-screenshot-ui-testing.md` | ~5.4k est / ~8.1k max |
| Property-based tests | `.ai-prompts/prompts/modules/testing/property-based-testing.md` | ~6.9k est / ~10.4k max |
| Centralized mock data | `.ai-prompts/prompts/modules/testing/centralized-mock-data.md` | ~5.4k est / ~8.1k max |
| Fake backend generator (local API doubles) | `.ai-prompts/prompts/modules/testing/fake-backend-generator.md` | ~1.3k est / ~1.9k max |
| Mock consolidation / DRY test fixtures | `.ai-prompts/prompts/modules/testing/mock-consolidation.md` | ~5.1k est / ~7.6k max |
| Mock validation (drift between real + mock) | `.ai-prompts/prompts/modules/testing/mock-validation.md` | ~5.2k est / ~7.8k max |
| Test data management (factories, fixtures, seeding) | `.ai-prompts/prompts/modules/testing/test-data-management.md` | ~5.2k est / ~7.9k max |
| Test management (plans, reports, traceability) | `.ai-prompts/prompts/modules/testing/test-management.md` | ~4.4k est / ~6.6k max |
| Cross-browser testing | `.ai-prompts/prompts/modules/testing/cross-browser-testing.md` | ~9.9k est / ~14.9k max |
| Domain-specific testing patterns | `.ai-prompts/prompts/modules/testing/domain-testing.md` | ~4.7k est / ~7.0k max |
| CI/CD testing (pipeline-integrated tests) | `.ai-prompts/prompts/modules/testing/ci-cd-testing.md` | ~4.3k est / ~6.4k max |
| Debug-menu integration (dev toggles in app) | `.ai-prompts/prompts/modules/testing/debug-menu-integration.md` | ~9.9k est / ~14.9k max |
| Quality metrics (coverage, flake rate, MTTR) | `.ai-prompts/prompts/modules/testing/quality-metrics.md` | ~4.5k est / ~6.7k max |

## Rules

- **Load modules by need.** If two or more intents apply to the current
  expansion, load the corresponding modules. If the module set grows because
  the feature is too broad, split the feature into smaller features/tasks.
- **If uncertain, skip module loading** rather than guessing. The engine can
  produce tasks from the epic/feature block alone.
- **A path listed here might not exist on disk** for edge cases. If the
  path resolves to a missing file, skip the module — do not substitute a
  different module from the catalog.
