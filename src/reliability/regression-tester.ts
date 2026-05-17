/**
 * Regression Tester
 *
 * Runs automated regression tests against baseline implementations
 * to ensure new changes do not break existing functionality.
 *
 * Validates: Roadmap Phase 8 – Production Reliability
 */

/**
 * A baseline snapshot for regression comparison
 */
export interface Baseline {
  id: string;
  name: string;
  timestamp: Date;
  testResults: TestResult[];
  metrics: Record<string, number>;
}

/**
 * A single test result
 */
export interface TestResult {
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

/**
 * Regression analysis outcome
 */
export interface RegressionReport {
  baselineId: string;
  currentRunId: string;
  regressions: string[];
  improvements: string[];
  unchanged: string[];
  passed: boolean;
}

export class RegressionTester {
  private baselines: Map<string, Baseline> = new Map();

  /**
   * Saves a baseline for future regression comparison
   */
  public saveBaseline(baseline: Baseline): void {
    this.baselines.set(baseline.id, baseline);
  }

  /**
   * Compares current test results against a baseline
   */
  public async compare(baselineId: string, current: TestResult[]): Promise<RegressionReport> {
    const baseline = this.baselines.get(baselineId);
    if (!baseline) throw new Error(`Baseline ${baselineId} not found`);

    const regressions: string[] = [];
    const improvements: string[] = [];
    const unchanged: string[] = [];

    const baselineMap = new Map(baseline.testResults.map(t => [t.name, t]));

    for (const test of current) {
      const base = baselineMap.get(test.name);
      if (!base) {
        improvements.push(`New test: ${test.name}`);
        continue;
      }

      if (base.passed && !test.passed) {
        regressions.push(`REGRESSION: ${test.name} was passing, now failing – ${test.error || 'no details'}`);
      } else if (!base.passed && test.passed) {
        improvements.push(`FIXED: ${test.name} was failing, now passing`);
      } else {
        unchanged.push(test.name);
      }
    }

    // Check for removed tests
    for (const base of baseline.testResults) {
      if (!current.find(t => t.name === base.name)) {
        regressions.push(`REMOVED: ${base.name} no longer exists in test suite`);
      }
    }

    return {
      baselineId,
      currentRunId: `run-${Date.now()}`,
      regressions,
      improvements,
      unchanged,
      passed: regressions.length === 0
    };
  }

  /**
   * Lists all saved baselines
   */
  public listBaselines(): Baseline[] {
    return Array.from(this.baselines.values());
  }
}
