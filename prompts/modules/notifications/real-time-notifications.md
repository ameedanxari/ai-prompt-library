# Real-Time Notifications Template

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

This template provides comprehensive patterns for implementing real-time notification delivery including instant notifications, presence indicators, typing indicators, and read receipts. It enables immediate, responsive communication experiences that keep users informed and engaged in real-time.

## Context

Modern applications require instant notification delivery to provide responsive user experiences. This template addresses the challenges of delivering notifications with minimal latency, implementing presence systems to show user availability, providing typing indicators for real-time conversations, tracking and displaying read receipts, and scaling real-time systems to handle high volumes of concurrent connections.

## Core Components

### Real-Time Delivery Service

## Examples

```typescript
interface RealTimeDeliveryService {
  // Instant delivery
  deliverInstant(notification: InstantNotification): Promise<DeliveryResult>;
  deliverToChannel(channelId: string, notification: InstantNotification): Promise<DeliveryResult>;
  
  // Connection management
  getActiveConnections(userId: string): Promise<Connection[]>;
  broadcastToUser(userId: string, message: RealtimeMessage): Promise<void>;
  
  // Delivery tracking
  trackDelivery(notificationId: string, event: DeliveryEvent): Promise<void>;
  getDeliveryStatus(notificationId: string): Promise<RealtimeDeliveryStatus>;
}

interface InstantNotification {
  id: string;
  userId: string;
  type: NotificationType;
  content: NotificationContent;
  priority: DeliveryPriority;
  ttl?: number;
  requireAck?: boolean;
  fallbackChannels?: ChannelType[];
}

enum DeliveryPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  NORMAL = 'normal',
  LOW = 'low'
}

interface RealtimeMessage {
  type: MessageType;
  payload: unknown;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

enum MessageType {
  NOTIFICATION = 'notification',
  PRESENCE_UPDATE = 'presence_update',
  TYPING_INDICATOR = 'typing_indicator',
  READ_RECEIPT = 'read_receipt',
  DELIVERY_RECEIPT = 'delivery_receipt',
  SYSTEM = 'system'
}

interface RealtimeDeliveryStatus {
  notificationId: string;
  status: 'pending' | 'delivered' | 'read' | 'failed';
  deliveredAt?: Date;
  readAt?: Date;
  deliveryMethod: 'websocket' | 'push' | 'polling';
  latency?: number;
}

interface Connection {
  connectionId: string;
  userId: string;
  deviceId: string;
  platform: Platform;
  connectedAt: Date;
  lastActivity: Date;
  status: ConnectionStatus;
}

enum ConnectionStatus {
  CONNECTED = 'connected',
  IDLE = 'idle',
  DISCONNECTED = 'disconnected'
}
```

### Presence Service

```typescript
interface PresenceService {
  // Presence management
  updatePresence(userId: string, status: PresenceStatus): Promise<void>;
  getPresence(userId: string): Promise<UserPresence>;
  getPresenceMultiple(userIds: string[]): Promise<Map<string, UserPresence>>;
  
  // Presence subscriptions
  subscribeToPresence(userId: string, targetUserIds: string[]): Promise<Subscription>;
  unsubscribeFromPresence(userId: string, targetUserIds: string[]): Promise<void>;
  
  // Activity tracking
  updateActivity(userId: string, activity: UserActivity): Promise<void>;
  getLastActivity(userId: string): Promise<UserActivity>;
}

interface UserPresence {
  userId: string;
  status: PresenceStatus;
  statusMessage?: string;
  lastSeen: Date;
  currentActivity?: UserActivity;
  devices: DevicePresence[];
}

enum PresenceStatus {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  DO_NOT_DISTURB = 'do_not_disturb',
  OFFLINE = 'offline',
  INVISIBLE = 'invisible'
}

interface UserActivity {
  type: ActivityType;
  details?: string;
  startedAt: Date;
  location?: string;
}

enum ActivityType {
  ACTIVE = 'active',
  IDLE = 'idle',
  IN_MEETING = 'in_meeting',
  ON_CALL = 'on_call',
  PRESENTING = 'presenting',
  CUSTOM = 'custom'
}

interface DevicePresence {
  deviceId: string;
  platform: Platform;
  status: PresenceStatus;
  lastActive: Date;
}

interface PresenceUpdate {
  userId: string;
  previousStatus: PresenceStatus;
  newStatus: PresenceStatus;
  timestamp: Date;
  source: 'user' | 'system' | 'timeout';
}
```

### Typing Indicator Service

```typescript
interface TypingIndicatorService {
  // Typing state management
  startTyping(userId: string, conversationId: string): Promise<void>;
  stopTyping(userId: string, conversationId: string): Promise<void>;
  
  // Typing subscriptions
  subscribeToTyping(conversationId: string, callback: TypingCallback): Subscription;
  
  // Typing state queries
  getTypingUsers(conversationId: string): Promise<TypingUser[]>;
  isUserTyping(userId: string, conversationId: string): Promise<boolean>;
}

interface TypingUser {
  userId: string;
  conversationId: string;
  startedAt: Date;
  expiresAt: Date;
}

interface TypingEvent {
  type: 'started' | 'stopped' | 'expired';
  userId: string;
  conversationId: string;
  timestamp: Date;
}

type TypingCallback = (event: TypingEvent) => void;

interface TypingConfig {
  timeout: number; // Auto-expire typing after this many ms
  throttleInterval: number; // Minimum interval between typing updates
  maxTypingDuration: number; // Maximum typing duration before auto-stop
}
```

### Read Receipt Service

```typescript
interface ReadReceiptService {
  // Receipt management
  markAsDelivered(notificationId: string, userId: string): Promise<void>;
  markAsRead(notificationId: string, userId: string): Promise<void>;
  markMultipleAsRead(notificationIds: string[], userId: string): Promise<void>;
  
  // Receipt queries
  getReadStatus(notificationId: string): Promise<ReadStatus>;
  getReadReceipts(notificationId: string): Promise<ReadReceipt[]>;
  getUnreadCount(userId: string, conversationId?: string): Promise<number>;
  
  // Receipt subscriptions
  subscribeToReceipts(notificationIds: string[], callback: ReceiptCallback): Subscription;
}

interface ReadStatus {
  notificationId: string;
  totalRecipients: number;
  deliveredCount: number;
  readCount: number;
  receipts: ReadReceipt[];
}

interface ReadReceipt {
  notificationId: string;
  userId: string;
  deliveredAt?: Date;
  readAt?: Date;
  platform?: Platform;
  deviceId?: string;
}

interface ReceiptEvent {
  type: 'delivered' | 'read';
  notificationId: string;
  userId: string;
  timestamp: Date;
}

type ReceiptCallback = (event: ReceiptEvent) => void;

interface ReadReceiptConfig {
  enableDeliveryReceipts: boolean;
  enableReadReceipts: boolean;
  batchInterval: number; // Batch receipt updates
  privacyMode: 'full' | 'aggregate' | 'none';
}
```

### WebSocket Connection Manager

```typescript
interface WebSocketConnectionManager {
  // Connection lifecycle
  connect(userId: string, options?: ConnectionOptions): Promise<Connection>;
  disconnect(connectionId: string): Promise<void>;
  reconnect(connectionId: string): Promise<Connection>;
  
  // Connection state
  getConnection(connectionId: string): Promise<Connection | null>;
  getUserConnections(userId: string): Promise<Connection[]>;
  
  // Message handling
  sendMessage(connectionId: string, message: RealtimeMessage): Promise<void>;
  broadcastToUser(userId: string, message: RealtimeMessage): Promise<void>;
  broadcastToChannel(channelId: string, message: RealtimeMessage): Promise<void>;
  
  // Health monitoring
  ping(connectionId: string): Promise<number>;
  getConnectionHealth(connectionId: string): Promise<ConnectionHealth>;
}

interface ConnectionOptions {
  deviceId?: string;
  platform?: Platform;
  reconnectOnDisconnect?: boolean;
  heartbeatInterval?: number;
  maxReconnectAttempts?: number;
}

interface ConnectionHealth {
  connectionId: string;
  latency: number;
  packetsLost: number;
  uptime: number;
  lastHeartbeat: Date;
  status: 'healthy' | 'degraded' | 'unhealthy';
}

interface WebSocketConfig {
  url: string;
  protocols?: string[];
  heartbeatInterval: number;
  reconnectDelay: number;
  maxReconnectAttempts: number;
  messageQueueSize: number;
}
```

## Implementation Patterns

### Real-Time Notification Delivery Engine

```typescript
class RealTimeNotificationEngine {
  private connectionManager: WebSocketConnectionManager;
  private presenceService: PresenceService;
  private pushService: PushNotificationService;
  private deliveryTracker: DeliveryTracker;

  async deliverInstant(notification: InstantNotification): Promise<DeliveryResult> {
    const startTime = Date.now();
    
    // Get user's active connections
    const connections = await this.connectionManager.getUserConnections(notification.userId);
    const activeConnections = connections.filter(c => c.status === ConnectionStatus.CONNECTED);

    let delivered = false;
    let deliveryMethod: string = 'none';

    // Try WebSocket delivery first (lowest latency)
    if (activeConnections.length > 0) {
      try {
        await this.deliverViaWebSocket(notification, activeConnections);
        delivered = true;
        deliveryMethod = 'websocket';
      } catch (error) {
        console.error('WebSocket delivery failed:', error);
      }
    }

    // Fallback to push notification if WebSocket fails or user is offline
    if (!delivered && notification.fallbackChannels?.includes(ChannelType.PUSH)) {
      try {
        await this.deliverViaPush(notification);
        delivered = true;
        deliveryMethod = 'push';
      } catch (error) {
        console.error('Push delivery failed:', error);
      }
    }

    // Track delivery
    const latency = Date.now() - startTime;
    await this.deliveryTracker.trackDelivery(notification.id, {
      delivered,
      deliveryMethod,
      latency,
      timestamp: new Date()
    });

    return {
      notificationId: notification.id,
      delivered,
      deliveryMethod,
      latency
    };
  }

  private async deliverViaWebSocket(
    notification: InstantNotification,
    connections: Connection[]
  ): Promise<void> {
    const message: RealtimeMessage = {
      type: MessageType.NOTIFICATION,
      payload: notification,
      timestamp: new Date()
    };

    // Deliver to all active connections
    const deliveryPromises = connections.map(conn =>
      this.connectionManager.sendMessage(conn.connectionId, message)
    );

    await Promise.all(deliveryPromises);

    // Request acknowledgment if required
    if (notification.requireAck) {
      await this.waitForAcknowledgment(notification.id, notification.ttl || 30000);
    }
  }

  private async deliverViaPush(notification: InstantNotification): Promise<void> {
    await this.pushService.sendPush({
      userId: notification.userId,
      payload: {
        title: notification.content.title,
        body: notification.content.body,
        data: {
          notificationId: notification.id,
          type: notification.type
        }
      },
      priority: notification.priority === DeliveryPriority.CRITICAL ? 'high' : 'normal'
    });
  }

  private async waitForAcknowledgment(notificationId: string, timeout: number): Promise<boolean> {
    return new Promise((resolve) => {
      const timer = setTimeout(() => resolve(false), timeout);
      
      this.deliveryTracker.onAcknowledgment(notificationId, () => {
        clearTimeout(timer);
        resolve(true);
      });
    });
  }
}
```

### Presence Management System

```typescript
class PresenceManagementSystem {
  private redis: RedisClient;
  private pubsub: PubSubClient;
  private connectionManager: WebSocketConnectionManager;

  async updatePresence(userId: string, status: PresenceStatus): Promise<void> {
    const previousPresence = await this.getPresence(userId);
    
    // Update presence in Redis
    const presence: UserPresence = {
      userId,
      status,
      lastSeen: new Date(),
      devices: await this.getDevicePresences(userId)
    };

    await this.redis.hset(`presence:${userId}`, {
      status,
      lastSeen: presence.lastSeen.toISOString(),
      devices: JSON.stringify(presence.devices)
    });

    // Set TTL for automatic offline detection
    await this.redis.expire(`presence:${userId}`, 300); // 5 minutes

    // Publish presence update to subscribers
    if (previousPresence?.status !== status) {
      await this.publishPresenceUpdate({
        userId,
        previousStatus: previousPresence?.status || PresenceStatus.OFFLINE,
        newStatus: status,
        timestamp: new Date(),
        source: 'user'
      });
    }
  }

  async getPresence(userId: string): Promise<UserPresence | null> {
    const data = await this.redis.hgetall(`presence:${userId}`);
    
    if (!data || Object.keys(data).length === 0) {
      return {
        userId,
        status: PresenceStatus.OFFLINE,
        lastSeen: new Date(0),
        devices: []
      };
    }

    return {
      userId,
      status: data.status as PresenceStatus,
      statusMessage: data.statusMessage,
      lastSeen: new Date(data.lastSeen),
      devices: JSON.parse(data.devices || '[]')
    };
  }

  async subscribeToPresence(userId: string, targetUserIds: string[]): Promise<Subscription> {
    const channels = targetUserIds.map(id => `presence:updates:${id}`);
    
    const subscription = await this.pubsub.subscribe(channels, (message) => {
      const update = JSON.parse(message) as PresenceUpdate;
      this.notifySubscriber(userId, update);
    });

    // Store subscription for cleanup
    await this.storeSubscription(userId, targetUserIds);

    return subscription;
  }

  private async publishPresenceUpdate(update: PresenceUpdate): Promise<void> {
    await this.pubsub.publish(
      `presence:updates:${update.userId}`,
      JSON.stringify(update)
    );
  }

  private async notifySubscriber(subscriberId: string, update: PresenceUpdate): Promise<void> {
    const connections = await this.connectionManager.getUserConnections(subscriberId);
    
    const message: RealtimeMessage = {
      type: MessageType.PRESENCE_UPDATE,
      payload: update,
      timestamp: new Date()
    };

    for (const conn of connections) {
      await this.connectionManager.sendMessage(conn.connectionId, message);
    }
  }

  // Automatic presence management
  async handleConnectionEvent(event: ConnectionEvent): Promise<void> {
    switch (event.type) {
      case 'connected':
        await this.updatePresence(event.userId, PresenceStatus.ONLINE);
        break;
      case 'disconnected':
        // Check if user has other active connections
        const connections = await this.connectionManager.getUserConnections(event.userId);
        if (connections.length === 0) {
          await this.updatePresence(event.userId, PresenceStatus.OFFLINE);
        }
        break;
      case 'idle':
        await this.updatePresence(event.userId, PresenceStatus.AWAY);
        break;
    }
  }
}
```

### Typing Indicator Manager

```typescript
class TypingIndicatorManager {
  private redis: RedisClient;
  private pubsub: PubSubClient;
  private config: TypingConfig;

  constructor(config: TypingConfig) {
    this.config = config;
  }

  async startTyping(userId: string, conversationId: string): Promise<void> {
    const key = `typing:${conversationId}:${userId}`;
    const expiresAt = Date.now() + this.config.timeout;

    // Check throttle
    const lastUpdate = await this.redis.get(`typing:throttle:${userId}:${conversationId}`);
    if (lastUpdate && Date.now() - parseInt(lastUpdate) < this.config.throttleInterval) {
      return; // Throttled
    }

    // Set typing state with expiration
    await this.redis.setex(key, Math.ceil(this.config.timeout / 1000), expiresAt.toString());
    await this.redis.set(`typing:throttle:${userId}:${conversationId}`, Date.now().toString());

    // Publish typing event
    await this.publishTypingEvent({
      type: 'started',
      userId,
      conversationId,
      timestamp: new Date()
    });

    // Schedule auto-stop
    this.scheduleAutoStop(userId, conversationId);
  }

  async stopTyping(userId: string, conversationId: string): Promise<void> {
    const key = `typing:${conversationId}:${userId}`;
    
    // Remove typing state
    await this.redis.del(key);

    // Publish stop event
    await this.publishTypingEvent({
      type: 'stopped',
      userId,
      conversationId,
      timestamp: new Date()
    });
  }

  async getTypingUsers(conversationId: string): Promise<TypingUser[]> {
    const pattern = `typing:${conversationId}:*`;
    const keys = await this.redis.keys(pattern);
    
    const typingUsers: TypingUser[] = [];
    
    for (const key of keys) {
      const userId = key.split(':')[2];
      const expiresAt = await this.redis.get(key);
      
      if (expiresAt && parseInt(expiresAt) > Date.now()) {
        typingUsers.push({
          userId,
          conversationId,
          startedAt: new Date(parseInt(expiresAt) - this.config.timeout),
          expiresAt: new Date(parseInt(expiresAt))
        });
      }
    }

    return typingUsers;
  }

  subscribeToTyping(conversationId: string, callback: TypingCallback): Subscription {
    return this.pubsub.subscribe(`typing:${conversationId}`, (message) => {
      const event = JSON.parse(message) as TypingEvent;
      callback(event);
    });
  }

  private async publishTypingEvent(event: TypingEvent): Promise<void> {
    await this.pubsub.publish(
      `typing:${event.conversationId}`,
      JSON.stringify(event)
    );
  }

  private scheduleAutoStop(userId: string, conversationId: string): void {
    setTimeout(async () => {
      const key = `typing:${conversationId}:${userId}`;
      const exists = await this.redis.exists(key);
      
      if (exists) {
        await this.stopTyping(userId, conversationId);
        await this.publishTypingEvent({
          type: 'expired',
          userId,
          conversationId,
          timestamp: new Date()
        });
      }
    }, this.config.maxTypingDuration);
  }
}
```

### Read Receipt Tracker

```typescript
class ReadReceiptTracker {
  private redis: RedisClient;
  private pubsub: PubSubClient;
  private batchProcessor: BatchProcessor;

  async markAsDelivered(notificationId: string, userId: string): Promise<void> {
    const receipt: ReadReceipt = {
      notificationId,
      userId,
      deliveredAt: new Date()
    };

    // Store receipt
    await this.storeReceipt(receipt);

    // Publish delivery event
    await this.publishReceiptEvent({
      type: 'delivered',
      notificationId,
      userId,
      timestamp: receipt.deliveredAt
    });
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const receipt = await this.getReceipt(notificationId, userId);
    
    const updatedReceipt: ReadReceipt = {
      ...receipt,
      notificationId,
      userId,
      readAt: new Date()
    };

    // Store updated receipt
    await this.storeReceipt(updatedReceipt);

    // Publish read event
    await this.publishReceiptEvent({
      type: 'read',
      notificationId,
      userId,
      timestamp: updatedReceipt.readAt!
    });
  }

  async markMultipleAsRead(notificationIds: string[], userId: string): Promise<void> {
    // Batch process for efficiency
    await this.batchProcessor.process(notificationIds, async (id) => {
      await this.markAsRead(id, userId);
    });
  }

  async getReadStatus(notificationId: string): Promise<ReadStatus> {
    const receipts = await this.getReceipts(notificationId);
    const totalRecipients = await this.getTotalRecipients(notificationId);

    return {
      notificationId,
      totalRecipients,
      deliveredCount: receipts.filter(r => r.deliveredAt).length,
      readCount: receipts.filter(r => r.readAt).length,
      receipts
    };
  }

  async getUnreadCount(userId: string, conversationId?: string): Promise<number> {
    const key = conversationId 
      ? `unread:${userId}:${conversationId}`
      : `unread:${userId}:total`;
    
    const count = await this.redis.get(key);
    return parseInt(count || '0');
  }

  subscribeToReceipts(notificationIds: string[], callback: ReceiptCallback): Subscription {
    const channels = notificationIds.map(id => `receipts:${id}`);
    
    return this.pubsub.subscribe(channels, (message) => {
      const event = JSON.parse(message) as ReceiptEvent;
      callback(event);
    });
  }

  private async storeReceipt(receipt: ReadReceipt): Promise<void> {
    const key = `receipt:${receipt.notificationId}:${receipt.userId}`;
    await this.redis.hset(key, {
      deliveredAt: receipt.deliveredAt?.toISOString() || '',
      readAt: receipt.readAt?.toISOString() || ''
    });
  }

  private async publishReceiptEvent(event: ReceiptEvent): Promise<void> {
    await this.pubsub.publish(
      `receipts:${event.notificationId}`,
      JSON.stringify(event)
    );
  }
}
```

## Integration Points

### WebSocket Server Integration

```typescript
// WebSocket server setup with Socket.IO
interface WebSocketServerIntegration {
  // Server setup
  initialize(server: HttpServer): void;
  
  // Namespace management
  createNamespace(name: string, config: NamespaceConfig): Namespace;
  
  // Room management
  joinRoom(socketId: string, roomId: string): Promise<void>;
  leaveRoom(socketId: string, roomId: string): Promise<void>;
  
  // Broadcasting
  broadcastToRoom(roomId: string, event: string, data: unknown): void;
}

// Redis adapter for scaling
interface RedisAdapterConfig {
  host: string;
  port: number;
  password?: string;
  keyPrefix: string;
}
```

### Message Queue Integration

```typescript
// Async message processing
interface MessageQueueIntegration {
  // Queue operations
  enqueue(queue: string, message: QueueMessage): Promise<void>;
  
  // Processing
  process(queue: string, handler: MessageHandler): void;
  
  // Dead letter handling
  handleDeadLetter(message: QueueMessage): Promise<void>;
}
```

## Security Considerations

### Connection Security
- Use WSS (WebSocket Secure) for all connections
- Implement connection authentication
- Validate message origins
- Rate limit connections per user

### Data Protection
- Encrypt sensitive message content
- Implement message expiration
- Secure presence data
- Protect read receipt privacy

### Access Control
- Validate user permissions for channels
- Implement room-level access control
- Audit real-time message access
- Prevent unauthorized subscriptions

## Compliance Guidelines

### Privacy Compliance
- Allow users to disable read receipts
- Provide presence privacy controls
- Support invisible mode
- Respect user preferences

### Data Retention
- Implement message expiration
- Clean up stale presence data
- Archive real-time logs appropriately
- Support data deletion requests

## Testing Considerations

### Unit Testing

```typescript
describe('RealTimeNotificationEngine', () => {
  it('should deliver via WebSocket when user is connected', async () => {
    const engine = new RealTimeNotificationEngine();
    mockConnectionManager.getUserConnections.mockResolvedValue([mockConnection]);
    
    const result = await engine.deliverInstant(testNotification);
    
    expect(result.delivered).toBe(true);
    expect(result.deliveryMethod).toBe('websocket');
  });

  it('should fallback to push when WebSocket fails', async () => {
    const engine = new RealTimeNotificationEngine();
    mockConnectionManager.getUserConnections.mockResolvedValue([]);
    
    const notification = { ...testNotification, fallbackChannels: [ChannelType.PUSH] };
    const result = await engine.deliverInstant(notification);
    
    expect(result.deliveryMethod).toBe('push');
  });
});
```

### Integration Testing

```typescript
describe('Presence System Integration', () => {
  it('should update presence and notify subscribers', async () => {
    const presenceSystem = new PresenceManagementSystem();
    
    // Subscribe to presence updates
    const updates: PresenceUpdate[] = [];
    await presenceSystem.subscribeToPresence('subscriber1', ['user1']);
    
    // Update presence
    await presenceSystem.updatePresence('user1', PresenceStatus.ONLINE);
    
    // Verify update received
    await waitFor(() => {
      expect(updates).toContainEqual(
        expect.objectContaining({ userId: 'user1', newStatus: PresenceStatus.ONLINE })
      );
    });
  });
});
```

### Property-Based Testing

```typescript
describe('Real-Time Properties', () => {
  it('should always deliver to at least one channel', () => {
    fc.assert(fc.property(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        hasWebSocket: fc.boolean(),
        hasPush: fc.boolean()
      }),
      async (input) => {
        const engine = new RealTimeNotificationEngine();
        
        if (input.hasWebSocket) {
          mockConnectionManager.getUserConnections.mockResolvedValue([mockConnection]);
        } else {
          mockConnectionManager.getUserConnections.mockResolvedValue([]);
        }
        
        const notification = {
          ...testNotification,
          userId: input.userId,
          fallbackChannels: input.hasPush ? [ChannelType.PUSH] : []
        };
        
        const result = await engine.deliverInstant(notification);
        
        // Should attempt delivery if any channel is available
        if (input.hasWebSocket || input.hasPush) {
          expect(result.deliveryMethod).not.toBe('none');
        }
      }
    ));
  });
});
```
