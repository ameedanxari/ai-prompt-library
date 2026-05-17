/**
 * Learning Critic
 * 
 * A specialized critic that adapts its evaluation criteria based on
 * historical feedback, human reviews, and production performance data.
 * 
 * Validates: Requirements 6.5, 14.4
 */

import { ExecutionContext } from '../execution/execution-runtime';
import { BaseCritic, CritiqueResult, CriticIssue } from './critic-agent';

/**
 * Historical record of an evaluation and its eventual outcome
 */
export interface EvaluationHistory {
  contextId: string;
  originalScore: number;
  humanScore?: number;
  productionOutcome?: 'success' | 'failure';
  identifiedIssues: string[];
  missedIssues: string[];
}

export class LearningCritic extends BaseCritic {
  private history: EvaluationHistory[] = [];
  private weights: Record<string, number> = {
    complexity: 1.0,
    readability: 1.0,
    testability: 1.0
  };

  constructor() {
    super('critic-learning', 'meta-learning');
  }

  /**
   * Critiques the result while applying learned adjustments
   */
  async critique(context: ExecutionContext): Promise<CritiqueResult> {
    const rawScore = this.calculateRawScore(context);
    const adjustedScore = this.applyLearnedAdjustments(rawScore);
    
    const issues: CriticIssue[] = [];
    const passed = adjustedScore >= 80;

    return this.createResult(adjustedScore, issues, [], passed);
  }

  /**
   * Updates the learning model with new feedback
   */
  public async learnFromFeedback(record: EvaluationHistory): Promise<void> {
    this.history.push(record);
    
    // Simple adjustment logic: if we overestimated compared to human, decrease weights
    if (record.humanScore !== undefined) {
      const error = record.originalScore - record.humanScore;
      const learningRate = 0.05;
      
      for (const key in this.weights) {
        this.weights[key] = Math.min(2, Math.max(0.25, this.weights[key] - error * learningRate / 100));
      }
    }
  }

  private calculateRawScore(context: ExecutionContext): number {
    let score = context.status === 'completed' ? 85 : 45;
    if (context.error) score -= 20;
    if (context.artifacts.length === 0) score -= 5;
    return Math.max(0, Math.min(100, score));
  }

  private applyLearnedAdjustments(score: number): number {
    // Apply weight-based adjustment
    const averageWeight = Object.values(this.weights).reduce((a, b) => a + b, 0) / 3;
    return Math.min(100, Math.max(0, score * averageWeight));
  }

  public getModelSummary(): any {
    return {
      historyCount: this.history.length,
      currentWeights: this.weights
    };
  }
}
