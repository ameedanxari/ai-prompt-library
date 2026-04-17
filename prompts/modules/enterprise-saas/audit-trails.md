# Enterprise Audit Trails Template

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

This template provides comprehensive patterns for implementing enterprise-grade audit trails and compliance logging in SaaS applications. It covers audit event capture, secure storage, compliance reporting, real-time monitoring, and integration with SIEM systems while ensuring data integrity, tamper-proofing, and regulatory compliance.

## Context

Enterprise applications require comprehensive audit trails for security monitoring, compliance reporting, forensic analysis, and regulatory requirements. This template addresses the complexities of capturing all relevant events, ensuring data integrity, providing efficient search and reporting capabilities, and meeting various compliance frameworks like SOX, HIPAA, GDPR, and PCI DSS.

## Core Components

### Audit Event Management

## Examples

```typescript
interface AuditEventManager {
  logEvent(event: AuditEvent): Promise<void>;
  logBulkEvents(events: AuditEvent[]): Promise<void>;
  queryEvents(query: AuditQuery): Promise<AuditEventResult>;
  getEventById(eventId: string): Promise<AuditEvent | null>;
  generateReport(reportRequest: AuditReportRequest): Promise<AuditReport>;
  exportEvents(exportRequest: AuditExportRequest): Promise<ExportResult>;
}

interface AuditEvent {
  id: string;
  tenantId: string;
  timestamp: Date;
  eventType: AuditEventType;
  category: AuditCategory;
  severity: AuditSeverity;
  actor: AuditActor;
  target: AuditTarget;
  action: string;
  outcome: AuditOutcome;
  details: AuditDetails;
  context: AuditContext;
  metadata: AuditMetadata;
  hash?: string;
  signature?: string;
}

enum AuditEventType {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM_CONFIGURATION = 'system_configuration',
  USER_MANAGEMENT = 'user_management',
  SECURITY_EVENT = 'security_event',
  COMPLIANCE_EVENT = 'compliance_event',
  BUSINESS_PROCESS = 'business_process',
  INTEGRATION_EVENT = 'integration_event'
}

enum AuditCategory {
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  OPERATIONAL = 'operational',
  BUSINESS = 'business',
  TECHNICAL = 'technical'
}

enum AuditSeverity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

interface AuditActor {
  type: ActorType;
  id: string;
  name?: string;
  email?: string;
  roles?: string[];
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

enum ActorType {
  USER = 'user',
  SYSTEM = 'system',
  SERVICE = 'service',
  API_CLIENT = 'api_client',
  EXTERNAL_SYSTEM = 'external_system'
}

interface AuditTarget {
  type: TargetType;
  id: string;
  name?: string;
  resourceType?: string;
  parentId?: string;
  attributes?: Record<string, any>;
}

enum TargetType {
  USER = 'user',
  ROLE = 'role',
  PERMISSION = 'permission',
  RESOURCE = 'resource',
  CONFIGURATION = 'configuration',
  SYSTEM = 'system'
}
```

### Secure Audit Storage

```typescript
interface SecureAuditStorage {
  storeEvent(event: AuditEvent): Promise<void>;
  storeBatch(events: AuditEvent[]): Promise<void>;
  retrieveEvents(query: StorageQuery): Promise<StoredAuditEvent[]>;
  verifyIntegrity(eventId: string): Promise<IntegrityVerificationResult>;
  createSnapshot(tenantId: string, timestamp: Date): Promise<AuditSnapshot>;
  validateChain(tenantId: string, startDate: Date, endDate: Date): Promise<ChainValidationResult>;
}

interface StoredAuditEvent extends AuditEvent {
  storageTimestamp: Date;
  storageLocation: string;
  integrityHash: string;
  previousEventHash?: string;
  blockchainReference?: string;
  encryptionKeyId?: string;
}

interface AuditSnapshot {
  id: string;
  tenantId: string;
  timestamp: Date;
  eventCount: number;
  merkleRoot: string;
  signature: string;
  metadata: SnapshotMetadata;
}

class TamperProofAuditStorage implements SecureAuditStorage {
  async storeEvent(event: AuditEvent): Promise<void> {
    // Generate integrity hash
    const eventHash = await this.generateEventHash(event);
    
    // Get previous event hash for chaining
    const previousHash = await this.getLastEventHash(event.tenantId);
    
    // Create tamper-proof record
    const storedEvent: StoredAuditEvent = {
      ...event,
      storageTimestamp: new Date(),
      storageLocation: await this.determineStorageLocation(event),
      integrityHash: eventHash,
      previousEventHash: previousHash,
      encryptionKeyId: await this.getEncryptionKeyId(event.tenantId)
    };
    
    // Encrypt sensitive data
    const encryptedEvent = await this.encryptSensitiveFields(storedEvent);
    
    // Store in primary storage
    await this.primaryStorage.store(encryptedEvent);
    
    // Store in immutable backup (e.g., blockchain or write-once storage)
    await this.immutableStorage.store(encryptedEvent);
    
    // Update chain reference
    await this.updateEventChain(event.tenantId, eventHash);
    
    // Send to real-time monitoring
    await this.realtimeMonitor.processEvent(event);
  }

  private async generateEventHash(event: AuditEvent): Promise<string> {
    const hashInput = {
      id: event.id,
      tenantId: event.tenantId,
      timestamp: event.timestamp.toISOString(),
      eventType: event.eventType,
      actor: event.actor,
      target: event.target,
      action: event.action,
      outcome: event.outcome,
      details: event.details
    };
    
    const serialized = JSON.stringify(hashInput, Object.keys(hashInput).sort());
    return await this.cryptoService.hash(serialized, 'SHA-256');
  }

  async verifyIntegrity(eventId: string): Promise<IntegrityVerificationResult> {
    const storedEvent = await this.primaryStorage.retrieve(eventId);
    if (!storedEvent) {
      return { isValid: false, error: 'Event not found' };
    }
    
    // Verify event hash
    const computedHash = await this.generateEventHash(storedEvent);
    if (computedHash !== storedEvent.integrityHash) {
      return { 
        isValid: false, 
        error: 'Event hash mismatch',
        expectedHash: storedEvent.integrityHash,
        computedHash
      };
    }
    
    // Verify chain integrity
    if (storedEvent.previousEventHash) {
      const chainValid = await this.verifyChainLink(storedEvent);
      if (!chainValid) {
        return { isValid: false, error: 'Chain integrity violation' };
      }
    }
    
    // Verify immutable storage
    const immutableEvent = await this.immutableStorage.retrieve(eventId);
    if (!immutableEvent || !this.eventsMatch(storedEvent, immutableEvent)) {
      return { isValid: false, error: 'Immutable storage mismatch' };
    }
    
    return { isValid: true };
  }
}
```

### Real-time Audit Monitoring

```typescript
interface RealTimeAuditMonitor {
  processEvent(event: AuditEvent): Promise<void>;
  detectAnomalies(tenantId: string): Promise<AnomalyAlert[]>;
  generateAlerts(event: AuditEvent): Promise<SecurityAlert[]>;
  updateMetrics(event: AuditEvent): Promise<void>;
  triggerWorkflows(event: AuditEvent): Promise<void>;
}

interface AnomalyDetectionEngine {
  analyzeEvent(event: AuditEvent, context: AnalysisContext): Promise<AnomalyScore>;
  updateBaseline(tenantId: string, userId: string, behavior: UserBehavior): Promise<void>;
  detectPatterns(events: AuditEvent[]): Promise<PatternAnalysis>;
  generateRiskScore(tenantId: string, userId: string): Promise<RiskScore>;
}

class IntelligentAuditMonitor implements RealTimeAuditMonitor {
  async processEvent(event: AuditEvent): Promise<void> {
    // Update real-time metrics
    await this.updateMetrics(event);
    
    // Check for immediate security concerns
    const securityAlerts = await this.generateAlerts(event);
    if (securityAlerts.length > 0) {
      await this.alertManager.sendAlerts(securityAlerts);
    }
    
    // Perform anomaly detection
    const anomalies = await this.anomalyDetector.analyzeEvent(event, {
      tenantId: event.tenantId,
      userId: event.actor.id,
      timeWindow: '1h',
      historicalData: await this.getHistoricalBehavior(event.actor.id)
    });
    
    if (anomalies.score > this.anomalyThreshold) {
      await this.handleAnomaly(event, anomalies);
    }
    
    // Trigger automated workflows
    await this.triggerWorkflows(event);
    
    // Update user behavior baseline
    if (event.actor.type === ActorType.USER) {
      await this.anomalyDetector.updateBaseline(event.tenantId, event.actor.id, {
        action: event.action,
        timestamp: event.timestamp,
        ipAddress: event.actor.ipAddress,
        userAgent: event.actor.userAgent
      });
    }
  }

  async generateAlerts(event: AuditEvent): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    
    // Check for failed authentication attempts
    if (event.eventType === AuditEventType.AUTHENTICATION && event.outcome === AuditOutcome.FAILURE) {
      const recentFailures = await this.getRecentFailedAttempts(event.actor.id, '15m');
      if (recentFailures.length >= 5) {
        alerts.push({
          type: 'brute_force_attempt',
          severity: AuditSeverity.HIGH,
          actor: event.actor,
          description: `Multiple failed authentication attempts detected for user ${event.actor.id}`,
          eventCount: recentFailures.length,
          timeWindow: '15m'
        });
      }
    }
    
    // Check for privilege escalation
    if (event.eventType === AuditEventType.AUTHORIZATION && event.action === 'role_assignment') {
      const roleLevel = await this.getRoleLevel(event.details.roleId);
      const actorLevel = await this.getActorLevel(event.actor.id);
      
      if (roleLevel > actorLevel + 1) {
        alerts.push({
          type: 'privilege_escalation',
          severity: AuditSeverity.CRITICAL,
          actor: event.actor,
          target: event.target,
          description: 'Potential privilege escalation detected',
          details: { assignedRole: event.details.roleId, actorLevel, roleLevel }
        });
      }
    }
    
    // Check for unusual data access patterns
    if (event.eventType === AuditEventType.DATA_ACCESS) {
      const accessPattern = await this.analyzeAccessPattern(event.actor.id, event.target.id);
      if (accessPattern.isUnusual) {
        alerts.push({
          type: 'unusual_data_access',
          severity: AuditSeverity.MEDIUM,
          actor: event.actor,
          target: event.target,
          description: 'Unusual data access pattern detected',
          details: accessPattern.analysis
        });
      }
    }
    
    return alerts;
  }
}
```

### Compliance Reporting Engine

```typescript
interface ComplianceReportingEngine {
  generateSOXReport(tenantId: string, period: ReportingPeriod): Promise<SOXComplianceReport>;
  generateHIPAAReport(tenantId: string, period: ReportingPeriod): Promise<HIPAAComplianceReport>;
  generateGDPRReport(tenantId: string, period: ReportingPeriod): Promise<GDPRComplianceReport>;
  generatePCIDSSReport(tenantId: string, period: ReportingPeriod): Promise<PCIDSSComplianceReport>;
  generateCustomReport(tenantId: string, template: ReportTemplate): Promise<CustomComplianceReport>;
  scheduleReport(schedule: ReportSchedule): Promise<void>;
}

interface ComplianceReport {
  id: string;
  tenantId: string;
  reportType: ComplianceFramework;
  period: ReportingPeriod;
  generatedAt: Date;
  summary: ComplianceSummary;
  findings: ComplianceFinding[];
  recommendations: ComplianceRecommendation[];
  evidence: ComplianceEvidence[];
  signature: string;
}

class SOXComplianceReporter {
  async generateSOXReport(tenantId: string, period: ReportingPeriod): Promise<SOXComplianceReport> {
    const report: SOXComplianceReport = {
      id: this.generateReportId(),
      tenantId,
      reportType: ComplianceFramework.SOX,
      period,
      generatedAt: new Date(),
      summary: await this.generateSOXSummary(tenantId, period),
      findings: [],
      recommendations: [],
      evidence: []
    };
    
    // Check access controls
    const accessControlFindings = await this.auditAccessControls(tenantId, period);
    report.findings.push(...accessControlFindings);
    
    // Check segregation of duties
    const sodFindings = await this.auditSegregationOfDuties(tenantId, period);
    report.findings.push(...sodFindings);
    
    // Check change management
    const changeManagementFindings = await this.auditChangeManagement(tenantId, period);
    report.findings.push(...changeManagementFindings);
    
    // Check data integrity
    const dataIntegrityFindings = await this.auditDataIntegrity(tenantId, period);
    report.findings.push(...dataIntegrityFindings);
    
    // Generate recommendations
    report.recommendations = await this.generateSOXRecommendations(report.findings);
    
    // Collect evidence
    report.evidence = await this.collectSOXEvidence(tenantId, period);
    
    // Sign report
    report.signature = await this.signReport(report);
    
    return report;
  }

  private async auditAccessControls(tenantId: string, period: ReportingPeriod): Promise<ComplianceFinding[]> {
    const findings: ComplianceFinding[] = [];
    
    // Check for users with excessive privileges
    const excessivePrivileges = await this.findExcessivePrivileges(tenantId, period);
    if (excessivePrivileges.length > 0) {
      findings.push({
        id: this.generateFindingId(),
        type: 'excessive_privileges',
        severity: 'high',
        description: 'Users with excessive privileges identified',
        details: excessivePrivileges,
        recommendation: 'Review and reduce user privileges to minimum required',
        evidence: await this.collectPrivilegeEvidence(excessivePrivileges)
      });
    }
    
    // Check for dormant accounts with high privileges
    const dormantAccounts = await this.findDormantHighPrivilegeAccounts(tenantId, period);
    if (dormantAccounts.length > 0) {
      findings.push({
        id: this.generateFindingId(),
        type: 'dormant_privileged_accounts',
        severity: 'medium',
        description: 'Dormant accounts with high privileges found',
        details: dormantAccounts,
        recommendation: 'Disable or remove dormant high-privilege accounts',
        evidence: await this.collectDormantAccountEvidence(dormantAccounts)
      });
    }
    
    // Check for missing access reviews
    const missingReviews = await this.findMissingAccessReviews(tenantId, period);
    if (missingReviews.length > 0) {
      findings.push({
        id: this.generateFindingId(),
        type: 'missing_access_reviews',
        severity: 'medium',
        description: 'Required access reviews not completed',
        details: missingReviews,
        recommendation: 'Complete overdue access reviews and establish regular review schedule',
        evidence: await this.collectAccessReviewEvidence(missingReviews)
      });
    }
    
    return findings;
  }
}
```

## Implementation Patterns

### Event Capture Middleware

```typescript
class AuditMiddleware {
  async captureRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();
    
    // Capture request details
    const requestEvent: Partial<AuditEvent> = {
      id: requestId,
      tenantId: req.tenant?.id,
      timestamp: new Date(),
      eventType: this.determineEventType(req),
      category: AuditCategory.OPERATIONAL,
      severity: AuditSeverity.INFO,
      actor: {
        type: ActorType.USER,
        id: req.user?.id || 'anonymous',
        name: req.user?.name,
        email: req.user?.email,
        ipAddress: this.getClientIP(req),
        userAgent: req.get('User-Agent'),
        sessionId: req.sessionID
      },
      action: `${req.method} ${req.path}`,
      context: {
        requestId,
        method: req.method,
        path: req.path,
        query: this.sanitizeQuery(req.query),
        headers: this.sanitizeHeaders(req.headers)
      }
    };
    
    // Override response methods to capture response details
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(body) {
      requestEvent.outcome = res.statusCode < 400 ? AuditOutcome.SUCCESS : AuditOutcome.FAILURE;
      requestEvent.details = {
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        responseSize: Buffer.byteLength(body || '', 'utf8')
      };
      
      // Log the event
      auditEventManager.logEvent(requestEvent as AuditEvent);
      
      return originalSend.call(this, body);
    };
    
    res.json = function(obj) {
      requestEvent.outcome = res.statusCode < 400 ? AuditOutcome.SUCCESS : AuditOutcome.FAILURE;
      requestEvent.details = {
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        responseSize: Buffer.byteLength(JSON.stringify(obj), 'utf8')
      };
      
      // Log the event
      auditEventManager.logEvent(requestEvent as AuditEvent);
      
      return originalJson.call(this, obj);
    };
    
    next();
  }

  private determineEventType(req: Request): AuditEventType {
    if (req.path.includes('/auth')) {
      return AuditEventType.AUTHENTICATION;
    } else if (req.path.includes('/users') || req.path.includes('/roles')) {
      return AuditEventType.USER_MANAGEMENT;
    } else if (req.method === 'GET') {
      return AuditEventType.DATA_ACCESS;
    } else if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      return AuditEventType.DATA_MODIFICATION;
    } else {
      return AuditEventType.BUSINESS_PROCESS;
    }
  }
}
```

### Database Change Auditing

```typescript
class DatabaseAuditTrigger {
  async setupAuditTriggers(tableName: string, auditConfig: TableAuditConfig): Promise<void> {
    const triggerName = `audit_${tableName}`;
    
    // Create audit table if it doesn't exist
    await this.createAuditTable(tableName);
    
    // Create trigger function
    const triggerFunction = `
      CREATE OR REPLACE FUNCTION ${triggerName}_func()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO ${tableName}_audit (
          audit_id,
          table_name,
          operation,
          old_values,
          new_values,
          changed_by,
          changed_at,
          tenant_id,
          session_id,
          ip_address
        ) VALUES (
          gen_random_uuid(),
          '${tableName}',
          TG_OP,
          CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
          CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
          current_setting('app.current_user_id', true),
          NOW(),
          current_setting('app.current_tenant_id', true),
          current_setting('app.current_session_id', true),
          current_setting('app.current_ip_address', true)
        );
        
        RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    await this.database.query(triggerFunction);
    
    // Create triggers for INSERT, UPDATE, DELETE
    const operations = auditConfig.operations || ['INSERT', 'UPDATE', 'DELETE'];
    for (const operation of operations) {
      const triggerSQL = `
        CREATE TRIGGER ${triggerName}_${operation.toLowerCase()}
        AFTER ${operation} ON ${tableName}
        FOR EACH ROW
        EXECUTE FUNCTION ${triggerName}_func();
      `;
      
      await this.database.query(triggerSQL);
    }
  }

  private async createAuditTable(tableName: string): Promise<void> {
    const auditTableSQL = `
      CREATE TABLE IF NOT EXISTS ${tableName}_audit (
        audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        table_name VARCHAR(255) NOT NULL,
        operation VARCHAR(10) NOT NULL,
        old_values JSONB,
        new_values JSONB,
        changed_by VARCHAR(255),
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        tenant_id VARCHAR(255),
        session_id VARCHAR(255),
        ip_address INET,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_${tableName}_audit_tenant_id ON ${tableName}_audit(tenant_id);
      CREATE INDEX IF NOT EXISTS idx_${tableName}_audit_changed_at ON ${tableName}_audit(changed_at);
      CREATE INDEX IF NOT EXISTS idx_${tableName}_audit_changed_by ON ${tableName}_audit(changed_by);
    `;
    
    await this.database.query(auditTableSQL);
  }
}
```

### SIEM Integration

```typescript
interface SIEMIntegration {
  sendEvent(event: AuditEvent): Promise<void>;
  sendBulkEvents(events: AuditEvent[]): Promise<void>;
  queryEvents(query: SIEMQuery): Promise<SIEMEventResult>;
  createAlert(alert: SecurityAlert): Promise<void>;
  updateThreatIntelligence(indicators: ThreatIndicator[]): Promise<void>;
}

class SplunkSIEMIntegration implements SIEMIntegration {
  async sendEvent(event: AuditEvent): Promise<void> {
    const splunkEvent = this.transformToSplunkFormat(event);
    
    try {
      await this.splunkClient.sendEvent({
        index: this.config.index,
        sourcetype: 'audit_event',
        source: 'saas_application',
        event: splunkEvent,
        time: event.timestamp.getTime() / 1000
      });
    } catch (error) {
      // Fallback to local storage if SIEM is unavailable
      await this.fallbackStorage.store(event);
      throw new SIEMIntegrationError(`Failed to send event to Splunk: ${error.message}`);
    }
  }

  private transformToSplunkFormat(event: AuditEvent): any {
    return {
      event_id: event.id,
      tenant_id: event.tenantId,
      timestamp: event.timestamp.toISOString(),
      event_type: event.eventType,
      category: event.category,
      severity: event.severity,
      actor_type: event.actor.type,
      actor_id: event.actor.id,
      actor_name: event.actor.name,
      actor_email: event.actor.email,
      actor_ip: event.actor.ipAddress,
      target_type: event.target?.type,
      target_id: event.target?.id,
      action: event.action,
      outcome: event.outcome,
      details: JSON.stringify(event.details),
      context: JSON.stringify(event.context)
    };
  }
}
```

## Integration Points

### Workflow Integration

```typescript
interface AuditWorkflowIntegration {
  triggerWorkflow(event: AuditEvent, workflowType: WorkflowType): Promise<WorkflowExecution>;
  handleWorkflowCompletion(execution: WorkflowExecution): Promise<void>;
  getWorkflowStatus(executionId: string): Promise<WorkflowStatus>;
  cancelWorkflow(executionId: string): Promise<void>;
}

class ComplianceWorkflowManager {
  async handleHighRiskEvent(event: AuditEvent): Promise<void> {
    if (this.isHighRiskEvent(event)) {
      // Create incident
      const incident = await this.incidentManager.createIncident({
        title: `High-risk audit event: ${event.action}`,
        description: `High-risk event detected for user ${event.actor.name}`,
        severity: event.severity,
        category: 'security',
        assignee: await this.getSecurityTeamLead(event.tenantId),
        metadata: {
          auditEventId: event.id,
          tenantId: event.tenantId,
          actorId: event.actor.id
        }
      });
      
      // Trigger investigation workflow
      await this.workflowEngine.startWorkflow('security_investigation', {
        incidentId: incident.id,
        auditEventId: event.id,
        priority: this.calculatePriority(event),
        assignees: await this.getInvestigationTeam(event.tenantId)
      });
      
      // Send notifications
      await this.notificationService.sendSecurityAlert({
        type: 'high_risk_audit_event',
        event,
        incident,
        recipients: await this.getSecurityNotificationRecipients(event.tenantId)
      });
    }
  }

  private isHighRiskEvent(event: AuditEvent): boolean {
    const highRiskPatterns = [
      { eventType: AuditEventType.AUTHENTICATION, outcome: AuditOutcome.FAILURE, threshold: 5 },
      { eventType: AuditEventType.AUTHORIZATION, action: 'privilege_escalation' },
      { eventType: AuditEventType.DATA_ACCESS, severity: AuditSeverity.CRITICAL },
      { eventType: AuditEventType.SYSTEM_CONFIGURATION, action: 'security_setting_change' }
    ];
    
    return highRiskPatterns.some(pattern => this.matchesPattern(event, pattern));
  }
}
```

### Data Retention and Archival

```typescript
interface AuditDataRetentionManager {
  applyRetentionPolicy(tenantId: string, policy: RetentionPolicy): Promise<void>;
  archiveEvents(tenantId: string, cutoffDate: Date): Promise<ArchivalResult>;
  restoreArchivedEvents(tenantId: string, dateRange: DateRange): Promise<RestorationResult>;
  purgeExpiredEvents(tenantId: string): Promise<PurgeResult>;
  validateRetentionCompliance(tenantId: string): Promise<ComplianceValidationResult>;
}

interface RetentionPolicy {
  tenantId: string;
  eventTypes: AuditEventType[];
  retentionPeriod: RetentionPeriod;
  archivalStorage: ArchivalStorageConfig;
  purgeAfter: RetentionPeriod;
  complianceRequirements: ComplianceFramework[];
  exceptions: RetentionException[];
}

class ComplianceAwareRetentionManager implements AuditDataRetentionManager {
  async applyRetentionPolicy(tenantId: string, policy: RetentionPolicy): Promise<void> {
    // Validate policy against compliance requirements
    await this.validatePolicyCompliance(policy);
    
    // Schedule archival jobs
    const archivalDate = this.calculateArchivalDate(policy.retentionPeriod);
    await this.jobScheduler.scheduleJob('archive_audit_events', {
      tenantId,
      cutoffDate: archivalDate,
      policy
    });
    
    // Schedule purge jobs
    const purgeDate = this.calculatePurgeDate(policy.purgeAfter);
    await this.jobScheduler.scheduleJob('purge_audit_events', {
      tenantId,
      cutoffDate: purgeDate,
      policy
    });
    
    // Update retention metadata
    await this.retentionMetadataStore.updatePolicy(tenantId, policy);
  }

  async archiveEvents(tenantId: string, cutoffDate: Date): Promise<ArchivalResult> {
    const policy = await this.retentionMetadataStore.getPolicy(tenantId);
    const eventsToArchive = await this.auditStorage.queryEvents({
      tenantId,
      endDate: cutoffDate,
      eventTypes: policy.eventTypes
    });
    
    const archivalResult: ArchivalResult = {
      tenantId,
      archivalDate: new Date(),
      eventsProcessed: 0,
      eventsArchived: 0,
      errors: []
    };
    
    // Process events in batches
    const batchSize = 1000;
    for (let i = 0; i < eventsToArchive.length; i += batchSize) {
      const batch = eventsToArchive.slice(i, i + batchSize);
      
      try {
        // Compress and encrypt batch
        const compressedBatch = await this.compressionService.compress(batch);
        const encryptedBatch = await this.encryptionService.encrypt(compressedBatch, {
          keyId: `tenant:${tenantId}:archive`,
          algorithm: 'AES-256-GCM'
        });
        
        // Store in archival storage
        const archiveLocation = await this.archivalStorage.store(encryptedBatch, {
          tenantId,
          batchId: this.generateBatchId(),
          eventCount: batch.length,
          dateRange: {
            start: batch[0].timestamp,
            end: batch[batch.length - 1].timestamp
          }
        });
        
        // Update archival index
        await this.archivalIndex.addBatch({
          tenantId,
          location: archiveLocation,
          eventIds: batch.map(e => e.id),
          archivalDate: new Date()
        });
        
        // Remove from primary storage
        await this.auditStorage.deleteBatch(batch.map(e => e.id));
        
        archivalResult.eventsArchived += batch.length;
        
      } catch (error) {
        archivalResult.errors.push({
          batchStart: i,
          batchEnd: Math.min(i + batchSize, eventsToArchive.length),
          error: error.message
        });
      }
      
      archivalResult.eventsProcessed += batch.length;
    }
    
    return archivalResult;
  }
}
```

## Security Considerations

### Audit Log Protection

```typescript
interface AuditLogProtection {
  protectLogIntegrity(events: AuditEvent[]): Promise<void>;
  detectTampering(eventId: string): Promise<TamperingDetectionResult>;
  createIntegrityProof(tenantId: string, timeRange: DateRange): Promise<IntegrityProof>;
  validateIntegrityProof(proof: IntegrityProof): Promise<ValidationResult>;
}

class CryptographicAuditProtection implements AuditLogProtection {
  async protectLogIntegrity(events: AuditEvent[]): Promise<void> {
    // Create Merkle tree for batch integrity
    const merkleTree = await this.createMerkleTree(events);
    
    // Sign the root hash
    const signature = await this.cryptoService.sign(merkleTree.root, {
      keyId: 'audit-signing-key',
      algorithm: 'RSA-PSS'
    });
    
    // Store integrity metadata
    await this.integrityStore.store({
      batchId: this.generateBatchId(),
      eventIds: events.map(e => e.id),
      merkleRoot: merkleTree.root,
      signature,
      timestamp: new Date(),
      leafHashes: merkleTree.leaves
    });
    
    // Optional: Store on blockchain for immutable proof
    if (this.config.blockchainEnabled) {
      await this.blockchainService.recordHash(merkleTree.root, signature);
    }
  }

  async detectTampering(eventId: string): Promise<TamperingDetectionResult> {
    // Get stored event
    const storedEvent = await this.auditStorage.getEvent(eventId);
    if (!storedEvent) {
      return { isTampered: true, reason: 'Event not found' };
    }
    
    // Recompute event hash
    const computedHash = await this.computeEventHash(storedEvent);
    if (computedHash !== storedEvent.integrityHash) {
      return { 
        isTampered: true, 
        reason: 'Event hash mismatch',
        expectedHash: storedEvent.integrityHash,
        computedHash
      };
    }
    
    // Verify Merkle proof if available
    const integrityMetadata = await this.integrityStore.getByEventId(eventId);
    if (integrityMetadata) {
      const merkleProof = await this.generateMerkleProof(eventId, integrityMetadata);
      const isValidProof = await this.verifyMerkleProof(merkleProof, integrityMetadata.merkleRoot);
      
      if (!isValidProof) {
        return { 
          isTampered: true, 
          reason: 'Merkle proof validation failed' 
        };
      }
    }
    
    // Verify signature if available
    if (integrityMetadata?.signature) {
      const isValidSignature = await this.cryptoService.verify(
        integrityMetadata.merkleRoot,
        integrityMetadata.signature,
        { keyId: 'audit-signing-key' }
      );
      
      if (!isValidSignature) {
        return { 
          isTampered: true, 
          reason: 'Digital signature verification failed' 
        };
      }
    }
    
    return { isTampered: false };
  }
}
```

## Compliance Requirements

### Regulatory Framework Support

```typescript
interface RegulatoryComplianceManager {
  validateSOXCompliance(tenantId: string): Promise<SOXComplianceStatus>;
  validateHIPAACompliance(tenantId: string): Promise<HIPAAComplianceStatus>;
  validateGDPRCompliance(tenantId: string): Promise<GDPRComplianceStatus>;
  validatePCIDSSCompliance(tenantId: string): Promise<PCIDSSComplianceStatus>;
  generateComplianceEvidence(framework: ComplianceFramework, tenantId: string): Promise<ComplianceEvidence>;
}

class MultiFrameworkComplianceValidator {
  async validateSOXCompliance(tenantId: string): Promise<SOXComplianceStatus> {
    const requirements = [
      'access_controls_documented',
      'segregation_of_duties_enforced',
      'change_management_audited',
      'financial_data_integrity_verified',
      'audit_trails_complete',
      'access_reviews_conducted'
    ];
    
    const validationResults = await Promise.all(
      requirements.map(req => this.validateSOXRequirement(tenantId, req))
    );
    
    const passedRequirements = validationResults.filter(r => r.passed);
    const failedRequirements = validationResults.filter(r => !r.passed);
    
    return {
      tenantId,
      framework: ComplianceFramework.SOX,
      overallStatus: failedRequirements.length === 0 ? 'compliant' : 'non_compliant',
      passedRequirements: passedRequirements.length,
      totalRequirements: requirements.length,
      complianceScore: (passedRequirements.length / requirements.length) * 100,
      failedRequirements: failedRequirements.map(r => ({
        requirement: r.requirement,
        reason: r.reason,
        severity: r.severity,
        remediation: r.remediation
      })),
      lastValidated: new Date(),
      nextValidationDue: this.calculateNextValidationDate('SOX')
    };
  }

  private async validateSOXRequirement(tenantId: string, requirement: string): Promise<RequirementValidationResult> {
    switch (requirement) {
      case 'access_controls_documented':
        return await this.validateAccessControlsDocumentation(tenantId);
      
      case 'segregation_of_duties_enforced':
        return await this.validateSegregationOfDuties(tenantId);
      
      case 'audit_trails_complete':
        return await this.validateAuditTrailCompleteness(tenantId);
      
      default:
        throw new UnsupportedRequirementError(`Requirement ${requirement} not supported`);
    }
  }

  private async validateAuditTrailCompleteness(tenantId: string): Promise<RequirementValidationResult> {
    const requiredEventTypes = [
      AuditEventType.AUTHENTICATION,
      AuditEventType.AUTHORIZATION,
      AuditEventType.DATA_ACCESS,
      AuditEventType.DATA_MODIFICATION,
      AuditEventType.SYSTEM_CONFIGURATION
    ];
    
    const missingEventTypes = [];
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    for (const eventType of requiredEventTypes) {
      const eventCount = await this.auditStorage.countEvents({
        tenantId,
        eventType,
        startDate: last30Days
      });
      
      if (eventCount === 0) {
        missingEventTypes.push(eventType);
      }
    }
    
    return {
      requirement: 'audit_trails_complete',
      passed: missingEventTypes.length === 0,
      reason: missingEventTypes.length > 0 
        ? `Missing audit events for: ${missingEventTypes.join(', ')}`
        : 'All required audit event types present',
      severity: missingEventTypes.length > 0 ? 'high' : 'none',
      remediation: missingEventTypes.length > 0
        ? 'Ensure all system components are configured to generate audit events'
        : null
    };
  }
}
```

## Testing Considerations

### Audit System Testing

```typescript
// Audit event capture testing
describe('Audit Event Capture', () => {
  it('should capture all required fields for authentication events', async () => {
    const mockUser = await createTestUser();
    const authEvent = await simulateAuthentication(mockUser);
    
    const capturedEvent = await auditEventManager.getEventById(authEvent.id);
    
    expect(capturedEvent).toBeDefined();
    expect(capturedEvent.eventType).toBe(AuditEventType.AUTHENTICATION);
    expect(capturedEvent.actor.id).toBe(mockUser.id);
    expect(capturedEvent.timestamp).toBeInstanceOf(Date);
    expect(capturedEvent.outcome).toBeDefined();
    expect(capturedEvent.details).toBeDefined();
  });
  
  it('should maintain event integrity through storage and retrieval', async () => {
    const originalEvent = await createTestAuditEvent();
    await auditEventManager.logEvent(originalEvent);
    
    const retrievedEvent = await auditEventManager.getEventById(originalEvent.id);
    const integrityCheck = await auditStorage.verifyIntegrity(originalEvent.id);
    
    expect(integrityCheck.isValid).toBe(true);
    expect(retrievedEvent.integrityHash).toBeDefined();
    expect(retrievedEvent.integrityHash).toBe(originalEvent.integrityHash);
  });
});

// Compliance reporting testing
describe('Compliance Reporting', () => {
  it('should generate accurate SOX compliance reports', async () => {
    const tenant = await createTestTenant();
    await seedComplianceTestData(tenant.id);
    
    const report = await complianceReporter.generateSOXReport(tenant.id, {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    });
    
    expect(report.reportType).toBe(ComplianceFramework.SOX);
    expect(report.findings).toBeDefined();
    expect(report.evidence).toBeDefined();
    expect(report.signature).toBeDefined();
    
    // Verify report signature
    const signatureValid = await cryptoService.verify(
      report.signature,
      JSON.stringify(report),
      { keyId: 'compliance-signing-key' }
    );
    expect(signatureValid).toBe(true);
  });
});

// Performance testing
describe('Audit System Performance', () => {
  it('should handle high-volume event logging efficiently', async () => {
    const eventCount = 10000;
    const events = Array.from({ length: eventCount }, () => createTestAuditEvent());
    
    const startTime = Date.now();
    await auditEventManager.logBulkEvents(events);
    const duration = Date.now() - startTime;
    
    expect(duration).toBeLessThan(30000); // 30 seconds for 10k events
    
    // Verify all events were stored
    const storedCount = await auditStorage.countEvents({
      tenantId: events[0].tenantId,
      startDate: new Date(startTime)
    });
    expect(storedCount).toBe(eventCount);
  });
});
```

### Security Testing

- **Tampering detection testing**: Verify the system detects unauthorized modifications to audit logs
- **Integrity verification testing**: Test cryptographic integrity checks and Merkle tree validation
- **Access control testing**: Ensure only authorized users can access audit logs
- **Encryption testing**: Verify audit data is properly encrypted at rest and in transit
- **Retention policy testing**: Test automated archival and purge processes

This template provides a comprehensive foundation for implementing enterprise-grade audit trails with strong security, compliance support, and operational efficiency.
