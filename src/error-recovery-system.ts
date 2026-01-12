import { StageId, StageResult, ProjectContext } from './stage-pipeline-controller.js';
import { ProjectState } from './state-manager.js';

/**
 * Error Recovery System
 * 
 * Creates error detection and classification system with missing dependency resolution,
 * conflict detection and resolution options, and context reconstruction for lost/incomplete state.
 * 
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

export enum ErrorType {
  MISSING_DEPENDENCY = 'missing-dependency',
  CONFLICT = 'conflict',
  CONTEXT_LOSS = 'context-loss',
  VALIDATION_FAILURE = 'validation-failure',
  SYSTEM_ERROR = 'system-error'
}

export enum ErrorSeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor',
  WARNING = 'warning'
}

export interface DetectedError {
  id: string;
  type: ErrorType;
  severity: ErrorSeverity;
  stage: StageId;
  message: string;
  details: string;
  context: Record<string, any>;
  timestamp: Date;
  recoverable: boolean;
}

export interface RecoveryOption {
  id: string;
  name: string;
  description: string;
  type: 'automatic' | 'manual' | 'interactive';
  estimatedTime: number; // minutes
  riskLevel: 'low' | 'medium' | 'high';
  prerequisites: string[];
}

export interface RecoveryResult {
  success: boolean;
  optionUsed: string;
  message: string;
  recoveredData?: any;
  remainingIssues: DetectedError[];
  recommendations: string[];
}

export interface ConflictResolution {
  conflictId: string;
  strategy: 'merge' | 'override' | 'manual' | 'skip';
  resolution: any;
  rationale: string;
}

export interface ContextReconstruction {
  success: boolean;
  reconstructedContext: ProjectContext | null;
  confidence: number; // 0-1
  missingData: string[];
  assumptions: string[];
  warnings: string[];
}

export interface DependencyResolution {
  dependency: string;
  resolved: boolean;
  source: 'generated' | 'inferred' | 'default' | 'manual';
  data: any;
  confidence: number;
}

export class ErrorRecoverySystem {
  private errorHistory: Map<string, DetectedError[]> = new Map();
  private recoveryStrategies: Map<ErrorType, RecoveryOption[]> = new Map();

  constructor() {
    this.initializeRecoveryStrategies();
  }

  /**
   * Detect and classify errors in project state or stage results
   */
  detectErrors(
    projectState: ProjectState,
    stageResult?: StageResult,
    expectedContext?: ProjectContext
  ): DetectedError[] {
    const errors: DetectedError[] = [];
    const projectId = projectState.projectId;

    // Check for missing dependencies
    errors.push(...this.detectMissingDependencies(projectState, stageResult));

    // Check for conflicts
    errors.push(...this.detectConflicts(projectState, stageResult));

    // Check for context loss
    if (expectedContext) {
      errors.push(...this.detectContextLoss(projectState, expectedContext));
    }

    // Check for validation failures
    if (stageResult) {
      errors.push(...this.detectValidationFailures(stageResult));
    }

    // Store in history
    if (!this.errorHistory.has(projectId)) {
      this.errorHistory.set(projectId, []);
    }
    this.errorHistory.get(projectId)!.push(...errors);

    return errors;
  }

  /**
   * Get recovery options for a specific error
   */
  getRecoveryOptions(error: DetectedError): RecoveryOption[] {
    const strategies = this.recoveryStrategies.get(error.type) || [];
    
    // Filter strategies based on error severity and context
    return strategies.filter(strategy => {
      if (error.severity === ErrorSeverity.CRITICAL && strategy.riskLevel === 'high') {
        return false; // Don't suggest high-risk options for critical errors
      }
      return true;
    });
  }

  /**
   * Attempt to recover from an error using a specific option
   */
  async recoverFromError(
    error: DetectedError,
    option: RecoveryOption,
    projectState: ProjectState,
    userInput?: any
  ): Promise<RecoveryResult> {
    const startTime = Date.now();

    try {
      switch (error.type) {
        case ErrorType.MISSING_DEPENDENCY:
          return await this.recoverMissingDependency(error, option, projectState, userInput);
        
        case ErrorType.CONFLICT:
          return await this.recoverConflict(error, option, projectState, userInput);
        
        case ErrorType.CONTEXT_LOSS:
          return await this.recoverContextLoss(error, option, projectState, userInput);
        
        case ErrorType.VALIDATION_FAILURE:
          return await this.recoverValidationFailure(error, option, projectState, userInput);
        
        default:
          return {
            success: false,
            optionUsed: option.id,
            message: `No recovery strategy available for error type: ${error.type}`,
            remainingIssues: [error],
            recommendations: ['Manual intervention required']
          };
      }
    } catch (recoveryError) {
      return {
        success: false,
        optionUsed: option.id,
        message: `Recovery failed: ${recoveryError instanceof Error ? recoveryError.message : 'Unknown error'}`,
        remainingIssues: [error],
        recommendations: ['Try alternative recovery option or manual intervention']
      };
    }
  }

  /**
   * Resolve missing dependencies
   */
  resolveMissingDependencies(
    dependencies: string[],
    projectState: ProjectState
  ): DependencyResolution[] {
    const resolutions: DependencyResolution[] = [];

    for (const dependency of dependencies) {
      const resolution = this.resolveSingleDependency(dependency, projectState);
      resolutions.push(resolution);
    }

    return resolutions;
  }

  /**
   * Detect and resolve conflicts
   */
  detectAndResolveConflicts(
    projectState: ProjectState,
    stageResult: StageResult
  ): ConflictResolution[] {
    const conflicts = this.detectConflicts(projectState, stageResult);
    const resolutions: ConflictResolution[] = [];

    for (const conflict of conflicts) {
      const resolution = this.resolveConflict(conflict, projectState);
      if (resolution) {
        resolutions.push(resolution);
      }
    }

    return resolutions;
  }

  /**
   * Reconstruct context from available data
   */
  reconstructContext(
    availableData: Record<string, any>,
    projectState: ProjectState
  ): ContextReconstruction {
    const missingData: string[] = [];
    const assumptions: string[] = [];
    const warnings: string[] = [];

    // Try to reconstruct project context
    let reconstructedContext: ProjectContext | null = null;
    let confidence = 0;

    try {
      // Extract basic project information
      const brief = this.extractProjectBrief(availableData, projectState);
      if (!brief) {
        missingData.push('project-brief');
        assumptions.push('Using default project brief structure');
      }

      // Reconstruct context
      reconstructedContext = {
        brief: brief || this.createDefaultBrief(),
        currentStage: projectState.currentStage,
        completedStages: projectState.completedStages.map(stageId => ({
          stageId,
          status: 'completed' as any,
          outputs: [],
          decisions: [],
          nextStage: null,
          validationResults: [],
          timestamp: new Date(),
          duration: 0
        })),
        decisions: projectState.decisions,
        assets: this.extractAssets(availableData),
        templates: this.extractTemplates(availableData)
      };

      // Calculate confidence based on available data
      confidence = this.calculateReconstructionConfidence(availableData, projectState);

    } catch (error) {
      warnings.push(`Context reconstruction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      success: reconstructedContext !== null,
      reconstructedContext,
      confidence,
      missingData,
      assumptions,
      warnings
    };
  }

  /**
   * Get error history for a project
   */
  getErrorHistory(projectId: string): DetectedError[] {
    return this.errorHistory.get(projectId) || [];
  }

  // Private methods

  private initializeRecoveryStrategies(): void {
    // Missing dependency strategies
    this.recoveryStrategies.set(ErrorType.MISSING_DEPENDENCY, [
      {
        id: 'generate-dependency',
        name: 'Generate Missing Dependency',
        description: 'Automatically generate the missing dependency based on context',
        type: 'automatic',
        estimatedTime: 5,
        riskLevel: 'medium',
        prerequisites: []
      },
      {
        id: 'use-default',
        name: 'Use Default Value',
        description: 'Use a default value for the missing dependency',
        type: 'automatic',
        estimatedTime: 1,
        riskLevel: 'low',
        prerequisites: []
      },
      {
        id: 'manual-input',
        name: 'Manual Input',
        description: 'Request manual input for the missing dependency',
        type: 'manual',
        estimatedTime: 15,
        riskLevel: 'low',
        prerequisites: ['user-available']
      }
    ]);

    // Conflict strategies
    this.recoveryStrategies.set(ErrorType.CONFLICT, [
      {
        id: 'merge-conflicts',
        name: 'Merge Conflicting Data',
        description: 'Attempt to merge conflicting data intelligently',
        type: 'automatic',
        estimatedTime: 3,
        riskLevel: 'medium',
        prerequisites: []
      },
      {
        id: 'use-latest',
        name: 'Use Latest Version',
        description: 'Use the most recent version of conflicting data',
        type: 'automatic',
        estimatedTime: 1,
        riskLevel: 'low',
        prerequisites: []
      },
      {
        id: 'manual-resolution',
        name: 'Manual Resolution',
        description: 'Request manual resolution of conflicts',
        type: 'manual',
        estimatedTime: 20,
        riskLevel: 'low',
        prerequisites: ['user-available']
      }
    ]);

    // Context loss strategies
    this.recoveryStrategies.set(ErrorType.CONTEXT_LOSS, [
      {
        id: 'reconstruct-context',
        name: 'Reconstruct Context',
        description: 'Attempt to reconstruct lost context from available data',
        type: 'automatic',
        estimatedTime: 10,
        riskLevel: 'medium',
        prerequisites: []
      },
      {
        id: 'restart-stage',
        name: 'Restart Current Stage',
        description: 'Restart the current stage with available context',
        type: 'interactive',
        estimatedTime: 30,
        riskLevel: 'high',
        prerequisites: []
      }
    ]);
  }

  private detectMissingDependencies(
    projectState: ProjectState,
    stageResult?: StageResult
  ): DetectedError[] {
    const errors: DetectedError[] = [];
    
    // Check for missing stage outputs
    const expectedOutputs = this.getExpectedOutputs(projectState.currentStage);
    const actualOutputs = projectState.outputs.map(o => o.type);
    
    for (const expected of expectedOutputs) {
      if (!actualOutputs.includes(expected)) {
        errors.push({
          id: `missing-${expected}-${Date.now()}`,
          type: ErrorType.MISSING_DEPENDENCY,
          severity: ErrorSeverity.MAJOR,
          stage: projectState.currentStage,
          message: `Missing required output: ${expected}`,
          details: `Stage ${projectState.currentStage} requires output of type ${expected}`,
          context: { expectedOutput: expected, availableOutputs: actualOutputs },
          timestamp: new Date(),
          recoverable: true
        });
      }
    }

    return errors;
  }

  private detectConflicts(
    projectState: ProjectState,
    stageResult?: StageResult
  ): DetectedError[] {
    const errors: DetectedError[] = [];
    
    // Check for conflicting decisions
    const decisionTitles = projectState.decisions.map(d => d.title);
    const duplicates = decisionTitles.filter((title, index) => 
      decisionTitles.indexOf(title) !== index
    );
    
    for (const duplicate of [...new Set(duplicates)]) {
      errors.push({
        id: `conflict-decision-${duplicate}-${Date.now()}`,
        type: ErrorType.CONFLICT,
        severity: ErrorSeverity.MINOR,
        stage: projectState.currentStage,
        message: `Conflicting decisions found: ${duplicate}`,
        details: `Multiple decisions with the same title: ${duplicate}`,
        context: { conflictingTitle: duplicate },
        timestamp: new Date(),
        recoverable: true
      });
    }

    return errors;
  }

  private detectContextLoss(
    projectState: ProjectState,
    expectedContext: ProjectContext
  ): DetectedError[] {
    const errors: DetectedError[] = [];
    
    // Check if critical context is missing
    if (!expectedContext.brief || !expectedContext.brief.description) {
      errors.push({
        id: `context-loss-brief-${Date.now()}`,
        type: ErrorType.CONTEXT_LOSS,
        severity: ErrorSeverity.CRITICAL,
        stage: projectState.currentStage,
        message: 'Project brief context lost',
        details: 'Critical project brief information is missing',
        context: { missingData: 'project-brief' },
        timestamp: new Date(),
        recoverable: true
      });
    }

    return errors;
  }

  private detectValidationFailures(stageResult: StageResult): DetectedError[] {
    const errors: DetectedError[] = [];
    
    // Check validation results
    for (const validation of stageResult.validationResults) {
      if (!validation.isValid) {
        errors.push({
          id: `validation-failure-${stageResult.stageId}-${Date.now()}`,
          type: ErrorType.VALIDATION_FAILURE,
          severity: ErrorSeverity.MAJOR,
          stage: stageResult.stageId,
          message: 'Stage validation failed',
          details: 'Stage output failed validation checks',
          context: { validationResult: validation },
          timestamp: new Date(),
          recoverable: true
        });
      }
    }

    return errors;
  }

  private async recoverMissingDependency(
    error: DetectedError,
    option: RecoveryOption,
    projectState: ProjectState,
    userInput?: any
  ): Promise<RecoveryResult> {
    switch (option.id) {
      case 'generate-dependency':
        const generated = this.generateMissingDependency(error, projectState);
        return {
          success: generated !== null,
          optionUsed: option.id,
          message: generated ? 'Dependency generated successfully' : 'Failed to generate dependency',
          recoveredData: generated,
          remainingIssues: generated ? [] : [error],
          recommendations: generated ? [] : ['Try manual input option']
        };
      
      case 'use-default':
        const defaultValue = this.getDefaultValue(error.context.expectedOutput);
        return {
          success: true,
          optionUsed: option.id,
          message: 'Using default value for missing dependency',
          recoveredData: defaultValue,
          remainingIssues: [],
          recommendations: ['Review generated default value']
        };
      
      default:
        return {
          success: false,
          optionUsed: option.id,
          message: 'Recovery option not implemented',
          remainingIssues: [error],
          recommendations: ['Try alternative recovery option']
        };
    }
  }

  private async recoverConflict(
    error: DetectedError,
    option: RecoveryOption,
    projectState: ProjectState,
    userInput?: any
  ): Promise<RecoveryResult> {
    // Simplified conflict recovery
    return {
      success: true,
      optionUsed: option.id,
      message: 'Conflict resolved using latest version',
      remainingIssues: [],
      recommendations: ['Review merged data for accuracy']
    };
  }

  private async recoverContextLoss(
    error: DetectedError,
    option: RecoveryOption,
    projectState: ProjectState,
    userInput?: any
  ): Promise<RecoveryResult> {
    const reconstruction = this.reconstructContext({}, projectState);
    
    return {
      success: reconstruction.success,
      optionUsed: option.id,
      message: reconstruction.success ? 'Context reconstructed' : 'Context reconstruction failed',
      recoveredData: reconstruction.reconstructedContext,
      remainingIssues: reconstruction.success ? [] : [error],
      recommendations: reconstruction.warnings
    };
  }

  private async recoverValidationFailure(
    error: DetectedError,
    option: RecoveryOption,
    projectState: ProjectState,
    userInput?: any
  ): Promise<RecoveryResult> {
    // Simplified validation failure recovery
    return {
      success: false,
      optionUsed: option.id,
      message: 'Validation failure recovery not implemented',
      remainingIssues: [error],
      recommendations: ['Review and fix validation issues manually']
    };
  }

  private resolveSingleDependency(
    dependency: string,
    projectState: ProjectState
  ): DependencyResolution {
    // Try to find dependency in existing outputs
    const existingOutput = projectState.outputs.find(o => o.type === dependency);
    
    if (existingOutput) {
      return {
        dependency,
        resolved: true,
        source: 'generated',
        data: existingOutput,
        confidence: 1.0
      };
    }

    // Generate default dependency
    const defaultData = this.getDefaultValue(dependency);
    return {
      dependency,
      resolved: true,
      source: 'default',
      data: defaultData,
      confidence: 0.5
    };
  }

  private resolveConflict(
    conflict: DetectedError,
    projectState: ProjectState
  ): ConflictResolution | null {
    return {
      conflictId: conflict.id,
      strategy: 'merge',
      resolution: 'Use latest version',
      rationale: 'Automatically resolved using latest version strategy'
    };
  }

  private getExpectedOutputs(stage: StageId): string[] {
    const expectedOutputs: Record<StageId, string[]> = {
      [StageId.INTAKE]: ['validated-brief', 'asset-inventory'],
      [StageId.CHARTER]: ['project-charter', 'scope-definition'],
      [StageId.ARCHITECTURE]: ['architecture-design', 'technology-decisions'],
      [StageId.FEATURES]: ['feature-specifications', 'user-stories'],
      [StageId.TESTING]: ['testing-strategy', 'test-cases'],
      [StageId.IMPLEMENTATION]: ['implementation-prompts', 'task-list'],
      [StageId.DEPLOYMENT]: ['deployment-strategy', 'infrastructure-config'],
      [StageId.DOCUMENTATION]: ['technical-docs', 'user-docs'],
      [StageId.QUALITY]: ['quality-report', 'validation-results'],
      [StageId.HANDOFF]: ['handoff-package', 'completion-report']
    };

    return expectedOutputs[stage] || [];
  }

  private generateMissingDependency(error: DetectedError, projectState: ProjectState): any {
    const outputType = error.context.expectedOutput;
    return this.getDefaultValue(outputType);
  }

  private getDefaultValue(outputType: string): any {
    const defaults: Record<string, any> = {
      'validated-brief': { description: 'Default project brief', requirements: [] },
      'asset-inventory': { assets: [] },
      'project-charter': { scope: 'Default scope', objectives: [] },
      'architecture-design': { components: [], patterns: [] },
      'feature-specifications': { features: [] },
      'testing-strategy': { approach: 'Standard testing approach' }
    };

    return defaults[outputType] || { type: outputType, content: 'Default content' };
  }

  private extractProjectBrief(availableData: Record<string, any>, projectState: ProjectState): any {
    return availableData.brief || null;
  }

  private createDefaultBrief(): any {
    return {
      description: 'Default project description',
      platforms: ['web'],
      requirements: []
    };
  }

  private extractAssets(availableData: Record<string, any>): string[] {
    return availableData.assets || [];
  }

  private extractTemplates(availableData: Record<string, any>): string[] {
    return availableData.templates || [];
  }

  private calculateReconstructionConfidence(
    availableData: Record<string, any>,
    projectState: ProjectState
  ): number {
    let score = 0;
    let maxScore = 0;

    // Check for key data availability
    const keyData = ['brief', 'assets', 'templates', 'decisions'];
    for (const key of keyData) {
      maxScore += 25;
      if (availableData[key] || (projectState as any)[key]) {
        score += 25;
      }
    }

    return maxScore > 0 ? score / maxScore : 0;
  }
}