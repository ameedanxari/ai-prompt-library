# Social Media Application Development Guide

## Purpose

This guide provides comprehensive patterns for building production-ready social media applications using the AI Prompt Library v2 templates. It covers template selection, composition strategies, and implementation patterns for common social platform scenarios.

## Quick Start

### Essential Templates for Social Apps

| Feature Area | Primary Templates | Supporting Templates |
|--------------|-------------------|---------------------|
| Profiles | `social/user-profiles.md` | `social/user-verification.md`, `social/social-discovery.md` |
| Connections | `social/social-graphs.md` | `social/engagement-features.md` |
| Messaging | `social/real-time-messaging.md` | `social/message-encryption.md`, `social/voice-video-calls.md` |
| Content | `social/content-feeds.md` | `social/content-creation.md`, `social/content-moderation.md` |
| Safety | `social/communication-moderation.md` | `security/threat-detection.md` |

## Template Composition Patterns

### Pattern 1: Basic Social Network

For a friend-based social network:

```markdown
# Core Templates
1. social/user-profiles.md           # User profiles
2. social/social-graphs.md           # Friend connections
3. social/content-feeds.md           # News feed
4. social/content-creation.md        # Post creation
5. social/engagement-features.md     # Likes, comments, shares

# Supporting Templates
- security/multi-factor-auth.md      # Authentication
- notifications/real-time-notifications.md # Activity alerts
- search-discovery/full-text-search.md # User/content search
```

### Pattern 2: Messaging Platform

For a chat-focused application:

```markdown
# Core Templates
1. social/real-time-messaging.md     # Chat functionality
2. social/message-encryption.md      # E2E encryption
3. social/voice-video-calls.md       # Audio/video calls
4. social/user-profiles.md           # User profiles

# Group Features
- social/social-graphs.md            # Contact management
- real-time-communication/presence-systems.md # Online status
- notifications/notification-channels.md # Message notifications

# Media Handling
- media-streaming/media-processing.md # Media messages
- media-streaming/offline-sync.md    # Offline message access
```

### Pattern 3: Content Creator Platform

For influencer/creator-focused platforms:

```markdown
# Creator Tools
1. social/content-creation.md        # Content publishing
2. social/content-feeds.md           # Discovery feeds
3. media-streaming/live-streaming.md # Live broadcasts
4. social/engagement-features.md     # Fan engagement

# Monetization
- commerce/payment-subscriptions.md  # Creator subscriptions
- commerce/payment-processing.md     # Tips and donations
- analytics/user-analytics.md        # Audience insights

# Community
- social/content-moderation.md       # Comment moderation
- gamification/achievement-systems.md # Creator milestones
```

## Implementation Examples

### Example 1: Social Graph with Friend Suggestions

```typescript
// Combining social-graphs.md and social-discovery.md patterns

interface SocialGraph {
  // From social-graphs.md
  connections: Connection[];
  followers: string[];
  following: string[];
  blocked: string[];
  
  // From social-discovery.md
  suggestions: UserSuggestion[];
  mutualConnections: Map<string, string[]>;
}

class SocialGraphService {
  async getSuggestions(userId: string): Promise<UserSuggestion[]> {
    // Get user's connections
    const connections = await this.getConnections(userId);
    
    // Find friends of friends (mutual connections)
    const friendsOfFriends = await this.getFriendsOfFriends(connections);
    
    // Score by mutual connection count
    const scored = friendsOfFriends.map(user => ({
      user,
      score: this.calculateMutualScore(user, connections),
      mutualFriends: this.getMutualFriends(user, connections)
    }));
    
    // Filter out existing connections and blocked users
    const filtered = scored.filter(s => 
      !connections.includes(s.user.id) && 
      !this.isBlocked(userId, s.user.id)
    );
    
    return filtered
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
  }
  
  async sendFriendRequest(fromUserId: string, toUserId: string): Promise<FriendRequest> {
    // Check if already connected
    if (await this.areConnected(fromUserId, toUserId)) {
      throw new AlreadyConnectedError();
    }
    
    // Check if blocked
    if (await this.isBlocked(toUserId, fromUserId)) {
      throw new UserBlockedError();
    }
    
    // Create friend request
    const request = await this.createFriendRequest(fromUserId, toUserId);
    
    // Send notification
    await this.notificationService.sendFriendRequestNotification(toUserId, fromUserId);
    
    return request;
  }
}
```

### Example 2: Real-Time Feed with Engagement

```typescript
// Combining content-feeds.md and engagement-features.md patterns

interface FeedItem {
  // From content-feeds.md
  id: string;
  authorId: string;
  content: PostContent;
  createdAt: Date;
  visibility: 'public' | 'friends' | 'private';
  
  // From engagement-features.md
  likes: number;
  comments: number;
  shares: number;
  userReaction?: ReactionType;
}

class FeedService {
  async getFeed(userId: string, cursor?: string): Promise<FeedPage> {
    // Get user's connections for feed filtering
    const connections = await this.socialGraph.getConnections(userId);
    
    // Fetch posts from connections (chronological + algorithmic blend)
    const posts = await this.fetchFeedPosts(userId, connections, cursor);
    
    // Enrich with engagement data
    const enrichedPosts = await Promise.all(
      posts.map(async post => ({
        ...post,
        likes: await this.getLikeCount(post.id),
        comments: await this.getCommentCount(post.id),
        shares: await this.getShareCount(post.id),
        userReaction: await this.getUserReaction(userId, post.id)
      }))
    );
    
    return {
      items: enrichedPosts,
      nextCursor: this.generateCursor(posts),
      hasMore: posts.length === this.pageSize
    };
  }
  
  async addReaction(userId: string, postId: string, reaction: ReactionType): Promise<void> {
    // Add reaction
    await this.reactionRepository.upsert({
      userId,
      postId,
      reaction,
      createdAt: new Date()
    });
    
    // Update reaction count (denormalized)
    await this.updateReactionCount(postId);
    
    // Notify post author
    const post = await this.getPost(postId);
    if (post.authorId !== userId) {
      await this.notificationService.sendReactionNotification(
        post.authorId, 
        userId, 
        postId, 
        reaction
      );
    }
    
    // Broadcast to real-time subscribers
    await this.realTimeService.broadcast(`post:${postId}`, {
      type: 'reaction_added',
      userId,
      reaction
    });
  }
}
```

### Example 3: Encrypted Messaging

```typescript
// Combining real-time-messaging.md and message-encryption.md patterns

interface SecureMessage {
  // From real-time-messaging.md
  id: string;
  conversationId: string;
  senderId: string;
  timestamp: Date;
  
  // From message-encryption.md
  encryptedContent: string;
  encryptionKeyId: string;
  signature: string;
}

class SecureMessagingService {
  async sendMessage(
    senderId: string, 
    conversationId: string, 
    content: string
  ): Promise<SecureMessage> {
    // Get recipient's public key
    const conversation = await this.getConversation(conversationId);
    const recipientKeys = await this.getRecipientKeys(conversation.participants);
    
    // Encrypt message for each recipient
    const encryptedContent = await this.encryptForRecipients(content, recipientKeys);
    
    // Sign message
    const senderKey = await this.getSenderPrivateKey(senderId);
    const signature = await this.signMessage(encryptedContent, senderKey);
    
    // Store encrypted message
    const message = await this.messageRepository.create({
      conversationId,
      senderId,
      encryptedContent,
      encryptionKeyId: recipientKeys.keyId,
      signature,
      timestamp: new Date()
    });
    
    // Deliver via WebSocket
    await this.deliverMessage(conversation.participants, message);
    
    // Send push notification (without content)
    await this.sendPushNotification(conversation.participants, senderId);
    
    return message;
  }
  
  async decryptMessage(userId: string, message: SecureMessage): Promise<string> {
    // Verify signature
    const senderPublicKey = await this.getPublicKey(message.senderId);
    const isValid = await this.verifySignature(
      message.encryptedContent, 
      message.signature, 
      senderPublicKey
    );
    
    if (!isValid) {
      throw new InvalidSignatureError();
    }
    
    // Decrypt with user's private key
    const userPrivateKey = await this.getUserPrivateKey(userId);
    return await this.decrypt(message.encryptedContent, userPrivateKey);
  }
}
```

## Content Moderation

### Automated Moderation Pipeline

```typescript
// From content-moderation.md patterns

interface ModerationResult {
  approved: boolean;
  flags: ModerationFlag[];
  action: 'approve' | 'review' | 'reject' | 'shadowban';
  confidence: number;
}

class ContentModerationService {
  async moderateContent(content: UserContent): Promise<ModerationResult> {
    // Run parallel moderation checks
    const [textAnalysis, imageAnalysis, spamCheck, userHistory] = await Promise.all([
      this.analyzeText(content.text),
      this.analyzeImages(content.media),
      this.checkSpam(content),
      this.getUserModerationHistory(content.authorId)
    ]);
    
    // Aggregate results
    const flags = [
      ...textAnalysis.flags,
      ...imageAnalysis.flags,
      ...spamCheck.flags
    ];
    
    // Determine action based on flags and user history
    const action = this.determineAction(flags, userHistory);
    
    // Log moderation decision
    await this.logModerationDecision(content.id, flags, action);
    
    return {
      approved: action === 'approve',
      flags,
      action,
      confidence: this.calculateConfidence(flags)
    };
  }
  
  private determineAction(
    flags: ModerationFlag[], 
    history: UserModerationHistory
  ): ModerationAction {
    const severityScore = flags.reduce((sum, f) => sum + f.severity, 0);
    
    if (severityScore === 0) return 'approve';
    if (severityScore > 0.8 || history.recentViolations > 3) return 'reject';
    if (severityScore > 0.5) return 'review';
    if (history.recentViolations > 1) return 'shadowban';
    
    return 'approve';
  }
}
```

### User Reporting System

```typescript
// From communication-moderation.md patterns

interface UserReport {
  reportId: string;
  reporterId: string;
  reportedUserId: string;
  contentId?: string;
  reason: ReportReason;
  description: string;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
}

class ReportingService {
  async submitReport(report: Omit<UserReport, 'reportId' | 'status'>): Promise<UserReport> {
    // Validate report
    if (report.reporterId === report.reportedUserId) {
      throw new InvalidReportError('Cannot report yourself');
    }
    
    // Check for duplicate reports
    const existingReport = await this.findDuplicateReport(report);
    if (existingReport) {
      return existingReport; // Return existing report
    }
    
    // Create report
    const newReport = await this.reportRepository.create({
      ...report,
      reportId: this.generateReportId(),
      status: 'pending',
      createdAt: new Date()
    });
    
    // Check if user has multiple reports
    const reportCount = await this.getReportCount(report.reportedUserId);
    if (reportCount >= this.autoReviewThreshold) {
      await this.escalateForReview(report.reportedUserId);
    }
    
    return newReport;
  }
}
```

## Real-Time Features

### WebSocket Connection Management

```typescript
// From real-time-communication/websocket-management.md patterns

class WebSocketManager {
  private connections: Map<string, WebSocket> = new Map();
  private subscriptions: Map<string, Set<string>> = new Map();
  
  async handleConnection(userId: string, ws: WebSocket): Promise<void> {
    // Store connection
    this.connections.set(userId, ws);
    
    // Update presence
    await this.presenceService.setOnline(userId);
    
    // Broadcast presence to friends
    const friends = await this.socialGraph.getConnections(userId);
    await this.broadcastPresence(friends, userId, 'online');
    
    // Handle disconnection
    ws.on('close', () => this.handleDisconnection(userId));
  }
  
  async broadcast(channel: string, message: any): Promise<void> {
    const subscribers = this.subscriptions.get(channel) || new Set();
    
    for (const userId of subscribers) {
      const ws = this.connections.get(userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    }
  }
  
  async subscribe(userId: string, channel: string): Promise<void> {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(userId);
  }
}
```

### Presence System

```typescript
// From real-time-communication/presence-systems.md patterns

interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: Date;
  customStatus?: string;
  device?: string;
}

class PresenceService {
  async setOnline(userId: string, device?: string): Promise<void> {
    await this.presenceStore.set(userId, {
      status: 'online',
      lastSeen: new Date(),
      device
    });
    
    // Set TTL for automatic offline detection
    await this.presenceStore.expire(userId, 60); // 60 seconds
  }
  
  async heartbeat(userId: string): Promise<void> {
    // Refresh TTL
    await this.presenceStore.expire(userId, 60);
    await this.presenceStore.update(userId, { lastSeen: new Date() });
  }
  
  async getPresence(userIds: string[]): Promise<Map<string, UserPresence>> {
    const presences = new Map();
    
    for (const userId of userIds) {
      const presence = await this.presenceStore.get(userId);
      presences.set(userId, presence || { 
        userId, 
        status: 'offline', 
        lastSeen: await this.getLastSeen(userId) 
      });
    }
    
    return presences;
  }
}
```

## Privacy & Security

### Privacy Controls

```typescript
// From security/privacy-controls.md patterns

interface PrivacySettings {
  profileVisibility: 'public' | 'friends' | 'private';
  messagePermissions: 'everyone' | 'friends' | 'none';
  activityStatus: boolean;
  searchable: boolean;
  dataSharing: DataSharingPreferences;
}

class PrivacyService {
  async canViewProfile(viewerId: string, profileId: string): Promise<boolean> {
    const settings = await this.getPrivacySettings(profileId);
    
    switch (settings.profileVisibility) {
      case 'public':
        return true;
      case 'friends':
        return await this.socialGraph.areConnected(viewerId, profileId);
      case 'private':
        return viewerId === profileId;
    }
  }
  
  async canSendMessage(senderId: string, recipientId: string): Promise<boolean> {
    // Check if blocked
    if (await this.isBlocked(recipientId, senderId)) {
      return false;
    }
    
    const settings = await this.getPrivacySettings(recipientId);
    
    switch (settings.messagePermissions) {
      case 'everyone':
        return true;
      case 'friends':
        return await this.socialGraph.areConnected(senderId, recipientId);
      case 'none':
        return false;
    }
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('SocialGraphService', () => {
  it('should suggest friends based on mutual connections', async () => {
    const suggestions = await socialGraph.getSuggestions('user-1');
    
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].mutualFriends.length).toBeGreaterThan(0);
  });
  
  it('should not suggest blocked users', async () => {
    await socialGraph.blockUser('user-1', 'user-blocked');
    const suggestions = await socialGraph.getSuggestions('user-1');
    
    expect(suggestions.find(s => s.user.id === 'user-blocked')).toBeUndefined();
  });
});
```

### Property-Based Tests

```typescript
describe('Feed Properties', () => {
  it('feed should only contain posts from connections or public posts', () => {
    fc.assert(fc.property(
      fc.record({
        userId: fc.string(),
        connections: fc.array(fc.string())
      }),
      async ({ userId, connections }) => {
        const feed = await feedService.getFeed(userId);
        
        return feed.items.every(item => 
          connections.includes(item.authorId) || 
          item.visibility === 'public'
        );
      }
    ));
  });
});
```

## Common Pitfalls

1. **N+1 queries in feeds**: Use batch loading and denormalization
2. **Real-time scaling**: Use Redis pub/sub or dedicated message brokers
3. **Content moderation delays**: Implement async moderation with optimistic display
4. **Privacy leaks**: Always check permissions before returning data
5. **Notification spam**: Implement batching and user preferences

## Related Templates

- `analytics/user-analytics.md` - User engagement tracking
- `gamification/achievement-systems.md` - Social achievements
- `search-discovery/recommendation-systems.md` - Content recommendations
- `media-streaming/media-processing.md` - Media handling
- `notifications/notification-personalization.md` - Smart notifications

## Next Steps

1. Define your social graph model (friends vs followers)
2. Implement core profile and connection features
3. Add content creation and feed functionality
4. Integrate real-time messaging
5. Deploy content moderation pipeline
6. Add privacy controls and user safety features
