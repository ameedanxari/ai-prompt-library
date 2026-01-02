# Templates

## Purpose
Core template files for prompt generation, validation, and project management throughout the AI Prompt Library workflow.

## Instructions
1. Start with the user-input-template.md to capture project requirements
2. Use brief-validation.md to validate the input before processing
3. Select appropriate templates based on your workflow stage
4. Reference templates using the template inclusion syntax

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

### Documentation & Maintenance
- [documentation-updates.md](./documentation-updates.md) - Documentation update prompts
- [comprehensive-documentation-maintenance.md](./comprehensive-documentation-maintenance.md) - Full documentation maintenance
- [changelog-maintenance.md](./changelog-maintenance.md) - Changelog management
- [decision-logging.md](./decision-logging.md) - Decision documentation
- [development-log-updates.md](./development-log-updates.md) - Development log maintenance

### Project State & Tracking
- [project-state-tracking.md](./project-state-tracking.md) - Project state management
- [project-status-maintenance.md](./project-status-maintenance.md) - Status tracking
- [state-management-orchestration.md](./state-management-orchestration.md) - State orchestration

### Preservation & Optimization
- [functionality-preservation.md](./functionality-preservation.md) - Functionality preservation during changes
- [build-command-preservation.md](./build-command-preservation.md) - Build command preservation

### Token Management
- [token-usage-management.md](./token-usage-management.md) - Token usage optimization
- [token-chunking-validation.md](./token-chunking-validation.md) - Token chunking validation

### Design & Deployment
- [design-system-generation.md](./design-system-generation.md) - Design system generation
- [deployment-artifacts-generation.md](./deployment-artifacts-generation.md) - Deployment artifact creation
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
