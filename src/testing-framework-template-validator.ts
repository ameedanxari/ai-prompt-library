import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TestingFrameworkTemplateStructure {
  hasTestAutomationTemplate: boolean;
  hasTestDataManagementTemplate: boolean;
  hasPerformanceTestingTemplate: boolean;
  hasSecurityTestingTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface QualityAssuranceTemplateStructure {
  hasQualityMetricsTemplate: boolean;
  hasTestManagementTemplate: boolean;
  hasCICDTestingTemplate: boolean;
  hasDomainTestingTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface TestingTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationExamples: boolean;
  hasIntegrationPoints: boolean;
  hasSecurityConsiderations: boolean;
  hasTestingConsiderations: boolean;
  hasCodeExamples: boolean;
  hasCoreComponents: boolean;
}


export class TestingFrameworkTemplateValidator {
  private testingModulePath: string;

  constructor(testingModulePath: string = 'prompts/modules/testing') {
    this.testingModulePath = testingModulePath;
  }

  validateTestingFrameworkTemplates(): TestingFrameworkTemplateStructure {
    const testingFrameworkTemplates = [
      'test-automation.md',
      'test-data-management.md',
      'performance-testing.md',
      'security-testing.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.testingModulePath, filename));

    const hasTestAutomationTemplate = templateExists('test-automation.md');
    const hasTestDataManagementTemplate = templateExists('test-data-management.md');
    const hasPerformanceTestingTemplate = templateExists('performance-testing.md');
    const hasSecurityTestingTemplate = templateExists('security-testing.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of testingFrameworkTemplates) {
      const templatePath = join(this.testingModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationExamples) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasTestAutomationTemplate,
      hasTestDataManagementTemplate,
      hasPerformanceTestingTemplate,
      hasSecurityTestingTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  validateQualityAssuranceTemplates(): QualityAssuranceTemplateStructure {
    const qualityAssuranceTemplates = [
      'quality-metrics.md',
      'test-management.md',
      'ci-cd-testing.md',
      'domain-testing.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.testingModulePath, filename));

    const hasQualityMetricsTemplate = templateExists('quality-metrics.md');
    const hasTestManagementTemplate = templateExists('test-management.md');
    const hasCICDTestingTemplate = templateExists('ci-cd-testing.md');
    const hasDomainTestingTemplate = templateExists('domain-testing.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of qualityAssuranceTemplates) {
      const templatePath = join(this.testingModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
          allTemplatesHaveRequiredSections = false;
        }

        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }

        if (!content.hasConfigurationExamples) {
          templatesHaveConfigurationExamples = false;
        }

        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }

        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasQualityMetricsTemplate,
      hasTestManagementTemplate,
      hasCICDTestingTemplate,
      hasDomainTestingTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }


  validateTemplateContent(templatePath: string): TestingTemplateContent {
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
      hasConfigurationExamples: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Config'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
        this.hasSection(content, 'Integration'),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations') ||
        this.hasSection(content, 'Testing'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasCoreComponents: this.hasSection(content, 'Core Components') ||
        this.hasSection(content, 'Components')
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
      'sanitization', 'validation', 'access control', 'vulnerability',
      'secure', 'protection', 'audit'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private getEmptyTemplateContent(): TestingTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationExamples: false,
      hasIntegrationPoints: false,
      hasSecurityConsiderations: false,
      hasTestingConsiderations: false,
      hasCodeExamples: false,
      hasCoreComponents: false
    };
  }

  // Validate requirements 18.1, 18.2, 18.3, 18.5 for testing framework
  validateTestingFrameworkRequirements(): {
    requirement_18_1: boolean; // Automated testing (unit, integration, e2e)
    requirement_18_2: boolean; // Test data management
    requirement_18_3: boolean; // API testing (contract, load, security)
    requirement_18_5: boolean; // Security testing
  } {
    const structure = this.validateTestingFrameworkTemplates();

    // Requirement 18.1: Automated testing (unit, integration, e2e, performance)
    const requirement_18_1 = structure.hasTestAutomationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 18.2: Test data management
    const requirement_18_2 = structure.hasTestDataManagementTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 18.3: API testing (includes performance testing)
    const requirement_18_3 = structure.hasPerformanceTestingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 18.5: Security testing
    const requirement_18_5 = structure.hasSecurityTestingTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_18_1,
      requirement_18_2,
      requirement_18_3,
      requirement_18_5
    };
  }

  // Validate requirements 18.7, 18.8, 18.9, 18.10 for quality assurance
  validateQualityAssuranceRequirements(): {
    requirement_18_7: boolean; // CI/CD integration
    requirement_18_8: boolean; // Quality metrics
    requirement_18_9: boolean; // Test management
    requirement_18_10: boolean; // Domain-specific testing
  } {
    const structure = this.validateQualityAssuranceTemplates();

    // Requirement 18.7: CI/CD integration
    const requirement_18_7 = structure.hasCICDTestingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 18.8: Quality metrics
    const requirement_18_8 = structure.hasQualityMetricsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 18.9: Test management
    const requirement_18_9 = structure.hasTestManagementTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 18.10: Domain-specific testing
    const requirement_18_10 = structure.hasDomainTestingTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_18_7,
      requirement_18_8,
      requirement_18_9,
      requirement_18_10
    };
  }

  // Validate testing feature coverage
  validateTestingFeatureCoverage(): {
    hasUnitTesting: boolean;
    hasIntegrationTesting: boolean;
    hasE2ETesting: boolean;
    hasPerformanceTesting: boolean;
    hasSecurityTesting: boolean;
    hasTestDataGeneration: boolean;
    hasDataMasking: boolean;
    hasLoadTesting: boolean;
    hasVulnerabilityScanning: boolean;
  } {
    const testAutomationPath = join(this.testingModulePath, 'test-automation.md');
    const testDataPath = join(this.testingModulePath, 'test-data-management.md');
    const performancePath = join(this.testingModulePath, 'performance-testing.md');
    const securityPath = join(this.testingModulePath, 'security-testing.md');

    let hasUnitTesting = false;
    let hasIntegrationTesting = false;
    let hasE2ETesting = false;
    let hasPerformanceTesting = false;
    let hasSecurityTesting = false;
    let hasTestDataGeneration = false;
    let hasDataMasking = false;
    let hasLoadTesting = false;
    let hasVulnerabilityScanning = false;

    if (existsSync(testAutomationPath)) {
      const content = readFileSync(testAutomationPath, 'utf-8').toLowerCase();
      hasUnitTesting = content.includes('unit') && content.includes('test');
      hasIntegrationTesting = content.includes('integration') && content.includes('test');
      hasE2ETesting = (content.includes('e2e') || content.includes('end-to-end')) && content.includes('test');
    }

    if (existsSync(testDataPath)) {
      const content = readFileSync(testDataPath, 'utf-8').toLowerCase();
      hasTestDataGeneration = content.includes('generat') && content.includes('data');
      hasDataMasking = content.includes('mask') && (content.includes('data') || content.includes('pii'));
    }

    if (existsSync(performancePath)) {
      const content = readFileSync(performancePath, 'utf-8').toLowerCase();
      hasPerformanceTesting = content.includes('performance') && content.includes('test');
      hasLoadTesting = content.includes('load') && content.includes('test');
    }

    if (existsSync(securityPath)) {
      const content = readFileSync(securityPath, 'utf-8').toLowerCase();
      hasSecurityTesting = content.includes('security') && content.includes('test');
      hasVulnerabilityScanning = content.includes('vulnerab') && content.includes('scan');
    }

    return {
      hasUnitTesting,
      hasIntegrationTesting,
      hasE2ETesting,
      hasPerformanceTesting,
      hasSecurityTesting,
      hasTestDataGeneration,
      hasDataMasking,
      hasLoadTesting,
      hasVulnerabilityScanning
    };
  }
}
