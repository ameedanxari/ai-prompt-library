# Lending Platform Template

## Purpose
Provides comprehensive patterns for loan applications, underwriting workflows, loan management, and lending operations in fintech applications.

## Context
Use this template when building financial applications that require:
- Digital loan origination and application processing
- Automated underwriting and credit decisioning
- Loan servicing and payment management
- Risk assessment and portfolio management
- Regulatory compliance for lending operations

## Core Components

### 1. Loan Application and Origination

```typescript
interface LoanOriginationService {
  createApplication(request: LoanApplicationRequest): Promise<LoanApplication>;
  updateApplication(applicationId: string, updates: ApplicationUpdate): Promise<LoanApplication>;
  submitApplication(applicationId: string): Promise<SubmissionResult>;
  getApplicationStatus(applicationId: string): Promise<ApplicationStatus>;
  withdrawApplication(applicationId: string, reason: string): Promise<WithdrawalResult>;
}

interface LoanApplicationRequest {
  applicantInfo: ApplicantInformation;
  coApplicantInfo?: ApplicantInformation;
  loanDetails: LoanRequest;
  financialInfo: FinancialInformation;
  employmentInfo: EmploymentInformation;
  documents: ApplicationDocument[];
  consentAgreements: ConsentAgreement[];
}

interface ApplicantInformation {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  identificationInfo: IdentificationInfo;
  addressHistory: AddressHistory[];
  creditPermission: CreditPermission;
}

interface LoanRequest {
  loanType: LoanType;
  requestedAmount: Money;
  loanPurpose: LoanPurpose;
  preferredTerm: number; // months
  collateral?: CollateralInfo;
  downPayment?: Money;
}

enum LoanType {
  PERSONAL = 'personal',
  AUTO = 'auto',
  MORTGAGE = 'mortgage',
  BUSINESS = 'business',
  STUDENT = 'student',
  HOME_EQUITY = 'home_equity',
  PAYDAY = 'payday',
  INSTALLMENT = 'installment'
}

enum LoanPurpose {
  DEBT_CONSOLIDATION = 'debt_consolidation',
  HOME_IMPROVEMENT = 'home_improvement',
  VEHICLE_PURCHASE = 'vehicle_purchase',
  EDUCATION = 'education',
  MEDICAL_EXPENSES = 'medical_expenses',
  BUSINESS_EXPANSION = 'business_expansion',
  WORKING_CAPITAL = 'working_capital',
  OTHER = 'other'
}

interface FinancialInformation {
  annualIncome: Money;
  monthlyIncome: Money;
  otherIncome?: IncomeSource[];
  monthlyExpenses: MonthlyExpenses;
  assets: Asset[];
  liabilities: Liability[];
  bankAccounts: BankAccountInfo[];
}
```

### 2. Automated Underwriting System

```typescript
interface UnderwritingEngine {
  evaluateApplication(applicationId: string): Promise<UnderwritingDecision>;
  calculateCreditScore(applicantId: string): Promise<CreditScoreResult>;
  assessRisk(application: LoanApplication): Promise<RiskAssessment>;
  verifyIncome(incomeInfo: IncomeInformation): Promise<IncomeVerification>;
  validateDocuments(documents: ApplicationDocument[]): Promise<DocumentValidation>;
}

interface UnderwritingDecision {
  applicationId: string;
  decision: LoanDecision;
  approvedAmount?: Money;
  interestRate?: number;
  loanTerm?: number;
  conditions: LoanCondition[];
  decisionFactors: DecisionFactor[];
  riskGrade: RiskGrade;
  timestamp: Date;
  expirationDate: Date;
}

enum LoanDecision {
  APPROVED = 'approved',
  CONDITIONALLY_APPROVED = 'conditionally_approved',
  DECLINED = 'declined',
  PENDING_REVIEW = 'pending_review',
  INCOMPLETE = 'incomplete'
}

interface RiskAssessment {
  overallRiskScore: number; // 0-1000
  riskGrade: RiskGrade;
  riskFactors: RiskFactor[];
  creditScore: number;
  debtToIncomeRatio: number;
  loanToValueRatio?: number;
  probabilityOfDefault: number;
  expectedLoss: number;
}

enum RiskGrade {
  A_PLUS = 'A+',
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
  E = 'E',
  F = 'F'
}

interface DecisionFactor {
  factor: string;
  impact: FactorImpact;
  weight: number;
  description: string;
}

enum FactorImpact {
  POSITIVE = 'positive',
  NEGATIVE = 'negative',
  NEUTRAL = 'neutral'
}

interface LoanCondition {
  type: ConditionType;
  description: string;
  required: boolean;
  dueDate?: Date;
  status: ConditionStatus;
}

enum ConditionType {
  INCOME_VERIFICATION = 'income_verification',
  EMPLOYMENT_VERIFICATION = 'employment_verification',
  ASSET_VERIFICATION = 'asset_verification',
  ADDITIONAL_DOCUMENTATION = 'additional_documentation',
  COLLATERAL_APPRAISAL = 'collateral_appraisal',
  INSURANCE_REQUIREMENT = 'insurance_requirement'
}
```

### 3. Credit Scoring and Risk Models

```typescript
interface CreditScoringService {
  calculateCreditScore(applicant: ApplicantInformation, creditData: CreditData): Promise<CreditScoreResult>;
  getAlternativeScore(applicant: ApplicantInformation, altData: AlternativeData): Promise<AlternativeScoreResult>;
  updateScoreModel(modelData: ScoreModelData): Promise<ModelUpdateResult>;
  validateScoreModel(testData: TestData[]): Promise<ModelValidationResult>;
  explainScore(scoreResult: CreditScoreResult): Promise<ScoreExplanation>;
}

interface CreditData {
  creditReports: CreditReport[];
  paymentHistory: PaymentHistoryItem[];
  creditUtilization: CreditUtilization;
  creditInquiries: CreditInquiry[];
  publicRecords: PublicRecord[];
  creditAge: CreditAge;
}

interface CreditReport {
  bureau: CreditBureau;
  score: number;
  reportDate: Date;
  accounts: CreditAccount[];
  inquiries: CreditInquiry[];
  publicRecords: PublicRecord[];
}

enum CreditBureau {
  EXPERIAN = 'experian',
  EQUIFAX = 'equifax',
  TRANSUNION = 'transunion'
}

interface AlternativeData {
  bankTransactionData?: BankTransactionData;
  utilityPaymentHistory?: UtilityPayment[];
  rentPaymentHistory?: RentPayment[];
  educationData?: EducationData;
  employmentHistory?: EmploymentHistory[];
  socialMediaData?: SocialMediaData;
  deviceData?: DeviceData;
}

interface CreditScoreResult {
  score: number;
  scoreRange: ScoreRange;
  riskCategory: RiskCategory;
  scoreFactors: ScoreFactor[];
  confidenceLevel: number;
  modelVersion: string;
  calculationDate: Date;
}

interface ScoreFactor {
  factor: string;
  impact: number;
  description: string;
  category: FactorCategory;
}

enum FactorCategory {
  PAYMENT_HISTORY = 'payment_history',
  CREDIT_UTILIZATION = 'credit_utilization',
  CREDIT_HISTORY_LENGTH = 'credit_history_length',
  CREDIT_MIX = 'credit_mix',
  NEW_CREDIT = 'new_credit',
  INCOME_STABILITY = 'income_stability',
  DEBT_TO_INCOME = 'debt_to_income'
}
```

### 4. Loan Servicing and Management

```typescript
interface LoanServicingService {
  createLoan(loanDetails: LoanCreationRequest): Promise<Loan>;
  processPayment(loanId: string, payment: PaymentRequest): Promise<PaymentResult>;
  generatePaymentSchedule(loanId: string): Promise<PaymentSchedule>;
  handleMissedPayment(loanId: string, missedPayment: MissedPayment): Promise<DelinquencyAction>;
  modifyLoan(loanId: string, modification: LoanModification): Promise<ModificationResult>;
}

interface Loan {
  id: string;
  applicationId: string;
  borrowerId: string;
  loanType: LoanType;
  principalAmount: Money;
  currentBalance: Money;
  interestRate: number;
  termMonths: number;
  monthlyPayment: Money;
  paymentSchedule: PaymentSchedule;
  status: LoanStatus;
  originationDate: Date;
  maturityDate: Date;
  lastPaymentDate?: Date;
  nextPaymentDate: Date;
  delinquencyStatus?: DelinquencyStatus;
}

enum LoanStatus {
  ACTIVE = 'active',
  PAID_OFF = 'paid_off',
  DELINQUENT = 'delinquent',
  DEFAULT = 'default',
  CHARGED_OFF = 'charged_off',
  MODIFIED = 'modified',
  REFINANCED = 'refinanced'
}

interface PaymentSchedule {
  loanId: string;
  payments: ScheduledPayment[];
  totalInterest: Money;
  totalPayments: Money;
}

interface ScheduledPayment {
  paymentNumber: number;
  dueDate: Date;
  principalAmount: Money;
  interestAmount: Money;
  totalAmount: Money;
  remainingBalance: Money;
  status: PaymentStatus;
}

enum PaymentStatus {
  SCHEDULED = 'scheduled',
  PAID = 'paid',
  PARTIAL = 'partial',
  LATE = 'late',
  MISSED = 'missed'
}

interface PaymentRequest {
  amount: Money;
  paymentMethod: PaymentMethod;
  paymentDate: Date;
  paymentType: PaymentType;
  reference?: string;
}

enum PaymentType {
  REGULAR = 'regular',
  EXTRA_PRINCIPAL = 'extra_principal',
  PAYOFF = 'payoff',
  LATE_FEE = 'late_fee'
}
```

### 5. Collections and Delinquency Management

```typescript
interface CollectionsService {
  identifyDelinquentLoans(): Promise<DelinquentLoan[]>;
  createCollectionCase(loanId: string): Promise<CollectionCase>;
  executeCollectionStrategy(caseId: string, strategy: CollectionStrategy): Promise<CollectionResult>;
  negotiatePaymentPlan(caseId: string, proposal: PaymentPlanProposal): Promise<PaymentPlan>;
  reportToAgencies(delinquencies: Delinquency[]): Promise<ReportingResult>;
}

interface DelinquentLoan {
  loanId: string;
  borrowerId: string;
  currentBalance: Money;
  pastDueAmount: Money;
  daysPastDue: number;
  delinquencyStage: DelinquencyStage;
  lastContactDate?: Date;
  collectionActions: CollectionAction[];
}

enum DelinquencyStage {
  EARLY_DELINQUENCY = 'early_delinquency', // 1-30 days
  MODERATE_DELINQUENCY = 'moderate_delinquency', // 31-60 days
  SEVERE_DELINQUENCY = 'severe_delinquency', // 61-90 days
  DEFAULT = 'default', // 90+ days
  CHARGE_OFF = 'charge_off' // 120+ days
}

interface CollectionStrategy {
  stage: DelinquencyStage;
  actions: CollectionActionPlan[];
  timeline: CollectionTimeline;
  escalationRules: EscalationRule[];
}

interface CollectionActionPlan {
  actionType: CollectionActionType;
  timing: ActionTiming;
  channel: CommunicationChannel;
  template: string;
  priority: Priority;
}

enum CollectionActionType {
  REMINDER_NOTICE = 'reminder_notice',
  PHONE_CALL = 'phone_call',
  EMAIL_NOTICE = 'email_notice',
  SMS_REMINDER = 'sms_reminder',
  DEMAND_LETTER = 'demand_letter',
  SETTLEMENT_OFFER = 'settlement_offer',
  LEGAL_ACTION = 'legal_action'
}

interface PaymentPlan {
  loanId: string;
  planType: PaymentPlanType;
  modifiedPayments: ModifiedPayment[];
  totalAmount: Money;
  duration: number;
  status: PaymentPlanStatus;
  createdDate: Date;
  approvedDate?: Date;
}

enum PaymentPlanType {
  FORBEARANCE = 'forbearance',
  MODIFICATION = 'modification',
  SETTLEMENT = 'settlement',
  WORKOUT = 'workout'
}
```

### 6. Regulatory Compliance and Reporting

```typescript
interface LendingComplianceService {
  validateLendingCompliance(loan: Loan): Promise<ComplianceValidation>;
  generateRegulatoryReports(period: ReportingPeriod): Promise<RegulatoryReport[]>;
  performFairLendingAnalysis(loans: Loan[]): Promise<FairLendingAnalysis>;
  trackConsentAndDisclosures(applicationId: string): Promise<ConsentTracking>;
  auditLendingPractices(criteria: AuditCriteria): Promise<AuditReport>;
}

interface ComplianceValidation {
  isCompliant: boolean;
  violations: ComplianceViolation[];
  requiredDisclosures: RequiredDisclosure[];
  regulatoryRequirements: RegulatoryRequirement[];
}

interface ComplianceViolation {
  regulation: Regulation;
  violationType: ViolationType;
  description: string;
  severity: ViolationSeverity;
  remediation: string;
}

enum Regulation {
  TILA = 'tila', // Truth in Lending Act
  RESPA = 'respa', // Real Estate Settlement Procedures Act
  FCRA = 'fcra', // Fair Credit Reporting Act
  ECOA = 'ecoa', // Equal Credit Opportunity Act
  FDCPA = 'fdcpa', // Fair Debt Collection Practices Act
  SAFE_ACT = 'safe_act',
  DODD_FRANK = 'dodd_frank',
  STATE_USURY = 'state_usury'
}

interface FairLendingAnalysis {
  analysisDate: Date;
  loansSampled: number;
  disparateImpactAnalysis: DisparateImpactResult;
  disparateTreatmentAnalysis: DisparateTreatmentResult;
  riskFactors: FairLendingRiskFactor[];
  recommendations: string[];
}

interface RequiredDisclosure {
  disclosureType: DisclosureType;
  timing: DisclosureTiming;
  content: string;
  delivered: boolean;
  deliveryDate?: Date;
  acknowledgment?: DisclosureAcknowledgment;
}

enum DisclosureType {
  APR_DISCLOSURE = 'apr_disclosure',
  LOAN_ESTIMATE = 'loan_estimate',
  CLOSING_DISCLOSURE = 'closing_disclosure',
  PRIVACY_NOTICE = 'privacy_notice',
  ADVERSE_ACTION = 'adverse_action',
  RISK_BASED_PRICING = 'risk_based_pricing'
}
```

## Security Considerations

### Data Protection and Privacy
- **Encryption at Rest**: All loan and borrower data must be encrypted using AES-256 encryption
- **Encryption in Transit**: Use TLS 1.3 for all API communications and sensitive data transfers
- **Data Tokenization**: Implement tokenization for sensitive information like SSNs and account numbers
- **Access Controls**: Implement role-based access control with strict segregation of duties
- **Audit Logging**: Maintain comprehensive audit trails for all lending decisions and data access
- **Data Retention**: Implement automated data retention policies compliant with lending regulations
- **Secure Key Management**: Use hardware security modules (HSMs) for cryptographic key management
- **PII Protection**: Implement data masking and anonymization for personally identifiable information

### Authentication and Authorization
- **Multi-Factor Authentication**: Require MFA for all users accessing lending systems
- **Session Management**: Implement secure session handling with automatic timeout
- **API Security**: Use OAuth 2.0 with client credentials flow for system-to-system communication
- **Identity Verification**: Implement robust identity verification for loan applicants
- **Privileged Access Management**: Control and monitor privileged user access to sensitive systems

### Fraud Prevention and Risk Management
- **Identity Fraud Detection**: Implement ML-based identity fraud detection algorithms
- **Application Fraud Prevention**: Detect synthetic identities and fraudulent applications
- **Real-time Risk Scoring**: Continuously assess and update risk scores throughout loan lifecycle
- **Behavioral Analytics**: Monitor user behavior patterns to detect suspicious activities
- **Third-party Risk Assessment**: Validate and monitor third-party integrations for security risks

### Regulatory Compliance Security
- **SOX Compliance**: Implement controls for financial reporting accuracy and integrity
- **GLBA Compliance**: Ensure privacy and security of consumer financial information
- **Fair Lending Monitoring**: Implement controls to prevent discriminatory lending practices
- **Data Breach Response**: Maintain incident response procedures for data security breaches
- **Regulatory Reporting Security**: Secure transmission and storage of regulatory reports

## Configuration Examples

### Environment Configuration
```yaml
# lending-platform.yml
lending:
  database:
    primary:
      host: ${DB_PRIMARY_HOST}
      port: 5432
      database: lending_platform
      username: ${DB_USERNAME}
      password: ${DB_PASSWORD}
      ssl_mode: require
      encryption_key: ${DB_ENCRYPTION_KEY}
    
    replica:
      host: ${DB_REPLICA_HOST}
      port: 5432
      read_only: true
  
  security:
    jwt:
      secret: ${JWT_SECRET}
      expiration: 3600 # 1 hour
    
    mfa:
      enabled: true
      providers: ['totp', 'sms', 'email']
    
    session:
      timeout: 1800 # 30 minutes
      max_concurrent: 3
  
  underwriting:
    decision_engine:
      timeout: 30s
      max_retries: 3
      fallback_to_manual: true
    
    credit_bureaus:
      experian:
        endpoint: ${EXPERIAN_API_URL}
        username: ${EXPERIAN_USERNAME}
        password: ${EXPERIAN_PASSWORD}
      
      equifax:
        endpoint: ${EQUIFAX_API_URL}
        client_id: ${EQUIFAX_CLIENT_ID}
        client_secret: ${EQUIFAX_CLIENT_SECRET}
  
  compliance:
    fair_lending:
      monitoring_enabled: true
      alert_threshold: 0.05 # 5% disparity
    
    regulatory_reporting:
      hmda_enabled: true
      cra_enabled: true
      auto_submission: false
  
  notifications:
    email:
      provider: sendgrid
      api_key: ${SENDGRID_API_KEY}
      templates:
        application_received: d-123456
        decision_notification: d-789012
    
    sms:
      provider: twilio
      account_sid: ${TWILIO_ACCOUNT_SID}
      auth_token: ${TWILIO_AUTH_TOKEN}
```

### Database Configuration
```sql
-- Lending platform database schema
CREATE SCHEMA lending;
CREATE SCHEMA audit;

-- Loan applications table with encryption
CREATE TABLE lending.loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_number VARCHAR(20) UNIQUE NOT NULL,
    applicant_data BYTEA NOT NULL, -- Encrypted applicant information
    loan_details BYTEA NOT NULL, -- Encrypted loan request details
    status lending.application_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID NOT NULL,
    data_hash VARCHAR(64) NOT NULL -- For integrity verification
);

-- Underwriting decisions table
CREATE TABLE lending.underwriting_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES lending.loan_applications(id),
    decision lending.loan_decision NOT NULL,
    decision_factors JSONB NOT NULL,
    risk_score INTEGER NOT NULL,
    approved_amount DECIMAL(15,2),
    interest_rate DECIMAL(5,4),
    decision_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    underwriter_id UUID,
    model_version VARCHAR(20) NOT NULL
);

-- Audit trail table
CREATE TABLE audit.lending_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL, -- INSERT, UPDATE, DELETE
    old_values JSONB,
    new_values JSONB,
    user_id UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

-- Row-level security policies
ALTER TABLE lending.loan_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY loan_application_access ON lending.loan_applications
    FOR ALL TO lending_user
    USING (
        created_by = current_setting('app.current_user_id')::UUID OR
        EXISTS (
            SELECT 1 FROM lending.user_permissions up
            WHERE up.user_id = current_setting('app.current_user_id')::UUID
            AND up.permission = 'view_all_applications'
        )
    );
```

### API Configuration Parameters
```typescript
interface LendingPlatformConfig {
  // Database configuration
  database: {
    primary: DatabaseConfig;
    replica: DatabaseConfig;
    encryptionKey: string;
    connectionPoolSize: number;
    queryTimeout: number;
  };
  
  // Security configuration
  security: {
    jwt: {
      secret: string;
      expiration: number;
      algorithm: 'HS256' | 'RS256';
    };
    mfa: {
      enabled: boolean;
      providers: ('totp' | 'sms' | 'email')[];
      gracePeriod: number;
    };
    session: {
      timeout: number;
      maxConcurrent: number;
      secureCookies: boolean;
    };
    encryption: {
      algorithm: 'AES-256-GCM';
      keyRotationInterval: number;
    };
  };
  
  // Underwriting configuration
  underwriting: {
    decisionEngine: {
      timeout: number;
      maxRetries: number;
      fallbackToManual: boolean;
      modelVersion: string;
    };
    creditBureaus: {
      experian: CreditBureauConfig;
      equifax: CreditBureauConfig;
      transunion: CreditBureauConfig;
    };
    riskModels: {
      personalLoan: RiskModelConfig;
      autoLoan: RiskModelConfig;
      mortgage: RiskModelConfig;
    };
  };
  
  // Compliance configuration
  compliance: {
    fairLending: {
      monitoringEnabled: boolean;
      alertThreshold: number;
      reportingFrequency: 'daily' | 'weekly' | 'monthly';
    };
    regulatoryReporting: {
      hmdaEnabled: boolean;
      craEnabled: boolean;
      autoSubmission: boolean;
      reportingSchedule: CronExpression;
    };
    dataRetention: {
      applicationData: number; // days
      auditLogs: number; // days
      decisionRecords: number; // days
    };
  };
  
  // Integration configuration
  integrations: {
    paymentProcessors: {
      ach: ACHProcessorConfig;
      wire: WireProcessorConfig;
    };
    documentStorage: {
      provider: 'aws-s3' | 'azure-blob' | 'gcp-storage';
      bucket: string;
      encryptionEnabled: boolean;
    };
    notifications: {
      email: EmailConfig;
      sms: SMSConfig;
      push: PushConfig;
    };
  };
  
  // Monitoring and logging
  monitoring: {
    errorTracking: {
      sentryDsn: string;
      environment: string;
      sampleRate: number;
    };
    metrics: {
      provider: 'datadog' | 'newrelic' | 'prometheus';
      apiKey: string;
      customMetrics: boolean;
    };
    logging: {
      level: 'debug' | 'info' | 'warn' | 'error';
      destination: 'console' | 'file' | 'cloudwatch';
      auditLogging: boolean;
    };
  };
}

interface CreditBureauConfig {
  endpoint: string;
  authentication: {
    type: 'basic' | 'oauth2' | 'api-key';
    credentials: Record<string, string>;
  };
  timeout: number;
  retryPolicy: {
    maxRetries: number;
    backoffMultiplier: number;
  };
  rateLimiting: {
    requestsPerMinute: number;
    burstLimit: number;
  };
}
```

### Deployment Configuration
```dockerfile
# Multi-stage Dockerfile for lending platform
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS runtime
# Create non-root user
RUN addgroup -g 1001 -S lending && \
    adduser -S lendinguser -u 1001 -G lending

# Install security updates
RUN apk update && apk upgrade && \
    apk add --no-cache dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app
COPY --from=builder --chown=lendinguser:lending /app/node_modules ./node_modules
COPY --chown=lendinguser:lending . .

# Set security headers and limits
USER lendinguser
EXPOSE 3000

# Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/server.js"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js
```

```yaml
# Kubernetes deployment with security best practices
apiVersion: apps/v1
kind: Deployment
metadata:
  name: lending-platform
  labels:
    app: lending-platform
    version: v1
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: lending-platform
  template:
    metadata:
      labels:
        app: lending-platform
        version: v1
    spec:
      serviceAccountName: lending-platform-sa
      securityContext:
        runAsNonRoot: true
        runAsUser: 1001
        fsGroup: 1001
      containers:
      - name: lending-platform
        image: lending-platform:latest
        ports:
        - containerPort: 3000
          name: http
        env:
        - name: NODE_ENV
          value: "production"
        - name: DB_ENCRYPTION_KEY
          valueFrom:
            secretKeyRef:
              name: lending-secrets
              key: db-encryption-key
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: lending-secrets
              key: jwt-secret
        securityContext:
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
          capabilities:
            drop:
            - ALL
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
          timeoutSeconds: 3
          failureThreshold: 3
        volumeMounts:
        - name: tmp
          mountPath: /tmp
        - name: logs
          mountPath: /app/logs
      volumes:
      - name: tmp
        emptyDir: {}
      - name: logs
        emptyDir: {}
      nodeSelector:
        node-type: compute
      tolerations:
      - key: "lending-workload"
        operator: "Equal"
        value: "true"
        effect: "NoSchedule"
```

### Monitoring Configuration
```yaml
# Prometheus monitoring configuration
apiVersion: v1
kind: ConfigMap
metadata:
  name: lending-platform-monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
    
    scrape_configs:
    - job_name: 'lending-platform'
      static_configs:
      - targets: ['lending-platform:3000']
      metrics_path: /metrics
      scrape_interval: 10s
      
    - job_name: 'lending-database'
      static_configs:
      - targets: ['postgres-exporter:9187']
      
    rule_files:
    - "lending_alerts.yml"
    
  lending_alerts.yml: |
    groups:
    - name: lending.rules
      rules:
      - alert: HighApplicationVolume
        expr: rate(loan_applications_total[5m]) > 100
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High loan application volume detected"
          
      - alert: UnderwritingDecisionLatency
        expr: histogram_quantile(0.95, rate(underwriting_decision_duration_seconds_bucket[5m])) > 30
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Underwriting decision latency is high"
          
      - alert: DatabaseConnectionFailure
        expr: up{job="lending-database"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Database connection failure"
```

## Implementation Guidelines

### Performance and Scalability
- Implement asynchronous processing for loan applications
- Use caching for credit scores and risk assessments
- Implement batch processing for payment processing
- Use database indexing for loan queries
- Implement queue systems for high-volume operations

### Security and Data Protection
- Implement encryption for sensitive borrower data
- Use tokenization for payment information
- Implement secure document storage
- Follow PCI DSS compliance for payment processing
- Implement data retention and deletion policies

### Risk Management
- Implement real-time fraud detection
- Use machine learning for credit risk assessment
- Implement portfolio risk monitoring
- Use stress testing for loan portfolios
- Implement early warning systems for delinquency

### Regulatory Compliance
- Implement automated compliance checking
- Maintain audit trails for all lending decisions
- Implement fair lending monitoring
- Follow state and federal lending regulations
- Implement required disclosure management

## Integration Examples

### Credit Bureau Integration
```typescript
class CreditBureauService {
  async getCreditReport(applicant: ApplicantInformation): Promise<CreditReport[]> {
    const reports: CreditReport[] = [];
    
    // Pull from multiple bureaus
    const bureauPromises = [
      this.getExperianReport(applicant),
      this.getEquifaxReport(applicant),
      this.getTransUnionReport(applicant)
    ];
    
    const results = await Promise.allSettled(bureauPromises);
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        reports.push(result.value);
      } else {
        // Log error but continue with available reports
        this.logger.error(`Failed to get report from bureau ${index}:`, result.reason);
      }
    });
    
    return reports;
  }
  
  private async getExperianReport(applicant: ApplicantInformation): Promise<CreditReport> {
    const request = {
      firstName: applicant.personalInfo.firstName,
      lastName: applicant.personalInfo.lastName,
      ssn: applicant.identificationInfo.ssn,
      dateOfBirth: applicant.personalInfo.dateOfBirth,
      address: applicant.contactInfo.address
    };
    
    const response = await this.experianClient.getCreditReport(request);
    
    return {
      bureau: CreditBureau.EXPERIAN,
      score: response.creditScore,
      reportDate: new Date(response.reportDate),
      accounts: response.accounts.map(this.mapExperianAccount),
      inquiries: response.inquiries.map(this.mapExperianInquiry),
      publicRecords: response.publicRecords.map(this.mapExperianPublicRecord)
    };
  }
}
```

### Automated Underwriting Decision Engine
```typescript
class UnderwritingDecisionEngine {
  async evaluateApplication(applicationId: string): Promise<UnderwritingDecision> {
    const application = await this.getApplication(applicationId);
    
    // Parallel execution of different checks
    const [
      creditScore,
      incomeVerification,
      riskAssessment,
      documentValidation,
      fraudCheck
    ] = await Promise.all([
      this.creditScoringService.calculateCreditScore(application.applicantInfo, application.creditData),
      this.verifyIncome(application.financialInfo),
      this.assessRisk(application),
      this.validateDocuments(application.documents),
      this.fraudDetectionService.checkForFraud(application)
    ]);
    
    // Apply business rules
    const decision = await this.applyUnderwritingRules({
      application,
      creditScore,
      incomeVerification,
      riskAssessment,
      documentValidation,
      fraudCheck
    });
    
    // Calculate loan terms if approved
    if (decision.decision === LoanDecision.APPROVED || decision.decision === LoanDecision.CONDITIONALLY_APPROVED) {
      const loanTerms = await this.calculateLoanTerms(application, riskAssessment);
      decision.approvedAmount = loanTerms.amount;
      decision.interestRate = loanTerms.interestRate;
      decision.loanTerm = loanTerms.termMonths;
    }
    
    // Log decision for audit
    await this.auditService.logUnderwritingDecision(decision);
    
    return decision;
  }
  
  private async applyUnderwritingRules(context: UnderwritingContext): Promise<UnderwritingDecision> {
    const rules = await this.getRulesForLoanType(context.application.loanDetails.loanType);
    const decisionFactors: DecisionFactor[] = [];
    
    let decision = LoanDecision.APPROVED;
    const conditions: LoanCondition[] = [];
    
    for (const rule of rules) {
      const ruleResult = await this.evaluateRule(rule, context);
      
      decisionFactors.push({
        factor: rule.name,
        impact: ruleResult.impact,
        weight: rule.weight,
        description: ruleResult.description
      });
      
      if (ruleResult.action === RuleAction.DECLINE) {
        decision = LoanDecision.DECLINED;
        break;
      } else if (ruleResult.action === RuleAction.ADD_CONDITION) {
        conditions.push(ruleResult.condition);
      } else if (ruleResult.action === RuleAction.MANUAL_REVIEW) {
        decision = LoanDecision.PENDING_REVIEW;
      }
    }
    
    if (conditions.length > 0 && decision === LoanDecision.APPROVED) {
      decision = LoanDecision.CONDITIONALLY_APPROVED;
    }
    
    return {
      applicationId: context.application.id,
      decision,
      conditions,
      decisionFactors,
      riskGrade: context.riskAssessment.riskGrade,
      timestamp: new Date(),
      expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    };
  }
}
```

## Testing Strategy

### Unit Tests
- Test credit scoring algorithms
- Test underwriting rule evaluation
- Test payment calculation logic
- Test delinquency detection

### Integration Tests
- Test credit bureau integrations
- Test payment processing workflows
- Test loan servicing operations
- Test regulatory reporting

### Compliance Tests
- Test fair lending compliance
- Test required disclosure delivery
- Test data privacy compliance
- Test audit trail completeness

### Performance Tests
- Test high-volume application processing
- Test concurrent payment processing
- Test credit scoring performance
- Test database query optimization

## Monitoring and Analytics

### Key Metrics
- Loan approval rates by risk grade
- Default rates by loan type
- Time to decision for applications
- Payment processing success rates
- Collections effectiveness

### Alerts and Notifications
- High-risk loan approvals
- Unusual default rate patterns
- Regulatory compliance violations
- Payment processing failures
- System performance issues

This template provides a comprehensive foundation for building sophisticated lending platforms that can handle the full loan lifecycle from application to collections while maintaining regulatory compliance and risk management best practices.