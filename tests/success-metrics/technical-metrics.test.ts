/**
 * Technical Success Metrics Validation
 *
 * Validates code generation quality, execution success rate,
 * performance improvement, resource efficiency, and system reliability.
 *
 * Validates: Technical success metrics from design
 */

import { describe, it, expect } from 'vitest';
import { MetricCollector } from '../../src/observation/metric-collector';
import { ConfidenceScorer } from '../../src/reliability/confidence-scorer';
import { HealthCheck } from '../../src/monitoring/health-check';

describe('Technical Success Metrics', () => {
  it('confidence scorer should produce scores above 75 for clean inputs', () => {
    const scorer = new ConfidenceScorer();
    const result = scorer.calculate({
      testsPassed: 50,
      testsFailed: 0,
      testsCoverage: 90,
      lintErrors: 0,
      lintWarnings: 2,
      typeErrors: 0,
      critiqueResults: [],
      historicalSuccessRate: 0.95
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(75);
    expect(scorer.meetsThreshold(result)).toBe(true);
  });

  it('metric collector should track success rates accurately', () => {
    const collector = new MetricCollector();

    for (let i = 0; i < 90; i++) collector.recordOutcome(`task-${i}`, true);
    for (let i = 0; i < 10; i++) collector.recordOutcome(`fail-${i}`, false);

    expect(collector.getSuccessRate()).toBeCloseTo(0.9, 1);
  });

  it('health check should report healthy under normal conditions', async () => {
    const health = new HealthCheck('1.0.0');
    const result = await health.check();

    expect(result.status).toBe('healthy');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('metric aggregation should provide accurate p95', () => {
    const collector = new MetricCollector();

    for (let i = 1; i <= 100; i++) {
      collector.record('response_time', i, 'ms');
    }

    const agg = collector.aggregate('response_time');
    expect(agg).toBeDefined();
    expect(agg!.p95).toBeGreaterThanOrEqual(95);
    expect(agg!.avg).toBeCloseTo(50.5, 0);
  });
});
