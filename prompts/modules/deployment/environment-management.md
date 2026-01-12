# Environment Management Template

## Purpose

This template provides comprehensive patterns for implementing environment management including provisioning, configuration management, environment isolation, and infrastructure lifecycle management. It covers environment promotion, configuration drift detection, and multi-environment orchestration.

## Context

Managing multiple environments (development, staging, production) requires consistent configuration, proper isolation, and reliable promotion workflows. This template addresses the challenges of maintaining environment parity, managing configurations across environments, and ensuring secure and reproducible deployments.

## Core Components

### Environment Provisioning Service

## Examples

```typescript
interface EnvironmentProvisioningService {
  // Environment lifecycle
  createEnvironment(config: EnvironmentConfig): Promise<Environment>;
  updateEnvironment(envId: string, config: Partial<EnvironmentConfig>): Promise<Environment>;
  deleteEnvironment(envId: string): Promise<void>;
  
  // Environment operations
  startEnvironment(envId: string): Promise<void>;
  stopEnvironment(envId: string): Promise<void>;
  restartEnvironment(envId: string): Promise<void>;
  
  // Environment status
  getEnvironmentStatus(envId: string): Promise<EnvironmentStatus>;
  listEnvironments(filters?: EnvironmentFilters): Promise<Environment[]>;
}


interface EnvironmentConfig {
  name: string;
  type: EnvironmentType;
  region: string;
  resources: ResourceAllocation;
  networking: NetworkConfig;
  security: SecurityConfig;
  variables: Record<string, string>;
  secrets: SecretReference[];
  tags?: Record<string, string>;
  ttl?: number; // Time to live for ephemeral environments
}

enum EnvironmentType {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  PREVIEW = 'preview',
  EPHEMERAL = 'ephemeral',
  DISASTER_RECOVERY = 'disaster_recovery'
}

interface ResourceAllocation {
  compute: ComputeResources;
  database?: DatabaseResources;
  cache?: CacheResources;
  storage?: StorageResources;
}

interface ComputeResources {
  instanceType: string;
  minInstances: number;
  maxInstances: number;
  cpu?: string;
  memory?: string;
}

interface EnvironmentStatus {
  id: string;
  name: string;
  type: EnvironmentType;
  state: EnvironmentState;
  health: HealthStatus;
  resources: ResourceStatus[];
  lastDeployment?: DeploymentInfo;
  createdAt: Date;
  updatedAt: Date;
}

enum EnvironmentState {
  CREATING = 'creating',
  RUNNING = 'running',
  UPDATING = 'updating',
  STOPPED = 'stopped',
  FAILED = 'failed',
  DELETING = 'deleting'
}
```

### Configuration Management Service

```typescript
interface ConfigurationManagementService {
  // Configuration operations
  setConfig(envId: string, key: string, value: string): Promise<void>;
  getConfig(envId: string, key: string): Promise<string | undefined>;
  deleteConfig(envId: string, key: string): Promise<void>;
  
  // Bulk operations
  setConfigs(envId: string, configs: Record<string, string>): Promise<void>;
  getConfigs(envId: string): Promise<Record<string, string>>;
  
  // Configuration versioning
  getConfigHistory(envId: string, key: string): Promise<ConfigVersion[]>;
  rollbackConfig(envId: string, key: string, version: number): Promise<void>;
  
  // Configuration comparison
  compareConfigs(sourceEnv: string, targetEnv: string): Promise<ConfigDiff>;
  syncConfigs(sourceEnv: string, targetEnv: string, keys?: string[]): Promise<void>;
}

interface ConfigVersion {
  version: number;
  value: string;
  updatedAt: Date;
  updatedBy: string;
  comment?: string;
}

interface ConfigDiff {
  added: Record<string, string>;
  removed: Record<string, string>;
  modified: Record<string, { source: string; target: string }>;
  unchanged: string[];
}

interface ConfigurationTemplate {
  name: string;
  description?: string;
  variables: ConfigVariable[];
  defaults: Record<string, string>;
  overrides: Record<EnvironmentType, Record<string, string>>;
}

interface ConfigVariable {
  name: string;
  description?: string;
  type: ConfigValueType;
  required: boolean;
  default?: string;
  validation?: ValidationRule;
  sensitive?: boolean;
}

enum ConfigValueType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  JSON = 'json',
  SECRET = 'secret',
  URL = 'url'
}
```

### Environment Promotion Service

```typescript
interface EnvironmentPromotionService {
  // Promotion operations
  promote(config: PromotionConfig): Promise<PromotionResult>;
  validatePromotion(config: PromotionConfig): Promise<ValidationResult>;
  
  // Promotion history
  getPromotionHistory(envId: string): Promise<Promotion[]>;
  rollbackPromotion(promotionId: string): Promise<void>;
  
  // Promotion policies
  setPromotionPolicy(policy: PromotionPolicy): Promise<void>;
  getPromotionPolicy(sourceEnv: string, targetEnv: string): Promise<PromotionPolicy>;
}

interface PromotionConfig {
  sourceEnvironment: string;
  targetEnvironment: string;
  version: string;
  includeConfig?: boolean;
  includeSecrets?: boolean;
  dryRun?: boolean;
  approvers?: string[];
}

interface PromotionPolicy {
  sourceEnvironment: string;
  targetEnvironment: string;
  requireApproval: boolean;
  approvers?: string[];
  requiredChecks: string[];
  autoPromote?: boolean;
  autoPromoteDelay?: number;
  blockedHours?: TimeRange[];
}

interface PromotionResult {
  id: string;
  status: PromotionStatus;
  sourceEnvironment: string;
  targetEnvironment: string;
  version: string;
  startedAt: Date;
  completedAt?: Date;
  changes: PromotionChange[];
}

enum PromotionStatus {
  PENDING_APPROVAL = 'pending_approval',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}
```


## Implementation Patterns

### Environment Factory Pattern

```typescript
class EnvironmentFactory {
  private templates: Map<EnvironmentType, EnvironmentTemplate>;

  async createEnvironment(type: EnvironmentType, overrides?: Partial<EnvironmentConfig>): Promise<Environment> {
    const template = this.templates.get(type);
    if (!template) {
      throw new Error(`No template found for environment type: ${type}`);
    }

    const config = this.mergeConfig(template.defaultConfig, overrides);
    
    // Validate configuration
    await this.validateConfig(config);

    // Provision infrastructure
    const infrastructure = await this.provisionInfrastructure(config);

    // Configure networking
    await this.configureNetworking(infrastructure, config.networking);

    // Deploy base services
    await this.deployBaseServices(infrastructure, config);

    // Apply configurations
    await this.applyConfigurations(infrastructure, config.variables);

    // Set up monitoring
    await this.setupMonitoring(infrastructure, config);

    return {
      id: infrastructure.id,
      name: config.name,
      type,
      status: EnvironmentState.RUNNING,
      config,
      infrastructure
    };
  }

  async createEphemeralEnvironment(branchName: string, ttl: number = 24 * 60 * 60): Promise<Environment> {
    const envName = this.sanitizeBranchName(branchName);
    
    return this.createEnvironment(EnvironmentType.EPHEMERAL, {
      name: `preview-${envName}`,
      ttl,
      resources: {
        compute: {
          instanceType: 't3.small',
          minInstances: 1,
          maxInstances: 2
        }
      },
      tags: {
        branch: branchName,
        ephemeral: 'true',
        expiresAt: new Date(Date.now() + ttl * 1000).toISOString()
      }
    });
  }

  private sanitizeBranchName(branch: string): string {
    return branch
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 63);
  }
}
```

### Configuration Drift Detection

```typescript
class ConfigurationDriftDetector {
  async detectDrift(envId: string): Promise<DriftReport> {
    const environment = await this.envService.getEnvironment(envId);
    const expectedConfig = await this.configService.getConfigs(envId);
    const actualConfig = await this.fetchActualConfig(environment);

    const drifts: ConfigDrift[] = [];

    // Check for missing configurations
    for (const [key, expectedValue] of Object.entries(expectedConfig)) {
      const actualValue = actualConfig[key];
      
      if (actualValue === undefined) {
        drifts.push({
          key,
          type: 'missing',
          expected: expectedValue,
          actual: undefined
        });
      } else if (actualValue !== expectedValue) {
        drifts.push({
          key,
          type: 'modified',
          expected: expectedValue,
          actual: actualValue
        });
      }
    }

    // Check for unexpected configurations
    for (const [key, actualValue] of Object.entries(actualConfig)) {
      if (expectedConfig[key] === undefined) {
        drifts.push({
          key,
          type: 'unexpected',
          expected: undefined,
          actual: actualValue
        });
      }
    }

    return {
      environmentId: envId,
      detectedAt: new Date(),
      hasDrift: drifts.length > 0,
      drifts,
      recommendation: this.generateRecommendation(drifts)
    };
  }

  async reconcileDrift(envId: string, driftReport: DriftReport): Promise<ReconciliationResult> {
    const results: ReconciliationAction[] = [];

    for (const drift of driftReport.drifts) {
      switch (drift.type) {
        case 'missing':
        case 'modified':
          await this.applyConfig(envId, drift.key, drift.expected!);
          results.push({ key: drift.key, action: 'applied', success: true });
          break;
        case 'unexpected':
          await this.removeConfig(envId, drift.key);
          results.push({ key: drift.key, action: 'removed', success: true });
          break;
      }
    }

    return {
      environmentId: envId,
      reconciledAt: new Date(),
      actions: results
    };
  }
}
```

### Environment Cloning

```typescript
class EnvironmentCloner {
  async cloneEnvironment(sourceEnvId: string, targetConfig: CloneConfig): Promise<Environment> {
    const sourceEnv = await this.envService.getEnvironment(sourceEnvId);
    
    // Clone infrastructure configuration
    const infraConfig = await this.cloneInfrastructure(sourceEnv, targetConfig);
    
    // Clone configurations (with optional overrides)
    const configs = await this.cloneConfigurations(sourceEnvId, targetConfig.configOverrides);
    
    // Clone secrets (if permitted)
    const secrets = targetConfig.includeSecrets 
      ? await this.cloneSecrets(sourceEnvId)
      : [];

    // Create new environment
    const newEnv = await this.envService.createEnvironment({
      name: targetConfig.name,
      type: targetConfig.type || sourceEnv.type,
      region: targetConfig.region || sourceEnv.region,
      resources: infraConfig.resources,
      networking: infraConfig.networking,
      security: infraConfig.security,
      variables: configs,
      secrets,
      tags: {
        ...sourceEnv.tags,
        clonedFrom: sourceEnvId,
        clonedAt: new Date().toISOString()
      }
    });

    // Optionally sync data
    if (targetConfig.syncData) {
      await this.syncData(sourceEnvId, newEnv.id, targetConfig.dataSyncConfig);
    }

    return newEnv;
  }
}
```


## Integration Points

### Terraform Environment Management

```typescript
class TerraformEnvironmentManager {
  generateEnvironmentModule(config: EnvironmentConfig): string {
    return `
module "environment_${config.name}" {
  source = "./modules/environment"

  name        = "${config.name}"
  environment = "${config.type}"
  region      = "${config.region}"

  # Compute resources
  instance_type  = "${config.resources.compute.instanceType}"
  min_instances  = ${config.resources.compute.minInstances}
  max_instances  = ${config.resources.compute.maxInstances}

  # Networking
  vpc_cidr           = "${config.networking.vpcCidr}"
  public_subnets     = ${JSON.stringify(config.networking.publicSubnets)}
  private_subnets    = ${JSON.stringify(config.networking.privateSubnets)}
  enable_nat_gateway = ${config.networking.enableNatGateway}

  # Database (if configured)
  ${config.resources.database ? `
  database_instance_class = "${config.resources.database.instanceClass}"
  database_storage        = ${config.resources.database.storage}
  database_multi_az       = ${config.resources.database.multiAz}
  ` : '# No database configured'}

  # Tags
  tags = ${JSON.stringify(config.tags || {})}
}

output "${config.name}_endpoint" {
  value = module.environment_${config.name}.endpoint
}

output "${config.name}_database_endpoint" {
  value = module.environment_${config.name}.database_endpoint
}
`;
  }

  generateWorkspaceConfig(environments: EnvironmentConfig[]): string {
    return `
terraform {
  backend "s3" {
    bucket         = "terraform-state"
    key            = "environments/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }
}

# Environment-specific workspaces
locals {
  environments = {
    ${environments.map(env => `
    ${env.name} = {
      type   = "${env.type}"
      region = "${env.region}"
    }`).join('\n')}
  }
}
`;
  }
}
```

### Kubernetes Namespace Management

```typescript
class KubernetesEnvironmentManager {
  async createNamespace(config: EnvironmentConfig): Promise<void> {
    const namespace = {
      apiVersion: 'v1',
      kind: 'Namespace',
      metadata: {
        name: config.name,
        labels: {
          environment: config.type,
          'managed-by': 'environment-manager'
        },
        annotations: {
          'environment-manager/created-at': new Date().toISOString()
        }
      }
    };

    await this.k8sClient.createNamespace(namespace);

    // Apply resource quotas
    await this.applyResourceQuota(config);

    // Apply network policies
    await this.applyNetworkPolicies(config);

    // Create service accounts
    await this.createServiceAccounts(config);
  }

  private async applyResourceQuota(config: EnvironmentConfig): Promise<void> {
    const quota = {
      apiVersion: 'v1',
      kind: 'ResourceQuota',
      metadata: {
        name: `${config.name}-quota`,
        namespace: config.name
      },
      spec: {
        hard: {
          'requests.cpu': config.resources.compute.cpu || '4',
          'requests.memory': config.resources.compute.memory || '8Gi',
          'limits.cpu': '8',
          'limits.memory': '16Gi',
          pods: '50',
          services: '20',
          secrets: '50',
          configmaps: '50'
        }
      }
    };

    await this.k8sClient.createResourceQuota(config.name, quota);
  }

  private async applyNetworkPolicies(config: EnvironmentConfig): Promise<void> {
    // Default deny all ingress
    const denyAllIngress = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: 'default-deny-ingress',
        namespace: config.name
      },
      spec: {
        podSelector: {},
        policyTypes: ['Ingress']
      }
    };

    await this.k8sClient.createNetworkPolicy(config.name, denyAllIngress);

    // Allow ingress from same namespace
    const allowSameNamespace = {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: 'allow-same-namespace',
        namespace: config.name
      },
      spec: {
        podSelector: {},
        ingress: [{
          from: [{
            namespaceSelector: {
              matchLabels: {
                'kubernetes.io/metadata.name': config.name
              }
            }
          }]
        }],
        policyTypes: ['Ingress']
      }
    };

    await this.k8sClient.createNetworkPolicy(config.name, allowSameNamespace);
  }
}
```

## Security Considerations

### Environment Isolation

```typescript
class EnvironmentSecurityManager {
  async enforceIsolation(envId: string): Promise<void> {
    const environment = await this.envService.getEnvironment(envId);

    // Network isolation
    await this.configureNetworkIsolation(environment);

    // IAM isolation
    await this.configureIAMIsolation(environment);

    // Data isolation
    await this.configureDataIsolation(environment);

    // Secret isolation
    await this.configureSecretIsolation(environment);
  }

  private async configureNetworkIsolation(env: Environment): Promise<void> {
    // Create dedicated VPC or subnet
    // Configure security groups
    // Set up network ACLs
    // Enable VPC flow logs
  }

  private async configureIAMIsolation(env: Environment): Promise<void> {
    // Create environment-specific IAM roles
    // Apply least privilege policies
    // Enable cross-account access controls if needed
  }

  async auditEnvironmentAccess(envId: string): Promise<AccessAuditReport> {
    const accessLogs = await this.getAccessLogs(envId);
    
    return {
      environmentId: envId,
      period: { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
      totalAccesses: accessLogs.length,
      uniqueUsers: new Set(accessLogs.map(l => l.userId)).size,
      accessByType: this.groupByAccessType(accessLogs),
      suspiciousActivities: this.detectSuspiciousActivities(accessLogs)
    };
  }
}
```

## Testing Considerations

### Environment Management Testing

```typescript
describe('Environment Management Tests', () => {
  it('should create environment with correct configuration', async () => {
    const factory = new EnvironmentFactory();
    const env = await factory.createEnvironment(EnvironmentType.STAGING, {
      name: 'test-staging',
      region: 'us-east-1'
    });

    expect(env.type).toBe(EnvironmentType.STAGING);
    expect(env.status).toBe(EnvironmentState.RUNNING);
  });

  it('should detect configuration drift', async () => {
    const detector = new ConfigurationDriftDetector();
    const report = await detector.detectDrift('env-123');

    expect(report.hasDrift).toBeDefined();
    expect(report.drifts).toBeInstanceOf(Array);
  });

  it('should clone environment correctly', async () => {
    const cloner = new EnvironmentCloner();
    const clonedEnv = await cloner.cloneEnvironment('source-env', {
      name: 'cloned-env',
      type: EnvironmentType.DEVELOPMENT
    });

    expect(clonedEnv.name).toBe('cloned-env');
    expect(clonedEnv.tags?.clonedFrom).toBe('source-env');
  });
});
```

## Configuration Examples

### Environment Configuration File

```yaml
environments:
  development:
    type: development
    region: us-east-1
    resources:
      compute:
        instanceType: t3.small
        minInstances: 1
        maxInstances: 2
      database:
        instanceClass: db.t3.micro
        storage: 20
        multiAz: false
    networking:
      vpcCidr: "10.0.0.0/16"
      publicSubnets: ["10.0.1.0/24"]
      privateSubnets: ["10.0.2.0/24"]
      enableNatGateway: false

  staging:
    type: staging
    region: us-east-1
    resources:
      compute:
        instanceType: t3.medium
        minInstances: 2
        maxInstances: 4
      database:
        instanceClass: db.t3.small
        storage: 50
        multiAz: false
    networking:
      vpcCidr: "10.1.0.0/16"
      publicSubnets: ["10.1.1.0/24", "10.1.2.0/24"]
      privateSubnets: ["10.1.3.0/24", "10.1.4.0/24"]
      enableNatGateway: true

  production:
    type: production
    region: us-east-1
    resources:
      compute:
        instanceType: t3.large
        minInstances: 3
        maxInstances: 10
      database:
        instanceClass: db.r5.large
        storage: 100
        multiAz: true
    networking:
      vpcCidr: "10.2.0.0/16"
      publicSubnets: ["10.2.1.0/24", "10.2.2.0/24", "10.2.3.0/24"]
      privateSubnets: ["10.2.4.0/24", "10.2.5.0/24", "10.2.6.0/24"]
      enableNatGateway: true
```
