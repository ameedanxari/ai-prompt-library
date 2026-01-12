import { StageId, StageResult, StageStatus } from './stage-pipeline-controller.js';
import { ProjectState } from './state-manager.js';

/**
 * Quality Gate System
 * 
 * Creates validation framework for stage transitions with prerequisite checking,
 * output validation, and cross-platform consistency verification.
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

export interface QualityGate {
  id: string;
  name: string;
  stage: StageId;
  prerequisites: string[];
  validations: QualityValidation[];
  crossPlatformChecks: CrossPlatformCheck[];
}

export interface QualityValidation {
  id: string;
  name: string;
  type: 'content' | 'structure' | 'completeness' | 'consistency';
  validator: (input: any) => ValidationResult;
  required: boolean;
}

export interface CrossPlatformCheck {
  id: string;
  name: string;
  platforms: string[];
  validator: (outputs: Record<string, any>) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  code: string;
  message: string;
  severity: 'critical' | 'major' | 'minor';
  location?: string;
}

export interface ValidationWarning {
  code: string;
  message: string;
  suggestion: string;
}

export interface QualityGateResult {
  gateId: string;
  stage: StageId;
  passed: boolean;
  overallScore: number;
  prerequisiteResults: Record<string, boolean>;
  validationResults: Record<string, ValidationResult>;
  crossPlatformResults: Record<string, ValidationResult>;
  blockers: ValidationError[];
  recommendations: string[];
}

export interface StageTransitionValidation {
  canProceed: boolean;
  currentStageComplete: boolean;
  nextStageReady: boolean;
  qualityScore: number;
  issues: ValidationError[];
}

const MINIMUM_QUALITY_SCORE = 70;
const CRITICAL_ERROR_THRESHOLD = 0; // No critical errors allowed

export class QualityGateSystem {
  private qualityGates: Map<StageId, QualityGate> = new Map();
  private validationHistory: Map<string, QualityGateResult[]> = new Map();

  constructor() {
    this.initializeQualityGates();
  }

  /**
   * Validate stage transition readiness
   */
  validateStageTransition(
    currentStage: StageId,
    nextStage: StageId,
    stageResult: StageResult,
    projectState: ProjectState
  ): StageTransitionValidation {
    const currentGate = this.qualityGates.get(currentStage);
    const nextGate = this.qualityGates.get(nextStage);

    if (!currentGate || !nextGate) {
      return {
        canProceed: false,
        currentStageComplete: false,
        nextStageReady: false,
        qualityScore: 0,
        issues: [{
          code: 'MISSING_QUALITY_GATE',
          message: `Quality gate not found for stage ${currentStage} or ${nextStage}`,
          severity: 'critical'
        }]
      };
    }

    // Validate current stage completion
    const currentResult = this.executeQualityGate(currentGate, stageResult, projectState);
    
    // Check next stage prerequisites
    const nextStageReady = this.validatePrerequisites(nextGate, projectState);

    const issues: ValidationError[] = [];
    if (!currentResult.passed) {
      issues.push(...currentResult.blockers);
    }

    return {
      canProceed: currentResult.passed && nextStageReady && currentResult.overallScore >= MINIMUM_QUALITY_SCORE,
      currentStageComplete: currentResult.passed,
      nextStageReady,
      qualityScore: currentResult.overallScore,
      issues
    };
  }

  /**
   * Execute quality gate for a stage
   */
  executeQualityGate(
    gate: QualityGate,
    stageResult: StageResult,
    projectState: ProjectState
  ): QualityGateResult {
    const prerequisiteResults: Record<string, boolean> = {};
    const validationResults: Record<string, ValidationResult> = {};
    const crossPlatformResults: Record<string, ValidationResult> = {};
    const blockers: ValidationError[] = [];
    const recommendations: string[] = [];

    // Check prerequisites
    for (const prereq of gate.prerequisites) {
      prerequisiteResults[prereq] = this.checkPrerequisite(prereq, projectState);
      if (!prerequisiteResults[prereq]) {
        blockers.push({
          code: 'MISSING_PREREQUISITE',
          message: `Missing prerequisite: ${prereq}`,
          severity: 'critical'
        });
      }
    }

    // Execute validations
    for (const validation of gate.validations) {
      const result = validation.validator(stageResult);
      validationResults[validation.id] = result;

      if (!result.isValid && validation.required) {
        blockers.push(...result.errors.filter(e => e.severity === 'critical'));
      }

      recommendations.push(...result.suggestions);
    }

    // Execute cross-platform checks
    for (const check of gate.crossPlatformChecks) {
      const platformOutputs = this.extractPlatformOutputs(stageResult, check.platforms);
      const result = check.validator(platformOutputs);
      crossPlatformResults[check.id] = result;

      if (!result.isValid) {
        blockers.push(...result.errors.filter(e => e.severity === 'critical'));
      }
    }

    // Calculate overall score
    const allResults = [...Object.values(validationResults), ...Object.values(crossPlatformResults)];
    const overallScore = allResults.length > 0 
      ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
      : 0;

    const passed = blockers.length === 0 && overallScore >= MINIMUM_QUALITY_SCORE;

    const result: QualityGateResult = {
      gateId: gate.id,
      stage: gate.stage,
      passed,
      overallScore,
      prerequisiteResults,
      validationResults,
      crossPlatformResults,
      blockers,
      recommendations: [...new Set(recommendations)]
    };

    // Store in history
    const projectId = projectState.projectId;
    if (!this.validationHistory.has(projectId)) {
      this.validationHistory.set(projectId, []);
    }
    this.validationHistory.get(projectId)!.push(result);

    return result;
  }

  /**
   * Get quality gate for a stage
   */
  getQualityGate(stage: StageId): QualityGate | undefined {
    return this.qualityGates.get(stage);
  }

  /**
   * Get validation history for a project
   */
  getValidationHistory(projectId: string): QualityGateResult[] {
    return this.validationHistory.get(projectId) || [];
  }

  /**
   * Get overall project quality score
   */
  getProjectQualityScore(projectId: string): number {
    const history = this.getValidationHistory(projectId);
    if (history.length === 0) return 0;

    return history.reduce((sum, result) => sum + result.overallScore, 0) / history.length;
  }

  /**
   * Validate cross-platform consistency
   */
  validateCrossPlatformConsistency(
    outputs: Record<string, any>,
    platforms: string[]
  ): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Ensure platforms is an array
    if (!Array.isArray(platforms)) {
      return {
        isValid: false,
        score: 0,
        errors: [{
          code: 'INVALID_PLATFORMS',
          message: 'Platforms parameter must be an array',
          severity: 'critical'
        }],
        warnings: [],
        suggestions: ['Provide platforms as an array of strings']
      };
    }

    // Check that all platforms have outputs
    for (const platform of platforms) {
      if (!outputs[platform]) {
        errors.push({
          code: 'MISSING_PLATFORM_OUTPUT',
          message: `Missing output for platform: ${platform}`,
          severity: 'major'
        });
      }
    }

    // Check consistency between platforms
    const platformKeys = Object.keys(outputs);
    if (platformKeys.length > 1) {
      const referenceOutput = outputs[platformKeys[0]];
      for (let i = 1; i < platformKeys.length; i++) {
        const currentOutput = outputs[platformKeys[i]];
        const consistency = this.calculateConsistency(referenceOutput, currentOutput);
        
        if (consistency < 0.8) {
          warnings.push({
            code: 'PLATFORM_INCONSISTENCY',
            message: `Inconsistency between ${platformKeys[0]} and ${platformKeys[i]}`,
            suggestion: 'Review platform-specific implementations for consistency'
          });
        }
      }
    }

    const score = Math.max(0, 100 - (errors.length * 20) - (warnings.length * 5));

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      score,
      errors,
      warnings,
      suggestions
    };
  }

  // Private methods

  private initializeQualityGates(): void {
    // Initialize quality gates for each stage
    const stages = Object.values(StageId);
    
    for (const stage of stages) {
      const gate: QualityGate = {
        id: `gate-${stage}`,
        name: `${stage} Quality Gate`,
        stage,
        prerequisites: this.getStagePrerequisites(stage),
        validations: this.getStageValidations(stage),
        crossPlatformChecks: this.getCrossPlatformChecks(stage)
      };
      
      this.qualityGates.set(stage, gate);
    }
  }

  private getStagePrerequisites(stage: StageId): string[] {
    const prerequisites: Record<StageId, string[]> = {
      [StageId.INTAKE]: [],
      [StageId.CHARTER]: ['validated-brief', 'asset-inventory'],
      [StageId.ARCHITECTURE]: ['project-charter', 'scope-definition'],
      [StageId.FEATURES]: ['architecture-design', 'technology-decisions'],
      [StageId.TESTING]: ['feature-specifications'],
      [StageId.IMPLEMENTATION]: ['feature-specifications', 'testing-strategy'],
      [StageId.DEPLOYMENT]: ['implementation-prompts', 'architecture-design'],
      [StageId.DOCUMENTATION]: ['all-previous-outputs'],
      [StageId.QUALITY]: ['documentation', 'implementation-complete'],
      [StageId.HANDOFF]: ['quality-validation', 'documentation-complete']
    };

    return prerequisites[stage] || [];
  }

  private getStageValidations(stage: StageId): QualityValidation[] {
    return [
      {
        id: 'content-completeness',
        name: 'Content Completeness',
        type: 'completeness',
        validator: this.validateContentCompleteness.bind(this),
        required: true
      },
      {
        id: 'structure-validity',
        name: 'Structure Validity',
        type: 'structure',
        validator: this.validateStructure.bind(this),
        required: true
      },
      {
        id: 'consistency-check',
        name: 'Consistency Check',
        type: 'consistency',
        validator: this.validateConsistency.bind(this),
        required: false
      }
    ];
  }

  private getCrossPlatformChecks(stage: StageId): CrossPlatformCheck[] {
    if ([StageId.ARCHITECTURE, StageId.FEATURES, StageId.IMPLEMENTATION].includes(stage)) {
      return [{
        id: 'platform-consistency',
        name: 'Platform Consistency',
        platforms: ['web', 'mobile', 'backend'],
        validator: this.validateCrossPlatformConsistency.bind(this)
      }];
    }
    return [];
  }

  private validatePrerequisites(gate: QualityGate, projectState: ProjectState): boolean {
    return gate.prerequisites.every(prereq => this.checkPrerequisite(prereq, projectState));
  }

  private checkPrerequisite(prerequisite: string, projectState: ProjectState): boolean {
    // Check if prerequisite is satisfied based on project state
    return projectState.outputs.some(output => 
      output.type === prerequisite || output.filename.includes(prerequisite)
    );
  }

  private extractPlatformOutputs(stageResult: StageResult, platforms: string[]): Record<string, any> {
    const platformOutputs: Record<string, any> = {};
    
    // Ensure platforms is an array
    if (!Array.isArray(platforms)) {
      return platformOutputs;
    }
    
    for (const platform of platforms) {
      const platformOutput = stageResult.outputs.find(o => o.platform === platform);
      if (platformOutput) {
        platformOutputs[platform] = platformOutput;
      }
    }
    
    return platformOutputs;
  }

  private validateContentCompleteness(input: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    if (!input.outputs || input.outputs.length === 0) {
      errors.push({
        code: 'NO_OUTPUTS',
        message: 'Stage produced no outputs',
        severity: 'critical'
      });
    }

    for (const output of input.outputs || []) {
      if (!output.content || output.content.length < 10) {
        errors.push({
          code: 'INSUFFICIENT_CONTENT',
          message: `Output ${output.filename} has insufficient content`,
          severity: 'major'
        });
      }
    }

    const score = Math.max(0, 100 - (errors.length * 25) - (warnings.length * 10));

    return {
      isValid: errors.filter(e => e.severity === 'critical').length === 0,
      score,
      errors,
      warnings,
      suggestions: ['Ensure all outputs have meaningful content']
    };
  }

  private validateStructure(input: any): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Validate that stage result has required structure
    const requiredFields = ['stageId', 'status', 'outputs', 'timestamp'];
    for (const field of requiredFields) {
      if (!(field in input)) {
        errors.push({
          code: 'MISSING_FIELD',
          message: `Missing required field: ${field}`,
          severity: 'critical'
        });
      }
    }

    const score = Math.max(0, 100 - (errors.length * 30));

    return {
      isValid: errors.length === 0,
      score,
      errors,
      warnings,
      suggestions: ['Ensure stage results follow the required structure']
    };
  }

  private validateConsistency(input: any): ValidationResult {
    const warnings: ValidationWarning[] = [];
    
    // Check for consistency in naming, formatting, etc.
    if (input.outputs) {
      const filenames = input.outputs.map((o: any) => o.filename);
      const hasConsistentNaming = filenames.every((name: string) => 
        name.includes(input.stageId) || name.match(/^[a-z-]+\.md$/)
      );
      
      if (!hasConsistentNaming) {
        warnings.push({
          code: 'INCONSISTENT_NAMING',
          message: 'Output filenames are not consistently named',
          suggestion: 'Use consistent naming convention for output files'
        });
      }
    }

    const score = Math.max(0, 100 - (warnings.length * 10));

    return {
      isValid: true,
      score,
      errors: [],
      warnings,
      suggestions: ['Maintain consistent naming and formatting across outputs']
    };
  }

  private calculateConsistency(output1: any, output2: any): number {
    // Simple consistency calculation based on structure similarity
    const keys1 = Object.keys(output1);
    const keys2 = Object.keys(output2);
    const commonKeys = keys1.filter(k => keys2.includes(k));
    
    return commonKeys.length / Math.max(keys1.length, keys2.length);
  }
}