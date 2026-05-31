# Message Queues Template

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

Provides comprehensive patterns for implementing message queue systems, message routing, dead letter queues, and message persistence. This template covers asynchronous messaging, queue management, and reliable message delivery for distributed systems.

## Context

Message queues are fundamental to building scalable, decoupled distributed systems. This template addresses queue management, message routing, delivery guarantees, dead letter handling, and monitoring while ensuring reliability, scalability, and fault tolerance in message-based architectures.

Authority boundary: a queue is transport, not the source of truth. Any
workflow that changes durable business, financial, clinical, legal, or
audit state needs a database/system-of-record write plus a transactional
outbox or equivalent atomic publication boundary. Queue messages should
be idempotent, replayable, observable, and tied back to the durable
record that owns the fact.

## Core Components

### Message Queue Manager

## Examples

```typescript
interface MessageQueueManager {
  // Queue management
  createQueue(config: QueueConfig): Promise<Queue>;
  deleteQueue(queueId: string): Promise<void>;
  getQueue(queueId: string): Promise<Queue>;
  listQueues(filters?: QueueFilters): Promise<Queue[]>;
  
  // Message operations
  sendMessage(queueId: string, message: Message): Promise<SendResult>;
  sendBatch(queueId: string, messages: Message[]): Promise<BatchSendResult>;
  receiveMessages(queueId: string, options?: ReceiveOptions): Promise<ReceivedMessage[]>;
  deleteMessage(queueId: string, receiptHandle: string): Promise<void>;
  
  // Queue metrics
  getQueueMetrics(queueId: string): Promise<QueueMetrics>;
}

interface Queue {
  id: string;
  name: string;
  type: QueueType;
  config: QueueConfig;
  status: QueueStatus;
  metrics: QueueMetrics;
  createdAt: Date;
  updatedAt: Date;
}


interface QueueConfig {
  name: string;
  type: QueueType;
  visibilityTimeout: number;
  messageRetentionPeriod: number;
  maxMessageSize: number;
  deliveryDelay: number;
  deadLetterQueue?: DeadLetterConfig;
  encryption?: EncryptionConfig;
  accessPolicy?: AccessPolicy;
}

enum QueueType {
  STANDARD = 'standard',
  FIFO = 'fifo',
  PRIORITY = 'priority',
  DELAY = 'delay'
}

interface Message {
  id?: string;
  body: any;
  attributes?: Record<string, string>;
  messageGroupId?: string;
  deduplicationId?: string;
  delaySeconds?: number;
  priority?: number;
}

interface ReceivedMessage extends Message {
  receiptHandle: string;
  receivedAt: Date;
  approximateReceiveCount: number;
  firstReceivedAt: Date;
}

interface QueueMetrics {
  approximateMessageCount: number;
  approximateNotVisibleCount: number;
  approximateDelayedCount: number;
  oldestMessageAge: number;
  messagesPerSecond: number;
}
```

### Message Router

```typescript
interface MessageRouter {
  // Routing configuration
  addRoute(route: RoutingRule): Promise<void>;
  removeRoute(routeId: string): Promise<void>;
  getRoutes(): Promise<RoutingRule[]>;
  
  // Message routing
  routeMessage(message: Message): Promise<RoutingResult>;
  broadcastMessage(message: Message, queues: string[]): Promise<BroadcastResult>;
  
  // Topic-based routing
  createTopic(config: TopicConfig): Promise<Topic>;
  subscribe(topicId: string, queueId: string, filter?: SubscriptionFilter): Promise<Subscription>;
  publish(topicId: string, message: Message): Promise<PublishResult>;
}

interface RoutingRule {
  id: string;
  name: string;
  condition: RoutingCondition;
  destination: RoutingDestination;
  priority: number;
  enabled: boolean;
}

interface RoutingCondition {
  type: ConditionType;
  field: string;
  operator: ConditionOperator;
  value: any;
  logic?: LogicOperator;
  children?: RoutingCondition[];
}

enum ConditionType {
  ATTRIBUTE = 'attribute',
  BODY_PATH = 'body_path',
  HEADER = 'header',
  MESSAGE_TYPE = 'message_type'
}

interface RoutingDestination {
  type: DestinationType;
  target: string;
  transformations?: MessageTransformation[];
}

enum DestinationType {
  QUEUE = 'queue',
  TOPIC = 'topic',
  FUNCTION = 'function',
  HTTP = 'http'
}
```

### Dead Letter Queue Handler

```typescript
interface DeadLetterQueueHandler {
  // DLQ management
  configureDLQ(sourceQueueId: string, config: DeadLetterConfig): Promise<void>;
  getDLQMessages(dlqId: string, options?: ReceiveOptions): Promise<DeadLetterMessage[]>;
  
  // Message recovery
  redriveMessage(dlqId: string, messageId: string): Promise<RedriveResult>;
  redriveBatch(dlqId: string, messageIds: string[]): Promise<BatchRedriveResult>;
  redriveAll(dlqId: string): Promise<RedriveAllResult>;
  
  // DLQ analysis
  analyzeDLQ(dlqId: string): Promise<DLQAnalysis>;
  getFailureReasons(dlqId: string): Promise<FailureReason[]>;
}

interface DeadLetterConfig {
  targetQueueId: string;
  maxReceiveCount: number;
  retentionPeriod: number;
  alertThreshold?: number;
}

interface DeadLetterMessage extends ReceivedMessage {
  originalQueueId: string;
  failureReason: string;
  failedAt: Date;
  receiveCount: number;
  originalAttributes: Record<string, string>;
}

interface DLQAnalysis {
  totalMessages: number;
  oldestMessage: Date;
  newestMessage: Date;
  failureReasonBreakdown: Record<string, number>;
  sourceQueueBreakdown: Record<string, number>;
  recommendations: string[];
}
```

### Message Persistence Manager

```typescript
interface MessagePersistenceManager {
  // Persistence operations
  persistMessage(message: Message, options?: PersistenceOptions): Promise<PersistedMessage>;
  retrieveMessage(messageId: string): Promise<PersistedMessage | null>;
  deletePersistedMessage(messageId: string): Promise<void>;
  
  // Batch operations
  persistBatch(messages: Message[]): Promise<BatchPersistResult>;
  retrieveBatch(messageIds: string[]): Promise<PersistedMessage[]>;
  
  // Cleanup
  cleanupExpiredMessages(): Promise<CleanupResult>;
  archiveMessages(criteria: ArchiveCriteria): Promise<ArchiveResult>;
}

interface PersistenceOptions {
  durability: DurabilityLevel;
  encryption: boolean;
  compression: boolean;
  ttl?: number;
}

enum DurabilityLevel {
  MEMORY = 'memory',
  DISK = 'disk',
  REPLICATED = 'replicated',
  DISTRIBUTED = 'distributed'
}

interface PersistedMessage {
  id: string;
  message: Message;
  persistedAt: Date;
  expiresAt?: Date;
  checksum: string;
  storageLocation: string;
}
```

## Implementation Patterns

### Queue Management Implementation

```typescript
class MessageQueueService implements MessageQueueManager {
  private queueStore: QueueStore;
  private messageStore: MessageStore;
  private metricsCollector: MetricsCollector;
  
  async createQueue(config: QueueConfig): Promise<Queue> {
    // Validate configuration
    this.validateQueueConfig(config);
    
    const queue: Queue = {
      id: generateQueueId(),
      name: config.name,
      type: config.type,
      config,
      status: QueueStatus.ACTIVE,
      metrics: this.initializeMetrics(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create dead letter queue if configured
    if (config.deadLetterQueue) {
      const dlq = await this.createDeadLetterQueue(queue.id, config.deadLetterQueue);
      queue.config.deadLetterQueue.targetQueueId = dlq.id;
    }
    
    await this.queueStore.save(queue);
    return queue;
  }
  
  async sendMessage(queueId: string, message: Message): Promise<SendResult> {
    const queue = await this.getQueue(queueId);
    
    // Validate message
    this.validateMessage(message, queue.config);
    
    // Generate message ID if not provided
    const messageId = message.id || generateMessageId();
    
    // Handle FIFO queue deduplication
    if (queue.type === QueueType.FIFO && message.deduplicationId) {
      const isDuplicate = await this.checkDuplication(queueId, message.deduplicationId);
      if (isDuplicate) {
        return { messageId, duplicate: true };
      }
    }
    
    // Calculate visibility time
    const visibleAt = new Date(Date.now() + (message.delaySeconds || queue.config.deliveryDelay) * 1000);
    
    // Store message
    const storedMessage: StoredMessage = {
      id: messageId,
      queueId,
      body: message.body,
      attributes: message.attributes || {},
      messageGroupId: message.messageGroupId,
      deduplicationId: message.deduplicationId,
      priority: message.priority || 0,
      visibleAt,
      createdAt: new Date(),
      receiveCount: 0
    };
    
    await this.messageStore.save(storedMessage);
    
    // Update metrics
    await this.metricsCollector.incrementMessageCount(queueId);
    
    return { messageId, duplicate: false };
  }
  
  async receiveMessages(queueId: string, options: ReceiveOptions = {}): Promise<ReceivedMessage[]> {
    const queue = await this.getQueue(queueId);
    const maxMessages = Math.min(options.maxMessages || 1, 10);
    const visibilityTimeout = options.visibilityTimeout || queue.config.visibilityTimeout;
    
    // Get visible messages
    const messages = await this.messageStore.getVisibleMessages(queueId, maxMessages, queue.type);
    
    // Update visibility for received messages
    const receivedMessages: ReceivedMessage[] = [];
    
    for (const message of messages) {
      const receiptHandle = generateReceiptHandle();
      const visibleAt = new Date(Date.now() + visibilityTimeout * 1000);
      
      await this.messageStore.updateVisibility(message.id, visibleAt, receiptHandle);
      
      receivedMessages.push({
        id: message.id,
        body: message.body,
        attributes: message.attributes,
        receiptHandle,
        receivedAt: new Date(),
        approximateReceiveCount: message.receiveCount + 1,
        firstReceivedAt: message.firstReceivedAt || new Date()
      });
    }
    
    return receivedMessages;
  }
  
  async deleteMessage(queueId: string, receiptHandle: string): Promise<void> {
    const message = await this.messageStore.getByReceiptHandle(queueId, receiptHandle);
    
    if (!message) {
      throw new MessageNotFoundError('Message not found or receipt handle expired');
    }
    
    await this.messageStore.delete(message.id);
    await this.metricsCollector.decrementMessageCount(queueId);
  }
}
```

### Message Routing Implementation

```typescript
class ContentBasedRouter implements MessageRouter {
  private routes: Map<string, RoutingRule> = new Map();
  private queueManager: MessageQueueManager;
  
  async routeMessage(message: Message): Promise<RoutingResult> {
    const matchedRoutes: RoutingRule[] = [];
    
    // Evaluate all routes
    for (const route of this.routes.values()) {
      if (!route.enabled) continue;
      
      if (this.evaluateCondition(message, route.condition)) {
        matchedRoutes.push(route);
      }
    }
    
    // Sort by priority
    matchedRoutes.sort((a, b) => b.priority - a.priority);
    
    // Route to destinations
    const results: DestinationResult[] = [];
    
    for (const route of matchedRoutes) {
      try {
        const transformedMessage = await this.applyTransformations(message, route.destination.transformations);
        const result = await this.sendToDestination(transformedMessage, route.destination);
        results.push({ routeId: route.id, success: true, result });
      } catch (error) {
        results.push({ routeId: route.id, success: false, error: error.message });
      }
    }
    
    return {
      messageId: message.id,
      matchedRoutes: matchedRoutes.map(r => r.id),
      results
    };
  }
  
  private evaluateCondition(message: Message, condition: RoutingCondition): boolean {
    const value = this.extractValue(message, condition);
    
    switch (condition.operator) {
      case ConditionOperator.EQUALS:
        return value === condition.value;
      case ConditionOperator.NOT_EQUALS:
        return value !== condition.value;
      case ConditionOperator.CONTAINS:
        return String(value).includes(condition.value);
      case ConditionOperator.STARTS_WITH:
        return String(value).startsWith(condition.value);
      case ConditionOperator.REGEX:
        return new RegExp(condition.value).test(String(value));
      case ConditionOperator.IN:
        return condition.value.includes(value);
      case ConditionOperator.GREATER_THAN:
        return value > condition.value;
      case ConditionOperator.LESS_THAN:
        return value < condition.value;
      default:
        return false;
    }
  }
  
  private extractValue(message: Message, condition: RoutingCondition): any {
    switch (condition.type) {
      case ConditionType.ATTRIBUTE:
        return message.attributes?.[condition.field];
      case ConditionType.BODY_PATH:
        return this.getNestedValue(message.body, condition.field);
      case ConditionType.HEADER:
        return message.attributes?.[`header.${condition.field}`];
      case ConditionType.MESSAGE_TYPE:
        return message.attributes?.messageType;
      default:
        return undefined;
    }
  }
  
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
```

### Dead Letter Queue Processing

```typescript
class DeadLetterQueueProcessor implements DeadLetterQueueHandler {
  private queueManager: MessageQueueManager;
  private alertService: AlertService;
  
  async configureDLQ(sourceQueueId: string, config: DeadLetterConfig): Promise<void> {
    // Create DLQ if it doesn't exist
    let dlq = await this.queueManager.getQueue(config.targetQueueId).catch(() => null);
    
    if (!dlq) {
      dlq = await this.queueManager.createQueue({
        name: `${sourceQueueId}-dlq`,
        type: QueueType.STANDARD,
        visibilityTimeout: 30,
        messageRetentionPeriod: config.retentionPeriod,
        maxMessageSize: 262144
      });
      config.targetQueueId = dlq.id;
    }
    
    // Update source queue with DLQ configuration
    await this.queueManager.updateQueue(sourceQueueId, {
      deadLetterQueue: config
    });
    
    // Set up alerting if threshold configured
    if (config.alertThreshold) {
      await this.setupDLQAlerts(dlq.id, config.alertThreshold);
    }
  }
  
  async moveToDeadLetter(message: ReceivedMessage, sourceQueueId: string, reason: string): Promise<void> {
    const sourceQueue = await this.queueManager.getQueue(sourceQueueId);
    const dlqConfig = sourceQueue.config.deadLetterQueue;
    
    if (!dlqConfig) {
      throw new Error('Dead letter queue not configured for source queue');
    }
    
    // Create DLQ message with metadata
    const dlqMessage: Message = {
      body: message.body,
      attributes: {
        ...message.attributes,
        'dlq.originalQueueId': sourceQueueId,
        'dlq.failureReason': reason,
        'dlq.failedAt': new Date().toISOString(),
        'dlq.receiveCount': message.approximateReceiveCount.toString(),
        'dlq.originalMessageId': message.id
      }
    };
    
    // Send to DLQ
    await this.queueManager.sendMessage(dlqConfig.targetQueueId, dlqMessage);
    
    // Delete from source queue
    await this.queueManager.deleteMessage(sourceQueueId, message.receiptHandle);
    
    // Check alert threshold
    await this.checkAlertThreshold(dlqConfig.targetQueueId);
  }
  
  async redriveMessage(dlqId: string, messageId: string): Promise<RedriveResult> {
    const messages = await this.queueManager.receiveMessages(dlqId, { maxMessages: 10 });
    const message = messages.find(m => m.id === messageId);
    
    if (!message) {
      throw new MessageNotFoundError('Message not found in DLQ');
    }
    
    const originalQueueId = message.attributes?.['dlq.originalQueueId'];
    if (!originalQueueId) {
      throw new Error('Original queue ID not found in message attributes');
    }
    
    // Create new message for original queue
    const redriveMessage: Message = {
      body: message.body,
      attributes: this.cleanDLQAttributes(message.attributes)
    };
    
    // Send to original queue
    const result = await this.queueManager.sendMessage(originalQueueId, redriveMessage);
    
    // Delete from DLQ
    await this.queueManager.deleteMessage(dlqId, message.receiptHandle);
    
    return {
      success: true,
      originalMessageId: messageId,
      newMessageId: result.messageId,
      targetQueueId: originalQueueId
    };
  }
  
  async analyzeDLQ(dlqId: string): Promise<DLQAnalysis> {
    const metrics = await this.queueManager.getQueueMetrics(dlqId);
    const sampleMessages = await this.queueManager.receiveMessages(dlqId, { maxMessages: 100 });
    
    const failureReasons: Record<string, number> = {};
    const sourceQueues: Record<string, number> = {};
    let oldestMessage: Date | null = null;
    let newestMessage: Date | null = null;
    
    for (const message of sampleMessages) {
      // Analyze failure reasons
      const reason = message.attributes?.['dlq.failureReason'] || 'unknown';
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
      
      // Analyze source queues
      const sourceQueue = message.attributes?.['dlq.originalQueueId'] || 'unknown';
      sourceQueues[sourceQueue] = (sourceQueues[sourceQueue] || 0) + 1;
      
      // Track message ages
      const failedAt = new Date(message.attributes?.['dlq.failedAt'] || message.receivedAt);
      if (!oldestMessage || failedAt < oldestMessage) oldestMessage = failedAt;
      if (!newestMessage || failedAt > newestMessage) newestMessage = failedAt;
    }
    
    return {
      totalMessages: metrics.approximateMessageCount,
      oldestMessage: oldestMessage || new Date(),
      newestMessage: newestMessage || new Date(),
      failureReasonBreakdown: failureReasons,
      sourceQueueBreakdown: sourceQueues,
      recommendations: this.generateRecommendations(failureReasons, metrics)
    };
  }
  
  private generateRecommendations(failureReasons: Record<string, number>, metrics: QueueMetrics): string[] {
    const recommendations: string[] = [];
    
    if (metrics.approximateMessageCount > 1000) {
      recommendations.push('Consider implementing automated redrive for recoverable errors');
    }
    
    if (failureReasons['timeout'] > 10) {
      recommendations.push('High timeout failures detected - consider increasing visibility timeout');
    }
    
    if (failureReasons['validation_error'] > 10) {
      recommendations.push('High validation errors - review message schema and producer validation');
    }
    
    return recommendations;
  }
}
```

## Integration Points

### Cloud Provider Integration

```typescript
interface CloudQueueIntegration {
  // AWS SQS
  createSQSQueue(config: SQSQueueConfig): Promise<SQSQueue>;
  sendToSQS(queueUrl: string, message: Message): Promise<SQSSendResult>;
  receiveFromSQS(queueUrl: string, options: SQSReceiveOptions): Promise<SQSMessage[]>;
  
  // Azure Service Bus
  createServiceBusQueue(config: ServiceBusConfig): Promise<ServiceBusQueue>;
  sendToServiceBus(queueName: string, message: Message): Promise<ServiceBusSendResult>;
  
  // Google Cloud Pub/Sub
  createPubSubTopic(config: PubSubConfig): Promise<PubSubTopic>;
  publishToPubSub(topicName: string, message: Message): Promise<PubSubPublishResult>;
}

class AWSQueueAdapter implements CloudQueueIntegration {
  private sqs: SQSClient;
  
  async sendToSQS(queueUrl: string, message: Message): Promise<SQSSendResult> {
    const command = new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(message.body),
      MessageAttributes: this.convertAttributes(message.attributes),
      MessageGroupId: message.messageGroupId,
      MessageDeduplicationId: message.deduplicationId,
      DelaySeconds: message.delaySeconds
    });
    
    const response = await this.sqs.send(command);
    
    return {
      messageId: response.MessageId,
      sequenceNumber: response.SequenceNumber
    };
  }
}
```

## Security Considerations

### Message Security

```typescript
const messageSecurityConfig = {
  // Encryption
  encryption: {
    enabled: true,
    algorithm: 'AES-256-GCM',
    keyRotationPeriod: 90 // days
  },
  
  // Access control
  accessControl: {
    requireAuthentication: true,
    allowedPrincipals: ['service-a', 'service-b'],
    permissions: {
      send: ['service-a'],
      receive: ['service-b'],
      delete: ['service-b'],
      admin: ['admin-service']
    }
  },
  
  // Message validation
  validation: {
    maxMessageSize: 262144, // 256 KB
    allowedContentTypes: ['application/json', 'application/xml'],
    schemaValidation: true
  }
};

class MessageEncryptionService {
  async encryptMessage(message: Message, keyId: string): Promise<EncryptedMessage> {
    const key = await this.keyManager.getKey(keyId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    const encrypted = Buffer.concat([
      cipher.update(JSON.stringify(message.body), 'utf8'),
      cipher.final()
    ]);
    
    const authTag = cipher.getAuthTag();
    
    return {
      ...message,
      body: {
        encrypted: encrypted.toString('base64'),
        iv: iv.toString('base64'),
        authTag: authTag.toString('base64'),
        keyId
      },
      attributes: {
        ...message.attributes,
        encrypted: 'true'
      }
    };
  }
}
```

## Compliance Requirements

### Message Audit Trail

- **Message Tracking**: Track all message lifecycle events
- **Retention Policies**: Implement configurable message retention
- **Access Logging**: Log all queue access and operations
- **Compliance Reporting**: Generate compliance reports for audits

## Testing Considerations

### Queue Testing

```typescript
describe('MessageQueueService', () => {
  it('should send and receive messages', async () => {
    const service = new MessageQueueService();
    const queue = await service.createQueue({ name: 'test-queue', type: QueueType.STANDARD });
    
    const message = { body: { test: 'data' } };
    const sendResult = await service.sendMessage(queue.id, message);
    
    expect(sendResult.messageId).toBeDefined();
    
    const received = await service.receiveMessages(queue.id);
    expect(received).toHaveLength(1);
    expect(received[0].body).toEqual(message.body);
  });
  
  it('should handle FIFO deduplication', async () => {
    const service = new MessageQueueService();
    const queue = await service.createQueue({ name: 'test-fifo', type: QueueType.FIFO });
    
    const message = { body: { test: 'data' }, deduplicationId: 'dedup-1', messageGroupId: 'group-1' };
    
    await service.sendMessage(queue.id, message);
    const result = await service.sendMessage(queue.id, message);
    
    expect(result.duplicate).toBe(true);
  });
});

describe('DeadLetterQueueProcessor', () => {
  it('should move failed messages to DLQ', async () => {
    const processor = new DeadLetterQueueProcessor();
    const message = createTestReceivedMessage({ approximateReceiveCount: 5 });
    
    await processor.moveToDeadLetter(message, 'source-queue', 'Processing failed');
    
    const dlqMessages = await queueManager.receiveMessages('source-queue-dlq');
    expect(dlqMessages).toHaveLength(1);
    expect(dlqMessages[0].attributes['dlq.failureReason']).toBe('Processing failed');
  });
});
```

This template provides comprehensive patterns for implementing message queue systems with routing, dead letter handling, and persistence capabilities.
