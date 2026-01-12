# Performance Monitoring Template

## Purpose

This template provides comprehensive patterns for implementing Application Performance Monitoring (APM), performance profiling, and real-time performance analytics. It covers metrics collection, distributed tracing, performance baselines, alerting systems, and user experience monitoring for production applications.

## Context

Performance monitoring is essential for maintaining application health, identifying bottlenecks, and ensuring optimal user experience. This template addresses the challenges of collecting meaningful metrics, correlating performance data across distributed systems, establishing baselines, and implementing proactive alerting to prevent performance degradation.

## Core Components

### Performance Metrics Service

## Examples

```typescript
interface PerformanceMetricsService {
  // Metric recording
  recordMetric(metric: PerformanceMetric): void;
  recordHistogram(name: string, value: number, tags?: MetricTags): void;
  recordCounter(name: string, value?: number, tags?: MetricTags): void;
  recordGauge(name: string, value: number, tags?: MetricTags): void;
  recordTimer(name: string, duration: number, tags?: MetricTags): void;
  
  // Metric retrieval
  getMetric(name: string, timeRange: TimeRange): Promise<MetricData[]>;
  getAggregatedMetrics(query: MetricQuery): Promise<AggregatedMetrics>;
  
  // Baseline management
  calculateBaseline(metric: string, period: TimeRange): Promise<MetricBaseline>;
  compareToBaseline(metric: string, current: number): BaselineComparison;
}

interface PerformanceMetric {
  name: string;
  type: MetricType;
  value: number;
  timestamp: Date;
  tags?: MetricTags;
  unit?: MetricUnit;
}

enum MetricType {
  COUNTER = 'counter',
  GAUGE = 'gauge',
  HISTOGRAM = 'histogram',
  TIMER = 'timer',
  SUMMARY = 'summary'
}

interface MetricTags {
  service?: string;
  endpoint?: string;
  method?: string;
  status?: string;
  environment?: string;
  region?: string;
  [key: string]: string | undefined;
}

interface MetricBaseline {
  metric: string;
  period: TimeRange;
  mean: number;
  median: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  stdDev: number;
  min: number;
  max: number;
}

interface BaselineComparison {
  metric: string;
  current: number;
  baseline: MetricBaseline;
  deviation: number;
  deviationPercent: number;
  status: 'normal' | 'warning' | 'critical';
}
```

### APM Tracing Service

```typescript
interface APMTracingService {
  // Span management
  startSpan(name: string, options?: SpanOptions): Span;
  getCurrentSpan(): Span | null;
  endSpan(span: Span): void;
  
  // Context propagation
  injectContext(carrier: ContextCarrier): void;
  extractContext(carrier: ContextCarrier): SpanContext | null;
  
  // Trace retrieval
  getTrace(traceId: string): Promise<Trace>;
  searchTraces(query: TraceQuery): Promise<TraceSearchResult>;
  
  // Error tracking
  recordException(span: Span, error: Error): void;
  recordEvent(span: Span, event: SpanEvent): void;
}

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  kind: SpanKind;
  startTime: Date;
  endTime?: Date;
  status: SpanStatus;
  attributes: SpanAttributes;
  events: SpanEvent[];
  links: SpanLink[];
}

enum SpanKind {
  INTERNAL = 'internal',
  SERVER = 'server',
  CLIENT = 'client',
  PRODUCER = 'producer',
  CONSUMER = 'consumer'
}

interface SpanStatus {
  code: SpanStatusCode;
  message?: string;
}

enum SpanStatusCode {
  UNSET = 'unset',
  OK = 'ok',
  ERROR = 'error'
}

interface Trace {
  traceId: string;
  spans: Span[];
  duration: number;
  services: string[];
  rootSpan: Span;
  errorCount: number;
}

interface TraceQuery {
  service?: string;
  operation?: string;
  tags?: Record<string, string>;
  minDuration?: number;
  maxDuration?: number;
  timeRange: TimeRange;
  limit?: number;
}
```

### Performance Profiler Service

```typescript
interface PerformanceProfilerService {
  // CPU profiling
  startCPUProfile(options?: CPUProfileOptions): ProfileSession;
  stopCPUProfile(session: ProfileSession): Promise<CPUProfile>;
  
  // Memory profiling
  takeHeapSnapshot(): Promise<HeapSnapshot>;
  startHeapProfiling(options?: HeapProfileOptions): ProfileSession;
  stopHeapProfiling(session: ProfileSession): Promise<HeapProfile>;
  
  // Async profiling
  startAsyncProfile(options?: AsyncProfileOptions): ProfileSession;
  stopAsyncProfile(session: ProfileSession): Promise<AsyncProfile>;
  
  // Analysis
  analyzeProfile(profile: Profile): ProfileAnalysis;
  findHotspots(profile: CPUProfile): Hotspot[];
  findMemoryLeaks(snapshots: HeapSnapshot[]): MemoryLeak[];
}

interface CPUProfile {
  startTime: Date;
  endTime: Date;
  duration: number;
  samples: CPUSample[];
  nodes: ProfileNode[];
  totalSamples: number;
}

interface CPUSample {
  timestamp: number;
  stackTrace: string[];
  duration: number;
}

interface HeapSnapshot {
  timestamp: Date;
  totalSize: number;
  totalObjects: number;
  nodes: HeapNode[];
  edges: HeapEdge[];
}

interface Hotspot {
  function: string;
  file: string;
  line: number;
  selfTime: number;
  totalTime: number;
  percentage: number;
  callCount: number;
}

interface MemoryLeak {
  type: string;
  size: number;
  retainedSize: number;
  path: string[];
  confidence: number;
}
```

### Real User Monitoring (RUM) Service

```typescript
interface RUMService {
  // Page performance
  recordPageLoad(metrics: PageLoadMetrics): void;
  recordNavigation(metrics: NavigationMetrics): void;
  
  // User interactions
  recordInteraction(interaction: UserInteraction): void;
  recordError(error: ClientError): void;
  
  // Web Vitals
  recordWebVitals(vitals: WebVitals): void;
  
  // Session management
  startSession(): string;
  endSession(sessionId: string): void;
  
  // Analytics
  getSessionReplay(sessionId: string): Promise<SessionReplay>;
  getUserJourney(userId: string): Promise<UserJourney>;
}

interface PageLoadMetrics {
  url: string;
  loadTime: number;
  domContentLoaded: number;
  firstPaint: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  totalBlockingTime: number;
  cumulativeLayoutShift: number;
}

interface WebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
  inp: number; // Interaction to Next Paint
}

interface UserInteraction {
  type: InteractionType;
  target: string;
  timestamp: Date;
  duration?: number;
  metadata?: Record<string, unknown>;
}

enum InteractionType {
  CLICK = 'click',
  SCROLL = 'scroll',
  INPUT = 'input',
  NAVIGATION = 'navigation',
  FORM_SUBMIT = 'form_submit'
}
```

### Alerting Service

```typescript
interface PerformanceAlertingService {
  // Alert rules
  createAlertRule(rule: AlertRule): Promise<string>;
  updateAlertRule(ruleId: string, rule: Partial<AlertRule>): Promise<void>;
  deleteAlertRule(ruleId: string): Promise<void>;
  getAlertRules(): Promise<AlertRule[]>;
  
  // Alert management
  getActiveAlerts(): Promise<Alert[]>;
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
  resolveAlert(alertId: string, resolution: string): Promise<void>;
  
  // Notifications
  configureNotificationChannel(channel: NotificationChannel): Promise<void>;
  testNotificationChannel(channelId: string): Promise<boolean>;
}

interface AlertRule {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: AlertCondition;
  threshold: number;
  duration: number; // seconds
  severity: AlertSeverity;
  notificationChannels: string[];
  tags?: Record<string, string>;
  enabled: boolean;
}

interface AlertCondition {
  operator: ComparisonOperator;
  aggregation: AggregationType;
  window: number; // seconds
}

enum ComparisonOperator {
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN_OR_EQUAL = 'lte',
  EQUALS = 'eq',
  NOT_EQUALS = 'neq'
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
  ruleName: string;
  severity: AlertSeverity;
  status: AlertStatus;
  triggeredAt: Date;
  resolvedAt?: Date;
  acknowledgedBy?: string;
  currentValue: number;
  threshold: number;
  message: string;
}

enum AlertStatus {
  FIRING = 'firing',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved'
}
```

## Implementation Patterns

### OpenTelemetry Integration

```typescript
class OpenTelemetryAPM implements APMTracingService {
  private tracer: Tracer;
  private meterProvider: MeterProvider;

  constructor(config: OTelConfig) {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment
    });

    // Configure trace provider
    const traceProvider = new NodeTracerProvider({ resource });
    traceProvider.addSpanProcessor(
      new BatchSpanProcessor(new OTLPTraceExporter({
        url: config.collectorUrl
      }))
    );
    traceProvider.register();

    // Configure meter provider
    this.meterProvider = new MeterProvider({ resource });
    this.meterProvider.addMetricReader(
      new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
          url: config.collectorUrl
        }),
        exportIntervalMillis: config.exportInterval || 60000
      })
    );

    this.tracer = trace.getTracer(config.serviceName);
  }

  startSpan(name: string, options?: SpanOptions): Span {
    const span = this.tracer.startSpan(name, {
      kind: this.mapSpanKind(options?.kind),
      attributes: options?.attributes
    });

    return this.wrapSpan(span);
  }

  getCurrentSpan(): Span | null {
    const activeSpan = trace.getActiveSpan();
    return activeSpan ? this.wrapSpan(activeSpan) : null;
  }

  injectContext(carrier: ContextCarrier): void {
    propagation.inject(context.active(), carrier);
  }

  extractContext(carrier: ContextCarrier): SpanContext | null {
    const extractedContext = propagation.extract(context.active(), carrier);
    const span = trace.getSpan(extractedContext);
    return span?.spanContext() || null;
  }

  private wrapSpan(otelSpan: OTelSpan): Span {
    const spanContext = otelSpan.spanContext();
    return {
      traceId: spanContext.traceId,
      spanId: spanContext.spanId,
      name: '',
      kind: SpanKind.INTERNAL,
      startTime: new Date(),
      status: { code: SpanStatusCode.UNSET },
      attributes: {},
      events: [],
      links: []
    };
  }
}
```

### Prometheus Metrics Implementation

```typescript
class PrometheusMetricsService implements PerformanceMetricsService {
  private registry: Registry;
  private counters: Map<string, Counter>;
  private gauges: Map<string, Gauge>;
  private histograms: Map<string, Histogram>;

  constructor() {
    this.registry = new Registry();
    this.counters = new Map();
    this.gauges = new Map();
    this.histograms = new Map();

    // Register default metrics
    collectDefaultMetrics({ register: this.registry });
  }

  recordCounter(name: string, value: number = 1, tags?: MetricTags): void {
    const counter = this.getOrCreateCounter(name, tags);
    counter.inc(tags || {}, value);
  }

  recordGauge(name: string, value: number, tags?: MetricTags): void {
    const gauge = this.getOrCreateGauge(name, tags);
    gauge.set(tags || {}, value);
  }

  recordHistogram(name: string, value: number, tags?: MetricTags): void {
    const histogram = this.getOrCreateHistogram(name, tags);
    histogram.observe(tags || {}, value);
  }

  recordTimer(name: string, duration: number, tags?: MetricTags): void {
    this.recordHistogram(`${name}_duration_seconds`, duration / 1000, tags);
  }

  private getOrCreateCounter(name: string, tags?: MetricTags): Counter {
    if (!this.counters.has(name)) {
      const counter = new Counter({
        name,
        help: `Counter for ${name}`,
        labelNames: tags ? Object.keys(tags) : [],
        registers: [this.registry]
      });
      this.counters.set(name, counter);
    }
    return this.counters.get(name)!;
  }

  private getOrCreateGauge(name: string, tags?: MetricTags): Gauge {
    if (!this.gauges.has(name)) {
      const gauge = new Gauge({
        name,
        help: `Gauge for ${name}`,
        labelNames: tags ? Object.keys(tags) : [],
        registers: [this.registry]
      });
      this.gauges.set(name, gauge);
    }
    return this.gauges.get(name)!;
  }

  private getOrCreateHistogram(name: string, tags?: MetricTags): Histogram {
    if (!this.histograms.has(name)) {
      const histogram = new Histogram({
        name,
        help: `Histogram for ${name}`,
        labelNames: tags ? Object.keys(tags) : [],
        buckets: [0.001, 0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
        registers: [this.registry]
      });
      this.histograms.set(name, histogram);
    }
    return this.histograms.get(name)!;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

### Performance Middleware

```typescript
class PerformanceMiddleware {
  private metricsService: PerformanceMetricsService;
  private tracingService: APMTracingService;

  constructor(
    metricsService: PerformanceMetricsService,
    tracingService: APMTracingService
  ) {
    this.metricsService = metricsService;
    this.tracingService = tracingService;
  }

  httpMiddleware() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const span = this.tracingService.startSpan(`HTTP ${req.method} ${req.path}`, {
        kind: SpanKind.SERVER,
        attributes: {
          'http.method': req.method,
          'http.url': req.url,
          'http.route': req.route?.path
        }
      });

      // Track response
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const tags: MetricTags = {
          method: req.method,
          endpoint: req.route?.path || req.path,
          status: res.statusCode.toString()
        };

        // Record metrics
        this.metricsService.recordTimer('http_request', duration, tags);
        this.metricsService.recordCounter('http_requests_total', 1, tags);

        // Update span
        span.attributes['http.status_code'] = res.statusCode;
        span.status = {
          code: res.statusCode >= 400 ? SpanStatusCode.ERROR : SpanStatusCode.OK
        };
        this.tracingService.endSpan(span);
      });

      next();
    };
  }

  databaseMiddleware() {
    return {
      beforeQuery: (query: string) => {
        const span = this.tracingService.startSpan('database.query', {
          kind: SpanKind.CLIENT,
          attributes: {
            'db.statement': query.substring(0, 1000),
            'db.system': 'postgresql'
          }
        });
        return { span, startTime: Date.now() };
      },
      afterQuery: (context: { span: Span; startTime: number }, error?: Error) => {
        const duration = Date.now() - context.startTime;
        
        this.metricsService.recordTimer('database_query', duration, {
          operation: this.extractOperation(context.span.attributes['db.statement'] as string)
        });

        if (error) {
          this.tracingService.recordException(context.span, error);
          context.span.status = { code: SpanStatusCode.ERROR, message: error.message };
        }

        this.tracingService.endSpan(context.span);
      }
    };
  }

  private extractOperation(query: string): string {
    const match = query.match(/^\s*(SELECT|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER)/i);
    return match ? match[1].toUpperCase() : 'UNKNOWN';
  }
}
```

## Integration Points

### Grafana Dashboard Integration

```typescript
class GrafanaDashboardGenerator {
  generateAPMDashboard(config: DashboardConfig): GrafanaDashboard {
    return {
      title: `${config.serviceName} APM Dashboard`,
      panels: [
        this.createRequestRatePanel(config),
        this.createLatencyPanel(config),
        this.createErrorRatePanel(config),
        this.createSaturationPanel(config),
        this.createTracePanel(config)
      ],
      templating: {
        list: [
          { name: 'service', type: 'query', query: 'label_values(service)' },
          { name: 'environment', type: 'query', query: 'label_values(environment)' }
        ]
      },
      time: { from: 'now-1h', to: 'now' },
      refresh: '30s'
    };
  }

  private createLatencyPanel(config: DashboardConfig): Panel {
    return {
      title: 'Request Latency',
      type: 'graph',
      targets: [
        {
          expr: `histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{service="${config.serviceName}"}[5m]))`,
          legendFormat: 'p50'
        },
        {
          expr: `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{service="${config.serviceName}"}[5m]))`,
          legendFormat: 'p95'
        },
        {
          expr: `histogram_quantile(0.99, rate(http_request_duration_seconds_bucket{service="${config.serviceName}"}[5m]))`,
          legendFormat: 'p99'
        }
      ],
      yAxes: [{ format: 's', label: 'Latency' }]
    };
  }
}
```

### PagerDuty Integration

```typescript
class PagerDutyAlertIntegration {
  private apiKey: string;
  private serviceKey: string;

  async sendAlert(alert: Alert): Promise<void> {
    const severity = this.mapSeverity(alert.severity);
    
    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        routing_key: this.serviceKey,
        event_action: 'trigger',
        dedup_key: alert.id,
        payload: {
          summary: alert.message,
          severity,
          source: alert.ruleName,
          timestamp: alert.triggeredAt.toISOString(),
          custom_details: {
            current_value: alert.currentValue,
            threshold: alert.threshold,
            rule_id: alert.ruleId
          }
        }
      })
    });
  }

  async resolveAlert(alertId: string): Promise<void> {
    await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        routing_key: this.serviceKey,
        event_action: 'resolve',
        dedup_key: alertId
      })
    });
  }

  private mapSeverity(severity: AlertSeverity): string {
    const mapping: Record<AlertSeverity, string> = {
      [AlertSeverity.INFO]: 'info',
      [AlertSeverity.WARNING]: 'warning',
      [AlertSeverity.ERROR]: 'error',
      [AlertSeverity.CRITICAL]: 'critical'
    };
    return mapping[severity];
  }
}
```

## Security Considerations

### Secure Metrics Collection

```typescript
class SecureMetricsCollector {
  private metricsService: PerformanceMetricsService;
  private sensitivePatterns: RegExp[];

  constructor(metricsService: PerformanceMetricsService) {
    this.metricsService = metricsService;
    this.sensitivePatterns = [
      /password/i,
      /secret/i,
      /token/i,
      /api[_-]?key/i,
      /authorization/i
    ];
  }

  recordMetricSafely(metric: PerformanceMetric): void {
    // Sanitize tags to remove sensitive data
    const sanitizedTags = this.sanitizeTags(metric.tags);
    
    this.metricsService.recordMetric({
      ...metric,
      tags: sanitizedTags
    });
  }

  private sanitizeTags(tags?: MetricTags): MetricTags | undefined {
    if (!tags) return undefined;

    const sanitized: MetricTags = {};
    for (const [key, value] of Object.entries(tags)) {
      if (this.isSensitive(key) || this.isSensitive(value)) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  private isSensitive(value?: string): boolean {
    if (!value) return false;
    return this.sensitivePatterns.some(pattern => pattern.test(value));
  }
}
```

## Testing Considerations

### Performance Monitoring Tests

```typescript
describe('Performance Metrics Service', () => {
  let metricsService: PrometheusMetricsService;

  beforeEach(() => {
    metricsService = new PrometheusMetricsService();
  });

  it('should record and retrieve counter metrics', () => {
    metricsService.recordCounter('test_requests_total', 1, { method: 'GET' });
    metricsService.recordCounter('test_requests_total', 1, { method: 'GET' });
    
    const metrics = await metricsService.getMetrics();
    expect(metrics).toContain('test_requests_total');
  });

  it('should record histogram with correct buckets', () => {
    metricsService.recordHistogram('response_time', 0.05);
    metricsService.recordHistogram('response_time', 0.15);
    metricsService.recordHistogram('response_time', 1.5);
    
    const metrics = await metricsService.getMetrics();
    expect(metrics).toContain('response_time_bucket');
  });

  it('should calculate baseline correctly', async () => {
    // Record sample data
    for (let i = 0; i < 100; i++) {
      metricsService.recordHistogram('latency', Math.random() * 100);
    }
    
    const baseline = await metricsService.calculateBaseline('latency', {
      start: new Date(Date.now() - 3600000),
      end: new Date()
    });
    
    expect(baseline.mean).toBeGreaterThan(0);
    expect(baseline.p99).toBeGreaterThanOrEqual(baseline.p95);
  });
});
```

## Configuration Examples

### OpenTelemetry Configuration

```typescript
const otelConfig: OTelConfig = {
  serviceName: 'my-service',
  serviceVersion: '1.0.0',
  environment: 'production',
  collectorUrl: 'http://otel-collector:4318',
  exportInterval: 60000,
  samplingRate: 0.1, // 10% sampling in production
  propagators: ['tracecontext', 'baggage'],
  instrumentations: [
    '@opentelemetry/instrumentation-http',
    '@opentelemetry/instrumentation-express',
    '@opentelemetry/instrumentation-pg'
  ]
};
```

### Alert Rules Configuration

```typescript
const alertRules: AlertRule[] = [
  {
    id: 'high-latency',
    name: 'High Request Latency',
    description: 'P95 latency exceeds threshold',
    metric: 'http_request_duration_seconds',
    condition: {
      operator: ComparisonOperator.GREATER_THAN,
      aggregation: AggregationType.PERCENTILE_95,
      window: 300
    },
    threshold: 2.0,
    duration: 300,
    severity: AlertSeverity.WARNING,
    notificationChannels: ['slack-ops', 'pagerduty'],
    enabled: true
  },
  {
    id: 'high-error-rate',
    name: 'High Error Rate',
    description: 'Error rate exceeds 5%',
    metric: 'http_requests_total',
    condition: {
      operator: ComparisonOperator.GREATER_THAN,
      aggregation: AggregationType.RATE,
      window: 300
    },
    threshold: 0.05,
    duration: 180,
    severity: AlertSeverity.CRITICAL,
    notificationChannels: ['pagerduty', 'slack-ops'],
    enabled: true
  }
];
```
