/**
 * Health Check
 *
 * Provides health checks for all runtime components with
 * dependency validation and degraded-mode detection.
 *
 * Validates: Requirements 14.1, 14.2, 14.3
 */

/**
 * Health status for a single component
 */
export interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  latencyMs: number;
  details?: string;
  checkedAt: Date;
}

/**
 * Overall system health
 */
export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  components: ComponentHealth[];
  uptime: number; // ms
  version: string;
}

export class HealthCheck {
  private startTime = Date.now();
  private version: string;
  private checks: Map<string, () => Promise<ComponentHealth>> = new Map();

  constructor(version: string = '1.0.0') {
    this.version = version;
    this.registerDefaults();
  }

  /**
   * Registers a health check for a component
   */
  public register(name: string, check: () => Promise<ComponentHealth>): void {
    this.checks.set(name, check);
  }

  /**
   * Runs all health checks and returns system health
   */
  public async check(): Promise<SystemHealth> {
    const components: ComponentHealth[] = [];

    for (const [name, checkFn] of this.checks) {
      try {
        const start = Date.now();
        const result = await checkFn();
        result.latencyMs = Date.now() - start;
        components.push(result);
      } catch (error: any) {
        components.push({
          name,
          status: 'unhealthy',
          latencyMs: 0,
          details: error.message,
          checkedAt: new Date()
        });
      }
    }

    const hasUnhealthy = components.some(c => c.status === 'unhealthy');
    const hasDegraded = components.some(c => c.status === 'degraded');

    return {
      status: hasUnhealthy ? 'unhealthy' : hasDegraded ? 'degraded' : 'healthy',
      components,
      uptime: Date.now() - this.startTime,
      version: this.version
    };
  }

  /**
   * Quick liveness check (no dependency validation)
   */
  public liveness(): { alive: boolean; uptime: number } {
    return { alive: true, uptime: Date.now() - this.startTime };
  }

  private registerDefaults(): void {
    this.register('runtime', async () => ({
      name: 'runtime',
      status: 'healthy',
      latencyMs: 0,
      details: 'Core runtime operational',
      checkedAt: new Date()
    }));

    this.register('memory', async () => {
      const used = process.memoryUsage();
      const heapPercent = (used.heapUsed / used.heapTotal) * 100;
      return {
        name: 'memory',
        status: heapPercent > 90 ? 'degraded' : 'healthy',
        latencyMs: 0,
        details: `Heap: ${heapPercent.toFixed(1)}% used (${(used.heapUsed / 1024 / 1024).toFixed(0)}MB)`,
        checkedAt: new Date()
      };
    });
  }
}
