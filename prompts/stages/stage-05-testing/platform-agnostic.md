# Stage 05 - Testing: Platform-Agnostic Strategy

## Purpose
Define comprehensive testing strategy that applies across all platforms, establishing core testing principles, frameworks, and quality assurance procedures.

## Instructions
Use this template to establish a comprehensive testing strategy that covers unit testing, integration testing, end-to-end testing, and quality assurance. Focus on creating testable requirements and automated validation processes.

## Non-Negotiable Testing Outputs
Stage 05 must produce these artifacts before moving forward:
- `prompts/outputs/specifications/testing-strategy.md`
- `prompts/outputs/specifications/integration-test-plan.md`
- `prompts/outputs/specifications/prompt-usage-log.md` (Stage 05 entry)

## Examples
```markdown
## Testing Strategy for User Authentication System

### Unit Testing Example
```javascript
describe('Password Validation', () => {
  it('should require minimum 8 characters', () => {
    expect(validatePassword('short')).toBe(false);
    expect(validatePassword('longenough')).toBe(true);
  });
  
  it('should require special characters', () => {
    expect(validatePassword('password123')).toBe(false);
    expect(validatePassword('password123!')).toBe(true);
  });
});
```

### Integration Testing Example
```javascript
describe('Authentication API', () => {
  it('should authenticate valid users', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@example.com', password: 'validpassword!' });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

### E2E Testing Example
```javascript
test('User can complete login flow', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[data-testid=email]', 'user@example.com');
  await page.fill('[data-testid=password]', 'validpassword!');
  await page.click('[data-testid=login-button]');
  await expect(page).toHaveURL('/dashboard');
});
```
```

## Core Testing Framework

### Platform-Agnostic Foundation
This testing strategy builds upon the core requirements established in [stage-01-intake platform-agnostic.md](../stage-01-intake/platform-agnostic.md):
- Requirements validation and traceability
- Asset organization and quality standards
- Technology stack compatibility
- Quality assurance principles

### Testing Philosophy
```markdown
## Testing Strategy Overview

### Dual Testing Approach
**Unit Testing**: Verify specific examples, edge cases, and error conditions
**Property-Based Testing**: Verify universal properties across all inputs
**Integration Testing**: Verify component interactions and data flow
**End-to-End Testing**: Verify complete user workflows and business processes

### Quality Assurance Principles
1. **Test-Driven Development**: Write tests before implementation
2. **Comprehensive Coverage**: Aim for 85%+ code coverage
3. **Automated Validation**: Automate all repeatable tests
4. **Continuous Testing**: Integrate testing into CI/CD pipeline
5. **Quality Gates**: Enforce quality standards at each stage
```

### Testing Categories and Scope
```markdown
## Testing Categories

### Architecture Testing
**Scope**: System architecture, component interactions, data flow validation
**Framework**: Architecture decision records (ADRs), dependency analysis tools
**Coverage Target**: All architectural decisions and patterns
**Execution**: Automated architecture compliance checks

#### Architecture Test Requirements
- **Component Dependencies**: Validate dependency directions and boundaries
- **Data Flow**: Verify data flows through system layers
- **API Contracts**: Validate API specifications and implementations
- **Security Architecture**: Test security boundaries and access controls
- **Performance Architecture**: Validate scalability and performance patterns

### 1. Unit Testing
**Scope**: Individual functions, classes, and modules
**Framework**: [Language-specific framework - Jest, pytest, JUnit, etc.]
**Coverage Target**: 90%+ for business logic
**Execution**: Automated in CI/CD pipeline

#### Unit Test Requirements
- **Business Logic**: All business rules and calculations
- **Data Validation**: Input validation and sanitization
- **Error Handling**: Exception handling and error conditions
- **Edge Cases**: Boundary conditions and corner cases
- **Utility Functions**: Helper functions and utilities

#### Unit Test Structure
```javascript
// Example unit test structure
describe('Feature: User Authentication', () => {
  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      // Test valid password scenarios
    });
    
    it('should reject invalid passwords', () => {
      // Test invalid password scenarios
    });
    
    it('should handle edge cases', () => {
      // Test boundary conditions
    });
  });
});
```

### 2. Property-Based Testing
**Scope**: Universal properties that should hold for all valid inputs
**Framework**: [QuickCheck, Hypothesis, fast-check, etc.]
**Coverage Target**: All critical business rules
**Execution**: Minimum 100 iterations per property

#### Property Test Requirements
- **Invariants**: Properties that remain constant after operations
- **Round-Trip Properties**: Operations that should be reversible
- **Idempotence**: Operations that can be repeated safely
- **Metamorphic Properties**: Relationships between inputs and outputs
- **Error Conditions**: Invalid inputs should be handled gracefully

#### Property Test Structure
```javascript
// Example property test structure
describe('Property Tests: Task Management', () => {
  property('adding a task increases list length', 
    fc.string().filter(s => s.trim().length > 0),
    (taskDescription) => {
      const initialList = createTaskList();
      const initialLength = initialList.length;
      
      initialList.addTask(taskDescription);
      
      expect(initialList.length).toBe(initialLength + 1);
    }
  );
});
```

### 3. Integration Testing
**Scope**: Component interactions, API endpoints, database operations
**Framework**: [Supertest, TestContainers, etc.]
**Coverage Target**: All integration points
**Execution**: Automated with test databases/services

#### Integration Test Requirements
- **API Endpoints**: All REST/GraphQL endpoints
- **Database Operations**: CRUD operations and queries
- **External Services**: Third-party API integrations
- **Message Queues**: Async communication patterns
- **File Operations**: File upload/download and processing

### 4. End-to-End Testing
**Scope**: Complete user workflows and business processes
**Framework**: [Playwright, Cypress, Selenium, etc.]
**Coverage Target**: Critical user journeys
**Execution**: Automated in staging environment

#### E2E Test Requirements
- **User Registration/Login**: Complete authentication flows
- **Core Features**: Primary user workflows
- **Payment Processing**: Financial transaction flows
- **Data Import/Export**: Bulk operations and file handling
- **Admin Functions**: Administrative workflows
```

### Quality Assurance Framework
```markdown
## Quality Assurance Strategy

### Code Quality Standards
#### Static Analysis
- **Linting**: Enforce coding standards and best practices
- **Type Checking**: Ensure type safety (TypeScript, mypy, etc.)
- **Security Scanning**: Identify security vulnerabilities
- **Dependency Auditing**: Check for vulnerable dependencies

#### Code Review Requirements
- **Peer Review**: All code changes require review
- **Automated Checks**: CI/CD pipeline validates quality
- **Documentation**: Code changes include documentation updates
- **Test Coverage**: New code includes appropriate tests

### Performance Testing
#### Load Testing
- **Concurrent Users**: Test with expected user load
- **Response Times**: Validate response time requirements
- **Throughput**: Measure requests per second capacity
- **Resource Usage**: Monitor CPU, memory, and database usage

#### Stress Testing
- **Breaking Point**: Identify system limits
- **Recovery**: Test system recovery after overload
- **Degradation**: Validate graceful degradation under load
- **Scalability**: Test horizontal and vertical scaling

### Security Testing
#### Vulnerability Assessment
- **OWASP Top 10**: Test for common web vulnerabilities
- **Authentication**: Validate authentication mechanisms
- **Authorization**: Test access control and permissions
- **Data Protection**: Verify data encryption and privacy

#### Penetration Testing
- **Automated Scanning**: Use security scanning tools
- **Manual Testing**: Conduct manual security assessments
- **Social Engineering**: Test human factors in security
- **Infrastructure**: Assess server and network security

### Accessibility Testing
#### WCAG Compliance
- **Level AA**: Ensure WCAG 2.1 AA compliance
- **Screen Readers**: Test with assistive technologies
- **Keyboard Navigation**: Validate keyboard-only usage
- **Color Contrast**: Verify sufficient color contrast ratios

#### Automated Accessibility Testing
- **axe-core**: Integrate automated accessibility testing
- **Lighthouse**: Use Lighthouse accessibility audits
- **Pa11y**: Command-line accessibility testing
- **Manual Testing**: Conduct manual accessibility reviews

### Internationalization Testing
#### Localization Validation
- **Text Expansion**: Test UI with longer translated text
- **RTL Languages**: Validate right-to-left language support
- **Character Encoding**: Test Unicode and special characters
- **Date/Time Formats**: Validate locale-specific formatting

#### Cultural Adaptation
- **Currency**: Test different currency formats
- **Number Formats**: Validate locale-specific number formatting
- **Address Formats**: Test international address formats
- **Cultural Sensitivity**: Review content for cultural appropriateness
```

## Testing Infrastructure

### Test Environment Management
```markdown
## Test Environment Strategy

### Environment Types
#### Development Environment
- **Purpose**: Developer testing and debugging
- **Data**: Synthetic test data
- **Services**: Local or containerized services
- **Refresh**: On-demand reset capability

#### Staging Environment
- **Purpose**: Pre-production testing and validation
- **Data**: Production-like data (anonymized)
- **Services**: Production-equivalent services
- **Refresh**: Regular data refresh from production

#### Testing Environment
- **Purpose**: Automated test execution
- **Data**: Controlled test datasets
- **Services**: Isolated test services
- **Refresh**: Clean state for each test run

### Test Data Management
#### Test Data Strategy
- **Synthetic Data**: Generated test data for development
- **Anonymized Data**: Production data with PII removed
- **Seed Data**: Consistent baseline data for tests
- **Dynamic Data**: Generated data for specific test scenarios
- **Centralized Mock Data**: Shared mock data across all platforms

#### Centralized Mock Data Integration
All test environments should use centralized mock data to ensure consistency:

**Mock Data Directory Structure:**
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
└── index.json
```

**Mock Data Usage in Tests:**
```javascript
// Import centralized mock data
import userSuccess from '@mocks/api/v1/users/GET/200-success.json';
import userError from '@mocks/api/v1/users/GET/500-server-error.json';

describe('User API Tests', () => {
  it('should handle successful response', () => {
    // Use centralized mock data
    mockServer.use(
      rest.get('/api/v1/users', (req, res, ctx) => {
        return res(ctx.json(userSuccess));
      })
    );
  });
});
```

**Reference Module:** `#[[module:testing/centralized-mock-data.md]]`

#### Fake Backend Integration
For integration testing, use a fake backend server instead of network mocks:

**Fake Backend Setup:**
```javascript
// Start fake backend before tests
beforeAll(async () => {
  await startFakeBackend({ port: 3001 });
  await waitForFakeBackendReady();
});

afterAll(async () => {
  await stopFakeBackend();
});

// Tests make real HTTP requests to fake backend
test('should fetch users', async () => {
  const response = await fetch('http://localhost:3001/api/v1/users');
  expect(response.status).toBe(200);
});
```

**Scenario Selection:**
```javascript
// Select specific response scenarios via headers
const response = await fetch('/api/v1/users', {
  headers: { 'X-Mock-Scenario': 'validation_error' }
});
expect(response.status).toBe(400);
```

**Reference Module:** `#[[module:testing/fake-backend-generator.md]]`

#### Data Privacy and Security
- **PII Handling**: Ensure no real PII in test environments
- **Data Masking**: Mask sensitive data in non-production environments
- **Access Control**: Restrict access to test data
- **Compliance**: Ensure GDPR/CCPA compliance in test data
```

### Continuous Integration Testing
```markdown
## CI/CD Testing Pipeline

### Pipeline Stages
#### Pre-Commit Hooks
- **Linting**: Code style and quality checks
- **Unit Tests**: Fast unit test execution
- **Type Checking**: Static type validation
- **Security Scanning**: Basic security checks

#### Commit Pipeline
- **Full Unit Tests**: Complete unit test suite
- **Integration Tests**: Component integration validation
- **Code Coverage**: Coverage reporting and validation
- **Build Verification**: Ensure successful build

#### Deployment Pipeline
- **E2E Tests**: Critical user journey validation
- **Performance Tests**: Load and performance validation
- **Security Tests**: Comprehensive security scanning
- **Accessibility Tests**: Automated accessibility validation

### Pipeline Configuration
```yaml
# Example CI/CD pipeline configuration
name: Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run unit tests
        run: npm run test:unit -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v2

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    steps:
      - uses: actions/checkout@v2
      - name: Setup test environment
        run: docker-compose up -d
      - name: Run integration tests
        run: npm run test:integration
      - name: Cleanup
        run: docker-compose down

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v2
      - name: Setup E2E environment
        run: npm run setup:e2e
      - name: Run E2E tests
        run: npm run test:e2e
      - name: Upload test artifacts
        uses: actions/upload-artifact@v2
        if: failure()
        with:
          name: e2e-screenshots
          path: tests/e2e/screenshots/
```
```

## Test Documentation and Reporting

### Test Documentation Standards
```markdown
## Documentation Requirements

### Test Plan Documentation
#### Test Strategy Document
- **Scope**: What will and won't be tested
- **Approach**: Testing methodologies and frameworks
- **Resources**: Tools, environments, and personnel
- **Schedule**: Testing timeline and milestones
- **Risks**: Potential risks and mitigation strategies

#### Test Case Documentation
- **Test ID**: Unique identifier for each test
- **Description**: Clear description of what is being tested
- **Prerequisites**: Setup requirements and dependencies
- **Steps**: Detailed execution steps
- **Expected Results**: Expected outcomes and validation criteria

### Test Reporting
#### Test Execution Reports
- **Coverage Reports**: Code coverage metrics and analysis
- **Test Results**: Pass/fail status and execution details
- **Performance Reports**: Load testing and performance metrics
- **Security Reports**: Vulnerability assessment results
- **Accessibility Reports**: WCAG compliance validation

#### Quality Metrics Dashboard
- **Test Coverage**: Overall and per-component coverage
- **Test Execution Trends**: Pass/fail rates over time
- **Defect Metrics**: Bug discovery and resolution rates
- **Performance Trends**: Response time and throughput trends
- **Quality Gates**: Status of quality gate compliance
```

## Risk Management and Mitigation

### Testing Risk Assessment
```markdown
## Risk Management Framework

### Mock Data Validation Checklist
Before running tests, validate mock data integrity:

- [ ] **Schema Compliance**: All mock data files validate against API schemas
- [ ] **Status Code Coverage**: Each endpoint has mocks for success and error cases
- [ ] **Naming Convention**: Mock files follow `{status-code}-{description}.json` pattern
- [ ] **No Platform Duplicates**: All platforms reference centralized mock data
- [ ] **Index Updated**: `mocks/index.json` includes all mock files
- [ ] **Contract Alignment**: Mock data matches API contract specifications
- [ ] **Version Tracking**: Mock data version matches API version

**Mock Data Validation Script:**
```javascript
// Validate all mock data before test runs
const validateMockData = async () => {
  const mockIndex = require('./mocks/index.json');
  const Ajv = require('ajv');
  const ajv = new Ajv();
  
  for (const endpoint of mockIndex.endpoints) {
    const schema = require(`./mocks/${endpoint.schema}`);
    const validate = ajv.compile(schema);
    
    for (const [method, statusCodes] of Object.entries(endpoint.mockFiles)) {
      for (const [code, mockFile] of Object.entries(statusCodes)) {
        const mockData = require(`./mocks/${mockFile}`);
        if (!validate(mockData)) {
          console.error(`Invalid mock: ${mockFile}`, validate.errors);
          process.exit(1);
        }
      }
    }
  }
  
  console.log('All mock data validated successfully');
};
```

### Common Testing Risks
#### Technical Risks
- **Environment Issues**: Test environment instability
- **Data Issues**: Insufficient or poor quality test data
- **Tool Limitations**: Testing tool constraints or failures
- **Integration Complexity**: Complex system interactions

#### Process Risks
- **Time Constraints**: Insufficient time for thorough testing
- **Resource Constraints**: Limited testing resources or expertise
- **Requirement Changes**: Frequent requirement modifications
- **Communication Issues**: Poor communication between teams

### Risk Mitigation Strategies
#### Technical Mitigation
- **Environment Automation**: Automated environment provisioning
- **Data Management**: Robust test data management processes
- **Tool Redundancy**: Multiple testing tools and approaches
- **Monitoring**: Comprehensive test execution monitoring

#### Process Mitigation
- **Early Testing**: Shift-left testing approach
- **Risk-Based Testing**: Focus on high-risk areas
- **Continuous Communication**: Regular stakeholder updates
- **Flexible Planning**: Adaptive test planning and execution
```

This platform-agnostic testing strategy provides a comprehensive foundation for quality assurance across all platforms while maintaining consistency in testing approaches and quality standards.
