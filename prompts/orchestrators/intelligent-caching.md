# Intelligent Caching Orchestrator

## Purpose
Optimize specification generation through semantic caching, reusing similar specifications, and learning from past generations.

## Implementation Patterns

### Pattern 1: Cache with TTL (Time-To-Live)
Cache data with automatic expiration.

**Implementation**:
1. On first request, check cache
2. If cache hit and not expired, return cached value
3. If cache miss or expired, fetch from source
4. Store with timestamp
5. On future requests, compare current_time to timestamp
6. If (current_time - timestamp) < TTL, use cache
7. Else, refresh from source
8. Log cache hits and misses

### Pattern 2: Invalidation-Based Caching
Invalidate cache when underlying data changes.

**Implementation**:
1. Cache data after fetch: cache[key] = { value, version }
2. When data updated, increment version on server
3. On next client request, check server version vs cached version
4. If versions match, use cache
5. If version mismatch, fetch fresh data
6. Update cached version
7. Log invalidations

### Pattern 3: Predictive Cache Warming
Pre-load frequently accessed data into cache.

**Implementation**:
1. Track frequently accessed items (by frequency of use)
2. On app startup, pre-load top N items into cache
3. During idle time (no user activity), refresh cache
4. Predict next likely access based on history
5. Pre-load predicted items in background
6. Monitor cache hit rate
7. Adjust cache warming strategy if hit rate < threshold

## Core Caching Patterns

### 1. Semantic Specification Cache

```typescript
class SemanticSpecCache {
  private vectorStore: VectorStore;
  private similarityThreshold = 0.90;
  
  async get(request: SpecificationRequest): Promise<Specification | null> {
    // Generate embedding for request
    const embedding = await this.embed(request);
    
    // Search for similar specifications
    const similar = await this.vectorStore.search(embedding, 1);
    
    if (similar[0]?.score >= this.similarityThreshold) {
      // Adapt cached spec to current request
      return await this.adaptSpecification(similar[0].spec, request);
    }
    
    return null;
  }
  
  async set(request: SpecificationRequest, spec: Specification): Promise<void> {
    const embedding = await this.embed(request);
    await this.vectorStore.insert({
      embedding,
      request,
      spec,
      timestamp: Date.now(),
      usageCount: 0
    });
  }
  
  private async adaptSpecification(
    cached: Specification,
    request: SpecificationRequest
  ): Promise<Specification> {
    // Identify differences
    const diff = this.compareRequests(cached.request, request);
    
    // Apply minimal changes
    return await this.applyChanges(cached, diff);
  }
}
```

### 2. Pattern Library

```typescript
class SpecificationPatternLibrary {
  private patterns: Map<string, Pattern>;
  
  async findPattern(spec: Specification): Promise<Pattern | null> {
    // Extract structural pattern
    const structure = this.extractStructure(spec);
    
    // Find matching pattern
    for (const [id, pattern] of this.patterns) {
      if (this.matches(structure, pattern)) {
        return pattern;
      }
    }
    
    return null;
  }
  
  async learnPattern(spec: Specification): Promise<void> {
    // Extract reusable pattern
    const pattern = await this.extractPattern(spec);
    
    // Add to library if novel
    if (await this.isNovel(pattern)) {
      this.patterns.set(pattern.id, pattern);
    }
  }
}
```

### 3. Incremental Generation

```typescript
class IncrementalGenerator {
  async generateIncremental(
    base: Specification,
    changes: Change[]
  ): Promise<Specification> {
    // Only regenerate affected sections
    const affected = this.identifyAffectedSections(base, changes);
    
    // Regenerate affected sections
    const updated = { ...base };
    for (const section of affected) {
      updated[section] = await this.regenerateSection(base, section, changes);
    }
    
    return updated;
  }
}
```

## Best Practices

1. **Cache aggressively** to reduce generation time
2. **Use semantic similarity** for better cache hits
3. **Adapt cached specs** rather than regenerating
4. **Learn patterns** from successful generations
5. **Invalidate cache** when templates change

## Related Orchestrators

- `context-optimization-orchestrator.md`
- `template-composition-orchestrator.md`

## Examples

### Example 1: Cache with 1-Hour TTL
Request: Get product catalog
1. First call: Fetch from API, store in cache with timestamp
2. Within 1 hour: Return cached copy
3. After 1 hour: Refresh from API, update cache
4. Result: 99% cache hit rate, instant responses for popular products ✅

