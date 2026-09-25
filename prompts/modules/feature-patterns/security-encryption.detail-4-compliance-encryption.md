### 4. Compliance-Ready Encryption Implementation
```typescript
// compliance-encryption.ts - GDPR, HIPAA, SOC 2 compliant encryption
export class ComplianceEncryptionService {
  private auditLogger: AuditLogger;
  private keyManager: KeyManager;
  private encryptionService: ComprehensiveEncryptionService;
  
  constructor() {
    this.auditLogger = new AuditLogger();
    this.keyManager = new KeyManager();
    this.encryptionService = new ComprehensiveEncryptionService();
  }
  
  async encryptPII(data: PIIData, userId: string, purpose: string): Promise<EncryptedPIIData> {
    // Log data processing for GDPR compliance
    await this.auditLogger.logDataProcessing({
      userId,
      dataType: 'PII',
      operation: 'encrypt',
      purpose,
      legalBasis: data.legalBasis,
      timestamp: new Date(),
      dataFields: Object.keys(data.personalData)
    });
    
    // Get or create user-specific encryption key
    const userKey = await this.keyManager.getUserKey(userId);
    
    // Encrypt personal data
    const encryptedPersonalData = await this.encryptionService.encryptObject(
      data.personalData,
      userKey
    );
    
    // Create compliance metadata
    const complianceMetadata: ComplianceMetadata = {
      encryptedAt: new Date(),
      purpose,
      legalBasis: data.legalBasis,
      retentionPeriod: data.retentionPeriod,
      dataSubjectRights: {
        canAccess: true,
        canRectify: true,
        canErase: true,
        canPortability: true,
        canRestrict: false
      },
      processingCategories: data.processingCategories
    };
    
    return {
      userId,
      encryptedData: encryptedPersonalData,
      metadata: complianceMetadata,
      keyId: await this.keyManager.getKeyId(userKey),
      algorithm: 'AES-256-GCM',
      complianceVersion: '1.0'
    };
  }
  
  async decryptPII(encryptedData: EncryptedPIIData, requesterId: string, purpose: string): Promise<PIIData | null> {
    // Verify access rights
    const hasAccess = await this.verifyDataAccess(encryptedData.userId, requesterId, purpose);
    if (!hasAccess) {
      await this.auditLogger.logUnauthorizedAccess({
        requesterId,
        targetUserId: encryptedData.userId,
        operation: 'decrypt_pii',
        reason: 'insufficient_permissions',
        timestamp: new Date()
      });
      throw new UnauthorizedAccessError('Insufficient permissions to decrypt PII data');
    }
    
    // Check data retention period
    const isWithinRetention = await this.checkRetentionPeriod(encryptedData);
    if (!isWithinRetention) {
      await this.auditLogger.logDataRetentionViolation({
        userId: encryptedData.userId,
        encryptedAt: encryptedData.metadata.encryptedAt,
        retentionPeriod: encryptedData.metadata.retentionPeriod,
        timestamp: new Date()
      });
      return null; // Data should have been deleted
    }
    
    // Get decryption key
    const userKey = await this.keyManager.getUserKeyById(encryptedData.keyId);
    if (!userKey) {
      throw new KeyNotFoundError('Decryption key not found or has been rotated');
    }
    
    // Decrypt data
    const personalData = await this.encryptionService.decryptObject(
      encryptedData.encryptedData,
      userKey
    );
    
    // Log data access for audit trail
    await this.auditLogger.logDataAccess({
      userId: encryptedData.userId,
      accessedBy: requesterId,
      purpose,
      dataFields: Object.keys(personalData),
      timestamp: new Date(),
      legalBasis: encryptedData.metadata.legalBasis
    });
    
    return {
      personalData,
      legalBasis: encryptedData.metadata.legalBasis,
      retentionPeriod: encryptedData.metadata.retentionPeriod,
      processingCategories: encryptedData.metadata.processingCategories
    };
  }
  
  async implementRightToErasure(userId: string, requesterId: string): Promise<ErasureResult> {
    // Verify the request is from the data subject or authorized representative
    const isAuthorized = await this.verifyErasureRequest(userId, requesterId);
    if (!isAuthorized) {
      throw new UnauthorizedAccessError('Not authorized to request data erasure');
    }
    
    // Find all encrypted data for the user
    const userEncryptedData = await this.findAllUserData(userId);
    
    // Securely delete encryption keys (makes data unrecoverable)
    await this.keyManager.securelyDeleteUserKeys(userId);
    
    // Remove encrypted data records
    const deletionResults = await Promise.all(
      userEncryptedData.map(data => this.securelyDeleteData(data.id))
    );
    
    // Log erasure for compliance
    await this.auditLogger.logDataErasure({
      userId,
      requestedBy: requesterId,
      erasedRecords: userEncryptedData.length,
      timestamp: new Date(),
      method: 'cryptographic_erasure'
    });
    
    return {
      userId,
      erasedRecords: userEncryptedData.length,
      method: 'cryptographic_erasure',
      completedAt: new Date(),
      irreversible: true
    };
  }
  
  async generateDataPortabilityExport(userId: string, requesterId: string): Promise<PortabilityExport> {
    // Verify authorization
    const isAuthorized = await this.verifyPortabilityRequest(userId, requesterId);
    if (!isAuthorized) {
      throw new UnauthorizedAccessError('Not authorized to request data portability');
    }
    
    // Decrypt all user data
    const allUserData = await this.getAllUserData(userId);
    const decryptedData: any[] = [];
    
    for (const encryptedRecord of allUserData) {
      try {
        const decrypted = await this.decryptPII(encryptedRecord, requesterId, 'data_portability');
        if (decrypted) {
          decryptedData.push({
            category: encryptedRecord.metadata.processingCategories,
            data: decrypted.personalData,
            processedAt: encryptedRecord.metadata.encryptedAt,
            legalBasis: decrypted.legalBasis
          });
        }
      } catch (error) {
        // Log but continue with other records
        await this.auditLogger.logError({
          operation: 'data_portability',
          userId,
          error: error.message,
          timestamp: new Date()
        });
      }
    }
    
    // Create structured export
    const exportData = {
      dataSubject: userId,
      exportedAt: new Date(),
      format: 'JSON',
      data: decryptedData,
      metadata: {
        totalRecords: decryptedData.length,
        categories: [...new Set(decryptedData.map(d => d.category))],
        exportMethod: 'automated',
        complianceFramework: 'GDPR Article 20'
      }
    };
    
    // Log export for audit trail
    await this.auditLogger.logDataPortability({
      userId,
      requestedBy: requesterId,
      exportedRecords: decryptedData.length,
      timestamp: new Date()
    });
    
    return exportData;
  }
}

// Usage for GDPR compliance
const complianceEncryption = new ComplianceEncryptionService();

// Encrypt user PII data with compliance metadata
const piiData: PIIData = {
  personalData: {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    address: '123 Main St, City, State 12345',
    dateOfBirth: '1990-01-01'
  },
  legalBasis: 'consent',
  retentionPeriod: '7 years',
  processingCategories: ['identity', 'contact', 'demographic']
};

const encryptedPII = await complianceEncryption.encryptPII(
  piiData,
  'user-123',
  'customer_account_management'
);

// Later, handle right to erasure request
const erasureResult = await complianceEncryption.implementRightToErasure(
  'user-123',
  'user-123' // Self-request
);

// Handle data portability request
const exportData = await complianceEncryption.generateDataPortabilityExport(
  'user-123',
  'user-123' // Self-request
);
```

