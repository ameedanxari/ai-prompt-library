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

