# Data Pipelines Template

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

This template provides comprehensive patterns for implementing data pipeline systems including pipeline monitoring, performance metrics, alerting, and error handling. It covers pipeline orchestration, observability, troubleshooting, and operational management for building reliable and maintainable data workflows.

## Context

Data pipelines are the backbone of modern data platforms, moving and transforming data across systems. This template addresses the challenges of monitoring pipeline health, tracking performance metrics, handling failures gracefully, and providing visibility into pipeline operations. It enables teams to build pipelines that are observable, debuggable, and operationally excellent.

## Core Components

### Pipeline Monitoring Service

## Examples

```typescript
interface PipelineMonitoringService {
  // Pipeline tracking
  registerPipeline(pipeline: PipelineDefinition): Promise<string>;
  startPipelineRun(pipelineId: string, params?: Record<string, unknown>): Promise<string>;
  getPipelineStatus(runId: string): Promise<PipelineRunStatus>;
  
  // Metrics collection
  collectMetrics(runId: string): Promise<PipelineMetrics>;
  getHistoricalMetrics(pipelineId: string, timeRange: TimeRange): Promise<MetricsTimeSeries>;
  
  // Health monitoring
  getPipelineHealth(pipelineId: string): Promise<PipelineHealth>;
  getSystemHealth(): Promise<SystemHealth>;
}


interface PipelineDefinition {
  id: string;
  name: string;
  description?: string;
  stages: PipelineStage[];
  schedule?: PipelineSchedule;
  slaConfig?: SLAConfig;
  alertConfig?: AlertConfig;
  retryPolicy?: RetryPolicy;
  metadata?: Record<string, unknown>;
}

interface PipelineStage {
  id: string;
  name: string;
  type: StageType;
  config: StageConfig;
  dependencies?: string[];
  timeout?: number;
  retries?: number;
  checkpoints?: boolean;
}

enum StageType {
  EXTRACT = 'extract',
  TRANSFORM = 'transform',
  LOAD = 'load',
  VALIDATE = 'validate',
  AGGREGATE = 'aggregate',
  CUSTOM = 'custom'
}

interface PipelineRunStatus {
  runId: string;
  pipelineId: string;
  state: PipelineState;
  startTime: Date;
  endTime?: Date;
  currentStage?: string;
  stageStatuses: StageStatus[];
  metrics: PipelineMetrics;
  errors?: PipelineError[];
}

enum PipelineState {
  PENDING = 'pending',
  RUNNING = 'running',
  PAUSED = 'paused',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  RETRYING = 'retrying'
}

interface PipelineMetrics {
  recordsRead: number;
  recordsWritten: number;
  recordsFailed: number;
  bytesProcessed: number;
  duration: number;
  stageMetrics: Map<string, StageMetrics>;
  resourceUsage: ResourceUsage;
}

interface StageMetrics {
  stageId: string;
  recordsIn: number;
  recordsOut: number;
  duration: number;
  startTime: Date;
  endTime?: Date;
  customMetrics?: Record<string, number>;
}
```

### Alerting Service

```typescript
interface PipelineAlertingService {
  // Alert configuration
  createAlertRule(rule: AlertRule): Promise<string>;
  updateAlertRule(ruleId: string, rule: Partial<AlertRule>): Promise<void>;
  deleteAlertRule(ruleId: string): Promise<void>;
  
  // Alert management
  getActiveAlerts(filters?: AlertFilters): Promise<Alert[]>;
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
  resolveAlert(alertId: string, resolution: string): Promise<void>;
  
  // Notification channels
  configureChannel(channel: NotificationChannel): Promise<string>;
  testChannel(channelId: string): Promise<boolean>;
}

interface AlertRule {
  id: string;
  name: string;
  description?: string;
  pipelineId?: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  channels: string[];
  cooldownPeriod?: number;
  enabled: boolean;
}

interface AlertCondition {
  type: ConditionType;
  metric?: string;
  threshold?: number;
  operator?: ComparisonOperator;
  duration?: number;
  expression?: string;
}

enum ConditionType {
  THRESHOLD = 'threshold',
  ANOMALY = 'anomaly',
  MISSING_DATA = 'missing_data',
  SLA_BREACH = 'sla_breach',
  ERROR_RATE = 'error_rate',
  CUSTOM = 'custom'
}

enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

interface Alert {
  id: string;
  ruleId: string;
  pipelineId?: string;
  runId?: string;
  severity: AlertSeverity;
  message: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  context: Record<string, unknown>;
}

interface NotificationChannel {
  id: string;
  type: ChannelType;
  name: string;
  config: ChannelConfig;
  enabled: boolean;
}

enum ChannelType {
  EMAIL = 'email',
  SLACK = 'slack',
  PAGERDUTY = 'pagerduty',
  WEBHOOK = 'webhook',
  SMS = 'sms',
  TEAMS = 'teams'
}
```

### Error Handling Service

```typescript
interface PipelineErrorHandlingService {
  // Error tracking
  logError(error: PipelineError): Promise<string>;
  getErrors(runId: string): Promise<PipelineError[]>;
  getErrorStats(pipelineId: string, timeRange: TimeRange): Promise<ErrorStats>;
  
  // Recovery operations
  retryStage(runId: string, stageId: string): Promise<void>;
  retryFromCheckpoint(runId: string, checkpointId: string): Promise<string>;
  skipStage(runId: string, stageId: string): Promise<void>;
  
  // Dead letter queue
  getDeadLetterRecords(pipelineId: string): Promise<DeadLetterRecord[]>;
  reprocessDeadLetter(recordId: string): Promise<void>;
  purgeDeadLetter(pipelineId: string, olderThan: Date): Promise<number>;
}

interface PipelineError {
  id: string;
  runId: string;
  stageId?: string;
  type: ErrorType;
  message: string;
  stackTrace?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
  recoverable: boolean;
  retryCount: number;
}

enum ErrorType {
  DATA_VALIDATION = 'data_validation',
  TRANSFORMATION = 'transformation',
  CONNECTION = 'connection',
  TIMEOUT = 'timeout',
  RESOURCE = 'resource',
  PERMISSION = 'permission',
  SCHEMA_MISMATCH = 'schema_mismatch',
  DEPENDENCY = 'dependency',
  UNKNOWN = 'unknown'
}

interface ErrorStats {
  totalErrors: number;
  errorsByType: Map<ErrorType, number>;
  errorsByStage: Map<string, number>;
  errorRate: number;
  mttr: number; // Mean time to recovery
  topErrors: ErrorSummary[];
}

interface DeadLetterRecord {
  id: string;
  pipelineId: string;
  runId: string;
  stageId: string;
  data: unknown;
  error: string;
  failedAt: Date;
  retryCount: number;
  lastRetryAt?: Date;
}
```


### SLA Management Service

```typescript
interface SLAManagementService {
  // SLA configuration
  defineSLA(sla: SLADefinition): Promise<string>;
  updateSLA(slaId: string, sla: Partial<SLADefinition>): Promise<void>;
  
  // SLA monitoring
  checkSLACompliance(pipelineId: string): Promise<SLAComplianceResult>;
  getSLAHistory(pipelineId: string, timeRange: TimeRange): Promise<SLAHistory>;
  
  // SLA reporting
  generateSLAReport(config: SLAReportConfig): Promise<SLAReport>;
}

interface SLADefinition {
  id: string;
  name: string;
  pipelineId: string;
  targets: SLATarget[];
  evaluationWindow: TimeWindow;
  alertOnBreach: boolean;
  alertChannels?: string[];
}

interface SLATarget {
  metric: SLAMetric;
  threshold: number;
  operator: ComparisonOperator;
  percentile?: number;
}

enum SLAMetric {
  COMPLETION_TIME = 'completion_time',
  SUCCESS_RATE = 'success_rate',
  DATA_FRESHNESS = 'data_freshness',
  THROUGHPUT = 'throughput',
  ERROR_RATE = 'error_rate',
  AVAILABILITY = 'availability'
}

interface SLAComplianceResult {
  pipelineId: string;
  slaId: string;
  compliant: boolean;
  targetResults: TargetResult[];
  evaluatedAt: Date;
  evaluationPeriod: TimeWindow;
}

interface TargetResult {
  metric: SLAMetric;
  target: number;
  actual: number;
  compliant: boolean;
  trend: 'improving' | 'stable' | 'degrading';
}
```

## Implementation Patterns

### Pipeline Orchestrator

```typescript
class PipelineOrchestrator {
  private monitoringService: PipelineMonitoringService;
  private alertingService: PipelineAlertingService;
  private errorHandler: PipelineErrorHandlingService;

  async executePipeline(
    pipeline: PipelineDefinition,
    params?: Record<string, unknown>
  ): Promise<PipelineRunResult> {
    const runId = await this.monitoringService.startPipelineRun(pipeline.id, params);
    const context = this.createExecutionContext(pipeline, runId, params);

    try {
      // Execute stages in dependency order
      const executionPlan = this.buildExecutionPlan(pipeline.stages);

      for (const stageBatch of executionPlan) {
        await this.executeStagesBatch(stageBatch, context);
      }

      await this.completePipelineRun(runId, 'success');
      return { runId, status: 'success' };

    } catch (error) {
      await this.handlePipelineFailure(runId, error, context);
      return { runId, status: 'failed', error };
    }
  }

  private async executeStagesBatch(
    stages: PipelineStage[],
    context: ExecutionContext
  ): Promise<void> {
    const results = await Promise.allSettled(
      stages.map(stage => this.executeStage(stage, context))
    );

    // Check for failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      const errors = failures.map(f => (f as PromiseRejectedResult).reason);
      throw new StageExecutionError(errors);
    }
  }

  private async executeStage(
    stage: PipelineStage,
    context: ExecutionContext
  ): Promise<StageResult> {
    const startTime = Date.now();
    const stageContext = { ...context, stageId: stage.id };

    try {
      await this.updateStageStatus(context.runId, stage.id, 'running');

      // Create checkpoint if enabled
      if (stage.checkpoints) {
        await this.createCheckpoint(context.runId, stage.id);
      }

      // Execute stage logic
      const executor = this.getStageExecutor(stage.type);
      const result = await this.executeWithTimeout(
        () => executor.execute(stage, stageContext),
        stage.timeout || 3600000
      );

      // Collect metrics
      const metrics: StageMetrics = {
        stageId: stage.id,
        recordsIn: result.recordsIn,
        recordsOut: result.recordsOut,
        duration: Date.now() - startTime,
        startTime: new Date(startTime),
        endTime: new Date()
      };

      await this.updateStageStatus(context.runId, stage.id, 'success', metrics);
      return result;

    } catch (error) {
      return this.handleStageError(stage, error, stageContext);
    }
  }

  private async handleStageError(
    stage: PipelineStage,
    error: Error,
    context: ExecutionContext
  ): Promise<StageResult> {
    const pipelineError = this.classifyError(error, stage);
    await this.errorHandler.logError(pipelineError);

    // Check if we should retry
    if (stage.retries && context.retryCount < stage.retries && pipelineError.recoverable) {
      context.retryCount++;
      await this.delay(this.calculateBackoff(context.retryCount));
      return this.executeStage(stage, context);
    }

    // Send to dead letter queue if configured
    if (context.failedRecords?.length > 0) {
      for (const record of context.failedRecords) {
        await this.errorHandler.sendToDeadLetter(record, pipelineError);
      }
    }

    await this.updateStageStatus(context.runId, stage.id, 'failed', { error: pipelineError });
    throw error;
  }
}
```


### Metrics Collector

```typescript
class PipelineMetricsCollector {
  private metricsStore: MetricsStore;
  private prometheusClient: PrometheusClient;

  async collectAndPublishMetrics(runId: string, metrics: PipelineMetrics): Promise<void> {
    // Store metrics
    await this.metricsStore.save(runId, metrics);

    // Publish to Prometheus
    await this.publishToPrometheus(runId, metrics);

    // Check for anomalies
    await this.checkForAnomalies(runId, metrics);
  }

  private async publishToPrometheus(runId: string, metrics: PipelineMetrics): Promise<void> {
    const labels = { run_id: runId, pipeline_id: metrics.pipelineId };

    await this.prometheusClient.gauge('pipeline_records_processed', metrics.recordsWritten, labels);
    await this.prometheusClient.gauge('pipeline_records_failed', metrics.recordsFailed, labels);
    await this.prometheusClient.gauge('pipeline_bytes_processed', metrics.bytesProcessed, labels);
    await this.prometheusClient.histogram('pipeline_duration_seconds', metrics.duration / 1000, labels);

    // Stage-level metrics
    for (const [stageId, stageMetrics] of metrics.stageMetrics) {
      const stageLabels = { ...labels, stage_id: stageId };
      await this.prometheusClient.gauge('stage_records_in', stageMetrics.recordsIn, stageLabels);
      await this.prometheusClient.gauge('stage_records_out', stageMetrics.recordsOut, stageLabels);
      await this.prometheusClient.histogram('stage_duration_seconds', stageMetrics.duration / 1000, stageLabels);
    }

    // Resource usage
    await this.prometheusClient.gauge('pipeline_cpu_usage', metrics.resourceUsage.cpuPercent, labels);
    await this.prometheusClient.gauge('pipeline_memory_usage', metrics.resourceUsage.memoryBytes, labels);
  }

  async getMetricsTrend(
    pipelineId: string,
    metric: string,
    timeRange: TimeRange
  ): Promise<MetricsTrend> {
    const dataPoints = await this.metricsStore.query(pipelineId, metric, timeRange);
    
    return {
      metric,
      dataPoints,
      trend: this.calculateTrend(dataPoints),
      average: this.calculateAverage(dataPoints),
      percentiles: this.calculatePercentiles(dataPoints, [50, 90, 95, 99])
    };
  }
}
```

### Alert Manager

```typescript
class PipelineAlertManager {
  private alertingService: PipelineAlertingService;
  private notificationService: NotificationService;

  async evaluateAlerts(runId: string, metrics: PipelineMetrics): Promise<void> {
    const rules = await this.alertingService.getActiveRules(metrics.pipelineId);

    for (const rule of rules) {
      const shouldAlert = await this.evaluateRule(rule, metrics);
      
      if (shouldAlert) {
        await this.triggerAlert(rule, runId, metrics);
      }
    }
  }

  private async evaluateRule(rule: AlertRule, metrics: PipelineMetrics): Promise<boolean> {
    switch (rule.condition.type) {
      case ConditionType.THRESHOLD:
        return this.evaluateThreshold(rule.condition, metrics);
      case ConditionType.ERROR_RATE:
        return this.evaluateErrorRate(rule.condition, metrics);
      case ConditionType.SLA_BREACH:
        return this.evaluateSLABreach(rule.condition, metrics);
      case ConditionType.ANOMALY:
        return this.evaluateAnomaly(rule.condition, metrics);
      default:
        return false;
    }
  }

  private async triggerAlert(
    rule: AlertRule,
    runId: string,
    metrics: PipelineMetrics
  ): Promise<void> {
    const alert: Alert = {
      id: this.generateAlertId(),
      ruleId: rule.id,
      pipelineId: metrics.pipelineId,
      runId,
      severity: rule.severity,
      message: this.formatAlertMessage(rule, metrics),
      triggeredAt: new Date(),
      context: { metrics, rule }
    };

    await this.alertingService.createAlert(alert);

    // Send notifications
    for (const channelId of rule.channels) {
      await this.notificationService.send(channelId, alert);
    }
  }
}
```

## Integration Points

### Prometheus/Grafana Integration

```typescript
// Prometheus metrics integration
class PrometheusMetricsExporter {
  private registry: Registry;

  constructor() {
    this.registry = new Registry();
    this.initializeMetrics();
  }

  private initializeMetrics(): void {
    // Pipeline metrics
    new Gauge({
      name: 'pipeline_runs_total',
      help: 'Total number of pipeline runs',
      labelNames: ['pipeline_id', 'status'],
      registers: [this.registry]
    });

    new Histogram({
      name: 'pipeline_duration_seconds',
      help: 'Pipeline execution duration in seconds',
      labelNames: ['pipeline_id'],
      buckets: [60, 300, 600, 1800, 3600, 7200],
      registers: [this.registry]
    });

    new Gauge({
      name: 'pipeline_records_processed',
      help: 'Number of records processed',
      labelNames: ['pipeline_id', 'stage_id'],
      registers: [this.registry]
    });
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

### PagerDuty Integration

```typescript
// PagerDuty integration for incident management
class PagerDutyIntegration {
  private client: PagerDutyClient;

  async createIncident(alert: Alert): Promise<string> {
    const incident = {
      incident: {
        type: 'incident',
        title: alert.message,
        service: { id: this.getServiceId(alert.pipelineId), type: 'service_reference' },
        urgency: this.mapSeverityToUrgency(alert.severity),
        body: {
          type: 'incident_body',
          details: JSON.stringify(alert.context)
        }
      }
    };

    const response = await this.client.createIncident(incident);
    return response.incident.id;
  }

  async resolveIncident(incidentId: string, resolution: string): Promise<void> {
    await this.client.updateIncident(incidentId, {
      incident: {
        type: 'incident',
        status: 'resolved',
        resolution: resolution
      }
    });
  }
}
```

## Security Considerations

### Access Control
- Implement role-based access for pipeline management
- Restrict access to sensitive pipeline configurations
- Audit all pipeline operations and configuration changes
- Use service accounts with minimal permissions

### Data Protection
- Encrypt pipeline logs and metrics at rest
- Mask sensitive data in error messages and logs
- Implement secure credential management for connections
- Apply data retention policies for monitoring data

## Testing Considerations

### Unit Testing

```typescript
describe('PipelineOrchestrator', () => {
  it('should execute pipeline stages in correct order', async () => {
    const orchestrator = new PipelineOrchestrator(mockServices);
    const result = await orchestrator.executePipeline(testPipeline);
    
    expect(result.status).toBe('success');
    expect(mockServices.monitoring.stageOrder).toEqual(['extract', 'transform', 'load']);
  });

  it('should handle stage failures with retry', async () => {
    const orchestrator = new PipelineOrchestrator(mockServices);
    mockServices.executor.failOnFirstAttempt = true;
    
    const result = await orchestrator.executePipeline(pipelineWithRetry);
    
    expect(result.status).toBe('success');
    expect(mockServices.executor.attemptCount).toBe(2);
  });
});
```

### Property-Based Testing

```typescript
describe('Pipeline Monitoring Properties', () => {
  it('should always track all processed records', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ id: fc.string(), data: fc.string() })),
      async (records) => {
        const result = await pipeline.process(records);
        const metrics = await monitoring.getMetrics(result.runId);
        
        expect(metrics.recordsRead + metrics.recordsFailed).toBe(records.length);
      }
    ));
  });
});
```
