import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface APIManagementTemplateStructure {
  hasAPIManagementTemplate: boolean;
  hasWebhookSystemsTemplate: boolean;
  hasMessageQueuesTemplate: boolean;
  hasServiceIntegrationTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface EnterpriseIntegrationTemplateStructure {
  hasEventDrivenArchitectureTemplate: boolean;
  hasDataSynchronizationTemplate: boolean;
  hasEnterpriseIntegrationTemplate: boolean;
  hasIntegrationMonitoringTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface IntegrationTemplateContent {
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

export class IntegrationTemplateValidator {
  private integrationModulePath: string;

  constructor(integrationModulePath: string = 'prompts/modules/integration') {
    this.integrationModulePath = integrationModulePath;
  }


  validateAPIManagementTemplates(): APIManagementTemplateStructure {
    const apiManagementTemplates = [
      'api-management.md',
      'webhook-systems.md',
      'message-queues.md',
      'service-integration.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.integrationModulePath, filename));

    const hasAPIManagementTemplate = templateExists('api-management.md');
    const hasWebhookSystemsTemplate = templateExists('webhook-systems.md');
    const hasMessageQueuesTemplate = templateExists('message-queues.md');
    const hasServiceIntegrationTemplate = templateExists('service-integration.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of apiManagementTemplates) {
      const templatePath = join(this.integrationModulePath, template);
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
      hasAPIManagementTemplate,
      hasWebhookSystemsTemplate,
      hasMessageQueuesTemplate,
      hasServiceIntegrationTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  validateEnterpriseIntegrationTemplates(): EnterpriseIntegrationTemplateStructure {
    const enterpriseTemplates = [
      'event-driven-architecture.md',
      'data-synchronization.md',
      'enterprise-integration.md',
      'integration-monitoring.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.integrationModulePath, filename));

    const hasEventDrivenArchitectureTemplate = templateExists('event-driven-architecture.md');
    const hasDataSynchronizationTemplate = templateExists('data-synchronization.md');
    const hasEnterpriseIntegrationTemplate = templateExists('enterprise-integration.md');
    const hasIntegrationMonitoringTemplate = templateExists('integration-monitoring.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of enterpriseTemplates) {
      const templatePath = join(this.integrationModulePath, template);
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
      hasEventDrivenArchitectureTemplate,
      hasDataSynchronizationTemplate,
      hasEnterpriseIntegrationTemplate,
      hasIntegrationMonitoringTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  validateTemplateContent(templatePath: string): IntegrationTemplateContent {
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
        this.hasSection(content, 'Config') ||
        this.hasCodeExamples(content),
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
      'secure', 'protection', 'audit', 'signature', 'tls', 'ssl', 'secret'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private getEmptyTemplateContent(): IntegrationTemplateContent {
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

  // Validate requirements 20.1, 20.2, 20.3, 20.6 for API management
  validateAPIManagementRequirements(): {
    requirement_20_1: boolean; // API management (gateways, rate limiting, authentication, documentation)
    requirement_20_2: boolean; // Webhook systems (delivery, retry, signature verification, event routing)
    requirement_20_3: boolean; // Message queues (queue management, routing, dead letter, persistence)
    requirement_20_6: boolean; // Service integration (discovery, load balancing, circuit breakers, health checks)
  } {
    const structure = this.validateAPIManagementTemplates();

    // Requirement 20.1: API management
    const requirement_20_1 = structure.hasAPIManagementTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 20.2: Webhook systems
    const requirement_20_2 = structure.hasWebhookSystemsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 20.3: Message queues
    const requirement_20_3 = structure.hasMessageQueuesTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 20.6: Service integration
    const requirement_20_6 = structure.hasServiceIntegrationTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_20_1,
      requirement_20_2,
      requirement_20_3,
      requirement_20_6
    };
  }

  // Validate requirements 20.4, 20.5, 20.8, 20.10 for enterprise integration
  validateEnterpriseIntegrationRequirements(): {
    requirement_20_4: boolean; // Event-driven architecture (event sourcing, streaming, saga patterns)
    requirement_20_5: boolean; // Data synchronization (real-time sync, batch sync, conflict resolution)
    requirement_20_8: boolean; // Integration monitoring (metrics, error tracking, alerting)
    requirement_20_10: boolean; // Enterprise integration (ESB, B2B, EDI, legacy systems)
  } {
    const structure = this.validateEnterpriseIntegrationTemplates();

    // Requirement 20.4: Event-driven architecture
    const requirement_20_4 = structure.hasEventDrivenArchitectureTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 20.5: Data synchronization
    const requirement_20_5 = structure.hasDataSynchronizationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 20.8: Integration monitoring
    const requirement_20_8 = structure.hasIntegrationMonitoringTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 20.10: Enterprise integration
    const requirement_20_10 = structure.hasEnterpriseIntegrationTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_20_4,
      requirement_20_5,
      requirement_20_8,
      requirement_20_10
    };
  }

  // Validate API management feature coverage
  validateAPIManagementFeatureCoverage(): {
    hasAPIGatewaySupport: boolean;
    hasRateLimitingSupport: boolean;
    hasAuthenticationSupport: boolean;
    hasDocumentationSupport: boolean;
    hasWebhookDeliverySupport: boolean;
    hasRetryMechanismSupport: boolean;
    hasSignatureVerificationSupport: boolean;
    hasMessageQueueSupport: boolean;
    hasDeadLetterQueueSupport: boolean;
    hasServiceDiscoverySupport: boolean;
    hasLoadBalancingSupport: boolean;
    hasCircuitBreakerSupport: boolean;
    hasHealthCheckSupport: boolean;
  } {
    const apiManagementPath = join(this.integrationModulePath, 'api-management.md');
    const webhookPath = join(this.integrationModulePath, 'webhook-systems.md');
    const messageQueuePath = join(this.integrationModulePath, 'message-queues.md');
    const serviceIntegrationPath = join(this.integrationModulePath, 'service-integration.md');

    let hasAPIGatewaySupport = false;
    let hasRateLimitingSupport = false;
    let hasAuthenticationSupport = false;
    let hasDocumentationSupport = false;
    let hasWebhookDeliverySupport = false;
    let hasRetryMechanismSupport = false;
    let hasSignatureVerificationSupport = false;
    let hasMessageQueueSupport = false;
    let hasDeadLetterQueueSupport = false;
    let hasServiceDiscoverySupport = false;
    let hasLoadBalancingSupport = false;
    let hasCircuitBreakerSupport = false;
    let hasHealthCheckSupport = false;

    if (existsSync(apiManagementPath)) {
      const content = readFileSync(apiManagementPath, 'utf-8').toLowerCase();
      hasAPIGatewaySupport = content.includes('gateway') && content.includes('api');
      hasRateLimitingSupport = content.includes('rate limit') || content.includes('ratelimit');
      hasAuthenticationSupport = content.includes('authentication') || content.includes('auth');
      hasDocumentationSupport = content.includes('documentation') || content.includes('openapi');
    }

    if (existsSync(webhookPath)) {
      const content = readFileSync(webhookPath, 'utf-8').toLowerCase();
      hasWebhookDeliverySupport = content.includes('webhook') && content.includes('delivery');
      hasRetryMechanismSupport = content.includes('retry') && (content.includes('backoff') || content.includes('mechanism'));
      hasSignatureVerificationSupport = content.includes('signature') && content.includes('verif');
    }

    if (existsSync(messageQueuePath)) {
      const content = readFileSync(messageQueuePath, 'utf-8').toLowerCase();
      hasMessageQueueSupport = content.includes('queue') && content.includes('message');
      hasDeadLetterQueueSupport = content.includes('dead letter') || content.includes('dlq');
    }

    if (existsSync(serviceIntegrationPath)) {
      const content = readFileSync(serviceIntegrationPath, 'utf-8').toLowerCase();
      hasServiceDiscoverySupport = content.includes('service discovery') || content.includes('registry');
      hasLoadBalancingSupport = content.includes('load balanc');
      hasCircuitBreakerSupport = content.includes('circuit breaker');
      hasHealthCheckSupport = content.includes('health check') || content.includes('healthcheck');
    }

    return {
      hasAPIGatewaySupport,
      hasRateLimitingSupport,
      hasAuthenticationSupport,
      hasDocumentationSupport,
      hasWebhookDeliverySupport,
      hasRetryMechanismSupport,
      hasSignatureVerificationSupport,
      hasMessageQueueSupport,
      hasDeadLetterQueueSupport,
      hasServiceDiscoverySupport,
      hasLoadBalancingSupport,
      hasCircuitBreakerSupport,
      hasHealthCheckSupport
    };
  }

  // Validate enterprise integration feature coverage
  validateEnterpriseIntegrationFeatureCoverage(): {
    hasEventSourcingSupport: boolean;
    hasEventStreamingSupport: boolean;
    hasSagaPatternSupport: boolean;
    hasRealTimeSyncSupport: boolean;
    hasBatchSyncSupport: boolean;
    hasConflictResolutionSupport: boolean;
    hasESBSupport: boolean;
    hasB2BIntegrationSupport: boolean;
    hasEDIProcessingSupport: boolean;
    hasLegacySystemSupport: boolean;
    hasMetricsSupport: boolean;
    hasErrorTrackingSupport: boolean;
    hasAlertingSupport: boolean;
  } {
    const eventDrivenPath = join(this.integrationModulePath, 'event-driven-architecture.md');
    const dataSyncPath = join(this.integrationModulePath, 'data-synchronization.md');
    const enterprisePath = join(this.integrationModulePath, 'enterprise-integration.md');
    const monitoringPath = join(this.integrationModulePath, 'integration-monitoring.md');

    let hasEventSourcingSupport = false;
    let hasEventStreamingSupport = false;
    let hasSagaPatternSupport = false;
    let hasRealTimeSyncSupport = false;
    let hasBatchSyncSupport = false;
    let hasConflictResolutionSupport = false;
    let hasESBSupport = false;
    let hasB2BIntegrationSupport = false;
    let hasEDIProcessingSupport = false;
    let hasLegacySystemSupport = false;
    let hasMetricsSupport = false;
    let hasErrorTrackingSupport = false;
    let hasAlertingSupport = false;

    if (existsSync(eventDrivenPath)) {
      const content = readFileSync(eventDrivenPath, 'utf-8').toLowerCase();
      hasEventSourcingSupport = content.includes('event sourcing');
      hasEventStreamingSupport = content.includes('event stream') || content.includes('kafka');
      hasSagaPatternSupport = content.includes('saga');
    }

    if (existsSync(dataSyncPath)) {
      const content = readFileSync(dataSyncPath, 'utf-8').toLowerCase();
      hasRealTimeSyncSupport = content.includes('real-time') || content.includes('realtime');
      hasBatchSyncSupport = content.includes('batch');
      hasConflictResolutionSupport = content.includes('conflict resolution');
    }

    if (existsSync(enterprisePath)) {
      const content = readFileSync(enterprisePath, 'utf-8').toLowerCase();
      hasESBSupport = content.includes('esb') || content.includes('enterprise service bus');
      hasB2BIntegrationSupport = content.includes('b2b');
      hasEDIProcessingSupport = content.includes('edi');
      hasLegacySystemSupport = content.includes('legacy');
    }

    if (existsSync(monitoringPath)) {
      const content = readFileSync(monitoringPath, 'utf-8').toLowerCase();
      hasMetricsSupport = content.includes('metric');
      hasErrorTrackingSupport = content.includes('error') && content.includes('track');
      hasAlertingSupport = content.includes('alert');
    }

    return {
      hasEventSourcingSupport,
      hasEventStreamingSupport,
      hasSagaPatternSupport,
      hasRealTimeSyncSupport,
      hasBatchSyncSupport,
      hasConflictResolutionSupport,
      hasESBSupport,
      hasB2BIntegrationSupport,
      hasEDIProcessingSupport,
      hasLegacySystemSupport,
      hasMetricsSupport,
      hasErrorTrackingSupport,
      hasAlertingSupport
    };
  }
}
