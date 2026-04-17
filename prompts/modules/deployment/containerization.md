# Containerization Template

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

This template provides comprehensive patterns for implementing containerization strategies including Docker configurations, container best practices, image optimization, and container security. It covers container lifecycle management, multi-stage builds, and production-ready container deployments.

## Context

Containerization has become the standard for packaging and deploying applications, providing consistency across development, testing, and production environments. This template addresses the challenges of creating efficient, secure, and maintainable container images while following industry best practices for container orchestration readiness.

## Core Components

### Container Configuration Service

## Examples

```typescript
interface ContainerConfigurationService {
  // Image management
  buildImage(config: ImageBuildConfig): Promise<ImageBuildResult>;
  pushImage(image: string, registry: RegistryConfig): Promise<void>;
  pullImage(image: string, registry?: RegistryConfig): Promise<void>;
  
  // Container lifecycle
  createContainer(config: ContainerConfig): Promise<string>;
  startContainer(containerId: string): Promise<void>;
  stopContainer(containerId: string, timeout?: number): Promise<void>;
  removeContainer(containerId: string, force?: boolean): Promise<void>;
  
  // Health and status
  getContainerStatus(containerId: string): Promise<ContainerStatus>;
  getContainerLogs(containerId: string, options?: LogOptions): Promise<string>;
  inspectContainer(containerId: string): Promise<ContainerInspection>;
}


interface ImageBuildConfig {
  dockerfile: string;
  context: string;
  tags: string[];
  buildArgs?: Record<string, string>;
  target?: string;
  platform?: string;
  cache?: CacheConfig;
  secrets?: SecretMount[];
  labels?: Record<string, string>;
}

interface ContainerConfig {
  image: string;
  name?: string;
  command?: string[];
  entrypoint?: string[];
  environment?: Record<string, string>;
  ports?: PortMapping[];
  volumes?: VolumeMount[];
  networks?: string[];
  resources?: ResourceLimits;
  healthCheck?: HealthCheckConfig;
  restartPolicy?: RestartPolicy;
  securityOptions?: SecurityOptions;
}

interface PortMapping {
  containerPort: number;
  hostPort?: number;
  protocol: 'tcp' | 'udp';
  hostIp?: string;
}

interface VolumeMount {
  source: string;
  target: string;
  type: 'bind' | 'volume' | 'tmpfs';
  readOnly?: boolean;
  options?: string[];
}

interface ResourceLimits {
  cpuLimit?: string;
  cpuReservation?: string;
  memoryLimit?: string;
  memoryReservation?: string;
  pidsLimit?: number;
}

interface HealthCheckConfig {
  test: string[];
  interval?: string;
  timeout?: string;
  retries?: number;
  startPeriod?: string;
}

enum RestartPolicy {
  NO = 'no',
  ALWAYS = 'always',
  ON_FAILURE = 'on-failure',
  UNLESS_STOPPED = 'unless-stopped'
}

interface ContainerStatus {
  id: string;
  name: string;
  state: ContainerState;
  health?: HealthStatus;
  startedAt?: Date;
  finishedAt?: Date;
  exitCode?: number;
  error?: string;
}

enum ContainerState {
  CREATED = 'created',
  RUNNING = 'running',
  PAUSED = 'paused',
  RESTARTING = 'restarting',
  REMOVING = 'removing',
  EXITED = 'exited',
  DEAD = 'dead'
}
```

### Image Registry Service

```typescript
interface ImageRegistryService {
  // Registry operations
  login(registry: RegistryConfig): Promise<void>;
  logout(registry: string): Promise<void>;
  
  // Image operations
  listImages(registry: string, repository?: string): Promise<ImageInfo[]>;
  getImageManifest(image: string): Promise<ImageManifest>;
  deleteImage(image: string): Promise<void>;
  
  // Tag management
  tagImage(source: string, target: string): Promise<void>;
  listTags(repository: string): Promise<string[]>;
  
  // Vulnerability scanning
  scanImage(image: string): Promise<VulnerabilityScanResult>;
}

interface RegistryConfig {
  url: string;
  username?: string;
  password?: string;
  token?: string;
  insecure?: boolean;
}

interface ImageInfo {
  repository: string;
  tag: string;
  digest: string;
  size: number;
  created: Date;
  labels?: Record<string, string>;
}

interface ImageManifest {
  schemaVersion: number;
  mediaType: string;
  config: ManifestConfig;
  layers: ManifestLayer[];
}

interface VulnerabilityScanResult {
  image: string;
  scannedAt: Date;
  vulnerabilities: Vulnerability[];
  summary: VulnerabilitySummary;
}

interface Vulnerability {
  id: string;
  severity: VulnerabilitySeverity;
  package: string;
  version: string;
  fixedVersion?: string;
  description: string;
  references: string[];
}

enum VulnerabilitySeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  NEGLIGIBLE = 'negligible',
  UNKNOWN = 'unknown'
}
```


## Implementation Patterns

### Multi-Stage Dockerfile Pattern

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./
RUN npm ci --only=production

# Copy source and build
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine AS production

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy only necessary files from builder
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package.json ./

USER nodejs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["node", "dist/index.js"]
```

### Container Build Service

```typescript
class ContainerBuildService {
  private docker: DockerClient;

  async buildOptimizedImage(config: OptimizedBuildConfig): Promise<ImageBuildResult> {
    const buildContext = await this.prepareBuildContext(config);
    
    const buildOptions: ImageBuildConfig = {
      dockerfile: config.dockerfile,
      context: buildContext.path,
      tags: this.generateTags(config),
      buildArgs: {
        ...config.buildArgs,
        BUILD_DATE: new Date().toISOString(),
        VCS_REF: await this.getGitCommit()
      },
      target: config.target || 'production',
      platform: config.platform || 'linux/amd64',
      cache: {
        type: 'registry',
        ref: `${config.registry}/${config.repository}:cache`
      },
      labels: {
        'org.opencontainers.image.created': new Date().toISOString(),
        'org.opencontainers.image.source': config.sourceUrl,
        'org.opencontainers.image.version': config.version
      }
    };

    const result = await this.docker.buildImage(buildOptions);
    
    // Scan for vulnerabilities
    const scanResult = await this.scanImage(result.imageId);
    if (scanResult.summary.critical > 0) {
      throw new Error(`Image has ${scanResult.summary.critical} critical vulnerabilities`);
    }

    return {
      ...result,
      vulnerabilityScan: scanResult
    };
  }

  private generateTags(config: OptimizedBuildConfig): string[] {
    const tags: string[] = [];
    const baseTag = `${config.registry}/${config.repository}`;

    // Version tag
    tags.push(`${baseTag}:${config.version}`);

    // Latest tag for main branch
    if (config.branch === 'main' || config.branch === 'master') {
      tags.push(`${baseTag}:latest`);
    }

    // Git SHA tag
    if (config.gitSha) {
      tags.push(`${baseTag}:${config.gitSha.substring(0, 7)}`);
    }

    return tags;
  }

  async pushToRegistry(image: string, registry: RegistryConfig): Promise<void> {
    await this.docker.login(registry);
    
    try {
      await this.docker.pushImage(image, registry);
    } finally {
      await this.docker.logout(registry.url);
    }
  }
}
```

### Docker Compose Configuration

```typescript
class DockerComposeManager {
  async generateComposeFile(config: ComposeConfig): Promise<string> {
    const compose: DockerComposeFile = {
      version: '3.8',
      services: {},
      networks: {},
      volumes: {}
    };

    // Generate services
    for (const service of config.services) {
      compose.services[service.name] = this.generateServiceConfig(service);
    }

    // Generate networks
    for (const network of config.networks || []) {
      compose.networks[network.name] = {
        driver: network.driver || 'bridge',
        external: network.external || false
      };
    }

    // Generate volumes
    for (const volume of config.volumes || []) {
      compose.volumes[volume.name] = {
        driver: volume.driver || 'local',
        external: volume.external || false
      };
    }

    return yaml.stringify(compose);
  }

  private generateServiceConfig(service: ServiceConfig): ComposeService {
    return {
      image: service.image,
      build: service.build ? {
        context: service.build.context,
        dockerfile: service.build.dockerfile,
        args: service.build.args
      } : undefined,
      ports: service.ports?.map(p => `${p.host}:${p.container}`),
      environment: service.environment,
      volumes: service.volumes?.map(v => `${v.source}:${v.target}${v.readOnly ? ':ro' : ''}`),
      networks: service.networks,
      depends_on: service.dependsOn,
      restart: service.restart || 'unless-stopped',
      healthcheck: service.healthCheck ? {
        test: service.healthCheck.test,
        interval: service.healthCheck.interval,
        timeout: service.healthCheck.timeout,
        retries: service.healthCheck.retries
      } : undefined,
      deploy: service.deploy ? {
        replicas: service.deploy.replicas,
        resources: {
          limits: service.deploy.resources?.limits,
          reservations: service.deploy.resources?.reservations
        }
      } : undefined
    };
  }
}
```


## Integration Points

### Container Registry Integration

```typescript
// AWS ECR Integration
class ECRIntegration {
  private ecr: ECRClient;

  async getAuthToken(): Promise<RegistryConfig> {
    const response = await this.ecr.send(new GetAuthorizationTokenCommand({}));
    const authData = response.authorizationData?.[0];
    
    if (!authData?.authorizationToken || !authData?.proxyEndpoint) {
      throw new Error('Failed to get ECR authorization token');
    }

    const [username, password] = Buffer.from(authData.authorizationToken, 'base64')
      .toString()
      .split(':');

    return {
      url: authData.proxyEndpoint,
      username,
      password
    };
  }

  async createRepository(name: string, config?: ECRRepositoryConfig): Promise<string> {
    const response = await this.ecr.send(new CreateRepositoryCommand({
      repositoryName: name,
      imageScanningConfiguration: {
        scanOnPush: config?.scanOnPush ?? true
      },
      imageTagMutability: config?.immutableTags ? 'IMMUTABLE' : 'MUTABLE',
      encryptionConfiguration: {
        encryptionType: config?.kmsKeyId ? 'KMS' : 'AES256',
        kmsKey: config?.kmsKeyId
      }
    }));

    return response.repository?.repositoryUri || '';
  }
}

// Docker Hub Integration
class DockerHubIntegration {
  private baseUrl = 'https://hub.docker.com/v2';

  async login(username: string, password: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    return data.token;
  }

  async listRepositories(namespace: string, token: string): Promise<Repository[]> {
    const response = await fetch(`${this.baseUrl}/repositories/${namespace}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await response.json();
    return data.results;
  }
}
```

### CI/CD Pipeline Integration

```typescript
// GitHub Actions Integration
class GitHubActionsDockerIntegration {
  generateBuildWorkflow(config: DockerBuildWorkflowConfig): string {
    return `
name: Docker Build and Push

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ${config.registry}
  IMAGE_NAME: \${{ github.repository }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: \${{ env.REGISTRY }}
          username: \${{ ${config.usernameSecret} }}
          password: \${{ ${config.passwordSecret} }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: \${{ env.REGISTRY }}/\${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: \${{ github.event_name != 'pull_request' }}
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
`;
  }
}
```

## Security Considerations

### Container Security Best Practices

```typescript
class ContainerSecurityValidator {
  validateDockerfile(content: string): SecurityValidationResult {
    const issues: SecurityIssue[] = [];

    // Check for root user
    if (!content.includes('USER') || content.includes('USER root')) {
      issues.push({
        severity: 'high',
        rule: 'non-root-user',
        message: 'Container should run as non-root user',
        recommendation: 'Add USER directive with non-root user'
      });
    }

    // Check for latest tag
    if (content.match(/FROM\s+\S+:latest/)) {
      issues.push({
        severity: 'medium',
        rule: 'no-latest-tag',
        message: 'Avoid using latest tag for base images',
        recommendation: 'Use specific version tags for reproducibility'
      });
    }

    // Check for secrets in build args
    if (content.match(/ARG\s+(PASSWORD|SECRET|KEY|TOKEN)/i)) {
      issues.push({
        severity: 'critical',
        rule: 'no-secrets-in-args',
        message: 'Secrets should not be passed as build arguments',
        recommendation: 'Use Docker secrets or environment variables at runtime'
      });
    }

    // Check for HEALTHCHECK
    if (!content.includes('HEALTHCHECK')) {
      issues.push({
        severity: 'low',
        rule: 'healthcheck-defined',
        message: 'Container should define a health check',
        recommendation: 'Add HEALTHCHECK instruction for container orchestration'
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'critical').length === 0,
      issues
    };
  }

  async scanImageForVulnerabilities(image: string): Promise<VulnerabilityScanResult> {
    // Integration with Trivy, Snyk, or other scanners
    const scanner = new TrivyScanner();
    return scanner.scan(image);
  }
}
```

### Runtime Security

```typescript
interface ContainerSecurityOptions {
  readOnlyRootFilesystem: boolean;
  noNewPrivileges: boolean;
  dropCapabilities: string[];
  addCapabilities?: string[];
  seccompProfile?: string;
  apparmorProfile?: string;
  selinuxOptions?: SELinuxOptions;
}

class SecureContainerRunner {
  getSecurityOptions(): ContainerSecurityOptions {
    return {
      readOnlyRootFilesystem: true,
      noNewPrivileges: true,
      dropCapabilities: ['ALL'],
      addCapabilities: ['NET_BIND_SERVICE'], // Only if needed
      seccompProfile: 'runtime/default'
    };
  }

  generateSecureRunCommand(image: string, options: ContainerSecurityOptions): string {
    const args = [
      'docker run',
      '--read-only',
      '--security-opt=no-new-privileges:true',
      `--cap-drop=${options.dropCapabilities.join(',')}`,
      options.addCapabilities ? `--cap-add=${options.addCapabilities.join(',')}` : '',
      `--security-opt=seccomp=${options.seccompProfile}`,
      '--tmpfs /tmp:rw,noexec,nosuid',
      image
    ];

    return args.filter(Boolean).join(' \\\n  ');
  }
}
```

## Testing Considerations

### Container Testing

```typescript
describe('Container Build Tests', () => {
  it('should build image with correct tags', async () => {
    const builder = new ContainerBuildService();
    const result = await builder.buildOptimizedImage({
      dockerfile: 'Dockerfile',
      context: '.',
      registry: 'registry.example.com',
      repository: 'myapp',
      version: '1.0.0',
      branch: 'main'
    });

    expect(result.tags).toContain('registry.example.com/myapp:1.0.0');
    expect(result.tags).toContain('registry.example.com/myapp:latest');
  });

  it('should fail build if critical vulnerabilities found', async () => {
    const builder = new ContainerBuildService();
    
    await expect(builder.buildOptimizedImage({
      dockerfile: 'Dockerfile.vulnerable',
      context: '.',
      registry: 'registry.example.com',
      repository: 'myapp',
      version: '1.0.0'
    })).rejects.toThrow('critical vulnerabilities');
  });
});

describe('Dockerfile Security Validation', () => {
  it('should detect security issues in Dockerfile', () => {
    const validator = new ContainerSecurityValidator();
    const result = validator.validateDockerfile(`
      FROM node:latest
      ARG PASSWORD
      COPY . .
      CMD ["node", "index.js"]
    `);

    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: 'non-root-user' })
    );
    expect(result.issues).toContainEqual(
      expect.objectContaining({ rule: 'no-latest-tag' })
    );
  });
});
```

## Configuration Examples

### Production Dockerfile

```dockerfile
# syntax=docker/dockerfile:1.4
ARG NODE_VERSION=20

# Dependencies stage
FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Build stage
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian12 AS production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3000
CMD ["dist/index.js"]
```

### Docker Compose for Development

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      target: development
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgres://postgres:postgres@db:5432/app
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:15-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=app
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```
