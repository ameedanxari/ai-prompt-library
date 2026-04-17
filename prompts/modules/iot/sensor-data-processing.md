# Sensor Data Processing Template

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

This template provides comprehensive patterns for implementing sensor data ingestion, validation, real-time processing, and storage in IoT applications. It covers data pipelines, stream processing, data quality management, and efficient storage strategies for high-volume sensor data.

## Context

IoT sensor data processing requires handling high-velocity data streams from diverse sensors while ensuring data quality, low latency, and efficient storage. This template addresses the implementation of data processing pipelines that can scale to millions of data points while maintaining data integrity and enabling real-time analytics.

## Core Components

### Sensor Data Ingestion Service

## Examples

```typescript
interface SensorDataIngestionService {
  ingestData(data: SensorReading[]): Promise<IngestionResult>;
  ingestStream(stream: AsyncIterable<SensorReading>): Promise<StreamIngestionResult>;
  configureIngestion(config: IngestionConfig): Promise<void>;
  getIngestionMetrics(): Promise<IngestionMetrics>;
  pauseIngestion(sourceId: string): Promise<void>;
  resumeIngestion(sourceId: string): Promise<void>;
}

interface SensorReading {
  sensorId: string;
  deviceId: string;
  timestamp: Date;
  value: number | string | boolean | Record<string, unknown>;
  unit?: string;
  quality?: DataQuality;
  metadata?: SensorMetadata;
}

interface SensorMetadata {
  location?: GeoLocation;
  sensorType: SensorType;
  manufacturer?: string;
  calibrationDate?: Date;
  accuracy?: number;
  tags?: Record<string, string>;
}

enum SensorType {
  TEMPERATURE = 'temperature',
  HUMIDITY = 'humidity',
  PRESSURE = 'pressure',
  MOTION = 'motion',
  LIGHT = 'light',
  SOUND = 'sound',
  VIBRATION = 'vibration',
  GAS = 'gas',
  FLOW = 'flow',
  LEVEL = 'level',
  POWER = 'power',
  VOLTAGE = 'voltage',
  CURRENT = 'current',
  GPS = 'gps',
  ACCELEROMETER = 'accelerometer',
  GYROSCOPE = 'gyroscope',
  CUSTOM = 'custom'
}

enum DataQuality {
  GOOD = 'good',
  UNCERTAIN = 'uncertain',
  BAD = 'bad',
  MISSING = 'missing',
  INTERPOLATED = 'interpolated'
}

interface IngestionConfig {
  batchSize: number;
  flushInterval: number;
  maxBufferSize: number;
  compressionEnabled: boolean;
  validationEnabled: boolean;
  deduplicationEnabled: boolean;
  backpressureStrategy: BackpressureStrategy;
}

enum BackpressureStrategy {
  BLOCK = 'block',
  DROP_OLDEST = 'drop_oldest',
  DROP_NEWEST = 'drop_newest',
  SAMPLE = 'sample'
}

interface IngestionResult {
  accepted: number;
  rejected: number;
  duplicates: number;
  errors: IngestionError[];
  latency: number;
}
```

### Data Validation Service

```typescript
interface DataValidationService {
  validateReading(reading: SensorReading): Promise<ValidationResult>;
  validateBatch(readings: SensorReading[]): Promise<BatchValidationResult>;
  setValidationRules(sensorId: string, rules: ValidationRule[]): Promise<void>;
  getValidationRules(sensorId: string): Promise<ValidationRule[]>;
  getValidationStats(sensorId: string): Promise<ValidationStats>;
}

interface ValidationRule {
  id: string;
  name: string;
  type: ValidationRuleType;
  parameters: ValidationParameters;
  severity: ValidationSeverity;
  action: ValidationAction;
}

enum ValidationRuleType {
  RANGE = 'range',
  RATE_OF_CHANGE = 'rate_of_change',
  PATTERN = 'pattern',
  CONSISTENCY = 'consistency',
  COMPLETENESS = 'completeness',
  TIMELINESS = 'timeliness',
  CUSTOM = 'custom'
}

interface ValidationParameters {
  minValue?: number;
  maxValue?: number;
  maxRateOfChange?: number;
  pattern?: string;
  requiredFields?: string[];
  maxLatency?: number;
  customValidator?: string;
}

enum ValidationSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

enum ValidationAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
  FLAG = 'flag',
  CORRECT = 'correct',
  INTERPOLATE = 'interpolate'
}

interface ValidationResult {
  valid: boolean;
  reading: SensorReading;
  violations: ValidationViolation[];
  correctedValue?: unknown;
  quality: DataQuality;
}

interface ValidationViolation {
  ruleId: string;
  ruleName: string;
  severity: ValidationSeverity;
  message: string;
  actualValue: unknown;
  expectedRange?: { min: number; max: number };
}
```

### Stream Processing Service

```typescript
interface StreamProcessingService {
  createProcessor(config: ProcessorConfig): Promise<StreamProcessor>;
  startProcessor(processorId: string): Promise<void>;
  stopProcessor(processorId: string): Promise<void>;
  getProcessorStatus(processorId: string): Promise<ProcessorStatus>;
  updateProcessor(processorId: string, config: Partial<ProcessorConfig>): Promise<void>;
}

interface ProcessorConfig {
  id: string;
  name: string;
  inputTopics: string[];
  outputTopics: string[];
  operations: StreamOperation[];
  windowConfig?: WindowConfig;
  checkpointConfig?: CheckpointConfig;
  parallelism?: number;
}

interface StreamOperation {
  type: OperationType;
  config: OperationConfig;
}

enum OperationType {
  MAP = 'map',
  FILTER = 'filter',
  AGGREGATE = 'aggregate',
  JOIN = 'join',
  WINDOW = 'window',
  ENRICH = 'enrich',
  DEDUPLICATE = 'deduplicate',
  CUSTOM = 'custom'
}

interface WindowConfig {
  type: WindowType;
  size: number;
  sizeUnit: TimeUnit;
  slide?: number;
  slideUnit?: TimeUnit;
  allowedLateness?: number;
  latenessUnit?: TimeUnit;
}

enum WindowType {
  TUMBLING = 'tumbling',
  SLIDING = 'sliding',
  SESSION = 'session',
  COUNT = 'count'
}

enum TimeUnit {
  MILLISECONDS = 'milliseconds',
  SECONDS = 'seconds',
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days'
}

interface StreamProcessor {
  id: string;
  status: ProcessorStatus;
  process(reading: SensorReading): Promise<ProcessedReading[]>;
  processBatch(readings: SensorReading[]): Promise<ProcessedReading[]>;
  getMetrics(): ProcessorMetrics;
}

interface ProcessedReading {
  originalReading: SensorReading;
  processedValue: unknown;
  processingTimestamp: Date;
  operations: string[];
  metadata: Record<string, unknown>;
}
```

### Time Series Storage Service

```typescript
interface TimeSeriesStorageService {
  store(readings: SensorReading[]): Promise<StorageResult>;
  query(query: TimeSeriesQuery): Promise<TimeSeriesResult>;
  aggregate(query: AggregationQuery): Promise<AggregationResult>;
  deleteData(filter: DeleteFilter): Promise<DeleteResult>;
  getStorageStats(): Promise<StorageStats>;
  configureRetention(policy: RetentionPolicy): Promise<void>;
}

interface TimeSeriesQuery {
  sensorIds?: string[];
  deviceIds?: string[];
  startTime: Date;
  endTime: Date;
  limit?: number;
  offset?: number;
  orderBy?: 'asc' | 'desc';
  filters?: QueryFilter[];
  downsample?: DownsampleConfig;
}

interface DownsampleConfig {
  interval: number;
  intervalUnit: TimeUnit;
  aggregation: AggregationType;
}

enum AggregationType {
  AVG = 'avg',
  SUM = 'sum',
  MIN = 'min',
  MAX = 'max',
  COUNT = 'count',
  FIRST = 'first',
  LAST = 'last',
  STDDEV = 'stddev',
  VARIANCE = 'variance',
  PERCENTILE = 'percentile'
}

interface AggregationQuery {
  sensorIds?: string[];
  startTime: Date;
  endTime: Date;
  groupBy: GroupByConfig;
  aggregations: AggregationSpec[];
  filters?: QueryFilter[];
}

interface GroupByConfig {
  time?: {
    interval: number;
    unit: TimeUnit;
  };
  tags?: string[];
}

interface AggregationSpec {
  field: string;
  type: AggregationType;
  alias?: string;
  percentile?: number;
}

interface TimeSeriesResult {
  readings: SensorReading[];
  totalCount: number;
  hasMore: boolean;
  queryTime: number;
}

interface RetentionPolicy {
  defaultRetention: number;
  retentionUnit: TimeUnit;
  tierPolicies?: TierPolicy[];
  compressionEnabled: boolean;
}

interface TierPolicy {
  name: string;
  afterDays: number;
  downsampleInterval?: number;
  downsampleUnit?: TimeUnit;
  aggregation?: AggregationType;
  storageClass?: string;
}
```

## Implementation Patterns

### High-Throughput Data Ingestion

```typescript
class HighThroughputIngestionService implements SensorDataIngestionService {
  private buffer: SensorReading[] = [];
  private config: IngestionConfig;
  private validationService: DataValidationService;
  private storageService: TimeSeriesStorageService;
  private metrics: IngestionMetrics;

  async ingestData(data: SensorReading[]): Promise<IngestionResult> {
    const startTime = Date.now();
    const result: IngestionResult = {
      accepted: 0,
      rejected: 0,
      duplicates: 0,
      errors: [],
      latency: 0
    };

    // Validate and deduplicate
    const validatedData: SensorReading[] = [];
    for (const reading of data) {
      try {
        // Deduplication check
        if (this.config.deduplicationEnabled && await this.isDuplicate(reading)) {
          result.duplicates++;
          continue;
        }

        // Validation
        if (this.config.validationEnabled) {
          const validation = await this.validationService.validateReading(reading);
          if (!validation.valid) {
            result.rejected++;
            result.errors.push({
              reading,
              reason: validation.violations.map(v => v.message).join(', ')
            });
            continue;
          }
          reading.quality = validation.quality;
        }

        validatedData.push(reading);
        result.accepted++;
      } catch (error) {
        result.rejected++;
        result.errors.push({
          reading,
          reason: (error as Error).message
        });
      }
    }

    // Add to buffer
    this.buffer.push(...validatedData);

    // Flush if buffer is full
    if (this.buffer.length >= this.config.batchSize) {
      await this.flushBuffer();
    }

    result.latency = Date.now() - startTime;
    this.updateMetrics(result);
    return result;
  }

  async ingestStream(stream: AsyncIterable<SensorReading>): Promise<StreamIngestionResult> {
    const result: StreamIngestionResult = {
      totalProcessed: 0,
      accepted: 0,
      rejected: 0,
      duplicates: 0,
      errors: [],
      startTime: new Date(),
      endTime: new Date()
    };

    const batch: SensorReading[] = [];

    for await (const reading of stream) {
      batch.push(reading);

      if (batch.length >= this.config.batchSize) {
        const batchResult = await this.ingestData(batch);
        result.totalProcessed += batch.length;
        result.accepted += batchResult.accepted;
        result.rejected += batchResult.rejected;
        result.duplicates += batchResult.duplicates;
        result.errors.push(...batchResult.errors);
        batch.length = 0;
      }
    }

    // Process remaining
    if (batch.length > 0) {
      const batchResult = await this.ingestData(batch);
      result.totalProcessed += batch.length;
      result.accepted += batchResult.accepted;
      result.rejected += batchResult.rejected;
      result.duplicates += batchResult.duplicates;
      result.errors.push(...batchResult.errors);
    }

    result.endTime = new Date();
    return result;
  }

  private async flushBuffer(): Promise<void> {
    if (this.buffer.length === 0) return;

    const toFlush = this.buffer.splice(0, this.config.batchSize);

    // Compress if enabled
    const data = this.config.compressionEnabled
      ? await this.compress(toFlush)
      : toFlush;

    await this.storageService.store(data);
  }

  private async isDuplicate(reading: SensorReading): Promise<boolean> {
    const key = `${reading.sensorId}:${reading.timestamp.getTime()}`;
    return this.deduplicationCache.has(key);
  }
}
```

### Real-Time Stream Processing

```typescript
class RealTimeStreamProcessor implements StreamProcessingService {
  private processors: Map<string, StreamProcessor> = new Map();
  private operationRegistry: OperationRegistry;

  async createProcessor(config: ProcessorConfig): Promise<StreamProcessor> {
    const operations = config.operations.map(op =>
      this.operationRegistry.create(op.type, op.config)
    );

    const processor: StreamProcessor = {
      id: config.id,
      status: 'stopped',

      process: async (reading: SensorReading): Promise<ProcessedReading[]> => {
        let current: unknown[] = [reading];

        for (const operation of operations) {
          current = await this.applyOperation(operation, current);
        }

        return current.map(value => ({
          originalReading: reading,
          processedValue: value,
          processingTimestamp: new Date(),
          operations: config.operations.map(o => o.type),
          metadata: {}
        }));
      },

      processBatch: async (readings: SensorReading[]): Promise<ProcessedReading[]> => {
        const results: ProcessedReading[] = [];

        // Apply windowing if configured
        if (config.windowConfig) {
          const windows = this.createWindows(readings, config.windowConfig);
          for (const window of windows) {
            const windowResults = await this.processWindow(window, operations);
            results.push(...windowResults);
          }
        } else {
          for (const reading of readings) {
            const processed = await processor.process(reading);
            results.push(...processed);
          }
        }

        return results;
      },

      getMetrics: () => this.getProcessorMetrics(config.id)
    };

    this.processors.set(config.id, processor);
    return processor;
  }

  private async applyOperation(operation: Operation, data: unknown[]): Promise<unknown[]> {
    switch (operation.type) {
      case OperationType.MAP:
        return data.map(item => operation.transform(item));

      case OperationType.FILTER:
        return data.filter(item => operation.predicate(item));

      case OperationType.AGGREGATE:
        return [operation.aggregate(data)];

      case OperationType.ENRICH:
        return Promise.all(data.map(item => operation.enrich(item)));

      case OperationType.DEDUPLICATE:
        return this.deduplicate(data, operation.keyExtractor);

      default:
        return operation.process(data);
    }
  }

  private createWindows(readings: SensorReading[], config: WindowConfig): SensorReading[][] {
    const windows: SensorReading[][] = [];
    const windowSizeMs = this.toMilliseconds(config.size, config.sizeUnit);

    switch (config.type) {
      case WindowType.TUMBLING:
        return this.createTumblingWindows(readings, windowSizeMs);

      case WindowType.SLIDING:
        const slideSizeMs = this.toMilliseconds(config.slide!, config.slideUnit!);
        return this.createSlidingWindows(readings, windowSizeMs, slideSizeMs);

      case WindowType.SESSION:
        return this.createSessionWindows(readings, windowSizeMs);

      case WindowType.COUNT:
        return this.createCountWindows(readings, config.size);

      default:
        return [readings];
    }
  }

  private createTumblingWindows(readings: SensorReading[], windowSizeMs: number): SensorReading[][] {
    const sorted = [...readings].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const windows: SensorReading[][] = [];
    let currentWindow: SensorReading[] = [];
    let windowStart = sorted[0]?.timestamp.getTime() || 0;

    for (const reading of sorted) {
      const readingTime = reading.timestamp.getTime();

      if (readingTime >= windowStart + windowSizeMs) {
        if (currentWindow.length > 0) {
          windows.push(currentWindow);
        }
        currentWindow = [];
        windowStart = Math.floor(readingTime / windowSizeMs) * windowSizeMs;
      }

      currentWindow.push(reading);
    }

    if (currentWindow.length > 0) {
      windows.push(currentWindow);
    }

    return windows;
  }
}
```

### Efficient Time Series Storage

```typescript
class OptimizedTimeSeriesStorage implements TimeSeriesStorageService {
  private primaryStore: TimeSeriesDatabase;
  private compressionEngine: CompressionEngine;
  private indexManager: IndexManager;
  private retentionManager: RetentionManager;

  async store(readings: SensorReading[]): Promise<StorageResult> {
    const startTime = Date.now();

    // Group by sensor for efficient storage
    const grouped = this.groupBySensor(readings);

    const results: StorageResult = {
      stored: 0,
      failed: 0,
      compressed: 0,
      errors: []
    };

    for (const [sensorId, sensorReadings] of grouped) {
      try {
        // Compress readings
        const compressed = await this.compressionEngine.compress(sensorReadings);
        results.compressed += sensorReadings.length - compressed.length;

        // Store in time series database
        await this.primaryStore.write(sensorId, compressed);

        // Update indexes
        await this.indexManager.updateIndexes(sensorId, sensorReadings);

        results.stored += sensorReadings.length;
      } catch (error) {
        results.failed += sensorReadings.length;
        results.errors.push({
          sensorId,
          error: (error as Error).message
        });
      }
    }

    results.latency = Date.now() - startTime;
    return results;
  }

  async query(query: TimeSeriesQuery): Promise<TimeSeriesResult> {
    const startTime = Date.now();

    // Build query plan
    const plan = this.buildQueryPlan(query);

    // Execute query
    let readings: SensorReading[] = [];

    if (query.downsample) {
      readings = await this.executeDownsampledQuery(plan, query.downsample);
    } else {
      readings = await this.executeQuery(plan);
    }

    // Apply filters
    if (query.filters) {
      readings = this.applyFilters(readings, query.filters);
    }

    // Apply ordering
    readings.sort((a, b) => {
      const diff = a.timestamp.getTime() - b.timestamp.getTime();
      return query.orderBy === 'desc' ? -diff : diff;
    });

    // Apply pagination
    const totalCount = readings.length;
    if (query.offset) {
      readings = readings.slice(query.offset);
    }
    if (query.limit) {
      readings = readings.slice(0, query.limit);
    }

    return {
      readings,
      totalCount,
      hasMore: totalCount > (query.offset || 0) + readings.length,
      queryTime: Date.now() - startTime
    };
  }

  async aggregate(query: AggregationQuery): Promise<AggregationResult> {
    const readings = await this.query({
      sensorIds: query.sensorIds,
      startTime: query.startTime,
      endTime: query.endTime,
      filters: query.filters
    });

    // Group data
    const groups = this.groupData(readings.readings, query.groupBy);

    // Calculate aggregations
    const results: AggregationResultRow[] = [];

    for (const [groupKey, groupReadings] of groups) {
      const row: AggregationResultRow = {
        groupKey,
        values: {}
      };

      for (const spec of query.aggregations) {
        const values = groupReadings.map(r => this.extractValue(r, spec.field));
        row.values[spec.alias || `${spec.type}_${spec.field}`] = this.calculateAggregation(
          values,
          spec.type,
          spec.percentile
        );
      }

      results.push(row);
    }

    return {
      rows: results,
      totalGroups: results.length,
      queryTime: readings.queryTime
    };
  }

  private calculateAggregation(values: number[], type: AggregationType, percentile?: number): number {
    if (values.length === 0) return 0;

    switch (type) {
      case AggregationType.AVG:
        return values.reduce((a, b) => a + b, 0) / values.length;
      case AggregationType.SUM:
        return values.reduce((a, b) => a + b, 0);
      case AggregationType.MIN:
        return Math.min(...values);
      case AggregationType.MAX:
        return Math.max(...values);
      case AggregationType.COUNT:
        return values.length;
      case AggregationType.FIRST:
        return values[0];
      case AggregationType.LAST:
        return values[values.length - 1];
      case AggregationType.STDDEV:
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(squareDiffs.reduce((a, b) => a + b, 0) / values.length);
      case AggregationType.PERCENTILE:
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.ceil((percentile! / 100) * sorted.length) - 1;
        return sorted[Math.max(0, index)];
      default:
        return 0;
    }
  }
}
```

## Integration Points

### Apache Kafka Integration

```typescript
class KafkaSensorDataIngestion {
  private kafkaConsumer: KafkaConsumer;
  private ingestionService: SensorDataIngestionService;

  async startConsumer(config: KafkaConsumerConfig): Promise<void> {
    this.kafkaConsumer = new KafkaConsumer({
      brokers: config.brokers,
      groupId: config.groupId,
      topics: config.topics
    });

    await this.kafkaConsumer.subscribe(config.topics);

    await this.kafkaConsumer.run({
      eachBatch: async ({ batch }) => {
        const readings: SensorReading[] = batch.messages.map(message => {
          const data = JSON.parse(message.value!.toString());
          return {
            sensorId: data.sensorId,
            deviceId: data.deviceId,
            timestamp: new Date(data.timestamp),
            value: data.value,
            unit: data.unit,
            metadata: data.metadata
          };
        });

        await this.ingestionService.ingestData(readings);
      }
    });
  }
}
```

### InfluxDB Integration

```typescript
class InfluxDBTimeSeriesStorage implements TimeSeriesStorageService {
  private influxClient: InfluxDB;
  private writeApi: WriteApi;
  private queryApi: QueryApi;

  async store(readings: SensorReading[]): Promise<StorageResult> {
    const points = readings.map(reading => {
      const point = new Point(reading.sensorType || 'sensor_reading')
        .tag('sensorId', reading.sensorId)
        .tag('deviceId', reading.deviceId)
        .timestamp(reading.timestamp);

      if (typeof reading.value === 'number') {
        point.floatField('value', reading.value);
      } else if (typeof reading.value === 'boolean') {
        point.booleanField('value', reading.value);
      } else {
        point.stringField('value', JSON.stringify(reading.value));
      }

      if (reading.unit) {
        point.tag('unit', reading.unit);
      }

      if (reading.quality) {
        point.tag('quality', reading.quality);
      }

      return point;
    });

    this.writeApi.writePoints(points);
    await this.writeApi.flush();

    return {
      stored: readings.length,
      failed: 0,
      compressed: 0,
      errors: [],
      latency: 0
    };
  }

  async query(query: TimeSeriesQuery): Promise<TimeSeriesResult> {
    const fluxQuery = this.buildFluxQuery(query);
    const readings: SensorReading[] = [];

    const result = await this.queryApi.collectRows(fluxQuery);

    for (const row of result) {
      readings.push({
        sensorId: row.sensorId,
        deviceId: row.deviceId,
        timestamp: new Date(row._time),
        value: row._value,
        unit: row.unit,
        quality: row.quality as DataQuality
      });
    }

    return {
      readings,
      totalCount: readings.length,
      hasMore: false,
      queryTime: 0
    };
  }

  private buildFluxQuery(query: TimeSeriesQuery): string {
    let flux = `from(bucket: "${this.bucket}")
      |> range(start: ${query.startTime.toISOString()}, stop: ${query.endTime.toISOString()})`;

    if (query.sensorIds && query.sensorIds.length > 0) {
      flux += `\n|> filter(fn: (r) => ${query.sensorIds.map(id => `r.sensorId == "${id}"`).join(' or ')})`;
    }

    if (query.downsample) {
      flux += `\n|> aggregateWindow(every: ${query.downsample.interval}${query.downsample.intervalUnit[0]}, fn: ${query.downsample.aggregation})`;
    }

    if (query.limit) {
      flux += `\n|> limit(n: ${query.limit})`;
    }

    return flux;
  }
}
```

## Security Considerations

### Data Security

- Encrypt sensor data in transit using TLS
- Encrypt sensitive sensor data at rest
- Implement data masking for PII in sensor metadata
- Use secure key management for encryption keys

### Access Control

- Implement fine-grained access control for sensor data
- Use role-based access for data queries
- Audit all data access operations
- Implement data classification and handling policies

### Data Integrity

- Validate data checksums for integrity verification
- Implement tamper detection for critical sensor data
- Use digital signatures for high-value data streams

## Compliance Guidelines

- GDPR considerations for location and personal sensor data
- Industry-specific regulations (FDA for medical devices, NERC for energy)
- Data retention and deletion requirements
- Cross-border data transfer regulations

## Testing Considerations

### Property-Based Tests

```typescript
describe('Sensor Data Processing Properties', () => {
  it('should preserve data integrity through processing pipeline', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        sensorId: fc.string({ minLength: 1, maxLength: 32 }),
        deviceId: fc.string({ minLength: 1, maxLength: 32 }),
        timestamp: fc.date(),
        value: fc.float({ min: -1000, max: 1000 })
      }), { minLength: 1, maxLength: 100 }),
      async (readings) => {
        const ingestionService = new HighThroughputIngestionService();
        const result = await ingestionService.ingestData(readings);

        // All readings should be either accepted or rejected
        expect(result.accepted + result.rejected + result.duplicates).toBe(readings.length);
      }
    ));
  });

  it('should correctly aggregate time series data', () => {
    fc.assert(fc.property(
      fc.array(fc.float({ min: 0, max: 100 }), { minLength: 1, maxLength: 50 }),
      (values) => {
        const storage = new OptimizedTimeSeriesStorage();
        
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);

        // Aggregations should be mathematically correct
        expect(storage.calculateAggregation(values, AggregationType.AVG)).toBeCloseTo(avg);
        expect(storage.calculateAggregation(values, AggregationType.MIN)).toBe(min);
        expect(storage.calculateAggregation(values, AggregationType.MAX)).toBe(max);
      }
    ));
  });
});
```
