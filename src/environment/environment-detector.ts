/**
 * Environment Detector
 * 
 * Detects the runtime environment, identifying the operating system,
 * hardware capabilities, installed software, and network configuration.
 * 
 * Validates: Requirements 9.3, 9.5
 */

import * as os from 'os';
import * as fs from 'fs';
import * as childProcess from 'child_process';

/**
 * Detailed environment information
 */
export interface EnvironmentInfo {
  platform: string;
  architecture: string;
  release: string;
  cpus: number;
  totalMemory: number;
  hostname: string;
  nodeVersion: string;
  runtime: 'nodejs' | 'browser' | 'worker' | 'other';
  capabilities: {
    docker: boolean;
    gpu: boolean;
    highBandwidth: boolean;
    writableDisk: boolean;
  };
}

export class EnvironmentDetector {
  /**
   * Detects the current execution environment
   */
  public async detect(): Promise<EnvironmentInfo> {
    const info: EnvironmentInfo = {
      platform: os.platform(),
      architecture: os.arch(),
      release: os.release(),
      cpus: os.cpus().length,
      totalMemory: os.totalmem(),
      hostname: os.hostname(),
      nodeVersion: process.version,
      runtime: 'nodejs',
      capabilities: {
        docker: await this.checkDocker(),
        gpu: await this.checkDependency('nvidia-smi'),
        highBandwidth: Object.keys(os.networkInterfaces()).length > 0,
        writableDisk: await this.checkWritableDisk()
      }
    };

    return info;
  }

  /**
   * Checks if the environment is a Docker container
   */
  private async checkDocker(): Promise<boolean> {
    if (fs.existsSync('/.dockerenv')) {
      return true;
    }
    return this.checkDependency('docker');
  }

  /**
   * Assesses specific environment capabilities
   */
  public async assessCapability(capability: string): Promise<boolean> {
    const env = await this.detect();
    return (env.capabilities as any)[capability] || false;
  }

  /**
   * Checks for specific system dependencies
   */
  public async checkDependency(name: string): Promise<boolean> {
    // SECURITY (item 13a): `name` must never be interpolated into a shell
    // command line. The old code only escaped `"`, leaving quote-breakout
    // command injection possible. We now (1) allowlist the name and
    // (2) pass it as an argv value (`$1`) rather than interpolating it.
    if (!/^[A-Za-z0-9_][A-Za-z0-9_.\-]*$/.test(name)) {
      return false;
    }
    try {
      childProcess.execFileSync('sh', ['-c', 'command -v "$1" >/dev/null 2>&1', 'sh', name], { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  private async checkWritableDisk(): Promise<boolean> {
    try {
      fs.accessSync(process.cwd(), fs.constants.W_OK);
      return true;
    } catch {
      return false;
    }
  }
}
