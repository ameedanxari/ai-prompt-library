# Content Security Template

## Purpose

This template provides comprehensive patterns for implementing content security systems, covering encryption, access controls, watermarking, digital rights management, and content protection for content management platforms.

## Context

Content security is essential for protecting intellectual property, ensuring authorized access, and maintaining content integrity. A well-designed security system provides multiple layers of protection including encryption at rest and in transit, granular access controls, content watermarking, and rights management. This template addresses the complexity of building robust content security that balances protection with usability.

## Instructions

1. **Setup Encryption Infrastructure**: Configure content encryption at rest and in transit
2. **Implement Access Controls**: Build granular permission systems for content access
3. **Add Watermarking**: Enable visible and invisible watermarking for content protection
4. **Configure Rights Management**: Implement digital rights management (DRM) systems
5. **Enable Audit Logging**: Add comprehensive access and modification logging
6. **Add Content Protection**: Implement copy protection and download controls
7. **Test Security Controls**: Validate encryption, access controls, and audit trails

## Examples

### Example 1: Content Security Service
```typescript
interface ContentSecurityService {
  encryptContent(contentId: string, options: EncryptionOptions): Promise<EncryptedContent>;
  decryptContent(contentId: string, accessToken: string): Promise<DecryptedContent>;
  setAccessControls(contentId: string, permissions: ContentPermissions): Promise<void>;
  applyWatermark(contentId: string, watermark: WatermarkConfig): Promise<WatermarkedContent>;
  checkAccess(userId: string, contentId: string, action: AccessAction): Promise<AccessResult>;
}

const securityService = new ContentSecurityService();
await securityService.setAccessControls('content-123', {
  owner: 'user-456',
  viewers: ['user-789', 'group-editors'],
  editors: ['user-456'],
  expiresAt: new Date('2024-12-31')
});
```


### Example 2: Content Encryption
```typescript
interface EncryptionService {
  encryptAtRest(content: Buffer, keyId: string): Promise<EncryptedBuffer>;
  decryptAtRest(encrypted: EncryptedBuffer, keyId: string): Promise<Buffer>;
  rotateEncryptionKey(contentId: string, newKeyId: string): Promise<void>;
}

const encrypted = await encryptionService.encryptAtRest(contentBuffer, 'key-123');
console.log(encrypted.algorithm); // 'AES-256-GCM'
console.log(encrypted.keyId); // 'key-123'
```

### Example 3: Digital Watermarking
```typescript
interface WatermarkService {
  applyVisibleWatermark(mediaId: string, config: VisibleWatermarkConfig): Promise<string>;
  applyInvisibleWatermark(mediaId: string, payload: WatermarkPayload): Promise<string>;
  extractWatermark(mediaId: string): Promise<WatermarkPayload | null>;
}

const watermarked = await watermarkService.applyVisibleWatermark('image-123', {
  text: '© 2024 Company Name',
  position: 'bottom-right',
  opacity: 0.5
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableEncryption | Enable content encryption at rest | boolean | No | true |
| encryptionAlgorithm | Encryption algorithm to use | string | No | "AES-256-GCM" |
| enableAccessControls | Enable granular access controls | boolean | No | true |
| enableWatermarking | Enable content watermarking | boolean | No | false |
| enableDRM | Enable digital rights management | boolean | No | false |
| enableAuditLogging | Enable access audit logging | boolean | No | true |
| keyRotationDays | Days between key rotation | number | No | 90 |
| maxAccessAttempts | Maximum failed access attempts | number | No | 5 |

## Expected Output

This template will produce:
- **Encryption System**: Content encryption at rest and in transit
- **Access Control System**: Granular permission management
- **Watermarking Engine**: Visible and invisible watermarking
- **Rights Management**: DRM and license management
- **Audit Trail**: Comprehensive access and modification logging
- **Content Protection**: Copy protection and download controls
- **Key Management**: Secure key storage and rotation
- **Security Analytics**: Access pattern monitoring and anomaly detection

## Implementation Patterns

### Encryption Infrastructure

**Encryption Data Model**
```typescript
interface EncryptedContent {
  id: string;
  contentId: string;
  encryptedData: Buffer;
  
  // Encryption metadata
  algorithm: EncryptionAlgorithm;
  keyId: string;
  iv: Buffer;
  authTag?: Buffer;
  
  // Key management
  keyVersion: number;
  encryptedAt: Date;
  
  // Integrity
  checksum: string;
  checksumAlgorithm: string;
}

type EncryptionAlgorithm = 'AES-256-GCM' | 'AES-256-CBC' | 'ChaCha20-Poly1305';

interface EncryptionKey {
  id: string;
  algorithm: EncryptionAlgorithm;
  keyMaterial: Buffer; // Encrypted with master key
  version: number;
  status: 'active' | 'rotating' | 'retired';
  createdAt: Date;
  expiresAt?: Date;
  rotatedAt?: Date;
}
```

**Encryption Service Implementation**
```typescript
class ContentEncryptionService {
  async encryptContent(contentId: string, content: Buffer): Promise<EncryptedContent> {
    // Get active encryption key
    const key = await this.keyManager.getActiveKey();
    
    // Generate IV
    const iv = crypto.randomBytes(16);
    
    // Encrypt content
    const cipher = crypto.createCipheriv(key.algorithm, key.keyMaterial, iv);
    const encrypted = Buffer.concat([cipher.update(content), cipher.final()]);
    const authTag = cipher.getAuthTag();
    
    // Calculate checksum
    const checksum = crypto.createHash('sha256').update(content).digest('hex');
    
    const encryptedContent: EncryptedContent = {
      id: this.generateId(),
      contentId,
      encryptedData: encrypted,
      algorithm: key.algorithm,
      keyId: key.id,
      iv,
      authTag,
      keyVersion: key.version,
      encryptedAt: new Date(),
      checksum,
      checksumAlgorithm: 'sha256'
    };
    
    await this.encryptedContentRepository.save(encryptedContent);
    
    // Log encryption event
    await this.auditService.log({
      action: 'content_encrypted',
      contentId,
      keyId: key.id,
      timestamp: new Date()
    });
    
    return encryptedContent;
  }

  async decryptContent(contentId: string, accessToken: string): Promise<Buffer> {
    // Validate access token
    const accessGrant = await this.validateAccessToken(accessToken, contentId);
    if (!accessGrant.valid) {
      throw new AccessDeniedError('Invalid or expired access token');
    }
    
    // Get encrypted content
    const encryptedContent = await this.encryptedContentRepository.findByContentId(contentId);
    
    // Get decryption key
    const key = await this.keyManager.getKey(encryptedContent.keyId, encryptedContent.keyVersion);
    
    // Decrypt content
    const decipher = crypto.createDecipheriv(
      encryptedContent.algorithm,
      key.keyMaterial,
      encryptedContent.iv
    );
    
    if (encryptedContent.authTag) {
      decipher.setAuthTag(encryptedContent.authTag);
    }
    
    const decrypted = Buffer.concat([
      decipher.update(encryptedContent.encryptedData),
      decipher.final()
    ]);
    
    // Verify checksum
    const checksum = crypto.createHash(encryptedContent.checksumAlgorithm)
      .update(decrypted)
      .digest('hex');
    
    if (checksum !== encryptedContent.checksum) {
      throw new IntegrityError('Content integrity check failed');
    }
    
    // Log decryption event
    await this.auditService.log({
      action: 'content_decrypted',
      contentId,
      userId: accessGrant.userId,
      timestamp: new Date()
    });
    
    return decrypted;
  }

  async rotateKey(contentId: string): Promise<void> {
    const encryptedContent = await this.encryptedContentRepository.findByContentId(contentId);
    const oldKey = await this.keyManager.getKey(encryptedContent.keyId, encryptedContent.keyVersion);
    const newKey = await this.keyManager.getActiveKey();
    
    // Decrypt with old key
    const decrypted = await this.decryptWithKey(encryptedContent, oldKey);
    
    // Re-encrypt with new key
    const newEncrypted = await this.encryptWithKey(decrypted, newKey);
    
    // Update stored content
    encryptedContent.encryptedData = newEncrypted.encryptedData;
    encryptedContent.keyId = newKey.id;
    encryptedContent.keyVersion = newKey.version;
    encryptedContent.iv = newEncrypted.iv;
    encryptedContent.authTag = newEncrypted.authTag;
    encryptedContent.encryptedAt = new Date();
    
    await this.encryptedContentRepository.save(encryptedContent);
    
    // Log key rotation
    await this.auditService.log({
      action: 'key_rotated',
      contentId,
      oldKeyId: oldKey.id,
      newKeyId: newKey.id,
      timestamp: new Date()
    });
  }
}
```

### Access Control System

**Permission Model**
```typescript
interface ContentPermissions {
  contentId: string;
  owner: string;
  
  // Access lists
  viewers: AccessGrant[];
  editors: AccessGrant[];
  admins: AccessGrant[];
  
  // Inheritance
  inheritFromParent: boolean;
  parentId?: string;
  
  // Restrictions
  restrictions: AccessRestriction[];
  
  // Expiration
  expiresAt?: Date;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

interface AccessGrant {
  type: 'user' | 'group' | 'role' | 'public';
  id: string;
  permissions: Permission[];
  expiresAt?: Date;
  conditions?: AccessCondition[];
}

type Permission = 'view' | 'edit' | 'delete' | 'share' | 'download' | 'print' | 'admin';

interface AccessCondition {
  type: 'ip_range' | 'time_window' | 'device_type' | 'location' | 'mfa_required';
  value: any;
}

interface AccessRestriction {
  type: 'no_download' | 'no_print' | 'no_copy' | 'watermark_required' | 'time_limited';
  config?: Record<string, any>;
}
```

**Access Control Service**
```typescript
class AccessControlService {
  async checkAccess(
    userId: string,
    contentId: string,
    action: Permission
  ): Promise<AccessResult> {
    const permissions = await this.getContentPermissions(contentId);
    const user = await this.userService.getUser(userId);
    
    // Check owner access
    if (permissions.owner === userId) {
      return { allowed: true, reason: 'owner' };
    }
    
    // Check expiration
    if (permissions.expiresAt && new Date() > permissions.expiresAt) {
      return { allowed: false, reason: 'content_expired' };
    }
    
    // Check direct user grants
    const userGrant = this.findUserGrant(permissions, userId, action);
    if (userGrant) {
      const conditionsMet = await this.checkConditions(userGrant.conditions, user);
      if (conditionsMet) {
        return { allowed: true, reason: 'direct_grant', restrictions: permissions.restrictions };
      }
    }
    
    // Check group grants
    const userGroups = await this.getUserGroups(userId);
    for (const group of userGroups) {
      const groupGrant = this.findGroupGrant(permissions, group.id, action);
      if (groupGrant) {
        const conditionsMet = await this.checkConditions(groupGrant.conditions, user);
        if (conditionsMet) {
          return { allowed: true, reason: 'group_grant', restrictions: permissions.restrictions };
        }
      }
    }
    
    // Check role grants
    const roleGrant = this.findRoleGrant(permissions, user.role, action);
    if (roleGrant) {
      const conditionsMet = await this.checkConditions(roleGrant.conditions, user);
      if (conditionsMet) {
        return { allowed: true, reason: 'role_grant', restrictions: permissions.restrictions };
      }
    }
    
    // Check public access
    const publicGrant = this.findPublicGrant(permissions, action);
    if (publicGrant) {
      return { allowed: true, reason: 'public_access', restrictions: permissions.restrictions };
    }
    
    // Check inherited permissions
    if (permissions.inheritFromParent && permissions.parentId) {
      return this.checkAccess(userId, permissions.parentId, action);
    }
    
    return { allowed: false, reason: 'no_permission' };
  }

  async setPermissions(contentId: string, permissions: ContentPermissions): Promise<void> {
    // Validate permissions
    this.validatePermissions(permissions);
    
    // Check if user can modify permissions
    const currentUser = this.getCurrentUser();
    const canModify = await this.canModifyPermissions(currentUser.id, contentId);
    if (!canModify) {
      throw new AccessDeniedError('Cannot modify permissions for this content');
    }
    
    // Save permissions
    permissions.updatedAt = new Date();
    await this.permissionsRepository.save(permissions);
    
    // Log permission change
    await this.auditService.log({
      action: 'permissions_updated',
      contentId,
      userId: currentUser.id,
      changes: permissions,
      timestamp: new Date()
    });
    
    // Invalidate access cache
    await this.accessCache.invalidate(contentId);
  }

  private async checkConditions(
    conditions: AccessCondition[] | undefined,
    user: User
  ): Promise<boolean> {
    if (!conditions || conditions.length === 0) {
      return true;
    }
    
    for (const condition of conditions) {
      switch (condition.type) {
        case 'ip_range':
          if (!this.isIpInRange(user.currentIp, condition.value)) {
            return false;
          }
          break;
        case 'time_window':
          if (!this.isWithinTimeWindow(condition.value)) {
            return false;
          }
          break;
        case 'mfa_required':
          if (!user.mfaVerified) {
            return false;
          }
          break;
        case 'device_type':
          if (!condition.value.includes(user.deviceType)) {
            return false;
          }
          break;
      }
    }
    
    return true;
  }
}
```


### Watermarking System

**Watermark Implementation**
```typescript
interface WatermarkService {
  applyVisibleWatermark(mediaId: string, config: VisibleWatermarkConfig): Promise<string>;
  applyInvisibleWatermark(mediaId: string, payload: WatermarkPayload): Promise<string>;
  extractWatermark(mediaId: string): Promise<WatermarkPayload | null>;
  verifyWatermark(mediaId: string, expectedPayload: WatermarkPayload): Promise<boolean>;
}

interface VisibleWatermarkConfig {
  type: 'text' | 'image' | 'pattern';
  content: string | Buffer;
  position: WatermarkPosition;
  opacity: number;
  size?: number;
  rotation?: number;
  tiled?: boolean;
}

interface WatermarkPayload {
  contentId: string;
  userId: string;
  timestamp: Date;
  customData?: Record<string, any>;
}

class WatermarkService {
  async applyVisibleWatermark(
    mediaId: string,
    config: VisibleWatermarkConfig
  ): Promise<string> {
    const media = await this.mediaRepository.findById(mediaId);
    
    // Load media
    const mediaBuffer = await this.storageService.download(media.storageKey);
    
    // Apply watermark based on media type
    let watermarkedBuffer: Buffer;
    
    if (media.type === 'image') {
      watermarkedBuffer = await this.applyImageWatermark(mediaBuffer, config);
    } else if (media.type === 'video') {
      watermarkedBuffer = await this.applyVideoWatermark(mediaBuffer, config);
    } else if (media.type === 'pdf') {
      watermarkedBuffer = await this.applyPdfWatermark(mediaBuffer, config);
    } else {
      throw new Error(`Unsupported media type for watermarking: ${media.type}`);
    }
    
    // Store watermarked version
    const watermarkedKey = `watermarked/${mediaId}/${Date.now()}`;
    await this.storageService.upload(watermarkedKey, watermarkedBuffer);
    
    // Log watermark application
    await this.auditService.log({
      action: 'watermark_applied',
      mediaId,
      watermarkType: 'visible',
      config,
      timestamp: new Date()
    });
    
    return watermarkedKey;
  }

  async applyInvisibleWatermark(
    mediaId: string,
    payload: WatermarkPayload
  ): Promise<string> {
    const media = await this.mediaRepository.findById(mediaId);
    const mediaBuffer = await this.storageService.download(media.storageKey);
    
    // Encode payload
    const encodedPayload = this.encodePayload(payload);
    
    // Apply steganographic watermark
    let watermarkedBuffer: Buffer;
    
    if (media.type === 'image') {
      watermarkedBuffer = await this.embedInImage(mediaBuffer, encodedPayload);
    } else if (media.type === 'audio') {
      watermarkedBuffer = await this.embedInAudio(mediaBuffer, encodedPayload);
    } else if (media.type === 'video') {
      watermarkedBuffer = await this.embedInVideo(mediaBuffer, encodedPayload);
    } else {
      throw new Error(`Unsupported media type for invisible watermarking: ${media.type}`);
    }
    
    // Store watermarked version
    const watermarkedKey = `watermarked/${mediaId}/${Date.now()}`;
    await this.storageService.upload(watermarkedKey, watermarkedBuffer);
    
    // Store watermark record
    await this.watermarkRepository.save({
      mediaId,
      payload,
      storageKey: watermarkedKey,
      createdAt: new Date()
    });
    
    return watermarkedKey;
  }

  async extractWatermark(mediaId: string): Promise<WatermarkPayload | null> {
    const media = await this.mediaRepository.findById(mediaId);
    const mediaBuffer = await this.storageService.download(media.storageKey);
    
    // Extract encoded payload
    let encodedPayload: Buffer | null;
    
    if (media.type === 'image') {
      encodedPayload = await this.extractFromImage(mediaBuffer);
    } else if (media.type === 'audio') {
      encodedPayload = await this.extractFromAudio(mediaBuffer);
    } else if (media.type === 'video') {
      encodedPayload = await this.extractFromVideo(mediaBuffer);
    } else {
      return null;
    }
    
    if (!encodedPayload) {
      return null;
    }
    
    // Decode payload
    return this.decodePayload(encodedPayload);
  }

  private encodePayload(payload: WatermarkPayload): Buffer {
    const json = JSON.stringify(payload);
    const compressed = zlib.gzipSync(Buffer.from(json));
    const encrypted = this.encryptPayload(compressed);
    return encrypted;
  }

  private decodePayload(encoded: Buffer): WatermarkPayload {
    const decrypted = this.decryptPayload(encoded);
    const decompressed = zlib.gunzipSync(decrypted);
    return JSON.parse(decompressed.toString());
  }
}
```

### Digital Rights Management

**DRM Implementation**
```typescript
interface DRMService {
  createLicense(contentId: string, userId: string, rights: ContentRights): Promise<License>;
  validateLicense(licenseId: string): Promise<LicenseValidation>;
  revokeLicense(licenseId: string, reason: string): Promise<void>;
  getLicenseForContent(contentId: string, userId: string): Promise<License | null>;
}

interface License {
  id: string;
  contentId: string;
  userId: string;
  
  // Rights
  rights: ContentRights;
  
  // Validity
  issuedAt: Date;
  expiresAt?: Date;
  maxPlays?: number;
  currentPlays: number;
  
  // Device binding
  deviceId?: string;
  maxDevices?: number;
  boundDevices: string[];
  
  // Status
  status: 'active' | 'expired' | 'revoked' | 'exhausted';
  
  // Signature
  signature: string;
}

interface ContentRights {
  canPlay: boolean;
  canDownload: boolean;
  canPrint: boolean;
  canShare: boolean;
  canModify: boolean;
  quality: 'sd' | 'hd' | '4k';
  offlineAccess: boolean;
  offlineDuration?: number; // hours
}

class DRMService {
  async createLicense(
    contentId: string,
    userId: string,
    rights: ContentRights
  ): Promise<License> {
    // Verify user has purchased/subscribed to content
    const entitlement = await this.entitlementService.check(userId, contentId);
    if (!entitlement.valid) {
      throw new Error('User does not have entitlement to this content');
    }
    
    // Create license
    const license: License = {
      id: this.generateLicenseId(),
      contentId,
      userId,
      rights,
      issuedAt: new Date(),
      expiresAt: entitlement.expiresAt,
      maxPlays: entitlement.maxPlays,
      currentPlays: 0,
      maxDevices: entitlement.maxDevices || 3,
      boundDevices: [],
      status: 'active',
      signature: ''
    };
    
    // Sign license
    license.signature = this.signLicense(license);
    
    await this.licenseRepository.save(license);
    
    // Log license creation
    await this.auditService.log({
      action: 'license_created',
      licenseId: license.id,
      contentId,
      userId,
      timestamp: new Date()
    });
    
    return license;
  }

  async validateLicense(licenseId: string, deviceId?: string): Promise<LicenseValidation> {
    const license = await this.licenseRepository.findById(licenseId);
    
    if (!license) {
      return { valid: false, reason: 'license_not_found' };
    }
    
    // Verify signature
    if (!this.verifySignature(license)) {
      return { valid: false, reason: 'invalid_signature' };
    }
    
    // Check status
    if (license.status !== 'active') {
      return { valid: false, reason: `license_${license.status}` };
    }
    
    // Check expiration
    if (license.expiresAt && new Date() > license.expiresAt) {
      license.status = 'expired';
      await this.licenseRepository.save(license);
      return { valid: false, reason: 'license_expired' };
    }
    
    // Check play count
    if (license.maxPlays && license.currentPlays >= license.maxPlays) {
      license.status = 'exhausted';
      await this.licenseRepository.save(license);
      return { valid: false, reason: 'plays_exhausted' };
    }
    
    // Check device binding
    if (deviceId) {
      if (!license.boundDevices.includes(deviceId)) {
        if (license.boundDevices.length >= (license.maxDevices || 3)) {
          return { valid: false, reason: 'max_devices_reached' };
        }
        // Bind new device
        license.boundDevices.push(deviceId);
        await this.licenseRepository.save(license);
      }
    }
    
    return {
      valid: true,
      license,
      rights: license.rights,
      remainingPlays: license.maxPlays ? license.maxPlays - license.currentPlays : undefined
    };
  }

  async recordPlay(licenseId: string): Promise<void> {
    const license = await this.licenseRepository.findById(licenseId);
    
    license.currentPlays++;
    
    if (license.maxPlays && license.currentPlays >= license.maxPlays) {
      license.status = 'exhausted';
    }
    
    await this.licenseRepository.save(license);
  }

  private signLicense(license: License): string {
    const payload = JSON.stringify({
      id: license.id,
      contentId: license.contentId,
      userId: license.userId,
      rights: license.rights,
      issuedAt: license.issuedAt,
      expiresAt: license.expiresAt
    });
    
    return crypto.createHmac('sha256', this.signingKey)
      .update(payload)
      .digest('hex');
  }
}
```

### Integration Points

**External Security Integration**
```typescript
interface SecurityIntegration {
  integrateWithKMS(config: KMSConfig): Promise<void>;
  integrateWithHSM(config: HSMConfig): Promise<void>;
  integrateWithSIEM(config: SIEMConfig): Promise<void>;
}

class SecurityIntegrationService implements SecurityIntegration {
  async integrateWithKMS(config: KMSConfig): Promise<void> {
    // Configure AWS KMS or similar
    this.kmsClient = new KMSClient({
      region: config.region,
      credentials: config.credentials
    });
    
    // Test connection
    await this.kmsClient.send(new ListKeysCommand({}));
    
    // Update key manager to use KMS
    this.keyManager.setKeyProvider(new KMSKeyProvider(this.kmsClient));
  }
}
```

### Security Considerations

**Defense in Depth**
```typescript
interface SecurityLayerService {
  validateRequest(request: SecurityRequest): Promise<ValidationResult>;
  applySecurityHeaders(response: Response): Response;
  detectAnomalies(accessPattern: AccessPattern): Promise<AnomalyResult>;
}

class SecurityLayerService {
  async validateRequest(request: SecurityRequest): Promise<ValidationResult> {
    const validations: ValidationCheck[] = [];
    
    // Rate limiting
    const rateLimitResult = await this.rateLimiter.check(request.userId, request.action);
    validations.push({ check: 'rate_limit', passed: rateLimitResult.allowed });
    
    // Token validation
    const tokenResult = await this.tokenValidator.validate(request.accessToken);
    validations.push({ check: 'token', passed: tokenResult.valid });
    
    // IP reputation
    const ipResult = await this.ipReputationService.check(request.ip);
    validations.push({ check: 'ip_reputation', passed: ipResult.score > 0.5 });
    
    // Device fingerprint
    const deviceResult = await this.deviceService.verify(request.deviceFingerprint);
    validations.push({ check: 'device', passed: deviceResult.trusted });
    
    const allPassed = validations.every(v => v.passed);
    
    return {
      valid: allPassed,
      validations,
      riskScore: this.calculateRiskScore(validations)
    };
  }
}
```

### Testing Considerations

**Security Testing**
```typescript
describe('ContentSecurityService', () => {
  describe('encryption', () => {
    it('should encrypt and decrypt content correctly', async () => {
      const originalContent = Buffer.from('Sensitive content');
      
      const encrypted = await securityService.encryptContent('content-1', originalContent);
      const decrypted = await securityService.decryptContent('content-1', validToken);
      
      expect(decrypted).toEqual(originalContent);
    });

    it('should reject decryption with invalid token', async () => {
      await expect(securityService.decryptContent('content-1', 'invalid-token'))
        .rejects.toThrow(AccessDeniedError);
    });
  });

  describe('access control', () => {
    it('should allow owner full access', async () => {
      const result = await accessService.checkAccess('owner-id', 'content-1', 'admin');
      expect(result.allowed).toBe(true);
    });

    it('should enforce access conditions', async () => {
      const result = await accessService.checkAccess('user-1', 'content-1', 'view');
      // User outside allowed IP range
      expect(result.allowed).toBe(false);
    });
  });
});
```

## Real-World Considerations

**Performance**
- Cache decryption keys for frequently accessed content
- Use hardware acceleration for encryption operations
- Implement lazy decryption for large files
- Optimize watermarking for real-time streaming

**Compliance**
- Support regulatory requirements (GDPR, HIPAA, etc.)
- Implement data residency controls
- Maintain encryption key audit trails
- Support legal discovery and holds

**Key Management**
- Implement secure key storage (HSM recommended)
- Automate key rotation
- Support key escrow for recovery
- Monitor key usage and access

**Scalability**
- Distribute encryption workload
- Use CDN-compatible encryption schemes
- Implement efficient license validation
- Cache access control decisions

This template provides a comprehensive foundation for implementing robust content security systems that protect intellectual property while maintaining usability and supporting compliance requirements.
