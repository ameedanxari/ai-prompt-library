### Example 2: Compliance Automation Framework
```typescript
// Automated compliance testing and validation
class ComplianceAutomator {
  private complianceFrameworks: ComplianceFrameworkManager;
  private automatedAuditor: AutomatedAuditor;
  private evidenceCollector: ComplianceEvidenceCollector;
  private reportGenerator: ComplianceReportGenerator;

  constructor(config: ComplianceAutomationConfig) {
    this.complianceFrameworks = new ComplianceFrameworkManager(config.frameworks);
    this.automatedAuditor = new AutomatedAuditor(config.auditing);
    this.evidenceCollector = new ComplianceEvidenceCollector(config.evidenceCollection);
    this.reportGenerator = new ComplianceReportGenerator(config.reporting);
  }

  // Perform automated compliance validation
  async performComplianceAutomation(campaign: SecurityCampaign): Promise<ComplianceAutomationResult> {
    const automationStartTime = Date.now();

    // Load applicable compliance frameworks
    const applicableFrameworks = await this.complianceFrameworks.getApplicableFrameworks(
      campaign.targetApplication
    );

    const frameworkResults = await Promise.all(
      applicableFrameworks.map(async framework => {
        const frameworkResult = await this.validateFrameworkCompliance(framework, campaign);
        return {
          framework,
          result: frameworkResult,
          complianceScore: this.calculateComplianceScore(frameworkResult),
          gaps: this.identifyComplianceGaps(frameworkResult)
        };
      })
    );

    // Generate compliance evidence
    const evidence = await this.evidenceCollector.collectComplianceEvidence(frameworkResults);
    
    // Generate compliance reports
    const reports = await this.reportGenerator.generateComplianceReports(frameworkResults, evidence);
    
    // Calculate overall compliance posture
    const overallCompliance = this.calculateOverallCompliance(frameworkResults);

    return {
      automationId: crypto.randomUUID(),
      timestamp: Date.now(),
      duration: Date.now() - automationStartTime,
      applicableFrameworks: applicableFrameworks.length,
      frameworkResults,
      evidence,
      reports,
      overallCompliance,
      criticalGaps: frameworkResults.flatMap(r => r.gaps.filter(g => g.severity === 'critical')),
      recommendations: this.generateComplianceRecommendations(frameworkResults)
    };
  }

  // Validate compliance for specific framework
  private async validateFrameworkCompliance(
    framework: ComplianceFramework,
    campaign: SecurityCampaign
  ): Promise<FrameworkComplianceResult> {
    const validationStartTime = Date.now();

    const controlResults = await Promise.all(
      framework.controls.map(async control => {
        const controlResult = await this.validateControl(control, campaign.targetApplication);
        return {
          control,
          result: controlResult,
          compliant: controlResult.compliant,
          evidence: controlResult.evidence,
          gaps: controlResult.gaps
        };
      })
    );

    return {
      framework: framework.name,
      version: framework.version,
      timestamp: Date.now(),
      duration: Date.now() - validationStartTime,
      controlResults,
      compliantControls: controlResults.filter(r => r.compliant).length,
      totalControls: controlResults.length,
      compliancePercentage: (controlResults.filter(r => r.compliant).length / controlResults.length) * 100,
      criticalFindings: controlResults.filter(r => !r.compliant && r.control.criticality === 'high'),
      recommendations: this.generateFrameworkRecommendations(controlResults)
    };
  }

  // Validate individual compliance control
  private async validateControl(
    control: ComplianceControl,
    application: ApplicationModel
  ): Promise<ControlValidationResult> {
    const validationMethods = this.getValidationMethods(control);
    const validationResults = [];

    for (const method of validationMethods) {
      const result = await this.executeValidationMethod(method, control, application);
      validationResults.push(result);
    }

    // Aggregate validation results
    const overallCompliant = validationResults.every(r => r.compliant);
    const evidence = validationResults.flatMap(r => r.evidence);
    const gaps = validationResults.flatMap(r => r.gaps);

    return {
      control: control.id,
      compliant: overallCompliant,
      validationResults,
      evidence,
      gaps,
      confidence: this.calculateValidationConfidence(validationResults),
      recommendations: this.generateControlRecommendations(control, gaps)
    };
  }
}
```

