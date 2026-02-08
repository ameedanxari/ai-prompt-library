# Tauri Desktop Application Development

## Purpose
Comprehensive patterns for building lightweight, secure cross-platform desktop applications using Tauri, covering setup, architecture, native integrations, security, performance, and distribution.

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
