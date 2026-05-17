/**
 * Architectural Decision Recorder
 * 
 * Captures and persists key architectural decisions (ADRs) with their
 * rationale, context, alternatives, and long-term impact analysis.
 * 
 * Validates: Requirements 5.4, 14.4
 */

/**
 * An Architectural Decision Record (ADR)
 */
export interface ADR {
  id: string;
  title: string;
  date: Date;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  rationale: string;
  alternatives: string[];
  consequences: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
  references: string[];
}

export class DecisionRecorder {
  private decisions: Map<string, ADR> = new Map();

  /**
   * Records a new architectural decision
   */
  public async recordDecision(adr: Omit<ADR, 'date'>): Promise<string> {
    const fullADR: ADR = {
      ...adr,
      date: new Date()
    };

    this.decisions.set(fullADR.id, fullADR);
    return fullADR.id;
  }

  /**
   * Retrieves an ADR by its ID
   */
  public async getDecision(id: string): Promise<ADR | undefined> {
    return this.decisions.get(id);
  }

  /**
   * Lists all recorded decisions
   */
  public async listDecisions(): Promise<ADR[]> {
    return Array.from(this.decisions.values());
  }

  /**
   * Updates the status of a decision
   */
  public async updateStatus(id: string, status: ADR['status']): Promise<void> {
    const adr = this.decisions.get(id);
    if (adr) {
      adr.status = status;
    }
  }

  /**
   * Generates a summary report of architectural decisions
   */
  public async generateReport(): Promise<string> {
    let report = '# Architectural Decision Log\n\n';
    for (const adr of this.decisions.values()) {
      report += `## ${adr.id}: ${adr.title}\n`;
      report += `- **Status**: ${adr.status}\n`;
      report += `- **Date**: ${adr.date.toDateString()}\n\n`;
      report += `### Context\n${adr.context}\n\n`;
      report += `### Decision\n${adr.decision}\n\n`;
    }
    return report;
  }
}
