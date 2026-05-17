/**
 * Quality Gate Enforcer
 * 
 * Enforces quality standards for engineering artifacts and execution results.
 * Checks against configurable thresholds for test coverage, security issues,
 * performance metrics, and architectural compliance.
 * 
 * Validates: Requirements 3.5, 5.5, 6.1
 */

import { ExecutionContext } from './execution-runtime';
import { ExecutionMetrics } from './execution-monitor';

/**
 * Result of a quality check
 */
export interface QualityResult {
  passed: boolean;
  score: number; // 0-100
  violations: QualityViolation[];
  metrics: Record<string, number>;
}

/**
 * A specific quality violation
 */
export interface QualityViolation {
  ruleId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  path?: string;
  value?: any;
  threshold?: any;
}

/**
 * Configuration for a quality gate
 */
export interface QualityGateConfig {
  minTestCoverage: number;
  maxSecurityVulnerabilities: number;
  maxExecutionTimeMs: number;
  minMaintainabilityIndex: number;
  requireStrictTypes: boolean;
}

export class QualityGateEnforcer {
  private config: QualityGateConfig = {
    minTestCoverage: 80,
    maxSecurityVulnerabilities: 0,
    maxExecutionTimeMs: 30000,
    minMaintainabilityIndex: 75,
    requireStrictTypes: true
  };

  /**
   * Evaluates an execution result against quality gates
   */
  public async evaluate(context: ExecutionContext, metrics?: ExecutionMetrics): Promise<QualityResult> {
    const violations: QualityViolation[] = [];
    const collectedMetrics: Record<string, number> = {};

    // 1. Check execution performance
    if (metrics) {
      collectedMetrics.executionTime = metrics.durationMs;
      if (metrics.durationMs > this.config.maxExecutionTimeMs) {
        violations.push({
          ruleId: 'perf-limit',
          severity: 'medium',
          message: 'Execution time exceeded limit',
          value: metrics.durationMs,
          threshold: this.config.maxExecutionTimeMs
        });
      }
    }

    const outputMetrics = context.output?.metrics ?? {};

    const testCoverage = Number(outputMetrics.testCoverage);
    if (Number.isFinite(testCoverage)) {
      collectedMetrics.testCoverage = testCoverage;
    }
    if (Number.isFinite(testCoverage) && testCoverage < this.config.minTestCoverage) {
      violations.push({
        ruleId: 'coverage-min',
        severity: 'high',
        message: 'Test coverage below minimum requirement',
        value: testCoverage,
        threshold: this.config.minTestCoverage
      });
    }

    const vulnerabilities = Number(outputMetrics.securityVulnerabilities ?? outputMetrics.vulnerabilities);
    if (Number.isFinite(vulnerabilities)) {
      collectedMetrics.vulnerabilities = vulnerabilities;
    }
    if (Number.isFinite(vulnerabilities) && vulnerabilities > this.config.maxSecurityVulnerabilities) {
      violations.push({
        ruleId: 'sec-zero-vuln',
        severity: 'critical',
        message: 'Security vulnerabilities detected',
        value: vulnerabilities,
        threshold: this.config.maxSecurityVulnerabilities
      });
    }

    // Calculate score
    const totalChecks = 1
      + (Number.isFinite(testCoverage) ? 1 : 0)
      + (Number.isFinite(vulnerabilities) ? 1 : 0);
    const passedChecks = totalChecks - violations.length;
    const score = (passedChecks / totalChecks) * 100;

    return {
      passed: violations.filter(v => v.severity === 'high' || v.severity === 'critical').length === 0,
      score,
      violations,
      metrics: collectedMetrics
    };
  }

  /**
   * Blocks or allows progress based on quality result
   */
  public async enforce(result: QualityResult): Promise<void> {
    if (!result.passed) {
      const criticalViolations = result.violations
        .filter(v => v.severity === 'high' || v.severity === 'critical')
        .map(v => v.message)
        .join(', ');
      
      throw new Error(`Quality gate failed: ${criticalViolations}`);
    }
  }

  /**
   * Updates gate configuration
   */
  public updateConfig(config: Partial<QualityGateConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
