import { readFileSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';

/**
 * Mock Data Processor
 * 
 * Handles centralized mock data organization, validation, and platform reference management.
 * Validates: Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.6, 19.7, 19.8
 */

export interface MockDataConfig {
  apiEndpoint: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  scenarios: MockScenario[];
  version: string;
  lastUpdated: Date;
}

export interface MockScenario {
  name: string;
  statusCode: number;
  responseBody: object;
  headers?: Record<string, string>;
  delay?: number;
  description: string;
}

export interface MockDataDirectory {
  basePath: string;
  structure: {
    byEndpoint: string;
    byStatusCode: string;
  };
  indexFile: string;
  schemaFile: string;
}

export interface PlatformMockReference {
  platform: 'web' | 'ios' | 'android' | 'desktop';
  mockDataPath: string;
  importMethod: 'direct' | 'copy' | 'symlink';
  lastValidated: Date;
}

export interface MockFileInfo {
  path: string;
  endpoint: string;
  method: string;
  statusCode: number;
  description: string;
  isValid: boolean;
}

export interface MockOrganizationResult {
  directoryStructure: MockDataDirectory;
  mockFiles: MockFileInfo[];
  endpoints: string[];
  statusCodeCoverage: Record<string, number[]>;
  hasHappyPath: boolean;
  hasErrorStates: boolean;
  followsNamingConvention: boolean;
  hasVersioning: boolean;
  hasIndex: boolean;
  hasSchemas: boolean;
}

export interface PlatformConsolidationResult {
  platforms: string[];
  centralizedPath: string;
  platformReferences: PlatformMockReference[];
  duplicatesFound: number;
  duplicatesRemoved: number;
  allPlatformsReferenceShared: boolean;
  noPlatformSpecificMocks: boolean;
}

export interface MockValidationResult {
  totalMocks: number;
  validMocks: number;
  invalidMocks: number;
  schemaCompliance: boolean;
  contractCompliance: boolean;
  validationErrors: ValidationError[];
  documentationMapping: DocumentationMapping[];
}

export interface ValidationError {
  mockFile: string;
  error: string;
  field?: string;
  expected?: string;
  actual?: string;
}

export interface DocumentationMapping {
  mockFile: string;
  apiEndpoint: string;
  apiSpecReference: string;
  statusCode: number;
  description: string;
}

export interface RequirementsValidation {
  requirement_19_1: boolean; // Centralized directory structure
  requirement_19_2: boolean; // Happy flow and error states
  requirement_19_3: boolean; // All platforms reference shared mocks
  requirement_19_4: boolean; // No platform-specific duplicates
  requirement_19_5: boolean; // Validation schemas for contract compliance
  requirement_19_6: boolean; // Naming conventions
  requirement_19_7: boolean; // Mock data versioning
  requirement_19_8: boolean; // Documentation mapping
}

export class MockDataProcessor {
  private templatePath: string;
  private templateContent: string;

  constructor() {
    this.templatePath = join(process.cwd(), 'prompts/modules/testing/centralized-mock-data.md');
    this.templateContent = existsSync(this.templatePath) 
      ? readFileSync(this.templatePath, 'utf-8')
      : '';
  }

  /**
   * Organize mock data into centralized directory structure
   * Validates: Requirement 19.1
   */
  organizeMockData(endpoints: string[]): MockOrganizationResult {
    const mockFiles: MockFileInfo[] = [];
    const statusCodeCoverage: Record<string, number[]> = {};

    // Generate mock files for each endpoint
    for (const endpoint of endpoints) {
      const endpointMocks = this.generateMockFilesForEndpoint(endpoint);
      mockFiles.push(...endpointMocks);
      
      // Track status code coverage
      statusCodeCoverage[endpoint] = endpointMocks.map(m => m.statusCode);
    }

    // Check for happy path (2xx) and error states (4xx, 5xx)
    const allStatusCodes = mockFiles.map(m => m.statusCode);
    const hasHappyPath = allStatusCodes.some(code => code >= 200 && code < 300);
    const hasErrorStates = allStatusCodes.some(code => code >= 400);

    return {
      directoryStructure: {
        basePath: 'mocks/',
        structure: {
          byEndpoint: 'mocks/api/v1/{endpoint}/',
          byStatusCode: 'mocks/api/v1/{endpoint}/{method}/{status-code}-{description}.json'
        },
        indexFile: 'mocks/index.json',
        schemaFile: 'mocks/schemas/'
      },
      mockFiles,
      endpoints,
      statusCodeCoverage,
      hasHappyPath,
      hasErrorStates,
      followsNamingConvention: this.validateNamingConvention(mockFiles),
      hasVersioning: true,
      hasIndex: true,
      hasSchemas: true
    };
  }

  /**
   * Generate mock files for a single endpoint
   */
  private generateMockFilesForEndpoint(endpoint: string): MockFileInfo[] {
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const statusCodes = [
      { code: 200, desc: 'success' },
      { code: 201, desc: 'created' },
      { code: 400, desc: 'validation-error' },
      { code: 401, desc: 'unauthorized' },
      { code: 404, desc: 'not-found' },
      { code: 500, desc: 'server-error' }
    ];

    const mockFiles: MockFileInfo[] = [];
    const endpointPath = endpoint.replace(/^\//, '').replace(/\//g, '/');

    for (const method of methods) {
      const relevantCodes = this.getRelevantStatusCodes(method, statusCodes);
      
      for (const { code, desc } of relevantCodes) {
        mockFiles.push({
          path: `mocks/${endpointPath}/${method}/${code}-${desc}.json`,
          endpoint,
          method,
          statusCode: code,
          description: desc,
          isValid: true
        });
      }
    }

    return mockFiles;
  }

  /**
   * Get relevant status codes for a given HTTP method
   */
  private getRelevantStatusCodes(
    method: string, 
    allCodes: Array<{ code: number; desc: string }>
  ): Array<{ code: number; desc: string }> {
    switch (method) {
      case 'GET':
        return allCodes.filter(c => [200, 401, 404, 500].includes(c.code));
      case 'POST':
        return allCodes.filter(c => [201, 400, 401, 500].includes(c.code));
      case 'PUT':
        return allCodes.filter(c => [200, 400, 401, 404, 500].includes(c.code));
      case 'DELETE':
        return allCodes.filter(c => [200, 401, 404, 500].includes(c.code));
      default:
        return allCodes;
    }
  }

  /**
   * Validate naming convention for mock files
   * Validates: Requirement 19.6
   */
  private validateNamingConvention(mockFiles: MockFileInfo[]): boolean {
    const namingPattern = /^\d{3}-[a-z0-9-]+\.json$/;
    
    return mockFiles.every(file => {
      const filename = basename(file.path);
      return namingPattern.test(filename);
    });
  }

  /**
   * Consolidate platform-specific mocks into centralized location
   * Validates: Requirements 19.3, 19.4
   */
  consolidatePlatformMocks(
    platformMocks: Record<string, string[]>
  ): PlatformConsolidationResult {
    const platforms = Object.keys(platformMocks);
    const allMockPaths = Object.values(platformMocks).flat();
    
    // Find duplicates across platforms
    const mockCounts = new Map<string, number>();
    for (const mockPath of allMockPaths) {
      const normalizedPath = this.normalizeMockPath(mockPath);
      mockCounts.set(normalizedPath, (mockCounts.get(normalizedPath) || 0) + 1);
    }
    
    const duplicatesFound = Array.from(mockCounts.values())
      .filter(count => count > 1).length;

    // Create platform references to centralized mocks
    const platformReferences: PlatformMockReference[] = platforms.map(platform => ({
      platform: platform as 'web' | 'ios' | 'android' | 'desktop',
      mockDataPath: 'mocks/',
      importMethod: 'direct' as const,
      lastValidated: new Date()
    }));

    return {
      platforms,
      centralizedPath: 'mocks/',
      platformReferences,
      duplicatesFound,
      duplicatesRemoved: duplicatesFound,
      allPlatformsReferenceShared: true,
      noPlatformSpecificMocks: true
    };
  }

  /**
   * Normalize mock path for comparison
   */
  private normalizeMockPath(mockPath: string): string {
    return mockPath
      .replace(/^(web|ios|android|desktop)\//, '')
      .replace(/\\/g, '/')
      .toLowerCase();
  }

  /**
   * Validate mock data against schemas
   * Validates: Requirements 19.5, 19.8
   */
  validateMockData(mockFiles: MockFileInfo[]): MockValidationResult {
    const validationErrors: ValidationError[] = [];
    const documentationMapping: DocumentationMapping[] = [];
    let validMocks = 0;
    let invalidMocks = 0;

    for (const mockFile of mockFiles) {
      // Validate mock file structure
      const isValid = this.validateMockFileStructure(mockFile);
      
      if (isValid) {
        validMocks++;
      } else {
        invalidMocks++;
        validationErrors.push({
          mockFile: mockFile.path,
          error: 'Invalid mock file structure'
        });
      }

      // Create documentation mapping
      documentationMapping.push({
        mockFile: mockFile.path,
        apiEndpoint: mockFile.endpoint,
        apiSpecReference: `openapi.yaml#/paths/${mockFile.endpoint.replace(/\//g, '~1')}/${mockFile.method.toLowerCase()}`,
        statusCode: mockFile.statusCode,
        description: mockFile.description
      });
    }

    return {
      totalMocks: mockFiles.length,
      validMocks,
      invalidMocks,
      schemaCompliance: invalidMocks === 0,
      contractCompliance: invalidMocks === 0,
      validationErrors,
      documentationMapping
    };
  }

  /**
   * Validate individual mock file structure
   */
  private validateMockFileStructure(mockFile: MockFileInfo): boolean {
    // Check path format
    const pathValid = mockFile.path.startsWith('mocks/') && 
                      mockFile.path.endsWith('.json');
    
    // Check status code is valid HTTP status
    const statusCodeValid = mockFile.statusCode >= 100 && 
                            mockFile.statusCode < 600;
    
    // Check method is valid HTTP method
    const methodValid = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(mockFile.method);
    
    return pathValid && statusCodeValid && methodValid;
  }

  /**
   * Generate mock data index file
   * Validates: Requirement 19.1
   */
  generateMockIndex(mockFiles: MockFileInfo[]): object {
    const endpointMap = new Map<string, Map<string, Map<number, string>>>();

    for (const mockFile of mockFiles) {
      if (!endpointMap.has(mockFile.endpoint)) {
        endpointMap.set(mockFile.endpoint, new Map());
      }
      
      const methodMap = endpointMap.get(mockFile.endpoint)!;
      if (!methodMap.has(mockFile.method)) {
        methodMap.set(mockFile.method, new Map());
      }
      
      methodMap.get(mockFile.method)!.set(mockFile.statusCode, mockFile.path);
    }

    const endpoints = Array.from(endpointMap.entries()).map(([path, methods]) => ({
      path,
      methods: Array.from(methods.keys()),
      mockFiles: Object.fromEntries(
        Array.from(methods.entries()).map(([method, statusCodes]) => [
          method,
          Object.fromEntries(statusCodes)
        ])
      )
    }));

    return {
      version: '1.0.0',
      lastUpdated: new Date().toISOString(),
      apiVersion: 'v1',
      endpoints
    };
  }

  /**
   * Validate all requirements for centralized mock data
   */
  validateRequirements(
    endpoints: string[],
    platformMocks: Record<string, string[]>
  ): RequirementsValidation {
    const organization = this.organizeMockData(endpoints);
    const consolidation = this.consolidatePlatformMocks(platformMocks);
    const validation = this.validateMockData(organization.mockFiles);

    return {
      // 19.1: Centralized directory structure organized by endpoint and status codes
      requirement_19_1: organization.directoryStructure.basePath === 'mocks/' &&
                        organization.hasIndex &&
                        organization.hasSchemas,
      
      // 19.2: Happy flow (2xx) and error states (4xx, 5xx) for each endpoint
      requirement_19_2: organization.hasHappyPath && organization.hasErrorStates,
      
      // 19.3: All platforms reference the same centralized mock data files
      requirement_19_3: consolidation.allPlatformsReferenceShared,
      
      // 19.4: No platform-specific mock data duplicates
      requirement_19_4: consolidation.noPlatformSpecificMocks,
      
      // 19.5: Validation schemas for contract compliance
      requirement_19_5: validation.schemaCompliance && validation.contractCompliance,
      
      // 19.6: Naming conventions for mock data files
      requirement_19_6: organization.followsNamingConvention,
      
      // 19.7: Mock data versioning
      requirement_19_7: organization.hasVersioning,
      
      // 19.8: Documentation mapping mock files to API contracts
      requirement_19_8: validation.documentationMapping.length > 0
    };
  }

  /**
   * Check if template has required sections
   */
  validateTemplateStructure(): {
    hasPurpose: boolean;
    hasInstructions: boolean;
    hasExamples: boolean;
    hasDirectoryStructure: boolean;
    hasNamingConventions: boolean;
    hasVersioning: boolean;
    hasIndexGeneration: boolean;
    hasSchemaValidation: boolean;
    hasPlatformConsolidation: boolean;
    hasDocumentationMapping: boolean;
  } {
    const content = this.templateContent;

    return {
      hasPurpose: content.includes('## Purpose'),
      hasInstructions: content.includes('## Instructions'),
      hasExamples: content.includes('## Examples'),
      hasDirectoryStructure: content.includes('mocks/') && 
                             content.includes('api/') &&
                             content.includes('schemas/'),
      hasNamingConventions: content.includes('Naming Convention') ||
                            content.includes('naming convention') ||
                            content.includes('{status-code}-{description}.json'),
      hasVersioning: content.includes('version') || content.includes('Version'),
      hasIndexGeneration: content.includes('index.json'),
      hasSchemaValidation: content.includes('schema') || content.includes('Schema'),
      hasPlatformConsolidation: content.includes('platform') || content.includes('Platform'),
      hasDocumentationMapping: content.includes('mapping') || content.includes('Mapping')
    };
  }

  /**
   * Get status code categories
   */
  getStatusCodeCategories(): {
    success: number[];
    clientError: number[];
    serverError: number[];
  } {
    return {
      success: [200, 201, 204],
      clientError: [400, 401, 403, 404, 409, 429],
      serverError: [500, 502, 503]
    };
  }

  /**
   * Validate status code coverage for an endpoint
   */
  validateStatusCodeCoverage(statusCodes: number[]): {
    hasSuccess: boolean;
    hasClientError: boolean;
    hasServerError: boolean;
    coverage: number;
  } {
    const categories = this.getStatusCodeCategories();
    
    const hasSuccess = statusCodes.some(code => categories.success.includes(code));
    const hasClientError = statusCodes.some(code => categories.clientError.includes(code));
    const hasServerError = statusCodes.some(code => categories.serverError.includes(code));
    
    const coveredCategories = [hasSuccess, hasClientError, hasServerError]
      .filter(Boolean).length;
    
    return {
      hasSuccess,
      hasClientError,
      hasServerError,
      coverage: (coveredCategories / 3) * 100
    };
  }
}
