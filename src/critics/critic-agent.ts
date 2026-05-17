/**
 * Critic Agent Interface
 * 
 * Defines the formal structure for specialized critic agents that evaluate
 * engineering outputs from various perspectives (security, performance, etc.).
 * 
 * Validates: Requirements 6.1, 6.2, 6.3
 */

import { ExecutionContext } from '../execution/execution-runtime';

/**
 * A specific issue identified by a critic
 */
export interface CriticIssue {
  id: string;
  type: 'bug' | 'security' | 'performance' | 'style' | 'architecture' | 'documentation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string; // File path, line number, or component name
  recommendation?: string;
}

/**
 * Result of a critic's evaluation
 */
export interface CritiqueResult {
  agentId: string;
  perspective: string;
  timestamp: Date;
  score: number; // 0-100
  issues: CriticIssue[];
  improvements: string[];
  passed: boolean;
}

export interface CriticAgent {
  readonly id: string;
  readonly perspective: string;

  /**
   * Evaluates an engineering output or execution result
   */
  critique(context: ExecutionContext): Promise<CritiqueResult>;

  /**
   * Identifies specific issues in the output
   */
  identifyIssues(context: ExecutionContext): Promise<CriticIssue[]>;

  /**
   * Suggests improvements to resolve identified issues
   */
  suggestImprovements(issues: CriticIssue[]): Promise<string[]>;

  /**
   * Validates if the output meets the specific perspective's standards
   */
  validate(context: ExecutionContext): Promise<boolean>;
}

/**
 * Base class for specific critic implementations
 */
export abstract class BaseCritic implements CriticAgent {
  constructor(
    public readonly id: string,
    public readonly perspective: string
  ) {}

  abstract critique(context: ExecutionContext): Promise<CritiqueResult>;

  async identifyIssues(context: ExecutionContext): Promise<CriticIssue[]> {
    const result = await this.critique(context);
    return result.issues;
  }

  async suggestImprovements(issues: CriticIssue[]): Promise<string[]> {
    return issues.map(issue => issue.recommendation).filter((r): r is string => !!r);
  }

  async validate(context: ExecutionContext): Promise<boolean> {
    const result = await this.critique(context);
    return result.passed;
  }

  protected createResult(score: number, issues: CriticIssue[], improvements: string[], passed: boolean): CritiqueResult {
    return {
      agentId: this.id,
      perspective: this.perspective,
      timestamp: new Date(),
      score,
      issues,
      improvements,
      passed
    };
  }
}
