# Intelligent Resource Optimization

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose
AI-driven patterns for optimizing resource allocation, performance tuning, and cost management through machine learning and predictive analytics.

## Implementation Patterns

### Pattern 1: Profiling-Guided Optimization
Profile code, identify bottlenecks, auto-optimize them.

**Implementation**:
1. Run profiler on workload (measure time, memory, IO)
2. Identify top 3 bottlenecks (functions/operations)
3. For each bottleneck, generate optimization prompt:
   "Function [name] is [%] of execution time. Current: [code]. Optimize for speed."
4. LLM generates optimized version
5. A/B test both versions
6. If optimized is faster (+ passes tests), merge it
7. Re-profile and repeat until gains < threshold

### Pattern 2: Metric-Driven Optimization
Optimize toward target metrics (latency, throughput, memory).

**Implementation**:
1. Define target metrics: latency < 100ms, throughput > 1000 ops/sec
2. Measure current metrics
3. If below target, identify gap
4. Generate optimization: "Reduce [metric] from [current] to [target]. Action?"
5. Apply suggested optimizations
6. Measure again
7. If gap remains, iterate

### Pattern 3: Resource Constraint Optimization
Optimize for constrained environments (mobile, edge).

**Implementation**:
1. Define constraints (memory < 50MB, CPU < 30%, battery impact < 5%)
2. Profile current resource usage
3. Identify violators
4. Generate optimization: "Using [resource] at [%]. Reduce to [target]. Options?"
5. Implement most feasible option
6. Re-profile and repeat

## Context
Modern applications face complex optimization challenges across compute, memory, network, and cost dimensions. AI can learn optimal configurations and adapt in real-time.

## Core Patterns

### 1. ML-Based Resource Allocation

```typescript
interface ResourceOptimizer {
  predictLoad(timeWindow: TimeWindow): Promise<LoadPrediction>;
  optimizeAllocation(prediction: LoadPrediction): AllocationPlan;
  applyAllocation(plan: AllocationPlan): Promise<void>;
  learnFromOutcome(plan: AllocationPlan, actual: Metrics): Promise<void>;
}

class IntelligentResourceAllocator implements ResourceOptimizer {
  private model: MLModel;
  private historicalData: TimeSeriesDB;
  
  async optimizeResources(): Promise<void> {
    // Predict next hour's load
    const prediction = await this.predictLoad({ hours: 1 });
    
    // Generate optimal allocation
    const plan = this.optimizeAllocation(prediction);
    
    // Apply with gradual rollout
    await this.applyGradually(plan);
    
    // Monitor and learn
    await this.monitorAndLearn(plan);
  }
  
  private optimizeAllocation(prediction: LoadPrediction): AllocationPlan {
    // Multi-objective optimization: cost, performance, reliability
    return this.solver.optimize({
      objectives: [
        { metric: 'cost', weight: 0.4, minimize: true },
        { metric: 'latency', weight: 0.4, minimize: true },
        { metric: 'availability', weight: 0.2, maximize: true }
      ],
      constraints: [
        { metric: 'latency', max: 100 }, // p95 < 100ms
        { metric: 'availability', min: 0.999 } // 99.9% uptime
      ],
      prediction
    });
  }
}
```

### 2. Adaptive Query Optimization

```typescript
class AdaptiveQueryOptimizer {
  private queryPatterns: Map<string, QueryPattern>;
  private performanceHistory: PerformanceDB;
  
  async optimizeQuery(query: Query): Promise<OptimizedQuery> {
    // Identify query pattern
    const pattern = this.identifyPattern(query);
    
    // Get historical performance
    const history = await this.performanceHistory.get(pattern);
    
    // Generate optimization candidates
    const candidates = await this.generateOptimizations(query, history);
    
    // Select best based on predicted performance
    return this.selectBest(candidates, history);
  }
  
  private async generateOptimizations(
    query: Query,
    history: PerformanceHistory
  ): Promise<OptimizedQuery[]> {
    const optimizations = [];
    
    // Index recommendations
    if (history.avgScanRows > 1000) {
      optimizations.push(await this.recommendIndexes(query));
    }
    
    // Query rewriting
    optimizations.push(await this.rewriteQuery(query));
    
    // Caching strategy
    if (history.cacheHitRate < 0.5) {
      optimizations.push(await this.optimizeCaching(query));
    }
    
    return optimizations;
  }
}
```

### 3. Intelligent Caching

```typescript
class IntelligentCache {
  private predictor: AccessPredictor;
  private evictionPolicy: MLEvictionPolicy;
  
  async get(key: string): Promise<any> {
    // Check cache
    const cached = await this.cache.get(key);
    if (cached) {
      await this.recordHit(key);
      return cached;
    }
    
    // Predict if this will be accessed again soon
    const prediction = await this.predictor.predictNextAccess(key);
    
    // Fetch and cache if likely to be reused
    const value = await this.fetchFromSource(key);
    if (prediction.probability > 0.7) {
      await this.cache.set(key, value, {
        ttl: prediction.optimalTTL,
        priority: prediction.priority
      });
    }
    
    return value;
  }
  
  private async evict(): Promise<void> {
    // ML-based eviction: predict future access patterns
    const items = await this.cache.getAllItems();
    const predictions = await Promise.all(
      items.map(item => this.predictor.predictFutureAccess(item.key))
    );
    
    // Evict items least likely to be accessed
    const toEvict = predictions
      .sort((a, b) => a.probability - b.probability)
      .slice(0, this.evictionCount)
      .map(p => p.key);
    
    await this.cache.delete(toEvict);
  }
}
```

### 4. Cost-Performance Optimizer

```typescript
class CostPerformanceOptimizer {
  async optimizeInfrastructure(): Promise<OptimizationPlan> {
    // Analyze current state
    const current = await this.analyzeCurrentState();
    
    // Generate alternatives
    const alternatives = await this.generateAlternatives(current);
    
    // Evaluate cost-performance tradeoffs
    const evaluated = await Promise.all(
      alternatives.map(alt => this.evaluate(alt, current))
    );
    
    // Select Pareto-optimal solution
    return this.selectParetoOptimal(evaluated);
  }
  
  private async evaluate(
    alternative: InfrastructureConfig,
    baseline: InfrastructureState
  ): Promise<Evaluation> {
    // Simulate performance
    const performance = await this.simulator.simulate(alternative);
    
    // Calculate cost
    const cost = this.costCalculator.calculate(alternative);
    
    // Calculate improvement
    return {
      alternative,
      performance,
      cost,
      costReduction: (baseline.cost - cost) / baseline.cost,
      performanceChange: (performance.latency - baseline.latency) / baseline.latency,
      score: this.calculateScore(cost, performance, baseline)
    };
  }
}
```

## Best Practices

1. **Start with observability** - collect metrics before optimizing
2. **Use A/B testing** to validate optimizations
3. **Implement gradual rollout** for infrastructure changes
4. **Monitor continuously** and adapt to changing patterns
5. **Balance multiple objectives** (cost, performance, reliability)
6. **Learn from outcomes** to improve future optimizations
7. **Set safety constraints** to prevent over-optimization
8. **Self-verify critical optimization decisions** against observed metrics before rolling them out

## Related Modules

- `ai-native/predictive-scaling.md` - Predictive auto-scaling
- `performance/optimization.md` - Traditional optimization
- `deployment/cost-optimization.md` - Cost management

## Examples

### Example 1: Performance Optimization
Baseline: API response time 500ms
Target: < 100ms

Optimization:
1. Profile: Identify slow query (customer lookup takes 400ms)
2. Generate optimization: "Replace N+1 query with join, add caching"
3. Implement: New code with batch query + Redis cache
4. Test: Response time now 80ms ✅
5. Verify: Tests pass, no regressions
6. Deploy: Optimization merged

