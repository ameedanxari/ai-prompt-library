# Content Moderation Template

## Purpose

This template provides comprehensive patterns for implementing content moderation systems, covering automated filtering, human moderation queues, AI-powered content analysis, and moderation workflow management for content management platforms.

## Context

Content moderation is critical for maintaining platform integrity, user safety, and regulatory compliance. A well-designed moderation system balances automated detection with human review, supports multiple content types, and provides transparent processes for content creators. This template addresses the complexity of building scalable, fair, and effective moderation systems that protect users while preserving legitimate content.

## Instructions

1. **Setup Moderation Pipeline**: Configure automated content scanning and classification
2. **Implement AI Moderation**: Build machine learning-based content analysis
3. **Add Human Review Queues**: Create moderation workflows and review interfaces
4. **Configure Policy Enforcement**: Implement content policy rules and actions
5. **Enable Appeals Process**: Add transparent appeal mechanisms
6. **Add Moderation Analytics**: Track moderation effectiveness and accuracy
7. **Test Moderation Accuracy**: Validate filtering effectiveness and false positive rates

## Examples

### Example 1: Content Moderation Service
```typescript
interface ContentModerationService {
  moderateContent(content: Content): Promise<ModerationResult>;
  submitToReview(contentId: string, reason: string): Promise<ReviewTicket>;
  processAppeal(appealId: string, decision: AppealDecision): Promise<AppealResult>;
  getModerationQueue(filters: QueueFilters): Promise<ModerationQueue>;
}

interface ModerationResult {
  contentId: string;
  decision: ModerationDecision;
  confidence: number;
  categories: ViolationCategory[];
  action: ModerationAction;
  requiresHumanReview: boolean;
}

const moderationService = new ContentModerationService();
const result = await moderationService.moderateContent({
  id: 'content-123',
  type: 'post',
  text: 'User generated content...',
  media: ['image-456']
});
```


### Example 2: Automated Content Classification
```typescript
interface ContentClassifier {
  classifyText(text: string): Promise<ClassificationResult>;
  classifyImage(imageUrl: string): Promise<ImageClassificationResult>;
  classifyVideo(videoUrl: string): Promise<VideoClassificationResult>;
}

const classifier = new ContentClassifier();
const classification = await classifier.classifyText('User post content');
console.log(classification.categories); // ['safe', 'informational']
console.log(classification.toxicityScore); // 0.05
```

### Example 3: Human Review Queue
```typescript
interface ReviewQueue {
  getNextItem(moderatorId: string): Promise<ReviewItem>;
  submitDecision(itemId: string, decision: ReviewDecision): Promise<void>;
  escalateItem(itemId: string, reason: string): Promise<void>;
  skipItem(itemId: string, reason: string): Promise<void>;
}

const queue = new ReviewQueue();
const item = await queue.getNextItem('moderator-123');
await queue.submitDecision(item.id, {
  action: 'approve',
  notes: 'Content meets community guidelines'
});
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableAutoModeration | Enable automated content filtering | boolean | No | true |
| enableHumanReview | Enable human moderation review | boolean | No | true |
| enableAppeals | Enable content moderation appeals | boolean | No | true |
| autoRemoveThreshold | Confidence threshold for auto-removal | number | No | 0.95 |
| humanReviewThreshold | Confidence threshold for human review | number | No | 0.7 |
| moderationCategories | Categories to detect | string[] | No | ["spam", "hate", "violence"] |
| maxReviewTime | Maximum time for human review (hours) | number | No | 24 |
| enableModerationAnalytics | Track moderation metrics | boolean | No | true |

## Expected Output

This template will produce:
- **Automated Filtering**: AI-powered content classification and filtering
- **Human Review System**: Moderation queues and review workflows
- **Policy Enforcement**: Configurable content policy rules and actions
- **Appeals Process**: Transparent appeal submission and review
- **Moderation Analytics**: Accuracy tracking and performance metrics
- **Escalation System**: Multi-tier moderation with escalation paths
- **Audit Trail**: Complete history of moderation actions
- **Moderator Tools**: Efficient interfaces for content review

## Implementation Patterns

### Moderation Pipeline Architecture

**Moderation Data Model**
```typescript
interface ModerationCase {
  id: string;
  contentId: string;
  contentType: ContentType;
  
  // Classification
  automatedClassification: AutomatedClassification;
  humanClassification?: HumanClassification;
  
  // Status
  status: ModerationStatus;
  priority: Priority;
  
  // Actions
  actionTaken?: ModerationAction;
  actionReason?: string;
  
  // Assignment
  assignedTo?: string;
  assignedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  reviewedAt?: Date;
  resolvedAt?: Date;
  
  // Appeal
  appealStatus?: AppealStatus;
  appealId?: string;
}

interface AutomatedClassification {
  categories: CategoryScore[];
  overallScore: number;
  confidence: number;
  modelVersion: string;
  processedAt: Date;
}

interface CategoryScore {
  category: ViolationCategory;
  score: number;
  confidence: number;
  details?: string;
}

type ViolationCategory = 
  | 'spam'
  | 'hate_speech'
  | 'harassment'
  | 'violence'
  | 'adult_content'
  | 'misinformation'
  | 'copyright'
  | 'illegal_activity'
  | 'self_harm'
  | 'other';

type ModerationStatus = 'pending' | 'in_review' | 'approved' | 'rejected' | 'escalated' | 'appealed';
type ModerationAction = 'approve' | 'remove' | 'restrict' | 'warn' | 'label' | 'age_gate';
```

**Moderation Service Implementation**
```typescript
class ContentModerationService {
  async moderateContent(content: Content): Promise<ModerationResult> {
    // Step 1: Automated classification
    const classification = await this.classifyContent(content);
    
    // Step 2: Determine action based on classification
    const decision = this.determineAction(classification);
    
    // Step 3: Create moderation case
    const moderationCase = await this.createModerationCase(content, classification, decision);
    
    // Step 4: Execute action if auto-actionable
    if (decision.autoAction && classification.confidence >= this.config.autoRemoveThreshold) {
      await this.executeAction(content.id, decision.action);
    }
    
    // Step 5: Queue for human review if needed
    if (decision.requiresHumanReview) {
      await this.queueForReview(moderationCase);
    }
    
    return {
      contentId: content.id,
      decision: decision.action,
      confidence: classification.confidence,
      categories: classification.categories.map(c => c.category),
      action: decision.action,
      requiresHumanReview: decision.requiresHumanReview
    };
  }

  private async classifyContent(content: Content): Promise<AutomatedClassification> {
    const classifications: CategoryScore[] = [];
    
    // Text classification
    if (content.text) {
      const textClassification = await this.textClassifier.classify(content.text);
      classifications.push(...textClassification.categories);
    }
    
    // Image classification
    if (content.images?.length > 0) {
      for (const image of content.images) {
        const imageClassification = await this.imageClassifier.classify(image);
        classifications.push(...imageClassification.categories);
      }
    }
    
    // Video classification
    if (content.videos?.length > 0) {
      for (const video of content.videos) {
        const videoClassification = await this.videoClassifier.classify(video);
        classifications.push(...videoClassification.categories);
      }
    }
    
    // Aggregate classifications
    const aggregated = this.aggregateClassifications(classifications);
    
    return {
      categories: aggregated,
      overallScore: this.calculateOverallScore(aggregated),
      confidence: this.calculateConfidence(aggregated),
      modelVersion: this.modelVersion,
      processedAt: new Date()
    };
  }

  private determineAction(classification: AutomatedClassification): ModerationDecision {
    const highestScore = Math.max(...classification.categories.map(c => c.score));
    const highestCategory = classification.categories.find(c => c.score === highestScore);
    
    // Auto-remove for high-confidence severe violations
    if (highestScore >= this.config.autoRemoveThreshold) {
      const severeCategories = ['violence', 'illegal_activity', 'self_harm', 'adult_content'];
      if (severeCategories.includes(highestCategory?.category || '')) {
        return {
          action: 'remove',
          autoAction: true,
          requiresHumanReview: false,
          reason: `High-confidence ${highestCategory?.category} violation`
        };
      }
    }
    
    // Queue for human review for medium-confidence violations
    if (highestScore >= this.config.humanReviewThreshold) {
      return {
        action: 'pending',
        autoAction: false,
        requiresHumanReview: true,
        reason: `Medium-confidence violation requires human review`
      };
    }
    
    // Auto-approve for low-risk content
    return {
      action: 'approve',
      autoAction: true,
      requiresHumanReview: false,
      reason: 'Content meets community guidelines'
    };
  }
}
```


### Human Review System

**Review Queue Implementation**
```typescript
interface ReviewQueueService {
  getQueue(moderatorId: string, filters?: QueueFilters): Promise<ReviewQueue>;
  assignItem(itemId: string, moderatorId: string): Promise<void>;
  submitDecision(itemId: string, decision: ReviewDecision): Promise<void>;
  escalateItem(itemId: string, escalation: EscalationRequest): Promise<void>;
}

interface ReviewQueue {
  items: ReviewItem[];
  totalCount: number;
  filters: QueueFilters;
  moderatorStats: ModeratorStats;
}

interface ReviewItem {
  id: string;
  moderationCaseId: string;
  content: ContentSnapshot;
  automatedClassification: AutomatedClassification;
  priority: Priority;
  assignedAt?: Date;
  deadline?: Date;
  context: ReviewContext;
}

class ReviewQueueService {
  async getQueue(moderatorId: string, filters?: QueueFilters): Promise<ReviewQueue> {
    // Get moderator's assigned items first
    const assignedItems = await this.getAssignedItems(moderatorId);
    
    // Get available items based on moderator's permissions
    const moderator = await this.getModerator(moderatorId);
    const availableItems = await this.getAvailableItems(moderator.permissions, filters);
    
    // Prioritize items
    const prioritizedItems = this.prioritizeItems([...assignedItems, ...availableItems]);
    
    return {
      items: prioritizedItems.slice(0, filters?.limit || 50),
      totalCount: prioritizedItems.length,
      filters: filters || {},
      moderatorStats: await this.getModeratorStats(moderatorId)
    };
  }

  async submitDecision(itemId: string, decision: ReviewDecision): Promise<void> {
    const item = await this.getReviewItem(itemId);
    const moderationCase = await this.getModerationCase(item.moderationCaseId);
    
    // Validate decision
    this.validateDecision(decision, moderationCase);
    
    // Record human classification
    moderationCase.humanClassification = {
      decision: decision.action,
      categories: decision.categories,
      notes: decision.notes,
      moderatorId: decision.moderatorId,
      reviewedAt: new Date()
    };
    
    // Update case status
    moderationCase.status = decision.action === 'approve' ? 'approved' : 'rejected';
    moderationCase.actionTaken = decision.action;
    moderationCase.actionReason = decision.notes;
    moderationCase.resolvedAt = new Date();
    
    await this.moderationCaseRepository.save(moderationCase);
    
    // Execute action on content
    await this.executeAction(moderationCase.contentId, decision.action);
    
    // Notify content author
    await this.notifyAuthor(moderationCase, decision);
    
    // Update moderator stats
    await this.updateModeratorStats(decision.moderatorId, decision);
    
    // Feed back to ML model for training
    await this.feedbackToModel(moderationCase);
  }

  async escalateItem(itemId: string, escalation: EscalationRequest): Promise<void> {
    const item = await this.getReviewItem(itemId);
    const moderationCase = await this.getModerationCase(item.moderationCaseId);
    
    // Update case status
    moderationCase.status = 'escalated';
    moderationCase.escalation = {
      reason: escalation.reason,
      escalatedBy: escalation.moderatorId,
      escalatedAt: new Date(),
      escalationLevel: this.determineEscalationLevel(escalation)
    };
    
    await this.moderationCaseRepository.save(moderationCase);
    
    // Assign to senior moderator or specialist
    await this.assignToEscalationQueue(moderationCase);
    
    // Notify escalation team
    await this.notifyEscalationTeam(moderationCase, escalation);
  }

  private prioritizeItems(items: ReviewItem[]): ReviewItem[] {
    return items.sort((a, b) => {
      // Priority order: deadline > severity > age
      if (a.deadline && b.deadline) {
        return a.deadline.getTime() - b.deadline.getTime();
      }
      if (a.deadline) return -1;
      if (b.deadline) return 1;
      
      // Severity based on classification score
      const aSeverity = Math.max(...a.automatedClassification.categories.map(c => c.score));
      const bSeverity = Math.max(...b.automatedClassification.categories.map(c => c.score));
      if (aSeverity !== bSeverity) {
        return bSeverity - aSeverity;
      }
      
      // Age (older items first)
      return new Date(a.assignedAt || 0).getTime() - new Date(b.assignedAt || 0).getTime();
    });
  }
}
```

### Appeals System

**Appeals Management**
```typescript
interface AppealService {
  submitAppeal(contentId: string, appeal: AppealSubmission): Promise<Appeal>;
  reviewAppeal(appealId: string, decision: AppealDecision): Promise<AppealResult>;
  getAppealStatus(appealId: string): Promise<AppealStatus>;
}

interface Appeal {
  id: string;
  contentId: string;
  moderationCaseId: string;
  
  // Submission
  submittedBy: string;
  submittedAt: Date;
  reason: string;
  evidence?: string[];
  
  // Review
  status: AppealStatus;
  reviewedBy?: string;
  reviewedAt?: Date;
  decision?: AppealDecision;
  decisionReason?: string;
  
  // Outcome
  originalAction: ModerationAction;
  finalAction?: ModerationAction;
}

class AppealService {
  async submitAppeal(contentId: string, appeal: AppealSubmission): Promise<Appeal> {
    const moderationCase = await this.getModerationCaseByContent(contentId);
    
    // Validate appeal eligibility
    await this.validateAppealEligibility(moderationCase, appeal.submittedBy);
    
    // Check for existing appeal
    const existingAppeal = await this.getExistingAppeal(moderationCase.id);
    if (existingAppeal && existingAppeal.status !== 'rejected') {
      throw new Error('An appeal is already pending for this content');
    }
    
    // Create appeal
    const newAppeal: Appeal = {
      id: this.generateAppealId(),
      contentId,
      moderationCaseId: moderationCase.id,
      submittedBy: appeal.submittedBy,
      submittedAt: new Date(),
      reason: appeal.reason,
      evidence: appeal.evidence,
      status: 'pending',
      originalAction: moderationCase.actionTaken!
    };
    
    await this.appealRepository.save(newAppeal);
    
    // Update moderation case
    moderationCase.appealStatus = 'pending';
    moderationCase.appealId = newAppeal.id;
    await this.moderationCaseRepository.save(moderationCase);
    
    // Queue for appeal review
    await this.queueForAppealReview(newAppeal);
    
    // Notify user
    await this.notifyAppealSubmitted(newAppeal);
    
    return newAppeal;
  }

  async reviewAppeal(appealId: string, decision: AppealDecision): Promise<AppealResult> {
    const appeal = await this.getAppeal(appealId);
    const moderationCase = await this.getModerationCase(appeal.moderationCaseId);
    
    // Update appeal
    appeal.status = decision.upheld ? 'rejected' : 'approved';
    appeal.reviewedBy = decision.reviewerId;
    appeal.reviewedAt = new Date();
    appeal.decision = decision;
    appeal.decisionReason = decision.reason;
    
    if (!decision.upheld) {
      // Appeal successful - reverse action
      appeal.finalAction = 'approve';
      await this.reverseAction(moderationCase.contentId, moderationCase.actionTaken!);
      
      // Update moderation case
      moderationCase.status = 'approved';
      moderationCase.actionTaken = 'approve';
    } else {
      appeal.finalAction = moderationCase.actionTaken;
    }
    
    moderationCase.appealStatus = appeal.status;
    
    await this.appealRepository.save(appeal);
    await this.moderationCaseRepository.save(moderationCase);
    
    // Notify user of decision
    await this.notifyAppealDecision(appeal);
    
    return {
      appealId: appeal.id,
      decision: appeal.status,
      finalAction: appeal.finalAction!,
      reason: decision.reason
    };
  }

  private async validateAppealEligibility(
    moderationCase: ModerationCase,
    userId: string
  ): Promise<void> {
    // Check if user is content owner
    const content = await this.contentRepository.findById(moderationCase.contentId);
    if (content.authorId !== userId) {
      throw new Error('Only content author can submit an appeal');
    }
    
    // Check appeal window
    const appealDeadline = new Date(moderationCase.resolvedAt!);
    appealDeadline.setDate(appealDeadline.getDate() + this.config.appealWindowDays);
    if (new Date() > appealDeadline) {
      throw new Error('Appeal window has expired');
    }
    
    // Check appeal limit
    const previousAppeals = await this.countUserAppeals(userId);
    if (previousAppeals >= this.config.maxAppealsPerUser) {
      throw new Error('Maximum appeal limit reached');
    }
  }
}
```

### Integration Points

**External System Integration**
```typescript
interface ModerationIntegration {
  reportToAuthorities(caseId: string, reportType: string): Promise<void>;
  syncWithExternalModeration(contentId: string): Promise<ExternalModerationResult>;
  exportModerationData(filters: ExportFilters): Promise<ExportResult>;
}

class ModerationIntegrationService implements ModerationIntegration {
  async reportToAuthorities(caseId: string, reportType: string): Promise<void> {
    const moderationCase = await this.getModerationCase(caseId);
    const content = await this.contentRepository.findById(moderationCase.contentId);
    
    // Prepare report
    const report = {
      caseId,
      contentType: content.type,
      violationType: moderationCase.automatedClassification.categories[0].category,
      timestamp: new Date(),
      evidence: await this.gatherEvidence(moderationCase),
      reportType
    };
    
    // Submit to appropriate authority
    await this.authorityReportingService.submit(report);
    
    // Log report
    await this.auditService.log({
      action: 'authority_report',
      caseId,
      reportType,
      timestamp: new Date()
    });
  }
}
```

### Security Considerations

**Moderation Security**
```typescript
interface ModerationSecurityService {
  validateModeratorAccess(moderatorId: string, caseId: string): Promise<boolean>;
  auditModerationAction(action: ModerationAuditEntry): Promise<void>;
  detectModerationAbuse(moderatorId: string): Promise<AbuseDetectionResult>;
}

class ModerationSecurity implements ModerationSecurityService {
  async validateModeratorAccess(moderatorId: string, caseId: string): Promise<boolean> {
    const moderator = await this.getModerator(moderatorId);
    const moderationCase = await this.getModerationCase(caseId);
    
    // Check role permissions
    if (!this.hasPermission(moderator.role, moderationCase.contentType)) {
      return false;
    }
    
    // Check for conflicts of interest
    const content = await this.contentRepository.findById(moderationCase.contentId);
    if (content.authorId === moderatorId) {
      return false;
    }
    
    // Check geographic restrictions
    if (moderationCase.region && !moderator.regions.includes(moderationCase.region)) {
      return false;
    }
    
    return true;
  }

  async detectModerationAbuse(moderatorId: string): Promise<AbuseDetectionResult> {
    const recentActions = await this.getRecentActions(moderatorId, 24);
    
    // Check for unusual patterns
    const approvalRate = this.calculateApprovalRate(recentActions);
    const avgReviewTime = this.calculateAvgReviewTime(recentActions);
    const overturnRate = await this.calculateOverturnRate(moderatorId);
    
    const flags: string[] = [];
    
    if (approvalRate > 0.95 || approvalRate < 0.05) {
      flags.push('unusual_approval_rate');
    }
    
    if (avgReviewTime < 5000) { // Less than 5 seconds
      flags.push('suspiciously_fast_reviews');
    }
    
    if (overturnRate > 0.3) {
      flags.push('high_overturn_rate');
    }
    
    return {
      moderatorId,
      flags,
      requiresReview: flags.length > 0,
      metrics: { approvalRate, avgReviewTime, overturnRate }
    };
  }
}
```

### Testing Considerations

**Moderation System Testing**
```typescript
describe('ContentModerationService', () => {
  describe('moderateContent', () => {
    it('should auto-remove high-confidence violations', async () => {
      const content = createTestContent({ text: 'Clearly violating content' });
      mockClassifier.classify.mockResolvedValue({
        categories: [{ category: 'violence', score: 0.98, confidence: 0.95 }],
        overallScore: 0.98,
        confidence: 0.95
      });
      
      const result = await moderationService.moderateContent(content);
      
      expect(result.action).toBe('remove');
      expect(result.requiresHumanReview).toBe(false);
    });

    it('should queue medium-confidence content for human review', async () => {
      const content = createTestContent({ text: 'Ambiguous content' });
      mockClassifier.classify.mockResolvedValue({
        categories: [{ category: 'harassment', score: 0.75, confidence: 0.8 }],
        overallScore: 0.75,
        confidence: 0.8
      });
      
      const result = await moderationService.moderateContent(content);
      
      expect(result.requiresHumanReview).toBe(true);
    });
  });
});
```

## Real-World Considerations

**Scalability**
- Distribute moderation workload across regions
- Use async processing for non-urgent content
- Implement caching for classification models
- Scale human review teams based on queue depth

**Fairness and Bias**
- Regularly audit classification models for bias
- Implement diverse moderator teams
- Provide clear appeal processes
- Monitor demographic impact of moderation decisions

**Moderator Well-being**
- Implement content blurring for sensitive material
- Provide mental health support resources
- Rotate moderators across content types
- Limit exposure to harmful content

**Transparency**
- Publish moderation guidelines publicly
- Provide clear explanations for actions
- Report aggregate moderation statistics
- Enable user feedback on moderation decisions

This template provides a comprehensive foundation for implementing effective, fair, and scalable content moderation systems that protect users while maintaining platform integrity and supporting content creator rights.
