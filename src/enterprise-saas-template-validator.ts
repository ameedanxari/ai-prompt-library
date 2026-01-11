import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface EnterpriseAccessControlTemplateStructure {
  hasMultiTenancyTemplate: boolean;
  hasRBACEnterpriseTemplate: boolean;
  hasSSOIntegrationTemplate: boolean;
  hasAuditTrailsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
  templatesHaveComplianceGuidelines: boolean;
}

export interface EnterpriseWorkflowTemplateStructure {
  hasEnterpriseBillingTemplate: boolean;
  hasWorkflowAutomationTemplate: boolean;
  hasAPIManagementTemplate: boolean;
  hasWhiteLabelingTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveEnterpriseFeatures: boolean;
}

export interface EnterpriseTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceRequirements: boolean;
  hasTestingConsiderations: boolean;
  hasCodeExamples: boolean;
  hasDataModels: boolean;
}

export interface MultiTenancyCoverage {
  // Tenant Management
  hasTenantManagement: boolean;
  hasTenantIsolation: boolean;
  hasDataSegregation: boolean;
  hasTenantOnboarding: boolean;
  hasTenantCustomization: boolean;
  
  // Data Isolation Strategies
  hasDatabasePerTenant: boolean;
  hasSchemaPerTenant: boolean;
  hasRowLevelSecurity: boolean;
  hasTenantContext: boolean;
  
  // Security Features
  hasTenantSecurity: boolean;
  hasAccessValidation: boolean;
  hasCrossTenantPrevention: boolean;
  hasAuditLogging: boolean;
  
  // Performance Features
  hasConnectionPooling: boolean;
  hasTenantCaching: boolean;
  hasResourceQuotas: boolean;
  hasScalability: boolean;
}

export interface RBACCoverage {
  // Role Management
  hasRoleHierarchy: boolean;
  hasPermissionManagement: boolean;
  hasDynamicAuthorization: boolean;
  hasRoleAssignment: boolean;
  
  // Advanced Features
  hasAttributeBasedAccess: boolean;
  hasDelegation: boolean;
  hasTemporaryAccess: boolean;
  hasApprovalWorkflows: boolean;
  
  // Enterprise Integration
  hasEnterpriseIdentityIntegration: boolean;
  hasDirectoryServiceIntegration: boolean;
  hasComplianceSupport: boolean;
  hasAuditTrails: boolean;
  
  // Performance Features
  hasPermissionCaching: boolean;
  hasSecurityMonitoring: boolean;
  hasAnomalyDetection: boolean;
  hasPerformanceOptimization: boolean;
}

export interface SSOCoverage {
  // Protocol Support
  hasSAMLSupport: boolean;
  hasOIDCSupport: boolean;
  hasOAuth2Support: boolean;
  hasLDAPSupport: boolean;
  
  // Provider Integration
  hasActiveDirectoryIntegration: boolean;
  hasAzureADIntegration: boolean;
  hasOktaIntegration: boolean;
  hasCustomProviderSupport: boolean;
  
  // User Management
  hasUserProvisioning: boolean;
  hasAttributeMapping: boolean;
  hasGroupMapping: boolean;
  hasLifecycleManagement: boolean;
  
  // Security Features
  hasCertificateManagement: boolean;
  hasSecurityValidation: boolean;
  hasSessionManagement: boolean;
  hasGlobalLogout: boolean;
}

export interface AuditTrailsCoverage {
  // Event Management
  hasEventCapture: boolean;
  hasEventStorage: boolean;
  hasEventQuery: boolean;
  hasEventReporting: boolean;
  
  // Security Features
  hasTamperProofing: boolean;
  hasIntegrityVerification: boolean;
  hasSecureStorage: boolean;
  hasEncryption: boolean;
  
  // Compliance Features
  hasComplianceReporting: boolean;
  hasRegulatorySupport: boolean;
  hasDataRetention: boolean;
  hasArchival: boolean;
  
  // Monitoring Features
  hasRealTimeMonitoring: boolean;
  hasAnomalyDetection: boolean;
  hasAlertGeneration: boolean;
  hasSIEMIntegration: boolean;
}

export interface EnterpriseBillingCoverage {
  // Subscription Management
  hasSubscriptionManagement: boolean;
  hasUsageBasedBilling: boolean;
  hasTieredPricing: boolean;
  hasProration: boolean;
  
  // Payment Processing
  hasPaymentProcessing: boolean;
  hasInvoiceGeneration: boolean;
  hasPaymentRetry: boolean;
  hasDunningManagement: boolean;
  
  // Enterprise Features
  hasMultiCurrency: boolean;
  hasTaxCalculation: boolean;
  hasRevenueRecognition: boolean;
  hasComplianceReporting: boolean;
  
  // Analytics and Reporting
  hasRevenueAnalytics: boolean;
  hasChurnAnalysis: boolean;
  hasCustomReporting: boolean;
  hasRealTimeMetrics: boolean;
}

export interface WorkflowAutomationCoverage {
  // Workflow Engine
  hasWorkflowEngine: boolean;
  hasProcessDefinition: boolean;
  hasTaskManagement: boolean;
  hasWorkflowExecution: boolean;
  
  // Approval Processes
  hasApprovalWorkflows: boolean;
  hasMultiStepApproval: boolean;
  hasDelegation: boolean;
  hasEscalation: boolean;
  
  // Automation Features
  hasRuleEngine: boolean;
  hasEventTriggers: boolean;
  hasScheduledTasks: boolean;
  hasConditionalLogic: boolean;
  
  // Integration and Monitoring
  hasIntegrationPoints: boolean;
  hasWorkflowMonitoring: boolean;
  hasPerformanceMetrics: boolean;
  hasAuditTrail: boolean;
}

export interface APIManagementCoverage {
  // Gateway Features
  hasAPIGateway: boolean;
  hasRateLimiting: boolean;
  hasLoadBalancing: boolean;
  hasCircuitBreaker: boolean;
  
  // Security Features
  hasAuthentication: boolean;
  hasAuthorization: boolean;
  hasAPIKeys: boolean;
  hasOAuthIntegration: boolean;
  
  // Webhook System
  hasWebhookManagement: boolean;
  hasWebhookDelivery: boolean;
  hasRetryMechanism: boolean;
  hasWebhookSecurity: boolean;
  
  // Monitoring and Analytics
  hasAPIMonitoring: boolean;
  hasAnalytics: boolean;
  hasLogging: boolean;
  hasAlerts: boolean;
}

export interface WhiteLabelingCoverage {
  // Brand Management
  hasBrandManagement: boolean;
  hasThemeCustomization: boolean;
  hasAssetManagement: boolean;
  hasBrandValidation: boolean;
  
  // Domain Configuration
  hasCustomDomains: boolean;
  hasDomainVerification: boolean;
  hasSSLManagement: boolean;
  hasDNSConfiguration: boolean;
  
  // UI Customization
  hasUICustomization: boolean;
  hasLayoutCustomization: boolean;
  hasComponentCustomization: boolean;
  hasResponsiveDesign: boolean;
  
  // Enterprise Features
  hasMultiTenantBranding: boolean;
  hasBrandGovernance: boolean;
  hasComplianceValidation: boolean;
  hasAccessControl: boolean;
}

export class EnterpriseSaaSTemplateValidator {
  private enterpriseModulePath: string;

  constructor(enterpriseModulePath: string = 'prompts/modules/enterprise-saas') {
    this.enterpriseModulePath = enterpriseModulePath;
  }

  validateEnterpriseAccessControlTemplates(): EnterpriseAccessControlTemplateStructure {
    const accessControlTemplates = [
      'multi-tenancy.md',
      'rbac-enterprise.md',
      'sso-integration.md',
      'audit-trails.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.enterpriseModulePath, filename));

    const hasMultiTenancyTemplate = templateExists('multi-tenancy.md');
    const hasRBACEnterpriseTemplate = templateExists('rbac-enterprise.md');
    const hasSSOIntegrationTemplate = templateExists('sso-integration.md');
    const hasAuditTrailsTemplate = templateExists('audit-trails.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;
    let templatesHaveComplianceGuidelines = true;

    for (const template of accessControlTemplates) {
      const templatePath = join(this.enterpriseModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasTestingConsiderations) {
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
        
        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
        
        if (!content.hasComplianceRequirements) {
          templatesHaveComplianceGuidelines = false;
        }
      }
    }

    return {
      hasMultiTenancyTemplate,
      hasRBACEnterpriseTemplate,
      hasSSOIntegrationTemplate,
      hasAuditTrailsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations,
      templatesHaveComplianceGuidelines
    };
  }

  validateEnterpriseWorkflowTemplates(): EnterpriseWorkflowTemplateStructure {
    const workflowTemplates = [
      'enterprise-billing.md',
      'workflow-automation.md',
      'api-management.md',
      'white-labeling.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.enterpriseModulePath, filename));

    const hasEnterpriseBillingTemplate = templateExists('enterprise-billing.md');
    const hasWorkflowAutomationTemplate = templateExists('workflow-automation.md');
    const hasAPIManagementTemplate = templateExists('api-management.md');
    const hasWhiteLabelingTemplate = templateExists('white-labeling.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveEnterpriseFeatures = true;

    for (const template of workflowTemplates) {
      const templatePath = join(this.enterpriseModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasTestingConsiderations) {
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
        
        // Check for enterprise-specific features
        if (!this.hasEnterpriseFeatures(templatePath)) {
          templatesHaveEnterpriseFeatures = false;
        }
      }
    }

    return {
      hasEnterpriseBillingTemplate,
      hasWorkflowAutomationTemplate,
      hasAPIManagementTemplate,
      hasWhiteLabelingTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveEnterpriseFeatures
    };
  }

  validateTemplateContent(templatePath: string): EnterpriseTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');
    
    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') || 
                                 this.hasSection(content, 'Core.*Patterns') ||
                                 this.hasSection(content, 'Core Components'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
                                  this.hasSection(content, 'Core Components'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points'),
      hasSecurityConsiderations: this.hasSection(content, 'Security Considerations'),
      hasComplianceRequirements: this.hasSection(content, 'Compliance Requirements'),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasDataModels: this.hasDataModels(content)
    };
  }

  // Validate requirements 7.1 and 7.2 specifically for enterprise access control
  validateEnterpriseAccessControlRequirements(): {
    requirement_7_1: boolean; // Multi-tenancy and tenant isolation
    requirement_7_2: boolean; // Advanced role-based access control
  } {
    const structure = this.validateEnterpriseAccessControlTemplates();
    
    // Requirement 7.1: Multi-tenancy with tenant isolation and data segregation
    const requirement_7_1 = structure.hasMultiTenancyTemplate && 
                            structure.hasAuditTrailsTemplate;
    
    // Requirement 7.2: Advanced RBAC with SSO integration
    const requirement_7_2 = structure.hasRBACEnterpriseTemplate && 
                            structure.hasSSOIntegrationTemplate;
    
    return {
      requirement_7_1,
      requirement_7_2
    };
  }

  // Validate requirements 7.3, 7.6, 7.4, 7.9 specifically for enterprise workflow
  validateEnterpriseWorkflowRequirements(): {
    requirement_7_3: boolean; // Enterprise billing and subscription management
    requirement_7_6: boolean; // Workflow automation and approval processes
    requirement_7_4: boolean; // API management and webhook systems
    requirement_7_9: boolean; // White-labeling and custom branding
  } {
    const structure = this.validateEnterpriseWorkflowTemplates();
    
    // Requirement 7.3: Enterprise billing and subscription management
    const requirement_7_3 = structure.hasEnterpriseBillingTemplate;
    
    // Requirement 7.6: Workflow automation and approval processes
    const requirement_7_6 = structure.hasWorkflowAutomationTemplate;
    
    // Requirement 7.4: API management and webhook systems
    const requirement_7_4 = structure.hasAPIManagementTemplate;
    
    // Requirement 7.9: White-labeling and custom branding
    const requirement_7_9 = structure.hasWhiteLabelingTemplate;
    
    return {
      requirement_7_3,
      requirement_7_6,
      requirement_7_4,
      requirement_7_9
    };
  }

  // Helper methods
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

  private hasDataModels(content: string): boolean {
    const dataModelPatterns = [
      /interface\s+\w+/g,
      /class\s+\w+/g,
      /enum\s+\w+/g,
      /type\s+\w+\s*=/g
    ];
    
    return dataModelPatterns.some(pattern => pattern.test(content));
  }

  private hasEnterpriseFeatures(templatePath: string): boolean {
    if (!existsSync(templatePath)) {
      return false;
    }

    const content = readFileSync(templatePath, 'utf-8').toLowerCase();
    
    const enterpriseKeywords = [
      'enterprise', 'multi-tenant', 'scalability', 'compliance',
      'audit', 'governance', 'sso', 'rbac', 'workflow',
      'automation', 'api management', 'white-label'
    ];
    
    return enterpriseKeywords.some(keyword => content.includes(keyword));
  }

  private hasFeature(content: string, feature: string): boolean {
    const regex = new RegExp(feature, 'i');
    return regex.test(content);
  }

  private readTemplate(filename: string): string {
    const templatePath = join(this.enterpriseModulePath, filename);
    if (!existsSync(templatePath)) {
      return '';
    }
    return readFileSync(templatePath, 'utf-8');
  }

  private getEmptyTemplateContent(): EnterpriseTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasSecurityConsiderations: false,
      hasComplianceRequirements: false,
      hasTestingConsiderations: false,
      hasCodeExamples: false,
      hasDataModels: false
    };
  }
}