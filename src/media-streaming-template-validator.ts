import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface ContentDeliveryTemplateStructure {
  hasCDNIntegrationTemplate: boolean;
  hasMediaProcessingTemplate: boolean;
  hasOfflineSyncTemplate: boolean;
  hasStreamingQualityTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHavePerformanceOptimization: boolean;
}

export interface PlaylistDiscoveryTemplateStructure {
  hasPlaylistManagementTemplate: boolean;
  hasRecommendationEngineTemplate: boolean;
  hasContentSearchTemplate: boolean;
  hasArtistCreatorToolsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveAIFeatures: boolean;
}

export interface MediaStreamingTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasTestingStrategy: boolean;
  hasBestPractices: boolean;
  hasCodeExamples: boolean;
  hasPerformanceConsiderations: boolean;
  hasPlatformSpecificImplementations: boolean;
}

export interface ContentDeliveryCoverage {
  // CDN Features
  hasCDNConfiguration: boolean;
  hasAdaptiveBitrateStreaming: boolean;
  hasEdgeCaching: boolean;
  hasMultiCDNFailover: boolean;
  hasContentOptimization: boolean;
  hasPerformanceMonitoring: boolean;
  hasSecurityFeatures: boolean;

  // Media Processing Features
  hasVideoTranscoding: boolean;
  hasAudioProcessing: boolean;
  hasThumbnailGeneration: boolean;
  hasMetadataExtraction: boolean;
  hasQualityAnalysis: boolean;
  hasCloudProcessing: boolean;

  // Offline Sync Features
  hasIntelligentCaching: boolean;
  hasSyncManagement: boolean;
  hasStorageManagement: boolean;
  hasConflictResolution: boolean;
  hasNetworkAwareDownloading: boolean;
  hasOfflinePlayback: boolean;

  // Streaming Quality Features
  hasBandwidthMonitoring: boolean;
  hasQualitySelection: boolean;
  hasBufferManagement: boolean;
  hasNetworkPrediction: boolean;
  hasQualityController: boolean;
  hasUXOptimization: boolean;
}

export interface PlaylistDiscoveryCoverage {
  // Playlist Management Features
  hasPlaylistCreation: boolean;
  hasCollaborativePlaylists: boolean;
  hasSmartPlaylists: boolean;
  hasPlaylistSharing: boolean;
  hasPlaylistAnalytics: boolean;

  // Recommendation Engine Features
  hasCollaborativeFiltering: boolean;
  hasContentBasedRecommendations: boolean;
  hasHybridRecommendations: boolean;
  hasPersonalization: boolean;
  hasRealTimeRecommendations: boolean;

  // Content Search Features
  hasFullTextSearch: boolean;
  hasVoiceSearch: boolean;
  hasVisualSearch: boolean;
  hasSemanticSearch: boolean;
  hasSearchAnalytics: boolean;

  // Artist/Creator Tools Features
  hasContentUpload: boolean;
  hasMetadataManagement: boolean;
  hasAnalyticsDashboard: boolean;
  hasMonetizationTools: boolean;
  hasRightsManagement: boolean;
}

export class MediaStreamingTemplateValidator {
  private mediaStreamingModulePath: string;

  constructor(mediaStreamingModulePath: string = 'prompts/modules/media-streaming') {
    this.mediaStreamingModulePath = mediaStreamingModulePath;
  }

  validateContentDeliveryTemplateCompleteness(): ContentDeliveryTemplateStructure {
    const contentDeliveryTemplates = [
      'cdn-integration.md',
      'media-processing.md',
      'offline-sync.md',
      'streaming-quality.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.mediaStreamingModulePath, filename));

    const hasCDNIntegrationTemplate = templateExists('cdn-integration.md');
    const hasMediaProcessingTemplate = templateExists('media-processing.md');
    const hasOfflineSyncTemplate = templateExists('offline-sync.md');
    const hasStreamingQualityTemplate = templateExists('streaming-quality.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHavePerformanceOptimization = true;

    for (const template of contentDeliveryTemplates) {
      const templatePath = join(this.mediaStreamingModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasTestingStrategy || !content.hasBestPractices) {
          allTemplatesHaveRequiredSections = false;
        }
        
        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }
        
        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }
        
        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }
        
        if (!content.hasPerformanceConsiderations) {
          templatesHavePerformanceOptimization = false;
        }
      }
    }

    return {
      hasCDNIntegrationTemplate,
      hasMediaProcessingTemplate,
      hasOfflineSyncTemplate,
      hasStreamingQualityTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHavePerformanceOptimization
    };
  }

  validatePlaylistDiscoveryTemplateCompleteness(): PlaylistDiscoveryTemplateStructure {
    const playlistDiscoveryTemplates = [
      'playlist-management.md',
      'recommendation-engine.md',
      'content-search.md',
      'artist-creator-tools.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.mediaStreamingModulePath, filename));

    const hasPlaylistManagementTemplate = templateExists('playlist-management.md');
    const hasRecommendationEngineTemplate = templateExists('recommendation-engine.md');
    const hasContentSearchTemplate = templateExists('content-search.md');
    const hasArtistCreatorToolsTemplate = templateExists('artist-creator-tools.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveAIFeatures = true;

    for (const template of playlistDiscoveryTemplates) {
      const templatePath = join(this.mediaStreamingModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasTestingStrategy || !content.hasBestPractices) {
          allTemplatesHaveRequiredSections = false;
        }
        
        if (!content.hasImplementationPatterns || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }
        
        if (!content.hasConfigurationParameters) {
          templatesHaveConfigurationExamples = false;
        }
        
        if (!content.hasIntegrationPoints) {
          templatesHaveIntegrationPoints = false;
        }
        
        // Check for AI/ML features (recommendation engines, search algorithms)
        if (!this.hasAIFeatures(templatePath)) {
          templatesHaveAIFeatures = false;
        }
      }
    }

    return {
      hasPlaylistManagementTemplate,
      hasRecommendationEngineTemplate,
      hasContentSearchTemplate,
      hasArtistCreatorToolsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveAIFeatures
    };
  }

  validateTemplateContent(templatePath: string): MediaStreamingTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');
    
    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') || 
                                 this.hasSection(content, 'Core.*Patterns') ||
                                 this.hasSection(content, 'Architecture'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
                                  this.hasSection(content, 'Config'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
                           this.hasSection(content, 'Integration'),
      hasTestingStrategy: this.hasSection(content, 'Testing Strategy') ||
                         this.hasSection(content, 'Testing'),
      hasBestPractices: this.hasSection(content, 'Best Practices'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasPerformanceConsiderations: this.hasPerformanceConsiderations(content),
      hasPlatformSpecificImplementations: this.hasPlatformSpecificImplementations(content)
    };
  }

  // Validate requirements 4.1 and 4.9 specifically for content delivery
  validateContentDeliveryRequirements(): {
    requirement_4_1: boolean; // Content delivery networks and adaptive streaming
    requirement_4_9: boolean; // Bandwidth optimization and quality adaptation
  } {
    const structure = this.validateContentDeliveryTemplateCompleteness();
    
    // Requirement 4.1: CDN integration and adaptive streaming
    const requirement_4_1 = structure.hasCDNIntegrationTemplate && 
                            structure.hasStreamingQualityTemplate;
    
    // Requirement 4.9: Media processing and bandwidth optimization
    const requirement_4_9 = structure.hasMediaProcessingTemplate &&
                            structure.hasStreamingQualityTemplate;
    
    return {
      requirement_4_1,
      requirement_4_9
    };
  }

  // Validate requirements 4.2, 4.3, 4.5, 4.8 specifically for playlist and discovery
  validatePlaylistDiscoveryRequirements(): {
    requirement_4_2: boolean; // Playlist creation and collaborative features
    requirement_4_3: boolean; // Content discovery and personalization
    requirement_4_5: boolean; // Content upload and monetization features
    requirement_4_8: boolean; // Full-text, voice, and visual search
  } {
    const structure = this.validatePlaylistDiscoveryTemplateCompleteness();
    
    // Requirement 4.2: Playlist management and collaborative features
    const requirement_4_2 = structure.hasPlaylistManagementTemplate;
    
    // Requirement 4.3: Recommendation engines and personalization
    const requirement_4_3 = structure.hasRecommendationEngineTemplate;
    
    // Requirement 4.5: Artist/creator tools for content upload and monetization
    const requirement_4_5 = structure.hasArtistCreatorToolsTemplate;
    
    // Requirement 4.8: Advanced search capabilities
    const requirement_4_8 = structure.hasContentSearchTemplate;
    
    return {
      requirement_4_2,
      requirement_4_3,
      requirement_4_5,
      requirement_4_8
    };
  }

  // Validate comprehensive content delivery coverage
  validateContentDeliveryCoverage(): ContentDeliveryCoverage {
    const cdnContent = this.readTemplate('cdn-integration.md');
    const mediaProcessingContent = this.readTemplate('media-processing.md');
    const offlineSyncContent = this.readTemplate('offline-sync.md');
    const streamingQualityContent = this.readTemplate('streaming-quality.md');

    return {
      // CDN Features
      hasCDNConfiguration: this.hasFeature(cdnContent, 'CDNConfig') || this.hasFeature(cdnContent, 'CDN'),
      hasAdaptiveBitrateStreaming: this.hasFeature(cdnContent, 'ABR') || this.hasFeature(cdnContent, 'adaptive'),
      hasEdgeCaching: this.hasFeature(cdnContent, 'EdgeCache') || this.hasFeature(cdnContent, 'edge'),
      hasMultiCDNFailover: this.hasFeature(cdnContent, 'MultiCDN') || this.hasFeature(cdnContent, 'failover'),
      hasContentOptimization: this.hasFeature(cdnContent, 'optimization') || this.hasFeature(cdnContent, 'optimize'),
      hasPerformanceMonitoring: this.hasFeature(cdnContent, 'monitoring') || this.hasFeature(cdnContent, 'metrics'),
      hasSecurityFeatures: this.hasFeature(cdnContent, 'security') || this.hasFeature(cdnContent, 'secure'),

      // Media Processing Features
      hasVideoTranscoding: this.hasFeature(mediaProcessingContent, 'transcod') || this.hasFeature(mediaProcessingContent, 'video'),
      hasAudioProcessing: this.hasFeature(mediaProcessingContent, 'audio') || this.hasFeature(mediaProcessingContent, 'AudioProcessing'),
      hasThumbnailGeneration: this.hasFeature(mediaProcessingContent, 'thumbnail') || this.hasFeature(mediaProcessingContent, 'preview'),
      hasMetadataExtraction: this.hasFeature(mediaProcessingContent, 'metadata') || this.hasFeature(mediaProcessingContent, 'extract'),
      hasQualityAnalysis: this.hasFeature(mediaProcessingContent, 'quality') || this.hasFeature(mediaProcessingContent, 'analysis'),
      hasCloudProcessing: this.hasFeature(mediaProcessingContent, 'cloud') || this.hasFeature(mediaProcessingContent, 'AWS') || this.hasFeature(mediaProcessingContent, 'GCP'),

      // Offline Sync Features
      hasIntelligentCaching: this.hasFeature(offlineSyncContent, 'IntelligentCache') || this.hasFeature(offlineSyncContent, 'cache'),
      hasSyncManagement: this.hasFeature(offlineSyncContent, 'SyncManager') || this.hasFeature(offlineSyncContent, 'sync'),
      hasStorageManagement: this.hasFeature(offlineSyncContent, 'StorageManager') || this.hasFeature(offlineSyncContent, 'storage'),
      hasConflictResolution: this.hasFeature(offlineSyncContent, 'ConflictResolver') || this.hasFeature(offlineSyncContent, 'conflict'),
      hasNetworkAwareDownloading: this.hasFeature(offlineSyncContent, 'NetworkAware') || this.hasFeature(offlineSyncContent, 'network'),
      hasOfflinePlayback: this.hasFeature(offlineSyncContent, 'OfflinePlayback') || this.hasFeature(offlineSyncContent, 'offline'),

      // Streaming Quality Features
      hasBandwidthMonitoring: this.hasFeature(streamingQualityContent, 'BandwidthMonitor') || this.hasFeature(streamingQualityContent, 'bandwidth'),
      hasQualitySelection: this.hasFeature(streamingQualityContent, 'QualitySelector') || this.hasFeature(streamingQualityContent, 'quality'),
      hasBufferManagement: this.hasFeature(streamingQualityContent, 'BufferManager') || this.hasFeature(streamingQualityContent, 'buffer'),
      hasNetworkPrediction: this.hasFeature(streamingQualityContent, 'NetworkPredictor') || this.hasFeature(streamingQualityContent, 'prediction'),
      hasQualityController: this.hasFeature(streamingQualityContent, 'QualityController') || this.hasFeature(streamingQualityContent, 'controller'),
      hasUXOptimization: this.hasFeature(streamingQualityContent, 'UXOptimizer') || this.hasFeature(streamingQualityContent, 'optimization')
    };
  }

  // Validate comprehensive playlist and discovery coverage
  validatePlaylistDiscoveryCoverage(): PlaylistDiscoveryCoverage {
    const playlistContent = this.readTemplate('playlist-management.md');
    const recommendationContent = this.readTemplate('recommendation-engine.md');
    const searchContent = this.readTemplate('content-search.md');
    const creatorContent = this.readTemplate('artist-creator-tools.md');

    return {
      // Playlist Management Features
      hasPlaylistCreation: this.hasFeature(playlistContent, 'PlaylistService') || this.hasFeature(playlistContent, 'playlist'),
      hasCollaborativePlaylists: this.hasFeature(playlistContent, 'collaborative') || this.hasFeature(playlistContent, 'shared'),
      hasSmartPlaylists: this.hasFeature(playlistContent, 'smart') || this.hasFeature(playlistContent, 'automatic'),
      hasPlaylistSharing: this.hasFeature(playlistContent, 'sharing') || this.hasFeature(playlistContent, 'share'),
      hasPlaylistAnalytics: this.hasFeature(playlistContent, 'analytics') || this.hasFeature(playlistContent, 'metrics'),

      // Recommendation Engine Features
      hasCollaborativeFiltering: this.hasFeature(recommendationContent, 'collaborative') || this.hasFeature(recommendationContent, 'filtering'),
      hasContentBasedRecommendations: this.hasFeature(recommendationContent, 'content-based') || this.hasFeature(recommendationContent, 'content based'),
      hasHybridRecommendations: this.hasFeature(recommendationContent, 'hybrid') || this.hasFeature(recommendationContent, 'combined'),
      hasPersonalization: this.hasFeature(recommendationContent, 'personalization') || this.hasFeature(recommendationContent, 'personalized'),
      hasRealTimeRecommendations: this.hasFeature(recommendationContent, 'real-time') || this.hasFeature(recommendationContent, 'realtime'),

      // Content Search Features
      hasFullTextSearch: this.hasFeature(searchContent, 'full-text') || this.hasFeature(searchContent, 'text search'),
      hasVoiceSearch: this.hasFeature(searchContent, 'voice') || this.hasFeature(searchContent, 'speech'),
      hasVisualSearch: this.hasFeature(searchContent, 'visual') || this.hasFeature(searchContent, 'image'),
      hasSemanticSearch: this.hasFeature(searchContent, 'semantic') || this.hasFeature(searchContent, 'AI'),
      hasSearchAnalytics: this.hasFeature(searchContent, 'analytics') || this.hasFeature(searchContent, 'metrics'),

      // Artist/Creator Tools Features
      hasContentUpload: this.hasFeature(creatorContent, 'upload') || this.hasFeature(creatorContent, 'ingest'),
      hasMetadataManagement: this.hasFeature(creatorContent, 'metadata') || this.hasFeature(creatorContent, 'tags'),
      hasAnalyticsDashboard: this.hasFeature(creatorContent, 'dashboard') || this.hasFeature(creatorContent, 'analytics'),
      hasMonetizationTools: this.hasFeature(creatorContent, 'monetization') || this.hasFeature(creatorContent, 'revenue'),
      hasRightsManagement: this.hasFeature(creatorContent, 'rights') || this.hasFeature(creatorContent, 'copyright')
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    // Use regex to match section headers with the given name
    const sectionRegex = new RegExp(`##\\s*${sectionName}`, 'i');
    return sectionRegex.test(content);
  }

  private hasCodeExamples(content: string): boolean {
    // Check for code blocks (```), interface definitions, or class definitions
    const codeBlockRegex = /```[\s\S]*?```/;
    const interfaceRegex = /interface\s+\w+/;
    const classRegex = /class\s+\w+/;
    const functionRegex = /function\s+\w+|async\s+function\s+\w+/;
    
    return codeBlockRegex.test(content) || 
           interfaceRegex.test(content) || 
           classRegex.test(content) ||
           functionRegex.test(content);
  }

  private hasPerformanceConsiderations(content: string): boolean {
    // Check for performance-related content
    const performanceKeywords = [
      'performance', 'optimization', 'bandwidth', 'latency',
      'caching', 'buffer', 'streaming', 'quality',
      'scalability', 'load', 'throughput', 'efficiency'
    ];
    
    const contentLower = content.toLowerCase();
    return performanceKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasPlatformSpecificImplementations(content: string): boolean {
    // Check for platform-specific implementations
    const platformKeywords = [
      'web implementation', 'mobile implementation', 'ios', 'android',
      'react native', 'swift', 'kotlin', 'javascript', 'typescript'
    ];
    
    const contentLower = content.toLowerCase();
    return platformKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasAIFeatures(templatePath: string): boolean {
    if (!existsSync(templatePath)) {
      return false;
    }

    const content = readFileSync(templatePath, 'utf-8');
    
    // Check for AI/ML related features
    const aiKeywords = [
      'machine learning', 'recommendation', 'algorithm', 'neural',
      'collaborative filtering', 'content-based', 'personalization',
      'semantic search', 'natural language', 'AI'
    ];
    
    const contentLower = content.toLowerCase();
    return aiKeywords.some(keyword => contentLower.includes(keyword));
  }

  private hasFeature(content: string, feature: string): boolean {
    return content.toLowerCase().includes(feature.toLowerCase());
  }

  private readTemplate(filename: string): string {
    const templatePath = join(this.mediaStreamingModulePath, filename);
    if (!existsSync(templatePath)) {
      return '';
    }
    return readFileSync(templatePath, 'utf-8');
  }

  private getEmptyTemplateContent(): MediaStreamingTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasTestingStrategy: false,
      hasBestPractices: false,
      hasCodeExamples: false,
      hasPerformanceConsiderations: false,
      hasPlatformSpecificImplementations: false
    };
  }
}