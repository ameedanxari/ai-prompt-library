# Cloud Deployment Template

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

This template provides comprehensive patterns for implementing cloud deployments including multi-cloud support, infrastructure as code, auto-scaling strategies, and cost optimization. It covers cloud-native architectures, serverless deployments, and hybrid cloud configurations.

## Context

Modern applications require flexible cloud deployment strategies that can span multiple providers, scale automatically, and optimize costs. This template addresses the challenges of creating portable, scalable, and cost-effective cloud deployments using infrastructure as code principles.

## Core Components

### Cloud Deployment Service

## Examples

```typescript
interface CloudDeploymentService {
  // Infrastructure provisioning
  provisionInfrastructure(config: InfrastructureConfig): Promise<ProvisioningResult>;
  updateInfrastructure(stackId: string, config: Partial<InfrastructureConfig>): Promise<ProvisioningResult>;
  destroyInfrastructure(stackId: string): Promise<void>;
  
  // Stack management
  getStackStatus(stackId: string): Promise<StackStatus>;
  listStacks(filters?: StackFilters): Promise<Stack[]>;
  getStackOutputs(stackId: string): Promise<Record<string, string>>;
  
  // Cost management
  estimateCost(config: InfrastructureConfig): Promise<CostEstimate>;
  getActualCost(stackId: string, period: DateRange): Promise<CostReport>;
}


interface InfrastructureConfig {
  name: string;
  environment: Environment;
  provider: CloudProvider;
  region: string;
  resources: ResourceDefinition[];
  networking?: NetworkingConfig;
  security?: SecurityConfig;
  monitoring?: MonitoringConfig;
  tags?: Record<string, string>;
}

enum CloudProvider {
  AWS = 'aws',
  AZURE = 'azure',
  GCP = 'gcp',
  MULTI_CLOUD = 'multi-cloud'
}

enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

interface ResourceDefinition {
  type: ResourceType;
  name: string;
  config: Record<string, unknown>;
  dependencies?: string[];
  scaling?: ScalingConfig;
}

enum ResourceType {
  COMPUTE = 'compute',
  DATABASE = 'database',
  STORAGE = 'storage',
  NETWORK = 'network',
  LOAD_BALANCER = 'load_balancer',
  CDN = 'cdn',
  CACHE = 'cache',
  QUEUE = 'queue',
  FUNCTION = 'function',
  CONTAINER = 'container'
}

interface ScalingConfig {
  type: 'manual' | 'auto' | 'scheduled';
  minInstances: number;
  maxInstances: number;
  targetMetric?: ScalingMetric;
  targetValue?: number;
  cooldownPeriod?: number;
}

interface ScalingMetric {
  name: string;
  type: 'cpu' | 'memory' | 'requests' | 'custom';
  aggregation: 'average' | 'max' | 'min';
}

interface StackStatus {
  id: string;
  name: string;
  status: StackState;
  resources: ResourceStatus[];
  lastUpdated: Date;
  outputs?: Record<string, string>;
}

enum StackState {
  CREATING = 'creating',
  UPDATING = 'updating',
  STABLE = 'stable',
  FAILED = 'failed',
  DELETING = 'deleting',
  DELETED = 'deleted'
}
```

### Infrastructure as Code Service

```typescript
interface IaCService {
  // Template generation
  generateTemplate(config: InfrastructureConfig): Promise<IaCTemplate>;
  validateTemplate(template: IaCTemplate): Promise<ValidationResult>;
  
  // State management
  getState(stackId: string): Promise<IaCState>;
  importResource(stackId: string, resource: ResourceImport): Promise<void>;
  
  // Plan and apply
  plan(template: IaCTemplate): Promise<ExecutionPlan>;
  apply(plan: ExecutionPlan): Promise<ApplyResult>;
  
  // Drift detection
  detectDrift(stackId: string): Promise<DriftReport>;
}

interface IaCTemplate {
  format: 'terraform' | 'cloudformation' | 'pulumi' | 'cdk';
  content: string;
  variables?: Record<string, VariableDefinition>;
  outputs?: Record<string, OutputDefinition>;
}

interface ExecutionPlan {
  id: string;
  changes: PlannedChange[];
  summary: ChangeSummary;
  estimatedDuration: number;
}

interface PlannedChange {
  action: 'create' | 'update' | 'delete' | 'replace';
  resourceType: string;
  resourceName: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
}

interface DriftReport {
  stackId: string;
  detectedAt: Date;
  driftedResources: DriftedResource[];
  status: 'in_sync' | 'drifted' | 'unknown';
}
```

### Auto-Scaling Service

```typescript
interface AutoScalingService {
  // Scaling policies
  createScalingPolicy(config: ScalingPolicyConfig): Promise<string>;
  updateScalingPolicy(policyId: string, config: Partial<ScalingPolicyConfig>): Promise<void>;
  deleteScalingPolicy(policyId: string): Promise<void>;
  
  // Scaling actions
  scaleOut(resourceId: string, count: number): Promise<void>;
  scaleIn(resourceId: string, count: number): Promise<void>;
  
  // Scheduled scaling
  createScheduledAction(config: ScheduledScalingConfig): Promise<string>;
  
  // Predictive scaling
  enablePredictiveScaling(resourceId: string, config: PredictiveScalingConfig): Promise<void>;
}

interface ScalingPolicyConfig {
  name: string;
  resourceId: string;
  policyType: 'target_tracking' | 'step' | 'simple';
  targetValue?: number;
  metric: ScalingMetric;
  scaleOutCooldown?: number;
  scaleInCooldown?: number;
  stepAdjustments?: StepAdjustment[];
}

interface ScheduledScalingConfig {
  name: string;
  resourceId: string;
  schedule: string; // Cron expression
  minCapacity?: number;
  maxCapacity?: number;
  desiredCapacity?: number;
  timezone?: string;
}

interface PredictiveScalingConfig {
  mode: 'forecast_only' | 'forecast_and_scale';
  schedulingBufferTime: number;
  maxCapacityBreachBehavior: 'honor_max_capacity' | 'increase_max_capacity';
  metricSpecifications: PredictiveMetricSpec[];
}
```


## Implementation Patterns

### Terraform Infrastructure Generator

```typescript
class TerraformGenerator {
  generateMainTf(config: InfrastructureConfig): string {
    const blocks: string[] = [];

    // Provider configuration
    blocks.push(this.generateProviderBlock(config.provider, config.region));

    // Backend configuration
    blocks.push(this.generateBackendBlock(config));

    // Resource blocks
    for (const resource of config.resources) {
      blocks.push(this.generateResourceBlock(resource));
    }

    return blocks.join('\n\n');
  }

  private generateProviderBlock(provider: CloudProvider, region: string): string {
    switch (provider) {
      case CloudProvider.AWS:
        return `
provider "aws" {
  region = var.region

  default_tags {
    tags = var.common_tags
  }
}`;
      case CloudProvider.GCP:
        return `
provider "google" {
  project = var.project_id
  region  = var.region
}`;
      case CloudProvider.AZURE:
        return `
provider "azurerm" {
  features {}
  subscription_id = var.subscription_id
}`;
      default:
        return '';
    }
  }

  generateEKSCluster(config: EKSClusterConfig): string {
    return `
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 19.0"

  cluster_name    = "${config.name}"
  cluster_version = "${config.version}"

  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets

  cluster_endpoint_public_access = ${config.publicAccess}

  eks_managed_node_groups = {
    default = {
      min_size     = ${config.minNodes}
      max_size     = ${config.maxNodes}
      desired_size = ${config.desiredNodes}

      instance_types = ${JSON.stringify(config.instanceTypes)}
      capacity_type  = "${config.capacityType}"

      labels = ${JSON.stringify(config.labels)}
    }
  }

  cluster_addons = {
    coredns = {
      most_recent = true
    }
    kube-proxy = {
      most_recent = true
    }
    vpc-cni = {
      most_recent = true
    }
  }

  tags = var.common_tags
}`;
  }

  generateRDSInstance(config: RDSConfig): string {
    return `
module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.0"

  identifier = "${config.name}"

  engine               = "${config.engine}"
  engine_version       = "${config.engineVersion}"
  family               = "${config.family}"
  major_engine_version = "${config.majorVersion}"
  instance_class       = "${config.instanceClass}"

  allocated_storage     = ${config.allocatedStorage}
  max_allocated_storage = ${config.maxAllocatedStorage}

  db_name  = "${config.databaseName}"
  username = "${config.username}"
  port     = ${config.port}

  multi_az               = ${config.multiAZ}
  db_subnet_group_name   = module.vpc.database_subnet_group_name
  vpc_security_group_ids = [module.security_group.security_group_id]

  backup_retention_period = ${config.backupRetention}
  skip_final_snapshot     = ${config.skipFinalSnapshot}
  deletion_protection     = ${config.deletionProtection}

  performance_insights_enabled = ${config.performanceInsights}
  monitoring_interval          = ${config.monitoringInterval}

  tags = var.common_tags
}`;
  }
}
```

### Multi-Cloud Deployment Manager

```typescript
class MultiCloudDeploymentManager {
  private providers: Map<CloudProvider, CloudProviderClient>;

  async deployToMultipleRegions(config: MultiRegionConfig): Promise<DeploymentResult[]> {
    const results: DeploymentResult[] = [];

    for (const region of config.regions) {
      const provider = this.providers.get(region.provider);
      if (!provider) {
        throw new Error(`Provider ${region.provider} not configured`);
      }

      const result = await provider.deploy({
        ...config.baseConfig,
        region: region.name,
        tags: {
          ...config.baseConfig.tags,
          region: region.name,
          provider: region.provider
        }
      });

      results.push(result);
    }

    // Configure cross-region replication if needed
    if (config.enableReplication) {
      await this.configureReplication(results, config.replicationConfig);
    }

    // Configure global load balancing
    if (config.enableGlobalLoadBalancing) {
      await this.configureGlobalLoadBalancer(results, config.loadBalancerConfig);
    }

    return results;
  }

  async configureGlobalLoadBalancer(
    deployments: DeploymentResult[],
    config: GlobalLoadBalancerConfig
  ): Promise<void> {
    const endpoints = deployments.map(d => ({
      region: d.region,
      endpoint: d.outputs.loadBalancerDns,
      weight: config.weights?.[d.region] || 100,
      healthCheck: config.healthCheck
    }));

    // Create Route53 health checks and routing policy
    await this.createGlobalRoutingPolicy(endpoints, config);
  }
}
```

### Serverless Deployment Pattern

```typescript
class ServerlessDeploymentManager {
  generateServerlessConfig(config: ServerlessAppConfig): string {
    return yaml.stringify({
      service: config.serviceName,
      frameworkVersion: '3',
      
      provider: {
        name: 'aws',
        runtime: config.runtime,
        region: config.region,
        stage: '${opt:stage, "dev"}',
        memorySize: config.memorySize || 256,
        timeout: config.timeout || 30,
        environment: config.environment,
        iam: {
          role: {
            statements: config.iamStatements
          }
        },
        vpc: config.vpc ? {
          securityGroupIds: config.vpc.securityGroupIds,
          subnetIds: config.vpc.subnetIds
        } : undefined
      },

      functions: Object.fromEntries(
        config.functions.map(fn => [fn.name, {
          handler: fn.handler,
          events: fn.events,
          memorySize: fn.memorySize,
          timeout: fn.timeout,
          environment: fn.environment,
          reservedConcurrency: fn.reservedConcurrency
        }])
      ),

      resources: {
        Resources: config.additionalResources
      },

      plugins: [
        'serverless-offline',
        'serverless-plugin-warmup',
        'serverless-prune-plugin'
      ],

      custom: {
        warmup: {
          default: {
            enabled: config.warmup?.enabled || false,
            events: [{ schedule: 'rate(5 minutes)' }]
          }
        },
        prune: {
          automatic: true,
          number: 3
        }
      }
    });
  }
}
```


## Integration Points

### AWS CDK Integration

```typescript
class CDKStackGenerator {
  generateStack(config: CDKStackConfig): string {
    return `
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';

export class ${config.stackName}Stack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new ec2.Vpc(this, 'VPC', {
      maxAzs: ${config.maxAzs || 3},
      natGateways: ${config.natGateways || 1},
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
      containerInsights: true,
    });

    // Fargate Service
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: ${config.memoryLimit || 512},
      cpu: ${config.cpu || 256},
    });

    taskDefinition.addContainer('Container', {
      image: ecs.ContainerImage.fromRegistry('${config.image}'),
      portMappings: [{ containerPort: ${config.containerPort || 80} }],
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: '${config.stackName}' }),
      environment: ${JSON.stringify(config.environment || {})},
    });

    const service = new ecs.FargateService(this, 'Service', {
      cluster,
      taskDefinition,
      desiredCount: ${config.desiredCount || 2},
      assignPublicIp: false,
    });

    // Application Load Balancer
    const lb = new elbv2.ApplicationLoadBalancer(this, 'ALB', {
      vpc,
      internetFacing: true,
    });

    const listener = lb.addListener('Listener', {
      port: 443,
      certificates: [{ certificateArn: '${config.certificateArn}' }],
    });

    listener.addTargets('Target', {
      port: ${config.containerPort || 80},
      targets: [service],
      healthCheck: {
        path: '${config.healthCheckPath || "/health"}',
        interval: cdk.Duration.seconds(30),
      },
    });

    // Auto Scaling
    const scaling = service.autoScaleTaskCount({
      minCapacity: ${config.minCapacity || 2},
      maxCapacity: ${config.maxCapacity || 10},
    });

    scaling.scaleOnCpuUtilization('CpuScaling', {
      targetUtilizationPercent: ${config.targetCpuUtilization || 70},
    });

    // Outputs
    new cdk.CfnOutput(this, 'LoadBalancerDNS', {
      value: lb.loadBalancerDnsName,
    });
  }
}`;
  }
}
```

### Pulumi Integration

```typescript
class PulumiStackGenerator {
  generateStack(config: PulumiStackConfig): string {
    return `
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as awsx from "@pulumi/awsx";

const config = new pulumi.Config();
const environment = config.require("environment");

// VPC
const vpc = new awsx.ec2.Vpc("${config.name}-vpc", {
  numberOfAvailabilityZones: ${config.azCount || 2},
  natGateways: {
    strategy: environment === "production" ? "OnePerAz" : "Single",
  },
});

// ECS Cluster
const cluster = new aws.ecs.Cluster("${config.name}-cluster", {
  settings: [{
    name: "containerInsights",
    value: "enabled",
  }],
});

// Application Load Balancer
const alb = new awsx.lb.ApplicationLoadBalancer("${config.name}-alb", {
  subnetIds: vpc.publicSubnetIds,
});

// Fargate Service
const service = new awsx.ecs.FargateService("${config.name}-service", {
  cluster: cluster.arn,
  networkConfiguration: {
    subnets: vpc.privateSubnetIds,
    securityGroups: [],
  },
  desiredCount: ${config.desiredCount || 2},
  taskDefinitionArgs: {
    container: {
      name: "${config.name}",
      image: "${config.image}",
      cpu: ${config.cpu || 256},
      memory: ${config.memory || 512},
      essential: true,
      portMappings: [{
        containerPort: ${config.containerPort || 80},
        targetGroup: alb.defaultTargetGroup,
      }],
    },
  },
});

// Auto Scaling
const scalingTarget = new aws.appautoscaling.Target("${config.name}-scaling-target", {
  maxCapacity: ${config.maxCapacity || 10},
  minCapacity: ${config.minCapacity || 2},
  resourceId: pulumi.interpolate\`service/\${cluster.name}/\${service.service.name}\`,
  scalableDimension: "ecs:service:DesiredCount",
  serviceNamespace: "ecs",
});

const scalingPolicy = new aws.appautoscaling.Policy("${config.name}-scaling-policy", {
  policyType: "TargetTrackingScaling",
  resourceId: scalingTarget.resourceId,
  scalableDimension: scalingTarget.scalableDimension,
  serviceNamespace: scalingTarget.serviceNamespace,
  targetTrackingScalingPolicyConfiguration: {
    predefinedMetricSpecification: {
      predefinedMetricType: "ECSServiceAverageCPUUtilization",
    },
    targetValue: ${config.targetCpuUtilization || 70},
  },
});

export const url = alb.loadBalancer.dnsName;
export const vpcId = vpc.vpcId;
`;
  }
}
```

## Security Considerations

### Infrastructure Security

```typescript
class InfrastructureSecurityManager {
  generateSecurityBaseline(config: SecurityBaselineConfig): SecurityBaseline {
    return {
      encryption: {
        atRest: {
          enabled: true,
          keyManagement: 'aws-managed', // or 'customer-managed'
          algorithm: 'AES-256'
        },
        inTransit: {
          enabled: true,
          tlsVersion: '1.2',
          enforceHttps: true
        }
      },
      networking: {
        vpcFlowLogs: true,
        privateSubnets: true,
        natGateway: true,
        networkAcls: this.generateNetworkAcls(config),
        securityGroups: this.generateSecurityGroups(config)
      },
      accessControl: {
        iamPolicies: this.generateIamPolicies(config),
        serviceRoles: this.generateServiceRoles(config),
        instanceProfiles: this.generateInstanceProfiles(config)
      },
      compliance: {
        enableCloudTrail: true,
        enableConfig: true,
        enableGuardDuty: true,
        enableSecurityHub: true
      }
    };
  }

  generateSecurityGroups(config: SecurityBaselineConfig): SecurityGroupConfig[] {
    return [
      {
        name: 'alb-sg',
        description: 'Security group for Application Load Balancer',
        ingress: [
          { port: 443, protocol: 'tcp', cidr: '0.0.0.0/0' },
          { port: 80, protocol: 'tcp', cidr: '0.0.0.0/0' }
        ],
        egress: [
          { port: 0, protocol: '-1', cidr: '0.0.0.0/0' }
        ]
      },
      {
        name: 'app-sg',
        description: 'Security group for application instances',
        ingress: [
          { port: config.appPort, protocol: 'tcp', sourceSecurityGroup: 'alb-sg' }
        ],
        egress: [
          { port: 443, protocol: 'tcp', cidr: '0.0.0.0/0' },
          { port: 5432, protocol: 'tcp', sourceSecurityGroup: 'db-sg' }
        ]
      },
      {
        name: 'db-sg',
        description: 'Security group for database',
        ingress: [
          { port: 5432, protocol: 'tcp', sourceSecurityGroup: 'app-sg' }
        ],
        egress: []
      }
    ];
  }
}
```

## Testing Considerations

### Infrastructure Testing

```typescript
describe('Cloud Deployment Tests', () => {
  it('should generate valid Terraform configuration', () => {
    const generator = new TerraformGenerator();
    const config = generator.generateMainTf({
      name: 'test-stack',
      environment: Environment.PRODUCTION,
      provider: CloudProvider.AWS,
      region: 'us-east-1',
      resources: []
    });

    expect(config).toContain('provider "aws"');
    expect(config).toContain('region = var.region');
  });

  it('should estimate costs accurately', async () => {
    const service = new CloudDeploymentService();
    const estimate = await service.estimateCost({
      name: 'test-stack',
      environment: Environment.PRODUCTION,
      provider: CloudProvider.AWS,
      region: 'us-east-1',
      resources: [
        { type: ResourceType.COMPUTE, name: 'web', config: { instanceType: 't3.medium', count: 3 } }
      ]
    });

    expect(estimate.monthly).toBeGreaterThan(0);
    expect(estimate.breakdown).toHaveLength(1);
  });
});
```

## Configuration Examples

### Production Terraform Configuration

```hcl
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket         = "terraform-state-bucket"
    key            = "production/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "terraform-locks"
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

variable "environment" {
  type    = string
  default = "production"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

locals {
  common_tags = {
    Environment = var.environment
    ManagedBy   = "terraform"
    Project     = "myapp"
  }
}

module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "myapp-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["${var.region}a", "${var.region}b", "${var.region}c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = false

  tags = local.common_tags
}
```
