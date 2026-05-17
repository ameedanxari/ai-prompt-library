/**
 * Integration tests for semantic search accuracy
 * 
 * Tests the semantic search implementation for accuracy, performance, and reliability.
 * 
 * Validates: Requirements 2.2, 5.4
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createSemanticSearchEngine,
  SearchQuery,
  validateEmbeddingDimensions,
  normalizeVector,
  calculateSimilarities,
} from './semantic-search';

describe('Semantic Search Engine', () => {
  let searchEngine: ReturnType<typeof createSemanticSearchEngine>;
  
  beforeEach(() => {
    searchEngine = createSemanticSearchEngine();
  });
  
  afterEach(async () => {
    await searchEngine.clear();
  });
  
  describe('Indexing', () => {
    it('should index artifacts with embeddings', async () => {
      const artifactId = 'test-skill-1';
      const artifactType = 'skill';
      const content = 'Create REST API endpoint';
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      
      const embeddingId = await searchEngine.indexArtifact(
        artifactId,
        artifactType,
        content,
        embedding
      );
      
      expect(embeddingId).toBeDefined();
      expect(embeddingId).toContain(artifactId);
      
      const stats = await searchEngine.getStats();
      expect(stats.totalEmbeddings).toBe(1);
      expect(stats.uniqueArtifacts).toBe(1);
    });
    
    it('should validate embedding dimensions', () => {
      const validEmbedding = [0.1, 0.2, 0.3];
      const invalidEmbedding = [0.1, NaN, 0.3];
      
      expect(validateEmbeddingDimensions(validEmbedding)).toBe(true);
      expect(validateEmbeddingDimensions(invalidEmbedding)).toBe(false);
      expect(validateEmbeddingDimensions(validEmbedding, 3)).toBe(true);
      expect(validateEmbeddingDimensions(validEmbedding, 4)).toBe(false);
    });
    
    it('should normalize vectors correctly', () => {
      const vector = [1, 2, 3];
      const normalized = normalizeVector(vector);
      
      // Check that normalized vector has unit length
      const norm = Math.sqrt(normalized.reduce((sum, val) => sum + val * val, 0));
      expect(norm).toBeCloseTo(1, 5);
      
      // Check that zero vector doesn't change
      const zeroVector = [0, 0, 0];
      const normalizedZero = normalizeVector(zeroVector);
      expect(normalizedZero).toEqual(zeroVector);
    });
  });
  
  describe('Searching', () => {
    beforeEach(async () => {
      // Index some test artifacts
      const artifacts = [
        {
          id: 'skill-1',
          type: 'skill',
          content: 'Create user authentication system',
          embedding: [0.8, 0.1, 0.1, 0.0, 0.0],
        },
        {
          id: 'skill-2',
          type: 'skill',
          content: 'Implement database schema for users',
          embedding: [0.1, 0.8, 0.1, 0.0, 0.0],
        },
        {
          id: 'skill-3',
          type: 'skill',
          content: 'Build REST API endpoints',
          embedding: [0.1, 0.1, 0.8, 0.0, 0.0],
        },
        {
          id: 'prompt-1',
          type: 'prompt',
          content: 'How to create a login page',
          embedding: [0.0, 0.0, 0.0, 0.8, 0.2],
        },
      ];
      
      for (const artifact of artifacts) {
        await searchEngine.indexArtifact(
          artifact.id,
          artifact.type,
          artifact.content,
          artifact.embedding
        );
      }
    });
    
    it('should find similar artifacts', async () => {
      const query: SearchQuery = {
        query: 'authentication system',
        queryVector: [0.9, 0.05, 0.05, 0.0, 0.0], // Similar to skill-1
        limit: 5,
      };
      
      const results = await searchEngine.search(query);
      
      expect(results.length).toBeGreaterThan(0);
      
      // Should find skill-1 as most similar
      const topResult = results[0];
      expect(topResult.artifact.id).toBe('skill-1');
      expect(topResult.similarity).toBeGreaterThan(0.7);
    });
    
    it('should respect similarity threshold', async () => {
      const query: SearchQuery = {
        query: 'completely different',
        queryVector: [0.0, 0.0, 0.0, 0.0, 1.0], // Very different from indexed artifacts
        similarityThreshold: 0.9, // High threshold
      };
      
      const results = await searchEngine.search(query);
      
      // Should find no matches with high threshold
      expect(results.length).toBe(0);
    });
    
    it('should filter by artifact type', async () => {
      const query: SearchQuery = {
        query: 'create',
        queryVector: [0.5, 0.3, 0.2, 0.0, 0.0],
        artifactType: 'prompt',
      };
      
      const results = await searchEngine.search(query);
      
      // Should only find prompts
      for (const result of results) {
        expect(result.artifact.type).toBe('prompt');
      }
    });
    
    it('should respect result limit', async () => {
      const query: SearchQuery = {
        query: 'skill',
        queryVector: [0.3, 0.3, 0.3, 0.1, 0.0],
        limit: 2,
      };
      
      const results = await searchEngine.search(query);
      
      expect(results.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('Similarity Calculations', () => {
    it('should calculate cosine similarity correctly', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const vecC = [0, 1, 0];
      
      const similaritiesAB = calculateSimilarities(vecA, vecB);
      const similaritiesAC = calculateSimilarities(vecA, vecC);
      
      // Identical vectors should have cosine similarity of 1
      expect(similaritiesAB.cosine).toBeCloseTo(1, 5);
      
      // Orthogonal vectors should have cosine similarity of 0
      expect(similaritiesAC.cosine).toBeCloseTo(0, 5);
      
      // Euclidean distance should be sqrt(2) for orthogonal unit vectors
      expect(similaritiesAC.euclidean).toBeCloseTo(Math.sqrt(2), 5);
    });
    
    it('should handle edge cases in similarity calculations', () => {
      const zeroVector = [0, 0, 0];
      const unitVector = [1, 0, 0];
      
      const similarities = calculateSimilarities(zeroVector, unitVector);
      
      // Cosine similarity with zero vector should be 0
      expect(similarities.cosine).toBe(0);
      
      // Euclidean distance should be 1
      expect(similarities.euclidean).toBeCloseTo(1, 5);
    });
  });
  
  describe('Index Management', () => {
    it('should remove artifacts from index', async () => {
      const artifactId = 'test-remove';
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      
      await searchEngine.indexArtifact(artifactId, 'skill', 'test content', embedding);
      
      let stats = await searchEngine.getStats();
      expect(stats.totalEmbeddings).toBe(1);
      
      const removed = await searchEngine.removeArtifact(artifactId);
      expect(removed).toBe(true);
      
      stats = await searchEngine.getStats();
      expect(stats.totalEmbeddings).toBe(0);
    });
    
    it('should update artifacts in index', async () => {
      const artifactId = 'test-update';
      const oldContent = 'old content';
      const newContent = 'new content';
      const oldEmbedding = [0.1, 0.2, 0.3];
      const newEmbedding = [0.4, 0.5, 0.6];
      
      await searchEngine.indexArtifact(artifactId, 'skill', oldContent, oldEmbedding);
      
      const updated = await searchEngine.updateArtifact(artifactId, newContent, newEmbedding);
      expect(updated).toBe(true);
      
      const query: SearchQuery = {
        query: 'new content',
        queryVector: newEmbedding,
      };
      
      const results = await searchEngine.search(query);
      expect(results.length).toBe(1);
      expect(results[0].artifact.content).toBe(newContent);
    });
    
    it('should provide accurate index statistics', async () => {
      // Index multiple artifacts
      const artifacts = [
        { id: 'a1', embedding: [0.1, 0.2, 0.3] },
        { id: 'a2', embedding: [0.4, 0.5, 0.6] },
        { id: 'a3', embedding: [0.7, 0.8, 0.9] },
      ];
      
      for (const artifact of artifacts) {
        await searchEngine.indexArtifact(artifact.id, 'skill', 'content', artifact.embedding);
      }
      
      const stats = await searchEngine.getStats();
      
      expect(stats.totalEmbeddings).toBe(3);
      expect(stats.uniqueArtifacts).toBe(3);
      expect(stats.avgDimensions).toBe(3);
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.health.consistent).toBe(true);
      expect(stats.health.optimized).toBe(true);
      expect(stats.health.upToDate).toBe(true);
    });
    
    it('should clear entire index', async () => {
      // Add some artifacts
      await searchEngine.indexArtifact('test1', 'skill', 'content1', [0.1, 0.2, 0.3]);
      await searchEngine.indexArtifact('test2', 'skill', 'content2', [0.4, 0.5, 0.6]);
      
      let stats = await searchEngine.getStats();
      expect(stats.totalEmbeddings).toBe(2);
      
      await searchEngine.clear();
      
      stats = await searchEngine.getStats();
      expect(stats.totalEmbeddings).toBe(0);
      expect(stats.uniqueArtifacts).toBe(0);
    });
    
    it('should optimize index', async () => {
      // This test mainly ensures the optimize method doesn't throw errors
      await expect(searchEngine.optimize()).resolves.not.toThrow();
    });
  });
  
  describe('Relevance Scoring', () => {
    it('should calculate relevance scores with boosts', async () => {
      const artifactId = 'test-relevance';
      const content = 'test content';
      const embedding = [0.1, 0.2, 0.3, 0.4, 0.5];
      
      await searchEngine.indexArtifact(artifactId, 'skill', content, embedding);
      
      const query: SearchQuery = {
        query: 'test',
        queryVector: [0.15, 0.25, 0.35, 0.45, 0.55], // Slightly different
        boostFactors: {
          recency: 0.1,
          quality: 0.2,
          popularity: 0.05,
        },
      };
      
      const results = await searchEngine.search(query);
      
      expect(results.length).toBe(1);
      expect(results[0].relevance).toBeGreaterThan(0);
      expect(results[0].relevance).toBeLessThanOrEqual(1);
      
      // Relevance should be at least as high as similarity
      expect(results[0].relevance).toBeGreaterThanOrEqual(results[0].similarity);
    });
  });
  
  describe('Performance', () => {
    it('should handle large number of embeddings efficiently', async () => {
      // Index 100 artifacts (small scale for test)
      for (let i = 0; i < 100; i++) {
        const embedding = Array(1536).fill(0).map(() => Math.random() * 0.1);
        await searchEngine.indexArtifact(
          `skill-${i}`,
          'skill',
          `Content for skill ${i}`,
          embedding
        );
      }
      
      const stats = await searchEngine.getStats();
      expect(stats.totalEmbeddings).toBe(100);
      expect(stats.uniqueArtifacts).toBe(100);
      
      // Search should complete in reasonable time
      const startTime = Date.now();
      const query: SearchQuery = {
        query: 'test query',
        limit: 10,
      };
      
      const results = await searchEngine.search(query);
      const endTime = Date.now();
      const searchTime = endTime - startTime;
      
      expect(results.length).toBeLessThanOrEqual(10);
      expect(searchTime).toBeLessThan(1000); // Should complete in under 1 second
    });
  });
  
  describe('Error Handling', () => {
    it('should handle invalid embeddings gracefully', () => {
      const invalidEmbedding = [0.1, NaN, 0.3];
      const validEmbedding = [0.1, 0.2, 0.3];
      
      expect(() => validateEmbeddingDimensions(invalidEmbedding)).not.toThrow();
      expect(validateEmbeddingDimensions(invalidEmbedding)).toBe(false);
      
      expect(() => validateEmbeddingDimensions(validEmbedding)).not.toThrow();
      expect(validateEmbeddingDimensions(validEmbedding)).toBe(true);
    });
    
    it('should handle search with no indexed artifacts', async () => {
      const query: SearchQuery = {
        query: 'test query',
      };
      
      const results = await searchEngine.search(query);
      
      expect(results).toEqual([]);
    });
    
    it('should handle removal of non-existent artifact', async () => {
      const removed = await searchEngine.removeArtifact('non-existent');
      expect(removed).toBe(false);
    });
  });
});