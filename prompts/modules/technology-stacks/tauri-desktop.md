# Tauri Desktop Application Development

## Purpose
Comprehensive patterns for building lightweight, secure cross-platform desktop applications using Tauri, covering setup, architecture, native integrations, security, performance, and distribution.

## Implementation Patterns

### Pattern 1: Tauri IPC Command Pattern
Implement Rust backend commands callable from frontend.

**Implementation**:
1. Define Tauri command in Rust: `#[tauri::command]`
2. Implement function: receive frontend args, return result
3. Handle errors gracefully
4. Register command in main.rs: `tauri::Builder::new().invoke_handler()`
5. Call from frontend: `await invoke('command_name', { args })`
6. Handle frontend response (success or error)
7. Update UI based on result

### Pattern 2: File System Access with Permissions
Access file system safely with Tauri's permission system.

**Implementation**:
1. Define required paths in tauri.conf.json (allowlist.fs)
2. Only grant minimal required permissions (read vs write)
3. Validate user selections before accessing (file picker)
4. Use Tauri fs commands: read_text_file, write_text_file
5. Handle permission errors gracefully
6. Log file operations for audit
7. Validate file content before processing

### Pattern 3: Rust-Frontend Communication Patterns
Maintain consistent messaging between Rust and JavaScript.

**Implementation**:
1. Define message types/schemas (TypeScript interfaces + Rust structs)
2. Use serde for serialization consistency
3. Implement request-response pairs (command + result)
4. Use events for notifications (Rust → Frontend, async)
5. Validate all inputs before processing
6. Provide clear error messages with error codes
7. Log all cross-boundary communications for debugging

## Overview

Tauri is a modern framework for building desktop applications using web technologies for the frontend and Rust for the backend. It produces smaller, faster, and more secure applications compared to Electron.

**Best For**: Security-focused apps, lightweight desktop tools, system utilities, performance-critical applications

**Key Strengths**:
- Tiny bundle size (~3-10MB vs Electron's 50-150MB)
- Lower memory footprint
- Built-in security features
- Native system webview (no bundled browser)
- Rust backend for performance
- Strong type safety

**Considerations**:
- Smaller ecosystem than Electron
- Rust learning curve for backend
- Platform-specific webview differences
- Newer framework (less mature)

## Technology Stack

### Core Technologies
```json
{
  "framework": "Tauri 2.0+",
  "backend": "Rust 1.70+",
  "frontend": "Any (React, Vue, Svelte, etc.)",
  "webview": "Platform native (WebKit, WebView2, WebKitGTK)",
  "buildTool": "tauri-cli",
  "bundler": "Vite or Webpack",
  "testing": "Rust tests + WebDriver",
  "packaging": "tauri-cli",
  "updates": "tauri-plugin-updater"
}
```

### Recommended Architecture
```
tauri-app/
├── src/                   # Frontend (Web)
│   ├── App.tsx
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── src-tauri/             # Backend (Rust)
│   ├── src/
│   │   ├── main.rs        # Entry point
│   │   ├── commands.rs    # Tauri commands
│   │   ├── state.rs       # App state
│   │   ├── menu.rs        # Native menus
│   │   └── tray.rs        # System tray
│   ├── icons/
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
└── vite.config.ts
```


## Core Patterns

### 1. Rust Backend Setup

```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

mod commands;
mod state;
mod menu;

fn main() {
    // Create system tray
    let tray_menu = SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("show".to_string(), "Show"))
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"));
    
    let system_tray = SystemTray::new().with_menu(tray_menu);

    tauri::Builder::default()
        .setup(|app| {
            // Initialize app state
            let state = state::AppState::new();
            app.manage(state);
            
            Ok(())
        })
        .system_tray(system_tray)
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::LeftClick { .. } => {
                let window = app.get_window("main").unwrap();
                window.show().unwrap();
                window.set_focus().unwrap();
            }
            SystemTrayEvent::MenuItemClick { id, .. } => {
                match id.as_str() {
                    "quit" => std::process::exit(0),
                    "show" => {
                        let window = app.get_window("main").unwrap();
                        window.show().unwrap();
                    }
                    _ => {}
                }
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::greet,
            commands::read_file,
            commands::write_file,
            commands::get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 2. Tauri Commands (Backend API)

```rust
// src-tauri/src/commands.rs
use tauri::State;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemInfo {
    platform: String,
    arch: String,
    version: String,
}

#[tauri::command]
pub fn greet(name: &str) -> String {
    format!("Hello, {}!", name)
}

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn write_file(path: String, contents: String) -> Result<(), String> {
    fs::write(path, contents)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_system_info() -> SystemInfo {
    SystemInfo {
        platform: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

// Command with state
#[tauri::command]
pub fn get_app_state(state: State<'_, crate::state::AppState>) -> String {
    state.get_data()
}

#[tauri::command]
pub fn set_app_state(state: State<'_, crate::state::AppState>, data: String) {
    state.set_data(data);
}
```

### 3. App State Management

```rust
// src-tauri/src/state.rs
use std::sync::Mutex;

pub struct AppState {
    data: Mutex<String>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            data: Mutex::new(String::new()),
        }
    }

    pub fn get_data(&self) -> String {
        self.data.lock().unwrap().clone()
    }

    pub fn set_data(&self, data: String) {
        *self.data.lock().unwrap() = data;
    }
}
```

### 4. Frontend Integration (React/TypeScript)

```typescript
// src/App.tsx
import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';
import { open, save } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';

interface SystemInfo {
  platform: string;
  arch: string;
  version: string;
}

function App() {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [content, setContent] = useState('');

  useEffect(() => {
    // Get system info on mount
    invoke<SystemInfo>('get_system_info').then(setSystemInfo);
  }, []);

  const handleOpenFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{
        name: 'Text',
        extensions: ['txt', 'md']
      }]
    });

    if (selected && typeof selected === 'string') {
      const contents = await readTextFile(selected);
      setContent(contents);
    }
  };

  const handleSaveFile = async () => {
    const path = await save({
      filters: [{
        name: 'Text',
        extensions: ['txt']
      }]
    });

    if (path) {
      await writeTextFile(path, content);
    }
  };

  const handleGreet = async () => {
    const greeting = await invoke<string>('greet', { name: 'World' });
    console.log(greeting);
  };

  return (
    <div className="app">
      <header>
        <h1>Tauri App</h1>
        {systemInfo && (
          <div>
            <p>Platform: {systemInfo.platform}</p>
            <p>Version: {systemInfo.version}</p>
          </div>
        )}
      </header>
      <main>
        <button onClick={handleOpenFile}>Open File</button>
        <button onClick={handleSaveFile}>Save File</button>
        <button onClick={handleGreet}>Greet</button>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={10}
          cols={50}
        />
      </main>
    </div>
  );
}

export default App;
```

### 5. File System Operations

```rust
// src-tauri/src/commands.rs - Extended file operations
use tauri::api::path::{app_data_dir, app_config_dir};
use std::path::Path;

#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<String>, String> {
    let entries = fs::read_dir(path)
        .map_err(|e| e.to_string())?;
    
    let files: Vec<String> = entries
        .filter_map(|entry| {
            entry.ok().and_then(|e| {
                e.path().to_str().map(String::from)
            })
        })
        .collect();
    
    Ok(files)
}

#[tauri::command]
pub async fn create_directory(path: String) -> Result<(), String> {
    fs::create_dir_all(path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    fs::remove_file(path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_app_data_dir(app: tauri::AppHandle) -> Result<String, String> {
    app_data_dir(&app.config())
        .ok_or("Failed to get app data dir".to_string())
        .and_then(|path| {
            path.to_str()
                .ok_or("Invalid path".to_string())
                .map(String::from)
        })
}
```

## Advanced Patterns

### 6. Plugin System

```rust
// src-tauri/Cargo.toml
[dependencies]
tauri-plugin-store = "2.0"
tauri-plugin-window-state = "2.0"
tauri-plugin-notification = "2.0"
tauri-plugin-updater = "2.0"
tauri-plugin-shell = "2.0"

// src-tauri/src/main.rs
use tauri_plugin_store::StoreBuilder;
use tauri_plugin_window_state::WindowExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_window_state::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Initialize store
            let store = StoreBuilder::new(app.handle(), "settings.json".parse()?).build();
            app.manage(store);
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```typescript
// Frontend plugin usage
import { Store } from 'tauri-plugin-store-api';
import { sendNotification } from '@tauri-apps/api/notification';
import { Command } from 'tauri-plugin-shell-api';

// Persistent storage
const store = new Store('settings.json');
await store.set('theme', 'dark');
const theme = await store.get('theme');

// Notifications
sendNotification({
  title: 'Update Available',
  body: 'A new version is ready to install'
});

// Shell commands
const command = Command.create('echo', ['Hello World']);
const output = await command.execute();
```

### 7. Native Menus and System Tray

```rust
// src-tauri/src/menu.rs
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu};

pub fn create_menu() -> Menu {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let preferences = CustomMenuItem::new("preferences".to_string(), "Preferences");
    
    let file_menu = Submenu::new(
        "File",
        Menu::new()
            .add_item(preferences)
            .add_native_item(MenuItem::Separator)
            .add_item(close)
            .add_item(quit)
    );
    
    let edit_menu = Submenu::new(
        "Edit",
        Menu::new()
            .add_native_item(MenuItem::Undo)
            .add_native_item(MenuItem::Redo)
            .add_native_item(MenuItem::Separator)
            .add_native_item(MenuItem::Cut)
            .add_native_item(MenuItem::Copy)
            .add_native_item(MenuItem::Paste)
            .add_native_item(MenuItem::SelectAll)
    );
    
    Menu::new()
        .add_submenu(file_menu)
        .add_submenu(edit_menu)
}

// src-tauri/src/tray.rs
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem};

pub fn create_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "Show Window");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Window");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    SystemTray::new().with_menu(tray_menu)
}

// src-tauri/src/main.rs - Menu handling
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .menu(menu::create_menu())
        .on_menu_event(|event| {
            match event.menu_item_id() {
                "quit" => {
                    std::process::exit(0);
                }
                "close" => {
                    event.window().close().unwrap();
                }
                "preferences" => {
                    // Open preferences window
                    let window = event.window();
                    tauri::WindowBuilder::new(
                        window,
                        "preferences",
                        tauri::WindowUrl::App("preferences.html".into())
                    )
                    .title("Preferences")
                    .build()
                    .unwrap();
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 8. Auto-Updates

```rust
// src-tauri/Cargo.toml
[dependencies]
tauri-plugin-updater = "2.0"

// src-tauri/src/main.rs
use tauri_plugin_updater::UpdaterExt;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .setup(|app| {
            // Check for updates on startup
            let handle = app.handle();
            tauri::async_runtime::spawn(async move {
                if let Ok(update) = handle.updater().check().await {
                    if update.is_update_available() {
                        println!("Update available: {}", update.latest_version());
                        
                        // Download and install
                        update.download_and_install().await.ok();
                    }
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

```typescript
// Frontend update checking
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

async function checkForUpdates() {
  const update = await check();
  
  if (update?.available) {
    console.log(`Update to ${update.version} available!`);
    
    // Download and install
    await update.downloadAndInstall();
    
    // Restart app
    await relaunch();
  }
}
```

### 9. Security Configuration

```json
// src-tauri/tauri.conf.json
{
  "tauri": {
    "security": {
      "csp": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;",
      "dangerousDisableAssetCspModification": false,
      "freezePrototype": true,
      "dangerousRemoteDomainIpcAccess": []
    },
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "createDir": true,
        "removeFile": true,
        "scope": ["$APPDATA/*", "$RESOURCE/*"]
      },
      "dialog": {
        "all": false,
        "open": true,
        "save": true
      },
      "shell": {
        "all": false,
        "execute": true,
        "scope": [
          {
            "name": "allowed-command",
            "cmd": "echo",
            "args": true
          }
        ]
      },
      "http": {
        "all": false,
        "request": true,
        "scope": ["https://api.example.com/*"]
      }
    }
  }
}
```

## Testing Strategies

### 10. Rust Backend Tests

```rust
// src-tauri/src/commands.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_greet() {
        let result = greet("Test");
        assert_eq!(result, "Hello, Test!");
    }

    #[tokio::test]
    async fn test_read_file() {
        // Create temp file
        let temp_path = "/tmp/test.txt";
        std::fs::write(temp_path, "test content").unwrap();
        
        let result = read_file(temp_path.to_string()).await;
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "test content");
        
        // Cleanup
        std::fs::remove_file(temp_path).unwrap();
    }

    #[test]
    fn test_system_info() {
        let info = get_system_info();
        assert!(!info.platform.is_empty());
        assert!(!info.arch.is_empty());
    }
}
```

### 11. Integration Tests with WebDriver

```typescript
// tests/integration.spec.ts
import { test, expect } from '@playwright/test';
import { _electron as electron } from 'playwright';

test.describe('Tauri App', () => {
  let electronApp: any;

  test.beforeAll(async () => {
    electronApp = await electron.launch({
      args: ['dist/tauri-app']
    });
  });

  test.afterAll(async () => {
    await electronApp.close();
  });

  test('should launch app', async () => {
    const window = await electronApp.firstWindow();
    expect(await window.title()).toBe('Tauri App');
  });

  test('should invoke backend command', async () => {
    const window = await electronApp.firstWindow();
    
    const result = await window.evaluate(async () => {
      const { invoke } = window as any;
      return await invoke('greet', { name: 'Test' });
    });
    
    expect(result).toBe('Hello, Test!');
  });
});
```

## Build and Distribution

### 12. Build Configuration

```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "package": {
    "productName": "MyApp",
    "version": "1.0.0"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["dmg", "msi", "deb", "appimage"],
      "identifier": "com.example.myapp",
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "resources": ["resources/*"],
      "externalBin": [],
      "copyright": "Copyright © 2026",
      "category": "Utility",
      "shortDescription": "My Tauri App",
      "longDescription": "A secure, lightweight desktop application",
      "macOS": {
        "frameworks": [],
        "minimumSystemVersion": "10.13",
        "exceptionDomain": "",
        "signingIdentity": null,
        "entitlements": null
      },
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      },
      "linux": {
        "deb": {
          "depends": []
        }
      }
    }
  }
}
```

### 13. Code Signing

```bash
# macOS Code Signing
# 1. Get Developer ID certificate from Apple
# 2. Configure in tauri.conf.json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "signingIdentity": "Developer ID Application: Your Name (TEAM_ID)"
      }
    }
  }
}

# Build and sign
npm run tauri build

# Windows Code Signing
# 1. Get code signing certificate
# 2. Configure in tauri.conf.json
{
  "tauri": {
    "bundle": {
      "windows": {
        "certificateThumbprint": "YOUR_CERT_THUMBPRINT",
        "digestAlgorithm": "sha256",
        "timestampUrl": "http://timestamp.digicert.com"
      }
    }
  }
}

# Sign with signtool
signtool sign /f certificate.pfx /p password /tr http://timestamp.digicert.com /td sha256 /fd sha256 MyApp.exe
```

### 14. CI/CD Pipeline

```yaml
# .github/workflows/build.yml
name: Build Tauri App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    strategy:
      matrix:
        platform: [macos-latest, ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.platform }}
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Setup Rust
        uses: actions-rs/toolchain@v1
        with:
          toolchain: stable
      
      - name: Install dependencies (Ubuntu)
        if: matrix.platform == 'ubuntu-latest'
        run: |
          sudo apt-get update
          sudo apt-get install -y libgtk-3-dev libwebkit2gtk-4.0-dev libappindicator3-dev librsvg2-dev patchelf
      
      - name: Install frontend dependencies
        run: npm install
      
      - name: Build app
        run: npm run tauri build
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v3
        with:
          name: tauri-app-${{ matrix.platform }}
          path: src-tauri/target/release/bundle/
```

## Performance Optimization

### 15. Bundle Size Optimization

```toml
# src-tauri/Cargo.toml
[profile.release]
opt-level = "z"     # Optimize for size
lto = true          # Enable Link Time Optimization
codegen-units = 1   # Better optimization
panic = "abort"     # Smaller binary
strip = true        # Strip symbols
```

```typescript
// vite.config.ts - Frontend optimization
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    }
  }
});
```

### 16. Memory Management

```rust
// Efficient state management
use std::sync::Arc;
use parking_lot::RwLock;

pub struct AppState {
    data: Arc<RwLock<HashMap<String, String>>>,
}

impl AppState {
    pub fn new() -> Self {
        Self {
            data: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn get(&self, key: &str) -> Option<String> {
        self.data.read().get(key).cloned()
    }

    pub fn set(&self, key: String, value: String) {
        self.data.write().insert(key, value);
    }
}
```

## Best Practices

1. **Security First**: Always configure CSP and allowlist properly
2. **Type Safety**: Use TypeScript frontend and Rust backend for full type safety
3. **Error Handling**: Handle all errors gracefully in both frontend and backend
4. **State Management**: Use Tauri's state management for shared state
5. **Plugin System**: Leverage official plugins for common functionality
6. **Testing**: Write tests for both Rust commands and frontend
7. **Performance**: Optimize bundle size and memory usage
8. **Updates**: Implement auto-updates for seamless user experience
9. **Code Signing**: Sign your app for all platforms
10. **Documentation**: Document all Tauri commands and their usage

## Common Patterns

### Window Management
```typescript
import { appWindow } from '@tauri-apps/api/window';

// Minimize, maximize, close
await appWindow.minimize();
await appWindow.maximize();
await appWindow.close();

// Create new window
import { WebviewWindow } from '@tauri-apps/api/window';
const webview = new WebviewWindow('settings', {
  url: 'settings.html'
});
```

### Keyboard Shortcuts
```rust
use tauri::GlobalShortcutManager;

app.global_shortcut_manager()
    .register("Cmd+Q", || {
        std::process::exit(0);
    })
    .unwrap();
```

### Deep Linking
```json
// tauri.conf.json
{
  "tauri": {
    "bundle": {
      "macOS": {
        "exceptionDomain": "myapp://"
      }
    }
  }
}
```

## Related Modules

- [technology-stacks/electron-desktop.md](./electron-desktop.md) - Alternative desktop framework
- [desktop/desktop-security.md](../../desktop/desktop-security.md) - Desktop security patterns
- [deployment/desktop-distribution.md](../../deployment/desktop-distribution.md) - Distribution strategies
- [testing/desktop-testing.md](../../testing/desktop-testing.md) - Desktop testing approaches

## Examples

See `examples/tauri-desktop/` for complete implementations:
- File manager application
- System monitor tool
- Note-taking app with encryption
- Multi-window application
