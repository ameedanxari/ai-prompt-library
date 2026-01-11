# Search Personalization Template

## Purpose

This template provides comprehensive patterns for implementing personalized search experiences that adapt results based on user behavior, preferences, and context. It covers user profiling, preference learning, personalized ranking, and real-time adaptation.

## Context

Personalized search significantly improves user satisfaction by delivering results tailored to individual preferences and behavior patterns. Modern users expect search systems to understand their interests and provide relevant results without extensive filtering. This template addresses the complexity of building personalization systems that balance relevance, diversity, and privacy.

## Instructions

1. **Setup User Profiling**: Configure user data collection and profile storage
2. **Implement Preference Learning**: Build algorithms to learn user preferences
3. **Configure Personalized Ranking**: Integrate personalization into search ranking
4. **Add Context Awareness**: Incorporate temporal and situational context
5. **Implement Real-Time Adaptation**: Enable dynamic preference updates
6. **Add Privacy Controls**: Implement user consent and data management
7. **Test Personalization Quality**: Validate personalization effectiveness

## Examples

### Example 1: Personalized Search
```typescript
interface PersonalizedSearch {
  search(query: string, userId: string): Promise<PersonalizedSearchResult>;
  getUserProfile(userId: string): Promise<UserProfile>;
  updatePreferences(userId: string, feedback: UserFeedback): Promise<void>;
}

const result = await personalizedSearch.search('laptop', 'user-123');
// Returns results personalized based on user's brand preferences,
// price range history, and category interests
```

### Example 2: User Profile Building
```typescript
const profile = await personalizedSearch.getUserProfile('user-123');
// Returns: {
//   interests: ['technology', 'gaming'],
//   preferredBrands: ['Apple', 'Sony'],
//   priceRange: { min: 500, max: 2000 },
//   recentSearches: [...],
//   clickHistory: [...]
// }
```

### Example 3: Real-Time Preference Update
```typescript
await personalizedSearch.updatePreferences('user-123', {
  type: 'click',
  itemId: 'product-456',
  context: { query: 'laptop', position: 3 }
});
// Immediately updates user profile and future search rankings
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| personalizationEnabled | Enable search personalization | boolean | No | true |
| profileStorageProvider | User profile storage backend | string | Yes | N/A |
| learningRate | Preference learning rate | number | No | 0.1 |
| decayFactor | Historical preference decay | number | No | 0.95 |
| personalizationWeight | Weight of personalization in ranking | number | No | 0.3 |
| minInteractionsForPersonalization | Minimum interactions needed | number | No | 5 |
| enableContextAwareness | Enable contextual personalization | boolean | No | true |
| privacyMode | Privacy protection level | string | No | "standard" |

## Expected Output

This template will produce:
- **User Profile System**: Comprehensive user preference storage and management
- **Preference Learning**: Algorithms for learning from user behavior
- **Personalized Ranking**: Integration of preferences into search scoring
- **Context-Aware Search**: Temporal and situational adaptation
- **Real-Time Updates**: Immediate preference learning from interactions
- **Privacy Controls**: User consent and data management features
- **A/B Testing**: Personalization effectiveness measurement
- **Fallback Strategies**: Handling cold-start and anonymous users

## Implementation Patterns

### Personalization Architecture

```typescript
// Core Personalization Architecture
interface PersonalizationSystem {
  profileManager: UserProfileManager;
  preferenceLearner: PreferenceLearner;
  personalizedRanker: PersonalizedRanker;
  contextAnalyzer: ContextAnalyzer;
  privacyManager: PrivacyManager;
}

interface UserProfile {
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Explicit preferences
  explicitPreferences: ExplicitPreferences;
  
  // Learned preferences
  learnedPreferences: LearnedPreferences;
  
  // Behavioral data
  searchHistory: SearchHistoryEntry[];
  clickHistory: ClickHistoryEntry[];
  purchaseHistory: PurchaseHistoryEntry[];
  
  // Contextual patterns
  contextualPatterns: ContextualPattern[];
  
  // Profile metadata
  profileStrength: number; // 0-1, confidence in profile
  lastActiveAt: Date;
  interactionCount: number;
}

interface ExplicitPreferences {
  preferredCategories: string[];
  preferredBrands: string[];
  priceRange: { min?: number; max?: number };
  excludedCategories: string[];
  excludedBrands: string[];
  language: string;
  location?: string;
}

interface LearnedPreferences {
  categoryAffinities: Map<string, number>; // category -> affinity score
  brandAffinities: Map<string, number>;
  pricePreference: PricePreference;
  qualityPreference: number; // 0-1, preference for quality vs price
  noveltyPreference: number; // 0-1, preference for new vs familiar
  featurePreferences: Map<string, number>; // feature -> preference score
}

interface PricePreference {
  mean: number;
  stdDev: number;
  percentile25: number;
  percentile75: number;
}

interface ContextualPattern {
  context: ContextType;
  preferences: Partial<LearnedPreferences>;
  confidence: number;
}

enum ContextType {
  MORNING = 'morning',
  AFTERNOON = 'afternoon',
  EVENING = 'evening',
  WEEKEND = 'weekend',
  MOBILE = 'mobile',
  DESKTOP = 'desktop'
}
```

### User Profile Manager

```typescript
// User Profile Management Implementation
class UserProfileManager {
  private profileStore: ProfileStore;
  private cacheManager: CacheManager;
  private config: ProfileConfig;

  async getProfile(userId: string): Promise<UserProfile | null> {
    // Check cache first
    const cached = await this.cacheManager.get(`profile:${userId}`);
    if (cached) {
      return cached;
    }

    // Load from store
    const profile = await this.profileStore.findById(userId);
    if (profile) {
      await this.cacheManager.set(`profile:${userId}`, profile, this.config.cacheTtl);
    }

    return profile;
  }

  async createProfile(userId: string): Promise<UserProfile> {
    const profile: UserProfile = {
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      explicitPreferences: this.getDefaultExplicitPreferences(),
      learnedPreferences: this.getDefaultLearnedPreferences(),
      searchHistory: [],
      clickHistory: [],
      purchaseHistory: [],
      contextualPatterns: [],
      profileStrength: 0,
      lastActiveAt: new Date(),
      interactionCount: 0
    };

    await this.profileStore.save(profile);
    return profile;
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      throw new Error('Profile not found');
    }

    const updatedProfile = {
      ...profile,
      ...updates,
      updatedAt: new Date()
    };

    await this.profileStore.update(updatedProfile);
    await this.cacheManager.delete(`profile:${userId}`);

    return updatedProfile;
  }

  async recordInteraction(userId: string, interaction: UserInteraction): Promise<void> {
    const profile = await this.getProfile(userId);
    if (!profile) {
      return;
    }

    switch (interaction.type) {
      case 'search':
        await this.recordSearch(profile, interaction as SearchInteraction);
        break;
      case 'click':
        await this.recordClick(profile, interaction as ClickInteraction);
        break;
      case 'purchase':
        await this.recordPurchase(profile, interaction as PurchaseInteraction);
        break;
    }

    // Update profile strength
    profile.interactionCount++;
    profile.profileStrength = this.calculateProfileStrength(profile);
    profile.lastActiveAt = new Date();

    await this.updateProfile(userId, profile);
  }

  private async recordSearch(profile: UserProfile, interaction: SearchInteraction): Promise<void> {
    // Add to search history (keep last N searches)
    profile.searchHistory.unshift({
      query: interaction.query,
      timestamp: new Date(),
      resultCount: interaction.resultCount,
      filters: interaction.filters
    });

    if (profile.searchHistory.length > this.config.maxSearchHistory) {
      profile.searchHistory = profile.searchHistory.slice(0, this.config.maxSearchHistory);
    }
  }

  private async recordClick(profile: UserProfile, interaction: ClickInteraction): Promise<void> {
    // Add to click history
    profile.clickHistory.unshift({
      itemId: interaction.itemId,
      timestamp: new Date(),
      query: interaction.query,
      position: interaction.position,
      itemMetadata: interaction.itemMetadata
    });

    if (profile.clickHistory.length > this.config.maxClickHistory) {
      profile.clickHistory = profile.clickHistory.slice(0, this.config.maxClickHistory);
    }
  }

  private calculateProfileStrength(profile: UserProfile): number {
    const factors = [
      Math.min(profile.interactionCount / 100, 1) * 0.3,
      Math.min(profile.searchHistory.length / 50, 1) * 0.2,
      Math.min(profile.clickHistory.length / 100, 1) * 0.3,
      Math.min(profile.purchaseHistory.length / 10, 1) * 0.2
    ];

    return factors.reduce((sum, f) => sum + f, 0);
  }
}
```

### Preference Learning

```typescript
// Preference Learning Implementation
class PreferenceLearner {
  private config: LearningConfig;

  async learnFromInteraction(
    profile: UserProfile,
    interaction: UserInteraction
  ): Promise<LearnedPreferences> {
    const currentPreferences = profile.learnedPreferences;
    let updatedPreferences = { ...currentPreferences };

    switch (interaction.type) {
      case 'click':
        updatedPreferences = await this.learnFromClick(
          currentPreferences,
          interaction as ClickInteraction
        );
        break;
      case 'purchase':
        updatedPreferences = await this.learnFromPurchase(
          currentPreferences,
          interaction as PurchaseInteraction
        );
        break;
      case 'dwell':
        updatedPreferences = await this.learnFromDwell(
          currentPreferences,
          interaction as DwellInteraction
        );
        break;
    }

    // Apply decay to old preferences
    updatedPreferences = this.applyDecay(updatedPreferences);

    return updatedPreferences;
  }

  private async learnFromClick(
    preferences: LearnedPreferences,
    interaction: ClickInteraction
  ): Promise<LearnedPreferences> {
    const updated = { ...preferences };
    const item = interaction.itemMetadata;
    const learningRate = this.config.learningRate;

    // Update category affinity
    if (item.category) {
      const currentAffinity = updated.categoryAffinities.get(item.category) || 0;
      const newAffinity = currentAffinity + learningRate * (1 - currentAffinity);
      updated.categoryAffinities.set(item.category, newAffinity);
    }

    // Update brand affinity
    if (item.brand) {
      const currentAffinity = updated.brandAffinities.get(item.brand) || 0;
      const newAffinity = currentAffinity + learningRate * (1 - currentAffinity);
      updated.brandAffinities.set(item.brand, newAffinity);
    }

    // Update price preference
    if (item.price) {
      updated.pricePreference = this.updatePricePreference(
        updated.pricePreference,
        item.price,
        learningRate
      );
    }

    // Update feature preferences
    if (item.features) {
      for (const [feature, value] of Object.entries(item.features)) {
        const currentPref = updated.featurePreferences.get(feature) || 0;
        const newPref = currentPref + learningRate * (value - currentPref);
        updated.featurePreferences.set(feature, newPref);
      }
    }

    return updated;
  }

  private async learnFromPurchase(
    preferences: LearnedPreferences,
    interaction: PurchaseInteraction
  ): Promise<LearnedPreferences> {
    // Purchases have higher learning weight than clicks
    const purchaseLearningRate = this.config.learningRate * 3;

    const updated = { ...preferences };
    const item = interaction.itemMetadata;

    // Strong update for purchased item's attributes
    if (item.category) {
      const currentAffinity = updated.categoryAffinities.get(item.category) || 0;
      const newAffinity = currentAffinity + purchaseLearningRate * (1 - currentAffinity);
      updated.categoryAffinities.set(item.category, Math.min(newAffinity, 1));
    }

    if (item.brand) {
      const currentAffinity = updated.brandAffinities.get(item.brand) || 0;
      const newAffinity = currentAffinity + purchaseLearningRate * (1 - currentAffinity);
      updated.brandAffinities.set(item.brand, Math.min(newAffinity, 1));
    }

    return updated;
  }

  private updatePricePreference(
    current: PricePreference,
    newPrice: number,
    learningRate: number
  ): PricePreference {
    // Exponential moving average for price preference
    const newMean = current.mean + learningRate * (newPrice - current.mean);
    const newVariance = (1 - learningRate) * Math.pow(current.stdDev, 2) +
      learningRate * Math.pow(newPrice - newMean, 2);

    return {
      mean: newMean,
      stdDev: Math.sqrt(newVariance),
      percentile25: current.percentile25 + learningRate * (newPrice * 0.75 - current.percentile25),
      percentile75: current.percentile75 + learningRate * (newPrice * 1.25 - current.percentile75)
    };
  }

  private applyDecay(preferences: LearnedPreferences): LearnedPreferences {
    const decayFactor = this.config.decayFactor;
    const updated = { ...preferences };

    // Decay category affinities
    for (const [category, affinity] of updated.categoryAffinities.entries()) {
      updated.categoryAffinities.set(category, affinity * decayFactor);
    }

    // Decay brand affinities
    for (const [brand, affinity] of updated.brandAffinities.entries()) {
      updated.brandAffinities.set(brand, affinity * decayFactor);
    }

    // Remove very low affinities
    const threshold = 0.01;
    for (const [key, value] of updated.categoryAffinities.entries()) {
      if (value < threshold) updated.categoryAffinities.delete(key);
    }
    for (const [key, value] of updated.brandAffinities.entries()) {
      if (value < threshold) updated.brandAffinities.delete(key);
    }

    return updated;
  }
}
```

### Personalized Ranking

```typescript
// Personalized Ranking Implementation
class PersonalizedRanker {
  private config: RankingConfig;

  async rankResults(
    results: SearchResult[],
    profile: UserProfile | null,
    context: SearchContext
  ): Promise<SearchResult[]> {
    if (!profile || profile.profileStrength < this.config.minProfileStrength) {
      // Return results with default ranking for cold-start users
      return results;
    }

    // Calculate personalization scores
    const scoredResults = results.map(result => ({
      result,
      baseScore: result.score,
      personalizationScore: this.calculatePersonalizationScore(result, profile, context),
      contextScore: this.calculateContextScore(result, context)
    }));

    // Combine scores
    const rankedResults = scoredResults.map(sr => ({
      ...sr.result,
      score: this.combineScores(sr.baseScore, sr.personalizationScore, sr.contextScore)
    }));

    // Sort by combined score
    rankedResults.sort((a, b) => b.score - a.score);

    // Apply diversity constraints
    return this.applyDiversity(rankedResults, profile);
  }

  private calculatePersonalizationScore(
    result: SearchResult,
    profile: UserProfile,
    context: SearchContext
  ): number {
    let score = 0;
    const preferences = profile.learnedPreferences;

    // Category affinity
    if (result.category) {
      const categoryAffinity = preferences.categoryAffinities.get(result.category) || 0;
      score += categoryAffinity * this.config.categoryWeight;
    }

    // Brand affinity
    if (result.brand) {
      const brandAffinity = preferences.brandAffinities.get(result.brand) || 0;
      score += brandAffinity * this.config.brandWeight;
    }

    // Price preference match
    if (result.price && preferences.pricePreference) {
      const priceScore = this.calculatePriceScore(result.price, preferences.pricePreference);
      score += priceScore * this.config.priceWeight;
    }

    // Feature preference match
    if (result.features) {
      const featureScore = this.calculateFeatureScore(result.features, preferences.featurePreferences);
      score += featureScore * this.config.featureWeight;
    }

    // Historical interaction boost
    const interactionBoost = this.calculateInteractionBoost(result, profile);
    score += interactionBoost * this.config.interactionWeight;

    return score;
  }

  private calculatePriceScore(price: number, preference: PricePreference): number {
    // Gaussian score based on price preference
    const zScore = (price - preference.mean) / preference.stdDev;
    return Math.exp(-0.5 * Math.pow(zScore, 2));
  }

  private calculateFeatureScore(
    features: Record<string, number>,
    preferences: Map<string, number>
  ): number {
    let totalScore = 0;
    let count = 0;

    for (const [feature, value] of Object.entries(features)) {
      const preference = preferences.get(feature);
      if (preference !== undefined) {
        // Score based on how well feature matches preference
        totalScore += 1 - Math.abs(value - preference);
        count++;
      }
    }

    return count > 0 ? totalScore / count : 0;
  }

  private calculateInteractionBoost(result: SearchResult, profile: UserProfile): number {
    let boost = 0;

    // Check if user has clicked on this item before
    const previousClick = profile.clickHistory.find(c => c.itemId === result.id);
    if (previousClick) {
      // Boost items user has shown interest in, but not too much
      boost += 0.1;
    }

    // Check if user has purchased similar items
    const similarPurchase = profile.purchaseHistory.find(p =>
      p.itemMetadata.category === result.category ||
      p.itemMetadata.brand === result.brand
    );
    if (similarPurchase) {
      boost += 0.15;
    }

    return boost;
  }

  private calculateContextScore(result: SearchResult, context: SearchContext): number {
    let score = 0;

    // Time-based scoring
    if (context.timeOfDay) {
      const timeRelevance = this.getTimeRelevance(result, context.timeOfDay);
      score += timeRelevance * 0.1;
    }

    // Device-based scoring
    if (context.device === 'mobile' && result.mobileOptimized) {
      score += 0.05;
    }

    // Location-based scoring
    if (context.location && result.availableLocations?.includes(context.location)) {
      score += 0.1;
    }

    return score;
  }

  private combineScores(
    baseScore: number,
    personalizationScore: number,
    contextScore: number
  ): number {
    const personalizationWeight = this.config.personalizationWeight;
    const contextWeight = this.config.contextWeight;
    const baseWeight = 1 - personalizationWeight - contextWeight;

    return (
      baseScore * baseWeight +
      personalizationScore * personalizationWeight +
      contextScore * contextWeight
    );
  }

  private applyDiversity(results: SearchResult[], profile: UserProfile): SearchResult[] {
    // Ensure diversity in results to avoid filter bubbles
    const diversityFactor = this.config.diversityFactor;
    const diversified: SearchResult[] = [];
    const seenCategories = new Set<string>();
    const seenBrands = new Set<string>();

    for (const result of results) {
      let diversityPenalty = 0;

      // Penalize over-representation of categories
      if (result.category && seenCategories.has(result.category)) {
        diversityPenalty += 0.1;
      }

      // Penalize over-representation of brands
      if (result.brand && seenBrands.has(result.brand)) {
        diversityPenalty += 0.05;
      }

      // Apply penalty
      result.score = result.score * (1 - diversityPenalty * diversityFactor);

      diversified.push(result);
      if (result.category) seenCategories.add(result.category);
      if (result.brand) seenBrands.add(result.brand);
    }

    // Re-sort after diversity adjustment
    return diversified.sort((a, b) => b.score - a.score);
  }
}
```


### Context Analyzer

```typescript
// Context Analysis Implementation
class ContextAnalyzer {
  async analyzeContext(request: SearchRequest): Promise<SearchContext> {
    const context: SearchContext = {
      timestamp: new Date(),
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: this.getDayOfWeek(),
      device: request.device || 'unknown',
      location: request.location,
      sessionContext: await this.getSessionContext(request.sessionId)
    };

    return context;
  }

  async getSessionContext(sessionId: string): Promise<SessionContext> {
    const sessionEvents = await this.getSessionEvents(sessionId);

    return {
      searchCount: sessionEvents.filter(e => e.type === 'search').length,
      clickCount: sessionEvents.filter(e => e.type === 'click').length,
      recentQueries: sessionEvents
        .filter(e => e.type === 'search')
        .slice(-5)
        .map(e => e.query),
      recentCategories: this.extractRecentCategories(sessionEvents),
      sessionDuration: this.calculateSessionDuration(sessionEvents),
      intent: this.inferSessionIntent(sessionEvents)
    };
  }

  private getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  private inferSessionIntent(events: SessionEvent[]): SessionIntent {
    const searchCount = events.filter(e => e.type === 'search').length;
    const clickCount = events.filter(e => e.type === 'click').length;
    const addToCartCount = events.filter(e => e.type === 'add_to_cart').length;

    if (addToCartCount > 0) {
      return 'purchase_intent';
    }

    if (clickCount / searchCount > 0.5) {
      return 'exploring';
    }

    if (searchCount > 5 && clickCount < 2) {
      return 'researching';
    }

    return 'browsing';
  }
}

interface SearchContext {
  timestamp: Date;
  timeOfDay: TimeOfDay;
  dayOfWeek: string;
  device: string;
  location?: string;
  sessionContext: SessionContext;
}

interface SessionContext {
  searchCount: number;
  clickCount: number;
  recentQueries: string[];
  recentCategories: string[];
  sessionDuration: number;
  intent: SessionIntent;
}

type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';
type SessionIntent = 'browsing' | 'exploring' | 'researching' | 'purchase_intent';
```

### Cold Start Handling

```typescript
// Cold Start Strategy Implementation
class ColdStartHandler {
  private popularityService: PopularityService;
  private segmentationService: SegmentationService;

  async getPersonalizationStrategy(
    userId: string | null,
    profile: UserProfile | null
  ): Promise<PersonalizationStrategy> {
    // Anonymous user
    if (!userId) {
      return {
        type: 'popularity',
        fallback: await this.getPopularityBasedRanking()
      };
    }

    // New user with no profile
    if (!profile) {
      return {
        type: 'segment',
        fallback: await this.getSegmentBasedRanking(userId)
      };
    }

    // User with weak profile
    if (profile.profileStrength < 0.3) {
      return {
        type: 'hybrid',
        personalizationWeight: profile.profileStrength,
        fallback: await this.getSegmentBasedRanking(userId)
      };
    }

    // User with strong profile
    return {
      type: 'full_personalization',
      personalizationWeight: Math.min(profile.profileStrength, 0.7)
    };
  }

  private async getPopularityBasedRanking(): Promise<RankingBoosts> {
    const popularItems = await this.popularityService.getPopularItems();

    return {
      itemBoosts: new Map(popularItems.map(item => [item.id, item.popularityScore]))
    };
  }

  private async getSegmentBasedRanking(userId: string): Promise<RankingBoosts> {
    // Infer user segment from available signals
    const segment = await this.segmentationService.inferSegment(userId);

    // Get segment-specific preferences
    const segmentPreferences = await this.segmentationService.getSegmentPreferences(segment);

    return {
      categoryBoosts: segmentPreferences.categoryAffinities,
      brandBoosts: segmentPreferences.brandAffinities,
      priceRange: segmentPreferences.priceRange
    };
  }
}
```

## Configuration

### Personalization Configuration

```yaml
# personalization-config.yml
personalization:
  enabled: true
  
  profile:
    storage_provider: redis
    cache_ttl_seconds: 300
    max_search_history: 100
    max_click_history: 500
    max_purchase_history: 100
    
  learning:
    learning_rate: 0.1
    decay_factor: 0.95
    decay_interval_hours: 24
    min_interactions_for_personalization: 5
    
  ranking:
    personalization_weight: 0.3
    context_weight: 0.1
    category_weight: 0.25
    brand_weight: 0.2
    price_weight: 0.15
    feature_weight: 0.15
    interaction_weight: 0.1
    
  diversity:
    enabled: true
    diversity_factor: 0.3
    max_same_category: 5
    max_same_brand: 3
    
  cold_start:
    strategy: hybrid
    min_profile_strength: 0.3
    segment_fallback: true
    popularity_fallback: true
    
  privacy:
    mode: standard
    data_retention_days: 365
    anonymization_enabled: false
    consent_required: true
```

## Integration Points

### Profile Storage Providers

```typescript
// Redis Profile Storage
class RedisProfileStorage implements ProfileStorage {
  private client: RedisClient;

  async save(profile: UserProfile): Promise<void> {
    await this.client.set(
      `profile:${profile.userId}`,
      JSON.stringify(profile),
      'EX',
      this.config.ttl
    );
  }

  async findById(userId: string): Promise<UserProfile | null> {
    const data = await this.client.get(`profile:${userId}`);
    return data ? JSON.parse(data) : null;
  }
}

// DynamoDB Profile Storage
class DynamoDBProfileStorage implements ProfileStorage {
  private client: DynamoDBClient;

  async save(profile: UserProfile): Promise<void> {
    await this.client.put({
      TableName: this.tableName,
      Item: this.serializeProfile(profile)
    });
  }
}
```

## Security Considerations

### Privacy Management

```typescript
class PrivacyManager {
  private config: PrivacyConfig;

  async handleConsentUpdate(userId: string, consent: ConsentUpdate): Promise<void> {
    if (!consent.personalizationEnabled) {
      // Delete user profile if consent withdrawn
      await this.deleteUserProfile(userId);
    }

    await this.updateConsentRecord(userId, consent);
  }

  async exportUserData(userId: string): Promise<UserDataExport> {
    const profile = await this.profileManager.getProfile(userId);

    return {
      profile: this.sanitizeForExport(profile),
      searchHistory: profile?.searchHistory || [],
      clickHistory: profile?.clickHistory || [],
      exportedAt: new Date()
    };
  }

  async deleteUserData(userId: string): Promise<void> {
    await this.profileManager.deleteProfile(userId);
    await this.analyticsService.deleteUserData(userId);
  }

  private sanitizeForExport(profile: UserProfile | null): any {
    if (!profile) return null;

    // Remove internal fields
    const { profileStrength, ...exportable } = profile;
    return exportable;
  }
}
```

## Testing Considerations

### Personalization Testing

```typescript
describe('Search Personalization', () => {
  it('should personalize results based on user preferences', async () => {
    // Create user with strong category preference
    const profile = await createTestProfile({
      categoryAffinities: new Map([['electronics', 0.9], ['clothing', 0.1]])
    });

    const results = await personalizedSearch.search('gift', profile.userId);

    // Electronics should rank higher
    const electronicsResults = results.filter(r => r.category === 'electronics');
    const clothingResults = results.filter(r => r.category === 'clothing');

    expect(electronicsResults[0]?.position).toBeLessThan(clothingResults[0]?.position || Infinity);
  });

  it('should handle cold start users gracefully', async () => {
    const newUserId = 'new-user-123';

    const results = await personalizedSearch.search('laptop', newUserId);

    // Should return results (popularity-based)
    expect(results.length).toBeGreaterThan(0);
  });

  it('should learn from user interactions', async () => {
    const userId = 'test-user';
    await personalizedSearch.recordClick(userId, {
      itemId: 'product-1',
      category: 'electronics',
      brand: 'Apple'
    });

    const profile = await personalizedSearch.getUserProfile(userId);

    expect(profile.learnedPreferences.categoryAffinities.get('electronics')).toBeGreaterThan(0);
    expect(profile.learnedPreferences.brandAffinities.get('Apple')).toBeGreaterThan(0);
  });

  it('should apply diversity constraints', async () => {
    const profile = await createTestProfile({
      categoryAffinities: new Map([['electronics', 0.9]])
    });

    const results = await personalizedSearch.search('gift', profile.userId);

    // Should not have all results from same category
    const categories = new Set(results.slice(0, 10).map(r => r.category));
    expect(categories.size).toBeGreaterThan(1);
  });

  it('should respect privacy settings', async () => {
    const userId = 'privacy-user';

    // Withdraw consent
    await privacyManager.handleConsentUpdate(userId, {
      personalizationEnabled: false
    });

    // Profile should be deleted
    const profile = await personalizedSearch.getUserProfile(userId);
    expect(profile).toBeNull();
  });
});
```
