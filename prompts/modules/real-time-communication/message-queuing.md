# Message Queuing Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

Provides comprehensive patterns for reliable message delivery and persistence in real-time communication systems. This template covers message queue management, delivery guarantees, persistence strategies, and scalable message processing for applications requiring guaranteed message delivery.

## Context

Message queuing is essential for real-time applications that need to ensure message delivery even when recipients are offline, handle high message volumes, and provide delivery guarantees. This template addresses challenges including message persistence, queue management, delivery ordering, and handling of failed deliveries.

## Core Components

### Message Queue Manager

## Examples

```typescript
interface MessageQueueManager {
  // Queue operations
  createQueue(config: QueueConfig): Promise<MessageQueue>;
  getQueue(queueId: string): Promise<MessageQueue>;
  deleteQueue(queueId: string): Promise<void>;
  
  // Message operations
  enqueue(queueId: string, message: QueueMessage): Promise<string>;
  dequeue(queueId: string, options?: DequeueOptions): Promise<QueueMessage | null>;
  peek(queueId: string, count?: number): Promise<QueueMessage[]>;
  
  // Queue monitoring
  getQueueStats(queueId: string): Promise<QueueStats>;
  getQueueHealth(queueId: string): Promise<HealthStatus>;
  purgeQueue(queueId: string, criteria?: PurgeCriteria): Promise<number>;
}

interface MessageQueue {
  id: string;
  name: string;
  type: QueueType;
  config: QueueConfig;
  stats: QueueStats;
  createdAt: Date;
  updatedAt: Date;
}

interface QueueMessage {
  id: string;
  queueId: string;
  payload: any;
  priority: MessagePriority;
  timestamp: Date;
  deliveryAttempts: number;
  maxDeliveryAttempts: number;
  visibilityTimeout: number;
  expiresAt?: Date;
  metadata: MessageMetadata;
}

interface QueueConfig {
  type: QueueType;
  maxSize: number;
  messageRetention: number;
  visibilityTimeout: number;
  deadLetterQueue?: string;
  deliveryDelay?: number;
  fifoEnabled: boolean;
  contentBasedDeduplication: boolean;
}
```

### Message Persistence Layer

```typescript
interface MessagePersistenceLayer {
  // Message storage
  storeMessage(message: QueueMessage): Promise<void>;
  retrieveMessage(messageId: string): Promise<QueueMessage | null>;
  updateMessage(messageId: string, updates: Partial<QueueMessage>): Promise<void>;
  deleteMessage(messageId: string): Promise<void>;
  
  // Batch operations
  storeMessages(messages: QueueMessage[]): Promise<void>;
  retrieveMessages(messageIds: string[]): Promise<QueueMessage[]>;
  deleteMessages(messageIds: string[]): Promise<void>;
  
  // Query operations
  getMessagesByQueue(queueId: string, options?: QueryOptions): Promise<QueueMessage[]>;
  getMessagesByStatus(status: MessageStatus, options?: QueryOptions): Promise<QueueMessage[]>;
  getExpiredMessages(beforeDate: Date): Promise<QueueMessage[]>;
}

interface MessageStore {
  // Storage backends
  configureStorage(config: StorageConfig): Promise<void>;
  
  // Indexing
  createIndex(indexConfig: IndexConfig): Promise<void>;
  optimizeStorage(): Promise<void>;
  
  // Backup and recovery
  backup(options: BackupOptions): Promise<BackupResult>;
  restore(backupId: string): Promise<void>;
}
```

### Delivery Guarantee System

```typescript
interface DeliveryGuaranteeSystem {
  // Delivery modes with delivery guarantees
  sendAtLeastOnce(message: QueueMessage): Promise<DeliveryResult>;
  sendAtMostOnce(message: QueueMessage): Promise<DeliveryResult>;
  sendExactlyOnce(message: QueueMessage): Promise<DeliveryResult>;
  
  // Acknowledgment handling
  acknowledgeMessage(messageId: string, consumerId: string): Promise<void>;
  negativeAcknowledge(messageId: string, consumerId: string, reason?: string): Promise<void>;
  
  // Retry management
  scheduleRetry(messageId: string, delay: number): Promise<void>;
  getRetrySchedule(messageId: string): Promise<RetrySchedule>;
  
  // Dead letter handling
  moveToDeadLetter(messageId: string, reason: string): Promise<void>;
  processDeadLetterQueue(queueId: string): Promise<ProcessingResult>;
  
  // Delivery guarantee configuration
  configureDeliveryGuarantee(queueId: string, guarantee: DeliveryGuaranteeType): Promise<void>;
  getDeliveryGuarantee(queueId: string): DeliveryGuaranteeType;
}

enum DeliveryGuaranteeType {
  AT_LEAST_ONCE = 'at_least_once',
  AT_MOST_ONCE = 'at_most_once', 
  EXACTLY_ONCE = 'exactly_once'
}

interface DeliveryResult {
  messageId: string;
  status: DeliveryStatus;
  deliveredAt?: Date;
  error?: string;
  retryAfter?: number;
  deliveryGuarantee: DeliveryGuaranteeType;
}
```

## Implementation Patterns

### Basic Message Queue Implementation

```typescript
// In-memory message queue with persistence
class MessageQueueService {
  private queues = new Map<string, InternalQueue>();
  private persistenceLayer: MessagePersistenceLayer;
  private deliveryService: MessageDeliveryService;
  
  async createQueue(config: QueueConfig): Promise<string> {
    const queueId = generateQueueId();
    const queue: InternalQueue = {
      id: queueId,
      config,
      messages: new PriorityQueue<QueueMessage>((a, b) => b.priority - a.priority),
      subscribers: new Set(),
      stats: {
        totalMessages: 0,
        pendingMessages: 0,
        deliveredMessages: 0,
        failedMessages: 0
      }
    };
    
    this.queues.set(queueId, queue);
    await this.persistenceLayer.createQueue(queueId, config);
    
    return queueId;
  }
  
  async enqueue(queueId: string, message: any, options: EnqueueOptions = {}): Promise<string> {
    const queue = this.queues.get(queueId);
    if (!queue) {
      throw new Error(`Queue ${queueId} not found`);
    }
    
    const queueMessage: QueueMessage = {
      id: generateMessageId(),
      queueId,
      payload: message,
      priority: options.priority || MessagePriority.NORMAL,
      timestamp: new Date(),
      deliveryAttempts: 0,
      maxDeliveryAttempts: options.maxRetries || 3,
      visibilityTimeout: options.visibilityTimeout || 30000,
      expiresAt: options.ttl ? new Date(Date.now() + options.ttl) : undefined,
      metadata: options.metadata || {}
    };
    
    // Store message persistently
    await this.persistenceLayer.storeMessage(queueMessage);
    
    // Add to in-memory queue
    queue.messages.enqueue(queueMessage);
    queue.stats.totalMessages++;
    queue.stats.pendingMessages++;
    
    // Notify subscribers
    this.notifySubscribers(queueId, queueMessage);
    
    return queueMessage.id;
  }
  
  async dequeue(queueId: string, options: DequeueOptions = {}): Promise<QueueMessage | null> {
    const queue = this.queues.get(queueId);
    if (!queue || queue.messages.isEmpty()) {
      return null;
    }
    
    const message = queue.messages.dequeue();
    if (!message) return null;
    
    // Check if message has expired
    if (message.expiresAt && message.expiresAt < new Date()) {
      await this.handleExpiredMessage(message);
      return this.dequeue(queueId, options); // Try next message
    }
    
    // Mark message as in-flight
    message.deliveryAttempts++;
    await this.persistenceLayer.updateMessage(message.id, {
      deliveryAttempts: message.deliveryAttempts,
      status: MessageStatus.IN_FLIGHT
    });
    
    // Set visibility timeout
    setTimeout(() => {
      this.handleVisibilityTimeout(message);
    }, message.visibilityTimeout);
    
    queue.stats.pendingMessages--;
    
    return message;
  }
}
```

### FIFO Queue Implementation

```typescript
// First-In-First-Out queue with ordering guarantees
class FIFOMessageQueue extends MessageQueueService {
  private sequenceNumbers = new Map<string, number>();
  private messageGroups = new Map<string, MessageGroup>();
  
  async enqueueFIFO(
    queueId: string, 
    message: any, 
    groupId?: string,
    options: EnqueueOptions = {}
  ): Promise<string> {
    const sequenceNumber = this.getNextSequenceNumber(queueId);
    
    const queueMessage: QueueMessage = {
      ...await this.createBaseMessage(queueId, message, options),
      sequenceNumber,
      groupId,
      fifoEnabled: true
    };
    
    if (groupId) {
      await this.handleMessageGroup(queueMessage, groupId);
    }
    
    return await this.enqueue(queueId, queueMessage);
  }
  
  private async handleMessageGroup(message: QueueMessage, groupId: string): Promise<void> {
    let group = this.messageGroups.get(groupId);
    
    if (!group) {
      group = {
        id: groupId,
        messages: [],
        processingMessage: null,
        lastSequenceNumber: 0
      };
      this.messageGroups.set(groupId, group);
    }
    
    // Ensure ordering within group
    if (message.sequenceNumber <= group.lastSequenceNumber) {
      throw new Error('Message sequence number must be greater than last processed');
    }
    
    group.messages.push(message);
    group.messages.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
  }
  
  async dequeueFIFO(queueId: string): Promise<QueueMessage | null> {
    // For FIFO queues, ensure strict ordering
    const availableGroups = Array.from(this.messageGroups.values())
      .filter(group => group.processingMessage === null && group.messages.length > 0);
    
    if (availableGroups.length === 0) {
      return await this.dequeue(queueId); // No groups, use regular dequeue
    }
    
    // Process oldest message from available groups
    const oldestGroup = availableGroups.reduce((oldest, current) => 
      current.messages[0].timestamp < oldest.messages[0].timestamp ? current : oldest
    );
    
    const message = oldestGroup.messages.shift()!;
    oldestGroup.processingMessage = message;
    
    return message;
  }
}
```

### Dead Letter Queue Handling

```typescript
// Dead letter queue for failed message handling
class DeadLetterQueueManager {
  private deadLetterQueues = new Map<string, DeadLetterQueue>();
  
  async createDeadLetterQueue(
    sourceQueueId: string, 
    config: DeadLetterConfig
  ): Promise<string> {
    const dlqId = `${sourceQueueId}-dlq`;
    
    const dlq: DeadLetterQueue = {
      id: dlqId,
      sourceQueueId,
      config,
      messages: [],
      stats: {
        totalMessages: 0,
        reprocessedMessages: 0,
        permanentFailures: 0
      }
    };
    
    this.deadLetterQueues.set(dlqId, dlq);
    return dlqId;
  }
  
  async moveToDeadLetter(
    messageId: string, 
    reason: string,
    originalQueue: string
  ): Promise<void> {
    const message = await this.persistenceLayer.retrieveMessage(messageId);
    if (!message) return;
    
    const dlqId = `${originalQueue}-dlq`;
    const dlq = this.deadLetterQueues.get(dlqId);
    
    if (!dlq) {
      throw new Error(`Dead letter queue ${dlqId} not found`);
    }
    
    const dlqMessage: DeadLetterMessage = {
      ...message,
      originalQueueId: originalQueue,
      failureReason: reason,
      movedToDLQAt: new Date(),
      reprocessAttempts: 0
    };
    
    dlq.messages.push(dlqMessage);
    dlq.stats.totalMessages++;
    
    await this.persistenceLayer.storeDeadLetterMessage(dlqMessage);
    await this.persistenceLayer.deleteMessage(messageId);
  }
  
  async reprocessDeadLetterMessages(
    dlqId: string, 
    criteria?: ReprocessCriteria
  ): Promise<ReprocessResult> {
    const dlq = this.deadLetterQueues.get(dlqId);
    if (!dlq) {
      throw new Error(`Dead letter queue ${dlqId} not found`);
    }
    
    const messagesToReprocess = dlq.messages.filter(msg => 
      this.shouldReprocess(msg, criteria)
    );
    
    const results: ReprocessResult = {
      attempted: messagesToReprocess.length,
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const message of messagesToReprocess) {
      try {
        await this.reprocessMessage(message);
        results.successful++;
        dlq.stats.reprocessedMessages++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          messageId: message.id,
          error: error.message
        });
      }
    }
    
    return results;
  }
}
```

## Integration Points

### Database Integration

```typescript
// Message persistence with database backends
interface DatabaseMessageStore {
  // SQL database implementation
  configureSQLStorage(config: SQLConfig): Promise<void>;
  
  // NoSQL database implementation
  configureNoSQLStorage(config: NoSQLConfig): Promise<void>;
  
  // Time-series database for message analytics
  configureTimeSeriesStorage(config: TimeSeriesConfig): Promise<void>;
}

// Example SQL schema
const messageTableSchema = `
  CREATE TABLE messages (
    id VARCHAR(255) PRIMARY KEY,
    queue_id VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_attempts INTEGER DEFAULT 0,
    max_delivery_attempts INTEGER DEFAULT 3,
    visibility_timeout INTEGER DEFAULT 30000,
    expires_at TIMESTAMP NULL,
    status VARCHAR(50) DEFAULT 'pending',
    metadata JSON,
    INDEX idx_queue_priority (queue_id, priority),
    INDEX idx_status_timestamp (status, timestamp),
    INDEX idx_expires_at (expires_at)
  );
`;
```

### Monitoring Integration

```typescript
// Message queue monitoring and metrics
interface MessageQueueMonitoring {
  // Metrics collection
  recordMessageEnqueued(queueId: string, message: QueueMessage): void;
  recordMessageDequeued(queueId: string, messageId: string): void;
  recordMessageDelivered(queueId: string, messageId: string, duration: number): void;
  recordMessageFailed(queueId: string, messageId: string, error: string): void;
  
  // Health checks
  checkQueueHealth(queueId: string): Promise<HealthCheckResult>;
  checkOverallHealth(): Promise<SystemHealthResult>;
  
  // Alerting
  configureAlerts(config: AlertConfig): Promise<void>;
  triggerAlert(alert: Alert): Promise<void>;
}

// Metrics dashboard data
interface QueueMetrics {
  queueId: string;
  messagesPerSecond: number;
  averageProcessingTime: number;
  errorRate: number;
  queueDepth: number;
  oldestMessage: Date;
  consumerCount: number;
  throughput: ThroughputMetrics;
}
```

## Security Considerations

### Message Encryption

```typescript
// Encrypted message queuing
class EncryptedMessageQueue extends MessageQueueService {
  private encryptionService: MessageEncryptionService;
  
  async enqueueEncrypted(
    queueId: string, 
    message: any, 
    encryptionKey: string,
    options: EnqueueOptions = {}
  ): Promise<string> {
    const encryptedPayload = await this.encryptionService.encrypt(
      JSON.stringify(message), 
      encryptionKey
    );
    
    const encryptedMessage = {
      encrypted: true,
      payload: encryptedPayload,
      algorithm: 'AES-256-GCM',
      keyId: this.encryptionService.getKeyId(encryptionKey)
    };
    
    return await this.enqueue(queueId, encryptedMessage, options);
  }
  
  async dequeueDecrypted(
    queueId: string, 
    decryptionKey: string
  ): Promise<any | null> {
    const encryptedMessage = await this.dequeue(queueId);
    if (!encryptedMessage) return null;
    
    if (encryptedMessage.payload.encrypted) {
      const decryptedPayload = await this.encryptionService.decrypt(
        encryptedMessage.payload.payload,
        decryptionKey
      );
      
      return JSON.parse(decryptedPayload);
    }
    
    return encryptedMessage.payload;
  }
}
```

### Access Control

```typescript
// Queue access control and permissions
interface QueueAccessControl {
  // Permission management
  grantPermission(queueId: string, userId: string, permission: QueuePermission): Promise<void>;
  revokePermission(queueId: string, userId: string, permission: QueuePermission): Promise<void>;
  checkPermission(queueId: string, userId: string, permission: QueuePermission): Promise<boolean>;
  
  // Role-based access
  assignRole(queueId: string, userId: string, role: QueueRole): Promise<void>;
  removeRole(queueId: string, userId: string, role: QueueRole): Promise<void>;
  
  // Audit logging
  logAccess(queueId: string, userId: string, action: string, result: string): Promise<void>;
  getAccessLog(queueId: string, options?: LogQueryOptions): Promise<AccessLogEntry[]>;
}

enum QueuePermission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin'
}

enum QueueRole {
  PRODUCER = 'producer',
  CONSUMER = 'consumer',
  ADMIN = 'admin'
}
```

## Compliance Requirements

### Data Retention

```typescript
// Automated data retention and cleanup
class MessageRetentionManager {
  async configureRetentionPolicy(
    queueId: string, 
    policy: RetentionPolicy
  ): Promise<void> {
    const retentionJob = {
      queueId,
      policy,
      schedule: policy.cleanupSchedule,
      lastRun: null
    };
    
    await this.scheduleRetentionJob(retentionJob);
  }
  
  async cleanupExpiredMessages(queueId: string): Promise<CleanupResult> {
    const policy = await this.getRetentionPolicy(queueId);
    const cutoffDate = new Date(Date.now() - policy.retentionPeriod);
    
    const expiredMessages = await this.persistenceLayer.getMessagesBefore(
      queueId, 
      cutoffDate
    );
    
    // Archive messages if required
    if (policy.archiveBeforeDelete) {
      await this.archiveMessages(expiredMessages);
    }
    
    // Delete expired messages
    const deletedCount = await this.persistenceLayer.deleteMessagesBefore(
      queueId, 
      cutoffDate
    );
    
    return {
      messagesDeleted: deletedCount,
      messagesArchived: policy.archiveBeforeDelete ? expiredMessages.length : 0,
      cleanupDate: new Date()
    };
  }
}
```

## Testing Considerations

### Unit Testing

```typescript
describe('MessageQueueService', () => {
  let queueService: MessageQueueService;
  let mockPersistence: jest.Mocked<MessagePersistenceLayer>;
  
  beforeEach(() => {
    mockPersistence = createMockPersistenceLayer();
    queueService = new MessageQueueService(mockPersistence);
  });
  
  it('should enqueue message successfully', async () => {
    const queueId = await queueService.createQueue({
      type: QueueType.STANDARD,
      maxSize: 1000,
      messageRetention: 86400000
    });
    
    const messageId = await queueService.enqueue(queueId, { test: 'data' });
    
    expect(messageId).toBeDefined();
    expect(mockPersistence.storeMessage).toHaveBeenCalled();
  });
  
  it('should maintain FIFO order', async () => {
    const queueId = await queueService.createQueue({
      type: QueueType.FIFO,
      fifoEnabled: true
    });
    
    await queueService.enqueue(queueId, { order: 1 });
    await queueService.enqueue(queueId, { order: 2 });
    await queueService.enqueue(queueId, { order: 3 });
    
    const first = await queueService.dequeue(queueId);
    const second = await queueService.dequeue(queueId);
    
    expect(first.payload.order).toBe(1);
    expect(second.payload.order).toBe(2);
  });
});
```

### Integration Testing

```typescript
describe('Message Queue Integration', () => {
  it('should handle message persistence across service restart', async () => {
    const queueService = new MessageQueueService();
    const queueId = await queueService.createQueue(testConfig);
    
    // Enqueue messages
    await queueService.enqueue(queueId, { data: 'test1' });
    await queueService.enqueue(queueId, { data: 'test2' });
    
    // Simulate service restart
    await queueService.shutdown();
    const newQueueService = new MessageQueueService();
    await newQueueService.initialize();
    
    // Verify messages are still available
    const message1 = await newQueueService.dequeue(queueId);
    const message2 = await newQueueService.dequeue(queueId);
    
    expect(message1.payload.data).toBe('test1');
    expect(message2.payload.data).toBe('test2');
  });
});
```

### Performance Testing

```typescript
describe('Message Queue Performance', () => {
  it('should handle high throughput', async () => {
    const queueService = new MessageQueueService();
    const queueId = await queueService.createQueue(testConfig);
    
    const messageCount = 10000;
    const startTime = Date.now();
    
    // Enqueue messages concurrently
    const enqueuePromises = Array.from({ length: messageCount }, (_, i) =>
      queueService.enqueue(queueId, { index: i })
    );
    
    await Promise.all(enqueuePromises);
    
    const enqueueTime = Date.now() - startTime;
    const throughput = messageCount / (enqueueTime / 1000);
    
    expect(throughput).toBeGreaterThan(1000); // Messages per second
  });
});
```
