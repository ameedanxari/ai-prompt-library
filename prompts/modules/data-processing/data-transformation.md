# Data Transformation Template

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

This template provides comprehensive patterns for implementing data transformation systems including data cleaning, normalization, enrichment, and format conversion. It covers transformation pipelines, data quality improvements, and standardization frameworks for building robust data processing systems.

## Context

Data transformation is a critical component of any data pipeline, ensuring that raw data is converted into a consistent, clean, and usable format. This template addresses the challenges of handling diverse data formats, implementing complex transformation logic, maintaining data quality during transformations, and building scalable transformation pipelines that can process large volumes of data efficiently.

## Core Components

### Data Transformation Service

## Examples

```typescript
interface DataTransformationService {
  // Transformation management
  createTransformation(config: TransformationConfig): Promise<string>;
  executeTransformation(transformationId: string, data: DataSet): Promise<TransformationResult>;
  validateTransformation(transformationId: string): Promise<ValidationResult>;
  
  // Pipeline operations
  createPipeline(steps: TransformationStep[]): Promise<string>;
  executePipeline(pipelineId: string, data: DataSet): Promise<PipelineResult>;
  
  // Schema operations
  inferSchema(data: DataSet): Promise<DataSchema>;
  mapSchema(sourceSchema: DataSchema, targetSchema: DataSchema): Promise<SchemaMapping>;
}


interface TransformationConfig {
  id: string;
  name: string;
  type: TransformationType;
  inputSchema: DataSchema;
  outputSchema: DataSchema;
  rules: TransformationRule[];
  errorHandling: ErrorHandlingConfig;
  metadata?: Record<string, unknown>;
}

enum TransformationType {
  CLEANING = 'cleaning',
  NORMALIZATION = 'normalization',
  ENRICHMENT = 'enrichment',
  AGGREGATION = 'aggregation',
  FILTERING = 'filtering',
  MAPPING = 'mapping',
  DERIVATION = 'derivation',
  FORMAT_CONVERSION = 'format_conversion'
}

interface TransformationRule {
  id: string;
  name: string;
  sourceField?: string;
  targetField: string;
  operation: TransformationOperation;
  parameters?: Record<string, unknown>;
  condition?: TransformationCondition;
  priority: number;
}

interface TransformationOperation {
  type: OperationType;
  function?: string;
  expression?: string;
  lookupTable?: string;
  defaultValue?: unknown;
  format?: string;
}

enum OperationType {
  COPY = 'copy',
  RENAME = 'rename',
  CAST = 'cast',
  TRIM = 'trim',
  UPPERCASE = 'uppercase',
  LOWERCASE = 'lowercase',
  REPLACE = 'replace',
  SPLIT = 'split',
  CONCAT = 'concat',
  CALCULATE = 'calculate',
  LOOKUP = 'lookup',
  CUSTOM = 'custom'
}
```

### Data Cleaning Engine

```typescript
interface DataCleaningEngine {
  // Cleaning operations
  cleanDataSet(data: DataSet, rules: CleaningRule[]): Promise<CleaningResult>;
  detectAnomalies(data: DataSet, config: AnomalyConfig): Promise<AnomalyReport>;
  
  // Deduplication
  findDuplicates(data: DataSet, keys: string[]): Promise<DuplicateReport>;
  removeDuplicates(data: DataSet, strategy: DeduplicationStrategy): Promise<DataSet>;
  
  // Missing value handling
  detectMissingValues(data: DataSet): Promise<MissingValueReport>;
  handleMissingValues(data: DataSet, strategy: MissingValueStrategy): Promise<DataSet>;
}

interface CleaningRule {
  id: string;
  field: string;
  type: CleaningRuleType;
  parameters: CleaningParameters;
  enabled: boolean;
}

enum CleaningRuleType {
  TRIM_WHITESPACE = 'trim_whitespace',
  REMOVE_SPECIAL_CHARS = 'remove_special_chars',
  STANDARDIZE_CASE = 'standardize_case',
  FIX_ENCODING = 'fix_encoding',
  REMOVE_HTML = 'remove_html',
  NORMALIZE_UNICODE = 'normalize_unicode',
  STANDARDIZE_NULL = 'standardize_null',
  REMOVE_OUTLIERS = 'remove_outliers',
  FIX_DATA_TYPE = 'fix_data_type'
}

interface DeduplicationStrategy {
  method: 'exact' | 'fuzzy' | 'rule_based';
  keys: string[];
  fuzzyThreshold?: number;
  keepStrategy: 'first' | 'last' | 'most_complete' | 'most_recent';
  mergeFields?: string[];
}

interface MissingValueStrategy {
  field: string;
  method: MissingValueMethod;
  value?: unknown;
  referenceField?: string;
  lookupTable?: string;
}

enum MissingValueMethod {
  DROP_ROW = 'drop_row',
  DEFAULT_VALUE = 'default_value',
  MEAN = 'mean',
  MEDIAN = 'median',
  MODE = 'mode',
  FORWARD_FILL = 'forward_fill',
  BACKWARD_FILL = 'backward_fill',
  INTERPOLATE = 'interpolate',
  LOOKUP = 'lookup'
}
```


### Data Normalization Engine

```typescript
interface DataNormalizationEngine {
  // Normalization operations
  normalizeDataSet(data: DataSet, config: NormalizationConfig): Promise<NormalizationResult>;
  
  // Standard normalization methods
  standardize(data: DataSet, fields: string[]): Promise<DataSet>;
  minMaxScale(data: DataSet, fields: string[], range: [number, number]): Promise<DataSet>;
  zScoreNormalize(data: DataSet, fields: string[]): Promise<DataSet>;
  
  // Text normalization
  normalizeText(data: DataSet, fields: string[], config: TextNormConfig): Promise<DataSet>;
  
  // Date/time normalization
  normalizeDates(data: DataSet, fields: string[], targetFormat: string): Promise<DataSet>;
  normalizeTimezones(data: DataSet, fields: string[], targetTimezone: string): Promise<DataSet>;
}

interface NormalizationConfig {
  numericFields?: NumericNormConfig[];
  textFields?: TextNormConfig[];
  dateFields?: DateNormConfig[];
  categoricalFields?: CategoricalNormConfig[];
}

interface NumericNormConfig {
  field: string;
  method: 'standardize' | 'min_max' | 'z_score' | 'log' | 'robust';
  parameters?: {
    min?: number;
    max?: number;
    mean?: number;
    std?: number;
  };
}

interface TextNormConfig {
  field: string;
  operations: TextNormOperation[];
}

enum TextNormOperation {
  LOWERCASE = 'lowercase',
  UPPERCASE = 'uppercase',
  TITLE_CASE = 'title_case',
  REMOVE_ACCENTS = 'remove_accents',
  REMOVE_PUNCTUATION = 'remove_punctuation',
  STEM = 'stem',
  LEMMATIZE = 'lemmatize',
  REMOVE_STOPWORDS = 'remove_stopwords'
}

interface DateNormConfig {
  field: string;
  inputFormats: string[];
  outputFormat: string;
  timezone?: string;
  handleInvalid: 'null' | 'error' | 'original';
}
```

### Data Enrichment Engine

```typescript
interface DataEnrichmentEngine {
  // Enrichment operations
  enrichDataSet(data: DataSet, enrichments: EnrichmentConfig[]): Promise<EnrichmentResult>;
  
  // Lookup enrichment
  lookupEnrich(data: DataSet, config: LookupEnrichConfig): Promise<DataSet>;
  
  // API enrichment
  apiEnrich(data: DataSet, config: APIEnrichConfig): Promise<DataSet>;
  
  // Derived field creation
  createDerivedFields(data: DataSet, derivations: DerivedFieldConfig[]): Promise<DataSet>;
  
  // Geocoding
  geocodeAddresses(data: DataSet, addressField: string): Promise<DataSet>;
}

interface EnrichmentConfig {
  id: string;
  type: EnrichmentType;
  sourceFields: string[];
  targetFields: string[];
  config: LookupEnrichConfig | APIEnrichConfig | DerivedFieldConfig;
}

enum EnrichmentType {
  LOOKUP = 'lookup',
  API_CALL = 'api_call',
  DERIVED = 'derived',
  GEOCODING = 'geocoding',
  SENTIMENT = 'sentiment',
  ENTITY_EXTRACTION = 'entity_extraction'
}

interface LookupEnrichConfig {
  lookupTable: string;
  lookupKey: string;
  sourceKey: string;
  returnFields: string[];
  cacheResults: boolean;
  handleMissing: 'null' | 'error' | 'default';
  defaultValues?: Record<string, unknown>;
}

interface APIEnrichConfig {
  endpoint: string;
  method: 'GET' | 'POST';
  authentication: AuthConfig;
  requestMapping: Record<string, string>;
  responseMapping: Record<string, string>;
  rateLimit: number;
  timeout: number;
  retryPolicy: RetryPolicy;
  cacheConfig?: CacheConfig;
}

interface DerivedFieldConfig {
  targetField: string;
  expression: string;
  sourceFields: string[];
  dataType: DataType;
}
```


### Format Conversion Engine

```typescript
interface FormatConversionEngine {
  // Format conversion
  convert(data: DataSet, targetFormat: DataFormat): Promise<ConversionResult>;
  
  // Specific conversions
  csvToJson(csvData: string, options?: CSVParseOptions): Promise<object[]>;
  jsonToCsv(jsonData: object[], options?: CSVWriteOptions): Promise<string>;
  xmlToJson(xmlData: string, options?: XMLParseOptions): Promise<object>;
  jsonToXml(jsonData: object, options?: XMLWriteOptions): Promise<string>;
  
  // Schema conversion
  convertSchema(schema: DataSchema, targetFormat: SchemaFormat): Promise<string>;
  
  // Binary format handling
  parquetToJson(parquetData: Buffer): Promise<object[]>;
  jsonToParquet(jsonData: object[], schema: ParquetSchema): Promise<Buffer>;
  avroToJson(avroData: Buffer, schema: AvroSchema): Promise<object[]>;
}

enum DataFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  PARQUET = 'parquet',
  AVRO = 'avro',
  ORC = 'orc',
  YAML = 'yaml',
  PROTOBUF = 'protobuf'
}

interface CSVParseOptions {
  delimiter: string;
  quote: string;
  escape: string;
  header: boolean;
  skipRows: number;
  encoding: string;
  nullValues: string[];
  trimWhitespace: boolean;
  columnTypes?: Record<string, DataType>;
}

interface ConversionResult {
  success: boolean;
  data?: unknown;
  recordCount: number;
  bytesProcessed: number;
  errors: ConversionError[];
  warnings: ConversionWarning[];
}
```

## Implementation Patterns

### Transformation Pipeline

```typescript
class TransformationPipeline {
  private steps: TransformationStep[] = [];
  private metrics: PipelineMetrics;

  addStep(step: TransformationStep): this {
    this.steps.push(step);
    return this;
  }

  async execute(data: DataSet): Promise<PipelineResult> {
    let currentData = data;
    const stepResults: StepResult[] = [];
    const startTime = Date.now();

    for (const step of this.steps) {
      const stepStart = Date.now();
      
      try {
        // Execute transformation step
        const result = await this.executeStep(step, currentData);
        
        stepResults.push({
          stepId: step.id,
          status: 'completed',
          inputRecords: currentData.length,
          outputRecords: result.data.length,
          duration: Date.now() - stepStart,
          metrics: result.metrics
        });

        currentData = result.data;
      } catch (error) {
        stepResults.push({
          stepId: step.id,
          status: 'failed',
          error: error.message,
          duration: Date.now() - stepStart
        });

        if (step.errorHandling === 'fail') {
          throw error;
        }
      }
    }

    return {
      status: stepResults.every(r => r.status === 'completed') ? 'completed' : 'partial',
      data: currentData,
      stepResults,
      totalDuration: Date.now() - startTime,
      inputRecords: data.length,
      outputRecords: currentData.length
    };
  }

  private async executeStep(step: TransformationStep, data: DataSet): Promise<StepExecutionResult> {
    const transformer = this.getTransformer(step.type);
    return transformer.transform(data, step.config);
  }

  private getTransformer(type: TransformationType): Transformer {
    switch (type) {
      case TransformationType.CLEANING:
        return new DataCleaningTransformer();
      case TransformationType.NORMALIZATION:
        return new DataNormalizationTransformer();
      case TransformationType.ENRICHMENT:
        return new DataEnrichmentTransformer();
      case TransformationType.AGGREGATION:
        return new DataAggregationTransformer();
      case TransformationType.FILTERING:
        return new DataFilteringTransformer();
      case TransformationType.MAPPING:
        return new DataMappingTransformer();
      default:
        throw new Error(`Unknown transformation type: ${type}`);
    }
  }
}
```


### Data Cleaning Implementation

```typescript
class DataCleaningTransformer implements Transformer {
  async transform(data: DataSet, config: CleaningConfig): Promise<TransformResult> {
    const cleanedRecords: DataRecord[] = [];
    const errors: TransformError[] = [];
    const metrics = new CleaningMetrics();

    for (const record of data) {
      try {
        let cleanedRecord = { ...record };

        // Apply cleaning rules in order
        for (const rule of config.rules) {
          cleanedRecord = await this.applyCleaningRule(cleanedRecord, rule, metrics);
        }

        cleanedRecords.push(cleanedRecord);
      } catch (error) {
        errors.push({
          recordId: record.id,
          error: error.message,
          rule: error.rule
        });

        if (config.errorHandling === 'skip') {
          continue;
        } else if (config.errorHandling === 'fail') {
          throw error;
        }
      }
    }

    return {
      data: cleanedRecords,
      metrics: metrics.toObject(),
      errors
    };
  }

  private async applyCleaningRule(
    record: DataRecord,
    rule: CleaningRule,
    metrics: CleaningMetrics
  ): Promise<DataRecord> {
    const value = record[rule.field];
    let cleanedValue = value;

    switch (rule.type) {
      case CleaningRuleType.TRIM_WHITESPACE:
        if (typeof value === 'string') {
          cleanedValue = value.trim();
          if (cleanedValue !== value) metrics.incrementTrimmed();
        }
        break;

      case CleaningRuleType.STANDARDIZE_CASE:
        if (typeof value === 'string') {
          cleanedValue = rule.parameters.case === 'upper' 
            ? value.toUpperCase() 
            : value.toLowerCase();
        }
        break;

      case CleaningRuleType.REMOVE_SPECIAL_CHARS:
        if (typeof value === 'string') {
          const pattern = rule.parameters.pattern || /[^a-zA-Z0-9\s]/g;
          cleanedValue = value.replace(pattern, '');
        }
        break;

      case CleaningRuleType.STANDARDIZE_NULL:
        const nullValues = rule.parameters.nullValues || ['', 'null', 'NULL', 'N/A', 'n/a'];
        if (nullValues.includes(value)) {
          cleanedValue = null;
          metrics.incrementNullStandardized();
        }
        break;

      case CleaningRuleType.FIX_DATA_TYPE:
        cleanedValue = this.coerceDataType(value, rule.parameters.targetType);
        break;
    }

    return { ...record, [rule.field]: cleanedValue };
  }

  private coerceDataType(value: unknown, targetType: DataType): unknown {
    switch (targetType) {
      case 'integer':
        return parseInt(String(value), 10);
      case 'float':
        return parseFloat(String(value));
      case 'boolean':
        return ['true', '1', 'yes'].includes(String(value).toLowerCase());
      case 'date':
        return new Date(String(value));
      case 'string':
        return String(value);
      default:
        return value;
    }
  }
}
```

### Schema Mapping Implementation

```typescript
class SchemaMappingEngine {
  async createMapping(
    sourceSchema: DataSchema,
    targetSchema: DataSchema,
    options?: MappingOptions
  ): Promise<SchemaMapping> {
    const mappings: FieldMapping[] = [];
    const unmappedSource: string[] = [];
    const unmappedTarget: string[] = [];

    // Auto-map by name similarity
    for (const targetField of targetSchema.fields) {
      const sourceField = this.findBestMatch(targetField, sourceSchema.fields, options);
      
      if (sourceField) {
        mappings.push({
          sourceField: sourceField.name,
          targetField: targetField.name,
          transformation: this.determineTransformation(sourceField, targetField),
          confidence: this.calculateConfidence(sourceField, targetField)
        });
      } else {
        unmappedTarget.push(targetField.name);
      }
    }

    // Find unmapped source fields
    const mappedSourceFields = new Set(mappings.map(m => m.sourceField));
    for (const sourceField of sourceSchema.fields) {
      if (!mappedSourceFields.has(sourceField.name)) {
        unmappedSource.push(sourceField.name);
      }
    }

    return {
      mappings,
      unmappedSource,
      unmappedTarget,
      confidence: this.calculateOverallConfidence(mappings)
    };
  }

  private findBestMatch(
    targetField: FieldDefinition,
    sourceFields: FieldDefinition[],
    options?: MappingOptions
  ): FieldDefinition | null {
    let bestMatch: FieldDefinition | null = null;
    let bestScore = 0;

    for (const sourceField of sourceFields) {
      const score = this.calculateMatchScore(sourceField, targetField, options);
      if (score > bestScore && score >= (options?.minMatchScore || 0.5)) {
        bestScore = score;
        bestMatch = sourceField;
      }
    }

    return bestMatch;
  }

  private calculateMatchScore(
    source: FieldDefinition,
    target: FieldDefinition,
    options?: MappingOptions
  ): number {
    let score = 0;

    // Name similarity (Levenshtein distance)
    const nameSimilarity = this.calculateStringSimilarity(
      source.name.toLowerCase(),
      target.name.toLowerCase()
    );
    score += nameSimilarity * 0.5;

    // Type compatibility
    if (this.areTypesCompatible(source.type, target.type)) {
      score += 0.3;
    }

    // Semantic similarity (if enabled)
    if (options?.useSemanticMatching) {
      const semanticScore = this.calculateSemanticSimilarity(source, target);
      score += semanticScore * 0.2;
    }

    return score;
  }
}
```


## Integration Points

### Apache Spark Integration

```typescript
// Spark integration for large-scale transformations
class SparkTransformationEngine {
  private spark: SparkSession;

  async transformWithSpark(config: SparkTransformConfig): Promise<SparkTransformResult> {
    // Read data into Spark DataFrame
    const df = await this.readData(config.source);

    // Apply transformations
    let transformedDf = df;
    for (const transformation of config.transformations) {
      transformedDf = await this.applySparkTransformation(transformedDf, transformation);
    }

    // Write results
    await this.writeData(transformedDf, config.destination);

    return {
      recordsProcessed: await transformedDf.count(),
      partitionsUsed: transformedDf.rdd.getNumPartitions(),
      executionTime: this.getExecutionTime()
    };
  }

  private async applySparkTransformation(
    df: DataFrame,
    transformation: TransformationConfig
  ): Promise<DataFrame> {
    switch (transformation.type) {
      case 'select':
        return df.select(...transformation.columns);
      case 'filter':
        return df.filter(transformation.condition);
      case 'withColumn':
        return df.withColumn(transformation.name, transformation.expression);
      case 'groupBy':
        return df.groupBy(...transformation.columns).agg(transformation.aggregations);
      case 'join':
        return df.join(transformation.rightDf, transformation.condition, transformation.joinType);
      default:
        throw new Error(`Unknown transformation: ${transformation.type}`);
    }
  }
}
```

### dbt Integration

```typescript
// dbt integration for SQL-based transformations
class DBTTransformationEngine {
  async runDBTModel(modelName: string, options?: DBTRunOptions): Promise<DBTRunResult> {
    const command = this.buildDBTCommand('run', modelName, options);
    const result = await this.executeDBTCommand(command);
    
    return {
      success: result.exitCode === 0,
      modelsRun: this.parseModelsRun(result.output),
      testsRun: options?.runTests ? this.parseTestsRun(result.output) : [],
      duration: result.duration,
      logs: result.output
    };
  }

  async generateDocumentation(): Promise<void> {
    await this.executeDBTCommand(['docs', 'generate']);
  }

  async runTests(selector?: string): Promise<DBTTestResult> {
    const command = ['test'];
    if (selector) {
      command.push('--select', selector);
    }
    
    const result = await this.executeDBTCommand(command);
    return this.parseTestResults(result);
  }
}
```

### Pandas/Polars Integration

```typescript
// Python data processing integration
class PythonTransformationBridge {
  private pythonProcess: PythonProcess;

  async transformWithPandas(config: PandasTransformConfig): Promise<TransformResult> {
    const script = this.generatePandasScript(config);
    const result = await this.pythonProcess.execute(script);
    
    return {
      data: JSON.parse(result.output),
      metrics: result.metrics
    };
  }

  private generatePandasScript(config: PandasTransformConfig): string {
    return `
import pandas as pd
import json

# Read data
df = pd.read_json('${config.inputPath}')

# Apply transformations
${config.transformations.map(t => this.generatePandasTransformation(t)).join('\n')}

# Output results
print(df.to_json(orient='records'))
    `;
  }
}
```

## Security Considerations

### Data Protection
- Implement field-level encryption for sensitive data during transformation
- Use secure temporary storage for intermediate transformation results
- Apply data masking rules before exposing transformed data
- Maintain transformation audit logs for compliance

### Access Control
- Implement role-based access for transformation job management
- Restrict access to transformation configurations containing business logic
- Audit all transformation executions and configuration changes
- Use service accounts with minimal required permissions

### Compliance
- Ensure transformations maintain data lineage for regulatory compliance
- Implement data retention policies for transformation outputs
- Support data subject access requests through transformation tracking
- Validate transformations against data governance policies

## Testing Considerations

### Unit Testing

```typescript
describe('DataCleaningTransformer', () => {
  it('should trim whitespace from string fields', async () => {
    const transformer = new DataCleaningTransformer();
    const data = [{ name: '  John Doe  ', age: 30 }];
    const config = {
      rules: [{ field: 'name', type: CleaningRuleType.TRIM_WHITESPACE }]
    };
    
    const result = await transformer.transform(data, config);
    
    expect(result.data[0].name).toBe('John Doe');
  });

  it('should handle missing values according to strategy', async () => {
    const transformer = new DataCleaningTransformer();
    const data = [{ name: 'John', age: null }, { name: 'Jane', age: 25 }];
    const config = {
      rules: [{
        field: 'age',
        type: CleaningRuleType.HANDLE_MISSING,
        parameters: { method: 'mean' }
      }]
    };
    
    const result = await transformer.transform(data, config);
    
    expect(result.data[0].age).toBe(25);
  });
});
```

### Property-Based Testing

```typescript
describe('Transformation Properties', () => {
  it('should preserve record count for non-filtering transformations', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ id: fc.string(), value: fc.integer() })),
      async (records) => {
        const result = await transformer.transform(records, cleaningConfig);
        expect(result.data.length).toBe(records.length);
      }
    ));
  });

  it('should maintain data integrity through round-trip format conversion', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ name: fc.string(), count: fc.integer() })),
      async (records) => {
        const csv = await converter.jsonToCsv(records);
        const restored = await converter.csvToJson(csv);
        expect(restored).toEqual(records);
      }
    ));
  });
});
```
