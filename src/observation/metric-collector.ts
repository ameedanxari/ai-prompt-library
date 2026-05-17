/**
 * Metric Collector
 *
 * Collects timing, resource usage, success rates, and quality metrics
 * across all execution tasks for trend analysis and reporting.
 *
 * Validates: Requirements 5.1, 5.4, 14.4
 */

/**
 * A single metric sample
 */
export interface MetricSample {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  labels: Record<string, string>;
}

/**
 * Aggregated metric over a time window
 */
export interface AggregatedMetric {
  name: string;
  count: number;
  sum: number;
  min: number;
  max: number;
  avg: number;
  p95: number;
}

export class MetricCollector {
  private samples: MetricSample[] = [];

  /**
   * Records a single metric sample
   */
  public record(name: string, value: number, unit: string, labels: Record<string, string> = {}): void {
    this.samples.push({ name, value, unit, timestamp: new Date(), labels });
  }

  /**
   * Records execution timing
   */
  public recordTiming(taskId: string, durationMs: number): void {
    this.record('execution_duration_ms', durationMs, 'ms', { taskId });
  }

  /**
   * Records success or failure
   */
  public recordOutcome(taskId: string, success: boolean): void {
    this.record('execution_outcome', success ? 1 : 0, 'boolean', { taskId });
  }

  /**
   * Aggregates metrics by name over all samples
   */
  public aggregate(name: string): AggregatedMetric | undefined {
    const filtered = this.samples.filter(s => s.name === name);
    if (filtered.length === 0) return undefined;

    const values = filtered.map(s => s.value).sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);

    return {
      name,
      count: values.length,
      sum,
      min: values[0],
      max: values[values.length - 1],
      avg: sum / values.length,
      p95: values[Math.floor(values.length * 0.95)]
    };
  }

  /**
   * Returns all unique metric names
   */
  public listMetrics(): string[] {
    return Array.from(new Set(this.samples.map(s => s.name)));
  }

  /**
   * Returns raw samples for a given metric
   */
  public getSamples(name: string): MetricSample[] {
    return this.samples.filter(s => s.name === name);
  }

  /**
   * Calculates success rate across all recorded outcomes
   */
  public getSuccessRate(): number {
    const outcomes = this.samples.filter(s => s.name === 'execution_outcome');
    if (outcomes.length === 0) return 1;
    const successes = outcomes.filter(s => s.value === 1).length;
    return successes / outcomes.length;
  }

  /**
   * Clears all collected samples
   */
  public clear(): void {
    this.samples = [];
  }
}
