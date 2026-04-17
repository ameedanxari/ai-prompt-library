# Predictive Scaling

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
Use machine learning to predict load patterns and scale infrastructure proactively, reducing latency spikes and optimizing costs.

## Implementation Patterns

### Pattern 1: Workload Forecasting and Pre-Scaling
Predict demand and scale proactively.

**Implementation**:
1. Collect historical metrics (load, throughput, user count) over time
2. Fit time-series model (ARIMA, Prophet, or simple LLM analysis)
3. Forecast next N hours / N days
4. If forecast shows peak, trigger scale up
5. Prepare resources before peak (avoid reactive scaling)
6. Monitor actual load vs forecast
7. Adjust model if predictions drift

### Pattern 2: Auto-Scaling Based on Metrics and Forecast
Combine current metrics with forecast for scaling decisions.

**Implementation**:
1. Monitor current metric (CPU, latency, queue length)
2. If current > threshold, scale up immediately
3. In parallel, check forecast
4. If forecast shows sustained high load, keep scaled up longer
5. If forecast shows drop, gradually scale down
6. Track scaling events and outcomes
7. Tune thresholds based on outcomes

### Pattern 3: Cost-Aware Scaling
Scale efficiently while managing cloud costs.

**Implementation**:
1. Define cost per resource unit
2. When scaling decision made, consider cost impact
3. Prefer cheaper resource types (spot instances, off-peak)
4. Set cost cap (abort scale if cost exceeds budget)
5. For same capacity, choose cheaper option
6. Schedule workload for cheaper time windows if possible
7. Log cost per scaling event

## Core Pattern

```typescript
class PredictiveScaler {
  private model: TimeSeriesModel;
  
  async scale(): Promise<void> {
    // Predict load for next 15 minutes
    const prediction = await this.model.predict({ minutes: 15 });
    
    // Calculate required capacity
    const required = this.calculateCapacity(prediction);
    
    // Scale proactively
    if (required > this.currentCapacity * 0.8) {
      await this.scaleUp(required);
    } else if (required < this.currentCapacity * 0.4) {
      await this.scaleDown(required);
    }
  }
  
  private calculateCapacity(prediction: LoadPrediction): number {
    // Add buffer for uncertainty
    const buffer = prediction.stdDev * 2;
    return Math.ceil((prediction.mean + buffer) / this.instanceCapacity);
  }
}
```

## Best Practices

1. **Train on historical patterns** including seasonality
2. **Scale up early**, scale down conservatively
3. **Monitor prediction accuracy** and retrain regularly
4. **Set minimum/maximum bounds** for safety
5. **Use confidence intervals** for buffer calculation

## Related Modules

- `ai-native/intelligent-optimization.md`
- `deployment/auto-scaling.md`

## Examples

### Example 1: Forecasting and Pre-Scaling
Historical data: Load increases 2x during 6-9 PM

Forecast (Prophet model):
- Today 5 PM: 1000 users
- Today 7 PM (predicted): 2000 users (high confidence)
- Scaling decision: 6 PM → scale from 5 nodes to 10 nodes
- Actual 7 PM: 2100 users handled smoothly ✅

Post-scaling: Metrics monitored, auto-down at 11 PM when predicted load drops

