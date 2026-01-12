/**
 * Basic Pipeline Integration Tests
 * Tests core pipeline functionality with actual component APIs
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StagePipelineController, StageId, StageStatus, ProjectBrief } from '../../src/stage-pipeline-controller.js';
import { StateManager } from '../../src/state-manager.js';
import { OutputDirectoryManager } from '../../src/output-directory-manager.js';
import { TaskGenerationEngine } from '../../src/task-generation-engine.js';
import { ContextOptimizationService } from '../../src/context-optimization-service.js';
import { TemplateCompositionEngine } from '../../src/template-composition-engine.js';
import { QualityGateSystem } from '../../src/quality-gate-system.js';
import { ErrorRecoverySystem } from '../../src/error-recovery-system.js';
import { DocumentationTraceabilitySystem } from '../../src/documentation-traceability-system.js';

describe('Basic Pipeline Integration Tests', () => {
  let pipelineController: StagePipelineController;
  let stateManager: StateManager;
  let outputManager: OutputDirectoryManager;
  let taskGenerator: TaskGenerationEngine;
  let contextOptimizer: ContextOptimizationService;
  let templateComposer: TemplateCompositionEngine;
  let qualityGate: QualityGateSystem;
  let errorRecovery: ErrorRecoverySystem;
  let documentation: DocumentationTraceabilitySystem;

  const testProjectBrief: ProjectBrief = {
    domain: 'web',
    platforms: ['web'],
    features: ['authentication', 'user-profiles', 'basic-crud'],
    requirements: {
      scalability: 'medium',
      security: 'standard',
      performance: 'standard'
    }
  };

  beforeEach(() => {
    pipelineController = new StagePipelineController();
    stateManager = new StateManager();
    outputManager = new OutputDirectoryManager();
    taskGenerator = new TaskGenerationEngine();
    contextOptimizer = new ContextOptimizationService();
    templateComposer = new TemplateCompositionEngine();
    qualityGate = new QualityGateSystem();
    errorRecovery = new ErrorRecoverySystem();
    documentation = new DocumentationTraceabilitySystem();
  });

  describe('Core Component Integration', () => {
    it('should create and manage project state', async () => {
      // Create project state
      const projectState = stateManager.createProject(testProjectBrief, 'Test Project');
      
      expect(projectState.projectId).toBeDefined();
      expect(projectState.projectName).toBe('Test Project');
      expect(projectState.currentStage).toBe(StageId.INTAKE);
      expect(projectState.completedStages).toHaveLength(0);
    });

    it('should generate tasks from specifications', async () => {
      const specifications = [
        {
          id: 'spec-1',
          title: 'User Authentication',
          description: 'Implement user authentication system',
          stage: StageId.IMPLEMENTATION,
          requirements: ['secure login', 'password hashing', 'session management'],
          estimatedTokens: 1500
        }
      ];

      const tasks = taskGenerator.generateTasks(specifications);
      
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].title).toBeDefined();
      expect(tasks[0].stage).toBe(StageId.IMPLEMENTATION);
    });

    it('should optimize context for token efficiency', async () => {
      const largeContent = 'A'.repeat(10000); // 10k characters
      const context = {
        projectBrief: testProjectBrief,
        content: largeContent,
        stage: StageId.IMPLEMENTATION
      };

      const optimized = contextOptimizer.optimizeContext(context);
      
      expect(optimized.tokenCount).toBeLessThan(8000);
      expect(optimized.chunks.length).toBeGreaterThan(0);
    });

    it('should compose templates based on domain and features', async () => {
      const composition = templateComposer.composeTemplates(
        testProjectBrief.domain,
        testProjectBrief.features,
        StageId.IMPLEMENTATION
      );
      
      expect(composition.coreTemplates).toBeDefined();
      expect(composition.crossCuttingTemplates).toBeDefined();
      expect(composition.selectedTemplates.length).toBeGreaterThan(0);
    });

    it('should validate stage prerequisites', async () => {
      const projectState = stateManager.createProject(testProjectBrief, 'Test Project');
      
      const validation = qualityGate.validateStage(
        StageId.INTAKE,
        projectState,
        []
      );
      
      expect(validation.canProceed).toBeDefined();
      expect(validation.issues).toBeDefined();
    });

    it('should handle error scenarios', async () => {
      const error = {
        type: 'validation-error',
        stage: StageId.IMPLEMENTATION,
        message: 'Missing required dependencies',
        context: testProjectBrief
      };

      const recovery = errorRecovery.analyzeError(error);
      
      expect(recovery.canRecover).toBeDefined();
      expect(recovery.recoverySteps).toBeDefined();
    });

    it('should create traceability links', async () => {
      const projectId = 'test-project-001';
      
      const link = documentation.createTraceabilityLink(
        'requirement',
        'req-001',
        'task',
        'task-001',
        'implements',
        StageId.IMPLEMENTATION,
        projectId
      );
      
      expect(link.id).toBeDefined();
      expect(link.sourceType).toBe('requirement');
      expect(link.targetType).toBe('task');
      expect(link.relationship).toBe('implements');
    });
  });

  describe('End-to-End Pipeline Flow', () => {
    it('should execute basic pipeline stages', async () => {
      // Create project
      const projectState = stateManager.createProject(testProjectBrief, 'E2E Test Project');
      
      // Execute intake stage
      const intakeResult = pipelineController.executeStage(
        StageId.INTAKE,
        { brief: testProjectBrief, context: {} }
      );
      
      expect(intakeResult.success).toBe(true);
      expect(intakeResult.outputs.length).toBeGreaterThan(0);
      
      // Update state
      stateManager.updateStageProgress(StageId.INTAKE, intakeResult);
      
      // Verify state update
      const updatedState = stateManager.getCurrentState();
      expect(updatedState?.completedStages).toContain(StageId.INTAKE);
    });

    it('should maintain consistency across components', async () => {
      const projectId = 'consistency-test';
      
      // Create project state
      const projectState = stateManager.createProject(testProjectBrief, 'Consistency Test');
      
      // Generate tasks
      const specifications = [
        {
          id: 'spec-auth',
          title: 'Authentication System',
          description: 'User authentication and authorization',
          stage: StageId.IMPLEMENTATION,
          requirements: ['login', 'logout', 'permissions'],
          estimatedTokens: 1200
        }
      ];
      
      const tasks = taskGenerator.generateTasks(specifications);
      
      // Compose templates
      const templates = templateComposer.composeTemplates(
        testProjectBrief.domain,
        testProjectBrief.features,
        StageId.IMPLEMENTATION
      );
      
      // Validate stage
      const validation = qualityGate.validateStage(
        StageId.IMPLEMENTATION,
        projectState,
        tasks
      );
      
      // Create documentation
      for (const task of tasks) {
        documentation.addTaskReference(
          task.id,
          task.title,
          task.stage,
          task.requirements || [],
          [],
          projectId
        );
      }
      
      // Verify consistency
      expect(tasks.length).toBeGreaterThan(0);
      expect(templates.selectedTemplates.length).toBeGreaterThan(0);
      expect(validation.canProceed).toBeDefined();
      
      const matrix = documentation.getTraceabilityMatrix(projectId);
      expect(matrix.length).toBe(tasks.length);
    });
  });

  describe('Performance Integration', () => {
    it('should handle multiple projects efficiently', async () => {
      const startTime = Date.now();
      
      // Create multiple projects
      const projects = [];
      for (let i = 0; i < 5; i++) {
        const project = stateManager.createProject(testProjectBrief, `Project ${i}`);
        projects.push(project);
      }
      
      const creationTime = Date.now() - startTime;
      
      // Should create projects quickly
      expect(creationTime).toBeLessThan(1000); // 1 second
      expect(projects.length).toBe(5);
      
      // All projects should be valid
      for (const project of projects) {
        expect(project.projectId).toBeDefined();
        expect(project.currentStage).toBe(StageId.INTAKE);
      }
    });

    it('should optimize large content efficiently', async () => {
      const largeContext = {
        projectBrief: testProjectBrief,
        content: 'X'.repeat(20000), // 20k characters
        stage: StageId.IMPLEMENTATION
      };
      
      const startTime = Date.now();
      const optimized = contextOptimizer.optimizeContext(largeContext);
      const optimizationTime = Date.now() - startTime;
      
      // Should optimize quickly
      expect(optimizationTime).toBeLessThan(2000); // 2 seconds
      expect(optimized.tokenCount).toBeLessThan(8000);
      expect(optimized.optimizationApplied).toBe(true);
    });
  });

  describe('Error Handling Integration', () => {
    it('should recover from component failures gracefully', async () => {
      // Simulate various error scenarios
      const errors = [
        {
          type: 'validation-error',
          stage: StageId.IMPLEMENTATION,
          message: 'Invalid specification format',
          context: testProjectBrief
        },
        {
          type: 'template-error',
          stage: StageId.DESIGN,
          message: 'Template not found',
          context: testProjectBrief
        },
        {
          type: 'state-error',
          stage: StageId.ARCHITECTURE,
          message: 'State file corruption',
          context: testProjectBrief
        }
      ];
      
      for (const error of errors) {
        const recovery = errorRecovery.analyzeError(error);
        
        expect(recovery.canRecover).toBeDefined();
        expect(recovery.recoverySteps).toBeDefined();
        expect(Array.isArray(recovery.recoverySteps)).toBe(true);
      }
    });

    it('should maintain data integrity during failures', async () => {
      const projectState = stateManager.createProject(testProjectBrief, 'Integrity Test');
      const originalState = JSON.parse(JSON.stringify(projectState));
      
      // Simulate failure during state update
      try {
        // This should not corrupt the existing state
        stateManager.updateStageProgress(StageId.IMPLEMENTATION, {
          success: false,
          outputs: [],
          errors: ['Simulated failure'],
          stage: StageId.IMPLEMENTATION,
          duration: 0
        });
      } catch (error) {
        // Expected to fail
      }
      
      // State should remain consistent
      const currentState = stateManager.getCurrentState();
      expect(currentState?.projectId).toBe(originalState.projectId);
      expect(currentState?.currentStage).toBe(originalState.currentStage);
    });
  });
});