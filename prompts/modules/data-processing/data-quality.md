# Data Quality Template

## Purpose

This template provides comprehensive patterns for implementing data quality systems including data profiling, quality monitoring, anomaly detection, and data lineage tracking. It covers quality metrics, validation frameworks, and monitoring dashboards for ensuring data reliability and trustworthiness across data pipelines.

## Context

Data quality is fundamental to making reliable business decisions and building trustworthy data products. This template addresses the challenges of measuring and monitoring data quality, detecting anomalies and data drift, tracking data lineage for debugging and compliance, and implementing automated quality gates that prevent bad data from propagating through systems.

## Core Components

### Data Quality Service

## Examples

```typescript
interface DataQualityService {
  // Profiling operations
  profileDataSet(data: DataSet, options?: ProfilingOptions): Promise<DataProfile>;
  profileColumn(data: DataSet, column: string): Promise<ColumnProfile>;
  
  // Quality assessment
  assessQuality(data: DataSet, rules: QualityRule[]): Promise<QualityAssessment>;
  calculateQualityScore(assessment: QualityAssessment): number;
  
  // Monitoring
  createQualityMonitor(config: MonitorConfig): Promise<string>;
  getQualityMetrics(datasetId: string, timeRange: TimeRange): Promise<QualityMetrics>;
  
  // Alerting
  configureAlerts(monitorId: string, alerts: AlertConfig[]): Promise<void>;
  getActiveAlerts(datasetId: string): Promise<Alert[]>;
}


interface DataProfile {
  datasetId: string;
  rowCount: number;
  columnCount: number;
  columns: ColumnProfile[];
  correlations?: CorrelationMatrix;
  duplicateRows: number;
  missingValueSummary: MissingValueSummary;
  profiledAt: Date;
  profilingDuration: number;
}

interface ColumnProfile {
  name: string;
  dataType: DataType;
  inferredType: DataType;
  nullCount: number;
  nullPercentage: number;
  uniqueCount: number;
  uniquePercentage: number;
  statistics?: NumericStatistics | StringStatistics | DateStatistics;
  distribution?: Distribution;
  topValues?: ValueFrequency[];
  patterns?: PatternAnalysis;
}

interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  skewness: number;
  kurtosis: number;
  percentiles: Record<number, number>;
  outlierCount: number;
}

interface StringStatistics {
  minLength: number;
  maxLength: number;
  avgLength: number;
  emptyCount: number;
  patternMatches: PatternMatch[];
}

interface QualityRule {
  id: string;
  name: string;
  type: QualityRuleType;
  dimension: QualityDimension;
  column?: string;
  condition: QualityCondition;
  threshold: number;
  severity: 'critical' | 'warning' | 'info';
  enabled: boolean;
}

enum QualityRuleType {
  COMPLETENESS = 'completeness',
  UNIQUENESS = 'uniqueness',
  VALIDITY = 'validity',
  CONSISTENCY = 'consistency',
  ACCURACY = 'accuracy',
  TIMELINESS = 'timeliness',
  CUSTOM = 'custom'
}

enum QualityDimension {
  COMPLETENESS = 'completeness',
  UNIQUENESS = 'uniqueness',
  VALIDITY = 'validity',
  CONSISTENCY = 'consistency',
  ACCURACY = 'accuracy',
  TIMELINESS = 'timeliness',
  INTEGRITY = 'integrity'
}
```

### Data Profiling Engine

```typescript
interface DataProfilingEngine {
  // Full profiling
  profileDataSet(data: DataSet, options?: ProfilingOptions): Promise<DataProfile>;
  
  // Incremental profiling
  updateProfile(existingProfile: DataProfile, newData: DataSet): Promise<DataProfile>;
  
  // Comparison
  compareProfiles(profile1: DataProfile, profile2: DataProfile): ProfileComparison;
  detectDrift(baselineProfile: DataProfile, currentProfile: DataProfile): DriftReport;
  
  // Schema analysis
  inferSchema(data: DataSet): Promise<InferredSchema>;
  validateSchema(data: DataSet, expectedSchema: DataSchema): SchemaValidationResult;
}

interface ProfilingOptions {
  sampleSize?: number;
  sampleMethod?: 'random' | 'stratified' | 'systematic';
  includeCorrelations?: boolean;
  includePatterns?: boolean;
  includeDistributions?: boolean;
  maxUniqueValues?: number;
  histogramBins?: number;
  timeout?: number;
}

interface ProfileComparison {
  rowCountChange: number;
  columnChanges: ColumnChange[];
  statisticalChanges: StatisticalChange[];
  schemaChanges: SchemaChange[];
  overallSimilarity: number;
}

interface DriftReport {
  hasDrift: boolean;
  driftScore: number;
  columnDrifts: ColumnDrift[];
  recommendations: string[];
  detectedAt: Date;
}

interface ColumnDrift {
  column: string;
  driftType: DriftType;
  driftScore: number;
  baselineStats: ColumnStatistics;
  currentStats: ColumnStatistics;
  significance: number;
}

enum DriftType {
  DISTRIBUTION = 'distribution',
  SCHEMA = 'schema',
  VOLUME = 'volume',
  NULL_RATE = 'null_rate',
  CARDINALITY = 'cardinality'
}
```


### Anomaly Detection Engine

```typescript
interface AnomalyDetectionEngine {
  // Detection operations
  detectAnomalies(data: DataSet, config: AnomalyConfig): Promise<AnomalyReport>;
  detectOutliers(data: DataSet, column: string, method: OutlierMethod): Promise<OutlierResult>;
  
  // Time series anomalies
  detectTimeSeriesAnomalies(data: TimeSeriesData, config: TimeSeriesAnomalyConfig): Promise<TimeSeriesAnomalyReport>;
  
  // Pattern anomalies
  detectPatternAnomalies(data: DataSet, expectedPatterns: Pattern[]): Promise<PatternAnomalyReport>;
  
  // Model-based detection
  trainAnomalyModel(data: DataSet, config: ModelConfig): Promise<AnomalyModel>;
  predictAnomalies(model: AnomalyModel, data: DataSet): Promise<AnomalyPrediction[]>;
}

interface AnomalyConfig {
  methods: AnomalyMethod[];
  sensitivity: number;
  columns?: string[];
  contextColumns?: string[];
  windowSize?: number;
  minSamples?: number;
}

enum AnomalyMethod {
  STATISTICAL = 'statistical',
  ISOLATION_FOREST = 'isolation_forest',
  LOCAL_OUTLIER_FACTOR = 'local_outlier_factor',
  DBSCAN = 'dbscan',
  AUTOENCODER = 'autoencoder',
  PROPHET = 'prophet',
  CUSTOM = 'custom'
}

interface AnomalyReport {
  totalRecords: number;
  anomalyCount: number;
  anomalyRate: number;
  anomalies: Anomaly[];
  summary: AnomalySummary;
  recommendations: string[];
}

interface Anomaly {
  recordId: string;
  column?: string;
  value: unknown;
  expectedRange?: [number, number];
  anomalyScore: number;
  anomalyType: AnomalyType;
  context?: Record<string, unknown>;
  explanation?: string;
}

enum AnomalyType {
  OUTLIER = 'outlier',
  MISSING = 'missing',
  DUPLICATE = 'duplicate',
  FORMAT = 'format',
  RANGE = 'range',
  PATTERN = 'pattern',
  TEMPORAL = 'temporal',
  REFERENTIAL = 'referential'
}

interface OutlierMethod {
  type: 'zscore' | 'iqr' | 'mad' | 'isolation_forest' | 'lof';
  threshold?: number;
  contamination?: number;
}
```

### Data Lineage Engine

```typescript
interface DataLineageEngine {
  // Lineage tracking
  trackLineage(operation: DataOperation): Promise<LineageRecord>;
  getLineage(datasetId: string): Promise<LineageGraph>;
  getUpstreamLineage(datasetId: string, depth?: number): Promise<LineageNode[]>;
  getDownstreamLineage(datasetId: string, depth?: number): Promise<LineageNode[]>;
  
  // Impact analysis
  analyzeImpact(datasetId: string): Promise<ImpactAnalysis>;
  findAffectedDatasets(sourceId: string): Promise<string[]>;
  
  // Column-level lineage
  getColumnLineage(datasetId: string, column: string): Promise<ColumnLineage>;
  traceColumnOrigin(datasetId: string, column: string): Promise<ColumnOrigin[]>;
}

interface LineageGraph {
  nodes: LineageNode[];
  edges: LineageEdge[];
  metadata: LineageMetadata;
}

interface LineageNode {
  id: string;
  type: LineageNodeType;
  name: string;
  description?: string;
  schema?: DataSchema;
  location?: string;
  owner?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

enum LineageNodeType {
  SOURCE = 'source',
  TRANSFORMATION = 'transformation',
  DESTINATION = 'destination',
  MODEL = 'model',
  REPORT = 'report',
  API = 'api'
}

interface LineageEdge {
  sourceId: string;
  targetId: string;
  transformationType?: string;
  columnMappings?: ColumnMapping[];
  createdAt: Date;
  jobId?: string;
}

interface ColumnLineage {
  column: string;
  datasetId: string;
  origins: ColumnOrigin[];
  transformations: ColumnTransformation[];
  consumers: ColumnConsumer[];
}

interface ColumnOrigin {
  datasetId: string;
  column: string;
  transformation?: string;
  confidence: number;
}

interface ImpactAnalysis {
  sourceDataset: string;
  affectedDatasets: AffectedDataset[];
  affectedReports: string[];
  affectedModels: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
}
```


### Quality Monitoring Service

```typescript
interface QualityMonitoringService {
  // Monitor management
  createMonitor(config: QualityMonitorConfig): Promise<string>;
  updateMonitor(monitorId: string, config: Partial<QualityMonitorConfig>): Promise<void>;
  deleteMonitor(monitorId: string): Promise<void>;
  
  // Execution
  runMonitor(monitorId: string): Promise<MonitorResult>;
  scheduleMonitor(monitorId: string, schedule: CronSchedule): Promise<void>;
  
  // Results
  getMonitorHistory(monitorId: string, timeRange: TimeRange): Promise<MonitorResult[]>;
  getQualityTrends(datasetId: string, metrics: string[], timeRange: TimeRange): Promise<QualityTrend[]>;
}

interface QualityMonitorConfig {
  id: string;
  name: string;
  datasetId: string;
  rules: QualityRule[];
  schedule?: CronSchedule;
  alertConfig?: AlertConfig;
  notificationChannels?: string[];
  enabled: boolean;
}

interface MonitorResult {
  monitorId: string;
  datasetId: string;
  executedAt: Date;
  duration: number;
  overallScore: number;
  ruleResults: RuleResult[];
  alerts: Alert[];
  status: 'passed' | 'warning' | 'failed';
}

interface RuleResult {
  ruleId: string;
  ruleName: string;
  dimension: QualityDimension;
  passed: boolean;
  actualValue: number;
  threshold: number;
  severity: string;
  details?: Record<string, unknown>;
}

interface QualityTrend {
  metric: string;
  dataPoints: TrendDataPoint[];
  trend: 'improving' | 'stable' | 'degrading';
  changeRate: number;
}

interface AlertConfig {
  conditions: AlertCondition[];
  cooldownPeriod: number;
  escalationPolicy?: EscalationPolicy;
}

interface AlertCondition {
  metric: string;
  operator: 'lt' | 'gt' | 'eq' | 'ne' | 'lte' | 'gte';
  threshold: number;
  severity: 'info' | 'warning' | 'critical';
  message: string;
}
```

## Implementation Patterns

### Comprehensive Data Profiler

```typescript
class ComprehensiveDataProfiler {
  async profile(data: DataSet, options: ProfilingOptions = {}): Promise<DataProfile> {
    const startTime = Date.now();
    const sampleData = options.sampleSize 
      ? this.sampleData(data, options.sampleSize, options.sampleMethod)
      : data;

    // Profile each column
    const columnProfiles = await Promise.all(
      this.getColumnNames(sampleData).map(col => this.profileColumn(sampleData, col, options))
    );

    // Calculate correlations if requested
    const correlations = options.includeCorrelations
      ? await this.calculateCorrelations(sampleData, columnProfiles)
      : undefined;

    // Detect duplicates
    const duplicateRows = await this.countDuplicates(sampleData);

    // Missing value summary
    const missingValueSummary = this.summarizeMissingValues(columnProfiles);

    return {
      datasetId: this.generateDatasetId(data),
      rowCount: data.length,
      columnCount: columnProfiles.length,
      columns: columnProfiles,
      correlations,
      duplicateRows,
      missingValueSummary,
      profiledAt: new Date(),
      profilingDuration: Date.now() - startTime
    };
  }

  private async profileColumn(
    data: DataSet,
    columnName: string,
    options: ProfilingOptions
  ): Promise<ColumnProfile> {
    const values = data.map(row => row[columnName]);
    const dataType = this.inferDataType(values);

    const nullCount = values.filter(v => v === null || v === undefined).length;
    const nonNullValues = values.filter(v => v !== null && v !== undefined);
    const uniqueValues = new Set(nonNullValues);

    const profile: ColumnProfile = {
      name: columnName,
      dataType,
      inferredType: dataType,
      nullCount,
      nullPercentage: (nullCount / values.length) * 100,
      uniqueCount: uniqueValues.size,
      uniquePercentage: (uniqueValues.size / nonNullValues.length) * 100
    };

    // Add type-specific statistics
    if (this.isNumericType(dataType)) {
      profile.statistics = this.calculateNumericStatistics(nonNullValues as number[]);
    } else if (dataType === 'string') {
      profile.statistics = this.calculateStringStatistics(nonNullValues as string[]);
    } else if (this.isDateType(dataType)) {
      profile.statistics = this.calculateDateStatistics(nonNullValues as Date[]);
    }

    // Add distribution if requested
    if (options.includeDistributions) {
      profile.distribution = this.calculateDistribution(nonNullValues, options.histogramBins);
    }

    // Add top values
    profile.topValues = this.getTopValues(nonNullValues, options.maxUniqueValues || 10);

    // Add pattern analysis if requested
    if (options.includePatterns && dataType === 'string') {
      profile.patterns = this.analyzePatterns(nonNullValues as string[]);
    }

    return profile;
  }

  private calculateNumericStatistics(values: number[]): NumericStatistics {
    const sorted = [...values].sort((a, b) => a - b);
    const n = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / n;

    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
    const std = Math.sqrt(variance);

    return {
      min: sorted[0],
      max: sorted[n - 1],
      mean,
      median: n % 2 === 0 ? (sorted[n/2 - 1] + sorted[n/2]) / 2 : sorted[Math.floor(n/2)],
      mode: this.calculateMode(values),
      standardDeviation: std,
      variance,
      skewness: this.calculateSkewness(values, mean, std),
      kurtosis: this.calculateKurtosis(values, mean, std),
      percentiles: this.calculatePercentiles(sorted, [25, 50, 75, 90, 95, 99]),
      outlierCount: this.countOutliers(values, mean, std)
    };
  }
}
```


### Quality Rule Engine

```typescript
class QualityRuleEngine {
  private rules: Map<string, QualityRule> = new Map();

  async evaluateRules(data: DataSet, rules: QualityRule[]): Promise<QualityAssessment> {
    const results: RuleResult[] = [];
    const dimensionScores: Map<QualityDimension, number[]> = new Map();

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const result = await this.evaluateRule(data, rule);
      results.push(result);

      // Track scores by dimension
      const scores = dimensionScores.get(rule.dimension) || [];
      scores.push(result.passed ? 1 : 0);
      dimensionScores.set(rule.dimension, scores);
    }

    // Calculate dimension scores
    const dimensions: DimensionScore[] = [];
    for (const [dimension, scores] of dimensionScores) {
      dimensions.push({
        dimension,
        score: scores.reduce((a, b) => a + b, 0) / scores.length,
        ruleCount: scores.length,
        passedCount: scores.filter(s => s === 1).length
      });
    }

    // Calculate overall score
    const overallScore = this.calculateOverallScore(dimensions);

    return {
      datasetId: this.getDatasetId(data),
      evaluatedAt: new Date(),
      overallScore,
      dimensions,
      ruleResults: results,
      status: this.determineStatus(overallScore, results)
    };
  }

  private async evaluateRule(data: DataSet, rule: QualityRule): Promise<RuleResult> {
    let actualValue: number;

    switch (rule.type) {
      case QualityRuleType.COMPLETENESS:
        actualValue = this.evaluateCompleteness(data, rule);
        break;
      case QualityRuleType.UNIQUENESS:
        actualValue = this.evaluateUniqueness(data, rule);
        break;
      case QualityRuleType.VALIDITY:
        actualValue = this.evaluateValidity(data, rule);
        break;
      case QualityRuleType.CONSISTENCY:
        actualValue = this.evaluateConsistency(data, rule);
        break;
      case QualityRuleType.ACCURACY:
        actualValue = this.evaluateAccuracy(data, rule);
        break;
      case QualityRuleType.TIMELINESS:
        actualValue = this.evaluateTimeliness(data, rule);
        break;
      case QualityRuleType.CUSTOM:
        actualValue = await this.evaluateCustomRule(data, rule);
        break;
      default:
        throw new Error(`Unknown rule type: ${rule.type}`);
    }

    const passed = this.checkThreshold(actualValue, rule.threshold, rule.condition.operator);

    return {
      ruleId: rule.id,
      ruleName: rule.name,
      dimension: rule.dimension,
      passed,
      actualValue,
      threshold: rule.threshold,
      severity: rule.severity
    };
  }

  private evaluateCompleteness(data: DataSet, rule: QualityRule): number {
    if (!rule.column) {
      // Overall completeness
      const totalCells = data.length * Object.keys(data[0] || {}).length;
      const nullCells = data.reduce((count, row) => {
        return count + Object.values(row).filter(v => v === null || v === undefined).length;
      }, 0);
      return ((totalCells - nullCells) / totalCells) * 100;
    }

    // Column completeness
    const values = data.map(row => row[rule.column!]);
    const nonNullCount = values.filter(v => v !== null && v !== undefined).length;
    return (nonNullCount / values.length) * 100;
  }

  private evaluateUniqueness(data: DataSet, rule: QualityRule): number {
    const column = rule.column!;
    const values = data.map(row => row[column]).filter(v => v !== null);
    const uniqueValues = new Set(values);
    return (uniqueValues.size / values.length) * 100;
  }

  private evaluateValidity(data: DataSet, rule: QualityRule): number {
    const column = rule.column!;
    const values = data.map(row => row[column]);
    const validCount = values.filter(v => this.isValidValue(v, rule.condition)).length;
    return (validCount / values.length) * 100;
  }
}
```

### Lineage Tracker

```typescript
class DataLineageTracker {
  private lineageStore: LineageStore;

  async trackOperation(operation: DataOperation): Promise<LineageRecord> {
    const record: LineageRecord = {
      id: this.generateId(),
      operationType: operation.type,
      sourceDatasets: operation.sources,
      targetDataset: operation.target,
      transformation: operation.transformation,
      columnMappings: operation.columnMappings,
      executedAt: new Date(),
      executedBy: operation.user,
      jobId: operation.jobId,
      metadata: operation.metadata
    };

    await this.lineageStore.save(record);
    await this.updateLineageGraph(record);

    return record;
  }

  async getLineageGraph(datasetId: string): Promise<LineageGraph> {
    const upstream = await this.getUpstreamLineage(datasetId);
    const downstream = await this.getDownstreamLineage(datasetId);

    const nodes = new Map<string, LineageNode>();
    const edges: LineageEdge[] = [];

    // Build graph from upstream and downstream
    for (const node of [...upstream, ...downstream]) {
      nodes.set(node.id, node);
    }

    // Add current dataset
    const currentNode = await this.getDatasetNode(datasetId);
    nodes.set(datasetId, currentNode);

    // Build edges
    const records = await this.lineageStore.getRecordsForDataset(datasetId);
    for (const record of records) {
      for (const sourceId of record.sourceDatasets) {
        edges.push({
          sourceId,
          targetId: record.targetDataset,
          transformationType: record.transformation?.type,
          columnMappings: record.columnMappings,
          createdAt: record.executedAt,
          jobId: record.jobId
        });
      }
    }

    return {
      nodes: Array.from(nodes.values()),
      edges,
      metadata: {
        generatedAt: new Date(),
        rootDataset: datasetId
      }
    };
  }

  async analyzeImpact(datasetId: string): Promise<ImpactAnalysis> {
    const downstream = await this.getDownstreamLineage(datasetId, 10);
    
    const affectedDatasets: AffectedDataset[] = downstream.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      distance: this.calculateDistance(datasetId, node.id),
      impactLevel: this.assessImpactLevel(node)
    }));

    const affectedReports = affectedDatasets
      .filter(d => d.type === 'report')
      .map(d => d.id);

    const affectedModels = affectedDatasets
      .filter(d => d.type === 'model')
      .map(d => d.id);

    const riskLevel = this.calculateRiskLevel(affectedDatasets);

    return {
      sourceDataset: datasetId,
      affectedDatasets,
      affectedReports,
      affectedModels,
      riskLevel,
      recommendations: this.generateRecommendations(affectedDatasets, riskLevel)
    };
  }
}
```


## Integration Points

### Great Expectations Integration

```typescript
// Integration with Great Expectations for data validation
class GreatExpectationsIntegration {
  async createExpectationSuite(config: ExpectationSuiteConfig): Promise<string> {
    const suite = {
      expectation_suite_name: config.name,
      expectations: config.rules.map(rule => this.convertToExpectation(rule)),
      meta: {
        created_by: config.createdBy,
        created_at: new Date().toISOString()
      }
    };

    await this.saveExpectationSuite(suite);
    return suite.expectation_suite_name;
  }

  async validateData(datasetPath: string, suiteName: string): Promise<ValidationResult> {
    const result = await this.runValidation(datasetPath, suiteName);
    
    return {
      success: result.success,
      statistics: result.statistics,
      results: result.results.map(r => ({
        expectationType: r.expectation_config.expectation_type,
        success: r.success,
        observedValue: r.result.observed_value,
        details: r.result
      }))
    };
  }

  private convertToExpectation(rule: QualityRule): Expectation {
    switch (rule.type) {
      case QualityRuleType.COMPLETENESS:
        return {
          expectation_type: 'expect_column_values_to_not_be_null',
          kwargs: { column: rule.column, mostly: rule.threshold / 100 }
        };
      case QualityRuleType.UNIQUENESS:
        return {
          expectation_type: 'expect_column_values_to_be_unique',
          kwargs: { column: rule.column }
        };
      case QualityRuleType.VALIDITY:
        return this.convertValidityRule(rule);
      default:
        throw new Error(`Unsupported rule type: ${rule.type}`);
    }
  }
}
```

### Apache Atlas Integration

```typescript
// Integration with Apache Atlas for lineage and metadata
class ApacheAtlasIntegration {
  private atlasClient: AtlasClient;

  async registerDataset(dataset: DatasetMetadata): Promise<string> {
    const entity = {
      typeName: 'DataSet',
      attributes: {
        name: dataset.name,
        qualifiedName: dataset.qualifiedName,
        description: dataset.description,
        owner: dataset.owner,
        createTime: Date.now(),
        columns: dataset.columns.map(col => ({
          name: col.name,
          type: col.type,
          description: col.description
        }))
      }
    };

    const response = await this.atlasClient.createEntity(entity);
    return response.guid;
  }

  async createLineage(lineage: LineageInfo): Promise<void> {
    const process = {
      typeName: 'Process',
      attributes: {
        name: lineage.processName,
        qualifiedName: lineage.qualifiedName,
        inputs: lineage.inputs.map(i => ({ guid: i })),
        outputs: lineage.outputs.map(o => ({ guid: o }))
      }
    };

    await this.atlasClient.createEntity(process);
  }

  async getLineage(guid: string, direction: 'INPUT' | 'OUTPUT' | 'BOTH'): Promise<AtlasLineage> {
    return this.atlasClient.getLineage(guid, direction);
  }
}
```

### Monitoring Dashboard Integration

```typescript
// Integration with monitoring dashboards (Grafana, DataDog)
class QualityDashboardIntegration {
  async publishMetrics(metrics: QualityMetrics): Promise<void> {
    // Publish to Prometheus/Grafana
    await this.prometheusClient.pushMetrics([
      { name: 'data_quality_score', value: metrics.overallScore, labels: { dataset: metrics.datasetId } },
      { name: 'data_completeness', value: metrics.completeness, labels: { dataset: metrics.datasetId } },
      { name: 'data_uniqueness', value: metrics.uniqueness, labels: { dataset: metrics.datasetId } },
      { name: 'data_validity', value: metrics.validity, labels: { dataset: metrics.datasetId } },
      { name: 'anomaly_count', value: metrics.anomalyCount, labels: { dataset: metrics.datasetId } }
    ]);

    // Publish to DataDog
    await this.datadogClient.gauge('data.quality.score', metrics.overallScore, {
      tags: [`dataset:${metrics.datasetId}`]
    });
  }

  async createDashboard(config: DashboardConfig): Promise<string> {
    const dashboard = {
      title: config.title,
      panels: [
        this.createQualityScorePanel(config),
        this.createDimensionBreakdownPanel(config),
        this.createTrendPanel(config),
        this.createAlertPanel(config)
      ]
    };

    return this.grafanaClient.createDashboard(dashboard);
  }
}
```

## Security Considerations

### Data Access Control
- Implement role-based access for quality reports and lineage data
- Restrict access to sensitive column profiles and statistics
- Audit all data quality assessment executions
- Encrypt quality metrics and lineage data at rest

### Privacy Protection
- Apply data masking in profiling results for PII columns
- Implement differential privacy for statistical summaries
- Restrict lineage visibility based on data classification
- Support data subject access requests for lineage information

### Compliance
- Maintain audit trails for all quality assessments
- Support regulatory reporting requirements
- Implement data retention policies for quality history
- Enable lineage tracking for compliance audits

## Testing Considerations

### Unit Testing

```typescript
describe('DataQualityService', () => {
  it('should calculate completeness correctly', async () => {
    const data = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: null, age: 25 },
      { id: 3, name: 'Jane', age: null }
    ];
    
    const rule = { type: 'completeness', column: 'name', threshold: 80 };
    const result = await qualityService.evaluateRule(data, rule);
    
    expect(result.actualValue).toBeCloseTo(66.67, 1);
    expect(result.passed).toBe(false);
  });

  it('should detect data drift between profiles', async () => {
    const baseline = await profiler.profile(baselineData);
    const current = await profiler.profile(currentData);
    
    const drift = profiler.detectDrift(baseline, current);
    
    expect(drift.hasDrift).toBe(true);
    expect(drift.columnDrifts.length).toBeGreaterThan(0);
  });
});
```

### Property-Based Testing

```typescript
describe('Data Quality Properties', () => {
  it('should always return quality score between 0 and 100', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ id: fc.integer(), value: fc.option(fc.string()) })),
      async (data) => {
        const assessment = await qualityService.assessQuality(data, rules);
        expect(assessment.overallScore).toBeGreaterThanOrEqual(0);
        expect(assessment.overallScore).toBeLessThanOrEqual(100);
      }
    ));
  });

  it('should maintain lineage graph consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.record({ source: fc.string(), target: fc.string() })),
      async (operations) => {
        for (const op of operations) {
          await lineageTracker.trackOperation(op);
        }
        const graph = await lineageTracker.getLineageGraph(operations[0]?.target);
        expect(graph.nodes.length).toBeGreaterThanOrEqual(graph.edges.length);
      }
    ));
  });
});
```
