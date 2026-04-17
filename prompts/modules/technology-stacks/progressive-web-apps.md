# Progressive Web Apps (PWA) Technology Stack Template

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

This template provides comprehensive patterns for implementing Progressive Web Apps with native-like experiences, offline functionality, push notifications, and app-like installation. It covers service workers, web app manifests, caching strategies, background sync, and modern web APIs to create fast, reliable, and engaging web applications that work across all devices.

## Context

Progressive Web Apps bridge the gap between web and native applications by leveraging modern web capabilities to deliver app-like experiences. This template addresses the complexity of implementing PWA features including offline support, push notifications, background sync, and installability while ensuring performance, accessibility, and cross-browser compatibility.

## Examples

### Example 1: Complete PWA Setup
```javascript
// Service worker with comprehensive caching strategies
// Web app manifest for installability
// Push notification integration
// Background sync for offline actions
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => console.log('SW registered'))
    .catch(error => console.log('SW registration failed'));
}
```

### Example 2: Offline-First Architecture
```javascript
// Cache-first strategy for static assets
// Network-first for dynamic content
// Background sync for user actions
// IndexedDB for offline data storage
const cacheFirst = async (request) => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  return cached || fetch(request);
};
```

### Example 3: Native-Like Features
```javascript
// App installation prompt
// Push notifications with user engagement
// Share API integration
// Fullscreen and standalone display modes
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
  showInstallButton();
});
```

## Instructions

### PWA Implementation Checklist

Essential PWA requirements and features:

| Feature | Priority | Implementation | Browser Support |
|---------|----------|----------------|-----------------|
| **HTTPS** | Critical | SSL certificate required | Universal |
| **Service Worker** | Critical | Offline functionality | 95%+ |
| **Web App Manifest** | Critical | Installation and branding | 90%+ |
| **Responsive Design** | Critical | Mobile-first approach | Universal |
| **Push Notifications** | High | User engagement | 85%+ |
| **Background Sync** | High | Offline actions | 80%+ |
| **App Shell** | High | Fast loading | Universal |
| **Add to Home Screen** | Medium | Installation prompt | 85%+ |

### Service Worker Implementation

```javascript
// sw.js - Comprehensive service worker
const CACHE_VERSION = 'v2.1.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const OFFLINE_CACHE = `offline-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/images/icon-192.png',
  '/static/images/icon-512.png',
  '/offline.html'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      caches.open(OFFLINE_CACHE).then(cache => {
        return cache.add('/offline.html');
      })
    ]).then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== STATIC_CACHE && 
              cacheName !== DYNAMIC_CACHE && 
              cacheName !== OFFLINE_CACHE) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete');
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|woff2?)$/)) {
    // Static assets - Cache first
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.pathname === '/' || url.pathname.startsWith('/app/')) {
    // App shell - Stale while revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // Other requests - Network first
    event.respondWith(networkFirstStrategy(request));
  }
});

// Caching strategies
async function cacheFirstStrategy(request) {
  try {
    const cache = await caches.open(STATIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Cache first strategy failed:', error);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstStrategy(request) {
  try {
    const response = await fetch(request);
    
    if (response.status === 200) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    
    const cache = await caches.open(DYNAMIC_CACHE);
    const cached = await cache.match(request);
    
    if (cached) {
      return cached;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineCache = await caches.open(OFFLINE_CACHE);
      return offlineCache.match('/offline.html');
    }
    
    return new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);
  
  const fetchPromise = fetch(request).then(response => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);
  
  return cached || fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Get pending actions from IndexedDB
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove successful action from pending queue
        await removePendingAction(action.id);
        
        // Notify clients of successful sync
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'BACKGROUND_SYNC_SUCCESS',
              action: action
            });
          });
        });
      } catch (error) {
        console.error('Background sync failed for action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Service Worker: Push received');
  
  const options = {
    body: 'You have a new notification!',
    icon: '/static/images/icon-192.png',
    badge: '/static/images/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/static/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/static/images/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const payload = event.data.json();
    options.body = payload.body || options.body;
    options.data = { ...options.data, ...payload.data };
  }
  
  event.waitUntil(
    self.registration.showNotification('PWA Notification', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/notifications')
    );
  } else if (event.action === 'close') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// IndexedDB helpers for background sync
async function getPendingActions() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PWADatabase', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingActions'], 'readonly');
      const store = transaction.objectStore('pendingActions');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => resolve(getAllRequest.result);
      getAllRequest.onerror = () => reject(getAllRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}

async function removePendingAction(id) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('PWADatabase', 1);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['pendingActions'], 'readwrite');
      const store = transaction.objectStore('pendingActions');
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
    
    request.onerror = () => reject(request.error);
  });
}
```

### Web App Manifest

```json
{
  "name": "Progressive Web App",
  "short_name": "PWA",
  "description": "A comprehensive Progressive Web App with offline capabilities",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#2196F3",
  "background_color": "#ffffff",
  "lang": "en-US",
  "dir": "ltr",
  "categories": ["productivity", "utilities"],
  "icons": [
    {
      "src": "/static/images/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/static/images/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/static/images/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/static/images/screenshot-mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow",
      "label": "Mobile view of the application"
    },
    {
      "src": "/static/images/screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide",
      "label": "Desktop view of the application"
    }
  ],
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "View your dashboard",
      "url": "/dashboard",
      "icons": [
        {
          "src": "/static/images/dashboard-icon.png",
          "sizes": "192x192"
        }
      ]
    },
    {
      "name": "Profile",
      "short_name": "Profile",
      "description": "View your profile",
      "url": "/profile",
      "icons": [
        {
          "src": "/static/images/profile-icon.png",
          "sizes": "192x192"
        }
      ]
    }
  ],
  "share_target": {
    "action": "/share",
    "method": "POST",
    "enctype": "multipart/form-data",
    "params": {
      "title": "title",
      "text": "text",
      "url": "url",
      "files": [
        {
          "name": "files",
          "accept": ["image/*", "text/*"]
        }
      ]
    }
  },
  "protocol_handlers": [
    {
      "protocol": "web+pwa",
      "url": "/handle?url=%s"
    }
  ]
}
```

### React PWA Integration

```typescript
// src/hooks/usePWA.ts
import { useState, useEffect } from 'react';

interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface UsePWAReturn {
  isInstallable: boolean;
  isInstalled: boolean;
  isOffline: boolean;
  installApp: () => Promise<void>;
  updateAvailable: boolean;
  updateApp: () => Promise<void>;
}

export function usePWA(): UsePWAReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPrompt | null>(null);

  useEffect(() => {
    // Check if app is installed
    const checkInstalled = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      const isInWebAppiOS = (window.navigator as any).standalone === true;
      setIsInstalled(isStandalone || isInWebAppiOS);
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setIsInstallable(true);
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    // Listen for online/offline status
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    // Listen for service worker updates
    const handleServiceWorkerUpdate = () => {
      setUpdateAvailable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker update listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          handleServiceWorkerUpdate();
        }
      });
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const installApp = async (): Promise<void> => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setIsInstallable(false);
    } catch (error) {
      console.error('Error during app installation:', error);
    }
  };

  const updateApp = async (): Promise<void> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        window.location.reload();
      }
    }
  };

  return {
    isInstallable,
    isInstalled,
    isOffline,
    installApp,
    updateAvailable,
    updateApp
  };
}

// src/components/PWAPrompt.tsx
import React from 'react';
import { usePWA } from '../hooks/usePWA';

export function PWAPrompt() {
  const { isInstallable, isOffline, installApp, updateAvailable, updateApp } = usePWA();

  if (updateAvailable) {
    return (
      <div className="pwa-prompt update-prompt">
        <div className="prompt-content">
          <h3>Update Available</h3>
          <p>A new version of the app is available. Update now for the latest features.</p>
          <div className="prompt-actions">
            <button onClick={updateApp} className="btn-primary">
              Update Now
            </button>
            <button onClick={() => {}} className="btn-secondary">
              Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isOffline) {
    return (
      <div className="pwa-prompt offline-prompt">
        <div className="prompt-content">
          <h3>You're Offline</h3>
          <p>You can continue using the app. Changes will sync when you're back online.</p>
        </div>
      </div>
    );
  }

  if (isInstallable) {
    return (
      <div className="pwa-prompt install-prompt">
        <div className="prompt-content">
          <h3>Install App</h3>
          <p>Install this app on your device for a better experience.</p>
          <div className="prompt-actions">
            <button onClick={installApp} className="btn-primary">
              Install
            </button>
            <button onClick={() => {}} className="btn-secondary">
              Not Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// src/components/OfflineIndicator.tsx
import React from 'react';
import { usePWA } from '../hooks/usePWA';

export function OfflineIndicator() {
  const { isOffline } = usePWA();

  if (!isOffline) return null;

  return (
    <div className="offline-indicator">
      <span className="offline-icon">📡</span>
      <span>Offline Mode</span>
    </div>
  );
}
```

### Push Notifications Implementation

```typescript
// src/services/pushNotifications.ts
export class PushNotificationService {
  private vapidPublicKey: string;
  private registration: ServiceWorkerRegistration | null = null;

  constructor(vapidPublicKey: string) {
    this.vapidPublicKey = vapidPublicKey;
  }

  async initialize(): Promise<void> {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    this.registration = await navigator.serviceWorker.ready;
  }

  async requestPermission(): Promise<NotificationPermission> {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
    } else if (permission === 'denied') {
      console.log('Notification permission denied');
    } else {
      console.log('Notification permission dismissed');
    }

    return permission;
  }

  async subscribe(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      throw new Error('Service worker not registered');
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
      });

      console.log('Push subscription created:', subscription);
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      
      if (subscription) {
        const successful = await subscription.unsubscribe();
        
        if (successful) {
          // Remove subscription from server
          await this.removeSubscriptionFromServer(subscription);
        }
        
        return successful;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.initialize();
    }

    if (!this.registration) {
      return null;
    }

    return this.registration.pushManager.getSubscription();
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to send subscription to server:', error);
    }
  }

  private async removeSubscriptionFromServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('Failed to remove subscription from server:', error);
    }
  }
}

// src/hooks/usePushNotifications.ts
import { useState, useEffect } from 'react';
import { PushNotificationService } from '../services/pushNotifications';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY || '';

export function usePushNotifications() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [pushService] = useState(() => new PushNotificationService(VAPID_PUBLIC_KEY));

  useEffect(() => {
    const checkSupport = async () => {
      const supported = 'serviceWorker' in navigator && 'PushManager' in window;
      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        
        try {
          await pushService.initialize();
          const subscription = await pushService.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error('Failed to initialize push notifications:', error);
        }
      }
    };

    checkSupport();
  }, [pushService]);

  const requestPermission = async (): Promise<boolean> => {
    try {
      const newPermission = await pushService.requestPermission();
      setPermission(newPermission);
      return newPermission === 'granted';
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  };

  const subscribe = async (): Promise<boolean> => {
    try {
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      const subscription = await pushService.subscribe();
      setIsSubscribed(!!subscription);
      return !!subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return false;
    }
  };

  const unsubscribe = async (): Promise<boolean> => {
    try {
      const success = await pushService.unsubscribe();
      if (success) {
        setIsSubscribed(false);
      }
      return success;
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      return false;
    }
  };

  return {
    isSupported,
    permission,
    isSubscribed,
    requestPermission,
    subscribe,
    unsubscribe
  };
}
```

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

### PWA Performance Optimization

```typescript
// src/utils/pwaOptimization.ts
export class PWAOptimizer {
  private static instance: PWAOptimizer;
  private performanceObserver: PerformanceObserver | null = null;

  static getInstance(): PWAOptimizer {
    if (!PWAOptimizer.instance) {
      PWAOptimizer.instance = new PWAOptimizer();
    }
    return PWAOptimizer.instance;
  }

  initializePerformanceMonitoring(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            this.trackNavigationTiming(entry as PerformanceNavigationTiming);
          } else if (entry.entryType === 'paint') {
            this.trackPaintTiming(entry);
          } else if (entry.entryType === 'largest-contentful-paint') {
            this.trackLCP(entry);
          } else if (entry.entryType === 'first-input') {
            this.trackFID(entry);
          } else if (entry.entryType === 'layout-shift') {
            this.trackCLS(entry);
          }
        });
      });

      this.performanceObserver.observe({ 
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] 
      });
    }
  }

  private trackNavigationTiming(entry: PerformanceNavigationTiming): void {
    const metrics = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.connectEnd - entry.secureConnectionStart,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      domInteractive: entry.domInteractive - entry.navigationStart,
      domComplete: entry.domComplete - entry.navigationStart,
      loadComplete: entry.loadEventEnd - entry.navigationStart
    };

    console.log('Navigation Timing:', metrics);
    this.sendMetricsToAnalytics('navigation', metrics);
  }

  private trackPaintTiming(entry: PerformanceEntry): void {
    console.log(`${entry.name}: ${entry.startTime}ms`);
    this.sendMetricsToAnalytics('paint', {
      name: entry.name,
      startTime: entry.startTime
    });
  }

  private trackLCP(entry: PerformanceEntry): void {
    console.log(`LCP: ${entry.startTime}ms`);
    this.sendMetricsToAnalytics('lcp', {
      startTime: entry.startTime
    });
  }

  private trackFID(entry: any): void {
    console.log(`FID: ${entry.processingStart - entry.startTime}ms`);
    this.sendMetricsToAnalytics('fid', {
      delay: entry.processingStart - entry.startTime
    });
  }

  private trackCLS(entry: any): void {
    if (!entry.hadRecentInput) {
      console.log(`CLS: ${entry.value}`);
      this.sendMetricsToAnalytics('cls', {
        value: entry.value
      });
    }
  }

  private sendMetricsToAnalytics(type: string, data: any): void {
    // Send to your analytics service
    if ('navigator' in window && 'sendBeacon' in navigator) {
      navigator.sendBeacon('/api/analytics/performance', JSON.stringify({
        type,
        data,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }));
    }
  }

  preloadCriticalResources(): void {
    const criticalResources = [
      '/static/css/critical.css',
      '/static/js/critical.js',
      '/static/fonts/main.woff2'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = resource;
      
      if (resource.endsWith('.css')) {
        link.as = 'style';
      } else if (resource.endsWith('.js')) {
        link.as = 'script';
      } else if (resource.includes('font')) {
        link.as = 'font';
        link.crossOrigin = 'anonymous';
      }
      
      document.head.appendChild(link);
    });
  }

  optimizeImages(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            img.src = img.dataset.src!;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      images.forEach(img => imageObserver.observe(img));
    } else {
      // Fallback for browsers without IntersectionObserver
      images.forEach(img => {
        const image = img as HTMLImageElement;
        image.src = image.dataset.src!;
      });
    }
  }

  enableResourceHints(): void {
    // DNS prefetch for external domains
    const externalDomains = [
      'https://api.example.com',
      'https://cdn.example.com'
    ];

    externalDomains.forEach(domain => {
      const link = document.createElement('link');
      link.rel = 'dns-prefetch';
      link.href = domain;
      document.head.appendChild(link);
    });

    // Preconnect to critical third-party origins
    const criticalOrigins = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com'
    ];

    criticalOrigins.forEach(origin => {
      const link = document.createElement('link');
      link.rel = 'preconnect';
      link.href = origin;
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }
}

// Initialize PWA optimization
const pwaOptimizer = PWAOptimizer.getInstance();
pwaOptimizer.initializePerformanceMonitoring();
pwaOptimizer.preloadCriticalResources();
pwaOptimizer.optimizeImages();
pwaOptimizer.enableResourceHints();
```

### Testing PWA Features

```typescript
// src/__tests__/pwa.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PWAPrompt } from '../components/PWAPrompt';
import { usePWA } from '../hooks/usePWA';

// Mock the usePWA hook
jest.mock('../hooks/usePWA');
const mockUsePWA = usePWA as jest.MockedFunction<typeof usePWA>;

describe('PWA Features', () => {
  beforeEach(() => {
    // Reset mocks
    mockUsePWA.mockReset();
  });

  describe('PWAPrompt Component', () => {
    it('should show install prompt when app is installable', () => {
      mockUsePWA.mockReturnValue({
        isInstallable: true,
        isInstalled: false,
        isOffline: false,
        installApp: jest.fn(),
        updateAvailable: false,
        updateApp: jest.fn()
      });

      render(<PWAPrompt />);
      
      expect(screen.getByText('Install App')).toBeInTheDocument();
      expect(screen.getByText('Install this app on your device for a better experience.')).toBeInTheDocument();
    });

    it('should show offline indicator when offline', () => {
      mockUsePWA.mockReturnValue({
        isInstallable: false,
        isInstalled: false,
        isOffline: true,
        installApp: jest.fn(),
        updateAvailable: false,
        updateApp: jest.fn()
      });

      render(<PWAPrompt />);
      
      expect(screen.getByText("You're Offline")).toBeInTheDocument();
      expect(screen.getByText('You can continue using the app. Changes will sync when you\'re back online.')).toBeInTheDocument();
    });

    it('should show update prompt when update is available', () => {
      mockUsePWA.mockReturnValue({
        isInstallable: false,
        isInstalled: true,
        isOffline: false,
        installApp: jest.fn(),
        updateAvailable: true,
        updateApp: jest.fn()
      });

      render(<PWAPrompt />);
      
      expect(screen.getByText('Update Available')).toBeInTheDocument();
      expect(screen.getByText('A new version of the app is available. Update now for the latest features.')).toBeInTheDocument();
    });

    it('should call installApp when install button is clicked', async () => {
      const mockInstallApp = jest.fn();
      mockUsePWA.mockReturnValue({
        isInstallable: true,
        isInstalled: false,
        isOffline: false,
        installApp: mockInstallApp,
        updateAvailable: false,
        updateApp: jest.fn()
      });

      render(<PWAPrompt />);
      
      const installButton = screen.getByText('Install');
      fireEvent.click(installButton);

      await waitFor(() => {
        expect(mockInstallApp).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Service Worker', () => {
    it('should register service worker', async () => {
      const mockRegister = jest.fn().mockResolvedValue({});
      
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister
        },
        writable: true
      });

      // Simulate service worker registration
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/sw.js');
      }

      expect(mockRegister).toHaveBeenCalledWith('/sw.js');
    });

    it('should handle service worker registration failure', async () => {
      const mockRegister = jest.fn().mockRejectedValue(new Error('Registration failed'));
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: mockRegister
        },
        writable: true
      });

      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        expect(error.message).toBe('Registration failed');
      }

      consoleSpy.mockRestore();
    });
  });

  describe('Push Notifications', () => {
    it('should request notification permission', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue('granted');
      
      Object.defineProperty(Notification, 'requestPermission', {
        value: mockRequestPermission,
        writable: true
      });

      const permission = await Notification.requestPermission();
      
      expect(mockRequestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    it('should handle permission denial', async () => {
      const mockRequestPermission = jest.fn().mockResolvedValue('denied');
      
      Object.defineProperty(Notification, 'requestPermission', {
        value: mockRequestPermission,
        writable: true
      });

      const permission = await Notification.requestPermission();
      
      expect(permission).toBe('denied');
    });
  });

  describe('Offline Functionality', () => {
    it('should detect online/offline status', () => {
      // Mock online
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        writable: true
      });

      expect(navigator.onLine).toBe(true);

      // Mock offline
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      });

      expect(navigator.onLine).toBe(false);
    });

    it('should handle offline form submissions', async () => {
      const mockAddPendingAction = jest.fn();
      
      // Mock background sync service
      const backgroundSyncService = {
        addPendingAction: mockAddPendingAction
      };

      const formData = {
        url: '/api/submit',
        method: 'POST',
        body: JSON.stringify({ data: 'test' }),
        type: 'form-submission'
      };

      await backgroundSyncService.addPendingAction(formData);
      
      expect(mockAddPendingAction).toHaveBeenCalledWith(formData);
    });
  });
});

// E2E tests with Playwright
// tests/pwa.spec.ts
import { test, expect } from '@playwright/test';

test.describe('PWA Features', () => {
  test('should be installable', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for the beforeinstallprompt event
    const installPromptPromise = page.waitForEvent('console', msg => 
      msg.text().includes('beforeinstallprompt')
    );
    
    // Trigger install prompt
    await page.evaluate(() => {
      window.dispatchEvent(new Event('beforeinstallprompt'));
    });
    
    await installPromptPromise;
    
    // Check if install button appears
    const installButton = page.locator('button:has-text("Install")');
    await expect(installButton).toBeVisible();
  });

  test('should work offline', async ({ page, context }) => {
    await page.goto('/');
    
    // Wait for service worker to be registered
    await page.waitForFunction(() => 'serviceWorker' in navigator);
    
    // Go offline
    await context.setOffline(true);
    
    // Navigate to a cached page
    await page.goto('/dashboard');
    
    // Should still load from cache
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Check offline indicator
    await expect(page.locator('.offline-indicator')).toBeVisible();
  });

  test('should show update prompt', async ({ page }) => {
    await page.goto('/');
    
    // Mock service worker update
    await page.evaluate(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.dispatchEvent(new MessageEvent('message', {
          data: { type: 'UPDATE_AVAILABLE' }
        }));
      }
    });
    
    // Check if update prompt appears
    const updateButton = page.locator('button:has-text("Update Now")');
    await expect(updateButton).toBeVisible();
  });

  test('should handle push notifications', async ({ page, context }) => {
    // Grant notification permission
    await context.grantPermissions(['notifications']);
    
    await page.goto('/');
    
    // Enable push notifications
    await page.click('button:has-text("Enable Notifications")');
    
    // Verify subscription was created
    const subscriptionStatus = await page.evaluate(() => {
      return navigator.serviceWorker.ready.then(registration => {
        return registration.pushManager.getSubscription();
      });
    });
    
    expect(subscriptionStatus).toBeTruthy();
  });
});
```

## Expected Output

This template will produce:

- **Complete PWA Implementation**: Service worker, web app manifest, and native-like features
- **Offline Functionality**: Comprehensive caching strategies and background sync
- **Push Notifications**: User engagement with targeted messaging
- **App Installation**: Native app-like installation experience
- **Performance Optimization**: Core Web Vitals optimization and resource hints
- **Cross-Platform Compatibility**: Works across all modern browsers and devices
- **Testing Framework**: Unit, integration, and E2E tests for PWA features
- **Analytics Integration**: Performance monitoring and user behavior tracking

## Integration Points

- Connects with React web framework for component-based development
- Integrates with modern deployment patterns for PWA-optimized builds
- Works with performance modules for Core Web Vitals optimization
- Supports push notification services and analytics platforms
- Compatible with testing frameworks for comprehensive PWA validation

## Security Considerations

- HTTPS requirement for all PWA features and service worker functionality
- Secure push notification implementation with VAPID keys
- Content Security Policy (CSP) configuration for service workers
- Secure storage of sensitive data in IndexedDB with encryption
- Cross-origin resource sharing (CORS) configuration for API requests

## Performance Features

- Aggressive caching strategies for optimal loading performance
- Resource hints (preload, prefetch, preconnect) for critical resources
- Image lazy loading with intersection observer
- Code splitting and dynamic imports for reduced bundle size
- Performance monitoring with Core Web Vitals tracking

## Accessibility & Internationalization

- Screen reader compatibility for PWA installation prompts
- Keyboard navigation support for all PWA features
- High contrast mode support for offline indicators
- Internationalization support for notification messages
- ARIA labels and semantic HTML for PWA components

This template provides a comprehensive foundation for building Progressive Web Apps with native-like experiences, offline functionality, and modern web capabilities across all devices and platforms.
