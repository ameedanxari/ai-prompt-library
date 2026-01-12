import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import {
  OutputDirectoryManager,
  OutputType,
  OUTPUT_STRUCTURE,
  Specification,
  ImplementationPrompt,
  Task
} from '../../src/output-directory-manager.js';
import { StageId } from '../../src/stage-pipeline-controller.js';

/**
 * Property-Based Tests: Output Directory Manager
 * 
 * Property 3: Output Directory Organization
 * For any stage execution, all generated outputs should be placed in the correct
 * standardized directory structure according to their type and purpose.
 * 
 * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5
 */

describe('Property-Based Tests: Output Directory Manager', () => {
  const TEST_BASE_PATH = 'test-outputs';
  let manager: OutputDirectoryManager;

  beforeEach(() => {
    // Clean up test directory
    if (existsSync(TEST_BASE_PATH)) {
      rmSync(TEST_BASE_PATH, { recursive: true });
    }
    manager = new OutputDirectoryManager(TEST_BASE_PATH);
  });

  afterEach(() => {
    // Clean up after tests
    if (existsSync(TEST_BASE_PATH)) {
      rmSync(TEST_BASE_PATH, { recursive: true });
    }
  });

  // Arbitrary generators
  const stageIdArb = fc.constantFrom(...Object.values(StageId));
  const outputTypeArb = fc.constantFrom(...Object.values(OutputType));

  const stageOutputArb = fc.record({
    type: outputTypeArb,
    filename: fc.string({ minLength: 3, maxLength: 30 }).map(s => `${s.replace(/[^a-zA-Z0-9]/g, '')}.md`),
    content: fc.string({ minLength: 10, maxLength: 500 }),
    platform: fc.option(fc.constantFrom('web', 'mobile', 'backend'), { nil: undefined }),
    references: fc.array(fc.string({ minLength: 3, maxLength: 30 }), { minLength: 0, maxLength: 5 })
  });

  const specificationArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')),
    name: fc.string({ minLength: 3, maxLength: 30 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')),
    type: fc.constantFrom('feature', 'architecture', 'api', 'data-model'),
    content: fc.string({ minLength: 10, maxLength: 500 }),
    platform: fc.option(fc.constantFrom('web', 'mobile', 'backend'), { nil: undefined }),
    stage: stageIdArb
  });

  const implementationPromptArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')),
    title: fc.string({ minLength: 3, maxLength: 30 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')),
    content: fc.string({ minLength: 10, maxLength: 500 }),
    stage: stageIdArb,
    dependencies: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
    estimatedTokens: fc.integer({ min: 100, max: 10000 })
  });

  const taskArb = fc.record({
    id: fc.string({ minLength: 5, maxLength: 20 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')),
    title: fc.string({ minLength: 3, maxLength: 50 }).map(s => s.replace(/[^a-zA-Z0-9]/g, '')),
    description: fc.string({ minLength: 10, maxLength: 200 }),
    stage: stageIdArb,
    dependencies: fc.array(fc.string({ minLength: 3, maxLength: 20 }), { minLength: 0, maxLength: 5 }),
    completionCriteria: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 })
  });

  describe('Property 3.1: Directory Structure Creation', () => {
    it('should create complete directory structure', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (_iteration) => {
            const freshManager = new OutputDirectoryManager(TEST_BASE_PATH);
            freshManager.createDirectoryStructure();

            const structure = freshManager.getOutputStructure();

            // All main directories should exist
            expect(existsSync(structure.base)).toBe(true);
            expect(existsSync(structure.specifications)).toBe(true);
            expect(existsSync(structure.implementation)).toBe(true);
            expect(existsSync(structure.tasks)).toBe(true);
            expect(existsSync(structure.stages)).toBe(true);
            expect(existsSync(structure.state)).toBe(true);

            // Stage-specific directories should exist
            for (const stageId of Object.values(StageId)) {
              const stageDir = join(structure.stages, stageId);
              expect(existsSync(stageDir)).toBe(true);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.2: Output Type Routing', () => {
    it('should route outputs to correct directories based on type', () => {
      fc.assert(
        fc.property(
          outputTypeArb,
          stageIdArb,
          (outputType, stageId) => {
            const freshManager = new OutputDirectoryManager(TEST_BASE_PATH);
            freshManager.createDirectoryStructure();

            const directory = freshManager.getOutputDirectory(outputType, stageId);
            const structure = freshManager.getOutputStructure();

            // Verify correct routing
            switch (outputType) {
              case OutputType.SPECIFICATION:
                expect(directory).toBe(structure.specifications);
                break;
              case OutputType.IMPLEMENTATION_PROMPT:
                expect(directory).toBe(structure.implementation);
                break;
              case OutputType.TASKS:
                expect(directory).toBe(structure.tasks);
                break;
              case OutputType.STATE:
                expect(directory).toBe(structure.state);
                break;
              default:
                // Stage-specific outputs go to stages directory
                expect(directory).toContain(structure.stages);
                break;
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.3: Stage Output Saving', () => {
    it('should save stage outputs to correct locations', () => {
      fc.assert(
        fc.property(
          stageIdArb,
          stageOutputArb,
          (stageId, output) => {
            const freshManager = new OutputDirectoryManager(TEST_BASE_PATH);
            freshManager.createDirectoryStructure();

            const result = freshManager.saveStageOutput(stageId, output);

            // Save should succeed
            expect(result.success).toBe(true);
            expect(result.filepath).toBeDefined();

            // File should exist
            expect(existsSync(result.filepath)).toBe(true);

            // File should be in correct directory
            const expectedDir = freshManager.getOutputDirectory(output.type, stageId);
            expect(result.filepath.startsWith(expectedDir)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.4: Specification Saving', () => {
    it('should save specifications with correct formatting', () => {
      fc.assert(
        fc.property(
          specificationArb,
          (spec) => {
            const freshManager = new OutputDirectoryManager(TEST_BASE_PATH);
            freshManager.createDirectoryStructure();

            const result = freshManager.saveSpecification(spec as Specification);

            // Save should succeed
            expect(result.success).toBe(true);
            expect(existsSync(result.filepath)).toBe(true);

            // File should be in specifications directory
            const structure = freshManager.getOutputStructure();
            expect(result.filepath.startsWith(structure.specifications)).toBe(true);

            // Filename should contain spec id and name
            expect(result.filepath).toContain(spec.id);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.5: Implementation Prompt Saving', () => {
    it('should save implementation prompts with correct formatting', () => {
      fc.assert(
        fc.property(
          implementationPromptArb,
          (prompt) => {
            const freshManager = new OutputDirectoryManager(TEST_BASE_PATH);
            freshManager.createDirectoryStructure();

            const result = freshManager.saveImplementationPrompt(prompt as ImplementationPrompt);

            // Save should succeed
            expect(result.success).toBe(true);
            expect(existsSync(result.filepath)).toBe(true);

            // File should be in implementation directory
            const structure = freshManager.getOutputStructure();
            expect(result.filepath.startsWith(structure.implementation)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.6: Task List Saving', () => {
    it('should save task lists with correct formatting', () => {
      fc.assert(
        fc.property(
          fc.array(taskArb, { minLength: 1, maxLength: 10 }),
          fc.string({ minLength: 3, maxLength: 20 }).map(s => `${s.replace(/[^a-zA-Z0-9]/g, '')}.md`),
          (tasks, filename) => {
            const freshManager = new OutputDirectoryManager(TEST_BASE_PATH);
            freshManager.createDirectoryStructure();

            const result = freshManager.saveTaskList(tasks as Task[], filename);

            // Save should succeed
            expect(result.success).toBe(true);
            expect(existsSync(result.filepath)).toBe(true);

            // File should be in tasks directory
            const structure = freshManager.getOutputStructure();
            expect(result.filepath.startsWith(structure.tasks)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.7: State File Saving', () => {
    it('should save state files to correct location', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('NEXT_ACTION.md', 'PROJECT_STATE.md', 'DEVELOPMENT_LOG.md'),
          fc.string({ minLength: 10, maxLength: 500 }),
          (filename, content) => {
            const freshManager = new OutputDirectoryManager(TEST_BASE_PATH);
            freshManager.createDirectoryStructure();

            const result = freshManager.saveStateFile(filename, content);

            // Save should succeed
            expect(result.success).toBe(true);
            expect(existsSync(result.filepath)).toBe(true);

            // File should be in state directory
            const structure = freshManager.getOutputStructure();
            expect(result.filepath.startsWith(structure.state)).toBe(true);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.8: Directory Validation', () => {
    it('should correctly validate directory structure', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (iteration) => {
            // Use unique path per iteration to avoid state pollution
            const uniquePath = `${TEST_BASE_PATH}-validation-${iteration}`;
            const freshManager = new OutputDirectoryManager(uniquePath);
            
            try {
              // Before creation, validation should fail
              const beforeValidation = freshManager.validateDirectoryStructure();
              expect(beforeValidation.isValid).toBe(false);
              expect(beforeValidation.missingDirectories.length).toBeGreaterThan(0);

              // After creation, validation should pass
              freshManager.createDirectoryStructure();
              const afterValidation = freshManager.validateDirectoryStructure();
              expect(afterValidation.isValid).toBe(true);
              expect(afterValidation.missingDirectories).toHaveLength(0);

              return true;
            } finally {
              // Clean up
              if (existsSync(uniquePath)) {
                rmSync(uniquePath, { recursive: true });
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.9: Directory Repair', () => {
    it('should repair missing directories', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }),
          (iteration) => {
            // Use unique path per iteration
            const uniquePath = `${TEST_BASE_PATH}-repair-${iteration}`;
            const freshManager = new OutputDirectoryManager(uniquePath);
            
            try {
              // Create partial structure
              mkdirSync(join(uniquePath, OUTPUT_STRUCTURE.base), { recursive: true });

              // Validation should show missing directories
              const beforeRepair = freshManager.validateDirectoryStructure();
              expect(beforeRepair.missingDirectories.length).toBeGreaterThan(0);

              // Repair should fix missing directories
              const afterRepair = freshManager.repairDirectoryStructure();
              expect(afterRepair.isValid).toBe(true);
              expect(afterRepair.missingDirectories).toHaveLength(0);

              return true;
            } finally {
              // Clean up
              if (existsSync(uniquePath)) {
                rmSync(uniquePath, { recursive: true });
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 3.10: File Listing', () => {
    it('should list files in output directories', () => {
      fc.assert(
        fc.property(
          fc.array(specificationArb, { minLength: 1, maxLength: 5 }),
          fc.integer({ min: 1, max: 1000 }),
          (specs, iteration) => {
            // Use unique path per iteration
            const uniquePath = `${TEST_BASE_PATH}-listing-${iteration}`;
            const freshManager = new OutputDirectoryManager(uniquePath);
            
            try {
              freshManager.createDirectoryStructure();

              // Save some specifications - use unique IDs to avoid collisions
              const savedCount = new Set<string>();
              for (let i = 0; i < specs.length; i++) {
                const spec = { ...specs[i], id: `spec-${iteration}-${i}` };
                freshManager.saveSpecification(spec as Specification);
                savedCount.add(spec.id);
              }

              // List files should return saved files
              const files = freshManager.listOutputFiles(OutputType.SPECIFICATION);
              expect(files.length).toBe(savedCount.size);

              // Each file should exist
              for (const file of files) {
                expect(existsSync(file)).toBe(true);
              }

              return true;
            } finally {
              // Clean up
              if (existsSync(uniquePath)) {
                rmSync(uniquePath, { recursive: true });
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
