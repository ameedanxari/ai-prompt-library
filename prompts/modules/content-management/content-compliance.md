# Content Compliance Template

## Purpose

This template provides comprehensive patterns for implementing content compliance systems, covering legal holds, data retention policies, regulatory compliance, content archival, and compliance reporting for content management platforms.

## Context

Content compliance is critical for organizations operating in regulated industries or handling sensitive data. A well-designed compliance system ensures content is retained according to legal requirements, supports legal discovery, maintains audit trails, and provides evidence of compliance. This template addresses the complexity of building compliance systems that meet diverse regulatory requirements while maintaining operational efficiency.

## Instructions

1. **Setup Retention Policies**: Configure content retention rules and schedules
2. **Implement Legal Holds**: Build legal hold management and enforcement
3. **Add Compliance Monitoring**: Enable continuous compliance monitoring and alerts
4. **Configure Archival System**: Implement compliant content archival and retrieval
5. **Enable Audit Trails**: Add comprehensive compliance audit logging
6. **Add Compliance Reporting**: Build regulatory reporting and evidence generation
7. **Test Compliance Controls**: Validate retention, holds, and audit functionality

## Examples

### Example 1: Compliance Management Service
```typescript
interface ComplianceService {
  applyRetentionPolicy(contentId: string, policyId: string): Promise<RetentionApplication>;
  createLegalHold(hold: LegalHoldRequest): Promise<LegalHold>;
  generateComplianceReport(reportType: string, dateRange: DateRange): Promise<ComplianceReport>;
  archiveContent(contentId: string, archiveConfig: ArchiveConfig): Promise<ArchivedContent>;
  checkCompliance(contentId: string): Promise<ComplianceStatus>;
}

const complianceService = new ComplianceService();
const hold = await complianceService.createLegalHold({
  name: 'Litigation Hold - Case 2024-001',
  description: 'Hold for pending litigation',
  custodians: ['user-123', 'user-456'],
  contentCriteria: { dateRange: { start: '2023-01-01', end: '2024-01-01' } }
});
```


### Example 2: Retention Policy Configuration
```typescript
interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  retentionPeriod: RetentionPeriod;
  contentTypes: string[];
  conditions: RetentionCondition[];
  actions: RetentionAction[];
}

const financialRecordsPolicy: RetentionPolicy = {
  id: 'fin-records-7yr',
  name: 'Financial Records - 7 Year Retention',
  description: 'Retain financial records for 7 years per SOX requirements',
  retentionPeriod: { duration: 7, unit: 'years' },
  contentTypes: ['financial_report', 'invoice', 'receipt'],
  conditions: [{ field: 'category', operator: 'equals', value: 'financial' }],
  actions: [
    { type: 'archive', timing: 'after_retention' },
    { type: 'delete', timing: 'after_archive', delay: { duration: 1, unit: 'years' } }
  ]
};
```

### Example 3: Legal Hold Management
```typescript
interface LegalHoldService {
  createHold(request: LegalHoldRequest): Promise<LegalHold>;
  addCustodians(holdId: string, custodians: string[]): Promise<void>;
  releaseHold(holdId: string, reason: string): Promise<void>;
  getHeldContent(holdId: string): Promise<HeldContent[]>;
  exportForDiscovery(holdId: string, format: ExportFormat): Promise<ExportResult>;
}

const holdService = new LegalHoldService();
await holdService.addCustodians('hold-123', ['user-789']);
const heldContent = await holdService.getHeldContent('hold-123');
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableRetentionPolicies | Enable content retention management | boolean | No | true |
| enableLegalHolds | Enable legal hold functionality | boolean | No | true |
| enableComplianceReporting | Enable compliance report generation | boolean | No | true |
| defaultRetentionDays | Default retention period in days | number | No | 365 |
| enableArchival | Enable content archival | boolean | No | true |
| archiveStorageClass | Storage class for archived content | string | No | "glacier" |
| enableAuditLogging | Enable compliance audit logging | boolean | No | true |
| complianceFrameworks | Supported compliance frameworks | string[] | No | ["GDPR", "SOX"] |

## Expected Output

This template will produce:
- **Retention Management**: Configurable retention policies and enforcement
- **Legal Hold System**: Legal hold creation, management, and release
- **Compliance Monitoring**: Continuous compliance status monitoring
- **Archival System**: Compliant content archival and retrieval
- **Audit Trail**: Comprehensive compliance audit logging
- **Compliance Reporting**: Regulatory report generation and evidence
- **Discovery Support**: Legal discovery export and search
- **Policy Enforcement**: Automated policy application and enforcement

## Implementation Patterns

### Retention Policy System

**Retention Data Model**
```typescript
interface RetentionPolicy {
  id: string;
  name: string;
  description: string;
  
  // Retention configuration
  retentionPeriod: RetentionPeriod;
  retentionStart: 'creation' | 'modification' | 'custom_field';
  customStartField?: string;
  
  // Applicability
  contentTypes: string[];
  categories: string[];
  conditions: RetentionCondition[];
  
  // Actions
  actions: RetentionAction[];
  
  // Compliance
  complianceFramework?: string;
  regulatoryReference?: string;
  
  // Status
  status: 'active' | 'inactive' | 'draft';
  priority: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

interface RetentionPeriod {
  duration: number;
  unit: 'days' | 'months' | 'years' | 'indefinite';
}

interface RetentionCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'in' | 'not_in';
  value: any;
}

interface RetentionAction {
  type: 'archive' | 'delete' | 'notify' | 'review' | 'export';
  timing: 'before_expiry' | 'at_expiry' | 'after_retention' | 'after_archive';
  delay?: RetentionPeriod;
  config?: Record<string, any>;
}

interface ContentRetention {
  contentId: string;
  policyId: string;
  
  // Dates
  retentionStartDate: Date;
  retentionEndDate: Date;
  
  // Status
  status: 'active' | 'expired' | 'held' | 'archived' | 'deleted';
  
  // Legal holds
  legalHolds: string[];
  
  // Actions taken
  actionsExecuted: ExecutedAction[];
  
  // Metadata
  appliedAt: Date;
  lastEvaluatedAt: Date;
}
```

**Retention Service Implementation**
```typescript
class RetentionService {
  async applyRetentionPolicy(contentId: string, policyId: string): Promise<ContentRetention> {
    const content = await this.contentRepository.findById(contentId);
    const policy = await this.policyRepository.findById(policyId);
    
    // Validate policy applicability
    if (!this.isPolicyApplicable(content, policy)) {
      throw new Error('Policy is not applicable to this content');
    }
    
    // Calculate retention dates
    const startDate = this.calculateRetentionStart(content, policy);
    const endDate = this.calculateRetentionEnd(startDate, policy.retentionPeriod);
    
    // Create retention record
    const retention: ContentRetention = {
      contentId,
      policyId,
      retentionStartDate: startDate,
      retentionEndDate: endDate,
      status: 'active',
      legalHolds: [],
      actionsExecuted: [],
      appliedAt: new Date(),
      lastEvaluatedAt: new Date()
    };
    
    await this.retentionRepository.save(retention);
    
    // Schedule retention actions
    await this.scheduleRetentionActions(retention, policy);
    
    // Log retention application
    await this.auditService.log({
      action: 'retention_applied',
      contentId,
      policyId,
      retentionEndDate: endDate,
      timestamp: new Date()
    });
    
    return retention;
  }

  async evaluateRetention(contentId: string): Promise<RetentionEvaluation> {
    const retention = await this.retentionRepository.findByContentId(contentId);
    
    if (!retention) {
      return { status: 'no_policy', canDelete: true };
    }
    
    // Check for legal holds
    if (retention.legalHolds.length > 0) {
      return {
        status: 'held',
        canDelete: false,
        reason: 'Content is under legal hold',
        holds: retention.legalHolds
      };
    }
    
    // Check retention period
    const now = new Date();
    if (now < retention.retentionEndDate) {
      return {
        status: 'active',
        canDelete: false,
        reason: 'Retention period has not expired',
        expiresAt: retention.retentionEndDate
      };
    }
    
    // Retention expired
    return {
      status: 'expired',
      canDelete: true,
      expiredAt: retention.retentionEndDate
    };
  }

  async processExpiredRetentions(): Promise<ProcessingResult> {
    const expiredRetentions = await this.retentionRepository.findExpired();
    const results: ProcessingResult = { processed: 0, errors: [] };
    
    for (const retention of expiredRetentions) {
      try {
        // Skip if under legal hold
        if (retention.legalHolds.length > 0) {
          continue;
        }
        
        const policy = await this.policyRepository.findById(retention.policyId);
        
        // Execute post-retention actions
        for (const action of policy.actions.filter(a => a.timing === 'after_retention')) {
          await this.executeRetentionAction(retention, action);
        }
        
        results.processed++;
      } catch (error) {
        results.errors.push({ contentId: retention.contentId, error: error.message });
      }
    }
    
    return results;
  }

  private async executeRetentionAction(
    retention: ContentRetention,
    action: RetentionAction
  ): Promise<void> {
    switch (action.type) {
      case 'archive':
        await this.archiveService.archiveContent(retention.contentId);
        break;
      case 'delete':
        await this.contentRepository.delete(retention.contentId);
        break;
      case 'notify':
        await this.notificationService.sendRetentionNotification(retention, action.config);
        break;
      case 'review':
        await this.createRetentionReviewTask(retention);
        break;
      case 'export':
        await this.exportService.exportContent(retention.contentId, action.config);
        break;
    }
    
    // Record action execution
    retention.actionsExecuted.push({
      actionType: action.type,
      executedAt: new Date(),
      success: true
    });
    
    await this.retentionRepository.save(retention);
  }
}
```


### Legal Hold System

**Legal Hold Implementation**
```typescript
interface LegalHold {
  id: string;
  name: string;
  description: string;
  
  // Case information
  caseNumber?: string;
  matterType: 'litigation' | 'investigation' | 'regulatory' | 'audit' | 'other';
  
  // Scope
  custodians: string[];
  contentCriteria: HoldCriteria;
  
  // Status
  status: 'active' | 'released' | 'expired';
  
  // Dates
  createdAt: Date;
  effectiveDate: Date;
  expirationDate?: Date;
  releasedAt?: Date;
  
  // Metadata
  createdBy: string;
  releasedBy?: string;
  releaseReason?: string;
  
  // Statistics
  contentCount: number;
  lastUpdatedAt: Date;
}

interface HoldCriteria {
  dateRange?: { start: Date; end: Date };
  contentTypes?: string[];
  categories?: string[];
  keywords?: string[];
  customFilters?: Record<string, any>;
}

class LegalHoldService {
  async createHold(request: LegalHoldRequest): Promise<LegalHold> {
    // Validate request
    this.validateHoldRequest(request);
    
    // Create hold
    const hold: LegalHold = {
      id: this.generateHoldId(),
      name: request.name,
      description: request.description,
      caseNumber: request.caseNumber,
      matterType: request.matterType,
      custodians: request.custodians,
      contentCriteria: request.contentCriteria,
      status: 'active',
      createdAt: new Date(),
      effectiveDate: request.effectiveDate || new Date(),
      expirationDate: request.expirationDate,
      createdBy: this.currentUser.id,
      contentCount: 0,
      lastUpdatedAt: new Date()
    };
    
    await this.holdRepository.save(hold);
    
    // Apply hold to matching content
    const affectedContent = await this.applyHoldToContent(hold);
    hold.contentCount = affectedContent.length;
    await this.holdRepository.save(hold);
    
    // Notify custodians
    await this.notifyCustodians(hold);
    
    // Log hold creation
    await this.auditService.log({
      action: 'legal_hold_created',
      holdId: hold.id,
      custodians: hold.custodians,
      contentCount: hold.contentCount,
      timestamp: new Date()
    });
    
    return hold;
  }

  async applyHoldToContent(hold: LegalHold): Promise<string[]> {
    const affectedContentIds: string[] = [];
    
    // Find content matching criteria
    const matchingContent = await this.findMatchingContent(hold);
    
    for (const content of matchingContent) {
      // Get or create retention record
      let retention = await this.retentionRepository.findByContentId(content.id);
      
      if (!retention) {
        // Create retention record with hold
        retention = {
          contentId: content.id,
          policyId: 'legal_hold',
          retentionStartDate: new Date(),
          retentionEndDate: new Date('9999-12-31'), // Indefinite
          status: 'held',
          legalHolds: [hold.id],
          actionsExecuted: [],
          appliedAt: new Date(),
          lastEvaluatedAt: new Date()
        };
      } else {
        // Add hold to existing retention
        if (!retention.legalHolds.includes(hold.id)) {
          retention.legalHolds.push(hold.id);
          retention.status = 'held';
        }
      }
      
      await this.retentionRepository.save(retention);
      affectedContentIds.push(content.id);
      
      // Prevent deletion
      await this.contentRepository.setDeletionLock(content.id, true);
    }
    
    return affectedContentIds;
  }

  async releaseHold(holdId: string, reason: string): Promise<void> {
    const hold = await this.holdRepository.findById(holdId);
    
    if (hold.status !== 'active') {
      throw new Error('Hold is not active');
    }
    
    // Update hold status
    hold.status = 'released';
    hold.releasedAt = new Date();
    hold.releasedBy = this.currentUser.id;
    hold.releaseReason = reason;
    
    await this.holdRepository.save(hold);
    
    // Remove hold from affected content
    await this.removeHoldFromContent(hold);
    
    // Notify custodians
    await this.notifyHoldRelease(hold);
    
    // Log hold release
    await this.auditService.log({
      action: 'legal_hold_released',
      holdId: hold.id,
      reason,
      releasedBy: this.currentUser.id,
      timestamp: new Date()
    });
  }

  async exportForDiscovery(holdId: string, format: ExportFormat): Promise<ExportResult> {
    const hold = await this.holdRepository.findById(holdId);
    const heldContent = await this.getHeldContent(holdId);
    
    // Create export package
    const exportPackage = {
      holdInfo: hold,
      contentManifest: [],
      exportedAt: new Date(),
      format
    };
    
    // Export each piece of content
    for (const content of heldContent) {
      const exportedContent = await this.exportContent(content, format);
      exportPackage.contentManifest.push({
        contentId: content.id,
        title: content.title,
        exportPath: exportedContent.path,
        metadata: content.metadata,
        hash: exportedContent.hash
      });
    }
    
    // Generate manifest and chain of custody
    const manifest = await this.generateExportManifest(exportPackage);
    const chainOfCustody = await this.generateChainOfCustody(hold, exportPackage);
    
    // Log export
    await this.auditService.log({
      action: 'discovery_export',
      holdId,
      contentCount: heldContent.length,
      format,
      exportedBy: this.currentUser.id,
      timestamp: new Date()
    });
    
    return {
      exportId: this.generateExportId(),
      holdId,
      contentCount: heldContent.length,
      manifest,
      chainOfCustody,
      downloadUrl: await this.generateSecureDownloadUrl(exportPackage)
    };
  }

  private async findMatchingContent(hold: LegalHold): Promise<Content[]> {
    const query: ContentQuery = {};
    
    // Filter by custodians
    if (hold.custodians.length > 0) {
      query.authorIds = hold.custodians;
    }
    
    // Filter by date range
    if (hold.contentCriteria.dateRange) {
      query.createdAfter = hold.contentCriteria.dateRange.start;
      query.createdBefore = hold.contentCriteria.dateRange.end;
    }
    
    // Filter by content types
    if (hold.contentCriteria.contentTypes) {
      query.contentTypes = hold.contentCriteria.contentTypes;
    }
    
    // Filter by keywords
    if (hold.contentCriteria.keywords) {
      query.keywords = hold.contentCriteria.keywords;
    }
    
    return this.contentRepository.search(query);
  }
}
```

### Compliance Reporting

**Report Generation**
```typescript
interface ComplianceReportService {
  generateReport(reportType: ReportType, config: ReportConfig): Promise<ComplianceReport>;
  scheduleReport(schedule: ReportSchedule): Promise<ScheduledReport>;
  getReportHistory(reportType: ReportType): Promise<ReportHistory>;
}

type ReportType = 
  | 'retention_summary'
  | 'legal_hold_status'
  | 'deletion_audit'
  | 'access_audit'
  | 'compliance_status'
  | 'regulatory_evidence';

interface ComplianceReport {
  id: string;
  type: ReportType;
  title: string;
  
  // Report period
  periodStart: Date;
  periodEnd: Date;
  
  // Content
  summary: ReportSummary;
  details: ReportDetail[];
  charts?: ReportChart[];
  
  // Metadata
  generatedAt: Date;
  generatedBy: string;
  format: 'pdf' | 'csv' | 'json' | 'html';
  
  // Compliance
  complianceFramework?: string;
  attestation?: string;
}

class ComplianceReportService {
  async generateReport(reportType: ReportType, config: ReportConfig): Promise<ComplianceReport> {
    const reportGenerator = this.getReportGenerator(reportType);
    
    // Gather data
    const data = await reportGenerator.gatherData(config);
    
    // Generate report content
    const report: ComplianceReport = {
      id: this.generateReportId(),
      type: reportType,
      title: this.getReportTitle(reportType),
      periodStart: config.dateRange.start,
      periodEnd: config.dateRange.end,
      summary: await reportGenerator.generateSummary(data),
      details: await reportGenerator.generateDetails(data),
      charts: await reportGenerator.generateCharts(data),
      generatedAt: new Date(),
      generatedBy: this.currentUser.id,
      format: config.format || 'pdf',
      complianceFramework: config.complianceFramework
    };
    
    // Add attestation if required
    if (config.includeAttestation) {
      report.attestation = await this.generateAttestation(report);
    }
    
    // Store report
    await this.reportRepository.save(report);
    
    // Log report generation
    await this.auditService.log({
      action: 'compliance_report_generated',
      reportId: report.id,
      reportType,
      timestamp: new Date()
    });
    
    return report;
  }

  private async generateRetentionSummaryReport(config: ReportConfig): Promise<ReportData> {
    const retentions = await this.retentionRepository.findByDateRange(
      config.dateRange.start,
      config.dateRange.end
    );
    
    return {
      summary: {
        totalContent: retentions.length,
        activeRetentions: retentions.filter(r => r.status === 'active').length,
        expiredRetentions: retentions.filter(r => r.status === 'expired').length,
        heldContent: retentions.filter(r => r.legalHolds.length > 0).length,
        archivedContent: retentions.filter(r => r.status === 'archived').length,
        deletedContent: retentions.filter(r => r.status === 'deleted').length
      },
      details: retentions.map(r => ({
        contentId: r.contentId,
        policyId: r.policyId,
        status: r.status,
        retentionEndDate: r.retentionEndDate,
        legalHolds: r.legalHolds
      })),
      byPolicy: this.groupByPolicy(retentions),
      byStatus: this.groupByStatus(retentions)
    };
  }
}
```

### Integration Points

**External Compliance Integration**
```typescript
interface ComplianceIntegration {
  syncWithEDiscovery(platform: string, config: EDiscoveryConfig): Promise<SyncResult>;
  exportToArchiveSystem(contentIds: string[], archiveConfig: ArchiveConfig): Promise<ExportResult>;
  submitRegulatoryReport(report: ComplianceReport, regulator: string): Promise<SubmissionResult>;
}

class ComplianceIntegrationService implements ComplianceIntegration {
  async syncWithEDiscovery(platform: string, config: EDiscoveryConfig): Promise<SyncResult> {
    const connector = this.getEDiscoveryConnector(platform);
    
    // Get legal holds to sync
    const holds = await this.holdRepository.findActive();
    
    for (const hold of holds) {
      const heldContent = await this.legalHoldService.getHeldContent(hold.id);
      
      // Sync to eDiscovery platform
      await connector.syncMatter({
        matterId: hold.caseNumber || hold.id,
        matterName: hold.name,
        custodians: hold.custodians,
        documents: heldContent.map(c => ({
          id: c.id,
          title: c.title,
          content: c.body,
          metadata: c.metadata,
          createdAt: c.createdAt
        }))
      });
    }
    
    return { synced: holds.length, timestamp: new Date() };
  }
}
```

### Security Considerations

**Compliance Security**
```typescript
interface ComplianceSecurityService {
  validateComplianceAccess(userId: string, action: string): Promise<boolean>;
  auditComplianceAction(action: ComplianceAuditEntry): Promise<void>;
  encryptComplianceData(data: any): Promise<EncryptedData>;
}

class ComplianceSecurity implements ComplianceSecurityService {
  async validateComplianceAccess(userId: string, action: string): Promise<boolean> {
    const user = await this.userService.getUser(userId);
    
    // Check compliance role
    const complianceRoles = ['compliance_officer', 'legal_counsel', 'admin'];
    if (!complianceRoles.includes(user.role)) {
      return false;
    }
    
    // Check specific action permissions
    const actionPermissions = {
      'create_hold': ['compliance_officer', 'legal_counsel'],
      'release_hold': ['compliance_officer', 'legal_counsel'],
      'export_discovery': ['legal_counsel'],
      'generate_report': ['compliance_officer', 'legal_counsel', 'admin'],
      'modify_retention': ['compliance_officer', 'admin']
    };
    
    return actionPermissions[action]?.includes(user.role) || false;
  }
}
```

### Testing Considerations

**Compliance Testing**
```typescript
describe('ComplianceService', () => {
  describe('retention policies', () => {
    it('should apply retention policy correctly', async () => {
      const retention = await complianceService.applyRetentionPolicy('content-1', 'policy-7yr');
      
      expect(retention.status).toBe('active');
      expect(retention.retentionEndDate).toBeDefined();
    });

    it('should prevent deletion during retention period', async () => {
      await complianceService.applyRetentionPolicy('content-1', 'policy-7yr');
      
      const evaluation = await complianceService.evaluateRetention('content-1');
      
      expect(evaluation.canDelete).toBe(false);
    });
  });

  describe('legal holds', () => {
    it('should prevent deletion when under legal hold', async () => {
      await legalHoldService.createHold({
        name: 'Test Hold',
        custodians: ['user-1'],
        contentCriteria: {}
      });
      
      const evaluation = await complianceService.evaluateRetention('content-1');
      
      expect(evaluation.status).toBe('held');
      expect(evaluation.canDelete).toBe(false);
    });
  });
});
```

## Real-World Considerations

**Regulatory Compliance**
- Support multiple compliance frameworks (GDPR, SOX, HIPAA, etc.)
- Implement jurisdiction-specific retention rules
- Maintain evidence of compliance for audits
- Support regulatory reporting requirements

**Legal Discovery**
- Enable efficient content search and collection
- Maintain chain of custody documentation
- Support various export formats for legal review
- Implement defensible deletion processes

**Data Governance**
- Integrate with enterprise data governance programs
- Support data classification and labeling
- Implement data lineage tracking
- Enable cross-system compliance coordination

**Scalability**
- Handle large-scale retention policy application
- Support efficient legal hold processing
- Optimize compliance report generation
- Implement incremental compliance checks

This template provides a comprehensive foundation for implementing robust content compliance systems that meet regulatory requirements while supporting efficient legal discovery and maintaining complete audit trails.
