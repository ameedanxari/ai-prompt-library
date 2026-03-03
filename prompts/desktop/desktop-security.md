## Purpose

Security patterns for desktop applications: sandboxing, permissions, and secure IPC.

## Implementation Patterns

### Pattern 1: Principle of Least Privilege
Only grant necessary permissions to features.

### Pattern 2: Secure IPC
Use validated, typed messages across process boundaries.

## Examples

```markdown
Example: Use contextBridge to expose minimal API surface to renderer process
```


## Deep Dive
Desktop security hinges on sandboxing, secure IPC, and minimizing the attack surface. Always enable context isolation and disable Node integration in renderer processes. Validate all messages crossing process boundaries, ideally using a typed schema or command list. Encrypt sensitive data at rest and in transit, and store secrets in OS-provided keystores. For auto-update mechanisms, sign updates and verify signatures before applying.

## Examples

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('api', {
  saveFile: (data) => ipcRenderer.invoke('save-file', data)
});
```
