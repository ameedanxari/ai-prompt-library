# Self-Modifying Code Patterns

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
Patterns for building systems that can analyze, improve, and evolve their own codebase through AI-driven code generation, refactoring, and optimization.

## Implementation Patterns

### Pattern 1: Performance-Based Code Mutation
Modify code to improve observed performance metrics.

**Implementation**:
1. Profile code; identify bottleneck function F
2. Record baseline metric M (latency, throughput)
3. Generate mutation: "Function [F] baseline [M]. Optimize for [metric]. New code?"
4. LLM generates optimized code
5. Replace F with generated version
6. Measure new metric M'
7. If M' > M (+ tests pass), keep mutation
8. If M' < M, revert
9. Log successful mutations

### Pattern 2: Test-Driven Code Repair
Detect failing tests and automatically fix code.

**Implementation**:
1. Run test suite
2. If test fails, capture failure (assertion, expected, actual)
3. Load source of failing function
4. Generate fix prompt: "Function [F] failed test [test_name]. Expected [X], got [Y]. Fix?"
5. LLM generates fixed code
6. Replace function with fixed version
7. Re-run test
8. If pass, commit fix
9. If still fail, iterate or escalate

### Pattern 3: Feature Flag-Protected Self-Modification
Enable safe code mutation with feature flags for rollback.

**Implementation**:
1. Wrap modified code with feature flag: if (FEATURE_FLAG.enabled) { new_code } else { old_code }
2. When planning mutation, enable flag for canary (5% of traffic)
3. Monitor metrics for canary (error rate, performance)
4. If canary degrades, instantly kill flag (rollback to old_code)
5. If canary improves, gradually roll out flag (10%, 25%, 50%, 100%)
6. Once 100%, remove flag and clean up old_code
7. Log all mutations with rollout progression

## Context
Self-modifying code represents the next evolution in software development, where systems can adapt and improve themselves based on runtime behavior, performance metrics, and changing requirements.

## Core Patterns

### 1. Code Analysis and Understanding

```typescript
// AST-based code analysis for self-modification
interface CodeAnalyzer {
  parseCode(source: string, language: string): AST;
  extractPatterns(ast: AST): CodePattern[];
  identifyImprovements(ast: AST, metrics: Metrics): Improvement[];
  generateRefactoring(improvement: Improvement): RefactoringPlan;
}

class IntelligentCodeAnalyzer implements CodeAnalyzer {
  async analyzeForOptimization(filePath: string): Promise<OptimizationReport> {
    const source = await fs.readFile(filePath, 'utf-8');
    const ast = this.parseCode(source, this.detectLanguage(filePath));
    
    // Multi-dimensional analysis
    const analyses = await Promise.all([
      this.analyzePerformance(ast),
      this.analyzeComplexity(ast),
      this.analyzeMaintainability(ast),
      this.analyzeSecurityVulnerabilities(ast),
      this.analyzeTestCoverage(ast)
    ]);
    
    return {
      file: filePath,
      currentMetrics: this.extractMetrics(ast),
      improvements: this.prioritizeImprovements(analyses),
      estimatedImpact: this.estimateImpact(analyses)
    };
  }
  
  private analyzePerformance(ast: AST): PerformanceAnalysis {
    return {
      hotspots: this.identifyHotspots(ast),
      inefficientPatterns: this.findInefficiencies(ast),
      optimizationOpportunities: this.findOptimizations(ast)
    };
  }
}
```

### 2. Safe Code Generation

```typescript
// Generate code with safety guarantees
class SafeCodeGenerator {
  async generateCode(spec: CodeSpecification): Promise<GeneratedCode> {
    // Step 1: Generate initial code
    const draft = await this.llm.generateCode(spec);
    
    // Step 2: Validate syntax and semantics
    const validation = await this.validateCode(draft);
    if (!validation.isValid) {
      return this.regenerateWithFeedback(spec, validation.errors);
    }
    
    // Step 3: Generate tests
    const tests = await this.generateTests(draft, spec);
    
    // Step 4: Run tests in sandbox
    const testResults = await this.runInSandbox(draft, tests);
    if (!testResults.allPassed) {
      return this.fixFailures(draft, testResults);
    }
    
    // Step 5: Security scan
    const securityScan = await this.scanForVulnerabilities(draft);
    if (securityScan.hasIssues) {
      return this.fixSecurityIssues(draft, securityScan);
    }
    
    return {
      code: draft,
      tests,
      confidence: this.calculateConfidence(validation, testResults, securityScan)
    };
  }
  
  private async runInSandbox(code: string, tests: string[]): Promise<TestResults> {
    const sandbox = new IsolatedSandbox({
      timeout: 5000,
      memoryLimit: '128MB',
      networkAccess: false
    });
    
    try {
      return await sandbox.execute(code, tests);
    } finally {
      await sandbox.cleanup();
    }
  }
}
```

### 3. Automated Refactoring

```typescript
// AI-driven refactoring with verification
class AutomatedRefactorer {
  async refactorFunction(
    functionNode: FunctionNode,
    goal: RefactoringGoal
  ): Promise<RefactoringResult> {
    // Extract function context
    const context = this.extractContext(functionNode);
    
    // Generate refactoring candidates
    const candidates = await this.generateRefactorings(functionNode, goal, context);
    
    // Evaluate each candidate
    const evaluated = await Promise.all(
      candidates.map(c => this.evaluateRefactoring(c, functionNode))
    );
    
    // Select best refactoring
    const best = this.selectBest(evaluated);
    
    // Apply with rollback capability
    return await this.applyWithRollback(best);
  }
  
  private async evaluateRefactoring(
    candidate: RefactoringCandidate,
    original: FunctionNode
  ): Promise<EvaluatedRefactoring> {
    // Run original and refactored versions
    const originalResults = await this.runTests(original);
    const refactoredResults = await this.runTests(candidate.code);
    
    // Compare behavior
    const behaviorMatch = this.compareBehavior(originalResults, refactoredResults);
    
    // Compare metrics
    const metrics = {
      complexity: this.calculateComplexity(candidate.code),
      performance: await this.benchmarkPerformance(candidate.code),
      readability: await this.assessReadability(candidate.code),
      maintainability: this.calculateMaintainability(candidate.code)
    };
    
    return {
      candidate,
      behaviorPreserved: behaviorMatch.identical,
      improvements: this.calculateImprovements(original, metrics),
      score: this.scoreRefactoring(behaviorMatch, metrics)
    };
  }
}
```

### 4. Evolutionary Code Optimization

```typescript
// Genetic programming for code optimization
class EvolutionaryOptimizer {
  async optimize(
    initialCode: string,
    fitnessFunction: FitnessFunction,
    options: EvolutionOptions
  ): Promise<OptimizedCode> {
    let population = this.initializePopulation(initialCode, options.populationSize);
    
    for (let generation = 0; generation < options.maxGenerations; generation++) {
      // Evaluate fitness
      const fitness = await Promise.all(
        population.map(individual => this.evaluateFitness(individual, fitnessFunction))
      );
      
      // Check termination
      const best = this.getBest(population, fitness);
      if (best.fitness >= options.targetFitness) {
        return best;
      }
      
      // Selection
      const selected = this.tournamentSelection(population, fitness);
      
      // Crossover and mutation
      const offspring = await this.generateOffspring(selected, options);
      
      // Next generation
      population = this.selectSurvivors(population, offspring, fitness);
      
      // Log progress
      await this.logGeneration(generation, best);
    }
    
    return this.getBest(population, fitness);
  }
  
  private async generateOffspring(
    parents: CodeIndividual[],
    options: EvolutionOptions
  ): Promise<CodeIndividual[]> {
    const offspring: CodeIndividual[] = [];
    
    for (let i = 0; i < parents.length; i += 2) {
      // Crossover
      if (Math.random() < options.crossoverRate) {
        const [child1, child2] = await this.crossover(parents[i], parents[i + 1]);
        offspring.push(child1, child2);
      } else {
        offspring.push(parents[i], parents[i + 1]);
      }
    }
    
    // Mutation
    for (const individual of offspring) {
      if (Math.random() < options.mutationRate) {
        await this.mutate(individual);
      }
    }
    
    return offspring;
  }
  
  private async mutate(individual: CodeIndividual): Promise<void> {
    const mutations = [
      () => this.mutateConstant(individual),
      () => this.mutateOperator(individual),
      () => this.mutateStructure(individual),
      () => this.mutateAlgorithm(individual)
    ];
    
    const mutation = mutations[Math.floor(Math.random() * mutations.length)];
    await mutation();
  }
}
```

### 5. Runtime Code Adaptation

```typescript
// Adapt code based on runtime behavior
class RuntimeAdaptiveSystem {
  private performanceMonitor: PerformanceMonitor;
  private codeGenerator: SafeCodeGenerator;
  private hotswapManager: HotswapManager;
  
  async monitorAndAdapt(): Promise<void> {
    // Continuous monitoring
    this.performanceMonitor.on('bottleneck', async (bottleneck) => {
      console.log(`Bottleneck detected: ${bottleneck.function}`);
      
      // Analyze bottleneck
      const analysis = await this.analyzeBottleneck(bottleneck);
      
      // Generate optimized version
      const optimized = await this.generateOptimization(analysis);
      
      // Validate in shadow mode
      const validation = await this.validateInShadow(optimized, bottleneck.function);
      
      if (validation.isImprovement) {
        // Hot-swap the function
        await this.hotswapManager.replace(bottleneck.function, optimized);
        console.log(`Optimized ${bottleneck.function}: ${validation.improvement}% faster`);
      }
    });
  }
  
  private async validateInShadow(
    optimized: string,
    original: string
  ): Promise<ValidationResult> {
    // Run both versions in parallel
    const requests = await this.captureRequests(original, 1000);
    
    const [originalResults, optimizedResults] = await Promise.all([
      this.runRequests(original, requests),
      this.runRequests(optimized, requests)
    ]);
    
    // Compare results and performance
    return {
      isImprovement: optimizedResults.avgLatency < originalResults.avgLatency,
      improvement: ((originalResults.avgLatency - optimizedResults.avgLatency) / originalResults.avgLatency) * 100,
      behaviorMatch: this.compareResults(originalResults, optimizedResults)
    };
  }
}
```

## Advanced Patterns

### 6. Meta-Programming Framework

```typescript
// Framework for code that writes code
class MetaProgrammingFramework {
  async generateModule(specification: ModuleSpec): Promise<Module> {
    // Generate module structure
    const structure = await this.generateStructure(specification);
    
    // Generate implementations
    const implementations = await Promise.all(
      structure.functions.map(fn => this.generateImplementation(fn))
    );
    
    // Generate tests
    const tests = await this.generateTestSuite(structure, implementations);
    
    // Generate documentation
    const docs = await this.generateDocumentation(structure, implementations);
    
    // Validate complete module
    await this.validateModule({
      structure,
      implementations,
      tests,
      docs
    });
    
    return {
      code: this.assembleModule(structure, implementations),
      tests,
      docs,
      metadata: this.generateMetadata(specification)
    };
  }
  
  private async generateImplementation(
    functionSpec: FunctionSpec
  ): Promise<Implementation> {
    // Use the verification pipeline for critical functions
    if (functionSpec.criticality === 'high') {
      return await this.generateWithVerification(functionSpec);
    }
    
    // Standard generation for others
    return await this.codeGenerator.generate(functionSpec);
  }
}
```

### 7. Self-Healing Code

```typescript
// Automatically fix bugs and errors
class SelfHealingSystem {
  async handleError(error: Error, context: ExecutionContext): Promise<void> {
    // Analyze error
    const analysis = await this.analyzeError(error, context);
    
    // Generate fix candidates
    const fixes = await this.generateFixes(analysis);
    
    // Test each fix
    const tested = await Promise.all(
      fixes.map(fix => this.testFix(fix, context))
    );
    
    // Apply best fix
    const best = tested.find(t => t.success && t.noRegressions);
    if (best) {
      await this.applyFix(best.fix);
      await this.notifySuccess(error, best.fix);
    } else {
      await this.escalateToHuman(error, analysis, tested);
    }
  }
  
  private async generateFixes(analysis: ErrorAnalysis): Promise<Fix[]> {
    const strategies = [
      () => this.generateNullCheck(analysis),
      () => this.generateBoundaryCheck(analysis),
      () => this.generateTypeCoercion(analysis),
      () => this.generateErrorHandling(analysis),
      () => this.generateAlternativeImplementation(analysis)
    ];
    
    const fixes = await Promise.all(
      strategies.map(strategy => strategy())
    );
    
    return fixes.filter(f => f !== null);
  }
}
```

### 8. Code Evolution Tracking

```typescript
// Track and learn from code evolution
class EvolutionTracker {
  async trackEvolution(change: CodeChange): Promise<void> {
    // Record change
    await this.db.recordChange({
      timestamp: Date.now(),
      type: change.type,
      before: change.before,
      after: change.after,
      reason: change.reason,
      metrics: await this.captureMetrics(change)
    });
    
    // Learn patterns
    await this.learnFromChange(change);
    
    // Update optimization strategies
    await this.updateStrategies(change);
  }
  
  private async learnFromChange(change: CodeChange): Promise<void> {
    // Extract patterns from successful changes
    if (change.metrics.improvement > 0) {
      const pattern = await this.extractPattern(change);
      await this.patternLibrary.add(pattern);
    }
    
    // Learn from failures
    if (change.metrics.improvement < 0) {
      const antipattern = await this.extractAntipattern(change);
      await this.antipatternLibrary.add(antipattern);
    }
  }
}
```

## Safety and Governance

### 9. Change Approval System

```typescript
// Require approval for critical changes
class ChangeApprovalSystem {
  async proposeChange(change: ProposedChange): Promise<ApprovalResult> {
    // Assess risk
    const risk = await this.assessRisk(change);
    
    // Auto-approve low-risk changes
    if (risk.level === 'low' && risk.confidence > 0.9) {
      return { approved: true, reason: 'auto-approved-low-risk' };
    }
    
    // Require human approval for high-risk
    if (risk.level === 'high') {
      return await this.requestHumanApproval(change, risk);
    }
    
    // Peer review for medium-risk
    return await this.requestPeerReview(change, risk);
  }
  
  private async assessRisk(change: ProposedChange): Promise<RiskAssessment> {
    const factors = {
      impactScope: this.assessImpactScope(change),
      criticalityOfCode: this.assessCriticality(change),
      testCoverage: await this.assessTestCoverage(change),
      similarityToKnownPatterns: await this.assessSimilarity(change),
      reversibility: this.assessReversibility(change)
    };
    
    return {
      level: this.calculateRiskLevel(factors),
      confidence: this.calculateConfidence(factors),
      factors
    };
  }
}
```

## Self-verification of modifications

Before a self-modifying agent applies a change, run a verification pass
on the draft modification to surface behaviour, edge-case, and security
regressions.

```typescript
class VerifyingSelfModification {
  async modifyCodeWithVerification(
    target: CodeTarget,
    modification: Modification
  ): Promise<VerifiedModification> {
    // Step 1: Generate modification
    const draft = await this.generateModification(target, modification);

    // Step 2: Generate verification questions
    const questions = [
      'Does this preserve the original behavior?',
      'Are there any edge cases not handled?',
      'Is this more efficient than the original?',
      'Are there any security implications?',
      'Is the code more maintainable?'
    ];

    // Step 3: Answer independently (without referencing the draft)
    const answers = await this.answerVerificationQuestions(questions, draft, target);

    // Step 4: Synthesise the verified modification
    return await this.synthesizeVerifiedModification(draft, answers);
  }
}
```

## Best Practices

1. **Always run in sandbox** before applying changes
2. **Maintain rollback capability** for all modifications
3. **Require approval** for high-risk changes
4. **Track all changes** for learning and auditing
5. **Validate behavior preservation** through comprehensive testing
6. **Monitor performance impact** of all modifications
7. **Run a self-verification pass** on high-criticality code-generation outputs before applying them
8. **Implement gradual rollout** for runtime changes
9. **Maintain human oversight** for important systems
10. **Learn from failures** to improve future modifications

## Related Modules

- `ai-native/llm-integration.md` - LLM-powered code generation
- `ai-native/autonomous-debugging.md` - Self-healing systems
- `testing/property-based-testing.md` - Verification strategies
- `security/ai-security.md` - Security for AI-generated code

## Examples

See `examples/self-modifying-code/` for implementations:
- Auto-optimizing API endpoint
- Self-healing microservice
- Evolutionary algorithm optimizer
- Runtime code adaptation system
