# Content Analytics Template

## Purpose

This template provides comprehensive patterns for implementing content analytics systems, covering performance metrics, engagement tracking, content insights, audience analysis, and reporting for content management platforms.

## Context

Content analytics is essential for understanding content performance, optimizing content strategy, and demonstrating ROI. A well-designed analytics system tracks content consumption, engagement patterns, audience behavior, and provides actionable insights. This template addresses the complexity of building comprehensive analytics that support data-driven content decisions while respecting user privacy.

## Instructions

1. **Setup Analytics Infrastructure**: Configure event tracking and data collection
2. **Implement Performance Metrics**: Build content performance measurement
3. **Add Engagement Tracking**: Enable user engagement and interaction tracking
4. **Configure Audience Analytics**: Implement audience segmentation and analysis
5. **Enable Content Insights**: Add AI-powered content recommendations
6. **Add Reporting Dashboard**: Build analytics dashboards and reports
7. **Test Analytics Accuracy**: Validate tracking accuracy and data integrity

## Examples

### Example 1: Content Analytics Service
```typescript
interface ContentAnalyticsService {
  trackContentView(contentId: string, viewData: ViewData): Promise<void>;
  trackEngagement(contentId: string, engagement: EngagementEvent): Promise<void>;
  getContentMetrics(contentId: string, dateRange: DateRange): Promise<ContentMetrics>;
  getAudienceInsights(contentId: string): Promise<AudienceInsights>;
  generatePerformanceReport(config: ReportConfig): Promise<PerformanceReport>;
}

const analyticsService = new ContentAnalyticsService();
await analyticsService.trackContentView('content-123', {
  userId: 'user-456',
  sessionId: 'session-789',
  source: 'search',
  device: 'mobile'
});
```


### Example 2: Engagement Tracking
```typescript
interface EngagementTracker {
  trackRead(contentId: string, readData: ReadData): Promise<void>;
  trackScroll(contentId: string, scrollDepth: number): Promise<void>;
  trackInteraction(contentId: string, interaction: InteractionEvent): Promise<void>;
  trackShare(contentId: string, shareData: ShareData): Promise<void>;
}

const tracker = new EngagementTracker();
await tracker.trackRead('content-123', {
  userId: 'user-456',
  timeSpent: 180, // seconds
  scrollDepth: 85, // percentage
  completedReading: true
});
```

### Example 3: Performance Dashboard
```typescript
interface AnalyticsDashboard {
  getOverviewMetrics(dateRange: DateRange): Promise<OverviewMetrics>;
  getTopContent(limit: number, sortBy: string): Promise<ContentRanking[]>;
  getTrendingTopics(): Promise<TrendingTopic[]>;
  getAudienceGrowth(dateRange: DateRange): Promise<GrowthMetrics>;
}

const dashboard = new AnalyticsDashboard();
const overview = await dashboard.getOverviewMetrics({ days: 30 });
console.log(overview.totalViews); // 150000
console.log(overview.avgEngagementRate); // 0.45
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableViewTracking | Enable content view tracking | boolean | No | true |
| enableEngagementTracking | Enable engagement metrics | boolean | No | true |
| enableAudienceAnalytics | Enable audience analysis | boolean | No | true |
| enableRealTimeAnalytics | Enable real-time metrics | boolean | No | false |
| dataRetentionDays | Days to retain analytics data | number | No | 365 |
| enablePrivacyMode | Enable privacy-compliant tracking | boolean | No | true |
| sampleRate | Sampling rate for high-volume tracking | number | No | 1.0 |
| enableAIInsights | Enable AI-powered insights | boolean | No | false |

## Expected Output

This template will produce:
- **View Tracking**: Content view and impression tracking
- **Engagement Metrics**: Read time, scroll depth, interactions
- **Audience Analytics**: Demographics, behavior, segmentation
- **Performance Dashboard**: Real-time and historical metrics
- **Content Insights**: AI-powered recommendations and trends
- **Custom Reports**: Configurable analytics reports
- **Export Capabilities**: Data export for external analysis
- **Privacy Compliance**: GDPR-compliant analytics

## Implementation Patterns

### Analytics Data Model

**Event and Metrics Schema**
```typescript
interface AnalyticsEvent {
  id: string;
  eventType: EventType;
  contentId: string;
  userId?: string;
  sessionId: string;
  
  // Event data
  data: Record<string, any>;
  
  // Context
  timestamp: Date;
  source: TrafficSource;
  device: DeviceInfo;
  location?: GeoLocation;
  
  // Attribution
  referrer?: string;
  campaign?: string;
  medium?: string;
}

type EventType = 
  | 'view'
  | 'read'
  | 'scroll'
  | 'click'
  | 'share'
  | 'comment'
  | 'like'
  | 'bookmark'
  | 'download'
  | 'print'
  | 'search'
  | 'conversion';

interface ContentMetrics {
  contentId: string;
  period: DateRange;
  
  // View metrics
  views: number;
  uniqueViews: number;
  impressions: number;
  
  // Engagement metrics
  avgTimeOnPage: number;
  avgScrollDepth: number;
  bounceRate: number;
  exitRate: number;
  
  // Interaction metrics
  likes: number;
  comments: number;
  shares: number;
  bookmarks: number;
  downloads: number;
  
  // Conversion metrics
  conversions: number;
  conversionRate: number;
  
  // Audience metrics
  newVisitors: number;
  returningVisitors: number;
  
  // Performance
  loadTime: number;
  errorRate: number;
}

interface AudienceInsights {
  contentId: string;
  
  // Demographics
  demographics: {
    ageGroups: Record<string, number>;
    genders: Record<string, number>;
    locations: Record<string, number>;
    languages: Record<string, number>;
  };
  
  // Behavior
  behavior: {
    avgSessionDuration: number;
    pagesPerSession: number;
    returnRate: number;
    preferredDevices: Record<string, number>;
    peakHours: number[];
  };
  
  // Interests
  interests: {
    topCategories: string[];
    relatedContent: string[];
    searchTerms: string[];
  };
  
  // Segments
  segments: AudienceSegment[];
}
```

**Analytics Service Implementation**
```typescript
class ContentAnalyticsService {
  async trackContentView(contentId: string, viewData: ViewData): Promise<void> {
    // Validate and sanitize data
    const sanitizedData = this.sanitizeViewData(viewData);
    
    // Check privacy consent
    if (this.config.enablePrivacyMode && !viewData.consentGiven) {
      // Track anonymized data only
      sanitizedData.userId = undefined;
    }
    
    // Create analytics event
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      eventType: 'view',
      contentId,
      userId: sanitizedData.userId,
      sessionId: sanitizedData.sessionId,
      data: {
        source: sanitizedData.source,
        referrer: sanitizedData.referrer,
        entryPoint: sanitizedData.entryPoint
      },
      timestamp: new Date(),
      source: this.parseTrafficSource(sanitizedData),
      device: this.parseDeviceInfo(sanitizedData),
      location: await this.getGeoLocation(sanitizedData.ip)
    };
    
    // Store event
    await this.eventStore.save(event);
    
    // Update real-time metrics
    if (this.config.enableRealTimeAnalytics) {
      await this.realTimeService.incrementViews(contentId);
    }
    
    // Update aggregated metrics
    await this.metricsAggregator.incrementMetric(contentId, 'views');
    
    // Track unique views
    const isUnique = await this.isUniqueView(contentId, sanitizedData);
    if (isUnique) {
      await this.metricsAggregator.incrementMetric(contentId, 'uniqueViews');
    }
  }

  async trackEngagement(contentId: string, engagement: EngagementEvent): Promise<void> {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      eventType: engagement.type,
      contentId,
      userId: engagement.userId,
      sessionId: engagement.sessionId,
      data: engagement.data,
      timestamp: new Date(),
      source: engagement.source,
      device: engagement.device
    };
    
    await this.eventStore.save(event);
    
    // Update engagement metrics
    switch (engagement.type) {
      case 'read':
        await this.updateReadMetrics(contentId, engagement.data);
        break;
      case 'scroll':
        await this.updateScrollMetrics(contentId, engagement.data.scrollDepth);
        break;
      case 'share':
        await this.metricsAggregator.incrementMetric(contentId, 'shares');
        break;
      case 'like':
        await this.metricsAggregator.incrementMetric(contentId, 'likes');
        break;
      case 'comment':
        await this.metricsAggregator.incrementMetric(contentId, 'comments');
        break;
    }
  }

  async getContentMetrics(contentId: string, dateRange: DateRange): Promise<ContentMetrics> {
    // Get aggregated metrics
    const aggregatedMetrics = await this.metricsStore.getMetrics(contentId, dateRange);
    
    // Calculate derived metrics
    const bounceRate = this.calculateBounceRate(aggregatedMetrics);
    const avgTimeOnPage = this.calculateAvgTimeOnPage(aggregatedMetrics);
    const avgScrollDepth = this.calculateAvgScrollDepth(aggregatedMetrics);
    
    return {
      contentId,
      period: dateRange,
      views: aggregatedMetrics.views,
      uniqueViews: aggregatedMetrics.uniqueViews,
      impressions: aggregatedMetrics.impressions,
      avgTimeOnPage,
      avgScrollDepth,
      bounceRate,
      exitRate: aggregatedMetrics.exitRate,
      likes: aggregatedMetrics.likes,
      comments: aggregatedMetrics.comments,
      shares: aggregatedMetrics.shares,
      bookmarks: aggregatedMetrics.bookmarks,
      downloads: aggregatedMetrics.downloads,
      conversions: aggregatedMetrics.conversions,
      conversionRate: aggregatedMetrics.views > 0 
        ? aggregatedMetrics.conversions / aggregatedMetrics.views 
        : 0,
      newVisitors: aggregatedMetrics.newVisitors,
      returningVisitors: aggregatedMetrics.returningVisitors,
      loadTime: aggregatedMetrics.avgLoadTime,
      errorRate: aggregatedMetrics.errorRate
    };
  }

  private async updateReadMetrics(contentId: string, readData: ReadData): Promise<void> {
    // Update time on page
    await this.metricsAggregator.addToAverage(
      contentId,
      'timeOnPage',
      readData.timeSpent
    );
    
    // Track completion
    if (readData.completedReading) {
      await this.metricsAggregator.incrementMetric(contentId, 'completions');
    }
    
    // Update engagement score
    const engagementScore = this.calculateEngagementScore(readData);
    await this.metricsAggregator.addToAverage(
      contentId,
      'engagementScore',
      engagementScore
    );
  }

  private calculateEngagementScore(readData: ReadData): number {
    let score = 0;
    
    // Time spent (max 40 points)
    const timeScore = Math.min(readData.timeSpent / 300, 1) * 40;
    score += timeScore;
    
    // Scroll depth (max 30 points)
    const scrollScore = (readData.scrollDepth / 100) * 30;
    score += scrollScore;
    
    // Completion bonus (20 points)
    if (readData.completedReading) {
      score += 20;
    }
    
    // Interaction bonus (10 points)
    if (readData.interactions > 0) {
      score += Math.min(readData.interactions * 2, 10);
    }
    
    return score;
  }
}
```

### Audience Analytics

**Audience Segmentation and Analysis**
```typescript
interface AudienceSegment {
  id: string;
  name: string;
  criteria: SegmentCriteria;
  size: number;
  characteristics: SegmentCharacteristics;
}

interface SegmentCriteria {
  demographics?: DemographicCriteria;
  behavior?: BehaviorCriteria;
  engagement?: EngagementCriteria;
  custom?: CustomCriteria[];
}

class AudienceAnalyticsService {
  async getAudienceInsights(contentId: string): Promise<AudienceInsights> {
    const events = await this.eventStore.getEventsForContent(contentId);
    
    // Aggregate demographics
    const demographics = await this.aggregateDemographics(events);
    
    // Analyze behavior patterns
    const behavior = await this.analyzeBehavior(events);
    
    // Extract interests
    const interests = await this.extractInterests(events);
    
    // Build segments
    const segments = await this.buildSegments(events);
    
    return {
      contentId,
      demographics,
      behavior,
      interests,
      segments
    };
  }

  async createSegment(criteria: SegmentCriteria): Promise<AudienceSegment> {
    const segmentId = this.generateSegmentId();
    
    // Calculate segment size
    const matchingUsers = await this.findMatchingUsers(criteria);
    
    // Analyze segment characteristics
    const characteristics = await this.analyzeSegmentCharacteristics(matchingUsers);
    
    const segment: AudienceSegment = {
      id: segmentId,
      name: this.generateSegmentName(criteria),
      criteria,
      size: matchingUsers.length,
      characteristics
    };
    
    await this.segmentStore.save(segment);
    return segment;
  }

  private async analyzeBehavior(events: AnalyticsEvent[]): Promise<BehaviorAnalysis> {
    const sessions = this.groupBySessions(events);
    
    return {
      avgSessionDuration: this.calculateAvgSessionDuration(sessions),
      pagesPerSession: this.calculatePagesPerSession(sessions),
      returnRate: this.calculateReturnRate(events),
      preferredDevices: this.aggregateDevices(events),
      peakHours: this.findPeakHours(events),
      contentPreferences: this.analyzeContentPreferences(events)
    };
  }
}
```

### Performance Dashboard

**Real-Time and Historical Analytics Dashboard**
```typescript
interface DashboardConfig {
  dateRange: DateRange;
  metrics: MetricType[];
  dimensions: DimensionType[];
  filters: DashboardFilter[];
  refreshInterval?: number;
}

class AnalyticsDashboard {
  async getOverviewMetrics(dateRange: DateRange): Promise<OverviewMetrics> {
    const [views, engagement, audience, performance] = await Promise.all([
      this.getViewMetrics(dateRange),
      this.getEngagementMetrics(dateRange),
      this.getAudienceMetrics(dateRange),
      this.getPerformanceMetrics(dateRange)
    ]);
    
    return {
      totalViews: views.total,
      uniqueVisitors: views.unique,
      avgEngagementRate: engagement.avgRate,
      avgTimeOnSite: engagement.avgTime,
      bounceRate: engagement.bounceRate,
      newVsReturning: audience.newVsReturning,
      topTrafficSources: views.topSources,
      conversionRate: performance.conversionRate
    };
  }

  async getTopContent(limit: number, sortBy: string): Promise<ContentRanking[]> {
    const metrics = await this.metricsStore.getAggregatedMetrics();
    
    const sorted = metrics.sort((a, b) => {
      switch (sortBy) {
        case 'views': return b.views - a.views;
        case 'engagement': return b.engagementScore - a.engagementScore;
        case 'shares': return b.shares - a.shares;
        case 'conversions': return b.conversions - a.conversions;
        default: return b.views - a.views;
      }
    });
    
    return sorted.slice(0, limit).map((metric, index) => ({
      rank: index + 1,
      contentId: metric.contentId,
      title: metric.title,
      views: metric.views,
      engagementScore: metric.engagementScore,
      trend: this.calculateTrend(metric)
    }));
  }

  async generateReport(config: ReportConfig): Promise<PerformanceReport> {
    const data = await this.collectReportData(config);
    
    return {
      id: this.generateReportId(),
      generatedAt: new Date(),
      dateRange: config.dateRange,
      summary: this.generateSummary(data),
      metrics: data.metrics,
      charts: this.generateCharts(data),
      insights: await this.generateInsights(data),
      recommendations: await this.generateRecommendations(data)
    };
  }
}
```

## Integration Points

### Analytics Platform Integration
```typescript
interface AnalyticsPlatformIntegration {
  // Google Analytics integration
  googleAnalytics: {
    trackingId: string;
    enableEnhancedEcommerce: boolean;
    customDimensions: CustomDimension[];
  };
  
  // Adobe Analytics integration
  adobeAnalytics: {
    reportSuiteId: string;
    trackingServer: string;
    visitorNamespace: string;
  };
  
  // Custom analytics endpoints
  customEndpoints: {
    eventEndpoint: string;
    batchEndpoint: string;
    realtimeEndpoint: string;
  };
}

class AnalyticsIntegrationService {
  async syncToExternalPlatform(events: AnalyticsEvent[]): Promise<void> {
    if (this.config.googleAnalytics.enabled) {
      await this.syncToGoogleAnalytics(events);
    }
    
    if (this.config.adobeAnalytics.enabled) {
      await this.syncToAdobeAnalytics(events);
    }
    
    for (const endpoint of this.config.customEndpoints) {
      await this.syncToCustomEndpoint(endpoint, events);
    }
  }
}
```

### Data Export and Warehousing
```typescript
interface DataExportConfig {
  format: 'csv' | 'json' | 'parquet';
  destination: 'local' | 's3' | 'gcs' | 'bigquery';
  schedule: ExportSchedule;
  filters: ExportFilter[];
}

class DataExportService {
  async exportAnalyticsData(config: DataExportConfig): Promise<ExportResult> {
    const data = await this.collectExportData(config);
    const formatted = this.formatData(data, config.format);
    
    switch (config.destination) {
      case 's3':
        return this.uploadToS3(formatted, config);
      case 'bigquery':
        return this.streamToBigQuery(formatted, config);
      default:
        return this.saveLocally(formatted, config);
    }
  }
}
```

## Security Considerations

### Data Privacy and Anonymization
```typescript
interface PrivacyConfig {
  enableAnonymization: boolean;
  ipMasking: 'full' | 'partial' | 'none';
  userIdHashing: boolean;
  dataRetentionDays: number;
  consentRequired: boolean;
}

class PrivacyCompliantAnalytics {
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    // Check consent
    if (this.config.consentRequired && !event.consentGiven) {
      event = this.anonymizeEvent(event);
    }
    
    // Apply IP masking
    if (this.config.ipMasking !== 'none' && event.ip) {
      event.ip = this.maskIP(event.ip, this.config.ipMasking);
    }
    
    // Hash user ID if configured
    if (this.config.userIdHashing && event.userId) {
      event.userId = this.hashUserId(event.userId);
    }
    
    await this.eventStore.save(event);
  }

  private anonymizeEvent(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      userId: undefined,
      ip: undefined,
      location: event.location ? { country: event.location.country } : undefined
    };
  }
}
```

### Access Control for Analytics Data
```typescript
interface AnalyticsAccessControl {
  roles: AnalyticsRole[];
  permissions: AnalyticsPermission[];
  dataFilters: DataAccessFilter[];
}

class AnalyticsAuthorizationService {
  async canAccessMetrics(userId: string, contentId: string): Promise<boolean> {
    const userRoles = await this.getUserRoles(userId);
    const contentOwner = await this.getContentOwner(contentId);
    
    // Check if user owns the content
    if (contentOwner === userId) return true;
    
    // Check role-based access
    return userRoles.some(role => 
      this.hasPermission(role, 'view_analytics')
    );
  }
}
```

## Testing Considerations

### Analytics Accuracy Testing
```typescript
describe('Content Analytics Accuracy', () => {
  it('should accurately track content views', async () => {
    const contentId = 'test-content-123';
    const viewCount = 100;
    
    // Simulate views
    for (let i = 0; i < viewCount; i++) {
      await analyticsService.trackContentView(contentId, {
        userId: `user-${i}`,
        sessionId: `session-${i}`,
        source: 'direct'
      });
    }
    
    const metrics = await analyticsService.getContentMetrics(contentId, { days: 1 });
    expect(metrics.views).toBe(viewCount);
  });

  it('should calculate engagement score correctly', async () => {
    const readData = {
      timeSpent: 300,
      scrollDepth: 100,
      completedReading: true,
      interactions: 5
    };
    
    const score = analyticsService.calculateEngagementScore(readData);
    expect(score).toBe(100); // Max score
  });

  it('should respect privacy settings', async () => {
    const event = await analyticsService.trackEvent({
      contentId: 'test-123',
      userId: 'user-456',
      consentGiven: false
    });
    
    expect(event.userId).toBeUndefined();
    expect(event.ip).toBeUndefined();
  });
});
```

### Performance Testing
```typescript
describe('Analytics Performance', () => {
  it('should handle high-volume event ingestion', async () => {
    const events = generateTestEvents(10000);
    const startTime = Date.now();
    
    await analyticsService.batchTrackEvents(events);
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(5000); // Under 5 seconds
  });

  it('should query metrics efficiently', async () => {
    const startTime = Date.now();
    
    await analyticsService.getContentMetrics('content-123', { days: 365 });
    
    const duration = Date.now() - startTime;
    expect(duration).toBeLessThan(1000); // Under 1 second
  });
});
```

## Real-World Considerations

### Scalability
- Use time-series databases for event storage (InfluxDB, TimescaleDB)
- Implement event batching for high-volume tracking
- Use CDN-based tracking pixels for global distribution
- Consider sampling for extremely high-traffic content

### Data Quality
- Implement bot detection to filter non-human traffic
- Use session stitching for cross-device tracking
- Handle ad blockers gracefully with server-side tracking
- Validate event data before storage

### Compliance
- Implement GDPR-compliant consent management
- Support data subject access requests (DSAR)
- Provide data deletion capabilities
- Maintain audit logs for compliance reporting

### Cost Optimization
- Implement data aggregation to reduce storage costs
- Use tiered storage for historical data
- Set appropriate data retention policies
- Consider sampling for non-critical metrics
```
