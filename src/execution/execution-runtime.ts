/**
 * Execution Runtime
 * 
 * Orchestrates the execution of engineering plans and individual skills.
 * Provides mechanisms for checkpointing, rollback, and state management
 * during the autonomous software delivery process.
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5
 */

import { SkillId } from '../skill-system/skill-definition';
import { SkillGraph } from '../skill-system/skill-graph';
import { ArtifactId } from '../memory/artifact-storage';

/**
 * Status of an execution task
 */
export type ExecutionStatus = 
  | 'pending' 
  | 'running' 
  | 'completed' 
  | 'failed' 
  | 'rolled-back' 
  | 'cancelled';

/**
 * Execution context for a skill or plan
 */
export interface ExecutionContext {
  taskId: string;
  startTime: Date;
  endTime?: Date;
  status: ExecutionStatus;
  input: any;
  output?: any;
  error?: string;
  checkpointId?: string;
  artifacts: ArtifactId[];
}

/**
 * A step in an execution plan
 */
export interface ExecutionStep {
  id: string;
  skillId: SkillId;
  input: any;
  dependencies: string[]; // IDs of other steps
}

/**
 * A complete engineering plan
 */
export interface ExecutionPlan {
  id: string;
  name: string;
  steps: ExecutionStep[];
}

export class ExecutionRuntime {
  private contexts: Map<string, ExecutionContext> = new Map();
  private checkpoints: Map<string, ExecutionContext> = new Map();
  private executors: Map<SkillId, (input: any, context: ExecutionContext) => Promise<any> | any> = new Map();
  private sequence = 0;

  constructor(private readonly skillGraph?: SkillGraph) {}

  public registerSkillExecutor(
    skillId: SkillId,
    executor: (input: any, context: ExecutionContext) => Promise<any> | any
  ): void {
    this.executors.set(skillId, executor);
  }

  /**
   * Executes a complete engineering plan
   */
  public async executePlan(plan: ExecutionPlan): Promise<ExecutionContext> {
    const planContext: ExecutionContext = {
      taskId: plan.id,
      startTime: new Date(),
      status: 'running',
      input: plan,
      artifacts: []
    };

    this.contexts.set(plan.id, planContext);

    try {
      const executionOrder = this.resolveStepOrder(plan);
      const previousResults = new Map<string, any>();

      for (const step of executionOrder) {
        const dependencyOutputs = Object.fromEntries(
          step.dependencies.map(dependencyId => [dependencyId, previousResults.get(dependencyId)])
        );
        const stepContext = await this.executeSkill(
          step.skillId,
          { ...step.input, dependencyOutputs },
          plan.id
        );
        previousResults.set(step.id, stepContext.output);
        planContext.artifacts.push(...stepContext.artifacts);
      }

      planContext.status = 'completed';
      planContext.endTime = new Date();
      planContext.output = Object.fromEntries(previousResults);
    } catch (error: any) {
      planContext.status = 'failed';
      planContext.error = error.message;
      planContext.endTime = new Date();
      await this.rollback(plan.id);
    }

    return planContext;
  }

  /**
   * Executes a single skill
   */
  public async executeSkill(
    skillId: SkillId, 
    input: any, 
    parentId?: string
  ): Promise<ExecutionContext> {
    const executionId = `${parentId ?? 'exec'}-${++this.sequence}`;
    const context: ExecutionContext = {
      taskId: executionId,
      startTime: new Date(),
      status: 'running',
      input,
      artifacts: []
    };

    this.contexts.set(executionId, context);

    try {
      const executor = this.executors.get(skillId);
      if (!executor && this.skillGraph) {
        await Promise.resolve(this.skillGraph.getSkillImplementation(skillId));
      } else if (!executor) {
        throw new Error(`No executor registered for skill ${skillId}`);
      }

      const result = executor ? await executor(input, context) : { skillId, input };
      context.status = 'completed';
      context.endTime = new Date();
      context.output = result;
    } catch (error: any) {
      context.status = 'failed';
      context.error = error.message;
      context.endTime = new Date();
      throw error;
    }

    return context;
  }

  /**
   * Performs a rollback of a failed execution
   */
  public async rollback(executionId: string): Promise<boolean> {
    const context = this.contexts.get(executionId);
    if (!context) return false;

    context.status = 'rolled-back';
    context.endTime = new Date();
    return true;
  }

  /**
   * Creates a checkpoint of the current execution state
   */
  public async checkpoint(executionId: string): Promise<string> {
    const context = this.contexts.get(executionId);
    if (!context) throw new Error(`Execution context ${executionId} not found`);

    const checkpointId = `cp-${Date.now()}`;
    context.checkpointId = checkpointId;
    this.checkpoints.set(checkpointId, structuredClone(context));
    return checkpointId;
  }

  public async restoreCheckpoint(checkpointId: string): Promise<ExecutionContext> {
    const checkpoint = this.checkpoints.get(checkpointId);
    if (!checkpoint) {
      throw new Error(`Checkpoint ${checkpointId} not found`);
    }
    const restored = structuredClone(checkpoint);
    this.contexts.set(restored.taskId, restored);
    return restored;
  }

  /**
   * Retrieves the status of an execution
   */
  public getStatus(executionId: string): ExecutionStatus | undefined {
    return this.contexts.get(executionId)?.status;
  }

  /**
   * Retrieves the full context of an execution
   */
  public getContext(executionId: string): ExecutionContext | undefined {
    return this.contexts.get(executionId);
  }

  private resolveStepOrder(plan: ExecutionPlan): ExecutionStep[] {
    const byId = new Map(plan.steps.map(step => [step.id, step]));
    const ordered: ExecutionStep[] = [];
    const visiting = new Set<string>();
    const visited = new Set<string>();

    const visit = (step: ExecutionStep): void => {
      if (visited.has(step.id)) return;
      if (visiting.has(step.id)) {
        throw new Error(`Circular execution dependency detected at ${step.id}`);
      }
      visiting.add(step.id);
      for (const dependencyId of step.dependencies) {
        const dependency = byId.get(dependencyId);
        if (!dependency) {
          throw new Error(`Missing execution dependency ${dependencyId} for ${step.id}`);
        }
        visit(dependency);
      }
      visiting.delete(step.id);
      visited.add(step.id);
      ordered.push(step);
    };

    for (const step of plan.steps) {
      visit(step);
    }

    return ordered;
  }
}
