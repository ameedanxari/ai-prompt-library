# Notification Channels Template

## Purpose

This template provides comprehensive patterns for implementing multi-channel notification delivery systems including email, SMS, push notifications, in-app notifications, and webhook delivery. It covers channel configuration, delivery orchestration, fallback mechanisms, and unified notification management across all channels.

## Context

Modern applications require sophisticated notification systems that can reach users through multiple channels based on their preferences, urgency of the message, and delivery reliability requirements. This template addresses the challenges of managing multiple delivery providers, ensuring message delivery, handling failures gracefully, and providing a unified interface for notification management across email, SMS, push, in-app, and webhook channels.

## Core Components

### Notification Channel Service

```typescript
interface NotificationChannelService {
  // Channel management
  registerChannel(channel: NotificationChannel): Promise<void>;
  getChannel(channelId: string): NotificationChannel | null;
  getAvailableChannels(): NotificationChannel[];
  
  // Delivery operations
  send(notification: Notification, channelId: string): Promise<DeliveryResult>;
  sendMultiChannel(notification: Notification, channels: string[]): Promise<MultiChannelDeliveryResult>;
  
  // Channel health
  getChannelHealth(channelId: string): ChannelHealthStatus;
  testChannel(channelId: string): Promise<ChannelTestResult>;
}

interface NotificationChannel {
  id: string;
  type: ChannelType;
  name: string;
  provider: ChannelProvider;
  config: ChannelConfig;
  enabled: boolean;
  priority: number;
  rateLimits: RateLimitConfig;
}

enum ChannelType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
  SLACK = 'slack',
  TEAMS = 'teams'
}

interface ChannelConfig {
  apiKey?: string;
  apiSecret?: string;
  endpoint?: string;
  region?: string;
  fromAddress?: string;
  fromName?: string;
  templateEngine?: string;
  retryPolicy: RetryPolicy;
  timeout: number;
}
```

### Email Notification Service

```typescript
interface EmailNotificationService {
  // Email operations
  sendEmail(email: EmailNotification): Promise<EmailDeliveryResult>;
  sendBulkEmail(emails: EmailNotification[]): Promise<BulkEmailResult>;
  sendTemplatedEmail(templateId: string, recipients: EmailRecipient[], data: Record<string, unknown>): Promise<EmailDeliveryResult>;
  
  // Template management
  createTemplate(template: EmailTemplate): Promise<string>;
  updateTemplate(templateId: string, template: Partial<EmailTemplate>): Promise<void>;
  getTemplate(templateId: string): Promise<EmailTemplate>;
  
  // Tracking
  getEmailStatus(messageId: string): Promise<EmailStatus>;
  getEmailEvents(messageId: string): Promise<EmailEvent[]>;
}

interface EmailNotification {
  to: EmailRecipient[];
  cc?: EmailRecipient[];
  bcc?: EmailRecipient[];
  from: EmailSender;
  replyTo?: string;
  subject: string;
  body: EmailBody;
  attachments?: EmailAttachment[];
  headers?: Record<string, string>;
  tags?: string[];
  metadata?: Record<string, unknown>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  scheduledAt?: Date;
}

interface EmailBody {
  html?: string;
  text?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  variables: TemplateVariable[];
  category: string;
  active: boolean;
}

interface EmailDeliveryResult {
  messageId: string;
  status: DeliveryStatus;
  provider: string;
  timestamp: Date;
  recipientResults: RecipientDeliveryResult[];
}
```

### SMS Notification Service

```typescript
interface SMSNotificationService {
  // SMS operations
  sendSMS(sms: SMSNotification): Promise<SMSDeliveryResult>;
  sendBulkSMS(messages: SMSNotification[]): Promise<BulkSMSResult>;
  
  // Number management
  validatePhoneNumber(phoneNumber: string): Promise<PhoneValidationResult>;
  formatPhoneNumber(phoneNumber: string, countryCode: string): string;
  
  // Tracking
  getSMSStatus(messageId: string): Promise<SMSStatus>;
  getSMSEvents(messageId: string): Promise<SMSEvent[]>;
}

interface SMSNotification {
  to: string;
  from?: string;
  body: string;
  mediaUrls?: string[]; // For MMS
  scheduledAt?: Date;
  validityPeriod?: number; // In seconds
  statusCallback?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

interface SMSDeliveryResult {
  messageId: string;
  status: DeliveryStatus;
  provider: string;
  segments: number;
  price?: number;
  currency?: string;
  timestamp: Date;
}

interface PhoneValidationResult {
  valid: boolean;
  phoneNumber: string;
  countryCode: string;
  carrier?: string;
  lineType?: 'mobile' | 'landline' | 'voip' | 'unknown';
}
```

### Push Notification Service

```typescript
interface PushNotificationService {
  // Push operations
  sendPush(push: PushNotification): Promise<PushDeliveryResult>;
  sendBulkPush(notifications: PushNotification[]): Promise<BulkPushResult>;
  sendToTopic(topic: string, notification: PushPayload): Promise<TopicDeliveryResult>;
  
  // Device management
  registerDevice(device: DeviceRegistration): Promise<string>;
  unregisterDevice(deviceToken: string): Promise<void>;
  getDeviceInfo(deviceToken: string): Promise<DeviceInfo>;
  
  // Topic management
  subscribeToTopic(deviceToken: string, topic: string): Promise<void>;
  unsubscribeFromTopic(deviceToken: string, topic: string): Promise<void>;
  
  // Tracking
  getPushStatus(messageId: string): Promise<PushStatus>;
}

interface PushNotification {
  deviceTokens: string[];
  payload: PushPayload;
  platform?: PushPlatform;
  priority?: 'high' | 'normal';
  ttl?: number;
  collapseKey?: string;
  badge?: number;
  sound?: string;
  scheduledAt?: Date;
  tags?: string[];
}

interface PushPayload {
  title: string;
  body: string;
  image?: string;
  icon?: string;
  data?: Record<string, unknown>;
  actions?: PushAction[];
  category?: string;
  threadId?: string;
}

interface PushAction {
  id: string;
  title: string;
  icon?: string;
  url?: string;
  destructive?: boolean;
  authenticationRequired?: boolean;
}

enum PushPlatform {
  IOS = 'ios',
  ANDROID = 'android',
  WEB = 'web'
}

interface DeviceRegistration {
  token: string;
  platform: PushPlatform;
  userId?: string;
  appVersion?: string;
  osVersion?: string;
  deviceModel?: string;
  timezone?: string;
  language?: string;
}
```

### In-App Notification Service

```typescript
interface InAppNotificationService {
  // In-app operations
  sendInApp(notification: InAppNotification): Promise<InAppDeliveryResult>;
  sendBulkInApp(notifications: InAppNotification[]): Promise<BulkInAppResult>;
  
  // User notifications
  getUserNotifications(userId: string, options?: NotificationQueryOptions): Promise<PaginatedNotifications>;
  markAsRead(notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
  deleteNotification(notificationId: string): Promise<void>;
  
  // Real-time delivery
  subscribeToNotifications(userId: string, callback: NotificationCallback): Subscription;
  getUnreadCount(userId: string): Promise<number>;
}

interface InAppNotification {
  userId: string;
  title: string;
  body: string;
  type: InAppNotificationType;
  priority: NotificationPriority;
  icon?: string;
  image?: string;
  actionUrl?: string;
  actions?: InAppAction[];
  data?: Record<string, unknown>;
  expiresAt?: Date;
  persistent?: boolean;
}

enum InAppNotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ALERT = 'alert',
  PROMOTION = 'promotion'
}

enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

interface InAppAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  url?: string;
  action?: string;
}
```

### Webhook Notification Service

```typescript
interface WebhookNotificationService {
  // Webhook operations
  sendWebhook(webhook: WebhookNotification): Promise<WebhookDeliveryResult>;
  sendBulkWebhooks(webhooks: WebhookNotification[]): Promise<BulkWebhookResult>;
  
  // Endpoint management
  registerEndpoint(endpoint: WebhookEndpoint): Promise<string>;
  updateEndpoint(endpointId: string, endpoint: Partial<WebhookEndpoint>): Promise<void>;
  deleteEndpoint(endpointId: string): Promise<void>;
  getEndpoint(endpointId: string): Promise<WebhookEndpoint>;
  
  // Delivery tracking
  getDeliveryAttempts(webhookId: string): Promise<WebhookDeliveryAttempt[]>;
  retryWebhook(webhookId: string): Promise<WebhookDeliveryResult>;
}

interface WebhookNotification {
  endpointId: string;
  event: string;
  payload: Record<string, unknown>;
  headers?: Record<string, string>;
  signature?: WebhookSignature;
  retryPolicy?: RetryPolicy;
  timeout?: number;
}

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  secret?: string;
  headers?: Record<string, string>;
  enabled: boolean;
  retryPolicy: RetryPolicy;
  timeout: number;
  metadata?: Record<string, unknown>;
}

interface WebhookSignature {
  algorithm: 'hmac-sha256' | 'hmac-sha512';
  header: string;
  secret: string;
}

interface WebhookDeliveryAttempt {
  attemptNumber: number;
  timestamp: Date;
  statusCode?: number;
  responseBody?: string;
  error?: string;
  duration: number;
}
```



### Multi-Channel Orchestrator

```typescript
interface MultiChannelOrchestrator {
  // Orchestration
  orchestrateDelivery(notification: UnifiedNotification): Promise<OrchestrationResult>;
  
  // Channel selection
  selectChannels(userId: string, notification: UnifiedNotification): Promise<ChannelSelection>;
  
  // Fallback handling
  handleDeliveryFailure(result: DeliveryResult, notification: UnifiedNotification): Promise<FallbackResult>;
  
  // A/B testing
  runChannelExperiment(experimentId: string, notification: UnifiedNotification): Promise<ExperimentResult>;
}

interface UnifiedNotification {
  id: string;
  userId: string;
  type: string;
  priority: NotificationPriority;
  content: NotificationContent;
  channels?: ChannelType[];
  channelOverrides?: Record<ChannelType, Partial<ChannelContent>>;
  scheduling?: SchedulingOptions;
  fallbackChain?: ChannelType[];
  metadata?: Record<string, unknown>;
}

interface NotificationContent {
  title: string;
  body: string;
  shortBody?: string;
  image?: string;
  icon?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  category?: string;
}

interface ChannelSelection {
  selectedChannels: ChannelType[];
  reasoning: string;
  userPreferences: UserChannelPreferences;
  deliveryOrder: ChannelType[];
}

interface OrchestrationResult {
  notificationId: string;
  channelResults: Record<ChannelType, DeliveryResult>;
  overallStatus: DeliveryStatus;
  fallbacksUsed: ChannelType[];
  totalDuration: number;
}
```

## Implementation Patterns

### Unified Notification Sender

```typescript
class UnifiedNotificationSender {
  private channels: Map<ChannelType, NotificationChannel> = new Map();
  private userPreferences: UserPreferencesService;
  private deliveryTracker: DeliveryTracker;

  async send(notification: UnifiedNotification): Promise<OrchestrationResult> {
    const startTime = Date.now();
    const channelResults: Record<ChannelType, DeliveryResult> = {};
    const fallbacksUsed: ChannelType[] = [];

    // Determine channels to use
    const channelSelection = await this.selectChannels(notification);
    
    // Send to each channel in order
    for (const channelType of channelSelection.deliveryOrder) {
      try {
        const result = await this.sendToChannel(channelType, notification);
        channelResults[channelType] = result;
        
        // Track delivery
        await this.deliveryTracker.trackDelivery(notification.id, channelType, result);
        
        // If successful and not requiring all channels, stop
        if (result.status === 'delivered' && !notification.requireAllChannels) {
          break;
        }
      } catch (error) {
        channelResults[channelType] = {
          status: 'failed',
          error: error.message,
          timestamp: new Date()
        };
        
        // Try fallback if available
        const fallbackResult = await this.tryFallback(notification, channelType);
        if (fallbackResult) {
          fallbacksUsed.push(fallbackResult.channel);
          channelResults[fallbackResult.channel] = fallbackResult.result;
        }
      }
    }

    return {
      notificationId: notification.id,
      channelResults,
      overallStatus: this.determineOverallStatus(channelResults),
      fallbacksUsed,
      totalDuration: Date.now() - startTime
    };
  }

  private async selectChannels(notification: UnifiedNotification): Promise<ChannelSelection> {
    // Get user preferences
    const preferences = await this.userPreferences.getPreferences(notification.userId);
    
    // Filter by user preferences and notification type
    let selectedChannels = notification.channels || this.getDefaultChannels(notification.type);
    selectedChannels = selectedChannels.filter(ch => 
      preferences.enabledChannels.includes(ch) &&
      this.isChannelAvailable(ch)
    );

    // Apply priority-based ordering
    const deliveryOrder = this.orderByPriority(selectedChannels, notification.priority);

    return {
      selectedChannels,
      reasoning: 'Selected based on user preferences and notification priority',
      userPreferences: preferences,
      deliveryOrder
    };
  }

  private async sendToChannel(channelType: ChannelType, notification: UnifiedNotification): Promise<DeliveryResult> {
    const channel = this.channels.get(channelType);
    if (!channel) {
      throw new Error(`Channel ${channelType} not configured`);
    }

    const channelContent = this.transformContent(notification, channelType);
    
    switch (channelType) {
      case ChannelType.EMAIL:
        return this.sendEmail(channelContent, notification);
      case ChannelType.SMS:
        return this.sendSMS(channelContent, notification);
      case ChannelType.PUSH:
        return this.sendPush(channelContent, notification);
      case ChannelType.IN_APP:
        return this.sendInApp(channelContent, notification);
      case ChannelType.WEBHOOK:
        return this.sendWebhook(channelContent, notification);
      default:
        throw new Error(`Unsupported channel type: ${channelType}`);
    }
  }

  private transformContent(notification: UnifiedNotification, channelType: ChannelType): ChannelContent {
    const baseContent = notification.content;
    const override = notification.channelOverrides?.[channelType];

    return {
      ...baseContent,
      ...override,
      // Channel-specific transformations
      body: channelType === ChannelType.SMS 
        ? (baseContent.shortBody || baseContent.body).substring(0, 160)
        : baseContent.body
    };
  }
}
```

### Email Provider Integration

```typescript
class EmailProviderAdapter {
  private providers: Map<string, EmailProvider> = new Map();
  private primaryProvider: string;
  private fallbackProviders: string[];

  constructor(config: EmailProviderConfig) {
    this.setupProviders(config);
  }

  private setupProviders(config: EmailProviderConfig): void {
    // SendGrid
    if (config.sendgrid) {
      this.providers.set('sendgrid', new SendGridProvider(config.sendgrid));
    }
    
    // AWS SES
    if (config.ses) {
      this.providers.set('ses', new SESProvider(config.ses));
    }
    
    // Mailgun
    if (config.mailgun) {
      this.providers.set('mailgun', new MailgunProvider(config.mailgun));
    }

    // Postmark
    if (config.postmark) {
      this.providers.set('postmark', new PostmarkProvider(config.postmark));
    }

    this.primaryProvider = config.primaryProvider;
    this.fallbackProviders = config.fallbackProviders || [];
  }

  async sendEmail(email: EmailNotification): Promise<EmailDeliveryResult> {
    const provider = this.providers.get(this.primaryProvider);
    if (!provider) {
      throw new Error(`Primary email provider ${this.primaryProvider} not configured`);
    }

    try {
      return await provider.send(email);
    } catch (error) {
      // Try fallback providers
      for (const fallbackName of this.fallbackProviders) {
        const fallback = this.providers.get(fallbackName);
        if (fallback) {
          try {
            return await fallback.send(email);
          } catch (fallbackError) {
            continue;
          }
        }
      }
      throw error;
    }
  }
}

// SendGrid implementation
class SendGridProvider implements EmailProvider {
  private client: SendGridClient;

  constructor(config: SendGridConfig) {
    this.client = new SendGridClient(config.apiKey);
  }

  async send(email: EmailNotification): Promise<EmailDeliveryResult> {
    const message = {
      to: email.to.map(r => ({ email: r.email, name: r.name })),
      from: { email: email.from.email, name: email.from.name },
      subject: email.subject,
      html: email.body.html,
      text: email.body.text,
      attachments: email.attachments?.map(a => ({
        content: a.content,
        filename: a.filename,
        type: a.contentType
      })),
      trackingSettings: {
        clickTracking: { enable: email.trackClicks },
        openTracking: { enable: email.trackOpens }
      }
    };

    const response = await this.client.send(message);
    
    return {
      messageId: response.headers['x-message-id'],
      status: 'sent',
      provider: 'sendgrid',
      timestamp: new Date(),
      recipientResults: email.to.map(r => ({
        recipient: r.email,
        status: 'sent'
      }))
    };
  }
}
```

### Push Notification Provider Integration

```typescript
class PushNotificationAdapter {
  private fcm: FirebaseMessaging;
  private apns: APNSProvider;
  private webPush: WebPushProvider;

  async sendPush(notification: PushNotification): Promise<PushDeliveryResult> {
    const results: PushDeliveryResult[] = [];

    // Group tokens by platform
    const tokensByPlatform = this.groupTokensByPlatform(notification.deviceTokens);

    // Send to each platform
    if (tokensByPlatform.android.length > 0) {
      const fcmResult = await this.sendToFCM(notification, tokensByPlatform.android);
      results.push(fcmResult);
    }

    if (tokensByPlatform.ios.length > 0) {
      const apnsResult = await this.sendToAPNS(notification, tokensByPlatform.ios);
      results.push(apnsResult);
    }

    if (tokensByPlatform.web.length > 0) {
      const webResult = await this.sendToWebPush(notification, tokensByPlatform.web);
      results.push(webResult);
    }

    return this.aggregateResults(results);
  }

  private async sendToFCM(notification: PushNotification, tokens: string[]): Promise<PushDeliveryResult> {
    const message = {
      tokens,
      notification: {
        title: notification.payload.title,
        body: notification.payload.body,
        imageUrl: notification.payload.image
      },
      data: notification.payload.data,
      android: {
        priority: notification.priority === 'high' ? 'high' : 'normal',
        ttl: notification.ttl ? `${notification.ttl}s` : undefined,
        collapseKey: notification.collapseKey,
        notification: {
          icon: notification.payload.icon,
          sound: notification.sound
        }
      }
    };

    const response = await this.fcm.sendMulticast(message);
    
    return {
      messageId: response.responses[0]?.messageId || '',
      status: response.failureCount === 0 ? 'delivered' : 'partial',
      provider: 'fcm',
      successCount: response.successCount,
      failureCount: response.failureCount,
      timestamp: new Date()
    };
  }

  private async sendToAPNS(notification: PushNotification, tokens: string[]): Promise<PushDeliveryResult> {
    const payload = {
      aps: {
        alert: {
          title: notification.payload.title,
          body: notification.payload.body
        },
        badge: notification.badge,
        sound: notification.sound || 'default',
        'thread-id': notification.payload.threadId,
        'mutable-content': 1
      },
      ...notification.payload.data
    };

    const results = await Promise.all(
      tokens.map(token => this.apns.send(token, payload))
    );

    const successCount = results.filter(r => r.success).length;
    
    return {
      messageId: results[0]?.messageId || '',
      status: successCount === tokens.length ? 'delivered' : 'partial',
      provider: 'apns',
      successCount,
      failureCount: tokens.length - successCount,
      timestamp: new Date()
    };
  }
}
```

## Integration Points

### Message Queue Integration

```typescript
// Async notification processing with message queues
class NotificationQueueProcessor {
  private queue: MessageQueue;
  private notificationSender: UnifiedNotificationSender;

  async enqueueNotification(notification: UnifiedNotification): Promise<string> {
    const jobId = generateJobId();
    
    await this.queue.publish('notifications', {
      jobId,
      notification,
      createdAt: new Date(),
      attempts: 0
    });

    return jobId;
  }

  async processQueue(): Promise<void> {
    await this.queue.subscribe('notifications', async (message) => {
      const { jobId, notification, attempts } = message;

      try {
        const result = await this.notificationSender.send(notification);
        await this.handleSuccess(jobId, result);
      } catch (error) {
        await this.handleFailure(jobId, notification, attempts, error);
      }
    });
  }

  private async handleFailure(
    jobId: string, 
    notification: UnifiedNotification, 
    attempts: number, 
    error: Error
  ): Promise<void> {
    if (attempts < MAX_RETRY_ATTEMPTS) {
      // Requeue with exponential backoff
      const delay = Math.pow(2, attempts) * 1000;
      await this.queue.publishDelayed('notifications', {
        jobId,
        notification,
        attempts: attempts + 1
      }, delay);
    } else {
      // Move to dead letter queue
      await this.queue.publish('notifications-dlq', {
        jobId,
        notification,
        error: error.message,
        failedAt: new Date()
      });
    }
  }
}
```

### Database Integration

```typescript
// Notification persistence and history
interface NotificationRepository {
  // Storage
  save(notification: NotificationRecord): Promise<void>;
  update(notificationId: string, updates: Partial<NotificationRecord>): Promise<void>;
  
  // Retrieval
  findById(notificationId: string): Promise<NotificationRecord | null>;
  findByUserId(userId: string, options: QueryOptions): Promise<PaginatedResult<NotificationRecord>>;
  findByStatus(status: DeliveryStatus, options: QueryOptions): Promise<PaginatedResult<NotificationRecord>>;
  
  // Analytics queries
  getDeliveryStats(timeRange: TimeRange): Promise<DeliveryStats>;
  getChannelPerformance(channelType: ChannelType, timeRange: TimeRange): Promise<ChannelPerformance>;
}

interface NotificationRecord {
  id: string;
  userId: string;
  type: string;
  content: NotificationContent;
  channels: ChannelDeliveryRecord[];
  status: DeliveryStatus;
  createdAt: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  metadata?: Record<string, unknown>;
}

interface ChannelDeliveryRecord {
  channel: ChannelType;
  status: DeliveryStatus;
  provider: string;
  messageId?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  attempts: number;
}
```

## Security Considerations

### API Security
- Use API keys with appropriate scopes for each notification provider
- Implement rate limiting to prevent abuse
- Validate all input data before sending to providers
- Use secure connections (TLS) for all provider communications

### Data Protection
- Encrypt sensitive notification content at rest
- Mask PII in logs and analytics
- Implement data retention policies for notification history
- Secure webhook endpoints with signature verification

### Access Control
- Implement role-based access for notification management
- Audit all notification sending activities
- Restrict access to notification templates and configurations
- Validate user permissions before sending notifications

## Compliance Guidelines

### GDPR Compliance
- Obtain explicit consent before sending marketing notifications
- Provide easy opt-out mechanisms for all channels
- Honor data deletion requests for notification history
- Document lawful basis for each notification type

### CAN-SPAM Compliance
- Include physical address in commercial emails
- Provide clear unsubscribe links
- Honor opt-out requests within 10 business days
- Use accurate sender information

### TCPA Compliance (SMS)
- Obtain prior express consent for SMS marketing
- Provide opt-out instructions in every message
- Respect quiet hours for non-urgent messages
- Maintain consent records

## Testing Considerations

### Unit Testing

```typescript
describe('UnifiedNotificationSender', () => {
  it('should send notification to selected channels', async () => {
    const sender = new UnifiedNotificationSender(mockChannels);
    const notification = createTestNotification();
    
    const result = await sender.send(notification);
    
    expect(result.overallStatus).toBe('delivered');
    expect(Object.keys(result.channelResults)).toContain('email');
  });

  it('should use fallback channel on primary failure', async () => {
    const sender = new UnifiedNotificationSender(mockChannelsWithFailure);
    const notification = createTestNotification({
      fallbackChain: [ChannelType.EMAIL, ChannelType.SMS]
    });
    
    const result = await sender.send(notification);
    
    expect(result.fallbacksUsed).toContain(ChannelType.SMS);
  });
});
```

### Integration Testing

```typescript
describe('Email Provider Integration', () => {
  it('should send email through SendGrid', async () => {
    const adapter = new EmailProviderAdapter(testConfig);
    const email = createTestEmail();
    
    const result = await adapter.sendEmail(email);
    
    expect(result.status).toBe('sent');
    expect(result.provider).toBe('sendgrid');
  });
});
```

### Property-Based Testing

```typescript
describe('Notification Channel Properties', () => {
  it('should always include required fields in channel content', () => {
    fc.assert(fc.property(
      fc.record({
        title: fc.string({ minLength: 1 }),
        body: fc.string({ minLength: 1 }),
        channelType: fc.constantFrom(...Object.values(ChannelType))
      }),
      (input) => {
        const content = transformContent(input, input.channelType);
        
        expect(content.title).toBeDefined();
        expect(content.body).toBeDefined();
      }
    ));
  });
});
```
