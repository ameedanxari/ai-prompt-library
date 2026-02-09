# Desktop Native Integrations

## Purpose
Patterns for integrating with native OS features including system APIs, notifications, file associations, protocol handlers, and platform-specific capabilities.

## Core Integration Patterns

### 1. System Notifications

```typescript
// Cross-platform notifications
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/api/notification';

class NotificationManager {
  async initialize(): Promise<void> {
    let permissionGranted = await isPermissionGranted();
    
    if (!permissionGranted) {
      const permission = await requestPermission();
      permissionGranted = permission === 'granted';
    }
  }
  
  async send(title: string, body: string, options?: NotificationOptions): Promise<void> {
    await sendNotification({
      title,
      body,
      icon: options?.icon,
      sound: options?.sound
    });
  }
  
  async sendWithAction(title: string, body: string, actionId: string): Promise<void> {
    // Platform-specific action handling
    await sendNotification({
      title,
      body,
      // Actions handled via event listeners
    });
  }
}
```

```rust
// Rust backend notifications
use notify_rust::Notification;

#[tauri::command]
pub fn send_native_notification(title: String, body: String) -> Result<(), String> {
    Notification::new()
        .summary(&title)
        .body(&body)
        .show()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}
```

### 2. File Associations

```json
// tauri.conf.json - Register file types
{
  "tauri": {
    "bundle": {
      "macOS": {
        "associatedDomains": ["*.myapp"],
        "fileAssociations": [
          {
            "ext": ["myapp"],
            "name": "MyApp Document",
            "role": "Editor"
          }
        ]
      },
      "windows": {
        "fileAssociations": [
          {
            "ext": "myapp",
            "description": "MyApp Document",
            "mimeType": "application/x-myapp"
          }
        ]
      }
    }
  }
}
```

```rust
// Handle file open events
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Handle file open on macOS
            #[cfg(target_os = "macos")]
            app.listen_global("tauri://file-drop", |event| {
                if let Some(paths) = event.payload() {
                    println!("Files dropped: {:?}", paths);
                }
            });
            
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 3. Protocol Handlers (Deep Linking)

```json
// Register custom protocol
{
  "tauri": {
    "bundle": {
      "identifier": "com.example.myapp",
      "macOS": {
        "exceptionDomain": "myapp://"
      }
    }
  }
}
```

```rust
// Handle protocol URLs
use tauri::Manager;

#[tauri::command]
fn handle_protocol_url(url: String) -> Result<(), String> {
    // Parse myapp://action/param
    let parts: Vec<&str> = url.split("://").collect();
    if parts.len() == 2 {
        let action = parts[1];
        // Handle action
        println!("Protocol action: {}", action);
    }
    Ok(())
}
```

### 4. System Tray Integration

```rust
use tauri::{CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayEvent};
use tauri::Manager;

pub fn create_system_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let settings = CustomMenuItem::new("settings".to_string(), "Settings");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(hide)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(settings)
        .add_native_item(tauri::SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    SystemTray::new().with_menu(tray_menu)
}

pub fn handle_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            let window = app.get_window("main").unwrap();
            window.show().unwrap();
            window.set_focus().unwrap();
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "show" => {
                    let window = app.get_window("main").unwrap();
                    window.show().unwrap();
                }
                "hide" => {
                    let window = app.get_window("main").unwrap();
                    window.hide().unwrap();
                }
                "settings" => {
                    // Open settings window
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}
```

### 5. Clipboard Integration

```typescript
import { writeText, readText } from '@tauri-apps/api/clipboard';

class ClipboardManager {
  async copy(text: string): Promise<void> {
    await writeText(text);
  }
  
  async paste(): Promise<string> {
    return await readText() || '';
  }
  
  async copyImage(base64: string): Promise<void> {
    // Platform-specific image clipboard
    await invoke('copy_image_to_clipboard', { base64 });
  }
}
```

```rust
// Rust clipboard with images
use clipboard::{ClipboardProvider, ClipboardContext};

#[tauri::command]
fn copy_image_to_clipboard(base64: String) -> Result<(), String> {
    // Decode base64 and copy to clipboard
    let image_data = base64::decode(base64)
        .map_err(|e| e.to_string())?;
    
    // Platform-specific clipboard handling
    #[cfg(target_os = "macos")]
    {
        // macOS clipboard implementation
    }
    
    #[cfg(target_os = "windows")]
    {
        // Windows clipboard implementation
    }
    
    Ok(())
}
```

### 6. Global Keyboard Shortcuts

```rust
use tauri::GlobalShortcutManager;

fn register_shortcuts(app: &tauri::App) -> Result<(), Box<dyn std::error::Error>> {
    let mut shortcut_manager = app.global_shortcut_manager();
    
    // Register Cmd/Ctrl+Shift+Space
    shortcut_manager.register("CmdOrCtrl+Shift+Space", || {
        println!("Global shortcut triggered!");
    })?;
    
    // Register F12 for dev tools
    shortcut_manager.register("F12", || {
        // Toggle dev tools
    })?;
    
    Ok(())
}
```

### 7. Native Dialogs

```typescript
import { open, save, message, ask, confirm } from '@tauri-apps/api/dialog';

class DialogManager {
  async openFile(filters?: FileFilter[]): Promise<string | null> {
    const selected = await open({
      multiple: false,
      filters: filters || [{
        name: 'All Files',
        extensions: ['*']
      }]
    });
    
    return typeof selected === 'string' ? selected : null;
  }
  
  async openMultipleFiles(): Promise<string[]> {
    const selected = await open({ multiple: true });
    return Array.isArray(selected) ? selected : [];
  }
  
  async saveFile(defaultPath?: string): Promise<string | null> {
    return await save({
      defaultPath,
      filters: [{
        name: 'Text Files',
        extensions: ['txt']
      }]
    });
  }
  
  async showMessage(title: string, message: string): Promise<void> {
    await message(message, { title, type: 'info' });
  }
  
  async confirm(title: string, message: string): Promise<boolean> {
    return await confirm(message, { title, type: 'warning' });
  }
}
```

### 8. Power Management

```rust
use battery::Manager;

#[tauri::command]
fn get_battery_status() -> Result<BatteryInfo, String> {
    let manager = Manager::new()
        .map_err(|e| e.to_string())?;
    
    let battery = manager.batteries()
        .map_err(|e| e.to_string())?
        .next()
        .ok_or("No battery found")?
        .map_err(|e| e.to_string())?;
    
    Ok(BatteryInfo {
        percentage: battery.state_of_charge().value * 100.0,
        is_charging: matches!(battery.state(), battery::State::Charging),
        time_to_full: battery.time_to_full().map(|d| d.as_secs()),
        time_to_empty: battery.time_to_empty().map(|d| d.as_secs()),
    })
}

#[tauri::command]
fn prevent_sleep() -> Result<(), String> {
    // Platform-specific sleep prevention
    #[cfg(target_os = "macos")]
    {
        // Use IOKit to prevent sleep
    }
    
    #[cfg(target_os = "windows")]
    {
        // Use SetThreadExecutionState
    }
    
    Ok(())
}
```

### 9. System Information

```rust
use sysinfo::{System, SystemExt, ProcessorExt, DiskExt};

#[tauri::command]
fn get_system_info() -> SystemInfo {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    SystemInfo {
        os: System::name().unwrap_or_default(),
        os_version: System::os_version().unwrap_or_default(),
        kernel_version: System::kernel_version().unwrap_or_default(),
        hostname: System::host_name().unwrap_or_default(),
        cpu_count: sys.processors().len(),
        total_memory: sys.total_memory(),
        used_memory: sys.used_memory(),
        total_swap: sys.total_swap(),
        used_swap: sys.used_swap(),
        disks: sys.disks().iter().map(|disk| DiskInfo {
            name: disk.name().to_string_lossy().to_string(),
            mount_point: disk.mount_point().to_string_lossy().to_string(),
            total_space: disk.total_space(),
            available_space: disk.available_space(),
        }).collect(),
    }
}
```

### 10. Window Management

```typescript
import { appWindow, LogicalSize, PhysicalPosition } from '@tauri-apps/api/window';

class WindowManager {
  async setSize(width: number, height: number): Promise<void> {
    await appWindow.setSize(new LogicalSize(width, height));
  }
  
  async setPosition(x: number, y: number): Promise<void> {
    await appWindow.setPosition(new PhysicalPosition(x, y));
  }
  
  async center(): Promise<void> {
    await appWindow.center();
  }
  
  async setAlwaysOnTop(alwaysOnTop: boolean): Promise<void> {
    await appWindow.setAlwaysOnTop(alwaysOnTop);
  }
  
  async setFullscreen(fullscreen: boolean): Promise<void> {
    await appWindow.setFullscreen(fullscreen);
  }
  
  async setDecorations(decorations: boolean): Promise<void> {
    await appWindow.setDecorations(decorations);
  }
}
```

## Best Practices

1. **Request permissions** before using native features
2. **Handle platform differences** gracefully
3. **Provide fallbacks** for unsupported features
4. **Test on all platforms** thoroughly
5. **Use native UI** when appropriate
6. **Respect system settings** (dark mode, accessibility)
7. **Handle errors** from native APIs
8. **Document platform requirements**

## Related Modules

- `desktop/offline-first.md` - Offline capabilities
- `desktop/performance-optimization.md` - Performance patterns
- `security/desktop-security.md` - Security considerations
