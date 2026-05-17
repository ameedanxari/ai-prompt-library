/**
 * Audit Logger
 *
 * Provides tamper-evident audit logging with structured records,
 * integrity hashing, and security incident reporting.
 *
 * Validates: Requirements 10.5, 14.1
 */

import * as crypto from 'crypto';

/**
 * An audit log entry
 */
export interface AuditEntry {
  id: string;
  timestamp: Date;
  actor: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure' | 'denied';
  details: Record<string, any>;
  hash: string;
  previousHash: string;
}

export class AuditLogger {
  private entries: AuditEntry[] = [];
  private lastHash = '0'.repeat(64);

  /**
   * Logs an audit event with integrity chaining
   */
  public log(actor: string, action: string, resource: string, outcome: AuditEntry['outcome'], details: Record<string, any> = {}): AuditEntry {
    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      actor,
      action,
      resource,
      outcome,
      details,
      previousHash: this.lastHash,
      hash: '' // will be computed
    };

    entry.hash = this.computeHash(entry);
    this.lastHash = entry.hash;
    this.entries.push(entry);

    if (outcome === 'denied') {
      console.warn(`[AuditLogger] SECURITY: Access denied for ${actor} on ${resource} (${action})`);
    }

    return entry;
  }

  /**
   * Verifies the integrity of the audit chain
   */
  public verifyIntegrity(): { valid: boolean; brokenAt?: number } {
    let prevHash = '0'.repeat(64);

    for (let i = 0; i < this.entries.length; i++) {
      const entry = this.entries[i];
      if (entry.previousHash !== prevHash) {
        return { valid: false, brokenAt: i };
      }
      const recomputed = this.computeHash(entry);
      if (recomputed !== entry.hash) {
        return { valid: false, brokenAt: i };
      }
      prevHash = entry.hash;
    }

    return { valid: true };
  }

  /**
   * Queries the audit log
   */
  public query(filter: { actor?: string; action?: string; outcome?: AuditEntry['outcome'] }): AuditEntry[] {
    return this.entries.filter(e => {
      if (filter.actor && e.actor !== filter.actor) return false;
      if (filter.action && e.action !== filter.action) return false;
      if (filter.outcome && e.outcome !== filter.outcome) return false;
      return true;
    });
  }

  /**
   * Returns all entries
   */
  public getAll(): AuditEntry[] {
    return [...this.entries];
  }

  private computeHash(entry: AuditEntry): string {
    const data = `${entry.id}|${entry.timestamp.toISOString()}|${entry.actor}|${entry.action}|${entry.resource}|${entry.outcome}|${entry.previousHash}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}
