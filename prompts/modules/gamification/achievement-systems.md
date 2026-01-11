# Achievement Systems Template

## Purpose

This template provides comprehensive patterns for implementing achievement and badge systems that recognize user accomplishments, track progress toward goals, and create engaging milestone experiences. It covers badge creation, progress tracking, achievement unlocking, and showcase features to drive user engagement and retention through recognition and accomplishment.

## Context

Achievement systems are powerful motivational tools that provide users with clear goals, recognition for accomplishments, and social status indicators. A well-designed achievement system creates meaningful milestones, celebrates user progress, and encourages continued engagement through carefully crafted challenges and rewards. This template addresses the complexity of building scalable achievement systems that support various achievement types, progress tracking mechanisms, and social sharing features while maintaining fairness and preventing gaming.

## Instructions

1. **Setup Achievement Infrastructure**: Configure achievement types, criteria, and tracking systems
2. **Implement Progress Tracking**: Build comprehensive progress monitoring and calculation
3. **Add Achievement Unlocking**: Enable automatic achievement detection and unlocking
4. **Configure Badge Management**: Implement badge creation, assignment, and display systems
5. **Enable Social Features**: Add achievement sharing and showcase capabilities
6. **Add Analytics Tracking**: Build achievement engagement and completion analytics
7. **Test Achievement Logic**: Validate achievement criteria and progress calculations

## Examples

### Example 1: Achievement System Service
```typescript
interface AchievementSystemService {
  createAchievement(achievement: AchievementDefinition): Promise<Achievement>;
  trackProgress(userId: string, action: UserAction): Promise<ProgressUpdate>;
  checkAchievements(userId: string): Promise<UnlockedAchievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  shareAchievement(userId: string, achievementId: string): Promise<ShareResult>;
}

const achievementSystem = new AchievementSystemService();
const progress = await achievementSystem.trackProgress('user-123', {
  actionType: 'complete_course',
  metadata: {
    courseId: 'javascript-basics',
    score: 95,
    timeSpent: 3600
  }
});
```

### Example 2: Achievement Definition
```typescript
interface AchievementDefinition {
  id: string;
  name: string;
  description: string;
  criteria: AchievementCriteria;
  rewards: AchievementReward[];
  badge: BadgeDesign;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  category: string;
}

const achievement: AchievementDefinition = {
  id: 'course-master',
  name: 'Course Master',
  description: 'Complete 10 courses with a score of 90% or higher',
  criteria: {
    type: 'aggregate',
    conditions: [
      {
        action: 'complete_course',
        count: 10,
        filters: [
          { field: 'score', operator: 'gte', value: 90 }
        ]
      }
    ]
  },
  rewards: [
    { type: 'points', amount: 500 },
    { type: 'title', value: 'Master Learner' }
  ],
  badge: {
    iconUrl: '/badges/course-master.svg',
    backgroundColor: '#gold',
    borderColor: '#darkgold'
  },
  rarity: 'rare',
  category: 'learning'
};
```

### Example 3: Progress Tracking Engine
```typescript
interface ProgressTrackingEngine {
  updateProgress(userId: string, achievementId: string, progress: ProgressData): Promise<void>;
  calculateProgress(userId: string, criteria: AchievementCriteria): Promise<ProgressResult>;
  getProgressSummary(userId: string): Promise<ProgressSummary>;
  predictNextAchievements(userId: string): Promise<PredictedAchievement[]>;
}

const progressEngine = new ProgressTrackingEngine();
const summary = await progressEngine.getProgressSummary('user-123');
// Returns progress toward all active achievements
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableAchievements | Enable achievement system | boolean | No | true |
| enableProgressTracking | Enable real-time progress tracking | boolean | No | true |
| enableSocialSharing | Enable achievement sharing | boolean | No | true |
| enableBadgeShowcase | Enable user badge showcase | boolean | No | true |
| maxActiveAchievements | Maximum achievements to track simultaneously | number | No | 50 |
| enableRetroactiveUnlocks | Enable unlocking past achievements | boolean | No | true |
| enableAchievementNotifications | Enable achievement unlock notifications | boolean | No | true |
| progressUpdateBatchSize | Batch size for progress updates | number | No | 100 |

## Expected Output

This template will produce:
- **Achievement Definition System**: Comprehensive achievement creation and management
- **Progress Tracking Engine**: Real-time progress monitoring and calculation
- **Badge Management System**: Badge design, assignment, and display functionality
- **Unlock Detection System**: Automatic achievement detection and unlocking
- **Social Sharing Features**: Achievement sharing and showcase capabilities
- **Analytics Dashboard**: Achievement engagement and completion metrics
- **User Achievement Profiles**: Personal achievement galleries and progress displays
- **Admin Management Tools**: Achievement creation and monitoring interfaces

## Implementation Patterns

### Achievement System Architecture

```typescript
// Core Achievement System Architecture
interface AchievementSystemCore {
  definitionManager: AchievementDefinitionManager;
  progressTracker: ProgressTrackingEngine;
  unlockDetector: AchievementUnlockDetector;
  badgeManager: BadgeManager;
  socialFeatures: AchievementSocialFeatures;
  analyticsTracker: AchievementAnalytics;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  
  // Achievement criteria
  criteria: AchievementCriteria;
  
  // Rewards and recognition
  rewards: AchievementReward[];
  badge: BadgeDesign;
  
  // Classification
  category: string;
  rarity: AchievementRarity;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  
  // Availability
  isActive: boolean;
  isSecret: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  
  // Prerequisites
  prerequisites: string[];
  
  // Metadata
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  
  // Statistics
  totalUnlocks: number;
  unlockRate: number;
}

interface UserAchievement {
  userId: string;
  achievementId: string;
  
  // Progress tracking
  currentProgress: ProgressData;
  maxProgress: ProgressData;
  progressPercentage: number;
  
  // Status
  status: 'locked' | 'in_progress' | 'unlocked' | 'showcased';
  unlockedAt?: Date;
  
  // Progress history
  progressHistory: ProgressSnapshot[];
  
  // Social features
  isShared: boolean;
  shareCount: number;
  
  // Metadata
  firstProgressAt: Date;
  lastProgressAt: Date;
}

interface AchievementCriteria {
  type: 'simple' | 'aggregate' | 'sequence' | 'time_based' | 'comparative';
  conditions: AchievementCondition[];
  
  // Logical operators
  operator?: 'and' | 'or';
  
  // Time constraints
  timeWindow?: TimeWindow;
  
  // Context requirements
  contextFilters?: ContextFilter[];
}

interface AchievementCondition {
  // Action requirements
  action: string;
  count?: number;
  
  // Value requirements
  field?: string;
  operator?: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value?: any;
  
  // Filters
  filters?: ConditionFilter[];
  
  // Timing
  within?: string; // e.g., '24h', '7d', '30d'
  consecutive?: boolean;
}
```

**Achievement Definition Manager**
```typescript
class AchievementDefinitionManager {
  private achievementStore: AchievementStore;
  private validator: AchievementValidator;
  private badgeGenerator: BadgeGenerator;

  async createAchievement(definition: AchievementDefinition): Promise<Achievement> {
    // Validate achievement definition
    const validation = await this.validator.validate(definition);
    if (!validation.valid) {
      throw new Error(`Invalid achievement definition: ${validation.errors.join(', ')}`);
    }

    // Generate unique ID if not provided
    const achievementId = definition.id || this.generateAchievementId(definition.name);

    // Create badge if not provided
    let badge = definition.badge;
    if (!badge) {
      badge = await this.badgeGenerator.generateBadge(definition);
    }

    // Create achievement record
    const achievement: Achievement = {
      id: achievementId,
      name: definition.name,
      description: definition.description,
      longDescription: definition.longDescription,
      criteria: definition.criteria,
      rewards: definition.rewards || [],
      badge,
      category: definition.category,
      rarity: definition.rarity || 'common',
      difficulty: definition.difficulty || 'medium',
      isActive: definition.isActive !== false,
      isSecret: definition.isSecret || false,
      availableFrom: definition.availableFrom,
      availableUntil: definition.availableUntil,
      prerequisites: definition.prerequisites || [],
      tags: definition.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      totalUnlocks: 0,
      unlockRate: 0
    };

    // Save achievement
    await this.achievementStore.save(achievement);

    // Initialize tracking for existing users if retroactive
    if (this.config.enableRetroactiveUnlocks) {
      await this.initializeRetroactiveTracking(achievement);
    }

    return achievement;
  }

  async updateAchievement(id: string, updates: Partial<AchievementDefinition>): Promise<Achievement> {
    const existing = await this.achievementStore.findById(id);
    if (!existing) {
      throw new Error('Achievement not found');
    }

    // Validate updates
    const updatedDefinition = { ...existing, ...updates };
    const validation = await this.validator.validate(updatedDefinition);
    if (!validation.valid) {
      throw new Error(`Invalid achievement update: ${validation.errors.join(', ')}`);
    }

    // Apply updates
    const updated: Achievement = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    await this.achievementStore.save(updated);

    // Recalculate progress for affected users if criteria changed
    if (updates.criteria) {
      await this.recalculateProgressForAchievement(id);
    }

    return updated;
  }

  private async initializeRetroactiveTracking(achievement: Achievement): Promise<void> {
    // Get all users who might qualify for this achievement
    const users = await this.userService.getAllActiveUsers();
    
    // Process in batches to avoid overwhelming the system
    const batchSize = this.config.retroactiveBatchSize || 100;
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async (user) => {
        try {
          await this.progressTracker.initializeUserProgress(user.id, achievement.id);
        } catch (error) {
          console.error(`Failed to initialize retroactive progress for user ${user.id}:`, error);
        }
      }));
    }
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    return this.achievementStore.findByCategory(category);
  }

  async searchAchievements(query: AchievementSearchQuery): Promise<Achievement[]> {
    return this.achievementStore.search(query);
  }
}
```

### Progress Tracking Engine Implementation

```typescript
class ProgressTrackingEngine {
  private progressStore: ProgressStore;
  private achievementStore: AchievementStore;
  private actionProcessor: ActionProcessor;
  private unlockDetector: AchievementUnlockDetector;

  async trackProgress(userId: string, action: UserAction): Promise<ProgressUpdate[]> {
    // Get achievements that might be affected by this action
    const relevantAchievements = await this.getRelevantAchievements(action);
    
    const updates: ProgressUpdate[] = [];

    for (const achievement of relevantAchievements) {
      try {
        const update = await this.updateAchievementProgress(userId, achievement, action);
        if (update) {
          updates.push(update);
        }
      } catch (error) {
        console.error(`Failed to update progress for achievement ${achievement.id}:`, error);
      }
    }

    // Check for newly unlocked achievements
    const newUnlocks = await this.unlockDetector.checkForUnlocks(userId, updates);
    
    // Process unlocks
    for (const unlock of newUnlocks) {
      await this.processAchievementUnlock(userId, unlock);
    }

    return updates;
  }

  private async updateAchievementProgress(
    userId: string, 
    achievement: Achievement, 
    action: UserAction
  ): Promise<ProgressUpdate | null> {
    // Get current progress
    const currentProgress = await this.getUserProgress(userId, achievement.id);
    
    // Calculate new progress based on action
    const newProgress = await this.calculateProgress(userId, achievement, action, currentProgress);
    
    // Check if progress actually changed
    if (this.isProgressEqual(currentProgress.currentProgress, newProgress)) {
      return null;
    }

    // Create progress update
    const progressUpdate: ProgressUpdate = {
      userId,
      achievementId: achievement.id,
      previousProgress: currentProgress.currentProgress,
      newProgress,
      progressDelta: this.calculateProgressDelta(currentProgress.currentProgress, newProgress),
      action,
      timestamp: new Date()
    };

    // Update stored progress
    const updatedUserAchievement: UserAchievement = {
      ...currentProgress,
      currentProgress: newProgress,
      progressPercentage: this.calculateProgressPercentage(newProgress, achievement.criteria),
      lastProgressAt: new Date(),
      progressHistory: [
        ...currentProgress.progressHistory,
        {
          progress: newProgress,
          timestamp: new Date(),
          action: action.type
        }
      ].slice(-this.config.maxProgressHistoryEntries)
    };

    await this.progressStore.save(updatedUserAchievement);

    // Emit progress event
    await this.eventEmitter.emit('achievement.progress', progressUpdate);

    return progressUpdate;
  }

  private async calculateProgress(
    userId: string, 
    achievement: Achievement, 
    action: UserAction, 
    currentProgress: UserAchievement
  ): Promise<ProgressData> {
    const criteria = achievement.criteria;
    
    switch (criteria.type) {
      case 'simple':
        return this.calculateSimpleProgress(userId, criteria, action, currentProgress);
      case 'aggregate':
        return this.calculateAggregateProgress(userId, criteria, action, currentProgress);
      case 'sequence':
        return this.calculateSequenceProgress(userId, criteria, action, currentProgress);
      case 'time_based':
        return this.calculateTimeBasedProgress(userId, criteria, action, currentProgress);
      case 'comparative':
        return this.calculateComparativeProgress(userId, criteria, action, currentProgress);
      default:
        throw new Error(`Unsupported criteria type: ${criteria.type}`);
    }
  }

  private async calculateSimpleProgress(
    userId: string, 
    criteria: AchievementCriteria, 
    action: UserAction, 
    currentProgress: UserAchievement
  ): Promise<ProgressData> {
    const condition = criteria.conditions[0];
    
    // Check if action matches condition
    if (!this.actionMatches(action, condition)) {
      return currentProgress.currentProgress;
    }

    // Simple increment
    const currentCount = currentProgress.currentProgress.count || 0;
    const targetCount = condition.count || 1;
    
    return {
      count: Math.min(currentCount + 1, targetCount),
      targetCount,
      lastActionAt: new Date()
    };
  }

  private async calculateAggregateProgress(
    userId: string, 
    criteria: AchievementCriteria, 
    action: UserAction, 
    currentProgress: UserAchievement
  ): Promise<ProgressData> {
    const progress = { ...currentProgress.currentProgress };
    
    for (const condition of criteria.conditions) {
      if (this.actionMatches(action, condition)) {
        const conditionKey = this.getConditionKey(condition);
        const currentCount = progress[conditionKey] || 0;
        const targetCount = condition.count || 1;
        
        progress[conditionKey] = Math.min(currentCount + 1, targetCount);
        progress.lastActionAt = new Date();
      }
    }

    return progress;
  }

  private async calculateSequenceProgress(
    userId: string, 
    criteria: AchievementCriteria, 
    action: UserAction, 
    currentProgress: UserAchievement
  ): Promise<ProgressData> {
    const progress = { ...currentProgress.currentProgress };
    const currentStep = progress.currentStep || 0;
    
    // Check if action matches the next step in sequence
    if (currentStep < criteria.conditions.length) {
      const nextCondition = criteria.conditions[currentStep];
      
      if (this.actionMatches(action, nextCondition)) {
        progress.currentStep = currentStep + 1;
        progress.completedSteps = progress.completedSteps || [];
        progress.completedSteps.push({
          step: currentStep,
          completedAt: new Date(),
          action: action.type
        });
        progress.lastActionAt = new Date();
      } else if (criteria.conditions[0] && this.actionMatches(action, criteria.conditions[0])) {
        // Reset to step 1 if first action is performed out of sequence
        progress.currentStep = 1;
        progress.completedSteps = [{
          step: 0,
          completedAt: new Date(),
          action: action.type
        }];
        progress.lastActionAt = new Date();
      }
    }

    return progress;
  }

  private async calculateTimeBasedProgress(
    userId: string, 
    criteria: AchievementCriteria, 
    action: UserAction, 
    currentProgress: UserAchievement
  ): Promise<ProgressData> {
    const timeWindow = criteria.timeWindow;
    if (!timeWindow) {
      throw new Error('Time-based criteria requires timeWindow');
    }

    // Get actions within time window
    const windowStart = this.calculateTimeWindowStart(timeWindow);
    const actionsInWindow = await this.getActionsInTimeWindow(userId, windowStart, new Date());

    // Add current action
    actionsInWindow.push(action);

    // Calculate progress based on actions in window
    const progress = { ...currentProgress.currentProgress };
    
    for (const condition of criteria.conditions) {
      const matchingActions = actionsInWindow.filter(a => this.actionMatches(a, condition));
      const conditionKey = this.getConditionKey(condition);
      const targetCount = condition.count || 1;
      
      progress[conditionKey] = Math.min(matchingActions.length, targetCount);
    }

    progress.windowStart = windowStart;
    progress.windowEnd = new Date();
    progress.lastActionAt = new Date();

    return progress;
  }

  private actionMatches(action: UserAction, condition: AchievementCondition): boolean {
    // Check action type
    if (condition.action !== action.type) {
      return false;
    }

    // Check filters
    if (condition.filters) {
      for (const filter of condition.filters) {
        if (!this.evaluateFilter(action, filter)) {
          return false;
        }
      }
    }

    return true;
  }

  private evaluateFilter(action: UserAction, filter: ConditionFilter): boolean {
    const value = this.getActionValue(action, filter.field);
    
    switch (filter.operator) {
      case 'eq':
        return value === filter.value;
      case 'ne':
        return value !== filter.value;
      case 'gt':
        return value > filter.value;
      case 'gte':
        return value >= filter.value;
      case 'lt':
        return value < filter.value;
      case 'lte':
        return value <= filter.value;
      case 'in':
        return Array.isArray(filter.value) && filter.value.includes(value);
      case 'contains':
        return typeof value === 'string' && value.includes(filter.value);
      default:
        return false;
    }
  }

  async getUserProgress(userId: string, achievementId: string): Promise<UserAchievement> {
    let progress = await this.progressStore.findByUserAndAchievement(userId, achievementId);
    
    if (!progress) {
      // Initialize progress for new achievement
      progress = await this.initializeUserProgress(userId, achievementId);
    }

    return progress;
  }

  async initializeUserProgress(userId: string, achievementId: string): Promise<UserAchievement> {
    const achievement = await this.achievementStore.findById(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    const initialProgress: UserAchievement = {
      userId,
      achievementId,
      currentProgress: this.getInitialProgress(achievement.criteria),
      maxProgress: this.getMaxProgress(achievement.criteria),
      progressPercentage: 0,
      status: 'locked',
      progressHistory: [],
      isShared: false,
      shareCount: 0,
      firstProgressAt: new Date(),
      lastProgressAt: new Date()
    };

    await this.progressStore.save(initialProgress);
    return initialProgress;
  }
}
```

### Achievement Unlock Detection

```typescript
class AchievementUnlockDetector {
  private progressStore: ProgressStore;
  private achievementStore: AchievementStore;
  private rewardProcessor: RewardProcessor;
  private notificationService: NotificationService;

  async checkForUnlocks(userId: string, progressUpdates: ProgressUpdate[]): Promise<UnlockedAchievement[]> {
    const unlocks: UnlockedAchievement[] = [];

    for (const update of progressUpdates) {
      const achievement = await this.achievementStore.findById(update.achievementId);
      if (!achievement) continue;

      const userProgress = await this.progressStore.findByUserAndAchievement(userId, achievement.id);
      if (!userProgress || userProgress.status === 'unlocked') continue;

      // Check if achievement criteria are met
      const isUnlocked = await this.checkUnlockCriteria(achievement, userProgress);
      
      if (isUnlocked) {
        const unlock = await this.processUnlock(userId, achievement, userProgress);
        unlocks.push(unlock);
      }
    }

    return unlocks;
  }

  private async checkUnlockCriteria(
    achievement: Achievement, 
    userProgress: UserAchievement
  ): boolean {
    const criteria = achievement.criteria;
    
    switch (criteria.type) {
      case 'simple':
        return this.checkSimpleCriteria(criteria, userProgress);
      case 'aggregate':
        return this.checkAggregateCriteria(criteria, userProgress);
      case 'sequence':
        return this.checkSequenceCriteria(criteria, userProgress);
      case 'time_based':
        return this.checkTimeBasedCriteria(criteria, userProgress);
      case 'comparative':
        return this.checkComparativeCriteria(criteria, userProgress);
      default:
        return false;
    }
  }

  private checkSimpleCriteria(criteria: AchievementCriteria, userProgress: UserAchievement): boolean {
    const condition = criteria.conditions[0];
    const targetCount = condition.count || 1;
    const currentCount = userProgress.currentProgress.count || 0;
    
    return currentCount >= targetCount;
  }

  private checkAggregateCriteria(criteria: AchievementCriteria, userProgress: UserAchievement): boolean {
    const operator = criteria.operator || 'and';
    
    if (operator === 'and') {
      // All conditions must be met
      return criteria.conditions.every(condition => {
        const conditionKey = this.getConditionKey(condition);
        const currentCount = userProgress.currentProgress[conditionKey] || 0;
        const targetCount = condition.count || 1;
        return currentCount >= targetCount;
      });
    } else {
      // At least one condition must be met
      return criteria.conditions.some(condition => {
        const conditionKey = this.getConditionKey(condition);
        const currentCount = userProgress.currentProgress[conditionKey] || 0;
        const targetCount = condition.count || 1;
        return currentCount >= targetCount;
      });
    }
  }

  private checkSequenceCriteria(criteria: AchievementCriteria, userProgress: UserAchievement): boolean {
    const currentStep = userProgress.currentProgress.currentStep || 0;
    return currentStep >= criteria.conditions.length;
  }

  private async processUnlock(
    userId: string, 
    achievement: Achievement, 
    userProgress: UserAchievement
  ): Promise<UnlockedAchievement> {
    const unlockedAt = new Date();
    
    // Update user progress
    const updatedProgress: UserAchievement = {
      ...userProgress,
      status: 'unlocked',
      unlockedAt,
      progressPercentage: 100
    };

    await this.progressStore.save(updatedProgress);

    // Process rewards
    const processedRewards = await this.rewardProcessor.processRewards(userId, achievement.rewards);

    // Create unlock record
    const unlock: UnlockedAchievement = {
      id: this.generateUnlockId(),
      userId,
      achievementId: achievement.id,
      achievementName: achievement.name,
      unlockedAt,
      rewards: processedRewards,
      badge: achievement.badge,
      rarity: achievement.rarity
    };

    // Save unlock record
    await this.unlockStore.save(unlock);

    // Update achievement statistics
    await this.updateAchievementStats(achievement.id);

    // Send notification
    await this.notificationService.notifyAchievementUnlocked(userId, unlock);

    // Emit unlock event
    await this.eventEmitter.emit('achievement.unlocked', unlock);

    return unlock;
  }

  private async updateAchievementStats(achievementId: string): Promise<void> {
    const totalUnlocks = await this.unlockStore.countUnlocks(achievementId);
    const totalUsers = await this.userService.getTotalActiveUsers();
    const unlockRate = totalUsers > 0 ? totalUnlocks / totalUsers : 0;

    await this.achievementStore.updateStats(achievementId, {
      totalUnlocks,
      unlockRate
    });
  }
}
```

### Badge Management System

```typescript
class BadgeManager {
  private badgeStore: BadgeStore;
  private badgeRenderer: BadgeRenderer;
  private showcaseManager: ShowcaseManager;

  async createBadge(design: BadgeDesign): Promise<Badge> {
    const badge: Badge = {
      id: this.generateBadgeId(),
      ...design,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Generate badge assets if needed
    if (!badge.renderedAssets) {
      badge.renderedAssets = await this.badgeRenderer.renderBadge(badge);
    }

    await this.badgeStore.save(badge);
    return badge;
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const userAchievements = await this.progressStore.findUnlockedByUser(userId);
    
    const badges: UserBadge[] = [];
    
    for (const achievement of userAchievements) {
      const achievementData = await this.achievementStore.findById(achievement.achievementId);
      if (achievementData && achievementData.badge) {
        badges.push({
          badgeId: achievementData.badge.id,
          achievementId: achievement.achievementId,
          unlockedAt: achievement.unlockedAt!,
          badge: achievementData.badge,
          isShowcased: await this.showcaseManager.isBadgeShowcased(userId, achievementData.badge.id)
        });
      }
    }

    return badges.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async showcaseBadge(userId: string, badgeId: string): Promise<void> {
    // Verify user owns the badge
    const userBadges = await this.getUserBadges(userId);
    const badge = userBadges.find(b => b.badgeId === badgeId);
    
    if (!badge) {
      throw new Error('Badge not found or not owned by user');
    }

    await this.showcaseManager.addToShowcase(userId, badgeId);
  }

  async removeFromShowcase(userId: string, badgeId: string): Promise<void> {
    await this.showcaseManager.removeFromShowcase(userId, badgeId);
  }

  async getUserShowcase(userId: string): Promise<BadgeShowcase> {
    return this.showcaseManager.getUserShowcase(userId);
  }
}

class BadgeRenderer {
  async renderBadge(badge: BadgeDesign): Promise<RenderedBadgeAssets> {
    const assets: RenderedBadgeAssets = {
      small: await this.renderBadgeSize(badge, 'small'),
      medium: await this.renderBadgeSize(badge, 'medium'),
      large: await this.renderBadgeSize(badge, 'large'),
      vector: await this.renderBadgeVector(badge)
    };

    return assets;
  }

  private async renderBadgeSize(badge: BadgeDesign, size: BadgeSize): Promise<string> {
    const dimensions = this.getSizeDimensions(size);
    
    // Generate badge image using canvas or SVG
    const canvas = this.createCanvas(dimensions.width, dimensions.height);
    const ctx = canvas.getContext('2d');

    // Draw badge background
    this.drawBadgeBackground(ctx, badge, dimensions);
    
    // Draw badge icon
    if (badge.iconUrl) {
      await this.drawBadgeIcon(ctx, badge.iconUrl, dimensions);
    }
    
    // Draw badge border
    this.drawBadgeBorder(ctx, badge, dimensions);
    
    // Add rarity effects
    if (badge.rarity && badge.rarity !== 'common') {
      this.addRarityEffects(ctx, badge.rarity, dimensions);
    }

    return canvas.toDataURL();
  }
}
```

## Integration Points

### Notification System Integration
```typescript
interface AchievementNotificationService {
  notifyProgress(userId: string, progress: ProgressUpdate): Promise<void>;
  notifyUnlock(userId: string, unlock: UnlockedAchievement): Promise<void>;
  notifyMilestone(userId: string, milestone: AchievementMilestone): Promise<void>;
  scheduleProgressReminders(userId: string): Promise<void>;
}

class AchievementNotificationHandler {
  async handleAchievementUnlocked(unlock: UnlockedAchievement): Promise<void> {
    const { userId, achievementName, badge, rarity } = unlock;
    
    // Send immediate unlock notification
    await this.notificationService.send(userId, {
      type: 'achievement_unlocked',
      title: 'Achievement Unlocked!',
      message: `Congratulations! You've earned the "${achievementName}" achievement!`,
      data: {
        achievementId: unlock.achievementId,
        badgeUrl: badge.renderedAssets?.medium,
        rarity,
        rewards: unlock.rewards
      },
      priority: rarity === 'legendary' ? 'high' : 'normal'
    });

    // Share to social feeds if enabled
    if (this.config.enableAutoShare && rarity !== 'common') {
      await this.socialService.shareAchievement(userId, unlock);
    }
  }

  async handleProgressMilestone(userId: string, progress: ProgressUpdate): Promise<void> {
    const percentage = progress.newProgress.progressPercentage;
    
    // Notify on significant progress milestones
    if (percentage >= 50 && progress.previousProgress.progressPercentage < 50) {
      await this.notificationService.send(userId, {
        type: 'achievement_progress',
        title: 'Halfway There!',
        message: `You're 50% of the way to earning a new achievement!`,
        data: { achievementId: progress.achievementId, percentage }
      });
    }
  }
}
```

### Social Features Integration
```typescript
interface AchievementSocialFeatures {
  shareAchievement(userId: string, achievementId: string, platform: string): Promise<ShareResult>;
  getAchievementFeed(userId: string): Promise<AchievementFeedItem[]>;
  compareAchievements(userId1: string, userId2: string): Promise<AchievementComparison>;
  getLeaderboard(achievementId: string): Promise<AchievementLeaderboard>;
}

class AchievementSocialService {
  async shareAchievement(userId: string, achievementId: string, platform: string): Promise<ShareResult> {
    const userAchievement = await this.progressStore.findByUserAndAchievement(userId, achievementId);
    if (!userAchievement || userAchievement.status !== 'unlocked') {
      throw new Error('Achievement not unlocked');
    }

    const achievement = await this.achievementStore.findById(achievementId);
    if (!achievement) {
      throw new Error('Achievement not found');
    }

    // Generate share content
    const shareContent = await this.generateShareContent(userId, achievement, userAchievement);
    
    // Share to platform
    const shareResult = await this.platformService.share(platform, shareContent);
    
    // Update share count
    await this.progressStore.incrementShareCount(userId, achievementId);
    
    // Track analytics
    await this.analyticsService.trackAchievementShare(userId, achievementId, platform);

    return shareResult;
  }

  async getAchievementFeed(userId: string): Promise<AchievementFeedItem[]> {
    // Get user's social connections
    const connections = await this.socialService.getUserConnections(userId);
    
    // Get recent achievement unlocks from connections
    const recentUnlocks = await this.unlockStore.findRecentByUsers(
      connections.map(c => c.userId),
      { days: 7 }
    );

    // Format as feed items
    const feedItems: AchievementFeedItem[] = [];
    
    for (const unlock of recentUnlocks) {
      const user = await this.userService.findById(unlock.userId);
      const achievement = await this.achievementStore.findById(unlock.achievementId);
      
      if (user && achievement) {
        feedItems.push({
          id: unlock.id,
          userId: unlock.userId,
          userName: user.displayName,
          userAvatar: user.avatarUrl,
          achievementName: achievement.name,
          achievementBadge: achievement.badge,
          unlockedAt: unlock.unlockedAt,
          rarity: achievement.rarity
        });
      }
    }

    return feedItems.sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }
}
```

## Security Considerations

### Achievement Integrity Protection
```typescript
interface AchievementSecurityService {
  validateProgress(userId: string, action: UserAction): Promise<SecurityValidation>;
  detectAchievementFraud(userId: string): Promise<FraudDetection>;
  auditAchievementUnlock(unlock: UnlockedAchievement): Promise<AuditResult>;
  preventAchievementGaming(userId: string, achievementId: string): Promise<GamingPrevention>;
}

class AchievementSecurityValidator {
  async validateProgressUpdate(userId: string, action: UserAction): Promise<ValidationResult> {
    const checks: Promise<SecurityCheck>[] = [
      this.checkActionAuthenticity(userId, action),
      this.checkProgressVelocity(userId, action),
      this.checkUserBehaviorPattern(userId, action),
      this.checkActionTimestamp(action),
      this.checkActionSource(action)
    ];

    const results = await Promise.all(checks);
    const failedChecks = results.filter(r => !r.passed);

    if (failedChecks.length > 0) {
      await this.logSecurityEvent(userId, 'achievement_progress_blocked', {
        action,
        failedChecks: failedChecks.map(c => c.reason)
      });

      return {
        valid: false,
        reason: 'Security validation failed',
        details: failedChecks
      };
    }

    return { valid: true };
  }

  private async checkProgressVelocity(userId: string, action: UserAction): Promise<SecurityCheck> {
    const recentActions = await this.getRecentActions(userId, action.type, { minutes: 5 });
    
    if (recentActions.length > this.config.maxActionsPerMinute) {
      return {
        passed: false,
        reason: 'Progress velocity too high',
        severity: 'high'
      };
    }

    return { passed: true };
  }

  private async checkActionAuthenticity(userId: string, action: UserAction): Promise<SecurityCheck> {
    // Verify action came from legitimate user session
    const sessionValid = await this.validateUserSession(userId, action.sessionId);
    if (!sessionValid) {
      return {
        passed: false,
        reason: 'Invalid user session',
        severity: 'high'
      };
    }

    // Check for bot-like behavior
    const behaviorScore = await this.calculateBehaviorScore(userId, action);
    if (behaviorScore < this.config.minBehaviorScore) {
      return {
        passed: false,
        reason: 'Suspicious behavior pattern',
        severity: 'medium'
      };
    }

    return { passed: true };
  }

  async auditAchievementUnlock(unlock: UnlockedAchievement): Promise<void> {
    // Verify unlock legitimacy
    const verification = await this.verifyUnlockLegitimacy(unlock);
    
    if (!verification.legitimate) {
      // Flag for manual review
      await this.flagForReview(unlock.userId, 'suspicious_achievement_unlock', {
        unlock,
        reason: verification.reason,
        evidence: verification.evidence
      });

      // Temporarily revoke achievement
      await this.temporarilyRevokeAchievement(unlock);
    }

    // Log audit trail
    await this.auditLogger.logAchievementUnlock(unlock, verification);
  }
}
```

## Testing Considerations

### Achievement System Testing
```typescript
describe('Achievement System', () => {
  it('should track progress accurately', async () => {
    const userId = 'test-user-123';
    const achievementId = 'test-achievement';
    
    // Create test achievement
    const achievement = await achievementSystem.createAchievement({
      id: achievementId,
      name: 'Test Achievement',
      criteria: {
        type: 'simple',
        conditions: [{ action: 'test_action', count: 5 }]
      }
    });

    // Track progress
    for (let i = 0; i < 3; i++) {
      await achievementSystem.trackProgress(userId, { type: 'test_action' });
    }

    const progress = await achievementSystem.getUserProgress(userId, achievementId);
    expect(progress.currentProgress.count).toBe(3);
    expect(progress.progressPercentage).toBe(60);
  });

  it('should unlock achievements when criteria are met', async () => {
    const userId = 'test-user-456';
    const achievementId = 'unlock-test';
    
    await achievementSystem.createAchievement({
      id: achievementId,
      name: 'Unlock Test',
      criteria: {
        type: 'simple',
        conditions: [{ action: 'unlock_action', count: 1 }]
      }
    });

    const updates = await achievementSystem.trackProgress(userId, { type: 'unlock_action' });
    
    expect(updates).toHaveLength(1);
    
    const progress = await achievementSystem.getUserProgress(userId, achievementId);
    expect(progress.status).toBe('unlocked');
  });

  it('should prevent achievement gaming', async () => {
    const userId = 'test-user-789';
    
    // Attempt rapid progress updates
    const promises = Array(100).fill(null).map(() => 
      achievementSystem.trackProgress(userId, { type: 'rapid_action' })
    );
    
    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled');
    
    // Should be rate limited
    expect(successful.length).toBeLessThan(100);
  });
});
```

## Real-World Considerations

### Scalability
- Use event sourcing for achievement progress tracking
- Implement caching for frequently accessed achievements
- Use batch processing for progress calculations
- Consider read replicas for achievement queries

### Performance Optimization
- Cache achievement definitions and criteria
- Use efficient data structures for progress tracking
- Implement lazy loading for achievement lists
- Optimize badge rendering and caching

### User Experience
- Design meaningful and achievable goals
- Provide clear progress indicators
- Celebrate achievements with engaging animations
- Balance achievement difficulty and frequency

### Business Considerations
- Align achievements with business objectives
- Monitor achievement engagement metrics
- A/B test achievement designs and rewards
- Consider seasonal and event-based achievements