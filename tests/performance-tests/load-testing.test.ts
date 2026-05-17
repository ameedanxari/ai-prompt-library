/**
 * Performance and Load Testing
 *
 * Validates system performance under simulated concurrent load.
 *
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { describe, it, expect } from 'vitest';
import { EventBus } from '../../src/coordination/event-bus';
import { MetricCollector } from '../../src/observation/metric-collector';

describe('Performance Tests', () => {
  it('EventBus should handle 1000 events within 500ms', async () => {
    const bus = new EventBus();
    let count = 0;
    bus.on('perf-test', () => { count++; });

    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      await bus.emit('perf-test', 'load-test', { i });
    }
    const elapsed = Date.now() - start;

    expect(count).toBe(1000);
    expect(elapsed).toBeLessThan(500);
  });

  it('MetricCollector should aggregate 10000 samples efficiently', () => {
    const collector = new MetricCollector();

    const start = Date.now();
    for (let i = 0; i < 10000; i++) {
      collector.record('load_metric', Math.random() * 100, 'ms');
    }
    const agg = collector.aggregate('load_metric');
    const elapsed = Date.now() - start;

    expect(agg).toBeDefined();
    expect(agg!.count).toBe(10000);
    expect(elapsed).toBeLessThan(1000);
  });

  it('EventBus should support concurrent subscribers without interference', async () => {
    const bus = new EventBus();
    const results: number[] = [];

    for (let i = 0; i < 50; i++) {
      bus.on('concurrent', (e) => { results.push(e.payload.idx); });
    }

    await bus.emit('concurrent', 'test', { idx: 42 });
    expect(results.length).toBe(50);
    expect(results.every(r => r === 42)).toBe(true);
  });
});
