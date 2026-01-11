# Credit Scoring Template

## Purpose
Provides comprehensive patterns for risk assessment, credit evaluation, scoring algorithms, and alternative data analysis in fintech applications.

## Context
Credit scoring is fundamental to lending decisions, enabling financial institutions to assess creditworthiness and manage risk. Modern credit scoring goes beyond traditional bureau data to incorporate alternative data sources and machine learning models. This template addresses the complexity of building fair, accurate, and explainable credit scoring systems that comply with regulatory requirements while expanding access to credit for underserved populations.

## Instructions
1. Analyze credit risk assessment requirements and regulatory compliance
2. Design comprehensive credit scoring models with traditional and alternative data
3. Implement machine learning algorithms for creditworthiness evaluation
4. Build alternative data integration for thin-file and no-file customers
5. Create credit decision automation with explainable AI
6. Add real-time risk monitoring and portfolio management
7. Implement regulatory compliance for fair lending practices
8. Build credit score explanation and improvement recommendations
9. Create A/B testing frameworks for model validation
10. Add integration with credit bureaus and alternative data providers

## Examples

### Example 1: ML-Based Credit Scoring
```typescript
// Advanced credit scoring with alternative data
class MLCreditScorer {
  async calculateCreditScore(applicant: CreditApplicant): Promise<CreditScoreResult> {
    const traditionalData = await this.getCreditBureauData(applicant.ssn);
    const alternativeData = await this.getAlternativeData(applicant);
    
    const features = this.extractFeatures({
      traditional: traditionalData,
      alternative: alternativeData,
      application: applicant
    });
    
    const score = await this.mlModel.predict(features);
    const explanation = await this.explainScore(features, score);
    
    return { score, explanation, confidence: score.confidence };
  }
}
```

### Example 2: Alternative Data Integration
```typescript
// Alternative data sources for credit assessment
class AlternativeDataProcessor {
  async gatherAlternativeData(applicant: CreditApplicant): Promise<AlternativeDataProfile> {
    const [bankingData, utilityData, telecomData, socialData] = await Promise.all([
      this.getBankingBehavior(applicant.bankAccounts),
      this.getUtilityPaymentHistory(applicant.address),
      this.getTelecomPaymentHistory(applicant.phone),
      this.getSocialMediaInsights(applicant.socialProfiles)
    ]);
    
    return this.aggregateAlternativeData({
      banking: bankingData,
      utilities: utilityData,
      telecom: telecomData,
      social: socialData
    });
  }
}
```

### Example 3: Explainable Credit Decisions
```typescript
// Transparent credit decision explanations
class CreditDecisionExplainer {
  async explainCreditDecision(scoreResult: CreditScoreResult): Promise<CreditExplanation> {
    const factors = await this.identifyKeyFactors(scoreResult);
    const improvements = await this.suggestImprovements(scoreResult);
    
    return {
      primaryFactors: factors.positive,
      negativeFactors: factors.negative,
      scoreRange: this.getScoreRange(scoreResult.score),
      improvementSuggestions: improvements,
      fairLendingCompliance: await this.validateFairLending(scoreResult)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| scoringModel | string | Credit scoring algorithm type | 'ml_ensemble' | Yes |
| alternativeData | boolean | Use alternative data sources | true | No |
| creditBureaus | array | Credit bureau integrations | ['experian', 'equifax'] | Yes |
| riskThresholds | object | Risk level thresholds | standard_thresholds | Yes |
| explainableAI | boolean | Provide score explanations | true | Yes |
| fairLendingCompliance | boolean | Fair lending validation | true | Yes |
| realTimeScoring | boolean | Real-time score calculation | true | No |
| modelValidation | boolean | A/B testing and validation | true | No |
| regulatoryReporting | boolean | Compliance reporting | true | Yes |
| portfolioMonitoring | boolean | Portfolio risk monitoring | false | No |

## Expected Output
A comprehensive credit scoring system featuring:
- Advanced ML-based credit scoring with traditional and alternative data sources
- Real-time creditworthiness assessment with explainable AI decisions
- Alternative data integration for thin-file and underbanked populations
- Fair lending compliance with bias detection and mitigation
- Credit decision automation with customizable risk thresholds
- Portfolio risk monitoring with early warning systems
- Regulatory compliance reporting for credit risk management
- Credit score improvement recommendations and financial education
- A/B testing framework for model validation and optimization
- Integration with credit bureaus and alternative data providers

## Core Components

### 1. Traditional Credit Scoring System

```typescript
interface TraditionalCreditScorer {
  calculateFICOScore(creditData: TraditionalCreditData): Promise<FICOScoreResult>;
  calculateVantageScore(creditData: TraditionalCreditData): Promise<VantageScoreResult>;
  calculateCustomScore(creditData: TraditionalCreditData, model: ScoringModel): Promise<CustomScoreResult>;
  explainScore(scoreResult: ScoreResult): Promise<ScoreExplanation>;
  validateScoreModel(model: ScoringModel, testData: TestDataSet): Promise<ModelValidation>;
}

interface TraditionalCreditData {
  personalInfo: PersonalInformation;
  creditReports: CreditReport[];
  paymentHistory: PaymentHistoryData;
  creditUtilization: CreditUtilizationData;
  creditHistory: CreditHistoryData;
  creditMix: CreditMixData;
  newCredit: NewCreditData;
  publicRecords: PublicRecordData;
}

interface PaymentHistoryData {
  totalAccounts: number;
  accountsWithLatePayments: number;
  latePaymentsByDays: LatePaymentBreakdown;
  mostRecentLatePayment?: Date;
  consecutiveOnTimePayments: number;
  paymentHistoryLength: number; // months
}

interface LatePaymentBreakdown {
  thirtyDaysLate: number;
  sixtyDaysLate: number;
  ninetyDaysLate: number;
  oneTwentyPlusDaysLate: number;
}

interface CreditUtilizationData {
  totalCreditLimit: Money;
  totalCurrentBalance: Money;
  overallUtilizationRatio: number;
  perAccountUtilization: AccountUtilization[];
  highestUtilizationRatio: number;
  accountsAtMaxUtilization: number;
}

interface AccountUtilization {
  accountId: string;
  creditLimit: Money;
  currentBalance: Money;
  utilizationRatio: number;
  accountType: CreditAccountType;
}

enum CreditAccountType {
  CREDIT_CARD = 'credit_card',
  REVOLVING_CREDIT = 'revolving_credit',
  INSTALLMENT_LOAN = 'installment_loan',
  MORTGAGE = 'mortgage',
  AUTO_LOAN = 'auto_loan',
  STUDENT_LOAN = 'student_loan'
}
```

### 2. Alternative Credit Scoring System

```typescript
interface AlternativeCreditScorer {
  calculateAlternativeScore(altData: AlternativeDataSet): Promise<AlternativeScoreResult>;
  analyzeBankingBehavior(bankData: BankingData): Promise<BankingBehaviorScore>;
  assessDigitalFootprint(digitalData: DigitalFootprintData): Promise<DigitalFootprintScore>;
  evaluateUtilityPayments(utilityData: UtilityPaymentData): Promise<UtilityPaymentScore>;
  combineTraditionalAndAlternative(traditional: TraditionalScore, alternative: AlternativeScore): Promise<HybridScore>;
}

interface AlternativeDataSet {
  bankingData?: BankingData;
  utilityPayments?: UtilityPaymentData;
  rentPayments?: RentPaymentData;
  telecomPayments?: TelecomPaymentData;
  digitalFootprint?: DigitalFootprintData;
  educationData?: EducationData;
  employmentData?: EmploymentData;
  socialData?: SocialData;
  deviceData?: DeviceData;
}

interface BankingData {
  accountHistory: BankAccountHistory[];
  transactionPatterns: TransactionPattern[];
  balanceHistory: BalanceHistory[];
  overdraftHistory: OverdraftHistory[];
  savingsPattern: SavingsPattern;
  incomeStability: IncomeStabilityMetrics;
}

interface TransactionPattern {
  category: TransactionCategory;
  frequency: TransactionFrequency;
  averageAmount: Money;
  volatility: number;
  trend: TrendDirection;
  seasonality: SeasonalityPattern;
}

enum TransactionCategory {
  INCOME = 'income',
  RENT_MORTGAGE = 'rent_mortgage',
  UTILITIES = 'utilities',
  GROCERIES = 'groceries',
  TRANSPORTATION = 'transportation',
  ENTERTAINMENT = 'entertainment',
  HEALTHCARE = 'healthcare',
  DEBT_PAYMENTS = 'debt_payments',
  SAVINGS = 'savings',
  INVESTMENTS = 'investments'
}

interface IncomeStabilityMetrics {
  incomeVariability: number;
  incomeGrowthRate: number;
  incomeSourceDiversity: number;
  employmentStability: number;
  seasonalityFactor: number;
}

interface DigitalFootprintData {
  onlinePresence: OnlinePresenceData;
  socialMediaActivity: SocialMediaData;
  eCommerceHistory: ECommerceData;
  digitalPaymentHistory: DigitalPaymentData;
  deviceUsagePatterns: DeviceUsageData;
}

interface OnlinePresenceData {
  professionalProfiles: ProfessionalProfile[];
  socialMediaProfiles: SocialMediaProfile[];
  onlineReviews: OnlineReview[];
  digitalIdentityVerification: DigitalIdentityScore;
}
```

### 3. Machine Learning Credit Models

```typescript
interface MLCreditScoringEngine {
  trainModel(trainingData: MLTrainingData): Promise<MLModel>;
  scoreApplicant(applicantData: ApplicantFeatures, model: MLModel): Promise<MLScoreResult>;
  explainPrediction(scoreResult: MLScoreResult): Promise<MLExplanation>;
  validateModel(model: MLModel, validationData: ValidationDataSet): Promise<ModelPerformance>;
  updateModel(model: MLModel, newData: MLTrainingData): Promise<ModelUpdateResult>;
}

interface MLTrainingData {
  features: FeatureSet[];
  labels: CreditOutcome[];
  metadata: TrainingMetadata;
}

interface FeatureSet {
  applicantId: string;
  traditionalFeatures: TraditionalFeatures;
  alternativeFeatures: AlternativeFeatures;
  derivedFeatures: DerivedFeatures;
  timestamp: Date;
}

interface TraditionalFeatures {
  creditScore: number;
  creditHistoryLength: number;
  creditUtilization: number;
  paymentHistory: number;
  creditMix: number;
  newCreditInquiries: number;
  debtToIncomeRatio: number;
  annualIncome: number;
}

interface AlternativeFeatures {
  bankingStability: number;
  incomeVolatility: number;
  savingsRate: number;
  utilityPaymentHistory: number;
  rentPaymentHistory: number;
  digitalFootprintScore: number;
  educationLevel: number;
  employmentStability: number;
}

interface DerivedFeatures {
  riskVelocity: number;
  behaviorConsistency: number;
  financialStressIndicators: number;
  lifestageFactors: number;
  geographicRiskFactors: number;
  seasonalityAdjustments: number;
}

interface CreditOutcome {
  applicantId: string;
  outcome: OutcomeType;
  timeToDefault?: number; // days
  defaultAmount?: Money;
  recoveryRate?: number;
  observationPeriod: number; // days
}

enum OutcomeType {
  GOOD = 'good', // No default within observation period
  BAD = 'bad', // Default within observation period
  INDETERMINATE = 'indeterminate', // Insufficient observation time
  EARLY_PAYOFF = 'early_payoff'
}

interface MLScoreResult {
  score: number; // 0-1000
  probability: number; // 0-1
  riskGrade: RiskGrade;
  confidence: number;
  modelVersion: string;
  featureImportance: FeatureImportance[];
  timestamp: Date;
}

interface FeatureImportance {
  featureName: string;
  importance: number;
  contribution: number;
  category: FeatureCategory;
}

enum FeatureCategory {
  TRADITIONAL_CREDIT = 'traditional_credit',
  ALTERNATIVE_DATA = 'alternative_data',
  BEHAVIORAL = 'behavioral',
  DEMOGRAPHIC = 'demographic',
  DERIVED = 'derived'
}
```

### 4. Risk Assessment and Segmentation

```typescript
interface RiskAssessmentEngine {
  assessCreditRisk(applicantData: ApplicantData): Promise<CreditRiskAssessment>;
  segmentApplicants(applicants: ApplicantData[]): Promise<RiskSegmentation>;
  calculateProbabilityOfDefault(scoreData: ScoreData): Promise<DefaultProbability>;
  estimateLossGivenDefault(applicantData: ApplicantData): Promise<LossEstimate>;
  performStressTesting(portfolio: CreditPortfolio, scenarios: StressScenario[]): Promise<StressTestResult>;
}

interface CreditRiskAssessment {
  applicantId: string;
  overallRiskScore: number;
  riskGrade: RiskGrade;
  probabilityOfDefault: number;
  lossGivenDefault: number;
  expectedLoss: number;
  riskFactors: RiskFactor[];
  mitigatingFactors: MitigatingFactor[];
  riskSegment: RiskSegment;
  recommendedAction: RiskAction;
}

interface RiskFactor {
  factor: string;
  severity: RiskSeverity;
  impact: number;
  category: RiskCategory;
  description: string;
  mitigation?: string;
}

enum RiskSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum RiskCategory {
  CREDIT_HISTORY = 'credit_history',
  INCOME_STABILITY = 'income_stability',
  DEBT_BURDEN = 'debt_burden',
  BEHAVIORAL = 'behavioral',
  EXTERNAL = 'external',
  FRAUD = 'fraud'
}

interface RiskSegmentation {
  segments: RiskSegment[];
  segmentationCriteria: SegmentationCriteria;
  segmentPerformance: SegmentPerformance[];
}

interface RiskSegment {
  segmentId: string;
  name: string;
  description: string;
  criteria: SegmentCriteria[];
  applicantCount: number;
  averageScore: number;
  defaultRate: number;
  profitability: number;
}

interface DefaultProbability {
  probability: number;
  timeHorizon: number; // months
  confidenceInterval: ConfidenceInterval;
  methodology: ProbabilityMethod;
  calibrationDate: Date;
}

enum ProbabilityMethod {
  LOGISTIC_REGRESSION = 'logistic_regression',
  RANDOM_FOREST = 'random_forest',
  GRADIENT_BOOSTING = 'gradient_boosting',
  NEURAL_NETWORK = 'neural_network',
  ENSEMBLE = 'ensemble'
}
```

### 5. Score Explanation and Interpretability

```typescript
interface ScoreExplainabilityService {
  explainScore(scoreResult: ScoreResult): Promise<ScoreExplanation>;
  generateAdverseActionReasons(scoreResult: ScoreResult): Promise<AdverseActionReasons>;
  createScoreFactorReport(scoreResult: ScoreResult): Promise<ScoreFactorReport>;
  compareScores(scoreResults: ScoreResult[]): Promise<ScoreComparison>;
  generateImprovementSuggestions(scoreResult: ScoreResult): Promise<ImprovementSuggestions>;
}

interface ScoreExplanation {
  primaryFactors: ExplanationFactor[];
  secondaryFactors: ExplanationFactor[];
  positiveFactors: ExplanationFactor[];
  negativeFactors: ExplanationFactor[];
  neutralFactors: ExplanationFactor[];
  overallExplanation: string;
  scoreRange: ScoreRange;
  populationComparison: PopulationComparison;
}

interface ExplanationFactor {
  factor: string;
  impact: FactorImpact;
  weight: number;
  value: any;
  explanation: string;
  category: FactorCategory;
  improvementTips?: string[];
}

enum FactorImpact {
  VERY_POSITIVE = 'very_positive',
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  VERY_NEGATIVE = 'very_negative'
}

interface AdverseActionReasons {
  primaryReasons: AdverseActionReason[];
  secondaryReasons: AdverseActionReason[];
  regulatoryCompliance: ComplianceInfo;
  disclosureText: string;
}

interface AdverseActionReason {
  reasonCode: string;
  description: string;
  impact: string;
  category: ReasonCategory;
  regulatoryBasis: string;
}

enum ReasonCategory {
  CREDIT_HISTORY = 'credit_history',
  PAYMENT_HISTORY = 'payment_history',
  CREDIT_UTILIZATION = 'credit_utilization',
  INCOME = 'income',
  DEBT_TO_INCOME = 'debt_to_income',
  EMPLOYMENT = 'employment',
  COLLATERAL = 'collateral'
}

interface ImprovementSuggestions {
  shortTermActions: ImprovementAction[];
  longTermActions: ImprovementAction[];
  estimatedImpact: ImpactEstimate[];
  timeframe: ImprovementTimeframe;
}

interface ImprovementAction {
  action: string;
  description: string;
  difficulty: ActionDifficulty;
  estimatedImpact: number;
  timeToImpact: number; // months
  category: ImprovementCategory;
}

enum ActionDifficulty {
  EASY = 'easy',
  MODERATE = 'moderate',
  DIFFICULT = 'difficult'
}

enum ImprovementCategory {
  PAYMENT_BEHAVIOR = 'payment_behavior',
  CREDIT_UTILIZATION = 'credit_utilization',
  CREDIT_MIX = 'credit_mix',
  INCOME_STABILITY = 'income_stability',
  DEBT_REDUCTION = 'debt_reduction'
}
```

### 6. Model Monitoring and Validation

```typescript
interface ModelMonitoringService {
  monitorModelPerformance(model: ScoringModel): Promise<PerformanceMetrics>;
  detectModelDrift(model: ScoringModel, newData: ValidationData): Promise<DriftDetectionResult>;
  validateModelFairness(model: ScoringModel, testData: FairnessTestData): Promise<FairnessValidation>;
  performBacktesting(model: ScoringModel, historicalData: HistoricalData): Promise<BacktestResult>;
  generateModelReport(model: ScoringModel, period: ReportingPeriod): Promise<ModelReport>;
}

interface PerformanceMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number; // Area Under Curve
  giniCoefficient: number;
  ks: number; // Kolmogorov-Smirnov statistic
  populationStabilityIndex: number;
  characteristicStabilityIndex: number;
}

interface DriftDetectionResult {
  hasDrift: boolean;
  driftMagnitude: number;
  driftedFeatures: DriftedFeature[];
  recommendedAction: DriftAction;
  detectionDate: Date;
}

interface DriftedFeature {
  featureName: string;
  driftScore: number;
  driftType: DriftType;
  originalDistribution: DistributionStats;
  currentDistribution: DistributionStats;
}

enum DriftType {
  COVARIATE_SHIFT = 'covariate_shift',
  PRIOR_PROBABILITY_SHIFT = 'prior_probability_shift',
  CONCEPT_DRIFT = 'concept_drift'
}

enum DriftAction {
  MONITOR = 'monitor',
  RETRAIN = 'retrain',
  RECALIBRATE = 'recalibrate',
  REPLACE = 'replace'
}

interface FairnessValidation {
  overallFairness: FairnessScore;
  protectedGroupAnalysis: ProtectedGroupAnalysis[];
  disparateImpactRatio: number;
  equalizedOddsRatio: number;
  demographicParity: number;
  fairnessViolations: FairnessViolation[];
}

interface ProtectedGroupAnalysis {
  groupName: string;
  groupSize: number;
  averageScore: number;
  approvalRate: number;
  defaultRate: number;
  disparateImpact: number;
}
```

## Implementation Guidelines

### Model Development Best Practices
- Use cross-validation for model training and validation
- Implement feature engineering pipelines
- Use ensemble methods for improved accuracy
- Implement model versioning and rollback capabilities
- Monitor model performance continuously

### Data Quality and Governance
- Implement data validation and cleansing pipelines
- Use data lineage tracking for audit purposes
- Implement data privacy and security controls
- Monitor data quality metrics continuously
- Implement data retention and deletion policies

### Regulatory Compliance
- Ensure fair lending compliance (ECOA, FCRA)
- Implement model explainability for regulatory requirements
- Maintain model documentation and validation records
- Implement adverse action reason code generation
- Follow model risk management guidelines

### Performance Optimization
- Use distributed computing for large-scale scoring
- Implement model caching for real-time scoring
- Optimize feature computation pipelines
- Use approximate algorithms for real-time requirements
- Implement batch scoring for high-volume operations

## Integration Examples

### Real-Time Credit Scoring API
```typescript
class RealTimeCreditScoringService {
  async scoreApplicant(applicantData: ApplicantData): Promise<CreditScoreResult> {
    const startTime = Date.now();
    
    try {
      // Parallel data gathering
      const [
        traditionalData,
        alternativeData,
        fraudCheck
      ] = await Promise.all([
        this.gatherTraditionalCreditData(applicantData),
        this.gatherAlternativeData(applicantData),
        this.performFraudCheck(applicantData)
      ]);
      
      // Feature engineering
      const features = await this.engineerFeatures({
        traditional: traditionalData,
        alternative: alternativeData,
        applicant: applicantData
      });
      
      // Model scoring
      const mlScore = await this.mlScoringEngine.scoreApplicant(features, this.currentModel);
      const traditionalScore = await this.traditionalScorer.calculateScore(traditionalData);
      
      // Ensemble scoring
      const finalScore = await this.combineScores(mlScore, traditionalScore);
      
      // Generate explanation
      const explanation = await this.explainabilityService.explainScore(finalScore);
      
      // Performance monitoring
      const processingTime = Date.now() - startTime;
      await this.metricsService.recordScoringLatency(processingTime);
      
      return {
        ...finalScore,
        explanation,
        processingTime,
        fraudRisk: fraudCheck.riskScore,
        dataQuality: this.assessDataQuality(traditionalData, alternativeData)
      };
      
    } catch (error) {
      // Fallback to traditional scoring if ML fails
      if (error instanceof MLScoringError) {
        return await this.fallbackToTraditionalScoring(applicantData);
      }
      throw error;
    }
  }
  
  private async combineScores(mlScore: MLScoreResult, traditionalScore: TraditionalScoreResult): Promise<CreditScoreResult> {
    // Weighted ensemble based on model confidence and data quality
    const mlWeight = mlScore.confidence * this.mlModelWeight;
    const traditionalWeight = (1 - mlWeight);
    
    const combinedScore = (mlScore.score * mlWeight) + (traditionalScore.score * traditionalWeight);
    
    return {
      score: Math.round(combinedScore),
      riskGrade: this.calculateRiskGrade(combinedScore),
      probability: mlScore.probability,
      confidence: Math.min(mlScore.confidence, traditionalScore.confidence),
      components: {
        mlScore: mlScore.score,
        traditionalScore: traditionalScore.score,
        mlWeight,
        traditionalWeight
      },
      timestamp: new Date()
    };
  }
}
```

### Alternative Data Integration
```typescript
class AlternativeDataProcessor {
  async processAlternativeData(applicantId: string, dataConsents: DataConsent[]): Promise<AlternativeDataSet> {
    const alternativeData: AlternativeDataSet = {};
    
    // Process each consented data source
    for (const consent of dataConsents) {
      try {
        switch (consent.dataType) {
          case 'banking':
            if (consent.provider === 'plaid') {
              alternativeData.bankingData = await this.processPlaidData(consent.accessToken);
            }
            break;
            
          case 'utility':
            alternativeData.utilityPayments = await this.processUtilityData(consent);
            break;
            
          case 'telecom':
            alternativeData.telecomPayments = await this.processTelecomData(consent);
            break;
            
          case 'rent':
            alternativeData.rentPayments = await this.processRentData(consent);
            break;
        }
      } catch (error) {
        // Log error but continue with other data sources
        this.logger.warn(`Failed to process ${consent.dataType} data:`, error);
      }
    }
    
    return alternativeData;
  }
  
  private async processPlaidData(accessToken: string): Promise<BankingData> {
    const [accounts, transactions, balances] = await Promise.all([
      this.plaidClient.getAccounts(accessToken),
      this.plaidClient.getTransactions(accessToken, { count: 500 }),
      this.plaidClient.getBalances(accessToken)
    ]);
    
    // Analyze transaction patterns
    const transactionPatterns = this.analyzeTransactionPatterns(transactions);
    const incomeStability = this.calculateIncomeStability(transactions);
    const savingsPattern = this.analyzeSavingsPattern(transactions, balances);
    
    return {
      accountHistory: this.mapAccountHistory(accounts),
      transactionPatterns,
      balanceHistory: this.mapBalanceHistory(balances),
      overdraftHistory: this.analyzeOverdrafts(transactions),
      savingsPattern,
      incomeStability
    };
  }
  
  private analyzeTransactionPatterns(transactions: PlaidTransaction[]): TransactionPattern[] {
    const patterns: Map<TransactionCategory, TransactionData> = new Map();
    
    // Group transactions by category
    transactions.forEach(transaction => {
      const category = this.categorizeTransaction(transaction);
      const existing = patterns.get(category) || { amounts: [], dates: [] };
      
      existing.amounts.push(Math.abs(transaction.amount));
      existing.dates.push(new Date(transaction.date));
      
      patterns.set(category, existing);
    });
    
    // Calculate patterns for each category
    return Array.from(patterns.entries()).map(([category, data]) => ({
      category,
      frequency: this.calculateFrequency(data.dates),
      averageAmount: { 
        amount: data.amounts.reduce((sum, amt) => sum + amt, 0) / data.amounts.length,
        currency: 'USD'
      },
      volatility: this.calculateVolatility(data.amounts),
      trend: this.calculateTrend(data.amounts, data.dates),
      seasonality: this.detectSeasonality(data.amounts, data.dates)
    }));
  }
}
```

## Testing Strategy

### Unit Tests
- Test scoring algorithm accuracy
- Test feature engineering logic
- Test model explanation generation
- Test data validation rules

### Integration Tests
- Test credit bureau integrations
- Test alternative data provider integrations
- Test model training and deployment pipelines
- Test real-time scoring performance

### Model Validation Tests
- Test model performance on holdout data
- Test model fairness across protected groups
- Test model stability over time
- Test model explainability accuracy

### Performance Tests
- Test high-volume scoring throughput
- Test real-time scoring latency
- Test concurrent scoring requests
- Test model inference performance

## Monitoring and Analytics

### Key Metrics
- Model accuracy and performance metrics
- Scoring latency and throughput
- Data quality scores
- Model drift detection
- Fairness metrics across protected groups

### Alerts and Notifications
- Model performance degradation
- Data quality issues
- Model drift detection
- Fairness violations
- System performance issues

This template provides a comprehensive foundation for building sophisticated credit scoring systems that can handle traditional and alternative data sources while maintaining regulatory compliance, fairness, and high performance.