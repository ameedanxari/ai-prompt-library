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

