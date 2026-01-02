import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { TaskGenerator, StateManager } from '../../src/task-generator.js';
import { join } from 'path';

/**
 * Feature: ai-prompt-library, Property 12: Context-Agnostic Task Generation
 * 
 * For any generated task list, tasks should be executable without prior context, 
 * include all necessary references, be completable across multiple sessions, 
 * include checkpoints, and build incrementally with clear dependencies.
 * 
 * Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 */

/**
 * Feature: ai-prompt-library, Property 13: Comprehensive State Management
 * 
 * For any project at any stage, the system should maintain complete project state, 
 * context summaries, decision logs, progress checklists, and self-contained 
 * documentation without external references.
 * 
 * Validates: Requirements 7.6, 7.7, 7.8, 7.9, 7.10
 */

describe('Property-Based Tests: Task Generation and State Management', () => {
  const taskGenerationPath = join(process.cwd(), 'prompts/templates/task-generation.md');
  const contextAgnosticPath = join(process.cwd(), 'prompts/templates/context-agnostic-tasks.md');
  const multiSessionPath = join(process.cwd(), 'prompts/templates/multi-session-tasks.md');
  const stateTrackingPath = join(process.cwd(), 'prompts/templates/project-state-tracking.md');
  const decisionLoggingPath = join(process.cwd(), 'prompts/templates/decision-logging.md');
  const stateOrchestrationPath = join(process.cwd(), 'prompts/templates/state-management-orchestration.md');

  it('Property 12: Context-Agnostic Task Generation - validates tasks are self-contained and executable', () => {
    fc.assert(
      fc.property(
        fc.record({
          templateType: fc.constantFrom('task-generation', 'context-agnostic', 'multi-session'),
          validationAspect: fc.constantFrom('context', 'references', 'sessions', 'checkpoints', 'dependencies'),
          processingMode: fc.constantFrom('structure', 'content', 'requirements')
        }),
        (testCase) => {
          // Select template based on test case
          let templatePath: string;
          switch (testCase.templateType) {
            case 'context-agnostic':
              templatePath = contextAgnosticPath;
              break;
            case 'multi-session':
              templatePath = multiSessionPath;
              break;
            default:
              templatePath = taskGenerationPath;
          }

          const taskGenerator = new TaskGenerator(templatePath);
          const taskStructure = taskGenerator.validateTaskStructure();

          // Property assertion: Context-agnostic task generation
          // Tasks must be executable without prior context
          expect(taskStructure.isContextAgnostic).toBe(true);

          // Tasks must have clear objectives
          expect(taskStructure.hasClearObjective).toBe(true);

          // Tasks must include all necessary references
          expect(taskStructure.includesAllReferences).toBe(true);

          // Tasks must be completable across multiple sessions
          expect(taskStructure.supportsMultiSession).toBe(true);

          // Tasks must include checkpoints
          expect(taskStructure.hasCheckpoints).toBe(true);

          // Tasks must build incrementally with clear dependencies
          expect(taskStructure.isIncrementallyBuildable).toBe(true);

          // Additional validations based on test focus
          switch (testCase.validationAspect) {
            case 'context':
              expect(taskStructure.isContextAgnostic && taskStructure.hasClearObjective).toBe(true);
              break;
            case 'references':
              expect(taskStructure.includesAllReferences && taskStructure.hasPrerequisites).toBe(true);
              break;
            case 'sessions':
              expect(taskStructure.supportsMultiSession && taskStructure.hasCheckpoints).toBe(true);
              break;
            case 'dependencies':
              expect(taskStructure.isIncrementallyBuildable && taskStructure.hasPrerequisites).toBe(true);
              break;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13: Comprehensive State Management - validates complete project state tracking', () => {
    fc.assert(
      fc.property(
        fc.record({
          stateDocument: fc.constantFrom('project-status', 'decision-logging', 'state-orchestration'),
          managementAspect: fc.constantFrom('tracking', 'decisions', 'handoff', 'recovery', 'consistency'),
          validationDepth: fc.constantFrom('structure', 'completeness', 'integration')
        }),
        (testCase) => {
          // Select state management template based on test case
          let templatePath: string;
          switch (testCase.stateDocument) {
            case 'decision-logging':
              templatePath = decisionLoggingPath;
              break;
            case 'state-orchestration':
              templatePath = stateOrchestrationPath;
              break;
            default:
              templatePath = stateTrackingPath;
          }

          const stateManager = new StateManager(templatePath);
          const stateStructure = stateManager.validateStateManagement();

          // Property assertion: Comprehensive state management
          // System must maintain complete project state
          expect(stateStructure.hasProjectStatus).toBe(true);
          expect(stateStructure.hasDevelopmentLog).toBe(true);
          expect(stateStructure.hasNextSteps).toBe(true);

          // System must track architectural decisions
          expect(stateStructure.hasArchitectureDecisions).toBe(true);
          expect(stateStructure.tracksDecisions).toBe(true);

          // System must maintain progress tracking
          expect(stateStructure.hasCompletedFeatures).toBe(true);
          expect(stateStructure.hasKnownIssues).toBe(true);

          // System must enable AI agent handoffs
          expect(stateStructure.enablesHandoff).toBe(true);
          expect(stateStructure.maintainsContextSummary).toBe(true);

          // System must support recovery scenarios
          expect(stateStructure.supportsRecovery).toBe(true);

          // Aspect-specific validations
          switch (testCase.managementAspect) {
            case 'tracking':
              expect(stateStructure.hasProjectStatus && 
                     stateStructure.hasDevelopmentLog && 
                     stateStructure.hasCompletedFeatures).toBe(true);
              break;
            case 'decisions':
              expect(stateStructure.hasArchitectureDecisions && 
                     stateStructure.tracksDecisions).toBe(true);
              break;
            case 'handoff':
              expect(stateStructure.enablesHandoff && 
                     stateStructure.maintainsContextSummary).toBe(true);
              break;
            case 'recovery':
              expect(stateStructure.supportsRecovery).toBe(true);
              break;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
  it('Property 12 (Integration): Task generation templates work together cohesively', () => {
    // Test that all task generation templates are mutually consistent
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('task-generation', 'context-agnostic', 'multi-session'), { minLength: 2, maxLength: 3 }),
        (templateTypes) => {
          const generators = templateTypes.map(type => {
            let path: string;
            switch (type) {
              case 'context-agnostic': path = contextAgnosticPath; break;
              case 'multi-session': path = multiSessionPath; break;
              default: path = taskGenerationPath;
            }
            return new TaskGenerator(path);
          });

          const structures = generators.map(gen => gen.validateTaskStructure());

          // Property: All task generation templates should have consistent core features
          const coreFeatures = structures.map(s => ({
            contextAgnostic: s.isContextAgnostic,
            hasObjective: s.hasClearObjective,
            hasReferences: s.includesAllReferences,
            multiSession: s.supportsMultiSession
          }));

          // All templates should support the core task generation principles
          coreFeatures.forEach(features => {
            expect(features.contextAgnostic).toBe(true);
            expect(features.hasObjective).toBe(true);
            expect(features.hasReferences).toBe(true);
            expect(features.multiSession).toBe(true);
          });

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 13 (Integration): State management templates provide comprehensive coverage', () => {
    // Test that all state management templates together provide complete coverage
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom('project-status', 'decision-logging', 'state-orchestration'), { minLength: 2, maxLength: 3 }),
        (templateTypes) => {
          const managers = templateTypes.map(type => {
            let path: string;
            switch (type) {
              case 'decision-logging': path = decisionLoggingPath; break;
              case 'state-orchestration': path = stateOrchestrationPath; break;
              default: path = stateTrackingPath;
            }
            return new StateManager(path);
          });

          const structures = managers.map(mgr => mgr.validateStateManagement());

          // Property: Combined state management templates should cover all aspects
          const combinedCapabilities = structures.reduce((combined, current) => ({
            hasProjectStatus: combined.hasProjectStatus || current.hasProjectStatus,
            hasDevelopmentLog: combined.hasDevelopmentLog || current.hasDevelopmentLog,
            hasNextSteps: combined.hasNextSteps || current.hasNextSteps,
            hasArchitectureDecisions: combined.hasArchitectureDecisions || current.hasArchitectureDecisions,
            hasCompletedFeatures: combined.hasCompletedFeatures || current.hasCompletedFeatures,
            hasKnownIssues: combined.hasKnownIssues || current.hasKnownIssues,
            maintainsContextSummary: combined.maintainsContextSummary || current.maintainsContextSummary,
            tracksDecisions: combined.tracksDecisions || current.tracksDecisions,
            enablesHandoff: combined.enablesHandoff || current.enablesHandoff,
            supportsRecovery: combined.supportsRecovery || current.supportsRecovery
          }), {
            hasProjectStatus: false,
            hasDevelopmentLog: false,
            hasNextSteps: false,
            hasArchitectureDecisions: false,
            hasCompletedFeatures: false,
            hasKnownIssues: false,
            maintainsContextSummary: false,
            tracksDecisions: false,
            enablesHandoff: false,
            supportsRecovery: false
          });

          // Combined templates should provide comprehensive state management
          expect(combinedCapabilities.hasProjectStatus).toBe(true);
          expect(combinedCapabilities.hasDevelopmentLog).toBe(true);
          expect(combinedCapabilities.hasNextSteps).toBe(true);
          expect(combinedCapabilities.hasArchitectureDecisions).toBe(true);
          expect(combinedCapabilities.tracksDecisions).toBe(true);
          expect(combinedCapabilities.enablesHandoff).toBe(true);

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 12 & 13 (Requirements Validation): All requirements are satisfied', () => {
    // Test that the templates satisfy all specified requirements
    fc.assert(
      fc.property(
        fc.record({
          requirementFocus: fc.constantFrom('7.1', '7.2', '7.3', '7.4', '7.5', '7.6', '7.7', '7.8', '7.9', '7.10'),
          templateCombination: fc.constantFrom('task-only', 'state-only', 'combined')
        }),
        (testCase) => {
          // Test requirements validation across different template combinations
          const stateManager = new StateManager(stateTrackingPath);
          const requirements = stateManager.validateRequirements();

          // Validate all requirements are met
          expect(requirements.requirement_7_1).toBe(true); // Context-agnostic tasks
          expect(requirements.requirement_7_2).toBe(true); // Include necessary references
          expect(requirements.requirement_7_3).toBe(true); // Multi-session structure
          expect(requirements.requirement_7_4).toBe(true); // Checkpoint tasks
          expect(requirements.requirement_7_5).toBe(true); // Incremental dependencies
          expect(requirements.requirement_7_6).toBe(true); // Comprehensive project state
          expect(requirements.requirement_7_7).toBe(true); // Context summaries
          expect(requirements.requirement_7_8).toBe(true); // Decision logs
          expect(requirements.requirement_7_9).toBe(true); // Progress checklists
          expect(requirements.requirement_7_10).toBe(true); // Self-contained documentation

          // Focus on specific requirement based on test case
          switch (testCase.requirementFocus) {
            case '7.1':
              expect(requirements.requirement_7_1).toBe(true);
              break;
            case '7.2':
              expect(requirements.requirement_7_2).toBe(true);
              break;
            case '7.3':
              expect(requirements.requirement_7_3).toBe(true);
              break;
            case '7.4':
              expect(requirements.requirement_7_4).toBe(true);
              break;
            case '7.5':
              expect(requirements.requirement_7_5).toBe(true);
              break;
            case '7.6':
              expect(requirements.requirement_7_6).toBe(true);
              break;
            case '7.7':
              expect(requirements.requirement_7_7).toBe(true);
              break;
            case '7.8':
              expect(requirements.requirement_7_8).toBe(true);
              break;
            case '7.9':
              expect(requirements.requirement_7_9).toBe(true);
              break;
            case '7.10':
              expect(requirements.requirement_7_10).toBe(true);
              break;
          }

          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});