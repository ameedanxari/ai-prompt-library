# Privacy Analytics Template

## Purpose

This template provides comprehensive patterns for implementing privacy-compliant analytics systems that respect user privacy while delivering valuable insights. It covers GDPR compliance, consent management, data anonymization, and privacy-first analytics approaches for building trustworthy data collection systems.

## Context

Privacy analytics is essential for building user trust while maintaining the ability to make data-driven decisions. Modern privacy regulations like GDPR, CCPA, and emerging privacy laws require organizations to implement privacy-by-design analytics systems. This template addresses the complexity of building analytics that provide valuable insights while respecting user privacy rights and regulatory requirements.

## Instructions

1. **Setup Privacy Infrastructure**: Configure privacy-compliant data collection
2. **Implement Consent Management**: Build comprehensive consent and preference systems
3. **Add Data Anonymization**: Enable privacy-preserving data processing
4. **Configure Privacy Controls**: Implement user privacy rights and controls
5. **Enable Differential Privacy**: Add advanced privacy-preserving techniques
6. **Add Compliance Monitoring**: Build privacy compliance tracking and reporting
7. **Test Privacy Compliance**: Validate privacy controls and data handling

## Examples

### Example 1: Privacy Analytics Service
```typescript
interface PrivacyAnalyticsService {
  trackEventWithConsent(event: AnalyticsEvent, consent: ConsentData): Promise<void>;
  anonymizeUserData(userId: string): Promise<void>;
  handleDataDeletionRequest(userId: string): Promise<void>;
  getPrivacyReport(timeRange: TimeRange): Promise<PrivacyReport>;
  updateConsentPreferences(userId: string, preferences: ConsentPreferences): Promise<void>;
}

const privacyAnalytics = new PrivacyAnalyticsService();
await privacyAnalytics.trackEventWithConsent({
  eventType: 'page_view',
  properties: { page: '/products' }
}, {
  analytics: true,
  marketing: false,
  personalization: true
});
```

### Example 2: Consent Management
```typescript
interface ConsentManager {
  requestConsent(purposes: ConsentPurpose[]): Promise<ConsentResponse>;
  updateConsent(userId: string, consent: ConsentData): Promise<void>;
  checkConsent(userId: string, purpose: string): Promise<boolean>;
  withdrawConsent(userId: string, purposes: string[]): Promise<void>;
  getConsentHistory(userId: string): Promise<ConsentHistory[]>;
}

const consent = await consentManager.requestConsent([
  { purpose: 'analytics', required: false, description: 'Website analytics' },
  { purpose: 'marketing', required: false, description: 'Marketing communications' }
]);
```

### Example 3: Data Anonymization
```typescript
interface DataAnonymizer {
  anonymizeEvent(event: AnalyticsEvent): Promise<AnonymizedEvent>;
  pseudonymizeUserId(userId: string): Promise<string>;
  applyDifferentialPrivacy(dataset: Dataset, epsilon: number): Promise<PrivateDataset>;
  validateAnonymization(data: any[]): Promise<AnonymizationReport>;
}

const anonymizedEvent = await anonymizer.anonymizeEvent({
  userId: 'user-123',
  eventType: 'purchase',
  properties: { amount: 99.99, email: 'user@example.com' }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableConsentManagement | Enable consent management system | boolean | No | true |
| enableDataAnonymization | Enable automatic data anonymization | boolean | No | true |
| enableDifferentialPrivacy | Enable differential privacy techniques | boolean | No | false |
| defaultConsentExpiry | Default consent expiry in days | number | No | 365 |
| anonymizationLevel | Level of anonymization (low/medium/high) | string | No | medium |
| enableRightToDelete | Enable right to deletion (GDPR Article 17) | boolean | No | true |
| enableDataPortability | Enable data portability (GDPR Article 20) | boolean | No | true |
| privacyByDefault | Enable privacy by default settings | boolean | No | true |

## Expected Output

This template will produce:
- **Consent Management System**: Comprehensive consent collection and management
- **Data Anonymization Engine**: Privacy-preserving data processing
- **Privacy Controls Dashboard**: User privacy preferences and controls
- **Compliance Monitoring**: GDPR/CCPA compliance tracking and reporting
- **Differential Privacy**: Advanced privacy-preserving analytics
- **Data Subject Rights**: Implementation of privacy rights (access, deletion, portability)
- **Privacy Impact Assessment**: Privacy risk evaluation and mitigation
- **Audit Trail**: Complete privacy compliance audit logging

## Implementation Patterns

### Privacy Analytics Architecture

```typescript
// Core Privacy Analytics Architecture
interface PrivacyAnalyticsSystem {
  consentManager: ConsentManager;
  dataAnonymizer: DataAnonymizer;
  privacyController: PrivacyController;
  complianceMonitor: ComplianceMonitor;
  differentialPrivacy: DifferentialPrivacyEngine;
  auditLogger: PrivacyAuditLogger;
}

interface ConsentData {
  userId: string;
  consentId: string;
  timestamp: Date;
  
  // Consent purposes
  purposes: ConsentPurpose[];
  
  // Consent metadata
  consentMethod: 'explicit' | 'implicit' | 'legitimate_interest';
  consentSource: string;
  ipAddress?: string;
  userAgent?: string;
  
  // Expiry and withdrawal
  expiryDate?: Date;
  withdrawnAt?: Date;
  withdrawalReason?: string;
  
  // Legal basis
  legalBasis: LegalBasis;
  jurisdiction: string;
}

interface ConsentPurpose {
  purpose: string;
  granted: boolean;
  required: boolean;
  description: string;
  
  // Purpose metadata
  category: 'necessary' | 'analytics' | 'marketing' | 'personalization';
  dataTypes: string[];
  retentionPeriod: number;
  
  // Third party sharing
  thirdParties?: ThirdPartySharing[];
}

interface PrivacyEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  
  // Privacy-compliant identifiers
  pseudonymousId?: string;
  sessionId: string;
  
  // Event data (anonymized)
  properties: Record<string, any>;
  
  // Privacy metadata
  consentStatus: ConsentStatus;
  anonymizationLevel: AnonymizationLevel;
  legalBasis: LegalBasis;
  
  // Data minimization
  dataMinimized: boolean;
  retentionPeriod: number;
}
```

**Consent Management Implementation**
```typescript
class ConsentManager {
  private consentStore: ConsentStore;
  private legalBasisEngine: LegalBasisEngine;
  private notificationService: NotificationService;

  async requestConsent(
    userId: string, 
    purposes: ConsentPurpose[], 
    context: ConsentContext
  ): Promise<ConsentResponse> {
    // Check if consent already exists
    const existingConsent = await this.consentStore.getLatestConsent(userId);
    
    if (existingConsent && !this.isConsentExpired(existingConsent)) {
      return {
        consentId: existingConsent.consentId,
        status: 'existing',
        purposes: existingConsent.purposes
      };
    }

    // Determine legal basis for each purpose
    const purposesWithLegalBasis = await Promise.all(
      purposes.map(async purpose => ({
        ...purpose,
        legalBasis: await this.legalBasisEngine.determineLegalBasis(purpose, context)
      }))
    );

    // Create consent request
    const consentRequest: ConsentRequest = {
      requestId: this.generateConsentRequestId(),
      userId,
      purposes: purposesWithLegalBasis,
      requestedAt: new Date(),
      context,
      expiryDate: this.calculateExpiryDate(context.jurisdiction)
    };

    await this.consentStore.saveConsentRequest(consentRequest);

    return {
      consentId: consentRequest.requestId,
      status: 'pending',
      purposes: purposesWithLegalBasis,
      consentUrl: this.generateConsentUrl(consentRequest.requestId)
    };
  }

  async recordConsentDecision(
    consentRequestId: string, 
    decisions: ConsentDecision[]
  ): Promise<ConsentData> {
    const consentRequest = await this.consentStore.getConsentRequest(consentRequestId);
    if (!consentRequest) {
      throw new Error('Consent request not found');
    }

    // Validate decisions
    const validationResult = this.validateConsentDecisions(consentRequest, decisions);
    if (!validationResult.valid) {
      throw new Error(`Invalid consent decisions: ${validationResult.errors.join(', ')}`);
    }

    // Create consent record
    const consentData: ConsentData = {
      userId: consentRequest.userId,
      consentId: this.generateConsentId(),
      timestamp: new Date(),
      purposes: this.mergeConsentDecisions(consentRequest.purposes, decisions),
      consentMethod: 'explicit',
      consentSource: consentRequest.context.source,
      ipAddress: consentRequest.context.ipAddress,
      userAgent: consentRequest.context.userAgent,
      expiryDate: consentRequest.expiryDate,
      legalBasis: this.determinePrimaryLegalBasis(decisions),
      jurisdiction: consentRequest.context.jurisdiction
    };

    await this.consentStore.saveConsent(consentData);

    // Update user preferences
    await this.updateUserPreferences(consentData.userId, consentData.purposes);

    // Notify relevant systems
    await this.notifyConsentUpdate(consentData);

    // Log for audit
    await this.auditLogger.logConsentDecision(consentData);

    return consentData;
  }

  async checkConsent(userId: string, purpose: string): Promise<ConsentCheck> {
    const latestConsent = await this.consentStore.getLatestConsent(userId);
    
    if (!latestConsent) {
      return {
        granted: false,
        reason: 'no_consent_recorded',
        legalBasis: null
      };
    }

    if (this.isConsentExpired(latestConsent)) {
      return {
        granted: false,
        reason: 'consent_expired',
        legalBasis: null,
        expiredAt: latestConsent.expiryDate
      };
    }

    if (latestConsent.withdrawnAt) {
      return {
        granted: false,
        reason: 'consent_withdrawn',
        legalBasis: null,
        withdrawnAt: latestConsent.withdrawnAt
      };
    }

    const purposeConsent = latestConsent.purposes.find(p => p.purpose === purpose);
    
    if (!purposeConsent) {
      return {
        granted: false,
        reason: 'purpose_not_found',
        legalBasis: null
      };
    }

    return {
      granted: purposeConsent.granted,
      reason: purposeConsent.granted ? 'consent_granted' : 'consent_denied',
      legalBasis: purposeConsent.legalBasis,
      grantedAt: latestConsent.timestamp
    };
  }

  async withdrawConsent(
    userId: string, 
    purposes: string[], 
    reason?: string
  ): Promise<void> {
    const latestConsent = await this.consentStore.getLatestConsent(userId);
    if (!latestConsent) {
      throw new Error('No consent found to withdraw');
    }

    // Create withdrawal record
    const withdrawal: ConsentWithdrawal = {
      withdrawalId: this.generateWithdrawalId(),
      originalConsentId: latestConsent.consentId,
      userId,
      withdrawnPurposes: purposes,
      withdrawnAt: new Date(),
      reason,
      ipAddress: await this.getCurrentUserIP(userId),
      userAgent: await this.getCurrentUserAgent(userId)
    };

    await this.consentStore.saveWithdrawal(withdrawal);

    // Update consent record
    latestConsent.withdrawnAt = new Date();
    latestConsent.withdrawalReason = reason;
    
    // Update specific purposes
    for (const purpose of purposes) {
      const purposeConsent = latestConsent.purposes.find(p => p.purpose === purpose);
      if (purposeConsent) {
        purposeConsent.granted = false;
      }
    }

    await this.consentStore.updateConsent(latestConsent);

    // Notify systems of withdrawal
    await this.notifyConsentWithdrawal(withdrawal);

    // Trigger data deletion if required
    if (purposes.includes('analytics') || purposes.includes('marketing')) {
      await this.triggerDataDeletion(userId, purposes);
    }

    // Log for audit
    await this.auditLogger.logConsentWithdrawal(withdrawal);
  }

  private isConsentExpired(consent: ConsentData): boolean {
    if (!consent.expiryDate) return false;
    return new Date() > consent.expiryDate;
  }

  private calculateExpiryDate(jurisdiction: string): Date {
    // Different jurisdictions have different consent expiry requirements
    const expiryMonths = this.getConsentExpiryMonths(jurisdiction);
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);
    return expiryDate;
  }
}
```

### Data Anonymization Engine

```typescript
class DataAnonymizer {
  private anonymizationRules: AnonymizationRule[];
  private pseudonymizationService: PseudonymizationService;
  private differentialPrivacy: DifferentialPrivacyEngine;

  async anonymizeEvent(event: AnalyticsEvent): Promise<AnonymizedEvent> {
    const anonymizationLevel = this.determineAnonymizationLevel(event);
    
    let anonymizedEvent = { ...event };

    // Apply anonymization rules based on level
    switch (anonymizationLevel) {
      case 'high':
        anonymizedEvent = await this.applyHighAnonymization(anonymizedEvent);
        break;
      case 'medium':
        anonymizedEvent = await this.applyMediumAnonymization(anonymizedEvent);
        break;
      case 'low':
        anonymizedEvent = await this.applyLowAnonymization(anonymizedEvent);
        break;
    }

    // Apply differential privacy if enabled
    if (this.config.enableDifferentialPrivacy) {
      anonymizedEvent = await this.differentialPrivacy.addNoise(anonymizedEvent);
    }

    return {
      ...anonymizedEvent,
      anonymizationLevel,
      anonymizedAt: new Date(),
      originalEventId: event.eventId
    };
  }

  private async applyHighAnonymization(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    return {
      ...event,
      // Remove all direct identifiers
      userId: undefined,
      sessionId: this.generateAnonymousSessionId(),
      ipAddress: undefined,
      
      // Anonymize properties
      properties: await this.anonymizeProperties(event.properties, 'high'),
      
      // Generalize timestamps
      timestamp: this.generalizeTimestamp(event.timestamp, 'hour'),
      
      // Remove device fingerprinting data
      userAgent: undefined,
      deviceId: undefined
    };
  }

  private async applyMediumAnonymization(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    return {
      ...event,
      // Pseudonymize user ID
      userId: event.userId ? await this.pseudonymizationService.pseudonymize(event.userId) : undefined,
      
      // Keep session but pseudonymize
      sessionId: await this.pseudonymizationService.pseudonymize(event.sessionId),
      
      // Mask IP address
      ipAddress: event.ipAddress ? this.maskIPAddress(event.ipAddress) : undefined,
      
      // Anonymize sensitive properties
      properties: await this.anonymizeProperties(event.properties, 'medium'),
      
      // Generalize user agent
      userAgent: event.userAgent ? this.generalizeUserAgent(event.userAgent) : undefined
    };
  }

  private async applyLowAnonymization(event: AnalyticsEvent): Promise<AnalyticsEvent> {
    return {
      ...event,
      // Keep pseudonymized user ID
      userId: event.userId ? await this.pseudonymizationService.pseudonymize(event.userId) : undefined,
      
      // Remove only highly sensitive data
      properties: await this.anonymizeProperties(event.properties, 'low'),
      
      // Mask IP address
      ipAddress: event.ipAddress ? this.maskIPAddress(event.ipAddress) : undefined
    };
  }

  private async anonymizeProperties(
    properties: Record<string, any>, 
    level: AnonymizationLevel
  ): Promise<Record<string, any>> {
    const anonymized: Record<string, any> = {};

    for (const [key, value] of Object.entries(properties)) {
      const rule = this.findAnonymizationRule(key);
      
      if (rule) {
        anonymized[key] = await this.applyAnonymizationRule(value, rule, level);
      } else {
        // Default anonymization based on data type
        anonymized[key] = await this.applyDefaultAnonymization(key, value, level);
      }
    }

    return anonymized;
  }

  private async applyAnonymizationRule(
    value: any, 
    rule: AnonymizationRule, 
    level: AnonymizationLevel
  ): Promise<any> {
    switch (rule.type) {
      case 'remove':
        return level === 'high' ? undefined : value;
        
      case 'mask':
        return this.maskValue(value, rule.maskPattern);
        
      case 'generalize':
        return this.generalizeValue(value, rule.generalizationLevel[level]);
        
      case 'pseudonymize':
        return await this.pseudonymizationService.pseudonymize(value.toString());
        
      case 'hash':
        return this.hashValue(value);
        
      case 'categorize':
        return this.categorizeValue(value, rule.categories);
        
      default:
        return value;
    }
  }

  private maskIPAddress(ipAddress: string): string {
    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      // IPv4: mask last octet
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    } else {
      // IPv6: mask last 64 bits
      const ipv6Parts = ipAddress.split(':');
      return ipv6Parts.slice(0, 4).join(':') + '::';
    }
  }

  private generalizeTimestamp(timestamp: Date, granularity: 'hour' | 'day' | 'week'): Date {
    const generalized = new Date(timestamp);
    
    switch (granularity) {
      case 'hour':
        generalized.setMinutes(0, 0, 0);
        break;
      case 'day':
        generalized.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const dayOfWeek = generalized.getDay();
        generalized.setDate(generalized.getDate() - dayOfWeek);
        generalized.setHours(0, 0, 0, 0);
        break;
    }
    
    return generalized;
  }

  async validateAnonymization(data: any[]): Promise<AnonymizationReport> {
    const report: AnonymizationReport = {
      totalRecords: data.length,
      anonymizationIssues: [],
      riskScore: 0,
      recommendations: []
    };

    // Check for direct identifiers
    const directIdentifiers = this.findDirectIdentifiers(data);
    if (directIdentifiers.length > 0) {
      report.anonymizationIssues.push({
        type: 'direct_identifiers',
        severity: 'high',
        count: directIdentifiers.length,
        fields: directIdentifiers
      });
    }

    // Check for quasi-identifiers
    const quasiIdentifiers = this.findQuasiIdentifiers(data);
    if (quasiIdentifiers.length > 0) {
      report.anonymizationIssues.push({
        type: 'quasi_identifiers',
        severity: 'medium',
        count: quasiIdentifiers.length,
        fields: quasiIdentifiers
      });
    }

    // Calculate k-anonymity
    const kAnonymity = this.calculateKAnonymity(data);
    if (kAnonymity < 5) {
      report.anonymizationIssues.push({
        type: 'low_k_anonymity',
        severity: 'high',
        value: kAnonymity,
        description: `K-anonymity is ${kAnonymity}, should be at least 5`
      });
    }

    // Calculate risk score
    report.riskScore = this.calculateRiskScore(report.anonymizationIssues);

    // Generate recommendations
    report.recommendations = this.generateAnonymizationRecommendations(report.anonymizationIssues);

    return report;
  }
}
```

### Privacy Controller

```typescript
class PrivacyController {
  private consentManager: ConsentManager;
  private dataStore: DataStore;
  private auditLogger: PrivacyAuditLogger;

  async handleDataSubjectAccessRequest(userId: string): Promise<DataSubjectAccessResponse> {
    // Verify user identity
    await this.verifyUserIdentity(userId);

    // Collect all user data
    const userData = await this.collectUserData(userId);

    // Generate data export
    const dataExport = await this.generateDataExport(userData);

    // Log access request
    await this.auditLogger.logDataAccess(userId, 'subject_access_request');

    return {
      requestId: this.generateRequestId(),
      userId,
      requestDate: new Date(),
      dataExport,
      format: 'json',
      downloadUrl: await this.generateSecureDownloadUrl(dataExport)
    };
  }

  async handleDataDeletionRequest(
    userId: string, 
    deletionScope: DeletionScope
  ): Promise<DataDeletionResponse> {
    // Verify user identity and right to deletion
    await this.verifyDeletionRight(userId, deletionScope);

    // Check for legal obligations to retain data
    const retentionObligations = await this.checkRetentionObligations(userId);
    
    if (retentionObligations.length > 0) {
      return {
        requestId: this.generateRequestId(),
        status: 'partial_deletion',
        deletedData: [],
        retainedData: retentionObligations,
        reason: 'Legal obligations require data retention'
      };
    }

    // Perform data deletion
    const deletionResult = await this.performDataDeletion(userId, deletionScope);

    // Notify third parties if required
    await this.notifyThirdPartyDeletion(userId, deletionScope);

    // Log deletion
    await this.auditLogger.logDataDeletion(userId, deletionScope, deletionResult);

    return {
      requestId: this.generateRequestId(),
      status: 'completed',
      deletedData: deletionResult.deletedData,
      retainedData: deletionResult.retainedData,
      completedAt: new Date()
    };
  }

  async handleDataPortabilityRequest(userId: string): Promise<DataPortabilityResponse> {
    // Verify user identity
    await this.verifyUserIdentity(userId);

    // Collect portable data (structured, commonly used formats)
    const portableData = await this.collectPortableData(userId);

    // Convert to machine-readable format
    const structuredData = await this.convertToStructuredFormat(portableData);

    // Generate secure download
    const downloadPackage = await this.createDownloadPackage(structuredData);

    // Log portability request
    await this.auditLogger.logDataPortability(userId);

    return {
      requestId: this.generateRequestId(),
      userId,
      requestDate: new Date(),
      dataPackage: downloadPackage,
      format: 'json',
      downloadUrl: await this.generateSecureDownloadUrl(downloadPackage),
      expiryDate: this.calculateDownloadExpiry()
    };
  }

  private async collectUserData(userId: string): Promise<UserDataCollection> {
    const [
      profileData,
      analyticsData,
      consentData,
      interactionData
    ] = await Promise.all([
      this.dataStore.getUserProfile(userId),
      this.dataStore.getUserAnalytics(userId),
      this.consentManager.getConsentHistory(userId),
      this.dataStore.getUserInteractions(userId)
    ]);

    return {
      profile: profileData,
      analytics: analyticsData,
      consent: consentData,
      interactions: interactionData,
      collectedAt: new Date()
    };
  }

  private async performDataDeletion(
    userId: string, 
    scope: DeletionScope
  ): Promise<DeletionResult> {
    const deletionTasks: Promise<DeletionTaskResult>[] = [];

    // Delete from different data stores based on scope
    if (scope.includeAnalytics) {
      deletionTasks.push(this.dataStore.deleteUserAnalytics(userId));
    }

    if (scope.includeProfile) {
      deletionTasks.push(this.dataStore.deleteUserProfile(userId));
    }

    if (scope.includeInteractions) {
      deletionTasks.push(this.dataStore.deleteUserInteractions(userId));
    }

    if (scope.includeConsent) {
      deletionTasks.push(this.consentManager.deleteConsentHistory(userId));
    }

    // Execute deletions
    const results = await Promise.all(deletionTasks);

    // Aggregate results
    const deletedData = results.flatMap(r => r.deletedData);
    const retainedData = results.flatMap(r => r.retainedData);

    return {
      deletedData,
      retainedData,
      deletionDate: new Date()
    };
  }

  async generatePrivacyReport(timeRange: TimeRange): Promise<PrivacyReport> {
    const [
      consentMetrics,
      deletionRequests,
      accessRequests,
      complianceIssues
    ] = await Promise.all([
      this.calculateConsentMetrics(timeRange),
      this.getDataDeletionRequests(timeRange),
      this.getDataAccessRequests(timeRange),
      this.identifyComplianceIssues(timeRange)
    ]);

    return {
      reportId: this.generateReportId(),
      generatedAt: new Date(),
      timeRange,
      consentMetrics,
      dataSubjectRequests: {
        accessRequests: accessRequests.length,
        deletionRequests: deletionRequests.length,
        portabilityRequests: await this.getPortabilityRequestCount(timeRange)
      },
      complianceScore: this.calculateComplianceScore(complianceIssues),
      complianceIssues,
      recommendations: this.generateComplianceRecommendations(complianceIssues)
    };
  }
}
```

### Differential Privacy Engine

```typescript
class DifferentialPrivacyEngine {
  private epsilonBudget: EpsilonBudgetManager;
  private noiseGenerator: NoiseGenerator;

  async addNoise(
    data: any, 
    epsilon: number, 
    sensitivity: number = 1
  ): Promise<any> {
    // Check epsilon budget
    if (!this.epsilonBudget.canSpend(epsilon)) {
      throw new Error('Insufficient epsilon budget for this query');
    }

    // Add Laplace noise for differential privacy
    const noisyData = this.addLaplaceNoise(data, epsilon, sensitivity);

    // Consume epsilon budget
    this.epsilonBudget.spend(epsilon);

    return noisyData;
  }

  private addLaplaceNoise(data: any, epsilon: number, sensitivity: number): any {
    if (typeof data === 'number') {
      const scale = sensitivity / epsilon;
      const noise = this.noiseGenerator.laplace(0, scale);
      return data + noise;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.addLaplaceNoise(item, epsilon, sensitivity));
    }

    if (typeof data === 'object' && data !== null) {
      const noisyObject: any = {};
      for (const [key, value] of Object.entries(data)) {
        noisyObject[key] = this.addLaplaceNoise(value, epsilon, sensitivity);
      }
      return noisyObject;
    }

    return data; // Return unchanged for non-numeric data
  }

  async queryWithDifferentialPrivacy(
    query: PrivacyQuery,
    epsilon: number
  ): Promise<PrivateQueryResult> {
    // Calculate query sensitivity
    const sensitivity = this.calculateQuerySensitivity(query);

    // Execute query
    const rawResult = await this.executeQuery(query);

    // Add noise
    const noisyResult = await this.addNoise(rawResult, epsilon, sensitivity);

    // Post-process to ensure valid results
    const processedResult = this.postProcessResult(noisyResult, query);

    return {
      result: processedResult,
      epsilon,
      sensitivity,
      noiseAdded: true,
      queryId: query.id
    };
  }

  private calculateQuerySensitivity(query: PrivacyQuery): number {
    // Calculate how much the query result can change with one record
    switch (query.type) {
      case 'count':
        return 1; // Adding/removing one record changes count by 1
      case 'sum':
        return query.maxValue || 1; // Maximum value a single record can contribute
      case 'average':
        return (query.maxValue || 1) / (query.minDatasetSize || 1);
      default:
        return 1;
    }
  }
}
```

## Integration Points

### Privacy Management Platform Integration
```typescript
interface PrivacyPlatformIntegration {
  // OneTrust integration
  oneTrust: {
    apiKey: string;
    enableConsentSync: boolean;
    cookieCategories: string[];
  };
  
  // TrustArc integration
  trustArc: {
    accountId: string;
    enablePreferenceCenter: boolean;
    privacyPolicies: string[];
  };
  
  // Custom privacy platform
  customPlatform: {
    consentEndpoint: string;
    preferencesEndpoint: string;
    deletionEndpoint: string;
  };
}

class PrivacyIntegrationService {
  async syncConsentToPrivacyPlatform(consent: ConsentData): Promise<void> {
    if (this.config.oneTrust.enabled) {
      await this.syncToOneTrust(consent);
    }
    
    if (this.config.trustArc.enabled) {
      await this.syncToTrustArc(consent);
    }
    
    if (this.config.customPlatform.enabled) {
      await this.syncToCustomPlatform(consent);
    }
  }
}
```

## Security Considerations

### Privacy Data Protection
```typescript
class PrivacyDataProtection {
  async encryptSensitiveData(data: any): Promise<EncryptedData> {
    // Use field-level encryption for sensitive data
    const encryptedFields = await this.encryptFields(data, this.getSensitiveFields());
    
    return {
      ...data,
      ...encryptedFields,
      encrypted: true,
      encryptionVersion: this.getEncryptionVersion()
    };
  }

  async implementDataMinimization(
    data: any, 
    purpose: string
  ): Promise<MinimizedData> {
    // Only collect data necessary for the specified purpose
    const necessaryFields = this.getNecessaryFields(purpose);
    
    const minimizedData: any = {};
    for (const field of necessaryFields) {
      if (data[field] !== undefined) {
        minimizedData[field] = data[field];
      }
    }
    
    return {
      data: minimizedData,
      purpose,
      minimizedAt: new Date(),
      originalFieldCount: Object.keys(data).length,
      minimizedFieldCount: Object.keys(minimizedData).length
    };
  }
}
```

## Testing Considerations

### Privacy Compliance Testing
```typescript
describe('Privacy Analytics Compliance', () => {
  it('should respect user consent preferences', async () => {
    const userId = 'test-user';
    
    // Set consent preferences
    await consentManager.updateConsent(userId, {
      analytics: false,
      marketing: true
    });
    
    // Attempt to track analytics event
    const result = await privacyAnalytics.trackEventWithConsent({
      eventType: 'page_view',
      userId
    }, { analytics: true });
    
    expect(result.tracked).toBe(false);
    expect(result.reason).toBe('consent_not_granted');
  });

  it('should anonymize data correctly', async () => {
    const sensitiveEvent = {
      userId: 'user-123',
      email: 'user@example.com',
      ipAddress: '192.168.1.100'
    };
    
    const anonymized = await dataAnonymizer.anonymizeEvent(sensitiveEvent);
    
    expect(anonymized.userId).toBeUndefined();
    expect(anonymized.email).toBeUndefined();
    expect(anonymized.ipAddress).toBe('192.168.1.0');
  });

  it('should handle data deletion requests', async () => {
    const userId = 'test-user';
    
    // Create some user data
    await analytics.trackEvent(userId, { eventType: 'test_event' });
    
    // Request deletion
    await privacyController.handleDataDeletionRequest(userId, {
      includeAnalytics: true,
      includeProfile: true
    });
    
    // Verify data is deleted
    const userData = await dataStore.getUserData(userId);
    expect(userData).toBeNull();
  });

  it('should add differential privacy noise', async () => {
    const originalCount = 1000;
    const epsilon = 1.0;
    
    const noisyCount = await differentialPrivacy.addNoise(originalCount, epsilon);
    
    // Should be different due to noise
    expect(noisyCount).not.toBe(originalCount);
    
    // Should be reasonably close
    expect(Math.abs(noisyCount - originalCount)).toBeLessThan(50);
  });
});
```

## Real-World Considerations

### Regulatory Compliance
- Implement jurisdiction-specific privacy controls (GDPR, CCPA, LGPD)
- Maintain detailed audit logs for regulatory inspections
- Regular privacy impact assessments for new features
- Staff training on privacy regulations and data handling

### Technical Implementation
- Use privacy-by-design principles in system architecture
- Implement data minimization at collection and processing stages
- Regular security audits and penetration testing
- Automated compliance monitoring and alerting

### User Experience
- Clear and understandable privacy notices
- Granular consent controls without dark patterns
- Easy-to-use privacy preference centers
- Transparent data usage explanations

### Business Considerations
- Balance privacy protection with business analytics needs
- Cost-benefit analysis of privacy-preserving techniques
- Privacy as a competitive advantage and trust builder
- Regular review and updates of privacy practices