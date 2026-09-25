import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { TemplateValidator } from '../template-validator.js';

export interface ContentCreationTemplateStructure {
  hasContentCreationTemplate: boolean;
  hasContentOrganizationTemplate: boolean;
  hasContentVersioningTemplate: boolean;
  hasContentWorkflowTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface ContentModerationTemplateStructure {
  hasContentModerationTemplate: boolean;
  hasContentSecurityTemplate: boolean;
  hasContentComplianceTemplate: boolean;
  hasContentAnalyticsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface ContentTemplateContent {
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

export class ContentManagementTemplateValidator extends TemplateValidator {
  constructor(modulePath: string = 'prompts/modules/content-management') {
    super(modulePath);
  }

  validateContentCreationTemplates(): ContentCreationTemplateStructure {
    const creationTemplates = [
      'content-creation.md',
      'content-organization.md',
      'content-versioning.md',
      'content-workflow.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.moduleDir, filename));

    const hasContentCreationTemplate = templateExists('content-creation.md');
    const hasContentOrganizationTemplate = templateExists('content-organization.md');
    const hasContentVersioningTemplate = templateExists('content-versioning.md');
    const hasContentWorkflowTemplate = templateExists('content-workflow.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of creationTemplates) {
      const templatePath = join(this.moduleDir, template);
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
      hasContentCreationTemplate,
      hasContentOrganizationTemplate,
      hasContentVersioningTemplate,
      hasContentWorkflowTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }


  validateContentModerationTemplates(): ContentModerationTemplateStructure {
    const moderationTemplates = [
      'content-moderation.md',
      'content-security.md',
      'content-compliance.md',
      'content-analytics.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.moduleDir, filename));

    const hasContentModerationTemplate = templateExists('content-moderation.md');
    const hasContentSecurityTemplate = templateExists('content-security.md');
    const hasContentComplianceTemplate = templateExists('content-compliance.md');
    const hasContentAnalyticsTemplate = templateExists('content-analytics.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of moderationTemplates) {
      const templatePath = join(this.moduleDir, template);
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
      hasContentModerationTemplate,
      hasContentSecurityTemplate,
      hasContentComplianceTemplate,
      hasContentAnalyticsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): ContentTemplateContent {
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

  private hasSecurityConsiderations(content: string): boolean {
    const securityKeywords = [
      'security', 'encryption', 'authentication', 'authorization',
      'sanitization', 'validation', 'access control', 'privacy'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private getEmptyTemplateContent(): ContentTemplateContent {
    return this.getEmptyContent<ContentTemplateContent>(['hasPurposeSection', 'hasContextSection', 'hasImplementationPatterns', 'hasConfigurationParameters', 'hasIntegrationPoints', 'hasTestingConsiderations', 'hasSecurityConsiderations', 'hasCodeExamples', 'hasDataModels']);
  }

  // Validate requirements 10.1, 10.3, 10.4, 10.6 for content creation and organization
  validateContentCreationRequirements(): {
    requirement_10_1: boolean; // Content creation with rich text editors and media upload
    requirement_10_3: boolean; // Content organization with categorization and tagging
    requirement_10_4: boolean; // Content versioning with revision history
    requirement_10_6: boolean; // Approval workflows with publication scheduling
  } {
    const structure = this.validateContentCreationTemplates();

    // Requirement 10.1: Content creation with rich text editors and media upload
    const requirement_10_1 = structure.hasContentCreationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 10.3: Content organization with categorization and tagging
    const requirement_10_3 = structure.hasContentOrganizationTemplate;

    // Requirement 10.4: Content versioning with revision history
    const requirement_10_4 = structure.hasContentVersioningTemplate;

    // Requirement 10.6: Approval workflows with publication scheduling
    const requirement_10_6 = structure.hasContentWorkflowTemplate;

    return {
      requirement_10_1,
      requirement_10_3,
      requirement_10_4,
      requirement_10_6
    };
  }

  // Validate requirements 10.2, 10.7, 10.8, 10.10 for content moderation and security
  validateContentModerationRequirements(): {
    requirement_10_2: boolean; // Content moderation with automated filtering
    requirement_10_7: boolean; // Content analytics with performance metrics
    requirement_10_8: boolean; // Content security with encryption and access controls
    requirement_10_10: boolean; // Content compliance with legal holds and retention
  } {
    const structure = this.validateContentModerationTemplates();

    // Requirement 10.2: Content moderation with automated filtering
    const requirement_10_2 = structure.hasContentModerationTemplate;

    // Requirement 10.7: Content analytics with performance metrics
    const requirement_10_7 = structure.hasContentAnalyticsTemplate;

    // Requirement 10.8: Content security with encryption and access controls
    const requirement_10_8 = structure.hasContentSecurityTemplate;

    // Requirement 10.10: Content compliance with legal holds and retention
    const requirement_10_10 = structure.hasContentComplianceTemplate;

    return {
      requirement_10_2,
      requirement_10_7,
      requirement_10_8,
      requirement_10_10
    };
  }

  // Validate content management feature coverage
  validateContentFeatureCoverage(): {
    hasRichTextEditing: boolean;
    hasMediaUpload: boolean;
    hasCategorization: boolean;
    hasTagging: boolean;
    hasVersionControl: boolean;
    hasApprovalWorkflows: boolean;
    hasScheduledPublishing: boolean;
    hasContentModeration: boolean;
  } {
    const creationPath = join(this.moduleDir, 'content-creation.md');
    const organizationPath = join(this.moduleDir, 'content-organization.md');
    const versioningPath = join(this.moduleDir, 'content-versioning.md');
    const workflowPath = join(this.moduleDir, 'content-workflow.md');
    const moderationPath = join(this.moduleDir, 'content-moderation.md');

    let hasRichTextEditing = false;
    let hasMediaUpload = false;
    let hasCategorization = false;
    let hasTagging = false;
    let hasVersionControl = false;
    let hasApprovalWorkflows = false;
    let hasScheduledPublishing = false;
    let hasContentModeration = false;

    if (existsSync(creationPath)) {
      const content = readFileSync(creationPath, 'utf-8').toLowerCase();
      hasRichTextEditing = content.includes('rich text') || content.includes('editor');
      hasMediaUpload = content.includes('media') && content.includes('upload');
    }

    if (existsSync(organizationPath)) {
      const content = readFileSync(organizationPath, 'utf-8').toLowerCase();
      hasCategorization = content.includes('categor');
      hasTagging = content.includes('tag');
    }

    if (existsSync(versioningPath)) {
      const content = readFileSync(versioningPath, 'utf-8').toLowerCase();
      hasVersionControl = content.includes('version') && (content.includes('control') || content.includes('history'));
    }

    if (existsSync(workflowPath)) {
      const content = readFileSync(workflowPath, 'utf-8').toLowerCase();
      hasApprovalWorkflows = content.includes('approval') && content.includes('workflow');
      hasScheduledPublishing = content.includes('schedul') && content.includes('publish');
    }

    if (existsSync(moderationPath)) {
      const content = readFileSync(moderationPath, 'utf-8').toLowerCase();
      hasContentModeration = content.includes('moderation') || content.includes('filter');
    }

    return {
      hasRichTextEditing,
      hasMediaUpload,
      hasCategorization,
      hasTagging,
      hasVersionControl,
      hasApprovalWorkflows,
      hasScheduledPublishing,
      hasContentModeration
    };
  }
}
