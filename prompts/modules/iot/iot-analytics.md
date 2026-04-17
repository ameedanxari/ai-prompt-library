# IoT Analytics Template

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

This template provides comprehensive patterns for implementing device performance analytics, predictive maintenance insights, fleet analytics, and operational intelligence in IoT applications. It covers real-time analytics, historical analysis, anomaly detection, and business intelligence for IoT data.

## Context

IoT analytics transforms raw device data into actionable insights for operational optimization, predictive maintenance, and business decision-making. This template addresses the implementation of analytics systems that can process high-volume IoT data while delivering real-time insights and long-term trend analysis.

## Core Components

### Device Performance Analytics Service

## Examples

```typescript
interface DevicePerformanceAnalyticsService {
  getDevicePerformance(deviceId: string, timeRange: TimeRange): Promise<DevicePerformance>;
  getFleetPerformance(filter?: DeviceFilter): Promise<FleetPerformance>;
  compareDevices(deviceIds: string[], metrics: string[]): Promise<DeviceComparison>;
  getPerformanceTrends(deviceId: string, metric: string, periods: number): Promise<PerformanceTrend>;
  setPerformanceBaseline(deviceId: string, baseline: PerformanceBaseline): Promise<void>;
  getPerformanceAlerts(filter?: AlertFilter): Promise<PerformanceAlert[]>;
}

interface DevicePerformance {
  deviceId: string;
  timeRange: TimeRange;
  uptime: number;
  availability: number;
  efficiency: number;
  utilization: number;
  errorRate: number;
  metrics: PerformanceMetric[];
  kpis: KPIValue[];
  healthScore: number;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  avg: number;
  stdDev: number;
  percentiles: Record<number, number>;
  trend: TrendDirection;
}

enum TrendDirection {
  INCREASING = 'increasing',
  DECREASING = 'decreasing',
  STABLE = 'stable',
  VOLATILE = 'volatile'
}


interface FleetPerformance {
  totalDevices: number;
  activeDevices: number;
  averageUptime: number;
  averageEfficiency: number;
  topPerformers: DeviceRanking[];
  bottomPerformers: DeviceRanking[];
  aggregateMetrics: AggregateMetric[];
  alerts: PerformanceAlert[];
}

interface DeviceRanking {
  deviceId: string;
  deviceName: string;
  score: number;
  rank: number;
  metrics: Record<string, number>;
}

interface KPIValue {
  kpi: string;
  value: number;
  target: number;
  status: KPIStatus;
  trend: TrendDirection;
  previousValue?: number;
}

enum KPIStatus {
  ON_TARGET = 'on_target',
  ABOVE_TARGET = 'above_target',
  BELOW_TARGET = 'below_target',
  CRITICAL = 'critical'
}
```

### Anomaly Detection Service

```typescript
interface AnomalyDetectionService {
  detectAnomalies(deviceId: string, data: SensorData[]): Promise<Anomaly[]>;
  trainModel(deviceId: string, historicalData: SensorData[]): Promise<AnomalyModel>;
  updateModel(modelId: string, newData: SensorData[]): Promise<void>;
  getAnomalyHistory(deviceId: string, timeRange: TimeRange): Promise<Anomaly[]>;
  setAnomalyThresholds(deviceId: string, thresholds: AnomalyThresholds): Promise<void>;
  subscribeToAnomalies(deviceId: string, callback: AnomalyCallback): Subscription;
}

interface Anomaly {
  id: string;
  deviceId: string;
  sensorId?: string;
  type: AnomalyType;
  severity: AnomalySeverity;
  score: number;
  detectedAt: Date;
  startTime: Date;
  endTime?: Date;
  affectedMetrics: string[];
  expectedValue?: number;
  actualValue: number;
  context: AnomalyContext;
  possibleCauses: PossibleCause[];
}

enum AnomalyType {
  POINT = 'point',
  CONTEXTUAL = 'contextual',
  COLLECTIVE = 'collective',
  SEASONAL = 'seasonal',
  TREND = 'trend',
  LEVEL_SHIFT = 'level_shift'
}

enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface AnomalyContext {
  historicalMean: number;
  historicalStdDev: number;
  recentTrend: TrendDirection;
  correlatedDevices: string[];
  environmentalFactors?: Record<string, unknown>;
}

interface PossibleCause {
  cause: string;
  probability: number;
  evidence: string[];
  recommendedAction: string;
}

interface AnomalyModel {
  id: string;
  deviceId: string;
  algorithm: AnomalyAlgorithm;
  trainedAt: Date;
  dataPoints: number;
  accuracy: number;
  parameters: Record<string, unknown>;
}

enum AnomalyAlgorithm {
  ISOLATION_FOREST = 'isolation_forest',
  AUTOENCODER = 'autoencoder',
  LSTM = 'lstm',
  STATISTICAL = 'statistical',
  PROPHET = 'prophet',
  ENSEMBLE = 'ensemble'
}
```

### Operational Intelligence Service

```typescript
interface OperationalIntelligenceService {
  getDashboard(dashboardId: string): Promise<Dashboard>;
  createDashboard(config: DashboardConfig): Promise<Dashboard>;
  getInsights(filter?: InsightFilter): Promise<Insight[]>;
  generateReport(config: ReportConfig): Promise<Report>;
  scheduleReport(config: ScheduledReportConfig): Promise<string>;
  getRecommendations(context: OperationalContext): Promise<Recommendation[]>;
}

interface Dashboard {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  filters: DashboardFilter[];
  refreshInterval: number;
  layout: DashboardLayout;
}

interface DashboardWidget {
  id: string;
  type: WidgetType;
  title: string;
  dataSource: DataSourceConfig;
  visualization: VisualizationConfig;
  position: WidgetPosition;
  size: WidgetSize;
}

enum WidgetType {
  METRIC = 'metric',
  CHART = 'chart',
  TABLE = 'table',
  MAP = 'map',
  GAUGE = 'gauge',
  HEATMAP = 'heatmap',
  ALERT_LIST = 'alert_list',
  DEVICE_STATUS = 'device_status'
}

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  impact: ImpactLevel;
  confidence: number;
  generatedAt: Date;
  relatedDevices: string[];
  relatedMetrics: string[];
  actionable: boolean;
  suggestedActions: string[];
}

enum InsightType {
  PERFORMANCE = 'performance',
  EFFICIENCY = 'efficiency',
  COST = 'cost',
  MAINTENANCE = 'maintenance',
  ANOMALY = 'anomaly',
  TREND = 'trend',
  CORRELATION = 'correlation'
}

enum ImpactLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface Recommendation {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  priority: Priority;
  estimatedImpact: EstimatedImpact;
  implementation: ImplementationGuide;
  relatedInsights: string[];
}

enum RecommendationType {
  OPTIMIZATION = 'optimization',
  MAINTENANCE = 'maintenance',
  CONFIGURATION = 'configuration',
  REPLACEMENT = 'replacement',
  SCALING = 'scaling'
}

interface EstimatedImpact {
  costSavings?: number;
  efficiencyGain?: number;
  downtimeReduction?: number;
  energySavings?: number;
  timeframe: string;
}
```

## Implementation Patterns

### Real-Time Performance Analytics

```typescript
class RealTimePerformanceAnalytics implements DevicePerformanceAnalyticsService {
  private metricsStore: MetricsStore;
  private baselineStore: BaselineStore;
  private alertEngine: AlertEngine;

  async getDevicePerformance(deviceId: string, timeRange: TimeRange): Promise<DevicePerformance> {
    const metrics = await this.metricsStore.query({
      deviceId,
      startTime: timeRange.start,
      endTime: timeRange.end
    });

    const baseline = await this.baselineStore.get(deviceId);

    // Calculate uptime
    const uptime = this.calculateUptime(metrics);

    // Calculate availability
    const availability = this.calculateAvailability(metrics, timeRange);

    // Calculate efficiency
    const efficiency = this.calculateEfficiency(metrics, baseline);

    // Calculate utilization
    const utilization = this.calculateUtilization(metrics);

    // Calculate error rate
    const errorRate = this.calculateErrorRate(metrics);

    // Process individual metrics
    const processedMetrics = this.processMetrics(metrics);

    // Calculate KPIs
    const kpis = this.calculateKPIs(metrics, baseline);

    // Calculate health score
    const healthScore = this.calculateHealthScore({
      uptime,
      availability,
      efficiency,
      utilization,
      errorRate
    });

    return {
      deviceId,
      timeRange,
      uptime,
      availability,
      efficiency,
      utilization,
      errorRate,
      metrics: processedMetrics,
      kpis,
      healthScore
    };
  }

  private calculateEfficiency(metrics: MetricData[], baseline?: PerformanceBaseline): number {
    if (!baseline) return 0;

    const actualOutput = metrics
      .filter(m => m.name === 'output')
      .reduce((sum, m) => sum + m.value, 0);

    const expectedOutput = baseline.expectedOutput * metrics.length;

    return Math.min(100, (actualOutput / expectedOutput) * 100);
  }

  private calculateHealthScore(factors: HealthFactors): number {
    const weights = {
      uptime: 0.25,
      availability: 0.25,
      efficiency: 0.20,
      utilization: 0.15,
      errorRate: 0.15
    };

    const normalizedErrorRate = Math.max(0, 100 - factors.errorRate * 10);

    return (
      factors.uptime * weights.uptime +
      factors.availability * weights.availability +
      factors.efficiency * weights.efficiency +
      factors.utilization * weights.utilization +
      normalizedErrorRate * weights.errorRate
    );
  }

  async getFleetPerformance(filter?: DeviceFilter): Promise<FleetPerformance> {
    const devices = await this.deviceService.listDevices(filter);
    const performances: DevicePerformance[] = [];

    for (const device of devices) {
      const perf = await this.getDevicePerformance(device.id, {
        start: new Date(Date.now() - 24 * 60 * 60 * 1000),
        end: new Date()
      });
      performances.push(perf);
    }

    // Calculate fleet aggregates
    const activeDevices = performances.filter(p => p.uptime > 0).length;
    const averageUptime = this.average(performances.map(p => p.uptime));
    const averageEfficiency = this.average(performances.map(p => p.efficiency));

    // Rank devices
    const ranked = performances
      .map(p => ({
        deviceId: p.deviceId,
        deviceName: p.deviceId,
        score: p.healthScore,
        rank: 0,
        metrics: {
          uptime: p.uptime,
          efficiency: p.efficiency,
          errorRate: p.errorRate
        }
      }))
      .sort((a, b) => b.score - a.score)
      .map((d, i) => ({ ...d, rank: i + 1 }));

    return {
      totalDevices: devices.length,
      activeDevices,
      averageUptime,
      averageEfficiency,
      topPerformers: ranked.slice(0, 5),
      bottomPerformers: ranked.slice(-5).reverse(),
      aggregateMetrics: this.aggregateMetrics(performances),
      alerts: await this.alertEngine.getActiveAlerts(filter)
    };
  }
}
```

### ML-Based Anomaly Detection

```typescript
class MLAnomalyDetectionService implements AnomalyDetectionService {
  private models: Map<string, AnomalyModel> = new Map();
  private anomalyHistory: Map<string, Anomaly[]> = new Map();

  async detectAnomalies(deviceId: string, data: SensorData[]): Promise<Anomaly[]> {
    const model = this.models.get(deviceId);
    if (!model) {
      // Use statistical detection as fallback
      return this.statisticalDetection(deviceId, data);
    }

    const anomalies: Anomaly[] = [];

    switch (model.algorithm) {
      case AnomalyAlgorithm.ISOLATION_FOREST:
        anomalies.push(...await this.isolationForestDetection(model, data));
        break;
      case AnomalyAlgorithm.AUTOENCODER:
        anomalies.push(...await this.autoencoderDetection(model, data));
        break;
      case AnomalyAlgorithm.LSTM:
        anomalies.push(...await this.lstmDetection(model, data));
        break;
      case AnomalyAlgorithm.ENSEMBLE:
        anomalies.push(...await this.ensembleDetection(model, data));
        break;
    }

    // Enrich anomalies with context
    for (const anomaly of anomalies) {
      anomaly.context = await this.buildAnomalyContext(deviceId, anomaly);
      anomaly.possibleCauses = await this.identifyPossibleCauses(anomaly);
    }

    // Store in history
    this.storeAnomalies(deviceId, anomalies);

    return anomalies;
  }

  private async statisticalDetection(deviceId: string, data: SensorData[]): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    const history = await this.getHistoricalStats(deviceId);

    for (const reading of data) {
      const stats = history[reading.sensorId];
      if (!stats) continue;

      // Z-score based detection
      const zScore = Math.abs((reading.value as number - stats.mean) / stats.stdDev);

      if (zScore > 3) {
        anomalies.push({
          id: crypto.randomUUID(),
          deviceId,
          sensorId: reading.sensorId,
          type: AnomalyType.POINT,
          severity: this.mapZScoreToSeverity(zScore),
          score: zScore,
          detectedAt: new Date(),
          startTime: reading.timestamp,
          affectedMetrics: [reading.sensorId],
          expectedValue: stats.mean,
          actualValue: reading.value as number,
          context: {
            historicalMean: stats.mean,
            historicalStdDev: stats.stdDev,
            recentTrend: TrendDirection.STABLE,
            correlatedDevices: []
          },
          possibleCauses: []
        });
      }
    }

    return anomalies;
  }

  private async ensembleDetection(model: AnomalyModel, data: SensorData[]): Promise<Anomaly[]> {
    // Run multiple detection algorithms
    const isolationResults = await this.isolationForestDetection(model, data);
    const statisticalResults = await this.statisticalDetection(model.deviceId, data);

    // Combine results with voting
    const anomalyMap = new Map<string, { count: number; anomaly: Anomaly }>();

    for (const anomaly of [...isolationResults, ...statisticalResults]) {
      const key = `${anomaly.sensorId}-${anomaly.startTime.getTime()}`;
      const existing = anomalyMap.get(key);

      if (existing) {
        existing.count++;
        // Keep the higher severity
        if (this.severityToNumber(anomaly.severity) > this.severityToNumber(existing.anomaly.severity)) {
          existing.anomaly = anomaly;
        }
      } else {
        anomalyMap.set(key, { count: 1, anomaly });
      }
    }

    // Only return anomalies detected by multiple algorithms
    return Array.from(anomalyMap.values())
      .filter(entry => entry.count >= 2)
      .map(entry => entry.anomaly);
  }

  private async identifyPossibleCauses(anomaly: Anomaly): Promise<PossibleCause[]> {
    const causes: PossibleCause[] = [];

    // Check for correlated anomalies
    const correlatedAnomalies = await this.findCorrelatedAnomalies(anomaly);
    if (correlatedAnomalies.length > 0) {
      causes.push({
        cause: 'Correlated system issue',
        probability: 0.7,
        evidence: correlatedAnomalies.map(a => `Anomaly in ${a.sensorId}`),
        recommendedAction: 'Investigate upstream systems'
      });
    }

    // Check for maintenance correlation
    const recentMaintenance = await this.checkRecentMaintenance(anomaly.deviceId);
    if (recentMaintenance) {
      causes.push({
        cause: 'Post-maintenance adjustment',
        probability: 0.5,
        evidence: [`Maintenance performed ${recentMaintenance.hoursAgo} hours ago`],
        recommendedAction: 'Verify maintenance was completed correctly'
      });
    }

    // Check for environmental factors
    const envFactors = await this.checkEnvironmentalFactors(anomaly);
    if (envFactors.length > 0) {
      causes.push({
        cause: 'Environmental conditions',
        probability: 0.4,
        evidence: envFactors,
        recommendedAction: 'Monitor environmental conditions'
      });
    }

    return causes.sort((a, b) => b.probability - a.probability);
  }
}
```

## Integration Points

### Business Intelligence Integration

```typescript
class BIIntegration {
  private analyticsService: DevicePerformanceAnalyticsService;
  private biClient: BIClient;

  async syncToBISystem(): Promise<void> {
    // Export fleet performance data
    const fleetPerformance = await this.analyticsService.getFleetPerformance();

    await this.biClient.upsertDataset('iot_fleet_performance', {
      timestamp: new Date(),
      totalDevices: fleetPerformance.totalDevices,
      activeDevices: fleetPerformance.activeDevices,
      averageUptime: fleetPerformance.averageUptime,
      averageEfficiency: fleetPerformance.averageEfficiency
    });

    // Export device rankings
    for (const device of [...fleetPerformance.topPerformers, ...fleetPerformance.bottomPerformers]) {
      await this.biClient.upsertDataset('iot_device_rankings', {
        deviceId: device.deviceId,
        score: device.score,
        rank: device.rank,
        ...device.metrics
      });
    }
  }
}
```

### Cloud Analytics Integration

```typescript
class CloudAnalyticsIntegration {
  private awsIoTAnalytics: IoTAnalyticsClient;
  private azureTimeSeriesInsights: TimeSeriesInsightsClient;

  async exportToAWSIoTAnalytics(data: AnalyticsData): Promise<void> {
    await this.awsIoTAnalytics.send(new BatchPutMessageCommand({
      channelName: 'iot-analytics-channel',
      messages: data.records.map(record => ({
        messageId: crypto.randomUUID(),
        payload: JSON.stringify(record)
      }))
    }));
  }

  async queryAzureTimeSeriesInsights(query: TSIQuery): Promise<TSIResult> {
    return this.azureTimeSeriesInsights.query({
      searchSpan: {
        from: query.startTime,
        to: query.endTime
      },
      filter: query.filter,
      aggregateSeries: query.aggregations
    });
  }
}
```

## Security Considerations

### Data Security

- Encrypt analytics data at rest and in transit
- Implement role-based access to analytics dashboards
- Anonymize device data for aggregate analytics
- Audit all analytics queries and exports

### Model Security

- Protect ML models from adversarial attacks
- Validate input data before model inference
- Monitor model drift and performance degradation

## Compliance Guidelines

- GDPR considerations for device analytics
- Industry-specific reporting requirements
- Data retention policies for analytics data
- Audit trail requirements for compliance reporting

## Testing Considerations

### Property-Based Tests

```typescript
describe('IoT Analytics Properties', () => {
  it('should calculate health score within valid range', () => {
    fc.assert(fc.property(
      fc.record({
        uptime: fc.float({ min: 0, max: 100 }),
        availability: fc.float({ min: 0, max: 100 }),
        efficiency: fc.float({ min: 0, max: 100 }),
        utilization: fc.float({ min: 0, max: 100 }),
        errorRate: fc.float({ min: 0, max: 100 })
      }),
      (factors) => {
        const analytics = new RealTimePerformanceAnalytics();
        const score = analytics.calculateHealthScore(factors);

        // Health score should always be between 0 and 100
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    ));
  });

  it('should detect anomalies with z-score > 3', () => {
    fc.assert(fc.property(
      fc.record({
        mean: fc.float({ min: 0, max: 100 }),
        stdDev: fc.float({ min: 0.1, max: 10 }),
        multiplier: fc.float({ min: 3.1, max: 10 })
      }),
      async (params) => {
        const service = new MLAnomalyDetectionService();
        const anomalousValue = params.mean + params.stdDev * params.multiplier;

        const anomalies = await service.detectAnomalies('test-device', [{
          sensorId: 'test-sensor',
          value: anomalousValue,
          timestamp: new Date()
        }]);

        // Should detect anomaly when value is > 3 std devs from mean
        expect(anomalies.length).toBeGreaterThan(0);
      }
    ));
  });
});
```
