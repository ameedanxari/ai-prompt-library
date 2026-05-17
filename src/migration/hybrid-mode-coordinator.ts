/**
 * Hybrid Mode Coordinator
 *
 * Coordinates operation during the migration period where both
 * the legacy prompt system and the new skill system coexist.
 *
 * Validates: Requirements 12.3, 12.4
 */

/**
 * Mode of operation
 */
export type OperationMode = 'legacy' | 'hybrid' | 'modern';

/**
 * Feature flag for controlling migration rollout
 */
export interface FeatureFlag {
  name: string;
  mode: OperationMode;
  enabled: boolean;
}

export class HybridModeCoordinator {
  private mode: OperationMode = 'legacy';
  private flags: Map<string, FeatureFlag> = new Map();

  /**
   * Sets the global operation mode
   */
  public setMode(mode: OperationMode): void {
    this.mode = mode;
    console.log(`[HybridModeCoordinator] Switched to '${mode}' mode`);
  }

  /**
   * Gets the current operation mode
   */
  public getMode(): OperationMode {
    return this.mode;
  }

  /**
   * Registers a feature flag
   */
  public registerFlag(flag: FeatureFlag): void {
    this.flags.set(flag.name, flag);
  }

  /**
   * Checks if a feature should use the modern path
   */
  public shouldUseModern(featureName: string): boolean {
    if (this.mode === 'modern') return true;
    if (this.mode === 'legacy') return false;

    // Hybrid: check feature flag
    const flag = this.flags.get(featureName);
    return flag ? flag.enabled && flag.mode !== 'legacy' : false;
  }

  /**
   * Routes a request to the appropriate system
   */
  public async route<T>(featureName: string, legacyFn: () => Promise<T>, modernFn: () => Promise<T>): Promise<T> {
    if (this.shouldUseModern(featureName)) {
      try {
        return await modernFn();
      } catch (error) {
        console.warn(`[HybridModeCoordinator] Modern path failed for '${featureName}', falling back to legacy`);
        return await legacyFn();
      }
    }
    return await legacyFn();
  }
}
