## Purpose

Auto-scaling guidance and patterns for AI services based on metrics and forecasts.

## Implementation Patterns

### Pattern 1: Metric-Driven Scaling
Scale based on CPU, queue length, and latency metrics.

### Pattern 2: Forecast-Aware Scaling
Use demand forecasts to pre-scale before predicted peaks.

## Examples

```markdown
Example: Scale up additional inference servers when average latency exceeds 100ms for 5 minutes
```


## Deep Dive
Auto-scaling for AI workloads involves reacting not only to traditional metrics such as CPU and memory but also to model-specific indicators like request queue length, latency percentiles, and token consumption. Implement a feedback loop where observed metrics feed into a predictive model or simple moving average to decide when to scale. Horizontal scaling (adding more instances) is usually preferable for stateless inference services, while vertical scaling may apply to GPU-heavy workloads. Remember to account for warm-up time: new GPU instances can take several minutes to initialize, so predictive scaling using forecasts is often necessary.

## Examples

```yaml
# Kubernetes HPA with custom metrics
apiVersion: autoscaling/v2beta2
kind: HorizontalPodAutoscaler
metadata:
  name: llm-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: llm-service
  metrics:
  - type: Pods
    pods:
      metric:
        name: request_latency_ms
      target:
        type: AverageValue
        averageValue: "200"
```
