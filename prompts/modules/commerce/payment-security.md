# Payment Security and PCI Compliance Template

## Purpose

This template provides comprehensive patterns for implementing PCI DSS compliance, fraud prevention, and security best practices in payment processing systems to ensure secure handling of sensitive payment data.

## Context

Payment security is critical for any e-commerce application handling financial transactions. This template addresses the complexity of PCI DSS compliance requirements, fraud detection and prevention, secure data handling with tokenization, and real-time security monitoring to protect both businesses and customers from payment-related threats.

## Instructions
1. Analyze PCI DSS compliance requirements and security standards
2. Implement comprehensive data protection and tokenization systems
3. Build multi-layered fraud detection and prevention mechanisms
4. Create secure communication protocols and encryption standards
5. Establish strong authentication and access control systems
6. Implement real-time security monitoring and alerting
7. Build compliance reporting and audit trail systems
8. Create incident response and security breach procedures
9. Add security testing and vulnerability assessment processes
10. Ensure regulatory compliance across multiple jurisdictions

## Examples

### Example 1: PCI DSS Compliant Payment Processing
```typescript
// Secure payment processing with tokenization
class SecurePaymentProcessor {
  async processPayment(cardData: CardData): Promise<PaymentResult> {
    // Never store sensitive data - tokenize immediately
    const token = await this.tokenizeCardData(cardData);
    
    const paymentResult = await this.paymentProvider.processPayment({
      token: token.id,
      amount: cardData.amount,
      currency: cardData.currency
    });
    
    // Store only non-sensitive data
    await this.storePaymentRecord({
      tokenId: token.id,
      last4Digits: cardData.last4Digits,
      status: paymentResult.status
    });
    
    return paymentResult;
  }
}
```

### Example 2: Real-time Fraud Detection
```typescript
// Multi-layered fraud detection system
class FraudDetectionEngine {
  async analyzeTransaction(transaction: Transaction): Promise<FraudAnalysis> {
    const riskFactors = await Promise.all([
      this.checkVelocityRules(transaction),
      this.checkGeolocationRisk(transaction),
      this.checkDeviceFingerprint(transaction),
      this.checkBehavioralPatterns(transaction)
    ]);
    
    const riskScore = this.calculateRiskScore(riskFactors.flat());
    
    return {
      riskScore,
      riskLevel: this.determineRiskLevel(riskScore),
      riskFactors: riskFactors.flat(),
      recommendedAction: this.getRecommendedAction(riskScore)
    };
  }
}
```

### Example 3: Security Monitoring and Alerting
```typescript
// Comprehensive security monitoring system
class SecurityMonitor {
  async monitorSecurityEvents(): Promise<void> {
    const recentEvents = await this.getRecentSecurityEvents();
    const anomalies = await this.detectAnomalies(recentEvents);
    
    for (const anomaly of anomalies) {
      if (anomaly.severity === 'CRITICAL') {
        await this.triggerImmediateAlert(anomaly);
        await this.executeAutomaticResponse(anomaly);
      }
    }
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| pciComplianceLevel | string | PCI DSS compliance level (1-4) | 'Level 1' | Yes |
| encryptionStandard | string | Encryption algorithm standard | 'AES-256-GCM' | Yes |
| fraudDetection | boolean | Enable real-time fraud detection | true | Yes |
| securityMonitoring | boolean | Enable security event monitoring | true | Yes |
| accessControl | string | Access control method | 'RBAC' | No |
| sessionTimeout | number | Session timeout in minutes | 30 | No |
| mfaRequired | boolean | Require multi-factor authentication | true | No |
| auditLogging | boolean | Enable comprehensive audit logging | true | No |
| vulnerabilityScanning | boolean | Enable automated security scanning | true | No |
| incidentResponse | boolean | Enable automated incident response | false | No |

## Expected Output
A comprehensive payment security system featuring:
- Full PCI DSS compliance implementation with all 12 requirements
- Advanced fraud detection with machine learning and behavioral analysis
- Secure data handling with tokenization and encryption at rest/transit
- Multi-layered access control with role-based permissions and MFA
- Real-time security monitoring with automated threat detection
- Comprehensive audit logging and compliance reporting
- Incident response automation with threat containment
- Security testing integration with vulnerability assessments
- Regulatory compliance across multiple jurisdictions
- Security awareness training and policy enforcement tools

## Core Security Patterns

### 1. PCI DSS Compliance Framework

Implement the 12 PCI DSS requirements systematically:

```typescript
interface PCIComplianceFramework {
  // Requirement 1: Install and maintain firewall configuration
  firewallConfiguration: FirewallConfig;
  
  // Requirement 2: Do not use vendor-supplied defaults
  securityConfiguration: SecurityConfig;
  
  // Requirement 3: Protect stored cardholder data
  dataProtection: DataProtectionConfig;
  
  // Requirement 4: Encrypt transmission of cardholder data
  encryptionConfig: EncryptionConfig;
  
  // Requirement 5: Protect all systems against malware
  malwareProtection: MalwareProtectionConfig;
  
  // Requirement 6: Develop and maintain secure systems
  secureSystemsConfig: SecureSystemsConfig;
  
  // Requirements 7-12: Access control, monitoring, testing, policies
  accessControl: AccessControlConfig;
  monitoring: MonitoringConfig;
  testing: SecurityTestingConfig;
  policies: SecurityPoliciesConfig;
}
```

### 2. Secure Data Handling

Never store sensitive payment data - use tokenization instead:

```typescript
// Payment data tokenization
interface PaymentTokenization {
  tokenizeCard(cardData: CardData): Promise<PaymentToken>;
  detokenizeCard(token: string): Promise<CardData>; // Only for authorized operations
  validateToken(token: string): Promise<boolean>;
  expireToken(token: string): Promise<void>;
}

// Secure card data structure (for tokenization only)
interface CardData {
  // Never store these in your database
  cardNumber: string; // PAN (Primary Account Number)
  expiryMonth: string;
  expiryYear: string;
  cvv: string; // Never store CVV
  
  // Safe to store after tokenization
  last4Digits: string;
  cardBrand: string;
  cardType: string;
  tokenId: string;
}

// Example tokenization implementation
class SecurePaymentHandler {
  async processPayment(cardData: CardData): Promise<PaymentResult> {
    // 1. Validate card data
    const validation = await this.validateCardData(cardData);
    if (!validation.isValid) {
      throw new PaymentError('Invalid card data', validation.errors);
    }
    
    // 2. Tokenize sensitive data immediately
    const token = await this.paymentProvider.tokenizeCard(cardData);
    
    // 3. Process payment using token
    const paymentResult = await this.paymentProvider.processPayment(token);
    
    // 4. Store only non-sensitive data
    await this.storePaymentRecord({
      tokenId: token.id,
      last4Digits: cardData.last4Digits,
      cardBrand: cardData.cardBrand,
      amount: paymentResult.amount,
      status: paymentResult.status
    });
    
    return paymentResult;
  }
}
```

### 3. Fraud Detection and Prevention

Implement multi-layered fraud detection:

```typescript
interface FraudDetectionEngine {
  analyzeTransaction(transaction: Transaction): Promise<FraudAnalysis>;
  updateRiskProfile(customerId: string, transaction: Transaction): Promise<void>;
  blockSuspiciousActivity(analysis: FraudAnalysis): Promise<BlockResult>;
  generateFraudAlert(analysis: FraudAnalysis): Promise<void>;
}

interface FraudAnalysis {
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: RiskFactor[];
  recommendedAction: 'APPROVE' | 'REVIEW' | 'DECLINE' | 'BLOCK';
  confidence: number;
}

interface RiskFactor {
  type: 'VELOCITY' | 'GEOLOCATION' | 'DEVICE' | 'BEHAVIORAL' | 'NETWORK';
  description: string;
  severity: number;
  evidence: any;
}

// Fraud detection rules
class FraudDetectionRules {
  // Velocity checks
  async checkTransactionVelocity(customerId: string, amount: number): Promise<RiskFactor[]> {
    const recentTransactions = await this.getRecentTransactions(customerId, '1h');
    const totalAmount = recentTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    
    const risks: RiskFactor[] = [];
    
    if (recentTransactions.length > 5) {
      risks.push({
        type: 'VELOCITY',
        description: 'High transaction frequency',
        severity: 70,
        evidence: { count: recentTransactions.length, timeframe: '1h' }
      });
    }
    
    if (totalAmount > 1000) {
      risks.push({
        type: 'VELOCITY',
        description: 'High transaction volume',
        severity: 60,
        evidence: { amount: totalAmount, timeframe: '1h' }
      });
    }
    
    return risks;
  }
  
  // Geolocation checks
  async checkGeolocation(customerId: string, ipAddress: string): Promise<RiskFactor[]> {
    const customerLocation = await this.getCustomerLocation(customerId);
    const transactionLocation = await this.getLocationFromIP(ipAddress);
    
    const distance = this.calculateDistance(customerLocation, transactionLocation);
    
    if (distance > 1000) { // More than 1000km from usual location
      return [{
        type: 'GEOLOCATION',
        description: 'Transaction from unusual location',
        severity: 80,
        evidence: { distance, customerLocation, transactionLocation }
      }];
    }
    
    return [];
  }
  
  // Device fingerprinting
  async checkDeviceFingerprint(deviceFingerprint: string, customerId: string): Promise<RiskFactor[]> {
    const knownDevices = await this.getCustomerDevices(customerId);
    
    if (!knownDevices.includes(deviceFingerprint)) {
      return [{
        type: 'DEVICE',
        description: 'Transaction from unknown device',
        severity: 50,
        evidence: { deviceFingerprint, knownDevices: knownDevices.length }
      }];
    }
    
    return [];
  }
}
```

### 4. Secure Communication

Implement end-to-end encryption for all payment communications:

```typescript
// TLS/SSL configuration
const tlsConfig = {
  minVersion: 'TLSv1.2',
  ciphers: [
    'ECDHE-RSA-AES256-GCM-SHA384',
    'ECDHE-RSA-AES128-GCM-SHA256',
    'ECDHE-RSA-AES256-SHA384',
    'ECDHE-RSA-AES128-SHA256'
  ],
  honorCipherOrder: true,
  secureProtocol: 'TLSv1_2_method'
};

// API endpoint security
class SecurePaymentAPI {
  constructor() {
    this.app.use(helmet()); // Security headers
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(','),
      credentials: true,
      methods: ['POST'], // Only allow POST for payment endpoints
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID']
    }));
    
    // Rate limiting
    this.app.use('/api/payments', rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many payment requests from this IP'
    }));
  }
  
  // Secure payment endpoint
  async processPayment(req: Request, res: Response) {
    try {
      // 1. Validate request signature
      const isValidSignature = await this.validateRequestSignature(req);
      if (!isValidSignature) {
        return res.status(401).json({ error: 'Invalid request signature' });
      }
      
      // 2. Validate and sanitize input
      const paymentData = await this.validatePaymentData(req.body);
      
      // 3. Process payment securely
      const result = await this.securePaymentProcessor.process(paymentData);
      
      // 4. Log security event
      await this.securityLogger.logPaymentAttempt({
        customerId: paymentData.customerId,
        amount: paymentData.amount,
        result: result.status,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      res.json({ success: true, transactionId: result.transactionId });
    } catch (error) {
      await this.securityLogger.logSecurityEvent({
        type: 'PAYMENT_ERROR',
        error: error.message,
        ipAddress: req.ip,
        severity: 'HIGH'
      });
      
      res.status(500).json({ error: 'Payment processing failed' });
    }
  }
}
```

### 5. Access Control and Authentication

Implement strong authentication and authorization:

```typescript
// Multi-factor authentication for payment operations
interface PaymentAuthentication {
  requireMFA: boolean;
  allowedMethods: ('SMS' | 'EMAIL' | 'TOTP' | 'BIOMETRIC')[];
  sessionTimeout: number;
  maxFailedAttempts: number;
}

// Role-based access control for payment systems
enum PaymentRole {
  CUSTOMER = 'customer',
  MERCHANT = 'merchant',
  PAYMENT_PROCESSOR = 'payment_processor',
  COMPLIANCE_OFFICER = 'compliance_officer',
  SECURITY_ADMIN = 'security_admin'
}

interface PaymentPermission {
  role: PaymentRole;
  actions: PaymentAction[];
  restrictions: PaymentRestriction[];
}

enum PaymentAction {
  PROCESS_PAYMENT = 'process_payment',
  REFUND_PAYMENT = 'refund_payment',
  VIEW_PAYMENT_DETAILS = 'view_payment_details',
  EXPORT_PAYMENT_DATA = 'export_payment_data',
  MODIFY_PAYMENT_SETTINGS = 'modify_payment_settings'
}

// Secure session management
class SecureSessionManager {
  async createPaymentSession(userId: string, permissions: PaymentPermission[]): Promise<PaymentSession> {
    const session = {
      id: this.generateSecureSessionId(),
      userId,
      permissions,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      ipAddress: this.getCurrentIP(),
      deviceFingerprint: this.getDeviceFingerprint()
    };
    
    await this.storeSession(session);
    return session;
  }
  
  async validatePaymentSession(sessionId: string, requiredAction: PaymentAction): Promise<boolean> {
    const session = await this.getSession(sessionId);
    
    if (!session || session.expiresAt < new Date()) {
      return false;
    }
    
    return session.permissions.some(permission => 
      permission.actions.includes(requiredAction)
    );
  }
}
```

### 6. Security Monitoring and Alerting

Implement comprehensive security monitoring:

```typescript
interface SecurityMonitoring {
  logSecurityEvent(event: SecurityEvent): Promise<void>;
  detectAnomalies(events: SecurityEvent[]): Promise<Anomaly[]>;
  generateSecurityAlert(anomaly: Anomaly): Promise<void>;
  createSecurityReport(timeframe: TimeFrame): Promise<SecurityReport>;
}

interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  timestamp: Date;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  details: any;
}

enum SecurityEventType {
  PAYMENT_ATTEMPT = 'payment_attempt',
  PAYMENT_FAILURE = 'payment_failure',
  FRAUD_DETECTED = 'fraud_detected',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  DATA_BREACH_ATTEMPT = 'data_breach_attempt',
  COMPLIANCE_VIOLATION = 'compliance_violation'
}

// Real-time security monitoring
class SecurityMonitor {
  async monitorPaymentSecurity() {
    // Monitor for suspicious patterns
    setInterval(async () => {
      const recentEvents = await this.getRecentSecurityEvents('5m');
      const anomalies = await this.detectAnomalies(recentEvents);
      
      for (const anomaly of anomalies) {
        if (anomaly.severity === 'CRITICAL') {
          await this.triggerImmediateAlert(anomaly);
        }
      }
    }, 60000); // Check every minute
  }
  
  async detectAnomalies(events: SecurityEvent[]): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Detect unusual payment patterns
    const paymentEvents = events.filter(e => e.type === SecurityEventType.PAYMENT_ATTEMPT);
    if (paymentEvents.length > 100) { // More than 100 payments in 5 minutes
      anomalies.push({
        type: 'HIGH_PAYMENT_VOLUME',
        severity: 'HIGH',
        description: 'Unusually high payment volume detected',
        evidence: { count: paymentEvents.length, timeframe: '5m' }
      });
    }
    
    // Detect multiple failures from same IP
    const failuresByIP = this.groupEventsByIP(
      events.filter(e => e.type === SecurityEventType.PAYMENT_FAILURE)
    );
    
    for (const [ip, failures] of failuresByIP.entries()) {
      if (failures.length > 10) {
        anomalies.push({
          type: 'MULTIPLE_PAYMENT_FAILURES',
          severity: 'CRITICAL',
          description: 'Multiple payment failures from single IP',
          evidence: { ipAddress: ip, failureCount: failures.length }
        });
      }
    }
    
    return anomalies;
  }
}
```

## Implementation Checklist

### PCI DSS Compliance
- [ ] Implement secure network architecture with firewalls
- [ ] Change default passwords and security parameters
- [ ] Protect stored cardholder data with encryption
- [ ] Encrypt transmission of cardholder data across networks
- [ ] Use and regularly update anti-virus software
- [ ] Develop and maintain secure systems and applications
- [ ] Restrict access to cardholder data by business need-to-know
- [ ] Assign unique ID to each person with computer access
- [ ] Restrict physical access to cardholder data
- [ ] Track and monitor all access to network resources
- [ ] Regularly test security systems and processes
- [ ] Maintain information security policy

### Fraud Prevention
- [ ] Implement real-time fraud detection
- [ ] Set up velocity checks and transaction limits
- [ ] Configure geolocation-based risk assessment
- [ ] Implement device fingerprinting
- [ ] Set up behavioral analysis
- [ ] Create fraud alert system
- [ ] Implement manual review workflows

### Security Infrastructure
- [ ] Configure TLS/SSL with strong ciphers
- [ ] Implement API rate limiting
- [ ] Set up Web Application Firewall (WAF)
- [ ] Configure security headers (HSTS, CSP, etc.)
- [ ] Implement input validation and sanitization
- [ ] Set up secure logging and monitoring
- [ ] Configure automated security scanning

### Access Control
- [ ] Implement multi-factor authentication
- [ ] Set up role-based access control
- [ ] Configure session management
- [ ] Implement API authentication
- [ ] Set up audit logging
- [ ] Configure password policies
- [ ] Implement account lockout mechanisms

## Configuration Parameters

```yaml
security_config:
  pci_compliance:
    enabled: true
    level: "Level 1" # Based on transaction volume
    assessment_frequency: "annual"
    
  fraud_detection:
    enabled: true
    risk_threshold: 70
    auto_decline_threshold: 90
    review_threshold: 50
    
  encryption:
    algorithm: "AES-256-GCM"
    key_rotation_interval: "90d"
    tls_version: "1.2"
    
  monitoring:
    log_retention: "7y" # PCI requirement
    alert_thresholds:
      failed_payments: 10
      high_risk_transactions: 5
      unusual_patterns: 3
    
  access_control:
    session_timeout: "30m"
    max_failed_attempts: 3
    mfa_required: true
    password_policy:
      min_length: 12
      require_special_chars: true
      require_numbers: true
      require_uppercase: true
```

## Integration Points

- **Payment Processing**: Secure all payment provider integrations
- **Customer Management**: Implement secure customer data handling
- **Order Management**: Secure order and payment data correlation
- **Notification System**: Secure payment confirmation communications
- **Analytics**: Implement privacy-compliant payment analytics
- **Compliance System**: Integrate with regulatory reporting systems

## Success Metrics

- PCI DSS compliance score: 100%
- Fraud detection accuracy: >95%
- False positive rate: <5%
- Security incident response time: <15 minutes
- Payment data breach incidents: 0
- Compliance audit pass rate: 100%

## Common Security Pitfalls to Avoid

1. **Storing sensitive payment data**: Never store PAN, CVV, or full track data
2. **Weak encryption**: Use strong, industry-standard encryption algorithms
3. **Inadequate access controls**: Implement principle of least privilege
4. **Missing fraud detection**: Always implement real-time fraud monitoring
5. **Poor session management**: Use secure session handling practices
6. **Insufficient logging**: Log all security-relevant events
7. **Weak authentication**: Implement multi-factor authentication
8. **Missing security updates**: Keep all systems and dependencies updated

## Related Templates

- `payment-processing.md` - Core payment integration patterns
- `payment-methods.md` - Secure payment method handling
- `customer-management.md` - Secure customer data management
- `compliance-reporting.md` - Regulatory compliance patterns
- `security-monitoring.md` - Security monitoring and alerting