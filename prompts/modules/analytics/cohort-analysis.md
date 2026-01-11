# Cohort Analysis Template

## Purpose

This template provides comprehensive patterns for implementing cohort analysis systems that track user groups over time, analyze retention patterns, and provide insights into user lifecycle behavior. It covers cohort creation, retention analysis, lifecycle tracking, and behavioral segmentation for data-driven user engagement optimization.

## Context

Cohort analysis is essential for understanding user retention, identifying patterns in user behavior over time, and measuring the long-term impact of product changes. A well-designed cohort analysis system groups users by shared characteristics or time periods and tracks their behavior longitudinally. This template addresses the complexity of building comprehensive cohort analysis that supports user retention optimization and lifecycle management.

## Instructions

1. **Setup Cohort Infrastructure**: Configure cohort creation and tracking systems
2. **Implement Retention Analysis**: Build comprehensive retention tracking
3. **Add Lifecycle Tracking**: Enable user lifecycle stage analysis
4. **Configure Behavioral Cohorts**: Implement behavior-based cohort segmentation
5. **Enable Predictive Analytics**: Add churn prediction and lifetime value modeling
6. **Add Comparative Analysis**: Build cohort comparison and benchmarking
7. **Test Cohort Accuracy**: Validate cohort calculations and retention metrics

## Examples

### Example 1: Cohort Analysis Service
```typescript
interface CohortAnalysisService {
  createTimeCohort(period: TimePeriod, startDate: Date): Promise<Cohort>;
  createBehaviorCohort(criteria: BehaviorCriteria): Promise<Cohort>;
  analyzeRetention(cohortId: string, periods: number): Promise<RetentionAnalysis>;
  getLifecycleAnalysis(cohortId: string): Promise<LifecycleAnalysis>;
  compareCohorts(cohortIds: string[]): Promise<CohortComparison>;
}

const cohortService = new CohortAnalysisService();
const cohort = await cohortService.createTimeCohort('weekly', new Date('2024-01-01'));
const retention = await cohortService.analyzeRetention(cohort.id, 12);
```

### Example 2: Retention Tracking
```typescript
interface RetentionTracker {
  trackUserActivity(userId: string, activity: ActivityEvent): Promise<void>;
  calculateRetentionRate(cohortId: string, period: number): Promise<number>;
  getRetentionCurve(cohortId: string): Promise<RetentionCurve>;
  identifyChurnRisk(cohortId: string): Promise<ChurnRiskAnalysis>;
}

const retention = await tracker.calculateRetentionRate('cohort-2024-w1', 4);
console.log(`4-week retention: ${(retention * 100).toFixed(1)}%`);
```

### Example 3: Lifecycle Analysis
```typescript
interface LifecycleAnalyzer {
  defineLifecycleStages(stages: LifecycleStage[]): Promise<void>;
  trackUserProgression(userId: string): Promise<UserLifecycle>;
  analyzeStageTransitions(cohortId: string): Promise<StageTransitionAnalysis>;
  predictLifetimeValue(cohortId: string): Promise<LTVPrediction>;
}

const lifecycle = await analyzer.trackUserProgression('user-123');
console.log(`Current stage: ${lifecycle.currentStage}`);
console.log(`Days in stage: ${lifecycle.daysInCurrentStage}`);
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableTimeCohorts | Enable time-based cohort creation | boolean | No | true |
| enableBehaviorCohorts | Enable behavior-based cohorts | boolean | No | true |
| enableRetentionTracking | Enable retention analysis | boolean | No | true |
| enableLifecycleTracking | Enable lifecycle stage tracking | boolean | No | true |
| retentionPeriods | Number of periods to track retention | number | No | 12 |
| cohortSizeThreshold | Minimum cohort size for analysis | number | No | 100 |
| enablePredictiveAnalytics | Enable churn and LTV prediction | boolean | No | false |
| dataRetentionMonths | Months to retain cohort data | number | No | 24 |

## Expected Output

This template will produce:
- **Cohort Creation System**: Time-based and behavior-based cohort generation
- **Retention Analysis**: Comprehensive retention tracking and analysis
- **Lifecycle Tracking**: User lifecycle stage progression analysis
- **Churn Prediction**: Predictive models for user churn risk
- **Lifetime Value Analysis**: Customer lifetime value calculation and prediction
- **Comparative Analytics**: Cohort comparison and benchmarking tools
- **Retention Dashboards**: Visual retention curves and cohort tables
- **Actionable Insights**: Data-driven recommendations for retention improvement

## Implementation Patterns

### Cohort Analysis Architecture

```typescript
// Core Cohort Analysis Architecture
interface CohortAnalysisSystem {
  cohortManager: CohortManager;
  retentionTracker: RetentionTracker;
  lifecycleAnalyzer: LifecycleAnalyzer;
  churnPredictor: ChurnPredictor;
  ltvCalculator: LTVCalculator;
  comparativeAnalyzer: ComparativeAnalyzer;
}

interface Cohort {
  id: string;
  name: string;
  type: 'time' | 'behavior' | 'acquisition' | 'feature';
  createdAt: Date;
  
  // Cohort definition
  criteria: CohortCriteria;
  period: TimePeriod;
  startDate: Date;
  endDate?: Date;
  
  // Cohort metrics
  initialSize: number;
  currentSize: number;
  
  // Metadata
  description?: string;
  tags: string[];
  isActive: boolean;
}

interface RetentionAnalysis {
  cohortId: string;
  cohortName: string;
  analysisDate: Date;
  
  // Retention metrics
  periods: RetentionPeriod[];
  retentionCurve: RetentionPoint[];
  
  // Key metrics
  dayOneRetention: number;
  daySevenRetention: number;
  dayThirtyRetention: number;
  
  // Comparative metrics
  industryBenchmark?: number;
  previousCohortComparison?: number;
  
  // Insights
  retentionTrend: 'improving' | 'declining' | 'stable';
  churnRate: number;
  halfLife: number; // Days until 50% retention
}

interface LifecycleAnalysis {
  cohortId: string;
  stages: LifecycleStageAnalysis[];
  
  // Transition metrics
  averageTimeToActivation: number;
  averageTimeToValue: number;
  conversionRates: StageConversionRate[];
  
  // Lifecycle health
  healthScore: number;
  riskFactors: RiskFactor[];
  opportunities: Opportunity[];
}
```

**Cohort Creation and Management**
```typescript
class CohortManager {
  private userStore: UserStore;
  private eventStore: EventStore;
  private cohortStore: CohortStore;

  async createTimeCohort(
    period: TimePeriod, 
    startDate: Date, 
    criteria?: AdditionalCriteria
  ): Promise<Cohort> {
    const endDate = this.calculatePeriodEnd(startDate, period);
    
    // Find users who first performed the cohort-defining action in this period
    const cohortUsers = await this.findCohortUsers(startDate, endDate, criteria);
    
    const cohort: Cohort = {
      id: this.generateCohortId(),
      name: this.generateCohortName(period, startDate),
      type: 'time',
      createdAt: new Date(),
      criteria: {
        type: 'time_based',
        period,
        startDate,
        endDate,
        additionalCriteria: criteria
      },
      period,
      startDate,
      endDate,
      initialSize: cohortUsers.length,
      currentSize: cohortUsers.length,
      tags: [period, 'time-based'],
      isActive: true
    };

    await this.cohortStore.save(cohort);
    await this.saveCohortMembership(cohort.id, cohortUsers);
    
    return cohort;
  }

  async createBehaviorCohort(criteria: BehaviorCriteria): Promise<Cohort> {
    // Find users who match the behavioral criteria
    const cohortUsers = await this.findUsersByBehavior(criteria);
    
    const cohort: Cohort = {
      id: this.generateCohortId(),
      name: criteria.name,
      type: 'behavior',
      createdAt: new Date(),
      criteria: {
        type: 'behavior_based',
        ...criteria
      },
      period: 'custom',
      startDate: criteria.timeRange.start,
      endDate: criteria.timeRange.end,
      initialSize: cohortUsers.length,
      currentSize: cohortUsers.length,
      description: criteria.description,
      tags: ['behavior-based', ...criteria.tags],
      isActive: true
    };

    await this.cohortStore.save(cohort);
    await this.saveCohortMembership(cohort.id, cohortUsers);
    
    return cohort;
  }

  private async findCohortUsers(
    startDate: Date, 
    endDate: Date, 
    criteria?: AdditionalCriteria
  ): Promise<string[]> {
    // Default cohort-defining event is user registration/first activity
    const cohortEvent = criteria?.cohortEvent || 'user_registered';
    
    const events = await this.eventStore.query({
      eventType: cohortEvent,
      timeRange: { start: startDate, end: endDate },
      ...(criteria?.filters && { filters: criteria.filters })
    });

    // Get unique users (first occurrence only)
    const userFirstEvents = new Map<string, Date>();
    
    for (const event of events) {
      const existingDate = userFirstEvents.get(event.userId);
      if (!existingDate || event.timestamp < existingDate) {
        userFirstEvents.set(event.userId, event.timestamp);
      }
    }

    // Filter users whose first event was in the cohort period
    return Array.from(userFirstEvents.entries())
      .filter(([_, firstEventDate]) => 
        firstEventDate >= startDate && firstEventDate <= endDate
      )
      .map(([userId, _]) => userId);
  }

  private async findUsersByBehavior(criteria: BehaviorCriteria): Promise<string[]> {
    const matchingUsers: string[] = [];
    
    // Get all users in the time range
    const users = await this.userStore.getUsersInRange(
      criteria.timeRange.start, 
      criteria.timeRange.end
    );

    for (const user of users) {
      const matches = await this.evaluateBehaviorCriteria(user.id, criteria);
      if (matches) {
        matchingUsers.push(user.id);
      }
    }

    return matchingUsers;
  }

  private async evaluateBehaviorCriteria(
    userId: string, 
    criteria: BehaviorCriteria
  ): Promise<boolean> {
    for (const rule of criteria.rules) {
      const ruleMatches = await this.evaluateBehaviorRule(userId, rule);
      
      // Using AND logic - all rules must match
      if (!ruleMatches) {
        return false;
      }
    }

    return true;
  }
}
```

### Retention Analysis Implementation

```typescript
class RetentionTracker {
  private cohortStore: CohortStore;
  private eventStore: EventStore;
  private membershipStore: CohortMembershipStore;

  async analyzeRetention(cohortId: string, periods: number): Promise<RetentionAnalysis> {
    const cohort = await this.cohortStore.findById(cohortId);
    if (!cohort) throw new Error('Cohort not found');

    const cohortMembers = await this.membershipStore.getCohortMembers(cohortId);
    const retentionPeriods = await this.calculateRetentionPeriods(
      cohort, 
      cohortMembers, 
      periods
    );

    // Calculate key retention metrics
    const dayOneRetention = await this.calculateDayNRetention(cohort, cohortMembers, 1);
    const daySevenRetention = await this.calculateDayNRetention(cohort, cohortMembers, 7);
    const dayThirtyRetention = await this.calculateDayNRetention(cohort, cohortMembers, 30);

    // Build retention curve
    const retentionCurve = retentionPeriods.map((period, index) => ({
      period: index,
      retentionRate: period.retentionRate,
      activeUsers: period.activeUsers,
      churnedUsers: period.churnedUsers
    }));

    // Calculate derived metrics
    const churnRate = this.calculateChurnRate(retentionPeriods);
    const halfLife = this.calculateHalfLife(retentionCurve);
    const retentionTrend = this.analyzeRetentionTrend(retentionCurve);

    return {
      cohortId,
      cohortName: cohort.name,
      analysisDate: new Date(),
      periods: retentionPeriods,
      retentionCurve,
      dayOneRetention,
      daySevenRetention,
      dayThirtyRetention,
      retentionTrend,
      churnRate,
      halfLife
    };
  }

  private async calculateRetentionPeriods(
    cohort: Cohort, 
    members: string[], 
    periods: number
  ): Promise<RetentionPeriod[]> {
    const retentionPeriods: RetentionPeriod[] = [];
    
    for (let period = 0; period < periods; period++) {
      const periodStart = this.calculatePeriodStart(cohort.startDate, period, cohort.period);
      const periodEnd = this.calculatePeriodEnd(periodStart, cohort.period);
      
      // Count active users in this period
      const activeUsers = await this.countActiveUsersInPeriod(
        members, 
        periodStart, 
        periodEnd
      );
      
      const retentionRate = activeUsers / members.length;
      const churnedUsers = members.length - activeUsers;
      
      retentionPeriods.push({
        period,
        periodStart,
        periodEnd,
        activeUsers,
        churnedUsers,
        retentionRate,
        cumulativeChurn: period === 0 ? 0 : 
          retentionPeriods[period - 1].cumulativeChurn + churnedUsers
      });
    }
    
    return retentionPeriods;
  }

  private async countActiveUsersInPeriod(
    userIds: string[], 
    startDate: Date, 
    endDate: Date
  ): Promise<number> {
    // Define what constitutes "active" - could be any event, specific events, etc.
    const activeUserEvents = await this.eventStore.query({
      userId: { $in: userIds },
      timeRange: { start: startDate, end: endDate },
      eventType: this.getRetentionEvents() // Configurable retention events
    });

    // Count unique active users
    const activeUsers = new Set(activeUserEvents.map(e => e.userId));
    return activeUsers.size;
  }

  private calculateHalfLife(retentionCurve: RetentionPoint[]): number {
    // Find the period where retention drops to 50%
    for (let i = 0; i < retentionCurve.length; i++) {
      if (retentionCurve[i].retentionRate <= 0.5) {
        // Interpolate for more accurate half-life
        if (i > 0) {
          const prev = retentionCurve[i - 1];
          const curr = retentionCurve[i];
          const ratio = (0.5 - prev.retentionRate) / (curr.retentionRate - prev.retentionRate);
          return prev.period + ratio;
        }
        return i;
      }
    }
    
    // If retention never drops to 50%, extrapolate
    return this.extrapolateHalfLife(retentionCurve);
  }

  private analyzeRetentionTrend(retentionCurve: RetentionPoint[]): 'improving' | 'declining' | 'stable' {
    if (retentionCurve.length < 3) return 'stable';
    
    // Compare recent periods to earlier periods
    const recentPeriods = retentionCurve.slice(-3);
    const earlierPeriods = retentionCurve.slice(1, 4); // Skip period 0 (100% retention)
    
    const recentAvg = this.average(recentPeriods.map(p => p.retentionRate));
    const earlierAvg = this.average(earlierPeriods.map(p => p.retentionRate));
    
    const difference = recentAvg - earlierAvg;
    
    if (difference > 0.05) return 'improving';
    if (difference < -0.05) return 'declining';
    return 'stable';
  }

  async predictChurnRisk(cohortId: string): Promise<ChurnRiskAnalysis> {
    const cohort = await this.cohortStore.findById(cohortId);
    const members = await this.membershipStore.getCohortMembers(cohortId);
    
    const riskAnalysis: UserChurnRisk[] = [];
    
    for (const userId of members) {
      const riskScore = await this.calculateChurnRiskScore(userId, cohort);
      const riskFactors = await this.identifyRiskFactors(userId, cohort);
      
      riskAnalysis.push({
        userId,
        riskScore,
        riskLevel: this.categorizeRiskLevel(riskScore),
        riskFactors,
        recommendedActions: this.generateRetentionActions(riskScore, riskFactors)
      });
    }
    
    // Sort by risk score (highest first)
    riskAnalysis.sort((a, b) => b.riskScore - a.riskScore);
    
    return {
      cohortId,
      analysisDate: new Date(),
      totalUsers: members.length,
      highRiskUsers: riskAnalysis.filter(r => r.riskLevel === 'high').length,
      mediumRiskUsers: riskAnalysis.filter(r => r.riskLevel === 'medium').length,
      lowRiskUsers: riskAnalysis.filter(r => r.riskLevel === 'low').length,
      userRiskAnalysis: riskAnalysis,
      cohortRiskFactors: this.aggregateRiskFactors(riskAnalysis)
    };
  }

  private async calculateChurnRiskScore(userId: string, cohort: Cohort): Promise<number> {
    let riskScore = 0;
    
    // Factor 1: Days since last activity (40% weight)
    const daysSinceLastActivity = await this.getDaysSinceLastActivity(userId);
    const activityRisk = Math.min(daysSinceLastActivity / 30, 1) * 40;
    riskScore += activityRisk;
    
    // Factor 2: Engagement decline (30% weight)
    const engagementTrend = await this.getEngagementTrend(userId, 30);
    const engagementRisk = engagementTrend < 0 ? Math.abs(engagementTrend) * 30 : 0;
    riskScore += engagementRisk;
    
    // Factor 3: Feature usage decline (20% weight)
    const featureUsageTrend = await this.getFeatureUsageTrend(userId, 30);
    const featureRisk = featureUsageTrend < 0 ? Math.abs(featureUsageTrend) * 20 : 0;
    riskScore += featureRisk;
    
    // Factor 4: Support interactions (10% weight)
    const recentSupportTickets = await this.getRecentSupportTickets(userId, 14);
    const supportRisk = Math.min(recentSupportTickets * 5, 10);
    riskScore += supportRisk;
    
    return Math.min(riskScore, 100);
  }
}
```

### Lifecycle Analysis Implementation

```typescript
class LifecycleAnalyzer {
  private cohortStore: CohortStore;
  private eventStore: EventStore;
  private userStore: UserStore;
  private stageDefinitions: LifecycleStage[];

  async defineLifecycleStages(stages: LifecycleStage[]): Promise<void> {
    this.stageDefinitions = stages;
    await this.stageStore.saveDefinitions(stages);
  }

  async analyzeLifecycle(cohortId: string): Promise<LifecycleAnalysis> {
    const cohort = await this.cohortStore.findById(cohortId);
    const members = await this.membershipStore.getCohortMembers(cohortId);
    
    // Analyze each user's lifecycle progression
    const userLifecycles = await Promise.all(
      members.map(userId => this.trackUserProgression(userId))
    );
    
    // Aggregate stage analysis
    const stageAnalysis = await this.analyzeStageDistribution(userLifecycles);
    
    // Calculate transition metrics
    const transitionAnalysis = await this.analyzeStageTransitions(userLifecycles);
    
    // Calculate key lifecycle metrics
    const averageTimeToActivation = this.calculateAverageTimeToStage(
      userLifecycles, 
      'activated'
    );
    const averageTimeToValue = this.calculateAverageTimeToStage(
      userLifecycles, 
      'value_realized'
    );
    
    return {
      cohortId,
      stages: stageAnalysis,
      averageTimeToActivation,
      averageTimeToValue,
      conversionRates: transitionAnalysis.conversionRates,
      healthScore: this.calculateLifecycleHealthScore(stageAnalysis, transitionAnalysis),
      riskFactors: await this.identifyLifecycleRiskFactors(userLifecycles),
      opportunities: await this.identifyLifecycleOpportunities(stageAnalysis, transitionAnalysis)
    };
  }

  async trackUserProgression(userId: string): Promise<UserLifecycle> {
    const user = await this.userStore.findById(userId);
    const userEvents = await this.eventStore.getUserEvents(userId);
    
    // Determine current stage
    const currentStage = await this.determineCurrentStage(userId, userEvents);
    
    // Calculate stage history
    const stageHistory = await this.calculateStageHistory(userId, userEvents);
    
    // Calculate time in each stage
    const timeInStages = this.calculateTimeInStages(stageHistory);
    
    return {
      userId,
      registrationDate: user.createdAt,
      currentStage: currentStage.name,
      currentStageStartDate: currentStage.startDate,
      daysInCurrentStage: this.calculateDaysInStage(currentStage.startDate),
      stageHistory,
      timeInStages,
      totalLifecycleDays: this.calculateDaysSince(user.createdAt),
      progressionRate: this.calculateProgressionRate(stageHistory),
      isStuck: this.isUserStuck(currentStage, timeInStages),
      nextExpectedStage: this.getNextExpectedStage(currentStage.name)
    };
  }

  private async determineCurrentStage(
    userId: string, 
    events: AnalyticsEvent[]
  ): Promise<CurrentStage> {
    // Check stages in reverse order (most advanced first)
    const reversedStages = [...this.stageDefinitions].reverse();
    
    for (const stage of reversedStages) {
      const stageAchieved = await this.hasAchievedStage(userId, stage, events);
      if (stageAchieved.achieved) {
        return {
          name: stage.name,
          startDate: stageAchieved.achievedDate,
          criteria: stage.criteria
        };
      }
    }
    
    // Default to first stage if no criteria met
    return {
      name: this.stageDefinitions[0].name,
      startDate: events[0]?.timestamp || new Date(),
      criteria: this.stageDefinitions[0].criteria
    };
  }

  private async hasAchievedStage(
    userId: string, 
    stage: LifecycleStage, 
    events: AnalyticsEvent[]
  ): Promise<StageAchievement> {
    for (const criterion of stage.criteria) {
      const criterionMet = await this.evaluateStageCriterion(userId, criterion, events);
      if (!criterionMet.met) {
        return { achieved: false };
      }
    }
    
    // All criteria met - find the date when the last criterion was satisfied
    const achievementDates = await Promise.all(
      stage.criteria.map(criterion => 
        this.getCriterionAchievementDate(userId, criterion, events)
      )
    );
    
    const achievedDate = new Date(Math.max(...achievementDates.map(d => d.getTime())));
    
    return { achieved: true, achievedDate };
  }

  private async evaluateStageCriterion(
    userId: string, 
    criterion: StageCriterion, 
    events: AnalyticsEvent[]
  ): Promise<CriterionResult> {
    switch (criterion.type) {
      case 'event_count':
        const eventCount = events.filter(e => 
          e.eventType === criterion.eventType &&
          (!criterion.properties || this.matchesProperties(e.properties, criterion.properties))
        ).length;
        return { met: eventCount >= criterion.threshold };
        
      case 'time_based':
        const daysSinceRegistration = this.calculateDaysSince(events[0]?.timestamp);
        return { met: daysSinceRegistration >= criterion.days };
        
      case 'value_based':
        const totalValue = await this.calculateUserValue(userId, criterion.valueType);
        return { met: totalValue >= criterion.threshold };
        
      case 'engagement_based':
        const engagementScore = await this.calculateEngagementScore(userId, events);
        return { met: engagementScore >= criterion.threshold };
        
      default:
        return { met: false };
    }
  }

  private calculateLifecycleHealthScore(
    stageAnalysis: LifecycleStageAnalysis[], 
    transitionAnalysis: StageTransitionAnalysis
  ): number {
    let healthScore = 0;
    
    // Factor 1: Stage distribution (40% weight)
    const advancedStageUsers = stageAnalysis
      .filter(stage => stage.stageIndex >= 2) // Stages beyond "new user"
      .reduce((sum, stage) => sum + stage.userCount, 0);
    const totalUsers = stageAnalysis.reduce((sum, stage) => sum + stage.userCount, 0);
    const distributionScore = (advancedStageUsers / totalUsers) * 40;
    healthScore += distributionScore;
    
    // Factor 2: Conversion rates (35% weight)
    const avgConversionRate = this.average(
      transitionAnalysis.conversionRates.map(cr => cr.conversionRate)
    );
    const conversionScore = avgConversionRate * 35;
    healthScore += conversionScore;
    
    // Factor 3: Progression speed (25% weight)
    const avgProgressionRate = this.average(
      transitionAnalysis.conversionRates.map(cr => cr.averageTimeToConvert)
    );
    const speedScore = Math.max(0, 25 - (avgProgressionRate / 7) * 5); // Penalty for slow progression
    healthScore += speedScore;
    
    return Math.min(healthScore, 100);
  }

  async predictLifetimeValue(cohortId: string): Promise<LTVPrediction> {
    const cohort = await this.cohortStore.findById(cohortId);
    const members = await this.membershipStore.getCohortMembers(cohortId);
    
    // Calculate historical LTV for completed users
    const historicalLTV = await this.calculateHistoricalLTV(members);
    
    // Build predictive model based on early indicators
    const ltvModel = await this.buildLTVModel(members);
    
    // Predict LTV for current cohort members
    const ltvPredictions = await Promise.all(
      members.map(userId => this.predictUserLTV(userId, ltvModel))
    );
    
    return {
      cohortId,
      predictionDate: new Date(),
      modelAccuracy: ltvModel.accuracy,
      averagePredictedLTV: this.average(ltvPredictions.map(p => p.predictedLTV)),
      ltvDistribution: this.calculateLTVDistribution(ltvPredictions),
      topValueUsers: ltvPredictions
        .sort((a, b) => b.predictedLTV - a.predictedLTV)
        .slice(0, 10),
      ltvFactors: ltvModel.topFactors,
      confidenceInterval: ltvModel.confidenceInterval
    };
  }
}
```

### Comparative Analysis

```typescript
class ComparativeAnalyzer {
  async compareCohorts(cohortIds: string[]): Promise<CohortComparison> {
    const cohorts = await Promise.all(
      cohortIds.map(id => this.cohortStore.findById(id))
    );
    
    // Get retention analysis for each cohort
    const retentionAnalyses = await Promise.all(
      cohortIds.map(id => this.retentionTracker.analyzeRetention(id, 12))
    );
    
    // Get lifecycle analysis for each cohort
    const lifecycleAnalyses = await Promise.all(
      cohortIds.map(id => this.lifecycleAnalyzer.analyzeLifecycle(id))
    );
    
    // Compare key metrics
    const metricComparisons = this.compareMetrics(retentionAnalyses, lifecycleAnalyses);
    
    // Statistical significance testing
    const significanceTests = await this.performSignificanceTests(retentionAnalyses);
    
    return {
      comparisonId: this.generateComparisonId(),
      comparisonDate: new Date(),
      cohorts: cohorts.map((cohort, index) => ({
        cohortId: cohort.id,
        cohortName: cohort.name,
        cohortSize: cohort.initialSize,
        retentionAnalysis: retentionAnalyses[index],
        lifecycleAnalysis: lifecycleAnalyses[index]
      })),
      metricComparisons,
      significanceTests,
      insights: this.generateComparisonInsights(metricComparisons, significanceTests),
      recommendations: this.generateComparisonRecommendations(metricComparisons)
    };
  }

  private compareMetrics(
    retentionAnalyses: RetentionAnalysis[], 
    lifecycleAnalyses: LifecycleAnalysis[]
  ): MetricComparison[] {
    const comparisons: MetricComparison[] = [];
    
    // Compare retention rates
    comparisons.push({
      metric: 'Day 1 Retention',
      values: retentionAnalyses.map(r => r.dayOneRetention),
      bestPerformer: this.findBestPerformer(retentionAnalyses.map(r => r.dayOneRetention)),
      variance: this.calculateVariance(retentionAnalyses.map(r => r.dayOneRetention))
    });
    
    comparisons.push({
      metric: 'Day 30 Retention',
      values: retentionAnalyses.map(r => r.dayThirtyRetention),
      bestPerformer: this.findBestPerformer(retentionAnalyses.map(r => r.dayThirtyRetention)),
      variance: this.calculateVariance(retentionAnalyses.map(r => r.dayThirtyRetention))
    });
    
    // Compare lifecycle metrics
    comparisons.push({
      metric: 'Time to Activation',
      values: lifecycleAnalyses.map(l => l.averageTimeToActivation),
      bestPerformer: this.findBestPerformer(
        lifecycleAnalyses.map(l => l.averageTimeToActivation), 
        'lower'
      ),
      variance: this.calculateVariance(lifecycleAnalyses.map(l => l.averageTimeToActivation))
    });
    
    return comparisons;
  }
}
```

## Integration Points

### Analytics Platform Integration
```typescript
interface CohortAnalyticsIntegration {
  // Mixpanel Cohort Integration
  mixpanel: {
    syncCohorts: boolean;
    cohortProperties: string[];
    retentionEvents: string[];
  };
  
  // Amplitude Cohort Integration
  amplitude: {
    enableCohortSync: boolean;
    cohortDefinitions: CohortDefinition[];
    retentionAnalysis: boolean;
  };
  
  // Custom Analytics Integration
  customAnalytics: {
    cohortWebhook: string;
    retentionWebhook: string;
    batchSize: number;
  };
}

class CohortIntegrationService {
  async syncCohortsToExternalPlatforms(cohorts: Cohort[]): Promise<void> {
    if (this.config.mixpanel.syncCohorts) {
      await this.syncToMixpanel(cohorts);
    }
    
    if (this.config.amplitude.enableCohortSync) {
      await this.syncToAmplitude(cohorts);
    }
    
    if (this.config.customAnalytics.cohortWebhook) {
      await this.syncToCustomPlatform(cohorts);
    }
  }
}
```

## Security Considerations

### Data Privacy in Cohort Analysis
```typescript
class PrivacyCompliantCohortAnalysis {
  async createAnonymizedCohort(criteria: CohortCriteria): Promise<Cohort> {
    // Create cohort without storing individual user IDs
    const cohort = await this.cohortManager.createCohort(criteria);
    
    // Store only aggregated data
    const aggregatedData = await this.aggregateCohortData(cohort);
    await this.storeAggregatedCohortData(cohort.id, aggregatedData);
    
    // Remove individual user associations
    await this.removeCohortMembership(cohort.id);
    
    return cohort;
  }

  async handleDataDeletionRequest(userId: string): Promise<void> {
    // Remove user from all cohorts
    await this.membershipStore.removeUserFromAllCohorts(userId);
    
    // Recalculate affected cohort metrics
    const affectedCohorts = await this.getCohortsContainingUser(userId);
    for (const cohortId of affectedCohorts) {
      await this.recalculateCohortMetrics(cohortId);
    }
  }
}
```

## Testing Considerations

### Cohort Analysis Testing
```typescript
describe('Cohort Analysis Accuracy', () => {
  it('should create time-based cohorts correctly', async () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-07');
    
    // Create test users in the cohort period
    const cohortUsers = ['user1', 'user2', 'user3'];
    for (const userId of cohortUsers) {
      await analytics.trackEvent(userId, {
        eventType: 'user_registered',
        timestamp: new Date('2024-01-03')
      });
    }
    
    const cohort = await cohortAnalysis.createTimeCohort('weekly', startDate);
    expect(cohort.initialSize).toBe(3);
  });

  it('should calculate retention rates correctly', async () => {
    const cohort = await createTestCohort();
    
    // Simulate user activity over time
    await simulateUserActivity(cohort.id, {
      week1: 100, // 100% retention
      week2: 80,  // 80% retention
      week3: 60,  // 60% retention
      week4: 50   // 50% retention
    });
    
    const retention = await cohortAnalysis.analyzeRetention(cohort.id, 4);
    expect(retention.periods[1].retentionRate).toBeCloseTo(0.8, 2);
    expect(retention.periods[3].retentionRate).toBeCloseTo(0.5, 2);
  });

  it('should track lifecycle progression accurately', async () => {
    const userId = 'test-user';
    
    // Simulate user progression through lifecycle stages
    await analytics.trackEvent(userId, { eventType: 'user_registered' });
    await analytics.trackEvent(userId, { eventType: 'first_action' });
    await analytics.trackEvent(userId, { eventType: 'value_realized' });
    
    const lifecycle = await cohortAnalysis.trackUserProgression(userId);
    expect(lifecycle.currentStage).toBe('value_realized');
  });
});
```

## Real-World Considerations

### Scalability and Performance
- Use pre-aggregated cohort tables for faster queries
- Implement incremental cohort updates rather than full recalculation
- Use time-series databases for efficient retention calculations
- Consider data sampling for very large cohorts

### Data Quality and Accuracy
- Implement data validation for cohort-defining events
- Handle edge cases like users with multiple registration events
- Account for data delays in real-time cohort updates
- Validate cohort calculations against known benchmarks

### Business Intelligence Integration
- Export cohort data to business intelligence tools
- Create automated cohort reports for stakeholders
- Integrate with customer success platforms for proactive outreach
- Build alerting for significant cohort performance changes