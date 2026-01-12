import { StageId } from './stage-pipeline-controller.js';

/**
 * Task Generation Engine
 * 
 * Creates context-agnostic, bite-sized implementation tasks that can be executed
 * across multiple sessions without requiring conversation history.
 * 
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

export interface TaskContext {
  projectDomain: string;
  currentStage: StageId;
  relatedSpecifications: string[];
  dependencies: string[];
  assumptions: string[];
}

export interface Reference {
  type: 'specification' | 'asset' | 'decision' | 'output';
  path: string;
  description: string;
  required: boolean;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  context: TaskContext;
  dependencies: string[];
  completionCriteria: string[];
  estimatedTokens: number;
  references: Reference[];
  validationSteps: string[];
  checkpoints: string[];
}

export interface LargeTask {
  id: string;
  title: string;
  description: string;
  estimatedTokens: number;
  subtasks: string[];
}

export interface Specification {
  id: string;
  name: string;
  type: string;
  content: string;
  stage: StageId;
  requirements: string[];
}

export interface TaskValidationResult {
  isValid: boolean;
  isContextAgnostic: boolean;
  hasAllReferences: boolean;
  hasCompletionCriteria: boolean;
  hasValidationSteps: boolean;
  errors: string[];
  warnings: string[];
}

export interface ChunkingResult {
  originalTask: LargeTask;
  chunks: Task[];
  totalEstimatedTokens: number;
  chunkCount: number;
}

const DEFAULT_TOKEN_LIMIT = 4000;
const MIN_CHUNK_SIZE = 500;

export class TaskGenerationEngine {
  private tokenLimit: number;

  constructor(tokenLimit: number = DEFAULT_TOKEN_LIMIT) {
    this.tokenLimit = tokenLimit;
  }

  /**
   * Generate context-agnostic tasks from specifications
   */
  generateTasks(specifications: Specification[]): Task[] {
    const tasks: Task[] = [];

    for (const spec of specifications) {
      const specTasks = this.generateTasksFromSpecification(spec);
      tasks.push(...specTasks);
    }

    // Add dependencies between tasks
    this.resolveDependencies(tasks);

    return tasks;
  }

  /**
   * Chunk a large task into smaller, manageable pieces
   */
  chunkLargeTask(task: LargeTask): Task[] {
    if (task.estimatedTokens <= this.tokenLimit) {
      return [this.convertToTask(task)];
    }

    const chunks: Task[] = [];
    const chunkCount = Math.ceil(task.estimatedTokens / this.tokenLimit);
    const subtasksPerChunk = Math.ceil(task.subtasks.length / chunkCount);

    for (let i = 0; i < chunkCount; i++) {
      const startIdx = i * subtasksPerChunk;
      const endIdx = Math.min(startIdx + subtasksPerChunk, task.subtasks.length);
      const chunkSubtasks = task.subtasks.slice(startIdx, endIdx);

      const chunk: Task = {
        id: `${task.id}-chunk-${i + 1}`,
        title: `${task.title} (Part ${i + 1}/${chunkCount})`,
        description: `${task.description}\n\nThis is part ${i + 1} of ${chunkCount}. Focus on:\n${chunkSubtasks.map(s => `- ${s}`).join('\n')}`,
        context: {
          projectDomain: 'general',
          currentStage: StageId.IMPLEMENTATION,
          relatedSpecifications: [],
          dependencies: i > 0 ? [`${task.id}-chunk-${i}`] : [],
          assumptions: [`Previous chunks (1-${i}) are completed`]
        },
        dependencies: i > 0 ? [`${task.id}-chunk-${i}`] : [],
        completionCriteria: chunkSubtasks.map(s => `Complete: ${s}`),
        estimatedTokens: Math.ceil(task.estimatedTokens / chunkCount),
        references: [],
        validationSteps: [`Verify all items in part ${i + 1} are complete`],
        checkpoints: [`Part ${i + 1} complete`]
      };

      chunks.push(chunk);
    }

    return chunks;
  }

  /**
   * Validate task completeness and context-agnosticism
   */
  validateTaskCompleteness(task: Task): TaskValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (!task.id) errors.push('Task ID is required');
    if (!task.title) errors.push('Task title is required');
    if (!task.description || task.description.length < 10) {
      errors.push('Task description must be at least 10 characters');
    }

    // Check context-agnosticism
    const isContextAgnostic = this.checkContextAgnosticism(task);
    if (!isContextAgnostic) {
      warnings.push('Task may not be fully context-agnostic');
    }

    // Check references
    const hasAllReferences = task.references.length > 0 || task.context.relatedSpecifications.length > 0;
    if (!hasAllReferences) {
      warnings.push('Task has no references - may lack context');
    }

    // Check completion criteria
    const hasCompletionCriteria = task.completionCriteria.length > 0;
    if (!hasCompletionCriteria) {
      errors.push('Task must have at least one completion criterion');
    }

    // Check validation steps
    const hasValidationSteps = task.validationSteps.length > 0;
    if (!hasValidationSteps) {
      warnings.push('Task has no validation steps');
    }

    return {
      isValid: errors.length === 0,
      isContextAgnostic,
      hasAllReferences,
      hasCompletionCriteria,
      hasValidationSteps,
      errors,
      warnings
    };
  }

  /**
   * Add context references to a task
   */
  addContextReferences(task: Task, references: Reference[]): Task {
    return {
      ...task,
      references: [...task.references, ...references],
      context: {
        ...task.context,
        relatedSpecifications: [
          ...task.context.relatedSpecifications,
          ...references.filter(r => r.type === 'specification').map(r => r.path)
        ]
      }
    };
  }

  /**
   * Estimate token count for content
   */
  estimateTokens(content: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(content.length / 4);
  }

  /**
   * Get the token limit
   */
  getTokenLimit(): number {
    return this.tokenLimit;
  }

  /**
   * Set the token limit
   */
  setTokenLimit(limit: number): void {
    this.tokenLimit = Math.max(limit, MIN_CHUNK_SIZE);
  }

  // Private methods

  private generateTasksFromSpecification(spec: Specification): Task[] {
    const tasks: Task[] = [];
    const requirements = spec.requirements.length > 0 ? spec.requirements : ['Implement specification'];

    for (let i = 0; i < requirements.length; i++) {
      const requirement = requirements[i];
      const task: Task = {
        id: `${spec.id}-task-${i + 1}`,
        title: `Implement: ${requirement.substring(0, 50)}${requirement.length > 50 ? '...' : ''}`,
        description: this.generateTaskDescription(spec, requirement),
        context: {
          projectDomain: spec.type,
          currentStage: spec.stage,
          relatedSpecifications: [spec.id],
          dependencies: i > 0 ? [`${spec.id}-task-${i}`] : [],
          assumptions: this.generateAssumptions(spec)
        },
        dependencies: i > 0 ? [`${spec.id}-task-${i}`] : [],
        completionCriteria: this.generateCompletionCriteria(requirement),
        estimatedTokens: this.estimateTokens(requirement + spec.content.substring(0, 500)),
        references: [{
          type: 'specification',
          path: `specifications/${spec.id}.md`,
          description: spec.name,
          required: true
        }],
        validationSteps: this.generateValidationSteps(requirement),
        checkpoints: [`${requirement.substring(0, 30)} complete`]
      };

      tasks.push(task);
    }

    return tasks;
  }

  private generateTaskDescription(spec: Specification, requirement: string): string {
    return `## Objective
${requirement}

## Context
This task is part of the ${spec.name} specification in the ${spec.stage} stage.

## Specification Reference
- ID: ${spec.id}
- Type: ${spec.type}
- Stage: ${spec.stage}

## Implementation Notes
${spec.content.substring(0, 300)}${spec.content.length > 300 ? '...' : ''}

## Self-Contained Information
This task contains all necessary context to be executed without requiring previous conversation history.
`;
  }

  private generateAssumptions(spec: Specification): string[] {
    return [
      `Specification ${spec.id} is approved and finalized`,
      `Previous stage outputs are available`,
      `Development environment is configured`
    ];
  }

  private generateCompletionCriteria(requirement: string): string[] {
    return [
      `Requirement "${requirement.substring(0, 50)}" is implemented`,
      'Code compiles without errors',
      'Unit tests pass',
      'Documentation is updated'
    ];
  }

  private generateValidationSteps(requirement: string): string[] {
    return [
      'Run unit tests',
      'Verify implementation matches requirement',
      'Check for code quality issues',
      'Review documentation updates'
    ];
  }

  private resolveDependencies(tasks: Task[]): void {
    // Build dependency graph and validate
    const taskIds = new Set(tasks.map(t => t.id));
    
    for (const task of tasks) {
      // Filter out invalid dependencies
      task.dependencies = task.dependencies.filter(dep => taskIds.has(dep));
      task.context.dependencies = task.context.dependencies.filter(dep => taskIds.has(dep));
    }
  }

  private checkContextAgnosticism(task: Task): boolean {
    // A task is context-agnostic if it has:
    // 1. Clear description
    // 2. References to required specifications
    // 3. Explicit dependencies
    // 4. Completion criteria
    // 5. No references to "previous conversation" or similar

    const hasDescription = task.description.length >= 50;
    const hasReferences = task.references.length > 0 || task.context.relatedSpecifications.length > 0;
    const hasExplicitDependencies = task.dependencies.length === 0 || task.dependencies.every(d => d.length > 0);
    const hasCriteria = task.completionCriteria.length > 0;
    
    // Check for conversation-dependent language
    const conversationPatterns = [
      'as discussed',
      'as mentioned',
      'from our conversation',
      'earlier we',
      'you said',
      'I mentioned'
    ];
    const hasConversationDependency = conversationPatterns.some(pattern => 
      task.description.toLowerCase().includes(pattern)
    );

    return hasDescription && hasReferences && hasExplicitDependencies && hasCriteria && !hasConversationDependency;
  }

  private convertToTask(largeTask: LargeTask): Task {
    return {
      id: largeTask.id,
      title: largeTask.title,
      description: largeTask.description,
      context: {
        projectDomain: 'general',
        currentStage: StageId.IMPLEMENTATION,
        relatedSpecifications: [],
        dependencies: [],
        assumptions: []
      },
      dependencies: [],
      completionCriteria: largeTask.subtasks.map(s => `Complete: ${s}`),
      estimatedTokens: largeTask.estimatedTokens,
      references: [],
      validationSteps: ['Verify all subtasks are complete'],
      checkpoints: ['Task complete']
    };
  }
}
