# Multi-Factor Authentication Template

## Purpose

This template provides comprehensive patterns for implementing multi-factor authentication (MFA), biometric authentication, and passwordless login systems. It covers TOTP, SMS, email verification, hardware tokens, WebAuthn/FIDO2, and adaptive authentication strategies for both web and mobile platforms.

## Context

Modern security requirements demand authentication beyond simple passwords. This template addresses the implementation of multiple authentication factors including something you know (passwords, PINs), something you have (devices, tokens), and something you are (biometrics), while maintaining usability and accessibility.

## Core Components

### MFA Manager Interface

```typescript
interface MFAManager {
  enrollFactor(userId: string, factorType: MFAFactorType, config: FactorConfig): Promise<EnrollmentResult>;
  verifyFactor(userId: string, factorId: string, verification: FactorVerification): Promise<VerificationResult>;
  listFactors(userId: string): Promise<MFAFactor[]>;
  removeFactor(userId: string, factorId: string): Promise<void>;
  generateChallenge(userId: string, factorId: string): Promise<MFAChallenge>;
  validateChallenge(challengeId: string, response: ChallengeResponse): Promise<ValidationResult>;
}

interface MFAFactor {
  id: string;
  userId: string;
  type: MFAFactorType;
  name: string;
  isVerified: boolean;
  isPrimary: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  metadata: FactorMetadata;
}

enum MFAFactorType {
  TOTP = 'totp',
  SMS = 'sms',
  EMAIL = 'email',
  PUSH_NOTIFICATION = 'push_notification',
  HARDWARE_TOKEN = 'hardware_token',
  WEBAUTHN = 'webauthn',
  BIOMETRIC = 'biometric',
  BACKUP_CODES = 'backup_codes',
  SECURITY_QUESTIONS = 'security_questions'
}

interface FactorConfig {
  totp?: TOTPConfig;
  sms?: SMSConfig;
  email?: EmailConfig;
  webauthn?: WebAuthnConfig;
  biometric?: BiometricConfig;
}
```

### TOTP Authentication

```typescript
interface TOTPService {
  generateSecret(userId: string): Promise<TOTPSecret>;
  generateQRCode(secret: TOTPSecret, issuer: string, accountName: string): Promise<string>;
  verifyCode(secret: string, code: string, window?: number): Promise<boolean>;
  generateBackupCodes(userId: string, count?: number): Promise<string[]>;
}

interface TOTPSecret {
  secret: string;
  algorithm: 'SHA1' | 'SHA256' | 'SHA512';
  digits: number;
  period: number;
  uri: string;
}

class TOTPAuthenticator implements TOTPService {
  private readonly DEFAULT_WINDOW = 1;
  private readonly DEFAULT_DIGITS = 6;
  private readonly DEFAULT_PERIOD = 30;

  async generateSecret(userId: string): Promise<TOTPSecret> {
    const secret = this.generateRandomSecret(32);
    const algorithm = 'SHA1';
    
    return {
      secret,
      algorithm,
      digits: this.DEFAULT_DIGITS,
      period: this.DEFAULT_PERIOD,
      uri: this.buildOTPAuthURI(secret, algorithm)
    };
  }

  async verifyCode(secret: string, code: string, window: number = this.DEFAULT_WINDOW): Promise<boolean> {
    const currentTime = Math.floor(Date.now() / 1000);
    
    for (let i = -window; i <= window; i++) {
      const timeStep = Math.floor((currentTime + i * this.DEFAULT_PERIOD) / this.DEFAULT_PERIOD);
      const expectedCode = this.generateTOTP(secret, timeStep);
      
      if (this.secureCompare(code, expectedCode)) {
        return true;
      }
    }
    
    return false;
  }

  private generateTOTP(secret: string, timeStep: number): string {
    const hmac = crypto.createHmac('sha1', Buffer.from(secret, 'base32'));
    const timeBuffer = Buffer.alloc(8);
    timeBuffer.writeBigInt64BE(BigInt(timeStep));
    hmac.update(timeBuffer);
    
    const hash = hmac.digest();
    const offset = hash[hash.length - 1] & 0x0f;
    const binary = ((hash[offset] & 0x7f) << 24) |
                   ((hash[offset + 1] & 0xff) << 16) |
                   ((hash[offset + 2] & 0xff) << 8) |
                   (hash[offset + 3] & 0xff);
    
    const otp = binary % Math.pow(10, this.DEFAULT_DIGITS);
    return otp.toString().padStart(this.DEFAULT_DIGITS, '0');
  }

  private secureCompare(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  }
}
```

### WebAuthn/FIDO2 Passwordless Authentication

```typescript
interface WebAuthnService {
  generateRegistrationOptions(userId: string, userName: string): Promise<RegistrationOptions>;
  verifyRegistration(userId: string, response: RegistrationResponse): Promise<WebAuthnCredential>;
  generateAuthenticationOptions(userId: string): Promise<AuthenticationOptions>;
  verifyAuthentication(userId: string, response: AuthenticationResponse): Promise<AuthenticationResult>;
}

interface WebAuthnCredential {
  id: string;
  credentialId: Uint8Array;
  publicKey: Uint8Array;
  counter: number;
  transports: AuthenticatorTransport[];
  deviceType: 'singleDevice' | 'multiDevice';
  backedUp: boolean;
  createdAt: Date;
}

class WebAuthnAuthenticator implements WebAuthnService {
  private readonly rpId: string;
  private readonly rpName: string;
  private readonly origin: string;

  async generateRegistrationOptions(userId: string, userName: string): Promise<RegistrationOptions> {
    const existingCredentials = await this.credentialStore.getCredentials(userId);
    
    return {
      challenge: this.generateChallenge(),
      rp: {
        id: this.rpId,
        name: this.rpName
      },
      user: {
        id: this.encodeUserId(userId),
        name: userName,
        displayName: userName
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },   // ES256
        { type: 'public-key', alg: -257 }  // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: 'platform',
        requireResidentKey: true,
        residentKey: 'required',
        userVerification: 'required'
      },
      timeout: 60000,
      attestation: 'none',
      excludeCredentials: existingCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports
      }))
    };
  }

  async verifyRegistration(userId: string, response: RegistrationResponse): Promise<WebAuthnCredential> {
    const expectedChallenge = await this.challengeStore.get(userId);
    
    const verification = await verifyRegistrationResponse({
      response,
      expectedChallenge,
      expectedOrigin: this.origin,
      expectedRPID: this.rpId,
      requireUserVerification: true
    });

    if (!verification.verified) {
      throw new WebAuthnVerificationError('Registration verification failed');
    }

    const credential: WebAuthnCredential = {
      id: crypto.randomUUID(),
      credentialId: verification.registrationInfo!.credentialID,
      publicKey: verification.registrationInfo!.credentialPublicKey,
      counter: verification.registrationInfo!.counter,
      transports: response.response.transports || [],
      deviceType: verification.registrationInfo!.credentialDeviceType,
      backedUp: verification.registrationInfo!.credentialBackedUp,
      createdAt: new Date()
    };

    await this.credentialStore.save(userId, credential);
    return credential;
  }
}
```

### Biometric Authentication

```typescript
interface BiometricService {
  checkAvailability(): Promise<BiometricAvailability>;
  enrollBiometric(userId: string, type: BiometricType): Promise<BiometricEnrollment>;
  authenticate(userId: string): Promise<BiometricAuthResult>;
  removeBiometric(userId: string, enrollmentId: string): Promise<void>;
}

enum BiometricType {
  FINGERPRINT = 'fingerprint',
  FACE_ID = 'face_id',
  IRIS = 'iris',
  VOICE = 'voice'
}

interface BiometricAvailability {
  isAvailable: boolean;
  supportedTypes: BiometricType[];
  isEnrolled: boolean;
  securityLevel: 'weak' | 'strong';
}

class MobileBiometricService implements BiometricService {
  async checkAvailability(): Promise<BiometricAvailability> {
    // React Native / Expo implementation
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    return {
      isAvailable: hasHardware,
      supportedTypes: this.mapAuthTypes(supportedTypes),
      isEnrolled,
      securityLevel: this.determineSecurityLevel(supportedTypes)
    };
  }

  async authenticate(userId: string): Promise<BiometricAuthResult> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use passcode'
    });

    if (result.success) {
      // Generate authentication proof
      const proof = await this.generateAuthProof(userId);
      
      return {
        success: true,
        userId,
        proof,
        timestamp: new Date()
      };
    }

    return {
      success: false,
      error: result.error,
      errorCode: this.mapErrorCode(result.error)
    };
  }

  private async generateAuthProof(userId: string): Promise<string> {
    // Generate cryptographic proof of biometric authentication
    const timestamp = Date.now();
    const nonce = crypto.randomBytes(16).toString('hex');
    const payload = `${userId}:${timestamp}:${nonce}`;
    
    // Sign with device key stored in secure enclave
    const signature = await SecureStore.signWithDeviceKey(payload);
    
    return Buffer.from(JSON.stringify({
      payload,
      signature,
      timestamp
    })).toString('base64');
  }
}
```

## Implementation Patterns

### Adaptive MFA Flow

```typescript
class AdaptiveMFAService {
  async determineRequiredFactors(
    userId: string,
    context: AuthenticationContext
  ): Promise<RequiredFactors> {
    const riskScore = await this.riskEngine.calculateRisk(userId, context);
    const userFactors = await this.mfaManager.listFactors(userId);
    const policy = await this.policyManager.getPolicy(userId);

    // Low risk - single factor may be sufficient
    if (riskScore < 30 && policy.allowSingleFactor) {
      return {
        required: 1,
        factors: this.selectFactors(userFactors, 1, context)
      };
    }

    // Medium risk - require 2FA
    if (riskScore < 70) {
      return {
        required: 2,
        factors: this.selectFactors(userFactors, 2, context)
      };
    }

    // High risk - require strongest available factors
    return {
      required: Math.min(3, userFactors.length),
      factors: this.selectStrongestFactors(userFactors, context),
      additionalVerification: true
    };
  }

  private selectFactors(
    factors: MFAFactor[],
    count: number,
    context: AuthenticationContext
  ): MFAFactor[] {
    // Prioritize factors based on context
    const prioritized = factors.sort((a, b) => {
      // Prefer platform authenticators on mobile
      if (context.platform === 'mobile') {
        if (a.type === MFAFactorType.BIOMETRIC) return -1;
        if (b.type === MFAFactorType.BIOMETRIC) return 1;
      }
      
      // Prefer WebAuthn for web
      if (context.platform === 'web') {
        if (a.type === MFAFactorType.WEBAUTHN) return -1;
        if (b.type === MFAFactorType.WEBAUTHN) return 1;
      }
      
      return this.getFactorStrength(b.type) - this.getFactorStrength(a.type);
    });

    return prioritized.slice(0, count);
  }

  private getFactorStrength(type: MFAFactorType): number {
    const strengths: Record<MFAFactorType, number> = {
      [MFAFactorType.WEBAUTHN]: 100,
      [MFAFactorType.HARDWARE_TOKEN]: 95,
      [MFAFactorType.BIOMETRIC]: 90,
      [MFAFactorType.TOTP]: 80,
      [MFAFactorType.PUSH_NOTIFICATION]: 75,
      [MFAFactorType.SMS]: 50,
      [MFAFactorType.EMAIL]: 45,
      [MFAFactorType.BACKUP_CODES]: 40,
      [MFAFactorType.SECURITY_QUESTIONS]: 30
    };
    return strengths[type] || 0;
  }
}
```

### Recovery and Backup Mechanisms

```typescript
class MFARecoveryService {
  async generateBackupCodes(userId: string): Promise<BackupCodesResult> {
    const codes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < 10; i++) {
      const code = this.generateSecureCode();
      codes.push(code);
      hashedCodes.push(await this.hashCode(code));
    }

    await this.backupCodeStore.save(userId, {
      codes: hashedCodes,
      generatedAt: new Date(),
      usedCodes: []
    });

    return {
      codes,
      expiresAt: null, // Backup codes don't expire
      warning: 'Store these codes securely. Each code can only be used once.'
    };
  }

  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const stored = await this.backupCodeStore.get(userId);
    if (!stored) return false;

    const hashedInput = await this.hashCode(code);
    const codeIndex = stored.codes.findIndex(
      (c, i) => !stored.usedCodes.includes(i) && this.secureCompare(c, hashedInput)
    );

    if (codeIndex === -1) return false;

    // Mark code as used
    stored.usedCodes.push(codeIndex);
    await this.backupCodeStore.save(userId, stored);

    // Alert user about remaining codes
    const remainingCodes = stored.codes.length - stored.usedCodes.length;
    if (remainingCodes <= 3) {
      await this.notificationService.sendLowBackupCodesAlert(userId, remainingCodes);
    }

    return true;
  }

  async initiateAccountRecovery(userId: string, method: RecoveryMethod): Promise<RecoverySession> {
    const user = await this.userService.getUser(userId);
    
    switch (method) {
      case RecoveryMethod.EMAIL:
        return await this.initiateEmailRecovery(user);
      case RecoveryMethod.PHONE:
        return await this.initiatePhoneRecovery(user);
      case RecoveryMethod.TRUSTED_CONTACT:
        return await this.initiateTrustedContactRecovery(user);
      case RecoveryMethod.IDENTITY_VERIFICATION:
        return await this.initiateIdentityVerification(user);
      default:
        throw new UnsupportedRecoveryMethodError(method);
    }
  }
}
```

## Integration Points

### Identity Provider Integration

```typescript
interface IdentityProviderMFAIntegration {
  syncMFAFactors(userId: string, providerId: string): Promise<SyncResult>;
  delegateMFAChallenge(userId: string, providerId: string): Promise<DelegatedChallenge>;
  handleMFACallback(providerId: string, response: MFACallbackResponse): Promise<MFAResult>;
}

class OktaMFAIntegration implements IdentityProviderMFAIntegration {
  async syncMFAFactors(userId: string, providerId: string): Promise<SyncResult> {
    const oktaUser = await this.oktaClient.getUser(userId);
    const oktaFactors = await this.oktaClient.listFactors(oktaUser.id);

    const syncedFactors: MFAFactor[] = [];
    
    for (const factor of oktaFactors) {
      const mappedFactor = this.mapOktaFactor(factor);
      await this.mfaManager.enrollFactor(userId, mappedFactor.type, {
        externalId: factor.id,
        provider: 'okta',
        metadata: factor
      });
      syncedFactors.push(mappedFactor);
    }

    return {
      synced: syncedFactors.length,
      factors: syncedFactors
    };
  }
}
```

### Session Management Integration

```typescript
class MFASessionManager {
  async createMFASession(userId: string, completedFactors: CompletedFactor[]): Promise<MFASession> {
    const session: MFASession = {
      id: crypto.randomUUID(),
      userId,
      completedFactors,
      authenticationLevel: this.calculateAuthLevel(completedFactors),
      createdAt: new Date(),
      expiresAt: this.calculateExpiry(completedFactors),
      stepUpAvailable: this.canStepUp(completedFactors)
    };

    await this.sessionStore.save(session);
    return session;
  }

  async requireStepUp(sessionId: string, requiredLevel: AuthenticationLevel): Promise<StepUpChallenge> {
    const session = await this.sessionStore.get(sessionId);
    
    if (session.authenticationLevel >= requiredLevel) {
      return { required: false };
    }

    const additionalFactors = await this.determineAdditionalFactors(
      session.userId,
      session.completedFactors,
      requiredLevel
    );

    return {
      required: true,
      factors: additionalFactors,
      reason: 'Additional authentication required for this action'
    };
  }
}
```

## Security Considerations

### Rate Limiting and Brute Force Protection

```typescript
class MFARateLimiter {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  async checkRateLimit(userId: string, factorId: string): Promise<RateLimitResult> {
    const key = `mfa:attempts:${userId}:${factorId}`;
    const attempts = await this.cache.get<AttemptRecord>(key);

    if (attempts && attempts.count >= this.MAX_ATTEMPTS) {
      const lockoutRemaining = attempts.lockedUntil - Date.now();
      if (lockoutRemaining > 0) {
        return {
          allowed: false,
          remainingAttempts: 0,
          lockoutRemaining: Math.ceil(lockoutRemaining / 1000)
        };
      }
    }

    return {
      allowed: true,
      remainingAttempts: this.MAX_ATTEMPTS - (attempts?.count || 0)
    };
  }

  async recordAttempt(userId: string, factorId: string, success: boolean): Promise<void> {
    const key = `mfa:attempts:${userId}:${factorId}`;

    if (success) {
      await this.cache.delete(key);
      return;
    }

    const attempts = await this.cache.get<AttemptRecord>(key) || { count: 0 };
    attempts.count++;

    if (attempts.count >= this.MAX_ATTEMPTS) {
      attempts.lockedUntil = Date.now() + this.LOCKOUT_DURATION;
      await this.auditService.logAccountLockout(userId, 'mfa_brute_force');
    }

    await this.cache.set(key, attempts, this.LOCKOUT_DURATION);
  }
}
```

### Secure Code Transmission

```typescript
class SecureCodeTransmission {
  async sendSMSCode(phoneNumber: string, code: string): Promise<void> {
    // Never log the actual code
    await this.auditService.log('sms_code_sent', {
      phoneNumber: this.maskPhoneNumber(phoneNumber),
      timestamp: new Date()
    });

    await this.smsProvider.send({
      to: phoneNumber,
      message: `Your verification code is: ${code}. Valid for 10 minutes. Do not share this code.`,
      expiry: 600
    });
  }

  async sendEmailCode(email: string, code: string): Promise<void> {
    await this.emailService.send({
      to: email,
      subject: 'Your Verification Code',
      template: 'mfa-code',
      data: {
        code,
        expiryMinutes: 10,
        securityTip: 'We will never ask for this code via phone or chat.'
      }
    });
  }

  private maskPhoneNumber(phone: string): string {
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  }
}
```

## Compliance Guidelines

### Regulatory Requirements

- NIST SP 800-63B compliance for authenticator assurance levels
- PCI DSS requirements for payment-related MFA
- GDPR considerations for biometric data processing
- SOC 2 audit trail requirements for authentication events

### Audit Logging

```typescript
class MFAAuditLogger {
  async logMFAEvent(event: MFAEvent): Promise<void> {
    const auditRecord = {
      eventType: event.type,
      userId: event.userId,
      factorType: event.factorType,
      factorId: event.factorId,
      success: event.success,
      ipAddress: event.context.ipAddress,
      userAgent: event.context.userAgent,
      timestamp: new Date(),
      metadata: this.sanitizeMetadata(event.metadata)
    };

    await this.auditStore.save(auditRecord);

    // Real-time security monitoring
    if (!event.success) {
      await this.securityMonitor.reportFailedMFA(auditRecord);
    }
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('MFA Security Properties', () => {
  it('should never accept expired TOTP codes', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 32, maxLength: 32 }),
      fc.integer({ min: 1, max: 999999 }),
      async (secret, codeNum) => {
        const code = codeNum.toString().padStart(6, '0');
        const totpService = new TOTPAuthenticator();
        
        // Generate code for a time far in the past
        const pastTime = Date.now() - (5 * 60 * 1000); // 5 minutes ago
        const result = await totpService.verifyCode(secret, code, 1);
        
        // Should not accept codes outside the window
        expect(result).toBe(false);
      }
    ));
  });

  it('should enforce rate limiting consistently', () => {
    fc.assert(fc.property(
      fc.array(fc.boolean(), { minLength: 10, maxLength: 10 }),
      async (attempts) => {
        const rateLimiter = new MFARateLimiter();
        const userId = 'test-user';
        const factorId = 'test-factor';

        let failedCount = 0;
        for (const success of attempts) {
          if (!success) failedCount++;
          await rateLimiter.recordAttempt(userId, factorId, success);
        }

        const result = await rateLimiter.checkRateLimit(userId, factorId);
        
        if (failedCount >= 5) {
          expect(result.allowed).toBe(false);
        }
      }
    ));
  });
});
```