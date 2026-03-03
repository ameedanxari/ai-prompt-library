## Purpose

Guidance for packaging and distributing desktop applications across platforms.

## Implementation Patterns

### Pattern 1: Platform-Specific Packaging
Use native packaging tools per OS (DMG for macOS, MSI for Windows).

### Pattern 2: Signed Releases
Sign binaries for trust and update integrity.

## Examples

```markdown
Example: Build macOS DMG and sign with Developer ID for distribution
```


## Deep Dive
Distributing desktop apps requires handling multiple packaging formats and signing workflows. Automate builds using CI pipelines that target each OS; use tools like `electron-builder`, `tauri-bundler`, or `msi-packager`. Maintain a release manifest specifying supported platforms, versions, and checksums. Provide both channel releases (stable, beta) and integrate with auto-update libraries. Ensure you sign binaries with appropriate certificates to avoid warnings on installation.

## Examples

```json
{
  "name": "MyApp",
  "version": "1.0.0",
  "build": {
    "mac": { "category": "public.app-category.productivity" },
    "win": { "target": "nsis" }
  }
}
```
