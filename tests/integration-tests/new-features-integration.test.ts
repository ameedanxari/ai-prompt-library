/**
 * Integration Tests for New Features (Tasks 19-21)
 * Tests centralized mock data, fake backend, and impact assessment templates
 * Requirements: 11.1, 11.4
 */

import { describe, it, expect, beforeAll } from 'vitest';
import * as fs from 'fs/promises';
import * as path from 'path';

interface TemplateValidation {
  path: string;
  exists: boolean;
  hasRequiredSections: boolean;
  hasExamples: boolean;
  hasInstructions: boolean;
  hasPurpose: boolean;
  crossReferences: string[];
  brokenReferences: string[];
}

interface ModuleIntegration {
  moduleName: string;
  integratesWithModules: string[];
  integratesWithStages: string[];
  integratesWithTemplates: string[];
}

class NewFeaturesIntegrationTest {
  private templateValidations: Map<string, TemplateValidation> = new Map();
  private moduleIntegrations: Map<string, ModuleIntegration> = new Map();

  async initialize() {
    await this.validateNewTemplates();
    await this.analyzeModuleIntegrations();
  }

  private async validateNewTemplates() {
    const newTemplates = [
      // Centralized Mock Data (Task 19)
      'prompts/modules/testing/centralized-mock-data.md',
      'prompts/modules/testing/mock-consolidation.md',
      'prompts/modules/testing/mock-validation.md',
      // Fake Backend (Task 20)
      'prompts/modules/testing/fake-backend-generator.md',
      'prompts/modules/testing/debug-menu-integration.md',
      // Impact Assessment (Task 21)
      'prompts/templates/library-dependency-map.md',
      'prompts/templates/library-change-assessment.md',
      'prompts/templates/library-vision-document.md',
    ];

    for (const templatePath of newTemplates) {
      const validation = await this.validateTemplate(templatePath);
      this.templateValidations.set(templatePath, validation);
    }
  }

  private async validateTemplate(templatePath: string): Promise<TemplateValidation> {
    const validation: TemplateValidation = {
      path: templatePath,
      exists: false,
      hasRequiredSections: false,
      hasExamples: false,
      hasInstructions: false,
      hasPurpose: false,
      crossReferences: [],
      brokenReferences: [],
    };

    try {
      const content = await fs.readFile(templatePath, 'utf-8');
      validation.exists = true;

      // Check for required sections
      validation.hasPurpose = content.includes('## Purpose') || content.includes('# Purpose');
      validation.hasInstructions = content.includes('## Instructions') || content.includes('### Instructions');
      validation.hasExamples = content.includes('## Examples') || content.includes('### Example');
      validation.hasRequiredSections = validation.hasPurpose && validation.hasInstructions && validation.hasExamples;

      // Extract cross-references
      const referencePattern = /\[([^\]]+)\]\(([^)]+\.md)\)/g;
      let match;
      while ((match = referencePattern.exec(content)) !== null) {
        const referencedPath = match[2];
        validation.crossReferences.push(referencedPath);

        // Check if reference is valid (relative path resolution)
        if (referencedPath.startsWith('./') || referencedPath.startsWith('../')) {
          const absolutePath = path.resolve(path.dirname(templatePath), referencedPath);
          try {
            await fs.access(absolutePath);
          } catch {
            validation.brokenReferences.push(referencedPath);
          }
        }
      }
    } catch {
      validation.exists = false;
    }

    return validation;
  }

  private async analyzeModuleIntegrations() {
    const modules = [
      {
        name: 'centralized-mock-data',
        path: 'prompts/modules/testing/centralized-mock-data.md',
      },
      {
        name: 'fake-backend-generator',
        path: 'prompts/modules/testing/fake-backend-generator.md',
      },
      {
        name: 'debug-menu-integration',
        path: 'prompts/modules/testing/debug-menu-integration.md',
      },
      {
        name: 'library-dependency-map',
        path: 'prompts/templates/library-dependency-map.md',
      },
      {
        name: 'library-change-assessment',
        path: 'prompts/templates/library-change-assessment.md',
      },
      {
        name: 'library-vision-document',
        path: 'prompts/templates/library-vision-document.md',
      },
    ];

    for (const module of modules) {
      const integration = await this.analyzeModuleIntegration(module.name, module.path);
      this.moduleIntegrations.set(module.name, integration);
    }
  }

  private async analyzeModuleIntegration(moduleName: string, modulePath: string): Promise<ModuleIntegration> {
    const integration: ModuleIntegration = {
      moduleName,
      integratesWithModules: [],
      integratesWithStages: [],
      integratesWithTemplates: [],
    };

    try {
      const content = await fs.readFile(modulePath, 'utf-8');

      // Find module references
      const moduleRefPattern = /modules\/([a-zA-Z0-9\-_\/]+\.md)/g;
      let match;
      while ((match = moduleRefPattern.exec(content)) !== null) {
        if (!integration.integratesWithModules.includes(match[1])) {
          integration.integratesWithModules.push(match[1]);
        }
      }

      // Find stage references
      const stageRefPattern = /stage-(\d+)-([a-zA-Z]+)/g;
      while ((match = stageRefPattern.exec(content)) !== null) {
        const stageRef = `stage-${match[1]}-${match[2]}`;
        if (!integration.integratesWithStages.includes(stageRef)) {
          integration.integratesWithStages.push(stageRef);
        }
      }

      // Find template references
      const templateRefPattern = /templates\/([a-zA-Z0-9\-_]+\.md)/g;
      while ((match = templateRefPattern.exec(content)) !== null) {
        if (!integration.integratesWithTemplates.includes(match[1])) {
          integration.integratesWithTemplates.push(match[1]);
        }
      }
    } catch {
      // File doesn't exist or can't be read
    }

    return integration;
  }

  // Test Methods

  async testCentralizedMockDataTemplateGeneration(): Promise<boolean> {
    const mockDataTemplate = this.templateValidations.get('prompts/modules/testing/centralized-mock-data.md');
    
    if (!mockDataTemplate?.exists) {
      throw new Error('Centralized mock data template does not exist');
    }

    if (!mockDataTemplate.hasRequiredSections) {
      const missing = [];
      if (!mockDataTemplate.hasPurpose) missing.push('Purpose');
      if (!mockDataTemplate.hasInstructions) missing.push('Instructions');
      if (!mockDataTemplate.hasExamples) missing.push('Examples');
      throw new Error(`Centralized mock data template missing sections: ${missing.join(', ')}`);
    }

    // Verify template contains key mock data concepts
    const content = await fs.readFile('prompts/modules/testing/centralized-mock-data.md', 'utf-8');
    const requiredConcepts = [
      'directory structure',
      'API endpoint',
      'status code',
      'JSON',
      'schema',
      'validation',
    ];

    const missingConcepts = requiredConcepts.filter(
      concept => !content.toLowerCase().includes(concept.toLowerCase())
    );

    if (missingConcepts.length > 0) {
      throw new Error(`Centralized mock data template missing concepts: ${missingConcepts.join(', ')}`);
    }

    return true;
  }

  async testFakeBackendSpecificationGeneration(): Promise<boolean> {
    const fakeBackendTemplate = this.templateValidations.get('prompts/modules/testing/fake-backend-generator.md');
    
    if (!fakeBackendTemplate?.exists) {
      throw new Error('Fake backend generator template does not exist');
    }

    if (!fakeBackendTemplate.hasRequiredSections) {
      const missing = [];
      if (!fakeBackendTemplate.hasPurpose) missing.push('Purpose');
      if (!fakeBackendTemplate.hasInstructions) missing.push('Instructions');
      if (!fakeBackendTemplate.hasExamples) missing.push('Examples');
      throw new Error(`Fake backend generator template missing sections: ${missing.join(', ')}`);
    }

    // Verify template contains key fake backend concepts
    const content = await fs.readFile('prompts/modules/testing/fake-backend-generator.md', 'utf-8');
    const requiredConcepts = [
      'server',
      'route',
      'mock data',
      'scenario',
      'health check',
      'spawn',
    ];

    const missingConcepts = requiredConcepts.filter(
      concept => !content.toLowerCase().includes(concept.toLowerCase())
    );

    if (missingConcepts.length > 0) {
      throw new Error(`Fake backend generator template missing concepts: ${missingConcepts.join(', ')}`);
    }

    return true;
  }

  async testDebugMenuIntegrationTemplate(): Promise<boolean> {
    const debugMenuTemplate = this.templateValidations.get('prompts/modules/testing/debug-menu-integration.md');
    
    if (!debugMenuTemplate?.exists) {
      throw new Error('Debug menu integration template does not exist');
    }

    if (!debugMenuTemplate.hasRequiredSections) {
      const missing = [];
      if (!debugMenuTemplate.hasPurpose) missing.push('Purpose');
      if (!debugMenuTemplate.hasInstructions) missing.push('Instructions');
      if (!debugMenuTemplate.hasExamples) missing.push('Examples');
      throw new Error(`Debug menu integration template missing sections: ${missing.join(', ')}`);
    }

    // Verify template contains platform-specific implementations
    const content = await fs.readFile('prompts/modules/testing/debug-menu-integration.md', 'utf-8');
    const requiredPlatforms = ['React', 'iOS', 'Android'];

    const missingPlatforms = requiredPlatforms.filter(
      platform => !content.includes(platform)
    );

    if (missingPlatforms.length > 0) {
      throw new Error(`Debug menu integration template missing platform support: ${missingPlatforms.join(', ')}`);
    }

    return true;
  }

  async testImpactAssessmentWorkflow(): Promise<boolean> {
    // Verify all impact assessment templates exist and are properly structured
    const impactTemplates = [
      'prompts/templates/library-dependency-map.md',
      'prompts/templates/library-change-assessment.md',
      'prompts/templates/library-vision-document.md',
    ];

    for (const templatePath of impactTemplates) {
      const validation = this.templateValidations.get(templatePath);
      
      if (!validation?.exists) {
        throw new Error(`Impact assessment template does not exist: ${templatePath}`);
      }

      if (!validation.hasRequiredSections) {
        const missing = [];
        if (!validation.hasPurpose) missing.push('Purpose');
        if (!validation.hasInstructions) missing.push('Instructions');
        if (!validation.hasExamples) missing.push('Examples');
        throw new Error(`Impact assessment template ${templatePath} missing sections: ${missing.join(', ')}`);
      }
    }

    // Verify dependency map contains key concepts
    const dependencyMapContent = await fs.readFile('prompts/templates/library-dependency-map.md', 'utf-8');
    const dependencyMapConcepts = ['dependency', 'template', 'module', 'stage', 'cross-platform'];
    
    const missingDependencyConcepts = dependencyMapConcepts.filter(
      concept => !dependencyMapContent.toLowerCase().includes(concept.toLowerCase())
    );

    if (missingDependencyConcepts.length > 0) {
      throw new Error(`Dependency map template missing concepts: ${missingDependencyConcepts.join(', ')}`);
    }

    // Verify change assessment contains key concepts
    const changeAssessmentContent = await fs.readFile('prompts/templates/library-change-assessment.md', 'utf-8');
    const changeAssessmentConcepts = ['impact', 'risk', 'validation', 'regression', 'approval'];
    
    const missingChangeConcepts = changeAssessmentConcepts.filter(
      concept => !changeAssessmentContent.toLowerCase().includes(concept.toLowerCase())
    );

    if (missingChangeConcepts.length > 0) {
      throw new Error(`Change assessment template missing concepts: ${missingChangeConcepts.join(', ')}`);
    }

    // Verify vision document contains key concepts
    const visionDocContent = await fs.readFile('prompts/templates/library-vision-document.md', 'utf-8');
    const visionDocConcepts = ['mission', 'principle', 'rollback', 'cross-platform', 'quality'];
    
    const missingVisionConcepts = visionDocConcepts.filter(
      concept => !visionDocContent.toLowerCase().includes(concept.toLowerCase())
    );

    if (missingVisionConcepts.length > 0) {
      throw new Error(`Vision document template missing concepts: ${missingVisionConcepts.join(', ')}`);
    }

    return true;
  }

  async testCrossReferencesBetweenNewAndExistingTemplates(): Promise<boolean> {
    const issues: string[] = [];

    // Check that new templates reference existing templates appropriately
    for (const [templatePath, validation] of this.templateValidations) {
      if (validation.brokenReferences.length > 0) {
        issues.push(`${templatePath} has broken references: ${validation.brokenReferences.join(', ')}`);
      }
    }

    // Verify mock data module integrates with testing modules
    const mockDataIntegration = this.moduleIntegrations.get('centralized-mock-data');
    if (mockDataIntegration) {
      // Mock data should reference or be referenced by fake backend
      const content = await fs.readFile('prompts/modules/testing/centralized-mock-data.md', 'utf-8');
      if (!content.includes('fake-backend') && !content.includes('fake backend')) {
        issues.push('Centralized mock data should reference fake backend integration');
      }
    }

    // Verify fake backend integrates with mock data
    const fakeBackendIntegration = this.moduleIntegrations.get('fake-backend-generator');
    if (fakeBackendIntegration) {
      const content = await fs.readFile('prompts/modules/testing/fake-backend-generator.md', 'utf-8');
      if (!content.includes('mock') && !content.includes('Mock')) {
        issues.push('Fake backend should reference mock data');
      }
    }

    // Verify impact assessment templates reference each other
    const dependencyMapContent = await fs.readFile('prompts/templates/library-dependency-map.md', 'utf-8');
    const changeAssessmentContent = await fs.readFile('prompts/templates/library-change-assessment.md', 'utf-8');
    
    // Check for logical connections between impact assessment templates
    if (!changeAssessmentContent.toLowerCase().includes('dependency')) {
      issues.push('Change assessment should reference dependency mapping');
    }

    if (issues.length > 0) {
      throw new Error(`Cross-reference issues found:\n${issues.join('\n')}`);
    }

    return true;
  }

  async testMockDataToFakeBackendIntegration(): Promise<boolean> {
    // Verify the mock data → fake backend workflow is properly documented
    const mockDataContent = await fs.readFile('prompts/modules/testing/centralized-mock-data.md', 'utf-8');
    const fakeBackendContent = await fs.readFile('prompts/modules/testing/fake-backend-generator.md', 'utf-8');

    // Mock data should mention it feeds into fake backend
    const mockDataIntegrationPoints = [
      'fake-backend',
      'server',
      'routing',
    ];

    const hasMockDataIntegration = mockDataIntegrationPoints.some(
      point => mockDataContent.toLowerCase().includes(point.toLowerCase())
    );

    if (!hasMockDataIntegration) {
      throw new Error('Mock data template should reference fake backend integration');
    }

    // Fake backend should reference mock data as its data source
    const fakeBackendIntegrationPoints = [
      'mock data',
      'mock file',
      'centralized',
    ];

    const hasFakeBackendIntegration = fakeBackendIntegrationPoints.some(
      point => fakeBackendContent.toLowerCase().includes(point.toLowerCase())
    );

    if (!hasFakeBackendIntegration) {
      throw new Error('Fake backend template should reference centralized mock data');
    }

    return true;
  }

  async testDebugMenuToFakeBackendIntegration(): Promise<boolean> {
    // Verify debug menu properly integrates with fake backend
    const debugMenuContent = await fs.readFile('prompts/modules/testing/debug-menu-integration.md', 'utf-8');

    // Debug menu should support environment switching including fake backend
    const requiredEnvironments = [
      'fake backend',
      'offline',
      'production',
      'staging',
    ];

    const missingEnvironments = requiredEnvironments.filter(
      env => !debugMenuContent.toLowerCase().includes(env.toLowerCase())
    );

    if (missingEnvironments.length > 0) {
      throw new Error(`Debug menu missing environment support: ${missingEnvironments.join(', ')}`);
    }

    // Debug menu should support scenario selection
    if (!debugMenuContent.toLowerCase().includes('scenario')) {
      throw new Error('Debug menu should support scenario selection for fake backend');
    }

    return true;
  }

  async testImpactAssessmentWorkflowCompleteness(): Promise<boolean> {
    // Verify the complete impact assessment workflow is documented
    const dependencyMapContent = await fs.readFile('prompts/templates/library-dependency-map.md', 'utf-8');
    const changeAssessmentContent = await fs.readFile('prompts/templates/library-change-assessment.md', 'utf-8');
    const visionDocContent = await fs.readFile('prompts/templates/library-vision-document.md', 'utf-8');

    // Dependency map should support automated discovery
    if (!dependencyMapContent.toLowerCase().includes('discover') && 
        !dependencyMapContent.toLowerCase().includes('automated')) {
      throw new Error('Dependency map should support automated dependency discovery');
    }

    // Change assessment should include risk evaluation
    if (!changeAssessmentContent.toLowerCase().includes('risk')) {
      throw new Error('Change assessment should include risk evaluation');
    }

    // Vision document should include rollback procedures
    if (!visionDocContent.toLowerCase().includes('rollback')) {
      throw new Error('Vision document should include rollback procedures');
    }

    // Vision document should include cross-platform validation
    if (!visionDocContent.toLowerCase().includes('cross-platform')) {
      throw new Error('Vision document should include cross-platform validation');
    }

    return true;
  }

  async testTemplateStructureConsistency(): Promise<boolean> {
    const issues: string[] = [];

    for (const [templatePath, validation] of this.templateValidations) {
      if (!validation.exists) {
        issues.push(`Template does not exist: ${templatePath}`);
        continue;
      }

      if (!validation.hasPurpose) {
        issues.push(`Template missing Purpose section: ${templatePath}`);
      }

      if (!validation.hasInstructions) {
        issues.push(`Template missing Instructions section: ${templatePath}`);
      }

      if (!validation.hasExamples) {
        issues.push(`Template missing Examples section: ${templatePath}`);
      }
    }

    if (issues.length > 0) {
      throw new Error(`Template structure issues:\n${issues.join('\n')}`);
    }

    return true;
  }
}

// Test Suite
describe('New Features Integration Tests (Tasks 19-21)', () => {
  let testSuite: NewFeaturesIntegrationTest;

  beforeAll(async () => {
    testSuite = new NewFeaturesIntegrationTest();
    await testSuite.initialize();
  });

  describe('Centralized Mock Data (Task 19)', () => {
    it('should have properly structured centralized mock data template', async () => {
      const result = await testSuite.testCentralizedMockDataTemplateGeneration();
      expect(result).toBe(true);
    });

    it('should integrate mock data with fake backend', async () => {
      const result = await testSuite.testMockDataToFakeBackendIntegration();
      expect(result).toBe(true);
    });
  });

  describe('Fake Backend Generation (Task 20)', () => {
    it('should have properly structured fake backend generator template', async () => {
      const result = await testSuite.testFakeBackendSpecificationGeneration();
      expect(result).toBe(true);
    });

    it('should have properly structured debug menu integration template', async () => {
      const result = await testSuite.testDebugMenuIntegrationTemplate();
      expect(result).toBe(true);
    });

    it('should integrate debug menu with fake backend', async () => {
      const result = await testSuite.testDebugMenuToFakeBackendIntegration();
      expect(result).toBe(true);
    });
  });

  describe('Impact Assessment (Task 21)', () => {
    it('should have complete impact assessment workflow templates', async () => {
      const result = await testSuite.testImpactAssessmentWorkflow();
      expect(result).toBe(true);
    });

    it('should have complete impact assessment workflow documentation', async () => {
      const result = await testSuite.testImpactAssessmentWorkflowCompleteness();
      expect(result).toBe(true);
    });
  });

  describe('Cross-Template Integration', () => {
    it('should have valid cross-references between new and existing templates', async () => {
      const result = await testSuite.testCrossReferencesBetweenNewAndExistingTemplates();
      expect(result).toBe(true);
    });

    it('should have consistent template structure across all new templates', async () => {
      const result = await testSuite.testTemplateStructureConsistency();
      expect(result).toBe(true);
    });
  });
});

// Validation Tests
describe('New Features Validation Tests', () => {
  it('should have all required new template files', async () => {
    const requiredTemplates = [
      'prompts/modules/testing/centralized-mock-data.md',
      'prompts/modules/testing/fake-backend-generator.md',
      'prompts/modules/testing/debug-menu-integration.md',
      'prompts/templates/library-dependency-map.md',
      'prompts/templates/library-change-assessment.md',
      'prompts/templates/library-vision-document.md',
    ];

    for (const templatePath of requiredTemplates) {
      try {
        await fs.access(templatePath);
      } catch {
        throw new Error(`Required template missing: ${templatePath}`);
      }
    }
  });

  it('should have mock consolidation and validation templates', async () => {
    const supportingTemplates = [
      'prompts/modules/testing/mock-consolidation.md',
      'prompts/modules/testing/mock-validation.md',
    ];

    for (const templatePath of supportingTemplates) {
      try {
        await fs.access(templatePath);
      } catch {
        throw new Error(`Supporting template missing: ${templatePath}`);
      }
    }
  });
});
