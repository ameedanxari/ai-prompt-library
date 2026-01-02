# Offline Functionality Module

## Purpose
This module provides comprehensive offline functionality patterns for web and mobile applications, enabling users to continue working without internet connectivity. It implements intelligent caching strategies, conflict resolution mechanisms, and seamless synchronization when connectivity is restored. The module ensures data integrity, security, and accessibility while maintaining optimal performance across all platforms.

## Instructions

### When to Use This Module
- Implementing offline-first or offline-capable applications
- Building progressive web apps (PWAs) with offline functionality
- Creating mobile apps that need to work without internet connectivity
- Developing applications for users with unreliable network connections
- Building apps that handle large amounts of user-generated content offline

### Implementation Steps
1. **Choose Platform Strategy**: Select web (Service Workers) or mobile (AsyncStorage/NetInfo) implementation based on your target platform
2. **Configure Caching Strategies**: 
   - Use **Cache First** for static assets (CSS, JS, images, fonts)
   - Use **Network First** for dynamic API content with cache fallback
   - Use **Stale While Revalidate** for HTML pages and semi-static content
3. **Implement Offline Queue**: Set up operation queuing for CREATE, UPDATE, DELETE operations that need sync
4. **Add Conflict Resolution**: Implement strategies for handling data conflicts when syncing offline changes
5. **Ensure Accessibility**: Maintain screen reader support and clear offline status indicators
6. **Test Thoroughly**: Test all offline scenarios including network transitions and edge cases

### Key Configuration Decisions
- **Storage Limits**: Set appropriate cache size limits (recommended: 50-100MB for web, device-dependent for mobile)
- **Sync Retry Logic**: Configure retry attempts (recommended: 3-5 attempts with exponential backoff)
- **Conflict Resolution**: Choose between last-write-wins, user-prompted resolution, or custom merge strategies
- **Critical Resources**: Identify and pre-cache essential resources for core offline functionality

### Security Considerations
- Encrypt sensitive data in offline storage using platform-appropriate encryption
- Implement secure token refresh mechanisms for offline authentication
- Validate data integrity during sync operations to prevent corruption
- Clear sensitive cached data on logout or app uninstall

## Examples

### 1. Complete Offline Manager Setup
```typescript
// Initialize comprehensive offline functionality
const offlineManager = new OfflineManager({
  cacheStrategies: {
    static: 'cache-first',
    api: 'network-first', 
    pages: 'stale-while-revalidate'
  },
  maxCacheSize: '50MB',
  syncRetryAttempts: 3,
  conflictResolution: 'user-prompt',
  encryptSensitiveData: true
});

// Queue operation for offline sync with metadata
await offlineManager.queueOperation({
  id: generateId(),
  type: 'CREATE',
  endpoint: '/api/tasks',
  data: { 
    title: 'New Task', 
    completed: false,
    userId: currentUser.id 
  },
  timestamp: Date.now(),
  priority: 'high',
  retryCount: 0
});

// Handle sync completion
offlineManager.onSyncComplete((results) => {
  const { successful, failed, conflicts } = results;
  console.log(`Synced ${successful.length} operations, ${failed.length} failed`);
  
  if (conflicts.length > 0) {
    showConflictResolutionDialog(conflicts);
  }
});
```

### 2. React Hook with Comprehensive Offline State
```typescript
function TaskManager() {
  const { 
    isOnline, 
    syncStatus, 
    queuedOperations,
    queueOperation,
    syncOfflineOperations 
  } = useOffline();
  
  const { 
    data: tasks, 
    loading, 
    error,
    refetch 
  } = useOfflineData('tasks', fetchTasks);
  
  const createTask = async (taskData) => {
    const optimisticTask = {
      ...taskData,
      id: generateTempId(),
      status: 'pending-sync'
    };
    
    // Optimistic update
    updateLocalTasks(prev => [...prev, optimisticTask]);
    
    if (isOnline) {
      try {
        const savedTask = await api.createTask(taskData);
        updateLocalTasks(prev => 
          prev.map(t => t.id === optimisticTask.id ? savedTask : t)
        );
      } catch (error) {
        // Fallback to offline queue
        await queueOperation({
          type: 'CREATE',
          endpoint: '/api/tasks',
          data: taskData,
          optimisticId: optimisticTask.id
        });
      }
    } else {
      await queueOperation({
        type: 'CREATE',
        endpoint: '/api/tasks',
        data: taskData,
        optimisticId: optimisticTask.id
      });
    }
  };
  
  return (
    <div className="task-manager">
      <OfflineStatusBar 
        isOnline={isOnline}
        syncStatus={syncStatus}
        queuedCount={queuedOperations.length}
        onManualSync={syncOfflineOperations}
      />
      
      <TaskForm onSubmit={createTask} disabled={loading} />
      
      <TaskList 
        tasks={tasks} 
        loading={loading}
        error={error}
        onRetry={refetch}
      />
      
      {syncStatus === 'error' && (
        <SyncErrorBanner onRetry={syncOfflineOperations} />
      )}
    </div>
  );
}
```

### 3. Advanced Service Worker with Multiple Cache Strategies
```javascript
// service-worker.js - Production-ready implementation
const CACHE_VERSION = 'v2.1.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const OFFLINE_CACHE = `offline-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  '/',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/images/logo.png',
  '/offline.html',
  '/manifest.json'
];

// Install - Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)),
      caches.open(OFFLINE_CACHE).then(cache => 
        cache.add('/offline.html')
      )
    ]).then(() => self.skipWaiting())
  );
});

// Activate - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.includes('v') && !name.includes(CACHE_VERSION))
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - Apply intelligent caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Static assets - Cache First with version checking
  if (STATIC_ASSETS.some(asset => url.pathname.endsWith(asset))) {
    event.respondWith(cacheFirstWithUpdate(request));
    return;
  }
  
  // API requests - Network First with intelligent fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }
  
  // HTML pages - Stale While Revalidate
  if (request.destination === 'document') {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }
  
  // Default - Network with cache fallback
  event.respondWith(networkWithCacheFallback(request));
});

// Advanced caching strategies
async function cacheFirstWithUpdate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {}); // Ignore network errors
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline fallback for critical resources
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }
    throw error;
  }
}

async function networkFirstWithFallback(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    // For non-ok responses, try cache
    const cachedResponse = await cache.match(request);
    return cachedResponse || networkResponse;
    
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return structured offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'offline', 
        message: 'This request is not available offline' 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
```

### 4. Mobile React Native Implementation
```typescript
// MobileOfflineManager.ts - Complete mobile solution
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';
import CryptoJS from 'crypto-js';

export class MobileOfflineManager {
  private syncQueue: OfflineOperation[] = [];
  private isOnline: boolean = true;
  private syncInProgress: boolean = false;
  private encryptionKey: string;
  
  constructor(encryptionKey?: string) {
    this.encryptionKey = encryptionKey || 'default-key';
    this.initializeNetworkListener();
    this.loadSyncQueue();
    this.setupPeriodicSync();
  }
  
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // Announce connectivity changes for accessibility
      if (wasOffline && this.isOnline) {
        this.announceToScreenReader('Connection restored. Syncing data...');
        this.processSyncQueue();
      } else if (!this.isOnline) {
        this.announceToScreenReader('Connection lost. Working offline.');
      }
    });
  }
  
  // Secure offline data storage
  async storeOfflineData<T>(key: string, data: T, encrypt: boolean = false): Promise<void> {
    try {
      const payload = {
        data,
        timestamp: Date.now(),
        version: 1,
        encrypted: encrypt
      };
      
      let serializedData = JSON.stringify(payload);
      
      if (encrypt) {
        serializedData = CryptoJS.AES.encrypt(serializedData, this.encryptionKey).toString();
      }
      
      await AsyncStorage.setItem(`offline_${key}`, serializedData);
    } catch (error) {
      console.error('Failed to store offline data:', error);
      throw new OfflineStorageError('Storage failed', error);
    }
  }
  
  async getOfflineData<T>(key: string): Promise<T | null> {
    try {
      let serializedData = await AsyncStorage.getItem(`offline_${key}`);
      if (!serializedData) return null;
      
      // Try to decrypt if it looks encrypted
      try {
        const decrypted = CryptoJS.AES.decrypt(serializedData, this.encryptionKey);
        const decryptedString = decrypted.toString(CryptoJS.enc.Utf8);
        if (decryptedString) {
          serializedData = decryptedString;
        }
      } catch {
        // Not encrypted or decryption failed, use as-is
      }
      
      const { data, timestamp, encrypted } = JSON.parse(serializedData);
      
      // Check staleness (configurable per data type)
      const maxAge = this.getMaxAge(key);
      const isStale = Date.now() - timestamp > maxAge;
      
      if (isStale && this.isOnline) {
        return null; // Force fresh fetch
      }
      
      return data;
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }
  
  // Smart operation queuing with conflict detection
  async queueOperation(operation: OfflineOperation): Promise<void> {
    // Check for existing operations on same resource
    const existingIndex = this.syncQueue.findIndex(
      op => op.endpoint === operation.endpoint && 
            op.resourceId === operation.resourceId
    );
    
    if (existingIndex !== -1) {
      // Merge or replace based on operation type
      if (operation.type === 'DELETE') {
        // Delete supersedes all other operations
        this.syncQueue.splice(existingIndex, 1, operation);
      } else if (operation.type === 'UPDATE') {
        // Merge update data
        const existing = this.syncQueue[existingIndex];
        if (existing.type === 'UPDATE' || existing.type === 'CREATE') {
          existing.data = { ...existing.data, ...operation.data };
          existing.timestamp = operation.timestamp;
          return;
        }
      }
    }
    
    this.syncQueue.push(operation);
    await this.saveSyncQueue();
    
    // Try immediate sync if online
    if (this.isOnline && !this.syncInProgress) {
      this.processSyncQueue();
    }
  }
  
  private async processSyncQueue(): Promise<SyncResult> {
    if (!this.isOnline || this.syncQueue.length === 0 || this.syncInProgress) {
      return { successful: [], failed: [], conflicts: [] };
    }
    
    this.syncInProgress = true;
    const operations = [...this.syncQueue];
    const results: SyncResult = { successful: [], failed: [], conflicts: [] };
    
    // Process operations in chronological order
    operations.sort((a, b) => a.timestamp - b.timestamp);
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
        results.successful.push(operation);
        
        // Remove from queue
        this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
        
      } catch (error) {
        if (error instanceof ConflictError) {
          results.conflicts.push({ operation, error });
        } else {
          operation.retryCount = (operation.retryCount || 0) + 1;
          
          if (operation.retryCount >= 3) {
            results.failed.push({ operation, error });
            this.syncQueue = this.syncQueue.filter(op => op.id !== operation.id);
          }
        }
      }
    }
    
    await this.saveSyncQueue();
    this.syncInProgress = false;
    
    // Announce sync results
    const message = `Sync complete: ${results.successful.length} successful, ${results.failed.length} failed`;
    this.announceToScreenReader(message);
    
    return results;
  }
  
  private announceToScreenReader(message: string) {
    // Implementation would depend on your accessibility framework
    console.log(`[A11Y] ${message}`);
  }
}

// Usage in React Native component
function OfflineTaskManager() {
  const [tasks, setTasks] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const offlineManager = useRef(new MobileOfflineManager()).current;
  
  useEffect(() => {
    // Load cached tasks
    loadOfflineTasks();
    
    // Listen for network changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected ?? false);
    });
    
    return unsubscribe;
  }, []);
  
  const loadOfflineTasks = async () => {
    const cachedTasks = await offlineManager.getOfflineData('tasks');
    if (cachedTasks) {
      setTasks(cachedTasks);
    }
    
    // Try to fetch fresh data if online
    if (isOnline) {
      try {
        const freshTasks = await api.getTasks();
        setTasks(freshTasks);
        await offlineManager.storeOfflineData('tasks', freshTasks);
      } catch (error) {
        // Use cached data
      }
    }
  };
  
  const createTask = async (taskData) => {
    const tempId = `temp_${Date.now()}`;
    const optimisticTask = { ...taskData, id: tempId, synced: false };
    
    // Optimistic update
    setTasks(prev => [...prev, optimisticTask]);
    
    // Queue for sync
    await offlineManager.queueOperation({
      id: generateId(),
      type: 'CREATE',
      endpoint: '/api/tasks',
      data: taskData,
      timestamp: Date.now(),
      optimisticId: tempId
    });
  };
  
  return (
    <View style={styles.container}>
      <OfflineIndicator isOnline={isOnline} />
      <TaskList tasks={tasks} onCreateTask={createTask} />
    </View>
  );
}
```

### 5. Conflict Resolution Implementation
```typescript
// ConflictResolver.ts - Handle data conflicts intelligently
export class ConflictResolver {
  async resolveConflicts(conflicts: ConflictData[]): Promise<ResolutionResult[]> {
    const results: ResolutionResult[] = [];
    
    for (const conflict of conflicts) {
      const resolution = await this.resolveConflict(conflict);
      results.push(resolution);
    }
    
    return results;
  }
  
  private async resolveConflict(conflict: ConflictData): Promise<ResolutionResult> {
    const { localData, serverData, operation } = conflict;
    
    // Automatic resolution strategies
    switch (operation.conflictStrategy || 'user-prompt') {
      case 'last-write-wins':
        return this.lastWriteWins(localData, serverData);
        
      case 'merge-fields':
        return this.mergeFields(localData, serverData);
        
      case 'server-wins':
        return { resolution: 'server', data: serverData };
        
      case 'local-wins':
        return { resolution: 'local', data: localData };
        
      case 'user-prompt':
      default:
        return this.promptUserResolution(conflict);
    }
  }
  
  private async promptUserResolution(conflict: ConflictData): Promise<ResolutionResult> {
    return new Promise((resolve) => {
      // Show conflict resolution UI
      showConflictDialog({
        conflict,
        onResolve: (resolution) => resolve(resolution),
        options: [
          { label: 'Keep Local Changes', value: 'local' },
          { label: 'Use Server Version', value: 'server' },
          { label: 'Merge Both', value: 'merge' }
        ]
      });
    });
  }
  
  private mergeFields(local: any, server: any): ResolutionResult {
    // Intelligent field-level merging
    const merged = { ...server };
    
    // Preserve local changes for specific fields
    const localOnlyFields = ['draft', 'localNotes', 'clientState'];
    localOnlyFields.forEach(field => {
      if (local[field] !== undefined) {
        merged[field] = local[field];
      }
    });
    
    // Handle arrays by merging unique items
    Object.keys(local).forEach(key => {
      if (Array.isArray(local[key]) && Array.isArray(server[key])) {
        merged[key] = this.mergeArrays(local[key], server[key]);
      }
    });
    
    return { resolution: 'merged', data: merged };
  }
}
```

## Overview
Implement comprehensive offline capabilities with intelligent caching, conflict resolution, and seamless online/offline transitions for optimal user experience.

## Core Implementation Requirements

### Offline Architecture
- **Service Worker Implementation**: Robust service worker for network interception and caching
- **Cache Strategies**: Multiple caching strategies (Cache First, Network First, Stale While Revalidate)
- **Background Sync**: Queue operations for execution when connection is restored
- **Conflict Resolution**: Intelligent conflict resolution for offline/online data synchronization
- **Progressive Enhancement**: Core functionality available offline, enhanced features online

### Caching Strategies
- **Static Assets**: Cache First strategy for CSS, JS, images, and fonts
- **API Responses**: Network First with fallback to cache for dynamic content
- **User Data**: Cache user-specific data with intelligent invalidation
- **Critical Resources**: Pre-cache essential resources for offline functionality
- **Storage Management**: Intelligent cache eviction based on usage patterns and storage limits

### Security Features
- **Secure Offline Storage**: Encrypt sensitive data in offline storage
- **Data Integrity**: Verify data integrity when syncing offline changes
- **Authentication Handling**: Manage authentication tokens in offline scenarios
- **Privacy Protection**: Ensure offline data doesn't leak sensitive information

### Accessibility Implementation
- **Offline Indicators**: Clear visual and screen reader indicators for offline status
- **Graceful Degradation**: Maintain accessibility features in offline mode
- **Error Communication**: Accessible error messages for offline limitations
- **Progress Feedback**: Accessible progress indicators for sync operations

### Internationalization Support
- **Offline Translations**: Cache translation files for offline use
- **Locale-Specific Caching**: Cache locale-specific resources and data
- **Cultural Adaptations**: Adapt offline messaging for different cultures
- **RTL Support**: Maintain RTL layout support in offline mode

### Platform-Specific Implementations

#### Web Service Worker Implementation
```javascript
// Advanced service worker with multiple caching strategies
const CACHE_NAME = 'app-cache-v1';
const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';

// Cache strategies
const cacheStrategies = {
  cacheFirst: async (request) => {
    const cachedResponse = await caches.match(request);
    return cachedResponse || fetch(request);
  },
  
  networkFirst: async (request) => {
    try {
      const networkResponse = await fetch(request);
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    } catch (error) {
      return await caches.match(request);
    }
  },
  
  staleWhileRevalidate: async (request) => {
    const cachedResponse = await caches.match(request);
    const networkResponsePromise = fetch(request).then(response => {
      const cache = caches.open(DYNAMIC_CACHE);
      cache.then(c => c.put(request, response.clone()));
      return response;
    });
    
    return cachedResponse || networkResponsePromise;
  }
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/static/css/main.css',
        '/static/js/main.js',
        '/static/images/logo.png',
        '/offline.html'
      ]);
    })
  );
});

// Fetch event - apply caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Static assets - Cache First
  if (request.destination === 'style' || 
      request.destination === 'script' || 
      request.destination === 'image') {
    event.respondWith(cacheStrategies.cacheFirst(request));
    return;
  }
  
  // API requests - Network First
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(cacheStrategies.networkFirst(request));
    return;
  }
  
  // HTML pages - Stale While Revalidate
  if (request.destination === 'document') {
    event.respondWith(cacheStrategies.staleWhileRevalidate(request));
    return;
  }
});

// Background sync for queued operations
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

async function processOfflineQueue() {
  const queue = await getOfflineQueue();
  
  for (const operation of queue) {
    try {
      await executeOperation(operation);
      await removeFromQueue(operation.id);
    } catch (error) {
      console.error('Failed to sync operation:', error);
      // Keep in queue for retry
    }
  }
}
```

#### React Offline Hook Implementation
```typescript
// Comprehensive offline management hook
const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [queuedOperations, setQueuedOperations] = useState<OfflineOperation[]>([]);
  
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineOperations();
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      announceToScreenReader('You are now offline. Some features may be limited.');
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  const queueOperation = useCallback(async (operation: OfflineOperation) => {
    const queue = await getOfflineQueue();
    queue.push(operation);
    await saveOfflineQueue(queue);
    setQueuedOperations(queue);
    
    // Register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('background-sync');
    }
  }, []);
  
  const syncOfflineOperations = useCallback(async () => {
    if (!isOnline) return;
    
    setSyncStatus('syncing');
    
    try {
      const queue = await getOfflineQueue();
      const results = await Promise.allSettled(
        queue.map(operation => executeOperation(operation))
      );
      
      // Handle conflicts and errors
      const conflicts = results
        .filter((result, index) => 
          result.status === 'rejected' && 
          result.reason instanceof ConflictError
        )
        .map((_, index) => queue[index]);
      
      if (conflicts.length > 0) {
        await handleConflicts(conflicts);
      }
      
      // Clear successfully synced operations
      const failedOperations = results
        .map((result, index) => result.status === 'rejected' ? queue[index] : null)
        .filter(Boolean);
      
      await saveOfflineQueue(failedOperations);
      setQueuedOperations(failedOperations);
      setSyncStatus('idle');
      
      announceToScreenReader(`Sync complete. ${queue.length - failedOperations.length} operations synced.`);
    } catch (error) {
      setSyncStatus('error');
      announceToScreenReader('Sync failed. Will retry automatically.');
    }
  }, [isOnline]);
  
  return {
    isOnline,
    syncStatus,
    queuedOperations,
    queueOperation,
    syncOfflineOperations
  };
};

// Offline-aware data fetching hook
const useOfflineData = <T>(key: string, fetcher: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useOffline();
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Try to load from cache first
        const cachedData = await getCachedData<T>(key);
        if (cachedData) {
          setData(cachedData);
          setLoading(false);
        }
        
        // If online, fetch fresh data
        if (isOnline) {
          const freshData = await fetcher();
          setData(freshData);
          await setCachedData(key, freshData);
        }
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [key, isOnline]);
  
  return { data, loading, error, isOnline };
};
```

#### Mobile Implementation
```typescript
// React Native offline storage and sync
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-netinfo/netinfo';

class MobileOfflineManager {
  private syncQueue: OfflineOperation[] = [];
  private isOnline: boolean = true;
  
  constructor() {
    this.initializeNetworkListener();
    this.loadSyncQueue();
  }
  
  private initializeNetworkListener() {
    NetInfo.addEventListener(state => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;
      
      // Trigger sync when coming back online
      if (wasOffline && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }
  
  async storeOfflineData<T>(key: string, data: T): Promise<void> {
    try {
      const serializedData = JSON.stringify({
        data,
        timestamp: Date.now(),
        version: 1
      });
      await AsyncStorage.setItem(`offline_${key}`, serializedData);
    } catch (error) {
      console.error('Failed to store offline data:', error);
    }
  }
  
  async getOfflineData<T>(key: string): Promise<T | null> {
    try {
      const serializedData = await AsyncStorage.getItem(`offline_${key}`);
      if (!serializedData) return null;
      
      const { data, timestamp } = JSON.parse(serializedData);
      
      // Check if data is stale (older than 24 hours)
      const isStale = Date.now() - timestamp > 24 * 60 * 60 * 1000;
      if (isStale && this.isOnline) {
        return null; // Force fresh fetch
      }
      
      return data;
    } catch (error) {
      console.error('Failed to retrieve offline data:', error);
      return null;
    }
  }
  
  async queueOperation(operation: OfflineOperation): Promise<void> {
    this.syncQueue.push(operation);
    await this.saveSyncQueue();
    
    // Try immediate sync if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }
  
  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    const operations = [...this.syncQueue];
    this.syncQueue = [];
    
    for (const operation of operations) {
      try {
        await this.executeOperation(operation);
      } catch (error) {
        // Re-queue failed operations
        this.syncQueue.push(operation);
        console.error('Sync operation failed:', error);
      }
    }
    
    await this.saveSyncQueue();
  }
  
  private async executeOperation(operation: OfflineOperation): Promise<void> {
    switch (operation.type) {
      case 'CREATE':
        await this.api.create(operation.data);
        break;
      case 'UPDATE':
        await this.api.update(operation.id, operation.data);
        break;
      case 'DELETE':
        await this.api.delete(operation.id);
        break;
    }
  }
}
```

## Testing Requirements

### Unit Tests
- Test caching strategy implementations
- Test offline queue management
- Test conflict resolution logic
- Test data integrity validation

### Property-Based Tests
- **Offline Data Consistency Property**: For any data stored offline, it should maintain consistency when synced online
- **Cache Strategy Property**: For any caching strategy, it should serve appropriate responses based on network availability
- **Sync Queue Property**: For any queued operation, it should eventually be executed when network is available

### Integration Tests
- Test complete offline/online transition workflows
- Test background sync functionality
- Test conflict resolution scenarios
- Test storage quota management

### Performance Tests
- Test cache performance with large datasets
- Test sync performance with large operation queues
- Test storage efficiency and cleanup

## Monitoring & Observability

### Metrics to Track
- Offline usage patterns and duration
- Cache hit/miss ratios for different strategies
- Sync success/failure rates
- Conflict resolution frequency and success rates

### User Experience Monitoring
- Track user engagement during offline periods
- Monitor sync completion times
- Track storage usage and cleanup effectiveness

## Configuration Variables
- `{{cache_strategies}}` - Caching strategy configuration
- `{{offline_storage_limit}}` - Maximum offline storage size
- `{{sync_retry_attempts}}` - Number of sync retry attempts
- `{{conflict_resolution_strategy}}` - Default conflict resolution approach
- `{{critical_resources}}` - Resources to pre-cache for offline use

## Dependencies
- Service Worker API (web)
- IndexedDB or WebSQL for offline storage
- Background Sync API
- Network Information API
- AsyncStorage (React Native)
- NetInfo (React Native)

## Documentation Requirements
- Offline functionality user guide
- Caching strategy documentation
- Conflict resolution procedures
- Storage management guidelines
- Troubleshooting guide for offline issues