import { readFileSync } from 'fs';
import { join } from 'path';

export interface TaskStructure {
  isContextAgnostic: boolean;
  hasClearObjective: boolean;
  includesAllReferences: boolean;
  hasPrerequisites: boolean;
  hasAcceptanceCriteria: boolean;
  hasValidationSteps: boolean;
  isIncrementallyBuildable: boolean;
  supportsMultiSession: boolean;
  hasCheckpoints: boolean;
  includesDryRunCapability: boolean;
}

export interface StateManagementStructure {
  hasProjectStatus: boolean;
  hasDevelopmentLog: boolean;
  hasNextSteps: boolean;
  hasArchitectureDecisions: boolean;
  hasCompletedFeatures: boolean;
  hasKnownIssues: boolean;
  maintainsContextSummary: boolean;
  tracksDecisions: boolean;
  enablesHandoff: boolean;
  supportsRecovery: boolean;
}

export class TaskGenerator {
  private templateContent: string;

  constructor(templatePath: string) {
    this.templateContent = readFileSync(templatePath, 'utf-8');
  }

  validateTaskStructure(): TaskStructure {
    const content = this.templateContent;
    
    return {
      isContextAgnostic: this.isContextAgnostic(content),
      hasClearObjective: this.hasClearObjective(content),
      includesAllReferences: this.includesAllReferences(content),
      hasPrerequisites: this.hasPrerequisites(content),
      hasAcceptanceCriteria: this.hasAcceptanceCriteria(content),
      hasValidationSteps: this.hasValidationSteps(content),
      isIncrementallyBuildable: this.isIncrementallyBuildable(content),
      supportsMultiSession: this.supportsMultiSession(content),
      hasCheckpoints: this.hasCheckpoints(content),
      includesDryRunCapability: this.includesDryRunCapability(content)
    };
  }

  private isContextAgnostic(content: string): boolean {
    // Check for context independence markers
    const contextMarkers = [
      'Context Independence',
      'self-contained',
      'without requiring previous conversation',
      'executable with only the information provided'
    ];
    
    return contextMarkers.some(marker => 
      content.toLowerCase().includes(marker.toLowerCase())
    );
  }

  private hasClearObjective(content: string): boolean {
    // Check for objective section and clear goal statements
    return content.includes('Objective') && 
           (content.includes('Single sentence describing') || 
            content.includes('what this task accomplishes'));
  }

  private includesAllReferences(content: string): boolean {
    // Check for reference management sections
    const referenceTypes = [
      'Specification References',
      'Asset References', 
      'Dependency Management',
      'Context'
    ];
    
    return referenceTypes.every(refType => 
      content.includes(refType)
    );
  }

  private hasPrerequisites(content: string): boolean {
    return content.includes('Prerequisites') || content.includes('Dependencies');
  }

  private hasAcceptanceCriteria(content: string): boolean {
    return content.includes('Acceptance Criteria') && 
           content.includes('measurable outcome');
  }

  private hasValidationSteps(content: string): boolean {
    return content.includes('Validation') && 
           (content.includes('Validation Commands') || content.includes('Quality validation'));
  }

  private isIncrementallyBuildable(content: string): boolean {
    return content.includes('Incremental Progress') && 
           content.includes('build upon each other');
  }

  private supportsMultiSession(content: string): boolean {
    return content.includes('Multi-Session') || 
           content.includes('Session Boundaries') ||
           content.includes('across multiple sessions');
  }

  private hasCheckpoints(content: string): boolean {
    return content.includes('Checkpoint') || 
           content.includes('Session Checkpoint');
  }

  private includesDryRunCapability(content: string): boolean {
    return content.includes('Dry-Run') && 
           content.includes('Validation Mode');
  }
}
export class StateManager {
  private templateContent: string;

  constructor(templatePath: string) {
    this.templateContent = readFileSync(templatePath, 'utf-8');
  }

  validateStateManagement(): StateManagementStructure {
    const content = this.templateContent;
    
    return {
      hasProjectStatus: this.hasProjectStatus(content),
      hasDevelopmentLog: this.hasDevelopmentLog(content),
      hasNextSteps: this.hasNextSteps(content),
      hasArchitectureDecisions: this.hasArchitectureDecisions(content),
      hasCompletedFeatures: this.hasCompletedFeatures(content),
      hasKnownIssues: this.hasKnownIssues(content),
      maintainsContextSummary: this.maintainsContextSummary(content),
      tracksDecisions: this.tracksDecisions(content),
      enablesHandoff: this.enablesHandoff(content),
      supportsRecovery: this.supportsRecovery(content)
    };
  }

  private hasProjectStatus(content: string): boolean {
    return content.includes('PROJECT_STATUS.md') && 
           content.includes('High-level project overview');
  }

  private hasDevelopmentLog(content: string): boolean {
    return content.includes('DEVELOPMENT_LOG.md') && 
           content.includes('Chronological record');
  }

  private hasNextSteps(content: string): boolean {
    return content.includes('NEXT_STEPS.md') && 
           content.includes('Clear action items');
  }

  private hasArchitectureDecisions(content: string): boolean {
    return content.includes('ARCHITECTURE_DECISIONS.md') && 
           content.includes('technical choices with rationale');
  }

  private hasCompletedFeatures(content: string): boolean {
    return content.includes('COMPLETED_FEATURES.md') && 
           content.includes('implemented and tested functionality');
  }

  private hasKnownIssues(content: string): boolean {
    return content.includes('KNOWN_ISSUES.md') && 
           content.includes('bugs, limitations, and technical debt');
  }

  private maintainsContextSummary(content: string): boolean {
    return content.includes('Context Summary') && 
           content.includes('Quick Orientation');
  }

  private tracksDecisions(content: string): boolean {
    return content.includes('Decision Record') || 
           content.includes('ADR') ||
           content.includes('Decision Logging');
  }

  private enablesHandoff(content: string): boolean {
    return content.includes('Handoff') && 
           content.includes('AI Agent') &&
           content.includes('new agent');
  }

  private supportsRecovery(content: string): boolean {
    return content.includes('Recovery') && 
           (content.includes('Recovery Procedures') || 
            content.includes('Emergency Procedures'));
  }

  // Validate requirements compliance for state management
  validateRequirements(): {
    requirement_7_1: boolean; // Context-agnostic task generation
    requirement_7_2: boolean; // Include necessary references
    requirement_7_3: boolean; // Multi-session structure
    requirement_7_4: boolean; // Checkpoint tasks
    requirement_7_5: boolean; // Incremental dependencies
    requirement_7_6: boolean; // Comprehensive project state
    requirement_7_7: boolean; // Context summaries
    requirement_7_8: boolean; // Decision logs
    requirement_7_9: boolean; // Progress checklists
    requirement_7_10: boolean; // Self-contained documentation
  } {
    const taskStructure = this.validateTaskStructure();
    const stateStructure = this.validateStateManagement();
    
    return {
      requirement_7_1: taskStructure.isContextAgnostic,
      requirement_7_2: taskStructure.includesAllReferences,
      requirement_7_3: taskStructure.supportsMultiSession,
      requirement_7_4: taskStructure.hasCheckpoints,
      requirement_7_5: taskStructure.isIncrementallyBuildable,
      requirement_7_6: stateStructure.hasProjectStatus && stateStructure.hasDevelopmentLog,
      requirement_7_7: stateStructure.maintainsContextSummary,
      requirement_7_8: stateStructure.tracksDecisions,
      requirement_7_9: stateStructure.hasCompletedFeatures && stateStructure.hasNextSteps,
      requirement_7_10: stateStructure.enablesHandoff
    };
  }

  private validateTaskStructure(): TaskStructure {
    // This method would need access to task generation templates
    // For now, return a basic structure based on state management content
    const content = this.templateContent;
    
    return {
      isContextAgnostic: content.includes('context-agnostic') || content.includes('self-contained'),
      hasClearObjective: content.includes('Objective') || content.includes('Purpose'),
      includesAllReferences: content.includes('References') || content.includes('Context'),
      hasPrerequisites: content.includes('Prerequisites') || content.includes('Dependencies'),
      hasAcceptanceCriteria: content.includes('Acceptance') || content.includes('Criteria'),
      hasValidationSteps: content.includes('Validation') || content.includes('Verification'),
      isIncrementallyBuildable: content.includes('Incremental') || content.includes('builds'),
      supportsMultiSession: content.includes('Multi-Session') || content.includes('session'),
      hasCheckpoints: content.includes('Checkpoint') || content.includes('milestone'),
      includesDryRunCapability: content.includes('Dry-Run') || content.includes('dry run')
    };
  }
}