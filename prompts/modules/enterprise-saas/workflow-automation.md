# Enterprise Workflow Automation Template

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

This template provides comprehensive patterns for implementing enterprise-grade workflow automation and approval processes in B2B SaaS applications. It covers workflow design, task management, approval chains, business process automation, integration with external systems, and compliance with enterprise governance requirements.

## Context

Enterprise organizations require sophisticated workflow automation to manage complex business processes, approval hierarchies, compliance requirements, and integration with existing enterprise systems. This template addresses the need for flexible, scalable workflow engines that can handle everything from simple approval processes to complex multi-step business workflows with conditional logic, parallel processing, and external system integration.

## Core Components

### Workflow Engine

## Examples

```typescript
interface WorkflowEngine {
  createWorkflow(workflowDefinition: WorkflowDefinition): Promise<Workflow>;
  startWorkflowExecution(workflowId: string, input: WorkflowInput): Promise<WorkflowExecution>;
  pauseExecution(executionId: string): Promise<void>;
  resumeExecution(executionId: string): Promise<void>;
  cancelExecution(executionId: string, reason: string): Promise<void>;
  getExecutionStatus(executionId: string): Promise<ExecutionStatus>;
  retryFailedStep(executionId: string, stepId: string): Promise<void>;
}

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  category: WorkflowCategory;
  triggers: WorkflowTrigger[];
  steps: WorkflowStep[];
  variables: WorkflowVariable[];
  permissions: WorkflowPermission[];
  settings: WorkflowSettings;
  metadata: WorkflowMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface WorkflowStep {
  id: string;
  name: string;
  type: StepType;
  configuration: StepConfiguration;
  conditions: StepCondition[];
  inputs: StepInput[];
  outputs: StepOutput[];
  errorHandling: ErrorHandlingConfig;
  timeout: number;
  retryPolicy: RetryPolicy;
  dependencies: string[];
  parallel: boolean;
}

enum StepType {
  APPROVAL = 'approval',
  TASK_ASSIGNMENT = 'task_assignment',
  NOTIFICATION = 'notification',
  API_CALL = 'api_call',
  DATA_TRANSFORMATION = 'data_transformation',
  CONDITION = 'condition',
  LOOP = 'loop',
  PARALLEL_GATEWAY = 'parallel_gateway',
  EXCLUSIVE_GATEWAY = 'exclusive_gateway',
  TIMER = 'timer',
  HUMAN_TASK = 'human_task',
  SCRIPT_EXECUTION = 'script_execution'
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  tenantId: string;
  status: ExecutionStatus;
  currentStep: string;
  input: WorkflowInput;
  output?: WorkflowOutput;
  variables: Record<string, any>;
  stepExecutions: StepExecution[];
  startedAt: Date;
  completedAt?: Date;
  startedBy: string;
  error?: ExecutionError;
}

enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  WAITING = 'waiting',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  PAUSED = 'paused'
}
```

### Approval System

```typescript
interface ApprovalSystem {
  createApprovalRequest(request: ApprovalRequest): Promise<ApprovalProcess>;
  processApproval(processId: string, decision: ApprovalDecision): Promise<void>;
  delegateApproval(processId: string, fromUserId: string, toUserId: string): Promise<void>;
  escalateApproval(processId: string, escalationReason: string): Promise<void>;
  getApprovalHistory(processId: string): Promise<ApprovalHistory[]>;
  bulkApproval(processIds: string[], decision: ApprovalDecision): Promise<BulkApprovalResult>;
}

interface ApprovalRequest {
  tenantId: string;
  requesterId: string;
  title: string;
  description: string;
  category: ApprovalCategory;
  priority: ApprovalPriority;
  data: ApprovalData;
  approvers: ApprovalChain;
  dueDate?: Date;
  attachments?: Attachment[];
  metadata: ApprovalMetadata;
}

interface ApprovalChain {
  type: ApprovalChainType;
  steps: ApprovalStep[];
  parallelApproval: boolean;
  minimumApprovals?: number;
  escalationRules: EscalationRule[];
}

enum ApprovalChainType {
  SEQUENTIAL = 'sequential',
  PARALLEL = 'parallel',
  CONDITIONAL = 'conditional',
  HIERARCHICAL = 'hierarchical',
  CONSENSUS = 'consensus'
}

interface ApprovalStep {
  id: string;
  approvers: ApprovalUser[];
  conditions: ApprovalCondition[];
  timeout: number;
  escalationDelay: number;
  requiredApprovals: number;
  allowDelegation: boolean;
  skipConditions?: SkipCondition[];
}

interface ApprovalProcess {
  id: string;
  tenantId: string;
  requestId: string;
  status: ApprovalStatus;
  currentStep: number;
  approvalChain: ApprovalChain;
  decisions: ApprovalDecision[];
  history: ApprovalHistory[];
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
}

enum ApprovalStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled',
  ESCALATED = 'escalated',
  EXPIRED = 'expired'
}

class EnterpriseApprovalSystem implements ApprovalSystem {
  async createApprovalRequest(request: ApprovalRequest): Promise<ApprovalProcess> {
    // Validate approval request
    await this.validateApprovalRequest(request);
    
    // Resolve approvers based on rules
    const resolvedChain = await this.resolveApprovalChain(request);
    
    // Create approval process
    const process: ApprovalProcess = {
      id: this.generateProcessId(),
      tenantId: request.tenantId,
      requestId: this.generateRequestId(),
      status: ApprovalStatus.PENDING,
      currentStep: 0,
      approvalChain: resolvedChain,
      decisions: [],
      history: [{
        action: 'created',
        userId: request.requesterId,
        timestamp: new Date(),
        comment: 'Approval request created'
      }],
      createdAt: new Date(),
      dueDate: request.dueDate
    };
    
    // Store approval process
    await this.approvalRepository.create(process);
    
    // Start approval workflow
    await this.startApprovalWorkflow(process);
    
    // Send notifications to first approvers
    await this.notifyApprovers(process, 0);
    
    return process;
  }

  async processApproval(processId: string, decision: ApprovalDecision): Promise<void> {
    const process = await this.approvalRepository.findById(processId);
    if (!process) {
      throw new ApprovalProcessNotFoundError(`Process ${processId} not found`);
    }
    
    // Validate approver permissions
    await this.validateApproverPermissions(process, decision.approverId);
    
    // Record decision
    process.decisions.push(decision);
    process.history.push({
      action: decision.decision,
      userId: decision.approverId,
      timestamp: new Date(),
      comment: decision.comment,
      metadata: decision.metadata
    });
    
    // Determine next action based on decision and chain type
    const nextAction = await this.determineNextAction(process, decision);
    
    switch (nextAction.type) {
      case 'continue':
        await this.continueApprovalProcess(process, nextAction.nextStep);
        break;
      
      case 'complete_approved':
        await this.completeApprovalProcess(process, ApprovalStatus.APPROVED);
        break;
      
      case 'complete_rejected':
        await this.completeApprovalProcess(process, ApprovalStatus.REJECTED);
        break;
      
      case 'escalate':
        await this.escalateApproval(processId, nextAction.escalationReason);
        break;
      
      case 'wait_for_parallel':
        // Wait for other parallel approvers
        await this.updateApprovalProcess(process);
        break;
    }
    
    // Send notifications
    await this.sendApprovalNotifications(process, decision);
  }

  private async resolveApprovalChain(request: ApprovalRequest): Promise<ApprovalChain> {
    const chain = { ...request.approvers };
    
    // Resolve dynamic approvers
    for (const step of chain.steps) {
      const resolvedApprovers: ApprovalUser[] = [];
      
      for (const approver of step.approvers) {
        if (approver.type === 'role') {
          // Resolve users by role
          const roleUsers = await this.userService.getUsersByRole(request.tenantId, approver.roleId);
          resolvedApprovers.push(...roleUsers.map(user => ({
            type: 'user',
            userId: user.id,
            name: user.name,
            email: user.email
          })));
        } else if (approver.type === 'manager') {
          // Resolve manager hierarchy
          const manager = await this.userService.getUserManager(request.requesterId);
          if (manager) {
            resolvedApprovers.push({
              type: 'user',
              userId: manager.id,
              name: manager.name,
              email: manager.email
            });
          }
        } else {
          resolvedApprovers.push(approver);
        }
      }
      
      step.approvers = resolvedApprovers;
    }
    
    return chain;
  }
}
```

### Task Management System

```typescript
interface TaskManagementSystem {
  createTask(taskData: TaskCreationRequest): Promise<Task>;
  assignTask(taskId: string, assigneeId: string): Promise<void>;
  updateTaskStatus(taskId: string, status: TaskStatus, updateData?: TaskUpdate): Promise<void>;
  addTaskComment(taskId: string, comment: TaskComment): Promise<void>;
  setTaskDueDate(taskId: string, dueDate: Date): Promise<void>;
  getTasks(filters: TaskFilters): Promise<Task[]>;
  getTaskMetrics(tenantId: string, period: DateRange): Promise<TaskMetrics>;
}

interface Task {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  type: TaskType;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  assignee?: TaskAssignee;
  reporter: TaskReporter;
  watchers: TaskWatcher[];
  dueDate?: Date;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  attachments: TaskAttachment[];
  comments: TaskComment[];
  subtasks: string[];
  dependencies: TaskDependency[];
  workflow?: WorkflowReference;
  customFields: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

enum TaskStatus {
  BACKLOG = 'backlog',
  TODO = 'todo',
  IN_PROGRESS = 'in_progress',
  IN_REVIEW = 'in_review',
  BLOCKED = 'blocked',
  DONE = 'done',
  CANCELLED = 'cancelled'
}

enum TaskPriority {
  CRITICAL = 'critical',
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

interface TaskDependency {
  taskId: string;
  type: DependencyType;
  description?: string;
}

enum DependencyType {
  BLOCKS = 'blocks',
  BLOCKED_BY = 'blocked_by',
  RELATES_TO = 'relates_to',
  DUPLICATES = 'duplicates',
  SUBTASK_OF = 'subtask_of'
}

class EnterpriseTaskManager implements TaskManagementSystem {
  async createTask(taskData: TaskCreationRequest): Promise<Task> {
    // Validate task data
    await this.validateTaskData(taskData);
    
    // Create task
    const task: Task = {
      id: this.generateTaskId(),
      tenantId: taskData.tenantId,
      title: taskData.title,
      description: taskData.description,
      type: taskData.type,
      status: TaskStatus.BACKLOG,
      priority: taskData.priority || TaskPriority.MEDIUM,
      category: taskData.category,
      reporter: {
        userId: taskData.reporterId,
        name: taskData.reporterName,
        email: taskData.reporterEmail
      },
      watchers: taskData.watchers || [],
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      tags: taskData.tags || [],
      attachments: [],
      comments: [],
      subtasks: [],
      dependencies: taskData.dependencies || [],
      customFields: taskData.customFields || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Auto-assign based on rules
    if (taskData.autoAssign) {
      const assignee = await this.determineAutoAssignee(task);
      if (assignee) {
        task.assignee = assignee;
      }
    }
    
    // Store task
    await this.taskRepository.create(task);
    
    // Create workflow if specified
    if (taskData.workflowId) {
      await this.workflowEngine.startWorkflowExecution(taskData.workflowId, {
        taskId: task.id,
        taskData: task
      });
    }
    
    // Send notifications
    await this.sendTaskNotifications(task, 'created');
    
    // Update metrics
    await this.updateTaskMetrics(task.tenantId);
    
    return task;
  }

  async updateTaskStatus(taskId: string, status: TaskStatus, updateData?: TaskUpdate): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new TaskNotFoundError(`Task ${taskId} not found`);
    }
    
    const previousStatus = task.status;
    task.status = status;
    task.updatedAt = new Date();
    
    // Handle status-specific logic
    switch (status) {
      case TaskStatus.IN_PROGRESS:
        if (!task.assignee) {
          throw new TaskAssignmentRequiredError('Task must be assigned before starting');
        }
        break;
      
      case TaskStatus.DONE:
        task.completedAt = new Date();
        if (updateData?.actualHours) {
          task.actualHours = updateData.actualHours;
        }
        break;
      
      case TaskStatus.BLOCKED:
        if (!updateData?.blockingReason) {
          throw new BlockingReasonRequiredError('Blocking reason is required');
        }
        break;
    }
    
    // Check dependencies
    if (status === TaskStatus.DONE) {
      await this.checkAndUnblockDependentTasks(taskId);
    }
    
    // Update task
    await this.taskRepository.update(task);
    
    // Add status change comment
    await this.addTaskComment(taskId, {
      userId: updateData?.updatedBy || 'system',
      content: `Status changed from ${previousStatus} to ${status}`,
      type: 'status_change',
      timestamp: new Date()
    });
    
    // Trigger workflow events
    if (task.workflow) {
      await this.workflowEngine.triggerEvent(task.workflow.executionId, 'task.status_changed', {
        taskId,
        previousStatus,
        newStatus: status
      });
    }
    
    // Send notifications
    await this.sendTaskNotifications(task, 'status_changed', { previousStatus });
  }

  private async checkAndUnblockDependentTasks(completedTaskId: string): Promise<void> {
    // Find tasks that are blocked by this task
    const dependentTasks = await this.taskRepository.findByDependency(completedTaskId, DependencyType.BLOCKED_BY);
    
    for (const dependentTask of dependentTasks) {
      // Check if all blocking dependencies are resolved
      const blockingDependencies = dependentTask.dependencies.filter(dep => dep.type === DependencyType.BLOCKED_BY);
      const unresolvedBlocking = await this.getUnresolvedDependencies(blockingDependencies);
      
      if (unresolvedBlocking.length === 0 && dependentTask.status === TaskStatus.BLOCKED) {
        // Unblock the task
        await this.updateTaskStatus(dependentTask.id, TaskStatus.TODO, {
          updatedBy: 'system'
        });
        
        await this.addTaskComment(dependentTask.id, {
          userId: 'system',
          content: `Task unblocked - all dependencies resolved`,
          type: 'system',
          timestamp: new Date()
        });
      }
    }
  }
}
```

### Business Process Automation

```typescript
interface BusinessProcessAutomation {
  createProcess(processDefinition: ProcessDefinition): Promise<BusinessProcess>;
  executeProcess(processId: string, input: ProcessInput): Promise<ProcessExecution>;
  monitorProcess(executionId: string): Promise<ProcessMonitoring>;
  optimizeProcess(processId: string): Promise<ProcessOptimization>;
  generateProcessReport(processId: string, period: DateRange): Promise<ProcessReport>;
}

interface ProcessDefinition {
  id: string;
  name: string;
  description: string;
  category: ProcessCategory;
  triggers: ProcessTrigger[];
  activities: ProcessActivity[];
  gateways: ProcessGateway[];
  events: ProcessEvent[];
  dataObjects: ProcessDataObject[];
  rules: BusinessRule[];
  sla: ProcessSLA;
  compliance: ComplianceRequirement[];
}

interface ProcessActivity {
  id: string;
  name: string;
  type: ActivityType;
  implementation: ActivityImplementation;
  inputData: DataMapping[];
  outputData: DataMapping[];
  resources: ResourceRequirement[];
  duration: ActivityDuration;
  cost: ActivityCost;
  quality: QualityMetric[];
}

enum ActivityType {
  USER_TASK = 'user_task',
  SERVICE_TASK = 'service_task',
  SCRIPT_TASK = 'script_task',
  BUSINESS_RULE_TASK = 'business_rule_task',
  MANUAL_TASK = 'manual_task',
  RECEIVE_TASK = 'receive_task',
  SEND_TASK = 'send_task',
  CALL_ACTIVITY = 'call_activity'
}

class BPMNProcessEngine implements BusinessProcessAutomation {
  async executeProcess(processId: string, input: ProcessInput): Promise<ProcessExecution> {
    const processDefinition = await this.processRepository.findById(processId);
    if (!processDefinition) {
      throw new ProcessNotFoundError(`Process ${processId} not found`);
    }
    
    // Create process execution instance
    const execution: ProcessExecution = {
      id: this.generateExecutionId(),
      processId,
      tenantId: input.tenantId,
      status: ProcessStatus.RUNNING,
      input,
      variables: { ...input.variables },
      activityInstances: [],
      currentActivities: [],
      startedAt: new Date(),
      startedBy: input.startedBy
    };
    
    // Store execution
    await this.executionRepository.create(execution);
    
    // Find start events
    const startEvents = processDefinition.events.filter(event => event.type === 'start');
    
    // Execute start events
    for (const startEvent of startEvents) {
      await this.executeEvent(execution, startEvent);
    }
    
    // Start process monitoring
    await this.startProcessMonitoring(execution);
    
    return execution;
  }

  private async executeActivity(execution: ProcessExecution, activity: ProcessActivity): Promise<void> {
    const activityInstance: ActivityInstance = {
      id: this.generateActivityInstanceId(),
      activityId: activity.id,
      executionId: execution.id,
      status: ActivityStatus.RUNNING,
      startedAt: new Date(),
      input: this.mapInputData(execution.variables, activity.inputData),
      output: {}
    };
    
    execution.activityInstances.push(activityInstance);
    execution.currentActivities.push(activity.id);
    
    try {
      switch (activity.type) {
        case ActivityType.USER_TASK:
          await this.executeUserTask(execution, activity, activityInstance);
          break;
        
        case ActivityType.SERVICE_TASK:
          await this.executeServiceTask(execution, activity, activityInstance);
          break;
        
        case ActivityType.SCRIPT_TASK:
          await this.executeScriptTask(execution, activity, activityInstance);
          break;
        
        case ActivityType.BUSINESS_RULE_TASK:
          await this.executeBusinessRuleTask(execution, activity, activityInstance);
          break;
        
        default:
          throw new UnsupportedActivityTypeError(`Activity type ${activity.type} not supported`);
      }
      
      activityInstance.status = ActivityStatus.COMPLETED;
      activityInstance.completedAt = new Date();
      
      // Map output data back to process variables
      this.mapOutputData(activityInstance.output, activity.outputData, execution.variables);
      
      // Continue to next activities
      await this.continueProcess(execution, activity);
      
    } catch (error) {
      activityInstance.status = ActivityStatus.FAILED;
      activityInstance.error = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date()
      };
      
      // Handle error according to process definition
      await this.handleActivityError(execution, activity, error);
    }
    
    // Update execution
    await this.executionRepository.update(execution);
  }

  private async executeUserTask(execution: ProcessExecution, activity: ProcessActivity, instance: ActivityInstance): Promise<void> {
    const userTaskConfig = activity.implementation as UserTaskImplementation;
    
    // Create task
    const task = await this.taskManager.createTask({
      tenantId: execution.tenantId,
      title: userTaskConfig.name,
      description: userTaskConfig.description,
      type: TaskType.WORKFLOW,
      priority: userTaskConfig.priority,
      category: userTaskConfig.category,
      reporterId: execution.startedBy,
      reporterName: 'System',
      reporterEmail: 'system@company.com',
      dueDate: userTaskConfig.dueDate ? new Date(Date.now() + userTaskConfig.dueDate) : undefined,
      estimatedHours: userTaskConfig.estimatedHours,
      customFields: {
        processExecutionId: execution.id,
        activityInstanceId: instance.id,
        processVariables: execution.variables
      }
    });
    
    // Assign task based on assignment rules
    if (userTaskConfig.assignmentRules) {
      const assignee = await this.resolveTaskAssignee(userTaskConfig.assignmentRules, execution);
      if (assignee) {
        await this.taskManager.assignTask(task.id, assignee.userId);
      }
    }
    
    // Wait for task completion
    instance.taskId = task.id;
    instance.status = ActivityStatus.WAITING;
    
    // Set up task completion listener
    await this.setupTaskCompletionListener(execution.id, instance.id, task.id);
  }

  private async executeServiceTask(execution: ProcessExecution, activity: ProcessActivity, instance: ActivityInstance): Promise<void> {
    const serviceTaskConfig = activity.implementation as ServiceTaskImplementation;
    
    // Prepare service call
    const serviceCall: ServiceCall = {
      serviceName: serviceTaskConfig.serviceName,
      operation: serviceTaskConfig.operation,
      input: instance.input,
      timeout: serviceTaskConfig.timeout || 30000,
      retryPolicy: serviceTaskConfig.retryPolicy
    };
    
    // Execute service call
    const result = await this.serviceRegistry.callService(serviceCall);
    
    // Store result
    instance.output = result;
  }
}
```

## Implementation Patterns

### Workflow Execution Patterns

```typescript
class WorkflowExecutionManager {
  async executeWorkflowStep(execution: WorkflowExecution, step: WorkflowStep): Promise<StepResult> {
    // Validate step preconditions
    const preconditionResult = await this.validatePreconditions(execution, step);
    if (!preconditionResult.valid) {
      return { success: false, error: preconditionResult.error };
    }

    // Execute step based on type
    switch (step.type) {
      case StepType.APPROVAL:
        return await this.executeApprovalStep(execution, step);
      case StepType.TASK_ASSIGNMENT:
        return await this.executeTaskAssignmentStep(execution, step);
      case StepType.NOTIFICATION:
        return await this.executeNotificationStep(execution, step);
      case StepType.API_CALL:
        return await this.executeAPICallStep(execution, step);
      case StepType.CONDITION:
        return await this.evaluateCondition(execution, step);
      default:
        throw new UnsupportedStepTypeError(`Step type ${step.type} not supported`);
    }
  }

  async handleStepCompletion(execution: WorkflowExecution, step: WorkflowStep, result: StepResult): Promise<void> {
    // Update execution state
    execution.variables = { ...execution.variables, ...result.outputVariables };
    
    // Determine next steps
    const nextSteps = await this.determineNextSteps(execution, step, result);
    
    // Execute next steps (parallel or sequential)
    if (step.parallel) {
      await Promise.all(nextSteps.map(s => this.executeWorkflowStep(execution, s)));
    } else {
      for (const nextStep of nextSteps) {
        await this.executeWorkflowStep(execution, nextStep);
      }
    }
  }
}
```

### Approval Chain Patterns

```typescript
class ApprovalChainExecutor {
  async processApprovalChain(chain: ApprovalChain, request: ApprovalRequest): Promise<ApprovalResult> {
    for (const step of chain.steps) {
      const stepResult = await this.processApprovalStep(step, request);
      
      if (stepResult.decision === 'rejected') {
        return { approved: false, rejectedAt: step.id, reason: stepResult.reason };
      }
      
      if (stepResult.decision === 'escalated') {
        await this.handleEscalation(chain, step, request);
      }
    }
    
    return { approved: true, completedAt: new Date() };
  }

  private async processApprovalStep(step: ApprovalStep, request: ApprovalRequest): Promise<StepDecision> {
    // Notify approvers
    await this.notifyApprovers(step.approvers, request);
    
    // Wait for required approvals
    const decisions = await this.collectDecisions(step, request);
    
    // Evaluate based on chain type
    return this.evaluateDecisions(step, decisions);
  }
}
```

## Integration Points

### External System Integration

```typescript
interface ExternalSystemIntegration {
  registerSystem(systemConfig: ExternalSystemConfig): Promise<void>;
  callExternalService(systemId: string, operation: string, data: any): Promise<any>;
  handleWebhook(systemId: string, webhookData: WebhookData): Promise<void>;
  syncData(systemId: string, syncConfig: DataSyncConfig): Promise<SyncResult>;
  monitorSystemHealth(systemId: string): Promise<SystemHealthStatus>;
}

interface ExternalSystemConfig {
  id: string;
  name: string;
  type: SystemType;
  connectionConfig: ConnectionConfig;
  authentication: AuthenticationConfig;
  operations: SystemOperation[];
  webhooks: WebhookConfig[];
  dataMapping: DataMappingConfig[];
  healthCheck: HealthCheckConfig;
}

enum SystemType {
  CRM = 'crm',
  ERP = 'erp',
  HRIS = 'hris',
  ACCOUNTING = 'accounting',
  TICKETING = 'ticketing',
  EMAIL = 'email',
  STORAGE = 'storage',
  ANALYTICS = 'analytics',
  CUSTOM_API = 'custom_api'
}

class EnterpriseIntegrationHub implements ExternalSystemIntegration {
  async callExternalService(systemId: string, operation: string, data: any): Promise<any> {
    const systemConfig = await this.getSystemConfig(systemId);
    const operationConfig = systemConfig.operations.find(op => op.name === operation);
    
    if (!operationConfig) {
      throw new OperationNotFoundError(`Operation ${operation} not found for system ${systemId}`);
    }
    
    // Prepare request
    const request = await this.prepareRequest(systemConfig, operationConfig, data);
    
    // Add authentication
    await this.addAuthentication(request, systemConfig.authentication);
    
    // Execute request with retry logic
    const response = await this.executeWithRetry(request, operationConfig.retryPolicy);
    
    // Transform response
    const transformedResponse = await this.transformResponse(response, operationConfig.responseMapping);
    
    // Log integration call
    await this.logIntegrationCall({
      systemId,
      operation,
      input: data,
      output: transformedResponse,
      timestamp: new Date(),
      duration: response.duration,
      success: response.success
    });
    
    return transformedResponse;
  }

  async handleWebhook(systemId: string, webhookData: WebhookData): Promise<void> {
    const systemConfig = await this.getSystemConfig(systemId);
    const webhookConfig = systemConfig.webhooks.find(wh => wh.endpoint === webhookData.endpoint);
    
    if (!webhookConfig) {
      throw new WebhookNotFoundError(`Webhook ${webhookData.endpoint} not configured for system ${systemId}`);
    }
    
    // Verify webhook signature
    if (webhookConfig.signatureVerification) {
      await this.verifyWebhookSignature(webhookData, webhookConfig.signatureVerification);
    }
    
    // Transform webhook data
    const transformedData = await this.transformWebhookData(webhookData.payload, webhookConfig.dataMapping);
    
    // Trigger workflows based on webhook event
    const triggeredWorkflows = await this.triggerWebhookWorkflows(systemId, webhookConfig.eventType, transformedData);
    
    // Log webhook processing
    await this.logWebhookProcessing({
      systemId,
      webhookId: webhookConfig.id,
      eventType: webhookConfig.eventType,
      data: transformedData,
      triggeredWorkflows: triggeredWorkflows.map(wf => wf.id),
      timestamp: new Date()
    });
  }
}
```

### Enterprise Directory Integration

```typescript
interface DirectoryIntegration {
  syncUsers(directoryId: string): Promise<UserSyncResult>;
  syncGroups(directoryId: string): Promise<GroupSyncResult>;
  resolveUserHierarchy(userId: string): Promise<UserHierarchy>;
  getOrgChart(tenantId: string): Promise<OrganizationChart>;
  validateUserPermissions(userId: string, resource: string): Promise<boolean>;
}

class ActiveDirectoryIntegration implements DirectoryIntegration {
  async syncUsers(directoryId: string): Promise<UserSyncResult> {
    const directoryConfig = await this.getDirectoryConfig(directoryId);
    const ldapClient = new LDAPClient(directoryConfig.connectionString);
    
    await ldapClient.bind(directoryConfig.bindDN, directoryConfig.bindPassword);
    
    const searchResult = await ldapClient.search(directoryConfig.userBaseDN, {
      filter: directoryConfig.userFilter || '(objectClass=user)',
      attributes: [
        'sAMAccountName', 'displayName', 'mail', 'department',
        'title', 'manager', 'memberOf', 'employeeID'
      ],
      scope: 'sub'
    });
    
    const syncResult: UserSyncResult = {
      processed: 0,
      created: 0,
      updated: 0,
      deactivated: 0,
      errors: []
    };
    
    for (const entry of searchResult.entries) {
      try {
        const userData = this.mapLDAPUserData(entry);
        const existingUser = await this.userService.findByEmployeeId(userData.employeeId);
        
        if (existingUser) {
          // Update existing user
          await this.userService.updateUser(existingUser.id, userData);
          syncResult.updated++;
        } else {
          // Create new user
          await this.userService.createUser(userData);
          syncResult.created++;
        }
        
        syncResult.processed++;
      } catch (error) {
        syncResult.errors.push({
          dn: entry.dn,
          error: error.message
        });
      }
    }
    
    // Deactivate users not found in directory
    const deactivatedUsers = await this.deactivateRemovedUsers(directoryId, searchResult.entries);
    syncResult.deactivated = deactivatedUsers.length;
    
    await ldapClient.unbind();
    return syncResult;
  }

  async resolveUserHierarchy(userId: string): Promise<UserHierarchy> {
    const user = await this.userService.getUser(userId);
    const hierarchy: UserHierarchy = {
      user,
      manager: null,
      directReports: [],
      department: null,
      level: 0
    };
    
    // Get manager
    if (user.managerId) {
      hierarchy.manager = await this.userService.getUser(user.managerId);
      hierarchy.level = await this.calculateUserLevel(user.managerId) + 1;
    }
    
    // Get direct reports
    hierarchy.directReports = await this.userService.getDirectReports(userId);
    
    // Get department info
    if (user.departmentId) {
      hierarchy.department = await this.departmentService.getDepartment(user.departmentId);
    }
    
    return hierarchy;
  }
}
```

## Security Considerations

### Workflow Security

```typescript
interface WorkflowSecurityManager {
  validateWorkflowPermissions(userId: string, workflowId: string, action: string): Promise<boolean>;
  auditWorkflowExecution(executionId: string): Promise<WorkflowAudit>;
  encryptSensitiveData(data: any, context: SecurityContext): Promise<EncryptedData>;
  validateDataAccess(userId: string, dataType: string, dataId: string): Promise<boolean>;
  monitorSuspiciousActivity(tenantId: string): Promise<SecurityAlert[]>;
}

class WorkflowSecurityService implements WorkflowSecurityManager {
  async validateWorkflowPermissions(userId: string, workflowId: string, action: string): Promise<boolean> {
    const workflow = await this.workflowRepository.findById(workflowId);
    if (!workflow) {
      return false;
    }
    
    // Check user permissions for the workflow
    const userPermissions = await this.permissionService.getUserPermissions(userId);
    const requiredPermission = `workflow:${action}:${workflowId}`;
    
    if (userPermissions.includes(requiredPermission) || userPermissions.includes(`workflow:${action}:*`)) {
      return true;
    }
    
    // Check role-based permissions
    const userRoles = await this.roleService.getUserRoles(userId);
    for (const role of userRoles) {
      const rolePermissions = await this.permissionService.getRolePermissions(role.id);
      if (rolePermissions.includes(requiredPermission) || rolePermissions.includes(`workflow:${action}:*`)) {
        return true;
      }
    }
    
    // Check workflow-specific permissions
    const workflowPermissions = workflow.permissions.find(p => p.userId === userId || userRoles.some(r => r.id === p.roleId));
    if (workflowPermissions && workflowPermissions.actions.includes(action)) {
      return true;
    }
    
    return false;
  }

  async auditWorkflowExecution(executionId: string): Promise<WorkflowAudit> {
    const execution = await this.executionRepository.findById(executionId);
    const auditTrail: WorkflowAudit = {
      executionId,
      workflowId: execution.workflowId,
      tenantId: execution.tenantId,
      startedBy: execution.startedBy,
      startedAt: execution.startedAt,
      completedAt: execution.completedAt,
      status: execution.status,
      activities: [],
      dataAccess: [],
      securityEvents: []
    };
    
    // Audit each activity
    for (const activityInstance of execution.activityInstances) {
      const activityAudit: ActivityAudit = {
        activityId: activityInstance.activityId,
        instanceId: activityInstance.id,
        startedAt: activityInstance.startedAt,
        completedAt: activityInstance.completedAt,
        status: activityInstance.status,
        executedBy: activityInstance.executedBy,
        inputData: this.sanitizeAuditData(activityInstance.input),
        outputData: this.sanitizeAuditData(activityInstance.output),
        dataAccessed: activityInstance.dataAccessed || []
      };
      
      auditTrail.activities.push(activityAudit);
    }
    
    // Check for security events
    const securityEvents = await this.securityEventRepository.findByExecution(executionId);
    auditTrail.securityEvents = securityEvents;
    
    return auditTrail;
  }

  private sanitizeAuditData(data: any): any {
    if (!data) return data;
    
    const sanitized = { ...data };
    const sensitiveFields = ['password', 'ssn', 'creditCard', 'bankAccount', 'apiKey', 'token'];
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      const result = Array.isArray(obj) ? [] : {};
      
      for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
          result[key] = '[REDACTED]';
        } else if (typeof value === 'object') {
          result[key] = sanitizeObject(value);
        } else {
          result[key] = value;
        }
      }
      
      return result;
    };
    
    return sanitizeObject(sanitized);
  }
}
```

## Compliance Requirements

### Process Compliance Management

```typescript
interface ProcessComplianceManager {
  validateSOXCompliance(processId: string): Promise<SOXComplianceResult>;
  generateComplianceReport(tenantId: string, framework: ComplianceFramework): Promise<ComplianceReport>;
  auditProcessControls(processId: string): Promise<ControlAuditResult>;
  trackComplianceMetrics(tenantId: string): Promise<ComplianceMetrics>;
  handleComplianceViolation(violation: ComplianceViolation): Promise<void>;
}

class ProcessComplianceService implements ProcessComplianceManager {
  async validateSOXCompliance(processId: string): Promise<SOXComplianceResult> {
    const process = await this.processRepository.findById(processId);
    const complianceResult: SOXComplianceResult = {
      processId,
      compliant: true,
      violations: [],
      recommendations: [],
      auditDate: new Date()
    };
    
    // Check for segregation of duties
    const sodViolations = await this.checkSegregationOfDuties(process);
    if (sodViolations.length > 0) {
      complianceResult.compliant = false;
      complianceResult.violations.push(...sodViolations);
    }
    
    // Check for proper authorization controls
    const authViolations = await this.checkAuthorizationControls(process);
    if (authViolations.length > 0) {
      complianceResult.compliant = false;
      complianceResult.violations.push(...authViolations);
    }
    
    // Check for audit trail completeness
    const auditViolations = await this.checkAuditTrailCompleteness(process);
    if (auditViolations.length > 0) {
      complianceResult.compliant = false;
      complianceResult.violations.push(...auditViolations);
    }
    
    // Check for change management controls
    const changeViolations = await this.checkChangeManagementControls(process);
    if (changeViolations.length > 0) {
      complianceResult.compliant = false;
      complianceResult.violations.push(...changeViolations);
    }
    
    // Generate recommendations
    complianceResult.recommendations = await this.generateComplianceRecommendations(complianceResult.violations);
    
    return complianceResult;
  }

  private async checkSegregationOfDuties(process: BusinessProcess): Promise<ComplianceViolation[]> {
    const violations: ComplianceViolation[] = [];
    const executions = await this.executionRepository.findByProcessId(process.id, { limit: 100 });
    
    for (const execution of executions) {
      const userActivities = new Map<string, string[]>();
      
      // Group activities by user
      for (const activity of execution.activityInstances) {
        if (activity.executedBy) {
          if (!userActivities.has(activity.executedBy)) {
            userActivities.set(activity.executedBy, []);
          }
          userActivities.get(activity.executedBy)!.push(activity.activityId);
        }
      }
      
      // Check for SOD violations
      for (const [userId, activities] of userActivities) {
        const conflictingActivities = this.findConflictingActivities(activities, process.sodRules);
        
        if (conflictingActivities.length > 0) {
          violations.push({
            type: 'segregation_of_duties',
            severity: 'high',
            description: `User ${userId} performed conflicting activities`,
            details: {
              userId,
              conflictingActivities,
              executionId: execution.id
            },
            detectedAt: new Date()
          });
        }
      }
    }
    
    return violations;
  }
}
```

## Testing Considerations

### Workflow Testing Strategies

```typescript
// Workflow execution testing
describe('Workflow Engine', () => {
  it('should execute sequential approval workflow correctly', async () => {
    const workflowDefinition = createSequentialApprovalWorkflow({
      approvers: ['manager', 'director', 'vp'],
      requiredApprovals: 3
    });
    
    const workflow = await workflowEngine.createWorkflow(workflowDefinition);
    const execution = await workflowEngine.startWorkflowExecution(workflow.id, {
      tenantId: 'test-tenant',
      requesterId: 'user1',
      data: { amount: 10000, description: 'Equipment purchase' }
    });
    
    expect(execution.status).toBe(ExecutionStatus.RUNNING);
    expect(execution.currentStep).toBe('manager_approval');
    
    // Process manager approval
    await approvalSystem.processApproval(execution.id, {
      approverId: 'manager1',
      decision: 'approved',
      comment: 'Approved by manager'
    });
    
    const updatedExecution = await workflowEngine.getExecutionStatus(execution.id);
    expect(updatedExecution.currentStep).toBe('director_approval');
    
    // Process director approval
    await approvalSystem.processApproval(execution.id, {
      approverId: 'director1',
      decision: 'approved',
      comment: 'Approved by director'
    });
    
    // Process VP approval
    await approvalSystem.processApproval(execution.id, {
      approverId: 'vp1',
      decision: 'approved',
      comment: 'Final approval'
    });
    
    const finalExecution = await workflowEngine.getExecutionStatus(execution.id);
    expect(finalExecution.status).toBe(ExecutionStatus.COMPLETED);
  });
  
  it('should handle parallel approval workflow correctly', async () => {
    const workflowDefinition = createParallelApprovalWorkflow({
      approvers: ['finance', 'legal', 'security'],
      minimumApprovals: 2
    });
    
    const workflow = await workflowEngine.createWorkflow(workflowDefinition);
    const execution = await workflowEngine.startWorkflowExecution(workflow.id, {
      tenantId: 'test-tenant',
      requesterId: 'user1',
      data: { contractValue: 50000 }
    });
    
    // All approvers should receive requests simultaneously
    const pendingApprovals = await approvalSystem.getPendingApprovals(execution.id);
    expect(pendingApprovals).toHaveLength(3);
    
    // Process two approvals
    await approvalSystem.processApproval(execution.id, {
      approverId: 'finance1',
      decision: 'approved'
    });
    
    await approvalSystem.processApproval(execution.id, {
      approverId: 'legal1',
      decision: 'approved'
    });
    
    // Should complete with minimum approvals met
    const finalExecution = await workflowEngine.getExecutionStatus(execution.id);
    expect(finalExecution.status).toBe(ExecutionStatus.COMPLETED);
  });
});

// Task management testing
describe('Task Management', () => {
  it('should handle task dependencies correctly', async () => {
    const task1 = await taskManager.createTask({
      tenantId: 'test-tenant',
      title: 'Design Phase',
      type: TaskType.DEVELOPMENT,
      reporterId: 'user1'
    });
    
    const task2 = await taskManager.createTask({
      tenantId: 'test-tenant',
      title: 'Implementation Phase',
      type: TaskType.DEVELOPMENT,
      reporterId: 'user1',
      dependencies: [{
        taskId: task1.id,
        type: DependencyType.BLOCKED_BY
      }]
    });
    
    // Task 2 should be blocked initially
    expect(task2.status).toBe(TaskStatus.BLOCKED);
    
    // Complete task 1
    await taskManager.updateTaskStatus(task1.id, TaskStatus.DONE);
    
    // Task 2 should be unblocked
    const updatedTask2 = await taskManager.getTask(task2.id);
    expect(updatedTask2.status).toBe(TaskStatus.TODO);
  });
});
```

### Performance Testing

- **Workflow execution performance**: Test workflow engine performance under load
- **Approval processing throughput**: Test concurrent approval processing
- **Task management scalability**: Test task creation and updates at scale
- **Integration performance**: Test external system integration response times
- **Database performance**: Test workflow data storage and retrieval performance

This template provides a comprehensive foundation for implementing enterprise-grade workflow automation with sophisticated approval processes, task management, and business process automation capabilities.
