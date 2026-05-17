/**
 * Skill Graph Interface
 * 
 * Manages a repository of reusable software engineering skills with metadata and dependencies.
 * Provides skill discovery, registration, dependency resolution, and implementation retrieval.
 * 
 * Validates: Requirements 2.2, 2.3, 2.5
 */

import {
  SkillId,
  SkillDefinition,
  SemanticVersion,
  SkillCategory,
  JSONSchema,
  validateSkillDefinition,
  calculateQualityScore
} from './skill-definition.js';

export type MaybePromise<T> = T | Promise<T>;

/**
 * Requirements for skill discovery
 */
export interface SkillRequirement {
  /** Required skill category (optional) */
  category?: SkillCategory;
  
  /** Required input schema that the skill must accept (optional) */
  inputSchema?: JSONSchema;
  
  /** Required output schema that the skill must produce (optional) */
  outputSchema?: JSONSchema;
  
  /** Keywords to match against skill name, description, or keywords (optional) */
  keywords?: string[];
  
  /** Minimum quality score threshold (0-1 scale) */
  minQualityScore?: number;
  
  /** Maximum number of results to return */
  limit?: number;
  
  /** Whether to include deprecated skills */
  includeDeprecated?: boolean;
}

/**
 * Result of skill matching with relevance score
 */
export interface SkillMatch {
  /** The matched skill definition */
  skill: SkillDefinition;
  
  /** Relevance score (0-1) indicating how well the skill matches requirements */
  relevanceScore: number;
  
  /** Quality score (0-1) based on skill metrics */
  qualityScore: number;
  
  /** Composite score combining relevance and quality */
  compositeScore: number;
  
  /** Reasons for the match (e.g., category match, keyword match, schema compatibility) */
  matchReasons: string[];
}

/**
 * Result of dependency resolution
 */
export interface DependencyResolution {
  /** Whether all dependencies were successfully resolved */
  resolved: boolean;
  
  /** List of resolved skill IDs in execution order */
  resolvedSkillIds: SkillId[];
  
  /** Map of skill ID to its resolved version */
  resolvedVersions: Map<SkillId, SemanticVersion>;
  
  /** List of unresolved dependencies with reasons */
  unresolvedDependencies: Array<{
    skillId: SkillId;
    versionConstraint: string;
    reason: string;
  }>;
  
  /** Whether dependency graph contains cycles */
  hasCycles: boolean;
  
  /** List of detected cycles (if any) */
  cycles: SkillId[][];
}

/**
 * Implementation details for a skill
 */
export interface SkillImplementation {
  /** The skill implementation */
  implementation: any;
  
  /** Runtime configuration */
  config?: Record<string, any>;
  
  /** Environment variables */
  environment?: Record<string, string>;
  
  /** Dependencies that need to be loaded */
  dependencies: SkillId[];
}

/**
 * Skill Graph Interface
 * 
 * Provides skill management, discovery, and dependency resolution capabilities.
 */
export interface SkillGraph {
  /**
   * Register a new skill with validation and uniqueness checking
   * 
   * Validates: Requirements 2.1, 2.4
   * 
   * @param skill The skill definition to register
   * @returns The registered skill ID
   * @throws Error if skill validation fails or skill conflicts exist
   */
  registerSkill(skill: SkillDefinition): MaybePromise<SkillId>;
  
  /**
   * Find skills matching requirements with relevance ranking
   * 
   * Validates: Requirements 2.2, 2.5
   * 
   * @param requirements The search requirements
   * @returns List of skill matches ranked by relevance and quality
   */
  findSkills(requirements: SkillRequirement): MaybePromise<SkillMatch[]>;
  
  /**
   * Resolve skill dependencies and detect cycles
   * 
   * Validates: Requirements 2.3, 2.4
   * 
   * @param skillIds List of skill IDs to resolve dependencies for
   * @returns Dependency resolution result
   */
  resolveDependencies(skillIds: SkillId[]): MaybePromise<DependencyResolution>;
  
  /**
   * Retrieve skill implementation by ID
   * 
   * @param skillId The skill ID
   * @returns Skill implementation details
   * @throws Error if skill not found
   */
  getSkillImplementation(skillId: SkillId): MaybePromise<SkillImplementation>;

  /**
   * Retrieve the complete skill definition by ID.
   *
   * @param skillId The skill ID
   * @returns Skill definition, or null/undefined if the skill is missing
   */
  getSkill(skillId: SkillId): MaybePromise<SkillDefinition | null | undefined>;
}

/**
 * In-memory implementation of SkillGraph
 */
export class InMemorySkillGraph implements SkillGraph {
  private skills: Map<SkillId, SkillDefinition> = new Map();
  private skillsByCategory: Map<SkillCategory, SkillDefinition[]> = new Map();
  private skillsByKeyword: Map<string, SkillDefinition[]> = new Map();
  private deprecatedSkills: Set<SkillId> = new Set();
  
  /**
   * Register a new skill with validation and uniqueness checking
   */
  registerSkill(skill: SkillDefinition): SkillId {
    // Check for existing skill with same ID
    if (this.skills.has(skill.id)) {
      throw new Error(`Skill with ID ${skill.id} already exists`);
    }
    
    // Check for name uniqueness within category
    const categorySkills = this.skillsByCategory.get(skill.category) || [];
    const duplicateName = categorySkills.find(s => s.name === skill.name);
    if (duplicateName) {
      throw new Error(`Skill name '${skill.name}' already exists in category '${skill.category}'`);
    }

    // Validate skill definition after direct conflict checks so callers get
    // precise registration errors for duplicate IDs and names.
    const validationResult = validateSkillDefinition(skill, this.skillsByCategory);
    if (!validationResult.valid) {
      throw new Error(`Skill validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Register the skill
    this.skills.set(skill.id, skill);
    
    // Update category index
    if (!this.skillsByCategory.has(skill.category)) {
      this.skillsByCategory.set(skill.category, []);
    }
    this.skillsByCategory.get(skill.category)!.push(skill);
    
    // Update keyword index
    if (skill.keywords) {
      for (const keyword of skill.keywords) {
        const normalizedKeyword = keyword.toLowerCase();
        if (!this.skillsByKeyword.has(normalizedKeyword)) {
          this.skillsByKeyword.set(normalizedKeyword, []);
        }
        this.skillsByKeyword.get(normalizedKeyword)!.push(skill);
      }
    }
    
    // Also index by skill name and description keywords
    this.indexText(skill.name, skill);
    this.indexText(skill.description, skill);
    
    return skill.id;
  }
  
  /**
   * Find skills matching requirements with relevance ranking
   */
  findSkills(requirements: SkillRequirement): SkillMatch[] {
    const allSkills = Array.from(this.skills.values());
    
    // Filter out deprecated skills unless explicitly included
    let candidates = allSkills.filter(skill => 
      requirements.includeDeprecated || !this.deprecatedSkills.has(skill.id)
    );
    
    // Apply category filter
    if (requirements.category) {
      candidates = candidates.filter(skill => skill.category === requirements.category);
    }
    
    // Apply quality score filter
    if (requirements.minQualityScore !== undefined) {
      candidates = candidates.filter(skill => {
        const qualityScore = calculateQualityScore(skill);
        return qualityScore >= requirements.minQualityScore!;
      });
    }
    
    // Score each candidate
    const matches: SkillMatch[] = candidates.map(skill => {
      const { relevanceScore, matchReasons } = this.calculateRelevance(skill, requirements);
      const qualityScore = calculateQualityScore(skill);
      const compositeScore = this.calculateCompositeScore(relevanceScore, qualityScore);
      
      return {
        skill,
        relevanceScore,
        qualityScore,
        compositeScore,
        matchReasons
      };
    });
    
    // Sort by composite score (descending)
    matches.sort((a, b) => b.compositeScore - a.compositeScore);
    
    // Apply limit
    if (requirements.limit !== undefined && requirements.limit > 0) {
      return matches.slice(0, requirements.limit);
    }
    
    return matches;
  }
  
  /**
   * Resolve skill dependencies and detect cycles
   */
  resolveDependencies(skillIds: SkillId[]): DependencyResolution {
    const resolvedSkillIds: SkillId[] = [];
    const resolvedVersions = new Map<SkillId, SemanticVersion>();
    const unresolvedDependencies: Array<{
      skillId: SkillId;
      versionConstraint: string;
      reason: string;
    }> = [];
    
    // Build dependency graph
    const dependencyGraph = new Map<SkillId, SkillId[]>();
    const visited = new Set<SkillId>();
    const recursionStack = new Set<SkillId>();
    const cycles: SkillId[][] = [];
    
    // Helper function to resolve a skill and its dependencies
    const resolveSkill = (skillId: SkillId, path: SkillId[] = []): boolean => {
      // Check for cycles
      if (recursionStack.has(skillId)) {
        const cycleStart = path.indexOf(skillId);
        if (cycleStart !== -1) {
          cycles.push([...path.slice(cycleStart), skillId]);
        }
        return false;
      }
      
      if (visited.has(skillId)) {
        return true;
      }
      
      visited.add(skillId);
      recursionStack.add(skillId);
      path.push(skillId);
      
      const skill = this.skills.get(skillId);
      if (!skill) {
        unresolvedDependencies.push({
          skillId,
          versionConstraint: '*',
          reason: `Skill not found: ${skillId}`
        });
        recursionStack.delete(skillId);
        path.pop();
        return false;
      }
      
      // Resolve dependencies first
      let allDependenciesResolved = true;
      for (const dep of skill.dependencies) {
        if (!resolveSkill(dep.skillId, path)) {
          allDependenciesResolved = false;
          if (!unresolvedDependencies.some(d => d.skillId === dep.skillId)) {
            unresolvedDependencies.push({
              skillId: dep.skillId,
              versionConstraint: dep.versionConstraint,
              reason: `Failed to resolve dependency for skill: ${skillId}`
            });
          }
        }
      }
      
      // Add skill to resolved list if all dependencies resolved
      if (allDependenciesResolved) {
        if (!resolvedSkillIds.includes(skillId)) {
          resolvedSkillIds.push(skillId);
        }
        resolvedVersions.set(skillId, skill.version);
      }
      
      recursionStack.delete(skillId);
      path.pop();
      return allDependenciesResolved;
    };
    
    // Resolve all requested skills
    let allResolved = true;
    for (const skillId of skillIds) {
      if (!resolveSkill(skillId)) {
        allResolved = false;
      }
    }
    
    return {
      resolved: allResolved && unresolvedDependencies.length === 0,
      resolvedSkillIds,
      resolvedVersions,
      unresolvedDependencies,
      hasCycles: cycles.length > 0,
      cycles
    };
  }
  
  /**
   * Retrieve skill implementation by ID
   */
  getSkillImplementation(skillId: SkillId): SkillImplementation {
    const skill = this.skills.get(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }
    
    return {
      implementation: skill.implementation,
      config: skill.implementation.config,
      environment: skill.implementation.environment,
      dependencies: skill.dependencies.map(dep => dep.skillId)
    };
  }
  
  /**
   * Mark a skill as deprecated
   */
  deprecateSkill(skillId: SkillId): void {
    if (!this.skills.has(skillId)) {
      throw new Error(`Skill not found: ${skillId}`);
    }
    this.deprecatedSkills.add(skillId);
  }
  
  /**
   * Remove deprecation from a skill
   */
  undeprecateSkill(skillId: SkillId): void {
    this.deprecatedSkills.delete(skillId);
  }
  
  /**
   * Get skill by ID
   */
  getSkill(skillId: SkillId): SkillDefinition | undefined {
    return this.skills.get(skillId);
  }
  
  /**
   * Get all skills in a category
   */
  getSkillsByCategory(category: SkillCategory): SkillDefinition[] {
    return this.skillsByCategory.get(category) || [];
  }
  
  /**
   * Get all registered skills
   */
  getAllSkills(): SkillDefinition[] {
    return Array.from(this.skills.values());
  }
  
  /**
   * Clear all skills (for testing)
   */
  clear(): void {
    this.skills.clear();
    this.skillsByCategory.clear();
    this.skillsByKeyword.clear();
    this.deprecatedSkills.clear();
  }
  
  /**
   * Calculate relevance score for a skill against requirements
   */
  private calculateRelevance(skill: SkillDefinition, requirements: SkillRequirement): {
    relevanceScore: number;
    matchReasons: string[];
  } {
    const matchReasons: string[] = [];
    let score = 0;
    let maxScore = 0;
    
    // Category match (weight: 0.3)
    maxScore += 0.3;
    if (requirements.category && skill.category === requirements.category) {
      score += 0.3;
      matchReasons.push('Category match');
    }
    
    // Keyword match (weight: 0.4)
    maxScore += 0.4;
    if (requirements.keywords && requirements.keywords.length > 0) {
      const keywordMatches = this.countKeywordMatches(skill, requirements.keywords);
      if (keywordMatches > 0) {
        const keywordScore = Math.min(keywordMatches / requirements.keywords.length, 1) * 0.4;
        score += keywordScore;
        matchReasons.push(`Keyword matches: ${keywordMatches}`);
      }
    }
    
    // Schema compatibility (weight: 0.3)
    maxScore += 0.3;
    if (requirements.inputSchema || requirements.outputSchema) {
      const schemaScore = this.calculateSchemaCompatibility(skill, requirements);
      score += schemaScore * 0.3;
      if (schemaScore > 0) {
        matchReasons.push('Schema compatible');
      }
    }
    
    // Normalize score
    const relevanceScore = maxScore > 0 ? score / maxScore : 0;
    
    return { relevanceScore, matchReasons };
  }
  
  /**
   * Count keyword matches in skill name, description, and keywords
   */
  private countKeywordMatches(skill: SkillDefinition, keywords: string[]): number {
    let matches = 0;
    const searchText = [
      skill.name.toLowerCase(),
      skill.description.toLowerCase(),
      ...(skill.keywords || []).map(k => k.toLowerCase())
    ].join(' ');
    
    for (const keyword of keywords) {
      const normalizedKeyword = keyword.toLowerCase();
      if (searchText.includes(normalizedKeyword)) {
        matches++;
      }
    }
    
    return matches;
  }
  
  /**
   * Calculate schema compatibility score
   */
  private calculateSchemaCompatibility(skill: SkillDefinition, requirements: SkillRequirement): number {
    let score = 0;
    let maxScore = 0;
    
    // Input schema compatibility
    if (requirements.inputSchema) {
      maxScore += 0.5;
      // Simplified compatibility check - in practice would use JSON Schema validation
      const inputCompatible = this.areSchemasCompatible(requirements.inputSchema, skill.inputSchema);
      if (inputCompatible) {
        score += 0.5;
      }
    }
    
    // Output schema compatibility
    if (requirements.outputSchema) {
      maxScore += 0.5;
      // Simplified compatibility check
      const outputCompatible = this.areSchemasCompatible(skill.outputSchema, requirements.outputSchema);
      if (outputCompatible) {
        score += 0.5;
      }
    }
    
    return maxScore > 0 ? score / maxScore : 0;
  }
  
  /**
   * Simplified schema compatibility check
   */
  private areSchemasCompatible(required: JSONSchema, provided: JSONSchema): boolean {
    // Basic type compatibility
    if (required.type && provided.type && required.type !== provided.type) {
      return false;
    }
    
    // For objects, check if required properties exist
    if (required.type === 'object' && provided.type === 'object') {
      if (required.properties && provided.properties) {
        for (const [key, propSchema] of Object.entries(required.properties)) {
          if (!provided.properties[key]) {
            return false;
          }
        }
      }
      
      // Check required array
      if (required.required && Array.isArray(required.required)) {
        for (const requiredProp of required.required) {
          if (!provided.required || !provided.required.includes(requiredProp)) {
            return false;
          }
        }
      }
    }
    
    // For arrays, check item type compatibility
    if (required.type === 'array' && provided.type === 'array') {
      if (required.items && provided.items) {
        if (Array.isArray(required.items) && Array.isArray(provided.items)) {
          // Tuple type compatibility
          if (required.items.length !== provided.items.length) {
            return false;
          }
        }
      }
    }
    
    return true;
  }
  
  /**
   * Calculate composite score from relevance and quality
   */
  private calculateCompositeScore(relevanceScore: number, qualityScore: number): number {
    // Weighted average: 70% relevance, 30% quality
    return (relevanceScore * 0.7) + (qualityScore * 0.3);
  }
  
  /**
   * Index text for keyword search
   */
  private indexText(text: string, skill: SkillDefinition): void {
    const words = text.toLowerCase().split(/\W+/).filter(word => word.length > 2);
    for (const word of words) {
      if (!this.skillsByKeyword.has(word)) {
        this.skillsByKeyword.set(word, []);
      }
      const skills = this.skillsByKeyword.get(word)!;
      if (!skills.includes(skill)) {
        skills.push(skill);
      }
    }
  }
}

/**
 * Factory function to create a new SkillGraph instance
 */
export function createSkillGraph(): SkillGraph {
  return new InMemorySkillGraph();
}
