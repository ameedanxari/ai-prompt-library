/**
 * Log Aggregator
 *
 * Provides structured logging with aggregation, search,
 * and analysis capabilities for the agentic runtime.
 *
 * Validates: Requirements 14.1, 14.4
 */

/**
 * Log levels
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/**
 * A structured log entry
 */
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  source: string;
  message: string;
  context: Record<string, any>;
  correlationId?: string;
}

export class LogAggregator {
  private entries: LogEntry[] = [];
  private maxEntries = 10000;
  private minLevel: LogLevel = 'debug';

  private levelOrder: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];

  /**
   * Logs a message at the specified level
   */
  public log(level: LogLevel, source: string, message: string, context: Record<string, any> = {}, correlationId?: string): LogEntry {
    if (this.levelOrder.indexOf(level) < this.levelOrder.indexOf(this.minLevel)) {
      return { id: '', timestamp: new Date(), level, source, message, context }; // Filtered out
    }

    const entry: LogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      level,
      source,
      message,
      context,
      correlationId
    };

    this.entries.push(entry);
    if (this.entries.length > this.maxEntries) this.entries.shift();

    return entry;
  }

  // Convenience methods
  public debug(source: string, message: string, context?: Record<string, any>): LogEntry { return this.log('debug', source, message, context); }
  public info(source: string, message: string, context?: Record<string, any>): LogEntry { return this.log('info', source, message, context); }
  public warn(source: string, message: string, context?: Record<string, any>): LogEntry { return this.log('warn', source, message, context); }
  public error(source: string, message: string, context?: Record<string, any>): LogEntry { return this.log('error', source, message, context); }
  public fatal(source: string, message: string, context?: Record<string, any>): LogEntry { return this.log('fatal', source, message, context); }

  /**
   * Searches log entries
   */
  public search(filter: { level?: LogLevel; source?: string; keyword?: string; correlationId?: string; since?: Date }): LogEntry[] {
    return this.entries.filter(e => {
      if (filter.level && this.levelOrder.indexOf(e.level) < this.levelOrder.indexOf(filter.level)) return false;
      if (filter.source && e.source !== filter.source) return false;
      if (filter.keyword && !e.message.toLowerCase().includes(filter.keyword.toLowerCase())) return false;
      if (filter.correlationId && e.correlationId !== filter.correlationId) return false;
      if (filter.since && e.timestamp < filter.since) return false;
      return true;
    });
  }

  /**
   * Returns aggregate counts by level
   */
  public summarise(): Record<LogLevel, number> {
    const summary: Record<string, number> = { debug: 0, info: 0, warn: 0, error: 0, fatal: 0 };
    for (const e of this.entries) {
      summary[e.level]++;
    }
    return summary as Record<LogLevel, number>;
  }

  /**
   * Sets the minimum log level
   */
  public setMinLevel(level: LogLevel): void {
    this.minLevel = level;
  }

  /**
   * Exports all entries as JSON lines
   */
  public export(): string {
    return this.entries.map(e => JSON.stringify(e)).join('\n');
  }
}
