/**
 * Context Manager Implementation
 * 
 * Implements context-aware memory management with relevance scoring and pruning.
 * Manages context windows for agentic operations, ensuring relevant information
 * is retained while pruning less relevant content to stay within constraints.
 * 
 * Validates: Requirements 1.2, 5.4
 * - Requirement 1.2: WHEN parsing prompts, THE Intent_Parser SHALL identify domain concepts and map them to technical implementations
 * - Requirement 5.4: FOR ALL executions, THE Observation_Layer SHALL maintain historical metrics for trend analysis and improvement
 */

/**
 * Context item representing a piece of information in memory
 */
export interface ContextItem {
  /** Unique identifier for the context item */
  id: string;
  
  /** Content of the context item */
  content: string;
  
  /** Type of context (e.g., "prompt", "skill", "artifact", "observation") */
  type: string;
  
  /** Metadata associated with the context item */
  metadata: {
    /** Source of the context item */
    source: string;
    
    /** Timestamp when item was added */
    timestamp: Date;
    
    /** Relevance score (0-1) */
    relevance: number;
    
    /** Importance score (0-1) */
    importance: number;
    
    /** Frequency of access */
    accessCount: number;
    
    /** Last access timestamp */
    lastAccessed: Date;
    
    /** Size in tokens/characters */
    size: number;
    
    /** Tags for categorization */
    tags: string[];
    
    /** Relationships to other context items */
    relationships: ContextRelationship[];
    
    /** Additional metadata */
    [key: string]: any;
  };
}

/**
 * Relationship between context items
 */
export interface ContextRelationship {
  /** Target context item ID */
  targetId: string;
  
  /** Type of relationship (e.g., "depends_on", "references", "similar_to") */
  type: string;
  
  /** Strength of relationship (0-1) */
  strength: number;
}

/**
 * Context window configuration
 */
export interface ContextWindowConfig {
  /** Maximum total size (in tokens/characters) */
  maxSize: number;
  
  /** Maximum number of items */
  maxItems: number;
  
  /** Minimum relevance threshold for retention (0-1) */
  minRelevanceThreshold: number;
  
  /** Pruning strategy */
  pruningStrategy: 'lru' | 'relevance' | 'hybrid' | 'size';
  
  /** Whether to enable automatic pruning */
  autoPrune: boolean;
  
  /** Pruning interval in milliseconds */
  pruningInterval?: number;
  
  /** Whether to preserve important items */
  preserveImportant: boolean;
  
  /** Importance threshold for preservation (0-1) */
  importanceThreshold: number;
}

/**
 * Context query for retrieving relevant items
 */
export interface ContextQuery {
  /** Query text or keywords */
  query: string;
  
  /** Maximum number of results */
  limit?: number;
  
  /** Minimum relevance score (0-1) */
  minRelevance?: number;
  
  /** Filter by context type */
  type?: string;
  
  /** Filter by tags */
  tags?: string[];
  
  /** Whether to include related items */
  includeRelated?: boolean;
  
  /** Maximum relationship depth */
  maxDepth?: number;
  
  /** Boost factors for different properties */
  boostFactors?: {
    /** Boost for recency */
    recency?: number;
    
    /** Boost for importance */
    importance?: number;
    
    /** Boost for access frequency */
    frequency?: number;
  };
}

/**
 * Context statistics
 */
export interface ContextStats {
  /** Total number of context items */
  totalItems: number;
  
  /** Current context window size (tokens/characters) */
  currentSize: number;
  
  /** Maximum allowed size */
  maxSize: number;
  
  /** Memory usage in bytes */
  memoryUsage: number;
  
  /** Average relevance score */
  avgRelevance: number;
  
  /** Average importance score */
  avgImportance: number;
  
  /** Pruning statistics */
  pruning: {
    /** Total number of pruned items */
    totalPruned: number;
    
    /** Last pruning timestamp */
    lastPruned: Date | null;
    
    /** Items pruned by strategy */
    byStrategy: Record<string, number>;
  };
  
  /** Access statistics */
  access: {
    /** Total access count */
    totalAccesses: number;
    
    /** Average accesses per item */
    avgAccesses: number;
    
    /** Most accessed item ID */
    mostAccessed: string | null;
  };
}

/**
 * Context manager interface
 */
export interface ContextManager {
  /**
   * Add a context item to memory
   */
  addContextItem(content: string, type: string, metadata?: Partial<ContextItem['metadata']>): Promise<string>;
  
  /**
   * Get context items relevant to query
   */
  getRelevantContext(query: ContextQuery): Promise<ContextItem[]>;
  
  /**
   * Update relevance score for a context item
   */
  updateRelevance(itemId: string, relevance: number): Promise<boolean>;
  
  /**
   * Update importance score for a context item
   */
  updateImportance(itemId: string, importance: number): Promise<boolean>;
  
  /**
   * Record access to a context item
   */
  recordAccess(itemId: string): Promise<void>;
  
  /**
   * Prune context window based on strategy
   */
  prune(): Promise<PruneResult>;
  
  /**
   * Get context statistics
   */
  getStats(): Promise<ContextStats>;
  
  /**
   * Get a specific context item by ID
   */
  getContextItem(itemId: string): Promise<ContextItem | null>;
  
  /**
   * Remove a specific context item
   */
  removeContextItem(itemId: string): Promise<boolean>;
  
  /**
   * Clear all context items
   */
  clear(): Promise<void>;
  
  /**
   * Update context window configuration
   */
  updateConfig(config: Partial<ContextWindowConfig>): Promise<void>;
}

/**
 * Pruning result
 */
export interface PruneResult {
  /** Number of items pruned */
  prunedCount: number;
  
  /** Total size freed (tokens/characters) */
  freedSize: number;
  
  /** IDs of pruned items */
  prunedItems: string[];
  
  /** Reason for pruning */
  reason: 'size_limit' | 'item_limit' | 'relevance' | 'manual' | 'config_change';
  
  /** Pruning strategy used */
  strategy: ContextWindowConfig['pruningStrategy'];
}

/**
 * In-memory implementation of context manager
 */
export class InMemoryContextManager implements ContextManager {
  private contextItems: Map<string, ContextItem> = new Map();
  private config: ContextWindowConfig;
  private pruningStats: PruneResult[] = [];
  private autoPruneInterval: NodeJS.Timeout | null = null;
  private idSequence = 0;
  
  constructor(config?: Partial<ContextWindowConfig>) {
    this.config = {
      maxSize: 10000, // Default: 10,000 tokens/characters
      maxItems: 100, // Default: 100 items
      minRelevanceThreshold: 0.3, // Default: 30% relevance threshold
      pruningStrategy: 'hybrid', // Default: hybrid pruning
      autoPrune: true, // Default: auto-prune enabled
      pruningInterval: 60000, // Default: prune every minute
      preserveImportant: true, // Default: preserve important items
      importanceThreshold: 0.7, // Default: 70% importance threshold
      ...config,
    };
    
    if (this.config.autoPrune && this.config.pruningInterval) {
      this.startAutoPruning();
    }
  }
  
  /**
   * Add a context item to memory
   */
  async addContextItem(
    content: string,
    type: string,
    metadata?: Partial<ContextItem['metadata']>
  ): Promise<string> {
    const itemId = this.generateItemId(type);
    const now = new Date();
    
    const contextItem: ContextItem = {
      id: itemId,
      content,
      type,
      metadata: {
        source: metadata?.source || 'unknown',
        timestamp: metadata?.timestamp || now,
        relevance: metadata?.relevance || 0.5, // Default relevance
        importance: metadata?.importance || 0.5, // Default importance
        accessCount: metadata?.accessCount || 0,
        lastAccessed: metadata?.lastAccessed || now,
        size: metadata?.size || content.length,
        tags: metadata?.tags || [],
        relationships: metadata?.relationships || [],
        ...metadata,
      },
    };
    
    this.contextItems.set(itemId, contextItem);
    
    // Check if we need to prune
    if (this.config.autoPrune) {
      await this.checkAndPrune();
    }
    
    return itemId;
  }
  
  /**
   * Get context items relevant to query
   */
  async getRelevantContext(query: ContextQuery): Promise<ContextItem[]> {
    const results: Array<{ item: ContextItem; score: number }> = [];
    const now = new Date();
    
    for (const item of this.contextItems.values()) {
      // Apply filters
      if (query.type && item.type !== query.type) {
        continue;
      }
      
      if (query.tags && query.tags.length > 0) {
        const hasMatchingTag = query.tags.some(tag => item.metadata.tags.includes(tag));
        if (!hasMatchingTag) {
          continue;
        }
      }
      
      // Calculate relevance score
      let score = this.calculateRelevanceScore(item, query, now);
      
      if (score >= (query.minRelevance || 0)) {
        results.push({ item, score });
        
        // Record access
        await this.recordAccess(item.id);
      }
    }
    
    // Sort by score (descending)
    results.sort((a, b) => b.score - a.score);
    
    // Apply limit
    const limit = query.limit || this.config.maxItems;
    const topResults = results.slice(0, limit);
    
    // Include related items if requested
    if (query.includeRelated) {
      const relatedItems = await this.getRelatedItems(
        topResults.map(r => r.item),
        query.maxDepth || 1
      );
      
      // Merge and deduplicate
      const allItems = new Map<string, ContextItem>();
      for (const { item } of topResults) {
        allItems.set(item.id, item);
      }
      for (const item of relatedItems) {
        allItems.set(item.id, item);
      }
      
      return Array.from(allItems.values());
    }
    
    return topResults.map(r => r.item);
  }
  
  /**
   * Update relevance score for a context item
   */
  async updateRelevance(itemId: string, relevance: number): Promise<boolean> {
    const item = this.contextItems.get(itemId);
    
    if (!item) {
      return false;
    }
    
    // Clamp relevance to 0-1 range
    const clampedRelevance = Math.max(0, Math.min(1, relevance));
    
    item.metadata.relevance = clampedRelevance;
    this.contextItems.set(itemId, item);
    
    return true;
  }
  
  /**
   * Update importance score for a context item
   */
  async updateImportance(itemId: string, importance: number): Promise<boolean> {
    const item = this.contextItems.get(itemId);
    
    if (!item) {
      return false;
    }
    
    // Clamp importance to 0-1 range
    const clampedImportance = Math.max(0, Math.min(1, importance));
    
    item.metadata.importance = clampedImportance;
    this.contextItems.set(itemId, item);
    
    return true;
  }
  
  /**
   * Record access to a context item
   */
  async recordAccess(itemId: string): Promise<void> {
    const item = this.contextItems.get(itemId);
    
    if (!item) {
      return;
    }
    
    const now = new Date();
    item.metadata.accessCount++;
    item.metadata.lastAccessed = now;
    
    this.contextItems.set(itemId, item);
  }
  
  /**
   * Prune context window based on strategy
   */
  async prune(): Promise<PruneResult> {
    const currentSize = this.getCurrentSize();
    const currentCount = this.contextItems.size;
    
    // Check if pruning is needed
    const sizeExceeded = currentSize > this.config.maxSize;
    const countExceeded = currentCount > this.config.maxItems;
    
    if (!sizeExceeded && !countExceeded) {
      return {
        prunedCount: 0,
        freedSize: 0,
        prunedItems: [],
        reason: 'manual',
        strategy: this.config.pruningStrategy,
      };
    }
    
    // Determine pruning reason
    const reason = sizeExceeded ? 'size_limit' : countExceeded ? 'item_limit' : 'manual';
    
    // Perform pruning based on strategy
    let prunedItems: string[] = [];
    let freedSize = 0;
    
    switch (this.config.pruningStrategy) {
      case 'lru':
        prunedItems = await this.pruneByLRU();
        break;
      case 'relevance':
        prunedItems = await this.pruneByRelevance();
        break;
      case 'size':
        prunedItems = await this.pruneBySize();
        break;
      case 'hybrid':
      default:
        prunedItems = await this.pruneByHybrid();
        break;
    }
    
    // Calculate freed size
    for (const itemId of prunedItems) {
      const item = this.contextItems.get(itemId);
      if (item) {
        freedSize += item.metadata.size;
      }
    }
    
    // Remove pruned items
    for (const itemId of prunedItems) {
      this.contextItems.delete(itemId);
    }
    
    const result: PruneResult = {
      prunedCount: prunedItems.length,
      freedSize,
      prunedItems,
      reason,
      strategy: this.config.pruningStrategy,
    };
    
    // Record pruning statistics
    this.pruningStats.push(result);
    
    return result;
  }
  
  /**
   * Get context statistics
   */
  async getStats(): Promise<ContextStats> {
    const totalItems = this.contextItems.size;
    const currentSize = this.getCurrentSize();
    
    // Calculate averages
    let totalRelevance = 0;
    let totalImportance = 0;
    let totalAccesses = 0;
    let mostAccessedId: string | null = null;
    let maxAccesses = 0;
    
    for (const item of this.contextItems.values()) {
      totalRelevance += item.metadata.relevance;
      totalImportance += item.metadata.importance;
      totalAccesses += item.metadata.accessCount;
      
      if (item.metadata.accessCount > maxAccesses) {
        maxAccesses = item.metadata.accessCount;
        mostAccessedId = item.id;
      }
    }
    
    const avgRelevance = totalItems > 0 ? totalRelevance / totalItems : 0;
    const avgImportance = totalItems > 0 ? totalImportance / totalItems : 0;
    const avgAccesses = totalItems > 0 ? totalAccesses / totalItems : 0;
    
    // Calculate pruning statistics
    const byStrategy: Record<string, number> = {};
    for (const stat of this.pruningStats) {
      byStrategy[stat.strategy] = (byStrategy[stat.strategy] || 0) + stat.prunedCount;
    }
    
    return {
      totalItems,
      currentSize,
      maxSize: this.config.maxSize,
      memoryUsage: this.estimateMemoryUsage(),
      avgRelevance,
      avgImportance,
      pruning: {
        totalPruned: this.pruningStats.reduce((sum, stat) => sum + stat.prunedCount, 0),
        lastPruned: this.pruningStats.length > 0 ? new Date() : null,
        byStrategy,
      },
      access: {
        totalAccesses,
        avgAccesses,
        mostAccessed: mostAccessedId,
      },
    };
  }
  
  /**
   * Get a specific context item by ID
   */
  async getContextItem(itemId: string): Promise<ContextItem | null> {
    const item = this.contextItems.get(itemId);
    
    if (item) {
      await this.recordAccess(itemId);
      return item;
    }
    
    return null;
  }
  
  /**
   * Remove a specific context item
   */
  async removeContextItem(itemId: string): Promise<boolean> {
    const existed = this.contextItems.delete(itemId);
    return existed;
  }
  
  /**
   * Clear all context items
   */
  async clear(): Promise<void> {
    this.contextItems.clear();
    this.pruningStats = [];
  }
  
  /**
   * Update context window configuration
   */
  async updateConfig(config: Partial<ContextWindowConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    
    // Restart auto-pruning if interval changed
    if (this.autoPruneInterval) {
      clearInterval(this.autoPruneInterval);
      this.autoPruneInterval = null;
    }
    
    if (this.config.autoPrune && this.config.pruningInterval) {
      this.startAutoPruning();
    }
  }
  
  /**
   * Generate unique item ID
   */
  private generateItemId(type: string): string {
    const timestamp = Date.now();
    return `context_${type}_${timestamp}_${++this.idSequence}`;
  }
  
  /**
   * Calculate relevance score for an item relative to query
   */
  private calculateRelevanceScore(
    item: ContextItem,
    query: ContextQuery,
    now: Date
  ): number {
    let score = item.metadata.relevance;
    
    // Apply text similarity (simplified)
    const queryLower = query.query.toLowerCase();
    const contentLower = item.content.toLowerCase();
    
    if (queryLower && contentLower) {
      const words = queryLower.split(/\s+/);
      let matchCount = 0;
      
      for (const word of words) {
        if (contentLower.includes(word)) {
          matchCount++;
        }
      }
      
      const wordSimilarity = words.length > 0 ? matchCount / words.length : 0;
      score = (score + wordSimilarity) / 2;
    }
    
    // Apply boost factors
    if (query.boostFactors) {
      // Recency boost
      if (query.boostFactors.recency) {
        const ageInHours = (now.getTime() - item.metadata.timestamp.getTime()) / (1000 * 60 * 60);
        const recencyBoost = Math.max(0, 1 - (ageInHours / 24)); // Linear decay over a day
        score += recencyBoost * query.boostFactors.recency;
      }
      
      // Importance boost
      if (query.boostFactors.importance) {
        score += item.metadata.importance * query.boostFactors.importance;
      }
      
      // Frequency boost
      if (query.boostFactors.frequency) {
        const frequencyBoost = Math.min(1, item.metadata.accessCount / 10); // Cap at 10 accesses
        score += frequencyBoost * query.boostFactors.frequency;
      }
    }
    
    // Clamp to 0-1 range
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Get related context items
   */
  private async getRelatedItems(
    items: ContextItem[],
    maxDepth: number
  ): Promise<ContextItem[]> {
    const relatedItems = new Map<string, ContextItem>();
    
    const exploreRelationships = (currentItem: ContextItem, depth: number) => {
      if (depth > maxDepth) {
        return;
      }
      
      for (const relationship of currentItem.metadata.relationships) {
        const relatedItem = this.contextItems.get(relationship.targetId);
        
        if (relatedItem && !relatedItems.has(relatedItem.id)) {
          relatedItems.set(relatedItem.id, relatedItem);
          exploreRelationships(relatedItem, depth + 1);
        }
      }
    };
    
    for (const item of items) {
      exploreRelationships(item, 0);
    }
    
    return Array.from(relatedItems.values());
  }
  
  /**
   * Check if pruning is needed and prune if necessary
   */
  private async checkAndPrune(): Promise<void> {
    const currentSize = this.getCurrentSize();
    const currentCount = this.contextItems.size;
    
    const sizeExceeded = currentSize > this.config.maxSize;
    const countExceeded = currentCount > this.config.maxItems;
    
    if (sizeExceeded || countExceeded) {
      await this.prune();
    }
  }
  
  /**
   * Get current total size of all context items
   */
  private getCurrentSize(): number {
    let totalSize = 0;
    
    for (const item of this.contextItems.values()) {
      totalSize += item.metadata.size;
    }
    
    return totalSize;
  }
  
  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    let totalBytes = 0;
    
    for (const item of this.contextItems.values()) {
      // Estimate bytes for context item
      totalBytes += item.content.length * 2; // 2 bytes per character (UTF-16)
      totalBytes += JSON.stringify(item.metadata).length * 2;
      totalBytes += item.id.length * 2;
      totalBytes += item.type.length * 2;
    }
    
    // Add overhead for Map structures
    totalBytes += this.contextItems.size * 100;
    
    return totalBytes;
  }
  
  /**
   * Start auto-pruning interval
   */
  private startAutoPruning(): void {
    if (this.config.pruningInterval) {
      this.autoPruneInterval = setInterval(async () => {
        await this.checkAndPrune();
      }, this.config.pruningInterval);
    }
  }
  
  /**
   * Prune by Least Recently Used (LRU)
   */
  private async pruneByLRU(): Promise<string[]> {
    const items = Array.from(this.contextItems.values());
    
    // Sort by last accessed (oldest first)
    items.sort((a, b) => a.metadata.lastAccessed.getTime() - b.metadata.lastAccessed.getTime());
    
    return this.selectItemsForPruning(items);
  }
  
  /**
   * Prune by relevance score
   */
  private async pruneByRelevance(): Promise<string[]> {
    const items = Array.from(this.contextItems.values());
    
    // Sort by relevance (lowest first)
    items.sort((a, b) => a.metadata.relevance - b.metadata.relevance);
    
    return this.selectItemsForPruning(items);
  }
  
  /**
   * Prune by size (largest first)
   */
  private async pruneBySize(): Promise<string[]> {
    const items = Array.from(this.contextItems.values());
    
    // Sort by size (largest first)
    items.sort((a, b) => b.metadata.size - a.metadata.size);
    
    return this.selectItemsForPruning(items);
  }
  
  /**
   * Prune using hybrid strategy
   */
  private async pruneByHybrid(): Promise<string[]> {
    const items = Array.from(this.contextItems.values());
    
    // Calculate composite score: lower is better for pruning
    items.forEach(item => {
      const now = new Date();
      const ageInHours = (now.getTime() - item.metadata.timestamp.getTime()) / (1000 * 60 * 60);
      const hoursSinceAccess = (now.getTime() - item.metadata.lastAccessed.getTime()) / (1000 * 60 * 60);
      
      // Composite score favors pruning old, infrequently accessed, low relevance items
      const compositeScore = 
        (1 - item.metadata.relevance) * 0.4 + // 40% weight to low relevance
        (ageInHours / 24) * 0.3 + // 30% weight to age (normalized to days)
        (hoursSinceAccess / 24) * 0.2 + // 20% weight to time since access
        (1 - item.metadata.importance) * 0.1; // 10% weight to low importance
      
      (item as any)._pruneScore = compositeScore;
    });
    
    // Sort by composite score (highest = most prune-worthy)
    items.sort((a, b) => (b as any)._pruneScore - (a as any)._pruneScore);
    
    return this.selectItemsForPruning(items);
  }
  
  /**
   * Select items for pruning from sorted list
   */
  private selectItemsForPruning(sortedItems: ContextItem[]): string[] {
    const itemsToPrune: string[] = [];
    let currentSize = this.getCurrentSize();
    let currentCount = this.contextItems.size;
    
    for (const item of sortedItems) {
      // Check if we've reached limits
      const sizeExceeded = currentSize > this.config.maxSize;
      const countExceeded = currentCount > this.config.maxItems;
      
      if (!sizeExceeded && !countExceeded) {
        break;
      }
      
      // Check if item should be preserved
      const shouldPreserve = this.config.preserveImportant && 
                            item.metadata.importance >= this.config.importanceThreshold;
      
      if (shouldPreserve) {
        continue; // Skip important items
      }
      
      // Check if item should be pruned based on strategy
      let shouldPrune = true;
      
      // For relevance pruning, check relevance threshold
      if (this.config.pruningStrategy === 'relevance') {
        shouldPrune = item.metadata.relevance < this.config.minRelevanceThreshold;
      }
      // For hybrid pruning, always prune (items are already sorted by composite score)
      // For other strategies (LRU, size), prune regardless of relevance
      
      if (shouldPrune) {
        itemsToPrune.push(item.id);
        currentSize -= item.metadata.size;
        currentCount--;
      }
    }
    
    return itemsToPrune;
  }
}

/**
 * Factory function to create context manager
 */
export function createContextManager(config?: Partial<ContextWindowConfig>): ContextManager {
  return new InMemoryContextManager(config);
}

/**
 * Utility function to calculate context window utilization
 */
export function calculateWindowUtilization(
  currentSize: number,
  maxSize: number,
  currentItems: number,
  maxItems: number
): {
  sizeUtilization: number;
  itemUtilization: number;
  overallUtilization: number;
} {
  const sizeUtilization = maxSize > 0 ? currentSize / maxSize : 0;
  const itemUtilization = maxItems > 0 ? currentItems / maxItems : 0;
  const overallUtilization = Math.max(sizeUtilization, itemUtilization);
  
  return {
    sizeUtilization,
    itemUtilization,
    overallUtilization,
  };
}

/**
 * Utility function to create context relationships
 */
export function createContextRelationship(
  targetId: string,
  type: string,
  strength: number = 0.5
): ContextRelationship {
  return {
    targetId,
    type,
    strength: Math.max(0, Math.min(1, strength)),
  };
}

/**
 * Utility function to merge context items
 */
export function mergeContextItems(
  items: ContextItem[],
  mergeStrategy: 'union' | 'intersection' | 'weighted' = 'union'
): ContextItem[] {
  if (mergeStrategy === 'union') {
    // Simple union - return all unique items
    const uniqueItems = new Map<string, ContextItem>();
    for (const item of items) {
      uniqueItems.set(item.id, item);
    }
    return Array.from(uniqueItems.values());
  }
  
  // For now, just return union
  const uniqueItems = new Map<string, ContextItem>();
  for (const item of items) {
    uniqueItems.set(item.id, item);
  }
  return Array.from(uniqueItems.values());
}
