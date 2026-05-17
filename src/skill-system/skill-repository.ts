/**
 * Skill Repository
 * 
 * Implements persistent storage for skills with versioning, metadata indexing, and dependency resolution.
 * Provides CRUD operations, search capabilities, and dependency management for the skill system.
 * 
 * Validates: Requirements 2.1, 2.4
 */

import {
  SkillId,
  SkillDefinition,
  SemanticVersion,
  SkillCategory,
  JSONSchema,
  SkillDependency,
  validateSkillDefinition,
  calculateQualityScore
} from './skill-definition.js';

import {
  SkillGraph,
  SkillRequirement,
  SkillMatch,
  DependencyResolution,
  SkillImplementation
} from './skill-graph.js';

/**
 * Storage interface for skill persistence
 */
export interface SkillStorage {
  /**
   * Save a skill definition to storage
   */
  save(skill: SkillDefinition): Promise<void>;
  
  /**
   * Load a skill definition by ID
   */
  load(skillId: SkillId): Promise<SkillDefinition | null>;
  
  /**
   * Load all skill definitions
   */
  loadAll(): Promise<SkillDefinition[]>;
  
  /**
   * Delete a skill definition by ID
   */
  delete(skillId: SkillId): Promise<boolean>;
  
  /**
   * Check if a skill exists
   */
  exists(skillId: SkillId): Promise<boolean>;
  
  /**
   * Get all skill IDs
   */
  getAllIds(): Promise<SkillId[]>;
  
  /**
   * Search skills by metadata
   */
  search(query: SkillSearchQuery): Promise<SkillDefinition[]>;
}

/**
 * Search query for skill repository
 */
export interface SkillSearchQuery {
  /** Search by category */
  category?: SkillCategory;
  
  /** Search by name (partial match) */
  name?: string;
  
  /** Search by keywords */
  keywords?: string[];
  
  /** Search by author */
  author?: string;
  
  /** Minimum version */
  minVersion?: SemanticVersion;
  
  /** Maximum version */
  maxVersion?: SemanticVersion;
  
  /** Whether to include deprecated skills */
  includeDeprecated?: boolean;
  
  /** Limit results */
  limit?: number;
  
  /** Offset for pagination */
  offset?: number;
  
  /** Sort field */
  sortBy?: 'name' | 'version' | 'createdAt' | 'updatedAt' | 'qualityScore';
  
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
}

/**
 * Version management for skills
 */
export interface VersionManager {
  /**
   * Get all versions of a skill
   */
  getVersions(skillId: SkillId): Promise<SemanticVersion[]>;
  
  /**
   * Get specific version of a skill
   */
  getVersion(skillId: SkillId, version: SemanticVersion): Promise<SkillDefinition | null>;
  
  /**
   * Check if version exists
   */
  versionExists(skillId: SkillId, version: SemanticVersion): Promise<boolean>;
  
  /**
   * Get latest version of a skill
   */
  getLatestVersion(skillId: SkillId): Promise<SemanticVersion | null>;
  
  /**
   * Check if version constraint is satisfied
   */
  satisfiesConstraint(version: SemanticVersion, constraint: string): Promise<boolean>;
  
  /**
   * Find best matching version for constraint
   */
  findBestMatch(skillId: SkillId, constraint: string): Promise<SemanticVersion | null>;
}

/**
 * Metadata index for efficient skill discovery
 */
export interface MetadataIndex {
  /**
   * Index a skill's metadata
   */
  index(skill: SkillDefinition): Promise<void>;
  
  /**
   * Remove a skill from index
   */
  remove(skillId: SkillId): Promise<void>;
  
  /**
   * Search by metadata
   */
  search(query: SkillSearchQuery): Promise<SkillId[]>;
  
  /**
   * Get skills by category
   */
  getByCategory(category: SkillCategory): Promise<SkillId[]>;
  
  /**
   * Get skills by keyword
   */
  getByKeyword(keyword: string): Promise<SkillId[]>;
  
  /**
   * Get skills by author
   */
  getByAuthor(author: string): Promise<SkillId[]>;
  
  /**
   * Clear the index
   */
  clear(): Promise<void>;
}

/**
 * Dependency resolver for skill relationships
 */
export interface DependencyResolver {
  /**
   * Resolve dependencies for a set of skills
   */
  resolve(skillIds: SkillId[]): Promise<DependencyResolution>;
  
  /**
   * Check for dependency cycles
   */
  detectCycles(skillIds: SkillId[]): Promise<SkillId[][]>;
  
  /**
   * Get transitive dependencies
   */
  getTransitiveDependencies(skillId: SkillId): Promise<SkillId[]>;
  
  /**
   * Get skills that depend on a given skill
   */
  getDependents(skillId: SkillId): Promise<SkillId[]>;
  
  /**
   * Check if dependency can be satisfied
   */
  canSatisfy(dependency: SkillDependency): Promise<boolean>;
  
  /**
   * Validate dependency graph
   */
  validateGraph(): Promise<{ valid: boolean; cycles: SkillId[][]; missing: SkillId[] }>;
}

/**
 * Skill Repository implementation
 * 
 * Combines storage, versioning, indexing, and dependency resolution
 * to provide comprehensive skill management.
 */
export class SkillRepository implements SkillGraph {
  private storage: SkillStorage;
  private versionManager: VersionManager;
  private metadataIndex: MetadataIndex;
  private dependencyResolver: DependencyResolver;
  
  private skills: Map<SkillId, SkillDefinition> = new Map();
  private skillsByCategory: Map<SkillCategory, SkillDefinition[]> = new Map();
  private skillsByKeyword: Map<string, SkillDefinition[]> = new Map();
  private deprecatedSkills: Set<SkillId> = new Set();
  
  constructor(
    storage: SkillStorage,
    versionManager: VersionManager,
    metadataIndex: MetadataIndex,
    dependencyResolver: DependencyResolver
  ) {
    this.storage = storage;
    this.versionManager = versionManager;
    this.metadataIndex = metadataIndex;
    this.dependencyResolver = dependencyResolver;
  }
  
  /**
   * Initialize repository by loading all skills from storage
   */
  async initialize(): Promise<void> {
    const skills = await this.storage.loadAll();
    
    // Clear existing in-memory state
    this.skills.clear();
    this.skillsByCategory.clear();
    this.skillsByKeyword.clear();
    this.deprecatedSkills.clear();
    
    // Load skills into memory
    for (const skill of skills) {
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
      
      // Index text for search
      this.indexText(skill.name, skill);
      this.indexText(skill.description, skill);
    }
    
    // Rebuild metadata index
    await this.metadataIndex.clear();
    for (const skill of skills) {
      await this.metadataIndex.index(skill);
    }
  }
  
  /**
   * Register a new skill with validation and persistence
   */
  async registerSkill(skill: SkillDefinition): Promise<SkillId> {
    // Check for existing skill with same ID
    if (await this.storage.exists(skill.id)) {
      throw new Error(`Skill with ID ${skill.id} already exists`);
    }
    
    // Check for name uniqueness within category
    const categorySkills = this.skillsByCategory.get(skill.category) || [];
    const duplicateName = categorySkills.find(s => s.name === skill.name);
    if (duplicateName) {
      throw new Error(`Skill name '${skill.name}' already exists in category '${skill.category}'`);
    }

    // Validate skill definition after direct conflict checks so duplicate
    // registration failures remain specific and actionable.
    const validationResult = validateSkillDefinition(skill, this.skillsByCategory);
    if (!validationResult.valid) {
      throw new Error(`Skill validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Validate dependencies
    const dependencyValidation = await this.validateDependencies(skill);
    if (!dependencyValidation.valid) {
      throw new Error(`Dependency validation failed: ${dependencyValidation.errors.join(', ')}`);
    }
    
    // Save to storage
    await this.storage.save(skill);
    
    // Update in-memory state
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
    
    // Index text for search
    this.indexText(skill.name, skill);
    this.indexText(skill.description, skill);
    
    // Update metadata index
    await this.metadataIndex.index(skill);
    
    return skill.id;
  }
  
  /**
   * Find skills matching requirements with relevance ranking
   */
  async findSkills(requirements: SkillRequirement): Promise<SkillMatch[]> {
    // Convert SkillRequirement to SkillSearchQuery
    const searchQuery: SkillSearchQuery = {
      category: requirements.category,
      keywords: requirements.keywords,
      includeDeprecated: requirements.includeDeprecated,
      limit: requirements.limit
    };
    
    // Search using metadata index
    const skillIds = await this.metadataIndex.search(searchQuery);
    
    // Load skill definitions
    const candidates: SkillDefinition[] = [];
    for (const skillId of skillIds) {
      const skill = this.skills.get(skillId);
      if (skill) {
        candidates.push(skill);
      }
    }
    
    // Filter out deprecated skills unless explicitly included
    let filteredCandidates = candidates.filter(skill => 
      requirements.includeDeprecated || !this.deprecatedSkills.has(skill.id)
    );
    
    // Apply quality score filter
    if (requirements.minQualityScore !== undefined) {
      filteredCandidates = filteredCandidates.filter(skill => {
        const qualityScore = calculateQualityScore(skill);
        return qualityScore >= requirements.minQualityScore!;
      });
    }
    
    // Score each candidate
    const matches: SkillMatch[] = filteredCandidates.map(skill => {
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
  async resolveDependencies(skillIds: SkillId[]): Promise<DependencyResolution> {
    return await this.dependencyResolver.resolve(skillIds);
  }
  
  /**
   * Retrieve skill implementation by ID
   */
  async getSkillImplementation(skillId: SkillId): Promise<SkillImplementation> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      // Try to load from storage
      const loadedSkill = await this.storage.load(skillId);
      if (!loadedSkill) {
        throw new Error(`Skill not found: ${skillId}`);
      }
      this.skills.set(skillId, loadedSkill);
    }
    
    const finalSkill = this.skills.get(skillId)!;
    
    return {
      implementation: finalSkill.implementation,
      config: finalSkill.implementation.config,
      environment: finalSkill.implementation.environment,
      dependencies: finalSkill.dependencies.map(dep => dep.skillId)
    };
  }
  
  /**
   * Get skill by ID
   */
  async getSkill(skillId: SkillId): Promise<SkillDefinition | null> {
    const skill = this.skills.get(skillId);
    if (skill) {
      return skill;
    }
    
    // Try to load from storage
    const loadedSkill = await this.storage.load(skillId);
    if (loadedSkill) {
      this.skills.set(skillId, loadedSkill);
      return loadedSkill;
    }
    
    return null;
  }
  
  /**
   * Update an existing skill
   */
  async updateSkill(skillId: SkillId, updates: Partial<SkillDefinition>): Promise<SkillDefinition> {
    const existingSkill = await this.getSkill(skillId);
    if (!existingSkill) {
      throw new Error(`Skill not found: ${skillId}`);
    }
    
    // Create updated skill
    const updatedSkill: SkillDefinition = {
      ...existingSkill,
      ...updates,
      updatedAt: new Date()
    };
    
    // Validate updated skill
    const validationResult = validateSkillDefinition(updatedSkill, this.skillsByCategory);
    if (!validationResult.valid) {
      throw new Error(`Skill validation failed: ${validationResult.errors.join(', ')}`);
    }
    
    // Validate dependencies
    const dependencyValidation = await this.validateDependencies(updatedSkill);
    if (!dependencyValidation.valid) {
      throw new Error(`Dependency validation failed: ${dependencyValidation.errors.join(', ')}`);
    }
    
    // Save to storage
    await this.storage.save(updatedSkill);
    
    // Update in-memory state
    this.skills.set(skillId, updatedSkill);
    
    // Update indices
    await this.updateIndices(existingSkill, updatedSkill);
    
    return updatedSkill;
  }
  
  /**
   * Delete a skill
   */
  async deleteSkill(skillId: SkillId): Promise<boolean> {
    const skill = this.skills.get(skillId);
    if (!skill) {
      return false;
    }
    
    // Check if other skills depend on this skill
    const dependents = await this.dependencyResolver.getDependents(skillId);
    if (dependents.length > 0) {
      throw new Error(`Cannot delete skill ${skillId}: ${dependents.length} skills depend on it`);
    }
    
    // Delete from storage
    const deleted = await this.storage.delete(skillId);
    if (!deleted) {
      return false;
    }
    
    // Remove from in-memory state
    this.skills.delete(skillId);
    this.deprecatedSkills.delete(skillId);
    
    // Remove from category index
    const categorySkills = this.skillsByCategory.get(skill.category) || [];
    const index = categorySkills.findIndex(s => s.id === skillId);
    if (index !== -1) {
      categorySkills.splice(index, 1);
    }
    
    // Remove from keyword index
    if (skill.keywords) {
      for (const keyword of skill.keywords) {
        const normalizedKeyword = keyword.toLowerCase();
        const keywordSkills = this.skillsByKeyword.get(normalizedKeyword);
        if (keywordSkills) {
          const keywordIndex = keywordSkills.findIndex(s => s.id === skillId);
          if (keywordIndex !== -1) {
            keywordSkills.splice(keywordIndex, 1);
          }
        }
      }
    }
    
    // Remove from metadata index
    await this.metadataIndex.remove(skillId);
    
    return true;
  }
  
  /**
   * Mark a skill as deprecated
   */
  async deprecateSkill(skillId: SkillId): Promise<void> {
    const skill = await this.getSkill(skillId);
    if (!skill) {
      throw new Error(`Skill not found: ${skillId}`);
    }
    
    this.deprecatedSkills.add(skillId);
    
    // Update skill with deprecation flag
    const updatedSkill: SkillDefinition = {
      ...skill,
      updatedAt: new Date()
    };
    
    await this.storage.save(updatedSkill);
    this.skills.set(skillId, updatedSkill);
  }
  
  /**
   * Remove deprecation from a skill
   */
  async undeprecateSkill(skillId: SkillId): Promise<void> {
    this.deprecatedSkills.delete(skillId);
    
    const skill = await this.getSkill(skillId);
    if (skill) {
      const updatedSkill: SkillDefinition = {
        ...skill,
        updatedAt: new Date()
      };
      
      await this.storage.save(updatedSkill);
      this.skills.set(skillId, updatedSkill);
    }
  }
  
  /**
   * Search skills using advanced query
   */
  async searchSkills(query: SkillSearchQuery): Promise<SkillDefinition[]> {
    const skillIds = await this.metadataIndex.search(query);
    
    const skills: SkillDefinition[] = [];
    for (const skillId of skillIds) {
      const skill = await this.getSkill(skillId);
      if (skill) {
        skills.push(skill);
      }
    }
    
    // Apply sorting
    if (query.sortBy) {
      skills.sort((a, b) => {
        let aValue: any, bValue: any;
        
        switch (query.sortBy) {
          case 'name':
            aValue = a.name;
            bValue = b.name;
            break;
          case 'version':
            aValue = a.version;
            bValue = b.version;
            break;
          case 'createdAt':
            aValue = a.createdAt?.getTime() || 0;
            bValue = b.createdAt?.getTime() || 0;
            break;
          case 'updatedAt':
            aValue = a.updatedAt?.getTime() || 0;
            bValue = b.updatedAt?.getTime() || 0;
            break;
          case 'qualityScore':
            aValue = calculateQualityScore(a);
            bValue = calculateQualityScore(b);
            break;
          default:
            return 0;
        }
        
        const direction = query.sortDirection === 'desc' ? -1 : 1;
        
        if (aValue < bValue) return -1 * direction;
        if (aValue > bValue) return 1 * direction;
        return 0;
      });
    }
    
    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || skills.length;
    
    return skills.slice(offset, offset + limit);
  }
  
  /**
   * Get all skills in a category
   */
  async getSkillsByCategory(category: SkillCategory): Promise<SkillDefinition[]> {
    const skillIds = await this.metadataIndex.getByCategory(category);
    
    const skills: SkillDefinition[] = [];
    for (const skillId of skillIds) {
      const skill = await this.getSkill(skillId);
      if (skill) {
        skills.push(skill);
      }
    }
    
    return skills;
  }
  
  /**
   * Get all registered skills
   */
  async getAllSkills(): Promise<SkillDefinition[]> {
    const skillIds = await this.storage.getAllIds();
    
    const skills: SkillDefinition[] = [];
    for (const skillId of skillIds) {
      const skill = await this.getSkill(skillId);
      if (skill) {
        skills.push(skill);
      }
    }
    
    return skills;
  }
  
  /**
   * Validate dependency graph
   */
  async validateDependencyGraph(): Promise<{ valid: boolean; cycles: SkillId[][]; missing: SkillId[] }> {
    return await this.dependencyResolver.validateGraph();
  }
  
  /**
   * Get transitive dependencies for a skill
   */
  async getTransitiveDependencies(skillId: SkillId): Promise<SkillId[]> {
    return await this.dependencyResolver.getTransitiveDependencies(skillId);
  }
  
  /**
   * Get skills that depend on a given skill
   */
  async getDependents(skillId: SkillId): Promise<SkillId[]> {
    return await this.dependencyResolver.getDependents(skillId);
  }
  
  /**
   * Clear all skills (for testing)
   */
  async clear(): Promise<void> {
    // Clear storage (implementation dependent)
    // This would typically be handled by the storage implementation
    
    // Clear in-memory state
    this.skills.clear();
    this.skillsByCategory.clear();
    this.skillsByKeyword.clear();
    this.deprecatedSkills.clear();
    
    // Clear metadata index
    await this.metadataIndex.clear();
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
  
  /**
   * Validate skill dependencies
   */
  private async validateDependencies(skill: SkillDefinition): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    for (const dependency of skill.dependencies) {
      const canSatisfy = await this.dependencyResolver.canSatisfy(dependency);
      if (!canSatisfy) {
        errors.push(`Cannot satisfy dependency: ${dependency.skillId} ${dependency.versionConstraint}`);
      }
    }
    
    // Check for self-dependency
    if (skill.dependencies.some(dep => dep.skillId === skill.id)) {
      errors.push('Skill cannot depend on itself');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Update indices when a skill changes
   */
  private async updateIndices(oldSkill: SkillDefinition, newSkill: SkillDefinition): Promise<void> {
    // Remove old skill from metadata index
    await this.metadataIndex.remove(oldSkill.id);
    
    // Add new skill to metadata index
    await this.metadataIndex.index(newSkill);
    
    // Update category index if category changed
    if (oldSkill.category !== newSkill.category) {
      // Remove from old category
      const oldCategorySkills = this.skillsByCategory.get(oldSkill.category) || [];
      const oldIndex = oldCategorySkills.findIndex(s => s.id === oldSkill.id);
      if (oldIndex !== -1) {
        oldCategorySkills.splice(oldIndex, 1);
      }
      
      // Add to new category
      if (!this.skillsByCategory.has(newSkill.category)) {
        this.skillsByCategory.set(newSkill.category, []);
      }
      this.skillsByCategory.get(newSkill.category)!.push(newSkill);
    }
    
    // Update keyword index if keywords changed
    if (JSON.stringify(oldSkill.keywords) !== JSON.stringify(newSkill.keywords)) {
      // Remove old keywords
      if (oldSkill.keywords) {
        for (const keyword of oldSkill.keywords) {
          const normalizedKeyword = keyword.toLowerCase();
          const keywordSkills = this.skillsByKeyword.get(normalizedKeyword);
          if (keywordSkills) {
            const index = keywordSkills.findIndex(s => s.id === oldSkill.id);
            if (index !== -1) {
              keywordSkills.splice(index, 1);
            }
          }
        }
      }
      
      // Add new keywords
      if (newSkill.keywords) {
        for (const keyword of newSkill.keywords) {
          const normalizedKeyword = keyword.toLowerCase();
          if (!this.skillsByKeyword.has(normalizedKeyword)) {
            this.skillsByKeyword.set(normalizedKeyword, []);
          }
          this.skillsByKeyword.get(normalizedKeyword)!.push(newSkill);
        }
      }
    }
  }
}

/**
 * In-memory storage backend for tests and single-process runtimes.
 */
export class InMemorySkillStorage implements SkillStorage {
  private skills = new Map<SkillId, SkillDefinition>();

  constructor(initialSkills: SkillDefinition[] = []) {
    for (const skill of initialSkills) {
      this.skills.set(skill.id, skill);
    }
  }

  async save(skill: SkillDefinition): Promise<void> {
    this.skills.set(skill.id, skill);
  }

  async load(skillId: SkillId): Promise<SkillDefinition | null> {
    return this.skills.get(skillId) ?? null;
  }

  async loadAll(): Promise<SkillDefinition[]> {
    return Array.from(this.skills.values());
  }

  async delete(skillId: SkillId): Promise<boolean> {
    return this.skills.delete(skillId);
  }

  async exists(skillId: SkillId): Promise<boolean> {
    return this.skills.has(skillId);
  }

  async getAllIds(): Promise<SkillId[]> {
    return Array.from(this.skills.keys());
  }

  async search(query: SkillSearchQuery): Promise<SkillDefinition[]> {
    const ids = await new InMemoryMetadataIndex(await this.loadAll()).search(query);
    return ids
      .map(id => this.skills.get(id))
      .filter((skill): skill is SkillDefinition => Boolean(skill));
  }
}

/**
 * Version manager backed by a SkillStorage instance.
 */
export class InMemoryVersionManager implements VersionManager {
  constructor(private readonly storage: SkillStorage) {}

  async getVersions(skillId: SkillId): Promise<SemanticVersion[]> {
    const skill = await this.storage.load(skillId);
    return skill ? [skill.version] : [];
  }

  async getVersion(skillId: SkillId, version: SemanticVersion): Promise<SkillDefinition | null> {
    const skill = await this.storage.load(skillId);
    return skill?.version === version ? skill : null;
  }

  async versionExists(skillId: SkillId, version: SemanticVersion): Promise<boolean> {
    return (await this.getVersion(skillId, version)) !== null;
  }

  async getLatestVersion(skillId: SkillId): Promise<SemanticVersion | null> {
    const versions = await this.getVersions(skillId);
    return versions.sort(compareSemver).at(-1) ?? null;
  }

  async satisfiesConstraint(version: SemanticVersion, constraint: string): Promise<boolean> {
    return satisfiesVersionConstraint(version, constraint);
  }

  async findBestMatch(skillId: SkillId, constraint: string): Promise<SemanticVersion | null> {
    const versions = await this.getVersions(skillId);
    return versions
      .filter(version => satisfiesVersionConstraint(version, constraint))
      .sort(compareSemver)
      .at(-1) ?? null;
  }
}

/**
 * Metadata index backed by in-memory skill definitions.
 */
export class InMemoryMetadataIndex implements MetadataIndex {
  private skills = new Map<SkillId, SkillDefinition>();

  constructor(initialSkills: SkillDefinition[] = []) {
    for (const skill of initialSkills) {
      this.skills.set(skill.id, skill);
    }
  }

  async index(skill: SkillDefinition): Promise<void> {
    this.skills.set(skill.id, skill);
  }

  async remove(skillId: SkillId): Promise<void> {
    this.skills.delete(skillId);
  }

  async search(query: SkillSearchQuery): Promise<SkillId[]> {
    let results = Array.from(this.skills.values());

    if (query.category) {
      results = results.filter(skill => skill.category === query.category);
    }

    if (query.name) {
      const name = query.name.toLowerCase();
      results = results.filter(skill => skill.name.toLowerCase().includes(name));
    }

    if (query.keywords && query.keywords.length > 0) {
      const keywords = query.keywords.map(keyword => keyword.toLowerCase());
      results = results.filter(skill => {
        const haystack = [
          skill.name,
          skill.description,
          ...(skill.keywords ?? []),
        ].join(' ').toLowerCase();
        return keywords.some(keyword => haystack.includes(keyword));
      });
    }

    if (query.author) {
      const author = query.author.toLowerCase();
      results = results.filter(skill => skill.author?.toLowerCase().includes(author));
    }

    if (query.minVersion) {
      results = results.filter(skill => compareSemver(skill.version, query.minVersion!) >= 0);
    }

    if (query.maxVersion) {
      results = results.filter(skill => compareSemver(skill.version, query.maxVersion!) <= 0);
    }

    if (query.sortBy) {
      const direction = query.sortDirection === 'desc' ? -1 : 1;
      results = results.sort((a, b) => direction * compareSkillByField(a, b, query.sortBy!));
    }

    const offset = query.offset ?? 0;
    const limit = query.limit ?? results.length;
    return results.slice(offset, offset + limit).map(skill => skill.id);
  }

  async getByCategory(category: SkillCategory): Promise<SkillId[]> {
    return (await this.search({ category }));
  }

  async getByKeyword(keyword: string): Promise<SkillId[]> {
    return (await this.search({ keywords: [keyword] }));
  }

  async getByAuthor(author: string): Promise<SkillId[]> {
    return (await this.search({ author }));
  }

  async clear(): Promise<void> {
    this.skills.clear();
  }
}

/**
 * Dependency resolver backed by skill storage and version checks.
 */
export class StorageBackedDependencyResolver implements DependencyResolver {
  constructor(
    private readonly storage: SkillStorage,
    private readonly versionManager: VersionManager
  ) {}

  async resolve(skillIds: SkillId[]): Promise<DependencyResolution> {
    const resolvedSkillIds: SkillId[] = [];
    const resolvedVersions = new Map<SkillId, SemanticVersion>();
    const unresolvedDependencies: DependencyResolution['unresolvedDependencies'] = [];
    const cycles: SkillId[][] = [];
    const visited = new Set<SkillId>();
    const active = new Set<SkillId>();

    const visit = async (skillId: SkillId, path: SkillId[]): Promise<boolean> => {
      if (active.has(skillId)) {
        const start = path.indexOf(skillId);
        cycles.push([...path.slice(Math.max(start, 0)), skillId]);
        return false;
      }

      if (visited.has(skillId)) {
        return true;
      }

      const skill = await this.storage.load(skillId);
      if (!skill) {
        unresolvedDependencies.push({ skillId, versionConstraint: '*', reason: 'Skill not found' });
        return false;
      }

      visited.add(skillId);
      active.add(skillId);
      path.push(skillId);

      let ok = true;
      for (const dependency of skill.dependencies) {
        const dependencySkill = await this.storage.load(dependency.skillId);
        if (!dependencySkill) {
          unresolvedDependencies.push({
            skillId: dependency.skillId,
            versionConstraint: dependency.versionConstraint,
            reason: `Missing dependency for ${skillId}`,
          });
          ok = false;
          continue;
        }

        if (!(await this.versionManager.satisfiesConstraint(dependencySkill.version, dependency.versionConstraint))) {
          unresolvedDependencies.push({
            skillId: dependency.skillId,
            versionConstraint: dependency.versionConstraint,
            reason: `Version ${dependencySkill.version} does not satisfy ${dependency.versionConstraint}`,
          });
          ok = false;
          continue;
        }

        ok = (await visit(dependency.skillId, path)) && ok;
      }

      active.delete(skillId);
      path.pop();

      if (ok && !resolvedSkillIds.includes(skillId)) {
        resolvedSkillIds.push(skillId);
        resolvedVersions.set(skillId, skill.version);
      }

      return ok;
    };

    const rootResults = await Promise.all(skillIds.map(skillId => visit(skillId, [])));

    return {
      resolved: rootResults.every(Boolean) && unresolvedDependencies.length === 0 && cycles.length === 0,
      resolvedSkillIds,
      resolvedVersions,
      unresolvedDependencies,
      hasCycles: cycles.length > 0,
      cycles,
    };
  }

  async detectCycles(skillIds: SkillId[]): Promise<SkillId[][]> {
    return (await this.resolve(skillIds)).cycles;
  }

  async getTransitiveDependencies(skillId: SkillId): Promise<SkillId[]> {
    const resolution = await this.resolve([skillId]);
    return resolution.resolvedSkillIds.filter(id => id !== skillId);
  }

  async getDependents(skillId: SkillId): Promise<SkillId[]> {
    const skills = await this.storage.loadAll();
    return skills
      .filter(skill => skill.dependencies.some(dependency => dependency.skillId === skillId))
      .map(skill => skill.id);
  }

  async canSatisfy(dependency: SkillDependency): Promise<boolean> {
    const skill = await this.storage.load(dependency.skillId);
    return Boolean(skill && await this.versionManager.satisfiesConstraint(skill.version, dependency.versionConstraint));
  }

  async validateGraph(): Promise<{ valid: boolean; cycles: SkillId[][]; missing: SkillId[] }> {
    const ids = await this.storage.getAllIds();
    const resolution = await this.resolve(ids);
    return {
      valid: resolution.resolved,
      cycles: resolution.cycles,
      missing: resolution.unresolvedDependencies.map(dependency => dependency.skillId),
    };
  }
}

/**
 * Factory function to create a new SkillRepository instance
 */
export async function createSkillRepository(
  storage: SkillStorage,
  versionManager: VersionManager,
  metadataIndex: MetadataIndex,
  dependencyResolver: DependencyResolver
): Promise<SkillRepository> {
  const repository = new SkillRepository(storage, versionManager, metadataIndex, dependencyResolver);
  await repository.initialize();
  return repository;
}

/**
 * Convenience factory for an in-memory repository with fully wired support
 * services.
 */
export async function createInMemorySkillRepository(initialSkills: SkillDefinition[] = []): Promise<SkillRepository> {
  const storage = new InMemorySkillStorage(initialSkills);
  const versionManager = new InMemoryVersionManager(storage);
  const metadataIndex = new InMemoryMetadataIndex(initialSkills);
  const dependencyResolver = new StorageBackedDependencyResolver(storage, versionManager);
  return createSkillRepository(storage, versionManager, metadataIndex, dependencyResolver);
}

function parseSemver(version: SemanticVersion): [number, number, number] {
  const [major = '0', minor = '0', patch = '0'] = version.split(/[+-]/)[0].split('.');
  return [Number(major), Number(minor), Number(patch)];
}

function compareSemver(a: SemanticVersion, b: SemanticVersion): number {
  const left = parseSemver(a);
  const right = parseSemver(b);
  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) {
      return left[i] - right[i];
    }
  }
  return 0;
}

function satisfiesVersionConstraint(version: SemanticVersion, constraint: string): boolean {
  const trimmed = constraint.trim();
  if (trimmed === '' || trimmed === '*') {
    return true;
  }

  if (trimmed.startsWith('^')) {
    const base = trimmed.slice(1);
    const [major] = parseSemver(base);
    return compareSemver(version, base) >= 0 && parseSemver(version)[0] === major;
  }

  const clauses = trimmed.split(/\s+/);
  return clauses.every(clause => {
    if (clause.startsWith('>=')) return compareSemver(version, clause.slice(2)) >= 0;
    if (clause.startsWith('>')) return compareSemver(version, clause.slice(1)) > 0;
    if (clause.startsWith('<=')) return compareSemver(version, clause.slice(2)) <= 0;
    if (clause.startsWith('<')) return compareSemver(version, clause.slice(1)) < 0;
    if (clause.startsWith('=')) return compareSemver(version, clause.slice(1)) === 0;
    return compareSemver(version, clause) === 0;
  });
}

function compareSkillByField(
  a: SkillDefinition,
  b: SkillDefinition,
  field: NonNullable<SkillSearchQuery['sortBy']>
): number {
  switch (field) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'version':
      return compareSemver(a.version, b.version);
    case 'createdAt':
      return (a.createdAt?.getTime() ?? 0) - (b.createdAt?.getTime() ?? 0);
    case 'updatedAt':
      return (a.updatedAt?.getTime() ?? 0) - (b.updatedAt?.getTime() ?? 0);
    case 'qualityScore':
      return calculateQualityScore(a) - calculateQualityScore(b);
  }
}
