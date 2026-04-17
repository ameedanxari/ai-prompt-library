# Multi-Tenancy Architecture Template

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

This template provides comprehensive patterns for implementing multi-tenant SaaS applications with strict tenant isolation, data segregation, and scalable architecture. It covers tenant onboarding, data partitioning strategies, resource isolation, and tenant-specific customizations while maintaining security and performance.

## Context

Multi-tenancy is essential for SaaS applications serving multiple organizations or customers from a single application instance. This template addresses the complexities of tenant isolation, data security, resource sharing, and customization while ensuring scalability and maintainability.

## Core Components

### Tenant Management System

## Examples

```typescript
interface TenantManager {
  createTenant(tenantData: TenantCreationRequest): Promise<Tenant>;
  getTenant(tenantId: string): Promise<Tenant>;
  updateTenant(tenantId: string, updates: TenantUpdateRequest): Promise<Tenant>;
  deleteTenant(tenantId: string): Promise<void>;
  listTenants(filters?: TenantFilters): Promise<PaginatedTenants>;
}

interface Tenant {
  id: string;
  name: string;
  domain: string;
  subdomain?: string;
  status: TenantStatus;
  plan: SubscriptionPlan;
  settings: TenantSettings;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

interface TenantSettings {
  customization: CustomizationSettings;
  features: FeatureFlags;
  limits: ResourceLimits;
  security: SecuritySettings;
  integrations: IntegrationSettings;
}

enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  DELETED = 'deleted'
}
```

### Data Isolation Strategies

```typescript
interface DataIsolationStrategy {
  getConnectionForTenant(tenantId: string): Promise<DatabaseConnection>;
  executeQuery(tenantId: string, query: string, params?: any[]): Promise<any>;
  migrateSchema(tenantId: string, migration: Migration): Promise<void>;
  backupTenantData(tenantId: string): Promise<BackupResult>;
}

// Database per tenant strategy
interface DatabasePerTenantStrategy extends DataIsolationStrategy {
  createTenantDatabase(tenantId: string): Promise<void>;
  deleteTenantDatabase(tenantId: string): Promise<void>;
  listTenantDatabases(): Promise<string[]>;
}

// Schema per tenant strategy
interface SchemaPerTenantStrategy extends DataIsolationStrategy {
  createTenantSchema(tenantId: string): Promise<void>;
  deleteTenantSchema(tenantId: string): Promise<void>;
  listTenantSchemas(): Promise<string[]>;
}

// Row-level security strategy
interface RowLevelSecurityStrategy extends DataIsolationStrategy {
  setTenantContext(tenantId: string): Promise<void>;
  clearTenantContext(): Promise<void>;
  validateTenantAccess(tenantId: string, resourceId: string): Promise<boolean>;
}
```

### Tenant Context Management

```typescript
interface TenantContextManager {
  setCurrentTenant(tenantId: string): void;
  getCurrentTenant(): string | null;
  clearTenantContext(): void;
  validateTenantAccess(resourceId: string): boolean;
}

interface TenantMiddleware {
  extractTenantFromRequest(request: Request): Promise<string>;
  validateTenantAccess(tenantId: string, userId: string): Promise<boolean>;
  injectTenantContext(request: Request, response: Response, next: NextFunction): Promise<void>;
}

interface TenantResolver {
  resolveFromDomain(domain: string): Promise<string>;
  resolveFromSubdomain(subdomain: string): Promise<string>;
  resolveFromHeader(headerValue: string): Promise<string>;
  resolveFromToken(token: string): Promise<string>;
}
```

## Implementation Patterns

### Tenant Identification and Resolution

```typescript
// Domain-based tenant resolution
class DomainTenantResolver implements TenantResolver {
  async resolveFromDomain(domain: string): Promise<string> {
    const tenant = await this.tenantRepository.findByDomain(domain);
    if (!tenant) {
      throw new TenantNotFoundError(`No tenant found for domain: ${domain}`);
    }
    return tenant.id;
  }

  async resolveFromSubdomain(subdomain: string): Promise<string> {
    const tenant = await this.tenantRepository.findBySubdomain(subdomain);
    if (!tenant) {
      throw new TenantNotFoundError(`No tenant found for subdomain: ${subdomain}`);
    }
    return tenant.id;
  }
}

// Middleware for tenant context injection
class TenantContextMiddleware implements TenantMiddleware {
  async injectTenantContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = await this.extractTenantFromRequest(req);
      this.contextManager.setCurrentTenant(tenantId);
      
      // Validate tenant status
      const tenant = await this.tenantManager.getTenant(tenantId);
      if (tenant.status !== TenantStatus.ACTIVE) {
        throw new TenantInactiveError(`Tenant ${tenantId} is not active`);
      }
      
      next();
    } catch (error) {
      this.contextManager.clearTenantContext();
      next(error);
    }
  }
}
```

### Database Isolation Implementation

```typescript
// Database per tenant implementation
class DatabasePerTenantManager implements DatabasePerTenantStrategy {
  private connectionPool: Map<string, DatabaseConnection> = new Map();

  async getConnectionForTenant(tenantId: string): Promise<DatabaseConnection> {
    if (!this.connectionPool.has(tenantId)) {
      const connection = await this.createConnection(tenantId);
      this.connectionPool.set(tenantId, connection);
    }
    return this.connectionPool.get(tenantId)!;
  }

  private async createConnection(tenantId: string): Promise<DatabaseConnection> {
    const dbConfig = {
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: `tenant_${tenantId}`,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    };
    
    return new DatabaseConnection(dbConfig);
  }
}

// Row-level security implementation
class RowLevelSecurityManager implements RowLevelSecurityStrategy {
  async setTenantContext(tenantId: string): Promise<void> {
    await this.connection.query('SET app.current_tenant = $1', [tenantId]);
  }

  async executeQuery(tenantId: string, query: string, params?: any[]): Promise<any> {
    await this.setTenantContext(tenantId);
    try {
      return await this.connection.query(query, params);
    } finally {
      await this.clearTenantContext();
    }
  }
}
```

### Tenant Onboarding Workflow

```typescript
class TenantOnboardingService {
  async onboardTenant(request: TenantOnboardingRequest): Promise<TenantOnboardingResult> {
    const transaction = await this.database.beginTransaction();
    
    try {
      // 1. Create tenant record
      const tenant = await this.tenantManager.createTenant({
        name: request.organizationName,
        domain: request.domain,
        plan: request.subscriptionPlan,
        adminUser: request.adminUser
      });

      // 2. Set up data isolation
      await this.dataIsolationStrategy.createTenantDatabase(tenant.id);
      
      // 3. Run initial migrations
      await this.migrationService.runInitialMigrations(tenant.id);
      
      // 4. Create admin user
      const adminUser = await this.userService.createTenantAdmin(tenant.id, request.adminUser);
      
      // 5. Set up default configurations
      await this.configurationService.setupDefaults(tenant.id);
      
      // 6. Initialize billing
      await this.billingService.setupTenantBilling(tenant.id, request.subscriptionPlan);
      
      await transaction.commit();
      
      return {
        tenant,
        adminUser,
        loginUrl: this.generateTenantLoginUrl(tenant),
        setupInstructions: this.generateSetupInstructions(tenant)
      };
    } catch (error) {
      await transaction.rollback();
      throw new TenantOnboardingError(`Failed to onboard tenant: ${error.message}`);
    }
  }
}
```

## Integration Points

### Authentication and Authorization Integration

```typescript
interface TenantAwareAuthService {
  authenticateUser(tenantId: string, credentials: UserCredentials): Promise<AuthResult>;
  authorizeAction(tenantId: string, userId: string, action: string, resource: string): Promise<boolean>;
  getTenantUsers(tenantId: string, filters?: UserFilters): Promise<User[]>;
  inviteUserToTenant(tenantId: string, invitation: UserInvitation): Promise<void>;
}

// Integration with SSO providers
class TenantSSOIntegration {
  async configureSSOForTenant(tenantId: string, ssoConfig: SSOConfiguration): Promise<void> {
    const tenant = await this.tenantManager.getTenant(tenantId);
    
    // Configure SAML/OIDC for tenant
    await this.ssoProvider.createConfiguration({
      tenantId,
      entityId: `${tenant.domain}/saml`,
      acsUrl: `${this.baseUrl}/auth/saml/acs/${tenantId}`,
      ssoUrl: ssoConfig.ssoUrl,
      certificate: ssoConfig.certificate
    });
  }
}
```

### Billing and Subscription Integration

```typescript
interface TenantBillingIntegration {
  setupTenantBilling(tenantId: string, plan: SubscriptionPlan): Promise<void>;
  updateTenantSubscription(tenantId: string, newPlan: SubscriptionPlan): Promise<void>;
  trackUsage(tenantId: string, metric: string, value: number): Promise<void>;
  generateInvoice(tenantId: string, period: BillingPeriod): Promise<Invoice>;
}

class UsageTrackingService {
  async trackTenantUsage(tenantId: string, metrics: UsageMetrics): Promise<void> {
    await this.metricsStore.record(tenantId, {
      timestamp: new Date(),
      apiCalls: metrics.apiCalls,
      storageUsed: metrics.storageUsed,
      activeUsers: metrics.activeUsers,
      customMetrics: metrics.customMetrics
    });
    
    // Check usage limits
    const limits = await this.getTenantLimits(tenantId);
    await this.enforceUsageLimits(tenantId, metrics, limits);
  }
}
```

## Security Considerations

### Data Isolation Security

- **Database-level isolation**: Use separate databases or schemas per tenant
- **Application-level validation**: Always validate tenant context before data access
- **Query parameterization**: Use parameterized queries to prevent tenant data leakage
- **Connection pooling**: Implement secure connection pooling with tenant context
- **Backup isolation**: Ensure tenant backups are isolated and encrypted

### Access Control Security

- **Tenant boundary enforcement**: Strict validation of tenant access boundaries
- **Cross-tenant prevention**: Implement checks to prevent cross-tenant data access
- **Admin privilege separation**: Separate system admin from tenant admin privileges
- **API security**: Implement tenant-aware API authentication and authorization
- **Audit logging**: Comprehensive logging of all tenant-related operations

### Infrastructure Security

```typescript
interface TenantSecurityManager {
  validateTenantAccess(tenantId: string, userId: string): Promise<boolean>;
  auditTenantOperation(tenantId: string, operation: string, details: any): Promise<void>;
  detectCrossTenantAccess(request: Request): Promise<SecurityAlert[]>;
  encryptTenantData(tenantId: string, data: any): Promise<string>;
  decryptTenantData(tenantId: string, encryptedData: string): Promise<any>;
}

class TenantSecurityAuditor {
  async auditDataAccess(tenantId: string, userId: string, resource: string): Promise<void> {
    await this.auditLog.record({
      tenantId,
      userId,
      action: 'data_access',
      resource,
      timestamp: new Date(),
      ipAddress: this.getCurrentIP(),
      userAgent: this.getCurrentUserAgent()
    });
  }
}
```

## Compliance Requirements

### Data Residency and Sovereignty

- **Geographic data isolation**: Store tenant data in specified geographic regions
- **Data sovereignty compliance**: Ensure compliance with local data protection laws
- **Cross-border data transfer**: Implement controls for international data transfers
- **Regulatory compliance**: Support GDPR, CCPA, HIPAA, and other regulatory requirements

### Audit and Compliance Tracking

```typescript
interface ComplianceManager {
  generateComplianceReport(tenantId: string, period: DateRange): Promise<ComplianceReport>;
  trackDataProcessing(tenantId: string, activity: DataProcessingActivity): Promise<void>;
  manageDataRetention(tenantId: string, policy: RetentionPolicy): Promise<void>;
  handleDataSubjectRequests(tenantId: string, request: DataSubjectRequest): Promise<void>;
}

class TenantComplianceService {
  async handleGDPRRequest(tenantId: string, request: GDPRRequest): Promise<GDPRResponse> {
    switch (request.type) {
      case 'access':
        return await this.generateDataExport(tenantId, request.subjectId);
      case 'deletion':
        return await this.deletePersonalData(tenantId, request.subjectId);
      case 'portability':
        return await this.exportPortableData(tenantId, request.subjectId);
      default:
        throw new UnsupportedRequestError(`Unsupported GDPR request type: ${request.type}`);
    }
  }
}
```

## Testing Considerations

### Multi-Tenancy Testing Strategies

```typescript
// Tenant isolation testing
describe('Tenant Data Isolation', () => {
  it('should prevent cross-tenant data access', async () => {
    const tenant1 = await createTestTenant('tenant1');
    const tenant2 = await createTestTenant('tenant2');
    
    const data1 = await createTestData(tenant1.id);
    
    // Attempt to access tenant1 data from tenant2 context
    await setTenantContext(tenant2.id);
    const result = await dataService.getData(data1.id);
    
    expect(result).toBeNull();
  });
  
  it('should maintain data integrity during tenant operations', async () => {
    const tenant = await createTestTenant('test-tenant');
    const initialData = await createTestData(tenant.id);
    
    // Perform concurrent operations
    await Promise.all([
      updateTestData(tenant.id, initialData.id),
      createTestData(tenant.id),
      deleteTestData(tenant.id, 'other-id')
    ]);
    
    const finalData = await getTestData(tenant.id, initialData.id);
    expect(finalData).toBeDefined();
    expect(finalData.integrity).toBe(true);
  });
});

// Performance testing for multi-tenancy
describe('Multi-Tenant Performance', () => {
  it('should handle concurrent tenant operations efficiently', async () => {
    const tenants = await createMultipleTestTenants(10);
    const startTime = Date.now();
    
    await Promise.all(tenants.map(tenant => 
      performTenantOperations(tenant.id, 100)
    ));
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // 5 seconds max
  });
});
```

### Integration Testing

- **Cross-tenant isolation verification**: Test that tenant data remains isolated
- **Performance under load**: Test system performance with multiple active tenants
- **Failover and recovery**: Test tenant data recovery and system resilience
- **Migration testing**: Test tenant data migration and schema updates
- **Security penetration testing**: Test for tenant boundary vulnerabilities

## Performance Optimization

### Tenant-Aware Caching

```typescript
class TenantAwareCacheManager {
  async get(tenantId: string, key: string): Promise<any> {
    const tenantKey = `tenant:${tenantId}:${key}`;
    return await this.cache.get(tenantKey);
  }
  
  async set(tenantId: string, key: string, value: any, ttl?: number): Promise<void> {
    const tenantKey = `tenant:${tenantId}:${key}`;
    await this.cache.set(tenantKey, value, ttl);
  }
  
  async invalidateTenant(tenantId: string): Promise<void> {
    const pattern = `tenant:${tenantId}:*`;
    await this.cache.deletePattern(pattern);
  }
}
```

### Resource Management

- **Connection pooling**: Implement efficient database connection pooling per tenant
- **Resource quotas**: Enforce resource limits and quotas per tenant
- **Auto-scaling**: Implement tenant-aware auto-scaling strategies
- **Load balancing**: Distribute tenant load across multiple instances
- **Monitoring**: Implement comprehensive tenant-specific monitoring and alerting

This template provides a comprehensive foundation for implementing multi-tenant SaaS applications with proper isolation, security, and scalability considerations.
