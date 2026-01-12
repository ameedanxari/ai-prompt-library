# WebSocket Management Template

## Purpose

Provides comprehensive patterns for WebSocket connection handling, scaling, and management in real-time applications. This template covers connection lifecycle management, scaling strategies, error handling, and performance optimization for WebSocket-based communication systems.

## Context

WebSocket management is critical for real-time applications requiring bidirectional communication between clients and servers. This template addresses common challenges including connection stability, scaling across multiple servers, handling network interruptions, and maintaining connection state across different deployment scenarios.

## Core Components

### WebSocket Connection Manager

## Examples

```typescript
interface WebSocketConnectionManager {
  // Connection lifecycle
  connect(url: string, protocols?: string[]): Promise<WebSocketConnection>;
  disconnect(connectionId: string, reason?: string): Promise<void>;
  reconnect(connectionId: string, options?: ReconnectOptions): Promise<WebSocketConnection>;
  
  // Connection monitoring
  getConnectionStatus(connectionId: string): ConnectionStatus;
  getActiveConnections(): WebSocketConnection[];
  getConnectionMetrics(): ConnectionMetrics;
  
  // Message handling
  sendMessage(connectionId: string, message: Message): Promise<void>;
  broadcastMessage(message: Message, filter?: ConnectionFilter): Promise<void>;
  subscribeToMessages(connectionId: string, handler: MessageHandler): void;
}

interface WebSocketConnection {
  id: string;
  url: string;
  status: ConnectionStatus;
  protocols: string[];
  metadata: ConnectionMetadata;
  lastActivity: Date;
  reconnectAttempts: number;
}

interface ReconnectOptions {
  maxAttempts: number;
  backoffStrategy: BackoffStrategy;
  timeout: number;
  preserveSubscriptions: boolean;
}

interface ConnectionMetrics {
  totalConnections: number;
  activeConnections: number;
  messagesPerSecond: number;
  averageLatency: number;
  errorRate: number;
  reconnectionRate: number;
}
```

### Connection Pool Manager

```typescript
interface ConnectionPoolManager {
  // Pool management
  createPool(config: PoolConfig): ConnectionPool;
  getPool(poolId: string): ConnectionPool;
  removePool(poolId: string): Promise<void>;
  
  // Load balancing
  getOptimalConnection(criteria: ConnectionCriteria): WebSocketConnection;
  distributeLoad(connections: WebSocketConnection[]): LoadDistribution;
  
  // Health monitoring
  monitorPoolHealth(poolId: string): HealthStatus;
  handleUnhealthyConnections(poolId: string): Promise<void>;
}

interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  connectionTimeout: number;
  healthCheckInterval: number;
  loadBalancingStrategy: LoadBalancingStrategy;
}
```

### Message Routing System

```typescript
interface MessageRoutingSystem {
  // Message routing and delivery
  routeMessage(message: WebSocketMessage, routingRules: RoutingRule[]): Promise<string[]>;
  broadcastToChannel(channelId: string, message: WebSocketMessage): Promise<void>;
  sendToConnection(connectionId: string, message: WebSocketMessage): Promise<void>;
  
  // Routing configuration
  addRoutingRule(rule: RoutingRule): void;
  removeRoutingRule(ruleId: string): void;
  getRoutingRules(): RoutingRule[];
}

interface RoutingRule {
  id: string;
  pattern: string;
  destinations: string[];
  priority: number;
  enabled: boolean;
}
```

### Message Queue Integration

```typescript
interface WebSocketMessageQueue {
  // Queue operations
  enqueueMessage(message: QueuedMessage): Promise<void>;
  dequeueMessage(connectionId: string): Promise<QueuedMessage | null>;
  getQueueSize(connectionId: string): number;
  
  // Persistence
  persistMessage(message: QueuedMessage): Promise<void>;
  retrievePersistedMessages(connectionId: string): Promise<QueuedMessage[]>;
  
  // Delivery guarantees - at-least-once, at-most-once, exactly-once delivery
  acknowledgeMessage(messageId: string): Promise<void>;
  retryFailedMessages(connectionId: string): Promise<void>;
  configureDeliveryGuarantee(guarantee: DeliveryGuarantee): void;
}

interface QueuedMessage {
  id: string;
  connectionId: string;
  payload: any;
  priority: MessagePriority;
  timestamp: Date;
  retryCount: number;
  expiresAt?: Date;
}

enum DeliveryGuarantee {
  AT_LEAST_ONCE = 'at_least_once',
  AT_MOST_ONCE = 'at_most_once',
  EXACTLY_ONCE = 'exactly_once'
}
```

## Implementation Patterns

### Basic WebSocket Connection Setup

```typescript
// WebSocket connection with automatic reconnection
class WebSocketManager {
  private connections = new Map<string, WebSocketConnection>();
  private reconnectTimers = new Map<string, NodeJS.Timeout>();
  
  async connect(url: string, options: ConnectionOptions = {}): Promise<string> {
    const connectionId = generateConnectionId();
    const ws = new WebSocket(url, options.protocols);
    
    const connection: WebSocketConnection = {
      id: connectionId,
      url,
      status: 'connecting',
      protocols: options.protocols || [],
      metadata: options.metadata || {},
      lastActivity: new Date(),
      reconnectAttempts: 0
    };
    
    ws.onopen = () => {
      connection.status = 'connected';
      connection.reconnectAttempts = 0;
      this.clearReconnectTimer(connectionId);
      this.emit('connected', connection);
    };
    
    ws.onmessage = (event) => {
      connection.lastActivity = new Date();
      this.handleMessage(connectionId, event.data);
    };
    
    ws.onclose = (event) => {
      connection.status = 'disconnected';
      this.handleDisconnection(connectionId, event);
    };
    
    ws.onerror = (error) => {
      this.handleError(connectionId, error);
    };
    
    this.connections.set(connectionId, connection);
    return connectionId;
  }
  
  private async handleDisconnection(connectionId: string, event: CloseEvent) {
    const connection = this.connections.get(connectionId);
    if (!connection) return;
    
    // Attempt reconnection if not intentional disconnect
    if (event.code !== 1000 && connection.reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
      const delay = this.calculateBackoffDelay(connection.reconnectAttempts);
      
      this.reconnectTimers.set(connectionId, setTimeout(() => {
        this.reconnect(connectionId);
      }, delay));
    }
  }
}
```

### Scaling with Load Balancing

```typescript
// WebSocket load balancer for horizontal scaling
class WebSocketLoadBalancer {
  private servers: WebSocketServer[] = [];
  private connectionDistribution = new Map<string, string>();
  private performanceMonitor: PerformanceMonitor;
  
  addServer(server: WebSocketServer): void {
    this.servers.push(server);
    this.rebalanceConnections();
  }
  
  removeServer(serverId: string): void {
    this.servers = this.servers.filter(s => s.id !== serverId);
    this.migrateConnections(serverId);
  }
  
  getOptimalServer(criteria: ConnectionCriteria): WebSocketServer {
    // Implement load balancing algorithm for horizontal scaling
    const availableServers = this.servers.filter(s => s.isHealthy());
    
    switch (criteria.strategy) {
      case 'round-robin':
        return this.roundRobinSelection(availableServers);
      case 'least-connections':
        return this.leastConnectionsSelection(availableServers);
      case 'geographic':
        return this.geographicSelection(availableServers, criteria.location);
      default:
        return availableServers[0];
    }
  }
  
  private async migrateConnections(serverId: string): Promise<void> {
    const connectionsToMigrate = Array.from(this.connectionDistribution.entries())
      .filter(([_, serverIdForConnection]) => serverIdForConnection === serverId)
      .map(([connectionId]) => connectionId);
    
    for (const connectionId of connectionsToMigrate) {
      const newServer = this.getOptimalServer({ strategy: 'least-connections' });
      await this.migrateConnection(connectionId, newServer);
    }
  }
  
  // Performance monitoring for resource optimization
  async monitorPerformance(): Promise<PerformanceMetrics> {
    return this.performanceMonitor.collectMetrics({
      latency: true,
      throughput: true,
      connectionCount: true,
      memoryUsage: true
    });
  }
}

// Performance monitoring system
class PerformanceMonitor {
  private metrics: Map<string, MetricData> = new Map();
  
  async collectMetrics(options: MetricOptions): Promise<PerformanceMetrics> {
    return {
      averageLatency: await this.measureLatency(),
      messagesPerSecond: await this.measureThroughput(),
      activeConnections: await this.countConnections(),
      resourceUtilization: await this.measureResourceUsage()
    };
  }
  
  // Resource optimization recommendations
  async getOptimizationRecommendations(): Promise<OptimizationRecommendation[]> {
    const metrics = await this.collectMetrics({ all: true });
    return this.analyzeMetricsForOptimization(metrics);
  }
}
```

### Message Persistence and Reliability

```typescript
// Reliable message delivery with persistence
class ReliableWebSocketMessaging {
  private messageStore: MessageStore;
  private deliveryTracker: DeliveryTracker;
  
  async sendReliableMessage(
    connectionId: string, 
    message: any, 
    options: DeliveryOptions = {}
  ): Promise<void> {
    const messageId = generateMessageId();
    const queuedMessage: QueuedMessage = {
      id: messageId,
      connectionId,
      payload: message,
      priority: options.priority || 'normal',
      timestamp: new Date(),
      retryCount: 0,
      expiresAt: options.ttl ? new Date(Date.now() + options.ttl) : undefined
    };
    
    // Persist message for reliability
    await this.messageStore.store(queuedMessage);
    
    // Attempt delivery
    try {
      await this.deliverMessage(queuedMessage);
      await this.messageStore.markDelivered(messageId);
    } catch (error) {
      await this.scheduleRetry(queuedMessage);
    }
  }
  
  private async scheduleRetry(message: QueuedMessage): Promise<void> {
    if (message.retryCount >= MAX_RETRY_ATTEMPTS) {
      await this.handleFailedMessage(message);
      return;
    }
    
    const delay = this.calculateRetryDelay(message.retryCount);
    setTimeout(async () => {
      message.retryCount++;
      await this.sendReliableMessage(
        message.connectionId, 
        message.payload, 
        { priority: message.priority }
      );
    }, delay);
  }
}
```

## Integration Points

### Database Integration

```typescript
// WebSocket connection state persistence
interface WebSocketStateStore {
  saveConnectionState(connectionId: string, state: ConnectionState): Promise<void>;
  loadConnectionState(connectionId: string): Promise<ConnectionState | null>;
  removeConnectionState(connectionId: string): Promise<void>;
  
  // Session management
  createSession(connectionId: string, userId: string): Promise<Session>;
  getActiveSessions(userId: string): Promise<Session[]>;
  invalidateSession(sessionId: string): Promise<void>;
}

// Message history and persistence
interface MessageHistoryStore {
  storeMessage(message: StoredMessage): Promise<void>;
  getMessageHistory(connectionId: string, limit: number): Promise<StoredMessage[]>;
  getMessagesSince(connectionId: string, timestamp: Date): Promise<StoredMessage[]>;
  deleteOldMessages(olderThan: Date): Promise<number>;
}
```

### Authentication Integration

```typescript
// WebSocket authentication middleware
class WebSocketAuthenticator {
  async authenticateConnection(
    request: IncomingMessage, 
    socket: Socket, 
    head: Buffer
  ): Promise<AuthenticationResult> {
    const token = this.extractToken(request);
    
    if (!token) {
      return { success: false, error: 'Missing authentication token' };
    }
    
    try {
      const user = await this.validateToken(token);
      return { 
        success: true, 
        user, 
        permissions: await this.getUserPermissions(user.id) 
      };
    } catch (error) {
      return { success: false, error: 'Invalid authentication token' };
    }
  }
  
  async authorizeMessage(
    connectionId: string, 
    message: any
  ): Promise<AuthorizationResult> {
    const connection = await this.getConnection(connectionId);
    const requiredPermissions = this.getRequiredPermissions(message.type);
    
    return {
      authorized: this.hasPermissions(connection.user, requiredPermissions),
      reason: !this.hasPermissions(connection.user, requiredPermissions) 
        ? 'Insufficient permissions' 
        : undefined
    };
  }
}
```

## Security Considerations

### Connection Security

```typescript
// Secure WebSocket configuration
const secureWebSocketConfig = {
  // Use WSS (WebSocket Secure) in production
  protocol: 'wss',
  
  // Certificate validation
  rejectUnauthorized: true,
  
  // Connection limits
  maxConnections: 10000,
  connectionTimeout: 30000,
  
  // Rate limiting
  rateLimit: {
    windowMs: 60000, // 1 minute
    maxRequests: 100
  },
  
  // Message size limits
  maxMessageSize: 1024 * 1024, // 1MB
  
  // Origin validation
  verifyClient: (info) => {
    return this.isAllowedOrigin(info.origin);
  }
};
```

### Message Encryption

```typescript
// End-to-end message encryption
class MessageEncryption {
  async encryptMessage(message: any, recipientPublicKey: string): Promise<EncryptedMessage> {
    const messageString = JSON.stringify(message);
    const encryptedData = await this.encrypt(messageString, recipientPublicKey);
    
    return {
      encrypted: true,
      data: encryptedData,
      algorithm: 'RSA-OAEP',
      timestamp: new Date().toISOString()
    };
  }
  
  async decryptMessage(encryptedMessage: EncryptedMessage, privateKey: string): Promise<any> {
    const decryptedString = await this.decrypt(encryptedMessage.data, privateKey);
    return JSON.parse(decryptedString);
  }
}
```

## Compliance Requirements

### Data Privacy

- **GDPR Compliance**: Implement data minimization, user consent, and right to deletion
- **Connection Logging**: Log connection events while respecting privacy requirements
- **Data Retention**: Automatically delete old connection logs and message history
- **User Consent**: Obtain explicit consent for real-time data processing

### Security Standards

- **WebSocket Security**: Implement WSS, origin validation, and certificate pinning
- **Authentication**: Require strong authentication for all connections
- **Authorization**: Implement fine-grained permissions for message types
- **Audit Logging**: Log all security-relevant events and access attempts

## Testing Considerations

### Unit Testing

```typescript
describe('WebSocketManager', () => {
  it('should establish connection successfully', async () => {
    const manager = new WebSocketManager();
    const connectionId = await manager.connect('wss://test.example.com');
    
    expect(connectionId).toBeDefined();
    expect(manager.getConnectionStatus(connectionId)).toBe('connected');
  });
  
  it('should handle reconnection on disconnect', async () => {
    const manager = new WebSocketManager();
    const connectionId = await manager.connect('wss://test.example.com');
    
    // Simulate disconnect
    manager.simulateDisconnect(connectionId);
    
    // Wait for reconnection attempt
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    expect(manager.getConnectionStatus(connectionId)).toBe('connected');
  });
});
```

### Integration Testing

```typescript
describe('WebSocket Integration', () => {
  it('should handle message delivery across server restart', async () => {
    const client = new WebSocketClient();
    const server = new WebSocketServer();
    
    await client.connect();
    await client.sendMessage({ type: 'test', data: 'hello' });
    
    // Restart server
    await server.restart();
    
    // Verify message was persisted and delivered
    const messages = await client.getReceivedMessages();
    expect(messages).toContainEqual({ type: 'test', data: 'hello' });
  });
});
```

### Load Testing

```typescript
// WebSocket load testing
describe('WebSocket Load Testing', () => {
  it('should handle 1000 concurrent connections', async () => {
    const connections = [];
    
    for (let i = 0; i < 1000; i++) {
      const client = new WebSocketClient();
      connections.push(client.connect());
    }
    
    await Promise.all(connections);
    
    // Verify all connections are active
    expect(server.getActiveConnectionCount()).toBe(1000);
  });
});
```