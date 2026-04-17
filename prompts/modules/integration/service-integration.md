# Service Integration Template

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

Provides comprehensive patterns for implementing service discovery, load balancing, circuit breakers, and health checks. This template covers microservices integration, service mesh patterns, and resilient service-to-service communication.

## Context

Modern distributed systems require robust service integration patterns to ensure reliability, scalability, and fault tolerance. This template addresses service discovery, load balancing strategies, circuit breaker patterns, and health monitoring while enabling resilient communication between services.

## Core Components

### Service Registry

## Examples

```typescript
interface ServiceRegistry {
  // Service registration
  registerService(service: ServiceDefinition): Promise<ServiceInstance>;
  deregisterService(instanceId: string): Promise<void>;
  updateService(instanceId: string, updates: Partial<ServiceDefinition>): Promise<ServiceInstance>;
  
  // Service discovery
  discoverService(serviceName: string): Promise<ServiceInstance[]>;
  discoverServiceByTags(tags: string[]): Promise<ServiceInstance[]>;
  getServiceInstance(instanceId: string): Promise<ServiceInstance>;
  
  // Health management
  updateHealth(instanceId: string, health: HealthStatus): Promise<void>;
  getHealthyInstances(serviceName: string): Promise<ServiceInstance[]>;
}

interface ServiceDefinition {
  name: string;
  version: string;
  host: string;
  port: number;
  protocol: ServiceProtocol;
  tags: string[];
  metadata: Record<string, any>;
  healthCheck: HealthCheckConfig;
}


interface ServiceInstance {
  id: string;
  serviceName: string;
  version: string;
  host: string;
  port: number;
  protocol: ServiceProtocol;
  status: ServiceStatus;
  health: HealthStatus;
  tags: string[];
  metadata: Record<string, any>;
  registeredAt: Date;
  lastHeartbeat: Date;
}

enum ServiceProtocol {
  HTTP = 'http',
  HTTPS = 'https',
  GRPC = 'grpc',
  TCP = 'tcp',
  UDP = 'udp'
}

enum ServiceStatus {
  STARTING = 'starting',
  RUNNING = 'running',
  DRAINING = 'draining',
  STOPPED = 'stopped'
}

interface HealthCheckConfig {
  type: HealthCheckType;
  endpoint?: string;
  interval: number;
  timeout: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
}

enum HealthCheckType {
  HTTP = 'http',
  TCP = 'tcp',
  GRPC = 'grpc',
  SCRIPT = 'script'
}
```

### Load Balancer

```typescript
interface LoadBalancer {
  // Load balancing
  selectInstance(serviceName: string, strategy?: LoadBalancingStrategy): Promise<ServiceInstance>;
  selectInstances(serviceName: string, count: number): Promise<ServiceInstance[]>;
  
  // Strategy management
  setStrategy(serviceName: string, strategy: LoadBalancingStrategy): void;
  getStrategy(serviceName: string): LoadBalancingStrategy;
  
  // Instance weighting
  setWeight(instanceId: string, weight: number): void;
  getWeight(instanceId: string): number;
  
  // Metrics
  recordRequest(instanceId: string, duration: number, success: boolean): void;
  getInstanceMetrics(instanceId: string): InstanceMetrics;
}

enum LoadBalancingStrategy {
  ROUND_ROBIN = 'round_robin',
  WEIGHTED_ROUND_ROBIN = 'weighted_round_robin',
  LEAST_CONNECTIONS = 'least_connections',
  WEIGHTED_LEAST_CONNECTIONS = 'weighted_least_connections',
  RANDOM = 'random',
  IP_HASH = 'ip_hash',
  LEAST_RESPONSE_TIME = 'least_response_time',
  ADAPTIVE = 'adaptive'
}

interface InstanceMetrics {
  instanceId: string;
  totalRequests: number;
  activeConnections: number;
  averageResponseTime: number;
  errorRate: number;
  lastRequestAt: Date;
}
```

### Circuit Breaker

```typescript
interface CircuitBreaker {
  // Circuit state management
  execute<T>(operation: () => Promise<T>): Promise<T>;
  getState(): CircuitState;
  reset(): void;
  
  // Configuration
  configure(config: CircuitBreakerConfig): void;
  getConfig(): CircuitBreakerConfig;
  
  // Metrics
  getMetrics(): CircuitBreakerMetrics;
  onStateChange(callback: (state: CircuitState) => void): void;
}

enum CircuitState {
  CLOSED = 'closed',
  OPEN = 'open',
  HALF_OPEN = 'half_open'
}

interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  resetTimeout: number;
  halfOpenRequests: number;
  monitoredExceptions?: string[];
  ignoredExceptions?: string[];
}

interface CircuitBreakerMetrics {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailure?: Date;
  lastSuccess?: Date;
  totalRequests: number;
  rejectedRequests: number;
}
```

### Health Check Manager

```typescript
interface HealthCheckManager {
  // Health check execution
  checkHealth(instanceId: string): Promise<HealthCheckResult>;
  checkAllInstances(serviceName: string): Promise<HealthCheckResult[]>;
  
  // Health check scheduling
  startHealthChecks(instanceId: string): void;
  stopHealthChecks(instanceId: string): void;
  
  // Health status
  getHealthStatus(instanceId: string): HealthStatus;
  getServiceHealth(serviceName: string): ServiceHealthSummary;
  
  // Alerting
  onHealthChange(callback: (instanceId: string, health: HealthStatus) => void): void;
}

interface HealthCheckResult {
  instanceId: string;
  status: HealthStatus;
  latency: number;
  timestamp: Date;
  details?: Record<string, any>;
  error?: string;
}

enum HealthStatus {
  HEALTHY = 'healthy',
  UNHEALTHY = 'unhealthy',
  DEGRADED = 'degraded',
  UNKNOWN = 'unknown'
}

interface ServiceHealthSummary {
  serviceName: string;
  totalInstances: number;
  healthyInstances: number;
  unhealthyInstances: number;
  degradedInstances: number;
  overallHealth: HealthStatus;
}
```

## Implementation Patterns

### Service Registry Implementation

```typescript
class ConsulServiceRegistry implements ServiceRegistry {
  private consul: ConsulClient;
  private healthChecker: HealthCheckManager;
  
  async registerService(service: ServiceDefinition): Promise<ServiceInstance> {
    const instanceId = `${service.name}-${generateId()}`;
    
    const instance: ServiceInstance = {
      id: instanceId,
      serviceName: service.name,
      version: service.version,
      host: service.host,
      port: service.port,
      protocol: service.protocol,
      status: ServiceStatus.STARTING,
      health: HealthStatus.UNKNOWN,
      tags: service.tags,
      metadata: service.metadata,
      registeredAt: new Date(),
      lastHeartbeat: new Date()
    };
    
    // Register with Consul
    await this.consul.agent.service.register({
      id: instanceId,
      name: service.name,
      address: service.host,
      port: service.port,
      tags: service.tags,
      meta: { ...service.metadata, version: service.version },
      check: this.buildHealthCheck(service.healthCheck, instanceId)
    });
    
    // Start health checks
    this.healthChecker.startHealthChecks(instanceId);
    
    // Update status to running
    instance.status = ServiceStatus.RUNNING;
    
    return instance;
  }
  
  async discoverService(serviceName: string): Promise<ServiceInstance[]> {
    const services = await this.consul.health.service({
      service: serviceName,
      passing: true
    });
    
    return services.map(s => this.mapToServiceInstance(s));
  }
  
  async getHealthyInstances(serviceName: string): Promise<ServiceInstance[]> {
    const instances = await this.discoverService(serviceName);
    return instances.filter(i => i.health === HealthStatus.HEALTHY);
  }
  
  private buildHealthCheck(config: HealthCheckConfig, instanceId: string): ConsulHealthCheck {
    switch (config.type) {
      case HealthCheckType.HTTP:
        return {
          http: config.endpoint,
          interval: `${config.interval}s`,
          timeout: `${config.timeout}s`,
          deregistercriticalserviceafter: '5m'
        };
      case HealthCheckType.TCP:
        return {
          tcp: config.endpoint,
          interval: `${config.interval}s`,
          timeout: `${config.timeout}s`
        };
      case HealthCheckType.GRPC:
        return {
          grpc: config.endpoint,
          interval: `${config.interval}s`,
          timeout: `${config.timeout}s`
        };
      default:
        throw new Error(`Unsupported health check type: ${config.type}`);
    }
  }
}
```

### Load Balancer Implementation

```typescript
class AdaptiveLoadBalancer implements LoadBalancer {
  private registry: ServiceRegistry;
  private strategies: Map<string, LoadBalancingStrategy> = new Map();
  private metrics: Map<string, InstanceMetrics> = new Map();
  private roundRobinCounters: Map<string, number> = new Map();
  
  async selectInstance(serviceName: string, strategy?: LoadBalancingStrategy): Promise<ServiceInstance> {
    const instances = await this.registry.getHealthyInstances(serviceName);
    
    if (instances.length === 0) {
      throw new NoHealthyInstancesError(`No healthy instances for service: ${serviceName}`);
    }
    
    const effectiveStrategy = strategy || this.strategies.get(serviceName) || LoadBalancingStrategy.ROUND_ROBIN;
    
    switch (effectiveStrategy) {
      case LoadBalancingStrategy.ROUND_ROBIN:
        return this.roundRobin(serviceName, instances);
        
      case LoadBalancingStrategy.WEIGHTED_ROUND_ROBIN:
        return this.weightedRoundRobin(serviceName, instances);
        
      case LoadBalancingStrategy.LEAST_CONNECTIONS:
        return this.leastConnections(instances);
        
      case LoadBalancingStrategy.LEAST_RESPONSE_TIME:
        return this.leastResponseTime(instances);
        
      case LoadBalancingStrategy.RANDOM:
        return instances[Math.floor(Math.random() * instances.length)];
        
      case LoadBalancingStrategy.ADAPTIVE:
        return this.adaptive(instances);
        
      default:
        return this.roundRobin(serviceName, instances);
    }
  }
  
  private roundRobin(serviceName: string, instances: ServiceInstance[]): ServiceInstance {
    const counter = this.roundRobinCounters.get(serviceName) || 0;
    const instance = instances[counter % instances.length];
    this.roundRobinCounters.set(serviceName, counter + 1);
    return instance;
  }
  
  private leastConnections(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) => {
      const metrics = this.metrics.get(instance.id);
      const minMetrics = this.metrics.get(min.id);
      
      const connections = metrics?.activeConnections || 0;
      const minConnections = minMetrics?.activeConnections || 0;
      
      return connections < minConnections ? instance : min;
    });
  }
  
  private leastResponseTime(instances: ServiceInstance[]): ServiceInstance {
    return instances.reduce((min, instance) => {
      const metrics = this.metrics.get(instance.id);
      const minMetrics = this.metrics.get(min.id);
      
      const responseTime = metrics?.averageResponseTime || Infinity;
      const minResponseTime = minMetrics?.averageResponseTime || Infinity;
      
      return responseTime < minResponseTime ? instance : min;
    });
  }
  
  private adaptive(instances: ServiceInstance[]): ServiceInstance {
    // Score each instance based on multiple factors
    const scored = instances.map(instance => {
      const metrics = this.metrics.get(instance.id);
      
      let score = 100;
      
      // Penalize high response time
      if (metrics?.averageResponseTime) {
        score -= Math.min(metrics.averageResponseTime / 10, 30);
      }
      
      // Penalize high error rate
      if (metrics?.errorRate) {
        score -= metrics.errorRate * 50;
      }
      
      // Penalize high connection count
      if (metrics?.activeConnections) {
        score -= Math.min(metrics.activeConnections, 20);
      }
      
      return { instance, score };
    });
    
    // Select instance with highest score
    scored.sort((a, b) => b.score - a.score);
    return scored[0].instance;
  }
  
  recordRequest(instanceId: string, duration: number, success: boolean): void {
    const metrics = this.metrics.get(instanceId) || this.initializeMetrics(instanceId);
    
    metrics.totalRequests++;
    metrics.lastRequestAt = new Date();
    
    // Update average response time (exponential moving average)
    const alpha = 0.1;
    metrics.averageResponseTime = alpha * duration + (1 - alpha) * metrics.averageResponseTime;
    
    // Update error rate
    if (!success) {
      const errorWeight = 1 / Math.min(metrics.totalRequests, 100);
      metrics.errorRate = metrics.errorRate * (1 - errorWeight) + errorWeight;
    } else {
      const successWeight = 1 / Math.min(metrics.totalRequests, 100);
      metrics.errorRate = metrics.errorRate * (1 - successWeight);
    }
    
    this.metrics.set(instanceId, metrics);
  }
}
```

### Circuit Breaker Implementation

```typescript
class ResilienceCircuitBreaker implements CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private lastFailure?: Date;
  private lastStateChange: Date = new Date();
  private config: CircuitBreakerConfig;
  private stateChangeCallbacks: ((state: CircuitState) => void)[] = [];
  
  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionTo(CircuitState.HALF_OPEN);
      } else {
        throw new CircuitOpenError('Circuit breaker is open');
      }
    }
    
    try {
      const result = await this.executeWithTimeout(operation);
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    }
  }
  
  private async executeWithTimeout<T>(operation: () => Promise<T>): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new TimeoutError('Operation timed out')), this.config.timeout)
      )
    ]);
  }
  
  private recordSuccess(): void {
    this.successCount++;
    
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successCount >= this.config.successThreshold) {
        this.transitionTo(CircuitState.CLOSED);
        this.resetCounters();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Reset failure count on success
      this.failureCount = Math.max(0, this.failureCount - 1);
    }
  }
  
  private recordFailure(error: Error): void {
    // Check if this exception should be monitored
    if (this.config.ignoredExceptions?.includes(error.constructor.name)) {
      return;
    }
    
    this.failureCount++;
    this.lastFailure = new Date();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.transitionTo(CircuitState.OPEN);
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failureCount >= this.config.failureThreshold) {
        this.transitionTo(CircuitState.OPEN);
      }
    }
  }
  
  private shouldAttemptReset(): boolean {
    const timeSinceLastChange = Date.now() - this.lastStateChange.getTime();
    return timeSinceLastChange >= this.config.resetTimeout;
  }
  
  private transitionTo(newState: CircuitState): void {
    const oldState = this.state;
    this.state = newState;
    this.lastStateChange = new Date();
    
    if (newState === CircuitState.HALF_OPEN) {
      this.successCount = 0;
    }
    
    // Notify listeners
    this.stateChangeCallbacks.forEach(cb => cb(newState));
    
    console.log(`Circuit breaker transitioned from ${oldState} to ${newState}`);
  }
  
  getMetrics(): CircuitBreakerMetrics {
    return {
      state: this.state,
      failureCount: this.failureCount,
      successCount: this.successCount,
      lastFailure: this.lastFailure,
      lastSuccess: this.successCount > 0 ? new Date() : undefined,
      totalRequests: this.failureCount + this.successCount,
      rejectedRequests: this.state === CircuitState.OPEN ? this.failureCount : 0
    };
  }
}
```

### Health Check Implementation

```typescript
class ServiceHealthChecker implements HealthCheckManager {
  private registry: ServiceRegistry;
  private healthChecks: Map<string, NodeJS.Timeout> = new Map();
  private healthStatus: Map<string, HealthStatus> = new Map();
  private healthChangeCallbacks: ((instanceId: string, health: HealthStatus) => void)[] = [];
  
  async checkHealth(instanceId: string): Promise<HealthCheckResult> {
    const instance = await this.registry.getServiceInstance(instanceId);
    const config = instance.metadata.healthCheck as HealthCheckConfig;
    
    const startTime = Date.now();
    
    try {
      let healthy: boolean;
      let details: Record<string, any> = {};
      
      switch (config.type) {
        case HealthCheckType.HTTP:
          const response = await this.httpHealthCheck(instance, config);
          healthy = response.status >= 200 && response.status < 300;
          details = { statusCode: response.status, body: response.body };
          break;
          
        case HealthCheckType.TCP:
          healthy = await this.tcpHealthCheck(instance, config);
          break;
          
        case HealthCheckType.GRPC:
          const grpcResult = await this.grpcHealthCheck(instance, config);
          healthy = grpcResult.status === 'SERVING';
          details = { grpcStatus: grpcResult.status };
          break;
          
        default:
          throw new Error(`Unsupported health check type: ${config.type}`);
      }
      
      const latency = Date.now() - startTime;
      const status = healthy ? HealthStatus.HEALTHY : HealthStatus.UNHEALTHY;
      
      await this.updateHealthStatus(instanceId, status);
      
      return {
        instanceId,
        status,
        latency,
        timestamp: new Date(),
        details
      };
      
    } catch (error) {
      const latency = Date.now() - startTime;
      
      await this.updateHealthStatus(instanceId, HealthStatus.UNHEALTHY);
      
      return {
        instanceId,
        status: HealthStatus.UNHEALTHY,
        latency,
        timestamp: new Date(),
        error: error.message
      };
    }
  }
  
  private async httpHealthCheck(instance: ServiceInstance, config: HealthCheckConfig): Promise<HttpResponse> {
    const url = `${instance.protocol}://${instance.host}:${instance.port}${config.endpoint}`;
    
    return fetch(url, {
      method: 'GET',
      timeout: config.timeout * 1000
    });
  }
  
  private async tcpHealthCheck(instance: ServiceInstance, config: HealthCheckConfig): Promise<boolean> {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      
      socket.setTimeout(config.timeout * 1000);
      
      socket.connect(instance.port, instance.host, () => {
        socket.destroy();
        resolve(true);
      });
      
      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });
      
      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });
    });
  }
  
  startHealthChecks(instanceId: string): void {
    if (this.healthChecks.has(instanceId)) {
      return;
    }
    
    const instance = this.registry.getServiceInstance(instanceId);
    const config = instance.metadata.healthCheck as HealthCheckConfig;
    
    const interval = setInterval(async () => {
      await this.checkHealth(instanceId);
    }, config.interval * 1000);
    
    this.healthChecks.set(instanceId, interval);
    
    // Run initial health check
    this.checkHealth(instanceId);
  }
  
  private async updateHealthStatus(instanceId: string, newStatus: HealthStatus): Promise<void> {
    const oldStatus = this.healthStatus.get(instanceId);
    
    if (oldStatus !== newStatus) {
      this.healthStatus.set(instanceId, newStatus);
      await this.registry.updateHealth(instanceId, newStatus);
      
      // Notify listeners
      this.healthChangeCallbacks.forEach(cb => cb(instanceId, newStatus));
    }
  }
  
  getServiceHealth(serviceName: string): ServiceHealthSummary {
    const instances = this.registry.discoverService(serviceName);
    
    let healthy = 0;
    let unhealthy = 0;
    let degraded = 0;
    
    for (const instance of instances) {
      const status = this.healthStatus.get(instance.id) || HealthStatus.UNKNOWN;
      
      switch (status) {
        case HealthStatus.HEALTHY:
          healthy++;
          break;
        case HealthStatus.UNHEALTHY:
          unhealthy++;
          break;
        case HealthStatus.DEGRADED:
          degraded++;
          break;
      }
    }
    
    const total = instances.length;
    let overallHealth: HealthStatus;
    
    if (healthy === total) {
      overallHealth = HealthStatus.HEALTHY;
    } else if (unhealthy === total) {
      overallHealth = HealthStatus.UNHEALTHY;
    } else {
      overallHealth = HealthStatus.DEGRADED;
    }
    
    return {
      serviceName,
      totalInstances: total,
      healthyInstances: healthy,
      unhealthyInstances: unhealthy,
      degradedInstances: degraded,
      overallHealth
    };
  }
}
```

## Integration Points

### Service Mesh Integration

```typescript
interface ServiceMeshIntegration {
  // Istio integration
  configureIstioSidecar(service: ServiceDefinition): Promise<IstioConfig>;
  createVirtualService(config: VirtualServiceConfig): Promise<VirtualService>;
  createDestinationRule(config: DestinationRuleConfig): Promise<DestinationRule>;
  
  // Linkerd integration
  configureLinkerdProxy(service: ServiceDefinition): Promise<LinkerdConfig>;
  
  // Traffic management
  configureTrafficSplit(serviceName: string, splits: TrafficSplit[]): Promise<void>;
  configureRetries(serviceName: string, retryConfig: RetryConfig): Promise<void>;
  configureTimeout(serviceName: string, timeout: number): Promise<void>;
}

class IstioServiceMesh implements ServiceMeshIntegration {
  async createVirtualService(config: VirtualServiceConfig): Promise<VirtualService> {
    const virtualService = {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'VirtualService',
      metadata: {
        name: config.name,
        namespace: config.namespace
      },
      spec: {
        hosts: config.hosts,
        http: config.routes.map(route => ({
          match: route.match,
          route: route.destinations.map(dest => ({
            destination: {
              host: dest.host,
              port: { number: dest.port },
              subset: dest.subset
            },
            weight: dest.weight
          })),
          retries: route.retries,
          timeout: route.timeout
        }))
      }
    };
    
    return this.kubeClient.apply(virtualService);
  }
}
```

## Security Considerations

### Service Authentication

```typescript
const serviceSecurityConfig = {
  // mTLS configuration
  mtls: {
    enabled: true,
    mode: 'STRICT',
    certificateRotation: '24h'
  },
  
  // Service-to-service authentication
  authentication: {
    type: 'jwt',
    issuer: 'service-mesh',
    audience: 'internal-services'
  },
  
  // Authorization policies
  authorization: {
    defaultPolicy: 'DENY',
    rules: [
      {
        from: ['service-a'],
        to: ['service-b'],
        methods: ['GET', 'POST']
      }
    ]
  }
};
```

## Compliance Requirements

### Service Audit Trail

- **Registration Events**: Log all service registration and deregistration
- **Health Changes**: Track health status changes with timestamps
- **Traffic Patterns**: Monitor and log service-to-service communication
- **Configuration Changes**: Audit all configuration modifications

## Testing Considerations

### Service Integration Testing

```typescript
describe('ServiceRegistry', () => {
  it('should register and discover services', async () => {
    const registry = new ConsulServiceRegistry();
    
    const service = await registry.registerService({
      name: 'test-service',
      version: '1.0.0',
      host: 'localhost',
      port: 8080,
      protocol: ServiceProtocol.HTTP,
      tags: ['api'],
      metadata: {},
      healthCheck: { type: HealthCheckType.HTTP, endpoint: '/health', interval: 10, timeout: 5 }
    });
    
    const discovered = await registry.discoverService('test-service');
    expect(discovered).toContainEqual(expect.objectContaining({ id: service.id }));
  });
});

describe('CircuitBreaker', () => {
  it('should open circuit after failure threshold', async () => {
    const breaker = new ResilienceCircuitBreaker({
      failureThreshold: 3,
      successThreshold: 2,
      timeout: 5000,
      resetTimeout: 10000
    });
    
    const failingOperation = () => Promise.reject(new Error('Failed'));
    
    // Trigger failures
    for (let i = 0; i < 3; i++) {
      await breaker.execute(failingOperation).catch(() => {});
    }
    
    expect(breaker.getState()).toBe(CircuitState.OPEN);
  });
});

describe('LoadBalancer', () => {
  it('should distribute load using round robin', async () => {
    const balancer = new AdaptiveLoadBalancer();
    const instances = ['instance-1', 'instance-2', 'instance-3'];
    
    const selections = [];
    for (let i = 0; i < 6; i++) {
      const selected = await balancer.selectInstance('test-service');
      selections.push(selected.id);
    }
    
    // Each instance should be selected twice
    expect(selections.filter(s => s === 'instance-1')).toHaveLength(2);
    expect(selections.filter(s => s === 'instance-2')).toHaveLength(2);
    expect(selections.filter(s => s === 'instance-3')).toHaveLength(2);
  });
});
```

This template provides comprehensive patterns for implementing service integration with discovery, load balancing, circuit breakers, and health monitoring capabilities.
