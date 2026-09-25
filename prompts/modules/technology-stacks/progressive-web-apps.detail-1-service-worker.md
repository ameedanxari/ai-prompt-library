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

