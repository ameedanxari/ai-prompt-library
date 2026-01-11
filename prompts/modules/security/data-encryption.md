# Data Encryption Template

## Purpose

This template provides comprehensive patterns for implementing end-to-end encryption, key management, field-level encryption, and cryptographic best practices. It covers symmetric and asymmetric encryption, secure key storage, key rotation, and compliance with security standards for protecting sensitive data at rest and in transit.

## Context

Data protection requires robust encryption strategies across all layers of an application. This template addresses the implementation of encryption for databases, file storage, communications, and application-level data while maintaining performance and usability.

## Core Components

### Encryption Service Interface

```typescript
interface EncryptionService {
  encrypt(data: string | Buffer, options: EncryptionOptions): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData, options: DecryptionOptions): Promise<string | Buffer>;
  generateKey(algorithm: KeyAlgorithm, options?: KeyGenerationOptions): Promise<CryptoKey>;
  deriveKey(password: string, salt: Uint8Array, options: KeyDerivationOptions): Promise<CryptoKey>;
  rotateKey(keyId: string): Promise<KeyRotationResult>;
}

interface EncryptedData {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag?: Uint8Array;
  algorithm: string;
  keyId: string;
  timestamp: Date;
}

interface EncryptionOptions {
  algorithm: EncryptionAlgorithm;
  keyId?: string;
  additionalData?: Uint8Array;
  compress?: boolean;
}

enum EncryptionAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
  AES_256_CBC = 'aes-256-cbc',
  CHACHA20_POLY1305 = 'chacha20-poly1305',
  RSA_OAEP = 'rsa-oaep'
}

interface KeyDerivationOptions {
  algorithm: 'pbkdf2' | 'argon2id' | 'scrypt';
  iterations?: number;
  memory?: number;
  parallelism?: number;
  keyLength: number;
}
```

### Key Management Service

```typescript
interface KeyManagementService {
  createKey(config: KeyConfig): Promise<ManagedKey>;
  getKey(keyId: string): Promise<ManagedKey>;
  rotateKey(keyId: string): Promise<KeyRotationResult>;
  revokeKey(keyId: string, reason: string): Promise<void>;
  listKeys(filter?: KeyFilter): Promise<ManagedKey[]>;
  exportKey(keyId: string, format: KeyExportFormat): Promise<ExportedKey>;
}

interface ManagedKey {
  id: string;
  algorithm: KeyAlgorithm;
  purpose: KeyPurpose;
  status: KeyStatus;
  createdAt: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
  metadata: KeyMetadata;
}

enum KeyPurpose {
  ENCRYPTION = 'encryption',
  SIGNING = 'signing',
  KEY_WRAPPING = 'key_wrapping',
  AUTHENTICATION = 'authentication'
}

enum KeyStatus {
  ACTIVE = 'active',
  PENDING_ROTATION = 'pending_rotation',
  ROTATED = 'rotated',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

class SecureKeyManager implements KeyManagementService {
  private keyStore: KeyStore;
  private hsmClient?: HSMClient;

  async createKey(config: KeyConfig): Promise<ManagedKey> {
    // Generate key material
    const keyMaterial = await this.generateKeyMaterial(config.algorithm);
    
    // Wrap key with master key for storage
    const wrappedKey = await this.wrapKey(keyMaterial, this.masterKeyId);
    
    const managedKey: ManagedKey = {
      id: crypto.randomUUID(),
      algorithm: config.algorithm,
      purpose: config.purpose,
      status: KeyStatus.ACTIVE,
      createdAt: new Date(),
      expiresAt: config.expiresAt,
      metadata: {
        createdBy: config.createdBy,
        tags: config.tags,
        rotationPolicy: config.rotationPolicy
      }
    };

    // Store wrapped key
    await this.keyStore.save(managedKey.id, {
      ...managedKey,
      wrappedKeyMaterial: wrappedKey
    });

    await this.auditService.logKeyCreation(managedKey);
    return managedKey;
  }

  async rotateKey(keyId: string): Promise<KeyRotationResult> {
    const existingKey = await this.keyStore.get(keyId);
    if (!existingKey) {
      throw new KeyNotFoundError(keyId);
    }

    // Generate new key material
    const newKeyMaterial = await this.generateKeyMaterial(existingKey.algorithm);
    const wrappedNewKey = await this.wrapKey(newKeyMaterial, this.masterKeyId);

    // Create new key version
    const newKeyId = `${keyId}:v${Date.now()}`;
    const newKey: ManagedKey = {
      ...existingKey,
      id: newKeyId,
      status: KeyStatus.ACTIVE,
      createdAt: new Date(),
      rotatedAt: new Date()
    };

    // Mark old key as rotated
    existingKey.status = KeyStatus.ROTATED;
    existingKey.rotatedAt = new Date();

    await this.keyStore.save(newKeyId, { ...newKey, wrappedKeyMaterial: wrappedNewKey });
    await this.keyStore.update(keyId, existingKey);

    await this.auditService.logKeyRotation(keyId, newKeyId);

    return {
      oldKeyId: keyId,
      newKeyId,
      rotatedAt: new Date()
    };
  }
}
```

### Field-Level Encryption

```typescript
class FieldLevelEncryption {
  private encryptionService: EncryptionService;
  private keyManager: KeyManagementService;

  async encryptFields<T extends Record<string, any>>(
    data: T,
    fieldsToEncrypt: (keyof T)[],
    keyId: string
  ): Promise<T & { _encryptedFields: string[] }> {
    const result = { ...data } as T & { _encryptedFields: string[] };
    const encryptedFields: string[] = [];

    for (const field of fieldsToEncrypt) {
      if (data[field] !== undefined && data[field] !== null) {
        const fieldValue = typeof data[field] === 'string'
          ? data[field]
          : JSON.stringify(data[field]);

        const encrypted = await this.encryptionService.encrypt(fieldValue, {
          algorithm: EncryptionAlgorithm.AES_256_GCM,
          keyId
        });

        result[field] = this.serializeEncryptedData(encrypted) as any;
        encryptedFields.push(field as string);
      }
    }

    result._encryptedFields = encryptedFields;
    return result;
  }

  async decryptFields<T extends Record<string, any>>(
    data: T & { _encryptedFields?: string[] }
  ): Promise<T> {
    const result = { ...data };
    const encryptedFields = data._encryptedFields || [];

    for (const field of encryptedFields) {
      if (result[field] !== undefined) {
        const encryptedData = this.deserializeEncryptedData(result[field] as string);
        const decrypted = await this.encryptionService.decrypt(encryptedData, {});

        try {
          result[field] = JSON.parse(decrypted.toString());
        } catch {
          result[field] = decrypted.toString();
        }
      }
    }

    delete result._encryptedFields;
    return result as T;
  }

  private serializeEncryptedData(data: EncryptedData): string {
    return Buffer.from(JSON.stringify({
      c: Array.from(data.ciphertext),
      i: Array.from(data.iv),
      t: data.tag ? Array.from(data.tag) : undefined,
      a: data.algorithm,
      k: data.keyId
    })).toString('base64');
  }

  private deserializeEncryptedData(serialized: string): EncryptedData {
    const parsed = JSON.parse(Buffer.from(serialized, 'base64').toString());
    return {
      ciphertext: new Uint8Array(parsed.c),
      iv: new Uint8Array(parsed.i),
      tag: parsed.t ? new Uint8Array(parsed.t) : undefined,
      algorithm: parsed.a,
      keyId: parsed.k,
      timestamp: new Date()
    };
  }
}
```

## Implementation Patterns

### Envelope Encryption

```typescript
class EnvelopeEncryption {
  private kmsClient: KMSClient;

  async encrypt(plaintext: Buffer, masterKeyId: string): Promise<EnvelopeEncryptedData> {
    // Generate data encryption key (DEK)
    const dek = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );

    // Export DEK for wrapping
    const dekBytes = await crypto.subtle.exportKey('raw', dek);

    // Wrap DEK with master key (KEK) using KMS
    const wrappedDek = await this.kmsClient.encrypt({
      KeyId: masterKeyId,
      Plaintext: new Uint8Array(dekBytes)
    });

    // Encrypt data with DEK
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      dek,
      plaintext
    );

    return {
      ciphertext: new Uint8Array(ciphertext),
      iv,
      wrappedDek: wrappedDek.CiphertextBlob!,
      masterKeyId,
      algorithm: 'AES-256-GCM'
    };
  }

  async decrypt(encryptedData: EnvelopeEncryptedData): Promise<Buffer> {
    // Unwrap DEK using KMS
    const unwrappedDek = await this.kmsClient.decrypt({
      KeyId: encryptedData.masterKeyId,
      CiphertextBlob: encryptedData.wrappedDek
    });

    // Import DEK
    const dek = await crypto.subtle.importKey(
      'raw',
      unwrappedDek.Plaintext!,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    // Decrypt data
    const plaintext = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: encryptedData.iv },
      dek,
      encryptedData.ciphertext
    );

    return Buffer.from(plaintext);
  }
}
```

### Transparent Data Encryption

```typescript
class TransparentDataEncryption {
  private fieldEncryption: FieldLevelEncryption;
  private encryptionConfig: EncryptionConfig;

  createEncryptedModel<T>(modelName: string, schema: ModelSchema): EncryptedModel<T> {
    const sensitiveFields = this.getSensitiveFields(schema);

    return {
      async create(data: T): Promise<T> {
        const encrypted = await this.fieldEncryption.encryptFields(
          data as Record<string, any>,
          sensitiveFields,
          this.encryptionConfig.defaultKeyId
        );
        return await this.baseModel.create(encrypted);
      },

      async findById(id: string): Promise<T | null> {
        const encrypted = await this.baseModel.findById(id);
        if (!encrypted) return null;
        return await this.fieldEncryption.decryptFields(encrypted);
      },

      async update(id: string, data: Partial<T>): Promise<T> {
        const fieldsToEncrypt = Object.keys(data).filter(
          k => sensitiveFields.includes(k)
        );
        const encrypted = await this.fieldEncryption.encryptFields(
          data as Record<string, any>,
          fieldsToEncrypt,
          this.encryptionConfig.defaultKeyId
        );
        return await this.baseModel.update(id, encrypted);
      }
    };
  }

  private getSensitiveFields(schema: ModelSchema): string[] {
    return Object.entries(schema.fields)
      .filter(([_, config]) => config.encrypted)
      .map(([name]) => name);
  }
}
```

## Integration Points

### Cloud KMS Integration

```typescript
interface CloudKMSIntegration {
  awsKMS: AWSKMSAdapter;
  gcpKMS: GCPKMSAdapter;
  azureKeyVault: AzureKeyVaultAdapter;
}

class AWSKMSAdapter {
  private kmsClient: KMSClient;

  async createKey(config: AWSKeyConfig): Promise<string> {
    const result = await this.kmsClient.send(new CreateKeyCommand({
      KeyUsage: config.usage,
      KeySpec: config.spec,
      Description: config.description,
      Tags: config.tags,
      Policy: config.policy
    }));

    return result.KeyMetadata!.KeyId!;
  }

  async encrypt(keyId: string, plaintext: Uint8Array): Promise<Uint8Array> {
    const result = await this.kmsClient.send(new EncryptCommand({
      KeyId: keyId,
      Plaintext: plaintext,
      EncryptionAlgorithm: 'SYMMETRIC_DEFAULT'
    }));

    return result.CiphertextBlob!;
  }

  async decrypt(keyId: string, ciphertext: Uint8Array): Promise<Uint8Array> {
    const result = await this.kmsClient.send(new DecryptCommand({
      KeyId: keyId,
      CiphertextBlob: ciphertext,
      EncryptionAlgorithm: 'SYMMETRIC_DEFAULT'
    }));

    return result.Plaintext!;
  }

  async scheduleKeyRotation(keyId: string): Promise<void> {
    await this.kmsClient.send(new EnableKeyRotationCommand({
      KeyId: keyId
    }));
  }
}
```

### Database Encryption Integration

```typescript
class DatabaseEncryptionMiddleware {
  private fieldEncryption: FieldLevelEncryption;

  createMiddleware(encryptedFields: string[]): DatabaseMiddleware {
    return {
      beforeSave: async (document: any) => {
        return await this.fieldEncryption.encryptFields(
          document,
          encryptedFields,
          this.defaultKeyId
        );
      },

      afterFind: async (document: any) => {
        if (!document) return document;
        return await this.fieldEncryption.decryptFields(document);
      },

      beforeUpdate: async (update: any) => {
        const fieldsToEncrypt = Object.keys(update).filter(
          k => encryptedFields.includes(k)
        );
        if (fieldsToEncrypt.length === 0) return update;
        return await this.fieldEncryption.encryptFields(
          update,
          fieldsToEncrypt,
          this.defaultKeyId
        );
      }
    };
  }
}
```

## Security Considerations

### Key Security Best Practices

- Never store encryption keys alongside encrypted data
- Use hardware security modules (HSM) for master keys in production
- Implement key rotation policies (recommended: 90 days for data keys)
- Use separate keys for different data classifications
- Implement key access logging and monitoring

### Cryptographic Best Practices

- Use authenticated encryption (AES-GCM, ChaCha20-Poly1305)
- Generate cryptographically secure random IVs for each encryption
- Use appropriate key derivation functions (Argon2id, PBKDF2 with 100k+ iterations)
- Implement secure key destruction when keys are revoked

## Compliance Guidelines

- PCI DSS requirements for cardholder data encryption
- HIPAA requirements for PHI encryption
- GDPR Article 32 - encryption as a security measure
- SOC 2 encryption control requirements

## Testing Considerations

### Property-Based Tests

```typescript
describe('Encryption Properties', () => {
  it('should maintain data integrity through encrypt/decrypt cycle', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 10000 }),
      async (plaintext) => {
        const service = new EncryptionService();
        const key = await service.generateKey(EncryptionAlgorithm.AES_256_GCM);
        
        const encrypted = await service.encrypt(plaintext, { keyId: key.id });
        const decrypted = await service.decrypt(encrypted);
        
        expect(decrypted.toString()).toBe(plaintext);
      }
    ));
  });

  it('should produce different ciphertext for same plaintext', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1 }),
      async (plaintext) => {
        const service = new EncryptionService();
        
        const encrypted1 = await service.encrypt(plaintext, {});
        const encrypted2 = await service.encrypt(plaintext, {});
        
        // IVs should be different
        expect(encrypted1.iv).not.toEqual(encrypted2.iv);
        // Ciphertext should be different
        expect(encrypted1.ciphertext).not.toEqual(encrypted2.ciphertext);
      }
    ));
  });
});
```