# Desktop Offline-First Patterns

## Purpose
Patterns for building desktop applications that work seamlessly offline, with local data storage, sync strategies, and conflict resolution.

## Core Patterns

### 1. Local Database

```typescript
// Using SQLite for local storage
import Database from 'tauri-plugin-sql-api';

class LocalDatabase {
  private db: Database;
  
  async initialize(): Promise<void> {
    this.db = await Database.load('sqlite:myapp.db');
    
    await this.db.execute(`
      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        updated_at INTEGER,
        synced BOOLEAN DEFAULT 0
      )
    `);
  }
  
  async saveDocument(doc: Document): Promise<void> {
    await this.db.execute(
      'INSERT OR REPLACE INTO documents (id, title, content, updated_at, synced) VALUES (?, ?, ?, ?, ?)',
      [doc.id, doc.title, doc.content, Date.now(), false]
    );
  }
  
  async getDocument(id: string): Promise<Document | null> {
    const result = await this.db.select<Document[]>(
      'SELECT * FROM documents WHERE id = ?',
      [id]
    );
    return result[0] || null;
  }
  
  async getUnsyncedDocuments(): Promise<Document[]> {
    return await this.db.select<Document[]>(
      'SELECT * FROM documents WHERE synced = 0'
    );
  }
}
```

### 2. Sync Strategy

```typescript
class SyncManager {
  private db: LocalDatabase;
  private api: APIClient;
  private syncInterval: number = 60000; // 1 minute
  
  async startSync(): Promise<void> {
    // Initial sync
    await this.sync();
    
    // Periodic sync
    setInterval(() => this.sync(), this.syncInterval);
    
    // Sync on network reconnect
    window.addEventListener('online', () => this.sync());
  }
  
  async sync(): Promise<void> {
    if (!navigator.onLine) return;
    
    try {
      // Push local changes
      await this.pushChanges();
      
      // Pull remote changes
      await this.pullChanges();
      
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
  
  private async pushChanges(): Promise<void> {
    const unsynced = await this.db.getUnsyncedDocuments();
    
    for (const doc of unsynced) {
      try {
        await this.api.updateDocument(doc);
        await this.db.markAsSynced(doc.id);
      } catch (error) {
        console.error(`Failed to sync document ${doc.id}:`, error);
      }
    }
  }
  
  private async pullChanges(): Promise<void> {
    const lastSync = await this.db.getLastSyncTime();
    const changes = await this.api.getChangesSince(lastSync);
    
    for (const change of changes) {
      await this.handleRemoteChange(change);
    }
    
    await this.db.setLastSyncTime(Date.now());
  }
}
```

### 3. Conflict Resolution

```typescript
interface ConflictResolution {
  strategy: 'local' | 'remote' | 'merge' | 'manual';
  resolve(local: Document, remote: Document): Document;
}

class ConflictResolver {
  async resolveConflict(
    local: Document,
    remote: Document,
    strategy: ConflictResolution
  ): Promise<Document> {
    switch (strategy.strategy) {
      case 'local':
        return local;
      
      case 'remote':
        return remote;
      
      case 'merge':
        return this.mergeDocuments(local, remote);
      
      case 'manual':
        return await this.promptUser(local, remote);
    }
  }
  
  private mergeDocuments(local: Document, remote: Document): Document {
    // Last-write-wins based on timestamp
    if (local.updated_at > remote.updated_at) {
      return local;
    }
    return remote;
  }
  
  private async promptUser(local: Document, remote: Document): Promise<Document> {
    // Show conflict resolution UI
    return new Promise((resolve) => {
      // User chooses which version to keep
    });
  }
}
```

### 4. File Caching

```rust
use std::path::PathBuf;
use std::fs;

#[tauri::command]
async fn cache_file(url: String, app_handle: tauri::AppHandle) -> Result<String, String> {
    let cache_dir = app_handle
        .path_resolver()
        .app_cache_dir()
        .ok_or("Failed to get cache dir")?;
    
    // Create cache directory
    fs::create_dir_all(&cache_dir)
        .map_err(|e| e.to_string())?;
    
    // Download file
    let response = reqwest::get(&url)
        .await
        .map_err(|e| e.to_string())?;
    
    let bytes = response.bytes()
        .await
        .map_err(|e| e.to_string())?;
    
    // Save to cache
    let filename = url.split('/').last().unwrap_or("cached_file");
    let cache_path = cache_dir.join(filename);
    
    fs::write(&cache_path, bytes)
        .map_err(|e| e.to_string())?;
    
    Ok(cache_path.to_string_lossy().to_string())
}

#[tauri::command]
fn get_cached_file(filename: String, app_handle: tauri::AppHandle) -> Result<Vec<u8>, String> {
    let cache_dir = app_handle
        .path_resolver()
        .app_cache_dir()
        .ok_or("Failed to get cache dir")?;
    
    let cache_path = cache_dir.join(filename);
    
    fs::read(cache_path)
        .map_err(|e| e.to_string())
}
```

### 5. Queue System for Offline Actions

```typescript
interface QueuedAction {
  id: string;
  type: string;
  payload: any;
  timestamp: number;
  retries: number;
}

class ActionQueue {
  private queue: QueuedAction[] = [];
  private maxRetries = 3;
  
  async enqueue(type: string, payload: any): Promise<void> {
    const action: QueuedAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now(),
      retries: 0
    };
    
    this.queue.push(action);
    await this.saveQueue();
    
    // Try to process immediately if online
    if (navigator.onLine) {
      await this.processQueue();
    }
  }
  
  async processQueue(): Promise<void> {
    while (this.queue.length > 0 && navigator.onLine) {
      const action = this.queue[0];
      
      try {
        await this.executeAction(action);
        this.queue.shift();
        await this.saveQueue();
      } catch (error) {
        action.retries++;
        
        if (action.retries >= this.maxRetries) {
          // Move to failed queue
          this.queue.shift();
          await this.saveFailedAction(action);
        }
        
        break; // Stop processing on error
      }
    }
  }
  
  private async executeAction(action: QueuedAction): Promise<void> {
    switch (action.type) {
      case 'create_document':
        await api.createDocument(action.payload);
        break;
      case 'update_document':
        await api.updateDocument(action.payload);
        break;
      case 'delete_document':
        await api.deleteDocument(action.payload.id);
        break;
    }
  }
}
```

## Best Practices

1. **Always save locally first** for instant feedback
2. **Sync in background** without blocking UI
3. **Handle conflicts gracefully** with clear resolution strategies
4. **Cache aggressively** for offline access
5. **Queue actions** when offline
6. **Provide sync status** to users
7. **Test offline scenarios** thoroughly
8. **Implement exponential backoff** for retries

## Related Modules

- `desktop/native-integrations.md` - Native features
- `data-processing/data-pipelines.md` - Data sync patterns
- `performance/caching.md` - Caching strategies
