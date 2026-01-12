import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Stage Pipeline Controller
 * 
 * Orchestrates the sequential execution of all 10 stages with proper validation
 * and state management. Implements the documented pipeline behavior.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5
 */

export enum StageId {
  INTAKE = 'stage-01-intake',
  CHARTER = 'stage-02-charter',
  ARCHITECTURE = 'stage-03-architecture',
  FEATURES = 'stage-04-features',
  TESTING = 'stage-05-testing',
  IMPLEMENTATION = 'stage-06-implementation',
  DEPLOYMENT = 'stage-07-deployment',
  DOCUMENTATION = 'stage-08-documentation',
  QUALITY = 'stage-09-quality',
  HANDOFF = 'stage-10-handoff'
}

export enum StageStatus {
  NOT_STARTED = 'not-started',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  BLOCKED = 'blocked'
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StageOutput {
  type: string;
  filename: string;
  content: string;
  platform?: string;
  references: string[];
}

export interface StageResult {
  stageId: StageId;
  status: StageStatus;
  outputs: StageOutput[];
  decisions: ArchitecturalDecision[];
  nextStage: StageId | null;
  validationResults: ValidationResult[];
  timestamp: Date;
  duration: number;
}

export interface ArchitecturalDecision {
  id: string;
  title: string;
  stage: StageId;
  decision: string;
  rationale: string;
  alternatives: string[];
  impact: string[];
  timestamp: Date;
}

export interface ProjectBrief {
  description: string;
  platforms: string[];
  domain: string;
  requirements: string[];
}

export interface ProjectContext {
  brief: ProjectBrief;
  currentStage: StageId;
  completedStages: StageResult[];
  decisions: ArchitecturalDecision[];
  assets: string[];
  templates: string[];
}

export interface StageDefinition {
  id: StageId;
  name: string;
  description: string;
  dependencies: StageId[];
  requiredInputs: string[];
  expectedOutputs: string[];
}

const STAGE_ORDER: StageId[] = [
  StageId.INTAKE,
  StageId.CHARTER,
  StageId.ARCHITECTURE,
  StageId.FEATURES,
  StageId.TESTING,
  StageId.IMPLEMENTATION,
  StageId.DEPLOYMENT,
  StageId.DOCUMENTATION,
  StageId.QUALITY,
  StageId.HANDOFF
];

export class StagePipelineController {
  private stageDefinitions: Map<StageId, StageDefinition>;
  private stageStatuses: Map<StageId, StageStatus>;
  private stageResults: Map<StageId, StageResult>;

  constructor() {
    this.stageDefinitions = this.initializeStageDefinitions();
    this.stageStatuses = new Map();
    this.stageResults = new Map();
    this.initializeStageStatuses();
  }

  /**
   * Execute a specific stage with validation and state management
   */
  async executeStage(stageId: StageId, context: ProjectContext): Promise<StageResult> {
    const startTime = Date.now();
    
    // Validate prerequisites before execution
    const validation = this.validatePrerequisites(stageId);
    if (!validation.isValid) {
      this.stageStatuses.set(stageId, StageStatus.BLOCKED);
      throw new Error(`Cannot execute stage ${stageId}: ${validation.errors.join(', ')}`);
    }

    // Mark stage as in progress
    this.stageStatuses.set(stageId, StageStatus.IN_PROGRESS);

    try {
      // Generate stage outputs
      const outputs = this.generateStageOutputs(stageId, context);
      const decisions = this.extractDecisions(stageId, context);
      
      // Determine next stage
      const nextStage = this.getNextStageId(stageId);
      
      const result: StageResult = {
        stageId,
        status: StageStatus.COMPLETED,
        outputs,
        decisions,
        nextStage,
        validationResults: [validation],
        timestamp: new Date(),
        duration: Date.now() - startTime
      };

      // Update internal state
      this.stageStatuses.set(stageId, StageStatus.COMPLETED);
      this.stageResults.set(stageId, result);

      return result;
    } catch (error) {
      this.stageStatuses.set(stageId, StageStatus.FAILED);
      throw error;
    }
  }

  /**
   * Validate all prerequisites for a stage
   */
  validatePrerequisites(stageId: StageId): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const definition = this.stageDefinitions.get(stageId);

    if (!definition) {
      return { isValid: false, errors: [`Unknown stage: ${stageId}`], warnings: [] };
    }

    // Check all dependency stages are completed
    for (const depId of definition.dependencies) {
      const depStatus = this.stageStatuses.get(depId);
      if (depStatus !== StageStatus.COMPLETED) {
        errors.push(`Dependency stage ${depId} is not completed (status: ${depStatus || 'unknown'})`);
      }
    }

    // Check required inputs are available
    for (const input of definition.requiredInputs) {
      if (!this.hasRequiredInput(input)) {
        warnings.push(`Required input '${input}' may not be available`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Transition to the next stage after current stage completion
   */
  async transitionToNextStage(currentStage: StageId): Promise<StageId | null> {
    const currentStatus = this.stageStatuses.get(currentStage);
    
    if (currentStatus !== StageStatus.COMPLETED) {
      throw new Error(`Cannot transition from stage ${currentStage}: stage is not completed (status: ${currentStatus})`);
    }

    const nextStage = this.getNextStageId(currentStage);
    
    if (nextStage) {
      // Validate next stage can be started
      const validation = this.validatePrerequisites(nextStage);
      if (!validation.isValid) {
        throw new Error(`Cannot transition to ${nextStage}: ${validation.errors.join(', ')}`);
      }
    }

    return nextStage;
  }

  /**
   * Get the current status of a stage
   */
  getStageStatus(stageId: StageId): StageStatus {
    return this.stageStatuses.get(stageId) || StageStatus.NOT_STARTED;
  }

  /**
   * Get the result of a completed stage
   */
  getStageResult(stageId: StageId): StageResult | undefined {
    return this.stageResults.get(stageId);
  }

  /**
   * Get all stage statuses
   */
  getAllStageStatuses(): Map<StageId, StageStatus> {
    return new Map(this.stageStatuses);
  }

  /**
   * Get the ordered list of all stages
   */
  getStageOrder(): StageId[] {
    return [...STAGE_ORDER];
  }

  /**
   * Get stage definition
   */
  getStageDefinition(stageId: StageId): StageDefinition | undefined {
    return this.stageDefinitions.get(stageId);
  }

  /**
   * Check if all stages are completed
   */
  isPipelineComplete(): boolean {
    return STAGE_ORDER.every(stageId => 
      this.stageStatuses.get(stageId) === StageStatus.COMPLETED
    );
  }

  /**
   * Get completed stages in order
   */
  getCompletedStages(): StageResult[] {
    return STAGE_ORDER
      .filter(stageId => this.stageStatuses.get(stageId) === StageStatus.COMPLETED)
      .map(stageId => this.stageResults.get(stageId)!)
      .filter(Boolean);
  }

  /**
   * Reset pipeline state (for testing or restart)
   */
  reset(): void {
    this.stageStatuses.clear();
    this.stageResults.clear();
    this.initializeStageStatuses();
  }

  // Private methods

  private initializeStageDefinitions(): Map<StageId, StageDefinition> {
    const definitions = new Map<StageId, StageDefinition>();

    definitions.set(StageId.INTAKE, {
      id: StageId.INTAKE,
      name: 'Intake',
      description: 'Gather and validate project brief and assets',
      dependencies: [],
      requiredInputs: ['brief', 'assets'],
      expectedOutputs: ['validated-brief', 'asset-inventory']
    });

    definitions.set(StageId.CHARTER, {
      id: StageId.CHARTER,
      name: 'Charter',
      description: 'Define project charter and scope',
      dependencies: [StageId.INTAKE],
      requiredInputs: ['validated-brief', 'asset-inventory'],
      expectedOutputs: ['project-charter', 'scope-definition']
    });

    definitions.set(StageId.ARCHITECTURE, {
      id: StageId.ARCHITECTURE,
      name: 'Architecture',
      description: 'Design system architecture and technology decisions',
      dependencies: [StageId.CHARTER],
      requiredInputs: ['project-charter', 'scope-definition'],
      expectedOutputs: ['architecture-design', 'technology-decisions']
    });

    definitions.set(StageId.FEATURES, {
      id: StageId.FEATURES,
      name: 'Features',
      description: 'Define feature specifications and requirements',
      dependencies: [StageId.ARCHITECTURE],
      requiredInputs: ['architecture-design'],
      expectedOutputs: ['feature-specifications', 'user-stories']
    });

    definitions.set(StageId.TESTING, {
      id: StageId.TESTING,
      name: 'Testing',
      description: 'Define testing strategy and test cases',
      dependencies: [StageId.FEATURES],
      requiredInputs: ['feature-specifications'],
      expectedOutputs: ['testing-strategy', 'test-cases']
    });

    definitions.set(StageId.IMPLEMENTATION, {
      id: StageId.IMPLEMENTATION,
      name: 'Implementation',
      description: 'Generate implementation prompts and tasks',
      dependencies: [StageId.TESTING],
      requiredInputs: ['feature-specifications', 'testing-strategy'],
      expectedOutputs: ['implementation-prompts', 'task-list']
    });

    definitions.set(StageId.DEPLOYMENT, {
      id: StageId.DEPLOYMENT,
      name: 'Deployment',
      description: 'Define deployment strategy and infrastructure',
      dependencies: [StageId.IMPLEMENTATION],
      requiredInputs: ['architecture-design', 'implementation-prompts'],
      expectedOutputs: ['deployment-strategy', 'infrastructure-config']
    });

    definitions.set(StageId.DOCUMENTATION, {
      id: StageId.DOCUMENTATION,
      name: 'Documentation',
      description: 'Generate project documentation',
      dependencies: [StageId.DEPLOYMENT],
      requiredInputs: ['all-previous-outputs'],
      expectedOutputs: ['technical-docs', 'user-docs']
    });

    definitions.set(StageId.QUALITY, {
      id: StageId.QUALITY,
      name: 'Quality',
      description: 'Quality assurance and validation',
      dependencies: [StageId.DOCUMENTATION],
      requiredInputs: ['all-previous-outputs'],
      expectedOutputs: ['quality-report', 'validation-results']
    });

    definitions.set(StageId.HANDOFF, {
      id: StageId.HANDOFF,
      name: 'Handoff',
      description: 'Final handoff and project completion',
      dependencies: [StageId.QUALITY],
      requiredInputs: ['quality-report'],
      expectedOutputs: ['handoff-package', 'completion-report']
    });

    return definitions;
  }

  private initializeStageStatuses(): void {
    for (const stageId of STAGE_ORDER) {
      this.stageStatuses.set(stageId, StageStatus.NOT_STARTED);
    }
  }

  private getNextStageId(currentStage: StageId): StageId | null {
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    if (currentIndex === -1 || currentIndex >= STAGE_ORDER.length - 1) {
      return null;
    }
    return STAGE_ORDER[currentIndex + 1];
  }

  private hasRequiredInput(input: string): boolean {
    // Simplified check - in real implementation would check actual files/state
    return true;
  }

  private generateStageOutputs(stageId: StageId, context: ProjectContext): StageOutput[] {
    const definition = this.stageDefinitions.get(stageId);
    if (!definition) return [];

    return definition.expectedOutputs.map(outputName => ({
      type: this.getOutputType(outputName),
      filename: `${stageId}/${outputName}.md`,
      content: this.generateOutputContent(stageId, outputName, context),
      references: this.getOutputReferences(stageId, context)
    }));
  }

  private getOutputType(outputName: string): string {
    if (outputName.includes('architecture') || outputName.includes('design')) return 'architecture';
    if (outputName.includes('feature') || outputName.includes('spec')) return 'specification';
    if (outputName.includes('task') || outputName.includes('prompt')) return 'implementation';
    if (outputName.includes('test')) return 'testing';
    if (outputName.includes('doc')) return 'documentation';
    return 'general';
  }

  private generateOutputContent(stageId: StageId, outputName: string, context: ProjectContext): string {
    const definition = this.stageDefinitions.get(stageId);
    return `# ${definition?.name || stageId} - ${outputName}

## Overview
Generated output for ${outputName} in stage ${stageId}.

## Project Context
- Domain: ${context.brief.domain}
- Platforms: ${context.brief.platforms.join(', ')}

## Content
${context.brief.description}

## Requirements
${context.brief.requirements.map(r => `- ${r}`).join('\n')}

## Next Steps
Proceed to next stage after validation.
`;
  }

  private getOutputReferences(stageId: StageId, context: ProjectContext): string[] {
    const definition = this.stageDefinitions.get(stageId);
    if (!definition) return [];

    return definition.dependencies.map(depId => `${depId}/outputs`);
  }

  private extractDecisions(stageId: StageId, context: ProjectContext): ArchitecturalDecision[] {
    // Generate sample decisions based on stage
    const definition = this.stageDefinitions.get(stageId);
    if (!definition) return [];

    return [{
      id: `${stageId}-decision-1`,
      title: `${definition.name} Stage Decision`,
      stage: stageId,
      decision: `Completed ${definition.name} stage with standard approach`,
      rationale: `Based on project requirements and domain: ${context.brief.domain}`,
      alternatives: ['Alternative approach A', 'Alternative approach B'],
      impact: ['Affects downstream stages', 'Establishes patterns for implementation'],
      timestamp: new Date()
    }];
  }
}
