/**
 * Observation Layer
 *
 * Central facade for observing execution, collecting metrics,
 * detecting anomalies, and generating actionable insights.
 *
 * Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { ExecutionContext } from '../execution/execution-runtime';

/**
 * An observation event emitted during execution
 */
export interface ObservationEvent {
  id: string;
  timestamp: Date;
  type: 'metric' | 'anomaly' | 'insight' | 'checkpoint';
  source: string;
  data: Record<string, any>;
}

/**
 * Observation summary for a completed execution
 */
export interface ObservationSummary {
  executionId: string;
  events: ObservationEvent[];
  anomalyCount: number;
  metrics: Record<string, number>;
  insights: string[];
}

export interface ObservationLayer {
  observeExecution(context: ExecutionContext): Promise<void>;
  detectAnomalies(context: ExecutionContext): Promise<ObservationEvent[]>;
  collectMetrics(context: ExecutionContext): Promise<Record<string, number>>;
  generateInsights(context: ExecutionContext): Promise<string[]>;
}

export class DefaultObservationLayer implements ObservationLayer {
  private events: Map<string, ObservationEvent[]> = new Map();

  /**
   * Starts observing an execution context
   */
  public async observeExecution(context: ExecutionContext): Promise<void> {
    const id = context.taskId;
    if (!this.events.has(id)) {
      this.events.set(id, []);
    }

    this.emit(id, 'checkpoint', 'observation-layer', { status: context.status, message: 'Observation started' });
  }

  /**
   * Detects anomalies in the current execution
   */
  public async detectAnomalies(context: ExecutionContext): Promise<ObservationEvent[]> {
    const anomalies: ObservationEvent[] = [];

    if (context.status === 'failed') {
      const event = this.createEvent('anomaly', 'anomaly-detector', {
        severity: 'high',
        message: `Execution failed: ${context.error || 'unknown'}`
      });
      anomalies.push(event);
      this.emit(context.taskId, event.type, event.source, event.data);
    }

    return anomalies;
  }

  /**
   * Collects metrics from the execution
   */
  public async collectMetrics(context: ExecutionContext): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    if (context.startTime) {
      const end = context.endTime || new Date();
      metrics.durationMs = end.getTime() - context.startTime.getTime();
    }

    metrics.artifactCount = context.artifacts?.length || 0;
    metrics.statusCode = context.status === 'completed' ? 0 : 1;

    this.emit(context.taskId, 'metric', 'metric-collector', metrics);
    return metrics;
  }

  /**
   * Generates human-readable insights from observations
   */
  public async generateInsights(context: ExecutionContext): Promise<string[]> {
    const insights: string[] = [];
    const events = this.events.get(context.taskId) || [];

    const anomalyCount = events.filter(e => e.type === 'anomaly').length;
    if (anomalyCount > 0) {
      insights.push(`${anomalyCount} anomalies detected – consider enabling repair loop`);
    }

    if (context.endTime && context.startTime) {
      const duration = context.endTime.getTime() - context.startTime.getTime();
      if (duration > 30000) {
        insights.push(`Execution took ${(duration / 1000).toFixed(1)}s – consider optimising the plan`);
      }
    }

    return insights;
  }

  /**
   * Retrieves the full observation summary for an execution
   */
  public getSummary(executionId: string): ObservationSummary {
    const events = this.events.get(executionId) || [];
    return {
      executionId,
      events,
      anomalyCount: events.filter(e => e.type === 'anomaly').length,
      metrics: {},
      insights: []
    };
  }

  private emit(executionId: string, type: ObservationEvent['type'], source: string, data: Record<string, any>): void {
    const event = this.createEvent(type, source, data);
    if (!this.events.has(executionId)) this.events.set(executionId, []);
    this.events.get(executionId)!.push(event);
  }

  private createEvent(type: ObservationEvent['type'], source: string, data: Record<string, any>): ObservationEvent {
    return {
      id: `obs-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      type,
      source,
      data
    };
  }
}
