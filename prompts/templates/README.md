# Templates

## Purpose
Core template files for prompt generation, validation, and project management throughout the AI Prompt Library workflow.

## 🆕 Chain-of-Verification (COVE) Integration

The AI Prompt Library now includes **Chain-of-Verification (COVE)** templates to reduce AI hallucinations and improve accuracy by up to 40%. COVE is a four-step self-verification process developed by Meta AI:

1. **Draft**: Generate initial response
2. **Verify**: Create targeted verification questions
3. **Answer**: Answer questions independently (without referencing draft)
4. **Finalize**: Synthesize verified information with confidence indicators

**Key Benefits**:
- 40% reduction in factual errors
- Higher confidence in generated outputs
- Better documentation of assumptions
- Production-ready specifications and code

**Quick Start with COVE**:
- See [cove-verification-framework.md](./cove-verification-framework.md) for methodology
- See [cove-stage-integration.md](./cove-stage-integration.md) for stage integration
- See [COVE Examples](./cove-examples/README.md) for complete examples

**When to Use COVE**:
- ✅ Technical specifications (APIs, protocols)
- ✅ Code generation (functions, classes)
- ✅ Architecture decisions (technology choices)
- ✅ Security-critical components
- ✅ Compliance requirements (GDPR, WCAG)

## Instructions
1. Start with the user-input-template.md to capture project requirements
2. Use brief-validation.md to validate the input before processing
3. **NEW**: Apply COVE templates for critical specifications and code
4. Select appropriate templates based on your workflow stage
5. Reference templates using the template inclusion syntax

## Examples
```markdown
## Example: Starting a New Project
# 1. Fill out the user input template
#[[template:user-input-template.md]]

# 2. Validate the brief
#[[template:brief-validation.md]]

# 3. Break down features
#[[template:feature-breakdown.md]]

## Example: Implementation Workflow
# Generate implementation tasks
#[[template:task-generation.md|platform=web]]

# Create implementation prompts
#[[template:implementation-prompt-generation.md]]

# Run dry-run validation
#[[template:implementation-dry-run.md]]

## Example: Documentation Updates
# Update project documentation
#[[template:documentation-updates.md]]

# Maintain changelog
#[[template:changelog-maintenance.md]]
```

## Available Templates

### User Input & Validation
- [user-input-template.md](./user-input-template.md) - Main input form for project briefs
- [brief-validation.md](./brief-validation.md) - Brief content validation prompts
- [feature-breakdown.md](./feature-breakdown.md) - Feature decomposition prompts

### Implementation & Tasks
- [task-generation.md](./task-generation.md) - Task list generation
- [context-agnostic-tasks.md](./context-agnostic-tasks.md) - Platform-independent task templates
- [multi-session-tasks.md](./multi-session-tasks.md) - Multi-session task management
- [implementation-prompt-generation.md](./implementation-prompt-generation.md) - Implementation prompt creation
- [feature-implementation-prompt.md](./feature-implementation-prompt.md) - Feature-specific implementation prompts
- [implementation-dry-run.md](./implementation-dry-run.md) - Dry-run implementation validation
- [large-repetitive-changes.md](./large-repetitive-changes.md) - Safe protocol for large, repetitive refactors and coverage sweeps

### Stage Management
- [stage-orchestration.md](./stage-orchestration.md) - Stage pipeline orchestration
- [stage-output-generation.md](./stage-output-generation.md) - Stage output generation
- [dry-run-framework.md](./dry-run-framework.md) - Dry-run validation framework

### Testing & Quality
- [testing-strategy-generation.md](./testing-strategy-generation.md) - Testing strategy creation
- [property-based-testing.md](./property-based-testing.md) - Property-based test generation
- [unit-testing-specification.md](./unit-testing-specification.md) - Unit test specifications
- [quality-assurance-validation.md](./quality-assurance-validation.md) - QA validation prompts
- [prompt-quality-validation.md](./prompt-quality-validation.md) - Prompt quality checks
- [prompt-effectiveness-testing.md](./prompt-effectiveness-testing.md) - Prompt effectiveness testing
- [task-validation-dryrun.md](./task-validation-dryrun.md) - Task validation dry-run

### Chain-of-Verification (COVE) 🆕
- [cove-verification-framework.md](./cove-verification-framework.md) - **COVE methodology and templates**
- [cove-stage-integration.md](./cove-stage-integration.md) - **COVE integration for all 10 stages**
  - [COVE examples README](./cove-examples/README.md) - **Complete COVE examples**
  - [specification-example.md](./cove-examples/specification-example.md) - API specification with COVE
  - [code-generation-example.md](./cove-examples/code-generation-example.md) - Code generation with COVE
  - [README.md](./cove-examples/README.md) - COVE examples guide

### Documentation & Maintenance
- [documentation-updates.md](./documentation-updates.md) - Documentation update prompts
- [comprehensive-documentation-maintenance.md](./comprehensive-documentation-maintenance.md) - Full documentation maintenance
- [changelog-maintenance.md](./changelog-maintenance.md) - Changelog management
- [decision-logging.md](./decision-logging.md) - Decision documentation
- [development-log-updates.md](./development-log-updates.md) - Development log maintenance

### Project State & Tracking
- [project-state-files.md](./project-state-files.md) - State file templates (NEXT_ACTION, PROJECT_STATE, etc.)
- [project-state-tracking.md](./project-state-tracking.md) - Project state management
- [project-status-maintenance.md](./project-status-maintenance.md) - Status tracking
- [prompt-usage-log-template.md](./prompt-usage-log-template.md) - Stage-by-stage prompt composition traceability
- [prompt-composition-index-template.md](./prompt-composition-index-template.md) - Output-to-prompt block mapping index
- [implementation-prompt-pack-template.md](./implementation-prompt-pack-template.md) - Per-task executable prompt pack generation
- [execution-phase.md](./execution-phase.md) - **Execution Phase: Build code from specifications**

### Preservation & Optimization
- [functionality-preservation.md](./functionality-preservation.md) - Functionality preservation during changes
- [build-command-preservation.md](./build-command-preservation.md) - Build command preservation

### Token Management
- [token-usage-management.md](./token-usage-management.md) - Token usage optimization
- [token-chunking-validation.md](./token-chunking-validation.md) - Token chunking validation

### Design & Deployment
- [design-system-generation.md](./design-system-generation.md) - Design system generation
- [design-system-foundation-template.md](./design-system-foundation-template.md) - Token architecture and platform mapping output template
- [design-system-component-catalog-template.md](./design-system-component-catalog-template.md) - Reusable component inventory and state matrix template
- [design-system-implementation-sequencing-template.md](./design-system-implementation-sequencing-template.md) - Stage 06 design-system-first sequencing template
- [design-system-verification-report-template.md](./design-system-verification-report-template.md) - Stage 09 design-system quality verification template
- [data-architecture-planning.md](./data-architecture-planning.md) - Database/migration planning
- [screen-fidelity-matrix-template.md](./screen-fidelity-matrix-template.md) - Screen-by-screen mockup fidelity matrix
- [integration-contracts-spec-template.md](./integration-contracts-spec-template.md) - Executable API/integration contract structure
- [api-delivery-plan-template.md](./api-delivery-plan-template.md) - Endpoint-level rollout and gating plan
- [deployment-artifacts-generation.md](./deployment-artifacts-generation.md) - Deployment artifact creation
- [deployment-prerequisites-package.md](./deployment-prerequisites-package.md) - Accounts/keys/environment prerequisite package
- [agents-generation.md](./agents-generation.md) - AI agent configuration generation

### Library Maintenance
- [library-vision-document.md](./library-vision-document.md) - Library vision and goals
- [library-dependency-map.md](./library-dependency-map.md) - Dependency mapping
- [library-change-assessment.md](./library-change-assessment.md) - Change impact assessment
- [prompt-continuous-improvement.md](./prompt-continuous-improvement.md) - Continuous improvement processes

## Usage
Templates are referenced using the template inclusion syntax:
```markdown
#[[template:user-input-template.md]]
#[[template:task-generation.md|platform={{target_platform}}]]
```


## Templates

This module includes the following templates:
