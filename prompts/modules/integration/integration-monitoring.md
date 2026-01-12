# Integration Monitoring Template

## Purpose

Provides comprehensive patterns for implementing integration metrics, error tracking, performance monitoring, and alerting systems. This template covers observability for integration flows, distributed tracing, and operational intelligence for maintaining healthy integration ecosystems.

## Context

Integration monitoring is essential for maintaining visibility into complex integration landscapes. This template addresses metrics collection, error tracking, performance analysis, and alerting while ensuring operational excellence and rapid issue resolution in integration environments.

## Core Components

### Integration Metrics Collector

## Examples

```typescript
interface IntegrationMetricsCollector {
  // Metric recording
  recordMetric(metric: IntegrationMetric): Promise<void>;
  recordBatch(metrics: IntegrationMetric[]): Promise<void>;
  
  // Metric querying
  getMetrics(query: MetricQuery): Promise<MetricResult[]>;
  getAggregatedMetrics(query: AggregationQuery): Promise<AggregatedMetric[]>;
  
  // Real-time metrics
  subscribeToMetrics(filter: MetricFilter, handler: MetricHandler): Subscription;
  getCurrentMetrics(integrationId: string): Promise<CurrentMetrics>;
}

interface IntegrationMetric {
  id: string;
  integrationId: string;
  metricType: MetricType;
  name: string;
  value: number;
  unit: MetricUnit;
  tags: Record<string, string>;
  timestamp: Date;
}


enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  SUMMARY = 'summary'
}

enum MetricUnit {
  COUNT = 'count',
  MILLISECONDS = 'ms',
  BYTES = 'bytes',
  PERCENT = 'percent',
  RATE = 'rate'
}

interface MetricQuery {
  integrationIds?: string[];
  metricNames?: string[];
  tags?: Record<string, string>;
  startTime: Date;
  endTime: Date;
  resolution?: string;
}

interface CurrentMetrics {
  integrationId: string;
  throughput: number;
  latency: LatencyMetrics;
  errorRate: number;
  activeConnections: number;
  queueDepth: number;
  timestamp: Date;
}

interface LatencyMetrics {
  avg: number;
  p50: number;
  p95: number;
  p99: number;
  max: number;
}
```

### Error Tracker

```typescript
interface ErrorTracker {
  // Error recording
  trackError(error: IntegrationError): Promise<void>;
  trackException(exception: Error, context: ErrorContext): Promise<void>;
  
  // Error querying
  getErrors(query: ErrorQuery): Promise<IntegrationError[]>;
  getErrorStats(integrationId: string, period: TimePeriod): Promise<ErrorStats>;
  
  // Error analysis
  analyzeErrorPatterns(integrationId: string): Promise<ErrorPattern[]>;
  getErrorTrends(integrationId: string, period: TimePeriod): Promise<ErrorTrend[]>;
  
  // Error resolution
  acknowledgeError(errorId: string, acknowledgment: ErrorAcknowledgment): Promise<void>;
  resolveError(errorId: string, resolution: ErrorResolution): Promise<void>;
}

interface IntegrationError {
  id: string;
  integrationId: string;
  errorType: ErrorType;
  errorCode: string;
  message: string;
  stackTrace?: string;
  context: ErrorContext;
  severity: ErrorSeverity;
  timestamp: Date;
  status: ErrorStatus;
}

enum ErrorType {
  CONNECTION = 'connection',
  TIMEOUT = 'timeout',
  VALIDATION = 'validation',
  TRANSFORMATION = 'transformation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  RATE_LIMIT = 'rate_limit',
  SYSTEM = 'system'
}

enum ErrorSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

interface ErrorContext {
  messageId?: string;
  sourceSystem?: string;
  targetSystem?: string;
  operation?: string;
  payload?: any;
  headers?: Record<string, string>;
  correlationId?: string;
}

interface ErrorStats {
  totalErrors: number;
  errorsByType: Record<ErrorType, number>;
  errorsBySeverity: Record<ErrorSeverity, number>;
  errorRate: number;
  mttr: number; // Mean Time To Resolution
}
```

### Performance Monitor

```typescript
interface PerformanceMonitor {
  // Performance tracking
  startTransaction(transactionId: string, metadata?: TransactionMetadata): void;
  endTransaction(transactionId: string, status: TransactionStatus): void;
  recordSpan(span: PerformanceSpan): void;
  
  // Performance analysis
  getTransactionTrace(transactionId: string): Promise<TransactionTrace>;
  getPerformanceReport(integrationId: string, period: TimePeriod): Promise<PerformanceReport>;
  
  // Bottleneck detection
  identifyBottlenecks(integrationId: string): Promise<Bottleneck[]>;
  getSlowTransactions(integrationId: string, threshold: number): Promise<SlowTransaction[]>;
}

interface PerformanceSpan {
  id: string;
  traceId: string;
  parentSpanId?: string;
  operationName: string;
  serviceName: string;
  startTime: Date;
  endTime: Date;
  duration: number;
  status: SpanStatus;
  tags: Record<string, string>;
  logs: SpanLog[];
}

interface TransactionTrace {
  traceId: string;
  rootSpan: PerformanceSpan;
  spans: PerformanceSpan[];
  totalDuration: number;
  services: string[];
  status: TransactionStatus;
}

interface PerformanceReport {
  integrationId: string;
  period: TimePeriod;
  throughput: ThroughputMetrics;
  latency: LatencyMetrics;
  availability: number;
  errorRate: number;
  topSlowOperations: SlowOperation[];
  resourceUtilization: ResourceMetrics;
}

interface Bottleneck {
  location: string;
  type: BottleneckType;
  impact: number;
  avgLatency: number;
  recommendation: string;
}

enum BottleneckType {
  DATABASE = 'database',
  NETWORK = 'network',
  CPU = 'cpu',
  MEMORY = 'memory',
  EXTERNAL_SERVICE = 'external_service',
  QUEUE = 'queue'
}
```

### Alert Manager

```typescript
interface AlertManager {
  // Alert configuration
  createAlertRule(rule: AlertRule): Promise<void>;
  updateAlertRule(ruleId: string, updates: Partial<AlertRule>): Promise<void>;
  deleteAlertRule(ruleId: string): Promise<void>;
  getAlertRules(integrationId?: string): Promise<AlertRule[]>;
  
  // Alert handling
  triggerAlert(alert: Alert): Promise<void>;
  acknowledgeAlert(alertId: string, acknowledgment: AlertAcknowledgment): Promise<void>;
  resolveAlert(alertId: string, resolution: AlertResolution): Promise<void>;
  
  // Alert querying
  getActiveAlerts(filter?: AlertFilter): Promise<Alert[]>;
  getAlertHistory(query: AlertHistoryQuery): Promise<Alert[]>;
}

interface AlertRule {
  id: string;
  name: string;
  integrationId?: string;
  condition: AlertCondition;
  severity: AlertSeverity;
  notifications: NotificationConfig[];
  cooldownPeriod: number;
  enabled: boolean;
}

interface AlertCondition {
  metric: string;
  operator: ComparisonOperator;
  threshold: number;
  duration: number;
  aggregation?: AggregationType;
}

enum ComparisonOperator {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN_OR_EQUAL = 'lte'
}

interface Alert {
  id: string;
  ruleId: string;
  integrationId: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  status: AlertStatus;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  metadata: Record<string, any>;
}

enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}

enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}

interface NotificationConfig {
  channel: NotificationChannel;
  recipients: string[];
  template?: string;
}

enum NotificationChannel {
  EMAIL = 'email',
  SLACK = 'slack',
  PAGERDUTY = 'pagerduty',
  WEBHOOK = 'webhook',
  SMS = 'sms'
}
```

## Implementation Patterns

### Metrics Collection Implementation

```typescript
class IntegrationMetricsService implements IntegrationMetricsCollector {
  private metricsStore: MetricsStore;
  private aggregator: MetricsAggregator;
  private subscribers: Map<string, MetricHandler[]> = new Map();
  
  async recordMetric(metric: IntegrationMetric): Promise<void> {
    // Validate metric
    this.validateMetric(metric);
    
    // Store metric
    await this.metricsStore.store(metric);
    
    // Update real-time aggregations
    await this.aggregator.updateAggregation(metric);
    
    // Notify subscribers
    this.notifySubscribers(metric);
    
    // Check alert conditions
    await this.checkAlertConditions(metric);
  }
  
  async getAggregatedMetrics(query: AggregationQuery): Promise<AggregatedMetric[]> {
    const rawMetrics = await this.metricsStore.query({
      integrationIds: query.integrationIds,
      metricNames: query.metricNames,
      startTime: query.startTime,
      endTime: query.endTime
    });
    
    // Group by time buckets
    const buckets = this.groupByTimeBuckets(rawMetrics, query.resolution);
    
    // Apply aggregation function
    return buckets.map(bucket => ({
      timestamp: bucket.timestamp,
      value: this.aggregate(bucket.metrics, query.aggregation),
      count: bucket.metrics.length
    }));
  }
  
  async getCurrentMetrics(integrationId: string): Promise<CurrentMetrics> {
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
    
    const recentMetrics = await this.metricsStore.query({
      integrationIds: [integrationId],
      startTime: fiveMinutesAgo,
      endTime: now
    });
    
    return {
      integrationId,
      throughput: this.calculateThroughput(recentMetrics),
      latency: this.calculateLatencyMetrics(recentMetrics),
      errorRate: this.calculateErrorRate(recentMetrics),
      activeConnections: this.getActiveConnections(integrationId),
      queueDepth: this.getQueueDepth(integrationId),
      timestamp: now
    };
  }
  
  private calculateLatencyMetrics(metrics: IntegrationMetric[]): LatencyMetrics {
    const latencyMetrics = metrics.filter(m => m.name === 'latency');
    const values = latencyMetrics.map(m => m.value).sort((a, b) => a - b);
    
    if (values.length === 0) {
      return { avg: 0, p50: 0, p95: 0, p99: 0, max: 0 };
    }
    
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      p50: this.percentile(values, 50),
      p95: this.percentile(values, 95),
      p99: this.percentile(values, 99),
      max: values[values.length - 1]
    };
  }
  
  private percentile(sortedValues: number[], p: number): number {
    const index = Math.ceil((p / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
  }
}
```

### Error Tracking Implementation

```typescript
class IntegrationErrorTracker implements ErrorTracker {
  private errorStore: ErrorStore;
  private patternAnalyzer: ErrorPatternAnalyzer;
  private alertManager: AlertManager;
  
  async trackError(error: IntegrationError): Promise<void> {
    // Enrich error with additional context
    const enrichedError = await this.enrichError(error);
    
    // Store error
    await this.errorStore.store(enrichedError);
    
    // Update error statistics
    await this.updateErrorStats(enrichedError);
    
    // Check for error patterns
    const patterns = await this.patternAnalyzer.checkPatterns(enrichedError);
    
    // Trigger alerts if necessary
    if (this.shouldAlert(enrichedError, patterns)) {
      await this.alertManager.triggerAlert({
        id: generateAlertId(),
        ruleId: 'error-threshold',
        integrationId: error.integrationId,
        severity: this.mapSeverityToAlertSeverity(error.severity),
        title: `Integration Error: ${error.errorCode}`,
        description: error.message,
        status: AlertStatus.ACTIVE,
        triggeredAt: new Date(),
        metadata: { errorId: error.id, errorType: error.errorType }
      });
    }
  }
  
  async analyzeErrorPatterns(integrationId: string): Promise<ErrorPattern[]> {
    const recentErrors = await this.errorStore.query({
      integrationIds: [integrationId],
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      endTime: new Date()
    });
    
    const patterns: ErrorPattern[] = [];
    
    // Analyze by error type
    const byType = this.groupBy(recentErrors, 'errorType');
    for (const [type, errors] of Object.entries(byType)) {
      if (errors.length >= 5) {
        patterns.push({
          type: 'recurring_error_type',
          errorType: type as ErrorType,
          count: errors.length,
          firstOccurrence: errors[0].timestamp,
          lastOccurrence: errors[errors.length - 1].timestamp,
          recommendation: this.getRecommendation(type as ErrorType)
        });
      }
    }
    
    // Analyze by time pattern
    const timePatterns = this.analyzeTimePatterns(recentErrors);
    patterns.push(...timePatterns);
    
    // Analyze by source/target
    const systemPatterns = this.analyzeSystemPatterns(recentErrors);
    patterns.push(...systemPatterns);
    
    return patterns;
  }
  
  async getErrorTrends(integrationId: string, period: TimePeriod): Promise<ErrorTrend[]> {
    const errors = await this.errorStore.query({
      integrationIds: [integrationId],
      startTime: period.start,
      endTime: period.end
    });
    
    // Group by hour
    const hourlyGroups = this.groupByHour(errors);
    
    return hourlyGroups.map(group => ({
      timestamp: group.hour,
      totalErrors: group.errors.length,
      byType: this.countByType(group.errors),
      bySeverity: this.countBySeverity(group.errors),
      trend: this.calculateTrend(group, hourlyGroups)
    }));
  }
  
  private enrichError(error: IntegrationError): IntegrationError {
    return {
      ...error,
      context: {
        ...error.context,
        environment: process.env.NODE_ENV,
        hostname: os.hostname(),
        timestamp: new Date().toISOString()
      }
    };
  }
}
```

### Performance Monitoring Implementation

```typescript
class IntegrationPerformanceMonitor implements PerformanceMonitor {
  private traceStore: TraceStore;
  private activeTransactions: Map<string, TransactionContext> = new Map();
  
  startTransaction(transactionId: string, metadata?: TransactionMetadata): void {
    const context: TransactionContext = {
      traceId: transactionId,
      startTime: Date.now(),
      spans: [],
      metadata: metadata || {}
    };
    
    this.activeTransactions.set(transactionId, context);
  }
  
  endTransaction(transactionId: string, status: TransactionStatus): void {
    const context = this.activeTransactions.get(transactionId);
    
    if (!context) {
      console.warn(`Transaction ${transactionId} not found`);
      return;
    }
    
    const endTime = Date.now();
    const duration = endTime - context.startTime;
    
    // Store trace
    this.traceStore.store({
      traceId: transactionId,
      spans: context.spans,
      totalDuration: duration,
      status,
      startTime: new Date(context.startTime),
      endTime: new Date(endTime),
      metadata: context.metadata
    });
    
    // Record metrics
    this.recordTransactionMetrics(transactionId, duration, status);
    
    this.activeTransactions.delete(transactionId);
  }
  
  recordSpan(span: PerformanceSpan): void {
    const context = this.activeTransactions.get(span.traceId);
    
    if (context) {
      context.spans.push(span);
    }
    
    // Also store span independently for analysis
    this.traceStore.storeSpan(span);
  }
  
  async identifyBottlenecks(integrationId: string): Promise<Bottleneck[]> {
    const traces = await this.traceStore.getTraces({
      integrationId,
      startTime: new Date(Date.now() - 60 * 60 * 1000), // Last hour
      endTime: new Date()
    });
    
    const bottlenecks: Bottleneck[] = [];
    
    // Analyze span durations
    const spanStats = this.analyzeSpanDurations(traces);
    
    for (const [operation, stats] of Object.entries(spanStats)) {
      if (stats.avgDuration > 1000) { // > 1 second
        bottlenecks.push({
          location: operation,
          type: this.inferBottleneckType(operation),
          impact: stats.totalTime / this.getTotalDuration(traces),
          avgLatency: stats.avgDuration,
          recommendation: this.getBottleneckRecommendation(operation, stats)
        });
      }
    }
    
    // Sort by impact
    bottlenecks.sort((a, b) => b.impact - a.impact);
    
    return bottlenecks;
  }
  
  async getSlowTransactions(integrationId: string, threshold: number): Promise<SlowTransaction[]> {
    const traces = await this.traceStore.getTraces({
      integrationId,
      minDuration: threshold,
      startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endTime: new Date()
    });
    
    return traces.map(trace => ({
      traceId: trace.traceId,
      duration: trace.totalDuration,
      slowestSpan: this.findSlowestSpan(trace.spans),
      timestamp: trace.startTime,
      metadata: trace.metadata
    }));
  }
  
  private analyzeSpanDurations(traces: TransactionTrace[]): Record<string, SpanStats> {
    const stats: Record<string, SpanStats> = {};
    
    for (const trace of traces) {
      for (const span of trace.spans) {
        if (!stats[span.operationName]) {
          stats[span.operationName] = {
            count: 0,
            totalTime: 0,
            avgDuration: 0,
            maxDuration: 0
          };
        }
        
        stats[span.operationName].count++;
        stats[span.operationName].totalTime += span.duration;
        stats[span.operationName].maxDuration = Math.max(
          stats[span.operationName].maxDuration,
          span.duration
        );
      }
    }
    
    // Calculate averages
    for (const operation of Object.keys(stats)) {
      stats[operation].avgDuration = stats[operation].totalTime / stats[operation].count;
    }
    
    return stats;
  }
}
```

### Alert Management Implementation

```typescript
class IntegrationAlertManager implements AlertManager {
  private ruleStore: AlertRuleStore;
  private alertStore: AlertStore;
  private notificationService: NotificationService;
  private cooldownTracker: Map<string, Date> = new Map();
  
  async triggerAlert(alert: Alert): Promise<void> {
    // Check cooldown
    const rule = await this.ruleStore.get(alert.ruleId);
    if (this.isInCooldown(rule)) {
      return;
    }
    
    // Store alert
    await this.alertStore.store(alert);
    
    // Send notifications
    await this.sendNotifications(alert, rule);
    
    // Update cooldown
    this.cooldownTracker.set(rule.id, new Date());
  }
  
  private async sendNotifications(alert: Alert, rule: AlertRule): Promise<void> {
    for (const config of rule.notifications) {
      try {
        await this.notificationService.send({
          channel: config.channel,
          recipients: config.recipients,
          subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
          body: this.formatAlertMessage(alert, config.template),
          metadata: {
            alertId: alert.id,
            integrationId: alert.integrationId
          }
        });
      } catch (error) {
        console.error(`Failed to send notification via ${config.channel}:`, error);
      }
    }
  }
  
  private formatAlertMessage(alert: Alert, template?: string): string {
    if (template) {
      return this.renderTemplate(template, alert);
    }
    
    return `
Alert: ${alert.title}
Severity: ${alert.severity}
Integration: ${alert.integrationId}
Time: ${alert.triggeredAt.toISOString()}

Description:
${alert.description}

Metadata:
${JSON.stringify(alert.metadata, null, 2)}
    `.trim();
  }
  
  async acknowledgeAlert(alertId: string, acknowledgment: AlertAcknowledgment): Promise<void> {
    const alert = await this.alertStore.get(alertId);
    
    if (!alert) {
      throw new AlertNotFoundError(`Alert ${alertId} not found`);
    }
    
    alert.status = AlertStatus.ACKNOWLEDGED;
    alert.acknowledgedAt = new Date();
    alert.metadata.acknowledgment = acknowledgment;
    
    await this.alertStore.update(alert);
    
    // Notify about acknowledgment
    await this.notificationService.send({
      channel: NotificationChannel.SLACK,
      recipients: ['#alerts'],
      subject: `Alert Acknowledged: ${alert.title}`,
      body: `Alert ${alertId} acknowledged by ${acknowledgment.acknowledgedBy}: ${acknowledgment.comment}`
    });
  }
  
  async resolveAlert(alertId: string, resolution: AlertResolution): Promise<void> {
    const alert = await this.alertStore.get(alertId);
    
    if (!alert) {
      throw new AlertNotFoundError(`Alert ${alertId} not found`);
    }
    
    alert.status = AlertStatus.RESOLVED;
    alert.resolvedAt = new Date();
    alert.metadata.resolution = resolution;
    
    await this.alertStore.update(alert);
  }
  
  private isInCooldown(rule: AlertRule): boolean {
    const lastTrigger = this.cooldownTracker.get(rule.id);
    
    if (!lastTrigger) {
      return false;
    }
    
    const cooldownEnd = new Date(lastTrigger.getTime() + rule.cooldownPeriod * 1000);
    return new Date() < cooldownEnd;
  }
}
```

## Integration Points

### Observability Platform Integration

```typescript
interface ObservabilityIntegration {
  // Prometheus integration
  exportPrometheusMetrics(): string;
  
  // Grafana integration
  createGrafanaDashboard(config: DashboardConfig): Promise<Dashboard>;
  
  // Jaeger/Zipkin integration
  exportTraces(format: TraceFormat): Promise<ExportedTraces>;
  
  // ELK Stack integration
  sendToElasticsearch(data: LogData): Promise<void>;
}

class PrometheusExporter implements ObservabilityIntegration {
  exportPrometheusMetrics(): string {
    const metrics = this.metricsCollector.getAllMetrics();
    
    return metrics.map(metric => {
      const labels = Object.entries(metric.tags)
        .map(([k, v]) => `${k}="${v}"`)
        .join(',');
      
      return `${metric.name}{${labels}} ${metric.value}`;
    }).join('\n');
  }
}
```

## Security Considerations

### Monitoring Security

```typescript
const monitoringSecurityConfig = {
  // Data protection
  dataProtection: {
    maskSensitiveData: true,
    sensitiveFields: ['password', 'token', 'apiKey', 'secret'],
    retentionPeriod: 90 // days
  },
  
  // Access control
  accessControl: {
    requireAuthentication: true,
    roleBasedAccess: true,
    auditAccess: true
  },
  
  // Alert security
  alertSecurity: {
    encryptNotifications: true,
    validateRecipients: true
  }
};
```

## Compliance Requirements

### Monitoring Compliance

- **Data Retention**: Retain monitoring data per compliance requirements
- **Access Logging**: Log all access to monitoring data
- **PII Protection**: Mask or exclude PII from monitoring data
- **Audit Trail**: Maintain audit trail for alert actions

## Testing Considerations

### Monitoring Testing

```typescript
describe('IntegrationMetricsService', () => {
  it('should record and aggregate metrics', async () => {
    const service = new IntegrationMetricsService();
    
    // Record metrics
    for (let i = 0; i < 10; i++) {
      await service.recordMetric({
        id: `metric-${i}`,
        integrationId: 'int-1',
        metricType: MetricType.GAUGE,
        name: 'latency',
        value: 100 + i * 10,
        unit: MetricUnit.MILLISECONDS,
        tags: {},
        timestamp: new Date()
      });
    }
    
    // Query aggregated metrics
    const aggregated = await service.getAggregatedMetrics({
      integrationIds: ['int-1'],
      metricNames: ['latency'],
      startTime: new Date(Date.now() - 60000),
      endTime: new Date(),
      aggregation: AggregationType.AVG,
      resolution: '1m'
    });
    
    expect(aggregated).toHaveLength(1);
    expect(aggregated[0].value).toBe(145); // Average of 100-190
  });
});

describe('IntegrationAlertManager', () => {
  it('should trigger alert when threshold exceeded', async () => {
    const alertManager = new IntegrationAlertManager();
    
    await alertManager.createAlertRule({
      id: 'rule-1',
      name: 'High Error Rate',
      integrationId: 'int-1',
      condition: {
        metric: 'error_rate',
        operator: ComparisonOperator.GREATER_THAN,
        threshold: 0.05,
        duration: 60
      },
      severity: AlertSeverity.WARNING,
      notifications: [{ channel: NotificationChannel.EMAIL, recipients: ['admin@example.com'] }],
      cooldownPeriod: 300,
      enabled: true
    });
    
    // Simulate high error rate
    await metricsService.recordMetric({
      name: 'error_rate',
      value: 0.1,
      integrationId: 'int-1'
    });
    
    // Check alert was triggered
    const alerts = await alertManager.getActiveAlerts({ integrationId: 'int-1' });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].severity).toBe(AlertSeverity.WARNING);
  });
});
```

This template provides comprehensive patterns for implementing integration monitoring with metrics collection, error tracking, performance analysis, and alerting capabilities.
