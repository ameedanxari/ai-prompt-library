# CI/CD Testing Template

## Purpose

This template provides comprehensive patterns for implementing automated testing in CI/CD pipelines including test orchestration, parallel execution, result reporting, and deployment gates. It covers integration with popular CI/CD platforms and strategies for efficient test execution.

## Context

Automated testing in CI/CD pipelines ensures code quality at every stage of the development lifecycle. This template addresses the implementation of testing strategies that balance thoroughness with speed, enabling fast feedback while maintaining quality gates.

## Core Components

### CI/CD Test Orchestrator Interface

## Examples

```typescript
interface CICDTestOrchestrator {
  configurePipeline(config: PipelineConfig): Promise<Pipeline>;
  runTestStage(stage: TestStage): Promise<StageResult>;
  parallelizeTests(tests: TestSuite[], workers: number): Promise<ParallelResult>;
  evaluateGates(results: TestResults): Promise<GateDecision>;
  publishResults(results: TestResults, destination: ResultDestination): Promise<void>;
}

interface PipelineConfig {
  name: string;
  triggers: PipelineTrigger[];
  stages: PipelineStage[];
  environment: EnvironmentConfig;
  notifications: NotificationConfig;
  artifacts: ArtifactConfig;
}


interface TestStage {
  name: string;
  type: StageType;
  tests: TestSuite[];
  parallelism: number;
  timeout: number;
  retries: number;
  continueOnFailure: boolean;
  artifacts: string[];
}

enum StageType {
  UNIT = 'unit',
  INTEGRATION = 'integration',
  E2E = 'e2e',
  PERFORMANCE = 'performance',
  SECURITY = 'security',
  SMOKE = 'smoke'
}

interface StageResult {
  stageName: string;
  status: StageStatus;
  duration: number;
  testResults: TestResults;
  coverage?: CoverageReport;
  artifacts: Artifact[];
  logs: string;
}

enum StageStatus {
  SUCCESS = 'success',
  FAILURE = 'failure',
  UNSTABLE = 'unstable',
  ABORTED = 'aborted',
  SKIPPED = 'skipped'
}
```

### Test Parallelization Service

```typescript
class TestParallelizationService {
  async parallelizeTests(
    tests: TestSuite[],
    config: ParallelConfig
  ): Promise<ParallelResult> {
    const chunks = this.splitTests(tests, config.workers);
    const startTime = Date.now();

    const results = await Promise.all(
      chunks.map((chunk, index) => 
        this.runTestChunk(chunk, index, config)
      )
    );

    return {
      totalDuration: Date.now() - startTime,
      workers: config.workers,
      results: this.mergeResults(results),
      timeSaved: this.calculateTimeSaved(results)
    };
  }

  private splitTests(tests: TestSuite[], workers: number): TestSuite[][] {
    // Use timing data for optimal distribution
    const sortedTests = [...tests].sort((a, b) => 
      (b.estimatedDuration || 0) - (a.estimatedDuration || 0)
    );

    const chunks: TestSuite[][] = Array.from({ length: workers }, () => []);
    const chunkDurations: number[] = Array(workers).fill(0);

    // Distribute tests to balance execution time
    for (const test of sortedTests) {
      const minIndex = chunkDurations.indexOf(Math.min(...chunkDurations));
      chunks[minIndex].push(test);
      chunkDurations[minIndex] += test.estimatedDuration || 1;
    }

    return chunks;
  }

  private async runTestChunk(
    chunk: TestSuite[],
    workerId: number,
    config: ParallelConfig
  ): Promise<ChunkResult> {
    const results: TestSuiteResult[] = [];
    const startTime = Date.now();

    for (const suite of chunk) {
      const result = await this.testRunner.runSuite(suite, {
        workerId,
        timeout: config.timeout,
        retries: config.retries
      });
      results.push(result);

      // Update timing data for future runs
      await this.timingStore.updateTiming(suite.id, result.duration);
    }

    return {
      workerId,
      duration: Date.now() - startTime,
      results
    };
  }
}
```

### Pipeline Gate Service

```typescript
class PipelineGateService {
  private gates: Map<string, GateEvaluator> = new Map();

  registerGate(name: string, evaluator: GateEvaluator): void {
    this.gates.set(name, evaluator);
  }

  async evaluateGates(
    results: TestResults,
    config: GateConfig
  ): Promise<GateDecision> {
    const evaluations: GateEvaluation[] = [];
    let shouldProceed = true;

    for (const [name, evaluator] of this.gates) {
      const gateConfig = config.gates.find(g => g.name === name);
      if (!gateConfig?.enabled) continue;

      const evaluation = await evaluator.evaluate(results, gateConfig);
      evaluations.push(evaluation);

      if (!evaluation.passed && gateConfig.blocking) {
        shouldProceed = false;
      }
    }

    return {
      proceed: shouldProceed,
      evaluations,
      summary: this.generateSummary(evaluations),
      recommendations: this.generateRecommendations(evaluations)
    };
  }
}

// Built-in gate evaluators
class CoverageGateEvaluator implements GateEvaluator {
  async evaluate(results: TestResults, config: GateConfig): Promise<GateEvaluation> {
    const coverage = results.coverage;
    if (!coverage) {
      return { name: 'coverage', passed: false, reason: 'No coverage data available' };
    }

    const thresholds = config.thresholds as CoverageThresholds;
    const failures: string[] = [];

    if (coverage.lines < thresholds.lines) {
      failures.push(`Line coverage ${coverage.lines}% < ${thresholds.lines}%`);
    }
    if (coverage.branches < thresholds.branches) {
      failures.push(`Branch coverage ${coverage.branches}% < ${thresholds.branches}%`);
    }

    return {
      name: 'coverage',
      passed: failures.length === 0,
      reason: failures.length > 0 ? failures.join('; ') : 'Coverage thresholds met',
      metrics: { lines: coverage.lines, branches: coverage.branches }
    };
  }
}

class TestPassRateGateEvaluator implements GateEvaluator {
  async evaluate(results: TestResults, config: GateConfig): Promise<GateEvaluation> {
    const passRate = (results.passed / results.total) * 100;
    const threshold = (config.thresholds as { passRate: number }).passRate;

    return {
      name: 'test-pass-rate',
      passed: passRate >= threshold,
      reason: passRate >= threshold 
        ? `Pass rate ${passRate.toFixed(1)}% meets threshold`
        : `Pass rate ${passRate.toFixed(1)}% below ${threshold}% threshold`,
      metrics: { passRate, threshold }
    };
  }
}
```


## Implementation Patterns

### GitHub Actions Pipeline Pattern

```yaml
# .github/workflows/test.yml
name: Test Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18, 20]
        shard: [1, 2, 3, 4]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests (shard ${{ matrix.shard }}/4)
        run: npm test -- --shard=${{ matrix.shard }}/4 --coverage
        env:
          CI: true
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          flags: unit-tests-node${{ matrix.node-version }}-shard${{ matrix.shard }}

  integration-tests:
    runs-on: ubuntu-latest
    needs: unit-tests
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test

  e2e-tests:
    runs-on: ubuntu-latest
    needs: integration-tests
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test artifacts
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/

  quality-gate:
    runs-on: ubuntu-latest
    needs: [unit-tests, integration-tests, e2e-tests]
    steps:
      - name: Download coverage reports
        uses: actions/download-artifact@v3
        with:
          name: coverage
      
      - name: Evaluate quality gates
        run: |
          npm run quality-gate -- \
            --coverage-threshold=80 \
            --pass-rate-threshold=100
```

### Jenkins Pipeline Pattern

```groovy
// Jenkinsfile
pipeline {
    agent any
    
    environment {
        NODE_VERSION = '20'
        COVERAGE_THRESHOLD = '80'
    }
    
    stages {
        stage('Setup') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Unit Tests') {
            parallel {
                stage('Shard 1') {
                    steps {
                        sh 'npm test -- --shard=1/4 --coverage'
                    }
                }
                stage('Shard 2') {
                    steps {
                        sh 'npm test -- --shard=2/4 --coverage'
                    }
                }
                stage('Shard 3') {
                    steps {
                        sh 'npm test -- --shard=3/4 --coverage'
                    }
                }
                stage('Shard 4') {
                    steps {
                        sh 'npm test -- --shard=4/4 --coverage'
                    }
                }
            }
            post {
                always {
                    junit 'test-results/*.xml'
                    publishCoverage adapters: [istanbulCoberturaAdapter('coverage/cobertura-coverage.xml')]
                }
            }
        }
        
        stage('Integration Tests') {
            steps {
                sh 'npm run test:integration'
            }
        }
        
        stage('Quality Gate') {
            steps {
                script {
                    def coverage = readJSON file: 'coverage/coverage-summary.json'
                    def lineCoverage = coverage.total.lines.pct
                    
                    if (lineCoverage < env.COVERAGE_THRESHOLD.toInteger()) {
                        error "Coverage ${lineCoverage}% is below threshold ${env.COVERAGE_THRESHOLD}%"
                    }
                }
            }
        }
        
        stage('Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                sh 'npm run deploy:staging'
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        failure {
            slackSend channel: '#ci-alerts', message: "Build failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        }
    }
}
```

## Integration Points

### Test Result Publishing

```typescript
class TestResultPublisher {
  async publishResults(results: TestResults, config: PublishConfig): Promise<void> {
    // Publish to multiple destinations
    const publishers: ResultPublisher[] = [
      new JUnitPublisher(),
      new HTMLReportPublisher(),
      new SlackNotifier(),
      new GitHubCheckPublisher()
    ];

    await Promise.all(
      publishers
        .filter(p => config.destinations.includes(p.name))
        .map(p => p.publish(results, config))
    );
  }
}

class GitHubCheckPublisher implements ResultPublisher {
  name = 'github-checks';

  async publish(results: TestResults, config: PublishConfig): Promise<void> {
    const conclusion = results.failed === 0 ? 'success' : 'failure';
    
    await this.octokit.checks.create({
      owner: config.owner,
      repo: config.repo,
      name: 'Test Results',
      head_sha: config.sha,
      status: 'completed',
      conclusion,
      output: {
        title: `${results.passed}/${results.total} tests passed`,
        summary: this.generateSummary(results),
        annotations: this.generateAnnotations(results)
      }
    });
  }

  private generateAnnotations(results: TestResults): Annotation[] {
    return results.failures.map(failure => ({
      path: failure.file,
      start_line: failure.line || 1,
      end_line: failure.line || 1,
      annotation_level: 'failure',
      message: failure.message,
      title: failure.testName
    }));
  }
}
```

## Security Considerations

### Secure Pipeline Execution

```typescript
class SecurePipelineRunner {
  async runPipeline(config: PipelineConfig): Promise<PipelineResult> {
    // Validate pipeline configuration
    this.validateConfig(config);
    
    // Use secrets manager for sensitive data
    const secrets = await this.secretsManager.getSecrets(config.secretsPath);
    
    // Run in isolated environment
    const environment = await this.createIsolatedEnvironment(config);
    
    try {
      // Execute pipeline stages
      const results = await this.executeStages(config.stages, environment, secrets);
      
      // Sanitize results before publishing
      const sanitizedResults = this.sanitizeResults(results);
      
      return sanitizedResults;
    } finally {
      await environment.cleanup();
    }
  }

  private sanitizeResults(results: PipelineResult): PipelineResult {
    return {
      ...results,
      logs: this.redactSecrets(results.logs),
      artifacts: results.artifacts.filter(a => !this.containsSensitiveData(a))
    };
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('CI/CD Testing Properties', () => {
  it('should distribute tests evenly across workers', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          id: fc.string(),
          estimatedDuration: fc.integer({ min: 1, max: 1000 })
        }),
        { minLength: 1, maxLength: 100 }
      ),
      fc.integer({ min: 1, max: 10 }),
      (tests, workers) => {
        const chunks = splitTests(tests, workers);
        
        // All tests should be distributed
        const totalTests = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        expect(totalTests).toBe(tests.length);
        
        // No chunk should be empty if we have enough tests
        if (tests.length >= workers) {
          expect(chunks.every(chunk => chunk.length > 0)).toBe(true);
        }
        
        return true;
      }
    ));
  });
});
```

## Configuration Examples

### CI/CD Testing Configuration

```yaml
# ci-cd-testing-config.yaml
pipeline:
  name: "Main Test Pipeline"
  triggers:
    - type: push
      branches: [main, develop]
    - type: pull_request
      branches: [main]

stages:
  - name: unit
    type: unit
    parallelism: 4
    timeout: 600
    retries: 2
    coverage:
      enabled: true
      threshold: 80

  - name: integration
    type: integration
    parallelism: 2
    timeout: 1200
    services:
      - postgres
      - redis

  - name: e2e
    type: e2e
    parallelism: 1
    timeout: 1800
    browser: chromium

gates:
  - name: coverage
    enabled: true
    blocking: true
    thresholds:
      lines: 80
      branches: 70

  - name: test-pass-rate
    enabled: true
    blocking: true
    thresholds:
      passRate: 100

notifications:
  slack:
    channel: "#ci-notifications"
    onFailure: true
    onSuccess: false
```
