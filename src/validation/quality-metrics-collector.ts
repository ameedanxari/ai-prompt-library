/**
 * Quality Metrics Collector
 *
 * Collects and reports on quality metrics with trend analysis
 * across multiple pipeline runs.
 *
 * Validates: Requirements 5.4, 12.5, 14.4
 */

/**
 * A quality metrics snapshot
 */
export interface QualitySnapshot {
  timestamp: Date;
  runId: string;
  metrics: Record<string, number>;
}

/**
 * Trend direction
 */
export type Trend = 'improving' | 'stable' | 'degrading';

export class QualityMetricsCollector {
  private snapshots: QualitySnapshot[] = [];

  /**
   * Records a snapshot of quality metrics
   */
  public record(runId: string, metrics: Record<string, number>): void {
    this.snapshots.push({ timestamp: new Date(), runId, metrics });
  }

  /**
   * Analyses the trend of a specific metric
   */
  public analyseTrend(metricName: string, windowSize: number = 5): Trend {
    const values = this.snapshots
      .filter(s => metricName in s.metrics)
      .slice(-windowSize)
      .map(s => s.metrics[metricName]);

    if (values.length < 2) return 'stable';

    const first = values.slice(0, Math.ceil(values.length / 2));
    const second = values.slice(Math.ceil(values.length / 2));

    const avgFirst = first.reduce((a, b) => a + b, 0) / first.length;
    const avgSecond = second.reduce((a, b) => a + b, 0) / second.length;

    const diff = avgSecond - avgFirst;
    if (Math.abs(diff) < avgFirst * 0.05) return 'stable';
    return diff > 0 ? 'improving' : 'degrading';
  }

  /**
   * Generates a quality report
   */
  public generateReport(): string {
    let report = '# Quality Metrics Report\n\n';
    const latest = this.snapshots[this.snapshots.length - 1];
    if (!latest) return report + 'No data collected yet.\n';

    report += `## Latest Run: ${latest.runId}\n`;
    for (const [key, value] of Object.entries(latest.metrics)) {
      const trend = this.analyseTrend(key);
      const arrow = trend === 'improving' ? '↑' : trend === 'degrading' ? '↓' : '→';
      report += `- **${key}**: ${value} ${arrow} (${trend})\n`;
    }

    return report;
  }

  /**
   * Returns all snapshots
   */
  public getSnapshots(): QualitySnapshot[] {
    return [...this.snapshots];
  }
}
