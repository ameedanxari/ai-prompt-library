/**
 * Plan Optimizer
 *
 * Optimises execution plans for parallelism, resource usage, and
 * overall throughput while preserving dependency constraints.
 *
 * Validates: Requirements 3.2, 3.4, 3.5
 */

import { RawPlan, PlanStep } from './planning-agent';

/**
 * Result of plan optimisation
 */
export interface OptimizationResult {
  originalStepCount: number;
  optimizedStepCount: number;
  parallelBatches: PlanStep[][];
  estimatedTotalDuration: number;
  savings: number; // percentage
}

export class PlanOptimizer {
  /**
   * Optimises a plan by grouping independent steps into parallel batches
   */
  public async optimize(plan: RawPlan): Promise<OptimizationResult> {
    const batches = this.buildParallelBatches(plan.steps);
    const sequential = plan.steps.reduce((sum, s) => sum + s.estimatedDuration, 0);
    const parallel = batches.reduce((sum, batch) => sum + Math.max(...batch.map(s => s.estimatedDuration)), 0);

    return {
      originalStepCount: plan.steps.length,
      optimizedStepCount: plan.steps.length,
      parallelBatches: batches,
      estimatedTotalDuration: parallel,
      savings: sequential > 0 ? Math.round(((sequential - parallel) / sequential) * 100) : 0
    };
  }

  /**
   * Validates that optimisation is idempotent (running twice gives the same result)
   */
  public async verifyIdempotence(plan: RawPlan): Promise<boolean> {
    const first = await this.optimize(plan);
    const second = await this.optimize(plan);
    return first.estimatedTotalDuration === second.estimatedTotalDuration
      && first.parallelBatches.length === second.parallelBatches.length;
  }

  private buildParallelBatches(steps: PlanStep[]): PlanStep[][] {
    const completed = new Set<string>();
    const remaining = [...steps];
    const batches: PlanStep[][] = [];

    while (remaining.length > 0) {
      const batch = remaining.filter(s =>
        s.dependencies.every(d => completed.has(d))
      );
      if (batch.length === 0) {
        // Deadlock – push remaining as sequential fallback
        batches.push(remaining.splice(0));
        break;
      }
      for (const s of batch) {
        completed.add(s.id);
        remaining.splice(remaining.indexOf(s), 1);
      }
      batches.push(batch);
    }

    return batches;
  }
}
