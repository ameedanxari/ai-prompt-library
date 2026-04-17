# AWS Cloud Platform Module

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
This module provides cost-optimized AWS deployment patterns with a serverless-first approach, leveraging managed services and automatic scaling for production-ready applications. It focuses on minimizing operational overhead while maximizing cost efficiency through intelligent service selection, right-sizing resources, and implementing best practices for security, monitoring, and disaster recovery. The module is designed to scale from free-tier development to enterprise production workloads.

## Instructions
Use this module to deploy applications on AWS with cost optimization as a primary concern. Start with serverless services (Lambda, DynamoDB, S3) for variable workloads, then add managed services (RDS, ElastiCache) as needed. Configure auto-scaling groups for predictable workloads and implement lifecycle policies for storage cost optimization. Use the provided CloudFormation/CDK templates to ensure consistent deployments across environments. Monitor costs using AWS Cost Explorer and set up billing alerts. Follow the security best practices including IAM roles, VPC configuration, and encryption at rest and in transit.

## Examples

### Serverless API Deployment
```yaml
# serverless.yml configuration
service: my-api
provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  memorySize: 512
  timeout: 30
  environment:
    NODE_ENV: production
    
functions:
  api:
    handler: src/handler.main
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
    
resources:
  Resources:
    DynamoDBTable:
      Type: AWS::DynamoDB::Table
      Properties:
        BillingMode: ON_DEMAND
        AttributeDefinitions:
          - AttributeName: id
            AttributeType: S
        KeySchema:
          - AttributeName: id
            KeyType: HASH
```

### Cost-Optimized Infrastructure
```typescript
// CDK stack for cost-optimized deployment
export class CostOptimizedStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);
    
    // Lambda function with cost optimization
    const apiFunction = new Function(this, 'ApiFunction', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: Code.fromAsset('dist'),
      memorySize: 512,
      timeout: Duration.seconds(30),
      reservedConcurrentExecutions: 10, // Limit concurrent executions
    });
    
    // DynamoDB with on-demand billing
    const table = new Table(this, 'DataTable', {
      billingMode: BillingMode.ON_DEMAND,
      partitionKey: { name: 'id', type: AttributeType.STRING },
      pointInTimeRecovery: false, // Enable only if needed
      removalPolicy: RemovalPolicy.DESTROY, // For dev environments
    });
    
    // S3 with lifecycle policies
    const bucket = new Bucket(this, 'AssetsBucket', {
      lifecycleRules: [{
        id: 'cost-optimization',
        transitions: [{
          storageClass: StorageClass.INFREQUENT_ACCESS,
          transitionAfter: Duration.days(30)
        }, {
          storageClass: StorageClass.GLACIER,
          transitionAfter: Duration.days(90)
        }]
      }]
    });
  }
}
```

### Auto-Scaling Configuration
```yaml
# Auto Scaling Group with cost optimization
AutoScalingGroup:
  Type: AWS::AutoScaling::AutoScalingGroup
  Properties:
    MinSize: 1
    MaxSize: 10
    DesiredCapacity: 2
    LaunchTemplate:
      LaunchTemplateId: !Ref LaunchTemplate
      Version: !GetAtt LaunchTemplate.LatestVersionNumber
    TargetGroupARNs:
      - !Ref TargetGroup
    HealthCheckType: ELB
    HealthCheckGracePeriod: 300
    
LaunchTemplate:
  Type: AWS::EC2::LaunchTemplate
  Properties:
    LaunchTemplateData:
      InstanceType: t3.micro  # Cost-optimized instance type
      ImageId: ami-0abcdef1234567890
      IamInstanceProfile:
        Arn: !GetAtt InstanceProfile.Arn
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          yum update -y
          # Install application
```

## Overview
Cost-optimized AWS deployment with serverless-first approach, managed services, and automatic scaling for production-ready applications.

## Technology Stack Configuration

### Core AWS Services Configuration

### Compute Services
- **AWS Lambda**: Serverless functions for API endpoints and background processing
- **AWS Fargate**: Containerized applications without server management
- **EC2 (when needed)**: t3.micro/t3.small instances with auto-scaling groups
- **Elastic Beanstalk**: Simple application deployment and management

### Storage and Database
- **Amazon RDS**: Managed PostgreSQL/MySQL with automated backups
- **DynamoDB**: NoSQL database with on-demand billing
- **S3**: Object storage for static assets and file uploads
- **ElastiCache**: Redis/Memcached for caching and sessions

### Cost Optimization Strategy
```yaml
# AWS Cost Optimization Configuration
compute:
  lambda:
    memory: 512MB  # Start small, monitor and adjust
    timeout: 30s   # Minimize timeout to reduce costs
    provisioned_concurrency: 0  # Use on-demand by default
  
  fargate:
    cpu: 0.25 vCPU    # Minimum for development
    memory: 0.5 GB    # Scale based on actual usage
  
database:
  rds:
    instance_class: db.t3.micro  # Free tier eligible
    storage_type: gp2            # General purpose SSD
    backup_retention: 7          # Minimum for production
  
  dynamodb:
    billing_mode: ON_DEMAND      # Pay per request
    point_in_time_recovery: false # Enable only if needed

storage:
  s3:
    storage_class: STANDARD      # Use IA/Glacier for archival
    lifecycle_policy: enabled    # Auto-transition to cheaper tiers
```

## Feature Adaptations

### Serverless Architecture Template
```typescript
// AWS Lambda function with cost optimization
export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Connection pooling to reduce cold starts
  const db = await getDBConnection();
  
  try {
    const result = await processRequest(event);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Lambda error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  } finally {
    // Reuse connections to reduce costs
    if (event.requestContext.requestId) {
      // Keep connection alive for subsequent requests
    }
  }
};
```

### Implementation Guidelines

## Configuration Variables
- `{{aws_region}}` - AWS region (default: us-east-1 for cost optimization)
- `{{cost_tier}}` - Cost optimization level (free-tier, low-cost, standard)
- `{{environment}}` - Environment (dev, staging, prod)
- `{{auto_scaling}}` - Enable auto-scaling (true/false)

## Dependencies
- AWS CLI and CDK/CloudFormation
- IAM roles and policies
- Route 53 for DNS (optional)
- CloudFront for CDN
- CloudWatch for monitoring
