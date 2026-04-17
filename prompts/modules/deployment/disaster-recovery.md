# Disaster Recovery Template

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

This template provides comprehensive patterns for implementing disaster recovery including backup systems, failover mechanisms, data replication, and recovery procedures. It covers business continuity planning, RTO/RPO management, and automated recovery workflows.

## Context

Disaster recovery is critical for ensuring business continuity and data protection. This template addresses the challenges of designing and implementing robust DR strategies that minimize downtime and data loss while maintaining cost efficiency.

## Core Components

### Backup Management Service

## Examples

```typescript
interface BackupManagementService {
  // Backup operations
  createBackup(config: BackupConfig): Promise<Backup>;
  restoreBackup(backupId: string, target: RestoreTarget): Promise<RestoreJob>;
  deleteBackup(backupId: string): Promise<void>;
  
  // Backup scheduling
  createBackupSchedule(schedule: BackupSchedule): Promise<string>;
  updateBackupSchedule(scheduleId: string, schedule: Partial<BackupSchedule>): Promise<void>;
  deleteBackupSchedule(scheduleId: string): Promise<void>;
  
  // Backup queries
  listBackups(filters?: BackupFilters): Promise<Backup[]>;
  getBackupStatus(backupId: string): Promise<BackupStatus>;
  validateBackup(backupId: string): Promise<ValidationResult>;
}


interface BackupConfig {
  name: string;
  source: BackupSource;
  type: BackupType;
  retention: RetentionPolicy;
  encryption?: EncryptionConfig;
  compression?: CompressionConfig;
  tags?: Record<string, string>;
}

interface BackupSource {
  type: SourceType;
  identifier: string;
  region?: string;
  includePatterns?: string[];
  excludePatterns?: string[];
}

enum SourceType {
  DATABASE = 'database',
  FILE_SYSTEM = 'file_system',
  VOLUME = 'volume',
  KUBERNETES = 'kubernetes',
  APPLICATION = 'application'
}

enum BackupType {
  FULL = 'full',
  INCREMENTAL = 'incremental',
  DIFFERENTIAL = 'differential',
  SNAPSHOT = 'snapshot'
}

interface RetentionPolicy {
  daily: number;
  weekly: number;
  monthly: number;
  yearly: number;
  minimumRetention: number;
}

interface Backup {
  id: string;
  name: string;
  source: BackupSource;
  type: BackupType;
  status: BackupState;
  size: number;
  createdAt: Date;
  expiresAt: Date;
  checksum: string;
  metadata?: Record<string, unknown>;
}

enum BackupState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

interface BackupSchedule {
  name: string;
  source: BackupSource;
  schedule: string; // Cron expression
  type: BackupType;
  retention: RetentionPolicy;
  enabled: boolean;
  notifications?: NotificationConfig[];
}
```

### Failover Management Service

```typescript
interface FailoverManagementService {
  // Failover operations
  initiateFailover(config: FailoverConfig): Promise<FailoverJob>;
  initiateFailback(failoverId: string): Promise<FailbackJob>;
  cancelFailover(failoverId: string): Promise<void>;
  
  // Failover status
  getFailoverStatus(failoverId: string): Promise<FailoverStatus>;
  getFailoverHistory(resourceId: string): Promise<FailoverEvent[]>;
  
  // Health monitoring
  checkReplicationHealth(resourceId: string): Promise<ReplicationHealth>;
  getReplicationLag(resourceId: string): Promise<ReplicationLag>;
}

interface FailoverConfig {
  resourceId: string;
  targetRegion: string;
  failoverType: FailoverType;
  preFailoverChecks?: PreFailoverCheck[];
  postFailoverActions?: PostFailoverAction[];
  notifyOnComplete?: boolean;
}

enum FailoverType {
  AUTOMATIC = 'automatic',
  MANUAL = 'manual',
  PLANNED = 'planned',
  UNPLANNED = 'unplanned'
}

interface FailoverStatus {
  id: string;
  resourceId: string;
  type: FailoverType;
  state: FailoverState;
  sourceRegion: string;
  targetRegion: string;
  startedAt: Date;
  completedAt?: Date;
  rpo: number; // Recovery Point Objective achieved (seconds)
  rto: number; // Recovery Time Objective achieved (seconds)
  dataLoss?: number; // Bytes of data lost
}

enum FailoverState {
  INITIATED = 'initiated',
  PRE_CHECKS = 'pre_checks',
  REPLICATING = 'replicating',
  SWITCHING = 'switching',
  POST_ACTIONS = 'post_actions',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}

interface ReplicationHealth {
  resourceId: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  primaryRegion: string;
  replicaRegions: ReplicaStatus[];
  lastChecked: Date;
}

interface ReplicaStatus {
  region: string;
  status: 'in_sync' | 'lagging' | 'disconnected';
  lag: number; // Seconds behind primary
  lastSyncTime: Date;
}
```

### Recovery Orchestration Service

```typescript
interface RecoveryOrchestrationService {
  // Recovery plans
  createRecoveryPlan(plan: RecoveryPlan): Promise<string>;
  updateRecoveryPlan(planId: string, plan: Partial<RecoveryPlan>): Promise<void>;
  deleteRecoveryPlan(planId: string): Promise<void>;
  
  // Recovery execution
  executeRecoveryPlan(planId: string, params?: RecoveryParams): Promise<RecoveryExecution>;
  testRecoveryPlan(planId: string): Promise<TestResult>;
  
  // Recovery status
  getRecoveryStatus(executionId: string): Promise<RecoveryStatus>;
  getRecoveryHistory(planId: string): Promise<RecoveryExecution[]>;
}

interface RecoveryPlan {
  name: string;
  description?: string;
  rpoTarget: number; // Seconds
  rtoTarget: number; // Seconds
  priority: RecoveryPriority;
  steps: RecoveryStep[];
  dependencies?: string[];
  notifications?: NotificationConfig[];
}

enum RecoveryPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

interface RecoveryStep {
  name: string;
  type: RecoveryStepType;
  config: StepConfig;
  timeout: number;
  retries?: number;
  continueOnFailure?: boolean;
  dependsOn?: string[];
}

enum RecoveryStepType {
  RESTORE_DATABASE = 'restore_database',
  RESTORE_FILES = 'restore_files',
  START_SERVICES = 'start_services',
  VERIFY_HEALTH = 'verify_health',
  UPDATE_DNS = 'update_dns',
  NOTIFY_STAKEHOLDERS = 'notify_stakeholders',
  CUSTOM_SCRIPT = 'custom_script'
}

interface RecoveryStatus {
  executionId: string;
  planId: string;
  state: RecoveryState;
  startedAt: Date;
  completedAt?: Date;
  currentStep?: string;
  steps: StepStatus[];
  rpoAchieved?: number;
  rtoAchieved?: number;
}

enum RecoveryState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  PARTIALLY_COMPLETED = 'partially_completed'
}
```


## Implementation Patterns

### Automated Backup Manager

```typescript
class AutomatedBackupManager {
  private backupService: BackupManagementService;
  private scheduler: Scheduler;

  async setupAutomatedBackups(config: AutomatedBackupConfig): Promise<void> {
    // Create backup schedules for each resource
    for (const resource of config.resources) {
      const schedule = this.createBackupSchedule(resource, config);
      await this.backupService.createBackupSchedule(schedule);
    }

    // Set up retention policy enforcement
    await this.setupRetentionEnforcement(config.retention);

    // Configure backup verification
    await this.setupBackupVerification(config.verification);
  }

  private createBackupSchedule(resource: BackupResource, config: AutomatedBackupConfig): BackupSchedule {
    return {
      name: `${resource.name}-backup`,
      source: {
        type: resource.type,
        identifier: resource.identifier,
        region: resource.region
      },
      schedule: this.getScheduleForTier(resource.tier),
      type: this.getBackupTypeForTier(resource.tier),
      retention: config.retention,
      enabled: true,
      notifications: config.notifications
    };
  }

  private getScheduleForTier(tier: ResourceTier): string {
    const schedules: Record<ResourceTier, string> = {
      critical: '0 */4 * * *',    // Every 4 hours
      high: '0 */8 * * *',        // Every 8 hours
      medium: '0 0 * * *',        // Daily
      low: '0 0 * * 0'            // Weekly
    };
    return schedules[tier];
  }

  async performBackup(source: BackupSource): Promise<Backup> {
    const backup = await this.backupService.createBackup({
      name: `${source.identifier}-${Date.now()}`,
      source,
      type: BackupType.INCREMENTAL,
      retention: this.defaultRetention,
      encryption: {
        enabled: true,
        algorithm: 'AES-256',
        keyId: this.encryptionKeyId
      }
    });

    // Verify backup integrity
    const validation = await this.backupService.validateBackup(backup.id);
    if (!validation.valid) {
      throw new Error(`Backup validation failed: ${validation.errors.join(', ')}`);
    }

    return backup;
  }

  async restoreFromBackup(backupId: string, target: RestoreTarget): Promise<RestoreJob> {
    // Validate backup before restore
    const validation = await this.backupService.validateBackup(backupId);
    if (!validation.valid) {
      throw new Error('Backup validation failed');
    }

    // Perform restore
    const restoreJob = await this.backupService.restoreBackup(backupId, target);

    // Wait for completion
    return this.waitForRestore(restoreJob.id);
  }
}
```

### Multi-Region Failover Controller

```typescript
class MultiRegionFailoverController {
  private failoverService: FailoverManagementService;
  private healthChecker: HealthChecker;

  async monitorAndFailover(config: FailoverMonitorConfig): Promise<void> {
    // Continuous health monitoring
    const healthStatus = await this.healthChecker.checkHealth(config.primaryRegion);

    if (healthStatus.status === 'unhealthy') {
      // Check if failover conditions are met
      if (await this.shouldFailover(config, healthStatus)) {
        await this.executeFailover(config);
      }
    }
  }

  private async shouldFailover(config: FailoverMonitorConfig, health: HealthStatus): Promise<boolean> {
    // Check consecutive failures
    const failureCount = await this.getConsecutiveFailures(config.resourceId);
    if (failureCount < config.failureThreshold) {
      return false;
    }

    // Check if secondary region is healthy
    const secondaryHealth = await this.healthChecker.checkHealth(config.secondaryRegion);
    if (secondaryHealth.status !== 'healthy') {
      return false;
    }

    // Check replication lag
    const lag = await this.failoverService.getReplicationLag(config.resourceId);
    if (lag.seconds > config.maxAcceptableLag) {
      console.warn(`Replication lag (${lag.seconds}s) exceeds threshold`);
    }

    return true;
  }

  async executeFailover(config: FailoverMonitorConfig): Promise<FailoverStatus> {
    // Pre-failover notifications
    await this.notifyStakeholders('failover_initiated', config);

    // Execute failover
    const failoverJob = await this.failoverService.initiateFailover({
      resourceId: config.resourceId,
      targetRegion: config.secondaryRegion,
      failoverType: FailoverType.AUTOMATIC,
      preFailoverChecks: [
        { type: 'replication_sync', timeout: 60 },
        { type: 'connection_drain', timeout: 30 }
      ],
      postFailoverActions: [
        { type: 'update_dns', config: { ttl: 60 } },
        { type: 'warm_cache', config: {} }
      ]
    });

    // Wait for completion
    const status = await this.waitForFailover(failoverJob.id);

    // Post-failover notifications
    await this.notifyStakeholders('failover_completed', config, status);

    return status;
  }

  async executeFailback(failoverId: string): Promise<FailbackJob> {
    // Verify primary region is healthy
    const primaryHealth = await this.healthChecker.checkHealth(this.primaryRegion);
    if (primaryHealth.status !== 'healthy') {
      throw new Error('Primary region is not healthy for failback');
    }

    // Initiate failback
    return this.failoverService.initiateFailback(failoverId);
  }
}
```

### Recovery Plan Executor

```typescript
class RecoveryPlanExecutor {
  private recoveryService: RecoveryOrchestrationService;
  private stepExecutors: Map<RecoveryStepType, StepExecutor>;

  async executeRecoveryPlan(planId: string, params?: RecoveryParams): Promise<RecoveryExecution> {
    const plan = await this.recoveryService.getRecoveryPlan(planId);
    const execution = await this.recoveryService.executeRecoveryPlan(planId, params);

    const startTime = Date.now();
    const stepResults: StepResult[] = [];

    // Execute steps in order, respecting dependencies
    const executionOrder = this.buildExecutionOrder(plan.steps);

    for (const stepBatch of executionOrder) {
      const batchResults = await Promise.all(
        stepBatch.map(step => this.executeStep(step, execution.id))
      );

      stepResults.push(...batchResults);

      // Check for failures
      const failures = batchResults.filter(r => !r.success);
      if (failures.length > 0) {
        const criticalFailures = failures.filter(f => !f.step.continueOnFailure);
        if (criticalFailures.length > 0) {
          throw new RecoveryFailedError(criticalFailures);
        }
      }
    }

    const endTime = Date.now();
    const rtoAchieved = (endTime - startTime) / 1000;

    return {
      ...execution,
      state: RecoveryState.COMPLETED,
      completedAt: new Date(),
      rtoAchieved,
      steps: stepResults
    };
  }

  private async executeStep(step: RecoveryStep, executionId: string): Promise<StepResult> {
    const executor = this.stepExecutors.get(step.type);
    if (!executor) {
      throw new Error(`No executor found for step type: ${step.type}`);
    }

    const startTime = Date.now();
    let attempts = 0;
    let lastError: Error | undefined;

    while (attempts <= (step.retries || 0)) {
      try {
        await executor.execute(step.config, { timeout: step.timeout });
        
        return {
          step,
          success: true,
          duration: Date.now() - startTime,
          attempts: attempts + 1
        };
      } catch (error) {
        lastError = error as Error;
        attempts++;
        
        if (attempts <= (step.retries || 0)) {
          await this.delay(Math.pow(2, attempts) * 1000); // Exponential backoff
        }
      }
    }

    return {
      step,
      success: false,
      duration: Date.now() - startTime,
      attempts,
      error: lastError?.message
    };
  }
}
```


## Integration Points

### AWS Backup Integration

```typescript
class AWSBackupIntegration {
  private backup: AWSBackupClient;

  async createBackupPlan(config: BackupPlanConfig): Promise<string> {
    const plan = await this.backup.send(new CreateBackupPlanCommand({
      BackupPlan: {
        BackupPlanName: config.name,
        Rules: config.rules.map(rule => ({
          RuleName: rule.name,
          TargetBackupVaultName: rule.vaultName,
          ScheduleExpression: rule.schedule,
          StartWindowMinutes: rule.startWindow || 60,
          CompletionWindowMinutes: rule.completionWindow || 180,
          Lifecycle: {
            DeleteAfterDays: rule.retention.days,
            MoveToColdStorageAfterDays: rule.retention.coldStorageDays
          },
          CopyActions: rule.crossRegionCopy ? [{
            DestinationBackupVaultArn: rule.crossRegionCopy.vaultArn,
            Lifecycle: {
              DeleteAfterDays: rule.crossRegionCopy.retention
            }
          }] : undefined
        }))
      }
    }));

    return plan.BackupPlanId!;
  }

  async assignResources(planId: string, resources: BackupResource[]): Promise<void> {
    await this.backup.send(new CreateBackupSelectionCommand({
      BackupPlanId: planId,
      BackupSelection: {
        SelectionName: 'default-selection',
        IamRoleArn: this.backupRoleArn,
        Resources: resources.map(r => r.arn),
        Conditions: {
          StringEquals: resources
            .filter(r => r.tags)
            .flatMap(r => Object.entries(r.tags!).map(([key, value]) => ({
              ConditionKey: `aws:ResourceTag/${key}`,
              ConditionValue: value
            })))
        }
      }
    }));
  }
}
```

### Route53 DNS Failover Integration

```typescript
class Route53FailoverIntegration {
  private route53: Route53Client;

  async configureFailover(config: DNSFailoverConfig): Promise<void> {
    // Create health check for primary
    const primaryHealthCheck = await this.createHealthCheck({
      name: `${config.domain}-primary`,
      endpoint: config.primaryEndpoint,
      type: 'HTTPS',
      port: 443,
      path: config.healthCheckPath,
      failureThreshold: 3
    });

    // Create primary record
    await this.route53.send(new ChangeResourceRecordSetsCommand({
      HostedZoneId: config.hostedZoneId,
      ChangeBatch: {
        Changes: [{
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: config.domain,
            Type: 'A',
            SetIdentifier: 'primary',
            Failover: 'PRIMARY',
            HealthCheckId: primaryHealthCheck,
            AliasTarget: {
              HostedZoneId: config.primaryAliasHostedZoneId,
              DNSName: config.primaryEndpoint,
              EvaluateTargetHealth: true
            }
          }
        }, {
          Action: 'UPSERT',
          ResourceRecordSet: {
            Name: config.domain,
            Type: 'A',
            SetIdentifier: 'secondary',
            Failover: 'SECONDARY',
            AliasTarget: {
              HostedZoneId: config.secondaryAliasHostedZoneId,
              DNSName: config.secondaryEndpoint,
              EvaluateTargetHealth: true
            }
          }
        }]
      }
    }));
  }
}
```

## Security Considerations

### Backup Encryption

```typescript
class BackupSecurityManager {
  async encryptBackup(backup: Backup, keyId: string): Promise<EncryptedBackup> {
    // Use envelope encryption
    const dataKey = await this.kms.generateDataKey({
      KeyId: keyId,
      KeySpec: 'AES_256'
    });

    // Encrypt backup data with data key
    const encryptedData = await this.encrypt(backup.data, dataKey.Plaintext);

    return {
      ...backup,
      encryptedData,
      encryptedDataKey: dataKey.CiphertextBlob,
      keyId,
      algorithm: 'AES-256-GCM'
    };
  }

  async validateBackupIntegrity(backup: Backup): Promise<IntegrityResult> {
    // Verify checksum
    const calculatedChecksum = await this.calculateChecksum(backup.data);
    const checksumValid = calculatedChecksum === backup.checksum;

    // Verify encryption
    const encryptionValid = await this.verifyEncryption(backup);

    // Verify restore capability
    const restoreValid = await this.testRestore(backup);

    return {
      valid: checksumValid && encryptionValid && restoreValid,
      checksumValid,
      encryptionValid,
      restoreValid
    };
  }
}
```

## Testing Considerations

### Disaster Recovery Testing

```typescript
describe('Disaster Recovery Tests', () => {
  it('should create and validate backup', async () => {
    const backupManager = new AutomatedBackupManager();
    const backup = await backupManager.performBackup({
      type: SourceType.DATABASE,
      identifier: 'test-db'
    });

    expect(backup.status).toBe(BackupState.COMPLETED);
    
    const validation = await backupManager.validateBackup(backup.id);
    expect(validation.valid).toBe(true);
  });

  it('should execute failover within RTO', async () => {
    const controller = new MultiRegionFailoverController();
    const startTime = Date.now();
    
    const status = await controller.executeFailover({
      resourceId: 'test-resource',
      primaryRegion: 'us-east-1',
      secondaryRegion: 'us-west-2',
      failureThreshold: 3,
      maxAcceptableLag: 60
    });

    const rto = (Date.now() - startTime) / 1000;
    expect(status.state).toBe(FailoverState.COMPLETED);
    expect(rto).toBeLessThan(300); // 5 minutes RTO
  });

  it('should execute recovery plan successfully', async () => {
    const executor = new RecoveryPlanExecutor();
    const execution = await executor.executeRecoveryPlan('test-plan');

    expect(execution.state).toBe(RecoveryState.COMPLETED);
    expect(execution.rtoAchieved).toBeLessThan(600); // 10 minutes
  });
});
```

## Configuration Examples

### Disaster Recovery Plan Configuration

```yaml
disasterRecovery:
  rpoTarget: 3600  # 1 hour
  rtoTarget: 14400 # 4 hours
  
  backupStrategy:
    databases:
      schedule: "0 */4 * * *"
      type: incremental
      retention:
        daily: 7
        weekly: 4
        monthly: 12
      crossRegionCopy:
        enabled: true
        targetRegion: us-west-2
    
    fileStorage:
      schedule: "0 0 * * *"
      type: snapshot
      retention:
        daily: 7
        weekly: 4

  failover:
    primaryRegion: us-east-1
    secondaryRegion: us-west-2
    healthCheckInterval: 30
    failureThreshold: 3
    automaticFailover: true
    
  recoveryPlan:
    steps:
      - name: restore-database
        type: restore_database
        timeout: 1800
        priority: critical
      - name: restore-files
        type: restore_files
        timeout: 900
        dependsOn: [restore-database]
      - name: start-services
        type: start_services
        timeout: 300
        dependsOn: [restore-files]
      - name: verify-health
        type: verify_health
        timeout: 300
        dependsOn: [start-services]
      - name: update-dns
        type: update_dns
        timeout: 60
        dependsOn: [verify-health]
```
