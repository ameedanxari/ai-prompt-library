/**
 * Business Success Metrics Validation
 *
 * Validates development efficiency, quality improvement,
 * cost reduction, time to market, and competitive advantage.
 *
 * Validates: Business success metrics from design
 */

import { describe, it, expect } from 'vitest';
import { PlanOptimizer } from '../../src/planning/plan-optimizer';
import { QualityMetricsCollector } from '../../src/validation/quality-metrics-collector';
import { CompatibilityChecker } from '../../src/validation/compatibility-checker';
import { RawPlan } from '../../src/planning/planning-agent';

describe('Business Success Metrics', () => {
  it('plan optimizer should reduce total execution time via parallelism', async () => {
    const optimizer = new PlanOptimizer();

    const plan: RawPlan = {
      id: 'biz-plan',
      name: 'Business Test Plan',
      requirements: [],
      steps: [
        { id: 's1', title: 'A', requirementId: 'r1', skillId: 'sk1', input: {}, dependencies: [], estimatedDuration: 10000, priority: 1 },
        { id: 's2', title: 'B', requirementId: 'r2', skillId: 'sk2', input: {}, dependencies: [], estimatedDuration: 10000, priority: 1 },
        { id: 's3', title: 'C', requirementId: 'r3', skillId: 'sk3', input: {}, dependencies: ['s1', 's2'], estimatedDuration: 5000, priority: 2 },
      ]
    };

    const result = await optimizer.optimize(plan);
    // s1 and s2 can run in parallel (10s), then s3 (5s) = 15s total vs 25s sequential
    expect(result.savings).toBeGreaterThan(0);
    expect(result.parallelBatches.length).toBeGreaterThanOrEqual(2);
  });

  it('quality metrics should detect improving trends', () => {
    const collector = new QualityMetricsCollector();

    collector.record('run-1', { coverage: 60 });
    collector.record('run-2', { coverage: 70 });
    collector.record('run-3', { coverage: 75 });
    collector.record('run-4', { coverage: 82 });
    collector.record('run-5', { coverage: 88 });

    const trend = collector.analyseTrend('coverage');
    expect(trend).toBe('improving');
  });

  it('quality metrics should detect degrading trends', () => {
    const collector = new QualityMetricsCollector();

    collector.record('run-1', { coverage: 90 });
    collector.record('run-2', { coverage: 85 });
    collector.record('run-3', { coverage: 78 });
    collector.record('run-4', { coverage: 70 });
    collector.record('run-5', { coverage: 60 });

    const trend = collector.analyseTrend('coverage');
    expect(trend).toBe('degrading');
  });

  it('compatibility checker should validate migration plans', () => {
    const checker = new CompatibilityChecker();

    const good = checker.validateMigration(['Backup database', 'Run migration', 'Verify', 'Rollback plan ready']);
    expect(good.valid).toBe(true);

    const bad = checker.validateMigration(['Run migration']);
    expect(bad.valid).toBe(false);
    expect(bad.issues.length).toBeGreaterThan(0);
  });

  it('backward compatibility should detect breaking changes', () => {
    const checker = new CompatibilityChecker();

    const result = checker.check(
      ['POST /users', 'GET /users'],           // current
      ['POST /users', 'GET /users', 'DELETE /users'] // previous
    );

    expect(result.compatible).toBe(false);
    expect(result.breakingChanges).toContain('Removed: DELETE /users');
  });
});
