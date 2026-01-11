# Media Streaming Module

## Purpose
Generate comprehensive media streaming applications including music streaming, video platforms, podcast services, and content delivery systems with adaptive streaming, content management, and personalization features.

## Instructions
1. Analyze media streaming requirements and content delivery needs
2. Select appropriate streaming templates based on media type (audio, video, live streaming)
3. Implement content delivery networks with adaptive streaming and quality optimization
4. Build media processing pipelines with transcoding and format conversion
5. Create playlist management with collaborative and social features
6. Add recommendation engines with personalized content discovery
7. Implement offline synchronization with content caching and download management
8. Build artist and creator tools with content upload and monetization
9. Add content search with full-text, voice, and visual search capabilities
10. Create comprehensive analytics with viewing/listening metrics and insights

## Examples

### Example 1: Music Streaming Platform
```typescript
// Complete music streaming service
class MusicStreamingPlatform {
  async initializeStreamingPlatform(config: StreamingConfig): Promise<Platform> {
    return {
      contentDelivery: new CDNService(config.cdn),
      mediaProcessing: new TranscodingService(config.transcoding),
      playlistManagement: new PlaylistService(config.playlists),
      recommendationEngine: new RecommendationService(config.recommendations),
      offlineSync: new OfflineSyncService(config.offline),
      artistTools: new CreatorService(config.creators)
    };
  }
}
```

### Example 2: Video Streaming Service
```typescript
// Video streaming platform with live capabilities
class VideoStreamingService {
  async createVideoServices(config: VideoConfig): Promise<VideoServices> {
    return {
      liveStreaming: new LiveStreamService(config.live),
      videoProcessing: new VideoProcessingService(config.processing),
      contentDelivery: new AdaptiveStreamingService(config.adaptive),
      viewerEngagement: new EngagementService(config.engagement),
      contentModeration: new ModerationService(config.moderation)
    };
  }
}
```

### Example 3: Podcast Platform
```typescript
// Podcast hosting and distribution platform
class PodcastPlatform {
  async setupPodcastServices(config: PodcastConfig): Promise<PodcastServices> {
    return {
      podcastHosting: new HostingService(config.hosting),
      audioProcessing: new AudioProcessingService(config.audio),
      distributionNetwork: new DistributionService(config.distribution),
      analyticsTracking: new PodcastAnalyticsService(config.analytics),
      monetization: new MonetizationService(config.monetization)
    };
  }
}
```

## Variables
| Variable | Type | Description | Default | Required |
|----------|------|-------------|---------|----------|
| mediaTypes | array | Supported media formats | ['audio', 'video'] | Yes |
| streamingProtocol | string | Streaming protocol | 'hls' | Yes |
| cdnProvider | string | Content delivery network | 'cloudflare' | Yes |
| adaptiveStreaming | boolean | Quality adaptation | true | No |
| offlineSupport | boolean | Offline content download | true | No |
| liveStreaming | boolean | Live streaming capabilities | false | No |
| contentRecommendations | boolean | Personalized recommendations | true | No |
| creatorTools | boolean | Content creator features | false | No |
| contentModeration | boolean | Automated content moderation | true | Yes |
| analyticsTracking | boolean | Streaming analytics | true | No |

## Expected Output
A comprehensive media streaming platform featuring:
- Content delivery network integration with adaptive streaming and global distribution
- Media processing pipeline with transcoding, format conversion, and quality optimization
- Playlist management with collaborative features and social sharing capabilities
- Recommendation engine with personalized content discovery and machine learning
- Offline synchronization with content caching and download management
- Live streaming capabilities with real-time chat and viewer interaction
- Creator tools with content upload, monetization, and analytics dashboards
- Content search with full-text, voice, and visual search capabilities
- Comprehensive analytics with viewing metrics, engagement tracking, and insights
- Multi-platform support with web, mobile, and smart TV applications

This module contains prompt templates for building comprehensive media streaming applications including music streaming, video platforms, podcast services, and content delivery systems.

## Templates

### Content Delivery & Streaming
- `cdn-integration.md` - Content delivery networks and adaptive streaming
- `media-processing.md` - Audio/video processing and transcoding
- `offline-sync.md` - Content caching and offline playback
- `streaming-quality.md` - Bandwidth optimization and quality adaptation

### Playlist & Discovery
- `playlist-management.md` - Playlist creation and collaborative features
- `recommendation-engine.md` - Content discovery and personalization
- `content-search.md` - Full-text, voice, and visual search
- `artist-creator-tools.md` - Content upload and monetization features

## Usage

These templates are designed to be composable and can be combined with other modules like:
- Commerce (for subscription billing)
- Social (for sharing and social features)
- Analytics (for listening/viewing metrics)
- Security (for content protection)

## Platform Support

Templates support multiple platforms:
- Web (HTML5 video/audio, WebRTC)
- Mobile (iOS/Android native streaming)
- Smart TV and streaming devices
- Desktop applications