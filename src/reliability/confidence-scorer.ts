/**
 * Confidence Scorer
 *
 * Calculates a confidence score for generated code based on test results,
 * static analysis findings, and critic feedback.
 *
 * Validates: Roadmap Phase 8 – Production Reliability
 */

import { CritiqueResult } from '../critics/critic-agent';

/**
 * Breakdown of the confidence score
 */
export interface ConfidenceBreakdown {
  overallScore: number; // 0-100
  testScore: number;
  staticAnalysisScore: number;
  criticScore: number;
  historicalScore: number;
  factors: string[];
}

/**
 * Input data for confidence calculation
 */
export interface ConfidenceInput {
  testsPassed: number;
  testsFailed: number;
  testsCoverage: number; // 0-100
  lintErrors: number;
  lintWarnings: number;
  typeErrors: number;
  critiqueResults: CritiqueResult[];
  historicalSuccessRate?: number; // 0-1
}

export class ConfidenceScorer {
  private weights = {
    tests: 0.35,
    staticAnalysis: 0.20,
    critics: 0.30,
    history: 0.15
  };

  /**
   * Calculates the confidence score
   */
  public calculate(input: ConfidenceInput): ConfidenceBreakdown {
    const testScore = this.scoreTests(input);
    const staticAnalysisScore = this.scoreStaticAnalysis(input);
    const criticScore = this.scoreCritics(input.critiqueResults);
    const historicalScore = input.historicalSuccessRate !== undefined
      ? input.historicalSuccessRate * 100
      : 50;

    const overallScore =
      testScore * this.weights.tests +
      staticAnalysisScore * this.weights.staticAnalysis +
      criticScore * this.weights.critics +
      historicalScore * this.weights.history;

    const factors: string[] = [];
    if (testScore < 60) factors.push('Low test pass rate or coverage');
    if (staticAnalysisScore < 60) factors.push('Static analysis issues present');
    if (criticScore < 60) factors.push('Critic agents flagged concerns');
    if (historicalScore < 50) factors.push('Historical success rate is below average');

    return {
      overallScore: Math.round(overallScore * 10) / 10,
      testScore,
      staticAnalysisScore,
      criticScore,
      historicalScore,
      factors
    };
  }

  /**
   * Returns whether the confidence level meets the deployment threshold
   */
  public meetsThreshold(breakdown: ConfidenceBreakdown, threshold: number = 75): boolean {
    return breakdown.overallScore >= threshold;
  }

  private scoreTests(input: ConfidenceInput): number {
    const total = input.testsPassed + input.testsFailed;
    const passRate = total > 0 ? (input.testsPassed / total) * 100 : 0;
    return (passRate * 0.6) + (input.testsCoverage * 0.4);
  }

  private scoreStaticAnalysis(input: ConfidenceInput): number {
    let score = 100;
    score -= input.typeErrors * 20;
    score -= input.lintErrors * 5;
    score -= input.lintWarnings * 1;
    return Math.max(0, score);
  }

  private scoreCritics(results: CritiqueResult[]): number {
    if (results.length === 0) return 50; // No data – neutral
    const avg = results.reduce((sum, r) => sum + r.score, 0) / results.length;
    return avg;
  }
}
