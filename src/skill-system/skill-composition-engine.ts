/**
 * Skill Composition Engine
 * 
 * Implements skill composition with dependency validation and input/output schema compatibility checking.
 * Supports composing multiple skills into composite skills with validation of compatibility and dependency cycles.
 * 
 * Validates: Requirements 2.3, 2.4
 * 
 * Property Tests: Skill composition commutativity - compose(skillA, skillB) = compose(skillB, skillA) when no dependencies
 */

import {
  SkillId,
  SkillDefinition,
  SkillDependency,
  SkillCategory,
  JSONSchema,
  validateSkillDefinition,
  createSkillDefinition
} from './skill-definition.js';

import { SkillGraph } from './skill-graph.js';

/**
 * Composition result for skill combination
 */
export interface CompositionResult {
  /** Whether composition was successful */
  success: boolean;
  
  /** The composed skill definition (if successful) */
  composedSkill?: SkillDefinition;
  
  /** List of composition errors (if any) */
  errors: string[];
  
  /** List of composition warnings (if any) */
  warnings: string[];
  
  /** Details about the composition */
  details?: {
    /** Whether all dependencies were resolved */
    dependenciesResolved: boolean;
    
    /** Whether input/output schemas are compatible */
    schemasCompatible: boolean;
    
    /** Whether dependency graph is acyclic */
    acyclicDependencies: boolean;
    
    /** Whether all skills are in same category (for categorization) */
    sameCategory: boolean;
    
    /** Number of skills composed */
    skillCount: number;
  };
}

/**
 * Options for skill composition
 */
export interface CompositionOptions {
  /** Name for the composed skill (optional, will be generated if not provided) */
  name?: string;
  
  /** Description for the composed skill (optional) */
  description?: string;
  
  /** Category for the composed skill (optional, will be inferred if not provided) */
  category?: SkillCategory;
  
  /** Whether to validate dependencies strictly (default: true) */
  strictDependencyValidation?: boolean;
  
  /** Whether to validate schema compatibility strictly (default: true) */
  strictSchemaValidation?: boolean;
  
  /** Whether to allow partial composition when some skills are incompatible (default: false) */
  allowPartialComposition?: boolean;
  
  /** Maximum number of skills to compose (default: no limit) */
  maxSkills?: number;
}

/**
 * Schema compatibility analysis result
 */
export interface SchemaCompatibility {
  /** Whether schemas are compatible */
  compatible: boolean;
  
  /** Detailed compatibility issues (if any) */
  issues: string[];
  
  /** Compatibility score (0-1) */
  score: number;
  
  /** Mapping of output fields to input fields */
  fieldMapping?: Record<string, string>;
}

/**
 * Skill Composition Engine Interface
 */
export interface SkillCompositionEngine {
  /**
   * Compose multiple skills into a single composite skill
   * 
   * Validates dependencies, checks for cycles, and verifies schema compatibility.
   * 
   * @param skillIds List of skill IDs to compose
   * @param skillGraph Skill graph for dependency resolution and skill retrieval
   * @param options Composition options
   * @returns Composition result
   */
  composeSkills(
    skillIds: SkillId[],
    skillGraph: SkillGraph,
    options?: CompositionOptions
  ): Promise<CompositionResult>;
  
  /**
   * Check if skills can be composed (validation only)
   * 
   * @param skillIds List of skill IDs to check
   * @param skillGraph Skill graph for dependency resolution
   * @returns Whether skills can be composed
   */
  canComposeSkills(
    skillIds: SkillId[],
    skillGraph: SkillGraph
  ): Promise<{ canCompose: boolean; reasons: string[] }>;
  
  /**
   * Analyze schema compatibility between skills
   * 
   * @param sourceSkill Skill providing output
   * @param targetSkill Skill requiring input
   * @returns Schema compatibility analysis
   */
  analyzeSchemaCompatibility(
    sourceSkill: SkillDefinition,
    targetSkill: SkillDefinition
  ): SchemaCompatibility;
  
  /**
   * Generate a composite skill definition from component skills
   * 
   * @param skills Component skill definitions
   * @param options Composition options
   * @returns Composite skill definition
   */
  generateCompositeSkill(
    skills: SkillDefinition[],
    options?: CompositionOptions
  ): SkillDefinition;
}

/**
 * Default implementation of SkillCompositionEngine
 */
export class DefaultSkillCompositionEngine implements SkillCompositionEngine {
  /**
   * Compose multiple skills into a single composite skill
   */
  async composeSkills(
    skillIds: SkillId[],
    skillGraph: SkillGraph,
    options: CompositionOptions = {}
  ): Promise<CompositionResult> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const details = {
      dependenciesResolved: false,
      schemasCompatible: false,
      acyclicDependencies: false,
      sameCategory: false,
      skillCount: skillIds.length
    };
    
    // Validate input
    if (skillIds.length === 0) {
      errors.push('No skills provided for composition');
      return { success: false, errors, warnings, details };
    }
    
    if (skillIds.length === 1) {
      warnings.push('Only one skill provided for composition');
    }
    
    // Apply max skills limit
    if (options.maxSkills !== undefined && skillIds.length > options.maxSkills) {
      errors.push(`Too many skills to compose: ${skillIds.length} exceeds maximum of ${options.maxSkills}`);
      return { success: false, errors, warnings, details };
    }
    
    // Load actual skill definitions from the graph so composition reflects the
    // repository state instead of relying on test-only stand-ins.
    const skills: SkillDefinition[] = [];
    for (const skillId of skillIds) {
      try {
        const skill = await Promise.resolve(skillGraph.getSkill(skillId));
        if (!skill) {
          throw new Error(`Skill not found: ${skillId}`);
        }
        skills.push(skill);
      } catch (error) {
        errors.push(`Failed to load skill ${skillId}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    if (errors.length > 0 && !options.allowPartialComposition) {
      return { success: false, errors, warnings, details };
    }
    
    // Resolve dependencies
    const dependencyResolution = await Promise.resolve(skillGraph.resolveDependencies(skillIds));
    details.dependenciesResolved = dependencyResolution.resolved;
    details.acyclicDependencies = !dependencyResolution.hasCycles;
    
    if (!dependencyResolution.resolved && options.strictDependencyValidation !== false) {
      errors.push('Dependency resolution failed');
      for (const unresolved of dependencyResolution.unresolvedDependencies) {
        errors.push(`Unresolved dependency: ${unresolved.skillId} ${unresolved.versionConstraint} - ${unresolved.reason}`);
      }
    }
    
    if (dependencyResolution.hasCycles) {
      errors.push('Dependency graph contains cycles');
      for (const cycle of dependencyResolution.cycles) {
        errors.push(`Cycle detected: ${cycle.join(' -> ')}`);
      }
    }
    
    // Check schema compatibility
    let allSchemasCompatible = true;
    const schemaIssues: string[] = [];
    
    // For linear composition (skills executed in sequence), check that output of skill i
    // is compatible with input of skill i+1
    for (let i = 0; i < skills.length - 1; i++) {
      const compatibility = this.analyzeSchemaCompatibility(skills[i], skills[i + 1]);
      if (!compatibility.compatible && options.strictSchemaValidation !== false) {
        allSchemasCompatible = false;
        schemaIssues.push(`Skills ${skillIds[i]} -> ${skillIds[i + 1]}: ${compatibility.issues.join(', ')}`);
      }
    }
    
    details.schemasCompatible = allSchemasCompatible;
    
    if (!allSchemasCompatible && options.strictSchemaValidation !== false) {
      errors.push('Schema compatibility check failed');
      errors.push(...schemaIssues);
    }
    
    // Check if all skills are in same category (for categorization)
    const categories = new Set(skills.map(skill => skill.category));
    details.sameCategory = categories.size === 1;
    
    // If there are errors and we don't allow partial composition, fail
    if (errors.length > 0 && !options.allowPartialComposition) {
      return { success: false, errors, warnings, details };
    }
    
    // Generate composite skill
    const composedSkill = this.generateCompositeSkill(skills, options);
    
    // Validate the composed skill
    const validationResult = validateSkillDefinition(composedSkill);
    if (!validationResult.valid) {
      errors.push('Composed skill validation failed');
      errors.push(...validationResult.errors);
      warnings.push(...validationResult.warnings);
    }
    
    const success = errors.length === 0 || Boolean(options.allowPartialComposition && composedSkill !== undefined);
    
    return {
      success,
      composedSkill: success ? composedSkill : undefined,
      errors,
      warnings,
      details
    };
  }
  
  /**
   * Check if skills can be composed (validation only)
   */
  async canComposeSkills(
    skillIds: SkillId[],
    skillGraph: SkillGraph
  ): Promise<{ canCompose: boolean; reasons: string[] }> {
    const reasons: string[] = [];
    const skills: SkillDefinition[] = [];
    
    if (skillIds.length === 0) {
      reasons.push('No skills provided');
      return { canCompose: false, reasons };
    }
    
    if (skillIds.length === 1) {
      reasons.push('Only one skill provided (trivial composition)');
    }
    
    // Check if all skills exist
    for (const skillId of skillIds) {
      try {
        const skill = await Promise.resolve(skillGraph.getSkill(skillId));
        if (!skill) {
          throw new Error(`Skill not found: ${skillId}`);
        }
        skills.push(skill);
      } catch (error) {
        reasons.push(`Skill not found: ${skillId}`);
      }
    }
    
    // If we can't find some skills, we can't compose
    if (reasons.some(r => r.startsWith('Skill not found'))) {
      return { canCompose: false, reasons };
    }
    
    // Resolve dependencies
    const dependencyResolution = await Promise.resolve(skillGraph.resolveDependencies(skillIds));
    if (!dependencyResolution.resolved) {
      reasons.push('Dependency resolution failed');
      for (const unresolved of dependencyResolution.unresolvedDependencies) {
        reasons.push(`Unresolved dependency: ${unresolved.skillId}`);
      }
    }
    
    if (dependencyResolution.hasCycles) {
      reasons.push('Dependency graph contains cycles');
      for (const cycle of dependencyResolution.cycles) {
        reasons.push(`Cycle: ${cycle.join(' -> ')}`);
      }
    }

    for (let i = 0; i < skills.length - 1; i++) {
      const compatibility = this.analyzeSchemaCompatibility(skills[i], skills[i + 1]);
      if (!compatibility.compatible) {
        reasons.push(
          `Schema incompatible: ${skills[i].id} -> ${skills[i + 1].id}: ${compatibility.issues.join(', ')}`
        );
      }
    }
    
    // For single skill with only the "trivial composition" warning, we consider it composable
    const canCompose = reasons.length === 0 || (skillIds.length === 1 && reasons.length === 1 && reasons[0].includes('trivial composition'));
    
    return { canCompose, reasons };
  }
  
  /**
   * Analyze schema compatibility between skills
   */
  analyzeSchemaCompatibility(
    sourceSkill: SkillDefinition,
    targetSkill: SkillDefinition
  ): SchemaCompatibility {
    const issues: string[] = [];
    let score = 1.0;
    
    // Basic type compatibility check
    if (sourceSkill.outputSchema.type !== targetSkill.inputSchema.type) {
      issues.push(`Type mismatch: output type ${sourceSkill.outputSchema.type} vs input type ${targetSkill.inputSchema.type}`);
      score *= 0.5;
    }
    
    // For objects, check property compatibility
    if (sourceSkill.outputSchema.type === 'object' && targetSkill.inputSchema.type === 'object') {
      const outputProps = sourceSkill.outputSchema.properties || {};
      const inputProps = targetSkill.inputSchema.properties || {};
      const requiredInputProps = targetSkill.inputSchema.required || [];
      
      // Check required properties
      for (const requiredProp of requiredInputProps) {
        if (!outputProps[requiredProp]) {
          issues.push(`Missing required property: ${requiredProp}`);
          score *= 0.8;
        }
      }
      
      // Check property type compatibility for overlapping properties
      for (const [propName, inputPropSchema] of Object.entries(inputProps)) {
        if (outputProps[propName]) {
          const outputPropSchema = outputProps[propName];
          if (outputPropSchema.type !== inputPropSchema.type) {
            issues.push(`Property type mismatch for ${propName}: ${outputPropSchema.type} vs ${inputPropSchema.type}`);
            score *= 0.9;
          }
        }
      }
      
      // Calculate field mapping
      const fieldMapping: Record<string, string> = {};
      for (const [inputProp] of Object.entries(inputProps)) {
        // Simple mapping: same property name
        fieldMapping[inputProp] = inputProp;
      }
      
      return {
        compatible: issues.length === 0,
        issues,
        score,
        fieldMapping
      };
    }
    
    // For arrays, check item type compatibility
    if (sourceSkill.outputSchema.type === 'array' && targetSkill.inputSchema.type === 'array') {
      const outputItems = sourceSkill.outputSchema.items;
      const inputItems = targetSkill.inputSchema.items;
      
      if (outputItems && inputItems) {
        if (Array.isArray(outputItems) && Array.isArray(inputItems)) {
          if (outputItems.length !== inputItems.length) {
            issues.push(`Array length mismatch: ${outputItems.length} vs ${inputItems.length}`);
            score *= 0.7;
          }
        } else if (!Array.isArray(outputItems) && !Array.isArray(inputItems)) {
          if (outputItems.type !== inputItems.type) {
            issues.push(`Array item type mismatch: ${outputItems.type} vs ${inputItems.type}`);
            score *= 0.8;
          }
        }
      }
    }
    
    return {
      compatible: issues.length === 0,
      issues,
      score
    };
  }
  
  /**
   * Generate a composite skill definition from component skills
   */
  generateCompositeSkill(
    skills: SkillDefinition[],
    options: CompositionOptions = {}
  ): SkillDefinition {
    if (skills.length === 0) {
      throw new Error('No skills provided for composition');
    }
    
    // Generate composite skill ID
    const compositeId = `composite-${skills.map(s => s.id).join('-')}`.slice(0, 100);
    
    // Determine name
    const name = options.name || `Composite: ${skills.map(s => s.name).join(' + ')}`.slice(0, 200);
    
    // Determine description
    const description = options.description || 
      `Composite skill composed of: ${skills.map(s => s.name).join(', ')}. ` +
      `Executes ${skills.length} skills in sequence with dependency resolution.`;
    
    // Determine category
    let category: SkillCategory = options.category || 'utility';
    if (!options.category) {
      const categories = new Set(skills.map(s => s.category));
      if (categories.size === 1) {
        category = Array.from(categories)[0];
      }
    }
    
    // Combine input schema (from first skill)
    const inputSchema = skills[0].inputSchema;
    
    // Combine output schema (from last skill)
    const outputSchema = skills[skills.length - 1].outputSchema;
    
    // Combine dependencies (unique)
    const dependencyMap = new Map<string, SkillDependency>();
    for (const skill of skills) {
      for (const dep of skill.dependencies) {
        if (!dependencyMap.has(dep.skillId)) {
          dependencyMap.set(dep.skillId, dep);
        }
      }
    }
    
    // Remove self-dependencies (skills in the composition)
    for (const skill of skills) {
      dependencyMap.delete(skill.id);
    }
    
    const dependencies = Array.from(dependencyMap.values());
    
    // Combine quality metrics (average)
    const qualityMetrics = new Map<string, any>();
    const metricValues: Record<string, number[]> = {};
    
    for (const skill of skills) {
      for (const [metricName, metricDef] of skill.qualityMetrics.entries()) {
        if (!metricValues[metricName]) {
          metricValues[metricName] = [];
        }
        // Use default value for calculation
        metricValues[metricName].push(0.8); // Default score
      }
    }
    
    for (const [metricName, values] of Object.entries(metricValues)) {
      const avgValue = values.reduce((sum, val) => sum + val, 0) / values.length;
      qualityMetrics.set(metricName, {
        name: metricName,
        description: `Average ${metricName} from composed skills`,
        unit: 'composite',
        higherIsBetter: true,
        weight: 1.0 / Object.keys(metricValues).length
      });
    }
    
    // Create composite implementation
    const implementation = {
      type: 'composite',
      runtime: 'nodejs',
      entryPoint: 'executeComposite',
      source: `// Composite skill implementation
// Composed of: ${skills.map(s => s.name).join(', ')}
function executeComposite(input) {
  // Execute skills in sequence
  let currentOutput = input;
  ${skills.map((skill, index) => `
  // Execute ${skill.name}
  try {
    currentOutput = executeSkill${index}(currentOutput);
  } catch (error) {
    throw new Error(\`Failed to execute ${skill.name}: \${error.message}\`);
  }`).join('')}
  
  return currentOutput;
}`,
      config: {
        composedSkills: skills.map(s => s.id),
        executionOrder: skills.map(s => s.id)
      },
      environment: {},
      estimatedExecutionTime: skills.reduce((sum, s) => sum + (s.implementation.estimatedExecutionTime || 1000), 0),
      memoryRequirement: skills.reduce((sum, s) => sum + (s.implementation.memoryRequirement || 100), 0),
      cpuRequirement: Math.min(1, skills.reduce((sum, s) => sum + (s.implementation.cpuRequirement || 0.1), 0))
    };
    
    // Combine tests
    const tests = skills.flatMap(skill => skill.tests);
    
    // Combine examples
    const examples = skills.flatMap(skill => skill.examples);
    
    // Create composite skill definition
    return createSkillDefinition({
      id: compositeId,
      name,
      version: '1.0.0',
      description,
      category,
      inputSchema,
      outputSchema,
      dependencies,
      qualityMetrics,
      implementation,
      tests,
      examples,
      keywords: ['composite', ...skills.flatMap(s => s.keywords || [])].filter((v, i, a) => a.indexOf(v) === i).slice(0, 10),
      author: 'Skill Composition Engine',
      license: 'Composite',
      documentationUrl: undefined,
      repositoryUrl: undefined
    });
  }
  
  /**
   * Check if skill composition is commutative (order doesn't matter)
   * 
   * This is a property test helper function.
   * Composition is commutative when:
   * 1. Skills have no dependencies between them
   * 2. Input/output schemas are compatible in any order
   * 3. Skills operate on independent data
   * 
   * @param skillA First skill
   * @param skillB Second skill
   * @returns Whether composition is commutative
   */
  isCompositionCommutative(skillA: SkillDefinition, skillB: SkillDefinition): boolean {
    // Check if skills depend on each other
    const aDependsOnB = skillA.dependencies.some(dep => dep.skillId === skillB.id);
    const bDependsOnA = skillB.dependencies.some(dep => dep.skillId === skillA.id);
    
    if (aDependsOnB || bDependsOnA) {
      return false;
    }
    
    // Check schema compatibility in both directions
    const aToB = this.analyzeSchemaCompatibility(skillA, skillB);
    const bToA = this.analyzeSchemaCompatibility(skillB, skillA);
    
    // For commutativity, we need A->B and B->A to both be compatible
    // AND the combined schemas should be compatible
    return aToB.compatible && bToA.compatible;
  }
  
  /**
   * Check if skill composition is associative (grouping doesn't matter)
   * 
   * This is a property test helper function.
   * Composition is associative when:
   * compose(compose(A, B), C) = compose(A, compose(B, C))
   * 
   * @param skills Three skills to test associativity
   * @returns Whether composition is associative for these skills
   */
  isCompositionAssociative(skills: [SkillDefinition, SkillDefinition, SkillDefinition]): boolean {
    const [skillA, skillB, skillC] = skills;
    
    // Check if all pairwise compositions are possible
    const abCompatible = this.analyzeSchemaCompatibility(skillA, skillB).compatible;
    const bcCompatible = this.analyzeSchemaCompatibility(skillB, skillC).compatible;
    
    if (!abCompatible || !bcCompatible) {
      return false;
    }
    
    // For associativity, we need to check that the intermediate results
    // are compatible in both grouping orders
    // This is a simplified check - in practice would need to generate
    // and compare the actual composite skills
    
    return true;
  }
}

/**
 * Factory function to create a new SkillCompositionEngine instance
 */
export function createSkillCompositionEngine(): SkillCompositionEngine {
  return new DefaultSkillCompositionEngine();
}
