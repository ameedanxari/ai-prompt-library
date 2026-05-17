/**
 * Execution Monitor
 * 
 * Provides real-time monitoring of execution tasks, collecting metrics
 * and detecting anomalies in performance or behavior.
 * 
 * Validates: Requirements 5.1, 5.2, 5.3
 */

import { ExecutionStatus, ExecutionContext } from './execution-runtime';

/**
 * Metrics collected during execution
 */
export interface ExecutionMetrics {
  durationMs: number;
  cpuUsage: number; // 0-1
  memoryUsageMb: number;
  networkRequests: number;
  diskReadBytes: number;
  diskWriteBytes: number;
}

/**
 * An anomaly detected during execution
 */
export interface Anomaly {
  id: string;
  timestamp: Date;
  type: 'performance' | 'resource' | 'behavior' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  metric?: string;
  value?: any;
  threshold?: any;
}

export class ExecutionMonitor {
  private metrics: Map<string, ExecutionMetrics[]> = new Map();
  private anomalies: Map<string, Anomaly[]> = new Map();
  private thresholds: Record<string, number> = {
    maxDurationMs: 60000,
    maxMemoryMb: 512,
    maxCpuUsage: 0.9
  };

  /**
   * Starts monitoring an execution task
   */
  public monitor(context: ExecutionContext): void {
    // Start interval for metric collection
    const intervalId = setInterval(() => {
      this.collectMetrics(context.taskId);
    }, 1000);

    // Stop monitoring when execution ends
    const checkEnd = setInterval(() => {
      if (context.status !== 'running') {
        clearInterval(intervalId);
        clearInterval(checkEnd);
        this.finalAnalysis(context.taskId);
      }
    }, 500);
  }

  /**
   * Collects metrics for a specific task
   */
  private collectMetrics(taskId: string): void {
    const memoryUsage = process.memoryUsage();
    const sample: ExecutionMetrics = {
      durationMs: 1000,
      cpuUsage: 0,
      memoryUsageMb: memoryUsage.rss / (1024 * 1024),
      networkRequests: 0,
      diskReadBytes: 0,
      diskWriteBytes: 0
    };

    this.recordMetrics(taskId, sample);
  }

  /**
   * Records a deterministic metrics sample. Useful for tests and for
   * execution runtimes that collect metrics externally.
   */
  public recordMetrics(taskId: string, metrics: ExecutionMetrics): void {
    if (!this.metrics.has(taskId)) {
      this.metrics.set(taskId, []);
    }
    this.metrics.get(taskId)!.push(metrics);

    this.detectAnomalies(taskId, metrics);
  }

  /**
   * Detects anomalies in real-time based on current metrics
   */
  private detectAnomalies(taskId: string, metrics: ExecutionMetrics): void {
    if (metrics.memoryUsageMb > this.thresholds.maxMemoryMb) {
      this.reportAnomaly(taskId, {
        id: `anom-${Date.now()}`,
        timestamp: new Date(),
        type: 'resource',
        severity: 'high',
        description: 'Memory usage exceeded threshold',
        metric: 'memoryUsageMb',
        value: metrics.memoryUsageMb,
        threshold: this.thresholds.maxMemoryMb
      });
    }

    if (metrics.cpuUsage > this.thresholds.maxCpuUsage) {
      this.reportAnomaly(taskId, {
        id: `anom-${Date.now()}`,
        timestamp: new Date(),
        type: 'performance',
        severity: 'medium',
        description: 'High CPU usage detected',
        metric: 'cpuUsage',
        value: metrics.cpuUsage,
        threshold: this.thresholds.maxCpuUsage
      });
    }
  }

  /**
   * Reports a detected anomaly
   */
  private reportAnomaly(taskId: string, anomaly: Anomaly): void {
    if (!this.anomalies.has(taskId)) {
      this.anomalies.set(taskId, []);
    }
    this.anomalies.get(taskId)!.push(anomaly);
  }

  /**
   * Performs final analysis after execution completion
   */
  private finalAnalysis(taskId: string): void {
    const taskMetrics = this.metrics.get(taskId) || [];
    const totalDuration = taskMetrics.reduce((sum, m) => sum + m.durationMs, 0);

    if (totalDuration > this.thresholds.maxDurationMs) {
      this.reportAnomaly(taskId, {
        id: `anom-final-${Date.now()}`,
        timestamp: new Date(),
        type: 'performance',
        severity: 'medium',
        description: 'Execution duration exceeded expected threshold',
        metric: 'totalDuration',
        value: totalDuration,
        threshold: this.thresholds.maxDurationMs
      });
    }
  }

  /**
   * Retrieves metrics for a task
   */
  public getMetrics(taskId: string): ExecutionMetrics[] {
    return this.metrics.get(taskId) || [];
  }

  /**
   * Retrieves anomalies for a task
   */
  public getAnomalies(taskId: string): Anomaly[] {
    return this.anomalies.get(taskId) || [];
  }

  /**
   * Sets a threshold for monitoring
   */
  public setThreshold(key: string, value: number): void {
    this.thresholds[key] = value;
  }
}
