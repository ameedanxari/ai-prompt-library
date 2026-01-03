import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SocialProfileTemplateStructure {
  hasUserProfilesTemplate: boolean;
  hasSocialGraphsTemplate: boolean;
  hasUserVerificationTemplate: boolean;
  hasSocialDiscoveryTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveDataModels: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface SocialMessagingTemplateStructure {
  hasRealTimeMessagingTemplate: boolean;
  hasMessageEncryptionTemplate: boolean;
  hasVoiceVideoCallsTemplate: boolean;
  hasCommunicationModerationTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveDataModels: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface SocialContentEngagementTemplateStructure {
  hasContentFeedsTemplate: boolean;
  hasContentCreationTemplate: boolean;
  hasEngagementFeaturesTemplate: boolean;
  hasContentModerationTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveDataModels: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveSecurityConsiderations: boolean;
}

export interface SocialTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationGuidance: boolean;
  hasDataModels: boolean;
  hasIntegrationPatterns: boolean;
  hasSecurityConsiderations: boolean;
  hasUserExperiencePatterns: boolean;
  hasPerformanceOptimization: boolean;
  hasTestingStrategy: boolean;
  hasRealWorldConsiderations: boolean;
  hasCodeExamples: boolean;
}

export class SocialTemplateValidator {
  private socialModulePath: string;

  constructor(socialModulePath: string = 'prompts/modules/social') {
    this.socialModulePath = socialModulePath;
  }

  validateSocialProfileTemplateCompleteness(): SocialProfileTemplateStructure {
    const profileTemplates = [
      'user-profiles.md',
      'social-graphs.md',
      'user-verification.md',
      'social-discovery.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.socialModulePath, filename));

    const hasUserProfilesTemplate = templateExists('user-profiles.md');
    const hasSocialGraphsTemplate = templateExists('social-graphs.md');
    const hasUserVerificationTemplate = templateExists('user-verification.md');
    const hasSocialDiscoveryTemplate = templateExists('social-discovery.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveDataModels = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of profileTemplates) {
      const templatePath = join(this.socialModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasImplementationGuidance || !content.hasTestingStrategy) {
          allTemplatesHaveRequiredSections = false;
        }
        
        if (!content.hasImplementationGuidance || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }
        
        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
        
        if (!content.hasIntegrationPatterns) {
          templatesHaveIntegrationPoints = false;
        }
        
        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasUserProfilesTemplate,
      hasSocialGraphsTemplate,
      hasUserVerificationTemplate,
      hasSocialDiscoveryTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveDataModels,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  validateTemplateContent(templatePath: string): SocialTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');
    
    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationGuidance: this.hasSection(content, 'Implementation Guidance') || 
                                 this.hasSection(content, 'Implementation'),
      hasDataModels: this.hasSection(content, 'Data Models') || 
                     this.hasSection(content, 'Technical Implementation'),
      hasIntegrationPatterns: this.hasSection(content, 'Integration Patterns'),
      hasSecurityConsiderations: this.hasSection(content, 'Security') || 
                                 this.hasSection(content, 'Privacy'),
      hasUserExperiencePatterns: this.hasSection(content, 'User Experience') || 
                                 this.hasSection(content, 'UX'),
      hasPerformanceOptimization: this.hasSection(content, 'Performance') || 
                                  this.hasSection(content, 'Optimization'),
      hasTestingStrategy: this.hasSection(content, 'Testing'),
      hasRealWorldConsiderations: this.hasSection(content, 'Real-World') || 
                                  this.hasSection(content, 'Considerations'),
      hasCodeExamples: this.hasCodeExamples(content)
    };
  }

  validateSocialMessagingTemplateCompleteness(): SocialMessagingTemplateStructure {
    const messagingTemplates = [
      'real-time-messaging.md',
      'message-encryption.md',
      'voice-video-calls.md',
      'communication-moderation.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.socialModulePath, filename));

    const hasRealTimeMessagingTemplate = templateExists('real-time-messaging.md');
    const hasMessageEncryptionTemplate = templateExists('message-encryption.md');
    const hasVoiceVideoCallsTemplate = templateExists('voice-video-calls.md');
    const hasCommunicationModerationTemplate = templateExists('communication-moderation.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveDataModels = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of messagingTemplates) {
      const templatePath = join(this.socialModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasImplementationGuidance || !content.hasTestingStrategy) {
          allTemplatesHaveRequiredSections = false;
        }
        
        if (!content.hasImplementationGuidance || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }
        
        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
        
        if (!content.hasIntegrationPatterns) {
          templatesHaveIntegrationPoints = false;
        }
        
        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasRealTimeMessagingTemplate,
      hasMessageEncryptionTemplate,
      hasVoiceVideoCallsTemplate,
      hasCommunicationModerationTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveDataModels,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  validateSocialContentEngagementTemplateCompleteness(): SocialContentEngagementTemplateStructure {
    const contentEngagementTemplates = [
      'content-feeds.md',
      'content-creation.md',
      'engagement-features.md',
      'content-moderation.md'
    ];

    const templateExists = (filename: string) => 
      existsSync(join(this.socialModulePath, filename));

    const hasContentFeedsTemplate = templateExists('content-feeds.md');
    const hasContentCreationTemplate = templateExists('content-creation.md');
    const hasEngagementFeaturesTemplate = templateExists('engagement-features.md');
    const hasContentModerationTemplate = templateExists('content-moderation.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveDataModels = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveSecurityConsiderations = true;

    for (const template of contentEngagementTemplates) {
      const templatePath = join(this.socialModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);
        
        if (!content.hasPurposeSection || !content.hasContextSection || 
            !content.hasImplementationGuidance || !content.hasTestingStrategy) {
          allTemplatesHaveRequiredSections = false;
        }
        
        if (!content.hasImplementationGuidance || !content.hasCodeExamples) {
          templatesHaveImplementationPatterns = false;
        }
        
        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
        
        if (!content.hasIntegrationPatterns) {
          templatesHaveIntegrationPoints = false;
        }
        
        if (!content.hasSecurityConsiderations) {
          templatesHaveSecurityConsiderations = false;
        }
      }
    }

    return {
      hasContentFeedsTemplate,
      hasContentCreationTemplate,
      hasEngagementFeaturesTemplate,
      hasContentModerationTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveDataModels,
      templatesHaveIntegrationPoints,
      templatesHaveSecurityConsiderations
    };
  }

  // Validate requirements 2.3, 2.5, 2.7, 2.8 specifically for content engagement
  validateSocialContentEngagementRequirements(): {
    requirement_2_3: boolean; // Content feeds and algorithmic distribution
    requirement_2_5: boolean; // Content creation and publishing
    requirement_2_7: boolean; // Engagement features and social interactions
    requirement_2_8: boolean; // Content moderation and safety
  } {
    const structure = this.validateSocialContentEngagementTemplateCompleteness();
    
    // Requirement 2.3: Content feeds and algorithmic distribution
    const requirement_2_3 = structure.hasContentFeedsTemplate;
    
    // Requirement 2.5: Content creation and publishing
    const requirement_2_5 = structure.hasContentCreationTemplate;
    
    // Requirement 2.7: Engagement features and social interactions
    const requirement_2_7 = structure.hasEngagementFeaturesTemplate;
    
    // Requirement 2.8: Content moderation and safety
    const requirement_2_8 = structure.hasContentModerationTemplate;
    
    return {
      requirement_2_3,
      requirement_2_5,
      requirement_2_7,
      requirement_2_8
    };
  }

  // Validate that templates cover all major content engagement features
  validateSocialContentEngagementFeatureCoverage(): {
    hasAlgorithmicFeeds: boolean;
    hasChronologicalFeeds: boolean;
    hasContentPersonalization: boolean;
    hasContentCreationTools: boolean;
    hasMediaUpload: boolean;
    hasRichTextEditing: boolean;
    hasLikesAndReactions: boolean;
    hasCommentSystems: boolean;
    hasSocialSharing: boolean;
    hasContentModeration: boolean;
    hasAutomatedFiltering: boolean;
    hasCommunityModeration: boolean;
  } {
    const contentFeedsPath = join(this.socialModulePath, 'content-feeds.md');
    const contentCreationPath = join(this.socialModulePath, 'content-creation.md');
    const engagementFeaturesPath = join(this.socialModulePath, 'engagement-features.md');
    const contentModerationPath = join(this.socialModulePath, 'content-moderation.md');
    
    let hasAlgorithmicFeeds = false;
    let hasChronologicalFeeds = false;
    let hasContentPersonalization = false;
    let hasContentCreationTools = false;
    let hasMediaUpload = false;
    let hasRichTextEditing = false;
    let hasLikesAndReactions = false;
    let hasCommentSystems = false;
    let hasSocialSharing = false;
    let hasContentModeration = false;
    let hasAutomatedFiltering = false;
    let hasCommunityModeration = false;
    
    if (existsSync(contentFeedsPath)) {
      const content = readFileSync(contentFeedsPath, 'utf-8').toLowerCase();
      hasAlgorithmicFeeds = content.includes('algorithmic') && content.includes('feed');
      hasChronologicalFeeds = content.includes('chronological') && content.includes('feed');
      hasContentPersonalization = content.includes('personalization') || content.includes('personalized');
    }
    
    if (existsSync(contentCreationPath)) {
      const content = readFileSync(contentCreationPath, 'utf-8').toLowerCase();
      hasContentCreationTools = content.includes('creation') && content.includes('tool');
      hasMediaUpload = content.includes('media') && content.includes('upload');
      hasRichTextEditing = content.includes('rich text') || content.includes('editor');
    }
    
    if (existsSync(engagementFeaturesPath)) {
      const content = readFileSync(engagementFeaturesPath, 'utf-8').toLowerCase();
      hasLikesAndReactions = content.includes('like') || content.includes('reaction');
      hasCommentSystems = content.includes('comment') && content.includes('system');
      hasSocialSharing = content.includes('shar') && content.includes('social');
    }
    
    if (existsSync(contentModerationPath)) {
      const content = readFileSync(contentModerationPath, 'utf-8').toLowerCase();
      hasContentModeration = content.includes('moderation') || content.includes('moderate');
      hasAutomatedFiltering = content.includes('automated') && content.includes('filter');
      hasCommunityModeration = content.includes('community') && content.includes('moderation');
    }
    
    return {
      hasAlgorithmicFeeds,
      hasChronologicalFeeds,
      hasContentPersonalization,
      hasContentCreationTools,
      hasMediaUpload,
      hasRichTextEditing,
      hasLikesAndReactions,
      hasCommentSystems,
      hasSocialSharing,
      hasContentModeration,
      hasAutomatedFiltering,
      hasCommunityModeration
    };
  }
  validateSocialMessagingRequirements(): {
    requirement_2_2: boolean; // Real-time messaging and communication
    requirement_2_8: boolean; // Content moderation and safety
  } {
    const structure = this.validateSocialMessagingTemplateCompleteness();
    
    // Requirement 2.2: Real-time messaging and communication
    const requirement_2_2 = structure.hasRealTimeMessagingTemplate && 
                            structure.hasVoiceVideoCallsTemplate;
    
    // Requirement 2.8: Content moderation and safety
    const requirement_2_8 = structure.hasCommunicationModerationTemplate && 
                            structure.hasMessageEncryptionTemplate;
    
    return {
      requirement_2_2,
      requirement_2_8
    };
  }

  // Validate that templates cover all major messaging features
  validateSocialMessagingFeatureCoverage(): {
    hasRealTimeMessaging: boolean;
    hasGroupMessaging: boolean;
    hasMediaSharing: boolean;
    hasEndToEndEncryption: boolean;
    hasVoiceCalls: boolean;
    hasVideoCalls: boolean;
    hasScreenSharing: boolean;
    hasContentModeration: boolean;
    hasUserReporting: boolean;
    hasAutomatedFiltering: boolean;
  } {
    const realTimeMessagingPath = join(this.socialModulePath, 'real-time-messaging.md');
    const messageEncryptionPath = join(this.socialModulePath, 'message-encryption.md');
    const voiceVideoCallsPath = join(this.socialModulePath, 'voice-video-calls.md');
    const communicationModerationPath = join(this.socialModulePath, 'communication-moderation.md');
    
    let hasRealTimeMessaging = false;
    let hasGroupMessaging = false;
    let hasMediaSharing = false;
    let hasEndToEndEncryption = false;
    let hasVoiceCalls = false;
    let hasVideoCalls = false;
    let hasScreenSharing = false;
    let hasContentModeration = false;
    let hasUserReporting = false;
    let hasAutomatedFiltering = false;
    
    if (existsSync(realTimeMessagingPath)) {
      const content = readFileSync(realTimeMessagingPath, 'utf-8').toLowerCase();
      hasRealTimeMessaging = content.includes('real-time') || content.includes('websocket');
      hasGroupMessaging = content.includes('group') && content.includes('messaging');
      hasMediaSharing = content.includes('media') && content.includes('sharing');
    }
    
    if (existsSync(messageEncryptionPath)) {
      const content = readFileSync(messageEncryptionPath, 'utf-8').toLowerCase();
      hasEndToEndEncryption = content.includes('end-to-end') || content.includes('e2ee');
    }
    
    if (existsSync(voiceVideoCallsPath)) {
      const content = readFileSync(voiceVideoCallsPath, 'utf-8').toLowerCase();
      hasVoiceCalls = content.includes('voice') && content.includes('call');
      hasVideoCalls = content.includes('video') && content.includes('call');
      hasScreenSharing = content.includes('screen') && content.includes('shar');
    }
    
    if (existsSync(communicationModerationPath)) {
      const content = readFileSync(communicationModerationPath, 'utf-8').toLowerCase();
      hasContentModeration = content.includes('moderation') || content.includes('filter');
      hasUserReporting = content.includes('report') && content.includes('user');
      hasAutomatedFiltering = content.includes('automated') && content.includes('filter');
    }
    
    return {
      hasRealTimeMessaging,
      hasGroupMessaging,
      hasMediaSharing,
      hasEndToEndEncryption,
      hasVoiceCalls,
      hasVideoCalls,
      hasScreenSharing,
      hasContentModeration,
      hasUserReporting,
      hasAutomatedFiltering
    };
  }
  validateSocialProfileRequirements(): {
    requirement_2_1: boolean; // User profiles with customization and privacy
    requirement_2_4: boolean; // Social graphs and connection suggestions
  } {
    const structure = this.validateSocialProfileTemplateCompleteness();
    
    // Requirement 2.1: User profiles with customization and privacy controls
    const requirement_2_1 = structure.hasUserProfilesTemplate && 
                            structure.hasUserVerificationTemplate;
    
    // Requirement 2.4: Social graphs and connection suggestions
    const requirement_2_4 = structure.hasSocialGraphsTemplate && 
                            structure.hasSocialDiscoveryTemplate;
    
    return {
      requirement_2_1,
      requirement_2_4
    };
  }

  // Validate that templates cover all major social profile features
  validateSocialProfileFeatureCoverage(): {
    hasProfileCustomization: boolean;
    hasPrivacyControls: boolean;
    hasVerificationSystems: boolean;
    hasSocialGraphManagement: boolean;
    hasConnectionSuggestions: boolean;
    hasUserDiscovery: boolean;
    hasTrustSystems: boolean;
    hasRecommendationAlgorithms: boolean;
  } {
    const userProfilesPath = join(this.socialModulePath, 'user-profiles.md');
    const socialGraphsPath = join(this.socialModulePath, 'social-graphs.md');
    const userVerificationPath = join(this.socialModulePath, 'user-verification.md');
    const socialDiscoveryPath = join(this.socialModulePath, 'social-discovery.md');
    
    let hasProfileCustomization = false;
    let hasPrivacyControls = false;
    let hasVerificationSystems = false;
    let hasSocialGraphManagement = false;
    let hasConnectionSuggestions = false;
    let hasUserDiscovery = false;
    let hasTrustSystems = false;
    let hasRecommendationAlgorithms = false;
    
    if (existsSync(userProfilesPath)) {
      const content = readFileSync(userProfilesPath, 'utf-8').toLowerCase();
      hasProfileCustomization = content.includes('customization') || content.includes('customize');
      hasPrivacyControls = content.includes('privacy') && content.includes('control');
    }
    
    if (existsSync(socialGraphsPath)) {
      const content = readFileSync(socialGraphsPath, 'utf-8').toLowerCase();
      hasSocialGraphManagement = content.includes('relationship') || content.includes('friend') || content.includes('follow');
      hasConnectionSuggestions = content.includes('suggestion') || content.includes('recommend');
    }
    
    if (existsSync(userVerificationPath)) {
      const content = readFileSync(userVerificationPath, 'utf-8').toLowerCase();
      hasVerificationSystems = content.includes('verification') || content.includes('identity');
      hasTrustSystems = content.includes('trust') || content.includes('authenticity');
    }
    
    if (existsSync(socialDiscoveryPath)) {
      const content = readFileSync(socialDiscoveryPath, 'utf-8').toLowerCase();
      hasUserDiscovery = content.includes('discovery') || content.includes('find');
      hasRecommendationAlgorithms = content.includes('algorithm') || content.includes('recommendation');
    }
    
    return {
      hasProfileCustomization,
      hasPrivacyControls,
      hasVerificationSystems,
      hasSocialGraphManagement,
      hasConnectionSuggestions,
      hasUserDiscovery,
      hasTrustSystems,
      hasRecommendationAlgorithms
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

  private getEmptyTemplateContent(): SocialTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationGuidance: false,
      hasDataModels: false,
      hasIntegrationPatterns: false,
      hasSecurityConsiderations: false,
      hasUserExperiencePatterns: false,
      hasPerformanceOptimization: false,
      hasTestingStrategy: false,
      hasRealWorldConsiderations: false,
      hasCodeExamples: false
    };
  }
}