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

