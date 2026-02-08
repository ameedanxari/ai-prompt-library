# Electron Desktop Application Development

## Purpose
Comprehensive patterns for building cross-platform desktop applications using Electron, covering setup, architecture, native integrations, security, performance optimization, and distribution.

## Overview

Electron enables building desktop applications using web technologies (HTML, CSS, JavaScript/TypeScript). It combines Chromium and Node.js, allowing developers to create cross-platform apps for Windows, macOS, and Linux from a single codebase.

**Best For**: Cross-platform desktop apps, developer tools, productivity software, enterprise applications

**Key Strengths**:
- Single codebase for all platforms
- Rich ecosystem of npm packages
- Native OS integration capabilities
- Automatic updates support
- Mature tooling and community

**Considerations**:
- Larger app size (~50-150MB)
- Higher memory usage than native apps
- Security requires careful configuration
- Performance optimization needed for complex UIs

## Technology Stack

### Core Technologies
```json
{
  "framework": "Electron 28+",
  "runtime": "Node.js 20+",
  "chromium": "Latest stable",
  "languages": ["TypeScript", "JavaScript"],
  "buildTool": "electron-builder or electron-forge",
  "bundler": "Webpack 5+ or Vite",
  "testing": "Spectron or Playwright",
  "packaging": "electron-builder",
  "updates": "electron-updater"
}
```

### Recommended Architecture
```
electron-app/
├── src/
│   ├── main/              # Main process (Node.js)
│   │   ├── index.ts       # Entry point
│   │   ├── window.ts      # Window management
│   │   ├── ipc/           # IPC handlers
│   │   ├── services/      # Background services
│   │   └── native/        # Native integrations
│   ├── renderer/          # Renderer process (Web)
│   │   ├── index.html
│   │   ├── App.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── utils/
│   ├── preload/           # Preload scripts
│   │   └── index.ts
│   └── shared/            # Shared code
│       ├── types/
│       ├── constants/
│       └── utils/
├── resources/             # App resources
│   ├── icons/
│   ├── installer/
│   └── assets/
├── electron-builder.yml   # Build configuration
├── package.json
└── tsconfig.json
```


## Core Patterns

### 1. Main Process Setup

```typescript
// src/main/index.ts
import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { setupAutoUpdater } from './updater';
import { setupIPC } from './ipc';
import { setupMenu } from './menu';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true
    },
    titleBarStyle: 'hidden',
    trafficLightPosition: { x: 15, y: 15 }
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // Window events
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();
  setupIPC();
  setupMenu();
  setupAutoUpdater();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

### 2. Secure IPC Communication

```typescript
// src/main/ipc/index.ts
import { ipcMain, dialog } from 'electron';
import { z } from 'zod';

// Type-safe IPC with validation
const FileOpenSchema = z.object({
  filters: z.array(z.object({
    name: z.string(),
    extensions: z.array(z.string())
  })).optional()
});

export function setupIPC() {
  // File operations
  ipcMain.handle('dialog:openFile', async (event, options) => {
    const validated = FileOpenSchema.parse(options);
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: validated.filters
    });
    return result.filePaths;
  });

  // Database operations
  ipcMain.handle('db:query', async (event, query, params) => {
    // Validate and sanitize
    // Execute query
    // Return results
  });

  // System operations
  ipcMain.handle('system:getInfo', async () => {
    return {
      platform: process.platform,
      arch: process.arch,
      version: app.getVersion()
    };
  });
}
```


### 3. Preload Script (Context Bridge)

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  openFile: (options?: { filters?: Array<{ name: string; extensions: string[] }> }) =>
    ipcRenderer.invoke('dialog:openFile', options),
  
  saveFile: (content: string, options?: any) =>
    ipcRenderer.invoke('dialog:saveFile', content, options),

  // Database operations
  dbQuery: (query: string, params?: any[]) =>
    ipcRenderer.invoke('db:query', query, params),

  // System operations
  getSystemInfo: () => ipcRenderer.invoke('system:getInfo'),

  // Event listeners
  onUpdateAvailable: (callback: (info: any) => void) => {
    ipcRenderer.on('update-available', (_, info) => callback(info));
  },

  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on('update-downloaded', () => callback());
  }
});

// Type definitions for renderer
declare global {
  interface Window {
    electronAPI: {
      openFile: (options?: any) => Promise<string[]>;
      saveFile: (content: string, options?: any) => Promise<string>;
      dbQuery: (query: string, params?: any[]) => Promise<any>;
      getSystemInfo: () => Promise<{ platform: string; arch: string; version: string }>;
      onUpdateAvailable: (callback: (info: any) => void) => void;
      onUpdateDownloaded: (callback: () => void) => void;
    };
  }
}
```

### 4. Renderer Process (React Example)

```typescript
// src/renderer/App.tsx
import React, { useState, useEffect } from 'react';

function App() {
  const [systemInfo, setSystemInfo] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    // Get system info
    window.electronAPI.getSystemInfo().then(setSystemInfo);

    // Listen for updates
    window.electronAPI.onUpdateAvailable((info) => {
      setUpdateAvailable(true);
      console.log('Update available:', info);
    });

    window.electronAPI.onUpdateDownloaded(() => {
      // Prompt user to restart
    });
  }, []);

  const handleOpenFile = async () => {
    const files = await window.electronAPI.openFile({
      filters: [
        { name: 'Text Files', extensions: ['txt', 'md'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });
    console.log('Selected files:', files);
  };

  return (
    <div className="app">
      <header>
        <h1>Electron App</h1>
        {updateAvailable && <div className="update-badge">Update Available</div>}
      </header>
      <main>
        <button onClick={handleOpenFile}>Open File</button>
        {systemInfo && (
          <div>
            <p>Platform: {systemInfo.platform}</p>
            <p>Version: {systemInfo.version}</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
```


## Native Integrations

### 1. System Tray

```typescript
// src/main/tray.ts
import { Tray, Menu, nativeImage, app } from 'electron';
import path from 'path';

let tray: Tray | null = null;

export function createTray(window: BrowserWindow) {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../../resources/tray-icon.png')
  );
  
  tray = new Tray(icon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: () => {
        window.show();
      }
    },
    {
      label: 'Preferences',
      click: () => {
        // Open preferences
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.quit();
      }
    }
  ]);

  tray.setToolTip('My Electron App');
  tray.setContextMenu(contextMenu);

  tray.on('click', () => {
    window.isVisible() ? window.hide() : window.show();
  });

  return tray;
}
```

### 2. Native Menus

```typescript
// src/main/menu.ts
import { Menu, shell, app } from 'electron';

export function setupMenu() {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'File',
      submenu: [
        {
          label: 'New',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // Handle new file
          }
        },
        {
          label: 'Open',
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            // Handle open
          }
        },
        { type: 'separator' },
        { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: async () => {
            await shell.openExternal('https://docs.example.com');
          }
        },
        {
          label: 'About',
          click: () => {
            // Show about dialog
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```

### 3. Notifications

```typescript
// src/main/notifications.ts
import { Notification } from 'electron';

export function showNotification(title: string, body: string, options?: {
  icon?: string;
  silent?: boolean;
  urgency?: 'normal' | 'critical' | 'low';
}) {
  if (!Notification.isSupported()) {
    console.warn('Notifications not supported');
    return;
  }

  const notification = new Notification({
    title,
    body,
    icon: options?.icon,
    silent: options?.silent,
    urgency: options?.urgency || 'normal'
  });

  notification.on('click', () => {
    // Handle notification click
  });

  notification.show();
}
```


## Security Best Practices

### 1. Security Configuration

```typescript
// src/main/security.ts
import { app, session } from 'electron';

export function setupSecurity() {
  // Content Security Policy
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'",
          "script-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "img-src 'self' data: https:",
          "font-src 'self' data:",
          "connect-src 'self' https://api.example.com"
        ].join('; ')
      }
    });
  });

  // Disable remote module
  app.on('web-contents-created', (event, contents) => {
    contents.on('will-navigate', (event, navigationUrl) => {
      const parsedUrl = new URL(navigationUrl);
      
      // Block navigation to external sites
      if (parsedUrl.origin !== 'http://localhost:3000' && 
          parsedUrl.origin !== 'file://') {
        event.preventDefault();
      }
    });

    // Prevent new window creation
    contents.setWindowOpenHandler(({ url }) => {
      // Open in external browser instead
      shell.openExternal(url);
      return { action: 'deny' };
    });
  });

  // Disable eval and related functions
  app.on('web-contents-created', (event, contents) => {
    contents.on('will-attach-webview', (event, webPreferences, params) => {
      // Strip away preload scripts
      delete webPreferences.preload;
      
      // Disable Node.js integration
      webPreferences.nodeIntegration = false;
      webPreferences.contextIsolation = true;
    });
  });
}
```

### 2. Secure Storage

```typescript
// src/main/storage.ts
import Store from 'electron-store';
import { safeStorage } from 'electron';

const store = new Store({
  encryptionKey: 'your-encryption-key',
  name: 'app-config'
});

export class SecureStorage {
  // Store encrypted data
  static setSecure(key: string, value: string): void {
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(value);
      store.set(key, encrypted.toString('base64'));
    } else {
      throw new Error('Encryption not available');
    }
  }

  // Retrieve encrypted data
  static getSecure(key: string): string | null {
    const encrypted = store.get(key) as string;
    if (!encrypted) return null;

    if (safeStorage.isEncryptionAvailable()) {
      const buffer = Buffer.from(encrypted, 'base64');
      return safeStorage.decryptString(buffer);
    }
    return null;
  }

  // Regular storage
  static set(key: string, value: any): void {
    store.set(key, value);
  }

  static get(key: string): any {
    return store.get(key);
  }

  static delete(key: string): void {
    store.delete(key);
  }

  static clear(): void {
    store.clear();
  }
}
```


## Auto-Updates

### 1. Update Configuration

```typescript
// src/main/updater.ts
import { autoUpdater } from 'electron-updater';
import { dialog } from 'electron';
import log from 'electron-log';

export function setupAutoUpdater() {
  // Configure logging
  autoUpdater.logger = log;
  autoUpdater.logger.transports.file.level = 'info';

  // Check for updates on startup
  autoUpdater.checkForUpdatesAndNotify();

  // Check every 4 hours
  setInterval(() => {
    autoUpdater.checkForUpdatesAndNotify();
  }, 4 * 60 * 60 * 1000);

  autoUpdater.on('update-available', (info) => {
    log.info('Update available:', info);
    // Notify renderer
    mainWindow?.webContents.send('update-available', info);
  });

  autoUpdater.on('update-downloaded', (info) => {
    log.info('Update downloaded:', info);
    
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: 'A new version has been downloaded. Restart to apply the update?',
      buttons: ['Restart', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  autoUpdater.on('error', (err) => {
    log.error('Update error:', err);
  });
}
```

### 2. Update Server Configuration

```yaml
# electron-builder.yml
appId: com.example.app
productName: MyApp
copyright: Copyright © 2024

directories:
  output: dist
  buildResources: resources

files:
  - src/**/*
  - package.json

publish:
  provider: github
  owner: your-username
  repo: your-repo
  private: false

mac:
  category: public.app-category.productivity
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: resources/entitlements.mac.plist
  entitlementsInherit: resources/entitlements.mac.plist
  target:
    - dmg
    - zip

win:
  target:
    - nsis
    - portable
  certificateFile: cert.pfx
  certificatePassword: ${CERT_PASSWORD}

linux:
  target:
    - AppImage
    - deb
  category: Utility
```

## Performance Optimization

### 1. Lazy Loading

```typescript
// src/renderer/utils/lazyLoad.ts
import { lazy, Suspense } from 'react';

export function lazyLoad<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ReactNode = <div>Loading...</div>
) {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

// Usage
const Settings = lazyLoad(() => import('./pages/Settings'));
const Dashboard = lazyLoad(() => import('./pages/Dashboard'));
```

### 2. Memory Management

```typescript
// src/main/memory.ts
import { app } from 'electron';

export function setupMemoryManagement() {
  // Monitor memory usage
  setInterval(() => {
    const memoryUsage = process.memoryUsage();
    
    if (memoryUsage.heapUsed > 500 * 1024 * 1024) { // 500MB
      console.warn('High memory usage detected');
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
    }
  }, 60000); // Check every minute

  // Clear cache periodically
  app.on('ready', () => {
    setInterval(() => {
      session.defaultSession.clearCache();
    }, 24 * 60 * 60 * 1000); // Once per day
  });
}
```

### 3. Process Optimization

```typescript
// src/main/worker.ts
import { BrowserWindow } from 'electron';
import path from 'path';

export class WorkerProcess {
  private worker: BrowserWindow | null = null;

  start() {
    this.worker = new BrowserWindow({
      show: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, '../preload/worker.js')
      }
    });

    this.worker.loadFile(path.join(__dirname, '../renderer/worker.html'));
  }

  send(channel: string, data: any) {
    this.worker?.webContents.send(channel, data);
  }

  stop() {
    this.worker?.close();
    this.worker = null;
  }
}
```


## Testing

### 1. Unit Tests

```typescript
// src/main/__tests__/window.test.ts
import { BrowserWindow } from 'electron';
import { createWindow } from '../window';

jest.mock('electron', () => ({
  BrowserWindow: jest.fn(),
  app: {
    getPath: jest.fn(() => '/mock/path')
  }
}));

describe('Window Management', () => {
  it('should create window with correct options', () => {
    createWindow();
    
    expect(BrowserWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        width: 1200,
        height: 800,
        webPreferences: expect.objectContaining({
          contextIsolation: true,
          nodeIntegration: false
        })
      })
    );
  });
});
```

### 2. E2E Tests with Playwright

```typescript
// tests/e2e/app.spec.ts
import { test, expect, _electron as electron } from '@playwright/test';
import { ElectronApplication, Page } from 'playwright';

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: ['./dist/main/index.js']
  });
  page = await electronApp.firstWindow();
});

test.afterAll(async () => {
  await electronApp.close();
});

test('should launch app', async () => {
  const title = await page.title();
  expect(title).toBe('My Electron App');
});

test('should open file dialog', async () => {
  await page.click('button:has-text("Open File")');
  // Test file dialog interaction
});

test('should handle IPC communication', async () => {
  const result = await page.evaluate(async () => {
    return await window.electronAPI.getSystemInfo();
  });
  
  expect(result).toHaveProperty('platform');
  expect(result).toHaveProperty('version');
});
```

## Build & Distribution

### 1. Build Configuration

```json
// package.json
{
  "name": "my-electron-app",
  "version": "1.0.0",
  "main": "dist/main/index.js",
  "scripts": {
    "dev": "concurrently \"npm run dev:renderer\" \"npm run dev:main\"",
    "dev:renderer": "vite",
    "dev:main": "tsc -p tsconfig.main.json && electron .",
    "build": "npm run build:renderer && npm run build:main",
    "build:renderer": "vite build",
    "build:main": "tsc -p tsconfig.main.json",
    "package": "electron-builder",
    "package:mac": "electron-builder --mac",
    "package:win": "electron-builder --win",
    "package:linux": "electron-builder --linux",
    "test": "jest",
    "test:e2e": "playwright test"
  },
  "dependencies": {
    "electron-store": "^8.1.0",
    "electron-updater": "^6.1.7"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "electron": "^28.0.0",
    "electron-builder": "^24.9.1",
    "typescript": "^5.3.0",
    "vite": "^5.0.0"
  }
}
```

### 2. Code Signing

```bash
# macOS
export CSC_LINK=/path/to/certificate.p12
export CSC_KEY_PASSWORD=your_password
npm run package:mac

# Windows
export CSC_LINK=/path/to/certificate.pfx
export CSC_KEY_PASSWORD=your_password
npm run package:win
```

### 3. CI/CD Pipeline

```yaml
# .github/workflows/build.yml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [macos-latest, windows-latest, ubuntu-latest]

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Package
        run: npm run package
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          CSC_LINK: ${{ secrets.CSC_LINK }}
          CSC_KEY_PASSWORD: ${{ secrets.CSC_KEY_PASSWORD }}
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: ${{ matrix.os }}-build
          path: dist/*.{dmg,exe,AppImage,deb}
```

## Best Practices

### 1. Architecture
- Separate main and renderer processes clearly
- Use IPC for all communication between processes
- Keep business logic in main process
- Use preload scripts for secure API exposure

### 2. Security
- Always enable contextIsolation
- Never enable nodeIntegration in renderer
- Use Content Security Policy
- Validate all IPC messages
- Encrypt sensitive data
- Keep Electron updated

### 3. Performance
- Lazy load components and modules
- Use web workers for heavy computations
- Optimize bundle size
- Implement proper caching
- Monitor memory usage

### 4. User Experience
- Implement proper error handling
- Show loading states
- Handle offline scenarios
- Provide keyboard shortcuts
- Support system themes

## Common Patterns

### 1. Deep Linking

```typescript
// src/main/deeplink.ts
import { app } from 'electron';

export function setupDeepLinking() {
  if (process.defaultApp) {
    if (process.argv.length >= 2) {
      app.setAsDefaultProtocolClient('myapp', process.execPath, [
        path.resolve(process.argv[1])
      ]);
    }
  } else {
    app.setAsDefaultProtocolClient('myapp');
  }

  app.on('open-url', (event, url) => {
    event.preventDefault();
    // Handle myapp:// URLs
    console.log('Deep link:', url);
  });
}
```

### 2. Global Shortcuts

```typescript
// src/main/shortcuts.ts
import { globalShortcut } from 'electron';

export function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+K', () => {
    // Toggle window visibility
  });

  globalShortcut.register('CommandOrControl+Shift+I', () => {
    // Open DevTools
  });
}

export function unregisterShortcuts() {
  globalShortcut.unregisterAll();
}
```

### 3. Custom Protocols

```typescript
// src/main/protocol.ts
import { protocol } from 'electron';
import path from 'path';
import fs from 'fs';

export function registerProtocols() {
  protocol.registerFileProtocol('app', (request, callback) => {
    const url = request.url.substr(6);
    callback({ path: path.normalize(`${__dirname}/${url}`) });
  });
}
```

## Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [Electron Security Checklist](https://www.electronjs.org/docs/tutorial/security)
- [electron-builder](https://www.electron.build/)
- [Electron Forge](https://www.electronforge.io/)
- [Awesome Electron](https://github.com/sindresorhus/awesome-electron)

## Related Templates

- `tauri-desktop.md` - Lighter alternative to Electron
- `web-react.md` - React patterns for renderer process
- `progressive-web-apps.md` - PWA as alternative to desktop
- `deployment/desktop-distribution.md` - Desktop app distribution
