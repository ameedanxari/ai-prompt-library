# CI/CD Pipelines Template

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

This template provides comprehensive patterns for implementing CI/CD pipelines including automated builds, testing pipelines, deployment automation, and rollback mechanisms. It covers pipeline orchestration, artifact management, and deployment strategies for continuous delivery.

## Context

Continuous Integration and Continuous Deployment (CI/CD) pipelines are essential for modern software delivery, enabling teams to ship code changes frequently and reliably. This template addresses the challenges of building robust, secure, and efficient pipelines that support multiple environments and deployment strategies.

## Core Components

### Pipeline Configuration Service

## Examples

```typescript
interface PipelineConfigurationService {
  // Pipeline management
  createPipeline(config: PipelineConfig): Promise<Pipeline>;
  updatePipeline(pipelineId: string, config: Partial<PipelineConfig>): Promise<Pipeline>;
  deletePipeline(pipelineId: string): Promise<void>;
  
  // Pipeline execution
  triggerPipeline(pipelineId: string, params?: TriggerParams): Promise<PipelineRun>;
  cancelPipelineRun(runId: string): Promise<void>;
  retryPipelineRun(runId: string, fromStage?: string): Promise<PipelineRun>;
  
  // Pipeline status
  getPipelineStatus(pipelineId: string): Promise<PipelineStatus>;
  getPipelineRunStatus(runId: string): Promise<PipelineRunStatus>;
  getPipelineHistory(pipelineId: string, limit?: number): Promise<PipelineRun[]>;
}


interface PipelineConfig {
  name: string;
  description?: string;
  triggers: PipelineTrigger[];
  stages: PipelineStage[];
  environment?: Record<string, string>;
  secrets?: SecretReference[];
  notifications?: NotificationConfig[];
  timeout?: number;
  concurrency?: ConcurrencyConfig;
}

interface PipelineTrigger {
  type: TriggerType;
  config: TriggerConfig;
  filters?: TriggerFilter[];
}

enum TriggerType {
  PUSH = 'push',
  PULL_REQUEST = 'pull_request',
  TAG = 'tag',
  SCHEDULE = 'schedule',
  MANUAL = 'manual',
  WEBHOOK = 'webhook',
  PIPELINE = 'pipeline'
}

interface PipelineStage {
  name: string;
  jobs: PipelineJob[];
  dependsOn?: string[];
  condition?: StageCondition;
  environment?: string;
  approvals?: ApprovalConfig[];
}

interface PipelineJob {
  name: string;
  runner: RunnerConfig;
  steps: PipelineStep[];
  services?: ServiceContainer[];
  artifacts?: ArtifactConfig;
  cache?: CacheConfig;
  timeout?: number;
  retries?: number;
}

interface PipelineStep {
  name: string;
  type: StepType;
  config: StepConfig;
  condition?: string;
  continueOnError?: boolean;
}

enum StepType {
  SCRIPT = 'script',
  ACTION = 'action',
  DOCKER = 'docker',
  DEPLOY = 'deploy',
  TEST = 'test',
  SCAN = 'scan'
}

interface PipelineRunStatus {
  runId: string;
  pipelineId: string;
  status: RunStatus;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  stages: StageRunStatus[];
  artifacts?: ArtifactInfo[];
  triggeredBy: TriggerInfo;
}

enum RunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  SKIPPED = 'skipped'
}
```

### Artifact Management Service

```typescript
interface ArtifactManagementService {
  // Artifact operations
  uploadArtifact(config: ArtifactUploadConfig): Promise<ArtifactInfo>;
  downloadArtifact(artifactId: string, destination: string): Promise<void>;
  deleteArtifact(artifactId: string): Promise<void>;
  
  // Artifact queries
  listArtifacts(pipelineId: string, filters?: ArtifactFilters): Promise<ArtifactInfo[]>;
  getArtifactMetadata(artifactId: string): Promise<ArtifactMetadata>;
  
  // Retention management
  setRetentionPolicy(pipelineId: string, policy: RetentionPolicy): Promise<void>;
  cleanupArtifacts(pipelineId: string): Promise<CleanupResult>;
}

interface ArtifactUploadConfig {
  name: string;
  path: string;
  type: ArtifactType;
  compression?: CompressionType;
  retention?: RetentionPolicy;
  metadata?: Record<string, string>;
}

enum ArtifactType {
  BUILD = 'build',
  TEST_RESULTS = 'test_results',
  COVERAGE = 'coverage',
  DOCKER_IMAGE = 'docker_image',
  HELM_CHART = 'helm_chart',
  BINARY = 'binary',
  DOCUMENTATION = 'documentation'
}

interface ArtifactInfo {
  id: string;
  name: string;
  type: ArtifactType;
  size: number;
  checksum: string;
  createdAt: Date;
  expiresAt?: Date;
  downloadUrl: string;
  metadata?: Record<string, string>;
}
```

### Deployment Automation Service

```typescript
interface DeploymentAutomationService {
  // Deployment operations
  deploy(config: DeploymentConfig): Promise<Deployment>;
  rollback(deploymentId: string, targetVersion?: string): Promise<Deployment>;
  promote(deploymentId: string, targetEnvironment: string): Promise<Deployment>;
  
  // Deployment status
  getDeploymentStatus(deploymentId: string): Promise<DeploymentStatus>;
  getDeploymentHistory(environment: string, limit?: number): Promise<Deployment[]>;
  
  // Deployment strategies
  configureStrategy(environment: string, strategy: DeploymentStrategy): Promise<void>;
}

interface DeploymentConfig {
  application: string;
  version: string;
  environment: string;
  strategy: DeploymentStrategy;
  healthCheck?: HealthCheckConfig;
  rollbackOnFailure?: boolean;
  notifications?: NotificationConfig[];
}

interface DeploymentStrategy {
  type: StrategyType;
  config: StrategyConfig;
}

enum StrategyType {
  ROLLING = 'rolling',
  BLUE_GREEN = 'blue_green',
  CANARY = 'canary',
  RECREATE = 'recreate',
  A_B_TESTING = 'a_b_testing'
}

interface StrategyConfig {
  // Rolling update config
  maxUnavailable?: string | number;
  maxSurge?: string | number;
  
  // Canary config
  canaryPercentage?: number;
  canaryDuration?: number;
  analysisTemplate?: string;
  
  // Blue-green config
  previewService?: string;
  autoPromotionEnabled?: boolean;
  autoPromotionSeconds?: number;
}

interface DeploymentStatus {
  id: string;
  application: string;
  version: string;
  environment: string;
  status: DeploymentState;
  strategy: StrategyType;
  startTime: Date;
  endTime?: Date;
  replicas: ReplicaStatus;
  healthStatus: HealthStatus;
}

enum DeploymentState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  SUCCESS = 'success',
  FAILED = 'failed',
  ROLLED_BACK = 'rolled_back'
}
```


## Implementation Patterns

### GitHub Actions Pipeline Generator

```typescript
class GitHubActionsGenerator {
  generateWorkflow(config: WorkflowConfig): string {
    return yaml.stringify({
      name: config.name,
      on: this.generateTriggers(config.triggers),
      env: config.environment,
      jobs: this.generateJobs(config.stages)
    });
  }

  private generateTriggers(triggers: PipelineTrigger[]): Record<string, unknown> {
    const on: Record<string, unknown> = {};

    for (const trigger of triggers) {
      switch (trigger.type) {
        case TriggerType.PUSH:
          on.push = {
            branches: trigger.config.branches,
            paths: trigger.config.paths,
            'paths-ignore': trigger.config.pathsIgnore
          };
          break;
        case TriggerType.PULL_REQUEST:
          on.pull_request = {
            branches: trigger.config.branches,
            types: trigger.config.types || ['opened', 'synchronize', 'reopened']
          };
          break;
        case TriggerType.SCHEDULE:
          on.schedule = trigger.config.cron.map((c: string) => ({ cron: c }));
          break;
        case TriggerType.MANUAL:
          on.workflow_dispatch = {
            inputs: trigger.config.inputs
          };
          break;
      }
    }

    return on;
  }

  generateCIWorkflow(config: CIWorkflowConfig): string {
    return `
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  test:
    runs-on: ubuntu-latest
    needs: lint
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ env.NODE_VERSION }}
          cache: 'npm'
      - run: npm ci
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
`;
  }

  generateCDWorkflow(config: CDWorkflowConfig): string {
    return `
name: CD Pipeline

on:
  workflow_run:
    workflows: ["CI Pipeline"]
    types: [completed]
    branches: [main]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: \${{ github.repository }}

jobs:
  deploy-staging:
    if: \${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-kubectl@v3
      - uses: azure/k8s-set-context@v3
        with:
          kubeconfig: \${{ secrets.KUBE_CONFIG_STAGING }}
      - name: Deploy to staging
        run: |
          kubectl set image deployment/${config.appName} \\
            ${config.appName}=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
          kubectl rollout status deployment/${config.appName}

  integration-tests:
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run test:integration
        env:
          API_URL: \${{ secrets.STAGING_API_URL }}

  deploy-production:
    needs: integration-tests
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: azure/setup-kubectl@v3
      - uses: azure/k8s-set-context@v3
        with:
          kubeconfig: \${{ secrets.KUBE_CONFIG_PRODUCTION }}
      - name: Deploy to production
        run: |
          kubectl set image deployment/${config.appName} \\
            ${config.appName}=\${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}:\${{ github.sha }}
          kubectl rollout status deployment/${config.appName}
`;
  }
}
```

### GitLab CI Pipeline Generator

```typescript
class GitLabCIGenerator {
  generatePipeline(config: PipelineConfig): string {
    return yaml.stringify({
      stages: config.stages.map(s => s.name),
      variables: config.environment,
      ...this.generateJobs(config)
    });
  }

  generateFullPipeline(config: FullPipelineConfig): string {
    return `
stages:
  - build
  - test
  - security
  - deploy-staging
  - integration-test
  - deploy-production

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

.docker-build:
  image: docker:24
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

build:
  extends: .docker-build
  stage: build
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  rules:
    - if: $CI_COMMIT_BRANCH

test:
  stage: test
  image: node:20
  script:
    - npm ci
    - npm test -- --coverage
  coverage: '/Lines\\s*:\\s*(\\d+\\.?\\d*)%/'
  artifacts:
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml

security-scan:
  stage: security
  image: 
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image --exit-code 1 --severity HIGH,CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  allow_failure: true

deploy-staging:
  stage: deploy-staging
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context staging
    - kubectl set image deployment/${config.appName} ${config.appName}=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/${config.appName}
  environment:
    name: staging
    url: https://staging.${config.domain}
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

integration-test:
  stage: integration-test
  image: node:20
  script:
    - npm ci
    - npm run test:integration
  needs:
    - deploy-staging
  rules:
    - if: $CI_COMMIT_BRANCH == "main"

deploy-production:
  stage: deploy-production
  image: bitnami/kubectl:latest
  script:
    - kubectl config use-context production
    - kubectl set image deployment/${config.appName} ${config.appName}=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - kubectl rollout status deployment/${config.appName}
  environment:
    name: production
    url: https://${config.domain}
  when: manual
  rules:
    - if: $CI_COMMIT_BRANCH == "main"
`;
  }
}
```


## Integration Points

### ArgoCD Deployment Integration

```typescript
class ArgoCDDeploymentManager {
  async syncApplication(appName: string, revision?: string): Promise<SyncResult> {
    const syncRequest = {
      name: appName,
      revision: revision || 'HEAD',
      prune: true,
      dryRun: false
    };

    const response = await this.argoClient.applicationSync(syncRequest);
    return this.waitForSync(appName, response.operationState.syncResult.revision);
  }

  async rollback(appName: string, revision: string): Promise<RollbackResult> {
    // Get deployment history
    const history = await this.argoClient.getApplicationHistory(appName);
    const targetRevision = history.find(h => h.revision === revision);

    if (!targetRevision) {
      throw new Error(`Revision ${revision} not found in history`);
    }

    // Sync to previous revision
    return this.syncApplication(appName, revision);
  }

  generateApplicationManifest(config: ArgoCDAppConfig): string {
    return yaml.stringify({
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Application',
      metadata: {
        name: config.name,
        namespace: 'argocd'
      },
      spec: {
        project: config.project || 'default',
        source: {
          repoURL: config.repoURL,
          targetRevision: config.targetRevision || 'HEAD',
          path: config.path,
          helm: config.helm ? {
            valueFiles: config.helm.valueFiles,
            parameters: config.helm.parameters
          } : undefined
        },
        destination: {
          server: 'https://kubernetes.default.svc',
          namespace: config.namespace
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true
          },
          syncOptions: ['CreateNamespace=true']
        }
      }
    });
  }
}
```

### Slack Notification Integration

```typescript
class PipelineNotificationService {
  async sendPipelineNotification(event: PipelineEvent): Promise<void> {
    const message = this.formatPipelineMessage(event);
    
    await this.slack.chat.postMessage({
      channel: this.getChannel(event),
      attachments: [{
        color: this.getStatusColor(event.status),
        title: `Pipeline ${event.status}: ${event.pipelineName}`,
        title_link: event.pipelineUrl,
        fields: [
          { title: 'Branch', value: event.branch, short: true },
          { title: 'Commit', value: event.commitSha.substring(0, 7), short: true },
          { title: 'Duration', value: this.formatDuration(event.duration), short: true },
          { title: 'Triggered By', value: event.triggeredBy, short: true }
        ],
        footer: event.repository,
        ts: String(Date.now() / 1000)
      }]
    });
  }

  private getStatusColor(status: RunStatus): string {
    const colors: Record<RunStatus, string> = {
      [RunStatus.SUCCESS]: '#36a64f',
      [RunStatus.FAILED]: '#dc3545',
      [RunStatus.RUNNING]: '#007bff',
      [RunStatus.PENDING]: '#6c757d',
      [RunStatus.CANCELLED]: '#ffc107',
      [RunStatus.SKIPPED]: '#6c757d'
    };
    return colors[status] || '#6c757d';
  }
}
```

## Security Considerations

### Secret Management in Pipelines

```typescript
class PipelineSecretManager {
  // Inject secrets securely into pipeline
  async injectSecrets(runId: string, secrets: SecretReference[]): Promise<void> {
    for (const secret of secrets) {
      const value = await this.secretStore.getSecret(secret.name, secret.version);
      
      // Mask secret in logs
      this.maskSecret(runId, value);
      
      // Set as environment variable
      await this.setEnvironmentVariable(runId, secret.envVar, value);
    }
  }

  // Rotate secrets automatically
  async rotateSecret(secretName: string): Promise<void> {
    const newValue = await this.generateSecretValue(secretName);
    await this.secretStore.updateSecret(secretName, newValue);
    
    // Trigger dependent pipelines to use new secret
    await this.notifyDependentPipelines(secretName);
  }

  // Audit secret access
  async auditSecretAccess(secretName: string, accessor: string): Promise<void> {
    await this.auditLog.log({
      action: 'SECRET_ACCESS',
      secretName,
      accessor,
      timestamp: new Date(),
      pipelineRun: this.currentRunId
    });
  }
}

class PipelineSecurityScanner {
  async scanPipelineConfig(config: PipelineConfig): Promise<SecurityScanResult> {
    const issues: SecurityIssue[] = [];

    // Check for hardcoded secrets
    for (const stage of config.stages) {
      for (const job of stage.jobs) {
        for (const step of job.steps) {
          if (this.containsHardcodedSecret(step.config)) {
            issues.push({
              severity: 'critical',
              type: 'hardcoded_secret',
              location: `${stage.name}/${job.name}/${step.name}`,
              message: 'Hardcoded secret detected in pipeline configuration'
            });
          }
        }
      }
    }

    // Check for insecure configurations
    if (!config.concurrency?.group) {
      issues.push({
        severity: 'medium',
        type: 'missing_concurrency',
        message: 'Pipeline lacks concurrency controls'
      });
    }

    return { issues, passed: issues.filter(i => i.severity === 'critical').length === 0 };
  }
}
```

## Testing Considerations

### Pipeline Testing

```typescript
describe('CI/CD Pipeline Tests', () => {
  it('should generate valid GitHub Actions workflow', () => {
    const generator = new GitHubActionsGenerator();
    const workflow = generator.generateCIWorkflow({
      appName: 'test-app',
      nodeVersion: '20'
    });

    expect(workflow).toContain('name: CI Pipeline');
    expect(workflow).toContain('runs-on: ubuntu-latest');
    expect(workflow).toContain('npm test');
  });

  it('should handle deployment rollback correctly', async () => {
    const deployer = new DeploymentAutomationService();
    
    // Deploy version 2
    const deployment = await deployer.deploy({
      application: 'test-app',
      version: '2.0.0',
      environment: 'staging',
      strategy: { type: StrategyType.ROLLING, config: {} }
    });

    // Rollback to version 1
    const rollback = await deployer.rollback(deployment.id, '1.0.0');
    
    expect(rollback.status).toBe(DeploymentState.SUCCESS);
    expect(rollback.version).toBe('1.0.0');
  });

  it('should detect security issues in pipeline config', async () => {
    const scanner = new PipelineSecurityScanner();
    const result = await scanner.scanPipelineConfig({
      name: 'test-pipeline',
      triggers: [],
      stages: [{
        name: 'build',
        jobs: [{
          name: 'build-job',
          runner: { type: 'ubuntu-latest' },
          steps: [{
            name: 'deploy',
            type: StepType.SCRIPT,
            config: { script: 'echo $SECRET_KEY' }
          }]
        }]
      }]
    });

    expect(result.passed).toBe(true);
  });
});
```

## Configuration Examples

### Complete GitHub Actions Workflow

```yaml
name: Full CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  release:
    types: [published]

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - uses: codecov/codecov-action@v3

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build-and-push:
    needs: [lint-and-test, security-scan]
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    outputs:
      image-tag: ${{ steps.meta.outputs.tags }}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/metadata-action@v5
        id: meta
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=sha
            type=ref,event=branch
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  deploy-staging:
    needs: build-and-push
    runs-on: ubuntu-latest
    environment: staging
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG }}
      - run: |
          helm upgrade --install myapp ./charts/myapp \
            --namespace staging \
            --set image.tag=${{ github.sha }}

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production
    if: github.event_name == 'release'
    steps:
      - uses: actions/checkout@v4
      - uses: azure/k8s-set-context@v3
        with:
          kubeconfig: ${{ secrets.KUBE_CONFIG_PROD }}
      - run: |
          helm upgrade --install myapp ./charts/myapp \
            --namespace production \
            --set image.tag=${{ github.event.release.tag_name }}
```
