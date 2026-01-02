import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

/**
 * Fake Backend Processor
 * 
 * Handles fake backend generation, configuration, and validation.
 * Validates: Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7, 20.8, 20.9, 20.10
 */

export interface FakeBackendConfig {
  port: number;
  host: string;
  mockDataPath: string;
  cors: CorsConfig;
  logging: LoggingConfig;
  scenarios: ScenarioConfig;
  routes: RouteConfig[];
}

export interface CorsConfig {
  enabled: boolean;
  origins: string[];
  methods: string[];
}

export interface LoggingConfig {
  enabled: boolean;
  level: string;
  format: string;
}

export interface ScenarioConfig {
  default: string;
  available: string[];
  slowDelay: number;
  timeoutDuration: number;
}

export interface RouteConfig {
  method: string;
  path: string;
  mockFile: string;
  scenarios: Record<string, string>;
}

export interface DebugMenuConfig {
  environments: EnvironmentConfig[];
  scenarios: ScenarioOption[];
  defaultEnvironment: string;
  persistSelection: boolean;
  showInProduction: boolean;
}

export interface EnvironmentConfig {
  id: string;
  name: string;
  baseUrl: string | null;
  type: 'real' | 'fake' | 'offline';
  description: string;
}

export interface ScenarioOption {
  id: string;
  name: string;
  description: string;
}

export interface TestRunnerConfig {
  framework: 'jest' | 'vitest' | 'playwright' | 'mocha';
  globalSetup: boolean;
  globalTeardown: boolean;
  healthCheckUrl: string;
  maxRetries: number;
  retryInterval: number;
}

export interface SpawnScriptConfig {
  type: 'node' | 'bash' | 'python';
  port: number;
  healthCheckPath: string;
  maxRetries: number;
  retryInterval: number;
}


export interface FakeBackendGenerationResult {
  serverConfig: FakeBackendConfig;
  routes: RouteConfig[];
  spawnScripts: SpawnScriptResult;
  healthCheck: HealthCheckResult;
  logging: LoggingResult;
  customHandlers: CustomHandlerResult;
  hasServerGeneration: boolean;
  hasRoutingConfig: boolean;
  hasScenarioSimulation: boolean;
}

export interface SpawnScriptResult {
  hasNodeScript: boolean;
  hasBashScript: boolean;
  hasDockerConfig: boolean;
  environmentVariables: string[];
}

export interface HealthCheckResult {
  hasHealthEndpoint: boolean;
  hasReadyEndpoint: boolean;
  hasMetricsEndpoint: boolean;
  healthCheckPath: string;
}

export interface LoggingResult {
  hasRequestLogging: boolean;
  hasResponseLogging: boolean;
  hasMetrics: boolean;
  logFormat: string;
}

export interface CustomHandlerResult {
  hasExtensionPoint: boolean;
  hasExampleHandlers: boolean;
  supportsStatefulBehavior: boolean;
}

export interface DebugMenuGenerationResult {
  platforms: string[];
  hasWebImplementation: boolean;
  hasIOSImplementation: boolean;
  hasAndroidImplementation: boolean;
  hasEnvironmentSwitching: boolean;
  hasScenarioSelection: boolean;
  hasOfflineMode: boolean;
  hasPersistence: boolean;
}

export interface TestRunnerIntegrationResult {
  frameworks: string[];
  hasGlobalSetup: boolean;
  hasGlobalTeardown: boolean;
  hasAutoSpawn: boolean;
  hasAutoShutdown: boolean;
  eliminatesNetworkMocks: boolean;
  hasScenarioHelpers: boolean;
  hasCIIntegration: boolean;
}

export interface RequirementsValidation {
  requirement_20_1: boolean; // Lightweight fake backend server
  requirement_20_2: boolean; // Spawn scripts for local development
  requirement_20_3: boolean; // Routing based on mock data
  requirement_20_4: boolean; // Debug menu for environment switching
  requirement_20_5: boolean; // Debug menu supports offline mode
  requirement_20_6: boolean; // Scenario simulation support
  requirement_20_7: boolean; // Test runner integration
  requirement_20_8: boolean; // Health check and logging
  requirement_20_9: boolean; // Custom response handlers
  requirement_20_10: boolean; // Eliminates network mocks
}

export class FakeBackendProcessor {
  private fakeBackendTemplatePath: string;
  private debugMenuTemplatePath: string;
  private fakeBackendContent: string;
  private debugMenuContent: string;

  constructor() {
    this.fakeBackendTemplatePath = join(process.cwd(), 'prompts/modules/testing/fake-backend-generator.md');
    this.debugMenuTemplatePath = join(process.cwd(), 'prompts/modules/testing/debug-menu-integration.md');
    this.fakeBackendContent = existsSync(this.fakeBackendTemplatePath) 
      ? readFileSync(this.fakeBackendTemplatePath, 'utf-8')
      : '';
    this.debugMenuContent = existsSync(this.debugMenuTemplatePath)
      ? readFileSync(this.debugMenuTemplatePath, 'utf-8')
      : '';
  }

  /**
   * Generate fake backend configuration from mock data endpoints
   * Validates: Requirement 20.1
   */
  generateFakeBackend(endpoints: string[]): FakeBackendGenerationResult {
    const routes = this.generateRoutes(endpoints);
    
    return {
      serverConfig: this.generateServerConfig(routes),
      routes,
      spawnScripts: this.generateSpawnScripts(),
      healthCheck: this.generateHealthCheck(),
      logging: this.generateLogging(),
      customHandlers: this.generateCustomHandlers(),
      hasServerGeneration: true,
      hasRoutingConfig: routes.length > 0,
      hasScenarioSimulation: true
    };
  }

  /**
   * Generate routes from endpoints
   * Validates: Requirement 20.3
   */
  private generateRoutes(endpoints: string[]): RouteConfig[] {
    const routes: RouteConfig[] = [];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    
    for (const endpoint of endpoints) {
      for (const method of methods) {
        const scenarios = this.generateScenarios(method);
        routes.push({
          method,
          path: endpoint.replace(/\{(\w+)\}/g, ':$1'), // Convert {id} to :id
          mockFile: `${endpoint}/${method}/200-success.json`,
          scenarios
        });
      }
    }
    
    return routes;
  }

  /**
   * Generate scenarios for a method
   * Validates: Requirement 20.6
   */
  private generateScenarios(method: string): Record<string, string> {
    const baseScenarios: Record<string, string> = {
      success: '200-success.json',
      unauthorized: '401-unauthorized.json',
      server_error: '500-server-error.json',
      timeout: 'timeout',
      slow: 'slow'
    };

    if (method === 'GET') {
      return {
        ...baseScenarios,
        empty: '200-success-empty.json',
        not_found: '404-not-found.json'
      };
    }

    if (method === 'POST') {
      return {
        ...baseScenarios,
        created: '201-created.json',
        validation_error: '400-validation-error.json',
        conflict: '409-conflict.json'
      };
    }

    if (method === 'PUT' || method === 'PATCH') {
      return {
        ...baseScenarios,
        validation_error: '400-validation-error.json',
        not_found: '404-not-found.json'
      };
    }

    if (method === 'DELETE') {
      return {
        ...baseScenarios,
        deleted: '204-deleted.json',
        not_found: '404-not-found.json'
      };
    }

    return baseScenarios;
  }

  /**
   * Generate server configuration
   */
  private generateServerConfig(routes: RouteConfig[]): FakeBackendConfig {
    return {
      port: 3001,
      host: 'localhost',
      mockDataPath: './mocks',
      cors: {
        enabled: true,
        origins: ['*'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']
      },
      logging: {
        enabled: true,
        level: 'info',
        format: 'json'
      },
      scenarios: {
        default: 'success',
        available: ['success', 'error', 'timeout', 'slow', 'empty', 'validation_error', 'unauthorized', 'not_found', 'conflict', 'rate_limited'],
        slowDelay: 3000,
        timeoutDuration: 30000
      },
      routes
    };
  }

  /**
   * Generate spawn scripts configuration
   * Validates: Requirement 20.2
   */
  private generateSpawnScripts(): SpawnScriptResult {
    return {
      hasNodeScript: this.fakeBackendContent.includes('start-fake-backend.js') ||
                     this.fakeBackendContent.includes('spawn'),
      hasBashScript: this.fakeBackendContent.includes('start-fake-backend.sh') ||
                     this.fakeBackendContent.includes('#!/bin/bash'),
      hasDockerConfig: this.fakeBackendContent.includes('Dockerfile') ||
                       this.fakeBackendContent.includes('docker-compose'),
      environmentVariables: this.extractEnvironmentVariables()
    };
  }

  /**
   * Extract environment variables from template
   */
  private extractEnvironmentVariables(): string[] {
    const envVars: string[] = [];
    const envPattern = /FAKE_BACKEND_\w+|MOCK_\w+|API_BASE_URL/g;
    const matches = this.fakeBackendContent.match(envPattern);
    
    if (matches) {
      envVars.push(...new Set(matches));
    }
    
    return envVars;
  }

  /**
   * Generate health check configuration
   * Validates: Requirement 20.8
   */
  private generateHealthCheck(): HealthCheckResult {
    return {
      hasHealthEndpoint: this.fakeBackendContent.includes('/health'),
      hasReadyEndpoint: this.fakeBackendContent.includes('/ready'),
      hasMetricsEndpoint: this.fakeBackendContent.includes('/metrics'),
      healthCheckPath: '/health'
    };
  }

  /**
   * Generate logging configuration
   * Validates: Requirement 20.8
   */
  private generateLogging(): LoggingResult {
    return {
      hasRequestLogging: this.fakeBackendContent.includes('request') && 
                         this.fakeBackendContent.includes('log'),
      hasResponseLogging: this.fakeBackendContent.includes('response') &&
                          this.fakeBackendContent.includes('log'),
      hasMetrics: this.fakeBackendContent.includes('metrics') ||
                  this.fakeBackendContent.includes('requestMetrics'),
      logFormat: 'json'
    };
  }

  /**
   * Generate custom handler configuration
   * Validates: Requirement 20.9
   */
  private generateCustomHandlers(): CustomHandlerResult {
    return {
      hasExtensionPoint: this.fakeBackendContent.includes('custom-handlers') ||
                         this.fakeBackendContent.includes('registerHandler'),
      hasExampleHandlers: this.fakeBackendContent.includes('registerHandler') &&
                          this.fakeBackendContent.includes('example'),
      supportsStatefulBehavior: this.fakeBackendContent.includes('State') ||
                                this.fakeBackendContent.includes('stateful')
    };
  }

  /**
   * Generate debug menu configuration
   * Validates: Requirements 20.4, 20.5
   */
  generateDebugMenu(platforms: string[]): DebugMenuGenerationResult {
    return {
      platforms,
      hasWebImplementation: this.debugMenuContent.includes('React') ||
                            this.debugMenuContent.includes('DebugMenu.tsx'),
      hasIOSImplementation: this.debugMenuContent.includes('SwiftUI') ||
                            this.debugMenuContent.includes('DebugMenuView.swift'),
      hasAndroidImplementation: this.debugMenuContent.includes('Compose') ||
                                this.debugMenuContent.includes('DebugMenu.kt'),
      hasEnvironmentSwitching: this.debugMenuContent.includes('environment') &&
                               this.debugMenuContent.includes('switch'),
      hasScenarioSelection: this.debugMenuContent.includes('scenario') &&
                            this.debugMenuContent.includes('select'),
      hasOfflineMode: this.debugMenuContent.includes('offline') ||
                      this.debugMenuContent.includes('Offline'),
      hasPersistence: this.debugMenuContent.includes('localStorage') ||
                      this.debugMenuContent.includes('UserDefaults') ||
                      this.debugMenuContent.includes('SharedPreferences')
    };
  }

  /**
   * Generate test runner integration
   * Validates: Requirements 20.7, 20.10
   */
  generateTestRunnerIntegration(frameworks: string[]): TestRunnerIntegrationResult {
    return {
      frameworks,
      hasGlobalSetup: this.fakeBackendContent.includes('globalSetup') ||
                      this.fakeBackendContent.includes('beforeAll'),
      hasGlobalTeardown: this.fakeBackendContent.includes('globalTeardown') ||
                         this.fakeBackendContent.includes('afterAll'),
      hasAutoSpawn: this.fakeBackendContent.includes('spawn') &&
                    this.fakeBackendContent.includes('server'),
      hasAutoShutdown: this.fakeBackendContent.includes('kill') ||
                       this.fakeBackendContent.includes('SIGTERM'),
      eliminatesNetworkMocks: this.fakeBackendContent.includes('eliminat') ||
                              this.fakeBackendContent.includes('No mock setup needed'),
      hasScenarioHelpers: this.fakeBackendContent.includes('setScenario') ||
                          this.fakeBackendContent.includes('withScenario'),
      hasCIIntegration: this.fakeBackendContent.includes('GitHub Actions') ||
                        this.fakeBackendContent.includes('CI')
    };
  }

  /**
   * Validate all requirements for fake backend
   */
  validateRequirements(
    endpoints: string[],
    platforms: string[],
    testFrameworks: string[]
  ): RequirementsValidation {
    const fakeBackend = this.generateFakeBackend(endpoints);
    const debugMenu = this.generateDebugMenu(platforms);
    const testRunner = this.generateTestRunnerIntegration(testFrameworks);

    return {
      // 20.1: Lightweight fake backend server
      requirement_20_1: fakeBackend.hasServerGeneration &&
                        this.fakeBackendContent.includes('express') ||
                        this.fakeBackendContent.includes('fastapi'),
      
      // 20.2: Spawn scripts for local development
      requirement_20_2: fakeBackend.spawnScripts.hasNodeScript ||
                        fakeBackend.spawnScripts.hasBashScript,
      
      // 20.3: Routing based on mock data
      requirement_20_3: fakeBackend.hasRoutingConfig &&
                        fakeBackend.routes.length > 0,
      
      // 20.4: Debug menu for environment switching
      requirement_20_4: debugMenu.hasEnvironmentSwitching &&
                        (debugMenu.hasWebImplementation ||
                         debugMenu.hasIOSImplementation ||
                         debugMenu.hasAndroidImplementation),
      
      // 20.5: Debug menu supports offline mode
      requirement_20_5: debugMenu.hasOfflineMode,
      
      // 20.6: Scenario simulation support
      requirement_20_6: fakeBackend.hasScenarioSimulation &&
                        this.fakeBackendContent.includes('timeout') &&
                        this.fakeBackendContent.includes('slow'),
      
      // 20.7: Test runner integration
      requirement_20_7: testRunner.hasGlobalSetup &&
                        testRunner.hasGlobalTeardown,
      
      // 20.8: Health check and logging
      requirement_20_8: fakeBackend.healthCheck.hasHealthEndpoint &&
                        fakeBackend.logging.hasRequestLogging,
      
      // 20.9: Custom response handlers
      requirement_20_9: fakeBackend.customHandlers.hasExtensionPoint,
      
      // 20.10: Eliminates network mocks
      requirement_20_10: testRunner.eliminatesNetworkMocks
    };
  }

  /**
   * Validate template structure
   */
  validateTemplateStructure(): {
    hasPurpose: boolean;
    hasInstructions: boolean;
    hasExamples: boolean;
    hasServerImplementation: boolean;
    hasRoutingConfig: boolean;
    hasScenarioSupport: boolean;
    hasSpawnScripts: boolean;
    hasHealthCheck: boolean;
    hasLogging: boolean;
    hasCustomHandlers: boolean;
    hasTestRunnerIntegration: boolean;
    hasDebugMenuIntegration: boolean;
  } {
    return {
      hasPurpose: this.fakeBackendContent.includes('## Purpose'),
      hasInstructions: this.fakeBackendContent.includes('## Instructions'),
      hasExamples: this.fakeBackendContent.includes('## Examples'),
      hasServerImplementation: this.fakeBackendContent.includes('server.js') ||
                               this.fakeBackendContent.includes('server.py'),
      hasRoutingConfig: this.fakeBackendContent.includes('routes') &&
                        this.fakeBackendContent.includes('config'),
      hasScenarioSupport: this.fakeBackendContent.includes('scenario') &&
                          this.fakeBackendContent.includes('X-Mock-Scenario'),
      hasSpawnScripts: this.fakeBackendContent.includes('spawn') ||
                       this.fakeBackendContent.includes('start-fake-backend'),
      hasHealthCheck: this.fakeBackendContent.includes('/health'),
      hasLogging: this.fakeBackendContent.includes('logging') ||
                  this.fakeBackendContent.includes('console.log'),
      hasCustomHandlers: this.fakeBackendContent.includes('custom') &&
                         this.fakeBackendContent.includes('handler'),
      hasTestRunnerIntegration: this.fakeBackendContent.includes('jest') ||
                                this.fakeBackendContent.includes('vitest') ||
                                this.fakeBackendContent.includes('playwright'),
      hasDebugMenuIntegration: this.debugMenuContent.includes('DebugMenu')
    };
  }

  /**
   * Get supported scenario types
   */
  getSupportedScenarios(): string[] {
    return [
      'success',
      'created',
      'empty',
      'validation_error',
      'unauthorized',
      'forbidden',
      'not_found',
      'conflict',
      'rate_limited',
      'server_error',
      'timeout',
      'slow',
      'intermittent'
    ];
  }

  /**
   * Get supported test frameworks
   */
  getSupportedTestFrameworks(): string[] {
    return ['jest', 'vitest', 'playwright', 'mocha'];
  }

  /**
   * Get supported platforms for debug menu
   */
  getSupportedPlatforms(): string[] {
    return ['web', 'ios', 'android', 'desktop'];
  }
}
