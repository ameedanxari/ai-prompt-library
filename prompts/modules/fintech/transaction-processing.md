# Transaction Processing Template

## Purpose
Provides comprehensive patterns for payment processing, transaction handling, reconciliation, and financial transaction management in fintech applications.

## Context
Use this template when building financial applications that require:
- Secure payment processing and transaction handling
- Real-time transaction monitoring and validation
- Transaction reconciliation and settlement
- Multi-currency and cross-border payment support
- Transaction history and reporting

## Core Components

### 1. Transaction Processing Engine

```typescript
interface TransactionProcessor {
  processTransaction(request: TransactionRequest): Promise<TransactionResult>;
  validateTransaction(transaction: Transaction): Promise<ValidationResult>;
  authorizeTransaction(transactionId: string): Promise<AuthorizationResult>;
  settleTransaction(transactionId: string): Promise<SettlementResult>;
  reverseTransaction(transactionId: string, reason: ReversalReason): Promise<ReversalResult>;
}

interface TransactionRequest {
  fromAccount: AccountIdentifier;
  toAccount: AccountIdentifier;
  amount: Money;
  currency: CurrencyCode;
  transactionType: TransactionType;
  description?: string;
  metadata?: Record<string, any>;
  idempotencyKey: string;
  requestedExecutionTime?: Date;
}

interface Money {
  amount: number; // Use decimal/BigDecimal for precision
  currency: CurrencyCode;
  precision: number;
}

enum TransactionType {
  TRANSFER = 'transfer',
  PAYMENT = 'payment',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  REFUND = 'refund',
  FEE = 'fee',
  INTEREST = 'interest',
  DIVIDEND = 'dividend'
}
```

### 2. Payment Gateway Integration

```typescript
interface PaymentGateway {
  processPayment(request: PaymentRequest): Promise<PaymentResult>;
  capturePayment(paymentId: string, amount?: Money): Promise<CaptureResult>;
  refundPayment(paymentId: string, amount?: Money): Promise<RefundResult>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
  handleWebhook(payload: WebhookPayload): Promise<void>;
}

interface PaymentRequest {
  amount: Money;
  paymentMethod: PaymentMethod;
  customer: CustomerInfo;
  billingAddress?: Address;
  description?: string;
  metadata?: Record<string, any>;
  captureMethod: CaptureMethod; // AUTOMATIC, MANUAL
}

interface PaymentMethod {
  type: PaymentMethodType;
  card?: CardDetails;
  bankAccount?: BankAccountDetails;
  digitalWallet?: DigitalWalletDetails;
  cryptocurrency?: CryptoDetails;
}

enum PaymentMethodType {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  BANK_TRANSFER = 'bank_transfer',
  ACH = 'ach',
  WIRE_TRANSFER = 'wire_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  CRYPTOCURRENCY = 'cryptocurrency'
}

interface CardDetails {
  number: string; // PCI-compliant tokenized format
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  holderName: string;
  brand: CardBrand; // VISA, MASTERCARD, AMEX, etc.
}
```

### 3. Transaction Validation and Risk Assessment

```typescript
interface TransactionValidator {
  validateBusinessRules(transaction: Transaction): Promise<ValidationResult>;
  checkAccountLimits(accountId: string, amount: Money): Promise<LimitCheckResult>;
  validateCurrency(transaction: Transaction): Promise<CurrencyValidationResult>;
  checkDuplicateTransaction(transaction: Transaction): Promise<DuplicateCheckResult>;
  assessTransactionRisk(transaction: Transaction): Promise<RiskAssessmentResult>;
}

interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  riskScore: number;
}

interface LimitCheckResult {
  withinLimits: boolean;
  dailyLimitRemaining: Money;
  monthlyLimitRemaining: Money;
  transactionLimitExceeded: boolean;
  velocityLimitExceeded: boolean;
}

interface RiskAssessmentResult {
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  recommendedAction: RiskAction;
  requiresManualReview: boolean;
}

enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

enum RiskAction {
  APPROVE = 'approve',
  REVIEW = 'review',
  DECLINE = 'decline',
  REQUIRE_ADDITIONAL_AUTH = 'require_additional_auth'
}
```

### 4. Transaction Reconciliation System

```typescript
interface ReconciliationService {
  reconcileTransactions(date: Date): Promise<ReconciliationResult>;
  matchTransactions(internalTxns: Transaction[], externalTxns: ExternalTransaction[]): Promise<MatchingResult>;
  identifyDiscrepancies(reconciliation: ReconciliationResult): Promise<Discrepancy[]>;
  generateReconciliationReport(date: Date): Promise<ReconciliationReport>;
  resolveDiscrepancy(discrepancyId: string, resolution: DiscrepancyResolution): Promise<void>;
}

interface ReconciliationResult {
  date: Date;
  totalInternalTransactions: number;
  totalExternalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  discrepancies: Discrepancy[];
  totalDiscrepancyAmount: Money;
  reconciliationStatus: ReconciliationStatus;
}

interface Discrepancy {
  id: string;
  type: DiscrepancyType;
  internalTransaction?: Transaction;
  externalTransaction?: ExternalTransaction;
  amountDifference?: Money;
  description: string;
  severity: DiscrepancySeverity;
  status: DiscrepancyStatus;
}

enum DiscrepancyType {
  MISSING_INTERNAL = 'missing_internal',
  MISSING_EXTERNAL = 'missing_external',
  AMOUNT_MISMATCH = 'amount_mismatch',
  STATUS_MISMATCH = 'status_mismatch',
  DUPLICATE_TRANSACTION = 'duplicate_transaction'
}
```

### 5. Multi-Currency and FX Handling

```typescript
interface CurrencyService {
  convertCurrency(amount: Money, targetCurrency: CurrencyCode): Promise<Money>;
  getExchangeRate(fromCurrency: CurrencyCode, toCurrency: CurrencyCode): Promise<ExchangeRate>;
  calculateFXFees(amount: Money, targetCurrency: CurrencyCode): Promise<Money>;
  processMultiCurrencyTransaction(request: MultiCurrencyTransactionRequest): Promise<TransactionResult>;
}

interface ExchangeRate {
  fromCurrency: CurrencyCode;
  toCurrency: CurrencyCode;
  rate: number;
  timestamp: Date;
  source: string; // Rate provider
  spread?: number; // Markup applied
}

interface MultiCurrencyTransactionRequest {
  fromAccount: AccountIdentifier;
  toAccount: AccountIdentifier;
  sourceAmount: Money;
  targetCurrency: CurrencyCode;
  exchangeRateId?: string; // For rate locking
  fxProvider: FXProvider;
}

enum FXProvider {
  INTERNAL = 'internal',
  REUTERS = 'reuters',
  BLOOMBERG = 'bloomberg',
  XE = 'xe',
  CURRENCYLAYER = 'currencylayer'
}
```

### 6. Transaction History and Reporting

```typescript
interface TransactionHistoryService {
  getTransactionHistory(accountId: string, filters: TransactionFilters): Promise<TransactionHistory>;
  searchTransactions(query: TransactionSearchQuery): Promise<TransactionSearchResult>;
  generateTransactionReport(request: ReportRequest): Promise<TransactionReport>;
  exportTransactions(request: ExportRequest): Promise<ExportResult>;
}

interface TransactionFilters {
  dateRange?: DateRange;
  transactionTypes?: TransactionType[];
  amountRange?: AmountRange;
  status?: TransactionStatus[];
  currency?: CurrencyCode;
  counterparty?: string;
}

interface TransactionHistory {
  transactions: Transaction[];
  totalCount: number;
  pageInfo: PageInfo;
  summary: TransactionSummary;
}

interface TransactionSummary {
  totalIncoming: Money;
  totalOutgoing: Money;
  netAmount: Money;
  transactionCount: number;
  averageTransactionAmount: Money;
}
```

## Implementation Guidelines

### Security Requirements
- Implement PCI DSS compliance for card data handling
- Use tokenization for sensitive payment information
- Implement end-to-end encryption for transaction data
- Maintain comprehensive audit trails
- Use secure communication protocols (TLS 1.3+)

### Performance Optimization
- Implement transaction batching for high-volume processing
- Use database indexing for transaction queries
- Implement caching for exchange rates and validation rules
- Use asynchronous processing for non-critical operations
- Implement connection pooling for database operations

### Reliability and Resilience
- Implement idempotency for all transaction operations
- Use distributed transactions where necessary
- Implement circuit breakers for external service calls
- Use message queues for reliable transaction processing
- Implement automatic retry mechanisms with exponential backoff

### Compliance and Regulatory
- Implement transaction monitoring for AML compliance
- Maintain transaction records for regulatory reporting
- Implement sanctions screening for international transfers
- Follow local payment regulations (PSD2, Open Banking, etc.)
- Implement data retention and deletion policies

## Integration Examples

### Stripe Payment Processing
```typescript
class StripePaymentGateway implements PaymentGateway {
  async processPayment(request: PaymentRequest): Promise<PaymentResult> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: this.convertToSmallestUnit(request.amount),
      currency: request.amount.currency.toLowerCase(),
      payment_method_types: [this.mapPaymentMethodType(request.paymentMethod.type)],
      capture_method: request.captureMethod.toLowerCase(),
      metadata: request.metadata
    });
    
    return {
      paymentId: paymentIntent.id,
      status: this.mapStripeStatus(paymentIntent.status),
      clientSecret: paymentIntent.client_secret
    };
  }
  
  async handleWebhook(payload: WebhookPayload): Promise<void> {
    const event = this.stripe.webhooks.constructEvent(
      payload.body,
      payload.signature,
      this.webhookSecret
    );
    
    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object);
        break;
    }
  }
}
```

### Bank Transfer Processing (ACH)
```typescript
class ACHProcessor implements TransactionProcessor {
  async processTransaction(request: TransactionRequest): Promise<TransactionResult> {
    // Validate ACH transaction rules
    const validation = await this.validateACHTransaction(request);
    if (!validation.isValid) {
      throw new ValidationError(validation.errors);
    }
    
    // Create ACH batch entry
    const achEntry = await this.createACHEntry(request);
    
    // Submit to ACH network
    const submission = await this.submitToACHNetwork(achEntry);
    
    return {
      transactionId: submission.transactionId,
      status: TransactionStatus.PENDING,
      estimatedSettlementDate: this.calculateSettlementDate(),
      fees: this.calculateACHFees(request.amount)
    };
  }
  
  private async validateACHTransaction(request: TransactionRequest): Promise<ValidationResult> {
    const checks = await Promise.all([
      this.checkACHLimits(request),
      this.validateBankingDay(request.requestedExecutionTime),
      this.checkAccountStatus(request.fromAccount),
      this.validateRoutingNumber(request.toAccount)
    ]);
    
    return this.combineValidationResults(checks);
  }
}
```

## Configuration Parameters

### Transaction Processing Configuration
```yaml
# Transaction Processing Service Configuration
transaction_service:
  payment_gateways:
    primary: "stripe" # Options: stripe, square, adyen, braintree
    fallback: "square"
    timeout_ms: 30000
  processing_limits:
    max_transaction_amount: 1000000 # $10,000 in cents
    daily_limit_per_account: 5000000 # $50,000 in cents
    monthly_limit_per_account: 50000000 # $500,000 in cents
  reconciliation:
    auto_reconcile: true
    reconciliation_window_hours: 24
    discrepancy_threshold: 100 # $1.00 in cents
  currency:
    base_currency: "USD"
    supported_currencies: ["USD", "EUR", "GBP", "CAD"]
    fx_provider: "xe" # Options: xe, currencylayer, fixer
    rate_refresh_interval_minutes: 15
```

### Payment Gateway Configuration
```typescript
interface PaymentGatewayConfig {
  stripe?: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
    apiVersion: string;
    environment: 'test' | 'live';
  };
  square?: {
    applicationId: string;
    accessToken: string;
    webhookSignatureKey: string;
    environment: 'sandbox' | 'production';
  };
  adyen?: {
    apiKey: string;
    merchantAccount: string;
    environment: 'test' | 'live';
    hmacKey: string;
  };
}
```

### Risk Assessment Parameters
```typescript
interface RiskAssessmentConfig {
  riskThresholds: {
    lowRisk: number; // 0-30
    mediumRisk: number; // 31-70
    highRisk: number; // 71-90
    criticalRisk: number; // 91-100
  };
  velocityLimits: {
    transactionsPerHour: number;
    transactionsPerDay: number;
    amountPerHour: Money;
    amountPerDay: Money;
  };
  fraudDetection: {
    enabled: boolean;
    provider: 'internal' | 'sift' | 'kount';
    threshold: number;
    autoDeclineThreshold: number;
  };
}
```

## Configuration Examples

### Basic Development Setup
```typescript
// Basic configuration for development environment
const transactionConfig = {
  paymentGateways: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_TEST!,
      secretKey: process.env.STRIPE_SECRET_KEY_TEST!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_TEST!,
      apiVersion: '2023-10-16',
      environment: 'test' as const
    }
  },
  processingLimits: {
    maxTransactionAmount: 100000, // $1,000 for testing
    dailyLimitPerAccount: 500000, // $5,000 for testing
    monthlyLimitPerAccount: 5000000 // $50,000 for testing
  },
  reconciliation: {
    autoReconcile: true,
    reconciliationWindowHours: 1, // Faster for testing
    discrepancyThreshold: 1 // $0.01 for testing
  }
};

const transactionProcessor = new TransactionProcessor(transactionConfig);
```

### Production Configuration
```typescript
// Production configuration with multiple gateways
const productionConfig = {
  paymentGateways: {
    stripe: {
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY_LIVE!,
      secretKey: process.env.STRIPE_SECRET_KEY_LIVE!,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET_LIVE!,
      apiVersion: '2023-10-16',
      environment: 'live' as const
    },
    square: {
      applicationId: process.env.SQUARE_APPLICATION_ID!,
      accessToken: process.env.SQUARE_ACCESS_TOKEN!,
      webhookSignatureKey: process.env.SQUARE_WEBHOOK_SIGNATURE_KEY!,
      environment: 'production' as const
    }
  },
  processingLimits: {
    maxTransactionAmount: 1000000, // $10,000
    dailyLimitPerAccount: 5000000, // $50,000
    monthlyLimitPerAccount: 50000000 // $500,000
  },
  riskAssessment: {
    riskThresholds: {
      lowRisk: 30,
      mediumRisk: 70,
      highRisk: 90,
      criticalRisk: 100
    },
    fraudDetection: {
      enabled: true,
      provider: 'sift',
      threshold: 70,
      autoDeclineThreshold: 90
    }
  }
};
```

### Multi-Currency Configuration
```typescript
// Configuration for international transactions
const multiCurrencyConfig = {
  currency: {
    baseCurrency: 'USD',
    supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
    fxProvider: 'xe',
    rateRefreshIntervalMinutes: 15,
    fxMarkup: 0.005 // 0.5% markup on FX rates
  },
  regionalSettings: {
    'US': {
      paymentMethods: ['credit_card', 'debit_card', 'ach', 'wire_transfer'],
      complianceRules: 'us_finra',
      taxReporting: true
    },
    'EU': {
      paymentMethods: ['credit_card', 'debit_card', 'sepa', 'bank_transfer'],
      complianceRules: 'eu_psd2',
      taxReporting: true
    }
  }
};
```

### High-Volume Processing Configuration
```typescript
// Configuration optimized for high transaction volumes
const highVolumeConfig = {
  processing: {
    batchSize: 1000,
    maxConcurrentTransactions: 100,
    queueProcessingIntervalMs: 1000,
    retryAttempts: 3,
    retryDelayMs: 5000
  },
  database: {
    connectionPoolSize: 50,
    queryTimeout: 30000,
    transactionTimeout: 60000,
    readReplicas: ['replica1.db.com', 'replica2.db.com']
  },
  caching: {
    exchangeRatesCacheTtl: 900, // 15 minutes
    validationRulesCacheTtl: 3600, // 1 hour
    accountLimitsCacheTtl: 300 // 5 minutes
  }
};
```

## Testing Strategy

### Unit Tests
- Test transaction validation logic
- Test currency conversion calculations
- Test fee calculation algorithms
- Test error handling scenarios

### Integration Tests
- Test payment gateway integrations
- Test bank transfer processing
- Test reconciliation workflows
- Test webhook handling

### Performance Tests
- Test high-volume transaction processing
- Test concurrent transaction handling
- Test database performance under load
- Test external service timeout handling

## Monitoring and Analytics

### Key Metrics
- Transaction success rate
- Average transaction processing time
- Payment gateway response times
- Reconciliation accuracy rate
- Failed transaction rate by reason

### Alerts and Notifications
- High transaction failure rates
- Reconciliation discrepancies
- Unusual transaction patterns
- Payment gateway downtime
- Currency conversion rate anomalies

This template provides a robust foundation for building secure, scalable transaction processing systems in fintech applications while ensuring compliance with financial regulations and industry best practices.