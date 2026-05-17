/**
 * Anomaly Detector
 *
 * Uses statistical analysis and pattern recognition to detect
 * anomalous behaviour during execution and trigger alerts.
 *
 * Validates: Requirements 5.2, 5.3, 5.5, 14.2
 */

import { MetricSample } from './metric-collector';

/**
 * A detected anomaly
 */
export interface DetectedAnomaly {
  id: string;
  timestamp: Date;
  metricName: string;
  observedValue: number;
  expectedRange: { min: number; max: number };
  deviation: number; // Standard deviations from mean
  severity: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export class AnomalyDetector {
  private deviationThreshold = 2.0; // Standard deviations

  /**
   * Analyses a set of metric samples for anomalies
   */
  public detect(samples: MetricSample[]): DetectedAnomaly[] {
    const anomalies: DetectedAnomaly[] = [];
    const grouped = this.groupByName(samples);

    for (const [name, group] of grouped.entries()) {
      const values = group.map(s => s.value);
      const { mean, stdDev } = this.stats(values);

      for (const sample of group) {
        const deviation = stdDev > 0 ? Math.abs(sample.value - mean) / stdDev : 0;
        if (deviation > this.deviationThreshold) {
          anomalies.push({
            id: `anomaly-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            timestamp: sample.timestamp,
            metricName: name,
            observedValue: sample.value,
            expectedRange: { min: mean - this.deviationThreshold * stdDev, max: mean + this.deviationThreshold * stdDev },
            deviation,
            severity: this.classifySeverity(deviation),
            recommendation: this.recommend(name, deviation)
          });
        }
      }
    }

    return anomalies;
  }

  /**
   * Sets the sensitivity threshold (number of standard deviations)
   */
  public setThreshold(stdDevs: number): void {
    this.deviationThreshold = stdDevs;
  }

  private groupByName(samples: MetricSample[]): Map<string, MetricSample[]> {
    const map = new Map<string, MetricSample[]>();
    for (const s of samples) {
      if (!map.has(s.name)) map.set(s.name, []);
      map.get(s.name)!.push(s);
    }
    return map;
  }

  private stats(values: number[]): { mean: number; stdDev: number } {
    const n = values.length;
    if (n === 0) return { mean: 0, stdDev: 0 };
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / n;
    return { mean, stdDev: Math.sqrt(variance) };
  }

  private classifySeverity(deviation: number): DetectedAnomaly['severity'] {
    if (deviation > 4) return 'critical';
    if (deviation > 3) return 'high';
    if (deviation > 2.5) return 'medium';
    return 'low';
  }

  private recommend(metric: string, deviation: number): string {
    if (metric.includes('duration') && deviation > 3) return 'Consider profiling for performance bottlenecks';
    if (metric.includes('memory')) return 'Check for memory leaks or excessive allocation';
    return 'Investigate root cause and consider adding monitoring';
  }
}
