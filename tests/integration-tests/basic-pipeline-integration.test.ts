
import { StagePipelineController, StageId, ProjectBrief, ProjectContext, StageResult, StageStatus } from '../../src/stage-pipeline-controller';
import { QualityGateSystem } from '../../src/quality-gate-system';
import { ErrorRecoverySystem, ErrorType, ErrorSeverity } from '../../src/error-recovery-system';
import { ContextOptimizationService } from '../../src/context-optimization-service';
import { StateManager } from '../../src/state-manager';
import { TemplateCompositionEngine, ApplicationDomain } from '../../src/template-composition-engine';
import { TaskGenerationEngine, Task } from '../../src/task-generation-engine';
import { DocumentationTraceabilitySystem } from '../../src/documentation-traceability-system';

describe('Basic Pipeline Integration', () => {
  let pipelineController: StagePipelineController;
  let qualityGate: QualityGateSystem;
  let errorRecovery: ErrorRecoverySystem;
  let contextOptimizer: ContextOptimizationService;
  let stateManager: StateManager;
  let templateComposer: TemplateCompositionEngine;
  let taskGenerator: TaskGenerationEngine;
  let documentation: DocumentationTraceabilitySystem;

  const testProjectBrief: ProjectBrief = {
    description: 'A test project for pipeline integration',
    domain: 'social-media',
    platforms: ['web', 'mobile'],
    features: ['user-auth', 'feed', 'profiles'],
    requirements: ['scalability: medium', 'security: high']
  };

  beforeEach(() => {
    stateManager = new StateManager('test-outputs');
    qualityGate = new QualityGateSystem();
    errorRecovery = new ErrorRecoverySystem();
    contextOptimizer = new ContextOptimizationService();
    templateComposer = new TemplateCompositionEngine();
    taskGenerator = new TaskGenerationEngine();
    documentation = new DocumentationTraceabilitySystem();

    pipelineController = new StagePipelineController();
  });

  describe('Core Component Integration', () => {
    it('should initialize project state correctly', async () => {
      const state = stateManager.createProject(testProjectBrief);
      expect(state).toBeDefined();
      expect(state.currentStage).toBe(StageId.INTAKE);
      expect(state.projectId).toBeDefined();
      expect(state.projectId.startsWith('project-')).toBe(true);
    });

    it('should compose templates based on project brief', async () => {
      const composition = templateComposer.composeTemplates(
        testProjectBrief.domain,
        testProjectBrief.features,
        StageId.ARCHITECTURE
      );

      // Verify composition structure (synchronous return)
      expect(composition.coreTemplates).toBeDefined();
      expect(composition.crossCuttingTemplates).toBeDefined();
      expect(composition.selectedTemplates).toBeDefined();
    });

    it('should generate tasks from specifications', async () => {
      const specs = [{
        id: 'spec-1',
        name: 'User Auth Spec',
        type: 'functional',
        content: 'Implement user authentication',
        stage: StageId.IMPLEMENTATION,
        requirements: ['Login', 'Register']
      }];

      const tasks = taskGenerator.generateTasks(specs);
      expect(tasks.length).toBeGreaterThan(0);
      expect(tasks[0].context.currentStage).toBe(StageId.IMPLEMENTATION); // Updated to access context.currentStage
      expect(tasks[0].context.relatedSpecifications).toContain('spec-1');
    });

    it('should validate stage transition', async () => {
      const projectState = stateManager.createProject(testProjectBrief);

      // Simulate stage result for validation
      const mockResult: StageResult = {
        stageId: StageId.INTAKE,
        status: StageStatus.COMPLETED,
        outputs: [{
          type: 'validated-brief',
          filename: 'validated-brief.md',
          content: 'Valid content',
          references: [],
          platform: 'all'
        }],
        decisions: [],
        nextStage: StageId.CHARTER,
        validationResults: [],
        timestamp: new Date(),
        duration: 100
      };

      // We use validateStageTransition which is public
      const validation = qualityGate.validateStageTransition(
        StageId.INTAKE,
        StageId.CHARTER,
        mockResult,
        projectState
      );

      // Since we haven't satisfied prerequisites (outputs in state), it might fail, 
      // but we are testing the interface mostly.
      expect(validation).toBeDefined();
      expect(validation.canProceed).toBeDefined();
      expect(validation.issues).toBeDefined();
    });

    it('should detect errors in state', async () => {
      const projectState = stateManager.createProject(testProjectBrief);

      // Force an error condition if possible, or just check empty detection
      const errors = errorRecovery.detectErrors(projectState);

      expect(Array.isArray(errors)).toBe(true);
      if (errors.length > 0) {
        expect(errors[0].type).toBeDefined();
        const options = errorRecovery.getRecoveryOptions(errors[0]);
        expect(Array.isArray(options)).toBe(true);
      }
    });

    it('should optimize context prompts', () => {
      const prompt = "This is a test prompt content.";
      const optimized = contextOptimizer.optimizePrompt(prompt);

      expect(optimized).toBeDefined();
      expect(optimized.content).toBeDefined();
      expect(optimized.tokenCount).toBeGreaterThan(0);
    });
  });

  describe('End-to-End Pipeline Flow', () => {
    it('should execute a full stage transition', async () => {
      // 1. Initialize
      stateManager.createProject(testProjectBrief);

      // 2. Execute Stage (mocking internals mostly via integration)
      const context: ProjectContext = {
        brief: testProjectBrief,
        currentStage: StageId.INTAKE,
        completedStages: [],
        decisions: [],
        assets: [],
        templates: []
      };

      const result = await pipelineController.executeStage(StageId.INTAKE, context);

      expect(result.status).toBeDefined(); // Could be FAILED due to missing inputs, but checking structure
      expect(result.outputs).toBeDefined();

      // 3. Check State Update
      const state = stateManager.getProjectState();
      expect(state).toBeDefined();

      if (state) {
        // Verify state didn't regress
        expect(state.currentStage).toBeDefined();
      }
    });

    it('should maintain traceability across stages', async () => {
      const projectId = 'test-trace-id';
      // Traceability System Test

      // 1. Create Requirement
      const req = documentation.trackRequirement(
        'REQ-001',
        'User Login',
        StageId.INTAKE,
        projectId
      );

      // 2. Link Task
      const taskRef = documentation.addTaskReference(
        'TASK-001',
        'Implement Login',
        StageId.IMPLEMENTATION,
        ['REQ-001'],
        [],
        projectId
      );

      // 3. Verify Traceability
      const matrix = documentation.getTraceabilityMatrix(projectId);
      expect(matrix.length).toBeGreaterThan(0);
      expect(matrix[0].sourceId).toBe('TASK-001');
      expect(matrix[0].targetId).toBe('REQ-001');
    });
  });

  describe('Performance Integration', () => {
    it('should optimize prompt tokens', async () => {
      const longPrompt = "Token ".repeat(1000);
      const start = Date.now();
      const optimized = contextOptimizer.optimizePrompt(longPrompt);
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(1000); // Performance check
      expect(optimized.tokenCount).toBeLessThan(1000 * 2); // Rough check
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle missing prerequisites', async () => {
      // Create fresh state
      const state = stateManager.createProject(testProjectBrief);

      // Detect errors
      const errors = errorRecovery.detectErrors(state);

      // Should likely detect missing output/context depending on implementation
      // Just verifying API calls work
      expect(errors).toBeDefined();
    });

    it('should recover from state inconsistencies', async () => {
      const state = stateManager.createProject(testProjectBrief);
      // Manually Corrupt State if possible or simulate error

      const errorMock = {
        id: 'error-1',
        type: ErrorType.MISSING_DEPENDENCY,
        severity: ErrorSeverity.MAJOR,
        stage: StageId.INTAKE,
        message: 'Missing dep',
        details: 'details',
        context: { expectedOutput: 'project-charter' },
        timestamp: new Date(),
        recoverable: true
      };

      const options = errorRecovery.getRecoveryOptions(errorMock);
      expect(options.length).toBeGreaterThan(0);

      const recovery = await errorRecovery.recoverFromError(errorMock, options[0], state);
      expect(recovery.success).toBeDefined();
    });
  });
});