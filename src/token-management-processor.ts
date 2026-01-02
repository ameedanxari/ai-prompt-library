/**
 * Token Management Processor
 * 
 * Processes and validates token usage management templates and configurations
 * to ensure proper token budget allocation, usage level compliance, and cost optimization.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface TokenManagementStructure {
  hasTokenUsageLevels: boolean;
  hasDryRunCapabilities: boolean;
  hasBudgetAllocation: boolean;
  hasLowUsageLevel: boolean;
  hasMediumUsageLevel: boolean;
  hasHighUsageLevel: boolean;
  hasValidationDepthAdjustment: boolean;
  hasCostOptimization: boolean;
  hasUsageLevelCommunication: boolean;
  hasTradeOffDocumentation: boolean;
  hasBudgetTracking: boolean;
  hasOptimizationStrategies: boolean;
  hasRealTimeMonitoring: boolean;
  hasAutomaticOptimizations: boolean;
  hasBudgetReallocation: boolean;
}

export interface TokenManagementRequirements {
  requirement_14_1: boolean; // Dry run mode that generates abbreviated specifications for validation
  requirement_14_2: boolean; // Summary outputs with key decisions and assumptions in dry run mode
  requirement_14_3: boolean; // Validation of stage outputs before proceeding to resource-intensive implementation
  requirement_14_4: boolean; // Estimation of token consumption for full specification generation
  requirement_14_5: boolean; // Iterative refinement of inputs based on dry run results
  requirement_14_6: boolean; // Three token usage levels: Low, Medium, and High
  requirement_14_7: boolean; // Low usage: generate specifications and delegate build/test responsibility to user
  requirement_14_8: boolean; // Medium usage: verification only at key checkpoints and major milestones
  requirement_14_9: boolean; // High usage: verify each functionality implementation with comprehensive tests
  requirement_14_10: boolean; // Clear communication of implications and trade-offs of each token usage level
}

export interface TokenManagementContent {
  usageLevelsSection: string;
  dryRunFrameworkSection: string;
  budgetAllocationSection: string;
  optimizationStrategiesSection: string;
  communicationTemplatesSection: string;
  monitoringSection: string;
  lowUsagePromptsSection: string;
  mediumUsagePromptsSection: string;
  highUsagePromptsSection: string;
  tradeOffAnalysisSection: string;
}

export class TokenManagementProcessor {
  private templatePaths: string[];

  constructor() {
    this.templatePaths = [
      'prompts/templates/token-usage-management.md',
      'prompts/templates/dry-run-framework.md',
      'prompts/templates/token-chunking-validation.md'
    ];
  }

  /**
   * Validates the structure of token management templates
   */
  validateTokenManagementStructure(): TokenManagementStructure {
    const structure: TokenManagementStructure = {
      hasTokenUsageLevels: false,
      hasDryRunCapabilities: false,
      hasBudgetAllocation: false,
      hasLowUsageLevel: false,
      hasMediumUsageLevel: false,
      hasHighUsageLevel: false,
      hasValidationDepthAdjustment: false,
      hasCostOptimization: false,
      hasUsageLevelCommunication: false,
      hasTradeOffDocumentation: false,
      hasBudgetTracking: false,
      hasOptimizationStrategies: false,
      hasRealTimeMonitoring: false,
      hasAutomaticOptimizations: false,
      hasBudgetReallocation: false
    };

    // Check all template files exist and have required content
    for (const templatePath of this.templatePaths) {
      if (!existsSync(templatePath)) {
        continue;
      }

      const content = readFileSync(templatePath, 'utf-8').toLowerCase();
      
      // Check for token usage levels
      if (content.includes('token usage level') && content.includes('low') && content.includes('medium') && content.includes('high')) {
        structure.hasTokenUsageLevels = true;
      }
      
      // Check for dry run capabilities
      if (content.includes('dry run') && content.includes('validation') && content.includes('abbreviated')) {
        structure.hasDryRunCapabilities = true;
      }
      
      // Check for budget allocation
      if (content.includes('budget allocation') && content.includes('token budget') && content.includes('phase')) {
        structure.hasBudgetAllocation = true;
      }
      
      // Check for low usage level
      if (content.includes('low token usage') && content.includes('100-500 tokens') && content.includes('user responsibility')) {
        structure.hasLowUsageLevel = true;
      }
      
      // Check for medium usage level
      if (content.includes('medium token usage') && content.includes('500-2000 tokens') && content.includes('checkpoint validation')) {
        structure.hasMediumUsageLevel = true;
      }
      
      // Check for high usage level
      if (content.includes('high token usage') && content.includes('2000-5000 tokens') && content.includes('comprehensive verification')) {
        structure.hasHighUsageLevel = true;
      }
      
      // Check for validation depth adjustment
      if (content.includes('validation depth') && content.includes('adjust') && content.includes('budget')) {
        structure.hasValidationDepthAdjustment = true;
      }
      
      // Check for cost optimization
      if (content.includes('cost optimization') && content.includes('efficiency') && content.includes('template reuse')) {
        structure.hasCostOptimization = true;
      }
      
      // Check for usage level communication
      if (content.includes('usage level communication') && content.includes('when to choose') && content.includes('trade-off')) {
        structure.hasUsageLevelCommunication = true;
      }
      
      // Check for trade-off documentation
      if (content.includes('trade-off') && content.includes('advantages') && content.includes('limitations')) {
        structure.hasTradeOffDocumentation = true;
      }
      
      // Check for budget tracking
      if (content.includes('budget tracking') && content.includes('tokenbud') && content.includes('consumed')) {
        structure.hasBudgetTracking = true;
      }
      
      // Check for optimization strategies
      if (content.includes('optimization strategies') && content.includes('template reuse') && content.includes('incremental validation')) {
        structure.hasOptimizationStrategies = true;
      }
      
      // Check for real-time monitoring
      if (content.includes('real-time') && content.includes('monitoring') && content.includes('alert')) {
        structure.hasRealTimeMonitoring = true;
      }
      
      // Check for automatic optimizations
      if (content.includes('automatic optimization') && content.includes('context compression') && content.includes('validation reduction')) {
        structure.hasAutomaticOptimizations = true;
      }
      
      // Check for budget reallocation
      if (content.includes('budget reallocation') && content.includes('phase reallocation') && content.includes('priority')) {
        structure.hasBudgetReallocation = true;
      }
    }

    return structure;
  }

  /**
   * Validates requirements compliance for token management
   */
  validateTokenManagementRequirements(): TokenManagementRequirements {
    const structure = this.validateTokenManagementStructure();
    
    return {
      requirement_14_1: structure.hasDryRunCapabilities && structure.hasValidationDepthAdjustment,
      requirement_14_2: structure.hasDryRunCapabilities && structure.hasUsageLevelCommunication,
      requirement_14_3: structure.hasDryRunCapabilities && structure.hasBudgetAllocation,
      requirement_14_4: structure.hasBudgetTracking && structure.hasCostOptimization,
      requirement_14_5: structure.hasDryRunCapabilities && structure.hasOptimizationStrategies,
      requirement_14_6: structure.hasTokenUsageLevels && structure.hasLowUsageLevel && 
                        structure.hasMediumUsageLevel && structure.hasHighUsageLevel,
      requirement_14_7: structure.hasLowUsageLevel && structure.hasUsageLevelCommunication,
      requirement_14_8: structure.hasMediumUsageLevel && structure.hasValidationDepthAdjustment,
      requirement_14_9: structure.hasHighUsageLevel && structure.hasValidationDepthAdjustment,
      requirement_14_10: structure.hasUsageLevelCommunication && structure.hasTradeOffDocumentation
    };
  }

  /**
   * Extracts and validates token management content sections
   */
  extractTokenManagementContent(): TokenManagementContent {
    const content: TokenManagementContent = {
      usageLevelsSection: '',
      dryRunFrameworkSection: '',
      budgetAllocationSection: '',
      optimizationStrategiesSection: '',
      communicationTemplatesSection: '',
      monitoringSection: '',
      lowUsagePromptsSection: '',
      mediumUsagePromptsSection: '',
      highUsagePromptsSection: '',
      tradeOffAnalysisSection: ''
    };

    for (const templatePath of this.templatePaths) {
      if (!existsSync(templatePath)) {
        continue;
      }

      const fileContent = readFileSync(templatePath, 'utf-8');
      
      // Extract sections based on headers and content
      const sections = this.extractSections(fileContent);
      
      // Map sections to content structure
      if (sections['token usage level'] || sections['usage level definitions']) {
        content.usageLevelsSection = sections['token usage level'] || sections['usage level definitions'] || '';
      }
      
      if (sections['dry run'] || sections['dry run capabilities']) {
        content.dryRunFrameworkSection = sections['dry run'] || sections['dry run capabilities'] || '';
      }
      
      if (sections['budget allocation'] || sections['token budget allocation']) {
        content.budgetAllocationSection = sections['budget allocation'] || sections['token budget allocation'] || '';
      }
      
      if (sections['optimization strategies'] || sections['cost optimization']) {
        content.optimizationStrategiesSection = sections['optimization strategies'] || sections['cost optimization'] || '';
      }
      
      if (sections['usage level communication'] || sections['user communication']) {
        content.communicationTemplatesSection = sections['usage level communication'] || sections['user communication'] || '';
      }
      
      if (sections['monitoring'] || sections['budget tracking']) {
        content.monitoringSection = sections['monitoring'] || sections['budget tracking'] || '';
      }
      
      if (sections['low token usage'] || sections['level 1']) {
        content.lowUsagePromptsSection = sections['low token usage'] || sections['level 1'] || '';
      }
      
      if (sections['medium token usage'] || sections['level 2']) {
        content.mediumUsagePromptsSection = sections['medium token usage'] || sections['level 2'] || '';
      }
      
      if (sections['high token usage'] || sections['level 3']) {
        content.highUsagePromptsSection = sections['high token usage'] || sections['level 3'] || '';
      }
      
      if (sections['trade-off'] || sections['understanding trade-offs']) {
        content.tradeOffAnalysisSection = sections['trade-off'] || sections['understanding trade-offs'] || '';
      }
    }

    return content;
  }

  /**
   * Validates that token management has comprehensive coverage
   */
  validateComprehensiveTokenManagementCoverage(): boolean {
    const structure = this.validateTokenManagementStructure();
    const requirements = this.validateTokenManagementRequirements();
    
    // All structure elements must be present
    const structureComplete = Object.values(structure).every(value => value === true);
    
    // All requirements must be satisfied
    const requirementsComplete = Object.values(requirements).every(value => value === true);
    
    return structureComplete && requirementsComplete;
  }

  /**
   * Validates token management quality and completeness
   */
  validateTokenManagementQuality(): {
    isComplete: boolean;
    hasAllUsageLevels: boolean;
    hasDryRunSupport: boolean;
    hasBudgetManagement: boolean;
    hasOptimizationSupport: boolean;
    hasCommunicationGuidance: boolean;
    score: number;
  } {
    const structure = this.validateTokenManagementStructure();
    const content = this.extractTokenManagementContent();
    
    const hasAllUsageLevels = structure.hasLowUsageLevel &&
                             structure.hasMediumUsageLevel &&
                             structure.hasHighUsageLevel;
    
    const hasDryRunSupport = structure.hasDryRunCapabilities &&
                            content.dryRunFrameworkSection.length > 0;
    
    const hasBudgetManagement = structure.hasBudgetAllocation &&
                               structure.hasBudgetTracking &&
                               content.budgetAllocationSection.length > 0;
    
    const hasOptimizationSupport = structure.hasCostOptimization &&
                                  structure.hasOptimizationStrategies &&
                                  content.optimizationStrategiesSection.length > 0;
    
    const hasCommunicationGuidance = structure.hasUsageLevelCommunication &&
                                    structure.hasTradeOffDocumentation &&
                                    content.communicationTemplatesSection.length > 0;
    
    const isComplete = hasAllUsageLevels && hasDryRunSupport && 
                      hasBudgetManagement && hasOptimizationSupport;
    
    // Calculate quality score (0-100)
    let score = 0;
    if (hasAllUsageLevels) score += 25;
    if (hasDryRunSupport) score += 20;
    if (hasBudgetManagement) score += 20;
    if (hasOptimizationSupport) score += 20;
    if (hasCommunicationGuidance) score += 15;
    
    return {
      isComplete,
      hasAllUsageLevels,
      hasDryRunSupport,
      hasBudgetManagement,
      hasOptimizationSupport,
      hasCommunicationGuidance,
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
    return this.templatePaths;
  }

  /**
   * Check if all required template files exist
   */
  allTemplatesExist(): boolean {
    return this.getTemplatePaths().every(path => existsSync(path));
  }
}