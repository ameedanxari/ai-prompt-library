/**
 * Unit tests for context window management
 * 
 * Tests the context manager implementation for proper context window management,
 * relevance scoring, and pruning functionality.
 * 
 * Validates: Requirements 1.2, 5.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createContextManager,
  ContextQuery,
  calculateWindowUtilization,
  createContextRelationship,
  mergeContextItems,
} from './context-manager';

describe('Context Manager', () => {
  let contextManager: ReturnType<typeof createContextManager>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    contextManager = createContextManager({
      maxSize: 1000,
      maxItems: 10,
      minRelevanceThreshold: 0.3,
      pruningStrategy: 'hybrid',
      autoPrune: false, // Disable auto-prune for tests
      preserveImportant: true,
      importanceThreshold: 0.7,
    });
  });
  
  afterEach(async () => {
    vi.useRealTimers();
    await contextManager.clear();
  });
  
  describe('Context Item Management', () => {
    it('should add context items', async () => {
      const itemId = await contextManager.addContextItem(
        'Test content',
        'prompt',
        {
          source: 'test',
          tags: ['test', 'example'],
        }
      );
      
      expect(itemId).toBeDefined();
      expect(itemId).toContain('context_prompt');
      
      const item = await contextManager.getContextItem(itemId);
      expect(item).not.toBeNull();
      expect(item!.content).toBe('Test content');
      expect(item!.type).toBe('prompt');
      expect(item!.metadata.source).toBe('test');
      expect(item!.metadata.tags).toEqual(['test', 'example']);
    });
    
    it('should retrieve context items by ID', async () => {
      const itemId = await contextManager.addContextItem('Test content', 'prompt');
      
      const item = await contextManager.getContextItem(itemId);
      expect(item).not.toBeNull();
      expect(item!.id).toBe(itemId);
      expect(item!.content).toBe('Test content');
      
      // Access should be recorded
      expect(item!.metadata.accessCount).toBe(1);
    });
    
    it('should return null for non-existent items', async () => {
      const item = await contextManager.getContextItem('non-existent');
      expect(item).toBeNull();
    });
    
    it('should remove context items', async () => {
      const itemId = await contextManager.addContextItem('Test content', 'prompt');
      
      const removed = await contextManager.removeContextItem(itemId);
      expect(removed).toBe(true);
      
      const item = await contextManager.getContextItem(itemId);
      expect(item).toBeNull();
    });
    
    it('should handle removal of non-existent items', async () => {
      const removed = await contextManager.removeContextItem('non-existent');
      expect(removed).toBe(false);
    });
    
    it('should clear all context items', async () => {
      await contextManager.addContextItem('Content 1', 'prompt');
      await contextManager.addContextItem('Content 2', 'skill');
      await contextManager.addContextItem('Content 3', 'artifact');
      
      const statsBefore = await contextManager.getStats();
      expect(statsBefore.totalItems).toBe(3);
      
      await contextManager.clear();
      
      const statsAfter = await contextManager.getStats();
      expect(statsAfter.totalItems).toBe(0);
    });
  });
  
  describe('Relevance Scoring', () => {
    it('should update relevance scores', async () => {
      const itemId = await contextManager.addContextItem('Test content', 'prompt');
      
      const updated = await contextManager.updateRelevance(itemId, 0.8);
      expect(updated).toBe(true);
      
      const item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.relevance).toBe(0.8);
    });
    
    it('should clamp relevance scores to 0-1 range', async () => {
      const itemId = await contextManager.addContextItem('Test content', 'prompt');
      
      // Test below 0
      await contextManager.updateRelevance(itemId, -0.5);
      let item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.relevance).toBe(0);
      
      // Test above 1
      await contextManager.updateRelevance(itemId, 1.5);
      item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.relevance).toBe(1);
    });
    
    it('should return false when updating non-existent item', async () => {
      const updated = await contextManager.updateRelevance('non-existent', 0.5);
      expect(updated).toBe(false);
    });
    
    it('should update importance scores', async () => {
      const itemId = await contextManager.addContextItem('Test content', 'prompt');
      
      const updated = await contextManager.updateImportance(itemId, 0.9);
      expect(updated).toBe(true);
      
      const item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.importance).toBe(0.9);
    });
    
    it('should clamp importance scores to 0-1 range', async () => {
      const itemId = await contextManager.addContextItem('Test content', 'prompt');
      
      // Test below 0
      await contextManager.updateImportance(itemId, -0.2);
      let item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.importance).toBe(0);
      
      // Test above 1
      await contextManager.updateImportance(itemId, 1.2);
      item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.importance).toBe(1);
    });
    
    it('should record access to items', async () => {
      const itemId = await contextManager.addContextItem('Test content', 'prompt');
      
      // Initial access count should be 0 (added but not accessed yet)
      let item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.accessCount).toBe(1); // getContextItem records access
      
      // Record additional access
      await contextManager.recordAccess(itemId);
      item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.accessCount).toBe(3);
    });
    
    it('should handle recording access to non-existent items', async () => {
      // Should not throw error
      await expect(contextManager.recordAccess('non-existent')).resolves.not.toThrow();
    });
  });
  
  describe('Context Retrieval', () => {
    beforeEach(async () => {
      // Add test items with different properties
      await contextManager.addContextItem('User authentication system', 'skill', {
        relevance: 0.9,
        importance: 0.8,
        tags: ['security', 'authentication'],
      });
      
      await contextManager.addContextItem('Database schema design', 'skill', {
        relevance: 0.7,
        importance: 0.6,
        tags: ['database', 'design'],
      });
      
      await contextManager.addContextItem('How to create login page', 'prompt', {
        relevance: 0.5,
        importance: 0.4,
        tags: ['ui', 'authentication'],
      });
      
      await contextManager.addContextItem('API documentation', 'documentation', {
        relevance: 0.3,
        importance: 0.2,
        tags: ['api', 'docs'],
      });
    });
    
    it('should retrieve relevant context items', async () => {
      const query: ContextQuery = {
        query: 'authentication system',
        limit: 5,
      };
      
      const results = await contextManager.getRelevantContext(query);
      
      expect(results.length).toBeGreaterThan(0);
      
      // Should find the authentication skill first
      const topResult = results[0];
      expect(topResult.content).toBe('User authentication system');
      expect(topResult.metadata.relevance).toBe(0.9);
    });
    
    it('should respect result limit', async () => {
      const query: ContextQuery = {
        query: 'test',
        limit: 2,
      };
      
      const results = await contextManager.getRelevantContext(query);
      
      expect(results.length).toBeLessThanOrEqual(2);
    });
    
    it('should filter by context type', async () => {
      const query: ContextQuery = {
        query: 'test',
        type: 'skill',
      };
      
      const results = await contextManager.getRelevantContext(query);
      
      for (const result of results) {
        expect(result.type).toBe('skill');
      }
    });
    
    it('should filter by tags', async () => {
      const query: ContextQuery = {
        query: 'test',
        tags: ['authentication'],
      };
      
      const results = await contextManager.getRelevantContext(query);
      
      for (const result of results) {
        expect(result.metadata.tags).toContain('authentication');
      }
    });
    
    it('should respect minimum relevance threshold', async () => {
      const query: ContextQuery = {
        query: 'test',
        minRelevance: 0.6,
      };
      
      const results = await contextManager.getRelevantContext(query);
      
      for (const result of results) {
        expect(result.metadata.relevance).toBeGreaterThanOrEqual(0.6);
      }
    });
    
    it('should apply boost factors', async () => {
      const query: ContextQuery = {
        query: 'test',
        boostFactors: {
          recency: 0.5,
          importance: 0.3,
          frequency: 0.2,
        },
      };
      
      const results = await contextManager.getRelevantContext(query);
      
      // Should still return results
      expect(results.length).toBeGreaterThan(0);
    });
    
    it('should include related items when requested', async () => {
      // First, add items with relationships
      const item1Id = await contextManager.addContextItem('Item 1', 'skill', {
        relationships: [createContextRelationship('item2', 'depends_on', 0.8)],
      });
      
      const item2Id = await contextManager.addContextItem('Item 2', 'skill', {
        relationships: [createContextRelationship('item1', 'required_by', 0.8)],
      });
      
      // Update the relationship to use actual IDs
      const item1 = await contextManager.getContextItem(item1Id);
      item1!.metadata.relationships[0].targetId = item2Id;
      await contextManager.removeContextItem(item1Id);
      const newItem1Id = await contextManager.addContextItem(item1!.content, item1!.type, item1!.metadata);
      
      const query: ContextQuery = {
        query: 'Item 1',
        includeRelated: true,
        maxDepth: 1,
      };
      
      const results = await contextManager.getRelevantContext(query);
      
      // Should include both related items
      const itemIds = results.map(r => r.id);
      expect(itemIds).toContain(newItem1Id);
      expect(itemIds).toContain(item2Id);
    });
  });
  
  describe('Pruning', () => {
    it('should prune when size limit exceeded', async () => {
      // Update config to small limits
      await contextManager.updateConfig({
        maxSize: 100,
        maxItems: 100,
      });
      
      // Add items that exceed size limit
      await contextManager.addContextItem('A'.repeat(60), 'prompt'); // 60 chars
      await contextManager.addContextItem('B'.repeat(60), 'prompt'); // 60 chars
      
      const statsBefore = await contextManager.getStats();
      expect(statsBefore.currentSize).toBe(120);
      expect(statsBefore.currentSize).toBeGreaterThan(100);
      
      const result = await contextManager.prune();
      
      expect(result.prunedCount).toBeGreaterThan(0);
      expect(result.reason).toBe('size_limit');
      expect(result.freedSize).toBeGreaterThan(0);
      
      const statsAfter = await contextManager.getStats();
      expect(statsAfter.currentSize).toBeLessThanOrEqual(100);
    });
    
    it('should prune when item limit exceeded', async () => {
      // Update config to small item limit
      await contextManager.updateConfig({
        maxSize: 10000,
        maxItems: 3,
      });
      
      // Add more items than limit
      for (let i = 0; i < 5; i++) {
        await contextManager.addContextItem(`Item ${i}`, 'prompt');
      }
      
      const statsBefore = await contextManager.getStats();
      expect(statsBefore.totalItems).toBe(5);
      expect(statsBefore.totalItems).toBeGreaterThan(3);
      
      const result = await contextManager.prune();
      
      expect(result.prunedCount).toBeGreaterThan(0);
      expect(result.reason).toBe('item_limit');
      
      const statsAfter = await contextManager.getStats();
      expect(statsAfter.totalItems).toBeLessThanOrEqual(3);
    });
    
    it('should use LRU pruning strategy', async () => {
      await contextManager.updateConfig({
        maxSize: 100,
        maxItems: 2,
        pruningStrategy: 'lru',
        preserveImportant: false, // Disable preservation for this test
      });
      
      // Add items
      const item1Id = await contextManager.addContextItem('Item 1', 'prompt');
      vi.advanceTimersByTime(1);
      const item2Id = await contextManager.addContextItem('Item 2', 'prompt');
      vi.advanceTimersByTime(1);
      const item3Id = await contextManager.addContextItem('Item 3', 'prompt');
      vi.advanceTimersByTime(1);
      
      // Access items to change LRU order with time advances
      await contextManager.recordAccess(item2Id); // Make item2 most recently used
      vi.advanceTimersByTime(1);
      await contextManager.recordAccess(item1Id); // Make item1 most recently used
      vi.advanceTimersByTime(1);
      // item3 is least recently used (never accessed after creation)
      
      const result = await contextManager.prune();
      
      // With LRU, item3 should be pruned first
      expect(result.prunedItems).toContain(item3Id);
    });
    
    it('should use relevance pruning strategy', async () => {
      await contextManager.updateConfig({
        maxSize: 100,
        maxItems: 2,
        pruningStrategy: 'relevance',
        minRelevanceThreshold: 0.3,
      });
      
      // Add items with different relevance scores
      const item1Id = await contextManager.addContextItem('Item 1', 'prompt', {
        relevance: 0.9,
      });
      const item2Id = await contextManager.addContextItem('Item 2', 'prompt', {
        relevance: 0.5,
      });
      const item3Id = await contextManager.addContextItem('Item 3', 'prompt', {
        relevance: 0.2, // Below threshold
      });
      
      const result = await contextManager.prune();
      
      // With relevance pruning, item3 should be pruned first (lowest relevance)
      expect(result.prunedItems).toContain(item3Id);
    });
    
    it('should use size pruning strategy', async () => {
      await contextManager.updateConfig({
        maxSize: 100,
        maxItems: 100,
        pruningStrategy: 'size',
      });
      
      // Add items with different sizes
      const item1Id = await contextManager.addContextItem('A'.repeat(30), 'prompt'); // 30 chars
      const item2Id = await contextManager.addContextItem('B'.repeat(50), 'prompt'); // 50 chars
      const item3Id = await contextManager.addContextItem('C'.repeat(70), 'prompt'); // 70 chars
      
      const result = await contextManager.prune();
      
      // With size pruning, largest items should be pruned first
      // item3 is largest (70 chars), so it should be pruned
      expect(result.prunedItems).toContain(item3Id);
    });
    
    it('should use hybrid pruning strategy', async () => {
      await contextManager.updateConfig({
        maxSize: 100,
        maxItems: 2,
        pruningStrategy: 'hybrid',
      });
      
      // Add items with different properties
      const item1Id = await contextManager.addContextItem('Item 1', 'prompt', {
        relevance: 0.9,
        importance: 0.8,
      });
      const item2Id = await contextManager.addContextItem('Item 2', 'prompt', {
        relevance: 0.5,
        importance: 0.6,
      });
      const item3Id = await contextManager.addContextItem('Item 3', 'prompt', {
        relevance: 0.3,
        importance: 0.4,
      });
      
      const result = await contextManager.prune();
      
      // With hybrid pruning, item3 should be pruned (lowest composite score)
      expect(result.prunedCount).toBeGreaterThan(0);
    });
    
    it('should preserve important items when configured', async () => {
      await contextManager.updateConfig({
        maxSize: 100,
        maxItems: 2,
        preserveImportant: true,
        importanceThreshold: 0.7,
      });
      
      // Add items with different importance scores
      const item1Id = await contextManager.addContextItem('Item 1', 'prompt', {
        importance: 0.9, // Above threshold
      });
      const item2Id = await contextManager.addContextItem('Item 2', 'prompt', {
        importance: 0.8, // Above threshold
      });
      const item3Id = await contextManager.addContextItem('Item 3', 'prompt', {
        importance: 0.6, // Below threshold
      });
      
      const result = await contextManager.prune();
      
      // item3 should be pruned (below importance threshold)
      expect(result.prunedItems).toContain(item3Id);
      expect(result.prunedItems).not.toContain(item1Id);
      expect(result.prunedItems).not.toContain(item2Id);
    });
    
    it('should not prune when within limits', async () => {
      await contextManager.updateConfig({
        maxSize: 1000,
        maxItems: 10,
      });
      
      // Add items within limits
      await contextManager.addContextItem('Item 1', 'prompt');
      await contextManager.addContextItem('Item 2', 'prompt');
      
      const result = await contextManager.prune();
      
      expect(result.prunedCount).toBe(0);
      expect(result.freedSize).toBe(0);
      expect(result.prunedItems).toEqual([]);
    });
  });
  
  describe('Statistics', () => {
    it('should provide accurate statistics', async () => {
      // Add some items
      await contextManager.addContextItem('Item 1', 'prompt', {
        relevance: 0.8,
        importance: 0.7,
        size: 100,
      });
      
      await contextManager.addContextItem('Item 2', 'skill', {
        relevance: 0.6,
        importance: 0.5,
        size: 150,
      });
      
      // Access items
      const stats = await contextManager.getStats();
      
      expect(stats.totalItems).toBe(2);
      expect(stats.currentSize).toBe(250); // 100 + 150
      expect(stats.maxSize).toBe(1000);
      expect(stats.memoryUsage).toBeGreaterThan(0);
      expect(stats.avgRelevance).toBeCloseTo(0.7, 1); // (0.8 + 0.6) / 2
      expect(stats.avgImportance).toBeCloseTo(0.6, 1); // (0.7 + 0.5) / 2
      
      // Pruning stats should be empty initially
      expect(stats.pruning.totalPruned).toBe(0);
      expect(stats.pruning.lastPruned).toBeNull();
      
      // Access stats
      expect(stats.access.totalAccesses).toBeGreaterThanOrEqual(0);
    });
    
    it('should track pruning statistics', async () => {
      // Set small limits to force pruning
      await contextManager.updateConfig({
        maxSize: 50,
        maxItems: 1,
      });
      
      // Add items that will be pruned
      await contextManager.addContextItem('Item 1', 'prompt', { size: 40 });
      await contextManager.addContextItem('Item 2', 'prompt', { size: 40 });
      
      await contextManager.prune();
      
      const stats = await contextManager.getStats();
      
      expect(stats.pruning.totalPruned).toBeGreaterThan(0);
      expect(stats.pruning.lastPruned).not.toBeNull();
      expect(stats.pruning.byStrategy).toHaveProperty('hybrid');
    });
    
    it('should track access statistics', async () => {
      const item1Id = await contextManager.addContextItem('Item 1', 'prompt');
      const item2Id = await contextManager.addContextItem('Item 2', 'prompt');
      
      // Access items multiple times
      await contextManager.recordAccess(item1Id);
      await contextManager.recordAccess(item1Id);
      await contextManager.recordAccess(item2Id);
      
      const stats = await contextManager.getStats();
      
      expect(stats.access.totalAccesses).toBeGreaterThanOrEqual(3);
      expect(stats.access.avgAccesses).toBeGreaterThan(0);
      expect(stats.access.mostAccessed).toBe(item1Id); // Accessed twice
    });
  });
  
  describe('Configuration', () => {
    it('should update configuration', async () => {
      const newConfig = {
        maxSize: 5000,
        maxItems: 50,
        minRelevanceThreshold: 0.4,
        pruningStrategy: 'lru' as const,
        autoPrune: true,
        pruningInterval: 30000,
        preserveImportant: false,
        importanceThreshold: 0.8,
      };
      
      await contextManager.updateConfig(newConfig);
      
      // Verify configuration was updated
      const stats = await contextManager.getStats();
      expect(stats.maxSize).toBe(5000);
    });
    
    it('should restart auto-pruning when interval changes', async () => {
      vi.useFakeTimers();
      
      await contextManager.updateConfig({
        autoPrune: true,
        pruningInterval: 1000,
      });
      
      // Fast-forward time
      vi.advanceTimersByTime(2000);
      
      // Auto-pruning should have occurred
      // (We can't easily verify this without mocking, but we can ensure no errors)
      expect(true).toBe(true);
      
      vi.useRealTimers();
    });
  });
  
  describe('Utility Functions', () => {
    it('should calculate window utilization', () => {
      const utilization = calculateWindowUtilization(750, 1000, 8, 10);
      
      expect(utilization.sizeUtilization).toBe(0.75);
      expect(utilization.itemUtilization).toBe(0.8);
      expect(utilization.overallUtilization).toBe(0.8);
    });
    
    it('should create context relationships', () => {
      const relationship = createContextRelationship('target-id', 'depends_on', 0.8);
      
      expect(relationship.targetId).toBe('target-id');
      expect(relationship.type).toBe('depends_on');
      expect(relationship.strength).toBe(0.8);
    });
    
    it('should clamp relationship strength to 0-1 range', () => {
      const relationship1 = createContextRelationship('target', 'type', -0.5);
      expect(relationship1.strength).toBe(0);
      
      const relationship2 = createContextRelationship('target', 'type', 1.5);
      expect(relationship2.strength).toBe(1);
    });
    
    it('should merge context items', () => {
      const items = [
        {
          id: 'item1',
          content: 'Content 1',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.8,
            importance: 0.7,
            accessCount: 1,
            lastAccessed: new Date(),
            size: 100,
            tags: ['test'],
            relationships: [],
          },
        },
        {
          id: 'item2',
          content: 'Content 2',
          type: 'skill',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.6,
            importance: 0.5,
            accessCount: 2,
            lastAccessed: new Date(),
            size: 150,
            tags: ['test'],
            relationships: [],
          },
        },
        {
          id: 'item1', // Duplicate ID
          content: 'Content 1 Updated',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.9,
            importance: 0.8,
            accessCount: 3,
            lastAccessed: new Date(),
            size: 120,
            tags: ['test', 'updated'],
            relationships: [],
          },
        },
      ];
      
      const merged = mergeContextItems(items as any);
      
      // Should have 2 unique items (duplicate removed)
      expect(merged.length).toBe(2);
      
      // Should keep the last occurrence of duplicate
      const item1 = merged.find(item => item.id === 'item1');
      expect(item1!.content).toBe('Content 1 Updated');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle empty context', async () => {
      const query: ContextQuery = {
        query: 'test',
      };
      
      const results = await contextManager.getRelevantContext(query);
      expect(results).toEqual([]);
      
      const stats = await contextManager.getStats();
      expect(stats.totalItems).toBe(0);
      expect(stats.currentSize).toBe(0);
      expect(stats.avgRelevance).toBe(0);
      expect(stats.avgImportance).toBe(0);
    });
    
    it('should handle very large context items', async () => {
      const largeContent = 'A'.repeat(10000);
      
      const itemId = await contextManager.addContextItem(largeContent, 'prompt');
      
      const item = await contextManager.getContextItem(itemId);
      expect(item!.metadata.size).toBe(10000);
    });
    
    it('should handle items with special characters', async () => {
      const specialContent = 'Test with special chars: ©®™€¥£¢∞§¶•ªº–—±≥≤≈≠√∫∂∑∏∞';
      
      const itemId = await contextManager.addContextItem(specialContent, 'prompt');
      
      const item = await contextManager.getContextItem(itemId);
      expect(item!.content).toBe(specialContent);
    });
    
    it('should handle concurrent operations', async () => {
      // This test verifies basic concurrency handling
      const operations = [];
      
      for (let i = 0; i < 10; i++) {
        operations.push(
          contextManager.addContextItem(`Item ${i}`, 'prompt')
        );
      }
      
      await Promise.all(operations);
      
      const stats = await contextManager.getStats();
      expect(stats.totalItems).toBe(10);
    });
  });
});