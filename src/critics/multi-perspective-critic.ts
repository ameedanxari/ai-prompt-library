/**
 * Multi-Perspective Critic System
 * 
 * Orchestrates multiple specialized critics to provide a comprehensive
 * evaluation of engineering outputs across different quality dimensions.
 * 
 * Validates: Requirements 6.3, 10.4
 */

import { ExecutionContext } from '../execution/execution-runtime';
import { CriticAgent, CritiqueResult, BaseCritic, CriticIssue } from './critic-agent';

/**
 * Aggregated result from all critics
 */
export interface MultiCritiqueResult {
  timestamp: Date;
  overallScore: number;
  results: Map<string, CritiqueResult>;
  allIssues: CriticIssue[];
  passed: boolean;
  blockers: CriticIssue[];
}

export class MultiPerspectiveCritic {
  private critics: Map<string, CriticAgent> = new Map();

  /**
   * Registers a specialized critic agent
   */
  public registerCritic(critic: CriticAgent): void {
    this.critics.set(critic.perspective, critic);
  }

  /**
   * Runs all registered critics on the execution context
   */
  public async critiqueAll(context: ExecutionContext): Promise<MultiCritiqueResult> {
    const results = new Map<string, CritiqueResult>();
    const allIssues: CriticIssue[] = [];
    let totalScore = 0;

    const critiquePromises = Array.from(this.critics.values()).map(async (critic) => {
      const result = await critic.critique(context);
      results.set(critic.perspective, result);
      allIssues.push(...result.issues);
      return result.score;
    });

    const scores = await Promise.all(critiquePromises);
    totalScore = scores.reduce((sum, score) => sum + score, 0);

    const overallScore = this.critics.size > 0 ? totalScore / this.critics.size : 100;
    const blockers = allIssues.filter(i => i.severity === 'high' || i.severity === 'critical');

    return {
      timestamp: new Date(),
      overallScore,
      results,
      allIssues,
      passed: blockers.length === 0 && overallScore >= 70,
      blockers
    };
  }
}

/**
 * Concrete implementation: Security Critic
 */
export class SecurityCritic extends BaseCritic {
  constructor() {
    super('critic-security', 'security');
  }

  async critique(context: ExecutionContext): Promise<CritiqueResult> {
    const serialized = JSON.stringify([context.input, context.output, context.error]).toLowerCase();
    const issues: CriticIssue[] = [];
    if (serialized.includes('eval(') || serialized.includes('exec(')) {
      issues.push({
        id: `${context.taskId}:security:dynamic-execution`,
        type: 'security',
        severity: 'critical',
        message: 'Dynamic code execution detected in execution artifacts',
        recommendation: 'Remove eval/exec style execution or isolate it in a sandbox with explicit policy.',
      });
    }
    if (serialized.includes('password=') || serialized.includes('secret=')) {
      issues.push({
        id: `${context.taskId}:security:secret-leak`,
        type: 'security',
        severity: 'high',
        message: 'Potential secret material detected in execution artifacts',
        recommendation: 'Move secrets to the runtime secret manager and redact persisted artifacts.',
      });
    }
    const passed = issues.every(issue => issue.severity !== 'high' && issue.severity !== 'critical');
    const score = Math.max(0, 100 - issues.length * 35);

    return this.createResult(score, issues, await this.suggestImprovements(issues), passed);
  }
}

/**
 * Concrete implementation: Performance Critic
 */
export class PerformanceCritic extends BaseCritic {
  constructor() {
    super('critic-performance', 'performance');
  }

  async critique(context: ExecutionContext): Promise<CritiqueResult> {
    const issues: CriticIssue[] = [];
    const duration = context.endTime ? context.endTime.getTime() - context.startTime.getTime() : 0;
    if (duration > 30_000) {
      issues.push({
        id: `${context.taskId}:performance:duration`,
        type: 'performance',
        severity: duration > 60_000 ? 'high' : 'medium',
        message: `Execution duration ${duration}ms exceeded the expected runtime budget`,
        recommendation: 'Profile the slow step and split or cache expensive work before retrying.',
      });
    }
    const score = Math.max(0, 100 - issues.length * 25);
    const passed = issues.every(issue => issue.severity !== 'high' && issue.severity !== 'critical');

    return this.createResult(score, issues, await this.suggestImprovements(issues), passed);
  }
}

/**
 * Concrete implementation: Architecture Critic
 */
export class ArchitectureCritic extends BaseCritic {
  constructor() {
    super('critic-architecture', 'architecture');
  }

  async critique(context: ExecutionContext): Promise<CritiqueResult> {
    const issues: CriticIssue[] = [];
    const output = JSON.stringify(context.output ?? {});
    if (output.includes('../..')) {
      issues.push({
        id: `${context.taskId}:architecture:boundary-traversal`,
        type: 'architecture',
        severity: 'medium',
        message: 'Output references parent-directory traversal, which can indicate a boundary violation',
        recommendation: 'Route cross-module access through an explicit package or adapter boundary.',
      });
    }
    const score = Math.max(0, 100 - issues.length * 20);
    const passed = issues.every(issue => issue.severity !== 'high' && issue.severity !== 'critical');

    return this.createResult(score, issues, await this.suggestImprovements(issues), passed);
  }
}
