## Purpose

Caching strategies to improve performance: TTL, invalidation, and warm-up.

## Implementation Patterns

### Pattern 1: TTL-based Cache
Expire cached items after configured TTL.

### Pattern 2: Invalidation on Update
Invalidate cache entries when underlying data changes.

## Examples

```markdown
Example: Cache product catalog for 1 hour with background refresh
```


## Deep Dive
Effective caching balances freshness and performance. Use TTLs appropriate to data volatility and implement background refresh to avoid thundering-herd problems. For distributed systems, consider a cache-aside pattern with Redis or Memcached. When caching LLM outputs, normalize prompts to canonical form to increase hit rates and avoid storing copyrighted/generated text indefinitely.

## Examples

```python
cache.set(key, value, ex=3600)  # expire after one hour
```
