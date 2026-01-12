# Role-Based Access Control (RBAC) Module

## Overview
This module provides comprehensive role-based access control with fine-grained permissions, audit logging, and production-ready security features for secure user authorization across all application features.

## Integration Points

This template integrates with the following v2 security templates:
- **Advanced Authorization** (`security/advanced-authorization.md`): ABAC policies and dynamic authorization
- **Multi-Factor Authentication** (`security/multi-factor-auth.md`): Step-up authentication for sensitive operations
- **Threat Detection** (`security/threat-detection.md`): Anomaly detection for access patterns
- **Privacy Controls** (`security/privacy-controls.md`): Consent-based access management
- **Audit Trails** (`enterprise-saas/audit-trails.md`): Comprehensive access logging

### Cross-Domain Composition Support

This template supports composition with domain-specific templates:
- **Enterprise SaaS** (`enterprise-saas/rbac-enterprise.md`): Multi-tenant RBAC
- **Healthcare** (`healthcare/healthcare-security.md`): HIPAA role requirements
- **Fintech** (`fintech/account-management.md`): Financial access controls
- **Content Management** (`content-management/content-security.md`): Content-level permissions

## Purpose
Implement comprehensive role-based access control with fine-grained permissions, audit logging, and production-ready security features for secure user authorization across all application features.

## Instructions
Use this module to implement a complete RBAC system that provides secure, scalable user authorization. The implementation should follow security best practices and provide comprehensive audit capabilities.

1. **Design RBAC Architecture**: Define roles, permissions, and resource hierarchies
2. **Implement Core RBAC Logic**: Build role assignment and permission checking systems
3. **Add Security Features**: Implement audit logging, session management, and protection mechanisms
4. **Create Admin Interface**: Build role and permission management interfaces
5. **Test Security**: Perform comprehensive security testing and validation

## Examples

### Basic RBAC Implementation Example
```typescript
// Role and Permission Definitions
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  inheritsFrom?: string[]; // Role inheritance
}

interface Permission {
  id: string;
  resource: string;
  action: string;
  conditions?: PermissionCondition[];
}

// Example Role Definitions
const roles: Role[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: 'Full system access',
    permissions: [
      { id: 'users:*', resource: 'users', action: '*' },
      { id: 'system:*', resource: 'system', action: '*' }
    ]
  },
  {
    id: 'manager',
    name: 'Manager',
    description: 'Team management access',
    permissions: [
      { id: 'users:read', resource: 'users', action: 'read' },
      { id: 'projects:manage', resource: 'projects', action: 'manage' }
    ]
  },
  {
    id: 'user',
    name: 'Regular User',
    description: 'Basic user access',
    permissions: [
      { id: 'profile:manage', resource: 'profile', action: 'manage' },
      { id: 'projects:read', resource: 'projects', action: 'read' }
    ]
  }
];

// Permission Checking Service
class RBACService {
  async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    for (const role of userRoles) {
      if (await this.roleHasPermission(role, resource, action)) {
        await this.logAccess(userId, resource, action, 'granted');
        return true;
      }
    }
    
    await this.logAccess(userId, resource, action, 'denied');
    return false;
  }
  
  private async roleHasPermission(role: Role, resource: string, action: string): Promise<boolean> {
    return role.permissions.some(permission => 
      this.matchesPermission(permission, resource, action)
    );
  }
  
  private matchesPermission(permission: Permission, resource: string, action: string): boolean {
    const resourceMatch = permission.resource === '*' || permission.resource === resource;
    const actionMatch = permission.action === '*' || permission.action === action;
    return resourceMatch && actionMatch;
  }
}
```

### Advanced RBAC with Conditions Example
```typescript
// Conditional Permissions
interface PermissionCondition {
  type: 'ownership' | 'department' | 'time' | 'location';
  value: any;
}

// Example: User can only edit their own profile or profiles in their department
const conditionalPermission: Permission = {
  id: 'profiles:edit:conditional',
  resource: 'profiles',
  action: 'edit',
  conditions: [
    { type: 'ownership', value: true },
    { type: 'department', value: 'same' }
  ]
};

// Enhanced Permission Checking
class AdvancedRBACService extends RBACService {
  async hasPermission(
    userId: string, 
    resource: string, 
    action: string, 
    context?: any
  ): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    
    for (const role of userRoles) {
      for (const permission of role.permissions) {
        if (this.matchesPermission(permission, resource, action)) {
          if (await this.evaluateConditions(permission.conditions, userId, context)) {
            await this.logAccess(userId, resource, action, 'granted', context);
            return true;
          }
        }
      }
    }
    
    await this.logAccess(userId, resource, action, 'denied', context);
    return false;
  }
  
  private async evaluateConditions(
    conditions: PermissionCondition[] = [], 
    userId: string, 
    context: any
  ): Promise<boolean> {
    for (const condition of conditions) {
      if (!await this.evaluateCondition(condition, userId, context)) {
        return false;
      }
    }
    return true;
  }
}
```

## Core Implementation Requirements

### RBAC Architecture
- **Hierarchical Roles**: Support role inheritance and nested permissions
- **Resource-Based Permissions**: Fine-grained permissions on specific resources
- **Dynamic Role Assignment**: Runtime role assignment and modification
- **Permission Caching**: Efficient permission checking with caching strategies

### Security Features
- **Principle of Least Privilege**: Default to minimal permissions, explicit grants required
- **Permission Validation**: Server-side validation for all permission checks
- **Audit Trail**: Complete audit log of all permission changes and access attempts
- **Session-Based Permissions**: Permissions tied to authenticated sessions
- **Admin Override Protection**: Special protection for admin role modifications

### Accessibility Implementation
- **Role Management UI**: Accessible role assignment interfaces
- **Permission Indicators**: Clear visual and screen reader indicators for user permissions
- **Error Messaging**: Accessible error messages for permission denials
- **Keyboard Navigation**: Full keyboard support for admin interfaces

### Internationalization Support
- **Localized Role Names**: Translate role names and descriptions
- **Permission Descriptions**: Localize permission descriptions and help text
- **Cultural Adaptation**: Adapt role concepts for different cultural contexts
- **RTL Support**: Full RTL support for role management interfaces

### Offline & Network Resilience
- **Permission Caching**: Cache user permissions for offline access
- **Graceful Degradation**: Provide read-only access when permission service unavailable
- **Sync on Reconnect**: Synchronize permission changes when connection restored
- **Conflict Resolution**: Handle permission conflicts during offline/online sync

### Platform-Specific Implementations

#### Backend Implementation
```typescript
// RBAC service with caching and audit logging
class RBACService {
  private permissionCache = new Map<string, Set<string>>();
  
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    // Check cache first
    const cacheKey = `${userId}:${resource}:${action}`;
    if (this.permissionCache.has(cacheKey)) {
      return this.permissionCache.get(cacheKey)?.has(action) || false;
    }
    
    // Fetch from database with role hierarchy
    const userRoles = await this.getUserRoles(userId);
    const permissions = await this.getPermissionsForRoles(userRoles, resource);
    
    // Cache results
    this.permissionCache.set(cacheKey, permissions);
    
    // Audit log
    await this.auditLog({
      userId,
      resource,
      action,
      granted: permissions.has(action),
      timestamp: new Date()
    });
    
    return permissions.has(action);
  }
  
  async assignRole(userId: string, roleId: string, assignedBy: string): Promise<void> {
    // Validate assigner has permission to assign this role
    const canAssign = await this.checkPermission(assignedBy, 'roles', 'assign');
    if (!canAssign) {
      throw new UnauthorizedError('Insufficient permissions to assign role');
    }
    
    // Assign role
    await this.database.assignUserRole(userId, roleId);
    
    // Clear cache
    this.clearUserCache(userId);
    
    // Audit log
    await this.auditLog({
      action: 'role_assigned',
      userId,
      roleId,
      assignedBy,
      timestamp: new Date()
    });
  }
}
```

#### Frontend Implementation
```typescript
// React/Vue component with accessibility
const PermissionGuard: React.FC<{
  resource: string;
  action: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ resource, action, children, fallback }) => {
  const { hasPermission, loading } = usePermission(resource, action);
  
  if (loading) {
    return <div aria-live="polite">Loading permissions...</div>;
  }
  
  if (!hasPermission) {
    return fallback || (
      <div 
        role="alert" 
        aria-live="assertive"
        className="permission-denied"
      >
        {t('errors.insufficient_permissions')}
      </div>
    );
  }
  
  return <>{children}</>;
};

// Hook for permission checking
const usePermission = (resource: string, action: string) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkPermission = async () => {
      try {
        const result = await rbacService.checkPermission(resource, action);
        setHasPermission(result);
      } catch (error) {
        console.error('Permission check failed:', error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkPermission();
  }, [resource, action]);
  
  return { hasPermission, loading };
};
```

#### Mobile Implementation
```typescript
// React Native / Flutter permission service
class MobileRBACService {
  private offlinePermissions: Map<string, Set<string>> = new Map();
  
  async checkPermissionOffline(resource: string, action: string): Promise<boolean> {
    const userId = await this.getCurrentUserId();
    const userPermissions = this.offlinePermissions.get(userId);
    
    if (!userPermissions) {
      // Fallback to cached permissions or read-only mode
      return this.getDefaultPermission(resource, action);
    }
    
    return userPermissions.has(`${resource}:${action}`);
  }
  
  async syncPermissions(): Promise<void> {
    try {
      const userId = await this.getCurrentUserId();
      const permissions = await this.api.getUserPermissions(userId);
      this.offlinePermissions.set(userId, new Set(permissions));
      
      // Store in secure local storage
      await SecureStore.setItemAsync(
        `permissions_${userId}`, 
        JSON.stringify(Array.from(permissions))
      );
    } catch (error) {
      console.warn('Permission sync failed, using cached permissions');
    }
  }
}
```

## Testing Requirements

### Unit Tests
- Test role hierarchy resolution
- Test permission inheritance logic
- Test permission caching mechanisms
- Test audit logging functionality

### Property-Based Tests
- **Permission Consistency Property**: For any user and resource, permission checks should be consistent across multiple calls
- **Role Hierarchy Property**: For any role hierarchy, child roles should inherit parent permissions
- **Audit Completeness Property**: For any permission check or role change, it should be logged in the audit trail

### Security Tests
- Test privilege escalation prevention
- Test unauthorized role assignment prevention
- Test permission bypass attempts
- Test audit log tampering prevention

### Accessibility Tests
- Test role management interface with screen readers
- Test keyboard navigation for permission assignment
- Test high contrast mode for permission indicators

### Integration Tests
- Test complete RBAC flow from role assignment to permission checking
- Test offline permission caching and sync
- Test cross-platform permission consistency

## Monitoring & Observability

### Metrics to Track
- Permission check frequency and performance
- Role assignment/revocation frequency
- Failed permission attempts (potential security issues)
- Cache hit/miss ratios for performance optimization

### Security Monitoring
- Monitor for privilege escalation attempts
- Track unusual permission patterns
- Alert on admin role modifications
- Monitor audit log integrity

## Configuration Variables
- `{{role_hierarchy}}` - Role inheritance structure
- `{{default_permissions}}` - Default permissions for new users
- `{{admin_roles}}` - Roles with administrative privileges
- `{{cache_ttl}}` - Permission cache time-to-live
- `{{audit_retention}}` - Audit log retention period

## Dependencies
- Database with ACID compliance for role/permission storage
- Caching system (Redis, Memcached) for permission caching
- Audit logging system with tamper protection
- Authentication system integration
- Internationalization framework

## Documentation Requirements
- RBAC architecture documentation
- Permission matrix documentation
- Role hierarchy documentation
- Security audit procedures
- API documentation for permission endpoints

## Advanced Enterprise RBAC Patterns

### Attribute-Based Access Control (ABAC) Integration

```typescript
// Combining RBAC with ABAC for fine-grained control
interface HybridAccessControlConfig {
  rbacEnabled: boolean;
  abacEnabled: boolean;
  policyEngine: 'opa' | 'cedar' | 'custom';
  evaluationOrder: 'rbac_first' | 'abac_first' | 'parallel';
}

class HybridAccessControlService {
  private rbacService: RBACService;
  private abacEngine: ABACEngine;

  async checkAccess(
    subject: Subject,
    action: string,
    resource: Resource,
    context: AccessContext
  ): Promise<AccessDecision> {
    // Check RBAC first for performance
    const rbacDecision = await this.rbacService.checkPermission(
      subject.id,
      resource.type,
      action
    );

    // If RBAC denies, check ABAC for potential override
    if (!rbacDecision.allowed) {
      const abacDecision = await this.abacEngine.evaluate({
        subject,
        action,
        resource,
        context
      });

      // ABAC can grant access based on attributes
      if (abacDecision.allowed) {
        return {
          allowed: true,
          reason: 'abac_policy_permit',
          evaluatedPolicies: abacDecision.evaluatedPolicies
        };
      }
    }

    // If RBAC allows, check ABAC for potential restrictions
    if (rbacDecision.allowed) {
      const abacDecision = await this.abacEngine.evaluate({
        subject,
        action,
        resource,
        context
      });

      // ABAC can deny based on contextual attributes
      if (!abacDecision.allowed && abacDecision.reason === 'explicit_deny') {
        return {
          allowed: false,
          reason: 'abac_policy_deny',
          evaluatedPolicies: abacDecision.evaluatedPolicies
        };
      }
    }

    return rbacDecision;
  }
}
```

### Dynamic Role Assignment

```typescript
// Context-aware dynamic role assignment
interface DynamicRoleConfig {
  contextualRoles: ContextualRole[];
  temporaryRoles: TemporaryRoleConfig;
  delegatedRoles: DelegationConfig;
}

class DynamicRoleService {
  async getEffectiveRoles(
    userId: string,
    context: RoleContext
  ): Promise<EffectiveRole[]> {
    const roles: EffectiveRole[] = [];

    // Get static assigned roles
    const staticRoles = await this.roleStore.getUserRoles(userId);
    roles.push(...staticRoles.map(r => ({ ...r, source: 'static' })));

    // Get contextual roles based on current context
    const contextualRoles = await this.evaluateContextualRoles(userId, context);
    roles.push(...contextualRoles.map(r => ({ ...r, source: 'contextual' })));

    // Get temporary roles (time-limited)
    const tempRoles = await this.getActiveTemporaryRoles(userId);
    roles.push(...tempRoles.map(r => ({ ...r, source: 'temporary' })));

    // Get delegated roles
    const delegatedRoles = await this.getActiveDelegations(userId);
    roles.push(...delegatedRoles.map(r => ({ ...r, source: 'delegated' })));

    return this.deduplicateAndPrioritize(roles);
  }

  private async evaluateContextualRoles(
    userId: string,
    context: RoleContext
  ): Promise<Role[]> {
    const contextualRoles: Role[] = [];

    // Location-based roles
    if (context.location && this.config.locationBasedRoles) {
      const locationRole = await this.getLocationRole(userId, context.location);
      if (locationRole) contextualRoles.push(locationRole);
    }

    // Time-based roles
    if (this.config.timeBasedRoles) {
      const timeRole = await this.getTimeBasedRole(userId, context.timestamp);
      if (timeRole) contextualRoles.push(timeRole);
    }

    // Project/team-based roles
    if (context.projectId) {
      const projectRole = await this.getProjectRole(userId, context.projectId);
      if (projectRole) contextualRoles.push(projectRole);
    }

    return contextualRoles;
  }
}
```

### Multi-Tenant RBAC

```typescript
// Enterprise multi-tenant RBAC implementation
interface MultiTenantRBACConfig {
  tenantIsolation: 'strict' | 'shared_roles' | 'hierarchical';
  crossTenantAccess: boolean;
  tenantAdminRoles: string[];
}

class MultiTenantRBACService {
  async checkTenantPermission(
    userId: string,
    tenantId: string,
    resource: string,
    action: string
  ): Promise<TenantAccessDecision> {
    // Verify user belongs to tenant
    const userTenants = await this.getUserTenants(userId);
    if (!userTenants.includes(tenantId)) {
      return {
        allowed: false,
        reason: 'user_not_in_tenant'
      };
    }

    // Get tenant-specific roles
    const tenantRoles = await this.getTenantRoles(userId, tenantId);

    // Check permission within tenant context
    const hasPermission = await this.checkPermissionWithRoles(
      tenantRoles,
      resource,
      action
    );

    // Log tenant access attempt
    await this.auditService.logTenantAccess({
      userId,
      tenantId,
      resource,
      action,
      allowed: hasPermission,
      timestamp: new Date()
    });

    return {
      allowed: hasPermission,
      tenantId,
      effectiveRoles: tenantRoles
    };
  }

  async assignTenantRole(
    userId: string,
    tenantId: string,
    roleId: string,
    assignedBy: string
  ): Promise<void> {
    // Verify assigner has tenant admin permission
    const canAssign = await this.checkTenantPermission(
      assignedBy,
      tenantId,
      'roles',
      'assign'
    );

    if (!canAssign.allowed) {
      throw new UnauthorizedError('Cannot assign roles in this tenant');
    }

    // Assign role within tenant scope
    await this.roleStore.assignTenantRole(userId, tenantId, roleId);

    // Audit the assignment
    await this.auditService.logRoleAssignment({
      userId,
      tenantId,
      roleId,
      assignedBy,
      timestamp: new Date()
    });
  }
}
```

### Permission Inheritance and Hierarchy

```typescript
// Hierarchical permission system with inheritance
interface PermissionHierarchy {
  resourceHierarchy: ResourceNode[];
  roleHierarchy: RoleNode[];
  inheritanceRules: InheritanceRule[];
}

class HierarchicalPermissionService {
  async resolveEffectivePermissions(
    userId: string,
    resourcePath: string[]
  ): Promise<ResolvedPermission[]> {
    const permissions: ResolvedPermission[] = [];

    // Get user's roles with hierarchy
    const roles = await this.getRolesWithHierarchy(userId);

    // For each level in resource path, collect permissions
    for (let i = 0; i < resourcePath.length; i++) {
      const currentPath = resourcePath.slice(0, i + 1);
      const resourceId = currentPath.join('/');

      for (const role of roles) {
        const rolePermissions = await this.getRolePermissions(role.id, resourceId);
        
        permissions.push(...rolePermissions.map(p => ({
          ...p,
          inheritedFrom: i < resourcePath.length - 1 ? resourceId : null,
          role: role.id,
          priority: role.priority
        })));
      }
    }

    // Resolve conflicts (explicit > inherited, deny > allow)
    return this.resolvePermissionConflicts(permissions);
  }

  private resolvePermissionConflicts(
    permissions: ResolvedPermission[]
  ): ResolvedPermission[] {
    const permissionMap = new Map<string, ResolvedPermission>();

    // Sort by priority: explicit > inherited, higher role priority wins
    const sorted = permissions.sort((a, b) => {
      // Explicit permissions take precedence
      if (a.inheritedFrom === null && b.inheritedFrom !== null) return -1;
      if (a.inheritedFrom !== null && b.inheritedFrom === null) return 1;
      
      // Higher priority role wins
      return b.priority - a.priority;
    });

    for (const permission of sorted) {
      const key = `${permission.resource}:${permission.action}`;
      
      if (!permissionMap.has(key)) {
        permissionMap.set(key, permission);
      } else {
        const existing = permissionMap.get(key)!;
        // Deny always wins at same level
        if (permission.effect === 'deny' && existing.effect === 'allow') {
          permissionMap.set(key, permission);
        }
      }
    }

    return Array.from(permissionMap.values());
  }
}
```

## Cross-Domain RBAC Patterns

### Healthcare RBAC (HIPAA Compliant)

```typescript
// Healthcare-specific RBAC with break-glass access
class HealthcareRBACService extends RBACService {
  async checkPHIAccess(
    userId: string,
    patientId: string,
    action: string
  ): Promise<PHIAccessDecision> {
    // Check standard RBAC permission
    const rbacResult = await super.checkPermission(userId, 'phi', action);

    // Check patient-provider relationship
    const hasRelationship = await this.checkPatientRelationship(userId, patientId);

    // Log all PHI access attempts for HIPAA
    await this.auditService.logPHIAccess({
      userId,
      patientId,
      action,
      allowed: rbacResult && hasRelationship,
      timestamp: new Date()
    });

    return {
      allowed: rbacResult && hasRelationship,
      requiresBreakGlass: !hasRelationship && rbacResult
    };
  }

  async breakGlassAccess(
    userId: string,
    patientId: string,
    reason: string
  ): Promise<BreakGlassResult> {
    // Verify user has break-glass capability
    const canBreakGlass = await this.checkPermission(userId, 'phi', 'break_glass');
    
    if (!canBreakGlass) {
      throw new UnauthorizedError('User cannot perform break-glass access');
    }

    // Create time-limited access
    const accessGrant = await this.createTemporaryAccess(userId, patientId, {
      duration: 3600, // 1 hour
      reason,
      requiresReview: true
    });

    // Alert supervisors
    await this.alertService.notifyBreakGlass(userId, patientId, reason);

    return accessGrant;
  }
}
```

### Fintech RBAC (Segregation of Duties)

```typescript
// Financial services RBAC with segregation of duties
class FintechRBACService extends RBACService {
  private sodRules: SegregationOfDutiesRule[];

  async checkPermissionWithSOD(
    userId: string,
    resource: string,
    action: string
  ): Promise<SODAccessDecision> {
    // Check standard permission
    const hasPermission = await super.checkPermission(userId, resource, action);

    if (!hasPermission) {
      return { allowed: false, reason: 'no_permission' };
    }

    // Check segregation of duties
    const sodViolation = await this.checkSODViolation(userId, resource, action);

    if (sodViolation) {
      return {
        allowed: false,
        reason: 'sod_violation',
        conflictingRole: sodViolation.conflictingRole,
        conflictingAction: sodViolation.conflictingAction
      };
    }

    return { allowed: true };
  }

  private async checkSODViolation(
    userId: string,
    resource: string,
    action: string
  ): Promise<SODViolation | null> {
    const userRoles = await this.getUserRoles(userId);

    for (const rule of this.sodRules) {
      if (rule.resource === resource && rule.action === action) {
        // Check if user has conflicting role
        const hasConflict = userRoles.some(role => 
          rule.conflictingRoles.includes(role.id)
        );

        if (hasConflict) {
          return {
            rule: rule.id,
            conflictingRole: userRoles.find(r => rule.conflictingRoles.includes(r.id))!.id,
            conflictingAction: rule.conflictingAction
          };
        }
      }
    }

    return null;
  }
}
```

## Template Composition Rules

### Compatible Templates
- `security/advanced-authorization.md` - Always compatible, extends RBAC with ABAC
- `security/multi-factor-auth.md` - Compatible for step-up authentication
- `enterprise-saas/multi-tenancy.md` - Requires tenant-aware RBAC
- `healthcare/hipaa-compliance.md` - Requires audit logging and break-glass
- `fintech/fraud-detection.md` - Requires segregation of duties

### Conflict Resolution
- When composing with `security/advanced-authorization.md`, ABAC policies can override RBAC decisions
- When composing with `enterprise-saas/multi-tenancy.md`, tenant isolation takes precedence
- When composing with `healthcare/hipaa-compliance.md`, minimum necessary access principle applies