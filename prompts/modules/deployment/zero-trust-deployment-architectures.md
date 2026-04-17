# Zero-Trust Deployment Architectures Template

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

This template provides comprehensive patterns for implementing zero-trust deployment architectures including identity-centric security, micro-segmentation, continuous verification, and AI-driven threat detection. It covers enterprise-scale zero-trust systems with intelligent security orchestration, adaptive access controls, and sophisticated threat response automation.

## Context

Zero-trust architecture represents a fundamental shift from perimeter-based security to identity-centric, continuous verification models. This template addresses advanced zero-trust deployment scenarios including micro-segmentation, identity federation, continuous authentication, and AI-driven security automation with comprehensive compliance and threat intelligence integration.

## Examples

### Example 1: Intelligent Zero-Trust Orchestration Framework
```typescript
// Advanced zero-trust deployment orchestration framework
interface ZeroTrustOrchestrationConfig {
  identityManagement: IdentityManagementConfig;
  microSegmentation: MicroSegmentationConfig;
  continuousVerification: ContinuousVerificationConfig;
  threatIntelligence: ThreatIntelligenceConfig;
  complianceIntegration: ComplianceIntegrationConfig;
  aiSecurityOrchestration: AISecurityOrchestrationConfig;
}

interface IdentityManagementConfig {
  identityProviders: IdentityProvider[];
  authenticationMethods: AuthenticationMethod[];
  authorizationPolicies: AuthorizationPolicy[];
  identityGovernance: IdentityGovernanceConfig;
}

class ZeroTrustOrchestrationFramework {
  private identityManager: ZeroTrustIdentityManager;
  private segmentationEngine: MicroSegmentationEngine;
  private verificationEngine: ContinuousVerificationEngine;
  private threatIntelligence: ThreatIntelligenceEngine;
  private complianceManager: ZeroTrustComplianceManager;
  private aiSecurityOrchestrator: AISecurityOrchestrator;

  constructor(config: ZeroTrustOrchestrationConfig) {
    this.identityManager = new ZeroTrustIdentityManager(config.identityManagement);
    this.segmentationEngine = new MicroSegmentationEngine(config.microSegmentation);
    this.verificationEngine = new ContinuousVerificationEngine(config.continuousVerification);
    this.threatIntelligence = new ThreatIntelligenceEngine(config.threatIntelligence);
    this.complianceManager = new ZeroTrustComplianceManager(config.complianceIntegration);
    this.aiSecurityOrchestrator = new AISecurityOrchestrator(config.aiSecurityOrchestration);
  }

  // Execute intelligent zero-trust deployment campaign
  async executeZeroTrustDeployment(deployment: ZeroTrustDeployment): Promise<ZeroTrustDeploymentResult> {
    const deploymentId = this.generateDeploymentId();
    const startTime = Date.now();

    try {
      // 1. Analyze security posture and identity landscape
      const securityAnalysis = await this.analyzeSecurityPosture(deployment);
      
      // 2. Design and implement identity-centric architecture
      const identityArchitecture = await this.designIdentityArchitecture(deployment, securityAnalysis);
      
      // 3. Implement micro-segmentation and network security
      const microSegmentation = await this.implementMicroSegmentation(identityArchitecture);
      
      // 4. Deploy continuous verification and monitoring
      const continuousVerification = await this.deployContinuousVerification(microSegmentation);
      
      // 5. Integrate threat intelligence and AI-driven security
      const threatIntelligenceIntegration = await this.integrateThreatIntelligence(continuousVerification);
      
      // 6. Validate compliance and security effectiveness
      const complianceValidation = await this.validateZeroTrustCompliance(threatIntelligenceIntegration);

      return {
        deploymentId,
        success: true,
        duration: Date.now() - startTime,
        securityAnalysis,
        identityArchitecture,
        microSegmentation,
        continuousVerification,
        threatIntelligenceIntegration,
        complianceValidation,
        securityPostureScore: complianceValidation.securityScore,
        identitiesManaged: identityArchitecture.identities.length,
        segmentsCreated: microSegmentation.segments.length,
        recommendations: this.generateIntelligentRecommendations(complianceValidation)
      };

    } catch (error) {
      return {
        deploymentId,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        recommendations: ['Review zero-trust deployment configuration and security policies']
      };
    }
  }
}
  // Analyze current security posture and identify gaps
  private async analyzeSecurityPosture(deployment: ZeroTrustDeployment): Promise<SecurityPostureAnalysis> {
    const analysisStartTime = Date.now();

    // Analyze current identity and access management
    const identityAnalysis = await this.identityManager.analyzeCurrentIdentities({
      scope: deployment.scope,
      identitySources: deployment.identitySources,
      accessPatterns: deployment.accessPatterns
    });

    // Assess network security and segmentation gaps
    const networkAnalysis = await this.analyzeNetworkSecurity(deployment);
    
    // Evaluate current security controls and policies
    const controlsAnalysis = await this.analyzeSecurityControls(deployment);
    
    // Calculate zero-trust readiness score
    const readinessScore = await this.calculateZeroTrustReadiness({
      identityAnalysis,
      networkAnalysis,
      controlsAnalysis
    });

    return {
      analysisId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - analysisStartTime,
      identityAnalysis,
      networkAnalysis,
      controlsAnalysis,
      readinessScore,
      securityGaps: this.identifySecurityGaps(identityAnalysis, networkAnalysis, controlsAnalysis),
      remediationPriorities: this.calculateRemediationPriorities(readinessScore)
    };
  }

  // Design identity-centric architecture
  private async designIdentityArchitecture(
    deployment: ZeroTrustDeployment,
    securityAnalysis: SecurityPostureAnalysis
  ): Promise<IdentityArchitecture> {
    const architectureStartTime = Date.now();

    // Design identity provider federation
    const identityFederation = await this.identityManager.designFederation({
      providers: deployment.identityProviders,
      requirements: deployment.identityRequirements,
      gaps: securityAnalysis.securityGaps
    });

    // Configure multi-factor authentication strategies
    const mfaConfiguration = await this.configureMFA(identityFederation);
    
    // Design role-based and attribute-based access control
    const accessControlDesign = await this.designAccessControl(mfaConfiguration);
    
    // Configure identity governance and lifecycle management
    const identityGovernance = await this.configureIdentityGovernance(accessControlDesign);

    return {
      architectureId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - architectureStartTime,
      identityFederation,
      mfaConfiguration,
      accessControlDesign,
      identityGovernance,
      identities: identityFederation.managedIdentities,
      securityScore: this.calculateIdentitySecurityScore(identityGovernance)
    };
  }

  // Implement micro-segmentation
  private async implementMicroSegmentation(
    identityArchitecture: IdentityArchitecture
  ): Promise<MicroSegmentationResult> {
    const segmentationStartTime = Date.now();

    // Design network micro-segmentation strategy
    const segmentationStrategy = await this.segmentationEngine.designStrategy({
      identities: identityArchitecture.identities,
      accessPatterns: identityArchitecture.accessControlDesign.patterns,
      securityRequirements: identityArchitecture.identityGovernance.requirements
    });

    // Implement network policies and controls
    const networkPolicies = await this.implementNetworkPolicies(segmentationStrategy);
    
    // Configure application-level segmentation
    const applicationSegmentation = await this.configureApplicationSegmentation(networkPolicies);
    
    // Set up dynamic policy enforcement
    const dynamicPolicyEnforcement = await this.configureDynamicPolicyEnforcement(applicationSegmentation);

    return {
      segmentationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - segmentationStartTime,
      segmentationStrategy,
      networkPolicies,
      applicationSegmentation,
      dynamicPolicyEnforcement,
      segments: segmentationStrategy.segments,
      policyCompliance: this.calculatePolicyCompliance(dynamicPolicyEnforcement)
    };
  }
}

// Zero-trust identity manager
class ZeroTrustIdentityManager {
  private identityProviders: Map<string, IdentityProvider>;
  private authenticationEngine: AuthenticationEngine;
  private authorizationEngine: AuthorizationEngine;
  private identityGovernance: IdentityGovernanceEngine;

  constructor(config: IdentityManagementConfig) {
    this.identityProviders = this.initializeIdentityProviders(config.identityProviders);
    this.authenticationEngine = new AuthenticationEngine(config.authenticationMethods);
    this.authorizationEngine = new AuthorizationEngine(config.authorizationPolicies);
    this.identityGovernance = new IdentityGovernanceEngine(config.identityGovernance);
  }

  // Analyze current identity landscape
  async analyzeCurrentIdentities(context: IdentityAnalysisContext): Promise<IdentityAnalysis> {
    const analysisStartTime = Date.now();

    // Discover and catalog all identities
    const identityDiscovery = await this.discoverIdentities(context);
    
    // Analyze access patterns and behaviors
    const accessPatternAnalysis = await this.analyzeAccessPatterns(identityDiscovery);
    
    // Assess identity security posture
    const securityPostureAssessment = await this.assessIdentitySecurityPosture(accessPatternAnalysis);
    
    // Identify privileged and high-risk identities
    const riskAssessment = await this.assessIdentityRisks(securityPostureAssessment);

    return {
      analysisId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - analysisStartTime,
      identityDiscovery,
      accessPatternAnalysis,
      securityPostureAssessment,
      riskAssessment,
      totalIdentities: identityDiscovery.identities.length,
      highRiskIdentities: riskAssessment.highRiskIdentities.length,
      complianceScore: this.calculateIdentityComplianceScore(riskAssessment)
    };
  }

  // Design identity federation architecture
  async designFederation(context: FederationDesignContext): Promise<IdentityFederation> {
    const federationStartTime = Date.now();

    // Design identity provider integration
    const providerIntegration = await this.designProviderIntegration(context);
    
    // Configure single sign-on (SSO) architecture
    const ssoArchitecture = await this.configureSSOArchitecture(providerIntegration);
    
    // Set up identity synchronization and provisioning
    const identityProvisioning = await this.configureIdentityProvisioning(ssoArchitecture);
    
    // Configure identity lifecycle management
    const lifecycleManagement = await this.configureLifecycleManagement(identityProvisioning);

    return {
      federationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - federationStartTime,
      providerIntegration,
      ssoArchitecture,
      identityProvisioning,
      lifecycleManagement,
      managedIdentities: identityProvisioning.identities,
      federationScore: this.calculateFederationScore(lifecycleManagement)
    };
  }
}

// Micro-segmentation engine
class MicroSegmentationEngine {
  private networkPolicyEngine: NetworkPolicyEngine;
  private applicationPolicyEngine: ApplicationPolicyEngine;
  private trafficAnalyzer: TrafficAnalyzer;
  private policyOptimizer: PolicyOptimizer;

  constructor(config: MicroSegmentationConfig) {
    this.networkPolicyEngine = new NetworkPolicyEngine(config.networkPolicies);
    this.applicationPolicyEngine = new ApplicationPolicyEngine(config.applicationPolicies);
    this.trafficAnalyzer = new TrafficAnalyzer(config.trafficAnalysis);
    this.policyOptimizer = new PolicyOptimizer(config.policyOptimization);
  }

  // Design micro-segmentation strategy
  async designStrategy(context: SegmentationContext): Promise<SegmentationStrategy> {
    const strategyStartTime = Date.now();

    // Analyze application communication patterns
    const communicationAnalysis = await this.trafficAnalyzer.analyzeCommunicationPatterns({
      identities: context.identities,
      accessPatterns: context.accessPatterns,
      applications: context.applications
    });

    // Design optimal segmentation boundaries
    const segmentationBoundaries = await this.designSegmentationBoundaries(communicationAnalysis);
    
    // Generate network and application policies
    const policyGeneration = await this.generatePolicies(segmentationBoundaries);
    
    // Optimize policies for performance and security
    const policyOptimization = await this.policyOptimizer.optimizePolicies(policyGeneration);

    return {
      strategyId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - strategyStartTime,
      communicationAnalysis,
      segmentationBoundaries,
      policyGeneration,
      policyOptimization,
      segments: segmentationBoundaries.segments,
      expectedSecurityImprovement: this.calculateSecurityImprovement(policyOptimization)
    };
  }

  // Design segmentation boundaries
  private async designSegmentationBoundaries(
    communicationAnalysis: CommunicationAnalysis
  ): Promise<SegmentationBoundaries> {
    // Use machine learning to identify optimal segmentation points
    const mlSegmentation = await this.performMLSegmentation(communicationAnalysis);
    
    // Apply security best practices and compliance requirements
    const complianceSegmentation = await this.applyComplianceSegmentation(mlSegmentation);
    
    // Optimize for performance and operational efficiency
    const optimizedSegmentation = await this.optimizeSegmentation(complianceSegmentation);

    return {
      boundariesId: crypto.randomUUID(),
      mlSegmentation,
      complianceSegmentation,
      optimizedSegmentation,
      segments: optimizedSegmentation.segments,
      segmentationScore: this.calculateSegmentationScore(optimizedSegmentation)
    };
  }
}

// Continuous verification engine
class ContinuousVerificationEngine {
  private behaviorAnalyzer: BehaviorAnalyzer;
  private riskEngine: RiskEngine;
  private adaptiveAuthEngine: AdaptiveAuthEngine;
  private verificationOrchestrator: VerificationOrchestrator;

  constructor(config: ContinuousVerificationConfig) {
    this.behaviorAnalyzer = new BehaviorAnalyzer(config.behaviorAnalysis);
    this.riskEngine = new RiskEngine(config.riskAssessment);
    this.adaptiveAuthEngine = new AdaptiveAuthEngine(config.adaptiveAuth);
    this.verificationOrchestrator = new VerificationOrchestrator(config.orchestration);
  }

  // Deploy continuous verification system
  async deployContinuousVerification(
    microSegmentation: MicroSegmentationResult
  ): Promise<ContinuousVerificationResult> {
    const verificationStartTime = Date.now();

    // Set up behavioral analysis and monitoring
    const behaviorMonitoring = await this.behaviorAnalyzer.setupMonitoring({
      segments: microSegmentation.segments,
      policies: microSegmentation.networkPolicies,
      identities: microSegmentation.managedIdentities
    });

    // Configure risk-based authentication
    const riskBasedAuth = await this.configureRiskBasedAuth(behaviorMonitoring);
    
    // Implement adaptive access controls
    const adaptiveAccessControls = await this.implementAdaptiveAccessControls(riskBasedAuth);
    
    // Set up continuous compliance monitoring
    const complianceMonitoring = await this.setupComplianceMonitoring(adaptiveAccessControls);

    return {
      verificationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - verificationStartTime,
      behaviorMonitoring,
      riskBasedAuth,
      adaptiveAccessControls,
      complianceMonitoring,
      verificationScore: this.calculateVerificationScore(complianceMonitoring),
      continuousVerificationEnabled: true
    };
  }

  // Configure risk-based authentication
  private async configureRiskBasedAuth(
    behaviorMonitoring: BehaviorMonitoring
  ): Promise<RiskBasedAuthentication> {
    // Analyze user behavior patterns
    const behaviorPatterns = await this.behaviorAnalyzer.analyzePatterns(behaviorMonitoring);
    
    // Configure risk scoring algorithms
    const riskScoring = await this.riskEngine.configureScoring({
      patterns: behaviorPatterns,
      riskFactors: ['location', 'device', 'time', 'behavior', 'network'],
      thresholds: 'adaptive'
    });

    // Set up adaptive authentication policies
    const adaptiveAuthPolicies = await this.adaptiveAuthEngine.configurePolicies({
      riskScoring: riskScoring,
      authenticationMethods: ['password', 'mfa', 'biometric', 'certificate'],
      adaptationRules: 'intelligent'
    });

    return {
      authId: crypto.randomUUID(),
      behaviorPatterns,
      riskScoring,
      adaptiveAuthPolicies,
      authenticationAccuracy: this.calculateAuthenticationAccuracy(adaptiveAuthPolicies)
    };
  }
}

// AI security orchestrator
class AISecurityOrchestrator {
  private threatDetectionAI: ThreatDetectionAI;
  private securityAutomation: SecurityAutomation;
  private incidentResponse: AIIncidentResponse;
  private securityLearning: SecurityLearningEngine;

  constructor(config: AISecurityOrchestrationConfig) {
    this.threatDetectionAI = new ThreatDetectionAI(config.threatDetection);
    this.securityAutomation = new SecurityAutomation(config.automation);
    this.incidentResponse = new AIIncidentResponse(config.incidentResponse);
    this.securityLearning = new SecurityLearningEngine(config.learning);
  }

  // Integrate AI-driven threat intelligence
  async integrateThreatIntelligence(
    continuousVerification: ContinuousVerificationResult
  ): Promise<ThreatIntelligenceIntegration> {
    const integrationStartTime = Date.now();

    // Deploy AI-powered threat detection
    const threatDetection = await this.threatDetectionAI.deployDetection({
      verificationData: continuousVerification.behaviorMonitoring,
      riskData: continuousVerification.riskBasedAuth,
      networkData: continuousVerification.adaptiveAccessControls
    });

    // Configure automated security response
    const automatedResponse = await this.securityAutomation.configureAutomation({
      threatDetection: threatDetection,
      responseActions: ['isolate', 'block', 'alert', 'investigate', 'remediate'],
      automationLevel: 'intelligent'
    });

    // Set up AI-driven incident response
    const incidentResponse = await this.incidentResponse.configureResponse({
      threatDetection: threatDetection,
      automatedResponse: automatedResponse,
      escalationRules: 'adaptive'
    });

    // Configure continuous security learning
    const securityLearning = await this.securityLearning.configureLearning({
      threatData: threatDetection,
      responseData: automatedResponse,
      incidentData: incidentResponse
    });

    return {
      integrationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - integrationStartTime,
      threatDetection,
      automatedResponse,
      incidentResponse,
      securityLearning,
      threatDetectionAccuracy: this.calculateThreatDetectionAccuracy(threatDetection),
      responseEffectiveness: this.calculateResponseEffectiveness(automatedResponse)
    };
  }
}
```

### Example 2: Kubernetes Zero-Trust Implementation
```yaml
# kubernetes/zero-trust/namespace-isolation.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: zero-trust-system
  labels:
    security.policy/zero-trust: "enabled"
    network.policy/isolation: "strict"
    identity.policy/verification: "continuous"

---
# Network policies for micro-segmentation
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: zero-trust-network-policy
  namespace: zero-trust-system
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress
  
  # Default deny all traffic
  ingress: []
  egress: []

---
# Allow specific communication patterns
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: zero-trust-allowed-communication
  namespace: zero-trust-system
spec:
  podSelector:
    matchLabels:
      app: web-application
  
  policyTypes:
  - Ingress
  - Egress
  
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-system
    - podSelector:
        matchLabels:
          app: load-balancer
    ports:
    - protocol: TCP
      port: 8080
  
  egress:
  - to:
    - namespaceSelector:
        matchLabels:
          name: database-system
    - podSelector:
        matchLabels:
          app: database
    ports:
    - protocol: TCP
      port: 5432

---
# Service mesh configuration for zero-trust
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: zero-trust-peer-auth
  namespace: zero-trust-system
spec:
  mtls:
    mode: STRICT

---
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: zero-trust-authz-policy
  namespace: zero-trust-system
spec:
  selector:
    matchLabels:
      app: web-application
  
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/ingress-system/sa/ingress-service-account"]
    to:
    - operation:
        methods: ["GET", "POST"]
        paths: ["/api/*"]
    when:
    - key: source.ip
      values: ["10.0.0.0/8"]
    - key: request.headers[user-agent]
      notValues: ["*bot*", "*crawler*"]

---
# Identity and access management
apiVersion: v1
kind: ServiceAccount
metadata:
  name: zero-trust-service-account
  namespace: zero-trust-system
  annotations:
    iam.gke.io/gcp-service-account: zero-trust-sa@project.iam.gserviceaccount.com

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: zero-trust-role
  namespace: zero-trust-system
rules:
- apiGroups: [""]
  resources: ["pods", "services", "configmaps"]
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps"]
  resources: ["deployments", "replicasets"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: zero-trust-role-binding
  namespace: zero-trust-system
subjects:
- kind: ServiceAccount
  name: zero-trust-service-account
  namespace: zero-trust-system
roleRef:
  kind: Role
  name: zero-trust-role
  apiGroup: rbac.authorization.k8s.io

---
# Pod security standards
apiVersion: v1
kind: Pod
metadata:
  name: zero-trust-application
  namespace: zero-trust-system
  labels:
    app: web-application
    security.policy/zero-trust: "enabled"
spec:
  serviceAccountName: zero-trust-service-account
  
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    runAsGroup: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  
  containers:
  - name: web-application
    image: web-application:latest
    
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      runAsNonRoot: true
      runAsUser: 1000
      capabilities:
        drop:
        - ALL
        add:
        - NET_BIND_SERVICE
    
    ports:
    - containerPort: 8080
      name: http
      protocol: TCP
    
    env:
    - name: ZERO_TRUST_ENABLED
      value: "true"
    - name: IDENTITY_VERIFICATION
      value: "continuous"
    - name: SECURITY_MONITORING
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
        scheme: HTTPS
      initialDelaySeconds: 30
      periodSeconds: 10
    
    readinessProbe:
      httpGet:
        path: /ready
        port: 8080
        scheme: HTTPS
      initialDelaySeconds: 5
      periodSeconds: 5
    
    volumeMounts:
    - name: tmp
      mountPath: /tmp
    - name: cache
      mountPath: /app/cache
  
  volumes:
  - name: tmp
    emptyDir: {}
  - name: cache
    emptyDir: {}

---
# Continuous verification and monitoring
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zero-trust-monitor
  namespace: zero-trust-system
  labels:
    app: zero-trust-monitor
    component: security-monitoring
spec:
  replicas: 3
  selector:
    matchLabels:
      app: zero-trust-monitor
  
  template:
    metadata:
      labels:
        app: zero-trust-monitor
        component: security-monitoring
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "9090"
        prometheus.io/path: "/metrics"
    
    spec:
      serviceAccountName: zero-trust-service-account
      
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      
      containers:
      - name: security-monitor
        image: zero-trust-monitor:latest
        
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          runAsNonRoot: true
          capabilities:
            drop:
            - ALL
        
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 9090
          name: metrics
        
        env:
        - name: CONTINUOUS_VERIFICATION
          value: "enabled"
        - name: BEHAVIOR_ANALYSIS
          value: "ml-based"
        - name: THREAT_DETECTION
          value: "ai-powered"
        - name: INCIDENT_RESPONSE
          value: "automated"
        
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        
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
        
        volumeMounts:
        - name: config
          mountPath: /app/config
          readOnly: true
        - name: tmp
          mountPath: /tmp
      
      volumes:
      - name: config
        configMap:
          name: zero-trust-config
      - name: tmp
        emptyDir: {}
```

### Example 3: Zero-Trust Infrastructure as Code
```hcl
# terraform/zero-trust/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.0"
    }
  }
}

# Zero-trust VPC with micro-segmentation
resource "aws_vpc" "zero_trust" {
  cidr_block = "10.0.0.0/16"
  
  enable_dns_hostnames = true
  enable_dns_support = true
  
  tags = {
    Name = "zero-trust-vpc"
    SecurityModel = "zero-trust"
    MicroSegmentation = "enabled"
  }
}

# Private subnets for zero-trust architecture
resource "aws_subnet" "zero_trust_private" {
  count = 3
  
  vpc_id = aws_vpc.zero_trust.id
  cidr_block = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "zero-trust-private-${count.index + 1}"
    Type = "private"
    SecurityZone = "restricted"
  }
}

# Security groups with least privilege access
resource "aws_security_group" "zero_trust_web" {
  name_prefix = "zero-trust-web-"
  vpc_id = aws_vpc.zero_trust.id
  
  # Ingress rules - only allow specific sources
  ingress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    security_groups = [aws_security_group.zero_trust_alb.id]
    description = "HTTPS from ALB only"
  }
  
  # Egress rules - only allow specific destinations
  egress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    security_groups = [aws_security_group.zero_trust_database.id]
    description = "HTTPS to database only"
  }
  
  egress {
    from_port = 443
    to_port = 443
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "HTTPS to external APIs"
  }
  
  tags = {
    Name = "zero-trust-web-sg"
    SecurityModel = "zero-trust"
    Principle = "least-privilege"
  }
}

resource "aws_security_group" "zero_trust_database" {
  name_prefix = "zero-trust-database-"
  vpc_id = aws_vpc.zero_trust.id
  
  # Only allow access from web tier
  ingress {
    from_port = 5432
    to_port = 5432
    protocol = "tcp"
    security_groups = [aws_security_group.zero_trust_web.id]
    description = "PostgreSQL from web tier only"
  }
  
  # No outbound internet access
  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
    self = true
    description = "Internal communication only"
  }
  
  tags = {
    Name = "zero-trust-database-sg"
    SecurityModel = "zero-trust"
    Principle = "no-internet-access"
  }
}

# Identity and Access Management
resource "aws_iam_role" "zero_trust_application" {
  name = "zero-trust-application-role"
  
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
        Condition = {
          StringEquals = {
            "aws:RequestedRegion" = var.aws_region
          }
          IpAddress = {
            "aws:SourceIp" = aws_vpc.zero_trust.cidr_block
          }
        }
      }
    ]
  })
  
  tags = {
    Name = "zero-trust-application-role"
    SecurityModel = "zero-trust"
    Principle = "least-privilege"
  }
}

resource "aws_iam_policy" "zero_trust_application" {
  name = "zero-trust-application-policy"
  
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/zero-trust/*"
      },
      {
        Effect = "Allow"
        Action = [
          "secretsmanager:GetSecretValue"
        ]
        Resource = "arn:aws:secretsmanager:${var.aws_region}:${data.aws_caller_identity.current.account_id}:secret:zero-trust/*"
        Condition = {
          StringEquals = {
            "secretsmanager:ResourceTag/Application" = "zero-trust"
          }
        }
      }
    ]
  })
  
  tags = {
    Name = "zero-trust-application-policy"
    SecurityModel = "zero-trust"
  }
}

resource "aws_iam_role_policy_attachment" "zero_trust_application" {
  role = aws_iam_role.zero_trust_application.name
  policy_arn = aws_iam_policy.zero_trust_application.arn
}

# WAF for application protection
resource "aws_wafv2_web_acl" "zero_trust" {
  name = "zero-trust-waf"
  scope = "REGIONAL"
  
  default_action {
    block {}
  }
  
  # Allow only authenticated requests
  rule {
    name = "AllowAuthenticatedRequests"
    priority = 1
    
    action {
      allow {}
    }
    
    statement {
      and_statement {
        statement {
          byte_match_statement {
            search_string = "Bearer "
            field_to_match {
              single_header {
                name = "authorization"
              }
            }
            text_transformation {
              priority = 0
              type = "NONE"
            }
            positional_constraint = "STARTS_WITH"
          }
        }
        statement {
          size_constraint_statement {
            field_to_match {
              single_header {
                name = "authorization"
              }
            }
            comparison_operator = "GT"
            size = 50
            text_transformation {
              priority = 0
              type = "NONE"
            }
          }
        }
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name = "AllowAuthenticatedRequests"
      sampled_requests_enabled = true
    }
  }
  
  # Block suspicious patterns
  rule {
    name = "BlockSuspiciousPatterns"
    priority = 2
    
    action {
      block {}
    }
    
    statement {
      or_statement {
        statement {
          sqli_match_statement {
            field_to_match {
              all_query_arguments {}
            }
            text_transformation {
              priority = 0
              type = "URL_DECODE"
            }
            text_transformation {
              priority = 1
              type = "HTML_ENTITY_DECODE"
            }
          }
        }
        statement {
          xss_match_statement {
            field_to_match {
              all_query_arguments {}
            }
            text_transformation {
              priority = 0
              type = "URL_DECODE"
            }
            text_transformation {
              priority = 1
              type = "HTML_ENTITY_DECODE"
            }
          }
        }
      }
    }
    
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name = "BlockSuspiciousPatterns"
      sampled_requests_enabled = true
    }
  }
  
  tags = {
    Name = "zero-trust-waf"
    SecurityModel = "zero-trust"
    Component = "application-protection"
  }
  
  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name = "ZeroTrustWAF"
    sampled_requests_enabled = true
  }
}

# CloudTrail for comprehensive auditing
resource "aws_cloudtrail" "zero_trust" {
  name = "zero-trust-audit-trail"
  s3_bucket_name = aws_s3_bucket.zero_trust_audit.bucket
  
  include_global_service_events = true
  is_multi_region_trail = true
  enable_logging = true
  
  event_selector {
    read_write_type = "All"
    include_management_events = true
    
    data_resource {
      type = "AWS::S3::Object"
      values = ["${aws_s3_bucket.zero_trust_audit.arn}/*"]
    }
  }
  
  insight_selector {
    insight_type = "ApiCallRateInsight"
  }
  
  tags = {
    Name = "zero-trust-audit-trail"
    SecurityModel = "zero-trust"
    Component = "audit-logging"
  }
}

# S3 bucket for audit logs
resource "aws_s3_bucket" "zero_trust_audit" {
  bucket = "zero-trust-audit-logs-${random_id.bucket_suffix.hex}"
  
  tags = {
    Name = "zero-trust-audit-logs"
    SecurityModel = "zero-trust"
    Component = "audit-storage"
  }
}

resource "aws_s3_bucket_encryption" "zero_trust_audit" {
  bucket = aws_s3_bucket.zero_trust_audit.id
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
      bucket_key_enabled = true
    }
  }
}

resource "aws_s3_bucket_public_access_block" "zero_trust_audit" {
  bucket = aws_s3_bucket.zero_trust_audit.id
  
  block_public_acls = true
  block_public_policy = true
  ignore_public_acls = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "zero_trust_audit" {
  bucket = aws_s3_bucket.zero_trust_audit.id
  
  versioning_configuration {
    status = "Enabled"
  }
}

# GuardDuty for threat detection
resource "aws_guardduty_detector" "zero_trust" {
  enable = true
  
  datasources {
    s3_logs {
      enable = true
    }
    kubernetes {
      audit_logs {
        enable = true
      }
    }
    malware_protection {
      scan_ec2_instance_with_findings {
        ebs_volumes {
          enable = true
        }
      }
    }
  }
  
  tags = {
    Name = "zero-trust-guardduty"
    SecurityModel = "zero-trust"
    Component = "threat-detection"
  }
}

# Random ID for unique resource naming
resource "random_id" "bucket_suffix" {
  byte_length = 4
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}
```

## Instructions

### 1. Configure Zero-Trust Infrastructure

Set up your zero-trust infrastructure with comprehensive security controls:

```bash
# Install zero-trust security tools
curl -sSL https://github.com/open-policy-agent/opa/releases/latest/download/opa_linux_amd64 -o opa
chmod +x opa && sudo mv opa /usr/local/bin/

# Install Istio service mesh for zero-trust networking
curl -L https://istio.io/downloadIstio | sh -
sudo mv istio-*/bin/istioctl /usr/local/bin/

# Install Falco for runtime security
curl -s https://falco.org/repo/falcosecurity-3672BA8F.asc | sudo apt-key add -
echo "deb https://download.falco.org/packages/deb stable main" | sudo tee -a /etc/apt/sources.list.d/falcosecurity.list
sudo apt-get update && sudo apt-get install falco

# Set up zero-trust environment
export ZERO_TRUST_ENABLED=true
export IDENTITY_VERIFICATION=continuous
export MICRO_SEGMENTATION=enabled
export THREAT_DETECTION=ai-powered
```

### 2. Define Zero-Trust Strategy

Create comprehensive zero-trust strategy with identity-centric security:

```typescript
// Define zero-trust objectives
const zeroTrustObjectives = {
  identity: { verification: 'continuous', mfa: 'required', governance: 'automated' },
  network: { segmentation: 'micro', encryption: 'end-to-end', monitoring: 'comprehensive' },
  data: { classification: 'automated', protection: 'context-aware', governance: 'policy-driven' },
  applications: { security: 'built-in', monitoring: 'real-time', compliance: 'continuous' }
};

// Configure identity and access management
const identityStrategy = {
  providers: ['azure-ad', 'okta', 'ping-identity'],
  authentication: {
    methods: ['password', 'mfa', 'biometric', 'certificate'],
    adaptive: true,
    riskBased: true
  },
  authorization: {
    model: 'rbac-abac-hybrid',
    policies: 'dynamic',
    enforcement: 'real-time'
  }
};
```

### 3. Implement Identity-Centric Architecture

Configure comprehensive identity management and federation:

```typescript
// Set up identity-centric architecture
const identityArchitectureConfig = {
  federation: {
    providers: identityStrategy.providers,
    sso: 'saml-oidc',
    provisioning: 'automated',
    deprovisioning: 'immediate'
  },
  governance: {
    lifecycle: 'automated',
    access_reviews: 'periodic',
    privileged_access: 'just-in-time',
    compliance: 'continuous'
  },
  verification: {
    frequency: 'continuous',
    factors: 'multiple',
    risk_assessment: 'real-time',
    adaptation: 'intelligent'
  }
};

// Enable micro-segmentation
const microSegmentationConfig = {
  network: {
    policies: 'least-privilege',
    enforcement: 'real-time',
    monitoring: 'comprehensive'
  },
  application: {
    isolation: 'container-level',
    communication: 'encrypted',
    authorization: 'service-to-service'
  }
};
```

### 4. Deploy Zero-Trust Security Controls

Implement comprehensive zero-trust security controls:

```typescript
// Configure zero-trust security controls
const securityControlsConfig = {
  networkSecurity: {
    serviceMesh: 'istio',
    mtls: 'strict',
    networkPolicies: 'deny-by-default',
    trafficEncryption: 'end-to-end'
  },
  applicationSecurity: {
    podSecurityStandards: 'restricted',
    admissionControl: 'opa-gatekeeper',
    runtimeSecurity: 'falco',
    vulnerabilityScanning: 'continuous'
  },
  dataSecurity: {
    encryption: 'at-rest-in-transit',
    classification: 'automated',
    dlp: 'enabled',
    backup: 'encrypted'
  }
};

// Execute zero-trust deployment
const zeroTrustDeployment = await zeroTrustOrchestrator.deploy({
  identity: identityArchitectureConfig,
  segmentation: microSegmentationConfig,
  security: securityControlsConfig,
  intelligence: { aiDriven: true, adaptive: true }
});
```

### 5. Configure Continuous Verification

Implement continuous verification and adaptive security:

```typescript
// Set up continuous verification
const continuousVerificationConfig = {
  behaviorAnalysis: {
    enabled: true,
    algorithms: ['statistical', 'ml-based', 'pattern-recognition'],
    sensitivity: 'adaptive',
    learning: 'continuous'
  },
  riskAssessment: {
    factors: ['identity', 'device', 'location', 'behavior', 'network'],
    scoring: 'real-time',
    thresholds: 'dynamic',
    actions: 'automated'
  },
  adaptiveControls: {
    authentication: 'risk-based',
    authorization: 'context-aware',
    access: 'just-in-time',
    monitoring: 'comprehensive'
  }
};

// Configure threat intelligence integration
const threatIntelligenceConfig = {
  sources: ['commercial', 'open-source', 'government', 'industry'],
  processing: 'ai-powered',
  correlation: 'real-time',
  response: 'automated'
};
```

### 6. Monitor and Optimize Zero-Trust Security

Implement comprehensive monitoring with intelligent optimization:

```typescript
// Set up zero-trust monitoring and optimization
const monitoringConfig = {
  metrics: {
    identity: ['authentication-success-rate', 'authorization-decisions', 'identity-lifecycle'],
    network: ['traffic-patterns', 'policy-violations', 'encryption-coverage'],
    security: ['threat-detection-rate', 'incident-response-time', 'compliance-score']
  },
  optimization: {
    automated: true,
    intelligent: true,
    continuous: true,
    adaptive: true
  },
  alerting: {
    intelligent: true,
    contextual: true,
    predictive: true
  }
};

// Generate intelligent recommendations
const recommendations = await zeroTrustAnalyzer.generateRecommendations({
  security: zeroTrustDeployment.securityPosture,
  compliance: zeroTrustDeployment.complianceScore,
  performance: zeroTrustDeployment.performance,
  intelligence: { aiDriven: true, predictive: true }
});
```
## Implementation Patterns

### Zero-Trust Service Mesh Configuration

```yaml
# istio/zero-trust-service-mesh.yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  name: zero-trust-control-plane
spec:
  values:
    global:
      meshID: zero-trust-mesh
      network: zero-trust-network
      
    pilot:
      env:
        EXTERNAL_ISTIOD: false
        PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION: true
        PILOT_ENABLE_CROSS_CLUSTER_WORKLOAD_ENTRY: true
  
  components:
    pilot:
      k8s:
        env:
        - name: PILOT_ENABLE_WORKLOAD_ENTRY_AUTOREGISTRATION
          value: "true"
        - name: PILOT_ENABLE_CROSS_CLUSTER_WORKLOAD_ENTRY
          value: "true"
        - name: PILOT_ENABLE_STATUS
          value: "true"
    
    ingressGateways:
    - name: istio-ingressgateway
      enabled: true
      k8s:
        service:
          type: LoadBalancer
        env:
        - name: ISTIO_META_ROUTER_MODE
          value: "sni-dnat"
    
    egressGateways:
    - name: istio-egressgateway
      enabled: true
      k8s:
        env:
        - name: ISTIO_META_ROUTER_MODE
          value: "sni-dnat"

---
# Strict mTLS policy for zero-trust
apiVersion: security.istio.io/v1beta1
kind: PeerAuthentication
metadata:
  name: zero-trust-strict-mtls
  namespace: istio-system
spec:
  mtls:
    mode: STRICT

---
# Default deny authorization policy
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: zero-trust-default-deny
  namespace: istio-system
spec:
  # Empty spec means deny all

---
# Identity-based authorization policies
apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata:
  name: zero-trust-identity-based-authz
  namespace: production
spec:
  selector:
    matchLabels:
      app: web-application
  
  rules:
  - from:
    - source:
        principals: ["cluster.local/ns/production/sa/web-service-account"]
    - source:
        requestPrincipals: ["https://accounts.google.com/oauth2/v2/userinfo/user@company.com"]
    to:
    - operation:
        methods: ["GET", "POST", "PUT", "DELETE"]
        paths: ["/api/v1/*"]
    when:
    - key: source.certificate_fingerprint
      values: ["sha256:1234567890abcdef..."]
    - key: request.headers[x-forwarded-for]
      notValues: ["*malicious-ip*"]
    - key: request.time
      values: ["09:00:00", "17:00:00"] # Business hours only

---
# Request authentication with JWT validation
apiVersion: security.istio.io/v1beta1
kind: RequestAuthentication
metadata:
  name: zero-trust-jwt-auth
  namespace: production
spec:
  selector:
    matchLabels:
      app: web-application
  
  jwtRules:
  - issuer: "https://accounts.google.com"
    jwksUri: "https://www.googleapis.com/oauth2/v3/certs"
    audiences:
    - "web-application.company.com"
    forwardOriginalToken: true
  
  - issuer: "https://login.microsoftonline.com/tenant-id/v2.0"
    jwksUri: "https://login.microsoftonline.com/tenant-id/discovery/v2.0/keys"
    audiences:
    - "api://web-application"
    forwardOriginalToken: true

---
# Telemetry configuration for zero-trust monitoring
apiVersion: telemetry.istio.io/v1alpha1
kind: Telemetry
metadata:
  name: zero-trust-telemetry
  namespace: istio-system
spec:
  metrics:
  - providers:
    - name: prometheus
  - overrides:
    - match:
        metric: ALL_METRICS
      tagOverrides:
        source_principal:
          value: "%{SOURCE_PRINCIPAL}"
        destination_principal:
          value: "%{DESTINATION_PRINCIPAL}"
        request_id:
          value: "%{REQUEST_ID}"
  
  accessLogging:
  - providers:
    - name: otel
  - format:
      labels:
        source_principal: "%{SOURCE_PRINCIPAL}"
        destination_principal: "%{DESTINATION_PRINCIPAL}"
        request_id: "%{REQUEST_ID}"
        response_code: "%{RESPONSE_CODE}"
        request_duration: "%{DURATION}"
```

### Open Policy Agent (OPA) Zero-Trust Policies

```rego
# opa/zero-trust-policies.rego
package kubernetes.admission

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# Default deny policy
default allow = false

# Allow if all zero-trust requirements are met
allow if {
    input.request.kind.kind == "Pod"
    zero_trust_compliant
}

# Zero-trust compliance checks
zero_trust_compliant if {
    has_service_account
    has_security_context
    has_resource_limits
    has_network_policies
    has_pod_security_standards
    not_privileged
    not_host_network
    not_host_pid
}

# Service account requirement
has_service_account if {
    input.request.object.spec.serviceAccountName
    input.request.object.spec.serviceAccountName != "default"
}

# Security context requirements
has_security_context if {
    security_context := input.request.object.spec.securityContext
    security_context.runAsNonRoot == true
    security_context.runAsUser > 0
    security_context.fsGroup > 0
}

# Resource limits requirement
has_resource_limits if {
    container := input.request.object.spec.containers[_]
    container.resources.limits.memory
    container.resources.limits.cpu
    container.resources.requests.memory
    container.resources.requests.cpu
}

# Network policies requirement (check if namespace has network policies)
has_network_policies if {
    # This would typically check external data about network policies
    # For this example, we assume it's validated externally
    true
}

# Pod security standards requirement
has_pod_security_standards if {
    container := input.request.object.spec.containers[_]
    container_security := container.securityContext
    container_security.allowPrivilegeEscalation == false
    container_security.readOnlyRootFilesystem == true
    container_security.runAsNonRoot == true
    "ALL" in container_security.capabilities.drop
}

# Not privileged requirement
not_privileged if {
    container := input.request.object.spec.containers[_]
    container.securityContext.privileged != true
}

# Not host network requirement
not_host_network if {
    input.request.object.spec.hostNetwork != true
}

# Not host PID requirement
not_host_pid if {
    input.request.object.spec.hostPID != true
}

# Identity-based authorization policy
package kubernetes.authz

import future.keywords.contains
import future.keywords.if
import future.keywords.in

# Default deny
default allow = false

# Allow based on identity and context
allow if {
    identity_verified
    context_appropriate
    action_authorized
}

# Identity verification
identity_verified if {
    # Check if user has valid identity
    input.user.username
    input.user.groups
    
    # Verify identity provider
    valid_identity_provider
    
    # Check MFA status
    mfa_verified
}

# Valid identity provider check
valid_identity_provider if {
    provider := input.user.extra["oidc.issuer"][0]
    provider in [
        "https://accounts.google.com",
        "https://login.microsoftonline.com/tenant-id/v2.0",
        "https://company.okta.com"
    ]
}

# MFA verification
mfa_verified if {
    amr := input.user.extra["oidc.amr"][0]
    "mfa" in split(amr, ",")
}

# Context appropriateness
context_appropriate if {
    # Check time-based access
    time_based_access_allowed
    
    # Check location-based access
    location_based_access_allowed
    
    # Check device-based access
    device_based_access_allowed
}

# Time-based access control
time_based_access_allowed if {
    current_hour := time.now_ns() / 1000000000 / 3600 % 24
    current_hour >= 9  # 9 AM
    current_hour <= 17 # 5 PM
}

# Location-based access control
location_based_access_allowed if {
    source_ip := input.request.remoteAddr
    # Check if IP is from allowed ranges
    net.cidr_contains("10.0.0.0/8", source_ip)
}

# Device-based access control
device_based_access_allowed if {
    device_id := input.user.extra["device_id"][0]
    device_id in data.trusted_devices
}

# Action authorization
action_authorized if {
    # Check RBAC permissions
    rbac_authorized
    
    # Check ABAC policies
    abac_authorized
    
    # Check resource-specific permissions
    resource_authorized
}

# RBAC authorization
rbac_authorized if {
    user_groups := input.user.groups
    required_group := data.rbac_policies[input.request.resource.resource][input.request.verb]
    required_group in user_groups
}

# ABAC authorization
abac_authorized if {
    # Attribute-based access control logic
    user_attributes := input.user.extra
    resource_attributes := input.request.object.metadata.labels
    
    # Example: Only allow access to resources with matching department
    user_attributes["department"][0] == resource_attributes["department"]
}

# Resource-specific authorization
resource_authorized if {
    # Check if user has access to specific resource
    resource_name := input.request.object.metadata.name
    namespace := input.request.object.metadata.namespace
    
    # Check ownership or delegation
    resource_accessible(input.user.username, namespace, resource_name)
}

# Helper function to check resource accessibility
resource_accessible(username, namespace, resource) if {
    # This would typically check external data about resource ownership
    # For this example, we assume it's validated externally
    true
}
```

### Falco Zero-Trust Runtime Security Rules

```yaml
# falco/zero-trust-rules.yaml
- rule: Zero Trust - Unauthorized Process Execution
  desc: Detect unauthorized process execution in zero-trust environment
  condition: >
    spawned_process and
    not container and
    not proc.name in (authorized_processes) and
    not proc.pname in (authorized_parent_processes)
  output: >
    Unauthorized process execution detected in zero-trust environment
    (user=%user.name command=%proc.cmdline pid=%proc.pid ppid=%proc.ppid
    container_id=%container.id image=%container.image.repository)
  priority: HIGH
  tags: [zero-trust, process, unauthorized]

- rule: Zero Trust - Suspicious Network Activity
  desc: Detect suspicious network activity violating zero-trust principles
  condition: >
    inbound_outbound and
    not fd.typechar=4 and
    not fd.name in (authorized_network_connections) and
    not proc.name in (authorized_network_processes)
  output: >
    Suspicious network activity detected in zero-trust environment
    (user=%user.name command=%proc.cmdline connection=%fd.name
    container_id=%container.id image=%container.image.repository)
  priority: HIGH
  tags: [zero-trust, network, suspicious]

- rule: Zero Trust - Privilege Escalation Attempt
  desc: Detect privilege escalation attempts in zero-trust environment
  condition: >
    spawned_process and
    proc.name in (privilege_escalation_binaries) and
    not user.name in (authorized_privileged_users)
  output: >
    Privilege escalation attempt detected in zero-trust environment
    (user=%user.name command=%proc.cmdline binary=%proc.name
    container_id=%container.id image=%container.image.repository)
  priority: CRITICAL
  tags: [zero-trust, privilege-escalation, critical]

- rule: Zero Trust - Unauthorized File Access
  desc: Detect unauthorized file access in zero-trust environment
  condition: >
    open_read and
    fd.name startswith /etc/ and
    not proc.name in (authorized_config_readers) and
    not user.name in (authorized_config_users)
  output: >
    Unauthorized file access detected in zero-trust environment
    (user=%user.name command=%proc.cmdline file=%fd.name
    container_id=%container.id image=%container.image.repository)
  priority: HIGH
  tags: [zero-trust, file-access, unauthorized]

- rule: Zero Trust - Container Escape Attempt
  desc: Detect container escape attempts in zero-trust environment
  condition: >
    spawned_process and
    proc.name in (container_escape_binaries) and
    container
  output: >
    Container escape attempt detected in zero-trust environment
    (user=%user.name command=%proc.cmdline binary=%proc.name
    container_id=%container.id image=%container.image.repository)
  priority: CRITICAL
  tags: [zero-trust, container-escape, critical]

# Authorized processes list
- list: authorized_processes
  items: [
    systemd, kthreadd, ksoftirqd, migration, rcu_gp, rcu_par_gp,
    kworker, mm_percpu_wq, ksoftirqd, migration, rcu_gp, rcu_par_gp,
    bash, sh, ssh, sshd, systemd-logind, systemd-networkd,
    kubelet, containerd, dockerd, runc, pause
  ]

- list: authorized_parent_processes
  items: [
    systemd, kubelet, containerd, dockerd, systemd-logind,
    sshd, bash, sh
  ]

- list: authorized_network_connections
  items: [
    /dev/log, /run/systemd/journal/socket, /run/systemd/notify,
    127.0.0.1, ::1, kubernetes.default.svc.cluster.local
  ]

- list: authorized_network_processes
  items: [
    kubelet, containerd, dockerd, systemd-networkd, systemd-resolved,
    istio-proxy, envoy
  ]

- list: privilege_escalation_binaries
  items: [
    sudo, su, pkexec, doas, setuid, setgid, chmod, chown,
    mount, umount, insmod, rmmod, modprobe
  ]

- list: authorized_privileged_users
  items: [root, system, kubelet]

- list: authorized_config_readers
  items: [
    systemd, kubelet, containerd, dockerd, systemd-networkd,
    systemd-resolved, istio-proxy, envoy
  ]

- list: authorized_config_users
  items: [root, system, kubelet]

- list: container_escape_binaries
  items: [
    nsenter, unshare, chroot, pivot_root, mount, umount,
    docker, kubectl, crictl, runc, ctr
  ]
```

## Expected Output

### Zero-Trust Deployment Results

```json
{
  "deploymentId": "zero-trust-deployment-2024-001",
  "success": true,
  "duration": 3200000,
  "securityAnalysis": {
    "identityAnalysis": {
      "totalIdentities": 1247,
      "highRiskIdentities": 23,
      "complianceScore": 87.3,
      "mfaAdoption": 94.2
    },
    "networkAnalysis": {
      "segmentationScore": 91.5,
      "encryptionCoverage": 98.7,
      "policyCompliance": 89.1
    },
    "readinessScore": 88.7,
    "securityGaps": [
      {
        "category": "identity-governance",
        "severity": "medium",
        "description": "Privileged access review cycle needs optimization"
      },
      {
        "category": "network-segmentation",
        "severity": "low",
        "description": "Some legacy applications need micro-segmentation"
      }
    ]
  },
  "identityArchitecture": {
    "identityFederation": {
      "providers": 3,
      "ssoEnabled": true,
      "provisioningAutomated": true
    },
    "mfaConfiguration": {
      "coverage": 94.2,
      "methods": ["totp", "push", "biometric", "hardware-token"],
      "adaptiveEnabled": true
    },
    "identities": 1247,
    "securityScore": 91.8
  },
  "microSegmentation": {
    "segments": 45,
    "networkPolicies": 127,
    "applicationSegmentation": 89,
    "policyCompliance": 92.4
  },
  "continuousVerification": {
    "behaviorMonitoring": {
      "enabled": true,
      "accuracy": 94.7,
      "anomaliesDetected": 12
    },
    "riskBasedAuth": {
      "enabled": true,
      "accuracy": 91.3,
      "adaptiveActions": 156
    },
    "verificationScore": 93.1
  },
  "threatIntelligenceIntegration": {
    "threatDetectionAccuracy": 96.2,
    "responseEffectiveness": 88.9,
    "automatedResponses": 234,
    "falsePositiveRate": 2.1
  },
  "complianceValidation": {
    "securityScore": 92.4,
    "frameworks": ["NIST", "ISO27001", "SOC2", "PCI-DSS"],
    "compliancePercentage": 94.7,
    "violations": 8,
    "autoRemediated": 156
  },
  "recommendations": [
    "Implement just-in-time privileged access for administrative accounts",
    "Enable advanced threat protection for legacy applications",
    "Optimize network policies for better performance",
    "Enhance behavioral analysis with additional data sources"
  ]
}
```

### Continuous Verification Results

```json
{
  "continuousVerificationResults": {
    "verificationId": "continuous-verification-001",
    "behaviorMonitoring": {
      "usersMonitored": 1247,
      "behaviorPatterns": 3456,
      "anomaliesDetected": 12,
      "accuracy": 94.7,
      "falsePositiveRate": 1.8
    },
    "riskBasedAuth": {
      "riskAssessments": 15678,
      "highRiskSessions": 89,
      "adaptiveActions": 156,
      "authenticationAccuracy": 91.3,
      "userExperienceScore": 87.2
    },
    "adaptiveAccessControls": {
      "accessDecisions": 23456,
      "contextualFactors": ["location", "device", "time", "behavior", "network"],
      "policyAdjustments": 234,
      "accessDenials": 45,
      "complianceScore": 93.8
    },
    "complianceMonitoring": {
      "complianceChecks": 5678,
      "violations": 8,
      "autoRemediated": 156,
      "manualReviewRequired": 3,
      "compliancePercentage": 94.7
    },
    "performanceMetrics": {
      "averageVerificationTime": "120ms",
      "systemLatency": "45ms",
      "userSatisfactionScore": 8.7,
      "securityEffectiveness": 92.4
    }
  }
}
```

## Integration Points

### CI/CD Pipeline Integration

```yaml
# .github/workflows/zero-trust-deployment.yml
name: Zero-Trust Deployment Pipeline

on:
  push:
    branches: [main, develop]
    paths: ['security/**', 'infrastructure/**']
  pull_request:
    branches: [main]
    paths: ['security/**', 'infrastructure/**']

jobs:
  zero-trust-security-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Zero-Trust Security Tools
        run: |
          # Install OPA for policy validation
          curl -L -o opa https://openpolicyagent.org/downloads/v0.57.0/opa_linux_amd64_static
          chmod +x opa && sudo mv opa /usr/local/bin/
          
          # Install Falco for runtime security
          curl -s https://falco.org/repo/falcosecurity-3672BA8F.asc | sudo apt-key add -
          echo "deb https://download.falco.org/packages/deb stable main" | sudo tee -a /etc/apt/sources.list.d/falcosecurity.list
          sudo apt-get update && sudo apt-get install falco
          
          # Install security scanning tools
          curl -sSfL https://raw.githubusercontent.com/anchore/grype/main/install.sh | sh -s -- -b /usr/local/bin
          
      - name: Zero-Trust Policy Validation
        run: |
          # Validate OPA policies
          opa fmt --diff security/policies/
          opa test security/policies/
          
          # Validate Kubernetes manifests against zero-trust policies
          opa eval -d security/policies/ -i kubernetes/manifests/ \
            "data.kubernetes.admission.allow"
          
      - name: Security Posture Analysis
        run: |
          # Analyze current security posture
          python scripts/analyze-security-posture.py \
            --environment ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }} \
            --zero-trust-enabled true \
            --output security-analysis.json
          
          # Validate identity and access management
          python scripts/validate-identity-management.py \
            --identity-providers azure-ad,okta \
            --mfa-required true \
            --output identity-validation.json
          
      - name: Deploy Zero-Trust Infrastructure
        run: |
          # Deploy with zero-trust security controls
          kubectl apply -f kubernetes/zero-trust/
          
          # Configure service mesh for zero-trust
          istioctl install -f istio/zero-trust-service-mesh.yaml
          
          # Deploy security monitoring
          kubectl apply -f security/monitoring/
          
      - name: Continuous Verification Setup
        run: |
          # Configure continuous verification
          python scripts/setup-continuous-verification.py \
            --behavior-analysis ml-based \
            --risk-assessment real-time \
            --adaptive-controls enabled
          
          # Deploy threat detection
          python scripts/deploy-threat-detection.py \
            --ai-powered true \
            --threat-intelligence enabled \
            --automated-response true
          
      - name: Validate Zero-Trust Deployment
        run: |
          # Comprehensive zero-trust validation
          python scripts/validate-zero-trust-deployment.py \
            --environment ${{ github.ref == 'refs/heads/main' && 'production' || 'staging' }} \
            --validation-suite comprehensive \
            --timeout 900
          
          # Security and compliance validation
          python scripts/validate-security-compliance.py \
            --frameworks NIST,ISO27001,SOC2,PCI-DSS \
            --zero-trust-requirements true
```

### Monitoring and Observability Integration

```typescript
// Integration with monitoring platforms
interface ZeroTrustMonitoringIntegration {
  securityMonitoring: {
    siem: string[];
    soar: string[];
    threatIntelligence: string[];
  };
  
  identityMonitoring: {
    identityProviders: string[];
    accessAnalytics: boolean;
    behaviorAnalytics: boolean;
  };
  
  networkMonitoring: {
    serviceMesh: boolean;
    networkPolicies: boolean;
    trafficAnalysis: boolean;
  };
}

// Zero-trust security correlation
const zeroTrustSecurityCorrelation = {
  metrics: {
    identity: ["authentication-success-rate", "mfa-adoption", "privileged-access-usage"],
    network: ["policy-violations", "encryption-coverage", "segmentation-effectiveness"],
    security: ["threat-detection-rate", "incident-response-time", "compliance-score"]
  },
  
  optimization: [
    "Optimize identity verification based on risk patterns",
    "Enhance network segmentation based on traffic analysis",
    "Improve threat detection based on behavioral analytics"
  ]
};
```

## Security Considerations

### Advanced Zero-Trust Security

```typescript
interface AdvancedZeroTrustSecurityConfig {
  identitySecurity: {
    continuousVerification: boolean;
    behaviorAnalytics: boolean;
    riskBasedAuthentication: boolean;
    privilegedAccessManagement: boolean;
  };
  
  networkSecurity: {
    microSegmentation: boolean;
    encryptionEverywhere: boolean;
    networkPolicyEnforcement: boolean;
    trafficInspection: boolean;
  };
  
  dataSecurity: {
    dataClassification: boolean;
    contextAwareProtection: boolean;
    dataLossPrevention: boolean;
    encryptionAtRest: boolean;
  };
  
  applicationSecurity: {
    runtimeProtection: boolean;
    vulnerabilityManagement: boolean;
    secureCodePractices: boolean;
    containerSecurity: boolean;
  };
}

// Advanced zero-trust security patterns
const advancedZeroTrustSecurityPatterns = {
  identitySecurity: [
    "Continuous identity verification with behavioral analytics",
    "Risk-based adaptive authentication",
    "Just-in-time privileged access management"
  ],
  
  networkSecurity: [
    "Micro-segmentation with dynamic policy enforcement",
    "End-to-end encryption for all communications",
    "Real-time network traffic analysis and inspection"
  ],
  
  dataSecurity: [
    "Automated data classification and labeling",
    "Context-aware data protection policies",
    "Advanced data loss prevention with ML"
  ],
  
  applicationSecurity: [
    "Runtime application self-protection (RASP)",
    "Continuous vulnerability assessment and remediation",
    "Secure-by-design development practices"
  ]
};
```

## Performance Features

### High-Performance Zero-Trust Architecture

```typescript
interface ZeroTrustPerformanceOptimization {
  identityPerformance: {
    cachingStrategies: string[];
    sessionOptimization: boolean;
    federationOptimization: boolean;
  };
  
  networkPerformance: {
    serviceMeshOptimization: boolean;
    policyOptimization: boolean;
    trafficOptimization: boolean;
  };
  
  securityPerformance: {
    threatDetectionOptimization: boolean;
    responseTimeOptimization: boolean;
    resourceOptimization: boolean;
  };
}

// AI-driven zero-trust optimization
const aiZeroTrustOptimization = {
  models: {
    identityOptimization: { accuracy: 0.93, updateFrequency: "real-time" },
    threatDetection: { accuracy: 0.96, updateFrequency: "continuous" },
    policyOptimization: { efficiency: 0.89, adaptation: "dynamic" }
  },
  
  automation: {
    identityManagement: "ai-driven",
    threatResponse: "automated",
    policyEnforcement: "intelligent",
    complianceManagement: "continuous"
  }
};
```
