/**
 * Unit tests for skill definition validation
 * 
 * Validates: Requirements 2.1, 2.4
 * - Requirement 2.1: The system shall define a formal skill abstraction with metadata
 * - Requirement 2.4: The system shall validate skill definitions against schema rules
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  SkillDefinition,
  SkillDependency,
  MetricDefinition,
  SkillImplementation,
  TestDefinition,
  Example,
  JSONSchema,
  validateSkillDefinition,
  createSkillDefinition,
  updateSkillDefinition,
  areSkillsCompatible,
  calculateQualityScore,
  ValidationResult
} from '../../src/skill-system/skill-definition';

describe('Skill Definition Interface', () => {
  let validSkill: SkillDefinition;
  let existingSkills: Map<string, SkillDefinition[]>;

  beforeEach(() => {
    // Create a valid skill definition for testing
    validSkill = createSkillDefinition({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Create REST API Endpoint',
      version: '1.0.0',
      description: 'Creates a REST API endpoint with proper routing and validation',
      category: 'backend',
      inputSchema: {
        type: 'object',
        properties: {
          route: { type: 'string' },
          method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] },
          requestSchema: { type: 'object' },
          responseSchema: { type: 'object' }
        },
        required: ['route', 'method']
      },
      outputSchema: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          documentation: { type: 'string' },
          tests: { type: 'array' }
        }
      },
      dependencies: [
        {
          skillId: '223e4567-e89b-12d3-a456-426614174001',
          versionConstraint: '^1.0.0',
          required: true,
          description: 'Required for input validation'
        }
      ],
      qualityMetrics: new Map([
        ['execution_time', {
          name: 'Execution Time',
          description: 'Time taken to execute the skill',
          unit: 'milliseconds',
          target: 100,
          maximum: 500,
          higherIsBetter: false,
          weight: 0.3
        }],
        ['success_rate', {
          name: 'Success Rate',
          description: 'Percentage of successful executions',
          unit: 'percentage',
          target: 95,
          minimum: 80,
          higherIsBetter: true,
          weight: 0.7
        }]
      ]),
      implementation: {
        type: 'typescript-function',
        runtime: 'nodejs',
        entryPoint: 'createRestEndpoint',
        source: 'function createRestEndpoint(input) { /* implementation */ }',
        estimatedExecutionTime: 150,
        memoryRequirement: 256,
        cpuRequirement: 0.5
      },
      tests: [
        {
          id: 'test-1',
          name: 'Basic endpoint creation',
          description: 'Tests creation of a simple GET endpoint',
          type: 'unit',
          input: { route: '/api/users', method: 'GET' },
          expectedOutput: { code: 'export function getUsers() {}' },
          required: true,
          timeout: 5000
        }
      ],
      examples: [
        {
          name: 'User API Example',
          description: 'Creates a user management API',
          input: {
            route: '/api/users',
            method: 'POST',
            requestSchema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' }
              },
              required: ['name', 'email']
            }
          },
          output: {
            code: 'export function createUser() {}',
            documentation: 'POST /api/users - Create a new user'
          },
          explanation: 'This example shows how to create a POST endpoint for user creation',
          tags: ['authentication', 'crud']
        }
      ],
      author: 'System Architect',
      license: 'MIT',
      keywords: ['api', 'rest', 'backend', 'endpoint']
    });

    // Create existing skills map for uniqueness testing
    existingSkills = new Map();
    existingSkills.set('backend', [
      {
        ...validSkill,
        id: '323e4567-e89b-12d3-a456-426614174002',
        name: 'Existing Backend Skill'
      }
    ]);
  });

  describe('Skill Definition Structure', () => {
    it('should have all required fields defined in Requirement 2.1', () => {
      expect(validSkill.id).toBeDefined();
      expect(validSkill.name).toBeDefined();
      expect(validSkill.version).toBeDefined();
      expect(validSkill.description).toBeDefined();
      expect(validSkill.category).toBeDefined();
      expect(validSkill.inputSchema).toBeDefined();
      expect(validSkill.outputSchema).toBeDefined();
      expect(validSkill.dependencies).toBeDefined();
      expect(validSkill.qualityMetrics).toBeDefined();
      expect(validSkill.implementation).toBeDefined();
      expect(validSkill.tests).toBeDefined();
      expect(validSkill.examples).toBeDefined();
    });

    it('should have proper TypeScript types for all fields', () => {
      // Test type safety through assignment
      const skill: SkillDefinition = validSkill;
      expect(skill).toBeDefined();
      
      // Test specific type constraints
      expect(typeof skill.id).toBe('string');
      expect(typeof skill.name).toBe('string');
      expect(typeof skill.version).toBe('string');
      expect(typeof skill.description).toBe('string');
      expect(typeof skill.category).toBe('string');
      expect(typeof skill.inputSchema).toBe('object');
      expect(typeof skill.outputSchema).toBe('object');
      expect(Array.isArray(skill.dependencies)).toBe(true);
      expect(skill.qualityMetrics instanceof Map).toBe(true);
      expect(typeof skill.implementation).toBe('object');
      expect(Array.isArray(skill.tests)).toBe(true);
      expect(Array.isArray(skill.examples)).toBe(true);
    });
  });

  describe('Skill Definition Validation (Requirement 2.4)', () => {
    it('should validate a complete skill definition successfully', () => {
      const result = validateSkillDefinition(validSkill, existingSkills);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject skill with missing required fields', () => {
      const invalidSkill = { ...validSkill, name: '' } as SkillDefinition;
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing required field: name');
      expect(result.details?.requiredFieldsPresent).toBe(false);
    });

    it('should reject skill with invalid semantic version', () => {
      const invalidSkill = { ...validSkill, version: 'invalid-version' } as SkillDefinition;
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'Invalid semantic version: invalid-version. Expected format: MAJOR.MINOR.PATCH'
      );
      expect(result.details?.validSemanticVersion).toBe(false);
    });

    it('should reject duplicate skill name within same category', () => {
      // Create a skill with same name as existing one
      const duplicateSkill = {
        ...validSkill,
        id: '423e4567-e89b-12d3-a456-426614174003',
        name: 'Existing Backend Skill' // Same name as existing skill
      };
      
      const result = validateSkillDefinition(duplicateSkill, existingSkills);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Skill name 'Existing Backend Skill' is not unique within category 'backend'"
      );
      expect(result.details?.uniqueName).toBe(false);
    });

    it('should allow same skill name in different categories', () => {
      const frontendSkill = {
        ...validSkill,
        id: '523e4567-e89b-12d3-a456-426614174004',
        name: 'Existing Backend Skill', // Same name but different category
        category: 'frontend'
      };
      
      const result = validateSkillDefinition(frontendSkill, existingSkills);
      
      // Should be valid since category is different
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.details).toBeUndefined();
    });

    it('should reject skill with invalid input schema', () => {
      const invalidSkill = {
        ...validSkill,
        inputSchema: { type: 'invalid-type' } as JSONSchema
      };
      
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Invalid input schema/);
      expect(result.details?.validInputSchema).toBe(false);
    });

    it('should reject skill with invalid output schema', () => {
      const invalidSkill = {
        ...validSkill,
        outputSchema: { 
          type: 'object',
          minimum: 'invalid' // Invalid for object type
        } as any
      };
      
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Invalid output schema/);
      expect(result.details?.validOutputSchema).toBe(false);
    });

    it('should detect dependency cycles', () => {
      // Create skills with circular dependencies
      const skillA: SkillDefinition = {
        ...validSkill,
        id: 'a1234567-e89b-12d3-a456-426614174000',
        name: 'Skill A',
        dependencies: [
          {
            skillId: 'b1234567-e89b-12d3-a456-426614174001',
            versionConstraint: '^1.0.0',
            required: true
          }
        ]
      };
      
      const skillB: SkillDefinition = {
        ...validSkill,
        id: 'b1234567-e89b-12d3-a456-426614174001',
        name: 'Skill B',
        dependencies: [
          {
            skillId: 'a1234567-e89b-12d3-a456-426614174000', // Circular reference
            versionConstraint: '^1.0.0',
            required: true
          }
        ]
      };
      
      // Add both skills to existing skills
      const skillsWithCycle = new Map();
      skillsWithCycle.set('backend', [skillA, skillB]);
      
      const result = validateSkillDefinition(skillA, skillsWithCycle);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Skill dependencies form a cycle');
      expect(result.details?.acyclicDependencies).toBe(false);
    });

    it('should validate quality metrics structure', () => {
      const invalidSkill = {
        ...validSkill,
        qualityMetrics: new Map([
          ['invalid_metric', {
            name: '', // Missing name
            description: '', // Missing description
            unit: '', // Missing unit
            higherIsBetter: true,
            weight: 1.5 // Invalid weight > 1
          } as MetricDefinition]
        ])
      };
      
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Invalid quality metrics/);
      expect(result.details?.validQualityMetrics).toBe(false);
    });

    it('should validate implementation details', () => {
      const invalidSkill = {
        ...validSkill,
        implementation: {
          type: '', // Missing type
          runtime: '', // Missing runtime
          entryPoint: '', // Missing entry point
          source: '', // Missing source
          estimatedExecutionTime: -100, // Negative time
          cpuRequirement: 1.5 // CPU > 1
        } as SkillImplementation
      };
      
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Invalid implementation/);
    });

    it('should validate test definitions', () => {
      const invalidSkill = {
        ...validSkill,
        id: 'a23e4567-e89b-12d3-a456-426614174000', // Valid UUID to avoid warning
        tests: [
          {
            id: '', // Missing ID
            name: '', // Missing name
            description: '', // Missing description
            type: 'invalid' as any, // Invalid type
            input: undefined, // Missing input
            timeout: -1000 // Negative timeout
          } as TestDefinition
        ]
      };
      
      const result = validateSkillDefinition(invalidSkill);
      
      // Tests generate warnings, not errors
      expect(result.valid).toBe(true); // Still valid since tests are optional for validation
      expect(result.warnings[0]).toMatch(/Test validation issues/);
    });

    it('should validate example definitions', () => {
      const invalidSkill = {
        ...validSkill,
        id: 'b23e4567-e89b-12d3-a456-426614174000', // Valid UUID to avoid warning
        examples: [
          {
            name: '', // Missing name
            description: '', // Missing description
            input: undefined, // Missing input
            output: undefined, // Missing output
            explanation: '' // Missing explanation
          } as Example
        ]
      };
      
      const result = validateSkillDefinition(invalidSkill);
      
      // Examples generate warnings, not errors
      expect(result.valid).toBe(true); // Still valid since examples are optional for validation
      expect(result.warnings[0]).toMatch(/Example validation issues/);
    });

    it('should validate JSON schema constraints', () => {
      const invalidSkill = {
        ...validSkill,
        inputSchema: {
          type: 'object',
          minimum: 10, // Invalid for object type
          maximum: 5, // Maximum less than minimum
          minLength: 10,
          maxLength: 5 // maxLength less than minLength
        } as JSONSchema
      };
      
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toMatch(/Invalid input schema/);
    });
  });

  describe('Skill Definition Factory Functions', () => {
    it('should create a new skill definition with createSkillDefinition', () => {
      const newSkill = createSkillDefinition({
        id: '623e4567-e89b-12d3-a456-426614174005',
        name: 'New Skill',
        version: '2.0.0',
        description: 'A new skill for testing',
        category: 'frontend'
      });
      
      expect(newSkill.id).toBe('623e4567-e89b-12d3-a456-426614174005');
      expect(newSkill.name).toBe('New Skill');
      expect(newSkill.version).toBe('2.0.0');
      expect(newSkill.description).toBe('A new skill for testing');
      expect(newSkill.category).toBe('frontend');
      expect(newSkill.createdAt).toBeInstanceOf(Date);
      expect(newSkill.updatedAt).toBeInstanceOf(Date);
      expect(newSkill.inputSchema).toEqual({ type: 'object', properties: {} });
      expect(newSkill.dependencies).toEqual([]);
      expect(newSkill.qualityMetrics.size).toBe(0);
      expect(newSkill.tests).toEqual([]);
      expect(newSkill.examples).toEqual([]);
    });

    it('should update an existing skill definition with updateSkillDefinition', () => {
      const originalDate = validSkill.createdAt;
      
      // Mock Date to ensure updatedAt is different
      const mockDate = new Date(originalDate.getTime() + 1000);
      const originalDateNow = Date.now;
      Date.now = () => mockDate.getTime();
      
      try {
        const updatedSkill = updateSkillDefinition(validSkill, {
          name: 'Updated Skill Name',
          version: '1.1.0',
          description: 'Updated description'
        });
        
        expect(updatedSkill.name).toBe('Updated Skill Name');
        expect(updatedSkill.version).toBe('1.1.0');
        expect(updatedSkill.description).toBe('Updated description');
        expect(updatedSkill.createdAt).toBe(originalDate); // Should not change
        expect(updatedSkill.updatedAt.getTime()).toBeGreaterThan(originalDate.getTime()); // Should update
      } finally {
        Date.now = originalDateNow;
      }
    });

    it('should preserve unchanged fields when updating', () => {
      const updatedSkill = updateSkillDefinition(validSkill, {
        name: 'Updated Name Only'
      });
      
      expect(updatedSkill.name).toBe('Updated Name Only');
      expect(updatedSkill.version).toBe(validSkill.version);
      expect(updatedSkill.description).toBe(validSkill.description);
      expect(updatedSkill.category).toBe(validSkill.category);
      expect(updatedSkill.inputSchema).toEqual(validSkill.inputSchema);
    });
  });

  describe('Skill Utility Functions', () => {
    it('should calculate quality score from metrics', () => {
      const score = calculateQualityScore(validSkill);
      
      // Score should be between 0 and 1
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
      
      // With our test metrics (default score 0.8), weighted average should be 0.8
      expect(score).toBeCloseTo(0.8);
    });

    it('should return 0 for skill with no quality metrics', () => {
      const skillWithoutMetrics = { ...validSkill, qualityMetrics: new Map() };
      const score = calculateQualityScore(skillWithoutMetrics);
      
      expect(score).toBe(0);
    });

    it('should check skill compatibility (simplified)', () => {
      const skill1 = validSkill;
      const skill2 = { ...validSkill, id: '723e4567-e89b-12d3-a456-426614174006' };
      
      const compatible = areSkillsCompatible(skill1, skill2);
      
      // Simplified compatibility check always returns true
      expect(compatible).toBe(true);
    });
  });

  describe('Validation Result Structure', () => {
    it('should provide detailed validation results', () => {
      const invalidSkill = { ...validSkill, name: '' } as SkillDefinition;
      const result = validateSkillDefinition(invalidSkill);
      
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(result).toHaveProperty('details');
      
      expect(result.details).toHaveProperty('uniqueName');
      expect(result.details).toHaveProperty('validInputSchema');
      expect(result.details).toHaveProperty('validOutputSchema');
      expect(result.details).toHaveProperty('acyclicDependencies');
      expect(result.details).toHaveProperty('requiredFieldsPresent');
      expect(result.details).toHaveProperty('validSemanticVersion');
      expect(result.details).toHaveProperty('validQualityMetrics');
    });

    it('should not include details when validation passes without warnings', () => {
      const result = validateSkillDefinition(validSkill);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.warnings).toHaveLength(0);
      expect(result.details).toBeUndefined(); // No details when completely valid
    });
  });

  describe('Edge Cases and Boundary Conditions', () => {
    it('should handle empty dependencies array', () => {
      const skillWithNoDeps = { ...validSkill, dependencies: [] };
      const result = validateSkillDefinition(skillWithNoDeps);
      
      expect(result.valid).toBe(true);
      expect(result.details).toBeUndefined();
    });

    it('should handle skill with only required dependencies', () => {
      const skillWithRequiredDeps = {
        ...validSkill,
        dependencies: [
          {
            skillId: '823e4567-e89b-12d3-a456-426614174007',
            versionConstraint: '^1.0.0',
            required: true
          }
        ]
      };
      
      const result = validateSkillDefinition(skillWithRequiredDeps);
      expect(result.valid).toBe(true);
    });

    it('should handle skill with optional dependencies', () => {
      const skillWithOptionalDeps = {
        ...validSkill,
        dependencies: [
          {
            skillId: '923e4567-e89b-12d3-a456-426614174008',
            versionConstraint: '^2.0.0',
            required: false,
            description: 'Optional enhancement'
          }
        ]
      };
      
      const result = validateSkillDefinition(skillWithOptionalDeps);
      expect(result.valid).toBe(true);
    });

    it('should validate skill with complex JSON schema', () => {
      const skillWithComplexSchema = {
        ...validSkill,
        inputSchema: {
          type: 'object',
          properties: {
            nested: {
              type: 'object',
              properties: {
                arrayField: {
                  type: 'array',
                  items: {
                    type: 'string',
                    minLength: 1,
                    maxLength: 100
                  },
                  minItems: 1,
                  maxItems: 10
                },
                enumField: {
                  type: 'string',
                  enum: ['option1', 'option2', 'option3']
                }
              },
              required: ['arrayField']
            }
          },
          required: ['nested'],
          additionalProperties: false
        } as JSONSchema
      };
      
      const result = validateSkillDefinition(skillWithComplexSchema);
      expect(result.valid).toBe(true);
      expect(result.details).toBeUndefined();
    });

    it('should handle skill with multiple test types', () => {
      const skillWithMultipleTests = {
        ...validSkill,
        tests: [
          {
            id: 'unit-test-1',
            name: 'Unit Test',
            description: 'Basic unit test',
            type: 'unit',
            input: { test: 'data' },
            required: true
          },
          {
            id: 'integration-test-1',
            name: 'Integration Test',
            description: 'Integration with other skills',
            type: 'integration',
            input: { integration: 'data' },
            required: false
          },
          {
            id: 'property-test-1',
            name: 'Property Test',
            description: 'Property-based testing',
            type: 'property',
            input: { property: 'test' },
            assertion: 'forall x, f(x) = f(f(x))',
            required: true
          }
        ]
      };
      
      const result = validateSkillDefinition(skillWithMultipleTests);
      expect(result.valid).toBe(true);
    });
  });
});
