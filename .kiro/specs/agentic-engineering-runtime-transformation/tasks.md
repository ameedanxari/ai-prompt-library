# Tasks for Agentic Engineering Runtime Transformation

_All tasks completed as of 2026-05-13. Every phase from the Strategic Roadmap has been implemented with concrete files, tests, and integration contracts._

## Phase 1: Requirements Generation
- [x] Generate Requirements from Design
- [x] Create Correctness Properties with Requirements References in Design Document
- [x] Update Correctness Properties with Requirements References in Design Document

## Phase 2: Implementation Planning
- [x] Create implementation tasks based on requirements
- [x] Define component interfaces and contracts
- [x] Establish testing strategy and validation criteria

## Phase 3: Component Development

### Phase 3.1: Formal Skill System (Phase 1 of Transformation)
- [x] **File:** `src/skill-system/skill-definition.ts`
  - **Change type:** New file
  - **Test:** Unit tests for skill definition validation
  - **Description:** Define SkillDefinition interface with id, name, version, description, category, inputSchema, outputSchema, dependencies, qualityMetrics, implementation, tests, examples
  - **Validates:** Requirements 2.1, 2.4

- [x] **File:** `src/skill-system/skill-graph.ts`
  - **Change type:** New file
  - **Test:** Unit tests for skill registration and discovery
  - **Description:** Implement SkillGraph interface with registerSkill, findSkills, resolveDependencies, getSkillImplementation methods
  - **Validates:** Requirements 2.2, 2.3, 2.5

- [x] **File:** `src/skill-system/skill-repository.ts`
  - **Change type:** New file
  - **Test:** Integration tests for skill persistence
  - **Description:** Implement skill storage with versioning, metadata indexing, and dependency resolution
  - **Validates:** Requirements 2.1, 2.4

- [x] **File:** `src/skill-system/skill-composition-engine.ts`
  - **Change type:** New file
  - **Test:** Property tests for skill composition commutativity
  - **Description:** Implement skill composition with dependency validation and input/output schema compatibility checking
  - **Validates:** Requirements 2.3, 2.4

### Phase 3.2: Repository Memory & Retrieval (Phase 2 of Transformation)
- [x] **File:** `src/memory/artifact-storage.ts`
  - **Change type:** New file
  - **Test:** Unit tests for artifact CRUD operations
  - **Description:** Implement artifact storage with versioning, metadata, and content-addressable storage
  - **Validates:** Requirements 5.4, 14.4

- [x] **File:** `src/memory/semantic-search.ts`
  - **Change type:** New file
  - **Test:** Integration tests for semantic search accuracy
  - **Description:** Implement semantic search over artifacts using embeddings and vector similarity
  - **Validates:** Requirements 2.2, 5.4

- [x] **File:** `src/memory/context-manager.ts`
  - **Change type:** New file
  - **Test:** Unit tests for context window management
  - **Description:** Implement context-aware memory management with relevance scoring and pruning
  - **Validates:** Requirements 1.2, 5.4

- [x] **File:** `src/memory/persistence-service.ts`
  - **Change type:** New file
  - **Test:** Integration tests for persistence and recovery
  - **Description:** Implement memory persistence with synchronization and conflict resolution
  - **Validates:** Requirements 11.3, 11.4

### Phase 3.3: Closed-Loop Execution (Phase 3 of Transformation)
- [x] **File:** `src/execution/execution-runtime.ts`
  - **Change type:** New file
  - **Test:** Unit tests for skill execution and state management
  - **Description:** Implement ExecutionRuntime interface with executePlan, executeSkill, rollback, checkpoint methods
  - **Validates:** Requirements 4.1, 4.2, 4.3, 4.4, 4.5

- [x] **File:** `src/execution/execution-monitor.ts`
  - **Change type:** New file
  - **Test:** Integration tests for execution monitoring
  - **Description:** Implement real-time execution monitoring with metric collection and anomaly detection
  - **Validates:** Requirements 5.1, 5.2, 5.3

- [x] **File:** `src/execution/repair-loop.ts`
  - **Change type:** New file
  - **Test:** Unit tests for automated repair generation
  - **Description:** Implement RepairLoop interface with applyFix, generatePatch, testFix, integrateFix methods
  - **Validates:** Requirements 7.1, 7.2, 7.3, 7.4, 7.5

- [x] **File:** `src/execution/quality-gate-enforcer.ts`
  - **Change type:** New file
  - **Test:** Integration tests for quality gate enforcement
  - **Description:** Implement quality gate checking with configurable thresholds and enforcement actions
  - **Validates:** Requirements 3.5, 5.5, 6.1

### Phase 3.4: Critic & Review Agents (Phase 4 of Transformation)
- [x] **File:** `src/critics/critic-agent.ts`
  - **Change type:** New file
  - **Test:** Unit tests for quality assessment
  - **Description:** Implement CriticAgent interface with critiqueResult, identifyIssues, suggestImprovements, validateOutput methods
  - **Validates:** Requirements 6.1, 6.2, 6.3

- [x] **File:** `src/critics/multi-perspective-critic.ts`
  - **Change type:** New file
  - **Test:** Integration tests for multi-perspective analysis
  - **Description:** Implement critic system with security, performance, maintainability, and architectural perspectives
  - **Validates:** Requirements 6.3, 10.4

- [x] **File:** `src/critics/consensus-engine.ts`
  - **Change type:** New file
  - **Test:** Property tests for consensus algorithm consistency
  - **Description:** Implement consensus algorithm for resolving critic disagreements with confidence scoring
  - **Validates:** Requirements 6.4, 6.5

- [x] **File:** `src/critics/learning-critic.ts`
  - **Change type:** New file
  - **Test:** Integration tests for learning from historical critiques
  - **Description:** Implement critic that learns from historical data to improve assessment accuracy
  - **Validates:** Requirements 6.5, 14.4

### Phase 3.5: Architectural Continuity Layer (Phase 5 of Transformation)
- [x] **File:** `src/architecture/constraint-enforcer.ts`
  - **Change type:** New file
  - **Test:** Unit tests for architectural constraint validation
  - **Description:** Implement architectural constraint enforcement with pattern validation and consistency checking
  - **Validates:** Requirements 8.2, 8.3, 8.5

- [x] **File:** `src/architecture/pattern-recognizer.ts`
  - **Change type:** New file
  - **Test:** Integration tests for design pattern recognition
  - **Description:** Implement design pattern recognition and application with context-aware suggestions
  - **Validates:** Requirements 1.5, 8.1

- [x] **File:** `src/architecture/consistency-checker.ts`
  - **Change type:** New file
  - **Test:** Property tests for consistency checking
  - **Description:** Implement consistency checking across components with interface validation and dependency analysis
  - **Validates:** Requirements 8.3, 8.5

- [x] **File:** `src/architecture/decision-recorder.ts`
  - **Change type:** New file
  - **Test:** Integration tests for decision recording and retrieval
  - **Description:** Implement architectural decision recording with rationale, alternatives, and impact analysis
  - **Validates:** Requirements 5.4, 14.4

### Phase 3.6: Runtime Environment Awareness (Phase 6 of Transformation)
- [x] **File:** `src/environment/environment-detector.ts`
  - **Change type:** New file
  - **Test:** Unit tests for environment detection
  - **Description:** Implement environment detection with platform identification and capability assessment
  - **Validates:** Requirements 9.3, 9.5

- [x] **File:** `src/environment/resource-monitor.ts`
  - **Change type:** New file
  - **Test:** Integration tests for resource monitoring
  - **Description:** Implement resource monitoring with usage tracking, limit detection, and optimization suggestions
  - **Validates:** Requirements 5.1, 9.4, 11.5

- [x] **File:** `src/environment/platform-optimizer.ts`
  - **Change type:** New file
  - **Test:** Performance tests for platform-specific optimizations
  - **Description:** Implement platform-specific optimizations with adaptive strategies and performance profiling
  - **Validates:** Requirements 9.2, 9.5

- [x] **File:** `src/environment/deployment-configurator.ts`
  - **Change type:** New file
  - **Test:** Integration tests for deployment configuration
  - **Description:** Implement deployment environment configuration with validation and optimization
  - **Validates:** Requirements 8.4, 9.3

### Phase 3.7: High-Level Intent Translation (Phase 7 of Transformation)
- [x] **File:** `src/intent/intent-parser.ts`
  - **Change type:** New file
  - **Test:** Unit tests for natural language understanding
  - **Description:** Implement IntentParser interface with parseIntent, extractRequirements, identifyConstraints methods
  - **Validates:** Requirements 1.1, 1.2, 1.4, 1.5

- [x] **File:** `src/intent/requirement-extractor.ts`
  - **Change type:** New file
  - **Test:** Integration tests for requirement extraction accuracy
  - **Description:** Implement requirement extraction with technical specification generation and quality attribute identification
  - **Validates:** Requirements 1.1, 1.2, 1.4

- [x] **File:** `src/intent/domain-processor.ts`
  - **Change type:** New file
  - **Test:** Unit tests for domain concept mapping
  - **Description:** Implement domain-specific language processing with concept mapping and constraint application
  - **Validates:** Requirements 1.2, 15.3

- [x] **File:** `src/intent/dialogue-manager.ts`
  - **Change type:** New file
  - **Test:** Integration tests for structured dialogue
  - **Description:** Implement intent refinement through structured dialogue with clarification requests and context management
  - **Validates:** Requirements 1.3, 13.2, 13.3

### Phase 3.8: Planning Agent (Core Component)
- [x] **File:** `src/planning/planning-agent.ts`
  - **Change type:** New file
  - **Test:** Unit tests for plan generation
  - **Description:** Implement PlanningAgent interface with createPlan, decomposeTask, resolveDependencies, optimizePlan methods
  - **Validates:** Requirements 3.1, 3.2, 3.3, 3.4, 3.5

- [x] **File:** `src/planning/task-decomposer.ts`
  - **Change type:** New file
  - **Test:** Integration tests for task decomposition
  - **Description:** Implement task decomposition with dependency analysis and skill requirement identification
  - **Validates:** Requirements 3.1, 3.3

- [x] **File:** `src/planning/plan-optimizer.ts`
  - **Change type:** New file
  - **Test:** Property tests for plan optimization idempotence
  - **Description:** Implement plan optimization with performance metrics and resource constraint consideration
  - **Validates:** Requirements 3.2, 3.4, 3.5

- [x] **File:** `src/planning/dependency-resolver.ts`
  - **Change type:** New file
  - **Test:** Unit tests for dependency resolution
  - **Description:** Implement dependency resolution with conflict detection and circular reference prevention
  - **Validates:** Requirements 3.3, 4.3

### Phase 3.9: Integration Layer (Core Component)
- [x] **File:** `src/integration/integration-layer.ts`
  - **Change type:** New file
  - **Test:** Unit tests for component integration
  - **Description:** Implement IntegrationLayer interface with integrateComponent, resolveConflicts, validateIntegration, generateDocumentation methods
  - **Validates:** Requirements 8.1, 8.2, 8.3, 8.4, 8.5

- [x] **File:** `src/integration/conflict-resolver.ts`
  - **Change type:** New file
  - **Test:** Integration tests for conflict resolution
  - **Description:** Implement conflict resolution with merge strategies and compatibility checking
  - **Validates:** Requirements 8.2, 8.5

- [x] **File:** `src/integration/consistency-validator.ts`
  - **Change type:** New file
  - **Test:** Property tests for system consistency validation
  - **Description:** Implement system consistency validation with interface checking and backward compatibility verification
  - **Validates:** Requirements 8.3, 8.5, 12.1

- [x] **File:** `src/integration/documentation-generator.ts`
  - **Change type:** New file
  - **Test:** Integration tests for documentation generation
  - **Description:** Implement documentation generation with API documentation, usage examples, and deployment guides
  - **Validates:** Requirements 8.4, 13.4

### Phase 3.10: Observation Layer (Core Component)
- [x] **File:** `src/observation/observation-layer.ts`
  - **Change type:** New file
  - **Test:** Unit tests for metric collection
  - **Description:** Implement ObservationLayer interface with observeExecution, detectAnomalies, collectMetrics, generateInsights methods
  - **Validates:** Requirements 5.1, 5.2, 5.3, 5.4, 5.5

- [x] **File:** `src/observation/metric-collector.ts`
  - **Change type:** New file
  - **Test:** Integration tests for comprehensive metric collection
  - **Description:** Implement metric collection with timing, resource usage, success rates, and quality metrics
  - **Validates:** Requirements 5.1, 5.4, 14.4

- [x] **File:** `src/observation/anomaly-detector.ts`
  - **Change type:** New file
  - **Test:** Unit tests for anomaly detection
  - **Description:** Implement anomaly detection with statistical analysis, pattern recognition, and alert triggering
  - **Validates:** Requirements 5.2, 5.3, 5.5, 14.2

- [x] **File:** `src/observation/insight-generator.ts`
  - **Change type:** New file
  - **Test:** Integration tests for insight generation
  - **Description:** Implement insight generation with trend analysis, optimization suggestions, and predictive alerts
  - **Validates:** Requirements 5.3, 5.5, 14.3

### Phase 3.11: Production Reliability (Phase 8 of Transformation)
- [x] **File:** `src/reliability/confidence-scorer.ts`
  - **Change type:** New file
  - **Test:** Unit tests for confidence calculation
  - **Description:** Implement confidence scoring for generated code based on test results, static analysis, and critic feedback
  - **Validates:** Roadmap Phase 8

- [x] **File:** `src/reliability/regression-tester.ts`
  - **Change type:** New file
  - **Test:** Integration tests for regression detection
  - **Description:** Implement automated regression testing against baseline implementations and historical results
  - **Validates:** Roadmap Phase 8

- [x] **File:** `src/reliability/pipeline-gatekeeper.ts`
  - **Change type:** New file
  - **Test:** Unit tests for gatekeeping logic
  - **Description:** Implement strict green-pipeline requirements before completion and deployment
  - **Validates:** Roadmap Phase 8

- [x] **File:** `src/reliability/rollback-coordinator.ts`
  - **Change type:** New file
  - **Test:** Integration tests for rollback procedures
  - **Description:** Implement rollback and repair semantics for failed production deployments
  - **Validates:** Roadmap Phase 8

## Phase 4: Integration and Testing

### Phase 4.1: Core System Integration
- [x] **File:** `src/agentic-runtime.ts`
  - **Change type:** New file
  - **Test:** Integration tests for end-to-end workflow
  - **Description:** Implement main AgenticRuntime class that orchestrates all components and provides public API
  - **Validates:** Requirements 9.1, 9.2, 12.1, 12.2

- [x] **File:** `src/coordination/orchestrator.ts`
  - **Change type:** New file
  - **Test:** Unit tests for component coordination
  - **Description:** Implement component coordination with workflow management and error handling
  - **Validates:** Requirements 4.1, 4.2, 4.3, 11.1

- [x] **File:** `src/coordination/state-manager.ts`
  - **Change type:** New file
  - **Test:** Integration tests for state management
  - **Description:** Implement global state management with persistence, recovery, and consistency guarantees
  - **Validates:** Requirements 4.3, 11.3, 11.4

- [x] **File:** `src/coordination/event-bus.ts`
  - **Change type:** New file
  - **Test:** Performance tests for event handling
  - **Description:** Implement event bus for component communication with pub/sub pattern and error handling
  - **Validates:** Requirements 9.1, 9.2, 11.1

### Phase 4.2: Security Integration
- [x] **File:** `src/security/input-validator.ts`
  - **Change type:** New file
  - **Test:** Security tests for input validation
  - **Description:** Implement input validation with security vulnerability detection and sanitization
  - **Validates:** Requirements 10.1, 10.2, 10.3

- [x] **File:** `src/security/access-controller.ts`
  - **Change type:** New file
  - **Test:** Unit tests for access control
  - **Description:** Implement role-based access control with fine-grained permissions and audit logging
  - **Validates:** Requirements 10.2, 10.5, 14.1

- [x] **File:** `src/security/encryption-service.ts`
  - **Change type:** New file
  - **Test:** Integration tests for encryption/decryption
  - **Description:** Implement encryption for sensitive data at rest and in transit with key management
  - **Validates:** Requirements 10.2, 10.3

- [x] **File:** `src/security/audit-logger.ts`
  - **Change type:** New file
  - **Test:** Compliance tests for audit logging
  - **Description:** Implement comprehensive audit logging with tamper-evident records and security incident reporting
  - **Validates:** Requirements 10.5, 14.1

### Phase 4.3: Testing Framework Implementation
- [x] **File:** `tests/integration-tests/end-to-end-workflow.test.ts`
  - **Change type:** New file
  - **Test:** End-to-end integration test
  - **Description:** Implement complete prompt-to-production workflow test with validation of all components
  - **Validates:** All requirements

- [x] **File:** `tests/property-tests/skill-composition.test.ts`
  - **Change type:** New file
  - **Test:** Property-based tests
  - **Description:** Implement property tests for skill composition commutativity and other key properties
  - **Validates:** Design correctness properties

- [x] **File:** `tests/performance-tests/load-testing.test.ts`
  - **Change type:** New file
  - **Test:** Performance and load tests
  - **Description:** Implement load testing with simulated concurrent requests and performance benchmarking
  - **Validates:** Requirements 9.1, 9.2, 9.3, 9.4, 9.5

- [x] **File:** `tests/security-tests/vulnerability-testing.test.ts`
  - **Change type:** New file
  - **Test:** Security penetration tests
  - **Description:** Implement security testing with vulnerability scanning and attack simulation
  - **Validates:** Requirements 10.1, 10.2, 10.3, 10.4, 10.5

### Phase 4.4: Validation and Quality Assurance
- [x] **File:** `src/validation/requirement-validator.ts`
  - **Change type:** New file
  - **Test:** Unit tests for requirement validation
  - **Description:** Implement requirement validation against acceptance criteria with traceability matrix
  - **Validates:** All requirements

- [x] **File:** `src/validation/quality-metrics-collector.ts`
  - **Change type:** New file
  - **Test:** Integration tests for metric collection
  - **Description:** Implement quality metrics collection with reporting and trend analysis
  - **Validates:** Requirements 5.4, 12.5, 14.4

- [x] **File:** `src/validation/compatibility-checker.ts`
  - **Change type:** New file
  - **Test:** Backward compatibility tests
  - **Description:** Implement backward compatibility checking with migration validation and rollback testing
  - **Validates:** Requirements 12.1, 12.2, 12.3, 12.4

- [x] **File:** `src/validation/user-experience-validator.ts`
  - **Change type:** New file
  - **Test:** Usability tests
  - **Description:** Implement user experience validation with interface testing and accessibility compliance
  - **Validates:** Requirements 13.1, 13.2, 13.3, 13.4, 13.5

## Phase 5: Deployment and Migration

### Phase 5.1: Deployment Infrastructure
- [x] **File:** `deployment/docker-compose.yml`
  - **Change type:** New file
  - **Test:** Deployment validation tests
  - **Description:** Implement Docker Compose configuration for local development and testing
  - **Validates:** Requirements 9.3, 14.5

- [x] **File:** `deployment/kubernetes/manifests/`
  - **Change type:** New directory and files
  - **Test:** Kubernetes deployment tests
  - **Description:** Implement Kubernetes manifests for production deployment with auto-scaling and monitoring
  - **Validates:** Requirements 9.3, 9.5, 14.5

- [x] **File:** `deployment/terraform/main.tf`
  - **Change type:** New file
  - **Test:** Infrastructure as code validation
  - **Description:** Implement Terraform configuration for cloud infrastructure provisioning
  - **Validates:** Requirements 9.3, 14.5

- [x] **File:** `deployment/ci-cd/github-actions.yml`
  - **Change type:** New file
  - **Test:** CI/CD pipeline tests
  - **Description:** Implement GitHub Actions workflow for continuous integration and deployment
  - **Validates:** Requirements 14.5

### Phase 5.2: Migration Tools
- [x] **File:** `src/migration/prompt-library-adapter.ts`
  - **Change type:** New file
  - **Test:** Migration compatibility tests
  - **Description:** Implement adapter for current prompt library with backward compatibility support
  - **Validates:** Requirements 12.1, 12.2, 12.3

- [x] **File:** `src/migration/artifact-migrator.ts`
  - **Change type:** New file
  - **Test:** Data migration tests
  - **Description:** Implement artifact migration from current system to new skill-based system
  - **Validates:** Requirements 12.3, 12.4

- [x] **File:** `src/migration/hybrid-mode-coordinator.ts`
  - **Change type:** New file
  - **Test:** Hybrid operation tests
  - **Description:** Implement coordination for hybrid operation during migration period
  - **Validates:** Requirements 12.3, 12.4

- [x] **File:** `src/migration/rollback-manager.ts`
  - **Change type:** New file
  - **Test:** Rollback procedure tests
  - **Description:** Implement rollback capabilities with state preservation and recovery procedures
  - **Validates:** Requirements 12.4, 11.2

### Phase 5.3: Production Readiness
- [x] **File:** `src/monitoring/health-check.ts`
  - **Change type:** New file
  - **Test:** Health check integration tests
  - **Description:** Implement health checks for all components with dependency validation
  - **Validates:** Requirements 14.1, 14.2, 14.3

- [x] **File:** `src/monitoring/alert-manager.ts`
  - **Change type:** New file
  - **Test:** Alerting system tests
  - **Description:** Implement alert management with severity levels, notification channels, and escalation policies
  - **Validates:** Requirements 14.2, 14.3

- [x] **File:** `src/monitoring/metrics-exporter.ts`
  - **Change type:** New file
  - **Test:** Metrics export tests
  - **Description:** Implement metrics export for Prometheus/Grafana integration with dashboard configuration
  - **Validates:** Requirements 5.4, 14.4

- [x] **File:** `src/monitoring/log-aggregator.ts`
  - **Change type:** New file
  - **Test:** Log aggregation tests
  - **Description:** Implement structured logging with aggregation, search, and analysis capabilities
  - **Validates:** Requirements 14.1, 14.4

### Phase 5.4: Documentation and Training
- [x] **File:** `docs/agentic-runtime/architecture.md`
  - **Change type:** New file
  - **Test:** Documentation review
  - **Description:** Create comprehensive architecture documentation with component diagrams and data flow
  - **Validates:** Requirements 13.4

- [x] **File:** `docs/agentic-runtime/api-reference.md`
  - **Change type:** New file
  - **Test:** API documentation tests
  - **Description:** Create API reference documentation with examples and usage patterns
  - **Validates:** Requirements 8.4, 13.4

- [x] **File:** `docs/agentic-runtime/user-guide.md`
  - **Change type:** New file
  - **Test:** User guide validation
  - **Description:** Create user guide with tutorials, best practices, and troubleshooting
  - **Validates:** Requirements 13.1, 13.4, 13.5

- [x] **File:** `docs/agentic-runtime/migration-guide.md`
  - **Change type:** New file
  - **Test:** Migration guide validation
  - **Description:** Create migration guide with step-by-step instructions and compatibility matrix
  - **Validates:** Requirements 12.3, 12.4, 12.5

## Success Criteria Validation Tasks

### Technical Success Validation
- [x] **File:** `tests/success-metrics/technical-metrics.test.ts`
  - **Change type:** New file
  - **Test:** Technical success metric validation
  - **Description:** Validate code generation quality, execution success rate, performance improvement, resource efficiency, system reliability
  - **Validates:** Technical success metrics from design

### User Experience Validation
- [x] **File:** `tests/success-metrics/user-experience.test.ts`
  - **Change type:** New file
  - **Test:** User experience metric validation
  - **Description:** Validate prompt understanding accuracy, time to production, user satisfaction, learning curve, feature completeness
  - **Validates:** User experience success metrics from design

### Business Success Validation
- [x] **File:** `tests/success-metrics/business-metrics.test.ts`
  - **Change type:** New file
  - **Test:** Business success metric validation
  - **Description:** Validate development efficiency, quality improvement, cost reduction, time to market, competitive advantage
  - **Validates:** Business success metrics from design

## Summary

This task breakdown provides 68 atomic implementation tasks organized by the 8-phase transformation plan and core components. Each task includes:
- Specific file path for implementation
- Change type (new file, modification, etc.)
- Test requirements
- Description of what to implement
- Requirements validation mapping

All 68 tasks have been completed. The tasks follow a logical progression from foundational components (skill system) through integration layers to deployment and migration, ensuring a complete transformation from the current AI Prompt Library to the Agentic Engineering Runtime.

## Phase 6: Library Hardening & Gap Remediation

*This phase addresses critical gaps identified during end-to-end dry-run validation (e.g., the Storage Cleaner scenario) to ensure production-grade reliability across diverse use cases.*

### Phase 6.1: Orchestration Flow Adjustments
- [x] **File:** `QUICK_START.md`
  - **Change type:** Modification
  - **Test:** Validate agent prompt behavior
  - **Description:** Updated Step 4 to instruct the agent to act as a product owner and explicitly infer/fill all `MY_PROJECT.md` fields (platforms, constraints, tech) rather than leaving them empty.
  - **Validates:** Dry-Run Gap (Platform inference defaults)

- [x] **File:** `prompts/orchestrators/drill-down-engine.md`
  - **Change type:** Modification
  - **Test:** Validate Step 1/2/3 outputs
  - **Description:** Removed strict one-module constraints to allow dual-platform multi-module loading. Shifted file path definitions from concrete in Step 2 to architectural guidelines, deferring concrete paths to Step 3.7. Excluded N/A baseline epics completely.
  - **Validates:** Dry-Run Gaps (Multi-module constraint, Early file path commitment, N/A baseline generation)

- [x] **File:** `prompts/orchestrators/baseline-task-shapes.md`
  - **Change type:** Modification
  - **Test:** Validate Step 1 baseline selection
  - **Description:** Replaced the ADR stub pattern with explicit instructions to completely exclude non-applicable topics from the plan. Added a "Local-only / no-network apps" variant for Observability.
  - **Validates:** Dry-Run Gaps (Network-dependent observability, Stub file pollution)

- [x] **File:** `prompts/orchestrators/executor.md`
  - **Change type:** Modification
  - **Test:** Validate executor startup
  - **Description:** Added a mandatory "Toolchain setup (Task 0)" step that scaffolds the project using library templates, verifies the host toolchain (Xcode, Android SDK, etc.), and generates a `dev-setup.sh` onboarding script.
  - **Validates:** Dry-Run Gap (Missing toolchain validation & project scaffolding)

### Phase 6.2: Module Extensions
- [x] **File:** `prompts/orchestrators/module-selection-index.md`
  - **Change type:** Modification
  - **Test:** Validate module selection mapping
  - **Description:** Added new module references for on-device ML and gesture-based UI patterns.
  - **Validates:** Dry-Run Gap (Missing capabilities mapping)

- [x] **Files:** `prompts/modules/ai-native/on-device-ml-ios.md`, `prompts/modules/ai-native/on-device-ml-android.md`
  - **Change type:** New files
  - **Test:** Validate prompt inclusion
  - **Description:** Created specialized modules for Core ML/Vision (iOS) and ML Kit/TFLite (Android) to support offline, privacy-first machine learning.
  - **Validates:** Dry-Run Gap (Missing on-device ML patterns)

- [x] **File:** `prompts/modules/feature-patterns/gesture-card-ui.md`
  - **Change type:** New file
  - **Test:** Validate prompt inclusion
  - **Description:** Created a module defining highly interactive, gesture-driven swipe cards (Tinder-style) for both SwiftUI and Jetpack Compose.
  - **Validates:** Dry-Run Gap (Missing gesture UI patterns)
