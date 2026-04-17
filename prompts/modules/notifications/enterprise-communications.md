# Enterprise Communications Template

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

This template provides comprehensive patterns for implementing enterprise-grade communication features including approval workflows, compliance reporting, brand management, and team collaboration. It enables organizations to maintain control, consistency, and compliance across all communication channels while supporting complex organizational structures.

## Context

Enterprise communication systems require sophisticated governance, approval processes, and brand consistency that go beyond standard notification systems. This template addresses the challenges of implementing multi-level approval workflows for communications, maintaining brand consistency across all channels, ensuring regulatory compliance and audit trails, and supporting complex organizational hierarchies and team collaboration.

## Core Components

### Approval Workflow Service

## Examples

```typescript
interface ApprovalWorkflowService {
  // Workflow management
  createWorkflow(workflow: ApprovalWorkflowDefinition): Promise<string>;
  updateWorkflow(workflowId: string, updates: Partial<ApprovalWorkflowDefinition>): Promise<void>;
  deleteWorkflow(workflowId: string): Promise<void>;
  
  // Approval requests
  submitForApproval(request: ApprovalRequest): Promise<string>;
  approve(requestId: string, approverId: string, comments?: string): Promise<void>;
  reject(requestId: string, approverId: string, reason: string): Promise<void>;
  requestChanges(requestId: string, approverId: string, changes: ChangeRequest[]): Promise<void>;
  
  // Workflow status
  getApprovalStatus(requestId: string): Promise<ApprovalStatus>;
  getPendingApprovals(approverId: string): Promise<ApprovalRequest[]>;
}

interface ApprovalWorkflowDefinition {
  id: string;
  name: string;
  description: string;
  triggerConditions: WorkflowTriggerCondition[];
  stages: ApprovalStage[];
  escalationRules: EscalationRule[];
  settings: WorkflowSettings;
  enabled: boolean;
}

interface ApprovalStage {
  id: string;
  name: string;
  order: number;
  approvers: ApproverConfig;
  requiredApprovals: number;
  timeout?: number;
  autoApproveConditions?: AutoApproveCondition[];
}

interface ApproverConfig {
  type: ApproverType;
  userIds?: string[];
  roleIds?: string[];
  groupIds?: string[];
  dynamicResolver?: string;
}

enum ApproverType {
  SPECIFIC_USERS = 'specific_users',
  ROLE = 'role',
  GROUP = 'group',
  MANAGER = 'manager',
  DYNAMIC = 'dynamic'
}

interface ApprovalRequest {
  id: string;
  workflowId: string;
  contentType: ContentType;
  content: CommunicationContent;
  submittedBy: string;
  submittedAt: Date;
  currentStage: string;
  status: ApprovalRequestStatus;
  history: ApprovalAction[];
}

enum ApprovalRequestStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CHANGES_REQUESTED = 'changes_requested',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

interface ApprovalAction {
  stageId: string;
  approverId: string;
  action: 'approved' | 'rejected' | 'changes_requested';
  comments?: string;
  timestamp: Date;
}

interface EscalationRule {
  triggerAfter: number; // Hours
  escalateTo: ApproverConfig;
  notifyOriginalApprovers: boolean;
  maxEscalations: number;
}
```

### Brand Management Service

```typescript
interface BrandManagementService {
  // Brand configuration
  createBrandConfig(config: BrandConfiguration): Promise<string>;
  updateBrandConfig(brandId: string, updates: Partial<BrandConfiguration>): Promise<void>;
  getBrandConfig(brandId: string): Promise<BrandConfiguration>;
  
  // Brand application
  applyBranding(content: CommunicationContent, brandId: string): Promise<BrandedContent>;
  validateBranding(content: CommunicationContent, brandId: string): Promise<BrandValidationResult>;
  
  // Template management
  createBrandedTemplate(template: BrandedTemplate): Promise<string>;
  getBrandedTemplates(brandId: string): Promise<BrandedTemplate[]>;
}

interface BrandConfiguration {
  id: string;
  name: string;
  organizationId: string;
  
  // Visual identity
  logo: LogoConfig;
  colors: ColorPalette;
  typography: TypographyConfig;
  
  // Voice and tone
  voiceGuidelines: VoiceGuidelines;
  
  // Channel-specific branding
  emailBranding: EmailBrandingConfig;
  pushBranding: PushBrandingConfig;
  smsBranding: SMSBrandingConfig;
  
  // Compliance
  legalFooter: string;
  disclaimers: Disclaimer[];
  
  // Restrictions
  prohibitedContent: string[];
  requiredElements: RequiredElement[];
}

interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  link: string;
  error: string;
  success: string;
}

interface TypographyConfig {
  primaryFont: string;
  secondaryFont: string;
  headingStyles: HeadingStyle[];
  bodyStyle: TextStyle;
  linkStyle: TextStyle;
}

interface VoiceGuidelines {
  tone: string[];
  vocabulary: VocabularyGuidelines;
  writingStyle: WritingStyleGuidelines;
  examples: VoiceExample[];
}

interface EmailBrandingConfig {
  headerTemplate: string;
  footerTemplate: string;
  defaultFromName: string;
  defaultFromEmail: string;
  replyToEmail?: string;
  socialLinks?: SocialLink[];
  unsubscribeText: string;
}

interface BrandValidationResult {
  valid: boolean;
  issues: BrandIssue[];
  suggestions: string[];
  score: number;
}

interface BrandIssue {
  type: BrandIssueType;
  severity: 'error' | 'warning' | 'info';
  message: string;
  location?: string;
  suggestion?: string;
}

enum BrandIssueType {
  COLOR_VIOLATION = 'color_violation',
  FONT_VIOLATION = 'font_violation',
  LOGO_MISUSE = 'logo_misuse',
  TONE_VIOLATION = 'tone_violation',
  MISSING_REQUIRED_ELEMENT = 'missing_required_element',
  PROHIBITED_CONTENT = 'prohibited_content'
}
```

### Compliance Reporting Service

```typescript
interface ComplianceReportingService {
  // Report generation
  generateComplianceReport(config: ComplianceReportConfig): Promise<ComplianceReport>;
  scheduleReport(config: ScheduledReportConfig): Promise<string>;
  
  // Audit trail
  getAuditTrail(filters: AuditFilters): Promise<AuditEntry[]>;
  exportAuditTrail(filters: AuditFilters, format: ExportFormat): Promise<ExportResult>;
  
  // Compliance monitoring
  getComplianceStatus(): Promise<ComplianceStatus>;
  getComplianceAlerts(): Promise<ComplianceAlert[]>;
  acknowledgeAlert(alertId: string, userId: string): Promise<void>;
}

interface ComplianceReportConfig {
  reportType: ComplianceReportType;
  timeRange: TimeRange;
  regulations: string[];
  includeDetails: boolean;
  format: ReportFormat;
}

enum ComplianceReportType {
  CONSENT_AUDIT = 'consent_audit',
  COMMUNICATION_LOG = 'communication_log',
  OPT_OUT_REPORT = 'opt_out_report',
  DATA_ACCESS_LOG = 'data_access_log',
  APPROVAL_AUDIT = 'approval_audit',
  BRAND_COMPLIANCE = 'brand_compliance'
}

interface ComplianceReport {
  id: string;
  type: ComplianceReportType;
  generatedAt: Date;
  timeRange: TimeRange;
  summary: ComplianceSummary;
  details: ComplianceDetail[];
  recommendations: string[];
}

interface ComplianceSummary {
  totalCommunications: number;
  compliantCommunications: number;
  complianceRate: number;
  issuesByCategory: Record<string, number>;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ComplianceStatus {
  overallStatus: 'compliant' | 'at_risk' | 'non_compliant';
  regulationStatus: Record<string, RegulationStatus>;
  lastAuditDate: Date;
  nextAuditDate: Date;
  openIssues: number;
}

interface RegulationStatus {
  regulation: string;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  lastChecked: Date;
  issues: ComplianceIssue[];
}

interface ComplianceAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  regulation?: string;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}
```

### Team Collaboration Service

```typescript
interface TeamCollaborationService {
  // Team management
  createTeam(team: TeamDefinition): Promise<string>;
  updateTeam(teamId: string, updates: Partial<TeamDefinition>): Promise<void>;
  addTeamMember(teamId: string, userId: string, role: TeamRole): Promise<void>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;
  
  // Collaboration features
  shareContent(contentId: string, teamId: string, permissions: ContentPermissions): Promise<void>;
  requestReview(contentId: string, reviewers: string[]): Promise<string>;
  addComment(contentId: string, comment: ContentComment): Promise<string>;
  
  // Activity tracking
  getTeamActivity(teamId: string, options?: ActivityOptions): Promise<TeamActivity[]>;
  getContentHistory(contentId: string): Promise<ContentHistory>;
}

interface TeamDefinition {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  members: TeamMember[];
  settings: TeamSettings;
  permissions: TeamPermissions;
}

interface TeamMember {
  userId: string;
  role: TeamRole;
  joinedAt: Date;
  permissions: MemberPermissions;
}

enum TeamRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  EDITOR = 'editor',
  REVIEWER = 'reviewer',
  VIEWER = 'viewer'
}

interface TeamPermissions {
  canCreateContent: TeamRole[];
  canEditContent: TeamRole[];
  canApproveContent: TeamRole[];
  canPublishContent: TeamRole[];
  canManageTeam: TeamRole[];
  canViewAnalytics: TeamRole[];
}

interface ContentComment {
  id: string;
  contentId: string;
  userId: string;
  text: string;
  parentId?: string;
  mentions?: string[];
  attachments?: Attachment[];
  createdAt: Date;
  updatedAt?: Date;
  resolved: boolean;
}

interface ContentHistory {
  contentId: string;
  versions: ContentVersion[];
  comments: ContentComment[];
  approvals: ApprovalAction[];
}

interface ContentVersion {
  versionId: string;
  content: CommunicationContent;
  createdBy: string;
  createdAt: Date;
  changeDescription?: string;
  diff?: ContentDiff;
}
```

## Implementation Patterns

### Multi-Stage Approval Engine

```typescript
class MultiStageApprovalEngine {
  private workflowService: ApprovalWorkflowService;
  private notificationService: NotificationService;
  private userService: UserService;

  async submitForApproval(content: CommunicationContent, submitterId: string): Promise<string> {
    // Determine applicable workflow
    const workflow = await this.findApplicableWorkflow(content);
    if (!workflow) {
      throw new Error('No approval workflow configured for this content type');
    }

    // Create approval request
    const request: ApprovalRequest = {
      id: generateRequestId(),
      workflowId: workflow.id,
      contentType: content.type,
      content,
      submittedBy: submitterId,
      submittedAt: new Date(),
      currentStage: workflow.stages[0].id,
      status: ApprovalRequestStatus.PENDING,
      history: []
    };

    await this.saveRequest(request);

    // Notify first stage approvers
    await this.notifyApprovers(request, workflow.stages[0]);

    // Schedule escalation if configured
    if (workflow.escalationRules.length > 0) {
      await this.scheduleEscalation(request, workflow.escalationRules[0]);
    }

    return request.id;
  }

  async processApproval(requestId: string, approverId: string, decision: ApprovalDecision): Promise<void> {
    const request = await this.getRequest(requestId);
    const workflow = await this.workflowService.getWorkflow(request.workflowId);
    const currentStage = this.getStage(workflow, request.currentStage);

    // Validate approver
    if (!await this.isValidApprover(approverId, currentStage)) {
      throw new Error('User is not authorized to approve this request');
    }

    // Record the action
    request.history.push({
      stageId: currentStage.id,
      approverId,
      action: decision.action,
      comments: decision.comments,
      timestamp: new Date()
    });

    // Process based on decision
    switch (decision.action) {
      case 'approved':
        await this.handleApproval(request, workflow, currentStage);
        break;
      case 'rejected':
        await this.handleRejection(request, decision.reason!);
        break;
      case 'changes_requested':
        await this.handleChangesRequested(request, decision.changes!);
        break;
    }

    await this.saveRequest(request);
  }

  private async handleApproval(
    request: ApprovalRequest,
    workflow: ApprovalWorkflowDefinition,
    currentStage: ApprovalStage
  ): Promise<void> {
    // Check if stage is complete
    const stageApprovals = request.history.filter(
      h => h.stageId === currentStage.id && h.action === 'approved'
    );

    if (stageApprovals.length >= currentStage.requiredApprovals) {
      // Move to next stage or complete
      const nextStage = this.getNextStage(workflow, currentStage.id);
      
      if (nextStage) {
        request.currentStage = nextStage.id;
        request.status = ApprovalRequestStatus.IN_REVIEW;
        await this.notifyApprovers(request, nextStage);
      } else {
        request.status = ApprovalRequestStatus.APPROVED;
        await this.notifySubmitter(request, 'approved');
        await this.publishContent(request);
      }
    }
  }

  private async notifyApprovers(request: ApprovalRequest, stage: ApprovalStage): Promise<void> {
    const approvers = await this.resolveApprovers(stage.approvers);
    
    for (const approver of approvers) {
      await this.notificationService.send({
        userId: approver.id,
        type: 'approval_request',
        content: {
          title: 'Approval Required',
          body: `A ${request.contentType} requires your approval`,
          data: {
            requestId: request.id,
            contentType: request.contentType,
            submittedBy: request.submittedBy
          }
        },
        channels: [ChannelType.EMAIL, ChannelType.IN_APP]
      });
    }
  }
}
```

### Brand Enforcement Engine

```typescript
class BrandEnforcementEngine {
  private brandService: BrandManagementService;
  private contentAnalyzer: ContentAnalyzer;

  async validateAndApplyBranding(
    content: CommunicationContent,
    brandId: string
  ): Promise<BrandedContent> {
    const brandConfig = await this.brandService.getBrandConfig(brandId);
    
    // Validate content against brand guidelines
    const validation = await this.validateContent(content, brandConfig);
    
    if (!validation.valid && validation.issues.some(i => i.severity === 'error')) {
      throw new BrandValidationError(validation.issues);
    }

    // Apply branding
    const brandedContent = await this.applyBranding(content, brandConfig);
    
    // Add required elements
    brandedContent = await this.addRequiredElements(brandedContent, brandConfig);
    
    return brandedContent;
  }

  private async validateContent(
    content: CommunicationContent,
    brandConfig: BrandConfiguration
  ): Promise<BrandValidationResult> {
    const issues: BrandIssue[] = [];

    // Check for prohibited content
    for (const prohibited of brandConfig.prohibitedContent) {
      if (this.contentContains(content, prohibited)) {
        issues.push({
          type: BrandIssueType.PROHIBITED_CONTENT,
          severity: 'error',
          message: `Content contains prohibited term: ${prohibited}`,
          suggestion: 'Remove or replace the prohibited content'
        });
      }
    }

    // Check required elements
    for (const required of brandConfig.requiredElements) {
      if (!this.hasRequiredElement(content, required)) {
        issues.push({
          type: BrandIssueType.MISSING_REQUIRED_ELEMENT,
          severity: required.mandatory ? 'error' : 'warning',
          message: `Missing required element: ${required.name}`,
          suggestion: `Add ${required.name} to the content`
        });
      }
    }

    // Analyze tone and voice
    const toneAnalysis = await this.contentAnalyzer.analyzeTone(content.body);
    if (!this.matchesVoiceGuidelines(toneAnalysis, brandConfig.voiceGuidelines)) {
      issues.push({
        type: BrandIssueType.TONE_VIOLATION,
        severity: 'warning',
        message: 'Content tone does not match brand voice guidelines',
        suggestion: 'Adjust the tone to be more ' + brandConfig.voiceGuidelines.tone.join(', ')
      });
    }

    // Check colors if HTML content
    if (content.html) {
      const colorIssues = this.validateColors(content.html, brandConfig.colors);
      issues.push(...colorIssues);
    }

    const score = this.calculateComplianceScore(issues);

    return {
      valid: !issues.some(i => i.severity === 'error'),
      issues,
      suggestions: this.generateSuggestions(issues),
      score
    };
  }

  private async applyBranding(
    content: CommunicationContent,
    brandConfig: BrandConfiguration
  ): Promise<BrandedContent> {
    const branded: BrandedContent = { ...content };

    // Apply email branding
    if (content.channel === ChannelType.EMAIL) {
      branded.html = this.applyEmailBranding(content.html!, brandConfig.emailBranding);
      branded.from = {
        name: brandConfig.emailBranding.defaultFromName,
        email: brandConfig.emailBranding.defaultFromEmail
      };
    }

    // Apply push branding
    if (content.channel === ChannelType.PUSH) {
      branded.icon = brandConfig.pushBranding.defaultIcon;
      branded.badge = brandConfig.pushBranding.badge;
    }

    // Add legal footer
    branded.footer = brandConfig.legalFooter;

    // Add disclaimers
    branded.disclaimers = brandConfig.disclaimers;

    return branded;
  }

  private applyEmailBranding(html: string, emailBranding: EmailBrandingConfig): string {
    // Wrap content with header and footer templates
    return `
      ${emailBranding.headerTemplate}
      ${html}
      ${emailBranding.footerTemplate}
    `;
  }
}
```

### Compliance Monitoring System

```typescript
class ComplianceMonitoringSystem {
  private reportingService: ComplianceReportingService;
  private alertService: AlertService;
  private auditLogger: AuditLogger;

  async monitorCompliance(): Promise<void> {
    // Check all regulations
    const regulations = await this.getActiveRegulations();
    
    for (const regulation of regulations) {
      const status = await this.checkRegulationCompliance(regulation);
      
      if (status.status !== 'compliant') {
        await this.handleComplianceIssue(regulation, status);
      }
    }
  }

  private async checkRegulationCompliance(regulation: Regulation): Promise<RegulationStatus> {
    const checks: ComplianceCheck[] = [];

    switch (regulation.type) {
      case 'GDPR':
        checks.push(
          await this.checkConsentCompliance(),
          await this.checkDataRetention(),
          await this.checkOptOutProcessing()
        );
        break;
      case 'CAN-SPAM':
        checks.push(
          await this.checkUnsubscribeLinks(),
          await this.checkPhysicalAddress(),
          await this.checkSenderIdentification()
        );
        break;
      case 'TCPA':
        checks.push(
          await this.checkSMSConsent(),
          await this.checkQuietHours(),
          await this.checkOptOutInstructions()
        );
        break;
    }

    const issues = checks.filter(c => !c.passed).map(c => c.issue!);
    const status = issues.length === 0 ? 'compliant' : 
                   issues.some(i => i.severity === 'critical') ? 'non_compliant' : 'at_risk';

    return {
      regulation: regulation.name,
      status,
      lastChecked: new Date(),
      issues
    };
  }

  private async handleComplianceIssue(regulation: Regulation, status: RegulationStatus): Promise<void> {
    // Create alert
    const alert: ComplianceAlert = {
      id: generateAlertId(),
      type: 'compliance_violation',
      severity: status.status === 'non_compliant' ? 'critical' : 'high',
      message: `Compliance issue detected for ${regulation.name}`,
      regulation: regulation.name,
      createdAt: new Date(),
      acknowledged: false
    };

    await this.alertService.createAlert(alert);

    // Notify compliance team
    await this.notifyComplianceTeam(alert, status.issues);

    // Log to audit trail
    await this.auditLogger.log({
      type: 'compliance_issue',
      regulation: regulation.name,
      issues: status.issues,
      timestamp: new Date()
    });
  }

  async generateComplianceReport(config: ComplianceReportConfig): Promise<ComplianceReport> {
    const data = await this.gatherReportData(config);
    
    const summary: ComplianceSummary = {
      totalCommunications: data.totalCommunications,
      compliantCommunications: data.compliantCommunications,
      complianceRate: (data.compliantCommunications / data.totalCommunications) * 100,
      issuesByCategory: this.categorizeIssues(data.issues),
      riskLevel: this.calculateRiskLevel(data)
    };

    return {
      id: generateReportId(),
      type: config.reportType,
      generatedAt: new Date(),
      timeRange: config.timeRange,
      summary,
      details: data.details,
      recommendations: this.generateRecommendations(data)
    };
  }
}
```

## Integration Points

### Identity Provider Integration

```typescript
interface IdentityProviderIntegration {
  // User authentication
  authenticateUser(credentials: Credentials): Promise<AuthResult>;
  
  // Role management
  getUserRoles(userId: string): Promise<Role[]>;
  syncRoles(userId: string): Promise<void>;
  
  // Group management
  getUserGroups(userId: string): Promise<Group[]>;
  syncGroups(): Promise<void>;
}
```

### Document Management Integration

```typescript
interface DocumentManagementIntegration {
  // Document storage
  storeDocument(document: Document): Promise<string>;
  retrieveDocument(documentId: string): Promise<Document>;
  
  // Version control
  createVersion(documentId: string, content: Content): Promise<string>;
  getVersionHistory(documentId: string): Promise<Version[]>;
  
  // Access control
  setPermissions(documentId: string, permissions: Permissions): Promise<void>;
}
```

## Security Considerations

### Access Control
- Implement role-based access control for all features
- Enforce least privilege principle
- Audit all access to sensitive content
- Implement session management

### Data Protection
- Encrypt sensitive content at rest and in transit
- Implement data classification
- Secure approval workflows
- Protect audit trails from tampering

## Compliance Guidelines

### Regulatory Compliance
- Maintain comprehensive audit trails
- Support regulatory reporting requirements
- Implement data retention policies
- Enable compliance monitoring

### Internal Governance
- Enforce approval workflows
- Maintain brand consistency
- Track all content changes
- Support internal audits

## Testing Considerations

### Unit Testing

```typescript
describe('MultiStageApprovalEngine', () => {
  it('should move to next stage after required approvals', async () => {
    const engine = new MultiStageApprovalEngine();
    
    const requestId = await engine.submitForApproval(testContent, 'submitter1');
    
    // First approval
    await engine.processApproval(requestId, 'approver1', { action: 'approved' });
    
    let status = await engine.getApprovalStatus(requestId);
    expect(status.currentStage).toBe('stage1');
    
    // Second approval (meets requirement)
    await engine.processApproval(requestId, 'approver2', { action: 'approved' });
    
    status = await engine.getApprovalStatus(requestId);
    expect(status.currentStage).toBe('stage2');
  });
});
```

### Integration Testing

```typescript
describe('Brand Enforcement Integration', () => {
  it('should apply branding and validate content', async () => {
    const engine = new BrandEnforcementEngine();
    
    const content = createTestContent();
    const brandedContent = await engine.validateAndApplyBranding(content, 'brand1');
    
    expect(brandedContent.footer).toContain('legal footer');
    expect(brandedContent.from.name).toBe('Brand Name');
  });
});
```

### Property-Based Testing

```typescript
describe('Enterprise Communication Properties', () => {
  it('should always maintain audit trail for approvals', () => {
    fc.assert(fc.property(
      fc.record({
        contentType: fc.constantFrom('email', 'push', 'sms'),
        approverCount: fc.integer({ min: 1, max: 5 })
      }),
      async (input) => {
        const engine = new MultiStageApprovalEngine();
        
        const requestId = await engine.submitForApproval(
          createContent(input.contentType),
          'submitter'
        );
        
        // Process approvals
        for (let i = 0; i < input.approverCount; i++) {
          await engine.processApproval(requestId, `approver${i}`, { action: 'approved' });
        }
        
        const status = await engine.getApprovalStatus(requestId);
        
        // Audit trail should have all actions
        expect(status.history.length).toBeGreaterThanOrEqual(input.approverCount);
      }
    ));
  });
});
```
