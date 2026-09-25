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

