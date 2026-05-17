/**
 * Rollback Coordinator
 *
 * Coordinates rollback and repair semantics for failed deployments
 * or production issues, preserving state for safe recovery.
 *
 * Validates: Roadmap Phase 8 – Production Reliability
 */

/**
 * A rollback checkpoint
 */
export interface RollbackCheckpoint {
  id: string;
  timestamp: Date;
  label: string;
  state: Record<string, any>;
  artifacts: string[];
}

/**
 * Rollback result
 */
export interface RollbackResult {
  success: boolean;
  checkpointId: string;
  restoredAt: Date;
  errors: string[];
}

export class RollbackCoordinator {
  private checkpoints: RollbackCheckpoint[] = [];
  private maxCheckpoints = 10;

  /**
   * Creates a rollback checkpoint at the current state
   */
  public createCheckpoint(label: string, state: Record<string, any>, artifacts: string[] = []): string {
    const checkpoint: RollbackCheckpoint = {
      id: `ckpt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      label,
      state: { ...state },
      artifacts: [...artifacts]
    };

    this.checkpoints.push(checkpoint);

    // Prune old checkpoints
    while (this.checkpoints.length > this.maxCheckpoints) {
      this.checkpoints.shift();
    }

    return checkpoint.id;
  }

  /**
   * Rolls back to a specific checkpoint
   */
  public async rollbackTo(checkpointId: string): Promise<RollbackResult> {
    const idx = this.checkpoints.findIndex(c => c.id === checkpointId);
    if (idx === -1) {
      return { success: false, checkpointId, restoredAt: new Date(), errors: [`Checkpoint ${checkpointId} not found`] };
    }

    const checkpoint = this.checkpoints[idx];

    // Remove all checkpoints after the target
    this.checkpoints = this.checkpoints.slice(0, idx + 1);

    console.log(`[RollbackCoordinator] Rolled back to checkpoint '${checkpoint.label}' (${checkpoint.id})`);

    return { success: true, checkpointId, restoredAt: new Date(), errors: [] };
  }

  /**
   * Rolls back to the most recent checkpoint
   */
  public async rollbackToLatest(): Promise<RollbackResult> {
    if (this.checkpoints.length === 0) {
      return { success: false, checkpointId: '', restoredAt: new Date(), errors: ['No checkpoints available'] };
    }
    return this.rollbackTo(this.checkpoints[this.checkpoints.length - 1].id);
  }

  /**
   * Lists all available checkpoints
   */
  public listCheckpoints(): RollbackCheckpoint[] {
    return [...this.checkpoints];
  }

  /**
   * Retrieves state from a checkpoint
   */
  public getCheckpointState(checkpointId: string): Record<string, any> | undefined {
    return this.checkpoints.find(c => c.id === checkpointId)?.state;
  }
}
