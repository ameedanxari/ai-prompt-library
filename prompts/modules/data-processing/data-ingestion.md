# Data Ingestion Template

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

This template provides comprehensive patterns for implementing data ingestion systems including batch processing, stream processing, real-time ingestion, and data validation. It covers source connectors, data extraction, ingestion pipelines, and validation frameworks for building robust data intake systems.

## Context

Modern data platforms require sophisticated ingestion capabilities to handle diverse data sources, varying data volumes, and different latency requirements. This template addresses the challenges of connecting to multiple data sources, handling both batch and streaming data, ensuring data quality at ingestion time, and providing reliable, scalable data intake pipelines that can adapt to changing business needs.

## Core Components

### Data Ingestion Service

## Examples

```typescript
interface DataIngestionService {
  // Source management
  registerSource(source: DataSource): Promise<string>;
  getSource(sourceId: string): Promise<DataSource | null>;
  listSources(): Promise<DataSource[]>;
  testConnection(sourceId: string): Promise<ConnectionTestResult>;
  
  // Ingestion operations
  ingestBatch(sourceId: string, options: BatchIngestionOptions): Promise<BatchIngestionResult>;
  startStreamIngestion(sourceId: string, options: StreamIngestionOptions): Promise<StreamIngestionHandle>;
  stopStreamIngestion(handleId: string): Promise<void>;
  
  // Monitoring
  getIngestionStatus(jobId: string): Promise<IngestionStatus>;
  getIngestionMetrics(sourceId: string, timeRange: TimeRange): Promise<IngestionMetrics>;
}


interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  connectionConfig: ConnectionConfig;
  schema?: DataSchema;
  ingestionMode: IngestionMode;
  enabled: boolean;
  metadata?: Record<string, unknown>;
}

enum DataSourceType {
  DATABASE = 'database',
  FILE_SYSTEM = 'file_system',
  API = 'api',
  MESSAGE_QUEUE = 'message_queue',
  STREAM = 'stream',
  CLOUD_STORAGE = 'cloud_storage',
  FTP = 'ftp',
  WEBHOOK = 'webhook'
}

enum IngestionMode {
  BATCH = 'batch',
  STREAMING = 'streaming',
  MICRO_BATCH = 'micro_batch',
  REAL_TIME = 'real_time',
  CHANGE_DATA_CAPTURE = 'cdc'
}

interface ConnectionConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  connectionString?: string;
  apiKey?: string;
  endpoint?: string;
  bucket?: string;
  region?: string;
  ssl?: boolean;
  poolSize?: number;
  timeout?: number;
}
```

### Batch Ingestion Engine

```typescript
interface BatchIngestionEngine {
  // Batch operations
  createBatchJob(config: BatchJobConfig): Promise<string>;
  executeBatchJob(jobId: string): Promise<BatchJobResult>;
  scheduleBatchJob(jobId: string, schedule: CronSchedule): Promise<void>;
  cancelBatchJob(jobId: string): Promise<void>;
  
  // Incremental loading
  configureIncrementalLoad(sourceId: string, config: IncrementalConfig): Promise<void>;
  getLastIncrementalState(sourceId: string): Promise<IncrementalState>;
  
  // Partitioning
  configurePartitioning(config: PartitionConfig): Promise<void>;
  getPartitionStatus(jobId: string): Promise<PartitionStatus[]>;
}

interface BatchJobConfig {
  sourceId: string;
  destinationId: string;
  extractionQuery?: string;
  transformations?: TransformationStep[];
  batchSize: number;
  parallelism: number;
  retryPolicy: RetryPolicy;
  validationRules?: ValidationRule[];
  watermarkColumn?: string;
  partitionBy?: string[];
}

interface BatchJobResult {
  jobId: string;
  status: JobStatus;
  recordsProcessed: number;
  recordsFailed: number;
  bytesProcessed: number;
  startTime: Date;
  endTime: Date;
  duration: number;
  errors: IngestionError[];
  metrics: JobMetrics;
}

interface IncrementalConfig {
  strategy: IncrementalStrategy;
  watermarkColumn: string;
  watermarkType: 'timestamp' | 'numeric' | 'string';
  lookbackWindow?: number;
  mergeStrategy: MergeStrategy;
}

enum IncrementalStrategy {
  WATERMARK = 'watermark',
  CHANGE_DATA_CAPTURE = 'cdc',
  FULL_REFRESH = 'full_refresh',
  APPEND_ONLY = 'append_only'
}
```


### Stream Ingestion Engine

```typescript
interface StreamIngestionEngine {
  // Stream operations
  createStreamConsumer(config: StreamConsumerConfig): Promise<string>;
  startConsumer(consumerId: string): Promise<void>;
  stopConsumer(consumerId: string): Promise<void>;
  pauseConsumer(consumerId: string): Promise<void>;
  resumeConsumer(consumerId: string): Promise<void>;
  
  // Offset management
  commitOffset(consumerId: string, offset: StreamOffset): Promise<void>;
  seekToOffset(consumerId: string, offset: StreamOffset): Promise<void>;
  getConsumerLag(consumerId: string): Promise<ConsumerLag>;
  
  // Windowing
  configureWindow(consumerId: string, window: WindowConfig): Promise<void>;
}

interface StreamConsumerConfig {
  sourceId: string;
  consumerGroup: string;
  topics: string[];
  deserializer: DeserializerType;
  processingGuarantee: ProcessingGuarantee;
  maxPollRecords: number;
  pollTimeout: number;
  autoCommit: boolean;
  windowConfig?: WindowConfig;
  errorHandler: ErrorHandlerConfig;
}

enum ProcessingGuarantee {
  AT_LEAST_ONCE = 'at_least_once',
  AT_MOST_ONCE = 'at_most_once',
  EXACTLY_ONCE = 'exactly_once'
}

interface WindowConfig {
  type: WindowType;
  size: number;
  sizeUnit: TimeUnit;
  slide?: number;
  slideUnit?: TimeUnit;
  allowedLateness?: number;
  latenessUnit?: TimeUnit;
  watermarkStrategy: WatermarkStrategy;
}

enum WindowType {
  TUMBLING = 'tumbling',
  SLIDING = 'sliding',
  SESSION = 'session',
  GLOBAL = 'global'
}

interface ConsumerLag {
  consumerId: string;
  partitions: PartitionLag[];
  totalLag: number;
  estimatedCatchUpTime: number;
}
```

### Data Validation Engine

```typescript
interface DataValidationEngine {
  // Validation rules
  addValidationRule(rule: ValidationRule): Promise<string>;
  removeValidationRule(ruleId: string): Promise<void>;
  getValidationRules(sourceId: string): Promise<ValidationRule[]>;
  
  // Validation execution
  validateRecord(record: DataRecord, rules: ValidationRule[]): ValidationResult;
  validateBatch(records: DataRecord[], rules: ValidationRule[]): BatchValidationResult;
  
  // Schema validation
  validateSchema(data: unknown, schema: DataSchema): SchemaValidationResult;
  inferSchema(samples: DataRecord[]): DataSchema;
}

interface ValidationRule {
  id: string;
  name: string;
  type: ValidationRuleType;
  field?: string;
  condition: ValidationCondition;
  severity: ValidationSeverity;
  errorMessage: string;
  enabled: boolean;
}

enum ValidationRuleType {
  NOT_NULL = 'not_null',
  UNIQUE = 'unique',
  RANGE = 'range',
  PATTERN = 'pattern',
  ENUM = 'enum',
  CUSTOM = 'custom',
  REFERENTIAL = 'referential',
  BUSINESS_RULE = 'business_rule'
}

interface ValidationCondition {
  operator: ValidationOperator;
  value?: unknown;
  values?: unknown[];
  pattern?: string;
  customFunction?: string;
  referenceTable?: string;
  referenceColumn?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  metadata: ValidationMetadata;
}

interface BatchValidationResult {
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  errorsByRule: Map<string, number>;
  sampleErrors: ValidationError[];
}
```


## Implementation Patterns

### Unified Ingestion Pipeline

```typescript
class UnifiedIngestionPipeline {
  private sources: Map<string, DataSource> = new Map();
  private validators: Map<string, ValidationRule[]> = new Map();
  private destinations: Map<string, DataDestination> = new Map();

  async ingest(sourceId: string, options: IngestionOptions): Promise<IngestionResult> {
    const source = this.sources.get(sourceId);
    if (!source) {
      throw new Error(`Source ${sourceId} not found`);
    }

    const startTime = Date.now();
    const metrics = new IngestionMetricsCollector();

    try {
      // Extract data from source
      const extractor = this.createExtractor(source);
      const dataStream = await extractor.extract(options.extractionConfig);

      // Apply validation
      const validationRules = this.validators.get(sourceId) || [];
      const validatedStream = this.applyValidation(dataStream, validationRules, metrics);

      // Apply transformations
      const transformedStream = this.applyTransformations(
        validatedStream,
        options.transformations || []
      );

      // Load to destination
      const destination = this.destinations.get(options.destinationId);
      const loadResult = await this.loadToDestination(transformedStream, destination, options);

      return {
        status: 'completed',
        recordsProcessed: metrics.getProcessedCount(),
        recordsFailed: metrics.getFailedCount(),
        bytesProcessed: metrics.getBytesProcessed(),
        duration: Date.now() - startTime,
        validationSummary: metrics.getValidationSummary(),
        errors: metrics.getErrors()
      };
    } catch (error) {
      return {
        status: 'failed',
        recordsProcessed: metrics.getProcessedCount(),
        recordsFailed: metrics.getFailedCount(),
        bytesProcessed: metrics.getBytesProcessed(),
        duration: Date.now() - startTime,
        error: error.message,
        errors: metrics.getErrors()
      };
    }
  }

  private createExtractor(source: DataSource): DataExtractor {
    switch (source.type) {
      case DataSourceType.DATABASE:
        return new DatabaseExtractor(source.connectionConfig);
      case DataSourceType.FILE_SYSTEM:
        return new FileSystemExtractor(source.connectionConfig);
      case DataSourceType.API:
        return new APIExtractor(source.connectionConfig);
      case DataSourceType.MESSAGE_QUEUE:
        return new MessageQueueExtractor(source.connectionConfig);
      case DataSourceType.CLOUD_STORAGE:
        return new CloudStorageExtractor(source.connectionConfig);
      default:
        throw new Error(`Unsupported source type: ${source.type}`);
    }
  }

  private async *applyValidation(
    dataStream: AsyncIterable<DataRecord>,
    rules: ValidationRule[],
    metrics: IngestionMetricsCollector
  ): AsyncIterable<DataRecord> {
    const validator = new DataValidationEngine();

    for await (const record of dataStream) {
      const result = validator.validateRecord(record, rules);
      
      if (result.isValid) {
        metrics.recordSuccess();
        yield record;
      } else {
        metrics.recordFailure(result.errors);
        
        // Handle based on error severity
        const hasCriticalError = result.errors.some(e => e.severity === 'critical');
        if (!hasCriticalError) {
          // Emit with warnings for non-critical errors
          yield { ...record, _validationWarnings: result.warnings };
        }
      }
    }
  }
}
```


### Stream Processing with Kafka

```typescript
class KafkaStreamIngestion {
  private consumer: KafkaConsumer;
  private producer: KafkaProducer;
  private schemaRegistry: SchemaRegistry;

  async processStream(config: StreamProcessingConfig): Promise<void> {
    const consumer = await this.createConsumer(config);
    
    await consumer.subscribe({ topics: config.topics });

    await consumer.run({
      eachBatch: async ({ batch, resolveOffset, heartbeat, commitOffsetsIfNecessary }) => {
        const processedRecords: ProcessedRecord[] = [];

        for (const message of batch.messages) {
          try {
            // Deserialize message
            const record = await this.deserialize(message, config.deserializer);
            
            // Apply processing logic
            const processed = await this.processRecord(record, config.processors);
            
            // Validate output
            if (config.outputValidation) {
              await this.validateOutput(processed, config.outputValidation);
            }

            processedRecords.push(processed);
            resolveOffset(message.offset);
            
            // Periodic heartbeat for long-running batches
            await heartbeat();
          } catch (error) {
            await this.handleProcessingError(error, message, config.errorHandler);
          }
        }

        // Write to output
        if (config.outputTopic) {
          await this.writeToOutput(processedRecords, config.outputTopic);
        }

        await commitOffsetsIfNecessary();
      }
    });
  }

  private async deserialize(message: KafkaMessage, deserializer: DeserializerConfig): Promise<DataRecord> {
    switch (deserializer.type) {
      case 'avro':
        return this.schemaRegistry.decode(message.value, deserializer.schemaId);
      case 'json':
        return JSON.parse(message.value.toString());
      case 'protobuf':
        return this.decodeProtobuf(message.value, deserializer.protoType);
      default:
        return { value: message.value.toString() };
    }
  }

  private async handleProcessingError(
    error: Error,
    message: KafkaMessage,
    errorHandler: ErrorHandlerConfig
  ): Promise<void> {
    switch (errorHandler.strategy) {
      case 'dead_letter_queue':
        await this.sendToDeadLetterQueue(message, error, errorHandler.dlqTopic);
        break;
      case 'retry':
        await this.scheduleRetry(message, error, errorHandler.retryConfig);
        break;
      case 'skip':
        console.warn(`Skipping message due to error: ${error.message}`);
        break;
      case 'fail':
        throw error;
    }
  }
}
```

### Change Data Capture (CDC) Ingestion

```typescript
class CDCIngestionEngine {
  private debeziumConnector: DebeziumConnector;
  private changeProcessor: ChangeProcessor;

  async startCDCCapture(config: CDCConfig): Promise<CDCHandle> {
    // Configure Debezium connector
    const connectorConfig = this.buildConnectorConfig(config);
    await this.debeziumConnector.createConnector(connectorConfig);

    // Start change stream processing
    const handle = await this.processChangeStream(config);

    return handle;
  }

  private buildConnectorConfig(config: CDCConfig): DebeziumConnectorConfig {
    return {
      name: config.connectorName,
      'connector.class': this.getConnectorClass(config.sourceType),
      'database.hostname': config.host,
      'database.port': config.port,
      'database.user': config.username,
      'database.password': config.password,
      'database.dbname': config.database,
      'database.server.name': config.serverName,
      'table.include.list': config.tables.join(','),
      'snapshot.mode': config.snapshotMode,
      'tombstones.on.delete': config.tombstonesOnDelete,
      'transforms': 'unwrap',
      'transforms.unwrap.type': 'io.debezium.transforms.ExtractNewRecordState'
    };
  }

  private async processChangeStream(config: CDCConfig): Promise<CDCHandle> {
    const consumer = await this.createCDCConsumer(config);

    const processor = async (changeEvent: CDCEvent) => {
      switch (changeEvent.operation) {
        case 'c': // Create
          await this.handleInsert(changeEvent, config);
          break;
        case 'u': // Update
          await this.handleUpdate(changeEvent, config);
          break;
        case 'd': // Delete
          await this.handleDelete(changeEvent, config);
          break;
        case 'r': // Read (snapshot)
          await this.handleSnapshot(changeEvent, config);
          break;
      }
    };

    return {
      id: config.connectorName,
      stop: () => consumer.disconnect(),
      pause: () => consumer.pause(),
      resume: () => consumer.resume(),
      getStatus: () => this.getConnectorStatus(config.connectorName)
    };
  }
}
```


## Integration Points

### Database Connectors

```typescript
// Database connector integration for various database types
class DatabaseConnectorFactory {
  createConnector(config: DatabaseConfig): DatabaseConnector {
    switch (config.type) {
      case 'postgresql':
        return new PostgreSQLConnector(config);
      case 'mysql':
        return new MySQLConnector(config);
      case 'mongodb':
        return new MongoDBConnector(config);
      case 'snowflake':
        return new SnowflakeConnector(config);
      case 'bigquery':
        return new BigQueryConnector(config);
      case 'redshift':
        return new RedshiftConnector(config);
      default:
        throw new Error(`Unsupported database type: ${config.type}`);
    }
  }
}

interface DatabaseConnector {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  query(sql: string, params?: unknown[]): Promise<QueryResult>;
  streamQuery(sql: string, params?: unknown[]): AsyncIterable<DataRecord>;
  getSchema(table: string): Promise<TableSchema>;
  bulkInsert(table: string, records: DataRecord[]): Promise<BulkInsertResult>;
}
```

### Cloud Storage Integration

```typescript
// Cloud storage integration for S3, GCS, Azure Blob
class CloudStorageIngestion {
  async ingestFromS3(config: S3IngestionConfig): Promise<IngestionResult> {
    const s3Client = new S3Client({ region: config.region });
    
    const objects = await this.listObjects(s3Client, config.bucket, config.prefix);
    const results: FileIngestionResult[] = [];

    for (const object of objects) {
      const stream = await this.getObjectStream(s3Client, config.bucket, object.Key);
      const parser = this.getParser(object.Key, config.fileFormat);
      
      const records = await this.parseStream(stream, parser);
      const result = await this.processRecords(records, config);
      
      results.push(result);
    }

    return this.aggregateResults(results);
  }

  private getParser(filename: string, format?: FileFormat): FileParser {
    const extension = filename.split('.').pop()?.toLowerCase();
    const formatToUse = format || this.inferFormat(extension);

    switch (formatToUse) {
      case 'csv':
        return new CSVParser();
      case 'json':
        return new JSONParser();
      case 'parquet':
        return new ParquetParser();
      case 'avro':
        return new AvroParser();
      default:
        throw new Error(`Unsupported file format: ${formatToUse}`);
    }
  }
}
```

### Message Queue Integration

```typescript
// Message queue integration for various messaging systems
interface MessageQueueConnector {
  connect(): Promise<void>;
  subscribe(topics: string[], handler: MessageHandler): Promise<void>;
  publish(topic: string, message: Message): Promise<void>;
  acknowledge(messageId: string): Promise<void>;
  disconnect(): Promise<void>;
}

class RabbitMQConnector implements MessageQueueConnector {
  private connection: AMQPConnection;
  private channel: AMQPChannel;

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.config.connectionString);
    this.channel = await this.connection.createChannel();
  }

  async subscribe(queues: string[], handler: MessageHandler): Promise<void> {
    for (const queue of queues) {
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            await handler(JSON.parse(msg.content.toString()));
            this.channel.ack(msg);
          } catch (error) {
            this.channel.nack(msg, false, true);
          }
        }
      });
    }
  }
}
```

## Security Considerations

### Connection Security
- Use encrypted connections (TLS/SSL) for all data source connections
- Store credentials in secure vaults (AWS Secrets Manager, HashiCorp Vault)
- Implement connection pooling with secure credential rotation
- Use service accounts with minimal required permissions

### Data Protection
- Encrypt sensitive data fields during ingestion
- Implement data masking for PII during processing
- Maintain audit logs for all data access operations
- Apply data classification labels during ingestion

### Access Control
- Implement role-based access for ingestion job management
- Restrict source connection configurations to authorized users
- Audit all configuration changes and job executions
- Use network segmentation for data processing infrastructure

## Testing Considerations

### Unit Testing

```typescript
describe('DataIngestionService', () => {
  it('should validate records against defined rules', async () => {
    const validator = new DataValidationEngine();
    const rules = [
      { id: '1', type: 'not_null', field: 'id', severity: 'critical' },
      { id: '2', type: 'range', field: 'age', condition: { min: 0, max: 150 } }
    ];
    
    const validRecord = { id: '123', age: 25 };
    const result = validator.validateRecord(validRecord, rules);
    
    expect(result.isValid).toBe(true);
  });

  it('should handle batch ingestion with partitioning', async () => {
    const engine = new BatchIngestionEngine(mockConfig);
    const result = await engine.executeBatchJob('job-123');
    
    expect(result.status).toBe('completed');
    expect(result.recordsProcessed).toBeGreaterThan(0);
  });
});
```

### Integration Testing

```typescript
describe('Stream Ingestion Integration', () => {
  it('should process Kafka messages with exactly-once semantics', async () => {
    const ingestion = new KafkaStreamIngestion(testConfig);
    const messages = generateTestMessages(100);
    
    await produceMessages(messages);
    const results = await ingestion.processStream(streamConfig);
    
    expect(results.processedCount).toBe(100);
    expect(results.duplicates).toBe(0);
  });
});
```

### Property-Based Testing

```typescript
describe('Data Ingestion Properties', () => {
  it('should preserve record count through ingestion pipeline', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ id: fc.string(), value: fc.integer() }), { minLength: 1, maxLength: 1000 }),
      async (records) => {
        const result = await pipeline.ingest(records);
        expect(result.recordsProcessed + result.recordsFailed).toBe(records.length);
      }
    ));
  });
});
```
