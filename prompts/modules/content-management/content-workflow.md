# Content Workflow Template

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

This template provides comprehensive patterns for implementing content workflow systems, covering approval processes, review chains, publication scheduling, and workflow automation for content management platforms.

## Context

Content workflows are essential for managing content lifecycle from creation to publication, especially in organizations with editorial processes, compliance requirements, or multi-stakeholder content approval. A well-designed workflow system supports flexible approval chains, scheduled publishing, role-based permissions, and automated notifications. This template addresses the complexity of building adaptable workflows that scale with organizational needs.

## Instructions

1. **Setup Workflow Engine**: Configure workflow states, transitions, and rules
2. **Implement Approval Chains**: Build multi-level approval processes with escalation
3. **Add Publication Scheduling**: Enable scheduled publishing with timezone support
4. **Configure Role-Based Workflows**: Implement role-specific workflow paths
5. **Enable Notifications**: Add automated notifications for workflow events
6. **Add Workflow Analytics**: Track workflow performance and bottlenecks
7. **Test Workflow Scenarios**: Validate approval, rejection, and scheduling flows

## Examples

### Example 1: Workflow Management Service
```typescript
interface WorkflowService {
  createWorkflow(definition: WorkflowDefinition): Promise<Workflow>;
  submitForReview(contentId: string, workflowId: string): Promise<WorkflowInstance>;
  approveContent(instanceId: string, approverId: string, comments?: string): Promise<WorkflowInstance>;
  rejectContent(instanceId: string, reviewerId: string, reason: string): Promise<WorkflowInstance>;
  schedulePublication(contentId: string, publishAt: Date, options?: ScheduleOptions): Promise<ScheduledPublication>;
}

const workflowService = new WorkflowService();
const instance = await workflowService.submitForReview('content-123', 'editorial-workflow');
```


### Example 2: Approval Chain Configuration
```typescript
interface ApprovalChain {
  id: string;
  name: string;
  stages: ApprovalStage[];
  escalationRules: EscalationRule[];
}

const editorialWorkflow: ApprovalChain = {
  id: 'editorial-workflow',
  name: 'Editorial Review Process',
  stages: [
    {
      id: 'editor-review',
      name: 'Editor Review',
      approvers: { role: 'editor' },
      requiredApprovals: 1,
      timeoutHours: 48
    },
    {
      id: 'legal-review',
      name: 'Legal Review',
      approvers: { role: 'legal' },
      requiredApprovals: 1,
      timeoutHours: 72,
      condition: 'content.requiresLegalReview === true'
    },
    {
      id: 'final-approval',
      name: 'Final Approval',
      approvers: { role: 'editor-in-chief' },
      requiredApprovals: 1,
      timeoutHours: 24
    }
  ],
  escalationRules: [
    {
      trigger: 'timeout',
      action: 'escalate',
      escalateTo: { role: 'content-manager' }
    }
  ]
};
```

### Example 3: Publication Scheduling
```typescript
interface ScheduledPublication {
  id: string;
  contentId: string;
  scheduledAt: Date;
  timezone: string;
  status: ScheduleStatus;
  publishOptions: PublishOptions;
}

const scheduled = await workflowService.schedulePublication('content-123', 
  new Date('2024-03-15T09:00:00'),
  {
    timezone: 'America/New_York',
    notifyAuthor: true,
    socialShare: ['twitter', 'linkedin'],
    unpublishAt: new Date('2024-04-15T09:00:00') // Optional expiration
  }
);
```

## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| enableApprovalWorkflows | Enable approval workflow functionality | boolean | No | true |
| enableScheduledPublishing | Enable scheduled publication | boolean | No | true |
| enableEscalation | Enable automatic escalation | boolean | No | true |
| defaultTimeoutHours | Default approval timeout in hours | number | No | 48 |
| enableParallelApprovals | Allow parallel approval stages | boolean | No | false |
| enableConditionalStages | Enable conditional workflow stages | boolean | No | true |
| enableWorkflowAnalytics | Track workflow metrics | boolean | No | true |
| maxScheduleAdvanceDays | Maximum days to schedule in advance | number | No | 365 |

## Expected Output

This template will produce:
- **Workflow Engine**: Flexible state machine for content workflows
- **Approval System**: Multi-level approval chains with escalation
- **Publication Scheduler**: Timezone-aware scheduled publishing
- **Role-Based Workflows**: Different workflows based on content type and user role
- **Notification System**: Automated alerts for workflow events
- **Workflow Analytics**: Performance tracking and bottleneck identification
- **Audit Trail**: Complete history of workflow actions
- **Workflow Templates**: Reusable workflow configurations

## Implementation Patterns

### Workflow Engine

**Workflow Data Model**
```typescript
interface Workflow {
  id: string;
  name: string;
  description?: string;
  
  // Workflow structure
  states: WorkflowState[];
  transitions: WorkflowTransition[];
  
  // Configuration
  config: WorkflowConfig;
  
  // Applicability
  contentTypes: string[];
  conditions?: WorkflowCondition[];
  
  // Metadata
  isActive: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowState {
  id: string;
  name: string;
  type: 'initial' | 'intermediate' | 'final' | 'rejected';
  
  // Actions
  onEnter?: WorkflowAction[];
  onExit?: WorkflowAction[];
  
  // Permissions
  allowedActions: string[];
  assignees?: AssigneeConfig;
  
  // Timeout
  timeoutHours?: number;
  timeoutAction?: WorkflowAction;
}

interface WorkflowTransition {
  id: string;
  name: string;
  fromState: string;
  toState: string;
  
  // Conditions
  conditions?: TransitionCondition[];
  
  // Requirements
  requiredApprovals?: number;
  requiredRole?: string;
  
  // Actions
  actions?: WorkflowAction[];
}

interface WorkflowInstance {
  id: string;
  workflowId: string;
  contentId: string;
  
  // Current state
  currentState: string;
  
  // History
  history: WorkflowHistoryEntry[];
  
  // Approvals
  approvals: ApprovalRecord[];
  
  // Metadata
  startedAt: Date;
  completedAt?: Date;
  startedBy: string;
  
  // Data
  data: Record<string, any>;
}
```

**Workflow Engine Implementation**
```typescript
class WorkflowEngine {
  async startWorkflow(contentId: string, workflowId: string, userId: string): Promise<WorkflowInstance> {
    const workflow = await this.getWorkflow(workflowId);
    const content = await this.contentRepository.findById(contentId);
    
    // Validate workflow applicability
    if (!this.isWorkflowApplicable(workflow, content)) {
      throw new Error('Workflow is not applicable to this content');
    }
    
    // Find initial state
    const initialState = workflow.states.find(s => s.type === 'initial');
    if (!initialState) {
      throw new Error('Workflow has no initial state');
    }
    
    // Create instance
    const instance: WorkflowInstance = {
      id: this.generateInstanceId(),
      workflowId,
      contentId,
      currentState: initialState.id,
      history: [{
        id: this.generateHistoryId(),
        action: 'start',
        fromState: null,
        toState: initialState.id,
        userId,
        timestamp: new Date()
      }],
      approvals: [],
      startedAt: new Date(),
      startedBy: userId,
      data: {}
    };
    
    await this.instanceRepository.save(instance);
    
    // Execute onEnter actions
    await this.executeActions(initialState.onEnter, instance, content);
    
    // Notify assignees
    await this.notifyAssignees(instance, initialState);
    
    return instance;
  }

  async transition(
    instanceId: string,
    transitionId: string,
    userId: string,
    data?: TransitionData
  ): Promise<WorkflowInstance> {
    const instance = await this.getInstance(instanceId);
    const workflow = await this.getWorkflow(instance.workflowId);
    
    // Find transition
    const transition = workflow.transitions.find(
      t => t.id === transitionId && t.fromState === instance.currentState
    );
    
    if (!transition) {
      throw new Error('Invalid transition from current state');
    }
    
    // Check conditions
    if (transition.conditions) {
      const conditionsMet = await this.evaluateConditions(transition.conditions, instance, data);
      if (!conditionsMet) {
        throw new Error('Transition conditions not met');
      }
    }
    
    // Check required approvals
    if (transition.requiredApprovals) {
      const approvalCount = instance.approvals.filter(
        a => a.transitionId === transitionId && a.decision === 'approved'
      ).length;
      
      if (approvalCount < transition.requiredApprovals) {
        // Record approval but don't transition yet
        await this.recordApproval(instance, transitionId, userId, 'approved', data?.comments);
        return instance;
      }
    }
    
    // Check role permission
    if (transition.requiredRole) {
      const hasRole = await this.userHasRole(userId, transition.requiredRole);
      if (!hasRole) {
        throw new Error(`User does not have required role: ${transition.requiredRole}`);
      }
    }
    
    // Get states
    const fromState = workflow.states.find(s => s.id === instance.currentState)!;
    const toState = workflow.states.find(s => s.id === transition.toState)!;
    
    // Execute onExit actions
    await this.executeActions(fromState.onExit, instance);
    
    // Execute transition actions
    await this.executeActions(transition.actions, instance, data);
    
    // Update instance
    instance.currentState = toState.id;
    instance.history.push({
      id: this.generateHistoryId(),
      action: 'transition',
      transitionId,
      fromState: fromState.id,
      toState: toState.id,
      userId,
      timestamp: new Date(),
      data
    });
    
    // Check if final state
    if (toState.type === 'final') {
      instance.completedAt = new Date();
      await this.handleWorkflowCompletion(instance);
    }
    
    await this.instanceRepository.save(instance);
    
    // Execute onEnter actions
    await this.executeActions(toState.onEnter, instance);
    
    // Notify assignees of new state
    await this.notifyAssignees(instance, toState);
    
    return instance;
  }

  private async executeActions(
    actions: WorkflowAction[] | undefined,
    instance: WorkflowInstance,
    data?: any
  ): Promise<void> {
    if (!actions) return;
    
    for (const action of actions) {
      switch (action.type) {
        case 'notify':
          await this.notificationService.send(action.config, instance);
          break;
        case 'updateContent':
          await this.contentRepository.update(instance.contentId, action.config.updates);
          break;
        case 'webhook':
          await this.webhookService.trigger(action.config.url, { instance, data });
          break;
        case 'assignTask':
          await this.taskService.createTask(action.config, instance);
          break;
        case 'publish':
          await this.publishContent(instance.contentId);
          break;
        case 'custom':
          await this.customActionHandler.execute(action.config, instance, data);
          break;
      }
    }
  }
}
```


### Approval Chain System

**Approval Management**
```typescript
interface ApprovalStage {
  id: string;
  name: string;
  order: number;
  
  // Approvers
  approvers: ApproverConfig;
  requiredApprovals: number;
  
  // Timing
  timeoutHours?: number;
  reminderHours?: number;
  
  // Conditions
  condition?: string;
  skipCondition?: string;
  
  // Actions
  onApprove?: WorkflowAction[];
  onReject?: WorkflowAction[];
  onTimeout?: WorkflowAction[];
}

interface ApproverConfig {
  type: 'user' | 'role' | 'group' | 'dynamic';
  users?: string[];
  role?: string;
  group?: string;
  dynamicResolver?: string;
}

interface ApprovalRecord {
  id: string;
  stageId: string;
  transitionId?: string;
  userId: string;
  decision: 'approved' | 'rejected' | 'abstained';
  comments?: string;
  timestamp: Date;
}

class ApprovalService {
  async submitForApproval(contentId: string, workflowId: string): Promise<WorkflowInstance> {
    const workflow = await this.workflowEngine.getWorkflow(workflowId);
    const content = await this.contentRepository.findById(contentId);
    
    // Start workflow
    const instance = await this.workflowEngine.startWorkflow(
      contentId,
      workflowId,
      content.authorId
    );
    
    // Update content status
    await this.contentRepository.update(contentId, {
      status: 'pending_review',
      workflowInstanceId: instance.id
    });
    
    return instance;
  }

  async approve(
    instanceId: string,
    userId: string,
    comments?: string
  ): Promise<ApprovalResult> {
    const instance = await this.workflowEngine.getInstance(instanceId);
    const workflow = await this.workflowEngine.getWorkflow(instance.workflowId);
    
    // Get current stage
    const currentStage = this.getCurrentApprovalStage(workflow, instance);
    
    // Verify user can approve
    const canApprove = await this.canUserApprove(userId, currentStage);
    if (!canApprove) {
      throw new Error('User is not authorized to approve at this stage');
    }
    
    // Check for duplicate approval
    const existingApproval = instance.approvals.find(
      a => a.stageId === currentStage.id && a.userId === userId
    );
    if (existingApproval) {
      throw new Error('User has already submitted approval for this stage');
    }
    
    // Record approval
    const approval: ApprovalRecord = {
      id: this.generateApprovalId(),
      stageId: currentStage.id,
      userId,
      decision: 'approved',
      comments,
      timestamp: new Date()
    };
    
    instance.approvals.push(approval);
    await this.instanceRepository.save(instance);
    
    // Check if stage is complete
    const stageApprovals = instance.approvals.filter(
      a => a.stageId === currentStage.id && a.decision === 'approved'
    );
    
    if (stageApprovals.length >= currentStage.requiredApprovals) {
      // Execute onApprove actions
      await this.executeStageActions(currentStage.onApprove, instance);
      
      // Move to next stage or complete
      await this.advanceToNextStage(instance, workflow);
    }
    
    return {
      approved: true,
      stageComplete: stageApprovals.length >= currentStage.requiredApprovals,
      instance
    };
  }

  async reject(
    instanceId: string,
    userId: string,
    reason: string
  ): Promise<ApprovalResult> {
    const instance = await this.workflowEngine.getInstance(instanceId);
    const workflow = await this.workflowEngine.getWorkflow(instance.workflowId);
    
    const currentStage = this.getCurrentApprovalStage(workflow, instance);
    
    // Verify user can reject
    const canReject = await this.canUserApprove(userId, currentStage);
    if (!canReject) {
      throw new Error('User is not authorized to reject at this stage');
    }
    
    // Record rejection
    const rejection: ApprovalRecord = {
      id: this.generateApprovalId(),
      stageId: currentStage.id,
      userId,
      decision: 'rejected',
      comments: reason,
      timestamp: new Date()
    };
    
    instance.approvals.push(rejection);
    
    // Execute onReject actions
    await this.executeStageActions(currentStage.onReject, instance);
    
    // Transition to rejected state
    const rejectedState = workflow.states.find(s => s.type === 'rejected');
    if (rejectedState) {
      instance.currentState = rejectedState.id;
      instance.history.push({
        id: this.generateHistoryId(),
        action: 'reject',
        fromState: instance.currentState,
        toState: rejectedState.id,
        userId,
        timestamp: new Date(),
        data: { reason }
      });
    }
    
    await this.instanceRepository.save(instance);
    
    // Update content status
    await this.contentRepository.update(instance.contentId, {
      status: 'rejected',
      rejectionReason: reason
    });
    
    // Notify author
    await this.notifyRejection(instance, reason, userId);
    
    return {
      approved: false,
      stageComplete: true,
      instance
    };
  }

  private async advanceToNextStage(
    instance: WorkflowInstance,
    workflow: Workflow
  ): Promise<void> {
    const stages = this.getApprovalStages(workflow);
    const currentStageIndex = stages.findIndex(
      s => s.id === this.getCurrentApprovalStage(workflow, instance).id
    );
    
    // Find next applicable stage
    for (let i = currentStageIndex + 1; i < stages.length; i++) {
      const nextStage = stages[i];
      
      // Check skip condition
      if (nextStage.skipCondition) {
        const shouldSkip = await this.evaluateCondition(nextStage.skipCondition, instance);
        if (shouldSkip) continue;
      }
      
      // Check stage condition
      if (nextStage.condition) {
        const conditionMet = await this.evaluateCondition(nextStage.condition, instance);
        if (!conditionMet) continue;
      }
      
      // Move to this stage
      await this.moveToStage(instance, nextStage);
      return;
    }
    
    // No more stages - complete workflow
    await this.completeApprovalWorkflow(instance);
  }

  private async completeApprovalWorkflow(instance: WorkflowInstance): Promise<void> {
    const workflow = await this.workflowEngine.getWorkflow(instance.workflowId);
    const finalState = workflow.states.find(s => s.type === 'final');
    
    if (finalState) {
      instance.currentState = finalState.id;
      instance.completedAt = new Date();
      
      instance.history.push({
        id: this.generateHistoryId(),
        action: 'complete',
        fromState: instance.currentState,
        toState: finalState.id,
        userId: 'system',
        timestamp: new Date()
      });
      
      await this.instanceRepository.save(instance);
      
      // Execute final state actions (e.g., publish)
      await this.workflowEngine.executeActions(finalState.onEnter, instance);
    }
    
    // Update content status
    await this.contentRepository.update(instance.contentId, {
      status: 'approved'
    });
  }
}
```

### Publication Scheduling

**Scheduler Implementation**
```typescript
interface ScheduledPublication {
  id: string;
  contentId: string;
  
  // Scheduling
  scheduledAt: Date;
  timezone: string;
  
  // Status
  status: 'pending' | 'published' | 'failed' | 'cancelled';
  
  // Options
  publishOptions: PublishOptions;
  
  // Expiration
  unpublishAt?: Date;
  
  // Metadata
  createdBy: string;
  createdAt: Date;
  publishedAt?: Date;
  failureReason?: string;
}

interface PublishOptions {
  notifyAuthor: boolean;
  notifySubscribers: boolean;
  socialShare?: SocialShareConfig[];
  seoSettings?: SEOSettings;
  visibility?: ContentVisibility;
}

class PublicationScheduler {
  async schedulePublication(
    contentId: string,
    scheduledAt: Date,
    options: ScheduleOptions
  ): Promise<ScheduledPublication> {
    const content = await this.contentRepository.findById(contentId);
    
    // Validate content is ready for scheduling
    await this.validateForScheduling(content);
    
    // Validate schedule time
    const scheduleTime = this.normalizeToTimezone(scheduledAt, options.timezone);
    if (scheduleTime <= new Date()) {
      throw new Error('Schedule time must be in the future');
    }
    
    const maxAdvance = new Date();
    maxAdvance.setDate(maxAdvance.getDate() + this.config.maxScheduleAdvanceDays);
    if (scheduleTime > maxAdvance) {
      throw new Error(`Cannot schedule more than ${this.config.maxScheduleAdvanceDays} days in advance`);
    }
    
    // Create scheduled publication
    const scheduled: ScheduledPublication = {
      id: this.generateScheduleId(),
      contentId,
      scheduledAt: scheduleTime,
      timezone: options.timezone,
      status: 'pending',
      publishOptions: options.publishOptions || {},
      unpublishAt: options.unpublishAt,
      createdBy: this.currentUser.id,
      createdAt: new Date()
    };
    
    await this.scheduleRepository.save(scheduled);
    
    // Create scheduler job
    await this.jobScheduler.scheduleJob({
      id: `publish-${scheduled.id}`,
      type: 'publish_content',
      executeAt: scheduleTime,
      payload: { scheduleId: scheduled.id }
    });
    
    // Schedule unpublish if specified
    if (options.unpublishAt) {
      await this.jobScheduler.scheduleJob({
        id: `unpublish-${scheduled.id}`,
        type: 'unpublish_content',
        executeAt: options.unpublishAt,
        payload: { scheduleId: scheduled.id }
      });
    }
    
    // Update content status
    await this.contentRepository.update(contentId, {
      status: 'scheduled',
      scheduledPublishAt: scheduleTime
    });
    
    return scheduled;
  }

  async executeScheduledPublication(scheduleId: string): Promise<void> {
    const scheduled = await this.scheduleRepository.findById(scheduleId);
    
    if (scheduled.status !== 'pending') {
      return; // Already processed
    }
    
    try {
      const content = await this.contentRepository.findById(scheduled.contentId);
      
      // Publish content
      await this.publishService.publish(content.id, scheduled.publishOptions);
      
      // Update schedule status
      scheduled.status = 'published';
      scheduled.publishedAt = new Date();
      await this.scheduleRepository.save(scheduled);
      
      // Send notifications
      if (scheduled.publishOptions.notifyAuthor) {
        await this.notifyAuthorOfPublication(content);
      }
      
      if (scheduled.publishOptions.notifySubscribers) {
        await this.notifySubscribers(content);
      }
      
      // Social sharing
      if (scheduled.publishOptions.socialShare) {
        await this.socialService.shareContent(content, scheduled.publishOptions.socialShare);
      }
      
    } catch (error) {
      scheduled.status = 'failed';
      scheduled.failureReason = error.message;
      await this.scheduleRepository.save(scheduled);
      
      // Notify of failure
      await this.notifyScheduleFailure(scheduled, error);
    }
  }

  async reschedule(scheduleId: string, newScheduledAt: Date): Promise<ScheduledPublication> {
    const scheduled = await this.scheduleRepository.findById(scheduleId);
    
    if (scheduled.status !== 'pending') {
      throw new Error('Can only reschedule pending publications');
    }
    
    // Cancel existing job
    await this.jobScheduler.cancelJob(`publish-${scheduleId}`);
    
    // Update schedule
    scheduled.scheduledAt = newScheduledAt;
    await this.scheduleRepository.save(scheduled);
    
    // Create new job
    await this.jobScheduler.scheduleJob({
      id: `publish-${scheduleId}`,
      type: 'publish_content',
      executeAt: newScheduledAt,
      payload: { scheduleId }
    });
    
    // Update content
    await this.contentRepository.update(scheduled.contentId, {
      scheduledPublishAt: newScheduledAt
    });
    
    return scheduled;
  }

  async cancelSchedule(scheduleId: string): Promise<void> {
    const scheduled = await this.scheduleRepository.findById(scheduleId);
    
    if (scheduled.status !== 'pending') {
      throw new Error('Can only cancel pending publications');
    }
    
    // Cancel jobs
    await this.jobScheduler.cancelJob(`publish-${scheduleId}`);
    if (scheduled.unpublishAt) {
      await this.jobScheduler.cancelJob(`unpublish-${scheduleId}`);
    }
    
    // Update schedule
    scheduled.status = 'cancelled';
    await this.scheduleRepository.save(scheduled);
    
    // Update content
    await this.contentRepository.update(scheduled.contentId, {
      status: 'draft',
      scheduledPublishAt: null
    });
  }
}
```


### Workflow Notifications

**Notification System**
```typescript
interface WorkflowNotificationService {
  notifyAssignees(instance: WorkflowInstance, state: WorkflowState): Promise<void>;
  notifyApprovalRequired(instance: WorkflowInstance, stage: ApprovalStage): Promise<void>;
  notifyApprovalDecision(instance: WorkflowInstance, decision: ApprovalRecord): Promise<void>;
  notifyWorkflowComplete(instance: WorkflowInstance): Promise<void>;
  sendReminder(instance: WorkflowInstance, stage: ApprovalStage): Promise<void>;
}

class WorkflowNotifications implements WorkflowNotificationService {
  async notifyAssignees(instance: WorkflowInstance, state: WorkflowState): Promise<void> {
    if (!state.assignees) return;
    
    const assignees = await this.resolveAssignees(state.assignees);
    const content = await this.contentRepository.findById(instance.contentId);
    
    for (const assignee of assignees) {
      await this.notificationService.send({
        userId: assignee.id,
        type: 'workflow_assignment',
        title: `Content assigned for ${state.name}`,
        message: `"${content.title}" requires your attention`,
        data: {
          contentId: content.id,
          instanceId: instance.id,
          stateName: state.name
        },
        channels: ['email', 'in_app'],
        priority: 'normal'
      });
    }
  }

  async notifyApprovalRequired(instance: WorkflowInstance, stage: ApprovalStage): Promise<void> {
    const approvers = await this.resolveApprovers(stage.approvers);
    const content = await this.contentRepository.findById(instance.contentId);
    
    for (const approver of approvers) {
      await this.notificationService.send({
        userId: approver.id,
        type: 'approval_required',
        title: `Approval required: ${stage.name}`,
        message: `"${content.title}" is waiting for your approval`,
        data: {
          contentId: content.id,
          instanceId: instance.id,
          stageId: stage.id,
          stageName: stage.name,
          deadline: stage.timeoutHours 
            ? new Date(Date.now() + stage.timeoutHours * 60 * 60 * 1000)
            : null
        },
        channels: ['email', 'in_app', 'push'],
        priority: 'high',
        actionUrl: `/content/${content.id}/review`
      });
    }
  }

  async sendReminder(instance: WorkflowInstance, stage: ApprovalStage): Promise<void> {
    const pendingApprovers = await this.getPendingApprovers(instance, stage);
    const content = await this.contentRepository.findById(instance.contentId);
    
    for (const approver of pendingApprovers) {
      await this.notificationService.send({
        userId: approver.id,
        type: 'approval_reminder',
        title: `Reminder: Approval pending for ${stage.name}`,
        message: `"${content.title}" is still waiting for your approval`,
        data: {
          contentId: content.id,
          instanceId: instance.id,
          stageId: stage.id
        },
        channels: ['email', 'push'],
        priority: 'high'
      });
    }
  }

  private async resolveApprovers(config: ApproverConfig): Promise<User[]> {
    switch (config.type) {
      case 'user':
        return this.userRepository.findByIds(config.users!);
      case 'role':
        return this.userRepository.findByRole(config.role!);
      case 'group':
        return this.groupRepository.getMembers(config.group!);
      case 'dynamic':
        return this.dynamicResolverService.resolve(config.dynamicResolver!);
      default:
        return [];
    }
  }
}
```

### Workflow Analytics

**Analytics Implementation**
```typescript
interface WorkflowAnalytics {
  getWorkflowMetrics(workflowId: string, dateRange: DateRange): Promise<WorkflowMetrics>;
  getStageMetrics(workflowId: string, stageId: string): Promise<StageMetrics>;
  getBottlenecks(workflowId: string): Promise<Bottleneck[]>;
  getApproverPerformance(approverId: string): Promise<ApproverMetrics>;
}

interface WorkflowMetrics {
  totalInstances: number;
  completedInstances: number;
  rejectedInstances: number;
  pendingInstances: number;
  averageCompletionTime: number;
  completionRate: number;
  rejectionRate: number;
  stageMetrics: StageMetrics[];
}

interface StageMetrics {
  stageId: string;
  stageName: string;
  averageTime: number;
  medianTime: number;
  approvalRate: number;
  rejectionRate: number;
  timeoutRate: number;
  bottleneckScore: number;
}

class WorkflowAnalyticsService implements WorkflowAnalytics {
  async getWorkflowMetrics(workflowId: string, dateRange: DateRange): Promise<WorkflowMetrics> {
    const instances = await this.instanceRepository.findByWorkflow(workflowId, dateRange);
    
    const completed = instances.filter(i => i.completedAt && i.currentState !== 'rejected');
    const rejected = instances.filter(i => i.currentState === 'rejected');
    const pending = instances.filter(i => !i.completedAt);
    
    // Calculate average completion time
    const completionTimes = completed.map(i => 
      i.completedAt!.getTime() - i.startedAt.getTime()
    );
    const avgCompletionTime = completionTimes.length > 0
      ? completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length
      : 0;
    
    // Get stage metrics
    const workflow = await this.workflowEngine.getWorkflow(workflowId);
    const stageMetrics = await Promise.all(
      workflow.states
        .filter(s => s.type === 'intermediate')
        .map(s => this.getStageMetrics(workflowId, s.id))
    );
    
    return {
      totalInstances: instances.length,
      completedInstances: completed.length,
      rejectedInstances: rejected.length,
      pendingInstances: pending.length,
      averageCompletionTime: avgCompletionTime,
      completionRate: instances.length > 0 ? completed.length / instances.length : 0,
      rejectionRate: instances.length > 0 ? rejected.length / instances.length : 0,
      stageMetrics
    };
  }

  async getBottlenecks(workflowId: string): Promise<Bottleneck[]> {
    const metrics = await this.getWorkflowMetrics(workflowId, { days: 30 });
    
    const bottlenecks: Bottleneck[] = [];
    
    for (const stage of metrics.stageMetrics) {
      // High timeout rate indicates bottleneck
      if (stage.timeoutRate > 0.2) {
        bottlenecks.push({
          stageId: stage.stageId,
          stageName: stage.stageName,
          type: 'timeout',
          severity: stage.timeoutRate > 0.5 ? 'high' : 'medium',
          metric: stage.timeoutRate,
          recommendation: 'Consider increasing timeout or adding more approvers'
        });
      }
      
      // Long average time indicates bottleneck
      const avgTimeHours = stage.averageTime / (1000 * 60 * 60);
      if (avgTimeHours > 48) {
        bottlenecks.push({
          stageId: stage.stageId,
          stageName: stage.stageName,
          type: 'slow_processing',
          severity: avgTimeHours > 96 ? 'high' : 'medium',
          metric: avgTimeHours,
          recommendation: 'Review approver workload and consider parallel approvals'
        });
      }
    }
    
    return bottlenecks.sort((a, b) => 
      (b.severity === 'high' ? 1 : 0) - (a.severity === 'high' ? 1 : 0)
    );
  }
}
```

### Integration Points

**External System Integration**
```typescript
interface WorkflowIntegration {
  triggerExternalWorkflow(contentId: string, externalSystem: string): Promise<void>;
  syncWorkflowStatus(instanceId: string, externalStatus: ExternalStatus): Promise<void>;
  registerWebhook(workflowId: string, event: string, webhookUrl: string): Promise<void>;
}

class WorkflowIntegrationService implements WorkflowIntegration {
  async triggerExternalWorkflow(contentId: string, externalSystem: string): Promise<void> {
    const content = await this.contentRepository.findById(contentId);
    const config = await this.getExternalSystemConfig(externalSystem);
    
    await this.httpClient.post(config.workflowTriggerUrl, {
      contentId: content.id,
      title: content.title,
      author: content.authorId,
      metadata: content.metadata,
      callbackUrl: `${this.baseUrl}/api/workflows/callback/${externalSystem}`
    }, {
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  async registerWebhook(workflowId: string, event: string, webhookUrl: string): Promise<void> {
    const webhook = {
      id: this.generateWebhookId(),
      workflowId,
      event,
      url: webhookUrl,
      secret: this.generateWebhookSecret(),
      isActive: true,
      createdAt: new Date()
    };
    
    await this.webhookRepository.save(webhook);
  }
}
```

### Security Considerations

**Workflow Access Control**
```typescript
interface WorkflowSecurityService {
  checkWorkflowAccess(userId: string, workflowId: string, action: string): Promise<boolean>;
  checkInstanceAccess(userId: string, instanceId: string, action: string): Promise<boolean>;
  validateApprovalPermission(userId: string, instanceId: string, stageId: string): Promise<boolean>;
}

class WorkflowSecurity implements WorkflowSecurityService {
  async checkInstanceAccess(userId: string, instanceId: string, action: string): Promise<boolean> {
    const instance = await this.workflowEngine.getInstance(instanceId);
    const content = await this.contentRepository.findById(instance.contentId);
    
    // Content author can view
    if (action === 'view' && content.authorId === userId) {
      return true;
    }
    
    // Check if user is an approver for current stage
    const workflow = await this.workflowEngine.getWorkflow(instance.workflowId);
    const currentState = workflow.states.find(s => s.id === instance.currentState);
    
    if (currentState?.assignees) {
      const assignees = await this.resolveAssignees(currentState.assignees);
      if (assignees.some(a => a.id === userId)) {
        return true;
      }
    }
    
    // Check role-based permissions
    return this.rbacService.checkPermission(userId, 'workflow', action);
  }
}
```

### Testing Considerations

**Workflow Testing**
```typescript
describe('WorkflowEngine', () => {
  describe('startWorkflow', () => {
    it('should create workflow instance in initial state', async () => {
      const instance = await workflowEngine.startWorkflow('content-1', 'editorial', 'user-1');
      
      expect(instance.currentState).toBe('draft');
      expect(instance.history).toHaveLength(1);
      expect(instance.history[0].action).toBe('start');
    });
  });

  describe('transition', () => {
    it('should transition to next state when conditions met', async () => {
      const instance = await workflowEngine.startWorkflow('content-1', 'editorial', 'user-1');
      
      const updated = await workflowEngine.transition(
        instance.id,
        'submit-for-review',
        'user-1'
      );
      
      expect(updated.currentState).toBe('pending_review');
    });

    it('should reject invalid transitions', async () => {
      const instance = await workflowEngine.startWorkflow('content-1', 'editorial', 'user-1');
      
      await expect(workflowEngine.transition(
        instance.id,
        'publish', // Invalid from initial state
        'user-1'
      )).rejects.toThrow('Invalid transition');
    });
  });
});

describe('ApprovalService', () => {
  describe('approve', () => {
    it('should advance to next stage when required approvals met', async () => {
      const instance = await setupInstanceAtApprovalStage();
      
      await approvalService.approve(instance.id, 'approver-1');
      
      const updated = await workflowEngine.getInstance(instance.id);
      expect(updated.currentState).toBe('next_stage');
    });
  });
});
```

## Real-World Considerations

**Performance Optimization**
- Cache workflow definitions
- Use async processing for notifications
- Batch approval checks for efficiency
- Optimize database queries for workflow history

**Scalability**
- Distribute workflow processing across workers
- Use message queues for async operations
- Implement workflow instance archiving
- Consider eventual consistency for analytics

**User Experience**
- Provide clear workflow status visualization
- Show estimated completion times
- Enable bulk approval operations
- Support mobile-friendly approval interfaces

**Compliance**
- Maintain complete audit trails
- Support regulatory workflow requirements
- Enable workflow versioning for compliance
- Implement approval delegation with controls

This template provides a comprehensive foundation for implementing flexible, scalable content workflow systems that support complex approval processes, scheduled publishing, and workflow automation while maintaining security and compliance requirements.
