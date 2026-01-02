import { readFileSync } from 'fs';
import { join } from 'path';

export interface ImplementationPromptRequest {
  featureName: string;
  specifications: {
    requirements?: string;
    design?: string;
    api?: string;
    dataModels?: string;
  };
  assets: {
    designs?: string[];
    userFlows?: string[];
    testData?: string[];
    configurations?: string[];
  };
  dependencies: {
    prerequisites?: string[];
    externalServices?: string[];
    libraries?: string[];
    infrastructure?: string[];
  };
  technologyContext: {
    language: string;
    framework: string;
    platform: string;
    architecture: string;
    database?: string;
  };
  tokenBudget: 'low' | 'medium' | 'high';
  dryRun?: boolean;
}

export interface ImplementationPromptResult {
  prompt: string;
  contextLinks: string[];
  expectedOutputs: string[];
  completionCriteria: string[];
  validationSteps: string[];
  tokenEstimate: number;
  chunkingStrategy?: string;
  qualityGates: string[];
}

export interface TokenChunkingResult {
  chunks: {
    id: string;
    name: string;
    tokenBudget: number;
    scope: string;
    dependencies: string[];
    deliverables: string[];
  }[];
  totalEstimate: number;
  contextPreservation: string[];
}

export class ImplementationPromptProcessor {
  private implementationTemplate: string;
  private featureTemplate: string;
  private chunkingTemplate: string;
  private dryRunTemplate: string;

  constructor() {
    this.implementationTemplate = readFileSync(
      join(process.cwd(), 'prompts/templates/implementation-prompt-generation.md'), 
      'utf-8'
    );
    this.featureTemplate = readFileSync(
      join(process.cwd(), 'prompts/templates/feature-implementation-prompt.md'), 
      'utf-8'
    );
    this.chunkingTemplate = readFileSync(
      join(process.cwd(), 'prompts/templates/token-chunking-validation.md'), 
      'utf-8'
    );
    this.dryRunTemplate = readFileSync(
      join(process.cwd(), 'prompts/templates/implementation-dry-run.md'), 
      'utf-8'
    );
  }

  generateImplementationPrompt(request: ImplementationPromptRequest): ImplementationPromptResult {
    // Generate feature-specific implementation prompt
    const contextLinks = this.generateContextLinks(request);
    const expectedOutputs = this.generateExpectedOutputs(request);
    const completionCriteria = this.generateCompletionCriteria(request);
    const validationSteps = this.generateValidationSteps(request);
    const qualityGates = this.generateQualityGates(request);
    
    // Estimate token requirements
    const tokenEstimate = this.estimateTokenRequirements(request);
    
    // Determine chunking strategy if needed
    const chunkingStrategy = tokenEstimate > 4000 ? 
      this.determineChunkingStrategy(request, tokenEstimate) : undefined;
    
    // Generate the actual prompt
    const prompt = this.buildPromptContent(request, {
      contextLinks,
      expectedOutputs,
      completionCriteria,
      validationSteps,
      qualityGates,
      chunkingStrategy
    });

    return {
      prompt,
      contextLinks,
      expectedOutputs,
      completionCriteria,
      validationSteps,
      tokenEstimate,
      chunkingStrategy,
      qualityGates
    };
  }

  generateTokenChunking(request: ImplementationPromptRequest): TokenChunkingResult {
    const totalEstimate = this.estimateTokenRequirements(request);
    
    if (totalEstimate <= 4000) {
      // No chunking needed
      return {
        chunks: [{
          id: 'single-chunk',
          name: `Implement ${request.featureName}`,
          tokenBudget: totalEstimate,
          scope: 'Complete feature implementation',
          dependencies: [],
          deliverables: this.generateExpectedOutputs(request)
        }],
        totalEstimate,
        contextPreservation: []
      };
    }

    // Determine chunking strategy based on complexity
    const strategy = this.determineChunkingStrategy(request, totalEstimate);
    const chunks = this.createChunks(request, strategy, totalEstimate);
    const contextPreservation = this.generateContextPreservation(chunks);

    return {
      chunks,
      totalEstimate,
      contextPreservation
    };
  }

  validateImplementationReadiness(request: ImplementationPromptRequest): {
    isReady: boolean;
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Check specifications completeness (3 points max)
    if (request.specifications.requirements) score += 1;
    else issues.push('Missing requirements specification');
    
    if (request.specifications.design) score += 1;
    else issues.push('Missing design specification');
    
    if (request.specifications.api || request.specifications.dataModels) score += 1;
    else issues.push('Missing API or data model specifications');

    // Check dependencies availability (3 points max)
    if (request.dependencies.prerequisites && request.dependencies.prerequisites.length > 0) score += 1;
    else recommendations.push('Consider documenting prerequisite components');
    
    if (request.dependencies.libraries && request.dependencies.libraries.length > 0) score += 1;
    else recommendations.push('Specify required third-party libraries');
    
    if (request.technologyContext.language && request.technologyContext.framework) score += 1;
    else issues.push('Technology context is incomplete');

    // Check technology context (3 points max)
    const supportedLanguages = ['TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C#'];
    if (supportedLanguages.includes(request.technologyContext.language)) score += 1;
    else issues.push(`Unsupported language: ${request.technologyContext.language}`);
    
    if (request.technologyContext.framework) score += 1;
    else issues.push('Framework not specified');
    
    if (request.technologyContext.platform) score += 1;
    else issues.push('Target platform not specified');

    // Check assets and resources (3 points max)
    const hasAssets = Object.values(request.assets).some(arr => arr && arr.length > 0);
    if (hasAssets) score += 1;
    else recommendations.push('Consider providing design assets or test data');
    
    if (request.featureName && request.featureName.length > 0) score += 1;
    else issues.push('Feature name is required');
    
    if (request.tokenBudget) score += 1;
    else issues.push('Token budget must be specified');

    // Check quality requirements (3 points max)
    if (this.hasSecurityRequirements(request)) score += 1;
    else recommendations.push('Consider security requirements');
    
    if (this.hasPerformanceRequirements(request)) score += 1;
    else recommendations.push('Consider performance requirements');
    
    if (this.hasAccessibilityRequirements(request)) score += 1;
    else recommendations.push('Consider accessibility requirements');

    const isReady = score >= 12; // 80% threshold
    
    return {
      isReady,
      score,
      issues,
      recommendations
    };
  }

  private generateContextLinks(request: ImplementationPromptRequest): string[] {
    const links: string[] = [];
    
    if (request.specifications.requirements) {
      links.push(`Requirements: ${request.specifications.requirements}`);
    }
    if (request.specifications.design) {
      links.push(`Design: ${request.specifications.design}`);
    }
    if (request.specifications.api) {
      links.push(`API Specification: ${request.specifications.api}`);
    }
    if (request.specifications.dataModels) {
      links.push(`Data Models: ${request.specifications.dataModels}`);
    }
    
    // Add asset links
    Object.entries(request.assets).forEach(([type, assets]) => {
      if (assets && assets.length > 0) {
        assets.forEach(asset => links.push(`${type}: ${asset}`));
      }
    });
    
    // Always include technology context as a minimum
    if (links.length === 0) {
      links.push(`Technology Context: ${request.technologyContext.language} with ${request.technologyContext.framework} for ${request.technologyContext.platform}`);
    }
    
    return links;
  }

  private generateExpectedOutputs(request: ImplementationPromptRequest): string[] {
    const outputs: string[] = [];
    
    // Primary deliverables based on technology context
    if (request.technologyContext.platform === 'web') {
      outputs.push('React/Vue/Angular components');
      outputs.push('CSS/SCSS styling files');
      outputs.push('State management implementation');
    } else if (request.technologyContext.platform === 'mobile') {
      outputs.push('Native/React Native screens');
      outputs.push('Navigation configuration');
      outputs.push('Platform-specific optimizations');
    } else if (request.technologyContext.platform === 'backend') {
      outputs.push('API endpoints and controllers');
      outputs.push('Business logic services');
      outputs.push('Database models and migrations');
    }
    
    // Common outputs
    outputs.push('Unit tests for core functionality');
    outputs.push('Integration tests for API endpoints');
    outputs.push('Configuration files');
    outputs.push('Documentation updates');
    
    return outputs;
  }

  private generateCompletionCriteria(request: ImplementationPromptRequest): string[] {
    return [
      'All functional requirements implemented',
      'Core user flows work end-to-end',
      'Security requirements met',
      'Performance criteria satisfied',
      'All tests pass with adequate coverage',
      'Code follows project conventions',
      'Documentation is complete and accurate',
      'Quality gates pass (linting, security scans)',
      'Integration points validated',
      'Error handling covers edge cases'
    ];
  }

  private generateValidationSteps(request: ImplementationPromptRequest): string[] {
    return [
      'Syntax validation: Code compiles without errors',
      'Functional testing: All acceptance criteria met',
      'Integration testing: Compatible with existing components',
      'Security validation: No critical vulnerabilities',
      'Performance testing: Meets benchmark requirements',
      'Accessibility testing: WCAG 2.1 AA compliance',
      'Cross-platform testing: Consistent behavior',
      'Documentation review: Complete and accurate'
    ];
  }

  private generateQualityGates(request: ImplementationPromptRequest): string[] {
    return [
      'Code coverage > 80%',
      'No critical security vulnerabilities',
      'Performance benchmarks met',
      'Accessibility compliance verified',
      'All tests pass',
      'Code review approved',
      'Documentation complete',
      'Integration tests pass'
    ];
  }

  private estimateTokenRequirements(request: ImplementationPromptRequest): number {
    let estimate = 1000; // Base complexity
    
    // Add complexity based on specifications
    if (request.specifications.requirements) estimate += 500;
    if (request.specifications.design) estimate += 500;
    if (request.specifications.api) estimate += 800;
    if (request.specifications.dataModels) estimate += 600;
    
    // Add complexity based on dependencies
    const depCount = Object.values(request.dependencies).flat().length;
    estimate += depCount * 100;
    
    // Add complexity based on platform
    if (request.technologyContext.platform === 'web') estimate += 1000;
    else if (request.technologyContext.platform === 'mobile') estimate += 1200;
    else if (request.technologyContext.platform === 'backend') estimate += 800;
    
    // Adjust based on token budget preference
    if (request.tokenBudget === 'high') estimate *= 1.5;
    else if (request.tokenBudget === 'low') estimate *= 0.7;
    
    return Math.round(estimate);
  }

  private determineChunkingStrategy(request: ImplementationPromptRequest, totalTokens: number): string {
    if (request.technologyContext.platform === 'web' || request.technologyContext.platform === 'mobile') {
      return 'layer-based'; // UI, Business Logic, Data
    } else if (totalTokens > 8000) {
      return 'feature-based'; // Break into sub-features
    } else {
      return 'phase-based'; // MVP, Enhanced, Optimization
    }
  }

  private createChunks(request: ImplementationPromptRequest, strategy: string, totalTokens: number): TokenChunkingResult['chunks'] {
    const chunks: TokenChunkingResult['chunks'] = [];
    const numChunks = Math.ceil(totalTokens / 3500);
    const budgetPerChunk = Math.max(500, Math.floor(totalTokens / numChunks)); // Minimum 500 tokens per chunk
    
    if (strategy === 'layer-based') {
      chunks.push({
        id: 'data-layer',
        name: 'Data Layer Implementation',
        tokenBudget: budgetPerChunk,
        scope: 'Database models, schemas, migrations',
        dependencies: [],
        deliverables: ['Database schema', 'Model classes', 'Migration scripts']
      });
      
      chunks.push({
        id: 'business-layer',
        name: 'Business Logic Layer',
        tokenBudget: budgetPerChunk,
        scope: 'Core business logic and services',
        dependencies: ['data-layer'],
        deliverables: ['Service classes', 'Business rules', 'Validation logic']
      });
      
      chunks.push({
        id: 'presentation-layer',
        name: 'Presentation Layer',
        tokenBudget: Math.max(500, totalTokens - (budgetPerChunk * 2)), // Remainder goes to last chunk, minimum 500
        scope: 'User interface and interactions',
        dependencies: ['business-layer'],
        deliverables: ['UI components', 'State management', 'User interactions']
      });
    } else if (strategy === 'feature-based') {
      chunks.push({
        id: 'core-foundation',
        name: 'Core Feature Foundation',
        tokenBudget: budgetPerChunk,
        scope: 'Essential functionality for other features',
        dependencies: [],
        deliverables: ['Core models', 'Base services', 'Common utilities']
      });
      
      chunks.push({
        id: 'main-feature',
        name: 'Main Feature Implementation',
        tokenBudget: budgetPerChunk,
        scope: 'Primary user workflow',
        dependencies: ['core-foundation'],
        deliverables: ['Feature components', 'Business logic', 'API endpoints']
      });
      
      chunks.push({
        id: 'integration',
        name: 'Integration and Polish',
        tokenBudget: Math.max(500, totalTokens - (budgetPerChunk * 2)), // Remainder goes to last chunk, minimum 500
        scope: 'Connect components and optimize',
        dependencies: ['main-feature'],
        deliverables: ['Integration tests', 'Performance optimization', 'Documentation']
      });
    } else { // phase-based
      chunks.push({
        id: 'mvp',
        name: 'MVP Implementation',
        tokenBudget: budgetPerChunk,
        scope: 'Minimum viable functionality',
        dependencies: [],
        deliverables: ['Core user flow', 'Basic UI', 'Essential APIs']
      });
      
      chunks.push({
        id: 'enhanced',
        name: 'Enhanced Functionality',
        tokenBudget: budgetPerChunk,
        scope: 'Additional features and improvements',
        dependencies: ['mvp'],
        deliverables: ['Advanced features', 'Improved UX', 'Additional APIs']
      });
      
      chunks.push({
        id: 'production',
        name: 'Production Readiness',
        tokenBudget: Math.max(500, totalTokens - (budgetPerChunk * 2)), // Remainder goes to last chunk, minimum 500
        scope: 'Optimization and deployment prep',
        dependencies: ['enhanced'],
        deliverables: ['Performance optimization', 'Security hardening', 'Deployment config']
      });
    }
    
    return chunks;
  }

  private generateContextPreservation(chunks: TokenChunkingResult['chunks']): string[] {
    return [
      'Document interfaces between chunks',
      'Maintain consistent naming conventions',
      'Preserve architectural decisions',
      'Track state changes across chunks',
      'Maintain error handling patterns'
    ];
  }

  private buildPromptContent(request: ImplementationPromptRequest, components: any): string {
    // This would use the templates to build the actual prompt
    // For now, return a structured prompt based on the template
    return `# Implement Feature: ${request.featureName}

## Context and References
${components.contextLinks.map((link: string) => `- ${link}`).join('\n')}

## Technology Context
- Language: ${request.technologyContext.language}
- Framework: ${request.technologyContext.framework}
- Platform: ${request.technologyContext.platform}
- Architecture: ${request.technologyContext.architecture}

## Expected Deliverables
${components.expectedOutputs.map((output: string) => `- [ ] ${output}`).join('\n')}

## Completion Criteria
${components.completionCriteria.map((criteria: string) => `- [ ] ${criteria}`).join('\n')}

## Validation Steps
${components.validationSteps.map((step: string, index: number) => `${index + 1}. ${step}`).join('\n')}

## Quality Gates
${components.qualityGates.map((gate: string) => `- [ ] ${gate}`).join('\n')}

${components.chunkingStrategy ? `## Chunking Strategy: ${components.chunkingStrategy}` : ''}

## Token Budget: ${request.tokenBudget.toUpperCase()}
Estimated complexity: ${this.estimateTokenRequirements(request)} tokens
`;
  }

  private hasSecurityRequirements(request: ImplementationPromptRequest): boolean {
    const specs = Object.values(request.specifications).join(' ').toLowerCase();
    return specs.includes('security') || specs.includes('authentication') || specs.includes('authorization');
  }

  private hasPerformanceRequirements(request: ImplementationPromptRequest): boolean {
    const specs = Object.values(request.specifications).join(' ').toLowerCase();
    return specs.includes('performance') || specs.includes('speed') || specs.includes('optimization');
  }

  private hasAccessibilityRequirements(request: ImplementationPromptRequest): boolean {
    const specs = Object.values(request.specifications).join(' ').toLowerCase();
    return specs.includes('accessibility') || specs.includes('wcag') || specs.includes('a11y');
  }

  // Validate that implementation prompt generation meets requirements 9.1-9.5
  validateRequirements(request: ImplementationPromptRequest): {
    requirement_9_1: boolean; // Feature-specific implementation prompts
    requirement_9_2: boolean; // Context links to specifications and assets
    requirement_9_3: boolean; // Expected outputs and completion criteria
    requirement_9_4: boolean; // Token chunking for large tasks
    requirement_9_5: boolean; // Validation steps and quality gates
  } {
    const result = this.generateImplementationPrompt(request);
    const chunking = this.generateTokenChunking(request);
    
    return {
      requirement_9_1: this.hasFeatureSpecificContent(result, request),
      requirement_9_2: this.hasContextLinks(result),
      requirement_9_3: this.hasOutputsAndCriteria(result),
      requirement_9_4: this.hasTokenChunking(chunking, result.tokenEstimate),
      requirement_9_5: this.hasValidationSteps(result)
    };
  }

  private hasFeatureSpecificContent(result: ImplementationPromptResult, request: ImplementationPromptRequest): boolean {
    return result.prompt.includes(request.featureName) &&
           result.prompt.includes(request.technologyContext.language) &&
           result.prompt.includes(request.technologyContext.platform);
  }

  private hasContextLinks(result: ImplementationPromptResult): boolean {
    // Context links requirement is met if we have any context links
    // Even if no specifications are provided, we should still have technology context
    return result.contextLinks.length > 0;
  }

  private hasOutputsAndCriteria(result: ImplementationPromptResult): boolean {
    return result.expectedOutputs.length > 0 &&
           result.completionCriteria.length > 0 &&
           result.expectedOutputs.length >= 3 &&
           result.completionCriteria.length >= 5;
  }

  private hasTokenChunking(chunking: TokenChunkingResult, tokenEstimate: number): boolean {
    if (tokenEstimate <= 4000) {
      return chunking.chunks.length === 1; // No chunking needed
    } else {
      return chunking.chunks.length > 1 && // Multiple chunks for large tasks
             chunking.contextPreservation.length > 0; // Context preservation strategy
    }
  }

  private hasValidationSteps(result: ImplementationPromptResult): boolean {
    return result.validationSteps.length >= 5 &&
           result.qualityGates.length >= 5 &&
           result.validationSteps.some(step => step.includes('testing')) &&
           result.qualityGates.some(gate => gate.includes('coverage'));
  }
}