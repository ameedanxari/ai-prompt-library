# Zero Trust Architecture Template

## Purpose

This template provides comprehensive patterns for implementing zero trust security architecture, including continuous verification, network segmentation, micro-segmentation, identity-centric security, and least privilege access. It covers the principles and implementation strategies for "never trust, always verify" security models.

## Context

Traditional perimeter-based security models are insufficient for modern distributed applications and hybrid cloud environments. Zero trust architecture assumes no implicit trust and requires continuous verification of every user, device, and network flow. This template addresses the implementation of comprehensive zero trust security across identity, network, data, and application layers.

## Core Components

### Zero Trust Policy Engine Interface

```typescript
interface ZeroTrustPolicyEngine {
  evaluateAccess(request: AccessRequest): Promise<AccessDecision>;
  verifyIdentity(identity: Identity): Promise<VerificationResult>;
  assessDeviceTrust(device: DeviceInfo): Promise<TrustAssessment>;
  evaluateContext(context: SecurityContext): Promise<ContextEvaluation>;
}

interface AccessRequest {
  identity: Identity;
  device: DeviceInfo;
  resource: Resource;
  action: string;
  context: SecurityContext;
  timestamp: Date;
}

interface AccessDecision {
  allowed: boolean;
  reason: string;
  conditions: AccessCondition[];
  sessionDuration: number;
  requiredActions: RequiredAction[];
  riskScore: number;
}

interface TrustAssessment {
  deviceId: string;
  trustLevel: TrustLevel;
  complianceStatus: ComplianceStatus;
  riskFactors: RiskFactor[];
  lastVerified: Date;
}

enum TrustLevel {
  UNTRUSTED = 'untrusted',
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  VERIFIED = 'verified'
}

class ZeroTrustPolicyService implements ZeroTrustPolicyEngine {
  private identityVerifier: IdentityVerifier;
  private deviceAssessor: DeviceAssessor;
  private contextEvaluator: ContextEvaluator;
  private policyStore: PolicyStore;

  async evaluateAccess(request: AccessRequest): Promise<AccessDecision> {
    // Step 1: Verify identity
    const identityResult = await this.verifyIdentity(request.identity);
    if (!identityResult.verified) {
      return this.denyAccess('Identity verification failed', identityResult.reason);
    }

    // Step 2: Assess device trust
    const deviceTrust = await this.assessDeviceTrust(request.device);
    if (deviceTrust.trustLevel === TrustLevel.UNTRUSTED) {
      return this.denyAccess('Device not trusted', deviceTrust.riskFactors);
    }

    // Step 3: Evaluate context
    const contextEval = await this.evaluateContext(request.context);
    if (contextEval.riskLevel === 'high') {
      return this.requireStepUp(request, contextEval);
    }

    // Step 4: Check policies
    const policies = await this.policyStore.getPolicies(request.resource);
    const policyResult = await this.evaluatePolicies(policies, request);

    // Step 5: Calculate risk score
    const riskScore = this.calculateRiskScore(identityResult, deviceTrust, contextEval);

    return {
      allowed: policyResult.allowed,
      reason: policyResult.reason,
      conditions: policyResult.conditions,
      sessionDuration: this.calculateSessionDuration(riskScore),
      requiredActions: this.determineRequiredActions(riskScore),
      riskScore
    };
  }

  async verifyIdentity(identity: Identity): Promise<VerificationResult> {
    const verifications: VerificationCheck[] = [];

    // Multi-factor verification
    const mfaResult = await this.identityVerifier.verifyMFA(identity);
    verifications.push({ type: 'mfa', passed: mfaResult.verified });

    // Session validity
    const sessionResult = await this.identityVerifier.verifySession(identity.sessionId);
    verifications.push({ type: 'session', passed: sessionResult.valid });

    // Identity federation check
    if (identity.federatedSource) {
      const federationResult = await this.identityVerifier.verifyFederation(identity);
      verifications.push({ type: 'federation', passed: federationResult.valid });
    }

    const allPassed = verifications.every(v => v.passed);
    return {
      verified: allPassed,
      verifications,
      reason: allPassed ? 'All verifications passed' : 'One or more verifications failed'
    };
  }

  async assessDeviceTrust(device: DeviceInfo): Promise<TrustAssessment> {
    const riskFactors: RiskFactor[] = [];

    // Check device registration
    const isRegistered = await this.deviceAssessor.isRegistered(device.deviceId);
    if (!isRegistered) {
      riskFactors.push({ type: 'unregistered_device', severity: 'high' });
    }

    // Check device compliance
    const compliance = await this.deviceAssessor.checkCompliance(device);
    if (!compliance.compliant) {
      riskFactors.push(...compliance.violations.map(v => ({
        type: 'compliance_violation',
        severity: v.severity,
        details: v.description
      })));
    }

    // Check device health
    const health = await this.deviceAssessor.checkHealth(device);
    if (!health.healthy) {
      riskFactors.push({ type: 'unhealthy_device', severity: 'medium', details: health.issues });
    }

    const trustLevel = this.calculateTrustLevel(riskFactors);

    return {
      deviceId: device.deviceId,
      trustLevel,
      complianceStatus: compliance,
      riskFactors,
      lastVerified: new Date()
    };
  }
}
```

### Network Micro-Segmentation Service

```typescript
interface MicroSegmentationService {
  createSegment(config: SegmentConfig): Promise<NetworkSegment>;
  definePolicy(policy: SegmentPolicy): Promise<void>;
  evaluateTraffic(flow: NetworkFlow): Promise<FlowDecision>;
  getSegmentStatus(segmentId: string): Promise<SegmentStatus>;
}

interface NetworkSegment {
  id: string;
  name: string;
  workloads: Workload[];
  policies: SegmentPolicy[];
  trustZone: TrustZone;
  encryptionRequired: boolean;
}

interface SegmentPolicy {
  id: string;
  sourceSegment: string;
  destinationSegment: string;
  allowedProtocols: Protocol[];
  allowedPorts: number[];
  action: 'allow' | 'deny' | 'log';
  conditions: PolicyCondition[];
}

class MicroSegmentationManager implements MicroSegmentationService {
  private segmentStore: SegmentStore;
  private policyEngine: PolicyEngine;
  private flowAnalyzer: FlowAnalyzer;

  async createSegment(config: SegmentConfig): Promise<NetworkSegment> {
    // Validate segment configuration
    this.validateSegmentConfig(config);

    // Create segment with default deny policy
    const segment: NetworkSegment = {
      id: crypto.randomUUID(),
      name: config.name,
      workloads: [],
      policies: [this.createDefaultDenyPolicy()],
      trustZone: config.trustZone,
      encryptionRequired: config.encryptionRequired ?? true
    };

    // Register segment
    await this.segmentStore.save(segment);

    // Apply network rules
    await this.applyNetworkRules(segment);

    return segment;
  }

  async evaluateTraffic(flow: NetworkFlow): Promise<FlowDecision> {
    // Get source and destination segments
    const sourceSegment = await this.getWorkloadSegment(flow.sourceWorkload);
    const destSegment = await this.getWorkloadSegment(flow.destinationWorkload);

    // Find applicable policies
    const policies = await this.findApplicablePolicies(sourceSegment, destSegment);

    // Evaluate policies in order
    for (const policy of policies) {
      const result = await this.policyEngine.evaluate(policy, flow);
      if (result.matched) {
        return {
          allowed: result.action === 'allow',
          policy: policy.id,
          reason: result.reason,
          logRequired: result.action === 'log' || policy.action === 'log'
        };
      }
    }

    // Default deny
    return {
      allowed: false,
      policy: 'default-deny',
      reason: 'No matching policy found',
      logRequired: true
    };
  }

  private createDefaultDenyPolicy(): SegmentPolicy {
    return {
      id: 'default-deny',
      sourceSegment: '*',
      destinationSegment: '*',
      allowedProtocols: [],
      allowedPorts: [],
      action: 'deny',
      conditions: []
    };
  }
}
```

### Continuous Verification Service

```typescript
interface ContinuousVerificationService {
  startSession(session: UserSession): Promise<VerificationSession>;
  verifyOngoing(sessionId: string): Promise<VerificationResult>;
  handleRiskChange(sessionId: string, riskEvent: RiskEvent): Promise<SessionAction>;
  terminateSession(sessionId: string, reason: string): Promise<void>;
}

interface VerificationSession {
  id: string;
  userId: string;
  deviceId: string;
  startTime: Date;
  lastVerification: Date;
  riskScore: number;
  verificationInterval: number;
  status: SessionStatus;
}

class ContinuousVerifier implements ContinuousVerificationService {
  private sessionStore: SessionStore;
  private riskEngine: RiskEngine;
  private verificationScheduler: VerificationScheduler;

  async startSession(session: UserSession): Promise<VerificationSession> {
    // Initial verification
    const initialRisk = await this.riskEngine.assessInitialRisk(session);

    const verificationSession: VerificationSession = {
      id: crypto.randomUUID(),
      userId: session.userId,
      deviceId: session.deviceId,
      startTime: new Date(),
      lastVerification: new Date(),
      riskScore: initialRisk.score,
      verificationInterval: this.calculateInterval(initialRisk.score),
      status: 'active'
    };

    await this.sessionStore.save(verificationSession);

    // Schedule periodic verification
    await this.verificationScheduler.schedule(verificationSession);

    return verificationSession;
  }

  async verifyOngoing(sessionId: string): Promise<VerificationResult> {
    const session = await this.sessionStore.get(sessionId);
    if (!session) {
      return { verified: false, reason: 'Session not found' };
    }

    // Re-assess risk
    const currentRisk = await this.riskEngine.assessCurrentRisk(session);

    // Check for anomalies
    const anomalies = await this.detectAnomalies(session);

    // Update session
    session.lastVerification = new Date();
    session.riskScore = currentRisk.score;

    if (anomalies.length > 0 || currentRisk.score > 80) {
      session.status = 'requires_verification';
      await this.sessionStore.save(session);
      return {
        verified: false,
        reason: 'Risk threshold exceeded',
        requiredAction: 'step_up_authentication'
      };
    }

    // Adjust verification interval based on risk
    session.verificationInterval = this.calculateInterval(currentRisk.score);
    await this.sessionStore.save(session);

    return { verified: true, nextVerification: this.getNextVerificationTime(session) };
  }

  async handleRiskChange(sessionId: string, riskEvent: RiskEvent): Promise<SessionAction> {
    const session = await this.sessionStore.get(sessionId);
    if (!session) {
      return { action: 'terminate', reason: 'Session not found' };
    }

    // Evaluate risk event impact
    const impact = await this.riskEngine.evaluateEventImpact(riskEvent);

    if (impact.severity === 'critical') {
      await this.terminateSession(sessionId, 'Critical risk event detected');
      return { action: 'terminate', reason: riskEvent.description };
    }

    if (impact.severity === 'high') {
      session.status = 'requires_verification';
      await this.sessionStore.save(session);
      return { action: 'step_up', reason: riskEvent.description };
    }

    // Update risk score
    session.riskScore = Math.min(session.riskScore + impact.scoreIncrease, 100);
    session.verificationInterval = this.calculateInterval(session.riskScore);
    await this.sessionStore.save(session);

    return { action: 'continue', adjustedInterval: session.verificationInterval };
  }

  private calculateInterval(riskScore: number): number {
    // Higher risk = more frequent verification
    if (riskScore > 70) return 60000; // 1 minute
    if (riskScore > 50) return 300000; // 5 minutes
    if (riskScore > 30) return 900000; // 15 minutes
    return 1800000; // 30 minutes
  }
}
```

## Implementation Patterns

### Least Privilege Access Pattern

```typescript
class LeastPrivilegeManager {
  private permissionStore: PermissionStore;
  private accessAnalyzer: AccessAnalyzer;

  async grantMinimalAccess(user: User, resource: Resource): Promise<AccessGrant> {
    // Analyze required permissions
    const requiredPermissions = await this.accessAnalyzer.analyzeRequired(user.role, resource);

    // Filter to minimum necessary
    const minimalPermissions = this.filterToMinimal(requiredPermissions);

    // Set time-bound access
    const grant: AccessGrant = {
      userId: user.id,
      resourceId: resource.id,
      permissions: minimalPermissions,
      grantedAt: new Date(),
      expiresAt: this.calculateExpiration(minimalPermissions),
      justification: 'Least privilege access grant'
    };

    await this.permissionStore.save(grant);
    return grant;
  }

  async reviewAndRevoke(): Promise<RevocationReport> {
    const allGrants = await this.permissionStore.getActiveGrants();
    const revocations: Revocation[] = [];

    for (const grant of allGrants) {
      // Check if access is still needed
      const usage = await this.accessAnalyzer.getUsageStats(grant);
      
      if (usage.lastAccess && this.isStale(usage.lastAccess)) {
        await this.permissionStore.revoke(grant.id);
        revocations.push({
          grantId: grant.id,
          reason: 'Unused access',
          revokedAt: new Date()
        });
      }

      // Check for over-privileged access
      const actualUsed = await this.accessAnalyzer.getActualPermissionsUsed(grant);
      if (this.isOverPrivileged(grant.permissions, actualUsed)) {
        const reducedGrant = await this.reducePermissions(grant, actualUsed);
        revocations.push({
          grantId: grant.id,
          reason: 'Reduced to actual usage',
          newPermissions: reducedGrant.permissions
        });
      }
    }

    return { revocations, reviewedAt: new Date() };
  }
}
```

### Service Mesh Zero Trust Pattern

```typescript
interface ServiceMeshZeroTrust {
  configureMTLS(service: Service): Promise<MTLSConfig>;
  defineServicePolicy(policy: ServicePolicy): Promise<void>;
  validateServiceIdentity(request: ServiceRequest): Promise<ValidationResult>;
}

class IstioZeroTrustConfig implements ServiceMeshZeroTrust {
  async configureMTLS(service: Service): Promise<MTLSConfig> {
    const config: MTLSConfig = {
      mode: 'STRICT',
      certificateAuthority: 'istio-ca',
      minTLSVersion: 'TLSv1_3',
      cipherSuites: [
        'TLS_AES_256_GCM_SHA384',
        'TLS_CHACHA20_POLY1305_SHA256'
      ]
    };

    // Apply PeerAuthentication
    await this.applyPeerAuthentication(service, config);

    // Apply DestinationRule
    await this.applyDestinationRule(service, config);

    return config;
  }

  async defineServicePolicy(policy: ServicePolicy): Promise<void> {
    // Create AuthorizationPolicy
    const authPolicy = {
      apiVersion: 'security.istio.io/v1beta1',
      kind: 'AuthorizationPolicy',
      metadata: {
        name: policy.name,
        namespace: policy.namespace
      },
      spec: {
        selector: {
          matchLabels: policy.targetLabels
        },
        action: policy.action,
        rules: policy.rules.map(rule => ({
          from: rule.sources.map(s => ({ principals: [s] })),
          to: rule.operations.map(op => ({
            methods: op.methods,
            paths: op.paths
          })),
          when: rule.conditions
        }))
      }
    };

    await this.kubeClient.apply(authPolicy);
  }
}
```

## Configuration

### Zero Trust Policy Configuration

```typescript
interface ZeroTrustConfig {
  // Identity verification settings
  identity: {
    mfaRequired: boolean;
    sessionTimeout: number;
    continuousVerification: boolean;
    verificationInterval: number;
  };

  // Device trust settings
  device: {
    registrationRequired: boolean;
    complianceRequired: boolean;
    healthCheckInterval: number;
    minimumTrustLevel: TrustLevel;
  };

  // Network segmentation settings
  network: {
    defaultDeny: boolean;
    encryptionRequired: boolean;
    segmentationEnabled: boolean;
    allowedProtocols: string[];
  };

  // Access control settings
  access: {
    leastPrivilege: boolean;
    justInTimeAccess: boolean;
    accessReviewInterval: number;
    maxSessionDuration: number;
  };
}

const defaultZeroTrustConfig: ZeroTrustConfig = {
  identity: {
    mfaRequired: true,
    sessionTimeout: 3600000, // 1 hour
    continuousVerification: true,
    verificationInterval: 300000 // 5 minutes
  },
  device: {
    registrationRequired: true,
    complianceRequired: true,
    healthCheckInterval: 86400000, // 24 hours
    minimumTrustLevel: TrustLevel.MEDIUM
  },
  network: {
    defaultDeny: true,
    encryptionRequired: true,
    segmentationEnabled: true,
    allowedProtocols: ['https', 'grpc']
  },
  access: {
    leastPrivilege: true,
    justInTimeAccess: true,
    accessReviewInterval: 604800000, // 7 days
    maxSessionDuration: 28800000 // 8 hours
  }
};
```

## Integration Points

### Identity Provider Integration

```typescript
interface ZeroTrustIdentityIntegration {
  verifyWithIdP(token: string): Promise<IdentityVerification>;
  enforceConditionalAccess(user: User, context: AccessContext): Promise<ConditionalAccessResult>;
  syncDeviceCompliance(deviceId: string): Promise<ComplianceStatus>;
}

class AzureADZeroTrustIntegration implements ZeroTrustIdentityIntegration {
  private msalClient: ConfidentialClientApplication;

  async verifyWithIdP(token: string): Promise<IdentityVerification> {
    const decoded = await this.msalClient.acquireTokenOnBehalfOf({
      oboAssertion: token,
      scopes: ['user.read']
    });

    // Verify token claims
    const claims = this.extractClaims(decoded);
    
    return {
      verified: true,
      userId: claims.oid,
      tenantId: claims.tid,
      mfaClaim: claims.amr?.includes('mfa'),
      deviceId: claims.deviceid,
      riskLevel: claims.riskLevel
    };
  }

  async enforceConditionalAccess(user: User, context: AccessContext): Promise<ConditionalAccessResult> {
    // Evaluate Azure AD Conditional Access policies
    const policies = await this.getConditionalAccessPolicies(user);
    
    for (const policy of policies) {
      const result = await this.evaluatePolicy(policy, user, context);
      if (!result.allowed) {
        return {
          allowed: false,
          reason: result.reason,
          requiredControls: result.requiredControls
        };
      }
    }

    return { allowed: true };
  }
}
```

### SIEM and Monitoring Integration

```typescript
interface ZeroTrustMonitoring {
  logAccessDecision(decision: AccessDecision): Promise<void>;
  logPolicyViolation(violation: PolicyViolation): Promise<void>;
  generateZeroTrustMetrics(): Promise<ZeroTrustMetrics>;
}

class ZeroTrustSIEMIntegration implements ZeroTrustMonitoring {
  private siemClient: SIEMClient;

  async logAccessDecision(decision: AccessDecision): Promise<void> {
    await this.siemClient.log({
      eventType: 'zero_trust_access_decision',
      timestamp: new Date(),
      data: {
        allowed: decision.allowed,
        userId: decision.userId,
        resourceId: decision.resourceId,
        riskScore: decision.riskScore,
        conditions: decision.conditions
      },
      severity: decision.allowed ? 'info' : 'warning'
    });
  }

  async generateZeroTrustMetrics(): Promise<ZeroTrustMetrics> {
    const timeRange = { start: new Date(Date.now() - 86400000), end: new Date() };
    
    return {
      totalAccessRequests: await this.countEvents('access_request', timeRange),
      deniedRequests: await this.countEvents('access_denied', timeRange),
      stepUpRequests: await this.countEvents('step_up_required', timeRange),
      policyViolations: await this.countEvents('policy_violation', timeRange),
      averageRiskScore: await this.calculateAverageRiskScore(timeRange),
      deviceComplianceRate: await this.calculateComplianceRate(timeRange)
    };
  }
}
```

## Security Considerations

### Defense in Depth

- Implement multiple layers of verification (identity, device, network, application)
- Use encryption for all data in transit and at rest
- Apply micro-segmentation to limit lateral movement
- Implement continuous monitoring and anomaly detection

### Identity Security

- Require strong authentication (MFA, passwordless)
- Implement just-in-time and just-enough access
- Regularly review and revoke unused permissions
- Use short-lived tokens and sessions

### Network Security

- Default deny all traffic between segments
- Require mutual TLS for service-to-service communication
- Implement network-level encryption
- Monitor and log all network flows

## Compliance Guidelines

### Regulatory Alignment

- **NIST SP 800-207**: Follow zero trust architecture guidelines
- **CISA Zero Trust Maturity Model**: Align with federal zero trust requirements
- **PCI DSS 4.0**: Implement network segmentation and access controls
- **SOC 2**: Demonstrate continuous monitoring and access management

### Audit Requirements

```typescript
interface ZeroTrustAudit {
  generateAccessReport(period: DateRange): Promise<AccessReport>;
  generateComplianceReport(): Promise<ComplianceReport>;
  exportAuditLogs(query: AuditQuery): Promise<AuditLog[]>;
}

class ZeroTrustAuditor implements ZeroTrustAudit {
  async generateComplianceReport(): Promise<ComplianceReport> {
    return {
      reportDate: new Date(),
      controls: [
        {
          control: 'Identity Verification',
          status: await this.assessIdentityControls(),
          evidence: await this.gatherIdentityEvidence()
        },
        {
          control: 'Device Trust',
          status: await this.assessDeviceControls(),
          evidence: await this.gatherDeviceEvidence()
        },
        {
          control: 'Network Segmentation',
          status: await this.assessNetworkControls(),
          evidence: await this.gatherNetworkEvidence()
        },
        {
          control: 'Least Privilege',
          status: await this.assessAccessControls(),
          evidence: await this.gatherAccessEvidence()
        }
      ]
    };
  }
}
```

## Testing Considerations

### Unit Testing

```typescript
describe('ZeroTrustPolicyService', () => {
  it('should deny access for unverified identity', async () => {
    const service = new ZeroTrustPolicyService(mockConfig);
    const request = createAccessRequest({ identity: unverifiedIdentity });
    
    const decision = await service.evaluateAccess(request);
    
    expect(decision.allowed).toBe(false);
    expect(decision.reason).toContain('Identity verification failed');
  });

  it('should require step-up for high-risk context', async () => {
    const service = new ZeroTrustPolicyService(mockConfig);
    const request = createAccessRequest({ context: highRiskContext });
    
    const decision = await service.evaluateAccess(request);
    
    expect(decision.requiredActions).toContainEqual(
      expect.objectContaining({ type: 'step_up_authentication' })
    );
  });
});
```

### Integration Testing

```typescript
describe('Zero Trust Integration', () => {
  it('should integrate with identity provider for verification', async () => {
    const idpMock = createIdPMock();
    const service = new ZeroTrustPolicyService(config, idpMock);
    
    await service.evaluateAccess(validRequest);
    
    expect(idpMock.verifyToken).toHaveBeenCalled();
  });

  it('should enforce micro-segmentation policies', async () => {
    const segmentService = new MicroSegmentationManager(config);
    
    const flow = createNetworkFlow({ source: 'web', destination: 'database' });
    const decision = await segmentService.evaluateTraffic(flow);
    
    expect(decision.allowed).toBe(false);
    expect(decision.policy).toBe('default-deny');
  });
});
```

### Security Testing

- Test policy bypass attempts
- Verify continuous verification triggers correctly
- Test device trust assessment accuracy
- Validate network segmentation enforcement
