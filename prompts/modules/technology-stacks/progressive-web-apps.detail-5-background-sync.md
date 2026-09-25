### Background Sync Implementation

```typescript
// src/services/backgroundSync.ts
export class BackgroundSyncService {
  private dbName = 'PWADatabase';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains('pendingActions')) {
          const store = db.createObjectStore('pendingActions', { 
            keyPath: 'id', 
            autoIncrement: true 
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
        }
      };
    });
  }

  async addPendingAction(action: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
    type: string;
  }): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      
      const actionWithTimestamp = {
        ...action,
        timestamp: Date.now()
      };

      const request = store.add(actionWithTimestamp);
      
      request.onsuccess = () => {
        console.log('Pending action added:', actionWithTimestamp);
        
        // Register background sync
        if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
          navigator.serviceWorker.ready.then(registration => {
            return registration.sync.register('background-sync');
          }).catch(error => {
            console.error('Background sync registration failed:', error);
          });
        }
        
        resolve();
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingActions(): Promise<any[]> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const request = store.getAll();
      
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async removePendingAction(id: number): Promise<void> {
    if (!this.db) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      const transaction = this.db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const request = store.delete(id);
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// src/hooks/useBackgroundSync.ts
import { useState, useEffect } from 'react';
import { BackgroundSyncService } from '../services/backgroundSync';

export function useBackgroundSync() {
  const [isSupported, setIsSupported] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncService] = useState(() => new BackgroundSyncService());

  useEffect(() => {
    const checkSupport = () => {
      const supported = 'serviceWorker' in navigator && 
                       'sync' in window.ServiceWorkerRegistration.prototype;
      setIsSupported(supported);
    };

    const updatePendingCount = async () => {
      try {
        const actions = await syncService.getPendingActions();
        setPendingCount(actions.length);
      } catch (error) {
        console.error('Failed to get pending actions:', error);
      }
    };

    checkSupport();
    updatePendingCount();

    // Listen for background sync success messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC_SUCCESS') {
          updatePendingCount();
        }
      });
    }

    // Update count periodically
    const interval = setInterval(updatePendingCount, 30000);
    
    return () => clearInterval(interval);
  }, [syncService]);

  const addPendingAction = async (action: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    body?: string;
    type: string;
  }): Promise<void> => {
    try {
      await syncService.addPendingAction(action);
      setPendingCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to add pending action:', error);
      throw error;
    }
  };

  return {
    isSupported,
    pendingCount,
    addPendingAction
  };
}
```

