import { describe, it, expect, beforeEach } from 'vitest';
import * as fc from 'fast-check';
import {
  TaskGenerationEngine,
  Task,
  LargeTask,
  Specification,
  Reference
} from '../../src/task-generation-engine.js';
import { StageId } from '../../src/stage-pipeline-controller.js';

/**
 * Property-Based Tests: Task Generation Engine
 * 
 * Property 2: Context-Agnostic Task Generation
 * For any generated implementation task, it should contain all necessary context,
 * references, and completion criteria to be executable without conversation history.
 * 
 * Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5
 */

describe('Property-Based Tests: Task Generation Engine', () => {
  let engine: TaskGenerationEngine;

  beforeEach(() => {
    engine = new TaskGenerationEngine();
  });

  // Arbitrary generators
  const stageIdArb = fc.constantFrom(...Object.values(StageId));

  const specificationArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'x')),
    name: fc.string({ minLength: 5, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9 ]/g, '')),
    type: fc.constantFrom('feature', 'architecture', 'api', 'data-model'),
    content: fc.string({ minLength: 50, maxLength: 500 }),
    stage: stageIdArb,
    requirements: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 })
  });

  const largeTaskArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, 'x')),
    title: fc.string({ minLength: 5, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9 ]/g, '')),
    description: fc.string({ minLength: 50, maxLength: 500 }),
    estimatedTokens: fc.integer({ min: 5000, max: 20000 }),
    subtasks: fc.array(fc.string({ minLength: 10, maxLength: 50 }), { minLength: 3, maxLength: 10 })
  });

  const referenceArb = fc.record({
    type: fc.constantFrom('specification', 'asset', 'decision', 'output') as fc.Arbitrary<'specification' | 'asset' | 'decision' | 'output'>,
    path: fc.string({ minLength: 5, maxLength: 50 }).map(s => `path/${s.replace(/[^a-zA-Z0-9]/g, '')}.md`),
    description: fc.string({ minLength: 5, maxLength: 100 }),
    required: fc.boolean()
  });

  describe('Property 2.1: Task Generation from Specifications', () => {
    it('should generate tasks for any valid specification', () => {
      fc.assert(
        fc.property(
          specificationArb,
          (spec) => {
            const tasks = engine.generateTasks([spec as Specification]);

            // Should generate at least one task per requirement
            expect(tasks.length).toBeGreaterThanOrEqual(spec.requirements.length);

            // Each task should have required fields
            for (const task of tasks) {
              expect(task.id).toBeDefined();
              expect(task.title).toBeDefined();
              expect(task.description.length).toBeGreaterThan(0);
              expect(task.context).toBeDefined();
              expect(task.completionCriteria.length).toBeGreaterThan(0);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.2: Context-Agnostic Task Structure', () => {
    it('should generate context-agnostic tasks', () => {
      fc.assert(
        fc.property(
          specificationArb,
          (spec) => {
            const tasks = engine.generateTasks([spec as Specification]);

            for (const task of tasks) {
              const validation = engine.validateTaskCompleteness(task);

              // Task should be valid
              expect(validation.isValid).toBe(true);

              // Task should be context-agnostic
              expect(validation.isContextAgnostic).toBe(true);

              // Task should have completion criteria
              expect(validation.hasCompletionCriteria).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.3: Task Chunking', () => {
    it('should chunk large tasks into smaller pieces', () => {
      fc.assert(
        fc.property(
          largeTaskArb,
          (largeTask) => {
            const chunks = engine.chunkLargeTask(largeTask as LargeTask);

            // Should create multiple chunks for large tasks
            if (largeTask.estimatedTokens > engine.getTokenLimit()) {
              expect(chunks.length).toBeGreaterThan(1);
            }

            // Each chunk should be within token limit
            for (const chunk of chunks) {
              expect(chunk.estimatedTokens).toBeLessThanOrEqual(engine.getTokenLimit());
            }

            // Chunks should have sequential dependencies
            for (let i = 1; i < chunks.length; i++) {
              expect(chunks[i].dependencies).toContain(chunks[i - 1].id);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.4: Task Validation', () => {
    it('should validate task completeness correctly', () => {
      fc.assert(
        fc.property(
          specificationArb,
          (spec) => {
            const tasks = engine.generateTasks([spec as Specification]);

            for (const task of tasks) {
              const validation = engine.validateTaskCompleteness(task);

              // Validation result should have all required fields
              expect(validation).toHaveProperty('isValid');
              expect(validation).toHaveProperty('isContextAgnostic');
              expect(validation).toHaveProperty('hasAllReferences');
              expect(validation).toHaveProperty('hasCompletionCriteria');
              expect(validation).toHaveProperty('hasValidationSteps');
              expect(validation).toHaveProperty('errors');
              expect(validation).toHaveProperty('warnings');

              // Arrays should be defined
              expect(Array.isArray(validation.errors)).toBe(true);
              expect(Array.isArray(validation.warnings)).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.5: Reference Addition', () => {
    it('should correctly add references to tasks', () => {
      fc.assert(
        fc.property(
          specificationArb,
          fc.array(referenceArb, { minLength: 1, maxLength: 5 }),
          (spec, references) => {
            const tasks = engine.generateTasks([spec as Specification]);
            
            if (tasks.length > 0) {
              const originalTask = tasks[0];
              const originalRefCount = originalTask.references.length;
              
              const updatedTask = engine.addContextReferences(originalTask, references as Reference[]);

              // References should be added
              expect(updatedTask.references.length).toBe(originalRefCount + references.length);

              // Specification references should be in context
              const specRefs = references.filter(r => r.type === 'specification');
              for (const ref of specRefs) {
                expect(updatedTask.context.relatedSpecifications).toContain(ref.path);
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.6: Token Estimation', () => {
    it('should estimate tokens consistently', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 10, maxLength: 1000 }),
          (content) => {
            const tokens = engine.estimateTokens(content);

            // Token count should be positive
            expect(tokens).toBeGreaterThan(0);

            // Token count should be roughly proportional to content length
            // (approximately 4 characters per token)
            const expectedMin = Math.floor(content.length / 5);
            const expectedMax = Math.ceil(content.length / 3);
            expect(tokens).toBeGreaterThanOrEqual(expectedMin);
            expect(tokens).toBeLessThanOrEqual(expectedMax);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.7: Multiple Specification Handling', () => {
    it('should generate tasks for multiple specifications', () => {
      fc.assert(
        fc.property(
          fc.array(specificationArb, { minLength: 1, maxLength: 5 }),
          (specs) => {
            const tasks = engine.generateTasks(specs as Specification[]);

            // Should generate tasks for all specifications
            const totalRequirements = specs.reduce((sum, s) => sum + s.requirements.length, 0);
            expect(tasks.length).toBeGreaterThanOrEqual(totalRequirements);

            // Each task should reference its source specification
            for (const task of tasks) {
              expect(task.context.relatedSpecifications.length).toBeGreaterThan(0);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.8: Dependency Resolution', () => {
    it('should resolve dependencies correctly', () => {
      fc.assert(
        fc.property(
          specificationArb,
          (spec) => {
            // Ensure multiple requirements for dependency testing
            const specWithMultipleReqs = {
              ...spec,
              requirements: spec.requirements.length > 1 
                ? spec.requirements 
                : [...spec.requirements, 'Additional requirement']
            };

            const tasks = engine.generateTasks([specWithMultipleReqs as Specification]);

            // Build set of valid task IDs
            const taskIds = new Set(tasks.map(t => t.id));

            // All dependencies should reference valid task IDs
            for (const task of tasks) {
              for (const dep of task.dependencies) {
                expect(taskIds.has(dep)).toBe(true);
              }
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.9: Task Description Quality', () => {
    it('should generate comprehensive task descriptions', () => {
      fc.assert(
        fc.property(
          specificationArb,
          (spec) => {
            const tasks = engine.generateTasks([spec as Specification]);

            for (const task of tasks) {
              // Description should contain key sections
              expect(task.description).toContain('Objective');
              expect(task.description).toContain('Context');

              // Description should reference the specification
              expect(task.description.toLowerCase()).toContain(spec.stage.toLowerCase().replace(/-/g, ' ').split(' ').pop() || '');
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 2.10: Token Limit Configuration', () => {
    it('should respect token limit configuration', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1000, max: 10000 }),
          largeTaskArb,
          (tokenLimit, largeTask) => {
            const customEngine = new TaskGenerationEngine(tokenLimit);
            
            expect(customEngine.getTokenLimit()).toBe(tokenLimit);

            const chunks = customEngine.chunkLargeTask(largeTask as LargeTask);

            // All chunks should respect the token limit
            for (const chunk of chunks) {
              expect(chunk.estimatedTokens).toBeLessThanOrEqual(tokenLimit);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
