## Purpose

Practical guidance for improving inference latency, throughput, and cost when integrating LLMs and other models into production systems.

## Implementation Patterns

### Pattern 1: Batching & Async Processing
Group small requests into batches to amortize per-call overhead and use async processing to keep request latency bounded.

Key steps:
- Buffer incoming requests for up to X ms or until batch size N is reached.
- Send batched payloads to the model and demultiplex responses.
- Monitor tail latency and adjust batch size dynamically.

### Pattern 2: Caching & Response Deduplication
Cache deterministic or high-frequency responses. For non-deterministic outputs, cache parsed/validated structured results rather than raw text.

Key steps:
- Compute a cache key using prompt canonicalization and relevant parameters.
- Store structured outputs and use TTL or versioning to invalidate stale entries.

### Pattern 3: Model Selection & Fallbacks
Use smaller/cheaper models for low-criticality paths and fall back to larger models for complex tasks.

Key steps:
- Route quick classification/heuristic tasks to small models.
- For tasks needing higher fidelity, call the larger model.
- Implement caching and combine with streaming for progressive responses.

## Examples

1) Batching example (pseudo-code):

```python
batch = []
def handle(req):
	batch.append(req)
	if len(batch) >= BATCH_SIZE:
		resp = model.infer(batch)
		dispatch(resp)
```

2) Cache example (pseudo-code):

```python
key = canonicalize(prompt)
if cache.exists(key):
	return cache.get(key)
else:
	out = model.call(prompt)
	cache.set(key, out, ttl=3600)
	return out
```

