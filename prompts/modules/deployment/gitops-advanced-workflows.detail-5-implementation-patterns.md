});
```

## Implementation Patterns

### ArgoCD Application Configuration Pattern

```yaml
# argocd/applications/web-application.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: web-application
  namespace: argocd
  labels:
    app.kubernetes.io/name: web-application
    gitops.deployment/strategy: intelligent
spec:
  project: default
  
  source:
    repoURL: https://github.com/company/web-app-config
    targetRevision: HEAD
    path: kubernetes
    
    helm:
      valueFiles:
      - values.yaml
      - values-{{ .Values.environment }}.yaml
      
      parameters:
      - name: image.tag
        value: "{{ .Values.image.tag }}"
      - name: environment
        value: "{{ .Values.environment }}"
      - name: gitops.optimization
        value: "ai-driven"
  
  destination:
    server: https://kubernetes.default.svc
    namespace: web-application
  
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
      allowEmpty: false
    
    syncOptions:
    - CreateNamespace=true
    - PrunePropagationPolicy=foreground
    - RespectIgnoreDifferences=true
    
    retry:
      limit: 5
      backoff:
        duration: 5s
        factor: 2
        maxDuration: 3m
  
  revisionHistoryLimit: 10
  
  ignoreDifferences:
  - group: apps
    kind: Deployment
    jsonPointers:
    - /spec/replicas
  
  info:
  - name: 'GitOps Strategy'
    value: 'Intelligent deployment with AI optimization'
  - name: 'Security Scanning'
    value: 'Comprehensive vulnerability and compliance scanning'

---
apiVersion: argoproj.io/v1alpha1
kind: AppProject
metadata:
  name: intelligent-gitops
  namespace: argocd
spec:
  description: Intelligent GitOps project with AI-driven optimization
  
  sourceRepos:
  - 'https://github.com/company/*'
  - 'https://charts.helm.sh/stable'
  
  destinations:
  - namespace: '*'
    server: https://kubernetes.default.svc
  
  clusterResourceWhitelist:
  - group: ''
    kind: Namespace
  - group: rbac.authorization.k8s.io
    kind: ClusterRole
  - group: rbac.authorization.k8s.io
    kind: ClusterRoleBinding
  
  namespaceResourceWhitelist:
  - group: ''
    kind: '*'
  - group: apps
    kind: '*'
  - group: networking.k8s.io
    kind: '*'
  
  roles:
  - name: developer
    description: Developer access with limited permissions
    policies:
    - p, proj:intelligent-gitops:developer, applications, get, intelligent-gitops/*, allow
    - p, proj:intelligent-gitops:developer, applications, sync, intelligent-gitops/*, allow
    groups:
    - company:developers
  
  - name: admin
    description: Admin access with full permissions
    policies:
    - p, proj:intelligent-gitops:admin, applications, *, intelligent-gitops/*, allow
    - p, proj:intelligent-gitops:admin, repositories, *, *, allow
    groups:
    - company:platform-team
```

### Flux GitOps Configuration Pattern

```yaml
# flux/clusters/production/flux-system/gotk-sync.yaml
apiVersion: source.toolkit.fluxcd.io/v1beta2
kind: GitRepository
metadata:
  name: flux-system
  namespace: flux-system
spec:
  interval: 1m0s
  ref:
    branch: main
  secretRef:
    name: flux-system
  url: https://github.com/company/gitops-config
  
---
apiVersion: kustomize.toolkit.fluxcd.io/v1beta2
kind: Kustomization
metadata:
  name: flux-system
  namespace: flux-system
spec:
  interval: 10m0s
  path: ./clusters/production
  prune: true
  sourceRef:
    kind: GitRepository
    name: flux-system
  
  validation: client
  
  healthChecks:
  - apiVersion: apps/v1
    kind: Deployment
    name: web-application
    namespace: web-application
  
  dependsOn:
  - name: infrastructure
  - name: security-policies

---
apiVersion: notification.toolkit.fluxcd.io/v1beta1
kind: Provider
metadata:
  name: slack
  namespace: flux-system
spec:
  type: slack
  channel: gitops-notifications
  secretRef:
    name: slack-webhook

---
apiVersion: notification.toolkit.fluxcd.io/v1beta1
kind: Alert
metadata:
  name: gitops-alerts
  namespace: flux-system
spec:
  providerRef:
    name: slack
  
  eventSeverity: info
  
  eventSources:
  - kind: GitRepository
    name: '*'
  - kind: Kustomization
    name: '*'
  - kind: HelmRelease
    name: '*'
  
  summary: |
    GitOps event in cluster {{ .Cluster }}:
    - Repository: {{ .GitRepository }}
    - Revision: {{ .Revision }}
