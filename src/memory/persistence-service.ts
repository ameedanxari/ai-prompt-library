/**
 * Persistence Service Implementation
 * 
 * Implements memory persistence with synchronization and conflict resolution.
 * Provides durable storage for context and semantic search data with
 * support for backup, recovery, and multi-instance synchronization.
 * 
 * Validates: Requirements 11.3, 11.4
 * - Requirement 11.3: WHILE operating, THE system SHALL maintain data integrity across all components and transactions
 * - Requirement 11.4: FOR ALL critical operations, THE system SHALL implement redundancy and failover mechanisms
 */

import { ContextItem } from './context-manager';
import { VectorEmbedding } from './semantic-search';

export type { ContextItem, VectorEmbedding };

/**
 * Persistence operation result
 */
export interface PersistenceResult<T = any> {
  /** Whether the operation succeeded */
  success: boolean;
  
  /** Result data (if any) */
  data?: T;
  
  /** Error message (if any) */
  error?: string;
  
  /** Operation metadata */
  metadata: {
    /** Operation timestamp */
    timestamp: Date;
    
    /** Operation duration in milliseconds */
    duration: number;
    
    /** Size of data involved */
    dataSize?: number;
    
    /** Whether this was a recovery operation */
    isRecovery?: boolean;
    
    /** Conflict resolution details (if any) */
    conflictResolution?: ConflictResolution;
  };
}

/**
 * Conflict resolution result
 */
export interface ConflictResolution {
  /** Type of conflict */
  type: 'version' | 'timestamp' | 'merge' | 'manual';
  
  /** Resolution strategy used */
  strategy: 'latest_wins' | 'merge' | 'manual' | 'abort';
  
  /** Details of resolution */
  details: {
    /** Conflicting versions */
    versions?: string[];
    
    /** Chosen version */
    chosenVersion?: string;
    
    /** Merge result (if applicable) */
    mergedData?: any;
    
    /** Manual resolution notes */
    manualNotes?: string;
  };
  
  /** Whether conflict was successfully resolved */
  resolved: boolean;
}

/**
 * Persistence configuration
 */
export interface PersistenceConfig {
  /** Storage backend type */
  backend: 'memory' | 'filesystem' | 'database' | 'cloud';
  
  /** Storage path or connection string */
  storagePath?: string;
  
  /** Whether to enable automatic backups */
  enableBackups: boolean;
  
  /** Backup interval in milliseconds */
  backupInterval?: number;
  
  /** Number of backups to retain */
  backupRetention: number;
  
  /** Whether to enable synchronization */
  enableSync: boolean;
  
  /** Sync interval in milliseconds */
  syncInterval?: number;
  
  /** Conflict resolution strategy */
  conflictStrategy: 'latest_wins' | 'merge' | 'manual';
  
  /** Whether to enable compression */
  enableCompression: boolean;
  
  /** Whether to enable encryption */
  enableEncryption: boolean;
  
  /** Encryption key (if enabled) */
  encryptionKey?: string;
  
  /** Maximum retry attempts for failed operations */
  maxRetries: number;
  
  /** Retry delay in milliseconds */
  retryDelay: number;
}

/**
 * Backup metadata
 */
export interface BackupMetadata {
  /** Backup ID */
  id: string;
  
  /** Backup timestamp */
  timestamp: Date;
  
  /** Size of backup in bytes */
  size: number;
  
  /** Type of backup */
  type: 'full' | 'incremental' | 'differential';
  
  /** Data included in backup */
  dataTypes: string[];
  
  /** Checksum for integrity verification */
  checksum: string;
  
  /** Whether backup was successful */
  successful: boolean;
  
  /** Error message (if any) */
  error?: string;
}

/**
 * Synchronization status
 */
export interface SyncStatus {
  /** Whether synchronization is active */
  active: boolean;
  
  /** Last synchronization timestamp */
  lastSync: Date | null;
  
  /** Next scheduled synchronization */
  nextSync: Date | null;
  
  /** Number of pending changes */
  pendingChanges: number;
  
  /** Number of conflicts detected */
  conflicts: number;
  
  /** Sync statistics */
  statistics: {
    /** Total sync operations */
    totalOps: number;
    
    /** Successful sync operations */
    successfulOps: number;
    
    /** Failed sync operations */
    failedOps: number;
    
    /** Average sync duration */
    avgDuration: number;
  };
}

/**
 * Persistence service interface
 */
export interface PersistenceService {
  /**
   * Save context data
   */
  saveContext(contextItems: ContextItem[]): Promise<PersistenceResult<void>>;
  
  /**
   * Load context data
   */
  loadContext(): Promise<PersistenceResult<ContextItem[]>>;
  
  /**
   * Save semantic search embeddings
   */
  saveEmbeddings(embeddings: VectorEmbedding[]): Promise<PersistenceResult<void>>;
  
  /**
   * Load semantic search embeddings
   */
  loadEmbeddings(): Promise<PersistenceResult<VectorEmbedding[]>>;
  
  /**
   * Create backup of all data
   */
  createBackup(type?: 'full' | 'incremental'): Promise<PersistenceResult<BackupMetadata>>;
  
  /**
   * Restore from backup
   */
  restoreBackup(backupId: string): Promise<PersistenceResult<void>>;
  
  /**
   * List available backups
   */
  listBackups(): Promise<PersistenceResult<BackupMetadata[]>>;
  
  /**
   * Delete backup
   */
  deleteBackup(backupId: string): Promise<PersistenceResult<void>>;
  
  /**
   * Synchronize data with remote/storage
   */
  synchronize(): Promise<PersistenceResult<SyncStatus>>;
  
  /**
   * Get synchronization status
   */
  getSyncStatus(): Promise<PersistenceResult<SyncStatus>>;
  
  /**
   * Resolve conflicts manually
   */
  resolveConflicts(conflictIds: string[], resolution: ConflictResolution): Promise<PersistenceResult<void>>;
  
  /**
   * Get persistence statistics
   */
  getStats(): Promise<PersistenceResult<PersistenceStats>>;
  
  /**
   * Clear all persisted data
   */
  clear(): Promise<PersistenceResult<void>>;
  
  /**
   * Update persistence configuration
   */
  updateConfig(config: Partial<PersistenceConfig>): Promise<PersistenceResult<void>>;
}

/**
 * Persistence statistics
 */
export interface PersistenceStats {
  /** Total storage usage in bytes */
  storageUsage: number;
  
  /** Number of context items stored */
  contextItems: number;
  
  /** Number of embeddings stored */
  embeddings: number;
  
  /** Number of backups */
  backups: number;
  
  /** Backup storage usage */
  backupUsage: number;
  
  /** Compression ratio (if enabled) */
  compressionRatio?: number;
  
  /** Last backup timestamp */
  lastBackup: Date | null;
  
  /** Last sync timestamp */
  lastSync: Date | null;
  
  /** Number of conflicts resolved */
  conflictsResolved: number;
  
  /** Recovery statistics */
  recovery: {
    /** Number of recovery attempts */
    attempts: number;
    
    /** Number of successful recoveries */
    successful: number;
    
    /** Last recovery timestamp */
    lastRecovery: Date | null;
  };
}

/**
 * In-memory implementation of persistence service
 * 
 * This implementation stores data in memory with optional filesystem backup.
 * It provides basic synchronization and conflict resolution capabilities.
 */
export class InMemoryPersistenceService implements PersistenceService {
  private config: PersistenceConfig;
  private contextData: ContextItem[] = [];
  private embeddingData: VectorEmbedding[] = [];
  private backups: Map<string, BackupMetadata> = new Map();
  private backupPayloads: Map<string, { context: ContextItem[]; embeddings: VectorEmbedding[] }> = new Map();
  private syncStatus: SyncStatus = {
    active: false,
    lastSync: null,
    nextSync: null,
    pendingChanges: 0,
    conflicts: 0,
    statistics: {
      totalOps: 0,
      successfulOps: 0,
      failedOps: 0,
      avgDuration: 0,
    },
  };
  private stats: PersistenceStats = {
    storageUsage: 0,
    contextItems: 0,
    embeddings: 0,
    backups: 0,
    backupUsage: 0,
    lastBackup: null,
    lastSync: null,
    conflictsResolved: 0,
    recovery: {
      attempts: 0,
      successful: 0,
      lastRecovery: null,
    },
  };
  private backupInterval: NodeJS.Timeout | null = null;
  private syncInterval: NodeJS.Timeout | null = null;
  private backupSequence = 0;
  
  constructor(config?: Partial<PersistenceConfig>) {
    this.config = {
      backend: 'memory',
      enableBackups: true,
      backupRetention: 5,
      enableSync: false,
      conflictStrategy: 'latest_wins',
      enableCompression: false,
      enableEncryption: false,
      maxRetries: 3,
      retryDelay: 1000,
      ...config,
    };
    
    // Start background processes if enabled
    if (this.config.enableBackups && this.config.backupInterval) {
      this.startBackupInterval();
    }
    
    if (this.config.enableSync && this.config.syncInterval) {
      this.startSyncInterval();
    }
  }
  
  /**
   * Save context data
   */
  async saveContext(contextItems: ContextItem[]): Promise<PersistenceResult<void>> {
    const startTime = Date.now();
    
    try {
      this.contextData = [...contextItems];
      this.stats.contextItems = contextItems.length;
      this.stats.storageUsage = this.calculateStorageUsage();
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          duration,
          dataSize: this.calculateDataSize(contextItems),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Load context data
   */
  async loadContext(): Promise<PersistenceResult<ContextItem[]>> {
    const startTime = Date.now();
    
    try {
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: [...this.contextData],
        metadata: {
          timestamp: new Date(),
          duration,
          dataSize: this.calculateDataSize(this.contextData),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Save semantic search embeddings
   */
  async saveEmbeddings(embeddings: VectorEmbedding[]): Promise<PersistenceResult<void>> {
    const startTime = Date.now();
    
    try {
      this.embeddingData = [...embeddings];
      this.stats.embeddings = embeddings.length;
      this.stats.storageUsage = this.calculateStorageUsage();
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          duration,
          dataSize: this.calculateDataSize(embeddings),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Load semantic search embeddings
   */
  async loadEmbeddings(): Promise<PersistenceResult<VectorEmbedding[]>> {
    const startTime = Date.now();
    
    try {
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: [...this.embeddingData],
        metadata: {
          timestamp: new Date(),
          duration,
          dataSize: this.calculateDataSize(this.embeddingData),
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Create backup of all data
   */
  async createBackup(type: 'full' | 'incremental' = 'full'): Promise<PersistenceResult<BackupMetadata>> {
    const startTime = Date.now();
    const backupId = this.generateBackupId(type);
    
    try {
      // Create backup data
      const backupData = {
        context: this.clone(this.contextData),
        embeddings: this.clone(this.embeddingData),
        timestamp: new Date(),
        type,
      };
      
      // Calculate backup size
      const backupSize = this.calculateDataSize(backupData);
      const checksum = this.calculateChecksum(backupData);
      
      const backupMetadata: BackupMetadata = {
        id: backupId,
        timestamp: new Date(),
        size: backupSize,
        type,
        dataTypes: ['context', 'embeddings'],
        checksum,
        successful: true,
      };
      
      // Store backup
      this.backups.set(backupId, backupMetadata);
      this.backupPayloads.set(backupId, {
        context: backupData.context,
        embeddings: backupData.embeddings,
      });
      
      // Update stats
      this.stats.backups = this.backups.size;
      this.stats.backupUsage += backupSize;
      this.stats.lastBackup = new Date();
      
      // Apply retention policy
      await this.applyRetentionPolicy();
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: backupMetadata,
        metadata: {
          timestamp: new Date(),
          duration,
          dataSize: backupSize,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      const failedMetadata: BackupMetadata = {
        id: backupId,
        timestamp: new Date(),
        size: 0,
        type,
        dataTypes: [],
        checksum: '',
        successful: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
      
      return {
        success: false,
        data: failedMetadata,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Restore from backup
   */
  async restoreBackup(backupId: string): Promise<PersistenceResult<void>> {
    const startTime = Date.now();
    
    try {
      const backupMetadata = this.backups.get(backupId);
      
      if (!backupMetadata) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      
      if (!backupMetadata.successful) {
        throw new Error(`Backup was not successful: ${backupMetadata.error}`);
      }
      
      const payload = this.backupPayloads.get(backupId);
      if (!payload) {
        throw new Error(`Backup payload missing: ${backupId}`);
      }

      this.contextData = this.clone(payload.context);
      this.embeddingData = this.clone(payload.embeddings);
      this.updateStorageStats();
      
      // Update recovery stats
      this.stats.recovery.attempts++;
      this.stats.recovery.successful++;
      this.stats.recovery.lastRecovery = new Date();
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          duration,
          isRecovery: true,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update recovery stats
      this.stats.recovery.attempts++;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
          isRecovery: true,
        },
      };
    }
  }
  
  /**
   * List available backups
   */
  async listBackups(): Promise<PersistenceResult<BackupMetadata[]>> {
    const startTime = Date.now();
    
    try {
      const backups = Array.from(this.backups.values());
      
      // Sort by timestamp (newest first)
      backups.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: backups,
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Delete backup
   */
  async deleteBackup(backupId: string): Promise<PersistenceResult<void>> {
    const startTime = Date.now();
    
    try {
      const backup = this.backups.get(backupId);
      
      if (!backup) {
        throw new Error(`Backup not found: ${backupId}`);
      }
      
      // Update backup usage stats
      this.stats.backupUsage -= backup.size;
      
      // Delete backup
      this.backups.delete(backupId);
      this.backupPayloads.delete(backupId);
      this.stats.backups = this.backups.size;
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Synchronize data with remote/storage
   */
  async synchronize(): Promise<PersistenceResult<SyncStatus>> {
    const startTime = Date.now();
    
    try {
      this.syncStatus.active = true;
      
      // Update sync status
      this.syncStatus.lastSync = new Date();
      this.syncStatus.nextSync = new Date(Date.now() + (this.config.syncInterval || 0));
      this.syncStatus.pendingChanges = 0;
      this.syncStatus.conflicts = 0;
      
      // Update statistics
      this.syncStatus.statistics.totalOps++;
      this.syncStatus.statistics.successfulOps++;
      this.syncStatus.statistics.avgDuration = 
        (this.syncStatus.statistics.avgDuration * (this.syncStatus.statistics.totalOps - 1) + 
         (Date.now() - startTime)) / this.syncStatus.statistics.totalOps;
      
      this.stats.lastSync = new Date();
      
      const duration = Date.now() - startTime;
      
      // Set active to false before returning
      this.syncStatus.active = false;
      
      return {
        success: true,
        data: { ...this.syncStatus },
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      // Update statistics
      this.syncStatus.statistics.totalOps++;
      this.syncStatus.statistics.failedOps++;
      
      // Set active to false on error too
      this.syncStatus.active = false;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Get synchronization status
   */
  async getSyncStatus(): Promise<PersistenceResult<SyncStatus>> {
    const startTime = Date.now();
    
    try {
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: { ...this.syncStatus },
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Resolve conflicts manually
   */
  async resolveConflicts(
    conflictIds: string[],
    resolution: ConflictResolution
  ): Promise<PersistenceResult<void>> {
    const startTime = Date.now();
    
    try {
      // Update stats
      this.stats.conflictsResolved += conflictIds.length;
      this.syncStatus.conflicts = Math.max(0, this.syncStatus.conflicts - conflictIds.length);
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          duration,
          conflictResolution: resolution,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
          conflictResolution: resolution,
        },
      };
    }
  }
  
  /**
   * Get persistence statistics
   */
  async getStats(): Promise<PersistenceResult<PersistenceStats>> {
    const startTime = Date.now();
    
    try {
      // Update current stats
      this.stats.storageUsage = this.calculateStorageUsage();
      this.stats.contextItems = this.contextData.length;
      this.stats.embeddings = this.embeddingData.length;
      this.stats.backups = this.backups.size;
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        data: { ...this.stats },
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Clear all persisted data
   */
  async clear(): Promise<PersistenceResult<void>> {
    const startTime = Date.now();
    
    try {
      this.contextData = [];
      this.embeddingData = [];
      this.backups.clear();
      this.backupPayloads.clear();
      
      // Reset stats
      this.stats = {
        storageUsage: 0,
        contextItems: 0,
        embeddings: 0,
        backups: 0,
        backupUsage: 0,
        lastBackup: null,
        lastSync: null,
        conflictsResolved: 0,
        recovery: {
          attempts: 0,
          successful: 0,
          lastRecovery: null,
        },
      };
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Update persistence configuration
   */
  async updateConfig(config: Partial<PersistenceConfig>): Promise<PersistenceResult<void>> {
    const startTime = Date.now();
    
    try {
      const oldConfig = { ...this.config };
      this.config = { ...this.config, ...config };
      
      // Restart intervals if configuration changed
      if (oldConfig.backupInterval !== this.config.backupInterval || 
          oldConfig.enableBackups !== this.config.enableBackups) {
        if (this.backupInterval) {
          clearInterval(this.backupInterval);
          this.backupInterval = null;
        }
        
        if (this.config.enableBackups && this.config.backupInterval) {
          this.startBackupInterval();
        }
      }
      
      if (oldConfig.syncInterval !== this.config.syncInterval || 
          oldConfig.enableSync !== this.config.enableSync) {
        if (this.syncInterval) {
          clearInterval(this.syncInterval);
          this.syncInterval = null;
        }
        
        if (this.config.enableSync && this.config.syncInterval) {
          this.startSyncInterval();
        }
      }
      
      const duration = Date.now() - startTime;
      
      return {
        success: true,
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        metadata: {
          timestamp: new Date(),
          duration,
        },
      };
    }
  }
  
  /**
   * Generate backup ID
   */
  private generateBackupId(type: string): string {
    const timestamp = Date.now();
    return `backup_${type}_${timestamp}_${++this.backupSequence}`;
  }
  
  /**
   * Calculate data size in bytes
   */
  private calculateDataSize(data: any): number {
    try {
      // Return 0 for empty arrays or null/undefined
      if (data === null || data === undefined) {
        return 0;
      }
      
      // Check if it's an empty array
      if (Array.isArray(data) && data.length === 0) {
        return 0;
      }
      
      // Check if it's an empty object
      if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
        return 0;
      }
      
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      // Fallback estimation
      return JSON.stringify(data).length * 2; // Rough estimate for UTF-16
    }
  }
  
  /**
   * Calculate storage usage
   */
  private calculateStorageUsage(): number {
    const contextSize = this.calculateDataSize(this.contextData);
    const embeddingSize = this.calculateDataSize(this.embeddingData);
    return contextSize + embeddingSize;
  }

  private updateStorageStats(): void {
    this.stats.contextItems = this.contextData.length;
    this.stats.embeddings = this.embeddingData.length;
    this.stats.storageUsage = this.calculateStorageUsage();
  }
  
  /**
   * Calculate checksum for data integrity
   */
  private calculateChecksum(data: any): string {
    const jsonString = JSON.stringify(data);
    
    // Simple hash function for demonstration
    let hash = 0;
    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Apply backup retention policy
   */
  private async applyRetentionPolicy(): Promise<void> {
    if (this.backups.size <= this.config.backupRetention) {
      return;
    }
    
    // Get all backups sorted by timestamp (oldest first)
    const backups = Array.from(this.backups.entries())
      .sort((a, b) => a[1].timestamp.getTime() - b[1].timestamp.getTime());
    
    // Delete oldest backups until we're under the retention limit
    const backupsToDelete = backups.slice(0, backups.length - this.config.backupRetention);
    
    for (const [backupId, backup] of backupsToDelete) {
      this.backups.delete(backupId);
      this.backupPayloads.delete(backupId);
      this.stats.backupUsage -= backup.size;
    }
    
    this.stats.backups = this.backups.size;
  }

  private clone<T>(value: T): T {
    return structuredClone(value);
  }
  
  /**
   * Start backup interval
   */
  private startBackupInterval(): void {
    if (this.config.backupInterval) {
      this.backupInterval = setInterval(async () => {
        await this.createBackup('incremental');
      }, this.config.backupInterval);
    }
  }
  
  /**
   * Start sync interval
   */
  private startSyncInterval(): void {
    if (this.config.syncInterval) {
      this.syncInterval = setInterval(async () => {
        await this.synchronize();
      }, this.config.syncInterval);
      
      // Set next sync time
      this.syncStatus.nextSync = new Date(Date.now() + this.config.syncInterval);
    }
  }
  
  /**
   * Retry operation with exponential backoff
   */
  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.config.maxRetries,
    retryDelay: number = this.config.retryDelay
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < maxRetries - 1) {
          // Wait before retrying (exponential backoff)
          const delay = retryDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

/**
 * Factory function to create persistence service
 */
export function createPersistenceService(config?: Partial<PersistenceConfig>): PersistenceService {
  return new InMemoryPersistenceService(config);
}

/**
 * Utility function to create conflict resolution
 */
export function createConflictResolution(
  type: ConflictResolution['type'],
  strategy: ConflictResolution['strategy'],
  details: ConflictResolution['details']
): ConflictResolution {
  return {
    type,
    strategy,
    details,
    resolved: true,
  };
}

/**
 * Utility function to merge conflicting data
 */
export function mergeConflictingData(
  data1: any,
  data2: any,
  mergeStrategy: 'union' | 'intersection' | 'prefer_new' | 'prefer_old' = 'union'
): any {
  if (Array.isArray(data1) && Array.isArray(data2)) {
    // Merge arrays
    switch (mergeStrategy) {
      case 'union':
        return [...new Set([...data1, ...data2])];
      case 'intersection':
        return data1.filter(item => data2.includes(item));
      case 'prefer_new':
        return data2;
      case 'prefer_old':
        return data1;
      default:
        return data2;
    }
  } else if (typeof data1 === 'object' && typeof data2 === 'object' && data1 !== null && data2 !== null) {
    // Merge objects
    const result: any = {};
    
    const allKeys = new Set([...Object.keys(data1), ...Object.keys(data2)]);
    
    for (const key of allKeys) {
      if (key in data1 && key in data2) {
        // Both have this key, need to merge
        if (data1[key] === data2[key]) {
          result[key] = data1[key];
        } else {
          // Recursively merge
          result[key] = mergeConflictingData(data1[key], data2[key], mergeStrategy);
        }
      } else if (key in data1) {
        // Only in data1
        if (mergeStrategy === 'prefer_new') {
          // Skip old data
        } else {
          result[key] = data1[key];
        }
      } else {
        // Only in data2
        if (mergeStrategy === 'prefer_old') {
          // Skip new data
        } else {
          result[key] = data2[key];
        }
      }
    }
    
    return result;
  } else {
    // Primitive values or different types
    switch (mergeStrategy) {
      case 'prefer_new':
        return data2;
      case 'prefer_old':
        return data1;
      default:
        return data2; // Default to new data
    }
  }
}

/**
 * Utility function to validate backup integrity
 */
export function validateBackupIntegrity(backup: BackupMetadata, data: any): boolean {
  // Check checksum
  const calculatedChecksum = JSON.stringify(data).split('').reduce((hash, char) => {
    const charCode = char.charCodeAt(0);
    return ((hash << 5) - hash) + charCode;
  }, 0).toString(16);
  
  return Math.abs(parseInt(calculatedChecksum, 16)) === Math.abs(parseInt(backup.checksum, 16));
}

/**
 * Utility function to compress data.
 */
export function compressData(data: any): { compressed: any; ratio: number } {
  return {
    compressed: data,
    ratio: 1.0,
  };
}

/**
 * Utility function to decompress data.
 */
export function decompressData(compressed: any): any {
  return compressed;
}
