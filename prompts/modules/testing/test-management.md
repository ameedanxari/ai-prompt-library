# Test Management Template

## Purpose

This template provides comprehensive patterns for implementing test management including test planning, test execution tracking, defect tracking, and test reporting. It covers test case organization, test run management, and integration with project management tools.

## Context

Effective test management ensures systematic testing coverage and provides visibility into testing progress and quality. This template addresses the implementation of test management systems that organize test cases, track execution, manage defects, and generate comprehensive reports.

## Core Components

### Test Management Interface

## Examples

```typescript
interface TestManagementService {
  createTestPlan(plan: TestPlanInput): Promise<TestPlan>;
  createTestCase(testCase: TestCaseInput): Promise<TestCase>;
  createTestRun(run: TestRunInput): Promise<TestRun>;
  executeTestCase(runId: string, caseId: string, result: TestResult): Promise<void>;
  generateReport(runId: string): Promise<TestReport>;
  trackDefect(defect: DefectInput): Promise<Defect>;
}

interface TestPlan {
  id: string;
  name: string;
  description: string;
  projectId: string;
  testCases: TestCase[];
  milestones: Milestone[];
  assignees: User[];
  status: PlanStatus;
  createdAt: Date;
  updatedAt: Date;
}


interface TestCase {
  id: string;
  title: string;
  description: string;
  preconditions: string[];
  steps: TestStep[];
  expectedResult: string;
  priority: Priority;
  type: TestType;
  tags: string[];
  automationStatus: AutomationStatus;
  linkedRequirements: string[];
}

interface TestStep {
  stepNumber: number;
  action: string;
  expectedResult: string;
  testData?: string;
}

interface TestRun {
  id: string;
  name: string;
  testPlanId: string;
  environment: TestEnvironment;
  assignee: User;
  status: RunStatus;
  results: TestCaseResult[];
  startedAt: Date;
  completedAt?: Date;
  summary: RunSummary;
}

enum Priority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

enum TestType {
  FUNCTIONAL = 'functional',
  REGRESSION = 'regression',
  SMOKE = 'smoke',
  INTEGRATION = 'integration',
  ACCEPTANCE = 'acceptance',
  EXPLORATORY = 'exploratory'
}
```

### Test Case Management Service

```typescript
class TestCaseManagementService {
  async createTestCase(input: TestCaseInput): Promise<TestCase> {
    const testCase: TestCase = {
      id: this.generateId(),
      title: input.title,
      description: input.description,
      preconditions: input.preconditions || [],
      steps: input.steps.map((step, index) => ({
        stepNumber: index + 1,
        action: step.action,
        expectedResult: step.expectedResult,
        testData: step.testData
      })),
      expectedResult: input.expectedResult,
      priority: input.priority || Priority.MEDIUM,
      type: input.type || TestType.FUNCTIONAL,
      tags: input.tags || [],
      automationStatus: input.automationStatus || AutomationStatus.NOT_AUTOMATED,
      linkedRequirements: input.linkedRequirements || []
    };

    await this.testCaseRepository.save(testCase);
    await this.indexService.indexTestCase(testCase);

    return testCase;
  }

  async searchTestCases(query: TestCaseQuery): Promise<TestCase[]> {
    const filters: Filter[] = [];

    if (query.tags?.length) {
      filters.push({ field: 'tags', operator: 'in', value: query.tags });
    }

    if (query.priority) {
      filters.push({ field: 'priority', operator: 'eq', value: query.priority });
    }

    if (query.type) {
      filters.push({ field: 'type', operator: 'eq', value: query.type });
    }

    if (query.automationStatus) {
      filters.push({ field: 'automationStatus', operator: 'eq', value: query.automationStatus });
    }

    if (query.searchText) {
      return this.indexService.search(query.searchText, filters);
    }

    return this.testCaseRepository.find(filters);
  }

  async linkToRequirement(testCaseId: string, requirementId: string): Promise<void> {
    const testCase = await this.testCaseRepository.findById(testCaseId);
    if (!testCase) throw new Error('Test case not found');

    testCase.linkedRequirements.push(requirementId);
    await this.testCaseRepository.save(testCase);

    // Update traceability matrix
    await this.traceabilityService.updateMatrix(testCaseId, requirementId);
  }
}
```

### Test Execution Service

```typescript
class TestExecutionService {
  async createTestRun(input: TestRunInput): Promise<TestRun> {
    const testPlan = await this.testPlanRepository.findById(input.testPlanId);
    if (!testPlan) throw new Error('Test plan not found');

    const testRun: TestRun = {
      id: this.generateId(),
      name: input.name,
      testPlanId: input.testPlanId,
      environment: input.environment,
      assignee: input.assignee,
      status: RunStatus.NOT_STARTED,
      results: testPlan.testCases.map(tc => ({
        testCaseId: tc.id,
        status: ResultStatus.NOT_RUN,
        executedAt: null,
        executedBy: null,
        actualResult: null,
        defects: []
      })),
      startedAt: new Date(),
      summary: this.calculateSummary([])
    };

    await this.testRunRepository.save(testRun);
    return testRun;
  }

  async executeTestCase(
    runId: string,
    caseId: string,
    result: TestResultInput
  ): Promise<TestCaseResult> {
    const testRun = await this.testRunRepository.findById(runId);
    if (!testRun) throw new Error('Test run not found');

    const resultIndex = testRun.results.findIndex(r => r.testCaseId === caseId);
    if (resultIndex === -1) throw new Error('Test case not in run');

    const testCaseResult: TestCaseResult = {
      testCaseId: caseId,
      status: result.status,
      executedAt: new Date(),
      executedBy: result.executedBy,
      actualResult: result.actualResult,
      duration: result.duration,
      defects: result.defects || [],
      attachments: result.attachments || [],
      notes: result.notes
    };

    testRun.results[resultIndex] = testCaseResult;
    testRun.summary = this.calculateSummary(testRun.results);
    testRun.status = this.determineRunStatus(testRun.results);

    if (testRun.status === RunStatus.COMPLETED) {
      testRun.completedAt = new Date();
    }

    await this.testRunRepository.save(testRun);

    // Create defects if test failed
    if (result.status === ResultStatus.FAILED && result.createDefect) {
      await this.createDefectFromFailure(testRun, testCaseResult);
    }

    return testCaseResult;
  }

  private calculateSummary(results: TestCaseResult[]): RunSummary {
    const total = results.length;
    const passed = results.filter(r => r.status === ResultStatus.PASSED).length;
    const failed = results.filter(r => r.status === ResultStatus.FAILED).length;
    const blocked = results.filter(r => r.status === ResultStatus.BLOCKED).length;
    const skipped = results.filter(r => r.status === ResultStatus.SKIPPED).length;
    const notRun = results.filter(r => r.status === ResultStatus.NOT_RUN).length;

    return {
      total,
      passed,
      failed,
      blocked,
      skipped,
      notRun,
      passRate: total > 0 ? (passed / (total - notRun - skipped)) * 100 : 0,
      progress: total > 0 ? ((total - notRun) / total) * 100 : 0
    };
  }
}
```


## Implementation Patterns

### Defect Tracking Pattern

```typescript
class DefectTrackingService {
  async createDefect(input: DefectInput): Promise<Defect> {
    const defect: Defect = {
      id: this.generateId(),
      title: input.title,
      description: input.description,
      severity: input.severity,
      priority: input.priority,
      status: DefectStatus.NEW,
      assignee: input.assignee,
      reporter: input.reporter,
      environment: input.environment,
      stepsToReproduce: input.stepsToReproduce,
      expectedBehavior: input.expectedBehavior,
      actualBehavior: input.actualBehavior,
      attachments: input.attachments || [],
      linkedTestCases: input.linkedTestCases || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.defectRepository.save(defect);
    
    // Notify assignee
    await this.notificationService.notifyDefectAssigned(defect);
    
    // Update linked test cases
    for (const testCaseId of defect.linkedTestCases) {
      await this.linkDefectToTestCase(defect.id, testCaseId);
    }

    return defect;
  }

  async updateDefectStatus(defectId: string, status: DefectStatus, comment?: string): Promise<Defect> {
    const defect = await this.defectRepository.findById(defectId);
    if (!defect) throw new Error('Defect not found');

    const previousStatus = defect.status;
    defect.status = status;
    defect.updatedAt = new Date();

    // Add status change to history
    defect.history = defect.history || [];
    defect.history.push({
      field: 'status',
      oldValue: previousStatus,
      newValue: status,
      changedBy: this.getCurrentUser(),
      changedAt: new Date(),
      comment
    });

    await this.defectRepository.save(defect);

    // Notify relevant parties
    await this.notificationService.notifyDefectStatusChange(defect, previousStatus);

    return defect;
  }

  async getDefectMetrics(projectId: string): Promise<DefectMetrics> {
    const defects = await this.defectRepository.findByProject(projectId);

    return {
      total: defects.length,
      byStatus: this.groupBy(defects, 'status'),
      bySeverity: this.groupBy(defects, 'severity'),
      byPriority: this.groupBy(defects, 'priority'),
      openDefects: defects.filter(d => !this.isClosedStatus(d.status)).length,
      averageResolutionTime: this.calculateAverageResolutionTime(defects),
      defectDensity: this.calculateDefectDensity(defects, projectId)
    };
  }
}
```

### Test Reporting Pattern

```typescript
class TestReportingService {
  async generateReport(runId: string, format: ReportFormat): Promise<TestReport> {
    const testRun = await this.testRunRepository.findById(runId);
    if (!testRun) throw new Error('Test run not found');

    const testPlan = await this.testPlanRepository.findById(testRun.testPlanId);
    const defects = await this.defectRepository.findByTestRun(runId);

    const report: TestReport = {
      id: this.generateId(),
      testRunId: runId,
      generatedAt: new Date(),
      summary: {
        testPlan: testPlan.name,
        environment: testRun.environment,
        executionPeriod: {
          start: testRun.startedAt,
          end: testRun.completedAt
        },
        results: testRun.summary,
        defectSummary: this.summarizeDefects(defects)
      },
      details: {
        passedTests: this.getTestsByStatus(testRun, ResultStatus.PASSED),
        failedTests: this.getTestsByStatus(testRun, ResultStatus.FAILED),
        blockedTests: this.getTestsByStatus(testRun, ResultStatus.BLOCKED),
        skippedTests: this.getTestsByStatus(testRun, ResultStatus.SKIPPED)
      },
      defects: defects.map(d => ({
        id: d.id,
        title: d.title,
        severity: d.severity,
        status: d.status,
        linkedTests: d.linkedTestCases
      })),
      charts: await this.generateCharts(testRun, defects),
      recommendations: this.generateRecommendations(testRun, defects)
    };

    // Generate in requested format
    switch (format) {
      case ReportFormat.HTML:
        return this.renderHTMLReport(report);
      case ReportFormat.PDF:
        return this.renderPDFReport(report);
      case ReportFormat.JSON:
        return report;
      default:
        return report;
    }
  }

  private generateRecommendations(testRun: TestRun, defects: Defect[]): string[] {
    const recommendations: string[] = [];

    // Low pass rate recommendation
    if (testRun.summary.passRate < 80) {
      recommendations.push(
        `Pass rate is ${testRun.summary.passRate.toFixed(1)}%. ` +
        'Consider investigating failed tests and addressing root causes before release.'
      );
    }

    // High critical defects
    const criticalDefects = defects.filter(d => d.severity === Severity.CRITICAL);
    if (criticalDefects.length > 0) {
      recommendations.push(
        `${criticalDefects.length} critical defects found. ` +
        'These should be resolved before proceeding with release.'
      );
    }

    // Blocked tests
    if (testRun.summary.blocked > 0) {
      recommendations.push(
        `${testRun.summary.blocked} tests are blocked. ` +
        'Review blocking issues and unblock tests for complete coverage.'
      );
    }

    return recommendations;
  }
}
```

## Integration Points

### Jira Integration

```typescript
class JiraTestManagementIntegration {
  async syncTestCases(projectKey: string): Promise<SyncResult> {
    const testCases = await this.testCaseRepository.findByProject(projectKey);
    const syncResults: SyncItemResult[] = [];

    for (const testCase of testCases) {
      try {
        const jiraIssue = await this.findOrCreateJiraIssue(testCase, projectKey);
        await this.updateJiraIssue(jiraIssue.key, testCase);
        syncResults.push({ testCaseId: testCase.id, jiraKey: jiraIssue.key, status: 'synced' });
      } catch (error) {
        syncResults.push({ testCaseId: testCase.id, status: 'failed', error: (error as Error).message });
      }
    }

    return { total: testCases.length, synced: syncResults.filter(r => r.status === 'synced').length, results: syncResults };
  }

  async createDefectInJira(defect: Defect, projectKey: string): Promise<JiraIssue> {
    const issue = await this.jiraClient.createIssue({
      fields: {
        project: { key: projectKey },
        issuetype: { name: 'Bug' },
        summary: defect.title,
        description: this.formatDefectDescription(defect),
        priority: { name: this.mapPriority(defect.priority) },
        labels: ['test-defect', `severity-${defect.severity}`]
      }
    });

    // Link to test case issues
    for (const testCaseId of defect.linkedTestCases) {
      const testCaseIssue = await this.findJiraIssueByTestCase(testCaseId);
      if (testCaseIssue) {
        await this.jiraClient.createIssueLink({
          type: { name: 'Blocks' },
          inwardIssue: { key: issue.key },
          outwardIssue: { key: testCaseIssue.key }
        });
      }
    }

    return issue;
  }
}
```

## Security Considerations

### Access Control

```typescript
class TestManagementAccessControl {
  async checkPermission(userId: string, resource: string, action: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    const permissions = this.getPermissionsForRoles(userRoles);
    
    return permissions.some(p => 
      p.resource === resource && p.actions.includes(action)
    );
  }

  async filterTestCasesByAccess(userId: string, testCases: TestCase[]): Promise<TestCase[]> {
    const accessibleProjects = await this.getAccessibleProjects(userId);
    return testCases.filter(tc => accessibleProjects.includes(tc.projectId));
  }
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Test Management Properties', () => {
  it('should calculate run summary correctly for any result combination', () => {
    fc.assert(fc.property(
      fc.array(
        fc.constantFrom(
          ResultStatus.PASSED,
          ResultStatus.FAILED,
          ResultStatus.BLOCKED,
          ResultStatus.SKIPPED,
          ResultStatus.NOT_RUN
        ),
        { minLength: 1, maxLength: 100 }
      ),
      (statuses) => {
        const results = statuses.map(status => ({ status }));
        const summary = calculateSummary(results);
        
        expect(summary.total).toBe(statuses.length);
        expect(summary.passed + summary.failed + summary.blocked + summary.skipped + summary.notRun).toBe(summary.total);
        expect(summary.passRate).toBeGreaterThanOrEqual(0);
        expect(summary.passRate).toBeLessThanOrEqual(100);
        
        return true;
      }
    ));
  });
});
```

## Configuration Examples

### Test Management Configuration

```yaml
# test-management-config.yaml
testCases:
  idPrefix: "TC"
  defaultPriority: medium
  requiredFields:
    - title
    - steps
    - expectedResult

testRuns:
  idPrefix: "TR"
  autoCreateDefects: true
  notifyOnFailure: true

defects:
  idPrefix: "DEF"
  severityLevels:
    - critical
    - high
    - medium
    - low
  workflow:
    - new
    - in_progress
    - resolved
    - verified
    - closed

reporting:
  defaultFormat: html
  includeCharts: true
  emailOnCompletion: true

integrations:
  jira:
    enabled: true
    projectKey: "${JIRA_PROJECT}"
    syncInterval: 300
```
