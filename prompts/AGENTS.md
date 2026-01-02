# AI Agent Instructions for Prompt Library

## Purpose
Provide comprehensive instructions for AI agents working with the AI Prompt Library system. This document ensures consistent, high-quality execution of the prompt library workflow, enabling any AI agent to transform minimal user input into production-ready software specifications through a modular, stage-based approach.

## Instructions

### How to Use This Document

1. **Read Before Starting**: Review this entire document before beginning any work with the prompt library
2. **Follow Stage Pipeline**: Execute stages in the specified order (01-10)
3. **Maintain State**: Keep all project state documents updated throughout execution
4. **Preserve Context**: Ensure any AI agent can continue work at any stage
5. **Validate Quality**: Run quality gates and validation checks at each stage
6. **Document Decisions**: Record all architectural and implementation choices

### Quick Start for New AI Agents

1. **Orient Yourself**: Read PROJECT_STATUS.md and DEVELOPMENT_LOG.md
2. **Check Current Stage**: Identify where the project currently stands
3. **Load Context**: Review all previous stage outputs and decisions
4. **Validate Prerequisites**: Ensure all dependencies are met
5. **Execute Next Stage**: Follow the stage-specific instructions
6. **Update State**: Maintain all project documentation

### Stage Execution Workflow

1. **Pre-Stage**: Validate prerequisites, load context, check assets
2. **During Stage**: Generate platform files, maintain context, log decisions
3. **Post-Stage**: Update project state, generate next steps, validate dependencies

## Examples

### Example 1: Starting a New Project

```bash
# 1. Agent receives user input
Brief: "A task management app for remote teams with real-time collaboration"
Platforms: web, mobile
Token Level: medium

# 2. Agent processes through stages
Stage 01 - Intake:
- Process user input template
- Organize assets in working_copy/
- Generate initial project configuration
- Output: requirements specification, asset mapping

Stage 02 - Charter:
- Define project scope and goals
- Create stakeholder alignment
- Output: project charter, success criteria

# 3. Agent maintains state throughout
PROJECT_STATUS.md: "Stage 02 complete, moving to Stage 03"
DEVELOPMENT_LOG.md: "Chose React Native for mobile, Next.js for web"
NEXT_STEPS.md: "Begin architecture design in Stage 03"
```

### Example 2: Agent Handoff Mid-Project

```markdown
# New agent joins project at Stage 05
1. Read PROJECT_STATUS.md:
   - Project: TaskFlow collaboration platform
   - Current: Stage 05 - Testing Strategy
   - Completion: 40%
   - Technology: React Native + Next.js + Node.js

2. Review DEVELOPMENT_LOG.md:
   - Architecture decisions made in Stage 03
   - Feature specifications completed in Stage 04
   - Key technical choices and rationale

3. Check NEXT_STEPS.md:
   - Generate comprehensive testing strategy
   - Include unit tests, integration tests, property-based tests
   - Focus on real-time collaboration features

4. Execute Stage 05:
   - Generate testing-web.md, testing-mobile.md, testing-platform-agnostic.md
   - Include accessibility and i18n testing requirements
   - Create property-based test specifications

5. Update state documents:
   - Mark Stage 05 complete in PROJECT_STATUS.md
   - Log testing decisions in DEVELOPMENT_LOG.md
   - Set Stage 06 next steps in NEXT_STEPS.md
```

### Example 3: Error Recovery

```markdown
# Scenario: Context loss during Stage 07
1. Assess situation:
   - Last known state: Stage 06 complete
   - Missing: Stage 07 deployment configuration
   - Available: All previous stage outputs

2. Reconstruct context:
   - Read all stage outputs from stages 01-06
   - Review ARCHITECTURE_DECISIONS.md for deployment choices
   - Check COMPLETED_FEATURES.md for implementation status

3. Resume execution:
   - Start Stage 07 with full context reconstruction
   - Generate deployment configurations for chosen platforms
   - Validate against previous architectural decisions

4. Prevent future issues:
   - Update state management procedures
   - Add additional context preservation checkpoints
   - Document recovery process in KNOWN_ISSUES.md
```

### Example 4: Token Usage Management

```markdown
# High Token Usage Project
Project: Enterprise payment processing API
Token Level: high
Requirements: PCI compliance, comprehensive testing

Stage Execution:
- Generate complete specifications with detailed requirements
- Create comprehensive property-based test suites
- Include full security audit checklists
- Generate complete deployment automation
- Provide extensive documentation and guides

# Medium Token Usage Project  
Project: Small business website
Token Level: medium
Requirements: Basic functionality, cost-effective

Stage Execution:
- Generate core specifications with essential features
- Create key validation tests at major milestones
- Include basic security and performance requirements
- Generate standard deployment configuration
- Provide essential documentation

# Low Token Usage Project
Project: Personal portfolio site
Token Level: low
Requirements: Simple, user-managed

Stage Execution:
- Generate basic specifications and architecture
- Delegate testing and validation to user
- Provide deployment guidance and templates
- Generate minimal documentation
- Focus on core functionality only
```

### Example 5: Cross-Platform Development

```markdown
# Multi-Platform Project: Fitness Tracking App
Platforms: iOS, Android, Web
Approach: React Native + Web Dashboard

Stage 04 - Features:
# Generate platform-specific feature files

features-mobile.md:
- Native device integrations (HealthKit, Google Fit)
- Offline workout tracking
- Push notifications for goals
- Camera integration for progress photos

features-web.md:
- Comprehensive dashboard and analytics
- Workout plan creation and management
- Social features and community
- Admin portal for trainers

features-platform-agnostic.md:
- User authentication and profiles
- Data synchronization across devices
- Core workout data models
- API specifications for all platforms

# Ensure parity validation
- Maintain capability matrix
- Generate cross-platform tests
- Document platform-specific differences
- Create shared API contracts
```

## Overview

This document provides comprehensive instructions for AI agents working with the AI Prompt Library system. The system transforms minimal user input into production-ready software specifications through a modular, stage-based approach.

## Core Principles

### 1. Modular and Composable
- All prompts are designed as Lego blocks - basic, unit-level components
- Templates can be combined and composed to build anything
- Keep context manageable while maintaining functionality
- Use template inclusion patterns for reusability

### 2. Context-Agnostic Operation
- Every task and prompt must be executable without prior conversation context
- Include all necessary references and dependencies
- Maintain comprehensive state tracking across sessions
- Any AI agent should be able to pick up work at any stage

### 3. Production-Ready Defaults
- Always assume best practices by default
- Include security, accessibility, i18n, and offline capabilities
- Prefer cost-optimized managed services
- Integrate quality assurance at every stage

### 4. Incremental Development
- Break down requirements into features and modules
- Create bite-sized, trackable development tasks
- Validate at each stage before proceeding
- Maintain rollback capabilities

## Stage Pipeline Execution

### Stage Execution Order
1. **Stage 01 - Intake**: Process user input and assets
2. **Stage 02 - Charter**: Define project scope and goals
3. **Stage 03 - Architecture**: Design system architecture
4. **Stage 04 - Features**: Specify detailed features
5. **Stage 05 - Testing**: Define testing strategy
6. **Stage 06 - Implementation**: Create implementation plan
7. **Stage 07 - Deployment**: Configure deployment
8. **Stage 08 - Documentation**: Generate documentation
9. **Stage 09 - Quality**: Quality assurance checks
10. **Stage 10 - Handoff**: Project handoff preparation

### Stage Execution Rules

#### Before Starting Any Stage
1. **Validate Prerequisites**: Ensure all dependent stages are complete
2. **Load Context**: Read all previous stage outputs and project state
3. **Check Assets**: Verify all required assets are available in `working_copy/`
4. **Set Token Level**: Respect the configured token usage level

#### During Stage Execution
1. **Generate Platform Files**: Create web.md, mobile.md, platform-agnostic.md as needed
2. **Include Required Sections**: Scope, assumptions, acceptance criteria, risks, next steps
3. **Maintain Context**: Update rolling context summary
4. **Log Decisions**: Record all architectural and implementation decisions
5. **Validate Quality**: Run quality gates before stage completion

#### After Stage Completion
1. **Update Project State**: Mark stage as complete, update progress
2. **Generate Next Steps**: Clear instructions for the next stage
3. **Validate Dependencies**: Ensure downstream stages can proceed
4. **Store Artifacts**: Save all generated files in appropriate locations

## Template Usage Guidelines

### User Input Processing
```markdown
# Always start with the user input template
1. Load `templates/user-input-template.md`
2. Validate Brief field (required, 2-3 lines minimum)
3. Apply defaults for omitted optional fields
4. Process any assets in `working_copy/`
5. Generate initial project configuration
```

### Module Inclusion
```markdown
# Include modules using the standard pattern
#[[module:category/module-name.md]]

# Pass parameters when needed
#[[module:auth/setup.md|provider=auth0|type=oauth]]

# Use conditional inclusion
{{#if mobile}}
#[[module:mobile/react-native.md]]
{{/if}}
```

### Asset Management
```markdown
# Process user assets systematically
1. Scan `working_copy/` for all files
2. Categorize by type (designs, specs, data, assets)
3. Create mapping documentation
4. Maintain provenance tracking
5. Reference assets in generated prompts
```

## State Management Requirements

### Project State Tracking
Maintain these files throughout the project lifecycle:

- **PROJECT_STATUS.md**: Current status and completion percentage
- **DEVELOPMENT_LOG.md**: All decisions, implementations, and changes
- **NEXT_STEPS.md**: Immediate next actions for any AI agent
- **ARCHITECTURE_DECISIONS.md**: Technical choices with rationale
- **COMPLETED_FEATURES.md**: Implemented and tested functionality
- **KNOWN_ISSUES.md**: Bugs, limitations, and technical debt

### Related Documentation
- [Library Vision Document](./templates/library-vision-document.md) - Core principles and vision alignment
- [Library Change Assessment](./templates/library-change-assessment.md) - Impact assessment for changes
- [Library Dependency Map](./templates/library-dependency-map.md) - Component relationships

### Context Preservation
```markdown
# Always maintain context across sessions
1. Read existing state documents before starting
2. Update state documents after each significant action
3. Generate context summaries for new agents
4. Preserve decision rationale and alternatives
5. Track build commands and successful configurations
```

## Quality Assurance Guidelines

### Validation Checkpoints
- **Input Validation**: Verify user input completeness and consistency
- **Stage Dependencies**: Ensure prerequisites are met before proceeding
- **Output Completeness**: Validate all required sections are present
- **Cross-Platform Parity**: Ensure consistent functionality across platforms
- **Production Readiness**: Verify security, accessibility, and performance requirements

### Error Handling
```markdown
# Handle errors gracefully
1. Provide clear error messages with remediation steps
2. Offer fallback options when primary approaches fail
3. Maintain functionality during fixes (never reduce capabilities)
4. Log all errors and recovery actions
5. Update known issues documentation
```

## Token Usage Management

### Low Token Usage
- Generate specifications and delegate build/test to user
- Focus on core functionality and architecture
- Minimal validation and testing prompts
- User responsible for implementation verification

### Medium Token Usage
- Verify at key checkpoints and major milestones
- Generate essential tests and validation steps
- Balanced approach between cost and quality
- Automated validation at critical decision points

### High Token Usage
- Comprehensive verification with full testing
- Property-based testing for all correctness properties
- Extensive validation and quality assurance
- Complete automation of verification processes

## Dry-Run Capabilities

### When to Use Dry-Run
- Initial validation of user input and preferences
- Testing stage outputs before full generation
- Estimating token consumption for budget planning
- Iterative refinement of specifications

### Dry-Run Output Format
```markdown
# Dry-Run Summary
## Key Decisions
- [List major architectural and technology decisions]

## Assumptions
- [List assumptions made during generation]

## Estimated Token Usage
- Full Generation: ~X tokens
- Current Stage: ~Y tokens

## Validation Points
- [List items that need user validation before proceeding]
```

## Build Command Preservation

### Command Storage
```markdown
# Always store successful commands
1. Record command, working directory, timestamp
2. Note platform and stage context
3. Update command history log
4. Reference in future task generation
5. Enable context-free execution
```

### Command Usage
- Reference stored commands in implementation prompts
- Provide fallback commands for different environments
- Update commands when new successful executions occur
- Never overwrite working commands without validation

## Functionality Preservation

### During Bug Fixes
- **Never reduce functionality** to make tests pass
- **Always preserve existing capabilities** during fixes
- **Document rationale** for any functionality changes
- **Get explicit approval** before removing features
- **Maintain regression checklist** to validate fixes

### During Updates
- **Incremental improvements only** - no breaking changes
- **Backward compatibility** with existing implementations
- **Migration guidance** when changes are necessary
- **Version tracking** of all modifications

## Cross-Platform Development

### Platform Parity Management
```markdown
# Ensure consistent functionality across platforms
1. Maintain capability matrix for all platforms
2. Document platform differences with rationale
3. Generate parity validation tests
4. Specify shared API contracts and data models
5. Include parity verification in task lists
```

### Technology Stack Selection
- **Mobile**: Native iOS/Android, React Native, Flutter
- **Web**: Headless, JAMstack, SPA, SSR, traditional
- **Backend**: Serverless, microservices, monolithic
- **Deployment**: AWS, Azure, GCP, Heroku, Vercel, Netlify

## Implementation Guidelines

### Task Generation
```markdown
# Create context-agnostic tasks
1. Include all necessary references and context
2. Make tasks completable across multiple sessions
3. Structure with clear dependencies and checkpoints
4. Ensure incremental progress with validation
5. Support handoff between different AI agents
```

### Prompt Generation
```markdown
# Generate targeted implementation prompts
1. Include context links to specifications and assets
2. Specify expected outputs and completion criteria
3. Chunk large tasks to fit token budgets
4. Include validation steps and quality gates
5. Reference stored build commands when available
```

## Self-Maintenance

### Documentation Updates
- **Automatic updates** after each milestone
- **Version control** of all state documents
- **Quick-start guides** for new AI agents
- **Changelog maintenance** with lessons learned
- **Gap identification** and improvement suggestions

### System Evolution
- **Template improvements** based on project outcomes
- **Best practice updates** from successful implementations
- **Error pattern analysis** and prevention
- **Performance optimization** of prompt generation
- **User feedback integration** for continuous improvement

## Emergency Procedures

### Context Loss Recovery
1. Reconstruct from PROJECT_STATUS.md and DEVELOPMENT_LOG.md
2. Validate current state against completed features
3. Identify last successful checkpoint
4. Resume from validated state with full context

### Quality Gate Failures
1. Identify specific failure points and requirements
2. Provide detailed remediation steps
3. Offer alternative approaches if primary fails
4. Update quality gates to prevent similar failures
5. Document lessons learned for future projects

### Resource Exhaustion
1. Switch to lower token usage level
2. Prioritize core functionality over nice-to-have features
3. Generate abbreviated specifications with key decisions
4. Provide manual completion guidance for remaining tasks
5. Document resource constraints and workarounds

## Centralized Mock Data Management

### Overview
The AI Prompt Library uses centralized mock data to ensure consistent testing across all platforms. All mock data is organized in a single location and referenced by all platforms (web, iOS, Android, desktop).

### Related Modules
- [Centralized Mock Data](./modules/testing/centralized-mock-data.md) - Mock data organization
- [Mock Consolidation](./modules/testing/mock-consolidation.md) - Platform mock migration
- [Mock Validation](./modules/testing/mock-validation.md) - Contract compliance validation

### Mock Data Directory Structure
```
mocks/
├── api/
│   └── v1/
│       ├── users/
│       │   ├── GET/
│       │   │   ├── 200-success.json
│       │   │   ├── 401-unauthorized.json
│       │   │   └── 500-server-error.json
│       │   └── POST/
│       │       ├── 201-created.json
│       │       └── 400-validation-error.json
│       └── auth/
│           └── login/
│               └── POST/
│                   ├── 200-success.json
│                   └── 401-invalid-credentials.json
├── schemas/
│   └── user.schema.json
├── index.json
└── README.md
```

### Mock Data Workflow
1. **Organization**: Use [centralized-mock-data.md](./modules/testing/centralized-mock-data.md) to organize mock data
2. **Consolidation**: Use [mock-consolidation.md](./modules/testing/mock-consolidation.md) to migrate platform-specific mocks
3. **Validation**: Use [mock-validation.md](./modules/testing/mock-validation.md) to validate mock data against API contracts
4. **Naming Convention**: `{status-code}-{description}.json` (e.g., `200-success.json`, `400-validation-error.json`)

### Key Principles
- **Single Source of Truth**: All platforms reference the same centralized mock files
- **Status Code Organization**: Separate happy path (2xx) from error responses (4xx, 5xx)
- **Contract Alignment**: Ensure mock data matches API contract specifications
- **Version Control**: Track mock data changes with versioning in index.json

## Fake Backend Usage

### Overview
The fake backend serves centralized mock data for local development and testing, enabling complete integration tests without network mocks.

### Starting the Fake Backend
```bash
# Using Node.js spawn script
node scripts/start-fake-backend.js

# Using bash script
./scripts/start-fake-backend.sh

# Using Docker
docker-compose -f docker-compose.fake-backend.yml up
```

### Scenario Selection
The fake backend supports multiple response scenarios:

| Scenario | Description | Header Value |
|----------|-------------|--------------|
| `success` | Standard success response | `X-Mock-Scenario: success` |
| `validation_error` | 400 validation errors | `X-Mock-Scenario: validation_error` |
| `unauthorized` | 401 auth errors | `X-Mock-Scenario: unauthorized` |
| `not_found` | 404 errors | `X-Mock-Scenario: not_found` |
| `server_error` | 500 errors | `X-Mock-Scenario: server_error` |
| `timeout` | Request timeouts | `X-Mock-Scenario: timeout` |
| `slow` | 3 second delays | `X-Mock-Scenario: slow` |

### Integration with Tests
```typescript
// Configure test runner to use fake backend
beforeAll(async () => {
  await startFakeBackend();
  await waitForReady('http://localhost:3001/health');
});

afterAll(async () => {
  await stopFakeBackend();
});

// Tests make real HTTP calls to fake backend
it('should handle user creation', async () => {
  const response = await fetch('http://localhost:3001/api/v1/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User' })
  });
  expect(response.status).toBe(201);
});
```

### Debug Menu Integration
Apps should include a debug menu (development builds only) that allows:
- Switching between Production, Staging, Fake Backend, and Offline modes
- Selecting mock scenarios for testing different API responses
- Persisting environment selection across app restarts

Reference: [debug-menu-integration.md](./modules/testing/debug-menu-integration.md) for platform-specific implementations.

## Impact Assessment for Library Changes

### Overview
All changes to the AI Prompt Library must go through impact assessment to ensure consistency with the library's vision and prevent breaking existing functionality.

### Impact Assessment Workflow
1. **Consult Dependency Map**: Review [library-dependency-map.md](./templates/library-dependency-map.md) to identify affected components
2. **Complete Assessment Checklist**: Use [library-change-assessment.md](./templates/library-change-assessment.md) for comprehensive evaluation
3. **Validate Alignment**: Ensure changes align with core principles in [library-vision-document.md](./templates/library-vision-document.md)
4. **Generate Regression Tests**: Create tests to validate changes don't break existing functionality
5. **Document Rationale**: Record the reasoning and expected benefits of the change

### Risk Level Classification
| Risk Level | Criteria | Required Review |
|------------|----------|-----------------|
| Low | Single template, no cross-platform impact | Self-review |
| Medium | Multiple templates, limited cross-platform impact | Peer review |
| High | Core templates, significant cross-platform impact | Architecture review |
| Critical | Breaking changes, major restructuring | Review board approval |

### Core Principles Alignment
All changes must align with these principles:
1. **Modular and Composable**: Templates should be like Lego blocks
2. **Integrated Best Practices**: Production-ready features embedded, not separate
3. **Bite-sized Context**: Keep context manageable
4. **Feature-Module Breakdown**: Logical decomposition of requirements
5. **Dry-run Capability**: Validate without full execution

### Rollback Procedures
If changes negatively impact library functionality:
1. **Assess Situation**: Identify trigger and scope of rollback
2. **Execute Rollback**: Use git revert or restore from backup tag
3. **Validate Restoration**: Run integration tests to confirm functionality
4. **Document Lessons**: Record root cause and prevention measures

### Change Documentation Template
```markdown
# Change Record: [Change ID]

## Summary
- Title: [Brief title]
- Date: [Implementation date]
- Risk Level: [Low/Medium/High/Critical]

## Assessment Results
- Impact Score: [X/5]
- Alignment Score: [X/15]
- Affected Components: [List]

## Validation Results
- [ ] All regression tests passed
- [ ] Cross-platform validation completed
- [ ] Documentation updated
```

## Success Metrics

### Project Completion Indicators
- All stages completed with quality gate validation
- Comprehensive documentation generated and maintained
- Implementation tasks created and validated
- Cross-platform parity verified
- Production readiness checklist completed

### Quality Indicators
- All correctness properties validated
- Build commands preserved and documented
- State management comprehensive and current
- Error handling robust and documented
- Self-maintenance capabilities functional

### Mock Data and Testing Indicators
- Centralized mock data covers all API endpoints
- Fake backend supports all required scenarios
- Debug menu available in development builds
- Integration tests use fake backend (no network mocks)

### Library Maintenance Indicators
- Dependency map is current and accurate
- Impact assessments completed for all changes
- Rollback procedures tested and documented
- Cross-platform consistency validated

Remember: The goal is to transform minimal user input into comprehensive, production-ready specifications that any AI agent can execute successfully without requiring previous conversation context.