import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface RealTimeInfrastructureTemplateStructure {
  hasWebSocketManagementTemplate: boolean;
  hasMessageQueuingTemplate: boolean;
  hasPresenceSystemsTemplate: boolean;
  hasRealTimeSyncTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
  templatesHaveScalabilityFeatures: boolean;
}

export interface LiveStreamingTemplateStructure {
  hasLiveStreamingTemplate: boolean;
  hasVideoConferencingTemplate: boolean;
  hasLiveEventsTemplate: boolean;
  hasStreamingAnalyticsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHavePerformanceOptimization: boolean;
}

export interface RealTimeTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasSecurityConsiderations: boolean;
  hasComplianceRequirements: boolean;
  hasTestingConsiderations: boolean;
  hasCodeExamples: boolean;
  hasDataModels: boolean;
}

export interface WebSocketManagementCoverage {
  // Connection Management
  hasConnectionLifecycle: boolean;
  hasReconnectionHandling: boolean;
  hasConnectionPooling: boolean;
  hasLoadBalancing: boolean;
  
  // Message Handling
  hasMessageRouting: boolean;
  hasMessagePersistence: boolean;
  hasDeliveryGuarantees: boolean;
  hasMessageValidation: boolean;
  
  // Scaling Features
  hasHorizontalScaling: boolean;
  hasConnectionDistribution: boolean;
  hasPerformanceMonitoring: boolean;
  hasResourceOptimization: boolean;
  
  // Security Features
  hasSecureConnections: boolean;
  hasAuthentication: boolean;
  hasRateLimiting: boolean;
  hasOriginValidation: boolean;
}

export interface MessageQueuingCoverage {
  // Queue Management
  hasQueueCreation: boolean;
  hasQueueConfiguration: boolean;
  hasQueueMonitoring: boolean;
  hasQueueCleanup: boolean;
  
  // Message Operations
  hasMessageEnqueuing: boolean;
  hasMessageDequeuing: boolean;
  hasMessagePriority: boolean;
  hasMessageExpiration: boolean;
  
  // Delivery Guarantees
  hasDeliveryGuarantees: boolean;
  hasAtLeastOnceDelivery: boolean;
  hasAtMostOnceDelivery: boolean;
  hasExactlyOnceDelivery: boolean;
  hasDeadLetterQueues: boolean;
  
  // Persistence and Reliability
  hasMessagePersistence: boolean;
  hasFailureRecovery: boolean;
  hasRetryMechanisms: boolean;
  hasBackupSystems: boolean;
}

export interface PresenceSystemsCoverage {
  // Presence Management
  hasPresenceTracking: boolean;
  hasStatusManagement: boolean;
  hasActivityDetection: boolean;
  hasPresenceDistribution: boolean;
  
  // Activity Monitoring
  hasActivityTracking: boolean;
  hasHeartbeatMonitoring: boolean;
  hasConnectionMonitoring: boolean;
  hasEngagementMetrics: boolean;
  
  // Privacy and Filtering
  hasPrivacyControls: boolean;
  hasPresenceFiltering: boolean;
  hasVisibilitySettings: boolean;
  hasDataProtection: boolean;
  
  // Scalability Features
  hasEfficientDistribution: boolean;
  hasPresenceCaching: boolean;
  hasSubscriptionManagement: boolean;
  hasPerformanceOptimization: boolean;
}

export interface RealTimeSyncCoverage {
  // Synchronization Methods
  hasOperationalTransformation: boolean;
  hasCRDTSupport: boolean;
  hasConflictResolution: boolean;
  hasEventualConsistency: boolean;
  
  // Collaborative Features
  hasCollaborativeEditing: boolean;
  hasRealTimeUpdates: boolean;
  hasVersionControl: boolean;
  hasChangeTracking: boolean;
  
  // Data Types Support
  hasTextSynchronization: boolean;
  hasObjectSynchronization: boolean;
  hasArraySynchronization: boolean;
  hasCustomDataTypes: boolean;
  
  // Performance Features
  hasOptimisticUpdates: boolean;
  hasOperationBatching: boolean;
  hasNetworkOptimization: boolean;
  hasOfflineSupport: boolean;
}

export interface LiveStreamingCoverage {
  // Streaming Infrastructure
  hasStreamBroadcasting: boolean;
  hasViewerManagement: boolean;
  hasStreamRecording: boolean;
  hasStreamQuality: boolean;
  
  // Interactive Features
  hasLiveChat: boolean;
  hasViewerInteraction: boolean;
  hasStreamModeration: boolean;
  hasEngagementFeatures: boolean;
  
  // Technical Features
  hasAdaptiveStreaming: boolean;
  hasMultiResolution: boolean;
  hasLatencyOptimization: boolean;
  hasContentDelivery: boolean;
  
  // Analytics and Monitoring
  hasViewerAnalytics: boolean;
  hasPerformanceMetrics: boolean;
  hasQualityMonitoring: boolean;
  hasStreamHealth: boolean;
}

export interface VideoConferencingCoverage {
  // Core Features
  hasMultiPartyVideo: boolean;
  hasScreenSharing: boolean;
  hasAudioManagement: boolean;
  hasVideoManagement: boolean;
  
  // Collaboration Features
  hasRecording: boolean;
  hasFileSharing: boolean;
  hasWhiteboard: boolean;
  hasBreakoutRooms: boolean;
  
  // Quality Features
  hasQualityAdaptation: boolean;
  hasBandwidthOptimization: boolean;
  hasNetworkResilience: boolean;
  hasLatencyMinimization: boolean;
  
  // Security Features
  hasEndToEndEncryption: boolean;
  hasAccessControl: boolean;
  hasWaitingRoom: boolean;
  hasSecurityMonitoring: boolean;
}

export class RealTimeCommunicationTemplateValidator {
  private realTimeModulePath: string;

  constructor(realTimeModulePath: string = 'prompts/modules/real-time-communication') {
    this.realTimeModulePath = realTimeModulePath;
  }

  validateRealTimeInfrastructureTemplates(): RealTimeInfrastructureTemplateStructure {
    const infrastructureTemplates = [
      'websocket-management.md',
      'message-queuing.md',
      'presence-systems.md',
      'real-time-sync.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.realTimeModulePath, filename));

    const hasWebSocketManagementTemplate = templateExists('websocket-management.md');
    const hasMessageQueuingTemplate = templateExists('message-queuing.md');
    const hasPresenceSystemsTemplate = templateExists('presence-systems.md');
    const hasRealTimeSyncTemplate = templateExists('real-time-sync.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;
    let templatesHaveScalabilityFeatures = true;

    for (const template of infrastructureTemplates) {
      const templatePath = join(this.realTimeModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasTestingConsiderations) {
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
        
        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
        
        // Check for scalability features
        if (!this.hasScalabilityFeatures(templatePath)) {
          templatesHaveScalabilityFeatures = false;
        }
      }
    }

    return {
      hasWebSocketManagementTemplate,
      hasMessageQueuingTemplate,
      hasPresenceSystemsTemplate,
      hasRealTimeSyncTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations,
      templatesHaveScalabilityFeatures
    };
  }

  validateLiveStreamingTemplates(): LiveStreamingTemplateStructure {
    const streamingTemplates = [
      'live-streaming.md',
      'video-conferencing.md',
      'live-events.md',
      'streaming-analytics.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.realTimeModulePath, filename));

    const hasLiveStreamingTemplate = templateExists('live-streaming.md');
    const hasVideoConferencingTemplate = templateExists('video-conferencing.md');
    const hasLiveEventsTemplate = templateExists('live-events.md');
    const hasStreamingAnalyticsTemplate = templateExists('streaming-analytics.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHavePerformanceOptimization = true;

    for (const template of streamingTemplates) {
      const templatePath = join(this.realTimeModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasTestingConsiderations) {
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
        
        // Check for performance optimization features
        if (!this.hasPerformanceOptimization(templatePath)) {
          templatesHavePerformanceOptimization = false;
        }
      }
    }

    return {
      hasLiveStreamingTemplate,
      hasVideoConferencingTemplate,
      hasLiveEventsTemplate,
      hasStreamingAnalyticsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHavePerformanceOptimization
    };
  }

  validateTemplateContent(templatePath: string): RealTimeTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');
    
    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') || 
                                 this.hasSection(content, 'Core.*Patterns') ||
                                 this.hasSection(content, 'Core Components'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
                                  this.hasSection(content, 'Core Components'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points'),
      hasSecurityConsiderations: this.hasSection(content, 'Security Considerations'),
      hasComplianceRequirements: this.hasSection(content, 'Compliance Requirements'),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations'),
      hasCodeExamples: this.hasCodeExamples(content),
      hasDataModels: this.hasDataModels(content)
    };
  }

  // Validate requirements 8.1, 8.7, 8.4 specifically for real-time infrastructure
  validateRealTimeInfrastructureRequirements(): {
    requirement_8_1: boolean; // Real-time messaging and WebSocket management
    requirement_8_7: boolean; // Presence systems and activity indicators
    requirement_8_4: boolean; // Real-time sync and collaborative editing
  } {
    const structure = this.validateRealTimeInfrastructureTemplates();
    
    // Requirement 8.1: Real-time messaging and WebSocket management
    const requirement_8_1 = structure.hasWebSocketManagementTemplate && 
                            structure.hasMessageQueuingTemplate;
    
    // Requirement 8.7: Presence systems and activity indicators
    const requirement_8_7 = structure.hasPresenceSystemsTemplate;
    
    // Requirement 8.4: Real-time sync and collaborative editing
    const requirement_8_4 = structure.hasRealTimeSyncTemplate;
    
    return {
      requirement_8_1,
      requirement_8_7,
      requirement_8_4
    };
  }

  // Validate requirements 8.3, 8.9 specifically for live streaming
  validateLiveStreamingRequirements(): {
    requirement_8_3: boolean; // Live streaming and broadcasting
    requirement_8_9: boolean; // Streaming analytics and performance monitoring
  } {
    const structure = this.validateLiveStreamingTemplates();
    
    // Requirement 8.3: Live streaming and broadcasting
    const requirement_8_3 = structure.hasLiveStreamingTemplate && 
                            structure.hasVideoConferencingTemplate &&
                            structure.hasLiveEventsTemplate;
    
    // Requirement 8.9: Streaming analytics and performance monitoring
    const requirement_8_9 = structure.hasStreamingAnalyticsTemplate;
    
    return {
      requirement_8_3,
      requirement_8_9
    };
  }

  analyzeWebSocketManagementCoverage(): WebSocketManagementCoverage {
    const content = this.readTemplate('websocket-management.md');
    
    return {
      // Connection Management
      hasConnectionLifecycle: this.hasFeature(content, 'connection.*lifecycle|connect.*disconnect'),
      hasReconnectionHandling: this.hasFeature(content, 'reconnect|reconnection'),
      hasConnectionPooling: this.hasFeature(content, 'connection.*pool|pool.*management'),
      hasLoadBalancing: this.hasFeature(content, 'load.*balanc|distribution'),
      
      // Message Handling
      hasMessageRouting: this.hasFeature(content, 'message.*routing|route.*message'),
      hasMessagePersistence: this.hasFeature(content, 'persist|storage|queue'),
      hasDeliveryGuarantees: this.hasFeature(content, 'delivery.*guarantee|reliable.*delivery'),
      hasMessageValidation: this.hasFeature(content, 'validat|sanitiz'),
      
      // Scaling Features
      hasHorizontalScaling: this.hasFeature(content, 'horizontal.*scal|scale.*horizontal'),
      hasConnectionDistribution: this.hasFeature(content, 'distribut.*connection|connection.*distribut'),
      hasPerformanceMonitoring: this.hasFeature(content, 'performance.*monitor|monitor.*performance'),
      hasResourceOptimization: this.hasFeature(content, 'optim|resource.*management'),
      
      // Security Features
      hasSecureConnections: this.hasFeature(content, 'wss|secure.*websocket|ssl|tls'),
      hasAuthentication: this.hasFeature(content, 'authenticat|auth'),
      hasRateLimiting: this.hasFeature(content, 'rate.*limit|throttl'),
      hasOriginValidation: this.hasFeature(content, 'origin.*validat|cors')
    };
  }

  analyzeMessageQueuingCoverage(): MessageQueuingCoverage {
    const content = this.readTemplate('message-queuing.md');
    
    return {
      // Queue Management
      hasQueueCreation: this.hasFeature(content, 'create.*queue|queue.*creation'),
      hasQueueConfiguration: this.hasFeature(content, 'queue.*config|config.*queue'),
      hasQueueMonitoring: this.hasFeature(content, 'queue.*monitor|monitor.*queue'),
      hasQueueCleanup: this.hasFeature(content, 'cleanup|purge|retention'),
      
      // Message Operations
      hasMessageEnqueuing: this.hasFeature(content, 'enqueue|add.*message'),
      hasMessageDequeuing: this.hasFeature(content, 'dequeue|get.*message|receive.*message'),
      hasMessagePriority: this.hasFeature(content, 'priority|priorit'),
      hasMessageExpiration: this.hasFeature(content, 'expir|ttl|time.*to.*live'),
      
      // Delivery Guarantees
      hasDeliveryGuarantees: this.hasFeature(content, 'delivery.*guarantee|guarantee.*delivery'),
      hasAtLeastOnceDelivery: this.hasFeature(content, 'at.*least.*once|least.*once'),
      hasAtMostOnceDelivery: this.hasFeature(content, 'at.*most.*once|most.*once'),
      hasExactlyOnceDelivery: this.hasFeature(content, 'exactly.*once|once.*only'),
      hasDeadLetterQueues: this.hasFeature(content, 'dead.*letter|dlq'),
      
      // Persistence and Reliability
      hasMessagePersistence: this.hasFeature(content, 'persist|storage|durable'),
      hasFailureRecovery: this.hasFeature(content, 'recovery|failover'),
      hasRetryMechanisms: this.hasFeature(content, 'retry|redeliver'),
      hasBackupSystems: this.hasFeature(content, 'backup|replica')
    };
  }

  analyzePresenceSystemsCoverage(): PresenceSystemsCoverage {
    const content = this.readTemplate('presence-systems.md');
    
    return {
      // Presence Management
      hasPresenceTracking: this.hasFeature(content, 'presence.*track|track.*presence'),
      hasStatusManagement: this.hasFeature(content, 'status.*management|manage.*status'),
      hasActivityDetection: this.hasFeature(content, 'activity.*detect|detect.*activity'),
      hasPresenceDistribution: this.hasFeature(content, 'presence.*distribut|distribut.*presence'),
      
      // Activity Monitoring
      hasActivityTracking: this.hasFeature(content, 'activity.*track|track.*activity'),
      hasHeartbeatMonitoring: this.hasFeature(content, 'heartbeat|ping.*pong'),
      hasConnectionMonitoring: this.hasFeature(content, 'connection.*monitor|monitor.*connection'),
      hasEngagementMetrics: this.hasFeature(content, 'engagement|metrics'),
      
      // Privacy and Filtering
      hasPrivacyControls: this.hasFeature(content, 'privacy|private'),
      hasPresenceFiltering: this.hasFeature(content, 'filter|visibility'),
      hasVisibilitySettings: this.hasFeature(content, 'visibility|visible'),
      hasDataProtection: this.hasFeature(content, 'data.*protection|gdpr|privacy'),
      
      // Scalability Features
      hasEfficientDistribution: this.hasFeature(content, 'efficient.*distribut|scalable.*distribut'),
      hasPresenceCaching: this.hasFeature(content, 'cache|caching'),
      hasSubscriptionManagement: this.hasFeature(content, 'subscription|subscribe'),
      hasPerformanceOptimization: this.hasFeature(content, 'performance.*optim|optim.*performance')
    };
  }

  analyzeRealTimeSyncCoverage(): RealTimeSyncCoverage {
    const content = this.readTemplate('real-time-sync.md');
    
    return {
      // Synchronization Methods
      hasOperationalTransformation: this.hasFeature(content, 'operational.*transformation|ot'),
      hasCRDTSupport: this.hasFeature(content, 'crdt|conflict.*free.*replicated'),
      hasConflictResolution: this.hasFeature(content, 'conflict.*resolution|resolve.*conflict'),
      hasEventualConsistency: this.hasFeature(content, 'eventual.*consistency|eventually.*consistent'),
      
      // Collaborative Features
      hasCollaborativeEditing: this.hasFeature(content, 'collaborative.*edit|collab.*edit'),
      hasRealTimeUpdates: this.hasFeature(content, 'real.*time.*update|live.*update'),
      hasVersionControl: this.hasFeature(content, 'version|versioning'),
      hasChangeTracking: this.hasFeature(content, 'change.*track|track.*change'),
      
      // Data Types Support
      hasTextSynchronization: this.hasFeature(content, 'text.*sync|text.*edit'),
      hasObjectSynchronization: this.hasFeature(content, 'object.*sync|object.*edit'),
      hasArraySynchronization: this.hasFeature(content, 'array.*sync|list.*sync'),
      hasCustomDataTypes: this.hasFeature(content, 'custom.*data|extensible'),
      
      // Performance Features
      hasOptimisticUpdates: this.hasFeature(content, 'optimistic.*update|optimistic'),
      hasOperationBatching: this.hasFeature(content, 'batch|batching'),
      hasNetworkOptimization: this.hasFeature(content, 'network.*optim|bandwidth'),
      hasOfflineSupport: this.hasFeature(content, 'offline|offline.*support')
    };
  }

  // Helper methods
  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName}`, 'i');
    return sectionRegex.test(content);
  }

  private hasCodeExamples(content: string): boolean {
    const codeBlockRegex = /```[\s\S]*?```/;
    const interfaceRegex = /interface\s+\w+/;
    const classRegex = /class\s+\w+/;
    const functionRegex = /function\s+\w+|async\s+function\s+\w+/;
    
    return codeBlockRegex.test(content) || 
           interfaceRegex.test(content) || 
           classRegex.test(content) ||
           functionRegex.test(content);
  }

  private hasDataModels(content: string): boolean {
    const dataModelPatterns = [
      /interface\s+\w+/g,
      /class\s+\w+/g,
      /enum\s+\w+/g,
      /type\s+\w+\s*=/g
    ];
    
    return dataModelPatterns.some(pattern => pattern.test(content));
  }

  private hasScalabilityFeatures(templatePath: string): boolean {
    if (!existsSync(templatePath)) {
      return false;
    }

    const content = readFileSync(templatePath, 'utf-8').toLowerCase();
    
    const scalabilityKeywords = [
      'scalability', 'scaling', 'horizontal', 'vertical', 'load balancing',
      'distribution', 'clustering', 'performance', 'optimization',
      'throughput', 'latency', 'concurrent', 'parallel'
    ];
    
    return scalabilityKeywords.some(keyword => content.includes(keyword));
  }

  private hasPerformanceOptimization(templatePath: string): boolean {
    if (!existsSync(templatePath)) {
      return false;
    }

    const content = readFileSync(templatePath, 'utf-8').toLowerCase();
    
    const performanceKeywords = [
      'performance', 'optimization', 'latency', 'throughput',
      'bandwidth', 'compression', 'caching', 'buffering',
      'adaptive', 'quality', 'resolution', 'bitrate'
    ];
    
    return performanceKeywords.some(keyword => content.includes(keyword));
  }

  private hasFeature(content: string, feature: string): boolean {
    const regex = new RegExp(feature, 'i');
    return regex.test(content);
  }

  private readTemplate(filename: string): string {
    const templatePath = join(this.realTimeModulePath, filename);
    if (!existsSync(templatePath)) {
      return '';
    }
    return readFileSync(templatePath, 'utf-8');
  }

  private getEmptyTemplateContent(): RealTimeTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasSecurityConsiderations: false,
      hasComplianceRequirements: false,
      hasTestingConsiderations: false,
      hasCodeExamples: false,
      hasDataModels: false
    };
  }
}