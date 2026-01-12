# Quality Metrics Template

## Purpose

This template provides comprehensive patterns for implementing quality metrics including code coverage, test coverage, quality gates, and quality dashboards. It covers metrics collection, analysis, reporting, and integration with CI/CD pipelines for continuous quality monitoring.

## Context

Quality metrics provide objective measurements of software quality and help teams make data-driven decisions about releases. This template addresses the implementation of quality measurement systems that track code health, test effectiveness, and overall software quality across the development lifecycle.

## Core Components

### Quality Metrics Manager Interface

## Examples

```typescript
interface QualityMetricsManager {
  collectCodeCoverage(config: CoverageConfig): Promise<CoverageReport>;
  collectTestMetrics(testResults: TestResults): Promise<TestMetrics>;
  evaluateQualityGates(metrics: QualityMetrics): Promise<GateEvaluation>;
  generateQualityDashboard(metrics: QualityMetrics[]): Promise<Dashboard>;
  trackQualityTrends(projectId: string, timeRange: TimeRange): Promise<QualityTrends>;
}

interface CoverageConfig {
  sourceDirectories: string[];
  testDirectories: string[];
  excludePatterns: string[];
  coverageTypes: CoverageType[];
  thresholds: CoverageThreshold;
}


enum CoverageType {
  LINE = 'line',
  BRANCH = 'branch',
  FUNCTION = 'function',
  STATEMENT = 'statement'
}

interface CoverageThreshold {
  line: number;
  branch: number;
  function: number;
  statement: number;
}

interface CoverageReport {
  summary: CoverageSummary;
  files: FileCoverage[];
  uncoveredLines: UncoveredLine[];
  trends: CoverageTrend[];
}

interface QualityMetrics {
  coverage: CoverageReport;
  testMetrics: TestMetrics;
  codeQuality: CodeQualityMetrics;
  technicalDebt: TechnicalDebtMetrics;
  timestamp: Date;
}
```

### Code Coverage Service

```typescript
class CodeCoverageService {
  async collectCoverage(config: CoverageConfig): Promise<CoverageReport> {
    const coverageData = await this.runCoverageCollection(config);
    
    const summary: CoverageSummary = {
      lines: this.calculatePercentage(coverageData.lines),
      branches: this.calculatePercentage(coverageData.branches),
      functions: this.calculatePercentage(coverageData.functions),
      statements: this.calculatePercentage(coverageData.statements)
    };

    const files = this.processFileCoverage(coverageData.files);
    const uncoveredLines = this.identifyUncoveredLines(coverageData);

    return {
      summary,
      files,
      uncoveredLines,
      trends: await this.getCoverageTrends()
    };
  }

  private processFileCoverage(files: RawFileCoverage[]): FileCoverage[] {
    return files.map(file => ({
      path: file.path,
      lines: {
        total: file.lines.total,
        covered: file.lines.covered,
        percentage: (file.lines.covered / file.lines.total) * 100
      },
      branches: {
        total: file.branches.total,
        covered: file.branches.covered,
        percentage: file.branches.total > 0 
          ? (file.branches.covered / file.branches.total) * 100 
          : 100
      },
      functions: {
        total: file.functions.total,
        covered: file.functions.covered,
        percentage: file.functions.total > 0
          ? (file.functions.covered / file.functions.total) * 100
          : 100
      },
      complexity: file.complexity,
      riskLevel: this.calculateRiskLevel(file)
    }));
  }

  private calculateRiskLevel(file: RawFileCoverage): RiskLevel {
    const coverage = (file.lines.covered / file.lines.total) * 100;
    const complexity = file.complexity;

    if (coverage < 50 && complexity > 20) return RiskLevel.HIGH;
    if (coverage < 70 && complexity > 10) return RiskLevel.MEDIUM;
    if (coverage < 80) return RiskLevel.LOW;
    return RiskLevel.MINIMAL;
  }
}
```

### Quality Gate Service

```typescript
class QualityGateService {
  private gates: QualityGate[] = [];

  registerGate(gate: QualityGate): void {
    this.gates.push(gate);
  }

  async evaluateGates(metrics: QualityMetrics): Promise<GateEvaluation> {
    const results: GateResult[] = [];
    let overallPassed = true;

    for (const gate of this.gates) {
      const result = await this.evaluateGate(gate, metrics);
      results.push(result);
      
      if (!result.passed && gate.blocking) {
        overallPassed = false;
      }
    }

    return {
      passed: overallPassed,
      results,
      summary: this.generateSummary(results),
      recommendations: this.generateRecommendations(results)
    };
  }

  private async evaluateGate(gate: QualityGate, metrics: QualityMetrics): Promise<GateResult> {
    const value = this.extractMetricValue(gate.metric, metrics);
    const passed = this.compareValue(value, gate.operator, gate.threshold);

    return {
      gateName: gate.name,
      metric: gate.metric,
      threshold: gate.threshold,
      actualValue: value,
      passed,
      blocking: gate.blocking,
      message: passed 
        ? `${gate.name} passed: ${value} ${gate.operator} ${gate.threshold}`
        : `${gate.name} failed: ${value} does not meet ${gate.operator} ${gate.threshold}`
    };
  }

  private compareValue(value: number, operator: ComparisonOperator, threshold: number): boolean {
    switch (operator) {
      case 'gte': return value >= threshold;
      case 'gt': return value > threshold;
      case 'lte': return value <= threshold;
      case 'lt': return value < threshold;
      case 'eq': return value === threshold;
      default: return false;
    }
  }
}

// Default quality gates
const defaultQualityGates: QualityGate[] = [
  { name: 'Line Coverage', metric: 'coverage.lines', operator: 'gte', threshold: 80, blocking: true },
  { name: 'Branch Coverage', metric: 'coverage.branches', operator: 'gte', threshold: 70, blocking: true },
  { name: 'Test Pass Rate', metric: 'tests.passRate', operator: 'gte', threshold: 100, blocking: true },
  { name: 'Code Duplication', metric: 'codeQuality.duplication', operator: 'lte', threshold: 5, blocking: false },
  { name: 'Technical Debt Ratio', metric: 'technicalDebt.ratio', operator: 'lte', threshold: 5, blocking: false }
];
```


## Implementation Patterns

### Quality Dashboard Pattern

```typescript
class QualityDashboardService {
  async generateDashboard(projectId: string): Promise<Dashboard> {
    const currentMetrics = await this.metricsStore.getLatest(projectId);
    const historicalMetrics = await this.metricsStore.getHistory(projectId, 30);
    const trends = this.calculateTrends(historicalMetrics);

    return {
      projectId,
      generatedAt: new Date(),
      summary: {
        overallHealth: this.calculateHealthScore(currentMetrics),
        coverageStatus: this.getCoverageStatus(currentMetrics.coverage),
        testStatus: this.getTestStatus(currentMetrics.testMetrics),
        qualityGateStatus: currentMetrics.gateEvaluation?.passed ? 'passed' : 'failed'
      },
      widgets: [
        this.createCoverageWidget(currentMetrics.coverage, trends.coverage),
        this.createTestMetricsWidget(currentMetrics.testMetrics, trends.tests),
        this.createCodeQualityWidget(currentMetrics.codeQuality, trends.quality),
        this.createTechnicalDebtWidget(currentMetrics.technicalDebt, trends.debt),
        this.createTrendChart(historicalMetrics)
      ]
    };
  }

  private calculateHealthScore(metrics: QualityMetrics): HealthScore {
    const weights = {
      coverage: 0.3,
      testPassRate: 0.25,
      codeQuality: 0.25,
      technicalDebt: 0.2
    };

    const coverageScore = metrics.coverage.summary.lines / 100;
    const testScore = metrics.testMetrics.passRate / 100;
    const qualityScore = (100 - metrics.codeQuality.issues.critical * 10 - metrics.codeQuality.issues.major * 5) / 100;
    const debtScore = Math.max(0, (100 - metrics.technicalDebt.ratio * 10)) / 100;

    const score = 
      coverageScore * weights.coverage +
      testScore * weights.testPassRate +
      qualityScore * weights.codeQuality +
      debtScore * weights.technicalDebt;

    return {
      score: Math.round(score * 100),
      grade: this.scoreToGrade(score),
      trend: this.calculateScoreTrend(metrics)
    };
  }

  private scoreToGrade(score: number): Grade {
    if (score >= 0.9) return 'A';
    if (score >= 0.8) return 'B';
    if (score >= 0.7) return 'C';
    if (score >= 0.6) return 'D';
    return 'F';
  }
}
```

### Metrics Collection Pattern

```typescript
class MetricsCollector {
  private collectors: Map<string, MetricCollector> = new Map();

  registerCollector(name: string, collector: MetricCollector): void {
    this.collectors.set(name, collector);
  }

  async collectAll(config: CollectionConfig): Promise<QualityMetrics> {
    const results: Partial<QualityMetrics> = {};

    for (const [name, collector] of this.collectors) {
      try {
        const metrics = await collector.collect(config);
        results[name as keyof QualityMetrics] = metrics;
      } catch (error) {
        console.error(`Failed to collect ${name} metrics:`, error);
      }
    }

    return {
      ...results,
      timestamp: new Date()
    } as QualityMetrics;
  }
}

// Example collectors
class CoverageCollector implements MetricCollector {
  async collect(config: CollectionConfig): Promise<CoverageReport> {
    // Run coverage tool (e.g., Istanbul, c8)
    const rawCoverage = await this.runCoverageTool(config.coverageConfig);
    return this.processCoverage(rawCoverage);
  }
}

class CodeQualityCollector implements MetricCollector {
  async collect(config: CollectionConfig): Promise<CodeQualityMetrics> {
    // Run static analysis tools (e.g., ESLint, SonarQube)
    const lintResults = await this.runLinter(config.lintConfig);
    const complexityResults = await this.analyzeComplexity(config.sourceDirectories);
    const duplicationResults = await this.detectDuplication(config.sourceDirectories);

    return {
      issues: this.categorizeIssues(lintResults),
      complexity: complexityResults,
      duplication: duplicationResults.percentage,
      maintainabilityIndex: this.calculateMaintainability(complexityResults, duplicationResults)
    };
  }
}
```

## Integration Points

### CI/CD Integration

```typescript
interface CIQualityIntegration {
  runQualityChecks(config: QualityCheckConfig): Promise<QualityCheckResult>;
  publishMetrics(metrics: QualityMetrics): Promise<void>;
  enforceQualityGates(evaluation: GateEvaluation): Promise<void>;
  generateBadges(metrics: QualityMetrics): Promise<Badge[]>;
}

class GitHubActionsQualityIntegration implements CIQualityIntegration {
  async runQualityChecks(config: QualityCheckConfig): Promise<QualityCheckResult> {
    // Collect all metrics
    const metrics = await this.metricsCollector.collectAll(config);
    
    // Evaluate quality gates
    const gateEvaluation = await this.qualityGateService.evaluateGates(metrics);
    
    // Create GitHub check run
    await this.createCheckRun(metrics, gateEvaluation);
    
    // Add PR comment with summary
    if (config.pullRequestNumber) {
      await this.addPRComment(config.pullRequestNumber, metrics, gateEvaluation);
    }

    return {
      metrics,
      gateEvaluation,
      passed: gateEvaluation.passed
    };
  }

  private async createCheckRun(metrics: QualityMetrics, evaluation: GateEvaluation): Promise<void> {
    await this.octokit.checks.create({
      owner: this.owner,
      repo: this.repo,
      name: 'Quality Gates',
      head_sha: this.sha,
      status: 'completed',
      conclusion: evaluation.passed ? 'success' : 'failure',
      output: {
        title: evaluation.passed ? 'Quality Gates Passed' : 'Quality Gates Failed',
        summary: this.generateSummary(metrics, evaluation),
        text: this.generateDetailedReport(metrics, evaluation)
      }
    });
  }

  async generateBadges(metrics: QualityMetrics): Promise<Badge[]> {
    return [
      {
        name: 'coverage',
        label: 'Coverage',
        value: `${metrics.coverage.summary.lines.toFixed(1)}%`,
        color: this.getCoverageColor(metrics.coverage.summary.lines)
      },
      {
        name: 'quality',
        label: 'Quality',
        value: this.calculateHealthScore(metrics).grade,
        color: this.getGradeColor(this.calculateHealthScore(metrics).grade)
      }
    ];
  }
}
```

### SonarQube Integration

```typescript
class SonarQubeIntegration {
  async syncMetrics(projectKey: string): Promise<QualityMetrics> {
    const measures = await this.sonarClient.getMeasures(projectKey, [
      'coverage',
      'branch_coverage',
      'duplicated_lines_density',
      'code_smells',
      'bugs',
      'vulnerabilities',
      'sqale_debt_ratio',
      'reliability_rating',
      'security_rating',
      'sqale_rating'
    ]);

    return {
      coverage: {
        summary: {
          lines: parseFloat(measures.coverage || '0'),
          branches: parseFloat(measures.branch_coverage || '0'),
          functions: 0,
          statements: 0
        },
        files: [],
        uncoveredLines: [],
        trends: []
      },
      codeQuality: {
        issues: {
          critical: parseInt(measures.bugs || '0'),
          major: parseInt(measures.code_smells || '0'),
          minor: 0,
          info: 0
        },
        complexity: 0,
        duplication: parseFloat(measures.duplicated_lines_density || '0'),
        maintainabilityIndex: this.ratingToIndex(measures.sqale_rating)
      },
      technicalDebt: {
        ratio: parseFloat(measures.sqale_debt_ratio || '0'),
        totalMinutes: 0,
        newDebt: 0
      },
      testMetrics: {
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        passRate: 100,
        duration: 0
      },
      timestamp: new Date()
    };
  }
}
```

## Security Considerations

### Secure Metrics Storage

```typescript
class SecureMetricsStorage {
  async storeMetrics(projectId: string, metrics: QualityMetrics): Promise<void> {
    // Sanitize metrics before storage
    const sanitizedMetrics = this.sanitizeMetrics(metrics);
    
    // Encrypt sensitive data
    const encryptedMetrics = await this.encryptSensitiveFields(sanitizedMetrics);
    
    // Store with audit trail
    await this.metricsStore.save({
      projectId,
      metrics: encryptedMetrics,
      timestamp: new Date(),
      userId: this.getCurrentUserId()
    });
  }

  private sanitizeMetrics(metrics: QualityMetrics): QualityMetrics {
    // Remove file paths that might expose sensitive information
    return {
      ...metrics,
      coverage: {
        ...metrics.coverage,
        files: metrics.coverage.files.map(f => ({
          ...f,
          path: this.sanitizePath(f.path)
        }))
      }
    };
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Quality Metrics Properties', () => {
  it('should calculate coverage percentages correctly', () => {
    fc.assert(fc.property(
      fc.record({
        covered: fc.integer({ min: 0, max: 1000 }),
        total: fc.integer({ min: 1, max: 1000 })
      }),
      ({ covered, total }) => {
        const actualCovered = Math.min(covered, total);
        const percentage = (actualCovered / total) * 100;
        
        expect(percentage).toBeGreaterThanOrEqual(0);
        expect(percentage).toBeLessThanOrEqual(100);
        
        return true;
      }
    ));
  });

  it('should evaluate quality gates consistently', () => {
    fc.assert(fc.property(
      fc.record({
        coverage: fc.float({ min: 0, max: 100 }),
        threshold: fc.float({ min: 0, max: 100 })
      }),
      ({ coverage, threshold }) => {
        const gate: QualityGate = {
          name: 'Test Gate',
          metric: 'coverage.lines',
          operator: 'gte',
          threshold,
          blocking: true
        };

        const result = evaluateGate(gate, { coverage: { summary: { lines: coverage } } });
        
        expect(result.passed).toBe(coverage >= threshold);
        
        return true;
      }
    ));
  });
});
```

## Configuration Examples

### Quality Metrics Configuration

```yaml
# quality-metrics-config.yaml
coverage:
  provider: istanbul
  thresholds:
    lines: 80
    branches: 70
    functions: 80
    statements: 80
  exclude:
    - "**/*.test.ts"
    - "**/node_modules/**"

qualityGates:
  - name: "Line Coverage"
    metric: coverage.lines
    operator: gte
    threshold: 80
    blocking: true
  - name: "Branch Coverage"
    metric: coverage.branches
    operator: gte
    threshold: 70
    blocking: true
  - name: "Test Pass Rate"
    metric: tests.passRate
    operator: eq
    threshold: 100
    blocking: true
  - name: "Code Duplication"
    metric: codeQuality.duplication
    operator: lte
    threshold: 5
    blocking: false

dashboard:
  refreshInterval: 300
  widgets:
    - type: coverage_trend
    - type: test_results
    - type: quality_score
    - type: technical_debt

reporting:
  format: html
  outputPath: ./reports/quality
  badges: true
```
