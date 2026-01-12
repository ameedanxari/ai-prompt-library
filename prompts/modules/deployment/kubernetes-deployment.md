# Kubernetes Deployment Template

## Purpose

This template provides comprehensive patterns for implementing Kubernetes deployments including container orchestration, service mesh integration, scaling strategies, and production-ready configurations. It covers deployment strategies, resource management, and high-availability patterns for cloud-native applications.

## Context

Kubernetes has become the de facto standard for container orchestration, providing powerful abstractions for deploying, scaling, and managing containerized applications. This template addresses the challenges of creating production-ready Kubernetes configurations with proper resource management, security, and observability.

## Core Components

### Kubernetes Deployment Service

## Examples

```typescript
interface KubernetesDeploymentService {
  // Deployment management
  createDeployment(config: DeploymentConfig): Promise<Deployment>;
  updateDeployment(name: string, namespace: string, config: Partial<DeploymentConfig>): Promise<Deployment>;
  deleteDeployment(name: string, namespace: string): Promise<void>;
  getDeploymentStatus(name: string, namespace: string): Promise<DeploymentStatus>;
  
  // Scaling
  scaleDeployment(name: string, namespace: string, replicas: number): Promise<void>;
  configureAutoscaling(config: AutoscalingConfig): Promise<HorizontalPodAutoscaler>;
  
  // Rollout management
  rolloutStatus(name: string, namespace: string): Promise<RolloutStatus>;
  rolloutRestart(name: string, namespace: string): Promise<void>;
  rolloutUndo(name: string, namespace: string, revision?: number): Promise<void>;
}


interface DeploymentConfig {
  name: string;
  namespace: string;
  replicas: number;
  selector: LabelSelector;
  template: PodTemplateSpec;
  strategy?: DeploymentStrategy;
  minReadySeconds?: number;
  revisionHistoryLimit?: number;
  progressDeadlineSeconds?: number;
}

interface PodTemplateSpec {
  metadata: ObjectMeta;
  spec: PodSpec;
}

interface PodSpec {
  containers: Container[];
  initContainers?: Container[];
  volumes?: Volume[];
  serviceAccountName?: string;
  securityContext?: PodSecurityContext;
  nodeSelector?: Record<string, string>;
  affinity?: Affinity;
  tolerations?: Toleration[];
  topologySpreadConstraints?: TopologySpreadConstraint[];
}

interface Container {
  name: string;
  image: string;
  ports?: ContainerPort[];
  env?: EnvVar[];
  envFrom?: EnvFromSource[];
  resources?: ResourceRequirements;
  volumeMounts?: VolumeMount[];
  livenessProbe?: Probe;
  readinessProbe?: Probe;
  startupProbe?: Probe;
  securityContext?: SecurityContext;
  lifecycle?: Lifecycle;
}

interface ResourceRequirements {
  limits?: ResourceList;
  requests?: ResourceList;
}

interface ResourceList {
  cpu?: string;
  memory?: string;
  'ephemeral-storage'?: string;
}

interface Probe {
  httpGet?: HTTPGetAction;
  tcpSocket?: TCPSocketAction;
  exec?: ExecAction;
  initialDelaySeconds?: number;
  periodSeconds?: number;
  timeoutSeconds?: number;
  successThreshold?: number;
  failureThreshold?: number;
}

interface DeploymentStrategy {
  type: 'RollingUpdate' | 'Recreate';
  rollingUpdate?: RollingUpdateDeployment;
}

interface RollingUpdateDeployment {
  maxUnavailable?: string | number;
  maxSurge?: string | number;
}

interface DeploymentStatus {
  observedGeneration: number;
  replicas: number;
  updatedReplicas: number;
  readyReplicas: number;
  availableReplicas: number;
  conditions: DeploymentCondition[];
}
```

### Service and Ingress Management

```typescript
interface KubernetesNetworkingService {
  // Service management
  createService(config: ServiceConfig): Promise<Service>;
  updateService(name: string, namespace: string, config: Partial<ServiceConfig>): Promise<Service>;
  deleteService(name: string, namespace: string): Promise<void>;
  
  // Ingress management
  createIngress(config: IngressConfig): Promise<Ingress>;
  updateIngress(name: string, namespace: string, config: Partial<IngressConfig>): Promise<Ingress>;
  deleteIngress(name: string, namespace: string): Promise<void>;
  
  // Network policies
  createNetworkPolicy(config: NetworkPolicyConfig): Promise<NetworkPolicy>;
}

interface ServiceConfig {
  name: string;
  namespace: string;
  type: ServiceType;
  selector: Record<string, string>;
  ports: ServicePort[];
  clusterIP?: string;
  loadBalancerIP?: string;
  externalTrafficPolicy?: 'Cluster' | 'Local';
  sessionAffinity?: 'None' | 'ClientIP';
}

enum ServiceType {
  CLUSTER_IP = 'ClusterIP',
  NODE_PORT = 'NodePort',
  LOAD_BALANCER = 'LoadBalancer',
  EXTERNAL_NAME = 'ExternalName'
}

interface IngressConfig {
  name: string;
  namespace: string;
  ingressClassName?: string;
  tls?: IngressTLS[];
  rules: IngressRule[];
  annotations?: Record<string, string>;
}

interface IngressRule {
  host?: string;
  http: HTTPIngressRuleValue;
}

interface HTTPIngressRuleValue {
  paths: HTTPIngressPath[];
}

interface HTTPIngressPath {
  path: string;
  pathType: 'Exact' | 'Prefix' | 'ImplementationSpecific';
  backend: IngressBackend;
}
```

### ConfigMap and Secret Management

```typescript
interface KubernetesConfigService {
  // ConfigMap operations
  createConfigMap(config: ConfigMapConfig): Promise<ConfigMap>;
  updateConfigMap(name: string, namespace: string, data: Record<string, string>): Promise<ConfigMap>;
  deleteConfigMap(name: string, namespace: string): Promise<void>;
  
  // Secret operations
  createSecret(config: SecretConfig): Promise<Secret>;
  updateSecret(name: string, namespace: string, data: Record<string, string>): Promise<Secret>;
  deleteSecret(name: string, namespace: string): Promise<void>;
  
  // External secrets integration
  createExternalSecret(config: ExternalSecretConfig): Promise<ExternalSecret>;
}

interface ConfigMapConfig {
  name: string;
  namespace: string;
  data?: Record<string, string>;
  binaryData?: Record<string, string>;
  immutable?: boolean;
}

interface SecretConfig {
  name: string;
  namespace: string;
  type: SecretType;
  data?: Record<string, string>;
  stringData?: Record<string, string>;
  immutable?: boolean;
}

enum SecretType {
  OPAQUE = 'Opaque',
  TLS = 'kubernetes.io/tls',
  DOCKER_CONFIG = 'kubernetes.io/dockerconfigjson',
  SERVICE_ACCOUNT = 'kubernetes.io/service-account-token',
  BASIC_AUTH = 'kubernetes.io/basic-auth'
}
```


## Implementation Patterns

### Production Deployment Generator

```typescript
class KubernetesDeploymentGenerator {
  generateDeployment(config: ApplicationConfig): DeploymentManifest {
    return {
      apiVersion: 'apps/v1',
      kind: 'Deployment',
      metadata: {
        name: config.name,
        namespace: config.namespace,
        labels: this.generateLabels(config)
      },
      spec: {
        replicas: config.replicas,
        selector: {
          matchLabels: {
            app: config.name
          }
        },
        strategy: {
          type: 'RollingUpdate',
          rollingUpdate: {
            maxUnavailable: '25%',
            maxSurge: '25%'
          }
        },
        template: {
          metadata: {
            labels: {
              app: config.name,
              version: config.version
            },
            annotations: {
              'prometheus.io/scrape': 'true',
              'prometheus.io/port': String(config.metricsPort || 9090)
            }
          },
          spec: this.generatePodSpec(config)
        }
      }
    };
  }

  private generatePodSpec(config: ApplicationConfig): PodSpec {
    return {
      serviceAccountName: config.serviceAccount || 'default',
      securityContext: {
        runAsNonRoot: true,
        runAsUser: 1000,
        fsGroup: 1000,
        seccompProfile: {
          type: 'RuntimeDefault'
        }
      },
      containers: [{
        name: config.name,
        image: `${config.image}:${config.version}`,
        imagePullPolicy: 'IfNotPresent',
        ports: [{
          name: 'http',
          containerPort: config.port,
          protocol: 'TCP'
        }],
        env: this.generateEnvVars(config),
        envFrom: config.configMapRef ? [{
          configMapRef: { name: config.configMapRef }
        }] : undefined,
        resources: {
          requests: {
            cpu: config.resources?.cpuRequest || '100m',
            memory: config.resources?.memoryRequest || '128Mi'
          },
          limits: {
            cpu: config.resources?.cpuLimit || '500m',
            memory: config.resources?.memoryLimit || '512Mi'
          }
        },
        livenessProbe: {
          httpGet: {
            path: config.healthPath || '/health',
            port: config.port
          },
          initialDelaySeconds: 30,
          periodSeconds: 10,
          timeoutSeconds: 5,
          failureThreshold: 3
        },
        readinessProbe: {
          httpGet: {
            path: config.readyPath || '/ready',
            port: config.port
          },
          initialDelaySeconds: 5,
          periodSeconds: 5,
          timeoutSeconds: 3,
          failureThreshold: 3
        },
        securityContext: {
          allowPrivilegeEscalation: false,
          readOnlyRootFilesystem: true,
          capabilities: {
            drop: ['ALL']
          }
        },
        volumeMounts: [{
          name: 'tmp',
          mountPath: '/tmp'
        }]
      }],
      volumes: [{
        name: 'tmp',
        emptyDir: {}
      }],
      topologySpreadConstraints: [{
        maxSkew: 1,
        topologyKey: 'topology.kubernetes.io/zone',
        whenUnsatisfiable: 'ScheduleAnyway',
        labelSelector: {
          matchLabels: { app: config.name }
        }
      }]
    };
  }
}
```

### Horizontal Pod Autoscaler

```typescript
class AutoscalingManager {
  generateHPA(config: HPAConfig): HorizontalPodAutoscaler {
    return {
      apiVersion: 'autoscaling/v2',
      kind: 'HorizontalPodAutoscaler',
      metadata: {
        name: `${config.deploymentName}-hpa`,
        namespace: config.namespace
      },
      spec: {
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: config.deploymentName
        },
        minReplicas: config.minReplicas,
        maxReplicas: config.maxReplicas,
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: config.targetCPUUtilization || 70
              }
            }
          },
          {
            type: 'Resource',
            resource: {
              name: 'memory',
              target: {
                type: 'Utilization',
                averageUtilization: config.targetMemoryUtilization || 80
              }
            }
          }
        ],
        behavior: {
          scaleDown: {
            stabilizationWindowSeconds: 300,
            policies: [{
              type: 'Percent',
              value: 10,
              periodSeconds: 60
            }]
          },
          scaleUp: {
            stabilizationWindowSeconds: 0,
            policies: [{
              type: 'Percent',
              value: 100,
              periodSeconds: 15
            }, {
              type: 'Pods',
              value: 4,
              periodSeconds: 15
            }],
            selectPolicy: 'Max'
          }
        }
      }
    };
  }
}
```

### Service Mesh Integration (Istio)

```typescript
class IstioServiceMeshManager {
  generateVirtualService(config: VirtualServiceConfig): VirtualService {
    return {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'VirtualService',
      metadata: {
        name: config.name,
        namespace: config.namespace
      },
      spec: {
        hosts: config.hosts,
        gateways: config.gateways,
        http: [{
          match: config.match,
          route: config.routes.map(route => ({
            destination: {
              host: route.host,
              port: { number: route.port },
              subset: route.subset
            },
            weight: route.weight
          })),
          retries: {
            attempts: 3,
            perTryTimeout: '2s',
            retryOn: 'gateway-error,connect-failure,refused-stream'
          },
          timeout: '30s'
        }]
      }
    };
  }

  generateDestinationRule(config: DestinationRuleConfig): DestinationRule {
    return {
      apiVersion: 'networking.istio.io/v1beta1',
      kind: 'DestinationRule',
      metadata: {
        name: config.name,
        namespace: config.namespace
      },
      spec: {
        host: config.host,
        trafficPolicy: {
          connectionPool: {
            tcp: {
              maxConnections: 100
            },
            http: {
              h2UpgradePolicy: 'UPGRADE',
              http1MaxPendingRequests: 100,
              http2MaxRequests: 1000
            }
          },
          loadBalancer: {
            simple: 'LEAST_REQUEST'
          },
          outlierDetection: {
            consecutive5xxErrors: 5,
            interval: '30s',
            baseEjectionTime: '30s',
            maxEjectionPercent: 50
          }
        },
        subsets: config.subsets?.map(subset => ({
          name: subset.name,
          labels: subset.labels,
          trafficPolicy: subset.trafficPolicy
        }))
      }
    };
  }
}
```


## Integration Points

### Helm Chart Integration

```typescript
class HelmChartManager {
  async installChart(config: HelmInstallConfig): Promise<HelmRelease> {
    const args = [
      'helm', 'install',
      config.releaseName,
      config.chart,
      '--namespace', config.namespace,
      '--create-namespace',
      '--wait',
      '--timeout', config.timeout || '5m'
    ];

    if (config.values) {
      args.push('--values', config.values);
    }

    if (config.set) {
      for (const [key, value] of Object.entries(config.set)) {
        args.push('--set', `${key}=${value}`);
      }
    }

    const result = await this.executeHelm(args);
    return this.parseHelmRelease(result);
  }

  async upgradeChart(config: HelmUpgradeConfig): Promise<HelmRelease> {
    const args = [
      'helm', 'upgrade',
      config.releaseName,
      config.chart,
      '--namespace', config.namespace,
      '--install',
      '--wait',
      '--atomic',
      '--timeout', config.timeout || '5m'
    ];

    if (config.values) {
      args.push('--values', config.values);
    }

    const result = await this.executeHelm(args);
    return this.parseHelmRelease(result);
  }

  generateValuesFile(config: ApplicationConfig): string {
    return yaml.stringify({
      replicaCount: config.replicas,
      image: {
        repository: config.imageRepository,
        tag: config.imageTag,
        pullPolicy: 'IfNotPresent'
      },
      service: {
        type: 'ClusterIP',
        port: config.port
      },
      ingress: {
        enabled: config.ingress?.enabled || false,
        className: config.ingress?.className,
        hosts: config.ingress?.hosts,
        tls: config.ingress?.tls
      },
      resources: config.resources,
      autoscaling: {
        enabled: config.autoscaling?.enabled || false,
        minReplicas: config.autoscaling?.minReplicas,
        maxReplicas: config.autoscaling?.maxReplicas,
        targetCPUUtilizationPercentage: config.autoscaling?.targetCPU
      }
    });
  }
}
```

### ArgoCD GitOps Integration

```typescript
class ArgoCDManager {
  generateApplication(config: ArgoCDAppConfig): ArgoCDApplication {
    return {
      apiVersion: 'argoproj.io/v1alpha1',
      kind: 'Application',
      metadata: {
        name: config.name,
        namespace: 'argocd',
        finalizers: ['resources-finalizer.argocd.argoproj.io']
      },
      spec: {
        project: config.project || 'default',
        source: {
          repoURL: config.repoURL,
          targetRevision: config.targetRevision || 'HEAD',
          path: config.path,
          helm: config.helm ? {
            valueFiles: config.helm.valueFiles,
            values: config.helm.values
          } : undefined
        },
        destination: {
          server: config.destinationServer || 'https://kubernetes.default.svc',
          namespace: config.namespace
        },
        syncPolicy: {
          automated: {
            prune: true,
            selfHeal: true,
            allowEmpty: false
          },
          syncOptions: [
            'CreateNamespace=true',
            'PrunePropagationPolicy=foreground',
            'PruneLast=true'
          ],
          retry: {
            limit: 5,
            backoff: {
              duration: '5s',
              factor: 2,
              maxDuration: '3m'
            }
          }
        }
      }
    };
  }
}
```

## Security Considerations

### Pod Security Standards

```typescript
class PodSecurityManager {
  generatePodSecurityPolicy(level: 'restricted' | 'baseline' | 'privileged'): PodSecurityPolicy {
    const policies: Record<string, PodSecurityPolicy> = {
      restricted: {
        runAsNonRoot: true,
        allowPrivilegeEscalation: false,
        seccompProfile: { type: 'RuntimeDefault' },
        capabilities: { drop: ['ALL'] },
        volumes: ['configMap', 'emptyDir', 'projected', 'secret', 'downwardAPI', 'persistentVolumeClaim']
      },
      baseline: {
        hostNetwork: false,
        hostPID: false,
        hostIPC: false,
        privileged: false,
        capabilities: { drop: ['ALL'], add: ['NET_BIND_SERVICE'] }
      },
      privileged: {
        // No restrictions
      }
    };

    return policies[level];
  }

  generateNetworkPolicy(config: NetworkPolicyConfig): NetworkPolicy {
    return {
      apiVersion: 'networking.k8s.io/v1',
      kind: 'NetworkPolicy',
      metadata: {
        name: config.name,
        namespace: config.namespace
      },
      spec: {
        podSelector: {
          matchLabels: config.podSelector
        },
        policyTypes: ['Ingress', 'Egress'],
        ingress: [{
          from: config.allowedIngress?.map(source => ({
            namespaceSelector: source.namespaceSelector,
            podSelector: source.podSelector
          })),
          ports: config.ingressPorts?.map(port => ({
            protocol: port.protocol || 'TCP',
            port: port.port
          }))
        }],
        egress: [{
          to: config.allowedEgress?.map(dest => ({
            namespaceSelector: dest.namespaceSelector,
            podSelector: dest.podSelector,
            ipBlock: dest.ipBlock
          })),
          ports: config.egressPorts?.map(port => ({
            protocol: port.protocol || 'TCP',
            port: port.port
          }))
        }]
      }
    };
  }
}
```

### RBAC Configuration

```typescript
class RBACManager {
  generateServiceAccount(config: ServiceAccountConfig): ServiceAccount {
    return {
      apiVersion: 'v1',
      kind: 'ServiceAccount',
      metadata: {
        name: config.name,
        namespace: config.namespace,
        annotations: config.annotations
      },
      automountServiceAccountToken: config.automountToken ?? false
    };
  }

  generateRole(config: RoleConfig): Role {
    return {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: config.clusterWide ? 'ClusterRole' : 'Role',
      metadata: {
        name: config.name,
        namespace: config.clusterWide ? undefined : config.namespace
      },
      rules: config.rules.map(rule => ({
        apiGroups: rule.apiGroups,
        resources: rule.resources,
        verbs: rule.verbs,
        resourceNames: rule.resourceNames
      }))
    };
  }

  generateRoleBinding(config: RoleBindingConfig): RoleBinding {
    return {
      apiVersion: 'rbac.authorization.k8s.io/v1',
      kind: config.clusterWide ? 'ClusterRoleBinding' : 'RoleBinding',
      metadata: {
        name: config.name,
        namespace: config.clusterWide ? undefined : config.namespace
      },
      subjects: config.subjects.map(subject => ({
        kind: subject.kind,
        name: subject.name,
        namespace: subject.namespace
      })),
      roleRef: {
        apiGroup: 'rbac.authorization.k8s.io',
        kind: config.clusterWide ? 'ClusterRole' : 'Role',
        name: config.roleName
      }
    };
  }
}
```

## Testing Considerations

### Kubernetes Manifest Testing

```typescript
describe('Kubernetes Deployment Generator', () => {
  it('should generate valid deployment manifest', () => {
    const generator = new KubernetesDeploymentGenerator();
    const deployment = generator.generateDeployment({
      name: 'test-app',
      namespace: 'default',
      replicas: 3,
      version: '1.0.0',
      image: 'myregistry/test-app',
      port: 8080
    });

    expect(deployment.apiVersion).toBe('apps/v1');
    expect(deployment.kind).toBe('Deployment');
    expect(deployment.spec.replicas).toBe(3);
    expect(deployment.spec.template.spec.containers[0].securityContext.allowPrivilegeEscalation).toBe(false);
  });

  it('should include proper health checks', () => {
    const generator = new KubernetesDeploymentGenerator();
    const deployment = generator.generateDeployment({
      name: 'test-app',
      namespace: 'default',
      replicas: 1,
      version: '1.0.0',
      image: 'myregistry/test-app',
      port: 8080,
      healthPath: '/healthz'
    });

    const container = deployment.spec.template.spec.containers[0];
    expect(container.livenessProbe.httpGet.path).toBe('/healthz');
    expect(container.readinessProbe).toBeDefined();
  });
});
```

## Configuration Examples

### Complete Application Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
  labels:
    app: myapp
    version: v1.0.0
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    metadata:
      labels:
        app: myapp
        version: v1.0.0
    spec:
      serviceAccountName: myapp-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 1000
      containers:
        - name: myapp
          image: myregistry/myapp:v1.0.0
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
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
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities:
              drop: ["ALL"]
      topologySpreadConstraints:
        - maxSkew: 1
          topologyKey: topology.kubernetes.io/zone
          whenUnsatisfiable: DoNotSchedule
          labelSelector:
            matchLabels:
              app: myapp
```
