## Purpose

Performance optimization patterns for desktop applications, focusing on startup time, memory, and responsiveness.

## Implementation Patterns

### Pattern 1: Lazy Loading
Load heavy modules on demand to reduce startup time.

### Pattern 2: Resource Budgeting
Limit memory and CPU usage for background tasks.

## Examples

```markdown
Example: Lazy-load large image processing module only when user enters edit mode
```


## Deep Dive
Desktop apps benefit from lazy loading heavy modules and caching computations. Use web workers or background threads for CPU-intensive tasks. Measure startup time and reduce bundle size with code splitting. Profile memory usage and periodically purge caches to prevent leaks. On macOS, pay attention to App Nap and energy impact to maintain responsiveness.

## Examples

```javascript
if (navigator.userAgent.includes('Mac')) {
  import('./heavy-module').then(module => module.init());
}
```
