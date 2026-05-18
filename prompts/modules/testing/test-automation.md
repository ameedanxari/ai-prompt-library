# Test Automation Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing automated testing frameworks including unit testing, integration testing, and end-to-end testing. It covers test organization, assertion patterns, test runners, and continuous integration strategies for both web and mobile platforms.


## Instructions

1. Review the requirements and context.
2. Apply the specified patterns and configurations.
3. Validate the implementation against expected outputs.

## Context

Modern software development requires robust automated testing to ensure code quality, prevent regressions, and enable confident deployments. This template addresses the implementation of multi-layered testing strategies that balance coverage, speed, and maintainability across different application types.

## Core Components

### Test Framework Manager Interface

## Examples

```typescript
interface TestFrameworkManager {
  configureTestRunner(config: TestRunnerConfig): Promise<void>;
  runTests(options: TestRunOptions): Promise<TestResults>;
  generateReport(results: TestResults, format: ReportFormat): Promise<TestReport>;
  watchTests(patterns: string[]): Promise<TestWatcher>;
  getTestCoverage(): Promise<CoverageReport>;
}

interface TestRunnerConfig {
  framework: TestFramework;
  testDirectory: string;
  setupFiles: string[];
  globalSetup?: string;
  globalTeardown?: string;
  testEnvironment: TestEnvironment;
  coverageThreshold: CoverageThreshold;
  reporters: TestReporter[];
  timeout: number;
  parallel: boolean;
  maxWorkers?: number;
}


enum TestFramework {
  JEST = 'jest',
  VITEST = 'vitest',
  MOCHA = 'mocha',
  PLAYWRIGHT = 'playwright',
  CYPRESS = 'cypress',
  PYTEST = 'pytest',
  JUNIT = 'junit'
}

interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  testSuites: TestSuiteResult[];
  coverage?: CoverageReport;
}

interface TestSuiteResult {
  name: string;
  file: string;
  tests: TestCaseResult[];
  duration: number;
  status: 'passed' | 'failed' | 'skipped';
}

interface TestCaseResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: TestError;
  retries?: number;
}
```

### Unit Testing Service

```typescript
interface UnitTestService {
  createTestSuite(name: string, options?: TestSuiteOptions): TestSuite;
  createMock<T>(target: T): Mock<T>;
  createSpy(fn: Function): Spy;
  createStub<T>(implementation?: Partial<T>): Stub<T>;
  assertSnapshot(value: unknown, name?: string): void;
}

class UnitTestRunner implements UnitTestService {
  private testSuites: Map<string, TestSuite> = new Map();
  
  createTestSuite(name: string, options?: TestSuiteOptions): TestSuite {
    const suite: TestSuite = {
      name,
      tests: [],
      beforeAll: [],
      afterAll: [],
      beforeEach: [],
      afterEach: [],
      options: options || {}
    };
    
    this.testSuites.set(name, suite);
    return suite;
  }

  createMock<T>(target: T): Mock<T> {
    const mock = {} as Mock<T>;
    const calls: Map<string, unknown[][]> = new Map();
    
    for (const key of Object.keys(target as object)) {
      const originalValue = (target as Record<string, unknown>)[key];
      
      if (typeof originalValue === 'function') {
        (mock as Record<string, unknown>)[key] = (...args: unknown[]) => {
          const methodCalls = calls.get(key) || [];
          methodCalls.push(args);
          calls.set(key, methodCalls);
          return undefined;
        };
      }
    }
    
    mock._calls = calls;
    mock._reset = () => calls.clear();
    
    return mock;
  }
}
```


### Integration Testing Service

```typescript
interface IntegrationTestService {
  setupTestDatabase(config: DatabaseConfig): Promise<TestDatabase>;
  createTestServer(app: Application): Promise<TestServer>;
  seedTestData(fixtures: TestFixture[]): Promise<void>;
  cleanupTestData(): Promise<void>;
  executeRequest(request: TestRequest): Promise<TestResponse>;
}

class IntegrationTestRunner implements IntegrationTestService {
  private testDatabase: TestDatabase | null = null;
  private testServer: TestServer | null = null;

  async setupTestDatabase(config: DatabaseConfig): Promise<TestDatabase> {
    const testDb: TestDatabase = {
      connection: await this.createConnection(config),
      name: `test_${Date.now()}`,
      cleanup: async () => {
        await this.dropDatabase(testDb.name);
      }
    };
    
    await this.createDatabase(testDb.name);
    await this.runMigrations(testDb.connection);
    
    this.testDatabase = testDb;
    return testDb;
  }

  async createTestServer(app: Application): Promise<TestServer> {
    const server = app.listen(0);
    const address = server.address() as AddressInfo;
    
    this.testServer = {
      url: `http://localhost:${address.port}`,
      server,
      close: () => new Promise((resolve) => server.close(resolve))
    };
    
    return this.testServer;
  }

  async executeRequest(request: TestRequest): Promise<TestResponse> {
    if (!this.testServer) {
      throw new Error('Test server not initialized');
    }

    const response = await fetch(`${this.testServer.url}${request.path}`, {
      method: request.method,
      headers: request.headers,
      body: request.body ? JSON.stringify(request.body) : undefined
    });

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: await response.json(),
      duration: 0
    };
  }
}
```


### End-to-End Testing Service

```typescript
interface E2ETestService {
  launchBrowser(options: BrowserOptions): Promise<Browser>;
  createPage(browser: Browser): Promise<Page>;
  navigateTo(page: Page, url: string): Promise<void>;
  findElement(page: Page, selector: string): Promise<Element>;
  performAction(element: Element, action: ElementAction): Promise<void>;
  takeScreenshot(page: Page, name: string): Promise<string>;
  assertVisibility(page: Page, selector: string): Promise<void>;
}

class E2ETestRunner implements E2ETestService {
  private browsers: Map<string, Browser> = new Map();

  async launchBrowser(options: BrowserOptions): Promise<Browser> {
    const browser = await playwright.chromium.launch({
      headless: options.headless ?? true,
      slowMo: options.slowMo ?? 0,
      args: options.args || []
    });

    const browserId = crypto.randomUUID();
    this.browsers.set(browserId, browser);

    return {
      id: browserId,
      type: options.browserType || 'chromium',
      close: () => browser.close()
    };
  }

  async createPage(browser: Browser): Promise<Page> {
    const playwrightBrowser = this.browsers.get(browser.id);
    if (!playwrightBrowser) {
      throw new Error('Browser not found');
    }

    const context = await playwrightBrowser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'E2E Test Runner'
    });

    return await context.newPage();
  }

  async performAction(element: Element, action: ElementAction): Promise<void> {
    switch (action.type) {
      case 'click':
        await element.click();
        break;
      case 'fill':
        await element.fill(action.value || '');
        break;
      case 'select':
        await element.selectOption(action.value || '');
        break;
      case 'hover':
        await element.hover();
        break;
      case 'press':
        await element.press(action.key || 'Enter');
        break;
    }
  }
}
```

### Native Mobile Screenshot Testing

Use `mobile-screenshot-ui-testing.md` when automated testing must produce iOS
or Android screenshots for release review, visual QA, localization validation,
or cross-platform parity. Native screenshot testing is a specialized E2E track:
the test harness must control simulator or emulator state, app launch
environment, deterministic fixtures, locale, theme, and artifact paths.

```typescript
interface NativeMobileScreenshotTestPlan {
  platforms: Array<'ios' | 'android'>;
  scenarios: Array<{
    id: string;
    screenName: string;
    requiredSelectors: string[];
    fixtureName: string;
  }>;
  locales: string[];
  deviceClasses: Array<'phone' | 'tablet'>;
  themes: Array<'light' | 'dark'>;
  artifactRoot: string;
  verification: {
    validateDimensions: boolean;
    validateLocalizedCopy: boolean;
    compareBaselines: boolean;
    collectDebugArtifacts: boolean;
  };
}

class NativeMobileScreenshotOrchestrator {
  async execute(plan: NativeMobileScreenshotTestPlan): Promise<TestResults> {
    await this.validateLocalizationKeys(plan.locales);
    await this.prepareCleanDeviceState(plan.platforms);
    const captures = await this.runNativeScreenshotHarnesses(plan);
    await this.verifyScreenshotArtifacts(captures, plan.verification);
    return this.toTestResults(captures);
  }
}
```

## Implementation Patterns

### Test Organization Pattern

```typescript
// Feature-based test organization
describe('UserAuthentication', () => {
  describe('login', () => {
    it('should authenticate valid credentials', async () => {
      const result = await authService.login({
        email: 'user@example.com',
        password: 'validPassword123'
      });
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const result = await authService.login({
        email: 'user@example.com',
        password: 'wrongPassword'
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('INVALID_CREDENTIALS');
    });
  });

  describe('logout', () => {
    it('should invalidate session on logout', async () => {
      const session = await authService.login(validCredentials);
      await authService.logout(session.token);
      
      const isValid = await authService.validateToken(session.token);
      expect(isValid).toBe(false);
    });
  });
});
```


### Assertion Patterns

```typescript
class TestAssertions {
  // Value assertions
  static assertEqual<T>(actual: T, expected: T, message?: string): void {
    if (actual !== expected) {
      throw new AssertionError(
        message || `Expected ${expected} but got ${actual}`
      );
    }
  }

  static assertDeepEqual<T>(actual: T, expected: T): void {
    const actualJson = JSON.stringify(actual, null, 2);
    const expectedJson = JSON.stringify(expected, null, 2);
    
    if (actualJson !== expectedJson) {
      throw new AssertionError(
        `Deep equality failed:\nActual: ${actualJson}\nExpected: ${expectedJson}`
      );
    }
  }

  // Async assertions
  static async assertRejects(
    fn: () => Promise<unknown>,
    expectedError?: string | RegExp
  ): Promise<void> {
    try {
      await fn();
      throw new AssertionError('Expected function to reject');
    } catch (error) {
      if (expectedError) {
        const message = (error as Error).message;
        const matches = typeof expectedError === 'string'
          ? message.includes(expectedError)
          : expectedError.test(message);
        
        if (!matches) {
          throw new AssertionError(
            `Expected error matching ${expectedError} but got: ${message}`
          );
        }
      }
    }
  }

  // Collection assertions
  static assertContains<T>(collection: T[], item: T): void {
    if (!collection.includes(item)) {
      throw new AssertionError(
        `Expected collection to contain ${JSON.stringify(item)}`
      );
    }
  }

  static assertLength<T>(collection: T[], expectedLength: number): void {
    if (collection.length !== expectedLength) {
      throw new AssertionError(
        `Expected length ${expectedLength} but got ${collection.length}`
      );
    }
  }
}
```

### Test Fixture Pattern

```typescript
class TestFixtureManager {
  private fixtures: Map<string, TestFixture> = new Map();

  registerFixture<T>(name: string, factory: () => T | Promise<T>): void {
    this.fixtures.set(name, {
      name,
      factory,
      instances: []
    });
  }

  async getFixture<T>(name: string): Promise<T> {
    const fixture = this.fixtures.get(name);
    if (!fixture) {
      throw new Error(`Fixture ${name} not found`);
    }

    const instance = await fixture.factory();
    fixture.instances.push(instance);
    return instance as T;
  }

  async cleanupFixtures(): Promise<void> {
    for (const fixture of this.fixtures.values()) {
      for (const instance of fixture.instances) {
        if (instance && typeof instance.cleanup === 'function') {
          await instance.cleanup();
        }
      }
      fixture.instances = [];
    }
  }
}

// Usage example
const fixtureManager = new TestFixtureManager();

fixtureManager.registerFixture('testUser', async () => {
  const user = await userService.create({
    email: `test-${Date.now()}@example.com`,
    name: 'Test User'
  });
  
  return {
    ...user,
    cleanup: () => userService.delete(user.id)
  };
});
```


## Integration Points

### CI/CD Pipeline Integration

```typescript
interface CIPipelineIntegration {
  configureTestStage(config: TestStageConfig): PipelineStage;
  parseTestResults(output: string): TestResults;
  publishResults(results: TestResults, destination: ResultDestination): Promise<void>;
  failPipelineOnThreshold(results: TestResults, threshold: QualityThreshold): boolean;
}

class GitHubActionsIntegration implements CIPipelineIntegration {
  configureTestStage(config: TestStageConfig): PipelineStage {
    return {
      name: 'test',
      runs_on: 'ubuntu-latest',
      steps: [
        {
          name: 'Checkout',
          uses: 'actions/checkout@v4'
        },
        {
          name: 'Setup Node.js',
          uses: 'actions/setup-node@v4',
          with: { 'node-version': config.nodeVersion || '20' }
        },
        {
          name: 'Install dependencies',
          run: 'npm ci'
        },
        {
          name: 'Run tests',
          run: `npm test -- --coverage --reporter=json --outputFile=test-results.json`,
          env: config.environment
        },
        {
          name: 'Upload coverage',
          uses: 'codecov/codecov-action@v3',
          if: 'always()'
        }
      ]
    };
  }

  failPipelineOnThreshold(results: TestResults, threshold: QualityThreshold): boolean {
    if (results.failed > 0) return true;
    
    if (results.coverage) {
      if (results.coverage.lines < threshold.lineCoverage) return true;
      if (results.coverage.branches < threshold.branchCoverage) return true;
      if (results.coverage.functions < threshold.functionCoverage) return true;
    }
    
    return false;
  }
}
```

### Test Reporting Integration

```typescript
interface TestReportingService {
  generateHTMLReport(results: TestResults): string;
  generateJUnitXML(results: TestResults): string;
  sendSlackNotification(results: TestResults, webhookUrl: string): Promise<void>;
}

class TestReporter implements TestReportingService {
  generateJUnitXML(results: TestResults): string {
    const testsuites = results.testSuites.map(suite => {
      const testcases = suite.tests.map(test => {
        let testcase = `<testcase name="${this.escapeXml(test.name)}" ` +
          `classname="${this.escapeXml(suite.name)}" ` +
          `time="${test.duration / 1000}">`;
        
        if (test.status === 'failed' && test.error) {
          testcase += `<failure message="${this.escapeXml(test.error.message)}">` +
            `${this.escapeXml(test.error.stack || '')}</failure>`;
        } else if (test.status === 'skipped') {
          testcase += '<skipped/>';
        }
        
        testcase += '</testcase>';
        return testcase;
      }).join('\n');

      return `<testsuite name="${this.escapeXml(suite.name)}" ` +
        `tests="${suite.tests.length}" ` +
        `failures="${suite.tests.filter(t => t.status === 'failed').length}" ` +
        `skipped="${suite.tests.filter(t => t.status === 'skipped').length}" ` +
        `time="${suite.duration / 1000}">\n${testcases}\n</testsuite>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites>\n${testsuites}\n</testsuites>`;
  }

  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
```


## Security Considerations

### Test Data Security

```typescript
class SecureTestDataManager {
  private sensitivePatterns = [
    /password/i,
    /secret/i,
    /api[_-]?key/i,
    /token/i,
    /credential/i
  ];

  sanitizeTestOutput(output: string): string {
    let sanitized = output;
    
    for (const pattern of this.sensitivePatterns) {
      sanitized = sanitized.replace(
        new RegExp(`(${pattern.source})\\s*[:=]\\s*["']?[^"'\\s]+["']?`, 'gi'),
        '$1: [REDACTED]'
      );
    }
    
    return sanitized;
  }

  validateNoSecretsInTests(testFiles: string[]): ValidationResult {
    const violations: SecretViolation[] = [];
    
    for (const file of testFiles) {
      const content = readFileSync(file, 'utf-8');
      
      // Check for hardcoded secrets
      const secretPatterns = [
        /['"][A-Za-z0-9+/]{40,}['"]/g,  // Base64 encoded secrets
        /['"]sk_[a-zA-Z0-9]{24,}['"]/g,  // Stripe-like keys
        /['"]ghp_[a-zA-Z0-9]{36}['"]/g   // GitHub tokens
      ];
      
      for (const pattern of secretPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          violations.push({
            file,
            pattern: pattern.toString(),
            matches: matches.length
          });
        }
      }
    }
    
    return {
      valid: violations.length === 0,
      violations
    };
  }
}
```

### Test Environment Isolation

```typescript
class TestEnvironmentIsolation {
  async createIsolatedEnvironment(config: IsolationConfig): Promise<IsolatedEnv> {
    const envId = crypto.randomUUID();
    
    // Create isolated database
    const database = await this.createIsolatedDatabase(envId);
    
    // Create isolated file system
    const fileSystem = await this.createIsolatedFileSystem(envId);
    
    // Create isolated network
    const network = config.networkIsolation
      ? await this.createIsolatedNetwork(envId)
      : null;

    return {
      id: envId,
      database,
      fileSystem,
      network,
      cleanup: async () => {
        await database.drop();
        await fileSystem.remove();
        if (network) await network.destroy();
      }
    };
  }

  private async createIsolatedDatabase(envId: string): Promise<IsolatedDatabase> {
    const dbName = `test_${envId.replace(/-/g, '_')}`;
    
    await this.dbClient.query(`CREATE DATABASE ${dbName}`);
    
    return {
      name: dbName,
      connectionString: `postgresql://localhost/${dbName}`,
      drop: () => this.dbClient.query(`DROP DATABASE IF EXISTS ${dbName}`)
    };
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Test Framework Properties', () => {
  it('should maintain test isolation across runs', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        name: fc.string({ minLength: 1 }),
        shouldPass: fc.boolean()
      }), { minLength: 1, maxLength: 20 }),
      async (testCases) => {
        const runner = new UnitTestRunner();
        const results: boolean[] = [];
        
        for (const testCase of testCases) {
          const result = await runner.runTest(testCase);
          results.push(result.passed === testCase.shouldPass);
        }
        
        // All tests should produce expected results
        return results.every(r => r === true);
      }
    ));
  });

  it('should generate consistent coverage reports', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 5 }),
      async (iterations) => {
        const coverageReports: CoverageReport[] = [];
        
        for (let i = 0; i < iterations; i++) {
          const report = await testRunner.getTestCoverage();
          coverageReports.push(report);
        }
        
        // Coverage should be consistent across runs
        const firstReport = coverageReports[0];
        return coverageReports.every(report =>
          report.lines === firstReport.lines &&
          report.branches === firstReport.branches
        );
      }
    ));
  });
});
```

## Configuration Examples

### Jest Configuration

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/*.test.ts', '**/*.spec.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
```

### Vitest Configuration

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    },
    setupFiles: ['./tests/setup.ts'],
    testTimeout: 10000
  }
});
```
