### Example 3: Security Orchestration and Response
```typescript
// Security orchestration and automated response
class SecurityOrchestrator {
  private incidentManager: SecurityIncidentManager;
  private responseAutomator: SecurityResponseAutomator;
  private workflowEngine: SecurityWorkflowEngine;
  private integrationManager: SecurityIntegrationManager;

  constructor(config: SecurityOrchestrationConfig) {
    this.incidentManager = new SecurityIncidentManager(config.incidentManagement);
    this.responseAutomator = new SecurityResponseAutomator(config.responseAutomation);
    this.workflowEngine = new SecurityWorkflowEngine(config.workflows);
    this.integrationManager = new SecurityIntegrationManager(config.integrations);
  }

  // Orchestrate security response based on findings
  async orchestrateSecurityResponse(
    threatCorrelation: ThreatCorrelationResult
  ): Promise<SecurityOrchestrationResult> {
    const orchestrationStartTime = Date.now();

    // Create security incidents from high-priority findings
    const incidents = await this.createSecurityIncidents(threatCorrelation);
    
    // Execute automated response workflows
    const responseResults = await Promise.all(
      incidents.map(async incident => {
        const workflow = await this.workflowEngine.selectResponseWorkflow(incident);
        const result = await this.executeResponseWorkflow(workflow, incident);
        return {
          incident,
          workflow,
          result,
          success: result.success,
          actions: result.actions
        };
      })
    );

    // Coordinate with external security tools
    const integrationResults = await this.coordinateSecurityIntegrations(responseResults);
    
    // Generate security metrics and KPIs
    const securityMetrics = await this.generateSecurityMetrics(responseResults, integrationResults);
    
    // Update security posture
    const postureUpdate = await this.updateSecurityPosture(securityMetrics);

    return {
      orchestrationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - orchestrationStartTime,
      incidents: incidents.length,
      responseResults,
      integrationResults,
      securityMetrics,
      postureUpdate,
      automatedActions: responseResults.reduce((sum, r) => sum + r.actions.length, 0),
      recommendations: this.generateOrchestrationRecommendations(responseResults)
    };
  }

  // Execute automated security response workflow
  private async executeResponseWorkflow(
    workflow: SecurityWorkflow,
    incident: SecurityIncident
  ): Promise<WorkflowExecutionResult> {
    const executionStartTime = Date.now();
    const executedActions = [];

    try {
      for (const step of workflow.steps) {
        const stepResult = await this.executeWorkflowStep(step, incident);
        executedActions.push({
          step,
          result: stepResult,
          success: stepResult.success,
          timestamp: Date.now()
        });

        // Stop workflow if critical step fails
        if (!stepResult.success && step.critical) {
          break;
        }
      }

      return {
        workflowId: workflow.id,
        incidentId: incident.id,
        timestamp: Date.now(),
        duration: Date.now() - executionStartTime,
        success: executedActions.every(a => a.success || !a.step.critical),
        actions: executedActions,
        metrics: this.calculateWorkflowMetrics(executedActions)
      };

    } catch (error) {
      return {
        workflowId: workflow.id,
        incidentId: incident.id,
        timestamp: Date.now(),
        duration: Date.now() - executionStartTime,
        success: false,
        error: error.message,
        actions: executedActions,
        metrics: null
      };
    }
  }

  // Execute individual workflow step
  private async executeWorkflowStep(
    step: WorkflowStep,
    incident: SecurityIncident
  ): Promise<StepExecutionResult> {
    switch (step.type) {
      case 'isolate-asset':
        return await this.responseAutomator.isolateAsset(step.parameters.assetId);
        
      case 'block-ip':
        return await this.responseAutomator.blockIPAddress(step.parameters.ipAddress);
        
      case 'disable-user':
        return await this.responseAutomator.disableUser(step.parameters.userId);
        
      case 'quarantine-file':
        return await this.responseAutomator.quarantineFile(step.parameters.filePath);
        
      case 'update-firewall':
        return await this.responseAutomator.updateFirewallRules(step.parameters.rules);
        
      case 'notify-team':
        return await this.responseAutomator.notifySecurityTeam(incident, step.parameters.message);
        
      case 'create-ticket':
        return await this.responseAutomator.createSecurityTicket(incident, step.parameters.ticketData);
        
      case 'collect-evidence':
        return await this.responseAutomator.collectForensicEvidence(incident, step.parameters.evidenceTypes);
        
      default:
        throw new Error(`Unknown workflow step type: ${step.type}`);
    }
  }
}
```

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


