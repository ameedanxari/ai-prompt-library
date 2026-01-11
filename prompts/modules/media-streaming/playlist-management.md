# Playlist Management Template

## Purpose
This template provides comprehensive patterns for implementing playlist creation, management, and collaborative features in media streaming applications. It covers playlist operations, sharing mechanisms, smart playlist generation, and social playlist features.

## Context
Playlists are a core feature of media streaming platforms, enabling users to organize, share, and discover content. Modern playlist systems go beyond simple collections to include collaborative editing, AI-powered smart playlists, and social features. This template addresses the complexity of building scalable playlist systems that support millions of playlists while enabling real-time collaboration and intelligent content curation.

## Instructions

1. **Setup Playlist System**: Configure playlist storage and management infrastructure
2. **Implement CRUD Operations**: Build create, read, update, delete playlist functionality
3. **Add Collaboration Features**: Enable shared playlists and collaborative editing
4. **Configure Smart Playlists**: Implement dynamic playlists based on rules and AI
5. **Enable Social Features**: Add playlist sharing, following, and discovery
6. **Add Playlist Analytics**: Track playlist performance and user engagement
7. **Test Playlist Workflows**: Validate creation, sharing, and collaboration features

## Examples

### Example 1: Playlist Management System
```typescript
interface PlaylistManager {
  createPlaylist(data: PlaylistData): Promise<Playlist>;
  addToPlaylist(playlistId: string, contentIds: string[]): Promise<void>;
  sharePlaylist(playlistId: string, shareOptions: ShareOptions): Promise<ShareResult>;
}

const playlistManager = new PlaylistManager();
const playlist = await playlistManager.createPlaylist({
  name: 'My Favorites',
  description: 'Best songs of 2024',
  visibility: 'public'
});
```

### Example 2: Collaborative Playlist
```typescript
const collaborativePlaylist = await playlistManager.enableCollaboration(
  'playlist-123',
  {
    permissions: ['add', 'remove', 'reorder'],
    inviteUsers: ['user-456', 'user-789'],
    moderationEnabled: true
  }
);
```

### Example 3: Smart Playlist Generation
```typescript
const smartPlaylist = await playlistManager.createSmartPlaylist({
  name: 'Recently Liked Jazz',
  rules: [
    { field: 'genre', operator: 'equals', value: 'jazz' },
    { field: 'liked_date', operator: 'within', value: '30_days' }
  ],
  autoUpdate: true,
  maxItems: 50
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| maxPlaylistSize | Maximum items per playlist | number | No | 1000 |
| enableCollaboration | Enable collaborative playlists | boolean | No | true |
| enableSmartPlaylists | Enable dynamic smart playlists | boolean | No | true |
| defaultVisibility | Default playlist visibility | string | No | "private" |
| enableSharing | Enable playlist sharing features | boolean | No | true |
| enableFollowing | Enable playlist following | boolean | No | true |
| enableComments | Enable playlist comments | boolean | No | false |
| enableRatings | Enable playlist ratings | boolean | No | true |
| autoSyncAcrossDevices | Sync playlists across devices | boolean | No | true |

## Expected Output

This template will produce:
- **Playlist Management System**: Complete CRUD operations for playlist management
- **Collaborative Features**: Real-time collaborative editing and sharing
- **Smart Playlist Engine**: AI-powered dynamic playlist generation
- **Social Integration**: Playlist discovery, following, and community features
- **Cross-Platform Sync**: Seamless playlist synchronization across devices
- **Analytics Dashboard**: Playlist performance and engagement metrics
- **Sharing Mechanisms**: Multiple sharing options and privacy controls
- **Search and Discovery**: Advanced playlist search and recommendation features

## Implementation Patterns

### Core Playlist Architecture

```typescript
// Playlist System Architecture
interface PlaylistSystem {
  playlistManager: PlaylistManager;
  collaborationManager: CollaborationManager;
  smartPlaylistEngine: SmartPlaylistEngine;
  sharingService: SharingService;
  analyticsTracker: PlaylistAnalyticsTracker;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  type: PlaylistType;
  visibility: PlaylistVisibility;
  
  // Content
  items: PlaylistItem[];
  totalDuration: number;
  itemCount: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastPlayedAt?: Date;
  playCount: number;
  
  // Collaboration
  collaborators: PlaylistCollaborator[];
  permissions: PlaylistPermissions;
  
  // Smart playlist rules (if applicable)
  rules?: SmartPlaylistRule[];
  autoUpdate: boolean;
  
  // Social features
  likes: number;
  shares: number;
  comments: PlaylistComment[];
  tags: string[];
  
  // Customization
  coverImage?: string;
  color?: string;
  isPublic: boolean;
}

enum PlaylistType {
  MANUAL = 'manual',
  SMART = 'smart',
  COLLABORATIVE = 'collaborative',
  RADIO = 'radio',
  QUEUE = 'queue'
}

enum PlaylistVisibility {
  PRIVATE = 'private',
  PUBLIC = 'public',
  UNLISTED = 'unlisted',
  FRIENDS_ONLY = 'friends_only'
}

interface PlaylistItem {
  id: string;
  contentId: string;
  contentType: 'track' | 'video' | 'podcast' | 'audiobook';
  position: number;
  addedAt: Date;
  addedBy: string;
  
  // Playback metadata
  startTime?: number; // seconds
  endTime?: number; // seconds
  fadeIn?: number;
  fadeOut?: number;
  
  // Social features
  notes?: string;
  reactions: ItemReaction[];
}
```

### Playlist Manager Service

```typescript
// Playlist Management Implementation
class PlaylistManager {
  private storage: PlaylistStorage;
  private eventEmitter: EventEmitter;
  private permissionService: PermissionService;
  
  async createPlaylist(
    ownerId: string, 
    playlistData: CreatePlaylistRequest
  ): Promise<Playlist> {
    // Validate input
    this.validatePlaylistData(playlistData);
    
    // Create playlist
    const playlist: Playlist = {
      id: this.generatePlaylistId(),
      name: playlistData.name,
      description: playlistData.description,
      ownerId,
      type: playlistData.type || PlaylistType.MANUAL,
      visibility: playlistData.visibility || PlaylistVisibility.PRIVATE,
      items: [],
      totalDuration: 0,
      itemCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      playCount: 0,
      collaborators: [],
      permissions: this.getDefaultPermissions(),
      autoUpdate: playlistData.type === PlaylistType.SMART,
      likes: 0,
      shares: 0,
      comments: [],
      tags: playlistData.tags || [],
      coverImage: playlistData.coverImage,
      color: playlistData.color,
      isPublic: playlistData.visibility === PlaylistVisibility.PUBLIC
    };
    
    // Save to storage
    await this.storage.savePlaylist(playlist);
    
    // Emit event
    this.eventEmitter.emit('playlist:created', { playlist, ownerId });
    
    return playlist;
  }
  
  async addItemsToPlaylist(
    playlistId: string, 
    items: AddPlaylistItemRequest[], 
    userId: string
  ): Promise<PlaylistItem[]> {
    const playlist = await this.getPlaylist(playlistId);
    
    // Check permissions
    if (!await this.canModifyPlaylist(playlist, userId)) {
      throw new Error('Insufficient permissions to modify playlist');
    }
    
    const newItems: PlaylistItem[] = [];
    let position = playlist.items.length;
    
    for (const itemRequest of items) {
      // Validate content exists
      await this.validateContent(itemRequest.contentId, itemRequest.contentType);
      
      const playlistItem: PlaylistItem = {
        id: this.generateItemId(),
        contentId: itemRequest.contentId,
        contentType: itemRequest.contentType,
        position: position++,
        addedAt: new Date(),
        addedBy: userId,
        startTime: itemRequest.startTime,
        endTime: itemRequest.endTime,
        fadeIn: itemRequest.fadeIn,
        fadeOut: itemRequest.fadeOut,
        notes: itemRequest.notes,
        reactions: []
      };
      
      newItems.push(playlistItem);
    }
    
    // Add items to playlist
    playlist.items.push(...newItems);
    playlist.itemCount = playlist.items.length;
    playlist.totalDuration = await this.calculateTotalDuration(playlist.items);
    playlist.updatedAt = new Date();
    
    // Save updated playlist
    await this.storage.savePlaylist(playlist);
    
    // Emit event
    this.eventEmitter.emit('playlist:items_added', { 
      playlist, 
      items: newItems, 
      userId 
    });
    
    return newItems;
  }
  
  async reorderPlaylistItems(
    playlistId: string, 
    reorderRequest: ReorderItemsRequest, 
    userId: string
  ): Promise<void> {
    const playlist = await this.getPlaylist(playlistId);
    
    // Check permissions
    if (!await this.canModifyPlaylist(playlist, userId)) {
      throw new Error('Insufficient permissions to modify playlist');
    }
    
    // Apply reordering
    const reorderedItems = this.applyReordering(playlist.items, reorderRequest);
    
    // Update positions
    reorderedItems.forEach((item, index) => {
      item.position = index;
    });
    
    playlist.items = reorderedItems;
    playlist.updatedAt = new Date();
    
    // Save updated playlist
    await this.storage.savePlaylist(playlist);
    
    // Emit event
    this.eventEmitter.emit('playlist:reordered', { playlist, userId });
  }
  
  async removeItemsFromPlaylist(
    playlistId: string, 
    itemIds: string[], 
    userId: string
  ): Promise<void> {
    const playlist = await this.getPlaylist(playlistId);
    
    // Check permissions
    if (!await this.canModifyPlaylist(playlist, userId)) {
      throw new Error('Insufficient permissions to modify playlist');
    }
    
    // Remove items
    const removedItems = playlist.items.filter(item => itemIds.includes(item.id));
    playlist.items = playlist.items.filter(item => !itemIds.includes(item.id));
    
    // Update positions and metadata
    playlist.items.forEach((item, index) => {
      item.position = index;
    });
    
    playlist.itemCount = playlist.items.length;
    playlist.totalDuration = await this.calculateTotalDuration(playlist.items);
    playlist.updatedAt = new Date();
    
    // Save updated playlist
    await this.storage.savePlaylist(playlist);
    
    // Emit event
    this.eventEmitter.emit('playlist:items_removed', { 
      playlist, 
      removedItems, 
      userId 
    });
  }
}
```

### Collaborative Playlist Features

```typescript
// Collaboration Manager Implementation
class CollaborationManager {
  private playlistManager: PlaylistManager;
  private notificationService: NotificationService;
  private permissionService: PermissionService;
  
  async addCollaborator(
    playlistId: string, 
    collaboratorRequest: AddCollaboratorRequest, 
    ownerId: string
  ): Promise<PlaylistCollaborator> {
    const playlist = await this.playlistManager.getPlaylist(playlistId);
    
    // Verify ownership
    if (playlist.ownerId !== ownerId) {
      throw new Error('Only playlist owner can add collaborators');
    }
    
    // Check if user is already a collaborator
    const existingCollaborator = playlist.collaborators.find(
      c => c.userId === collaboratorRequest.userId
    );
    
    if (existingCollaborator) {
      throw new Error('User is already a collaborator');
    }
    
    // Create collaborator
    const collaborator: PlaylistCollaborator = {
      userId: collaboratorRequest.userId,
      role: collaboratorRequest.role || CollaboratorRole.CONTRIBUTOR,
      addedAt: new Date(),
      addedBy: ownerId,
      permissions: this.getCollaboratorPermissions(collaboratorRequest.role)
    };
    
    // Add to playlist
    playlist.collaborators.push(collaborator);
    playlist.updatedAt = new Date();
    
    // Save playlist
    await this.playlistManager.storage.savePlaylist(playlist);
    
    // Send notification
    await this.notificationService.sendCollaborationInvite({
      playlistId,
      playlistName: playlist.name,
      invitedUserId: collaboratorRequest.userId,
      invitedBy: ownerId,
      role: collaborator.role
    });
    
    return collaborator;
  }
  
  async handleCollaborativeEdit(
    playlistId: string, 
    edit: CollaborativeEdit, 
    userId: string
  ): Promise<void> {
    const playlist = await this.playlistManager.getPlaylist(playlistId);
    
    // Verify collaboration permissions
    if (!await this.canCollaborate(playlist, userId, edit.type)) {
      throw new Error('Insufficient collaboration permissions');
    }
    
    // Apply edit with conflict resolution
    const resolvedEdit = await this.resolveEditConflicts(playlist, edit);
    
    // Execute edit
    switch (resolvedEdit.type) {
      case 'add_items':
        await this.playlistManager.addItemsToPlaylist(
          playlistId, 
          resolvedEdit.items, 
          userId
        );
        break;
      case 'remove_items':
        await this.playlistManager.removeItemsFromPlaylist(
          playlistId, 
          resolvedEdit.itemIds, 
          userId
        );
        break;
      case 'reorder_items':
        await this.playlistManager.reorderPlaylistItems(
          playlistId, 
          resolvedEdit.reorderRequest, 
          userId
        );
        break;
      case 'update_metadata':
        await this.updatePlaylistMetadata(playlistId, resolvedEdit.metadata, userId);
        break;
    }
    
    // Notify other collaborators
    await this.notifyCollaborators(playlist, resolvedEdit, userId);
  }
  
  private async resolveEditConflicts(
    playlist: Playlist, 
    edit: CollaborativeEdit
  ): Promise<CollaborativeEdit> {
    // Check for concurrent edits
    const recentEdits = await this.getRecentEdits(playlist.id, 30000); // 30 seconds
    
    if (recentEdits.length === 0) {
      return edit; // No conflicts
    }
    
    // Apply conflict resolution strategy
    switch (edit.type) {
      case 'add_items':
        return this.resolveAddItemConflicts(edit, recentEdits);
      case 'reorder_items':
        return this.resolveReorderConflicts(edit, recentEdits);
      default:
        return edit;
    }
  }
}
```

### Smart Playlist Engine

```typescript
// Smart Playlist Implementation
class SmartPlaylistEngine {
  private contentService: ContentService;
  private userPreferenceService: UserPreferenceService;
  private analyticsService: AnalyticsService;
  
  async generateSmartPlaylist(
    userId: string, 
    rules: SmartPlaylistRule[]
  ): Promise<PlaylistItem[]> {
    const items: PlaylistItem[] = [];
    
    // Process each rule
    for (const rule of rules) {
      const ruleItems = await this.processRule(rule, userId);
      items.push(...ruleItems);
    }
    
    // Remove duplicates
    const uniqueItems = this.removeDuplicates(items);
    
    // Apply global constraints
    const constrainedItems = this.applyConstraints(uniqueItems, rules);
    
    // Sort and limit
    const finalItems = this.sortAndLimit(constrainedItems, rules);
    
    return finalItems;
  }
  
  private async processRule(
    rule: SmartPlaylistRule, 
    userId: string
  ): Promise<PlaylistItem[]> {
    switch (rule.type) {
      case 'genre':
        return await this.getItemsByGenre(rule.value, rule.limit);
      case 'artist':
        return await this.getItemsByArtist(rule.value, rule.limit);
      case 'recently_played':
        return await this.getRecentlyPlayedItems(userId, rule.limit);
      case 'highly_rated':
        return await this.getHighlyRatedItems(userId, rule.limit);
      case 'similar_to':
        return await this.getSimilarItems(rule.value, rule.limit);
      case 'discovery':
        return await this.getDiscoveryItems(userId, rule.limit);
      case 'mood':
        return await this.getItemsByMood(rule.value, rule.limit);
      case 'activity':
        return await this.getItemsByActivity(rule.value, rule.limit);
      default:
        return [];
    }
  }
  
  async updateSmartPlaylist(playlistId: string): Promise<void> {
    const playlist = await this.playlistManager.getPlaylist(playlistId);
    
    if (playlist.type !== PlaylistType.SMART || !playlist.autoUpdate) {
      return;
    }
    
    // Generate new items based on rules
    const newItems = await this.generateSmartPlaylist(
      playlist.ownerId, 
      playlist.rules || []
    );
    
    // Compare with existing items
    const changes = this.calculatePlaylistChanges(playlist.items, newItems);
    
    if (changes.hasChanges) {
      // Update playlist
      playlist.items = newItems;
      playlist.itemCount = newItems.length;
      playlist.totalDuration = await this.calculateTotalDuration(newItems);
      playlist.updatedAt = new Date();
      
      // Save updated playlist
      await this.playlistManager.storage.savePlaylist(playlist);
      
      // Notify owner of changes
      await this.notificationService.sendSmartPlaylistUpdate({
        playlistId,
        playlistName: playlist.name,
        userId: playlist.ownerId,
        changes
      });
    }
  }
}
```

### Playlist Sharing Service

```typescript
// Sharing Service Implementation
class SharingService {
  private playlistManager: PlaylistManager;
  private socialService: SocialService;
  private analyticsService: AnalyticsService;
  
  async sharePlaylist(
    playlistId: string, 
    shareRequest: SharePlaylistRequest, 
    userId: string
  ): Promise<PlaylistShare> {
    const playlist = await this.playlistManager.getPlaylist(playlistId);
    
    // Check sharing permissions
    if (!await this.canSharePlaylist(playlist, userId)) {
      throw new Error('Insufficient permissions to share playlist');
    }
    
    // Create share
    const share: PlaylistShare = {
      id: this.generateShareId(),
      playlistId,
      sharedBy: userId,
      shareType: shareRequest.type,
      recipients: shareRequest.recipients || [],
      message: shareRequest.message,
      createdAt: new Date(),
      expiresAt: shareRequest.expiresAt,
      accessCount: 0,
      isActive: true
    };
    
    // Generate share URL
    share.shareUrl = this.generateShareUrl(share);
    
    // Save share
    await this.storage.saveShare(share);
    
    // Send notifications based on share type
    switch (shareRequest.type) {
      case 'direct':
        await this.sendDirectShares(share, shareRequest.recipients);
        break;
      case 'social':
        await this.postToSocialMedia(share, shareRequest.platforms);
        break;
      case 'public_link':
        // No immediate notifications needed
        break;
    }
    
    // Update playlist share count
    playlist.shares++;
    await this.playlistManager.storage.savePlaylist(playlist);
    
    // Track analytics
    await this.analyticsService.trackPlaylistShare({
      playlistId,
      shareType: shareRequest.type,
      sharedBy: userId
    });
    
    return share;
  }
  
  async createPlaylistEmbed(
    playlistId: string, 
    embedOptions: EmbedOptions, 
    userId: string
  ): Promise<PlaylistEmbed> {
    const playlist = await this.playlistManager.getPlaylist(playlistId);
    
    // Check embed permissions
    if (!await this.canEmbedPlaylist(playlist, userId)) {
      throw new Error('Playlist cannot be embedded');
    }
    
    // Generate embed code
    const embedCode = this.generateEmbedCode(playlist, embedOptions);
    
    // Create embed record
    const embed: PlaylistEmbed = {
      id: this.generateEmbedId(),
      playlistId,
      createdBy: userId,
      embedCode,
      options: embedOptions,
      createdAt: new Date(),
      viewCount: 0,
      isActive: true
    };
    
    // Save embed
    await this.storage.saveEmbed(embed);
    
    return embed;
  }
  
  private generateEmbedCode(
    playlist: Playlist, 
    options: EmbedOptions
  ): string {
    const baseUrl = process.env.EMBED_BASE_URL;
    const embedUrl = `${baseUrl}/embed/playlist/${playlist.id}`;
    
    const params = new URLSearchParams({
      width: options.width?.toString() || '400',
      height: options.height?.toString() || '600',
      theme: options.theme || 'light',
      showArtwork: options.showArtwork?.toString() || 'true',
      showDescription: options.showDescription?.toString() || 'true',
      autoplay: options.autoplay?.toString() || 'false'
    });
    
    return `<iframe src="${embedUrl}?${params.toString()}" 
             width="${options.width || 400}" 
             height="${options.height || 600}" 
             frameborder="0" 
             allowtransparency="true" 
             allow="encrypted-media">
            </iframe>`;
  }
}
```

### Playlist Analytics

```typescript
// Analytics Tracker Implementation
class PlaylistAnalyticsTracker {
  private analyticsService: AnalyticsService;
  private eventEmitter: EventEmitter;
  
  async trackPlaylistCreation(playlist: Playlist, userId: string): Promise<void> {
    await this.analyticsService.track('playlist_created', {
      playlistId: playlist.id,
      userId,
      playlistType: playlist.type,
      visibility: playlist.visibility,
      initialItemCount: playlist.itemCount,
      timestamp: new Date()
    });
  }
  
  async trackPlaylistPlay(
    playlistId: string, 
    userId: string, 
    context: PlaybackContext
  ): Promise<void> {
    await this.analyticsService.track('playlist_played', {
      playlistId,
      userId,
      context,
      timestamp: new Date()
    });
    
    // Update playlist play count
    await this.updatePlaylistPlayCount(playlistId);
  }
  
  async trackItemAddition(
    playlistId: string, 
    items: PlaylistItem[], 
    userId: string
  ): Promise<void> {
    for (const item of items) {
      await this.analyticsService.track('playlist_item_added', {
        playlistId,
        itemId: item.id,
        contentId: item.contentId,
        contentType: item.contentType,
        userId,
        position: item.position,
        timestamp: new Date()
      });
    }
  }
  
  async generatePlaylistInsights(
    playlistId: string, 
    timeRange: TimeRange
  ): Promise<PlaylistInsights> {
    const [
      playStats,
      itemStats,
      collaborationStats,
      shareStats
    ] = await Promise.all([
      this.getPlayStatistics(playlistId, timeRange),
      this.getItemStatistics(playlistId, timeRange),
      this.getCollaborationStatistics(playlistId, timeRange),
      this.getShareStatistics(playlistId, timeRange)
    ]);
    
    return {
      playlistId,
      timeRange,
      playStats,
      itemStats,
      collaborationStats,
      shareStats,
      generatedAt: new Date()
    };
  }
}
```

## Configuration

### Playlist Management Configuration

```yaml
# playlist-config.yml
playlist_management:
  # Core Playlist Settings
  core:
    max_playlists_per_user: 1000
    max_tracks_per_playlist: 10000
    default_playlist_privacy: "private"
    enable_playlist_descriptions: true
    max_description_length: 500
    enable_playlist_covers: true
    
  # Collaborative Features
  collaboration:
    enabled: true
    max_collaborators_per_playlist: 50
    default_collaboration_level: "contributor"
    require_approval_for_additions: false
    enable_collaboration_notifications: true
    
  # Smart Playlist Features
  smart_playlists:
    enabled: true
    max_rules_per_playlist: 20
    auto_update_frequency_hours: 24
    max_smart_playlists_per_user: 100
    enable_advanced_filters: true
    
  # Sharing and Discovery
  sharing:
    enable_public_playlists: true
    enable_playlist_following: true
    enable_social_sharing: true
    max_followers_per_playlist: 1000000
    enable_playlist_embedding: true
    
  # Analytics and Insights
  analytics:
    track_playlist_plays: true
    track_skip_rates: true
    track_collaboration_activity: true
    generate_playlist_insights: true
    retention_period_days: 365
    
  # Performance Settings
  performance:
    cache_playlist_metadata: true
    cache_ttl_minutes: 30
    batch_size_for_operations: 100
    enable_lazy_loading: true
    preload_track_count: 50
```

### Environment-Specific Configuration

```typescript
// Development Configuration
const developmentConfig: PlaylistManagementConfig = {
  core: {
    maxPlaylistsPerUser: 100, // Lower limit for development
    maxTracksPerPlaylist: 1000,
    defaultPlaylistPrivacy: "private",
    enablePlaylistDescriptions: true,
    maxDescriptionLength: 200,
    enablePlaylistCovers: false // Disabled for simpler development
  },
  collaboration: {
    enabled: true,
    maxCollaboratorsPerPlaylist: 10,
    defaultCollaborationLevel: "contributor",
    requireApprovalForAdditions: false,
    enableCollaborationNotifications: false // Disabled in development
  },
  smartPlaylists: {
    enabled: true,
    maxRulesPerPlaylist: 10,
    autoUpdateFrequencyHours: 1, // More frequent for testing
    maxSmartPlaylistsPerUser: 20,
    enableAdvancedFilters: false
  },
  sharing: {
    enablePublicPlaylists: false, // Disabled in development
    enablePlaylistFollowing: true,
    enableSocialSharing: false,
    enablePlaylistEmbedding: false
  },
  analytics: {
    trackPlaylistPlays: true,
    trackSkipRates: false,
    trackCollaborationActivity: false,
    generatePlaylistInsights: false,
    retentionPeriodDays: 7
  },
  performance: {
    cachePlaylistMetadata: false, // Disabled for development
    batchSizeForOperations: 50,
    enableLazyLoading: false,
    preloadTrackCount: 20
  }
};

// Production Configuration
const productionConfig: PlaylistManagementConfig = {
  core: {
    maxPlaylistsPerUser: 1000,
    maxTracksPerPlaylist: 10000,
    defaultPlaylistPrivacy: "private",
    enablePlaylistDescriptions: true,
    maxDescriptionLength: 500,
    enablePlaylistCovers: true
  },
  collaboration: {
    enabled: true,
    maxCollaboratorsPerPlaylist: 50,
    defaultCollaborationLevel: "contributor",
    requireApprovalForAdditions: false,
    enableCollaborationNotifications: true
  },
  smartPlaylists: {
    enabled: true,
    maxRulesPerPlaylist: 20,
    autoUpdateFrequencyHours: 24,
    maxSmartPlaylistsPerUser: 100,
    enableAdvancedFilters: true
  },
  sharing: {
    enablePublicPlaylists: true,
    enablePlaylistFollowing: true,
    enableSocialSharing: true,
    maxFollowersPerPlaylist: 1000000,
    enablePlaylistEmbedding: true
  },
  analytics: {
    trackPlaylistPlays: true,
    trackSkipRates: true,
    trackCollaborationActivity: true,
    generatePlaylistInsights: true,
    retentionPeriodDays: 365
  },
  performance: {
    cachePlaylistMetadata: true,
    cacheTtlMinutes: 30,
    batchSizeForOperations: 100,
    enableLazyLoading: true,
    preloadTrackCount: 50
  }
};
```

### Smart Playlist Configuration

```typescript
// Smart Playlist Rule Configuration
interface SmartPlaylistRuleConfig {
  // Available Rule Types
  ruleTypes: {
    metadata: {
      enabled: boolean;
      fields: string[];
      operators: string[];
    };
    behavioral: {
      enabled: boolean;
      metrics: string[];
      timeRanges: string[];
    };
    temporal: {
      enabled: boolean;
      dateFields: string[];
      relativeDates: boolean;
    };
    social: {
      enabled: boolean;
      socialSignals: string[];
    };
  };
  
  // Rule Execution
  execution: {
    maxExecutionTimeMs: number;
    batchSize: number;
    enableParallelProcessing: boolean;
    cacheResults: boolean;
  };
  
  // Update Policies
  updatePolicies: {
    autoUpdate: boolean;
    updateTriggers: string[];
    maxUpdatesPerDay: number;
    updateWindowHours: [number, number];
  };
}

const smartPlaylistConfig: SmartPlaylistRuleConfig = {
  ruleTypes: {
    metadata: {
      enabled: true,
      fields: [
        "genre", "artist", "album", "year", "duration", 
        "bpm", "key", "energy", "valence", "danceability"
      ],
      operators: [
        "equals", "not_equals", "contains", "not_contains",
        "greater_than", "less_than", "between", "in", "not_in"
      ]
    },
    behavioral: {
      enabled: true,
      metrics: [
        "play_count", "skip_rate", "like_count", "share_count",
        "last_played", "first_played", "total_play_time"
      ],
      timeRanges: ["7d", "30d", "90d", "1y", "all_time"]
    },
    temporal: {
      enabled: true,
      dateFields: ["release_date", "added_date", "last_played"],
      relativeDates: true
    },
    social: {
      enabled: true,
      socialSignals: [
        "trending", "popular_with_friends", "recently_liked_by_friends",
        "similar_users_like", "viral_on_platform"
      ]
    }
  },
  execution: {
    maxExecutionTimeMs: 30000,
    batchSize: 1000,
    enableParallelProcessing: true,
    cacheResults: true
  },
  updatePolicies: {
    autoUpdate: true,
    updateTriggers: [
      "new_content_added", "user_behavior_change", 
      "scheduled_update", "manual_refresh"
    ],
    maxUpdatesPerDay: 4,
    updateWindowHours: [2, 6] // 2 AM to 6 AM
  }
};
```

### Collaboration Configuration

```typescript
// Collaboration Configuration
interface CollaborationConfig {
  // Permission Levels
  permissionLevels: {
    [key: string]: {
      canAdd: boolean;
      canRemove: boolean;
      canReorder: boolean;
      canEditMetadata: boolean;
      canInviteOthers: boolean;
      canChangePermissions: boolean;
    };
  };
  
  // Notification Settings
  notifications: {
    enabled: boolean;
    channels: string[];
    events: string[];
    batchNotifications: boolean;
    batchIntervalMinutes: number;
  };
  
  // Conflict Resolution
  conflictResolution: {
    strategy: 'last_write_wins' | 'merge' | 'manual_review';
    enableVersioning: boolean;
    maxVersionHistory: number;
    autoResolveTimeoutMinutes: number;
  };
  
  // Activity Tracking
  activityTracking: {
    enabled: boolean;
    trackDetailedActions: boolean;
    retentionDays: number;
    enableActivityFeed: boolean;
  };
}

const collaborationConfig: CollaborationConfig = {
  permissionLevels: {
    owner: {
      canAdd: true,
      canRemove: true,
      canReorder: true,
      canEditMetadata: true,
      canInviteOthers: true,
      canChangePermissions: true
    },
    editor: {
      canAdd: true,
      canRemove: true,
      canReorder: true,
      canEditMetadata: true,
      canInviteOthers: false,
      canChangePermissions: false
    },
    contributor: {
      canAdd: true,
      canRemove: false,
      canReorder: false,
      canEditMetadata: false,
      canInviteOthers: false,
      canChangePermissions: false
    },
    viewer: {
      canAdd: false,
      canRemove: false,
      canReorder: false,
      canEditMetadata: false,
      canInviteOthers: false,
      canChangePermissions: false
    }
  },
  notifications: {
    enabled: true,
    channels: ["in_app", "email", "push"],
    events: [
      "track_added", "track_removed", "playlist_shared",
      "collaborator_added", "playlist_renamed"
    ],
    batchNotifications: true,
    batchIntervalMinutes: 60
  },
  conflictResolution: {
    strategy: "last_write_wins",
    enableVersioning: true,
    maxVersionHistory: 50,
    autoResolveTimeoutMinutes: 5
  },
  activityTracking: {
    enabled: true,
    trackDetailedActions: true,
    retentionDays: 90,
    enableActivityFeed: true
  }
};
```

### Performance and Caching Configuration

```typescript
// Performance Configuration
interface PlaylistPerformanceConfig {
  // Caching Strategy
  caching: {
    playlistMetadata: {
      enabled: boolean;
      ttlMinutes: number;
      maxSize: number;
    };
    trackLists: {
      enabled: boolean;
      ttlMinutes: number;
      maxSize: number;
      chunkSize: number;
    };
    smartPlaylistResults: {
      enabled: boolean;
      ttlMinutes: number;
      maxSize: number;
    };
  };
  
  // Database Optimization
  database: {
    enableReadReplicas: boolean;
    connectionPoolSize: number;
    queryTimeout: number;
    enableQueryOptimization: boolean;
    indexStrategy: string;
  };
  
  // API Performance
  api: {
    rateLimiting: {
      enabled: boolean;
      requestsPerMinute: number;
      burstLimit: number;
    };
    pagination: {
      defaultPageSize: number;
      maxPageSize: number;
      enableCursorPagination: boolean;
    };
    compression: {
      enabled: boolean;
      algorithm: string;
      threshold: number;
    };
  };
}

const performanceConfig: PlaylistPerformanceConfig = {
  caching: {
    playlistMetadata: {
      enabled: true,
      ttlMinutes: 30,
      maxSize: 10000
    },
    trackLists: {
      enabled: true,
      ttlMinutes: 15,
      maxSize: 5000,
      chunkSize: 100
    },
    smartPlaylistResults: {
      enabled: true,
      ttlMinutes: 60,
      maxSize: 1000
    }
  },
  database: {
    enableReadReplicas: true,
    connectionPoolSize: 20,
    queryTimeout: 5000,
    enableQueryOptimization: true,
    indexStrategy: "composite"
  },
  api: {
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 100,
      burstLimit: 20
    },
    pagination: {
      defaultPageSize: 50,
      maxPageSize: 200,
      enableCursorPagination: true
    },
    compression: {
      enabled: true,
      algorithm: "gzip",
      threshold: 1024 // bytes
    }
  }
};
```

### Configuration Validation

```typescript
// Configuration Validation Schema
import Joi from 'joi';

const playlistConfigSchema = Joi.object({
  core: Joi.object({
    maxPlaylistsPerUser: Joi.number().min(1).max(10000).required(),
    maxTracksPerPlaylist: Joi.number().min(1).max(100000).required(),
    defaultPlaylistPrivacy: Joi.string().valid('private', 'public', 'unlisted'),
    enablePlaylistDescriptions: Joi.boolean(),
    maxDescriptionLength: Joi.number().min(0).max(2000),
    enablePlaylistCovers: Joi.boolean()
  }).required(),
  
  collaboration: Joi.object({
    enabled: Joi.boolean(),
    maxCollaboratorsPerPlaylist: Joi.number().min(1).max(1000),
    defaultCollaborationLevel: Joi.string().valid('owner', 'editor', 'contributor', 'viewer'),
    requireApprovalForAdditions: Joi.boolean(),
    enableCollaborationNotifications: Joi.boolean()
  }),
  
  smartPlaylists: Joi.object({
    enabled: Joi.boolean(),
    maxRulesPerPlaylist: Joi.number().min(1).max(100),
    autoUpdateFrequencyHours: Joi.number().min(1).max(168),
    maxSmartPlaylistsPerUser: Joi.number().min(1).max(1000),
    enableAdvancedFilters: Joi.boolean()
  }),
  
  analytics: Joi.object({
    trackPlaylistPlays: Joi.boolean(),
    retentionPeriodDays: Joi.number().min(1).max(2555)
  })
});

// Configuration Validation Function
function validatePlaylistConfig(config: any): ValidationResult {
  const { error, value } = playlistConfigSchema.validate(config);
  
  if (error) {
    return {
      valid: false,
      errors: error.details.map(detail => detail.message)
    };
  }
  
  // Business logic validation
  if (value.collaboration.enabled && value.collaboration.maxCollaboratorsPerPlaylist < 1) {
    return {
      valid: false,
      errors: ['Maximum collaborators must be at least 1 when collaboration is enabled']
    };
  }
  
  if (value.smartPlaylists.enabled && value.smartPlaylists.maxRulesPerPlaylist < 1) {
    return {
      valid: false,
      errors: ['Maximum rules per smart playlist must be at least 1 when smart playlists are enabled']
    };
  }
  
  return {
    valid: true,
    config: value
  };
}
```

## Platform-Specific Implementations

### Web Implementation

```javascript
// Web Playlist Manager
class WebPlaylistManager {
  constructor() {
    this.storage = new IndexedDBStorage('playlists');
    this.syncService = new PlaylistSyncService();
  }
  
  async createPlaylist(playlistData) {
    const playlist = await this.playlistManager.createPlaylist(
      this.getCurrentUserId(), 
      playlistData
    );
    
    // Sync to cloud
    await this.syncService.syncPlaylist(playlist);
    
    return playlist;
  }
  
  async enableOfflinePlaylist(playlistId) {
    const playlist = await this.getPlaylist(playlistId);
    
    // Download all items for offline access
    for (const item of playlist.items) {
      await this.downloadForOffline(item.contentId);
    }
    
    // Mark playlist as offline-ready
    playlist.isOfflineReady = true;
    await this.storage.savePlaylist(playlist);
  }
}
```

### Mobile Implementation

```swift
// iOS Playlist Manager
import Foundation
import MediaPlayer

class iOSPlaylistManager {
    private let coreDataStack: CoreDataStack
    private let cloudKitSync: CloudKitSyncService
    
    func createPlaylist(_ playlistData: CreatePlaylistRequest) async throws -> Playlist {
        let playlist = try await playlistManager.createPlaylist(
            getCurrentUserId(), 
            playlistData
        )
        
        // Add to system music library if requested
        if playlistData.addToSystemLibrary {
            try await addToSystemMusicLibrary(playlist)
        }
        
        return playlist
    }
    
    private func addToSystemMusicLibrary(_ playlist: Playlist) async throws {
        let musicLibrary = MPMediaLibrary.default()
        
        guard musicLibrary.authorizationStatus() == .authorized else {
            throw PlaylistError.musicLibraryAccessDenied
        }
        
        // Create system playlist
        let systemPlaylist = try await musicLibrary.addPlaylist(
            name: playlist.name,
            description: playlist.description
        )
        
        // Add tracks to system playlist
        for item in playlist.items {
            if let track = try await findSystemTrack(item.contentId) {
                try await systemPlaylist.addItem(track)
            }
        }
    }
}
```

## Testing Strategy

```typescript
// Playlist Management Tests
describe('Playlist Management System', () => {
  test('should create playlist with correct metadata', async () => {
    const playlistData = {
      name: 'Test Playlist',
      description: 'A test playlist',
      type: PlaylistType.MANUAL,
      visibility: PlaylistVisibility.PRIVATE
    };
    
    const playlist = await playlistManager.createPlaylist('user123', playlistData);
    
    expect(playlist.name).toBe(playlistData.name);
    expect(playlist.ownerId).toBe('user123');
    expect(playlist.type).toBe(PlaylistType.MANUAL);
    expect(playlist.itemCount).toBe(0);
    expect(playlist.totalDuration).toBe(0);
  });
  
  test('should add items to playlist in correct order', async () => {
    const playlist = await createTestPlaylist();
    const items = [
      { contentId: 'track1', contentType: 'track' },
      { contentId: 'track2', contentType: 'track' },
      { contentId: 'track3', contentType: 'track' }
    ];
    
    const addedItems = await playlistManager.addItemsToPlaylist(
      playlist.id, 
      items, 
      'user123'
    );
    
    expect(addedItems).toHaveLength(3);
    expect(addedItems[0].position).toBe(0);
    expect(addedItems[1].position).toBe(1);
    expect(addedItems[2].position).toBe(2);
  });
  
  test('should handle collaborative editing with conflict resolution', async () => {
    const playlist = await createCollaborativePlaylist();
    
    // Simulate concurrent edits
    const edit1 = {
      type: 'add_items',
      items: [{ contentId: 'track1', contentType: 'track' }],
      timestamp: Date.now()
    };
    
    const edit2 = {
      type: 'add_items',
      items: [{ contentId: 'track2', contentType: 'track' }],
      timestamp: Date.now() + 100
    };
    
    await Promise.all([
      collaborationManager.handleCollaborativeEdit(playlist.id, edit1, 'user1'),
      collaborationManager.handleCollaborativeEdit(playlist.id, edit2, 'user2')
    ]);
    
    const updatedPlaylist = await playlistManager.getPlaylist(playlist.id);
    expect(updatedPlaylist.items).toHaveLength(2);
  });
});
```

## Best Practices

1. **Permission Management**: Implement granular permissions for different collaboration levels
2. **Conflict Resolution**: Handle concurrent edits gracefully in collaborative playlists
3. **Performance**: Use pagination for large playlists and lazy loading for items
4. **Offline Support**: Cache playlist metadata and enable offline playlist management
5. **Analytics**: Track playlist usage patterns to improve recommendation algorithms
6. **Social Features**: Enable playlist discovery and social sharing capabilities

## Integration Points

- **Content Service**: Validate and retrieve content metadata for playlist items
- **User Service**: Manage playlist ownership and collaboration permissions
- **Analytics Service**: Track playlist creation, usage, and sharing metrics
- **Notification Service**: Send collaboration invites and playlist update notifications
- **Search Service**: Enable playlist discovery and content search within playlists

This template provides a comprehensive foundation for implementing robust playlist management capabilities in media streaming applications.