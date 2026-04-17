# Engagement Psychology Template

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

This template provides comprehensive patterns for implementing psychological engagement systems that leverage behavioral science principles to drive user motivation, habit formation, and long-term retention. It covers motivation frameworks, behavioral triggers, psychological rewards, and personalized engagement strategies to create compelling user experiences that encourage sustained participation.

## Context

Engagement psychology applies scientific understanding of human behavior, motivation, and decision-making to create more effective gamification systems. A well-designed psychological engagement system uses principles like variable rewards, social proof, loss aversion, and intrinsic motivation to create compelling experiences that feel natural and rewarding rather than manipulative. This template addresses the complexity of building ethical engagement systems that respect user autonomy while effectively encouraging positive behaviors.

## Instructions

1. **Setup Psychological Framework**: Configure motivation models, behavioral triggers, and engagement principles
2. **Implement Behavioral Analysis**: Build user behavior tracking and pattern recognition systems
3. **Add Personalized Motivation**: Enable adaptive engagement based on individual psychological profiles
4. **Configure Reward Scheduling**: Implement variable reward systems and reinforcement schedules
5. **Enable Social Psychology**: Add social proof, comparison, and community engagement features
6. **Add Habit Formation**: Build systems that support long-term behavior change and habit development
7. **Test Engagement Ethics**: Validate that engagement techniques are ethical and user-beneficial

## Examples

### Example 1: Psychological Engagement Service
```typescript
interface PsychologicalEngagementService {
  analyzeUserMotivation(userId: string): Promise<MotivationProfile>;
  triggerBehavioralNudge(userId: string, context: EngagementContext): Promise<NudgeResult>;
  scheduleVariableReward(userId: string, behavior: string): Promise<RewardSchedule>;
  measureEngagementEffectiveness(userId: string, timeRange: TimeRange): Promise<EngagementMetrics>;
  adaptEngagementStrategy(userId: string, feedback: UserFeedback): Promise<StrategyUpdate>;
}

const engagementService = new PsychologicalEngagementService();
const motivationProfile = await engagementService.analyzeUserMotivation('user-123');

console.log(`Primary motivation: ${motivationProfile.primaryDriver}`);
console.log(`Engagement style: ${motivationProfile.preferredEngagementStyle}`);
```

### Example 2: Behavioral Trigger System
```typescript
interface BehavioralTriggerSystem {
  defineTrigger(trigger: TriggerDefinition): Promise<BehavioralTrigger>;
  evaluateTriggerConditions(userId: string, context: UserContext): Promise<TriggerEvaluation>;
  executeTrigger(userId: string, triggerId: string): Promise<TriggerExecution>;
  measureTriggerEffectiveness(triggerId: string): Promise<TriggerMetrics>;
}

const trigger = await triggerSystem.defineTrigger({
  name: 'completion_momentum',
  description: 'Encourage continued engagement after task completion',
  conditions: [
    { type: 'task_completed', value: true },
    { type: 'session_time', operator: '>', value: 300 },
    { type: 'energy_level', operator: '>', value: 0.7 }
  ],
  actions: [
    { type: 'suggest_next_task', priority: 'high' },
    { type: 'show_progress_celebration', duration: '3s' },
    { type: 'offer_bonus_opportunity', timeout: '60s' }
  ]
});
```
### Example 3: Motivation Adaptation Engine
```typescript
interface MotivationAdaptationEngine {
  identifyMotivationFactors(userId: string): Promise<MotivationFactors>;
  personalizeEngagement(userId: string, baseStrategy: EngagementStrategy): Promise<PersonalizedStrategy>;
  trackMotivationChanges(userId: string): Promise<MotivationEvolution>;
  optimizeEngagementTiming(userId: string): Promise<OptimalTiming>;
}

const personalizedStrategy = await adaptationEngine.personalizeEngagement('user-123', {
  baseType: 'achievement_focused',
  intensity: 'moderate',
  frequency: 'daily'
});

console.log(`Adapted strategy: ${personalizedStrategy.type}`);
console.log(`Optimal engagement times: ${personalizedStrategy.optimalTimes}`);
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enablePsychologicalProfiling | Enable user psychological profiling | boolean | No | true |
| enableBehavioralTriggers | Enable behavioral trigger system | boolean | No | true |
| enableVariableRewards | Enable variable reward scheduling | boolean | No | true |
| enableSocialProof | Enable social proof mechanisms | boolean | No | true |
| enableHabitFormation | Enable habit formation support | boolean | No | true |
| enableMotivationAdaptation | Enable adaptive motivation strategies | boolean | No | true |
| ethicalEngagementMode | Enforce ethical engagement practices | boolean | No | true |
| engagementIntensityLimit | Maximum engagement intensity (0-1) | number | No | 0.8 |

## Expected Output

This template will produce:
- **Psychological Profiling System**: User motivation analysis and behavioral pattern recognition
- **Behavioral Trigger Engine**: Context-aware engagement triggers and nudges
- **Variable Reward System**: Scientifically-based reward scheduling and delivery
- **Social Psychology Features**: Social proof, comparison, and community engagement
- **Habit Formation Support**: Long-term behavior change and habit development tools
- **Motivation Adaptation**: Personalized engagement strategies based on individual psychology
- **Engagement Analytics**: Psychological engagement metrics and effectiveness tracking
- **Ethical Safeguards**: User autonomy protection and engagement ethics enforcement

## Implementation Patterns

### Psychological Engagement Architecture

```typescript
// Core Psychological Engagement Architecture
interface PsychologicalEngagementCore {
  motivationAnalyzer: MotivationAnalyzer;
  behavioralTriggerEngine: BehavioralTriggerEngine;
  rewardScheduler: VariableRewardScheduler;
  socialPsychologyEngine: SocialPsychologyEngine;
  habitFormationSystem: HabitFormationSystem;
  ethicsGuardian: EngagementEthicsGuardian;
}

interface MotivationProfile {
  userId: string;
  
  // Core motivation drivers
  primaryDriver: MotivationDriver;
  secondaryDrivers: MotivationDriver[];
  motivationStrength: number; // 0-1
  
  // Psychological characteristics
  personalityTraits: PersonalityTraits;
  engagementPreferences: EngagementPreferences;
  rewardSensitivity: RewardSensitivity;
  
  // Behavioral patterns
  activityPatterns: ActivityPattern[];
  engagementRhythm: EngagementRhythm;
  attentionSpan: AttentionSpan;
  
  // Social factors
  socialMotivation: SocialMotivation;
  competitiveNature: CompetitiveNature;
  collaborationPreference: CollaborationPreference;
  
  // Adaptation factors
  adaptabilityScore: number;
  learningStyle: LearningStyle;
  feedbackPreference: FeedbackPreference;
  
  // Profile metadata
  confidenceLevel: number;
  lastUpdated: Date;
  dataPoints: number;
}

interface BehavioralTrigger {
  id: string;
  name: string;
  description: string;
  
  // Trigger conditions
  conditions: TriggerCondition[];
  contextRequirements: ContextRequirement[];
  
  // Trigger actions
  actions: TriggerAction[];
  fallbackActions: TriggerAction[];
  
  // Psychological principles
  psychologyPrinciples: PsychologyPrinciple[];
  motivationTargets: MotivationDriver[];
  
  // Timing and frequency
  cooldownPeriod: number;
  maxFrequency: FrequencyLimit;
  optimalTiming: TimingWindow[];
  
  // Effectiveness tracking
  successRate: number;
  engagementImpact: number;
  userSatisfaction: number;
  
  // Ethical considerations
  ethicalRating: EthicalRating;
  userConsentRequired: boolean;
  transparencyLevel: TransparencyLevel;
  
  // Status and metadata
  isActive: boolean;
  createdAt: Date;
  lastTriggered: Date;
}

interface EngagementStrategy {
  id: string;
  userId: string;
  strategyType: EngagementStrategyType;
  
  // Strategy configuration
  intensity: EngagementIntensity;
  frequency: EngagementFrequency;
  duration: EngagementDuration;
  
  // Personalization
  motivationAlignment: MotivationAlignment;
  personalityFit: PersonalityFit;
  contextualAdaptation: ContextualAdaptation;
  
  // Components
  triggers: string[]; // Trigger IDs
  rewards: RewardComponent[];
  socialElements: SocialComponent[];
  
  // Effectiveness metrics
  engagementScore: number;
  retentionImpact: number;
  satisfactionScore: number;
  
  // Adaptation history
  adaptations: StrategyAdaptation[];
  performanceHistory: PerformanceMetric[];
  
  // Status
  status: 'active' | 'testing' | 'paused' | 'retired';
  createdAt: Date;
  lastUpdated: Date;
}
```

**Motivation Analysis Implementation**
```typescript
class MotivationAnalyzer {
  private userBehaviorStore: UserBehaviorStore;
  private psychologyModels: PsychologyModelService;
  private mlAnalysisService: MLAnalysisService;

  async analyzeUserMotivation(userId: string): Promise<MotivationProfile> {
    // Gather user behavior data
    const behaviorData = await this.gatherBehaviorData(userId);
    
    // Apply psychological models
    const psychologyAnalysis = await this.applyPsychologyModels(behaviorData);
    
    // Use machine learning for pattern recognition
    const mlInsights = await this.mlAnalysisService.analyzeMotivationPatterns(behaviorData);
    
    // Combine analyses into comprehensive profile
    const motivationProfile = await this.synthesizeMotivationProfile(
      userId,
      behaviorData,
      psychologyAnalysis,
      mlInsights
    );

    // Validate and refine profile
    const validatedProfile = await this.validateMotivationProfile(motivationProfile);
    
    // Store profile for future reference
    await this.storeMotivationProfile(validatedProfile);
    
    return validatedProfile;
  }

  private async applyPsychologyModels(behaviorData: UserBehaviorData): Promise<PsychologyAnalysis> {
    const analyses: PsychologyAnalysis[] = [];

    // Self-Determination Theory analysis
    const sdtAnalysis = await this.analyzeSelfDeterminationTheory(behaviorData);
    analyses.push(sdtAnalysis);

    // Flow Theory analysis
    const flowAnalysis = await this.analyzeFlowTheory(behaviorData);
    analyses.push(flowAnalysis);

    // Behavioral Economics analysis
    const behavioralEconAnalysis = await this.analyzeBehavioralEconomics(behaviorData);
    analyses.push(behavioralEconAnalysis);

    // Social Cognitive Theory analysis
    const socialCognitiveAnalysis = await this.analyzeSocialCognitiveTheory(behaviorData);
    analyses.push(socialCognitiveAnalysis);

    return this.synthesizePsychologyAnalyses(analyses);
  }

  private async analyzeSelfDeterminationTheory(
    behaviorData: UserBehaviorData
  ): Promise<SDTAnalysis> {
    // Analyze autonomy, competence, and relatedness needs
    const autonomyScore = this.calculateAutonomyScore(behaviorData);
    const competenceScore = this.calculateCompetenceScore(behaviorData);
    const relatednessScore = this.calculateRelatednessScore(behaviorData);

    // Determine intrinsic vs extrinsic motivation balance
    const motivationBalance = this.calculateMotivationBalance(behaviorData);

    return {
      autonomyNeed: autonomyScore,
      competenceNeed: competenceScore,
      relatednessNeed: relatednessScore,
      intrinsicMotivation: motivationBalance.intrinsic,
      extrinsicMotivation: motivationBalance.extrinsic,
      overallSDTScore: (autonomyScore + competenceScore + relatednessScore) / 3,
      recommendations: this.generateSDTRecommendations(
        autonomyScore,
        competenceScore,
        relatednessScore
      )
    };
  }

  private async analyzeFlowTheory(behaviorData: UserBehaviorData): Promise<FlowAnalysis> {
    // Analyze challenge-skill balance
    const challengeSkillBalance = this.calculateChallengeSkillBalance(behaviorData);
    
    // Identify flow states in user behavior
    const flowStates = this.identifyFlowStates(behaviorData);
    
    // Calculate flow frequency and duration
    const flowMetrics = this.calculateFlowMetrics(flowStates);

    return {
      challengeSkillBalance,
      flowFrequency: flowMetrics.frequency,
      averageFlowDuration: flowMetrics.averageDuration,
      flowTriggers: this.identifyFlowTriggers(flowStates),
      flowBarriers: this.identifyFlowBarriers(behaviorData),
      optimalChallengeLevel: this.calculateOptimalChallengeLevel(behaviorData),
      recommendations: this.generateFlowRecommendations(challengeSkillBalance, flowMetrics)
    };
  }

  private calculateAutonomyScore(behaviorData: UserBehaviorData): number {
    let autonomyScore = 0;
    let totalInteractions = 0;

    // Analyze choice-making behavior
    const choiceInteractions = behaviorData.interactions.filter(i => i.type === 'choice');
    const selfDirectedChoices = choiceInteractions.filter(i => i.metadata.selfDirected);
    autonomyScore += (selfDirectedChoices.length / choiceInteractions.length) * 0.3;

    // Analyze customization usage
    const customizationUsage = behaviorData.features.customization?.usageFrequency || 0;
    autonomyScore += Math.min(customizationUsage / 10, 1) * 0.2;

    // Analyze resistance to forced actions
    const forcedActions = behaviorData.interactions.filter(i => i.metadata.forced);
    const resistanceRate = forcedActions.filter(i => i.metadata.resisted).length / forcedActions.length;
    autonomyScore += resistanceRate * 0.2;

    // Analyze preference expression
    const preferenceExpressions = behaviorData.interactions.filter(i => i.type === 'preference');
    autonomyScore += Math.min(preferenceExpressions.length / 20, 1) * 0.3;

    return Math.min(autonomyScore, 1);
  }
}
```

### Behavioral Trigger Engine Implementation

```typescript
class BehavioralTriggerEngine {
  private triggerStore: TriggerStore;
  private contextAnalyzer: ContextAnalyzer;
  private executionEngine: TriggerExecutionEngine;
  private effectivenessTracker: EffectivenessTracker;

  async evaluateAndExecuteTriggers(
    userId: string, 
    context: UserContext
  ): Promise<TriggerExecutionResult[]> {
    // Get user's motivation profile
    const motivationProfile = await this.getMotivationProfile(userId);
    
    // Get applicable triggers
    const applicableTriggers = await this.getApplicableTriggers(userId, context);
    
    // Evaluate trigger conditions
    const evaluatedTriggers = await this.evaluateTriggerConditions(
      applicableTriggers,
      context,
      motivationProfile
    );

    // Select optimal triggers (avoid overwhelming user)
    const selectedTriggers = await this.selectOptimalTriggers(
      evaluatedTriggers,
      motivationProfile,
      context
    );

    // Execute selected triggers
    const executionResults: TriggerExecutionResult[] = [];
    for (const trigger of selectedTriggers) {
      const result = await this.executeTrigger(userId, trigger, context);
      executionResults.push(result);
    }

    // Track effectiveness
    await this.trackTriggerEffectiveness(executionResults);

    return executionResults;
  }

  private async evaluateTriggerConditions(
    triggers: BehavioralTrigger[],
    context: UserContext,
    motivationProfile: MotivationProfile
  ): Promise<EvaluatedTrigger[]> {
    const evaluatedTriggers: EvaluatedTrigger[] = [];

    for (const trigger of triggers) {
      const conditionResults = await Promise.all(
        trigger.conditions.map(condition => 
          this.evaluateCondition(condition, context, motivationProfile)
        )
      );

      const allConditionsMet = conditionResults.every(result => result.met);
      const conditionScore = conditionResults.reduce((sum, result) => sum + result.score, 0) / conditionResults.length;

      if (allConditionsMet) {
        // Calculate trigger relevance score
        const relevanceScore = await this.calculateTriggerRelevance(
          trigger,
          context,
          motivationProfile
        );

        evaluatedTriggers.push({
          trigger,
          conditionScore,
          relevanceScore,
          overallScore: (conditionScore + relevanceScore) / 2,
          conditionResults
        });
      }
    }

    return evaluatedTriggers.sort((a, b) => b.overallScore - a.overallScore);
  }

  private async calculateTriggerRelevance(
    trigger: BehavioralTrigger,
    context: UserContext,
    motivationProfile: MotivationProfile
  ): Promise<number> {
    let relevanceScore = 0;

    // Check motivation alignment
    const motivationAlignment = this.calculateMotivationAlignment(
      trigger.motivationTargets,
      motivationProfile.primaryDriver,
      motivationProfile.secondaryDrivers
    );
    relevanceScore += motivationAlignment * 0.4;

    // Check timing relevance
    const timingRelevance = this.calculateTimingRelevance(
      trigger.optimalTiming,
      context.currentTime,
      motivationProfile.engagementRhythm
    );
    relevanceScore += timingRelevance * 0.3;

    // Check context relevance
    const contextRelevance = this.calculateContextRelevance(
      trigger.contextRequirements,
      context
    );
    relevanceScore += contextRelevance * 0.3;

    return Math.min(relevanceScore, 1);
  }

  private async selectOptimalTriggers(
    evaluatedTriggers: EvaluatedTrigger[],
    motivationProfile: MotivationProfile,
    context: UserContext
  ): Promise<BehavioralTrigger[]> {
    const selectedTriggers: BehavioralTrigger[] = [];
    let totalEngagementLoad = 0;
    const maxEngagementLoad = this.calculateMaxEngagementLoad(motivationProfile, context);

    for (const evaluatedTrigger of evaluatedTriggers) {
      const triggerLoad = this.calculateTriggerEngagementLoad(evaluatedTrigger.trigger);
      
      // Check if adding this trigger would exceed engagement load
      if (totalEngagementLoad + triggerLoad <= maxEngagementLoad) {
        // Check for trigger conflicts
        const hasConflicts = this.checkTriggerConflicts(
          evaluatedTrigger.trigger,
          selectedTriggers
        );

        if (!hasConflicts) {
          selectedTriggers.push(evaluatedTrigger.trigger);
          totalEngagementLoad += triggerLoad;
        }
      }

      // Stop if we've reached optimal number of triggers
      if (selectedTriggers.length >= this.getOptimalTriggerCount(motivationProfile)) {
        break;
      }
    }

    return selectedTriggers;
  }

  private async executeTrigger(
    userId: string,
    trigger: BehavioralTrigger,
    context: UserContext
  ): Promise<TriggerExecutionResult> {
    try {
      // Check ethical constraints
      const ethicalCheck = await this.checkEthicalConstraints(userId, trigger);
      if (!ethicalCheck.approved) {
        return {
          triggerId: trigger.id,
          success: false,
          reason: 'Ethical constraints not met',
          ethicalViolation: ethicalCheck.violation
        };
      }

      // Execute trigger actions
      const actionResults = await Promise.all(
        trigger.actions.map(action => 
          this.executeTriggerAction(userId, action, context)
        )
      );

      // Check if any actions failed
      const failedActions = actionResults.filter(result => !result.success);
      if (failedActions.length > 0) {
        // Execute fallback actions if available
        if (trigger.fallbackActions.length > 0) {
          const fallbackResults = await Promise.all(
            trigger.fallbackActions.map(action => 
              this.executeTriggerAction(userId, action, context)
            )
          );
          
          return {
            triggerId: trigger.id,
            success: fallbackResults.some(result => result.success),
            actionResults: fallbackResults,
            fallbackUsed: true
          };
        }
      }

      // Update trigger statistics
      await this.updateTriggerStatistics(trigger.id, true);

      return {
        triggerId: trigger.id,
        success: true,
        actionResults,
        executedAt: new Date()
      };

    } catch (error) {
      // Log error and update statistics
      await this.logTriggerError(trigger.id, error);
      await this.updateTriggerStatistics(trigger.id, false);

      return {
        triggerId: trigger.id,
        success: false,
        error: error.message,
        executedAt: new Date()
      };
    }
  }
}
```

### Variable Reward Scheduler Implementation

```typescript
class VariableRewardScheduler {
  private rewardStore: RewardStore;
  private scheduleStore: ScheduleStore;
  private psychologyEngine: PsychologyEngine;
  private randomnessService: RandomnessService;

  async scheduleVariableReward(
    userId: string,
    behavior: string,
    baseReward: Reward
  ): Promise<RewardSchedule> {
    // Get user's reward sensitivity profile
    const rewardProfile = await this.getRewardSensitivityProfile(userId);
    
    // Determine optimal reward schedule type
    const scheduleType = await this.determineOptimalScheduleType(
      behavior,
      rewardProfile
    );

    // Create variable reward schedule
    const schedule = await this.createRewardSchedule(
      userId,
      behavior,
      baseReward,
      scheduleType,
      rewardProfile
    );

    // Store schedule for execution
    await this.scheduleStore.save(schedule);

    return schedule;
  }

  private async createRewardSchedule(
    userId: string,
    behavior: string,
    baseReward: Reward,
    scheduleType: ScheduleType,
    rewardProfile: RewardSensitivityProfile
  ): Promise<RewardSchedule> {
    const schedule: RewardSchedule = {
      id: this.generateScheduleId(),
      userId,
      behavior,
      baseReward,
      scheduleType,
      
      // Variable reward parameters
      rewardVariations: await this.generateRewardVariations(baseReward, rewardProfile),
      probabilityDistribution: this.calculateProbabilityDistribution(scheduleType, rewardProfile),
      
      // Timing parameters
      intervalVariation: this.calculateIntervalVariation(scheduleType),
      anticipationBuilding: this.calculateAnticipationStrategy(rewardProfile),
      
      // Psychological parameters
      surpriseElement: this.calculateSurpriseLevel(rewardProfile),
      dopamineOptimization: this.calculateDopamineOptimization(rewardProfile),
      
      // Adaptation parameters
      adaptationRate: this.calculateAdaptationRate(rewardProfile),
      diminishingReturnsProtection: this.calculateDiminishingReturnsProtection(scheduleType),
      
      // Status
      isActive: true,
      createdAt: new Date(),
      lastRewardAt: null,
      totalRewardsGiven: 0
    };

    return schedule;
  }

  async executeScheduledReward(
    userId: string,
    behavior: string,
    context: BehaviorContext
  ): Promise<RewardExecution> {
    const schedule = await this.scheduleStore.findActiveSchedule(userId, behavior);
    if (!schedule) {
      return { executed: false, reason: 'No active schedule found' };
    }

    // Check if reward should be given based on schedule
    const shouldReward = await this.shouldGiveReward(schedule, context);
    if (!shouldReward.give) {
      return { 
        executed: false, 
        reason: shouldReward.reason,
        nextOpportunity: shouldReward.nextOpportunity
      };
    }

    // Select reward variation
    const selectedReward = await this.selectRewardVariation(schedule, context);

    // Add surprise elements
    const enhancedReward = await this.addSurpriseElements(selectedReward, schedule);

    // Execute reward delivery
    const deliveryResult = await this.deliverReward(userId, enhancedReward, context);

    // Update schedule statistics
    await this.updateScheduleStatistics(schedule, deliveryResult);

    // Adapt schedule based on user response
    await this.adaptScheduleBasedOnResponse(schedule, deliveryResult);

    return {
      executed: true,
      reward: enhancedReward,
      deliveryResult,
      scheduleUpdated: deliveryResult.userResponse?.satisfactionScore < 0.7
    };
  }

  private async shouldGiveReward(
    schedule: RewardSchedule,
    context: BehaviorContext
  ): Promise<RewardDecision> {
    // Apply schedule type logic
    switch (schedule.scheduleType) {
      case 'variable_ratio':
        return this.evaluateVariableRatioSchedule(schedule, context);
      
      case 'variable_interval':
        return this.evaluateVariableIntervalSchedule(schedule, context);
      
      case 'random_reward':
        return this.evaluateRandomRewardSchedule(schedule, context);
      
      case 'progressive_reward':
        return this.evaluateProgressiveRewardSchedule(schedule, context);
      
      default:
        return { give: false, reason: 'Unknown schedule type' };
    }
  }

  private async evaluateVariableRatioSchedule(
    schedule: RewardSchedule,
    context: BehaviorContext
  ): Promise<RewardDecision> {
    // Variable ratio: reward after variable number of behaviors
    const targetRatio = this.calculateCurrentTargetRatio(schedule);
    const behaviorsSinceLastReward = context.behaviorsSinceLastReward || 0;

    if (behaviorsSinceLastReward >= targetRatio) {
      return { give: true, reason: 'Target ratio reached' };
    }

    // Add some randomness to prevent predictability
    const randomChance = this.randomnessService.random();
    const probabilityThreshold = this.calculateProbabilityThreshold(
      behaviorsSinceLastReward,
      targetRatio,
      schedule.probabilityDistribution
    );

    if (randomChance < probabilityThreshold) {
      return { give: true, reason: 'Random probability triggered' };
    }

    return {
      give: false,
      reason: 'Target ratio not reached',
      nextOpportunity: targetRatio - behaviorsSinceLastReward
    };
  }

  private async selectRewardVariation(
    schedule: RewardSchedule,
    context: BehaviorContext
  ): Promise<Reward> {
    const variations = schedule.rewardVariations;
    
    // Calculate selection weights based on context and user state
    const weights = await Promise.all(
      variations.map(variation => 
        this.calculateVariationWeight(variation, context, schedule)
      )
    );

    // Select variation using weighted random selection
    const selectedIndex = this.randomnessService.weightedRandom(weights);
    const selectedVariation = variations[selectedIndex];

    // Apply contextual modifications
    const contextuallyModified = await this.applyContextualModifications(
      selectedVariation,
      context
    );

    return contextuallyModified;
  }

  private async addSurpriseElements(
    reward: Reward,
    schedule: RewardSchedule
  ): Promise<Reward> {
    if (schedule.surpriseElement <= 0) {
      return reward;
    }

    const surpriseChance = this.randomnessService.random();
    if (surpriseChance < schedule.surpriseElement) {
      // Add surprise bonus
      const surpriseBonus = await this.generateSurpriseBonus(reward, schedule);
      
      return {
        ...reward,
        surpriseBonus,
        surpriseMessage: this.generateSurpriseMessage(surpriseBonus),
        enhancedPresentation: true
      };
    }

    return reward;
  }
}
```

## Integration Points

### User Analytics Integration
```typescript
interface PsychologicalEngagementAnalyticsIntegration {
  trackMotivationChanges(userId: string, changes: MotivationChange[]): Promise<void>;
  trackTriggerEffectiveness(trigger: BehavioralTrigger, result: TriggerResult): Promise<void>;
  trackRewardResponse(userId: string, reward: Reward, response: UserResponse): Promise<void>;
  generatePsychologyInsights(userId: string): Promise<PsychologyInsights>;
}

class PsychologicalEngagementAnalyticsService {
  async generateEngagementPsychologyReport(userId: string): Promise<EngagementPsychologyReport> {
    return {
      motivationEvolution: await this.getMotivationEvolution(userId),
      triggerEffectiveness: await this.getTriggerEffectiveness(userId),
      rewardSensitivityAnalysis: await this.getRewardSensitivityAnalysis(userId),
      behavioralPatterns: await this.getBehavioralPatterns(userId),
      engagementOptimization: await this.getEngagementOptimization(userId)
    };
  }

  async trackPsychologicalEngagement(userId: string): Promise<void> {
    const engagementData = await this.getUserEngagementData(userId);
    
    await this.analyticsService.trackEvent(userId, {
      eventType: 'psychological_engagement_analysis',
      properties: {
        motivationStrength: engagementData.motivationStrength,
        engagementConsistency: engagementData.engagementConsistency,
        triggerResponseRate: engagementData.triggerResponseRate,
        rewardSatisfaction: engagementData.rewardSatisfaction,
        psychologicalWellbeing: engagementData.psychologicalWellbeing
      }
    });
  }
}
```

### Notification System Integration
```typescript
interface PsychologicalNotificationService {
  sendMotivationalMessage(userId: string, message: MotivationalMessage): Promise<void>;
  triggerBehavioralNudge(userId: string, nudge: BehavioralNudge): Promise<void>;
  celebrateAchievement(userId: string, achievement: Achievement): Promise<void>;
  provideEncouragement(userId: string, context: EncouragementContext): Promise<void>;
}

class PsychologicalNotificationHandler {
  async handleMotivationDrop(event: MotivationDropEvent): Promise<void> {
    const { userId, previousLevel, currentLevel, triggers } = event;
    
    // Generate personalized motivational intervention
    const intervention = await this.generateMotivationalIntervention(
      userId,
      previousLevel,
      currentLevel,
      triggers
    );

    await this.notificationService.send(userId, {
      type: 'motivational_support',
      title: intervention.title,
      message: intervention.message,
      data: {
        interventionType: intervention.type,
        suggestedActions: intervention.suggestedActions
      }
    });
  }

  async scheduleMotivationalSupport(userId: string): Promise<void> {
    const motivationProfile = await this.getMotivationProfile(userId);
    const optimalTimes = motivationProfile.engagementRhythm.optimalTimes;
    
    for (const time of optimalTimes) {
      await this.scheduledNotificationService.schedule(userId, {
        type: 'motivational_boost',
        scheduledFor: time,
        data: {
          motivationType: motivationProfile.primaryDriver,
          personalizedMessage: true
        }
      });
    }
  }
}
```

## Security Considerations

### Ethical Engagement Protection
```typescript
interface EngagementEthicsGuardian {
  validateEngagementEthics(strategy: EngagementStrategy): Promise<EthicsValidation>;
  monitorUserWellbeing(userId: string): Promise<WellbeingAssessment>;
  enforceEngagementLimits(userId: string): Promise<LimitEnforcement>;
  detectManipulativePatterns(engagementData: EngagementData): Promise<ManipulationDetection>;
}

class EngagementEthicsManager {
  async validateEngagementStrategy(strategy: EngagementStrategy): Promise<EthicsValidation> {
    const checks: Promise<EthicsCheck>[] = [
      this.checkUserAutonomy(strategy),
      this.checkTransparency(strategy),
      this.checkWellbeingImpact(strategy),
      this.checkManipulationRisk(strategy)
    ];

    const results = await Promise.all(checks);
    const failedChecks = results.filter(result => !result.passed);

    if (failedChecks.length > 0) {
      return {
        approved: false,
        violations: failedChecks,
        recommendations: this.generateEthicsRecommendations(failedChecks)
      };
    }

    return { approved: true, ethicsScore: this.calculateEthicsScore(results) };
  }

  private async checkUserAutonomy(strategy: EngagementStrategy): Promise<EthicsCheck> {
    // Ensure user maintains control and choice
    const autonomyScore = this.calculateAutonomyScore(strategy);
    
    if (autonomyScore < this.config.minAutonomyScore) {
      return {
        passed: false,
        principle: 'user_autonomy',
        reason: 'Strategy may compromise user autonomy',
        severity: 'high'
      };
    }

    return { passed: true, principle: 'user_autonomy', score: autonomyScore };
  }

  private async checkManipulationRisk(strategy: EngagementStrategy): Promise<EthicsCheck> {
    // Detect potentially manipulative engagement patterns
    const manipulationRisk = this.assessManipulationRisk(strategy);
    
    if (manipulationRisk > this.config.maxManipulationRisk) {
      return {
        passed: false,
        principle: 'non_manipulation',
        reason: 'Strategy shows high manipulation risk',
        severity: 'critical',
        riskFactors: manipulationRisk.factors
      };
    }

    return { passed: true, principle: 'non_manipulation', riskScore: manipulationRisk.score };
  }

  async monitorUserWellbeing(userId: string): Promise<WellbeingAssessment> {
    // Collect wellbeing indicators
    const indicators = await this.collectWellbeingIndicators(userId);
    
    // Assess psychological health
    const psychologicalHealth = this.assessPsychologicalHealth(indicators);
    
    // Check for concerning patterns
    const concerningPatterns = this.identifyConcerningPatterns(indicators);
    
    // Generate wellbeing score
    const wellbeingScore = this.calculateWellbeingScore(indicators, psychologicalHealth);

    if (wellbeingScore < this.config.minWellbeingScore) {
      // Trigger wellbeing intervention
      await this.triggerWellbeingIntervention(userId, indicators, concerningPatterns);
    }

    return {
      userId,
      wellbeingScore,
      psychologicalHealth,
      concerningPatterns,
      recommendations: this.generateWellbeingRecommendations(indicators),
      assessmentDate: new Date()
    };
  }

  private async triggerWellbeingIntervention(
    userId: string,
    indicators: WellbeingIndicator[],
    patterns: ConcerningPattern[]
  ): Promise<void> {
    // Reduce engagement intensity
    await this.reduceEngagementIntensity(userId);
    
    // Provide wellbeing resources
    await this.provideWellbeingResources(userId, patterns);
    
    // Schedule wellbeing check-in
    await this.scheduleWellbeingCheckIn(userId);
    
    // Alert human moderators if severe
    const severityLevel = this.calculateSeverityLevel(patterns);
    if (severityLevel >= this.config.humanModerationThreshold) {
      await this.alertHumanModerators(userId, indicators, patterns);
    }
  }
}
```

## Testing Considerations

### Psychological Engagement Testing
```typescript
describe('Psychological Engagement System', () => {
  describe('Motivation Analysis', () => {
    it('should identify primary motivation drivers', async () => {
      const profile = await motivationAnalyzer.analyzeUserMotivation('user-1');

      expect(profile.primaryDriver).toBeDefined();
      expect(profile.motivationStrength).toBeGreaterThan(0);
      expect(profile.confidenceLevel).toBeGreaterThan(0.5);
    });

    it('should adapt to changing user behavior', async () => {
      const initialProfile = await motivationAnalyzer.analyzeUserMotivation('user-1');
      
      // Simulate behavior change
      await simulateBehaviorChange('user-1', 'achievement_focused');
      
      const updatedProfile = await motivationAnalyzer.analyzeUserMotivation('user-1');
      expect(updatedProfile.primaryDriver).not.toBe(initialProfile.primaryDriver);
    });
  });

  describe('Behavioral Triggers', () => {
    it('should execute triggers based on conditions', async () => {
      const results = await triggerEngine.evaluateAndExecuteTriggers('user-1', {
        currentActivity: 'task_completion',
        sessionTime: 600,
        energyLevel: 0.8
      });

      expect(results).toBeInstanceOf(Array);
      results.forEach(result => {
        expect(result.success).toBe(true);
      });
    });

    it('should respect ethical constraints', async () => {
      const manipulativeTrigger = {
        id: 'manipulative-trigger',
        actions: [{ type: 'pressure_purchase', intensity: 'high' }]
      };

      const result = await triggerEngine.executeTrigger('user-1', manipulativeTrigger, {});
      expect(result.success).toBe(false);
      expect(result.ethicalViolation).toBeDefined();
    });
  });

  describe('Variable Rewards', () => {
    it('should create appropriate reward schedules', async () => {
      const schedule = await rewardScheduler.scheduleVariableReward('user-1', 'daily_login', {
        type: 'points',
        value: 100
      });

      expect(schedule.scheduleType).toBeDefined();
      expect(schedule.rewardVariations).toBeInstanceOf(Array);
      expect(schedule.probabilityDistribution).toBeDefined();
    });

    it('should maintain reward effectiveness over time', async () => {
      const initialEffectiveness = await measureRewardEffectiveness('user-1', 'daily_login');
      
      // Simulate extended usage
      await simulateExtendedRewardUsage('user-1', 'daily_login', 30);
      
      const finalEffectiveness = await measureRewardEffectiveness('user-1', 'daily_login');
      expect(finalEffectiveness).toBeGreaterThan(initialEffectiveness * 0.8); // Allow some decline
    });
  });

  describe('Ethics Guardian', () => {
    it('should reject manipulative strategies', async () => {
      const manipulativeStrategy = {
        intensity: 'extreme',
        triggers: ['addiction_trigger', 'fomo_trigger'],
        transparencyLevel: 'hidden'
      };

      const validation = await ethicsGuardian.validateEngagementStrategy(manipulativeStrategy);
      expect(validation.approved).toBe(false);
      expect(validation.violations).toHaveLength(1);
    });

    it('should monitor user wellbeing', async () => {
      const assessment = await ethicsGuardian.monitorUserWellbeing('user-1');

      expect(assessment.wellbeingScore).toBeGreaterThan(0);
      expect(assessment.psychologicalHealth).toBeDefined();
      expect(assessment.recommendations).toBeInstanceOf(Array);
    });
  });
});
```
