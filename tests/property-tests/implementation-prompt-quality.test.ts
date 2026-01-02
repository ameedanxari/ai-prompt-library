import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { ImplementationPromptProcessor, ImplementationPromptRequest } from '../../src/implementation-prompt-processor.js';

/**
 * Feature: ai-prompt-library, Property 15: Implementation Prompt Quality
 * 
 * Property 15: For any generated implementation prompt, it should include context links, 
 * expected outputs, completion criteria, proper token chunking, and validation steps.
 * 
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

describe('Property-Based Tests: Implementation Prompt Quality', () => {
  const processor = new ImplementationPromptProcessor();

  // Generator for valid feature names
  const featureNameGenerator = fc.oneof(
    fc.string({ minLength: 5, maxLength: 30 }).map(s => `User ${s.slice(0, 15)} Management`),
    fc.string({ minLength: 5, maxLength: 30 }).map(s => `${s.slice(0, 15)} Dashboard`),
    fc.string({ minLength: 5, maxLength: 30 }).map(s => `${s.slice(0, 15)} API Integration`),
    fc.constantFrom(
      'Authentication System',
      'Payment Processing',
      'File Upload Manager',
      'Notification Service',
      'Search Functionality',
      'Data Analytics',
      'User Profile Management',
      'Content Management System'
    )
  );

  // Generator for technology contexts
  const technologyContextGenerator = fc.record({
    language: fc.constantFrom('TypeScript', 'JavaScript', 'Python', 'Java', 'Go', 'Rust', 'C#'),
    framework: fc.constantFrom('React', 'Vue', 'Angular', 'Express', 'FastAPI', 'Spring', 'Gin', 'Actix'),
    platform: fc.constantFrom('web', 'mobile', 'backend', 'desktop'),
    architecture: fc.constantFrom('microservices', 'monolithic', 'serverless', 'headless', 'jamstack'),
    database: fc.constantFrom('PostgreSQL', 'MongoDB', 'Redis', 'MySQL', 'DynamoDB')
  });

  // Generator for specifications
  const specificationsGenerator = fc.record({
    requirements: fc.option(fc.string({ minLength: 20, maxLength: 100 })),
    design: fc.option(fc.string({ minLength: 20, maxLength: 100 })),
    api: fc.option(fc.string({ minLength: 20, maxLength: 100 })),
    dataModels: fc.option(fc.string({ minLength: 20, maxLength: 100 }))
  });

  // Generator for assets
  const assetsGenerator = fc.record({
    designs: fc.option(fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 3 })),
    userFlows: fc.option(fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 3 })),
    testData: fc.option(fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 3 })),
    configurations: fc.option(fc.array(fc.string({ minLength: 10, maxLength: 50 }), { maxLength: 3 }))
  });

  // Generator for dependencies
  const dependenciesGenerator = fc.record({
    prerequisites: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 30 }), { maxLength: 5 })),
    externalServices: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 30 }), { maxLength: 5 })),
    libraries: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 30 }), { maxLength: 5 })),
    infrastructure: fc.option(fc.array(fc.string({ minLength: 5, maxLength: 30 }), { maxLength: 5 }))
  });

  // Generator for complete implementation prompt requests
  const implementationRequestGenerator = fc.record({
    featureName: featureNameGenerator,
    specifications: specificationsGenerator,
    assets: assetsGenerator,
    dependencies: dependenciesGenerator,
    technologyContext: technologyContextGenerator,
    tokenBudget: fc.constantFrom('low', 'medium', 'high'),
    dryRun: fc.option(fc.boolean())
  });

  it('Property 15: Implementation Prompt Quality - generates comprehensive prompts', () => {
    fc.assert(
      fc.property(
        implementationRequestGenerator,
        (request) => {
          // For any implementation request, the generated prompt should be comprehensive
          const result = processor.generateImplementationPrompt(request);
          const requirements = processor.validateRequirements(request);
          
          // Property assertion: All implementation prompts should be comprehensive
          expect(result.prompt).toBeDefined();
          expect(result.prompt.length).toBeGreaterThan(100);
          expect(result.prompt).toContain(request.featureName);
          
          // Should include context links (Requirement 9.2)
          expect(result.contextLinks).toBeDefined();
          expect(Array.isArray(result.contextLinks)).toBe(true);
          expect(requirements.requirement_9_2).toBe(true);
          
          // Should include expected outputs (Requirement 9.3)
          expect(result.expectedOutputs).toBeDefined();
          expect(result.expectedOutputs.length).toBeGreaterThan(0);
          expect(requirements.requirement_9_3).toBe(true);
          
          // Should include completion criteria (Requirement 9.3)
          expect(result.completionCriteria).toBeDefined();
          expect(result.completionCriteria.length).toBeGreaterThanOrEqual(5);
          
          // Should include validation steps (Requirement 9.5)
          expect(result.validationSteps).toBeDefined();
          expect(result.validationSteps.length).toBeGreaterThanOrEqual(5);
          expect(requirements.requirement_9_5).toBe(true);
          
          // Should include quality gates (Requirement 9.5)
          expect(result.qualityGates).toBeDefined();
          expect(result.qualityGates.length).toBeGreaterThanOrEqual(5);
          
          // Should have token estimate
          expect(result.tokenEstimate).toBeGreaterThan(0);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15: Feature-Specific Content - prompts are tailored to specific features', () => {
    fc.assert(
      fc.property(
        implementationRequestGenerator,
        (request) => {
          // For any feature request, the prompt should be feature-specific
          const result = processor.generateImplementationPrompt(request);
          const requirements = processor.validateRequirements(request);
          
          // Property assertion: Prompts should be feature-specific (Requirement 9.1)
          expect(requirements.requirement_9_1).toBe(true);
          
          // Prompt should contain feature name
          expect(result.prompt).toContain(request.featureName);
          
          // Prompt should contain technology context
          expect(result.prompt).toContain(request.technologyContext.language);
          expect(result.prompt).toContain(request.technologyContext.platform);
          
          // Expected outputs should be technology-appropriate
          if (request.technologyContext.platform === 'web') {
            expect(result.expectedOutputs.some(output => 
              output.includes('component') || output.includes('CSS') || output.includes('state')
            )).toBe(true);
          } else if (request.technologyContext.platform === 'mobile') {
            expect(result.expectedOutputs.some(output => 
              output.includes('screen') || output.includes('navigation') || output.includes('native')
            )).toBe(true);
          } else if (request.technologyContext.platform === 'backend') {
            expect(result.expectedOutputs.some(output => 
              output.includes('API') || output.includes('service') || output.includes('database')
            )).toBe(true);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15: Token Chunking Strategy - handles large tasks appropriately', () => {
    fc.assert(
      fc.property(
        implementationRequestGenerator,
        (request) => {
          // For any implementation request, token chunking should be appropriate
          const result = processor.generateImplementationPrompt(request);
          const chunking = processor.generateTokenChunking(request);
          const requirements = processor.validateRequirements(request);
          
          // Property assertion: Token chunking should be appropriate (Requirement 9.4)
          expect(requirements.requirement_9_4).toBe(true);
          
          // Chunking should be consistent with token estimate
          if (result.tokenEstimate <= 4000) {
            expect(chunking.chunks.length).toBe(1);
            expect(result.chunkingStrategy).toBeUndefined();
          } else {
            expect(chunking.chunks.length).toBeGreaterThan(1);
            expect(result.chunkingStrategy).toBeDefined();
            expect(chunking.contextPreservation.length).toBeGreaterThan(0);
          }
          
          // Total estimate should match sum of chunk budgets (allow for reasonable variance)
          const totalChunkBudget = chunking.chunks.reduce((sum, chunk) => sum + chunk.tokenBudget, 0);
          expect(Math.abs(totalChunkBudget - chunking.totalEstimate)).toBeLessThanOrEqual(1000);
          
          // Each chunk should have clear dependencies and deliverables
          chunking.chunks.forEach(chunk => {
            expect(chunk.id).toBeDefined();
            expect(chunk.name).toBeDefined();
            expect(chunk.tokenBudget).toBeGreaterThan(0);
            expect(chunk.scope).toBeDefined();
            expect(Array.isArray(chunk.dependencies)).toBe(true);
            expect(Array.isArray(chunk.deliverables)).toBe(true);
            expect(chunk.deliverables.length).toBeGreaterThan(0);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15: Context Links Quality - provides comprehensive context', () => {
    fc.assert(
      fc.property(
        implementationRequestGenerator.filter(req => 
          req.specifications.requirements || req.specifications.design || 
          req.specifications.api || req.specifications.dataModels
        ),
        (request) => {
          // For any request with specifications, context links should be comprehensive
          const result = processor.generateImplementationPrompt(request);
          
          // Property assertion: Context links should reference all available specifications
          if (request.specifications.requirements) {
            expect(result.contextLinks.some(link => link.includes('Requirements'))).toBe(true);
          }
          if (request.specifications.design) {
            expect(result.contextLinks.some(link => link.includes('Design'))).toBe(true);
          }
          if (request.specifications.api) {
            expect(result.contextLinks.some(link => link.includes('API'))).toBe(true);
          }
          if (request.specifications.dataModels) {
            expect(result.contextLinks.some(link => link.includes('Data Models'))).toBe(true);
          }
          
          // Should include asset links if assets are provided
          Object.entries(request.assets).forEach(([type, assets]) => {
            if (assets && assets.length > 0) {
              expect(result.contextLinks.some(link => link.includes(type))).toBe(true);
            }
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15: Validation Completeness - includes comprehensive validation', () => {
    fc.assert(
      fc.property(
        implementationRequestGenerator,
        (request) => {
          // For any implementation request, validation should be comprehensive
          const result = processor.generateImplementationPrompt(request);
          
          // Property assertion: Validation should cover all critical aspects
          const validationAspects = [
            'syntax', 'functional', 'integration', 'security', 
            'performance', 'accessibility', 'documentation'
          ];
          
          validationAspects.forEach(aspect => {
            expect(result.validationSteps.some(step => 
              step.toLowerCase().includes(aspect)
            )).toBe(true);
          });
          
          // Quality gates should include essential checks
          const essentialGates = ['coverage', 'security', 'performance', 'tests'];
          essentialGates.forEach(gate => {
            expect(result.qualityGates.some(qg => 
              qg.toLowerCase().includes(gate)
            )).toBe(true);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15: Implementation Readiness Validation - assesses readiness accurately', () => {
    fc.assert(
      fc.property(
        implementationRequestGenerator,
        (request) => {
          // For any implementation request, readiness assessment should be accurate
          const readiness = processor.validateImplementationReadiness(request);
          
          // Property assertion: Readiness assessment should be comprehensive
          expect(readiness.score).toBeGreaterThanOrEqual(0);
          expect(readiness.score).toBeLessThanOrEqual(15);
          expect(Array.isArray(readiness.issues)).toBe(true);
          expect(Array.isArray(readiness.recommendations)).toBe(true);
          
          // Score should correlate with readiness
          if (readiness.score >= 12) {
            expect(readiness.isReady).toBe(true);
          } else {
            expect(readiness.isReady).toBe(false);
          }
          
          // Issues should be actionable
          readiness.issues.forEach(issue => {
            expect(issue.length).toBeGreaterThan(10);
            expect(issue).toMatch(/Missing|Unsupported|incomplete|required/i);
          });
          
          // Recommendations should be helpful
          readiness.recommendations.forEach(rec => {
            expect(rec.length).toBeGreaterThan(10);
            expect(rec).toMatch(/Consider|Specify|Document|Provide/i);
          });
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15 (Invariant): Prompt quality is consistent across token budgets', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          implementationRequestGenerator,
          fc.constantFrom('low', 'medium', 'high')
        ),
        ([baseRequest, tokenBudget]) => {
          // For any request, changing token budget should maintain quality while adjusting scope
          const request = { ...baseRequest, tokenBudget };
          const result = processor.generateImplementationPrompt(request);
          
          // Invariant: Core quality elements should be present regardless of token budget
          expect(result.contextLinks.length).toBeGreaterThan(0);
          expect(result.expectedOutputs.length).toBeGreaterThan(0);
          expect(result.completionCriteria.length).toBeGreaterThanOrEqual(5);
          expect(result.validationSteps.length).toBeGreaterThanOrEqual(5);
          expect(result.qualityGates.length).toBeGreaterThanOrEqual(5);
          
          // Token estimate should vary with budget
          if (tokenBudget === 'high') {
            expect(result.tokenEstimate).toBeGreaterThan(1000);
          } else if (tokenBudget === 'low') {
            expect(result.tokenEstimate).toBeLessThan(5000);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15 (Round-trip): Prompt generation is deterministic', () => {
    fc.assert(
      fc.property(
        implementationRequestGenerator,
        (request) => {
          // For any request, generating prompts multiple times should yield consistent results
          const result1 = processor.generateImplementationPrompt(request);
          const result2 = processor.generateImplementationPrompt(request);
          
          // Round-trip property: Results should be identical for same input
          expect(result1.tokenEstimate).toBe(result2.tokenEstimate);
          expect(result1.contextLinks).toEqual(result2.contextLinks);
          expect(result1.expectedOutputs).toEqual(result2.expectedOutputs);
          expect(result1.completionCriteria).toEqual(result2.completionCriteria);
          expect(result1.validationSteps).toEqual(result2.validationSteps);
          expect(result1.qualityGates).toEqual(result2.qualityGates);
          expect(result1.chunkingStrategy).toBe(result2.chunkingStrategy);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 15 (Edge Case): Handles minimal and maximal configurations', () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Minimal configuration
          fc.record({
            featureName: fc.constantFrom('Simple Feature'),
            specifications: fc.constant({}),
            assets: fc.constant({}),
            dependencies: fc.constant({}),
            technologyContext: fc.record({
              language: fc.constantFrom('JavaScript'),
              framework: fc.constantFrom('Express'),
              platform: fc.constantFrom('backend'),
              architecture: fc.constantFrom('monolithic')
            }),
            tokenBudget: fc.constantFrom('low')
          }),
          // Maximal configuration
          fc.record({
            featureName: fc.constantFrom('Complex Enterprise Feature'),
            specifications: fc.record({
              requirements: fc.constant('Comprehensive requirements document'),
              design: fc.constant('Detailed design specification'),
              api: fc.constant('Complete API specification'),
              dataModels: fc.constant('Full data model documentation')
            }),
            assets: fc.record({
              designs: fc.constant(['design1.fig', 'design2.fig', 'design3.fig']),
              userFlows: fc.constant(['flow1.pdf', 'flow2.pdf']),
              testData: fc.constant(['data1.json', 'data2.json']),
              configurations: fc.constant(['config1.yml', 'config2.yml'])
            }),
            dependencies: fc.record({
              prerequisites: fc.constant(['auth-service', 'user-service', 'notification-service']),
              externalServices: fc.constant(['stripe', 'sendgrid', 'aws-s3']),
              libraries: fc.constant(['react', 'redux', 'axios', 'lodash']),
              infrastructure: fc.constant(['kubernetes', 'redis', 'postgresql'])
            }),
            technologyContext: fc.record({
              language: fc.constantFrom('TypeScript'),
              framework: fc.constantFrom('React'),
              platform: fc.constantFrom('web'),
              architecture: fc.constantFrom('microservices'),
              database: fc.constantFrom('PostgreSQL')
            }),
            tokenBudget: fc.constantFrom('high')
          })
        ),
        (request) => {
          // For any configuration (minimal or maximal), prompt generation should work
          const result = processor.generateImplementationPrompt(request);
          const readiness = processor.validateImplementationReadiness(request);
          
          // Property: Both minimal and maximal configurations should generate valid prompts
          expect(result.prompt).toBeDefined();
          expect(result.prompt.length).toBeGreaterThan(50);
          expect(result.tokenEstimate).toBeGreaterThan(0);
          
          // Readiness should reflect configuration completeness
          expect(readiness.score).toBeGreaterThanOrEqual(0);
          expect(readiness.score).toBeLessThanOrEqual(15);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});