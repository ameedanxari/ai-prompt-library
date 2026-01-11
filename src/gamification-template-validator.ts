import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface GamificationSystemsTemplateStructure {
  hasPointSystemsTemplate: boolean;
  hasAchievementSystemsTemplate: boolean;
  hasLeaderboardsTemplate: boolean;
  hasProgressionSystemsTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface SocialGamificationTemplateStructure {
  hasSocialChallengesTemplate: boolean;
  hasRewardSystemsTemplate: boolean;
  hasStreakTrackingTemplate: boolean;
  hasEngagementPsychologyTemplate: boolean;
  allTemplatesHaveRequiredSections: boolean;
  templatesHaveImplementationPatterns: boolean;
  templatesHaveConfigurationExamples: boolean;
  templatesHaveIntegrationPoints: boolean;
  templatesHaveDataModels: boolean;
}

export interface GamificationTemplateContent {
  hasPurposeSection: boolean;
  hasContextSection: boolean;
  hasImplementationPatterns: boolean;
  hasConfigurationParameters: boolean;
  hasIntegrationPoints: boolean;
  hasTestingConsiderations: boolean;
  hasSecurityConsiderations: boolean;
  hasCodeExamples: boolean;
  hasDataModels: boolean;
}

export class GamificationTemplateValidator {
  private gamificationModulePath: string;

  constructor(gamificationModulePath: string = 'prompts/modules/gamification') {
    this.gamificationModulePath = gamificationModulePath;
  }

  validateGamificationSystemsTemplates(): GamificationSystemsTemplateStructure {
    const gamificationSystemsTemplates = [
      'point-systems.md',
      'achievement-systems.md',
      'leaderboards.md',
      'progression-systems.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.gamificationModulePath, filename));

    const hasPointSystemsTemplate = templateExists('point-systems.md');
    const hasAchievementSystemsTemplate = templateExists('achievement-systems.md');
    const hasLeaderboardsTemplate = templateExists('leaderboards.md');
    const hasProgressionSystemsTemplate = templateExists('progression-systems.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of gamificationSystemsTemplates) {
      const templatePath = join(this.gamificationModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
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

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasPointSystemsTemplate,
      hasAchievementSystemsTemplate,
      hasLeaderboardsTemplate,
      hasProgressionSystemsTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateSocialGamificationTemplates(): SocialGamificationTemplateStructure {
    const socialGamificationTemplates = [
      'social-challenges.md',
      'reward-systems.md',
      'streak-tracking.md',
      'engagement-psychology.md'
    ];

    const templateExists = (filename: string) =>
      existsSync(join(this.gamificationModulePath, filename));

    const hasSocialChallengesTemplate = templateExists('social-challenges.md');
    const hasRewardSystemsTemplate = templateExists('reward-systems.md');
    const hasStreakTrackingTemplate = templateExists('streak-tracking.md');
    const hasEngagementPsychologyTemplate = templateExists('engagement-psychology.md');

    // Validate content quality for existing templates
    let allTemplatesHaveRequiredSections = true;
    let templatesHaveImplementationPatterns = true;
    let templatesHaveConfigurationExamples = true;
    let templatesHaveIntegrationPoints = true;
    let templatesHaveDataModels = true;

    for (const template of socialGamificationTemplates) {
      const templatePath = join(this.gamificationModulePath, template);
      if (existsSync(templatePath)) {
        const content = this.validateTemplateContent(templatePath);

        if (!content.hasPurposeSection || !content.hasContextSection) {
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

        if (!content.hasDataModels) {
          templatesHaveDataModels = false;
        }
      }
    }

    return {
      hasSocialChallengesTemplate,
      hasRewardSystemsTemplate,
      hasStreakTrackingTemplate,
      hasEngagementPsychologyTemplate,
      allTemplatesHaveRequiredSections,
      templatesHaveImplementationPatterns,
      templatesHaveConfigurationExamples,
      templatesHaveIntegrationPoints,
      templatesHaveDataModels
    };
  }

  validateTemplateContent(templatePath: string): GamificationTemplateContent {
    if (!existsSync(templatePath)) {
      return this.getEmptyTemplateContent();
    }

    const content = readFileSync(templatePath, 'utf-8');

    return {
      hasPurposeSection: this.hasSection(content, 'Purpose'),
      hasContextSection: this.hasSection(content, 'Context'),
      hasImplementationPatterns: this.hasSection(content, 'Implementation Patterns') ||
        this.hasSection(content, 'Implementation') ||
        this.hasSection(content, 'Core.*Patterns'),
      hasConfigurationParameters: this.hasSection(content, 'Configuration') ||
        this.hasSection(content, 'Variables'),
      hasIntegrationPoints: this.hasSection(content, 'Integration Points') ||
        this.hasSection(content, 'Integration'),
      hasTestingConsiderations: this.hasSection(content, 'Testing Considerations') ||
        this.hasSection(content, 'Testing'),
      hasSecurityConsiderations: this.hasSecurityConsiderations(content),
      hasCodeExamples: this.hasCodeExamples(content),
      hasDataModels: this.hasDataModels(content)
    };
  }

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

  private hasSecurityConsiderations(content: string): boolean {
    const securityKeywords = [
      'security', 'fraud', 'validation', 'authentication', 'authorization',
      'sanitization', 'abuse', 'gaming', 'cheating', 'integrity',
      'anti-fraud', 'prevention', 'audit'
    ];

    const contentLower = content.toLowerCase();
    return securityKeywords.some(keyword => contentLower.includes(keyword));
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

  private getEmptyTemplateContent(): GamificationTemplateContent {
    return {
      hasPurposeSection: false,
      hasContextSection: false,
      hasImplementationPatterns: false,
      hasConfigurationParameters: false,
      hasIntegrationPoints: false,
      hasTestingConsiderations: false,
      hasSecurityConsiderations: false,
      hasCodeExamples: false,
      hasDataModels: false
    };
  }

  // Validate requirements 12.1, 12.2, 12.3, 12.4 for gamification systems
  validateGamificationSystemsRequirements(): {
    requirement_12_1: boolean; // Point earning, spending, and balance tracking
    requirement_12_2: boolean; // Badge creation and progress tracking
    requirement_12_3: boolean; // Ranking systems and social comparison
    requirement_12_4: boolean; // Level systems and skill trees
  } {
    const structure = this.validateGamificationSystemsTemplates();

    // Requirement 12.1: Point earning, spending, and balance tracking
    const requirement_12_1 = structure.hasPointSystemsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 12.2: Badge creation and progress tracking
    const requirement_12_2 = structure.hasAchievementSystemsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 12.3: Ranking systems and social comparison
    const requirement_12_3 = structure.hasLeaderboardsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 12.4: Level systems and skill trees
    const requirement_12_4 = structure.hasProgressionSystemsTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_12_1,
      requirement_12_2,
      requirement_12_3,
      requirement_12_4
    };
  }

  // Validate requirements 12.6, 12.7, 12.8, 12.10 for social gamification
  validateSocialGamificationRequirements(): {
    requirement_12_6: boolean; // Team competitions and collaborative goals
    requirement_12_7: boolean; // Reward catalogs and redemption mechanisms
    requirement_12_8: boolean; // Habit formation and streak rewards
    requirement_12_10: boolean; // Behavioral modification and motivation
  } {
    const structure = this.validateSocialGamificationTemplates();

    // Requirement 12.6: Team competitions and collaborative goals
    const requirement_12_6 = structure.hasSocialChallengesTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 12.7: Reward catalogs and redemption mechanisms
    const requirement_12_7 = structure.hasRewardSystemsTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 12.8: Habit formation and streak rewards
    const requirement_12_8 = structure.hasStreakTrackingTemplate &&
      structure.templatesHaveImplementationPatterns;

    // Requirement 12.10: Behavioral modification and motivation
    const requirement_12_10 = structure.hasEngagementPsychologyTemplate &&
      structure.templatesHaveImplementationPatterns;

    return {
      requirement_12_6,
      requirement_12_7,
      requirement_12_8,
      requirement_12_10
    };
  }

  // Validate gamification feature coverage
  validateGamificationFeatureCoverage(): {
    hasPointSystems: boolean;
    hasAchievementSystems: boolean;
    hasLeaderboards: boolean;
    hasProgressionSystems: boolean;
    hasSocialChallenges: boolean;
    hasRewardSystems: boolean;
    hasStreakTracking: boolean;
    hasEngagementPsychology: boolean;
  } {
    const pointSystemsPath = join(this.gamificationModulePath, 'point-systems.md');
    const achievementSystemsPath = join(this.gamificationModulePath, 'achievement-systems.md');
    const leaderboardsPath = join(this.gamificationModulePath, 'leaderboards.md');
    const progressionSystemsPath = join(this.gamificationModulePath, 'progression-systems.md');
    const socialChallengesPath = join(this.gamificationModulePath, 'social-challenges.md');
    const rewardSystemsPath = join(this.gamificationModulePath, 'reward-systems.md');
    const streakTrackingPath = join(this.gamificationModulePath, 'streak-tracking.md');
    const engagementPsychologyPath = join(this.gamificationModulePath, 'engagement-psychology.md');

    let hasPointSystems = false;
    let hasAchievementSystems = false;
    let hasLeaderboards = false;
    let hasProgressionSystems = false;
    let hasSocialChallenges = false;
    let hasRewardSystems = false;
    let hasStreakTracking = false;
    let hasEngagementPsychology = false;

    if (existsSync(pointSystemsPath)) {
      const content = readFileSync(pointSystemsPath, 'utf-8').toLowerCase();
      hasPointSystems = content.includes('point') && (content.includes('earning') || content.includes('spending'));
    }

    if (existsSync(achievementSystemsPath)) {
      const content = readFileSync(achievementSystemsPath, 'utf-8').toLowerCase();
      hasAchievementSystems = content.includes('achievement') && (content.includes('badge') || content.includes('progress'));
    }

    if (existsSync(leaderboardsPath)) {
      const content = readFileSync(leaderboardsPath, 'utf-8').toLowerCase();
      hasLeaderboards = content.includes('leaderboard') && (content.includes('ranking') || content.includes('competition'));
    }

    if (existsSync(progressionSystemsPath)) {
      const content = readFileSync(progressionSystemsPath, 'utf-8').toLowerCase();
      hasProgressionSystems = content.includes('progression') && (content.includes('level') || content.includes('skill'));
    }

    if (existsSync(socialChallengesPath)) {
      const content = readFileSync(socialChallengesPath, 'utf-8').toLowerCase();
      hasSocialChallenges = content.includes('social') && (content.includes('challenge') || content.includes('team'));
    }

    if (existsSync(rewardSystemsPath)) {
      const content = readFileSync(rewardSystemsPath, 'utf-8').toLowerCase();
      hasRewardSystems = content.includes('reward') && (content.includes('catalog') || content.includes('redemption'));
    }

    if (existsSync(streakTrackingPath)) {
      const content = readFileSync(streakTrackingPath, 'utf-8').toLowerCase();
      hasStreakTracking = content.includes('streak') && (content.includes('habit') || content.includes('tracking'));
    }

    if (existsSync(engagementPsychologyPath)) {
      const content = readFileSync(engagementPsychologyPath, 'utf-8').toLowerCase();
      hasEngagementPsychology = content.includes('engagement') && (content.includes('psychology') || content.includes('motivation'));
    }

    return {
      hasPointSystems,
      hasAchievementSystems,
      hasLeaderboards,
      hasProgressionSystems,
      hasSocialChallenges,
      hasRewardSystems,
      hasStreakTracking,
      hasEngagementPsychology
    };
  }
}