# Advanced Authorization Template

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

This template provides comprehensive patterns for implementing attribute-based access control (ABAC), policy-based access control, dynamic authorization, and fine-grained permission systems. It covers authorization engines, policy languages, context-aware access decisions, and real-time permission evaluation for enterprise applications.

## Context

Modern applications require authorization beyond simple role-based access control. This template addresses complex authorization scenarios including multi-tenant environments, resource-level permissions, time-based access, location-aware policies, and dynamic authorization based on contextual attributes.

## Core Components

### Authorization Engine Interface

## Examples

```typescript
interface AuthorizationEngine {
  evaluate(request: AuthorizationRequest): Promise<AuthorizationDecision>;
  evaluateBatch(requests: AuthorizationRequest[]): Promise<AuthorizationDecision[]>;
  getEffectivePermissions(subject: Subject, resource?: Resource): Promise<Permission[]>;
  checkPermission(subject: Subject, action: string, resource: Resource): Promise<boolean>;
}

interface AuthorizationRequest {
  subject: Subject;
  action: string;
  resource: Resource;
  context: AuthorizationContext;
  timestamp?: Date;
}

interface Subject {
  id: string;
  type: SubjectType;
  attributes: Record<string, any>;
  roles: string[];
  groups: string[];
  tenantId?: string;
}

interface Resource {
  id: string;
  type: string;
  attributes: Record<string, any>;
  owner?: string;
  tenantId?: string;
}

interface AuthorizationContext {
  ipAddress?: string;
  location?: GeoLocation;
  deviceInfo?: DeviceInfo;
  timestamp: Date;
  requestId: string;
  customAttributes?: Record<string, any>;
}

interface AuthorizationDecision {
  allowed: boolean;
  reason?: string;
  obligations?: Obligation[];
  advice?: Advice[];
  evaluatedPolicies: string[];
  processingTime: number;
}
```

### Attribute-Based Access Control (ABAC)

```typescript
interface ABACPolicy {
  id: string;
  name: string;
  description: string;
  effect: PolicyEffect;
  target: PolicyTarget;
  conditions: PolicyCondition[];
  obligations?: Obligation[];
  priority: number;
  enabled: boolean;
}

enum PolicyEffect {
  PERMIT = 'permit',
  DENY = 'deny'
}

interface PolicyTarget {
  subjects?: SubjectMatcher[];
  actions?: string[];
  resources?: ResourceMatcher[];
}

interface PolicyCondition {
  attribute: string;
  operator: ConditionOperator;
  value: any;
  attributeSource: 'subject' | 'resource' | 'context' | 'environment';
}

enum ConditionOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  CONTAINS = 'contains',
  IN = 'in',
  NOT_IN = 'not_in',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  BETWEEN = 'between',
  MATCHES = 'matches',
  EXISTS = 'exists'
}

class ABACEngine implements AuthorizationEngine {
  private policyStore: PolicyStore;
  private attributeResolver: AttributeResolver;

  async evaluate(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    const startTime = Date.now();
    
    // Resolve all attributes
    const resolvedSubject = await this.attributeResolver.resolveSubjectAttributes(request.subject);
    const resolvedResource = await this.attributeResolver.resolveResourceAttributes(request.resource);
    const environmentAttributes = await this.attributeResolver.getEnvironmentAttributes();

    // Find applicable policies
    const applicablePolicies = await this.policyStore.findApplicablePolicies({
      subject: resolvedSubject,
      action: request.action,
      resource: resolvedResource
    });

    // Evaluate policies in priority order
    let decision: AuthorizationDecision = {
      allowed: false,
      evaluatedPolicies: [],
      processingTime: 0
    };

    const evaluationContext = {
      subject: resolvedSubject,
      resource: resolvedResource,
      context: request.context,
      environment: environmentAttributes
    };

    for (const policy of applicablePolicies.sort((a, b) => b.priority - a.priority)) {
      const policyResult = await this.evaluatePolicy(policy, evaluationContext);
      decision.evaluatedPolicies.push(policy.id);

      if (policyResult.matches) {
        decision.allowed = policy.effect === PolicyEffect.PERMIT;
        decision.reason = `Policy ${policy.name} ${policy.effect}`;
        decision.obligations = policy.obligations;
        break;
      }
    }

    decision.processingTime = Date.now() - startTime;
    await this.auditDecision(request, decision);
    
    return decision;
  }

  private async evaluatePolicy(
    policy: ABACPolicy,
    context: EvaluationContext
  ): Promise<PolicyEvaluationResult> {
    // Check target match
    if (!this.matchesTarget(policy.target, context)) {
      return { matches: false };
    }

    // Evaluate all conditions
    for (const condition of policy.conditions) {
      const attributeValue = this.getAttributeValue(condition.attributeSource, condition.attribute, context);
      
      if (!this.evaluateCondition(condition, attributeValue)) {
        return { matches: false };
      }
    }

    return { matches: true };
  }
}
```

### Policy Language and DSL

```typescript
interface PolicyDSL {
  parse(policyText: string): ABACPolicy;
  validate(policy: ABACPolicy): ValidationResult;
  compile(policy: ABACPolicy): CompiledPolicy;
  serialize(policy: ABACPolicy): string;
}

class PolicyParser implements PolicyDSL {
  parse(policyText: string): ABACPolicy {
    // Example policy DSL:
    // PERMIT action:read ON resource:document
    // WHERE subject.department == resource.department
    // AND subject.clearanceLevel >= resource.classificationLevel
    // AND context.time BETWEEN "09:00" AND "18:00"
    
    const tokens = this.tokenize(policyText);
    return this.buildPolicy(tokens);
  }

  private tokenize(text: string): Token[] {
    const patterns = [
      { type: 'EFFECT', pattern: /^(PERMIT|DENY)/ },
      { type: 'ACTION', pattern: /^action:(\w+)/ },
      { type: 'RESOURCE', pattern: /^resource:(\w+)/ },
      { type: 'KEYWORD', pattern: /^(ON|WHERE|AND|OR)/ },
      { type: 'ATTRIBUTE', pattern: /^(subject|resource|context|environment)\.(\w+)/ },
      { type: 'OPERATOR', pattern: /^(==|!=|>=|<=|>|<|IN|BETWEEN|MATCHES)/ },
      { type: 'VALUE', pattern: /^"([^"]*)"|\d+/ }
    ];

    const tokens: Token[] = [];
    let remaining = text.trim();

    while (remaining.length > 0) {
      let matched = false;
      for (const { type, pattern } of patterns) {
        const match = remaining.match(pattern);
        if (match) {
          tokens.push({ type, value: match[0], groups: match.slice(1) });
          remaining = remaining.slice(match[0].length).trim();
          matched = true;
          break;
        }
      }
      if (!matched) {
        throw new PolicyParseError(`Unexpected token at: ${remaining.substring(0, 20)}`);
      }
    }

    return tokens;
  }
}

// Example policy definitions
const examplePolicies = `
// Document access policy
PERMIT action:read ON resource:document
WHERE subject.department == resource.department
AND subject.clearanceLevel >= resource.classificationLevel

// Time-restricted admin access
PERMIT action:* ON resource:*
WHERE subject.role IN ["admin", "superadmin"]
AND context.time BETWEEN "09:00" AND "18:00"
AND context.location.country == "US"

// Owner can always access their resources
PERMIT action:* ON resource:*
WHERE subject.id == resource.ownerId

// Deny access to archived resources
DENY action:* ON resource:*
WHERE resource.status == "archived"
AND subject.role != "admin"
`;
```

### Dynamic Authorization Service

```typescript
class DynamicAuthorizationService {
  private abacEngine: ABACEngine;
  private policyCache: PolicyCache;
  private realTimeEvaluator: RealTimeEvaluator;

  async authorize(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    // Check for real-time policy updates
    await this.policyCache.refreshIfNeeded();

    // Enrich context with real-time data
    const enrichedContext = await this.enrichContext(request.context);

    // Evaluate with dynamic attributes
    const decision = await this.abacEngine.evaluate({
      ...request,
      context: enrichedContext
    });

    // Apply real-time constraints
    if (decision.allowed) {
      const realTimeCheck = await this.realTimeEvaluator.evaluate(request, decision);
      if (!realTimeCheck.allowed) {
        return {
          ...decision,
          allowed: false,
          reason: realTimeCheck.reason
        };
      }
    }

    return decision;
  }

  private async enrichContext(context: AuthorizationContext): Promise<AuthorizationContext> {
    return {
      ...context,
      riskScore: await this.riskEngine.calculateRisk(context),
      activeAlerts: await this.alertService.getActiveAlerts(context.requestId),
      sessionInfo: await this.sessionService.getSessionInfo(context.requestId),
      rateLimitStatus: await this.rateLimiter.getStatus(context.ipAddress)
    };
  }
}

class RealTimeEvaluator {
  async evaluate(
    request: AuthorizationRequest,
    decision: AuthorizationDecision
  ): Promise<RealTimeCheckResult> {
    const checks = [
      this.checkRateLimit(request),
      this.checkConcurrentSessions(request),
      this.checkAnomalyDetection(request),
      this.checkTemporaryRestrictions(request)
    ];

    const results = await Promise.all(checks);
    const failedCheck = results.find(r => !r.passed);

    if (failedCheck) {
      return {
        allowed: false,
        reason: failedCheck.reason
      };
    }

    return { allowed: true };
  }

  private async checkAnomalyDetection(request: AuthorizationRequest): Promise<CheckResult> {
    const anomalyScore = await this.anomalyDetector.score({
      userId: request.subject.id,
      action: request.action,
      resource: request.resource.type,
      context: request.context
    });

    if (anomalyScore > 0.8) {
      await this.alertService.createAlert({
        type: 'suspicious_access',
        severity: 'high',
        userId: request.subject.id,
        details: { anomalyScore, request }
      });

      return {
        passed: false,
        reason: 'Access blocked due to suspicious activity pattern'
      };
    }

    return { passed: true };
  }
}
```

## Implementation Patterns

### Hierarchical Permission System

```typescript
class HierarchicalPermissionSystem {
  private permissionGraph: PermissionGraph;

  async getEffectivePermissions(
    subject: Subject,
    resource?: Resource
  ): Promise<EffectivePermission[]> {
    const permissions: EffectivePermission[] = [];

    // Get direct permissions
    const directPermissions = await this.getDirectPermissions(subject.id);
    permissions.push(...directPermissions.map(p => ({ ...p, source: 'direct' })));

    // Get role-based permissions
    for (const role of subject.roles) {
      const rolePermissions = await this.getRolePermissions(role);
      permissions.push(...rolePermissions.map(p => ({ ...p, source: `role:${role}` })));
    }

    // Get group-based permissions
    for (const group of subject.groups) {
      const groupPermissions = await this.getGroupPermissions(group);
      permissions.push(...groupPermissions.map(p => ({ ...p, source: `group:${group}` })));

      // Include inherited permissions from parent groups
      const parentGroups = await this.getParentGroups(group);
      for (const parent of parentGroups) {
        const inheritedPermissions = await this.getGroupPermissions(parent);
        permissions.push(...inheritedPermissions.map(p => ({ 
          ...p, 
          source: `group:${parent}:inherited` 
        })));
      }
    }

    // Filter by resource if specified
    if (resource) {
      return permissions.filter(p => this.matchesResource(p, resource));
    }

    // Resolve conflicts (deny takes precedence)
    return this.resolveConflicts(permissions);
  }

  private resolveConflicts(permissions: EffectivePermission[]): EffectivePermission[] {
    const permissionMap = new Map<string, EffectivePermission>();

    for (const permission of permissions) {
      const key = `${permission.action}:${permission.resourceType}`;
      const existing = permissionMap.get(key);

      if (!existing) {
        permissionMap.set(key, permission);
      } else if (permission.effect === 'deny') {
        // Deny always wins
        permissionMap.set(key, permission);
      } else if (existing.effect !== 'deny' && permission.priority > existing.priority) {
        permissionMap.set(key, permission);
      }
    }

    return Array.from(permissionMap.values());
  }
}
```

### Resource-Level Access Control

```typescript
class ResourceAccessControl {
  async checkResourceAccess(
    subject: Subject,
    action: string,
    resource: Resource
  ): Promise<AccessCheckResult> {
    // Check ownership
    if (resource.owner === subject.id) {
      const ownerPermissions = await this.getOwnerPermissions(resource.type);
      if (ownerPermissions.includes(action)) {
        return { allowed: true, reason: 'owner' };
      }
    }

    // Check explicit resource permissions
    const resourcePermissions = await this.getResourcePermissions(resource.id, subject.id);
    if (resourcePermissions.some(p => p.action === action && p.effect === 'permit')) {
      return { allowed: true, reason: 'explicit_permission' };
    }

    // Check sharing permissions
    const sharingAccess = await this.checkSharingAccess(subject, resource, action);
    if (sharingAccess.allowed) {
      return sharingAccess;
    }

    // Check inherited permissions from parent resources
    if (resource.parentId) {
      const parentResource = await this.resourceStore.get(resource.parentId);
      const parentAccess = await this.checkResourceAccess(subject, action, parentResource);
      if (parentAccess.allowed && this.isInheritable(action)) {
        return { allowed: true, reason: 'inherited_from_parent' };
      }
    }

    return { allowed: false, reason: 'no_permission' };
  }

  async shareResource(
    resource: Resource,
    sharedWith: ShareTarget,
    permissions: SharePermission[]
  ): Promise<ShareResult> {
    const share: ResourceShare = {
      id: crypto.randomUUID(),
      resourceId: resource.id,
      targetType: sharedWith.type,
      targetId: sharedWith.id,
      permissions,
      createdBy: resource.owner,
      createdAt: new Date(),
      expiresAt: sharedWith.expiresAt
    };

    await this.shareStore.save(share);
    await this.auditService.logShare(share);

    // Notify share recipient
    await this.notificationService.notifyShare(sharedWith, resource, permissions);

    return { shareId: share.id, success: true };
  }
}
```

### Delegation and Impersonation

```typescript
class DelegationService {
  async createDelegation(
    delegator: Subject,
    delegate: Subject,
    scope: DelegationScope
  ): Promise<Delegation> {
    // Validate delegator has permissions to delegate
    const canDelegate = await this.canDelegate(delegator, scope);
    if (!canDelegate) {
      throw new DelegationNotAllowedError('Delegator lacks delegation rights');
    }

    // Ensure delegate doesn't exceed delegator's permissions
    const validatedScope = await this.validateDelegationScope(delegator, scope);

    const delegation: Delegation = {
      id: crypto.randomUUID(),
      delegatorId: delegator.id,
      delegateId: delegate.id,
      scope: validatedScope,
      createdAt: new Date(),
      expiresAt: scope.expiresAt,
      constraints: scope.constraints,
      revocable: true
    };

    await this.delegationStore.save(delegation);
    await this.auditService.logDelegation(delegation);

    return delegation;
  }

  async actAs(
    actor: Subject,
    targetUserId: string,
    action: string
  ): Promise<ImpersonationSession> {
    // Check impersonation permission
    const canImpersonate = await this.checkImpersonationPermission(actor, targetUserId);
    if (!canImpersonate) {
      throw new ImpersonationNotAllowedError('Actor lacks impersonation rights');
    }

    const session: ImpersonationSession = {
      id: crypto.randomUUID(),
      actorId: actor.id,
      targetUserId,
      startedAt: new Date(),
      expiresAt: new Date(Date.now() + 3600000), // 1 hour max
      actions: [],
      auditTrail: []
    };

    await this.impersonationStore.save(session);
    await this.auditService.logImpersonationStart(session);

    return session;
  }
}
```

## Integration Points

### External Policy Decision Points

```typescript
interface ExternalPDPIntegration {
  evaluateWithOPA(request: AuthorizationRequest): Promise<AuthorizationDecision>;
  evaluateWithCedar(request: AuthorizationRequest): Promise<AuthorizationDecision>;
  syncPolicies(source: PolicySource): Promise<SyncResult>;
}

class OPAIntegration implements ExternalPDPIntegration {
  private opaClient: OPAClient;

  async evaluateWithOPA(request: AuthorizationRequest): Promise<AuthorizationDecision> {
    const opaInput = this.transformToOPAInput(request);
    
    const result = await this.opaClient.query('authz/allow', opaInput);
    
    return {
      allowed: result.result === true,
      reason: result.reason,
      evaluatedPolicies: result.policies || [],
      processingTime: result.metrics?.timer_rego_query_eval_ns / 1000000
    };
  }

  private transformToOPAInput(request: AuthorizationRequest): OPAInput {
    return {
      input: {
        subject: {
          id: request.subject.id,
          roles: request.subject.roles,
          attributes: request.subject.attributes
        },
        action: request.action,
        resource: {
          type: request.resource.type,
          id: request.resource.id,
          attributes: request.resource.attributes
        },
        context: {
          timestamp: request.context.timestamp.toISOString(),
          ip: request.context.ipAddress,
          ...request.context.customAttributes
        }
      }
    };
  }
}

// Example OPA policy (Rego)
const opaPolicy = `
package authz

default allow = false

# Allow admins to do anything
allow {
    input.subject.roles[_] == "admin"
}

# Allow users to read their own resources
allow {
    input.action == "read"
    input.resource.attributes.owner == input.subject.id
}

# Allow department members to read department resources
allow {
    input.action == "read"
    input.subject.attributes.department == input.resource.attributes.department
}

# Time-based access control
allow {
    input.action == "write"
    time.clock(time.now_ns())[0] >= 9
    time.clock(time.now_ns())[0] < 18
}
`;
```

### API Gateway Integration

```typescript
class APIGatewayAuthorizationMiddleware {
  private authzService: DynamicAuthorizationService;

  async authorize(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authzRequest = this.buildAuthorizationRequest(req);
    
    try {
      const decision = await this.authzService.authorize(authzRequest);
      
      if (!decision.allowed) {
        res.status(403).json({
          error: 'Forbidden',
          reason: decision.reason,
          requestId: authzRequest.context.requestId
        });
        return;
      }

      // Apply obligations
      if (decision.obligations) {
        await this.applyObligations(req, res, decision.obligations);
      }

      // Add authorization context to request
      req.authzContext = {
        decision,
        effectivePermissions: await this.authzService.getEffectivePermissions(
          authzRequest.subject,
          authzRequest.resource
        )
      };

      next();
    } catch (error) {
      res.status(500).json({
        error: 'Authorization service error',
        requestId: authzRequest.context.requestId
      });
    }
  }

  private buildAuthorizationRequest(req: Request): AuthorizationRequest {
    return {
      subject: {
        id: req.user.id,
        type: 'user',
        attributes: req.user.attributes,
        roles: req.user.roles,
        groups: req.user.groups,
        tenantId: req.tenantId
      },
      action: this.mapHttpMethodToAction(req.method),
      resource: {
        id: req.params.resourceId || '*',
        type: this.extractResourceType(req.path),
        attributes: {},
        tenantId: req.tenantId
      },
      context: {
        ipAddress: req.ip,
        timestamp: new Date(),
        requestId: req.requestId,
        deviceInfo: this.extractDeviceInfo(req),
        customAttributes: req.query
      }
    };
  }
}
```

## Security Considerations

### Policy Validation and Testing

```typescript
class PolicyValidator {
  async validatePolicy(policy: ABACPolicy): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];

    // Check for overly permissive policies
    if (this.isOverlyPermissive(policy)) {
      warnings.push({
        code: 'OVERLY_PERMISSIVE',
        message: 'Policy grants broad access without sufficient constraints'
      });
    }

    // Check for conflicting conditions
    const conflicts = this.findConflictingConditions(policy.conditions);
    if (conflicts.length > 0) {
      errors.push({
        code: 'CONFLICTING_CONDITIONS',
        message: 'Policy contains mutually exclusive conditions',
        details: conflicts
      });
    }

    // Validate attribute references
    for (const condition of policy.conditions) {
      const isValid = await this.validateAttributeReference(condition);
      if (!isValid) {
        errors.push({
          code: 'INVALID_ATTRIBUTE',
          message: `Unknown attribute: ${condition.attribute}`
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  async testPolicy(policy: ABACPolicy, testCases: PolicyTestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      const decision = await this.evaluatePolicy(policy, testCase.input);
      
      results.push({
        testCase: testCase.name,
        passed: decision.allowed === testCase.expectedResult,
        actual: decision.allowed,
        expected: testCase.expectedResult,
        details: decision
      });
    }

    return results;
  }
}
```

### Audit and Compliance

```typescript
class AuthorizationAuditService {
  async logDecision(
    request: AuthorizationRequest,
    decision: AuthorizationDecision
  ): Promise<void> {
    const auditRecord: AuthorizationAuditRecord = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      requestId: request.context.requestId,
      subject: {
        id: request.subject.id,
        type: request.subject.type,
        roles: request.subject.roles
      },
      action: request.action,
      resource: {
        id: request.resource.id,
        type: request.resource.type
      },
      decision: decision.allowed ? 'PERMIT' : 'DENY',
      reason: decision.reason,
      evaluatedPolicies: decision.evaluatedPolicies,
      context: this.sanitizeContext(request.context),
      processingTime: decision.processingTime
    };

    await this.auditStore.save(auditRecord);

    // Real-time monitoring for denied access
    if (!decision.allowed) {
      await this.securityMonitor.reportDeniedAccess(auditRecord);
    }
  }

  async generateComplianceReport(
    tenantId: string,
    dateRange: DateRange
  ): Promise<ComplianceReport> {
    const records = await this.auditStore.query({
      tenantId,
      startDate: dateRange.start,
      endDate: dateRange.end
    });

    return {
      totalDecisions: records.length,
      permitCount: records.filter(r => r.decision === 'PERMIT').length,
      denyCount: records.filter(r => r.decision === 'DENY').length,
      uniqueSubjects: new Set(records.map(r => r.subject.id)).size,
      topDeniedActions: this.aggregateTopDenied(records),
      policyEffectiveness: this.calculatePolicyEffectiveness(records),
      anomalies: await this.detectAnomalies(records)
    };
  }
}
```

## Compliance Guidelines

- SOC 2 Type II requirements for access control documentation
- GDPR Article 25 - Data protection by design
- HIPAA access control requirements (45 CFR 164.312)
- PCI DSS Requirement 7 - Restrict access to cardholder data

## Testing Considerations

### Property-Based Tests

```typescript
describe('Authorization Engine Properties', () => {
  it('should always deny when explicit deny policy exists', () => {
    fc.assert(fc.property(
      fc.record({
        subjectId: fc.string(),
        action: fc.string(),
        resourceId: fc.string()
      }),
      async ({ subjectId, action, resourceId }) => {
        const engine = new ABACEngine();
        
        // Add explicit deny policy
        await engine.addPolicy({
          effect: PolicyEffect.DENY,
          target: { actions: [action] },
          conditions: [],
          priority: 1000
        });

        const decision = await engine.evaluate({
          subject: { id: subjectId, type: 'user', attributes: {}, roles: [], groups: [] },
          action,
          resource: { id: resourceId, type: 'test', attributes: {} },
          context: { timestamp: new Date(), requestId: 'test' }
        });

        expect(decision.allowed).toBe(false);
      }
    ));
  });

  it('should be consistent across multiple evaluations', () => {
    fc.assert(fc.property(
      fc.record({
        subjectId: fc.string(),
        action: fc.constantFrom('read', 'write', 'delete'),
        resourceId: fc.string()
      }),
      async (request) => {
        const engine = new ABACEngine();
        
        const decision1 = await engine.evaluate(buildRequest(request));
        const decision2 = await engine.evaluate(buildRequest(request));

        expect(decision1.allowed).toBe(decision2.allowed);
      }
    ));
  });
});
```
