# Agentic Engineering Runtime – Architecture

## Overview

The Agentic Engineering Runtime transforms the AI Prompt Library into a closed-loop autonomous software delivery platform. It accepts natural-language prompts and autonomously designs, implements, tests, critiques, and repairs production-grade software.

> **Status: design document, not shipped behaviour.** None of the subsystems
> below are part of the published package. `src/agentic-runtime.ts` and the
> `intent/`, `planning/`, `critics/`, `architecture/`, `memory/`, `reliability/`,
> `coordination/`, `monitoring/`, `observation/`, `integration/` and
> `validation/` modules were speculative, were never referenced by the build
> include list, the `exports` map or `src/index.ts`, and have been removed from
> the repository. What ships today is the prompt corpus plus the validators
> under `src/` that are wired into `package.json` `exports`. Read this document
> as the rationale for a system that was trialled and retired, not as an API
> contract. The one exception is `src/security/`, described below, which is live
> and tested.

## High-Level Architecture

```
User Prompt
    │
    ▼
┌──────────────┐
│ Intent Parser │ ── Requirement Extractor ── Domain Processor ── Dialogue Manager
└──────┬───────┘
       ▼
┌──────────────┐
│Planning Agent│ ── Task Decomposer ── Plan Optimizer ── Dependency Resolver
└──────┬───────┘
       ▼
┌──────────────────┐
│ Execution Runtime │ ── Execution Monitor ── Quality Gate Enforcer
└──────┬───────────┘
       ▼
┌──────────────┐
│ Repair Loop  │ ── Critic Agents ── Consensus Engine ── Learning Critic
└──────┬───────┘
       ▼
┌───────────────────┐
│ Observation Layer  │ ── Metric Collector ── Anomaly Detector ── Insight Generator
└──────┬────────────┘
       ▼
┌───────────────────────┐
│ Integration & Output   │ ── Consistency Validator ── Documentation Generator
└───────────────────────┘
```

## Component Groups

### Intent Layer (`src/intent/`)
- **IntentParser** – Parses natural-language prompts into structured intent
- **RequirementExtractor** – Extracts technical requirements with quality attributes
- **DomainProcessor** – Maps concepts to domain-specific knowledge
- **DialogueManager** – Refines ambiguous intent through structured conversation

### Planning Layer (`src/planning/`)
- **PlanningAgent** – Creates dependency-aware execution plans
- **TaskDecomposer** – Breaks requirements into atomic tasks
- **PlanOptimizer** – Parallelises independent steps for throughput
- **DependencyResolver** – Topological sorting with cycle detection

### Execution Layer (`src/execution/`)
- **ExecutionRuntime** – Executes plans with checkpoint/rollback semantics
- **ExecutionMonitor** – Real-time resource and anomaly monitoring
- **RepairLoop** – Automated hypothesize-patch-test repair cycle
- **QualityGateEnforcer** – Blocks progression when thresholds fail

### Critic Layer (`src/critics/`)
- **CriticAgent** – Base interface for specialised reviewers
- **MultiPerspectiveCritic** – Coordinates security, performance, architecture critics
- **ConsensusEngine** – Resolves disagreements between critics
- **LearningCritic** – Adapts evaluation based on historical feedback

### Architecture Layer (`src/architecture/`)
- **ConstraintEnforcer** – Validates architectural rules (layering, naming)
- **PatternRecognizer** – Identifies and suggests design patterns
- **ConsistencyChecker** – Cross-component consistency validation
- **DecisionRecorder** – Persists ADRs with rationale and impact analysis

### Skill System (`src/skill-system/`)
- **SkillDefinition** – Formal schema for reusable engineering skills
- **SkillGraph** – Skill registry with dependency resolution
- **SkillRepository** – Versioned storage with metadata indexing
- **SkillCompositionEngine** – Composes skills with schema compatibility

### Memory Layer (`src/memory/`)
- **ArtifactStorage** – Content-addressable storage with versioning
- **SemanticSearch** – Vector-based similarity search over artifacts
- **ContextManager** – Relevance-scored context window management
- **PersistenceService** – Disk persistence with conflict resolution

### Reliability Layer (`src/reliability/`)
- **ConfidenceScorer** – Multi-signal confidence calculation
- **RegressionTester** – Baseline-based regression detection
- **PipelineGatekeeper** – Strict green-pipeline enforcement
- **RollbackCoordinator** – Checkpoint-based rollback management

### Coordination (`src/coordination/`)
- **Orchestrator** – Workflow execution with retry and rollback
- **StateManager** – Persistent global state with crash recovery
- **EventBus** – Pub/sub with replay and wildcard support

### Security (`src/security/` — live and tested, not published)

> These four modules carry the item-13 security fixes and are exercised by
> `tests/unit-tests/security-fixes-item13.test.ts` and
> `tests/security-tests/vulnerability-testing.test.ts`. They are deliberately
> absent from the build include list and the `exports` map, so they are tested
> but not part of the published API surface:
- **InputValidator** – XSS, injection, and path traversal detection
- **AccessController** – RBAC with audit trail
- **EncryptionService** – AES-256-GCM at-rest encryption
- **AuditLogger** – Tamper-evident hash-chained audit log

### Monitoring (`src/monitoring/`)
- **HealthCheck** – Component health with liveness probes
- **AlertManager** – Severity-based alerts with escalation
- **MetricsExporter** – Prometheus exposition format export
- **LogAggregator** – Structured logging with JSONL export

## Data Flow

1. **User Prompt** → Intent Parser → Requirement Extractor
2. **Requirements** → Planning Agent → Execution Plan
3. **Plan** → Execution Runtime → Observation Layer
4. **Results** → Critics → Consensus → Confidence Score
5. **If confidence < threshold** → Repair Loop → back to step 3
6. **If passed** → Integration Layer → Production Output

## Key Design Decisions

- **Skill-first architecture**: Prompts are implementation primitives, not the product
- **Closed-loop execution**: Every step feeds back into observation and repair
- **Disk-state over context**: All progress persisted to survive session boundaries
- **Multi-critic consensus**: No single reviewer can block – weighted consensus resolves disputes
