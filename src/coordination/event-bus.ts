/**
 * Event Bus
 *
 * Pub/sub event system for decoupled inter-component communication
 * with support for typed events, error handling, and replay.
 *
 * Validates: Requirements 9.1, 9.2, 11.1
 */

/**
 * An event flowing through the bus
 */
export interface RuntimeEvent {
  type: string;
  timestamp: Date;
  source: string;
  payload: any;
}

type EventHandler = (event: RuntimeEvent) => void | Promise<void>;

export class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();
  private history: RuntimeEvent[] = [];
  private maxHistory = 500;

  /**
   * Subscribes to events of a specific type
   */
  public on(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) this.handlers.set(eventType, []);
    this.handlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const idx = handlers.indexOf(handler);
        if (idx >= 0) handlers.splice(idx, 1);
      }
    };
  }

  /**
   * Subscribes to all events regardless of type
   */
  public onAny(handler: EventHandler): () => void {
    return this.on('*', handler);
  }

  /**
   * Emits an event to all subscribers
   */
  public async emit(type: string, source: string, payload: any): Promise<void> {
    const event: RuntimeEvent = { type, timestamp: new Date(), source, payload };
    this.history.push(event);
    if (this.history.length > this.maxHistory) this.history.shift();

    const typeHandlers = this.handlers.get(type) || [];
    const wildcardHandlers = this.handlers.get('*') || [];

    for (const handler of [...typeHandlers, ...wildcardHandlers]) {
      try {
        await handler(event);
      } catch (error) {
        console.error(`[EventBus] Handler error for event '${type}':`, error);
      }
    }
  }

  /**
   * Replays historical events to a new subscriber
   */
  public replay(eventType: string, handler: EventHandler): void {
    const events = eventType === '*'
      ? this.history
      : this.history.filter(e => e.type === eventType);

    for (const event of events) {
      handler(event);
    }
  }

  /**
   * Returns the number of subscribers for a given event type
   */
  public listenerCount(eventType: string): number {
    return (this.handlers.get(eventType) || []).length;
  }

  /**
   * Clears all handlers and history
   */
  public clear(): void {
    this.handlers.clear();
    this.history = [];
  }
}
