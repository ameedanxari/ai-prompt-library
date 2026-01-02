/**
 * Testing Strategy Processor
 * 
 * Processes and validates testing strategy templates and generated testing specifications
 * to ensure comprehensive coverage of all testing requirements.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TestingStrategyStructure {
  hasUnitTestSpecification: boolean;
  hasPropertyBasedTesting: boolean;
  hasUITestSpecification: boolean;
  hasAccessibilityTesting: boolean;
  hasInternationalizationTesting: boolean;
  hasOfflineNetworkTesting: boolean;
  hasPerformanceLoadTesting: boolean;
  hasDualTestingApproach: boolean;
  hasTestingFrameworkSelection: boolean;
  hasQualityGates: boolean;
  hasCoverageRequirements: boolean;
  hasTestDataManagement: boolean;
  hasContinuousTestingIntegration: boolean;
  hasRiskAssessment: boolean;
  hasDryRunCapability: boolean;
}

export interface TestingStrategyRequirements {
  requirement_8_1: boolean; // Unit test specifications for all components
  requirement_8_2: boolean; // Property-based testing for universal correctness properties
  requirement_8_3: boolean; // UI tests for all user interactions
  requirement_8_4: boolean; // Accessibility testing requirements
  requirement_8_5: boolean; // Internationalization testing for all supported locales
  requirement_8_6: boolean; // Offline and network throttling test scenarios
  requirement_8_7: boolean; // Performance and load testing requirements
}

export interface TestingStrategyContent {
  unitTestingSection: string;
  propertyBasedTestingSection: string;
  uiTestingSection: string;
  accessibilityTestingSection: string;
  i18nTestingSection: string;
  networkTestingSection: string;
  performanceTestingSection: string;
  frameworkSelection: string;
  qualityGates: string;
  dryRunOptions: string;
}

export class TestingStrategyProcessor {
  private templatePaths: string[];
  private stagePaths: string[];

  constructor() {
    this.templatePaths = [
      'prompts/templates/testing-strategy-generation.md',
      'prompts/templates/property-based-testing.md',
      'prompts/templates/unit-testing-specification.md'
    ];
    
    this.stagePaths = [
      'prompts/stages/stage-05-testing/platform-agnostic.md',
      'prompts/stages/stage-05-testing/web.md',
      'prompts/stages/stage-05-testing/mobile.md'
    ];
  }

  /**
   * Validates the structure of testing strategy templates
   */
  validateTestingStrategyStructure(): TestingStrategyStructure {
    const structure: TestingStrategyStructure = {
      hasUnitTestSpecification: false,
      hasPropertyBasedTesting: false,
      hasUITestSpecification: false,
      hasAccessibilityTesting: false,
      hasInternationalizationTesting: false,
      hasOfflineNetworkTesting: false,
      hasPerformanceLoadTesting: false,
      hasDualTestingApproach: false,
      hasTestingFrameworkSelection: false,
      hasQualityGates: false,
      hasCoverageRequirements: false,
      hasTestDataManagement: false,
      hasContinuousTestingIntegration: false,
      hasRiskAssessment: false,
      hasDryRunCapability: false
    };

    // Check all template files exist and have required content
    for (const templatePath of this.templatePaths) {
      if (!existsSync(templatePath)) {
        continue;
      }

      const content = readFileSync(templatePath, 'utf-8').toLowerCase();
      
      // Check for unit testing specification
      if (content.includes('unit test') && content.includes('specification')) {
        structure.hasUnitTestSpecification = true;
      }
      
      // Check for property-based testing
      if (content.includes('property-based test') || content.includes('property test')) {
        structure.hasPropertyBasedTesting = true;
      }
      
      // Check for UI testing
      if (content.includes('ui test') || content.includes('user interface test')) {
        structure.hasUITestSpecification = true;
      }
      
      // Check for accessibility testing
      if (content.includes('accessibility test') && content.includes('wcag')) {
        structure.hasAccessibilityTesting = true;
      }
      
      // Check for internationalization testing
      if (content.includes('internationalization test') || content.includes('i18n test')) {
        structure.hasInternationalizationTesting = true;
      }
      
      // Check for offline/network testing
      if (content.includes('offline') && content.includes('network')) {
        structure.hasOfflineNetworkTesting = true;
      }
      
      // Check for performance and load testing
      if (content.includes('performance test') && content.includes('load test')) {
        structure.hasPerformanceLoadTesting = true;
      }
      
      // Check for dual testing approach
      if (content.includes('unit test') && content.includes('property') && content.includes('complementary')) {
        structure.hasDualTestingApproach = true;
      }
      
      // Check for testing framework selection
      if (content.includes('framework selection') || content.includes('testing framework')) {
        structure.hasTestingFrameworkSelection = true;
      }
      
      // Check for quality gates
      if (content.includes('quality gate') && content.includes('coverage')) {
        structure.hasQualityGates = true;
      }
      
      // Check for coverage requirements
      if (content.includes('coverage') && (content.includes('80%') || content.includes('threshold'))) {
        structure.hasCoverageRequirements = true;
      }
      
      // Check for test data management
      if (content.includes('test data') && content.includes('management')) {
        structure.hasTestDataManagement = true;
      }
      
      // Check for continuous testing integration
      if (content.includes('ci/cd') || content.includes('continuous')) {
        structure.hasContinuousTestingIntegration = true;
      }
      
      // Check for risk assessment
      if (content.includes('risk') && content.includes('mitigation')) {
        structure.hasRiskAssessment = true;
      }
      
      // Check for dry-run capability
      if (content.includes('dry-run') || content.includes('dry run')) {
        structure.hasDryRunCapability = true;
      }
    }

    // Also check stage files for comprehensive coverage
    for (const stagePath of this.stagePaths) {
      if (!existsSync(stagePath)) {
        continue;
      }

      const content = readFileSync(stagePath, 'utf-8').toLowerCase();
      
      // Additional validation from stage files
      if (content.includes('unit test') && !structure.hasUnitTestSpecification) {
        structure.hasUnitTestSpecification = true;
      }
      
      if (content.includes('property') && content.includes('test') && !structure.hasPropertyBasedTesting) {
        structure.hasPropertyBasedTesting = true;
      }
      
      if (content.includes('accessibility') && !structure.hasAccessibilityTesting) {
        structure.hasAccessibilityTesting = true;
      }
    }

    return structure;
  }

  /**
   * Validates requirements compliance for testing strategy
   */
  validateTestingStrategyRequirements(): TestingStrategyRequirements {
    const structure = this.validateTestingStrategyStructure();
    
    return {
      requirement_8_1: structure.hasUnitTestSpecification && structure.hasTestingFrameworkSelection,
      requirement_8_2: structure.hasPropertyBasedTesting && structure.hasDualTestingApproach,
      requirement_8_3: structure.hasUITestSpecification,
      requirement_8_4: structure.hasAccessibilityTesting,
      requirement_8_5: structure.hasInternationalizationTesting,
      requirement_8_6: structure.hasOfflineNetworkTesting,
      requirement_8_7: structure.hasPerformanceLoadTesting
    };
  }

  /**
   * Extracts and validates testing strategy content sections
   */
  extractTestingStrategyContent(): TestingStrategyContent {
    const content: TestingStrategyContent = {
      unitTestingSection: '',
      propertyBasedTestingSection: '',
      uiTestingSection: '',
      accessibilityTestingSection: '',
      i18nTestingSection: '',
      networkTestingSection: '',
      performanceTestingSection: '',
      frameworkSelection: '',
      qualityGates: '',
      dryRunOptions: ''
    };

    for (const templatePath of this.templatePaths) {
      if (!existsSync(templatePath)) {
        continue;
      }

      const fileContent = readFileSync(templatePath, 'utf-8');
      
      // Extract sections based on headers and content
      const sections = this.extractSections(fileContent);
      
      // Map sections to content structure
      if (sections['unit testing'] || sections['unit test']) {
        content.unitTestingSection = sections['unit testing'] || sections['unit test'] || '';
      }
      
      if (sections['property-based testing'] || sections['property test']) {
        content.propertyBasedTestingSection = sections['property-based testing'] || sections['property test'] || '';
      }
      
      if (sections['ui testing'] || sections['user interface']) {
        content.uiTestingSection = sections['ui testing'] || sections['user interface'] || '';
      }
      
      if (sections['accessibility']) {
        content.accessibilityTestingSection = sections['accessibility'] || '';
      }
      
      if (sections['internationalization'] || sections['i18n']) {
        content.i18nTestingSection = sections['internationalization'] || sections['i18n'] || '';
      }
      
      if (sections['network'] || sections['offline']) {
        content.networkTestingSection = sections['network'] || sections['offline'] || '';
      }
      
      if (sections['performance'] || sections['load testing']) {
        content.performanceTestingSection = sections['performance'] || sections['load testing'] || '';
      }
      
      if (sections['framework'] || sections['testing framework']) {
        content.frameworkSelection = sections['framework'] || sections['testing framework'] || '';
      }
      
      if (sections['quality gates'] || sections['quality']) {
        content.qualityGates = sections['quality gates'] || sections['quality'] || '';
      }
      
      if (sections['dry-run'] || sections['dry run']) {
        content.dryRunOptions = sections['dry-run'] || sections['dry run'] || '';
      }
    }

    return content;
  }

  /**
   * Validates that testing strategy has comprehensive coverage
   */
  validateComprehensiveCoverage(): boolean {
    const structure = this.validateTestingStrategyStructure();
    const requirements = this.validateTestingStrategyRequirements();
    
    // All structure elements must be present
    const structureComplete = Object.values(structure).every(value => value === true);
    
    // All requirements must be satisfied
    const requirementsComplete = Object.values(requirements).every(value => value === true);
    
    return structureComplete && requirementsComplete;
  }

  /**
   * Validates testing strategy quality and completeness
   */
  validateTestingStrategyQuality(): {
    isComplete: boolean;
    hasAllRequiredSections: boolean;
    hasFrameworkGuidance: boolean;
    hasImplementationExamples: boolean;
    hasDryRunSupport: boolean;
    score: number;
  } {
    const structure = this.validateTestingStrategyStructure();
    const content = this.extractTestingStrategyContent();
    
    const hasAllRequiredSections = structure.hasUnitTestSpecification &&
                                  structure.hasPropertyBasedTesting &&
                                  structure.hasUITestSpecification &&
                                  structure.hasAccessibilityTesting &&
                                  structure.hasInternationalizationTesting &&
                                  structure.hasOfflineNetworkTesting &&
                                  structure.hasPerformanceLoadTesting;
    
    const hasFrameworkGuidance = structure.hasTestingFrameworkSelection &&
                                content.frameworkSelection.length > 0;
    
    const hasImplementationExamples = content.unitTestingSection.includes('example') ||
                                     content.propertyBasedTestingSection.includes('example');
    
    const hasDryRunSupport = structure.hasDryRunCapability &&
                            content.dryRunOptions.length > 0;
    
    const isComplete = hasAllRequiredSections && hasFrameworkGuidance && hasDryRunSupport;
    
    // Calculate quality score (0-100)
    let score = 0;
    if (hasAllRequiredSections) score += 40;
    if (hasFrameworkGuidance) score += 20;
    if (hasImplementationExamples) score += 20;
    if (hasDryRunSupport) score += 10;
    if (structure.hasQualityGates) score += 10;
    
    return {
      isComplete,
      hasAllRequiredSections,
      hasFrameworkGuidance,
      hasImplementationExamples,
      hasDryRunSupport,
      score
    };
  }

  /**
   * Extract sections from markdown content
   */
  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        // Save previous section
        if (currentSection) {
          sections[currentSection.toLowerCase()] = currentContent.join('\n');
        }
        
        // Start new section
        currentSection = line.replace(/^#+\s*/, '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection) {
      sections[currentSection.toLowerCase()] = currentContent.join('\n');
    }
    
    return sections;
  }

  /**
   * Get all template file paths for testing
   */
  getTemplatePaths(): string[] {
    return [...this.templatePaths, ...this.stagePaths];
  }

  /**
   * Check if all required template files exist
   */
  allTemplatesExist(): boolean {
    return this.getTemplatePaths().every(path => existsSync(path));
  }
}