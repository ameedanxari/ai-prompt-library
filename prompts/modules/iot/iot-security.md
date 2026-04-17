# IoT Security Template

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

This template provides comprehensive patterns for implementing device certificates, secure communication, access controls, and security monitoring in IoT applications. It covers device identity management, encrypted communications, secure provisioning, and threat detection specific to IoT environments.

## Context

IoT security requires specialized approaches due to resource-constrained devices, diverse communication protocols, and large-scale deployments. This template addresses the implementation of security controls across the IoT stack while balancing security requirements with device capabilities and operational constraints.

## Core Components

### Device Certificate Service

## Examples

```typescript
interface DeviceCertificateService {
  generateCertificate(request: CertificateRequest): Promise<DeviceCertificate>;
  renewCertificate(deviceId: string): Promise<DeviceCertificate>;
  revokeCertificate(certificateId: string, reason: RevocationReason): Promise<void>;
  validateCertificate(certificate: string): Promise<CertificateValidation>;
  getCertificateStatus(certificateId: string): Promise<CertificateStatus>;
  listDeviceCertificates(deviceId: string): Promise<DeviceCertificate[]>;
}

interface CertificateRequest {
  deviceId: string;
  deviceType: string;
  commonName: string;
  organization?: string;
  organizationalUnit?: string;
  country?: string;
  validityDays: number;
  keyType: KeyType;
  keySize?: number;
  extensions?: CertificateExtension[];
}

interface DeviceCertificate {
  id: string;
  deviceId: string;
  certificatePem: string;
  privateKeyPem?: string;
  publicKeyPem: string;
  serialNumber: string;
  fingerprint: string;
  issuer: string;
  subject: string;
  validFrom: Date;
  validTo: Date;
  status: CertificateStatus;
  keyType: KeyType;
  signatureAlgorithm: string;
  extensions: CertificateExtension[];
}

enum KeyType {
  RSA_2048 = 'rsa_2048',
  RSA_4096 = 'rsa_4096',
  EC_P256 = 'ec_p256',
  EC_P384 = 'ec_p384',
  ED25519 = 'ed25519'
}

enum CertificateStatus {
  ACTIVE = 'active',
  PENDING_ACTIVATION = 'pending_activation',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended'
}

enum RevocationReason {
  KEY_COMPROMISE = 'key_compromise',
  CA_COMPROMISE = 'ca_compromise',
  AFFILIATION_CHANGED = 'affiliation_changed',
  SUPERSEDED = 'superseded',
  CESSATION_OF_OPERATION = 'cessation_of_operation',
  CERTIFICATE_HOLD = 'certificate_hold',
  PRIVILEGE_WITHDRAWN = 'privilege_withdrawn'
}

interface CertificateValidation {
  valid: boolean;
  certificateId?: string;
  deviceId?: string;
  status?: CertificateStatus;
  errors: ValidationError[];
  chainValid: boolean;
  notBefore: Date;
  notAfter: Date;
}
```

### Secure Communication Service

```typescript
interface SecureCommunicationService {
  establishSecureChannel(deviceId: string, options: ChannelOptions): Promise<SecureChannel>;
  encryptMessage(channel: SecureChannel, message: Buffer): Promise<EncryptedMessage>;
  decryptMessage(channel: SecureChannel, encrypted: EncryptedMessage): Promise<Buffer>;
  verifyMessageIntegrity(message: EncryptedMessage): Promise<boolean>;
  rotateSessionKeys(channel: SecureChannel): Promise<SecureChannel>;
}

interface ChannelOptions {
  protocol: SecurityProtocol;
  cipherSuite?: CipherSuite;
  mutualAuth: boolean;
  certificateValidation: CertificateValidationMode;
  sessionTimeout?: number;
  renegotiationInterval?: number;
}

enum SecurityProtocol {
  TLS_1_3 = 'tls_1_3',
  TLS_1_2 = 'tls_1_2',
  DTLS_1_2 = 'dtls_1_2',
  DTLS_1_3 = 'dtls_1_3',
  NOISE = 'noise',
  OSCORE = 'oscore'
}

enum CipherSuite {
  TLS_AES_256_GCM_SHA384 = 'TLS_AES_256_GCM_SHA384',
  TLS_AES_128_GCM_SHA256 = 'TLS_AES_128_GCM_SHA256',
  TLS_CHACHA20_POLY1305_SHA256 = 'TLS_CHACHA20_POLY1305_SHA256',
  TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 = 'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384'
}

interface SecureChannel {
  id: string;
  deviceId: string;
  protocol: SecurityProtocol;
  cipherSuite: CipherSuite;
  sessionKey: Uint8Array;
  establishedAt: Date;
  expiresAt: Date;
  messageCounter: number;
  peerCertificate?: DeviceCertificate;
}

interface EncryptedMessage {
  ciphertext: Uint8Array;
  iv: Uint8Array;
  tag: Uint8Array;
  sequenceNumber: number;
  timestamp: Date;
  channelId: string;
}
```

### Device Access Control Service

```typescript
interface DeviceAccessControlService {
  createPolicy(policy: DevicePolicy): Promise<DevicePolicy>;
  attachPolicy(deviceId: string, policyId: string): Promise<void>;
  detachPolicy(deviceId: string, policyId: string): Promise<void>;
  evaluateAccess(request: AccessRequest): Promise<AccessDecision>;
  getDevicePolicies(deviceId: string): Promise<DevicePolicy[]>;
  auditAccess(deviceId: string, filter?: AuditFilter): Promise<AccessAuditLog[]>;
}

interface DevicePolicy {
  id: string;
  name: string;
  version: number;
  statements: PolicyStatement[];
  conditions?: PolicyCondition[];
  createdAt: Date;
  updatedAt: Date;
}

interface PolicyStatement {
  effect: 'allow' | 'deny';
  actions: string[];
  resources: string[];
  conditions?: StatementCondition[];
}

interface StatementCondition {
  type: ConditionType;
  key: string;
  values: string[];
}

enum ConditionType {
  STRING_EQUALS = 'string_equals',
  STRING_LIKE = 'string_like',
  IP_ADDRESS = 'ip_address',
  DATE_GREATER_THAN = 'date_greater_than',
  DATE_LESS_THAN = 'date_less_than',
  BOOL = 'bool',
  NUMERIC_EQUALS = 'numeric_equals',
  NUMERIC_GREATER_THAN = 'numeric_greater_than'
}

interface AccessRequest {
  deviceId: string;
  action: string;
  resource: string;
  context: AccessContext;
}

interface AccessContext {
  sourceIp?: string;
  timestamp: Date;
  certificateId?: string;
  sessionId?: string;
  attributes?: Record<string, unknown>;
}

interface AccessDecision {
  allowed: boolean;
  matchedPolicy?: string;
  matchedStatement?: number;
  reason?: string;
  evaluatedAt: Date;
}

interface AccessAuditLog {
  id: string;
  deviceId: string;
  action: string;
  resource: string;
  decision: AccessDecision;
  context: AccessContext;
  timestamp: Date;
}
```

### Security Monitoring Service

```typescript
interface SecurityMonitoringService {
  detectAnomalies(deviceId: string): Promise<SecurityAnomaly[]>;
  reportSecurityEvent(event: SecurityEvent): Promise<void>;
  getSecurityAlerts(filter?: AlertFilter): Promise<SecurityAlert[]>;
  acknowledgeAlert(alertId: string): Promise<void>;
  getDeviceSecurityScore(deviceId: string): Promise<SecurityScore>;
  getThreatIntelligence(deviceId: string): Promise<ThreatIntelligence>;
}

interface SecurityAnomaly {
  id: string;
  deviceId: string;
  type: AnomalyType;
  severity: Severity;
  description: string;
  detectedAt: Date;
  indicators: AnomalyIndicator[];
  recommendedActions: string[];
}

enum AnomalyType {
  UNUSUAL_TRAFFIC = 'unusual_traffic',
  AUTHENTICATION_FAILURE = 'authentication_failure',
  CERTIFICATE_ANOMALY = 'certificate_anomaly',
  FIRMWARE_TAMPERING = 'firmware_tampering',
  CONFIGURATION_DRIFT = 'configuration_drift',
  BEHAVIORAL_ANOMALY = 'behavioral_anomaly',
  NETWORK_SCAN = 'network_scan',
  DATA_EXFILTRATION = 'data_exfiltration'
}

interface SecurityEvent {
  deviceId: string;
  eventType: SecurityEventType;
  severity: Severity;
  description: string;
  source: string;
  timestamp: Date;
  metadata: Record<string, unknown>;
}

enum SecurityEventType {
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  CERTIFICATE_ISSUED = 'certificate_issued',
  CERTIFICATE_REVOKED = 'certificate_revoked',
  POLICY_VIOLATION = 'policy_violation',
  FIRMWARE_UPDATE = 'firmware_update',
  CONFIGURATION_CHANGE = 'configuration_change',
  ANOMALY_DETECTED = 'anomaly_detected',
  ATTACK_DETECTED = 'attack_detected'
}

interface SecurityScore {
  deviceId: string;
  overallScore: number;
  categories: SecurityScoreCategory[];
  lastUpdated: Date;
  trend: 'improving' | 'stable' | 'declining';
  recommendations: SecurityRecommendation[];
}

interface SecurityScoreCategory {
  name: string;
  score: number;
  weight: number;
  factors: ScoreFactor[];
}
```

## Implementation Patterns

### Certificate Authority Integration

```typescript
class IoTCertificateAuthority implements DeviceCertificateService {
  private caPrivateKey: CryptoKey;
  private caCertificate: X509Certificate;
  private certificateStore: CertificateStore;
  private crlManager: CRLManager;

  async generateCertificate(request: CertificateRequest): Promise<DeviceCertificate> {
    // Generate device key pair
    const keyPair = await this.generateKeyPair(request.keyType, request.keySize);

    // Create certificate signing request
    const csr = await this.createCSR(keyPair, request);

    // Sign certificate with CA
    const certificate = await this.signCertificate(csr, request);

    // Store certificate
    const deviceCert: DeviceCertificate = {
      id: crypto.randomUUID(),
      deviceId: request.deviceId,
      certificatePem: certificate.toPEM(),
      privateKeyPem: await this.exportPrivateKey(keyPair.privateKey),
      publicKeyPem: await this.exportPublicKey(keyPair.publicKey),
      serialNumber: certificate.serialNumber,
      fingerprint: await this.calculateFingerprint(certificate),
      issuer: this.caCertificate.subject,
      subject: certificate.subject,
      validFrom: certificate.notBefore,
      validTo: certificate.notAfter,
      status: CertificateStatus.ACTIVE,
      keyType: request.keyType,
      signatureAlgorithm: certificate.signatureAlgorithm,
      extensions: request.extensions || []
    };

    await this.certificateStore.save(deviceCert);
    await this.auditService.logCertificateIssuance(deviceCert);

    return deviceCert;
  }

  async revokeCertificate(certificateId: string, reason: RevocationReason): Promise<void> {
    const certificate = await this.certificateStore.get(certificateId);
    if (!certificate) {
      throw new Error('Certificate not found');
    }

    certificate.status = CertificateStatus.REVOKED;
    await this.certificateStore.update(certificate);

    // Add to CRL
    await this.crlManager.addRevocation({
      serialNumber: certificate.serialNumber,
      revocationDate: new Date(),
      reason
    });

    // Publish updated CRL
    await this.crlManager.publishCRL();

    await this.auditService.logCertificateRevocation(certificate, reason);
  }

  async validateCertificate(certificatePem: string): Promise<CertificateValidation> {
    const errors: ValidationError[] = [];
    
    try {
      const certificate = new X509Certificate(certificatePem);

      // Check expiration
      const now = new Date();
      if (now < certificate.notBefore) {
        errors.push({ code: 'NOT_YET_VALID', message: 'Certificate not yet valid' });
      }
      if (now > certificate.notAfter) {
        errors.push({ code: 'EXPIRED', message: 'Certificate has expired' });
      }

      // Verify signature chain
      const chainValid = await this.verifyChain(certificate);
      if (!chainValid) {
        errors.push({ code: 'CHAIN_INVALID', message: 'Certificate chain validation failed' });
      }

      // Check revocation status
      const isRevoked = await this.crlManager.isRevoked(certificate.serialNumber);
      if (isRevoked) {
        errors.push({ code: 'REVOKED', message: 'Certificate has been revoked' });
      }

      // Look up stored certificate
      const storedCert = await this.certificateStore.findByFingerprint(
        await this.calculateFingerprint(certificate)
      );

      return {
        valid: errors.length === 0,
        certificateId: storedCert?.id,
        deviceId: storedCert?.deviceId,
        status: storedCert?.status,
        errors,
        chainValid,
        notBefore: certificate.notBefore,
        notAfter: certificate.notAfter
      };
    } catch (error) {
      return {
        valid: false,
        errors: [{ code: 'PARSE_ERROR', message: (error as Error).message }],
        chainValid: false,
        notBefore: new Date(0),
        notAfter: new Date(0)
      };
    }
  }

  private async generateKeyPair(keyType: KeyType, keySize?: number): Promise<CryptoKeyPair> {
    switch (keyType) {
      case KeyType.RSA_2048:
      case KeyType.RSA_4096:
        return crypto.subtle.generateKey(
          {
            name: 'RSASSA-PKCS1-v1_5',
            modulusLength: keyType === KeyType.RSA_2048 ? 2048 : 4096,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: 'SHA-256'
          },
          true,
          ['sign', 'verify']
        );
      case KeyType.EC_P256:
      case KeyType.EC_P384:
        return crypto.subtle.generateKey(
          {
            name: 'ECDSA',
            namedCurve: keyType === KeyType.EC_P256 ? 'P-256' : 'P-384'
          },
          true,
          ['sign', 'verify']
        );
      default:
        throw new Error(`Unsupported key type: ${keyType}`);
    }
  }
}
```

### Secure Device Provisioning

```typescript
class SecureDeviceProvisioning {
  private certificateService: DeviceCertificateService;
  private deviceRegistry: DeviceRegistryService;
  private provisioningTokens: Map<string, ProvisioningToken>;

  async createProvisioningToken(config: ProvisioningConfig): Promise<ProvisioningToken> {
    const token: ProvisioningToken = {
      id: crypto.randomUUID(),
      token: this.generateSecureToken(),
      deviceType: config.deviceType,
      maxUses: config.maxUses || 1,
      usedCount: 0,
      expiresAt: new Date(Date.now() + (config.validityHours || 24) * 3600000),
      policies: config.policies,
      groupIds: config.groupIds,
      createdAt: new Date()
    };

    this.provisioningTokens.set(token.token, token);
    return token;
  }

  async provisionDevice(request: ProvisioningRequest): Promise<ProvisionedDevice> {
    // Validate provisioning token
    const token = this.provisioningTokens.get(request.provisioningToken);
    if (!token) {
      throw new ProvisioningError('Invalid provisioning token');
    }

    if (token.usedCount >= token.maxUses) {
      throw new ProvisioningError('Provisioning token exhausted');
    }

    if (new Date() > token.expiresAt) {
      throw new ProvisioningError('Provisioning token expired');
    }

    // Verify device attestation if provided
    if (request.attestation) {
      await this.verifyDeviceAttestation(request.attestation);
    }

    // Generate device certificate
    const certificate = await this.certificateService.generateCertificate({
      deviceId: request.deviceId,
      deviceType: token.deviceType,
      commonName: request.deviceId,
      validityDays: 365,
      keyType: KeyType.EC_P256
    });

    // Register device
    const device = await this.deviceRegistry.registerDevice({
      id: request.deviceId,
      name: request.deviceName || request.deviceId,
      type: token.deviceType,
      model: request.model,
      manufacturer: request.manufacturer,
      serialNumber: request.serialNumber,
      firmwareVersion: request.firmwareVersion,
      hardwareVersion: request.hardwareVersion,
      capabilities: request.capabilities || [],
      tags: request.tags || {},
      metadata: request.metadata || {},
      groupIds: token.groupIds
    });

    // Attach policies
    for (const policyId of token.policies || []) {
      await this.accessControlService.attachPolicy(device.id, policyId);
    }

    // Update token usage
    token.usedCount++;

    return {
      device,
      certificate,
      endpoint: this.getDeviceEndpoint(),
      mqttTopics: this.getDeviceTopics(device.id)
    };
  }

  private async verifyDeviceAttestation(attestation: DeviceAttestation): Promise<void> {
    // Verify TPM attestation or secure element attestation
    switch (attestation.type) {
      case 'tpm':
        await this.verifyTPMAttestation(attestation);
        break;
      case 'secure_element':
        await this.verifySecureElementAttestation(attestation);
        break;
      case 'arm_psa':
        await this.verifyPSAAttestation(attestation);
        break;
      default:
        throw new ProvisioningError(`Unknown attestation type: ${attestation.type}`);
    }
  }

  private generateSecureToken(): string {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  }
}
```

### Anomaly Detection Engine

```typescript
class IoTAnomalyDetectionEngine implements SecurityMonitoringService {
  private behaviorModels: Map<string, DeviceBehaviorModel>;
  private alertStore: AlertStore;
  private mlEngine: MLEngine;

  async detectAnomalies(deviceId: string): Promise<SecurityAnomaly[]> {
    const anomalies: SecurityAnomaly[] = [];
    const model = await this.getOrCreateBehaviorModel(deviceId);
    const recentActivity = await this.getRecentActivity(deviceId);

    // Traffic pattern analysis
    const trafficAnomaly = await this.analyzeTrafficPatterns(model, recentActivity);
    if (trafficAnomaly) anomalies.push(trafficAnomaly);

    // Authentication behavior analysis
    const authAnomaly = await this.analyzeAuthenticationBehavior(model, recentActivity);
    if (authAnomaly) anomalies.push(authAnomaly);

    // Communication pattern analysis
    const commAnomaly = await this.analyzeCommunicationPatterns(model, recentActivity);
    if (commAnomaly) anomalies.push(commAnomaly);

    // Data exfiltration detection
    const dataAnomaly = await this.detectDataExfiltration(model, recentActivity);
    if (dataAnomaly) anomalies.push(dataAnomaly);

    // Update behavior model with new data
    await this.updateBehaviorModel(model, recentActivity);

    return anomalies;
  }

  private async analyzeTrafficPatterns(
    model: DeviceBehaviorModel,
    activity: DeviceActivity
  ): Promise<SecurityAnomaly | null> {
    const currentVolume = activity.dataVolume;
    const expectedVolume = model.expectedDataVolume;
    const stdDev = model.dataVolumeStdDev;

    // Z-score based anomaly detection
    const zScore = Math.abs(currentVolume - expectedVolume) / stdDev;

    if (zScore > 3) {
      return {
        id: crypto.randomUUID(),
        deviceId: model.deviceId,
        type: AnomalyType.UNUSUAL_TRAFFIC,
        severity: zScore > 5 ? Severity.HIGH : Severity.MEDIUM,
        description: `Unusual traffic volume detected: ${currentVolume} bytes (expected: ${expectedVolume} ± ${stdDev})`,
        detectedAt: new Date(),
        indicators: [
          { name: 'data_volume', value: currentVolume, expected: expectedVolume },
          { name: 'z_score', value: zScore, threshold: 3 }
        ],
        recommendedActions: [
          'Review device logs for unusual activity',
          'Check for firmware tampering',
          'Verify device configuration'
        ]
      };
    }

    return null;
  }

  private async detectDataExfiltration(
    model: DeviceBehaviorModel,
    activity: DeviceActivity
  ): Promise<SecurityAnomaly | null> {
    // Check for unusual outbound data patterns
    const outboundRatio = activity.outboundBytes / (activity.inboundBytes + 1);
    const expectedRatio = model.expectedOutboundRatio;

    // Check for connections to unusual destinations
    const unusualDestinations = activity.destinations.filter(
      dest => !model.knownDestinations.includes(dest)
    );

    if (outboundRatio > expectedRatio * 2 || unusualDestinations.length > 0) {
      return {
        id: crypto.randomUUID(),
        deviceId: model.deviceId,
        type: AnomalyType.DATA_EXFILTRATION,
        severity: Severity.CRITICAL,
        description: 'Potential data exfiltration detected',
        detectedAt: new Date(),
        indicators: [
          { name: 'outbound_ratio', value: outboundRatio, expected: expectedRatio },
          { name: 'unusual_destinations', value: unusualDestinations.length, threshold: 0 }
        ],
        recommendedActions: [
          'Immediately isolate device from network',
          'Capture network traffic for forensic analysis',
          'Review device access logs',
          'Check for compromised credentials'
        ]
      };
    }

    return null;
  }

  async getDeviceSecurityScore(deviceId: string): Promise<SecurityScore> {
    const categories: SecurityScoreCategory[] = [];

    // Certificate health
    const certScore = await this.evaluateCertificateHealth(deviceId);
    categories.push(certScore);

    // Firmware security
    const firmwareScore = await this.evaluateFirmwareSecurity(deviceId);
    categories.push(firmwareScore);

    // Access control
    const accessScore = await this.evaluateAccessControl(deviceId);
    categories.push(accessScore);

    // Communication security
    const commScore = await this.evaluateCommunicationSecurity(deviceId);
    categories.push(commScore);

    // Behavioral compliance
    const behaviorScore = await this.evaluateBehavioralCompliance(deviceId);
    categories.push(behaviorScore);

    // Calculate weighted overall score
    const overallScore = categories.reduce(
      (sum, cat) => sum + cat.score * cat.weight,
      0
    ) / categories.reduce((sum, cat) => sum + cat.weight, 0);

    return {
      deviceId,
      overallScore,
      categories,
      lastUpdated: new Date(),
      trend: await this.calculateScoreTrend(deviceId, overallScore),
      recommendations: await this.generateRecommendations(categories)
    };
  }
}
```

## Integration Points

### Hardware Security Module Integration

```typescript
class HSMIntegration {
  private hsmClient: HSMClient;

  async generateDeviceKey(deviceId: string, keyType: KeyType): Promise<HSMKeyHandle> {
    const keyLabel = `device-${deviceId}-${Date.now()}`;

    const keyHandle = await this.hsmClient.generateKey({
      mechanism: this.getKeyMechanism(keyType),
      label: keyLabel,
      extractable: false,
      sensitive: true,
      capabilities: ['sign', 'verify']
    });

    return {
      handle: keyHandle,
      label: keyLabel,
      type: keyType,
      createdAt: new Date()
    };
  }

  async signWithHSM(keyHandle: HSMKeyHandle, data: Uint8Array): Promise<Uint8Array> {
    return this.hsmClient.sign({
      key: keyHandle.handle,
      mechanism: this.getSignMechanism(keyHandle.type),
      data
    });
  }

  async verifyWithHSM(keyHandle: HSMKeyHandle, data: Uint8Array, signature: Uint8Array): Promise<boolean> {
    return this.hsmClient.verify({
      key: keyHandle.handle,
      mechanism: this.getSignMechanism(keyHandle.type),
      data,
      signature
    });
  }
}
```

### SIEM Integration

```typescript
class SIEMIntegration {
  private siemClient: SIEMClient;

  async forwardSecurityEvent(event: SecurityEvent): Promise<void> {
    const siemEvent = {
      timestamp: event.timestamp.toISOString(),
      source: 'iot-security',
      sourceType: 'iot:device',
      severity: this.mapSeverity(event.severity),
      category: this.mapEventCategory(event.eventType),
      deviceId: event.deviceId,
      eventType: event.eventType,
      description: event.description,
      metadata: event.metadata,
      raw: JSON.stringify(event)
    };

    await this.siemClient.send(siemEvent);
  }

  async forwardAnomaly(anomaly: SecurityAnomaly): Promise<void> {
    const siemAlert = {
      timestamp: anomaly.detectedAt.toISOString(),
      source: 'iot-anomaly-detection',
      alertType: anomaly.type,
      severity: this.mapSeverity(anomaly.severity),
      deviceId: anomaly.deviceId,
      description: anomaly.description,
      indicators: anomaly.indicators,
      recommendedActions: anomaly.recommendedActions
    };

    await this.siemClient.sendAlert(siemAlert);
  }
}
```

## Security Considerations

### Certificate Management Best Practices

- Use short-lived certificates (1 year or less) for devices
- Implement automated certificate renewal before expiration
- Use hardware-backed key storage when available
- Maintain offline root CA with air-gapped security
- Implement certificate transparency logging

### Secure Communication Best Practices

- Enforce TLS 1.3 or DTLS 1.3 for all communications
- Use certificate pinning for critical devices
- Implement perfect forward secrecy
- Rotate session keys regularly
- Monitor for protocol downgrade attacks

### Access Control Best Practices

- Implement least privilege access for all devices
- Use attribute-based access control for fine-grained permissions
- Regularly audit device permissions
- Implement just-in-time access for maintenance operations
- Log all access decisions for audit trails

## Compliance Guidelines

- NIST SP 800-183 Networks of Things
- IEC 62443 Industrial Automation Security
- ETSI EN 303 645 Consumer IoT Security
- FDA Premarket Cybersecurity Guidance for Medical Devices
- NERC CIP for Critical Infrastructure

## Testing Considerations

### Property-Based Tests

```typescript
describe('IoT Security Properties', () => {
  it('should validate all issued certificates', () => {
    fc.assert(fc.property(
      fc.record({
        deviceId: fc.string({ minLength: 1, maxLength: 64 }),
        keyType: fc.constantFrom(...Object.values(KeyType)),
        validityDays: fc.integer({ min: 1, max: 365 })
      }),
      async (request) => {
        const service = new IoTCertificateAuthority();
        
        const cert = await service.generateCertificate({
          ...request,
          commonName: request.deviceId,
          deviceType: 'sensor'
        });

        const validation = await service.validateCertificate(cert.certificatePem);
        
        expect(validation.valid).toBe(true);
        expect(validation.deviceId).toBe(request.deviceId);
        expect(validation.chainValid).toBe(true);
      }
    ));
  });

  it('should deny access for revoked certificates', () => {
    fc.assert(fc.property(
      fc.constantFrom(...Object.values(RevocationReason)),
      async (reason) => {
        const service = new IoTCertificateAuthority();
        
        const cert = await service.generateCertificate({
          deviceId: 'test-device',
          deviceType: 'sensor',
          commonName: 'test-device',
          validityDays: 365,
          keyType: KeyType.EC_P256
        });

        await service.revokeCertificate(cert.id, reason);

        const validation = await service.validateCertificate(cert.certificatePem);
        
        expect(validation.valid).toBe(false);
        expect(validation.errors.some(e => e.code === 'REVOKED')).toBe(true);
      }
    ));
  });
});
```
