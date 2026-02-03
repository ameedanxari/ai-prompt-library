import { readFileSync, existsSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { StageId, StageStatus, StageResult, ArchitecturalDecision, ProjectContext, ProjectBrief } from './stage-pipeline-controller.js';

/**
 * State Management System
 * 
 * Maintains comprehensive project state across all stages and enables resumable execution.
 * Creates and manages state files: NEXT_ACTION.md, PROJECT_STATE.md, DEVELOPMENT_LOG.md,
 * ARCHITECTURE_DECISIONS.md, COMPLETED_FEATURES.md
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */

export interface NextAction {
  currentStage: StageId;
  status: StageStatus;
  nextStage: StageId | null;
  description: string;
  prerequisites: string[];
  contextFiles: string[];
  timestamp: Date;
}

export interface ProjectState {
  projectId: string;
  projectName: string;
  currentStage: StageId;
  completedStages: StageId[];
  decisions: ArchitecturalDecision[];
  outputs: StageOutput[];
  nextAction: NextAction;
  createdAt: Date;
  updatedAt: Date;
}

export interface StageOutput {
  stageId: StageId;
  type: string;
  filename: string;
  content: string;
  timestamp: Date;
}

export interface DevelopmentLogEntry {
  timestamp: Date;
  stage: StageId;
  action: string;
  details: string;
  duration?: number;
}

export interface CompletedFeature {
  id: string;
  name: string;
  stage: StageId;
  description: string;
  completedAt: Date;
  relatedDecisions: string[];
}

export interface StateValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingFiles: string[];
  inconsistencies: string[];
}

export interface ReconstructedContext {
  projectState: ProjectState | null;
  nextAction: NextAction | null;
  decisions: ArchitecturalDecision[];
  developmentLog: DevelopmentLogEntry[];
  completedFeatures: CompletedFeature[];
  isComplete: boolean;
  missingData: string[];
}

const STATE_FILES = {
  NEXT_ACTION: 'NEXT_ACTION.md',
  PROJECT_STATE: 'PROJECT_STATE.md',
  DEVELOPMENT_LOG: 'DEVELOPMENT_LOG.md',
  ARCHITECTURE_DECISIONS: 'ARCHITECTURE_DECISIONS.md',
  COMPLETED_FEATURES: 'COMPLETED_FEATURES.md',
  KNOWN_ISSUES: 'KNOWN_ISSUES.md'
};

export class StateManager {
  private basePath: string;
  private projectState: ProjectState | null = null;
  private developmentLog: DevelopmentLogEntry[] = [];
  private completedFeatures: CompletedFeature[] = [];

  constructor(basePath: string = 'prompts/outputs') {
    this.basePath = basePath;
  }

  /**
   * Create a new project state from a project brief
   */
  createProject(brief: ProjectBrief, projectName: string = 'project'): ProjectState {
    const projectId = this.generateProjectId(projectName);
    const now = new Date();

    const nextAction: NextAction = {
      currentStage: StageId.INTAKE,
      status: StageStatus.NOT_STARTED,
      nextStage: StageId.INTAKE,
      description: 'Begin project intake and validation',
      prerequisites: ['Project brief', 'Asset inventory'],
      contextFiles: [],
      timestamp: now
    };

    this.projectState = {
      projectId,
      projectName,
      currentStage: StageId.INTAKE,
      completedStages: [],
      decisions: [],
      outputs: [],
      nextAction,
      createdAt: now,
      updatedAt: now
    };

    this.developmentLog = [{
      timestamp: now,
      stage: StageId.INTAKE,
      action: 'PROJECT_CREATED',
      details: `Project "${projectName}" created with domain: ${brief.domain}`
    }];

    this.completedFeatures = [];

    return this.projectState;
  }

  /**
   * Update state after stage completion with phase clarity
   */
  updateStageProgress(stageId: StageId, result: StageResult): void {
    if (!this.projectState) {
      throw new Error('No project state initialized. Call createProject first.');
    }

    const now = new Date();

    // Update completed stages
    if (!this.projectState.completedStages.includes(stageId)) {
      this.projectState.completedStages.push(stageId);
    }

    // Update current stage
    this.projectState.currentStage = result.nextStage || stageId;

    // Add decisions
    this.projectState.decisions.push(...result.decisions);

    // Add outputs
    for (const output of result.outputs) {
      this.projectState.outputs.push({
        stageId,
        type: output.type,
        filename: output.filename,
        content: output.content,
        timestamp: now
      });
    }

    // Determine project phase
    const designComplete = this.projectState.completedStages.length >= 8;
    const currentPhase = designComplete ? 'READY_FOR_IMPLEMENTATION' : 'DESIGN';

    // Update next action with phase clarity
    this.projectState.nextAction = {
      currentStage: stageId,
      status: StageStatus.COMPLETED,
      nextStage: result.nextStage,
      description: result.nextStage 
        ? `Proceed to ${result.nextStage} (Design Phase)` 
        : designComplete 
          ? 'Design phase complete - Ready for Implementation Phase'
          : 'Pipeline complete',
      prerequisites: this.getStagePrerequisites(result.nextStage),
      contextFiles: result.outputs.map(o => o.filename),
      timestamp: now
    };

    this.projectState.updatedAt = now;

    // Add to development log with phase context
    this.developmentLog.push({
      timestamp: now,
      stage: stageId,
      action: 'STAGE_COMPLETED',
      details: `Stage ${stageId} design completed with ${result.outputs.length} outputs. Phase: ${currentPhase}. ${designComplete ? 'Design blueprints ready for implementation.' : 'Design phase continuing.'}`,
      duration: result.duration
    });
  }

  /**
   * Get the next action to perform
   */
  getNextAction(): NextAction | null {
    return this.projectState?.nextAction || null;
  }

  /**
   * Save an architectural decision
   */
  saveDecision(decision: ArchitecturalDecision): void {
    if (!this.projectState) {
      throw new Error('No project state initialized. Call createProject first.');
    }

    this.projectState.decisions.push(decision);
    this.projectState.updatedAt = new Date();

    this.developmentLog.push({
      timestamp: new Date(),
      stage: decision.stage,
      action: 'DECISION_RECORDED',
      details: `Decision: ${decision.title}`
    });
  }

  /**
   * Mark a feature as completed
   */
  markFeatureCompleted(feature: CompletedFeature): void {
    this.completedFeatures.push(feature);

    this.developmentLog.push({
      timestamp: new Date(),
      stage: feature.stage,
      action: 'FEATURE_COMPLETED',
      details: `Feature "${feature.name}" completed`
    });
  }

  /**
   * Reconstruct context from available files
   */
  reconstructContext(availableFiles: string[]): ReconstructedContext {
    const missingData: string[] = [];
    let projectState: ProjectState | null = null;
    let nextAction: NextAction | null = null;
    const decisions: ArchitecturalDecision[] = [];
    const developmentLog: DevelopmentLogEntry[] = [];
    const completedFeatures: CompletedFeature[] = [];

    // Try to reconstruct from available files
    for (const file of availableFiles) {
      const filename = file.split('/').pop() || '';
      
      if (filename === STATE_FILES.PROJECT_STATE) {
        projectState = this.parseProjectStateFile(file);
        if (!projectState) missingData.push('PROJECT_STATE parsing failed');
      } else if (filename === STATE_FILES.NEXT_ACTION) {
        nextAction = this.parseNextActionFile(file);
        if (!nextAction) missingData.push('NEXT_ACTION parsing failed');
      } else if (filename === STATE_FILES.ARCHITECTURE_DECISIONS) {
        const parsed = this.parseDecisionsFile(file);
        decisions.push(...parsed);
      } else if (filename === STATE_FILES.DEVELOPMENT_LOG) {
        const parsed = this.parseDevLogFile(file);
        developmentLog.push(...parsed);
      } else if (filename === STATE_FILES.COMPLETED_FEATURES) {
        const parsed = this.parseFeaturesFile(file);
        completedFeatures.push(...parsed);
      }
    }

    // Check for missing required files
    const requiredFiles = [STATE_FILES.PROJECT_STATE, STATE_FILES.NEXT_ACTION];
    for (const required of requiredFiles) {
      if (!availableFiles.some(f => f.includes(required))) {
        missingData.push(`Missing required file: ${required}`);
      }
    }

    const isComplete = missingData.length === 0 && projectState !== null && nextAction !== null;

    return {
      projectState,
      nextAction,
      decisions,
      developmentLog,
      completedFeatures,
      isComplete,
      missingData
    };
  }

  /**
   * Validate state consistency across all state files
   */
  validateStateConsistency(): StateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const missingFiles: string[] = [];
    const inconsistencies: string[] = [];

    if (!this.projectState) {
      errors.push('No project state initialized');
      return { isValid: false, errors, warnings, missingFiles, inconsistencies };
    }

    // Validate completed stages are in correct order
    const stageOrder = Object.values(StageId);
    let lastIndex = -1;
    for (const stage of this.projectState.completedStages) {
      const index = stageOrder.indexOf(stage);
      if (index <= lastIndex) {
        inconsistencies.push(`Stage ${stage} is out of order in completed stages`);
      }
      lastIndex = index;
    }

    // Validate current stage matches completed stages
    if (this.projectState.completedStages.length > 0) {
      const lastCompleted = this.projectState.completedStages[this.projectState.completedStages.length - 1];
      const lastCompletedIndex = stageOrder.indexOf(lastCompleted);
      const currentIndex = stageOrder.indexOf(this.projectState.currentStage);
      
      if (currentIndex < lastCompletedIndex) {
        inconsistencies.push('Current stage is before last completed stage');
      }
    }

    // Validate next action consistency
    if (this.projectState.nextAction) {
      if (this.projectState.nextAction.status === StageStatus.COMPLETED) {
        if (!this.projectState.completedStages.includes(this.projectState.nextAction.currentStage)) {
          inconsistencies.push('Next action shows completed but stage not in completed list');
        }
      }
    }

    // Validate decisions have valid stages
    for (const decision of this.projectState.decisions) {
      if (!stageOrder.includes(decision.stage)) {
        errors.push(`Decision ${decision.id} has invalid stage: ${decision.stage}`);
      }
    }

    // Validate outputs have valid stages
    for (const output of this.projectState.outputs) {
      if (!stageOrder.includes(output.stageId)) {
        errors.push(`Output ${output.filename} has invalid stage: ${output.stageId}`);
      }
    }

    return {
      isValid: errors.length === 0 && inconsistencies.length === 0,
      errors,
      warnings,
      missingFiles,
      inconsistencies
    };
  }

  /**
   * Get current project state
   */
  getProjectState(): ProjectState | null {
    return this.projectState;
  }

  /**
   * Get development log
   */
  getDevelopmentLog(): DevelopmentLogEntry[] {
    return [...this.developmentLog];
  }

  /**
   * Get completed features
   */
  getCompletedFeatures(): CompletedFeature[] {
    return [...this.completedFeatures];
  }

  /**
   * Generate state file content for NEXT_ACTION.md with phase clarity
   */
  generateNextActionFile(): string {
    if (!this.projectState?.nextAction) return '';

    const na = this.projectState.nextAction;
    const designComplete = this.projectState.completedStages.length >= 8;
    const currentPhase = designComplete ? 'READY_FOR_IMPLEMENTATION' : 'DESIGN';
    
    return `# Next Action

## PROJECT PHASE CLARITY
**Current Phase**: ${currentPhase}
**Design Phase**: ${designComplete ? 'Complete - Blueprints Ready' : 'In Progress'}
**Implementation Phase**: ${designComplete ? 'Ready to Begin' : 'Pending Design Completion'}

## IMPORTANT: Understanding "Completed" Stages
✅ **Completed Design Stage** = Blueprint ready for implementation use
❌ **Completed Design Stage** ≠ Work is finished and done

## Current Status
- **Stage**: ${na.currentStage}
- **Status**: ${na.status}
- **Next Stage**: ${na.nextStage || 'Design Complete - Ready for Implementation'}

## Description
${na.description}

## Prerequisites
${na.prerequisites.map(p => `- ${p}`).join('\n')}

## Context Files (Design Blueprints)
${na.contextFiles.map(f => `- ${f} (Ready for implementation use)`).join('\n') || '- None'}

## Design Artifacts Status
${this.projectState.outputs.filter(o => o.filename.includes('requirements')).length > 0 ? '✅ Requirements blueprint ready for implementation' : '❌ Requirements not yet designed'}
${this.projectState.outputs.filter(o => o.filename.includes('architecture')).length > 0 ? '✅ Architecture blueprint ready for implementation' : '❌ Architecture not yet designed'}
${this.projectState.outputs.filter(o => o.filename.includes('features')).length > 0 ? '✅ Features blueprint ready for implementation' : '❌ Features not yet designed'}

## Phase Transition Rules
- **Design → Implementation**: All blueprints complete, ready to build
- **Implementation → Production**: All code built and tested, ready to deploy

## Last Updated
${na.timestamp.toISOString()}

---
*Generated by State Manager with Phase Clarification*
`;
  }

  /**
   * Generate state file content for PROJECT_STATE.md with phase clarity
   */
  generateProjectStateFile(): string {
    if (!this.projectState) return '';

    const ps = this.projectState;
    const designComplete = ps.completedStages.length >= 8;
    const currentPhase = designComplete ? 'READY_FOR_IMPLEMENTATION' : 'DESIGN';
    
    return `# Project State

## Project Information
- **ID**: ${ps.projectId}
- **Name**: ${ps.projectName}
- **Current Phase**: ${currentPhase}
- **Current Stage**: ${ps.currentStage}
- **Created**: ${ps.createdAt.toISOString()}
- **Updated**: ${ps.updatedAt.toISOString()}

## Design Phase Progress
${ps.completedStages.map(s => `- [x] ${s} (Design blueprint ready for implementation)`).join('\n') || '- None'}

## Pending Design Stages
${Object.values(StageId).filter(s => !ps.completedStages.includes(s)).map(s => `- [ ] ${s} (Design blueprint pending)`).join('\n')}

## Generated Design Blueprints
${ps.outputs.map(o => `- ${o.filename} (${o.type}) - Ready for implementation use`).join('\n') || '- None'}

## Architectural Decisions (Implementation Guides)
${ps.decisions.length} architectural decisions recorded - use these during implementation.

## 🎓 PHASE CLARIFICATION FOR AI AGENTS

### What "Completed" Stages Mean
- ✅ **Design blueprint is ready for implementation**
- ✅ **Specifications are ready to be followed**
- ✅ **Task lists are ready to be executed**

### What "Completed" Stages DON'T Mean
- ❌ Work is finished and done
- ❌ Files can be ignored
- ❌ Implementation should start fresh

### Implementation Phase Rules
1. **Reference all completed design stages** during implementation
2. **Follow specifications exactly** - they are your implementation guide
3. **Execute task lists step by step** - they contain the implementation plan
4. **Use design artifacts continuously** throughout implementation

---
*Generated by State Manager with Phase Clarification*
`;
  }

  /**
   * Generate state file content for DEVELOPMENT_LOG.md
   */
  generateDevelopmentLogFile(): string {
    return `# Development Log

${this.developmentLog.map(entry => `## ${entry.timestamp.toISOString()}
- **Stage**: ${entry.stage}
- **Action**: ${entry.action}
- **Details**: ${entry.details}
${entry.duration ? `- **Duration**: ${entry.duration}ms` : ''}
`).join('\n')}
`;
  }

  /**
   * Generate state file content for ARCHITECTURE_DECISIONS.md
   */
  generateArchitectureDecisionsFile(): string {
    if (!this.projectState) return '';

    return `# Architecture Decisions

${this.projectState.decisions.map(d => `## ${d.id}: ${d.title}

- **Stage**: ${d.stage}
- **Date**: ${d.timestamp.toISOString()}

### Decision
${d.decision}

### Rationale
${d.rationale}

### Alternatives Considered
${d.alternatives.map(a => `- ${a}`).join('\n')}

### Impact
${d.impact.map(i => `- ${i}`).join('\n')}

---
`).join('\n')}
`;
  }

  /**
   * Generate state file content for COMPLETED_FEATURES.md
   */
  generateCompletedFeaturesFile(): string {
    return `# Completed Features

${this.completedFeatures.map(f => `## ${f.name}

- **ID**: ${f.id}
- **Stage**: ${f.stage}
- **Completed**: ${f.completedAt.toISOString()}

### Description
${f.description}

### Related Decisions
${f.relatedDecisions.map(d => `- ${d}`).join('\n') || '- None'}

---
`).join('\n')}
`;
  }

  // Private helper methods

  private generateProjectId(projectName: string): string {
    const timestamp = Date.now().toString(36);
    const sanitized = projectName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${sanitized}-${timestamp}`;
  }

  private getStagePrerequisites(stageId: StageId | null): string[] {
    if (!stageId) return [];

    const prerequisites: Record<StageId, string[]> = {
      [StageId.INTAKE]: ['Project brief', 'Asset inventory'],
      [StageId.CHARTER]: ['Validated brief', 'Asset inventory'],
      [StageId.ARCHITECTURE]: ['Project charter', 'Scope definition'],
      [StageId.FEATURES]: ['Architecture design'],
      [StageId.TESTING]: ['Feature specifications'],
      [StageId.IMPLEMENTATION]: ['Feature specs', 'Testing strategy'],
      [StageId.DEPLOYMENT]: ['Architecture design', 'Implementation prompts'],
      [StageId.DOCUMENTATION]: ['All previous outputs'],
      [StageId.QUALITY]: ['All previous outputs'],
      [StageId.HANDOFF]: ['Quality report']
    };

    return prerequisites[stageId] || [];
  }

  private parseProjectStateFile(filepath: string): ProjectState | null {
    // Simplified parsing - in real implementation would parse markdown
    try {
      return this.projectState;
    } catch {
      return null;
    }
  }

  private parseNextActionFile(filepath: string): NextAction | null {
    try {
      return this.projectState?.nextAction || null;
    } catch {
      return null;
    }
  }

  private parseDecisionsFile(filepath: string): ArchitecturalDecision[] {
    return this.projectState?.decisions || [];
  }

  private parseDevLogFile(filepath: string): DevelopmentLogEntry[] {
    return this.developmentLog;
  }

  private parseFeaturesFile(filepath: string): CompletedFeature[] {
    return this.completedFeatures;
  }
}
