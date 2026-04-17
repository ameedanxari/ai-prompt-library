# Multi-Cloud Deployment Strategies Template

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

This template provides comprehensive patterns for implementing multi-cloud deployment strategies including intelligent cloud provider orchestration, cross-cloud application deployment, hybrid cloud coordination, and AI-driven multi-cloud optimization. It covers enterprise-scale multi-cloud systems with smart resource allocation, cost optimization, and resilience management.

## Context

Multi-cloud deployment enables organizations to leverage the best services from multiple cloud providers while avoiding vendor lock-in and improving resilience. This template addresses the complexity of deploying applications across multiple cloud platforms including provider abstraction, data synchronization, network coordination, and intelligent workload placement with AI-driven optimization.

## Examples

### Example 1: Intelligent Multi-Cloud Orchestration Framework
```typescript
// Advanced multi-cloud deployment orchestration framework
interface MultiCloudOrchestrationConfig {
  cloudProviders: CloudProviderConfig[];
  workloadOrchestration: WorkloadOrchestrationConfig;
  dataManagement: MultiCloudDataConfig;
  networkCoordination: NetworkCoordinationConfig;
  costOptimization: MultiCloudCostConfig;
  resilienceManagement: ResilienceManagementConfig;
}

interface CloudProviderConfig {
  providerId: string;
  regions: CloudRegion[];
  services: CloudService[];
  capabilities: CloudCapability[];
  costProfile: CostProfile;
  performanceProfile: PerformanceProfile;
}

class MultiCloudOrchestrationFramework {
  private cloudProviderManager: CloudProviderManager;
  private workloadOrchestrator: MultiCloudWorkloadOrchestrator;
  private dataCoordinator: MultiCloudDataCoordinator;
  private networkCoordinator: MultiCloudNetworkCoordinator;
  private costOptimizer: MultiCloudCostOptimizer;
  private resilienceManager: MultiCloudResilienceManager;

  constructor(config: MultiCloudOrchestrationConfig) {
    this.cloudProviderManager = new CloudProviderManager(config.cloudProviders);
    this.workloadOrchestrator = new MultiCloudWorkloadOrchestrator(config.workloadOrchestration);
    this.dataCoordinator = new MultiCloudDataCoordinator(config.dataManagement);
    this.networkCoordinator = new MultiCloudNetworkCoordinator(config.networkCoordination);
    this.costOptimizer = new MultiCloudCostOptimizer(config.costOptimization);
    this.resilienceManager = new MultiCloudResilienceManager(config.resilienceManagement);
  }

  // Execute intelligent multi-cloud deployment campaign
  async executeMultiCloudDeployment(deployment: MultiCloudDeployment): Promise<MultiCloudDeploymentResult> {
    const deploymentId = this.generateDeploymentId();
    const startTime = Date.now();

    try {
      // 1. Analyze multi-cloud requirements and constraints
      const requirementsAnalysis = await this.analyzeMultiCloudRequirements(deployment);
      
      // 2. Intelligent cloud provider selection and workload placement
      const providerPlacement = await this.optimizeProviderPlacement(deployment, requirementsAnalysis);
      
      // 3. Multi-cloud network coordination and connectivity
      const networkCoordination = await this.coordinateMultiCloudNetwork(providerPlacement);
      
      // 4. Cross-cloud data management and synchronization
      const dataManagement = await this.manageMultiCloudData(networkCoordination);
      
      // 5. Multi-cloud application deployment and orchestration
      const applicationDeployment = await this.deployMultiCloudApplications(dataManagement);
      
      // 6. Resilience management and disaster recovery
      const resilienceManagement = await this.manageMultiCloudResilience(applicationDeployment);

      return {
        deploymentId,
        success: true,
        duration: Date.now() - startTime,
        requirementsAnalysis,
        providerPlacement,
        networkCoordination,
        dataManagement,
        applicationDeployment,
        resilienceManagement,
        cloudProviders: providerPlacement.selectedProviders.length,
        globalRegions: providerPlacement.deploymentRegions.length,
        costOptimization: await this.calculateCostOptimization(resilienceManagement),
        recommendations: this.generateIntelligentRecommendations(resilienceManagement)
      };

    } catch (error) {
      return {
        deploymentId,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        recommendations: ['Review multi-cloud deployment configuration and provider availability']
      };
    }
  }

  // Analyze multi-cloud requirements and constraints
  private async analyzeMultiCloudRequirements(deployment: MultiCloudDeployment): Promise<MultiCloudRequirementsAnalysis> {
    const analysisStartTime = Date.now();

    // Analyze application requirements and dependencies
    const applicationRequirements = await this.analyzeApplicationRequirements(deployment.applications);
    
    // Assess compliance and regulatory requirements
    const complianceRequirements = await this.assessComplianceRequirements(deployment.compliance);
    
    // Evaluate performance and latency requirements
    const performanceRequirements = await this.evaluatePerformanceRequirements(deployment.performance);
    
    // Analyze cost constraints and optimization objectives
    const costConstraints = await this.analyzeCostConstraints(deployment.budget);
    
    // Calculate optimal multi-cloud strategy
    const multiCloudStrategy = await this.calculateOptimalStrategy({
      applicationRequirements,
      complianceRequirements,
      performanceRequirements,
      costConstraints
    });

    return {
      analysisId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - analysisStartTime,
      applicationRequirements,
      complianceRequirements,
      performanceRequirements,
      costConstraints,
      multiCloudStrategy,
      complexityScore: this.calculateComplexityScore(applicationRequirements),
      riskAssessment: this.assessMultiCloudRisks(multiCloudStrategy)
    };
  }

  // Optimize cloud provider placement with AI
  private async optimizeProviderPlacement(
    deployment: MultiCloudDeployment,
    requirementsAnalysis: MultiCloudRequirementsAnalysis
  ): Promise<ProviderPlacementResult> {
    const placementStartTime = Date.now();

    // Analyze available cloud providers and capabilities
    const providerAnalysis = await this.workloadOrchestrator.analyzeProviders({
      requirements: requirementsAnalysis.applicationRequirements,
      compliance: requirementsAnalysis.complianceRequirements,
      performance: requirementsAnalysis.performanceRequirements,
      cost: requirementsAnalysis.costConstraints
    });

    // Use AI to optimize workload placement across providers
    const aiPlacement = await this.workloadOrchestrator.optimizePlacement({
      providers: providerAnalysis.availableProviders,
      workloads: deployment.workloads,
      strategy: requirementsAnalysis.multiCloudStrategy,
      constraints: deployment.constraints
    });

    // Generate deployment plan with failover strategies
    const deploymentPlan = await this.generateDeploymentPlan(aiPlacement);
    
    // Validate placement feasibility and compliance
    const placementValidation = await this.validatePlacement(deploymentPlan, requirementsAnalysis);

    return {
      placementId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - placementStartTime,
      providerAnalysis,
      aiPlacement,
      deploymentPlan,
      placementValidation,
      selectedProviders: deploymentPlan.providers,
      deploymentRegions: deploymentPlan.regions,
      expectedPerformance: this.calculateExpectedPerformance(deploymentPlan),
      costProjection: this.calculateCostProjection(deploymentPlan)
    };
  }

  // Coordinate multi-cloud network connectivity
  private async coordinateMultiCloudNetwork(
    providerPlacement: ProviderPlacementResult
  ): Promise<NetworkCoordinationResult> {
    const coordinationStartTime = Date.now();

    // Design multi-cloud network topology
    const networkTopology = await this.networkCoordinator.designTopology({
      providers: providerPlacement.selectedProviders,
      regions: providerPlacement.deploymentRegions,
      workloads: providerPlacement.deploymentPlan.workloads,
      performance: providerPlacement.expectedPerformance
    });

    // Configure cross-cloud connectivity and VPN
    const crossCloudConnectivity = await this.configureCrossCloudConnectivity(networkTopology);
    
    // Set up intelligent traffic routing and load balancing
    const trafficRouting = await this.configureIntelligentRouting(crossCloudConnectivity);
    
    // Configure network security and access controls
    const networkSecurity = await this.configureNetworkSecurity(trafficRouting);

    return {
      coordinationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - coordinationStartTime,
      networkTopology,
      crossCloudConnectivity,
      trafficRouting,
      networkSecurity,
      networkLatency: this.calculateNetworkLatency(networkTopology),
      bandwidth: this.calculateAvailableBandwidth(crossCloudConnectivity)
    };
  }
}

// Multi-cloud workload orchestrator
class MultiCloudWorkloadOrchestrator {
  private placementOptimizer: WorkloadPlacementOptimizer;
  private providerAbstraction: CloudProviderAbstraction;
  private deploymentEngine: MultiCloudDeploymentEngine;
  private migrationManager: WorkloadMigrationManager;

  constructor(config: WorkloadOrchestrationConfig) {
    this.placementOptimizer = new WorkloadPlacementOptimizer(config.placement);
    this.providerAbstraction = new CloudProviderAbstraction(config.abstraction);
    this.deploymentEngine = new MultiCloudDeploymentEngine(config.deployment);
    this.migrationManager = new WorkloadMigrationManager(config.migration);
  }

  // Optimize workload placement across cloud providers
  async optimizePlacement(context: PlacementContext): Promise<WorkloadPlacementOptimization> {
    const optimizationStartTime = Date.now();

    // Analyze workload characteristics and requirements
    const workloadAnalysis = await this.analyzeWorkloadCharacteristics(context.workloads);
    
    // Evaluate cloud provider capabilities and costs
    const providerEvaluation = await this.evaluateProviderCapabilities(context.providers);
    
    // Use AI to optimize placement decisions
    const aiOptimization = await this.placementOptimizer.optimizeWithAI({
      workloads: workloadAnalysis,
      providers: providerEvaluation,
      strategy: context.strategy,
      constraints: context.constraints
    });

    // Generate placement recommendations with alternatives
    const placementRecommendations = await this.generatePlacementRecommendations(aiOptimization);
    
    // Validate placement against compliance and performance requirements
    const placementValidation = await this.validatePlacementRecommendations(placementRecommendations);

    return {
      optimizationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - optimizationStartTime,
      workloadAnalysis,
      providerEvaluation,
      aiOptimization,
      placementRecommendations,
      placementValidation,
      confidence: this.calculateOptimizationConfidence(aiOptimization),
      alternatives: this.generateAlternativePlacements(placementRecommendations)
    };
  }

  // Analyze workload characteristics for optimal placement
  private async analyzeWorkloadCharacteristics(workloads: MultiCloudWorkload[]): Promise<WorkloadAnalysis> {
    const characteristics = await Promise.all(
      workloads.map(async workload => {
        const analysis = await this.analyzeIndividualWorkload(workload);
        return {
          workloadId: workload.id,
          name: workload.name,
          type: workload.type,
          resourceRequirements: analysis.resourceRequirements,
          performanceRequirements: analysis.performanceRequirements,
          dataRequirements: analysis.dataRequirements,
          complianceRequirements: analysis.complianceRequirements,
          dependencies: analysis.dependencies,
          scalingPatterns: analysis.scalingPatterns,
          costSensitivity: analysis.costSensitivity,
          latencyRequirements: analysis.latencyRequirements
        };
      })
    );

    return {
      workloads: characteristics,
      totalWorkloads: characteristics.length,
      complexityMatrix: this.calculateComplexityMatrix(characteristics),
      dependencyGraph: this.buildDependencyGraph(characteristics),
      placementConstraints: this.extractPlacementConstraints(characteristics)
    };
  }
}

// Multi-cloud data coordinator
class MultiCloudDataCoordinator {
  private dataReplicationManager: DataReplicationManager;
  private dataSynchronizer: MultiCloudDataSynchronizer;
  private dataGovernance: DataGovernanceManager;
  private dataSecurityManager: DataSecurityManager;

  constructor(config: MultiCloudDataConfig) {
    this.dataReplicationManager = new DataReplicationManager(config.replication);
    this.dataSynchronizer = new MultiCloudDataSynchronizer(config.synchronization);
    this.dataGovernance = new DataGovernanceManager(config.governance);
    this.dataSecurityManager = new DataSecurityManager(config.security);
  }

  // Manage multi-cloud data coordination
  async manageMultiCloudData(
    networkCoordination: NetworkCoordinationResult
  ): Promise<DataManagementResult> {
    const managementStartTime = Date.now();

    // Design data distribution and replication strategy
    const dataDistribution = await this.designDataDistribution({
      networkTopology: networkCoordination.networkTopology,
      connectivity: networkCoordination.crossCloudConnectivity,
      performance: networkCoordination.networkLatency
    });

    // Configure data synchronization mechanisms
    const dataSynchronization = await this.configureDataSynchronization(dataDistribution);
    
    // Set up data governance and compliance controls
    const dataGovernance = await this.configureDataGovernance(dataSynchronization);
    
    // Configure data security and encryption
    const dataSecurity = await this.configureDataSecurity(dataGovernance);

    return {
      managementId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - managementStartTime,
      dataDistribution,
      dataSynchronization,
      dataGovernance,
      dataSecurity,
      replicationLatency: this.calculateReplicationLatency(dataSynchronization),
      consistencyLevel: this.determineConsistencyLevel(dataSynchronization)
    };
  }

  // Design optimal data distribution strategy
  private async designDataDistribution(context: DataDistributionContext): Promise<DataDistributionStrategy> {
    // Analyze data access patterns and requirements
    const accessPatterns = await this.analyzeDataAccessPatterns(context);
    
    // Calculate optimal data placement
    const dataPlacement = await this.calculateOptimalDataPlacement({
      accessPatterns,
      networkTopology: context.networkTopology,
      performance: context.performance
    });

    // Design replication and backup strategies
    const replicationStrategy = await this.designReplicationStrategy(dataPlacement);
    
    // Configure data lifecycle management
    const lifecycleManagement = await this.configureDataLifecycle(replicationStrategy);

    return {
      strategyId: crypto.randomUUID(),
      accessPatterns,
      dataPlacement,
      replicationStrategy,
      lifecycleManagement,
      expectedPerformance: this.calculateDataPerformance(dataPlacement),
      costProjection: this.calculateDataCosts(replicationStrategy)
    };
  }
}

// Multi-cloud resilience manager
class MultiCloudResilienceManager {
  private failoverManager: MultiCloudFailoverManager;
  private disasterRecovery: DisasterRecoveryManager;
  private healthMonitor: MultiCloudHealthMonitor;
  private incidentManager: IncidentManager;

  constructor(config: ResilienceManagementConfig) {
    this.failoverManager = new MultiCloudFailoverManager(config.failover);
    this.disasterRecovery = new DisasterRecoveryManager(config.disasterRecovery);
    this.healthMonitor = new MultiCloudHealthMonitor(config.monitoring);
    this.incidentManager = new IncidentManager(config.incidentManagement);
  }

  // Manage multi-cloud resilience and disaster recovery
  async manageMultiCloudResilience(
    applicationDeployment: ApplicationDeploymentResult
  ): Promise<ResilienceManagementResult> {
    const resilienceStartTime = Date.now();

    // Configure intelligent failover mechanisms
    const failoverConfiguration = await this.configureIntelligentFailover({
      deployments: applicationDeployment.deployments,
      dataManagement: applicationDeployment.dataManagement,
      networkCoordination: applicationDeployment.networkCoordination
    });

    // Set up disaster recovery procedures
    const disasterRecoveryPlan = await this.configureDisasterRecovery(failoverConfiguration);
    
    // Configure health monitoring and alerting
    const healthMonitoring = await this.configureHealthMonitoring(disasterRecoveryPlan);
    
    // Set up incident management and response
    const incidentManagement = await this.configureIncidentManagement(healthMonitoring);

    return {
      resilienceId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - resilienceStartTime,
      failoverConfiguration,
      disasterRecoveryPlan,
      healthMonitoring,
      incidentManagement,
      resilienceScore: this.calculateResilienceScore(failoverConfiguration),
      recoveryTimeObjective: this.calculateRTO(disasterRecoveryPlan),
      recoveryPointObjective: this.calculateRPO(disasterRecoveryPlan)
    };
  }

  // Configure intelligent failover mechanisms
  private async configureIntelligentFailover(context: FailoverContext): Promise<FailoverConfiguration> {
    // Analyze failure scenarios and impact
    const failureScenarios = await this.analyzeFailureScenarios(context);
    
    // Design failover strategies for each scenario
    const failoverStrategies = await Promise.all(
      failureScenarios.map(async scenario => {
        const strategy = await this.designFailoverStrategy(scenario, context);
        return {
          scenarioId: scenario.id,
          scenario,
          strategy,
          expectedImpact: this.calculateFailoverImpact(strategy),
          recoveryTime: this.calculateRecoveryTime(strategy)
        };
      })
    );

    // Configure automated failover triggers
    const automatedTriggers = await this.configureAutomatedTriggers(failoverStrategies);
    
    // Set up failover testing and validation
    const failoverTesting = await this.configureFailoverTesting(failoverStrategies);

    return {
      configurationId: crypto.randomUUID(),
      failureScenarios,
      failoverStrategies,
      automatedTriggers,
      failoverTesting,
      overallResilience: this.calculateOverallResilience(failoverStrategies)
    };
  }
}
```

### Example 2: Cloud Provider Abstraction Layer
```typescript
// Cloud provider abstraction for unified multi-cloud operations
class CloudProviderAbstraction {
  private providerAdapters: Map<string, CloudProviderAdapter>;
  private serviceMapper: CloudServiceMapper;
  private resourceTranslator: ResourceTranslator;
  private costNormalizer: CostNormalizer;

  constructor(config: AbstractionConfig) {
    this.providerAdapters = this.initializeProviderAdapters(config.providers);
    this.serviceMapper = new CloudServiceMapper(config.serviceMapping);
    this.resourceTranslator = new ResourceTranslator(config.resourceMapping);
    this.costNormalizer = new CostNormalizer(config.costNormalization);
  }

  // Deploy application across multiple cloud providers with unified interface
  async deployMultiCloudApplication(deployment: MultiCloudApplicationDeployment): Promise<UnifiedDeploymentResult> {
    const deploymentStartTime = Date.now();

    // Translate application specification to provider-specific configurations
    const providerConfigurations = await this.translateToProviderConfigurations(deployment);
    
    // Execute deployments across all target providers
    const providerDeployments = await this.executeProviderDeployments(providerConfigurations);
    
    // Configure cross-provider networking and communication
    const crossProviderNetworking = await this.configureCrossProviderNetworking(providerDeployments);
    
    // Set up unified monitoring and management
    const unifiedManagement = await this.configureUnifiedManagement(providerDeployments);

    return {
      deploymentId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - deploymentStartTime,
      providerConfigurations,
      providerDeployments,
      crossProviderNetworking,
      unifiedManagement,
      deployedProviders: providerDeployments.length,
      totalResources: this.countTotalResources(providerDeployments),
      unifiedEndpoints: this.generateUnifiedEndpoints(crossProviderNetworking)
    };
  }

  // Translate application specification to provider-specific configurations
  private async translateToProviderConfigurations(
    deployment: MultiCloudApplicationDeployment
  ): Promise<ProviderConfiguration[]> {
    const configurations = [];

    for (const targetProvider of deployment.targetProviders) {
      const adapter = this.providerAdapters.get(targetProvider.providerId);
      
      if (!adapter) {
        throw new Error(`No adapter found for provider: ${targetProvider.providerId}`);
      }

      // Translate application components to provider-specific resources
      const translatedResources = await this.resourceTranslator.translateResources({
        application: deployment.application,
        targetProvider: targetProvider,
        requirements: deployment.requirements
      });

      // Map services to provider-specific equivalents
      const mappedServices = await this.serviceMapper.mapServices({
        services: deployment.application.services,
        targetProvider: targetProvider,
        capabilities: targetProvider.capabilities
      });

      // Generate provider-specific deployment configuration
      const providerConfig = await adapter.generateDeploymentConfiguration({
        resources: translatedResources,
        services: mappedServices,
        networking: deployment.networking,
        security: deployment.security
      });

      configurations.push({
        providerId: targetProvider.providerId,
        providerName: targetProvider.name,
        region: targetProvider.region,
        configuration: providerConfig,
        estimatedCost: await this.costNormalizer.estimateCost(providerConfig, targetProvider),
        deploymentComplexity: this.calculateDeploymentComplexity(providerConfig)
      });
    }

    return configurations;
  }

  // Execute deployments across multiple providers
  private async executeProviderDeployments(
    configurations: ProviderConfiguration[]
  ): Promise<ProviderDeploymentResult[]> {
    const deploymentPromises = configurations.map(async config => {
      const adapter = this.providerAdapters.get(config.providerId);
      const deploymentStartTime = Date.now();

      try {
        const deploymentResult = await adapter.deployApplication(config.configuration);
        
        return {
          providerId: config.providerId,
          providerName: config.providerName,
          region: config.region,
          success: true,
          duration: Date.now() - deploymentStartTime,
          deploymentResult,
          resources: deploymentResult.resources,
          endpoints: deploymentResult.endpoints,
          actualCost: await this.costNormalizer.calculateActualCost(deploymentResult, config)
        };

      } catch (error) {
        return {
          providerId: config.providerId,
          providerName: config.providerName,
          region: config.region,
          success: false,
          duration: Date.now() - deploymentStartTime,
          error: error.message,
          resources: [],
          endpoints: [],
          actualCost: 0
        };
      }
    });

    return await Promise.all(deploymentPromises);
  }
}

// AWS Provider Adapter
class AWSProviderAdapter implements CloudProviderAdapter {
  private cloudFormation: AWS.CloudFormation;
  private ecs: AWS.ECS;
  private lambda: AWS.Lambda;
  private rds: AWS.RDS;

  constructor(config: AWSConfig) {
    AWS.config.update({
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
      region: config.region
    });

    this.cloudFormation = new AWS.CloudFormation();
    this.ecs = new AWS.ECS();
    this.lambda = new AWS.Lambda();
    this.rds = new AWS.RDS();
  }

  async deployApplication(configuration: ProviderDeploymentConfiguration): Promise<DeploymentResult> {
    const deploymentStartTime = Date.now();

    // Generate CloudFormation template
    const cloudFormationTemplate = this.generateCloudFormationTemplate(configuration);
    
    // Deploy infrastructure using CloudFormation
    const stackResult = await this.deployCloudFormationStack(cloudFormationTemplate);
    
    // Deploy application components
    const applicationDeployment = await this.deployApplicationComponents(configuration, stackResult);
    
    // Configure monitoring and logging
    const monitoring = await this.configureMonitoring(applicationDeployment);

    return {
      deploymentId: stackResult.StackId,
      timestamp: Date.now(),
      duration: Date.now() - deploymentStartTime,
      infrastructure: stackResult,
      application: applicationDeployment,
      monitoring,
      resources: this.extractResources(stackResult, applicationDeployment),
      endpoints: this.extractEndpoints(applicationDeployment)
    };
  }

  private generateCloudFormationTemplate(configuration: ProviderDeploymentConfiguration): CloudFormationTemplate {
    const template = {
      AWSTemplateFormatVersion: '2010-09-09',
      Description: 'Multi-cloud application deployment - AWS resources',
      Parameters: {},
      Resources: {},
      Outputs: {}
    };

    // Generate VPC and networking resources
    if (configuration.networking.vpc) {
      template.Resources['VPC'] = {
        Type: 'AWS::EC2::VPC',
        Properties: {
          CidrBlock: configuration.networking.vpc.cidrBlock,
          EnableDnsHostnames: true,
          EnableDnsSupport: true,
          Tags: [
            { Key: 'Name', Value: `${configuration.applicationName}-vpc` },
            { Key: 'Environment', Value: configuration.environment }
          ]
        }
      };
    }

    // Generate compute resources
    for (const service of configuration.services) {
      if (service.type === 'container') {
        this.addECSService(template, service);
      } else if (service.type === 'serverless') {
        this.addLambdaFunction(template, service);
      }
    }

    // Generate database resources
    for (const database of configuration.databases || []) {
      this.addRDSDatabase(template, database);
    }

    return template;
  }
}

// Azure Provider Adapter
class AzureProviderAdapter implements CloudProviderAdapter {
  private resourceManagement: ResourceManagementClient;
  private containerInstances: ContainerInstanceManagementClient;
  private webSiteManagement: WebSiteManagementClient;

  constructor(config: AzureConfig) {
    const credentials = new DefaultAzureCredential();
    
    this.resourceManagement = new ResourceManagementClient(credentials, config.subscriptionId);
    this.containerInstances = new ContainerInstanceManagementClient(credentials, config.subscriptionId);
    this.webSiteManagement = new WebSiteManagementClient(credentials, config.subscriptionId);
  }

  async deployApplication(configuration: ProviderDeploymentConfiguration): Promise<DeploymentResult> {
    const deploymentStartTime = Date.now();

    // Generate ARM template
    const armTemplate = this.generateARMTemplate(configuration);
    
    // Deploy infrastructure using ARM
    const deploymentResult = await this.deployARMTemplate(armTemplate);
    
    // Deploy application components
    const applicationDeployment = await this.deployApplicationComponents(configuration, deploymentResult);
    
    // Configure monitoring and logging
    const monitoring = await this.configureMonitoring(applicationDeployment);

    return {
      deploymentId: deploymentResult.id,
      timestamp: Date.now(),
      duration: Date.now() - deploymentStartTime,
      infrastructure: deploymentResult,
      application: applicationDeployment,
      monitoring,
      resources: this.extractResources(deploymentResult, applicationDeployment),
      endpoints: this.extractEndpoints(applicationDeployment)
    };
  }

  private generateARMTemplate(configuration: ProviderDeploymentConfiguration): ARMTemplate {
    const template = {
      $schema: 'https://schema.management.azure.com/schemas/2019-04-01/deploymentTemplate.json#',
      contentVersion: '1.0.0.0',
      parameters: {},
      variables: {},
      resources: [],
      outputs: {}
    };

    // Generate virtual network resources
    if (configuration.networking.vnet) {
      template.resources.push({
        type: 'Microsoft.Network/virtualNetworks',
        apiVersion: '2021-02-01',
        name: `${configuration.applicationName}-vnet`,
        location: configuration.region,
        properties: {
          addressSpace: {
            addressPrefixes: [configuration.networking.vnet.addressSpace]
          },
          subnets: configuration.networking.vnet.subnets.map(subnet => ({
            name: subnet.name,
            properties: {
              addressPrefix: subnet.addressPrefix
            }
          }))
        }
      });
    }

    // Generate compute resources
    for (const service of configuration.services) {
      if (service.type === 'container') {
        this.addContainerInstance(template, service);
      } else if (service.type === 'webapp') {
        this.addWebApp(template, service);
      }
    }

    return template;
  }
}
```

### Example 3: Multi-Cloud Cost Optimization
```typescript
// Multi-cloud cost optimization engine
class MultiCloudCostOptimizer {
  private costAnalyzer: MultiCloudCostAnalyzer;
  private pricingOptimizer: CloudPricingOptimizer;
  private resourceOptimizer: MultiCloudResourceOptimizer;
  private commitmentOptimizer: CommitmentOptimizer;

  constructor(config: MultiCloudCostConfig) {
    this.costAnalyzer = new MultiCloudCostAnalyzer(config.analysis);
    this.pricingOptimizer = new CloudPricingOptimizer(config.pricing);
    this.resourceOptimizer = new MultiCloudResourceOptimizer(config.resources);
    this.commitmentOptimizer = new CommitmentOptimizer(config.commitments);
  }

  // Optimize costs across multiple cloud providers
  async optimizeMultiCloudCosts(
    resilienceManagement: ResilienceManagementResult
  ): Promise<MultiCloudCostOptimizationResult> {
    const optimizationStartTime = Date.now();

    // Analyze current multi-cloud cost patterns
    const costAnalysis = await this.costAnalyzer.analyzeMultiCloudCosts({
      deployments: resilienceManagement.failoverConfiguration.deployments,
      dataManagement: resilienceManagement.dataManagement,
      networkCoordination: resilienceManagement.networkCoordination
    });

    // Optimize pricing models and commitment strategies
    const pricingOptimization = await this.pricingOptimizer.optimizePricing(costAnalysis);
    
    // Optimize resource allocation and rightsizing
    const resourceOptimization = await this.resourceOptimizer.optimizeResources(pricingOptimization);
    
    // Optimize long-term commitments and reservations
    const commitmentOptimization = await this.commitmentOptimizer.optimizeCommitments(resourceOptimization);
    
    // Calculate total cost savings and ROI
    const savingsCalculation = await this.calculateTotalSavings({
      baseline: costAnalysis,
      pricingOptimization,
      resourceOptimization,
      commitmentOptimization
    });

    return {
      optimizationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - optimizationStartTime,
      costAnalysis,
      pricingOptimization,
      resourceOptimization,
      commitmentOptimization,
      savingsCalculation,
      totalSavings: savingsCalculation.totalMonthlySavings,
      roi: savingsCalculation.roi,
      paybackPeriod: savingsCalculation.paybackPeriod,
      recommendations: this.generateCostRecommendations(savingsCalculation)
    };
  }

  // Analyze multi-cloud cost patterns and inefficiencies
  private async analyzeMultiCloudCosts(context: MultiCloudCostContext): Promise<MultiCloudCostAnalysis> {
    const providerCosts = await Promise.all(
      context.deployments.map(async deployment => {
        const providerCostAnalysis = await this.analyzeProviderCosts(deployment);
        return {
          providerId: deployment.providerId,
          providerName: deployment.providerName,
          region: deployment.region,
          costBreakdown: providerCostAnalysis.costBreakdown,
          utilizationMetrics: providerCostAnalysis.utilization,
          inefficiencies: providerCostAnalysis.inefficiencies,
          optimizationOpportunities: providerCostAnalysis.opportunities
        };
      })
    );

    // Analyze cross-provider cost patterns
    const crossProviderAnalysis = await this.analyzeCrossProviderCosts(providerCosts);
    
    // Identify multi-cloud specific cost inefficiencies
    const multiCloudInefficiencies = await this.identifyMultiCloudInefficiencies(crossProviderAnalysis);

    return {
      providerCosts,
      crossProviderAnalysis,
      multiCloudInefficiencies,
      totalMonthlyCost: providerCosts.reduce((sum, cost) => sum + cost.costBreakdown.total, 0),
      costDistribution: this.calculateCostDistribution(providerCosts),
      savingsOpportunities: this.identifySavingsOpportunities(multiCloudInefficiencies)
    };
  }

  // Generate intelligent cost optimization recommendations
  private generateCostRecommendations(savingsCalculation: SavingsCalculation): CostRecommendation[] {
    const recommendations = [];

    // Provider-specific recommendations
    for (const providerSaving of savingsCalculation.providerSavings) {
      if (providerSaving.potentialSavings > 1000) {
        recommendations.push({
          type: 'provider-optimization',
          provider: providerSaving.providerId,
          description: `Optimize ${providerSaving.providerId} resources for $${providerSaving.potentialSavings}/month savings`,
          impact: 'high',
          effort: 'medium',
          timeline: '2-4 weeks'
        });
      }
    }

    // Multi-cloud specific recommendations
    if (savingsCalculation.dataTransferSavings > 500) {
      recommendations.push({
        type: 'data-transfer-optimization',
        description: `Optimize cross-cloud data transfer for $${savingsCalculation.dataTransferSavings}/month savings`,
        impact: 'medium',
        effort: 'low',
        timeline: '1-2 weeks'
      });
    }

    // Commitment and reservation recommendations
    if (savingsCalculation.commitmentSavings > 2000) {
      recommendations.push({
        type: 'commitment-optimization',
        description: `Optimize reserved instances and commitments for $${savingsCalculation.commitmentSavings}/month savings`,
        impact: 'high',
        effort: 'low',
        timeline: '1 week'
      });
    }

    return recommendations.sort((a, b) => this.calculateRecommendationPriority(b) - this.calculateRecommendationPriority(a));
  }
}
```

## Instructions

### 1. Configure Multi-Cloud Infrastructure

Set up your multi-cloud infrastructure with intelligent orchestration:

```bash
# Install multi-cloud deployment tools
npm install -g @pulumi/pulumi @pulumi/aws @pulumi/azure @pulumi/gcp
pip install terraform awscli azure-cli google-cloud-sdk
kubectl version --client

# Set up multi-cloud credentials
export AWS_ACCESS_KEY_ID=your_aws_key
export AZURE_CLIENT_ID=your_azure_client_id
export GOOGLE_APPLICATION_CREDENTIALS=path/to/gcp-key.json
export MULTI_CLOUD_ORCHESTRATION=enabled
```

### 2. Define Multi-Cloud Strategy

Create comprehensive multi-cloud deployment strategy with AI-driven optimization:

```typescript
// Define multi-cloud objectives
const multiCloudObjectives = {
  resilience: { availability: 99.99, rto: 60, rpo: 15 }, // seconds, minutes
  performance: { latency: 50, throughput: 100000 }, // ms, req/s
  cost: { optimization: 'balanced', budget: 50000 }, // monthly budget
  compliance: { frameworks: ['SOC2', 'GDPR', 'HIPAA'] }
};

// Configure cloud providers and regions
const cloudProviders = [
  { 
    provider: 'aws', 
    regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
    priority: 1,
    capabilities: ['compute', 'storage', 'ml', 'analytics']
  },
  { 
    provider: 'azure', 
    regions: ['eastus', 'westeurope', 'southeastasia'],
    priority: 2,
    capabilities: ['compute', 'storage', 'ai', 'integration']
  },
  { 
    provider: 'gcp', 
    regions: ['us-central1', 'europe-west1', 'asia-southeast1'],
    priority: 3,
    capabilities: ['compute', 'storage', 'ml', 'data-analytics']
  }
];
```

### 3. Implement Intelligent Workload Placement

Configure AI-driven workload placement across cloud providers:

```typescript
// Set up workload placement optimization
const placementConfig = {
  strategy: 'ai-optimized',
  objectives: ['cost', 'performance', 'resilience', 'compliance'],
  constraints: ['data-locality', 'regulatory', 'latency'],
  optimization: {
    algorithm: 'multi-objective-genetic',
    iterations: 1000,
    convergence: 0.001
  }
};

// Enable intelligent migration and failover
const migrationConfig = {
  triggers: ['cost-optimization', 'performance-degradation', 'provider-outage'],
  strategy: 'zero-downtime',
  validation: 'comprehensive',
  rollback: 'automatic'
};
```

### 4. Deploy Multi-Cloud Applications

Implement comprehensive multi-cloud application deployment:

```typescript
// Configure multi-cloud deployment
const deploymentConfig = {
  abstraction: {
    enabled: true,
    providerAgnostic: true,
    serviceMapping: 'intelligent'
  },
  networking: {
    crossCloudConnectivity: true,
    intelligentRouting: true,
    loadBalancing: 'performance-aware'
  },
  data: {
    replication: 'multi-master',
    synchronization: 'eventual-consistency',
    backup: 'cross-provider'
  }
};

// Execute multi-cloud deployment
const multiCloudDeployment = await multiCloudOrchestrator.deploy({
  applications: applications,
  providers: cloudProviders,
  configuration: deploymentConfig,
  optimization: { aiDriven: true, costAware: true }
});
```

### 5. Configure Cross-Cloud Networking

Implement intelligent cross-cloud networking and connectivity:

```typescript
// Set up cross-cloud networking
const networkingConfig = {
  connectivity: {
    vpnConnections: true,
    dedicatedConnections: true,
    sdnOverlay: true
  },
  routing: {
    strategy: 'performance-based',
    failover: 'automatic',
    optimization: 'real-time'
  },
  security: {
    encryption: 'end-to-end',
    zeroTrust: true,
    networkSegmentation: true
  }
};

// Configure intelligent traffic management
const trafficManagement = await networkCoordinator.configure({
  providers: multiCloudDeployment.providers,
  applications: multiCloudDeployment.applications,
  networking: networkingConfig,
  optimization: { latency: true, cost: true, resilience: true }
});
```

### 6. Monitor and Optimize Multi-Cloud Performance

Implement comprehensive monitoring with intelligent optimization:

```typescript
// Set up multi-cloud monitoring
const monitoringConfig = {
  metrics: {
    performance: ['latency', 'throughput', 'availability', 'error-rate'],
    cost: ['spend-by-provider', 'cost-per-transaction', 'budget-variance'],
    business: ['user-experience', 'sla-compliance', 'revenue-impact']
  },
  optimization: {
    automated: true,
    intelligent: true,
    continuous: true
  }
};

// Generate intelligent recommendations
const recommendations = await multiCloudAnalyzer.generateRecommendations({
  performance: trafficManagement.performance,
  costs: multiCloudDeployment.costs,
  resilience: multiCloudDeployment.resilience,
  intelligence: { aiDriven: true, predictive: true }
});
```

## Implementation Patterns

### Terraform Multi-Cloud Infrastructure Pattern

```hcl
# terraform/multi-cloud/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# Multi-cloud application deployment
module "multi_cloud_application" {
  source = "./modules/multi-cloud-app"
  
  application_name = var.application_name
  environment = var.environment
  
  # AWS Configuration
  aws_regions = ["us-east-1", "eu-west-1"]
  aws_instance_types = {
    web = "t3.medium"
    api = "c5.large"
    database = "r5.xlarge"
  }
  
  # Azure Configuration
  azure_regions = ["East US", "West Europe"]
  azure_vm_sizes = {
    web = "Standard_B2s"
    api = "Standard_D2s_v3"
    database = "Standard_E4s_v3"
  }
  
  # GCP Configuration
  gcp_regions = ["us-central1", "europe-west1"]
  gcp_machine_types = {
    web = "e2-medium"
    api = "c2-standard-4"
    database = "n2-highmem-4"
  }
  
  # Cross-cloud networking
  cross_cloud_networking = {
    enabled = true
    vpn_connections = true
    intelligent_routing = true
  }
  
  # Cost optimization
  cost_optimization = {
    enabled = true
    budget_limit = 10000
    auto_scaling = true
    spot_instances = true
  }
}

# AWS Resources
resource "aws_vpc" "main" {
  for_each = toset(var.aws_regions)
  
  provider   = aws.region[each.key]
  cidr_block = "10.${index(var.aws_regions, each.key)}.0.0/16"
  
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.application_name}-vpc-${each.key}"
    Environment = var.environment
    Provider = "aws"
    Region = each.key
  }
}

# Azure Resources
resource "azurerm_virtual_network" "main" {
  for_each = toset(var.azure_regions)
  
  name                = "${var.application_name}-vnet-${replace(lower(each.key), " ", "-")}"
  address_space       = ["10.${index(var.azure_regions, each.key) + 10}.0.0/16"]
  location            = each.key
  resource_group_name = azurerm_resource_group.main[each.key].name
  
  tags = {
    Environment = var.environment
    Provider = "azure"
    Region = each.key
  }
}

# GCP Resources
resource "google_compute_network" "main" {
  for_each = toset(var.gcp_regions)
  
  name                    = "${var.application_name}-vpc-${each.key}"
  auto_create_subnetworks = false
  
  project = var.gcp_project_id
}

# Cross-cloud VPN connections
resource "aws_vpn_gateway" "cross_cloud" {
  for_each = toset(var.aws_regions)
  
  vpc_id = aws_vpc.main[each.key].id
  
  tags = {
    Name = "${var.application_name}-vpn-gateway-${each.key}"
    Purpose = "cross-cloud-connectivity"
  }
}

# Multi-cloud load balancer
resource "aws_lb" "global" {
  for_each = toset(var.aws_regions)
  
  name               = "${var.application_name}-global-lb-${each.key}"
  internal           = false
  load_balancer_type = "application"
  
  subnets = aws_subnet.public[each.key].*.id
  
  enable_deletion_protection = false
  
  tags = {
    Environment = var.environment
    Purpose = "multi-cloud-load-balancing"
  }
}
```

### Kubernetes Multi-Cloud Deployment Pattern

```yaml
# kubernetes/multi-cloud-deployment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: multi-cloud-app
  labels:
    deployment-type: multi-cloud
    optimization: intelligent

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: multi-cloud-web-app
  namespace: multi-cloud-app
  labels:
    app: web-app
    deployment-strategy: multi-cloud
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
      annotations:
        multi-cloud.deployment/provider: "{{ .Values.provider }}"
        multi-cloud.deployment/region: "{{ .Values.region }}"
        multi-cloud.deployment/optimization: "cost-performance"
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - web-app
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: web-app
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 8080
          name: http
        
        env:
        - name: CLOUD_PROVIDER
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['multi-cloud.deployment/provider']
        - name: CLOUD_REGION
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['multi-cloud.deployment/region']
        - name: MULTI_CLOUD_OPTIMIZATION
          value: "enabled"
        
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: multi-cloud-web-service
  namespace: multi-cloud-app
  annotations:
    multi-cloud.deployment/load-balancing: "intelligent"
    multi-cloud.deployment/failover: "automatic"
spec:
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    name: http
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-cloud-ingress
  namespace: multi-cloud-app
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/use-regex: "true"
    multi-cloud.deployment/routing: "performance-based"
    multi-cloud.deployment/failover: "cross-provider"
spec:
  rules:
  - host: "{{ .Values.domain }}"
    http:
      paths:
      - path: /(.*)
        pathType: Prefix
        backend:
          service:
            name: multi-cloud-web-service
            port:
              number: 80

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: multi-cloud-config
  namespace: multi-cloud-app
data:
  providers.yaml: |
    providers:
      aws:
        regions: ["us-east-1", "eu-west-1"]
        services: ["ec2", "rds", "s3", "lambda"]
        optimization: "cost-performance"
      azure:
        regions: ["eastus", "westeurope"]
        services: ["vm", "sql", "storage", "functions"]
        optimization: "performance"
      gcp:
        regions: ["us-central1", "europe-west1"]
        services: ["compute", "sql", "storage", "functions"]
        optimization: "cost"
  
  routing.yaml: |
    routing:
      strategy: "performance-based"
      failover: "automatic"
      load_balancing: "intelligent"
      health_checks: "comprehensive"
```

## Expected Output

### Multi-Cloud Deployment Results

```json
{
  "deploymentId": "multi-cloud-deployment-2024-001",
  "success": true,
  "duration": 2700000,
  "requirementsAnalysis": {
    "complexityScore": 8.5,
    "riskAssessment": {
      "overall": "medium",
      "factors": ["vendor-lock-in", "data-sovereignty", "network-latency"],
      "mitigations": ["provider-abstraction", "data-replication", "intelligent-routing"]
    }
  },
  "providerPlacement": {
    "selectedProviders": [
      {
        "providerId": "aws",
        "regions": ["us-east-1", "eu-west-1"],
        "workloads": ["web-tier", "api-gateway"],
        "rationale": "Best performance for compute-intensive workloads"
      },
      {
        "providerId": "azure",
        "regions": ["eastus", "westeurope"],
        "workloads": ["database", "analytics"],
        "rationale": "Superior database services and AI capabilities"
      },
      {
        "providerId": "gcp",
        "regions": ["us-central1", "europe-west1"],
        "workloads": ["ml-inference", "data-processing"],
        "rationale": "Advanced ML services and cost-effective data processing"
      }
    ],
    "expectedPerformance": {
      "latency": "45ms average",
      "throughput": "75,000 req/s",
      "availability": "99.99%"
    }
  },
  "networkCoordination": {
    "crossCloudConnections": 6,
    "networkLatency": "12ms inter-cloud average",
    "bandwidth": "10 Gbps aggregate",
    "redundancy": "triple-path"
  },
  "dataManagement": {
    "replicationStrategy": "multi-master",
    "consistencyLevel": "eventual",
    "replicationLatency": "150ms average",
    "dataLocality": "optimized"
  },
  "resilienceManagement": {
    "resilienceScore": 9.2,
    "rto": "30 seconds",
    "rpo": "5 minutes",
    "failoverScenarios": 12
  },
  "costOptimization": {
    "totalMonthlyCost": "$18,500",
    "costSavings": "$6,200/month",
    "roi": "280%",
    "paybackPeriod": "3.2 months"
  },
  "recommendations": [
    "Implement cross-cloud data caching for improved performance",
    "Enable spot instances for non-critical workloads to reduce costs",
    "Configure intelligent auto-scaling based on global demand patterns",
    "Implement advanced monitoring for cross-cloud network optimization"
  ]
}
```

### Cost Optimization Analysis

```json
{
  "costAnalysis": {
    "totalMonthlyCost": "$18,500",
    "providerBreakdown": {
      "aws": {
        "cost": "$8,200",
        "percentage": "44.3%",
        "services": ["EC2", "RDS", "S3", "Lambda"]
      },
      "azure": {
        "cost": "$6,800",
        "percentage": "36.8%",
        "services": ["VM", "SQL Database", "Storage", "Functions"]
      },
      "gcp": {
        "cost": "$3,500",
        "percentage": "18.9%",
        "services": ["Compute Engine", "BigQuery", "Cloud Storage", "ML APIs"]
      }
    },
    "costInefficiencies": [
      {
        "type": "over-provisioned-resources",
        "impact": "$2,400/month",
        "providers": ["aws", "azure"],
        "recommendation": "Right-size instances based on utilization"
      },
      {
        "type": "data-transfer-costs",
        "impact": "$1,800/month",
        "cause": "inefficient-cross-cloud-routing",
        "recommendation": "Optimize data placement and caching"
      }
    ]
  },
  "optimizationResults": {
    "resourceOptimization": "$2,400/month savings",
    "pricingOptimization": "$1,800/month savings",
    "commitmentOptimization": "$2,000/month savings",
    "totalSavings": "$6,200/month",
    "roi": "280%"
  }
}
```

## Integration Points

### CI/CD Pipeline Integration

```yaml
# .github/workflows/multi-cloud-deployment.yml
name: Multi-Cloud Deployment Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  multi-cloud-deployment:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        provider: [aws, azure, gcp]
        region: [primary, secondary]
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Multi-Cloud Tools
        run: |
          # Install cloud provider CLIs
          curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
          unzip awscliv2.zip && sudo ./aws/install
          
          curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
          
          curl https://sdk.cloud.google.com | bash
          exec -l $SHELL
          
          # Install infrastructure tools
          wget https://releases.hashicorp.com/terraform/1.6.0/terraform_1.6.0_linux_amd64.zip
          unzip terraform_1.6.0_linux_amd64.zip && sudo mv terraform /usr/local/bin/
          
      - name: Configure Multi-Cloud Credentials
        run: |
          aws configure set aws_access_key_id ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws configure set aws_secret_access_key ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          
          az login --service-principal -u ${{ secrets.AZURE_CLIENT_ID }} -p ${{ secrets.AZURE_CLIENT_SECRET }} --tenant ${{ secrets.AZURE_TENANT_ID }}
          
          echo '${{ secrets.GCP_SERVICE_ACCOUNT_KEY }}' > gcp-key.json
          gcloud auth activate-service-account --key-file=gcp-key.json
          
      - name: Deploy Multi-Cloud Infrastructure
        run: |
          terraform init
          terraform plan -var-file="multi-cloud-${ENVIRONMENT}.tfvars"
          terraform apply -auto-approve
          
      - name: Configure Cross-Cloud Networking
        run: |
          node scripts/configure-cross-cloud-networking.js --provider ${{ matrix.provider }}
          node scripts/setup-intelligent-routing.js
          
      - name: Deploy Applications
        run: |
          kubectl apply -f kubernetes/multi-cloud-deployment.yaml
          node scripts/configure-multi-cloud-services.js
          
      - name: Validate Multi-Cloud Deployment
        run: |
          node scripts/validate-multi-cloud-connectivity.js
          node scripts/test-failover-scenarios.js
          
      - name: Optimize Costs and Performance
        run: |
          node scripts/optimize-multi-cloud-costs.js
          node scripts/configure-intelligent-scaling.js
```

### Monitoring and Observability Integration

```typescript
// Integration with monitoring platforms
interface MultiCloudMonitoringIntegration {
  cloudWatch: {
    crossAccountAccess: boolean;
    customMetrics: string[];
    dashboards: string[];
  };
  
  azureMonitor: {
    workspaces: string[];
    customLogs: string[];
    alerts: string[];
  };
  
  googleCloudMonitoring: {
    projects: string[];
    customMetrics: string[];
    policies: string[];
  };
  
  unified: {
    datadog: boolean;
    newRelic: boolean;
    prometheus: boolean;
  };
}

// Multi-cloud performance correlation
const multiCloudPerformanceCorrelation = {
  metrics: {
    crossCloud: ["inter-cloud-latency", "data-transfer-costs", "failover-time"],
    provider: ["resource-utilization", "service-availability", "cost-efficiency"],
    application: ["response-time", "throughput", "error-rate", "user-experience"]
  },
  
  optimization: [
    "Optimize workload placement based on real-time performance data",
    "Implement intelligent caching to reduce cross-cloud data transfer",
    "Configure predictive scaling based on global demand patterns"
  ]
};
```

## Security Considerations

### Secure Multi-Cloud Deployment

```typescript
interface SecureMultiCloudConfig {
  identityManagement: {
    federatedIdentity: boolean;
    crossCloudSSO: boolean;
    identityProvider: string;
  };
  
  networkSecurity: {
    zeroTrustArchitecture: boolean;
    encryptedConnections: boolean;
    networkSegmentation: boolean;
  };
  
  dataProtection: {
    encryptionAtRest: boolean;
    encryptionInTransit: boolean;
    keyManagement: "cross-cloud-hsm";
    dataClassification: boolean;
  };
  
  compliance: {
    frameworks: string[];
    auditLogging: boolean;
    complianceMonitoring: boolean;
  };
}

// Secure multi-cloud patterns
const secureMultiCloudPatterns = {
  authentication: [
    "Federated identity management across cloud providers",
    "Cross-cloud single sign-on (SSO)",
    "Multi-factor authentication (MFA) enforcement"
  ],
  
  authorization: [
    "Unified role-based access control (RBAC)",
    "Cross-cloud policy enforcement",
    "Just-in-time (JIT) access management"
  ],
  
  dataProtection: [
    "Cross-cloud key management and rotation",
    "Data encryption with customer-managed keys",
    "Data residency and sovereignty compliance"
  ]
};
```

## Performance Features

### High-Performance Multi-Cloud Architecture

```typescript
interface MultiCloudPerformanceOptimization {
  intelligentRouting: {
    strategy: "performance-based" | "cost-optimized" | "latency-minimized";
    realTimeOptimization: boolean;
    trafficShaping: boolean;
  };
  
  dataOptimization: {
    caching: "multi-layer";
    compression: "intelligent";
    prefetching: "predictive";
  };
  
  workloadOptimization: {
    placement: "ai-driven";
    migration: "performance-based";
    scaling: "predictive";
  };
}

// AI-driven multi-cloud optimization
const aiMultiCloudOptimization = {
  models: {
    workloadPlacement: { accuracy: 0.91, updateFrequency: "real-time" },
    costForecasting: { accuracy: 0.88, horizon: "90-days" },
    performanceOptimization: { efficiency: 0.86, adaptation: "continuous" }
  },
  
  automation: {
    resourceOptimization: "fully-automated",
    costOptimization: "intelligent",
    performanceOptimization: "continuous",
    failoverManagement: "predictive"
  }
};
```
