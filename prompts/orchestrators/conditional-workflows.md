# Conditional Workflows Orchestrator

## Purpose
Dynamically adapt the specification pipeline based on project characteristics, requirements, and runtime conditions.

## Implementation Patterns

### Pattern 1: State-Based Workflow Routing
Route tasks based on application state.

**Implementation**:
1. Check application state (initialized, authenticated, ready)
2. Based on state, execute conditional branch
3. State: NOT_INITIALIZED → run initialization tasks
4. State: UNAUTHENTICATED → run login flow
5. State: READY → run main logic
6. After branch executes, update state
7. Repeat until final state reached
8. Log state transitions

## When to Use
- Projects with varying complexity requiring different approaches
- Conditional feature inclusion based on platform or requirements
- Adaptive quality gates based on project criticality
- Dynamic resource allocation based on budget constraints

## Core Conditional Patterns

### 1. Project Complexity-Based Routing

```typescript
class ConditionalWorkflowOrchestrator {
  async routeWorkflow(project: Project): Promise<WorkflowPlan> {
    // Assess project complexity
    const complexity = await this.assessComplexity(project);
    
    // Select appropriate workflow
    if (complexity.score < 3) {
      return this.simpleWorkflow(project);
    } else if (complexity.score < 7) {
      return this.standardWorkflow(project);
    } else {
      return this.comprehensiveWorkflow(project);
    }
  }
  
  private async assessComplexity(project: Project): Promise<ComplexityScore> {
    const factors = {
      platformCount: project.platforms.length,
      featureCount: project.features.length,
      integrationCount: project.integrations.length,
      complianceRequirements: project.compliance.length,
      teamSize: project.team.size,
      timeline: project.timeline.weeks
    };
    
    // Weighted scoring
    const score = 
      factors.platformCount * 1.5 +
      factors.featureCount * 0.5 +
      factors.integrationCount * 2 +
      factors.complianceRequirements * 3 +
      (factors.teamSize > 10 ? 2 : 0) +
      (factors.timeline < 12 ? 2 : 0);
    
    return {
      score,
      factors,
      category: this.categorizeComplexity(score)
    };
  }
}
```

### 2. Platform-Conditional Stage Execution

```bash
# Execute stages conditionally based on platforms
conditional_platform_stages() {
    local stage="$1"
    
    # Check if mobile platforms are selected
    if grep -q "\[x\] iOS\|\[x\] Android" MY_PROJECT.md; then
        echo "📱 Mobile platforms detected - including mobile-specific stages"
        execute_stage "$stage-mobile"
    fi
    
    # Check if web platform is selected
    if grep -q "\[x\] Web" MY_PROJECT.md; then
        echo "🌐 Web platform detected - including web-specific stages"
        execute_stage "$stage-web"
    fi
    
    # Check if desktop platforms are selected
    if grep -q "\[x\] Desktop" MY_PROJECT.md; then
        echo "🖥️ Desktop platform detected - including desktop-specific stages"
        execute_stage "$stage-desktop"
    fi
}
```

### 3. Feature-Conditional Workflows

```typescript
class FeatureConditionalOrchestrator {
  async generateConditionalSpecs(project: Project): Promise<Specifications> {
    const specs: Specifications = {};
    
    // Always include core features
    specs.core = await this.generateCoreSpecs(project);
    
    // Conditionally include authentication
    if (project.requiresAuth) {
      specs.auth = await this.generateAuthSpecs(project.authType);
    }
    
    // Conditionally include payment processing
    if (project.requiresPayments) {
      specs.payments = await this.generatePaymentSpecs(project.paymentProviders);
    }
    
    // Conditionally include real-time features
    if (project.requiresRealtime) {
      specs.realtime = await this.generateRealtimeSpecs(project.realtimeFeatures);
    }
    
    // Conditionally include compliance
    if (project.compliance.length > 0) {
      specs.compliance = await this.generateComplianceSpecs(project.compliance);
    }
    
    return specs;
  }
}
```

### 4. Budget-Conditional Quality Gates

```typescript
class BudgetConditionalQuality {
  async applyQualityGates(stage: Stage, budget: TokenBudget): Promise<QualityResult> {
    // Adjust quality gates based on remaining budget
    const budgetLevel = this.assessBudgetLevel(budget);
    
    switch (budgetLevel) {
      case 'high':
        // Comprehensive validation with COVE
        return await this.comprehensiveValidation(stage);
      
      case 'medium':
        // Standard validation
        return await this.standardValidation(stage);
      
      case 'low':
        // Essential validation only
        return await this.essentialValidation(stage);
      
      case 'critical':
        // Minimal validation, warn user
        await this.warnLowBudget();
        return await this.minimalValidation(stage);
    }
  }
  
  private assessBudgetLevel(budget: TokenBudget): BudgetLevel {
    const remaining = budget.total - budget.used;
    const percentage = remaining / budget.total;
    
    if (percentage > 0.5) return 'high';
    if (percentage > 0.25) return 'medium';
    if (percentage > 0.1) return 'low';
    return 'critical';
  }
}
```

## Advanced Conditional Patterns

### 5. Compliance-Driven Workflow Adaptation

```typescript
class ComplianceConditionalOrchestrator {
  async adaptForCompliance(project: Project): Promise<AdaptedWorkflow> {
    const workflow = this.baseWorkflow();
    
    // Add HIPAA-specific stages
    if (project.compliance.includes('HIPAA')) {
      workflow.stages.push(
        this.createStage('hipaa-security-review'),
        this.createStage('phi-data-mapping'),
        this.createStage('audit-trail-design')
      );
    }
    
    // Add PCI-DSS-specific stages
    if (project.compliance.includes('PCI-DSS')) {
      workflow.stages.push(
        this.createStage('payment-security-review'),
        this.createStage('cardholder-data-flow'),
        this.createStage('pci-compliance-checklist')
      );
    }
    
    // Add GDPR-specific stages
    if (project.compliance.includes('GDPR')) {
      workflow.stages.push(
        this.createStage('data-privacy-review'),
        this.createStage('consent-management-design'),
        this.createStage('data-retention-policy')
      );
    }
    
    return workflow;
  }
}
```

### 6. Performance-Based Workflow Adjustment

```typescript
class PerformanceConditionalOrchestrator {
  async adjustWorkflow(metrics: PerformanceMetrics): Promise<WorkflowAdjustment> {
    // If generation is too slow, simplify
    if (metrics.avgStageTime > this.slowThreshold) {
      return {
        action: 'simplify',
        changes: [
          'Reduce example count',
          'Skip optional validations',
          'Use faster models'
        ]
      };
    }
    
    // If quality is low, enhance
    if (metrics.qualityScore < this.qualityThreshold) {
      return {
        action: 'enhance',
        changes: [
          'Add COVE verification',
          'Increase validation depth',
          'Use more capable models'
        ]
      };
    }
    
    return { action: 'maintain', changes: [] };
  }
}
```

### 7. Team Size-Based Workflow

```typescript
class TeamSizeConditionalOrchestrator {
  async adaptForTeamSize(project: Project): Promise<WorkflowPlan> {
    if (project.team.size === 1) {
      // Solo developer - streamlined workflow
      return this.soloWorkflow(project);
    } else if (project.team.size <= 5) {
      // Small team - standard workflow with collaboration
      return this.smallTeamWorkflow(project);
    } else {
      // Large team - comprehensive workflow with coordination
      return this.largeTeamWorkflow(project);
    }
  }
  
  private largeTeamWorkflow(project: Project): WorkflowPlan {
    return {
      stages: this.standardStages(),
      additionalStages: [
        'team-coordination-plan',
        'responsibility-matrix',
        'communication-protocols',
        'integration-strategy'
      ],
      parallelization: 'high',
      reviewProcess: 'multi-stage'
    };
  }
}
```

## Conditional Execution Strategies

### Strategy 1: Rule-Based Conditions

```typescript
interface WorkflowRule {
  condition: (project: Project) => boolean;
  action: (project: Project) => Promise<void>;
  priority: number;
}

class RuleBasedWorkflow {
  private rules: WorkflowRule[] = [];
  
  async execute(project: Project): Promise<void> {
    // Sort rules by priority
    const sortedRules = this.rules.sort((a, b) => b.priority - a.priority);
    
    // Execute matching rules
    for (const rule of sortedRules) {
      if (rule.condition(project)) {
        await rule.action(project);
      }
    }
  }
  
  addRule(rule: WorkflowRule): void {
    this.rules.push(rule);
  }
}
```

### Strategy 2: Decision Tree Workflow

```typescript
class DecisionTreeWorkflow {
  async execute(project: Project): Promise<WorkflowPlan> {
    // Root decision: project type
    if (project.type === 'web-app') {
      return await this.webAppBranch(project);
    } else if (project.type === 'mobile-app') {
      return await this.mobileAppBranch(project);
    } else if (project.type === 'api') {
      return await this.apiBranch(project);
    }
    
    // Default workflow
    return this.defaultWorkflow(project);
  }
  
  private async webAppBranch(project: Project): Promise<WorkflowPlan> {
    // Next decision: SPA vs SSR
    if (project.architecture === 'spa') {
      return this.spaWorkflow(project);
    } else {
      return this.ssrWorkflow(project);
    }
  }
}
```

### Strategy 3: ML-Based Workflow Selection

```typescript
class MLWorkflowSelector {
  private model: WorkflowSelectionModel;
  
  async selectWorkflow(project: Project): Promise<WorkflowPlan> {
    // Extract features
    const features = this.extractFeatures(project);
    
    // Predict optimal workflow
    const prediction = await this.model.predict(features);
    
    // Get workflow template
    return this.getWorkflowTemplate(prediction.workflowId);
  }
  
  private extractFeatures(project: Project): Features {
    return {
      complexity: this.calculateComplexity(project),
      platformCount: project.platforms.length,
      hasCompliance: project.compliance.length > 0,
      teamSize: project.team.size,
      budget: project.budget.tokens,
      timeline: project.timeline.weeks
    };
  }
}
```

## Integration with COVE

Apply COVE conditionally based on criticality:

```typescript
class ConditionalCOVEOrchestrator {
  async applyConditionalCOVE(
    stage: Stage,
    project: Project
  ): Promise<StageResult> {
    // Determine if COVE is needed
    const needsCOVE = this.assessCOVENeed(stage, project);
    
    if (needsCOVE.required) {
      // Apply full COVE verification
      return await this.executeWithCOVE(stage);
    } else if (needsCOVE.recommended) {
      // Apply lightweight verification
      return await this.executeWithLightweightVerification(stage);
    } else {
      // Standard execution
      return await this.executeStandard(stage);
    }
  }
  
  private assessCOVENeed(stage: Stage, project: Project): COVEAssessment {
    const criticalityScore = 
      (stage.criticality || 0) +
      (project.compliance.length * 2) +
      (project.userBase > 10000 ? 3 : 0);
    
    return {
      required: criticalityScore >= 7,
      recommended: criticalityScore >= 4,
      score: criticalityScore
    };
  }
}
```

## Best Practices

1. **Define clear conditions** for workflow branching
2. **Document decision logic** for transparency
3. **Test all workflow paths** to ensure correctness
4. **Monitor workflow performance** and adjust rules
5. **Provide fallback workflows** for edge cases
6. **Log all conditional decisions** for debugging
7. **Allow manual overrides** when needed
8. **Validate workflow consistency** across branches

## Related Orchestrators

- `parallel-stage-execution.md` - Parallel execution
- `stage-pipeline-orchestrator.md` - Sequential execution
- `auto-request-router.md` - Request routing

## Examples

See `examples/conditional-workflows/` for implementations:
- Complexity-based routing
- Compliance-driven adaptation
- Budget-conditional quality gates
