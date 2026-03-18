# Stage 07 - Deployment (Platform Agnostic)

## Purpose
Configure deployment infrastructure, CI/CD pipelines, and production environment setup that applies across all platforms, ensuring reliable, secure, and scalable application deployment.

## Instructions

### How to Use This Deployment Stage

1. **Infrastructure Planning**: Define cloud provider, architecture, and resource requirements
2. **CI/CD Pipeline Setup**: Configure automated build, test, and deployment workflows
3. **Environment Management**: Set up development, staging, and production environments
4. **Security Configuration**: Implement security controls, secrets management, and compliance
5. **Monitoring Setup**: Configure logging, metrics, and alerting systems
6. **Disaster Recovery**: Plan backup, recovery, and business continuity procedures

### Deployment Strategy Development

1. **Platform-Agnostic Foundation**: Establish core deployment principles and shared infrastructure
2. **Environment Consistency**: Ensure consistent configuration across all environments
3. **Security First**: Implement security controls and compliance requirements
4. **Scalability Planning**: Design for growth and performance requirements
5. **Monitoring Integration**: Set up comprehensive observability and alerting

## Non-Negotiable Deployment Outputs
Stage 07 must produce these artifacts before moving forward:
- `prompts/outputs/deployment/deployment-plan.md`
- `prompts/outputs/deployment/environment-matrix.md`
- `prompts/outputs/deployment/access-and-secrets-checklist.md`
- `prompts/outputs/deployment/release-runbook.md`
- `prompts/outputs/specifications/prompt-usage-log.md` (Stage 07 entry)

Required behavior:
1. Enumerate all required accounts, keys, certificates, and roles by environment.
2. Identify owner + status for each missing prerequisite (who provides what, by when).
3. Define API deployment topology and rollout sequence separate from UI deployment.
4. Include rollback and verification criteria for each environment.
5. `environment-matrix.md` must include owner + approver + rollback target + release channel per environment.
6. `access-and-secrets-checklist.md` must include environment, owner, status, storage location, and rotation policy per secret.
7. Missing-prerequisites references may remain open, but due dates must not be `TBD` by Stage 08 closeout.

## Examples

### Example 1: Multi-Platform SaaS Deployment

```markdown
# Deployment Strategy: Task Management SaaS

## Infrastructure
- **Cloud Provider**: AWS
- **Architecture**: Microservices with API Gateway
- **Database**: RDS PostgreSQL with read replicas
- **CDN**: CloudFront for static assets
- **Container Orchestration**: ECS with Fargate

## CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
      - name: Security scan
        run: npm audit
  
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        run: aws deploy create-deployment
```

## Environment Configuration
- **Development**: Single instance, shared database
- **Staging**: Production-like setup with test data
- **Production**: Multi-AZ, auto-scaling, encrypted
```

### Example 2: E-commerce Platform Deployment

```markdown
# Deployment Strategy: E-commerce Platform

## Infrastructure
- **Cloud Provider**: Google Cloud Platform
- **Architecture**: Serverless with Cloud Functions
- **Database**: Cloud SQL with automatic backups
- **Storage**: Cloud Storage for product images
- **CDN**: Cloud CDN for global distribution

## Security Configuration
- **SSL/TLS**: Automatic certificate management
- **Secrets**: Google Secret Manager
- **IAM**: Principle of least privilege
- **Compliance**: PCI DSS for payment processing

## Monitoring Stack
- **Logging**: Cloud Logging with structured logs
- **Metrics**: Cloud Monitoring with custom dashboards
- **Alerting**: PagerDuty integration for incidents
- **Performance**: Real User Monitoring (RUM)
```

## Scope
- Infrastructure as Code (IaC) configuration
- CI/CD Pipeline setup and automation
- Environment configuration management
- Security and compliance implementation
- Monitoring and observability setup
- Deployment Automation workflows
- Build Artifacts management and versioning

## Deployment Architecture Framework

### 1. Infrastructure as Code (IaC) Strategy

#### Cloud Provider Selection Matrix
```markdown
## Cloud Provider Evaluation

### AWS (Amazon Web Services)
**Best for**: Enterprise applications, complex architectures, extensive service catalog
- **Strengths**: Comprehensive services, mature ecosystem, global presence
- **Cost Model**: Pay-as-you-go, reserved instances for predictable workloads
- **Key Services**: EC2, S3, RDS, Lambda, CloudFront, Route 53

### Azure (Microsoft Azure)
**Best for**: Enterprise applications, Microsoft stack integration, hybrid cloud
- **Strengths**: Enterprise integration, hybrid capabilities, AI/ML services
- **Cost Model**: Pay-as-you-go, reserved instances, hybrid benefits
- **Key Services**: App Service, Blob Storage, SQL Database, Functions, CDN

### GCP (Google Cloud Platform)
**Best for**: Data analytics, machine learning, containerized applications
- **Strengths**: Data analytics, ML/AI, Kubernetes, competitive pricing
- **Cost Model**: Pay-as-you-go, sustained use discounts, committed use
- **Key Services**: Compute Engine, Cloud Storage, Cloud SQL, Cloud Functions

### Platform-as-a-Service Options
**Heroku**: Simple deployment, good for startups and prototypes
**Vercel**: Optimized for frontend and JAMstack applications
**Netlify**: Static sites and serverless functions
**Railway**: Modern PaaS with simple deployment workflows
```

#### Infrastructure Configuration Templates

##### Terraform Configuration
```hcl
# main.tf - Core infrastructure
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket = "terraform-state-bucket"
    key    = "infrastructure/terraform.tfstate"
    region = "us-east-1"
  }
}

# Variables
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "app_name" {
  description = "Application name"
  type        = string
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

# Networking
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-vpc"
    Environment = var.environment
    Application = var.app_name
  }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-igw"
    Environment = var.environment
  }
}

resource "aws_subnet" "public" {
  count = 2
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-public-${count.index + 1}"
    Environment = var.environment
    Type        = "public"
  }
}

resource "aws_subnet" "private" {
  count = 2
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-private-${count.index + 1}"
    Environment = var.environment
    Type        = "private"
  }
}

# Security Groups
resource "aws_security_group" "web" {
  name_prefix = "${var.app_name}-${var.environment}-web"
  vpc_id      = aws_vpc.main.id
  
  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-web-sg"
    Environment = var.environment
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "${var.app_name}-${var.environment}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = var.environment == "prod"
  
  tags = {
    Name        = "${var.app_name}-${var.environment}-alb"
    Environment = var.environment
  }
}

# Outputs
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "load_balancer_dns" {
  description = "Load balancer DNS name"
  value       = aws_lb.main.dns_name
}
```

### 2. CI/CD Pipeline Configuration

#### GitHub Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy Application

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '18'
  TERRAFORM_VERSION: '1.5.0'

jobs:
  test:
    name: Test and Quality Checks
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linting
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Generate test coverage
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/lcov.info
      
      - name: Security audit
        run: npm audit --audit-level moderate
      
      - name: License check
        run: npm run license:check

  build:
    name: Build Application
    needs: test
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
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
          name: build-artifacts
          path: |
            dist/
            package.json
            package-lock.json
          retention-days: 30

  infrastructure:
    name: Deploy Infrastructure
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        with:
          terraform_version: ${{ env.TERRAFORM_VERSION }}
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Terraform Init
        run: terraform init
        working-directory: ./infrastructure
      
      - name: Terraform Plan
        run: terraform plan -var="environment=${{ github.ref == 'refs/heads/main' && 'prod' || 'staging' }}"
        working-directory: ./infrastructure
      
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/develop'
        run: terraform apply -auto-approve -var="environment=${{ github.ref == 'refs/heads/main' && 'prod' || 'staging' }}"
        working-directory: ./infrastructure

  deploy-staging:
    name: Deploy to Staging
    needs: [build, infrastructure]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/develop'
    environment: staging
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: ./
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.STAGING_BUCKET }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.STAGING_DISTRIBUTION_ID }} --paths "/*"
      
      - name: Run smoke tests
        run: |
          npm run test:smoke -- --baseUrl=https://${{ secrets.STAGING_URL }}

  deploy-production:
    name: Deploy to Production
    needs: [build, infrastructure, deploy-staging]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-artifacts
          path: ./
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://${{ secrets.PRODUCTION_BUCKET }} --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation --distribution-id ${{ secrets.PRODUCTION_DISTRIBUTION_ID }} --paths "/*"
      
      - name: Run smoke tests
        run: |
          npm run test:smoke -- --baseUrl=https://${{ secrets.PRODUCTION_URL }}
      
      - name: Notify deployment success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          message: 'Production deployment successful! 🚀'
      
      - name: Notify deployment failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          channel: '#deployments'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          message: 'Production deployment failed! 🚨'
```

### 3. Environment Configuration Management

#### Environment Configuration Strategy
```markdown
## Environment Management

### Environment Hierarchy
1. **Development**: Local development and feature branches
2. **Staging**: Integration testing and QA validation
3. **Production**: Live application serving real users

### Configuration Management
- **Environment Variables**: Sensitive configuration (API keys, database URLs)
- **Configuration Files**: Non-sensitive settings (feature flags, UI configuration)
- **Infrastructure Configuration**: Terraform variables and modules
- **Application Configuration**: Runtime settings and feature toggles

### Security Best Practices
- Never commit secrets to version control
- Use environment-specific secret management (AWS Secrets Manager, Azure Key Vault)
- Implement least-privilege access controls
- Rotate secrets regularly
- Audit access to sensitive configuration
```

#### Docker Configuration
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install curl for health checks
RUN apk add --no-cache curl

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# Change ownership of nginx directories
RUN chown -R nextjs:nodejs /var/cache/nginx && \
    chown -R nextjs:nodejs /var/log/nginx && \
    chown -R nextjs:nodejs /etc/nginx/conf.d

# Switch to non-root user
USER nextjs

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: production
    ports:
      - "${PORT:-3000}:8080"
    environment:
      - NODE_ENV=${NODE_ENV:-production}
      - API_URL=${API_URL}
      - DATABASE_URL=${DATABASE_URL}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    depends_on:
      database:
        condition: service_healthy
      redis:
        condition: service_healthy

  database:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: ${DB_NAME}
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "${DB_PORT:-5432}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    ports:
      - "${REDIS_PORT:-6379}:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:

networks:
  default:
    name: app-network
```

### 4. Security and Compliance Implementation

#### Security Configuration Checklist
```markdown
## Security Implementation

### Network Security
- [ ] VPC with private subnets for sensitive resources
- [ ] Security groups with minimal required access
- [ ] Network ACLs for additional layer of security
- [ ] VPN or bastion host for administrative access
- [ ] Web Application Firewall (WAF) configuration

### Application Security
- [ ] HTTPS/TLS encryption for all communications
- [ ] Security headers implementation (HSTS, CSP, etc.)
- [ ] Input validation and sanitization
- [ ] Authentication and authorization mechanisms
- [ ] Rate limiting and DDoS protection

### Data Security
- [ ] Encryption at rest for databases and storage
- [ ] Encryption in transit for all data transfers
- [ ] Regular security updates and patches
- [ ] Backup encryption and secure storage
- [ ] Data retention and deletion policies

### Access Control
- [ ] Multi-factor authentication (MFA) for admin access
- [ ] Role-based access control (RBAC)
- [ ] Principle of least privilege
- [ ] Regular access reviews and audits
- [ ] Service account management
```

#### Security Headers Configuration
```nginx
# nginx.conf
server {
    listen 8080;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # Remove server tokens
    server_tokens off;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main application
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
        
        # Security headers for HTML files
        location ~* \.html$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
            add_header Pragma "no-cache";
            add_header Expires "0";
        }
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### 5. Monitoring and Observability Setup

#### Monitoring Stack Configuration
```yaml
# monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
    restart: unless-stopped

  alertmanager:
    image: prom/alertmanager:latest
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
      - '--web.external-url=http://localhost:9093'
    restart: unless-stopped

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
    restart: unless-stopped

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

## Deployment Procedures

### 1. Pre-Deployment Checklist
```markdown
## Pre-Deployment Validation

### Code Quality
- [ ] All tests pass (unit, integration, e2e)
- [ ] Code coverage meets minimum threshold (80%)
- [ ] Security scan passes without critical issues
- [ ] Performance benchmarks are met
- [ ] Documentation is updated

### Infrastructure
- [ ] Infrastructure changes are tested in staging
- [ ] Database migrations are tested and reversible
- [ ] Environment variables are configured
- [ ] SSL certificates are valid and current
- [ ] Monitoring and alerting are configured

### Business Readiness
- [ ] Stakeholder approval for deployment
- [ ] Communication plan is executed
- [ ] Rollback plan is prepared and tested
- [ ] Support team is notified
- [ ] Maintenance window is scheduled (if required)
```

### 2. Deployment Execution
```bash
#!/bin/bash
# deploy.sh - Deployment execution script

set -e

ENVIRONMENT=${1:-staging}
VERSION=${2:-latest}

echo "Starting deployment to $ENVIRONMENT..."

# Pre-deployment checks
echo "Running pre-deployment checks..."
npm run test:smoke
npm run security:scan
npm run performance:check

# Infrastructure deployment
echo "Deploying infrastructure..."
cd infrastructure
terraform plan -var="environment=$ENVIRONMENT"
terraform apply -auto-approve -var="environment=$ENVIRONMENT"
cd ..

# Application deployment
echo "Deploying application..."
if [ "$ENVIRONMENT" = "production" ]; then
    # Blue-green deployment for production
    ./scripts/blue-green-deploy.sh $VERSION
else
    # Rolling deployment for staging
    ./scripts/rolling-deploy.sh $VERSION
fi

# Post-deployment validation
echo "Running post-deployment validation..."
npm run test:smoke -- --baseUrl="https://$ENVIRONMENT.example.com"
npm run test:performance -- --baseUrl="https://$ENVIRONMENT.example.com"

# Health check
echo "Performing health check..."
curl -f "https://$ENVIRONMENT.example.com/health" || exit 1

echo "Deployment to $ENVIRONMENT completed successfully!"
```

### 3. Rollback Procedures
```bash
#!/bin/bash
# rollback.sh - Rollback execution script

set -e

ENVIRONMENT=${1:-staging}
PREVIOUS_VERSION=${2}

if [ -z "$PREVIOUS_VERSION" ]; then
    echo "Error: Previous version not specified"
    exit 1
fi

echo "Starting rollback to version $PREVIOUS_VERSION in $ENVIRONMENT..."

# Database rollback (if needed)
if [ -f "migrations/rollback-$PREVIOUS_VERSION.sql" ]; then
    echo "Rolling back database changes..."
    # Execute rollback migrations
fi

# Application rollback
echo "Rolling back application..."
if [ "$ENVIRONMENT" = "production" ]; then
    # Blue-green rollback
    ./scripts/blue-green-rollback.sh $PREVIOUS_VERSION
else
    # Rolling rollback
    ./scripts/rolling-rollback.sh $PREVIOUS_VERSION
fi

# Validation
echo "Validating rollback..."
npm run test:smoke -- --baseUrl="https://$ENVIRONMENT.example.com"

echo "Rollback to version $PREVIOUS_VERSION completed successfully!"
```

## Integration Points

### Previous Stage Dependencies
- **Stage 06 (Implementation)**: Complete application implementation
- **Testing Results**: All tests passing and quality gates met
- **Documentation**: Deployment documentation and runbooks

### Next Stage Deliverables
- **Deployment Scripts**: Automated deployment and rollback procedures with Deployment Automation
- **Infrastructure Configuration**: Complete IaC setup and documentation
- **CI/CD Pipeline**: Automated Testing and deployment workflows
- **Release Notes**: Comprehensive release documentation and user communication
- **User Documentation**: End-user guides and deployment instructions
- **Monitoring Setup**: Comprehensive observability and alerting
- **Security Configuration**: Production-ready security implementation

## Success Criteria
- Infrastructure is deployed and configured correctly
- CI/CD pipeline is operational and reliable
- Security measures are implemented and validated
- Monitoring and alerting are functional
- Deployment and rollback procedures are tested and documented

## Risk Mitigation
- **Deployment Failures**: Automated rollback procedures and health checks
- **Security Vulnerabilities**: Regular security scans and updates
- **Performance Issues**: Load testing and performance monitoring
- **Data Loss**: Backup and recovery procedures
- **Service Disruption**: Blue-green or canary deployment strategies
