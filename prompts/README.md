# AI Prompt Library

## Purpose
A comprehensive collection of modular, composable prompt templates for transforming minimal user input into production-ready software specifications and implementation plans. This library enables non-technical users to generate complete development specifications while providing AI agents with structured, context-rich prompts for implementation.

## Instructions

### How to Use This Library

1. **Start with User Input**: Fill out the main input template with your project brief
2. **Organize Assets**: Place any reference materials in the working_copy directory
3. **Select Token Usage Level**: Choose between Low, Medium, or High verification depth
4. **Run Stage Pipeline**: Execute stages sequentially from intake to handoff
5. **Generate Implementation**: Use generated task lists and prompts for development
6. **Maintain Documentation**: Keep project state updated throughout development

### For Non-Technical Users

1. **Fill the Brief**: Provide a 2-3 sentence description of what you want to build
2. **Add Optional Details**: Include platforms, preferences, or constraints if known
3. **Upload Assets**: Add any designs, documents, or reference materials
4. **Choose Verification Level**: Select how thorough you want the validation to be
5. **Review Generated Specs**: Validate the generated specifications match your vision

### For AI Agents

1. **Read AGENTS.md**: Follow specific instructions for AI agent interactions
2. **Process Stages Sequentially**: Complete each stage before moving to the next
3. **Maintain Context**: Update project state documents throughout execution
4. **Validate Quality**: Ensure all outputs meet production-ready standards
5. **Document Decisions**: Record all architectural and implementation choices

### For Developers

1. **Review Generated Specs**: Understand the complete project specification
2. **Follow Task Lists**: Execute implementation tasks in the specified order
3. **Run Tests**: Implement both unit tests and property-based tests
4. **Update Documentation**: Keep project documentation current with changes
5. **Maintain Quality**: Follow established coding standards and best practices

## Examples

### Example 1: Simple Web Application

```markdown
# User Input
**Brief**: "A task management app for remote teams with real-time collaboration and offline sync"

# Generated Output Structure
outputs/
├── specifications/
│   ├── requirements.md          # Complete requirements specification
│   ├── design-system-foundation.md # Token + component foundations
│   ├── integration-contracts.md # API/integration contracts
│   ├── data-architecture.md     # Database + migration plan
│   └── features.md              # Detailed feature specifications
├── task-lists/
│   ├── implementation-master-plan.md
│   ├── task-list-index.md
│   ├── mobile-app-tasks.md
│   └── backend-shared-tasks.md
├── deployment/
│   ├── deployment-plan.md
│   ├── environment-matrix.md
│   └── access-and-secrets-checklist.md
└── documentation/
    ├── integration-setup-guide.md # API/deployment setup
    ├── user-guide.md          # End-user documentation
    └── developer-guide.md     # Development setup guide
```

### Example 2: Mobile Application with Assets

```markdown
# User Input
**Brief**: "A fitness tracking app with wearable device integration"
**Platforms**: iOS, Android
**Assets**: 
- UI mockups in working_copy/designs/
- Brand guidelines in working_copy/assets/
- Sample data in working_copy/data-samples/

# Generated Output
outputs/
├── specifications/
│   ├── mobile-requirements.md  # Mobile-specific requirements
│   ├── integration-specs.md    # Wearable device integration
│   └── data-models.md         # Health data models
├── task-lists/
│   ├── react-native-tasks.md  # Cross-platform implementation
│   ├── ios-specific-tasks.md  # iOS native features
│   └── android-specific-tasks.md # Android native features
└── assets/
    ├── processed-designs/      # Optimized design assets
    └── app-icons/             # Generated app icons
```

### Example 3: Enterprise API Service

```markdown
# User Input
**Brief**: "A secure payment processing API for e-commerce platforms with PCI compliance"
**Token Usage**: High (comprehensive verification)
**Deployment**: AWS with enterprise security

# Generated Output
outputs/
├── specifications/
│   ├── api-specification.md   # Complete API specification
│   ├── security-requirements.md # PCI compliance requirements
│   └── deployment-architecture.md # AWS enterprise setup
├── task-lists/
│   ├── api-implementation.md  # FastAPI/Python implementation
│   ├── security-implementation.md # Security controls
│   └── compliance-tasks.md    # PCI compliance checklist
├── infrastructure/
│   ├── terraform/            # Infrastructure as code
│   └── kubernetes/           # Container orchestration
└── documentation/
    ├── api-reference.md      # OpenAPI documentation
    ├── security-guide.md     # Security implementation guide
    └── compliance-report.md  # PCI compliance documentation
```

### Example 4: Using Dry-Run Mode

```bash
# Run intake stage in dry-run mode
./run-stage.sh stage-01-intake --dry-run --token-level=low

# Output: Abbreviated specification with key decisions
outputs/dry-run/
├── intake-summary.md         # High-level project understanding
├── technology-recommendations.md # Suggested tech stack
├── effort-estimate.md        # Development time estimate
└── token-usage-projection.md # Full generation cost estimate

# After validation, run full generation
./run-stage.sh stage-01-intake --token-level=medium
```

A comprehensive collection of modular, composable prompt templates for transforming minimal user input into production-ready software specifications and implementation plans.

## Quick Start

1. **Fill out the user input template** in `templates/user-input-template.md`
2. **Place any reference assets** in the `working_copy/` directory
3. **Run the stage pipeline** starting with `stages/stage-01-intake/`
4. **Follow the generated task lists** for implementation

## Directory Structure

```
prompts/
├── templates/           # Core template files
│   ├── user-input-template.md    # Main input form (fillable template)
│   ├── brief-validation.md       # Brief content validation prompts
│   └── feature-breakdown.md      # Feature decomposition prompts
├── stages/             # Stage-specific prompt collections
│   ├── stage-01-intake/          # Initial requirements gathering
│   ├── stage-02-charter/         # Project charter and scope
│   ├── stage-03-architecture/    # System architecture design
│   ├── stage-04-features/        # Feature specifications
│   ├── stage-05-testing/         # Testing strategy
│   ├── stage-06-implementation/  # Implementation planning
│   ├── stage-07-deployment/      # Deployment configuration
│   ├── stage-08-documentation/   # Documentation generation
│   ├── stage-09-quality/         # Quality assurance
│   └── stage-10-handoff/         # Project handoff
├── modules/            # Reusable prompt modules
│   ├── asset-management/         # Asset processing modules
│   ├── design-system/            # Token/component/fidelity modules
│   ├── feature-patterns/         # Common feature templates
│   ├── technology-stacks/        # Technology-specific modules
│   ├── best-practices/           # Production-ready defaults
│   ├── testing/                  # Testing and mock data modules
│   └── cross-platform/           # Platform parity modules
├── working_copy/       # User assets and reference materials
│   ├── designs/               # UI/UX designs and mockups
│   ├── specifications/        # Existing specs and requirements
│   ├── data-samples/          # Sample data and schemas
│   └── assets/               # Images, icons, and other assets
└── outputs/           # Generated specifications and artifacts
    ├── specifications/        # Generated spec documents
    ├── task-lists/           # Implementation task lists
    ├── prompts/              # Generated implementation prompts
    └── documentation/        # Project documentation
```

### Key Files Quick Reference

| File | Description |
|------|-------------|
| [AGENTS.md](./AGENTS.md) | AI agent instructions for working with the prompt library |
| [templates/README.md](./templates/README.md) | Core template files for prompt generation |
| [stages/README.md](./stages/README.md) | Stage-specific prompt collections (01-10) |
| [modules/README.md](./modules/README.md) | Reusable prompt modules by category |
| [modules/testing/README.md](./modules/testing/README.md) | Testing, mock data, and fake backend modules |
| [modules/cross-platform/README.md](./modules/cross-platform/README.md) | Cross-platform parity and shared contracts |
| [outputs/README.md](./outputs/README.md) | Generated specifications and artifacts |

## Template Naming Conventions

### File Naming Pattern
- **Templates**: `{purpose}-template.md` (e.g., `user-input-template.md`)
- **Modules**: `{category}-{function}.md` (e.g., `auth-module.md`)
- **Stages**: `{stage-number}-{stage-name}/` (e.g., `stage-01-intake/`)
- **Platform Variants**: `{base-name}-{platform}.md` (e.g., `features-web.md`, `features-mobile.md`)

### Modular Composition Patterns

#### 1. Template Inclusion
```markdown
<!-- Include a reusable module -->
#[[module:auth-patterns/oauth-setup.md]]

<!-- Include platform-specific variant -->
#[[module:deployment/aws-serverless.md]]
```

#### 2. Conditional Modules
```markdown
<!-- Include based on user preferences -->
{{#if platforms.includes('mobile')}}
#[[module:mobile/react-native-setup.md]]
{{/if}}

{{#if features.includes('auth')}}
#[[module:auth-patterns/rbac-setup.md]]
{{/if}}
```

#### 3. Parameterized Modules
```markdown
<!-- Pass parameters to modules -->
#[[module:database/setup.md|type={{database.type}}|provider={{deployment.provider}}]]
```

## Token Usage Levels

The system supports three token usage levels to balance cost with thoroughness:

- **Low**: Generate specifications, delegate build/test to user
- **Medium**: Verify at key checkpoints and milestones
- **High**: Comprehensive verification with full testing

## Dry-Run Capabilities

All stages support dry-run mode for validation without full generation:

- **Abbreviated Specifications**: Summary outputs with key decisions
- **Token Estimation**: Projected consumption for full generation
- **Validation Checkpoints**: Verify stage outputs before proceeding
- **Iterative Refinement**: Refine inputs based on dry-run results

## Usage Guidelines

1. **Start Simple**: Begin with just the Brief field in the user input template
2. **Add Assets**: Place any reference materials in `working_copy/`
3. **Choose Token Level**: Select appropriate verification depth
4. **Run Stages Sequentially**: Follow the stage pipeline in order
5. **Validate Outputs**: Use dry-run mode to validate before full generation

## AI Agent Instructions

See [AGENTS.md](./AGENTS.md) for detailed instructions on how AI agents should interact with this prompt library system.

## Templates

This module includes the following templates:
