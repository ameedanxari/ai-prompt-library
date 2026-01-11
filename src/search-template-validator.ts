import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SearchInfrastructureTemplateStructure {
  hasFullTextSearchTemplate: boolean;
  hasFacetedSearchTemplate: boolean;
  hasSearchAnalyticsTemplate: boolean;
  hasSearchPersonalizationTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface AISearchTemplateStructure {
  hasSemanticSearchTemplate: boolean;
  hasRecommendationSystemsTemplate: boolean;
  hasVisualSearchTemplate: boolean;
  hasVoiceSearchTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface SearchTemplateContent {
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

export class SearchTemplateValidator {
  private searchModulePath: string;

  constructor(searchModulePath: string = 'prompts/modules/search-discovery') {
    this.searchModulePath = searchModulePath;
  }

  validateSearchInfrastructureTemplates(): SearchInfrastructureTemplateStructure {
    const searchTemplates = [
      'full-text-search.md',
      'faceted-search.md',
      'search-analytics.md',
      'search-personalization.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.searchModulePath, filename));

    const hasFullTextSearchTemplate = templateExists('full-text-search.md');
    const hasFacetedSearchTemplate = templateExists('faceted-search.md');
    const hasSearchAnalyticsTemplate = templateExists('search-analytics.md');
    const hasSearchPersonalizationTemplate = templateExists('search-personalization.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of searchTemplates) {
      const templatePath = join(this.searchModulePath, template);
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
      hasFullTextSearchTemplate,
      hasFacetedSearchTemplate,
      hasSearchAnalyticsTemplate,
      hasSearchPersonalizationTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateAISearchTemplates(): AISearchTemplateStructure {
    const aiSearchTemplates = [
      'semantic-search.md',
      'recommendation-systems.md',
      'visual-search.md',
      'voice-search.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.searchModulePath, filename));

    const hasSemanticSearchTemplate = templateExists('semantic-search.md');
    const hasRecommendationSystemsTemplate = templateExists('recommendation-systems.md');
    const hasVisualSearchTemplate = templateExists('visual-search.md');
    const hasVoiceSearchTemplate = templateExists('voice-search.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of aiSearchTemplates) {
      const templatePath = join(this.searchModulePath, template);
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
      hasSemanticSearchTemplate,
      hasRecommendationSystemsTemplate,
      hasVisualSearchTemplate,
      hasVoiceSearchTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): SearchTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');

    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') ||
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
      'sanitization', 'validation', 'access control', 'privacy'
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

  private getEmptyTemplateContent(): SearchTemplateContent {
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

  // Validate requirements 9.1, 9.2, 9.7 for search infrastructure
  validateSearchInfrastructureRequirements(): {
    requirement_9_1: boolean; // Full-text search with indexing and query processing
    requirement_9_2: boolean; // Faceted search with filtering systems
    requirement_9_7: boolean; // Search personalization with user profiling
  } {
    const structure = this.validateSearchInfrastructureTemplates();

    // Requirement 9.1: Full-text search with indexing and query processing
    const requirement_9_1 = structure.hasFullTextSearchTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 9.2: Faceted search with filtering systems
    const requirement_9_2 = structure.hasFacetedSearchTemplate;

    // Requirement 9.7: Search personalization with user profiling
    const requirement_9_7 = structure.hasSearchPersonalizationTemplate;

    return {
      requirement_9_1,
      requirement_9_2,
      requirement_9_7
    };
  }

  // Validate requirements 9.3, 9.4, 9.5, 9.6 for AI-powered search
  validateAISearchRequirements(): {
    requirement_9_3: boolean; // AI-powered semantic search
    requirement_9_4: boolean; // Recommendation systems
    requirement_9_5: boolean; // Visual search
    requirement_9_6: boolean; // Voice search
  } {
    const structure = this.validateAISearchTemplates();

    // Requirement 9.3: AI-powered semantic search
    const requirement_9_3 = structure.hasSemanticSearchTemplate;

    // Requirement 9.4: Recommendation systems
    const requirement_9_4 = structure.hasRecommendationSystemsTemplate;

    // Requirement 9.5: Visual search
    const requirement_9_5 = structure.hasVisualSearchTemplate;

    // Requirement 9.6: Voice search
    const requirement_9_6 = structure.hasVoiceSearchTemplate;

    return {
      requirement_9_3,
      requirement_9_4,
      requirement_9_5,
      requirement_9_6
    };
  }

  // Validate search feature coverage
  validateSearchFeatureCoverage(): {
    hasQueryProcessing: boolean;
    hasRelevanceScoring: boolean;
    hasFuzzyMatching: boolean;
    hasAutocomplete: boolean;
    hasFilterAggregation: boolean;
    hasAnalyticsTracking: boolean;
    hasPersonalization: boolean;
  } {
    const fullTextPath = join(this.searchModulePath, 'full-text-search.md');
    const facetedPath = join(this.searchModulePath, 'faceted-search.md');
    const analyticsPath = join(this.searchModulePath, 'search-analytics.md');
    const personalizationPath = join(this.searchModulePath, 'search-personalization.md');

    let hasQueryProcessing = false;
    let hasRelevanceScoring = false;
    let hasFuzzyMatching = false;
    let hasAutocomplete = false;
    let hasFilterAggregation = false;
    let hasAnalyticsTracking = false;
    let hasPersonalization = false;

    if (existsSync(fullTextPath)) {
      const content = readFileSync(fullTextPath, 'utf-8').toLowerCase();
      hasQueryProcessing = content.includes('query') && content.includes('process');
      hasRelevanceScoring = content.includes('relevance') || content.includes('scoring');
      hasFuzzyMatching = content.includes('fuzzy') || content.includes('typo');
      hasAutocomplete = content.includes('autocomplete') || content.includes('suggestion');
    }

    if (existsSync(facetedPath)) {
      const content = readFileSync(facetedPath, 'utf-8').toLowerCase();
      hasFilterAggregation = content.includes('filter') && content.includes('aggregation');
    }

    if (existsSync(analyticsPath)) {
      const content = readFileSync(analyticsPath, 'utf-8').toLowerCase();
      hasAnalyticsTracking = content.includes('analytics') || content.includes('tracking');
    }

    if (existsSync(personalizationPath)) {
      const content = readFileSync(personalizationPath, 'utf-8').toLowerCase();
      hasPersonalization = content.includes('personalization') || content.includes('user profile');
    }

    return {
      hasQueryProcessing,
      hasRelevanceScoring,
      hasFuzzyMatching,
      hasAutocomplete,
      hasFilterAggregation,
      hasAnalyticsTracking,
      hasPersonalization
    };
  }
}
