## Purpose

Guidance for deploying static assets and WASM modules to CDNs for fast delivery.

## Implementation Patterns

### Pattern 1: Versioned Asset URLs
Serve assets via versioned URLs to enable cache-busting.

### Pattern 2: Edge Caching
Use edge caches to reduce origin load and improve latency.

## Examples

```markdown
Example: Upload WASM build artifacts to CDN with hashed filenames and set long TTLs
```


## Deep Dive
Serving static assets and WASM modules via CDN drastically reduces latency for global users. Use cache-control headers with long max-age and immutable tokens when deploying versioned artifacts. When updating, use cache busting by embedding a hash of the file contents in the filename. For dynamic configuration, use a small JSON manifest with short TTL so clients can quickly discover new versions. Security-wise, sign your assets and enable HTTPS-only delivery.

## Examples

```bash
# upload and invalidate cache
aws s3 cp build/my-module.wasm s3://my-cdn-bucket/my-module.v123.wasm
aws cloudfront create-invalidation --distribution-id ABCD1234 --paths "/my-module.v123.wasm"
```
