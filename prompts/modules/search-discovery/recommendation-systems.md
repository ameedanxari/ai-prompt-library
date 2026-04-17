# Recommendation Systems Template

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

This template provides comprehensive patterns for implementing recommendation systems using collaborative filtering, content-based filtering, and hybrid approaches. It covers user preference modeling, item similarity computation, real-time personalization, and recommendation quality optimization.

## Context

Recommendation systems are essential for content discovery, helping users find relevant items among vast catalogs. Modern recommendation engines combine multiple algorithms including collaborative filtering (user-based and item-based), content-based filtering, and deep learning approaches. This template addresses the complexity of building scalable recommendation systems that balance relevance, diversity, and serendipity while adapting to user preferences in real-time.

## Instructions

1. **Setup Recommendation Infrastructure**: Configure ML models and data pipelines
2. **Implement Collaborative Filtering**: Build user-based and item-based algorithms
3. **Add Content-Based Filtering**: Implement feature-based similarity matching
4. **Configure Hybrid Engine**: Combine multiple recommendation approaches
5. **Enable Real-Time Personalization**: Implement dynamic context-aware recommendations
6. **Add Model Training**: Set up continuous learning workflows
7. **Monitor Quality**: Track recommendation accuracy and user engagement

## Examples

### Example 1: Recommendation Engine Setup
```typescript
interface RecommendationEngine {
  getPersonalizedRecommendations(userId: string, count: number): Promise<Recommendation[]>;
  getSimilarItems(itemId: string, count: number): Promise<SimilarItem[]>;
  getTrendingItems(category?: string): Promise<TrendingItem[]>;
}

const recommendations = await engine.getPersonalizedRecommendations('user-123', 20);
```

### Example 2: Hybrid Recommendation Strategy
```typescript
const hybridRecs = await engine.getHybridRecommendations({
  userId: 'user-123',
  algorithms: [
    { type: 'collaborative', weight: 0.4 },
    { type: 'content_based', weight: 0.3 },
    { type: 'trending', weight: 0.3 }
  ],
  diversityFactor: 0.2
});
```

### Example 3: Context-Aware Recommendations
```typescript
const contextualRecs = await engine.getContextualRecommendations({
  userId: 'user-123',
  context: {
    timeOfDay: 'evening',
    device: 'mobile',
    recentActivity: 'browsing'
  }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| recommendationAlgorithm | Primary recommendation algorithm | string | Yes | N/A |
| enableCollaborativeFiltering | Enable collaborative filtering | boolean | No | true |
| enableContentBasedFiltering | Enable content-based filtering | boolean | No | true |
| enableHybridApproach | Enable hybrid recommendation engine | boolean | No | true |
| diversityFactor | Recommendation diversity factor (0-1) | number | No | 0.2 |
| modelUpdateFrequency | Model training frequency | string | No | "daily" |
| minInteractionsForRecommendation | Minimum user interactions needed | number | No | 5 |

## Expected Output

This template will produce:
- **Personalized Recommendation Engine**: AI-powered item discovery system
- **Multi-Algorithm Approach**: Collaborative, content-based, and hybrid filtering
- **Real-Time Personalization**: Dynamic recommendations based on context
- **Similarity Matching**: Item similarity and related item recommendations
- **Model Training Pipeline**: Continuous learning and improvement workflows
- **A/B Testing Framework**: Recommendation algorithm testing
- **Analytics Dashboard**: Recommendation performance metrics

## Implementation Patterns

### Recommendation System Architecture

```typescript
// Core Recommendation System Architecture
interface RecommendationSystem {
  collaborativeFilter: CollaborativeFilteringEngine;
  contentBasedFilter: ContentBasedFilteringEngine;
  hybridEngine: HybridRecommendationEngine;
  realTimeEngine: RealTimeRecommendationEngine;
  modelTrainer: ModelTrainingService;
  evaluationService: RecommendationEvaluationService;
}

interface RecommendationRequest {
  userId: string;
  context: RecommendationContext;
  count: number;
  filters?: RecommendationFilters;
  excludeItems?: string[];
  diversityWeight?: number;
  noveltyWeight?: number;
}

interface RecommendationContext {
  type: 'homepage' | 'similar_items' | 'discovery' | 'category_based';
  currentItem?: string;
  category?: string;
  timeOfDay?: string;
  device?: string;
}

interface RecommendationResult {
  items: RecommendedItem[];
  explanations: RecommendationExplanation[];
  confidence: number;
  diversity: number;
  novelty: number;
  algorithm: string;
  generatedAt: Date;
}

interface RecommendedItem {
  itemId: string;
  itemType: string;
  score: number;
  rank: number;
  reasons: RecommendationReason[];
  metadata: ItemMetadata;
}

interface RecommendationReason {
  type: 'similar_users' | 'similar_content' | 'popular' | 'trending' | 'category_match';
  weight: number;
  explanation: string;
}
```

### Collaborative Filtering Engine

```typescript
// Collaborative Filtering Implementation
class CollaborativeFilteringEngine {
  private userItemMatrix: UserItemMatrix;
  private similarityCalculator: SimilarityCalculator;
  private neighborhoodSize: number = 50;

  async generateRecommendations(
    userId: string,
    count: number
  ): Promise<RecommendedItem[]> {
    const userHistory = await this.getUserInteractions(userId);

    if (userHistory.length < 5) {
      return await this.getPopularityBasedRecommendations(count);
    }

    const similarUsers = await this.findSimilarUsers(userId);
    return await this.generateFromSimilarUsers(userId, similarUsers, count);
  }

  private async findSimilarUsers(userId: string): Promise<SimilarUser[]> {
    const userVector = await this.getUserVector(userId);
    const allUsers = await this.getAllActiveUsers();

    const similarities: SimilarUser[] = [];

    for (const otherUserId of allUsers) {
      if (otherUserId === userId) continue;

      const otherUserVector = await this.getUserVector(otherUserId);
      const similarity = this.similarityCalculator.calculateCosineSimilarity(
        userVector,
        otherUserVector
      );

      if (similarity > 0.1) {
        similarities.push({
          userId: otherUserId,
          similarity,
          commonItems: this.getCommonItems(userVector, otherUserVector)
        });
      }
    }

    return similarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, this.neighborhoodSize);
  }

  private async generateFromSimilarUsers(
    userId: string,
    similarUsers: SimilarUser[],
    count: number
  ): Promise<RecommendedItem[]> {
    const userHistory = await this.getUserInteractions(userId);
    const userItems = new Set(userHistory.map(h => h.itemId));

    const candidateItems = new Map<string, number>();

    for (const similarUser of similarUsers) {
      const similarUserHistory = await this.getUserInteractions(similarUser.userId);

      for (const interaction of similarUserHistory) {
        if (userItems.has(interaction.itemId)) continue;

        const weight = similarUser.similarity * this.getInteractionWeight(interaction);
        candidateItems.set(
          interaction.itemId,
          (candidateItems.get(interaction.itemId) || 0) + weight
        );
      }
    }

    const recommendations: RecommendedItem[] = [];

    for (const [itemId, score] of candidateItems.entries()) {
      const metadata = await this.getItemMetadata(itemId);

      recommendations.push({
        itemId,
        itemType: metadata.type,
        score: Math.min(score, 1.0),
        rank: 0,
        reasons: [{
          type: 'similar_users',
          weight: 1.0,
          explanation: 'Users with similar taste also liked this'
        }],
        metadata
      });
    }

    recommendations.sort((a, b) => b.score - a.score);
    recommendations.forEach((item, index) => {
      item.rank = index + 1;
    });

    return recommendations.slice(0, count);
  }
}
```

### Content-Based Filtering Engine

```typescript
// Content-Based Filtering Implementation
class ContentBasedFilteringEngine {
  private featureExtractor: FeatureExtractor;
  private vectorStore: VectorStore;

  async generateRecommendations(
    userId: string,
    count: number
  ): Promise<RecommendedItem[]> {
    const userProfile = await this.buildUserProfile(userId);
    const similarContent = await this.findSimilarContent(userProfile, count * 3);
    return await this.rankAndFilter(similarContent, userProfile, count);
  }

  private async buildUserProfile(userId: string): Promise<UserContentProfile> {
    const userHistory = await this.getUserInteractions(userId);

    const likedFeatures: ContentFeatures[] = [];
    const dislikedFeatures: ContentFeatures[] = [];

    for (const interaction of userHistory) {
      const features = await this.featureExtractor.extractFeatures(interaction.itemId);

      if (interaction.rating >= 4 || interaction.engagementScore > 0.7) {
        likedFeatures.push(features);
      } else if (interaction.rating <= 2) {
        dislikedFeatures.push(features);
      }
    }

    return {
      userId,
      preferredCategories: this.aggregateCategoryPreferences(likedFeatures),
      preferredAttributes: this.aggregateAttributePreferences(likedFeatures),
      avoidedFeatures: this.aggregateFeatures(dislikedFeatures),
      updatedAt: new Date()
    };
  }

  private async findSimilarContent(
    userProfile: UserContentProfile,
    count: number
  ): Promise<ContentSimilarity[]> {
    const queryVector = this.createQueryVector(userProfile);
    const similarContent = await this.vectorStore.search(queryVector, count);

    return similarContent.map(result => ({
      itemId: result.id,
      similarity: result.score,
      features: result.metadata.features
    }));
  }
}
```

### Hybrid Recommendation Engine

```typescript
// Hybrid Recommendation Implementation
class HybridRecommendationEngine {
  private collaborativeEngine: CollaborativeFilteringEngine;
  private contentBasedEngine: ContentBasedFilteringEngine;
  private popularityEngine: PopularityBasedEngine;

  async generateRecommendations(
    request: RecommendationRequest
  ): Promise<RecommendationResult> {
    const [collaborativeRecs, contentBasedRecs, popularityRecs] = await Promise.all([
      this.collaborativeEngine.generateRecommendations(request.userId, request.count),
      this.contentBasedEngine.generateRecommendations(request.userId, request.count),
      this.popularityEngine.generateRecommendations(request.count)
    ]);

    const combinedRecs = await this.combineRecommendations({
      collaborative: collaborativeRecs,
      contentBased: contentBasedRecs,
      popularity: popularityRecs
    }, request);

    const finalRecs = await this.applyDiversityAndNovelty(
      combinedRecs,
      request.diversityWeight || 0.3,
      request.noveltyWeight || 0.2
    );

    return {
      items: finalRecs.slice(0, request.count),
      explanations: this.generateExplanations(finalRecs),
      confidence: this.calculateConfidence(finalRecs),
      diversity: this.calculateDiversity(finalRecs),
      novelty: this.calculateNovelty(finalRecs, request.userId),
      algorithm: 'hybrid_ensemble',
      generatedAt: new Date()
    };
  }

  private async combineRecommendations(
    recommendations: {
      collaborative: RecommendedItem[];
      contentBased: RecommendedItem[];
      popularity: RecommendedItem[];
    },
    request: RecommendationRequest
  ): Promise<RecommendedItem[]> {
    const weights = await this.calculateEngineWeights(request);
    const itemScores = new Map<string, CombinedScore>();

    this.processEngineRecommendations(
      recommendations.collaborative,
      'collaborative',
      weights.collaborative,
      itemScores
    );

    this.processEngineRecommendations(
      recommendations.contentBased,
      'contentBased',
      weights.contentBased,
      itemScores
    );

    this.processEngineRecommendations(
      recommendations.popularity,
      'popularity',
      weights.popularity,
      itemScores
    );

    const combinedRecs: RecommendedItem[] = [];

    for (const [itemId, combinedScore] of itemScores.entries()) {
      const metadata = await this.getItemMetadata(itemId);

      combinedRecs.push({
        itemId,
        itemType: metadata.type,
        score: combinedScore.totalScore,
        rank: 0,
        reasons: combinedScore.reasons,
        metadata
      });
    }

    combinedRecs.sort((a, b) => b.score - a.score);
    combinedRecs.forEach((item, index) => {
      item.rank = index + 1;
    });

    return combinedRecs;
  }
}
```

### Real-Time Recommendation Engine

```typescript
// Real-Time Recommendation Implementation
class RealTimeRecommendationEngine {
  private featureStore: FeatureStore;
  private modelCache: ModelCache;

  async generateRealTimeRecommendations(
    userId: string,
    currentContext: RealTimeContext
  ): Promise<RecommendedItem[]> {
    const userState = await this.getCurrentUserState(userId);
    const updatedFeatures = await this.updateUserFeatures(userState, currentContext);
    const predictions = await this.getRealTimePredictions(updatedFeatures);
    return await this.contextualRanking(predictions, currentContext);
  }

  async updateUserPreferencesRealTime(
    userId: string,
    interaction: UserInteraction
  ): Promise<void> {
    const currentProfile = await this.getUserProfile(userId);
    const updatedProfile = await this.incrementalProfileUpdate(currentProfile, interaction);

    await this.featureStore.updateUserFeatures(userId, updatedProfile);
    await this.modelCache.invalidateUserCache(userId);

    if (this.shouldTriggerModelUpdate(interaction)) {
      await this.triggerIncrementalModelUpdate(userId, interaction);
    }
  }

  private async incrementalProfileUpdate(
    profile: UserContentProfile,
    interaction: UserInteraction
  ): Promise<UserContentProfile> {
    const learningRate = 0.1;
    const contentFeatures = await this.getContentFeatures(interaction.itemId);

    switch (interaction.type) {
      case 'like':
      case 'save':
        profile = this.reinforcePreferences(profile, contentFeatures, learningRate);
        break;
      case 'skip':
      case 'dislike':
        profile = this.diminishPreferences(profile, contentFeatures, learningRate);
        break;
    }

    profile.updatedAt = new Date();
    return profile;
  }
}
```

## Configuration

### Recommendation Engine Configuration

```yaml
# recommendation-config.yml
recommendation_engine:
  engines:
    collaborative_filtering:
      enabled: true
      weight: 0.4
      min_interactions: 5
      neighborhood_size: 50
      similarity_threshold: 0.1

    content_based:
      enabled: true
      weight: 0.3
      feature_dimensions: 100
      similarity_algorithm: "cosine"

    popularity_based:
      enabled: true
      weight: 0.2
      time_decay_factor: 0.95
      trending_window_hours: 24

  training:
    batch_size: 1000
    learning_rate: 0.01
    regularization: 0.01
    max_iterations: 100
    validation_split: 0.2

  quality:
    min_confidence_threshold: 0.1
    diversity_weight: 0.3
    novelty_weight: 0.2

  performance:
    cache_ttl_minutes: 5
    max_cache_size_mb: 100
    batch_prediction_size: 100
```

## Integration Points

### Data Pipeline Integration

```typescript
// Data Pipeline Integration
class RecommendationDataPipeline {
  async processUserInteractions(interactions: UserInteraction[]): Promise<void> {
    await this.validateInteractions(interactions);
    await this.updateUserProfiles(interactions);
    await this.updateItemStatistics(interactions);
    await this.triggerModelRetraining();
  }

  async syncItemCatalog(items: Item[]): Promise<void> {
    const features = await this.extractItemFeatures(items);
    await this.updateVectorStore(features);
    await this.updateItemIndex(items);
  }
}

// Analytics Integration
class RecommendationAnalytics {
  async trackRecommendationImpression(
    userId: string,
    recommendations: RecommendedItem[]
  ): Promise<void> {
    await this.logImpression({
      userId,
      recommendations: recommendations.map(r => r.itemId),
      timestamp: new Date(),
      algorithm: recommendations[0]?.algorithm
    });
  }

  async trackRecommendationClick(
    userId: string,
    itemId: string,
    position: number
  ): Promise<void> {
    await this.logClick({ userId, itemId, position, timestamp: new Date() });
    await this.updateClickThroughRate(itemId, position);
  }
}
```

## Security Considerations

### Privacy and Data Protection

```typescript
class RecommendationPrivacyManager {
  async anonymizeUserData(userId: string): Promise<void> {
    await this.removePersonalIdentifiers(userId);
    await this.aggregateUserBehavior(userId);
    await this.applyDifferentialPrivacy(userId);
  }

  async handleDataDeletionRequest(userId: string): Promise<void> {
    await this.deleteUserProfile(userId);
    await this.removeFromTrainingData(userId);
    await this.invalidateUserRecommendations(userId);
  }

  validateRecommendationAccess(userId: string, requesterId: string): boolean {
    return userId === requesterId || this.hasAdminAccess(requesterId);
  }
}
```

## Testing Considerations

### Recommendation System Testing

```typescript
describe('Recommendation System', () => {
  it('should return personalized recommendations', async () => {
    const recommendations = await engine.getPersonalizedRecommendations('user-123', 10);

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].score).toBeGreaterThan(0);
    expect(recommendations[0].reasons.length).toBeGreaterThan(0);
  });

  it('should handle cold start users', async () => {
    const recommendations = await engine.getPersonalizedRecommendations('new-user', 10);

    expect(recommendations.length).toBeGreaterThan(0);
    // Should fall back to popularity-based recommendations
    expect(recommendations[0].reasons[0].type).toBe('popular');
  });

  it('should combine multiple algorithms effectively', async () => {
    const hybridRecs = await engine.getHybridRecommendations({
      userId: 'user-123',
      algorithms: [
        { type: 'collaborative', weight: 0.5 },
        { type: 'content_based', weight: 0.5 }
      ]
    });

    expect(hybridRecs.items.length).toBeGreaterThan(0);
    expect(hybridRecs.diversity).toBeGreaterThan(0);
  });
});
```
