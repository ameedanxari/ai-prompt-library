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

