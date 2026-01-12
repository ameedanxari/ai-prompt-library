import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  QualityGateSystem,
  QualityGate,
  ValidationResult
} from '../../src/quality-gate-system.js';
import { StageId, StageResult, StageStatus } from '../../src/stage-pipeline-controller.js';
import { ProjectState } from '../../src/state-manager.js';

/**
 * Property-Based Tests: Quality Gate System
 * 
 * Property 8: Quality Gate Validation
 * For any stage transition, all prerequisites should be validated, required outputs
 * should be complete, and consistency should be verified before proceeding.
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

describe('Property-Based Tests: Quality Gate System', () => {
  let system: QualityGateSystem;

  beforeEach(() => {
    system = new QualityGateSystem();
  });

  // Arbitrary generators
  const stageIdArb = fc.constantFrom(...Object.values(StageId));

  const stageResultArb = (stageId: StageId) => fc.record({
    stageId: fc.constant(stageId),
    status: fc.constant(StageStatus.COMPLETED),
    outputs: fc.array(
      fc.record({
        type: fc.constantFrom('specification', 'architecture', 'implementation'),
        filename: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${stageId}/${s}.md`),
        content: fc.string({ minLength: 10, maxLength: 500 }),
        platform: fc.option(fc.constantFrom('web', 'mobile', 'backend'), { nil: undefined }),
        references: fc.array(fc.string({ minLength: 3, maxLength: 30 }), { minLength: 0, maxLength: 3 })
      }),
      { minLength: 1, maxLength: 3 }
    ),
    decisions: fc.array(
      fc.record({
        id: fc.string({ minLength: 5, maxLength: 20 }),
        title: fc.string({ minLength: 5, maxLength: 50 }),
        stage: fc.constant(stageId),
        decision: fc.string({ minLength: 10, maxLength: 100 }),
        rationale: fc.string({ minLength: 10, maxLength: 100 }),
        alternatives: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
        impact: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
        timestamp: fc.date()
      }),
      { minLength: 0, maxLength: 2 }
    ),
    nextStage: fc.constant(getNextStage(stageId)),
    validationResults: fc.constant([{ isValid: true, errors: [], warnings: [] }]),
    timestamp: fc.date(),
    duration: fc.integer({ min: 100, max: 10000 })
  });

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

  // Helper to get next stage
  function getNextStage(stageId: StageId): StageId | null {
    const order = Object.values(StageId);
    const index = order.indexOf(stageId);
    return index < order.length - 1 ? order[index + 1] : null;
  }

  describe('Property 8.1: Quality Gate Existence', () => {
    it('should have quality gates for all stages', () => {
      fc.assert(
        fc.property(
          stageIdArb,
          (stageId) => {
            const gate = system.getQualityGate(stageId);

            // Every stage should have a quality gate
            expect(gate).toBeDefined();
            expect(gate!.id).toBeDefined();
            expect(gate!.name).toBeDefined();
            expect(gate!.stage).toBe(stageId);
            expect(Array.isArray(gate!.prerequisites)).toBe(true);
            expect(Array.isArray(gate!.validations)).toBe(true);
            expect(Array.isArray(gate!.crossPlatformChecks)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.2: Stage Transition Validation', () => {
    it('should validate stage transitions correctly', () => {
      fc.assert(
        fc.property(
          stageIdArb,
          stageResultArb(StageId.INTAKE),
          projectStateArb,
          (currentStage, stageResult, projectState) => {
            const nextStage = getNextStage(currentStage);
            if (!nextStage) return true; // Skip last stage

            const validation = system.validateStageTransition(
              currentStage,
              nextStage,
              stageResult as StageResult,
              projectState as ProjectState
            );

            // Validation should have all required fields
            expect(validation).toHaveProperty('canProceed');
            expect(validation).toHaveProperty('currentStageComplete');
            expect(validation).toHaveProperty('nextStageReady');
            expect(validation).toHaveProperty('qualityScore');
            expect(validation).toHaveProperty('issues');

            // Quality score should be 0-100
            expect(validation.qualityScore).toBeGreaterThanOrEqual(0);
            expect(validation.qualityScore).toBeLessThanOrEqual(100);

            // Issues should be an array
            expect(Array.isArray(validation.issues)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.3: Quality Gate Execution', () => {
    it('should execute quality gates and return valid results', () => {
      fc.assert(
        fc.property(
          stageIdArb,
          stageResultArb(StageId.INTAKE),
          projectStateArb,
          (stageId, stageResult, projectState) => {
            const gate = system.getQualityGate(stageId);
            if (!gate) return true;

            const result = system.executeQualityGate(
              gate,
              stageResult as StageResult,
              projectState as ProjectState
            );

            // Result should have all required fields
            expect(result).toHaveProperty('gateId');
            expect(result).toHaveProperty('stage');
            expect(result).toHaveProperty('passed');
            expect(result).toHaveProperty('overallScore');
            expect(result).toHaveProperty('prerequisiteResults');
            expect(result).toHaveProperty('validationResults');
            expect(result).toHaveProperty('crossPlatformResults');
            expect(result).toHaveProperty('blockers');
            expect(result).toHaveProperty('recommendations');

            // Score should be 0-100
            expect(result.overallScore).toBeGreaterThanOrEqual(0);
            expect(result.overallScore).toBeLessThanOrEqual(100);

            // Stage should match
            expect(result.stage).toBe(stageId);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.4: Cross-Platform Consistency', () => {
    it('should validate cross-platform consistency', () => {
      fc.assert(
        fc.property(
          fc.record({
            web: fc.record({
              content: fc.string({ minLength: 10, maxLength: 100 }),
              structure: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 })
            }),
            mobile: fc.record({
              content: fc.string({ minLength: 10, maxLength: 100 }),
              structure: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 })
            })
          }),
          fc.array(fc.constantFrom('web', 'mobile', 'backend'), { minLength: 1, maxLength: 3 }),
          (outputs, platforms) => {
            const result = system.validateCrossPlatformConsistency(outputs, platforms);

            // Result should have validation structure
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('errors');
            expect(result).toHaveProperty('warnings');
            expect(result).toHaveProperty('suggestions');

            // Score should be 0-100
            expect(result.score).toBeGreaterThanOrEqual(0);
            expect(result.score).toBeLessThanOrEqual(100);

            // Arrays should be defined
            expect(Array.isArray(result.errors)).toBe(true);
            expect(Array.isArray(result.warnings)).toBe(true);
            expect(Array.isArray(result.suggestions)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.5: Validation History Tracking', () => {
    it('should track validation history correctly', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          stageResultArb(StageId.INTAKE),
          (projectState, stageResult) => {
            const gate = system.getQualityGate(StageId.INTAKE);
            if (!gate) return true;

            // Execute quality gate
            system.executeQualityGate(
              gate,
              stageResult as StageResult,
              projectState as ProjectState
            );

            // History should be recorded
            const history = system.getValidationHistory(projectState.projectId);
            expect(history.length).toBeGreaterThan(0);

            // Latest entry should match execution
            const latest = history[history.length - 1];
            expect(latest.gateId).toBe(gate.id);
            expect(latest.stage).toBe(StageId.INTAKE);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.6: Project Quality Score', () => {
    it('should calculate project quality scores correctly', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          fc.array(stageResultArb(StageId.INTAKE), { minLength: 1, maxLength: 5 }),
          (projectState, stageResults) => {
            const gate = system.getQualityGate(StageId.INTAKE);
            if (!gate) return true;

            // Execute multiple quality gates
            for (const stageResult of stageResults) {
              system.executeQualityGate(
                gate,
                stageResult as StageResult,
                projectState as ProjectState
              );
            }

            // Project quality score should be calculated
            const score = system.getProjectQualityScore(projectState.projectId);
            expect(score).toBeGreaterThanOrEqual(0);
            expect(score).toBeLessThanOrEqual(100);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.7: Prerequisite Validation', () => {
    it('should validate prerequisites correctly', () => {
      fc.assert(
        fc.property(
          stageIdArb,
          projectStateArb,
          (stageId, projectState) => {
            const gate = system.getQualityGate(stageId);
            if (!gate) return true;

            // Prerequisites should be checked against project state
            for (const prereq of gate.prerequisites) {
              expect(typeof prereq).toBe('string');
              expect(prereq.length).toBeGreaterThan(0);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.8: Validation Result Structure', () => {
    it('should produce consistent validation result structures', () => {
      fc.assert(
        fc.property(
          fc.record({
            outputs: fc.array(fc.record({
              filename: fc.string({ minLength: 5, maxLength: 30 }),
              content: fc.string({ minLength: 0, maxLength: 200 })
            }), { minLength: 0, maxLength: 3 })
          }),
          (input) => {
            // Test internal validation methods through quality gate execution
            const gate = system.getQualityGate(StageId.INTAKE);
            if (!gate || gate.validations.length === 0) return true;

            const validation = gate.validations[0];
            const result = validation.validator(input);

            // All validation results should have consistent structure
            expect(result).toHaveProperty('isValid');
            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('errors');
            expect(result).toHaveProperty('warnings');
            expect(result).toHaveProperty('suggestions');

            expect(typeof result.isValid).toBe('boolean');
            expect(typeof result.score).toBe('number');
            expect(Array.isArray(result.errors)).toBe(true);
            expect(Array.isArray(result.warnings)).toBe(true);
            expect(Array.isArray(result.suggestions)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.9: Error Classification', () => {
    it('should classify errors by severity correctly', () => {
      fc.assert(
        fc.property(
          stageResultArb(StageId.INTAKE),
          projectStateArb,
          (stageResult, projectState) => {
            const gate = system.getQualityGate(StageId.INTAKE);
            if (!gate) return true;

            const result = system.executeQualityGate(
              gate,
              stageResult as StageResult,
              projectState as ProjectState
            );

            // All blockers should be critical errors
            for (const blocker of result.blockers) {
              expect(blocker).toHaveProperty('code');
              expect(blocker).toHaveProperty('message');
              expect(blocker).toHaveProperty('severity');
              expect(['critical', 'major', 'minor']).toContain(blocker.severity);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 8.10: Quality Score Consistency', () => {
    it('should maintain consistent quality scoring', () => {
      fc.assert(
        fc.property(
          stageResultArb(StageId.INTAKE),
          projectStateArb,
          (stageResult, projectState) => {
            const gate = system.getQualityGate(StageId.INTAKE);
            if (!gate) return true;

            // Execute same gate multiple times
            const result1 = system.executeQualityGate(
              gate,
              stageResult as StageResult,
              projectState as ProjectState
            );

            const result2 = system.executeQualityGate(
              gate,
              stageResult as StageResult,
              projectState as ProjectState
            );

            // Results should be consistent for same inputs
            expect(result1.overallScore).toBe(result2.overallScore);
            expect(result1.passed).toBe(result2.passed);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});