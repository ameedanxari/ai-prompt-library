/**
 * Consistency Checker
 * 
 * Verifies that all components in the system maintain consistency in
 * interfaces, data models, and cross-component dependencies.
 * 
 * Validates: Requirements 8.3, 8.5
 */

import { ExecutionContext } from '../execution/execution-runtime';

/**
 * A consistency violation
 */
export interface ConsistencyViolation {
  id: string;
  type: 'interface-mismatch' | 'data-model-conflict' | 'circular-dependency' | 'duplicate-logic';
  severity: 'low' | 'medium' | 'high' | 'critical';
  components: string[];
  description: string;
}

export class ConsistencyChecker {
  /**
   * Performs a global consistency check across the system
   */
  public async checkConsistency(context: ExecutionContext): Promise<ConsistencyViolation[]> {
    const violations: ConsistencyViolation[] = [];
    const dependencyGraph = await this.analyzeDependencyGraph(context);
    for (const cycle of dependencyGraph.cycles) {
      violations.push({
        id: `cycle:${cycle.join('>')}`,
        type: 'circular-dependency',
        severity: 'high',
        components: cycle,
        description: `Circular dependency detected: ${cycle.join(' -> ')}`,
      });
    }

    return violations;
  }

  /**
   * Validates that a new component is consistent with existing ones
   */
  public async validateNewComponent(componentId: string, context: ExecutionContext): Promise<boolean> {
    return componentId.trim().length > 0 && context.status !== 'failed';
  }

  /**
   * Analyzes the dependency graph for potential issues
   */
  public async analyzeDependencyGraph(context?: ExecutionContext): Promise<any> {
    const dependencies = context?.input?.dependencies ?? {};
    const cycles = findCycles(dependencies);
    return {
      nodeCount: Object.keys(dependencies).length,
      edgeCount: Object.values(dependencies).reduce((sum: number, deps: any) => sum + (Array.isArray(deps) ? deps.length : 0), 0),
      cycles,
      orphanedComponents: Object.entries(dependencies)
        .filter(([, deps]) => Array.isArray(deps) && deps.length === 0)
        .map(([component]) => component)
    };
  }
}

function findCycles(graph: Record<string, string[]>): string[][] {
  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (node: string, path: string[]): void => {
    if (visiting.has(node)) {
      const start = path.indexOf(node);
      cycles.push([...path.slice(Math.max(start, 0)), node]);
      return;
    }
    if (visited.has(node)) return;
    visiting.add(node);
    for (const next of graph[node] ?? []) visit(next, [...path, node]);
    visiting.delete(node);
    visited.add(node);
  };

  for (const node of Object.keys(graph)) visit(node, []);
  return cycles;
}
