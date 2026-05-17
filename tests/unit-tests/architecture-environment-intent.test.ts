import { describe, expect, it } from 'vitest';
import { ConsistencyChecker } from '../../src/architecture/consistency-checker';
import { ConstraintEnforcer } from '../../src/architecture/constraint-enforcer';
import { DecisionRecorder } from '../../src/architecture/decision-recorder';
import { PatternRecognizer } from '../../src/architecture/pattern-recognizer';
import { DeploymentConfigurator } from '../../src/environment/deployment-configurator';
import { EnvironmentDetector } from '../../src/environment/environment-detector';
import { PlatformOptimizer } from '../../src/environment/platform-optimizer';
import { ResourceMonitor } from '../../src/environment/resource-monitor';
import { DefaultIntentParser } from '../../src/intent/intent-parser';
import { ExecutionContext } from '../../src/execution/execution-runtime';

function context(input: any = {}, output: any = {}): ExecutionContext {
  return {
    taskId: 'task-1',
    startTime: new Date(),
    status: 'completed',
    input,
    output,
    artifacts: [],
  };
}

describe('architecture continuity components', () => {
  it('enforces architectural constraints from context state', async () => {
    const result = await new ConstraintEnforcer().enforce(context({
      layerViolations: ['domain -> infrastructure'],
      interfaces: ['UserService', 'bad-name'],
    }));

    expect(result.passed).toBe(false);
    expect(result.violations.join('\n')).toContain('domain -> infrastructure');
  });

  it('detects dependency cycles and records decisions', async () => {
    const checker = new ConsistencyChecker();
    const violations = await checker.checkConsistency(context({
      dependencies: { a: ['b'], b: ['a'] },
    }));
    expect(violations[0]).toMatchObject({ type: 'circular-dependency' });

    const recorder = new DecisionRecorder();
    await recorder.recordDecision({
      id: 'ADR-001',
      title: 'Use skill graph',
      status: 'accepted',
      context: 'Runtime needs reusable engineering skills.',
      decision: 'Use a typed skill graph.',
      rationale: 'Enables dependency-aware planning.',
      alternatives: ['Raw prompts'],
      consequences: { positive: ['Composable'], negative: [], neutral: [] },
      references: [],
    });
    expect(await recorder.generateReport()).toContain('Use skill graph');
  });

  it('recognizes and suggests architectural patterns', async () => {
    const recognizer = new PatternRecognizer();
    await expect(recognizer.recognizePatterns(context({}, { notes: 'publish event to subscribers' })))
      .resolves.toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Observer' })]));
    await expect(recognizer.suggestPatterns('need pub/sub events'))
      .resolves.toEqual(expect.arrayContaining([expect.objectContaining({ name: 'Observer' })]));
  });
});

describe('environment awareness components', () => {
  it('detects environment capabilities and profiles platform work', async () => {
    const detector = new EnvironmentDetector();
    const env = await detector.detect();
    expect(env.platform).toBeTruthy();
    expect(await detector.checkDependency('node')).toBe(true);

    const optimizer = new PlatformOptimizer();
    await expect(optimizer.optimize(env)).resolves.toContain('opt-mem-gc');
    await expect(optimizer.profile('noop', async () => undefined)).resolves.toBeGreaterThanOrEqual(0);
  });

  it('captures resource snapshots and validates deployment config', async () => {
    const monitor = new ResourceMonitor();
    const snapshot = await monitor.captureSnapshot();
    expect(snapshot.freeMemory + snapshot.usedMemory).toBeGreaterThan(0);

    const configurator = new DeploymentConfigurator();
    configurator.registerConfig({
      name: 'test',
      variables: { NODE_ENV: 'test' },
      secrets: [],
      scaling: { min: 1, max: 3, targetCpu: 80 },
    });
    await expect(configurator.validateConfig('test')).resolves.toEqual({ valid: true, missing: [] });
    await expect(configurator.generateManifest('test', 'kubernetes')).resolves.toContain('kind: Deployment');
  });
});

describe('intent translation', () => {
  it('extracts expected product requirements from a small natural-language prompt', async () => {
    const parser = new DefaultIntentParser();
    const parsed = await parser.parseIntent('Build a social app with login, profiles, feed, GDPR privacy, and Stripe subscriptions');
    const requirements = await parser.extractRequirements(parsed);

    expect(requirements).toEqual(expect.arrayContaining([
      'Authentication and account access',
      'User profile management',
      'Content feed and engagement workflows',
      'Billing and payment integration',
      'Privacy, consent, export, and deletion controls',
    ]));
  });
});
