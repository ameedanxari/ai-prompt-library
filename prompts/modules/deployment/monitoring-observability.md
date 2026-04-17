# Monitoring and Observability Template

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

This template provides comprehensive patterns for implementing monitoring and observability including application monitoring, infrastructure monitoring, distributed tracing, log aggregation, and alerting. It covers the three pillars of observability: metrics, logs, and traces.

## Context

Modern distributed systems require comprehensive observability to understand system behavior, diagnose issues, and ensure reliability. This template addresses the challenges of implementing end-to-end observability across microservices, containers, and cloud infrastructure.

## Core Components

### Metrics Collection Service

## Examples

```typescript
interface MetricsCollectionService {
  // Metric recording
  recordCounter(name: string, value: number, labels?: Record<string, string>): void;
  recordGauge(name: string, value: number, labels?: Record<string, string>): void;
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
  recordSummary(name: string, value: number, labels?: Record<string, string>): void;
  
  // Metric queries
  queryMetric(query: MetricQuery): Promise<MetricResult[]>;
  queryRange(query: MetricQuery, start: Date, end: Date, step: string): Promise<MetricTimeSeries[]>;
  
  // Alert management
  createAlertRule(rule: AlertRule): Promise<string>;
  getActiveAlerts(): Promise<Alert[]>;
}


interface MetricQuery {
  metric: string;
  labels?: Record<string, string>;
  aggregation?: AggregationType;
  groupBy?: string[];
}

enum AggregationType {
  SUM = 'sum',
  AVG = 'avg',
  MAX = 'max',
  MIN = 'min',
  COUNT = 'count',
  RATE = 'rate',
  PERCENTILE = 'percentile'
}

interface MetricResult {
  metric: string;
  labels: Record<string, string>;
  value: number;
  timestamp: Date;
}

interface MetricTimeSeries {
  metric: string;
  labels: Record<string, string>;
  values: TimeSeriesPoint[];
}

interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

interface AlertRule {
  name: string;
  expression: string;
  duration: string;
  severity: AlertSeverity;
  labels?: Record<string, string>;
  annotations?: Record<string, string>;
}

enum AlertSeverity {
  CRITICAL = 'critical',
  WARNING = 'warning',
  INFO = 'info'
}
```

### Distributed Tracing Service

```typescript
interface DistributedTracingService {
  // Span management
  startSpan(name: string, options?: SpanOptions): Span;
  getCurrentSpan(): Span | undefined;
  
  // Context propagation
  injectContext(carrier: Record<string, string>): void;
  extractContext(carrier: Record<string, string>): SpanContext | undefined;
  
  // Trace queries
  getTrace(traceId: string): Promise<Trace>;
  searchTraces(query: TraceQuery): Promise<TraceSummary[]>;
}

interface Span {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  operationName: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  status: SpanStatus;
  attributes: Record<string, unknown>;
  events: SpanEvent[];
  
  // Methods
  setAttribute(key: string, value: unknown): void;
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  setStatus(status: SpanStatus): void;
  end(): void;
}

interface SpanOptions {
  kind?: SpanKind;
  attributes?: Record<string, unknown>;
  links?: SpanLink[];
  startTime?: Date;
}

enum SpanKind {
  INTERNAL = 'internal',
  SERVER = 'server',
  CLIENT = 'client',
  PRODUCER = 'producer',
  CONSUMER = 'consumer'
}

enum SpanStatus {
  UNSET = 'unset',
  OK = 'ok',
  ERROR = 'error'
}

interface Trace {
  traceId: string;
  spans: Span[];
  rootSpan: Span;
  duration: number;
  services: string[];
}

interface TraceQuery {
  service?: string;
  operation?: string;
  tags?: Record<string, string>;
  minDuration?: number;
  maxDuration?: number;
  startTime: Date;
  endTime: Date;
  limit?: number;
}
```

### Log Aggregation Service

```typescript
interface LogAggregationService {
  // Log ingestion
  log(entry: LogEntry): void;
  logBatch(entries: LogEntry[]): void;
  
  // Log queries
  search(query: LogQuery): Promise<LogSearchResult>;
  tail(query: LogQuery, callback: (entry: LogEntry) => void): LogTailHandle;
  
  // Log analysis
  getLogPatterns(query: LogQuery): Promise<LogPattern[]>;
  getErrorRate(service: string, timeRange: TimeRange): Promise<number>;
}

interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  service: string;
  traceId?: string;
  spanId?: string;
  attributes?: Record<string, unknown>;
  stackTrace?: string;
}

enum LogLevel {
  TRACE = 'trace',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

interface LogQuery {
  query: string;
  services?: string[];
  levels?: LogLevel[];
  startTime: Date;
  endTime: Date;
  limit?: number;
  offset?: number;
}

interface LogSearchResult {
  entries: LogEntry[];
  total: number;
  hasMore: boolean;
}

interface LogPattern {
  pattern: string;
  count: number;
  examples: LogEntry[];
  firstSeen: Date;
  lastSeen: Date;
}
```

### Health Check Service

```typescript
interface HealthCheckService {
  // Health registration
  registerCheck(check: HealthCheck): void;
  unregisterCheck(name: string): void;
  
  // Health queries
  getHealth(): Promise<HealthStatus>;
  getComponentHealth(component: string): Promise<ComponentHealth>;
  
  // Readiness and liveness
  isReady(): Promise<boolean>;
  isLive(): Promise<boolean>;
}

interface HealthCheck {
  name: string;
  check: () => Promise<HealthCheckResult>;
  interval: number;
  timeout: number;
  critical?: boolean;
}

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  message?: string;
  details?: Record<string, unknown>;
  duration: number;
}

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: Record<string, HealthCheckResult>;
  timestamp: Date;
}

interface ComponentHealth {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: Date;
  history: HealthCheckResult[];
}
```


## Implementation Patterns

### OpenTelemetry Integration

```typescript
class OpenTelemetryManager {
  private tracerProvider: TracerProvider;
  private meterProvider: MeterProvider;
  private loggerProvider: LoggerProvider;

  initialize(config: OTelConfig): void {
    // Configure resource
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: config.serviceName,
      [SemanticResourceAttributes.SERVICE_VERSION]: config.serviceVersion,
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: config.environment
    });

    // Configure trace exporter
    const traceExporter = this.createTraceExporter(config.traceExporter);
    this.tracerProvider = new NodeTracerProvider({ resource });
    this.tracerProvider.addSpanProcessor(
      new BatchSpanProcessor(traceExporter, {
        maxQueueSize: 2048,
        maxExportBatchSize: 512,
        scheduledDelayMillis: 5000
      })
    );
    this.tracerProvider.register();

    // Configure metrics exporter
    const metricExporter = this.createMetricExporter(config.metricExporter);
    this.meterProvider = new MeterProvider({
      resource,
      readers: [
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 60000
        })
      ]
    });

    // Configure log exporter
    const logExporter = this.createLogExporter(config.logExporter);
    this.loggerProvider = new LoggerProvider({ resource });
    this.loggerProvider.addLogRecordProcessor(
      new BatchLogRecordProcessor(logExporter)
    );

    // Register auto-instrumentation
    registerInstrumentations({
      tracerProvider: this.tracerProvider,
      meterProvider: this.meterProvider,
      instrumentations: [
        new HttpInstrumentation(),
        new ExpressInstrumentation(),
        new PgInstrumentation(),
        new RedisInstrumentation()
      ]
    });
  }

  private createTraceExporter(config: ExporterConfig): SpanExporter {
    switch (config.type) {
      case 'otlp':
        return new OTLPTraceExporter({
          url: config.endpoint,
          headers: config.headers
        });
      case 'jaeger':
        return new JaegerExporter({
          endpoint: config.endpoint
        });
      default:
        return new ConsoleSpanExporter();
    }
  }
}
```

### Prometheus Metrics Implementation

```typescript
class PrometheusMetricsManager {
  private registry: Registry;
  private metrics: Map<string, Metric> = new Map();

  constructor() {
    this.registry = new Registry();
    this.initializeDefaultMetrics();
  }

  private initializeDefaultMetrics(): void {
    // HTTP request metrics
    this.createHistogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10]
    });

    this.createCounter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code']
    });

    // Application metrics
    this.createGauge({
      name: 'app_active_connections',
      help: 'Number of active connections',
      labelNames: ['type']
    });

    // Business metrics
    this.createCounter({
      name: 'business_events_total',
      help: 'Total number of business events',
      labelNames: ['event_type', 'status']
    });

    // Enable default Node.js metrics
    collectDefaultMetrics({ register: this.registry });
  }

  createHistogram(config: HistogramConfig): Histogram {
    const histogram = new Histogram({
      name: config.name,
      help: config.help,
      labelNames: config.labelNames,
      buckets: config.buckets,
      registers: [this.registry]
    });
    this.metrics.set(config.name, histogram);
    return histogram;
  }

  createCounter(config: CounterConfig): Counter {
    const counter = new Counter({
      name: config.name,
      help: config.help,
      labelNames: config.labelNames,
      registers: [this.registry]
    });
    this.metrics.set(config.name, counter);
    return counter;
  }

  createGauge(config: GaugeConfig): Gauge {
    const gauge = new Gauge({
      name: config.name,
      help: config.help,
      labelNames: config.labelNames,
      registers: [this.registry]
    });
    this.metrics.set(config.name, gauge);
    return gauge;
  }

  // Express middleware for automatic HTTP metrics
  httpMetricsMiddleware(): RequestHandler {
    return (req, res, next) => {
      const start = process.hrtime.bigint();
      
      res.on('finish', () => {
        const duration = Number(process.hrtime.bigint() - start) / 1e9;
        const labels = {
          method: req.method,
          route: req.route?.path || req.path,
          status_code: String(res.statusCode)
        };

        this.getHistogram('http_request_duration_seconds').observe(labels, duration);
        this.getCounter('http_requests_total').inc(labels);
      });

      next();
    };
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
```

### Structured Logging Implementation

```typescript
class StructuredLogger {
  private logger: Logger;
  private defaultContext: Record<string, unknown>;

  constructor(config: LoggerConfig) {
    this.logger = pino({
      level: config.level || 'info',
      formatters: {
        level: (label) => ({ level: label }),
        bindings: (bindings) => ({
          pid: bindings.pid,
          host: bindings.hostname,
          service: config.serviceName
        })
      },
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: config.redactPaths || ['password', 'token', 'secret', 'authorization']
    });

    this.defaultContext = {
      service: config.serviceName,
      version: config.serviceVersion,
      environment: config.environment
    };
  }

  // Context-aware logging
  child(context: Record<string, unknown>): StructuredLogger {
    const childLogger = new StructuredLogger({} as LoggerConfig);
    childLogger.logger = this.logger.child(context);
    childLogger.defaultContext = { ...this.defaultContext, ...context };
    return childLogger;
  }

  // Trace-correlated logging
  withTrace(traceId: string, spanId: string): StructuredLogger {
    return this.child({ traceId, spanId });
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.logger.info({ ...this.defaultContext, ...context }, message);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.logger.warn({ ...this.defaultContext, ...context }, message);
  }

  error(message: string, error?: Error, context?: Record<string, unknown>): void {
    this.logger.error({
      ...this.defaultContext,
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : undefined
    }, message);
  }

  // Request logging middleware
  requestLogger(): RequestHandler {
    return (req, res, next) => {
      const requestId = req.headers['x-request-id'] || crypto.randomUUID();
      const start = Date.now();

      // Add request context
      req.log = this.child({
        requestId,
        method: req.method,
        path: req.path,
        userAgent: req.headers['user-agent']
      });

      res.on('finish', () => {
        const duration = Date.now() - start;
        req.log.info('Request completed', {
          statusCode: res.statusCode,
          duration,
          contentLength: res.get('content-length')
        });
      });

      next();
    };
  }
}
```


## Integration Points

### Grafana Dashboard Integration

```typescript
class GrafanaDashboardGenerator {
  generateServiceDashboard(config: DashboardConfig): GrafanaDashboard {
    return {
      title: `${config.serviceName} Service Dashboard`,
      uid: `${config.serviceName}-dashboard`,
      tags: ['service', config.serviceName],
      timezone: 'browser',
      refresh: '30s',
      panels: [
        this.createRequestRatePanel(config),
        this.createLatencyPanel(config),
        this.createErrorRatePanel(config),
        this.createResourceUsagePanel(config),
        this.createTracePanel(config),
        this.createLogPanel(config)
      ],
      templating: {
        list: [
          {
            name: 'instance',
            type: 'query',
            datasource: 'Prometheus',
            query: `label_values(up{job="${config.serviceName}"}, instance)`
          }
        ]
      }
    };
  }

  private createRequestRatePanel(config: DashboardConfig): Panel {
    return {
      title: 'Request Rate',
      type: 'timeseries',
      gridPos: { x: 0, y: 0, w: 8, h: 8 },
      targets: [{
        expr: `sum(rate(http_requests_total{service="${config.serviceName}"}[5m])) by (status_code)`,
        legendFormat: '{{status_code}}'
      }],
      fieldConfig: {
        defaults: {
          unit: 'reqps',
          custom: {
            drawStyle: 'line',
            lineInterpolation: 'smooth'
          }
        }
      }
    };
  }

  private createLatencyPanel(config: DashboardConfig): Panel {
    return {
      title: 'Request Latency',
      type: 'timeseries',
      gridPos: { x: 8, y: 0, w: 8, h: 8 },
      targets: [
        {
          expr: `histogram_quantile(0.50, sum(rate(http_request_duration_seconds_bucket{service="${config.serviceName}"}[5m])) by (le))`,
          legendFormat: 'p50'
        },
        {
          expr: `histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket{service="${config.serviceName}"}[5m])) by (le))`,
          legendFormat: 'p95'
        },
        {
          expr: `histogram_quantile(0.99, sum(rate(http_request_duration_seconds_bucket{service="${config.serviceName}"}[5m])) by (le))`,
          legendFormat: 'p99'
        }
      ],
      fieldConfig: {
        defaults: {
          unit: 's',
          custom: {
            drawStyle: 'line',
            lineInterpolation: 'smooth'
          }
        }
      }
    };
  }
}
```

### PagerDuty Alert Integration

```typescript
class AlertingIntegration {
  private pagerduty: PagerDutyClient;
  private slack: SlackClient;

  async sendAlert(alert: Alert): Promise<void> {
    // Route based on severity
    switch (alert.severity) {
      case AlertSeverity.CRITICAL:
        await this.createPagerDutyIncident(alert);
        await this.sendSlackAlert(alert, '#incidents');
        break;
      case AlertSeverity.WARNING:
        await this.sendSlackAlert(alert, '#alerts');
        break;
      case AlertSeverity.INFO:
        await this.sendSlackAlert(alert, '#monitoring');
        break;
    }
  }

  private async createPagerDutyIncident(alert: Alert): Promise<string> {
    const incident = await this.pagerduty.createIncident({
      incident: {
        type: 'incident',
        title: alert.name,
        service: {
          id: this.getServiceId(alert.labels?.service),
          type: 'service_reference'
        },
        urgency: alert.severity === AlertSeverity.CRITICAL ? 'high' : 'low',
        body: {
          type: 'incident_body',
          details: this.formatAlertDetails(alert)
        }
      }
    });

    return incident.incident.id;
  }

  private async sendSlackAlert(alert: Alert, channel: string): Promise<void> {
    await this.slack.chat.postMessage({
      channel,
      attachments: [{
        color: this.getSeverityColor(alert.severity),
        title: alert.name,
        text: alert.annotations?.description || alert.annotations?.summary,
        fields: [
          { title: 'Severity', value: alert.severity, short: true },
          { title: 'Service', value: alert.labels?.service || 'unknown', short: true },
          { title: 'Started', value: alert.startsAt.toISOString(), short: true }
        ],
        actions: [
          {
            type: 'button',
            text: 'View in Grafana',
            url: alert.generatorURL
          },
          {
            type: 'button',
            text: 'Runbook',
            url: alert.annotations?.runbook_url
          }
        ]
      }]
    });
  }
}
```

## Security Considerations

### Secure Metrics Exposure

```typescript
class SecureMetricsServer {
  private server: Server;

  async start(config: MetricsServerConfig): Promise<void> {
    const app = express();

    // Authentication middleware
    if (config.authentication) {
      app.use('/metrics', this.authMiddleware(config.authentication));
    }

    // Rate limiting
    app.use('/metrics', rateLimit({
      windowMs: 60000,
      max: config.rateLimit || 100
    }));

    // Metrics endpoint
    app.get('/metrics', async (req, res) => {
      try {
        const metrics = await this.metricsManager.getMetrics();
        res.set('Content-Type', 'text/plain');
        res.send(metrics);
      } catch (error) {
        res.status(500).send('Error collecting metrics');
      }
    });

    // Health endpoints (no auth required)
    app.get('/health', (req, res) => res.json({ status: 'healthy' }));
    app.get('/ready', async (req, res) => {
      const ready = await this.healthService.isReady();
      res.status(ready ? 200 : 503).json({ ready });
    });

    this.server = app.listen(config.port);
  }

  private authMiddleware(config: AuthConfig): RequestHandler {
    return (req, res, next) => {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token || token !== config.token) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      next();
    };
  }
}
```

### Log Sanitization

```typescript
class LogSanitizer {
  private sensitivePatterns: RegExp[] = [
    /password['":\s]*['"]?[\w\-!@#$%^&*]+['"]?/gi,
    /bearer\s+[\w\-._~+/]+=*/gi,
    /api[_-]?key['":\s]*['"]?[\w\-]+['"]?/gi,
    /\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/g, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g // Email
  ];

  sanitize(data: unknown): unknown {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }
    
    if (Array.isArray(data)) {
      return data.map(item => this.sanitize(item));
    }
    
    if (typeof data === 'object' && data !== null) {
      return this.sanitizeObject(data as Record<string, unknown>);
    }
    
    return data;
  }

  private sanitizeString(str: string): string {
    let result = str;
    for (const pattern of this.sensitivePatterns) {
      result = result.replace(pattern, '[REDACTED]');
    }
    return result;
  }

  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    const sensitiveKeys = ['password', 'secret', 'token', 'apiKey', 'authorization', 'creditCard'];
    const result: Record<string, unknown> = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (sensitiveKeys.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else {
        result[key] = this.sanitize(value);
      }
    }
    
    return result;
  }
}
```

## Testing Considerations

### Observability Testing

```typescript
describe('Observability Tests', () => {
  it('should record metrics correctly', async () => {
    const metricsManager = new PrometheusMetricsManager();
    
    metricsManager.getCounter('http_requests_total').inc({
      method: 'GET',
      route: '/api/users',
      status_code: '200'
    });

    const metrics = await metricsManager.getMetrics();
    expect(metrics).toContain('http_requests_total');
    expect(metrics).toContain('method="GET"');
  });

  it('should propagate trace context', () => {
    const tracer = new OpenTelemetryManager();
    const span = tracer.startSpan('test-operation');
    
    const carrier: Record<string, string> = {};
    tracer.injectContext(carrier);
    
    expect(carrier['traceparent']).toBeDefined();
    span.end();
  });

  it('should sanitize sensitive data in logs', () => {
    const sanitizer = new LogSanitizer();
    const data = {
      user: 'john',
      password: 'secret123',
      apiKey: 'sk-12345'
    };

    const sanitized = sanitizer.sanitize(data);
    expect(sanitized.password).toBe('[REDACTED]');
    expect(sanitized.apiKey).toBe('[REDACTED]');
    expect(sanitized.user).toBe('john');
  });
});
```

## Configuration Examples

### Prometheus Alert Rules

```yaml
groups:
  - name: service-alerts
    rules:
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status_code=~"5.."}[5m])) 
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: High error rate detected
          description: Error rate is {{ $value | humanizePercentage }}

      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: High latency detected
          description: 95th percentile latency is {{ $value }}s

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: Service is down
          description: "{{ $labels.instance }} has been down for more than 1 minute"
```

### Fluentd Log Configuration

```yaml
<source>
  @type tail
  path /var/log/containers/*.log
  pos_file /var/log/fluentd-containers.log.pos
  tag kubernetes.*
  read_from_head true
  <parse>
    @type json
    time_key time
    time_format %Y-%m-%dT%H:%M:%S.%NZ
  </parse>
</source>

<filter kubernetes.**>
  @type kubernetes_metadata
</filter>

<filter kubernetes.**>
  @type record_transformer
  <record>
    cluster_name "#{ENV['CLUSTER_NAME']}"
    environment "#{ENV['ENVIRONMENT']}"
  </record>
</filter>

<match kubernetes.**>
  @type elasticsearch
  host elasticsearch.logging.svc.cluster.local
  port 9200
  logstash_format true
  logstash_prefix kubernetes
  include_tag_key true
  type_name _doc
  <buffer>
    @type file
    path /var/log/fluentd-buffers/kubernetes.buffer
    flush_mode interval
    flush_interval 5s
    retry_type exponential_backoff
  </buffer>
</match>
```
