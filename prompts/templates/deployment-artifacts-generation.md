# Deployment Artifacts Generation Template

## Purpose
This template provides comprehensive prompts for generating deployment scripts, app store assets, monitoring configurations, and all necessary artifacts for production deployment.

## Core Deployment Artifact Prompts

### Deployment Script Generation

```markdown
# Deployment Script Generation

You are a DevOps specialist responsible for creating comprehensive deployment scripts and configurations. Your task is to generate production-ready deployment artifacts that ensure reliable, secure, and scalable application deployment.

## Deployment Script Generation Process

This process includes Infrastructure as Code, CI/CD Pipeline Configuration, and Container Deployment Configuration to provide complete deployment automation.

### 1. Infrastructure as Code (IaC)
Infrastructure as Code using Terraform and CloudFormation provides automated infrastructure provisioning and management.
```yaml
# Example Terraform configuration template
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "app_name" {
  description = "Application name"
  type        = string
}

# Resources
resource "aws_s3_bucket" "app_storage" {
  bucket = "${var.app_name}-${var.environment}-storage"
  
  tags = {
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_cloudfront_distribution" "app_cdn" {
  # CDN configuration for web assets
  origin {
    domain_name = aws_s3_bucket.app_storage.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.app_storage.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.app_storage.id}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

### 2. CI/CD Pipeline Configuration
```yaml
# Example GitHub Actions workflow
name: Deploy Application

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  PYTHON_VERSION: '3.11'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Run security audit
        run: npm audit --audit-level moderate
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          NODE_ENV: production
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: staging
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to staging
        run: |
          aws s3 sync dist/ s3://${{ secrets.STAGING_BUCKET }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.STAGING_DISTRIBUTION_ID }} --paths "/*"

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to production
        run: |
          aws s3 sync dist/ s3://${{ secrets.PRODUCTION_BUCKET }} --delete
          aws cloudfront create-invalidation --distribution-id ${{ secrets.PRODUCTION_DISTRIBUTION_ID }} --paths "/*"
      
      - name: Notify deployment
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### 3. Container Deployment Configuration
```dockerfile
# Multi-stage Dockerfile for production deployment
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# Docker Compose for local development and testing
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "3000:80"
    environment:
      - NODE_ENV=production
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER}"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  postgres_data:
  redis_data:
```

## Deployment Script Generation Instructions

1. **Analyze the project requirements** and determine the appropriate deployment strategy
2. **Select the deployment platform** (AWS, Azure, GCP, Heroku, etc.) based on requirements
3. **Generate infrastructure as code** using Terraform, CloudFormation, or platform-specific tools
4. **Create CI/CD pipeline configuration** for automated testing and deployment
5. **Include container configuration** if using containerized deployment
6. **Add monitoring and logging** configuration for production observability
7. **Include security configurations** such as SSL certificates, security groups, and access controls
8. **Create rollback procedures** for quick recovery from deployment issues
```

### App Store Asset Creation

```markdown
# App Store Asset Creation

You are a mobile app marketing specialist responsible for creating comprehensive app store assets. Your task is to generate all required materials for successful app store submissions across multiple platforms and locales.

## App Store Asset Creation Process

This includes iOS App Store Assets, Google Play Store Assets, and Multi-Language Asset Generation to ensure comprehensive app store coverage.

### 1. iOS App Store Assets

#### Required Screenshots
```markdown
## iOS Screenshot Specifications

### iPhone Screenshots
- **6.7" Display (iPhone 14 Pro Max)**: 1290 x 2796 pixels
- **6.1" Display (iPhone 14 Pro)**: 1179 x 2556 pixels  
- **5.5" Display (iPhone 8 Plus)**: 1242 x 2208 pixels

### iPad Screenshots  
- **12.9" Display (iPad Pro)**: 2048 x 2732 pixels
- **11" Display (iPad Pro)**: 1668 x 2388 pixels

### Screenshot Specifications
Screenshots must show actual app functionality and include diverse representation in user-facing content.
- Show actual app functionality, not marketing materials
- Include diverse representation in user-facing content
- Highlight key features and user benefits
- Use high-quality, crisp images
- Avoid excessive text overlay
```

#### App Store Metadata Template
```json
{
  "app_name": "[App Name - max 30 characters]",
  "subtitle": "[App subtitle - max 30 characters]",
  "description": "[App description - max 4000 characters]",
  "keywords": "[Comma-separated keywords - max 100 characters]",
  "promotional_text": "[Promotional text - max 170 characters]",
  "privacy_policy_url": "[Privacy policy URL]",
  "support_url": "[Support URL]",
  "marketing_url": "[Marketing website URL]",
  "age_rating": "[4+, 9+, 12+, 17+]",
  "category": {
    "primary": "[Primary category]",
    "secondary": "[Secondary category - optional]"
  },
  "localization": {
    "en-US": {
      "name": "[Localized app name]",
      "description": "[Localized description]",
      "keywords": "[Localized keywords]"
    }
  }
}
```

### 2. Google Play Store Assets

#### Required Graphics
```markdown
## Google Play Store Graphics Specifications

### Screenshots
- **Phone**: 320dp to 3840dp (minimum width)
- **7-inch Tablet**: 1024dp to 3840dp
- **10-inch Tablet**: 1024dp to 3840dp
- **TV**: 1920 x 1080 pixels
- **Wear OS**: 384 x 384 pixels

### Feature Graphic
- **Dimensions**: 1024 x 500 pixels
- **Format**: JPEG or 24-bit PNG (no alpha)
- **File size**: Maximum 1MB

### App Icon
- **Dimensions**: 512 x 512 pixels
- **Format**: 32-bit PNG with alpha
- **File size**: Maximum 1MB
```

#### Play Store Listing Template
```json
{
  "title": "[App title - max 50 characters]",
  "short_description": "[Short description - max 80 characters]",
  "full_description": "[Full description - max 4000 characters]",
  "category": "[App category]",
  "content_rating": "[Everyone, Teen, Mature 17+, etc.]",
  "privacy_policy": "[Privacy policy URL]",
  "data_safety": {
    "data_collected": "[List of data types collected]",
    "data_shared": "[List of data types shared]",
    "security_practices": "[Encryption, secure transmission, etc.]"
  },
  "localization": {
    "en-US": {
      "title": "[Localized title]",
      "short_description": "[Localized short description]",
      "full_description": "[Localized full description]"
    }
  }
}
```

### 3. Multi-Language Asset Generation

#### Localization Asset Template
```markdown
## Localization Requirements

### Supported Languages
- Primary: [Primary language - usually English]
- Secondary: [List of additional languages]

### Localized Assets per Language
- [ ] App name (if different from primary)
- [ ] App description
- [ ] Keywords/search terms
- [ ] Screenshots with localized UI
- [ ] Feature graphic with localized text
- [ ] Privacy policy in local language
- [ ] Support documentation

### Localization Guidelines
1. **Cultural Adaptation**: Ensure content is culturally appropriate
2. **Text Length**: Account for text expansion/contraction in different languages
3. **Visual Elements**: Adapt graphics for right-to-left languages if needed
4. **Legal Compliance**: Ensure compliance with local regulations
5. **Quality Assurance**: Native speaker review for all localized content
```

## Asset Creation Instructions

1. **Gather app information** including features, benefits, and unique selling points
2. **Create screenshot mockups** showing key app functionality and user flows
3. **Design feature graphics** that highlight the app's main value proposition
4. **Write compelling descriptions** that clearly communicate app benefits
5. **Optimize for app store search** using relevant keywords and phrases
6. **Ensure compliance** with platform-specific guidelines and policies
7. **Localize all assets** for target markets and languages
8. **Test asset quality** on actual devices and app store interfaces
```

### Monitoring Configuration

```markdown
# Monitoring Configuration

You are a Site Reliability Engineer (SRE) responsible for implementing comprehensive monitoring and observability for production applications. Your task is to create monitoring configurations that provide visibility into application health, performance, and user experience.

## Monitoring Configuration Process

This includes Application Performance Monitoring, Infrastructure Monitoring, Log Management, and Alerting Configuration to provide complete observability.

### 1. Application Performance Monitoring (APM)

Application Performance Monitoring provides deep insights into application behavior and user experience.

#### New Relic Configuration
```javascript
// newrelic.js configuration
'use strict'

exports.config = {
  app_name: ['[APP_NAME]'],
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  logging: {
    level: 'info'
  },
  allow_all_headers: true,
  attributes: {
    exclude: [
      'request.headers.cookie',
      'request.headers.authorization',
      'request.headers.proxyAuthorization',
      'request.headers.setCookie*',
      'request.headers.x*',
      'response.headers.cookie',
      'response.headers.authorization',
      'response.headers.proxyAuthorization',
      'response.headers.setCookie*',
      'response.headers.x*'
    ]
  },
  distributed_tracing: {
    enabled: true
  },
  transaction_tracer: {
    enabled: true,
    transaction_threshold: 'apdex_f',
    record_sql: 'obfuscated',
    explain_threshold: 500
  },
  error_collector: {
    enabled: true,
    ignore_status_codes: [404]
  }
}
```

#### DataDog APM Configuration
```yaml
# datadog.yaml
api_key: ${DD_API_KEY}
site: datadoghq.com

# APM Configuration
apm_config:
  enabled: true
  env: ${ENVIRONMENT}
  service: ${SERVICE_NAME}
  version: ${APP_VERSION}

# Log Collection
logs_enabled: true
logs_config:
  container_collect_all: true
  processing_rules:
    - type: exclude_at_match
      name: exclude_healthcheck
      pattern: "GET /health"

# Process Collection
process_config:
  enabled: true

# Network Performance Monitoring
network_config:
  enabled: true

# Security Agent
security_agent:
  enabled: true
```

### 2. Infrastructure Monitoring

#### Prometheus Configuration
```yaml
# prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'application'
    static_configs:
      - targets: ['app:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'database'
    static_configs:
      - targets: ['postgres-exporter:9187']
```

#### Grafana Dashboard Configuration
```json
{
  "dashboard": {
    "title": "Application Monitoring Dashboard",
    "tags": ["application", "monitoring"],
    "timezone": "browser",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Error Rate",
        "type": "singlestat",
        "targets": [
          {
            "expr": "rate(http_requests_total{status=~\"5..\"}[5m]) / rate(http_requests_total[5m])",
            "legendFormat": "Error Rate"
          }
        ]
      }
    ]
  }
}
```

### 3. Log Management

#### ELK Stack Configuration
```yaml
# logstash.conf
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "application" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{DATA:logger} - %{GREEDYDATA:message}" }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    if [level] == "ERROR" {
      mutate {
        add_tag => [ "error" ]
      }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "application-logs-%{+YYYY.MM.dd}"
  }
}
```

#### Fluentd Configuration
```ruby
# fluent.conf
<source>
  @type forward
  port 24224
  bind 0.0.0.0
</source>

<filter application.**>
  @type parser
  key_name log
  reserve_data true
  <parse>
    @type json
  </parse>
</filter>

<match application.**>
  @type elasticsearch
  host elasticsearch
  port 9200
  logstash_format true
  logstash_prefix application
  <buffer>
    @type file
    path /var/log/fluentd-buffers/kubernetes.system.buffer
    flush_mode interval
    retry_type exponential_backoff
    flush_thread_count 2
    flush_interval 5s
    retry_forever
    retry_max_interval 30
    chunk_limit_size 2M
    queue_limit_length 8
    overflow_action block
  </buffer>
</match>
```

### 4. Alerting Configuration

#### Alert Rules
```yaml
# alert_rules.yml
groups:
  - name: application_alerts
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.1
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value }} errors per second"

      - alert: HighResponseTime
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value }} seconds"

      - alert: DatabaseConnectionFailure
        expr: up{job="database"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
          description: "Database is not responding"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value | humanizePercentage }}"
```

#### PagerDuty Integration
```yaml
# alertmanager.yml
global:
  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'pagerduty'
  routes:
    - match:
        severity: critical
      receiver: 'pagerduty-critical'

receivers:
  - name: 'pagerduty'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        description: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

  - name: 'pagerduty-critical'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_CRITICAL_SERVICE_KEY}'
        description: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'
        severity: 'critical'
```

## Monitoring Configuration Instructions

1. **Define monitoring requirements** based on SLA and business needs
2. **Select appropriate monitoring tools** for the technology stack
3. **Configure application instrumentation** for metrics and tracing
4. **Set up infrastructure monitoring** for servers, containers, and services
5. **Implement log aggregation** and analysis capabilities
6. **Create meaningful dashboards** for different stakeholders
7. **Configure alerting rules** with appropriate thresholds and escalation
8. **Test monitoring setup** to ensure alerts fire correctly
9. **Document monitoring procedures** and runbooks for incident response
```

## Usage Instructions

1. **Select the appropriate template** based on deployment requirements
2. **Customize the configuration** for your specific project needs
3. **Generate platform-specific artifacts** using the provided templates
4. **Validate all generated artifacts** before deployment
5. **Test deployment procedures** in staging environment first
6. **Monitor deployment success** using the configured monitoring tools

## Integration with Quality Gates

These deployment artifacts should be validated as part of quality gates:
- **Deployment Scripts**: Tested in staging environment
- **App Store Assets**: Reviewed for compliance and quality
- **Monitoring Configuration**: Validated for completeness and accuracy
- **Documentation**: Verified for accuracy and completeness

## Instructions

### How to Use This Deployment Artifacts Generation Template

1. **Assess Deployment Requirements**
   - Identify target deployment platforms (AWS, Azure, GCP, mobile app stores)
   - Determine infrastructure needs (containers, serverless, traditional servers)
   - Review compliance and security requirements
   - Understand monitoring and observability needs

2. **Select Appropriate Templates**
   - Choose deployment script templates based on your infrastructure
   - Select app store asset templates for mobile applications
   - Pick monitoring configuration templates for your observability stack
   - Customize templates for your specific technology stack

3. **Generate Infrastructure as Code**
   - Use Terraform or CloudFormation templates for cloud infrastructure
   - Configure networking, security groups, and access controls
   - Set up databases, caching layers, and storage solutions
   - Include auto-scaling and load balancing configurations

4. **Create CI/CD Pipelines**
   - Configure automated testing and quality gates
   - Set up multi-environment deployment (dev, staging, production)
   - Include security scanning and vulnerability assessment
   - Add deployment approval workflows for production

5. **Prepare App Store Assets**
   - Generate required screenshots for all supported device sizes
   - Create compelling app descriptions and metadata
   - Design feature graphics and promotional materials
   - Localize assets for target markets and languages

6. **Configure Monitoring and Alerting**
   - Set up application performance monitoring (APM)
   - Configure infrastructure monitoring and logging
   - Create meaningful dashboards for different stakeholders
   - Define alerting rules with appropriate thresholds

7. **Test and Validate**
   - Test deployment scripts in staging environments
   - Validate app store assets meet platform requirements
   - Verify monitoring configurations capture relevant metrics
   - Ensure rollback procedures work correctly

8. **Document and Maintain**
   - Create runbooks for deployment procedures
   - Document monitoring and alerting configurations
   - Maintain deployment artifact templates
   - Update configurations as requirements change

## Examples

### Complete Web Application Deployment Example

Here's a comprehensive example of deploying a React web application with Node.js backend:

#### 1. Project Structure
```
deployment/
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── modules/
│       ├── vpc/
│       ├── ecs/
│       └── rds/
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── monitoring/
│   ├── prometheus/
│   ├── grafana/
│   └── alertmanager/
└── scripts/
    ├── deploy.sh
    └── rollback.sh
```

#### 2. Complete Terraform Configuration
```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  
  backend "s3" {
    bucket = "myapp-terraform-state"
    key    = "production/terraform.tfstate"
    region = "us-east-1"
  }
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Environment = var.environment
      Application = var.app_name
      ManagedBy   = "terraform"
    }
  }
}

# VPC and Networking
module "vpc" {
  source = "./modules/vpc"
  
  app_name    = var.app_name
  environment = var.environment
  cidr_block  = "10.0.0.0/16"
  
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  public_subnets     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  private_subnets    = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
}

# Application Load Balancer
resource "aws_lb" "app_lb" {
  name               = "${var.app_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = module.vpc.public_subnet_ids
  
  enable_deletion_protection = var.environment == "production"
  
  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = "alb-logs"
    enabled = true
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "app_cluster" {
  name = "${var.app_name}-${var.environment}"
  
  configuration {
    execute_command_configuration {
      logging = "OVERRIDE"
      
      log_configuration {
        cloud_watch_encryption_enabled = true
        cloud_watch_log_group_name     = aws_cloudwatch_log_group.ecs_logs.name
      }
    }
  }
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS Database
module "rds" {
  source = "./modules/rds"
  
  app_name    = var.app_name
  environment = var.environment
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = var.db_instance_class
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = var.db_name
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  
  backup_retention_period = var.environment == "production" ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = var.environment != "production"
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/ecs/${var.app_name}-${var.environment}"
  retention_in_days = var.environment == "production" ? 30 : 7
}

# S3 Bucket for Static Assets
resource "aws_s3_bucket" "static_assets" {
  bucket = "${var.app_name}-${var.environment}-static-assets"
}

resource "aws_s3_bucket_public_access_block" "static_assets_pab" {
  bucket = aws_s3_bucket.static_assets.id
  
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "static_assets_cdn" {
  origin {
    domain_name = aws_s3_bucket.static_assets.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.static_assets.id}"
    
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }
  
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  
  default_cache_behavior {
    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-${aws_s3_bucket.static_assets.id}"
    
    forwarded_values {
      query_string = false
      
      cookies {
        forward = "none"
      }
    }
    
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }
  
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
  
  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
```

#### 3. Complete GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY_FRONTEND: myapp-frontend
  ECR_REPOSITORY_BACKEND: myapp-backend

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          npm ci
          cd backend && npm ci
          cd ../frontend && npm ci
      
      - name: Run backend tests
        run: |
          cd backend
          npm run test:coverage
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Run frontend tests
        run: |
          cd frontend
          npm run test:coverage
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
      
      - name: Upload coverage reports
        uses: codecov/codecov-action@v3
        with:
          directory: ./coverage

  security:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Run security audit
        run: |
          npm audit --audit-level moderate
          cd backend && npm audit --audit-level moderate
          cd ../frontend && npm audit --audit-level moderate
      
      - name: Run Snyk security scan
        uses: snyk/actions/node@master
        env:
          SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

  build:
    needs: [test, security]
    runs-on: ubuntu-latest
    
    outputs:
      frontend-image: ${{ steps.build-frontend.outputs.image }}
      backend-image: ${{ steps.build-backend.outputs.image }}
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build and push frontend image
        id: build-frontend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY_FRONTEND:$IMAGE_TAG" >> $GITHUB_OUTPUT
      
      - name: Build and push backend image
        id: build-backend
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY_BACKEND:$IMAGE_TAG" >> $GITHUB_OUTPUT

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to ECS
        run: |
          # Update ECS service with new images
          aws ecs update-service \
            --cluster myapp-staging \
            --service myapp-frontend-staging \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster myapp-staging \
            --service myapp-backend-staging \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster myapp-staging \
            --services myapp-frontend-staging myapp-backend-staging
      
      - name: Run smoke tests
        run: |
          npm run test:smoke
        env:
          BASE_URL: https://staging.myapp.com

  deploy-production:
    needs: [build, deploy-staging]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Deploy to ECS
        run: |
          # Update ECS service with new images
          aws ecs update-service \
            --cluster myapp-production \
            --service myapp-frontend-production \
            --force-new-deployment
          
          aws ecs update-service \
            --cluster myapp-production \
            --service myapp-backend-production \
            --force-new-deployment
      
      - name: Wait for deployment
        run: |
          aws ecs wait services-stable \
            --cluster myapp-production \
            --services myapp-frontend-production myapp-backend-production
      
      - name: Run production smoke tests
        run: |
          npm run test:smoke:production
        env:
          BASE_URL: https://myapp.com
      
      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: '#deployments'
          text: 'Production deployment successful! :rocket:'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
      
      - name: Notify deployment failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: '#deployments'
          text: 'Production deployment failed! :warning:'
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK }}
```

#### 4. Mobile App Store Assets Example

For a task management mobile app:

```json
{
  "ios_app_store": {
    "app_name": "TaskFlow - Smart Task Manager",
    "subtitle": "Organize, Track, Achieve",
    "description": "TaskFlow is the ultimate task management app designed to help you stay organized and productive. With intuitive design, powerful features, and seamless synchronization across all your devices, TaskFlow makes it easy to manage your tasks, projects, and goals.\n\nKey Features:\n• Smart task organization with projects and tags\n• Real-time collaboration with team members\n• Offline mode with automatic sync\n• Customizable reminders and notifications\n• Advanced filtering and search capabilities\n• Beautiful, intuitive interface\n• Cross-platform synchronization\n• Data export and backup options\n\nWhether you're managing personal tasks, coordinating team projects, or tracking long-term goals, TaskFlow provides the tools you need to stay productive and achieve more.\n\nDownload TaskFlow today and transform the way you manage your tasks!",
    "keywords": "task,todo,productivity,organize,project,team,collaboration,reminder,sync",
    "promotional_text": "The smart way to manage tasks and boost productivity. Try TaskFlow today!",
    "privacy_policy_url": "https://taskflow.com/privacy",
    "support_url": "https://taskflow.com/support",
    "marketing_url": "https://taskflow.com",
    "age_rating": "4+",
    "category": {
      "primary": "Productivity",
      "secondary": "Business"
    },
    "screenshots": {
      "iphone_6_7": [
        "screenshot_1_task_list_1290x2796.png",
        "screenshot_2_task_creation_1290x2796.png",
        "screenshot_3_project_view_1290x2796.png",
        "screenshot_4_collaboration_1290x2796.png",
        "screenshot_5_analytics_1290x2796.png"
      ],
      "ipad_12_9": [
        "screenshot_1_dashboard_2048x2732.png",
        "screenshot_2_split_view_2048x2732.png",
        "screenshot_3_project_board_2048x2732.png"
      ]
    }
  },
  "google_play_store": {
    "title": "TaskFlow: Smart Task Manager",
    "short_description": "Organize tasks, collaborate with teams, and boost productivity with TaskFlow.",
    "full_description": "TaskFlow is the ultimate task management solution designed to help individuals and teams stay organized and productive. With its intuitive interface, powerful features, and seamless cross-platform synchronization, TaskFlow makes task management effortless and efficient.\n\n🚀 KEY FEATURES:\n\n✅ Smart Task Organization\n• Create tasks with rich descriptions, due dates, and priorities\n• Organize tasks into projects and categories\n• Use tags and labels for advanced organization\n• Set up recurring tasks and templates\n\n👥 Team Collaboration\n• Share projects with team members\n• Real-time updates and notifications\n• Comment and discuss tasks\n• Assign tasks to team members\n\n📱 Cross-Platform Sync\n• Seamless synchronization across all devices\n• Offline mode with automatic sync when online\n• Web, iOS, and Android apps\n• Data backup and export options\n\n🎯 Productivity Features\n• Customizable reminders and notifications\n• Time tracking and productivity analytics\n• Advanced filtering and search\n• Keyboard shortcuts for power users\n\n🎨 Beautiful Design\n• Clean, intuitive interface\n• Dark mode support\n• Customizable themes and layouts\n• Accessibility features\n\nWhether you're a busy professional, student, or team leader, TaskFlow provides everything you need to manage tasks effectively and achieve your goals.\n\nDownload TaskFlow today and experience the future of task management!",
    "category": "Productivity",
    "content_rating": "Everyone",
    "privacy_policy": "https://taskflow.com/privacy",
    "feature_graphic": "feature_graphic_1024x500.png",
    "screenshots": {
      "phone": [
        "phone_screenshot_1.png",
        "phone_screenshot_2.png",
        "phone_screenshot_3.png",
        "phone_screenshot_4.png",
        "phone_screenshot_5.png"
      ],
      "tablet_7": [
        "tablet_7_screenshot_1.png",
        "tablet_7_screenshot_2.png",
        "tablet_7_screenshot_3.png"
      ]
    }
  }
}
```

#### 5. Complete Monitoring Setup Example

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./monitoring/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - ./monitoring/prometheus/alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
      - ./monitoring/grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./monitoring/alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

This comprehensive example demonstrates how to deploy a complete web application with proper infrastructure, CI/CD, mobile app store presence, and monitoring setup. Each component is production-ready and follows best practices for security, scalability, and maintainability.