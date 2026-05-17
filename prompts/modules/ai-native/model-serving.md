# Efficient AI Model Serving

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
Patterns for deploying and serving AI models at scale with low latency, high throughput, and cost efficiency.

## Scope Guard

Use this module for server-side, remote, or shared model-serving
infrastructure. Do not use it for privacy-first on-device features where
the brief says local-only, no network, device AI/ML, phone media, or
user content must never leave the device. For those cases, use the
on-device iOS and Android ML modules instead, and keep model assets
bundled or otherwise explicitly approved by the product requirements.

## Implementation Patterns

### Pattern 1: Model Registry and Loading
Manage model versions and load correct model for tasks.

**Implementation**:
1. Define model registry (name, version, path, requirements)
2. When task requested, look up required model
3. Check if model cached locally
4. If not cached, download from remote
5. Load model from cache
6. Validate hash matches registry
7. Initialize model for inference

### Pattern 2: Inference with Monitoring
Serve model with performance tracking.

**Implementation**:
1. Receive inference request
2. Record start time
3. Preprocess input (validation, formatting)
4. Run model.predict(input)
5. Postprocess output
6. Record latency, success/failure
7. Update running metrics
8. Return result
9. Log slow requests (> threshold)

### Pattern 3: Model Versioning and Rollback
Support multiple model versions with easy rollback.

**Implementation**:
1. Each model version tagged with version ID
2. Route requests to specific version (or latest)
3. Track version performance (accuracy, latency)
4. If new version degrades metrics, flag
5. Support explicit rollback: switch inference to prior version
6. Log all version switches
7. Auto-rollback if error rate > threshold

## Core Patterns

### 1. Model Serving Infrastructure

```typescript
class ModelServer {
  private models: Map<string, LoadedModel>;
  private batchQueue: BatchQueue;
  
  async predict(request: PredictionRequest): Promise<Prediction> {
    // Add to batch queue for efficiency
    return this.batchQueue.add(request);
  }
  
  private async processBatch(batch: PredictionRequest[]): Promise<Prediction[]> {
    // Batch inference for better GPU utilization
    const model = this.models.get(batch[0].modelId);
    return await model.predictBatch(batch);
  }
}
```

### 2. Model Optimization

```typescript
class ModelOptimizer {
  async optimize(model: Model): Promise<OptimizedModel> {
    // Quantization for smaller size
    const quantized = await this.quantize(model, { bits: 8 });
    
    // Pruning for faster inference
    const pruned = await this.prune(quantized, { threshold: 0.01 });
    
    // Compile for target hardware
    return await this.compile(pruned, { target: 'gpu' });
  }
}
```

### 3. Adaptive Model Selection

```typescript
class AdaptiveModelSelector {
  selectModel(request: PredictionRequest): string {
    // Use smaller model for simple requests
    if (request.complexity < 0.3) {
      return 'small-fast-model';
    }
    
    // Use larger model for complex requests
    return 'large-accurate-model';
  }
}
```

## Best Practices

1. **Use batching** for GPU efficiency
2. **Quantize models** to reduce size and latency
3. **Cache predictions** for common inputs
4. **Monitor latency** and adjust batch sizes
5. **Use model versioning** for safe updates

## Related Modules

- `ai-native/llm-integration.md`
- `performance/optimization.md`
- `deployment/containerization.md`

## Examples

### Example 1: Model Loading and Inference
Model: NLP sentiment classifier (v2.1)

Serving Flow:
1. Registry lookup: Sentiment model v2.1 → `/models/sentiment-v2.1/model.tflite`
2. Load from cache or download
3. Initialize TensorFlow interpreter
4. Inference: `classify("Great product!")` → { sentiment: "positive", confidence: 0.95 }
5. Log: 12ms latency
6. Return result to client
