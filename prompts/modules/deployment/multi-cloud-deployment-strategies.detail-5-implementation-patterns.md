## Implementation Patterns

### Terraform Multi-Cloud Infrastructure Pattern

```hcl
# terraform/multi-cloud/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
}

# Multi-cloud application deployment
module "multi_cloud_application" {
  source = "./modules/multi-cloud-app"
  
  application_name = var.application_name
  environment = var.environment
  
  # AWS Configuration
  aws_regions = ["us-east-1", "eu-west-1"]
  aws_instance_types = {
    web = "t3.medium"
    api = "c5.large"
    database = "r5.xlarge"
  }
  
  # Azure Configuration
  azure_regions = ["East US", "West Europe"]
  azure_vm_sizes = {
    web = "Standard_B2s"
    api = "Standard_D2s_v3"
    database = "Standard_E4s_v3"
  }
  
  # GCP Configuration
  gcp_regions = ["us-central1", "europe-west1"]
  gcp_machine_types = {
    web = "e2-medium"
    api = "c2-standard-4"
    database = "n2-highmem-4"
  }
  
  # Cross-cloud networking
  cross_cloud_networking = {
    enabled = true
    vpn_connections = true
    intelligent_routing = true
  }
  
  # Cost optimization
  cost_optimization = {
    enabled = true
    budget_limit = 10000
    auto_scaling = true
    spot_instances = true
  }
}

# AWS Resources
resource "aws_vpc" "main" {
  for_each = toset(var.aws_regions)
  
  provider   = aws.region[each.key]
  cidr_block = "10.${index(var.aws_regions, each.key)}.0.0/16"
  
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "${var.application_name}-vpc-${each.key}"
    Environment = var.environment
    Provider = "aws"
    Region = each.key
  }
}

# Azure Resources
resource "azurerm_virtual_network" "main" {
  for_each = toset(var.azure_regions)
  
  name                = "${var.application_name}-vnet-${replace(lower(each.key), " ", "-")}"
  address_space       = ["10.${index(var.azure_regions, each.key) + 10}.0.0/16"]
  location            = each.key
  resource_group_name = azurerm_resource_group.main[each.key].name
  
  tags = {
    Environment = var.environment
    Provider = "azure"
    Region = each.key
  }
}

# GCP Resources
resource "google_compute_network" "main" {
  for_each = toset(var.gcp_regions)
  
  name                    = "${var.application_name}-vpc-${each.key}"
  auto_create_subnetworks = false
  
  project = var.gcp_project_id
}

# Cross-cloud VPN connections
resource "aws_vpn_gateway" "cross_cloud" {
  for_each = toset(var.aws_regions)
  
  vpc_id = aws_vpc.main[each.key].id
  
  tags = {
    Name = "${var.application_name}-vpn-gateway-${each.key}"
    Purpose = "cross-cloud-connectivity"
  }
}

# Multi-cloud load balancer
resource "aws_lb" "global" {
  for_each = toset(var.aws_regions)
  
  name               = "${var.application_name}-global-lb-${each.key}"
  internal           = false
  load_balancer_type = "application"
  
  subnets = aws_subnet.public[each.key].*.id
  
  enable_deletion_protection = false
  
  tags = {
    Environment = var.environment
    Purpose = "multi-cloud-load-balancing"
  }
}
```

### Kubernetes Multi-Cloud Deployment Pattern

```yaml
# kubernetes/multi-cloud-deployment.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: multi-cloud-app
  labels:
    deployment-type: multi-cloud
    optimization: intelligent

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: multi-cloud-web-app
  namespace: multi-cloud-app
  labels:
    app: web-app
    deployment-strategy: multi-cloud
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
      annotations:
        multi-cloud.deployment/provider: "{{ .Values.provider }}"
        multi-cloud.deployment/region: "{{ .Values.region }}"
        multi-cloud.deployment/optimization: "cost-performance"
    spec:
      affinity:
        podAntiAffinity:
          preferredDuringSchedulingIgnoredDuringExecution:
          - weight: 100
            podAffinityTerm:
              labelSelector:
                matchExpressions:
                - key: app
                  operator: In
                  values:
                  - web-app
              topologyKey: kubernetes.io/hostname
      
      containers:
      - name: web-app
        image: "{{ .Values.image.repository }}:{{ .Values.image.tag }}"
        ports:
        - containerPort: 8080
          name: http
        
        env:
        - name: CLOUD_PROVIDER
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['multi-cloud.deployment/provider']
        - name: CLOUD_REGION
          valueFrom:
            fieldRef:
              fieldPath: metadata.annotations['multi-cloud.deployment/region']
        - name: MULTI_CLOUD_OPTIMIZATION
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
          initialDelaySeconds: 30
          periodSeconds: 10
        
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5

---
apiVersion: v1
kind: Service
metadata:
  name: multi-cloud-web-service
  namespace: multi-cloud-app
  annotations:
    multi-cloud.deployment/load-balancing: "intelligent"
    multi-cloud.deployment/failover: "automatic"
spec:
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 8080
    name: http
  type: LoadBalancer

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: multi-cloud-ingress
  namespace: multi-cloud-app
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/use-regex: "true"
    multi-cloud.deployment/routing: "performance-based"
    multi-cloud.deployment/failover: "cross-provider"
spec:
  rules:
  - host: "{{ .Values.domain }}"
    http:
      paths:
      - path: /(.*)
        pathType: Prefix
        backend:
          service:
            name: multi-cloud-web-service
            port:
              number: 80

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: multi-cloud-config
  namespace: multi-cloud-app
data:
  providers.yaml: |
    providers:
      aws:
        regions: ["us-east-1", "eu-west-1"]
        services: ["ec2", "rds", "s3", "lambda"]
        optimization: "cost-performance"
      azure:
        regions: ["eastus", "westeurope"]
        services: ["vm", "sql", "storage", "functions"]
        optimization: "performance"
      gcp:
        regions: ["us-central1", "europe-west1"]
        services: ["compute", "sql", "storage", "functions"]
        optimization: "cost"
  
  routing.yaml: |
    routing:
      strategy: "performance-based"
      failover: "automatic"
      load_balancing: "intelligent"
      health_checks: "comprehensive"
```

