# Fintech Module

## Purpose
Generate comprehensive financial technology applications with regulatory compliance, security, and modern fintech features including account management, payment processing, investment services, and compliance systems.

## Instructions
1. Analyze fintech business requirements and regulatory compliance needs
2. Select appropriate fintech templates based on service type (banking, investment, lending)
3. Implement core financial services (accounts, transactions, payments)
4. Build compliance and security measures (KYC/AML, fraud detection, audit trails)
5. Add investment and lending capabilities (portfolio management, credit scoring)
6. Create regulatory reporting and compliance tracking systems
7. Implement real-time fraud monitoring and risk assessment
8. Build financial analytics and insights dashboards
9. Add mobile-first financial service interfaces
10. Create comprehensive testing for financial workflows

## Examples

### Example 1: Complete Fintech Platform
```typescript
// Full-featured fintech application
class FintechPlatform {
  async initializePlatform(config: FintechConfig): Promise<Platform> {
    return {
      accountManagement: new AccountService(config.accounts),
      transactionProcessing: new TransactionService(config.transactions),
      fraudDetection: new FraudService(config.fraud),
      complianceTracking: new ComplianceService(config.compliance),
      investmentServices: new InvestmentService(config.investments),
      lendingPlatform: new LendingService(config.lending)
    };
  }
}
```

### Example 2: Digital Banking Solution
```typescript
// Digital banking with KYC and compliance
class DigitalBank {
  async createBankingServices(config: BankingConfig): Promise<BankingServices> {
    return {
      accountOpening: new KYCService(config.kyc),
      paymentProcessing: new PaymentService(config.payments),
      cardServices: new CardService(config.cards),
      loanServices: new LoanService(config.loans),
      complianceReporting: new RegulatoryService(config.regulatory)
    };
  }
}
```

### Example 3: Investment Management Platform
```typescript
// Investment platform with portfolio management
class InvestmentPlatform {
  async setupInvestmentServices(config: InvestmentConfig): Promise<InvestmentServices> {
    return {
      portfolioManagement: new PortfolioService(config.portfolio),
      tradingEngine: new TradingService(config.trading),
      riskAssessment: new RiskService(config.risk),
      marketData: new MarketDataService(config.marketData),
      reportingAnalytics: new AnalyticsService(config.analytics)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| serviceType | string | Type of fintech service | 'digital_banking' | Yes |
| regulatoryRegion | string | Regulatory jurisdiction | 'US' | Yes |
| complianceLevel | string | Compliance requirements level | 'standard' | Yes |
| kycProvider | string | KYC/AML service provider | 'jumio' | No |
| paymentMethods | array | Supported payment methods | ['ach', 'wire'] | Yes |
| investmentServices | boolean | Enable investment features | false | No |
| lendingServices | boolean | Enable lending features | false | No |
| fraudDetection | boolean | Enable fraud monitoring | true | Yes |
| mobileSupport | boolean | Mobile-first design | true | No |
| apiIntegrations | array | External service integrations | [] | No |

## Expected Output
A comprehensive fintech solution featuring:
- Secure account management with KYC/AML compliance and identity verification
- Transaction processing with real-time fraud detection and monitoring
- Investment services with portfolio management and trading capabilities
- Lending platform with credit scoring and loan management
- Regulatory compliance with automated reporting and audit trails
- Financial analytics with risk assessment and performance tracking
- Mobile-optimized interfaces with biometric authentication
- API integrations with banking, payment, and financial data providers
- Real-time notifications and alerts for account activities
- Comprehensive security measures with encryption and access controls

This module contains comprehensive templates for building financial technology applications with regulatory compliance, security, and modern fintech features.

## Templates

### Account and Transaction Management
- `account-management.md` - Account creation, KYC/AML verification, and account lifecycle management
- `transaction-processing.md` - Payment processing, transaction handling, and reconciliation
- `fraud-detection.md` - Real-time fraud monitoring, prevention, and risk assessment
- `financial-reporting.md` - Regulatory reporting, compliance tracking, and audit trails

### Investment and Lending
- `investment-management.md` - Portfolio tracking, trading capabilities, and investment analytics
- `lending-platform.md` - Loan applications, underwriting workflows, and loan management
- `credit-scoring.md` - Risk assessment, credit evaluation, and scoring algorithms
- `budgeting-tools.md` - Expense tracking, budget management, and financial planning

## Domain Coverage

This module provides comprehensive coverage for:
- **Account Management**: KYC/AML, identity verification, account linking
- **Transaction Processing**: Payment processing, fraud detection, reconciliation
- **Investment Services**: Portfolio management, trading, market data integration
- **Lending Services**: Credit scoring, loan origination, underwriting
- **Compliance**: Regulatory reporting, audit trails, data retention
- **Security**: Multi-factor authentication, encryption, fraud monitoring
- **Analytics**: Financial insights, risk assessment, performance tracking

## Integration Points

Templates in this module integrate with:
- Payment processors (Stripe, PayPal, banking APIs)
- Identity verification services (Jumio, Onfido)
- Credit bureaus and scoring services
- Regulatory reporting systems
- Banking and financial data providers
- Risk management platforms