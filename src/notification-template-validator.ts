import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface NotificationTemplateStructure {
  hasNotificationChannelsTemplate: boolean;
  hasNotificationPersonalizationTemplate: boolean;
  hasNotificationComplianceTemplate: boolean;
  hasNotificationAnalyticsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface AdvancedCommunicationTemplateStructure {
  hasRichNotificationsTemplate: boolean;
  hasCommunicationAutomationTemplate: boolean;
  hasEnterpriseCommunicationsTemplate: boolean;
  hasRealTimeNotificationsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface NotificationTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasTestingConsiderations: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceGuidelines: boolean;
  hasCodeExamples: boolean;
  hasDataModels: boolean;
}

export class NotificationTemplateValidator {
  private notificationModulePath: string;

  constructor(notificationModulePath: string = 'prompts/modules/notifications') {
    this.notificationModulePath = notificationModulePath;
  }

  validateNotificationTemplates(): NotificationTemplateStructure {
    const notificationTemplates = [
      'notification-channels.md',
      'notification-personalization.md',
      'notification-compliance.md',
      'notification-analytics.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.notificationModulePath, filename));

    const hasNotificationChannelsTemplate = templateExists('notification-channels.md');
    const hasNotificationPersonalizationTemplate = templateExists('notification-personalization.md');
    const hasNotificationComplianceTemplate = templateExists('notification-compliance.md');
    const hasNotificationAnalyticsTemplate = templateExists('notification-analytics.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of notificationTemplates) {
      const templatePath = join(this.notificationModulePath, template);
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
      hasNotificationChannelsTemplate,
      hasNotificationPersonalizationTemplate,
      hasNotificationComplianceTemplate,
      hasNotificationAnalyticsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateAdvancedCommunicationTemplates(): AdvancedCommunicationTemplateStructure {
    const advancedTemplates = [
      'rich-notifications.md',
      'communication-automation.md',
      'enterprise-communications.md',
      'real-time-notifications.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.notificationModulePath, filename));

    const hasRichNotificationsTemplate = templateExists('rich-notifications.md');
    const hasCommunicationAutomationTemplate = templateExists('communication-automation.md');
    const hasEnterpriseCommunicationsTemplate = templateExists('enterprise-communications.md');
    const hasRealTimeNotificationsTemplate = templateExists('real-time-notifications.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of advancedTemplates) {
      const templatePath = join(this.notificationModulePath, template);
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
      hasRichNotificationsTemplate,
      hasCommunicationAutomationTemplate,
      hasEnterpriseCommunicationsTemplate,
      hasRealTimeNotificationsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): NotificationTemplateContent {
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
      hasComplianceGuidelines: this.hasSection(content, 'Compliance') ||
        this.hasComplianceContent(content),
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
      'threat', 'vulnerability', 'protection', 'consent'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasComplianceContent(content: string): boolean {
    const complianceKeywords = [
      'compliance', 'gdpr', 'can-spam', 'tcpa', 'casl',
      'opt-in', 'opt-out', 'consent', 'unsubscribe',
      'regulatory', 'audit'
    ];

    const contentLower = content.toLowerCase();
    return complianceKeywords.some(keyword => contentLower.includes(keyword));
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

  private getEmptyTemplateContent(): NotificationTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasTestingConsiderations: false,
      hasSecurityConsiderations: false,
      hasComplianceGuidelines: false,
      hasCodeExamples: false,
      hasDataModels: false
    };
  }

  // Validate requirements 16.1, 16.3, 16.7, 16.4 for notification system templates
  validateNotificationRequirements(): {
    requirement_16_1: boolean; // Multi-channel notifications (email, SMS, push, in-app, webhook)
    requirement_16_3: boolean; // Personalization (content, timing, frequency, segmentation)
    requirement_16_7: boolean; // Compliance (opt-in/opt-out, GDPR, CAN-SPAM, consent)
    requirement_16_4: boolean; // Notification management (subscriptions, history, tracking, analytics)
  } {
    const structure = this.validateNotificationTemplates();

    // Requirement 16.1: Multi-channel notifications
    const requirement_16_1 = structure.hasNotificationChannelsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 16.3: Personalization
    const requirement_16_3 = structure.hasNotificationPersonalizationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 16.7: Compliance
    const requirement_16_7 = structure.hasNotificationComplianceTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 16.4: Notification management and analytics
    const requirement_16_4 = structure.hasNotificationAnalyticsTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_16_1,
      requirement_16_3,
      requirement_16_7,
      requirement_16_4
    };
  }

  // Validate requirements 16.8, 16.6, 16.10, 16.5 for advanced communication templates
  validateAdvancedCommunicationRequirements(): {
    requirement_16_8: boolean; // Rich notifications (rich media, interactive elements, deep linking)
    requirement_16_6: boolean; // Automation (triggers, workflows, drip campaigns, behavioral)
    requirement_16_10: boolean; // Enterprise features (approval workflows, compliance, brand management)
    requirement_16_5: boolean; // Real-time features (instant notifications, presence, typing, read receipts)
  } {
    const structure = this.validateAdvancedCommunicationTemplates();

    // Requirement 16.8: Rich notifications
    const requirement_16_8 = structure.hasRichNotificationsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 16.6: Automation
    const requirement_16_6 = structure.hasCommunicationAutomationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 16.10: Enterprise features
    const requirement_16_10 = structure.hasEnterpriseCommunicationsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 16.5: Real-time features
    const requirement_16_5 = structure.hasRealTimeNotificationsTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_16_8,
      requirement_16_6,
      requirement_16_10,
      requirement_16_5
    };
  }

  // Validate notification feature coverage
  validateNotificationFeatureCoverage(): {
    hasMultiChannelDelivery: boolean;
    hasPersonalization: boolean;
    hasCompliance: boolean;
    hasAnalytics: boolean;
    hasRichNotifications: boolean;
    hasAutomation: boolean;
    hasEnterpriseFeatures: boolean;
    hasRealTimeFeatures: boolean;
  } {
    const channelsPath = join(this.notificationModulePath, 'notification-channels.md');
    const personalizationPath = join(this.notificationModulePath, 'notification-personalization.md');
    const compliancePath = join(this.notificationModulePath, 'notification-compliance.md');
    const analyticsPath = join(this.notificationModulePath, 'notification-analytics.md');
    const richPath = join(this.notificationModulePath, 'rich-notifications.md');
    const automationPath = join(this.notificationModulePath, 'communication-automation.md');
    const enterprisePath = join(this.notificationModulePath, 'enterprise-communications.md');
    const realTimePath = join(this.notificationModulePath, 'real-time-notifications.md');

    let hasMultiChannelDelivery = false;
    let hasPersonalization = false;
    let hasCompliance = false;
    let hasAnalytics = false;
    let hasRichNotifications = false;
    let hasAutomation = false;
    let hasEnterpriseFeatures = false;
    let hasRealTimeFeatures = false;

    if (existsSync(channelsPath)) {
      const content = readFileSync(channelsPath, 'utf-8').toLowerCase();
      hasMultiChannelDelivery = content.includes('email') &&
        content.includes('sms') &&
        content.includes('push') &&
        (content.includes('webhook') || content.includes('in-app'));
    }

    if (existsSync(personalizationPath)) {
      const content = readFileSync(personalizationPath, 'utf-8').toLowerCase();
      hasPersonalization = content.includes('personalization') &&
        (content.includes('timing') || content.includes('content'));
    }

    if (existsSync(compliancePath)) {
      const content = readFileSync(compliancePath, 'utf-8').toLowerCase();
      hasCompliance = content.includes('compliance') &&
        (content.includes('gdpr') || content.includes('opt-out'));
    }

    if (existsSync(analyticsPath)) {
      const content = readFileSync(analyticsPath, 'utf-8').toLowerCase();
      hasAnalytics = content.includes('analytics') &&
        (content.includes('tracking') || content.includes('metrics'));
    }

    if (existsSync(richPath)) {
      const content = readFileSync(richPath, 'utf-8').toLowerCase();
      hasRichNotifications = content.includes('rich') &&
        (content.includes('interactive') || content.includes('deep link'));
    }

    if (existsSync(automationPath)) {
      const content = readFileSync(automationPath, 'utf-8').toLowerCase();
      hasAutomation = content.includes('automation') &&
        (content.includes('trigger') || content.includes('workflow'));
    }

    if (existsSync(enterprisePath)) {
      const content = readFileSync(enterprisePath, 'utf-8').toLowerCase();
      hasEnterpriseFeatures = content.includes('enterprise') &&
        (content.includes('approval') || content.includes('brand'));
    }

    if (existsSync(realTimePath)) {
      const content = readFileSync(realTimePath, 'utf-8').toLowerCase();
      hasRealTimeFeatures = content.includes('real-time') &&
        (content.includes('instant') || content.includes('presence'));
    }

    return {
      hasMultiChannelDelivery,
      hasPersonalization,
      hasCompliance,
      hasAnalytics,
      hasRichNotifications,
      hasAutomation,
      hasEnterpriseFeatures,
      hasRealTimeFeatures
    };
  }
}
