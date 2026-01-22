# Security Testing Template

## Purpose

This template provides comprehensive patterns for implementing security testing including vulnerability scanning, penetration testing, compliance testing, and threat modeling. It covers automated security checks, manual testing procedures, and integration with security tools for both web and mobile applications.


## Instructions

1. Review the requirements and context.
2. Apply the specified patterns and configurations.
3. Validate the implementation against expected outputs.

## Context

Security testing is essential for identifying vulnerabilities before they can be exploited. This template addresses the implementation of security test suites that cover OWASP Top 10, authentication/authorization testing, input validation, and security compliance requirements.

## Core Components

### Security Test Manager Interface

## Examples

```typescript
interface SecurityTestManager {
  runVulnerabilityScan(config: ScanConfig): Promise<VulnerabilityReport>;
  runPenetrationTest(config: PenTestConfig): Promise<PenTestReport>;
  runComplianceCheck(framework: ComplianceFramework): Promise<ComplianceReport>;
  runThreatModel(application: ApplicationModel): Promise<ThreatModelReport>;
  generateSecurityReport(results: SecurityTestResults): Promise<SecurityReport>;
}

interface ScanConfig {
  targetUrl: string;
  scanType: ScanType;
  depth: ScanDepth;
  excludePatterns: string[];
  authentication?: AuthConfig;
  rateLimit?: number;
}


enum ScanType {
  PASSIVE = 'passive',
  ACTIVE = 'active',
  FULL = 'full'
}

enum ScanDepth {
  QUICK = 'quick',
  STANDARD = 'standard',
  DEEP = 'deep'
}

interface VulnerabilityReport {
  scanId: string;
  targetUrl: string;
  startTime: Date;
  endTime: Date;
  vulnerabilities: Vulnerability[];
  summary: VulnerabilitySummary;
  recommendations: SecurityRecommendation[];
}

interface Vulnerability {
  id: string;
  name: string;
  severity: Severity;
  category: VulnerabilityCategory;
  description: string;
  location: VulnerabilityLocation;
  evidence: string;
  remediation: string;
  references: string[];
  cvss?: CVSSScore;
}

enum Severity {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
  INFO = 'info'
}

enum VulnerabilityCategory {
  INJECTION = 'injection',
  BROKEN_AUTH = 'broken_authentication',
  SENSITIVE_DATA = 'sensitive_data_exposure',
  XXE = 'xml_external_entities',
  BROKEN_ACCESS = 'broken_access_control',
  SECURITY_MISCONFIG = 'security_misconfiguration',
  XSS = 'cross_site_scripting',
  INSECURE_DESERIALIZATION = 'insecure_deserialization',
  VULNERABLE_COMPONENTS = 'vulnerable_components',
  INSUFFICIENT_LOGGING = 'insufficient_logging'
}
```

### Vulnerability Scanner Service

```typescript
class VulnerabilityScanner {
  private scanners: Map<VulnerabilityCategory, CategoryScanner> = new Map();

  constructor() {
    this.initializeScanners();
  }

  async scan(config: ScanConfig): Promise<VulnerabilityReport> {
    const scanId = crypto.randomUUID();
    const startTime = new Date();
    const vulnerabilities: Vulnerability[] = [];

    // Crawl target to discover endpoints
    const endpoints = await this.crawlTarget(config.targetUrl, config.depth);

    // Run category-specific scanners
    for (const [category, scanner] of this.scanners) {
      const categoryVulns = await scanner.scan(endpoints, config);
      vulnerabilities.push(...categoryVulns);
    }

    const endTime = new Date();

    return {
      scanId,
      targetUrl: config.targetUrl,
      startTime,
      endTime,
      vulnerabilities,
      summary: this.generateSummary(vulnerabilities),
      recommendations: this.generateRecommendations(vulnerabilities)
    };
  }

  private initializeScanners(): void {
    this.scanners.set(VulnerabilityCategory.INJECTION, new InjectionScanner());
    this.scanners.set(VulnerabilityCategory.XSS, new XSSScanner());
    this.scanners.set(VulnerabilityCategory.BROKEN_AUTH, new AuthenticationScanner());
    this.scanners.set(VulnerabilityCategory.BROKEN_ACCESS, new AccessControlScanner());
    this.scanners.set(VulnerabilityCategory.SECURITY_MISCONFIG, new MisconfigurationScanner());
  }
}

class InjectionScanner implements CategoryScanner {
  private payloads = {
    sql: ["' OR '1'='1", "'; DROP TABLE users;--", "1' AND '1'='1"],
    nosql: ['{"$gt": ""}', '{"$ne": null}'],
    command: ['; ls -la', '| cat /etc/passwd', '`whoami`'],
    ldap: ['*)(uid=*))(|(uid=*', '*)(&']
  };

  async scan(endpoints: Endpoint[], config: ScanConfig): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    for (const endpoint of endpoints) {
      for (const param of endpoint.parameters) {
        // Test SQL injection
        const sqlVulns = await this.testSQLInjection(endpoint, param, config);
        vulnerabilities.push(...sqlVulns);

        // Test NoSQL injection
        const nosqlVulns = await this.testNoSQLInjection(endpoint, param, config);
        vulnerabilities.push(...nosqlVulns);

        // Test command injection
        const cmdVulns = await this.testCommandInjection(endpoint, param, config);
        vulnerabilities.push(...cmdVulns);
      }
    }

    return vulnerabilities;
  }

  private async testSQLInjection(
    endpoint: Endpoint,
    param: Parameter,
    config: ScanConfig
  ): Promise<Vulnerability[]> {
    const vulnerabilities: Vulnerability[] = [];

    for (const payload of this.payloads.sql) {
      const response = await this.sendRequest(endpoint, param, payload, config);
      
      if (this.detectSQLInjection(response)) {
        vulnerabilities.push({
          id: crypto.randomUUID(),
          name: 'SQL Injection',
          severity: Severity.CRITICAL,
          category: VulnerabilityCategory.INJECTION,
          description: `SQL injection vulnerability detected in parameter ${param.name}`,
          location: {
            url: endpoint.url,
            method: endpoint.method,
            parameter: param.name
          },
          evidence: `Payload: ${payload}\nResponse indicates SQL error or unexpected behavior`,
          remediation: 'Use parameterized queries or prepared statements. Never concatenate user input into SQL queries.',
          references: ['https://owasp.org/www-community/attacks/SQL_Injection']
        });
      }
    }

    return vulnerabilities;
  }
}
```


### Authentication Testing Service

```typescript
class AuthenticationTester {
  async testAuthentication(config: AuthTestConfig): Promise<AuthTestReport> {
    const results: AuthTestResult[] = [];

    // Test password policies
    results.push(await this.testPasswordPolicy(config));

    // Test brute force protection
    results.push(await this.testBruteForceProtection(config));

    // Test session management
    results.push(await this.testSessionManagement(config));

    // Test credential storage
    results.push(await this.testCredentialStorage(config));

    // Test multi-factor authentication
    if (config.mfaEnabled) {
      results.push(await this.testMFA(config));
    }

    return {
      testCount: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      results,
      recommendations: this.generateAuthRecommendations(results)
    };
  }

  private async testBruteForceProtection(config: AuthTestConfig): Promise<AuthTestResult> {
    const maxAttempts = 10;
    let lockedOut = false;
    let attemptCount = 0;

    for (let i = 0; i < maxAttempts; i++) {
      const response = await this.attemptLogin(config.loginUrl, {
        username: config.testUsername,
        password: `wrong_password_${i}`
      });

      attemptCount++;

      if (response.status === 429 || response.body.includes('locked')) {
        lockedOut = true;
        break;
      }
    }

    return {
      testName: 'Brute Force Protection',
      passed: lockedOut && attemptCount <= 5,
      details: lockedOut
        ? `Account locked after ${attemptCount} failed attempts`
        : `No lockout detected after ${maxAttempts} failed attempts`,
      severity: lockedOut ? Severity.INFO : Severity.HIGH,
      recommendation: lockedOut
        ? 'Brute force protection is working correctly'
        : 'Implement account lockout after 3-5 failed login attempts'
    };
  }

  private async testSessionManagement(config: AuthTestConfig): Promise<AuthTestResult> {
    const issues: string[] = [];

    // Login and get session
    const loginResponse = await this.login(config);
    const sessionToken = this.extractSessionToken(loginResponse);

    // Test session fixation
    const preAuthSession = await this.getPreAuthSession(config.loginUrl);
    const postAuthSession = this.extractSessionToken(loginResponse);
    
    if (preAuthSession === postAuthSession) {
      issues.push('Session fixation vulnerability: session ID not regenerated after login');
    }

    // Test session timeout
    await this.sleep(config.sessionTimeout + 1000);
    const timeoutResponse = await this.makeAuthenticatedRequest(config.protectedUrl, sessionToken);
    
    if (timeoutResponse.status !== 401) {
      issues.push('Session does not expire after configured timeout');
    }

    // Test secure cookie flags
    const cookies = this.parseCookies(loginResponse.headers['set-cookie']);
    const sessionCookie = cookies.find(c => c.name === config.sessionCookieName);
    
    if (sessionCookie) {
      if (!sessionCookie.httpOnly) {
        issues.push('Session cookie missing HttpOnly flag');
      }
      if (!sessionCookie.secure) {
        issues.push('Session cookie missing Secure flag');
      }
      if (!sessionCookie.sameSite) {
        issues.push('Session cookie missing SameSite attribute');
      }
    }

    return {
      testName: 'Session Management',
      passed: issues.length === 0,
      details: issues.length > 0 ? issues.join('; ') : 'All session management tests passed',
      severity: issues.length > 0 ? Severity.HIGH : Severity.INFO,
      recommendation: issues.join('\n')
    };
  }
}
```

### Access Control Testing Service

```typescript
class AccessControlTester {
  async testAccessControl(config: AccessControlTestConfig): Promise<AccessControlReport> {
    const results: AccessControlTestResult[] = [];

    // Test horizontal privilege escalation
    results.push(await this.testHorizontalEscalation(config));

    // Test vertical privilege escalation
    results.push(await this.testVerticalEscalation(config));

    // Test IDOR vulnerabilities
    results.push(await this.testIDOR(config));

    // Test function-level access control
    results.push(await this.testFunctionLevelAccess(config));

    return {
      results,
      vulnerabilities: results.filter(r => !r.passed),
      summary: this.generateAccessControlSummary(results)
    };
  }

  private async testIDOR(config: AccessControlTestConfig): Promise<AccessControlTestResult> {
    const vulnerabilities: IDORVulnerability[] = [];

    for (const endpoint of config.resourceEndpoints) {
      // Get resource as owner
      const ownerResponse = await this.getResource(endpoint, config.ownerToken);
      const resourceId = this.extractResourceId(ownerResponse);

      // Try to access as different user
      const attackerResponse = await this.getResource(
        endpoint.replace(':id', resourceId),
        config.attackerToken
      );

      if (attackerResponse.status === 200) {
        vulnerabilities.push({
          endpoint,
          resourceId,
          description: 'Unauthorized access to resource belonging to another user'
        });
      }

      // Try to modify as different user
      const modifyResponse = await this.modifyResource(
        endpoint.replace(':id', resourceId),
        config.attackerToken,
        { modified: true }
      );

      if (modifyResponse.status === 200) {
        vulnerabilities.push({
          endpoint,
          resourceId,
          description: 'Unauthorized modification of resource belonging to another user'
        });
      }
    }

    return {
      testName: 'Insecure Direct Object Reference (IDOR)',
      passed: vulnerabilities.length === 0,
      vulnerabilities,
      severity: vulnerabilities.length > 0 ? Severity.HIGH : Severity.INFO,
      recommendation: vulnerabilities.length > 0
        ? 'Implement proper authorization checks for all resource access'
        : 'IDOR protection is working correctly'
    };
  }
}
```


## Implementation Patterns

### OWASP ZAP Integration Pattern

```typescript
class ZAPSecurityScanner {
  private zapClient: ZAPClient;
  private apiKey: string;

  constructor(zapUrl: string, apiKey: string) {
    this.zapClient = new ZAPClient(zapUrl);
    this.apiKey = apiKey;
  }

  async runFullScan(targetUrl: string): Promise<ZAPScanReport> {
    // Start new session
    await this.zapClient.core.newSession('', true, this.apiKey);

    // Spider the target
    const spiderId = await this.zapClient.spider.scan(targetUrl, '', '', '', this.apiKey);
    await this.waitForSpider(spiderId);

    // Run active scan
    const scanId = await this.zapClient.ascan.scan(targetUrl, '', '', '', '', '', this.apiKey);
    await this.waitForActiveScan(scanId);

    // Get alerts
    const alerts = await this.zapClient.core.alerts(targetUrl, '', '', '', this.apiKey);

    return {
      targetUrl,
      alerts: this.processAlerts(alerts),
      summary: this.generateSummary(alerts)
    };
  }

  private processAlerts(alerts: ZAPAlert[]): ProcessedAlert[] {
    return alerts.map(alert => ({
      id: alert.id,
      name: alert.alert,
      risk: this.mapRisk(alert.risk),
      confidence: alert.confidence,
      url: alert.url,
      description: alert.description,
      solution: alert.solution,
      reference: alert.reference,
      cweid: alert.cweid,
      wascid: alert.wascid
    }));
  }

  private mapRisk(risk: string): Severity {
    const riskMap: Record<string, Severity> = {
      'High': Severity.HIGH,
      'Medium': Severity.MEDIUM,
      'Low': Severity.LOW,
      'Informational': Severity.INFO
    };
    return riskMap[risk] || Severity.INFO;
  }
}
```

### Dependency Vulnerability Scanning

```typescript
class DependencyScanner {
  async scanDependencies(projectPath: string): Promise<DependencyReport> {
    const packageJson = await this.readPackageJson(projectPath);
    const lockFile = await this.readLockFile(projectPath);
    
    const vulnerabilities: DependencyVulnerability[] = [];

    // Check against vulnerability databases
    const allDependencies = this.extractAllDependencies(lockFile);
    
    for (const dep of allDependencies) {
      const vulns = await this.checkVulnerabilityDatabase(dep.name, dep.version);
      vulnerabilities.push(...vulns.map(v => ({
        ...v,
        package: dep.name,
        installedVersion: dep.version,
        path: dep.path
      })));
    }

    return {
      totalDependencies: allDependencies.length,
      vulnerabilities,
      summary: this.generateDependencySummary(vulnerabilities),
      recommendations: this.generateUpgradeRecommendations(vulnerabilities)
    };
  }

  private async checkVulnerabilityDatabase(
    packageName: string,
    version: string
  ): Promise<VulnerabilityInfo[]> {
    // Check npm audit database
    const npmVulns = await this.checkNpmAudit(packageName, version);
    
    // Check Snyk database
    const snykVulns = await this.checkSnykDatabase(packageName, version);
    
    // Check GitHub Advisory Database
    const ghVulns = await this.checkGitHubAdvisory(packageName, version);
    
    // Deduplicate and merge
    return this.mergeVulnerabilities([...npmVulns, ...snykVulns, ...ghVulns]);
  }

  private generateUpgradeRecommendations(
    vulnerabilities: DependencyVulnerability[]
  ): UpgradeRecommendation[] {
    const recommendations: UpgradeRecommendation[] = [];
    const groupedByPackage = this.groupByPackage(vulnerabilities);

    for (const [packageName, vulns] of Object.entries(groupedByPackage)) {
      const highestSeverity = this.getHighestSeverity(vulns);
      const fixedVersion = this.findFixedVersion(vulns);

      recommendations.push({
        package: packageName,
        currentVersion: vulns[0].installedVersion,
        recommendedVersion: fixedVersion,
        severity: highestSeverity,
        vulnerabilityCount: vulns.length,
        breaking: this.isBreakingChange(vulns[0].installedVersion, fixedVersion)
      });
    }

    return recommendations.sort((a, b) => 
      this.severityOrder(b.severity) - this.severityOrder(a.severity)
    );
  }
}
```


## Integration Points

### CI/CD Security Integration

```typescript
interface SecurityCIIntegration {
  runSecurityGate(config: SecurityGateConfig): Promise<SecurityGateResult>;
  blockOnCritical(vulnerabilities: Vulnerability[]): boolean;
  generateSecurityBadge(report: SecurityReport): string;
  notifySecurityTeam(vulnerabilities: Vulnerability[]): Promise<void>;
}

class GitHubSecurityIntegration implements SecurityCIIntegration {
  async runSecurityGate(config: SecurityGateConfig): Promise<SecurityGateResult> {
    const results: SecurityCheckResult[] = [];

    // Run SAST (Static Application Security Testing)
    if (config.enableSAST) {
      const sastResult = await this.runSAST(config.sourcePath);
      results.push({ type: 'SAST', ...sastResult });
    }

    // Run DAST (Dynamic Application Security Testing)
    if (config.enableDAST && config.deploymentUrl) {
      const dastResult = await this.runDAST(config.deploymentUrl);
      results.push({ type: 'DAST', ...dastResult });
    }

    // Run dependency scanning
    if (config.enableDependencyScan) {
      const depResult = await this.runDependencyScan(config.sourcePath);
      results.push({ type: 'Dependencies', ...depResult });
    }

    // Run secrets scanning
    if (config.enableSecretsScan) {
      const secretsResult = await this.runSecretsScan(config.sourcePath);
      results.push({ type: 'Secrets', ...secretsResult });
    }

    const allVulnerabilities = results.flatMap(r => r.vulnerabilities);
    const shouldBlock = this.blockOnCritical(allVulnerabilities);

    // Create GitHub check run
    await this.createCheckRun(results, shouldBlock);

    // Create security issues for critical vulnerabilities
    if (config.createIssues) {
      await this.createSecurityIssues(allVulnerabilities.filter(v => 
        v.severity === Severity.CRITICAL || v.severity === Severity.HIGH
      ));
    }

    return {
      passed: !shouldBlock,
      results,
      totalVulnerabilities: allVulnerabilities.length,
      criticalCount: allVulnerabilities.filter(v => v.severity === Severity.CRITICAL).length,
      highCount: allVulnerabilities.filter(v => v.severity === Severity.HIGH).length
    };
  }

  blockOnCritical(vulnerabilities: Vulnerability[]): boolean {
    return vulnerabilities.some(v => 
      v.severity === Severity.CRITICAL || 
      (v.severity === Severity.HIGH && v.exploitable)
    );
  }
}
```

### SIEM Integration

```typescript
class SIEMSecurityIntegration {
  async sendSecurityEvents(report: SecurityReport): Promise<void> {
    const events = this.convertToSIEMEvents(report);
    
    for (const event of events) {
      await this.siemClient.sendEvent({
        timestamp: new Date().toISOString(),
        source: 'security-testing',
        eventType: 'vulnerability_detected',
        severity: event.severity,
        data: {
          vulnerabilityId: event.id,
          name: event.name,
          category: event.category,
          location: event.location,
          cvss: event.cvss
        }
      });
    }
  }

  private convertToSIEMEvents(report: SecurityReport): SIEMEvent[] {
    return report.vulnerabilities.map(vuln => ({
      id: vuln.id,
      name: vuln.name,
      severity: this.mapToSIEMSeverity(vuln.severity),
      category: vuln.category,
      location: vuln.location,
      cvss: vuln.cvss
    }));
  }
}
```

## Security Considerations

### Secure Test Execution

```typescript
class SecureSecurityTester {
  async runSecureTest(config: ScanConfig): Promise<VulnerabilityReport> {
    // Validate authorization to test target
    await this.validateTestAuthorization(config.targetUrl);
    
    // Use isolated test environment
    const isolatedEnv = await this.createIsolatedEnvironment();
    
    // Rate limit scanning to prevent service disruption
    const rateLimitedConfig = {
      ...config,
      rateLimit: Math.min(config.rateLimit || 10, 10)
    };
    
    // Audit log all security testing activities
    await this.auditLogger.logSecurityTestStart(config);
    
    try {
      const results = await this.scanner.scan(rateLimitedConfig);
      
      // Sanitize results before storage
      const sanitizedResults = this.sanitizeResults(results);
      
      await this.auditLogger.logSecurityTestComplete(sanitizedResults);
      
      return sanitizedResults;
    } finally {
      await isolatedEnv.cleanup();
    }
  }

  private sanitizeResults(results: VulnerabilityReport): VulnerabilityReport {
    return {
      ...results,
      vulnerabilities: results.vulnerabilities.map(v => ({
        ...v,
        evidence: this.redactSensitiveData(v.evidence)
      }))
    };
  }

  private redactSensitiveData(evidence: string): string {
    return evidence
      .replace(/password[=:]\s*\S+/gi, 'password=[REDACTED]')
      .replace(/api[_-]?key[=:]\s*\S+/gi, 'api_key=[REDACTED]')
      .replace(/token[=:]\s*\S+/gi, 'token=[REDACTED]');
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Security Testing Properties', () => {
  it('should detect SQL injection for any malicious payload', () => {
    fc.assert(fc.property(
      fc.constantFrom(...SQL_INJECTION_PAYLOADS),
      fc.string({ minLength: 1 }),
      async (payload, paramName) => {
        const scanner = new InjectionScanner();
        const endpoint = createTestEndpoint(paramName);
        
        const vulnerabilities = await scanner.testSQLInjection(
          endpoint,
          { name: paramName, value: payload },
          defaultConfig
        );
        
        // If payload is known malicious, should be detected
        if (KNOWN_MALICIOUS_PAYLOADS.includes(payload)) {
          expect(vulnerabilities.length).toBeGreaterThan(0);
        }
        
        return true;
      }
    ));
  });

  it('should correctly categorize vulnerability severity', () => {
    fc.assert(fc.property(
      fc.record({
        cvss: fc.float({ min: 0, max: 10 }),
        exploitable: fc.boolean(),
        hasPublicExploit: fc.boolean()
      }),
      (vulnData) => {
        const severity = calculateSeverity(vulnData);
        
        // CVSS >= 9.0 should always be critical
        if (vulnData.cvss >= 9.0) {
          expect(severity).toBe(Severity.CRITICAL);
        }
        
        // CVSS >= 7.0 should be at least high
        if (vulnData.cvss >= 7.0) {
          expect([Severity.CRITICAL, Severity.HIGH]).toContain(severity);
        }
        
        return true;
      }
    ));
  });
});
```

## Configuration Examples

### Security Test Configuration

```yaml
# security-test-config.yaml
scanning:
  target: "${TARGET_URL}"
  authentication:
    type: bearer
    token: "${AUTH_TOKEN}"
  
  vulnerability_scan:
    enabled: true
    depth: deep
    categories:
      - injection
      - xss
      - broken_auth
      - broken_access
      - security_misconfig
    exclude_patterns:
      - "/health"
      - "/metrics"
    rate_limit: 10

  dependency_scan:
    enabled: true
    fail_on: high
    ignore:
      - CVE-2021-12345  # False positive

  secrets_scan:
    enabled: true
    patterns:
      - aws_access_key
      - github_token
      - private_key

thresholds:
  critical: 0
  high: 5
  medium: 20

reporting:
  format: sarif
  output: security-report.sarif
  
notifications:
  slack:
    webhook: "${SLACK_WEBHOOK}"
    on_critical: true
  email:
    recipients:
      - security@example.com
    on_high: true
```
