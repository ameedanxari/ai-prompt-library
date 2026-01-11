# CDN Integration and Content Delivery Template

## Purpose
This template provides comprehensive patterns for integrating Content Delivery Networks (CDNs) and implementing adaptive streaming for media applications. It covers global content distribution, edge caching, adaptive bitrate streaming, and performance optimization.

## Context
CDN integration is critical for delivering high-quality media content at scale. Modern streaming platforms require global content distribution with low latency, adaptive bitrate streaming for varying network conditions, and robust edge caching strategies. This template addresses the complexity of building performant content delivery systems that handle millions of concurrent streams while maintaining quality and minimizing buffering.

## Instructions

1. **Choose CDN Provider**: Select primary and backup CDN providers based on global coverage needs
2. **Configure Edge Locations**: Set up edge servers in target geographic regions
3. **Implement Adaptive Streaming**: Configure multiple bitrate profiles for optimal delivery
4. **Setup Caching Strategy**: Define cache rules for different content types and TTL policies
5. **Enable Security Features**: Implement token authentication, geo-blocking, and DDoS protection
6. **Configure Monitoring**: Set up performance monitoring and analytics tracking
7. **Test Global Performance**: Validate delivery speed and quality across different regions

## Examples

### Example 1: CDN Configuration Setup
```typescript
interface CDNService {
  configureCDN(config: CDNConfig): Promise<CDNInstance>;
  setupAdaptiveStreaming(profiles: StreamProfile[]): Promise<ABRConfiguration>;
}

const cdnService = new CDNService();
const cdnInstance = await cdnService.configureCDN({
  provider: 'aws-cloudfront',
  regions: ['us-east-1', 'eu-west-1', 'ap-southeast-1'],
  cacheSettings: {
    mediaContent: { ttl: 86400, adaptiveStreaming: true },
    staticAssets: { ttl: 604800, compressionEnabled: true }
  }
});
```

### Example 2: Adaptive Bitrate Streaming
```typescript
const abrConfig = await cdnService.setupAdaptiveStreaming([
  { bitrate: 128000, resolution: '480p', codec: 'aac' },
  { bitrate: 320000, resolution: '720p', codec: 'aac' },
  { bitrate: 1000000, resolution: '1080p', codec: 'aac' }
]);
```

### Example 3: Content Delivery with Edge Caching
```typescript
const deliveryUrl = await cdnService.generateDeliveryUrl('content-123', {
  adaptiveBitrate: true,
  secureToken: true,
  geoRestrictions: ['US', 'CA', 'EU']
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| cdnProvider | Primary CDN service provider | string | Yes | N/A |
| edgeLocations | Geographic regions for edge servers | array | Yes | N/A |
| cacheStrategy | Caching strategy configuration | object | No | standard |
| adaptiveStreaming | Enable adaptive bitrate streaming | boolean | No | true |
| securityLevel | CDN security configuration level | string | No | "standard" |
| compressionEnabled | Enable content compression | boolean | No | true |
| tokenAuthentication | Enable secure token authentication | boolean | No | false |
| geoBlocking | Enable geographic content blocking | boolean | No | false |
| monitoringEnabled | Enable performance monitoring | boolean | No | true |

## Expected Output

This template will produce:
- **Global CDN Network**: Distributed content delivery with edge caching
- **Adaptive Streaming System**: Multiple bitrate profiles for optimal quality
- **Performance Optimization**: Compression, caching, and delivery optimization
- **Security Implementation**: Token authentication, geo-blocking, and DDoS protection
- **Monitoring Dashboard**: Real-time performance metrics and analytics
- **Failover System**: Automatic failover between CDN providers
- **Cost Optimization**: Intelligent routing and bandwidth management
- **Developer Tools**: APIs for content management and delivery control

## Implementation Patterns

### CDN Architecture Setup

```typescript
// CDN Configuration Interface
interface CDNConfig {
  provider: 'cloudflare' | 'aws-cloudfront' | 'azure-cdn' | 'google-cdn';
  regions: string[];
  cacheSettings: CacheConfiguration;
  securitySettings: CDNSecurityConfig;
  customDomains: string[];
}

interface CacheConfiguration {
  staticAssets: {
    ttl: number; // Time to live in seconds
    patterns: string[]; // File patterns to cache
  };
  mediaContent: {
    ttl: number;
    adaptiveStreaming: boolean;
    compressionEnabled: boolean;
  };
  apiResponses: {
    ttl: number;
    varyHeaders: string[];
  };
}
```

### Adaptive Bitrate Streaming (ABR)

```typescript
// ABR Stream Configuration
interface ABRConfiguration {
  profiles: StreamProfile[];
  adaptationAlgorithm: 'bandwidth' | 'buffer' | 'hybrid';
  segmentDuration: number; // seconds
  manifestFormat: 'hls' | 'dash' | 'both';
}

interface StreamProfile {
  resolution: string; // e.g., "1920x1080"
  bitrate: number; // kbps
  codec: string; // e.g., "h264", "h265", "av1"
  audioCodec: string; // e.g., "aac", "opus"
  audioBitrate: number; // kbps
}

// Example ABR implementation
class AdaptiveBitrateStreaming {
  private currentProfile: StreamProfile;
  private bandwidthMonitor: BandwidthMonitor;
  
  async selectOptimalProfile(availableProfiles: StreamProfile[]): Promise<StreamProfile> {
    const currentBandwidth = await this.bandwidthMonitor.getCurrentBandwidth();
    const bufferHealth = this.getBufferHealth();
    
    // Select profile based on bandwidth and buffer health
    return availableProfiles
      .filter(profile => profile.bitrate <= currentBandwidth * 0.8) // 80% safety margin
      .sort((a, b) => b.bitrate - a.bitrate)[0] || availableProfiles[0];
  }
  
  private getBufferHealth(): number {
    // Return buffer health percentage (0-100)
    return (this.bufferedSeconds / this.targetBufferSize) * 100;
  }
}
```

### Edge Caching Strategy

```typescript
// Edge Cache Management
interface EdgeCacheStrategy {
  warmupStrategy: 'popular-content' | 'geographic' | 'predictive';
  invalidationRules: CacheInvalidationRule[];
  compressionSettings: CompressionConfig;
  geoBlocking?: GeoBlockingConfig;
}

interface CacheInvalidationRule {
  trigger: 'content-update' | 'time-based' | 'manual';
  pattern: string; // URL pattern or content ID pattern
  propagationDelay: number; // seconds
}

// Cache warming implementation
class EdgeCacheManager {
  async warmupCache(content: MediaContent[], strategy: EdgeCacheStrategy): Promise<void> {
    switch (strategy.warmupStrategy) {
      case 'popular-content':
        await this.warmupPopularContent(content);
        break;
      case 'geographic':
        await this.warmupByGeography(content);
        break;
      case 'predictive':
        await this.warmupPredictiveContent(content);
        break;
    }
  }
  
  private async warmupPopularContent(content: MediaContent[]): Promise<void> {
    const popularContent = content
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 1000); // Top 1000 most popular
    
    for (const item of popularContent) {
      await this.preloadToEdge(item);
    }
  }
}
```

### Multi-CDN Failover

```typescript
// Multi-CDN Configuration
interface MultiCDNConfig {
  primaryCDN: CDNProvider;
  fallbackCDNs: CDNProvider[];
  healthCheckInterval: number; // seconds
  failoverThreshold: number; // error rate percentage
  loadBalancing: 'round-robin' | 'geographic' | 'performance';
}

interface CDNProvider {
  name: string;
  baseUrl: string;
  regions: string[];
  healthEndpoint: string;
  priority: number;
}

class MultiCDNManager {
  private healthStatus: Map<string, boolean> = new Map();
  
  async getOptimalCDN(userLocation: string, contentType: string): Promise<CDNProvider> {
    const availableCDNs = this.config.fallbackCDNs
      .filter(cdn => this.healthStatus.get(cdn.name) !== false)
      .filter(cdn => cdn.regions.includes(userLocation));
    
    switch (this.config.loadBalancing) {
      case 'geographic':
        return this.selectByGeography(availableCDNs, userLocation);
      case 'performance':
        return await this.selectByPerformance(availableCDNs);
      default:
        return availableCDNs[Math.floor(Math.random() * availableCDNs.length)];
    }
  }
}
```

### Content Optimization

```typescript
// Content Optimization Pipeline
interface OptimizationPipeline {
  imageOptimization: ImageOptimizationConfig;
  videoOptimization: VideoOptimizationConfig;
  audioOptimization: AudioOptimizationConfig;
  compressionSettings: CompressionSettings;
}

interface VideoOptimizationConfig {
  formats: string[]; // ['mp4', 'webm', 'av1']
  resolutions: string[]; // ['480p', '720p', '1080p', '4k']
  bitrateTargets: number[]; // kbps for each resolution
  keyframeInterval: number; // seconds
  twoPassEncoding: boolean;
}

// Optimization service
class ContentOptimizationService {
  async optimizeForDelivery(content: MediaContent): Promise<OptimizedContent[]> {
    const optimizedVersions: OptimizedContent[] = [];
    
    // Generate multiple formats and resolutions
    for (const format of this.config.videoOptimization.formats) {
      for (const resolution of this.config.videoOptimization.resolutions) {
        const optimized = await this.transcodeVideo(content, {
          format,
          resolution,
          bitrate: this.getBitrateForResolution(resolution)
        });
        optimizedVersions.push(optimized);
      }
    }
    
    return optimizedVersions;
  }
}
```

## Configuration Parameters

### CDN Provider Configuration

```yaml
# CDN Configuration
cdn_config:
  primary_provider: "cloudflare"
  fallback_providers:
    - name: "aws-cloudfront"
      priority: 2
      regions: ["us-east-1", "eu-west-1", "ap-southeast-1"]
    - name: "azure-cdn"
      priority: 3
      regions: ["eastus", "westeurope", "southeastasia"]
  
  cache_settings:
    static_assets:
      ttl: 86400  # 24 hours
      patterns: ["*.css", "*.js", "*.png", "*.jpg"]
    media_content:
      ttl: 3600   # 1 hour
      adaptive_streaming: true
      compression: true
    api_responses:
      ttl: 300    # 5 minutes
      vary_headers: ["Accept-Encoding", "User-Agent"]

  security:
    https_only: true
    hotlink_protection: true
    geo_blocking:
      enabled: false
      blocked_countries: []
    rate_limiting:
      requests_per_second: 100
      burst_limit: 200
```

### ABR Stream Configuration

```json
{
  "abr_profiles": {
    "video_profiles": [
      {
        "name": "240p",
        "resolution": "426x240",
        "bitrate": 400,
        "codec": "h264",
        "preset": "fast"
      },
      {
        "name": "480p",
        "resolution": "854x480",
        "bitrate": 1000,
        "codec": "h264",
        "preset": "medium"
      },
      {
        "name": "720p",
        "resolution": "1280x720",
        "bitrate": 2500,
        "codec": "h264",
        "preset": "medium"
      },
      {
        "name": "1080p",
        "resolution": "1920x1080",
        "bitrate": 5000,
        "codec": "h264",
        "preset": "slow"
      }
    ],
    "audio_profiles": [
      {
        "name": "low",
        "codec": "aac",
        "bitrate": 64,
        "sample_rate": 44100,
        "channels": 2
      },
      {
        "name": "high",
        "codec": "aac",
        "bitrate": 128,
        "sample_rate": 48000,
        "channels": 2
      }
    ]
  },
  "adaptation_settings": {
    "algorithm": "hybrid",
    "segment_duration": 6,
    "manifest_format": "hls",
    "startup_quality": "auto"
  }
}
```

### Multi-CDN Configuration

```typescript
// Multi-CDN Configuration Interface
interface MultiCDNConfiguration {
  loadBalancing: {
    strategy: 'round-robin' | 'geographic' | 'performance';
    healthCheckInterval: number; // seconds
    failoverThreshold: number; // error rate percentage
  };
  providers: CDNProviderConfig[];
  monitoring: {
    metricsCollection: boolean;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      availability: number;
    };
  };
}

// Example configuration
const multiCDNConfig: MultiCDNConfiguration = {
  loadBalancing: {
    strategy: 'performance',
    healthCheckInterval: 30,
    failoverThreshold: 5.0
  },
  providers: [
    {
      name: 'primary-cdn',
      baseUrl: 'https://cdn1.example.com',
      regions: ['us-east', 'eu-west', 'ap-southeast'],
      priority: 1,
      maxBandwidth: 10000 // Mbps
    },
    {
      name: 'backup-cdn',
      baseUrl: 'https://cdn2.example.com',
      regions: ['us-west', 'eu-central', 'ap-northeast'],
      priority: 2,
      maxBandwidth: 5000 // Mbps
    }
  ],
  monitoring: {
    metricsCollection: true,
    alertThresholds: {
      errorRate: 2.0,
      responseTime: 2000,
      availability: 99.5
    }
  }
};
```

## Platform-Specific Implementations

### Web Implementation

```javascript
// HTML5 Video with ABR
class WebStreamingPlayer {
  constructor(videoElement, manifestUrl) {
    this.video = videoElement;
    this.manifestUrl = manifestUrl;
    this.hls = null;
    this.dash = null;
  }
  
  async initialize() {
    if (this.supportsHLS()) {
      await this.initializeHLS();
    } else if (this.supportsDASH()) {
      await this.initializeDASH();
    } else {
      // Fallback to progressive download
      this.video.src = this.getProgressiveUrl();
    }
  }
  
  supportsHLS() {
    return this.video.canPlayType('application/vnd.apple.mpegurl') !== '';
  }
  
  async initializeHLS() {
    if (Hls.isSupported()) {
      this.hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      this.hls.loadSource(this.manifestUrl);
      this.hls.attachMedia(this.video);
    }
  }
}
```

### Mobile Implementation

```swift
// iOS AVPlayer with HLS
import AVFoundation

class iOSStreamingPlayer {
    private var player: AVPlayer?
    private var playerItem: AVPlayerItem?
    
    func setupPlayer(with url: URL) {
        let asset = AVURLAsset(url: url)
        playerItem = AVPlayerItem(asset: asset)
        
        // Configure for optimal streaming
        playerItem?.preferredForwardBufferDuration = 30.0
        playerItem?.canUseNetworkResourcesForLiveStreamingWhilePaused = true
        
        player = AVPlayer(playerItem: playerItem)
        
        // Enable background playback
        try? AVAudioSession.sharedInstance().setCategory(.playback, mode: .default)
        try? AVAudioSession.sharedInstance().setActive(true)
    }
    
    func enableAdaptiveBitrate() {
        playerItem?.preferredPeakBitRate = 0 // Let system choose optimal bitrate
        playerItem?.preferredMaximumResolution = CGSize(width: 1920, height: 1080)
    }
}
```

### Android Implementation

```kotlin
// Android ExoPlayer with DASH/HLS
class AndroidStreamingPlayer(private val context: Context) {
    private var exoPlayer: ExoPlayer? = null
    private var trackSelector: DefaultTrackSelector? = null
    
    fun setupPlayer(manifestUrl: String) {
        trackSelector = DefaultTrackSelector(context).apply {
            setParameters(
                buildUponParameters()
                    .setMaxVideoSizeSd()
                    .setPreferredAudioLanguage("en")
                    .setForceLowestBitrate(false)
            )
        }
        
        exoPlayer = ExoPlayer.Builder(context)
            .setTrackSelector(trackSelector!!)
            .setLoadControl(
                DefaultLoadControl.Builder()
                    .setBufferDurationsMs(
                        15000, // Min buffer
                        50000, // Max buffer
                        1500,  // Buffer for playback
                        5000   // Buffer for playback after rebuffer
                    )
                    .build()
            )
            .build()
        
        val mediaItem = MediaItem.fromUri(manifestUrl)
        exoPlayer?.setMediaItem(mediaItem)
        exoPlayer?.prepare()
    }
}
```

## Performance Monitoring

```typescript
// CDN Performance Metrics
interface CDNMetrics {
  cacheHitRatio: number;
  averageResponseTime: number;
  bandwidthUtilization: number;
  errorRate: number;
  geographicPerformance: Map<string, RegionMetrics>;
}

interface RegionMetrics {
  region: string;
  averageLatency: number;
  throughput: number;
  errorRate: number;
  popularContent: string[];
}

class CDNMonitoringService {
  async collectMetrics(): Promise<CDNMetrics> {
    return {
      cacheHitRatio: await this.getCacheHitRatio(),
      averageResponseTime: await this.getAverageResponseTime(),
      bandwidthUtilization: await this.getBandwidthUtilization(),
      errorRate: await this.getErrorRate(),
      geographicPerformance: await this.getGeographicMetrics()
    };
  }
  
  async optimizeBasedOnMetrics(metrics: CDNMetrics): Promise<void> {
    // Adjust cache settings based on hit ratio
    if (metrics.cacheHitRatio < 0.85) {
      await this.increaseCacheTTL();
    }
    
    // Scale CDN resources based on utilization
    if (metrics.bandwidthUtilization > 0.8) {
      await this.scaleUpCDNCapacity();
    }
    
    // Adjust geographic distribution
    await this.optimizeGeographicDistribution(metrics.geographicPerformance);
  }
}
```

## Security Considerations

```typescript
// CDN Security Configuration
interface CDNSecurityConfig {
  tokenAuthentication: boolean;
  geoBlocking: string[]; // Blocked countries
  rateLimiting: RateLimitConfig;
  hotlinkProtection: boolean;
  httpsOnly: boolean;
  corsSettings: CORSConfig;
}

interface RateLimitConfig {
  requestsPerSecond: number;
  burstLimit: number;
  windowSize: number; // seconds
}

// Secure URL generation
class SecureURLGenerator {
  generateSignedURL(contentId: string, expirationTime: number): string {
    const timestamp = Math.floor(Date.now() / 1000) + expirationTime;
    const path = `/content/${contentId}`;
    const signature = this.generateSignature(path, timestamp);
    
    return `${this.cdnBaseUrl}${path}?expires=${timestamp}&signature=${signature}`;
  }
  
  private generateSignature(path: string, timestamp: number): string {
    const data = `${path}${timestamp}`;
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }
}
```

## Testing Strategy

```typescript
// CDN Testing Framework
describe('CDN Integration Tests', () => {
  test('should deliver content with optimal performance', async () => {
    const contentUrl = await cdnManager.getOptimalURL(testContent, userLocation);
    const startTime = Date.now();
    
    const response = await fetch(contentUrl);
    const endTime = Date.now();
    
    expect(response.status).toBe(200);
    expect(endTime - startTime).toBeLessThan(2000); // 2 second max
    expect(response.headers.get('cache-control')).toContain('max-age');
  });
  
  test('should failover to backup CDN on primary failure', async () => {
    // Simulate primary CDN failure
    await cdnManager.markCDNAsDown('primary');
    
    const contentUrl = await cdnManager.getOptimalURL(testContent, userLocation);
    expect(contentUrl).toContain('backup-cdn');
  });
});
```

## Best Practices

1. **Cache Strategy**: Implement intelligent cache warming for popular content
2. **Monitoring**: Set up comprehensive monitoring for all CDN endpoints
3. **Failover**: Always have multiple CDN providers configured
4. **Security**: Use signed URLs for premium content protection
5. **Optimization**: Regularly analyze metrics and optimize based on usage patterns
6. **Testing**: Implement automated testing for CDN performance and failover scenarios

## Integration Points

- **Analytics Module**: Track CDN performance and user engagement metrics
- **Security Module**: Implement content protection and access controls
- **Commerce Module**: Handle premium content delivery and subscription validation
- **Social Module**: Enable content sharing with proper CDN URL generation

This template provides a comprehensive foundation for implementing robust CDN integration and content delivery systems in media streaming applications.