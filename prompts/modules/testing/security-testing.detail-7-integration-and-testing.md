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

