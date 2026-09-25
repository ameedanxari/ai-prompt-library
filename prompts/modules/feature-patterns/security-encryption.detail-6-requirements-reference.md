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
