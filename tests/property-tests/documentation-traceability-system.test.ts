import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  DocumentationTraceabilitySystem,
  TraceabilityLink,
  RequirementTrace,
  DecisionDocumentation,
  TaskReference
} from '../../src/documentation-traceability-system.js';
import { StageId, ArchitecturalDecision } from '../../src/stage-pipeline-controller.js';
import { ProjectState } from '../../src/state-manager.js';

/**
 * Property-Based Tests: Documentation and Traceability System
 * 
 * Property 10: Comprehensive Documentation
 * For any architectural decision, specification generation, or task creation, there should be
 * complete traceability, rationale documentation, and comprehensive project documentation for handoff.
 * 
 * Validates: Requirements 10.1, 10.2, 10.3, 10.4, 10.5
 */

describe('Property-Based Tests: Documentation and Traceability System', () => {
  // System instance should be created inside each property check to ensure isolation


  // Arbitrary generators
  const stageIdArb = fc.constantFrom(...Object.values(StageId));

  const architecturalDecisionArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }),
    title: fc.string({ minLength: 5, maxLength: 50 }),
    stage: stageIdArb,
    decision: fc.string({ minLength: 10, maxLength: 100 }),
    rationale: fc.string({ minLength: 10, maxLength: 100 }),
    alternatives: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
    impact: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 3 }),
    timestamp: fc.date()
  });

  const projectStateArb = fc.record({
    projectId: fc.string({ minLength: 5, maxLength: 20 }),
    projectName: fc.string({ minLength: 3, maxLength: 30 }),
    currentStage: stageIdArb,
    completedStages: fc.array(stageIdArb, { minLength: 0, maxLength: 5 }),
    decisions: fc.array(architecturalDecisionArb, { minLength: 0, maxLength: 3 }),
    outputs: fc.array(fc.record({
      stageId: stageIdArb,
      type: fc.string({ minLength: 3, maxLength: 20 }),
      filename: fc.string({ minLength: 5, maxLength: 30 }),
      content: fc.string({ minLength: 10, maxLength: 200 }),
      timestamp: fc.date()
    }), { minLength: 0, maxLength: 10 }),
    nextAction: fc.record({
      currentStage: stageIdArb,
      status: fc.constantFrom('not-started', 'in-progress', 'completed'),
      nextStage: fc.option(stageIdArb, { nil: null }),
      description: fc.string({ minLength: 10, maxLength: 100 }),
      prerequisites: fc.array(fc.string({ minLength: 5, maxLength: 30 })),
      contextFiles: fc.array(fc.string({ minLength: 5, maxLength: 30 })),
      timestamp: fc.date()
    }),
    createdAt: fc.date(),
    updatedAt: fc.date()
  });

  describe('Property 10.1: Traceability Link Creation', () => {
    it('should create valid traceability links for any valid inputs', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('requirement', 'decision', 'task', 'output', 'test'),
          fc.string({ minLength: 3, maxLength: 20 }),
          fc.constantFrom('requirement', 'decision', 'task', 'output', 'test'),
          fc.string({ minLength: 3, maxLength: 20 }),
          fc.constantFrom('implements', 'depends-on', 'validates', 'derives-from', 'conflicts-with'),
          stageIdArb,
          fc.string({ minLength: 5, maxLength: 20 }),
          (sourceType, sourceId, targetType, targetId, relationship, stage, projectId) => {
            const system = new DocumentationTraceabilitySystem();
            const link = system.createTraceabilityLink(
              sourceType,
              sourceId,
              targetType,
              targetId,
              relationship,
              stage,
              projectId
            );

            // Link should have all required fields
            expect(link).toHaveProperty('id');
            expect(link).toHaveProperty('sourceType');
            expect(link).toHaveProperty('sourceId');
            expect(link).toHaveProperty('targetType');
            expect(link).toHaveProperty('targetId');
            expect(link).toHaveProperty('relationship');
            expect(link).toHaveProperty('stage');
            expect(link).toHaveProperty('timestamp');

            // Values should match inputs
            expect(link.sourceType).toBe(sourceType);
            expect(link.sourceId).toBe(sourceId);
            expect(link.targetType).toBe(targetType);
            expect(link.targetId).toBe(targetId);
            expect(link.relationship).toBe(relationship);
            expect(link.stage).toBe(stage);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.2: Requirement Tracking', () => {
    it('should track requirements with proper structure', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 20 }),
          fc.string({ minLength: 10, maxLength: 100 }),
          stageIdArb,
          fc.string({ minLength: 5, maxLength: 20 }),
          (requirementId, description, stage, projectId) => {
            const system = new DocumentationTraceabilitySystem();
            const trace = system.trackRequirement(requirementId, description, stage, projectId);

            // Trace should have all required fields
            expect(trace).toHaveProperty('requirementId');
            expect(trace).toHaveProperty('description');
            expect(trace).toHaveProperty('stage');
            expect(trace).toHaveProperty('implementedBy');
            expect(trace).toHaveProperty('validatedBy');
            expect(trace).toHaveProperty('decisions');
            expect(trace).toHaveProperty('status');

            // Values should match inputs
            expect(trace.requirementId).toBe(requirementId);
            expect(trace.description).toBe(description);
            expect(trace.stage).toBe(stage);

            // Arrays should be initialized
            expect(Array.isArray(trace.implementedBy)).toBe(true);
            expect(Array.isArray(trace.validatedBy)).toBe(true);
            expect(Array.isArray(trace.decisions)).toBe(true);

            // Status should be valid
            expect(['pending', 'in-progress', 'completed', 'deferred']).toContain(trace.status);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.3: Decision Documentation', () => {
    it('should document decisions with comprehensive information', () => {
      fc.assert(
        fc.property(
          architecturalDecisionArb,
          fc.string({ minLength: 10, maxLength: 200 }),
          fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
          fc.string({ minLength: 5, maxLength: 20 }),
          (decision, context, consequences, projectId) => {
            const system = new DocumentationTraceabilitySystem();
            const doc = system.documentDecision(
              decision as ArchitecturalDecision,
              context,
              consequences,
              projectId
            );

            // Documentation should have all required fields
            expect(doc).toHaveProperty('decision');
            expect(doc).toHaveProperty('context');
            expect(doc).toHaveProperty('consequences');
            expect(doc).toHaveProperty('relatedRequirements');
            expect(doc).toHaveProperty('implementationTasks');
            expect(doc).toHaveProperty('validationCriteria');
            expect(doc).toHaveProperty('reviewStatus');

            // Values should match inputs
            expect(doc.decision).toEqual(decision);
            expect(doc.context).toBe(context);
            expect(doc.consequences).toEqual(consequences);

            // Arrays should be initialized
            expect(Array.isArray(doc.relatedRequirements)).toBe(true);
            expect(Array.isArray(doc.implementationTasks)).toBe(true);
            expect(Array.isArray(doc.validationCriteria)).toBe(true);

            // Review status should be valid
            expect(['draft', 'reviewed', 'approved', 'deprecated']).toContain(doc.reviewStatus);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.4: Task Reference Management', () => {
    it('should manage task references with requirement mapping', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 20 }),
          fc.string({ minLength: 5, maxLength: 50 }),
          stageIdArb,
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
          fc.string({ minLength: 5, maxLength: 20 }),
          (taskId, title, stage, requirements, decisions, projectId) => {
            const system = new DocumentationTraceabilitySystem();
            const taskRef = system.addTaskReference(
              taskId,
              title,
              stage,
              requirements,
              decisions,
              projectId
            );

            // Task reference should have all required fields
            expect(taskRef).toHaveProperty('taskId');
            expect(taskRef).toHaveProperty('title');
            expect(taskRef).toHaveProperty('stage');
            expect(taskRef).toHaveProperty('requirements');
            expect(taskRef).toHaveProperty('decisions');
            expect(taskRef).toHaveProperty('outputs');
            expect(taskRef).toHaveProperty('dependencies');
            expect(taskRef).toHaveProperty('completionStatus');

            // Values should match inputs
            expect(taskRef.taskId).toBe(taskId);
            expect(taskRef.title).toBe(title);
            expect(taskRef.stage).toBe(stage);
            expect(taskRef.requirements).toEqual(requirements);
            expect(taskRef.decisions).toEqual(decisions);

            // Status should be valid
            expect(['not-started', 'in-progress', 'completed']).toContain(taskRef.completionStatus);

            // Traceability links should be created
            const matrix = system.getTraceabilityMatrix(projectId);
            const taskLinks = matrix.filter(link =>
              link.sourceType === 'task' && link.sourceId === taskId
            );
            expect(taskLinks.length).toBe(requirements.length + decisions.length);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.5: Project Documentation Generation', () => {
    it('should generate comprehensive project documentation', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          fc.boolean(),
          (projectState, includeTraceability) => {
            const system = new DocumentationTraceabilitySystem();
            const documentation = system.generateProjectDocumentation(
              projectState as ProjectState,
              includeTraceability
            );

            // Documentation should have all required fields
            expect(documentation).toHaveProperty('projectId');
            expect(documentation).toHaveProperty('projectName');
            expect(documentation).toHaveProperty('overview');
            expect(documentation).toHaveProperty('requirements');
            expect(documentation).toHaveProperty('decisions');
            expect(documentation).toHaveProperty('tasks');
            expect(documentation).toHaveProperty('traceabilityMatrix');
            expect(documentation).toHaveProperty('completionReport');
            expect(documentation).toHaveProperty('generatedAt');

            // Values should match project state
            expect(documentation.projectId).toBe(projectState.projectId);
            expect(documentation.projectName).toBe(projectState.projectName);

            // Arrays should be defined
            expect(Array.isArray(documentation.requirements)).toBe(true);
            expect(Array.isArray(documentation.decisions)).toBe(true);
            expect(Array.isArray(documentation.tasks)).toBe(true);
            expect(Array.isArray(documentation.traceabilityMatrix)).toBe(true);

            // Completion report should have required fields
            expect(documentation.completionReport).toHaveProperty('totalRequirements');
            expect(documentation.completionReport).toHaveProperty('completedRequirements');
            expect(documentation.completionReport).toHaveProperty('coveragePercentage');
            expect(documentation.completionReport).toHaveProperty('qualityScore');

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.6: Traceability Matrix Retrieval', () => {
    it('should retrieve traceability matrix correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 20 }),
          fc.array(
            fc.tuple(
              fc.constantFrom('requirement', 'task'),
              fc.string({ minLength: 3, maxLength: 20 }),
              fc.constantFrom('requirement', 'task'),
              fc.string({ minLength: 3, maxLength: 20 }),
              fc.constantFrom('implements', 'depends-on'),
              stageIdArb
            ),
            { minLength: 0, maxLength: 5 }
          ),
          (projectId, linkData) => {
            const system = new DocumentationTraceabilitySystem();
            // Create traceability links
            for (const [sourceType, sourceId, targetType, targetId, relationship, stage] of linkData) {
              system.createTraceabilityLink(
                sourceType,
                sourceId,
                targetType,
                targetId,
                relationship,
                stage,
                projectId
              );
            }

            // Retrieve matrix
            const matrix = system.getTraceabilityMatrix(projectId);

            // Should return correct number of links
            expect(matrix.length).toBe(linkData.length);

            // Each link should be valid
            for (const link of matrix) {
              expect(link).toHaveProperty('id');
              expect(link).toHaveProperty('sourceType');
              expect(link).toHaveProperty('targetType');
              expect(link).toHaveProperty('relationship');
              expect(link).toHaveProperty('stage');
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.7: Requirement Implementation Finding', () => {
    it('should find requirement implementations correctly', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 20 }),
          fc.string({ minLength: 3, maxLength: 20 }),
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 3 }),
          stageIdArb,
          (projectId, requirementId, taskIds, stage) => {
            const system = new DocumentationTraceabilitySystem();
            // Add tasks that implement the requirement
            for (const taskId of taskIds) {
              system.addTaskReference(
                taskId,
                `Task ${taskId}`,
                stage,
                [requirementId],
                [],
                projectId
              );
            }

            // Find implementations
            const implementations = system.findRequirementImplementations(requirementId, projectId);

            // Should find the implementing tasks
            expect(implementations.tasks.length).toBe(taskIds.length);
            expect(Array.isArray(implementations.decisions)).toBe(true);

            // Each task should implement the requirement
            for (const task of implementations.tasks) {
              expect(task.requirements).toContain(requirementId);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.8: Coverage Report Generation', () => {
    it('should generate accurate coverage reports', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 20 }),
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
          fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 3 }),
          stageIdArb,
          (projectId, requirementIds, implementedRequirementIds, stage) => {
            const system = new DocumentationTraceabilitySystem();
            // Track requirements
            for (const reqId of requirementIds) {
              system.trackRequirement(reqId, `Requirement ${reqId}`, stage, projectId);
            }

            // Add tasks for some requirements
            for (const reqId of implementedRequirementIds) {
              if (requirementIds.includes(reqId)) {
                system.addTaskReference(
                  `task-${reqId}`,
                  `Task for ${reqId}`,
                  stage,
                  [reqId],
                  [],
                  projectId
                );
              }
            }

            // Generate coverage report
            const report = system.generateCoverageReport(projectId);

            // Report should have correct structure
            expect(report).toHaveProperty('totalRequirements');
            expect(report).toHaveProperty('coveredRequirements');
            expect(report).toHaveProperty('uncoveredRequirements');
            expect(report).toHaveProperty('coveragePercentage');

            // Values should be accurate
            expect(report.totalRequirements).toBe(requirementIds.length);
            expect(report.coveredRequirements).toBeLessThanOrEqual(requirementIds.length);
            expect(Array.isArray(report.uncoveredRequirements)).toBe(true);
            expect(report.coveragePercentage).toBeGreaterThanOrEqual(0);
            expect(report.coveragePercentage).toBeLessThanOrEqual(100);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.9: Documentation Validation', () => {
    it('should validate documentation completeness', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 5, maxLength: 20 }),
          (projectId) => {
            const system = new DocumentationTraceabilitySystem();
            const validation = system.validateDocumentationCompleteness(projectId);

            // Validation should have required fields
            expect(validation).toHaveProperty('isComplete');
            expect(validation).toHaveProperty('missingDocumentation');
            expect(validation).toHaveProperty('recommendations');

            expect(typeof validation.isComplete).toBe('boolean');
            expect(Array.isArray(validation.missingDocumentation)).toBe(true);
            expect(Array.isArray(validation.recommendations)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 10.10: Markdown Export', () => {
    it('should export documentation to markdown format', () => {
      fc.assert(
        fc.property(
          projectStateArb,
          (projectState) => {
            const system = new DocumentationTraceabilitySystem();
            const documentation = system.generateProjectDocumentation(
              projectState as ProjectState
            );

            const markdown = system.exportToMarkdown(documentation);

            // Should return a string
            expect(typeof markdown).toBe('string');
            expect(markdown.length).toBeGreaterThan(0);

            // Should contain project information
            expect(markdown).toContain(projectState.projectName);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});