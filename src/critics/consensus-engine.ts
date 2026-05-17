/**
 * Consensus Engine
 * 
 * Resolves disagreements between multiple critics using weighted consensus
 * and confidence-based scoring.
 * 
 * Validates: Requirements 6.4, 6.5
 */

import { CritiqueResult, CriticIssue } from './critic-agent';

/**
 * A resolved decision on a quality aspect or issue
 */
export interface ConsensusDecision {
  aspect: string;
  agreedScore: number;
  confidence: number;
  resolvedIssues: CriticIssue[];
  disagreements: string[];
}

export class ConsensusEngine {
  private weights: Map<string, number> = new Map([
    ['security', 1.5],
    ['architecture', 1.2],
    ['performance', 1.0],
    ['style', 0.8]
  ]);

  /**
   * Resolves consensus across multiple critique results
   */
  public resolve(results: CritiqueResult[]): ConsensusDecision {
    if (results.length === 0) {
      throw new Error('Cannot resolve consensus from empty results');
    }

    let totalWeightedScore = 0;
    let totalWeight = 0;
    const resolvedIssues: CriticIssue[] = [];
    const disagreements: string[] = [];

    for (const result of results) {
      const weight = this.weights.get(result.perspective) || 1.0;
      totalWeightedScore += result.score * weight;
      totalWeight += weight;

      resolvedIssues.push(...result.issues);
    }

    const agreedScore = totalWeightedScore / totalWeight;
    
    // Calculate confidence based on score variance
    const variance = results.reduce((acc, r) => acc + Math.pow(r.score - agreedScore, 2), 0) / results.length;
    const confidence = Math.max(0, 1 - (variance / 2500)); // Normalized variance

    if (confidence < 0.6) {
      disagreements.push('High variance in critic scores suggests fundamental disagreement');
    }

    return {
      aspect: 'overall_quality',
      agreedScore,
      confidence,
      resolvedIssues: this.deduplicateIssues(resolvedIssues),
      disagreements
    };
  }

  /**
   * Deduplicates issues that might have been reported by multiple critics
   */
  private deduplicateIssues(issues: CriticIssue[]): CriticIssue[] {
    const seen = new Set<string>();
    return issues.filter(issue => {
      const key = `${issue.type}:${issue.message}:${issue.location}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Sets the weight for a specific perspective
   */
  public setWeight(perspective: string, weight: number): void {
    this.weights.set(perspective, weight);
  }
}
