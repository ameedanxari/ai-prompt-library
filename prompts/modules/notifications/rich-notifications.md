# Rich Notifications Template

## Purpose

This template provides comprehensive patterns for implementing rich notifications including interactive elements, action buttons, rich media content, and deep linking. It enables engaging notification experiences that drive user action and improve conversion rates across all notification channels.

## Context

Modern notification systems must go beyond simple text messages to deliver rich, interactive experiences that capture user attention and drive engagement. This template addresses the challenges of creating visually appealing notifications with images and media, implementing interactive elements like buttons and quick replies, enabling deep linking to specific app content, and ensuring rich notifications work consistently across different platforms and devices.

## Core Components

### Rich Notification Service

```typescript
interface RichNotificationService {
  // Rich notification creation
  createRichNotification(notification: RichNotificationRequest): Promise<RichNotification>;
  
  // Media handling
  attachMedia(notificationId: string, media: MediaAttachment): Promise<void>;
  
  // Action handling
  addActions(notificationId: string, actions: NotificationAction[]): Promise<void>;
  
  // Deep linking
  generateDeepLink(target: DeepLinkTarget): string;
  resolveDeepLink(link: string): Promise<DeepLinkResolution>;
}

interface RichNotificationRequest {
  userId: string;
  title: string;
  body: string;
  subtitle?: string;
  media?: MediaAttachment;
  actions?: NotificationAction[];
  deepLink?: string;
  category?: string;
  priority: NotificationPriority;
  channelOverrides?: ChannelRichContent;
}

interface RichNotification {
  id: string;
  userId: string;
  content: RichContent;
  actions: NotificationAction[];
  deepLink?: string;
  createdAt: Date;
  expiresAt?: Date;
}

interface RichContent {
  title: string;
  body: string;
  subtitle?: string;
  media?: ProcessedMedia;
  style: NotificationStyle;
  expandedContent?: ExpandedContent;
}

enum NotificationStyle {
  DEFAULT = 'default',
  BIG_TEXT = 'big_text',
  BIG_PICTURE = 'big_picture',
  INBOX = 'inbox',
  MESSAGING = 'messaging',
  MEDIA = 'media'
}
```

### Media Attachment Service

```typescript
interface MediaAttachmentService {
  // Media processing
  processMedia(media: MediaInput): Promise<ProcessedMedia>;
  
  // Media optimization
  optimizeForChannel(media: ProcessedMedia, channel: ChannelType): Promise<OptimizedMedia>;
  
  // Media validation
  validateMedia(media: MediaInput): Promise<MediaValidationResult>;
  
  // Media hosting
  uploadMedia(media: MediaInput): Promise<MediaUrl>;
  getMediaUrl(mediaId: string, options?: MediaUrlOptions): string;
}

interface MediaAttachment {
  type: MediaType;
  url?: string;
  data?: Buffer;
  mimeType: string;
  filename?: string;
  thumbnailUrl?: string;
  altText?: string;
  dimensions?: MediaDimensions;
}

enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  GIF = 'gif',
  DOCUMENT = 'document'
}

interface ProcessedMedia {
  id: string;
  type: MediaType;
  originalUrl: string;
  optimizedUrls: Record<string, string>;
  thumbnailUrl?: string;
  dimensions: MediaDimensions;
  fileSize: number;
  duration?: number; // For video/audio
  altText?: string;
}

interface MediaDimensions {
  width: number;
  height: number;
  aspectRatio: string;
}

interface MediaValidationResult {
  valid: boolean;
  errors: MediaValidationError[];
  warnings: string[];
  recommendations: string[];
}

interface MediaValidationError {
  code: string;
  message: string;
  field?: string;
}
```

### Interactive Actions Service

```typescript
interface InteractiveActionsService {
  // Action management
  createAction(action: ActionDefinition): NotificationAction;
  
  // Action handling
  handleActionResponse(response: ActionResponse): Promise<ActionResult>;
  
  // Quick replies
  createQuickReplies(options: QuickReplyOption[]): QuickReply[];
  
  // Input actions
  createInputAction(config: InputActionConfig): InputAction;
}

interface NotificationAction {
  id: string;
  type: ActionType;
  label: string;
  icon?: string;
  url?: string;
  data?: Record<string, unknown>;
  style?: ActionStyle;
  requiresAuth?: boolean;
  destructive?: boolean;
}

enum ActionType {
  OPEN_URL = 'open_url',
  DEEP_LINK = 'deep_link',
  QUICK_REPLY = 'quick_reply',
  INPUT = 'input',
  DISMISS = 'dismiss',
  SNOOZE = 'snooze',
  CUSTOM = 'custom'
}

enum ActionStyle {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  DESTRUCTIVE = 'destructive'
}

interface QuickReply {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

interface InputAction {
  id: string;
  type: 'text' | 'number' | 'selection';
  placeholder?: string;
  options?: SelectionOption[];
  validation?: InputValidation;
}

interface ActionResponse {
  notificationId: string;
  actionId: string;
  userId: string;
  responseType: ActionType;
  responseData?: Record<string, unknown>;
  timestamp: Date;
}

interface ActionResult {
  success: boolean;
  nextAction?: string;
  message?: string;
  data?: Record<string, unknown>;
}
```

### Deep Linking Service

```typescript
interface DeepLinkingService {
  // Deep link generation
  generateDeepLink(target: DeepLinkTarget): string;
  generateUniversalLink(target: DeepLinkTarget): string;
  
  // Deep link resolution
  resolveDeepLink(link: string): Promise<DeepLinkResolution>;
  
  // Deferred deep linking
  storeDeferredDeepLink(link: string, userId?: string): Promise<string>;
  retrieveDeferredDeepLink(token: string): Promise<DeepLinkTarget | null>;
  
  // Link tracking
  trackDeepLinkClick(linkId: string, context: ClickContext): Promise<void>;
}

interface DeepLinkTarget {
  screen: string;
  params?: Record<string, string>;
  fallbackUrl?: string;
  campaign?: string;
  source?: string;
}

interface DeepLinkResolution {
  valid: boolean;
  target?: DeepLinkTarget;
  requiresAuth: boolean;
  appInstalled: boolean;
  fallbackUrl?: string;
}

interface ClickContext {
  userId?: string;
  deviceType: string;
  platform: string;
  timestamp: Date;
  referrer?: string;
}

// Universal link configuration
interface UniversalLinkConfig {
  domain: string;
  pathPrefix: string;
  appId: {
    ios?: string;
    android?: string;
  };
  fallbackUrl: string;
}
```

### Expanded Content Service

```typescript
interface ExpandedContentService {
  // Expanded content creation
  createExpandedContent(content: ExpandedContentRequest): ExpandedContent;
  
  // Content types
  createBigTextContent(text: string, summary?: string): BigTextContent;
  createBigPictureContent(image: MediaAttachment, summary?: string): BigPictureContent;
  createInboxContent(lines: string[], summary?: string): InboxContent;
  createMessagingContent(messages: MessageItem[]): MessagingContent;
}

interface ExpandedContent {
  type: ExpandedContentType;
  summary?: string;
  content: BigTextContent | BigPictureContent | InboxContent | MessagingContent;
}

enum ExpandedContentType {
  BIG_TEXT = 'big_text',
  BIG_PICTURE = 'big_picture',
  INBOX = 'inbox',
  MESSAGING = 'messaging'
}

interface BigTextContent {
  text: string;
  summary?: string;
}

interface BigPictureContent {
  image: ProcessedMedia;
  summary?: string;
  largeIcon?: ProcessedMedia;
}

interface InboxContent {
  lines: string[];
  summary?: string;
  maxLines?: number;
}

interface MessagingContent {
  conversationTitle?: string;
  messages: MessageItem[];
  isGroupConversation: boolean;
}

interface MessageItem {
  sender: MessageSender;
  text: string;
  timestamp: Date;
  image?: ProcessedMedia;
}

interface MessageSender {
  name: string;
  avatar?: string;
  isCurrentUser: boolean;
}
```

## Implementation Patterns

### Rich Notification Builder

```typescript
class RichNotificationBuilder {
  private notification: Partial<RichNotification> = {};
  private mediaService: MediaAttachmentService;
  private deepLinkService: DeepLinkingService;

  constructor(mediaService: MediaAttachmentService, deepLinkService: DeepLinkingService) {
    this.mediaService = mediaService;
    this.deepLinkService = deepLinkService;
  }

  setContent(title: string, body: string, subtitle?: string): this {
    this.notification.content = {
      title,
      body,
      subtitle,
      style: NotificationStyle.DEFAULT
    };
    return this;
  }

  async addImage(imageUrl: string, altText?: string): Promise<this> {
    const media = await this.mediaService.processMedia({
      type: MediaType.IMAGE,
      url: imageUrl
    });

    this.notification.content = {
      ...this.notification.content!,
      media,
      style: NotificationStyle.BIG_PICTURE
    };

    return this;
  }

  addAction(action: NotificationAction): this {
    if (!this.notification.actions) {
      this.notification.actions = [];
    }
    this.notification.actions.push(action);
    return this;
  }

  addPrimaryAction(label: string, deepLinkTarget: DeepLinkTarget): this {
    const deepLink = this.deepLinkService.generateDeepLink(deepLinkTarget);
    return this.addAction({
      id: generateActionId(),
      type: ActionType.DEEP_LINK,
      label,
      url: deepLink,
      style: ActionStyle.PRIMARY
    });
  }

  addQuickReplies(options: QuickReplyOption[]): this {
    const quickReplies = options.map(opt => ({
      id: generateActionId(),
      type: ActionType.QUICK_REPLY,
      label: opt.label,
      data: { value: opt.value },
      style: ActionStyle.DEFAULT
    }));

    this.notification.actions = [
      ...(this.notification.actions || []),
      ...quickReplies
    ];

    return this;
  }

  setDeepLink(target: DeepLinkTarget): this {
    this.notification.deepLink = this.deepLinkService.generateDeepLink(target);
    return this;
  }

  setExpandedContent(content: ExpandedContent): this {
    this.notification.content = {
      ...this.notification.content!,
      expandedContent: content
    };
    return this;
  }

  build(): RichNotification {
    if (!this.notification.content) {
      throw new Error('Notification content is required');
    }

    return {
      id: generateNotificationId(),
      userId: this.notification.userId!,
      content: this.notification.content as RichContent,
      actions: this.notification.actions || [],
      deepLink: this.notification.deepLink,
      createdAt: new Date()
    };
  }
}

// Usage example
async function createPromotionalNotification(userId: string, product: Product): Promise<RichNotification> {
  const builder = new RichNotificationBuilder(mediaService, deepLinkService);

  return builder
    .setContent(
      '🎉 Special Offer!',
      `${product.name} is now ${product.discount}% off!`,
      'Limited time only'
    )
    .await addImage(product.imageUrl, product.name)
    .addPrimaryAction('Shop Now', {
      screen: 'product_detail',
      params: { productId: product.id }
    })
    .addAction({
      id: 'remind_later',
      type: ActionType.SNOOZE,
      label: 'Remind Me Later',
      style: ActionStyle.SECONDARY
    })
    .setDeepLink({
      screen: 'product_detail',
      params: { productId: product.id },
      campaign: 'flash_sale'
    })
    .build();
}
```

### Platform-Specific Rich Content Adapter

```typescript
class PlatformRichContentAdapter {
  adaptForPlatform(notification: RichNotification, platform: Platform): PlatformNotification {
    switch (platform) {
      case Platform.IOS:
        return this.adaptForIOS(notification);
      case Platform.ANDROID:
        return this.adaptForAndroid(notification);
      case Platform.WEB:
        return this.adaptForWeb(notification);
      default:
        return this.adaptForDefault(notification);
    }
  }

  private adaptForIOS(notification: RichNotification): IOSNotification {
    const payload: IOSNotification = {
      aps: {
        alert: {
          title: notification.content.title,
          subtitle: notification.content.subtitle,
          body: notification.content.body
        },
        'mutable-content': 1,
        category: notification.content.style
      }
    };

    // Add media attachment
    if (notification.content.media) {
      payload.mediaUrl = notification.content.media.optimizedUrls['ios'];
      payload.mediaType = notification.content.media.type;
    }

    // Add actions
    if (notification.actions.length > 0) {
      payload.aps.category = this.getIOSCategory(notification.actions);
    }

    // Add deep link
    if (notification.deepLink) {
      payload.deepLink = notification.deepLink;
    }

    return payload;
  }

  private adaptForAndroid(notification: RichNotification): AndroidNotification {
    const payload: AndroidNotification = {
      notification: {
        title: notification.content.title,
        body: notification.content.body,
        icon: 'ic_notification'
      },
      data: {}
    };

    // Set notification style
    switch (notification.content.style) {
      case NotificationStyle.BIG_TEXT:
        payload.notification.style = 'bigText';
        payload.notification.bigText = notification.content.expandedContent?.content;
        break;
      case NotificationStyle.BIG_PICTURE:
        payload.notification.style = 'bigPicture';
        payload.notification.imageUrl = notification.content.media?.optimizedUrls['android'];
        break;
      case NotificationStyle.INBOX:
        payload.notification.style = 'inbox';
        payload.notification.lines = (notification.content.expandedContent?.content as InboxContent)?.lines;
        break;
    }

    // Add actions
    if (notification.actions.length > 0) {
      payload.notification.actions = notification.actions.map(action => ({
        action: action.id,
        title: action.label,
        icon: action.icon
      }));
    }

    // Add deep link
    if (notification.deepLink) {
      payload.data.deepLink = notification.deepLink;
    }

    return payload;
  }

  private adaptForWeb(notification: RichNotification): WebNotification {
    const payload: WebNotification = {
      title: notification.content.title,
      body: notification.content.body,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge.png',
      tag: notification.id,
      requireInteraction: notification.actions.length > 0
    };

    // Add image
    if (notification.content.media) {
      payload.image = notification.content.media.optimizedUrls['web'];
    }

    // Add actions (max 2 for web)
    if (notification.actions.length > 0) {
      payload.actions = notification.actions.slice(0, 2).map(action => ({
        action: action.id,
        title: action.label,
        icon: action.icon
      }));
    }

    // Add deep link as data
    if (notification.deepLink) {
      payload.data = { deepLink: notification.deepLink };
    }

    return payload;
  }
}
```

### Action Response Handler

```typescript
class ActionResponseHandler {
  private actionHandlers: Map<ActionType, ActionHandler> = new Map();
  private analyticsService: AnalyticsService;

  registerHandler(actionType: ActionType, handler: ActionHandler): void {
    this.actionHandlers.set(actionType, handler);
  }

  async handleResponse(response: ActionResponse): Promise<ActionResult> {
    // Track the action
    await this.analyticsService.trackAction(response);

    // Get the appropriate handler
    const handler = this.actionHandlers.get(response.responseType);
    if (!handler) {
      return { success: false, message: 'Unknown action type' };
    }

    try {
      const result = await handler.handle(response);
      
      // Track the result
      await this.analyticsService.trackActionResult(response.notificationId, result);
      
      return result;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  }
}

// Example handlers
class DeepLinkActionHandler implements ActionHandler {
  async handle(response: ActionResponse): Promise<ActionResult> {
    const deepLink = response.responseData?.url as string;
    
    return {
      success: true,
      nextAction: 'navigate',
      data: { url: deepLink }
    };
  }
}

class QuickReplyActionHandler implements ActionHandler {
  private messageService: MessageService;

  async handle(response: ActionResponse): Promise<ActionResult> {
    const replyValue = response.responseData?.value as string;
    
    // Process the quick reply
    await this.messageService.processQuickReply(
      response.userId,
      response.notificationId,
      replyValue
    );

    return {
      success: true,
      message: 'Reply sent'
    };
  }
}
```

## Integration Points

### Push Notification Integration

```typescript
// Rich push notification delivery
interface RichPushIntegration {
  sendRichPush(notification: RichNotification, deviceTokens: string[]): Promise<PushDeliveryResult>;
  
  // Platform-specific
  sendToAPNS(notification: RichNotification, tokens: string[]): Promise<APNSResult>;
  sendToFCM(notification: RichNotification, tokens: string[]): Promise<FCMResult>;
  sendToWebPush(notification: RichNotification, subscriptions: PushSubscription[]): Promise<WebPushResult>;
}

// Notification service extension (iOS)
interface NotificationServiceExtension {
  didReceive(request: UNNotificationRequest): Promise<UNNotificationContent>;
  downloadMedia(url: string): Promise<UNNotificationAttachment>;
}
```

### Analytics Integration

```typescript
// Rich notification analytics
interface RichNotificationAnalytics {
  trackImpression(notificationId: string, context: ImpressionContext): Promise<void>;
  trackExpansion(notificationId: string): Promise<void>;
  trackMediaView(notificationId: string, mediaId: string): Promise<void>;
  trackActionClick(notificationId: string, actionId: string): Promise<void>;
  trackDeepLinkNavigation(notificationId: string, destination: string): Promise<void>;
}

interface ImpressionContext {
  platform: Platform;
  deviceType: string;
  displayStyle: NotificationStyle;
  timestamp: Date;
}
```

## Security Considerations

### Media Security
- Validate media URLs before processing
- Scan uploaded media for malware
- Use signed URLs for media access
- Implement content security policies

### Deep Link Security
- Validate deep link targets
- Prevent open redirect vulnerabilities
- Authenticate sensitive deep links
- Rate limit deep link generation

### Action Security
- Validate action responses
- Authenticate user for sensitive actions
- Implement CSRF protection for web actions
- Log all action executions

## Compliance Guidelines

### Accessibility
- Provide alt text for all images
- Ensure action labels are descriptive
- Support screen readers
- Maintain sufficient color contrast

### Platform Guidelines
- Follow iOS Human Interface Guidelines
- Adhere to Android notification best practices
- Comply with web notification standards
- Respect platform-specific limitations

## Testing Considerations

### Unit Testing

```typescript
describe('RichNotificationBuilder', () => {
  it('should build notification with image and actions', async () => {
    const builder = new RichNotificationBuilder(mockMediaService, mockDeepLinkService);
    
    const notification = await builder
      .setContent('Test Title', 'Test Body')
      .addImage('https://example.com/image.jpg')
      .addPrimaryAction('Click Me', { screen: 'home' })
      .build();
    
    expect(notification.content.title).toBe('Test Title');
    expect(notification.content.media).toBeDefined();
    expect(notification.actions).toHaveLength(1);
  });
});

describe('PlatformRichContentAdapter', () => {
  it('should adapt notification for iOS', () => {
    const adapter = new PlatformRichContentAdapter();
    const notification = createTestRichNotification();
    
    const iosPayload = adapter.adaptForPlatform(notification, Platform.IOS);
    
    expect(iosPayload.aps.alert.title).toBe(notification.content.title);
    expect(iosPayload.aps['mutable-content']).toBe(1);
  });
});
```

### Property-Based Testing

```typescript
describe('Rich Notification Properties', () => {
  it('should always produce valid platform payloads', () => {
    fc.assert(fc.property(
      fc.record({
        title: fc.string({ minLength: 1, maxLength: 100 }),
        body: fc.string({ minLength: 1, maxLength: 500 }),
        platform: fc.constantFrom(Platform.IOS, Platform.ANDROID, Platform.WEB)
      }),
      (input) => {
        const notification = createNotification(input.title, input.body);
        const adapter = new PlatformRichContentAdapter();
        const payload = adapter.adaptForPlatform(notification, input.platform);
        
        expect(payload).toBeDefined();
        // Platform-specific validations
        if (input.platform === Platform.IOS) {
          expect(payload.aps).toBeDefined();
        }
      }
    ));
  });
});
```
