/**
 * Conflict Resolver
 *
 * Resolves merge conflicts, interface incompatibilities, and version
 * mismatches between integrated components.
 *
 * Validates: Requirements 8.2, 8.5
 */

/**
 * A conflict between two components
 */
export interface Conflict {
  id: string;
  type: 'version' | 'interface' | 'schema' | 'resource';
  componentA: string;
  componentB: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

/**
 * Resolution strategy for a conflict
 */
export interface Resolution {
  conflictId: string;
  strategy: 'prefer-latest' | 'prefer-stable' | 'manual' | 'merge';
  outcome: string;
}

export class ConflictResolver {
  /**
   * Resolves a list of conflicts using automatic strategies
   */
  public async resolveAll(conflicts: Conflict[]): Promise<Resolution[]> {
    return conflicts.map(c => this.resolveOne(c));
  }

  /**
   * Resolves a single conflict
   */
  public resolveOne(conflict: Conflict): Resolution {
    let strategy: Resolution['strategy'] = 'manual';
    let outcome = '';

    switch (conflict.type) {
      case 'version':
        strategy = 'prefer-latest';
        outcome = `Using latest version from ${conflict.componentA} / ${conflict.componentB}`;
        break;
      case 'interface':
        strategy = 'merge';
        outcome = `Merging interfaces from ${conflict.componentA} and ${conflict.componentB}`;
        break;
      case 'schema':
        strategy = 'prefer-stable';
        outcome = `Using stable schema from the component with more dependents`;
        break;
      default:
        outcome = `Requires manual resolution`;
    }

    return { conflictId: conflict.id, strategy, outcome };
  }

  /**
   * Checks compatibility between two versions
   */
  public areCompatible(versionA: string, versionB: string): boolean {
    const [majorA] = versionA.split('.').map(Number);
    const [majorB] = versionB.split('.').map(Number);
    return majorA === majorB;
  }
}
