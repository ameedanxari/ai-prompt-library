# A/B Testing Template

## Purpose

This template provides comprehensive patterns for implementing A/B testing and experimentation systems that enable data-driven product optimization. It covers experiment design, statistical analysis, variant management, and result interpretation for systematic product improvement through controlled experiments.

## Context

A/B testing is essential for making data-driven product decisions, optimizing user experiences, and validating hypotheses before full rollouts. A well-designed experimentation system enables teams to test changes safely, measure impact accurately, and make informed decisions based on statistical evidence. This template addresses the complexity of building robust A/B testing infrastructure that supports scientific experimentation at scale.

## Instructions

1. **Setup Experimentation Infrastructure**: Configure experiment management and tracking
2. **Implement Experiment Design**: Build experiment creation and configuration tools
3. **Add Statistical Analysis**: Enable proper statistical testing and significance calculation
4. **Configure Variant Management**: Implement user assignment and variant delivery
5. **Enable Result Analysis**: Add comprehensive result interpretation and reporting
6. **Add Multi-variate Testing**: Support complex experiments with multiple variables
7. **Test Statistical Accuracy**: Validate statistical calculations and experiment integrity

## Examples

### Example 1: A/B Testing Service
```typescript
interface ABTestingService {
  createExperiment(config: ExperimentConfig): Promise<Experiment>;
  assignUserToVariant(experimentId: string, userId: string): Promise<string>;
  trackConversion(experimentId: string, userId: string, metric: string): Promise<void>;
  analyzeResults(experimentId: string): Promise<ExperimentResults>;
  stopExperiment(experimentId: string, reason: string): Promise<void>;
}

const abTesting = new ABTestingService();
const experiment = await abTesting.createExperiment({
  name: 'Checkout Button Color',
  hypothesis: 'Green button will increase conversion rate',
  variants: ['control', 'green_button'],
  trafficAllocation: { control: 0.5, green_button: 0.5 },
  primaryMetric: 'checkout_completion'
});
```

### Example 2: Experiment Configuration
```typescript
interface ExperimentDesigner {
  defineExperiment(design: ExperimentDesign): Promise<Experiment>;
  calculateSampleSize(params: SampleSizeParams): Promise<SampleSizeResult>;
  validateExperiment(experiment: Experiment): Promise<ValidationResult>;
  scheduleExperiment(experimentId: string, schedule: ExperimentSchedule): Promise<void>;
}

const sampleSize = await designer.calculateSampleSize({
  baselineConversionRate: 0.15,
  minimumDetectableEffect: 0.02,
  statisticalPower: 0.8,
  significanceLevel: 0.05
});
```

### Example 3: Statistical Analysis
```typescript
interface StatisticalAnalyzer {
  calculateSignificance(results: ExperimentData): Promise<SignificanceResult>;
  performBayesianAnalysis(results: ExperimentData): Promise<BayesianResult>;
  detectStatisticalIssues(experiment: Experiment): Promise<IssueReport>;
  generateInsights(results: ExperimentResults): Promise<ExperimentInsights>;
}

const significance = await analyzer.calculateSignificance({
  control: { conversions: 150, visitors: 1000 },
  variant: { conversions: 180, visitors: 1000 }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableABTesting | Enable A/B testing functionality | boolean | No | true |
| enableMultivariate | Enable multivariate testing | boolean | No | false |
| enableBayesianAnalysis | Enable Bayesian statistical analysis | boolean | No | false |
| defaultSignificanceLevel | Default statistical significance level | number | No | 0.05 |
| defaultStatisticalPower | Default statistical power | number | No | 0.8 |
| minimumSampleSize | Minimum sample size per variant | number | No | 100 |
| maxExperimentDuration | Maximum experiment duration in days | number | No | 30 |
| enableAutoStop | Enable automatic experiment stopping | boolean | No | false |

## Expected Output

This template will produce:
- **Experiment Management System**: Complete experiment lifecycle management
- **Statistical Analysis Engine**: Robust statistical testing and significance calculation
- **Variant Assignment System**: Consistent user assignment and variant delivery
- **Results Dashboard**: Comprehensive experiment results and insights
- **Sample Size Calculator**: Statistical power and sample size calculation
- **Multi-variate Testing**: Support for complex experimental designs
- **Bayesian Analysis**: Advanced statistical analysis capabilities
- **Automated Stopping Rules**: Intelligent experiment termination

## Implementation Patterns

### A/B Testing Architecture

```typescript
// Core A/B Testing Architecture
interface ABTestingSystem {
  experimentManager: ExperimentManager;
  variantAssigner: VariantAssigner;
  statisticalAnalyzer: StatisticalAnalyzer;
  resultTracker: ResultTracker;
  sampleSizeCalculator: SampleSizeCalculator;
  bayesianAnalyzer: BayesianAnalyzer;
}

interface Experiment {
  id: string;
  name: string;
  description: string;
  hypothesis: string;
  
  // Experiment configuration
  variants: ExperimentVariant[];
  trafficAllocation: TrafficAllocation;
  targetAudience: AudienceConfig;
  
  // Metrics and goals
  primaryMetric: string;
  secondaryMetrics: string[];
  guardrailMetrics: string[];
  
  // Statistical configuration
  significanceLevel: number;
  statisticalPower: number;
  minimumDetectableEffect: number;
  
  // Experiment lifecycle
  status: ExperimentStatus;
  startDate?: Date;
  endDate?: Date;
  plannedDuration: number;
  
  // Results
  sampleSize: SampleSizeConfig;
  currentResults?: ExperimentResults;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  tags: string[];
}

interface ExperimentVariant {
  id: string;
  name: string;
  description: string;
  isControl: boolean;
  trafficPercentage: number;
  
  // Variant configuration
  parameters: Record<string, any>;
  featureFlags: Record<string, boolean>;
  
  // Results tracking
  exposures: number;
  conversions: Record<string, number>;
}

interface ExperimentResults {
  experimentId: string;
  analysisDate: Date;
  
  // Overall results
  totalExposures: number;
  experimentDuration: number;
  
  // Variant results
  variantResults: VariantResult[];
  
  // Statistical analysis
  primaryMetricResults: MetricResult;
  secondaryMetricResults: MetricResult[];
  guardrailMetricResults: MetricResult[];
  
  // Decision support
  recommendation: ExperimentRecommendation;
  confidence: number;
  riskAssessment: RiskAssessment;
}
```

**Experiment Management**
```typescript
class ExperimentManager {
  private experimentStore: ExperimentStore;
  private sampleSizeCalculator: SampleSizeCalculator;
  private validator: ExperimentValidator;

  async createExperiment(config: ExperimentConfig): Promise<Experiment> {
    // Validate experiment configuration
    const validation = await this.validator.validate(config);
    if (!validation.valid) {
      throw new Error(`Invalid experiment configuration: ${validation.errors.join(', ')}`);
    }

    // Calculate required sample size
    const sampleSize = await this.sampleSizeCalculator.calculate({
      baselineConversionRate: config.baselineConversionRate,
      minimumDetectableEffect: config.minimumDetectableEffect,
      significanceLevel: config.significanceLevel || 0.05,
      statisticalPower: config.statisticalPower || 0.8,
      variantCount: config.variants.length
    });

    const experiment: Experiment = {
      id: this.generateExperimentId(),
      name: config.name,
      description: config.description,
      hypothesis: config.hypothesis,
      variants: this.normalizeVariants(config.variants),
      trafficAllocation: this.normalizeTrafficAllocation(config.trafficAllocation),
      targetAudience: config.targetAudience || { type: 'all' },
      primaryMetric: config.primaryMetric,
      secondaryMetrics: config.secondaryMetrics || [],
      guardrailMetrics: config.guardrailMetrics || [],
      significanceLevel: config.significanceLevel || 0.05,
      statisticalPower: config.statisticalPower || 0.8,
      minimumDetectableEffect: config.minimumDetectableEffect,
      status: 'draft',
      plannedDuration: config.plannedDuration || 14,
      sampleSize,
      createdBy: config.createdBy,
      createdAt: new Date(),
      tags: config.tags || []
    };

    await this.experimentStore.save(experiment);
    return experiment;
  }

  async startExperiment(experimentId: string): Promise<void> {
    const experiment = await this.experimentStore.findById(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    // Final validation before starting
    const preStartValidation = await this.validator.validateForStart(experiment);
    if (!preStartValidation.valid) {
      throw new Error(`Cannot start experiment: ${preStartValidation.errors.join(', ')}`);
    }

    // Check for conflicting experiments
    const conflicts = await this.checkForConflicts(experiment);
    if (conflicts.length > 0) {
      throw new Error(`Conflicting experiments detected: ${conflicts.join(', ')}`);
    }

    experiment.status = 'running';
    experiment.startDate = new Date();

    await this.experimentStore.update(experiment);
    
    // Initialize tracking
    await this.initializeExperimentTracking(experiment);
    
    // Schedule automatic analysis
    if (this.config.enableAutoAnalysis) {
      await this.scheduleAnalysis(experiment);
    }
  }

  async stopExperiment(experimentId: string, reason: string): Promise<void> {
    const experiment = await this.experimentStore.findById(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    experiment.status = 'stopped';
    experiment.endDate = new Date();

    // Generate final results
    const finalResults = await this.statisticalAnalyzer.analyzeResults(experimentId);
    experiment.currentResults = finalResults;

    await this.experimentStore.update(experiment);
    
    // Notify stakeholders
    await this.notificationService.notifyExperimentStopped(experiment, reason);
  }

  private normalizeVariants(variants: ExperimentVariantConfig[]): ExperimentVariant[] {
    return variants.map((variant, index) => ({
      id: variant.id || `variant_${index}`,
      name: variant.name,
      description: variant.description || '',
      isControl: variant.isControl || index === 0,
      trafficPercentage: variant.trafficPercentage,
      parameters: variant.parameters || {},
      featureFlags: variant.featureFlags || {},
      exposures: 0,
      conversions: {}
    }));
  }

  private async checkForConflicts(experiment: Experiment): Promise<string[]> {
    const runningExperiments = await this.experimentStore.findRunningExperiments();
    const conflicts: string[] = [];

    for (const runningExp of runningExperiments) {
      // Check for audience overlap
      const audienceOverlap = this.checkAudienceOverlap(
        experiment.targetAudience, 
        runningExp.targetAudience
      );

      // Check for metric conflicts
      const metricConflict = this.checkMetricConflicts(
        experiment.primaryMetric, 
        runningExp.primaryMetric
      );

      if (audienceOverlap && metricConflict) {
        conflicts.push(runningExp.name);
      }
    }

    return conflicts;
  }
}
```

### Variant Assignment System

```typescript
class VariantAssigner {
  private experimentStore: ExperimentStore;
  private assignmentStore: AssignmentStore;
  private audienceTargeter: AudienceTargeter;

  async assignUserToVariant(experimentId: string, userId: string): Promise<string> {
    const experiment = await this.experimentStore.findById(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return 'control'; // Default to control if experiment not running
    }

    // Check if user already assigned
    const existingAssignment = await this.assignmentStore.getAssignment(experimentId, userId);
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Check if user matches target audience
    const matchesAudience = await this.audienceTargeter.matches(userId, experiment.targetAudience);
    if (!matchesAudience) {
      return 'control'; // Users outside target audience get control
    }

    // Assign variant based on traffic allocation
    const variantId = this.selectVariant(experiment, userId);
    
    // Store assignment
    await this.assignmentStore.saveAssignment({
      experimentId,
      userId,
      variantId,
      assignedAt: new Date(),
      exposureCount: 0
    });

    return variantId;
  }

  private selectVariant(experiment: Experiment, userId: string): string {
    // Use consistent hashing for stable assignment
    const hash = this.hashUserForExperiment(userId, experiment.id);
    const hashValue = hash % 10000; // Scale to 0-9999

    let cumulativePercentage = 0;
    for (const variant of experiment.variants) {
      cumulativePercentage += variant.trafficPercentage * 100; // Convert to basis points
      if (hashValue < cumulativePercentage) {
        return variant.id;
      }
    }

    // Fallback to control (should not happen with proper traffic allocation)
    return experiment.variants.find(v => v.isControl)?.id || experiment.variants[0].id;
  }

  private hashUserForExperiment(userId: string, experimentId: string): number {
    // Create a consistent hash based on user ID and experiment ID
    const input = `${userId}_${experimentId}`;
    let hash = 0;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }

  async trackExposure(experimentId: string, userId: string): Promise<void> {
    const assignment = await this.assignmentStore.getAssignment(experimentId, userId);
    if (!assignment) return;

    // Increment exposure count
    assignment.exposureCount++;
    assignment.lastExposureAt = new Date();

    await this.assignmentStore.updateAssignment(assignment);

    // Update experiment variant exposure count
    await this.experimentStore.incrementVariantExposure(experimentId, assignment.variantId);
  }
}
```

### Statistical Analysis Engine

```typescript
class StatisticalAnalyzer {
  private experimentStore: ExperimentStore;
  private assignmentStore: AssignmentStore;
  private metricStore: MetricStore;

  async analyzeResults(experimentId: string): Promise<ExperimentResults> {
    const experiment = await this.experimentStore.findById(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    // Get experiment data
    const experimentData = await this.collectExperimentData(experiment);
    
    // Analyze primary metric
    const primaryMetricResults = await this.analyzeMetric(
      experiment.primaryMetric, 
      experimentData
    );

    // Analyze secondary metrics
    const secondaryMetricResults = await Promise.all(
      experiment.secondaryMetrics.map(metric => 
        this.analyzeMetric(metric, experimentData)
      )
    );

    // Analyze guardrail metrics
    const guardrailMetricResults = await Promise.all(
      experiment.guardrailMetrics.map(metric => 
        this.analyzeMetric(metric, experimentData)
      )
    );

    // Generate recommendation
    const recommendation = this.generateRecommendation(
      primaryMetricResults, 
      secondaryMetricResults, 
      guardrailMetricResults
    );

    return {
      experimentId,
      analysisDate: new Date(),
      totalExposures: experimentData.totalExposures,
      experimentDuration: this.calculateDuration(experiment),
      variantResults: experimentData.variantResults,
      primaryMetricResults,
      secondaryMetricResults,
      guardrailMetricResults,
      recommendation,
      confidence: this.calculateOverallConfidence(primaryMetricResults),
      riskAssessment: await this.assessRisk(experiment, primaryMetricResults)
    };
  }

  private async analyzeMetric(
    metricName: string, 
    experimentData: ExperimentData
  ): Promise<MetricResult> {
    const metricConfig = await this.metricStore.getMetricConfig(metricName);
    
    // Calculate metric values for each variant
    const variantMetrics = experimentData.variantResults.map(variant => ({
      variantId: variant.variantId,
      value: this.calculateMetricValue(variant, metricConfig),
      sampleSize: variant.exposures,
      standardError: this.calculateStandardError(variant, metricConfig)
    }));

    // Find control variant
    const controlVariant = variantMetrics.find(v => 
      experimentData.variantResults.find(vr => 
        vr.variantId === v.variantId && vr.isControl
      )
    );

    if (!controlVariant) {
      throw new Error('Control variant not found');
    }

    // Calculate statistical significance for each treatment variant
    const treatmentResults = variantMetrics
      .filter(v => v.variantId !== controlVariant.variantId)
      .map(treatment => this.calculateSignificance(controlVariant, treatment, metricConfig));

    return {
      metricName,
      metricType: metricConfig.type,
      controlValue: controlVariant.value,
      treatmentResults,
      overallSignificant: treatmentResults.some(r => r.isSignificant),
      bestPerformingVariant: this.findBestPerformingVariant(variantMetrics, metricConfig),
      effect: this.calculateOverallEffect(controlVariant, treatmentResults)
    };
  }

  private calculateSignificance(
    control: VariantMetric, 
    treatment: VariantMetric, 
    metricConfig: MetricConfig
  ): TreatmentResult {
    let zScore: number;
    let pValue: number;
    let confidenceInterval: ConfidenceInterval;

    switch (metricConfig.type) {
      case 'conversion_rate':
        ({ zScore, pValue, confidenceInterval } = this.calculateProportionTest(control, treatment));
        break;
      case 'continuous':
        ({ zScore, pValue, confidenceInterval } = this.calculateTTest(control, treatment));
        break;
      case 'count':
        ({ zScore, pValue, confidenceInterval } = this.calculatePoissonTest(control, treatment));
        break;
      default:
        throw new Error(`Unsupported metric type: ${metricConfig.type}`);
    }

    const lift = ((treatment.value - control.value) / control.value) * 100;
    const isSignificant = pValue < 0.05; // Using standard alpha level

    return {
      variantId: treatment.variantId,
      controlValue: control.value,
      treatmentValue: treatment.value,
      lift,
      zScore,
      pValue,
      isSignificant,
      confidenceInterval,
      sampleSize: treatment.sampleSize,
      statisticalPower: this.calculateStatisticalPower(control, treatment, zScore)
    };
  }

  private calculateProportionTest(
    control: VariantMetric, 
    treatment: VariantMetric
  ): StatisticalTestResult {
    const p1 = control.value;
    const p2 = treatment.value;
    const n1 = control.sampleSize;
    const n2 = treatment.sampleSize;

    // Pooled proportion
    const pooledP = ((p1 * n1) + (p2 * n2)) / (n1 + n2);
    
    // Standard error
    const standardError = Math.sqrt(pooledP * (1 - pooledP) * (1/n1 + 1/n2));
    
    // Z-score
    const zScore = (p2 - p1) / standardError;
    
    // P-value (two-tailed test)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));
    
    // Confidence interval for difference in proportions
    const seDiff = Math.sqrt((p1 * (1 - p1) / n1) + (p2 * (1 - p2) / n2));
    const marginOfError = 1.96 * seDiff; // 95% confidence interval
    
    const confidenceInterval: ConfidenceInterval = {
      lower: (p2 - p1) - marginOfError,
      upper: (p2 - p1) + marginOfError,
      level: 0.95
    };

    return { zScore, pValue, confidenceInterval };
  }

  private calculateTTest(
    control: VariantMetric, 
    treatment: VariantMetric
  ): StatisticalTestResult {
    // Welch's t-test for unequal variances
    const mean1 = control.value;
    const mean2 = treatment.value;
    const var1 = Math.pow(control.standardError, 2);
    const var2 = Math.pow(treatment.standardError, 2);
    const n1 = control.sampleSize;
    const n2 = treatment.sampleSize;

    // Standard error of difference
    const seDiff = Math.sqrt(var1/n1 + var2/n2);
    
    // T-statistic
    const tScore = (mean2 - mean1) / seDiff;
    
    // Degrees of freedom (Welch-Satterthwaite equation)
    const df = Math.pow(var1/n1 + var2/n2, 2) / 
               (Math.pow(var1/n1, 2)/(n1-1) + Math.pow(var2/n2, 2)/(n2-1));
    
    // P-value (approximated using normal distribution for large samples)
    const pValue = 2 * (1 - this.normalCDF(Math.abs(tScore)));
    
    // Confidence interval
    const marginOfError = 1.96 * seDiff; // Using normal approximation
    const confidenceInterval: ConfidenceInterval = {
      lower: (mean2 - mean1) - marginOfError,
      upper: (mean2 - mean1) + marginOfError,
      level: 0.95
    };

    return { zScore: tScore, pValue, confidenceInterval };
  }

  private normalCDF(x: number): number {
    // Approximation of the cumulative distribution function for standard normal distribution
    return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
  }

  private erf(x: number): number {
    // Approximation of the error function
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  }

  private generateRecommendation(
    primaryMetric: MetricResult,
    secondaryMetrics: MetricResult[],
    guardrailMetrics: MetricResult[]
  ): ExperimentRecommendation {
    // Check guardrail metrics first
    const guardrailViolations = guardrailMetrics.filter(metric => 
      metric.treatmentResults.some(result => 
        result.isSignificant && result.lift < 0
      )
    );

    if (guardrailViolations.length > 0) {
      return {
        decision: 'do_not_launch',
        confidence: 'high',
        reason: 'Guardrail metrics show significant negative impact',
        details: guardrailViolations.map(v => v.metricName)
      };
    }

    // Analyze primary metric
    const primarySignificant = primaryMetric.overallSignificant;
    const primaryPositive = primaryMetric.treatmentResults.some(r => 
      r.isSignificant && r.lift > 0
    );

    if (primarySignificant && primaryPositive) {
      // Check if secondary metrics support the decision
      const supportingSecondaryMetrics = secondaryMetrics.filter(metric =>
        metric.treatmentResults.some(result => 
          result.isSignificant && result.lift > 0
        )
      ).length;

      const conflictingSecondaryMetrics = secondaryMetrics.filter(metric =>
        metric.treatmentResults.some(result => 
          result.isSignificant && result.lift < 0
        )
      ).length;

      if (conflictingSecondaryMetrics === 0) {
        return {
          decision: 'launch',
          confidence: supportingSecondaryMetrics > 0 ? 'high' : 'medium',
          reason: 'Primary metric shows significant positive impact',
          details: [primaryMetric.bestPerformingVariant]
        };
      } else {
        return {
          decision: 'investigate',
          confidence: 'medium',
          reason: 'Primary metric positive but secondary metrics show mixed results',
          details: ['Requires further analysis of trade-offs']
        };
      }
    } else if (primarySignificant && !primaryPositive) {
      return {
        decision: 'do_not_launch',
        confidence: 'high',
        reason: 'Primary metric shows significant negative impact',
        details: [primaryMetric.metricName]
      };
    } else {
      return {
        decision: 'continue_testing',
        confidence: 'low',
        reason: 'No significant impact detected on primary metric',
        details: ['Consider increasing sample size or test duration']
      };
    }
  }
}
```

### Sample Size Calculator

```typescript
class SampleSizeCalculator {
  async calculate(params: SampleSizeParams): Promise<SampleSizeResult> {
    const {
      baselineConversionRate,
      minimumDetectableEffect,
      significanceLevel = 0.05,
      statisticalPower = 0.8,
      variantCount = 2
    } = params;

    // Calculate effect size
    const effectSize = this.calculateEffectSize(
      baselineConversionRate,
      minimumDetectableEffect
    );

    // Calculate sample size per variant
    const sampleSizePerVariant = this.calculateSampleSizePerVariant(
      effectSize,
      significanceLevel,
      statisticalPower
    );

    // Adjust for multiple comparisons if more than 2 variants
    const adjustedSampleSize = variantCount > 2 
      ? this.adjustForMultipleComparisons(sampleSizePerVariant, variantCount)
      : sampleSizePerVariant;

    // Calculate total sample size
    const totalSampleSize = adjustedSampleSize * variantCount;

    // Estimate test duration
    const estimatedDuration = await this.estimateTestDuration(
      totalSampleSize,
      params.expectedTrafficPerDay
    );

    return {
      sampleSizePerVariant: Math.ceil(adjustedSampleSize),
      totalSampleSize: Math.ceil(totalSampleSize),
      estimatedDuration,
      effectSize,
      assumptions: {
        baselineConversionRate,
        minimumDetectableEffect,
        significanceLevel,
        statisticalPower,
        variantCount
      },
      recommendations: this.generateSampleSizeRecommendations(params, adjustedSampleSize)
    };
  }

  private calculateEffectSize(
    baselineRate: number,
    minimumDetectableEffect: number
  ): number {
    // Cohen's h for proportions
    const p1 = baselineRate;
    const p2 = baselineRate + minimumDetectableEffect;
    
    return 2 * (Math.asin(Math.sqrt(p2)) - Math.asin(Math.sqrt(p1)));
  }

  private calculateSampleSizePerVariant(
    effectSize: number,
    alpha: number,
    power: number
  ): number {
    // Z-scores for alpha and power
    const zAlpha = this.inverseNormalCDF(1 - alpha/2);
    const zBeta = this.inverseNormalCDF(power);
    
    // Sample size formula for two proportions
    return Math.pow((zAlpha + zBeta) / effectSize, 2) * 2;
  }

  private adjustForMultipleComparisons(
    baseSampleSize: number,
    variantCount: number
  ): number {
    // Bonferroni correction
    const comparisons = variantCount - 1; // Number of treatment vs control comparisons
    const adjustmentFactor = Math.log(comparisons) / Math.log(2); // Conservative adjustment
    
    return baseSampleSize * (1 + adjustmentFactor * 0.1);
  }

  private async estimateTestDuration(
    totalSampleSize: number,
    expectedTrafficPerDay?: number
  ): Promise<TestDurationEstimate> {
    if (!expectedTrafficPerDay) {
      return {
        days: null,
        confidence: 'unknown',
        assumptions: 'Traffic data not provided'
      };
    }

    const estimatedDays = Math.ceil(totalSampleSize / expectedTrafficPerDay);
    
    return {
      days: estimatedDays,
      confidence: estimatedDays <= 14 ? 'high' : estimatedDays <= 30 ? 'medium' : 'low',
      assumptions: `Based on ${expectedTrafficPerDay} visitors per day`
    };
  }
}
```

### Bayesian Analysis

```typescript
class BayesianAnalyzer {
  async performBayesianAnalysis(experimentData: ExperimentData): Promise<BayesianResult> {
    const controlData = experimentData.variantResults.find(v => v.isControl);
    const treatmentData = experimentData.variantResults.filter(v => !v.isControl);

    if (!controlData) throw new Error('Control variant not found');

    const bayesianResults = await Promise.all(
      treatmentData.map(treatment => 
        this.analyzeBayesianComparison(controlData, treatment)
      )
    );

    return {
      analysisType: 'bayesian',
      controlPosterior: await this.calculatePosterior(controlData),
      treatmentPosteriors: bayesianResults.map(r => r.treatmentPosterior),
      probabilityOfImprovement: bayesianResults.map(r => r.probabilityOfImprovement),
      expectedLift: bayesianResults.map(r => r.expectedLift),
      credibleIntervals: bayesianResults.map(r => r.credibleInterval),
      riskOfLoss: bayesianResults.map(r => r.riskOfLoss),
      recommendation: this.generateBayesianRecommendation(bayesianResults)
    };
  }

  private async analyzeBayesianComparison(
    control: VariantResult,
    treatment: VariantResult
  ): Promise<BayesianComparison> {
    // Use Beta distribution for conversion rate analysis
    const controlPosterior = this.calculateBetaPosterior(control);
    const treatmentPosterior = this.calculateBetaPosterior(treatment);

    // Monte Carlo simulation to calculate probabilities
    const simulations = 10000;
    const controlSamples = this.sampleFromBeta(controlPosterior, simulations);
    const treatmentSamples = this.sampleFromBeta(treatmentPosterior, simulations);

    // Calculate probability of improvement
    const improvements = treatmentSamples.filter((t, i) => t > controlSamples[i]).length;
    const probabilityOfImprovement = improvements / simulations;

    // Calculate expected lift
    const lifts = treatmentSamples.map((t, i) => (t - controlSamples[i]) / controlSamples[i]);
    const expectedLift = this.mean(lifts);

    // Calculate credible interval
    const sortedLifts = lifts.sort((a, b) => a - b);
    const credibleInterval = {
      lower: sortedLifts[Math.floor(simulations * 0.025)],
      upper: sortedLifts[Math.floor(simulations * 0.975)],
      level: 0.95
    };

    // Calculate risk of loss (probability of negative impact > 1%)
    const significantLosses = lifts.filter(lift => lift < -0.01).length;
    const riskOfLoss = significantLosses / simulations;

    return {
      treatmentVariantId: treatment.variantId,
      controlPosterior,
      treatmentPosterior,
      probabilityOfImprovement,
      expectedLift,
      credibleInterval,
      riskOfLoss
    };
  }

  private calculateBetaPosterior(variant: VariantResult): BetaDistribution {
    // Using uniform prior (Beta(1,1))
    const priorAlpha = 1;
    const priorBeta = 1;

    const successes = variant.conversions;
    const failures = variant.exposures - variant.conversions;

    return {
      alpha: priorAlpha + successes,
      beta: priorBeta + failures
    };
  }

  private sampleFromBeta(distribution: BetaDistribution, count: number): number[] {
    const samples: number[] = [];
    
    for (let i = 0; i < count; i++) {
      // Use gamma distribution to generate beta samples
      const x = this.sampleFromGamma(distribution.alpha, 1);
      const y = this.sampleFromGamma(distribution.beta, 1);
      samples.push(x / (x + y));
    }
    
    return samples;
  }

  private generateBayesianRecommendation(
    results: BayesianComparison[]
  ): BayesianRecommendation {
    const bestVariant = results.reduce((best, current) => 
      current.probabilityOfImprovement > best.probabilityOfImprovement ? current : best
    );

    if (bestVariant.probabilityOfImprovement > 0.95 && bestVariant.riskOfLoss < 0.05) {
      return {
        decision: 'launch',
        confidence: 'high',
        reason: `${(bestVariant.probabilityOfImprovement * 100).toFixed(1)}% probability of improvement with low risk`,
        variantId: bestVariant.treatmentVariantId
      };
    } else if (bestVariant.probabilityOfImprovement > 0.8 && bestVariant.riskOfLoss < 0.1) {
      return {
        decision: 'launch',
        confidence: 'medium',
        reason: `${(bestVariant.probabilityOfImprovement * 100).toFixed(1)}% probability of improvement`,
        variantId: bestVariant.treatmentVariantId
      };
    } else if (bestVariant.riskOfLoss > 0.2) {
      return {
        decision: 'do_not_launch',
        confidence: 'high',
        reason: `High risk of negative impact (${(bestVariant.riskOfLoss * 100).toFixed(1)}%)`,
        variantId: null
      };
    } else {
      return {
        decision: 'continue_testing',
        confidence: 'medium',
        reason: 'Insufficient evidence for decision',
        variantId: null
      };
    }
  }
}
```

## Integration Points

### Analytics Platform Integration
```typescript
interface ExperimentAnalyticsIntegration {
  // Google Optimize integration
  googleOptimize: {
    containerId: string;
    enableServerSide: boolean;
    customDimensions: string[];
  };
  
  // Optimizely integration
  optimizely: {
    sdkKey: string;
    enableEventTracking: boolean;
    customAttributes: string[];
  };
  
  // Custom analytics integration
  customAnalytics: {
    experimentEventEndpoint: string;
    conversionEventEndpoint: string;
    batchSize: number;
  };
}

class ExperimentIntegrationService {
  async syncExperimentToAnalytics(experiment: Experiment): Promise<void> {
    if (this.config.googleOptimize.enabled) {
      await this.syncToGoogleOptimize(experiment);
    }
    
    if (this.config.optimizely.enabled) {
      await this.syncToOptimizely(experiment);
    }
    
    if (this.config.customAnalytics.enabled) {
      await this.syncToCustomAnalytics(experiment);
    }
  }
}
```

## Security Considerations

### Experiment Data Privacy
```typescript
class PrivacyCompliantExperimentation {
  async createAnonymizedExperiment(config: ExperimentConfig): Promise<Experiment> {
    // Create experiment without storing individual user assignments
    const experiment = await this.experimentManager.createExperiment(config);
    
    // Use privacy-preserving assignment method
    await this.setupPrivacyPreservingAssignment(experiment);
    
    return experiment;
  }

  async handleDataDeletionRequest(userId: string): Promise<void> {
    // Remove user from all experiment assignments
    await this.assignmentStore.deleteUserAssignments(userId);
    
    // Update experiment statistics without individual data
    const affectedExperiments = await this.getExperimentsForUser(userId);
    for (const experimentId of affectedExperiments) {
      await this.recalculateExperimentStats(experimentId);
    }
  }
}
```

## Testing Considerations

### A/B Testing System Testing
```typescript
describe('A/B Testing Statistical Accuracy', () => {
  it('should calculate sample size correctly', async () => {
    const sampleSize = await calculator.calculate({
      baselineConversionRate: 0.1,
      minimumDetectableEffect: 0.02,
      significanceLevel: 0.05,
      statisticalPower: 0.8
    });
    
    expect(sampleSize.sampleSizePerVariant).toBeGreaterThan(1000);
  });

  it('should assign users consistently to variants', async () => {
    const experiment = await createTestExperiment();
    const userId = 'test-user-123';
    
    // Multiple assignments should return same variant
    const assignment1 = await assigner.assignUserToVariant(experiment.id, userId);
    const assignment2 = await assigner.assignUserToVariant(experiment.id, userId);
    
    expect(assignment1).toBe(assignment2);
  });

  it('should calculate statistical significance correctly', async () => {
    const experimentData = {
      control: { conversions: 100, exposures: 1000 },
      treatment: { conversions: 130, exposures: 1000 }
    };
    
    const results = await analyzer.analyzeResults(experimentData);
    expect(results.primaryMetricResults.overallSignificant).toBe(true);
  });
});
```

## Real-World Considerations

### Statistical Best Practices
- Always pre-define success metrics and sample sizes
- Account for multiple testing when running multiple experiments
- Monitor for novelty effects and seasonal variations
- Implement proper randomization and stratification

### Operational Excellence
- Set up automated monitoring for experiment health
- Implement guardrail metrics to prevent negative impacts
- Create clear experiment governance and approval processes
- Maintain experiment documentation and learnings repository

### Scalability and Performance
- Use efficient assignment algorithms for high-traffic applications
- Implement caching for experiment configurations
- Design for horizontal scaling of analysis systems
- Optimize statistical calculations for real-time analysis