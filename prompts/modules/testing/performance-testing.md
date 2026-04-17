# Performance Testing Orchestration Template

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

This template provides comprehensive patterns for implementing advanced performance testing orchestration including distributed load testing, AI-driven performance analysis, chaos-performance integration with resilience testing and failure injection, real-time monitoring, and automated performance optimization. It covers enterprise-scale performance testing with intelligent test orchestration, predictive analysis, and continuous performance validation.

## Context

Modern performance testing requires sophisticated orchestration to handle complex distributed systems, microservices architectures, and cloud-native applications. This template addresses advanced performance testing strategies including intelligent test generation, real-time adaptation, multi-dimensional analysis, and automated performance optimization with machine learning integration.

## Examples

### Example 1: Intelligent Performance Test Orchestration
```typescript
// Advanced performance testing orchestration framework
interface PerformanceOrchestrationConfig {
  testStrategy: TestStrategy;
  distributedExecution: DistributedExecutionConfig;
  intelligentAnalysis: AIAnalysisConfig;
  realTimeAdaptation: AdaptationConfig;
  chaosIntegration: ChaosPerformanceConfig;
  continuousOptimization: OptimizationConfig;
}

interface TestStrategy {
  type: 'adaptive' | 'predictive' | 'exploratory' | 'regression';
  objectives: PerformanceObjective[];
  constraints: TestConstraint[];
  optimization: OptimizationTarget[];
}

class PerformanceOrchestrationFramework {
  private distributedExecutor: DistributedTestExecutor;
  private aiAnalyzer: AIPerformanceAnalyzer;
  private realTimeMonitor: RealTimePerformanceMonitor;
  private chaosIntegrator: ChaosPerformanceIntegrator;
  private optimizationEngine: PerformanceOptimizationEngine;

  constructor(config: PerformanceOrchestrationConfig) {
    this.distributedExecutor = new DistributedTestExecutor(config.distributedExecution);
    this.aiAnalyzer = new AIPerformanceAnalyzer(config.intelligentAnalysis);
    this.realTimeMonitor = new RealTimePerformanceMonitor(config.realTimeAdaptation);
    this.chaosIntegrator = new ChaosPerformanceIntegrator(config.chaosIntegration);
    this.optimizationEngine = new PerformanceOptimizationEngine(config.continuousOptimization);
  }

  // Execute intelligent performance testing campaign
  async executePerformanceCampaign(campaign: PerformanceCampaign): Promise<CampaignResult> {
    const campaignId = this.generateCampaignId();
    const startTime = Date.now();

    try {
      // 1. Intelligent test planning
      const testPlan = await this.generateIntelligentTestPlan(campaign);
      
      // 2. Distributed test execution
      const executionResults = await this.executeDistributedTests(testPlan);
      
      // 3. Real-time analysis and adaptation
      const adaptiveResults = await this.performRealTimeAdaptation(executionResults);
      
      // 4. Chaos-performance integration with resilience testing and failure injection
      const chaosResults = await this.integrateChaosWithPerformance(adaptiveResults);
      
      // 5. AI-driven analysis
      const aiAnalysis = await this.performAIAnalysis(chaosResults);
      
      // 6. Automated optimization
      const optimizationResults = await this.performAutomatedOptimization(aiAnalysis);
      
      return {
        campaignId,
        success: true,
        duration: Date.now() - startTime,
        testPlan,
        executionResults,
        adaptiveResults,
        chaosResults,
        aiAnalysis,
        optimizationResults,
        recommendations: this.generateIntelligentRecommendations(optimizationResults)
      };

    } catch (error) {
      return {
        campaignId,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        recommendations: ['Review performance testing configuration and retry']
      };
    }
  }

  // Generate intelligent test plan using AI
  private async generateIntelligentTestPlan(campaign: PerformanceCampaign): Promise<IntelligentTestPlan> {
    const historicalData = await this.loadHistoricalPerformanceData(campaign.applicationId);
    const systemProfile = await this.analyzeSystemProfile(campaign.targetSystem);
    
    // Use machine learning to optimize test parameters
    const mlOptimizedParams = await this.aiAnalyzer.optimizeTestParameters({
      historicalData,
      systemProfile,
      objectives: campaign.objectives,
      constraints: campaign.constraints
    });

    // Generate adaptive test scenarios
    const adaptiveScenarios = await this.generateAdaptiveScenarios(mlOptimizedParams);
    
    // Create distributed execution plan
    const executionPlan = await this.createDistributedExecutionPlan(adaptiveScenarios);

    return {
      campaignId: campaign.id,
      objectives: campaign.objectives,
      optimizedParameters: mlOptimizedParams,
      adaptiveScenarios,
      executionPlan,
      expectedDuration: this.calculateExpectedDuration(executionPlan),
      resourceRequirements: this.calculateResourceRequirements(executionPlan)
    };
  }

  // Execute distributed performance tests
  private async executeDistributedTests(testPlan: IntelligentTestPlan): Promise<DistributedExecutionResult> {
    const executionNodes = await this.distributedExecutor.provisionExecutionNodes(
      testPlan.resourceRequirements
    );

    try {
      // Distribute test scenarios across nodes
      const distributedTasks = this.distributeTestTasks(testPlan.adaptiveScenarios, executionNodes);
      
      // Execute tests in parallel with coordination
      const executionPromises = distributedTasks.map(async task => {
        const node = executionNodes.find(n => n.id === task.nodeId);
        return await this.executeTestOnNode(node, task);
      });

      const nodeResults = await Promise.all(executionPromises);
      
      // Aggregate results from all nodes
      const aggregatedResults = this.aggregateDistributedResults(nodeResults);
      
      return {
        executionNodes: executionNodes.length,
        totalVirtualUsers: testPlan.adaptiveScenarios.reduce((sum, s) => sum + s.virtualUsers, 0),
        duration: aggregatedResults.duration,
        nodeResults,
        aggregatedMetrics: aggregatedResults.metrics,
        distributionEfficiency: this.calculateDistributionEfficiency(nodeResults)
      };

    } finally {
      // Clean up execution nodes
      await this.distributedExecutor.cleanupExecutionNodes(executionNodes);
    }
  }

  // Real-time performance adaptation
  private async performRealTimeAdaptation(
    executionResults: DistributedExecutionResult
  ): Promise<AdaptiveExecutionResult> {
    const adaptationEngine = new RealTimeAdaptationEngine();
    
    // Monitor performance metrics in real-time
    const realTimeMetrics = await this.realTimeMonitor.collectRealTimeMetrics(executionResults);
    
    // Detect performance anomalies
    const anomalies = await this.detectPerformanceAnomalies(realTimeMetrics);
    
    // Adapt test parameters based on real-time feedback
    const adaptations = await adaptationEngine.generateAdaptations({
      currentMetrics: realTimeMetrics,
      anomalies,
      objectives: executionResults.objectives,
      constraints: executionResults.constraints
    });

    // Apply adaptations
    const adaptedResults = await this.applyRealTimeAdaptations(executionResults, adaptations);
    
    return {
      originalResults: executionResults,
      realTimeMetrics,
      detectedAnomalies: anomalies,
      appliedAdaptations: adaptations,
      adaptedResults,
      adaptationEffectiveness: this.measureAdaptationEffectiveness(executionResults, adaptedResults)
    };
  }
}

// AI-driven performance analysis
class AIPerformanceAnalyzer {
  private mlModel: MachineLearningModel;
  private patternRecognition: PatternRecognitionEngine;
  private predictiveAnalytics: PredictiveAnalyticsEngine;

  constructor(config: AIAnalysisConfig) {
    this.mlModel = new MachineLearningModel(config.modelConfig);
    this.patternRecognition = new PatternRecognitionEngine(config.patternConfig);
    this.predictiveAnalytics = new PredictiveAnalyticsEngine(config.predictiveConfig);
  }

  // Perform comprehensive AI analysis
  async performAIAnalysis(performanceData: PerformanceDataSet): Promise<AIAnalysisResult> {
    const analysisStartTime = Date.now();

    // 1. Pattern recognition in performance data
    const patterns = await this.patternRecognition.identifyPatterns(performanceData);
    
    // 2. Anomaly detection using machine learning
    const anomalies = await this.mlModel.detectAnomalies(performanceData);
    
    // 3. Performance bottleneck identification
    const bottlenecks = await this.identifyBottlenecks(performanceData, patterns);
    
    // 4. Predictive performance modeling
    const predictions = await this.predictiveAnalytics.generatePredictions(performanceData);
    
    // 5. Root cause analysis
    const rootCauses = await this.performRootCauseAnalysis(anomalies, bottlenecks);
    
    // 6. Optimization recommendations
    const optimizations = await this.generateOptimizationRecommendations(
      patterns, anomalies, bottlenecks, predictions, rootCauses
    );

    return {
      analysisId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - analysisStartTime,
      patterns,
      anomalies,
      bottlenecks,
      predictions,
      rootCauses,
      optimizations,
      confidence: this.calculateAnalysisConfidence([patterns, anomalies, bottlenecks, predictions])
    };
  }

  // Identify performance patterns using ML
  private async identifyPatterns(data: PerformanceDataSet): Promise<PerformancePattern[]> {
    const timeSeriesAnalysis = await this.analyzeTimeSeries(data.timeSeries);
    const correlationAnalysis = await this.analyzeCorrelations(data.metrics);
    const seasonalityAnalysis = await this.analyzeSeasonality(data.timeSeries);
    
    return [
      ...timeSeriesAnalysis.patterns,
      ...correlationAnalysis.patterns,
      ...seasonalityAnalysis.patterns
    ].map(pattern => ({
      ...pattern,
      confidence: this.calculatePatternConfidence(pattern),
      impact: this.assessPatternImpact(pattern, data),
      recommendations: this.generatePatternRecommendations(pattern)
    }));
  }

  // Predictive performance modeling
  private async generatePredictions(data: PerformanceDataSet): Promise<PerformancePrediction[]> {
    const models = [
      this.createLoadPredictionModel(data),
      this.createResponseTimePredictionModel(data),
      this.createResourceUtilizationModel(data),
      this.createScalabilityPredictionModel(data)
    ];

    const predictions = await Promise.all(models.map(model => model.predict()));
    
    return predictions.map(prediction => ({
      ...prediction,
      accuracy: this.validatePredictionAccuracy(prediction, data),
      confidence: this.calculatePredictionConfidence(prediction),
      timeHorizon: this.determinePredictionTimeHorizon(prediction),
      actionableInsights: this.generateActionableInsights(prediction)
    }));
  }

  // Generate optimization recommendations
  private async generateOptimizationRecommendations(
    patterns: PerformancePattern[],
    anomalies: PerformanceAnomaly[],
    bottlenecks: PerformanceBottleneck[],
    predictions: PerformancePrediction[],
    rootCauses: RootCauseAnalysis[]
  ): Promise<OptimizationRecommendation[]> {
    const recommendations = [];

    // Pattern-based optimizations
    for (const pattern of patterns) {
      const patternOptimizations = await this.generatePatternOptimizations(pattern);
      recommendations.push(...patternOptimizations);
    }

    // Anomaly-based optimizations
    for (const anomaly of anomalies) {
      const anomalyOptimizations = await this.generateAnomalyOptimizations(anomaly);
      recommendations.push(...anomalyOptimizations);
    }

    // Bottleneck-based optimizations
    for (const bottleneck of bottlenecks) {
      const bottleneckOptimizations = await this.generateBottleneckOptimizations(bottleneck);
      recommendations.push(...bottleneckOptimizations);
    }

    // Predictive optimizations
    for (const prediction of predictions) {
      const predictiveOptimizations = await this.generatePredictiveOptimizations(prediction);
      recommendations.push(...predictiveOptimizations);
    }

    // Prioritize and rank recommendations
    return this.prioritizeRecommendations(recommendations, rootCauses);
  }
}

// Chaos-Performance Integration
class ChaosPerformanceIntegrator {
  private chaosEngine: ChaosEngineeringFramework;
  private performanceMonitor: PerformanceMonitor;
  private correlationAnalyzer: CorrelationAnalyzer;

  constructor(config: ChaosPerformanceConfig) {
    this.chaosEngine = new ChaosEngineeringFramework(config.chaos);
    this.performanceMonitor = new PerformanceMonitor(config.monitoring);
    this.correlationAnalyzer = new CorrelationAnalyzer(config.correlation);
  }

  // Integrate chaos engineering with performance testing
  async integrateChaosWithPerformance(
    performanceResults: PerformanceResults
  ): Promise<ChaosPerformanceResult> {
    const integrationStartTime = Date.now();

    // 1. Baseline performance measurement
    const baselineMetrics = await this.establishPerformanceBaseline(performanceResults);
    
    // 2. Design chaos experiments based on performance patterns
    const chaosExperiments = await this.designPerformanceChaosExperiments(performanceResults);
    
    // 3. Execute chaos experiments with performance monitoring
    const chaosResults = await this.executeChaosWithPerformanceMonitoring(chaosExperiments);
    
    // 4. Analyze performance impact of chaos
    const impactAnalysis = await this.analyzePerformanceImpact(baselineMetrics, chaosResults);
    
    // 5. Identify resilience gaps
    const resilienceGaps = await this.identifyResilienceGaps(impactAnalysis);
    
    // 6. Generate resilience recommendations
    const resilienceRecommendations = await this.generateResilienceRecommendations(resilienceGaps);

    return {
      integrationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - integrationStartTime,
      baselineMetrics,
      chaosExperiments,
      chaosResults,
      impactAnalysis,
      resilienceGaps,
      resilienceRecommendations,
      overallResilienceScore: this.calculateResilienceScore(impactAnalysis)
    };
  }

  // Design chaos experiments based on performance characteristics
  private async designPerformanceChaosExperiments(
    performanceResults: PerformanceResults
  ): Promise<PerformanceChaosExperiment[]> {
    const experiments = [];

    // Network latency chaos during peak load
    if (performanceResults.peakLoad) {
      experiments.push({
        name: 'network-latency-under-load',
        type: 'network-chaos',
        trigger: 'peak-load-condition',
        parameters: {
          latency: '100ms',
          jitter: '50ms',
          duration: '5m'
        },
        expectedImpact: 'response-time-degradation',
        successCriteria: 'system-remains-functional'
      });
    }

    // Memory pressure during high throughput
    if (performanceResults.highThroughput) {
      experiments.push({
        name: 'memory-pressure-high-throughput',
        type: 'resource-chaos',
        trigger: 'high-throughput-condition',
        parameters: {
          memoryPressure: '80%',
          duration: '3m'
        },
        expectedImpact: 'throughput-reduction',
        successCriteria: 'graceful-degradation'
      });
    }

    // Service failure during load ramp-up
    experiments.push({
      name: 'service-failure-during-rampup',
      type: 'service-chaos',
      trigger: 'load-ramp-up',
      parameters: {
        failureRate: '30%',
        duration: '2m'
      },
      expectedImpact: 'error-rate-increase',
      successCriteria: 'circuit-breaker-activation'
    });

    return experiments;
  }

  // Execute chaos experiments with performance monitoring
  private async executeChaosWithPerformanceMonitoring(
    experiments: PerformanceChaosExperiment[]
  ): Promise<ChaosPerformanceExecution[]> {
    const executions = [];

    for (const experiment of experiments) {
      const executionStartTime = Date.now();
      
      // Start performance monitoring
      const monitoringSession = await this.performanceMonitor.startSession({
        experiment: experiment.name,
        metrics: ['response-time', 'throughput', 'error-rate', 'resource-usage'],
        frequency: '1s'
      });

      try {
        // Execute chaos experiment
        const chaosResult = await this.chaosEngine.executeExperiment(experiment);
        
        // Collect performance metrics during chaos
        const performanceMetrics = await this.performanceMonitor.collectMetrics(monitoringSession);
        
        // Analyze correlation between chaos and performance
        const correlation = await this.correlationAnalyzer.analyzeCorrelation(
          chaosResult.timeline,
          performanceMetrics.timeline
        );

        executions.push({
          experiment,
          chaosResult,
          performanceMetrics,
          correlation,
          duration: Date.now() - executionStartTime,
          success: this.evaluateExperimentSuccess(experiment, chaosResult, performanceMetrics)
        });

      } finally {
        // Stop performance monitoring
        await this.performanceMonitor.stopSession(monitoringSession);
      }
    }

    return executions;
  }
}
```

### Example 2: Real-Time Performance Monitoring and Adaptation
```typescript
// Real-time performance monitoring and adaptive testing
class RealTimePerformanceMonitor {
  private metricsCollector: RealTimeMetricsCollector;
  private alertingSystem: PerformanceAlertingSystem;
  private adaptationEngine: TestAdaptationEngine;
  private dashboardService: RealTimeDashboardService;

  constructor(config: RealTimeMonitoringConfig) {
    this.metricsCollector = new RealTimeMetricsCollector(config.metrics);
    this.alertingSystem = new PerformanceAlertingSystem(config.alerting);
    this.adaptationEngine = new TestAdaptationEngine(config.adaptation);
    this.dashboardService = new RealTimeDashboardService(config.dashboard);
  }

  // Monitor performance in real-time with adaptive responses
  async monitorWithAdaptation(testExecution: TestExecution): Promise<AdaptiveMonitoringResult> {
    const monitoringSession = await this.startMonitoringSession(testExecution);
    
    try {
      const adaptations = [];
      const alerts = [];
      const metrics = [];

      // Real-time monitoring loop
      while (testExecution.isRunning()) {
        // Collect current metrics
        const currentMetrics = await this.metricsCollector.collectCurrentMetrics();
        metrics.push(currentMetrics);

        // Update real-time dashboard
        await this.dashboardService.updateMetrics(currentMetrics);

        // Check for performance anomalies
        const anomalies = await this.detectRealTimeAnomalies(currentMetrics);
        
        if (anomalies.length > 0) {
          // Generate alerts
          const newAlerts = await this.alertingSystem.processAnomalies(anomalies);
          alerts.push(...newAlerts);

          // Determine if adaptation is needed
          const adaptationNeeded = await this.assessAdaptationNeed(anomalies, currentMetrics);
          
          if (adaptationNeeded) {
            // Generate and apply adaptation
            const adaptation = await this.adaptationEngine.generateAdaptation({
              anomalies,
              currentMetrics,
              testContext: testExecution.getContext()
            });

            await this.applyAdaptation(testExecution, adaptation);
            adaptations.push(adaptation);
          }
        }

        // Wait for next monitoring interval
        await this.delay(monitoringSession.interval);
      }

      return {
        sessionId: monitoringSession.id,
        duration: Date.now() - monitoringSession.startTime,
        totalMetrics: metrics.length,
        adaptations,
        alerts,
        finalMetrics: metrics[metrics.length - 1],
        adaptationEffectiveness: this.calculateAdaptationEffectiveness(adaptations, metrics)
      };

    } finally {
      await this.stopMonitoringSession(monitoringSession);
    }
  }

  // Detect real-time performance anomalies
  private async detectRealTimeAnomalies(metrics: RealTimeMetrics): Promise<PerformanceAnomaly[]> {
    const anomalies = [];

    // Response time anomaly detection
    if (metrics.responseTime.p95 > metrics.thresholds.responseTime.p95 * 1.5) {
      anomalies.push({
        type: 'response-time-spike',
        severity: 'high',
        metric: 'response_time_p95',
        currentValue: metrics.responseTime.p95,
        threshold: metrics.thresholds.responseTime.p95,
        deviation: (metrics.responseTime.p95 / metrics.thresholds.responseTime.p95) - 1,
        timestamp: Date.now()
      });
    }

    // Throughput anomaly detection
    if (metrics.throughput < metrics.thresholds.throughput * 0.7) {
      anomalies.push({
        type: 'throughput-drop',
        severity: 'medium',
        metric: 'throughput',
        currentValue: metrics.throughput,
        threshold: metrics.thresholds.throughput,
        deviation: (metrics.throughput / metrics.thresholds.throughput) - 1,
        timestamp: Date.now()
      });
    }

    // Error rate anomaly detection
    if (metrics.errorRate > metrics.thresholds.errorRate * 2) {
      anomalies.push({
        type: 'error-rate-spike',
        severity: 'critical',
        metric: 'error_rate',
        currentValue: metrics.errorRate,
        threshold: metrics.thresholds.errorRate,
        deviation: (metrics.errorRate / metrics.thresholds.errorRate) - 1,
        timestamp: Date.now()
      });
    }

    // Resource utilization anomaly detection
    if (metrics.resourceUtilization.cpu > 90) {
      anomalies.push({
        type: 'cpu-saturation',
        severity: 'high',
        metric: 'cpu_utilization',
        currentValue: metrics.resourceUtilization.cpu,
        threshold: 80,
        deviation: (metrics.resourceUtilization.cpu / 80) - 1,
        timestamp: Date.now()
      });
    }

    return anomalies;
  }

  // Apply real-time test adaptation
  private async applyAdaptation(testExecution: TestExecution, adaptation: TestAdaptation): Promise<void> {
    switch (adaptation.type) {
      case 'reduce-load':
        await testExecution.adjustVirtualUsers(adaptation.parameters.targetUsers);
        break;
        
      case 'increase-think-time':
        await testExecution.adjustThinkTime(adaptation.parameters.thinkTime);
        break;
        
      case 'change-scenario-mix':
        await testExecution.adjustScenarioMix(adaptation.parameters.scenarioWeights);
        break;
        
      case 'enable-circuit-breaker':
        await testExecution.enableCircuitBreaker(adaptation.parameters.circuitBreakerConfig);
        break;
        
      case 'adjust-timeout':
        await testExecution.adjustTimeouts(adaptation.parameters.timeouts);
        break;
        
      default:
        console.warn(`Unknown adaptation type: ${adaptation.type}`);
    }

    // Log adaptation for analysis
    await this.logAdaptation(testExecution.id, adaptation);
  }
}

// Performance optimization engine
class PerformanceOptimizationEngine {
  private optimizationStrategies: OptimizationStrategy[];
  private mlOptimizer: MachineLearningOptimizer;
  private simulationEngine: PerformanceSimulationEngine;

  constructor(config: OptimizationConfig) {
    this.optimizationStrategies = this.loadOptimizationStrategies(config.strategies);
    this.mlOptimizer = new MachineLearningOptimizer(config.ml);
    this.simulationEngine = new PerformanceSimulationEngine(config.simulation);
  }

  // Perform automated performance optimization
  async performAutomatedOptimization(
    analysisResult: AIAnalysisResult
  ): Promise<OptimizationResult> {
    const optimizationStartTime = Date.now();

    // 1. Generate optimization candidates
    const candidates = await this.generateOptimizationCandidates(analysisResult);
    
    // 2. Simulate optimization impact
    const simulations = await this.simulateOptimizations(candidates);
    
    // 3. Select optimal configurations using ML
    const optimalConfigurations = await this.mlOptimizer.selectOptimalConfigurations(simulations);
    
    // 4. Validate optimizations
    const validationResults = await this.validateOptimizations(optimalConfigurations);
    
    // 5. Generate implementation plan
    const implementationPlan = await this.generateImplementationPlan(validationResults);

    return {
      optimizationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - optimizationStartTime,
      candidates: candidates.length,
      simulations,
      optimalConfigurations,
      validationResults,
      implementationPlan,
      expectedImprovements: this.calculateExpectedImprovements(optimalConfigurations),
      riskAssessment: this.assessOptimizationRisks(implementationPlan)
    };
  }

  // Generate optimization candidates based on analysis
  private async generateOptimizationCandidates(
    analysisResult: AIAnalysisResult
  ): Promise<OptimizationCandidate[]> {
    const candidates = [];

    // Generate candidates from bottlenecks
    for (const bottleneck of analysisResult.bottlenecks) {
      const bottleneckCandidates = await this.generateBottleneckOptimizations(bottleneck);
      candidates.push(...bottleneckCandidates);
    }

    // Generate candidates from patterns
    for (const pattern of analysisResult.patterns) {
      const patternCandidates = await this.generatePatternOptimizations(pattern);
      candidates.push(...patternCandidates);
    }

    // Generate candidates from predictions
    for (const prediction of analysisResult.predictions) {
      const predictiveCandidates = await this.generatePredictiveOptimizations(prediction);
      candidates.push(...predictiveCandidates);
    }

    // Generate ML-driven candidates
    const mlCandidates = await this.mlOptimizer.generateCandidates(analysisResult);
    candidates.push(...mlCandidates);

    return this.deduplicateAndRankCandidates(candidates);
  }

  // Simulate optimization impact
  private async simulateOptimizations(
    candidates: OptimizationCandidate[]
  ): Promise<OptimizationSimulation[]> {
    const simulations = await Promise.all(
      candidates.map(async candidate => {
        const simulation = await this.simulationEngine.simulate({
          baseline: candidate.baseline,
          optimization: candidate.optimization,
          scenarios: candidate.testScenarios,
          duration: candidate.simulationDuration
        });

        return {
          candidate,
          simulation,
          projectedImpact: this.calculateProjectedImpact(simulation),
          confidence: this.calculateSimulationConfidence(simulation),
          risks: this.identifyOptimizationRisks(candidate, simulation)
        };
      })
    );

    return simulations.sort((a, b) => b.projectedImpact.score - a.projectedImpact.score);
  }
}
```

### Example 3: Distributed Performance Testing
```typescript
// Distributed performance testing framework
class DistributedPerformanceTestFramework {
  private nodeManager: TestNodeManager;
  private coordinationService: TestCoordinationService;
  private resultAggregator: DistributedResultAggregator;
  private loadBalancer: TestLoadBalancer;

  constructor(config: DistributedTestConfig) {
    this.nodeManager = new TestNodeManager(config.nodes);
    this.coordinationService = new TestCoordinationService(config.coordination);
    this.resultAggregator = new DistributedResultAggregator(config.aggregation);
    this.loadBalancer = new TestLoadBalancer(config.loadBalancing);
  }

  // Execute distributed performance test
  async executeDistributedTest(testConfig: DistributedTestConfig): Promise<DistributedTestResult> {
    const testId = crypto.randomUUID();
    const startTime = Date.now();

    try {
      // 1. Provision test nodes
      const testNodes = await this.provisionTestNodes(testConfig.nodeRequirements);
      
      // 2. Distribute test load
      const loadDistribution = await this.distributeTestLoad(testConfig, testNodes);
      
      // 3. Coordinate test execution
      const executionResult = await this.coordinateTestExecution(loadDistribution);
      
      // 4. Aggregate results
      const aggregatedResults = await this.aggregateDistributedResults(executionResult);
      
      // 5. Analyze distribution efficiency
      const distributionAnalysis = await this.analyzeDistributionEfficiency(executionResult);

      return {
        testId,
        success: true,
        duration: Date.now() - startTime,
        nodeCount: testNodes.length,
        totalVirtualUsers: loadDistribution.totalVirtualUsers,
        loadDistribution,
        executionResult,
        aggregatedResults,
        distributionAnalysis,
        recommendations: this.generateDistributionRecommendations(distributionAnalysis)
      };

    } catch (error) {
      return {
        testId,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        recommendations: ['Review distributed test configuration and node availability']
      };
    }
  }

  // Provision test nodes across different regions/clouds
  private async provisionTestNodes(requirements: NodeRequirements): Promise<TestNode[]> {
    const provisioningTasks = requirements.regions.map(async region => {
      const regionNodes = await Promise.all(
        Array.from({ length: requirements.nodesPerRegion }, async () => {
          const node = await this.nodeManager.provisionNode({
            region: region.name,
            instanceType: requirements.instanceType,
            capabilities: requirements.capabilities,
            networkConfig: region.networkConfig
          });

          // Install test agents
          await this.installTestAgent(node);
          
          // Validate node readiness
          await this.validateNodeReadiness(node);

          return node;
        })
      );

      return regionNodes;
    });

    const nodesByRegion = await Promise.all(provisioningTasks);
    return nodesByRegion.flat();
  }

  // Distribute test load across nodes
  private async distributeTestLoad(
    testConfig: DistributedTestConfig,
    testNodes: TestNode[]
  ): Promise<LoadDistribution> {
    const distribution = await this.loadBalancer.calculateOptimalDistribution({
      totalVirtualUsers: testConfig.totalVirtualUsers,
      testScenarios: testConfig.scenarios,
      nodeCapabilities: testNodes.map(n => n.capabilities),
      distributionStrategy: testConfig.distributionStrategy
    });

    // Assign load to nodes
    const nodeAssignments = testNodes.map((node, index) => ({
      node,
      assignment: distribution.assignments[index],
      expectedLoad: distribution.expectedLoads[index]
    }));

    return {
      strategy: testConfig.distributionStrategy,
      totalVirtualUsers: testConfig.totalVirtualUsers,
      nodeAssignments,
      loadBalance: this.calculateLoadBalance(nodeAssignments),
      estimatedDuration: this.estimateDistributedTestDuration(nodeAssignments)
    };
  }

  // Coordinate distributed test execution
  private async coordinateTestExecution(
    loadDistribution: LoadDistribution
  ): Promise<CoordinatedExecutionResult> {
    const coordinator = await this.coordinationService.createCoordinator({
      nodes: loadDistribution.nodeAssignments.map(a => a.node),
      synchronizationPoints: this.defineSynchronizationPoints(loadDistribution),
      failureHandling: 'graceful-degradation'
    });

    try {
      // Start coordination
      await coordinator.initialize();
      
      // Execute test phases
      const phaseResults = [];
      
      // Ramp-up phase
      const rampUpResult = await this.executeCoordinatedRampUp(coordinator, loadDistribution);
      phaseResults.push(rampUpResult);
      
      // Steady state phase
      const steadyStateResult = await this.executeCoordinatedSteadyState(coordinator, loadDistribution);
      phaseResults.push(steadyStateResult);
      
      // Ramp-down phase
      const rampDownResult = await this.executeCoordinatedRampDown(coordinator, loadDistribution);
      phaseResults.push(rampDownResult);

      return {
        coordinatorId: coordinator.id,
        phaseResults,
        synchronizationEvents: coordinator.getSynchronizationEvents(),
        nodeHealth: await this.collectNodeHealthMetrics(coordinator),
        coordinationEfficiency: this.calculateCoordinationEfficiency(phaseResults)
      };

    } finally {
      await coordinator.cleanup();
    }
  }
}
```
    await this.rampDown(virtualUsers);
    
    const endTime = new Date();
    
    return {
      testId,
      testName: config.name,
      startTime,
      endTime,
      duration: endTime.getTime() - startTime.getTime(),
      metrics: this.calculateMetrics(results),
      timeSeries: this.metricsCollector.getTimeSeries(),
      errors: results.errors,
      thresholdResults: this.evaluateThresholds(results, config.thresholds)
    };
  }

  private async executeSteadyState(
    virtualUsers: VirtualUser[],
    scenarios: TestScenario[],
    duration: number
  ): Promise<ExecutionResults> {
    const endTime = Date.now() + duration * 1000;
    const results: RequestResult[] = [];
    const errors: TestError[] = [];

    while (Date.now() < endTime) {
      const promises = virtualUsers.map(async (user) => {
        const scenario = this.selectScenario(scenarios);
        try {
          const result = await this.executeScenario(user, scenario);
          results.push(result);
          this.metricsCollector.record(result);
        } catch (error) {
          errors.push({
            userId: user.id,
            scenario: scenario.name,
            error: (error as Error).message,
            timestamp: new Date()
          });
        }
      });

      await Promise.all(promises);
      await this.sleep(100); // Pacing
    }

    return { results, errors };
  }

  private calculateMetrics(results: ExecutionResults): MetricsSummary {
    const responseTimes = results.results.map(r => r.responseTime);
    const sorted = [...responseTimes].sort((a, b) => a - b);
    
    return {
      totalRequests: results.results.length,
      successfulRequests: results.results.filter(r => r.success).length,
      failedRequests: results.results.filter(r => !r.success).length,
      errorRate: results.errors.length / results.results.length,
      responseTime: {
        min: Math.min(...responseTimes),
        max: Math.max(...responseTimes),
        avg: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length,
        p50: sorted[Math.floor(sorted.length * 0.5)],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)]
      },
      throughput: results.results.length / (this.testDuration / 1000)
    };
  }
}
```


### Stress Test Service

```typescript
class StressTestService {
  async runStressTest(config: StressTestConfig): Promise<StressTestResults> {
    const results: StageResult[] = [];
    let currentUsers = config.initialUsers;
    let systemBroken = false;
    let breakingPoint: number | null = null;

    while (currentUsers <= config.maxUsers && !systemBroken) {
      const stageResult = await this.executeStage(currentUsers, config);
      results.push(stageResult);

      // Check if system has reached breaking point
      if (this.isSystemBroken(stageResult, config.breakingPointCriteria)) {
        systemBroken = true;
        breakingPoint = currentUsers;
      } else {
        currentUsers += config.userIncrement;
      }

      // Recovery period between stages
      await this.sleep(config.recoveryPeriod * 1000);
    }

    return {
      stages: results,
      breakingPoint,
      maxSustainableLoad: breakingPoint 
        ? breakingPoint - config.userIncrement 
        : currentUsers - config.userIncrement,
      recommendations: this.generateRecommendations(results)
    };
  }

  private isSystemBroken(
    result: StageResult,
    criteria: BreakingPointCriteria
  ): boolean {
    return (
      result.errorRate > criteria.maxErrorRate ||
      result.responseTime.p95 > criteria.maxResponseTime ||
      result.throughput < criteria.minThroughput
    );
  }

  private generateRecommendations(results: StageResult[]): string[] {
    const recommendations: string[] = [];
    
    // Analyze response time degradation
    const responseTimeTrend = this.analyzeResponseTimeTrend(results);
    if (responseTimeTrend.degradationRate > 0.1) {
      recommendations.push(
        `Response time degrades ${(responseTimeTrend.degradationRate * 100).toFixed(1)}% per 100 users. ` +
        'Consider optimizing database queries or adding caching.'
      );
    }

    // Analyze error patterns
    const errorPatterns = this.analyzeErrorPatterns(results);
    if (errorPatterns.connectionErrors > 0.5) {
      recommendations.push(
        'High connection error rate detected. Consider increasing connection pool size.'
      );
    }

    return recommendations;
  }
}
```

### Scalability Test Service

```typescript
class ScalabilityTestService {
  async runScalabilityTest(config: ScalabilityTestConfig): Promise<ScalabilityResults> {
    const horizontalResults = await this.testHorizontalScaling(config);
    const verticalResults = await this.testVerticalScaling(config);
    
    return {
      horizontal: horizontalResults,
      vertical: verticalResults,
      scalabilityIndex: this.calculateScalabilityIndex(horizontalResults, verticalResults),
      costEfficiency: this.calculateCostEfficiency(horizontalResults, verticalResults),
      recommendations: this.generateScalabilityRecommendations(horizontalResults, verticalResults)
    };
  }

  private async testHorizontalScaling(
    config: ScalabilityTestConfig
  ): Promise<HorizontalScalingResults> {
    const results: InstanceScaleResult[] = [];
    
    for (let instances = 1; instances <= config.maxInstances; instances++) {
      // Scale infrastructure
      await this.scaleInstances(instances);
      await this.waitForHealthy(instances);
      
      // Run load test at each scale level
      const loadResult = await this.runLoadAtScale(config.baseLoad * instances);
      
      results.push({
        instances,
        throughput: loadResult.metrics.throughput,
        responseTime: loadResult.metrics.responseTime,
        efficiency: loadResult.metrics.throughput / (config.baseLoad * instances)
      });
    }

    return {
      results,
      linearScalingFactor: this.calculateLinearScalingFactor(results),
      optimalInstanceCount: this.findOptimalInstanceCount(results)
    };
  }

  private calculateScalabilityIndex(
    horizontal: HorizontalScalingResults,
    vertical: VerticalScalingResults
  ): number {
    // Scalability index: 1.0 = perfect linear scaling
    const horizontalEfficiency = horizontal.linearScalingFactor;
    const verticalEfficiency = vertical.linearScalingFactor;
    
    return (horizontalEfficiency + verticalEfficiency) / 2;
  }
}
```


## Instructions

### 1. Configure Performance Testing Environment

Set up your performance testing infrastructure with distributed execution capabilities:

```bash
# Install performance testing tools
npm install -g k6 artillery
pip install locust

# Set up monitoring infrastructure
docker-compose up -d prometheus grafana

# Configure test data and environments
export PERFORMANCE_TEST_ENV=staging
export TARGET_BASE_URL=https://api.staging.example.com
export DATADOG_API_KEY=your_api_key
```

### 2. Define Performance Test Strategy

Create comprehensive test scenarios covering different performance aspects:

```typescript
// Define performance objectives
const performanceObjectives = {
  responseTime: { p95: 500, p99: 1000 },
  throughput: { min: 1000 },
  errorRate: { max: 0.01 },
  availability: { min: 99.9 }
};

// Configure test scenarios
const testScenarios = [
  { name: 'load-test', users: 100, duration: '10m' },
  { name: 'stress-test', users: 500, rampUp: '5m' },
  { name: 'spike-test', users: 1000, duration: '2m' },
  { name: 'endurance-test', users: 200, duration: '2h' }
];
```

### 3. Implement AI-Driven Analysis

Configure machine learning models for intelligent performance analysis:

```typescript
// Set up AI analysis configuration
const aiConfig = {
  models: ['anomaly-detection', 'pattern-recognition', 'prediction'],
  features: ['response-time', 'throughput', 'error-rate', 'resource-usage'],
  training: { historicalData: '30d', retraining: 'weekly' }
};

// Enable real-time adaptation
const adaptationConfig = {
  triggers: ['anomaly-detected', 'threshold-exceeded'],
  actions: ['scale-load', 'adjust-parameters', 'enable-circuit-breaker']
};
```

### 4. Execute Distributed Performance Tests

Run coordinated tests across multiple nodes with intelligent orchestration:

```typescript
// Configure distributed execution
const distributedConfig = {
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  nodesPerRegion: 3,
  coordination: 'synchronized',
  loadBalancing: 'intelligent'
};

// Execute performance campaign
const campaign = await performanceOrchestrator.execute({
  strategy: 'adaptive',
  scenarios: testScenarios,
  distribution: distributedConfig,
  monitoring: { realTime: true, aiAnalysis: true }
});
```

### 5. Integrate with Chaos Engineering

Combine performance testing with resilience testing and failure injection:

```typescript
// Configure chaos-performance integration
const chaosConfig = {
  experiments: ['network-latency', 'service-failure', 'resource-exhaustion'],
  timing: 'during-peak-load',
  safetyMechanisms: ['blast-radius-control', 'automatic-rollback']
};

// Execute chaos-performance tests
const chaosResults = await chaosIntegrator.execute({
  performanceBaseline: campaign.results,
  chaosExperiments: chaosConfig.experiments,
  resilience: { testing: true, validation: true }
});
```

### 6. Monitor and Analyze Results

Implement comprehensive monitoring with real-time analysis and automated optimization:

```typescript
// Set up monitoring dashboard
const monitoring = {
  metrics: ['response-time', 'throughput', 'error-rate', 'resource-usage'],
  alerts: { critical: true, predictive: true },
  dashboards: ['real-time', 'historical', 'comparison']
};

// Generate intelligent recommendations
const recommendations = await aiAnalyzer.generateRecommendations({
  results: campaign.results,
  patterns: campaign.patterns,
  predictions: campaign.predictions
});
```

## Implementation Patterns

### K6 Load Test Pattern

```javascript
// k6-load-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const responseTime = new Trend('response_time');

export const options = {
  stages: [
    { duration: '2m', target: 100 },  // Ramp up
    { duration: '5m', target: 100 },  // Steady state
    { duration: '2m', target: 200 },  // Spike
    { duration: '5m', target: 200 },  // Steady at peak
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    errors: ['rate<0.01'],
    http_req_failed: ['rate<0.01'],
  },
};

export default function () {
  const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
  
  // Login scenario
  const loginRes = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({
    email: 'test@example.com',
    password: 'password123'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'has token': (r) => r.json('token') !== undefined,
  });

  errorRate.add(loginRes.status !== 200);
  responseTime.add(loginRes.timings.duration);

  if (loginRes.status === 200) {
    const token = loginRes.json('token');
    
    // API calls with authentication
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };

    // Get user profile
    const profileRes = http.get(`${baseUrl}/api/users/me`, { headers });
    check(profileRes, {
      'profile loaded': (r) => r.status === 200,
    });

    // List products
    const productsRes = http.get(`${baseUrl}/api/products?limit=20`, { headers });
    check(productsRes, {
      'products loaded': (r) => r.status === 200,
      'has products': (r) => r.json('data').length > 0,
    });
  }

  sleep(1);
}
```

### Artillery Test Pattern

```yaml
# artillery-config.yaml
config:
  target: "{{ $processEnvironment.BASE_URL }}"
  phases:
    - duration: 120
      arrivalRate: 10
      name: "Warm up"
    - duration: 300
      arrivalRate: 50
      name: "Sustained load"
    - duration: 120
      arrivalRate: 100
      name: "Peak load"
  defaults:
    headers:
      Content-Type: "application/json"
  plugins:
    expect: {}
    metrics-by-endpoint: {}

scenarios:
  - name: "User journey"
    weight: 70
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "{{ $randomString(8) }}@test.com"
            password: "password123"
          capture:
            - json: "$.token"
              as: "authToken"
          expect:
            - statusCode: 200
      - get:
          url: "/api/products"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
      - post:
          url: "/api/cart/items"
          headers:
            Authorization: "Bearer {{ authToken }}"
          json:
            productId: "{{ $randomString(10) }}"
            quantity: 1
          expect:
            - statusCode: 201

  - name: "Browse only"
    weight: 30
    flow:
      - get:
          url: "/api/products"
          expect:
            - statusCode: 200
      - get:
          url: "/api/products/{{ $randomString(10) }}"
          expect:
            - statusCode:
                - 200
                - 404
```


## Integration Points

### Monitoring Integration

```typescript
interface PerformanceMonitoringIntegration {
  collectMetrics(testId: string): Promise<SystemMetrics>;
  correlateWithAPM(testResults: PerformanceResults): Promise<CorrelatedResults>;
  exportToGrafana(results: PerformanceResults): Promise<void>;
  createAlerts(thresholds: PerformanceThreshold[]): Promise<Alert[]>;
}

class DatadogPerformanceIntegration implements PerformanceMonitoringIntegration {
  private client: DatadogClient;

  async collectMetrics(testId: string): Promise<SystemMetrics> {
    const timeRange = await this.getTestTimeRange(testId);
    
    const [cpuMetrics, memoryMetrics, networkMetrics] = await Promise.all([
      this.client.query(`avg:system.cpu.user{test_id:${testId}}`, timeRange),
      this.client.query(`avg:system.mem.used{test_id:${testId}}`, timeRange),
      this.client.query(`sum:system.net.bytes_rcvd{test_id:${testId}}`, timeRange)
    ]);

    return {
      cpu: this.processMetricSeries(cpuMetrics),
      memory: this.processMetricSeries(memoryMetrics),
      network: this.processMetricSeries(networkMetrics)
    };
  }

  async correlateWithAPM(testResults: PerformanceResults): Promise<CorrelatedResults> {
    const traces = await this.client.getTraces({
      start: testResults.startTime,
      end: testResults.endTime,
      service: this.serviceName
    });

    const slowTraces = traces.filter(t => t.duration > testResults.metrics.responseTime.p95);
    const errorTraces = traces.filter(t => t.error);

    return {
      testResults,
      apmCorrelation: {
        totalTraces: traces.length,
        slowTraces: slowTraces.length,
        errorTraces: errorTraces.length,
        topSlowEndpoints: this.groupByEndpoint(slowTraces).slice(0, 10),
        topErrorEndpoints: this.groupByEndpoint(errorTraces).slice(0, 10)
      }
    };
  }
}
```

### CI/CD Integration

```typescript
class PerformanceCIIntegration {
  async runPerformanceGate(
    config: PerformanceGateConfig
  ): Promise<GateResult> {
    // Run performance test
    const results = await this.performanceTestManager.runTest(config.test);
    
    // Compare with baseline
    const baseline = await this.getBaseline(config.baselineId);
    const comparison = this.compareWithBaseline(results, baseline);
    
    // Evaluate gate criteria
    const gateResult = this.evaluateGate(comparison, config.criteria);
    
    // Store results for future baseline
    if (gateResult.passed && config.updateBaseline) {
      await this.updateBaseline(config.baselineId, results);
    }
    
    // Generate report
    const report = await this.generateReport(results, comparison, gateResult);
    
    return {
      passed: gateResult.passed,
      results,
      comparison,
      report,
      recommendations: gateResult.recommendations
    };
  }

  private compareWithBaseline(
    current: PerformanceResults,
    baseline: PerformanceResults
  ): BaselineComparison {
    return {
      responseTime: {
        p50Change: this.percentChange(
          baseline.metrics.responseTime.p50,
          current.metrics.responseTime.p50
        ),
        p95Change: this.percentChange(
          baseline.metrics.responseTime.p95,
          current.metrics.responseTime.p95
        ),
        p99Change: this.percentChange(
          baseline.metrics.responseTime.p99,
          current.metrics.responseTime.p99
        )
      },
      throughputChange: this.percentChange(
        baseline.metrics.throughput,
        current.metrics.throughput
      ),
      errorRateChange: this.percentChange(
        baseline.metrics.errorRate,
        current.metrics.errorRate
      )
    };
  }
}
```

## Security Considerations

### Secure Test Execution

```typescript
class SecurePerformanceTestRunner {
  async runSecureTest(config: LoadTestConfig): Promise<PerformanceResults> {
    // Validate test target is in allowed list
    this.validateTargetUrl(config.targetUrl);
    
    // Use secure credentials
    const credentials = await this.secretsManager.getTestCredentials();
    
    // Rate limit to prevent accidental DDoS
    const rateLimitedConfig = this.applyRateLimits(config);
    
    // Run test with audit logging
    const testId = crypto.randomUUID();
    await this.auditLogger.logTestStart(testId, config);
    
    try {
      const results = await this.loadTestService.runLoadTest(rateLimitedConfig);
      await this.auditLogger.logTestComplete(testId, results);
      return results;
    } catch (error) {
      await this.auditLogger.logTestError(testId, error as Error);
      throw error;
    }
  }

  private validateTargetUrl(url: string): void {
    const allowedDomains = process.env.ALLOWED_TEST_DOMAINS?.split(',') || [];
    const urlObj = new URL(url);
    
    if (!allowedDomains.includes(urlObj.hostname)) {
      throw new Error(`Target domain ${urlObj.hostname} is not in allowed list`);
    }
  }

  private applyRateLimits(config: LoadTestConfig): LoadTestConfig {
    const maxUsers = parseInt(process.env.MAX_VIRTUAL_USERS || '1000');
    const maxDuration = parseInt(process.env.MAX_TEST_DURATION || '3600');
    
    return {
      ...config,
      virtualUsers: Math.min(config.virtualUsers, maxUsers),
      duration: Math.min(config.duration, maxDuration)
    };
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Performance Testing Properties', () => {
  it('should calculate percentiles correctly for any response time distribution', () => {
    fc.assert(fc.property(
      fc.array(fc.integer({ min: 1, max: 10000 }), { minLength: 100, maxLength: 1000 }),
      (responseTimes) => {
        const metrics = calculateMetrics(responseTimes);
        
        // P50 should be less than or equal to P95
        expect(metrics.p50).toBeLessThanOrEqual(metrics.p95);
        
        // P95 should be less than or equal to P99
        expect(metrics.p95).toBeLessThanOrEqual(metrics.p99);
        
        // P99 should be less than or equal to max
        expect(metrics.p99).toBeLessThanOrEqual(metrics.max);
        
        // Min should be less than or equal to P50
        expect(metrics.min).toBeLessThanOrEqual(metrics.p50);
        
        return true;
      }
    ));
  });

  it('should detect breaking point when error rate exceeds threshold', () => {
    fc.assert(fc.property(
      fc.array(
        fc.record({
          users: fc.integer({ min: 10, max: 1000 }),
          errorRate: fc.float({ min: 0, max: 1 })
        }),
        { minLength: 5, maxLength: 20 }
      ),
      (stageResults) => {
        const threshold = 0.05; // 5% error rate threshold
        const breakingPoint = findBreakingPoint(stageResults, threshold);
        
        if (breakingPoint !== null) {
          const breakingStage = stageResults.find(s => s.users === breakingPoint);
          expect(breakingStage?.errorRate).toBeGreaterThan(threshold);
        }
        
        return true;
      }
    ));
  });
});
```

## Expected Output

### Performance Test Results

```json
{
  "campaignId": "perf-campaign-2024-001",
  "success": true,
  "duration": 1800000,
  "testPlan": {
    "objectives": ["response-time", "throughput", "scalability"],
    "optimizedParameters": {
      "virtualUsers": 500,
      "rampUpTime": 300,
      "testDuration": 1200
    }
  },
  "executionResults": {
    "executionNodes": 5,
    "totalVirtualUsers": 500,
    "duration": 1200000,
    "aggregatedMetrics": {
      "responseTime": {
        "p50": 245,
        "p95": 480,
        "p99": 750
      },
      "throughput": 1250,
      "errorRate": 0.008
    }
  },
  "aiAnalysis": {
    "patterns": [
      {
        "type": "response-time-degradation",
        "confidence": 0.92,
        "impact": "medium",
        "recommendation": "Optimize database queries during peak load"
      }
    ],
    "anomalies": [
      {
        "type": "throughput-spike",
        "timestamp": "2024-02-03T10:15:00Z",
        "severity": "low",
        "rootCause": "Cache warming effect"
      }
    ],
    "predictions": [
      {
        "metric": "response-time",
        "forecast": "15% increase at 750 concurrent users",
        "confidence": 0.87,
        "timeHorizon": "next-30-days"
      }
    ]
  },
  "optimizationResults": {
    "candidates": 12,
    "optimalConfigurations": [
      {
        "name": "database-connection-pool",
        "currentValue": 50,
        "recommendedValue": 75,
        "expectedImprovement": "12% response time reduction"
      }
    ],
    "expectedImprovements": {
      "responseTime": "-15%",
      "throughput": "+8%",
      "resourceUtilization": "-5%"
    }
  },
  "recommendations": [
    "Implement database connection pooling optimization",
    "Add Redis caching layer for frequently accessed data",
    "Configure auto-scaling based on response time thresholds",
    "Implement circuit breaker pattern for external service calls"
  ]
}
```

### Real-Time Monitoring Dashboard

```typescript
interface PerformanceMonitoringDashboard {
  realTimeMetrics: {
    responseTime: { current: 245, trend: "stable", p95: 480 };
    throughput: { current: 1250, trend: "increasing", target: 1000 };
    errorRate: { current: 0.008, trend: "decreasing", threshold: 0.01 };
    activeUsers: { current: 450, peak: 500, distribution: "global" };
  };
  
  adaptiveActions: [
    {
      timestamp: "2024-02-03T10:20:00Z",
      trigger: "response-time-threshold-exceeded",
      action: "increased-think-time",
      result: "response-time-normalized"
    }
  ];
  
  aiInsights: [
    {
      type: "performance-prediction",
      message: "System approaching capacity at current load trajectory",
      confidence: 0.89,
      recommendedAction: "Scale horizontally within 10 minutes"
    }
  ];
}
```

### Chaos-Performance Integration Results

```json
{
  "integrationId": "chaos-perf-integration-001",
  "baselineMetrics": {
    "responseTime": { "p95": 450 },
    "throughput": 1200,
    "errorRate": 0.005
  },
  "chaosExperiments": [
    {
      "name": "network-latency-under-load",
      "type": "network-chaos",
      "parameters": { "latency": "100ms", "duration": "5m" },
      "impact": {
        "responseTime": { "p95": 680, "degradation": "51%" },
        "throughput": 950,
        "errorRate": 0.012
      },
      "resilienceScore": 0.75
    }
  ],
  "resilienceGaps": [
    {
      "area": "network-resilience",
      "severity": "medium",
      "description": "Response time degrades significantly under network latency",
      "recommendation": "Implement request timeout and retry mechanisms"
    }
  ],
  "overallResilienceScore": 0.82
}
```

## Integration Points

### CI/CD Pipeline Integration

```yaml
# .github/workflows/performance-testing.yml
name: Performance Testing Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  performance-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Performance Testing
        run: |
          npm install -g k6
          docker-compose up -d monitoring
          
      - name: Run Performance Tests
        run: |
          k6 run --out json=results.json performance-tests/load-test.js
          
      - name: AI Analysis
        run: |
          node scripts/ai-performance-analysis.js results.json
          
      - name: Performance Gate
        run: |
          node scripts/performance-gate.js --baseline=baseline.json --current=results.json
          
      - name: Upload Results
        uses: actions/upload-artifact@v3
        with:
          name: performance-results
          path: |
            results.json
            performance-report.html
            ai-analysis.json
```

### Monitoring Platform Integration

```typescript
// Integration with monitoring platforms
interface MonitoringIntegration {
  datadog: {
    apiKey: string;
    dashboardId: string;
    customMetrics: string[];
  };
  
  newRelic: {
    licenseKey: string;
    applicationId: string;
    alertPolicies: string[];
  };
  
  prometheus: {
    endpoint: string;
    scrapeInterval: string;
    alertmanager: string;
  };
}

// Real-time correlation with APM data
const apmCorrelation = {
  traces: {
    slowQueries: ["SELECT * FROM users WHERE...", "UPDATE orders SET..."],
    errorSpikes: ["Connection timeout", "Database lock timeout"],
    resourceBottlenecks: ["CPU: 85%", "Memory: 92%", "Disk I/O: 78%"]
  },
  
  recommendations: [
    "Optimize slow database queries identified during load test",
    "Implement connection pooling for database connections",
    "Add caching layer for frequently accessed user data"
  ]
};
```

## Security Considerations

### Secure Performance Testing

```typescript
interface SecurePerformanceTestConfig {
  targetValidation: {
    allowedDomains: string[];
    requiresAuthorization: boolean;
    testingAgreement: boolean;
  };
  
  dataProtection: {
    syntheticData: boolean;
    piiRedaction: boolean;
    encryptionInTransit: boolean;
  };
  
  rateLimiting: {
    maxVirtualUsers: number;
    maxTestDuration: number;
    respectRobotsTxt: boolean;
  };
  
  auditLogging: {
    enabled: boolean;
    includeRequestData: boolean;
    retentionPeriod: string;
  };
}

// Secure test execution with audit trail
const secureExecution = {
  preTestValidation: [
    "Verify target authorization",
    "Validate test parameters within limits",
    "Check for production environment safeguards"
  ],
  
  duringTest: [
    "Monitor for excessive error rates",
    "Respect rate limiting and backoff",
    "Log all test activities with timestamps"
  ],
  
  postTest: [
    "Clean up test data",
    "Archive results securely",
    "Generate compliance report"
  ]
};
```

## Performance Features

### Intelligent Load Distribution

```typescript
interface IntelligentLoadDistribution {
  geographicDistribution: {
    regions: ["us-east-1", "eu-west-1", "ap-southeast-1"];
    loadPercentage: [40, 35, 25];
    latencySimulation: boolean;
  };
  
  adaptiveScaling: {
    enabled: boolean;
    triggers: ["response-time", "error-rate", "resource-usage"];
    scalingPolicy: "predictive" | "reactive";
  };
  
  intelligentPacing: {
    aiDriven: boolean;
    baselineAdjustment: boolean;
    realTimeOptimization: boolean;
  };
}

// Machine learning-driven test optimization
const mlOptimization = {
  parameterTuning: {
    virtualUsers: { min: 50, max: 1000, optimal: 450 },
    rampUpTime: { min: 60, max: 600, optimal: 240 },
    thinkTime: { min: 1, max: 10, optimal: 3.5 }
  },
  
  predictiveScaling: {
    forecastHorizon: "15-minutes",
    accuracy: 0.87,
    confidenceInterval: 0.95
  },
  
  anomalyDetection: {
    sensitivity: "high",
    falsePositiveRate: 0.02,
    responseTime: "sub-second"
  }
};
```

## Configuration Examples

### Performance Test Configuration

```yaml
# performance-test-config.yaml
tests:
  load:
    name: "Standard Load Test"
    virtualUsers: 100
    rampUpTime: 120
    duration: 600
    thresholds:
      - metric: response_time_p95
        operator: lt
        value: 500
      - metric: error_rate
        operator: lt
        value: 0.01

  stress:
    name: "Stress Test"
    initialUsers: 50
    maxUsers: 500
    userIncrement: 50
    stageDuration: 300
    breakingPointCriteria:
      maxErrorRate: 0.05
      maxResponseTime: 2000

  scalability:
    name: "Scalability Test"
    baseLoad: 100
    maxInstances: 5
    testDurationPerScale: 300

reporting:
  format: html
  outputPath: ./reports
  includeCharts: true
  
monitoring:
  enabled: true
  provider: datadog
  dashboardId: "perf-test-dashboard"
```
