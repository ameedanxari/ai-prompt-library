# Fintech Application Development Guide

## Purpose

This guide provides comprehensive patterns for building production-ready financial services applications using the AI Prompt Library v2 templates. It covers template selection, composition strategies, and implementation patterns for common fintech scenarios with emphasis on regulatory compliance and security.

## Quick Start

### Essential Templates for Fintech Apps

| Feature Area | Primary Templates | Supporting Templates |
|--------------|-------------------|---------------------|
| Accounts | `fintech/account-management.md` | `security/multi-factor-auth.md` |
| Transactions | `fintech/transaction-processing.md` | `fintech/fraud-detection.md` |
| Compliance | `fintech/financial-reporting.md` | `enterprise-saas/audit-trails.md` |
| Investments | `fintech/investment-management.md` | `fintech/credit-scoring.md` |
| Lending | `fintech/lending-platform.md` | `fintech/budgeting-tools.md` |

## Template Composition Patterns

### Pattern 1: Digital Banking App

For a consumer banking application:

```markdown
# Core Templates
1. fintech/account-management.md     # Account creation, KYC
2. fintech/transaction-processing.md # Payments, transfers
3. fintech/fraud-detection.md        # Real-time fraud monitoring
4. fintech/budgeting-tools.md        # Personal finance tools

# Security & Compliance
- security/multi-factor-auth.md      # Strong authentication
- security/data-encryption.md        # Data protection
- enterprise-saas/audit-trails.md    # Transaction logging
- fintech/financial-reporting.md     # Regulatory reporting

# User Experience
- notifications/notification-channels.md # Transaction alerts
- analytics/user-analytics.md        # Usage insights
```

### Pattern 2: Investment Platform

For trading and investment applications:

```markdown
# Core Templates
1. fintech/investment-management.md  # Portfolio management
2. fintech/account-management.md     # Brokerage accounts
3. fintech/transaction-processing.md # Trade execution
4. fintech/financial-reporting.md    # Tax reporting

# Market Data
- real-time-communication/real-time-sync.md # Live prices
- analytics/real-time-analytics.md   # Market analytics
- data-processing/data-ingestion.md  # Market data feeds

# Compliance
- enterprise-saas/audit-trails.md    # Trade audit trail
- security/advanced-authorization.md # Trading permissions
```

### Pattern 3: Lending Platform

For loan and credit applications:

```markdown
# Core Templates
1. fintech/lending-platform.md       # Loan origination
2. fintech/credit-scoring.md         # Risk assessment
3. fintech/account-management.md     # Borrower accounts
4. fintech/transaction-processing.md # Loan disbursement

# Risk Management
- fintech/fraud-detection.md         # Application fraud
- analytics/predictive-analytics.md  # Default prediction
- fintech/financial-reporting.md     # Regulatory compliance

# Collections
- notifications/communication-automation.md # Payment reminders
- commerce/payment-subscriptions.md  # Recurring payments
```

## Implementation Examples

### Example 1: KYC/AML Verification Flow

```typescript
// From fintech/account-management.md patterns

interface KYCVerification {
  customerId: string;
  verificationLevel: 'basic' | 'enhanced' | 'premium';
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'manual_review';
  documents: VerificationDocument[];
  amlScreening: AMLScreeningResult;
  riskScore: number;
}

class KYCService {
  async initiateVerification(
    customerId: string, 
    level: VerificationLevel
  ): Promise<KYCVerification> {
    // Create verification record
    const verification = await this.verificationRepository.create({
      customerId,
      verificationLevel: level,
      status: 'pending',
      initiatedAt: new Date()
    });
    
    // Determine required documents based on level
    const requiredDocs = this.getRequiredDocuments(level);
    
    return {
      ...verification,
      requiredDocuments: requiredDocs,
      uploadUrl: await this.generateSecureUploadUrl(verification.id)
    };
  }
  
  async processDocuments(
    verificationId: string, 
    documents: UploadedDocument[]
  ): Promise<DocumentVerificationResult> {
    // Verify document authenticity
    const documentResults = await Promise.all(
      documents.map(doc => this.verifyDocument(doc))
    );
    
    // Extract data from documents
    const extractedData = await this.extractDocumentData(documents);
    
    // Cross-reference with provided information
    const crossRefResult = await this.crossReferenceData(
      verificationId, 
      extractedData
    );
    
    // Run AML screening
    const amlResult = await this.runAMLScreening(extractedData);
    
    // Calculate risk score
    const riskScore = this.calculateRiskScore({
      documentResults,
      crossRefResult,
      amlResult
    });
    
    // Determine final status
    const status = this.determineVerificationStatus(riskScore, amlResult);
    
    await this.updateVerificationStatus(verificationId, status, riskScore);
    
    return {
      verificationId,
      status,
      riskScore,
      requiresManualReview: status === 'manual_review'
    };
  }
  
  private async runAMLScreening(data: ExtractedData): Promise<AMLScreeningResult> {
    // Check against sanctions lists
    const sanctionsCheck = await this.sanctionsService.check(data);
    
    // Check PEP (Politically Exposed Persons) lists
    const pepCheck = await this.pepService.check(data);
    
    // Check adverse media
    const adverseMediaCheck = await this.adverseMediaService.check(data);
    
    return {
      sanctionsMatch: sanctionsCheck.hasMatch,
      pepMatch: pepCheck.hasMatch,
      adverseMedia: adverseMediaCheck.findings,
      overallRisk: this.calculateAMLRisk(sanctionsCheck, pepCheck, adverseMediaCheck)
    };
  }
}
```

### Example 2: Transaction Processing with Fraud Detection

```typescript
// Combining transaction-processing.md and fraud-detection.md patterns

interface Transaction {
  id: string;
  accountId: string;
  type: 'debit' | 'credit' | 'transfer';
  amount: Money;
  counterparty: Counterparty;
  status: TransactionStatus;
  fraudScore: number;
  metadata: TransactionMetadata;
}

class TransactionService {
  async processTransaction(request: TransactionRequest): Promise<Transaction> {
    // Validate transaction
    await this.validateTransaction(request);
    
    // Check account balance
    const account = await this.accountService.getAccount(request.accountId);
    if (request.type === 'debit' && account.balance < request.amount) {
      throw new InsufficientFundsError();
    }
    
    // Run fraud detection
    const fraudResult = await this.fraudService.analyzeTransaction(request);
    
    if (fraudResult.score > this.fraudThreshold) {
      // Block high-risk transactions
      return await this.createBlockedTransaction(request, fraudResult);
    }
    
    if (fraudResult.score > this.reviewThreshold) {
      // Queue for manual review
      return await this.createPendingTransaction(request, fraudResult);
    }
    
    // Process transaction
    const transaction = await this.executeTransaction(request, fraudResult);
    
    // Update account balance
    await this.accountService.updateBalance(request.accountId, request.amount, request.type);
    
    // Send notification
    await this.notificationService.sendTransactionAlert(transaction);
    
    // Log for compliance
    await this.auditService.logTransaction(transaction);
    
    return transaction;
  }
}

class FraudDetectionService {
  async analyzeTransaction(request: TransactionRequest): Promise<FraudAnalysis> {
    // Gather signals
    const signals = await Promise.all([
      this.checkVelocity(request),           // Transaction frequency
      this.checkAmount(request),              // Unusual amounts
      this.checkLocation(request),            // Geographic anomalies
      this.checkDevice(request),              // Device fingerprint
      this.checkBehavior(request),            // Behavioral patterns
      this.checkCounterparty(request)         // Counterparty risk
    ]);
    
    // Calculate composite score
    const score = this.calculateFraudScore(signals);
    
    // Get explanation for score
    const explanation = this.generateExplanation(signals);
    
    return {
      score,
      signals,
      explanation,
      recommendation: this.getRecommendation(score)
    };
  }
  
  private async checkVelocity(request: TransactionRequest): Promise<FraudSignal> {
    const recentTransactions = await this.getRecentTransactions(
      request.accountId, 
      { hours: 24 }
    );
    
    const totalAmount = recentTransactions.reduce(
      (sum, t) => sum + t.amount.value, 
      0
    );
    
    const velocityScore = this.calculateVelocityScore(
      recentTransactions.length,
      totalAmount,
      request.amount.value
    );
    
    return {
      type: 'velocity',
      score: velocityScore,
      details: {
        transactionCount: recentTransactions.length,
        totalAmount,
        requestedAmount: request.amount.value
      }
    };
  }
}
```

### Example 3: Investment Portfolio Management

```typescript
// From fintech/investment-management.md patterns

interface Portfolio {
  id: string;
  accountId: string;
  holdings: Holding[];
  totalValue: Money;
  performance: PerformanceMetrics;
  riskProfile: RiskProfile;
}

interface Holding {
  symbol: string;
  quantity: number;
  averageCost: Money;
  currentPrice: Money;
  marketValue: Money;
  unrealizedGain: Money;
  percentageOfPortfolio: number;
}

class PortfolioService {
  async getPortfolio(accountId: string): Promise<Portfolio> {
    // Get holdings
    const holdings = await this.holdingRepository.getByAccount(accountId);
    
    // Get current prices
    const prices = await this.marketDataService.getPrices(
      holdings.map(h => h.symbol)
    );
    
    // Calculate current values
    const enrichedHoldings = holdings.map(holding => {
      const currentPrice = prices.get(holding.symbol);
      const marketValue = holding.quantity * currentPrice;
      const costBasis = holding.quantity * holding.averageCost;
      
      return {
        ...holding,
        currentPrice,
        marketValue,
        unrealizedGain: marketValue - costBasis,
        unrealizedGainPercent: ((marketValue - costBasis) / costBasis) * 100
      };
    });
    
    // Calculate portfolio totals
    const totalValue = enrichedHoldings.reduce(
      (sum, h) => sum + h.marketValue, 
      0
    );
    
    // Add percentage allocation
    const withAllocation = enrichedHoldings.map(h => ({
      ...h,
      percentageOfPortfolio: (h.marketValue / totalValue) * 100
    }));
    
    // Calculate performance
    const performance = await this.calculatePerformance(accountId, totalValue);
    
    return {
      id: `portfolio-${accountId}`,
      accountId,
      holdings: withAllocation,
      totalValue: { value: totalValue, currency: 'USD' },
      performance,
      riskProfile: await this.calculateRiskProfile(withAllocation)
    };
  }
  
  async executeTrade(order: TradeOrder): Promise<TradeExecution> {
    // Validate order
    await this.validateOrder(order);
    
    // Check buying power for buy orders
    if (order.side === 'buy') {
      const buyingPower = await this.getBuyingPower(order.accountId);
      const estimatedCost = order.quantity * order.limitPrice;
      
      if (buyingPower < estimatedCost) {
        throw new InsufficientBuyingPowerError();
      }
    }
    
    // Check holdings for sell orders
    if (order.side === 'sell') {
      const holding = await this.getHolding(order.accountId, order.symbol);
      
      if (!holding || holding.quantity < order.quantity) {
        throw new InsufficientSharesError();
      }
    }
    
    // Submit to exchange/broker
    const execution = await this.brokerService.submitOrder(order);
    
    // Update holdings
    await this.updateHoldings(order.accountId, execution);
    
    // Log for compliance
    await this.auditService.logTrade(execution);
    
    // Calculate tax implications
    if (order.side === 'sell') {
      await this.taxService.recordSale(order.accountId, execution);
    }
    
    return execution;
  }
}
```

## Compliance & Regulatory

### Audit Trail Implementation

```typescript
// From enterprise-saas/audit-trails.md patterns

interface AuditEntry {
  id: string;
  timestamp: Date;
  actorId: string;
  actorType: 'user' | 'system' | 'admin';
  action: string;
  resourceType: string;
  resourceId: string;
  previousState?: any;
  newState?: any;
  metadata: AuditMetadata;
  ipAddress: string;
  userAgent: string;
}

class FinancialAuditService {
  async logTransaction(transaction: Transaction): Promise<void> {
    await this.createAuditEntry({
      action: 'transaction.processed',
      resourceType: 'transaction',
      resourceId: transaction.id,
      actorId: transaction.initiatedBy,
      newState: {
        amount: transaction.amount,
        type: transaction.type,
        status: transaction.status,
        counterparty: transaction.counterparty
      },
      metadata: {
        accountId: transaction.accountId,
        fraudScore: transaction.fraudScore,
        processingTime: transaction.processingTime
      }
    });
  }
  
  async generateComplianceReport(
    dateRange: DateRange, 
    reportType: ComplianceReportType
  ): Promise<ComplianceReport> {
    const entries = await this.auditRepository.getEntries(dateRange);
    
    switch (reportType) {
      case 'SAR': // Suspicious Activity Report
        return this.generateSARReport(entries);
      case 'CTR': // Currency Transaction Report
        return this.generateCTRReport(entries);
      case 'REGULATORY':
        return this.generateRegulatoryReport(entries);
      default:
        throw new UnknownReportTypeError(reportType);
    }
  }
  
  private async generateSARReport(entries: AuditEntry[]): Promise<SARReport> {
    // Filter suspicious activities
    const suspicious = entries.filter(e => 
      e.metadata.fraudScore > 0.7 || 
      e.metadata.flaggedForReview
    );
    
    return {
      reportType: 'SAR',
      generatedAt: new Date(),
      period: this.getReportPeriod(entries),
      suspiciousActivities: suspicious.map(e => ({
        transactionId: e.resourceId,
        date: e.timestamp,
        amount: e.newState.amount,
        reason: e.metadata.flagReason,
        accountId: e.metadata.accountId
      })),
      totalCount: suspicious.length,
      totalAmount: this.sumAmounts(suspicious)
    };
  }
}
```

### Regulatory Reporting

```typescript
// From fintech/financial-reporting.md patterns

class RegulatoryReportingService {
  async generateDailyReport(): Promise<DailyReport> {
    const today = new Date();
    
    // Large transaction reporting (CTR)
    const largeTransactions = await this.getLargeTransactions(today, 10000);
    
    // Suspicious activity monitoring
    const suspiciousActivity = await this.getSuspiciousActivity(today);
    
    // Account activity summary
    const accountActivity = await this.getAccountActivitySummary(today);
    
    return {
      date: today,
      largeTransactions: {
        count: largeTransactions.length,
        totalAmount: this.sumAmounts(largeTransactions),
        transactions: largeTransactions
      },
      suspiciousActivity: {
        count: suspiciousActivity.length,
        alerts: suspiciousActivity
      },
      accountActivity: {
        newAccounts: accountActivity.newAccounts,
        closedAccounts: accountActivity.closedAccounts,
        totalTransactions: accountActivity.totalTransactions,
        totalVolume: accountActivity.totalVolume
      }
    };
  }
  
  async submitToRegulator(
    report: RegulatoryReport, 
    regulator: Regulator
  ): Promise<SubmissionResult> {
    // Format report for regulator
    const formattedReport = this.formatForRegulator(report, regulator);
    
    // Encrypt sensitive data
    const encryptedReport = await this.encryptReport(formattedReport);
    
    // Submit via secure channel
    const result = await this.regulatorGateway.submit(
      regulator, 
      encryptedReport
    );
    
    // Log submission
    await this.auditService.logRegulatorySubmission(report, result);
    
    return result;
  }
}
```

## Security Best Practices

### Multi-Factor Authentication

```typescript
// From security/multi-factor-auth.md patterns

class FinancialMFAService {
  async initiateHighValueTransaction(
    userId: string, 
    transaction: TransactionRequest
  ): Promise<MFAChallenge> {
    // Determine required MFA based on transaction risk
    const riskLevel = await this.assessTransactionRisk(transaction);
    const requiredFactors = this.getRequiredFactors(riskLevel);
    
    // Create MFA challenge
    const challenge = await this.createChallenge(userId, requiredFactors);
    
    // Send OTP if required
    if (requiredFactors.includes('sms') || requiredFactors.includes('email')) {
      await this.sendOTP(userId, challenge.id);
    }
    
    return challenge;
  }
  
  async verifyMFA(
    challengeId: string, 
    factors: MFAFactorResponse[]
  ): Promise<MFAVerificationResult> {
    const challenge = await this.getChallenge(challengeId);
    
    // Verify each factor
    const results = await Promise.all(
      factors.map(factor => this.verifyFactor(challenge, factor))
    );
    
    const allVerified = results.every(r => r.verified);
    
    if (allVerified) {
      await this.markChallengeComplete(challengeId);
    }
    
    return {
      verified: allVerified,
      factorResults: results,
      remainingFactors: this.getRemainingFactors(challenge, results)
    };
  }
}
```

### Data Encryption

```typescript
// From security/data-encryption.md patterns

class FinancialDataEncryption {
  // Encrypt sensitive financial data at rest
  async encryptAccountData(data: SensitiveAccountData): Promise<EncryptedData> {
    // Use field-level encryption for PII
    const encryptedSSN = await this.encryptField(data.ssn, 'ssn');
    const encryptedAccountNumber = await this.encryptField(
      data.accountNumber, 
      'account_number'
    );
    
    return {
      ...data,
      ssn: encryptedSSN,
      accountNumber: encryptedAccountNumber,
      encryptionKeyId: this.currentKeyId,
      encryptedAt: new Date()
    };
  }
  
  // Tokenize card data for PCI compliance
  async tokenizeCard(cardData: CardData): Promise<CardToken> {
    // Never store raw card data
    const token = await this.tokenizationService.tokenize({
      cardNumber: cardData.number,
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear
    });
    
    return {
      token: token.id,
      lastFour: cardData.number.slice(-4),
      brand: this.detectCardBrand(cardData.number),
      expiryMonth: cardData.expiryMonth,
      expiryYear: cardData.expiryYear
    };
  }
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('TransactionService', () => {
  it('should reject transactions exceeding balance', async () => {
    const account = await createTestAccount({ balance: 100 });
    
    await expect(transactionService.processTransaction({
      accountId: account.id,
      type: 'debit',
      amount: { value: 150, currency: 'USD' }
    })).rejects.toThrow(InsufficientFundsError);
  });
  
  it('should block high-risk transactions', async () => {
    const result = await transactionService.processTransaction({
      accountId: 'test-account',
      type: 'transfer',
      amount: { value: 50000, currency: 'USD' },
      counterparty: { id: 'high-risk-entity' }
    });
    
    expect(result.status).toBe('blocked');
    expect(result.fraudScore).toBeGreaterThan(0.8);
  });
});
```

### Property-Based Tests

```typescript
describe('Financial Calculations', () => {
  it('account balance should equal sum of transactions', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        type: fc.constantFrom('credit', 'debit'),
        amount: fc.integer({ min: 1, max: 10000 })
      })),
      (transactions) => {
        const account = new Account(0);
        
        for (const tx of transactions) {
          if (tx.type === 'credit') {
            account.credit(tx.amount);
          } else if (account.balance >= tx.amount) {
            account.debit(tx.amount);
          }
        }
        
        const expectedBalance = transactions.reduce((balance, tx) => {
          if (tx.type === 'credit') return balance + tx.amount;
          if (balance >= tx.amount) return balance - tx.amount;
          return balance;
        }, 0);
        
        return account.balance === expectedBalance;
      }
    ));
  });
});
```

## Common Pitfalls

1. **Floating point arithmetic**: Use decimal libraries for money calculations
2. **Race conditions**: Use database transactions for balance updates
3. **Compliance gaps**: Implement comprehensive audit logging from day one
4. **Security shortcuts**: Never store sensitive data unencrypted
5. **Insufficient fraud detection**: Layer multiple fraud signals

## Related Templates

- `analytics/predictive-analytics.md` - Risk modeling
- `notifications/notification-compliance.md` - Regulatory notifications
- `data-processing/data-governance.md` - Data management
- `integration/api-management.md` - Open banking APIs
- `blockchain/wallet-integration.md` - Crypto integration

## Next Steps

1. Define regulatory requirements for your jurisdiction
2. Implement KYC/AML verification flow
3. Build core transaction processing with fraud detection
4. Add comprehensive audit logging
5. Integrate regulatory reporting
6. Implement strong authentication and encryption
