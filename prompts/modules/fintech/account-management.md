# Account Management Template

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
Provides comprehensive patterns for financial account creation, KYC/AML verification, identity management, and account lifecycle operations in fintech applications.

## Context
Account management is the foundation of fintech applications, handling user onboarding, identity verification, and account lifecycle operations. Modern fintech platforms must implement robust KYC/AML compliance while providing seamless user experiences. This template addresses the complexity of building secure, compliant account systems that verify identities, prevent fraud, and meet regulatory requirements across jurisdictions.

## Instructions
1. Analyze account management requirements and regulatory compliance needs
2. Design secure account creation and onboarding workflows
3. Implement comprehensive KYC/AML verification processes
4. Build identity verification with document validation and biometric checks
5. Create account linking and aggregation capabilities
6. Add account lifecycle management with status tracking
7. Implement fraud detection and risk assessment systems
8. Build compliance reporting and audit trail mechanisms
9. Create customer communication and notification systems
10. Add account analytics and performance monitoring

## Examples

### Example 1: Secure Account Onboarding
```typescript
// Complete account creation with KYC verification
class AccountOnboardingService {
  async createAccount(request: AccountCreationRequest): Promise<Account> {
    // Validate customer data
    const validation = await this.validateAccountData(request);
    if (!validation.isValid) throw new ValidationError(validation.errors);
    
    // Create account
    const account = await this.accountRepository.create({
      ...request,
      status: 'pending_verification'
    });
    
    // Initiate KYC process
    await this.kycService.initiateVerification(account.id, request.documents);
    
    return account;
  }
}
```

### Example 2: KYC/AML Compliance System
```typescript
// Comprehensive KYC verification with multiple providers
class KYCComplianceService {
  async performKYCVerification(accountId: string, documents: Document[]): Promise<VerificationResult> {
    const [identityCheck, amlScreening, sanctionsCheck] = await Promise.all([
      this.identityProvider.verifyIdentity(documents),
      this.amlProvider.screenCustomer(accountId),
      this.sanctionsProvider.checkSanctions(accountId)
    ]);
    
    const overallResult = this.evaluateVerificationResults({
      identity: identityCheck,
      aml: amlScreening,
      sanctions: sanctionsCheck
    });
    
    await this.updateAccountVerificationStatus(accountId, overallResult);
    return overallResult;
  }
}
```

### Example 3: Account Aggregation and Linking
```typescript
// Bank account linking with real-time balance updates
class AccountAggregationService {
  async linkBankAccount(accountId: string, bankDetails: BankAccountDetails): Promise<LinkedAccount> {
    // Verify bank account ownership
    const verification = await this.bankVerificationService.verifyOwnership(bankDetails);
    
    if (verification.verified) {
      const linkedAccount = await this.createLinkedAccount(accountId, bankDetails);
      await this.scheduleBalanceSync(linkedAccount.id);
      return linkedAccount;
    }
    
    throw new VerificationError('Bank account ownership could not be verified');
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| kycProvider | string | KYC verification service | 'jumio' | Yes |
| amlScreening | boolean | Enable AML compliance checks | true | Yes |
| identityVerification | string | Identity verification level | 'enhanced' | No |
| documentTypes | array | Accepted document types | ['passport', 'license'] | Yes |
| biometricAuth | boolean | Enable biometric verification | false | No |
| accountLinking | boolean | Enable bank account linking | true | No |
| complianceReporting | boolean | Enable regulatory reporting | true | Yes |
| fraudMonitoring | boolean | Real-time fraud detection | true | Yes |
| auditTrails | boolean | Comprehensive audit logging | true | Yes |
| multiRegion | boolean | Multi-jurisdiction support | false | No |

## Expected Output
A comprehensive account management system featuring:
- Secure account creation with multi-step verification and validation
- KYC/AML compliance with automated document verification and screening
- Identity verification using biometric checks and liveness detection
- Bank account linking with ownership verification and balance aggregation
- Account lifecycle management with status tracking and automated workflows
- Real-time fraud detection with risk scoring and monitoring
- Regulatory compliance with automated reporting and audit trails
- Customer communication with notifications and status updates
- Account analytics with performance metrics and insights
- Multi-jurisdiction support for international compliance requirements

## Core Components

### 1. Account Creation and Onboarding

```typescript
interface AccountCreationService {
  createAccount(request: AccountCreationRequest): Promise<AccountCreationResult>;
  validateAccountData(data: AccountData): ValidationResult;
  initiateKYCProcess(accountId: string): Promise<KYCProcessResult>;
  sendWelcomeNotification(account: Account): Promise<void>;
}

interface AccountCreationRequest {
  personalInfo: PersonalInformation;
  contactInfo: ContactInformation;
  initialVerificationDocuments?: Document[];
  referralCode?: string;
  accountType: AccountType;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

interface PersonalInformation {
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ssn?: string; // For US customers
  nationalId?: string; // For international customers
  citizenship: string;
  residenceCountry: string;
}
```

### 2. KYC/AML Verification System

```typescript
interface KYCService {
  initiateVerification(accountId: string, documents: Document[]): Promise<VerificationResult>;
  checkAMLCompliance(customerData: CustomerData): Promise<AMLResult>;
  performIdentityVerification(identityData: IdentityData): Promise<IdentityVerificationResult>;
  updateVerificationStatus(accountId: string, status: VerificationStatus): Promise<void>;
  schedulePeriodicReview(accountId: string): Promise<void>;
}

interface Document {
  type: DocumentType; // PASSPORT, DRIVERS_LICENSE, UTILITY_BILL, etc.
  imageData: string; // Base64 encoded image
  metadata: DocumentMetadata;
  uploadTimestamp: Date;
}

interface VerificationResult {
  status: VerificationStatus;
  confidence: number;
  extractedData: ExtractedDocumentData;
  issues: VerificationIssue[];
  nextSteps: string[];
}

enum VerificationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  REQUIRES_MANUAL_REVIEW = 'requires_manual_review'
}
```

### 3. Identity Verification Integration

```typescript
interface IdentityVerificationProvider {
  // Integration with services like Jumio, Onfido, etc.
  submitForVerification(request: VerificationRequest): Promise<VerificationSubmissionResult>;
  getVerificationStatus(verificationId: string): Promise<VerificationStatusResult>;
  handleWebhookCallback(payload: WebhookPayload): Promise<void>;
}

interface VerificationRequest {
  accountId: string;
  documents: Document[];
  biometricData?: BiometricData;
  verificationLevel: VerificationLevel; // BASIC, ENHANCED, PREMIUM
}

interface BiometricData {
  faceImage?: string;
  voiceSample?: string;
  fingerprintData?: string;
}

enum VerificationLevel {
  BASIC = 'basic', // Document verification only
  ENHANCED = 'enhanced', // Document + liveness check
  PREMIUM = 'premium' // Document + biometric + background check
}
```

### 4. Account Linking and Aggregation

```typescript
interface AccountLinkingService {
  linkBankAccount(accountId: string, bankDetails: BankAccountDetails): Promise<LinkingResult>;
  verifyBankAccount(linkId: string, verificationMethod: VerificationMethod): Promise<VerificationResult>;
  aggregateAccountData(accountId: string): Promise<AggregatedAccountData>;
  syncAccountBalances(accountId: string): Promise<BalanceSyncResult>;
}

interface BankAccountDetails {
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: BankAccountType;
  ownerName: string;
}

interface AggregatedAccountData {
  linkedAccounts: LinkedAccount[];
  totalBalance: Money;
  recentTransactions: Transaction[];
  accountSummary: AccountSummary;
}

enum VerificationMethod {
  MICRO_DEPOSITS = 'micro_deposits',
  INSTANT_VERIFICATION = 'instant_verification',
  MANUAL_VERIFICATION = 'manual_verification'
}
```

### 5. Account Status and Lifecycle Management

```typescript
interface AccountLifecycleService {
  updateAccountStatus(accountId: string, status: AccountStatus, reason?: string): Promise<void>;
  suspendAccount(accountId: string, reason: SuspensionReason): Promise<SuspensionResult>;
  reactivateAccount(accountId: string): Promise<ReactivationResult>;
  closeAccount(accountId: string, reason: ClosureReason): Promise<ClosureResult>;
  handleDormantAccount(accountId: string): Promise<void>;
}

enum AccountStatus {
  ACTIVE = 'active',
  PENDING_VERIFICATION = 'pending_verification',
  SUSPENDED = 'suspended',
  FROZEN = 'frozen',
  CLOSED = 'closed',
  DORMANT = 'dormant'
}

interface SuspensionReason {
  type: SuspensionType;
  description: string;
  severity: SeverityLevel;
  requiresManualReview: boolean;
}

enum SuspensionType {
  FRAUD_SUSPECTED = 'fraud_suspected',
  COMPLIANCE_VIOLATION = 'compliance_violation',
  REGULATORY_REQUIREMENT = 'regulatory_requirement',
  CUSTOMER_REQUEST = 'customer_request'
}
```

## Implementation Guidelines

### Security Requirements
- Implement end-to-end encryption for all sensitive data
- Use secure document storage with access logging
- Implement multi-factor authentication for account access
- Maintain audit trails for all account operations
- Follow PCI DSS compliance for payment data handling

### Compliance Considerations
- Implement GDPR/CCPA compliance for data privacy
- Maintain KYC documentation retention policies
- Implement AML transaction monitoring
- Ensure regulatory reporting capabilities
- Follow local financial regulations (PSD2, Open Banking, etc.)

### Performance Optimization
- Implement caching for frequently accessed account data
- Use asynchronous processing for document verification
- Optimize database queries for account lookups
- Implement rate limiting for API endpoints
- Use CDN for document storage and retrieval

### Error Handling
- Implement comprehensive error logging and monitoring
- Provide clear error messages for verification failures
- Implement retry mechanisms for external service calls
- Handle network timeouts and service unavailability
- Provide fallback options for critical operations

## Integration Examples

### KYC Provider Integration (Jumio)
```typescript
class JumioKYCProvider implements IdentityVerificationProvider {
  async submitForVerification(request: VerificationRequest): Promise<VerificationSubmissionResult> {
    const jumioRequest = {
      customerInternalReference: request.accountId,
      workflowId: this.getWorkflowId(request.verificationLevel),
      userReference: request.accountId
    };
    
    const response = await this.jumioClient.createTransaction(jumioRequest);
    
    return {
      verificationId: response.transactionReference,
      redirectUrl: response.redirectUrl,
      status: 'initiated'
    };
  }
  
  async handleWebhookCallback(payload: WebhookPayload): Promise<void> {
    const verification = await this.processJumioCallback(payload);
    await this.updateAccountVerificationStatus(verification);
    await this.notifyCustomer(verification);
  }
}
```

### Bank Account Linking (Plaid)
```typescript
class PlaidAccountLinking implements AccountLinkingService {
  async linkBankAccount(accountId: string, bankDetails: BankAccountDetails): Promise<LinkingResult> {
    const linkToken = await this.plaidClient.createLinkToken({
      user: { client_user_id: accountId },
      client_name: 'Your Fintech App',
      products: ['transactions', 'auth'],
      country_codes: ['US']
    });
    
    return {
      linkToken: linkToken.link_token,
      status: 'pending_user_action'
    };
  }
  
  async aggregateAccountData(accountId: string): Promise<AggregatedAccountData> {
    const accounts = await this.getLinkedAccounts(accountId);
    const balances = await this.getAccountBalances(accounts);
    const transactions = await this.getRecentTransactions(accounts);
    
    return {
      linkedAccounts: accounts,
      totalBalance: this.calculateTotalBalance(balances),
      recentTransactions: transactions,
      accountSummary: this.generateSummary(accounts, balances)
    };
  }
}
```

## Configuration Parameters

### Environment Configuration
```yaml
# Account Management Service Configuration
account_service:
  kyc_provider: "jumio" # Options: jumio, onfido, shufti_pro
  verification_levels:
    basic: true
    enhanced: true
    premium: false
  document_storage:
    provider: "aws_s3" # Options: aws_s3, azure_blob, gcp_storage
    encryption: "aes_256"
    retention_days: 2555 # 7 years for compliance
  compliance:
    kyc_required: true
    aml_screening: true
    sanctions_check: true
    pep_screening: true
  notifications:
    welcome_email: true
    verification_updates: true
    status_changes: true
```

### Service Integration Parameters
```typescript
interface AccountServiceConfig {
  kycProvider: {
    name: 'jumio' | 'onfido' | 'shufti_pro';
    apiKey: string;
    apiSecret: string;
    webhookSecret: string;
    environment: 'sandbox' | 'production';
  };
  documentStorage: {
    provider: 'aws_s3' | 'azure_blob' | 'gcp_storage';
    bucket: string;
    region: string;
    encryptionKey: string;
  };
  compliance: {
    sanctionsListProvider: string;
    pepListProvider: string;
    amlRiskThreshold: number;
    manualReviewThreshold: number;
  };
}
```

## Configuration Examples

### Basic Account Service Setup
```typescript
// Basic configuration for development environment
const accountConfig: AccountServiceConfig = {
  kycProvider: {
    name: 'jumio',
    apiKey: process.env.JUMIO_API_KEY!,
    apiSecret: process.env.JUMIO_API_SECRET!,
    webhookSecret: process.env.JUMIO_WEBHOOK_SECRET!,
    environment: 'sandbox'
  },
  documentStorage: {
    provider: 'aws_s3',
    bucket: 'fintech-documents-dev',
    region: 'us-east-1',
    encryptionKey: process.env.DOCUMENT_ENCRYPTION_KEY!
  },
  compliance: {
    sanctionsListProvider: 'ofac',
    pepListProvider: 'world_check',
    amlRiskThreshold: 0.7,
    manualReviewThreshold: 0.5
  }
};

const accountService = new AccountManagementService(accountConfig);
```

### Production Configuration Example
```typescript
// Production configuration with enhanced security
const productionConfig: AccountServiceConfig = {
  kycProvider: {
    name: 'jumio',
    apiKey: process.env.JUMIO_PROD_API_KEY!,
    apiSecret: process.env.JUMIO_PROD_API_SECRET!,
    webhookSecret: process.env.JUMIO_PROD_WEBHOOK_SECRET!,
    environment: 'production'
  },
  documentStorage: {
    provider: 'aws_s3',
    bucket: 'fintech-documents-prod',
    region: 'us-east-1',
    encryptionKey: process.env.PROD_DOCUMENT_ENCRYPTION_KEY!
  },
  compliance: {
    sanctionsListProvider: 'ofac',
    pepListProvider: 'world_check',
    amlRiskThreshold: 0.8, // Stricter in production
    manualReviewThreshold: 0.3 // Lower threshold for manual review
  }
};
```

### Multi-Region Configuration
```typescript
// Configuration for multi-region deployment
const multiRegionConfig = {
  regions: {
    'us-east-1': {
      kycProvider: 'jumio',
      complianceRules: 'us_finra',
      documentRetention: 2555 // 7 years
    },
    'eu-west-1': {
      kycProvider: 'onfido',
      complianceRules: 'eu_mifid',
      documentRetention: 3650 // 10 years for EU
    }
  },
  globalSettings: {
    encryptionStandard: 'aes_256',
    auditLogging: true,
    realTimeMonitoring: true
  }
};
```

## Testing Strategy

### Unit Tests
- Test account creation validation logic
- Test KYC document processing
- Test account status transitions
- Test error handling scenarios

### Integration Tests
- Test KYC provider integrations
- Test bank account linking flows
- Test webhook processing
- Test compliance reporting

### Security Tests
- Test data encryption and decryption
- Test access control mechanisms
- Test audit trail generation
- Test PII data handling

## Monitoring and Analytics

### Key Metrics
- Account creation success rate
- KYC approval rate and processing time
- Account linking success rate
- Compliance violation detection rate
- Customer onboarding completion rate

### Alerts and Notifications
- Failed KYC verifications requiring manual review
- Suspicious account activity
- Compliance violations
- System integration failures
- High error rates in account operations

This template provides a comprehensive foundation for building secure, compliant account management systems in fintech applications while maintaining flexibility for different regulatory environments and business requirements.
