/**
 * State Manager
 *
 * Manages global persistent state for the agentic runtime,
 * providing consistency guarantees and recovery from crashes.
 *
 * Validates: Requirements 4.3, 11.3, 11.4
 */

import * as fs from 'fs';
import * as path from 'path';

/**
 * State snapshot for persistence
 */
export interface StateSnapshot {
  version: number;
  timestamp: Date;
  data: Record<string, any>;
}

export class StateManager {
  private state: Record<string, any> = {};
  private version = 0;
  private persistencePath: string;

  constructor(persistencePath: string = '.state/runtime-state.json') {
    this.persistencePath = persistencePath;
  }

  /**
   * Sets a key-value pair in state
   */
  public set(key: string, value: any): void {
    this.state[key] = value;
    this.version++;
  }

  /**
   * Gets a value from state
   */
  public get<T = any>(key: string): T | undefined {
    return this.state[key] as T | undefined;
  }

  /**
   * Deletes a key from state
   */
  public delete(key: string): boolean {
    if (key in this.state) {
      delete this.state[key];
      this.version++;
      return true;
    }
    return false;
  }

  /**
   * Returns a snapshot of the current state
   */
  public snapshot(): StateSnapshot {
    return {
      version: this.version,
      timestamp: new Date(),
      data: JSON.parse(JSON.stringify(this.state))
    };
  }

  /**
   * Persists the current state to disk
   */
  public async persist(): Promise<void> {
    const snapshot = this.snapshot();
    const dir = path.dirname(this.persistencePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(this.persistencePath, JSON.stringify(snapshot, null, 2));
  }

  /**
   * Recovers state from disk
   */
  public async recover(): Promise<boolean> {
    if (!fs.existsSync(this.persistencePath)) return false;
    try {
      const raw = fs.readFileSync(this.persistencePath, 'utf8');
      const snapshot: StateSnapshot = JSON.parse(raw);
      this.state = snapshot.data;
      this.version = snapshot.version;
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Returns all keys in the state
   */
  public keys(): string[] {
    return Object.keys(this.state);
  }

  /**
   * Clears the state
   */
  public clear(): void {
    this.state = {};
    this.version++;
  }
}
