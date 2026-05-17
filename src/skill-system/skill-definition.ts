/**
 * Skill Definition Interface
 * 
 * Defines the formal structure for software engineering skills in the Agentic Engineering Runtime.
 * Each skill represents a reusable software engineering capability with defined inputs, outputs,
 * dependencies, quality metrics, and implementation details.
 * 
 * Validates: Requirements 2.1, 2.4
 */

/**
 * Unique identifier for a skill (UUID format)
 */
export type SkillId = string;

/**
 * Semantic version string following MAJOR.MINOR.PATCH format
 */
export type SemanticVersion = string;

/**
 * Categories for organizing skills by domain or function
 */
export type SkillCategory = 
  | 'frontend' 
  | 'backend' 
  | 'database' 
  | 'infrastructure' 
  | 'security' 
  | 'testing' 
  | 'deployment' 
  | 'monitoring' 
  | 'analytics' 
  | 'integration' 
  | 'data-processing' 
  | 'ai-ml' 
  | 'utility';

/**
 * JSON Schema definition for input/output validation
 */
export interface JSONSchema {
  type: string;
  properties?: Record<string, any>;
  required?: string[];
  additionalProperties?: boolean;
  items?: JSONSchema | JSONSchema[];
  oneOf?: JSONSchema[];
  anyOf?: JSONSchema[];
  allOf?: JSONSchema[];
  not?: JSONSchema;
  const?: any;
  enum?: any[];
  format?: string;
  pattern?: string;
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
  uniqueItems?: boolean;
  title?: string;
  description?: string;
  default?: any;
  examples?: any[];
  [key: string]: any;
}

/**
 * Dependency relationship between skills
 */
export interface SkillDependency {
  /** ID of the required skill */
  skillId: SkillId;
  
  /** Version constraint (e.g., "^1.0.0", ">=2.0.0 <3.0.0") */
  versionConstraint: string;
  
  /** Whether this dependency is required for execution */
  required: boolean;
  
  /** Optional description of why this dependency is needed */
  description?: string;
}

/**
 * Definition of a quality metric for skill evaluation
 */
export interface MetricDefinition {
  /** Name of the metric (e.g., "execution_time", "success_rate", "code_coverage") */
  name: string;
  
  /** Description of what this metric measures */
  description: string;
  
  /** Unit of measurement (e.g., "milliseconds", "percentage", "count") */
  unit: string;
  
  /** Target value for this metric (optional) */
  target?: number;
  
  /** Minimum acceptable value (optional) */
  minimum?: number;
  
  /** Maximum acceptable value (optional) */
  maximum?: number;
  
  /** Whether higher values are better (true) or worse (false) */
  higherIsBetter: boolean;
  
  /** Weight for composite quality score calculation (0-1) */
  weight?: number;
}

/**
 * Implementation details for a skill
 */
export interface SkillImplementation {
  /** Type of implementation (e.g., "typescript-function", "python-script", "shell-command", "composite") */
  type: string;
  
  /** Language or runtime required (e.g., "nodejs", "python3", "bash", "docker") */
  runtime: string;
  
  /** Entry point or main function name */
  entryPoint: string;
  
  /** Source code or implementation reference */
  source: string;
  
  /** Runtime configuration options */
  config?: Record<string, any>;
  
  /** Environment variables required */
  environment?: Record<string, string>;
  
  /** Estimated execution time in milliseconds */
  estimatedExecutionTime?: number;
  
  /** Memory requirements in MB */
  memoryRequirement?: number;
  
  /** CPU requirements (0-1 scale) */
  cpuRequirement?: number;
}

/**
 * Definition of a test for skill validation
 */
export interface TestDefinition {
  /** Unique identifier for the test */
  id: string;
  
  /** Name of the test */
  name: string;
  
  /** Description of what the test verifies */
  description: string;
  
  /** Type of test (e.g., "unit", "integration", "property", "performance") */
  type: 'unit' | 'integration' | 'property' | 'performance' | 'security';
  
  /** Test input data */
  input: any;
  
  /** Expected output or assertion */
  expectedOutput?: any;
  
  /** Assertion function or condition */
  assertion?: string;
  
  /** Whether the test is required for skill validation */
  required: boolean;
  
  /** Timeout in milliseconds */
  timeout?: number;
}

/**
 * Example usage of a skill
 */
export interface Example {
  /** Name of the example */
  name: string;
  
  /** Description of the example scenario */
  description: string;
  
  /** Input data for the example */
  input: any;
  
  /** Expected output */
  output: any;
  
  /** Explanation of the example */
  explanation: string;
  
  /** Tags for categorization */
  tags?: string[];
}

/**
 * Complete skill definition structure
 * 
 * Represents a formal software engineering skill with all metadata required
 * for discovery, composition, and execution in the Agentic Engineering Runtime.
 */
export interface SkillDefinition {
  /** Unique identifier (UUID) */
  id: SkillId;
  
  /** Human-readable name */
  name: string;
  
  /** Semantic version */
  version: SemanticVersion;
  
  /** Detailed description of the skill's purpose and capabilities */
  description: string;
  
  /** Category for organization and discovery */
  category: SkillCategory;
  
  /** JSON Schema defining valid inputs */
  inputSchema: JSONSchema;
  
  /** JSON Schema defining expected outputs */
  outputSchema: JSONSchema;
  
  /** List of skill dependencies */
  dependencies: SkillDependency[];
  
  /** Quality metrics for skill evaluation */
  qualityMetrics: Map<string, MetricDefinition>;
  
  /** Implementation details */
  implementation: SkillImplementation;
  
  /** Test definitions for validation */
  tests: TestDefinition[];
  
  /** Usage examples */
  examples: Example[];
  
  /** Creation timestamp */
  createdAt?: Date;
  
  /** Last update timestamp */
  updatedAt?: Date;
  
  /** Author or maintainer information */
  author?: string;
  
  /** License information */
  license?: string;
  
  /** Keywords for search and discovery */
  keywords?: string[];
  
  /** Documentation URL */
  documentationUrl?: string;
  
  /** Repository URL */
  repositoryUrl?: string;
}

/**
 * Validation result for skill definitions
 */
export interface ValidationResult {
  /** Whether the skill definition is valid */
  valid: boolean;
  
  /** List of validation errors (if any) */
  errors: string[];
  
  /** List of validation warnings (if any) */
  warnings: string[];
  
  /** Specific validation details */
  details?: {
    /** Whether skill name is unique within category */
    uniqueName: boolean;
    
    /** Whether input schema is valid JSON Schema */
    validInputSchema: boolean;
    
    /** Whether output schema is valid JSON Schema */
    validOutputSchema: boolean;
    
    /** Whether dependencies form an acyclic graph */
    acyclicDependencies: boolean;
    
    /** Whether all required fields are present */
    requiredFieldsPresent: boolean;
    
    /** Whether version follows semantic versioning */
    validSemanticVersion: boolean;
    
    /** Whether quality metrics are properly defined */
    validQualityMetrics: boolean;
  };
}

/**
 * Validates a skill definition against schema rules
 * 
 * Validates: Requirements 2.4
 * - Skill names must be unique within category
 * - Input/output schemas must be valid JSON Schema
 * - Dependencies must not form cycles
 * - All required fields must be present
 * 
 * @param skill The skill definition to validate
 * @param existingSkills Map of existing skills by category and name (for uniqueness check)
 * @returns Validation result with details
 */
export function validateSkillDefinition(
  skill: SkillDefinition,
  existingSkills?: Map<string, SkillDefinition[]>
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const details: ValidationResult['details'] = {
    uniqueName: true,
    validInputSchema: true,
    validOutputSchema: true,
    acyclicDependencies: true,
    requiredFieldsPresent: true,
    validSemanticVersion: true,
    validQualityMetrics: true
  };

  // Check required fields
  const requiredFields: (keyof SkillDefinition)[] = [
    'id', 'name', 'version', 'description', 'category',
    'inputSchema', 'outputSchema', 'dependencies',
    'qualityMetrics', 'implementation', 'tests', 'examples'
  ];
  
  for (const field of requiredFields) {
    if (!skill[field]) {
      errors.push(`Missing required field: ${field}`);
      details.requiredFieldsPresent = false;
    }
  }

  // Validate ID format (should be UUID-like)
  if (skill.id && !isValidSkillId(skill.id)) {
    warnings.push(`Skill ID '${skill.id}' does not follow recommended UUID format`);
  }

  // Validate semantic version
  if (skill.version && !isValidSemanticVersion(skill.version)) {
    errors.push(`Invalid semantic version: ${skill.version}. Expected format: MAJOR.MINOR.PATCH`);
    details.validSemanticVersion = false;
  }

  // Validate skill name uniqueness within category
  if (existingSkills && skill.name && skill.category) {
    const categorySkills = existingSkills.get(skill.category) || [];
    const duplicate = categorySkills.find(s => 
      s.name === skill.name && s.id !== skill.id
    );
    if (duplicate) {
      errors.push(`Skill name '${skill.name}' is not unique within category '${skill.category}'`);
      details.uniqueName = false;
    }
  }

  // Validate input schema
  if (skill.inputSchema) {
    const schemaErrors = validateJSONSchema(skill.inputSchema);
    if (schemaErrors.length > 0) {
      errors.push(`Invalid input schema: ${schemaErrors.join(', ')}`);
      details.validInputSchema = false;
    }
  }

  // Validate output schema
  if (skill.outputSchema) {
    const schemaErrors = validateJSONSchema(skill.outputSchema);
    if (schemaErrors.length > 0) {
      errors.push(`Invalid output schema: ${schemaErrors.join(', ')}`);
      details.validOutputSchema = false;
    }
  }

  // Validate dependencies for cycles
  if (skill.dependencies && skill.dependencies.length > 0) {
    const cycleDetected = detectDependencyCycles(skill, existingSkills);
    if (cycleDetected) {
      errors.push('Skill dependencies form a cycle');
      details.acyclicDependencies = false;
    }
  }

  // Validate quality metrics
  if (skill.qualityMetrics) {
    const metricErrors = validateQualityMetrics(skill.qualityMetrics);
    if (metricErrors.length > 0) {
      errors.push(`Invalid quality metrics: ${metricErrors.join(', ')}`);
      details.validQualityMetrics = false;
    }
  }

  // Validate implementation
  if (skill.implementation) {
    const implErrors = validateImplementation(skill.implementation);
    if (implErrors.length > 0) {
      errors.push(`Invalid implementation: ${implErrors.join(', ')}`);
    }
  }

  // Validate tests
  if (skill.tests) {
    const testErrors = validateTests(skill.tests);
    if (testErrors.length > 0) {
      warnings.push(`Test validation issues: ${testErrors.join(', ')}`);
    }
  }

  // Validate examples
  if (skill.examples) {
    const exampleErrors = validateExamples(skill.examples);
    if (exampleErrors.length > 0) {
      warnings.push(`Example validation issues: ${exampleErrors.join(', ')}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    details: errors.length > 0 || warnings.length > 0 ? details : undefined
  };
}

/**
 * Checks if a string is a valid skill ID (UUID format)
 */
function isValidSkillId(id: string): boolean {
  // Basic UUID validation. Skill IDs are UUIDs, but callers may use
  // UUID versions other than v4 when importing existing registries.
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Checks if a string follows semantic versioning format
 */
function isValidSemanticVersion(version: string): boolean {
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  return semverRegex.test(version);
}

/**
 * Validates a JSON Schema object
 */
function validateJSONSchema(schema: JSONSchema): string[] {
  const errors: string[] = [];
  
  if (!schema.type) {
    errors.push('Missing required "type" field');
  }
  
  // Validate schema type
  const validTypes = ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null'];
  if (schema.type && !validTypes.includes(schema.type)) {
    errors.push(`Invalid type: ${schema.type}. Must be one of: ${validTypes.join(', ')}`);
  }
  
  // Validate type-specific constraints
  if (schema.type === 'object') {
    if (schema.properties && typeof schema.properties !== 'object') {
      errors.push('Properties must be an object');
    }
    // Object-specific constraints validation
    if (schema.minimum !== undefined || schema.maximum !== undefined) {
      errors.push('minimum/maximum constraints are not valid for object type');
    }
    if (schema.minLength !== undefined || schema.maxLength !== undefined) {
      errors.push('minLength/maxLength constraints are not valid for object type');
    }
  } else if (schema.type === 'array') {
    if (schema.items && !Array.isArray(schema.items) && typeof schema.items !== 'object') {
      errors.push('Items must be a schema object or array of schema objects');
    }
    // Array-specific constraints validation
    if (schema.minLength !== undefined || schema.maxLength !== undefined) {
      errors.push('minLength/maxLength constraints are not valid for array type (use minItems/maxItems)');
    }
  } else if (schema.type === 'string') {
    // String-specific constraints validation
    if (schema.minimum !== undefined || schema.maximum !== undefined) {
      errors.push('minimum/maximum constraints are not valid for string type (use minLength/maxLength)');
    }
    if (schema.minItems !== undefined || schema.maxItems !== undefined) {
      errors.push('minItems/maxItems constraints are not valid for string type');
    }
  } else if (schema.type === 'number' || schema.type === 'integer') {
    // Number-specific constraints validation
    if (schema.minLength !== undefined || schema.maxLength !== undefined) {
      errors.push('minLength/maxLength constraints are not valid for number type');
    }
    if (schema.minItems !== undefined || schema.maxItems !== undefined) {
      errors.push('minItems/maxItems constraints are not valid for number type');
    }
  }
  
  // Validate numeric constraints for appropriate types
  if ((schema.type === 'number' || schema.type === 'integer') && 
      schema.minimum !== undefined && schema.maximum !== undefined && 
      schema.minimum > schema.maximum) {
    errors.push('Minimum cannot be greater than maximum');
  }
  
  if (schema.type === 'string' && 
      schema.minLength !== undefined && schema.maxLength !== undefined && 
      schema.minLength > schema.maxLength) {
    errors.push('MinLength cannot be greater than maxLength');
  }
  
  if (schema.type === 'array' && 
      schema.minItems !== undefined && schema.maxItems !== undefined && 
      schema.minItems > schema.maxItems) {
    errors.push('MinItems cannot be greater than maxItems');
  }
  
  return errors;
}

/**
 * Detects cycles in skill dependencies using DFS
 */
function detectDependencyCycles(
  skill: SkillDefinition,
  existingSkills?: Map<string, SkillDefinition[]>
): boolean {
  const visited = new Set<SkillId>();
  const recursionStack = new Set<SkillId>();
  
  function hasCycle(skillId: SkillId, skillMap: Map<SkillId, SkillDefinition>): boolean {
    if (recursionStack.has(skillId)) {
      return true;
    }
    
    if (visited.has(skillId)) {
      return false;
    }
    
    visited.add(skillId);
    recursionStack.add(skillId);
    
    const currentSkill = skillMap.get(skillId);
    if (currentSkill) {
      for (const dep of currentSkill.dependencies) {
        if (hasCycle(dep.skillId, skillMap)) {
          return true;
        }
      }
    }
    
    recursionStack.delete(skillId);
    return false;
  }
  
  // Build skill map from existing skills
  const skillMap = new Map<SkillId, SkillDefinition>();
  if (existingSkills) {
    for (const skills of existingSkills.values()) {
      for (const s of skills) {
        skillMap.set(s.id, s);
      }
    }
  }
  skillMap.set(skill.id, skill);
  
  return hasCycle(skill.id, skillMap);
}

/**
 * Validates quality metrics
 */
function validateQualityMetrics(metrics: Map<string, MetricDefinition>): string[] {
  const errors: string[] = [];
  
  if (!(metrics instanceof Map)) {
    errors.push('Quality metrics must be a Map');
    return errors;
  }
  
  for (const [key, metric] of metrics.entries()) {
    if (!metric.name) {
      errors.push(`Metric '${key}' missing name`);
    }
    
    if (!metric.description) {
      errors.push(`Metric '${key}' missing description`);
    }
    
    if (!metric.unit) {
      errors.push(`Metric '${key}' missing unit`);
    }
    
    if (metric.weight !== undefined && (metric.weight < 0 || metric.weight > 1)) {
      errors.push(`Metric '${key}' weight must be between 0 and 1`);
    }
    
    if (metric.minimum !== undefined && metric.maximum !== undefined && metric.minimum > metric.maximum) {
      errors.push(`Metric '${key}' minimum cannot be greater than maximum`);
    }
  }
  
  return errors;
}

/**
 * Validates skill implementation
 */
function validateImplementation(implementation: SkillImplementation): string[] {
  const errors: string[] = [];
  
  if (!implementation.type) {
    errors.push('Missing implementation type');
  }
  
  if (!implementation.runtime) {
    errors.push('Missing runtime specification');
  }
  
  if (!implementation.entryPoint) {
    errors.push('Missing entry point');
  }
  
  if (!implementation.source) {
    errors.push('Missing source code or implementation reference');
  }
  
  if (implementation.estimatedExecutionTime !== undefined && implementation.estimatedExecutionTime < 0) {
    errors.push('Estimated execution time cannot be negative');
  }
  
  if (implementation.memoryRequirement !== undefined && implementation.memoryRequirement < 0) {
    errors.push('Memory requirement cannot be negative');
  }
  
  if (implementation.cpuRequirement !== undefined && (implementation.cpuRequirement < 0 || implementation.cpuRequirement > 1)) {
    errors.push('CPU requirement must be between 0 and 1');
  }
  
  return errors;
}

/**
 * Validates test definitions
 */
function validateTests(tests: TestDefinition[]): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(tests)) {
    errors.push('Tests must be an array');
    return errors;
  }
  
  for (const test of tests) {
    if (!test.id) {
      errors.push('Test missing ID');
    }
    
    if (!test.name) {
      errors.push(`Test '${test.id}' missing name`);
    }
    
    if (!test.description) {
      errors.push(`Test '${test.id}' missing description`);
    }
    
    if (!test.type) {
      errors.push(`Test '${test.id}' missing type`);
    }
    
    if (test.input === undefined) {
      errors.push(`Test '${test.id}' missing input`);
    }
    
    if (test.timeout !== undefined && test.timeout < 0) {
      errors.push(`Test '${test.id}' timeout cannot be negative`);
    }
  }
  
  return errors;
}

/**
 * Validates example definitions
 */
function validateExamples(examples: Example[]): string[] {
  const errors: string[] = [];
  
  if (!Array.isArray(examples)) {
    errors.push('Examples must be an array');
    return errors;
  }
  
  for (const example of examples) {
    if (!example.name) {
      errors.push('Example missing name');
    }
    
    if (!example.description) {
      errors.push(`Example '${example.name}' missing description`);
    }
    
    if (example.input === undefined) {
      errors.push(`Example '${example.name}' missing input`);
    }
    
    if (example.output === undefined) {
      errors.push(`Example '${example.name}' missing output`);
    }
    
    if (!example.explanation) {
      errors.push(`Example '${example.name}' missing explanation`);
    }
  }
  
  return errors;
}

/**
 * Creates a new skill definition with default values
 */
export function createSkillDefinition(
  partial: Partial<SkillDefinition> & Pick<SkillDefinition, 'id' | 'name' | 'version' | 'description' | 'category'>
): SkillDefinition {
  const now = new Date();
  
  return {
    id: partial.id,
    name: partial.name,
    version: partial.version,
    description: partial.description,
    category: partial.category,
    inputSchema: partial.inputSchema || { type: 'object', properties: {} },
    outputSchema: partial.outputSchema || { type: 'object', properties: {} },
    dependencies: partial.dependencies || [],
    qualityMetrics: partial.qualityMetrics || new Map(),
    implementation: partial.implementation || {
      type: 'typescript-function',
      runtime: 'nodejs',
      entryPoint: 'execute',
      source: 'function execute(input) { return input; }'
    },
    tests: partial.tests || [],
    examples: partial.examples || [],
    createdAt: partial.createdAt || now,
    updatedAt: partial.updatedAt || now,
    author: partial.author,
    license: partial.license,
    keywords: partial.keywords || [],
    documentationUrl: partial.documentationUrl,
    repositoryUrl: partial.repositoryUrl
  };
}

/**
 * Updates an existing skill definition
 */
export function updateSkillDefinition(
  existing: SkillDefinition,
  updates: Partial<SkillDefinition>
): SkillDefinition {
  const previousUpdatedAt = existing.updatedAt?.getTime() ?? existing.createdAt?.getTime() ?? 0;
  const updatedAt = new Date(Math.max(Date.now(), previousUpdatedAt + 1));

  return {
    ...existing,
    ...updates,
    updatedAt
  };
}

/**
 * Checks if two skill definitions are compatible for composition
 */
export function areSkillsCompatible(skill1: SkillDefinition, skill2: SkillDefinition): boolean {
  // Check if output schema of skill1 matches input schema of skill2
  // This is a simplified check - in practice would need schema compatibility analysis
  return true;
}

/**
 * Calculates a quality score for a skill based on its metrics
 */
export function calculateQualityScore(skill: SkillDefinition): number {
  if (skill.qualityMetrics.size === 0) {
    return 0;
  }
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const metric of skill.qualityMetrics.values()) {
    const weight = metric.weight || 1;
    // Simplified scoring - in practice would use actual metric values
    const score = 0.8; // Default score
    
    weightedSum += score * weight;
    totalWeight += weight;
  }
  
  return totalWeight > 0 ? weightedSum / totalWeight : 0;
}
