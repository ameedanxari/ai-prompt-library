# Patient Data Management Template

## Purpose
This template provides comprehensive patterns for managing patient data in HIPAA-compliant healthcare applications, covering patient records, data lifecycle management, and privacy-preserving data operations.

## Instructions

1. **Setup Patient Registry**: Configure secure patient identification and registration
2. **Implement Data Encryption**: Deploy field-level encryption for sensitive PHI data
3. **Configure Access Controls**: Set up role-based access to patient information
4. **Setup Data Lifecycle**: Implement data retention and deletion policies
5. **Deploy Consent Management**: Configure patient consent and privacy preferences
6. **Implement Audit Logging**: Set up comprehensive patient data access tracking
7. **Configure Data Integration**: Enable secure data sharing with authorized systems

## Examples

### Example 1: Patient Record Creation
```typescript
interface PatientRegistration {
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other' | 'unknown';
    ssn?: string; // encrypted
    address: Address;
    phone: string;
    email: string;
  };
  insurance: InsuranceInfo[];
  emergencyContact: EmergencyContact;
  consentGiven: boolean;
  privacyPreferences: PrivacyPreferences;
}

const patient = await registerPatient({
  demographics: {
    firstName: "John",
    lastName: "Smith",
    dateOfBirth: "1985-06-15",
    gender: "male",
    address: {
      street: "123 Main St",
      city: "Anytown",
      state: "CA",
      zipCode: "12345"
    },
    phone: "+1-555-123-4567",
    email: "john.smith@email.com"
  },
  consentGiven: true,
  privacyPreferences: {
    allowDataSharing: false,
    allowResearch: true,
    communicationMethod: "email"
  }
});
```

### Example 2: Secure Data Access
```typescript
interface PatientDataAccess {
  patientId: string;
  requesterId: string;
  requesterRole: 'physician' | 'nurse' | 'admin' | 'patient';
  accessReason: 'treatment' | 'payment' | 'operations' | 'research';
  dataFields: string[];
  minimumNecessary: boolean;
  accessDuration: number; // hours
}

const patientData = await accessPatientData({
  patientId: "patient-123",
  requesterId: "doctor-456",
  requesterRole: "physician",
  accessReason: "treatment",
  dataFields: ["demographics", "allergies", "medications", "vitals"],
  minimumNecessary: true,
  accessDuration: 24
});
```

### Example 3: Data Lifecycle Management
```typescript
interface DataLifecyclePolicy {
  dataType: 'demographics' | 'clinical' | 'billing' | 'research';
  retentionPeriod: number; // years
  archivalPolicy: 'encrypt_archive' | 'secure_delete' | 'anonymize';
  accessRestrictions: AccessRestriction[];
  auditRequirements: AuditRequirement[];
}

const lifecycleManagement = await applyDataLifecycle({
  patientId: "patient-123",
  policies: [{
    dataType: "clinical",
    retentionPeriod: 7, // years
    archivalPolicy: "encrypt_archive",
    accessRestrictions: ["authorized_personnel_only"],
    auditRequirements: ["log_all_access", "quarterly_review"]
  }]
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| encryptionLevel | Patient data encryption level | string | Yes | "field-level" |
| dataRetentionYears | Default data retention period (years) | number | Yes | 7 |
| auditLogRetention | Audit log retention period (years) | number | Yes | 6 |
| consentRequired | Require explicit patient consent | boolean | Yes | true |
| minimumNecessary | Enforce minimum necessary data access | boolean | Yes | true |
| dataDeidentification | Enable data de-identification | boolean | No | false |
| crossBorderTransfer | Allow international data transfer | boolean | No | false |
| patientPortalAccess | Enable patient portal access | boolean | No | true |

## Expected Output

This template will produce:
- **Patient Registry System**: Secure patient identification and registration
- **Data Encryption Framework**: Field-level encryption for sensitive PHI data
- **Access Control Engine**: Role-based and purpose-based data access controls
- **Consent Management System**: Patient consent and privacy preference management
- **Data Lifecycle Manager**: Automated data retention and archival policies
- **Audit and Compliance System**: Comprehensive patient data access tracking
- **Patient Portal**: Secure patient access to their own health information
- **Data Integration APIs**: Secure interfaces for authorized system integration

## Context
Use this template when building healthcare applications that need to store, manage, and process patient health information (PHI) while maintaining strict compliance with healthcare privacy regulations.

## Core Components

### 1. Patient Record Structure

```typescript
interface PatientRecord {
  // Core identifiers (encrypted at rest)
  patientId: string;
  medicalRecordNumber: string;
  
  // Demographics (with privacy controls)
  demographics: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    gender: string;
    address: EncryptedAddress;
    phoneNumber: EncryptedString;
    email: EncryptedString;
    emergencyContact: EncryptedContact;
  };
  
  // Medical information
  medicalHistory: MedicalHistory[];
  allergies: Allergy[];
  medications: Medication[];
  conditions: MedicalCondition[];
  
  // Consent and privacy
  consentRecords: ConsentRecord[];
  privacyPreferences: PrivacyPreferences;
  
  // Audit trail
  createdAt: Date;
  updatedAt: Date;
  lastAccessedAt: Date;
  accessLog: AccessLogEntry[];
}
```

### 2. Data Access Controls

```typescript
interface PatientDataAccess {
  // Role-based access
  checkAccess(userId: string, patientId: string, operation: DataOperation): Promise<AccessResult>;
  
  // Minimum necessary principle
  getAuthorizedFields(userRole: UserRole, purpose: AccessPurpose): string[];
  
  // Break-glass access for emergencies
  emergencyAccess(userId: string, patientId: string, justification: string): Promise<EmergencyAccessResult>;
  
  // Consent verification
  verifyConsent(patientId: string, dataType: DataType, purpose: Purpose): Promise<ConsentStatus>;
}
```

### 3. Data Encryption and Security

```typescript
interface PatientDataSecurity {
  // Field-level encryption
  encryptSensitiveField(value: string, fieldType: FieldType): EncryptedField;
  decryptSensitiveField(encryptedField: EncryptedField, userContext: UserContext): string;
  
  // Data masking for different roles
  maskDataForRole(patientData: PatientRecord, userRole: UserRole): MaskedPatientRecord;
  
  // Secure data transmission
  secureTransfer(data: PatientData, destination: Endpoint): Promise<TransferResult>;
  
  // Data integrity verification
  verifyDataIntegrity(patientRecord: PatientRecord): IntegrityResult;
}
```

## Implementation Patterns

### Patient Registration and Onboarding

```typescript
class PatientRegistrationService {
  async registerPatient(registrationData: PatientRegistrationData): Promise<PatientRecord> {
    // 1. Validate required fields and consent
    await this.validateRegistrationData(registrationData);
    
    // 2. Check for duplicate records (using privacy-preserving matching)
    const duplicateCheck = await this.checkForDuplicates(registrationData);
    if (duplicateCheck.hasDuplicate) {
      throw new DuplicatePatientError(duplicateCheck.matchingRecords);
    }
    
    // 3. Encrypt sensitive information
    const encryptedData = await this.encryptSensitiveFields(registrationData);
    
    // 4. Create patient record with audit trail
    const patientRecord = await this.createPatientRecord(encryptedData);
    
    // 5. Log registration event
    await this.auditLogger.logPatientRegistration(patientRecord.patientId, registrationData.registeredBy);
    
    return patientRecord;
  }
  
  private async validateRegistrationData(data: PatientRegistrationData): Promise<void> {
    // Validate required fields
    if (!data.firstName || !data.lastName || !data.dateOfBirth) {
      throw new ValidationError('Required patient information missing');
    }
    
    // Validate consent records
    if (!data.consentRecords || data.consentRecords.length === 0) {
      throw new ConsentError('Patient consent required for registration');
    }
    
    // Validate data quality
    await this.dataQualityValidator.validate(data);
  }
}
```

### Patient Data Retrieval

```typescript
class PatientDataRetrievalService {
  async getPatientData(
    patientId: string, 
    requestingUserId: string, 
    purpose: AccessPurpose
  ): Promise<PatientRecord> {
    // 1. Verify access permissions
    const accessResult = await this.accessControl.checkAccess(
      requestingUserId, 
      patientId, 
      DataOperation.READ
    );
    
    if (!accessResult.authorized) {
      await this.auditLogger.logUnauthorizedAccess(requestingUserId, patientId);
      throw new UnauthorizedAccessError('Access denied to patient data');
    }
    
    // 2. Verify consent for the specific purpose
    const consentStatus = await this.consentManager.verifyConsent(
      patientId, 
      DataType.MEDICAL_RECORD, 
      purpose
    );
    
    if (!consentStatus.valid) {
      throw new ConsentError('Patient consent not valid for this purpose');
    }
    
    // 3. Retrieve and decrypt authorized data
    const patientRecord = await this.dataRepository.getPatientRecord(patientId);
    const authorizedFields = this.accessControl.getAuthorizedFields(
      accessResult.userRole, 
      purpose
    );
    
    // 4. Apply data masking based on user role
    const maskedRecord = this.dataMasking.maskDataForRole(
      patientRecord, 
      accessResult.userRole
    );
    
    // 5. Log data access
    await this.auditLogger.logDataAccess(
      requestingUserId, 
      patientId, 
      authorizedFields, 
      purpose
    );
    
    return maskedRecord;
  }
}
```

### Data Lifecycle Management

```typescript
class PatientDataLifecycleManager {
  async updatePatientData(
    patientId: string, 
    updates: PatientDataUpdate, 
    updatedBy: string
  ): Promise<PatientRecord> {
    // 1. Verify update permissions
    await this.verifyUpdatePermissions(updatedBy, patientId, updates);
    
    // 2. Validate data quality and consistency
    await this.validateUpdates(updates);
    
    // 3. Create versioned backup before update
    await this.createDataVersion(patientId, updatedBy);
    
    // 4. Apply updates with encryption
    const updatedRecord = await this.applyUpdates(patientId, updates);
    
    // 5. Log all changes
    await this.auditLogger.logDataUpdate(patientId, updates, updatedBy);
    
    return updatedRecord;
  }
  
  async archivePatientData(patientId: string, reason: ArchiveReason): Promise<void> {
    // 1. Verify archival permissions and legal requirements
    await this.verifyArchivalRequirements(patientId, reason);
    
    // 2. Create secure archive copy
    const archiveRecord = await this.createArchiveCopy(patientId);
    
    // 3. Update patient status to archived
    await this.updatePatientStatus(patientId, PatientStatus.ARCHIVED);
    
    // 4. Schedule data retention review
    await this.scheduleRetentionReview(patientId, reason);
    
    // 5. Log archival action
    await this.auditLogger.logDataArchival(patientId, reason);
  }
  
  async deletePatientData(patientId: string, deletionRequest: DeletionRequest): Promise<void> {
    // 1. Verify legal right to delete (e.g., patient request, retention expiry)
    await this.verifyDeletionRights(patientId, deletionRequest);
    
    // 2. Check for legal holds or ongoing treatments
    const legalHolds = await this.checkLegalHolds(patientId);
    if (legalHolds.hasActiveHolds) {
      throw new LegalHoldError('Cannot delete data under legal hold');
    }
    
    // 3. Perform secure deletion
    await this.secureDelete(patientId);
    
    // 4. Log deletion (maintaining minimal audit trail)
    await this.auditLogger.logDataDeletion(patientId, deletionRequest);
  }
}
```

## Privacy and Consent Management

### Consent Framework

```typescript
interface ConsentManager {
  // Record patient consent
  recordConsent(patientId: string, consent: ConsentRecord): Promise<void>;
  
  // Verify consent for specific operations
  verifyConsent(patientId: string, dataType: DataType, purpose: Purpose): Promise<ConsentStatus>;
  
  // Handle consent withdrawal
  withdrawConsent(patientId: string, consentId: string, reason: string): Promise<void>;
  
  // Consent expiration management
  checkConsentExpiration(patientId: string): Promise<ExpirationStatus>;
}

interface ConsentRecord {
  consentId: string;
  patientId: string;
  consentType: ConsentType;
  purpose: Purpose[];
  dataTypes: DataType[];
  grantedAt: Date;
  expiresAt?: Date;
  withdrawnAt?: Date;
  consentMethod: ConsentMethod; // electronic, written, verbal
  witnessedBy?: string;
  consentDocument?: string; // reference to signed document
}
```

### Privacy Preferences

```typescript
interface PrivacyPreferences {
  patientId: string;
  
  // Communication preferences
  communicationChannels: {
    email: boolean;
    sms: boolean;
    phone: boolean;
    mail: boolean;
  };
  
  // Data sharing preferences
  dataSharing: {
    researchParticipation: boolean;
    qualityImprovement: boolean;
    publicHealthReporting: boolean;
    emergencyAccess: boolean;
  };
  
  // Access restrictions
  restrictedUsers: string[]; // Users who should not access this patient's data
  restrictedPurposes: Purpose[]; // Purposes for which data should not be used
  
  // Notification preferences
  notifications: {
    dataAccess: boolean;
    dataSharing: boolean;
    securityEvents: boolean;
  };
}
```

## Data Quality and Validation

### Validation Rules

```typescript
class PatientDataValidator {
  async validatePatientData(data: PatientRecord): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    
    // Demographic validation
    if (!this.isValidDateOfBirth(data.demographics.dateOfBirth)) {
      errors.push(new ValidationError('Invalid date of birth'));
    }
    
    // Medical data consistency
    await this.validateMedicalConsistency(data);
    
    // Allergy and medication interactions
    await this.validateDrugAllergies(data.allergies, data.medications);
    
    // Data completeness for care quality
    await this.validateDataCompleteness(data);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings: await this.generateWarnings(data)
    };
  }
  
  private async validateMedicalConsistency(data: PatientRecord): Promise<void> {
    // Check for conflicting diagnoses
    // Validate medication dosages
    // Ensure allergy information is current
    // Verify care plan consistency
  }
}
```

## Integration Points

### EHR System Integration

```typescript
interface EHRIntegration {
  // Import patient data from external EHR
  importPatientData(ehrPatientId: string, ehrSystem: EHRSystem): Promise<PatientRecord>;
  
  // Export patient data to external EHR
  exportPatientData(patientId: string, targetEHR: EHRSystem): Promise<ExportResult>;
  
  // Synchronize data changes
  syncPatientData(patientId: string, ehrSystem: EHRSystem): Promise<SyncResult>;
  
  // Handle data format conversions
  convertDataFormat(data: any, sourceFormat: DataFormat, targetFormat: DataFormat): Promise<any>;
}
```

### Healthcare Information Exchange (HIE)

```typescript
interface HIEIntegration {
  // Query patient data across healthcare networks
  queryPatientAcrossNetworks(patientIdentifiers: PatientIdentifier[]): Promise<HIEQueryResult>;
  
  // Share patient data with authorized providers
  sharePatientData(patientId: string, targetProvider: Provider, purpose: Purpose): Promise<ShareResult>;
  
  // Receive patient data from other providers
  receivePatientData(incomingData: HIEPatientData): Promise<IntegrationResult>;
}
```

## Security Considerations

### Data Encryption

- **At Rest**: All PHI encrypted using AES-256 encryption
- **In Transit**: TLS 1.3 for all data transmission
- **Field Level**: Sensitive fields individually encrypted with separate keys
- **Key Management**: Hardware Security Modules (HSM) for key storage

### Access Controls

- **Role-Based Access Control (RBAC)**: Granular permissions by healthcare role
- **Attribute-Based Access Control (ABAC)**: Context-aware access decisions
- **Minimum Necessary**: Only required data fields accessible per role
- **Break-Glass Access**: Emergency access with full audit trail

### Audit and Monitoring

- **Comprehensive Logging**: All data access, modifications, and system events
- **Real-Time Monitoring**: Suspicious activity detection and alerting
- **Audit Reports**: Regular compliance and security audit reports
- **Data Loss Prevention**: Monitoring for unauthorized data exfiltration

## Compliance Requirements

### HIPAA Compliance Checklist

- [ ] Administrative Safeguards implemented
- [ ] Physical Safeguards in place
- [ ] Technical Safeguards configured
- [ ] Business Associate Agreements signed
- [ ] Risk Assessment completed
- [ ] Workforce Training conducted
- [ ] Incident Response Plan established
- [ ] Breach Notification procedures defined

### Documentation Requirements

- Data flow diagrams
- Privacy impact assessments
- Security risk assessments
- Policies and procedures documentation
- Training records
- Audit logs and reports
- Incident response documentation

## Testing Considerations

### Security Testing

```typescript
describe('Patient Data Security', () => {
  test('should encrypt all PHI fields', async () => {
    const patientData = createTestPatientData();
    const storedData = await patientRepository.save(patientData);
    
    // Verify sensitive fields are encrypted
    expect(storedData.demographics.phoneNumber).toMatch(/^encrypted:/);
    expect(storedData.demographics.email).toMatch(/^encrypted:/);
  });
  
  test('should enforce role-based access controls', async () => {
    const nurseUser = createNurseUser();
    const patientId = 'test-patient-123';
    
    // Nurse should not access financial information
    await expect(
      patientDataService.getPatientData(patientId, nurseUser.id, AccessPurpose.BILLING)
    ).rejects.toThrow(UnauthorizedAccessError);
  });
});
```

### Compliance Testing

```typescript
describe('HIPAA Compliance', () => {
  test('should log all data access events', async () => {
    const patientId = 'test-patient-123';
    const userId = 'doctor-456';
    
    await patientDataService.getPatientData(patientId, userId, AccessPurpose.TREATMENT);
    
    const auditLogs = await auditLogger.getAccessLogs(patientId);
    expect(auditLogs).toHaveLength(1);
    expect(auditLogs[0].userId).toBe(userId);
    expect(auditLogs[0].purpose).toBe(AccessPurpose.TREATMENT);
  });
});
```

## Performance Considerations

### Data Retrieval Optimization

- **Lazy Loading**: Load patient data sections on demand
- **Caching Strategy**: Cache frequently accessed, non-sensitive metadata
- **Database Indexing**: Optimize queries while maintaining encryption
- **Data Pagination**: Handle large patient datasets efficiently

### Scalability Patterns

- **Horizontal Partitioning**: Distribute patient data across multiple databases
- **Read Replicas**: Separate read and write operations for performance
- **Microservices Architecture**: Separate patient data services by domain
- **Event-Driven Updates**: Asynchronous processing for non-critical updates

This template provides a comprehensive foundation for building HIPAA-compliant patient data management systems with strong security, privacy, and compliance controls.