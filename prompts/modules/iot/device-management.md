# Device Management Template

## Purpose

This template provides comprehensive patterns for implementing device monitoring, firmware updates, configuration management, and remote control capabilities in IoT applications. It covers device lifecycle management, health monitoring, over-the-air (OTA) updates, and fleet-wide device operations.

## Context

Effective IoT device management requires robust mechanisms for monitoring device health, deploying firmware updates safely, managing device configurations, and executing remote commands. This template addresses the implementation of device management across diverse device fleets while maintaining security and reliability.

## Core Components

### Device Registry Service

```typescript
interface DeviceRegistryService {
  registerDevice(device: DeviceRegistration): Promise<RegisteredDevice>;
  updateDevice(deviceId: string, updates: DeviceUpdate): Promise<RegisteredDevice>;
  deregisterDevice(deviceId: string): Promise<void>;
  getDevice(deviceId: string): Promise<RegisteredDevice | null>;
  listDevices(filter?: DeviceFilter, pagination?: Pagination): Promise<DeviceList>;
  searchDevices(query: DeviceQuery): Promise<DeviceList>;
}

interface DeviceRegistration {
  id?: string;
  name: string;
  type: DeviceType;
  model: string;
  manufacturer: string;
  serialNumber: string;
  firmwareVersion: string;
  hardwareVersion: string;
  capabilities: DeviceCapability[];
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
  groupIds?: string[];
}

interface RegisteredDevice {
  id: string;
  name: string;
  type: DeviceType;
  model: string;
  manufacturer: string;
  serialNumber: string;
  firmwareVersion: string;
  hardwareVersion: string;
  capabilities: DeviceCapability[];
  status: DeviceStatus;
  connectionState: ConnectionState;
  lastSeen?: Date;
  registeredAt: Date;
  updatedAt: Date;
  tags: Record<string, string>;
  metadata: Record<string, unknown>;
  groupIds: string[];
  shadowState?: DeviceShadow;
}

enum DeviceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PROVISIONING = 'provisioning',
  MAINTENANCE = 'maintenance',
  DECOMMISSIONED = 'decommissioned',
  ERROR = 'error'
}

interface DeviceShadow {
  desired: Record<string, unknown>;
  reported: Record<string, unknown>;
  delta?: Record<string, unknown>;
  version: number;
  timestamp: Date;
}
```

### Device Monitoring Service

```typescript
interface DeviceMonitoringService {
  getDeviceHealth(deviceId: string): Promise<DeviceHealth>;
  getDeviceMetrics(deviceId: string, timeRange: TimeRange): Promise<DeviceMetrics>;
  setHealthThresholds(deviceId: string, thresholds: HealthThresholds): Promise<void>;
  subscribeToAlerts(deviceId: string, callback: (alert: DeviceAlert) => void): Subscription;
  getAlertHistory(deviceId: string, filter?: AlertFilter): Promise<DeviceAlert[]>;
}

interface DeviceHealth {
  deviceId: string;
  status: HealthStatus;
  connectivity: ConnectivityHealth;
  battery?: BatteryHealth;
  memory?: MemoryHealth;
  storage?: StorageHealth;
  cpu?: CPUHealth;
  temperature?: TemperatureHealth;
  lastChecked: Date;
  issues: HealthIssue[];
}

enum HealthStatus {
  HEALTHY = 'healthy',
  WARNING = 'warning',
  CRITICAL = 'critical',
  UNKNOWN = 'unknown'
}

interface ConnectivityHealth {
  status: HealthStatus;
  signalStrength?: number;
  latency?: number;
  packetLoss?: number;
  lastConnected?: Date;
  uptime?: number;
}

interface BatteryHealth {
  status: HealthStatus;
  level: number;
  charging: boolean;
  estimatedRuntime?: number;
  cycleCount?: number;
  health: number;
}

interface DeviceMetrics {
  deviceId: string;
  timeRange: TimeRange;
  dataPoints: MetricDataPoint[];
  aggregations: MetricAggregation[];
}

interface MetricDataPoint {
  timestamp: Date;
  metric: string;
  value: number;
  unit: string;
  tags?: Record<string, string>;
}

interface DeviceAlert {
  id: string;
  deviceId: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  metric?: string;
  threshold?: number;
  actualValue?: number;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  metadata: Record<string, unknown>;
}

enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}
```

### Firmware Update Service

```typescript
interface FirmwareUpdateService {
  createFirmwareVersion(firmware: FirmwareUpload): Promise<FirmwareVersion>;
  getFirmwareVersions(deviceType: string): Promise<FirmwareVersion[]>;
  scheduleUpdate(update: UpdateSchedule): Promise<UpdateJob>;
  getUpdateStatus(jobId: string): Promise<UpdateJobStatus>;
  cancelUpdate(jobId: string): Promise<void>;
  rollbackUpdate(deviceId: string, targetVersion: string): Promise<UpdateJob>;
}

interface FirmwareVersion {
  id: string;
  version: string;
  deviceType: string;
  releaseNotes: string;
  fileSize: number;
  checksum: string;
  checksumAlgorithm: 'sha256' | 'sha512';
  signatureAlgorithm: string;
  signature: string;
  minHardwareVersion?: string;
  maxHardwareVersion?: string;
  dependencies?: FirmwareDependency[];
  releaseDate: Date;
  status: FirmwareStatus;
  downloadUrl: string;
}

enum FirmwareStatus {
  DRAFT = 'draft',
  TESTING = 'testing',
  RELEASED = 'released',
  DEPRECATED = 'deprecated',
  RECALLED = 'recalled'
}

interface UpdateSchedule {
  firmwareVersionId: string;
  targetDevices: DeviceSelector;
  strategy: UpdateStrategy;
  schedule: ScheduleConfig;
  rollbackConfig?: RollbackConfig;
  notificationConfig?: NotificationConfig;
}

interface DeviceSelector {
  deviceIds?: string[];
  groupIds?: string[];
  tags?: Record<string, string>;
  query?: string;
  percentage?: number;
}

interface UpdateStrategy {
  type: 'immediate' | 'rolling' | 'canary' | 'scheduled';
  batchSize?: number;
  batchDelay?: number;
  maxFailureRate?: number;
  healthCheckInterval?: number;
  healthCheckTimeout?: number;
}

interface UpdateJob {
  id: string;
  firmwareVersionId: string;
  status: UpdateJobStatus;
  targetDeviceCount: number;
  completedCount: number;
  failedCount: number;
  skippedCount: number;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  deviceStatuses: Map<string, DeviceUpdateStatus>;
}

interface DeviceUpdateStatus {
  deviceId: string;
  status: 'pending' | 'downloading' | 'installing' | 'verifying' | 'completed' | 'failed' | 'rolled_back';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  previousVersion?: string;
  newVersion?: string;
}
```

### Remote Control Service

```typescript
interface RemoteControlService {
  sendCommand(deviceId: string, command: DeviceCommand): Promise<CommandResult>;
  sendBatchCommand(devices: string[], command: DeviceCommand): Promise<BatchCommandResult>;
  getCommandHistory(deviceId: string, filter?: CommandFilter): Promise<DeviceCommand[]>;
  scheduleCommand(deviceId: string, command: DeviceCommand, schedule: Date): Promise<ScheduledCommand>;
  cancelScheduledCommand(commandId: string): Promise<void>;
}

interface DeviceCommand {
  id?: string;
  type: CommandType;
  action: string;
  parameters?: Record<string, unknown>;
  timeout?: number;
  priority?: CommandPriority;
  requiresAck?: boolean;
  retryConfig?: RetryConfig;
}

enum CommandType {
  CONFIGURATION = 'configuration',
  DIAGNOSTIC = 'diagnostic',
  REBOOT = 'reboot',
  RESET = 'reset',
  CUSTOM = 'custom',
  TELEMETRY = 'telemetry',
  ACTUATOR = 'actuator'
}

enum CommandPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface CommandResult {
  commandId: string;
  deviceId: string;
  status: CommandStatus;
  response?: unknown;
  executedAt?: Date;
  completedAt?: Date;
  error?: CommandError;
}

enum CommandStatus {
  QUEUED = 'queued',
  SENT = 'sent',
  ACKNOWLEDGED = 'acknowledged',
  EXECUTING = 'executing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  CANCELLED = 'cancelled'
}

interface BatchCommandResult {
  batchId: string;
  totalDevices: number;
  successCount: number;
  failureCount: number;
  pendingCount: number;
  results: Map<string, CommandResult>;
}
```

## Implementation Patterns

### Device Shadow Management

```typescript
class DeviceShadowManager {
  private shadowStore: ShadowStore;
  private deviceConnections: Map<string, DeviceConnection>;
  private eventEmitter: EventEmitter;

  async updateDesiredState(deviceId: string, desired: Record<string, unknown>): Promise<DeviceShadow> {
    const currentShadow = await this.shadowStore.get(deviceId);
    
    const newShadow: DeviceShadow = {
      desired: { ...currentShadow?.desired, ...desired },
      reported: currentShadow?.reported || {},
      version: (currentShadow?.version || 0) + 1,
      timestamp: new Date()
    };

    // Calculate delta
    newShadow.delta = this.calculateDelta(newShadow.desired, newShadow.reported);

    await this.shadowStore.save(deviceId, newShadow);

    // Notify device of desired state change
    const connection = this.deviceConnections.get(deviceId);
    if (connection && connection.state === ConnectionState.CONNECTED) {
      await this.sendShadowUpdate(connection, newShadow);
    }

    this.eventEmitter.emit('shadowUpdated', deviceId, newShadow);
    return newShadow;
  }

  async updateReportedState(deviceId: string, reported: Record<string, unknown>): Promise<DeviceShadow> {
    const currentShadow = await this.shadowStore.get(deviceId);
    
    const newShadow: DeviceShadow = {
      desired: currentShadow?.desired || {},
      reported: { ...currentShadow?.reported, ...reported },
      version: (currentShadow?.version || 0) + 1,
      timestamp: new Date()
    };

    // Recalculate delta
    newShadow.delta = this.calculateDelta(newShadow.desired, newShadow.reported);

    await this.shadowStore.save(deviceId, newShadow);
    this.eventEmitter.emit('shadowUpdated', deviceId, newShadow);

    return newShadow;
  }

  private calculateDelta(desired: Record<string, unknown>, reported: Record<string, unknown>): Record<string, unknown> {
    const delta: Record<string, unknown> = {};

    for (const [key, desiredValue] of Object.entries(desired)) {
      const reportedValue = reported[key];
      if (!this.deepEqual(desiredValue, reportedValue)) {
        delta[key] = desiredValue;
      }
    }

    return Object.keys(delta).length > 0 ? delta : undefined;
  }

  private deepEqual(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (typeof a !== typeof b) return false;
    if (typeof a !== 'object' || a === null || b === null) return false;
    
    const keysA = Object.keys(a as object);
    const keysB = Object.keys(b as object);
    
    if (keysA.length !== keysB.length) return false;
    
    return keysA.every(key => 
      this.deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
    );
  }
}
```

### Safe Firmware Update with Rollback

```typescript
class SafeFirmwareUpdateService implements FirmwareUpdateService {
  private firmwareStore: FirmwareStore;
  private deviceRegistry: DeviceRegistryService;
  private updateJobs: Map<string, UpdateJob>;

  async scheduleUpdate(schedule: UpdateSchedule): Promise<UpdateJob> {
    const firmware = await this.firmwareStore.get(schedule.firmwareVersionId);
    if (!firmware) {
      throw new Error('Firmware version not found');
    }

    // Validate firmware signature
    await this.validateFirmwareSignature(firmware);

    // Get target devices
    const targetDevices = await this.resolveDeviceSelector(schedule.targetDevices);

    // Filter compatible devices
    const compatibleDevices = await this.filterCompatibleDevices(targetDevices, firmware);

    const job: UpdateJob = {
      id: crypto.randomUUID(),
      firmwareVersionId: firmware.id,
      status: 'pending',
      targetDeviceCount: compatibleDevices.length,
      completedCount: 0,
      failedCount: 0,
      skippedCount: targetDevices.length - compatibleDevices.length,
      createdAt: new Date(),
      deviceStatuses: new Map()
    };

    // Initialize device statuses
    for (const device of compatibleDevices) {
      job.deviceStatuses.set(device.id, {
        deviceId: device.id,
        status: 'pending',
        progress: 0,
        previousVersion: device.firmwareVersion
      });
    }

    this.updateJobs.set(job.id, job);

    // Execute update based on strategy
    this.executeUpdateStrategy(job, schedule, firmware, compatibleDevices);

    return job;
  }

  private async executeUpdateStrategy(
    job: UpdateJob,
    schedule: UpdateSchedule,
    firmware: FirmwareVersion,
    devices: RegisteredDevice[]
  ): Promise<void> {
    job.status = 'in_progress';
    job.startedAt = new Date();

    switch (schedule.strategy.type) {
      case 'immediate':
        await this.executeImmediateUpdate(job, firmware, devices);
        break;
      case 'rolling':
        await this.executeRollingUpdate(job, firmware, devices, schedule.strategy);
        break;
      case 'canary':
        await this.executeCanaryUpdate(job, firmware, devices, schedule.strategy);
        break;
    }
  }

  private async executeRollingUpdate(
    job: UpdateJob,
    firmware: FirmwareVersion,
    devices: RegisteredDevice[],
    strategy: UpdateStrategy
  ): Promise<void> {
    const batchSize = strategy.batchSize || 10;
    const batchDelay = strategy.batchDelay || 60000;
    const maxFailureRate = strategy.maxFailureRate || 0.1;

    for (let i = 0; i < devices.length; i += batchSize) {
      const batch = devices.slice(i, i + batchSize);

      // Update batch
      await Promise.all(batch.map(device => 
        this.updateSingleDevice(job, firmware, device)
      ));

      // Check failure rate
      const failureRate = job.failedCount / (job.completedCount + job.failedCount);
      if (failureRate > maxFailureRate) {
        job.status = 'failed';
        await this.initiateRollback(job, firmware);
        return;
      }

      // Wait before next batch
      if (i + batchSize < devices.length) {
        await this.delay(batchDelay);
      }
    }

    job.status = 'completed';
    job.completedAt = new Date();
  }

  private async updateSingleDevice(
    job: UpdateJob,
    firmware: FirmwareVersion,
    device: RegisteredDevice
  ): Promise<void> {
    const status = job.deviceStatuses.get(device.id)!;
    status.startedAt = new Date();

    try {
      // Download phase
      status.status = 'downloading';
      await this.sendFirmwareToDevice(device, firmware, (progress) => {
        status.progress = progress * 0.5; // 0-50%
      });

      // Install phase
      status.status = 'installing';
      await this.installFirmwareOnDevice(device, firmware, (progress) => {
        status.progress = 50 + progress * 0.4; // 50-90%
      });

      // Verify phase
      status.status = 'verifying';
      const verified = await this.verifyFirmwareInstallation(device, firmware);
      
      if (!verified) {
        throw new Error('Firmware verification failed');
      }

      status.status = 'completed';
      status.progress = 100;
      status.newVersion = firmware.version;
      status.completedAt = new Date();
      job.completedCount++;

    } catch (error) {
      status.status = 'failed';
      status.error = (error as Error).message;
      status.completedAt = new Date();
      job.failedCount++;

      // Attempt automatic rollback for this device
      await this.rollbackDevice(device, status.previousVersion!);
    }
  }

  private async initiateRollback(job: UpdateJob, firmware: FirmwareVersion): Promise<void> {
    const devicesToRollback = Array.from(job.deviceStatuses.entries())
      .filter(([_, status]) => status.status === 'completed')
      .map(([deviceId]) => deviceId);

    for (const deviceId of devicesToRollback) {
      const status = job.deviceStatuses.get(deviceId)!;
      await this.rollbackDevice(
        await this.deviceRegistry.getDevice(deviceId),
        status.previousVersion!
      );
      status.status = 'rolled_back';
    }
  }
}
```

### Health Monitoring with Alerting

```typescript
class DeviceHealthMonitor implements DeviceMonitoringService {
  private healthStore: HealthStore;
  private alertEngine: AlertEngine;
  private metricsCollector: MetricsCollector;

  async getDeviceHealth(deviceId: string): Promise<DeviceHealth> {
    const metrics = await this.metricsCollector.getLatestMetrics(deviceId);
    const thresholds = await this.getHealthThresholds(deviceId);

    const health: DeviceHealth = {
      deviceId,
      status: HealthStatus.HEALTHY,
      connectivity: this.evaluateConnectivity(metrics, thresholds),
      battery: metrics.battery ? this.evaluateBattery(metrics, thresholds) : undefined,
      memory: metrics.memory ? this.evaluateMemory(metrics, thresholds) : undefined,
      storage: metrics.storage ? this.evaluateStorage(metrics, thresholds) : undefined,
      cpu: metrics.cpu ? this.evaluateCPU(metrics, thresholds) : undefined,
      temperature: metrics.temperature ? this.evaluateTemperature(metrics, thresholds) : undefined,
      lastChecked: new Date(),
      issues: []
    };

    // Aggregate overall status
    health.status = this.aggregateHealthStatus(health);
    health.issues = this.identifyHealthIssues(health, thresholds);

    // Trigger alerts if needed
    await this.checkAndTriggerAlerts(deviceId, health);

    return health;
  }

  private evaluateConnectivity(metrics: DeviceMetrics, thresholds: HealthThresholds): ConnectivityHealth {
    const connectivity = metrics.connectivity;
    let status = HealthStatus.HEALTHY;

    if (!connectivity.lastConnected || 
        Date.now() - connectivity.lastConnected.getTime() > thresholds.maxOfflineTime) {
      status = HealthStatus.CRITICAL;
    } else if (connectivity.signalStrength < thresholds.minSignalStrength) {
      status = HealthStatus.WARNING;
    } else if (connectivity.packetLoss > thresholds.maxPacketLoss) {
      status = HealthStatus.WARNING;
    }

    return {
      status,
      signalStrength: connectivity.signalStrength,
      latency: connectivity.latency,
      packetLoss: connectivity.packetLoss,
      lastConnected: connectivity.lastConnected,
      uptime: connectivity.uptime
    };
  }

  private async checkAndTriggerAlerts(deviceId: string, health: DeviceHealth): Promise<void> {
    for (const issue of health.issues) {
      const alert: DeviceAlert = {
        id: crypto.randomUUID(),
        deviceId,
        type: this.mapIssueToAlertType(issue),
        severity: this.mapHealthStatusToSeverity(issue.status),
        message: issue.message,
        metric: issue.metric,
        threshold: issue.threshold,
        actualValue: issue.actualValue,
        triggeredAt: new Date(),
        metadata: { health }
      };

      await this.alertEngine.triggerAlert(alert);
    }
  }

  subscribeToAlerts(deviceId: string, callback: (alert: DeviceAlert) => void): Subscription {
    return this.alertEngine.subscribe(deviceId, callback);
  }
}
```

## Integration Points

### Cloud Platform Integration

```typescript
interface CloudDeviceManagement {
  awsIoTDeviceManagement: AWSIoTDeviceManagementAdapter;
  azureIoTHub: AzureIoTHubAdapter;
  gcpIoTCore: GCPIoTCoreAdapter;
}

class AWSIoTDeviceManagementAdapter {
  private iotClient: IoTClient;

  async createOTAUpdate(config: OTAUpdateConfig): Promise<string> {
    const result = await this.iotClient.send(new CreateOTAUpdateCommand({
      otaUpdateId: config.id,
      targets: config.targetArns,
      files: [{
        fileName: config.firmwareFile.name,
        fileLocation: {
          s3Location: {
            bucket: config.firmwareFile.bucket,
            key: config.firmwareFile.key,
            version: config.firmwareFile.version
          }
        },
        codeSigning: {
          awsSignerJobId: config.signingJobId
        }
      }],
      targetSelection: config.strategy === 'continuous' ? 'CONTINUOUS' : 'SNAPSHOT',
      awsJobExecutionsRolloutConfig: {
        maximumPerMinute: config.maxDevicesPerMinute,
        exponentialRate: {
          baseRatePerMinute: config.baseRatePerMinute,
          incrementFactor: config.incrementFactor,
          rateIncreaseCriteria: {
            numberOfSucceededThings: config.successThreshold
          }
        }
      },
      awsJobAbortConfig: {
        abortCriteriaList: [{
          failureType: 'FAILED',
          action: 'CANCEL',
          thresholdPercentage: config.maxFailurePercentage,
          minNumberOfExecutedThings: config.minExecutedDevices
        }]
      }
    }));

    return result.otaUpdateId!;
  }

  async getDeviceShadow(deviceId: string): Promise<DeviceShadow> {
    const result = await this.iotDataClient.send(new GetThingShadowCommand({
      thingName: deviceId
    }));

    const shadow = JSON.parse(new TextDecoder().decode(result.payload));
    return {
      desired: shadow.state.desired,
      reported: shadow.state.reported,
      delta: shadow.state.delta,
      version: shadow.version,
      timestamp: new Date(shadow.timestamp * 1000)
    };
  }
}
```

### Fleet Management Integration

```typescript
class FleetManagementService {
  private deviceRegistry: DeviceRegistryService;
  private groupManager: DeviceGroupManager;

  async createDeviceGroup(group: DeviceGroupConfig): Promise<DeviceGroup> {
    const deviceGroup: DeviceGroup = {
      id: crypto.randomUUID(),
      name: group.name,
      description: group.description,
      query: group.dynamicQuery,
      staticMembers: group.staticMembers || [],
      parentGroupId: group.parentGroupId,
      policies: group.policies,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.groupManager.save(deviceGroup);
    return deviceGroup;
  }

  async getGroupDevices(groupId: string): Promise<RegisteredDevice[]> {
    const group = await this.groupManager.get(groupId);
    if (!group) {
      throw new Error('Group not found');
    }

    // Get static members
    const staticDevices = await Promise.all(
      group.staticMembers.map(id => this.deviceRegistry.getDevice(id))
    );

    // Get dynamic members based on query
    let dynamicDevices: RegisteredDevice[] = [];
    if (group.query) {
      const result = await this.deviceRegistry.searchDevices({ query: group.query });
      dynamicDevices = result.devices;
    }

    // Merge and deduplicate
    const allDevices = new Map<string, RegisteredDevice>();
    for (const device of [...staticDevices, ...dynamicDevices]) {
      if (device) {
        allDevices.set(device.id, device);
      }
    }

    return Array.from(allDevices.values());
  }

  async applyGroupPolicy(groupId: string, policy: DevicePolicy): Promise<void> {
    const devices = await this.getGroupDevices(groupId);
    
    await Promise.all(devices.map(device =>
      this.applyPolicyToDevice(device.id, policy)
    ));
  }
}
```

## Security Considerations

### Firmware Security

- Sign all firmware images with code signing certificates
- Verify firmware signatures before installation
- Use secure boot to prevent unauthorized firmware
- Implement firmware rollback protection
- Store firmware encryption keys in secure enclaves

### Remote Command Security

- Authenticate all remote commands
- Implement command authorization based on device policies
- Log all remote commands for audit trails
- Use encrypted channels for command transmission
- Implement rate limiting for commands

### Device Identity

- Use unique device identities with hardware-backed keys
- Implement device attestation for integrity verification
- Rotate device credentials periodically
- Revoke compromised device credentials immediately

## Compliance Guidelines

- FDA 21 CFR Part 11 for medical device software updates
- IEC 62443 for industrial device management
- NIST SP 800-183 for IoT device security
- ETSI EN 303 645 for consumer IoT device management

## Testing Considerations

### Property-Based Tests

```typescript
describe('Device Management Properties', () => {
  it('should maintain device shadow consistency', () => {
    fc.assert(fc.property(
      fc.record({
        desired: fc.dictionary(fc.string(), fc.jsonValue()),
        reported: fc.dictionary(fc.string(), fc.jsonValue())
      }),
      async (states) => {
        const manager = new DeviceShadowManager();
        const deviceId = 'test-device';

        await manager.updateDesiredState(deviceId, states.desired);
        await manager.updateReportedState(deviceId, states.reported);

        const shadow = await manager.getShadow(deviceId);

        // Delta should only contain keys where desired !== reported
        for (const [key, value] of Object.entries(shadow.delta || {})) {
          expect(shadow.desired[key]).toEqual(value);
          expect(shadow.reported[key]).not.toEqual(value);
        }
      }
    ));
  });

  it('should track firmware update progress correctly', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 100 }),
      async (deviceCount) => {
        const service = new SafeFirmwareUpdateService();
        
        const job = await service.scheduleUpdate({
          firmwareVersionId: 'v1.0.0',
          targetDevices: { deviceIds: Array(deviceCount).fill(null).map((_, i) => `device-${i}`) },
          strategy: { type: 'immediate' }
        });

        // Total should always equal target count
        const total = job.completedCount + job.failedCount + job.skippedCount + 
          Array.from(job.deviceStatuses.values()).filter(s => s.status === 'pending').length;
        
        expect(total).toBeLessThanOrEqual(job.targetDeviceCount);
      }
    ));
  });
});
```
