/**
 * Metrics Exporter
 *
 * Exports runtime metrics in Prometheus exposition format and
 * provides configuration for Grafana dashboards.
 *
 * Validates: Requirements 5.4, 14.4
 */

import { AggregatedMetric } from '../observation/metric-collector';

/**
 * A Prometheus-formatted metric line
 */
export interface PrometheusMetric {
  name: string;
  type: 'counter' | 'gauge' | 'histogram' | 'summary';
  help: string;
  labels: Record<string, string>;
  value: number;
}

export class MetricsExporter {
  private customMetrics: PrometheusMetric[] = [];

  /**
   * Converts aggregated metrics to Prometheus exposition format
   */
  public toPrometheus(metrics: AggregatedMetric[]): string {
    let output = '';

    for (const m of metrics) {
      const safeName = m.name.replace(/[^a-zA-Z0-9_]/g, '_');
      output += `# HELP ${safeName} Aggregated metric\n`;
      output += `# TYPE ${safeName} gauge\n`;
      output += `${safeName}_avg ${m.avg}\n`;
      output += `${safeName}_min ${m.min}\n`;
      output += `${safeName}_max ${m.max}\n`;
      output += `${safeName}_p95 ${m.p95}\n`;
      output += `${safeName}_count ${m.count}\n\n`;
    }

    for (const cm of this.customMetrics) {
      const labels = Object.entries(cm.labels).map(([k, v]) => `${k}="${v}"`).join(',');
      const labelStr = labels ? `{${labels}}` : '';
      output += `# HELP ${cm.name} ${cm.help}\n`;
      output += `# TYPE ${cm.name} ${cm.type}\n`;
      output += `${cm.name}${labelStr} ${cm.value}\n\n`;
    }

    return output;
  }

  /**
   * Registers a custom metric for export
   */
  public registerMetric(metric: PrometheusMetric): void {
    this.customMetrics.push(metric);
  }

  /**
   * Generates a basic Grafana dashboard JSON
   */
  public generateGrafanaDashboard(title: string, metrics: AggregatedMetric[]): Record<string, any> {
    return {
      title,
      editable: true,
      panels: metrics.map((m, idx) => ({
        id: idx + 1,
        type: 'graph',
        title: m.name,
        targets: [{ expr: m.name.replace(/[^a-zA-Z0-9_]/g, '_') + '_avg' }],
        gridPos: { h: 8, w: 12, x: (idx % 2) * 12, y: Math.floor(idx / 2) * 8 }
      })),
      time: { from: 'now-6h', to: 'now' },
      refresh: '30s'
    };
  }
}
