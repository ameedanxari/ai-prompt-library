# Notification Compliance Template

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

This template provides comprehensive patterns for implementing notification compliance including opt-in/opt-out management, GDPR compliance, CAN-SPAM compliance, and consent tracking. It ensures notification systems meet regulatory requirements while maintaining user trust and engagement.

## Context

Notification systems must comply with various regulations including GDPR, CAN-SPAM, TCPA, and CASL. This template addresses the challenges of managing user consent across multiple channels, implementing compliant opt-out mechanisms, maintaining audit trails for regulatory requirements, and ensuring notifications respect user preferences and legal requirements across different jurisdictions.

## Core Components

### Consent Management Service

## Examples

```typescript
interface ConsentManagementService {
  // Consent operations
  recordConsent(consent: ConsentRecord): Promise<string>;
  withdrawConsent(userId: string, consentType: ConsentType): Promise<void>;
  getConsent(userId: string, consentType: ConsentType): Promise<ConsentStatus>;
  
  // Consent verification
  hasValidConsent(userId: string, notificationType: string, channel: ChannelType): Promise<boolean>;
  
  // Consent history
  getConsentHistory(userId: string): Promise<ConsentHistoryEntry[]>;
  
  // Bulk operations
  exportUserConsents(userId: string): Promise<ConsentExport>;
}

interface ConsentRecord {
  userId: string;
  consentType: ConsentType;
  channel?: ChannelType;
  granted: boolean;
  source: ConsentSource;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  expiresAt?: Date;
  metadata?: Record<string, unknown>;
}

enum ConsentType {
  MARKETING = 'marketing',
  TRANSACTIONAL = 'transactional',
  PROMOTIONAL = 'promotional',
  NEWSLETTER = 'newsletter',
  PRODUCT_UPDATES = 'product_updates',
  THIRD_PARTY = 'third_party',
  ANALYTICS = 'analytics',
  PERSONALIZATION = 'personalization'
}

enum ConsentSource {
  SIGNUP_FORM = 'signup_form',
  PREFERENCE_CENTER = 'preference_center',
  DOUBLE_OPT_IN = 'double_opt_in',
  API = 'api',
  IMPORT = 'import',
  IMPLICIT = 'implicit'
}

interface ConsentStatus {
  consentType: ConsentType;
  granted: boolean;
  grantedAt?: Date;
  source?: ConsentSource;
  expiresAt?: Date;
  lastUpdated: Date;
}
```

### Opt-Out Management Service

```typescript
interface OptOutManagementService {
  // Opt-out operations
  processOptOut(request: OptOutRequest): Promise<OptOutResult>;
  processOneClickOptOut(token: string): Promise<OptOutResult>;
  
  // Opt-out status
  isOptedOut(userId: string, channel: ChannelType, notificationType?: string): Promise<boolean>;
  getOptOutStatus(userId: string): Promise<OptOutStatus>;
  
  // Suppression list
  addToSuppressionList(entry: SuppressionEntry): Promise<void>;
  removeFromSuppressionList(identifier: string, channel: ChannelType): Promise<void>;
  isOnSuppressionList(identifier: string, channel: ChannelType): Promise<boolean>;
  
  // Compliance reporting
  getOptOutReport(timeRange: TimeRange): Promise<OptOutReport>;
}

interface OptOutRequest {
  userId?: string;
  email?: string;
  phone?: string;
  channel: ChannelType;
  notificationType?: string; // Specific type or 'all'
  reason?: string;
  source: OptOutSource;
  timestamp: Date;
}

enum OptOutSource {
  UNSUBSCRIBE_LINK = 'unsubscribe_link',
  PREFERENCE_CENTER = 'preference_center',
  EMAIL_REPLY = 'email_reply',
  SMS_REPLY = 'sms_reply',
  CUSTOMER_SERVICE = 'customer_service',
  LEGAL_REQUEST = 'legal_request',
  BOUNCE = 'bounce',
  COMPLAINT = 'complaint'
}

interface OptOutResult {
  success: boolean;
  processedAt: Date;
  confirmationId: string;
  affectedChannels: ChannelType[];
  affectedTypes: string[];
}

interface SuppressionEntry {
  identifier: string; // Email, phone, or user ID
  identifierType: 'email' | 'phone' | 'user_id';
  channel: ChannelType;
  reason: SuppressionReason;
  addedAt: Date;
  expiresAt?: Date;
  source: string;
}

enum SuppressionReason {
  OPT_OUT = 'opt_out',
  HARD_BOUNCE = 'hard_bounce',
  COMPLAINT = 'complaint',
  LEGAL_REQUEST = 'legal_request',
  INVALID_ADDRESS = 'invalid_address',
  MANUAL = 'manual'
}
```

### GDPR Compliance Service

```typescript
interface GDPRComplianceService {
  // Data subject rights
  handleAccessRequest(userId: string): Promise<DataAccessResponse>;
  handleDeletionRequest(userId: string): Promise<DeletionResponse>;
  handlePortabilityRequest(userId: string): Promise<PortabilityResponse>;
  handleRectificationRequest(userId: string, updates: DataRectification): Promise<RectificationResponse>;
  
  // Consent management
  recordLawfulBasis(userId: string, basis: LawfulBasis): Promise<void>;
  getLawfulBasis(userId: string, processingPurpose: string): Promise<LawfulBasis>;
  
  // Data processing records
  recordProcessingActivity(activity: ProcessingActivity): Promise<void>;
  getProcessingActivities(userId: string): Promise<ProcessingActivity[]>;
  
  // Breach notification
  recordBreach(breach: DataBreach): Promise<string>;
  notifyAuthorities(breachId: string): Promise<void>;
  notifyAffectedUsers(breachId: string): Promise<void>;
}

interface DataAccessResponse {
  requestId: string;
  userId: string;
  data: {
    profile: UserProfile;
    consents: ConsentRecord[];
    notifications: NotificationHistory[];
    preferences: UserPreferences;
    processingActivities: ProcessingActivity[];
  };
  generatedAt: Date;
  format: 'json' | 'pdf';
}

interface LawfulBasis {
  basis: LawfulBasisType;
  purpose: string;
  description: string;
  recordedAt: Date;
  evidenceRef?: string;
}

enum LawfulBasisType {
  CONSENT = 'consent',
  CONTRACT = 'contract',
  LEGAL_OBLIGATION = 'legal_obligation',
  VITAL_INTERESTS = 'vital_interests',
  PUBLIC_TASK = 'public_task',
  LEGITIMATE_INTERESTS = 'legitimate_interests'
}

interface ProcessingActivity {
  id: string;
  purpose: string;
  dataCategories: string[];
  recipients: string[];
  retentionPeriod: string;
  lawfulBasis: LawfulBasisType;
  timestamp: Date;
}
```

### CAN-SPAM Compliance Service

```typescript
interface CANSPAMComplianceService {
  // Email compliance
  validateEmailCompliance(email: EmailNotification): Promise<ComplianceValidation>;
  addRequiredElements(email: EmailNotification): Promise<EmailNotification>;
  
  // Unsubscribe handling
  generateUnsubscribeLink(userId: string, emailId: string): string;
  processUnsubscribe(token: string): Promise<UnsubscribeResult>;
  
  // Compliance reporting
  getComplianceReport(timeRange: TimeRange): Promise<CANSPAMReport>;
  
  // Sender verification
  verifySenderIdentity(sender: EmailSender): Promise<SenderVerification>;
}

interface ComplianceValidation {
  compliant: boolean;
  issues: ComplianceIssue[];
  suggestions: string[];
}

interface ComplianceIssue {
  code: string;
  severity: 'error' | 'warning';
  field: string;
  message: string;
  regulation: string;
}

interface CANSPAMReport {
  timeRange: TimeRange;
  totalEmailsSent: number;
  unsubscribeRate: number;
  complaintRate: number;
  complianceScore: number;
  issues: ComplianceIssue[];
}

// Required CAN-SPAM elements
interface CANSPAMRequirements {
  physicalAddress: string;
  unsubscribeLink: string;
  unsubscribeEmail?: string;
  senderIdentification: string;
  subjectLineAccuracy: boolean;
}
```

### Audit Trail Service

```typescript
interface AuditTrailService {
  // Audit logging
  logConsentChange(event: ConsentAuditEvent): Promise<void>;
  logOptOutEvent(event: OptOutAuditEvent): Promise<void>;
  logDataAccess(event: DataAccessAuditEvent): Promise<void>;
  logNotificationSent(event: NotificationAuditEvent): Promise<void>;
  
  // Audit retrieval
  getAuditTrail(userId: string, options?: AuditQueryOptions): Promise<AuditEntry[]>;
  getAuditReport(timeRange: TimeRange, filters?: AuditFilters): Promise<AuditReport>;
  
  // Compliance evidence
  generateComplianceEvidence(userId: string, requestType: string): Promise<ComplianceEvidence>;
}

interface ConsentAuditEvent {
  userId: string;
  consentType: ConsentType;
  action: 'granted' | 'withdrawn' | 'updated';
  previousValue?: boolean;
  newValue: boolean;
  source: ConsentSource;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

interface AuditEntry {
  id: string;
  userId: string;
  eventType: AuditEventType;
  action: string;
  details: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  hash: string; // For integrity verification
}

enum AuditEventType {
  CONSENT_CHANGE = 'consent_change',
  OPT_OUT = 'opt_out',
  DATA_ACCESS = 'data_access',
  DATA_DELETION = 'data_deletion',
  NOTIFICATION_SENT = 'notification_sent',
  PREFERENCE_UPDATE = 'preference_update',
  SUPPRESSION_LIST_UPDATE = 'suppression_list_update'
}

interface ComplianceEvidence {
  userId: string;
  requestType: string;
  generatedAt: Date;
  auditEntries: AuditEntry[];
  consentRecords: ConsentRecord[];
  summary: string;
  hash: string;
}
```

## Implementation Patterns

### Double Opt-In Implementation

```typescript
class DoubleOptInService {
  private tokenService: TokenService;
  private emailService: EmailService;
  private consentService: ConsentManagementService;

  async initiateDoubleOptIn(request: DoubleOptInRequest): Promise<DoubleOptInResult> {
    // Generate confirmation token
    const token = await this.tokenService.generateToken({
      userId: request.userId,
      email: request.email,
      consentType: request.consentType,
      expiresIn: '24h'
    });

    // Send confirmation email
    await this.emailService.sendEmail({
      to: [{ email: request.email }],
      from: { email: 'noreply@example.com', name: 'Example App' },
      subject: 'Please confirm your subscription',
      body: {
        templateId: 'double-opt-in-confirmation',
        templateData: {
          confirmationLink: `${this.baseUrl}/confirm-subscription?token=${token}`,
          consentType: request.consentType,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // Record pending consent
    await this.consentService.recordConsent({
      userId: request.userId,
      consentType: request.consentType,
      granted: false,
      source: ConsentSource.DOUBLE_OPT_IN,
      timestamp: new Date(),
      metadata: { status: 'pending', token }
    });

    return {
      success: true,
      pendingConfirmation: true,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    };
  }

  async confirmOptIn(token: string): Promise<ConfirmationResult> {
    // Validate token
    const tokenData = await this.tokenService.validateToken(token);
    if (!tokenData) {
      return { success: false, error: 'Invalid or expired token' };
    }

    // Record confirmed consent
    await this.consentService.recordConsent({
      userId: tokenData.userId,
      consentType: tokenData.consentType,
      granted: true,
      source: ConsentSource.DOUBLE_OPT_IN,
      timestamp: new Date(),
      metadata: { confirmedAt: new Date() }
    });

    // Invalidate token
    await this.tokenService.invalidateToken(token);

    return {
      success: true,
      userId: tokenData.userId,
      consentType: tokenData.consentType,
      confirmedAt: new Date()
    };
  }
}
```

### One-Click Unsubscribe Implementation

```typescript
class OneClickUnsubscribeService {
  private optOutService: OptOutManagementService;
  private auditService: AuditTrailService;

  generateUnsubscribeHeaders(userId: string, emailId: string): Record<string, string> {
    const token = this.generateUnsubscribeToken(userId, emailId);
    const unsubscribeUrl = `${this.baseUrl}/unsubscribe?token=${token}`;
    const unsubscribeEmail = `unsubscribe+${token}@example.com`;

    return {
      'List-Unsubscribe': `<${unsubscribeUrl}>, <mailto:${unsubscribeEmail}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
    };
  }

  async processOneClickUnsubscribe(token: string): Promise<UnsubscribeResult> {
    // Validate and decode token
    const tokenData = this.decodeUnsubscribeToken(token);
    if (!tokenData) {
      return { success: false, error: 'Invalid unsubscribe token' };
    }

    // Process opt-out
    const result = await this.optOutService.processOptOut({
      userId: tokenData.userId,
      channel: ChannelType.EMAIL,
      source: OptOutSource.UNSUBSCRIBE_LINK,
      timestamp: new Date()
    });

    // Log audit event
    await this.auditService.logOptOutEvent({
      userId: tokenData.userId,
      channel: ChannelType.EMAIL,
      source: 'one_click_unsubscribe',
      emailId: tokenData.emailId,
      timestamp: new Date()
    });

    return result;
  }

  private generateUnsubscribeToken(userId: string, emailId: string): string {
    const payload = { userId, emailId, timestamp: Date.now() };
    return jwt.sign(payload, this.secret, { expiresIn: '30d' });
  }

  private decodeUnsubscribeToken(token: string): { userId: string; emailId: string } | null {
    try {
      return jwt.verify(token, this.secret) as { userId: string; emailId: string };
    } catch {
      return null;
    }
  }
}
```

### GDPR Data Export Implementation

```typescript
class GDPRDataExportService {
  private userService: UserService;
  private consentService: ConsentManagementService;
  private notificationService: NotificationService;
  private auditService: AuditTrailService;

  async handleAccessRequest(userId: string): Promise<DataAccessResponse> {
    const requestId = generateRequestId();

    // Gather all user data
    const [profile, consents, notifications, preferences, activities] = await Promise.all([
      this.userService.getProfile(userId),
      this.consentService.getConsentHistory(userId),
      this.notificationService.getNotificationHistory(userId),
      this.userService.getPreferences(userId),
      this.auditService.getAuditTrail(userId)
    ]);

    // Log the access request
    await this.auditService.logDataAccess({
      userId,
      requestId,
      requestType: 'access',
      timestamp: new Date()
    });

    return {
      requestId,
      userId,
      data: {
        profile,
        consents,
        notifications,
        preferences,
        processingActivities: activities
      },
      generatedAt: new Date(),
      format: 'json'
    };
  }

  async handleDeletionRequest(userId: string): Promise<DeletionResponse> {
    const requestId = generateRequestId();

    // Verify no legal holds
    const hasLegalHold = await this.checkLegalHold(userId);
    if (hasLegalHold) {
      return {
        requestId,
        success: false,
        error: 'Data subject to legal hold',
        retentionReason: 'legal_obligation'
      };
    }

    // Delete user data across all systems
    const deletionResults = await Promise.all([
      this.userService.deleteUser(userId),
      this.consentService.deleteUserConsents(userId),
      this.notificationService.deleteUserNotifications(userId),
      this.optOutService.addToSuppressionList({
        identifier: userId,
        identifierType: 'user_id',
        channel: ChannelType.EMAIL,
        reason: SuppressionReason.LEGAL_REQUEST,
        addedAt: new Date(),
        source: 'gdpr_deletion'
      })
    ]);

    // Log deletion
    await this.auditService.logDataAccess({
      userId,
      requestId,
      requestType: 'deletion',
      timestamp: new Date(),
      details: { deletionResults }
    });

    return {
      requestId,
      success: true,
      deletedAt: new Date(),
      retentionItems: [] // Items retained for legal reasons
    };
  }
}
```

## Integration Points

### Preference Center Integration

```typescript
interface PreferenceCenterService {
  // Preference management
  getPreferences(userId: string): Promise<UserNotificationPreferences>;
  updatePreferences(userId: string, preferences: Partial<UserNotificationPreferences>): Promise<void>;
  
  // Channel preferences
  getChannelPreferences(userId: string): Promise<ChannelPreferences>;
  updateChannelPreference(userId: string, channel: ChannelType, enabled: boolean): Promise<void>;
  
  // Notification type preferences
  getTypePreferences(userId: string): Promise<TypePreferences>;
  updateTypePreference(userId: string, type: string, enabled: boolean): Promise<void>;
}

interface UserNotificationPreferences {
  userId: string;
  globalOptOut: boolean;
  channels: ChannelPreferences;
  types: TypePreferences;
  frequency: FrequencyPreferences;
  quietHours: QuietHoursPreferences;
  updatedAt: Date;
}

interface ChannelPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
}

interface TypePreferences {
  marketing: boolean;
  transactional: boolean;
  productUpdates: boolean;
  newsletter: boolean;
  promotions: boolean;
}
```

### Legal System Integration

```typescript
interface LegalComplianceIntegration {
  // Legal hold management
  checkLegalHold(userId: string): Promise<LegalHoldStatus>;
  applyLegalHold(userId: string, holdDetails: LegalHoldDetails): Promise<void>;
  releaseLegalHold(userId: string, holdId: string): Promise<void>;
  
  // Regulatory reporting
  generateRegulatoryReport(regulation: string, timeRange: TimeRange): Promise<RegulatoryReport>;
  submitToAuthority(report: RegulatoryReport, authority: string): Promise<SubmissionResult>;
}

interface LegalHoldStatus {
  hasHold: boolean;
  holds: LegalHold[];
}

interface LegalHold {
  id: string;
  reason: string;
  appliedAt: Date;
  expiresAt?: Date;
  authority?: string;
}
```

## Security Considerations

### Data Protection
- Encrypt consent records at rest
- Use secure tokens for unsubscribe links
- Implement rate limiting on opt-out endpoints
- Validate all consent sources

### Access Control
- Restrict access to consent management APIs
- Implement audit logging for all consent changes
- Use role-based access for compliance reports
- Secure preference center endpoints

### Token Security
- Use cryptographically secure tokens
- Implement token expiration
- Validate token integrity
- Prevent token reuse

## Compliance Guidelines

### GDPR Requirements
- Obtain explicit consent before processing
- Provide clear information about data usage
- Enable easy consent withdrawal
- Respond to data subject requests within 30 days
- Maintain records of processing activities

### CAN-SPAM Requirements
- Include physical postal address
- Provide clear unsubscribe mechanism
- Honor opt-out requests within 10 business days
- Use accurate header information
- Identify message as advertisement if applicable

### TCPA Requirements (SMS)
- Obtain prior express written consent
- Provide opt-out instructions
- Respect do-not-call lists
- Maintain consent records

### CASL Requirements (Canada)
- Obtain express or implied consent
- Include sender identification
- Provide unsubscribe mechanism
- Honor unsubscribe within 10 business days

## Testing Considerations

### Unit Testing

```typescript
describe('ConsentManagementService', () => {
  it('should record consent with all required fields', async () => {
    const service = new ConsentManagementService();
    
    const consentId = await service.recordConsent({
      userId: 'user123',
      consentType: ConsentType.MARKETING,
      granted: true,
      source: ConsentSource.SIGNUP_FORM,
      timestamp: new Date()
    });
    
    expect(consentId).toBeDefined();
    
    const status = await service.getConsent('user123', ConsentType.MARKETING);
    expect(status.granted).toBe(true);
  });

  it('should properly withdraw consent', async () => {
    const service = new ConsentManagementService();
    
    await service.withdrawConsent('user123', ConsentType.MARKETING);
    
    const status = await service.getConsent('user123', ConsentType.MARKETING);
    expect(status.granted).toBe(false);
  });
});

describe('OptOutManagementService', () => {
  it('should process opt-out request correctly', async () => {
    const service = new OptOutManagementService();
    
    const result = await service.processOptOut({
      userId: 'user123',
      channel: ChannelType.EMAIL,
      source: OptOutSource.UNSUBSCRIBE_LINK,
      timestamp: new Date()
    });
    
    expect(result.success).toBe(true);
    
    const isOptedOut = await service.isOptedOut('user123', ChannelType.EMAIL);
    expect(isOptedOut).toBe(true);
  });
});
```

### Compliance Testing

```typescript
describe('CAN-SPAM Compliance', () => {
  it('should validate email has required elements', async () => {
    const service = new CANSPAMComplianceService();
    
    const email = createTestEmail({
      physicalAddress: '123 Main St, City, ST 12345',
      unsubscribeLink: 'https://example.com/unsubscribe'
    });
    
    const validation = await service.validateEmailCompliance(email);
    
    expect(validation.compliant).toBe(true);
  });

  it('should flag missing physical address', async () => {
    const service = new CANSPAMComplianceService();
    
    const email = createTestEmail({ physicalAddress: undefined });
    
    const validation = await service.validateEmailCompliance(email);
    
    expect(validation.compliant).toBe(false);
    expect(validation.issues).toContainEqual(
      expect.objectContaining({ code: 'MISSING_PHYSICAL_ADDRESS' })
    );
  });
});
```

### Property-Based Testing

```typescript
describe('Compliance Properties', () => {
  it('should always maintain consent audit trail', () => {
    fc.assert(fc.property(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        consentType: fc.constantFrom(...Object.values(ConsentType)),
        granted: fc.boolean()
      }),
      async (input) => {
        const consentService = new ConsentManagementService();
        const auditService = new AuditTrailService();
        
        await consentService.recordConsent({
          ...input,
          source: ConsentSource.API,
          timestamp: new Date()
        });
        
        const history = await auditService.getAuditTrail(input.userId);
        
        expect(history.length).toBeGreaterThan(0);
        expect(history[0].eventType).toBe(AuditEventType.CONSENT_CHANGE);
      }
    ));
  });
});
```
