# Fraud Detection Template

## Purpose
Provides comprehensive patterns for real-time fraud monitoring, prevention, risk assessment, and security measures in fintech applications.

## Context
Fraud detection is critical for protecting financial platforms and their users from fraudulent activities. Modern fraud systems combine machine learning, behavioral analysis, and rule-based engines to detect anomalies in real-time. This template addresses the complexity of building multi-layered fraud prevention systems that balance security with user experience while adapting to evolving fraud patterns.

## Instructions
1. Analyze fraud detection requirements and risk tolerance levels
2. Design real-time transaction monitoring and analysis systems
3. Implement machine learning models for anomaly detection
4. Build multi-layered security controls and behavioral analysis
5. Create automated fraud response and prevention mechanisms
6. Add device fingerprinting and geolocation analysis
7. Implement compliance with fraud prevention regulations
8. Build fraud investigation and case management workflows
9. Create fraud analytics and reporting dashboards
10. Add integration with external fraud prevention services

## Examples

### Example 1: Real-time Fraud Detection
```typescript
// ML-powered real-time fraud detection
class RealTimeFraudDetector {
  async analyzeTransaction(transaction: Transaction): Promise<FraudAnalysisResult> {
    const riskContext = await this.buildRiskContext(transaction);
    const [mlScore, ruleScore, behaviorScore] = await Promise.all([
      this.mlModel.predict(riskContext.features),
      this.ruleEngine.evaluate(riskContext.rules),
      this.behaviorAnalyzer.analyze(riskContext.behavior)
    ]);
    
    const aggregatedScore = this.aggregateScores({
      ml: mlScore,
      rules: ruleScore,
      behavior: behaviorScore
    });
    
    return {
      riskScore: aggregatedScore.score,
      riskLevel: this.determineRiskLevel(aggregatedScore.score),
      recommendedAction: this.getRecommendedAction(aggregatedScore),
      explanation: this.explainDecision(aggregatedScore)
    };
  }
}
```

### Example 2: Behavioral Analysis Engine
```typescript
// Advanced behavioral pattern analysis
class BehaviorAnalysisEngine {
  async analyzeBehaviorPattern(userId: string, activity: UserActivity): Promise<BehaviorAnalysis> {
    const historicalPattern = await this.getUserBehaviorProfile(userId);
    const currentPattern = this.extractBehaviorFeatures(activity);
    
    const anomalies = await this.detectAnomalies({
      historical: historicalPattern,
      current: currentPattern,
      timeContext: activity.timestamp
    });
    
    return {
      anomalyScore: anomalies.score,
      deviations: anomalies.deviations,
      riskFactors: anomalies.riskFactors,
      confidence: anomalies.confidence
    };
  }
}
```

### Example 3: Automated Fraud Response
```typescript
// Automated fraud response and mitigation
class FraudResponseSystem {
  async handleFraudAlert(alert: FraudAlert): Promise<ResponseResult> {
    const response = await this.determineResponse(alert);
    
    switch (response.action) {
      case 'BLOCK':
        await this.blockTransaction(alert.transactionId);
        await this.freezeAccount(alert.accountId, 'fraud_suspected');
        break;
      case 'CHALLENGE':
        await this.requestAdditionalAuth(alert.accountId);
        break;
      case 'MONITOR':
        await this.enhanceMonitoring(alert.accountId);
        break;
    }
    
    await this.createFraudCase(alert, response);
    await this.notifyStakeholders(alert, response);
    
    return response;
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| fraudModels | array | ML models for fraud detection | ['ensemble', 'neural_net'] | Yes |
| riskThresholds | object | Risk level thresholds | standard_thresholds | Yes |
| realTimeAnalysis | boolean | Real-time transaction analysis | true | Yes |
| behaviorAnalysis | boolean | User behavior pattern analysis | true | No |
| deviceFingerprinting | boolean | Device identification tracking | true | No |
| geolocationAnalysis | boolean | Location-based risk assessment | true | No |
| automatedResponse | boolean | Automated fraud response | true | No |
| caseManagement | boolean | Fraud investigation workflows | true | No |
| externalIntegrations | array | External fraud services | [] | No |
| complianceReporting | boolean | Regulatory fraud reporting | true | Yes |

## Expected Output
A comprehensive fraud detection and prevention system featuring:
- Real-time transaction monitoring with ML-based risk scoring
- Advanced behavioral analysis with anomaly detection algorithms
- Multi-layered security controls with device and location intelligence
- Automated fraud response with customizable action workflows
- Fraud investigation and case management capabilities
- Compliance reporting for regulatory fraud prevention requirements
- Integration with external fraud prevention services and databases
- Fraud analytics dashboard with real-time monitoring and alerts
- Machine learning model management with continuous improvement
- Customer communication and dispute resolution workflows

## Core Components

### 1. Real-Time Fraud Detection Engine

```typescript
interface FraudDetectionEngine {
  analyzeTransaction(transaction: Transaction): Promise<FraudAnalysisResult>;
  updateRiskProfile(accountId: string, activity: UserActivity): Promise<void>;
  trainModel(trainingData: FraudTrainingData[]): Promise<ModelTrainingResult>;
  evaluateRiskScore(context: RiskContext): Promise<RiskScore>;
  triggerFraudAlert(alert: FraudAlert): Promise<void>;
}

interface FraudAnalysisResult {
  transactionId: string;
  riskScore: number; // 0-1000
  riskLevel: RiskLevel;
  fraudProbability: number; // 0-1
  triggeredRules: FraudRule[];
  recommendedAction: FraudAction;
  confidence: number;
  analysisTimestamp: Date;
}

interface RiskContext {
  transaction: Transaction;
  userProfile: UserRiskProfile;
  deviceFingerprint: DeviceFingerprint;
  sessionData: SessionData;
  historicalBehavior: BehaviorPattern[];
  externalRiskFactors: ExternalRiskFactor[];
}

enum FraudAction {
  ALLOW = 'allow',
  CHALLENGE = 'challenge', // Require additional authentication
  BLOCK = 'block',
  REVIEW = 'review', // Flag for manual review
  MONITOR = 'monitor' // Allow but increase monitoring
}
```

### 2. Machine Learning Risk Scoring

```typescript
interface MLFraudDetector {
  scoreTransaction(features: TransactionFeatures): Promise<MLScore>;
  detectAnomalies(userBehavior: BehaviorData): Promise<AnomalyDetectionResult>;
  updateModel(feedback: FraudFeedback[]): Promise<ModelUpdateResult>;
  explainPrediction(transactionId: string): Promise<PredictionExplanation>;
}

interface TransactionFeatures {
  // Transaction characteristics
  amount: number;
  currency: string;
  transactionType: string;
  merchantCategory?: string;
  
  // Temporal features
  timeOfDay: number;
  dayOfWeek: number;
  timeSinceLastTransaction: number;
  
  // User behavior features
  velocityFeatures: VelocityFeatures;
  locationFeatures: LocationFeatures;
  deviceFeatures: DeviceFeatures;
  
  // Historical features
  userTransactionHistory: HistoricalFeatures;
  merchantHistory: MerchantFeatures;
}

interface VelocityFeatures {
  transactionsLast1Hour: number;
  transactionsLast24Hours: number;
  transactionsLast7Days: number;
  amountLast1Hour: number;
  amountLast24Hours: number;
  uniqueMerchantsLast24Hours: number;
}

interface AnomalyDetectionResult {
  isAnomaly: boolean;
  anomalyScore: number;
  anomalyType: AnomalyType;
  deviationFactors: DeviationFactor[];
  baselineComparison: BaselineComparison;
}

enum AnomalyType {
  SPENDING_PATTERN = 'spending_pattern',
  LOCATION_ANOMALY = 'location_anomaly',
  TIME_ANOMALY = 'time_anomaly',
  VELOCITY_ANOMALY = 'velocity_anomaly',
  MERCHANT_ANOMALY = 'merchant_anomaly'
}
```

### 3. Device and Behavioral Analysis

```typescript
interface DeviceFingerprintingService {
  generateFingerprint(deviceData: DeviceData): Promise<DeviceFingerprint>;
  analyzeDeviceRisk(fingerprint: DeviceFingerprint): Promise<DeviceRiskAssessment>;
  trackDeviceHistory(accountId: string, fingerprint: DeviceFingerprint): Promise<void>;
  detectDeviceAnomalies(accountId: string, currentDevice: DeviceFingerprint): Promise<DeviceAnomalyResult>;
}

interface DeviceFingerprint {
  id: string;
  userAgent: string;
  screenResolution: string;
  timezone: string;
  language: string;
  platform: string;
  plugins: string[];
  fonts: string[];
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  ipAddress: string;
  geolocation?: Coordinates;
}

interface BehavioralAnalyzer {
  analyzeBehaviorPattern(userId: string, activities: UserActivity[]): Promise<BehaviorAnalysis>;
  detectBehaviorChange(userId: string, currentBehavior: BehaviorData): Promise<BehaviorChangeResult>;
  buildUserProfile(userId: string): Promise<UserBehaviorProfile>;
  updateBehaviorBaseline(userId: string, newData: BehaviorData): Promise<void>;
}

interface BehaviorAnalysis {
  typingPattern: TypingPattern;
  navigationPattern: NavigationPattern;
  transactionPattern: TransactionPattern;
  sessionPattern: SessionPattern;
  riskIndicators: BehaviorRiskIndicator[];
}

interface TypingPattern {
  averageTypingSpeed: number;
  keystrokeDynamics: KeystrokeDynamics;
  pausePatterns: PausePattern[];
  errorRate: number;
}
```

### 4. Rule-Based Fraud Detection

```typescript
interface RuleEngine {
  evaluateRules(transaction: Transaction, context: RiskContext): Promise<RuleEvaluationResult>;
  addRule(rule: FraudRule): Promise<void>;
  updateRule(ruleId: string, updates: Partial<FraudRule>): Promise<void>;
  testRule(rule: FraudRule, testData: Transaction[]): Promise<RuleTestResult>;
  optimizeRules(performanceData: RulePerformanceData[]): Promise<RuleOptimizationResult>;
}

interface FraudRule {
  id: string;
  name: string;
  description: string;
  condition: RuleCondition;
  action: FraudAction;
  priority: number;
  isActive: boolean;
  thresholds: RuleThreshold[];
  createdAt: Date;
  lastModified: Date;
}

interface RuleCondition {
  type: ConditionType;
  field: string;
  operator: ComparisonOperator;
  value: any;
  logicalOperator?: LogicalOperator; // For combining conditions
  subConditions?: RuleCondition[];
}

enum ConditionType {
  TRANSACTION_AMOUNT = 'transaction_amount',
  VELOCITY = 'velocity',
  LOCATION = 'location',
  TIME_OF_DAY = 'time_of_day',
  MERCHANT_CATEGORY = 'merchant_category',
  DEVICE_CHANGE = 'device_change',
  BEHAVIORAL_ANOMALY = 'behavioral_anomaly'
}

// Example rules
const HIGH_AMOUNT_RULE: FraudRule = {
  id: 'high_amount_001',
  name: 'High Amount Transaction',
  description: 'Flag transactions above user\'s normal spending pattern',
  condition: {
    type: ConditionType.TRANSACTION_AMOUNT,
    field: 'amount',
    operator: ComparisonOperator.GREATER_THAN,
    value: 'user_average_amount * 5'
  },
  action: FraudAction.CHALLENGE,
  priority: 1,
  isActive: true,
  thresholds: [],
  createdAt: new Date(),
  lastModified: new Date()
};
```

### 5. Fraud Investigation and Case Management

```typescript
interface FraudInvestigationService {
  createInvestigation(alert: FraudAlert): Promise<Investigation>;
  assignInvestigator(investigationId: string, investigatorId: string): Promise<void>;
  updateInvestigationStatus(investigationId: string, status: InvestigationStatus): Promise<void>;
  addEvidence(investigationId: string, evidence: Evidence): Promise<void>;
  generateInvestigationReport(investigationId: string): Promise<InvestigationReport>;
  closeInvestigation(investigationId: string, outcome: InvestigationOutcome): Promise<void>;
}

interface Investigation {
  id: string;
  alertId: string;
  accountId: string;
  transactionId?: string;
  status: InvestigationStatus;
  priority: InvestigationPriority;
  assignedInvestigator?: string;
  createdAt: Date;
  updatedAt: Date;
  evidence: Evidence[];
  notes: InvestigationNote[];
  outcome?: InvestigationOutcome;
}

enum InvestigationStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  PENDING_REVIEW = 'pending_review',
  CLOSED = 'closed',
  ESCALATED = 'escalated'
}

interface Evidence {
  id: string;
  type: EvidenceType;
  description: string;
  data: any;
  collectedAt: Date;
  collectedBy: string;
  relevanceScore: number;
}

enum EvidenceType {
  TRANSACTION_DATA = 'transaction_data',
  DEVICE_FINGERPRINT = 'device_fingerprint',
  IP_GEOLOCATION = 'ip_geolocation',
  BEHAVIORAL_ANALYSIS = 'behavioral_analysis',
  EXTERNAL_DATA = 'external_data',
  USER_COMMUNICATION = 'user_communication'
}
```

### 6. Fraud Prevention Controls

```typescript
interface FraudPreventionService {
  implementControl(control: FraudControl): Promise<ControlImplementationResult>;
  blockAccount(accountId: string, reason: BlockReason): Promise<BlockResult>;
  freezeTransaction(transactionId: string): Promise<FreezeResult>;
  requireAdditionalAuth(accountId: string, authType: AuthType): Promise<AuthRequirementResult>;
  setTransactionLimits(accountId: string, limits: TransactionLimits): Promise<void>;
  whitelistMerchant(accountId: string, merchantId: string): Promise<void>;
}

interface FraudControl {
  type: ControlType;
  scope: ControlScope;
  parameters: ControlParameters;
  duration?: Duration;
  conditions: ControlCondition[];
}

enum ControlType {
  ACCOUNT_BLOCK = 'account_block',
  TRANSACTION_LIMIT = 'transaction_limit',
  ADDITIONAL_AUTH = 'additional_auth',
  MERCHANT_RESTRICTION = 'merchant_restriction',
  LOCATION_RESTRICTION = 'location_restriction',
  TIME_RESTRICTION = 'time_restriction'
}

interface TransactionLimits {
  dailyLimit: Money;
  weeklyLimit: Money;
  monthlyLimit: Money;
  perTransactionLimit: Money;
  velocityLimits: VelocityLimits;
}

interface VelocityLimits {
  maxTransactionsPerHour: number;
  maxTransactionsPerDay: number;
  maxAmountPerHour: Money;
  maxAmountPerDay: Money;
}
```

## Implementation Guidelines

### Real-Time Processing Requirements
- Implement sub-100ms fraud scoring for real-time transactions
- Use in-memory caching for frequently accessed risk data
- Implement asynchronous processing for non-blocking operations
- Use event streaming for real-time data processing
- Implement circuit breakers for external service dependencies

### Machine Learning Model Management
- Implement A/B testing for model deployments
- Use feature stores for consistent feature engineering
- Implement model versioning and rollback capabilities
- Monitor model drift and performance degradation
- Implement automated retraining pipelines

### Data Privacy and Security
- Implement data anonymization for ML training
- Use encryption for sensitive fraud data
- Implement access controls for fraud investigation tools
- Maintain audit trails for all fraud decisions
- Follow GDPR/CCPA requirements for fraud data processing

### Performance Optimization
- Use distributed computing for batch fraud analysis
- Implement data partitioning for large-scale processing
- Use approximate algorithms for real-time scoring
- Implement caching strategies for rule evaluation
- Optimize database queries for fraud pattern detection

## Integration Examples

### Real-Time Fraud Scoring
```typescript
class RealTimeFraudScorer implements FraudDetectionEngine {
  async analyzeTransaction(transaction: Transaction): Promise<FraudAnalysisResult> {
    const startTime = Date.now();
    
    // Parallel execution of different analysis components
    const [
      ruleResult,
      mlScore,
      behaviorAnalysis,
      deviceRisk
    ] = await Promise.all([
      this.ruleEngine.evaluateRules(transaction, await this.buildRiskContext(transaction)),
      this.mlDetector.scoreTransaction(await this.extractFeatures(transaction)),
      this.behaviorAnalyzer.analyzeBehaviorPattern(transaction.accountId, []),
      this.deviceService.analyzeDeviceRisk(transaction.deviceFingerprint)
    ]);
    
    // Combine scores using weighted ensemble
    const combinedScore = this.combineScores({
      ruleScore: ruleResult.riskScore,
      mlScore: mlScore.score,
      behaviorScore: behaviorAnalysis.riskScore,
      deviceScore: deviceRisk.riskScore
    });
    
    const processingTime = Date.now() - startTime;
    
    // Log performance metrics
    await this.metricsService.recordFraudScoringLatency(processingTime);
    
    return {
      transactionId: transaction.id,
      riskScore: combinedScore,
      riskLevel: this.calculateRiskLevel(combinedScore),
      fraudProbability: combinedScore / 1000,
      triggeredRules: ruleResult.triggeredRules,
      recommendedAction: this.determineAction(combinedScore),
      confidence: this.calculateConfidence([ruleResult, mlScore, behaviorAnalysis]),
      analysisTimestamp: new Date()
    };
  }
  
  private combineScores(scores: ScoreComponents): number {
    const weights = {
      rule: 0.3,
      ml: 0.4,
      behavior: 0.2,
      device: 0.1
    };
    
    return (
      scores.ruleScore * weights.rule +
      scores.mlScore * weights.ml +
      scores.behaviorScore * weights.behavior +
      scores.deviceScore * weights.device
    );
  }
}
```

### ML Model Integration
```typescript
class MLFraudModel implements MLFraudDetector {
  async scoreTransaction(features: TransactionFeatures): Promise<MLScore> {
    // Feature preprocessing
    const processedFeatures = await this.preprocessFeatures(features);
    
    // Model inference
    const prediction = await this.model.predict(processedFeatures);
    
    // Post-processing
    const score = this.convertToRiskScore(prediction);
    
    return {
      score,
      confidence: prediction.confidence,
      featureImportance: await this.explainPrediction(processedFeatures),
      modelVersion: this.model.version
    };
  }
  
  async explainPrediction(transactionId: string): Promise<PredictionExplanation> {
    const features = await this.getTransactionFeatures(transactionId);
    const shapValues = await this.model.explainPrediction(features);
    
    return {
      topRiskFactors: this.getTopRiskFactors(shapValues),
      featureContributions: shapValues,
      baselineScore: this.model.baselineScore,
      explanation: this.generateHumanReadableExplanation(shapValues)
    };
  }
}
```

## Configuration Parameters

### Fraud Detection System Configuration
```yaml
# Fraud Detection Service Configuration
fraud_detection:
  scoring_engine:
    ml_model_endpoint: "https://ml-api.company.com/fraud-score"
    rule_engine_enabled: true
    behavioral_analysis_enabled: true
    device_fingerprinting_enabled: true
    real_time_scoring_timeout_ms: 100
  risk_thresholds:
    low_risk_max: 300 # 0-300 out of 1000
    medium_risk_max: 700 # 301-700 out of 1000
    high_risk_max: 900 # 701-900 out of 1000
    critical_risk_min: 901 # 901-1000 out of 1000
  actions:
    auto_approve_threshold: 200
    challenge_threshold: 500
    manual_review_threshold: 700
    auto_decline_threshold: 900
  ml_model:
    model_version: "v2.1.0"
    feature_store_endpoint: "https://features.company.com"
    model_refresh_interval_hours: 24
    training_data_retention_days: 90
```

### Rule Engine Configuration
```typescript
interface FraudRuleConfig {
  ruleEngine: {
    maxRulesPerEvaluation: number;
    ruleEvaluationTimeoutMs: number;
    enableRulePrioritization: boolean;
    enableRuleOptimization: boolean;
  };
  velocityRules: {
    transactionCountWindow: {
      '1h': number;
      '24h': number;
      '7d': number;
    };
    amountWindow: {
      '1h': Money;
      '24h': Money;
      '7d': Money;
    };
  };
  locationRules: {
    enableGeofencing: boolean;
    suspiciousCountries: string[];
    maxDistanceKm: number;
    timeZoneAnomalyThreshold: number;
  };
}
```

### Device Fingerprinting Configuration
```typescript
interface DeviceFingerprintConfig {
  fingerprinting: {
    enableCanvasFingerprinting: boolean;
    enableWebGLFingerprinting: boolean;
    enableAudioFingerprinting: boolean;
    enableFontDetection: boolean;
    enablePluginDetection: boolean;
  };
  deviceRisk: {
    newDeviceRiskScore: number;
    vpnDetectionEnabled: boolean;
    proxyDetectionEnabled: boolean;
    emulatorDetectionEnabled: boolean;
  };
  storage: {
    fingerprintRetentionDays: number;
    deviceHistoryRetentionDays: number;
  };
}
```

## Configuration Examples

### Basic Fraud Detection Setup
```typescript
// Basic configuration for development environment
const fraudConfig = {
  scoringEngine: {
    mlModelEndpoint: process.env.ML_MODEL_ENDPOINT || 'http://localhost:8080/score',
    ruleEngineEnabled: true,
    behavioralAnalysisEnabled: false, // Disabled for dev
    deviceFingerprintingEnabled: true,
    realTimeScoringTimeoutMs: 200 // More lenient for dev
  },
  riskThresholds: {
    lowRiskMax: 300,
    mediumRiskMax: 600, // Lower threshold for testing
    highRiskMax: 800,
    criticalRiskMin: 801
  },
  actions: {
    autoApproveThreshold: 200,
    challengeThreshold: 400, // Lower for testing
    manualReviewThreshold: 600,
    autoDeclineThreshold: 800
  }
};

const fraudDetector = new FraudDetectionEngine(fraudConfig);
```

### Production Configuration
```typescript
// Production configuration with full features enabled
const productionConfig = {
  scoringEngine: {
    mlModelEndpoint: process.env.PROD_ML_MODEL_ENDPOINT!,
    ruleEngineEnabled: true,
    behavioralAnalysisEnabled: true,
    deviceFingerprintingEnabled: true,
    realTimeScoringTimeoutMs: 100 // Strict timeout for production
  },
  riskThresholds: {
    lowRiskMax: 300,
    mediumRiskMax: 700,
    highRiskMax: 900,
    criticalRiskMin: 901
  },
  mlModel: {
    modelVersion: 'v2.1.0',
    featureStoreEndpoint: process.env.FEATURE_STORE_ENDPOINT!,
    modelRefreshIntervalHours: 24,
    trainingDataRetentionDays: 90
  },
  ruleEngine: {
    maxRulesPerEvaluation: 50,
    ruleEvaluationTimeoutMs: 50,
    enableRulePrioritization: true,
    enableRuleOptimization: true
  }
};
```

### High-Security Configuration
```typescript
// Configuration for high-security environments (banking, etc.)
const highSecurityConfig = {
  scoringEngine: {
    mlModelEndpoint: process.env.SECURE_ML_ENDPOINT!,
    ruleEngineEnabled: true,
    behavioralAnalysisEnabled: true,
    deviceFingerprintingEnabled: true,
    realTimeScoringTimeoutMs: 75 // Very strict
  },
  riskThresholds: {
    lowRiskMax: 200, // More conservative thresholds
    mediumRiskMax: 500,
    highRiskMax: 750,
    criticalRiskMin: 751
  },
  actions: {
    autoApproveThreshold: 150, // Very conservative
    challengeThreshold: 300,
    manualReviewThreshold: 500,
    autoDeclineThreshold: 750
  },
  velocityRules: {
    transactionCountWindow: {
      '1h': 5, // Very restrictive
      '24h': 20,
      '7d': 100
    },
    amountWindow: {
      '1h': { amount: 500000, currency: 'USD' }, // $5,000
      '24h': { amount: 2000000, currency: 'USD' }, // $20,000
      '7d': { amount: 10000000, currency: 'USD' } // $100,000
    }
  },
  deviceRisk: {
    newDeviceRiskScore: 600, // High risk for new devices
    vpnDetectionEnabled: true,
    proxyDetectionEnabled: true,
    emulatorDetectionEnabled: true
  }
};
```

### Multi-Region Configuration
```typescript
// Configuration for different regional compliance requirements
const multiRegionConfig = {
  regions: {
    'US': {
      complianceRules: 'us_bsa_aml',
      riskThresholds: {
        lowRiskMax: 300,
        mediumRiskMax: 700,
        highRiskMax: 900,
        criticalRiskMin: 901
      },
      reportingRequirements: {
        sarThreshold: 500000, // $5,000 for SAR reporting
        ctrThreshold: 1000000 // $10,000 for CTR reporting
      }
    },
    'EU': {
      complianceRules: 'eu_aml_directive',
      riskThresholds: {
        lowRiskMax: 250, // More conservative for EU
        mediumRiskMax: 600,
        highRiskMax: 850,
        criticalRiskMin: 851
      },
      gdprCompliance: {
        dataRetentionDays: 2555, // 7 years
        rightToErasure: true,
        consentRequired: true
      }
    }
  },
  globalSettings: {
    encryptionStandard: 'aes_256',
    auditLogging: true,
    realTimeMonitoring: true
  }
};
```

### Machine Learning Model Configuration
```typescript
// Configuration for ML model deployment and management
const mlModelConfig = {
  models: {
    primary: {
      name: 'fraud_detection_v2_1_0',
      endpoint: process.env.PRIMARY_MODEL_ENDPOINT!,
      version: '2.1.0',
      weight: 0.8 // 80% of traffic
    },
    canary: {
      name: 'fraud_detection_v2_2_0',
      endpoint: process.env.CANARY_MODEL_ENDPOINT!,
      version: '2.2.0',
      weight: 0.2 // 20% of traffic for testing
    }
  },
  featureStore: {
    endpoint: process.env.FEATURE_STORE_ENDPOINT!,
    cacheEnabled: true,
    cacheTtlSeconds: 300,
    batchSize: 1000
  },
  monitoring: {
    enableDriftDetection: true,
    driftThreshold: 0.1,
    performanceThreshold: 0.85, // Minimum accuracy
    latencyThresholdMs: 50
  },
  retraining: {
    enabled: true,
    schedule: '0 2 * * 0', // Weekly at 2 AM Sunday
    minTrainingDataSize: 10000,
    validationSplit: 0.2
  }
};
```

## Testing Strategy

### Unit Tests
- Test fraud rule evaluation logic
- Test ML model scoring functions
- Test device fingerprinting accuracy
- Test behavioral analysis algorithms

### Integration Tests
- Test real-time fraud detection pipeline
- Test fraud investigation workflows
- Test fraud prevention controls
- Test external service integrations

### Performance Tests
- Test fraud scoring latency under load
- Test concurrent fraud analysis
- Test ML model inference performance
- Test rule engine scalability

### Security Tests
- Test fraud data encryption
- Test access control mechanisms
- Test audit trail generation
- Test data anonymization

## Monitoring and Analytics

### Key Metrics
- Fraud detection accuracy (precision/recall)
- False positive rate
- Average fraud scoring latency
- Model performance drift
- Investigation resolution time

### Alerts and Notifications
- High-risk transactions requiring immediate attention
- Model performance degradation
- Unusual fraud pattern detection
- System performance issues
- Investigation escalations

This template provides a comprehensive foundation for building sophisticated fraud detection and prevention systems that can adapt to evolving fraud patterns while maintaining high performance and regulatory compliance.