# Privacy Controls Template

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

This template provides comprehensive patterns for implementing consent management, data portability, right to deletion (right to be forgotten), and privacy dashboards. It covers GDPR compliance, CCPA requirements, user data rights management, and privacy-by-design principles for building privacy-respecting applications.

## Context

Privacy regulations require applications to provide users with control over their personal data. This template addresses the implementation of consent collection, data subject rights, privacy preferences, and compliance reporting while maintaining a seamless user experience.

## Core Components

### Consent Management Interface

## Examples

```typescript
interface ConsentManager {
  recordConsent(userId: string, consent: ConsentRecord): Promise<void>;
  withdrawConsent(userId: string, consentId: string): Promise<void>;
  getConsents(userId: string): Promise<ConsentRecord[]>;
  checkConsent(userId: string, purpose: ConsentPurpose): Promise<boolean>;
  getConsentHistory(userId: string): Promise<ConsentHistoryEntry[]>;
}

interface ConsentRecord {
  id: string;
  userId: string;
  purpose: ConsentPurpose;
  granted: boolean;
  grantedAt: Date;
  expiresAt?: Date;
  source: ConsentSource;
  version: string;
  metadata: ConsentMetadata;
}

enum ConsentPurpose {
  ESSENTIAL = 'essential',
  ANALYTICS = 'analytics',
  MARKETING = 'marketing',
  PERSONALIZATION = 'personalization',
  THIRD_PARTY_SHARING = 'third_party_sharing',
  PROFILING = 'profiling',
  AUTOMATED_DECISIONS = 'automated_decisions'
}

enum ConsentSource {
  BANNER = 'banner',
  SETTINGS = 'settings',
  REGISTRATION = 'registration',
  API = 'api',
  IMPORT = 'import'
}

interface ConsentMetadata {
  ipAddress?: string;
  userAgent?: string;
  consentText: string;
  policyVersion: string;
  jurisdiction: string;
}

class ConsentManagementService implements ConsentManager {
  private consentStore: ConsentStore;
  private auditService: AuditService;

  async recordConsent(userId: string, consent: ConsentRecord): Promise<void> {
    // Validate consent record
    this.validateConsentRecord(consent);

    // Store consent with full audit trail
    await this.consentStore.save({
      ...consent,
      userId,
      recordedAt: new Date()
    });

    // Log for compliance
    await this.auditService.logConsentAction({
      action: 'consent_recorded',
      userId,
      consentId: consent.id,
      purpose: consent.purpose,
      granted: consent.granted,
      timestamp: new Date()
    });

    // Trigger downstream systems
    await this.notifyConsentChange(userId, consent);
  }

  async withdrawConsent(userId: string, consentId: string): Promise<void> {
    const consent = await this.consentStore.get(consentId);
    if (!consent || consent.userId !== userId) {
      throw new ConsentNotFoundError(consentId);
    }

    // Record withdrawal
    await this.consentStore.update(consentId, {
      granted: false,
      withdrawnAt: new Date()
    });

    // Log withdrawal
    await this.auditService.logConsentAction({
      action: 'consent_withdrawn',
      userId,
      consentId,
      purpose: consent.purpose,
      timestamp: new Date()
    });

    // Trigger data processing restrictions
    await this.enforceConsentWithdrawal(userId, consent.purpose);
  }

  async checkConsent(userId: string, purpose: ConsentPurpose): Promise<boolean> {
    const consents = await this.consentStore.findByUserAndPurpose(userId, purpose);
    
    // Find most recent valid consent
    const validConsent = consents
      .filter(c => c.granted && (!c.expiresAt || c.expiresAt > new Date()))
      .sort((a, b) => b.grantedAt.getTime() - a.grantedAt.getTime())[0];

    return !!validConsent;
  }
}
```

### Data Subject Rights Service

```typescript
interface DataSubjectRightsService {
  handleAccessRequest(userId: string): Promise<DataAccessResponse>;
  handleDeletionRequest(userId: string): Promise<DeletionResponse>;
  handleRectificationRequest(userId: string, corrections: DataCorrection[]): Promise<RectificationResponse>;
  handlePortabilityRequest(userId: string, format: ExportFormat): Promise<PortabilityResponse>;
  handleRestrictionRequest(userId: string, restriction: ProcessingRestriction): Promise<RestrictionResponse>;
}

interface DataAccessResponse {
  requestId: string;
  userId: string;
  data: PersonalDataExport;
  generatedAt: Date;
  expiresAt: Date;
  downloadUrl?: string;
}

interface DeletionResponse {
  requestId: string;
  userId: string;
  status: DeletionStatus;
  deletedCategories: string[];
  retainedCategories: RetainedDataCategory[];
  completedAt?: Date;
  scheduledCompletionAt?: Date;
}

enum DeletionStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  PARTIALLY_COMPLETED = 'partially_completed',
  REJECTED = 'rejected'
}

class DataSubjectRightsHandler implements DataSubjectRightsService {
  private dataCollector: PersonalDataCollector;
  private dataDeletor: PersonalDataDeletor;
  private auditService: AuditService;

  async handleAccessRequest(userId: string): Promise<DataAccessResponse> {
    const requestId = crypto.randomUUID();

    // Log request
    await this.auditService.logDataSubjectRequest({
      requestId,
      type: 'access',
      userId,
      timestamp: new Date()
    });

    // Collect all personal data
    const personalData = await this.dataCollector.collectAllPersonalData(userId);

    // Generate export
    const exportData: PersonalDataExport = {
      subject: {
        id: userId,
        exportedAt: new Date()
      },
      categories: personalData.map(d => ({
        category: d.category,
        data: d.data,
        source: d.source,
        collectedAt: d.collectedAt,
        purpose: d.purpose,
        legalBasis: d.legalBasis
      })),
      processingActivities: await this.getProcessingActivities(userId),
      thirdPartySharing: await this.getThirdPartySharing(userId),
      retentionPolicies: await this.getRetentionPolicies()
    };

    // Create secure download
    const downloadUrl = await this.createSecureDownload(exportData, userId);

    return {
      requestId,
      userId,
      data: exportData,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      downloadUrl
    };
  }

  async handleDeletionRequest(userId: string): Promise<DeletionResponse> {
    const requestId = crypto.randomUUID();

    // Log request
    await this.auditService.logDataSubjectRequest({
      requestId,
      type: 'deletion',
      userId,
      timestamp: new Date()
    });

    // Identify data categories
    const dataCategories = await this.dataCollector.identifyDataCategories(userId);

    // Determine what can be deleted vs retained
    const { deletable, retained } = await this.categorizeDeletionEligibility(dataCategories);

    // Execute deletion
    const deletionResults = await this.dataDeletor.deletePersonalData(userId, deletable);

    // Notify third parties
    await this.notifyThirdPartiesOfDeletion(userId);

    return {
      requestId,
      userId,
      status: retained.length > 0 ? DeletionStatus.PARTIALLY_COMPLETED : DeletionStatus.COMPLETED,
      deletedCategories: deletionResults.deleted,
      retainedCategories: retained.map(r => ({
        category: r.category,
        reason: r.retentionReason,
        retentionPeriod: r.retentionPeriod
      })),
      completedAt: new Date()
    };
  }
}
```

### Data Portability Service

```typescript
class DataPortabilityService {
  private dataCollector: PersonalDataCollector;
  private exportFormats: Map<ExportFormat, DataExporter>;

  async exportUserData(userId: string, format: ExportFormat): Promise<PortabilityExport> {
    // Collect all portable data
    const portableData = await this.dataCollector.collectPortableData(userId);

    // Get appropriate exporter
    const exporter = this.exportFormats.get(format);
    if (!exporter) {
      throw new UnsupportedFormatError(format);
    }

    // Generate export
    const exportedData = await exporter.export(portableData);

    // Create download package
    const downloadPackage = await this.createDownloadPackage(exportedData, {
      userId,
      format,
      generatedAt: new Date()
    });

    return {
      userId,
      format,
      data: downloadPackage,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      checksum: await this.calculateChecksum(downloadPackage)
    };
  }

  async importUserData(userId: string, importData: DataImport): Promise<ImportResult> {
    // Validate import format
    const validation = await this.validateImportData(importData);
    if (!validation.valid) {
      throw new InvalidImportDataError(validation.errors);
    }

    // Parse imported data
    const parsedData = await this.parseImportData(importData);

    // Map to internal format
    const mappedData = await this.mapToInternalFormat(parsedData);

    // Import with conflict resolution
    const importResults = await this.importWithConflictResolution(userId, mappedData);

    return {
      userId,
      importedCategories: importResults.imported,
      skippedCategories: importResults.skipped,
      conflicts: importResults.conflicts,
      completedAt: new Date()
    };
  }
}

enum ExportFormat {
  JSON = 'json',
  CSV = 'csv',
  XML = 'xml',
  PDF = 'pdf'
}
```

## Implementation Patterns

### Privacy Dashboard

```typescript
class PrivacyDashboard {
  private consentManager: ConsentManager;
  private dataSubjectRights: DataSubjectRightsService;
  private privacySettings: PrivacySettingsService;

  async getDashboardData(userId: string): Promise<PrivacyDashboardData> {
    const [consents, dataCategories, privacySettings, processingActivities] = await Promise.all([
      this.consentManager.getConsents(userId),
      this.getDataCategories(userId),
      this.privacySettings.getSettings(userId),
      this.getProcessingActivities(userId)
    ]);

    return {
      consents: consents.map(c => ({
        purpose: c.purpose,
        granted: c.granted,
        grantedAt: c.grantedAt,
        canWithdraw: this.canWithdrawConsent(c)
      })),
      dataCategories: dataCategories.map(d => ({
        category: d.category,
        description: d.description,
        dataPoints: d.dataPoints,
        lastUpdated: d.lastUpdated
      })),
      privacySettings: {
        marketingEmails: privacySettings.marketingEmails,
        profileVisibility: privacySettings.profileVisibility,
        dataSharing: privacySettings.dataSharing,
        activityTracking: privacySettings.activityTracking
      },
      processingActivities: processingActivities.map(p => ({
        activity: p.activity,
        purpose: p.purpose,
        legalBasis: p.legalBasis,
        dataCategories: p.dataCategories
      })),
      availableActions: {
        canRequestAccess: true,
        canRequestDeletion: true,
        canRequestPortability: true,
        canRestrictProcessing: true
      }
    };
  }

  async updatePrivacySettings(userId: string, settings: PrivacySettingsUpdate): Promise<void> {
    // Validate settings
    this.validateSettings(settings);

    // Update settings
    await this.privacySettings.updateSettings(userId, settings);

    // Handle consent implications
    if (settings.marketingEmails === false) {
      await this.consentManager.withdrawConsent(userId, 'marketing');
    }

    // Log change
    await this.auditService.logPrivacySettingsChange(userId, settings);
  }
}
```

### Cookie Consent Banner

```typescript
class CookieConsentBanner {
  private consentManager: ConsentManager;

  async getConsentStatus(userId?: string): Promise<CookieConsentStatus> {
    if (!userId) {
      return { hasConsented: false, preferences: null };
    }

    const consents = await this.consentManager.getConsents(userId);
    
    return {
      hasConsented: consents.length > 0,
      preferences: {
        essential: true, // Always required
        analytics: consents.some(c => c.purpose === ConsentPurpose.ANALYTICS && c.granted),
        marketing: consents.some(c => c.purpose === ConsentPurpose.MARKETING && c.granted),
        personalization: consents.some(c => c.purpose === ConsentPurpose.PERSONALIZATION && c.granted)
      }
    };
  }

  async recordCookieConsent(userId: string, preferences: CookiePreferences): Promise<void> {
    const consentRecords: ConsentRecord[] = [];

    // Essential cookies - always granted
    consentRecords.push(this.createConsentRecord(userId, ConsentPurpose.ESSENTIAL, true));

    // Optional cookies based on preferences
    if (preferences.analytics !== undefined) {
      consentRecords.push(this.createConsentRecord(userId, ConsentPurpose.ANALYTICS, preferences.analytics));
    }

    if (preferences.marketing !== undefined) {
      consentRecords.push(this.createConsentRecord(userId, ConsentPurpose.MARKETING, preferences.marketing));
    }

    if (preferences.personalization !== undefined) {
      consentRecords.push(this.createConsentRecord(userId, ConsentPurpose.PERSONALIZATION, preferences.personalization));
    }

    // Record all consents
    for (const consent of consentRecords) {
      await this.consentManager.recordConsent(userId, consent);
    }
  }
}
```

## Integration Points

### Third-Party Consent Platforms

```typescript
interface ConsentPlatformIntegration {
  syncConsents(userId: string): Promise<SyncResult>;
  pushConsentUpdate(userId: string, consent: ConsentRecord): Promise<void>;
  getConsentReceipt(consentId: string): Promise<ConsentReceipt>;
}

class OneTrustIntegration implements ConsentPlatformIntegration {
  private oneTrustClient: OneTrustClient;

  async syncConsents(userId: string): Promise<SyncResult> {
    const externalConsents = await this.oneTrustClient.getConsents(userId);
    
    const syncResults: SyncResult = {
      synced: 0,
      created: 0,
      updated: 0,
      errors: []
    };

    for (const consent of externalConsents) {
      try {
        const mappedConsent = this.mapToInternalConsent(consent);
        await this.consentManager.recordConsent(userId, mappedConsent);
        syncResults.synced++;
      } catch (error) {
        syncResults.errors.push({ consentId: consent.id, error: error.message });
      }
    }

    return syncResults;
  }
}
```

### Data Processing Agreement Management

```typescript
class DPAManager {
  async createDPA(vendorId: string, config: DPAConfig): Promise<DataProcessingAgreement> {
    const dpa: DataProcessingAgreement = {
      id: crypto.randomUUID(),
      vendorId,
      dataCategories: config.dataCategories,
      processingPurposes: config.purposes,
      subProcessors: config.subProcessors,
      securityMeasures: config.securityMeasures,
      dataTransferMechanisms: config.transferMechanisms,
      retentionPeriods: config.retentionPeriods,
      signedAt: new Date(),
      expiresAt: config.expiresAt
    };

    await this.dpaStore.save(dpa);
    return dpa;
  }

  async validateDataSharing(vendorId: string, dataCategory: string): Promise<boolean> {
    const dpa = await this.dpaStore.findByVendor(vendorId);
    if (!dpa || dpa.expiresAt < new Date()) {
      return false;
    }

    return dpa.dataCategories.includes(dataCategory);
  }
}
```

## Security Considerations

### Data Minimization

- Collect only necessary personal data
- Implement purpose limitation controls
- Regular data inventory audits
- Automatic data expiration based on retention policies

### Secure Data Handling

- Encrypt personal data at rest and in transit
- Implement access controls for personal data
- Audit all access to personal data
- Secure deletion with verification

## Compliance Guidelines

- GDPR Articles 6, 7, 12-22 (consent and data subject rights)
- CCPA consumer rights requirements
- ePrivacy Directive cookie consent requirements
- LGPD (Brazil) data subject rights

## Testing Considerations

### Property-Based Tests

```typescript
describe('Privacy Controls Properties', () => {
  it('should maintain consent consistency', () => {
    fc.assert(fc.property(
      fc.record({
        userId: fc.string({ minLength: 1 }),
        purpose: fc.constantFrom(...Object.values(ConsentPurpose)),
        granted: fc.boolean()
      }),
      async ({ userId, purpose, granted }) => {
        const manager = new ConsentManagementService();
        
        await manager.recordConsent(userId, {
          id: crypto.randomUUID(),
          purpose,
          granted,
          grantedAt: new Date()
        });

        const hasConsent = await manager.checkConsent(userId, purpose);
        expect(hasConsent).toBe(granted);
      }
    ));
  });

  it('should properly handle consent withdrawal', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }),
      async (userId) => {
        const manager = new ConsentManagementService();
        const consentId = crypto.randomUUID();
        
        // Grant consent
        await manager.recordConsent(userId, {
          id: consentId,
          purpose: ConsentPurpose.MARKETING,
          granted: true,
          grantedAt: new Date()
        });

        // Withdraw consent
        await manager.withdrawConsent(userId, consentId);

        // Verify withdrawal
        const hasConsent = await manager.checkConsent(userId, ConsentPurpose.MARKETING);
        expect(hasConsent).toBe(false);
      }
    ));
  });
});
```
