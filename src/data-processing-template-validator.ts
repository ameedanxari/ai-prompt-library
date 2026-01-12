import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DataIngestionTemplateStructure {
  hasDataIngestionTemplate: boolean;
  hasDataTransformationTemplate: boolean;
  hasDataQualityTemplate: boolean;
  hasDataGovernanceTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface BigDataPipelineTemplateStructure {
  hasBigDataProcessingTemplate: boolean;
  hasDataPipelinesTemplate: boolean;
  hasDataSecurityTemplate: boolean;
  hasScalableArchitecturesTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface DataProcessingTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasTestingConsiderations: boolean;
  hasSecurityConsiderations: boolean;
  hasCodeExamples: boolean;
  hasDataModels: boolean;
}


export class DataProcessingTemplateValidator {
  private dataProcessingModulePath: string;

  constructor(dataProcessingModulePath: string = 'prompts/modules/data-processing') {
    this.dataProcessingModulePath = dataProcessingModulePath;
  }

  validateDataIngestionTemplates(): DataIngestionTemplateStructure {
    const ingestionTemplates = [
      'data-ingestion.md',
      'data-transformation.md',
      'data-quality.md',
      'data-governance.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.dataProcessingModulePath, filename));

    const hasDataIngestionTemplate = templateExists('data-ingestion.md');
    const hasDataTransformationTemplate = templateExists('data-transformation.md');
    const hasDataQualityTemplate = templateExists('data-quality.md');
    const hasDataGovernanceTemplate = templateExists('data-governance.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of ingestionTemplates) {
      const templatePath = join(this.dataProcessingModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasDataIngestionTemplate,
      hasDataTransformationTemplate,
      hasDataQualityTemplate,
      hasDataGovernanceTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateBigDataPipelineTemplates(): BigDataPipelineTemplateStructure {
    const pipelineTemplates = [
      'big-data-processing.md',
      'data-pipelines.md',
      'data-security.md',
      'scalable-architectures.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.dataProcessingModulePath, filename));

    const hasBigDataProcessingTemplate = templateExists('big-data-processing.md');
    const hasDataPipelinesTemplate = templateExists('data-pipelines.md');
    const hasDataSecurityTemplate = templateExists('data-security.md');
    const hasScalableArchitecturesTemplate = templateExists('scalable-architectures.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of pipelineTemplates) {
      const templatePath = join(this.dataProcessingModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasBigDataProcessingTemplate,
      hasDataPipelinesTemplate,
      hasDataSecurityTemplate,
      hasScalableArchitecturesTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }


  validateTemplateContent(templatePath: string): DataProcessingTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');

    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') ||
        this.hasSection(content, 'Implementation') ||
        this.hasSection(content, 'Core.*Patterns'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Variables') ||
        this.hasCodeExamples(content),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
        this.hasSection(content, 'Integration'),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations') ||
        this.hasSection(content, 'Testing'),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content),
      hasCodeExamples: this.hasCodeExamples(content),
      hasDataModels: this.hasDataModels(content)
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName}`, 'i');
    return sectionRegex.test(content);
  }

  private hasCodeExamples(content: string): boolean {
    const codeBlockRegex = /```[\s\S]*?```/;
    const interfaceRegex = /interface\s+\w+/;
    const classRegex = /class\s+\w+/;
    const functionRegex = /function\s+\w+|async\s+function\s+\w+/;

    return codeBlockRegex.test(content) ||
      interfaceRegex.test(content) ||
      classRegex.test(content) ||
      functionRegex.test(content);
  }

  private hasSecurityConsiderations(content: string): boolean {
    const securityKeywords = [
      'security', 'encryption', 'authentication', 'authorization',
      'token', 'secure', 'access control', 'privacy',
      'threat', 'vulnerability', 'protection', 'credential'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasDataModels(content: string): boolean {
    const dataModelPatterns = [
      /interface\s+\w+/g,
      /class\s+\w+/g,
      /enum\s+\w+/g,
      /type\s+\w+\s*=/g
    ];

    return dataModelPatterns.some(pattern => pattern.test(content));
  }

  private getEmptyTemplateContent(): DataProcessingTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasTestingConsiderations: false,
      hasSecurityConsiderations: false,
      hasCodeExamples: false,
      hasDataModels: false
    };
  }

  // Validate requirements 17.1, 17.2, 17.4, 17.6 for data ingestion templates
  validateDataIngestionRequirements(): {
    requirement_17_1: boolean; // Data ingestion (batch, stream, real-time, validation)
    requirement_17_2: boolean; // Data transformation (cleaning, normalization, enrichment, conversion)
    requirement_17_4: boolean; // Data quality (profiling, monitoring, anomaly detection, lineage)
    requirement_17_6: boolean; // Data governance (catalogs, metadata, access controls, compliance)
  } {
    const structure = this.validateDataIngestionTemplates();

    // Requirement 17.1: Data ingestion
    const requirement_17_1 = structure.hasDataIngestionTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 17.2: Data transformation
    const requirement_17_2 = structure.hasDataTransformationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 17.4: Data quality
    const requirement_17_4 = structure.hasDataQualityTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 17.6: Data governance
    const requirement_17_6 = structure.hasDataGovernanceTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_17_1,
      requirement_17_2,
      requirement_17_4,
      requirement_17_6
    };
  }

  // Validate requirements 17.7, 17.8, 17.9, 17.10 for big data pipeline templates
  validateBigDataPipelineRequirements(): {
    requirement_17_7: boolean; // Data processing (parallel, distributed, scheduling, error handling)
    requirement_17_8: boolean; // Data monitoring (pipeline monitoring, metrics, alerting, troubleshooting)
    requirement_17_9: boolean; // Data security (encryption, logging, masking, secure transfers)
    requirement_17_10: boolean; // Big data (scalable architectures, optimization, cost management, resources)
  } {
    const structure = this.validateBigDataPipelineTemplates();

    // Requirement 17.7: Data processing
    const requirement_17_7 = structure.hasBigDataProcessingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 17.8: Data monitoring
    const requirement_17_8 = structure.hasDataPipelinesTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 17.9: Data security
    const requirement_17_9 = structure.hasDataSecurityTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 17.10: Big data scalability
    const requirement_17_10 = structure.hasScalableArchitecturesTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_17_7,
      requirement_17_8,
      requirement_17_9,
      requirement_17_10
    };
  }


  // Validate data processing feature coverage
  validateDataProcessingFeatureCoverage(): {
    hasBatchProcessing: boolean;
    hasStreamProcessing: boolean;
    hasDataValidation: boolean;
    hasDataCleaning: boolean;
    hasDataNormalization: boolean;
    hasDataEnrichment: boolean;
    hasDataProfiling: boolean;
    hasAnomalyDetection: boolean;
    hasDataLineage: boolean;
    hasDataCatalog: boolean;
    hasMetadataManagement: boolean;
    hasAccessControl: boolean;
  } {
    const ingestionPath = join(this.dataProcessingModulePath, 'data-ingestion.md');
    const transformationPath = join(this.dataProcessingModulePath, 'data-transformation.md');
    const qualityPath = join(this.dataProcessingModulePath, 'data-quality.md');
    const governancePath = join(this.dataProcessingModulePath, 'data-governance.md');

    let hasBatchProcessing = false;
    let hasStreamProcessing = false;
    let hasDataValidation = false;
    let hasDataCleaning = false;
    let hasDataNormalization = false;
    let hasDataEnrichment = false;
    let hasDataProfiling = false;
    let hasAnomalyDetection = false;
    let hasDataLineage = false;
    let hasDataCatalog = false;
    let hasMetadataManagement = false;
    let hasAccessControl = false;

    if (existsSync(ingestionPath)) {
      const content = readFileSync(ingestionPath, 'utf-8').toLowerCase();
      hasBatchProcessing = content.includes('batch') && content.includes('processing');
      hasStreamProcessing = content.includes('stream') && content.includes('processing');
      hasDataValidation = content.includes('validation') && content.includes('rule');
    }

    if (existsSync(transformationPath)) {
      const content = readFileSync(transformationPath, 'utf-8').toLowerCase();
      hasDataCleaning = content.includes('cleaning') || content.includes('clean');
      hasDataNormalization = content.includes('normalization') || content.includes('normalize');
      hasDataEnrichment = content.includes('enrichment') || content.includes('enrich');
    }

    if (existsSync(qualityPath)) {
      const content = readFileSync(qualityPath, 'utf-8').toLowerCase();
      hasDataProfiling = content.includes('profiling') || content.includes('profile');
      hasAnomalyDetection = content.includes('anomaly') && content.includes('detection');
      hasDataLineage = content.includes('lineage');
    }

    if (existsSync(governancePath)) {
      const content = readFileSync(governancePath, 'utf-8').toLowerCase();
      hasDataCatalog = content.includes('catalog');
      hasMetadataManagement = content.includes('metadata') && content.includes('management');
      hasAccessControl = content.includes('access') && content.includes('control');
    }

    return {
      hasBatchProcessing,
      hasStreamProcessing,
      hasDataValidation,
      hasDataCleaning,
      hasDataNormalization,
      hasDataEnrichment,
      hasDataProfiling,
      hasAnomalyDetection,
      hasDataLineage,
      hasDataCatalog,
      hasMetadataManagement,
      hasAccessControl
    };
  }
}
