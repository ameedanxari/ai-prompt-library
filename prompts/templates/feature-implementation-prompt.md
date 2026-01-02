# Feature Implementation Prompt Template

## Purpose
Generate implementation prompts for specific features that include all necessary context, clear deliverables, and comprehensive validation steps.

# Feature Implementation Prompt Template

## Purpose
Generate implementation prompts for specific features that include all necessary context, clear deliverables, and comprehensive validation steps.

## Instructions
Use this template to create comprehensive implementation prompts that provide developers with all the context, requirements, and guidance needed to successfully implement features.

1. **Gather Feature Context**: Collect requirements, designs, and technical specifications
2. **Define Implementation Scope**: Break down the feature into manageable components
3. **Specify Technical Requirements**: Define technology stack, patterns, and constraints
4. **Create Validation Criteria**: Establish clear acceptance criteria and testing requirements
5. **Provide Implementation Guidance**: Include examples, best practices, and common pitfalls

## Examples

### Example Feature Implementation Prompt
```markdown
# Implement Feature: User Authentication System

## Feature Overview
**Description**: Implement secure user authentication with JWT tokens, password hashing, and session management
**User Story**: As a user, I want to securely log in and maintain my session across the application
**Business Value**: Enables personalized user experiences and protects user data

## Context and References
### Specifications
- **Requirements Document**: [auth-requirements.md#user-authentication]
- **Design Document**: [auth-design.md#authentication-flow]
- **API Specification**: [api-docs.md#authentication-endpoints]
- **Data Models**: [schema.md#user-model]

### Technology Context
- **Primary Language**: TypeScript
- **Framework**: Express.js with Node.js
- **Platform**: Web API
- **Architecture Pattern**: RESTful API with middleware
- **Database**: PostgreSQL with Prisma ORM

## Implementation Scope

### Core Components
1. **Authentication Middleware**
   - Purpose: Validate JWT tokens and protect routes
   - Location: src/middleware/auth.ts
   - Key Methods: validateToken, extractUser, requireAuth

2. **User Service**
   - Purpose: Handle user registration, login, and profile management
   - Location: src/services/userService.ts
   - Key Methods: register, login, refreshToken, updateProfile

3. **Password Security**
   - Purpose: Hash passwords and validate credentials
   - Location: src/utils/password.ts
   - Key Methods: hashPassword, validatePassword, generateSalt

## Acceptance Criteria
- [ ] Users can register with email and password
- [ ] Users can log in with valid credentials
- [ ] JWT tokens are properly generated and validated
- [ ] Passwords are securely hashed using bcrypt
- [ ] Protected routes require valid authentication
- [ ] Token refresh mechanism works correctly
- [ ] All authentication endpoints return appropriate error messages

## Implementation Guidelines
- Use bcrypt with minimum 12 rounds for password hashing
- JWT tokens should expire after 1 hour with refresh tokens valid for 7 days
- Implement rate limiting on authentication endpoints
- Log all authentication attempts for security monitoring
- Follow OWASP security guidelines for authentication
```

### Example Component Implementation Prompt
```markdown
# Implement Component: Real-time Notification System

## Component Overview
**Purpose**: Deliver real-time notifications to users via WebSocket connections
**Integration**: Connects with user service, notification service, and frontend clients

## Technical Requirements
- WebSocket server using Socket.io
- Redis for managing connection state
- Event-driven architecture for notification triggers
- Support for different notification types (info, warning, error)

## Implementation Details

### WebSocket Server Setup
```typescript
// src/websocket/notificationServer.ts
import { Server } from 'socket.io';
import { authenticateSocket } from '../middleware/socketAuth';

export class NotificationServer {
  private io: Server;
  
  constructor(server: any) {
    this.io = new Server(server, {
      cors: { origin: process.env.CLIENT_URL }
    });
    
    this.setupMiddleware();
    this.setupEventHandlers();
  }
  
  private setupMiddleware() {
    this.io.use(authenticateSocket);
  }
  
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.userId}`);
      
      socket.join(`user:${socket.userId}`);
      
      socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.userId}`);
      });
    });
  }
  
  public sendNotification(userId: string, notification: Notification) {
    this.io.to(`user:${userId}`).emit('notification', notification);
  }
}
```

## Validation Steps
1. Test WebSocket connection establishment
2. Verify user authentication for socket connections
3. Test notification delivery to correct users
4. Validate notification format and content
5. Test connection cleanup on disconnect
```

## Template Structure

```markdown
# Implement Feature: {FEATURE_NAME}

## Feature Overview
**Description**: {FEATURE_DESCRIPTION}
**User Story**: {USER_STORY}
**Business Value**: {BUSINESS_JUSTIFICATION}

## Context and References
### Specifications
- **Requirements Document**: [Link to requirements section]
- **Design Document**: [Link to design section]
- **API Specification**: [Link to API docs]
- **Data Models**: [Link to schema definitions]

### Related Assets
- **UI/UX Designs**: [Links to design files]
- **User Flows**: [Links to flow diagrams]
- **Test Data**: [Links to sample data]
- **Configuration**: [Links to config templates]

### Dependencies
- **Prerequisite Features**: {DEPENDENCY_LIST}
- **External Services**: {SERVICE_DEPENDENCIES}
- **Third-Party Libraries**: {LIBRARY_DEPENDENCIES}
- **Infrastructure**: {INFRASTRUCTURE_REQUIREMENTS}

## Technology Context
- **Primary Language**: {PROGRAMMING_LANGUAGE}
- **Framework**: {FRAMEWORK_NAME}
- **Platform**: {TARGET_PLATFORM}
- **Architecture Pattern**: {ARCHITECTURE_STYLE}
- **Database**: {DATABASE_TECHNOLOGY}

## Implementation Scope

### Core Components
1. **{COMPONENT_1}**
   - Purpose: {COMPONENT_PURPOSE}
   - Location: {FILE_PATH}
   - Key Methods/Functions: {METHOD_LIST}

2. **{COMPONENT_2}**
   - Purpose: {COMPONENT_PURPOSE}
   - Location: {FILE_PATH}
   - Key Methods/Functions: {METHOD_LIST}

### Supporting Components
- **Configuration**: {CONFIG_FILES}
- **Utilities**: {UTILITY_FUNCTIONS}
- **Types/Interfaces**: {TYPE_DEFINITIONS}
- **Constants**: {CONSTANT_DEFINITIONS}

## Detailed Requirements

### Functional Requirements
{FUNCTIONAL_REQUIREMENTS_LIST}

### Non-Functional Requirements
- **Performance**: {PERFORMANCE_CRITERIA}
- **Security**: {SECURITY_REQUIREMENTS}
- **Scalability**: {SCALABILITY_REQUIREMENTS}
- **Reliability**: {RELIABILITY_REQUIREMENTS}
- **Usability**: {USABILITY_REQUIREMENTS}

### Compliance Requirements
- **Accessibility**: WCAG 2.1 AA compliance
- **Privacy**: GDPR/CCPA compliance for data handling
- **Security**: OWASP guidelines for web security
- **Internationalization**: Support for {LOCALE_LIST}

## Expected Deliverables

### Primary Files
- [ ] `{FILE_PATH_1}` - {FILE_DESCRIPTION}
- [ ] `{FILE_PATH_2}` - {FILE_DESCRIPTION}
- [ ] `{FILE_PATH_3}` - {FILE_DESCRIPTION}

### Test Files
- [ ] `{TEST_FILE_1}` - Unit tests for core functionality
- [ ] `{TEST_FILE_2}` - Integration tests for API endpoints
- [ ] `{TEST_FILE_3}` - Property-based tests for business logic

### Configuration Files
- [ ] `{CONFIG_FILE_1}` - Environment configuration
- [ ] `{CONFIG_FILE_2}` - Feature flags configuration
- [ ] `{CONFIG_FILE_3}` - Deployment configuration

### Documentation
- [ ] API documentation updates
- [ ] Architecture decision record
- [ ] User guide updates
- [ ] Developer setup instructions

## Implementation Guidelines

### Code Standards
- Follow project coding conventions
- Use consistent naming patterns
- Include comprehensive error handling
- Add appropriate logging and monitoring
- Implement proper input validation

### Security Considerations
- Validate all user inputs
- Implement proper authentication/authorization
- Use parameterized queries for database access
- Sanitize outputs to prevent XSS
- Follow principle of least privilege

### Performance Optimization
- Implement efficient algorithms
- Use appropriate caching strategies
- Minimize database queries
- Optimize for target platform constraints
- Consider memory usage and garbage collection

## Acceptance Criteria

### Must Have (P0)
- [ ] All functional requirements implemented
- [ ] Core user flows work end-to-end
- [ ] Security requirements met
- [ ] Performance criteria satisfied
- [ ] All tests pass

### Should Have (P1)
- [ ] Error handling covers edge cases
- [ ] Logging provides adequate debugging info
- [ ] Accessibility requirements met
- [ ] Internationalization support implemented
- [ ] Documentation is complete and accurate

### Could Have (P2)
- [ ] Advanced optimizations implemented
- [ ] Additional test coverage added
- [ ] Enhanced user experience features
- [ ] Monitoring and analytics integrated
- [ ] Future extensibility considered

## Validation Steps

### 1. Pre-Implementation Validation
- [ ] All specifications are complete and consistent
- [ ] Dependencies are available and compatible
- [ ] Development environment is properly configured
- [ ] Required assets and resources are accessible

### 2. Implementation Validation
- [ ] Code compiles without errors or warnings
- [ ] Unit tests pass with adequate coverage
- [ ] Integration tests validate end-to-end functionality
- [ ] Security scans show no critical vulnerabilities
- [ ] Performance benchmarks meet requirements

### 3. Quality Assurance
- [ ] Code review completed and approved
- [ ] Documentation reviewed and updated
- [ ] Accessibility testing completed
- [ ] Cross-browser/platform testing passed
- [ ] User acceptance criteria validated

### 4. Deployment Readiness
- [ ] Configuration files updated for all environments
- [ ] Database migrations prepared and tested
- [ ] Feature flags configured appropriately
- [ ] Monitoring and alerting configured
- [ ] Rollback plan documented and tested

## Token Budget Management

### Complexity Assessment
**Estimated Complexity**: {LOW|MEDIUM|HIGH}
**Reasoning**: {COMPLEXITY_JUSTIFICATION}

### Chunking Strategy
{CHUNKING_APPROACH}

### Context Preservation
- Use consistent variable names across chunks
- Maintain clear interfaces between components
- Document assumptions and decisions
- Provide context summaries at chunk boundaries

## Risk Mitigation

### Technical Risks
- **Risk**: {TECHNICAL_RISK}
  - **Mitigation**: {MITIGATION_STRATEGY}
  - **Contingency**: {BACKUP_PLAN}

### Integration Risks
- **Risk**: {INTEGRATION_RISK}
  - **Mitigation**: {MITIGATION_STRATEGY}
  - **Contingency**: {BACKUP_PLAN}

### Performance Risks
- **Risk**: {PERFORMANCE_RISK}
  - **Mitigation**: {MITIGATION_STRATEGY}
  - **Contingency**: {BACKUP_PLAN}

## Success Metrics

### Functional Metrics
- All acceptance criteria met
- Zero critical bugs in production
- Performance targets achieved
- Security requirements satisfied

### Quality Metrics
- Code coverage > {COVERAGE_THRESHOLD}%
- Technical debt within acceptable limits
- Documentation completeness score > {DOC_THRESHOLD}%
- User satisfaction score > {SATISFACTION_THRESHOLD}

### Business Metrics
- Feature adoption rate
- User engagement metrics
- Performance impact on business KPIs
- Cost efficiency compared to alternatives

## Post-Implementation Tasks

### Immediate
- [ ] Deploy to staging environment
- [ ] Conduct user acceptance testing
- [ ] Monitor performance and error rates
- [ ] Gather initial user feedback

### Short-term (1-2 weeks)
- [ ] Analyze usage patterns and performance
- [ ] Address any critical issues discovered
- [ ] Optimize based on real-world usage
- [ ] Update documentation based on learnings

### Long-term (1-3 months)
- [ ] Evaluate feature success against business metrics
- [ ] Plan enhancements based on user feedback
- [ ] Consider technical debt reduction opportunities
- [ ] Document lessons learned for future features
```

## Usage Instructions

1. **Feature Analysis**: Review feature requirements and design specifications
2. **Context Gathering**: Collect all relevant assets, dependencies, and constraints
3. **Scope Definition**: Clearly define what will be implemented and what won't
4. **Template Population**: Fill in all template sections with specific details
5. **Validation Planning**: Define comprehensive validation steps and criteria
6. **Risk Assessment**: Identify potential risks and mitigation strategies
7. **Success Definition**: Establish clear, measurable success criteria
8. **Implementation Execution**: Use the populated template to guide development

## Integration Points

- **Requirements Traceability**: Links back to original requirements
- **Design Consistency**: Ensures implementation matches design specifications
- **Testing Strategy**: Integrates with overall testing approach
- **Documentation**: Maintains comprehensive project documentation
- **Quality Assurance**: Enforces quality gates and standards
- **Project Management**: Provides clear deliverables and timelines