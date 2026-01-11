import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface UserAnalyticsTemplateStructure {
  hasUserAnalyticsTemplate: boolean;
  hasCohortAnalysisTemplate: boolean;
  hasABTestingTemplate: boolean;
  hasPrivacyAnalyticsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface BusinessIntelligenceTemplateStructure {
  hasBusinessMetricsTemplate: boolean;
  hasPredictiveAnalyticsTemplate: boolean;
  hasCustomReportingTemplate: boolean;
  hasRealTimeAnalyticsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface AnalyticsTemplateContent {
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

export class AnalyticsTemplateValidator {
  private analyticsModulePath: string;

  constructor(analyticsModulePath: string = 'prompts/modules/analytics') {
    this.analyticsModulePath = analyticsModulePath;
  }

  validateUserAnalyticsTemplates(): UserAnalyticsTemplateStructure {
    const userAnalyticsTemplates = [
      'user-analytics.md',
      'cohort-analysis.md',
      'ab-testing.md',
      'privacy-analytics.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.analyticsModulePath, filename));

    const hasUserAnalyticsTemplate = templateExists('user-analytics.md');
    const hasCohortAnalysisTemplate = templateExists('cohort-analysis.md');
    const hasABTestingTemplate = templateExists('ab-testing.md');
    const hasPrivacyAnalyticsTemplate = templateExists('privacy-analytics.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of userAnalyticsTemplates) {
      const templatePath = join(this.analyticsModulePath, template);
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
      hasUserAnalyticsTemplate,
      hasCohortAnalysisTemplate,
      hasABTestingTemplate,
      hasPrivacyAnalyticsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateBusinessIntelligenceTemplates(): BusinessIntelligenceTemplateStructure {
    const businessIntelligenceTemplates = [
      'business-metrics.md',
      'predictive-analytics.md',
      'custom-reporting.md',
      'real-time-analytics.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.analyticsModulePath, filename));

    const hasBusinessMetricsTemplate = templateExists('business-metrics.md');
    const hasPredictiveAnalyticsTemplate = templateExists('predictive-analytics.md');
    const hasCustomReportingTemplate = templateExists('custom-reporting.md');
    const hasRealTimeAnalyticsTemplate = templateExists('real-time-analytics.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of businessIntelligenceTemplates) {
      const templatePath = join(this.analyticsModulePath, template);
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
      hasBusinessMetricsTemplate,
      hasPredictiveAnalyticsTemplate,
      hasCustomReportingTemplate,
      hasRealTimeAnalyticsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): AnalyticsTemplateContent {
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
        this.hasSection(content, 'Variables'),
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
      'sanitization', 'validation', 'access control', 'privacy',
      'anonymization', 'consent', 'gdpr', 'ccpa'
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

  private getEmptyTemplateContent(): AnalyticsTemplateContent {
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

  // Validate requirements 11.1, 11.5, 11.7 for user analytics and tracking
  validateUserAnalyticsRequirements(): {
    requirement_11_1: boolean; // User behavior tracking and funnel analysis
    requirement_11_5: boolean; // A/B testing and experiment design
    requirement_11_7: boolean; // Privacy-compliant analytics and consent management
  } {
    const structure = this.validateUserAnalyticsTemplates();

    // Requirement 11.1: User behavior tracking and funnel analysis
    const requirement_11_1 = structure.hasUserAnalyticsTemplate &&
      structure.hasCohortAnalysisTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 11.5: A/B testing and experiment design
    const requirement_11_5 = structure.hasABTestingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 11.7: Privacy-compliant analytics and consent management
    const requirement_11_7 = structure.hasPrivacyAnalyticsTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_11_1,
      requirement_11_5,
      requirement_11_7
    };
  }

  // Validate requirements 11.2, 11.3, 11.4, 11.9 for business intelligence
  validateBusinessIntelligenceRequirements(): {
    requirement_11_2: boolean; // Business metrics and KPI dashboards
    requirement_11_3: boolean; // Real-time analytics and instant alerts
    requirement_11_4: boolean; // Custom reporting and data visualization
    requirement_11_9: boolean; // Predictive analytics and machine learning
  } {
    const structure = this.validateBusinessIntelligenceTemplates();

    // Requirement 11.2: Business metrics and KPI dashboards
    const requirement_11_2 = structure.hasBusinessMetricsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 11.3: Real-time analytics and instant alerts
    const requirement_11_3 = structure.hasRealTimeAnalyticsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 11.4: Custom reporting and data visualization
    const requirement_11_4 = structure.hasCustomReportingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 11.9: Predictive analytics and machine learning
    const requirement_11_9 = structure.hasPredictiveAnalyticsTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_11_2,
      requirement_11_3,
      requirement_11_4,
      requirement_11_9
    };
  }

  // Validate analytics feature coverage
  validateAnalyticsFeatureCoverage(): {
    hasBehaviorTracking: boolean;
    hasFunnelAnalysis: boolean;
    hasCohortAnalysis: boolean;
    hasABTesting: boolean;
    hasPrivacyCompliance: boolean;
    hasBusinessMetrics: boolean;
    hasPredictiveModels: boolean;
    hasRealTimeProcessing: boolean;
    hasCustomReporting: boolean;
  } {
    const userAnalyticsPath = join(this.analyticsModulePath, 'user-analytics.md');
    const cohortAnalysisPath = join(this.analyticsModulePath, 'cohort-analysis.md');
    const abTestingPath = join(this.analyticsModulePath, 'ab-testing.md');
    const privacyAnalyticsPath = join(this.analyticsModulePath, 'privacy-analytics.md');
    const businessMetricsPath = join(this.analyticsModulePath, 'business-metrics.md');
    const predictiveAnalyticsPath = join(this.analyticsModulePath, 'predictive-analytics.md');
    const realTimeAnalyticsPath = join(this.analyticsModulePath, 'real-time-analytics.md');
    const customReportingPath = join(this.analyticsModulePath, 'custom-reporting.md');

    let hasBehaviorTracking = false;
    let hasFunnelAnalysis = false;
    let hasCohortAnalysis = false;
    let hasABTesting = false;
    let hasPrivacyCompliance = false;
    let hasBusinessMetrics = false;
    let hasPredictiveModels = false;
    let hasRealTimeProcessing = false;
    let hasCustomReporting = false;

    if (existsSync(userAnalyticsPath)) {
      const content = readFileSync(userAnalyticsPath, 'utf-8').toLowerCase();
      hasBehaviorTracking = content.includes('behavior') && content.includes('track');
      hasFunnelAnalysis = content.includes('funnel') && content.includes('analysis');
    }

    if (existsSync(cohortAnalysisPath)) {
      const content = readFileSync(cohortAnalysisPath, 'utf-8').toLowerCase();
      hasCohortAnalysis = content.includes('cohort') && content.includes('retention');
    }

    if (existsSync(abTestingPath)) {
      const content = readFileSync(abTestingPath, 'utf-8').toLowerCase();
      hasABTesting = content.includes('a/b') || (content.includes('experiment') && content.includes('test'));
    }

    if (existsSync(privacyAnalyticsPath)) {
      const content = readFileSync(privacyAnalyticsPath, 'utf-8').toLowerCase();
      hasPrivacyCompliance = content.includes('privacy') && (content.includes('gdpr') || content.includes('consent'));
    }

    if (existsSync(businessMetricsPath)) {
      const content = readFileSync(businessMetricsPath, 'utf-8').toLowerCase();
      hasBusinessMetrics = content.includes('business') && (content.includes('metric') || content.includes('kpi'));
    }

    if (existsSync(predictiveAnalyticsPath)) {
      const content = readFileSync(predictiveAnalyticsPath, 'utf-8').toLowerCase();
      hasPredictiveModels = content.includes('predictive') || (content.includes('machine') && content.includes('learning'));
    }

    if (existsSync(realTimeAnalyticsPath)) {
      const content = readFileSync(realTimeAnalyticsPath, 'utf-8').toLowerCase();
      hasRealTimeProcessing = content.includes('real') && content.includes('time');
    }

    if (existsSync(customReportingPath)) {
      const content = readFileSync(customReportingPath, 'utf-8').toLowerCase();
      hasCustomReporting = content.includes('report') && (content.includes('custom') || content.includes('visualization'));
    }

    return {
      hasBehaviorTracking,
      hasFunnelAnalysis,
      hasCohortAnalysis,
      hasABTesting,
      hasPrivacyCompliance,
      hasBusinessMetrics,
      hasPredictiveModels,
      hasRealTimeProcessing,
      hasCustomReporting
    };
  }
}