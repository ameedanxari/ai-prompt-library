# Performance Testing Template

## Purpose

This template provides comprehensive patterns for implementing performance testing including load testing, stress testing, scalability testing, and performance monitoring. It covers test design, execution strategies, metrics collection, and analysis for both web and mobile applications.

## Context

Performance testing ensures applications meet response time, throughput, and resource utilization requirements under various load conditions. This template addresses the implementation of performance test suites that identify bottlenecks, validate scalability, and establish performance baselines.

## Core Components

### Performance Test Manager Interface

## Examples

```typescript
interface PerformanceTestManager {
  createLoadTest(config: LoadTestConfig): LoadTest;
  createStressTest(config: StressTestConfig): StressTest;
  createSpikeTest(config: SpikeTestConfig): SpikeTest;
  createEnduranceTest(config: EnduranceTestConfig): EnduranceTest;
  runTest(test: PerformanceTest): Promise<PerformanceResults>;
  analyzeResults(results: PerformanceResults): PerformanceAnalysis;
}

interface LoadTestConfig {
  name: string;
  targetUrl: string;
  virtualUsers: number;
  rampUpTime: number;
  duration: number;
  scenarios: TestScenario[];
  thresholds: PerformanceThreshold[];
}


interface PerformanceThreshold {
  metric: PerformanceMetric;
  operator: 'lt' | 'lte' | 'gt' | 'gte' | 'eq';
  value: number;
  failOnBreach: boolean;
}

enum PerformanceMetric {
  RESPONSE_TIME_P50 = 'response_time_p50',
  RESPONSE_TIME_P95 = 'response_time_p95',
  RESPONSE_TIME_P99 = 'response_time_p99',
  THROUGHPUT = 'throughput',
  ERROR_RATE = 'error_rate',
  CONCURRENT_USERS = 'concurrent_users',
  CPU_USAGE = 'cpu_usage',
  MEMORY_USAGE = 'memory_usage'
}

interface PerformanceResults {
  testId: string;
  testName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  metrics: MetricsSummary;
  timeSeries: TimeSeriesData[];
  errors: TestError[];
  thresholdResults: ThresholdResult[];
}
```

### Load Test Service

```typescript
class LoadTestService {
  private httpClient: HttpClient;
  private metricsCollector: MetricsCollector;

  async runLoadTest(config: LoadTestConfig): Promise<PerformanceResults> {
    const testId = crypto.randomUUID();
    const startTime = new Date();
    
    // Initialize virtual users
    const virtualUsers = await this.initializeVirtualUsers(config.virtualUsers);
    
    // Ramp up phase
    await this.rampUp(virtualUsers, config.rampUpTime);
    
    // Steady state phase
    const results = await this.executeSteadyState(
      virtualUsers,
      config.scenarios,
      config.duration
    );
    
    // Ramp down
    await this.rampDown(virtualUsers);
    
    const endTime = new Date();
    
    return {
      testId,
      testName: config.name,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      metrics: this.calculateMetrics(results),
      timeSeries: this.metricsCollector.getTimeSeries(),
      errors: results.errors,
      thresholdResults: this.evaluateThresholds(results, config.thresholds)
    };
  }

  private async executeSteadyState(
    virtualUsers: VirtualUser[],
    scenarios: TestScenario[],
    duration: number
  ): Promise<ExecutionResults> {
    const endTime = Date.now() + duration * 1000;
    const results: RequestResult[] = [];
    const errors: TestError[] = [];

    while (Date.now() < endTime) {
      const promises = virtualUsers.map(async (user) => {
        const scenario = this.selectScenario(scenarios);
        try {
          const result = await this.executeScenario(user, scenario);
          results.push(result);
          this.metricsCollector.record(result);
        } catch (error) {
          errors.push({
            userId: user.id,
            scenario: scenario.name,
            error: (error as Error).message,
            timestamp: new Date()
          });
        }
      });

      await Promise.all(promises);
      await this.sleep(100); // Pacing
    }

    return { results, errors };
  }

  private calculateMetrics(results: ExecutionResults): MetricsSummary {
    const responseTimes = results.results.map(r => r.responseTime);
    const sorted = [...responseTimes].sort((a, b) => a - b);
    
    return {
      totalRequests: results.results.length,
      successfulRequests: results.results.filter(r => r.success).length,
      failedRequests: results.results.filter(r => !r.success).length,
      errorRate: results.errors.length / results.results.length,
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      },
      throughput: results.results.length / (this.testDuration / 1000)
    };
  }
}
```


### Stress Test Service

```typescript
class StressTestService {
  async runStressTest(config: StressTestConfig): Promise<StressTestResults> {
    const results: StageResult[] = [];
    let currentUsers = config.initialUsers;
    let systemBroken = false;
    let breakingPoint: number | null = null;

    while (currentUsers <= config.maxUsers && !systemBroken) {
      const stageResult = await this.executeStage(currentUsers, config);
      results.push(stageResult);

      // Check if system has reached breaking point
      if (this.isSystemBroken(stageResult, config.breakingPointCriteria)) {
        systemBroken = true;
        breakingPoint = currentUsers;
      } else {
        currentUsers += config.userIncrement;
      }

      // Recovery period between stages
      await this.sleep(config.recoveryPeriod * 1000);
    }

    return {
      stages: results,
      breakingPoint,
      maxSustainableLoad: breakingPoint 
        ? breakingPoint - config.userIncrement 
        : currentUsers - config.userIncrement,
      recommendations: this.generateRecommendations(results)
    };
  }

  private isSystemBroken(
    result: StageResult,
    criteria: BreakingPointCriteria
  ): boolean {
    return (
      result.errorRate > criteria.maxErrorRate ||
      result.responseTime.p95 > criteria.maxResponseTime ||
      result.throughput < criteria.minThroughput
    );
  }

  private generateRecommendations(results: StageResult[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze response time degradation
    const responseTimeTrend = this.analyzeResponseTimeTrend(results);
    if (responseTimeTrend.degradationRate > 0.1) {
      recommendations.push(
        `Response time degrades ${(responseTimeTrend.degradationRate * 100).toFixed(1)}% per 100 users. ` +
        'Consider optimizing database queries or adding caching.'
      );
    }

    // Analyze error patterns
    const errorPatterns = this.analyzeErrorPatterns(results);
    if (errorPatterns.connectionErrors > 0.5) {
      recommendations.push(
        'High connection error rate detected. Consider increasing connection pool size.'
      );
    }

    return recommendations;
  }
}
```

### Scalability Test Service

```typescript
class ScalabilityTestService {
  async runScalabilityTest(config: ScalabilityTestConfig): Promise<ScalabilityResults> {
    const horizontalResults = await this.testHorizontalScaling(config);
    const verticalResults = await this.testVerticalScaling(config);
    
    return {
      horizontal: horizontalResults,
      vertical: verticalResults,
      scalabilityIndex: this.calculateScalabilityIndex(horizontalResults, verticalResults),
      costEfficiency: this.calculateCostEfficiency(horizontalResults, verticalResults),
      recommendations: this.generateScalabilityRecommendations(horizontalResults, verticalResults)
    };
  }

  private async testHorizontalScaling(
    config: ScalabilityTestConfig
  ): Promise<HorizontalScalingResults> {
    const results: InstanceScaleResult[] = [];
    
    for (let instances = 1; instances <= config.maxInstances; instances++) {
      // Scale infrastructure
      await this.scaleInstances(instances);
      await this.waitForHealthy(instances);
      
      // Run load test at each scale level
      const loadResult = await this.runLoadAtScale(config.baseLoad * instances);
      
      results.push({
        instances,
        throughput: loadResult.metrics.throughput,
        responseTime: loadResult.metrics.responseTime,
        efficiency: loadResult.metrics.throughput / (config.baseLoad * instances)
      });
    }

    return {
      results,
      linearScalingFactor: this.calculateLinearScalingFactor(results),
      optimalInstanceCount: this.findOptimalInstanceCount(results)
    };
  }

  private calculateScalabilityIndex(
    horizontal: HorizontalScalingResults,
    vertical: VerticalScalingResults
  ): number {
    // Scalability index: 1.0 = perfect linear scaling
    const horizontalEfficiency = horizontal.linearScalingFactor;
    const verticalEfficiency = vertical.linearScalingFactor;
    
    return (horizontalEfficiency + verticalEfficiency) / 2;
  }
}
```


## Implementation Patterns

### K6 Load Test Pattern

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Steady state
    { duration: '2m', target: 200 },  // Spike
    { duration: '5m', target: 200 },  // Steady at peak
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Login scenario
  const loginRes = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  errorRate.add(loginRes.status !== 200);
  responseTime.add(loginRes.timings.duration);

  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    
    // API calls with authentication
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Get user profile
    const profileRes = http.get(`${baseUrl}/api/users/me`, { headers });
    check(profileRes, {
      'profile loaded': (r) => r.status === 200,
    });

    // List products
    const productsRes = http.get(`${baseUrl}/api/products?limit=20`, { headers });
    check(productsRes, {
      'products loaded': (r) => r.status === 200,
      'has products': (r) => r.json('data').length > 0,
    });
  }

  sleep(1);
}
```

### Artillery Test Pattern

```yaml
# artillery-config.yaml
config:
  target: "{{ $processEnvironment.BASE_URL }}"
  phases:
    - duration: 120
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: "application/json"
  plugins:
    expect: {}
    metrics-by-endpoint: {}

scenarios:
  - name: "User journey"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomString(8) }}@test.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
          expect:
            - statusCode: 200
      - get:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
      - post:
          url: "/api/cart/items"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            productId: "{{ $randomString(10) }}"
            quantity: 1
          expect:
            - statusCode: 201

  - name: "Browse only"
    weight: 30
    flow:
      - get:
          url: "/api/products"
          expect:
            - statusCode: 200
      - get:
          url: "/api/products/{{ $randomString(10) }}"
          expect:
            - statusCode:
                - 200
                - 404
```


## Integration Points

### Monitoring Integration

```typescript
interface PerformanceMonitoringIntegration {
  collectMetrics(testId: string): Promise<SystemMetrics>;
  correlateWithAPM(testResults: PerformanceResults): Promise<CorrelatedResults>;
  exportToGrafana(results: PerformanceResults): Promise<void>;
  createAlerts(thresholds: PerformanceThreshold[]): Promise<Alert[]>;
}

class DatadogPerformanceIntegration implements PerformanceMonitoringIntegration {
  private client: DatadogClient;

  async collectMetrics(testId: string): Promise<SystemMetrics> {
    const timeRange = await this.getTestTimeRange(testId);
    
    const [cpuMetrics, memoryMetrics, networkMetrics] = await Promise.all([
      this.client.query(`avg:system.cpu.user{test_id:${testId}}`, timeRange),
      this.client.query(`avg:system.mem.used{test_id:${testId}}`, timeRange),
      this.client.query(`sum:system.net.bytes_rcvd{test_id:${testId}}`, timeRange)
    ]);

    return {
      cpu: this.processMetricSeries(cpuMetrics),
      memory: this.processMetricSeries(memoryMetrics),
      network: this.processMetricSeries(networkMetrics)
    };
  }

  async correlateWithAPM(testResults: PerformanceResults): Promise<CorrelatedResults> {
    const traces = await this.client.getTraces({
      start: testResults.startTime,
      end: testResults.endTime,
      service: this.serviceName
    });

    const slowTraces = traces.filter(t => t.duration > testResults.metrics.responseTime.p95);
    const errorTraces = traces.filter(t => t.error);

    return {
      testResults,
      apmCorrelation: {
        totalTraces: traces.length,
        slowTraces: slowTraces.length,
        errorTraces: errorTraces.length,
        topSlowEndpoints: this.groupByEndpoint(slowTraces).slice(0, 10),
        topErrorEndpoints: this.groupByEndpoint(errorTraces).slice(0, 10)
      }
    };
  }
}
```

### CI/CD Integration

```typescript
class PerformanceCIIntegration {
  async runPerformanceGate(
    config: PerformanceGateConfig
  ): Promise<GateResult> {
    // Run performance test
    const results = await this.performanceTestManager.runTest(config.test);
    
    // Compare with baseline
    const baseline = await this.getBaseline(config.baselineId);
    const comparison = this.compareWithBaseline(results, baseline);
    
    // Evaluate gate criteria
    const gateResult = this.evaluateGate(comparison, config.criteria);
    
    // Store results for future baseline
    if (gateResult.passed && config.updateBaseline) {
      await this.updateBaseline(config.baselineId, results);
    }
    
    // Generate report
    const report = await this.generateReport(results, comparison, gateResult);
    
    return {
      passed: gateResult.passed,
      results,
      comparison,
      report,
      recommendations: gateResult.recommendations
    };
  }

  private compareWithBaseline(
    current: PerformanceResults,
    baseline: PerformanceResults
  ): BaselineComparison {
    return {
      responseTime: {
        p50Change: this.percentChange(
          baseline.metrics.responseTime.p50,
          current.metrics.responseTime.p50
        ),
        p95Change: this.percentChange(
          baseline.metrics.responseTime.p95,
          current.metrics.responseTime.p95
        ),
        p99Change: this.percentChange(
          baseline.metrics.responseTime.p99,
          current.metrics.responseTime.p99
        )
      },
      throughputChange: this.percentChange(
        baseline.metrics.throughput,
        current.metrics.throughput
      ),
      errorRateChange: this.percentChange(
        baseline.metrics.errorRate,
        current.metrics.errorRate
      )
    };
  }
}
```

## Security Considerations

### Secure Test Execution

```typescript
class SecurePerformanceTestRunner {
  async runSecureTest(config: LoadTestConfig): Promise<PerformanceResults> {
    // Validate test target is in allowed list
    this.validateTargetUrl(config.targetUrl);
    
    // Use secure credentials
    const credentials = await this.secretsManager.getTestCredentials();
    
    // Rate limit to prevent accidental DDoS
    const rateLimitedConfig = this.applyRateLimits(config);
    
    // Run test with audit logging
    const testId = crypto.randomUUID();
    await this.auditLogger.logTestStart(testId, config);
    
    try {
      const results = await this.loadTestService.runLoadTest(rateLimitedConfig);
      await this.auditLogger.logTestComplete(testId, results);
      return results;
    } catch (error) {
      await this.auditLogger.logTestError(testId, error as Error);
      throw error;
    }
  }

  private validateTargetUrl(url: string): void {
    const allowedDomains = process.env.ALLOWED_TEST_DOMAINS?.split(',') || [];
    const urlObj = new URL(url);
    
    if (!allowedDomains.includes(urlObj.hostname)) {
      throw new Error(`Target domain ${urlObj.hostname} is not in allowed list`);
    }
  }

  private applyRateLimits(config: LoadTestConfig): LoadTestConfig {
    const maxUsers = parseInt(process.env.MAX_VIRTUAL_USERS || '1000');
    const maxDuration = parseInt(process.env.MAX_TEST_DURATION || '3600');
    
    return {
      ...config,
      virtualUsers: Math.min(config.virtualUsers, maxUsers),
      duration: Math.min(config.duration, maxDuration)
    };
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Performance Testing Properties', () => {
  it('should calculate percentiles correctly for any response time distribution', () => {
    fc.assert(fc.property(
      fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 100, maxLength: 1000 }),
      (responseTimes) => {
        const metrics = calculateMetrics(responseTimes);
        
        // P50 should be less than or equal to P95
        expect(metrics.p50).toBeLessThanOrEqual(metrics.p95);
        
        // P95 should be less than or equal to P99
        expect(metrics.p95).toBeLessThanOrEqual(metrics.p99);
        
        // P99 should be less than or equal to max
        expect(metrics.p99).toBeLessThanOrEqual(metrics.max);
        
        // Min should be less than or equal to P50
        expect(metrics.min).toBeLessThanOrEqual(metrics.p50);
        
        return true;
      }
    ));
  });

  it('should detect breaking point when error rate exceeds threshold', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          users: fc.integer({ min: 10, max: 1000 }),
          errorRate: fc.float({ min: 0, max: 1 })
        }),
        { minLength: 5, maxLength: 20 }
      ),
      (stageResults) => {
        const threshold = 0.05; // 5% error rate threshold
        const breakingPoint = findBreakingPoint(stageResults, threshold);
        
        if (breakingPoint !== null) {
          const breakingStage = stageResults.find(s => s.users === breakingPoint);
          expect(breakingStage?.errorRate).toBeGreaterThan(threshold);
        }
        
        return true;
      }
    ));
  });
});
```

## Configuration Examples

### Performance Test Configuration

```yaml
# performance-test-config.yaml
tests:
  load:
    name: "Standard Load Test"
    virtualUsers: 100
    rampUpTime: 120
    duration: 600
    thresholds:
      - metric: response_time_p95
        operator: lt
        value: 500
      - metric: error_rate
        operator: lt
        value: 0.01

  stress:
    name: "Stress Test"
    initialUsers: 50
    maxUsers: 500
    userIncrement: 50
    stageDuration: 300
    breakingPointCriteria:
      maxErrorRate: 0.05
      maxResponseTime: 2000

  scalability:
    name: "Scalability Test"
    baseLoad: 100
    maxInstances: 5
    testDurationPerScale: 300

reporting:
  format: html
  outputPath: ./reports
  includeCharts: true
  
monitoring:
  enabled: true
  provider: datadog
  dashboardId: "perf-test-dashboard"
```
