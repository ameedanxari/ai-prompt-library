import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  ErrorRecoverySystem,
  ErrorType,
  ErrorSeverity,
  DetectedError,
  RecoveryOption
} from '../../src/error-recovery-system.js';
import { StageId, StageResult, StageStatus, ProjectContext } from '../../src/stage-pipeline-controller.js';
import { ProjectState } from '../../src/state-manager.js';

/**
 * Property-Based Tests: Error Recovery System
 * 
 * Property 9: Error Recovery
 * For any error condition (missing dependencies, conflicts, context loss, validation failures),
 * the system should provide clear identification, resolution options, and documentation.
 * 
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

describe('Property-Based Tests: Error Recovery System', () => {
  let system: ErrorRecoverySystem;

  beforeEach(() => {
    system = new ErrorRecoverySystem();
  });

  // Arbitrary generators
  const stageIdArb = fc.constantFrom(...Object.values(StageId));
  const errorTypeArb = fc.constantFrom(...Object.values(ErrorType));
  const errorSeverityArb = fc.constantFrom(...Object.values(ErrorSeverity));

  const projectStateArb = fc.record({
    projectId: fc.string({ minLength: 5, maxLength: 20 }),
    projectName: fc.string({ minLength: 3, maxLength: 30 }),
    currentStage: stageIdArb,
    completedStages: fc.array(stageIdArb, { minLength: 0, maxLength: 5 }),
    decisions: fc.array(fc.record({
      id: fc.string({ minLength: 5, maxLength: 20 }),
      stage: stageIdArb,
      title: fc.string({ minLength: 5, maxLength: 50 }),
      decision: fc.string({ minLength: 10, maxLength: 100 }),
      rationale: fc.string({ minLength: 10, maxLength: 100 }),
      alternatives: fc.array(fc.string({ minLength: 5, maxLength: 50 })),
      impact: fc.array(fc.string({ minLength: 5, maxLength: 50 })),
      timestamp: fc.date()
    }), { minLength: 0, maxLength: 3 }),
    outputs: fc.array(fc.record({
      stageId: stageIdArb,
      type: fc.string({ minLength: 3, maxLength: 20 }),
      filename: fc.string({ minLength: 5, maxLength: 30 }),
      content: fc.string({ minLength: 10, maxLength: 200 }),
      timestamp: fc.date()
    }), { minLength: 0, maxLength: 10 }),
    nextAction: fc.record({
      currentStage: stageIdArb,
      status: fc.constantFrom(...Object.values(StageStatus)),
      nextStage: fc.option(stageIdArb, { nil: null }),
      description: fc.string({ minLength: 10, maxLength: 100 }),
      prerequisites: fc.array(fc.string({ minLength: 5, maxLength: 30 })),
      contextFiles: fc.array(fc.string({ minLength: 5, maxLength: 30 })),
      timestamp: fc.date()
    }),
    createdAt: fc.date(),
    updatedAt: fc.date()
  });

  const stageResultArb = fc.record({
    stageId: stageIdArb,
    status: fc.constantFrom(...Object.values(StageStatus)),
    outputs: fc.array(fc.record({
      type: fc.string({ minLength: 3, maxLength: 20 }),
      filename: fc.string({ minLength: 5, maxLength: 30 }),
      content: fc.string({ minLength: 10, maxLength: 200 }),
      references: fc.array(fc.string({ minLength: 3, maxLength: 30 }))
    }), { minLength: 0, maxLength: 5 }),
    decisions: fc.array(fc.record({
      id: fc.string({ minLength: 5, maxLength: 20 }),
      stage: stageIdArb,
      title: fc.string({ minLength: 5, maxLength: 50 }),
      decision: fc.string({ minLength: 10, maxLength: 100 }),
      rationale: fc.string({ minLength: 10, maxLength: 100 }),
      alternatives: fc.array(fc.string({ minLength: 5, maxLength: 50 })),
      impact: fc.array(fc.string({ minLength: 5, maxLength: 50 })),
      timestamp: fc.date()
    })),
    nextStage: fc.option(stageIdArb, { nil: null }),
    validationResults: fc.array(fc.record({
      isValid: fc.boolean(),
      errors: fc.array(fc.string()),
      warnings: fc.array(fc.string())
    })),
    timestamp: fc.date(),
    duration: fc.integer({ min: 100, max: 10000 })
  });

  const detectedErrorArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 30 }),
    type: errorTypeArb,
    severity: errorSeverityArb,
    stage: stageIdArb,
    message: fc.string({ minLength: 10, maxLength: 100 }),
    details: fc.string({ minLength: 10, maxLength: 200 }),
    context: fc.record({
      expectedOutput: fc.option(fc.string({ minLength: 3, maxLength: 20 }), { nil: undefined }),
      availableOutputs: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 20 })), { nil: undefined })
    }),
    timestamp: fc.date(),
    recoverable: fc.boolean()
  });

  describe('Property 9.1: Error Detection', () => {
    it('should detect errors in any project state', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          fc.option(stageResultArb, { nil: undefined }),
          (projectState, stageResult) => {
            const errors = system.detectErrors(
              projectState as ProjectState,
              stageResult as StageResult | undefined
            );

            // Should return an array
            expect(Array.isArray(errors)).toBe(true);

            // Each error should have required fields
            for (const error of errors) {
              expect(error).toHaveProperty('id');
              expect(error).toHaveProperty('type');
              expect(error).toHaveProperty('severity');
              expect(error).toHaveProperty('stage');
              expect(error).toHaveProperty('message');
              expect(error).toHaveProperty('details');
              expect(error).toHaveProperty('context');
              expect(error).toHaveProperty('timestamp');
              expect(error).toHaveProperty('recoverable');

              // Type and severity should be valid enums
              expect(Object.values(ErrorType)).toContain(error.type);
              expect(Object.values(ErrorSeverity)).toContain(error.severity);
              expect(Object.values(StageId)).toContain(error.stage);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.2: Recovery Options Generation', () => {
    it('should provide recovery options for any detected error', () => {
      fc.assert(
        fc.property(
          detectedErrorArb,
          (error) => {
            const options = system.getRecoveryOptions(error as DetectedError);

            // Should return an array
            expect(Array.isArray(options)).toBe(true);

            // Each option should have required fields
            for (const option of options) {
              expect(option).toHaveProperty('id');
              expect(option).toHaveProperty('name');
              expect(option).toHaveProperty('description');
              expect(option).toHaveProperty('type');
              expect(option).toHaveProperty('estimatedTime');
              expect(option).toHaveProperty('riskLevel');
              expect(option).toHaveProperty('prerequisites');

              // Type should be valid
              expect(['automatic', 'manual', 'interactive']).toContain(option.type);
              expect(['low', 'medium', 'high']).toContain(option.riskLevel);
              expect(option.estimatedTime).toBeGreaterThan(0);
              expect(Array.isArray(option.prerequisites)).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.3: Error Recovery Execution', () => {
    it('should attempt recovery for any error and option combination', async () => {
      await fc.assert(
        fc.asyncProperty(
          detectedErrorArb,
          projectStateArb,
          async (error, projectState) => {
            const options = system.getRecoveryOptions(error as DetectedError);
            if (options.length === 0) return true; // Skip if no options

            const option = options[0];
            const result = await system.recoverFromError(
              error as DetectedError,
              option,
              projectState as ProjectState
            );

            // Result should have required fields
            expect(result).toHaveProperty('success');
            expect(result).toHaveProperty('optionUsed');
            expect(result).toHaveProperty('message');
            expect(result).toHaveProperty('remainingIssues');
            expect(result).toHaveProperty('recommendations');

            expect(typeof result.success).toBe('boolean');
            expect(result.optionUsed).toBe(option.id);
            expect(typeof result.message).toBe('string');
            expect(Array.isArray(result.remainingIssues)).toBe(true);
            expect(Array.isArray(result.recommendations)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.4: Dependency Resolution', () => {
    it('should resolve missing dependencies', () => {
      fc.assert(
        fc.property(
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          projectStateArb,
          (dependencies, projectState) => {
            const resolutions = system.resolveMissingDependencies(
              dependencies,
              projectState as ProjectState
            );

            // Should return resolution for each dependency
            expect(resolutions).toHaveLength(dependencies.length);

            // Each resolution should have required fields
            for (const resolution of resolutions) {
              expect(resolution).toHaveProperty('dependency');
              expect(resolution).toHaveProperty('resolved');
              expect(resolution).toHaveProperty('source');
              expect(resolution).toHaveProperty('data');
              expect(resolution).toHaveProperty('confidence');

              expect(typeof resolution.resolved).toBe('boolean');
              expect(['generated', 'inferred', 'default', 'manual']).toContain(resolution.source);
              expect(resolution.confidence).toBeGreaterThanOrEqual(0);
              expect(resolution.confidence).toBeLessThanOrEqual(1);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.5: Context Reconstruction', () => {
    it('should reconstruct context from available data', () => {
      fc.assert(
        fc.property(
          fc.record({
            brief: fc.option(fc.record({
              description: fc.string({ minLength: 10, maxLength: 100 }),
              platforms: fc.array(fc.string({ minLength: 3, maxLength: 10 })),
              requirements: fc.array(fc.string({ minLength: 5, maxLength: 50 }))
            }), { nil: undefined }),
            assets: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 20 })), { nil: undefined }),
            templates: fc.option(fc.array(fc.string({ minLength: 3, maxLength: 20 })), { nil: undefined })
          }),
          projectStateArb,
          (availableData, projectState) => {
            const reconstruction = system.reconstructContext(
              availableData,
              projectState as ProjectState
            );

            // Should have required fields
            expect(reconstruction).toHaveProperty('success');
            expect(reconstruction).toHaveProperty('reconstructedContext');
            expect(reconstruction).toHaveProperty('confidence');
            expect(reconstruction).toHaveProperty('missingData');
            expect(reconstruction).toHaveProperty('assumptions');
            expect(reconstruction).toHaveProperty('warnings');

            expect(typeof reconstruction.success).toBe('boolean');
            expect(reconstruction.confidence).toBeGreaterThanOrEqual(0);
            expect(reconstruction.confidence).toBeLessThanOrEqual(1);
            expect(Array.isArray(reconstruction.missingData)).toBe(true);
            expect(Array.isArray(reconstruction.assumptions)).toBe(true);
            expect(Array.isArray(reconstruction.warnings)).toBe(true);

            // If successful, should have reconstructed context
            if (reconstruction.success) {
              expect(reconstruction.reconstructedContext).not.toBeNull();
              expect(reconstruction.reconstructedContext).toHaveProperty('brief');
              expect(reconstruction.reconstructedContext).toHaveProperty('currentStage');
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.6: Error History Tracking', () => {
    it('should track error history for projects', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          stageResultArb,
          (projectState, stageResult) => {
            const projectId = projectState.projectId;
            
            // Detect errors (this should add to history)
            system.detectErrors(
              projectState as ProjectState,
              stageResult as StageResult
            );

            // Get history
            const history = system.getErrorHistory(projectId);
            expect(Array.isArray(history)).toBe(true);

            // Each error in history should be valid
            for (const error of history) {
              expect(error).toHaveProperty('id');
              expect(error).toHaveProperty('type');
              expect(error).toHaveProperty('severity');
              expect(error).toHaveProperty('timestamp');
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.7: Conflict Detection and Resolution', () => {
    it('should detect and resolve conflicts', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          stageResultArb,
          (projectState, stageResult) => {
            const resolutions = system.detectAndResolveConflicts(
              projectState as ProjectState,
              stageResult as StageResult
            );

            // Should return an array
            expect(Array.isArray(resolutions)).toBe(true);

            // Each resolution should have required fields
            for (const resolution of resolutions) {
              expect(resolution).toHaveProperty('conflictId');
              expect(resolution).toHaveProperty('strategy');
              expect(resolution).toHaveProperty('resolution');
              expect(resolution).toHaveProperty('rationale');

              expect(['merge', 'override', 'manual', 'skip']).toContain(resolution.strategy);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.8: Error Classification Consistency', () => {
    it('should classify errors consistently', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          (projectState) => {
            // Detect errors multiple times with same input
            const errors1 = system.detectErrors(projectState as ProjectState);
            const errors2 = system.detectErrors(projectState as ProjectState);

            // Should produce consistent results
            expect(errors1.length).toBe(errors2.length);

            // Error types should be consistent for same conditions
            for (let i = 0; i < errors1.length; i++) {
              expect(errors1[i].type).toBe(errors2[i].type);
              expect(errors1[i].severity).toBe(errors2[i].severity);
              expect(errors1[i].stage).toBe(errors2[i].stage);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.9: Recovery Option Risk Assessment', () => {
    it('should not suggest high-risk options for critical errors', () => {
      fc.assert(
        fc.property(
          detectedErrorArb.map(error => ({ ...error, severity: ErrorSeverity.CRITICAL })),
          (criticalError) => {
            const options = system.getRecoveryOptions(criticalError as DetectedError);

            // No high-risk options should be suggested for critical errors
            const highRiskOptions = options.filter(o => o.riskLevel === 'high');
            expect(highRiskOptions).toHaveLength(0);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 9.10: Recovery Result Consistency', () => {
    it('should provide consistent recovery results', async () => {
      await fc.assert(
        fc.asyncProperty(
          detectedErrorArb,
          projectStateArb,
          async (error, projectState) => {
            const options = system.getRecoveryOptions(error as DetectedError);
            if (options.length === 0) return true;

            const option = options[0];
            
            // Execute recovery multiple times
            const result1 = await system.recoverFromError(
              error as DetectedError,
              option,
              projectState as ProjectState
            );

            const result2 = await system.recoverFromError(
              error as DetectedError,
              option,
              projectState as ProjectState
            );

            // Results should be consistent for same inputs
            expect(result1.success).toBe(result2.success);
            expect(result1.optionUsed).toBe(result2.optionUsed);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});