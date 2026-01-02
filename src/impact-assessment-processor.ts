import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ImpactAssessmentCapability {
  hasDependencyMapping: boolean;
  hasChangeValidation: boolean;
  hasPrincipleAlignment: boolean;
  hasRegressionTestGeneration: boolean;
  hasVisionDocument: boolean;
  hasRollbackProcedures: boolean;
  hasCrossPlatformValidation: boolean;
  hasChangeRationale: boolean;
}

export interface DependencyMapStructure {
  hasTemplateDependencies: boolean;
  hasCrossPlatformTracking: boolean;
  hasAutomatedDiscovery: boolean;
  hasDependencyMaintenance: boolean;
  hasOutputFormats: boolean;
}

export interface ChangeAssessmentStructure {
  hasImpactChecklist: boolean;
  hasPrincipleValidation: boolean;
  hasRegressionTests: boolean;
  hasValidationWorkflow: boolean;
  hasChangeDocumentation: boolean;
}

export interface VisionDocumentStructure {
  hasMissionStatement: boolean;
  hasGuidingPrinciples: boolean;
  hasQualityStandards: boolean;
  hasChangeRationale: boolean;
  hasRollbackProcedures: boolean;
  hasCrossPlatformValidation: boolean;
}

export class ImpactAssessmentProcessor {
  private promptsPath: string;

  constructor(promptsPath: string = 'prompts/templates') {
    this.promptsPath = promptsPath;
  }

  validateImpactAssessmentCapability(): ImpactAssessmentCapability {
    return {
      hasDependencyMapping: this.hasDependencyMappingCapability(),
      hasChangeValidation: this.hasChangeValidationCapability(),
      hasPrincipleAlignment: this.hasPrincipleAlignmentCapability(),
      hasRegressionTestGeneration: this.hasRegressionTestGenerationCapability(),
      hasVisionDocument: this.hasVisionDocumentCapability(),
      hasRollbackProcedures: this.hasRollbackProceduresCapability(),
      hasCrossPlatformValidation: this.hasCrossPlatformValidationCapability(),
      hasChangeRationale: this.hasChangeRationaleCapability()
    };
  }

  private hasDependencyMappingCapability(): boolean {
    const dependencyMapPath = join(this.promptsPath, 'library-dependency-map.md');
    if (!existsSync(dependencyMapPath)) return false;
    
    const content = readFileSync(dependencyMapPath, 'utf-8');
    
    // Check for dependency mapping capabilities
    const mappingFeatures = [
      'Template Dependency',
      'Cross-Platform',
      'Automated Dependency Discovery',
      'Dependency Maintenance',
      'relationship'
    ];
    
    return mappingFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasChangeValidationCapability(): boolean {
    const changeAssessmentPath = join(this.promptsPath, 'library-change-assessment.md');
    if (!existsSync(changeAssessmentPath)) return false;
    
    const content = readFileSync(changeAssessmentPath, 'utf-8');
    
    // Check for change validation capabilities
    const validationFeatures = [
      'Impact Assessment',
      'Change Assessment Checklist',
      'Risk',
      'Validation',
      'Approval'
    ];
    
    return validationFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasPrincipleAlignmentCapability(): boolean {
    const changeAssessmentPath = join(this.promptsPath, 'library-change-assessment.md');
    if (!existsSync(changeAssessmentPath)) return false;
    
    const content = readFileSync(changeAssessmentPath, 'utf-8');
    
    // Check for principle alignment validation
    const principleFeatures = [
      'Core Principles Alignment',
      'Modular',
      'Composable',
      'Production-Ready',
      'Bite-sized'
    ];
    
    return principleFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasRegressionTestGenerationCapability(): boolean {
    const changeAssessmentPath = join(this.promptsPath, 'library-change-assessment.md');
    if (!existsSync(changeAssessmentPath)) return false;
    
    const content = readFileSync(changeAssessmentPath, 'utf-8');
    
    // Check for regression test generation
    const testFeatures = [
      'Regression Test',
      'Test Specification',
      'Cross-Platform Regression',
      'Test Execution',
      'Success Criteria'
    ];
    
    return testFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasVisionDocumentCapability(): boolean {
    const visionPath = join(this.promptsPath, 'library-vision-document.md');
    if (!existsSync(visionPath)) return false;
    
    const content = readFileSync(visionPath, 'utf-8');
    
    // Check for vision document capabilities
    const visionFeatures = [
      'Mission',
      'Vision',
      'Guiding Principles',
      'Quality Standards',
      'Objectives'
    ];
    
    return visionFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasRollbackProceduresCapability(): boolean {
    const visionPath = join(this.promptsPath, 'library-vision-document.md');
    if (!existsSync(visionPath)) return false;
    
    const content = readFileSync(visionPath, 'utf-8');
    
    // Check for rollback procedures - require core rollback features
    const requiredFeatures = [
      'Rollback',
      'Backup',
      'Restore'
    ];
    
    // Optional features that enhance rollback capability
    const optionalFeatures = [
      'Revert',
      'Recovery'
    ];
    
    const hasRequired = requiredFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
    
    const hasAtLeastOneOptional = optionalFeatures.some(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
    
    return hasRequired && hasAtLeastOneOptional;
  }

  private hasCrossPlatformValidationCapability(): boolean {
    const visionPath = join(this.promptsPath, 'library-vision-document.md');
    if (!existsSync(visionPath)) return false;
    
    const content = readFileSync(visionPath, 'utf-8');
    
    // Check for cross-platform validation
    const platformFeatures = [
      'Cross-Platform Consistency',
      'Platform Coverage',
      'Feature Parity',
      'Web',
      'Mobile'
    ];
    
    return platformFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasChangeRationaleCapability(): boolean {
    const visionPath = join(this.promptsPath, 'library-vision-document.md');
    if (!existsSync(visionPath)) return false;
    
    const content = readFileSync(visionPath, 'utf-8');
    
    // Check for change rationale documentation
    const rationaleFeatures = [
      'Change Rationale',
      'Rationale',
      'Alternatives Considered',
      'Expected Benefits',
      'Risk Assessment'
    ];
    
    return rationaleFeatures.every(feature => 
      content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  validateDependencyMapStructure(mapPath: string): DependencyMapStructure {
    if (!existsSync(mapPath)) {
      return {
        hasTemplateDependencies: false,
        hasCrossPlatformTracking: false,
        hasAutomatedDiscovery: false,
        hasDependencyMaintenance: false,
        hasOutputFormats: false
      };
    }

    const content = readFileSync(mapPath, 'utf-8');
    
    return {
      hasTemplateDependencies: this.hasSection(content, 'Template Dependency'),
      hasCrossPlatformTracking: this.hasSection(content, 'Cross-Platform'),
      hasAutomatedDiscovery: this.hasSection(content, 'Automated Dependency Discovery'),
      hasDependencyMaintenance: this.hasSection(content, 'Dependency Maintenance'),
      hasOutputFormats: this.hasSection(content, 'Output Formats')
    };
  }

  validateChangeAssessmentStructure(assessmentPath: string): ChangeAssessmentStructure {
    if (!existsSync(assessmentPath)) {
      return {
        hasImpactChecklist: false,
        hasPrincipleValidation: false,
        hasRegressionTests: false,
        hasValidationWorkflow: false,
        hasChangeDocumentation: false
      };
    }

    const content = readFileSync(assessmentPath, 'utf-8');
    
    return {
      hasImpactChecklist: this.hasSection(content, 'Impact Assessment') || this.hasSection(content, 'Assessment Checklist'),
      hasPrincipleValidation: this.hasSection(content, 'Core Principles Alignment'),
      hasRegressionTests: this.hasSection(content, 'Regression Test'),
      hasValidationWorkflow: this.hasSection(content, 'Change Validation Workflow'),
      hasChangeDocumentation: this.hasSection(content, 'Change Documentation') || this.hasSection(content, 'Change Record')
    };
  }

  validateVisionDocumentStructure(visionPath: string): VisionDocumentStructure {
    if (!existsSync(visionPath)) {
      return {
        hasMissionStatement: false,
        hasGuidingPrinciples: false,
        hasQualityStandards: false,
        hasChangeRationale: false,
        hasRollbackProcedures: false,
        hasCrossPlatformValidation: false
      };
    }

    const content = readFileSync(visionPath, 'utf-8');
    
    return {
      hasMissionStatement: this.hasSection(content, 'Mission Statement') || content.toLowerCase().includes('core mission'),
      hasGuidingPrinciples: this.hasSection(content, 'Guiding Principles'),
      hasQualityStandards: this.hasSection(content, 'Quality Standards'),
      hasChangeRationale: this.hasSection(content, 'Change Rationale'),
      hasRollbackProcedures: this.hasSection(content, 'Rollback'),
      hasCrossPlatformValidation: this.hasSection(content, 'Cross-Platform Consistency')
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    // Check for section header or content containing the term
    const sectionRegex = new RegExp(`(##|###)\\s*.*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return sectionRegex.test(content) || content.toLowerCase().includes(sectionName.toLowerCase());
  }

  // Validate requirements 21.1 through 21.10
  validateRequirements(): {
    requirement_21_1: boolean; // Impact assessment checklist before changes
    requirement_21_2: boolean; // Dependency map showing relationships
    requirement_21_3: boolean; // Identify all affected components
    requirement_21_4: boolean; // Validate changes align with core principles
    requirement_21_5: boolean; // Generate regression test specifications
    requirement_21_6: boolean; // Maintain library vision document
    requirement_21_7: boolean; // Document rationale and expected benefits
    requirement_21_8: boolean; // Specify rollback procedures
    requirement_21_9: boolean; // Ensure cross-platform consistency validation
    requirement_21_10: boolean; // Update related documentation
  } {
    const capability = this.validateImpactAssessmentCapability();
    
    return {
      requirement_21_1: capability.hasChangeValidation,
      requirement_21_2: capability.hasDependencyMapping,
      requirement_21_3: capability.hasDependencyMapping && capability.hasChangeValidation,
      requirement_21_4: capability.hasPrincipleAlignment,
      requirement_21_5: capability.hasRegressionTestGeneration,
      requirement_21_6: capability.hasVisionDocument,
      requirement_21_7: capability.hasChangeRationale,
      requirement_21_8: capability.hasRollbackProcedures,
      requirement_21_9: capability.hasCrossPlatformValidation,
      requirement_21_10: capability.hasChangeValidation && capability.hasVisionDocument
    };
  }
}
