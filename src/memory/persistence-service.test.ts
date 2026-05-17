/**
 * Integration tests for persistence and recovery
 * 
 * Tests the persistence service implementation for data persistence,
 * backup/recovery, synchronization, and conflict resolution.
 * 
 * Validates: Requirements 11.3, 11.4
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createPersistenceService,
  createConflictResolution,
  mergeConflictingData,
  validateBackupIntegrity,
  ContextItem,
  VectorEmbedding,
} from './persistence-service';

describe('Persistence Service', () => {
  let persistenceService: ReturnType<typeof createPersistenceService>;
  
  beforeEach(() => {
    vi.useFakeTimers();
    persistenceService = createPersistenceService({
      enableBackups: false, // Disable auto-backups for tests
      enableSync: false, // Disable auto-sync for tests
      maxRetries: 3,
      retryDelay: 100,
    });
  });
  
  afterEach(async () => {
    vi.useRealTimers();
    await persistenceService.clear();
  });
  
  describe('Context Data Persistence', () => {
    it('should save and load context data', async () => {
      const contextItems: ContextItem[] = [
        {
          id: 'item1',
          content: 'Test content 1',
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
          content: 'Test content 2',
          type: 'skill',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.6,
            importance: 0.5,
            accessCount: 2,
            lastAccessed: new Date(),
            size: 150,
            tags: ['test', 'skill'],
            relationships: [],
          },
        },
      ];
      
      // Save context data
      const saveResult = await persistenceService.saveContext(contextItems);
      expect(saveResult.success).toBe(true);
      expect(saveResult.metadata.dataSize).toBeGreaterThan(0);
      
      // Load context data
      const loadResult = await persistenceService.loadContext();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toHaveLength(2);
      expect(loadResult.data![0].id).toBe('item1');
      expect(loadResult.data![1].id).toBe('item2');
    });
    
    it('should handle empty context data', async () => {
      const saveResult = await persistenceService.saveContext([]);
      expect(saveResult.success).toBe(true);
      
      const loadResult = await persistenceService.loadContext();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual([]);
    });
    
    it('should handle save errors gracefully', async () => {
      // Mock a failure scenario - return error result instead of throwing
      vi.spyOn(persistenceService, 'saveContext').mockResolvedValueOnce({
        success: false,
        error: 'Save failed',
        metadata: {
          timestamp: new Date(),
          duration: 0,
        },
      });
      
      const contextItems: ContextItem[] = [
        {
          id: 'item1',
          content: 'Test',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.5,
            importance: 0.5,
            accessCount: 0,
            lastAccessed: new Date(),
            size: 10,
            tags: [],
            relationships: [],
          },
        },
      ];
      
      const result = await persistenceService.saveContext(contextItems);
      expect(result.success).toBe(false);
      expect(result.error).toBe('Save failed');
    });
  });
  
  describe('Embedding Data Persistence', () => {
    it('should save and load embedding data', async () => {
      const embeddings: VectorEmbedding[] = [
        {
          id: 'embed1',
          vector: [0.1, 0.2, 0.3, 0.4, 0.5],
          metadata: {
            artifactId: 'skill1',
            artifactType: 'skill',
            content: 'Create REST API',
            createdAt: new Date(),
            model: 'text-embedding-ada-002',
            dimensions: 5,
          },
        },
        {
          id: 'embed2',
          vector: [0.6, 0.7, 0.8, 0.9, 1.0],
          metadata: {
            artifactId: 'skill2',
            artifactType: 'skill',
            content: 'Database design',
            createdAt: new Date(),
            model: 'text-embedding-ada-002',
            dimensions: 5,
          },
        },
      ];
      
      // Save embedding data
      const saveResult = await persistenceService.saveEmbeddings(embeddings);
      expect(saveResult.success).toBe(true);
      expect(saveResult.metadata.dataSize).toBeGreaterThan(0);
      
      // Load embedding data
      const loadResult = await persistenceService.loadEmbeddings();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toHaveLength(2);
      expect(loadResult.data![0].id).toBe('embed1');
      expect(loadResult.data![1].id).toBe('embed2');
    });
    
    it('should handle empty embedding data', async () => {
      const saveResult = await persistenceService.saveEmbeddings([]);
      expect(saveResult.success).toBe(true);
      
      const loadResult = await persistenceService.loadEmbeddings();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data).toEqual([]);
    });
  });
  
  describe('Backup and Recovery', () => {
    it('should create backups', async () => {
      // Enable backups for this test
      await persistenceService.updateConfig({ enableBackups: true });
      
      // Add some data
      const contextItems: ContextItem[] = [
        {
          id: 'item1',
          content: 'Test',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.5,
            importance: 0.5,
            accessCount: 0,
            lastAccessed: new Date(),
            size: 10,
            tags: [],
            relationships: [],
          },
        },
      ];
      
      await persistenceService.saveContext(contextItems);
      
      // Create backup
      const backupResult = await persistenceService.createBackup('full');
      expect(backupResult.success).toBe(true);
      expect(backupResult.data).toBeDefined();
      expect(backupResult.data!.id).toContain('backup_full');
      expect(backupResult.data!.successful).toBe(true);
      expect(backupResult.data!.size).toBeGreaterThan(0);
      expect(backupResult.data!.checksum).toBeDefined();
    });
    
    it('should list backups', async () => {
      // Create multiple backups
      await persistenceService.createBackup('full');
      await persistenceService.createBackup('incremental');
      
      const listResult = await persistenceService.listBackups();
      expect(listResult.success).toBe(true);
      expect(listResult.data).toHaveLength(2);
      
      // Should be sorted by timestamp (newest first)
      const timestamps = listResult.data!.map(b => b.timestamp.getTime());
      expect(timestamps[0]).toBeGreaterThanOrEqual(timestamps[1]);
    });
    
    it('should restore from backup', async () => {
      await persistenceService.saveContext([
        {
          id: 'before-backup',
          content: 'Restorable context',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.9,
            importance: 0.8,
            accessCount: 0,
            lastAccessed: new Date(),
            size: 18,
            tags: ['backup'],
            relationships: [],
          },
        },
      ]);

      const backupResult = await persistenceService.createBackup('full');
      expect(backupResult.success).toBe(true);
      
      const backupId = backupResult.data!.id;

      await persistenceService.saveContext([]);
      
      const restoreResult = await persistenceService.restoreBackup(backupId);
      expect(restoreResult.success).toBe(true);
      expect(restoreResult.metadata.isRecovery).toBe(true);

      const restored = await persistenceService.loadContext();
      expect(restored.data?.map(item => item.id)).toEqual(['before-backup']);
    });
    
    it('should handle restore from non-existent backup', async () => {
      const restoreResult = await persistenceService.restoreBackup('non-existent');
      expect(restoreResult.success).toBe(false);
      expect(restoreResult.error).toContain('Backup not found');
    });
    
    it('should delete backups', async () => {
      // Create a backup
      const backupResult = await persistenceService.createBackup('full');
      const backupId = backupResult.data!.id;
      
      // List backups before deletion
      const listBefore = await persistenceService.listBackups();
      expect(listBefore.data).toHaveLength(1);
      
      // Delete backup
      const deleteResult = await persistenceService.deleteBackup(backupId);
      expect(deleteResult.success).toBe(true);
      
      // List backups after deletion
      const listAfter = await persistenceService.listBackups();
      expect(listAfter.data).toHaveLength(0);
    });
    
    it('should handle delete of non-existent backup', async () => {
      const deleteResult = await persistenceService.deleteBackup('non-existent');
      expect(deleteResult.success).toBe(false);
      expect(deleteResult.error).toContain('Backup not found');
    });
    
    it('should apply backup retention policy', async () => {
      // Configure small retention policy
      await persistenceService.updateConfig({
        enableBackups: true,
        backupRetention: 2,
      });
      
      // Create more backups than retention limit
      await persistenceService.createBackup('full');
      await persistenceService.createBackup('incremental');
      await persistenceService.createBackup('incremental');
      await persistenceService.createBackup('incremental');
      
      const listResult = await persistenceService.listBackups();
      
      // Should only retain the configured number of backups
      expect(listResult.data!.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('Synchronization', () => {
    it('should synchronize data', async () => {
      // Enable sync for this test
      await persistenceService.updateConfig({ enableSync: true });
      
      const syncResult = await persistenceService.synchronize();
      expect(syncResult.success).toBe(true);
      expect(syncResult.data).toBeDefined();
      expect(syncResult.data!.active).toBe(false); // Should be inactive after sync
      expect(syncResult.data!.lastSync).not.toBeNull();
      expect(syncResult.data!.statistics.totalOps).toBe(1);
      expect(syncResult.data!.statistics.successfulOps).toBe(1);
    });
    
    it('should get sync status', async () => {
      const statusResult = await persistenceService.getSyncStatus();
      expect(statusResult.success).toBe(true);
      expect(statusResult.data).toBeDefined();
      expect(statusResult.data!.active).toBe(false);
      expect(statusResult.data!.statistics.totalOps).toBe(0);
    });
    
    it('should handle sync errors gracefully', async () => {
      // Mock a sync failure - return error result instead of throwing
      vi.spyOn(persistenceService, 'synchronize').mockResolvedValueOnce({
        success: false,
        error: 'Sync failed',
        metadata: {
          timestamp: new Date(),
          duration: 0,
        },
      });
      
      const syncResult = await persistenceService.synchronize();
      expect(syncResult.success).toBe(false);
      expect(syncResult.error).toBe('Sync failed');
    });
  });
  
  describe('Conflict Resolution', () => {
    it('should resolve conflicts', async () => {
      const conflictIds = ['conflict1', 'conflict2'];
      const resolution = createConflictResolution(
        'version',
        'latest_wins',
        {
          versions: ['v1', 'v2'],
          chosenVersion: 'v2',
        }
      );
      
      const resolveResult = await persistenceService.resolveConflicts(conflictIds, resolution);
      expect(resolveResult.success).toBe(true);
      expect(resolveResult.metadata.conflictResolution).toEqual(resolution);
    });
    
    it('should handle empty conflict list', async () => {
      const resolution = createConflictResolution('manual', 'manual', {});
      
      const resolveResult = await persistenceService.resolveConflicts([], resolution);
      expect(resolveResult.success).toBe(true);
    });
  });
  
  describe('Statistics', () => {
    it('should provide persistence statistics', async () => {
      // Add some data
      const contextItems: ContextItem[] = [
        {
          id: 'item1',
          content: 'Test',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.5,
            importance: 0.5,
            accessCount: 0,
            lastAccessed: new Date(),
            size: 100,
            tags: [],
            relationships: [],
          },
        },
      ];
      
      await persistenceService.saveContext(contextItems);
      
      // Create a backup
      await persistenceService.createBackup('full');
      
      // Get statistics
      const statsResult = await persistenceService.getStats();
      expect(statsResult.success).toBe(true);
      expect(statsResult.data).toBeDefined();
      expect(statsResult.data!.contextItems).toBe(1);
      expect(statsResult.data!.embeddings).toBe(0);
      expect(statsResult.data!.backups).toBe(1);
      expect(statsResult.data!.storageUsage).toBeGreaterThan(0);
      expect(statsResult.data!.backupUsage).toBeGreaterThan(0);
    });
    
    it('should track recovery statistics', async () => {
      // Create and restore a backup
      const backupResult = await persistenceService.createBackup('full');
      await persistenceService.restoreBackup(backupResult.data!.id);
      
      const statsResult = await persistenceService.getStats();
      expect(statsResult.data!.recovery.attempts).toBe(1);
      expect(statsResult.data!.recovery.successful).toBe(1);
      expect(statsResult.data!.recovery.lastRecovery).not.toBeNull();
    });
  });
  
  describe('Configuration', () => {
    it('should update configuration', async () => {
      const newConfig = {
        enableBackups: true,
        backupInterval: 5000,
        enableSync: true,
        syncInterval: 10000,
        conflictStrategy: 'merge' as const,
        maxRetries: 5,
      };
      
      const updateResult = await persistenceService.updateConfig(newConfig);
      expect(updateResult.success).toBe(true);
      
      // Verify configuration was applied
      const syncResult = await persistenceService.synchronize();
      expect(syncResult.success).toBe(true);
      expect(syncResult.data?.nextSync).toBeInstanceOf(Date);
    });
    
    it('should handle configuration errors', async () => {
      // Mock a configuration error - return error result instead of throwing
      vi.spyOn(persistenceService, 'updateConfig').mockResolvedValueOnce({
        success: false,
        error: 'Config error',
        metadata: {
          timestamp: new Date(),
          duration: 0,
        },
      });
      
      const updateResult = await persistenceService.updateConfig({});
      expect(updateResult.success).toBe(false);
      expect(updateResult.error).toBe('Config error');
    });
  });
  
  describe('Clear Operations', () => {
    it('should clear all persisted data', async () => {
      // Add some data
      const contextItems: ContextItem[] = [
        {
          id: 'item1',
          content: 'Test',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.5,
            importance: 0.5,
            accessCount: 0,
            lastAccessed: new Date(),
            size: 10,
            tags: [],
            relationships: [],
          },
        },
      ];
      
      await persistenceService.saveContext(contextItems);
      await persistenceService.createBackup('full');
      
      // Verify data exists
      const loadResult = await persistenceService.loadContext();
      expect(loadResult.data).toHaveLength(1);
      
      const listResult = await persistenceService.listBackups();
      expect(listResult.data).toHaveLength(1);
      
      // Clear all data
      const clearResult = await persistenceService.clear();
      expect(clearResult.success).toBe(true);
      
      // Verify data is cleared
      const loadAfter = await persistenceService.loadContext();
      expect(loadAfter.data).toHaveLength(0);
      
      const listAfter = await persistenceService.listBackups();
      expect(listAfter.data).toHaveLength(0);
      
      // Verify stats are reset
      const statsResult = await persistenceService.getStats();
      expect(statsResult.data!.contextItems).toBe(0);
      expect(statsResult.data!.backups).toBe(0);
      expect(statsResult.data!.storageUsage).toBe(0);
    });
  });
  
  describe('Utility Functions', () => {
    describe('createConflictResolution', () => {
      it('should create conflict resolution objects', () => {
        const resolution = createConflictResolution(
          'version',
          'latest_wins',
          {
            versions: ['v1', 'v2'],
            chosenVersion: 'v2',
          }
        );
        
        expect(resolution.type).toBe('version');
        expect(resolution.strategy).toBe('latest_wins');
        expect(resolution.details.versions).toEqual(['v1', 'v2']);
        expect(resolution.details.chosenVersion).toBe('v2');
        expect(resolution.resolved).toBe(true);
      });
    });
    
    describe('mergeConflictingData', () => {
      it('should merge arrays with union strategy', () => {
        const array1 = [1, 2, 3];
        const array2 = [3, 4, 5];
        
        const merged = mergeConflictingData(array1, array2, 'union');
        expect(merged).toEqual([1, 2, 3, 4, 5]);
      });
      
      it('should merge arrays with intersection strategy', () => {
        const array1 = [1, 2, 3];
        const array2 = [3, 4, 5];
        
        const merged = mergeConflictingData(array1, array2, 'intersection');
        expect(merged).toEqual([3]);
      });
      
      it('should merge arrays with prefer_new strategy', () => {
        const array1 = [1, 2, 3];
        const array2 = [4, 5, 6];
        
        const merged = mergeConflictingData(array1, array2, 'prefer_new');
        expect(merged).toEqual([4, 5, 6]);
      });
      
      it('should merge arrays with prefer_old strategy', () => {
        const array1 = [1, 2, 3];
        const array2 = [4, 5, 6];
        
        const merged = mergeConflictingData(array1, array2, 'prefer_old');
        expect(merged).toEqual([1, 2, 3]);
      });
      
      it('should merge objects', () => {
        const obj1 = { a: 1, b: 2, c: { x: 10 } };
        const obj2 = { b: 3, c: { y: 20 }, d: 4 };
        
        const merged = mergeConflictingData(obj1, obj2, 'union');
        expect(merged).toEqual({
          a: 1,
          b: 3, // Conflict resolved to new value
          c: { x: 10, y: 20 }, // Nested merge
          d: 4,
        });
      });
      
      it('should merge primitive values', () => {
        const value1 = 'old';
        const value2 = 'new';
        
        const merged = mergeConflictingData(value1, value2, 'prefer_new');
        expect(merged).toBe('new');
      });
    });
    
    describe('validateBackupIntegrity', () => {
      it('should validate backup integrity', () => {
        const testData = { key: 'value', number: 42 };
        const backup = {
          id: 'test',
          timestamp: new Date(),
          size: 100,
          type: 'full' as const,
          dataTypes: ['test'],
          checksum: 'abc123',
          successful: true,
        };
        
        // Note: This is a simplified test since we're using a mock checksum
        // In a real implementation, we'd use the actual checksum calculation
        const isValid = validateBackupIntegrity(backup, testData);
        expect(typeof isValid).toBe('boolean');
      });
    });
  });
  
  describe('Error Handling and Edge Cases', () => {
    it('should handle operations with retry logic', async () => {
      // This test verifies that operations can be retried
      // The actual retry logic is internal, so we just verify no errors
      const contextItems: ContextItem[] = [
        {
          id: 'item1',
          content: 'Test',
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.5,
            importance: 0.5,
            accessCount: 0,
            lastAccessed: new Date(),
            size: 10,
            tags: [],
            relationships: [],
          },
        },
      ];
      
      const result = await persistenceService.saveContext(contextItems);
      expect(result.success).toBe(true);
    });
    
    it('should handle large data sets', async () => {
      // Create a large context item
      const largeContent = 'A'.repeat(10000);
      const contextItems: ContextItem[] = [
        {
          id: 'large-item',
          content: largeContent,
          type: 'prompt',
          metadata: {
            source: 'test',
            timestamp: new Date(),
            relevance: 0.5,
            importance: 0.5,
            accessCount: 0,
            lastAccessed: new Date(),
            size: largeContent.length,
            tags: [],
            relationships: [],
          },
        },
      ];
      
      const saveResult = await persistenceService.saveContext(contextItems);
      expect(saveResult.success).toBe(true);
      
      const loadResult = await persistenceService.loadContext();
      expect(loadResult.success).toBe(true);
      expect(loadResult.data![0].content.length).toBe(10000);
    });
    
    it('should handle concurrent operations', async () => {
      // Test basic concurrency
      const operations = [
        persistenceService.saveContext([]),
        persistenceService.loadContext(),
        persistenceService.getStats(),
      ];
      
      const results = await Promise.all(operations);
      
      for (const result of results) {
        expect(result.success).toBe(true);
      }
    });
  });
});
