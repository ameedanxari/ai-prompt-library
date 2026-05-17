/**
 * Compatibility Checker
 *
 * Checks backward compatibility between versions of the system,
 * validating migrations and rollback safety.
 *
 * Validates: Requirements 12.1, 12.2, 12.3, 12.4
 */

/**
 * Compatibility check result
 */
export interface CompatibilityResult {
  compatible: boolean;
  breakingChanges: string[];
  deprecations: string[];
  migrationRequired: boolean;
  rollbackSafe: boolean;
}

export class CompatibilityChecker {
  /**
   * Checks compatibility between two API surfaces
   */
  public check(currentApi: string[], previousApi: string[]): CompatibilityResult {
    const breakingChanges: string[] = [];
    const deprecations: string[] = [];

    // Removed endpoints/exports = breaking change
    for (const endpoint of previousApi) {
      if (!currentApi.includes(endpoint)) {
        breakingChanges.push(`Removed: ${endpoint}`);
      }
    }

    // New additions are fine but tracked
    for (const endpoint of currentApi) {
      if (!previousApi.includes(endpoint)) {
        deprecations.push(`New: ${endpoint}`);
      }
    }

    return {
      compatible: breakingChanges.length === 0,
      breakingChanges,
      deprecations,
      migrationRequired: breakingChanges.length > 0,
      rollbackSafe: breakingChanges.length === 0
    };
  }

  /**
   * Validates a migration plan
   */
  public validateMigration(steps: string[]): { valid: boolean; issues: string[] } {
    const issues: string[] = [];
    if (steps.length === 0) issues.push('Migration plan is empty');
    if (!steps.some(s => s.toLowerCase().includes('backup'))) {
      issues.push('Migration plan should include a backup step');
    }
    if (!steps.some(s => s.toLowerCase().includes('rollback'))) {
      issues.push('Migration plan should include a rollback procedure');
    }
    return { valid: issues.length === 0, issues };
  }
}
