# Stage 03 - Architecture: Platform-Agnostic Design

## Purpose
Define the core system architecture, design patterns, and technical decisions that apply across all target platforms.

This stage establishes the foundational architecture design that ensures data consistency, security protocols, and testing strategies work seamlessly across all platforms.

## Instructions
Use this stage to establish the foundational architecture that will support all platforms. Define data models, API contracts, security patterns, and integration strategies that ensure consistency and maintainability across the entire system.

## Non-Negotiable Architecture Outputs
Stage 03 must produce these artifacts before moving forward:
- `prompts/outputs/architecture/architecture.md`
- `prompts/outputs/specifications/data-architecture.md`
- `prompts/outputs/specifications/backend-infrastructure.md`
- `prompts/outputs/specifications/prompt-usage-log.md` (Stage 03 entry)

Required behavior:
1. Pick an explicit primary database + backup strategy (no "TBD" placeholders).
2. Define migration ownership and rollout approach.
3. Define backend runtime and deployment topology aligned with scope documents.
4. Map API contracts to concrete service boundaries and environments.
5. Record selected prompt lego blocks used in this stage and where they applied.

## Examples
```markdown
## Example Architecture Design

### Project: Multi-Platform Task Management System
**Architecture Pattern**: Headless/API-First Architecture
**Data Layer**: PostgreSQL with Prisma ORM
**API Layer**: GraphQL with Apollo Server
**Authentication**: JWT with refresh tokens
**Real-time**: WebSocket connections for live updates

### Core Components
1. **API Gateway**: Single entry point for all client requests
2. **Authentication Service**: Centralized user management
3. **Task Service**: Core business logic for task management
4. **Notification Service**: Push notifications and email alerts
5. **File Service**: Document and media file handling
```

## Core Architecture Framework

### System Architecture Patterns
```markdown
## Architecture Pattern Selection

### Headless/API-First Architecture (Recommended)
**Best For**: Multi-platform applications with web, mobile, and future platform support
**Components**: 
- Backend API (REST/GraphQL)
- Web frontend (React/Vue/Angular)
- Mobile apps (React Native/Flutter/Native)
- Admin dashboard
- Third-party integrations

**Benefits**:
- Platform independence and flexibility
- Consistent data and business logic across platforms
- Easy integration with third-party services
- Scalable and maintainable architecture
- Future-proof for new platforms

### Microservices Architecture
**Best For**: Large-scale applications with complex business domains
**Components**:
- User Management Service
- Core Business Logic Services
- Notification Service
- File Storage Service
- Analytics Service

**Benefits**:
- Independent scaling and deployment
- Technology diversity per service
- Fault isolation and resilience
- Team autonomy and parallel development
- Easy maintenance and updates

### Monolithic Architecture
**Best For**: Smaller applications with simple requirements
**Components**:
- Single application server
- Integrated database
- Unified deployment
- Shared codebase

**Benefits**:
- Simpler development and deployment
- Easier debugging and testing
- Lower operational complexity
- Faster initial development
- Cost-effective for smaller teams
```

### Data Architecture Design
```markdown
## Data Management Strategy

### Database Design Principles
#### Relational Database (PostgreSQL/MySQL)
**Best For**: Complex relationships, ACID compliance, structured data
**Schema Design**:
- Normalized data structure
- Foreign key relationships
- Indexes for performance
- Constraints for data integrity
- Migrations for schema evolution

#### NoSQL Database (MongoDB/DynamoDB)
**Best For**: Flexible schema, horizontal scaling, document storage
**Schema Design**:
- Document-based structure
- Embedded vs referenced relationships
- Indexes for query performance
- Flexible schema evolution
- Horizontal scaling strategy

#### Hybrid Approach
**Best For**: Applications with both structured and unstructured data needs
**Strategy**:
- Relational database for core business data
- NoSQL for flexible/unstructured data
- Data synchronization strategies
- Consistent backup and recovery
- Cross-database transaction handling

### API Design Architecture
#### REST API Design
```json
{
  "apiDesign": {
    "version": "v1",
    "baseUrl": "https://api.example.com/v1",
    "authentication": "JWT Bearer tokens",
    "contentType": "application/json",
    "errorHandling": "RFC 7807 Problem Details",
    "pagination": "cursor-based pagination",
    "rateLimit": "100 requests per minute per user"
  },
  "endpoints": {
    "users": "/users",
    "tasks": "/tasks",
    "projects": "/projects",
    "notifications": "/notifications"
  },
  "httpMethods": {
    "GET": "Retrieve resources",
    "POST": "Create new resources",
    "PUT": "Update entire resources",
    "PATCH": "Partial resource updates",
    "DELETE": "Remove resources"
  }
}
```

#### GraphQL API Design
```graphql
# Core GraphQL Schema
type User {
  id: ID!
  email: String!
  name: String!
  tasks: [Task!]!
  projects: [Project!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Task {
  id: ID!
  title: String!
  description: String
  status: TaskStatus!
  priority: Priority!
  assignee: User
  project: Project!
  dueDate: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Query {
  me: User
  tasks(filter: TaskFilter, sort: TaskSort): [Task!]!
  projects(filter: ProjectFilter): [Project!]!
}

type Mutation {
  createTask(input: CreateTaskInput!): Task!
  updateTask(id: ID!, input: UpdateTaskInput!): Task!
  deleteTask(id: ID!): Boolean!
}

type Subscription {
  taskUpdated(projectId: ID!): Task!
  userNotification(userId: ID!): Notification!
}
```
```

### Security Architecture
```markdown
## Security Framework Design

### Authentication and Authorization
#### JWT-Based Authentication
```json
{
  "authentication": {
    "strategy": "JWT with refresh tokens",
    "accessTokenExpiry": "15 minutes",
    "refreshTokenExpiry": "7 days",
    "tokenStorage": "httpOnly cookies (web), secure storage (mobile)",
    "tokenRotation": "automatic refresh token rotation",
    "multiFactorAuth": "TOTP and SMS support"
  },
  "authorization": {
    "model": "Role-Based Access Control (RBAC)",
    "roles": ["admin", "manager", "user", "guest"],
    "permissions": ["read", "write", "delete", "admin"],
    "resourceLevel": "project and task level permissions",
    "inheritance": "role hierarchy with permission inheritance"
  }
}
```

#### OAuth 2.0 Integration
- **Social Login**: Google, Facebook, Apple, GitHub
- **Enterprise SSO**: SAML, OpenID Connect
- **API Access**: OAuth 2.0 for third-party integrations
- **Scope Management**: Granular permission scopes
- **Token Management**: Secure token storage and refresh

### Data Security and Privacy
#### Encryption Strategy
- **Data at Rest**: AES-256 encryption for sensitive data
- **Data in Transit**: TLS 1.3 for all communications
- **Key Management**: Secure key storage and rotation
- **Database Encryption**: Transparent data encryption
- **File Encryption**: Encrypted file storage for uploads

#### Privacy Compliance
- **GDPR Compliance**: Right to access, rectify, erase, portability
- **CCPA Compliance**: California privacy rights and disclosures
- **Data Minimization**: Collect only necessary data
- **Consent Management**: User consent tracking and management
- **Data Retention**: Automated data retention and deletion policies
```

### Integration Architecture
```markdown
## External Integration Strategy

### Third-Party Service Integration
#### Communication Services
- **Email Service**: SendGrid, AWS SES, Mailgun
- **SMS Service**: Twilio, AWS SNS
- **Push Notifications**: Firebase Cloud Messaging, Apple Push Notification
- **Video Conferencing**: Zoom, Google Meet, Microsoft Teams APIs
- **Chat Integration**: Slack, Microsoft Teams, Discord webhooks

#### Business Service Integration
- **Payment Processing**: Stripe, PayPal, Square
- **Analytics**: Google Analytics, Mixpanel, Amplitude
- **Customer Support**: Zendesk, Intercom, Freshdesk
- **File Storage**: AWS S3, Google Cloud Storage, Azure Blob
- **Search**: Elasticsearch, Algolia, AWS CloudSearch

### API Integration Patterns
#### Webhook Management
```json
{
  "webhookStrategy": {
    "authentication": "HMAC signature verification",
    "retryPolicy": "exponential backoff with max 5 retries",
    "timeout": "30 seconds per request",
    "errorHandling": "dead letter queue for failed webhooks",
    "monitoring": "webhook delivery success rate tracking"
  },
  "supportedEvents": [
    "user.created",
    "task.updated",
    "project.completed",
    "payment.processed"
  ]
}
```

#### Event-Driven Architecture
- **Message Queues**: Redis, RabbitMQ, AWS SQS
- **Event Streaming**: Apache Kafka, AWS Kinesis
- **Event Sourcing**: Store all changes as events
- **CQRS**: Command Query Responsibility Segregation
- **Saga Pattern**: Distributed transaction management
```

### Performance and Scalability Architecture
```markdown
## Performance Optimization Strategy

### Caching Architecture
#### Multi-Level Caching
```json
{
  "cachingStrategy": {
    "levels": {
      "browser": "HTTP caching headers, service worker",
      "cdn": "CloudFlare, AWS CloudFront edge caching",
      "application": "Redis in-memory caching",
      "database": "Query result caching, connection pooling"
    },
    "policies": {
      "staticAssets": "1 year cache with versioning",
      "apiResponses": "5 minutes with ETag validation",
      "userSessions": "15 minutes sliding expiration",
      "databaseQueries": "1 hour with cache invalidation"
    }
  }
}
```

#### Database Optimization
- **Query Optimization**: Proper indexing and query analysis
- **Connection Pooling**: Efficient database connection management
- **Read Replicas**: Separate read and write database instances
- **Partitioning**: Horizontal and vertical data partitioning
- **Archiving**: Historical data archiving strategies

### Scalability Patterns
#### Horizontal Scaling
- **Load Balancing**: Application load balancer with health checks
- **Auto Scaling**: Automatic scaling based on metrics
- **Database Sharding**: Horizontal database partitioning
- **Microservices**: Independent service scaling
- **CDN Distribution**: Global content distribution

#### Monitoring and Observability
- **Application Monitoring**: APM tools (New Relic, DataDog)
- **Infrastructure Monitoring**: Server and database metrics
- **Log Aggregation**: Centralized logging (ELK stack, Splunk)
- **Error Tracking**: Error monitoring and alerting
- **Performance Metrics**: Response times, throughput, error rates
```

## Quality Assurance Architecture

### Testing Strategy Architecture
```markdown
## Comprehensive Testing Framework

### Test Pyramid Implementation
#### Unit Testing (70% of tests)
- **Business Logic**: Core business rule validation
- **Data Models**: Model validation and relationships
- **Utility Functions**: Helper function correctness
- **API Endpoints**: Individual endpoint testing
- **Service Layer**: Service method testing

#### Integration Testing (20% of tests)
- **Database Integration**: Data persistence and retrieval
- **External API Integration**: Third-party service integration
- **Message Queue Integration**: Event processing validation
- **Authentication Integration**: Auth flow testing
- **File Upload Integration**: File processing workflows

#### End-to-End Testing (10% of tests)
- **Critical User Journeys**: Complete workflow validation
- **Cross-Platform Testing**: Consistent behavior validation
- **Performance Testing**: Load and stress testing
- **Security Testing**: Vulnerability assessment
- **Accessibility Testing**: WCAG compliance validation

### Quality Gates and Metrics
```json
{
  "qualityGates": {
    "codeQuality": {
      "coverage": "minimum 85% for business logic",
      "complexity": "cyclomatic complexity < 10",
      "duplication": "< 3% code duplication",
      "maintainability": "maintainability index > 70"
    },
    "security": {
      "vulnerabilities": "zero high/critical vulnerabilities",
      "dependencies": "all dependencies up to date",
      "secrets": "no hardcoded secrets or credentials",
      "permissions": "principle of least privilege"
    },
    "performance": {
      "apiResponse": "95th percentile < 200ms",
      "databaseQuery": "95th percentile < 100ms",
      "memoryUsage": "< 512MB per service instance",
      "errorRate": "< 0.1% error rate"
    }
  }
}
```
```

This platform-agnostic architecture provides the foundation for building scalable, secure, and maintainable applications across all target platforms while ensuring consistency and quality throughout the system.

## Next Steps
- **Stage 04 - Features**: Feature-specific architecture and implementation planning
- **Technology Stack Finalization**: Confirm specific technology choices
- **Infrastructure Planning**: Cloud provider and deployment architecture
- **Security Implementation**: Detailed security implementation planning
