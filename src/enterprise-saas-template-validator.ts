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

  analyzeMultiTenancyCoverage(): MultiTenancyCoverage {
    const content = this.readTemplate('multi-tenancy.md');
    
    return {
      // Tenant Management
      hasTenantManagement: this.hasFeature(content, 'tenant.*management|manage.*tenant'),
      hasTenantIsolation: this.hasFeature(content, 'tenant.*isolation|isolat.*tenant'),
      hasDataSegregation: this.hasFeature(content, 'data.*segregation|segregat.*data'),
      hasTenantOnboarding: this.hasFeature(content, 'tenant.*onboarding|onboard.*tenant'),
      hasTenantCustomization: this.hasFeature(content, 'tenant.*customiz|customiz.*tenant'),
      
      // Data Isolation Strategies
      hasDatabasePerTenant: this.hasFeature(content, 'database.*per.*tenant|tenant.*database'),
      hasSchemaPerTenant: this.hasFeature(content, 'schema.*per.*tenant|tenant.*schema'),
      hasRowLevelSecurity: this.hasFeature(content, 'row.*level.*security|rls'),
      hasTenantContext: this.hasFeature(content, 'tenant.*context|context.*tenant'),
      
      // Security Features
      hasTenantSecurity: this.hasFeature(content, 'tenant.*security|security.*tenant'),
      hasAccessValidation: this.hasFeature(content, 'access.*validation|validat.*access'),
      hasCrossTenantPrevention: this.hasFeature(content, 'cross.*tenant.*prevent|prevent.*cross.*tenant'),
      hasAuditLogging: this.hasFeature(content, 'audit.*log|log.*audit'),
      
      // Performance Features
      hasConnectionPooling: this.hasFeature(content, 'connection.*pool|pool.*connection'),
      hasTenantCaching: this.hasFeature(content, 'tenant.*cach|cach.*tenant'),
      hasResourceQuotas: this.hasFeature(content, 'resource.*quota|quota'),
      hasScalability: this.hasFeature(content, 'scalab|horizontal.*scal|vertical.*scal')
    };
  }

  analyzeRBACCoverage(): RBACCoverage {
    const content = this.readTemplate('rbac-enterprise.md');
    
    return {
      // Role Management
      hasRoleHierarchy: this.hasFeature(content, 'role.*hierarch|hierarch.*role'),
      hasPermissionManagement: this.hasFeature(content, 'permission.*management|manage.*permission'),
      hasDynamicAuthorization: this.hasFeature(content, 'dynamic.*authoriz|authoriz.*dynamic'),
      hasRoleAssignment: this.hasFeature(content, 'role.*assign|assign.*role'),
      
      // Advanced Features
      hasAttributeBasedAccess: this.hasFeature(content, 'attribute.*based|abac'),
      hasDelegation: this.hasFeature(content, 'delegat'),
      hasTemporaryAccess: this.hasFeature(content, 'temporary.*access|time.*bound'),
      hasApprovalWorkflows: this.hasFeature(content, 'approval.*workflow|workflow.*approval'),
      
      // Enterprise Integration
      hasEnterpriseIdentityIntegration: this.hasFeature(content, 'enterprise.*identity|identity.*provider'),
      hasDirectoryServiceIntegration: this.hasFeature(content, 'directory.*service|ldap|active.*directory'),
      hasComplianceSupport: this.hasFeature(content, 'compliance'),
      hasAuditTrails: this.hasFeature(content, 'audit.*trail|trail.*audit'),
      
      // Performance Features
      hasPermissionCaching: this.hasFeature(content, 'permission.*cach|cach.*permission'),
      hasSecurityMonitoring: this.hasFeature(content, 'security.*monitor|monitor.*security'),
      hasAnomalyDetection: this.hasFeature(content, 'anomaly.*detect|detect.*anomaly'),
      hasPerformanceOptimization: this.hasFeature(content, 'performance.*optim|optim.*performance')
    };
  }

  analyzeSSOCoverage(): SSOCoverage {
    const content = this.readTemplate('sso-integration.md');
    
    return {
      // Protocol Support
      hasSAMLSupport: this.hasFeature(content, 'saml'),
      hasOIDCSupport: this.hasFeature(content, 'oidc|openid.*connect'),
      hasOAuth2Support: this.hasFeature(content, 'oauth2|oauth.*2'),
      hasLDAPSupport: this.hasFeature(content, 'ldap'),
      
      // Provider Integration
      hasActiveDirectoryIntegration: this.hasFeature(content, 'active.*directory|azure.*ad'),
      hasAzureADIntegration: this.hasFeature(content, 'azure.*ad|azure.*active'),
      hasOktaIntegration: this.hasFeature(content, 'okta'),
      hasCustomProviderSupport: this.hasFeature(content, 'custom.*provider|provider.*custom'),
      
      // User Management
      hasUserProvisioning: this.hasFeature(content, 'user.*provision|provision.*user|scim'),
      hasAttributeMapping: this.hasFeature(content, 'attribute.*map|map.*attribute'),
      hasGroupMapping: this.hasFeature(content, 'group.*map|map.*group'),
      hasLifecycleManagement: this.hasFeature(content, 'lifecycle.*management|user.*lifecycle'),
      
      // Security Features
      hasCertificateManagement: this.hasFeature(content, 'certificate.*management|manage.*certificate'),
      hasSecurityValidation: this.hasFeature(content, 'security.*validation|validat.*security'),
      hasSessionManagement: this.hasFeature(content, 'session.*management|manage.*session'),
      hasGlobalLogout: this.hasFeature(content, 'global.*logout|single.*logout|slo')
    };
  }

  analyzeAuditTrailsCoverage(): AuditTrailsCoverage {
    const content = this.readTemplate('audit-trails.md');
    
    return {
      // Event Management
      hasEventCapture: this.hasFeature(content, 'event.*capture|capture.*event'),
      hasEventStorage: this.hasFeature(content, 'event.*storage|storage.*event'),
      hasEventQuery: this.hasFeature(content, 'event.*query|query.*event'),
      hasEventReporting: this.hasFeature(content, 'event.*report|report.*event'),
      
      // Security Features
      hasTamperProofing: this.hasFeature(content, 'tamper.*proof|immutab'),
      hasIntegrityVerification: this.hasFeature(content, 'integrity.*verif|verif.*integrity'),
      hasSecureStorage: this.hasFeature(content, 'secure.*storage|storage.*secure'),
      hasEncryption: this.hasFeature(content, 'encrypt'),
      
      // Compliance Features
      hasComplianceReporting: this.hasFeature(content, 'compliance.*report|report.*compliance'),
      hasRegulatorySupport: this.hasFeature(content, 'regulatory|sox|hipaa|gdpr|pci'),
      hasDataRetention: this.hasFeature(content, 'data.*retention|retention.*polic'),
      hasArchival: this.hasFeature(content, 'archiv'),
      
      // Monitoring Features
      hasRealTimeMonitoring: this.hasFeature(content, 'real.*time.*monitor|monitor.*real.*time'),
      hasAnomalyDetection: this.hasFeature(content, 'anomaly.*detect|detect.*anomaly'),
      hasAlertGeneration: this.hasFeature(content, 'alert.*generat|generat.*alert'),
      hasSIEMIntegration: this.hasFeature(content, 'siem')
    };
  }

  analyzeEnterpriseBillingCoverage(): EnterpriseBillingCoverage {
    const content = this.readTemplate('enterprise-billing.md');
    
    return {
      // Subscription Management
      hasSubscriptionManagement: this.hasFeature(content, 'subscription.*management|manage.*subscription'),
      hasUsageBasedBilling: this.hasFeature(content, 'usage.*based|metered.*billing'),
      hasTieredPricing: this.hasFeature(content, 'tiered.*pricing|pricing.*tier'),
      hasProration: this.hasFeature(content, 'prorat'),
      
      // Payment Processing
      hasPaymentProcessing: this.hasFeature(content, 'payment.*process|process.*payment'),
      hasInvoiceGeneration: this.hasFeature(content, 'invoice.*generat|generat.*invoice'),
      hasPaymentRetry: this.hasFeature(content, 'payment.*retry|retry.*payment'),
      hasDunningManagement: this.hasFeature(content, 'dunning'),
      
      // Enterprise Features
      hasMultiCurrency: this.hasFeature(content, 'multi.*currency|currency.*support'),
      hasTaxCalculation: this.hasFeature(content, 'tax.*calculat|calculat.*tax'),
      hasRevenueRecognition: this.hasFeature(content, 'revenue.*recognit'),
      hasComplianceReporting: this.hasFeature(content, 'compliance.*report'),
      
      // Analytics and Reporting
      hasRevenueAnalytics: this.hasFeature(content, 'revenue.*analytic|analytic.*revenue'),
      hasChurnAnalysis: this.hasFeature(content, 'churn.*analy|analy.*churn'),
      hasCustomReporting: this.hasFeature(content, 'custom.*report|report.*custom'),
      hasRealTimeMetrics: this.hasFeature(content, 'real.*time.*metric|metric.*real.*time')
    };
  }

  analyzeWorkflowAutomationCoverage(): WorkflowAutomationCoverage {
    const content = this.readTemplate('workflow-automation.md');
    
    return {
      // Workflow Engine
      hasWorkflowEngine: this.hasFeature(content, 'workflow.*engine|engine.*workflow'),
      hasProcessDefinition: this.hasFeature(content, 'process.*definition|define.*process'),
      hasTaskManagement: this.hasFeature(content, 'task.*management|manage.*task'),
      hasWorkflowExecution: this.hasFeature(content, 'workflow.*execut|execut.*workflow'),
      
      // Approval Processes
      hasApprovalWorkflows: this.hasFeature(content, 'approval.*workflow|workflow.*approval'),
      hasMultiStepApproval: this.hasFeature(content, 'multi.*step.*approval|approval.*chain'),
      hasDelegation: this.hasFeature(content, 'delegat'),
      hasEscalation: this.hasFeature(content, 'escalat'),
      
      // Automation Features
      hasRuleEngine: this.hasFeature(content, 'rule.*engine|engine.*rule'),
      hasEventTriggers: this.hasFeature(content, 'event.*trigger|trigger.*event'),
      hasScheduledTasks: this.hasFeature(content, 'scheduled.*task|task.*schedul'),
      hasConditionalLogic: this.hasFeature(content, 'conditional.*logic|condition'),
      
      // Integration and Monitoring
      hasIntegrationPoints: this.hasFeature(content, 'integration.*point|integrat'),
      hasWorkflowMonitoring: this.hasFeature(content, 'workflow.*monitor|monitor.*workflow'),
      hasPerformanceMetrics: this.hasFeature(content, 'performance.*metric|metric.*performance'),
      hasAuditTrail: this.hasFeature(content, 'audit.*trail|trail.*audit')
    };
  }

  analyzeAPIManagementCoverage(): APIManagementCoverage {
    const content = this.readTemplate('api-management.md');
    
    return {
      // Gateway Features
      hasAPIGateway: this.hasFeature(content, 'api.*gateway|gateway'),
      hasRateLimiting: this.hasFeature(content, 'rate.*limit|throttl'),
      hasLoadBalancing: this.hasFeature(content, 'load.*balanc'),
      hasCircuitBreaker: this.hasFeature(content, 'circuit.*breaker'),
      
      // Security Features
      hasAuthentication: this.hasFeature(content, 'authenticat'),
      hasAuthorization: this.hasFeature(content, 'authoriz'),
      hasAPIKeys: this.hasFeature(content, 'api.*key|key.*management'),
      hasOAuthIntegration: this.hasFeature(content, 'oauth'),
      
      // Webhook System
      hasWebhookManagement: this.hasFeature(content, 'webhook.*management|manage.*webhook'),
      hasWebhookDelivery: this.hasFeature(content, 'webhook.*deliver|deliver.*webhook'),
      hasRetryMechanism: this.hasFeature(content, 'retry.*mechanism|retry.*logic'),
      hasWebhookSecurity: this.hasFeature(content, 'webhook.*security|security.*webhook'),
      
      // Monitoring and Analytics
      hasAPIMonitoring: this.hasFeature(content, 'api.*monitor|monitor.*api'),
      hasAnalytics: this.hasFeature(content, 'analytic'),
      hasLogging: this.hasFeature(content, 'logging|log'),
      hasAlerts: this.hasFeature(content, 'alert')
    };
  }

  analyzeWhiteLabelingCoverage(): WhiteLabelingCoverage {
    const content = this.readTemplate('white-labeling.md');
    
    return {
      // Brand Management
      hasBrandManagement: this.hasFeature(content, 'brand.*management|manage.*brand'),
      hasThemeCustomization: this.hasFeature(content, 'theme.*customiz|customiz.*theme'),
      hasAssetManagement: this.hasFeature(content, 'asset.*management|manage.*asset'),
      hasBrandValidation: this.hasFeature(content, 'brand.*validat|validat.*brand'),
      
      // Domain Configuration
      hasCustomDomains: this.hasFeature(content, 'custom.*domain|domain.*custom'),
      hasDomainVerification: this.hasFeature(content, 'domain.*verif|verif.*domain'),
      hasSSLManagement: this.hasFeature(content, 'ssl.*management|manage.*ssl|certificate'),
      hasDNSConfiguration: this.hasFeature(content, 'dns.*config|config.*dns'),
      
      // UI Customization
      hasUICustomization: this.hasFeature(content, 'ui.*customiz|customiz.*ui'),
      hasLayoutCustomization: this.hasFeature(content, 'layout.*customiz|customiz.*layout'),
      hasComponentCustomization: this.hasFeature(content, 'component.*customiz|customiz.*component'),
      hasResponsiveDesign: this.hasFeature(content, 'responsive.*design|responsive'),
      
      // Enterprise Features
      hasMultiTenantBranding: this.hasFeature(content, 'multi.*tenant.*brand|tenant.*brand'),
      hasBrandGovernance: this.hasFeature(content, 'brand.*governance|governance.*brand'),
      hasComplianceValidation: this.hasFeature(content, 'compliance.*validat|validat.*compliance'),
      hasAccessControl: this.hasFeature(content, 'access.*control|control.*access')
    };
  }
}