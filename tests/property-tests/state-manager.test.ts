import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import { StateManager, NextAction, ProjectState, CompletedFeature } from '../../src/state-manager.js';
import { StageId, StageStatus, StageResult, ArchitecturalDecision, ProjectBrief } from '../../src/stage-pipeline-controller.js';

/**
 * Property-Based Tests: State Management System
 * 
 * Property 4: State Consistency Maintenance
 * For any stage completion, all state files should be updated consistently and accurately
 * reflect the current project state.
 * 
 * Property 5: Resumable Execution
 * For any project state, a new AI agent should be able to read the state files and continue
 * execution from the correct point without losing context or consistency.
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.4, 4.5, 8.1, 8.2, 8.3, 8.4, 8.5
 */

describe('Property-Based Tests: State Management System', () => {
  let stateManager: StateManager;

  beforeEach(() => {
    stateManager = new StateManager();
  });

  // Arbitrary generators
  const projectBriefArb = fc.record({
    description: fc.string({ minLength: 10, maxLength: 500 }),
    platforms: fc.array(fc.constantFrom('web', 'mobile', 'desktop', 'backend'), { minLength: 1, maxLength: 4 }),
    domain: fc.constantFrom('commerce', 'social', 'fintech', 'healthcare', 'enterprise-saas'),
    requirements: fc.array(fc.string({ minLength: 5, maxLength: 100 }), { minLength: 1, maxLength: 10 })
  });

  const stageResultArb = (stageId: StageId) => fc.record({
    stageId: fc.constant(stageId),
    status: fc.constant(StageStatus.COMPLETED),
    outputs: fc.array(
      fc.record({
        type: fc.constantFrom('specification', 'architecture', 'implementation'),
        filename: fc.string({ minLength: 5, maxLength: 50 }).map(s => `${stageId}/${s}.md`),
        content: fc.string({ minLength: 10, maxLength: 200 }),
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

  // Helper to get next stage
  function getNextStage(stageId: StageId): StageId | null {
    const order = Object.values(StageId);
    const index = order.indexOf(stageId);
    return index < order.length - 1 ? order[index + 1] : null;
  }

  describe('Property 4: State Consistency Maintenance', () => {
    describe('Property 4.1: Project Creation State', () => {
      it('should create consistent initial state for any project brief', () => {
        fc.assert(
          fc.property(
            projectBriefArb,
            fc.string({ minLength: 3, maxLength: 30 }),
            (brief, projectName) => {
              const freshManager = new StateManager();
              const state = freshManager.createProject(brief, projectName);

              // State should have all required fields
              expect(state).toHaveProperty('projectId');
              expect(state).toHaveProperty('projectName');
              expect(state).toHaveProperty('currentStage');
              expect(state).toHaveProperty('completedStages');
              expect(state).toHaveProperty('decisions');
              expect(state).toHaveProperty('outputs');
              expect(state).toHaveProperty('nextAction');
              expect(state).toHaveProperty('createdAt');
              expect(state).toHaveProperty('updatedAt');

              // Initial state should be consistent
              expect(state.currentStage).toBe(StageId.INTAKE);
              expect(state.completedStages).toHaveLength(0);
              expect(state.decisions).toHaveLength(0);
              expect(state.outputs).toHaveLength(0);
              expect(state.nextAction.currentStage).toBe(StageId.INTAKE);
              expect(state.nextAction.status).toBe(StageStatus.NOT_STARTED);

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 4.2: Stage Progress Updates', () => {
      it('should maintain consistency after stage completion', async () => {
        await fc.assert(
          fc.asyncProperty(
            projectBriefArb,
            stageResultArb(StageId.INTAKE),
            async (brief, result) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');

              // Update with stage result
              freshManager.updateStageProgress(StageId.INTAKE, result as StageResult);

              const state = freshManager.getProjectState();
              expect(state).not.toBeNull();

              // Completed stages should include the stage
              expect(state!.completedStages).toContain(StageId.INTAKE);

              // Current stage should be updated
              expect(state!.currentStage).toBe(result.nextStage || StageId.INTAKE);

              // Decisions should be added
              expect(state!.decisions.length).toBeGreaterThanOrEqual(result.decisions.length);

              // Outputs should be added
              expect(state!.outputs.length).toBeGreaterThanOrEqual(result.outputs.length);

              // Next action should be updated
              expect(state!.nextAction.currentStage).toBe(StageId.INTAKE);
              expect(state!.nextAction.status).toBe(StageStatus.COMPLETED);

              // Timestamps should be updated
              expect(state!.updatedAt.getTime()).toBeGreaterThanOrEqual(state!.createdAt.getTime());

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 4.3: Decision Recording', () => {
      it('should correctly record architectural decisions', () => {
        fc.assert(
          fc.property(
            projectBriefArb,
            fc.record({
              id: fc.string({ minLength: 5, maxLength: 20 }),
              title: fc.string({ minLength: 5, maxLength: 50 }),
              stage: fc.constantFrom(...Object.values(StageId)),
              decision: fc.string({ minLength: 10, maxLength: 100 }),
              rationale: fc.string({ minLength: 10, maxLength: 100 }),
              alternatives: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
              impact: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
              timestamp: fc.date()
            }),
            (brief, decision) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');

              const initialDecisionCount = freshManager.getProjectState()!.decisions.length;
              freshManager.saveDecision(decision as ArchitecturalDecision);

              const state = freshManager.getProjectState();
              expect(state!.decisions.length).toBe(initialDecisionCount + 1);
              expect(state!.decisions).toContainEqual(decision);

              // Development log should record the decision
              const log = freshManager.getDevelopmentLog();
              expect(log.some(e => e.action === 'DECISION_RECORDED')).toBe(true);

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 4.4: State Validation', () => {
      it('should validate state consistency correctly', async () => {
        await fc.assert(
          fc.asyncProperty(
            projectBriefArb,
            stageResultArb(StageId.INTAKE),
            async (brief, result) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');
              freshManager.updateStageProgress(StageId.INTAKE, result as StageResult);

              const validation = freshManager.validateStateConsistency();

              // Valid state should pass validation
              expect(validation).toHaveProperty('isValid');
              expect(validation).toHaveProperty('errors');
              expect(validation).toHaveProperty('warnings');
              expect(validation).toHaveProperty('inconsistencies');

              // After proper updates, state should be valid
              expect(validation.isValid).toBe(true);
              expect(validation.errors).toHaveLength(0);
              expect(validation.inconsistencies).toHaveLength(0);

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 4.5: Development Log Tracking', () => {
      it('should track all state changes in development log', async () => {
        await fc.assert(
          fc.asyncProperty(
            projectBriefArb,
            stageResultArb(StageId.INTAKE),
            async (brief, result) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');

              const logAfterCreate = freshManager.getDevelopmentLog();
              expect(logAfterCreate.length).toBeGreaterThan(0);
              expect(logAfterCreate.some(e => e.action === 'PROJECT_CREATED')).toBe(true);

              freshManager.updateStageProgress(StageId.INTAKE, result as StageResult);

              const logAfterUpdate = freshManager.getDevelopmentLog();
              expect(logAfterUpdate.length).toBeGreaterThan(logAfterCreate.length);
              expect(logAfterUpdate.some(e => e.action === 'STAGE_COMPLETED')).toBe(true);

              // Each log entry should have required fields
              for (const entry of logAfterUpdate) {
                expect(entry).toHaveProperty('timestamp');
                expect(entry).toHaveProperty('stage');
                expect(entry).toHaveProperty('action');
                expect(entry).toHaveProperty('details');
              }

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });

  describe('Property 5: Resumable Execution', () => {
    describe('Property 5.1: Context Reconstruction', () => {
      it('should reconstruct context from available files', async () => {
        await fc.assert(
          fc.asyncProperty(
            projectBriefArb,
            stageResultArb(StageId.INTAKE),
            async (brief, result) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');
              freshManager.updateStageProgress(StageId.INTAKE, result as StageResult);

              // Simulate available files
              const availableFiles = [
                'prompts/outputs/PROJECT_STATE.md',
                'prompts/outputs/NEXT_ACTION.md',
                'prompts/outputs/ARCHITECTURE_DECISIONS.md',
                'prompts/outputs/DEVELOPMENT_LOG.md'
              ];

              const reconstructed = freshManager.reconstructContext(availableFiles);

              expect(reconstructed).toHaveProperty('projectState');
              expect(reconstructed).toHaveProperty('nextAction');
              expect(reconstructed).toHaveProperty('decisions');
              expect(reconstructed).toHaveProperty('developmentLog');
              expect(reconstructed).toHaveProperty('isComplete');
              expect(reconstructed).toHaveProperty('missingData');

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 5.2: Next Action Availability', () => {
      it('should always provide next action after state updates', async () => {
        await fc.assert(
          fc.asyncProperty(
            projectBriefArb,
            stageResultArb(StageId.INTAKE),
            async (brief, result) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');

              // Next action should be available after creation
              let nextAction = freshManager.getNextAction();
              expect(nextAction).not.toBeNull();
              expect(nextAction!.currentStage).toBe(StageId.INTAKE);

              freshManager.updateStageProgress(StageId.INTAKE, result as StageResult);

              // Next action should be updated after stage completion
              nextAction = freshManager.getNextAction();
              expect(nextAction).not.toBeNull();
              expect(nextAction!.status).toBe(StageStatus.COMPLETED);
              expect(nextAction!.nextStage).toBe(result.nextStage);

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 5.3: State File Generation', () => {
      it('should generate valid state file content', async () => {
        await fc.assert(
          fc.asyncProperty(
            projectBriefArb,
            stageResultArb(StageId.INTAKE),
            async (brief, result) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');
              freshManager.updateStageProgress(StageId.INTAKE, result as StageResult);

              // Generate state files
              const nextActionContent = freshManager.generateNextActionFile();
              const projectStateContent = freshManager.generateProjectStateFile();
              const devLogContent = freshManager.generateDevelopmentLogFile();
              const decisionsContent = freshManager.generateArchitectureDecisionsFile();

              // All files should have content
              expect(nextActionContent.length).toBeGreaterThan(0);
              expect(projectStateContent.length).toBeGreaterThan(0);
              expect(devLogContent.length).toBeGreaterThan(0);

              // Files should contain expected sections
              expect(nextActionContent).toContain('# Next Action');
              expect(projectStateContent).toContain('# Project State');
              expect(devLogContent).toContain('# Development Log');

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 5.4: Sequential Stage Execution', () => {
      it('should maintain correct state through multiple stage completions', async () => {
        await fc.assert(
          fc.asyncProperty(
            projectBriefArb,
            async (brief) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');

              const stages = [StageId.INTAKE, StageId.CHARTER, StageId.ARCHITECTURE];
              
              for (let i = 0; i < stages.length; i++) {
                const stageId = stages[i];
                const nextStage = i < stages.length - 1 ? stages[i + 1] : StageId.FEATURES;
                
                const result: StageResult = {
                  stageId,
                  status: StageStatus.COMPLETED,
                  outputs: [{ type: 'spec', filename: `${stageId}/output.md`, content: 'content', references: [] }],
                  decisions: [],
                  nextStage,
                  validationResults: [{ isValid: true, errors: [], warnings: [] }],
                  timestamp: new Date(),
                  duration: 1000
                };

                freshManager.updateStageProgress(stageId, result);

                const state = freshManager.getProjectState();
                expect(state!.completedStages).toContain(stageId);
                expect(state!.completedStages.length).toBe(i + 1);
              }

              // Validate final state
              const validation = freshManager.validateStateConsistency();
              expect(validation.isValid).toBe(true);

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });

    describe('Property 5.5: Feature Completion Tracking', () => {
      it('should track completed features correctly', () => {
        fc.assert(
          fc.property(
            projectBriefArb,
            fc.record({
              id: fc.string({ minLength: 5, maxLength: 20 }),
              name: fc.string({ minLength: 5, maxLength: 50 }),
              stage: fc.constantFrom(...Object.values(StageId)),
              description: fc.string({ minLength: 10, maxLength: 100 }),
              completedAt: fc.date(),
              relatedDecisions: fc.array(fc.string({ minLength: 5, maxLength: 20 }), { minLength: 0, maxLength: 3 })
            }),
            (brief, feature) => {
              const freshManager = new StateManager();
              freshManager.createProject(brief, 'test-project');

              const initialFeatures = freshManager.getCompletedFeatures();
              freshManager.markFeatureCompleted(feature as CompletedFeature);

              const features = freshManager.getCompletedFeatures();
              expect(features.length).toBe(initialFeatures.length + 1);
              expect(features).toContainEqual(feature);

              // Development log should record the feature
              const log = freshManager.getDevelopmentLog();
              expect(log.some(e => e.action === 'FEATURE_COMPLETED')).toBe(true);

              // Generated file should include the feature
              const featuresContent = freshManager.generateCompletedFeaturesFile();
              expect(featuresContent).toContain(feature.name);

              return true;
            }
          ),
          { numRuns: 100 }
        );
      });
    });
  });
});
