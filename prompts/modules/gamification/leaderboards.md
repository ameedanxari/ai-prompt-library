# Leaderboards Template

## Purpose

This template provides comprehensive patterns for implementing leaderboard and ranking systems that create competitive environments, drive user engagement through social comparison, and motivate continued participation. It covers ranking algorithms, leaderboard types, seasonal competitions, and social features to foster healthy competition and community engagement.

## Context

Leaderboards are powerful engagement tools that leverage social comparison and competitive instincts to drive user behavior. A well-designed leaderboard system creates fair competition, recognizes top performers, and provides motivation for users at all skill levels. This template addresses the complexity of building scalable ranking systems that support various competition formats, handle ties and edge cases, and maintain engagement through dynamic and seasonal competitions.

## Instructions

1. **Setup Leaderboard Infrastructure**: Configure ranking systems, scoring mechanisms, and data structures
2. **Implement Ranking Algorithms**: Build comprehensive scoring and ranking calculation systems
3. **Add Leaderboard Types**: Enable global, local, friend-based, and category-specific leaderboards
4. **Configure Seasonal Competitions**: Implement time-based competitions and resets
5. **Enable Social Features**: Add following, challenges, and social comparison features
6. **Add Real-time Updates**: Build live leaderboard updates and notifications
7. **Test Ranking Accuracy**: Validate scoring calculations and ranking consistency

## Examples

### Example 1: Leaderboard System Service
```typescript
interface LeaderboardSystemService {
  createLeaderboard(config: LeaderboardConfig): Promise<Leaderboard>;
  updateScore(userId: string, leaderboardId: string, score: number): Promise<RankingUpdate>;
  getRankings(leaderboardId: string, options: RankingOptions): Promise<LeaderboardRankings>;
  getUserRank(userId: string, leaderboardId: string): Promise<UserRanking>;
  getLeaderboardsForUser(userId: string): Promise<UserLeaderboards>;
}

const leaderboardSystem = new LeaderboardSystemService();
const update = await leaderboardSystem.updateScore('user-123', 'weekly-points', 1500);
// Returns: { previousRank: 15, newRank: 8, rankChange: 7, percentile: 92 }
```

### Example 2: Leaderboard Configuration
```typescript
interface LeaderboardConfig {
  id: string;
  name: string;
  description: string;
  type: 'global' | 'local' | 'friends' | 'category' | 'custom';
  scoringType: 'cumulative' | 'highest' | 'average' | 'recent';
  resetPeriod?: 'daily' | 'weekly' | 'monthly' | 'seasonal' | 'never';
  maxParticipants?: number;
  eligibilityRules?: EligibilityRule[];
}

const weeklyLeaderboard: LeaderboardConfig = {
  id: 'weekly-challenge',
  name: 'Weekly Challenge',
  description: 'Compete with players worldwide in weekly challenges',
  type: 'global',
  scoringType: 'cumulative',
  resetPeriod: 'weekly',
  maxParticipants: 10000,
  eligibilityRules: [
    { type: 'min_level', value: 5 },
    { type: 'account_age', value: '7d' }
  ]
};
```

### Example 3: Ranking Algorithm
```typescript
interface RankingAlgorithm {
  calculateRank(scores: ScoreEntry[], userId: string): Promise<RankCalculation>;
  handleTies(tiedEntries: ScoreEntry[]): Promise<TieResolution>;
  updateRankings(leaderboardId: string, scoreUpdate: ScoreUpdate): Promise<RankingUpdate[]>;
  recalculateLeaderboard(leaderboardId: string): Promise<LeaderboardRecalculation>;
}

const rankingAlgorithm = new StandardRankingAlgorithm();
const rank = await rankingAlgorithm.calculateRank(allScores, 'user-123');
// Returns detailed ranking information including percentile and tier
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableLeaderboards | Enable leaderboard system | boolean | No | true |
| enableRealTimeUpdates | Enable real-time ranking updates | boolean | No | true |
| enableSeasonalCompetitions | Enable seasonal leaderboard resets | boolean | No | true |
| maxLeaderboardSize | Maximum entries per leaderboard | number | No | 1000 |
| enableFriendsLeaderboards | Enable friend-based leaderboards | boolean | No | true |
| enableLocalLeaderboards | Enable location-based leaderboards | boolean | No | false |
| defaultRankingAlgorithm | Default ranking calculation method | string | No | 'standard' |
| enableTieBreaking | Enable tie-breaking mechanisms | boolean | No | true |

## Expected Output

This template will produce:
- **Leaderboard Management System**: Comprehensive leaderboard creation and configuration
- **Ranking Engine**: Real-time ranking calculation and updates
- **Multiple Leaderboard Types**: Global, local, friends, and category-specific rankings
- **Seasonal Competition System**: Time-based competitions with automatic resets
- **Social Comparison Features**: Friend rankings, challenges, and social interactions
- **Real-time Updates**: Live leaderboard updates and notifications
- **Analytics Dashboard**: Leaderboard engagement and competition metrics
- **Admin Tools**: Leaderboard management and moderation interfaces

## Implementation Patterns

### Leaderboard System Architecture

```typescript
// Core Leaderboard System Architecture
interface LeaderboardSystemCore {
  leaderboardManager: LeaderboardManager;
  rankingEngine: RankingEngine;
  scoreTracker: ScoreTracker;
  seasonManager: SeasonManager;
  socialFeatures: LeaderboardSocialFeatures;
  realTimeUpdater: RealTimeLeaderboardUpdater;
}

interface Leaderboard {
  id: string;
  name: string;
  description: string;
  
  // Configuration
  type: LeaderboardType;
  scoringType: ScoringType;
  rankingAlgorithm: RankingAlgorithm;
  
  // Timing and resets
  resetPeriod?: ResetPeriod;
  seasonStart?: Date;
  seasonEnd?: Date;
  nextReset?: Date;
  
  // Participation rules
  maxParticipants?: number;
  eligibilityRules: EligibilityRule[];
  
  // Scoring configuration
  scoreConfig: ScoreConfiguration;
  
  // Social features
  allowChallenges: boolean;
  enableSocialSharing: boolean;
  
  // Status and metadata
  isActive: boolean;
  participantCount: number;
  createdAt: Date;
  updatedAt: Date;
  
  // Current season info
  currentSeason?: SeasonInfo;
}

interface LeaderboardEntry {
  userId: string;
  leaderboardId: string;
  
  // Scoring
  score: number;
  previousScore: number;
  scoreHistory: ScoreHistoryEntry[];
  
  // Ranking
  rank: number;
  previousRank: number;
  percentile: number;
  tier?: string;
  
  // Timing
  lastUpdated: Date;
  firstEntry: Date;
  
  // Metadata
  displayName: string;
  avatarUrl?: string;
  
  // Social features
  isFollowed?: boolean;
  isFriend?: boolean;
  
  // Achievements
  badges: LeaderboardBadge[];
  streaks: RankingStreak[];
}

interface ScoreUpdate {
  userId: string;
  leaderboardId: string;
  scoreChange: number;
  newScore: number;
  
  // Context
  source: string;
  reason: string;
  metadata: Record<string, any>;
  
  // Timing
  timestamp: Date;
  
  // Validation
  isValidated: boolean;
  validationSource?: string;
}
```

**Leaderboard Manager Implementation**
```typescript
class LeaderboardManager {
  private leaderboardStore: LeaderboardStore;
  private entryStore: LeaderboardEntryStore;
  private eligibilityChecker: EligibilityChecker;
  private seasonManager: SeasonManager;

  async createLeaderboard(config: LeaderboardConfig): Promise<Leaderboard> {
    // Validate configuration
    const validation = await this.validateConfig(config);
    if (!validation.valid) {
      throw new Error(`Invalid leaderboard config: ${validation.errors.join(', ')}`);
    }

    // Create leaderboard
    const leaderboard: Leaderboard = {
      id: config.id || this.generateLeaderboardId(),
      name: config.name,
      description: config.description,
      type: config.type,
      scoringType: config.scoringType,
      rankingAlgorithm: config.rankingAlgorithm || 'standard',
      resetPeriod: config.resetPeriod,
      maxParticipants: config.maxParticipants,
      eligibilityRules: config.eligibilityRules || [],
      scoreConfig: config.scoreConfig,
      allowChallenges: config.allowChallenges !== false,
      enableSocialSharing: config.enableSocialSharing !== false,
      isActive: true,
      participantCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Set up seasonal information if applicable
    if (leaderboard.resetPeriod && leaderboard.resetPeriod !== 'never') {
      const seasonInfo = await this.seasonManager.createSeason(leaderboard);
      leaderboard.currentSeason = seasonInfo;
      leaderboard.seasonStart = seasonInfo.startDate;
      leaderboard.seasonEnd = seasonInfo.endDate;
      leaderboard.nextReset = seasonInfo.endDate;
    }

    await this.leaderboardStore.save(leaderboard);

    // Initialize leaderboard data structures
    await this.initializeLeaderboardStorage(leaderboard);

    return leaderboard;
  }

  async joinLeaderboard(userId: string, leaderboardId: string): Promise<LeaderboardEntry> {
    const leaderboard = await this.leaderboardStore.findById(leaderboardId);
    if (!leaderboard) {
      throw new Error('Leaderboard not found');
    }

    // Check eligibility
    const eligibilityCheck = await this.eligibilityChecker.checkEligibility(userId, leaderboard);
    if (!eligibilityCheck.eligible) {
      throw new Error(`Not eligible to join leaderboard: ${eligibilityCheck.reason}`);
    }

    // Check if already joined
    const existingEntry = await this.entryStore.findByUserAndLeaderboard(userId, leaderboardId);
    if (existingEntry) {
      return existingEntry;
    }

    // Check participant limit
    if (leaderboard.maxParticipants && leaderboard.participantCount >= leaderboard.maxParticipants) {
      throw new Error('Leaderboard is full');
    }

    // Get user info
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Create entry
    const entry: LeaderboardEntry = {
      userId,
      leaderboardId,
      score: 0,
      previousScore: 0,
      scoreHistory: [],
      rank: leaderboard.participantCount + 1,
      previousRank: 0,
      percentile: 0,
      lastUpdated: new Date(),
      firstEntry: new Date(),
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      badges: [],
      streaks: []
    };

    await this.entryStore.save(entry);

    // Update leaderboard participant count
    await this.leaderboardStore.incrementParticipantCount(leaderboardId);

    return entry;
  }

  async getLeaderboardRankings(
    leaderboardId: string, 
    options: RankingOptions = {}
  ): Promise<LeaderboardRankings> {
    const leaderboard = await this.leaderboardStore.findById(leaderboardId);
    if (!leaderboard) {
      throw new Error('Leaderboard not found');
    }

    const {
      limit = 100,
      offset = 0,
      includeUser,
      rankRange,
      scoreRange
    } = options;

    // Get entries based on options
    let entries: LeaderboardEntry[];
    
    if (rankRange) {
      entries = await this.entryStore.findByRankRange(leaderboardId, rankRange.min, rankRange.max);
    } else if (scoreRange) {
      entries = await this.entryStore.findByScoreRange(leaderboardId, scoreRange.min, scoreRange.max);
    } else {
      entries = await this.entryStore.findTopEntries(leaderboardId, limit, offset);
    }

    // Include specific user if requested
    if (includeUser && !entries.find(e => e.userId === includeUser)) {
      const userEntry = await this.entryStore.findByUserAndLeaderboard(includeUser, leaderboardId);
      if (userEntry) {
        entries.push(userEntry);
      }
    }

    // Enrich entries with social data if needed
    if (includeUser) {
      entries = await this.enrichWithSocialData(entries, includeUser);
    }

    return {
      leaderboardId,
      leaderboardName: leaderboard.name,
      entries,
      totalParticipants: leaderboard.participantCount,
      seasonInfo: leaderboard.currentSeason,
      lastUpdated: new Date()
    };
  }

  private async enrichWithSocialData(entries: LeaderboardEntry[], viewerUserId: string): Promise<LeaderboardEntry[]> {
    const friendIds = await this.socialService.getFriendIds(viewerUserId);
    const followingIds = await this.socialService.getFollowingIds(viewerUserId);

    return entries.map(entry => ({
      ...entry,
      isFriend: friendIds.includes(entry.userId),
      isFollowed: followingIds.includes(entry.userId)
    }));
  }
}
```

### Ranking Engine Implementation

```typescript
class RankingEngine {
  private entryStore: LeaderboardEntryStore;
  private rankingCalculator: RankingCalculator;
  private tieBreaker: TieBreaker;
  private realTimeUpdater: RealTimeLeaderboardUpdater;

  async updateScore(
    userId: string, 
    leaderboardId: string, 
    scoreUpdate: ScoreUpdate
  ): Promise<RankingUpdate> {
    const leaderboard = await this.leaderboardStore.findById(leaderboardId);
    if (!leaderboard) {
      throw new Error('Leaderboard not found');
    }

    const entry = await this.entryStore.findByUserAndLeaderboard(userId, leaderboardId);
    if (!entry) {
      throw new Error('User not in leaderboard');
    }

    // Calculate new score based on scoring type
    const newScore = this.calculateNewScore(entry.score, scoreUpdate, leaderboard.scoringType);
    
    // Store previous values
    const previousScore = entry.score;
    const previousRank = entry.rank;

    // Update score
    entry.previousScore = previousScore;
    entry.score = newScore;
    entry.lastUpdated = new Date();
    
    // Add to score history
    entry.scoreHistory.push({
      score: newScore,
      change: scoreUpdate.scoreChange,
      timestamp: new Date(),
      source: scoreUpdate.source,
      reason: scoreUpdate.reason
    });

    // Keep history limited
    if (entry.scoreHistory.length > this.config.maxScoreHistoryEntries) {
      entry.scoreHistory = entry.scoreHistory.slice(-this.config.maxScoreHistoryEntries);
    }

    // Recalculate rankings
    const rankingUpdate = await this.recalculateRankings(leaderboardId, userId);
    
    // Update entry with new rank
    entry.previousRank = previousRank;
    entry.rank = rankingUpdate.newRank;
    entry.percentile = rankingUpdate.percentile;
    entry.tier = this.calculateTier(rankingUpdate.percentile);

    await this.entryStore.save(entry);

    // Create ranking update result
    const result: RankingUpdate = {
      userId,
      leaderboardId,
      previousScore,
      newScore,
      scoreChange: scoreUpdate.scoreChange,
      previousRank,
      newRank: entry.rank,
      rankChange: previousRank - entry.rank,
      percentile: entry.percentile,
      tier: entry.tier,
      affectedUsers: rankingUpdate.affectedUsers,
      timestamp: new Date()
    };

    // Send real-time updates
    await this.realTimeUpdater.broadcastRankingUpdate(result);

    // Check for achievements or milestones
    await this.checkRankingAchievements(userId, result);

    return result;
  }

  private calculateNewScore(
    currentScore: number, 
    scoreUpdate: ScoreUpdate, 
    scoringType: ScoringType
  ): number {
    switch (scoringType) {
      case 'cumulative':
        return currentScore + scoreUpdate.scoreChange;
      case 'highest':
        return Math.max(currentScore, scoreUpdate.newScore);
      case 'average':
        // This would require tracking number of submissions
        return this.calculateAverageScore(currentScore, scoreUpdate);
      case 'recent':
        return scoreUpdate.newScore;
      default:
        return currentScore + scoreUpdate.scoreChange;
    }
  }

  private async recalculateRankings(leaderboardId: string, updatedUserId?: string): Promise<RankingRecalculation> {
    // Get all entries for the leaderboard
    const entries = await this.entryStore.findAllByLeaderboard(leaderboardId);
    
    // Sort by score (descending) and apply tie-breaking
    const sortedEntries = await this.sortEntriesWithTieBreaking(entries);
    
    // Calculate new ranks
    const affectedUsers: string[] = [];
    
    for (let i = 0; i < sortedEntries.length; i++) {
      const entry = sortedEntries[i];
      const newRank = i + 1;
      const newPercentile = ((sortedEntries.length - i) / sortedEntries.length) * 100;
      
      if (entry.rank !== newRank) {
        affectedUsers.push(entry.userId);
        entry.rank = newRank;
        entry.percentile = newPercentile;
        
        await this.entryStore.updateRanking(entry.userId, leaderboardId, {
          rank: newRank,
          percentile: newPercentile
        });
      }
    }

    return {
      leaderboardId,
      totalEntries: sortedEntries.length,
      affectedUsers,
      updatedUserId,
      recalculatedAt: new Date()
    };
  }

  private async sortEntriesWithTieBreaking(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    // Primary sort by score (descending)
    entries.sort((a, b) => b.score - a.score);
    
    // Handle ties
    const tieGroups = this.groupTiedEntries(entries);
    
    for (const group of tieGroups) {
      if (group.length > 1) {
        const resolvedGroup = await this.tieBreaker.resolveTies(group);
        // Replace the tied entries with resolved order
        const startIndex = entries.findIndex(e => e.userId === group[0].userId);
        entries.splice(startIndex, group.length, ...resolvedGroup);
      }
    }

    return entries;
  }

  private groupTiedEntries(entries: LeaderboardEntry[]): LeaderboardEntry[][] {
    const groups: LeaderboardEntry[][] = [];
    let currentGroup: LeaderboardEntry[] = [];
    let currentScore: number | null = null;

    for (const entry of entries) {
      if (currentScore === null || entry.score === currentScore) {
        currentGroup.push(entry);
        currentScore = entry.score;
      } else {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [entry];
        currentScore = entry.score;
      }
    }

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups;
  }

  private calculateTier(percentile: number): string {
    if (percentile >= 99) return 'legendary';
    if (percentile >= 95) return 'diamond';
    if (percentile >= 85) return 'platinum';
    if (percentile >= 70) return 'gold';
    if (percentile >= 50) return 'silver';
    return 'bronze';
  }
}
```

### Tie Breaking System

```typescript
class TieBreaker {
  private userService: UserService;
  private entryStore: LeaderboardEntryStore;

  async resolveTies(tiedEntries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    if (tiedEntries.length <= 1) {
      return tiedEntries;
    }

    // Apply multiple tie-breaking criteria in order
    const tieBreakingCriteria = [
      this.breakTieByTimestamp,
      this.breakTieByScoreHistory,
      this.breakTieByAccountAge,
      this.breakTieByUserId // Final fallback for consistency
    ];

    let sortedEntries = [...tiedEntries];

    for (const criterion of tieBreakingCriteria) {
      sortedEntries = await criterion.call(this, sortedEntries);
      
      // Check if ties are fully resolved
      if (this.areAllTiesResolved(sortedEntries)) {
        break;
      }
    }

    return sortedEntries;
  }

  private async breakTieByTimestamp(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    // Earlier achievement of the score wins
    return entries.sort((a, b) => {
      const aLatestScore = this.getLatestScoreTimestamp(a);
      const bLatestScore = this.getLatestScoreTimestamp(b);
      return aLatestScore.getTime() - bLatestScore.getTime();
    });
  }

  private async breakTieByScoreHistory(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    // User with more consistent performance wins
    return entries.sort((a, b) => {
      const aConsistency = this.calculateScoreConsistency(a.scoreHistory);
      const bConsistency = this.calculateScoreConsistency(b.scoreHistory);
      return bConsistency - aConsistency; // Higher consistency wins
    });
  }

  private async breakTieByAccountAge(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    // Get user account creation dates
    const userAges = new Map<string, Date>();
    
    for (const entry of entries) {
      const user = await this.userService.findById(entry.userId);
      if (user) {
        userAges.set(entry.userId, user.createdAt);
      }
    }

    // Older accounts win ties (loyalty bonus)
    return entries.sort((a, b) => {
      const aAge = userAges.get(a.userId)?.getTime() || Date.now();
      const bAge = userAges.get(b.userId)?.getTime() || Date.now();
      return aAge - bAge;
    });
  }

  private async breakTieByUserId(entries: LeaderboardEntry[]): Promise<LeaderboardEntry[]> {
    // Final deterministic tie breaker
    return entries.sort((a, b) => a.userId.localeCompare(b.userId));
  }

  private getLatestScoreTimestamp(entry: LeaderboardEntry): Date {
    if (entry.scoreHistory.length === 0) {
      return entry.firstEntry;
    }
    
    // Find when the current score was first achieved
    const currentScore = entry.score;
    const scoreAchievement = entry.scoreHistory
      .reverse()
      .find(h => h.score >= currentScore);
    
    return scoreAchievement?.timestamp || entry.lastUpdated;
  }

  private calculateScoreConsistency(scoreHistory: ScoreHistoryEntry[]): number {
    if (scoreHistory.length < 2) return 0;
    
    const scores = scoreHistory.map(h => h.score);
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    
    // Lower variance = higher consistency
    return 1 / (1 + variance);
  }

  private areAllTiesResolved(entries: LeaderboardEntry[]): boolean {
    // Check if any entries still have the same score
    const scores = entries.map(e => e.score);
    const uniqueScores = new Set(scores);
    return uniqueScores.size === scores.length;
  }
}
```

### Season Management System

```typescript
class SeasonManager {
  private seasonStore: SeasonStore;
  private leaderboardStore: LeaderboardStore;
  private entryStore: LeaderboardEntryStore;
  private rewardProcessor: SeasonRewardProcessor;

  async createSeason(leaderboard: Leaderboard): Promise<SeasonInfo> {
    const now = new Date();
    const seasonDuration = this.getSeasonDuration(leaderboard.resetPeriod!);
    
    const season: SeasonInfo = {
      id: this.generateSeasonId(),
      leaderboardId: leaderboard.id,
      seasonNumber: await this.getNextSeasonNumber(leaderboard.id),
      startDate: now,
      endDate: new Date(now.getTime() + seasonDuration),
      status: 'active',
      participantCount: 0,
      totalScores: 0,
      topScore: 0,
      createdAt: now
    };

    await this.seasonStore.save(season);
    return season;
  }

  async endSeason(seasonId: string): Promise<SeasonEndResult> {
    const season = await this.seasonStore.findById(seasonId);
    if (!season) {
      throw new Error('Season not found');
    }

    // Get final rankings
    const finalRankings = await this.entryStore.findAllByLeaderboard(season.leaderboardId);
    finalRankings.sort((a, b) => a.rank - b.rank);

    // Process season rewards
    const rewards = await this.rewardProcessor.processSeasonRewards(season, finalRankings);

    // Archive season data
    const archivedSeason = await this.archiveSeason(season, finalRankings);

    // Reset leaderboard for new season
    await this.resetLeaderboard(season.leaderboardId);

    // Create new season
    const leaderboard = await this.leaderboardStore.findById(season.leaderboardId);
    if (leaderboard && leaderboard.resetPeriod !== 'never') {
      const newSeason = await this.createSeason(leaderboard);
      await this.leaderboardStore.updateCurrentSeason(leaderboard.id, newSeason);
    }

    return {
      endedSeason: archivedSeason,
      finalRankings: finalRankings.slice(0, 100), // Top 100
      rewards,
      newSeasonId: leaderboard?.currentSeason?.id
    };
  }

  private async resetLeaderboard(leaderboardId: string): Promise<void> {
    // Reset all scores to 0 but keep participants
    await this.entryStore.resetScores(leaderboardId);
    
    // Recalculate rankings (everyone starts at rank 1 with 0 score)
    const entries = await this.entryStore.findAllByLeaderboard(leaderboardId);
    
    for (let i = 0; i < entries.length; i++) {
      await this.entryStore.updateRanking(entries[i].userId, leaderboardId, {
        rank: i + 1,
        percentile: 0
      });
    }
  }

  async scheduleSeasonEnd(seasonId: string): Promise<void> {
    const season = await this.seasonStore.findById(seasonId);
    if (!season) return;

    // Schedule season end job
    await this.schedulerService.schedule({
      jobType: 'end_season',
      scheduledFor: season.endDate,
      data: { seasonId },
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 60000 // 1 minute
      }
    });

    // Schedule warning notifications
    const warningTimes = [
      new Date(season.endDate.getTime() - 24 * 60 * 60 * 1000), // 24 hours
      new Date(season.endDate.getTime() - 60 * 60 * 1000), // 1 hour
      new Date(season.endDate.getTime() - 5 * 60 * 1000) // 5 minutes
    ];

    for (const warningTime of warningTimes) {
      if (warningTime > new Date()) {
        await this.schedulerService.schedule({
          jobType: 'season_ending_warning',
          scheduledFor: warningTime,
          data: { seasonId, warningTime: warningTime.toISOString() }
        });
      }
    }
  }

  private getSeasonDuration(resetPeriod: ResetPeriod): number {
    switch (resetPeriod) {
      case 'daily':
        return 24 * 60 * 60 * 1000; // 24 hours
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000; // 7 days
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000; // 30 days
      case 'seasonal':
        return 90 * 24 * 60 * 60 * 1000; // 90 days
      default:
        return 7 * 24 * 60 * 60 * 1000; // Default to weekly
    }
  }
}
```

## Integration Points

### Real-time Updates Integration
```typescript
interface RealTimeLeaderboardUpdater {
  broadcastRankingUpdate(update: RankingUpdate): Promise<void>;
  subscribeToLeaderboard(userId: string, leaderboardId: string): Promise<void>;
  unsubscribeFromLeaderboard(userId: string, leaderboardId: string): Promise<void>;
  sendPersonalRankingUpdate(userId: string, update: RankingUpdate): Promise<void>;
}

class WebSocketLeaderboardUpdater {
  private websocketService: WebSocketService;
  private subscriptionManager: SubscriptionManager;

  async broadcastRankingUpdate(update: RankingUpdate): Promise<void> {
    // Get all subscribers to this leaderboard
    const subscribers = await this.subscriptionManager.getSubscribers(update.leaderboardId);
    
    // Prepare update message
    const message = {
      type: 'leaderboard_update',
      leaderboardId: update.leaderboardId,
      data: {
        userId: update.userId,
        newRank: update.newRank,
        previousRank: update.previousRank,
        newScore: update.newScore,
        rankChange: update.rankChange
      },
      timestamp: update.timestamp
    };

    // Broadcast to all subscribers
    await this.websocketService.broadcast(subscribers, message);

    // Send personalized updates to affected users
    for (const affectedUserId of update.affectedUsers) {
      await this.sendPersonalizedUpdate(affectedUserId, update);
    }
  }

  private async sendPersonalizedUpdate(userId: string, update: RankingUpdate): Promise<void> {
    const userEntry = await this.entryStore.findByUserAndLeaderboard(userId, update.leaderboardId);
    if (!userEntry) return;

    const personalizedMessage = {
      type: 'personal_ranking_update',
      leaderboardId: update.leaderboardId,
      data: {
        yourRank: userEntry.rank,
        yourScore: userEntry.score,
        percentile: userEntry.percentile,
        tier: userEntry.tier,
        rankChange: userEntry.rank - userEntry.previousRank
      },
      timestamp: new Date()
    };

    await this.websocketService.sendToUser(userId, personalizedMessage);
  }
}
```

### Social Features Integration
```typescript
interface LeaderboardSocialFeatures {
  challengeFriend(challengerId: string, challengedId: string, leaderboardId: string): Promise<Challenge>;
  getFriendsRankings(userId: string, leaderboardId: string): Promise<FriendsRankings>;
  shareRanking(userId: string, leaderboardId: string, platform: string): Promise<ShareResult>;
  followUser(followerId: string, followedId: string): Promise<void>;
}

class LeaderboardSocialService {
  async challengeFriend(
    challengerId: string, 
    challengedId: string, 
    leaderboardId: string,
    challengeType: ChallengeType = 'score_race'
  ): Promise<Challenge> {
    // Validate friendship
    const areFriends = await this.socialService.areFriends(challengerId, challengedId);
    if (!areFriends) {
      throw new Error('Can only challenge friends');
    }

    // Check if both users are in the leaderboard
    const challengerEntry = await this.entryStore.findByUserAndLeaderboard(challengerId, leaderboardId);
    const challengedEntry = await this.entryStore.findByUserAndLeaderboard(challengedId, leaderboardId);
    
    if (!challengerEntry || !challengedEntry) {
      throw new Error('Both users must be in the leaderboard');
    }

    // Create challenge
    const challenge: Challenge = {
      id: this.generateChallengeId(),
      challengerId,
      challengedId,
      leaderboardId,
      type: challengeType,
      status: 'pending',
      startScore: {
        challenger: challengerEntry.score,
        challenged: challengedEntry.score
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    await this.challengeStore.save(challenge);

    // Notify challenged user
    await this.notificationService.send(challengedId, {
      type: 'leaderboard_challenge',
      title: 'Friend Challenge!',
      message: `${challengerEntry.displayName} has challenged you to a leaderboard competition!`,
      data: { challengeId: challenge.id, leaderboardId }
    });

    return challenge;
  }

  async getFriendsRankings(userId: string, leaderboardId: string): Promise<FriendsRankings> {
    const friendIds = await this.socialService.getFriendIds(userId);
    const friendEntries = await this.entryStore.findByUsersAndLeaderboard(friendIds, leaderboardId);
    
    // Add user's own entry
    const userEntry = await this.entryStore.findByUserAndLeaderboard(userId, leaderboardId);
    if (userEntry) {
      friendEntries.push(userEntry);
    }

    // Sort by rank
    friendEntries.sort((a, b) => a.rank - b.rank);

    return {
      leaderboardId,
      entries: friendEntries,
      userRank: userEntry?.rank || null,
      totalFriends: friendIds.length
    };
  }
}
```

## Security Considerations

### Leaderboard Integrity Protection
```typescript
interface LeaderboardSecurityService {
  validateScoreUpdate(update: ScoreUpdate): Promise<ValidationResult>;
  detectRankingManipulation(userId: string, leaderboardId: string): Promise<ManipulationDetection>;
  auditLeaderboardChanges(leaderboardId: string): Promise<AuditReport>;
  preventScoreInflation(userId: string, scoreHistory: ScoreHistoryEntry[]): Promise<InflationCheck>;
}

class LeaderboardSecurityValidator {
  async validateScoreUpdate(update: ScoreUpdate): Promise<ValidationResult> {
    const checks: Promise<SecurityCheck>[] = [
      this.checkScoreRealism(update),
      this.checkUpdateFrequency(update),
      this.checkScoreProgression(update),
      this.checkSourceAuthenticity(update),
      this.checkUserBehavior(update)
    ];

    const results = await Promise.all(checks);
    const failedChecks = results.filter(r => !r.passed);

    if (failedChecks.length > 0) {
      await this.logSecurityEvent(update.userId, 'score_update_blocked', {
        update,
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

  private async checkScoreRealism(update: ScoreUpdate): Promise<SecurityCheck> {
    // Check if score change is realistic based on game mechanics
    const maxPossibleScore = await this.getMaxPossibleScore(update.source, update.metadata);
    
    if (update.scoreChange > maxPossibleScore) {
      return {
        passed: false,
        reason: 'Score change exceeds maximum possible',
        severity: 'high'
      };
    }

    return { passed: true };
  }

  private async checkUpdateFrequency(update: ScoreUpdate): Promise<SecurityCheck> {
    const recentUpdates = await this.getRecentScoreUpdates(
      update.userId, 
      update.leaderboardId, 
      { minutes: 5 }
    );

    if (recentUpdates.length > this.config.maxUpdatesPerMinute) {
      return {
        passed: false,
        reason: 'Too many score updates in short time',
        severity: 'medium'
      };
    }

    return { passed: true };
  }

  async detectRankingManipulation(userId: string, leaderboardId: string): Promise<ManipulationDetection> {
    const entry = await this.entryStore.findByUserAndLeaderboard(userId, leaderboardId);
    if (!entry) {
      return { detected: false };
    }

    const suspiciousPatterns: SuspiciousPattern[] = [];

    // Check for sudden rank jumps
    const rankHistory = await this.getRankHistory(userId, leaderboardId);
    const suddenJumps = this.detectSuddenRankJumps(rankHistory);
    if (suddenJumps.length > 0) {
      suspiciousPatterns.push({
        type: 'sudden_rank_jump',
        severity: 'medium',
        evidence: suddenJumps
      });
    }

    // Check for unnatural score patterns
    const scorePattern = this.analyzeScorePattern(entry.scoreHistory);
    if (scorePattern.suspicious) {
      suspiciousPatterns.push({
        type: 'unnatural_score_pattern',
        severity: 'high',
        evidence: scorePattern.evidence
      });
    }

    return {
      detected: suspiciousPatterns.length > 0,
      patterns: suspiciousPatterns,
      riskScore: this.calculateRiskScore(suspiciousPatterns)
    };
  }
}
```

## Testing Considerations

### Leaderboard System Testing
```typescript
describe('Leaderboard System', () => {
  it('should calculate rankings correctly', async () => {
    const leaderboardId = 'test-leaderboard';
    const users = ['user1', 'user2', 'user3'];
    const scores = [100, 200, 150];

    // Add scores for users
    for (let i = 0; i < users.length; i++) {
      await leaderboardSystem.updateScore(users[i], leaderboardId, {
        scoreChange: scores[i],
        newScore: scores[i],
        source: 'test'
      });
    }

    const rankings = await leaderboardSystem.getRankings(leaderboardId);
    
    expect(rankings.entries[0].userId).toBe('user2'); // Highest score
    expect(rankings.entries[0].rank).toBe(1);
    expect(rankings.entries[1].userId).toBe('user3'); // Second highest
    expect(rankings.entries[1].rank).toBe(2);
    expect(rankings.entries[2].userId).toBe('user1'); // Lowest score
    expect(rankings.entries[2].rank).toBe(3);
  });

  it('should handle ties correctly', async () => {
    const leaderboardId = 'tie-test';
    const users = ['user1', 'user2'];
    
    // Both users get same score
    await leaderboardSystem.updateScore('user1', leaderboardId, { scoreChange: 100, newScore: 100, source: 'test' });
    await leaderboardSystem.updateScore('user2', leaderboardId, { scoreChange: 100, newScore: 100, source: 'test' });

    const rankings = await leaderboardSystem.getRankings(leaderboardId);
    
    // Both should have same score but different ranks based on tie-breaking
    expect(rankings.entries[0].score).toBe(100);
    expect(rankings.entries[1].score).toBe(100);
    expect(rankings.entries[0].rank).toBe(1);
    expect(rankings.entries[1].rank).toBe(2);
  });

  it('should reset seasonal leaderboards correctly', async () => {
    const leaderboard = await leaderboardSystem.createLeaderboard({
      name: 'Weekly Test',
      type: 'global',
      scoringType: 'cumulative',
      resetPeriod: 'weekly'
    });

    // Add some scores
    await leaderboardSystem.updateScore('user1', leaderboard.id, { scoreChange: 100, newScore: 100, source: 'test' });
    
    // Manually trigger season end
    await seasonManager.endSeason(leaderboard.currentSeason!.id);
    
    // Check that scores are reset
    const userEntry = await leaderboardSystem.getUserRank('user1', leaderboard.id);
    expect(userEntry.score).toBe(0);
  });
});
```

## Real-World Considerations

### Scalability
- Use Redis sorted sets for real-time leaderboard operations
- Implement caching layers for frequently accessed rankings
- Use database sharding for large-scale leaderboards
- Consider eventual consistency for non-critical ranking updates

### Performance Optimization
- Cache top rankings and user-specific ranks
- Use batch processing for bulk ranking updates
- Implement efficient pagination for large leaderboards
- Optimize database queries with proper indexing

### User Experience
- Provide smooth rank transitions with animations
- Show meaningful progress indicators
- Balance competition with collaboration
- Design inclusive leaderboards for different skill levels

### Business Considerations
- Monitor engagement metrics and leaderboard participation
- A/B test different leaderboard formats and reset periods
- Consider regional and demographic leaderboard variations
- Implement fair play policies and moderation tools