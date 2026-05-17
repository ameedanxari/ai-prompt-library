/**
 * Requirement Validator
 *
 * Validates that implementation satisfies acceptance criteria and
 * maintains a traceability matrix between requirements and code.
 *
 * Validates: All requirements
 */

import { TechnicalRequirement } from '../intent/requirement-extractor';

/**
 * A traceability link between a requirement and its implementation
 */
export interface TraceabilityEntry {
  requirementId: string;
  implementationFiles: string[];
  testFiles: string[];
  status: 'not-started' | 'in-progress' | 'implemented' | 'verified';
  acceptanceCriteriaMet: boolean;
}

export class RequirementValidator {
  private matrix: Map<string, TraceabilityEntry> = new Map();

  /**
   * Registers a requirement for tracking
   */
  public register(requirement: TechnicalRequirement): void {
    this.matrix.set(requirement.id, {
      requirementId: requirement.id,
      implementationFiles: [],
      testFiles: [],
      status: 'not-started',
      acceptanceCriteriaMet: false
    });
  }

  /**
   * Links implementation files to a requirement
   */
  public linkImplementation(requirementId: string, files: string[]): void {
    const entry = this.matrix.get(requirementId);
    if (entry) {
      entry.implementationFiles.push(...files);
      entry.status = 'in-progress';
    }
  }

  /**
   * Links test files to a requirement
   */
  public linkTests(requirementId: string, files: string[]): void {
    const entry = this.matrix.get(requirementId);
    if (entry) {
      entry.testFiles.push(...files);
    }
  }

  /**
   * Marks a requirement as verified
   */
  public markVerified(requirementId: string, criteriaMet: boolean): void {
    const entry = this.matrix.get(requirementId);
    if (entry) {
      entry.status = criteriaMet ? 'verified' : 'implemented';
      entry.acceptanceCriteriaMet = criteriaMet;
    }
  }

  /**
   * Returns the full traceability matrix
   */
  public getMatrix(): TraceabilityEntry[] {
    return Array.from(this.matrix.values());
  }

  /**
   * Returns coverage summary
   */
  public getCoverage(): { total: number; verified: number; percentage: number } {
    const entries = Array.from(this.matrix.values());
    const verified = entries.filter(e => e.status === 'verified').length;
    return {
      total: entries.length,
      verified,
      percentage: entries.length > 0 ? (verified / entries.length) * 100 : 0
    };
  }
}
