# Chaos Engineering Testing Template

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

This template provides comprehensive patterns for implementing chaos engineering practices to test system resilience, fault tolerance, and recovery mechanisms. It covers intelligent failure injection, network partitioning, resource exhaustion, and automated chaos experiments with AI-driven analysis to validate system behavior under adverse conditions.

## Context

Chaos engineering helps identify weaknesses in distributed systems by intentionally introducing failures in controlled environments. This template addresses the complexity of implementing systematic chaos testing including infrastructure failures, application-level faults, intelligent analysis of system behavior, and comprehensive monitoring of system behavior during chaos experiments.

## Examples

### Example 1: Infrastructure Chaos Testing
```typescript
// Chaos engineering framework for infrastructure testing
interface ChaosExperiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  scope: ChaosScope;
  actions: ChaosAction[];
  steadyStateHypothesis: SteadyStateCheck[];
  rollbackStrategy: RollbackAction[];
}

interface ChaosScope {
  targetServices: string[];
  environment: 'staging' | 'production' | 'test';
  duration: number;
  percentage: number; // Percentage of instances to affect
}

class ChaosEngineeringFramework {
  private experiments: Map<string, ChaosExperiment> = new Map();
  private monitoring: MonitoringService;
  private rollbackManager: RollbackManager;

  constructor(monitoring: MonitoringService) {
    this.monitoring = monitoring;
    this.rollbackManager = new RollbackManager();
  }

  // Define chaos experiment
  defineExperiment(experiment: ChaosExperiment): void {
    this.validateExperiment(experiment);
    this.experiments.set(experiment.id, experiment);
  }

  // Execute chaos experiment with safety checks
  async executeExperiment(experimentId: string): Promise<ChaosResult> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    // Pre-flight checks
    const preFlightResult = await this.performPreFlightChecks(experiment);
    if (!preFlightResult.passed) {
      throw new Error(`Pre-flight checks failed: ${preFlightResult.reason}`);
    }

    // Establish steady state baseline
    const baselineMetrics = await this.establishBaseline(experiment);
    
    try {
      // Execute chaos actions
      const chaosResults = await this.executeChaosActions(experiment);
      
      // Monitor system behavior
      const behaviorMetrics = await this.monitorSystemBehavior(experiment);
      
      // Validate hypothesis
      const hypothesisResult = await this.validateHypothesis(
        experiment, 
        baselineMetrics, 
        behaviorMetrics
      );

      return {
        experimentId,
        success: hypothesisResult.validated,
        baseline: baselineMetrics,
        chaosMetrics: behaviorMetrics,
        hypothesis: hypothesisResult,
        duration: experiment.scope.duration,
        affectedInstances: chaosResults.affectedInstances
      };

    } catch (error) {
      // Emergency rollback
      await this.rollbackManager.emergencyRollback(experiment);
      throw error;
    } finally {
      // Always perform cleanup
      await this.performCleanup(experiment);
    }
  }

  private async executeChaosActions(experiment: ChaosExperiment): Promise<ChaosActionResult> {
    const results: ActionResult[] = [];
    
    for (const action of experiment.actions) {
      const result = await this.executeAction(action, experiment.scope);
      results.push(result);
      
      // Wait between actions if specified
      if (action.delay) {
        await this.delay(action.delay);
      }
    }

    return {
      actions: results,
      affectedInstances: results.reduce((acc, r) => acc + r.affectedCount, 0)
    };
  }
}

// Specific chaos actions
class NetworkChaosActions {
  // Simulate network partition
  static createNetworkPartition(duration: number, targetServices: string[]): ChaosAction {
    return {
      type: 'network-partition',
      duration,
      parameters: {
        targetServices,
        partitionType: 'complete', // 'complete' | 'partial'
        affectedPercentage: 50
      },
      rollback: {
        type: 'restore-network',
        automatic: true
      }
    };
  }

  // Simulate network latency
  static createNetworkLatency(latencyMs: number, jitter: number): ChaosAction {
    return {
      type: 'network-latency',
      duration: 300000, // 5 minutes
      parameters: {
        latency: latencyMs,
        jitter,
        targetPorts: [80, 443, 8080]
      },
      rollback: {
        type: 'restore-network-performance',
        automatic: true
      }
    };
  }

  // Simulate packet loss
  static createPacketLoss(lossPercentage: number): ChaosAction {
    return {
      type: 'packet-loss',
      duration: 180000, // 3 minutes
      parameters: {
        lossPercentage,
        targetInterfaces: ['eth0']
      },
      rollback: {
        type: 'restore-network-reliability',
        automatic: true
      }
    };
  }
}
```

### Example 2: Application-Level Chaos Testing
```typescript
// Application-level chaos testing for microservices
class ApplicationChaosFramework {
  private serviceRegistry: ServiceRegistry;
  private circuitBreakerManager: CircuitBreakerManager;

  constructor(serviceRegistry: ServiceRegistry) {
    this.serviceRegistry = serviceRegistry;
    this.circuitBreakerManager = new CircuitBreakerManager();
  }

  // Simulate service failures
  async simulateServiceFailure(serviceName: string, failureType: FailureType): Promise<void> {
    const service = await this.serviceRegistry.getService(serviceName);
    
    switch (failureType) {
      case 'complete-failure':
        await this.shutdownService(service);
        break;
      case 'slow-response':
        await this.injectLatency(service, 5000); // 5 second delay
        break;
      case 'error-responses':
        await this.injectErrorResponses(service, 0.3); // 30% error rate
        break;
      case 'memory-leak':
        await this.simulateMemoryLeak(service);
        break;
      case 'cpu-spike':
        await this.simulateCpuSpike(service, 0.9); // 90% CPU usage
        break;
    }
  }

  // Database chaos testing
  async simulateDatabaseChaos(dbConfig: DatabaseConfig): Promise<void> {
    const chaosActions = [
      () => this.simulateConnectionPoolExhaustion(dbConfig),
      () => this.simulateSlowQueries(dbConfig, 10000), // 10 second queries
      () => this.simulateDeadlocks(dbConfig),
      () => this.simulateDiskSpaceExhaustion(dbConfig),
      () => this.simulateReplicationLag(dbConfig, 30000) // 30 second lag
    ];

    // Execute random chaos action
    const randomAction = chaosActions[Math.floor(Math.random() * chaosActions.length)];
    await randomAction();
  }

  // Circuit breaker chaos testing
  async testCircuitBreakerBehavior(serviceName: string): Promise<CircuitBreakerTestResult> {
    const circuitBreaker = this.circuitBreakerManager.getCircuitBreaker(serviceName);
    
    // Test failure threshold
    const failureTest = await this.testFailureThreshold(circuitBreaker);
    
    // Test recovery behavior
    const recoveryTest = await this.testRecoveryBehavior(circuitBreaker);
    
    // Test half-open state
    const halfOpenTest = await this.testHalfOpenState(circuitBreaker);

    return {
      serviceName,
      failureThresholdTest: failureTest,
      recoveryTest: recoveryTest,
      halfOpenTest: halfOpenTest,
      overallHealth: this.calculateOverallHealth([failureTest, recoveryTest, halfOpenTest])
    };
  }

  private async injectErrorResponses(service: Service, errorRate: number): Promise<void> {
    // Implement error injection middleware
    const errorInjector = new ErrorInjectionMiddleware({
      errorRate,
      errorTypes: [
        { status: 500, probability: 0.4 },
        { status: 503, probability: 0.3 },
        { status: 429, probability: 0.2 },
        { status: 404, probability: 0.1 }
      ]
    });

    await service.addMiddleware(errorInjector);
  }
}

// Chaos experiment definitions
const networkPartitionExperiment: ChaosExperiment = {
  id: 'network-partition-user-service',
  name: 'User Service Network Partition',
  description: 'Test system behavior when user service is network partitioned',
  hypothesis: 'System should gracefully degrade and maintain core functionality when user service is unreachable',
  scope: {
    targetServices: ['user-service'],
    environment: 'staging',
    duration: 300000, // 5 minutes
    percentage: 50 // Affect 50% of instances
  },
  actions: [
    NetworkChaosActions.createNetworkPartition(300000, ['user-service'])
  ],
  steadyStateHypothesis: [
    {
      name: 'response-time',
      metric: 'avg_response_time',
      threshold: 2000, // 2 seconds
      operator: 'less_than'
    },
    {
      name: 'error-rate',
      metric: 'error_rate',
      threshold: 0.05, // 5%
      operator: 'less_than'
    },
    {
      name: 'availability',
      metric: 'availability',
      threshold: 0.99, // 99%
      operator: 'greater_than'
    }
  ],
  rollbackStrategy: [
    {
      type: 'restore-network',
      automatic: true,
      timeout: 30000
    }
  ]
};
```

### Example 3: Kubernetes Chaos Engineering
```yaml
# Chaos engineering with Chaos Mesh for Kubernetes
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: pod-failure-experiment
  namespace: chaos-testing
spec:
  action: pod-failure
  mode: fixed-percent
  value: "30"
  duration: "5m"
  selector:
    namespaces:
      - production
    labelSelectors:
      app: web-service
  scheduler:
    cron: "@every 2h"

---
apiVersion: chaos-mesh.org/v1alpha1
kind: NetworkChaos
metadata:
  name: network-delay-experiment
  namespace: chaos-testing
spec:
  action: delay
  mode: all
  selector:
    namespaces:
      - production
    labelSelectors:
      app: api-service
  delay:
    latency: "100ms"
    correlation: "100"
    jitter: "0ms"
  duration: "10m"
  scheduler:
    cron: "0 */4 * * *"

---
apiVersion: chaos-mesh.org/v1alpha1
kind: StressChaos
metadata:
  name: memory-stress-experiment
  namespace: chaos-testing
spec:
  mode: one
  selector:
    namespaces:
      - production
    labelSelectors:
      app: data-processor
  stressors:
    memory:
      workers: 4
      size: "1GB"
  duration: "3m"

---
# Chaos experiment workflow
apiVersion: argoproj.io/v1alpha1
kind: Workflow
metadata:
  name: comprehensive-chaos-test
  namespace: chaos-testing
spec:
  entrypoint: chaos-experiment-suite
  templates:
  - name: chaos-experiment-suite
    steps:
    - - name: baseline-metrics
        template: collect-baseline
    - - name: pod-chaos
        template: execute-pod-chaos
      - name: network-chaos
        template: execute-network-chaos
      - name: stress-chaos
        template: execute-stress-chaos
    - - name: validate-hypothesis
        template: validate-system-behavior
    - - name: cleanup
        template: cleanup-chaos

  - name: collect-baseline
    script:
      image: curlimages/curl:latest
      command: [sh]
      source: |
        # Collect baseline metrics
        curl -s "http://prometheus:9090/api/v1/query?query=avg_over_time(http_request_duration_seconds[5m])" > /tmp/baseline.json
        echo "Baseline metrics collected"

  - name: execute-pod-chaos
    resource:
      action: create
      manifest: |
        apiVersion: chaos-mesh.org/v1alpha1
        kind: PodChaos
        metadata:
          name: workflow-pod-chaos
          namespace: chaos-testing
        spec:
          action: pod-kill
          mode: fixed-percent
          value: "20"
          duration: "2m"
          selector:
            namespaces:
              - production
            labelSelectors:
              tier: backend

  - name: validate-system-behavior
    script:
      image: curlimages/curl:latest
      command: [sh]
      source: |
        # Validate system still meets SLA
        response_time=$(curl -s "http://prometheus:9090/api/v1/query?query=avg_over_time(http_request_duration_seconds[2m])" | jq -r '.data.result[0].value[1]')
        if (( $(echo "$response_time > 2.0" | bc -l) )); then
          echo "HYPOTHESIS FAILED: Response time $response_time exceeds 2s threshold"
          exit 1
        fi
        echo "HYPOTHESIS VALIDATED: System maintained performance during chaos"
```

## Instructions

### Chaos Engineering Implementation Strategy

Essential components for comprehensive chaos engineering:

| Component | Priority | Implementation | Use Case |
|-----------|----------|----------------|----------|
| **Experiment Framework** | Critical | Custom framework, Chaos Mesh | Experiment orchestration |
| **Failure Injection** | Critical | Network, service, resource | Fault simulation |
| **Monitoring Integration** | Critical | Prometheus, Grafana | Behavior observation |
| **Safety Mechanisms** | Critical | Circuit breakers, rollback | Risk mitigation |
| **Hypothesis Validation** | High | Automated validation | Experiment success criteria |
| **Blast Radius Control** | High | Scoped experiments | Impact limitation |
| **Automated Rollback** | High | Emergency recovery | Safety assurance |
| **Reporting Dashboard** | Medium | Experiment results | Insights visualization |

### Chaos Experiment Design Patterns

```typescript
// 1. Gradual Failure Introduction Pattern
class GradualFailurePattern {
  async executeGradualFailure(config: GradualFailureConfig): Promise<void> {
    const steps = [
      { percentage: 10, duration: 60000 },  // 1 minute at 10%
      { percentage: 25, duration: 120000 }, // 2 minutes at 25%
      { percentage: 50, duration: 180000 }, // 3 minutes at 50%
    ];

    for (const step of steps) {
      await this.injectFailure(step.percentage);
      await this.monitorFor(step.duration);
      
      // Check if system is still healthy
      const healthCheck = await this.performHealthCheck();
      if (!healthCheck.healthy) {
        await this.rollback();
        throw new Error('System unhealthy, aborting experiment');
      }
    }
  }
}

// 2. Dependency Failure Pattern
class DependencyFailurePattern {
  async testDependencyFailure(serviceName: string, dependencyName: string): Promise<void> {
    // Test what happens when a critical dependency fails
    const experiment = {
      name: `${serviceName}-dependency-failure`,
      target: dependencyName,
      actions: [
        'simulate-timeout',
        'simulate-connection-refused',
        'simulate-slow-response',
        'simulate-intermittent-failure'
      ]
    };

    for (const action of experiment.actions) {
      await this.executeAction(action, dependencyName);
      await this.validateServiceBehavior(serviceName);
    }
  }
}

// 3. Resource Exhaustion Pattern
class ResourceExhaustionPattern {
  async testResourceExhaustion(resourceType: ResourceType): Promise<void> {
    const exhaustionTests = {
      'memory': () => this.simulateMemoryExhaustion(),
      'cpu': () => this.simulateCpuExhaustion(),
      'disk': () => this.simulateDiskExhaustion(),
      'network': () => this.simulateNetworkExhaustion(),
      'file-descriptors': () => this.simulateFileDescriptorExhaustion()
    };

    const testFunction = exhaustionTests[resourceType];
    if (testFunction) {
      await testFunction();
    }
  }

  private async simulateMemoryExhaustion(): Promise<void> {
    // Gradually increase memory usage until system responds
    let memoryUsage = 0.5; // Start at 50%
    const increment = 0.1; // Increase by 10% each step
    
    while (memoryUsage < 0.95) { // Don't exceed 95%
      await this.setMemoryUsage(memoryUsage);
      await this.delay(30000); // Wait 30 seconds
      
      const systemHealth = await this.checkSystemHealth();
      if (!systemHealth.responsive) {
        console.log(`System became unresponsive at ${memoryUsage * 100}% memory usage`);
        break;
      }
      
      memoryUsage += increment;
    }
  }
}

// 4. Time-based Chaos Pattern
class TimeBasedChaosPattern {
  async executeTimeBasedChaos(schedule: ChaosSchedule): Promise<void> {
    // Schedule chaos experiments at specific times
    const scheduler = new ChaosScheduler();
    
    // Peak traffic chaos
    scheduler.schedule('peak-traffic-chaos', {
      cron: '0 12 * * 1-5', // Weekdays at noon
      experiment: 'high-load-with-failures'
    });
    
    // Off-hours resilience testing
    scheduler.schedule('off-hours-resilience', {
      cron: '0 2 * * *', // Daily at 2 AM
      experiment: 'comprehensive-failure-suite'
    });
    
    // Pre-deployment validation
    scheduler.schedule('pre-deployment-chaos', {
      trigger: 'deployment-pipeline',
      experiment: 'deployment-readiness-test'
    });
  }
}
```

### Monitoring and Observability Integration

```typescript
// Chaos experiment monitoring
class ChaosMonitoringService {
  private prometheus: PrometheusService;
  private grafana: GrafanaService;
  private alertManager: AlertManagerService;

  constructor(monitoring: MonitoringConfig) {
    this.prometheus = new PrometheusService(monitoring.prometheus);
    this.grafana = new GrafanaService(monitoring.grafana);
    this.alertManager = new AlertManagerService(monitoring.alertManager);
  }

  // Create chaos experiment dashboard
  async createChaosDashboard(experimentId: string): Promise<Dashboard> {
    const dashboard = await this.grafana.createDashboard({
      title: `Chaos Experiment: ${experimentId}`,
      panels: [
        {
          title: 'Response Time',
          query: 'avg_over_time(http_request_duration_seconds[5m])',
          type: 'graph'
        },
        {
          title: 'Error Rate',
          query: 'rate(http_requests_total{status=~"5.."}[5m])',
          type: 'graph'
        },
        {
          title: 'System Resources',
          query: 'avg(cpu_usage_percent)',
          type: 'graph'
        },
        {
          title: 'Active Connections',
          query: 'sum(active_connections)',
          type: 'stat'
        }
      ]
    });

    return dashboard;
  }

  // Set up chaos experiment alerts
  async setupChaosAlerts(experiment: ChaosExperiment): Promise<void> {
    const alerts = [
      {
        name: `${experiment.id}-response-time-alert`,
        condition: 'avg_over_time(http_request_duration_seconds[2m]) > 5',
        severity: 'critical',
        action: 'abort-experiment'
      },
      {
        name: `${experiment.id}-error-rate-alert`,
        condition: 'rate(http_requests_total{status=~"5.."}[2m]) > 0.1',
        severity: 'warning',
        action: 'notify-team'
      },
      {
        name: `${experiment.id}-availability-alert`,
        condition: 'up == 0',
        severity: 'critical',
        action: 'emergency-rollback'
      }
    ];

    for (const alert of alerts) {
      await this.alertManager.createAlert(alert);
    }
  }

  // Collect experiment metrics
  async collectExperimentMetrics(experimentId: string, duration: number): Promise<ExperimentMetrics> {
    const endTime = Date.now();
    const startTime = endTime - duration;

    const metrics = await Promise.all([
      this.prometheus.queryRange('avg_over_time(http_request_duration_seconds[1m])', startTime, endTime),
      this.prometheus.queryRange('rate(http_requests_total[1m])', startTime, endTime),
      this.prometheus.queryRange('rate(http_requests_total{status=~"5.."}[1m])', startTime, endTime),
      this.prometheus.queryRange('avg(cpu_usage_percent)', startTime, endTime),
      this.prometheus.queryRange('avg(memory_usage_percent)', startTime, endTime)
    ]);

    return {
      experimentId,
      responseTime: metrics[0],
      requestRate: metrics[1],
      errorRate: metrics[2],
      cpuUsage: metrics[3],
      memoryUsage: metrics[4],
      duration,
      timestamp: endTime
    };
  }
}
```

### Safety and Rollback Mechanisms

```typescript
// Comprehensive safety framework
class ChaosSafetyFramework {
  private rollbackManager: RollbackManager;
  private healthChecker: HealthChecker;
  private emergencyContacts: EmergencyContactService;

  constructor(config: SafetyConfig) {
    this.rollbackManager = new RollbackManager(config.rollback);
    this.healthChecker = new HealthChecker(config.health);
    this.emergencyContacts = new EmergencyContactService(config.contacts);
  }

  // Pre-flight safety checks
  async performPreFlightChecks(experiment: ChaosExperiment): Promise<SafetyCheckResult> {
    const checks = [
      () => this.validateEnvironment(experiment.scope.environment),
      () => this.checkSystemHealth(),
      () => this.validateBlastRadius(experiment.scope),
      () => this.checkMaintenanceWindows(),
      () => this.validateRollbackPlan(experiment.rollbackStrategy)
    ];

    const results = await Promise.all(checks.map(check => check()));
    const passed = results.every(result => result.passed);

    return {
      passed,
      checks: results,
      blockers: results.filter(r => !r.passed).map(r => r.reason)
    };
  }

  // Continuous safety monitoring during experiment
  async monitorExperimentSafety(experimentId: string): Promise<void> {
    const monitoringInterval = setInterval(async () => {
      const healthStatus = await this.healthChecker.checkSystemHealth();
      
      if (healthStatus.critical) {
        console.log('CRITICAL: System health degraded, initiating emergency rollback');
        await this.initiateEmergencyRollback(experimentId);
        await this.emergencyContacts.notifyTeam('chaos-experiment-emergency', {
          experimentId,
          reason: 'Critical system health degradation',
          healthStatus
        });
        clearInterval(monitoringInterval);
      } else if (healthStatus.warning) {
        console.log('WARNING: System health warning detected');
        await this.emergencyContacts.notifyTeam('chaos-experiment-warning', {
          experimentId,
          healthStatus
        });
      }
    }, 10000); // Check every 10 seconds

    // Store interval ID for cleanup
    this.storeMonitoringInterval(experimentId, monitoringInterval);
  }

  // Emergency rollback procedures
  async initiateEmergencyRollback(experimentId: string): Promise<void> {
    const experiment = await this.getExperiment(experimentId);
    
    // Execute rollback actions in parallel for speed
    const rollbackPromises = experiment.rollbackStrategy.map(action => 
      this.executeRollbackAction(action)
    );

    try {
      await Promise.all(rollbackPromises);
      console.log(`Emergency rollback completed for experiment ${experimentId}`);
    } catch (error) {
      console.error(`Emergency rollback failed for experiment ${experimentId}:`, error);
      // Escalate to human intervention
      await this.escalateToHumanIntervention(experimentId, error);
    }
  }

  private async escalateToHumanIntervention(experimentId: string, error: Error): Promise<void> {
    await this.emergencyContacts.escalate('chaos-experiment-rollback-failure', {
      experimentId,
      error: error.message,
      urgency: 'immediate',
      requiredAction: 'manual-system-recovery'
    });
  }
}
```

## Implementation Patterns

### 1. Experiment-Driven Development Pattern
Structure chaos experiments as first-class development artifacts:
- Version control chaos experiment definitions
- Code review process for experiment changes
- Automated experiment validation and testing
- Integration with CI/CD pipelines

### 2. Progressive Chaos Pattern
Gradually increase chaos complexity and scope:
- Start with non-critical services in test environments
- Progress to staging environment experiments
- Carefully introduce production chaos experiments
- Expand blast radius based on confidence

### 3. Hypothesis-Driven Testing Pattern
Every chaos experiment must have a clear hypothesis:
- Define expected system behavior under failure
- Establish measurable success criteria
- Validate hypothesis with quantitative metrics
- Learn from hypothesis failures

### 4. Automated Recovery Pattern
Build self-healing capabilities into chaos experiments:
- Automatic rollback on safety threshold breach
- Circuit breaker integration for graceful degradation
- Health check automation for continuous monitoring
- Emergency escalation procedures

### 5. Observability-First Pattern
Comprehensive monitoring and observability:
- Real-time metrics collection during experiments
- Distributed tracing for failure impact analysis
- Log aggregation for post-experiment analysis
- Custom dashboards for experiment visualization

### 6. Blast Radius Control Pattern
Limit experiment impact through careful scoping:
- Percentage-based failure injection
- Service-specific experiment targeting
- Environment-based experiment isolation
- Time-bounded experiment execution

### 7. Continuous Chaos Pattern
Integrate chaos engineering into regular operations:
- Scheduled chaos experiments
- Event-driven chaos triggers
- Chaos as part of deployment validation
- Regular chaos experiment reviews and updates

### 8. Learning and Improvement Pattern
Systematic learning from chaos experiments:
- Post-experiment retrospectives
- Failure mode documentation
- System improvement recommendations
- Chaos experiment effectiveness metrics

## Expected Output

This template will produce:

- **Comprehensive Chaos Framework**: Production-ready chaos engineering implementation with safety mechanisms
- **Experiment Definitions**: Reusable chaos experiment templates for common failure scenarios
- **Kubernetes Integration**: Chaos Mesh configurations for container orchestration chaos testing
- **Monitoring Integration**: Prometheus and Grafana dashboards for experiment observation
- **Safety Mechanisms**: Automated rollback and emergency procedures for risk mitigation
- **Reporting System**: Comprehensive experiment results and learning documentation
- **CI/CD Integration**: Automated chaos testing as part of deployment pipelines
- **Team Processes**: Chaos engineering workflows and best practices

## Integration Points

- Connects with monitoring modules for comprehensive observability
- Integrates with deployment modules for pipeline chaos testing
- Works with security modules for failure impact assessment
- Supports performance modules for resilience validation
- Compatible with alerting systems for emergency response

## Security Considerations

- Experiment authorization and access control
- Blast radius limitation and scope validation
- Emergency rollback and recovery procedures
- Audit logging for all chaos activities
- Compliance with security policies and regulations

## Performance Features

- Minimal performance impact during experiments
- Efficient monitoring and metrics collection
- Optimized rollback procedures for quick recovery
- Resource usage monitoring during chaos injection
- Performance baseline establishment and validation

## Operational Excellence

- Comprehensive experiment documentation and tracking
- Automated safety checks and validation procedures
- Team notification and escalation processes
- Regular chaos engineering maturity assessment
- Continuous improvement based on experiment learnings

This template provides a robust foundation for implementing chaos engineering practices with enterprise-grade safety, monitoring, and operational procedures.
