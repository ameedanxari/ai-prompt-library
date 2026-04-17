# Streaming Quality and Bandwidth Optimization Template

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
This template provides comprehensive patterns for implementing adaptive streaming quality, bandwidth optimization, and network-aware content delivery in media streaming applications. It covers quality adaptation algorithms, bandwidth monitoring, buffer management, and user experience optimization.

## Context
Streaming quality optimization is crucial for user satisfaction in media applications. Users expect smooth playback regardless of network conditions, requiring sophisticated adaptive bitrate algorithms and intelligent buffer management. This template addresses the complexity of building quality-aware streaming systems that dynamically adjust to network conditions, minimize buffering, and maximize playback quality.

## Instructions

1. **Setup Quality Profiles**: Configure multiple bitrate and resolution profiles
2. **Implement Bandwidth Monitoring**: Build real-time network condition detection
3. **Add Adaptive Streaming**: Implement dynamic quality adjustment algorithms
4. **Configure Buffer Management**: Set up optimal buffering strategies and policies
5. **Enable Network Prediction**: Implement predictive bandwidth and quality algorithms
6. **Add Quality Controls**: Provide user controls for manual quality selection
7. **Monitor Streaming Performance**: Track quality metrics and user experience data

## Examples

### Example 1: Adaptive Bitrate Streaming
```typescript
interface StreamingQualityManager {
  setupAdaptiveStreaming(profiles: QualityProfile[]): Promise<ABRConfiguration>;
  monitorBandwidth(): Promise<BandwidthMetrics>;
  adjustQuality(targetQuality: QualityLevel): Promise<void>;
}

const qualityManager = new StreamingQualityManager();
const abrConfig = await qualityManager.setupAdaptiveStreaming([
  { name: '480p', bitrate: 1000000, resolution: '854x480' },
  { name: '720p', bitrate: 2500000, resolution: '1280x720' },
  { name: '1080p', bitrate: 5000000, resolution: '1920x1080' }
]);
```

### Example 2: Bandwidth-Aware Quality Selection
```typescript
const optimalQuality = await qualityManager.selectOptimalQuality({
  availableBandwidth: 3000000, // 3 Mbps
  deviceCapabilities: { maxResolution: '1080p', hardwareDecoding: true },
  userPreferences: { preferQuality: true, dataSaver: false }
});
```

### Example 3: Buffer Management
```typescript
const bufferConfig = await qualityManager.configureBuffering({
  targetBufferSize: 30, // seconds
  maxBufferSize: 60,
  rebufferingThreshold: 5,
  adaptiveBuffering: true
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| adaptiveStreaming | Enable adaptive bitrate streaming | boolean | No | true |
| qualityProfiles | Available quality/bitrate profiles | array | Yes | N/A |
| bandwidthMonitoring | Enable real-time bandwidth monitoring | boolean | No | true |
| bufferSize | Target buffer size (seconds) | number | No | 30 |
| qualityAdjustmentSpeed | Quality change responsiveness | string | No | "medium" |
| enableUserControls | Allow manual quality selection | boolean | No | true |
| networkPrediction | Enable predictive quality adjustment | boolean | No | false |
| dataSaverMode | Enable data-saving optimizations | boolean | No | false |
| qualityMetrics | Track streaming quality metrics | boolean | No | true |

## Expected Output

This template will produce:
- **Adaptive Streaming System**: Dynamic quality adjustment based on network conditions
- **Bandwidth Monitoring**: Real-time network performance tracking and analysis
- **Quality Optimization**: Intelligent quality selection for optimal user experience
- **Buffer Management**: Advanced buffering strategies to prevent interruptions
- **User Controls**: Manual quality selection and preference settings
- **Performance Analytics**: Comprehensive streaming quality and performance metrics
- **Network Prediction**: Predictive algorithms for proactive quality adjustments
- **Cross-Platform Support**: Consistent streaming experience across all devices

## Implementation Patterns

### Adaptive Bitrate Streaming (ABR) System

```typescript
// ABR System Architecture
interface ABRSystem {
  qualitySelector: QualitySelector;
  bandwidthMonitor: BandwidthMonitor;
  bufferManager: BufferManager;
  qualityController: QualityController;
  networkPredictor: NetworkPredictor;
}

interface QualityLevel {
  id: string;
  name: string; // "240p", "480p", "720p", "1080p", "4K"
  resolution: Resolution;
  bitrate: number; // kbps
  codec: string;
  audioQuality: AudioQuality;
  minBandwidth: number; // Required bandwidth in kbps
  maxBandwidth: number; // Optimal bandwidth in kbps
}

interface Resolution {
  width: number;
  height: number;
  aspectRatio: string; // "16:9", "4:3"
}

interface AudioQuality {
  codec: string; // "aac", "opus", "mp3"
  bitrate: number; // kbps
  sampleRate: number; // Hz
  channels: number;
}
```

### Bandwidth Monitoring Service

```typescript
// Bandwidth Monitoring Implementation
class BandwidthMonitor {
  private measurements: BandwidthMeasurement[] = [];
  private currentBandwidth: number = 0;
  private isMonitoring: boolean = false;
  
  async startMonitoring(): Promise<void> {
    this.isMonitoring = true;
    
    // Start continuous monitoring
    setInterval(async () => {
      if (this.isMonitoring) {
        await this.measureBandwidth();
      }
    }, 5000); // Measure every 5 seconds
    
    // Monitor network changes
    if ('connection' in navigator) {
      navigator.connection.addEventListener('change', () => {
        this.handleNetworkChange();
      });
    }
  }
  
  private async measureBandwidth(): Promise<number> {
    const startTime = performance.now();
    const testSize = 100 * 1024; // 100KB test
    
    try {
      // Download test chunk
      const response = await fetch(`/api/bandwidth-test?size=${testSize}&t=${Date.now()}`);
      const data = await response.arrayBuffer();
      const endTime = performance.now();
      
      const duration = (endTime - startTime) / 1000; // seconds
      const bandwidth = (data.byteLength * 8) / (duration * 1000); // kbps
      
      this.addMeasurement({
        timestamp: Date.now(),
        bandwidth,
        latency: endTime - startTime,
        testSize: data.byteLength
      });
      
      this.currentBandwidth = this.calculateMovingAverage();
      return this.currentBandwidth;
      
    } catch (error) {
      console.warn('Bandwidth measurement failed:', error);
      return this.currentBandwidth;
    }
  }
  
  private calculateMovingAverage(windowSize: number = 10): number {
    const recentMeasurements = this.measurements
      .slice(-windowSize)
      .map(m => m.bandwidth);
    
    if (recentMeasurements.length === 0) return 0;
    
    // Use weighted average with more recent measurements having higher weight
    let weightedSum = 0;
    let totalWeight = 0;
    
    recentMeasurements.forEach((bandwidth, index) => {
      const weight = index + 1; // More recent = higher weight
      weightedSum += bandwidth * weight;
      totalWeight += weight;
    });
    
    return weightedSum / totalWeight;
  }
  
  getCurrentBandwidth(): number {
    return this.currentBandwidth;
  }
  
  getBandwidthTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.measurements.length < 3) return 'stable';
    
    const recent = this.measurements.slice(-3);
    const trend = recent[2].bandwidth - recent[0].bandwidth;
    const threshold = this.currentBandwidth * 0.1; // 10% threshold
    
    if (trend > threshold) return 'increasing';
    if (trend < -threshold) return 'decreasing';
    return 'stable';
  }
}
```

### Quality Selection Algorithm

```typescript
// Quality Selection Service
class QualitySelector {
  private availableQualities: QualityLevel[];
  private bandwidthMonitor: BandwidthMonitor;
  private bufferManager: BufferManager;
  private userPreferences: UserPreferences;
  
  async selectOptimalQuality(): Promise<QualityLevel> {
    const currentBandwidth = this.bandwidthMonitor.getCurrentBandwidth();
    const bufferHealth = this.bufferManager.getBufferHealth();
    const networkTrend = this.bandwidthMonitor.getBandwidthTrend();
    const deviceCapabilities = await this.getDeviceCapabilities();
    
    // Filter qualities based on device capabilities
    const compatibleQualities = this.availableQualities.filter(quality => 
      this.isQualityCompatible(quality, deviceCapabilities)
    );
    
    // Calculate quality scores
    const qualityScores = compatibleQualities.map(quality => ({
      quality,
      score: this.calculateQualityScore(quality, {
        bandwidth: currentBandwidth,
        bufferHealth,
        networkTrend,
        deviceCapabilities
      })
    }));
    
    // Sort by score and select best
    qualityScores.sort((a, b) => b.score - a.score);
    
    const selectedQuality = qualityScores[0]?.quality || compatibleQualities[0];
    
    // Apply safety margin for unstable networks
    if (networkTrend === 'decreasing' || bufferHealth < 0.3) {
      return this.applyConservativeSelection(selectedQuality, compatibleQualities);
    }
    
    return selectedQuality;
  }
  
  private calculateQualityScore(
    quality: QualityLevel, 
    context: QualityContext
  ): number {
    let score = 0;
    
    // Bandwidth compatibility (40% weight)
    const bandwidthRatio = context.bandwidth / quality.minBandwidth;
    if (bandwidthRatio >= 1.5) {
      score += 40; // Plenty of bandwidth
    } else if (bandwidthRatio >= 1.2) {
      score += 30; // Adequate bandwidth
    } else if (bandwidthRatio >= 1.0) {
      score += 20; // Minimum bandwidth
    } else {
      score += 0; // Insufficient bandwidth
    }
    
    // Buffer health (25% weight)
    if (context.bufferHealth > 0.7) {
      score += 25; // Healthy buffer
    } else if (context.bufferHealth > 0.4) {
      score += 15; // Moderate buffer
    } else {
      score += 5; // Low buffer
    }
    
    // Quality preference (20% weight)
    const qualityPreference = this.userPreferences.preferredQuality;
    if (quality.name === qualityPreference) {
      score += 20;
    } else if (this.isQualityClose(quality.name, qualityPreference)) {
      score += 10;
    }
    
    // Network trend (15% weight)
    if (context.networkTrend === 'increasing') {
      score += 15;
    } else if (context.networkTrend === 'stable') {
      score += 10;
    } else {
      score += 0; // Decreasing trend
    }
    
    return score;
  }
  
  private applyConservativeSelection(
    selectedQuality: QualityLevel, 
    availableQualities: QualityLevel[]
  ): QualityLevel {
    const currentIndex = availableQualities.indexOf(selectedQuality);
    
    // Step down one quality level for safety
    if (currentIndex > 0) {
      return availableQualities[currentIndex - 1];
    }
    
    return selectedQuality;
  }
}
```

### Buffer Management System

```typescript
// Buffer Management Implementation
class BufferManager {
  private targetBufferSize: number = 30; // seconds
  private minBufferSize: number = 5; // seconds
  private maxBufferSize: number = 60; // seconds
  private currentBuffer: number = 0;
  
  async manageBuffer(
    currentPlaybackTime: number,
    downloadedSegments: MediaSegment[]
  ): Promise<BufferAction> {
    this.currentBuffer = this.calculateBufferSize(currentPlaybackTime, downloadedSegments);
    
    if (this.currentBuffer < this.minBufferSize) {
      return {
        action: 'urgent_download',
        priority: 'high',
        targetSegments: this.getNextSegments(currentPlaybackTime, 3)
      };
    }
    
    if (this.currentBuffer < this.targetBufferSize) {
      return {
        action: 'normal_download',
        priority: 'medium',
        targetSegments: this.getNextSegments(currentPlaybackTime, 2)
      };
    }
    
    if (this.currentBuffer > this.maxBufferSize) {
      return {
        action: 'pause_download',
        priority: 'low',
        targetSegments: []
      };
    }
    
    return {
      action: 'maintain',
      priority: 'low',
      targetSegments: this.getNextSegments(currentPlaybackTime, 1)
    };
  }
  
  getBufferHealth(): number {
    return Math.min(this.currentBuffer / this.targetBufferSize, 1.0);
  }
  
  private calculateBufferSize(
    currentTime: number, 
    segments: MediaSegment[]
  ): number {
    const bufferedSegments = segments.filter(segment => 
      segment.startTime > currentTime && segment.isDownloaded
    );
    
    return bufferedSegments.reduce((total, segment) => 
      total + segment.duration, 0
    );
  }
  
  async optimizeBufferForNetwork(networkConditions: NetworkConditions): Promise<void> {
    if (networkConditions.type === 'cellular') {
      this.targetBufferSize = 20; // Smaller buffer on cellular
      this.maxBufferSize = 40;
    } else if (networkConditions.type === 'wifi') {
      this.targetBufferSize = 30; // Larger buffer on WiFi
      this.maxBufferSize = 60;
    }
    
    // Adjust based on connection stability
    if (networkConditions.stability === 'unstable') {
      this.targetBufferSize *= 1.5; // Increase buffer for unstable connections
    }
  }
}
```

### Network Prediction Service

```typescript
// Network Prediction Implementation
class NetworkPredictor {
  private historicalData: NetworkDataPoint[] = [];
  private predictionModel: PredictionModel;
  
  async predictBandwidth(timeAhead: number): Promise<BandwidthPrediction> {
    const recentData = this.getRecentData(300); // Last 5 minutes
    
    if (recentData.length < 10) {
      return {
        predictedBandwidth: this.getCurrentBandwidth(),
        confidence: 0.5,
        timeHorizon: timeAhead
      };
    }
    
    // Use different prediction methods based on data patterns
    const pattern = this.detectPattern(recentData);
    
    switch (pattern) {
      case 'linear_trend':
        return this.predictLinearTrend(recentData, timeAhead);
      case 'periodic':
        return this.predictPeriodic(recentData, timeAhead);
      case 'stable':
        return this.predictStable(recentData, timeAhead);
      default:
        return this.predictMovingAverage(recentData, timeAhead);
    }
  }
  
  private detectPattern(data: NetworkDataPoint[]): NetworkPattern {
    // Detect linear trend
    const correlation = this.calculateCorrelation(
      data.map((_, i) => i),
      data.map(d => d.bandwidth)
    );
    
    if (Math.abs(correlation) > 0.7) {
      return 'linear_trend';
    }
    
    // Detect periodicity using autocorrelation
    const autocorr = this.calculateAutocorrelation(data.map(d => d.bandwidth));
    if (autocorr.maxCorrelation > 0.6) {
      return 'periodic';
    }
    
    // Check for stability
    const variance = this.calculateVariance(data.map(d => d.bandwidth));
    const mean = data.reduce((sum, d) => sum + d.bandwidth, 0) / data.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    if (coefficientOfVariation < 0.2) {
      return 'stable';
    }
    
    return 'random';
  }
  
  private predictLinearTrend(
    data: NetworkDataPoint[], 
    timeAhead: number
  ): BandwidthPrediction {
    const x = data.map((_, i) => i);
    const y = data.map(d => d.bandwidth);
    
    const { slope, intercept } = this.linearRegression(x, y);
    const predictedBandwidth = slope * (data.length + timeAhead) + intercept;
    
    // Calculate confidence based on R-squared
    const rSquared = this.calculateRSquared(x, y, slope, intercept);
    
    return {
      predictedBandwidth: Math.max(0, predictedBandwidth),
      confidence: rSquared,
      timeHorizon: timeAhead
    };
  }
}
```

### Quality Controller

```typescript
// Quality Controller Implementation
class QualityController {
  private currentQuality: QualityLevel;
  private qualityHistory: QualityChange[] = [];
  private switchCooldown: number = 10000; // 10 seconds
  private lastSwitch: number = 0;
  
  async updateQuality(
    recommendedQuality: QualityLevel,
    context: QualityUpdateContext
  ): Promise<QualityUpdateResult> {
    const now = Date.now();
    
    // Check cooldown period
    if (now - this.lastSwitch < this.switchCooldown) {
      return {
        switched: false,
        reason: 'cooldown_active',
        currentQuality: this.currentQuality
      };
    }
    
    // Check if switch is beneficial
    if (!this.shouldSwitchQuality(recommendedQuality, context)) {
      return {
        switched: false,
        reason: 'switch_not_beneficial',
        currentQuality: this.currentQuality
      };
    }
    
    // Perform quality switch
    const previousQuality = this.currentQuality;
    this.currentQuality = recommendedQuality;
    this.lastSwitch = now;
    
    // Record quality change
    this.qualityHistory.push({
      timestamp: now,
      fromQuality: previousQuality,
      toQuality: recommendedQuality,
      reason: this.determineSwithReason(previousQuality, recommendedQuality, context),
      context
    });
    
    // Trigger quality switch in player
    await this.executeQualitySwitch(recommendedQuality);
    
    return {
      switched: true,
      reason: 'quality_improved',
      currentQuality: this.currentQuality,
      previousQuality
    };
  }
  
  private shouldSwitchQuality(
    newQuality: QualityLevel, 
    context: QualityUpdateContext
  ): boolean {
    if (!this.currentQuality) return true;
    
    const qualityDifference = this.calculateQualityDifference(
      this.currentQuality, 
      newQuality
    );
    
    // Avoid frequent small changes
    if (Math.abs(qualityDifference) < 0.2) {
      return false;
    }
    
    // Be more conservative when switching down
    if (qualityDifference < 0) {
      return context.bufferHealth < 0.3 || context.bandwidth < this.currentQuality.minBandwidth;
    }
    
    // Be more aggressive when switching up
    return context.bandwidth > newQuality.minBandwidth * 1.3;
  }
  
  private async executeQualitySwitch(newQuality: QualityLevel): Promise<void> {
    // Implement smooth quality transition
    const transitionStrategy = this.selectTransitionStrategy(newQuality);
    
    switch (transitionStrategy) {
      case 'immediate':
        await this.immediateSwitch(newQuality);
        break;
      case 'gradual':
        await this.gradualSwitch(newQuality);
        break;
      case 'segment_boundary':
        await this.segmentBoundarySwitch(newQuality);
        break;
    }
  }
  
  getQualityMetrics(): QualityMetrics {
    const recentHistory = this.qualityHistory.slice(-50); // Last 50 changes
    
    return {
      currentQuality: this.currentQuality,
      averageQuality: this.calculateAverageQuality(recentHistory),
      switchFrequency: this.calculateSwitchFrequency(recentHistory),
      stabilityScore: this.calculateStabilityScore(recentHistory),
      userSatisfactionScore: this.estimateUserSatisfaction(recentHistory)
    };
  }
}
```

### User Experience Optimization

```typescript
// UX Optimization Service
class StreamingUXOptimizer {
  private qualityController: QualityController;
  private userPreferences: UserPreferences;
  private deviceCapabilities: DeviceCapabilities;
  
  async optimizeForUserExperience(context: StreamingContext): Promise<UXOptimization> {
    const optimizations: UXOptimization = {
      qualityAdjustments: [],
      bufferAdjustments: [],
      uiRecommendations: [],
      performanceImprovements: []
    };
    
    // Optimize based on content type
    if (context.contentType === 'live') {
      optimizations.qualityAdjustments.push({
        type: 'reduce_buffer_target',
        value: 10, // Reduce to 10 seconds for live content
        reason: 'minimize_latency'
      });
    }
    
    // Optimize based on device
    if (this.deviceCapabilities.isMobile) {
      optimizations.qualityAdjustments.push({
        type: 'limit_max_quality',
        value: '720p',
        reason: 'battery_optimization'
      });
    }
    
    // Optimize based on network conditions
    if (context.networkType === 'cellular') {
      optimizations.performanceImprovements.push({
        type: 'enable_data_saver',
        description: 'Reduce quality on cellular to save data',
        estimatedSavings: '60% data reduction'
      });
    }
    
    // Optimize based on viewing patterns
    const viewingPattern = await this.analyzeViewingPattern(context.userId);
    if (viewingPattern.averageWatchTime < 300) { // Less than 5 minutes
      optimizations.qualityAdjustments.push({
        type: 'fast_startup',
        value: 'prioritize_startup_speed',
        reason: 'short_viewing_sessions'
      });
    }
    
    return optimizations;
  }
  
  async adaptToUserBehavior(userActions: UserAction[]): Promise<void> {
    const behaviorPattern = this.analyzeBehaviorPattern(userActions);
    
    // Adjust quality switching sensitivity
    if (behaviorPattern.manualQualityChanges > 5) {
      // User frequently changes quality manually - be less aggressive with auto-switching
      this.qualityController.setSwitchSensitivity(0.3);
    }
    
    // Adjust buffer size based on pause/seek behavior
    if (behaviorPattern.frequentPausing) {
      // User pauses frequently - maintain smaller buffer
      this.qualityController.setTargetBufferSize(15);
    }
    
    // Learn from quality preferences
    const preferredQualities = this.extractQualityPreferences(userActions);
    await this.updateUserPreferences(preferredQualities);
  }
}
```

## Configuration Parameters

### ABR System Configuration

```yaml
# ABR System Configuration
abr_system:
  quality_levels:
    - name: "240p"
      resolution: "426x240"
      bitrate: 400  # kbps
      min_bandwidth: 500
      max_bandwidth: 800
    - name: "480p"
      resolution: "854x480"
      bitrate: 1000
      min_bandwidth: 1200
      max_bandwidth: 2000
    - name: "720p"
      resolution: "1280x720"
      bitrate: 2500
      min_bandwidth: 3000
      max_bandwidth: 5000
    - name: "1080p"
      resolution: "1920x1080"
      bitrate: 5000
      min_bandwidth: 6000
      max_bandwidth: 10000

  bandwidth_monitoring:
    measurement_interval: 5000  # milliseconds
    test_chunk_size: 102400     # bytes (100KB)
    moving_average_window: 10   # measurements
    stability_threshold: 0.1    # 10% variation

  buffer_management:
    target_buffer_size: 30      # seconds
    min_buffer_size: 5          # seconds
    max_buffer_size: 60         # seconds
    urgent_threshold: 5         # seconds

  quality_switching:
    switch_cooldown: 10000      # milliseconds
    conservative_mode: true
    bandwidth_safety_margin: 1.3  # 30% safety margin
    quality_step_limit: 2       # max quality levels to jump
```

### Network-Specific Configuration

```json
{
  "network_profiles": {
    "wifi": {
      "target_buffer": 30,
      "max_buffer": 60,
      "aggressive_switching": true,
      "preload_segments": 3
    },
    "cellular": {
      "target_buffer": 20,
      "max_buffer": 40,
      "aggressive_switching": false,
      "preload_segments": 1,
      "data_saver_mode": true
    },
    "ethernet": {
      "target_buffer": 45,
      "max_buffer": 90,
      "aggressive_switching": true,
      "preload_segments": 5
    }
  },
  "quality_constraints": {
    "cellular_max_quality": "720p",
    "low_battery_max_quality": "480p",
    "background_max_quality": "240p"
  }
}
```

### Device-Specific Configuration

```typescript
// Device Configuration Interface
interface DeviceConfiguration {
  maxResolution: Resolution;
  maxBitrate: number;
  hardwareDecoding: boolean;
  batteryOptimization: boolean;
  thermalThrottling: boolean;
}

// Example device configurations
const deviceConfigs: Record<string, DeviceConfiguration> = {
  'mobile_low_end': {
    maxResolution: { width: 854, height: 480 },
    maxBitrate: 1500,
    hardwareDecoding: false,
    batteryOptimization: true,
    thermalThrottling: true
  },
  'mobile_high_end': {
    maxResolution: { width: 1920, height: 1080 },
    maxBitrate: 8000,
    hardwareDecoding: true,
    batteryOptimization: false,
    thermalThrottling: false
  },
  'desktop': {
    maxResolution: { width: 3840, height: 2160 },
    maxBitrate: 25000,
    hardwareDecoding: true,
    batteryOptimization: false,
    thermalThrottling: false
  },
  'smart_tv': {
    maxResolution: { width: 3840, height: 2160 },
    maxBitrate: 15000,
    hardwareDecoding: true,
    batteryOptimization: false,
    thermalThrottling: true
  }
};
```

### Performance Tuning Parameters

```javascript
// Performance Configuration
const performanceConfig = {
  // Bandwidth measurement tuning
  bandwidthMeasurement: {
    testSizes: [50 * 1024, 100 * 1024, 200 * 1024], // Progressive test sizes
    maxTestDuration: 10000, // Maximum test duration in ms
    minMeasurements: 3,     // Minimum measurements before making decisions
    outlierThreshold: 2.0   // Standard deviations for outlier detection
  },
  
  // Quality switching tuning
  qualitySwitching: {
    upSwitchThreshold: 1.5,    // Bandwidth ratio for switching up
    downSwitchThreshold: 0.8,  // Bandwidth ratio for switching down
    stabilityWindow: 15000,    // Time window for stability assessment
    maxSwitchesPerMinute: 6    // Rate limiting for quality switches
  },
  
  // Buffer optimization
  bufferOptimization: {
    segmentDuration: 6,        // Seconds per segment
    lookAheadSegments: 5,      // Segments to consider for quality decisions
    emergencyBufferSize: 2,    // Emergency buffer threshold
    preloadStrategy: 'adaptive' // 'aggressive', 'conservative', 'adaptive'
  }
};
```

## Platform-Specific Implementations

### Web Implementation

```javascript
// Web ABR Implementation using Media Source Extensions
class WebABRPlayer {
  constructor(videoElement) {
    this.video = videoElement;
    this.mediaSource = new MediaSource();
    this.sourceBuffer = null;
    this.qualityLevels = [];
    this.currentQuality = null;
  }
  
  async initialize(manifestUrl) {
    this.video.src = URL.createObjectURL(this.mediaSource);
    
    await new Promise(resolve => {
      this.mediaSource.addEventListener('sourceopen', resolve);
    });
    
    // Load manifest and quality levels
    const manifest = await this.loadManifest(manifestUrl);
    this.qualityLevels = this.parseQualityLevels(manifest);
    
    // Initialize source buffer
    this.sourceBuffer = this.mediaSource.addSourceBuffer('video/mp4; codecs="avc1.42E01E,mp4a.40.2"');
    
    // Start quality adaptation
    this.startQualityAdaptation();
  }
  
  startQualityAdaptation() {
    setInterval(() => {
      this.adaptQuality();
    }, 5000);
  }
  
  async adaptQuality() {
    const bandwidth = await this.measureBandwidth();
    const bufferLevel = this.getBufferLevel();
    
    const optimalQuality = this.selectQuality(bandwidth, bufferLevel);
    
    if (optimalQuality !== this.currentQuality) {
      await this.switchQuality(optimalQuality);
    }
  }
  
  getBufferLevel() {
    if (this.video.buffered.length > 0) {
      return this.video.buffered.end(0) - this.video.currentTime;
    }
    return 0;
  }
}
```

### Mobile Implementation

```swift
// iOS ABR Implementation using AVPlayer
import AVFoundation

class iOSABRPlayer {
    private var player: AVPlayer?
    private var playerItem: AVPlayerItem?
    private var bandwidthMonitor: BandwidthMonitor
    
    func setupABR(with url: URL) {
        let asset = AVURLAsset(url: url)
        playerItem = AVPlayerItem(asset: asset)
        
        // Configure adaptive bitrate settings
        playerItem?.preferredPeakBitRate = 0 // Let system choose
        playerItem?.preferredMaximumResolution = CGSize(width: 1920, height: 1080)
        
        // Monitor bandwidth and adjust
        startBandwidthMonitoring()
        
        player = AVPlayer(playerItem: playerItem)
    }
    
    private func startBandwidthMonitoring() {
        Timer.scheduledTimer(withTimeInterval: 5.0, repeats: true) { _ in
            self.adaptQuality()
        }
    }
    
    private func adaptQuality() {
        guard let playerItem = playerItem else { return }
        
        let currentBandwidth = bandwidthMonitor.getCurrentBandwidth()
        let bufferLevel = getBufferLevel()
        
        // Adjust preferred peak bitrate based on conditions
        if bufferLevel < 5.0 && currentBandwidth < 1000 {
            playerItem.preferredPeakBitRate = 500_000 // 500 kbps
        } else if currentBandwidth > 5000 {
            playerItem.preferredPeakBitRate = 0 // No limit
        }
    }
}
```

## Testing Strategy

```typescript
// Quality Adaptation Tests
describe('Streaming Quality System', () => {
  test('should select appropriate quality based on bandwidth', async () => {
    const bandwidthMonitor = new MockBandwidthMonitor(2000); // 2 Mbps
    const qualitySelector = new QualitySelector(bandwidthMonitor);
    
    const selectedQuality = await qualitySelector.selectOptimalQuality();
    
    expect(selectedQuality.bitrate).toBeLessThanOrEqual(1600); // 80% of bandwidth
    expect(selectedQuality.name).toBe('720p');
  });
  
  test('should adapt quality when bandwidth changes', async () => {
    const player = new ABRPlayer();
    await player.initialize(testManifest);
    
    // Simulate bandwidth drop
    bandwidthMonitor.setBandwidth(500); // 500 kbps
    
    await waitFor(() => player.getCurrentQuality().name === '240p');
    
    // Simulate bandwidth increase
    bandwidthMonitor.setBandwidth(3000); // 3 Mbps
    
    await waitFor(() => player.getCurrentQuality().name === '1080p');
  });
  
  test('should maintain buffer health during quality switches', async () => {
    const bufferManager = new BufferManager();
    const player = new ABRPlayer(bufferManager);
    
    // Start playback
    await player.play();
    
    // Monitor buffer during quality switches
    const bufferLevels = [];
    const monitor = setInterval(() => {
      bufferLevels.push(bufferManager.getBufferHealth());
    }, 1000);
    
    // Simulate network fluctuations
    await simulateNetworkFluctuations();
    
    clearInterval(monitor);
    
    // Buffer should never drop below critical level
    expect(bufferLevels.every(level => level > 0.1)).toBe(true);
  });
});
```

## Best Practices

1. **Conservative Switching**: Avoid frequent quality changes that degrade user experience
2. **Buffer Management**: Maintain adequate buffer to prevent playback interruptions
3. **Network Awareness**: Consider network type and stability when making quality decisions
4. **User Preferences**: Respect user's quality preferences and data usage settings
5. **Device Optimization**: Adapt quality based on device capabilities and battery level
6. **Smooth Transitions**: Implement seamless quality switches at segment boundaries

## Integration Points

- **Analytics Module**: Track quality metrics and user satisfaction
- **User Preferences Module**: Store and apply user quality preferences
- **Network Module**: Monitor network conditions and predict changes
- **Device Module**: Detect device capabilities and optimize accordingly

This template provides a comprehensive foundation for implementing intelligent streaming quality and bandwidth optimization in media streaming applications.
