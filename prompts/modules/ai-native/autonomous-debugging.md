# Autonomous Debugging and Self-Healing

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
Systems that automatically detect, diagnose, and fix bugs without human intervention, using AI-powered root cause analysis and automated remediation.

## Implementation Patterns

### Pattern 1: Exception-Triggered Self-Diagnosis
Automatically analyze and log exceptions as they occur, proposing fixes.

**Implementation**:
1. Wrap critical code with try-catch
2. On exception, capture stack trace and context
3. Feed to LLM: "Exception [type] in [function]. Context: [local vars]. Propose fix."
4. Log proposal to self-diagnostic log
5. Optionally apply fix if low-risk (logging changes)

### Pattern 2: Test Failure Root Cause Analysis
When tests fail, automatically diagnose root cause.

**Implementation**:
1. Test fails: capture assertion, expected, actual
2. Feed to LLM: "Test [name] failed. Expected [X], got [Y]. Local state: [vars]. Root cause?"
3. LLM proposes cause (logic error, data issue, timing)
4. Log proposal with confidence score
5. If human-confirmed, add to known issues database

### Pattern 3: Performance Regression Detection and Diagnosis
Monitor metrics and auto-diagnose when regressions occur.

**Implementation**:
1. Track metric baseline (response time, memory, throughput)
2. Detect regression (metric > baseline * threshold)
3. Capture relevant code state, execution context
4. Feed to LLM: "Performance regression: [metric] degraded [%]. Changed code: [diff]. Why?"
5. Log LLM hypothesis
6. Tag code change with diagnosed issue

## Core Patterns

### 1. Automated Root Cause Analysis

```typescript
class AutomatedDebugger {
  async diagnose(error: Error, context: ExecutionContext): Promise<Diagnosis> {
    // Collect diagnostic data
    const data = await this.collectDiagnostics(error, context);
    
    // Analyze with AI
    const analysis = await this.llm.analyze({
      error: error.message,
      stack: error.stack,
      logs: data.logs,
      metrics: data.metrics,
      recentChanges: data.recentChanges
    });
    
    // Identify root cause
    return {
      rootCause: analysis.rootCause,
      confidence: analysis.confidence,
      affectedComponents: analysis.components,
      suggestedFixes: analysis.fixes
    };
  }
}
```

### 2. Self-Healing Actions

```typescript
class SelfHealingSystem {
  async heal(diagnosis: Diagnosis): Promise<HealingResult> {
    // Try fixes in order of confidence
    for (const fix of diagnosis.suggestedFixes) {
      const result = await this.applyFix(fix);
      if (result.success) {
        await this.notifySuccess(diagnosis, fix);
        return result;
      }
    }
    
    // Escalate if all fixes failed
    await this.escalateToHuman(diagnosis);
    return { success: false, escalated: true };
  }
  
  private async applyFix(fix: Fix): Promise<FixResult> {
    // Test in sandbox first
    const sandboxResult = await this.testInSandbox(fix);
    if (!sandboxResult.success) return sandboxResult;
    
    // Apply to production with rollback
    return await this.applyWithRollback(fix);
  }
}
```

### 3. Anomaly Detection

```typescript
class AnomalyDetector {
  private model: AnomalyDetectionModel;
  
  async detectAnomalies(metrics: Metrics): Promise<Anomaly[]> {
    const predictions = await this.model.predict(metrics);
    
    return predictions
      .filter(p => p.anomalyScore > this.threshold)
      .map(p => ({
        metric: p.metric,
        value: p.value,
        expected: p.expected,
        severity: this.calculateSeverity(p),
        possibleCauses: this.inferCauses(p)
      }));
  }
}
```

## Best Practices

1. **Always test fixes in sandbox** before production
2. **Maintain rollback capability** for all changes
3. **Escalate high-risk issues** to humans
4. **Learn from failures** to improve future fixes
5. **Monitor healing success rate** and adjust thresholds

## Related Modules

- `ai-native/self-modifying-code.md`
- `monitoring/observability.md`
- `testing/chaos-engineering.md`

## Examples

### Example 1: Exception Detection and Diagnosis
Code throws RuntimeException in payment processing

System:
1. Catches exception: "NullPointerException in PaymentService.processPayment()"
2. Logs context: `{ user_id: 123, amount: 99.99, gateway: 'stripe', order_id: 456 }`
3. Feeds to LLM: "NullPointerException in PaymentService. Context: [above]. Root cause?"
4. LLM response: "gateway is null - missing fallback initialization"
5. Proposed fix: "Initialize gateway with default handler in constructor"
6. Self-diagnoses: Issue added to known issues, fix logged

### Example 2: Test Failure Root Cause
Unit test fails: `testPaymentRefund() - Expected: $100 refunded, Got: $80 refunded`

System:
1. Captures failure data
2. Feeds to LLM: "Test failed. Expected $100, got $80. Local state: [vars]. Root cause?"
3. LLM hypothesis: "Fee deduction not accounted for in test assertion"
4. System logs: "Test failure: fee calculation issue identified"
5. Human confirms via test update

