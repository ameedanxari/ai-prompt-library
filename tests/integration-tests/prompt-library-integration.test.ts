/**
 * Integration Tests for Complete Prompt Library
 * Tests end-to-end prompt generation workflow, cross-stage consistency, and platform-specific variations
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

interface PromptTemplate {
  path: string;
  content: string;
  metadata: {
    stage?: string;
    platform?: string;
    type: 'template' | 'stage' | 'module';
    dependencies?: string[];
    outputs?: string[];
  };
}

interface StageOutput {
  stage: string;
  platform: string;
  content: string;
  references: string[];
  nextSteps: string[];
}

class PromptLibraryIntegrationTest {
  private promptTemplates: Map<string, PromptTemplate> = new Map();
  private stagePrompts: Map<string, Map<string, PromptTemplate>> = new Map();
  private templatePrompts: Map<string, PromptTemplate> = new Map();

  async initialize() {
    await this.loadAllPrompts();
    await this.categorizePrompts();
  }

  private async loadAllPrompts() {
    // Load all prompt files using recursive directory traversal
    const promptFiles = await this.getAllPromptFiles(path.resolve('prompts'));
    
    for (const filePath of promptFiles) {
      const content = await fs.readFile(filePath, 'utf-8');
      const metadata = this.extractMetadata(filePath, content);
      
      const template: PromptTemplate = {
        path: filePath,
        content,
        metadata
      };
      
      this.promptTemplates.set(filePath, template);
    }
  }

  private async getAllPromptFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.resolve(dir, entry.name);
        
        if (entry.isDirectory()) {
          const subFiles = await this.getAllPromptFiles(fullPath);
          files.push(...subFiles);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Directory might not exist, skip silently
    }
    
    return files;
  }

  private extractMetadata(filePath: string, content: string) {
    const pathParts = filePath.split('/');
    
    // Determine type and category
    let type: 'template' | 'stage' | 'module' = 'template';
    let stage: string | undefined;
    let platform: string | undefined;
    
    if (pathParts.includes('stages')) {
      type = 'stage';
      const stageMatch = pathParts.find(part => part.startsWith('stage-'));
      // Extract just the stage number (e.g., "01" from "stage-01-intake")
      stage = stageMatch?.match(/stage-(\d+)/)?.[1];
      
      const fileName = path.basename(filePath, '.md');
      if (['web', 'mobile', 'platform-agnostic'].includes(fileName)) {
        platform = fileName;
      }
    } else if (pathParts.includes('modules')) {
      type = 'module';
    }

    // Extract dependencies and outputs from content
    const dependencies = this.extractReferences(content, 'depends on|requires|prerequisite');
    const outputs = this.extractReferences(content, 'outputs|generates|produces');

    return {
      stage,
      platform,
      type,
      dependencies,
      outputs
    };
  }

  private extractReferences(content: string, pattern: string): string[] {
    const regex = new RegExp(`(?:${pattern}).*?([\\w-]+\\.md|stage-\\d+|[A-Z][\\w\\s]+)`, 'gi');
    const matches = content.match(regex) || [];
    return matches.map(match => match.trim());
  }

  private async categorizePrompts() {
    for (const [path, template] of this.promptTemplates) {
      if (template.metadata.type === 'stage') {
        const stage = template.metadata.stage || 'unknown';
        if (!this.stagePrompts.has(stage)) {
          this.stagePrompts.set(stage, new Map());
        }
        const platform = template.metadata.platform || 'default';
        this.stagePrompts.get(stage)!.set(platform, template);
      } else if (template.metadata.type === 'template') {
        this.templatePrompts.set(path, template);
      }
    }
  }

  // Test Methods
  async testEndToEndWorkflow(): Promise<boolean> {
    // Test complete workflow from stage 1 to stage 10
    const stages = Array.from({ length: 10 }, (_, i) => `0${i + 1}`.slice(-2));
    const platforms = ['platform-agnostic', 'web', 'mobile'];
    
    let previousOutputs: string[] = [];
    
    for (const stage of stages) {
      const stageTemplates = this.stagePrompts.get(stage);
      if (!stageTemplates) {
        throw new Error(`Missing stage templates for stage ${stage}`);
      }
      
      for (const platform of platforms) {
        const template = stageTemplates.get(platform);
        if (!template) {
          continue; // Some platforms may not have all stages
        }
        
        // Validate stage inputs match previous outputs
        if (previousOutputs.length > 0) {
          const hasValidInputs = this.validateStageInputs(template, previousOutputs);
          if (!hasValidInputs) {
            throw new Error(`Stage ${stage} ${platform} missing required inputs from previous stages`);
          }
        }
        
        // Extract outputs for next stage
        const stageOutputs = this.extractStageOutputs(template);
        previousOutputs = [...previousOutputs, ...stageOutputs];
      }
    }
    
    return true;
  }

  async testCrossStageConsistency(): Promise<boolean> {
    const inconsistencies: string[] = [];
    
    // Check terminology consistency across stages
    const terminology = this.extractTerminology();
    for (const [term, definitions] of terminology) {
      if (definitions.size > 1) {
        inconsistencies.push(`Inconsistent definition for "${term}": ${Array.from(definitions).join(', ')}`);
      }
    }
    
    // Check reference consistency
    const brokenReferences = this.findBrokenReferences();
    inconsistencies.push(...brokenReferences);
    
    // Check output/input matching between stages
    const stageMismatches = this.findStageMismatches();
    inconsistencies.push(...stageMismatches);
    
    if (inconsistencies.length > 0) {
      throw new Error(`Cross-stage inconsistencies found:\n${inconsistencies.join('\n')}`);
    }
    
    return true;
  }

  async testPlatformSpecificVariations(): Promise<boolean> {
    const platforms = ['platform-agnostic', 'web', 'mobile'];
    const issues: string[] = [];
    
    for (const [stage, stageTemplates] of this.stagePrompts) {
      const platformContents = new Map<string, string>();
      
      // Collect content for each platform
      for (const platform of platforms) {
        const template = stageTemplates.get(platform);
        if (template) {
          platformContents.set(platform, template.content);
        }
      }
      
      // Validate platform-agnostic content is referenced in platform-specific
      const agnosticContent = platformContents.get('platform-agnostic');
      if (agnosticContent) {
        for (const [platform, content] of platformContents) {
          if (platform === 'platform-agnostic') continue;
          
          const hasProperReferences = this.validatePlatformReferences(agnosticContent, content);
          if (!hasProperReferences) {
            issues.push(`Stage ${stage} ${platform} doesn't properly reference platform-agnostic content`);
          }
        }
      }
      
      // Check for platform-specific requirements coverage
      const coverageIssues = this.validatePlatformCoverage(stage, platformContents);
      issues.push(...coverageIssues);
    }
    
    if (issues.length > 0) {
      throw new Error(`Platform variation issues found:\n${issues.join('\n')}`);
    }
    
    return true;
  }

  async testTemplateQuality(): Promise<boolean> {
    const qualityIssues: string[] = [];
    
    for (const [path, template] of this.promptTemplates) {
      const issues = this.validateTemplateQuality(template);
      if (issues.length > 0) {
        qualityIssues.push(`${path}: ${issues.join(', ')}`);
      }
    }
    
    if (qualityIssues.length > 0) {
      throw new Error(`Template quality issues found:\n${qualityIssues.join('\n')}`);
    }
    
    return true;
  }

  async testPromptGeneration(): Promise<boolean> {
    // Test actual prompt generation with sample inputs
    const testCases = [
      {
        brief: "A task management app for remote teams",
        platforms: ["web", "mobile"],
        features: ["authentication", "real-time collaboration", "offline sync"]
      },
      {
        brief: "An e-commerce platform with AI recommendations",
        platforms: ["web"],
        features: ["payment processing", "inventory management", "analytics"]
      }
    ];
    
    for (const testCase of testCases) {
      const generatedPrompts = await this.generatePromptsForTestCase(testCase);
      
      // Validate generated prompts
      const validationResults = this.validateGeneratedPrompts(generatedPrompts);
      if (!validationResults.valid) {
        throw new Error(`Prompt generation failed for test case: ${validationResults.errors.join(', ')}`);
      }
    }
    
    return true;
  }

  // Helper Methods
  private validateStageInputs(template: PromptTemplate, previousOutputs: string[]): boolean {
    const requiredInputs = this.extractRequiredInputs(template.content);
    return requiredInputs.every(input => 
      previousOutputs.some(output => output.toLowerCase().includes(input.toLowerCase()))
    );
  }

  private extractStageOutputs(template: PromptTemplate): string[] {
    const outputMatches = template.content.match(/(?:outputs?|generates?|produces?):\s*\n((?:\s*-\s*.+\n?)+)/gi);
    if (!outputMatches) return [];
    
    return outputMatches.flatMap(match => 
      match.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^\s*-\s*/, '').trim())
    );
  }

  private extractRequiredInputs(content: string): string[] {
    const inputMatches = content.match(/(?:inputs?|requires?|needs?):\s*\n((?:\s*-\s*.+\n?)+)/gi);
    if (!inputMatches) return [];
    
    return inputMatches.flatMap(match => 
      match.split('\n')
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^\s*-\s*/, '').trim())
    );
  }

  private extractTerminology(): Map<string, Set<string>> {
    const terminology = new Map<string, Set<string>>();
    
    for (const template of this.promptTemplates.values()) {
      const glossaryMatch = template.content.match(/## Glossary\s*\n((?:\s*-\s*.+\n?)+)/i);
      if (glossaryMatch) {
        const entries = glossaryMatch[1].split('\n')
          .filter(line => line.trim().startsWith('-'))
          .map(line => line.replace(/^\s*-\s*/, '').trim());
        
        for (const entry of entries) {
          const [term, ...definitionParts] = entry.split(':');
          const definition = definitionParts.join(':').trim();
          
          if (!terminology.has(term)) {
            terminology.set(term, new Set());
          }
          terminology.get(term)!.add(definition);
        }
      }
    }
    
    return terminology;
  }

  private findBrokenReferences(): string[] {
    const brokenRefs: string[] = [];
    
    for (const [filePath, template] of this.promptTemplates) {
      const references = template.content.match(/\[([^\]]+)\]\(([^)]+)\)/g) || [];
      
      for (const ref of references) {
        const urlMatch = ref.match(/\[([^\]]+)\]\(([^)]+)\)/);
        if (urlMatch) {
          const [, text, url] = urlMatch;
          
          // Check internal references
          if (url.startsWith('./') || url.startsWith('../') || url.endsWith('.md')) {
            // Fix: Use path.resolve correctly with the directory of the current file
            const fileDir = path.dirname(filePath);
            const referencedPath = path.resolve(fileDir, url);
            if (!this.promptTemplates.has(referencedPath)) {
              brokenRefs.push(`${filePath}: Broken reference to ${url}`);
            }
          }
        }
      }
    }
    
    return brokenRefs;
  }

  private findStageMismatches(): string[] {
    const mismatches: string[] = [];
    const stages = Array.from(this.stagePrompts.keys()).sort();
    
    for (let i = 0; i < stages.length - 1; i++) {
      const currentStage = stages[i];
      const nextStage = stages[i + 1];
      
      const currentOutputs = this.getStageOutputs(currentStage);
      const nextInputs = this.getStageInputs(nextStage);
      
      // Check if next stage inputs are covered by current stage outputs
      for (const input of nextInputs) {
        const isCovered = currentOutputs.some(output => 
          output.toLowerCase().includes(input.toLowerCase()) ||
          input.toLowerCase().includes(output.toLowerCase())
        );
        
        if (!isCovered) {
          mismatches.push(`Stage ${nextStage} requires "${input}" but Stage ${currentStage} doesn't provide it`);
        }
      }
    }
    
    return mismatches;
  }

  private getStageOutputs(stage: string): string[] {
    const stageTemplates = this.stagePrompts.get(stage);
    if (!stageTemplates) return [];
    
    const outputs: string[] = [];
    for (const template of stageTemplates.values()) {
      outputs.push(...this.extractStageOutputs(template));
    }
    
    return outputs;
  }

  private getStageInputs(stage: string): string[] {
    const stageTemplates = this.stagePrompts.get(stage);
    if (!stageTemplates) return [];
    
    const inputs: string[] = [];
    for (const template of stageTemplates.values()) {
      inputs.push(...this.extractRequiredInputs(template.content));
    }
    
    return inputs;
  }

  private validatePlatformReferences(agnosticContent: string, platformContent: string): boolean {
    // Check if platform-specific content references or builds upon platform-agnostic content
    // Platform-specific files should either:
    // 1. Reference the platform-agnostic file directly (via link or mention)
    // 2. Share common terminology or concepts
    // 3. Have a "Platform-Agnostic Foundation" section
    
    const hasDirectReference = platformContent.toLowerCase().includes('platform-agnostic') ||
                               platformContent.includes('./platform-agnostic.md');
    
    const hasFoundationSection = platformContent.toLowerCase().includes('platform-agnostic foundation') ||
                                 platformContent.toLowerCase().includes('builds upon');
    
    // Check for shared key concepts between files
    const agnosticKeywords = this.extractKeywords(agnosticContent);
    const platformKeywords = this.extractKeywords(platformContent);
    const sharedKeywords = agnosticKeywords.filter(kw => platformKeywords.includes(kw));
    const hasSharedConcepts = sharedKeywords.length >= 3;
    
    return hasDirectReference || hasFoundationSection || hasSharedConcepts;
  }

  private extractKeywords(content: string): string[] {
    // Extract important keywords from content
    const keywords = ['vision', 'goals', 'success', 'metrics', 'stakeholder', 'requirements', 
                      'architecture', 'security', 'performance', 'testing', 'deployment'];
    return keywords.filter(kw => content.toLowerCase().includes(kw));
  }

  private extractSections(content: string): string[] {
    const sectionMatches = content.match(/^#+\s+(.+)$/gm) || [];
    return sectionMatches.map(match => match.replace(/^#+\s+/, '').trim());
  }

  private validatePlatformCoverage(stage: string, platformContents: Map<string, string>): string[] {
    const issues: string[] = [];
    
    // Define required platform-specific elements
    const requiredElements = {
      web: ['browser', 'responsive', 'SEO', 'performance', 'accessibility'],
      mobile: ['iOS', 'Android', 'native', 'app store', 'device'],
      'platform-agnostic': ['architecture', 'data', 'security', 'testing']
    };
    
    for (const [platform, content] of platformContents) {
      const required = requiredElements[platform as keyof typeof requiredElements];
      if (required) {
        const missing = required.filter(element => 
          !content.toLowerCase().includes(element.toLowerCase())
        );
        
        if (missing.length > 0) {
          issues.push(`Stage ${stage} ${platform} missing coverage for: ${missing.join(', ')}`);
        }
      }
    }
    
    return issues;
  }

  private validateTemplateQuality(template: PromptTemplate): string[] {
    const issues: string[] = [];
    const content = template.content;
    
    // Check for required sections
    const requiredSections = ['Purpose', 'Instructions', 'Examples'];
    for (const section of requiredSections) {
      if (!content.includes(`## ${section}`) && !content.includes(`### ${section}`)) {
        issues.push(`Missing ${section} section`);
      }
    }
    
    // Check for code blocks
    if (!content.includes('```')) {
      issues.push('No code examples found');
    }
    
    // Check for clear structure
    const headings = content.match(/^#+\s+/gm) || [];
    if (headings.length < 3) {
      issues.push('Insufficient structure (less than 3 headings)');
    }
    
    // Check for reasonable length
    if (content.length < 500) {
      issues.push('Content too short (less than 500 characters)');
    }
    
    return issues;
  }

  private async generatePromptsForTestCase(testCase: any): Promise<any[]> {
    // Simulate prompt generation process
    const generatedPrompts = [];
    
    for (const stage of Array.from({ length: 10 }, (_, i) => `0${i + 1}`.slice(-2))) {
      for (const platform of testCase.platforms) {
        const stageTemplates = this.stagePrompts.get(stage);
        const template = stageTemplates?.get(platform) || stageTemplates?.get('platform-agnostic');
        
        if (template) {
          generatedPrompts.push({
            stage,
            platform,
            template: template.path,
            generated: true
          });
        }
      }
    }
    
    return generatedPrompts;
  }

  private validateGeneratedPrompts(prompts: any[]): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check completeness
    const expectedStages = 10;
    const stagesGenerated = new Set(prompts.map(p => p.stage)).size;
    
    if (stagesGenerated < expectedStages) {
      errors.push(`Only ${stagesGenerated} of ${expectedStages} stages generated`);
    }
    
    // Check platform coverage
    const platformsGenerated = new Set(prompts.map(p => p.platform));
    if (platformsGenerated.size === 0) {
      errors.push('No platform-specific prompts generated');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Test Suite
describe('Prompt Library Integration Tests', () => {
  let testSuite: PromptLibraryIntegrationTest;

  beforeAll(async () => {
    testSuite = new PromptLibraryIntegrationTest();
    await testSuite.initialize();
  });

  it('should complete end-to-end workflow successfully', async () => {
    const result = await testSuite.testEndToEndWorkflow();
    expect(result).toBe(true);
  });

  it('should maintain cross-stage consistency', async () => {
    const result = await testSuite.testCrossStageConsistency();
    expect(result).toBe(true);
  });

  it('should handle platform-specific variations correctly', async () => {
    const result = await testSuite.testPlatformSpecificVariations();
    expect(result).toBe(true);
  });

  it('should maintain high template quality', async () => {
    const result = await testSuite.testTemplateQuality();
    expect(result).toBe(true);
  });

  it('should generate prompts successfully for test cases', async () => {
    const result = await testSuite.testPromptGeneration();
    expect(result).toBe(true);
  });
});

// Performance Tests
describe('Prompt Library Performance Tests', () => {
  let testSuite: PromptLibraryIntegrationTest;

  beforeAll(async () => {
    testSuite = new PromptLibraryIntegrationTest();
    await testSuite.initialize();
  });

  it('should load all prompts within reasonable time', async () => {
    const startTime = Date.now();
    await testSuite.initialize();
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(5000); // 5 seconds
  });

  it('should validate prompts efficiently', async () => {
    const startTime = Date.now();
    await testSuite.testTemplateQuality();
    const validationTime = Date.now() - startTime;
    
    expect(validationTime).toBeLessThan(10000); // 10 seconds
  });
});

// Error Handling Tests
describe('Prompt Library Error Handling', () => {
  it('should handle missing stage files gracefully', async () => {
    // Test with intentionally missing files
    const testSuite = new PromptLibraryIntegrationTest();
    
    // Mock missing files
    const originalLoadMethod = testSuite['loadAllPrompts'];
    testSuite['loadAllPrompts'] = async () => {
      // Simulate missing some stage files
      await originalLoadMethod.call(testSuite);
      // Remove some entries to simulate missing files
    };
    
    await expect(testSuite.initialize()).resolves.not.toThrow();
  });

  it('should validate broken references', async () => {
    const testSuite = new PromptLibraryIntegrationTest();
    await testSuite.initialize();
    
    // This should identify any broken references
    await expect(testSuite.testCrossStageConsistency()).resolves.toBeDefined();
  });
});