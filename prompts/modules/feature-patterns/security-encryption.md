# Data Encryption Module

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
This module provides comprehensive data encryption capabilities for protecting sensitive information at rest and in transit. It implements industry-standard encryption algorithms, secure key management, and compliance with security regulations including GDPR, HIPAA, and SOC 2. The module ensures data confidentiality, integrity, and authenticity across web, mobile, and server environments while maintaining performance and usability.

## Instructions

### When to Use This Module
- Protecting sensitive user data (PII, financial information, health records)
- Implementing end-to-end encryption for communications
- Securing data storage in databases and file systems
- Meeting compliance requirements (GDPR, HIPAA, SOC 2, PCI DSS)
- Implementing secure authentication and session management

### Implementation Steps
1. **Choose Encryption Strategy**: Select appropriate algorithms and key management approach based on security requirements
2. **Implement Key Management**: Set up secure key generation, storage, rotation, and recovery processes
3. **Configure Data Encryption**: Implement encryption for data at rest and in transit
4. **Add Authentication**: Implement authenticated encryption to detect tampering
5. **Test Security**: Perform comprehensive security testing and compliance validation

### Key Security Decisions
- **Algorithm Selection**: AES-256-GCM for general use, ChaCha20-Poly1305 for high-performance scenarios
- **Key Derivation**: PBKDF2 (100,000+ iterations), Argon2id, or scrypt for password-based keys
- **Key Storage**: Platform-specific secure storage (Keychain, Keystore, HSM)
- **Transport Security**: TLS 1.3 for all network communications

### Security Approach
- **Defense in Depth**: Multiple layers of encryption and security controls
- **Zero-Knowledge Architecture**: Server cannot decrypt user data without user keys
- **Perfect Forward Secrecy**: Compromise of long-term keys doesn't affect past sessions
- **Authenticated Encryption**: Always use AEAD modes to detect tampering

## Examples

## Examples

### 1. Complete End-to-End Encryption System
```typescript
// comprehensive-encryption.ts - Production-ready encryption service
import { webcrypto } from 'crypto';

export class ComprehensiveEncryptionService {
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12;
  private readonly TAG_LENGTH = 16;
  private readonly SALT_LENGTH = 32;
  private readonly PBKDF2_ITERATIONS = 100000;
  
  async generateMasterKey(): Promise<CryptoKey> {
    return await webcrypto.subtle.generateKey(
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      true, // extractable for backup purposes
      ['encrypt', 'decrypt']
    );
  }
  
  async deriveKeyFromPassword(password: string, salt?: Uint8Array): Promise<{
    key: CryptoKey;
    salt: Uint8Array;
  }> {
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Generate salt if not provided
    if (!salt) {
      salt = webcrypto.getRandomValues(new Uint8Array(this.SALT_LENGTH));
    }
    
    // Import password as key material
    const keyMaterial = await webcrypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveKey']
    );
    
    // Derive encryption key
    const key = await webcrypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: this.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      keyMaterial,
      {
        name: this.ALGORITHM,
        length: this.KEY_LENGTH
      },
      false, // not extractable for security
      ['encrypt', 'decrypt']
    );
    
    return { key, salt };
  }
  
  async encryptData(data: string, key: CryptoKey): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    // Generate random IV
    const iv = webcrypto.getRandomValues(new Uint8Array(this.IV_LENGTH));
    
    // Encrypt data
    const encryptedBuffer = await webcrypto.subtle.encrypt(
      {
        name: this.ALGORITHM,
        iv
      },
      key,
      dataBuffer
    );
    
    return {
      data: new Uint8Array(encryptedBuffer),
      iv,
      algorithm: this.ALGORITHM,
      timestamp: Date.now()
    };
  }
  
  async decryptData(encryptedData: EncryptedData, key: CryptoKey): Promise<string> {
    try {
      const decryptedBuffer = await webcrypto.subtle.decrypt(
        {
          name: encryptedData.algorithm,
          iv: encryptedData.iv
        },
        key,
        encryptedData.data
      );
      
      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch (error) {
      throw new DecryptionError('Failed to decrypt data - invalid key or corrupted data');
    }
  }
  
  async encryptObject<T>(obj: T, key: CryptoKey): Promise<EncryptedData> {
    const jsonString = JSON.stringify(obj);
    return await this.encryptData(jsonString, key);
  }
  
  async decryptObject<T>(encryptedData: EncryptedData, key: CryptoKey): Promise<T> {
    const jsonString = await this.decryptData(encryptedData, key);
    return JSON.parse(jsonString);
  }
}

// Usage example
const encryptionService = new ComprehensiveEncryptionService();

// Encrypt user data with password-derived key
const userData = {
  ssn: '123-45-6789',
  creditCard: '4111-1111-1111-1111',
  medicalRecord: 'Patient has diabetes type 2'
};

const { key, salt } = await encryptionService.deriveKeyFromPassword('user-password-123');
const encryptedData = await encryptionService.encryptObject(userData, key);

// Store encrypted data and salt (never store the password or key)
await database.store({
  userId: 'user-123',
  encryptedData: Array.from(encryptedData.data),
  iv: Array.from(encryptedData.iv),
  salt: Array.from(salt),
  algorithm: encryptedData.algorithm,
  timestamp: encryptedData.timestamp
});

// Later, decrypt the data
const storedData = await database.retrieve('user-123');
const { key: derivedKey } = await encryptionService.deriveKeyFromPassword(
  'user-password-123',
  new Uint8Array(storedData.salt)
);

const decryptedUserData = await encryptionService.decryptObject({
  data: new Uint8Array(storedData.encryptedData),
  iv: new Uint8Array(storedData.iv),
  algorithm: storedData.algorithm,
  timestamp: storedData.timestamp
}, derivedKey);
```

### 2. Database Field-Level Encryption
```typescript
// field-encryption.ts - Encrypt specific database fields
export class DatabaseFieldEncryption {
  private encryptionService: ComprehensiveEncryptionService;
  private fieldKeys: Map<string, CryptoKey> = new Map();
  
  constructor() {
    this.encryptionService = new ComprehensiveEncryptionService();
  }
  
  async initializeFieldKeys(masterKey: CryptoKey, fields: string[]): Promise<void> {
    for (const field of fields) {
      // Derive field-specific key from master key
      const fieldKey = await this.deriveFieldKey(masterKey, field);
      this.fieldKeys.set(field, fieldKey);
    }
  }
  
  private async deriveFieldKey(masterKey: CryptoKey, fieldName: string): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const fieldBuffer = encoder.encode(fieldName);
    
    // Export master key to derive field key
    const masterKeyBuffer = await webcrypto.subtle.exportKey('raw', masterKey);
    
    // Use HKDF to derive field-specific key
    const keyMaterial = await webcrypto.subtle.importKey(
      'raw',
      masterKeyBuffer,
      'HKDF',
      false,
      ['deriveKey']
    );
    
    return await webcrypto.subtle.deriveKey(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt: new Uint8Array(32), // Use a fixed salt for deterministic field keys
        info: fieldBuffer
      },
      keyMaterial,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encryptFields<T extends Record<string, any>>(
    data: T,
    fieldsToEncrypt: (keyof T)[]
  ): Promise<T & { _encrypted_fields: string[] }> {
    const result = { ...data } as T & { _encrypted_fields: string[] };
    const encryptedFields: string[] = [];
    
    for (const field of fieldsToEncrypt) {
      if (data[field] !== undefined && data[field] !== null) {
        const fieldKey = this.fieldKeys.get(field as string);
        if (!fieldKey) {
          throw new Error(`No encryption key found for field: ${String(field)}`);
        }
        
        const fieldValue = typeof data[field] === 'string' 
          ? data[field] 
          : JSON.stringify(data[field]);
          
        const encryptedData = await this.encryptionService.encryptData(fieldValue, fieldKey);
        
        // Store encrypted data as base64 string
        result[field] = this.encryptedDataToString(encryptedData);
        encryptedFields.push(field as string);
      }
    }
    
    result._encrypted_fields = encryptedFields;
    return result;
  }
  
  async decryptFields<T extends Record<string, any>>(
    data: T & { _encrypted_fields?: string[] }
  ): Promise<T> {
    const result = { ...data };
    const encryptedFields = data._encrypted_fields || [];
    
    for (const field of encryptedFields) {
      if (result[field] !== undefined) {
        const fieldKey = this.fieldKeys.get(field);
        if (!fieldKey) {
          throw new Error(`No decryption key found for field: ${field}`);
        }
        
        const encryptedData = this.stringToEncryptedData(result[field] as string);
        const decryptedValue = await this.encryptionService.decryptData(encryptedData, fieldKey);
        
        // Try to parse as JSON, fallback to string
        try {
          result[field] = JSON.parse(decryptedValue);
        } catch {
          result[field] = decryptedValue;
        }
      }
    }
    
    // Remove encryption metadata
    delete result._encrypted_fields;
    return result as T;
  }
  
  private encryptedDataToString(data: EncryptedData): string {
    return JSON.stringify({
      data: Array.from(data.data),
      iv: Array.from(data.iv),
      algorithm: data.algorithm,
      timestamp: data.timestamp
    });
  }
  
  private stringToEncryptedData(str: string): EncryptedData {
    const parsed = JSON.parse(str);
    return {
      data: new Uint8Array(parsed.data),
      iv: new Uint8Array(parsed.iv),
      algorithm: parsed.algorithm,
      timestamp: parsed.timestamp
    };
  }
}

// Usage with database operations
const fieldEncryption = new DatabaseFieldEncryption();
const masterKey = await encryptionService.generateMasterKey();

// Initialize encryption for specific fields
await fieldEncryption.initializeFieldKeys(masterKey, [
  'email', 'phone', 'ssn', 'address', 'medicalHistory'
]);

// Encrypt user data before saving to database
const userData = {
  id: 'user-123',
  name: 'John Doe', // Not encrypted
  email: 'john.doe@example.com', // Will be encrypted
  phone: '+1-555-0123', // Will be encrypted
  ssn: '123-45-6789', // Will be encrypted
  role: 'user' // Not encrypted
};

const encryptedUserData = await fieldEncryption.encryptFields(userData, [
  'email', 'phone', 'ssn'
]);

// Save to database
await database.users.create(encryptedUserData);

// Later, retrieve and decrypt
const storedUser = await database.users.findById('user-123');
const decryptedUser = await fieldEncryption.decryptFields(storedUser);
```

### 3. Mobile Secure Storage Implementation
```typescript
// mobile-secure-storage.ts - Platform-specific secure storage
export class MobileSecureStorage {
  private platform: 'ios' | 'android' | 'web';
  private encryptionService: ComprehensiveEncryptionService;
  
  constructor() {
    this.platform = this.detectPlatform();
    this.encryptionService = new ComprehensiveEncryptionService();
  }
  
  async storeSecureData(key: string, data: any, requireBiometric = false): Promise<void> {
    const serializedData = JSON.stringify(data);
    
    switch (this.platform) {
      case 'ios':
        await this.storeInKeychain(key, serializedData, requireBiometric);
        break;
      case 'android':
        await this.storeInKeystore(key, serializedData, requireBiometric);
        break;
      case 'web':
        await this.storeInWebCrypto(key, serializedData);
        break;
    }
  }
  
  async retrieveSecureData<T>(key: string): Promise<T | null> {
    let serializedData: string | null = null;
    
    switch (this.platform) {
      case 'ios':
        serializedData = await this.retrieveFromKeychain(key);
        break;
      case 'android':
        serializedData = await this.retrieveFromKeystore(key);
        break;
      case 'web':
        serializedData = await this.retrieveFromWebCrypto(key);
        break;
    }
    
    if (!serializedData) return null;
    
    try {
      return JSON.parse(serializedData);
    } catch {
      return serializedData as T;
    }
  }
  
  private async storeInKeychain(key: string, data: string, requireBiometric: boolean): Promise<void> {
    // iOS Keychain implementation
    const keychainOptions = {
      service: 'com.yourapp.secure-storage',
      key,
      value: data,
      accessControl: requireBiometric ? 'BiometryAny' : 'WhenUnlockedThisDeviceOnly',
      authenticatePrompt: 'Authenticate to access secure data'
    };
    
    // Using react-native-keychain or similar library
    await Keychain.setInternetCredentials(
      keychainOptions.service,
      keychainOptions.key,
      keychainOptions.value,
      {
        accessControl: keychainOptions.accessControl,
        authenticatePrompt: keychainOptions.authenticatePrompt
      }
    );
  }
  
  private async storeInKeystore(key: string, data: string, requireBiometric: boolean): Promise<void> {
    // Android Keystore implementation
    const keystoreOptions = {
      alias: key,
      value: data,
      requireAuthentication: requireBiometric,
      authenticationPrompt: 'Authenticate to access secure data'
    };
    
    // Generate or retrieve key from Android Keystore
    const encryptionKey = await this.getOrCreateKeystoreKey(key, requireBiometric);
    
    // Encrypt data with Keystore key
    const encryptedData = await this.encryptionService.encryptData(data, encryptionKey);
    
    // Store encrypted data in secure preferences
    await SecureStorage.setItem(key, JSON.stringify({
      data: Array.from(encryptedData.data),
      iv: Array.from(encryptedData.iv),
      algorithm: encryptedData.algorithm
    }));
  }
  
  private async storeInWebCrypto(key: string, data: string): Promise<void> {
    // Web implementation using IndexedDB with encryption
    const userKey = await this.getUserEncryptionKey();
    const encryptedData = await this.encryptionService.encryptData(data, userKey);
    
    // Store in IndexedDB
    const db = await this.openSecureDatabase();
    const transaction = db.transaction(['secure-storage'], 'readwrite');
    const store = transaction.objectStore('secure-storage');
    
    await store.put({
      key,
      data: Array.from(encryptedData.data),
      iv: Array.from(encryptedData.iv),
      algorithm: encryptedData.algorithm,
      timestamp: encryptedData.timestamp
    });
  }
  
  private async getUserEncryptionKey(): Promise<CryptoKey> {
    // Derive key from user session or stored key
    const keyData = sessionStorage.getItem('user-key-material');
    if (!keyData) {
      throw new Error('User encryption key not available');
    }
    
    return await webcrypto.subtle.importKey(
      'raw',
      new Uint8Array(JSON.parse(keyData)),
      'AES-GCM',
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async rotateEncryptionKeys(): Promise<void> {
    // Implement key rotation for enhanced security
    const oldKey = await this.getUserEncryptionKey();
    const newKey = await this.encryptionService.generateMasterKey();
    
    // Re-encrypt all stored data with new key
    const allKeys = await this.getAllStoredKeys();
    
    for (const key of allKeys) {
      const data = await this.retrieveSecureData(key);
      if (data) {
        await this.storeSecureData(key, data);
      }
    }
    
    // Update user's key material
    const newKeyBuffer = await webcrypto.subtle.exportKey('raw', newKey);
    sessionStorage.setItem('user-key-material', JSON.stringify(Array.from(new Uint8Array(newKeyBuffer))));
  }
}

// Usage in React Native app
const secureStorage = new MobileSecureStorage();

// Store sensitive user preferences
await secureStorage.storeSecureData('user-preferences', {
  paymentMethods: ['card-1234', 'paypal-user@example.com'],
  biometricEnabled: true,
  autoLogin: false
}, true); // Require biometric authentication

// Store authentication tokens
await secureStorage.storeSecureData('auth-tokens', {
  accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  expiresAt: Date.now() + 3600000
});

// Retrieve data (will prompt for biometric if required)
const preferences = await secureStorage.retrieveSecureData('user-preferences');
const tokens = await secureStorage.retrieveSecureData('auth-tokens');
```

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

### 5. High-Performance Streaming Encryption
```typescript
// streaming-encryption.ts - Encrypt large files and data streams
export class StreamingEncryptionService {
  private readonly CHUNK_SIZE = 64 * 1024; // 64KB chunks
  private encryptionService: ComprehensiveEncryptionService;
  
  constructor() {
    this.encryptionService = new ComprehensiveEncryptionService();
  }
  
  async encryptStream(
    inputStream: ReadableStream<Uint8Array>,
    key: CryptoKey,
    onProgress?: (bytesProcessed: number, totalBytes?: number) => void
  ): Promise<ReadableStream<Uint8Array>> {
    let bytesProcessed = 0;
    let chunkIndex = 0;
    
    return new ReadableStream({
      async start(controller) {
        // Generate and send header with metadata
        const header = await this.createStreamHeader(key);
        controller.enqueue(header);
      },
      
      async pull(controller) {
        const reader = inputStream.getReader();
        
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            // Send final chunk with authentication tag
            const finalChunk = await this.createFinalChunk(chunkIndex);
            controller.enqueue(finalChunk);
            controller.close();
            return;
          }
          
          // Encrypt chunk
          const encryptedChunk = await this.encryptChunk(
            value,
            key,
            chunkIndex
          );
          
          controller.enqueue(encryptedChunk);
          
          bytesProcessed += value.length;
          chunkIndex++;
          
          if (onProgress) {
            onProgress(bytesProcessed);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });
  }
  
  async decryptStream(
    encryptedStream: ReadableStream<Uint8Array>,
    key: CryptoKey,
    onProgress?: (bytesProcessed: number) => void
  ): Promise<ReadableStream<Uint8Array>> {
    let bytesProcessed = 0;
    let chunkIndex = 0;
    let header: StreamHeader | null = null;
    
    return new ReadableStream({
      async pull(controller) {
        const reader = encryptedStream.getReader();
        
        try {
          const { done, value } = await reader.read();
          
          if (done) {
            controller.close();
            return;
          }
          
          // Parse header from first chunk
          if (!header) {
            header = await this.parseStreamHeader(value);
            return;
          }
          
          // Check if this is the final chunk
          if (await this.isFinalChunk(value)) {
            const isValid = await this.validateFinalChunk(value, chunkIndex);
            if (!isValid) {
              throw new Error('Stream integrity check failed');
            }
            controller.close();
            return;
          }
          
          // Decrypt chunk
          const decryptedChunk = await this.decryptChunk(
            value,
            key,
            chunkIndex,
            header
          );
          
          controller.enqueue(decryptedChunk);
          
          bytesProcessed += decryptedChunk.length;
          chunkIndex++;
          
          if (onProgress) {
            onProgress(bytesProcessed);
          }
        } catch (error) {
          controller.error(error);
        } finally {
          reader.releaseLock();
        }
      }
    });
  }
  
  private async encryptChunk(
    chunk: Uint8Array,
    key: CryptoKey,
    chunkIndex: number
  ): Promise<Uint8Array> {
    // Create chunk-specific IV using index
    const baseIV = webcrypto.getRandomValues(new Uint8Array(12));
    const chunkIV = new Uint8Array(12);
    chunkIV.set(baseIV.subarray(0, 8));
    
    // Add chunk index to IV for uniqueness
    const indexBytes = new Uint32Array([chunkIndex]);
    chunkIV.set(new Uint8Array(indexBytes.buffer), 8);
    
    // Encrypt chunk
    const encryptedData = await webcrypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: chunkIV
      },
      key,
      chunk
    );
    
    // Combine IV and encrypted data
    const result = new Uint8Array(chunkIV.length + encryptedData.byteLength);
    result.set(chunkIV);
    result.set(new Uint8Array(encryptedData), chunkIV.length);
    
    return result;
  }
  
  private async decryptChunk(
    encryptedChunk: Uint8Array,
    key: CryptoKey,
    chunkIndex: number,
    header: StreamHeader
  ): Promise<Uint8Array> {
    // Extract IV and encrypted data
    const iv = encryptedChunk.subarray(0, 12);
    const encryptedData = encryptedChunk.subarray(12);
    
    // Verify chunk index matches IV
    const expectedIndex = new Uint32Array(iv.buffer.slice(8, 12))[0];
    if (expectedIndex !== chunkIndex) {
      throw new Error(`Chunk index mismatch: expected ${chunkIndex}, got ${expectedIndex}`);
    }
    
    // Decrypt chunk
    const decryptedData = await webcrypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      encryptedData
    );
    
    return new Uint8Array(decryptedData);
  }
  
  async encryptFile(
    file: File,
    password: string,
    onProgress?: (progress: number) => void
  ): Promise<Blob> {
    // Derive key from password
    const { key } = await this.encryptionService.deriveKeyFromPassword(password);
    
    // Create file stream
    const fileStream = file.stream();
    
    // Encrypt stream
    const encryptedStream = await this.encryptStream(
      fileStream,
      key,
      (bytesProcessed) => {
        if (onProgress) {
          onProgress((bytesProcessed / file.size) * 100);
        }
      }
    );
    
    // Convert stream to blob
    const chunks: Uint8Array[] = [];
    const reader = encryptedStream.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    return new Blob(chunks, { type: 'application/octet-stream' });
  }
}

// Usage for large file encryption
const streamingEncryption = new StreamingEncryptionService();

// Encrypt a large file
const fileInput = document.getElementById('file-input') as HTMLInputElement;
const file = fileInput.files[0];

const encryptedBlob = await streamingEncryption.encryptFile(
  file,
  'user-password-123',
  (progress) => {
    console.log(`Encryption progress: ${progress.toFixed(1)}%`);
    updateProgressBar(progress);
  }
);

// Save encrypted file
const downloadLink = document.createElement('a');
downloadLink.href = URL.createObjectURL(encryptedBlob);
downloadLink.download = `${file.name}.encrypted`;
downloadLink.click();
```

## Overview
Implement comprehensive data encryption at rest and in transit with industry-standard algorithms, key management, and compliance with security regulations.

## Core Implementation Requirements

### Encryption Architecture
- **End-to-End Encryption**: Encrypt sensitive data from client to storage
- **Key Management**: Secure key generation, rotation, and storage
- **Algorithm Selection**: Use industry-standard encryption algorithms (AES-256, RSA-4096)
- **Transport Security**: TLS 1.3 for all data in transit
- **Zero-Knowledge Architecture**: Server cannot decrypt user data without user keys

### Security Features
- **Key Derivation**: Use PBKDF2, Argon2, or scrypt for password-based key derivation
- **Salt Generation**: Unique salts for each encryption operation
- **Initialization Vectors**: Random IVs for each encryption operation
- **Authenticated Encryption**: Use AEAD modes (GCM, ChaCha20-Poly1305)
- **Forward Secrecy**: Implement perfect forward secrecy for communications

### Accessibility Implementation
- **Security Indicators**: Clear visual and screen reader indicators for encryption status
- **Key Management UI**: Accessible interfaces for key backup and recovery
- **Error Communication**: Clear, accessible error messages for encryption failures
- **Progress Feedback**: Accessible progress indicators for encryption operations

### Internationalization Support
- **Localized Security Messages**: Translate all security-related messages
- **Cultural Security Practices**: Adapt security practices for different regions
- **Compliance Messaging**: Localize compliance and privacy notices
- **Character Encoding**: Proper handling of international characters in encrypted data

### Platform-Specific Implementations

#### Web Implementation
```typescript
// Web Crypto API implementation
class WebCryptoService {
  private async generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  }
  
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    return await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }
  
  async encryptData(data: string, password: string): Promise<EncryptedData> {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const key = await this.deriveKey(password, salt);
    const encodedData = encoder.encode(data);
    
    const encryptedBuffer = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv
      },
      key,
      encodedData
    );
    
    return {
      encryptedData: new Uint8Array(encryptedBuffer),
      salt: salt,
      iv: iv,
      algorithm: 'AES-GCM',
      keyDerivation: 'PBKDF2'
    };
  }
  
  async decryptData(encryptedData: EncryptedData, password: string): Promise<string> {
    const key = await this.deriveKey(password, encryptedData.salt);
    
    const decryptedBuffer = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: encryptedData.iv
      },
      key,
      encryptedData.encryptedData
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }
}

// Secure storage with encryption
class SecureStorage {
  private cryptoService = new WebCryptoService();
  
  async setItem(key: string, value: any, password: string): Promise<void> {
    const serializedValue = JSON.stringify(value);
    const encryptedData = await this.cryptoService.encryptData(serializedValue, password);
    
    // Store encrypted data in localStorage/IndexedDB
    localStorage.setItem(key, JSON.stringify({
      ...encryptedData,
      encryptedData: Array.from(encryptedData.encryptedData),
      salt: Array.from(encryptedData.salt),
      iv: Array.from(encryptedData.iv)
    }));
  }
  
  async getItem(key: string, password: string): Promise<any> {
    const storedData = localStorage.getItem(key);
    if (!storedData) return null;
    
    const parsedData = JSON.parse(storedData);
    const encryptedData: EncryptedData = {
      ...parsedData,
      encryptedData: new Uint8Array(parsedData.encryptedData),
      salt: new Uint8Array(parsedData.salt),
      iv: new Uint8Array(parsedData.iv)
    };
    
    try {
      const decryptedValue = await this.cryptoService.decryptData(encryptedData, password);
      return JSON.parse(decryptedValue);
    } catch (error) {
      throw new Error('Failed to decrypt data - invalid password or corrupted data');
    }
  }
}
```

#### Backend Implementation
```typescript
// Node.js encryption service
import crypto from 'crypto';
import { promisify } from 'util';

class ServerCryptoService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly saltLength = 32;
  private readonly tagLength = 16;
  
  private async deriveKey(password: string, salt: Buffer): Promise<Buffer> {
    const pbkdf2 = promisify(crypto.pbkdf2);
    return await pbkdf2(password, salt, 100000, this.keyLength, 'sha256');
  }
  
  async encryptData(data: string, password: string): Promise<EncryptedServerData> {
    const salt = crypto.randomBytes(this.saltLength);
    const iv = crypto.randomBytes(this.ivLength);
    const key = await this.deriveKey(password, salt);
    
    const cipher = crypto.createCipher(this.algorithm, key);
    cipher.setAAD(Buffer.from('additional-auth-data'));
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encryptedData: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      algorithm: this.algorithm
    };
  }
  
  async decryptData(encryptedData: EncryptedServerData, password: string): Promise<string> {
    const salt = Buffer.from(encryptedData.salt, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    const key = await this.deriveKey(password, salt);
    
    const decipher = crypto.createDecipher(this.algorithm, key);
    decipher.setAAD(Buffer.from('additional-auth-data'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
  
  // Key rotation functionality
  async rotateEncryptionKey(oldPassword: string, newPassword: string, encryptedData: EncryptedServerData): Promise<EncryptedServerData> {
    // Decrypt with old key
    const plaintext = await this.decryptData(encryptedData, oldPassword);
    
    // Re-encrypt with new key
    return await this.encryptData(plaintext, newPassword);
  }
}

// Database field encryption
class FieldEncryption {
  private cryptoService = new ServerCryptoService();
  
  // Encrypt specific database fields
  async encryptFields(data: Record<string, any>, fieldsToEncrypt: string[], masterKey: string): Promise<Record<string, any>> {
    const result = { ...data };
    
    for (const field of fieldsToEncrypt) {
      if (result[field] !== undefined) {
        const fieldValue = typeof result[field] === 'string' 
          ? result[field] 
          : JSON.stringify(result[field]);
        
        result[field] = await this.cryptoService.encryptData(fieldValue, masterKey);
      }
    }
    
    return result;
  }
  
  async decryptFields(data: Record<string, any>, fieldsToDecrypt: string[], masterKey: string): Promise<Record<string, any>> {
    const result = { ...data };
    
    for (const field of fieldsToDecrypt) {
      if (result[field] !== undefined) {
        try {
          const decryptedValue = await this.cryptoService.decryptData(result[field], masterKey);
          
          // Try to parse as JSON, fallback to string
          try {
            result[field] = JSON.parse(decryptedValue);
          } catch {
            result[field] = decryptedValue;
          }
        } catch (error) {
          console.error(`Failed to decrypt field ${field}:`, error);
          result[field] = null; // Or handle error appropriately
        }
      }
    }
    
    return result;
  }
}
```

#### Mobile Implementation
```typescript
// React Native secure encryption
import CryptoJS from 'crypto-js';
import { SecureStore } from 'expo-secure-store';

class MobileCryptoService {
  async encryptData(data: string, password: string): Promise<string> {
    const salt = CryptoJS.lib.WordArray.random(256/8);
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 100000
    });
    
    const iv = CryptoJS.lib.WordArray.random(128/8);
    const encrypted = CryptoJS.AES.encrypt(data, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    });
    
    return JSON.stringify({
      salt: salt.toString(),
      iv: iv.toString(),
      encrypted: encrypted.toString()
    });
  }
  
  async decryptData(encryptedData: string, password: string): Promise<string> {
    const data = JSON.parse(encryptedData);
    const salt = CryptoJS.enc.Hex.parse(data.salt);
    const iv = CryptoJS.enc.Hex.parse(data.iv);
    
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 100000
    });
    
    const decrypted = CryptoJS.AES.decrypt(data.encrypted, key, {
      iv: iv,
      mode: CryptoJS.mode.GCM,
      padding: CryptoJS.pad.NoPadding
    });
    
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  
  // Secure key storage using device keychain
  async storeEncryptionKey(keyId: string, key: string): Promise<void> {
    await SecureStore.setItemAsync(keyId, key, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to access encryption key'
    });
  }
  
  async getEncryptionKey(keyId: string): Promise<string | null> {
    return await SecureStore.getItemAsync(keyId, {
      requireAuthentication: true,
      authenticationPrompt: 'Authenticate to access encryption key'
    });
  }
}
```

## Testing Requirements

### Unit Tests
- Test encryption/decryption with various data types
- Test key derivation with different passwords and salts
- Test authenticated encryption tag validation
- Test key rotation functionality

### Property-Based Tests
- **Encryption Roundtrip Property**: For any plaintext data and password, encrypting then decrypting should return the original data
- **Key Uniqueness Property**: For any two different passwords, they should generate different encryption keys
- **Authentication Property**: For any encrypted data, tampering should be detectable and cause decryption to fail

### Security Tests
- Test resistance to timing attacks
- Test key derivation performance (should be slow enough to prevent brute force)
- Test random number generation quality
- Test secure memory handling (no key material in swap/core dumps)

### Integration Tests
- Test end-to-end encryption across client-server communication
- Test key management workflows
- Test encryption with different data sizes and types

## Monitoring & Observability

### Security Metrics
- Track encryption/decryption operation frequency
- Monitor key rotation schedules and compliance
- Track failed decryption attempts (potential attacks)
- Monitor encryption performance and resource usage

### Compliance Monitoring
- Track data encryption coverage (percentage of sensitive data encrypted)
- Monitor key management compliance with regulations
- Track encryption algorithm usage and deprecation schedules

## Configuration Variables
- `{{encryption_algorithm}}` - Primary encryption algorithm (AES-256-GCM, ChaCha20-Poly1305)
- `{{key_derivation_function}}` - Key derivation function (PBKDF2, Argon2, scrypt)
- `{{key_rotation_schedule}}` - Automatic key rotation schedule
- `{{compliance_requirements}}` - Specific compliance requirements (FIPS, Common Criteria)
- `{{performance_requirements}}` - Performance requirements for encryption operations

## Dependencies
- Web Crypto API (browsers)
- Node.js crypto module (server)
- CryptoJS or similar library (React Native)
- Secure storage APIs (Keychain, SecureStore)
- Hardware Security Module (HSM) for enterprise deployments

## Documentation Requirements
- Encryption architecture documentation
- Key management procedures
- Compliance certification documentation
- Security audit procedures
- Incident response procedures for key compromise
