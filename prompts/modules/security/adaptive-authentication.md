# Adaptive Authentication Template

## Purpose

This template provides comprehensive patterns for implementing risk-based authentication, contextual authentication decisions, and adaptive security measures. It covers risk scoring engines, behavioral analysis, device fingerprinting, and dynamic authentication requirements based on real-time threat assessment.

## Context

Static authentication policies cannot address the dynamic nature of modern security threats. This template enables intelligent authentication decisions based on user behavior patterns, device trust levels, location analysis, and real-time risk assessment to balance security with user experience.

## Core Components

### Risk Assessment Engine

```typescript
interface RiskAssessmentEngine {
  calculateRisk(context: AuthenticationContext): Promise<RiskAssessment>;
  updateRiskModel(feedback: RiskFeedback): Promise<void>;
  getRiskFactors(userId: string): Promise<RiskFactor[]>;
  setRiskThresholds(thresholds: RiskThresholds): Promise<void>;
}

interface RiskAssessment {
  score: number; // 0-100
  level: RiskLevel;
  factors: RiskFactor[];
  recommendedAction: AuthenticationAction;
  confidence: number;
  timestamp: Date;
}

enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface RiskFactor {
  type: RiskFactorType;
  weight: number;
  score: number;
  details: Record<string, any>;
}

enum RiskFactorType {
  LOCATION = 'location',
  DEVICE = 'device',
  BEHAVIOR = 'behavior',
  TIME = 'time',
  VELOCITY = 'velocity',
  NETWORK = 'network',
  CREDENTIAL = 'credential',
  HISTORY = 'history'
}

interface AuthenticationAction {
  type: 'allow' | 'challenge' | 'step_up' | 'block' | 'review';
  requiredFactors?: MFAFactorType[];
  message?: string;
  expiresIn?: number;
}

class AdaptiveRiskEngine implements RiskAssessmentEngine {
  private riskModel: RiskModel;
  private behaviorAnalyzer: BehaviorAnalyzer;
  private deviceAnalyzer: DeviceAnalyzer;
  private locationAnalyzer: LocationAnalyzer;

  async calculateRisk(context: AuthenticationContext): Promise<RiskAssessment> {
    const factors: RiskFactor[] = [];

    // Analyze each risk dimension
    const [locationRisk, deviceRisk, behaviorRisk, velocityRisk, networkRisk] = await Promise.all([
      this.analyzeLocationRisk(context),
      this.analyzeDeviceRisk(context),
      this.analyzeBehaviorRisk(context),
      this.analyzeVelocityRisk(context),
      this.analyzeNetworkRisk(context)
    ]);

    factors.push(locationRisk, deviceRisk, behaviorRisk, velocityRisk, networkRisk);

    // Calculate weighted score
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const weightedScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0) / totalWeight;

    const level = this.determineRiskLevel(weightedScore);
    const action = this.determineAction(level, factors);

    return {
      score: Math.round(weightedScore),
      level,
      factors,
      recommendedAction: action,
      confidence: this.calculateConfidence(factors),
      timestamp: new Date()
    };
  }

  private async analyzeLocationRisk(context: AuthenticationContext): Promise<RiskFactor> {
    const userLocations = await this.locationAnalyzer.getUserLocations(context.userId);
    const currentLocation = context.location;

    let score = 0;
    const details: Record<string, any> = {};

    // Check if location is known
    const isKnownLocation = userLocations.some(loc => 
      this.locationAnalyzer.isNearby(loc, currentLocation, 50) // 50km radius
    );

    if (!isKnownLocation) {
      score += 30;
      details.newLocation = true;
    }

    // Check for impossible travel
    const lastLogin = await this.getLastLogin(context.userId);
    if (lastLogin && currentLocation) {
      const travelTime = this.calculateTravelTime(lastLogin.location, currentLocation);
      const timeSinceLastLogin = Date.now() - lastLogin.timestamp.getTime();
      
      if (travelTime > timeSinceLastLogin) {
        score += 50;
        details.impossibleTravel = true;
      }
    }

    // Check for high-risk countries
    if (this.isHighRiskCountry(currentLocation?.country)) {
      score += 20;
      details.highRiskCountry = true;
    }

    return {
      type: RiskFactorType.LOCATION,
      weight: 0.25,
      score: Math.min(score, 100),
      details
    };
  }

  private async analyzeDeviceRisk(context: AuthenticationContext): Promise<RiskFactor> {
    const deviceInfo = context.deviceInfo;
    const knownDevices = await this.deviceAnalyzer.getKnownDevices(context.userId);

    let score = 0;
    const details: Record<string, any> = {};

    // Check if device is known
    const isKnownDevice = knownDevices.some(d => 
      this.deviceAnalyzer.matchDevice(d, deviceInfo)
    );

    if (!isKnownDevice) {
      score += 25;
      details.newDevice = true;
    }

    // Check device fingerprint anomalies
    const fingerprintAnalysis = await this.deviceAnalyzer.analyzeFingerprint(deviceInfo);
    if (fingerprintAnalysis.hasAnomalies) {
      score += 30;
      details.fingerprintAnomalies = fingerprintAnalysis.anomalies;
    }

    // Check for emulator/virtual machine
    if (fingerprintAnalysis.isEmulator || fingerprintAnalysis.isVirtualMachine) {
      score += 40;
      details.virtualEnvironment = true;
    }

    // Check browser/app integrity
    if (!fingerprintAnalysis.integrityVerified) {
      score += 20;
      details.integrityFailed = true;
    }

    return {
      type: RiskFactorType.DEVICE,
      weight: 0.20,
      score: Math.min(score, 100),
      details
    };
  }
}
```

### Behavioral Analysis

```typescript
interface BehaviorAnalyzer {
  analyzeLoginPattern(userId: string, context: AuthenticationContext): Promise<BehaviorAnalysis>;
  updateUserProfile(userId: string, event: AuthenticationEvent): Promise<void>;
  detectAnomalies(userId: string, currentBehavior: UserBehavior): Promise<AnomalyReport>;
}

interface BehaviorAnalysis {
  normalityScore: number;
  anomalies: BehaviorAnomaly[];
  patterns: BehaviorPattern[];
  confidence: number;
}

interface BehaviorPattern {
  type: string;
  frequency: number;
  lastOccurrence: Date;
  isTypical: boolean;
}

class UserBehaviorAnalyzer implements BehaviorAnalyzer {
  private mlModel: BehaviorMLModel;
  private profileStore: UserProfileStore;

  async analyzeLoginPattern(userId: string, context: AuthenticationContext): Promise<BehaviorAnalysis> {
    const userProfile = await this.profileStore.getProfile(userId);
    const currentBehavior = this.extractBehavior(context);

    // Compare with historical patterns
    const patterns = this.comparePatterns(userProfile.patterns, currentBehavior);
    
    // Run ML model for anomaly detection
    const mlResult = await this.mlModel.predict({
      userId,
      currentBehavior,
      historicalPatterns: userProfile.patterns
    });

    const anomalies: BehaviorAnomaly[] = [];

    // Check login time pattern
    if (!this.isTypicalLoginTime(userProfile, context.timestamp)) {
      anomalies.push({
        type: 'unusual_time',
        severity: 'medium',
        details: { 
          currentHour: context.timestamp.getHours(),
          typicalHours: userProfile.typicalLoginHours 
        }
      });
    }

    // Check typing pattern (if available)
    if (context.typingPattern) {
      const typingMatch = this.compareTypingPattern(userProfile.typingPattern, context.typingPattern);
      if (typingMatch < 0.7) {
        anomalies.push({
          type: 'typing_pattern_mismatch',
          severity: 'high',
          details: { matchScore: typingMatch }
        });
      }
    }

    // Check navigation pattern
    if (context.navigationPattern) {
      const navMatch = this.compareNavigationPattern(userProfile.navigationPattern, context.navigationPattern);
      if (navMatch < 0.6) {
        anomalies.push({
          type: 'navigation_pattern_mismatch',
          severity: 'medium',
          details: { matchScore: navMatch }
        });
      }
    }

    return {
      normalityScore: mlResult.normalityScore,
      anomalies,
      patterns,
      confidence: mlResult.confidence
    };
  }

  private isTypicalLoginTime(profile: UserProfile, timestamp: Date): boolean {
    const hour = timestamp.getHours();
    const dayOfWeek = timestamp.getDay();

    const typicalPattern = profile.loginTimePatterns.find(p => 
      p.dayOfWeek === dayOfWeek
    );

    if (!typicalPattern) return true; // No pattern established

    return typicalPattern.typicalHours.some(range => 
      hour >= range.start && hour <= range.end
    );
  }
}
```

### Device Fingerprinting

```typescript
interface DeviceFingerprinter {
  generateFingerprint(deviceInfo: DeviceInfo): Promise<DeviceFingerprint>;
  compareFingerprints(fp1: DeviceFingerprint, fp2: DeviceFingerprint): number;
  detectSpoofing(fingerprint: DeviceFingerprint): Promise<SpoofingDetection>;
}

interface DeviceFingerprint {
  id: string;
  components: FingerprintComponent[];
  hash: string;
  confidence: number;
  timestamp: Date;
}

interface FingerprintComponent {
  name: string;
  value: string;
  entropy: number;
  stable: boolean;
}

class AdvancedDeviceFingerprinter implements DeviceFingerprinter {
  async generateFingerprint(deviceInfo: DeviceInfo): Promise<DeviceFingerprint> {
    const components: FingerprintComponent[] = [];

    // Browser/App components
    components.push(
      { name: 'userAgent', value: deviceInfo.userAgent, entropy: 0.8, stable: true },
      { name: 'platform', value: deviceInfo.platform, entropy: 0.3, stable: true },
      { name: 'language', value: deviceInfo.language, entropy: 0.4, stable: true },
      { name: 'timezone', value: deviceInfo.timezone, entropy: 0.5, stable: true },
      { name: 'screenResolution', value: `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}`, entropy: 0.6, stable: true }
    );

    // Canvas fingerprint
    if (deviceInfo.canvasFingerprint) {
      components.push({
        name: 'canvas',
        value: deviceInfo.canvasFingerprint,
        entropy: 0.9,
        stable: true
      });
    }

    // WebGL fingerprint
    if (deviceInfo.webglFingerprint) {
      components.push({
        name: 'webgl',
        value: deviceInfo.webglFingerprint,
        entropy: 0.85,
        stable: true
      });
    }

    // Audio fingerprint
    if (deviceInfo.audioFingerprint) {
      components.push({
        name: 'audio',
        value: deviceInfo.audioFingerprint,
        entropy: 0.75,
        stable: true
      });
    }

    // Font detection
    if (deviceInfo.fonts) {
      components.push({
        name: 'fonts',
        value: this.hashFonts(deviceInfo.fonts),
        entropy: 0.7,
        stable: false
      });
    }

    const hash = await this.computeFingerprintHash(components);

    return {
      id: crypto.randomUUID(),
      components,
      hash,
      confidence: this.calculateConfidence(components),
      timestamp: new Date()
    };
  }

  async detectSpoofing(fingerprint: DeviceFingerprint): Promise<SpoofingDetection> {
    const indicators: SpoofingIndicator[] = [];

    // Check for inconsistencies
    const userAgentAnalysis = this.analyzeUserAgent(fingerprint);
    if (userAgentAnalysis.hasInconsistencies) {
      indicators.push({
        type: 'user_agent_inconsistency',
        confidence: 0.8,
        details: userAgentAnalysis.inconsistencies
      });
    }

    // Check for automation tools
    const automationCheck = await this.checkAutomationTools(fingerprint);
    if (automationCheck.detected) {
      indicators.push({
        type: 'automation_detected',
        confidence: 0.9,
        details: automationCheck.tools
      });
    }

    // Check for privacy tools that might indicate evasion
    const privacyToolsCheck = this.checkPrivacyTools(fingerprint);
    if (privacyToolsCheck.suspicious) {
      indicators.push({
        type: 'privacy_tools_suspicious',
        confidence: 0.5,
        details: privacyToolsCheck.tools
      });
    }

    return {
      isSpoofed: indicators.some(i => i.confidence > 0.7),
      confidence: Math.max(...indicators.map(i => i.confidence), 0),
      indicators
    };
  }
}
```

## Implementation Patterns

### Adaptive Authentication Flow

```typescript
class AdaptiveAuthenticationService {
  private riskEngine: AdaptiveRiskEngine;
  private mfaService: MFAManager;
  private sessionManager: SessionManager;

  async authenticate(credentials: Credentials, context: AuthenticationContext): Promise<AuthenticationResult> {
    // Step 1: Validate primary credentials
    const primaryAuth = await this.validateCredentials(credentials);
    if (!primaryAuth.valid) {
      await this.recordFailedAttempt(context);
      return { success: false, error: 'Invalid credentials' };
    }

    // Step 2: Calculate risk score
    const riskAssessment = await this.riskEngine.calculateRisk({
      ...context,
      userId: primaryAuth.userId
    });

    // Step 3: Determine authentication requirements based on risk
    const authRequirements = this.determineRequirements(riskAssessment);

    // Step 4: Handle based on risk level
    switch (riskAssessment.level) {
      case RiskLevel.LOW:
        return this.handleLowRisk(primaryAuth, context, riskAssessment);
      
      case RiskLevel.MEDIUM:
        return this.handleMediumRisk(primaryAuth, context, riskAssessment, authRequirements);
      
      case RiskLevel.HIGH:
        return this.handleHighRisk(primaryAuth, context, riskAssessment, authRequirements);
      
      case RiskLevel.CRITICAL:
        return this.handleCriticalRisk(primaryAuth, context, riskAssessment);
    }
  }

  private async handleLowRisk(
    primaryAuth: PrimaryAuthResult,
    context: AuthenticationContext,
    riskAssessment: RiskAssessment
  ): Promise<AuthenticationResult> {
    // Low risk - allow with standard session
    const session = await this.sessionManager.createSession({
      userId: primaryAuth.userId,
      riskLevel: RiskLevel.LOW,
      authenticationStrength: 'single_factor',
      context
    });

    await this.recordSuccessfulAuth(primaryAuth.userId, context, riskAssessment);

    return {
      success: true,
      session,
      riskAssessment
    };
  }

  private async handleMediumRisk(
    primaryAuth: PrimaryAuthResult,
    context: AuthenticationContext,
    riskAssessment: RiskAssessment,
    requirements: AuthRequirements
  ): Promise<AuthenticationResult> {
    // Medium risk - require additional factor
    const availableFactors = await this.mfaService.listFactors(primaryAuth.userId);
    
    if (availableFactors.length === 0) {
      // No MFA enrolled - prompt enrollment or use alternative verification
      return {
        success: false,
        requiresAction: 'mfa_enrollment',
        message: 'Please set up two-factor authentication to continue'
      };
    }

    // Select appropriate factor based on context
    const selectedFactor = this.selectOptimalFactor(availableFactors, context);

    return {
      success: false,
      requiresAction: 'mfa_challenge',
      challenge: await this.mfaService.generateChallenge(primaryAuth.userId, selectedFactor.id),
      pendingAuth: {
        userId: primaryAuth.userId,
        expiresAt: new Date(Date.now() + 300000), // 5 minutes
        riskAssessment
      }
    };
  }

  private async handleHighRisk(
    primaryAuth: PrimaryAuthResult,
    context: AuthenticationContext,
    riskAssessment: RiskAssessment,
    requirements: AuthRequirements
  ): Promise<AuthenticationResult> {
    // High risk - require multiple factors and additional verification
    const availableFactors = await this.mfaService.listFactors(primaryAuth.userId);
    
    // Require at least 2 factors for high risk
    const requiredFactorCount = Math.min(2, availableFactors.length);
    
    // Prefer stronger factors
    const strongFactors = availableFactors
      .filter(f => ['webauthn', 'hardware_token', 'biometric'].includes(f.type))
      .slice(0, requiredFactorCount);

    // Send security notification
    await this.notificationService.sendSecurityAlert(primaryAuth.userId, {
      type: 'high_risk_login_attempt',
      riskFactors: riskAssessment.factors,
      context
    });

    return {
      success: false,
      requiresAction: 'multi_factor_challenge',
      challenges: await Promise.all(
        strongFactors.map(f => this.mfaService.generateChallenge(primaryAuth.userId, f.id))
      ),
      pendingAuth: {
        userId: primaryAuth.userId,
        expiresAt: new Date(Date.now() + 180000), // 3 minutes
        riskAssessment,
        requiredFactors: requiredFactorCount
      }
    };
  }

  private async handleCriticalRisk(
    primaryAuth: PrimaryAuthResult,
    context: AuthenticationContext,
    riskAssessment: RiskAssessment
  ): Promise<AuthenticationResult> {
    // Critical risk - block and require manual review
    await this.securityService.createIncident({
      type: 'critical_risk_login',
      userId: primaryAuth.userId,
      riskAssessment,
      context
    });

    await this.notificationService.sendSecurityAlert(primaryAuth.userId, {
      type: 'login_blocked',
      reason: 'Suspicious activity detected',
      riskFactors: riskAssessment.factors
    });

    // Optionally lock account temporarily
    if (riskAssessment.score > 95) {
      await this.accountService.temporaryLock(primaryAuth.userId, {
        reason: 'critical_risk_detected',
        duration: 3600000, // 1 hour
        requiresManualUnlock: true
      });
    }

    return {
      success: false,
      blocked: true,
      message: 'Login blocked due to suspicious activity. Please contact support.',
      incidentId: await this.securityService.getLatestIncidentId(primaryAuth.userId)
    };
  }
}
```

### Continuous Authentication

```typescript
class ContinuousAuthenticationService {
  private sessionMonitor: SessionMonitor;
  private behaviorAnalyzer: BehaviorAnalyzer;

  async monitorSession(sessionId: string): Promise<void> {
    const session = await this.sessionManager.getSession(sessionId);
    
    // Set up continuous monitoring
    this.sessionMonitor.startMonitoring(sessionId, {
      checkInterval: 30000, // 30 seconds
      onBehaviorChange: async (change) => {
        await this.handleBehaviorChange(session, change);
      },
      onRiskIncrease: async (newRisk) => {
        await this.handleRiskIncrease(session, newRisk);
      }
    });
  }

  private async handleBehaviorChange(session: Session, change: BehaviorChange): Promise<void> {
    const riskDelta = this.calculateRiskDelta(change);

    if (riskDelta > 20) {
      // Significant behavior change - require re-authentication
      await this.sessionManager.requireReauth(session.id, {
        reason: 'behavior_change',
        details: change
      });
    } else if (riskDelta > 10) {
      // Moderate change - increase monitoring
      await this.sessionMonitor.increaseMonitoring(session.id);
    }
  }

  private async handleRiskIncrease(session: Session, newRisk: RiskAssessment): Promise<void> {
    const currentAuthStrength = session.authenticationStrength;
    const requiredStrength = this.getRequiredStrength(newRisk.level);

    if (requiredStrength > currentAuthStrength) {
      // Step-up authentication required
      await this.sessionManager.requireStepUp(session.id, {
        currentStrength: currentAuthStrength,
        requiredStrength,
        riskAssessment: newRisk
      });
    }
  }
}

class SessionMonitor {
  private activeMonitors: Map<string, MonitoringContext> = new Map();

  startMonitoring(sessionId: string, config: MonitoringConfig): void {
    const context: MonitoringContext = {
      sessionId,
      config,
      lastCheck: new Date(),
      behaviorBaseline: null,
      intervalId: setInterval(async () => {
        await this.performCheck(sessionId);
      }, config.checkInterval)
    };

    this.activeMonitors.set(sessionId, context);
  }

  private async performCheck(sessionId: string): Promise<void> {
    const context = this.activeMonitors.get(sessionId);
    if (!context) return;

    const session = await this.sessionManager.getSession(sessionId);
    if (!session || session.expired) {
      this.stopMonitoring(sessionId);
      return;
    }

    // Collect current behavior signals
    const currentBehavior = await this.collectBehaviorSignals(session);

    // Compare with baseline
    if (context.behaviorBaseline) {
      const deviation = this.calculateDeviation(context.behaviorBaseline, currentBehavior);
      
      if (deviation > context.config.deviationThreshold) {
        await context.config.onBehaviorChange({
          baseline: context.behaviorBaseline,
          current: currentBehavior,
          deviation
        });
      }
    } else {
      // Establish baseline
      context.behaviorBaseline = currentBehavior;
    }

    // Update risk assessment
    const newRisk = await this.riskEngine.calculateRisk({
      userId: session.userId,
      sessionId,
      behavior: currentBehavior
    });

    if (newRisk.score > session.riskScore + 15) {
      await context.config.onRiskIncrease(newRisk);
    }

    context.lastCheck = new Date();
  }
}
```

## Integration Points

### Identity Provider Integration

```typescript
class IdentityProviderRiskIntegration {
  async syncRiskSignals(userId: string, providerId: string): Promise<RiskSignals> {
    const provider = await this.getProvider(providerId);
    
    switch (provider.type) {
      case 'okta':
        return await this.syncOktaRiskSignals(userId, provider);
      case 'azure_ad':
        return await this.syncAzureADRiskSignals(userId, provider);
      case 'auth0':
        return await this.syncAuth0RiskSignals(userId, provider);
      default:
        return { signals: [], source: 'none' };
    }
  }

  private async syncOktaRiskSignals(userId: string, provider: Provider): Promise<RiskSignals> {
    const oktaClient = new OktaClient(provider.config);
    
    const [userRisk, sessionRisk, behaviorRisk] = await Promise.all([
      oktaClient.getUserRisk(userId),
      oktaClient.getSessionRisk(userId),
      oktaClient.getBehaviorAnalysis(userId)
    ]);

    return {
      signals: [
        { type: 'user_risk', value: userRisk.level, source: 'okta' },
        { type: 'session_risk', value: sessionRisk.level, source: 'okta' },
        { type: 'behavior_risk', value: behaviorRisk.anomalyScore, source: 'okta' }
      ],
      source: 'okta',
      timestamp: new Date()
    };
  }
}
```

### SIEM Integration

```typescript
class SIEMIntegration {
  async sendAuthenticationEvent(event: AuthenticationEvent): Promise<void> {
    const siemEvent = this.transformToSIEMFormat(event);
    
    await this.siemClient.send({
      eventType: 'authentication',
      timestamp: event.timestamp,
      source: 'adaptive_auth',
      data: siemEvent
    });
  }

  async receiveThreateIntelligence(): Promise<ThreatIntelligence> {
    const threats = await this.siemClient.getActiveThreats();
    
    return {
      blockedIPs: threats.filter(t => t.type === 'ip').map(t => t.value),
      blockedDevices: threats.filter(t => t.type === 'device').map(t => t.value),
      riskIndicators: threats.filter(t => t.type === 'indicator'),
      lastUpdated: new Date()
    };
  }
}
```

## Security Considerations

### Privacy-Preserving Risk Assessment

```typescript
class PrivacyPreservingRiskEngine {
  async calculateRiskWithPrivacy(context: AuthenticationContext): Promise<RiskAssessment> {
    // Use differential privacy for behavioral analysis
    const noisyBehavior = this.addDifferentialPrivacyNoise(context.behavior);
    
    // Minimize data collection
    const minimalContext = this.minimizeContext(context);
    
    // Calculate risk without storing sensitive details
    const risk = await this.riskEngine.calculateRisk(minimalContext);
    
    // Anonymize audit logs
    await this.auditWithAnonymization(context, risk);
    
    return risk;
  }

  private minimizeContext(context: AuthenticationContext): MinimalContext {
    return {
      userId: context.userId,
      locationRegion: this.generalizeLocation(context.location), // Country/region only
      deviceCategory: this.categorizeDevice(context.deviceInfo), // Category, not fingerprint
      timeOfDay: this.categorizeTime(context.timestamp),
      riskSignals: context.riskSignals
    };
  }
}
```

## Compliance Guidelines

- NIST SP 800-63B guidelines for authentication assurance levels
- GDPR requirements for behavioral data processing
- PCI DSS requirements for adaptive authentication in payment systems
- SOC 2 audit requirements for risk-based authentication

## Testing Considerations

### Property-Based Tests

```typescript
describe('Adaptive Authentication Properties', () => {
  it('should always require stronger auth for higher risk', () => {
    fc.assert(fc.property(
      fc.integer({ min: 0, max: 100 }),
      fc.integer({ min: 0, max: 100 }),
      async (risk1, risk2) => {
        const service = new AdaptiveAuthenticationService();
        
        const req1 = await service.determineRequirements({ score: risk1 });
        const req2 = await service.determineRequirements({ score: risk2 });

        if (risk1 > risk2) {
          expect(req1.strength).toBeGreaterThanOrEqual(req2.strength);
        }
      }
    ));
  });

  it('should never allow critical risk without blocking', () => {
    fc.assert(fc.property(
      fc.record({
        userId: fc.string(),
        riskScore: fc.integer({ min: 90, max: 100 })
      }),
      async ({ userId, riskScore }) => {
        const service = new AdaptiveAuthenticationService();
        
        const result = await service.authenticate(
          { username: userId, password: 'test' },
          { riskScore }
        );

        expect(result.blocked || result.requiresAction === 'manual_review').toBe(true);
      }
    ));
  });
});
```