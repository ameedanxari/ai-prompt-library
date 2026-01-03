# Offline Sync and Content Caching Template

## Purpose
This template provides comprehensive patterns for implementing offline content synchronization, intelligent caching strategies, and seamless online/offline transitions in media streaming applications. It covers content prefetching, storage management, sync conflict resolution, and offline playback capabilities.

## Context
Use this template when building media streaming applications that need to work reliably in areas with poor connectivity, provide offline playback capabilities, or optimize bandwidth usage through intelligent content caching. Suitable for music streaming, video platforms, podcast apps, and any media application requiring offline functionality.

## Implementation Patterns

### Offline Sync Architecture

```typescript
// Offline Sync System Interface
interface OfflineSyncSystem {
  cacheManager: CacheManager;
  syncManager: SyncManager;
  storageManager: StorageManager;
  conflictResolver: ConflictResolver;
  networkMonitor: NetworkMonitor;
}

interface CacheStrategy {
  type: 'lru' | 'lfu' | 'fifo' | 'intelligent';
  maxSize: number; // bytes
  maxItems: number;
  ttl: number; // seconds
  priorities: CachePriority[];
}

interface CachePriority {
  contentType: 'audio' | 'video' | 'image' | 'metadata';
  quality: 'low' | 'medium' | 'high';
  priority: number; // 1-10, higher = more important
  conditions: CacheCondition[];
}

interface CacheCondition {
  type: 'user_preference' | 'usage_frequency' | 'recency' | 'playlist_membership';
  value: any;
  weight: number;
}
```

### Intelligent Cache Manager

```typescript
// Cache Manager Implementation
class IntelligentCacheManager {
  private storage: CacheStorage;
  private strategy: CacheStrategy;
  private usageTracker: UsageTracker;
  
  async cacheContent(content: MediaContent, priority: number = 5): Promise<CacheResult> {
    // Check available space
    const spaceRequired = await this.calculateSpaceRequired(content);
    const availableSpace = await this.getAvailableSpace();
    
    if (spaceRequired > availableSpace) {
      await this.makeSpace(spaceRequired);
    }
    
    // Cache content with metadata
    const cacheEntry: CacheEntry = {
      id: content.id,
      content,
      cachedAt: Date.now(),
      lastAccessed: Date.now(),
      accessCount: 0,
      priority,
      size: spaceRequired,
      quality: content.quality,
      expiresAt: Date.now() + (this.strategy.ttl * 1000)
    };
    
    await this.storage.store(cacheEntry);
    await this.updateCacheIndex(cacheEntry);
    
    return {
      success: true,
      cacheEntry,
      spaceUsed: spaceRequired
    };
  }
  
  async getCachedContent(contentId: string): Promise<MediaContent | null> {
    const cacheEntry = await this.storage.get(contentId);
    
    if (!cacheEntry) {
      return null;
    }
    
    // Check if expired
    if (cacheEntry.expiresAt < Date.now()) {
      await this.removeCachedContent(contentId);
      return null;
    }
    
    // Update access statistics
    await this.updateAccessStats(cacheEntry);
    
    return cacheEntry.content;
  }
  
  private async makeSpace(requiredSpace: number): Promise<void> {
    const candidates = await this.getEvictionCandidates();
    let freedSpace = 0;
    
    for (const candidate of candidates) {
      if (freedSpace >= requiredSpace) break;
      
      await this.removeCachedContent(candidate.id);
      freedSpace += candidate.size;
    }
    
    if (freedSpace < requiredSpace) {
      throw new Error('Insufficient storage space available');
    }
  }
  
  private async getEvictionCandidates(): Promise<CacheEntry[]> {
    const allEntries = await this.storage.getAllEntries();
    
    return allEntries
      .sort((a, b) => this.calculateEvictionScore(a) - this.calculateEvictionScore(b))
      .slice(0, Math.ceil(allEntries.length * 0.3)); // Consider top 30% for eviction
  }
  
  private calculateEvictionScore(entry: CacheEntry): number {
    const now = Date.now();
    const age = (now - entry.cachedAt) / (1000 * 60 * 60); // hours
    const timeSinceAccess = (now - entry.lastAccessed) / (1000 * 60 * 60); // hours
    const accessFrequency = entry.accessCount / Math.max(age, 1);
    
    // Lower score = higher eviction priority
    return (
      (entry.priority * 0.4) +
      (accessFrequency * 0.3) +
      (1 / Math.max(timeSinceAccess, 0.1) * 0.2) +
      (entry.size / (1024 * 1024) * -0.1) // Prefer removing larger files
    );
  }
}
```

### Sync Manager

```typescript
// Sync Manager Implementation
class SyncManager {
  private syncQueue: SyncQueue;
  private networkMonitor: NetworkMonitor;
  private conflictResolver: ConflictResolver;
  
  async syncContent(contentIds: string[]): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    
    for (const contentId of contentIds) {
      try {
        const result = await this.syncSingleContent(contentId);
        results.push(result);
      } catch (error) {
        results.push({
          contentId,
          success: false,
          error: error.message,
          timestamp: Date.now()
        });
      }
    }
    
    return results;
  }
  
  private async syncSingleContent(contentId: string): Promise<SyncResult> {
    const localContent = await this.getLocalContent(contentId);
    const remoteContent = await this.getRemoteContent(contentId);
    
    // Handle different sync scenarios
    if (!localContent && !remoteContent) {
      throw new Error('Content not found locally or remotely');
    }
    
    if (!localContent && remoteContent) {
      // Download new content
      return await this.downloadContent(remoteContent);
    }
    
    if (localContent && !remoteContent) {
      // Upload local content
      return await this.uploadContent(localContent);
    }
    
    // Both exist - check for conflicts
    if (this.hasConflict(localContent, remoteContent)) {
      const resolved = await this.conflictResolver.resolve(localContent, remoteContent);
      return await this.applyResolution(resolved);
    }
    
    // Sync metadata and preferences
    return await this.syncMetadata(localContent, remoteContent);
  }
  
  async enableAutoSync(config: AutoSyncConfig): Promise<void> {
    this.autoSyncConfig = config;
    
    // Set up periodic sync
    setInterval(async () => {
      if (await this.shouldAutoSync()) {
        await this.performAutoSync();
      }
    }, config.interval * 1000);
    
    // Set up network change listeners
    this.networkMonitor.onNetworkChange(async (networkInfo) => {
      if (networkInfo.isConnected && networkInfo.type === 'wifi') {
        await this.performAutoSync();
      }
    });
  }
  
  private async shouldAutoSync(): Promise<boolean> {
    const networkInfo = await this.networkMonitor.getCurrentNetwork();
    
    // Only auto-sync on WiFi or if explicitly allowed on cellular
    if (!networkInfo.isConnected) return false;
    if (networkInfo.type === 'cellular' && !this.autoSyncConfig.allowCellular) return false;
    
    // Check battery level (mobile)
    if (this.autoSyncConfig.requireMinBattery) {
      const batteryLevel = await this.getBatteryLevel();
      if (batteryLevel < this.autoSyncConfig.minBatteryLevel) return false;
    }
    
    return true;
  }
}
```

### Storage Manager

```typescript
// Storage Manager Implementation
class StorageManager {
  private databases: Map<string, IDBDatabase> = new Map();
  private fileSystem: FileSystemAPI;
  
  async initializeStorage(): Promise<void> {
    // Initialize IndexedDB for metadata
    await this.initializeIndexedDB();
    
    // Initialize File System API for large files (if available)
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      await this.initializeFileSystem();
    }
  }
  
  async storeContent(content: MediaContent, data: ArrayBuffer): Promise<StorageResult> {
    const storageMethod = this.selectStorageMethod(data.byteLength);
    
    switch (storageMethod) {
      case 'indexeddb':
        return await this.storeInIndexedDB(content, data);
      case 'filesystem':
        return await this.storeInFileSystem(content, data);
      case 'cache':
        return await this.storeInCache(content, data);
      default:
        throw new Error('No suitable storage method available');
    }
  }
  
  private selectStorageMethod(size: number): StorageMethod {
    const LARGE_FILE_THRESHOLD = 50 * 1024 * 1024; // 50MB
    
    if (size > LARGE_FILE_THRESHOLD && this.fileSystem) {
      return 'filesystem';
    }
    
    if (size < 10 * 1024 * 1024) { // 10MB
      return 'indexeddb';
    }
    
    return 'cache';
  }
  
  async getStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        total: estimate.quota || 0,
        used: estimate.usage || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0)
      };
    }
    
    // Fallback estimation
    return {
      total: 100 * 1024 * 1024, // 100MB estimate
      used: 0,
      available: 100 * 1024 * 1024
    };
  }
  
  async cleanupExpiredContent(): Promise<CleanupResult> {
    const now = Date.now();
    let freedSpace = 0;
    let itemsRemoved = 0;
    
    // Clean IndexedDB
    const db = this.databases.get('content');
    if (db) {
      const transaction = db.transaction(['content'], 'readwrite');
      const store = transaction.objectStore('content');
      const cursor = await store.openCursor();
      
      while (cursor) {
        const entry = cursor.value as CacheEntry;
        if (entry.expiresAt < now) {
          await cursor.delete();
          freedSpace += entry.size;
          itemsRemoved++;
        }
        await cursor.continue();
      }
    }
    
    // Clean file system
    if (this.fileSystem) {
      const expiredFiles = await this.findExpiredFiles();
      for (const file of expiredFiles) {
        await this.fileSystem.removeFile(file.path);
        freedSpace += file.size;
        itemsRemoved++;
      }
    }
    
    return {
      freedSpace,
      itemsRemoved,
      timestamp: now
    };
  }
}
```

### Offline Playback Manager

```typescript
// Offline Playback Manager
class OfflinePlaybackManager {
  private cacheManager: IntelligentCacheManager;
  private playbackQueue: PlaybackQueue;
  private downloadQueue: DownloadQueue;
  
  async prepareForOffline(playlist: Playlist, quality: QualityLevel): Promise<OfflinePreparationResult> {
    const preparationTasks: OfflineTask[] = [];
    
    for (const item of playlist.items) {
      // Check if already cached
      const cached = await this.cacheManager.getCachedContent(item.id);
      if (cached && cached.quality >= quality) {
        continue;
      }
      
      // Add to download queue
      preparationTasks.push({
        contentId: item.id,
        type: 'download',
        quality,
        priority: item.priority || 5,
        estimatedSize: await this.estimateDownloadSize(item, quality)
      });
    }
    
    // Start downloads
    const results = await this.downloadQueue.processTasks(preparationTasks);
    
    return {
      totalItems: playlist.items.length,
      downloadedItems: results.filter(r => r.success).length,
      failedItems: results.filter(r => !r.success).length,
      totalSize: results.reduce((sum, r) => sum + (r.size || 0), 0),
      estimatedPlaytime: this.calculatePlaytime(playlist)
    };
  }
  
  async playOfflineContent(contentId: string): Promise<PlaybackSession> {
    const cachedContent = await this.cacheManager.getCachedContent(contentId);
    
    if (!cachedContent) {
      throw new Error('Content not available offline');
    }
    
    // Create offline playback session
    const session = new OfflinePlaybackSession({
      contentId,
      content: cachedContent,
      startTime: Date.now(),
      isOffline: true
    });
    
    // Track offline usage
    await this.trackOfflineUsage(contentId);
    
    return session;
  }
  
  async getOfflineLibrary(): Promise<OfflineLibrary> {
    const cachedItems = await this.cacheManager.getAllCachedContent();
    
    const library: OfflineLibrary = {
      totalItems: cachedItems.length,
      totalSize: cachedItems.reduce((sum, item) => sum + item.size, 0),
      categories: this.categorizeOfflineContent(cachedItems),
      lastSync: await this.getLastSyncTime(),
      expiringItems: cachedItems.filter(item => 
        item.expiresAt < Date.now() + (24 * 60 * 60 * 1000) // Expires within 24 hours
      )
    };
    
    return library;
  }
}
```

### Network-Aware Downloading

```typescript
// Network-Aware Download Manager
class NetworkAwareDownloadManager {
  private networkMonitor: NetworkMonitor;
  private downloadQueue: PriorityQueue<DownloadTask>;
  private activeDownloads: Map<string, DownloadSession> = new Map();
  
  async scheduleDownload(task: DownloadTask): Promise<void> {
    const networkInfo = await this.networkMonitor.getCurrentNetwork();
    
    // Adjust task based on network conditions
    const adjustedTask = this.adjustTaskForNetwork(task, networkInfo);
    
    // Add to appropriate queue
    if (networkInfo.type === 'wifi' || task.allowCellular) {
      this.downloadQueue.enqueue(adjustedTask);
      await this.processDownloadQueue();
    } else {
      // Queue for later when WiFi is available
      await this.queueForWiFi(adjustedTask);
    }
  }
  
  private adjustTaskForNetwork(task: DownloadTask, network: NetworkInfo): DownloadTask {
    const adjusted = { ...task };
    
    if (network.type === 'cellular') {
      // Reduce quality on cellular
      adjusted.quality = Math.min(adjusted.quality, QualityLevel.MEDIUM);
      adjusted.maxConcurrent = 1; // Limit concurrent downloads
    } else if (network.type === 'wifi') {
      // Use higher quality on WiFi
      adjusted.maxConcurrent = 3;
    }
    
    // Adjust based on connection speed
    if (network.effectiveType === 'slow-2g' || network.effectiveType === '2g') {
      adjusted.quality = QualityLevel.LOW;
      adjusted.maxConcurrent = 1;
    }
    
    return adjusted;
  }
  
  async pauseAllDownloads(): Promise<void> {
    for (const [id, session] of this.activeDownloads) {
      await session.pause();
    }
  }
  
  async resumeDownloads(): Promise<void> {
    const networkInfo = await this.networkMonitor.getCurrentNetwork();
    
    if (networkInfo.isConnected) {
      for (const [id, session] of this.activeDownloads) {
        if (session.isPaused) {
          await session.resume();
        }
      }
    }
  }
}
```

### Conflict Resolution

```typescript
// Conflict Resolution System
class ConflictResolver {
  async resolve(local: MediaContent, remote: MediaContent): Promise<ConflictResolution> {
    const conflicts = this.identifyConflicts(local, remote);
    
    if (conflicts.length === 0) {
      return { action: 'no_conflict', result: local };
    }
    
    // Apply resolution strategies
    for (const conflict of conflicts) {
      switch (conflict.type) {
        case 'metadata':
          await this.resolveMetadataConflict(conflict, local, remote);
          break;
        case 'playback_position':
          await this.resolvePlaybackPositionConflict(conflict, local, remote);
          break;
        case 'rating':
          await this.resolveRatingConflict(conflict, local, remote);
          break;
        case 'playlist_membership':
          await this.resolvePlaylistConflict(conflict, local, remote);
          break;
      }
    }
    
    return {
      action: 'resolved',
      result: this.mergeContent(local, remote),
      conflicts: conflicts.length
    };
  }
  
  private identifyConflicts(local: MediaContent, remote: MediaContent): Conflict[] {
    const conflicts: Conflict[] = [];
    
    // Check timestamps
    if (local.lastModified !== remote.lastModified) {
      if (local.playbackPosition !== remote.playbackPosition) {
        conflicts.push({
          type: 'playback_position',
          localValue: local.playbackPosition,
          remoteValue: remote.playbackPosition,
          localTimestamp: local.lastModified,
          remoteTimestamp: remote.lastModified
        });
      }
      
      if (local.rating !== remote.rating) {
        conflicts.push({
          type: 'rating',
          localValue: local.rating,
          remoteValue: remote.rating,
          localTimestamp: local.lastModified,
          remoteTimestamp: remote.lastModified
        });
      }
    }
    
    return conflicts;
  }
  
  private async resolvePlaybackPositionConflict(
    conflict: Conflict, 
    local: MediaContent, 
    remote: MediaContent
  ): Promise<void> {
    // Use the position from the most recently modified version
    if (conflict.remoteTimestamp > conflict.localTimestamp) {
      local.playbackPosition = remote.playbackPosition;
    }
    // If local is newer, keep local value (no change needed)
  }
}
```

## Configuration Parameters

### Offline Sync Configuration

```yaml
# Offline Sync Configuration
offline_sync:
  cache_strategy:
    type: "intelligent"  # lru, lfu, fifo, intelligent
    max_size: 5368709120  # 5GB in bytes
    max_items: 10000
    ttl: 2592000  # 30 days in seconds
    
  storage_allocation:
    audio_content: 60    # percentage
    video_content: 30    # percentage
    images_metadata: 10  # percentage
    
  sync_settings:
    auto_sync: true
    sync_interval: 3600  # 1 hour in seconds
    allow_cellular: false
    require_min_battery: true
    min_battery_level: 20  # percentage
    max_concurrent_downloads: 3
    
  quality_preferences:
    wifi:
      audio: "high"      # low, medium, high
      video: "1080p"     # 480p, 720p, 1080p
    cellular:
      audio: "medium"
      video: "720p"
    low_storage:
      audio: "low"
      video: "480p"
```

### Cache Priority Configuration

```json
{
  "cache_priorities": [
    {
      "content_type": "audio",
      "quality": "high",
      "priority": 8,
      "conditions": [
        {
          "type": "playlist_membership",
          "value": "favorites",
          "weight": 0.4
        },
        {
          "type": "usage_frequency",
          "value": "high",
          "weight": 0.3
        },
        {
          "type": "recency",
          "value": "recent",
          "weight": 0.3
        }
      ]
    },
    {
      "content_type": "video",
      "quality": "medium",
      "priority": 6,
      "conditions": [
        {
          "type": "user_preference",
          "value": "downloaded",
          "weight": 0.5
        },
        {
          "type": "playlist_membership",
          "value": "watch_later",
          "weight": 0.5
        }
      ]
    }
  ],
  "eviction_rules": {
    "strategy": "smart_lru",
    "factors": {
      "access_frequency": 0.3,
      "recency": 0.2,
      "user_rating": 0.2,
      "file_size": 0.1,
      "expiry_time": 0.2
    }
  }
}
```

### Network-Aware Download Configuration

```typescript
// Network-Aware Download Configuration
interface NetworkDownloadConfig {
  networkProfiles: {
    wifi: NetworkProfile;
    cellular: NetworkProfile;
    ethernet: NetworkProfile;
  };
  adaptiveSettings: {
    bandwidthThresholds: BandwidthThreshold[];
    qualityAdjustment: boolean;
    pauseOnSlowConnection: boolean;
    resumeOnFastConnection: boolean;
  };
  downloadLimits: {
    maxConcurrentDownloads: number;
    maxDownloadSize: number; // bytes
    dailyDownloadLimit: number; // bytes
    monthlyDownloadLimit: number; // bytes
  };
}

// Example configuration
const networkConfig: NetworkDownloadConfig = {
  networkProfiles: {
    wifi: {
      maxConcurrentDownloads: 5,
      maxQuality: 'ultra_high',
      allowLargeFiles: true,
      backgroundDownload: true,
      retryAttempts: 5
    },
    cellular: {
      maxConcurrentDownloads: 1,
      maxQuality: 'medium',
      allowLargeFiles: false,
      backgroundDownload: false,
      retryAttempts: 3
    },
    ethernet: {
      maxConcurrentDownloads: 8,
      maxQuality: 'ultra_high',
      allowLargeFiles: true,
      backgroundDownload: true,
      retryAttempts: 5
    }
  },
  adaptiveSettings: {
    bandwidthThresholds: [
      { speed: 1000, quality: 'low' },    // < 1 Mbps
      { speed: 5000, quality: 'medium' }, // < 5 Mbps
      { speed: 15000, quality: 'high' },  // < 15 Mbps
      { speed: 50000, quality: 'ultra_high' } // >= 50 Mbps
    ],
    qualityAdjustment: true,
    pauseOnSlowConnection: true,
    resumeOnFastConnection: true
  },
  downloadLimits: {
    maxConcurrentDownloads: 3,
    maxDownloadSize: 2147483648, // 2GB
    dailyDownloadLimit: 5368709120, // 5GB
    monthlyDownloadLimit: 107374182400 // 100GB
  }
};
```

### Storage Management Configuration

```yaml
# Storage Management Configuration
storage_management:
  indexeddb:
    database_name: "MediaCache"
    version: 1
    stores:
      - name: "content"
        key_path: "id"
        indexes: ["timestamp", "size", "priority"]
      - name: "metadata"
        key_path: "contentId"
        indexes: ["lastAccessed", "expiresAt"]
        
  file_system:
    enabled: true
    quota_request: 10737418240  # 10GB
    directory_structure:
      audio: "audio/"
      video: "video/"
      images: "images/"
      temp: "temp/"
      
  cleanup_policy:
    auto_cleanup: true
    cleanup_interval: 86400  # 24 hours
    cleanup_triggers:
      - storage_usage_above: 90  # percentage
      - expired_content: true
      - low_disk_space: true
    cleanup_strategy:
      - remove_expired_first: true
      - remove_least_accessed: true
      - remove_largest_files: false
```

### Conflict Resolution Configuration

```json
{
  "conflict_resolution": {
    "default_strategy": "timestamp_wins",
    "strategies": {
      "playback_position": {
        "strategy": "latest_timestamp",
        "merge_threshold": 30
      },
      "rating": {
        "strategy": "user_preference",
        "prefer_higher_rating": true
      },
      "playlist_membership": {
        "strategy": "union",
        "preserve_order": true
      },
      "metadata": {
        "strategy": "remote_wins",
        "exceptions": ["user_notes", "custom_tags"]
      }
    },
    "user_intervention": {
      "required_for": ["major_conflicts"],
      "timeout": 300,
      "default_action": "keep_both"
    }
  }
}
```

## Platform-Specific Implementations

### Web Implementation

```javascript
// Web Offline Sync using Service Worker
class WebOfflineSync {
  constructor() {
    this.serviceWorker = null;
    this.cache = null;
  }
  
  async initialize() {
    if ('serviceWorker' in navigator) {
      this.serviceWorker = await navigator.serviceWorker.register('/offline-sync-sw.js');
      this.cache = await caches.open('media-cache-v1');
    }
  }
  
  async cacheForOffline(urls) {
    if (this.cache) {
      await this.cache.addAll(urls);
    }
  }
  
  async getOfflineContent(url) {
    if (this.cache) {
      const response = await this.cache.match(url);
      return response;
    }
    return null;
  }
}

// Service Worker for offline functionality
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/media/')) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          return response || fetch(event.request);
        })
    );
  }
});
```

### Mobile Implementation

```swift
// iOS Offline Sync
import Foundation

class iOSOfflineSync {
    private let cacheDirectory: URL
    private let userDefaults = UserDefaults.standard
    
    init() {
        let documentsPath = FileManager.default.urls(for: .documentDirectory, 
                                                   in: .userDomainMask)[0]
        cacheDirectory = documentsPath.appendingPathComponent("OfflineCache")
        
        try? FileManager.default.createDirectory(at: cacheDirectory, 
                                               withIntermediateDirectories: true)
    }
    
    func cacheContent(_ content: MediaContent, data: Data) async throws {
        let fileURL = cacheDirectory.appendingPathComponent("\(content.id).cache")
        try data.write(to: fileURL)
        
        // Store metadata
        let metadata = [
            "id": content.id,
            "title": content.title,
            "cachedAt": Date().timeIntervalSince1970,
            "size": data.count
        ]
        userDefaults.set(metadata, forKey: "cache_\(content.id)")
    }
    
    func getCachedContent(_ contentId: String) -> Data? {
        let fileURL = cacheDirectory.appendingPathComponent("\(contentId).cache")
        return try? Data(contentsOf: fileURL)
    }
}
```

## Testing Strategy

```typescript
// Offline Sync Tests
describe('Offline Sync System', () => {
  test('should cache content for offline access', async () => {
    const content = createTestMediaContent();
    const data = new ArrayBuffer(1024 * 1024); // 1MB test data
    
    const result = await cacheManager.cacheContent(content, 5);
    
    expect(result.success).toBe(true);
    expect(result.spaceUsed).toBe(data.byteLength);
    
    const cached = await cacheManager.getCachedContent(content.id);
    expect(cached).toEqual(content);
  });
  
  test('should sync changes when network becomes available', async () => {
    // Simulate offline changes
    await offlineManager.updateContentOffline(testContent.id, { rating: 5 });
    
    // Simulate network becoming available
    networkMonitor.simulateNetworkChange({ isConnected: true, type: 'wifi' });
    
    await waitFor(() => syncManager.isSyncing === false);
    
    const remoteContent = await api.getContent(testContent.id);
    expect(remoteContent.rating).toBe(5);
  });
  
  test('should resolve conflicts correctly', async () => {
    const localContent = { ...testContent, rating: 4, lastModified: Date.now() };
    const remoteContent = { ...testContent, rating: 5, lastModified: Date.now() - 1000 };
    
    const resolution = await conflictResolver.resolve(localContent, remoteContent);
    
    expect(resolution.action).toBe('resolved');
    expect(resolution.result.rating).toBe(4); // Local is newer, should win
  });
});
```

## Best Practices

1. **Storage Management**: Implement intelligent cache eviction based on usage patterns
2. **Network Awareness**: Adapt download behavior based on network conditions
3. **Conflict Resolution**: Provide clear conflict resolution strategies
4. **Progress Tracking**: Show download and sync progress to users
5. **Error Handling**: Implement robust error handling and retry mechanisms
6. **Battery Optimization**: Consider battery level when performing background sync

## Integration Points

- **Analytics Module**: Track offline usage patterns and sync performance
- **User Preferences Module**: Respect user settings for offline behavior
- **Notification Module**: Notify users of sync status and offline availability
- **Storage Module**: Coordinate with overall storage management

This template provides a comprehensive foundation for implementing robust offline sync and content caching capabilities in media streaming applications.