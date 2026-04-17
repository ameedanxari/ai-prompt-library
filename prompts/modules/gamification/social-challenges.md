# Social Challenges Template

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

This template provides comprehensive patterns for implementing social challenge systems that enable team competitions, collaborative goals, and community-driven engagement. It covers challenge creation, team formation, progress tracking, and social interaction mechanics to foster collaboration and healthy competition among users.

## Context

Social challenges transform individual activities into collaborative experiences, leveraging social dynamics to increase engagement and retention. A well-designed social challenge system creates opportunities for users to connect, compete, and collaborate while achieving shared goals. This template addresses the complexity of building scalable social challenge systems that support various challenge types, team dynamics, and social interaction patterns while maintaining fairness and preventing abuse.

## Instructions

1. **Setup Social Challenge Infrastructure**: Configure challenge types, team management, and participation tracking
2. **Implement Challenge Creation System**: Build comprehensive challenge definition and configuration
3. **Add Team Formation Mechanics**: Enable team creation, joining, and management workflows
4. **Configure Progress Tracking**: Implement individual and team progress monitoring
5. **Enable Social Interactions**: Add communication, encouragement, and collaboration features
6. **Add Competition Elements**: Build leaderboards, rankings, and competitive mechanics
7. **Test Challenge Fairness**: Validate challenge balance and anti-cheating measures

## Examples

### Example 1: Social Challenge Service
```typescript
interface SocialChallengeService {
  createChallenge(challenge: ChallengeDefinition): Promise<SocialChallenge>;
  joinChallenge(userId: string, challengeId: string, teamId?: string): Promise<Participation>;
  updateProgress(userId: string, challengeId: string, progress: ProgressUpdate): Promise<void>;
  getTeamProgress(teamId: string, challengeId: string): Promise<TeamProgress>;
  getChallengeLeaderboard(challengeId: string): Promise<ChallengeLeaderboard>;
}

const challengeService = new SocialChallengeService();
const challenge = await challengeService.createChallenge({
  name: 'Summer Fitness Challenge',
  type: 'team_competition',
  duration: '30d',
  maxParticipants: 100,
  teamSize: { min: 3, max: 5 },
  goals: [
    { type: 'steps', target: 10000, frequency: 'daily' },
    { type: 'workouts', target: 20, frequency: 'total' }
  ]
});
```

### Example 2: Team Formation System
```typescript
interface TeamFormationSystem {
  createTeam(challengeId: string, teamData: TeamCreationData): Promise<ChallengeTeam>;
  joinTeam(userId: string, teamId: string): Promise<TeamMembership>;
  inviteToTeam(teamId: string, inviterId: string, inviteeId: string): Promise<TeamInvitation>;
  autoMatchTeams(challengeId: string, preferences: MatchingPreferences): Promise<TeamSuggestion[]>;
}

const team = await teamFormation.createTeam('challenge-123', {
  name: 'Fitness Warriors',
  description: 'Dedicated to crushing our fitness goals together!',
  isPublic: true,
  tags: ['fitness', 'motivation', 'beginners-welcome'],
  targetSize: 4
});
```
### Example 3: Challenge Progress Tracking
```typescript
interface ChallengeProgressTracker {
  recordProgress(participation: ParticipationProgress): Promise<ProgressEntry>;
  getIndividualProgress(userId: string, challengeId: string): Promise<IndividualProgress>;
  getTeamProgress(teamId: string, challengeId: string): Promise<TeamProgress>;
  calculateRankings(challengeId: string): Promise<ChallengeRankings>;
}

const progressUpdate: ParticipationProgress = {
  userId: 'user-123',
  challengeId: 'challenge-456',
  teamId: 'team-789',
  progressData: {
    steps: 12500,
    workouts: 1,
    timestamp: new Date()
  },
  evidence: {
    type: 'fitness_tracker',
    source: 'fitbit',
    verified: true
  }
};
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableSocialChallenges | Enable social challenge system | boolean | No | true |
| enableTeamFormation | Enable team creation and joining | boolean | No | true |
| enableAutoMatching | Enable automatic team matching | boolean | No | false |
| maxChallengeParticipants | Maximum participants per challenge | number | No | 1000 |
| maxTeamSize | Maximum team size | number | No | 10 |
| enableChallengeChat | Enable team and challenge chat | boolean | No | true |
| enableProgressSharing | Enable progress sharing and updates | boolean | No | true |
| challengeDurationLimit | Maximum challenge duration in days | number | No | 365 |

## Expected Output

This template will produce:
- **Challenge Creation System**: Comprehensive challenge definition and configuration tools
- **Team Formation Mechanics**: Team creation, joining, and management workflows
- **Progress Tracking System**: Individual and team progress monitoring with verification
- **Social Interaction Features**: Communication, encouragement, and collaboration tools
- **Competition Elements**: Leaderboards, rankings, and competitive mechanics
- **Challenge Management**: Admin tools for challenge oversight and moderation
- **Analytics Dashboard**: Challenge performance and engagement metrics
- **Notification System**: Challenge updates, progress alerts, and social notifications

## Implementation Patterns

### Social Challenge Architecture

```typescript
// Core Social Challenge Architecture
interface SocialChallengeCore {
  challengeManager: ChallengeManager;
  teamFormation: TeamFormationSystem;
  progressTracker: ChallengeProgressTracker;
  socialInteraction: ChallengeSocialSystem;
  competitionEngine: ChallengeCompetitionEngine;
  moderationSystem: ChallengeModerationSystem;
}

interface SocialChallenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  
  // Challenge configuration
  goals: ChallengeGoal[];
  rules: ChallengeRule[];
  duration: ChallengeDuration;
  
  // Participation settings
  maxParticipants: number;
  teamSettings: TeamSettings;
  joinSettings: JoinSettings;
  
  // Social features
  enableChat: boolean;
  enableProgressSharing: boolean;
  enableEncouragement: boolean;
  
  // Competition settings
  competitionType: 'individual' | 'team' | 'mixed';
  rankingMethod: RankingMethod;
  rewards: ChallengeReward[];
  
  // Status and metadata
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  createdBy: string;
  createdAt: Date;
  startDate: Date;
  endDate: Date;
  
  // Statistics
  participantCount: number;
  teamCount: number;
  completionRate: number;
}

interface ChallengeTeam {
  id: string;
  challengeId: string;
  name: string;
  description?: string;
  
  // Team composition
  members: TeamMember[];
  captain: string;
  maxSize: number;
  currentSize: number;
  
  // Team settings
  isPublic: boolean;
  joinRequiresApproval: boolean;
  tags: string[];
  
  // Team progress
  totalProgress: Record<string, number>;
  averageProgress: Record<string, number>;
  rank: number;
  
  // Social features
  chatEnabled: boolean;
  lastActivity: Date;
  
  // Status
  status: 'forming' | 'active' | 'completed' | 'disbanded';
  createdAt: Date;
}

interface TeamMember {
  userId: string;
  role: 'captain' | 'member';
  joinedAt: Date;
  
  // Member progress
  individualProgress: Record<string, number>;
  contributionScore: number;
  
  // Social engagement
  messagesCount: number;
  encouragementsGiven: number;
  encouragementsReceived: number;
  
  // Status
  isActive: boolean;
  lastSeen: Date;
}
```

**Challenge Management Implementation**
```typescript
class ChallengeManager {
  private challengeStore: ChallengeStore;
  private participationStore: ParticipationStore;
  private progressTracker: ChallengeProgressTracker;
  private notificationService: NotificationService;

  async createChallenge(definition: ChallengeDefinition): Promise<SocialChallenge> {
    // Validate challenge definition
    const validation = await this.validateChallengeDefinition(definition);
    if (!validation.valid) {
      throw new Error(`Invalid challenge definition: ${validation.errors.join(', ')}`);
    }

    // Create challenge
    const challenge: SocialChallenge = {
      id: this.generateChallengeId(),
      name: definition.name,
      description: definition.description,
      type: definition.type,
      goals: definition.goals,
      rules: definition.rules || [],
      duration: definition.duration,
      maxParticipants: definition.maxParticipants || 1000,
      teamSettings: definition.teamSettings || this.getDefaultTeamSettings(),
      joinSettings: definition.joinSettings || this.getDefaultJoinSettings(),
      enableChat: definition.enableChat ?? true,
      enableProgressSharing: definition.enableProgressSharing ?? true,
      enableEncouragement: definition.enableEncouragement ?? true,
      competitionType: definition.competitionType || 'team',
      rankingMethod: definition.rankingMethod || 'total_progress',
      rewards: definition.rewards || [],
      status: 'draft',
      createdBy: definition.createdBy,
      createdAt: new Date(),
      startDate: definition.startDate,
      endDate: definition.endDate,
      participantCount: 0,
      teamCount: 0,
      completionRate: 0
    };

    // Save challenge
    await this.challengeStore.save(challenge);

    // Schedule challenge start/end
    await this.scheduleChallengeEvents(challenge);

    // Log challenge creation
    await this.analyticsLogger.logChallengeCreation(challenge);

    return challenge;
  }

  async joinChallenge(
    userId: string, 
    challengeId: string, 
    options: JoinChallengeOptions = {}
  ): Promise<Participation> {
    const challenge = await this.challengeStore.findById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Validate join eligibility
    const eligibility = await this.checkJoinEligibility(userId, challenge);
    if (!eligibility.eligible) {
      throw new Error(`Cannot join challenge: ${eligibility.reason}`);
    }

    // Handle team assignment
    let teamId = options.teamId;
    if (challenge.teamSettings.required && !teamId) {
      if (options.createTeam) {
        const team = await this.createTeamForUser(userId, challenge, options.teamData);
        teamId = team.id;
      } else if (challenge.teamSettings.autoAssign) {
        const assignment = await this.autoAssignToTeam(userId, challenge);
        teamId = assignment.teamId;
      } else {
        throw new Error('Team assignment required');
      }
    }

    // Create participation record
    const participation: Participation = {
      id: this.generateParticipationId(),
      userId,
      challengeId,
      teamId,
      joinedAt: new Date(),
      status: 'active',
      progress: this.initializeProgress(challenge.goals),
      rank: 0,
      contributionScore: 0,
      socialEngagement: {
        messagesCount: 0,
        encouragementsGiven: 0,
        encouragementsReceived: 0
      }
    };

    // Save participation
    await this.participationStore.save(participation);

    // Update challenge statistics
    await this.updateChallengeStats(challengeId);

    // Add to team if applicable
    if (teamId) {
      await this.addMemberToTeam(teamId, userId);
    }

    // Send welcome notification
    await this.notificationService.sendChallengeWelcome(userId, challenge);

    // Log participation
    await this.analyticsLogger.logChallengeJoin(participation);

    return participation;
  }

  private async checkJoinEligibility(
    userId: string, 
    challenge: SocialChallenge
  ): Promise<EligibilityCheck> {
    // Check challenge status
    if (challenge.status !== 'active') {
      return { eligible: false, reason: 'Challenge is not active' };
    }

    // Check start/end dates
    const now = new Date();
    if (now < challenge.startDate) {
      return { eligible: false, reason: 'Challenge has not started yet' };
    }
    if (now > challenge.endDate) {
      return { eligible: false, reason: 'Challenge has ended' };
    }

    // Check participant limit
    if (challenge.participantCount >= challenge.maxParticipants) {
      return { eligible: false, reason: 'Challenge is full' };
    }

    // Check if already participating
    const existingParticipation = await this.participationStore.findByUserAndChallenge(
      userId, 
      challenge.id
    );
    if (existingParticipation) {
      return { eligible: false, reason: 'Already participating in challenge' };
    }

    // Check join requirements
    if (challenge.joinSettings.requiresApproval) {
      const approval = await this.checkJoinApproval(userId, challenge.id);
      if (!approval.approved) {
        return { eligible: false, reason: 'Join approval required' };
      }
    }

    // Check user eligibility criteria
    if (challenge.joinSettings.eligibilityCriteria) {
      const criteriaCheck = await this.checkEligibilityCriteria(
        userId, 
        challenge.joinSettings.eligibilityCriteria
      );
      if (!criteriaCheck.meets) {
        return { eligible: false, reason: criteriaCheck.reason };
      }
    }

    return { eligible: true };
  }
}
```

### Team Formation System Implementation

```typescript
class TeamFormationSystem {
  private teamStore: TeamStore;
  private membershipStore: TeamMembershipStore;
  private invitationService: TeamInvitationService;
  private matchingEngine: TeamMatchingEngine;

  async createTeam(
    challengeId: string, 
    creatorId: string, 
    teamData: TeamCreationData
  ): Promise<ChallengeTeam> {
    const challenge = await this.challengeStore.findById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Validate team creation
    const validation = await this.validateTeamCreation(creatorId, challenge, teamData);
    if (!validation.valid) {
      throw new Error(`Team creation failed: ${validation.errors.join(', ')}`);
    }

    // Create team
    const team: ChallengeTeam = {
      id: this.generateTeamId(),
      challengeId,
      name: teamData.name,
      description: teamData.description,
      members: [],
      captain: creatorId,
      maxSize: Math.min(teamData.maxSize || challenge.teamSettings.maxSize, challenge.teamSettings.maxSize),
      currentSize: 0,
      isPublic: teamData.isPublic ?? true,
      joinRequiresApproval: teamData.joinRequiresApproval ?? false,
      tags: teamData.tags || [],
      totalProgress: this.initializeTeamProgress(challenge.goals),
      averageProgress: this.initializeTeamProgress(challenge.goals),
      rank: 0,
      chatEnabled: teamData.chatEnabled ?? challenge.enableChat,
      lastActivity: new Date(),
      status: 'forming',
      createdAt: new Date()
    };

    // Save team
    await this.teamStore.save(team);

    // Add creator as captain
    await this.addTeamMember(team.id, creatorId, 'captain');

    // Log team creation
    await this.analyticsLogger.logTeamCreation(team);

    return team;
  }

  async joinTeam(userId: string, teamId: string): Promise<TeamMembership> {
    const team = await this.teamStore.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Validate join eligibility
    const eligibility = await this.checkTeamJoinEligibility(userId, team);
    if (!eligibility.eligible) {
      throw new Error(`Cannot join team: ${eligibility.reason}`);
    }

    // Handle approval process
    if (team.joinRequiresApproval) {
      const request = await this.createJoinRequest(userId, teamId);
      await this.notificationService.notifyTeamCaptain(team.captain, {
        type: 'team_join_request',
        teamId,
        requesterId: userId,
        requestId: request.id
      });
      return { status: 'pending_approval', requestId: request.id };
    }

    // Add member directly
    const membership = await this.addTeamMember(teamId, userId, 'member');

    // Update team statistics
    await this.updateTeamStats(teamId);

    // Notify team members
    await this.notificationService.notifyTeamMembers(teamId, {
      type: 'new_member_joined',
      newMemberId: userId,
      teamId
    });

    return membership;
  }

  async suggestTeams(
    userId: string, 
    challengeId: string, 
    preferences: TeamMatchingPreferences
  ): Promise<TeamSuggestion[]> {
    const challenge = await this.challengeStore.findById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Get user profile for matching
    const userProfile = await this.getUserProfile(userId);
    
    // Find available teams
    const availableTeams = await this.teamStore.findAvailableTeams(challengeId, {
      hasSpace: true,
      isPublic: true,
      status: 'forming'
    });

    // Calculate compatibility scores
    const suggestions: TeamSuggestion[] = [];
    for (const team of availableTeams) {
      const compatibility = await this.matchingEngine.calculateCompatibility(
        userProfile,
        team,
        preferences
      );

      if (compatibility.score >= preferences.minCompatibilityScore) {
        suggestions.push({
          team,
          compatibilityScore: compatibility.score,
          matchingFactors: compatibility.factors,
          estimatedFit: compatibility.fit
        });
      }
    }

    // Sort by compatibility score
    suggestions.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    // Limit results
    return suggestions.slice(0, preferences.maxSuggestions || 10);
  }

  private async addTeamMember(
    teamId: string, 
    userId: string, 
    role: 'captain' | 'member'
  ): Promise<TeamMembership> {
    const team = await this.teamStore.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // Create membership
    const membership: TeamMembership = {
      id: this.generateMembershipId(),
      teamId,
      userId,
      role,
      joinedAt: new Date(),
      individualProgress: this.initializeProgress(team.challengeId),
      contributionScore: 0,
      messagesCount: 0,
      encouragementsGiven: 0,
      encouragementsReceived: 0,
      isActive: true,
      lastSeen: new Date()
    };

    // Save membership
    await this.membershipStore.save(membership);

    // Update team member list
    team.members.push({
      userId,
      role,
      joinedAt: new Date(),
      individualProgress: membership.individualProgress,
      contributionScore: 0,
      messagesCount: 0,
      encouragementsGiven: 0,
      encouragementsReceived: 0,
      isActive: true,
      lastSeen: new Date()
    });
    team.currentSize = team.members.length;

    // Update team status if needed
    if (team.status === 'forming' && team.currentSize >= team.maxSize) {
      team.status = 'active';
    }

    await this.teamStore.save(team);

    return membership;
  }
}
```

## Integration Points

### User Analytics Integration
```typescript
interface SocialChallengeAnalyticsIntegration {
  trackChallengeParticipation(participation: Participation): Promise<void>;
  trackTeamFormation(team: ChallengeTeam): Promise<void>;
  trackSocialInteraction(interaction: SocialInteraction): Promise<void>;
  generateEngagementMetrics(challengeId: string): Promise<ChallengeEngagementMetrics>;
}

class SocialChallengeAnalyticsService {
  async generateChallengeReport(challengeId: string): Promise<ChallengeReport> {
    return {
      participationMetrics: await this.getParticipationMetrics(challengeId),
      teamMetrics: await this.getTeamMetrics(challengeId),
      socialEngagementMetrics: await this.getSocialEngagementMetrics(challengeId),
      progressMetrics: await this.getProgressMetrics(challengeId),
      completionMetrics: await this.getCompletionMetrics(challengeId)
    };
  }

  async trackSocialEngagement(userId: string, challengeId: string): Promise<void> {
    const engagement = await this.getUserSocialEngagement(userId, challengeId);
    
    await this.analyticsService.trackEvent(userId, {
      eventType: 'social_challenge_engagement',
      properties: {
        challengeId,
        teamId: engagement.teamId,
        messagesCount: engagement.messagesCount,
        encouragementsGiven: engagement.encouragementsGiven,
        encouragementsReceived: engagement.encouragementsReceived,
        socialScore: engagement.socialScore
      }
    });
  }
}
```

### Notification System Integration
```typescript
interface SocialChallengeNotificationService {
  notifyChallengeStart(challengeId: string): Promise<void>;
  notifyTeamProgress(teamId: string, milestone: ProgressMilestone): Promise<void>;
  notifyEncouragement(fromUserId: string, toUserId: string, message: string): Promise<void>;
  notifyRankingChange(userId: string, oldRank: number, newRank: number): Promise<void>;
}

class SocialChallengeNotificationHandler {
  async handleProgressUpdate(event: ProgressUpdateEvent): Promise<void> {
    const { userId, challengeId, teamId, progress } = event;
    
    // Notify team members of progress
    if (teamId) {
      await this.notificationService.notifyTeamMembers(teamId, {
        type: 'team_member_progress',
        message: `${await this.getUserName(userId)} made progress on the challenge!`,
        data: { userId, progress }
      });
    }

    // Check for milestones
    const milestones = await this.checkProgressMilestones(userId, challengeId, progress);
    for (const milestone of milestones) {
      await this.notifyMilestoneAchievement(userId, milestone);
    }
  }

  async scheduleEncouragementReminders(challengeId: string): Promise<void> {
    const inactiveParticipants = await this.getInactiveParticipants(challengeId, { days: 3 });
    
    for (const participant of inactiveParticipants) {
      if (participant.teamId) {
        // Notify team members to encourage inactive member
        await this.notificationService.notifyTeamMembers(participant.teamId, {
          type: 'encourage_teammate',
          message: `${participant.userName} could use some encouragement!`,
          data: { participantId: participant.userId }
        });
      }
    }
  }
}
```

## Security Considerations

### Anti-Cheating Protection
```typescript
interface SocialChallengeSecurityService {
  validateProgressUpdate(update: ProgressUpdate): Promise<ValidationResult>;
  detectSuspiciousActivity(challengeId: string): Promise<SuspiciousActivity[]>;
  validateTeamFormation(team: ChallengeTeam): Promise<TeamValidation>;
  monitorChallengeIntegrity(challengeId: string): Promise<IntegrityCheck>;
}

class SocialChallengeSecurityManager {
  async validateProgressUpdate(update: ProgressUpdate): Promise<ValidationResult> {
    const checks: Promise<CheckResult>[] = [
      this.checkProgressRealism(update),
      this.checkUpdateFrequency(update.userId, update.challengeId),
      this.validateProgressEvidence(update.evidence),
      this.checkForProgressManipulation(update)
    ];

    const results = await Promise.all(checks);
    const failedChecks = results.filter(result => !result.passed);

    if (failedChecks.length > 0) {
      await this.flagSuspiciousActivity(update.userId, update.challengeId, failedChecks);
      return {
        valid: false,
        reason: 'Progress update failed security validation',
        details: failedChecks
      };
    }

    return { valid: true };
  }

  private async checkProgressRealism(update: ProgressUpdate): Promise<CheckResult> {
    // Check if progress values are realistic
    const userHistory = await this.getUserProgressHistory(update.userId);
    const averageProgress = this.calculateAverageProgress(userHistory);
    
    // Flag if progress is significantly higher than user's typical performance
    const progressIncrease = this.calculateProgressIncrease(update, averageProgress);
    if (progressIncrease > this.config.maxRealisticIncrease) {
      return {
        passed: false,
        reason: 'Progress increase exceeds realistic limits',
        severity: 'high'
      };
    }

    return { passed: true };
  }

  private async validateProgressEvidence(evidence: ProgressEvidence): Promise<CheckResult> {
    if (!evidence) {
      return { passed: false, reason: 'No evidence provided' };
    }

    // Validate evidence source
    const sourceValidation = await this.validateEvidenceSource(evidence.source);
    if (!sourceValidation.valid) {
      return {
        passed: false,
        reason: `Invalid evidence source: ${sourceValidation.reason}`
      };
    }

    // Check evidence authenticity
    const authenticityCheck = await this.checkEvidenceAuthenticity(evidence);
    if (!authenticityCheck.authentic) {
      return {
        passed: false,
        reason: 'Evidence authenticity check failed',
        severity: 'critical'
      };
    }

    return { passed: true };
  }

  async preventTeamCollusion(challengeId: string): Promise<void> {
    const teams = await this.teamStore.findByChallengeId(challengeId);
    
    for (const team of teams) {
      // Check for suspicious team formation patterns
      const collusionCheck = await this.checkTeamCollusion(team);
      if (collusionCheck.suspicious) {
        await this.flagTeamForReview(team.id, collusionCheck.reasons);
      }

      // Monitor team communication for gaming attempts
      if (team.chatEnabled) {
        await this.monitorTeamCommunication(team.id);
      }
    }
  }
}
```

### Data Privacy and Protection
```typescript
class SocialChallengePrivacyManager {
  async anonymizeProgressData(challengeId: string): Promise<void> {
    const participants = await this.participationStore.findByChallengeId(challengeId);
    
    for (const participant of participants) {
      // Remove personally identifiable information from progress data
      const anonymizedProgress = await this.anonymizeProgress(participant.progress);
      await this.progressStore.updateAnonymizedData(participant.id, anonymizedProgress);
    }
  }

  async handleDataDeletionRequest(userId: string): Promise<void> {
    // Remove user from all active challenges
    const activeParticipations = await this.participationStore.findActiveByUserId(userId);
    
    for (const participation of activeParticipations) {
      await this.removeUserFromChallenge(userId, participation.challengeId);
    }

    // Anonymize historical challenge data
    await this.anonymizeUserChallengeHistory(userId);
  }

  async enforcePrivacySettings(userId: string, settings: PrivacySettings): Promise<void> {
    // Update progress visibility
    if (!settings.shareProgress) {
      await this.hideUserProgress(userId);
    }

    // Update social interaction visibility
    if (!settings.allowEncouragement) {
      await this.disableEncouragementForUser(userId);
    }

    // Update team visibility
    if (!settings.showInTeamDirectory) {
      await this.hideUserFromTeamDirectory(userId);
    }
  }
}
```

## Testing Considerations

### Challenge System Testing
```typescript
describe('Social Challenge System', () => {
  describe('Challenge Creation', () => {
    it('should create challenge with valid configuration', async () => {
      const challenge = await challengeManager.createChallenge({
        name: 'Test Challenge',
        type: 'team_competition',
        duration: '7d',
        goals: [{ type: 'steps', target: 10000 }]
      });

      expect(challenge.id).toBeDefined();
      expect(challenge.status).toBe('draft');
    });

    it('should validate challenge configuration', async () => {
      await expect(challengeManager.createChallenge({
        name: '',
        type: 'invalid_type',
        duration: '0d'
      })).rejects.toThrow('Invalid challenge definition');
    });
  });

  describe('Team Formation', () => {
    it('should create team and add captain', async () => {
      const team = await teamFormation.createTeam('challenge-1', 'user-1', {
        name: 'Test Team',
        maxSize: 5
      });

      expect(team.captain).toBe('user-1');
      expect(team.currentSize).toBe(1);
    });

    it('should suggest compatible teams', async () => {
      const suggestions = await teamFormation.suggestTeams('user-1', 'challenge-1', {
        minCompatibilityScore: 0.7
      });

      expect(suggestions).toBeInstanceOf(Array);
      suggestions.forEach(suggestion => {
        expect(suggestion.compatibilityScore).toBeGreaterThanOrEqual(0.7);
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should record and validate progress updates', async () => {
      const progress = await progressTracker.recordProgress({
        userId: 'user-1',
        challengeId: 'challenge-1',
        progressData: { steps: 8000 },
        evidence: { type: 'fitness_tracker', verified: true }
      });

      expect(progress.validated).toBe(true);
    });

    it('should detect suspicious progress patterns', async () => {
      const validation = await securityManager.validateProgressUpdate({
        userId: 'user-1',
        challengeId: 'challenge-1',
        progressData: { steps: 100000 }, // Unrealistic
        evidence: { type: 'manual', verified: false }
      });

      expect(validation.valid).toBe(false);
    });
  });
});
```
