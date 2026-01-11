# Streak Tracking Template

## Purpose

This template provides comprehensive patterns for implementing streak tracking systems that monitor consecutive user actions, build habit formation, and reward consistent engagement. It covers streak definition, tracking mechanics, streak recovery options, and reward systems to encourage daily engagement and long-term habit development.

## Context

Streak tracking leverages psychological principles of habit formation and loss aversion to drive consistent user engagement. A well-designed streak system creates powerful motivation through visible progress, milestone celebrations, and the fear of losing accumulated progress. This template addresses the complexity of building robust streak tracking that handles various streak types, time zones, grace periods, and recovery mechanisms while maintaining fairness and preventing manipulation.

## Instructions

1. **Setup Streak Infrastructure**: Configure streak types, tracking rules, and validation systems
2. **Implement Streak Detection**: Build automatic streak recognition and progression tracking
3. **Add Streak Recovery**: Enable streak freeze, recovery, and grace period mechanics
4. **Configure Milestone Rewards**: Implement streak-based achievements and rewards
5. **Enable Streak Sharing**: Add social features for streak visibility and encouragement
6. **Add Streak Analytics**: Build insights and progress visualization tools
7. **Test Streak Accuracy**: Validate streak calculations and edge case handling

## Examples

### Example 1: Streak Tracking Service
```typescript
interface StreakTrackingService {
  recordActivity(userId: string, activityType: string, timestamp: Date): Promise<StreakUpdate>;
  getCurrentStreak(userId: string, streakType: string): Promise<CurrentStreak>;
  getStreakHistory(userId: string, timeRange: TimeRange): Promise<StreakHistory[]>;
  useStreakFreeze(userId: string, streakType: string): Promise<StreakFreezeResult>;
  getStreakLeaderboard(streakType: string, timeframe: string): Promise<StreakLeaderboard>;
}

const streakService = new StreakTrackingService();
const streakUpdate = await streakService.recordActivity('user-123', 'daily_login', new Date());

console.log(`Current streak: ${streakUpdate.currentStreak} days`);
console.log(`Longest streak: ${streakUpdate.longestStreak} days`);
```

### Example 2: Streak Configuration System
```typescript
interface StreakConfigurationSystem {
  defineStreakType(definition: StreakDefinition): Promise<StreakType>;
  setStreakRules(streakType: string, rules: StreakRules): Promise<void>;
  configureMilestones(streakType: string, milestones: StreakMilestone[]): Promise<void>;
  setRecoveryOptions(streakType: string, options: RecoveryOptions): Promise<void>;
}

const streakConfig = await streakSystem.defineStreakType({
  name: 'daily_workout',
  displayName: 'Daily Workout Streak',
  description: 'Complete at least one workout every day',
  trackingWindow: '24h',
  timezone: 'user_local',
  gracePeriod: '2h',
  allowRecovery: true,
  maxRecoveries: 3
});
```
### Example 3: Streak Milestone System
```typescript
interface StreakMilestoneSystem {
  checkMilestones(userId: string, streakType: string, currentStreak: number): Promise<MilestoneCheck>;
  awardMilestoneReward(userId: string, milestone: StreakMilestone): Promise<MilestoneReward>;
  getUpcomingMilestones(userId: string, streakType: string): Promise<UpcomingMilestone[]>;
  celebrateMilestone(userId: string, milestone: StreakMilestone): Promise<void>;
}

const milestones = await milestoneSystem.getUpcomingMilestones('user-123', 'daily_login');
// Returns: [{ day: 7, reward: 'bonus_points', description: 'Week warrior!' }]
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableStreakTracking | Enable streak tracking system | boolean | No | true |
| enableStreakRecovery | Enable streak recovery mechanisms | boolean | No | true |
| enableStreakFreezes | Enable streak freeze functionality | boolean | No | true |
| defaultGracePeriod | Default grace period in hours | number | No | 2 |
| maxRecoveriesPerMonth | Maximum recoveries per user per month | number | No | 3 |
| enableStreakSharing | Enable social streak sharing | boolean | No | true |
| streakTimezone | Default timezone for streak calculations | string | No | 'UTC' |
| enableStreakNotifications | Enable streak reminder notifications | boolean | No | true |

## Expected Output

This template will produce:
- **Streak Tracking Engine**: Comprehensive activity monitoring and streak calculation
- **Streak Recovery System**: Freeze, recovery, and grace period mechanics
- **Milestone Achievement System**: Streak-based rewards and celebrations
- **Streak Analytics Dashboard**: Progress visualization and insights
- **Social Streak Features**: Sharing, encouragement, and leaderboards
- **Notification System**: Streak reminders and milestone alerts
- **Admin Tools**: Streak management and configuration interfaces
- **Habit Formation Insights**: Behavioral analytics and recommendations

## Implementation Patterns

### Streak Tracking Architecture

```typescript
// Core Streak Tracking Architecture
interface StreakTrackingCore {
  activityTracker: ActivityTracker;
  streakCalculator: StreakCalculator;
  milestoneManager: MilestoneManager;
  recoverySystem: StreakRecoverySystem;
  notificationService: StreakNotificationService;
  analyticsEngine: StreakAnalyticsEngine;
}

interface StreakType {
  id: string;
  name: string;
  displayName: string;
  description: string;
  
  // Tracking configuration
  trackingWindow: string; // '24h', '1d', 'calendar_day'
  timezone: 'UTC' | 'user_local' | string;
  gracePeriod: string; // '2h', '30m'
  
  // Activity requirements
  requiredActions: ActivityRequirement[];
  minimumThreshold?: number;
  
  // Recovery options
  allowRecovery: boolean;
  maxRecoveries: number;
  recoveryPeriod: string; // 'monthly', 'weekly'
  recoveryMethods: RecoveryMethod[];
  
  // Freeze options
  allowFreezes: boolean;
  maxFreezes: number;
  freezeDuration: string; // '1d', '3d'
  
  // Milestones and rewards
  milestones: StreakMilestone[];
  
  // Status and metadata
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface UserStreak {
  id: string;
  userId: string;
  streakType: string;
  
  // Current streak status
  currentStreak: number;
  longestStreak: number;
  totalDays: number;
  
  // Streak timeline
  startDate: Date;
  lastActivityDate: Date;
  nextRequiredDate: Date;
  
  // Recovery and freeze status
  availableRecoveries: number;
  availableFreezes: number;
  isCurrentlyFrozen: boolean;
  freezeEndDate?: Date;
  
  // Milestone progress
  lastMilestone: number;
  nextMilestone: number;
  
  // Statistics
  averageGapDays: number;
  consistencyScore: number;
  
  // Status
  status: 'active' | 'broken' | 'frozen' | 'recovered';
  lastUpdated: Date;
}

interface StreakActivity {
  id: string;
  userId: string;
  streakType: string;
  
  // Activity details
  activityType: string;
  activityValue?: number;
  timestamp: Date;
  
  // Validation
  isValid: boolean;
  validationReason?: string;
  
  // Streak impact
  contributedToStreak: boolean;
  streakDayNumber: number;
  
  // Context
  timezone: string;
  source: string;
  metadata: Record<string, any>;
}
```

**Streak Calculation Engine Implementation**
```typescript
class StreakCalculator {
  private activityStore: ActivityStore;
  private streakStore: StreakStore;
  private timezoneService: TimezoneService;

  async calculateStreak(
    userId: string, 
    streakType: string, 
    newActivity?: StreakActivity
  ): Promise<StreakCalculation> {
    const streakDefinition = await this.getStreakDefinition(streakType);
    const currentStreak = await this.streakStore.getCurrentStreak(userId, streakType);
    const userTimezone = await this.getUserTimezone(userId, streakDefinition);

    // Get activity history for calculation
    const activities = await this.getRelevantActivities(
      userId, 
      streakType, 
      userTimezone,
      newActivity
    );

    // Calculate streak based on definition
    const calculation = await this.performStreakCalculation(
      activities,
      streakDefinition,
      currentStreak,
      userTimezone
    );

    return calculation;
  }

  private async performStreakCalculation(
    activities: StreakActivity[],
    definition: StreakType,
    currentStreak: UserStreak,
    timezone: string
  ): Promise<StreakCalculation> {
    // Sort activities by date
    const sortedActivities = activities.sort((a, b) => 
      a.timestamp.getTime() - b.timestamp.getTime()
    );

    // Group activities by tracking window (day, calendar day, etc.)
    const activityGroups = this.groupActivitiesByWindow(
      sortedActivities, 
      definition.trackingWindow,
      timezone
    );

    // Calculate consecutive days
    const consecutiveDays = this.calculateConsecutiveDays(
      activityGroups,
      definition,
      timezone
    );

    // Handle grace periods and recovery
    const adjustedStreak = await this.applyGracePeriodAndRecovery(
      consecutiveDays,
      currentStreak,
      definition,
      timezone
    );

    // Check for milestones
    const milestoneCheck = await this.checkMilestones(
      adjustedStreak.currentStreak,
      currentStreak.lastMilestone,
      definition.milestones
    );

    return {
      previousStreak: currentStreak.currentStreak,
      currentStreak: adjustedStreak.currentStreak,
      longestStreak: Math.max(adjustedStreak.currentStreak, currentStreak.longestStreak),
      streakBroken: adjustedStreak.broken,
      streakExtended: adjustedStreak.currentStreak > currentStreak.currentStreak,
      milestoneAchieved: milestoneCheck.achieved,
      nextMilestone: milestoneCheck.next,
      gracePeriodUsed: adjustedStreak.gracePeriodUsed,
      lastActivityDate: sortedActivities[sortedActivities.length - 1]?.timestamp,
      nextRequiredDate: this.calculateNextRequiredDate(
        adjustedStreak.currentStreak > 0 ? sortedActivities[sortedActivities.length - 1]?.timestamp : new Date(),
        definition,
        timezone
      )
    };
  }

  private calculateConsecutiveDays(
    activityGroups: Map<string, StreakActivity[]>,
    definition: StreakType,
    timezone: string
  ): ConsecutiveDaysResult {
    const today = this.getToday(timezone);
    let consecutiveDays = 0;
    let currentDate = today;
    let broken = false;

    // Walk backwards from today to find consecutive days
    while (true) {
      const dateKey = this.formatDateKey(currentDate, definition.trackingWindow);
      const dayActivities = activityGroups.get(dateKey) || [];

      // Check if day meets requirements
      const dayMeetsRequirements = this.checkDayRequirements(
        dayActivities, 
        definition.requiredActions,
        definition.minimumThreshold
      );

      if (dayMeetsRequirements) {
        consecutiveDays++;
        currentDate = this.subtractDay(currentDate, definition.trackingWindow);
      } else {
        // Check if we're within grace period for today
        if (this.isToday(currentDate, timezone) && this.isWithinGracePeriod(definition, timezone)) {
          // Don't break streak yet, but don't count this day
          break;
        } else {
          // Streak is broken
          broken = consecutiveDays === 0;
          break;
        }
      }

      // Prevent infinite loops
      if (consecutiveDays > 10000) break;
    }

    return {
      consecutiveDays,
      broken,
      lastValidDate: currentDate
    };
  }

  private async applyGracePeriodAndRecovery(
    consecutiveDays: ConsecutiveDaysResult,
    currentStreak: UserStreak,
    definition: StreakType,
    timezone: string
  ): Promise<AdjustedStreakResult> {
    let finalStreak = consecutiveDays.consecutiveDays;
    let broken = consecutiveDays.broken;
    let gracePeriodUsed = false;

    // Apply grace period if streak would be broken
    if (broken && currentStreak.currentStreak > 0) {
      const withinGracePeriod = this.isWithinGracePeriod(definition, timezone);
      
      if (withinGracePeriod) {
        // Maintain current streak during grace period
        finalStreak = currentStreak.currentStreak;
        broken = false;
        gracePeriodUsed = true;
      }
    }

    // Handle frozen streaks
    if (currentStreak.isCurrentlyFrozen) {
      const freezeStillActive = currentStreak.freezeEndDate && 
        new Date() < currentStreak.freezeEndDate;
      
      if (freezeStillActive) {
        // Maintain streak during freeze
        finalStreak = currentStreak.currentStreak;
        broken = false;
      }
    }

    return {
      currentStreak: finalStreak,
      broken,
      gracePeriodUsed
    };
  }

  private checkDayRequirements(
    activities: StreakActivity[],
    requirements: ActivityRequirement[],
    minimumThreshold?: number
  ): boolean {
    if (activities.length === 0) return false;

    // Check each requirement
    for (const requirement of requirements) {
      const matchingActivities = activities.filter(activity => 
        this.activityMatchesRequirement(activity, requirement)
      );

      if (matchingActivities.length === 0) return false;

      // Check threshold if specified
      if (requirement.minimumValue !== undefined) {
        const totalValue = matchingActivities.reduce(
          (sum, activity) => sum + (activity.activityValue || 0), 
          0
        );
        
        if (totalValue < requirement.minimumValue) return false;
      }
    }

    // Check overall minimum threshold
    if (minimumThreshold !== undefined) {
      const totalValue = activities.reduce(
        (sum, activity) => sum + (activity.activityValue || 0), 
        0
      );
      
      if (totalValue < minimumThreshold) return false;
    }

    return true;
  }
}
```

### Streak Recovery System Implementation

```typescript
class StreakRecoverySystem {
  private streakStore: StreakStore;
  private recoveryStore: RecoveryStore;
  private paymentProcessor: PaymentProcessor;
  private notificationService: NotificationService;

  async useStreakRecovery(
    userId: string, 
    streakType: string, 
    recoveryMethod: RecoveryMethod
  ): Promise<RecoveryResult> {
    const streak = await this.streakStore.getCurrentStreak(userId, streakType);
    const definition = await this.getStreakDefinition(streakType);

    // Validate recovery eligibility
    const eligibility = await this.checkRecoveryEligibility(
      userId, 
      streak, 
      definition, 
      recoveryMethod
    );

    if (!eligibility.eligible) {
      throw new Error(`Recovery not available: ${eligibility.reason}`);
    }

    // Process recovery based on method
    const recoveryResult = await this.processRecovery(
      userId,
      streak,
      definition,
      recoveryMethod
    );

    if (recoveryResult.success) {
      // Update streak status
      await this.applyRecovery(userId, streakType, recoveryResult);

      // Log recovery usage
      await this.logRecoveryUsage(userId, streakType, recoveryMethod);

      // Send notification
      await this.notificationService.notifyStreakRecovered(userId, streak, recoveryResult);
    }

    return recoveryResult;
  }

  async useStreakFreeze(
    userId: string, 
    streakType: string, 
    duration: string
  ): Promise<FreezeResult> {
    const streak = await this.streakStore.getCurrentStreak(userId, streakType);
    const definition = await this.getStreakDefinition(streakType);

    // Validate freeze eligibility
    const eligibility = await this.checkFreezeEligibility(userId, streak, definition);
    if (!eligibility.eligible) {
      throw new Error(`Freeze not available: ${eligibility.reason}`);
    }

    // Calculate freeze end date
    const freezeEndDate = this.calculateFreezeEndDate(duration);

    // Apply freeze
    const freezeResult = await this.applyStreakFreeze(
      userId,
      streakType,
      freezeEndDate
    );

    if (freezeResult.success) {
      // Update available freezes
      await this.decrementAvailableFreezes(userId, streakType);

      // Schedule freeze end notification
      await this.scheduleUnfreezeNotification(userId, streakType, freezeEndDate);

      // Log freeze usage
      await this.logFreezeUsage(userId, streakType, duration);
    }

    return freezeResult;
  }

  private async processRecovery(
    userId: string,
    streak: UserStreak,
    definition: StreakType,
    method: RecoveryMethod
  ): Promise<RecoveryResult> {
    switch (method.type) {
      case 'free_recovery':
        return await this.processFreeRecovery(userId, streak);
        
      case 'paid_recovery':
        return await this.processPaidRecovery(userId, streak, method.cost);
        
      case 'activity_recovery':
        return await this.processActivityRecovery(userId, streak, method.requiredActivity);
        
      case 'social_recovery':
        return await this.processSocialRecovery(userId, streak, method.socialRequirement);
        
      default:
        throw new Error(`Unknown recovery method: ${method.type}`);
    }
  }

  private async processPaidRecovery(
    userId: string,
    streak: UserStreak,
    cost: RecoveryCost
  ): Promise<RecoveryResult> {
    // Process payment
    const payment = await this.paymentProcessor.processPayment({
      userId,
      amount: cost.amount,
      currency: cost.currency,
      description: `Streak recovery for ${streak.streakType}`,
      metadata: {
        streakId: streak.id,
        recoveryType: 'paid'
      }
    });

    if (!payment.success) {
      return {
        success: false,
        reason: `Payment failed: ${payment.error}`,
        method: 'paid_recovery'
      };
    }

    return {
      success: true,
      method: 'paid_recovery',
      paymentId: payment.paymentId,
      recoveredStreak: streak.currentStreak + 1
    };
  }

  private async processActivityRecovery(
    userId: string,
    streak: UserStreak,
    requiredActivity: ActivityRequirement
  ): Promise<RecoveryResult> {
    // Check if user has completed required activity
    const activityCompleted = await this.checkActivityCompletion(
      userId,
      requiredActivity
    );

    if (!activityCompleted.completed) {
      return {
        success: false,
        reason: 'Required activity not completed',
        method: 'activity_recovery',
        requiredActivity
      };
    }

    return {
      success: true,
      method: 'activity_recovery',
      completedActivity: activityCompleted.activity,
      recoveredStreak: streak.currentStreak + 1
    };
  }

  private async checkRecoveryEligibility(
    userId: string,
    streak: UserStreak,
    definition: StreakType,
    method: RecoveryMethod
  ): Promise<EligibilityCheck> {
    // Check if recovery is allowed for this streak type
    if (!definition.allowRecovery) {
      return { eligible: false, reason: 'Recovery not allowed for this streak type' };
    }

    // Check if streak is actually broken
    if (streak.status !== 'broken') {
      return { eligible: false, reason: 'Streak is not broken' };
    }

    // Check recovery limits
    if (streak.availableRecoveries <= 0) {
      return { eligible: false, reason: 'No recoveries remaining' };
    }

    // Check time limits (can only recover within certain timeframe)
    const timeSinceBreak = Date.now() - streak.lastActivityDate.getTime();
    const maxRecoveryWindow = this.parseTimeString(definition.recoveryPeriod || '24h');
    
    if (timeSinceBreak > maxRecoveryWindow) {
      return { eligible: false, reason: 'Recovery window expired' };
    }

    // Check method-specific eligibility
    const methodEligibility = await this.checkMethodEligibility(userId, method);
    if (!methodEligibility.eligible) {
      return methodEligibility;
    }

    return { eligible: true };
  }
}
```

### Streak Milestone System Implementation

```typescript
class StreakMilestoneManager {
  private milestoneStore: MilestoneStore;
  private rewardService: RewardService;
  private achievementService: AchievementService;
  private notificationService: NotificationService;

  async checkAndAwardMilestones(
    userId: string,
    streakType: string,
    currentStreak: number,
    previousStreak: number
  ): Promise<MilestoneAward[]> {
    const definition = await this.getStreakDefinition(streakType);
    const awards: MilestoneAward[] = [];

    // Find milestones achieved in this update
    const achievedMilestones = definition.milestones.filter(milestone => 
      milestone.day <= currentStreak && milestone.day > previousStreak
    );

    for (const milestone of achievedMilestones) {
      const award = await this.awardMilestone(userId, streakType, milestone);
      awards.push(award);
    }

    return awards;
  }

  private async awardMilestone(
    userId: string,
    streakType: string,
    milestone: StreakMilestone
  ): Promise<MilestoneAward> {
    // Create milestone achievement record
    const achievement = await this.achievementService.createAchievement({
      userId,
      type: 'streak_milestone',
      name: milestone.name,
      description: milestone.description,
      metadata: {
        streakType,
        streakDay: milestone.day,
        milestoneId: milestone.id
      }
    });

    // Award rewards
    const rewards: MilestoneReward[] = [];
    for (const reward of milestone.rewards) {
      const awardedReward = await this.awardMilestoneReward(userId, reward);
      rewards.push(awardedReward);
    }

    // Create celebration
    const celebration = await this.createMilestoneCelebration(
      userId,
      streakType,
      milestone
    );

    // Send notification
    await this.notificationService.notifyMilestoneAchieved(
      userId,
      milestone,
      rewards
    );

    // Log milestone achievement
    await this.analyticsLogger.logMilestoneAchievement({
      userId,
      streakType,
      milestone: milestone.day,
      rewards: rewards.map(r => r.type)
    });

    return {
      milestone,
      achievement,
      rewards,
      celebration,
      awardedAt: new Date()
    };
  }

  async getUpcomingMilestones(
    userId: string,
    streakType: string,
    currentStreak: number
  ): Promise<UpcomingMilestone[]> {
    const definition = await this.getStreakDefinition(streakType);
    
    const upcomingMilestones = definition.milestones
      .filter(milestone => milestone.day > currentStreak)
      .sort((a, b) => a.day - b.day)
      .slice(0, 5) // Show next 5 milestones
      .map(milestone => ({
        milestone,
        daysRemaining: milestone.day - currentStreak,
        progress: currentStreak / milestone.day,
        estimatedDate: this.estimateAchievementDate(
          currentStreak,
          milestone.day,
          userId,
          streakType
        )
      }));

    return upcomingMilestones;
  }

  private async createMilestoneCelebration(
    userId: string,
    streakType: string,
    milestone: StreakMilestone
  ): Promise<MilestoneCelebration> {
    // Generate personalized celebration message
    const celebrationMessage = await this.generateCelebrationMessage(
      userId,
      streakType,
      milestone
    );

    // Create visual celebration elements
    const visualElements = await this.createCelebrationVisuals(milestone);

    // Schedule celebration display
    const celebration: MilestoneCelebration = {
      id: this.generateCelebrationId(),
      userId,
      streakType,
      milestone: milestone.day,
      message: celebrationMessage,
      visualElements,
      displayDuration: milestone.celebrationDuration || '5s',
      scheduledAt: new Date(),
      status: 'scheduled'
    };

    await this.celebrationStore.save(celebration);

    return celebration;
  }

  private async generateCelebrationMessage(
    userId: string,
    streakType: string,
    milestone: StreakMilestone
  ): Promise<string> {
    const userProfile = await this.getUserProfile(userId);
    const streakDefinition = await this.getStreakDefinition(streakType);

    // Use milestone-specific message if available
    if (milestone.celebrationMessage) {
      return this.personalizeCelebrationMessage(
        milestone.celebrationMessage,
        userProfile,
        milestone
      );
    }

    // Generate dynamic message based on milestone significance
    const templates = this.getCelebrationTemplates(milestone.day);
    const selectedTemplate = this.selectCelebrationTemplate(templates, userProfile);

    return this.personalizeCelebrationMessage(
      selectedTemplate,
      userProfile,
      milestone
    );
  }
}
```

## Integration Points

### User Analytics Integration
```typescript
interface StreakAnalyticsIntegration {
  trackStreakActivity(activity: StreakActivity): Promise<void>;
  trackStreakMilestone(milestone: MilestoneAward): Promise<void>;
  trackStreakRecovery(recovery: RecoveryUsage): Promise<void>;
  generateHabitMetrics(userId: string): Promise<HabitMetrics>;
}

class StreakAnalyticsService {
  async generateStreakReport(userId: string, timeRange: TimeRange): Promise<StreakReport> {
    return {
      streakSummary: await this.getStreakSummary(userId, timeRange),
      habitFormationMetrics: await this.getHabitFormationMetrics(userId, timeRange),
      consistencyAnalysis: await this.getConsistencyAnalysis(userId, timeRange),
      milestoneProgress: await this.getMilestoneProgress(userId),
      streakComparisons: await this.getStreakComparisons(userId, timeRange)
    };
  }

  async trackHabitFormation(userId: string, streakType: string): Promise<void> {
    const habitMetrics = await this.calculateHabitMetrics(userId, streakType);
    
    await this.analyticsService.trackEvent(userId, {
      eventType: 'habit_formation_analysis',
      properties: {
        streakType,
        currentStreak: habitMetrics.currentStreak,
        longestStreak: habitMetrics.longestStreak,
        consistencyScore: habitMetrics.consistencyScore,
        habitStrength: habitMetrics.habitStrength,
        formationStage: habitMetrics.formationStage
      }
    });
  }
}
```

### Notification System Integration
```typescript
interface StreakNotificationService {
  notifyStreakExtended(userId: string, streak: UserStreak): Promise<void>;
  notifyStreakAtRisk(userId: string, streak: UserStreak): Promise<void>;
  notifyMilestoneApproaching(userId: string, milestone: UpcomingMilestone): Promise<void>;
  notifyStreakBroken(userId: string, streak: UserStreak): Promise<void>;
}

class StreakNotificationHandler {
  async handleStreakUpdate(event: StreakUpdateEvent): Promise<void> {
    const { userId, streakType, previousStreak, currentStreak, milestones } = event;
    
    // Notify streak extension
    if (currentStreak > previousStreak) {
      await this.notificationService.send(userId, {
        type: 'streak_extended',
        title: 'Streak Extended! 🔥',
        message: `Your ${streakType} streak is now ${currentStreak} days!`,
        data: { streakType, currentStreak }
      });
    }

    // Notify milestones
    for (const milestone of milestones) {
      await this.notificationService.send(userId, {
        type: 'milestone_achieved',
        title: `${milestone.name} Achieved! 🎉`,
        message: milestone.description,
        data: { streakType, milestone: milestone.day }
      });
    }
  }

  async scheduleStreakReminders(userId: string): Promise<void> {
    const activeStreaks = await this.getActiveStreaks(userId);
    
    for (const streak of activeStreaks) {
      const nextRequiredTime = streak.nextRequiredDate;
      const reminderTime = new Date(nextRequiredTime.getTime() - 2 * 60 * 60 * 1000); // 2 hours before
      
      await this.scheduledNotificationService.schedule(userId, {
        type: 'streak_reminder',
        scheduledFor: reminderTime,
        data: {
          streakType: streak.streakType,
          currentStreak: streak.currentStreak,
          deadline: nextRequiredTime
        }
      });
    }
  }
}
```

## Security Considerations

### Streak Integrity and Anti-Manipulation
```typescript
interface StreakSecurityService {
  validateActivity(activity: StreakActivity): Promise<ValidationResult>;
  detectStreakManipulation(userId: string): Promise<ManipulationDetection>;
  validateTimestamp(timestamp: Date, userId: string): Promise<TimestampValidation>;
  monitorStreakPatterns(streakType: string): Promise<PatternAnalysis>;
}

class StreakSecurityManager {
  async validateStreakActivity(activity: StreakActivity): Promise<ValidationResult> {
    const checks: Promise<SecurityCheck>[] = [
      this.validateTimestamp(activity.timestamp, activity.userId),
      this.checkActivityAuthenticity(activity),
      this.validateActivitySource(activity.source),
      this.checkForTimeManipulation(activity)
    ];

    const results = await Promise.all(checks);
    const failedChecks = results.filter(result => !result.passed);

    if (failedChecks.length > 0) {
      await this.flagSuspiciousActivity(activity, failedChecks);
      return {
        valid: false,
        reason: 'Activity failed security validation',
        details: failedChecks
      };
    }

    return { valid: true };
  }

  private async checkForTimeManipulation(activity: StreakActivity): Promise<SecurityCheck> {
    // Check for suspicious timestamp patterns
    const userActivities = await this.getRecentUserActivities(
      activity.userId, 
      activity.streakType,
      { hours: 48 }
    );

    // Look for impossible time gaps or patterns
    const timePatterns = this.analyzeTimePatterns(userActivities);
    
    if (timePatterns.suspicious) {
      return {
        passed: false,
        reason: 'Suspicious timestamp patterns detected',
        severity: 'high',
        details: timePatterns.anomalies
      };
    }

    // Check for timezone manipulation
    const timezoneCheck = await this.validateTimezone(activity);
    if (!timezoneCheck.valid) {
      return {
        passed: false,
        reason: 'Timezone manipulation detected',
        severity: 'medium'
      };
    }

    return { passed: true };
  }

  async preventStreakFarming(): Promise<void> {
    // Monitor for automated streak farming
    const suspiciousPatterns = await this.detectFarmingPatterns();
    
    for (const pattern of suspiciousPatterns) {
      await this.investigateUser(pattern.userId, 'streak_farming');
    }

    // Check for coordinated streak manipulation
    const coordinationAnalysis = await this.detectCoordinatedManipulation();
    if (coordinationAnalysis.detected) {
      await this.handleCoordinatedManipulation(coordinationAnalysis);
    }
  }

  private async detectFarmingPatterns(): Promise<SuspiciousPattern[]> {
    const patterns: SuspiciousPattern[] = [];
    
    // Look for users with perfect streaks across multiple types
    const perfectStreakUsers = await this.findPerfectStreakUsers();
    
    for (const user of perfectStreakUsers) {
      const activityPattern = await this.analyzeUserActivityPattern(user.userId);
      
      if (activityPattern.tooRegular || activityPattern.impossibleTiming) {
        patterns.push({
          userId: user.userId,
          type: 'perfect_streak_farming',
          confidence: activityPattern.suspicionScore,
          evidence: activityPattern.evidence
        });
      }
    }

    return patterns;
  }
}
```

## Testing Considerations

### Streak System Testing
```typescript
describe('Streak Tracking System', () => {
  describe('Streak Calculation', () => {
    it('should calculate streak correctly for consecutive days', async () => {
      const activities = [
        { userId: 'user-1', activityType: 'login', timestamp: new Date('2024-01-01') },
        { userId: 'user-1', activityType: 'login', timestamp: new Date('2024-01-02') },
        { userId: 'user-1', activityType: 'login', timestamp: new Date('2024-01-03') }
      ];

      const streak = await streakCalculator.calculateStreak('user-1', 'daily_login', activities);
      expect(streak.currentStreak).toBe(3);
    });

    it('should handle timezone differences correctly', async () => {
      const activity = {
        userId: 'user-1',
        activityType: 'login',
        timestamp: new Date('2024-01-01T23:30:00Z'), // Late UTC
        timezone: 'America/New_York' // Early EST
      };

      const streak = await streakCalculator.calculateStreak('user-1', 'daily_login', [activity]);
      expect(streak.currentStreak).toBe(1);
    });
  });

  describe('Streak Recovery', () => {
    it('should allow recovery when eligible', async () => {
      const result = await recoverySystem.useStreakRecovery('user-1', 'daily_login', {
        type: 'free_recovery'
      });

      expect(result.success).toBe(true);
      expect(result.recoveredStreak).toBeGreaterThan(0);
    });

    it('should reject recovery when not eligible', async () => {
      await expect(recoverySystem.useStreakRecovery('user-no-recoveries', 'daily_login', {
        type: 'free_recovery'
      })).rejects.toThrow('No recoveries remaining');
    });
  });

  describe('Milestone System', () => {
    it('should award milestones at correct streak lengths', async () => {
      const awards = await milestoneManager.checkAndAwardMilestones('user-1', 'daily_login', 7, 6);

      expect(awards).toHaveLength(1);
      expect(awards[0].milestone.day).toBe(7);
    });

    it('should show upcoming milestones', async () => {
      const upcoming = await milestoneManager.getUpcomingMilestones('user-1', 'daily_login', 5);

      expect(upcoming).toBeInstanceOf(Array);
      upcoming.forEach(milestone => {
        expect(milestone.daysRemaining).toBeGreaterThan(0);
      });
    });
  });
});
```