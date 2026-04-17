# Data Security Template

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

This template provides comprehensive patterns for implementing data security in data processing systems including data encryption, access logging, data masking, and secure data transfers. It covers security controls, compliance requirements, and best practices for protecting sensitive data throughout the data lifecycle.

## Context

Data security is critical in data processing systems where sensitive information flows through multiple stages and systems. This template addresses the challenges of encrypting data at rest and in transit, implementing comprehensive audit logging, masking sensitive data for different use cases, and ensuring secure data transfers between systems while maintaining compliance with regulations like GDPR, HIPAA, and PCI-DSS.

## Core Components

### Data Encryption Service

## Examples

```typescript
interface DataEncryptionService {
  // Encryption operations
  encrypt(data: Buffer, keyId: string): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData): Promise<Buffer>;
  
  // Key management
  createKey(config: KeyConfig): Promise<string>;
  rotateKey(keyId: string): Promise<string>;
  getKeyMetadata(keyId: string): Promise<KeyMetadata>;
  
  // Field-level encryption
  encryptField(value: unknown, fieldConfig: FieldEncryptionConfig): Promise<string>;
  decryptField(encryptedValue: string, fieldConfig: FieldEncryptionConfig): Promise<unknown>;
  
  // Bulk operations
  encryptDataSet(data: DataSet, config: DataSetEncryptionConfig): Promise<DataSet>;
  decryptDataSet(data: DataSet, config: DataSetEncryptionConfig): Promise<DataSet>;
}


interface EncryptedData {
  ciphertext: Buffer;
  keyId: string;
  algorithm: EncryptionAlgorithm;
  iv?: Buffer;
  authTag?: Buffer;
  metadata?: Record<string, unknown>;
}

enum EncryptionAlgorithm {
  AES_256_GCM = 'aes-256-gcm',
  AES_256_CBC = 'aes-256-cbc',
  RSA_OAEP = 'rsa-oaep',
  CHACHA20_POLY1305 = 'chacha20-poly1305'
}

interface KeyConfig {
  algorithm: EncryptionAlgorithm;
  keySize: number;
  purpose: KeyPurpose;
  rotationPeriod?: number;
  expirationDate?: Date;
  tags?: Record<string, string>;
}

enum KeyPurpose {
  ENCRYPTION = 'encryption',
  SIGNING = 'signing',
  KEY_WRAPPING = 'key_wrapping'
}

interface KeyMetadata {
  keyId: string;
  algorithm: EncryptionAlgorithm;
  state: KeyState;
  createdAt: Date;
  rotatedAt?: Date;
  expiresAt?: Date;
  version: number;
}

enum KeyState {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  PENDING_DELETION = 'pending_deletion',
  DESTROYED = 'destroyed'
}

interface FieldEncryptionConfig {
  keyId: string;
  algorithm: EncryptionAlgorithm;
  preserveFormat?: boolean;
  deterministic?: boolean;
}

interface DataSetEncryptionConfig {
  keyId: string;
  encryptedFields: string[];
  preserveSchema?: boolean;
  compressionBeforeEncryption?: boolean;
}
```

### Access Logging Service

```typescript
interface AccessLoggingService {
  // Logging operations
  logAccess(event: AccessEvent): Promise<void>;
  logBulkAccess(events: AccessEvent[]): Promise<void>;
  
  // Query operations
  queryLogs(query: LogQuery): Promise<AccessLogResult>;
  getAccessHistory(resourceId: string, timeRange: TimeRange): Promise<AccessEvent[]>;
  
  // Analytics
  getAccessStats(filters: AccessFilters): Promise<AccessStats>;
  detectAnomalies(config: AnomalyDetectionConfig): Promise<AccessAnomaly[]>;
  
  // Compliance reporting
  generateAuditReport(config: AuditReportConfig): Promise<AuditReport>;
}

interface AccessEvent {
  id: string;
  timestamp: Date;
  eventType: AccessEventType;
  actor: ActorInfo;
  resource: ResourceInfo;
  action: string;
  outcome: 'success' | 'failure' | 'denied';
  details?: Record<string, unknown>;
  sourceIp?: string;
  userAgent?: string;
  sessionId?: string;
}

enum AccessEventType {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  EXPORT = 'export',
  SHARE = 'share',
  ADMIN = 'admin',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

interface ActorInfo {
  id: string;
  type: 'user' | 'service' | 'system';
  name?: string;
  roles?: string[];
  department?: string;
}

interface ResourceInfo {
  id: string;
  type: string;
  name?: string;
  classification?: string;
  owner?: string;
  path?: string;
}

interface AccessStats {
  totalAccesses: number;
  uniqueActors: number;
  uniqueResources: number;
  accessesByType: Map<AccessEventType, number>;
  accessesByOutcome: Map<string, number>;
  topActors: ActorAccessCount[];
  topResources: ResourceAccessCount[];
  accessTrend: TrendData[];
}

interface AccessAnomaly {
  id: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  actor?: ActorInfo;
  resource?: ResourceInfo;
  description: string;
  detectedAt: Date;
  evidence: AccessEvent[];
}

enum AnomalyType {
  UNUSUAL_ACCESS_PATTERN = 'unusual_access_pattern',
  BULK_DATA_ACCESS = 'bulk_data_access',
  OFF_HOURS_ACCESS = 'off_hours_access',
  GEOGRAPHIC_ANOMALY = 'geographic_anomaly',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  FAILED_ACCESS_SPIKE = 'failed_access_spike'
}
```


### Data Masking Service

```typescript
interface DataMaskingService {
  // Masking operations
  maskData(data: DataSet, config: MaskingConfig): Promise<DataSet>;
  maskField(value: unknown, rule: MaskingRule): Promise<unknown>;
  
  // Rule management
  createMaskingRule(rule: MaskingRule): Promise<string>;
  getMaskingRules(datasetId?: string): Promise<MaskingRule[]>;
  
  // Policy management
  createMaskingPolicy(policy: MaskingPolicy): Promise<string>;
  applyPolicy(datasetId: string, policyId: string): Promise<void>;
  
  // Tokenization
  tokenize(value: string, config: TokenizationConfig): Promise<string>;
  detokenize(token: string): Promise<string>;
}

interface MaskingConfig {
  rules: MaskingRule[];
  preserveReferentialIntegrity?: boolean;
  deterministicMasking?: boolean;
  seed?: string;
}

interface MaskingRule {
  id: string;
  name: string;
  field: string;
  type: MaskingType;
  parameters?: MaskingParameters;
  condition?: MaskingCondition;
  enabled: boolean;
}

enum MaskingType {
  REDACT = 'redact',
  PARTIAL_MASK = 'partial_mask',
  HASH = 'hash',
  ENCRYPT = 'encrypt',
  TOKENIZE = 'tokenize',
  SUBSTITUTE = 'substitute',
  SHUFFLE = 'shuffle',
  NULL = 'null',
  GENERALIZE = 'generalize',
  NOISE = 'noise'
}

interface MaskingParameters {
  // For partial masking
  showFirst?: number;
  showLast?: number;
  maskChar?: string;
  
  // For substitution
  substitutionTable?: string;
  preserveFormat?: boolean;
  
  // For generalization
  generalizationLevel?: number;
  
  // For noise
  noiseRange?: number;
  noiseType?: 'additive' | 'multiplicative';
}

interface MaskingPolicy {
  id: string;
  name: string;
  description?: string;
  rules: MaskingRule[];
  applicableClassifications: string[];
  applicableRoles?: string[];
  priority: number;
}

interface TokenizationConfig {
  format: TokenFormat;
  preserveLength?: boolean;
  vaultId: string;
  ttl?: number;
}

enum TokenFormat {
  ALPHANUMERIC = 'alphanumeric',
  NUMERIC = 'numeric',
  UUID = 'uuid',
  CUSTOM = 'custom'
}
```

### Secure Transfer Service

```typescript
interface SecureTransferService {
  // Transfer operations
  initiateTransfer(config: TransferConfig): Promise<string>;
  getTransferStatus(transferId: string): Promise<TransferStatus>;
  cancelTransfer(transferId: string): Promise<void>;
  
  // Secure channels
  createSecureChannel(config: ChannelConfig): Promise<SecureChannel>;
  closeChannel(channelId: string): Promise<void>;
  
  // File transfer
  uploadSecure(file: Buffer, destination: TransferDestination): Promise<TransferResult>;
  downloadSecure(source: TransferSource): Promise<Buffer>;
  
  // Streaming transfer
  createSecureStream(config: StreamConfig): Promise<SecureStream>;
}

interface TransferConfig {
  source: TransferSource;
  destination: TransferDestination;
  encryption: TransferEncryption;
  compression?: CompressionConfig;
  validation?: TransferValidation;
  retryPolicy?: RetryPolicy;
}

interface TransferSource {
  type: 'file' | 'database' | 'api' | 'stream';
  location: string;
  credentials?: CredentialRef;
  query?: string;
}

interface TransferDestination {
  type: 'file' | 'database' | 'api' | 'stream';
  location: string;
  credentials?: CredentialRef;
  createIfNotExists?: boolean;
}

interface TransferEncryption {
  inTransit: boolean;
  algorithm?: EncryptionAlgorithm;
  keyId?: string;
  tlsVersion?: string;
  certificateValidation?: boolean;
}

interface TransferStatus {
  transferId: string;
  state: TransferState;
  bytesTransferred: number;
  totalBytes?: number;
  startTime: Date;
  endTime?: Date;
  error?: string;
  checksum?: string;
}

enum TransferState {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

interface SecureChannel {
  id: string;
  protocol: 'tls' | 'ssh' | 'ipsec';
  state: 'open' | 'closed';
  encryption: EncryptionAlgorithm;
  send(data: Buffer): Promise<void>;
  receive(): Promise<Buffer>;
  close(): Promise<void>;
}

interface TransferValidation {
  checksumAlgorithm: 'md5' | 'sha256' | 'sha512';
  validateBeforeTransfer?: boolean;
  validateAfterTransfer?: boolean;
  schemaValidation?: boolean;
}
```


## Implementation Patterns

### Encryption Manager

```typescript
class DataEncryptionManager {
  private kmsClient: KMSClient;
  private keyCache: Map<string, CachedKey> = new Map();

  async encryptDataSet(
    data: DataSet,
    config: DataSetEncryptionConfig
  ): Promise<DataSet> {
    const key = await this.getOrCreateDataKey(config.keyId);
    const encryptedRecords: DataRecord[] = [];

    for (const record of data) {
      const encryptedRecord = { ...record };

      for (const field of config.encryptedFields) {
        if (record[field] !== undefined && record[field] !== null) {
          encryptedRecord[field] = await this.encryptField(
            record[field],
            key,
            { preserveFormat: config.preserveSchema }
          );
        }
      }

      encryptedRecords.push(encryptedRecord);
    }

    return encryptedRecords;
  }

  private async getOrCreateDataKey(masterKeyId: string): Promise<DataKey> {
    // Check cache
    const cached = this.keyCache.get(masterKeyId);
    if (cached && !this.isExpired(cached)) {
      return cached.key;
    }

    // Generate new data key
    const response = await this.kmsClient.generateDataKey({
      KeyId: masterKeyId,
      KeySpec: 'AES_256'
    });

    const dataKey: DataKey = {
      plaintext: response.Plaintext,
      encrypted: response.CiphertextBlob,
      keyId: masterKeyId
    };

    // Cache the key
    this.keyCache.set(masterKeyId, {
      key: dataKey,
      expiresAt: Date.now() + 3600000 // 1 hour
    });

    return dataKey;
  }

  private async encryptField(
    value: unknown,
    key: DataKey,
    options: FieldEncryptionOptions
  ): Promise<string> {
    const plaintext = JSON.stringify(value);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv('aes-256-gcm', key.plaintext, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    // Combine IV, auth tag, and ciphertext
    const combined = Buffer.concat([
      iv,
      authTag,
      Buffer.from(encrypted, 'base64')
    ]);

    return combined.toString('base64');
  }

  async rotateKey(keyId: string): Promise<void> {
    // Create new key version
    await this.kmsClient.enableKeyRotation({ KeyId: keyId });

    // Clear cache to force new key fetch
    this.keyCache.delete(keyId);

    // Log rotation event
    await this.auditLog.log({
      eventType: 'key_rotation',
      keyId,
      timestamp: new Date()
    });
  }
}
```

### Access Logger

```typescript
class ComprehensiveAccessLogger {
  private logStore: LogStore;
  private anomalyDetector: AnomalyDetector;

  async logAccess(event: AccessEvent): Promise<void> {
    // Enrich event with additional context
    const enrichedEvent = await this.enrichEvent(event);

    // Store the log
    await this.logStore.write(enrichedEvent);

    // Check for anomalies in real-time
    await this.checkForAnomalies(enrichedEvent);

    // Update access statistics
    await this.updateStats(enrichedEvent);
  }

  private async enrichEvent(event: AccessEvent): Promise<AccessEvent> {
    return {
      ...event,
      id: event.id || this.generateEventId(),
      timestamp: event.timestamp || new Date(),
      details: {
        ...event.details,
        geoLocation: await this.resolveGeoLocation(event.sourceIp),
        riskScore: await this.calculateRiskScore(event)
      }
    };
  }

  private async checkForAnomalies(event: AccessEvent): Promise<void> {
    const anomalies = await this.anomalyDetector.analyze(event);

    for (const anomaly of anomalies) {
      if (anomaly.severity === 'critical' || anomaly.severity === 'high') {
        await this.alertService.sendAlert({
          type: 'security_anomaly',
          severity: anomaly.severity,
          message: anomaly.description,
          context: { event, anomaly }
        });
      }
    }
  }

  async generateAuditReport(config: AuditReportConfig): Promise<AuditReport> {
    const logs = await this.logStore.query({
      timeRange: config.timeRange,
      filters: config.filters
    });

    return {
      reportId: this.generateReportId(),
      generatedAt: new Date(),
      timeRange: config.timeRange,
      summary: this.generateSummary(logs),
      accessPatterns: this.analyzeAccessPatterns(logs),
      anomalies: await this.getAnomaliesInRange(config.timeRange),
      complianceStatus: await this.assessCompliance(logs, config.complianceFramework),
      recommendations: this.generateRecommendations(logs)
    };
  }
}
```


### Data Masking Engine

```typescript
class DataMaskingEngine {
  private tokenVault: TokenVault;

  async maskDataSet(data: DataSet, config: MaskingConfig): Promise<DataSet> {
    const maskedRecords: DataRecord[] = [];
    const maskingContext = this.createMaskingContext(config);

    for (const record of data) {
      const maskedRecord = await this.maskRecord(record, config.rules, maskingContext);
      maskedRecords.push(maskedRecord);
    }

    return maskedRecords;
  }

  private async maskRecord(
    record: DataRecord,
    rules: MaskingRule[],
    context: MaskingContext
  ): Promise<DataRecord> {
    const maskedRecord = { ...record };

    for (const rule of rules) {
      if (!rule.enabled) continue;
      if (rule.condition && !this.evaluateCondition(rule.condition, record)) continue;

      const value = record[rule.field];
      if (value === undefined || value === null) continue;

      maskedRecord[rule.field] = await this.applyMasking(value, rule, context);
    }

    return maskedRecord;
  }

  private async applyMasking(
    value: unknown,
    rule: MaskingRule,
    context: MaskingContext
  ): Promise<unknown> {
    switch (rule.type) {
      case MaskingType.REDACT:
        return this.redact(value, rule.parameters);

      case MaskingType.PARTIAL_MASK:
        return this.partialMask(String(value), rule.parameters);

      case MaskingType.HASH:
        return this.hash(value, context.seed);

      case MaskingType.TOKENIZE:
        return this.tokenize(String(value), rule.parameters);

      case MaskingType.SUBSTITUTE:
        return this.substitute(value, rule.parameters, context);

      case MaskingType.GENERALIZE:
        return this.generalize(value, rule.parameters);

      case MaskingType.NOISE:
        return this.addNoise(Number(value), rule.parameters);

      case MaskingType.NULL:
        return null;

      default:
        return value;
    }
  }

  private partialMask(value: string, params?: MaskingParameters): string {
    const showFirst = params?.showFirst || 0;
    const showLast = params?.showLast || 0;
    const maskChar = params?.maskChar || '*';

    if (value.length <= showFirst + showLast) {
      return maskChar.repeat(value.length);
    }

    const first = value.substring(0, showFirst);
    const last = value.substring(value.length - showLast);
    const masked = maskChar.repeat(value.length - showFirst - showLast);

    return first + masked + last;
  }

  private async tokenize(value: string, params?: MaskingParameters): Promise<string> {
    // Check if already tokenized
    const existingToken = await this.tokenVault.findToken(value);
    if (existingToken) return existingToken;

    // Generate new token
    const token = this.generateToken(params?.format || TokenFormat.UUID);
    await this.tokenVault.store(token, value);

    return token;
  }

  private generalize(value: unknown, params?: MaskingParameters): unknown {
    const level = params?.generalizationLevel || 1;

    if (typeof value === 'number') {
      // Round to nearest power of 10
      const factor = Math.pow(10, level);
      return Math.round(value / factor) * factor;
    }

    if (value instanceof Date) {
      // Generalize to month/year based on level
      const date = new Date(value);
      if (level >= 2) {
        return `${date.getFullYear()}`;
      }
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    }

    return value;
  }
}
```

## Integration Points

### AWS KMS Integration

```typescript
// AWS KMS integration for key management
class AWSKMSIntegration {
  private kmsClient: KMSClient;

  async createKey(config: KeyConfig): Promise<string> {
    const response = await this.kmsClient.createKey({
      Description: config.description,
      KeyUsage: config.purpose === KeyPurpose.ENCRYPTION ? 'ENCRYPT_DECRYPT' : 'SIGN_VERIFY',
      KeySpec: this.mapKeySpec(config.algorithm),
      Tags: Object.entries(config.tags || {}).map(([Key, Value]) => ({ Key, Value }))
    });

    return response.KeyMetadata.KeyId;
  }

  async encrypt(plaintext: Buffer, keyId: string): Promise<EncryptedData> {
    const response = await this.kmsClient.encrypt({
      KeyId: keyId,
      Plaintext: plaintext,
      EncryptionAlgorithm: 'SYMMETRIC_DEFAULT'
    });

    return {
      ciphertext: Buffer.from(response.CiphertextBlob),
      keyId: response.KeyId,
      algorithm: EncryptionAlgorithm.AES_256_GCM
    };
  }
}
```

### HashiCorp Vault Integration

```typescript
// HashiCorp Vault integration for secrets and tokenization
class VaultIntegration {
  private vaultClient: VaultClient;

  async tokenize(value: string, role: string): Promise<string> {
    const response = await this.vaultClient.write(`transform/encode/${role}`, {
      value,
      transformation: 'tokenization'
    });

    return response.data.encoded_value;
  }

  async detokenize(token: string, role: string): Promise<string> {
    const response = await this.vaultClient.write(`transform/decode/${role}`, {
      value: token,
      transformation: 'tokenization'
    });

    return response.data.decoded_value;
  }

  async getSecret(path: string): Promise<Record<string, unknown>> {
    const response = await this.vaultClient.read(path);
    return response.data;
  }
}
```

## Security Considerations

### Key Management
- Use hardware security modules (HSM) for master key storage
- Implement automatic key rotation policies
- Maintain key usage audit trails
- Use envelope encryption for data keys

### Access Control
- Implement least privilege access for encryption keys
- Use role-based access for masking policies
- Audit all key and data access operations
- Implement separation of duties for key management

### Compliance
- Ensure encryption meets regulatory requirements (FIPS 140-2)
- Maintain comprehensive audit logs for compliance
- Implement data retention and destruction policies
- Support data subject access requests

## Testing Considerations

### Unit Testing

```typescript
describe('DataEncryptionManager', () => {
  it('should encrypt and decrypt data correctly', async () => {
    const manager = new DataEncryptionManager(mockKMS);
    const plaintext = { name: 'John Doe', ssn: '123-45-6789' };
    
    const encrypted = await manager.encryptDataSet([plaintext], {
      keyId: 'test-key',
      encryptedFields: ['ssn']
    });
    
    expect(encrypted[0].ssn).not.toBe(plaintext.ssn);
    
    const decrypted = await manager.decryptDataSet(encrypted, {
      keyId: 'test-key',
      encryptedFields: ['ssn']
    });
    
    expect(decrypted[0].ssn).toBe(plaintext.ssn);
  });
});
```

### Property-Based Testing

```typescript
describe('Data Security Properties', () => {
  it('should preserve data through encryption round-trip', () => {
    fc.assert(fc.property(
      fc.record({ id: fc.string(), value: fc.string() }),
      async (data) => {
        const encrypted = await encryptionService.encrypt(data);
        const decrypted = await encryptionService.decrypt(encrypted);
        expect(decrypted).toEqual(data);
      }
    ));
  });

  it('should always log access events', () => {
    fc.assert(fc.property(
      fc.record({ actorId: fc.string(), resourceId: fc.string(), action: fc.string() }),
      async (access) => {
        await accessLogger.logAccess(access);
        const logs = await accessLogger.queryLogs({ resourceId: access.resourceId });
        expect(logs.length).toBeGreaterThan(0);
      }
    ));
  });
});
```
