# User Analytics Template

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

This template provides comprehensive patterns for implementing user analytics systems that track user behavior, analyze engagement patterns, and provide insights into user journeys. It covers event tracking, funnel analysis, user segmentation, and behavioral analytics for data-driven product optimization.

## Context

User analytics is essential for understanding how users interact with applications, identifying optimization opportunities, and making data-driven product decisions. A well-designed analytics system captures user actions, analyzes behavior patterns, and provides actionable insights while respecting user privacy. This template addresses the complexity of building comprehensive user analytics that support product growth and user experience optimization.

## Instructions

1. **Setup Analytics Infrastructure**: Configure event tracking and data collection
2. **Implement User Journey Tracking**: Build comprehensive user flow analysis
3. **Add Funnel Analysis**: Enable conversion funnel tracking and optimization
4. **Configure Behavioral Analytics**: Implement user behavior pattern analysis
5. **Enable User Segmentation**: Add dynamic user segmentation capabilities
6. **Add Engagement Metrics**: Build user engagement and retention tracking
7. **Test Analytics Accuracy**: Validate tracking accuracy and data integrity

## Examples

### Example 1: User Analytics Service
```typescript
interface UserAnalyticsService {
  trackEvent(userId: string, event: AnalyticsEvent): Promise<void>;
  trackPageView(userId: string, pageData: PageViewData): Promise<void>;
  getUserJourney(userId: string, timeRange: TimeRange): Promise<UserJourney>;
  getFunnelAnalysis(funnelConfig: FunnelConfig): Promise<FunnelAnalysis>;
  getUserSegments(criteria: SegmentationCriteria): Promise<UserSegment[]>;
}

const analytics = new UserAnalyticsService();
await analytics.trackEvent('user-123', {
  eventType: 'button_click',
  properties: {
    buttonId: 'signup-cta',
    page: '/landing',
    campaign: 'summer-promo'
  }
});
```

### Example 2: Funnel Analysis
```typescript
interface FunnelAnalyzer {
  createFunnel(steps: FunnelStep[]): Promise<Funnel>;
  analyzeFunnel(funnelId: string, timeRange: TimeRange): Promise<FunnelAnalysis>;
  getDropoffPoints(funnelId: string): Promise<DropoffAnalysis[]>;
  optimizeFunnel(funnelId: string): Promise<OptimizationSuggestions>;
}

const funnel = await analyzer.createFunnel([
  { name: 'Landing Page Visit', event: 'page_view', page: '/landing' },
  { name: 'Signup Started', event: 'signup_started' },
  { name: 'Email Verified', event: 'email_verified' },
  { name: 'Profile Completed', event: 'profile_completed' }
]);
```

### Example 3: User Segmentation
```typescript
interface UserSegmentationEngine {
  createSegment(criteria: SegmentCriteria): Promise<UserSegment>;
  getUserSegments(userId: string): Promise<string[]>;
  getSegmentInsights(segmentId: string): Promise<SegmentInsights>;
  updateSegmentMembership(): Promise<void>;
}

const segment = await segmentation.createSegment({
  name: 'High-Value Users',
  criteria: {
    totalPurchases: { gte: 5 },
    lastActivity: { within: '30d' },
    avgOrderValue: { gte: 100 }
  }
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableUserTracking | Enable user behavior tracking | boolean | No | true |
| enableFunnelAnalysis | Enable funnel analysis | boolean | No | true |
| enableSegmentation | Enable user segmentation | boolean | No | true |
| enableRealTimeAnalytics | Enable real-time analytics | boolean | No | false |
| dataRetentionDays | Days to retain analytics data | number | No | 365 |
| enablePrivacyMode | Enable privacy-compliant tracking | boolean | No | true |
| sampleRate | Sampling rate for high-volume tracking | number | No | 1.0 |
| enableCrossPlatform | Enable cross-platform tracking | boolean | No | false |

## Expected Output

This template will produce:
- **Event Tracking System**: Comprehensive user action tracking
- **User Journey Analysis**: Complete user flow and path analysis
- **Funnel Analytics**: Conversion funnel tracking and optimization
- **Behavioral Insights**: User behavior pattern analysis
- **User Segmentation**: Dynamic user grouping and targeting
- **Engagement Metrics**: User engagement and retention tracking
- **Cohort Analysis**: User lifecycle and retention analysis
- **Performance Dashboards**: Real-time user analytics dashboards

## Implementation Patterns

### User Analytics Architecture

```typescript
// Core Analytics Architecture
interface UserAnalyticsSystem {
  eventCollector: EventCollector;
  userTracker: UserTracker;
  funnelAnalyzer: FunnelAnalyzer;
  segmentationEngine: SegmentationEngine;
  behaviorAnalyzer: BehaviorAnalyzer;
  engagementTracker: EngagementTracker;
}

interface AnalyticsEvent {
  eventId: string;
  eventType: string;
  userId: string;
  sessionId: string;
  timestamp: Date;
  
  // Event properties
  properties: Record<string, any>;
  
  // Context
  page?: string;
  referrer?: string;
  userAgent?: string;
  ipAddress?: string;
  
  // Device and platform
  device: DeviceInfo;
  platform: PlatformInfo;
  
  // Campaign attribution
  campaign?: CampaignData;
  
  // Custom dimensions
  customDimensions?: Record<string, string>;
}

interface UserJourney {
  userId: string;
  sessionId: string;
  startTime: Date;
  endTime: Date;
  
  // Journey steps
  events: AnalyticsEvent[];
  pageViews: PageView[];
  
  // Journey metrics
  duration: number;
  eventCount: number;
  pageCount: number;
  
  // Conversion data
  conversions: ConversionEvent[];
  goalCompletions: GoalCompletion[];
  
  // Attribution
  entryPoint: string;
  exitPoint: string;
  trafficSource: TrafficSource;
}

interface FunnelAnalysis {
  funnelId: string;
  funnelName: string;
  timeRange: TimeRange;
  
  // Funnel steps
  steps: FunnelStepResult[];
  
  // Overall metrics
  totalUsers: number;
  conversionRate: number;
  averageTimeToConvert: number;
  
  // Drop-off analysis
  dropoffPoints: DropoffPoint[];
  
  // Segment breakdown
  segmentBreakdown: SegmentFunnelResult[];
}
```

**Event Collection and Processing**
```typescript
class UserEventCollector {
  private eventQueue: EventQueue;
  private validator: EventValidator;
  private enricher: EventEnricher;
  private deduplicator: EventDeduplicator;

  async trackEvent(userId: string, event: Partial<AnalyticsEvent>): Promise<void> {
    // Validate event structure
    const validationResult = this.validator.validate(event);
    if (!validationResult.valid) {
      console.warn('Invalid event:', validationResult.errors);
      return;
    }

    // Enrich event with additional context
    const enrichedEvent = await this.enricher.enrich({
      ...event,
      eventId: this.generateEventId(),
      userId,
      timestamp: new Date()
    });

    // Deduplicate events
    const isDuplicate = await this.deduplicator.isDuplicate(enrichedEvent);
    if (isDuplicate) {
      return;
    }

    // Apply sampling if configured
    if (!this.shouldSample(enrichedEvent)) {
      return;
    }

    // Queue event for processing
    await this.eventQueue.enqueue(enrichedEvent);
    
    // Update real-time metrics
    if (this.config.enableRealTimeAnalytics) {
      await this.updateRealTimeMetrics(enrichedEvent);
    }
  }

  async trackPageView(userId: string, pageData: PageViewData): Promise<void> {
    const pageViewEvent: AnalyticsEvent = {
      eventId: this.generateEventId(),
      eventType: 'page_view',
      userId,
      sessionId: pageData.sessionId,
      timestamp: new Date(),
      page: pageData.page,
      referrer: pageData.referrer,
      properties: {
        title: pageData.title,
        loadTime: pageData.loadTime,
        scrollDepth: pageData.scrollDepth
      },
      device: pageData.device,
      platform: pageData.platform
    };

    await this.trackEvent(userId, pageViewEvent);
  }

  private async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    // Update active users count
    await this.realTimeService.updateActiveUsers(event.userId);
    
    // Update event counters
    await this.realTimeService.incrementEventCounter(event.eventType);
    
    // Update page view metrics
    if (event.eventType === 'page_view') {
      await this.realTimeService.updatePageViews(event.page);
    }
  }

  private shouldSample(event: AnalyticsEvent): boolean {
    if (this.config.sampleRate >= 1) return true;
    
    // Use consistent sampling based on user ID
    const hash = this.hashUserId(event.userId);
    return (hash % 100) < (this.config.sampleRate * 100);
  }
}

class EventEnricher {
  async enrich(event: Partial<AnalyticsEvent>): Promise<AnalyticsEvent> {
    const enriched = { ...event } as AnalyticsEvent;

    // Add session information
    enriched.sessionId = enriched.sessionId || await this.getOrCreateSession(event.userId);

    // Add device information
    if (event.userAgent) {
      enriched.device = this.parseUserAgent(event.userAgent);
    }

    // Add geo information
    if (event.ipAddress) {
      enriched.geo = await this.getGeoInfo(event.ipAddress);
    }

    // Add campaign attribution
    if (event.referrer) {
      enriched.campaign = this.parseCampaignData(event.referrer);
    }

    // Add user context
    enriched.userContext = await this.getUserContext(event.userId);

    return enriched;
  }

  private parseUserAgent(userAgent: string): DeviceInfo {
    // Parse user agent to extract device information
    return {
      type: this.getDeviceType(userAgent),
      browser: this.getBrowser(userAgent),
      os: this.getOperatingSystem(userAgent),
      screenResolution: this.getScreenResolution(userAgent)
    };
  }

  private async getUserContext(userId: string): Promise<UserContext> {
    // Get user profile and context information
    const userProfile = await this.userService.getProfile(userId);
    
    return {
      registrationDate: userProfile.createdAt,
      totalSessions: await this.getSessionCount(userId),
      lastActivity: await this.getLastActivity(userId),
      userSegments: await this.getUserSegments(userId)
    };
  }
}
```

### Funnel Analysis Implementation

```typescript
class FunnelAnalyzer {
  private eventStore: EventStore;
  private userStore: UserStore;

  async createFunnel(config: FunnelConfig): Promise<Funnel> {
    const funnel: Funnel = {
      id: this.generateFunnelId(),
      name: config.name,
      description: config.description,
      steps: config.steps,
      timeWindow: config.timeWindow || '7d',
      createdAt: new Date()
    };

    await this.funnelStore.save(funnel);
    return funnel;
  }

  async analyzeFunnel(funnelId: string, timeRange: TimeRange): Promise<FunnelAnalysis> {
    const funnel = await this.funnelStore.findById(funnelId);
    if (!funnel) throw new Error('Funnel not found');

    // Get users who entered the funnel
    const entryUsers = await this.getUsersAtStep(funnel.steps[0], timeRange);
    
    // Analyze each step
    const stepResults: FunnelStepResult[] = [];
    let previousStepUsers = entryUsers;

    for (let i = 0; i < funnel.steps.length; i++) {
      const step = funnel.steps[i];
      const stepUsers = await this.getUsersAtStep(step, timeRange, previousStepUsers);
      
      const conversionRate = previousStepUsers.length > 0 
        ? stepUsers.length / previousStepUsers.length 
        : 0;

      const dropoffCount = previousStepUsers.length - stepUsers.length;
      const dropoffRate = previousStepUsers.length > 0 
        ? dropoffCount / previousStepUsers.length 
        : 0;

      stepResults.push({
        stepIndex: i,
        stepName: step.name,
        userCount: stepUsers.length,
        conversionRate,
        dropoffCount,
        dropoffRate,
        averageTimeFromPrevious: await this.calculateAverageTime(
          previousStepUsers, 
          stepUsers, 
          i > 0 ? funnel.steps[i - 1] : null, 
          step
        )
      });

      previousStepUsers = stepUsers;
    }

    // Calculate overall metrics
    const totalUsers = entryUsers.length;
    const convertedUsers = stepResults[stepResults.length - 1].userCount;
    const overallConversionRate = totalUsers > 0 ? convertedUsers / totalUsers : 0;

    // Identify major drop-off points
    const dropoffPoints = this.identifyDropoffPoints(stepResults);

    return {
      funnelId,
      funnelName: funnel.name,
      timeRange,
      steps: stepResults,
      totalUsers,
      conversionRate: overallConversionRate,
      averageTimeToConvert: await this.calculateAverageConversionTime(funnel, entryUsers),
      dropoffPoints,
      segmentBreakdown: await this.analyzeBySegments(funnel, timeRange)
    };
  }

  private async getUsersAtStep(
    step: FunnelStep, 
    timeRange: TimeRange, 
    previousUsers?: string[]
  ): Promise<string[]> {
    const query = {
      eventType: step.event,
      timeRange,
      ...(step.properties && { properties: step.properties }),
      ...(step.page && { page: step.page })
    };

    if (previousUsers) {
      query.userId = { $in: previousUsers };
    }

    const events = await this.eventStore.query(query);
    return [...new Set(events.map(e => e.userId))];
  }

  private identifyDropoffPoints(stepResults: FunnelStepResult[]): DropoffPoint[] {
    const dropoffPoints: DropoffPoint[] = [];

    for (let i = 1; i < stepResults.length; i++) {
      const currentStep = stepResults[i];
      const previousStep = stepResults[i - 1];

      // Identify significant drop-offs (>20% drop)
      if (currentStep.dropoffRate > 0.2) {
        dropoffPoints.push({
          fromStep: previousStep.stepName,
          toStep: currentStep.stepName,
          dropoffRate: currentStep.dropoffRate,
          dropoffCount: currentStep.dropoffCount,
          severity: this.calculateDropoffSeverity(currentStep.dropoffRate),
          potentialCauses: await this.analyzePotentialCauses(previousStep, currentStep)
        });
      }
    }

    return dropoffPoints.sort((a, b) => b.dropoffRate - a.dropoffRate);
  }

  private async analyzePotentialCauses(
    fromStep: FunnelStepResult, 
    toStep: FunnelStepResult
  ): Promise<string[]> {
    const causes: string[] = [];

    // Analyze time between steps
    if (toStep.averageTimeFromPrevious > 300000) { // 5 minutes
      causes.push('Long time between steps may indicate user confusion');
    }

    // Analyze error events between steps
    const errorEvents = await this.getErrorEventsBetweenSteps(fromStep, toStep);
    if (errorEvents.length > 0) {
      causes.push('Technical errors detected between steps');
    }

    // Analyze page performance
    const pagePerformance = await this.getPagePerformance(toStep.stepName);
    if (pagePerformance.loadTime > 3000) {
      causes.push('Slow page load time may cause user drop-off');
    }

    return causes;
  }
}
```

### User Segmentation Engine

```typescript
class UserSegmentationEngine {
  private userStore: UserStore;
  private eventStore: EventStore;
  private segmentStore: SegmentStore;

  async createSegment(criteria: SegmentCriteria): Promise<UserSegment> {
    const segment: UserSegment = {
      id: this.generateSegmentId(),
      name: criteria.name,
      description: criteria.description,
      criteria: criteria.rules,
      createdAt: new Date(),
      lastUpdated: new Date(),
      userCount: 0,
      isActive: true
    };

    // Calculate initial segment membership
    const users = await this.calculateSegmentMembership(segment);
    segment.userCount = users.length;

    await this.segmentStore.save(segment);
    await this.updateSegmentMembership(segment.id, users);

    return segment;
  }

  async calculateSegmentMembership(segment: UserSegment): Promise<string[]> {
    const matchingUsers: string[] = [];

    // Get all users (or use a more efficient approach for large datasets)
    const users = await this.userStore.getAllUsers();

    for (const user of users) {
      const matches = await this.evaluateSegmentCriteria(user.id, segment.criteria);
      if (matches) {
        matchingUsers.push(user.id);
      }
    }

    return matchingUsers;
  }

  private async evaluateSegmentCriteria(
    userId: string, 
    criteria: SegmentRule[]
  ): Promise<boolean> {
    for (const rule of criteria) {
      const ruleMatches = await this.evaluateRule(userId, rule);
      
      // For now, using AND logic (all rules must match)
      // Could be extended to support OR logic and complex expressions
      if (!ruleMatches) {
        return false;
      }
    }

    return true;
  }

  private async evaluateRule(userId: string, rule: SegmentRule): Promise<boolean> {
    switch (rule.type) {
      case 'event_count':
        return this.evaluateEventCountRule(userId, rule);
      case 'property_value':
        return this.evaluatePropertyRule(userId, rule);
      case 'time_based':
        return this.evaluateTimeRule(userId, rule);
      case 'behavioral':
        return this.evaluateBehavioralRule(userId, rule);
      default:
        return false;
    }
  }

  private async evaluateEventCountRule(userId: string, rule: SegmentRule): Promise<boolean> {
    const eventCount = await this.eventStore.countEvents({
      userId,
      eventType: rule.eventType,
      timeRange: rule.timeRange
    });

    return this.compareValue(eventCount, rule.operator, rule.value);
  }

  private async evaluatePropertyRule(userId: string, rule: SegmentRule): Promise<boolean> {
    const user = await this.userStore.findById(userId);
    if (!user) return false;

    const propertyValue = this.getNestedProperty(user, rule.property);
    return this.compareValue(propertyValue, rule.operator, rule.value);
  }

  private async evaluateBehavioralRule(userId: string, rule: SegmentRule): Promise<boolean> {
    switch (rule.behavior) {
      case 'session_frequency':
        const sessionCount = await this.getSessionCount(userId, rule.timeRange);
        return this.compareValue(sessionCount, rule.operator, rule.value);
        
      case 'engagement_score':
        const engagementScore = await this.calculateEngagementScore(userId, rule.timeRange);
        return this.compareValue(engagementScore, rule.operator, rule.value);
        
      case 'conversion_rate':
        const conversionRate = await this.calculateUserConversionRate(userId, rule.timeRange);
        return this.compareValue(conversionRate, rule.operator, rule.value);
        
      default:
        return false;
    }
  }

  async getSegmentInsights(segmentId: string): Promise<SegmentInsights> {
    const segment = await this.segmentStore.findById(segmentId);
    if (!segment) throw new Error('Segment not found');

    const users = await this.getSegmentUsers(segmentId);
    
    // Calculate segment characteristics
    const demographics = await this.calculateSegmentDemographics(users);
    const behavior = await this.calculateSegmentBehavior(users);
    const engagement = await this.calculateSegmentEngagement(users);
    const conversion = await this.calculateSegmentConversion(users);

    return {
      segmentId,
      segmentName: segment.name,
      userCount: users.length,
      demographics,
      behavior,
      engagement,
      conversion,
      topEvents: await this.getTopEventsForSegment(users),
      comparisonToAverage: await this.compareToAverage(users)
    };
  }

  private async calculateSegmentBehavior(users: string[]): Promise<BehaviorMetrics> {
    const behaviors = await Promise.all(
      users.map(userId => this.getUserBehaviorMetrics(userId))
    );

    return {
      averageSessionDuration: this.average(behaviors.map(b => b.sessionDuration)),
      averageSessionsPerWeek: this.average(behaviors.map(b => b.sessionsPerWeek)),
      averagePageViewsPerSession: this.average(behaviors.map(b => b.pageViewsPerSession)),
      mostCommonPages: this.getMostCommon(behaviors.flatMap(b => b.topPages)),
      peakUsageHours: this.calculatePeakHours(behaviors.flatMap(b => b.sessionTimes))
    };
  }
}
```

### Behavioral Analytics

```typescript
class BehaviorAnalyzer {
  private eventStore: EventStore;
  private patternDetector: PatternDetector;

  async analyzeUserBehavior(userId: string, timeRange: TimeRange): Promise<BehaviorAnalysis> {
    const events = await this.eventStore.getUserEvents(userId, timeRange);
    
    // Analyze behavior patterns
    const patterns = await this.patternDetector.detectPatterns(events);
    
    // Calculate engagement metrics
    const engagement = this.calculateEngagementMetrics(events);
    
    // Analyze user journey
    const journey = this.analyzeUserJourney(events);
    
    // Detect anomalies
    const anomalies = await this.detectBehaviorAnomalies(userId, events);

    return {
      userId,
      timeRange,
      patterns,
      engagement,
      journey,
      anomalies,
      insights: this.generateBehaviorInsights(patterns, engagement, journey)
    };
  }

  private calculateEngagementMetrics(events: AnalyticsEvent[]): EngagementMetrics {
    const sessions = this.groupEventsBySessions(events);
    
    return {
      totalSessions: sessions.length,
      averageSessionDuration: this.average(sessions.map(s => s.duration)),
      totalEvents: events.length,
      eventsPerSession: events.length / sessions.length,
      uniquePages: new Set(events.filter(e => e.page).map(e => e.page)).size,
      engagementScore: this.calculateEngagementScore(events),
      returnVisitRate: this.calculateReturnVisitRate(sessions)
    };
  }

  private calculateEngagementScore(events: AnalyticsEvent[]): number {
    let score = 0;
    
    // Base score from event count (max 30 points)
    const eventScore = Math.min(events.length / 50, 1) * 30;
    score += eventScore;
    
    // Session duration score (max 25 points)
    const sessions = this.groupEventsBySessions(events);
    const avgDuration = this.average(sessions.map(s => s.duration));
    const durationScore = Math.min(avgDuration / 1800000, 1) * 25; // 30 minutes max
    score += durationScore;
    
    // Page depth score (max 20 points)
    const uniquePages = new Set(events.filter(e => e.page).map(e => e.page)).size;
    const depthScore = Math.min(uniquePages / 10, 1) * 20;
    score += depthScore;
    
    // Interaction score (max 15 points)
    const interactions = events.filter(e => 
      ['click', 'form_submit', 'download', 'share'].includes(e.eventType)
    );
    const interactionScore = Math.min(interactions.length / 20, 1) * 15;
    score += interactionScore;
    
    // Return visit bonus (max 10 points)
    const returnRate = this.calculateReturnVisitRate(sessions);
    const returnScore = returnRate * 10;
    score += returnScore;
    
    return Math.round(score);
  }

  async detectBehaviorAnomalies(
    userId: string, 
    events: AnalyticsEvent[]
  ): Promise<BehaviorAnomaly[]> {
    const anomalies: BehaviorAnomaly[] = [];
    
    // Get user's historical behavior
    const historicalBehavior = await this.getHistoricalBehavior(userId);
    
    // Detect unusual session patterns
    const sessions = this.groupEventsBySessions(events);
    const avgSessionDuration = this.average(sessions.map(s => s.duration));
    
    if (avgSessionDuration > historicalBehavior.avgSessionDuration * 3) {
      anomalies.push({
        type: 'unusual_session_duration',
        severity: 'medium',
        description: 'Session duration significantly longer than usual',
        value: avgSessionDuration,
        expectedValue: historicalBehavior.avgSessionDuration
      });
    }
    
    // Detect unusual event patterns
    const eventTypes = events.map(e => e.eventType);
    const unusualEvents = eventTypes.filter(type => 
      !historicalBehavior.commonEventTypes.includes(type)
    );
    
    if (unusualEvents.length > 0) {
      anomalies.push({
        type: 'unusual_event_types',
        severity: 'low',
        description: 'User performed unusual actions',
        value: unusualEvents,
        expectedValue: historicalBehavior.commonEventTypes
      });
    }
    
    return anomalies;
  }
}
```

## Integration Points

### Analytics Platform Integration
```typescript
interface AnalyticsPlatformIntegration {
  // Google Analytics integration
  googleAnalytics: {
    measurementId: string;
    enableEnhancedEcommerce: boolean;
    customDimensions: CustomDimension[];
    customMetrics: CustomMetric[];
  };
  
  // Mixpanel integration
  mixpanel: {
    projectToken: string;
    enableGroupAnalytics: boolean;
    superProperties: Record<string, any>;
  };
  
  // Amplitude integration
  amplitude: {
    apiKey: string;
    enableSessionReplay: boolean;
    trackingPlan: TrackingPlan;
  };
}

class AnalyticsIntegrationService {
  async syncToExternalPlatforms(events: AnalyticsEvent[]): Promise<void> {
    const promises: Promise<void>[] = [];
    
    if (this.config.googleAnalytics.enabled) {
      promises.push(this.syncToGoogleAnalytics(events));
    }
    
    if (this.config.mixpanel.enabled) {
      promises.push(this.syncToMixpanel(events));
    }
    
    if (this.config.amplitude.enabled) {
      promises.push(this.syncToAmplitude(events));
    }
    
    await Promise.all(promises);
  }

  private async syncToGoogleAnalytics(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      gtag('event', event.eventType, {
        event_category: event.properties.category,
        event_label: event.properties.label,
        value: event.properties.value,
        custom_parameter_1: event.customDimensions?.dimension1
      });
    }
  }

  private async syncToMixpanel(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      mixpanel.track(event.eventType, {
        distinct_id: event.userId,
        ...event.properties,
        ...this.config.mixpanel.superProperties
      });
    }
  }
}
```

### Data Warehouse Integration
```typescript
interface DataWarehouseConfig {
  provider: 'bigquery' | 'snowflake' | 'redshift';
  connectionString: string;
  batchSize: number;
  syncInterval: string;
}

class DataWarehouseSync {
  async syncAnalyticsData(events: AnalyticsEvent[]): Promise<void> {
    const batches = this.createBatches(events, this.config.batchSize);
    
    for (const batch of batches) {
      await this.syncBatch(batch);
    }
  }

  private async syncBatch(events: AnalyticsEvent[]): Promise<void> {
    switch (this.config.provider) {
      case 'bigquery':
        await this.syncToBigQuery(events);
        break;
      case 'snowflake':
        await this.syncToSnowflake(events);
        break;
      case 'redshift':
        await this.syncToRedshift(events);
        break;
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
  enableRightToDelete: boolean;
}

class PrivacyCompliantAnalytics {
  async trackEvent(event: AnalyticsEvent): Promise<void> {
    // Check user consent
    if (this.config.consentRequired) {
      const hasConsent = await this.checkUserConsent(event.userId);
      if (!hasConsent) {
        event = this.anonymizeEvent(event);
      }
    }
    
    // Apply privacy settings
    if (this.config.enableAnonymization) {
      event = this.applyPrivacySettings(event);
    }
    
    await this.eventStore.save(event);
  }

  private anonymizeEvent(event: AnalyticsEvent): AnalyticsEvent {
    return {
      ...event,
      userId: this.config.userIdHashing ? this.hashUserId(event.userId) : undefined,
      ipAddress: this.config.ipMasking !== 'none' ? this.maskIP(event.ipAddress) : undefined,
      // Remove other PII
      properties: this.removePII(event.properties)
    };
  }

  async handleDataDeletionRequest(userId: string): Promise<void> {
    if (!this.config.enableRightToDelete) {
      throw new Error('Data deletion not enabled');
    }
    
    // Delete user events
    await this.eventStore.deleteUserEvents(userId);
    
    // Delete user segments
    await this.segmentStore.removeUserFromAllSegments(userId);
    
    // Delete user profiles
    await this.userStore.deleteUser(userId);
    
    // Log deletion for audit
    await this.auditLogger.logDataDeletion(userId);
  }
}
```

## Testing Considerations

### Analytics Accuracy Testing
```typescript
describe('User Analytics Accuracy', () => {
  it('should accurately track user events', async () => {
    const userId = 'test-user-123';
    const eventCount = 50;
    
    // Track events
    for (let i = 0; i < eventCount; i++) {
      await analytics.trackEvent(userId, {
        eventType: 'button_click',
        properties: { buttonId: `button-${i}` }
      });
    }
    
    const userEvents = await analytics.getUserEvents(userId, { days: 1 });
    expect(userEvents.length).toBe(eventCount);
  });

  it('should calculate funnel conversion rates correctly', async () => {
    const funnel = await analytics.createFunnel([
      { name: 'Step 1', event: 'step1' },
      { name: 'Step 2', event: 'step2' },
      { name: 'Step 3', event: 'step3' }
    ]);
    
    // Create test data: 100 users at step 1, 50 at step 2, 25 at step 3
    for (let i = 0; i < 100; i++) {
      await analytics.trackEvent(`user-${i}`, { eventType: 'step1' });
      if (i < 50) {
        await analytics.trackEvent(`user-${i}`, { eventType: 'step2' });
      }
      if (i < 25) {
        await analytics.trackEvent(`user-${i}`, { eventType: 'step3' });
      }
    }
    
    const analysis = await analytics.analyzeFunnel(funnel.id, { days: 1 });
    expect(analysis.steps[0].userCount).toBe(100);
    expect(analysis.steps[1].userCount).toBe(50);
    expect(analysis.steps[2].userCount).toBe(25);
    expect(analysis.conversionRate).toBeCloseTo(0.25, 2);
  });

  it('should respect privacy settings', async () => {
    const event = {
      userId: 'user-123',
      eventType: 'page_view',
      ipAddress: '192.168.1.1',
      properties: { email: 'user@example.com' }
    };
    
    await analytics.trackEvent(event.userId, event);
    
    const storedEvent = await eventStore.getLatestEvent();
    expect(storedEvent.ipAddress).toBeUndefined();
    expect(storedEvent.properties.email).toBeUndefined();
  });
});
```

## Real-World Considerations

### Scalability
- Use time-series databases for event storage (InfluxDB, TimescaleDB)
- Implement event batching for high-volume tracking
- Use streaming processing for real-time analytics (Apache Kafka, AWS Kinesis)
- Consider data partitioning strategies for large datasets

### Data Quality
- Implement client-side and server-side event validation
- Use event deduplication to handle network retries
- Monitor data quality metrics and alert on anomalies
- Implement data reconciliation between different systems

### Performance Optimization
- Use CDN-based tracking for global applications
- Implement intelligent sampling for high-traffic applications
- Use pre-aggregated metrics for common queries
- Optimize database queries with proper indexing

### Compliance and Governance
- Implement comprehensive consent management
- Support data subject access requests (GDPR Article 15)
- Provide data portability capabilities (GDPR Article 20)
- Maintain detailed audit logs for compliance reporting
