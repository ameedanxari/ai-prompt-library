# Data Synchronization Template

## Purpose

Provides comprehensive patterns for implementing real-time sync, batch sync, conflict resolution, and data consistency mechanisms. This template covers bidirectional synchronization, offline-first patterns, and distributed data management for maintaining data coherence across systems.

## Context

Data synchronization is critical for distributed systems, mobile applications, and multi-system architectures where data must remain consistent across different data stores and clients. This template addresses real-time and batch synchronization strategies, conflict detection and resolution, and data consistency guarantees.

## Core Components

### Sync Manager

## Examples

```typescript
interface SyncManager {
  // Sync operations
  startSync(config: SyncConfig): Promise<SyncSession>;
  stopSync(sessionId: string): Promise<void>;
  getSyncStatus(sessionId: string): Promise<SyncStatus>;
  
  // Data operations
  pushChanges(changes: DataChange[]): Promise<PushResult>;
  pullChanges(since: SyncCursor): Promise<PullResult>;
  
  // Conflict handling
  resolveConflict(conflictId: string, resolution: ConflictResolution): Promise<void>;
  getPendingConflicts(): Promise<Conflict[]>;
}

interface SyncConfig {
  mode: SyncMode;
  direction: SyncDirection;
  entities: EntitySyncConfig[];
  conflictStrategy: ConflictStrategy;
  batchSize: number;
  retryPolicy: RetryPolicy;
}


enum SyncMode {
  REAL_TIME = 'real_time',
  BATCH = 'batch',
  HYBRID = 'hybrid'
}

enum SyncDirection {
  PUSH = 'push',
  PULL = 'pull',
  BIDIRECTIONAL = 'bidirectional'
}

interface DataChange {
  id: string;
  entityType: string;
  entityId: string;
  operation: ChangeOperation;
  data: any;
  timestamp: Date;
  version: number;
  checksum: string;
}

enum ChangeOperation {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

interface SyncStatus {
  sessionId: string;
  state: SyncState;
  progress: SyncProgress;
  lastSyncTime: Date;
  pendingChanges: number;
  conflicts: number;
}

enum SyncState {
  IDLE = 'idle',
  SYNCING = 'syncing',
  PAUSED = 'paused',
  ERROR = 'error'
}
```

### Conflict Resolver

```typescript
interface ConflictResolver {
  // Conflict detection
  detectConflicts(localChanges: DataChange[], remoteChanges: DataChange[]): Conflict[];
  
  // Resolution strategies
  resolveWithStrategy(conflict: Conflict, strategy: ConflictStrategy): ResolvedConflict;
  resolveManually(conflict: Conflict, resolution: ManualResolution): ResolvedConflict;
  
  // Conflict management
  getConflictHistory(entityId: string): Promise<ConflictHistory[]>;
  rollbackResolution(conflictId: string): Promise<void>;
}

interface Conflict {
  id: string;
  entityType: string;
  entityId: string;
  localChange: DataChange;
  remoteChange: DataChange;
  detectedAt: Date;
  status: ConflictStatus;
}

enum ConflictStatus {
  PENDING = 'pending',
  RESOLVED = 'resolved',
  ESCALATED = 'escalated'
}

enum ConflictStrategy {
  LAST_WRITE_WINS = 'last_write_wins',
  FIRST_WRITE_WINS = 'first_write_wins',
  SERVER_WINS = 'server_wins',
  CLIENT_WINS = 'client_wins',
  MERGE = 'merge',
  MANUAL = 'manual'
}

interface ResolvedConflict {
  conflictId: string;
  resolution: ConflictResolution;
  resultingData: any;
  resolvedAt: Date;
  resolvedBy: string;
}

interface ConflictResolution {
  strategy: ConflictStrategy;
  selectedVersion: 'local' | 'remote' | 'merged';
  mergedData?: any;
  reason?: string;
}
```

### Change Tracker

```typescript
interface ChangeTracker {
  // Change tracking
  trackChange(change: DataChange): Promise<void>;
  getChanges(since: SyncCursor, limit?: number): Promise<TrackedChange[]>;
  acknowledgeChanges(changeIds: string[]): Promise<void>;
  
  // Version management
  getVersion(entityType: string, entityId: string): Promise<number>;
  incrementVersion(entityType: string, entityId: string): Promise<number>;
  
  // Checksum validation
  calculateChecksum(data: any): string;
  validateChecksum(data: any, expectedChecksum: string): boolean;
}

interface TrackedChange {
  id: string;
  change: DataChange;
  status: ChangeStatus;
  attempts: number;
  lastAttempt?: Date;
  error?: string;
}

enum ChangeStatus {
  PENDING = 'pending',
  SYNCED = 'synced',
  FAILED = 'failed',
  CONFLICTED = 'conflicted'
}

interface SyncCursor {
  timestamp: Date;
  sequence: number;
  entityType?: string;
}
```

### Batch Sync Processor

```typescript
interface BatchSyncProcessor {
  // Batch operations
  createBatch(changes: DataChange[]): Promise<SyncBatch>;
  processBatch(batchId: string): Promise<BatchResult>;
  getBatchStatus(batchId: string): Promise<BatchStatus>;
  
  // Scheduling
  scheduleBatch(config: BatchScheduleConfig): Promise<ScheduledBatch>;
  cancelScheduledBatch(scheduleId: string): Promise<void>;
  
  // Recovery
  retryFailedBatch(batchId: string): Promise<BatchResult>;
  getFailedBatches(): Promise<SyncBatch[]>;
}

interface SyncBatch {
  id: string;
  changes: DataChange[];
  status: BatchStatus;
  createdAt: Date;
  processedAt?: Date;
  result?: BatchResult;
}

enum BatchStatus {
  CREATED = 'created',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  PARTIAL = 'partial',
  FAILED = 'failed'
}

interface BatchResult {
  batchId: string;
  totalChanges: number;
  successfulChanges: number;
  failedChanges: FailedChange[];
  conflicts: Conflict[];
  duration: number;
}

interface BatchScheduleConfig {
  cronExpression?: string;
  intervalMs?: number;
  maxBatchSize: number;
  priority: number;
}
```

## Implementation Patterns

### Real-Time Sync Implementation

```typescript
class RealTimeSyncManager implements SyncManager {
  private changeTracker: ChangeTracker;
  private conflictResolver: ConflictResolver;
  private websocket: WebSocketConnection;
  private localStore: LocalDataStore;
  
  async startSync(config: SyncConfig): Promise<SyncSession> {
    const session: SyncSession = {
      id: generateSessionId(),
      config,
      state: SyncState.SYNCING,
      startedAt: new Date()
    };
    
    // Connect to sync server
    await this.websocket.connect(config.serverUrl);
    
    // Subscribe to remote changes
    this.websocket.on('change', async (remoteChange: DataChange) => {
      await this.handleRemoteChange(remoteChange, config);
    });
    
    // Watch local changes
    this.localStore.onChange(async (localChange: DataChange) => {
      await this.handleLocalChange(localChange, config);
    });
    
    // Initial sync
    await this.performInitialSync(session);
    
    return session;
  }
  
  private async handleRemoteChange(remoteChange: DataChange, config: SyncConfig): Promise<void> {
    // Check for conflicts with pending local changes
    const pendingLocalChanges = await this.changeTracker.getChanges(
      { timestamp: new Date(0), sequence: 0 },
      100
    );
    
    const localChange = pendingLocalChanges.find(
      c => c.change.entityType === remoteChange.entityType && 
           c.change.entityId === remoteChange.entityId
    );
    
    if (localChange) {
      // Conflict detected
      const conflict = this.conflictResolver.detectConflicts(
        [localChange.change],
        [remoteChange]
      )[0];
      
      if (conflict) {
        const resolved = this.conflictResolver.resolveWithStrategy(conflict, config.conflictStrategy);
        await this.applyResolution(resolved);
        return;
      }
    }
    
    // Apply remote change
    await this.localStore.applyChange(remoteChange);
  }
  
  private async handleLocalChange(localChange: DataChange, config: SyncConfig): Promise<void> {
    // Track the change
    await this.changeTracker.trackChange(localChange);
    
    // Push to server
    try {
      await this.websocket.send('change', localChange);
      await this.changeTracker.acknowledgeChanges([localChange.id]);
    } catch (error) {
      // Will be retried on reconnection
      console.error('Failed to push change:', error);
    }
  }
  
  private async performInitialSync(session: SyncSession): Promise<void> {
    // Get last sync cursor
    const lastCursor = await this.getLastSyncCursor();
    
    // Pull all changes since last sync
    const remoteChanges = await this.pullChanges(lastCursor);
    
    // Get pending local changes
    const localChanges = await this.changeTracker.getChanges(lastCursor);
    
    // Detect and resolve conflicts
    const conflicts = this.conflictResolver.detectConflicts(
      localChanges.map(c => c.change),
      remoteChanges.changes
    );
    
    for (const conflict of conflicts) {
      const resolved = this.conflictResolver.resolveWithStrategy(
        conflict,
        session.config.conflictStrategy
      );
      await this.applyResolution(resolved);
    }
    
    // Apply non-conflicting remote changes
    const nonConflictingRemote = remoteChanges.changes.filter(
      rc => !conflicts.some(c => c.remoteChange.id === rc.id)
    );
    
    for (const change of nonConflictingRemote) {
      await this.localStore.applyChange(change);
    }
    
    // Push non-conflicting local changes
    const nonConflictingLocal = localChanges.filter(
      lc => !conflicts.some(c => c.localChange.id === lc.change.id)
    );
    
    await this.pushChanges(nonConflictingLocal.map(c => c.change));
  }
}
```

### Conflict Resolution Implementation

```typescript
class SmartConflictResolver implements ConflictResolver {
  detectConflicts(localChanges: DataChange[], remoteChanges: DataChange[]): Conflict[] {
    const conflicts: Conflict[] = [];
    
    for (const localChange of localChanges) {
      const matchingRemote = remoteChanges.find(
        rc => rc.entityType === localChange.entityType && 
              rc.entityId === localChange.entityId
      );
      
      if (matchingRemote && this.isConflicting(localChange, matchingRemote)) {
        conflicts.push({
          id: generateConflictId(),
          entityType: localChange.entityType,
          entityId: localChange.entityId,
          localChange,
          remoteChange: matchingRemote,
          detectedAt: new Date(),
          status: ConflictStatus.PENDING
        });
      }
    }
    
    return conflicts;
  }
  
  private isConflicting(local: DataChange, remote: DataChange): boolean {
    // Same entity modified by both
    if (local.operation === ChangeOperation.UPDATE && 
        remote.operation === ChangeOperation.UPDATE) {
      // Check if they modify the same fields
      return this.hasOverlappingFields(local.data, remote.data);
    }
    
    // Delete vs Update conflict
    if ((local.operation === ChangeOperation.DELETE && remote.operation === ChangeOperation.UPDATE) ||
        (local.operation === ChangeOperation.UPDATE && remote.operation === ChangeOperation.DELETE)) {
      return true;
    }
    
    return false;
  }
  
  resolveWithStrategy(conflict: Conflict, strategy: ConflictStrategy): ResolvedConflict {
    let resultingData: any;
    let selectedVersion: 'local' | 'remote' | 'merged';
    
    switch (strategy) {
      case ConflictStrategy.LAST_WRITE_WINS:
        if (conflict.localChange.timestamp > conflict.remoteChange.timestamp) {
          resultingData = conflict.localChange.data;
          selectedVersion = 'local';
        } else {
          resultingData = conflict.remoteChange.data;
          selectedVersion = 'remote';
        }
        break;
        
      case ConflictStrategy.SERVER_WINS:
        resultingData = conflict.remoteChange.data;
        selectedVersion = 'remote';
        break;
        
      case ConflictStrategy.CLIENT_WINS:
        resultingData = conflict.localChange.data;
        selectedVersion = 'local';
        break;
        
      case ConflictStrategy.MERGE:
        resultingData = this.mergeChanges(conflict.localChange, conflict.remoteChange);
        selectedVersion = 'merged';
        break;
        
      default:
        throw new Error(`Unsupported conflict strategy: ${strategy}`);
    }
    
    return {
      conflictId: conflict.id,
      resolution: { strategy, selectedVersion, mergedData: resultingData },
      resultingData,
      resolvedAt: new Date(),
      resolvedBy: 'system'
    };
  }
  
  private mergeChanges(local: DataChange, remote: DataChange): any {
    const merged = { ...remote.data };
    
    // Field-level merge: local changes take precedence for fields only modified locally
    const localOnlyFields = this.getLocalOnlyModifiedFields(local, remote);
    
    for (const field of localOnlyFields) {
      merged[field] = local.data[field];
    }
    
    return merged;
  }
  
  private getLocalOnlyModifiedFields(local: DataChange, remote: DataChange): string[] {
    const localFields = Object.keys(local.data);
    const remoteFields = Object.keys(remote.data);
    
    return localFields.filter(field => !remoteFields.includes(field));
  }
}
```

### Batch Sync Implementation

```typescript
class BatchSyncService implements BatchSyncProcessor {
  private batchStore: BatchStore;
  private syncManager: SyncManager;
  private scheduler: TaskScheduler;
  
  async createBatch(changes: DataChange[]): Promise<SyncBatch> {
    const batch: SyncBatch = {
      id: generateBatchId(),
      changes,
      status: BatchStatus.CREATED,
      createdAt: new Date()
    };
    
    await this.batchStore.save(batch);
    return batch;
  }
  
  async processBatch(batchId: string): Promise<BatchResult> {
    const batch = await this.batchStore.get(batchId);
    
    if (!batch) {
      throw new BatchNotFoundError(`Batch ${batchId} not found`);
    }
    
    batch.status = BatchStatus.PROCESSING;
    await this.batchStore.save(batch);
    
    const startTime = Date.now();
    const failedChanges: FailedChange[] = [];
    const conflicts: Conflict[] = [];
    let successCount = 0;
    
    // Process changes in chunks
    const chunks = this.chunkArray(batch.changes, 100);
    
    for (const chunk of chunks) {
      try {
        const result = await this.syncManager.pushChanges(chunk);
        
        successCount += result.successCount;
        failedChanges.push(...result.failures);
        conflicts.push(...result.conflicts);
        
      } catch (error) {
        // Mark all changes in chunk as failed
        for (const change of chunk) {
          failedChanges.push({
            changeId: change.id,
            error: error.message,
            retryable: this.isRetryableError(error)
          });
        }
      }
    }
    
    // Determine final status
    let status: BatchStatus;
    if (failedChanges.length === 0 && conflicts.length === 0) {
      status = BatchStatus.COMPLETED;
    } else if (successCount > 0) {
      status = BatchStatus.PARTIAL;
    } else {
      status = BatchStatus.FAILED;
    }
    
    const result: BatchResult = {
      batchId,
      totalChanges: batch.changes.length,
      successfulChanges: successCount,
      failedChanges,
      conflicts,
      duration: Date.now() - startTime
    };
    
    batch.status = status;
    batch.processedAt = new Date();
    batch.result = result;
    await this.batchStore.save(batch);
    
    return result;
  }
  
  async scheduleBatch(config: BatchScheduleConfig): Promise<ScheduledBatch> {
    const schedule: ScheduledBatch = {
      id: generateScheduleId(),
      config,
      status: 'active',
      createdAt: new Date()
    };
    
    if (config.cronExpression) {
      await this.scheduler.scheduleCron(schedule.id, config.cronExpression, async () => {
        await this.runScheduledBatch(schedule);
      });
    } else if (config.intervalMs) {
      await this.scheduler.scheduleInterval(schedule.id, config.intervalMs, async () => {
        await this.runScheduledBatch(schedule);
      });
    }
    
    return schedule;
  }
  
  private async runScheduledBatch(schedule: ScheduledBatch): Promise<void> {
    // Get pending changes
    const pendingChanges = await this.changeTracker.getChanges(
      { timestamp: new Date(0), sequence: 0 },
      schedule.config.maxBatchSize
    );
    
    if (pendingChanges.length === 0) {
      return;
    }
    
    // Create and process batch
    const batch = await this.createBatch(pendingChanges.map(c => c.change));
    await this.processBatch(batch.id);
  }
}
```

## Integration Points

### Database Integration

```typescript
interface DatabaseSyncIntegration {
  // Change Data Capture
  enableCDC(tables: string[]): Promise<void>;
  getCDCChanges(since: Date): Promise<CDCChange[]>;
  
  // Replication
  configureReplication(config: ReplicationConfig): Promise<void>;
  getReplicationLag(): Promise<number>;
}

class PostgresCDCIntegration implements DatabaseSyncIntegration {
  async enableCDC(tables: string[]): Promise<void> {
    // Create publication for logical replication
    await this.db.query(`
      CREATE PUBLICATION sync_publication FOR TABLE ${tables.join(', ')}
    `);
    
    // Create replication slot
    await this.db.query(`
      SELECT pg_create_logical_replication_slot('sync_slot', 'pgoutput')
    `);
  }
  
  async getCDCChanges(since: Date): Promise<CDCChange[]> {
    const changes = await this.db.query(`
      SELECT * FROM pg_logical_slot_get_changes('sync_slot', NULL, NULL)
      WHERE data->>'timestamp' > $1
    `, [since.toISOString()]);
    
    return changes.rows.map(row => this.parseCDCChange(row));
  }
}
```

### Cloud Storage Integration

```typescript
interface CloudStorageSyncIntegration {
  syncToCloud(localPath: string, remotePath: string): Promise<SyncResult>;
  syncFromCloud(remotePath: string, localPath: string): Promise<SyncResult>;
  watchCloudChanges(remotePath: string, handler: ChangeHandler): Promise<Subscription>;
}

class S3SyncIntegration implements CloudStorageSyncIntegration {
  async syncToCloud(localPath: string, remotePath: string): Promise<SyncResult> {
    const localFiles = await this.getLocalFiles(localPath);
    const remoteFiles = await this.getRemoteFiles(remotePath);
    
    const toUpload = this.getFilesToUpload(localFiles, remoteFiles);
    const toDelete = this.getFilesToDelete(localFiles, remoteFiles);
    
    for (const file of toUpload) {
      await this.s3.upload({
        Bucket: this.bucket,
        Key: `${remotePath}/${file.name}`,
        Body: file.content,
        Metadata: { checksum: file.checksum }
      });
    }
    
    for (const file of toDelete) {
      await this.s3.deleteObject({
        Bucket: this.bucket,
        Key: `${remotePath}/${file.name}`
      });
    }
    
    return {
      uploaded: toUpload.length,
      deleted: toDelete.length,
      unchanged: localFiles.length - toUpload.length
    };
  }
}
```

## Security Considerations

### Sync Security

```typescript
const syncSecurityConfig = {
  // Data encryption
  encryption: {
    inTransit: true,
    atRest: true,
    algorithm: 'AES-256-GCM'
  },
  
  // Authentication
  authentication: {
    required: true,
    tokenExpiry: 3600,
    refreshEnabled: true
  },
  
  // Authorization
  authorization: {
    entityLevelPermissions: true,
    fieldLevelPermissions: true
  },
  
  // Integrity
  integrity: {
    checksumValidation: true,
    signatureVerification: true
  }
};
```

## Compliance Requirements

### Data Sync Audit Trail

- **Change Tracking**: Log all data changes with timestamps and user info
- **Conflict History**: Maintain history of all conflicts and resolutions
- **Sync Sessions**: Track all sync sessions and their outcomes
- **Data Lineage**: Track data origin and transformation history

## Testing Considerations

### Sync Testing

```typescript
describe('RealTimeSyncManager', () => {
  it('should sync changes bidirectionally', async () => {
    const manager = new RealTimeSyncManager();
    
    await manager.startSync({
      mode: SyncMode.REAL_TIME,
      direction: SyncDirection.BIDIRECTIONAL,
      conflictStrategy: ConflictStrategy.LAST_WRITE_WINS
    });
    
    // Make local change
    await localStore.update('entity-1', { name: 'Updated' });
    
    // Wait for sync
    await waitForSync();
    
    // Verify remote has the change
    const remoteData = await remoteStore.get('entity-1');
    expect(remoteData.name).toBe('Updated');
  });
  
  it('should resolve conflicts using configured strategy', async () => {
    const resolver = new SmartConflictResolver();
    
    const conflict: Conflict = {
      id: 'conflict-1',
      entityType: 'user',
      entityId: 'user-1',
      localChange: { timestamp: new Date('2024-01-02'), data: { name: 'Local' } },
      remoteChange: { timestamp: new Date('2024-01-01'), data: { name: 'Remote' } },
      detectedAt: new Date(),
      status: ConflictStatus.PENDING
    };
    
    const resolved = resolver.resolveWithStrategy(conflict, ConflictStrategy.LAST_WRITE_WINS);
    
    expect(resolved.selectedVersion).toBe('local');
    expect(resolved.resultingData.name).toBe('Local');
  });
});

describe('BatchSyncProcessor', () => {
  it('should process batch and report results', async () => {
    const processor = new BatchSyncService();
    
    const changes = [
      { id: '1', entityType: 'user', entityId: 'u1', operation: ChangeOperation.UPDATE, data: {} },
      { id: '2', entityType: 'user', entityId: 'u2', operation: ChangeOperation.CREATE, data: {} }
    ];
    
    const batch = await processor.createBatch(changes);
    const result = await processor.processBatch(batch.id);
    
    expect(result.totalChanges).toBe(2);
    expect(result.successfulChanges).toBe(2);
  });
});
```

This template provides comprehensive patterns for implementing data synchronization with real-time and batch sync, conflict resolution, and data consistency mechanisms.
