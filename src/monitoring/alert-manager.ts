/**
 * Alert Manager
 *
 * Manages alerts with severity levels, notification channels,
 * and escalation policies.
 *
 * Validates: Requirements 14.2, 14.3
 */

/**
 * An alert
 */
export interface Alert {
  id: string;
  timestamp: Date;
  severity: 'info' | 'warning' | 'error' | 'critical';
  source: string;
  message: string;
  acknowledged: boolean;
  resolvedAt?: Date;
}

/**
 * Notification channel configuration
 */
export interface NotificationChannel {
  name: string;
  type: 'console' | 'webhook' | 'email';
  minSeverity: Alert['severity'];
  config: Record<string, any>;
}

/**
 * Escalation policy
 */
export interface EscalationPolicy {
  name: string;
  severities: Alert['severity'][];
  escalateAfterMs: number;
  notifyChannels: string[];
}

export class AlertManager {
  private alerts: Alert[] = [];
  private channels: Map<string, NotificationChannel> = new Map();
  private policies: EscalationPolicy[] = [];

  constructor() {
    // Default console channel
    this.addChannel({
      name: 'console',
      type: 'console',
      minSeverity: 'warning',
      config: {}
    });
  }

  /**
   * Fires an alert
   */
  public async fire(severity: Alert['severity'], source: string, message: string): Promise<Alert> {
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: new Date(),
      severity,
      source,
      message,
      acknowledged: false
    };

    this.alerts.push(alert);
    await this.notify(alert);

    return alert;
  }

  /**
   * Acknowledges an alert
   */
  public acknowledge(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Resolves an alert
   */
  public resolve(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolvedAt = new Date();
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Adds a notification channel
   */
  public addChannel(channel: NotificationChannel): void {
    this.channels.set(channel.name, channel);
  }

  /**
   * Adds an escalation policy
   */
  public addPolicy(policy: EscalationPolicy): void {
    this.policies.push(policy);
  }

  /**
   * Returns all active (unresolved) alerts
   */
  public getActive(): Alert[] {
    return this.alerts.filter(a => !a.resolvedAt);
  }

  /**
   * Returns alert history
   */
  public getHistory(): Alert[] {
    return [...this.alerts];
  }

  private async notify(alert: Alert): Promise<void> {
    const severityOrder: Alert['severity'][] = ['info', 'warning', 'error', 'critical'];

    for (const channel of this.channels.values()) {
      const channelLevel = severityOrder.indexOf(channel.minSeverity);
      const alertLevel = severityOrder.indexOf(alert.severity);

      if (alertLevel >= channelLevel) {
        if (channel.type === 'console') {
          const prefix = alert.severity === 'critical' ? '🚨' : alert.severity === 'error' ? '❌' : '⚠️';
          console.log(`${prefix} [AlertManager] [${alert.severity.toUpperCase()}] ${alert.source}: ${alert.message}`);
        }
        // webhook / email channels would be implemented here
      }
    }
  }
}
