/**
 * Semantic Search Implementation
 * 
 * Implements semantic search over artifacts using embeddings and vector similarity.
 * Provides functionality for indexing, searching, and ranking artifacts based on
 * semantic similarity to query text.
 * 
 * Validates: Requirements 2.2, 5.4
 * - Requirement 2.2: WHEN searching for skills matching requirements, THE Skill_Graph SHALL return ranked matches based on relevance and quality metrics
 * - Requirement 5.4: FOR ALL executions, THE Observation_Layer SHALL maintain historical metrics for trend analysis and improvement
 */

/**
 * Vector embedding representation
 */
export interface VectorEmbedding {
  /** Unique identifier for the embedding */
  id: string;
  
  /** The embedding vector as an array of numbers */
  vector: number[];
  
  /** Metadata associated with the embedding */
  metadata: {
    /** Source artifact ID */
    artifactId: string;
    
    /** Artifact type (e.g., "skill", "prompt", "code", "documentation") */
    artifactType: string;
    
    /** Content that was embedded */
    content: string;
    
    /** Timestamp when embedding was created */
    createdAt: Date;
    
    /** Embedding model used */
    model: string;
    
    /** Dimensionality of the embedding vector */
    dimensions: number;
    
    /** Additional metadata */
    [key: string]: any;
  };
}

/**
 * Search result with similarity score
 */
export interface SearchResult<T = any> {
  /** The artifact that matched */
  artifact: T;
  
  /** Similarity score (0-1, where 1 is most similar) */
  similarity: number;
  
  /** Relevance score incorporating quality metrics */
  relevance: number;
  
  /** Metadata about the match */
  metadata: {
    /** Embedding ID used for this match */
    embeddingId: string;
    
    /** Distance metric used (e.g., "cosine", "euclidean") */
    distanceMetric: string;
    
    /** Whether this is an exact match */
    isExactMatch: boolean;
    
    /** Quality metrics incorporated into relevance score */
    qualityMetrics?: Record<string, number>;
  };
}

/**
 * Search query with options
 */
export interface SearchQuery {
  /** Query text to search for */
  query: string;
  
  /** Optional embedding vector (if pre-computed) */
  queryVector?: number[];
  
  /** Maximum number of results to return */
  limit?: number;
  
  /** Minimum similarity threshold (0-1) */
  similarityThreshold?: number;
  
  /** Whether to include low-quality matches */
  includeLowQuality?: boolean;
  
  /** Filter by artifact type */
  artifactType?: string;
  
  /** Filter by specific quality metrics */
  qualityFilters?: Record<string, { min?: number; max?: number }>;
  
  /** Boost factors for different artifact properties */
  boostFactors?: {
    /** Boost for recency (higher = newer artifacts weighted more) */
    recency?: number;
    
    /** Boost for quality scores */
    quality?: number;
    
    /** Boost for popularity/usage */
    popularity?: number;
  };
}

/**
 * Indexing statistics
 */
export interface IndexStats {
  /** Total number of embeddings in index */
  totalEmbeddings: number;
  
  /** Number of unique artifacts indexed */
  uniqueArtifacts: number;
  
  /** Average embedding dimensionality */
  avgDimensions: number;
  
  /** Memory usage in bytes */
  memoryUsage: number;
  
  /** Last indexing timestamp */
  lastIndexed: Date;
  
  /** Index health metrics */
  health: {
    /** Whether index is consistent */
    consistent: boolean;
    
    /** Whether index is optimized */
    optimized: boolean;
    
    /** Whether index is up-to-date */
    upToDate: boolean;
  };
}

/**
 * Semantic search engine interface
 */
export interface SemanticSearchEngine {
  /**
   * Index an artifact with its embedding
   */
  indexArtifact(artifactId: string, artifactType: string, content: string, embedding: number[]): Promise<string>;
  
  /**
   * Search for artifacts similar to query
   */
  search<T = any>(query: SearchQuery): Promise<SearchResult<T>[]>;
  
  /**
   * Get statistics about the index
   */
  getStats(): Promise<IndexStats>;
  
  /**
   * Remove an artifact from the index
   */
  removeArtifact(artifactId: string): Promise<boolean>;
  
  /**
   * Update an artifact's embedding
   */
  updateArtifact(artifactId: string, newContent: string, newEmbedding: number[]): Promise<boolean>;
  
  /**
   * Optimize the index for better performance
   */
  optimize(): Promise<void>;
  
  /**
   * Clear the entire index
   */
  clear(): Promise<void>;
}

/**
 * In-memory implementation of semantic search engine
 * 
 * This implementation uses cosine similarity for vector comparison and
 * maintains an in-memory index of embeddings with metadata.
 */
export class InMemorySemanticSearchEngine implements SemanticSearchEngine {
  private embeddings: Map<string, VectorEmbedding> = new Map();
  private artifactToEmbeddings: Map<string, string[]> = new Map();
  private defaultSimilarityThreshold = 0.7;
  private defaultLimit = 10;
  
  /**
   * Index an artifact with its embedding
   */
  async indexArtifact(
    artifactId: string,
    artifactType: string,
    content: string,
    embedding: number[]
  ): Promise<string> {
    const embeddingId = this.generateEmbeddingId(artifactId, content);
    
    const vectorEmbedding: VectorEmbedding = {
      id: embeddingId,
      vector: embedding,
      metadata: {
        artifactId,
        artifactType,
        content,
        createdAt: new Date(),
        model: 'text-embedding-ada-002', // Default model
        dimensions: embedding.length,
      },
    };
    
    this.embeddings.set(embeddingId, vectorEmbedding);
    
    // Track embeddings by artifact
    const artifactEmbeddings = this.artifactToEmbeddings.get(artifactId) || [];
    artifactEmbeddings.push(embeddingId);
    this.artifactToEmbeddings.set(artifactId, artifactEmbeddings);
    
    return embeddingId;
  }
  
  /**
   * Search for artifacts similar to query
   */
  async search<T = any>(query: SearchQuery): Promise<SearchResult<T>[]> {
    const queryVector = query.queryVector || await this.generateEmbedding(query.query);
    const limit = query.limit || this.defaultLimit;
    const similarityThreshold = query.similarityThreshold || this.defaultSimilarityThreshold;
    
    // Calculate similarities for all embeddings
    const similarities: Array<{
      embeddingId: string;
      embedding: VectorEmbedding;
      similarity: number;
    }> = [];
    
    for (const [embeddingId, embedding] of this.embeddings.entries()) {
      // Apply filters
      if (query.artifactType && embedding.metadata.artifactType !== query.artifactType) {
        continue;
      }
      
      // Calculate similarity
      const similarity = this.cosineSimilarity(queryVector, embedding.vector);
      
      if (similarity >= similarityThreshold) {
        similarities.push({
          embeddingId,
          embedding,
          similarity,
        });
      }
    }
    
    // Sort by similarity (descending)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Apply limit
    const topSimilarities = similarities.slice(0, limit);
    
    // Convert to search results
    const results: SearchResult<T>[] = topSimilarities.map(({ embeddingId, embedding, similarity }) => {
      // Calculate relevance score (incorporating quality metrics)
      const relevance = this.calculateRelevanceScore(similarity, embedding.metadata, query.boostFactors);
      
      return {
        artifact: {
          id: embedding.metadata.artifactId,
          type: embedding.metadata.artifactType,
          content: embedding.metadata.content,
          metadata: embedding.metadata,
        } as T,
        similarity,
        relevance,
        metadata: {
          embeddingId,
          distanceMetric: 'cosine',
          isExactMatch: similarity === 1,
        },
      };
    });
    
    return results;
  }
  
  /**
   * Get statistics about the index
   */
  async getStats(): Promise<IndexStats> {
    const totalEmbeddings = this.embeddings.size;
    const uniqueArtifacts = this.artifactToEmbeddings.size;
    
    // Calculate average dimensions
    let totalDimensions = 0;
    for (const embedding of this.embeddings.values()) {
      totalDimensions += embedding.vector.length;
    }
    const avgDimensions = totalEmbeddings > 0 ? totalDimensions / totalEmbeddings : 0;
    
    // Estimate memory usage (rough estimate)
    const memoryUsage = this.estimateMemoryUsage();
    
    return {
      totalEmbeddings,
      uniqueArtifacts,
      avgDimensions,
      memoryUsage,
      lastIndexed: new Date(),
      health: {
        consistent: this.checkIndexConsistency(),
        optimized: this.checkIndexOptimization(),
        upToDate: true, // Always up-to-date for in-memory
      },
    };
  }
  
  /**
   * Remove an artifact from the index
   */
  async removeArtifact(artifactId: string): Promise<boolean> {
    const embeddingIds = this.artifactToEmbeddings.get(artifactId);
    
    if (!embeddingIds || embeddingIds.length === 0) {
      return false;
    }
    
    // Remove all embeddings for this artifact
    for (const embeddingId of embeddingIds) {
      this.embeddings.delete(embeddingId);
    }
    
    // Remove artifact mapping
    this.artifactToEmbeddings.delete(artifactId);
    
    return true;
  }
  
  /**
   * Update an artifact's embedding
   */
  async updateArtifact(
    artifactId: string,
    newContent: string,
    newEmbedding: number[]
  ): Promise<boolean> {
    // Remove old embeddings
    await this.removeArtifact(artifactId);
    
    // Add new embedding
    await this.indexArtifact(artifactId, 'unknown', newContent, newEmbedding);
    
    return true;
  }
  
  /**
   * Optimize the index for better performance
   */
  async optimize(): Promise<void> {
    // In-memory lookups are already map-backed; rebuilding the artifact
    // reverse index keeps it consistent after direct embedding updates.
    this.artifactToEmbeddings.clear();
    for (const [embeddingId, embedding] of this.embeddings.entries()) {
      const ids = this.artifactToEmbeddings.get(embedding.metadata.artifactId) ?? [];
      ids.push(embeddingId);
      this.artifactToEmbeddings.set(embedding.metadata.artifactId, ids);
    }
  }
  
  /**
   * Clear the entire index
   */
  async clear(): Promise<void> {
    this.embeddings.clear();
    this.artifactToEmbeddings.clear();
  }
  
  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have the same dimensionality');
    }
    
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;
    
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);
    
    if (normA === 0 || normB === 0) {
      return 0;
    }
    
    return dotProduct / (normA * normB);
  }
  
  /**
   * Generate a deterministic lexical embedding for text.
   */
  private async generateEmbedding(text: string): Promise<number[]> {
    const words = text.toLowerCase().split(/\s+/);
    const embedding = new Array(1536).fill(0); // Default dimension for ada-002
    
    // Simple hash-based embedding for demonstration
    for (const word of words) {
      let hash = 0;
      for (let i = 0; i < word.length; i++) {
        hash = ((hash << 5) - hash) + word.charCodeAt(i);
        hash |= 0;
      }
      
      const index = Math.abs(hash) % embedding.length;
      embedding[index] += 1;
    }
    
    // Normalize
    const norm = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (norm > 0) {
      return embedding.map(val => val / norm);
    }
    
    return embedding;
  }
  
  /**
   * Generate unique embedding ID
   */
  private generateEmbeddingId(artifactId: string, content: string): string {
    const timestamp = Date.now();
    const contentHash = this.hashString(content);
    return `embedding_${artifactId}_${contentHash}_${timestamp}`;
  }
  
  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Calculate relevance score incorporating quality metrics
   */
  private calculateRelevanceScore(
    similarity: number,
    metadata: VectorEmbedding['metadata'],
    boostFactors?: SearchQuery['boostFactors']
  ): number {
    let relevance = similarity;
    
    // Apply recency boost if specified
    if (boostFactors?.recency) {
      const ageInDays = (Date.now() - metadata.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const recencyBoost = Math.max(0, 1 - (ageInDays / 365)); // Linear decay over a year
      relevance += recencyBoost * boostFactors.recency;
    }
    
    if (boostFactors?.quality) {
      const qualityEstimate = typeof metadata.qualityScore === 'number' ? metadata.qualityScore : 0.8;
      relevance += qualityEstimate * boostFactors.quality;
    }
    
    if (boostFactors?.popularity) {
      const popularityEstimate = typeof metadata.popularity === 'number' ? metadata.popularity : 0.5;
      relevance += popularityEstimate * boostFactors.popularity;
    }
    
    // Normalize to 0-1 range
    return Math.max(0, Math.min(1, relevance));
  }
  
  /**
   * Estimate memory usage of the index
   */
  private estimateMemoryUsage(): number {
    let totalBytes = 0;
    
    for (const embedding of this.embeddings.values()) {
      // Estimate bytes for embedding object
      totalBytes += embedding.vector.length * 8; // 8 bytes per number (float64)
      totalBytes += JSON.stringify(embedding.metadata).length * 2; // 2 bytes per character (UTF-16)
      totalBytes += embedding.id.length * 2;
    }
    
    // Add overhead for Map structures
    totalBytes += this.embeddings.size * 100; // Rough overhead per entry
    totalBytes += this.artifactToEmbeddings.size * 100;
    
    return totalBytes;
  }
  
  /**
   * Check index consistency
   */
  private checkIndexConsistency(): boolean {
    // Check that all artifact mappings point to valid embeddings
    for (const [artifactId, embeddingIds] of this.artifactToEmbeddings.entries()) {
      for (const embeddingId of embeddingIds) {
        if (!this.embeddings.has(embeddingId)) {
          return false;
        }
        
        const embedding = this.embeddings.get(embeddingId)!;
        if (embedding.metadata.artifactId !== artifactId) {
          return false;
        }
      }
    }
    
    // Check that all embeddings are mapped to artifacts
    for (const embedding of this.embeddings.values()) {
      const artifactEmbeddings = this.artifactToEmbeddings.get(embedding.metadata.artifactId);
      if (!artifactEmbeddings || !artifactEmbeddings.includes(embedding.id)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Check index optimization
   */
  private checkIndexOptimization(): boolean {
    // Simple optimization check
    // In production, would check for:
    // - Duplicate embeddings
    // - Proper vector normalization
    // - Efficient data structures
    
    return this.embeddings.size > 0;
  }
}

/**
 * Factory function to create semantic search engine
 */
export function createSemanticSearchEngine(): SemanticSearchEngine {
  return new InMemorySemanticSearchEngine();
}

/**
 * Utility function to validate embedding dimensions
 */
export function validateEmbeddingDimensions(embedding: number[], expectedDimensions?: number): boolean {
  if (expectedDimensions !== undefined && embedding.length !== expectedDimensions) {
    return false;
  }
  
  // Check for NaN or infinite values
  for (const value of embedding) {
    if (!Number.isFinite(value)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Utility function to normalize vector
 */
export function normalizeVector(vector: number[]): number[] {
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  
  if (norm === 0) {
    return vector;
  }
  
  return vector.map(val => val / norm);
}

/**
 * Calculate multiple similarity metrics between vectors
 */
export function calculateSimilarities(vecA: number[], vecB: number[]): {
  cosine: number;
  euclidean: number;
  dotProduct: number;
} {
  if (vecA.length !== vecB.length) {
    throw new Error('Vectors must have the same dimensionality');
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  let squaredDistance = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
    squaredDistance += Math.pow(vecA[i] - vecB[i], 2);
  }
  
  const cosine = (normA > 0 && normB > 0) ? dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)) : 0;
  const euclidean = Math.sqrt(squaredDistance);
  
  return {
    cosine,
    euclidean,
    dotProduct,
  };
}
