# IoT Automation Template

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

This template provides comprehensive patterns for implementing rule engines, trigger systems, scene management, and scheduling in IoT applications. It covers event-driven automation, complex event processing, workflow orchestration, and intelligent automation based on sensor data and device states.

## Context

IoT automation enables devices to respond intelligently to events, conditions, and schedules without manual intervention. This template addresses the implementation of automation systems that can handle complex rules, multi-device coordination, and adaptive behaviors while maintaining reliability and user control.

## Core Components

### Rule Engine Service

## Examples

```typescript
interface RuleEngineService {
  createRule(rule: AutomationRule): Promise<AutomationRule>;
  updateRule(ruleId: string, updates: Partial<AutomationRule>): Promise<AutomationRule>;
  deleteRule(ruleId: string): Promise<void>;
  enableRule(ruleId: string): Promise<void>;
  disableRule(ruleId: string): Promise<void>;
  evaluateRule(ruleId: string, context: EvaluationContext): Promise<RuleEvaluationResult>;
  getRules(filter?: RuleFilter): Promise<AutomationRule[]>;
  getRuleExecutionHistory(ruleId: string): Promise<RuleExecution[]>;
}

interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  triggers: RuleTrigger[];
  conditions: RuleCondition[];
  actions: RuleAction[];
  cooldown?: number;
  maxExecutions?: number;
  schedule?: RuleSchedule;
  metadata: RuleMetadata;
  createdAt: Date;
  updatedAt: Date;
}

interface RuleTrigger {
  id: string;
  type: TriggerType;
  source: TriggerSource;
  config: TriggerConfig;
}

enum TriggerType {
  DEVICE_STATE = 'device_state',
  SENSOR_VALUE = 'sensor_value',
  TIME = 'time',
  SCHEDULE = 'schedule',
  EVENT = 'event',
  WEBHOOK = 'webhook',
  GEOFENCE = 'geofence',
  MANUAL = 'manual'
}

interface TriggerSource {
  deviceId?: string;
  sensorId?: string;
  eventType?: string;
  webhookId?: string;
  geofenceId?: string;
}

interface TriggerConfig {
  operator?: ComparisonOperator;
  threshold?: number;
  state?: string;
  eventPattern?: string;
  debounce?: number;
}

enum ComparisonOperator {
  EQUALS = 'equals',
  NOT_EQUALS = 'not_equals',
  GREATER_THAN = 'greater_than',
  LESS_THAN = 'less_than',
  GREATER_THAN_OR_EQUALS = 'greater_than_or_equals',
  LESS_THAN_OR_EQUALS = 'less_than_or_equals',
  BETWEEN = 'between',
  CONTAINS = 'contains',
  MATCHES = 'matches'
}

interface RuleCondition {
  id: string;
  type: ConditionType;
  operator: LogicalOperator;
  conditions?: RuleCondition[];
  expression?: ConditionExpression;
}

enum ConditionType {
  SIMPLE = 'simple',
  COMPOUND = 'compound',
  TIME_BASED = 'time_based',
  STATE_BASED = 'state_based',
  EXPRESSION = 'expression'
}

enum LogicalOperator {
  AND = 'and',
  OR = 'or',
  NOT = 'not'
}

interface RuleAction {
  id: string;
  type: ActionType;
  target: ActionTarget;
  parameters: ActionParameters;
  delay?: number;
  retryConfig?: RetryConfig;
}

enum ActionType {
  DEVICE_COMMAND = 'device_command',
  NOTIFICATION = 'notification',
  WEBHOOK = 'webhook',
  SCENE = 'scene',
  VARIABLE = 'variable',
  RULE = 'rule',
  CUSTOM = 'custom'
}
```

### Trigger System Service

```typescript
interface TriggerSystemService {
  registerTrigger(trigger: TriggerDefinition): Promise<string>;
  unregisterTrigger(triggerId: string): Promise<void>;
  onTriggerFired(callback: (event: TriggerEvent) => void): Subscription;
  getTriggerStatus(triggerId: string): Promise<TriggerStatus>;
  listTriggers(filter?: TriggerFilter): Promise<TriggerDefinition[]>;
  testTrigger(triggerId: string, testData: unknown): Promise<TriggerTestResult>;
}

interface TriggerDefinition {
  id: string;
  name: string;
  type: TriggerType;
  source: TriggerSource;
  config: TriggerConfig;
  enabled: boolean;
  ruleIds: string[];
}

interface TriggerEvent {
  triggerId: string;
  triggerType: TriggerType;
  timestamp: Date;
  source: TriggerSource;
  data: TriggerEventData;
  context: TriggerContext;
}

interface TriggerEventData {
  previousValue?: unknown;
  currentValue?: unknown;
  delta?: number;
  state?: string;
  event?: unknown;
}

interface TriggerContext {
  deviceId?: string;
  sensorId?: string;
  userId?: string;
  location?: GeoLocation;
  metadata: Record<string, unknown>;
}

interface TriggerStatus {
  triggerId: string;
  enabled: boolean;
  lastFired?: Date;
  fireCount: number;
  errorCount: number;
  lastError?: string;
}
```

### Scene Management Service

```typescript
interface SceneManagementService {
  createScene(scene: Scene): Promise<Scene>;
  updateScene(sceneId: string, updates: Partial<Scene>): Promise<Scene>;
  deleteScene(sceneId: string): Promise<void>;
  activateScene(sceneId: string, options?: ActivationOptions): Promise<SceneActivationResult>;
  deactivateScene(sceneId: string): Promise<void>;
  getScenes(filter?: SceneFilter): Promise<Scene[]>;
  getActiveScenes(): Promise<Scene[]>;
  createSceneFromCurrentState(name: string, deviceIds: string[]): Promise<Scene>;
}

interface Scene {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  deviceStates: DeviceStateConfig[];
  transitionDuration?: number;
  activationConditions?: RuleCondition[];
  deactivationConditions?: RuleCondition[];
  schedule?: SceneSchedule;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface DeviceStateConfig {
  deviceId: string;
  state: Record<string, unknown>;
  transitionDuration?: number;
  order?: number;
}

interface ActivationOptions {
  transitionDuration?: number;
  skipDevices?: string[];
  force?: boolean;
  userId?: string;
}

interface SceneActivationResult {
  sceneId: string;
  success: boolean;
  activatedAt: Date;
  deviceResults: DeviceActivationResult[];
  errors: SceneError[];
}

interface DeviceActivationResult {
  deviceId: string;
  success: boolean;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  error?: string;
}

interface SceneSchedule {
  activateAt?: ScheduleTime[];
  deactivateAt?: ScheduleTime[];
  daysOfWeek?: number[];
  timezone?: string;
}

interface ScheduleTime {
  hour: number;
  minute: number;
  second?: number;
}
```

### Scheduling Service

```typescript
interface SchedulingService {
  createSchedule(schedule: Schedule): Promise<Schedule>;
  updateSchedule(scheduleId: string, updates: Partial<Schedule>): Promise<Schedule>;
  deleteSchedule(scheduleId: string): Promise<void>;
  enableSchedule(scheduleId: string): Promise<void>;
  disableSchedule(scheduleId: string): Promise<void>;
  getSchedules(filter?: ScheduleFilter): Promise<Schedule[]>;
  getUpcomingExecutions(scheduleId: string, count: number): Promise<ScheduledExecution[]>;
  executeNow(scheduleId: string): Promise<ExecutionResult>;
}

interface Schedule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  type: ScheduleType;
  cronExpression?: string;
  interval?: IntervalConfig;
  oneTime?: Date;
  timezone: string;
  actions: ScheduledAction[];
  startDate?: Date;
  endDate?: Date;
  maxExecutions?: number;
  executionCount: number;
  lastExecution?: Date;
  nextExecution?: Date;
  createdAt: Date;
  updatedAt: Date;
}

enum ScheduleType {
  CRON = 'cron',
  INTERVAL = 'interval',
  ONE_TIME = 'one_time',
  SUNRISE_SUNSET = 'sunrise_sunset',
  RELATIVE = 'relative'
}

interface IntervalConfig {
  value: number;
  unit: TimeUnit;
  startTime?: Date;
}

interface ScheduledAction {
  id: string;
  type: ActionType;
  target: ActionTarget;
  parameters: ActionParameters;
  order: number;
  condition?: RuleCondition;
}

interface ScheduledExecution {
  scheduleId: string;
  scheduledTime: Date;
  status: ExecutionStatus;
  actions: ScheduledAction[];
}

enum ExecutionStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  CANCELLED = 'cancelled'
}
```

## Implementation Patterns

### Complex Event Processing Engine

```typescript
class ComplexEventProcessor {
  private ruleEngine: RuleEngineService;
  private triggerSystem: TriggerSystemService;
  private eventBuffer: EventBuffer;
  private patternMatcher: PatternMatcher;

  async processEvent(event: IoTEvent): Promise<ProcessingResult> {
    // Add to event buffer for pattern matching
    this.eventBuffer.add(event);

    // Find matching triggers
    const matchingTriggers = await this.findMatchingTriggers(event);

    const results: RuleEvaluationResult[] = [];

    for (const trigger of matchingTriggers) {
      // Get rules associated with this trigger
      const rules = await this.ruleEngine.getRules({
        triggerIds: [trigger.id],
        enabled: true
      });

      // Sort by priority
      rules.sort((a, b) => b.priority - a.priority);

      for (const rule of rules) {
        // Check cooldown
        if (await this.isInCooldown(rule)) {
          continue;
        }

        // Build evaluation context
        const context = this.buildEvaluationContext(event, trigger);

        // Evaluate rule conditions
        const result = await this.ruleEngine.evaluateRule(rule.id, context);

        if (result.conditionsMet) {
          // Execute actions
          await this.executeActions(rule.actions, context);
          
          // Update cooldown
          await this.updateCooldown(rule);
        }

        results.push(result);
      }
    }

    // Check for complex patterns
    const patterns = await this.patternMatcher.findPatterns(this.eventBuffer.getRecent());
    for (const pattern of patterns) {
      await this.handlePattern(pattern);
    }

    return {
      event,
      triggersMatched: matchingTriggers.length,
      rulesEvaluated: results.length,
      actionsExecuted: results.filter(r => r.conditionsMet).length,
      results
    };
  }

  private async findMatchingTriggers(event: IoTEvent): Promise<TriggerDefinition[]> {
    const allTriggers = await this.triggerSystem.listTriggers({ enabled: true });

    return allTriggers.filter(trigger => {
      switch (trigger.type) {
        case TriggerType.DEVICE_STATE:
          return event.type === 'device_state' &&
            event.deviceId === trigger.source.deviceId &&
            this.matchesStateCondition(event.data, trigger.config);

        case TriggerType.SENSOR_VALUE:
          return event.type === 'sensor_reading' &&
            event.sensorId === trigger.source.sensorId &&
            this.matchesValueCondition(event.data.value, trigger.config);

        case TriggerType.EVENT:
          return event.type === trigger.source.eventType &&
            this.matchesEventPattern(event, trigger.config.eventPattern);

        default:
          return false;
      }
    });
  }

  private matchesValueCondition(value: number, config: TriggerConfig): boolean {
    if (!config.operator || config.threshold === undefined) return true;

    switch (config.operator) {
      case ComparisonOperator.EQUALS:
        return value === config.threshold;
      case ComparisonOperator.GREATER_THAN:
        return value > config.threshold;
      case ComparisonOperator.LESS_THAN:
        return value < config.threshold;
      case ComparisonOperator.GREATER_THAN_OR_EQUALS:
        return value >= config.threshold;
      case ComparisonOperator.LESS_THAN_OR_EQUALS:
        return value <= config.threshold;
      default:
        return false;
    }
  }

  private async executeActions(actions: RuleAction[], context: EvaluationContext): Promise<void> {
    // Sort by order if specified
    const sortedActions = [...actions].sort((a, b) => (a.order || 0) - (b.order || 0));

    for (const action of sortedActions) {
      // Apply delay if specified
      if (action.delay) {
        await this.delay(action.delay);
      }

      try {
        await this.executeAction(action, context);
      } catch (error) {
        if (action.retryConfig) {
          await this.retryAction(action, context, action.retryConfig);
        } else {
          throw error;
        }
      }
    }
  }

  private async executeAction(action: RuleAction, context: EvaluationContext): Promise<void> {
    switch (action.type) {
      case ActionType.DEVICE_COMMAND:
        await this.deviceService.sendCommand(
          action.target.deviceId!,
          action.parameters.command,
          action.parameters.value
        );
        break;

      case ActionType.NOTIFICATION:
        await this.notificationService.send({
          type: action.parameters.notificationType,
          recipients: action.parameters.recipients,
          message: this.interpolateTemplate(action.parameters.message, context),
          data: action.parameters.data
        });
        break;

      case ActionType.SCENE:
        await this.sceneService.activateScene(action.target.sceneId!);
        break;

      case ActionType.WEBHOOK:
        await this.webhookService.invoke(action.target.webhookId!, {
          ...action.parameters,
          context
        });
        break;

      case ActionType.RULE:
        await this.ruleEngine.evaluateRule(action.target.ruleId!, context);
        break;
    }
  }
}
```

### Intelligent Scene Controller

```typescript
class IntelligentSceneController implements SceneManagementService {
  private scenes: Map<string, Scene> = new Map();
  private activeScenes: Set<string> = new Set();
  private deviceService: DeviceService;
  private transitionEngine: TransitionEngine;

  async activateScene(sceneId: string, options?: ActivationOptions): Promise<SceneActivationResult> {
    const scene = this.scenes.get(sceneId);
    if (!scene) {
      throw new Error('Scene not found');
    }

    const result: SceneActivationResult = {
      sceneId,
      success: true,
      activatedAt: new Date(),
      deviceResults: [],
      errors: []
    };

    // Check activation conditions
    if (scene.activationConditions && !options?.force) {
      const conditionsMet = await this.evaluateConditions(scene.activationConditions);
      if (!conditionsMet) {
        result.success = false;
        result.errors.push({
          type: 'condition_not_met',
          message: 'Scene activation conditions not met'
        });
        return result;
      }
    }

    // Get current device states for rollback
    const previousStates = new Map<string, Record<string, unknown>>();
    for (const config of scene.deviceStates) {
      if (options?.skipDevices?.includes(config.deviceId)) continue;
      
      const currentState = await this.deviceService.getDeviceState(config.deviceId);
      previousStates.set(config.deviceId, currentState);
    }

    // Calculate transition duration
    const transitionDuration = options?.transitionDuration ?? scene.transitionDuration ?? 1000;

    // Sort devices by order
    const sortedConfigs = [...scene.deviceStates].sort((a, b) => (a.order || 0) - (b.order || 0));

    // Apply device states with transitions
    for (const config of sortedConfigs) {
      if (options?.skipDevices?.includes(config.deviceId)) continue;

      try {
        const deviceTransition = config.transitionDuration ?? transitionDuration;

        await this.transitionEngine.transition(
          config.deviceId,
          previousStates.get(config.deviceId)!,
          config.state,
          deviceTransition
        );

        result.deviceResults.push({
          deviceId: config.deviceId,
          success: true,
          previousState: previousStates.get(config.deviceId),
          newState: config.state
        });
      } catch (error) {
        result.deviceResults.push({
          deviceId: config.deviceId,
          success: false,
          error: (error as Error).message
        });
        result.errors.push({
          type: 'device_error',
          deviceId: config.deviceId,
          message: (error as Error).message
        });
      }
    }

    // Update active scenes
    if (result.deviceResults.some(r => r.success)) {
      this.activeScenes.add(sceneId);
    }

    result.success = result.errors.length === 0;
    return result;
  }

  async createSceneFromCurrentState(name: string, deviceIds: string[]): Promise<Scene> {
    const deviceStates: DeviceStateConfig[] = [];

    for (const deviceId of deviceIds) {
      const state = await this.deviceService.getDeviceState(deviceId);
      deviceStates.push({
        deviceId,
        state
      });
    }

    const scene: Scene = {
      id: crypto.randomUUID(),
      name,
      deviceStates,
      tags: ['auto-created'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.scenes.set(scene.id, scene);
    return scene;
  }
}
```

### Adaptive Scheduling System

```typescript
class AdaptiveSchedulingSystem implements SchedulingService {
  private schedules: Map<string, Schedule> = new Map();
  private scheduler: CronScheduler;
  private learningEngine: ScheduleLearningEngine;

  async createSchedule(schedule: Schedule): Promise<Schedule> {
    // Calculate next execution
    schedule.nextExecution = this.calculateNextExecution(schedule);

    this.schedules.set(schedule.id, schedule);

    // Register with scheduler
    if (schedule.enabled) {
      await this.registerWithScheduler(schedule);
    }

    return schedule;
  }

  private calculateNextExecution(schedule: Schedule): Date {
    switch (schedule.type) {
      case ScheduleType.CRON:
        return this.parseCron(schedule.cronExpression!, schedule.timezone);

      case ScheduleType.INTERVAL:
        const now = new Date();
        const intervalMs = this.toMilliseconds(schedule.interval!.value, schedule.interval!.unit);
        return new Date(now.getTime() + intervalMs);

      case ScheduleType.ONE_TIME:
        return schedule.oneTime!;

      case ScheduleType.SUNRISE_SUNSET:
        return this.calculateSunriseSunset(schedule);

      default:
        return new Date();
    }
  }

  private async registerWithScheduler(schedule: Schedule): Promise<void> {
    const job = async () => {
      // Check if schedule is still valid
      if (!schedule.enabled) return;
      if (schedule.endDate && new Date() > schedule.endDate) return;
      if (schedule.maxExecutions && schedule.executionCount >= schedule.maxExecutions) return;

      // Execute actions
      const result = await this.executeScheduledActions(schedule);

      // Update execution count
      schedule.executionCount++;
      schedule.lastExecution = new Date();
      schedule.nextExecution = this.calculateNextExecution(schedule);

      // Learn from execution for adaptive scheduling
      await this.learningEngine.recordExecution(schedule, result);
    };

    switch (schedule.type) {
      case ScheduleType.CRON:
        this.scheduler.schedule(schedule.id, schedule.cronExpression!, job, schedule.timezone);
        break;

      case ScheduleType.INTERVAL:
        this.scheduler.scheduleInterval(
          schedule.id,
          this.toMilliseconds(schedule.interval!.value, schedule.interval!.unit),
          job
        );
        break;

      case ScheduleType.ONE_TIME:
        this.scheduler.scheduleOnce(schedule.id, schedule.oneTime!, job);
        break;
    }
  }

  private async executeScheduledActions(schedule: Schedule): Promise<ExecutionResult> {
    const results: ActionResult[] = [];

    for (const action of schedule.actions) {
      // Check action condition
      if (action.condition) {
        const conditionMet = await this.evaluateCondition(action.condition);
        if (!conditionMet) {
          results.push({
            actionId: action.id,
            status: 'skipped',
            reason: 'Condition not met'
          });
          continue;
        }
      }

      try {
        await this.executeAction(action);
        results.push({
          actionId: action.id,
          status: 'completed'
        });
      } catch (error) {
        results.push({
          actionId: action.id,
          status: 'failed',
          error: (error as Error).message
        });
      }
    }

    return {
      scheduleId: schedule.id,
      executedAt: new Date(),
      results,
      success: results.every(r => r.status === 'completed' || r.status === 'skipped')
    };
  }
}
```

## Integration Points

### Home Assistant Integration

```typescript
class HomeAssistantAutomationAdapter {
  private haClient: HomeAssistantClient;
  private ruleEngine: RuleEngineService;

  async syncAutomations(): Promise<void> {
    const haAutomations = await this.haClient.getAutomations();

    for (const automation of haAutomations) {
      const rule = this.convertToRule(automation);
      await this.ruleEngine.createRule(rule);
    }
  }

  private convertToRule(automation: HAAutomation): AutomationRule {
    return {
      id: automation.id,
      name: automation.alias,
      description: automation.description,
      enabled: automation.mode !== 'off',
      priority: 0,
      triggers: automation.trigger.map(t => this.convertTrigger(t)),
      conditions: automation.condition?.map(c => this.convertCondition(c)) || [],
      actions: automation.action.map(a => this.convertAction(a)),
      metadata: {
        source: 'home_assistant',
        originalId: automation.id
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
}
```

### Node-RED Integration

```typescript
class NodeREDFlowAdapter {
  private nodeRedClient: NodeREDClient;
  private ruleEngine: RuleEngineService;

  async importFlow(flowJson: string): Promise<AutomationRule[]> {
    const flow = JSON.parse(flowJson);
    const rules: AutomationRule[] = [];

    // Find trigger nodes
    const triggerNodes = flow.filter((n: any) => this.isTriggerNode(n));

    for (const triggerNode of triggerNodes) {
      const rule = await this.buildRuleFromFlow(triggerNode, flow);
      rules.push(rule);
    }

    return rules;
  }

  private isTriggerNode(node: any): boolean {
    const triggerTypes = ['inject', 'mqtt in', 'http in', 'websocket in'];
    return triggerTypes.includes(node.type);
  }
}
```

## Security Considerations

### Rule Security

- Validate all rule expressions to prevent injection attacks
- Implement rate limiting for rule executions
- Audit all rule changes and executions
- Restrict rule creation to authorized users

### Action Security

- Validate action targets before execution
- Implement action whitelisting for sensitive devices
- Use secure communication for webhook actions
- Log all action executions for audit trails

### Access Control

- Implement role-based access for automation management
- Restrict scene activation to authorized users
- Audit all schedule modifications

## Compliance Guidelines

- Safety standards for automated device control
- Privacy considerations for location-based triggers
- Accessibility requirements for automation interfaces
- Industry-specific automation regulations

## Testing Considerations

### Property-Based Tests

```typescript
describe('IoT Automation Properties', () => {
  it('should correctly evaluate rule conditions', () => {
    fc.assert(fc.property(
      fc.record({
        operator: fc.constantFrom(...Object.values(ComparisonOperator)),
        threshold: fc.float({ min: -100, max: 100 }),
        value: fc.float({ min: -100, max: 100 })
      }),
      (testCase) => {
        const processor = new ComplexEventProcessor();
        const result = processor.matchesValueCondition(testCase.value, {
          operator: testCase.operator,
          threshold: testCase.threshold
        });

        // Verify the comparison is mathematically correct
        switch (testCase.operator) {
          case ComparisonOperator.EQUALS:
            expect(result).toBe(testCase.value === testCase.threshold);
            break;
          case ComparisonOperator.GREATER_THAN:
            expect(result).toBe(testCase.value > testCase.threshold);
            break;
          case ComparisonOperator.LESS_THAN:
            expect(result).toBe(testCase.value < testCase.threshold);
            break;
        }
      }
    ));
  });

  it('should maintain scene state consistency', () => {
    fc.assert(fc.property(
      fc.array(fc.record({
        deviceId: fc.string({ minLength: 1, maxLength: 32 }),
        state: fc.dictionary(fc.string(), fc.jsonValue())
      }), { minLength: 1, maxLength: 10 }),
      async (deviceStates) => {
        const controller = new IntelligentSceneController();
        
        const scene = await controller.createSceneFromCurrentState('test', 
          deviceStates.map(d => d.deviceId)
        );

        // Scene should contain all specified devices
        expect(scene.deviceStates.length).toBe(deviceStates.length);
      }
    ));
  });
});
```
