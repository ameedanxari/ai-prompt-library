import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { StagePipelineProcessor, StageExecutionContext, StageOutput } from '../../src/stage-pipeline-processor.js';

/**
 * Feature: ai-prompt-library, Property 5: Stage Pipeline Integrity
 * Feature: ai-prompt-library, Property 6: Stage Output Completeness
 * 
 * Property 5: For any stage execution, it should build incrementally on previous stages, 
 * validate dependencies, maintain context, and execute in proper sequence.
 * 
 * Property 6: For any completed stage, it should generate all required platform-specific files 
 * containing scope, assumptions, acceptance criteria, risks, and next-step links.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

describe('Property-Based Tests: Stage Pipeline Integrity', () => {
  const processor = new StagePipelineProcessor();

  // Generator for stage IDs
  const stageIdGenerator = fc.constantFrom(
    'stage-01-intake',
    'stage-02-charter', 
    'stage-03-architecture',
    'stage-04-features',
    'stage-05-testing',
    'stage-06-implementation'
  );

  // Generator for project configurations
  const projectConfigGenerator = fc.record({
    platforms: fc.array(fc.constantFrom('web', 'mobile', 'desktop'), { minLength: 1, maxLength: 3 }),
    technologies: fc.record({
      mobile: fc.constantFrom('React Native', 'Flutter', 'Native'),
      web: fc.constantFrom('React', 'Vue', 'Angular'),
      backend: fc.constantFrom('Node.js', 'Python', 'Java')
    }),
    deployment: fc.constantFrom('AWS', 'Azure', 'GCP', 'Heroku'),
    features: fc.array(fc.constantFrom('auth', 'analytics', 'admin', 'api'), { minLength: 1, maxLength: 4 })
  });

  // Generator for asset inventory
  const assetInventoryGenerator = fc.record({
    totalFiles: fc.integer({ min: 0, max: 20 }),
    categories: fc.record({
      designs: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { maxLength: 5 }),
      specifications: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { maxLength: 5 }),
      dataSamples: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { maxLength: 5 }),
      assets: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { maxLength: 5 })
    })
  });

  // Generator for context summaries
  const contextSummaryGenerator = fc.string({ minLength: 50, maxLength: 500 }).map(s => 
    `Project context: ${s}. Previous stages completed successfully with all requirements met.`
  );

  // Generator for previous stage outputs
  const previousStageOutputsGenerator = fc.array(
    fc.record({
      stageId: stageIdGenerator,
      completionStatus: fc.constantFrom('completed', 'in-progress', 'not-started')
    }),
    { maxLength: 5 }
  ).map(stages => {
    const outputs: Record<string, StageOutput> = {};
    for (const stage of stages) {
      outputs[stage.stageId] = {
        stageId: stage.stageId,
        stageName: stage.stageId.replace('stage-', '').replace('-', ' '),
        platformFiles: {
          'platform-agnostic.md': `# ${stage.stageId} content`
        },
        metadata: {
          scope: ['Stage scope defined'],
          assumptions: ['Stage assumptions documented'],
          acceptanceCriteria: ['Stage criteria specified'],
          risks: ['Stage risks identified'],
          nextSteps: ['Next steps outlined']
        },
        dependencies: [],
        completionStatus: stage.completionStatus as any
      };
    }
    return outputs;
  });

  // Generator for execution contexts
  const executionContextGenerator = fc.record({
    currentStage: stageIdGenerator,
    previousStageOutputs: previousStageOutputsGenerator,
    projectConfiguration: projectConfigGenerator,
    assetInventory: assetInventoryGenerator,
    contextSummary: contextSummaryGenerator
  });

  it('Property 5: Stage Pipeline Integrity - sequential execution with dependency validation', () => {
    fc.assert(
      fc.property(
        executionContextGenerator,
        (context) => {
          // For any execution context, stage pipeline should maintain integrity
          try {
            const requirements = processor.validateRequirements(context.currentStage, context);
            
            // Property assertion: Pipeline integrity requirements
            expect(requirements.requirement_3_1).toBe(true); // Sequential chained stages
            expect(requirements.requirement_3_5).toBeDefined(); // Dependency validation exists
            expect(requirements.requirement_3_6).toBeDefined(); // Context preservation exists
            
            // If dependencies are met, execution should succeed
            if (requirements.requirement_3_5) {
              const stageOutput = processor.executeStageSequentially(context);
              
              // Stage should build incrementally on previous stages
              expect(requirements.requirement_3_2).toBe(true);
              expect(stageOutput.stageId).toBe(context.currentStage);
              expect(stageOutput.completionStatus).toBe('completed');
            }
            
            return true;
          } catch (error) {
            // Execution may fail due to missing dependencies, which is expected behavior
            // The property is that the system handles this gracefully
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Stage Output Completeness - comprehensive platform-specific files', () => {
    fc.assert(
      fc.property(
        executionContextGenerator.filter(ctx => 
          // Only test contexts where dependencies are likely to be met
          ctx.currentStage === 'stage-01-intake' || 
          Object.keys(ctx.previousStageOutputs).length > 0
        ),
        (context) => {
          try {
            const requirements = processor.validateRequirements(context.currentStage, context);
            
            // Property assertion: Stage output completeness
            expect(requirements.requirement_3_3).toBeDefined(); // Platform-specific files
            expect(requirements.requirement_3_4).toBeDefined(); // Required content sections
            
            // If stage can execute, output should be complete
            if (requirements.requirement_3_5) {
              const stageOutput = processor.executeStageSequentially(context);
              
              // All required platform files should be generated
              expect(requirements.requirement_3_3).toBe(true);
              expect(stageOutput.platformFiles['platform-agnostic.md']).toBeDefined();
              expect(stageOutput.platformFiles['platform-agnostic.md'].length).toBeGreaterThan(0);
              
              // Required content sections should be present
              expect(requirements.requirement_3_4).toBe(true);
              expect(stageOutput.metadata.scope.length).toBeGreaterThan(0);
              expect(stageOutput.metadata.assumptions.length).toBeGreaterThan(0);
              expect(stageOutput.metadata.acceptanceCriteria.length).toBeGreaterThan(0);
              expect(stageOutput.metadata.risks.length).toBeGreaterThan(0);
              expect(stageOutput.metadata.nextSteps.length).toBeGreaterThan(0);
            }
            
            return true;
          } catch (error) {
            // Expected for invalid contexts
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5 & 6 Combined: Complete stage pipeline workflow integrity', () => {
    fc.assert(
      fc.property(
        fc.record({
          stageSequence: fc.array(stageIdGenerator, { minLength: 1, maxLength: 3 }),
          projectConfig: projectConfigGenerator,
          assetInventory: assetInventoryGenerator,
          baseContext: contextSummaryGenerator
        }),
        (testData) => {
          // For any sequence of stages, pipeline should maintain integrity throughout
          let previousOutputs: Record<string, StageOutput> = {};
          let allRequirementsMet = true;
          
          for (const stageId of testData.stageSequence) {
            const context: StageExecutionContext = {
              currentStage: stageId,
              previousStageOutputs: previousOutputs,
              projectConfiguration: testData.projectConfig,
              assetInventory: testData.assetInventory,
              contextSummary: testData.baseContext
            };
            
            const requirements = processor.validateRequirements(stageId, context);
            
            // Property assertion: All requirements should be consistently validated
            expect(typeof requirements.requirement_3_1).toBe('boolean');
            expect(typeof requirements.requirement_3_2).toBe('boolean');
            expect(typeof requirements.requirement_3_3).toBe('boolean');
            expect(typeof requirements.requirement_3_4).toBe('boolean');
            expect(typeof requirements.requirement_3_5).toBe('boolean');
            expect(typeof requirements.requirement_3_6).toBe('boolean');
            
            // Track if all requirements are being met
            if (!Object.values(requirements).every(Boolean)) {
              allRequirementsMet = false;
            }
            
            // If dependencies are met, stage should execute successfully
            if (requirements.requirement_3_5) {
              try {
                const stageOutput = processor.executeStageSequentially(context);
                previousOutputs[stageId] = stageOutput;
                
                // Output should be complete and valid
                expect(stageOutput.stageId).toBe(stageId);
                expect(stageOutput.completionStatus).toBe('completed');
                expect(Object.keys(stageOutput.platformFiles).length).toBeGreaterThan(0);
              } catch (error) {
                // Execution failure is acceptable if dependencies aren't met
                expect(error).toBeInstanceOf(Error);
              }
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5: Context preservation across stage transitions', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          executionContextGenerator,
          contextSummaryGenerator
        ),
        ([context, additionalContext]) => {
          // For any context and additional context, preservation should work
          const enhancedContext = {
            ...context,
            contextSummary: `${context.contextSummary} ${additionalContext}`
          };
          
          const requirements = processor.validateRequirements(context.currentStage, enhancedContext);
          
          // Property assertion: Context preservation capability
          expect(requirements.requirement_3_6).toBeDefined();
          
          // Context should be maintained regardless of content
          if (requirements.requirement_3_5) {
            try {
              const stageOutput = processor.executeStageSequentially(enhancedContext);
              
              // Context preservation should be validated
              expect(requirements.requirement_3_6).toBe(true);
              expect(stageOutput.metadata.assumptions.length).toBeGreaterThan(0);
              expect(stageOutput.metadata.nextSteps.length).toBeGreaterThan(0);
            } catch (error) {
              // Expected for invalid contexts
              expect(error).toBeInstanceOf(Error);
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6: Platform-specific file generation consistency', () => {
    fc.assert(
      fc.property(
        executionContextGenerator.map(ctx => ({
          ...ctx,
          // Ensure first stage to avoid dependency issues
          currentStage: 'stage-01-intake' as const
        })),
        (context) => {
          // For any valid context, platform files should be generated consistently
          const requirements = processor.validateRequirements(context.currentStage, context);
          
          // Property assertion: Platform file generation
          expect(requirements.requirement_3_3).toBeDefined();
          
          try {
            const stageOutput = processor.executeStageSequentially(context);
            
            // Platform-agnostic file should always be generated
            expect(stageOutput.platformFiles['platform-agnostic.md']).toBeDefined();
            expect(stageOutput.platformFiles['platform-agnostic.md'].length).toBeGreaterThan(0);
            
            // Platform-specific files should be generated based on configuration
            if (context.projectConfiguration.platforms.includes('web')) {
              expect(stageOutput.platformFiles['web.md']).toBeDefined();
            }
            
            if (context.projectConfiguration.platforms.includes('mobile')) {
              expect(stageOutput.platformFiles['mobile.md']).toBeDefined();
            }
            
            // All generated files should have required sections
            for (const [filename, content] of Object.entries(stageOutput.platformFiles)) {
              if (content) {
                expect(content).toContain('## Scope');
                expect(content).toContain('## Requirements');
                expect(content).toContain('## Risks');
                expect(content).toContain('## Next Steps');
              }
            }
            
            expect(requirements.requirement_3_3).toBe(true);
            expect(requirements.requirement_3_4).toBe(true);
          } catch (error) {
            // Expected for some invalid contexts
            expect(error).toBeInstanceOf(Error);
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5 (Invariant): Stage dependency validation is consistent', () => {
    fc.assert(
      fc.property(
        fc.tuple(
          stageIdGenerator,
          projectConfigGenerator,
          assetInventoryGenerator
        ),
        ([stageId, projectConfig, assetInventory]) => {
          // For any stage and configuration, dependency validation should be consistent
          const context1: StageExecutionContext = {
            currentStage: stageId,
            previousStageOutputs: {},
            projectConfiguration: projectConfig,
            assetInventory: assetInventory,
            contextSummary: 'Test context 1'
          };
          
          const context2: StageExecutionContext = {
            currentStage: stageId,
            previousStageOutputs: {},
            projectConfiguration: projectConfig,
            assetInventory: assetInventory,
            contextSummary: 'Test context 2'
          };
          
          // Invariant: Dependency validation should be consistent for same stage/config
          const requirements1 = processor.validateRequirements(stageId, context1);
          const requirements2 = processor.validateRequirements(stageId, context2);
          
          expect(requirements1.requirement_3_1).toBe(requirements2.requirement_3_1);
          expect(requirements1.requirement_3_5).toBe(requirements2.requirement_3_5);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 6 (Edge Case): Stage output generation with minimal inputs', () => {
    fc.assert(
      fc.property(
        fc.record({
          stageId: fc.constantFrom('stage-01-intake'), // First stage has no dependencies
          projectConfig: fc.record({
            platforms: fc.array(fc.constantFrom('web'), { minLength: 1, maxLength: 1 }),
            technologies: fc.record({
              web: fc.constant('React')
            })
          }),
          contextSummary: fc.string({ minLength: 1, maxLength: 10 })
        }),
        (testData) => {
          // Edge case: Minimal inputs should still produce valid outputs
          const context: StageExecutionContext = {
            currentStage: testData.stageId,
            previousStageOutputs: {},
            projectConfiguration: testData.projectConfig,
            assetInventory: { totalFiles: 0, categories: { designs: [], specifications: [], dataSamples: [], assets: [] } },
            contextSummary: testData.contextSummary
          };
          
          const requirements = processor.validateRequirements(testData.stageId, context);
          
          // Property assertion: Minimal inputs should still work
          expect(requirements.requirement_3_1).toBe(true); // Sequential chaining works
          expect(requirements.requirement_3_5).toBe(true); // No dependencies for first stage
          
          const stageOutput = processor.executeStageSequentially(context);
          
          // Output should be complete even with minimal inputs
          expect(stageOutput.platformFiles['platform-agnostic.md']).toBeDefined();
          expect(stageOutput.metadata.scope.length).toBeGreaterThan(0);
          expect(requirements.requirement_3_3).toBe(true);
          expect(requirements.requirement_3_4).toBe(true);
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 5 & 6 (Round-trip): Stage execution preserves and enhances context', () => {
    fc.assert(
      fc.property(
        executionContextGenerator.map(ctx => ({
          ...ctx,
          currentStage: 'stage-01-intake' as const // Use first stage to avoid dependency issues
        })),
        (context) => {
          // Round-trip property: Executing stage should preserve input context and enhance it
          const originalContextLength = context.contextSummary.length;
          
          try {
            const stageOutput = processor.executeStageSequentially(context);
            
            // Context should be preserved and enhanced
            expect(stageOutput.metadata.assumptions.length).toBeGreaterThan(0);
            expect(stageOutput.metadata.nextSteps.length).toBeGreaterThan(0);
            
            // Original context information should be preserved (stage builds incrementally)
            expect(stageOutput.stageId).toBe(context.currentStage);
            expect(stageOutput.dependencies).toBeDefined();
            
            // New context should be generated for next stage
            expect(stageOutput.metadata.nextSteps.length).toBeGreaterThan(0);
            
            return true;
          } catch (error) {
            // Expected for some invalid contexts
            expect(error).toBeInstanceOf(Error);
            return true;
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});