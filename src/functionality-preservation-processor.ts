import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface FunctionalityPreservationCapability {
  hasPreFixAssessment: boolean;
  hasFixImplementationGuidelines: boolean;
  hasRegressionPrevention: boolean;
  hasIncrementalImprovement: boolean;
  hasFixRejectionCriteria: boolean;
}

export interface PreservationFrameworkStructure {
  hasPreFixAssessment: boolean;
  hasFixImplementationGuidelines: boolean;
  hasTestingStrategy: boolean;
  hasRegressionPrevention: boolean;
  hasFixRejectionCriteria: boolean;
  hasIncrementalImprovement: boolean;
  hasDocumentationFramework: boolean;
}

export class FunctionalityPreservationProcessor {
  private promptsPath: string;

  constructor(promptsPath: string = 'prompts/templates') {
    this.promptsPath = promptsPath;
  }

  validateFunctionalityPreservationCapability(): FunctionalityPreservationCapability {
    return {
      hasPreFixAssessment: this.hasPreFixAssessmentCapability(),
      hasFixImplementationGuidelines: this.hasFixImplementationGuidelinesCapability(),
      hasRegressionPrevention: this.hasRegressionPreventionCapability(),
      hasIncrementalImprovement: this.hasIncrementalImprovementCapability(),
      hasFixRejectionCriteria: this.hasFixRejectionCriteriaCapability()
    };
  }

  private hasPreFixAssessmentCapability(): boolean {
    const functionalityPath = join(this.promptsPath, 'functionality-preservation.md');
    if (!existsSync(functionalityPath)) return false;
    
    const content = readFileSync(functionalityPath, 'utf-8');
    
    // Check for pre-fix assessment capabilities
    const assessmentFeatures = [
      'Pre-Fix Functionality Assessment',
      'Current Functionality Inventory',
      'Existing Functionality Checklist',
      'Functionality Dependencies',
      'Risk Assessment'
    ];
    
    return assessmentFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasFixImplementationGuidelinesCapability(): boolean {
    const functionalityPath = join(this.promptsPath, 'functionality-preservation.md');
    if (!existsSync(functionalityPath)) return false;
    
    const content = readFileSync(functionalityPath, 'utf-8');
    
    // Check for fix implementation guidelines
    const guidelineFeatures = [
      'Fix Implementation Guidelines',
      'Additive Changes Only',
      'Prohibited Changes',
      'Backward Compatibility Checklist',
      'Migration Strategy'
    ];
    
    return guidelineFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasRegressionPreventionCapability(): boolean {
    const functionalityPath = join(this.promptsPath, 'functionality-preservation.md');
    if (!existsSync(functionalityPath)) return false;
    
    const content = readFileSync(functionalityPath, 'utf-8');
    
    // Check for regression prevention framework
    const regressionFeatures = [
      'Regression Prevention Framework',
      'Automated Regression Detection',
      'Functionality Regression Checklist',
      'regression test',
      'baseline'
    ];
    
    return regressionFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasIncrementalImprovementCapability(): boolean {
    const functionalityPath = join(this.promptsPath, 'functionality-preservation.md');
    if (!existsSync(functionalityPath)) return false;
    
    const content = readFileSync(functionalityPath, 'utf-8');
    
    // Check for incremental improvement framework
    const improvementFeatures = [
      'Incremental Improvement Framework',
      'Additive Enhancement Approach',
      'Enhancement Validation',
      'Rollback Capability',
      'feature flags'
    ];
    
    return improvementFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasFixRejectionCriteriaCapability(): boolean {
    const functionalityPath = join(this.promptsPath, 'functionality-preservation.md');
    if (!existsSync(functionalityPath)) return false;
    
    const content = readFileSync(functionalityPath, 'utf-8');
    
    // Check for fix rejection criteria
    const rejectionFeatures = [
      'Fix Rejection Framework',
      'Automatic Rejection Criteria',
      'Functionality Reduction',
      'API Breaking Changes',
      'Manual Review Required'
    ];
    
    return rejectionFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  validatePreservationFrameworkStructure(frameworkPath: string): PreservationFrameworkStructure {
    if (!existsSync(frameworkPath)) {
      return {
        hasPreFixAssessment: false,
        hasFixImplementationGuidelines: false,
        hasTestingStrategy: false,
        hasRegressionPrevention: false,
        hasFixRejectionCriteria: false,
        hasIncrementalImprovement: false,
        hasDocumentationFramework: false
      };
    }

    const content = readFileSync(frameworkPath, 'utf-8');
    
    return {
      hasPreFixAssessment: this.hasSection(content, 'Pre-Fix Functionality Assessment'),
      hasFixImplementationGuidelines: this.hasSection(content, 'Fix Implementation Guidelines'),
      hasTestingStrategy: this.hasSection(content, 'Testing Strategy for Functionality Preservation'),
      hasRegressionPrevention: this.hasSection(content, 'Regression Prevention Framework'),
      hasFixRejectionCriteria: this.hasSection(content, 'Fix Rejection Framework'),
      hasIncrementalImprovement: this.hasSection(content, 'Incremental Improvement Framework'),
      hasDocumentationFramework: this.hasSection(content, 'Documentation and Communication')
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return sectionRegex.test(content);
  }

  // Validate requirements 17.1, 17.2, 17.3, 17.4, 17.5
  validateRequirements(): {
    requirement_17_1: boolean; // Preserve all existing functionality during fixes
    requirement_17_2: boolean; // Reject fixes that reduce or remove functionality
    requirement_17_3: boolean; // Ensure all fixes are incremental and additive
    requirement_17_4: boolean; // Document rationale and get approval for functionality changes
    requirement_17_5: boolean; // Maintain functionality regression checklist
  } {
    const capability = this.validateFunctionalityPreservationCapability();
    
    return {
      requirement_17_1: capability.hasPreFixAssessment && capability.hasRegressionPrevention,
      requirement_17_2: capability.hasFixRejectionCriteria,
      requirement_17_3: capability.hasIncrementalImprovement && capability.hasFixImplementationGuidelines,
      requirement_17_4: capability.hasFixImplementationGuidelines && capability.hasFixRejectionCriteria,
      requirement_17_5: capability.hasRegressionPrevention
    };
  }
}