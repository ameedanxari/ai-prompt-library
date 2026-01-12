# Presence Systems Template

## Purpose

Provides comprehensive patterns for implementing online status and activity indicators in real-time applications. This template covers user presence detection, status management, activity tracking, and scalable presence distribution across different application types.

## Context

Presence systems are crucial for real-time applications to show user availability, activity status, and engagement levels. This template addresses challenges including accurate presence detection, efficient status distribution, handling network interruptions, and scaling presence information across large user bases.

## Core Components

### Presence Manager

## Examples

```typescript
interface PresenceManager {
  // Presence tracking
  setUserPresence(userId: string, status: PresenceStatus, metadata?: PresenceMetadata): Promise<void>;
  getUserPresence(userId: string): Promise<UserPresence | null>;
  getMultiplePresences(userIds: string[]): Promise<Map<string, UserPresence>>;
  
  // Presence subscriptions
  subscribeToPresence(userId: string, subscriberId: string): Promise<void>;
  unsubscribeFromPresence(userId: string, subscriberId: string): Promise<void>;
  getPresenceSubscribers(userId: string): Promise<string[]>;
  
  // Bulk operations
  setMultiplePresences(presences: Map<string, PresenceStatus>): Promise<void>;
  getPresencesForUsers(userIds: string[]): Promise<UserPresence[]>;
  
  // Cleanup and maintenance
  cleanupStalePresences(olderThan: Date): Promise<number>;
  refreshPresence(userId: string): Promise<void>;
}

interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeen: Date;
  lastActivity: Date;
  metadata: PresenceMetadata;
  connections: ConnectionInfo[];
  location?: GeographicLocation;
}

interface PresenceStatus {
  state: PresenceState;
  message?: string;
  availability: AvailabilityLevel;
  customStatus?: CustomStatus;
}

interface PresenceMetadata {
  device: DeviceInfo;
  application: string;
  version: string;
  capabilities: string[];
  timezone: string;
  language: string;
}

enum PresenceState {
  ONLINE = 'online',
  AWAY = 'away',
  BUSY = 'busy',
  INVISIBLE = 'invisible',
  OFFLINE = 'offline'
}
```

### Activity Tracker

```typescript
interface ActivityTracker {
  // Activity monitoring
  trackActivity(userId: string, activity: ActivityEvent): Promise<void>;
  getRecentActivity(userId: string, timeWindow: number): Promise<ActivityEvent[]>;
  getUserActivitySummary(userId: string, period: TimePeriod): Promise<ActivitySummary>;
  
  // Activity-based presence
  updatePresenceFromActivity(userId: string): Promise<void>;
  configureActivityRules(userId: string, rules: ActivityRule[]): Promise<void>;
  
  // Activity analytics
  getActivityPatterns(userId: string): Promise<ActivityPattern[]>;
  getEngagementMetrics(userId: string, period: TimePeriod): Promise<EngagementMetrics>;
}

interface ActivityEvent {
  userId: string;
  type: ActivityType;
  timestamp: Date;
  metadata: ActivityMetadata;
  source: ActivitySource;
  duration?: number;
}

interface ActivityRule {
  id: string;
  condition: ActivityCondition;
  action: PresenceAction;
  priority: number;
  enabled: boolean;
}

enum ActivityType {
  MOUSE_MOVE = 'mouse_move',
  KEYBOARD_INPUT = 'keyboard_input',
  CLICK = 'click',
  SCROLL = 'scroll',
  FOCUS_CHANGE = 'focus_change',
  MESSAGE_SENT = 'message_sent',
  FILE_UPLOAD = 'file_upload',
  API_CALL = 'api_call'
}
```

### Presence Distribution System

```typescript
interface PresenceDistributionSystem {
  // Distribution management
  distributePresenceUpdate(update: PresenceUpdate): Promise<void>;
  subscribeToPresenceUpdates(subscriberId: string, filter: PresenceFilter): Promise<void>;
  unsubscribeFromPresenceUpdates(subscriberId: string): Promise<void>;
  
  // Batch distribution
  distributeBatchUpdates(updates: PresenceUpdate[]): Promise<void>;
  getSubscribersForUser(userId: string): Promise<PresenceSubscriber[]>;
  
  // Filtering and routing
  applyPresenceFilters(update: PresenceUpdate, filters: PresenceFilter[]): boolean;
  routePresenceUpdate(update: PresenceUpdate): Promise<string[]>;
}

interface PresenceUpdate {
  userId: string;
  previousStatus: PresenceStatus;
  currentStatus: PresenceStatus;
  timestamp: Date;
  source: UpdateSource;
  metadata: UpdateMetadata;
}

interface PresenceSubscriber {
  subscriberId: string;
  filters: PresenceFilter[];
  deliveryMethod: DeliveryMethod;
  subscriptionDate: Date;
  lastDelivery: Date;
}
```

## Implementation Patterns

### Basic Presence Management

```typescript
// Core presence management implementation
class PresenceService {
  private presenceStore: PresenceStore;
  private activityTracker: ActivityTracker;
  private distributionSystem: PresenceDistributionSystem;
  private heartbeatManager: HeartbeatManager;
  
  async setUserPresence(
    userId: string, 
    status: PresenceStatus, 
    metadata?: PresenceMetadata
  ): Promise<void> {
    const currentPresence = await this.presenceStore.getPresence(userId);
    
    const newPresence: UserPresence = {
      userId,
      status,
      lastSeen: new Date(),
      lastActivity: new Date(),
      metadata: metadata || currentPresence?.metadata || this.getDefaultMetadata(),
      connections: await this.getActiveConnections(userId),
      location: await this.getUserLocation(userId)
    };
    
    // Store updated presence
    await this.presenceStore.setPresence(userId, newPresence);
    
    // Distribute update to subscribers
    const update: PresenceUpdate = {
      userId,
      previousStatus: currentPresence?.status || { state: PresenceState.OFFLINE, availability: AvailabilityLevel.UNAVAILABLE },
      currentStatus: status,
      timestamp: new Date(),
      source: UpdateSource.MANUAL,
      metadata: { triggeredBy: 'user_action' }
    };
    
    await this.distributionSystem.distributePresenceUpdate(update);
    
    // Start heartbeat monitoring if online
    if (status.state === PresenceState.ONLINE) {
      await this.heartbeatManager.startHeartbeat(userId);
    } else {
      await this.heartbeatManager.stopHeartbeat(userId);
    }
  }
  
  async trackUserActivity(userId: string, activity: ActivityEvent): Promise<void> {
    // Record activity
    await this.activityTracker.trackActivity(userId, activity);
    
    // Update last activity timestamp
    await this.presenceStore.updateLastActivity(userId, activity.timestamp);
    
    // Check if presence should be updated based on activity
    const currentPresence = await this.presenceStore.getPresence(userId);
    if (currentPresence && this.shouldUpdatePresenceFromActivity(currentPresence, activity)) {
      await this.updatePresenceFromActivity(userId, activity);
    }
  }
  
  private async updatePresenceFromActivity(userId: string, activity: ActivityEvent): Promise<void> {
    const rules = await this.getActivityRules(userId);
    const applicableRule = rules.find(rule => this.evaluateActivityRule(rule, activity));
    
    if (applicableRule) {
      const newStatus = this.applyPresenceAction(applicableRule.action);
      await this.setUserPresence(userId, newStatus);
    }
  }
}
```

### Heartbeat and Connection Monitoring

```typescript
// Heartbeat system for presence validation
class HeartbeatManager {
  private heartbeats = new Map<string, HeartbeatInfo>();
  private heartbeatInterval = 30000; // 30 seconds
  private timeoutThreshold = 90000; // 90 seconds
  
  async startHeartbeat(userId: string): Promise<void> {
    const heartbeatInfo: HeartbeatInfo = {
      userId,
      lastHeartbeat: new Date(),
      intervalId: setInterval(() => this.checkHeartbeat(userId), this.heartbeatInterval),
      missedHeartbeats: 0,
      connectionId: generateConnectionId()
    };
    
    this.heartbeats.set(userId, heartbeatInfo);
    
    // Send initial heartbeat request
    await this.sendHeartbeatRequest(userId);
  }
  
  async receiveHeartbeat(userId: string, connectionId: string): Promise<void> {
    const heartbeatInfo = this.heartbeats.get(userId);
    
    if (!heartbeatInfo || heartbeatInfo.connectionId !== connectionId) {
      // Stale or invalid heartbeat
      return;
    }
    
    heartbeatInfo.lastHeartbeat = new Date();
    heartbeatInfo.missedHeartbeats = 0;
    
    // Update user's last seen timestamp
    await this.presenceStore.updateLastSeen(userId, new Date());
  }
  
  private async checkHeartbeat(userId: string): Promise<void> {
    const heartbeatInfo = this.heartbeats.get(userId);
    if (!heartbeatInfo) return;
    
    const timeSinceLastHeartbeat = Date.now() - heartbeatInfo.lastHeartbeat.getTime();
    
    if (timeSinceLastHeartbeat > this.timeoutThreshold) {
      heartbeatInfo.missedHeartbeats++;
      
      if (heartbeatInfo.missedHeartbeats >= 3) {
        // User is considered offline
        await this.handleUserTimeout(userId);
      } else {
        // Send another heartbeat request
        await this.sendHeartbeatRequest(userId);
      }
    }
  }
  
  private async handleUserTimeout(userId: string): Promise<void> {
    // Set user as offline
    await this.presenceService.setUserPresence(userId, {
      state: PresenceState.OFFLINE,
      availability: AvailabilityLevel.UNAVAILABLE
    });
    
    // Stop heartbeat monitoring
    await this.stopHeartbeat(userId);
  }
}
```

### Scalable Presence Distribution

```typescript
// Efficient presence distribution for large user bases
class ScalablePresenceDistribution {
  private subscriptionManager: SubscriptionManager;
  private messageQueue: MessageQueue;
  private presenceCache: PresenceCache;
  
  async distributePresenceUpdate(update: PresenceUpdate): Promise<void> {
    // Get all subscribers for this user
    const subscribers = await this.subscriptionManager.getSubscribers(update.userId);
    
    if (subscribers.length === 0) return;
    
    // Group subscribers by delivery method for efficient batching
    const subscriberGroups = this.groupSubscribersByDeliveryMethod(subscribers);
    
    // Distribute to each group
    await Promise.all(
      Object.entries(subscriberGroups).map(([method, subs]) =>
        this.distributeToSubscriberGroup(update, method as DeliveryMethod, subs)
      )
    );
    
    // Update presence cache
    await this.presenceCache.updatePresence(update.userId, update.currentStatus);
  }
  
  private async distributeToSubscriberGroup(
    update: PresenceUpdate,
    method: DeliveryMethod,
    subscribers: PresenceSubscriber[]
  ): Promise<void> {
    switch (method) {
      case DeliveryMethod.WEBSOCKET:
        await this.distributeViaWebSocket(update, subscribers);
        break;
      case DeliveryMethod.WEBHOOK:
        await this.distributeViaWebhook(update, subscribers);
        break;
      case DeliveryMethod.MESSAGE_QUEUE:
        await this.distributeViaMessageQueue(update, subscribers);
        break;
      case DeliveryMethod.SERVER_SENT_EVENTS:
        await this.distributeViaSSE(update, subscribers);
        break;
    }
  }
  
  private async distributeViaWebSocket(
    update: PresenceUpdate,
    subscribers: PresenceSubscriber[]
  ): Promise<void> {
    const message = {
      type: 'presence_update',
      data: update,
      timestamp: new Date().toISOString()
    };
    
    // Send to all WebSocket connections
    const sendPromises = subscribers.map(subscriber =>
      this.webSocketManager.sendToConnection(subscriber.subscriberId, message)
    );
    
    await Promise.allSettled(sendPromises);
  }
  
  private async distributeViaMessageQueue(
    update: PresenceUpdate,
    subscribers: PresenceSubscriber[]
  ): Promise<void> {
    // Batch subscribers for efficient queue operations
    const batchSize = 100;
    const batches = this.chunkArray(subscribers, batchSize);
    
    for (const batch of batches) {
      const queueMessage = {
        type: 'presence_update_batch',
        update,
        subscribers: batch.map(s => s.subscriberId),
        timestamp: new Date()
      };
      
      await this.messageQueue.enqueue('presence_updates', queueMessage);
    }
  }
}
```

### Presence Filtering and Privacy

```typescript
// Privacy-aware presence filtering
class PresencePrivacyManager {
  private privacySettings: PrivacySettingsStore;
  
  async filterPresenceForSubscriber(
    presence: UserPresence,
    subscriberId: string
  ): Promise<FilteredPresence> {
    const privacySettings = await this.privacySettings.getSettings(presence.userId);
    const relationship = await this.getRelationship(presence.userId, subscriberId);
    
    const filteredPresence: FilteredPresence = {
      userId: presence.userId,
      status: this.filterStatus(presence.status, privacySettings, relationship),
      lastSeen: this.filterLastSeen(presence.lastSeen, privacySettings, relationship),
      metadata: this.filterMetadata(presence.metadata, privacySettings, relationship)
    };
    
    return filteredPresence;
  }
  
  private filterStatus(
    status: PresenceStatus,
    settings: PrivacySettings,
    relationship: UserRelationship
  ): PresenceStatus {
    // Apply privacy rules based on relationship and settings
    if (settings.hideStatusFrom.includes(relationship)) {
      return {
        state: PresenceState.INVISIBLE,
        availability: AvailabilityLevel.UNKNOWN
      };
    }
    
    if (settings.hideCustomStatusFrom.includes(relationship)) {
      return {
        ...status,
        message: undefined,
        customStatus: undefined
      };
    }
    
    return status;
  }
  
  private filterLastSeen(
    lastSeen: Date,
    settings: PrivacySettings,
    relationship: UserRelationship
  ): Date | undefined {
    if (settings.hideLastSeenFrom.includes(relationship)) {
      return undefined;
    }
    
    // Apply time granularity based on relationship
    if (relationship === UserRelationship.STRANGER) {
      // Round to nearest hour for strangers
      const rounded = new Date(lastSeen);
      rounded.setMinutes(0, 0, 0);
      return rounded;
    }
    
    return lastSeen;
  }
}
```

## Integration Points

### Database Integration

```typescript
// Presence data persistence
interface PresenceStore {
  // Basic operations
  setPresence(userId: string, presence: UserPresence): Promise<void>;
  getPresence(userId: string): Promise<UserPresence | null>;
  deletePresence(userId: string): Promise<void>;
  
  // Batch operations
  setMultiplePresences(presences: Map<string, UserPresence>): Promise<void>;
  getMultiplePresences(userIds: string[]): Promise<Map<string, UserPresence>>;
  
  // Query operations
  getPresencesByStatus(status: PresenceState): Promise<UserPresence[]>;
  getStalePresences(olderThan: Date): Promise<UserPresence[]>;
  getActiveUsers(timeWindow: number): Promise<string[]>;
}

// Redis-based presence store implementation
class RedisPresenceStore implements PresenceStore {
  private redis: Redis;
  private keyPrefix = 'presence:';
  private ttl = 3600; // 1 hour TTL
  
  async setPresence(userId: string, presence: UserPresence): Promise<void> {
    const key = `${this.keyPrefix}${userId}`;
    const data = JSON.stringify(presence);
    
    await this.redis.setex(key, this.ttl, data);
    
    // Also maintain a sorted set for efficient queries
    await this.redis.zadd(
      'presence:by_last_seen',
      presence.lastSeen.getTime(),
      userId
    );
  }
  
  async getPresence(userId: string): Promise<UserPresence | null> {
    const key = `${this.keyPrefix}${userId}`;
    const data = await this.redis.get(key);
    
    if (!data) return null;
    
    return JSON.parse(data);
  }
  
  async getStalePresences(olderThan: Date): Promise<UserPresence[]> {
    const userIds = await this.redis.zrangebyscore(
      'presence:by_last_seen',
      0,
      olderThan.getTime()
    );
    
    if (userIds.length === 0) return [];
    
    const presences = await this.getMultiplePresences(userIds);
    return Array.from(presences.values());
  }
}
```

### Real-time Communication Integration

```typescript
// Integration with WebSocket and messaging systems
class PresenceWebSocketHandler {
  private presenceService: PresenceService;
  private webSocketManager: WebSocketManager;
  
  async handleConnection(connectionId: string, userId: string): Promise<void> {
    // Set user as online when they connect
    await this.presenceService.setUserPresence(userId, {
      state: PresenceState.ONLINE,
      availability: AvailabilityLevel.AVAILABLE
    });
    
    // Subscribe to presence updates for user's contacts
    const contacts = await this.getUserContacts(userId);
    for (const contactId of contacts) {
      await this.presenceService.subscribeToPresence(contactId, userId);
    }
    
    // Send current presence status of contacts
    const contactPresences = await this.presenceService.getMultiplePresences(contacts);
    await this.webSocketManager.sendToConnection(connectionId, {
      type: 'initial_presences',
      data: Object.fromEntries(contactPresences)
    });
  }
  
  async handleDisconnection(connectionId: string, userId: string): Promise<void> {
    // Check if user has other active connections
    const activeConnections = await this.getActiveConnections(userId);
    
    if (activeConnections.length === 0) {
      // Set user as offline if no other connections
      await this.presenceService.setUserPresence(userId, {
        state: PresenceState.OFFLINE,
        availability: AvailabilityLevel.UNAVAILABLE
      });
    }
    
    // Unsubscribe from presence updates
    const contacts = await this.getUserContacts(userId);
    for (const contactId of contacts) {
      await this.presenceService.unsubscribeFromPresence(contactId, userId);
    }
  }
  
  async handlePresenceUpdate(connectionId: string, userId: string, update: any): Promise<void> {
    const status: PresenceStatus = {
      state: update.state,
      message: update.message,
      availability: update.availability,
      customStatus: update.customStatus
    };
    
    await this.presenceService.setUserPresence(userId, status);
  }
}
```

## Security Considerations

### Privacy Controls

```typescript
// Comprehensive privacy settings for presence
interface PresencePrivacySettings {
  // Visibility controls
  visibleTo: VisibilityLevel;
  hiddenFrom: string[]; // User IDs
  customVisibilityRules: VisibilityRule[];
  
  // Status sharing
  shareOnlineStatus: boolean;
  shareLastSeen: boolean;
  shareActivity: boolean;
  shareLocation: boolean;
  
  // Time-based controls
  hideAfterInactivity: number; // Minutes
  showApproximateTime: boolean;
  
  // Activity controls
  trackActivity: boolean;
  shareTypingIndicators: boolean;
  shareReadReceipts: boolean;
}

enum VisibilityLevel {
  EVERYONE = 'everyone',
  CONTACTS = 'contacts',
  FRIENDS = 'friends',
  NOBODY = 'nobody',
  CUSTOM = 'custom'
}
```

### Data Protection

```typescript
// GDPR-compliant presence data handling
class PresenceDataProtection {
  async anonymizePresenceData(userId: string): Promise<void> {
    // Remove personally identifiable information
    const presence = await this.presenceStore.getPresence(userId);
    if (!presence) return;
    
    const anonymizedPresence = {
      ...presence,
      metadata: {
        device: { type: 'unknown', os: 'unknown' },
        location: undefined,
        timezone: 'UTC',
        language: 'en'
      }
    };
    
    await this.presenceStore.setPresence(userId, anonymizedPresence);
  }
  
  async deletePresenceData(userId: string): Promise<void> {
    // Delete all presence-related data
    await this.presenceStore.deletePresence(userId);
    await this.activityTracker.deleteUserActivity(userId);
    await this.subscriptionManager.removeAllSubscriptions(userId);
    
    // Remove from all subscriber lists
    await this.subscriptionManager.removeFromAllSubscriptions(userId);
  }
  
  async exportPresenceData(userId: string): Promise<PresenceDataExport> {
    const presence = await this.presenceStore.getPresence(userId);
    const activity = await this.activityTracker.getUserActivitySummary(userId, TimePeriod.ALL_TIME);
    const subscriptions = await this.subscriptionManager.getUserSubscriptions(userId);
    
    return {
      presence,
      activity,
      subscriptions,
      exportDate: new Date(),
      format: 'JSON'
    };
  }
}
```

## Compliance Requirements

### Data Retention

```typescript
// Automated presence data cleanup
class PresenceDataRetention {
  async configureRetentionPolicy(policy: RetentionPolicy): Promise<void> {
    this.retentionPolicy = policy;
    
    // Schedule cleanup jobs
    this.scheduleCleanupJob('presence_data', policy.presenceRetentionDays);
    this.scheduleCleanupJob('activity_data', policy.activityRetentionDays);
    this.scheduleCleanupJob('subscription_data', policy.subscriptionRetentionDays);
  }
  
  async cleanupOldPresenceData(): Promise<CleanupResult> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.retentionPolicy.presenceRetentionDays);
    
    const stalePresences = await this.presenceStore.getStalePresences(cutoffDate);
    
    let deletedCount = 0;
    for (const presence of stalePresences) {
      await this.presenceStore.deletePresence(presence.userId);
      deletedCount++;
    }
    
    return {
      deletedRecords: deletedCount,
      cleanupDate: new Date(),
      dataType: 'presence'
    };
  }
}
```

### Performance Optimization

```typescript
// Performance optimization for high-scale presence systems
class PresencePerformanceOptimizer {
  private presenceCache: PresenceCache;
  private batchProcessor: BatchProcessor;
  
  // Efficient presence distribution with batching
  async optimizePresenceDistribution(updates: PresenceUpdate[]): Promise<void> {
    // Batch updates for efficient network usage
    const batches = this.batchProcessor.createBatches(updates, {
      maxBatchSize: 100,
      maxBatchDelay: 50 // milliseconds
    });
    
    // Process batches in parallel with rate limiting
    await Promise.all(
      batches.map(batch => this.processBatch(batch))
    );
  }
  
  // Presence caching for reduced database load
  async getCachedPresence(userId: string): Promise<UserPresence | null> {
    // Check cache first
    const cached = await this.presenceCache.get(userId);
    if (cached && !this.isCacheStale(cached)) {
      return cached.presence;
    }
    
    // Fetch from database and cache
    const presence = await this.presenceStore.getPresence(userId);
    if (presence) {
      await this.presenceCache.set(userId, presence, { ttl: 60000 });
    }
    
    return presence;
  }
  
  // Efficient distribution for large subscriber lists
  async distributeToLargeAudience(
    update: PresenceUpdate,
    subscribers: string[]
  ): Promise<void> {
    // Use efficient distribution strategy for performance optimization
    const strategy = subscribers.length > 1000 
      ? 'fan-out-on-read' 
      : 'fan-out-on-write';
    
    if (strategy === 'fan-out-on-write') {
      // Direct distribution for smaller audiences
      await this.directDistribution(update, subscribers);
    } else {
      // Store update for lazy distribution
      await this.lazyDistribution(update, subscribers);
    }
  }
  
  // Resource optimization for memory and CPU
  async optimizeResources(): Promise<OptimizationResult> {
    // Compact presence cache
    await this.presenceCache.compact();
    
    // Clean up stale subscriptions
    await this.cleanupStaleSubscriptions();
    
    // Optimize data structures
    await this.optimizeDataStructures();
    
    return {
      cacheSize: await this.presenceCache.size(),
      memoryUsage: process.memoryUsage().heapUsed,
      optimizedAt: new Date()
    };
  }
}
```

## Testing Considerations

### Unit Testing

```typescript
describe('PresenceService', () => {
  let presenceService: PresenceService;
  let mockStore: jest.Mocked<PresenceStore>;
  let mockDistribution: jest.Mocked<PresenceDistributionSystem>;
  
  beforeEach(() => {
    mockStore = createMockPresenceStore();
    mockDistribution = createMockDistributionSystem();
    presenceService = new PresenceService(mockStore, mockDistribution);
  });
  
  it('should set user presence successfully', async () => {
    const userId = 'user123';
    const status: PresenceStatus = {
      state: PresenceState.ONLINE,
      availability: AvailabilityLevel.AVAILABLE
    };
    
    await presenceService.setUserPresence(userId, status);
    
    expect(mockStore.setPresence).toHaveBeenCalledWith(
      userId,
      expect.objectContaining({ status })
    );
    expect(mockDistribution.distributePresenceUpdate).toHaveBeenCalled();
  });
  
  it('should handle activity-based presence updates', async () => {
    const userId = 'user123';
    const activity: ActivityEvent = {
      userId,
      type: ActivityType.KEYBOARD_INPUT,
      timestamp: new Date(),
      metadata: {},
      source: ActivitySource.CLIENT
    };
    
    await presenceService.trackUserActivity(userId, activity);
    
    expect(mockStore.updateLastActivity).toHaveBeenCalledWith(userId, activity.timestamp);
  });
});
```

### Integration Testing

```typescript
describe('Presence System Integration', () => {
  it('should maintain presence consistency across multiple connections', async () => {
    const userId = 'user123';
    
    // Simulate multiple connections
    const connection1 = await webSocketManager.connect(userId);
    const connection2 = await webSocketManager.connect(userId);
    
    // Set presence from first connection
    await presenceService.setUserPresence(userId, {
      state: PresenceState.BUSY,
      availability: AvailabilityLevel.BUSY
    });
    
    // Verify presence is consistent across connections
    const presence1 = await presenceService.getUserPresence(userId);
    const presence2 = await presenceService.getUserPresence(userId);
    
    expect(presence1.status.state).toBe(PresenceState.BUSY);
    expect(presence2.status.state).toBe(PresenceState.BUSY);
  });
});
```

### Performance Testing

```typescript
describe('Presence System Performance', () => {
  it('should handle high-frequency presence updates', async () => {
    const userCount = 1000;
    const updatesPerUser = 10;
    
    const users = Array.from({ length: userCount }, (_, i) => `user${i}`);
    const startTime = Date.now();
    
    // Generate concurrent presence updates
    const updatePromises = users.flatMap(userId =>
      Array.from({ length: updatesPerUser }, () =>
        presenceService.setUserPresence(userId, {
          state: PresenceState.ONLINE,
          availability: AvailabilityLevel.AVAILABLE
        })
      )
    );
    
    await Promise.all(updatePromises);
    
    const duration = Date.now() - startTime;
    const updatesPerSecond = (userCount * updatesPerUser) / (duration / 1000);
    
    expect(updatesPerSecond).toBeGreaterThan(100);
  });
});
```