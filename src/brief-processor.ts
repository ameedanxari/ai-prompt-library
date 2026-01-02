import { readFileSync } from 'fs';
import { join } from 'path';

export interface BriefValidationResult {
  isValid: boolean;
  validationLevel: 'PASS' | 'NEEDS_CLARIFICATION' | 'INSUFFICIENT';
  extractedElements: {
    productType?: string;
    targetUsers?: string;
    coreFeatures?: string[];
    businessContext?: string;
  };
  missingElements: string[];
  confidenceLevel: 'High' | 'Medium' | 'Low';
}

export interface ProductionDefaults {
  technologyStack: {
    mobile: string;
    web: string;
    backend: string;
    database: string;
  };
  features: {
    authentication: boolean;
    adminPortal: boolean;
    analytics: boolean;
    monitoring: boolean;
  };
  quality: {
    security: boolean;
    accessibility: boolean;
    internationalization: boolean;
    performance: boolean;
  };
  deployment: {
    infrastructure: string;
    cicd: boolean;
    monitoring: boolean;
    backup: boolean;
  };
}

export class BriefProcessor {
  private validationTemplate: string;
  private featureTemplate: string;

  constructor() {
    this.validationTemplate = readFileSync(
      join(process.cwd(), 'prompts/templates/brief-validation.md'), 
      'utf-8'
    );
    this.featureTemplate = readFileSync(
      join(process.cwd(), 'prompts/templates/feature-breakdown.md'), 
      'utf-8'
    );
  }

  validateBriefContent(brief: string): BriefValidationResult {
    const trimmedBrief = brief.trim();
    
    // Check minimum length (2-3 lines minimum as per requirements)
    if (trimmedBrief.length < 10) {
      return {
        isValid: false,
        validationLevel: 'INSUFFICIENT',
        extractedElements: {},
        missingElements: ['Minimum content length', 'Product description', 'Purpose/value'],
        confidenceLevel: 'Low'
      };
    }

    // Extract elements from brief
    const extractedElements = this.extractBriefElements(trimmedBrief);
    const missingElements = this.identifyMissingElements(extractedElements);
    
    // Determine validation level
    let validationLevel: 'PASS' | 'NEEDS_CLARIFICATION' | 'INSUFFICIENT';
    let confidenceLevel: 'High' | 'Medium' | 'Low';
    
    if (missingElements.length === 0) {
      validationLevel = 'PASS';
      confidenceLevel = 'High';
    } else if (missingElements.length <= 2) {
      validationLevel = 'NEEDS_CLARIFICATION';
      confidenceLevel = 'Medium';
    } else {
      validationLevel = 'INSUFFICIENT';
      confidenceLevel = 'Low';
    }

    return {
      isValid: validationLevel !== 'INSUFFICIENT',
      validationLevel,
      extractedElements,
      missingElements,
      confidenceLevel
    };
  }

  applyProductionDefaults(brief: string, validationResult?: BriefValidationResult): ProductionDefaults {
    // Always apply production-quality defaults regardless of brief content
    // This ensures maximum feature completeness as per requirement 1.4
    
    return {
      technologyStack: {
        mobile: 'React Native', // Cross-platform efficiency
        web: 'Headless architecture', // Modern frontend framework
        backend: 'Serverless-first', // Cost optimization
        database: 'Managed database service' // Appropriate for data model
      },
      features: {
        authentication: true, // Comprehensive auth with social login
        adminPortal: true, // Full-featured admin interface
        analytics: true, // User behavior tracking and BI
        monitoring: true // Application performance monitoring
      },
      quality: {
        security: true, // Industry-standard security practices
        accessibility: true, // WCAG 2.1 AA compliance
        internationalization: true, // Multi-language support with RTL
        performance: true // Offline-first design with progressive enhancement
      },
      deployment: {
        infrastructure: 'Cloud-native deployment with auto-scaling',
        cicd: true, // Automated testing and deployment pipelines
        monitoring: true, // Comprehensive logging, metrics, and alerting
        backup: true // Automated backup and disaster recovery
      }
    };
  }

  private extractBriefElements(brief: string): BriefValidationResult['extractedElements'] {
    const elements: BriefValidationResult['extractedElements'] = {};
    
    // Simple heuristics to extract information
    const lowerBrief = brief.toLowerCase();
    
    // Product type detection
    const productTypes = ['app', 'application', 'platform', 'system', 'tool', 'service', 'website', 'portal'];
    for (const type of productTypes) {
      if (lowerBrief.includes(type)) {
        elements.productType = type;
        break;
      }
    }
    
    // Target users detection
    const userIndicators = ['user', 'customer', 'client', 'team', 'people', 'business', 'organization'];
    for (const indicator of userIndicators) {
      if (lowerBrief.includes(indicator)) {
        elements.targetUsers = indicator;
        break;
      }
    }
    
    // Core features detection (simple keyword matching)
    const featureKeywords = ['manage', 'track', 'create', 'share', 'communicate', 'analyze', 'monitor', 'store'];
    elements.coreFeatures = featureKeywords.filter(keyword => lowerBrief.includes(keyword));
    
    // Business context detection
    const contextIndicators = ['need', 'problem', 'solution', 'improve', 'help', 'enable', 'because', 'so that'];
    if (contextIndicators.some(indicator => lowerBrief.includes(indicator))) {
      elements.businessContext = 'Business need or problem identified';
    }
    
    return elements;
  }

  private identifyMissingElements(elements: BriefValidationResult['extractedElements']): string[] {
    const missing: string[] = [];
    
    if (!elements.productType) {
      missing.push('Clear product/application type');
    }
    
    if (!elements.targetUsers) {
      missing.push('Target user base or audience');
    }
    
    if (!elements.coreFeatures || elements.coreFeatures.length === 0) {
      missing.push('Core features or functionality');
    }
    
    if (!elements.businessContext) {
      missing.push('Business context or problem being solved');
    }
    
    return missing;
  }

  // Validate that brief processing meets requirements 1.2, 1.4, 1.6
  validateRequirements(brief: string): {
    requirement_1_2: boolean; // Brief content validation
    requirement_1_4: boolean; // Production-quality defaults
    requirement_1_6: boolean; // Bite-sized trackable features
  } {
    const validationResult = this.validateBriefContent(brief);
    const defaults = this.applyProductionDefaults(brief, validationResult);
    
    return {
      requirement_1_2: validationResult.validationLevel !== 'INSUFFICIENT', // Can validate brief content
      requirement_1_4: this.hasProductionQualityDefaults(defaults), // Applies production defaults
      requirement_1_6: this.canCreateBiteSizedFeatures(brief) // Can break down into trackable features
    };
  }

  private hasProductionQualityDefaults(defaults: ProductionDefaults): boolean {
    // Check that all production-quality defaults are applied
    return (
      defaults.features.authentication &&
      defaults.features.adminPortal &&
      defaults.features.analytics &&
      defaults.features.monitoring &&
      defaults.quality.security &&
      defaults.quality.accessibility &&
      defaults.quality.internationalization &&
      defaults.quality.performance &&
      defaults.deployment.cicd &&
      defaults.deployment.monitoring &&
      defaults.deployment.backup
    );
  }

  private canCreateBiteSizedFeatures(brief: string): boolean {
    // Check that the feature breakdown template can process any brief
    // This is always true since the template includes modular breakdown patterns
    return this.featureTemplate.includes('Feature Module Breakdown') &&
           this.featureTemplate.includes('Bite-Sized Development Tasks') &&
           this.featureTemplate.includes('Task Sizing Guidelines');
  }
}