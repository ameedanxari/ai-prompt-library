/**
 * Resource Monitor
 * 
 * Monitors system resources (CPU, Memory, Disk) during execution,
 * providing real-time data and detecting when limits are reached.
 * 
 * Validates: Requirements 5.1, 9.4, 11.5
 */

import * as os from 'os';

/**
 * Current resource usage snapshot
 */
export interface ResourceSnapshot {
  timestamp: Date;
  cpuLoad: number[]; // 1, 5, 15 min
  freeMemory: number;
  usedMemory: number;
  memoryUsagePercent: number;
  uptime: number;
}

export class ResourceMonitor {
  private history: ResourceSnapshot[] = [];

  /**
   * Captures a snapshot of current resource usage
   */
  public async captureSnapshot(): Promise<ResourceSnapshot> {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;

    const snapshot: ResourceSnapshot = {
      timestamp: new Date(),
      cpuLoad: os.loadavg(),
      freeMemory: freeMem,
      usedMemory: usedMem,
      memoryUsagePercent: (usedMem / totalMem) * 100,
      uptime: os.uptime()
    };

    this.history.push(snapshot);
    if (this.history.length > 1000) this.history.shift();

    return snapshot;
  }

  /**
   * Checks if any resources are near their limits
   */
  public async checkLimits(): Promise<{ critical: boolean; message?: string }> {
    const snapshot = await this.captureSnapshot();

    if (snapshot.memoryUsagePercent > 90) {
      return { critical: true, message: 'Memory usage critical (>90%)' };
    }

    if (snapshot.cpuLoad[0] > os.cpus().length * 0.8) {
      return { critical: true, message: 'CPU load critical (>80%)' };
    }

    return { critical: false };
  }

  /**
   * Suggests resource optimizations
   */
  public async suggestOptimizations(): Promise<string[]> {
    const snapshot = await this.captureSnapshot();
    const suggestions: string[] = [];

    if (snapshot.memoryUsagePercent > 70) {
      suggestions.push('Consider increasing memory allocation or triggering garbage collection');
    }

    if (snapshot.cpuLoad[0] > os.cpus().length * 0.6) {
      suggestions.push('High CPU load detected. Consider load balancing or optimizing computationally intensive tasks');
    }

    return suggestions;
  }

  /**
   * Retrieves historical usage data
   */
  public getHistory(): ResourceSnapshot[] {
    return this.history;
  }
}
