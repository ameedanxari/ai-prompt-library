import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface AuthenticationTemplateStructure {
  hasMultiFactorAuthTemplate: boolean;
  hasAdvancedAuthorizationTemplate: boolean;
  hasAdaptiveAuthenticationTemplate: boolean;
  hasIdentityFederationTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface DataProtectionTemplateStructure {
  hasDataEncryptionTemplate: boolean;
  hasPrivacyControlsTemplate: boolean;
  hasThreatDetectionTemplate: boolean;
  hasZeroTrustArchitectureTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface SecurityTemplateContent {
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

export class SecurityTemplateValidator {
  private securityModulePath: string;

  constructor(securityModulePath: string = 'prompts/modules/security') {
    this.securityModulePath = securityModulePath;
  }

  validateAuthenticationTemplates(): AuthenticationTemplateStructure {
    const authenticationTemplates = [
      'multi-factor-auth.md',
      'advanced-authorization.md',
      'adaptive-authentication.md',
      'identity-federation.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.securityModulePath, filename));

    const hasMultiFactorAuthTemplate = templateExists('multi-factor-auth.md');
    const hasAdvancedAuthorizationTemplate = templateExists('advanced-authorization.md');
    const hasAdaptiveAuthenticationTemplate = templateExists('adaptive-authentication.md');
    const hasIdentityFederationTemplate = templateExists('identity-federation.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of authenticationTemplates) {
      const templatePath = join(this.securityModulePath, template);
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
      hasMultiFactorAuthTemplate,
      hasAdvancedAuthorizationTemplate,
      hasAdaptiveAuthenticationTemplate,
      hasIdentityFederationTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateDataProtectionTemplates(): DataProtectionTemplateStructure {
    const dataProtectionTemplates = [
      'data-encryption.md',
      'privacy-controls.md',
      'threat-detection.md',
      'zero-trust-architecture.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.securityModulePath, filename));

    const hasDataEncryptionTemplate = templateExists('data-encryption.md');
    const hasPrivacyControlsTemplate = templateExists('privacy-controls.md');
    const hasThreatDetectionTemplate = templateExists('threat-detection.md');
    const hasZeroTrustArchitectureTemplate = templateExists('zero-trust-architecture.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of dataProtectionTemplates) {
      const templatePath = join(this.securityModulePath, template);
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
      hasDataEncryptionTemplate,
      hasPrivacyControlsTemplate,
      hasThreatDetectionTemplate,
      hasZeroTrustArchitectureTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): SecurityTemplateContent {
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
      'validation', 'sanitization', 'audit', 'compliance',
      'threat', 'vulnerability', 'protection', 'privacy'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasComplianceContent(content: string): boolean {
    const complianceKeywords = [
      'gdpr', 'hipaa', 'pci', 'soc', 'nist', 'compliance',
      'regulatory', 'audit', 'certification'
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

  private getEmptyTemplateContent(): SecurityTemplateContent {
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

  // Validate requirements 13.1, 13.2 for authentication templates
  validateAuthenticationRequirements(): {
    requirement_13_1: boolean; // MFA, biometric, passwordless, adaptive authentication
    requirement_13_2: boolean; // Fine-grained permissions, ABAC, dynamic authorization
  } {
    const structure = this.validateAuthenticationTemplates();

    // Requirement 13.1: MFA, biometric authentication, passwordless login, adaptive authentication
    const requirement_13_1 = structure.hasMultiFactorAuthTemplate &&
      structure.hasAdaptiveAuthenticationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 13.2: Fine-grained permissions, ABAC, dynamic authorization
    const requirement_13_2 = structure.hasAdvancedAuthorizationTemplate &&
      structure.hasIdentityFederationTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_13_1,
      requirement_13_2
    };
  }

  // Validate requirements 13.3, 13.4, 13.5, 13.10 for data protection templates
  validateDataProtectionRequirements(): {
    requirement_13_3: boolean; // End-to-end encryption, data masking, key management
    requirement_13_4: boolean; // Consent management, data portability, right to deletion
    requirement_13_5: boolean; // Anomaly detection, fraud prevention, security monitoring
    requirement_13_10: boolean; // Zero-trust architecture, continuous verification
  } {
    const structure = this.validateDataProtectionTemplates();

    // Requirement 13.3: End-to-end encryption, data masking, tokenization, key management
    const requirement_13_3 = structure.hasDataEncryptionTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 13.4: Consent management, data portability, right to deletion, privacy dashboards
    const requirement_13_4 = structure.hasPrivacyControlsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 13.5: Anomaly detection, fraud prevention, bot detection, security monitoring
    const requirement_13_5 = structure.hasThreatDetectionTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 13.10: Zero-trust architecture, identity verification, network segmentation
    const requirement_13_10 = structure.hasZeroTrustArchitectureTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_13_3,
      requirement_13_4,
      requirement_13_5,
      requirement_13_10
    };
  }

  // Validate security feature coverage
  validateSecurityFeatureCoverage(): {
    hasMultiFactorAuth: boolean;
    hasAdvancedAuthorization: boolean;
    hasAdaptiveAuthentication: boolean;
    hasIdentityFederation: boolean;
    hasDataEncryption: boolean;
    hasPrivacyControls: boolean;
    hasThreatDetection: boolean;
    hasZeroTrustArchitecture: boolean;
  } {
    const mfaPath = join(this.securityModulePath, 'multi-factor-auth.md');
    const authzPath = join(this.securityModulePath, 'advanced-authorization.md');
    const adaptivePath = join(this.securityModulePath, 'adaptive-authentication.md');
    const federationPath = join(this.securityModulePath, 'identity-federation.md');
    const encryptionPath = join(this.securityModulePath, 'data-encryption.md');
    const privacyPath = join(this.securityModulePath, 'privacy-controls.md');
    const threatPath = join(this.securityModulePath, 'threat-detection.md');
    const zeroTrustPath = join(this.securityModulePath, 'zero-trust-architecture.md');

    let hasMultiFactorAuth = false;
    let hasAdvancedAuthorization = false;
    let hasAdaptiveAuthentication = false;
    let hasIdentityFederation = false;
    let hasDataEncryption = false;
    let hasPrivacyControls = false;
    let hasThreatDetection = false;
    let hasZeroTrustArchitecture = false;

    if (existsSync(mfaPath)) {
      const content = readFileSync(mfaPath, 'utf-8').toLowerCase();
      hasMultiFactorAuth = content.includes('multi-factor') || content.includes('mfa') ||
        (content.includes('totp') && content.includes('webauthn'));
    }

    if (existsSync(authzPath)) {
      const content = readFileSync(authzPath, 'utf-8').toLowerCase();
      hasAdvancedAuthorization = content.includes('authorization') &&
        (content.includes('abac') || content.includes('attribute-based') || content.includes('policy'));
    }

    if (existsSync(adaptivePath)) {
      const content = readFileSync(adaptivePath, 'utf-8').toLowerCase();
      hasAdaptiveAuthentication = content.includes('adaptive') &&
        (content.includes('risk') || content.includes('behavioral'));
    }

    if (existsSync(federationPath)) {
      const content = readFileSync(federationPath, 'utf-8').toLowerCase();
      hasIdentityFederation = content.includes('federation') &&
        (content.includes('saml') || content.includes('oidc') || content.includes('identity'));
    }

    if (existsSync(encryptionPath)) {
      const content = readFileSync(encryptionPath, 'utf-8').toLowerCase();
      hasDataEncryption = content.includes('encryption') &&
        (content.includes('key') || content.includes('aes') || content.includes('cryptographic'));
    }

    if (existsSync(privacyPath)) {
      const content = readFileSync(privacyPath, 'utf-8').toLowerCase();
      hasPrivacyControls = content.includes('privacy') &&
        (content.includes('consent') || content.includes('gdpr') || content.includes('data subject'));
    }

    if (existsSync(threatPath)) {
      const content = readFileSync(threatPath, 'utf-8').toLowerCase();
      hasThreatDetection = content.includes('threat') || content.includes('anomaly') ||
        (content.includes('detection') && content.includes('security'));
    }

    if (existsSync(zeroTrustPath)) {
      const content = readFileSync(zeroTrustPath, 'utf-8').toLowerCase();
      hasZeroTrustArchitecture = content.includes('zero') && content.includes('trust') ||
        content.includes('continuous verification');
    }

    return {
      hasMultiFactorAuth,
      hasAdvancedAuthorization,
      hasAdaptiveAuthentication,
      hasIdentityFederation,
      hasDataEncryption,
      hasPrivacyControls,
      hasThreatDetection,
      hasZeroTrustArchitecture
    };
  }
}
