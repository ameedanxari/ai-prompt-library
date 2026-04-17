# Enterprise Role-Based Access Control (RBAC) Template

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

This template provides comprehensive patterns for implementing advanced role-based access control systems in enterprise SaaS applications. It covers hierarchical roles, fine-grained permissions, dynamic authorization, attribute-based access control (ABAC), and enterprise-grade security features required for B2B platforms.

## Context

Enterprise applications require sophisticated access control mechanisms that go beyond simple user roles. This template addresses complex organizational structures, delegation patterns, conditional access, audit requirements, and integration with enterprise identity systems while maintaining performance and usability.

## Core Components

### Role Management System

## Examples

```typescript
interface RoleManager {
  createRole(tenantId: string, roleData: RoleCreationRequest): Promise<Role>;
  updateRole(tenantId: string, roleId: string, updates: RoleUpdateRequest): Promise<Role>;
  deleteRole(tenantId: string, roleId: string): Promise<void>;
  getRoles(tenantId: string, filters?: RoleFilters): Promise<Role[]>;
  assignRole(tenantId: string, userId: string, roleId: string, context?: AssignmentContext): Promise<void>;
  revokeRole(tenantId: string, userId: string, roleId: string): Promise<void>;
}

interface Role {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  type: RoleType;
  level: number;
  permissions: Permission[];
  parentRoles: string[];
  childRoles: string[];
  conditions: AccessCondition[];
  metadata: RoleMetadata;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

enum RoleType {
  SYSTEM = 'system',
  TENANT_ADMIN = 'tenant_admin',
  DEPARTMENT = 'department',
  FUNCTIONAL = 'functional',
  PROJECT = 'project',
  CUSTOM = 'custom'
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
  scope?: PermissionScope;
  constraints?: PermissionConstraint[];
}

interface PermissionScope {
  type: ScopeType;
  values: string[];
  inheritance: boolean;
}

enum ScopeType {
  GLOBAL = 'global',
  TENANT = 'tenant',
  DEPARTMENT = 'department',
  PROJECT = 'project',
  RESOURCE = 'resource',
  CUSTOM = 'custom'
}
```

### Advanced Authorization Engine

```typescript
interface AuthorizationEngine {
  authorize(request: AuthorizationRequest): Promise<AuthorizationResult>;
  evaluatePermissions(userId: string, resource: string, action: string, context?: AuthContext): Promise<boolean>;
  getEffectivePermissions(userId: string, context?: AuthContext): Promise<EffectivePermissions>;
  checkBulkPermissions(requests: BulkAuthorizationRequest[]): Promise<BulkAuthorizationResult>;
}

interface AuthorizationRequest {
  userId: string;
  tenantId: string;
  resource: string;
  action: string;
  context?: AuthContext;
  attributes?: Record<string, any>;
}

interface AuthContext {
  ipAddress?: string;
  userAgent?: string;
  location?: GeographicLocation;
  timeOfDay?: Date;
  department?: string;
  project?: string;
  resourceOwner?: string;
  customAttributes?: Record<string, any>;
}

interface AuthorizationResult {
  allowed: boolean;
  reason: string;
  appliedPolicies: string[];
  conditions?: AccessCondition[];
  ttl?: number;
  auditInfo: AuditInfo;
}
```

### Hierarchical Role System

```typescript
interface HierarchicalRoleManager {
  createRoleHierarchy(tenantId: string, hierarchy: RoleHierarchy): Promise<void>;
  updateRoleHierarchy(tenantId: string, roleId: string, changes: HierarchyChanges): Promise<void>;
  getRoleHierarchy(tenantId: string): Promise<RoleHierarchy>;
  getInheritedPermissions(roleId: string): Promise<Permission[]>;
  validateHierarchy(hierarchy: RoleHierarchy): Promise<ValidationResult>;
}

interface RoleHierarchy {
  tenantId: string;
  rootRoles: string[];
  relationships: RoleRelationship[];
  inheritanceRules: InheritanceRule[];
}

interface RoleRelationship {
  parentRole: string;
  childRole: string;
  inheritanceType: InheritanceType;
  conditions?: InheritanceCondition[];
}

enum InheritanceType {
  FULL = 'full',
  PARTIAL = 'partial',
  CONDITIONAL = 'conditional',
  DELEGATED = 'delegated'
}

interface InheritanceRule {
  fromRole: string;
  toRole: string;
  permissionFilter: PermissionFilter;
  conditions: InheritanceCondition[];
}
```

### Attribute-Based Access Control (ABAC)

```typescript
interface ABACEngine {
  evaluatePolicy(policy: ABACPolicy, request: AuthorizationRequest): Promise<PolicyResult>;
  createPolicy(tenantId: string, policy: ABACPolicyDefinition): Promise<ABACPolicy>;
  updatePolicy(tenantId: string, policyId: string, updates: ABACPolicyUpdate): Promise<ABACPolicy>;
  deletePolicy(tenantId: string, policyId: string): Promise<void>;
  getPolicies(tenantId: string, filters?: PolicyFilters): Promise<ABACPolicy[]>;
}

interface ABACPolicy {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  rules: PolicyRule[];
  priority: number;
  isActive: boolean;
  effectiveDate?: Date;
  expirationDate?: Date;
}

interface PolicyRule {
  id: string;
  condition: PolicyCondition;
  effect: PolicyEffect;
  obligations?: PolicyObligation[];
  advice?: PolicyAdvice[];
}

interface PolicyCondition {
  subject: AttributeExpression;
  resource: AttributeExpression;
  action: AttributeExpression;
  environment: AttributeExpression;
  customConditions?: CustomCondition[];
}

enum PolicyEffect {
  PERMIT = 'permit',
  DENY = 'deny',
  NOT_APPLICABLE = 'not_applicable',
  INDETERMINATE = 'indeterminate'
}
```

## Implementation Patterns

### Role Assignment and Management

```typescript
class EnterpriseRoleManager implements RoleManager {
  async assignRole(tenantId: string, userId: string, roleId: string, context?: AssignmentContext): Promise<void> {
    // Validate role assignment
    await this.validateRoleAssignment(tenantId, userId, roleId, context);
    
    // Check for conflicts
    const conflicts = await this.checkRoleConflicts(tenantId, userId, roleId);
    if (conflicts.length > 0) {
      throw new RoleConflictError(`Role conflicts detected: ${conflicts.join(', ')}`);
    }
    
    // Create assignment
    const assignment = await this.roleAssignmentRepository.create({
      tenantId,
      userId,
      roleId,
      assignedBy: context?.assignedBy,
      assignedAt: new Date(),
      effectiveDate: context?.effectiveDate || new Date(),
      expirationDate: context?.expirationDate,
      conditions: context?.conditions || [],
      metadata: context?.metadata || {}
    });
    
    // Update user's effective permissions cache
    await this.permissionCacheManager.invalidateUser(tenantId, userId);
    
    // Audit the assignment
    await this.auditService.logRoleAssignment(tenantId, userId, roleId, context);
    
    // Notify relevant parties
    await this.notificationService.notifyRoleAssignment(assignment);
  }

  private async validateRoleAssignment(tenantId: string, userId: string, roleId: string, context?: AssignmentContext): Promise<void> {
    // Check if user exists and is active
    const user = await this.userService.getUser(tenantId, userId);
    if (!user || !user.isActive) {
      throw new UserNotFoundError(`User ${userId} not found or inactive`);
    }
    
    // Check if role exists and is active
    const role = await this.getRoleById(tenantId, roleId);
    if (!role || !role.isActive) {
      throw new RoleNotFoundError(`Role ${roleId} not found or inactive`);
    }
    
    // Check assignment permissions
    if (context?.assignedBy) {
      const canAssign = await this.authorizationEngine.authorize({
        userId: context.assignedBy,
        tenantId,
        resource: 'role',
        action: 'assign',
        attributes: { targetRole: roleId, targetUser: userId }
      });
      
      if (!canAssign.allowed) {
        throw new InsufficientPermissionsError('Insufficient permissions to assign role');
      }
    }
  }
}
```

### Dynamic Permission Evaluation

```typescript
class DynamicAuthorizationEngine implements AuthorizationEngine {
  async authorize(request: AuthorizationRequest): Promise<AuthorizationResult> {
    const startTime = Date.now();
    
    try {
      // Get user's effective roles and permissions
      const effectivePermissions = await this.getEffectivePermissions(request.userId, request.context);
      
      // Check direct permissions
      const directPermission = this.findMatchingPermission(
        effectivePermissions.direct,
        request.resource,
        request.action
      );
      
      if (directPermission) {
        const result = await this.evaluatePermissionConditions(directPermission, request);
        if (result.allowed) {
          return this.createAuthorizationResult(true, 'Direct permission granted', result);
        }
      }
      
      // Check inherited permissions
      const inheritedPermission = this.findMatchingPermission(
        effectivePermissions.inherited,
        request.resource,
        request.action
      );
      
      if (inheritedPermission) {
        const result = await this.evaluatePermissionConditions(inheritedPermission, request);
        if (result.allowed) {
          return this.createAuthorizationResult(true, 'Inherited permission granted', result);
        }
      }
      
      // Check ABAC policies
      const policyResult = await this.evaluateABACPolicies(request);
      if (policyResult.effect === PolicyEffect.PERMIT) {
        return this.createAuthorizationResult(true, 'Policy-based permission granted', policyResult);
      }
      
      // Default deny
      return this.createAuthorizationResult(false, 'No matching permissions found');
      
    } finally {
      // Record performance metrics
      const duration = Date.now() - startTime;
      await this.metricsService.recordAuthorizationLatency(request.tenantId, duration);
    }
  }

  private async evaluatePermissionConditions(permission: Permission, request: AuthorizationRequest): Promise<ConditionResult> {
    if (!permission.conditions || permission.conditions.length === 0) {
      return { allowed: true, conditions: [] };
    }
    
    const results = await Promise.all(
      permission.conditions.map(condition => this.evaluateCondition(condition, request))
    );
    
    const allPassed = results.every(result => result.passed);
    return {
      allowed: allPassed,
      conditions: results,
      failedConditions: results.filter(r => !r.passed)
    };
  }
}
```

### Delegation and Temporary Access

```typescript
interface DelegationManager {
  createDelegation(request: DelegationRequest): Promise<Delegation>;
  revokeDelegation(delegationId: string): Promise<void>;
  getDelegations(userId: string, filters?: DelegationFilters): Promise<Delegation[]>;
  validateDelegation(delegationId: string): Promise<boolean>;
}

interface Delegation {
  id: string;
  tenantId: string;
  delegator: string;
  delegate: string;
  permissions: Permission[];
  conditions: DelegationCondition[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageCount: number;
  maxUsage?: number;
}

class TemporaryAccessManager {
  async grantTemporaryAccess(request: TemporaryAccessRequest): Promise<TemporaryAccess> {
    // Validate the request
    await this.validateTemporaryAccessRequest(request);
    
    // Create temporary role or permission set
    const tempAccess = await this.temporaryAccessRepository.create({
      tenantId: request.tenantId,
      userId: request.userId,
      grantedBy: request.grantedBy,
      permissions: request.permissions,
      reason: request.reason,
      startTime: request.startTime || new Date(),
      endTime: request.endTime,
      conditions: request.conditions || [],
      approvalRequired: request.approvalRequired || false,
      approvers: request.approvers || []
    });
    
    // If approval required, create approval workflow
    if (tempAccess.approvalRequired) {
      await this.approvalWorkflowService.createApprovalRequest(tempAccess);
    } else {
      // Activate immediately
      await this.activateTemporaryAccess(tempAccess.id);
    }
    
    return tempAccess;
  }

  async activateTemporaryAccess(accessId: string): Promise<void> {
    const access = await this.temporaryAccessRepository.findById(accessId);
    if (!access) {
      throw new TemporaryAccessNotFoundError(`Temporary access ${accessId} not found`);
    }
    
    // Update user's effective permissions
    await this.permissionCacheManager.addTemporaryPermissions(
      access.tenantId,
      access.userId,
      access.permissions,
      access.endTime
    );
    
    // Schedule automatic revocation
    await this.scheduleRevocation(access);
    
    // Audit the activation
    await this.auditService.logTemporaryAccessActivation(access);
  }
}
```

## Integration Points

### Enterprise Identity Provider Integration

```typescript
interface EnterpriseIdentityIntegration {
  syncRolesFromProvider(tenantId: string, providerId: string): Promise<SyncResult>;
  mapExternalRoles(externalRoles: ExternalRole[]): Promise<Role[]>;
  handleRoleUpdates(tenantId: string, updates: RoleUpdate[]): Promise<void>;
  validateExternalUser(tenantId: string, externalUserId: string): Promise<UserValidationResult>;
}

class SAMLRoleIntegration implements EnterpriseIdentityIntegration {
  async syncRolesFromProvider(tenantId: string, providerId: string): Promise<SyncResult> {
    const provider = await this.identityProviderService.getProvider(tenantId, providerId);
    const externalRoles = await this.samlClient.getRoles(provider.endpoint, provider.credentials);
    
    const syncResults = {
      created: 0,
      updated: 0,
      deleted: 0,
      errors: []
    };
    
    for (const externalRole of externalRoles) {
      try {
        const mappedRole = await this.mapExternalRole(tenantId, externalRole);
        const existingRole = await this.roleManager.findRoleByExternalId(tenantId, externalRole.id);
        
        if (existingRole) {
          await this.roleManager.updateRole(tenantId, existingRole.id, mappedRole);
          syncResults.updated++;
        } else {
          await this.roleManager.createRole(tenantId, mappedRole);
          syncResults.created++;
        }
      } catch (error) {
        syncResults.errors.push({
          roleId: externalRole.id,
          error: error.message
        });
      }
    }
    
    return syncResults;
  }
}
```

### Workflow and Approval Integration

```typescript
interface ApprovalWorkflowIntegration {
  createApprovalRequest(request: ApprovalRequest): Promise<ApprovalWorkflow>;
  processApproval(workflowId: string, decision: ApprovalDecision): Promise<void>;
  getApprovalStatus(workflowId: string): Promise<ApprovalStatus>;
  cancelApprovalRequest(workflowId: string): Promise<void>;
}

class RoleApprovalWorkflow {
  async processRoleAssignmentApproval(request: RoleAssignmentApprovalRequest): Promise<void> {
    const workflow = await this.approvalWorkflowService.createApprovalRequest({
      type: 'role_assignment',
      requesterId: request.requesterId,
      targetUserId: request.targetUserId,
      roleId: request.roleId,
      reason: request.reason,
      approvers: await this.getRequiredApprovers(request.tenantId, request.roleId),
      metadata: {
        tenantId: request.tenantId,
        roleDetails: await this.roleManager.getRole(request.tenantId, request.roleId)
      }
    });
    
    // Notify approvers
    await this.notificationService.notifyApprovers(workflow);
    
    // Set up automatic expiration
    await this.scheduleApprovalExpiration(workflow.id, request.expirationTime);
  }

  private async getRequiredApprovers(tenantId: string, roleId: string): Promise<string[]> {
    const role = await this.roleManager.getRole(tenantId, roleId);
    const approvalPolicy = await this.approvalPolicyService.getPolicyForRole(tenantId, roleId);
    
    if (!approvalPolicy) {
      return [];
    }
    
    const approvers = [];
    
    // Add role-specific approvers
    if (approvalPolicy.roleApprovers) {
      approvers.push(...approvalPolicy.roleApprovers);
    }
    
    // Add department approvers if role requires department approval
    if (approvalPolicy.requiresDepartmentApproval) {
      const departmentApprovers = await this.getDepartmentApprovers(tenantId, role.department);
      approvers.push(...departmentApprovers);
    }
    
    // Add security team approval for high-privilege roles
    if (role.level >= approvalPolicy.securityApprovalThreshold) {
      const securityApprovers = await this.getSecurityTeamApprovers(tenantId);
      approvers.push(...securityApprovers);
    }
    
    return [...new Set(approvers)]; // Remove duplicates
  }
}
```

## Security Considerations

### Permission Caching and Performance

```typescript
class PermissionCacheManager {
  private cache: Map<string, CachedPermissions> = new Map();
  private readonly TTL = 300000; // 5 minutes

  async getEffectivePermissions(tenantId: string, userId: string): Promise<EffectivePermissions> {
    const cacheKey = `${tenantId}:${userId}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && !this.isExpired(cached)) {
      return cached.permissions;
    }
    
    // Compute permissions
    const permissions = await this.computeEffectivePermissions(tenantId, userId);
    
    // Cache the result
    this.cache.set(cacheKey, {
      permissions,
      timestamp: Date.now(),
      ttl: this.TTL
    });
    
    return permissions;
  }

  async invalidateUser(tenantId: string, userId: string): Promise<void> {
    const cacheKey = `${tenantId}:${userId}`;
    this.cache.delete(cacheKey);
    
    // Also invalidate any delegated permissions
    await this.invalidateDelegatedPermissions(tenantId, userId);
  }

  private async computeEffectivePermissions(tenantId: string, userId: string): Promise<EffectivePermissions> {
    // Get direct role assignments
    const directRoles = await this.roleAssignmentRepository.getUserRoles(tenantId, userId);
    
    // Get inherited permissions from role hierarchy
    const inheritedPermissions = await this.computeInheritedPermissions(directRoles);
    
    // Get delegated permissions
    const delegatedPermissions = await this.getDelegatedPermissions(tenantId, userId);
    
    // Get temporary permissions
    const temporaryPermissions = await this.getTemporaryPermissions(tenantId, userId);
    
    return {
      direct: this.extractPermissions(directRoles),
      inherited: inheritedPermissions,
      delegated: delegatedPermissions,
      temporary: temporaryPermissions,
      computedAt: new Date()
    };
  }
}
```

### Audit and Compliance

```typescript
interface RBACComplianceManager {
  generateAccessReport(tenantId: string, period: DateRange): Promise<AccessReport>;
  auditRoleAssignments(tenantId: string): Promise<RoleAuditReport>;
  detectPrivilegeEscalation(tenantId: string): Promise<PrivilegeEscalationAlert[]>;
  validateSeparationOfDuties(tenantId: string): Promise<SoDViolation[]>;
}

class RBACSecurityAuditor {
  async auditUnusualAccess(tenantId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Check for unusual permission usage patterns
    const unusualPatterns = await this.detectUnusualPermissionPatterns(tenantId);
    alerts.push(...unusualPatterns);
    
    // Check for dormant high-privilege accounts
    const dormantAccounts = await this.findDormantHighPrivilegeAccounts(tenantId);
    alerts.push(...dormantAccounts);
    
    // Check for excessive permissions
    const excessivePermissions = await this.findExcessivePermissions(tenantId);
    alerts.push(...excessivePermissions);
    
    // Check for role conflicts
    const roleConflicts = await this.detectRoleConflicts(tenantId);
    alerts.push(...roleConflicts);
    
    return alerts;
  }

  private async detectUnusualPermissionPatterns(tenantId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const users = await this.userService.getActiveUsers(tenantId);
    
    for (const user of users) {
      const accessHistory = await this.auditLogService.getUserAccessHistory(tenantId, user.id, {
        days: 30
      });
      
      // Analyze access patterns
      const analysis = await this.accessPatternAnalyzer.analyze(accessHistory);
      
      if (analysis.anomalies.length > 0) {
        alerts.push({
          type: 'unusual_access_pattern',
          severity: 'medium',
          userId: user.id,
          description: `Unusual access patterns detected for user ${user.email}`,
          details: analysis.anomalies,
          timestamp: new Date()
        });
      }
    }
    
    return alerts;
  }
}
```

## Compliance Requirements

### Regulatory Compliance Support

```typescript
interface ComplianceFramework {
  validateSOXCompliance(tenantId: string): Promise<SOXComplianceReport>;
  validateGDPRCompliance(tenantId: string): Promise<GDPRComplianceReport>;
  validateHIPAACompliance(tenantId: string): Promise<HIPAAComplianceReport>;
  generateComplianceEvidence(tenantId: string, framework: string): Promise<ComplianceEvidence>;
}

class SOXComplianceValidator {
  async validateSOXCompliance(tenantId: string): Promise<SOXComplianceReport> {
    const report: SOXComplianceReport = {
      tenantId,
      validationDate: new Date(),
      overallStatus: 'compliant',
      findings: [],
      recommendations: []
    };
    
    // Check separation of duties
    const sodViolations = await this.validateSeparationOfDuties(tenantId);
    if (sodViolations.length > 0) {
      report.findings.push({
        type: 'separation_of_duties_violation',
        severity: 'high',
        description: 'Separation of duties violations detected',
        details: sodViolations
      });
      report.overallStatus = 'non_compliant';
    }
    
    // Check access reviews
    const accessReviews = await this.validateAccessReviews(tenantId);
    if (!accessReviews.compliant) {
      report.findings.push({
        type: 'access_review_deficiency',
        severity: 'medium',
        description: 'Access review requirements not met',
        details: accessReviews.deficiencies
      });
    }
    
    // Check audit trail completeness
    const auditTrail = await this.validateAuditTrail(tenantId);
    if (!auditTrail.complete) {
      report.findings.push({
        type: 'audit_trail_gap',
        severity: 'high',
        description: 'Audit trail gaps detected',
        details: auditTrail.gaps
      });
      report.overallStatus = 'non_compliant';
    }
    
    return report;
  }
}
```

## Testing Considerations

### RBAC Testing Strategies

```typescript
// Role hierarchy testing
describe('Role Hierarchy Management', () => {
  it('should correctly inherit permissions through role hierarchy', async () => {
    const tenant = await createTestTenant();
    
    // Create role hierarchy: Admin -> Manager -> Employee
    const adminRole = await roleManager.createRole(tenant.id, {
      name: 'Admin',
      permissions: [
        { resource: 'users', action: 'create' },
        { resource: 'users', action: 'read' },
        { resource: 'users', action: 'update' },
        { resource: 'users', action: 'delete' }
      ]
    });
    
    const managerRole = await roleManager.createRole(tenant.id, {
      name: 'Manager',
      parentRoles: [adminRole.id],
      permissions: [
        { resource: 'reports', action: 'read' },
        { resource: 'reports', action: 'create' }
      ]
    });
    
    const employeeRole = await roleManager.createRole(tenant.id, {
      name: 'Employee',
      parentRoles: [managerRole.id],
      permissions: [
        { resource: 'profile', action: 'read' },
        { resource: 'profile', action: 'update' }
      ]
    });
    
    // Test permission inheritance
    const employeePermissions = await roleManager.getInheritedPermissions(employeeRole.id);
    
    expect(employeePermissions).toContainEqual(
      expect.objectContaining({ resource: 'users', action: 'read' })
    );
    expect(employeePermissions).toContainEqual(
      expect.objectContaining({ resource: 'reports', action: 'read' })
    );
    expect(employeePermissions).toContainEqual(
      expect.objectContaining({ resource: 'profile', action: 'read' })
    );
  });
});

// Authorization performance testing
describe('Authorization Performance', () => {
  it('should authorize requests within acceptable time limits', async () => {
    const tenant = await createTestTenant();
    const user = await createTestUser(tenant.id);
    
    // Assign multiple roles with complex permissions
    await assignComplexRoleStructure(tenant.id, user.id);
    
    const requests = Array.from({ length: 100 }, (_, i) => ({
      userId: user.id,
      tenantId: tenant.id,
      resource: `resource_${i % 10}`,
      action: 'read'
    }));
    
    const startTime = Date.now();
    const results = await Promise.all(
      requests.map(req => authorizationEngine.authorize(req))
    );
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(1000); // 1 second for 100 requests
    expect(results.every(r => r.auditInfo)).toBe(true);
  });
});
```

### Security Testing

- **Permission boundary testing**: Verify users cannot access resources outside their permissions
- **Role escalation testing**: Test for unauthorized privilege escalation attempts
- **Delegation security testing**: Verify delegation cannot be abused for unauthorized access
- **Audit trail testing**: Ensure all authorization decisions are properly logged
- **Performance testing**: Test authorization performance under load

This template provides a comprehensive foundation for implementing enterprise-grade RBAC systems with advanced features, security considerations, and compliance support.
