/**
 * Deployment Configurator
 * 
 * Manages and validates configurations for various deployment environments
 * (dev, staging, production), ensuring consistency and security.
 * 
 * Validates: Requirements 8.4, 9.3
 */

/**
 * Configuration for a specific environment
 */
export interface EnvConfig {
  name: string;
  variables: Record<string, string>;
  secrets: string[]; // Names of required secrets
  scaling: {
    min: number;
    max: number;
    targetCpu: number;
  };
}

export class DeploymentConfigurator {
  private configs: Map<string, EnvConfig> = new Map();

  /**
   * Registers a configuration for an environment
   */
  public registerConfig(config: EnvConfig): void {
    this.configs.set(config.name, config);
  }

  /**
   * Validates a configuration against environment requirements
   */
  public async validateConfig(name: string): Promise<{ valid: boolean; missing: string[] }> {
    const config = this.configs.get(name);
    if (!config) throw new Error(`Config ${name} not found`);

    const missing: string[] = [];
    
    // Check for required secrets in environment
    for (const secret of config.secrets) {
      if (!process.env[secret]) {
        missing.push(secret);
      }
    }

    return {
      valid: missing.length === 0,
      missing
    };
  }

  /**
   * Generates a deployment manifest (e.g., K8s or Docker Compose)
   */
  public async generateManifest(name: string, type: 'kubernetes' | 'docker-compose'): Promise<string> {
    const config = this.configs.get(name);
    if (!config) throw new Error(`Config ${name} not found`);

    if (type === 'docker-compose') {
      return `version: '3.8'\nservices:\n  app:\n    environment:\n${Object.keys(config.variables).map(k => `      - ${k}=${config.variables[k]}`).join('\n')}`;
    }

    return [
      'apiVersion: apps/v1',
      'kind: Deployment',
      'metadata:',
      `  name: ${config.name}`,
      'spec:',
      `  replicas: ${config.scaling.min}`,
      '  selector:',
      '    matchLabels:',
      `      app: ${config.name}`,
      '  template:',
      '    metadata:',
      '      labels:',
      `        app: ${config.name}`,
      '    spec:',
      '      containers:',
      '        - name: app',
      '          image: app:latest',
      '          env:',
      ...Object.entries(config.variables).map(([key, value]) => `            - name: ${key}\n              value: "${value}"`),
    ].join('\n');
  }

  /**
   * Optimizes scaling parameters based on environment type
   */
  public optimizeScaling(name: string): void {
    const config = this.configs.get(name);
    if (!config) return;

    if (name === 'prod') {
      config.scaling.min = Math.max(config.scaling.min, 3);
      config.scaling.targetCpu = 60;
    } else {
      config.scaling.min = 1;
      config.scaling.targetCpu = 80;
    }
  }
}
