# Modern Deployment Patterns Template

## Purpose

This template provides comprehensive patterns for implementing modern deployment strategies including blue-green deployments, canary releases, feature flag integration, and serverless orchestration. It covers zero-downtime deployments, gradual rollouts, risk mitigation, and automated rollback mechanisms for production-ready applications.

## Context

Modern applications require sophisticated deployment strategies to minimize risk, ensure zero downtime, and enable rapid iteration. This template addresses the complexity of implementing advanced deployment patterns while maintaining system reliability, monitoring deployment health, and providing automated recovery mechanisms for production environments.

## Examples

### Example 1: Blue-Green Deployment
```yaml
# Zero-downtime deployment with instant rollback capability
# Two identical production environments (blue/green)
# Traffic switches between environments after validation
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: blue-green-app
spec:
  strategy:
    blueGreen:
      activeService: app-active
      previewService: app-preview
      autoPromotionEnabled: false
      scaleDownDelaySeconds: 30
```

### Example 2: Canary Release
```yaml
# Gradual traffic shift with automated monitoring
# 10% -> 25% -> 50% -> 100% traffic progression
# Automatic rollback on error rate threshold
spec:
  strategy:
    canary:
      steps:
      - setWeight: 10
      - pause: {duration: 5m}
      - setWeight: 25
      - pause: {duration: 10m}
      - setWeight: 50
      - pause: {duration: 15m}
```

### Example 3: Feature Flag Integration
```typescript
// Runtime feature toggling with user segmentation
const featureFlag = await featureFlags.evaluate('new-checkout-flow', {
  userId: user.id,
  userSegment: user.segment,
  environment: process.env.NODE_ENV
});

if (featureFlag.enabled) {
  return renderNewCheckoutFlow();
} else {
  return renderLegacyCheckoutFlow();
}
```

## Instructions

### Deployment Strategy Selection

Choose the appropriate deployment strategy based on your requirements:

| Strategy | Risk Level | Rollback Speed | Resource Usage | Best For |
|----------|------------|----------------|----------------|----------|
| **Blue-Green** | Low | Instant | High (2x resources) | Critical systems, instant rollback needed |
| **Canary** | Very Low | Fast | Medium | Gradual validation, user feedback |
| **Rolling** | Medium | Medium | Low | Resource-constrained environments |
| **Feature Flags** | Minimal | Instant | Low | A/B testing, gradual feature rollout |

### Blue-Green Deployment Implementation

```yaml
# Kubernetes Blue-Green with Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: blue-green-rollout
  namespace: production
spec:
  replicas: 5
  strategy:
    blueGreen:
      # Active service (receives production traffic)
      activeService: app-active
      # Preview service (for testing new version)
      previewService: app-preview
      # Automatic promotion disabled for manual approval
      autoPromotionEnabled: false
      # Time to wait before scaling down old version
      scaleDownDelaySeconds: 30
      # Pre-promotion analysis
      prePromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: app-preview
      # Post-promotion analysis
      postPromotionAnalysis:
        templates:
        - templateName: success-rate
        args:
        - name: service-name
          value: app-active
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080
        # Health checks for deployment validation
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
# Active Service (Production Traffic)
apiVersion: v1
kind: Service
metadata:
  name: app-active
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer

---
# Preview Service (Testing New Version)
apiVersion: v1
kind: Service
metadata:
  name: app-preview
spec:
  selector:
    app: myapp
  ports:
  - port: 80
    targetPort: 8080
  type: ClusterIP

---
# Analysis Template for Success Rate Monitoring
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: success-rate
spec:
  args:
  - name: service-name
  metrics:
  - name: success-rate
    interval: 5m
    count: 3
    successCondition: result[0] >= 0.95
    failureLimit: 1
    provider:
      prometheus:
        address: http://prometheus.monitoring.svc.cluster.local:9090
        query: |
          sum(irate(
            http_requests_total{job="{{args.service-name}}",status!~"5.."}[5m]
          )) / 
          sum(irate(
            http_requests_total{job="{{args.service-name}}"}[5m]
          ))
```

### Canary Release Implementation

```yaml
# Kubernetes Canary with Argo Rollouts
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: canary-rollout
spec:
  replicas: 10
  strategy:
    canary:
      # Canary service for new version traffic
      canaryService: app-canary
      # Stable service for current version traffic
      stableService: app-stable
      # Traffic routing configuration
      trafficRouting:
        nginx:
          stableIngress: app-ingress
          annotationPrefix: nginx.ingress.kubernetes.io
          additionalIngressAnnotations:
            canary-by-header: X-Canary
            canary-by-header-value: "true"
      # Deployment steps with analysis
      steps:
      # Start with 10% traffic to canary
      - setWeight: 10
      - pause:
          duration: 5m
      # Run analysis on canary performance
      - analysis:
          templates:
          - templateName: canary-success-rate
          args:
          - name: canary-hash
            valueFrom:
              podTemplateHashValue: Latest
      # Increase to 25% if analysis passes
      - setWeight: 25
      - pause:
          duration: 10m
      # Continue analysis
      - analysis:
          templates:
          - templateName: canary-success-rate
          - templateName: canary-latency
      # Increase to 50%
      - setWeight: 50
      - pause:
          duration: 15m
      # Final analysis before full rollout
      - analysis:
          templates:
          - templateName: canary-success-rate
          - templateName: canary-latency
          - templateName: canary-error-rate
      # Complete rollout to 100%
      - setWeight: 100
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
      - name: myapp
        image: myapp:latest
        ports:
        - containerPort: 8080

---
# Canary Analysis Templates
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: canary-success-rate
spec:
  args:
  - name: canary-hash
  metrics:
  - name: success-rate
    interval: 2m
    count: 5
    successCondition: result[0] >= 0.95
    failureLimit: 2
    provider:
      prometheus:
        address: http://prometheus.monitoring.svc.cluster.local:9090
        query: |
          sum(irate(
            http_requests_total{
              job="myapp",
              rollouts_pod_template_hash="{{args.canary-hash}}",
              status!~"5.."
            }[2m]
          )) / 
          sum(irate(
            http_requests_total{
              job="myapp",
              rollouts_pod_template_hash="{{args.canary-hash}}"
            }[2m]
          ))

---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: canary-latency
spec:
  args:
  - name: canary-hash
  metrics:
  - name: latency-p95
    interval: 2m
    count: 5
    successCondition: result[0] <= 500
    failureLimit: 2
    provider:
      prometheus:
        address: http://prometheus.monitoring.svc.cluster.local:9090
        query: |
          histogram_quantile(0.95,
            sum(rate(
              http_request_duration_seconds_bucket{
                job="myapp",
                rollouts_pod_template_hash="{{args.canary-hash}}"
              }[2m]
            )) by (le)
          ) * 1000
```

### Feature Flag Integration

```typescript
// Feature Flag Service Implementation
import { FeatureFlagProvider, FeatureFlag, UserContext } from './types';

export class FeatureFlagService {
  private providers: Map<string, FeatureFlagProvider> = new Map();
  private cache: Map<string, FeatureFlag> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // LaunchDarkly provider
    this.providers.set('launchdarkly', new LaunchDarklyProvider({
      sdkKey: process.env.LAUNCHDARKLY_SDK_KEY!,
      environment: process.env.NODE_ENV || 'development'
    }));

    // Split.io provider
    this.providers.set('split', new SplitProvider({
      authorizationKey: process.env.SPLIT_API_KEY!,
      environment: process.env.NODE_ENV || 'development'
    }));

    // Custom database provider
    this.providers.set('database', new DatabaseProvider({
      connectionString: process.env.DATABASE_URL!
    }));
  }

  async evaluateFlag(
    flagKey: string, 
    userContext: UserContext,
    defaultValue: boolean = false,
    provider: string = 'launchdarkly'
  ): Promise<FeatureFlag> {
    const cacheKey = `${provider}:${flagKey}:${userContext.userId}`;
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached;
    }

    try {
      const flagProvider = this.providers.get(provider);
      if (!flagProvider) {
        throw new Error(`Provider ${provider} not found`);
      }

      const result = await flagProvider.evaluate(flagKey, userContext, defaultValue);
      
      // Cache the result
      const featureFlag: FeatureFlag = {
        key: flagKey,
        enabled: result.enabled,
        value: result.value,
        variation: result.variation,
        timestamp: Date.now(),
        provider,
        userContext
      };

      this.cache.set(cacheKey, featureFlag);
      
      // Log flag evaluation for analytics
      this.logFlagEvaluation(featureFlag);
      
      return featureFlag;
    } catch (error) {
      console.error(`Feature flag evaluation failed for ${flagKey}:`, error);
      
      // Return default value on error
      return {
        key: flagKey,
        enabled: defaultValue,
        value: defaultValue,
        variation: 'default',
        timestamp: Date.now(),
        provider,
        userContext,
        error: error.message
      };
    }
  }

  async evaluateMultipleFlags(
    flagKeys: string[],
    userContext: UserContext,
    provider: string = 'launchdarkly'
  ): Promise<Map<string, FeatureFlag>> {
    const results = new Map<string, FeatureFlag>();
    
    // Evaluate flags in parallel
    const evaluations = flagKeys.map(async (flagKey) => {
      const flag = await this.evaluateFlag(flagKey, userContext, false, provider);
      return { flagKey, flag };
    });

    const resolvedEvaluations = await Promise.allSettled(evaluations);
    
    resolvedEvaluations.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.set(result.value.flagKey, result.value.flag);
      } else {
        // Handle failed evaluation
        const flagKey = flagKeys[index];
        results.set(flagKey, {
          key: flagKey,
          enabled: false,
          value: false,
          variation: 'error',
          timestamp: Date.now(),
          provider,
          userContext,
          error: result.reason
        });
      }
    });

    return results;
  }

  private logFlagEvaluation(flag: FeatureFlag) {
    // Send to analytics service
    const event = {
      type: 'feature_flag_evaluation',
      timestamp: flag.timestamp,
      flagKey: flag.key,
      enabled: flag.enabled,
      variation: flag.variation,
      userId: flag.userContext.userId,
      userSegment: flag.userContext.segment,
      provider: flag.provider,
      environment: process.env.NODE_ENV
    };

    // Send to analytics (async, don't block)
    this.sendAnalytics(event).catch(error => {
      console.warn('Failed to send flag analytics:', error);
    });
  }

  private async sendAnalytics(event: any) {
    // Implementation depends on your analytics provider
    // Examples: Mixpanel, Amplitude, Google Analytics, etc.
  }
}

// React Hook for Feature Flags
import { useState, useEffect, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';

export function useFeatureFlag(
  flagKey: string, 
  defaultValue: boolean = false
): { enabled: boolean; loading: boolean; error?: string } {
  const [enabled, setEnabled] = useState(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const userContext = useContext(UserContext);

  useEffect(() => {
    let mounted = true;

    const evaluateFlag = async () => {
      try {
        setLoading(true);
        const flag = await featureFlagService.evaluateFlag(
          flagKey, 
          userContext, 
          defaultValue
        );
        
        if (mounted) {
          setEnabled(flag.enabled);
          setError(flag.error);
        }
      } catch (err) {
        if (mounted) {
          setError(err.message);
          setEnabled(defaultValue);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    evaluateFlag();

    return () => {
      mounted = false;
    };
  }, [flagKey, userContext.userId, defaultValue]);

  return { enabled, loading, error };
}

// Feature Flag Component
interface FeatureFlagProps {
  flagKey: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  defaultValue?: boolean;
}

export function FeatureFlag({ 
  flagKey, 
  children, 
  fallback = null, 
  defaultValue = false 
}: FeatureFlagProps) {
  const { enabled, loading } = useFeatureFlag(flagKey, defaultValue);

  if (loading) {
    return <div>Loading...</div>;
  }

  return enabled ? <>{children}</> : <>{fallback}</>;
}

// Usage Examples
function App() {
  return (
    <div>
      {/* Conditional rendering with hook */}
      <NewCheckoutFlow />
      
      {/* Conditional rendering with component */}
      <FeatureFlag 
        flagKey="new-dashboard" 
        fallback={<LegacyDashboard />}
      >
        <NewDashboard />
      </FeatureFlag>
    </div>
  );
}

function NewCheckoutFlow() {
  const { enabled: newCheckoutEnabled } = useFeatureFlag('new-checkout-flow');
  
  if (newCheckoutEnabled) {
    return <EnhancedCheckout />;
  }
  
  return <StandardCheckout />;
}
```

### Serverless Deployment Patterns

```yaml
# serverless.yml - AWS Lambda with API Gateway
service: modern-serverless-app

frameworkVersion: '3'

provider:
  name: aws
  runtime: nodejs18.x
  region: ${opt:region, 'us-east-1'}
  stage: ${opt:stage, 'dev'}
  
  # Environment variables
  environment:
    STAGE: ${self:provider.stage}
    REGION: ${self:provider.region}
    DYNAMODB_TABLE: ${self:service}-${self:provider.stage}-table
    FEATURE_FLAGS_TABLE: ${self:service}-${self:provider.stage}-flags
  
  # IAM permissions
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - dynamodb:Query
            - dynamodb:Scan
            - dynamodb:GetItem
            - dynamodb:PutItem
            - dynamodb:UpdateItem
            - dynamodb:DeleteItem
          Resource:
            - "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.DYNAMODB_TABLE}"
            - "arn:aws:dynamodb:${self:provider.region}:*:table/${self:provider.environment.FEATURE_FLAGS_TABLE}"

# Lambda functions
functions:
  # API Gateway endpoints
  api:
    handler: src/handlers/api.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    # Canary deployment configuration
    deploymentSettings:
      type: Canary10Percent5Minutes
      alias: Live
      preTrafficHook: preTrafficHook
      postTrafficHook: postTrafficHook
      alarms:
        - AliasErrorMetricGreaterThanZeroAlarm
        - AliasLatencyMetricGreaterThan2000Alarm

  # Pre-traffic hook for validation
  preTrafficHook:
    handler: src/hooks/preTraffic.handler
    policies:
      - Version: "2012-10-17"
        Statement:
          - Effect: "Allow"
            Action:
              - "codedeploy:PutLifecycleEventHookExecutionStatus"
            Resource: "*"

  # Post-traffic hook for monitoring
  postTrafficHook:
    handler: src/hooks/postTraffic.handler
    policies:
      - Version: "2012-10-17"
        Statement:
          - Effect: "Allow"
            Action:
              - "codedeploy:PutLifecycleEventHookExecutionStatus"
            Resource: "*"

  # Background processing
  processor:
    handler: src/handlers/processor.handler
    events:
      - sqs:
          arn:
            Fn::GetAtt:
              - ProcessingQueue
              - Arn
          batchSize: 10
          maximumBatchingWindowInSeconds: 5

  # Scheduled tasks
  scheduler:
    handler: src/handlers/scheduler.handler
    events:
      - schedule: rate(5 minutes)

# Custom resources
resources:
  Resources:
    # DynamoDB table
    DynamoDBTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.DYNAMODB_TABLE}
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST

    # Feature flags table
    FeatureFlagsTable:
      Type: AWS::DynamoDB::Table
      Properties:
        TableName: ${self:provider.environment.FEATURE_FLAGS_TABLE}
        AttributeDefinitions:
          - AttributeName: flagKey
            AttributeType: S
        KeySchema:
          - AttributeName: flagKey
            KeyType: HASH
        BillingMode: PAY_PER_REQUEST

    # SQS queue for background processing
    ProcessingQueue:
      Type: AWS::SQS::Queue
      Properties:
        QueueName: ${self:service}-${self:provider.stage}-processing
        VisibilityTimeoutSeconds: 300
        MessageRetentionPeriod: 1209600

    # CloudWatch alarms for canary deployments
    AliasErrorMetricGreaterThanZeroAlarm:
      Type: AWS::CloudWatch::Alarm
      Properties:
        AlarmDescription: Lambda function errors
        ComparisonOperator: GreaterThanThreshold
        EvaluationPeriods: 2
        MetricName: Errors
        Namespace: AWS/Lambda
        Period: 60
        Statistic: Sum
        Threshold: 0
        Dimensions:
          - Name: FunctionName
            Value: !Ref ApiLambdaFunction
          - Name: Resource
            Value: !Sub "${ApiLambdaFunction}:Live"

    AliasLatencyMetricGreaterThan2000Alarm:
      Type: AWS::CloudWatch::Alarm
      Properties:
        AlarmDescription: Lambda function latency
        ComparisonOperator: GreaterThanThreshold
        EvaluationPeriods: 2
        MetricName: Duration
        Namespace: AWS/Lambda
        Period: 60
        Statistic: Average
        Threshold: 2000
        Dimensions:
          - Name: FunctionName
            Value: !Ref ApiLambdaFunction
          - Name: Resource
            Value: !Sub "${ApiLambdaFunction}:Live"

# Plugins
plugins:
  - serverless-plugin-canary-deployments
  - serverless-plugin-warmup
  - serverless-offline
  - serverless-dynamodb-local

# Custom configuration
custom:
  # Warmup configuration
  warmup:
    enabled: true
    events:
      - schedule: rate(5 minutes)
    timeout: 20

  # Offline configuration for local development
  serverless-offline:
    httpPort: 3000
    lambdaPort: 3002
    
  # DynamoDB local for development
  dynamodb:
    start:
      port: 8000
      inMemory: true
      migrate: true
    stages:
      - dev
```

### CI/CD Pipeline Integration

```yaml
# .github/workflows/deploy.yml
name: Modern Deployment Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Run integration tests
      run: npm run test:integration

  build:
    needs: test
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.image.outputs.image }}
      digest: ${{ steps.build.outputs.digest }}
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Docker Buildx
      uses: docker/setup-buildx-action@v3
    
    - name: Login to Container Registry
      uses: docker/login-action@v3
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}
    
    - name: Extract metadata
      id: meta
      uses: docker/metadata-action@v5
      with:
        images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
        tags: |
          type=ref,event=branch
          type=ref,event=pr
          type=sha,prefix={{branch}}-
    
    - name: Build and push
      id: build
      uses: docker/build-push-action@v5
      with:
        context: .
        push: true
        tags: ${{ steps.meta.outputs.tags }}
        labels: ${{ steps.meta.outputs.labels }}
        cache-from: type=gha
        cache-to: type=gha,mode=max
    
    - name: Output image
      id: image
      run: |
        echo "image=${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}@${{ steps.build.outputs.digest }}" >> $GITHUB_OUTPUT

  deploy-staging:
    if: github.ref == 'refs/heads/develop'
    needs: build
    runs-on: ubuntu-latest
    environment: staging
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Deploy to staging (Blue-Green)
      run: |
        # Update image in rollout manifest
        sed -i "s|image: .*|image: ${{ needs.build.outputs.image }}|" k8s/staging/rollout.yaml
        
        # Apply the rollout
        kubectl apply -f k8s/staging/ -n staging
        
        # Wait for rollout to complete
        kubectl rollout status rollout/app-rollout -n staging --timeout=600s

  deploy-production:
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    environment: production
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup kubectl
      uses: azure/setup-kubectl@v3
      with:
        version: 'v1.28.0'
    
    - name: Configure kubectl
      run: |
        echo "${{ secrets.KUBE_CONFIG_PROD }}" | base64 -d > kubeconfig
        export KUBECONFIG=kubeconfig
    
    - name: Deploy to production (Canary)
      run: |
        # Update image in rollout manifest
        sed -i "s|image: .*|image: ${{ needs.build.outputs.image }}|" k8s/production/canary-rollout.yaml
        
        # Apply the rollout
        kubectl apply -f k8s/production/ -n production
        
        # Monitor canary deployment
        kubectl rollout status rollout/app-canary-rollout -n production --timeout=1800s
    
    - name: Notify deployment success
      if: success()
      uses: 8398a7/action-slack@v3
      with:
        status: success
        text: "🚀 Production deployment successful! Canary rollout completed."
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
    
    - name: Notify deployment failure
      if: failure()
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        text: "❌ Production deployment failed! Canary rollout aborted."
      env:
        SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

### Monitoring and Observability

```typescript
// Deployment monitoring service
export class DeploymentMonitor {
  private prometheus: PrometheusService;
  private alertManager: AlertManagerService;
  private slackNotifier: SlackNotifier;

  constructor() {
    this.prometheus = new PrometheusService();
    this.alertManager = new AlertManagerService();
    this.slackNotifier = new SlackNotifier();
  }

  async monitorBlueGreenDeployment(deploymentId: string): Promise<DeploymentStatus> {
    const metrics = await this.collectMetrics(deploymentId);
    
    const healthChecks = [
      this.checkSuccessRate(metrics),
      this.checkLatency(metrics),
      this.checkErrorRate(metrics),
      this.checkResourceUsage(metrics)
    ];

    const results = await Promise.all(healthChecks);
    const overallHealth = results.every(result => result.healthy);

    if (!overallHealth) {
      await this.triggerRollback(deploymentId);
      await this.notifyFailure(deploymentId, results);
    }

    return {
      deploymentId,
      status: overallHealth ? 'healthy' : 'unhealthy',
      metrics,
      checks: results,
      timestamp: new Date()
    };
  }

  async monitorCanaryDeployment(
    deploymentId: string, 
    canaryPercentage: number
  ): Promise<CanaryStatus> {
    const canaryMetrics = await this.collectCanaryMetrics(deploymentId, 'canary');
    const stableMetrics = await this.collectCanaryMetrics(deploymentId, 'stable');

    const comparison = this.compareCanaryToStable(canaryMetrics, stableMetrics);
    
    if (comparison.shouldPromote) {
      await this.promoteCanary(deploymentId);
    } else if (comparison.shouldAbort) {
      await this.abortCanary(deploymentId);
    }

    return {
      deploymentId,
      canaryPercentage,
      canaryMetrics,
      stableMetrics,
      comparison,
      recommendation: comparison.shouldPromote ? 'promote' : 
                     comparison.shouldAbort ? 'abort' : 'continue'
    };
  }

  private async collectMetrics(deploymentId: string) {
    const queries = [
      'sum(rate(http_requests_total[5m])) by (version)',
      'histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, version))',
      'sum(rate(http_requests_total{status=~"5.."}[5m])) by (version)',
      'sum(container_memory_usage_bytes) by (version)',
      'sum(rate(container_cpu_usage_seconds_total[5m])) by (version)'
    ];

    const results = await Promise.all(
      queries.map(query => this.prometheus.query(query))
    );

    return {
      requestRate: results[0],
      latencyP95: results[1],
      errorRate: results[2],
      memoryUsage: results[3],
      cpuUsage: results[4]
    };
  }
}
```

## Expected Output

This template will produce:

- **Blue-Green Deployments**: Zero-downtime deployment configurations with instant rollback
- **Canary Releases**: Gradual traffic shifting with automated monitoring and rollback
- **Feature Flag Systems**: Runtime feature toggling with user segmentation and A/B testing
- **Serverless Patterns**: Function-as-a-Service deployment with canary releases
- **CI/CD Integration**: Automated deployment pipelines with quality gates
- **Monitoring Systems**: Comprehensive deployment health monitoring and alerting
- **Rollback Mechanisms**: Automated failure detection and recovery procedures
- **Multi-Environment Support**: Staging and production deployment strategies

## Integration Points

- Connects with CI/CD pipeline modules for automated deployment workflows
- Integrates with monitoring modules for observability and alerting
- Works with containerization modules for Docker and Kubernetes deployments
- Supports cloud deployment modules for AWS, GCP, and Azure platforms
- Compatible with testing modules for deployment validation and smoke tests

## Security Considerations

- Secure secret management for deployment credentials and API keys
- Network security with proper ingress and egress controls
- Container security scanning and vulnerability assessment
- Access control and RBAC for deployment environments
- Audit logging for all deployment activities and changes

## Performance Features

- Resource optimization for blue-green deployments
- Efficient traffic routing for canary releases
- Caching strategies for feature flag evaluations
- Auto-scaling configuration for serverless functions
- Performance monitoring and alerting thresholds

## Accessibility & Internationalization

- Feature flag support for accessibility feature rollouts
- Gradual deployment of internationalization features
- A/B testing for accessibility improvements
- Regional deployment strategies for global applications
- User preference-based feature flag targeting

This template provides a comprehensive foundation for modern deployment strategies, enabling zero-downtime deployments, risk mitigation, and automated rollback mechanisms for production-ready applications.