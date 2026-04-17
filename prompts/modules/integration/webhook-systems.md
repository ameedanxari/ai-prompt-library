# Webhook Systems Template

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

Provides comprehensive patterns for implementing webhook delivery systems, retry mechanisms, signature verification, and event routing. This template covers reliable webhook delivery, failure handling, security, and monitoring for event-driven integrations.

## Context

Webhooks are essential for real-time event notifications between systems. This template addresses the challenges of reliable delivery, retry strategies, signature verification, event filtering, and monitoring while ensuring scalability and security in webhook-based integrations.

## Core Components

### Webhook Manager

## Examples

```typescript
interface WebhookManager {
  // Webhook registration
  createWebhook(config: WebhookConfig): Promise<Webhook>;
  updateWebhook(webhookId: string, updates: Partial<WebhookConfig>): Promise<Webhook>;
  deleteWebhook(webhookId: string): Promise<void>;
  getWebhook(webhookId: string): Promise<Webhook>;
  listWebhooks(filters?: WebhookFilters): Promise<Webhook[]>;
  
  // Webhook delivery
  deliverEvent(webhookId: string, event: WebhookEvent): Promise<DeliveryResult>;
  retryDelivery(deliveryId: string): Promise<DeliveryResult>;
  
  // Webhook testing
  testWebhook(webhookId: string): Promise<TestResult>;
  sendTestEvent(webhookId: string, event: WebhookEvent): Promise<DeliveryResult>;
}

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret: string;
  active: boolean;
  headers: Record<string, string>;
  retryPolicy: RetryPolicy;
  filters: EventFilter[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}


interface WebhookConfig {
  name: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  retryPolicy?: RetryPolicy;
  filters?: EventFilter[];
  authentication?: WebhookAuthentication;
  metadata?: Record<string, any>;
}

interface WebhookEvent {
  id: string;
  type: string;
  timestamp: Date;
  data: any;
  metadata?: Record<string, any>;
}

interface DeliveryResult {
  deliveryId: string;
  webhookId: string;
  status: DeliveryStatus;
  statusCode?: number;
  responseBody?: string;
  duration: number;
  attempts: number;
  nextRetryAt?: Date;
  error?: string;
}

enum DeliveryStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  RETRYING = 'retrying',
  EXHAUSTED = 'exhausted'
}
```

### Retry Policy System

```typescript
interface RetryPolicy {
  maxRetries: number;
  backoffStrategy: BackoffStrategy;
  initialDelay: number;
  maxDelay: number;
  retryableStatusCodes: number[];
  retryableErrors: string[];
}

enum BackoffStrategy {
  FIXED = 'fixed',
  LINEAR = 'linear',
  EXPONENTIAL = 'exponential',
  EXPONENTIAL_JITTER = 'exponential_jitter'
}

interface RetryScheduler {
  scheduleRetry(delivery: WebhookDelivery, policy: RetryPolicy): Promise<ScheduledRetry>;
  cancelRetry(retryId: string): Promise<void>;
  getScheduledRetries(webhookId: string): Promise<ScheduledRetry[]>;
  processRetryQueue(): Promise<void>;
}

interface ScheduledRetry {
  id: string;
  deliveryId: string;
  webhookId: string;
  scheduledAt: Date;
  attemptNumber: number;
  status: RetryStatus;
}
```

### Signature Verification

```typescript
interface SignatureVerifier {
  generateSignature(payload: string, secret: string, algorithm?: SignatureAlgorithm): string;
  verifySignature(payload: string, signature: string, secret: string, algorithm?: SignatureAlgorithm): boolean;
  generateTimestampedSignature(payload: string, secret: string, timestamp: number): SignedPayload;
  verifyTimestampedSignature(signedPayload: SignedPayload, secret: string, tolerance: number): VerificationResult;
}

enum SignatureAlgorithm {
  HMAC_SHA256 = 'hmac-sha256',
  HMAC_SHA512 = 'hmac-sha512',
  RSA_SHA256 = 'rsa-sha256'
}

interface SignedPayload {
  payload: string;
  signature: string;
  timestamp: number;
  algorithm: SignatureAlgorithm;
}

interface VerificationResult {
  valid: boolean;
  error?: string;
  timestampValid?: boolean;
}
```

### Event Router

```typescript
interface EventRouter {
  // Event routing
  routeEvent(event: WebhookEvent): Promise<RoutingResult>;
  getMatchingWebhooks(event: WebhookEvent): Promise<Webhook[]>;
  
  // Filter management
  addFilter(webhookId: string, filter: EventFilter): Promise<void>;
  removeFilter(webhookId: string, filterId: string): Promise<void>;
  evaluateFilters(event: WebhookEvent, filters: EventFilter[]): boolean;
}

interface EventFilter {
  id: string;
  field: string;
  operator: FilterOperator;
  value: any;
  logic?: FilterLogic;
}

enum FilterOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  IN = 'in',
  NOT_IN = 'not_in',
  EXISTS = 'exists',
  REGEX = 'regex'
}

interface RoutingResult {
  eventId: string;
  matchedWebhooks: string[];
  deliveries: DeliveryResult[];
  skippedWebhooks: SkippedWebhook[];
}
```

## Implementation Patterns

### Reliable Webhook Delivery

```typescript
class WebhookDeliveryService {
  private httpClient: HttpClient;
  private signatureVerifier: SignatureVerifier;
  private retryScheduler: RetryScheduler;
  private deliveryStore: DeliveryStore;
  
  async deliverEvent(webhook: Webhook, event: WebhookEvent): Promise<DeliveryResult> {
    const delivery = await this.createDelivery(webhook, event);
    
    try {
      // Prepare request
      const request = await this.prepareRequest(webhook, event);
      
      // Send webhook
      const response = await this.sendWithTimeout(request, webhook.timeout || 30000);
      
      // Process response
      if (this.isSuccessful(response.statusCode)) {
        return await this.handleSuccess(delivery, response);
      } else {
        return await this.handleFailure(delivery, response, webhook.retryPolicy);
      }
      
    } catch (error) {
      return await this.handleError(delivery, error, webhook.retryPolicy);
    }
  }
  
  private async prepareRequest(webhook: Webhook, event: WebhookEvent): Promise<WebhookRequest> {
    const payload = JSON.stringify(event);
    const timestamp = Date.now();
    
    // Generate signature
    const signature = this.signatureVerifier.generateTimestampedSignature(
      payload,
      webhook.secret,
      timestamp
    );
    
    return {
      url: webhook.url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-ID': webhook.id,
        'X-Webhook-Timestamp': timestamp.toString(),
        'X-Webhook-Signature': signature.signature,
        'X-Event-Type': event.type,
        'X-Event-ID': event.id,
        ...webhook.headers
      },
      body: payload,
      timeout: webhook.timeout || 30000
    };
  }
  
  private async handleFailure(
    delivery: WebhookDelivery,
    response: HttpResponse,
    retryPolicy: RetryPolicy
  ): Promise<DeliveryResult> {
    delivery.status = DeliveryStatus.FAILED;
    delivery.statusCode = response.statusCode;
    delivery.responseBody = response.body;
    
    // Check if should retry
    if (this.shouldRetry(response.statusCode, retryPolicy, delivery.attempts)) {
      delivery.status = DeliveryStatus.RETRYING;
      const scheduledRetry = await this.retryScheduler.scheduleRetry(delivery, retryPolicy);
      delivery.nextRetryAt = scheduledRetry.scheduledAt;
    } else {
      delivery.status = DeliveryStatus.EXHAUSTED;
    }
    
    await this.deliveryStore.update(delivery);
    return this.toDeliveryResult(delivery);
  }
  
  private shouldRetry(statusCode: number, policy: RetryPolicy, attempts: number): boolean {
    if (attempts >= policy.maxRetries) return false;
    return policy.retryableStatusCodes.includes(statusCode);
  }
}
```

### Exponential Backoff with Jitter

```typescript
class ExponentialBackoffRetryScheduler implements RetryScheduler {
  calculateDelay(policy: RetryPolicy, attemptNumber: number): number {
    switch (policy.backoffStrategy) {
      case BackoffStrategy.FIXED:
        return policy.initialDelay;
        
      case BackoffStrategy.LINEAR:
        return Math.min(policy.initialDelay * attemptNumber, policy.maxDelay);
        
      case BackoffStrategy.EXPONENTIAL:
        return Math.min(policy.initialDelay * Math.pow(2, attemptNumber - 1), policy.maxDelay);
        
      case BackoffStrategy.EXPONENTIAL_JITTER:
        const exponentialDelay = policy.initialDelay * Math.pow(2, attemptNumber - 1);
        const jitter = Math.random() * exponentialDelay * 0.3; // 30% jitter
        return Math.min(exponentialDelay + jitter, policy.maxDelay);
        
      default:
        return policy.initialDelay;
    }
  }
  
  async scheduleRetry(delivery: WebhookDelivery, policy: RetryPolicy): Promise<ScheduledRetry> {
    const delay = this.calculateDelay(policy, delivery.attempts + 1);
    const scheduledAt = new Date(Date.now() + delay);
    
    const retry: ScheduledRetry = {
      id: generateId(),
      deliveryId: delivery.id,
      webhookId: delivery.webhookId,
      scheduledAt,
      attemptNumber: delivery.attempts + 1,
      status: RetryStatus.SCHEDULED
    };
    
    await this.retryStore.save(retry);
    await this.queue.enqueue(retry, scheduledAt);
    
    return retry;
  }
  
  async processRetryQueue(): Promise<void> {
    const dueRetries = await this.retryStore.getDueRetries(new Date());
    
    for (const retry of dueRetries) {
      try {
        retry.status = RetryStatus.PROCESSING;
        await this.retryStore.update(retry);
        
        const delivery = await this.deliveryStore.get(retry.deliveryId);
        const webhook = await this.webhookStore.get(delivery.webhookId);
        
        await this.webhookDeliveryService.retryDelivery(delivery, webhook);
        
        retry.status = RetryStatus.COMPLETED;
      } catch (error) {
        retry.status = RetryStatus.FAILED;
        retry.error = error.message;
      }
      
      await this.retryStore.update(retry);
    }
  }
}
```

### Signature Generation and Verification

```typescript
class HMACSignatureVerifier implements SignatureVerifier {
  generateSignature(payload: string, secret: string, algorithm: SignatureAlgorithm = SignatureAlgorithm.HMAC_SHA256): string {
    const hmac = crypto.createHmac(this.getHashAlgorithm(algorithm), secret);
    hmac.update(payload);
    return hmac.digest('hex');
  }
  
  verifySignature(payload: string, signature: string, secret: string, algorithm: SignatureAlgorithm = SignatureAlgorithm.HMAC_SHA256): boolean {
    const expectedSignature = this.generateSignature(payload, secret, algorithm);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
  
  generateTimestampedSignature(payload: string, secret: string, timestamp: number): SignedPayload {
    const signedPayload = `${timestamp}.${payload}`;
    const signature = this.generateSignature(signedPayload, secret);
    
    return {
      payload,
      signature,
      timestamp,
      algorithm: SignatureAlgorithm.HMAC_SHA256
    };
  }
  
  verifyTimestampedSignature(signedPayload: SignedPayload, secret: string, toleranceMs: number = 300000): VerificationResult {
    // Check timestamp freshness (default 5 minutes)
    const now = Date.now();
    const timestampAge = now - signedPayload.timestamp;
    
    if (timestampAge > toleranceMs) {
      return { valid: false, error: 'Timestamp too old', timestampValid: false };
    }
    
    if (signedPayload.timestamp > now + 60000) { // 1 minute future tolerance
      return { valid: false, error: 'Timestamp in future', timestampValid: false };
    }
    
    // Verify signature
    const payloadToVerify = `${signedPayload.timestamp}.${signedPayload.payload}`;
    const isValid = this.verifySignature(payloadToVerify, signedPayload.signature, secret, signedPayload.algorithm);
    
    return { valid: isValid, timestampValid: true };
  }
  
  private getHashAlgorithm(algorithm: SignatureAlgorithm): string {
    switch (algorithm) {
      case SignatureAlgorithm.HMAC_SHA256: return 'sha256';
      case SignatureAlgorithm.HMAC_SHA512: return 'sha512';
      default: return 'sha256';
    }
  }
}
```

## Integration Points

### Event Source Integration

```typescript
interface EventSourceIntegration {
  subscribeToEvents(source: EventSource, eventTypes: string[]): Promise<Subscription>;
  unsubscribeFromEvents(subscriptionId: string): Promise<void>;
  processIncomingEvent(event: RawEvent): Promise<WebhookEvent>;
}

class EventBridgeIntegration implements EventSourceIntegration {
  async subscribeToEvents(source: EventSource, eventTypes: string[]): Promise<Subscription> {
    // Create event rule for specified event types
    const rule = await this.eventBridge.putRule({
      name: `webhook-${source.id}`,
      eventPattern: {
        source: [source.name],
        'detail-type': eventTypes
      }
    });
    
    // Add target for webhook processing
    await this.eventBridge.putTargets({
      rule: rule.name,
      targets: [{
        id: 'webhook-processor',
        arn: this.webhookProcessorArn
      }]
    });
    
    return { id: rule.name, source, eventTypes, active: true };
  }
}
```

### Dead Letter Queue Integration

```typescript
interface DeadLetterQueueManager {
  sendToDeadLetter(delivery: WebhookDelivery, reason: string): Promise<void>;
  getDeadLetterItems(webhookId: string): Promise<DeadLetterItem[]>;
  reprocessDeadLetter(itemId: string): Promise<DeliveryResult>;
  purgeDeadLetter(webhookId: string, olderThan?: Date): Promise<number>;
}

class SQSDeadLetterQueue implements DeadLetterQueueManager {
  async sendToDeadLetter(delivery: WebhookDelivery, reason: string): Promise<void> {
    const item: DeadLetterItem = {
      id: generateId(),
      deliveryId: delivery.id,
      webhookId: delivery.webhookId,
      event: delivery.event,
      reason,
      attempts: delivery.attempts,
      lastError: delivery.error,
      createdAt: new Date()
    };
    
    await this.sqs.sendMessage({
      queueUrl: this.deadLetterQueueUrl,
      messageBody: JSON.stringify(item),
      messageAttributes: {
        webhookId: { DataType: 'String', StringValue: delivery.webhookId },
        reason: { DataType: 'String', StringValue: reason }
      }
    });
  }
  
  async reprocessDeadLetter(itemId: string): Promise<DeliveryResult> {
    const item = await this.getDeadLetterItem(itemId);
    const webhook = await this.webhookStore.get(item.webhookId);
    
    // Reset delivery for reprocessing
    const delivery = await this.createNewDelivery(webhook, item.event);
    
    // Remove from dead letter queue
    await this.removeFromDeadLetter(itemId);
    
    // Attempt delivery
    return this.webhookDeliveryService.deliverEvent(webhook, item.event);
  }
}
```

## Security Considerations

### Webhook Security

```typescript
const webhookSecurityConfig = {
  // Secret management
  secretGeneration: {
    algorithm: 'random',
    length: 64,
    encoding: 'hex'
  },
  
  // Signature verification
  signature: {
    algorithm: SignatureAlgorithm.HMAC_SHA256,
    timestampTolerance: 300000, // 5 minutes
    headerName: 'X-Webhook-Signature'
  },
  
  // URL validation
  urlValidation: {
    allowedProtocols: ['https'],
    blockPrivateIPs: true,
    blockLocalhost: true,
    maxRedirects: 0
  },
  
  // Rate limiting
  rateLimiting: {
    maxDeliveriesPerMinute: 1000,
    maxRetriesPerHour: 100
  }
};

class WebhookSecurityValidator {
  validateWebhookUrl(url: string): ValidationResult {
    const parsed = new URL(url);
    
    // Check protocol
    if (!webhookSecurityConfig.urlValidation.allowedProtocols.includes(parsed.protocol.replace(':', ''))) {
      return { valid: false, error: 'Only HTTPS URLs are allowed' };
    }
    
    // Check for private IPs
    if (webhookSecurityConfig.urlValidation.blockPrivateIPs && this.isPrivateIP(parsed.hostname)) {
      return { valid: false, error: 'Private IP addresses are not allowed' };
    }
    
    // Check for localhost
    if (webhookSecurityConfig.urlValidation.blockLocalhost && this.isLocalhost(parsed.hostname)) {
      return { valid: false, error: 'Localhost URLs are not allowed' };
    }
    
    return { valid: true };
  }
}
```

## Compliance Requirements

### Audit Logging

- **Delivery Logging**: Log all webhook delivery attempts with timestamps and results
- **Configuration Changes**: Track all webhook configuration changes
- **Secret Rotation**: Maintain audit trail of secret rotations
- **Access Logging**: Log all access to webhook management APIs

### Data Retention

- **Delivery History**: Retain delivery history for compliance period
- **Event Payloads**: Store event payloads with appropriate encryption
- **Cleanup Policies**: Implement automatic cleanup of old delivery records

## Testing Considerations

### Webhook Delivery Testing

```typescript
describe('WebhookDeliveryService', () => {
  it('should deliver webhook successfully', async () => {
    const service = new WebhookDeliveryService();
    const webhook = createTestWebhook({ url: 'https://example.com/webhook' });
    const event = createTestEvent({ type: 'order.created' });
    
    mockHttpClient.post.mockResolvedValue({ statusCode: 200, body: 'OK' });
    
    const result = await service.deliverEvent(webhook, event);
    
    expect(result.status).toBe(DeliveryStatus.DELIVERED);
    expect(result.statusCode).toBe(200);
  });
  
  it('should retry on failure with exponential backoff', async () => {
    const service = new WebhookDeliveryService();
    const webhook = createTestWebhook({
      retryPolicy: {
        maxRetries: 3,
        backoffStrategy: BackoffStrategy.EXPONENTIAL,
        initialDelay: 1000,
        maxDelay: 60000,
        retryableStatusCodes: [500, 502, 503]
      }
    });
    
    mockHttpClient.post.mockResolvedValue({ statusCode: 500, body: 'Error' });
    
    const result = await service.deliverEvent(webhook, createTestEvent());
    
    expect(result.status).toBe(DeliveryStatus.RETRYING);
    expect(result.nextRetryAt).toBeDefined();
  });
});

describe('SignatureVerifier', () => {
  it('should generate and verify signatures correctly', () => {
    const verifier = new HMACSignatureVerifier();
    const payload = '{"event": "test"}';
    const secret = 'test-secret';
    
    const signature = verifier.generateSignature(payload, secret);
    const isValid = verifier.verifySignature(payload, signature, secret);
    
    expect(isValid).toBe(true);
  });
  
  it('should reject expired timestamps', () => {
    const verifier = new HMACSignatureVerifier();
    const oldTimestamp = Date.now() - 600000; // 10 minutes ago
    
    const signedPayload = verifier.generateTimestampedSignature('test', 'secret', oldTimestamp);
    const result = verifier.verifyTimestampedSignature(signedPayload, 'secret', 300000);
    
    expect(result.valid).toBe(false);
    expect(result.timestampValid).toBe(false);
  });
});
```

This template provides comprehensive patterns for implementing reliable webhook delivery systems with retry mechanisms, signature verification, and event routing capabilities.
