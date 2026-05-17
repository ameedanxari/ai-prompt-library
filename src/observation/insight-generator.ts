/**
 * Insight Generator
 *
 * Analyses trends across executions to produce actionable insights,
 * optimisation suggestions, and predictive alerts.
 *
 * Validates: Requirements 5.3, 5.5, 14.3
 */

import { AggregatedMetric } from './metric-collector';
import { DetectedAnomaly } from './anomaly-detector';

/**
 * A generated insight
 */
export interface Insight {
  id: string;
  timestamp: Date;
  category: 'performance' | 'reliability' | 'cost' | 'quality';
  title: string;
  description: string;
  actionable: boolean;
  suggestedAction?: string;
  confidence: number;
}

export class InsightGenerator {
  /**
   * Generates insights from aggregated metrics and anomalies
   */
  public generate(metrics: AggregatedMetric[], anomalies: DetectedAnomaly[]): Insight[] {
    const insights: Insight[] = [];

    // Performance trends
    for (const m of metrics) {
      if (m.name.includes('duration') && m.avg > 10000) {
        insights.push(this.createInsight('performance', 'High average execution time',
          `Average ${m.name} is ${m.avg.toFixed(0)}ms (p95: ${m.p95.toFixed(0)}ms)`,
          'Consider parallelising independent tasks or optimising slow skills', 0.9));
      }

      if (m.name === 'execution_outcome' && m.avg < 0.9) {
        insights.push(this.createInsight('reliability', 'Low success rate',
          `Success rate is ${(m.avg * 100).toFixed(1)}% over ${m.count} executions`,
          'Review failing tasks and enable repair loops', 0.95));
      }
    }

    // Anomaly patterns
    const criticals = anomalies.filter(a => a.severity === 'critical');
    if (criticals.length > 2) {
      insights.push(this.createInsight('reliability', 'Recurring critical anomalies',
        `${criticals.length} critical anomalies detected – possible systemic issue`,
        'Investigate shared infrastructure or common dependency failures', 0.85));
    }

    // Quality heuristics
    const qualityMetrics = metrics.filter(m => m.name.includes('coverage') || m.name.includes('quality'));
    for (const qm of qualityMetrics) {
      if (qm.avg < 80) {
        insights.push(this.createInsight('quality', `Low ${qm.name}`,
          `Average ${qm.name} is ${qm.avg.toFixed(1)} – below recommended threshold of 80`,
          'Increase test coverage or review quality gate thresholds', 0.8));
      }
    }

    return insights;
  }

  /**
   * Generates predictive alerts based on trend direction
   */
  public predictiveAlert(historicalMetrics: AggregatedMetric[]): Insight[] {
    const alerts: Insight[] = [];

    // Simple trend: if latest p95 is significantly higher than avg
    for (const m of historicalMetrics) {
      if (m.p95 > m.avg * 2 && m.count > 5) {
        alerts.push(this.createInsight('performance', `${m.name} trending upward`,
          `p95 (${m.p95.toFixed(0)}) is more than 2x the average (${m.avg.toFixed(0)})`,
          'Proactively investigate before it becomes a critical issue', 0.7));
      }
    }

    return alerts;
  }

  private createInsight(
    category: Insight['category'],
    title: string,
    description: string,
    suggestedAction: string,
    confidence: number
  ): Insight {
    return {
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      category,
      title,
      description,
      actionable: true,
      suggestedAction,
      confidence
    };
  }
}
