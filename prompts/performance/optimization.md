## Purpose

General performance optimization guidance used across modules and tech stacks.

## Implementation Patterns

### Pattern 1: Profile First
Identify hotspots before optimizing.

### Pattern 2: Measure After Change
Benchmark after each optimization to ensure gains.

## Examples

```markdown
Example: Profile database queries and add indexes to reduce latency
```


## Deep Dive
General optimization begins with profiling; only optimize hot paths. Use flame graphs to identify CPU bottlenecks. Replace slow algorithms with more efficient ones (e.g., use hashmap lookups instead of linear scans). Apply lazy evaluation and memoization judiciously. Always benchmark before and after to confirm improvements.

## Examples

```bash
# generate flamegraph
./profiler --output=flame.svg
```
