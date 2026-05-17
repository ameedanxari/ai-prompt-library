# Agentic Engineering Runtime – API Reference

## Core: `AgenticRuntime`

The main entry point that orchestrates the full pipeline.

```typescript
import { AgenticRuntime } from './src/agentic-runtime';

const runtime = new AgenticRuntime();
const result = await runtime.run('Build a multi-tenant SaaS CRM');
```

### `run(prompt: string): Promise<PipelineResult>`

Executes the full pipeline from natural-language prompt to validated output.

**Returns:** `PipelineResult` with `stage`, `intent`, `extraction`, `plan`, `executionContext`, `critique`, and `confidence`.

### `getStage(): PipelineStage`

Returns the current pipeline stage: `idle | parsing | planning | executing | reviewing | complete | failed`.

---

## Intent Layer

### `DefaultIntentParser`

```typescript
const parser = new DefaultIntentParser();
const intent = await parser.parseIntent('Add OAuth2 login');
// { raw, category: 'feature', summary, entities, intent, confidence }
```

### `RequirementExtractor`

```typescript
const extractor = new RequirementExtractor();
const result = await extractor.extract(intent);
// { requirements: TechnicalRequirement[], assumptions, risks, suggestedArchitecture }
```

### `DomainProcessor`

```typescript
const processor = new DomainProcessor();
const enriched = await processor.process(intent);
// { original, concepts, domainConstraints, suggestedTechnologies }
```

### `DialogueManager`

```typescript
const dm = new DialogueManager();
const clarifications = await dm.startDialogue(intent);
await dm.processResponse('clarify-auth', 'Yes – OAuth / social');
dm.isReady(); // true when enough info collected
```

---

## Planning Layer

### `DefaultPlanningAgent`

```typescript
const agent = new DefaultPlanningAgent();
const plan = await agent.createPlan(requirements);
const execPlan = await agent.optimizePlan(plan);
```

### `DependencyResolver`

```typescript
const resolver = new DependencyResolver();
const result = resolver.resolve(nodes);
// { resolved, order, cycles, conflicts }
```

---

## Execution Layer

### `ExecutionRuntime`

```typescript
const runtime = new ExecutionRuntime();
const ctx = await runtime.executePlan(plan);
await runtime.checkpoint(ctx.taskId);
await runtime.rollback(ctx.taskId);
```

### `RepairLoop`

```typescript
const loop = new RepairLoop();
const fix = await loop.repair(failedContext);
```

### `QualityGateEnforcer`

```typescript
const gate = new QualityGateEnforcer();
const result = await gate.evaluate(context, metrics);
await gate.enforce(result); // throws if blocked
```

---

## Critic Layer

### `MultiPerspectiveCritic`

```typescript
const critic = new MultiPerspectiveCritic();
critic.registerCritic(new SecurityCritic());
critic.registerCritic(new PerformanceCritic());
const result = await critic.critiqueAll(context);
```

### `ConsensusEngine`

```typescript
const engine = new ConsensusEngine();
const decision = engine.resolve(critiqueResults);
// { aspect, agreedScore, confidence, resolvedIssues, disagreements }
```

---

## Security

### `InputValidator`

```typescript
const validator = new InputValidator();
const result = validator.validate(userInput);
// { valid, sanitised, threats }
```

### `EncryptionService`

```typescript
const enc = new EncryptionService();
const key = enc.generateKey();
const encrypted = enc.encrypt('secret', key);
const decrypted = enc.decrypt(encrypted, key);
```

---

## Monitoring

### `HealthCheck`

```typescript
const health = new HealthCheck('1.0.0');
const status = await health.check();
// { status: 'healthy', components: [...], uptime, version }
```

### `AlertManager`

```typescript
const alerts = new AlertManager();
await alerts.fire('critical', 'execution', 'Pipeline failed');
```

### `MetricsExporter`

```typescript
const exporter = new MetricsExporter();
const prometheus = exporter.toPrometheus(aggregatedMetrics);
```
