/**
 * Rollback Manager
 *
 * Manages rollback procedures during migration, preserving state
 * and providing safe recovery to the previous system version.
 *
 * Validates: Requirements 12.4, 11.2
 */

/**
 * A migration state snapshot
 */
export interface MigrationSnapshot {
  id: string;
  timestamp: Date;
  version: string;
  mode: string;
  migratedArtifacts: string[];
  state: Record<string, any>;
}

/**
 * A handler that restores the state captured in a snapshot. The manager does
 * not know how state is persisted (files, DB, memory), so the host registers
 * the real restore logic via setRestoreHandler().
 */
export type RestoreHandler = (snapshot: MigrationSnapshot) => Promise<void> | void;

export class RollbackManager {
  private snapshots: MigrationSnapshot[] = [];
  private restoreHandler?: RestoreHandler;

  /**
   * Registers the handler that actually restores a snapshot's state
   * (file system, DB migrations, etc.). Rollback refuses to report success
   * until a handler is registered.
   */
  public setRestoreHandler(handler: RestoreHandler): void {
    this.restoreHandler = handler;
  }

  /**
   * Takes a snapshot before a migration step
   */
  public takeSnapshot(version: string, mode: string, migratedArtifacts: string[], state: Record<string, any>): string {
    const snapshot: MigrationSnapshot = {
      id: `snap-${Date.now()}`,
      timestamp: new Date(),
      version,
      mode,
      migratedArtifacts: [...migratedArtifacts],
      state: JSON.parse(JSON.stringify(state))
    };

    this.snapshots.push(snapshot);
    return snapshot.id;
  }

  /**
   * Rolls back to a snapshot
   */
  public async rollback(snapshotId: string): Promise<{ success: boolean; snapshot?: MigrationSnapshot; error?: string }> {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return { success: false, error: `Snapshot ${snapshotId} not found` };
    }

    // HONEST (item 15c): the old code returned success:true while restoring
    // nothing. Without a registered restore handler we now report failure
    // explicitly instead of pretending the rollback happened.
    if (!this.restoreHandler) {
      return {
        success: false,
        snapshot,
        error: 'No restore handler registered: snapshot state was NOT restored. Call setRestoreHandler() first.'
      };
    }

    await this.restoreHandler(snapshot);
    return { success: true, snapshot };
  }

  /**
   * Rolls back to the latest snapshot
   */
  public async rollbackToLatest(): Promise<{ success: boolean; snapshot?: MigrationSnapshot; error?: string }> {
    if (this.snapshots.length === 0) {
      return { success: false, error: 'No snapshots available' };
    }
    return this.rollback(this.snapshots[this.snapshots.length - 1].id);
  }

  /**
   * Lists all available snapshots
   */
  public listSnapshots(): MigrationSnapshot[] {
    return [...this.snapshots];
  }
}
