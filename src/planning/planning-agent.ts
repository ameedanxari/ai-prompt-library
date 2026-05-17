/**
 * Planning Agent
 *
 * Creates execution plans from requirements by decomposing work into
 * ordered, dependency-aware tasks mapped to the skill system.
 *
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

import { ExecutionPlan, ExecutionStep } from '../execution/execution-runtime';
import { TechnicalRequirement } from '../intent/requirement-extractor';
import { SkillId } from '../skill-system/skill-definition';

/**
 * A high-level plan before optimisation
 */
export interface RawPlan {
  id: string;
  name: string;
  requirements: TechnicalRequirement[];
  steps: PlanStep[];
}

/**
 * A step in the raw plan (pre-optimisation)
 */
export interface PlanStep {
  id: string;
  title: string;
  requirementId: string;
  skillId: SkillId;
  input: Record<string, any>;
  dependencies: string[];
  estimatedDuration: number; // ms
  priority: number;
}

export interface PlanningAgent {
  createPlan(requirements: TechnicalRequirement[]): Promise<RawPlan>;
  decomposeTask(requirement: TechnicalRequirement): Promise<PlanStep[]>;
  resolveDependencies(steps: PlanStep[]): Promise<PlanStep[]>;
  optimizePlan(plan: RawPlan): Promise<ExecutionPlan>;
}

export class DefaultPlanningAgent implements PlanningAgent {
  private planCounter = 0;
  private stepCounter = 0;

  /**
   * Creates a full plan from a list of requirements
   */
  public async createPlan(requirements: TechnicalRequirement[]): Promise<RawPlan> {
    this.planCounter++;
    const planId = `plan-${this.planCounter}`;

    let allSteps: PlanStep[] = [];
    for (const req of requirements) {
      const steps = await this.decomposeTask(req);
      allSteps.push(...steps);
    }

    allSteps = await this.resolveDependencies(allSteps);

    return { id: planId, name: `Plan ${this.planCounter}`, requirements, steps: allSteps };
  }

  /**
   * Decomposes a single requirement into granular plan steps
   */
  public async decomposeTask(requirement: TechnicalRequirement): Promise<PlanStep[]> {
    this.stepCounter++;
    // Each requirement maps to at least one implementation + test step
    const implStep: PlanStep = {
      id: `step-impl-${this.stepCounter}`,
      title: `Implement: ${requirement.title}`,
      requirementId: requirement.id,
      skillId: 'skill-implement',
      input: { requirement },
      dependencies: requirement.dependencies,
      estimatedDuration: requirement.estimatedComplexity === 'high' ? 60000 : 30000,
      priority: requirement.priority === 'must-have' ? 1 : requirement.priority === 'should-have' ? 2 : 3
    };

    const testStep: PlanStep = {
      id: `step-test-${this.stepCounter}`,
      title: `Test: ${requirement.title}`,
      requirementId: requirement.id,
      skillId: 'skill-test',
      input: { requirement },
      dependencies: [implStep.id],
      estimatedDuration: 15000,
      priority: implStep.priority
    };

    return [implStep, testStep];
  }

  /**
   * Resolves inter-step dependencies and topologically sorts
   */
  public async resolveDependencies(steps: PlanStep[]): Promise<PlanStep[]> {
    const idSet = new Set(steps.map(s => s.id));
    // Prune dangling dependencies
    for (const step of steps) {
      step.dependencies = step.dependencies.filter(d => idSet.has(d));
    }
    // Topological sort via Kahn's algorithm
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();
    for (const s of steps) {
      inDegree.set(s.id, 0);
      adj.set(s.id, []);
    }
    for (const s of steps) {
      for (const d of s.dependencies) {
        adj.get(d)!.push(s.id);
        inDegree.set(s.id, (inDegree.get(s.id) || 0) + 1);
      }
    }
    const queue: string[] = [];
    for (const [id, deg] of inDegree.entries()) {
      if (deg === 0) queue.push(id);
    }
    const sorted: PlanStep[] = [];
    const stepMap = new Map(steps.map(s => [s.id, s]));
    while (queue.length > 0) {
      const id = queue.shift()!;
      sorted.push(stepMap.get(id)!);
      for (const next of adj.get(id) || []) {
        const newDeg = (inDegree.get(next) || 1) - 1;
        inDegree.set(next, newDeg);
        if (newDeg === 0) queue.push(next);
      }
    }
    return sorted;
  }

  /**
   * Optimises a raw plan into an execution plan
   */
  public async optimizePlan(plan: RawPlan): Promise<ExecutionPlan> {
    const steps: ExecutionStep[] = plan.steps.map(s => ({
      id: s.id,
      skillId: s.skillId,
      input: s.input,
      dependencies: s.dependencies
    }));

    return { id: plan.id, name: plan.name, steps };
  }
}
