# Implementation Prompt Generation Template

## Purpose
Generate targeted, context-rich implementation prompts that enable Agentic AI to execute specific development tasks efficiently with clear success criteria and validation steps.

# Implementation Prompt Generation Template

## Purpose
Generate targeted, context-rich implementation prompts that enable Agentic AI to execute specific development tasks efficiently with clear success criteria and validation steps.

## Instructions
Use this template to create focused implementation prompts that provide AI agents with all necessary context, clear objectives, and specific deliverables for successful task execution.

1. **Define Clear Objectives**: Specify exactly what needs to be implemented with measurable outcomes
2. **Provide Complete Context**: Include all relevant specifications, dependencies, and technical constraints
3. **List Specific Deliverables**: Enumerate exact files, components, and artifacts to be created
4. **Establish Success Criteria**: Define clear validation steps and acceptance criteria
5. **Include Implementation Guidance**: Provide examples, patterns, and best practices

## Examples

### Example Feature Implementation Prompt
```markdown
# Implementation Task: User Profile Management API

## Context and Specifications
- **Primary Specification**: [user-management-spec.md#profile-endpoints]
- **Related Assets**: [user-schema.sql, profile-ui-mockups.figma]
- **Dependencies**: Authentication middleware, User model, Database connection
- **Technology Stack**: Node.js, Express.js, TypeScript, Prisma ORM
- **Platform Target**: REST API for web and mobile clients

## Implementation Objective
Create a complete user profile management API that allows authenticated users to view, update, and manage their profile information with proper validation and error handling.

## Expected Outputs
### Primary Deliverables
- [ ] src/routes/profile.ts - Profile route handlers
- [ ] src/services/profileService.ts - Business logic for profile operations
- [ ] src/validators/profileValidator.ts - Input validation schemas
- [ ] src/types/profile.ts - TypeScript interfaces for profile data

### Supporting Artifacts
- [ ] Unit tests for profile service methods
- [ ] Integration tests for profile API endpoints
- [ ] API documentation for profile endpoints
- [ ] Database migration for profile fields (if needed)

## Acceptance Criteria
- [ ] GET /api/profile returns authenticated user's profile
- [ ] PUT /api/profile updates user profile with validation
- [ ] PATCH /api/profile supports partial profile updates
- [ ] All endpoints return appropriate HTTP status codes
- [ ] Input validation prevents invalid data submission
- [ ] Error responses include helpful error messages
- [ ] All profile operations are properly logged

## Implementation Guidelines
- Use Joi or Zod for input validation
- Implement proper error handling with try-catch blocks
- Follow RESTful API conventions for endpoint design
- Include rate limiting for profile update operations
- Sanitize user input to prevent XSS attacks
- Log all profile modification attempts for audit trail
```

### Example Component Implementation Prompt
```markdown
# Implementation Task: Real-time Chat Component

## Context and Specifications
- **Primary Specification**: [chat-feature-spec.md#real-time-messaging]
- **Related Assets**: [chat-ui-design.figma, message-schema.json]
- **Dependencies**: WebSocket server, User authentication, Message persistence
- **Technology Stack**: React, TypeScript, Socket.io-client, Styled Components
- **Platform Target**: Web application component

## Implementation Objective
Build a real-time chat component that enables users to send and receive messages instantly with proper message history, typing indicators, and connection status management.

## Expected Outputs
### Primary Deliverables
- [ ] src/components/Chat/ChatContainer.tsx - Main chat component
- [ ] src/components/Chat/MessageList.tsx - Message display component
- [ ] src/components/Chat/MessageInput.tsx - Message composition component
- [ ] src/components/Chat/TypingIndicator.tsx - Typing status component
- [ ] src/hooks/useChat.ts - Chat functionality hook
- [ ] src/services/chatService.ts - WebSocket communication service

### Supporting Artifacts
- [ ] Unit tests for chat components
- [ ] Integration tests for chat functionality
- [ ] Storybook stories for chat components
- [ ] CSS/styled-components for chat UI

## Acceptance Criteria
- [ ] Users can send and receive messages in real-time
- [ ] Message history loads when component mounts
- [ ] Typing indicators show when other users are typing
- [ ] Connection status is displayed to users
- [ ] Messages are properly formatted and timestamped
- [ ] Component handles connection failures gracefully
- [ ] Accessibility features support screen readers

## Implementation Guidelines
- Use React hooks for state management
- Implement proper WebSocket connection lifecycle management
- Add debouncing for typing indicator events
- Include proper error boundaries for connection failures
- Follow accessibility guidelines (ARIA labels, keyboard navigation)
- Implement message pagination for large chat histories
- Add proper loading states and error messages
```

### Example Database Migration Prompt
```markdown
# Implementation Task: User Preferences Database Schema

## Context and Specifications
- **Primary Specification**: [user-preferences-spec.md#data-model]
- **Related Assets**: [current-user-schema.sql, preferences-requirements.md]
- **Dependencies**: Existing user table, Database migration system
- **Technology Stack**: PostgreSQL, Prisma ORM, TypeScript
- **Platform Target**: Database schema update

## Implementation Objective
Create database schema changes to support user preferences with proper indexing, constraints, and migration scripts for safe deployment.

## Expected Outputs
### Primary Deliverables
- [ ] prisma/migrations/add_user_preferences.sql - Database migration
- [ ] prisma/schema.prisma - Updated Prisma schema
- [ ] src/types/userPreferences.ts - TypeScript types
- [ ] prisma/seed-preferences.ts - Seed data for testing

### Supporting Artifacts
- [ ] Migration rollback script
- [ ] Database performance impact analysis
- [ ] Documentation for new schema fields

## Acceptance Criteria
- [ ] Migration runs successfully on existing database
- [ ] All existing user data remains intact
- [ ] New preferences fields have appropriate defaults
- [ ] Database constraints prevent invalid data
- [ ] Indexes are optimized for expected query patterns
- [ ] Migration is reversible with rollback script

## Implementation Guidelines
- Use proper foreign key constraints
- Add database indexes for frequently queried fields
- Include NOT NULL constraints where appropriate
- Set sensible default values for new columns
- Test migration on copy of production data
- Document any breaking changes or required application updates
```

## Core Template Structure

### Feature-Specific Implementation Prompt

```markdown
# Implementation Task: {FEATURE_NAME}

## Context and Specifications
- **Primary Specification**: [Link to relevant spec section]
- **Related Assets**: [Links to design files, data models, etc.]
- **Dependencies**: [List of prerequisite components/features]
- **Technology Stack**: {TECH_STACK}
- **Platform Target**: {PLATFORM}

## Implementation Objective
{CLEAR_OBJECTIVE_STATEMENT}

## Expected Outputs
### Primary Deliverables
- [ ] {SPECIFIC_FILE_OR_COMPONENT_1}
- [ ] {SPECIFIC_FILE_OR_COMPONENT_2}
- [ ] {SPECIFIC_FILE_OR_COMPONENT_3}

### Supporting Artifacts
- [ ] Unit tests for core functionality
- [ ] Integration tests (if applicable)
- [ ] Documentation updates
- [ ] Configuration files

## Implementation Requirements
### Functional Requirements
{SPECIFIC_FUNCTIONAL_REQUIREMENTS}

### Non-Functional Requirements
- Performance: {PERFORMANCE_CRITERIA}
- Security: {SECURITY_REQUIREMENTS}
- Accessibility: {ACCESSIBILITY_STANDARDS}
- Internationalization: {I18N_REQUIREMENTS}

## Completion Criteria
### Must Have
- [ ] All primary deliverables implemented
- [ ] Core functionality tests pass
- [ ] Code follows project conventions
- [ ] Security requirements met

### Should Have
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified
- [ ] Error handling implemented
- [ ] Logging and monitoring added

### Could Have
- [ ] Advanced optimizations
- [ ] Additional test coverage
- [ ] Documentation enhancements

## Validation Steps
1. **Syntax Validation**: Ensure code compiles/runs without errors
2. **Functional Testing**: Verify all acceptance criteria are met
3. **Integration Testing**: Confirm compatibility with existing components
4. **Quality Gates**: Run linting, security scans, performance tests
5. **Documentation Review**: Ensure all changes are documented

## Token Budget Considerations
- **Estimated Complexity**: {LOW|MEDIUM|HIGH}
- **Suggested Chunking**: {CHUNKING_STRATEGY}
- **Context Preservation**: {CONTEXT_STRATEGY}

## Dry-Run Validation
Before full implementation, validate:
- [ ] All required specifications are accessible
- [ ] Dependencies are available and compatible
- [ ] Technology stack is properly configured
- [ ] Expected outputs are clearly defined
- [ ] Success criteria are measurable
```

## Prompt Generation Rules

### 1. Feature-Specific Customization
- Extract feature requirements from specifications
- Map to appropriate technology patterns
- Include platform-specific considerations
- Reference relevant design assets and data models

### 2. Context Linking Strategy
- **Specification Links**: Direct references to requirement sections
- **Asset References**: Links to design files, schemas, examples
- **Dependency Mapping**: Clear prerequisite identification
- **Technology Context**: Stack-specific implementation guidance

### 3. Output Specification Framework
- **Primary Deliverables**: Core files/components to be created
- **Supporting Artifacts**: Tests, docs, configs
- **Quality Artifacts**: Validation results, compliance reports
- **Integration Points**: APIs, interfaces, contracts

### 4. Token Chunking Strategies

#### Low Complexity (< 2000 tokens)
- Single focused component
- Minimal dependencies
- Clear, isolated functionality

#### Medium Complexity (2000-5000 tokens)
- Multiple related components
- Some cross-component integration
- Moderate dependency complexity

#### High Complexity (> 5000 tokens)
- **Chunk by Layer**: UI, Business Logic, Data Access
- **Chunk by Feature**: Break into sub-features
- **Chunk by Platform**: Separate web/mobile implementations
- **Chunk by Phase**: Setup, Core Implementation, Integration, Testing

### 5. Validation Integration
- **Pre-Implementation**: Dry-run validation of requirements and setup
- **During Implementation**: Incremental validation at checkpoints
- **Post-Implementation**: Comprehensive validation and quality gates

## Template Variations

### Web Application Implementation
```markdown
## Technology-Specific Requirements
- **Framework**: {React|Vue|Angular|Svelte}
- **State Management**: {Redux|Zustand|Pinia|Context}
- **Styling**: {CSS Modules|Styled Components|Tailwind}
- **Build Tool**: {Vite|Webpack|Parcel}
- **Testing**: {Jest|Vitest|Cypress}

## Browser Compatibility
- Target browsers: {BROWSER_MATRIX}
- Polyfills required: {POLYFILL_LIST}
- Progressive enhancement: {ENHANCEMENT_STRATEGY}
```

### Mobile Application Implementation
```markdown
## Platform-Specific Requirements
- **iOS Minimum Version**: {IOS_VERSION}
- **Android API Level**: {ANDROID_API}
- **Cross-Platform Framework**: {React Native|Flutter|Xamarin}
- **Native Modules**: {NATIVE_REQUIREMENTS}
- **App Store Guidelines**: {COMPLIANCE_CHECKLIST}

## Device Considerations
- Screen sizes: {RESPONSIVE_BREAKPOINTS}
- Performance targets: {PERFORMANCE_METRICS}
- Offline capabilities: {OFFLINE_STRATEGY}
```

### Backend Service Implementation
```markdown
## Service Architecture
- **Runtime**: {Node.js|Python|Java|Go|Rust}
- **Framework**: {Express|FastAPI|Spring|Gin|Actix}
- **Database**: {PostgreSQL|MongoDB|Redis}
- **Authentication**: {JWT|OAuth|SAML}
- **Deployment**: {Docker|Serverless|Traditional}

## API Specifications
- **Protocol**: {REST|GraphQL|gRPC}
- **Documentation**: {OpenAPI|GraphQL Schema}
- **Versioning**: {URL|Header|Content-Type}
```

## Quality Assurance Integration

### Code Quality Gates
- Linting and formatting compliance
- Security vulnerability scanning
- Performance benchmark validation
- Test coverage requirements

### Documentation Requirements
- API documentation updates
- Architecture decision records
- Deployment guide updates
- User-facing documentation

### Deployment Readiness
- Environment configuration
- Database migrations
- Feature flags setup
- Monitoring and alerting

## Dry-Run Framework Integration

### Pre-Implementation Validation
```markdown
## Dry-Run Checklist
- [ ] All specifications are complete and accessible
- [ ] Required assets and dependencies are available
- [ ] Technology stack is compatible and configured
- [ ] Expected outputs are clearly defined and achievable
- [ ] Success criteria are specific and measurable
- [ ] Token budget is appropriate for complexity
- [ ] Validation steps are comprehensive and executable
```

### Implementation Planning
- Break down into logical phases
- Identify potential blockers and risks
- Estimate effort and complexity
- Plan validation checkpoints
- Prepare rollback strategies

## Usage Instructions

1. **Select Template Variation**: Choose based on technology stack and platform
2. **Populate Context**: Fill in specification links, assets, and dependencies
3. **Define Outputs**: Specify exact deliverables and success criteria
4. **Plan Chunking**: Determine appropriate token budget and chunking strategy
5. **Validate Setup**: Run dry-run validation before implementation
6. **Execute Implementation**: Follow prompt with incremental validation
7. **Verify Completion**: Ensure all criteria are met and quality gates pass

## Integration with Other Templates

- **Task Generation**: Use to create implementation tasks from specifications
- **Testing Strategy**: Integrate testing requirements and validation steps
- **State Management**: Include project state updates and decision logging
- **Documentation**: Ensure proper documentation updates and maintenance