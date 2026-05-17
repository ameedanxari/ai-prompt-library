/**
 * Access Controller
 *
 * Implements role-based access control (RBAC) with fine-grained
 * permissions and audit trail integration.
 *
 * Validates: Requirements 10.2, 10.5, 14.1
 */

/**
 * A user or service principal
 */
export interface Principal {
  id: string;
  name: string;
  roles: string[];
}

/**
 * A permission grant
 */
export interface Permission {
  resource: string;
  actions: ('read' | 'write' | 'execute' | 'admin')[];
}

/**
 * Access check result
 */
export interface AccessDecision {
  allowed: boolean;
  principal: string;
  resource: string;
  action: string;
  reason: string;
}

export class AccessController {
  private rolePermissions: Map<string, Permission[]> = new Map();
  private auditLog: AccessDecision[] = [];

  constructor() {
    this.seedDefaultRoles();
  }

  /**
   * Checks if a principal can perform an action on a resource
   */
  public check(principal: Principal, resource: string, action: Permission['actions'][number]): AccessDecision {
    for (const role of principal.roles) {
      const permissions = this.rolePermissions.get(role) || [];
      for (const perm of permissions) {
        if (this.matchResource(perm.resource, resource) && perm.actions.includes(action)) {
          const decision: AccessDecision = {
            allowed: true,
            principal: principal.id,
            resource,
            action,
            reason: `Granted via role '${role}'`
          };
          this.auditLog.push(decision);
          return decision;
        }
      }
    }

    const decision: AccessDecision = {
      allowed: false,
      principal: principal.id,
      resource,
      action,
      reason: `No matching permission found for roles: ${principal.roles.join(', ')}`
    };
    this.auditLog.push(decision);
    return decision;
  }

  /**
   * Grants permissions to a role
   */
  public grantRole(role: string, permissions: Permission[]): void {
    const existing = this.rolePermissions.get(role) || [];
    this.rolePermissions.set(role, [...existing, ...permissions]);
  }

  /**
   * Returns the audit log
   */
  public getAuditLog(): AccessDecision[] {
    return [...this.auditLog];
  }

  private matchResource(pattern: string, resource: string): boolean {
    if (pattern === '*') return true;
    if (pattern.endsWith('/*')) {
      return resource.startsWith(pattern.slice(0, -2));
    }
    return pattern === resource;
  }

  private seedDefaultRoles(): void {
    this.grantRole('admin', [{ resource: '*', actions: ['read', 'write', 'execute', 'admin'] }]);
    this.grantRole('developer', [{ resource: 'src/*', actions: ['read', 'write', 'execute'] }]);
    this.grantRole('viewer', [{ resource: '*', actions: ['read'] }]);
  }
}
