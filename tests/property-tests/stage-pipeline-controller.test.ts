import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  StagePipelineController,
  StageId,
  StageStatus,
  ProjectContext,
  ProjectBrief
} from '../../src/stage-pipeline-controller.js';

/**
 * Property-Based Tests: Stage Pipeline Controller
 * 
 * Property 1: Stage Pipeline Execution
 * For any project brief and configuration, executing the complete pipeline should result
 * in all 10 stages being completed in sequence with proper state transitions and output generation.
 * 
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5
 */

describe('Property-Based Tests: Stage Pipeline Controller', () => {
  let controller: StagePipelineController;

  beforeEach(() => {
    controller = new StagePipelineController();
  });

  // Arbitrary generators for test data
  const projectBriefArb = fc.record({
    description: fc.string({ minLength: 10, maxLength: 500 }),
    platforms: fc.array(fc.constantFrom('web', 'mobile', 'desktop', 'backend'), { minLength: 1, maxLength: 4 }),
    domain: fc.constantFrom('commerce', 'social', 'fintech', 'healthcare', 'enterprise-saas'),
    requirements: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 1, maxLength: 10 })
  });

  const projectContextArb = projectBriefArb.map(brief => ({
    brief,
    currentStage: StageId.INTAKE,
    completedStages: [],
    decisions: [],
    assets: [],
    templates: []
  }));

  describe('Property 1.1: Stage Order Invariant', () => {
    it('should always return stages in correct sequential order', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (_iteration) => {
            const stageOrder = controller.getStageOrder();
            
            // Must have exactly 10 stages
            expect(stageOrder).toHaveLength(10);
            
            // Stages must be in correct order
            expect(stageOrder[0]).toBe(StageId.INTAKE);
            expect(stageOrder[1]).toBe(StageId.CHARTER);
            expect(stageOrder[2]).toBe(StageId.ARCHITECTURE);
            expect(stageOrder[3]).toBe(StageId.FEATURES);
            expect(stageOrder[4]).toBe(StageId.TESTING);
            expect(stageOrder[5]).toBe(StageId.IMPLEMENTATION);
            expect(stageOrder[6]).toBe(StageId.DEPLOYMENT);
            expect(stageOrder[7]).toBe(StageId.DOCUMENTATION);
            expect(stageOrder[8]).toBe(StageId.QUALITY);
            expect(stageOrder[9]).toBe(StageId.HANDOFF);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.2: Initial State Consistency', () => {
    it('should initialize all stages to NOT_STARTED status', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (_iteration) => {
            const freshController = new StagePipelineController();
            const statuses = freshController.getAllStageStatuses();
            
            // All stages should be NOT_STARTED initially
            for (const [stageId, status] of statuses) {
              expect(status).toBe(StageStatus.NOT_STARTED);
            }
            
            // Should have status for all 10 stages
            expect(statuses.size).toBe(10);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.3: Prerequisite Validation', () => {
    it('should validate prerequisites correctly for any stage', () => {
      fc.assert(
        fc.property(
          fc.constantFrom(...Object.values(StageId)),
          (stageId) => {
            const validation = controller.validatePrerequisites(stageId);
            const definition = controller.getStageDefinition(stageId);
            
            // Validation result should always have required fields
            expect(validation).toHaveProperty('isValid');
            expect(validation).toHaveProperty('errors');
            expect(validation).toHaveProperty('warnings');
            expect(Array.isArray(validation.errors)).toBe(true);
            expect(Array.isArray(validation.warnings)).toBe(true);
            
            // First stage (INTAKE) should have no dependency errors
            if (stageId === StageId.INTAKE) {
              const dependencyErrors = validation.errors.filter(e => e.includes('Dependency'));
              expect(dependencyErrors).toHaveLength(0);
            }
            
            // Non-first stages should fail validation when dependencies not met
            if (definition && definition.dependencies.length > 0) {
              expect(validation.isValid).toBe(false);
              expect(validation.errors.length).toBeGreaterThan(0);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.4: Stage Execution State Transitions', () => {
    it('should correctly transition stage status during execution', async () => {
      await fc.assert(
        fc.asyncProperty(
          projectContextArb,
          async (context) => {
            const freshController = new StagePipelineController();
            
            // Initial status should be NOT_STARTED
            expect(freshController.getStageStatus(StageId.INTAKE)).toBe(StageStatus.NOT_STARTED);
            
            // Execute first stage
            const result = await freshController.executeStage(StageId.INTAKE, context);
            
            // After execution, status should be COMPLETED
            expect(freshController.getStageStatus(StageId.INTAKE)).toBe(StageStatus.COMPLETED);
            expect(result.status).toBe(StageStatus.COMPLETED);
            
            // Result should have required fields
            expect(result.stageId).toBe(StageId.INTAKE);
            expect(result.outputs.length).toBeGreaterThan(0);
            expect(result.nextStage).toBe(StageId.CHARTER);
            expect(result.timestamp).toBeInstanceOf(Date);
            expect(result.duration).toBeGreaterThanOrEqual(0);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.5: Sequential Execution Enforcement', () => {
    it('should prevent execution of stages with unmet dependencies', async () => {
      await fc.assert(
        fc.asyncProperty(
          projectContextArb,
          fc.constantFrom(
            StageId.CHARTER,
            StageId.ARCHITECTURE,
            StageId.FEATURES,
            StageId.TESTING,
            StageId.IMPLEMENTATION,
            StageId.DEPLOYMENT,
            StageId.DOCUMENTATION,
            StageId.QUALITY,
            StageId.HANDOFF
          ),
          async (context, stageId) => {
            const freshController = new StagePipelineController();
            
            // Attempting to execute non-first stage without completing dependencies should fail
            await expect(
              freshController.executeStage(stageId, context)
            ).rejects.toThrow();
            
            // Stage status should be BLOCKED after failed attempt
            expect(freshController.getStageStatus(stageId)).toBe(StageStatus.BLOCKED);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.6: Complete Pipeline Execution', () => {
    it('should complete all stages in sequence for any valid project', async () => {
      await fc.assert(
        fc.asyncProperty(
          projectContextArb,
          async (context) => {
            const freshController = new StagePipelineController();
            const stageOrder = freshController.getStageOrder();
            const completedResults: any[] = [];
            
            // Execute all stages in order
            for (const stageId of stageOrder) {
              const result = await freshController.executeStage(stageId, context);
              completedResults.push(result);
              
              // Each stage should complete successfully
              expect(result.status).toBe(StageStatus.COMPLETED);
              expect(result.stageId).toBe(stageId);
            }
            
            // All stages should be completed
            expect(freshController.isPipelineComplete()).toBe(true);
            expect(completedResults).toHaveLength(10);
            
            // Completed stages should be retrievable
            const completed = freshController.getCompletedStages();
            expect(completed).toHaveLength(10);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.7: Stage Output Generation', () => {
    it('should generate outputs for any executed stage', async () => {
      await fc.assert(
        fc.asyncProperty(
          projectContextArb,
          async (context) => {
            const freshController = new StagePipelineController();
            
            // Execute first stage
            const result = await freshController.executeStage(StageId.INTAKE, context);
            
            // Should have outputs
            expect(result.outputs.length).toBeGreaterThan(0);
            
            // Each output should have required fields
            for (const output of result.outputs) {
              expect(output).toHaveProperty('type');
              expect(output).toHaveProperty('filename');
              expect(output).toHaveProperty('content');
              expect(output).toHaveProperty('references');
              expect(output.content.length).toBeGreaterThan(0);
              expect(output.filename.includes(StageId.INTAKE)).toBe(true);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.8: Stage Transition Validation', () => {
    it('should correctly determine next stage after completion', async () => {
      await fc.assert(
        fc.asyncProperty(
          projectContextArb,
          async (context) => {
            const freshController = new StagePipelineController();
            const stageOrder = freshController.getStageOrder();
            
            // Execute first stage
            await freshController.executeStage(StageId.INTAKE, context);
            
            // Transition should return correct next stage
            const nextStage = await freshController.transitionToNextStage(StageId.INTAKE);
            expect(nextStage).toBe(StageId.CHARTER);
            
            // Execute remaining stages and verify transitions
            for (let i = 1; i < stageOrder.length; i++) {
              await freshController.executeStage(stageOrder[i], context);
              const next = await freshController.transitionToNextStage(stageOrder[i]);
              
              if (i < stageOrder.length - 1) {
                expect(next).toBe(stageOrder[i + 1]);
              } else {
                // Last stage should return null
                expect(next).toBeNull();
              }
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.9: Decision Recording', () => {
    it('should record architectural decisions for each stage', async () => {
      await fc.assert(
        fc.asyncProperty(
          projectContextArb,
          async (context) => {
            const freshController = new StagePipelineController();
            
            // Execute first stage
            const result = await freshController.executeStage(StageId.INTAKE, context);
            
            // Should have decisions
            expect(result.decisions.length).toBeGreaterThan(0);
            
            // Each decision should have required fields
            for (const decision of result.decisions) {
              expect(decision).toHaveProperty('id');
              expect(decision).toHaveProperty('title');
              expect(decision).toHaveProperty('stage');
              expect(decision).toHaveProperty('decision');
              expect(decision).toHaveProperty('rationale');
              expect(decision).toHaveProperty('alternatives');
              expect(decision).toHaveProperty('impact');
              expect(decision).toHaveProperty('timestamp');
              expect(decision.stage).toBe(StageId.INTAKE);
            }
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 1.10: Pipeline Reset', () => {
    it('should correctly reset pipeline state', async () => {
      await fc.assert(
        fc.asyncProperty(
          projectContextArb,
          async (context) => {
            const freshController = new StagePipelineController();
            
            // Execute some stages
            await freshController.executeStage(StageId.INTAKE, context);
            await freshController.executeStage(StageId.CHARTER, context);
            
            // Verify stages are completed
            expect(freshController.getStageStatus(StageId.INTAKE)).toBe(StageStatus.COMPLETED);
            expect(freshController.getStageStatus(StageId.CHARTER)).toBe(StageStatus.COMPLETED);
            
            // Reset pipeline
            freshController.reset();
            
            // All stages should be NOT_STARTED again
            const statuses = freshController.getAllStageStatuses();
            for (const [_, status] of statuses) {
              expect(status).toBe(StageStatus.NOT_STARTED);
            }
            
            // Completed stages should be empty
            expect(freshController.getCompletedStages()).toHaveLength(0);
            expect(freshController.isPipelineComplete()).toBe(false);
            
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
