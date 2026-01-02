import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface QualityAssuranceCapability {
  hasCompletenessValidation: boolean;
  hasConflictResolution: boolean;
  hasQualityGateEnforcement: boolean;
  hasValidationChecklists: boolean;
  hasQualityMetrics: boolean;
}

export interface QualityGateStructure {
  hasAutomatedChecks: boolean;
  hasManualReviewProcess: boolean;
  hasDecisionMatrix: boolean;
  hasProgressionCriteria: boolean;
  hasRiskAssessment: boolean;
}

export class QualityAssuranceProcessor {
  private promptsPath: string;
  private stagesPath: string;

  constructor(promptsPath: string = 'prompts/templates', stagesPath: string = 'prompts/stages') {
    this.promptsPath = promptsPath;
    this.stagesPath = stagesPath;
  }

  validateQualityAssuranceCapability(): QualityAssuranceCapability {
    return {
      hasCompletenessValidation: this.hasCompletenessValidationPrompt(),
      hasConflictResolution: this.hasConflictResolutionPrompt(),
      hasQualityGateEnforcement: this.hasQualityGateEnforcementPrompt(),
      hasValidationChecklists: this.hasValidationChecklistsPrompt(),
      hasQualityMetrics: this.hasQualityMetricsPrompt()
    };
  }

  private hasCompletenessValidationPrompt(): boolean {
    const qualityPromptPath = join(this.promptsPath, 'quality-assurance-validation.md');
    if (!existsSync(qualityPromptPath)) return false;
    
    const content = readFileSync(qualityPromptPath, 'utf-8');
    
    // Check for completeness validation capabilities
    const validationAspects = [
      'Requirements Completeness',
      'Design Completeness',
      'Implementation Completeness',
      'Testing Completeness',
      'Documentation Completeness',
      'Deployment Readiness'
    ];
    
    return validationAspects.every(aspect => 
      content.includes(aspect) || content.toLowerCase().includes(aspect.toLowerCase())
    );
  }

  private hasConflictResolutionPrompt(): boolean {
    const qualityPromptPath = join(this.promptsPath, 'quality-assurance-validation.md');
    if (!existsSync(qualityPromptPath)) return false;
    
    const content = readFileSync(qualityPromptPath, 'utf-8');
    
    // Check for conflict resolution capabilities
    const conflictTypes = [
      'Technical Conflicts',
      'Requirements Conflicts',
      'Implementation Conflicts',
      'Objective Criteria Resolution',
      'Compromise Solutions',
      'Escalation Framework'
    ];
    
    return conflictTypes.every(type => 
      content.includes(type) || content.toLowerCase().includes(type.toLowerCase())
    );
  }

  private hasQualityGateEnforcementPrompt(): boolean {
    const qualityPromptPath = join(this.promptsPath, 'quality-assurance-validation.md');
    if (!existsSync(qualityPromptPath)) return false;
    
    const content = readFileSync(qualityPromptPath, 'utf-8');
    
    // Check for quality gate enforcement capabilities
    const gateFeatures = [
      'Quality Gate Enforcement',
      'Stage Progression Gates',
      'Automated Checks',
      'Manual Review Process',
      'Decision Matrix'
    ];
    
    return gateFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasValidationChecklistsPrompt(): boolean {
    const qualityStagesPath = join(this.stagesPath, 'stage-09-quality');
    if (!existsSync(qualityStagesPath)) return false;
    
    const platformAgnosticPath = join(qualityStagesPath, 'platform-agnostic.md');
    if (!existsSync(platformAgnosticPath)) return false;
    
    const content = readFileSync(platformAgnosticPath, 'utf-8');
    
    // Check for comprehensive validation checklists
    const checklistTypes = [
      'Pre-Release Quality Review',
      'Functional Quality',
      'Technical Quality',
      'Process Quality',
      'Compliance Validation'
    ];
    
    return checklistTypes.every(type => 
      content.includes(type) || content.toLowerCase().includes(type.toLowerCase())
    );
  }

  private hasQualityMetricsPrompt(): boolean {
    const qualityStagesPath = join(this.stagesPath, 'stage-09-quality');
    if (!existsSync(qualityStagesPath)) return false;
    
    const platformAgnosticPath = join(qualityStagesPath, 'platform-agnostic.md');
    if (!existsSync(platformAgnosticPath)) return false;
    
    const content = readFileSync(platformAgnosticPath, 'utf-8');
    
    // Check for quality metrics and monitoring
    const metricsTypes = [
      'Code Quality Metrics',
      'Documentation Quality Standards',
      'Key Quality Indicators',
      'Development Metrics',
      'Operational Metrics'
    ];
    
    return metricsTypes.every(type => 
      content.includes(type) || content.toLowerCase().includes(type.toLowerCase())
    );
  }

  validateQualityGateStructure(): QualityGateStructure {
    const qualityPromptPath = join(this.promptsPath, 'quality-assurance-validation.md');
    if (!existsSync(qualityPromptPath)) {
      return {
        hasAutomatedChecks: false,
        hasManualReviewProcess: false,
        hasDecisionMatrix: false,
        hasProgressionCriteria: false,
        hasRiskAssessment: false
      };
    }

    const content = readFileSync(qualityPromptPath, 'utf-8');
    
    return {
      hasAutomatedChecks: this.hasSection(content, 'Automated Checks'),
      hasManualReviewProcess: this.hasSection(content, 'Manual Review Process'),
      hasDecisionMatrix: this.hasSection(content, 'Decision Matrix'),
      hasProgressionCriteria: content.includes('progression') && content.includes('criteria'),
      hasRiskAssessment: content.includes('risk') && content.includes('assessment')
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return sectionRegex.test(content) || content.includes(sectionName);
  }

  // Validate requirements 11.1, 11.2, 11.3, 11.4, 11.5
  validateRequirements(): {
    requirement_11_1: boolean; // Completeness checklist validation
    requirement_11_2: boolean; // Conflict resolution
    requirement_11_3: boolean; // Decision logging with rationale
    requirement_11_4: boolean; // Quality gate enforcement
    requirement_11_5: boolean; // Progression prevention until criteria met
  } {
    const capability = this.validateQualityAssuranceCapability();
    const gateStructure = this.validateQualityGateStructure();
    
    return {
      requirement_11_1: capability.hasCompletenessValidation && capability.hasValidationChecklists,
      requirement_11_2: capability.hasConflictResolution,
      requirement_11_3: gateStructure.hasDecisionMatrix && gateStructure.hasRiskAssessment,
      requirement_11_4: capability.hasQualityGateEnforcement && gateStructure.hasAutomatedChecks,
      requirement_11_5: gateStructure.hasProgressionCriteria && capability.hasQualityGateEnforcement
    };
  }
}