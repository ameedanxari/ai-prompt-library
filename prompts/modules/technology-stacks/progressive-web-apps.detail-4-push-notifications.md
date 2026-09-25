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

