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

