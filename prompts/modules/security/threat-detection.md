# Threat Detection Template

## Purpose

This template provides comprehensive patterns for implementing anomaly detection, fraud prevention, bot detection, and security monitoring. It covers real-time threat analysis, behavioral analytics, security event correlation, and incident response automation for protecting applications from malicious activities.

## Context

Modern applications face sophisticated threats including account takeover, fraud, automated attacks, and data breaches. This template addresses the implementation of multi-layered threat detection systems that can identify and respond to security threats in real-time while minimizing false positives.

## Core Components

### Threat Detection Engine Interface

## Examples

```typescript
interface ThreatDetectionEngine {
  analyzeRequest(request: SecurityRequest): Promise<ThreatAnalysis>;
  analyzeUserBehavior(userId: string, behavior: UserBehavior): Promise<BehaviorAnalysis>;
  detectAnomalies(data: AnomalyInput): Promise<AnomalyDetectionResult>;
  correlateEvents(events: SecurityEvent[]): Promise<CorrelationResult>;
}

interface ThreatAnalysis {
  requestId: string;
  riskScore: number;
  threats: DetectedThreat[];
  recommendations: SecurityRecommendation[];
  shouldBlock: boolean;
  requiresReview: boolean;
}

interface DetectedThreat {
  type: ThreatType;
  severity: ThreatSeverity;
  confidence: number;
  indicators: ThreatIndicator[];
  mitigations: string[];
}

enum ThreatType {
  ACCOUNT_TAKEOVER = 'account_takeover',
  CREDENTIAL_STUFFING = 'credential_stuffing',
  BRUTE_FORCE = 'brute_force',
  BOT_ATTACK = 'bot_attack',
  FRAUD = 'fraud',
  DATA_EXFILTRATION = 'data_exfiltration',
  INJECTION_ATTACK = 'injection_attack',
  PRIVILEGE_ESCALATION = 'privilege_escalation',
  INSIDER_THREAT = 'insider_threat'
}

enum ThreatSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

class ThreatDetectionService implements ThreatDetectionEngine {
  private anomalyDetector: AnomalyDetector;
  private behaviorAnalyzer: BehaviorAnalyzer;
  private ruleEngine: SecurityRuleEngine;
  private mlModel: ThreatMLModel;

  async analyzeRequest(request: SecurityRequest): Promise<ThreatAnalysis> {
    const threats: DetectedThreat[] = [];
    let totalRiskScore = 0;

    // Rule-based detection
    const ruleResults = await this.ruleEngine.evaluate(request);
    threats.push(...ruleResults.threats);
    totalRiskScore += ruleResults.riskScore * 0.3;

    // ML-based detection
    const mlResults = await this.mlModel.predict(request);
    threats.push(...mlResults.threats);
    totalRiskScore += mlResults.riskScore * 0.4;

    // Behavioral analysis
    if (request.userId) {
      const behaviorResults = await this.behaviorAnalyzer.analyze(request.userId, request);
      threats.push(...behaviorResults.threats);
      totalRiskScore += behaviorResults.riskScore * 0.3;
    }

    // Deduplicate and prioritize threats
    const uniqueThreats = this.deduplicateThreats(threats);
    const prioritizedThreats = this.prioritizeThreats(uniqueThreats);

    return {
      requestId: request.id,
      riskScore: Math.min(totalRiskScore, 100),
      threats: prioritizedThreats,
      recommendations: this.generateRecommendations(prioritizedThreats),
      shouldBlock: totalRiskScore > 80 || prioritizedThreats.some(t => t.severity === ThreatSeverity.CRITICAL),
      requiresReview: totalRiskScore > 50 && totalRiskScore <= 80
    };
  }

  async detectAnomalies(data: AnomalyInput): Promise<AnomalyDetectionResult> {
    const anomalies: Anomaly[] = [];

    // Statistical anomaly detection
    const statisticalAnomalies = await this.anomalyDetector.detectStatistical(data);
    anomalies.push(...statisticalAnomalies);

    // Time-series anomaly detection
    const timeSeriesAnomalies = await this.anomalyDetector.detectTimeSeries(data);
    anomalies.push(...timeSeriesAnomalies);

    // Clustering-based anomaly detection
    const clusteringAnomalies = await this.anomalyDetector.detectClustering(data);
    anomalies.push(...clusteringAnomalies);

    return {
      anomalies,
      overallAnomalyScore: this.calculateOverallScore(anomalies),
      timestamp: new Date()
    };
  }
}
```

### Fraud Detection Service

```typescript
interface FraudDetectionService {
  analyzeTransaction(transaction: Transaction): Promise<FraudAnalysis>;
  analyzeAccount(accountId: string): Promise<AccountRiskProfile>;
  reportFraud(transactionId: string, report: FraudReport): Promise<void>;
  updateFraudModel(feedback: FraudFeedback[]): Promise<void>;
}

interface FraudAnalysis {
  transactionId: string;
  fraudScore: number;
  fraudIndicators: FraudIndicator[];
  decision: FraudDecision;
  reviewRequired: boolean;
  explanations: string[];
}

enum FraudDecision {
  APPROVE = 'approve',
  DECLINE = 'decline',
  REVIEW = 'review',
  CHALLENGE = 'challenge'
}

class FraudDetector implements FraudDetectionService {
  private velocityChecker: VelocityChecker;
  private deviceAnalyzer: DeviceAnalyzer;
  private locationAnalyzer: LocationAnalyzer;
  private mlModel: FraudMLModel;

  async analyzeTransaction(transaction: Transaction): Promise<FraudAnalysis> {
    const indicators: FraudIndicator[] = [];
    let fraudScore = 0;

    // Velocity checks
    const velocityResult = await this.velocityChecker.check(transaction);
    if (velocityResult.exceeded) {
      indicators.push({
        type: 'velocity_exceeded',
        severity: 'high',
        details: velocityResult.details
      });
      fraudScore += 30;
    }

    // Device analysis
    const deviceResult = await this.deviceAnalyzer.analyze(transaction.deviceInfo);
    if (deviceResult.isNewDevice) {
      indicators.push({
        type: 'new_device',
        severity: 'medium',
        details: deviceResult.details
      });
      fraudScore += 15;
    }
    if (deviceResult.isSuspicious) {
      indicators.push({
        type: 'suspicious_device',
        severity: 'high',
        details: deviceResult.details
      });
      fraudScore += 25;
    }

    // Location analysis
    const locationResult = await this.locationAnalyzer.analyze(transaction);
    if (locationResult.impossibleTravel) {
      indicators.push({
        type: 'impossible_travel',
        severity: 'critical',
        details: locationResult.details
      });
      fraudScore += 40;
    }

    // ML model prediction
    const mlPrediction = await this.mlModel.predict(transaction);
    fraudScore = (fraudScore + mlPrediction.score) / 2;

    // Determine decision
    const decision = this.determineDecision(fraudScore, indicators);

    return {
      transactionId: transaction.id,
      fraudScore,
      fraudIndicators: indicators,
      decision,
      reviewRequired: decision === FraudDecision.REVIEW,
      explanations: this.generateExplanations(indicators)
    };
  }

  private determineDecision(score: number, indicators: FraudIndicator[]): FraudDecision {
    if (score >= 80 || indicators.some(i => i.severity === 'critical')) {
      return FraudDecision.DECLINE;
    }
    if (score >= 50) {
      return FraudDecision.REVIEW;
    }
    if (score >= 30) {
      return FraudDecision.CHALLENGE;
    }
    return FraudDecision.APPROVE;
  }
}
```

### Bot Detection Service

```typescript
interface BotDetectionService {
  analyzeRequest(request: HttpRequest): Promise<BotAnalysis>;
  challengeBot(sessionId: string): Promise<ChallengeResult>;
  updateBotSignatures(signatures: BotSignature[]): Promise<void>;
}

interface BotAnalysis {
  isBot: boolean;
  botType?: BotType;
  confidence: number;
  signals: BotSignal[];
  recommendation: BotRecommendation;
}

enum BotType {
  SCRAPER = 'scraper',
  CREDENTIAL_STUFFER = 'credential_stuffer',
  SPAM_BOT = 'spam_bot',
  CLICK_FRAUD = 'click_fraud',
  INVENTORY_HOARDING = 'inventory_hoarding',
  GOOD_BOT = 'good_bot' // Search engines, etc.
}

class BotDetector implements BotDetectionService {
  private fingerprintAnalyzer: FingerprintAnalyzer;
  private behaviorAnalyzer: BehaviorAnalyzer;
  private reputationService: IPReputationService;

  async analyzeRequest(request: HttpRequest): Promise<BotAnalysis> {
    const signals: BotSignal[] = [];
    let botScore = 0;

    // Fingerprint analysis
    const fingerprint = await this.fingerprintAnalyzer.analyze(request);
    if (fingerprint.hasAutomationIndicators) {
      signals.push({
        type: 'automation_detected',
        confidence: fingerprint.confidence,
        details: fingerprint.indicators
      });
      botScore += 40;
    }

    // Behavioral analysis
    const behavior = await this.behaviorAnalyzer.analyzeRequestPattern(request);
    if (behavior.isNonHuman) {
      signals.push({
        type: 'non_human_behavior',
        confidence: behavior.confidence,
        details: behavior.patterns
      });
      botScore += 30;
    }

    // IP reputation
    const reputation = await this.reputationService.check(request.ip);
    if (reputation.isKnownBot) {
      signals.push({
        type: 'known_bot_ip',
        confidence: 0.9,
        details: { source: reputation.source }
      });
      botScore += 50;
    }

    // User agent analysis
    const uaAnalysis = this.analyzeUserAgent(request.userAgent);
    if (uaAnalysis.isSuspicious) {
      signals.push({
        type: 'suspicious_user_agent',
        confidence: uaAnalysis.confidence,
        details: uaAnalysis.reasons
      });
      botScore += 20;
    }

    // Check for good bots
    const isGoodBot = await this.checkGoodBot(request);
    if (isGoodBot) {
      return {
        isBot: true,
        botType: BotType.GOOD_BOT,
        confidence: 0.95,
        signals: [{ type: 'verified_good_bot', confidence: 0.95, details: {} }],
        recommendation: 'allow'
      };
    }

    const isBot = botScore >= 50;
    const botType = isBot ? this.classifyBotType(signals) : undefined;

    return {
      isBot,
      botType,
      confidence: Math.min(botScore / 100, 1),
      signals,
      recommendation: this.getRecommendation(botScore, botType)
    };
  }

  async challengeBot(sessionId: string): Promise<ChallengeResult> {
    // Generate CAPTCHA or proof-of-work challenge
    const challenge = await this.generateChallenge();
    
    await this.challengeStore.save(sessionId, {
      challenge,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 300000) // 5 minutes
    });

    return {
      challengeId: challenge.id,
      type: challenge.type,
      data: challenge.data
    };
  }
}
```

## Implementation Patterns

### Security Event Correlation

```typescript
class SecurityEventCorrelator {
  private eventStore: SecurityEventStore;
  private correlationRules: CorrelationRule[];

  async correlateEvents(timeWindow: TimeWindow): Promise<CorrelatedIncident[]> {
    const events = await this.eventStore.getEvents(timeWindow);
    const incidents: CorrelatedIncident[] = [];

    for (const rule of this.correlationRules) {
      const matchingEvents = events.filter(e => rule.matches(e));
      
      if (matchingEvents.length >= rule.threshold) {
        const incident = await this.createIncident(rule, matchingEvents);
        incidents.push(incident);
      }
    }

    return this.deduplicateIncidents(incidents);
  }

  private async createIncident(rule: CorrelationRule, events: SecurityEvent[]): Promise<CorrelatedIncident> {
    return {
      id: crypto.randomUUID(),
      type: rule.incidentType,
      severity: rule.severity,
      events,
      firstEventAt: events[0].timestamp,
      lastEventAt: events[events.length - 1].timestamp,
      affectedEntities: this.extractAffectedEntities(events),
      status: 'open',
      createdAt: new Date()
    };
  }
}

// Example correlation rules
const correlationRules: CorrelationRule[] = [
  {
    id: 'brute_force_detection',
    name: 'Brute Force Attack Detection',
    condition: (event) => event.type === 'failed_login',
    threshold: 5,
    timeWindow: 300000, // 5 minutes
    groupBy: ['sourceIp', 'targetAccount'],
    incidentType: ThreatType.BRUTE_FORCE,
    severity: ThreatSeverity.HIGH
  },
  {
    id: 'credential_stuffing_detection',
    name: 'Credential Stuffing Detection',
    condition: (event) => event.type === 'failed_login',
    threshold: 10,
    timeWindow: 60000, // 1 minute
    groupBy: ['sourceIp'],
    incidentType: ThreatType.CREDENTIAL_STUFFING,
    severity: ThreatSeverity.CRITICAL
  }
];
```

### Incident Response Automation

```typescript
interface IncidentResponseService {
  handleIncident(incident: SecurityIncident): Promise<ResponseResult>;
  escalateIncident(incidentId: string, level: EscalationLevel): Promise<void>;
  resolveIncident(incidentId: string, resolution: Resolution): Promise<void>;
}

class AutomatedIncidentResponder implements IncidentResponseService {
  private responsePlaybooks: Map<ThreatType, ResponsePlaybook>;
  private notificationService: NotificationService;
  private blockingService: BlockingService;

  async handleIncident(incident: SecurityIncident): Promise<ResponseResult> {
    const playbook = this.responsePlaybooks.get(incident.threatType);
    
    if (!playbook) {
      return this.handleUnknownThreat(incident);
    }

    const actions: ResponseAction[] = [];

    // Execute automated responses based on severity
    if (incident.severity === ThreatSeverity.CRITICAL) {
      // Immediate blocking
      await this.blockingService.blockEntity(incident.sourceEntity);
      actions.push({ type: 'block', target: incident.sourceEntity });

      // Alert security team
      await this.notificationService.alertSecurityTeam(incident, 'critical');
      actions.push({ type: 'alert', target: 'security_team' });
    }

    // Execute playbook steps
    for (const step of playbook.steps) {
      const result = await this.executeStep(step, incident);
      actions.push(result);
    }

    return {
      incidentId: incident.id,
      actionsExecuted: actions,
      status: 'handled',
      timestamp: new Date()
    };
  }
}
```

## Configuration

### Threat Detection Configuration

```typescript
interface ThreatDetectionConfig {
  // Detection thresholds
  thresholds: {
    riskScoreBlock: number;
    riskScoreReview: number;
    anomalyScoreAlert: number;
    fraudScoreDecline: number;
  };

  // ML model settings
  mlConfig: {
    modelEndpoint: string;
    confidenceThreshold: number;
    featureSet: string[];
    updateFrequency: string;
  };

  // Rate limiting
  rateLimits: {
    requestsPerMinute: number;
    failedLoginsPerHour: number;
    apiCallsPerSecond: number;
  };

  // Alerting configuration
  alerting: {
    channels: AlertChannel[];
    escalationPolicy: EscalationPolicy;
    quietHours: TimeRange[];
  };
}

const defaultConfig: ThreatDetectionConfig = {
  thresholds: {
    riskScoreBlock: 80,
    riskScoreReview: 50,
    anomalyScoreAlert: 70,
    fraudScoreDecline: 75
  },
  mlConfig: {
    modelEndpoint: '/api/ml/threat-detection',
    confidenceThreshold: 0.85,
    featureSet: ['ip', 'userAgent', 'behavior', 'device', 'location'],
    updateFrequency: 'daily'
  },
  rateLimits: {
    requestsPerMinute: 100,
    failedLoginsPerHour: 10,
    apiCallsPerSecond: 50
  },
  alerting: {
    channels: ['email', 'slack', 'pagerduty'],
    escalationPolicy: {
      levels: [
        { delay: 0, contacts: ['security-team'] },
        { delay: 15, contacts: ['security-lead'] },
        { delay: 30, contacts: ['ciso'] }
      ]
    },
    quietHours: []
  }
};
```

## Integration Points

### SIEM Integration

```typescript
interface SIEMIntegration {
  sendEvent(event: SecurityEvent): Promise<void>;
  queryEvents(query: SIEMQuery): Promise<SecurityEvent[]>;
  createAlert(alert: SIEMAlert): Promise<string>;
}

class SplunkIntegration implements SIEMIntegration {
  private httpClient: HttpClient;
  private hecToken: string;

  async sendEvent(event: SecurityEvent): Promise<void> {
    await this.httpClient.post('/services/collector/event', {
      event: {
        ...event,
        sourcetype: 'threat_detection',
        index: 'security'
      }
    }, {
      headers: { 'Authorization': `Splunk ${this.hecToken}` }
    });
  }
}

class ElasticSIEMIntegration implements SIEMIntegration {
  private client: ElasticsearchClient;

  async sendEvent(event: SecurityEvent): Promise<void> {
    await this.client.index({
      index: 'security-events',
      document: {
        ...event,
        '@timestamp': new Date().toISOString()
      }
    });
  }
}
```

### Identity Provider Integration

```typescript
interface IdentityProviderIntegration {
  getUserRiskProfile(userId: string): Promise<UserRiskProfile>;
  reportSuspiciousActivity(userId: string, activity: SuspiciousActivity): Promise<void>;
  enforceStepUp(userId: string, reason: string): Promise<void>;
}

class OktaIntegration implements IdentityProviderIntegration {
  async getUserRiskProfile(userId: string): Promise<UserRiskProfile> {
    const user = await this.oktaClient.getUser(userId);
    const riskEvents = await this.oktaClient.getUserRiskEvents(userId);
    
    return {
      userId,
      riskLevel: this.calculateRiskLevel(riskEvents),
      lastLogin: user.lastLogin,
      mfaEnabled: user.mfaEnabled,
      recentRiskEvents: riskEvents
    };
  }

  async enforceStepUp(userId: string, reason: string): Promise<void> {
    await this.oktaClient.createSession(userId, {
      requireMfa: true,
      reason
    });
  }
}
```

## Security Considerations

### Data Protection

- Encrypt all security event data at rest and in transit
- Implement data retention policies for security logs
- Anonymize PII in threat detection logs where possible
- Use secure channels for SIEM and alerting integrations

### Access Control

- Restrict access to threat detection dashboards to security personnel
- Implement audit logging for all threat detection configuration changes
- Use service accounts with minimal permissions for integrations
- Rotate API keys and tokens regularly

### False Positive Management

- Implement feedback loops to improve detection accuracy
- Allow security analysts to mark false positives
- Regularly review and tune detection thresholds
- Maintain allowlists for known good entities

## Compliance Guidelines

### Regulatory Requirements

- **PCI DSS**: Implement intrusion detection systems (Requirement 11.4)
- **SOC 2**: Maintain security monitoring and incident response procedures
- **GDPR**: Ensure security event logging complies with data protection requirements
- **HIPAA**: Implement audit controls for healthcare data access

### Audit Requirements

```typescript
interface ThreatDetectionAudit {
  logDetectionEvent(event: DetectionEvent): Promise<void>;
  logConfigurationChange(change: ConfigChange): Promise<void>;
  logIncidentResponse(response: IncidentResponse): Promise<void>;
  generateComplianceReport(period: DateRange): Promise<ComplianceReport>;
}

class AuditLogger implements ThreatDetectionAudit {
  async logDetectionEvent(event: DetectionEvent): Promise<void> {
    await this.auditStore.log({
      type: 'detection',
      timestamp: new Date(),
      event,
      immutable: true
    });
  }

  async generateComplianceReport(period: DateRange): Promise<ComplianceReport> {
    const events = await this.auditStore.query(period);
    
    return {
      period,
      totalDetections: events.filter(e => e.type === 'detection').length,
      incidentsHandled: events.filter(e => e.type === 'incident_response').length,
      configurationChanges: events.filter(e => e.type === 'config_change').length,
      complianceStatus: this.assessCompliance(events)
    };
  }
}
```

## Testing Considerations

### Unit Testing

```typescript
describe('ThreatDetectionService', () => {
  it('should detect brute force attacks', async () => {
    const service = new ThreatDetectionService(mockConfig);
    const request = createMockRequest({ failedAttempts: 10 });
    
    const result = await service.analyzeRequest(request);
    
    expect(result.threats).toContainEqual(
      expect.objectContaining({ type: ThreatType.BRUTE_FORCE })
    );
    expect(result.shouldBlock).toBe(true);
  });

  it('should calculate correct risk scores', async () => {
    const service = new ThreatDetectionService(mockConfig);
    const request = createMockRequest({ riskIndicators: ['new_device', 'unusual_location'] });
    
    const result = await service.analyzeRequest(request);
    
    expect(result.riskScore).toBeGreaterThan(50);
    expect(result.requiresReview).toBe(true);
  });
});
```

### Integration Testing

```typescript
describe('ThreatDetection Integration', () => {
  it('should integrate with SIEM for event logging', async () => {
    const siemMock = createSIEMMock();
    const service = new ThreatDetectionService(config, siemMock);
    
    await service.analyzeRequest(suspiciousRequest);
    
    expect(siemMock.sendEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'threat_detected' })
    );
  });

  it('should trigger incident response for critical threats', async () => {
    const responderMock = createResponderMock();
    const service = new ThreatDetectionService(config, null, responderMock);
    
    await service.analyzeRequest(criticalThreatRequest);
    
    expect(responderMock.handleIncident).toHaveBeenCalled();
  });
});
```

### Load Testing

- Test detection performance under high request volumes
- Verify ML model inference latency meets SLA requirements
- Ensure event correlation handles burst traffic
- Validate alerting system doesn't become overwhelmed
```