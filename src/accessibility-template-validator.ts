import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface AccessibilityTemplateStructure {
  hasAccessibilityComplianceTemplate: boolean;
  hasInternationalizationTemplate: boolean;
  hasCulturalAdaptationTemplate: boolean;
  hasResponsiveDesignAdvancedTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface AccessibilityTemplateContent {
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

export class AccessibilityTemplateValidator {
  private accessibilityModulePath: string;

  constructor(accessibilityModulePath: string = 'prompts/modules/accessibility') {
    this.accessibilityModulePath = accessibilityModulePath;
  }

  validateAccessibilityTemplates(): AccessibilityTemplateStructure {
    const accessibilityTemplates = [
      'accessibility-compliance.md',
      'internationalization.md',
      'cultural-adaptation.md',
      'responsive-design-advanced.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.accessibilityModulePath, filename));

    const hasAccessibilityComplianceTemplate = templateExists('accessibility-compliance.md');
    const hasInternationalizationTemplate = templateExists('internationalization.md');
    const hasCulturalAdaptationTemplate = templateExists('cultural-adaptation.md');
    const hasResponsiveDesignAdvancedTemplate = templateExists('responsive-design-advanced.md');

    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of accessibilityTemplates) {
      const templatePath = join(this.accessibilityModulePath, template);
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
      hasAccessibilityComplianceTemplate,
      hasInternationalizationTemplate,
      hasCulturalAdaptationTemplate,
      hasResponsiveDesignAdvancedTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }


  validateTemplateContent(templatePath: string): AccessibilityTemplateContent {
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
      'secure', 'protection', 'audit', 'xss', 'csrf', 'compliance'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
  }

  private getEmptyTemplateContent(): AccessibilityTemplateContent {
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

  // Validate cross-cutting accessibility requirements
  validateAccessibilityRequirements(): {
    wcagCompliance: boolean;
    internationalization: boolean;
    culturalAdaptation: boolean;
    responsiveDesign: boolean;
  } {
    const structure = this.validateAccessibilityTemplates();

    // WCAG compliance requirements
    const wcagCompliance = structure.hasAccessibilityComplianceTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Internationalization requirements
    const internationalization = structure.hasInternationalizationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Cultural adaptation requirements
    const culturalAdaptation = structure.hasCulturalAdaptationTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Responsive design requirements
    const responsiveDesign = structure.hasResponsiveDesignAdvancedTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      wcagCompliance,
      internationalization,
      culturalAdaptation,
      responsiveDesign
    };
  }

  // Validate accessibility feature coverage
  validateAccessibilityFeatureCoverage(): {
    hasWCAGSupport: boolean;
    hasARIASupport: boolean;
    hasScreenReaderSupport: boolean;
    hasKeyboardNavigation: boolean;
    hasI18nSupport: boolean;
    hasRTLSupport: boolean;
    hasLocalizationSupport: boolean;
    hasFluidTypography: boolean;
    hasContainerQueries: boolean;
    hasTouchOptimization: boolean;
  } {
    const a11yPath = join(this.accessibilityModulePath, 'accessibility-compliance.md');
    const i18nPath = join(this.accessibilityModulePath, 'internationalization.md');
    const culturalPath = join(this.accessibilityModulePath, 'cultural-adaptation.md');
    const responsivePath = join(this.accessibilityModulePath, 'responsive-design-advanced.md');

    let hasWCAGSupport = false;
    let hasARIASupport = false;
    let hasScreenReaderSupport = false;
    let hasKeyboardNavigation = false;
    let hasI18nSupport = false;
    let hasRTLSupport = false;
    let hasLocalizationSupport = false;
    let hasFluidTypography = false;
    let hasContainerQueries = false;
    let hasTouchOptimization = false;

    if (existsSync(a11yPath)) {
      const content = readFileSync(a11yPath, 'utf-8').toLowerCase();
      hasWCAGSupport = content.includes('wcag');
      hasARIASupport = content.includes('aria');
      hasScreenReaderSupport = content.includes('screen reader');
      hasKeyboardNavigation = content.includes('keyboard');
    }

    if (existsSync(i18nPath)) {
      const content = readFileSync(i18nPath, 'utf-8').toLowerCase();
      hasI18nSupport = content.includes('i18n') || content.includes('internationalization');
      hasRTLSupport = content.includes('rtl') || content.includes('right-to-left');
      hasLocalizationSupport = content.includes('localization') || content.includes('locale');
    }

    if (existsSync(responsivePath)) {
      const content = readFileSync(responsivePath, 'utf-8').toLowerCase();
      hasFluidTypography = content.includes('fluid') && content.includes('typography');
      hasContainerQueries = content.includes('container quer');
      hasTouchOptimization = content.includes('touch');
    }

    return {
      hasWCAGSupport,
      hasARIASupport,
      hasScreenReaderSupport,
      hasKeyboardNavigation,
      hasI18nSupport,
      hasRTLSupport,
      hasLocalizationSupport,
      hasFluidTypography,
      hasContainerQueries,
      hasTouchOptimization
    };
  }
}
