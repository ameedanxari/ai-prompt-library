# AI Prompt Library v2 - Template Reference

## Overview

This document provides a comprehensive catalog of all templates available in the AI Prompt Library v2, organized by domain and category.

## Template Categories

### Domain Templates
Feature-specific templates for building application functionality.

### Cross-Cutting Templates
Templates that apply across multiple domains (security, analytics, testing).

### Integration Templates
Templates for connecting with external services and APIs.

---

## Commerce Domain

### Payment Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `commerce/payment-processing.md` | Multi-provider payment integration | Stripe, PayPal, Square; webhook handling; error recovery |
| `commerce/payment-security.md` | PCI compliance and fraud prevention | Tokenization; fraud detection; secure storage |
| `commerce/payment-methods.md` | Multiple payment options | Credit cards; digital wallets; bank transfers; crypto |
| `commerce/payment-subscriptions.md` | Recurring billing | Subscription plans; usage-based billing; dunning |

### Product Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `commerce/product-catalog.md` | Product management | Variants; categories; attributes; pricing |
| `commerce/inventory-management.md` | Stock tracking | Real-time inventory; reorder alerts; multi-warehouse |
| `commerce/product-search.md` | Product discovery | Full-text search; faceted filtering; recommendations |
| `commerce/product-reviews.md` | Review system | Ratings; moderation; verified purchases |

### Shopping Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `commerce/shopping-cart.md` | Cart management | Persistence; guest checkout; wishlists |
| `commerce/checkout-workflow.md` | Checkout process | Multi-step; address validation; shipping options |
| `commerce/order-management.md` | Order processing | Fulfillment; tracking; returns |
| `commerce/marketplace-features.md` | Multi-vendor support | Seller onboarding; commissions; payouts |

---

## Social Domain

### Profile Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `social/user-profiles.md` | User profiles | Customization; privacy controls; verification |
| `social/social-graphs.md` | Connections | Friends/followers; suggestions; blocking |
| `social/user-verification.md` | Identity verification | Badge systems; document verification |
| `social/social-discovery.md` | User discovery | Search; recommendations; mutual connections |

### Messaging Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `social/real-time-messaging.md` | Chat functionality | 1:1 and group chat; media sharing; typing indicators |
| `social/message-encryption.md` | E2E encryption | Key exchange; secure storage; forward secrecy |
| `social/voice-video-calls.md` | Audio/video calls | WebRTC; call management; recording |
| `social/communication-moderation.md` | Message moderation | Filtering; reporting; appeals |

### Content Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `social/content-feeds.md` | News feeds | Algorithmic; chronological; personalization |
| `social/content-creation.md` | Post creation | Rich media; stories; scheduling |
| `social/engagement-features.md` | Interactions | Likes; comments; shares; reactions |
| `social/content-moderation.md` | Content safety | Auto-moderation; human review; appeals |

---

## Location Services Domain

### Location Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `location-services/gps-tracking.md` | Real-time tracking | Live location; history; sharing |
| `location-services/map-integration.md` | Map services | Google Maps; Mapbox; custom tiles |
| `location-services/geofencing.md` | Location triggers | Entry/exit events; proximity alerts |
| `location-services/location-privacy.md` | Privacy controls | Consent; data retention; anonymization |

### On-Demand Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `location-services/service-matching.md` | Provider matching | Availability; proximity; ratings |
| `location-services/booking-management.md` | Appointments | Scheduling; reminders; cancellation |
| `location-services/dynamic-pricing.md` | Surge pricing | Demand-based; time-based; zone-based |
| `location-services/fleet-management.md` | Vehicle tracking | Driver management; maintenance; dispatch |

---

## Media Streaming Domain

### Content Delivery Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `media-streaming/cdn-integration.md` | CDN setup | Multi-CDN; edge caching; adaptive streaming |
| `media-streaming/media-processing.md` | Transcoding | Format conversion; quality variants; thumbnails |
| `media-streaming/offline-sync.md` | Offline access | Download management; sync; DRM |
| `media-streaming/streaming-quality.md` | Quality optimization | Adaptive bitrate; buffering; bandwidth detection |

### Discovery Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `media-streaming/playlist-management.md` | Playlists | Creation; collaboration; smart playlists |
| `media-streaming/recommendation-engine.md` | Recommendations | Collaborative filtering; content-based; hybrid |
| `media-streaming/content-search.md` | Search | Full-text; voice; visual search |
| `media-streaming/artist-creator-tools.md` | Creator features | Upload; analytics; monetization |

---

## Fintech Domain

### Account Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `fintech/account-management.md` | Account lifecycle | KYC/AML; verification; linking |
| `fintech/transaction-processing.md` | Payments | Processing; reconciliation; disputes |
| `fintech/fraud-detection.md` | Fraud prevention | Real-time scoring; rules engine; ML models |
| `fintech/financial-reporting.md` | Compliance | Regulatory reports; audit trails; SAR/CTR |

### Investment Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `fintech/investment-management.md` | Portfolio management | Holdings; performance; rebalancing |
| `fintech/lending-platform.md` | Loan origination | Applications; underwriting; servicing |
| `fintech/credit-scoring.md` | Risk assessment | Credit models; alternative data; decisioning |
| `fintech/budgeting-tools.md` | Personal finance | Expense tracking; budgets; goals |

---

## Healthcare Domain

### Patient Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `healthcare/patient-data-management.md` | Patient records | Demographics; history; consent |
| `healthcare/medical-records.md` | EHR integration | HL7 FHIR; data exchange; interoperability |
| `healthcare/hipaa-compliance.md` | HIPAA controls | Privacy; security; breach notification |
| `healthcare/healthcare-security.md` | Security measures | Encryption; access control; audit |

### Care Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `healthcare/telemedicine.md` | Virtual visits | Video consultations; secure messaging |
| `healthcare/appointment-scheduling.md` | Scheduling | Calendar integration; reminders; waitlists |
| `healthcare/prescription-management.md` | E-prescribing | Drug interactions; pharmacy integration |
| `healthcare/wearable-integration.md` | Device connectivity | Health data sync; monitoring |

---

## Enterprise SaaS Domain

### Multi-Tenancy Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `enterprise-saas/multi-tenancy.md` | Tenant isolation | Data segregation; custom domains |
| `enterprise-saas/rbac-enterprise.md` | Access control | Roles; permissions; hierarchies |
| `enterprise-saas/sso-integration.md` | Single sign-on | SAML; OIDC; directory sync |
| `enterprise-saas/audit-trails.md` | Audit logging | Comprehensive logging; retention; export |

### Business Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `enterprise-saas/enterprise-billing.md` | Billing | Subscriptions; usage; invoicing |
| `enterprise-saas/workflow-automation.md` | Workflows | Approval chains; triggers; automation |
| `enterprise-saas/api-management.md` | API gateway | Rate limiting; versioning; documentation |
| `enterprise-saas/white-labeling.md` | Customization | Branding; theming; configuration |

---

## Real-Time Communication Domain

### Infrastructure Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `real-time-communication/websocket-management.md` | WebSocket handling | Connection pooling; scaling; heartbeats |
| `real-time-communication/message-queuing.md` | Message delivery | Persistence; ordering; acknowledgments |
| `real-time-communication/presence-systems.md` | Online status | Activity indicators; custom status |
| `real-time-communication/real-time-sync.md` | Data sync | Conflict resolution; offline support |

### Streaming Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `real-time-communication/live-streaming.md` | Live broadcasts | Ingest; distribution; chat |
| `real-time-communication/video-conferencing.md` | Video calls | Multi-party; screen sharing; recording |
| `real-time-communication/live-events.md` | Event broadcasting | Audience interaction; Q&A |
| `real-time-communication/streaming-analytics.md` | Stream metrics | Viewer counts; engagement; quality |

---

## Search & Discovery Domain

### Search Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `search-discovery/full-text-search.md` | Text search | Indexing; relevance; highlighting |
| `search-discovery/faceted-search.md` | Filtering | Facets; ranges; aggregations |
| `search-discovery/semantic-search.md` | AI search | NLP; embeddings; intent detection |
| `search-discovery/search-analytics.md` | Search insights | Query analysis; zero results; optimization |

### Discovery Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `search-discovery/recommendation-systems.md` | Recommendations | Collaborative; content-based; hybrid |
| `search-discovery/visual-search.md` | Image search | Recognition; similarity; tagging |
| `search-discovery/voice-search.md` | Voice queries | Speech recognition; NLU |
| `search-discovery/search-personalization.md` | Personalization | User profiles; behavior; preferences |

---

## Content Management Domain

### Content Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `content-management/content-creation.md` | Content authoring | Rich text; media; templates |
| `content-management/content-organization.md` | Organization | Categories; tags; hierarchies |
| `content-management/content-versioning.md` | Version control | History; drafts; rollback |
| `content-management/content-workflow.md` | Publishing | Approval; scheduling; distribution |

### Moderation Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `content-management/content-moderation.md` | Moderation | Auto-filtering; human review; appeals |
| `content-management/content-security.md` | Security | Encryption; access control; DRM |
| `content-management/content-compliance.md` | Compliance | Legal holds; retention; GDPR |
| `content-management/content-analytics.md` | Analytics | Performance; engagement; insights |

---

## Analytics Domain

### User Analytics Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `analytics/user-analytics.md` | Behavior tracking | Events; funnels; sessions |
| `analytics/cohort-analysis.md` | Cohorts | Segmentation; retention; LTV |
| `analytics/ab-testing.md` | Experiments | Test design; statistical analysis |
| `analytics/privacy-analytics.md` | Privacy-compliant | Consent; anonymization; GDPR |

### Business Analytics Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `analytics/business-metrics.md` | KPIs | Dashboards; alerts; trends |
| `analytics/predictive-analytics.md` | Forecasting | ML models; predictions; scoring |
| `analytics/custom-reporting.md` | Reports | Builder; scheduling; export |
| `analytics/real-time-analytics.md` | Live data | Streaming; instant alerts |

---

## Gamification Domain

### Engagement Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `gamification/point-systems.md` | Points | Earning; spending; expiration |
| `gamification/achievement-systems.md` | Achievements | Badges; progress; unlocks |
| `gamification/leaderboards.md` | Rankings | Global; friends; seasonal |
| `gamification/progression-systems.md` | Levels | XP; skill trees; milestones |

### Social Gamification Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `gamification/social-challenges.md` | Challenges | Team; individual; time-limited |
| `gamification/reward-systems.md` | Rewards | Catalog; redemption; tiers |
| `gamification/streak-tracking.md` | Streaks | Daily; recovery; bonuses |
| `gamification/engagement-psychology.md` | Motivation | Behavioral design; habit formation |

---

## Security Domain

### Authentication Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `security/multi-factor-auth.md` | MFA | TOTP; SMS; biometric; hardware keys |
| `security/advanced-authorization.md` | Authorization | ABAC; dynamic policies; delegation |
| `security/adaptive-authentication.md` | Risk-based auth | Device trust; behavior analysis |
| `security/identity-federation.md` | Federation | Cross-domain; trust relationships |

### Data Protection Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `security/data-encryption.md` | Encryption | At-rest; in-transit; key management |
| `security/privacy-controls.md` | Privacy | Consent; portability; deletion |
| `security/threat-detection.md` | Threat detection | Anomaly detection; SIEM integration |
| `security/zero-trust-architecture.md` | Zero trust | Continuous verification; microsegmentation |

---

## IoT Domain

### Device Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `iot/device-connectivity.md` | Connectivity | Discovery; pairing; protocols |
| `iot/device-management.md` | Management | Monitoring; firmware; remote control |
| `iot/iot-security.md` | Security | Certificates; secure boot; encryption |
| `iot/edge-computing.md` | Edge processing | Local compute; sync; offline |

### Data Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `iot/sensor-data-processing.md` | Data ingestion | Time-series; aggregation; storage |
| `iot/iot-automation.md` | Automation | Rules; triggers; scenes |
| `iot/industrial-iot.md` | Industrial | OT protocols; safety; compliance |
| `iot/iot-analytics.md` | Analytics | Predictive maintenance; anomaly detection |

---

## Blockchain Domain

### Web3 Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `blockchain/wallet-integration.md` | Wallets | Connection; signing; multi-wallet |
| `blockchain/smart-contracts.md` | Contracts | Deployment; interaction; upgrades |
| `blockchain/token-management.md` | Tokens | Creation; transfers; staking |
| `blockchain/nft-functionality.md` | NFTs | Minting; trading; metadata |

### DeFi Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `blockchain/defi-protocols.md` | DeFi | Liquidity; yield; DEX |
| `blockchain/governance-systems.md` | Governance | Voting; proposals; delegation |
| `blockchain/cross-chain.md` | Cross-chain | Bridges; multi-chain support |
| `blockchain/enterprise-blockchain.md` | Enterprise | Private networks; permissioned |

---

## Notification Domain

### Channel Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `notifications/notification-channels.md` | Multi-channel | Email; SMS; push; in-app |
| `notifications/notification-personalization.md` | Personalization | Timing; content; preferences |
| `notifications/notification-compliance.md` | Compliance | Opt-in/out; GDPR; CAN-SPAM |
| `notifications/notification-analytics.md` | Analytics | Delivery; engagement; optimization |

### Advanced Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `notifications/rich-notifications.md` | Rich content | Interactive; deep links; media |
| `notifications/communication-automation.md` | Automation | Triggers; drip campaigns; workflows |
| `notifications/enterprise-communications.md` | Enterprise | Approval; branding; compliance |
| `notifications/real-time-notifications.md` | Real-time | Instant delivery; presence |

---

## Data Processing Domain

### Ingestion Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `data-processing/data-ingestion.md` | Ingestion | Batch; streaming; CDC |
| `data-processing/data-transformation.md` | ETL | Cleaning; normalization; enrichment |
| `data-processing/data-quality.md` | Quality | Profiling; validation; monitoring |
| `data-processing/data-governance.md` | Governance | Catalog; lineage; policies |

### Big Data Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `data-processing/big-data-processing.md` | Big data | Distributed; Spark; Flink |
| `data-processing/data-pipelines.md` | Pipelines | Orchestration; monitoring; recovery |
| `data-processing/data-security.md` | Security | Encryption; masking; access |
| `data-processing/scalable-architectures.md` | Scalability | Partitioning; optimization |

---

## Testing Domain

### Test Automation Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `testing/test-automation.md` | Automation | Unit; integration; E2E |
| `testing/test-data-management.md` | Test data | Generation; cleanup; fixtures |
| `testing/performance-testing.md` | Performance | Load; stress; scalability |
| `testing/security-testing.md` | Security | Vulnerability; penetration; SAST/DAST |

### Quality Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `testing/quality-metrics.md` | Metrics | Coverage; quality gates |
| `testing/test-management.md` | Management | Planning; execution; reporting |
| `testing/ci-cd-testing.md` | CI/CD | Pipeline integration; automation |
| `testing/domain-testing.md` | Domain-specific | Compliance; specialized testing |

---

## Deployment Domain

### Infrastructure Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `deployment/containerization.md` | Containers | Docker; best practices; optimization |
| `deployment/kubernetes-deployment.md` | Kubernetes | Orchestration; service mesh; scaling |
| `deployment/cloud-deployment.md` | Cloud | Multi-cloud; IaC; cost optimization |
| `deployment/monitoring-observability.md` | Observability | Metrics; logs; traces; alerting |

### Operations Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `deployment/ci-cd-pipelines.md` | CI/CD | Build; test; deploy automation |
| `deployment/environment-management.md` | Environments | Provisioning; configuration; secrets |
| `deployment/disaster-recovery.md` | DR | Backup; failover; RTO/RPO |
| `deployment/enterprise-deployment.md` | Enterprise | Compliance; governance; security |

---

## Integration Domain

### API Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `integration/api-management.md` | API gateway | Rate limiting; versioning; docs |
| `integration/webhook-systems.md` | Webhooks | Delivery; retry; security |
| `integration/message-queues.md` | Messaging | Queues; topics; dead letters |
| `integration/service-integration.md` | Services | Discovery; health; circuit breakers |

### Enterprise Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `integration/event-driven-architecture.md` | Events | Event sourcing; CQRS; streaming |
| `integration/data-synchronization.md` | Sync | Real-time; batch; conflict resolution |
| `integration/enterprise-integration.md` | Enterprise | ESB; B2B; EDI |
| `integration/integration-monitoring.md` | Monitoring | Metrics; tracing; alerting |

---

## Cross-Cutting Templates

### Performance Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `performance/caching-strategies.md` | Caching | Application; database; CDN |
| `performance/performance-monitoring.md` | APM | Profiling; bottleneck detection |
| `performance/scalability-patterns.md` | Scaling | Horizontal; vertical; auto-scaling |
| `performance/resource-optimization.md` | Optimization | Memory; CPU; storage |

### Accessibility Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `accessibility/accessibility-compliance.md` | WCAG | Screen readers; keyboard; contrast |
| `accessibility/internationalization.md` | i18n | Localization; RTL; date/number formats |
| `accessibility/cultural-adaptation.md` | Cultural | Regional customization; compliance |
| `accessibility/responsive-design-advanced.md` | Responsive | Complex layouts; adaptive UX |

### Template Composition Templates

| Template | Purpose | Key Features |
|----------|---------|--------------|
| `template-composition/composition-rules.md` | Rules | Compatibility; conflicts; resolution |
| `template-composition/template-validation.md` | Validation | Structure; parameters; quality |
| `template-composition/template-dependencies.md` | Dependencies | Resolution; versioning |
| `template-composition/composition-optimization.md` | Optimization | Redundancy; performance |

---

## Template Selection Guide

### By Application Type

| Application Type | Primary Templates |
|------------------|-------------------|
| E-commerce | Commerce, Analytics, Notifications |
| Social Network | Social, Real-Time Communication, Content Management |
| Fintech | Fintech, Security, Enterprise SaaS |
| Healthcare | Healthcare, Security, Notifications |
| SaaS Platform | Enterprise SaaS, Analytics, Integration |
| IoT Platform | IoT, Real-Time Communication, Analytics |
| Media Platform | Media Streaming, Content Management, Search |

### By Compliance Requirement

| Requirement | Required Templates |
|-------------|-------------------|
| PCI DSS | `commerce/payment-security.md`, `security/data-encryption.md` |
| HIPAA | `healthcare/hipaa-compliance.md`, `healthcare/healthcare-security.md` |
| GDPR | `security/privacy-controls.md`, `analytics/privacy-analytics.md` |
| SOC 2 | `enterprise-saas/audit-trails.md`, `security/threat-detection.md` |

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2026-01 | Initial v2 release with 150+ templates |
