# Search Analytics Template

## Purpose

This template provides comprehensive patterns for implementing search analytics systems that track, analyze, and optimize search performance. It covers query analysis, click-through tracking, conversion attribution, search quality metrics, and continuous optimization workflows.

## Context

Search analytics is essential for understanding user behavior and continuously improving search relevance. Organizations need insights into what users search for, which results they click, and how search impacts conversions. This template addresses the complexity of building comprehensive search analytics systems that provide actionable insights for search optimization.

## Instructions

1. **Setup Analytics Infrastructure**: Configure event tracking and data pipelines
2. **Implement Query Tracking**: Capture search queries, filters, and context
3. **Add Click Tracking**: Track result clicks, positions, and engagement
4. **Configure Conversion Attribution**: Link searches to business outcomes
5. **Build Analytics Dashboards**: Create search performance visualizations
6. **Implement Quality Metrics**: Calculate relevance and satisfaction scores
7. **Add Optimization Workflows**: Enable data-driven search improvements

## Examples

### Example 1: Search Event Tracking
```typescript
interface SearchAnalytics {
  trackSearch(event: SearchEvent): Promise<void>;
  trackClick(event: ClickEvent): Promise<void>;
  trackConversion(event: ConversionEvent): Promise<void>;
  getSearchMetrics(timeRange: TimeRange): Promise<SearchMetrics>;
}

await analytics.trackSearch({
  query: 'wireless headphones',
  userId: 'user-123',
  sessionId: 'session-456',
  resultCount: 150,
  filters: { brand: ['Sony', 'Bose'] },
  responseTime: 45
});
```

### Example 2: Search Performance Dashboard
```typescript
const metrics = await analytics.getSearchMetrics({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  granularity: 'day'
});

// Returns: { totalSearches, uniqueQueries, zeroResultRate, clickThroughRate, ... }
```

### Example 3: Query Analysis
```typescript
const queryAnalysis = await analytics.analyzeQueries({
  timeRange: { days: 30 },
  metrics: ['frequency', 'ctr', 'conversion_rate'],
  groupBy: 'category'
});

// Returns top queries, trending queries, zero-result queries
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| analyticsProvider | Analytics backend provider | string | Yes | N/A |
| trackingEnabled | Enable search tracking | boolean | No | true |
| sampleRate | Event sampling rate (0-1) | number | No | 1.0 |
| retentionDays | Data retention period | number | No | 90 |
| enableClickTracking | Track result clicks | boolean | No | true |
| enableConversionTracking | Track conversions | boolean | No | true |
| anonymizeData | Anonymize user data | boolean | No | false |
| realTimeEnabled | Enable real-time analytics | boolean | No | true |

## Expected Output

This template will produce:
- **Event Tracking System**: Comprehensive search event capture
- **Query Analytics**: Query frequency, trends, and patterns analysis
- **Click-Through Analysis**: Position-based CTR and engagement metrics
- **Conversion Attribution**: Search-to-conversion tracking and analysis
- **Performance Dashboards**: Real-time and historical search metrics
- **Quality Scoring**: Relevance and user satisfaction measurement
- **Optimization Insights**: Actionable recommendations for improvement
- **A/B Testing Framework**: Search experiment tracking and analysis

## Implementation Patterns

### Search Analytics Architecture

```typescript
// Core Analytics Architecture
interface SearchAnalyticsSystem {
  eventCollector: EventCollector;
  eventProcessor: EventProcessor;
  metricsCalculator: MetricsCalculator;
  queryAnalyzer: QueryAnalyzer;
  reportGenerator: ReportGenerator;
  alertManager: AlertManager;
}

interface SearchEvent {
  eventId: string;
  eventType: 'search' | 'click' | 'conversion' | 'refinement';
  timestamp: Date;
  userId?: string;
  sessionId: string;
  deviceType: string;
  query: string;
  filters?: Record<string, any>;
  resultCount: number;
  responseTime: number;
  page: number;
  searchType: 'text' | 'voice' | 'visual';
  experimentId?: string;
  variantId?: string;
}

interface ClickEvent {
  eventId: string;
  searchEventId: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  resultId: string;
  position: number;
  resultType: string;
  dwellTime?: number;
  actionType: 'click' | 'add_to_cart' | 'save' | 'share';
}

interface ConversionEvent {
  eventId: string;
  searchEventId?: string;
  clickEventId?: string;
  timestamp: Date;
  userId?: string;
  sessionId: string;
  conversionType: string;
  value?: number;
  itemIds: string[];
  attributionModel: string;
}

interface SearchMetrics {
  totalSearches: number;
  uniqueSearches: number;
  uniqueUsers: number;
  averageResultCount: number;
  zeroResultRate: number;
  clickThroughRate: number;
  conversionRate: number;
  averageResponseTime: number;
  averageClickPosition: number;
  refinementRate: number;
  searchExitRate: number;
}
```

### Event Collection

```typescript
// Event Collection Implementation
class EventCollector {
  private eventQueue: EventQueue;
  private validator: EventValidator;
  private enricher: EventEnricher;
  private config: CollectorConfig;

  async trackSearch(event: Partial<SearchEvent>): Promise<void> {
    // Validate event
    const validationResult = this.validator.validate(event, 'search');
    if (!validationResult.valid) {
      console.warn('Invalid search event:', validationResult.errors);
      return;
    }

    // Enrich event with additional context
    const enrichedEvent = await this.enricher.enrich({
      ...event,
      eventId: this.generateEventId(),
      eventType: 'search',
      timestamp: new Date()
    });

    // Apply sampling if configured
    if (!this.shouldSample(enrichedEvent)) {
      return;
    }

    // Queue event for processing
    await this.eventQueue.enqueue(enrichedEvent);
  }

  async trackClick(event: Partial<ClickEvent>): Promise<void> {
    const validationResult = this.validator.validate(event, 'click');
    if (!validationResult.valid) {
      return;
    }

    const enrichedEvent = await this.enricher.enrich({
      ...event,
      eventId: this.generateEventId(),
      timestamp: new Date()
    });

    await this.eventQueue.enqueue(enrichedEvent);
  }

  async trackConversion(event: Partial<ConversionEvent>): Promise<void> {
    const validationResult = this.validator.validate(event, 'conversion');
    if (!validationResult.valid) {
      return;
    }

    // Attribute conversion to search
    const attributedEvent = await this.attributeConversion(event);

    await this.eventQueue.enqueue(attributedEvent);
  }

  private async attributeConversion(event: Partial<ConversionEvent>): Promise<ConversionEvent> {
    // Find related search events within attribution window
    const relatedSearches = await this.findRelatedSearches(
      event.sessionId,
      event.userId,
      this.config.attributionWindow
    );

    // Apply attribution model
    const attribution = this.applyAttributionModel(
      relatedSearches,
      event.attributionModel || 'last_click'
    );

    return {
      ...event,
      eventId: this.generateEventId(),
      timestamp: new Date(),
      searchEventId: attribution.searchEventId,
      clickEventId: attribution.clickEventId
    } as ConversionEvent;
  }

  private shouldSample(event: any): boolean {
    if (this.config.sampleRate >= 1) return true;
    return Math.random() < this.config.sampleRate;
  }
}

// Event Enrichment
class EventEnricher {
  async enrich(event: any): Promise<any> {
    return {
      ...event,
      // Add geo information
      geo: await this.getGeoInfo(event.ipAddress),
      // Add device information
      device: this.parseUserAgent(event.userAgent),
      // Add session context
      sessionContext: await this.getSessionContext(event.sessionId),
      // Normalize query
      normalizedQuery: this.normalizeQuery(event.query)
    };
  }

  private normalizeQuery(query: string): string {
    return query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }
}
```

### Metrics Calculation

```typescript
// Metrics Calculation Implementation
class MetricsCalculator {
  private eventStore: EventStore;

  async calculateSearchMetrics(timeRange: TimeRange): Promise<SearchMetrics> {
    const [
      searchStats,
      clickStats,
      conversionStats,
      performanceStats
    ] = await Promise.all([
      this.calculateSearchStats(timeRange),
      this.calculateClickStats(timeRange),
      this.calculateConversionStats(timeRange),
      this.calculatePerformanceStats(timeRange)
    ]);

    return {
      totalSearches: searchStats.total,
      uniqueSearches: searchStats.unique,
      uniqueUsers: searchStats.uniqueUsers,
      averageResultCount: searchStats.avgResults,
      zeroResultRate: searchStats.zeroResultRate,
      clickThroughRate: clickStats.ctr,
      conversionRate: conversionStats.rate,
      averageResponseTime: performanceStats.avgResponseTime,
      averageClickPosition: clickStats.avgPosition,
      refinementRate: searchStats.refinementRate,
      searchExitRate: searchStats.exitRate
    };
  }

  private async calculateSearchStats(timeRange: TimeRange): Promise<SearchStats> {
    const searches = await this.eventStore.query({
      eventType: 'search',
      timeRange
    });

    const uniqueQueries = new Set(searches.map(s => s.normalizedQuery));
    const uniqueUsers = new Set(searches.map(s => s.userId).filter(Boolean));
    const zeroResults = searches.filter(s => s.resultCount === 0);

    // Calculate refinement rate (searches followed by another search)
    const refinements = await this.countRefinements(searches);

    // Calculate exit rate (searches not followed by clicks)
    const exits = await this.countSearchExits(searches);

    return {
      total: searches.length,
      unique: uniqueQueries.size,
      uniqueUsers: uniqueUsers.size,
      avgResults: this.average(searches.map(s => s.resultCount)),
      zeroResultRate: zeroResults.length / searches.length,
      refinementRate: refinements / searches.length,
      exitRate: exits / searches.length
    };
  }

  private async calculateClickStats(timeRange: TimeRange): Promise<ClickStats> {
    const clicks = await this.eventStore.query({
      eventType: 'click',
      timeRange
    });

    const searches = await this.eventStore.query({
      eventType: 'search',
      timeRange
    });

    // Calculate CTR
    const searchesWithClicks = new Set(clicks.map(c => c.searchEventId));
    const ctr = searchesWithClicks.size / searches.length;

    // Calculate average click position
    const avgPosition = this.average(clicks.map(c => c.position));

    // Calculate position-based CTR
    const positionCtr = this.calculatePositionCtr(clicks, searches);

    return {
      total: clicks.length,
      ctr,
      avgPosition,
      positionCtr
    };
  }

  private calculatePositionCtr(clicks: ClickEvent[], searches: SearchEvent[]): PositionCtr[] {
    const positionClicks = new Map<number, number>();
    const positionImpressions = new Map<number, number>();

    // Count clicks per position
    for (const click of clicks) {
      const current = positionClicks.get(click.position) || 0;
      positionClicks.set(click.position, current + 1);
    }

    // Estimate impressions per position
    for (const search of searches) {
      const maxPosition = Math.min(search.resultCount, 20); // Assume 20 results per page
      for (let i = 1; i <= maxPosition; i++) {
        const current = positionImpressions.get(i) || 0;
        positionImpressions.set(i, current + 1);
      }
    }

    // Calculate CTR per position
    const result: PositionCtr[] = [];
    for (let position = 1; position <= 20; position++) {
      const clicks = positionClicks.get(position) || 0;
      const impressions = positionImpressions.get(position) || 0;
      result.push({
        position,
        clicks,
        impressions,
        ctr: impressions > 0 ? clicks / impressions : 0
      });
    }

    return result;
  }

  async calculateConversionStats(timeRange: TimeRange): Promise<ConversionStats> {
    const conversions = await this.eventStore.query({
      eventType: 'conversion',
      timeRange
    });

    const searches = await this.eventStore.query({
      eventType: 'search',
      timeRange
    });

    // Conversions attributed to search
    const searchConversions = conversions.filter(c => c.searchEventId);
    const conversionRate = searchConversions.length / searches.length;

    // Calculate revenue attribution
    const totalRevenue = searchConversions.reduce((sum, c) => sum + (c.value || 0), 0);

    return {
      total: conversions.length,
      searchAttributed: searchConversions.length,
      rate: conversionRate,
      totalRevenue,
      averageOrderValue: totalRevenue / searchConversions.length
    };
  }
}
```

### Query Analysis

```typescript
// Query Analysis Implementation
class QueryAnalyzer {
  private eventStore: EventStore;
  private nlpService: NLPService;

  async analyzeQueries(options: QueryAnalysisOptions): Promise<QueryAnalysisResult> {
    const queries = await this.getQueriesInTimeRange(options.timeRange);

    const [
      topQueries,
      trendingQueries,
      zeroResultQueries,
      queryCategories,
      queryPatterns
    ] = await Promise.all([
      this.getTopQueries(queries, options.limit || 100),
      this.getTrendingQueries(queries, options.timeRange),
      this.getZeroResultQueries(queries, options.limit || 50),
      this.categorizeQueries(queries),
      this.analyzeQueryPatterns(queries)
    ]);

    return {
      topQueries,
      trendingQueries,
      zeroResultQueries,
      queryCategories,
      queryPatterns,
      summary: this.generateSummary(queries)
    };
  }

  private async getTopQueries(queries: QueryData[], limit: number): Promise<TopQuery[]> {
    // Group by normalized query
    const queryGroups = this.groupByQuery(queries);

    // Calculate metrics for each query
    const queryMetrics: TopQuery[] = [];

    for (const [query, events] of queryGroups.entries()) {
      const clicks = await this.getClicksForSearches(events.map(e => e.eventId));
      const conversions = await this.getConversionsForSearches(events.map(e => e.eventId));

      queryMetrics.push({
        query,
        searchCount: events.length,
        uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
        clickCount: clicks.length,
        ctr: clicks.length / events.length,
        conversionCount: conversions.length,
        conversionRate: conversions.length / events.length,
        avgResultCount: this.average(events.map(e => e.resultCount)),
        avgPosition: clicks.length > 0 ? this.average(clicks.map(c => c.position)) : null
      });
    }

    // Sort by search count and return top N
    return queryMetrics
      .sort((a, b) => b.searchCount - a.searchCount)
      .slice(0, limit);
  }

  private async getTrendingQueries(
    queries: QueryData[],
    timeRange: TimeRange
  ): Promise<TrendingQuery[]> {
    // Split time range into periods
    const periods = this.splitIntoPeriods(timeRange, 7); // Weekly periods

    // Calculate query frequency for each period
    const periodFrequencies = new Map<string, number[]>();

    for (let i = 0; i < periods.length; i++) {
      const periodQueries = queries.filter(q =>
        q.timestamp >= periods[i].start && q.timestamp < periods[i].end
      );

      const queryGroups = this.groupByQuery(periodQueries);

      for (const [query, events] of queryGroups.entries()) {
        if (!periodFrequencies.has(query)) {
          periodFrequencies.set(query, new Array(periods.length).fill(0));
        }
        periodFrequencies.get(query)![i] = events.length;
      }
    }

    // Calculate trend scores
    const trendingQueries: TrendingQuery[] = [];

    for (const [query, frequencies] of periodFrequencies.entries()) {
      const trendScore = this.calculateTrendScore(frequencies);
      const recentFrequency = frequencies[frequencies.length - 1];

      if (trendScore > 0 && recentFrequency > 10) {
        trendingQueries.push({
          query,
          trendScore,
          currentFrequency: recentFrequency,
          previousFrequency: frequencies[frequencies.length - 2] || 0,
          percentChange: this.calculatePercentChange(
            frequencies[frequencies.length - 2] || 0,
            recentFrequency
          )
        });
      }
    }

    return trendingQueries
      .sort((a, b) => b.trendScore - a.trendScore)
      .slice(0, 20);
  }

  private async getZeroResultQueries(
    queries: QueryData[],
    limit: number
  ): Promise<ZeroResultQuery[]> {
    const zeroResultQueries = queries.filter(q => q.resultCount === 0);
    const queryGroups = this.groupByQuery(zeroResultQueries);

    const result: ZeroResultQuery[] = [];

    for (const [query, events] of queryGroups.entries()) {
      // Check if query has synonyms or alternatives
      const suggestions = await this.nlpService.getSuggestions(query);

      result.push({
        query,
        count: events.length,
        uniqueUsers: new Set(events.map(e => e.userId).filter(Boolean)).size,
        lastSearched: new Date(Math.max(...events.map(e => e.timestamp.getTime()))),
        suggestedAlternatives: suggestions,
        potentialCause: await this.analyzePotentialCause(query)
      });
    }

    return result
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  private calculateTrendScore(frequencies: number[]): number {
    if (frequencies.length < 2) return 0;

    // Calculate weighted moving average trend
    let weightedSum = 0;
    let weightSum = 0;

    for (let i = 1; i < frequencies.length; i++) {
      const change = frequencies[i] - frequencies[i - 1];
      const weight = i; // More recent changes have higher weight
      weightedSum += change * weight;
      weightSum += weight;
    }

    return weightedSum / weightSum;
  }
}
```


### Search Quality Scoring

```typescript
// Search Quality Scoring Implementation
class SearchQualityScorer {
  private metricsCalculator: MetricsCalculator;
  private benchmarks: QualityBenchmarks;

  async calculateQualityScore(timeRange: TimeRange): Promise<QualityScore> {
    const metrics = await this.metricsCalculator.calculateSearchMetrics(timeRange);

    // Calculate component scores
    const relevanceScore = this.calculateRelevanceScore(metrics);
    const engagementScore = this.calculateEngagementScore(metrics);
    const performanceScore = this.calculatePerformanceScore(metrics);
    const coverageScore = this.calculateCoverageScore(metrics);

    // Calculate overall score (weighted average)
    const overallScore = (
      relevanceScore * 0.35 +
      engagementScore * 0.30 +
      performanceScore * 0.20 +
      coverageScore * 0.15
    );

    return {
      overall: overallScore,
      components: {
        relevance: relevanceScore,
        engagement: engagementScore,
        performance: performanceScore,
        coverage: coverageScore
      },
      metrics,
      benchmarkComparison: this.compareToBenchmarks(metrics),
      recommendations: await this.generateRecommendations(metrics)
    };
  }

  private calculateRelevanceScore(metrics: SearchMetrics): number {
    // Based on CTR and click position
    const ctrScore = Math.min(metrics.clickThroughRate / this.benchmarks.targetCtr, 1) * 100;
    const positionScore = Math.max(0, 100 - (metrics.averageClickPosition - 1) * 10);

    return (ctrScore * 0.6 + positionScore * 0.4);
  }

  private calculateEngagementScore(metrics: SearchMetrics): number {
    // Based on conversion rate and refinement rate
    const conversionScore = Math.min(metrics.conversionRate / this.benchmarks.targetConversionRate, 1) * 100;
    const refinementPenalty = metrics.refinementRate * 20; // High refinement = poor initial results
    const exitPenalty = metrics.searchExitRate * 30; // High exit rate = poor results

    return Math.max(0, conversionScore - refinementPenalty - exitPenalty);
  }

  private calculatePerformanceScore(metrics: SearchMetrics): number {
    // Based on response time
    const targetResponseTime = this.benchmarks.targetResponseTime;
    const responseTimeScore = Math.max(0, 100 - ((metrics.averageResponseTime - targetResponseTime) / targetResponseTime) * 100);

    return Math.min(100, responseTimeScore);
  }

  private calculateCoverageScore(metrics: SearchMetrics): number {
    // Based on zero result rate
    const zeroResultPenalty = metrics.zeroResultRate * 100;
    return Math.max(0, 100 - zeroResultPenalty);
  }

  private async generateRecommendations(metrics: SearchMetrics): Promise<Recommendation[]> {
    const recommendations: Recommendation[] = [];

    // High zero result rate
    if (metrics.zeroResultRate > 0.1) {
      recommendations.push({
        priority: 'high',
        category: 'coverage',
        title: 'High Zero Result Rate',
        description: `${(metrics.zeroResultRate * 100).toFixed(1)}% of searches return no results`,
        actions: [
          'Review zero-result queries and add synonyms',
          'Expand search to include related content',
          'Implement fuzzy matching for typos'
        ]
      });
    }

    // Low CTR
    if (metrics.clickThroughRate < this.benchmarks.targetCtr * 0.7) {
      recommendations.push({
        priority: 'high',
        category: 'relevance',
        title: 'Low Click-Through Rate',
        description: `CTR of ${(metrics.clickThroughRate * 100).toFixed(1)}% is below target`,
        actions: [
          'Review relevance scoring and field boosting',
          'Analyze top queries with low CTR',
          'Improve result snippets and thumbnails'
        ]
      });
    }

    // High average click position
    if (metrics.averageClickPosition > 5) {
      recommendations.push({
        priority: 'medium',
        category: 'relevance',
        title: 'Users Clicking Deep in Results',
        description: `Average click position is ${metrics.averageClickPosition.toFixed(1)}`,
        actions: [
          'Review ranking algorithm',
          'Analyze queries where users click beyond position 5',
          'Consider boosting popular items'
        ]
      });
    }

    // Slow response time
    if (metrics.averageResponseTime > this.benchmarks.targetResponseTime * 1.5) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        title: 'Slow Search Response Time',
        description: `Average response time is ${metrics.averageResponseTime}ms`,
        actions: [
          'Optimize search queries',
          'Review index configuration',
          'Implement result caching'
        ]
      });
    }

    return recommendations;
  }
}
```

### A/B Testing Framework

```typescript
// Search A/B Testing Implementation
class SearchABTestingFramework {
  private experimentStore: ExperimentStore;
  private analyticsService: SearchAnalyticsService;

  async createExperiment(config: ExperimentConfig): Promise<Experiment> {
    const experiment: Experiment = {
      id: this.generateExperimentId(),
      name: config.name,
      description: config.description,
      status: 'draft',
      variants: config.variants,
      trafficAllocation: config.trafficAllocation,
      targetMetrics: config.targetMetrics,
      minimumSampleSize: config.minimumSampleSize || 1000,
      confidenceLevel: config.confidenceLevel || 0.95,
      createdAt: new Date(),
      startedAt: null,
      endedAt: null
    };

    await this.experimentStore.save(experiment);
    return experiment;
  }

  async startExperiment(experimentId: string): Promise<void> {
    const experiment = await this.experimentStore.findById(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    experiment.status = 'running';
    experiment.startedAt = new Date();

    await this.experimentStore.update(experiment);
  }

  async assignVariant(experimentId: string, userId: string): Promise<string> {
    const experiment = await this.experimentStore.findById(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return 'control';
    }

    // Check if user already assigned
    const existingAssignment = await this.getExistingAssignment(experimentId, userId);
    if (existingAssignment) {
      return existingAssignment;
    }

    // Assign based on traffic allocation
    const variant = this.selectVariant(experiment.variants, experiment.trafficAllocation, userId);

    await this.saveAssignment(experimentId, userId, variant);
    return variant;
  }

  async getExperimentResults(experimentId: string): Promise<ExperimentResults> {
    const experiment = await this.experimentStore.findById(experimentId);
    if (!experiment) throw new Error('Experiment not found');

    const variantResults: VariantResult[] = [];

    for (const variant of experiment.variants) {
      const metrics = await this.calculateVariantMetrics(experimentId, variant.id);
      variantResults.push({
        variantId: variant.id,
        variantName: variant.name,
        sampleSize: metrics.sampleSize,
        metrics: metrics.values
      });
    }

    // Calculate statistical significance
    const controlVariant = variantResults.find(v => v.variantId === 'control');
    const treatmentVariants = variantResults.filter(v => v.variantId !== 'control');

    const significanceResults = treatmentVariants.map(treatment => ({
      variantId: treatment.variantId,
      ...this.calculateSignificance(controlVariant!, treatment, experiment.targetMetrics)
    }));

    return {
      experimentId,
      experimentName: experiment.name,
      status: experiment.status,
      startedAt: experiment.startedAt,
      duration: experiment.startedAt
        ? Date.now() - experiment.startedAt.getTime()
        : 0,
      variants: variantResults,
      significance: significanceResults,
      recommendation: this.generateRecommendation(significanceResults, experiment)
    };
  }

  private calculateSignificance(
    control: VariantResult,
    treatment: VariantResult,
    targetMetrics: string[]
  ): SignificanceResult {
    const results: MetricSignificance[] = [];

    for (const metric of targetMetrics) {
      const controlValue = control.metrics[metric];
      const treatmentValue = treatment.metrics[metric];

      // Calculate z-score for proportion metrics (CTR, conversion rate)
      const pooledProportion = (controlValue * control.sampleSize + treatmentValue * treatment.sampleSize) /
        (control.sampleSize + treatment.sampleSize);

      const standardError = Math.sqrt(
        pooledProportion * (1 - pooledProportion) *
        (1 / control.sampleSize + 1 / treatment.sampleSize)
      );

      const zScore = (treatmentValue - controlValue) / standardError;
      const pValue = 2 * (1 - this.normalCDF(Math.abs(zScore)));

      const lift = ((treatmentValue - controlValue) / controlValue) * 100;

      results.push({
        metric,
        controlValue,
        treatmentValue,
        lift,
        zScore,
        pValue,
        isSignificant: pValue < 0.05,
        confidenceInterval: this.calculateConfidenceInterval(
          treatmentValue - controlValue,
          standardError
        )
      });
    }

    return {
      metrics: results,
      overallSignificant: results.every(r => r.isSignificant),
      winner: results.every(r => r.lift > 0 && r.isSignificant) ? treatment.variantId : null
    };
  }
}
```

## Configuration

### Search Analytics Configuration

```yaml
# search-analytics-config.yml
search_analytics:
  tracking:
    enabled: true
    sample_rate: 1.0
    events:
      - search
      - click
      - conversion
      - refinement
    
  storage:
    provider: elasticsearch
    index_prefix: search_analytics
    retention_days: 90
    
  attribution:
    model: last_click
    window_hours: 24
    
  metrics:
    calculation_interval: hourly
    aggregation_levels:
      - hourly
      - daily
      - weekly
      - monthly
      
  quality:
    benchmarks:
      target_ctr: 0.35
      target_conversion_rate: 0.05
      target_response_time_ms: 200
      max_zero_result_rate: 0.05
      
  alerts:
    enabled: true
    channels:
      - email
      - slack
    thresholds:
      zero_result_rate_increase: 0.02
      ctr_decrease: 0.05
      response_time_increase_ms: 100
      
  ab_testing:
    enabled: true
    default_confidence_level: 0.95
    minimum_sample_size: 1000
```

## Integration Points

### Analytics Providers

```typescript
// Google Analytics Integration
class GoogleAnalyticsIntegration implements AnalyticsProvider {
  async trackSearch(event: SearchEvent): Promise<void> {
    gtag('event', 'search', {
      search_term: event.query,
      search_results: event.resultCount
    });
  }

  async trackClick(event: ClickEvent): Promise<void> {
    gtag('event', 'select_content', {
      content_type: 'search_result',
      item_id: event.resultId,
      index: event.position
    });
  }
}

// Mixpanel Integration
class MixpanelIntegration implements AnalyticsProvider {
  async trackSearch(event: SearchEvent): Promise<void> {
    mixpanel.track('Search', {
      query: event.query,
      result_count: event.resultCount,
      filters: event.filters
    });
  }
}

// Custom Analytics Backend
class CustomAnalyticsBackend implements AnalyticsProvider {
  private apiClient: ApiClient;

  async trackSearch(event: SearchEvent): Promise<void> {
    await this.apiClient.post('/analytics/search', event);
  }
}
```

## Security Considerations

### Data Privacy

```typescript
class AnalyticsPrivacyManager {
  private config: PrivacyConfig;

  anonymizeEvent(event: SearchEvent): SearchEvent {
    const anonymized = { ...event };

    // Remove or hash PII
    if (this.config.anonymizeUserId && anonymized.userId) {
      anonymized.userId = this.hashUserId(anonymized.userId);
    }

    // Truncate IP address
    if (anonymized.ipAddress) {
      anonymized.ipAddress = this.truncateIp(anonymized.ipAddress);
    }

    // Remove sensitive query terms
    if (this.config.filterSensitiveQueries) {
      anonymized.query = this.filterSensitiveTerms(anonymized.query);
    }

    return anonymized;
  }

  private hashUserId(userId: string): string {
    return crypto.createHash('sha256').update(userId + this.config.salt).digest('hex');
  }

  private truncateIp(ip: string): string {
    // Remove last octet for IPv4
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
    return ip;
  }
}
```

## Testing Considerations

### Analytics Testing

```typescript
describe('Search Analytics', () => {
  it('should track search events correctly', async () => {
    const event: SearchEvent = {
      query: 'test query',
      sessionId: 'session-123',
      resultCount: 50,
      responseTime: 100
    };

    await analytics.trackSearch(event);

    const stored = await eventStore.getLatestEvent('search');
    expect(stored.query).toBe('test query');
    expect(stored.resultCount).toBe(50);
  });

  it('should calculate CTR correctly', async () => {
    // Create 100 searches
    for (let i = 0; i < 100; i++) {
      await analytics.trackSearch({ query: 'test', sessionId: `s-${i}`, resultCount: 10 });
    }

    // Create 35 clicks
    for (let i = 0; i < 35; i++) {
      await analytics.trackClick({ searchEventId: `search-${i}`, position: 1 });
    }

    const metrics = await analytics.getSearchMetrics({ days: 1 });
    expect(metrics.clickThroughRate).toBeCloseTo(0.35, 2);
  });

  it('should attribute conversions to searches', async () => {
    const searchEventId = await analytics.trackSearch({
      query: 'laptop',
      sessionId: 'session-123',
      resultCount: 50
    });

    await analytics.trackClick({
      searchEventId,
      resultId: 'product-456',
      position: 2
    });

    await analytics.trackConversion({
      sessionId: 'session-123',
      conversionType: 'purchase',
      value: 999
    });

    const conversion = await eventStore.getLatestEvent('conversion');
    expect(conversion.searchEventId).toBe(searchEventId);
  });
});
```
