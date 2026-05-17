/**
 * Property-Based Tests for Skill Composition
 *
 * Validates key algebraic properties of the skill composition engine.
 *
 * Validates: Design correctness properties
 */

import { describe, it, expect } from 'vitest';
import { DependencyResolver } from '../../src/planning/dependency-resolver';

describe('Skill Composition Properties', () => {
  const resolver = new DependencyResolver();

  it('topological sort should be idempotent', () => {
    const nodes = [
      { id: 'a', dependencies: [] },
      { id: 'b', dependencies: ['a'] },
      { id: 'c', dependencies: ['b'] },
    ];

    const first = resolver.topologicalSort(nodes);
    const second = resolver.topologicalSort(nodes);

    expect(first).toEqual(second);
  });

  it('should detect cycles in dependency graph', () => {
    const nodes = [
      { id: 'a', dependencies: ['c'] },
      { id: 'b', dependencies: ['a'] },
      { id: 'c', dependencies: ['b'] },
    ];

    const cycles = resolver.detectCycles(nodes);
    expect(cycles.length).toBeGreaterThan(0);
  });

  it('empty graph should resolve to empty order', () => {
    const result = resolver.resolve([]);
    expect(result.resolved).toBe(true);
    expect(result.order).toEqual([]);
  });

  it('single node with no dependencies should resolve', () => {
    const result = resolver.resolve([{ id: 'x', dependencies: [] }]);
    expect(result.resolved).toBe(true);
    expect(result.order).toEqual(['x']);
  });

  it('dependency order should be preserved', () => {
    const nodes = [
      { id: 'a', dependencies: [] },
      { id: 'b', dependencies: ['a'] },
      { id: 'c', dependencies: ['a', 'b'] },
    ];

    const result = resolver.resolve(nodes);
    expect(result.resolved).toBe(true);
    const idxA = result.order.indexOf('a');
    const idxB = result.order.indexOf('b');
    const idxC = result.order.indexOf('c');
    expect(idxA).toBeLessThan(idxB);
    expect(idxB).toBeLessThan(idxC);
  });
});
