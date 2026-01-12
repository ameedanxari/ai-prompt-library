# Industrial IoT Template

## Purpose

This template provides comprehensive patterns for implementing industrial protocols, safety systems, predictive maintenance, and compliance features in Industrial IoT (IIoT) applications. It covers OPC UA, Modbus, industrial safety standards, and manufacturing-specific requirements.

## Context

Industrial IoT requires specialized approaches for connecting to industrial equipment, ensuring operational safety, maintaining regulatory compliance, and enabling predictive maintenance. This template addresses the implementation of IIoT systems that can operate reliably in demanding industrial environments while meeting strict safety and compliance requirements.

## Core Components

### Industrial Protocol Service

## Examples

```typescript
interface IndustrialProtocolService {
  connect(config: ProtocolConfig): Promise<IndustrialConnection>;
  disconnect(connectionId: string): Promise<void>;
  readTags(connectionId: string, tags: string[]): Promise<TagValue[]>;
  writeTags(connectionId: string, tags: TagWrite[]): Promise<WriteResult>;
  subscribe(connectionId: string, tags: string[], callback: TagCallback): Promise<Subscription>;
  browseNodes(connectionId: string, nodeId?: string): Promise<IndustrialNode[]>;
}

interface ProtocolConfig {
  protocol: IndustrialProtocol;
  endpoint: string;
  port?: number;
  credentials?: IndustrialCredentials;
  security?: SecurityConfig;
  timeout?: number;
  retryConfig?: RetryConfig;
}

enum IndustrialProtocol {
  OPC_UA = 'opc_ua',
  MODBUS_TCP = 'modbus_tcp',
  MODBUS_RTU = 'modbus_rtu',
  PROFINET = 'profinet',
  ETHERNET_IP = 'ethernet_ip',
  BACNET = 'bacnet',
  MQTT_SPARKPLUG = 'mqtt_sparkplug',
  DNP3 = 'dnp3',
  IEC_61850 = 'iec_61850'
}


interface TagValue {
  tag: string;
  value: unknown;
  quality: DataQuality;
  timestamp: Date;
  dataType: IndustrialDataType;
  unit?: string;
}

enum IndustrialDataType {
  BOOLEAN = 'boolean',
  INT16 = 'int16',
  INT32 = 'int32',
  INT64 = 'int64',
  UINT16 = 'uint16',
  UINT32 = 'uint32',
  FLOAT = 'float',
  DOUBLE = 'double',
  STRING = 'string',
  DATETIME = 'datetime',
  BYTE_ARRAY = 'byte_array'
}

interface IndustrialNode {
  nodeId: string;
  name: string;
  nodeClass: NodeClass;
  dataType?: IndustrialDataType;
  accessLevel?: AccessLevel;
  children?: IndustrialNode[];
  metadata: Record<string, unknown>;
}

enum NodeClass {
  OBJECT = 'object',
  VARIABLE = 'variable',
  METHOD = 'method',
  OBJECT_TYPE = 'object_type',
  VARIABLE_TYPE = 'variable_type',
  DATA_TYPE = 'data_type',
  VIEW = 'view'
}
```

### Safety System Service

```typescript
interface SafetySystemService {
  registerSafetyFunction(func: SafetyFunction): Promise<string>;
  evaluateSafetyConditions(): Promise<SafetyEvaluation>;
  triggerEmergencyStop(reason: string): Promise<void>;
  resetSafetySystem(authorization: SafetyAuthorization): Promise<void>;
  getSafetyStatus(): Promise<SafetyStatus>;
  getAlarms(filter?: AlarmFilter): Promise<SafetyAlarm[]>;
  acknowledgeAlarm(alarmId: string, userId: string): Promise<void>;
}

interface SafetyFunction {
  id: string;
  name: string;
  sil: SafetyIntegrityLevel;
  type: SafetyFunctionType;
  inputs: SafetyInput[];
  outputs: SafetyOutput[];
  logic: SafetyLogic;
  responseTime: number;
  testInterval: number;
}

enum SafetyIntegrityLevel {
  SIL_1 = 'sil_1',
  SIL_2 = 'sil_2',
  SIL_3 = 'sil_3',
  SIL_4 = 'sil_4'
}

enum SafetyFunctionType {
  EMERGENCY_STOP = 'emergency_stop',
  SAFETY_INTERLOCK = 'safety_interlock',
  PRESSURE_RELIEF = 'pressure_relief',
  TEMPERATURE_LIMIT = 'temperature_limit',
  SPEED_LIMIT = 'speed_limit',
  POSITION_LIMIT = 'position_limit',
  GUARD_MONITORING = 'guard_monitoring'
}

interface SafetyStatus {
  overallStatus: SafetyState;
  functions: SafetyFunctionStatus[];
  activeAlarms: SafetyAlarm[];
  lastEvaluation: Date;
  systemHealth: number;
}

enum SafetyState {
  SAFE = 'safe',
  WARNING = 'warning',
  DANGER = 'danger',
  EMERGENCY_STOP = 'emergency_stop',
  FAULT = 'fault'
}

interface SafetyAlarm {
  id: string;
  functionId: string;
  severity: AlarmSeverity;
  message: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  clearedAt?: Date;
  metadata: Record<string, unknown>;
}

enum AlarmSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ALARM = 'alarm',
  CRITICAL = 'critical',
  EMERGENCY = 'emergency'
}
```

### Predictive Maintenance Service

```typescript
interface PredictiveMaintenanceService {
  registerAsset(asset: IndustrialAsset): Promise<string>;
  updateAssetHealth(assetId: string, metrics: HealthMetrics): Promise<AssetHealth>;
  predictFailure(assetId: string): Promise<FailurePrediction>;
  scheduleMaintenace(assetId: string, maintenance: MaintenanceTask): Promise<string>;
  getMaintenanceSchedule(filter?: MaintenanceFilter): Promise<MaintenanceTask[]>;
  recordMaintenanceEvent(event: MaintenanceEvent): Promise<void>;
  getAssetLifecycle(assetId: string): Promise<AssetLifecycle>;
}

interface IndustrialAsset {
  id: string;
  name: string;
  type: AssetType;
  manufacturer: string;
  model: string;
  serialNumber: string;
  installationDate: Date;
  location: AssetLocation;
  specifications: AssetSpecifications;
  maintenanceSchedule: MaintenanceSchedule;
  sensors: AssetSensor[];
}

enum AssetType {
  MOTOR = 'motor',
  PUMP = 'pump',
  COMPRESSOR = 'compressor',
  CONVEYOR = 'conveyor',
  ROBOT = 'robot',
  CNC_MACHINE = 'cnc_machine',
  HEAT_EXCHANGER = 'heat_exchanger',
  VALVE = 'valve',
  TRANSFORMER = 'transformer',
  GENERATOR = 'generator'
}

interface AssetHealth {
  assetId: string;
  overallHealth: number;
  healthIndicators: HealthIndicator[];
  degradationRate: number;
  estimatedRemainingLife: number;
  lastUpdated: Date;
  trend: HealthTrend;
}

interface HealthIndicator {
  name: string;
  value: number;
  threshold: number;
  status: IndicatorStatus;
  weight: number;
}

enum IndicatorStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  CRITICAL = 'critical'
}

interface FailurePrediction {
  assetId: string;
  failureMode: string;
  probability: number;
  estimatedTimeToFailure: number;
  confidence: number;
  contributingFactors: ContributingFactor[];
  recommendedActions: RecommendedAction[];
  predictionDate: Date;
}

interface ContributingFactor {
  factor: string;
  impact: number;
  currentValue: number;
  normalRange: { min: number; max: number };
}

interface RecommendedAction {
  action: string;
  priority: ActionPriority;
  estimatedCost: number;
  estimatedDowntime: number;
  riskReduction: number;
}
```

## Implementation Patterns

### OPC UA Client Implementation

```typescript
class OPCUAClientService implements IndustrialProtocolService {
  private connections: Map<string, OPCUASession> = new Map();
  private subscriptions: Map<string, OPCUASubscription> = new Map();

  async connect(config: ProtocolConfig): Promise<IndustrialConnection> {
    const client = OPCUAClient.create({
      applicationName: 'IIoT Gateway',
      connectionStrategy: {
        initialDelay: 1000,
        maxRetry: config.retryConfig?.maxRetries || 5
      },
      securityMode: this.mapSecurityMode(config.security?.mode),
      securityPolicy: this.mapSecurityPolicy(config.security?.policy),
      endpointMustExist: false
    });

    await client.connect(config.endpoint);

    const session = await client.createSession({
      userName: config.credentials?.username,
      password: config.credentials?.password
    });

    const connectionId = crypto.randomUUID();
    this.connections.set(connectionId, session);

    return {
      id: connectionId,
      protocol: IndustrialProtocol.OPC_UA,
      status: 'connected',
      endpoint: config.endpoint,
      connectedAt: new Date()
    };
  }

  async readTags(connectionId: string, tags: string[]): Promise<TagValue[]> {
    const session = this.connections.get(connectionId);
    if (!session) throw new Error('Connection not found');

    const nodesToRead = tags.map(tag => ({
      nodeId: tag,
      attributeId: AttributeIds.Value
    }));

    const results = await session.read(nodesToRead);

    return results.map((result, index) => ({
      tag: tags[index],
      value: result.value.value,
      quality: this.mapQuality(result.statusCode),
      timestamp: result.sourceTimestamp || new Date(),
      dataType: this.mapDataType(result.value.dataType)
    }));
  }

  async subscribe(connectionId: string, tags: string[], callback: TagCallback): Promise<Subscription> {
    const session = this.connections.get(connectionId);
    if (!session) throw new Error('Connection not found');

    const subscription = await session.createSubscription2({
      requestedPublishingInterval: 100,
      requestedLifetimeCount: 1000,
      requestedMaxKeepAliveCount: 10,
      maxNotificationsPerPublish: 100,
      publishingEnabled: true,
      priority: 10
    });

    const monitoredItems = await subscription.monitorItems(
      tags.map(tag => ({
        nodeId: tag,
        attributeId: AttributeIds.Value
      })),
      { samplingInterval: 100, discardOldest: true, queueSize: 10 },
      TimestampsToReturn.Both
    );

    monitoredItems.on('changed', (item, dataValue) => {
      callback({
        tag: item.itemToMonitor.nodeId.toString(),
        value: dataValue.value.value,
        quality: this.mapQuality(dataValue.statusCode),
        timestamp: dataValue.sourceTimestamp || new Date(),
        dataType: this.mapDataType(dataValue.value.dataType)
      });
    });

    const subscriptionId = crypto.randomUUID();
    this.subscriptions.set(subscriptionId, subscription);

    return {
      id: subscriptionId,
      unsubscribe: async () => {
        await subscription.terminate();
        this.subscriptions.delete(subscriptionId);
      }
    };
  }
}
```

### Safety Interlock System

```typescript
class SafetyInterlockSystem implements SafetySystemService {
  private safetyFunctions: Map<string, SafetyFunction> = new Map();
  private alarms: Map<string, SafetyAlarm> = new Map();
  private currentState: SafetyState = SafetyState.SAFE;

  async evaluateSafetyConditions(): Promise<SafetyEvaluation> {
    const evaluation: SafetyEvaluation = {
      timestamp: new Date(),
      overallState: SafetyState.SAFE,
      functionResults: [],
      newAlarms: [],
      clearedAlarms: []
    };

    for (const [id, func] of this.safetyFunctions) {
      const result = await this.evaluateSafetyFunction(func);
      evaluation.functionResults.push(result);

      if (result.state !== SafetyState.SAFE) {
        // Create alarm if not already active
        if (!this.hasActiveAlarm(id)) {
          const alarm = this.createAlarm(func, result);
          this.alarms.set(alarm.id, alarm);
          evaluation.newAlarms.push(alarm);
        }

        // Update overall state (worst case)
        if (this.isWorseState(result.state, evaluation.overallState)) {
          evaluation.overallState = result.state;
        }
      } else {
        // Clear any active alarms for this function
        const clearedAlarms = this.clearAlarmsForFunction(id);
        evaluation.clearedAlarms.push(...clearedAlarms);
      }
    }

    // Handle emergency stop
    if (evaluation.overallState === SafetyState.EMERGENCY_STOP) {
      await this.executeEmergencyStop('Safety condition triggered');
    }

    this.currentState = evaluation.overallState;
    return evaluation;
  }

  private async evaluateSafetyFunction(func: SafetyFunction): Promise<SafetyFunctionResult> {
    const inputValues = await this.readSafetyInputs(func.inputs);
    const result = this.evaluateSafetyLogic(func.logic, inputValues);

    return {
      functionId: func.id,
      state: result.safe ? SafetyState.SAFE : this.mapToSafetyState(func.type),
      inputValues,
      evaluatedAt: new Date(),
      responseTime: result.responseTime
    };
  }

  async triggerEmergencyStop(reason: string): Promise<void> {
    this.currentState = SafetyState.EMERGENCY_STOP;

    // Execute all emergency stop outputs
    for (const func of this.safetyFunctions.values()) {
      if (func.type === SafetyFunctionType.EMERGENCY_STOP) {
        await this.executeSafetyOutputs(func.outputs, true);
      }
    }

    // Create emergency alarm
    const alarm: SafetyAlarm = {
      id: crypto.randomUUID(),
      functionId: 'emergency_stop',
      severity: AlarmSeverity.EMERGENCY,
      message: `Emergency stop triggered: ${reason}`,
      triggeredAt: new Date(),
      metadata: { reason }
    };

    this.alarms.set(alarm.id, alarm);

    // Log to safety audit trail
    await this.auditService.logSafetyEvent({
      type: 'emergency_stop',
      reason,
      timestamp: new Date()
    });
  }

  async resetSafetySystem(authorization: SafetyAuthorization): Promise<void> {
    // Verify authorization
    if (!await this.verifySafetyAuthorization(authorization)) {
      throw new Error('Unauthorized safety reset attempt');
    }

    // Verify all safety conditions are clear
    const evaluation = await this.evaluateSafetyConditions();
    if (evaluation.overallState !== SafetyState.SAFE) {
      throw new Error('Cannot reset: safety conditions not clear');
    }

    // Reset emergency stop outputs
    for (const func of this.safetyFunctions.values()) {
      if (func.type === SafetyFunctionType.EMERGENCY_STOP) {
        await this.executeSafetyOutputs(func.outputs, false);
      }
    }

    this.currentState = SafetyState.SAFE;

    // Log reset
    await this.auditService.logSafetyEvent({
      type: 'safety_reset',
      authorizedBy: authorization.userId,
      timestamp: new Date()
    });
  }
}
```

### ML-Based Predictive Maintenance

```typescript
class MLPredictiveMaintenanceService implements PredictiveMaintenanceService {
  private assets: Map<string, IndustrialAsset> = new Map();
  private healthHistory: Map<string, HealthMetrics[]> = new Map();
  private mlModels: Map<string, PredictionModel> = new Map();

  async predictFailure(assetId: string): Promise<FailurePrediction> {
    const asset = this.assets.get(assetId);
    if (!asset) throw new Error('Asset not found');

    const healthHistory = this.healthHistory.get(assetId) || [];
    const model = await this.getOrTrainModel(asset.type);

    // Prepare features
    const features = this.extractFeatures(healthHistory, asset);

    // Run prediction
    const prediction = await model.predict(features);

    // Identify contributing factors
    const factors = this.analyzeContributingFactors(features, prediction);

    // Generate recommendations
    const recommendations = this.generateRecommendations(asset, prediction, factors);

    return {
      assetId,
      failureMode: prediction.failureMode,
      probability: prediction.probability,
      estimatedTimeToFailure: prediction.timeToFailure,
      confidence: prediction.confidence,
      contributingFactors: factors,
      recommendedActions: recommendations,
      predictionDate: new Date()
    };
  }

  private extractFeatures(history: HealthMetrics[], asset: IndustrialAsset): PredictionFeatures {
    const recentMetrics = history.slice(-100);

    return {
      // Vibration features
      vibrationRMS: this.calculateRMS(recentMetrics.map(m => m.vibration)),
      vibrationPeak: Math.max(...recentMetrics.map(m => m.vibration)),
      vibrationTrend: this.calculateTrend(recentMetrics.map(m => m.vibration)),

      // Temperature features
      temperatureAvg: this.calculateAverage(recentMetrics.map(m => m.temperature)),
      temperatureMax: Math.max(...recentMetrics.map(m => m.temperature)),
      temperatureTrend: this.calculateTrend(recentMetrics.map(m => m.temperature)),

      // Operating hours
      operatingHours: asset.specifications.operatingHours,
      hoursSinceLastMaintenance: this.calculateHoursSinceLastMaintenance(asset),

      // Load features
      loadAvg: this.calculateAverage(recentMetrics.map(m => m.load)),
      loadVariability: this.calculateStdDev(recentMetrics.map(m => m.load)),

      // Asset age
      assetAge: this.calculateAssetAge(asset)
    };
  }

  private generateRecommendations(
    asset: IndustrialAsset,
    prediction: ModelPrediction,
    factors: ContributingFactor[]
  ): RecommendedAction[] {
    const recommendations: RecommendedAction[] = [];

    // High vibration recommendations
    const vibrationFactor = factors.find(f => f.factor === 'vibration');
    if (vibrationFactor && vibrationFactor.impact > 0.3) {
      recommendations.push({
        action: 'Inspect and balance rotating components',
        priority: ActionPriority.HIGH,
        estimatedCost: 500,
        estimatedDowntime: 4,
        riskReduction: 0.4
      });
    }

    // Temperature recommendations
    const tempFactor = factors.find(f => f.factor === 'temperature');
    if (tempFactor && tempFactor.impact > 0.3) {
      recommendations.push({
        action: 'Check cooling system and lubrication',
        priority: ActionPriority.HIGH,
        estimatedCost: 300,
        estimatedDowntime: 2,
        riskReduction: 0.35
      });
    }

    // Scheduled maintenance
    if (prediction.timeToFailure < asset.maintenanceSchedule.intervalHours) {
      recommendations.push({
        action: 'Schedule preventive maintenance',
        priority: ActionPriority.MEDIUM,
        estimatedCost: asset.maintenanceSchedule.estimatedCost,
        estimatedDowntime: asset.maintenanceSchedule.estimatedDowntime,
        riskReduction: 0.6
      });
    }

    return recommendations.sort((a, b) => 
      (b.riskReduction / b.estimatedCost) - (a.riskReduction / a.estimatedCost)
    );
  }
}
```

## Integration Points

### SCADA System Integration

```typescript
class SCADAIntegration {
  private protocolService: IndustrialProtocolService;
  private historian: HistorianService;

  async syncWithSCADA(scadaConfig: SCADAConfig): Promise<void> {
    // Connect to SCADA system
    const connection = await this.protocolService.connect({
      protocol: scadaConfig.protocol,
      endpoint: scadaConfig.endpoint,
      credentials: scadaConfig.credentials
    });

    // Subscribe to all configured tags
    await this.protocolService.subscribe(
      connection.id,
      scadaConfig.tags,
      async (tagValue) => {
        // Store in historian
        await this.historian.store({
          tag: tagValue.tag,
          value: tagValue.value,
          quality: tagValue.quality,
          timestamp: tagValue.timestamp
        });

        // Forward to IIoT platform
        await this.forwardToCloud(tagValue);
      }
    );
  }
}
```

### MES Integration

```typescript
class MESIntegration {
  private mesClient: MESClient;
  private assetService: PredictiveMaintenanceService;

  async syncProductionData(): Promise<void> {
    // Get production orders
    const orders = await this.mesClient.getProductionOrders();

    for (const order of orders) {
      // Update asset utilization
      for (const assetId of order.assignedAssets) {
        await this.assetService.updateAssetHealth(assetId, {
          operatingHours: order.actualRuntime,
          load: order.averageLoad,
          cycleCount: order.completedCycles
        });
      }
    }
  }
}
```

## Security Considerations

### Industrial Network Security

- Implement network segmentation (IT/OT separation)
- Use industrial firewalls and DMZ
- Encrypt all industrial protocol communications
- Implement intrusion detection for industrial networks

### Safety System Security

- Protect safety systems from unauthorized access
- Implement safety system integrity monitoring
- Use hardware-based safety interlocks
- Regular safety system testing and validation

## Compliance Guidelines

- IEC 61508 Functional Safety
- IEC 62443 Industrial Cybersecurity
- ISO 13849 Safety of Machinery
- OSHA Process Safety Management
- FDA 21 CFR Part 11 (pharmaceutical)
- NERC CIP (energy sector)

## Testing Considerations

### Property-Based Tests

```typescript
describe('Industrial IoT Properties', () => {
  it('should correctly evaluate safety conditions', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        inputValue: fc.float({ min: 0, max: 100 }),
        threshold: fc.float({ min: 0, max: 100 })
      }), { minLength: 1, maxLength: 10 }),
      async (inputs) => {
        const safetySystem = new SafetyInterlockSystem();
        
        // Safety should trigger when any input exceeds threshold
        const shouldTrigger = inputs.some(i => i.inputValue > i.threshold);
        const evaluation = await safetySystem.evaluateSafetyConditions();
        
        if (shouldTrigger) {
          expect(evaluation.overallState).not.toBe(SafetyState.SAFE);
        }
      }
    ));
  });
});
```
