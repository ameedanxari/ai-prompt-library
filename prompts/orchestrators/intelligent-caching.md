# Intelligent Caching Orchestrator

## Purpose
Optimize specification generation through semantic caching, reusing similar specifications, and learning from past generations.

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
