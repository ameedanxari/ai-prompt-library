# Kubernetes Orchestration Deployment Template

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

This template provides comprehensive patterns for deploying applications to Kubernetes clusters, covering container orchestration, service mesh integration, auto-scaling, monitoring, and production-ready configurations. It addresses the complexity of managing containerized applications at scale with proper resource management, security, and observability.

## Context

Kubernetes has become the standard for container orchestration in enterprise environments. This template covers Kubernetes 1.28+ deployment patterns including Helm charts, operators, service mesh integration, GitOps workflows, and comprehensive monitoring solutions for production-grade applications.

## Examples

### Example 1: Complete Application Deployment
```yaml
# Kubernetes deployment with comprehensive configuration
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app
  namespace: production
  labels:
    app: web-app
    version: v1.2.0
    tier: frontend
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
        version: v1.2.0
      annotations:
        prometheus.io/scrape: "true"
        prometheus.io/port: "8080"
        prometheus.io/path: "/metrics"
    spec:
      serviceAccountName: web-app-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1000
        fsGroup: 2000
      containers:
      - name: web-app
        image: myregistry/web-app:v1.2.0
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
          name: http
        - containerPort: 8081
          name: metrics
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: database-secret
              key: url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: redis-config
              key: url
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
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: config-volume
          mountPath: /app/config
        - name: logs-volume
          mountPath: /app/logs
      volumes:
      - name: config-volume
        configMap:
          name: web-app-config
      - name: logs-volume
        emptyDir: {}
      imagePullSecrets:
      - name: registry-secret
```

### Example 2: Service Mesh Integration with Istio
```yaml
# Istio service mesh configuration
apiVersion: networking.istio.io/v1beta1
kind: VirtualService
metadata:
  name: web-app-vs
  namespace: production
spec:
  hosts:
  - web-app.example.com
  gateways:
  - web-app-gateway
  http:
  - match:
    - uri:
        prefix: /api/v2
    route:
    - destination:
        host: web-app-v2
        port:
          number: 8080
      weight: 20
    - destination:
        host: web-app-v1
        port:
          number: 8080
      weight: 80
    fault:
      delay:
        percentage:
          value: 0.1
        fixedDelay: 5s
  - route:
    - destination:
        host: web-app-v1
        port:
          number: 8080

---
apiVersion: networking.istio.io/v1beta1
kind: DestinationRule
metadata:
  name: web-app-dr
  namespace: production
spec:
  host: web-app
  trafficPolicy:
    connectionPool:
      tcp:
        maxConnections: 100
      http:
        http1MaxPendingRequests: 50
        maxRequestsPerConnection: 10
    circuitBreaker:
      consecutiveErrors: 3
      interval: 30s
      baseEjectionTime: 30s
      maxEjectionPercent: 50
    retryPolicy:
      attempts: 3
      perTryTimeout: 2s
  subsets:
  - name: v1
    labels:
      version: v1.1.0
  - name: v2
    labels:
      version: v1.2.0
```

### Example 3: Auto-scaling and Resource Management
```yaml
# Horizontal Pod Autoscaler with custom metrics
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web-app-hpa
  namespace: production
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  minReplicas: 3
  maxReplicas: 50
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  - type: Pods
    pods:
      metric:
        name: http_requests_per_second
      target:
        type: AverageValue
        averageValue: "100"
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Percent
        value: 50
        periodSeconds: 60
      - type: Pods
        value: 5
        periodSeconds: 60
      selectPolicy: Max

---
# Vertical Pod Autoscaler
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: web-app-vpa
  namespace: production
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web-app
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: web-app
      minAllowed:
        cpu: 100m
        memory: 128Mi
      maxAllowed:
        cpu: 2
        memory: 2Gi
      controlledResources: ["cpu", "memory"]
```

## Instructions

### Kubernetes Deployment Architecture

Essential Kubernetes components and configurations:

| Component | Priority | Implementation | Use Case |
|-----------|----------|----------------|----------|
| **Deployments** | Critical | Rolling updates, replicas | Application orchestration |
| **Services** | Critical | ClusterIP, LoadBalancer | Service discovery |
| **Ingress** | Critical | NGINX, Traefik, Istio | External access |
| **ConfigMaps/Secrets** | Critical | Configuration management | Environment variables |
| **HPA/VPA** | High | Auto-scaling | Resource optimization |
| **Service Mesh** | High | Istio, Linkerd | Traffic management |
| **Monitoring** | High | Prometheus, Grafana | Observability |
| **GitOps** | Medium | ArgoCD, Flux | Deployment automation |

### Helm Chart Structure

```yaml
# Chart.yaml
apiVersion: v2
name: web-application
description: A comprehensive web application Helm chart
type: application
version: 1.0.0
appVersion: "1.2.0"
keywords:
  - web
  - application
  - microservices
home: https://github.com/company/web-app
sources:
  - https://github.com/company/web-app
maintainers:
  - name: DevOps Team
    email: devops@company.com
dependencies:
  - name: postgresql
    version: 12.1.9
    repository: https://charts.bitnami.com/bitnami
    condition: postgresql.enabled
  - name: redis
    version: 17.3.7
    repository: https://charts.bitnami.com/bitnami
    condition: redis.enabled

---
# values.yaml
# Default values for web-application
replicaCount: 3

image:
  repository: myregistry/web-app
  pullPolicy: IfNotPresent
  tag: ""

imagePullSecrets:
  - name: registry-secret

nameOverride: ""
fullnameOverride: ""

serviceAccount:
  create: true
  annotations: {}
  name: ""

podAnnotations:
  prometheus.io/scrape: "true"
  prometheus.io/port: "8080"
  prometheus.io/path: "/metrics"

podSecurityContext:
  runAsNonRoot: true
  runAsUser: 1000
  fsGroup: 2000

securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  capabilities:
    drop:
    - ALL

service:
  type: ClusterIP
  port: 80
  targetPort: 8080

ingress:
  enabled: true
  className: "nginx"
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
  hosts:
    - host: web-app.example.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: web-app-tls
      hosts:
        - web-app.example.com

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 50
  targetCPUUtilizationPercentage: 70
  targetMemoryUtilizationPercentage: 80

nodeSelector: {}

tolerations: []

affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: app.kubernetes.io/name
            operator: In
            values:
            - web-application
        topologyKey: kubernetes.io/hostname

# Database configuration
postgresql:
  enabled: true
  auth:
    postgresPassword: "secure-password"
    database: "webapp"
  primary:
    persistence:
      enabled: true
      size: 10Gi

# Redis configuration
redis:
  enabled: true
  auth:
    enabled: true
    password: "redis-password"
  master:
    persistence:
      enabled: true
      size: 5Gi

# Application configuration
config:
  database:
    host: "{{ include \"web-application.postgresql.fullname\" . }}"
    port: 5432
    name: webapp
  redis:
    host: "{{ include \"web-application.redis.fullname\" . }}-master"
    port: 6379
  app:
    logLevel: info
    environment: production
```

### Deployment Templates

```yaml
# templates/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ include "web-application.fullname" . }}
  labels:
    {{- include "web-application.labels" . | nindent 4 }}
spec:
  {{- if not .Values.autoscaling.enabled }}
  replicas: {{ .Values.replicaCount }}
  {{- end }}
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      {{- include "web-application.selectorLabels" . | nindent 6 }}
  template:
    metadata:
      annotations:
        checksum/config: {{ include (print $.Template.BasePath "/configmap.yaml") . | sha256sum }}
        checksum/secret: {{ include (print $.Template.BasePath "/secret.yaml") . | sha256sum }}
        {{- with .Values.podAnnotations }}
        {{- toYaml . | nindent 8 }}
        {{- end }}
      labels:
        {{- include "web-application.selectorLabels" . | nindent 8 }}
    spec:
      {{- with .Values.imagePullSecrets }}
      imagePullSecrets:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      serviceAccountName: {{ include "web-application.serviceAccountName" . }}
      securityContext:
        {{- toYaml .Values.podSecurityContext | nindent 8 }}
      containers:
        - name: {{ .Chart.Name }}
          securityContext:
            {{- toYaml .Values.securityContext | nindent 12 }}
          image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}"
          imagePullPolicy: {{ .Values.image.pullPolicy }}
          ports:
            - name: http
              containerPort: 8080
              protocol: TCP
            - name: metrics
              containerPort: 8081
              protocol: TCP
          env:
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ include "web-application.fullname" . }}-secret
                  key: database-url
            - name: REDIS_URL
              valueFrom:
                configMapKeyRef:
                  name: {{ include "web-application.fullname" . }}-config
                  key: redis-url
            - name: LOG_LEVEL
              value: {{ .Values.config.app.logLevel }}
            - name: ENVIRONMENT
              value: {{ .Values.config.app.environment }}
          livenessProbe:
            httpGet:
              path: /health
              port: http
            initialDelaySeconds: 30
            periodSeconds: 10
            timeoutSeconds: 5
            failureThreshold: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: http
            initialDelaySeconds: 5
            periodSeconds: 5
            timeoutSeconds: 3
            failureThreshold: 3
          resources:
            {{- toYaml .Values.resources | nindent 12 }}
          volumeMounts:
            - name: config-volume
              mountPath: /app/config
              readOnly: true
            - name: tmp-volume
              mountPath: /tmp
      volumes:
        - name: config-volume
          configMap:
            name: {{ include "web-application.fullname" . }}-config
        - name: tmp-volume
          emptyDir: {}
      {{- with .Values.nodeSelector }}
      nodeSelector:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.affinity }}
      affinity:
        {{- toYaml . | nindent 8 }}
      {{- end }}
      {{- with .Values.tolerations }}
      tolerations:
        {{- toYaml . | nindent 8 }}
      {{- end }}

---
# templates/service.yaml
apiVersion: v1
kind: Service
metadata:
  name: {{ include "web-application.fullname" . }}
  labels:
    {{- include "web-application.labels" . | nindent 4 }}
spec:
  type: {{ .Values.service.type }}
  ports:
    - port: {{ .Values.service.port }}
      targetPort: {{ .Values.service.targetPort }}
      protocol: TCP
      name: http
  selector:
    {{- include "web-application.selectorLabels" . | nindent 4 }}

---
# templates/ingress.yaml
{{- if .Values.ingress.enabled -}}
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: {{ include "web-application.fullname" . }}
  labels:
    {{- include "web-application.labels" . | nindent 4 }}
  {{- with .Values.ingress.annotations }}
  annotations:
    {{- toYaml . | nindent 4 }}
  {{- end }}
spec:
  {{- if .Values.ingress.className }}
  ingressClassName: {{ .Values.ingress.className }}
  {{- end }}
  {{- if .Values.ingress.tls }}
  tls:
    {{- range .Values.ingress.tls }}
    - hosts:
        {{- range .hosts }}
        - {{ . | quote }}
        {{- end }}
      secretName: {{ .secretName }}
    {{- end }}
  {{- end }}
  rules:
    {{- range .Values.ingress.hosts }}
    - host: {{ .host | quote }}
      http:
        paths:
          {{- range .paths }}
          - path: {{ .path }}
            pathType: {{ .pathType }}
            backend:
              service:
                name: {{ include "web-application.fullname" $ }}
                port:
                  number: {{ $.Values.service.port }}
          {{- end }}
    {{- end }}
{{- end }}
```

### Monitoring and Observability

```yaml
# monitoring/prometheus-rules.yaml
apiVersion: monitoring.coreos.com/v1
kind: PrometheusRule
metadata:
  name: web-app-alerts
  namespace: production
  labels:
    app: web-app
    prometheus: kube-prometheus
    role: alert-rules
spec:
  groups:
  - name: web-app.rules
    rules:
    - alert: WebAppHighErrorRate
      expr: |
        (
          rate(http_requests_total{job="web-app",status=~"5.."}[5m])
          /
          rate(http_requests_total{job="web-app"}[5m])
        ) > 0.05
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High error rate detected"
        description: "Error rate is {{ $value | humanizePercentage }} for {{ $labels.instance }}"
    
    - alert: WebAppHighLatency
      expr: |
        histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="web-app"}[5m])) > 0.5
      for: 5m
      labels:
        severity: warning
      annotations:
        summary: "High latency detected"
        description: "95th percentile latency is {{ $value }}s for {{ $labels.instance }}"
    
    - alert: WebAppPodCrashLooping
      expr: |
        rate(kube_pod_container_status_restarts_total{container="web-app"}[15m]) > 0
      for: 5m
      labels:
        severity: critical
      annotations:
        summary: "Pod is crash looping"
        description: "Pod {{ $labels.pod }} in namespace {{ $labels.namespace }} is crash looping"

---
# monitoring/service-monitor.yaml
apiVersion: monitoring.coreos.com/v1
kind: ServiceMonitor
metadata:
  name: web-app-metrics
  namespace: production
  labels:
    app: web-app
spec:
  selector:
    matchLabels:
      app: web-app
  endpoints:
  - port: metrics
    interval: 30s
    path: /metrics
    honorLabels: true
  namespaceSelector:
    matchNames:
    - production

---
# monitoring/grafana-dashboard.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-app-dashboard
  namespace: monitoring
  labels:
    grafana_dashboard: "1"
data:
  web-app-dashboard.json: |
    {
      "dashboard": {
        "id": null,
        "title": "Web Application Dashboard",
        "tags": ["kubernetes", "web-app"],
        "timezone": "browser",
        "panels": [
          {
            "id": 1,
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total{job=\"web-app\"}[5m])",
                "legendFormat": "{{ instance }}"
              }
            ],
            "yAxes": [
              {
                "label": "Requests/sec"
              }
            ]
          },
          {
            "id": 2,
            "title": "Error Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total{job=\"web-app\",status=~\"5..\"}[5m]) / rate(http_requests_total{job=\"web-app\"}[5m])",
                "legendFormat": "Error Rate"
              }
            ],
            "yAxes": [
              {
                "label": "Percentage",
                "max": 1,
                "min": 0
              }
            ]
          },
          {
            "id": 3,
            "title": "Response Time",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job=\"web-app\"}[5m]))",
                "legendFormat": "95th percentile"
              },
              {
                "expr": "histogram_quantile(0.50, rate(http_request_duration_seconds_bucket{job=\"web-app\"}[5m]))",
                "legendFormat": "50th percentile"
              }
            ],
            "yAxes": [
              {
                "label": "Seconds"
              }
            ]
          }
        ],
        "time": {
          "from": "now-1h",
          "to": "now"
        },
        "refresh": "30s"
      }
    }
```

### GitOps with ArgoCD

```yaml
# argocd/application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-app-production
  namespace: argocd
  finalizers:
    - resources-finalizer.argocd.argoproj.io
spec:
  project: default
  source:
    repoURL: https://github.com/company/web-app-helm
    targetRevision: HEAD
    path: charts/web-application
    helm:
      valueFiles:
        - values-production.yaml
      parameters:
        - name: image.tag
          value: v1.2.0
        - name: replicaCount
          value: "5"
  destination:
    server: https://kubernetes.default.svc
    namespace: production
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    syncOptions:
      - CreateNamespace=true
      - PrunePropagationPolicy=foreground
      - PruneLast=true
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  revisionHistoryLimit: 10

---
# argocd/app-of-apps.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-app-environments
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/company/web-app-gitops
    targetRevision: HEAD
    path: environments
  destination:
    server: https://kubernetes.default.svc
    namespace: argocd
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

### Security and RBAC

```yaml
# security/rbac.yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: web-app-sa
  namespace: production
  annotations:
    eks.amazonaws.com/role-arn: arn:aws:iam::123456789012:role/WebAppRole

---
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: production
  name: web-app-role
rules:
- apiGroups: [""]
  resources: ["configmaps", "secrets"]
  verbs: ["get", "list", "watch"]
- apiGroups: [""]
  resources: ["pods"]
  verbs: ["get", "list", "watch"]

---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding
metadata:
  name: web-app-rolebinding
  namespace: production
subjects:
- kind: ServiceAccount
  name: web-app-sa
  namespace: production
roleRef:
  kind: Role
  name: web-app-role
  apiGroup: rbac.authorization.k8s.io

---
# security/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: web-app-netpol
  namespace: production
spec:
  podSelector:
    matchLabels:
      app: web-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: ingress-nginx
    - podSelector:
        matchLabels:
          app: web-app
    ports:
    - protocol: TCP
      port: 8080
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgresql
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to: []
    ports:
    - protocol: TCP
      port: 53
    - protocol: UDP
      port: 53
    - protocol: TCP
      port: 443

---
# security/pod-security-policy.yaml
apiVersion: policy/v1beta1
kind: PodSecurityPolicy
metadata:
  name: web-app-psp
spec:
  privileged: false
  allowPrivilegeEscalation: false
  requiredDropCapabilities:
    - ALL
  volumes:
    - 'configMap'
    - 'emptyDir'
    - 'projected'
    - 'secret'
    - 'downwardAPI'
    - 'persistentVolumeClaim'
  runAsUser:
    rule: 'MustRunAsNonRoot'
  seLinux:
    rule: 'RunAsAny'
  fsGroup:
    rule: 'RunAsAny'
  readOnlyRootFilesystem: true
```

### Disaster Recovery and Backup

```yaml
# backup/velero-backup.yaml
apiVersion: velero.io/v1
kind: Backup
metadata:
  name: web-app-backup
  namespace: velero
spec:
  includedNamespaces:
  - production
  labelSelector:
    matchLabels:
      app: web-app
  storageLocation: default
  volumeSnapshotLocations:
  - default
  ttl: 720h0m0s
  includedResources:
  - deployments
  - services
  - configmaps
  - secrets
  - persistentvolumeclaims
  - persistentvolumes

---
# backup/schedule.yaml
apiVersion: velero.io/v1
kind: Schedule
metadata:
  name: web-app-daily-backup
  namespace: velero
spec:
  schedule: "0 2 * * *"
  template:
    includedNamespaces:
    - production
    labelSelector:
      matchLabels:
        app: web-app
    storageLocation: default
    ttl: 720h0m0s

---
# backup/restore.yaml
apiVersion: velero.io/v1
kind: Restore
metadata:
  name: web-app-restore
  namespace: velero
spec:
  backupName: web-app-backup-20231201120000
  includedNamespaces:
  - production
  restorePVs: true
```

### Testing and Validation

```yaml
# tests/smoke-test.yaml
apiVersion: v1
kind: Pod
metadata:
  name: web-app-smoke-test
  namespace: production
  annotations:
    test: smoke
spec:
  restartPolicy: Never
  containers:
  - name: smoke-test
    image: curlimages/curl:latest
    command:
    - /bin/sh
    - -c
    - |
      set -e
      echo "Testing web app health endpoint..."
      curl -f http://web-app:80/health
      echo "Testing web app ready endpoint..."
      curl -f http://web-app:80/ready
      echo "Testing web app API endpoint..."
      curl -f http://web-app:80/api/status
      echo "All smoke tests passed!"

---
# tests/load-test.yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: web-app-load-test
  namespace: production
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: load-test
        image: loadimpact/k6:latest
        command:
        - k6
        - run
        - --vus=50
        - --duration=5m
        - /scripts/load-test.js
        volumeMounts:
        - name: test-scripts
          mountPath: /scripts
      volumes:
      - name: test-scripts
        configMap:
          name: load-test-scripts

---
# tests/chaos-test.yaml
apiVersion: chaos-mesh.org/v1alpha1
kind: PodChaos
metadata:
  name: web-app-pod-failure
  namespace: production
spec:
  action: pod-failure
  mode: one
  duration: "30s"
  selector:
    labelSelectors:
      app: web-app
  scheduler:
    cron: "0 */6 * * *"
```

## Implementation Patterns

### 1. Infrastructure as Code Pattern
Declarative infrastructure management with Kubernetes manifests:
- YAML-based resource definitions
- Helm charts for templating and reusability
- Kustomize for environment-specific configurations
- GitOps workflow for version-controlled deployments

### 2. Microservices Deployment Pattern
Container orchestration for distributed applications:
- Service discovery with Kubernetes DNS
- Load balancing with Services and Ingress
- Inter-service communication with service mesh
- Circuit breaker pattern for resilience

### 3. Auto-scaling Pattern
Dynamic resource management based on demand:
- Horizontal Pod Autoscaler (HPA) for replica scaling
- Vertical Pod Autoscaler (VPA) for resource optimization
- Cluster Autoscaler for node management
- Custom metrics for application-specific scaling

### 4. Blue-Green Deployment Pattern
Zero-downtime deployments with traffic switching:
- Parallel environment maintenance
- Traffic routing with Ingress controllers
- Health checks for deployment validation
- Rollback mechanisms for failure recovery

### 5. Canary Deployment Pattern
Gradual rollout with risk mitigation:
- Progressive traffic shifting
- A/B testing integration
- Automated rollback on failure detection
- Metrics-based promotion decisions

### 6. Service Mesh Pattern
Advanced traffic management and observability:
- Istio or Linkerd for service-to-service communication
- Traffic policies and routing rules
- Mutual TLS for security
- Distributed tracing and metrics

### 7. Observability Pattern
Comprehensive monitoring and logging:
- Prometheus for metrics collection
- Grafana for visualization and alerting
- Jaeger for distributed tracing
- Fluentd for log aggregation

### 8. Security Hardening Pattern
Multi-layered security implementation:
- RBAC for access control
- Network policies for traffic segmentation
- Pod security policies for runtime security
- Secret management with encryption

## Expected Output

This template will produce:

- **Complete Kubernetes Deployment**: Production-ready deployments with proper resource management and security
- **Helm Chart Structure**: Reusable, configurable charts for multiple environments
- **Service Mesh Integration**: Istio configuration for traffic management and observability
- **Auto-scaling Configuration**: HPA and VPA for optimal resource utilization
- **Monitoring and Alerting**: Prometheus rules, Grafana dashboards, and ServiceMonitor
- **GitOps Workflow**: ArgoCD applications for automated deployment and synchronization
- **Security Hardening**: RBAC, NetworkPolicies, and PodSecurityPolicies
- **Disaster Recovery**: Velero backup and restore configurations
- **Testing Framework**: Smoke tests, load tests, and chaos engineering

## Integration Points

- Connects with containerization modules for Docker image management
- Integrates with CI/CD modules for automated deployment pipelines
- Works with monitoring modules for comprehensive observability
- Supports security modules for compliance and hardening
- Compatible with cloud platform modules for managed Kubernetes services

## Security Considerations

- Non-root container execution with proper user and group settings
- Read-only root filesystem for enhanced security
- Network policies for micro-segmentation and traffic control
- RBAC for fine-grained access control
- Secret management with proper encryption and rotation
- Pod security policies for runtime security enforcement

## Performance Features

- Resource requests and limits for optimal scheduling
- Horizontal and vertical pod autoscaling for dynamic scaling
- Affinity and anti-affinity rules for optimal pod placement
- Liveness and readiness probes for health monitoring
- Rolling updates with zero-downtime deployments
- Connection pooling and circuit breakers for resilience

## Operational Excellence

- Comprehensive monitoring with Prometheus and Grafana
- Centralized logging with structured output
- GitOps workflow for declarative configuration management
- Automated backup and disaster recovery procedures
- Chaos engineering for resilience testing
- Multi-environment support with environment-specific configurations

This template provides a comprehensive foundation for deploying and managing applications in Kubernetes with enterprise-grade reliability, security, and observability.
