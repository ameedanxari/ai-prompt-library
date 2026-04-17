# Scalability Patterns Template

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

This template provides comprehensive patterns for implementing horizontal scaling, load balancing, and distributed system architectures. It covers auto-scaling strategies, database sharding, microservices scaling, event-driven architectures, and capacity planning for high-availability applications.

## Context

Scalability is essential for applications that need to handle growing workloads while maintaining performance and reliability. This template addresses the challenges of designing systems that can scale horizontally, implementing effective load balancing strategies, managing distributed state, and optimizing resource utilization across dynamic infrastructure.

## Core Components

### Load Balancer Service

## Examples

```typescript
interface LoadBalancerService {
  // Backend management
  registerBackend(backend: Backend): Promise<void>;
  deregisterBackend(backendId: string): Promise<void>;
  getBackends(): Promise<Backend[]>;
  getHealthyBackends(): Promise<Backend[]>;
  
  // Load balancing
  selectBackend(request: Request): Promise<Backend>;
  routeRequest(request: Request): Promise<Response>;
  
  // Health checking
  checkHealth(backendId: string): Promise<HealthStatus>;
  configureHealthCheck(config: HealthCheckConfig): void;
  
  // Traffic management
  setWeight(backendId: string, weight: number): Promise<void>;
  drainBackend(backendId: string, timeout: number): Promise<void>;
}

interface Backend {
  id: string;
  address: string;
  port: number;
  weight: number;
  maxConnections?: number;
  healthStatus: HealthStatus;
  metadata?: Record<string, string>;
}

interface HealthStatus {
  healthy: boolean;
  lastCheck: Date;
  consecutiveFailures: number;
  latency?: number;
  errorRate?: number;
}

interface HealthCheckConfig {
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
  path?: string;
  expectedStatus?: number;
}

enum LoadBalancingAlgorithm {
  ROUND_ROBIN = 'round_robin',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  WEIGHTED_LEAST_CONNECTIONS = 'weighted_least_connections',
  IP_HASH = 'ip_hash',
  RANDOM = 'random',
  LEAST_RESPONSE_TIME = 'least_response_time'
}
```


### Auto-Scaling Service

```typescript
interface AutoScalingService {
  // Scaling policies
  createScalingPolicy(policy: ScalingPolicy): Promise<string>;
  updateScalingPolicy(policyId: string, policy: Partial<ScalingPolicy>): Promise<void>;
  deleteScalingPolicy(policyId: string): Promise<void>;
  getScalingPolicies(): Promise<ScalingPolicy[]>;
  
  // Scaling actions
  scaleOut(groupId: string, count: number): Promise<ScalingAction>;
  scaleIn(groupId: string, count: number): Promise<ScalingAction>;
  setDesiredCapacity(groupId: string, capacity: number): Promise<void>;
  
  // Scaling groups
  createScalingGroup(group: ScalingGroup): Promise<string>;
  getScalingGroup(groupId: string): Promise<ScalingGroup>;
  getScalingHistory(groupId: string): Promise<ScalingAction[]>;
  
  // Metrics
  getScalingMetrics(groupId: string): Promise<ScalingMetrics>;
}

interface ScalingPolicy {
  id: string;
  name: string;
  groupId: string;
  policyType: ScalingPolicyType;
  metric: ScalingMetric;
  targetValue?: number;
  scaleOutCooldown: number;
  scaleInCooldown: number;
  minCapacity: number;
  maxCapacity: number;
  stepAdjustments?: StepAdjustment[];
}

enum ScalingPolicyType {
  TARGET_TRACKING = 'target_tracking',
  STEP_SCALING = 'step_scaling',
  SIMPLE_SCALING = 'simple_scaling',
  SCHEDULED = 'scheduled',
  PREDICTIVE = 'predictive'
}

interface ScalingMetric {
  name: string;
  namespace?: string;
  dimensions?: Record<string, string>;
  statistic: 'Average' | 'Sum' | 'Minimum' | 'Maximum';
}

interface StepAdjustment {
  lowerBound?: number;
  upperBound?: number;
  scalingAdjustment: number;
}

interface ScalingGroup {
  id: string;
  name: string;
  minSize: number;
  maxSize: number;
  desiredCapacity: number;
  currentCapacity: number;
  instances: ScalingInstance[];
  healthCheckType: 'EC2' | 'ELB' | 'custom';
  healthCheckGracePeriod: number;
}

interface ScalingAction {
  id: string;
  groupId: string;
  type: 'scale_out' | 'scale_in';
  previousCapacity: number;
  newCapacity: number;
  reason: string;
  timestamp: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
}
```

### Database Sharding Service

```typescript
interface ShardingService {
  // Shard management
  createShard(shard: ShardConfig): Promise<string>;
  removeShard(shardId: string): Promise<void>;
  getShards(): Promise<Shard[]>;
  getShardForKey(key: string): Promise<Shard>;
  
  // Data routing
  routeQuery(query: Query): Promise<Shard[]>;
  routeWrite(entity: Entity): Promise<Shard>;
  
  // Rebalancing
  rebalanceShards(): Promise<RebalanceResult>;
  migrateData(fromShard: string, toShard: string, keyRange: KeyRange): Promise<void>;
  
  // Health and metrics
  getShardHealth(shardId: string): Promise<ShardHealth>;
  getShardMetrics(): Promise<ShardMetrics[]>;
}

interface ShardConfig {
  id: string;
  connectionString: string;
  keyRange?: KeyRange;
  weight?: number;
  region?: string;
  replicaOf?: string;
}

interface Shard {
  id: string;
  status: ShardStatus;
  keyRange: KeyRange;
  size: number;
  documentCount: number;
  connectionPool: ConnectionPoolStats;
}

interface KeyRange {
  start: string;
  end: string;
}

enum ShardStatus {
  ACTIVE = 'active',
  DRAINING = 'draining',
  MIGRATING = 'migrating',
  OFFLINE = 'offline'
}

enum ShardingStrategy {
  HASH = 'hash',
  RANGE = 'range',
  DIRECTORY = 'directory',
  GEOGRAPHIC = 'geographic',
  TENANT = 'tenant'
}
```

### Service Discovery

```typescript
interface ServiceDiscoveryService {
  // Service registration
  register(service: ServiceInstance): Promise<void>;
  deregister(instanceId: string): Promise<void>;
  heartbeat(instanceId: string): Promise<void>;
  
  // Service discovery
  discover(serviceName: string): Promise<ServiceInstance[]>;
  discoverHealthy(serviceName: string): Promise<ServiceInstance[]>;
  watch(serviceName: string, callback: ServiceChangeCallback): Unsubscribe;
  
  // Service metadata
  getServiceMetadata(serviceName: string): Promise<ServiceMetadata>;
  updateMetadata(instanceId: string, metadata: Record<string, string>): Promise<void>;
}

interface ServiceInstance {
  id: string;
  serviceName: string;
  host: string;
  port: number;
  protocol: 'http' | 'https' | 'grpc';
  healthCheckUrl?: string;
  metadata?: Record<string, string>;
  weight?: number;
  zone?: string;
}

interface ServiceMetadata {
  serviceName: string;
  instanceCount: number;
  healthyCount: number;
  versions: string[];
  zones: string[];
}

type ServiceChangeCallback = (instances: ServiceInstance[]) => void;
type Unsubscribe = () => void;
```

## Implementation Patterns

### Weighted Round Robin Load Balancer

```typescript
class WeightedRoundRobinBalancer implements LoadBalancerService {
  private backends: Map<string, Backend> = new Map();
  private currentWeights: Map<string, number> = new Map();
  private healthChecker: HealthChecker;

  async selectBackend(request: Request): Promise<Backend> {
    const healthyBackends = await this.getHealthyBackends();
    if (healthyBackends.length === 0) {
      throw new Error('No healthy backends available');
    }

    // Weighted round robin selection
    let totalWeight = 0;
    let maxWeight = 0;
    let selectedBackend: Backend | null = null;

    for (const backend of healthyBackends) {
      const currentWeight = (this.currentWeights.get(backend.id) || 0) + backend.weight;
      this.currentWeights.set(backend.id, currentWeight);
      totalWeight += backend.weight;

      if (currentWeight > maxWeight) {
        maxWeight = currentWeight;
        selectedBackend = backend;
      }
    }

    if (selectedBackend) {
      this.currentWeights.set(
        selectedBackend.id,
        (this.currentWeights.get(selectedBackend.id) || 0) - totalWeight
      );
    }

    return selectedBackend!;
  }

  async drainBackend(backendId: string, timeout: number): Promise<void> {
    const backend = this.backends.get(backendId);
    if (!backend) return;

    // Set weight to 0 to stop new connections
    backend.weight = 0;
    
    // Wait for existing connections to complete
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const connections = await this.getActiveConnections(backendId);
      if (connections === 0) break;
      await this.sleep(1000);
    }

    // Remove backend
    this.backends.delete(backendId);
  }
}
```

### Target Tracking Auto-Scaler

```typescript
class TargetTrackingAutoScaler {
  private metricsService: MetricsService;
  private scalingService: AutoScalingService;
  private evaluationInterval: number = 60000;

  async evaluateAndScale(policy: ScalingPolicy): Promise<void> {
    const currentMetric = await this.metricsService.getMetricValue(
      policy.metric.name,
      policy.metric.dimensions
    );

    const group = await this.scalingService.getScalingGroup(policy.groupId);
    const targetValue = policy.targetValue!;
    const deviation = (currentMetric - targetValue) / targetValue;

    // Calculate desired capacity
    let desiredCapacity = group.currentCapacity;

    if (deviation > 0.1) {
      // Scale out: metric is above target
      desiredCapacity = Math.ceil(
        group.currentCapacity * (currentMetric / targetValue)
      );
    } else if (deviation < -0.1) {
      // Scale in: metric is below target
      desiredCapacity = Math.floor(
        group.currentCapacity * (currentMetric / targetValue)
      );
    }

    // Apply bounds
    desiredCapacity = Math.max(policy.minCapacity, desiredCapacity);
    desiredCapacity = Math.min(policy.maxCapacity, desiredCapacity);

    // Check cooldown
    if (await this.isInCooldown(policy, desiredCapacity > group.currentCapacity)) {
      return;
    }

    // Execute scaling
    if (desiredCapacity !== group.currentCapacity) {
      await this.scalingService.setDesiredCapacity(policy.groupId, desiredCapacity);
    }
  }

  private async isInCooldown(policy: ScalingPolicy, isScaleOut: boolean): Promise<boolean> {
    const history = await this.scalingService.getScalingHistory(policy.groupId);
    const lastAction = history[0];
    
    if (!lastAction) return false;

    const cooldown = isScaleOut ? policy.scaleOutCooldown : policy.scaleInCooldown;
    const timeSinceLastAction = Date.now() - lastAction.timestamp.getTime();
    
    return timeSinceLastAction < cooldown * 1000;
  }
}
```

### Consistent Hash Sharding

```typescript
class ConsistentHashSharding implements ShardingService {
  private ring: ConsistentHashRing;
  private shards: Map<string, Shard> = new Map();
  private virtualNodes: number = 150;

  constructor() {
    this.ring = new ConsistentHashRing(this.virtualNodes);
  }

  async getShardForKey(key: string): Promise<Shard> {
    const shardId = this.ring.getNode(key);
    const shard = this.shards.get(shardId);
    
    if (!shard || shard.status !== ShardStatus.ACTIVE) {
      throw new Error(`Shard ${shardId} is not available`);
    }
    
    return shard;
  }

  async createShard(config: ShardConfig): Promise<string> {
    const shard: Shard = {
      id: config.id,
      status: ShardStatus.ACTIVE,
      keyRange: config.keyRange || { start: '', end: '' },
      size: 0,
      documentCount: 0,
      connectionPool: { active: 0, idle: 0, waiting: 0 }
    };

    this.shards.set(config.id, shard);
    this.ring.addNode(config.id, config.weight || 1);
    
    return config.id;
  }

  async rebalanceShards(): Promise<RebalanceResult> {
    const shardLoads = await this.calculateShardLoads();
    const avgLoad = shardLoads.reduce((a, b) => a + b.load, 0) / shardLoads.length;
    
    const migrations: Migration[] = [];
    
    for (const shard of shardLoads) {
      if (shard.load > avgLoad * 1.2) {
        // Shard is overloaded, migrate some data
        const targetShard = shardLoads.find(s => s.load < avgLoad * 0.8);
        if (targetShard) {
          migrations.push({
            fromShard: shard.id,
            toShard: targetShard.id,
            estimatedKeys: Math.floor((shard.load - avgLoad) * shard.documentCount / shard.load)
          });
        }
      }
    }

    // Execute migrations
    for (const migration of migrations) {
      await this.executeMigration(migration);
    }

    return { migrations, success: true };
  }
}
```

## Integration Points

### Kubernetes HPA Integration

```typescript
class KubernetesHPAIntegration {
  private k8sClient: KubernetesClient;

  async createHPA(config: HPAConfig): Promise<void> {
    const hpa = {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: {
        name: config.name,
        namespace: config.namespace
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: config.deploymentName
        },
        minReplicas: config.minReplicas,
        maxReplicas: config.maxReplicas,
        metrics: config.metrics.map(m => this.mapMetric(m)),
        behavior: {
          scaleDown: {
            stabilizationWindowSeconds: config.scaleDownStabilization || 300,
            policies: [
              { type: 'Percent', value: 10, periodSeconds: 60 }
            ]
          },
          scaleUp: {
            stabilizationWindowSeconds: config.scaleUpStabilization || 0,
            policies: [
              { type: 'Percent', value: 100, periodSeconds: 15 },
              { type: 'Pods', value: 4, periodSeconds: 15 }
            ],
            selectPolicy: 'Max'
          }
        }
      }
    };

    await this.k8sClient.createNamespacedHorizontalPodAutoscaler(
      config.namespace,
      hpa
    );
  }

  private mapMetric(metric: ScalingMetric): K8sMetric {
    if (metric.name === 'cpu') {
      return {
        type: 'Resource',
        resource: {
          name: 'cpu',
          target: { type: 'Utilization', averageUtilization: 70 }
        }
      };
    }
    
    return {
      type: 'External',
      external: {
        metric: { name: metric.name },
        target: { type: 'AverageValue', averageValue: metric.targetValue }
      }
    };
  }
}
```

### AWS Auto Scaling Integration

```typescript
class AWSAutoScalingIntegration {
  private autoScaling: AutoScalingClient;
  private cloudWatch: CloudWatchClient;

  async createTargetTrackingPolicy(config: AWSScalingConfig): Promise<string> {
    const response = await this.autoScaling.send(
      new PutScalingPolicyCommand({
        AutoScalingGroupName: config.groupName,
        PolicyName: config.policyName,
        PolicyType: 'TargetTrackingScaling',
        TargetTrackingConfiguration: {
          PredefinedMetricSpecification: {
            PredefinedMetricType: config.metricType
          },
          TargetValue: config.targetValue,
          ScaleInCooldown: config.scaleInCooldown,
          ScaleOutCooldown: config.scaleOutCooldown
        }
      })
    );

    return response.PolicyARN!;
  }

  async createPredictiveScaling(config: PredictiveScalingConfig): Promise<void> {
    await this.autoScaling.send(
      new PutScalingPolicyCommand({
        AutoScalingGroupName: config.groupName,
        PolicyName: config.policyName,
        PolicyType: 'PredictiveScaling',
        PredictiveScalingConfiguration: {
          MetricSpecifications: [{
            TargetValue: config.targetValue,
            PredefinedMetricPairSpecification: {
              PredefinedMetricType: 'ASGCPUUtilization'
            }
          }],
          Mode: 'ForecastAndScale',
          SchedulingBufferTime: 300
        }
      })
    );
  }
}
```

## Security Considerations

### Secure Scaling Operations

```typescript
class SecureScalingService {
  private scalingService: AutoScalingService;
  private auditLogger: AuditLogger;
  private rateLimiter: RateLimiter;

  async scaleOut(groupId: string, count: number, userId: string): Promise<ScalingAction> {
    // Rate limiting to prevent abuse
    if (!await this.rateLimiter.allowRequest(`scaling:${groupId}`, 10, 60)) {
      throw new Error('Scaling rate limit exceeded');
    }

    // Validate scaling bounds
    const group = await this.scalingService.getScalingGroup(groupId);
    if (group.currentCapacity + count > group.maxSize) {
      throw new Error('Scaling would exceed maximum capacity');
    }

    // Audit log
    await this.auditLogger.log({
      action: 'SCALE_OUT',
      resource: groupId,
      userId,
      details: { count, currentCapacity: group.currentCapacity }
    });

    return this.scalingService.scaleOut(groupId, count);
  }
}
```

## Testing Considerations

### Scalability Tests

```typescript
describe('Load Balancer Tests', () => {
  it('should distribute load according to weights', async () => {
    const balancer = new WeightedRoundRobinBalancer();
    
    await balancer.registerBackend({ id: 'a', weight: 2, address: 'a', port: 80 });
    await balancer.registerBackend({ id: 'b', weight: 1, address: 'b', port: 80 });

    const selections: Record<string, number> = { a: 0, b: 0 };
    
    for (let i = 0; i < 300; i++) {
      const backend = await balancer.selectBackend({} as Request);
      selections[backend.id]++;
    }

    // Backend 'a' should get roughly 2x the traffic of 'b'
    expect(selections.a / selections.b).toBeCloseTo(2, 0.5);
  });

  it('should handle backend failures gracefully', async () => {
    const balancer = new WeightedRoundRobinBalancer();
    
    await balancer.registerBackend({ id: 'a', weight: 1, address: 'a', port: 80 });
    await balancer.registerBackend({ id: 'b', weight: 1, address: 'b', port: 80 });

    // Mark backend 'a' as unhealthy
    await balancer.markUnhealthy('a');

    // All requests should go to 'b'
    for (let i = 0; i < 10; i++) {
      const backend = await balancer.selectBackend({} as Request);
      expect(backend.id).toBe('b');
    }
  });
});
```

## Configuration Examples

### Auto-Scaling Configuration

```typescript
const autoScalingConfig: AutoScalingConfig = {
  groupName: 'web-servers',
  minCapacity: 2,
  maxCapacity: 20,
  desiredCapacity: 4,
  policies: [
    {
      name: 'cpu-target-tracking',
      type: ScalingPolicyType.TARGET_TRACKING,
      metric: { name: 'CPUUtilization', statistic: 'Average' },
      targetValue: 70,
      scaleOutCooldown: 300,
      scaleInCooldown: 300
    },
    {
      name: 'request-count-scaling',
      type: ScalingPolicyType.TARGET_TRACKING,
      metric: { name: 'RequestCountPerTarget', statistic: 'Sum' },
      targetValue: 1000,
      scaleOutCooldown: 60,
      scaleInCooldown: 300
    }
  ],
  healthCheck: {
    type: 'ELB',
    gracePeriod: 300
  }
};
```
