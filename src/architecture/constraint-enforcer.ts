/**
 * Architectural Constraint Enforcer
 * 
 * Enforces high-level architectural rules and constraints on the codebase,
 * such as layering, dependency rules, and naming conventions.
 * 
 * Validates: Requirements 8.2, 8.3, 8.5
 */

import { ExecutionContext } from '../execution/execution-runtime';

/**
 * An architectural constraint rule
 */
export interface ArchitecturalRule {
  id: string;
  name: string;
  description: string;
  severity: 'warning' | 'error';
  validate: (context: ExecutionContext) => Promise<{ passed: boolean; message?: string }>;
}

export class ConstraintEnforcer {
  private rules: ArchitecturalRule[] = [];

  constructor() {
    this.addDefaultRules();
  }

  /**
   * Adds a new architectural rule
   */
  public addRule(rule: ArchitecturalRule): void {
    this.rules.push(rule);
  }

  /**
   * Enforces all rules on the current context
   */
  public async enforce(context: ExecutionContext): Promise<{ passed: boolean; violations: string[] }> {
    const violations: string[] = [];
    let passed = true;

    for (const rule of this.rules) {
      const result = await rule.validate(context);
      if (!result.passed) {
        violations.push(`Rule [${rule.name}] failed: ${result.message || 'No details provided'}`);
        if (rule.severity === 'error') {
          passed = false;
        }
      }
    }

    return { passed, violations };
  }

  private addDefaultRules(): void {
    // Example rule: Layering violation (e.g., Domain cannot depend on Infrastructure)
    this.addRule({
      id: 'layering-01',
      name: 'Clean Architecture Layering',
      description: 'Ensures inner layers do not depend on outer layers',
      severity: 'error',
      validate: async (ctx) => {
        const violations = ctx.input?.layerViolations;
        return {
          passed: !Array.isArray(violations) || violations.length === 0,
          message: Array.isArray(violations) ? violations.join(', ') : undefined,
        };
      }
    });

    // Example rule: Naming conventions
    this.addRule({
      id: 'naming-01',
      name: 'Interface Naming',
      description: 'Ensures interfaces follow standard naming conventions',
      severity: 'warning',
      validate: async (ctx) => {
        const interfaces = ctx.input?.interfaces ?? [];
        const invalid = Array.isArray(interfaces)
          ? interfaces.filter((name: string) => !/^I?[A-Z][A-Za-z0-9]+$/.test(name))
          : [];
        return {
          passed: invalid.length === 0,
          message: invalid.length > 0 ? `Invalid interface names: ${invalid.join(', ')}` : undefined,
        };
      }
    });
  }
}
