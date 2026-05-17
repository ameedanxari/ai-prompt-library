/**
 * Pipeline Gatekeeper
 *
 * Enforces strict green-pipeline requirements before any task
 * can be marked complete or deployed to production.
 *
 * Validates: Roadmap Phase 8 – Production Reliability
 */

import { ConfidenceBreakdown } from './confidence-scorer';
import { RegressionReport } from './regression-tester';

/**
 * Gate check inputs
 */
export interface GateInputs {
  confidence: ConfidenceBreakdown;
  regression: RegressionReport;
  buildPassed: boolean;
  lintPassed: boolean;
  typeCheckPassed: boolean;
}

/**
 * Gate decision
 */
export interface GateDecision {
  allowed: boolean;
  blockers: string[];
  warnings: string[];
  overrideAvailable: boolean;
}

export class PipelineGatekeeper {
  private confidenceThreshold = 75;
  private requireGreenRegression = true;
  private requireGreenBuild = true;

  /**
   * Evaluates all gate inputs and produces a decision
   */
  public evaluate(inputs: GateInputs): GateDecision {
    const blockers: string[] = [];
    const warnings: string[] = [];

    if (inputs.confidence.overallScore < this.confidenceThreshold) {
      blockers.push(`Confidence score ${inputs.confidence.overallScore} is below threshold ${this.confidenceThreshold}`);
    }

    if (this.requireGreenRegression && !inputs.regression.passed) {
      blockers.push(`Regression failures: ${inputs.regression.regressions.join('; ')}`);
    }

    if (this.requireGreenBuild && !inputs.buildPassed) {
      blockers.push('Build failed');
    }

    if (!inputs.lintPassed) {
      warnings.push('Lint check has failures');
    }

    if (!inputs.typeCheckPassed) {
      blockers.push('TypeScript type checking failed');
    }

    if (inputs.confidence.factors.length > 0) {
      warnings.push(`Confidence concerns: ${inputs.confidence.factors.join(', ')}`);
    }

    return {
      allowed: blockers.length === 0,
      blockers,
      warnings,
      overrideAvailable: blockers.length <= 1 && !blockers.some(b => b.includes('Regression'))
    };
  }

  /**
   * Updates gating thresholds
   */
  public configure(options: { confidenceThreshold?: number; requireGreenRegression?: boolean; requireGreenBuild?: boolean }): void {
    if (options.confidenceThreshold !== undefined) this.confidenceThreshold = options.confidenceThreshold;
    if (options.requireGreenRegression !== undefined) this.requireGreenRegression = options.requireGreenRegression;
    if (options.requireGreenBuild !== undefined) this.requireGreenBuild = options.requireGreenBuild;
  }
}
