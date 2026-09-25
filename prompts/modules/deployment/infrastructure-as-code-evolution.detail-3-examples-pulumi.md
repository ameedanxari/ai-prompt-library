### Example 3: Self-Healing Infrastructure with Pulumi
```typescript
// pulumi/intelligent-infrastructure/index.ts
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as kubernetes from "@pulumi/kubernetes";
import { IntelligentInfrastructureOptimizer } from "./intelligent-optimizer";
import { SelfHealingEngine } from "./self-healing-engine";

// Intelligent infrastructure configuration
const config = new pulumi.Config();
const aiOptimizationConfig = {
  enabled: config.getBoolean("aiOptimization") ?? true,
  objectives: config.getObject<string[]>("optimizationObjectives") ?? ["cost", "performance", "reliability"],
  learningMode: config.get("learningMode") ?? "continuous",
  optimizationFrequency: config.get("optimizationFrequency") ?? "hourly"
};

const selfHealingConfig = {
  enabled: config.getBoolean("selfHealing") ?? true,
  autoRemediation: config.getBoolean("autoRemediation") ?? true,
  learningEnabled: config.getBoolean("learningEnabled") ?? true,
  mttrTarget: config.getNumber("mttrTarget") ?? 300 // 5 minutes
};

// Initialize intelligent infrastructure optimizer
const infrastructureOptimizer = new IntelligentInfrastructureOptimizer({
  aiOptimization: aiOptimizationConfig,
  selfHealing: selfHealingConfig
});

// AI-optimized VPC with intelligent networking
const intelligentVpc = new aws.ec2.Vpc("intelligent-vpc", {
  cidrBlock: "10.0.0.0/16",
  enableDnsHostnames: true,
  enableDnsSupport: true,
  tags: {
    Name: "intelligent-vpc",
    AIOptimized: "true",
    SelfHealing: "enabled"
  }
});

// Intelligent subnets with AI-driven placement
const intelligentSubnets = infrastructureOptimizer.calculateOptimalSubnets({
  vpc: intelligentVpc,
  availabilityZones: ["us-east-1a", "us-east-1b", "us-east-1c"],
  workloadDistribution: "ai-optimized"
}).then(subnetConfig => 
  subnetConfig.map((config, index) => 
    new aws.ec2.Subnet(`intelligent-subnet-${index}`, {
      vpcId: intelligentVpc.id,
      cidrBlock: config.cidrBlock,
      availabilityZone: config.availabilityZone,
      mapPublicIpOnLaunch: config.isPublic,
      tags: {
        Name: `intelligent-subnet-${index}`,
        Type: config.isPublic ? "public" : "private",
        AIOptimized: "true",
        OptimalPlacement: config.placementScore.toString()
      }
    })
  )
);

// AI-optimized EKS cluster with intelligent node groups
const intelligentEksCluster = new aws.eks.Cluster("intelligent-eks", {
  roleArn: eksServiceRole.arn,
  vpcConfig: {
    subnetIds: intelligentSubnets.then(subnets => subnets.map(s => s.id))
  },
  version: "1.28",
  enabledClusterLogTypes: ["api", "audit", "authenticator", "controllerManager", "scheduler"],
  tags: {
    Name: "intelligent-eks-cluster",
    AIOptimized: "true",
    SelfHealing: "enabled"
  }
});

// Intelligent node group with AI-driven scaling
const intelligentNodeGroup = infrastructureOptimizer.calculateOptimalNodeGroup({
  cluster: intelligentEksCluster,
  workloadRequirements: config.getObject("workloadRequirements"),
  costConstraints: config.getObject("costConstraints")
}).then(nodeGroupConfig => 
  new aws.eks.NodeGroup("intelligent-node-group", {
    clusterName: intelligentEksCluster.name,
    nodeRoleArn: eksNodeRole.arn,
    subnetIds: intelligentSubnets.then(subnets => 
      subnets.filter(s => !s.mapPublicIpOnLaunch).map(s => s.id)
    ),
    
    // AI-optimized instance configuration
    instanceTypes: nodeGroupConfig.optimalInstanceTypes,
    capacityType: nodeGroupConfig.optimalCapacityType,
    
    scalingConfig: {
      minSize: nodeGroupConfig.optimalMinSize,
      maxSize: nodeGroupConfig.optimalMaxSize,
      desiredSize: nodeGroupConfig.optimalDesiredSize
    },
    
    updateConfig: {
      maxUnavailablePercentage: nodeGroupConfig.optimalUpdatePercentage
    },
    
    tags: {
      Name: "intelligent-node-group",
      AIOptimized: "true",
      SelfHealing: "enabled",
      OptimizationScore: nodeGroupConfig.optimizationScore.toString()
    }
  })
);

// Self-healing infrastructure monitoring
const selfHealingEngine = new SelfHealingEngine({
  cluster: intelligentEksCluster,
  nodeGroup: intelligentNodeGroup,
  config: selfHealingConfig
});

// Deploy self-healing monitoring and remediation
const selfHealingDeployment = selfHealingEngine.deploy().then(deployment => {
  // Kubernetes resources for self-healing
  const selfHealingNamespace = new kubernetes.core.v1.Namespace("self-healing", {
    metadata: {
      name: "self-healing-system",
      labels: {
        "app.kubernetes.io/name": "self-healing-system",
        "app.kubernetes.io/component": "infrastructure"
      }
    }
  });

  // Self-healing controller deployment
  const selfHealingController = new kubernetes.apps.v1.Deployment("self-healing-controller", {
    metadata: {
      name: "self-healing-controller",
      namespace: selfHealingNamespace.metadata.name,
      labels: {
        "app.kubernetes.io/name": "self-healing-controller",
        "app.kubernetes.io/component": "controller"
      }
    },
    spec: {
      replicas: 3,
      selector: {
        matchLabels: {
          "app.kubernetes.io/name": "self-healing-controller"
        }
      },
      template: {
        metadata: {
          labels: {
            "app.kubernetes.io/name": "self-healing-controller"
          }
        },
        spec: {
          containers: [{
            name: "controller",
            image: "intelligent-infrastructure/self-healing-controller:latest",
            env: [
              {
                name: "AI_OPTIMIZATION_ENABLED",
                value: aiOptimizationConfig.enabled.toString()
              },
              {
                name: "LEARNING_MODE",
                value: aiOptimizationConfig.learningMode
              },
              {
                name: "MTTR_TARGET",
                value: selfHealingConfig.mttrTarget.toString()
              }
            ],
            resources: {
              requests: {
                memory: "256Mi",
                cpu: "250m"
              },
              limits: {
                memory: "512Mi",
                cpu: "500m"
              }
            },
            livenessProbe: {
              httpGet: {
                path: "/health",
                port: 8080
              },
              initialDelaySeconds: 30,
              periodSeconds: 10
            },
            readinessProbe: {
              httpGet: {
                path: "/ready",
                port: 8080
              },
              initialDelaySeconds: 5,
              periodSeconds: 5
            }
          }],
          serviceAccountName: "self-healing-controller"
        }
      }
    }
  });

  return {
    namespace: selfHealingNamespace,
    controller: selfHealingController,
    deployment: deployment
  };
});

// AI-driven cost optimization
const costOptimization = infrastructureOptimizer.optimizeCosts({
  resources: [intelligentVpc, intelligentEksCluster, intelligentNodeGroup],
  objectives: aiOptimizationConfig.objectives,
  constraints: config.getObject("costConstraints")
});

// Export intelligent infrastructure outputs
export const vpcId = intelligentVpc.id;
export const eksClusterName = intelligentEksCluster.name;
export const eksClusterEndpoint = intelligentEksCluster.endpoint;
export const nodeGroupArn = intelligentNodeGroup.then(ng => ng.arn);
export const aiOptimizationResults = infrastructureOptimizer.getOptimizationResults();
export const selfHealingStatus = selfHealingEngine.getStatus();
export const costOptimizationResults = costOptimization;
```

