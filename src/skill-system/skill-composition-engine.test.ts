/**
 * Unit and Property Tests for Skill Composition Engine
 * 
 * Tests skill composition with dependency validation and input/output schema compatibility checking.
 * Includes property tests for skill composition commutativity.
 * 
 * Validates: Requirements 2.3, 2.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import {
  createSkillCompositionEngine,
  DefaultSkillCompositionEngine,
  SkillCompositionEngine,
  CompositionOptions,
  CompositionResult
} from './skill-composition-engine.js';
import {
  createSkillDefinition,
  SkillDefinition,
  SkillDependency,
  SkillCategory,
  JSONSchema
} from './skill-definition.js';
import { InMemorySkillGraph } from './skill-graph.js';

describe('SkillCompositionEngine Interface', () => {
  let compositionEngine: SkillCompositionEngine;
  let skillGraph: InMemorySkillGraph;
  
  beforeEach(() => {
    compositionEngine = new DefaultSkillCompositionEngine();
    skillGraph = new InMemorySkillGraph();
  });
  
  afterEach(() => {
    skillGraph.clear();
  });
  
  describe('composeSkills', () => {
    beforeEach(() => {
      // Register test skills
      const skills: SkillDefinition[] = [
        // Skill 1: String processor
        createSkillDefinition({
          id: 'string-processor',
          name: 'String Processor',
          version: '1.0.0',
          description: 'Processes string inputs',
          category: 'utility',
          inputSchema: {
            type: 'object',
            properties: {
              text: { type: 'string' }
            },
            required: ['text']
          },
          outputSchema: {
            type: 'object',
            properties: {
              processedText: { type: 'string' },
              length: { type: 'number' }
            }
          },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: {
            type: 'typescript-function',
            runtime: 'nodejs',
            entryPoint: 'processString',
            source: 'function processString(input) { return { processedText: input.text.toUpperCase(), length: input.text.length }; }'
          },
          tests: [],
          examples: []
        }),
        
        // Skill 2: Number processor
        createSkillDefinition({
          id: 'number-processor',
          name: 'Number Processor',
          version: '1.0.0',
          description: 'Processes number inputs',
          category: 'utility',
          inputSchema: {
            type: 'object',
            properties: {
              value: { type: 'number' }
            },
            required: ['value']
          },
          outputSchema: {
            type: 'object',
            properties: {
              doubled: { type: 'number' },
              squared: { type: 'number' }
            }
          },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: {
            type: 'typescript-function',
            runtime: 'nodejs',
            entryPoint: 'processNumber',
            source: 'function processNumber(input) { return { doubled: input.value * 2, squared: input.value * input.value }; }'
          },
          tests: [],
          examples: []
        }),

        // Skill 3: Consumes the string processor output
        createSkillDefinition({
          id: 'length-reporter',
          name: 'Length Reporter',
          version: '1.0.0',
          description: 'Reports processed string length',
          category: 'utility',
          inputSchema: {
            type: 'object',
            properties: {
              processedText: { type: 'string' },
              length: { type: 'number' }
            },
            required: ['processedText', 'length']
          },
          outputSchema: {
            type: 'object',
            properties: {
              summary: { type: 'string' }
            }
          },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: {
            type: 'typescript-function',
            runtime: 'nodejs',
            entryPoint: 'reportLength',
            source: 'function reportLength(input) { return { summary: `${input.processedText}:${input.length}` }; }'
          },
          tests: [],
          examples: []
        }),
        
        // Skill 4: Dependent skill (depends on string-processor)
        createSkillDefinition({
          id: 'dependent-skill',
          name: 'Dependent Skill',
          version: '1.0.0',
          description: 'Depends on string processor',
          category: 'utility',
          inputSchema: {
            type: 'object',
            properties: {
              data: { type: 'object' }
            }
          },
          outputSchema: {
            type: 'object',
            properties: {
              result: { type: 'string' }
            }
          },
          dependencies: [
            { skillId: 'string-processor', versionConstraint: '^1.0.0', required: true }
          ],
          qualityMetrics: new Map(),
          implementation: {
            type: 'typescript-function',
            runtime: 'nodejs',
            entryPoint: 'processDependent',
            source: 'function processDependent(input) { return { result: "processed" }; }'
          },
          tests: [],
          examples: []
        }),
        
        // Skill 5: Incompatible schema skill
        createSkillDefinition({
          id: 'incompatible-skill',
          name: 'Incompatible Skill',
          version: '1.0.0',
          description: 'Has incompatible schema',
          category: 'utility',
          inputSchema: {
            type: 'object',
            properties: {
              incompatibleField: { type: 'boolean' }
            },
            required: ['incompatibleField']
          },
          outputSchema: {
            type: 'object',
            properties: {
              output: { type: 'boolean' }
            }
          },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: {
            type: 'typescript-function',
            runtime: 'nodejs',
            entryPoint: 'processIncompatible',
            source: 'function processIncompatible(input) { return { output: input.incompatibleField }; }'
          },
          tests: [],
          examples: []
        })
      ];
      
      for (const skill of skills) {
        skillGraph.registerSkill(skill);
      }
    });
    
    it('should compose compatible skills successfully', async () => {
      const result = await compositionEngine.composeSkills(
        ['string-processor', 'length-reporter'],
        skillGraph
      );
      
      expect(result.success).toBe(true);
      expect(result.composedSkill).toBeDefined();
      expect(result.details?.skillCount).toBe(2);
      expect(result.composedSkill?.inputSchema).toEqual(skillGraph.getSkill('string-processor')?.inputSchema);
      expect(result.composedSkill?.outputSchema).toEqual(skillGraph.getSkill('length-reporter')?.outputSchema);
    });
    
    it('should handle single skill composition', async () => {
      const result = await compositionEngine.composeSkills(
        ['string-processor'],
        skillGraph
      );
      
      expect(result.success).toBe(true);
      expect(result.composedSkill).toBeDefined();
      expect(result.warnings).toContain('Only one skill provided for composition');
      expect(result.details?.skillCount).toBe(1);
    });
    
    it('should fail composition with unresolved dependencies', async () => {
      skillGraph.clear();
      skillGraph.registerSkill(createSkillDefinition({
        id: 'dependent-skill',
        name: 'Dependent Skill',
        version: '1.0.0',
        description: 'Depends on a missing string processor',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        dependencies: [
          { skillId: 'string-processor', versionConstraint: '^1.0.0', required: true }
        ],
        qualityMetrics: new Map(),
        implementation: {
          type: 'typescript-function',
          runtime: 'nodejs',
          entryPoint: 'processDependent',
          source: 'function processDependent(input) { return input; }'
        },
        tests: [],
        examples: []
      }));

      const result = await compositionEngine.composeSkills(
        ['dependent-skill'],
        skillGraph,
        { strictDependencyValidation: true }
      );
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should fail composition with schema incompatibility', async () => {
      const result = await compositionEngine.composeSkills(
        ['string-processor', 'incompatible-skill'],
        skillGraph,
        { strictSchemaValidation: true }
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Schema compatibility check failed');
      expect(result.details?.schemasCompatible).toBe(false);
    });
    
    it('should allow partial composition when configured', async () => {
      const result = await compositionEngine.composeSkills(
        ['string-processor', 'incompatible-skill'],
        skillGraph,
        { 
          strictSchemaValidation: false,
          allowPartialComposition: true 
        }
      );
      
      // With allowPartialComposition and strictSchemaValidation: false,
      // composition should attempt to proceed despite schema incompatibility
      expect(result).toBeDefined();
      // May have warnings about schema issues
      expect(result.composedSkill).toBeDefined();
    });
    
    it('should respect maxSkills limit', async () => {
      const result = await compositionEngine.composeSkills(
        ['string-processor', 'number-processor'],
        skillGraph,
        { maxSkills: 1 }
      );
      
      // Should fail because we're trying to compose 2 skills with maxSkills: 1
      expect(result.success).toBe(false);
      expect(result.errors[0]).toMatch(/Too many skills to compose/);
    });
    
    it('should generate composite skill with custom options', async () => {
      const options: CompositionOptions = {
        name: 'Custom Composite',
        description: 'Custom composed skill',
        category: 'backend',
        strictDependencyValidation: false,
        strictSchemaValidation: false
      };
      
      const result = await compositionEngine.composeSkills(
        ['string-processor', 'length-reporter'],
        skillGraph,
        options
      );
      
      expect(result.success).toBe(true);
      expect(result.composedSkill?.name).toBe('Custom Composite');
      expect(result.composedSkill?.description).toContain('Custom composed skill');
      expect(result.composedSkill?.category).toBe('backend');
    });
  });
  
  describe('canComposeSkills', () => {
    it('should return true for composable skills', async () => {
      skillGraph.registerSkill(createSkillDefinition({
        id: 'string-processor',
        name: 'String Processor',
        version: '1.0.0',
        description: 'Processes string inputs',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          },
          required: ['text']
        },
        outputSchema: {
          type: 'object',
          properties: {
            processedText: { type: 'string' },
            length: { type: 'number' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: {
          type: 'typescript-function',
          runtime: 'nodejs',
          entryPoint: 'processString',
          source: 'function processString(input) { return { processedText: input.text.toUpperCase(), length: input.text.length }; }'
        },
        tests: [],
        examples: []
      }));
      skillGraph.registerSkill(createSkillDefinition({
        id: 'length-reporter',
        name: 'Length Reporter',
        version: '1.0.0',
        description: 'Reports processed string length',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            processedText: { type: 'string' },
            length: { type: 'number' }
          },
          required: ['processedText', 'length']
        },
        outputSchema: {
          type: 'object',
          properties: {
            summary: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: {
          type: 'typescript-function',
          runtime: 'nodejs',
          entryPoint: 'reportLength',
          source: 'function reportLength(input) { return { summary: `${input.processedText}:${input.length}` }; }'
        },
        tests: [],
        examples: []
      }));

      const { canCompose, reasons } = await compositionEngine.canComposeSkills(
        ['string-processor', 'length-reporter'],
        skillGraph
      );
      
      expect(canCompose).toBe(true);
      expect(reasons).toHaveLength(0);
    });
    
    it('should return false for skills with unresolved dependencies', async () => {
      skillGraph.clear();
      skillGraph.registerSkill(createSkillDefinition({
        id: 'dependent-skill',
        name: 'Dependent Skill',
        version: '1.0.0',
        description: 'Depends on a missing string processor',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        dependencies: [
          { skillId: 'string-processor', versionConstraint: '^1.0.0', required: true }
        ],
        qualityMetrics: new Map(),
        implementation: {
          type: 'typescript-function',
          runtime: 'nodejs',
          entryPoint: 'processDependent',
          source: 'function processDependent(input) { return input; }'
        },
        tests: [],
        examples: []
      }));

      const { canCompose, reasons } = await compositionEngine.canComposeSkills(
        ['dependent-skill'],
        skillGraph
      );
      
      expect(canCompose).toBe(false);
      expect(reasons.length).toBeGreaterThan(0);
    });
    
    it('should handle non-existent skills', async () => {
      const { canCompose, reasons } = await compositionEngine.canComposeSkills(
        ['non-existent-skill'],
        skillGraph
      );
      
      expect(canCompose).toBe(false);
      expect(reasons).toContain('Skill not found: non-existent-skill');
    });
  });
  
  describe('analyzeSchemaCompatibility', () => {
    it('should detect compatible schemas', () => {
      const skillA = createSkillDefinition({
        id: 'skill-a',
        name: 'Skill A',
        version: '1.0.0',
        description: 'Test skill A',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            age: { type: 'number' }
          },
          required: ['name']
        },
        outputSchema: {
          type: 'object',
          properties: {
            processedName: { type: 'string' },
            processedAge: { type: 'number' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'skill-b',
        name: 'Skill B',
        version: '1.0.0',
        description: 'Test skill B',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            processedName: { type: 'string' },
            processedAge: { type: 'number' }
          },
          required: ['processedName']
        },
        outputSchema: {
          type: 'object',
          properties: {
            finalResult: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const compatibility = compositionEngine.analyzeSchemaCompatibility(skillA, skillB);
      
      expect(compatibility.compatible).toBe(true);
      expect(compatibility.issues).toHaveLength(0);
      expect(compatibility.score).toBe(1.0);
      expect(compatibility.fieldMapping).toBeDefined();
    });
    
    it('should detect incompatible schemas', () => {
      const skillA = createSkillDefinition({
        id: 'skill-a',
        name: 'Skill A',
        version: '1.0.0',
        description: 'Test skill A',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: {
          type: 'object',
          properties: {
            text: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'skill-b',
        name: 'Skill B',
        version: '1.0.0',
        description: 'Test skill B',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            number: { type: 'number' }
          },
          required: ['number']
        },
        outputSchema: { type: 'object' },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const compatibility = compositionEngine.analyzeSchemaCompatibility(skillA, skillB);
      
      expect(compatibility.compatible).toBe(false);
      expect(compatibility.issues).toContain('Missing required property: number');
      expect(compatibility.score).toBeLessThan(1.0);
    });
    
    it('should handle type mismatches', () => {
      const skillA = createSkillDefinition({
        id: 'skill-a',
        name: 'Skill A',
        version: '1.0.0',
        description: 'Test skill A',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'string' },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'skill-b',
        name: 'Skill B',
        version: '1.0.0',
        description: 'Test skill B',
        category: 'utility',
        inputSchema: { type: 'number' },
        outputSchema: { type: 'object' },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const compatibility = compositionEngine.analyzeSchemaCompatibility(skillA, skillB);
      
      expect(compatibility.compatible).toBe(false);
      expect(compatibility.issues).toContain('Type mismatch: output type string vs input type number');
    });
  });
  
  describe('generateCompositeSkill', () => {
    it('should generate composite skill from multiple skills', () => {
      const skills: SkillDefinition[] = [
        createSkillDefinition({
          id: 'skill-1',
          name: 'Skill 1',
          version: '1.0.0',
          description: 'First skill',
          category: 'frontend',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
          dependencies: [],
          qualityMetrics: new Map([['metric1', { name: 'metric1', description: 'Test metric', unit: 'count', higherIsBetter: true }]]),
          implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
          tests: [],
          examples: []
        }),
        createSkillDefinition({
          id: 'skill-2',
          name: 'Skill 2',
          version: '1.0.0',
          description: 'Second skill',
          category: 'frontend',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
          dependencies: [],
          qualityMetrics: new Map([['metric2', { name: 'metric2', description: 'Test metric 2', unit: 'percentage', higherIsBetter: true }]]),
          implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
          tests: [],
          examples: []
        })
      ];
      
      const compositeSkill = compositionEngine.generateCompositeSkill(skills, {
        name: 'Test Composite',
        description: 'Test description',
        category: 'backend'
      });
      
      expect(compositeSkill.id).toContain('composite-');
      expect(compositeSkill.name).toBe('Test Composite');
      expect(compositeSkill.description).toContain('Test description');
      expect(compositeSkill.category).toBe('backend');
      expect(compositeSkill.dependencies).toHaveLength(0);
      expect(compositeSkill.qualityMetrics.size).toBeGreaterThan(0);
      expect(compositeSkill.implementation.type).toBe('composite');
      expect(compositeSkill.keywords).toContain('composite');
    });
    
    it('should infer category from skills', () => {
      const skills: SkillDefinition[] = [
        createSkillDefinition({
          id: 'skill-1',
          name: 'Skill 1',
          version: '1.0.0',
          description: 'First skill',
          category: 'database',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
          tests: [],
          examples: []
        }),
        createSkillDefinition({
          id: 'skill-2',
          name: 'Skill 2',
          version: '1.0.0',
          description: 'Second skill',
          category: 'database',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
          tests: [],
          examples: []
        })
      ];
      
      const compositeSkill = compositionEngine.generateCompositeSkill(skills);
      
      expect(compositeSkill.category).toBe('database');
    });
    
    it('should use utility category for mixed categories', () => {
      const skills: SkillDefinition[] = [
        createSkillDefinition({
          id: 'skill-1',
          name: 'Skill 1',
          version: '1.0.0',
          description: 'First skill',
          category: 'frontend',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
          tests: [],
          examples: []
        }),
        createSkillDefinition({
          id: 'skill-2',
          name: 'Skill 2',
          version: '1.0.0',
          description: 'Second skill',
          category: 'backend',
          inputSchema: { type: 'object' },
          outputSchema: { type: 'object' },
          dependencies: [],
          qualityMetrics: new Map(),
          implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
          tests: [],
          examples: []
        })
      ];
      
      const compositeSkill = compositionEngine.generateCompositeSkill(skills);
      
      expect(compositeSkill.category).toBe('utility');
    });
  });
  
  describe('Property Tests for Skill Composition Commutativity', () => {
    // Property test for commutativity: compose(A, B) should be equivalent to compose(B, A)
    // when skills have no dependencies and schemas are compatible in both directions
    
    it('should satisfy commutativity property for independent skills', () => {
      const arbitrarySkill = (id: string, name: string): fc.Arbitrary<SkillDefinition> => 
        fc.record({
          id: fc.constant(id),
          name: fc.constant(name),
          version: fc.constant('1.0.0'),
          description: fc.constant('Test skill'),
          category: fc.constant('utility' as SkillCategory),
          inputSchema: fc.constant({
            type: 'object',
            properties: {
              data: { type: 'string' }
            }
          } as JSONSchema),
          outputSchema: fc.constant({
            type: 'object',
            properties: {
              result: { type: 'string' }
            }
          } as JSONSchema),
          dependencies: fc.constant([]),
          qualityMetrics: fc.constant(new Map()),
          implementation: fc.constant({
            type: 'typescript-function',
            runtime: 'nodejs',
            entryPoint: 'execute',
            source: 'function execute(input) { return input; }'
          }),
          tests: fc.constant([]),
          examples: fc.constant([])
        }).map(record => createSkillDefinition(record));
      
      const property = fc.property(
        arbitrarySkill('skill-a', 'Skill A'),
        arbitrarySkill('skill-b', 'Skill B'),
        (skillA, skillB) => {
          // For skills with no dependencies and compatible schemas,
          // composition should be commutative
          const engine = new DefaultSkillCompositionEngine();
          const isCommutative = engine.isCompositionCommutative(skillA, skillB);
          
          // If skills have dependencies between them, commutativity fails
          const aDependsOnB = skillA.dependencies.some(dep => dep.skillId === skillB.id);
          const bDependsOnA = skillB.dependencies.some(dep => dep.skillId === skillA.id);
          
          if (aDependsOnB || bDependsOnA) {
            return !isCommutative; // Should not be commutative when there are dependencies
          }
          
          // Check schema compatibility
          const aToB = engine.analyzeSchemaCompatibility(skillA, skillB);
          const bToA = engine.analyzeSchemaCompatibility(skillB, skillA);
          
          const schemasCompatibleBothWays = aToB.compatible && bToA.compatible;
          
          if (schemasCompatibleBothWays) {
            return isCommutative; // Should be commutative when schemas compatible both ways
          } else {
            return !isCommutative; // Should not be commutative when schemas incompatible
          }
        }
      );
      
      fc.assert(property, { numRuns: 100 });
    });
    
    it('should detect non-commutative composition with dependencies', () => {
      // Create skill B that depends on skill A
      const skillA = createSkillDefinition({
        id: 'skill-a',
        name: 'Skill A',
        version: '1.0.0',
        description: 'Independent skill',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'skill-b',
        name: 'Skill B',
        version: '1.0.0',
        description: 'Depends on Skill A',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        dependencies: [
          { skillId: 'skill-a', versionConstraint: '^1.0.0', required: true }
        ],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const engine = new DefaultSkillCompositionEngine();
      const isCommutative = engine.isCompositionCommutative(skillA, skillB);
      
      expect(isCommutative).toBe(false);
    });
    
    it('should detect commutative composition for independent skills', () => {
      const skillA = createSkillDefinition({
        id: 'skill-a',
        name: 'Skill A',
        version: '1.0.0',
        description: 'Independent skill A',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string' }
          }
        },
        outputSchema: {
          type: 'object',
          properties: {
            output: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'skill-b',
        name: 'Skill B',
        version: '1.0.0',
        description: 'Independent skill B',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            output: { type: 'string' }
          }
        },
        outputSchema: {
          type: 'object',
          properties: {
            final: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const engine = new DefaultSkillCompositionEngine();
      const isCommutative = engine.isCompositionCommutative(skillA, skillB);
      
      // Should be commutative since schemas are compatible both ways
      // and there are no dependencies
      expect(isCommutative).toBe(true);
    });
  });
  
  describe('isCompositionCommutative', () => {
    it('should return false for skills with dependencies', () => {
      const skillA = createSkillDefinition({
        id: 'a',
        name: 'A',
        version: '1.0.0',
        description: 'Skill A',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        dependencies: [
          { skillId: 'b', versionConstraint: '^1.0.0', required: true }
        ],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'b',
        name: 'B',
        version: '1.0.0',
        description: 'Skill B',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: { type: 'object' },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const engine = new DefaultSkillCompositionEngine();
      expect(engine.isCompositionCommutative(skillA, skillB)).toBe(false);
    });
    
    it('should return true for independent skills with compatible schemas', () => {
      const skillA = createSkillDefinition({
        id: 'a',
        name: 'A',
        version: '1.0.0',
        description: 'Skill A',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: {
          type: 'object',
          properties: {
            data: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'b',
        name: 'B',
        version: '1.0.0',
        description: 'Skill B',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            data: { type: 'string' }
          }
        },
        outputSchema: { type: 'object' },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const engine = new DefaultSkillCompositionEngine();
      expect(engine.isCompositionCommutative(skillA, skillB)).toBe(true);
    });
  });
  
  describe('isCompositionAssociative', () => {
    it('should return true for associative skills', () => {
      const skillA = createSkillDefinition({
        id: 'a',
        name: 'A',
        version: '1.0.0',
        description: 'Skill A',
        category: 'utility',
        inputSchema: { type: 'object' },
        outputSchema: {
          type: 'object',
          properties: {
            aOut: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillB = createSkillDefinition({
        id: 'b',
        name: 'B',
        version: '1.0.0',
        description: 'Skill B',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            aOut: { type: 'string' }
          }
        },
        outputSchema: {
          type: 'object',
          properties: {
            bOut: { type: 'string' }
          }
        },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const skillC = createSkillDefinition({
        id: 'c',
        name: 'C',
        version: '1.0.0',
        description: 'Skill C',
        category: 'utility',
        inputSchema: {
          type: 'object',
          properties: {
            bOut: { type: 'string' }
          }
        },
        outputSchema: { type: 'object' },
        dependencies: [],
        qualityMetrics: new Map(),
        implementation: { type: 'typescript-function', runtime: 'nodejs', entryPoint: 'execute', source: 'function execute(input) { return input; }' },
        tests: [],
        examples: []
      });
      
      const engine = new DefaultSkillCompositionEngine();
      expect(engine.isCompositionAssociative([skillA, skillB, skillC])).toBe(true);
    });
  });
  
  describe('factory function', () => {
    it('should create SkillCompositionEngine instance', () => {
      const engine = createSkillCompositionEngine();
      expect(engine).toBeDefined();
      expect(typeof engine.composeSkills).toBe('function');
      expect(typeof engine.canComposeSkills).toBe('function');
      expect(typeof engine.analyzeSchemaCompatibility).toBe('function');
      expect(typeof engine.generateCompositeSkill).toBe('function');
    });
  });
});
