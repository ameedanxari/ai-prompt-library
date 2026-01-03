import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface FintechTemplateStructure {
  hasAccountManagementTemplate: boolean;
  hasTransactionProcessingTemplate: boolean;
  hasFraudDetectionTemplate: boolean;
  hasFinancialReportingTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
  templatesHaveComplianceGuidelines: boolean;
}

export interface FintechRequirements {
  requirement_5_1: boolean; // Account creation and KYC/AML verification
  requirement_5_2: boolean; // Transaction processing and reconciliation
  requirement_5_4: boolean; // Regulatory reporting and compliance
}

export interface FintechComplianceCoverage {
  hasKYCAMLCompliance: boolean;
  hasPCIDSSCompliance: boolean;
  hasSOXCompliance: boolean;
  hasGDPRCompliance: boolean;
  hasRegulatoryReporting: boolean;
  hasAuditTrails: boolean;
  hasFraudPrevention: boolean;
  hasDataEncryption: boolean;
}

export interface TemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasImplementationChecklist: boolean;
  hasSuccessMetrics: boolean;
  hasCodeExamples: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceGuidelines: boolean;
}

export class FintechTemplateValidator {
  constructor(private fintechModulePath: string) {}

  validateAccountManagementTemplateCompleteness(): FintechTemplateStructure {
    const templates = [
      'account-management.md',
      'transaction-processing.md',
      'fraud-detection.md',
      'financial-reporting.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.fintechModulePath, filename));

    const hasAccountManagementTemplate = templateExists('account-management.md');
    const hasTransactionProcessingTemplate = templateExists('transaction-processing.md');
    const hasFraudDetectionTemplate = templateExists('fraud-detection.md');
    const hasFinancialReportingTemplate = templateExists('financial-reporting.md');

    // Validate template content structure
    const allTemplatesHaveRequiredSections = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.fintechModulePath, template));
        return content.hasPurposeSection && content.hasContextSection && content.hasImplementationPatterns;
      });

    const templatesHaveImplementationPatterns = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.fintechModulePath, template));
        return content.hasImplementationPatterns && content.hasCodeExamples;
      });

    const templatesHaveConfigurationExamples = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.fintechModulePath, template));
        return content.hasConfigurationParameters;
      });

    const templatesHaveIntegrationPoints = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.fintechModulePath, template));
        return content.hasIntegrationPoints;
      });

    const templatesHaveSecurityConsiderations = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.fintechModulePath, template));
        return content.hasSecurityConsiderations;
      });

    const templatesHaveComplianceGuidelines = templates
      .filter(templateExists)
      .every(template => {
        const content = this.validateTemplateContent(join(this.fintechModulePath, template));
        return content.hasComplianceGuidelines;
      });

    return {
      hasAccountManagementTemplate,
      hasTransactionProcessingTemplate,
      hasFraudDetectionTemplate,
      hasFinancialReportingTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations,
      templatesHaveComplianceGuidelines
    };
  }

  validateAccountManagementRequirements(): FintechRequirements {
    const accountTemplate = join(this.fintechModulePath, 'account-management.md');
    const transactionTemplate = join(this.fintechModulePath, 'transaction-processing.md');
    const reportingTemplate = join(this.fintechModulePath, 'financial-reporting.md');

    let requirement_5_1 = false;
    let requirement_5_2 = false;
    let requirement_5_4 = false;

    // Check requirement 5.1: Account creation and KYC/AML verification
    if (existsSync(accountTemplate)) {
      const content = readFileSync(accountTemplate, 'utf-8').toLowerCase();
      requirement_5_1 = content.includes('kyc') && 
                       content.includes('aml') && 
                       (content.includes('account creation') || content.includes('account management')) &&
                       content.includes('identity verification');
    }

    // Check requirement 5.2: Transaction processing and reconciliation
    if (existsSync(transactionTemplate)) {
      const content = readFileSync(transactionTemplate, 'utf-8').toLowerCase();
      requirement_5_2 = content.includes('transaction processing') && 
                       content.includes('reconciliation') && 
                       content.includes('payment processing');
    }

    // Check requirement 5.4: Regulatory reporting and compliance
    if (existsSync(reportingTemplate)) {
      const content = readFileSync(reportingTemplate, 'utf-8').toLowerCase();
      requirement_5_4 = content.includes('regulatory reporting') && 
                       content.includes('compliance') && 
                       content.includes('audit');
    }

    return {
      requirement_5_1,
      requirement_5_2,
      requirement_5_4
    };
  }

  validateFintechComplianceCoverage(): FintechComplianceCoverage {
    const templates = [
      'account-management.md',
      'transaction-processing.md',
      'fraud-detection.md',
      'financial-reporting.md'
    ];

    let hasKYCAMLCompliance = false;
    let hasPCIDSSCompliance = false;
    let hasSOXCompliance = false;
    let hasGDPRCompliance = false;
    let hasRegulatoryReporting = false;
    let hasAuditTrails = false;
    let hasFraudPrevention = false;
    let hasDataEncryption = false;

    templates.forEach(template => {
      const templatePath = join(this.fintechModulePath, template);
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        
        if (content.includes('kyc') && content.includes('aml')) {
          hasKYCAMLCompliance = true;
        }
        if (content.includes('pci') && content.includes('dss')) {
          hasPCIDSSCompliance = true;
        }
        if (content.includes('sox') || content.includes('sarbanes')) {
          hasSOXCompliance = true;
        }
        if (content.includes('gdpr') || content.includes('privacy')) {
          hasGDPRCompliance = true;
        }
        if (content.includes('regulatory reporting') || content.includes('compliance reporting')) {
          hasRegulatoryReporting = true;
        }
        if (content.includes('audit trail') || content.includes('audit log')) {
          hasAuditTrails = true;
        }
        if (content.includes('fraud detection') || content.includes('fraud prevention')) {
          hasFraudPrevention = true;
        }
        if (content.includes('encryption') || content.includes('secure')) {
          hasDataEncryption = true;
        }
      }
    });

    return {
      hasKYCAMLCompliance,
      hasPCIDSSCompliance,
      hasSOXCompliance,
      hasGDPRCompliance,
      hasRegulatoryReporting,
      hasAuditTrails,
      hasFraudPrevention,
      hasDataEncryption
    };
  }

  validateTemplateContent(templatePath: string): TemplateContent {
    if (!existsSync(templatePath)) {
      return {
        hasPurposeSection: false,
        hasContextSection: false,
        hasImplementationPatterns: false,
        hasConfigurationParameters: false,
        hasIntegrationPoints: false,
        hasImplementationChecklist: false,
        hasSuccessMetrics: false,
        hasCodeExamples: false,
        hasSecurityConsiderations: false,
        hasComplianceGuidelines: false
      };
    }

    const content = readFileSync(templatePath, 'utf-8');
    const lowerContent = content.toLowerCase();

    return {
      hasPurposeSection: content.includes('## Purpose') || content.includes('# Purpose'),
      hasContextSection: content.includes('## Context') || content.includes('# Context'),
      hasImplementationPatterns: lowerContent.includes('implementation') && lowerContent.includes('pattern'),
      hasConfigurationParameters: lowerContent.includes('configuration') || lowerContent.includes('parameter'),
      hasIntegrationPoints: lowerContent.includes('integration') && (lowerContent.includes('example') || lowerContent.includes('point')),
      hasImplementationChecklist: lowerContent.includes('checklist') || lowerContent.includes('guideline'),
      hasSuccessMetrics: lowerContent.includes('metric') || lowerContent.includes('monitoring'),
      hasCodeExamples: content.includes('```') && (lowerContent.includes('typescript') || lowerContent.includes('interface')),
      hasSecurityConsiderations: lowerContent.includes('security') && (lowerContent.includes('consideration') || lowerContent.includes('requirement')),
      hasComplianceGuidelines: lowerContent.includes('compliance') || lowerContent.includes('regulatory')
    };
  }
}