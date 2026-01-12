import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TemplateCompositionStructure {
  hasTitle: boolean;
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasCoreComponents: boolean;
  hasImplementationPatterns: boolean;
  hasIntegrationPoints: boolean;
  hasTestingConsiderations: boolean;
  hasConfigurationExamples: boolean;
  hasRelatedTemplates: boolean;
  hasTypeScriptInterfaces: boolean;
  hasCodeExamples: boolean;
}

export interface CompositionSystemValidation {
  metadataTemplate: TemplateCompositionStructure;
  taggingTemplate: TemplateCompositionStructure;
  dependenciesTemplate: TemplateCompositionStructure;
  versioningTemplate: TemplateCompositionStructure;
  compositionRulesTemplate: TemplateCompositionStructure;
  validationTemplate: TemplateCompositionStructure;
  parameterValidationTemplate: TemplateCompositionStructure;
  optimizationTemplate: TemplateCompositionStructure;
  readmeExists: boolean;
  allTemplatesExist: boolean;
}

export class TemplateCompositionValidator {
  private basePath: string;
  private templateContents: Map<string, string> = new Map();

  constructor(basePath: string = 'prompts/modules/template-composition') {
    this.basePath = basePath;
    this.loadTemplates();
  }

  private loadTemplates(): void {
    const templates = [
      'template-metadata.md',
      'template-tagging.md',
      'template-dependencies.md',
      'template-versioning.md',
      'composition-rules.md',
      'template-validation.md',
      'parameter-validation.md',
      'composition-optimization.md',
      'README.md'
    ];

    for (const template of templates) {
      const fullPath = join(process.cwd(), this.basePath, template);
      if (existsSync(fullPath)) {
        this.templateContents.set(template, readFileSync(fullPath, 'utf-8'));
      }
    }
  }

  validateTemplateStructure(templateName: string): TemplateCompositionStructure {
    const content = this.templateContents.get(templateName) || '';
    
    return {
      hasTitle: this.hasTitle(content),
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasCoreComponents: this.hasSection(content, 'Core Components'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points'),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations'),
      hasConfigurationExamples: this.hasSection(content, 'Configuration'),
      hasRelatedTemplates: this.hasSection(content, 'Related Templates'),
      hasTypeScriptInterfaces: this.hasTypeScriptInterfaces(content),
      hasCodeExamples: this.hasCodeExamples(content)
    };
  }

  validateCompositionSystem(): CompositionSystemValidation {
    return {
      metadataTemplate: this.validateTemplateStructure('template-metadata.md'),
      taggingTemplate: this.validateTemplateStructure('template-tagging.md'),
      dependenciesTemplate: this.validateTemplateStructure('template-dependencies.md'),
      versioningTemplate: this.validateTemplateStructure('template-versioning.md'),
      compositionRulesTemplate: this.validateTemplateStructure('composition-rules.md'),
      validationTemplate: this.validateTemplateStructure('template-validation.md'),
      parameterValidationTemplate: this.validateTemplateStructure('parameter-validation.md'),
      optimizationTemplate: this.validateTemplateStructure('composition-optimization.md'),
      readmeExists: this.templateContents.has('README.md'),
      allTemplatesExist: this.allTemplatesExist()
    };
  }

  private hasTitle(content: string): boolean {
    return /^#\s+.+$/m.test(content);
  }

  private hasSection(content: string, sectionName: string): boolean {
    const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(`^##\\s+.*${escapedName}`, 'im');
    return sectionRegex.test(content);
  }

  private hasTypeScriptInterfaces(content: string): boolean {
    return /interface\s+\w+\s*\{/.test(content);
  }

  private hasCodeExamples(content: string): boolean {
    return /```(typescript|javascript|ts|js)[\s\S]*?```/.test(content);
  }

  private allTemplatesExist(): boolean {
    const requiredTemplates = [
      'template-metadata.md',
      'template-tagging.md',
      'template-dependencies.md',
      'template-versioning.md',
      'composition-rules.md',
      'template-validation.md',
      'parameter-validation.md',
      'composition-optimization.md'
    ];

    return requiredTemplates.every(t => this.templateContents.has(t));
  }

  validateMetadataCompleteness(): {
    hasMetadataSchema: boolean;
    hasMetadataManager: boolean;
    hasQueryInterface: boolean;
    hasIndexService: boolean;
  } {
    const content = this.templateContents.get('template-metadata.md') || '';
    
    return {
      hasMetadataSchema: content.includes('TemplateMetadata') && content.includes('interface'),
      hasMetadataManager: content.includes('MetadataManager') || content.includes('TemplateMetadataManager'),
      hasQueryInterface: content.includes('MetadataQuery') || content.includes('QueryBuilder'),
      hasIndexService: content.includes('MetadataIndex') || content.includes('IndexService')
    };
  }

  validateTaggingCompleteness(): {
    hasTagSchema: boolean;
    hasTagManager: boolean;
    hasTagHierarchy: boolean;
    hasConflictDetection: boolean;
  } {
    const content = this.templateContents.get('template-tagging.md') || '';
    
    return {
      hasTagSchema: content.includes('interface Tag') || content.includes('TagCategory'),
      hasTagManager: content.includes('TagManager') || content.includes('TemplateTagManager'),
      hasTagHierarchy: content.includes('TagHierarchy') || content.includes('parent'),
      hasConflictDetection: content.includes('ConflictDetect') || content.includes('detectConflict')
    };
  }

  validateDependencyCompleteness(): {
    hasDependencySchema: boolean;
    hasDependencyManager: boolean;
    hasCircularDetection: boolean;
    hasVersionConstraints: boolean;
  } {
    const content = this.templateContents.get('template-dependencies.md') || '';
    
    return {
      hasDependencySchema: content.includes('TemplateDependency') || content.includes('DependencyType'),
      hasDependencyManager: content.includes('DependencyManager') || content.includes('TemplateDependencyManager'),
      hasCircularDetection: content.includes('circular') || content.includes('Circular'),
      hasVersionConstraints: content.includes('VersionConstraint') || content.includes('ConstraintType')
    };
  }

  validateCompositionRulesCompleteness(): {
    hasRuleSchema: boolean;
    hasRulesEngine: boolean;
    hasConflictResolution: boolean;
    hasPredefinedRules: boolean;
  } {
    const content = this.templateContents.get('composition-rules.md') || '';
    
    return {
      hasRuleSchema: content.includes('CompositionRule') || content.includes('RuleType'),
      hasRulesEngine: content.includes('RulesEngine') || content.includes('CompositionRulesEngine'),
      hasConflictResolution: content.includes('ConflictResolution') || content.includes('resolveConflict'),
      hasPredefinedRules: content.includes('PREDEFINED_RULES') || content.includes('initializeDefaultRules')
    };
  }

  validateValidationCompleteness(): {
    hasValidationSchema: boolean;
    hasValidator: boolean;
    hasQualityMetrics: boolean;
    hasCompletenessChecker: boolean;
  } {
    const content = this.templateContents.get('template-validation.md') || '';
    
    return {
      hasValidationSchema: content.includes('ValidationResult') || content.includes('ValidationError'),
      hasValidator: content.includes('TemplateValidator') || content.includes('MarkdownTemplateValidator'),
      hasQualityMetrics: content.includes('QualityMetrics') || content.includes('calculateMetrics'),
      hasCompletenessChecker: content.includes('CompletenessChecker') || content.includes('checkCompleteness')
    };
  }

  validateOptimizationCompleteness(): {
    hasOptimizationSchema: boolean;
    hasOptimizer: boolean;
    hasRedundancyElimination: boolean;
    hasRelevanceScoring: boolean;
  } {
    const content = this.templateContents.get('composition-optimization.md') || '';
    
    return {
      hasOptimizationSchema: content.includes('OptimizationResult') || content.includes('OptimizationMetrics'),
      hasOptimizer: content.includes('CompositionOptimizer') || content.includes('TemplateCompositionOptimizer'),
      hasRedundancyElimination: content.includes('eliminateRedundancy') || content.includes('Redundancy'),
      hasRelevanceScoring: content.includes('RelevanceScores') || content.includes('calculateRelevanceScores')
    };
  }
}
