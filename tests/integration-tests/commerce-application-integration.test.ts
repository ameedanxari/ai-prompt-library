/**
 * Integration Tests: Commerce Application Pipeline
 * Tests complete pipeline execution for e-commerce projects
 * Validates template selection, composition, and state management
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StagePipelineController, StageId } from '../../src/stage-pipeline-controller.js';
import { StateManager } from '../../src/state-manager.js';
import { OutputDirectoryManager } from '../../src/output-directory-manager.js';
import { TaskGenerationEngine } from '../../src/task-generation-engine.js';
import { ContextOptimizationService } from '../../src/context-optimization-service.js';
import { TemplateCompositionEngine } from '../../src/template-composition-engine.js';
import { QualityGateSystem } from '../../src/quality-gate-system.js';
import { ErrorRecoverySystem } from '../../src/error-recovery-system.js';
import { DocumentationTraceabilitySystem } from '../../src/documentation-traceability-system.js';

describe('Commerce Application Integration Tests', () => {
  let pipelineController: StagePipelineController;
  let stateManager: StateManager;
  let outputManager: OutputDirectoryManager;
  let taskGenerator: TaskGenerationEngine;
  let contextOptimizer: ContextOptimizationService;
  let templateComposer: TemplateCompositionEngine;
  let qualityGate: QualityGateSystem;
  let errorRecovery: ErrorRecoverySystem;
  let documentation: DocumentationTraceabilitySystem;

  const commerceProjectBrief = {
    projectId: 'ecommerce-platform-001',
    projectName: 'Modern E-commerce Platform',
    description: 'A comprehensive e-commerce platform with product catalog, shopping cart, payment processing, inventory management, and customer analytics',
    domain: 'commerce',
    platforms: ['web', 'mobile'],
    features: [
      'product-catalog',
      'shopping-cart',
      'payment-processing',
      'inventory-management',
      'user-authentication',
      'order-management',
      'analytics-dashboard',
      'customer-reviews',
      'recommendation-engine',
      'multi-vendor-support'
    ],
    requirements: {
      scalability: 'high',
      security: 'critical',
      performance: 'high',
      compliance: ['PCI-DSS', 'GDPR'],
      integrations: ['stripe', 'paypal', 'shopify-api', 'analytics']
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

  describe('Complete Pipeline Execution', () => {
    it('should execute full 10-stage pipeline for commerce application', async () => {
      const projectId = commerceProjectBrief.projectId;
      
      // Initialize project state
      const initialState = await stateManager.initializeProject(
        projectId,
        commerceProjectBrief.projectName,
        commerceProjectBrief
      );
      
      expect(initialState.projectId).toBe(projectId);
      expect(initialState.currentStage).toBe(StageId.INTAKE);
      
      // Execute each stage
      const stages = Object.values(StageId);
      let currentState = initialState;
      
      for (const stage of stages) {
        // Generate tasks for current stage
        const tasks = await taskGenerator.generateTasks(
          commerceProjectBrief,
          stage,
          currentState
        );
        
        expect(tasks.length).toBeGreaterThan(0);
        expect(tasks.every(task => task.stage === stage)).toBe(true);
        
        // Optimize context for stage
        const optimizedContext = await contextOptimizer.optimizeForStage(
          commerceProjectBrief,
          stage,
          tasks
        );
        
        expect(optimizedContext.tokenCount).toBeLessThan(8000);
        expect(optimizedContext.chunks.length).toBeGreaterThan(0);
        
        // Select and compose templates
        const templates = await templateComposer.selectTemplates(
          commerceProjectBrief.domain,
          stage,
          commerceProjectBrief.features
        );
        
        expect(templates.coreTemplates.length).toBeGreaterThan(0);
        expect(templates.crossCuttingTemplates.length).toBeGreaterThan(0);
        
        // Validate stage prerequisites
        const validation = await qualityGate.validateStagePrerequisites(
          stage,
          currentState,
          tasks
        );
        
        expect(validation.canProceed).toBe(true);
        
        // Execute stage
        const stageResult = await pipelineController.executeStage(
          stage,
          currentState,
          {
            tasks,
            templates,
          }
        );
        
        expect(stageResult.success).toBe(true);
        expect(stageResult.outputs.length).toBeGreaterThan(0);
        
        // Update state
        currentState = await stateManager.updateStage(
          projectId,
          stage,
          stageResult.outputs
        );
        
        expect(currentState.completedStages).toContain(stage);
        
        // Document stage completion
        await documentation.addTaskReference(
          `stage-${stage}`,
          `Complete ${stage} for commerce platform`,
          stage,
          [`req-${stage}`],
          [],
          projectId
        );
      }
      
      // Verify final state
      expect(currentState.completedStages.length).toBe(stages.length);
      expect(currentState.currentStage).toBe(StageId.HANDOFF);
    });

    it('should handle commerce-specific template selection', async () => {
      const templates = await templateComposer.selectTemplates(
        'commerce',
        StageId.ARCHITECTURE,
        commerceProjectBrief.features
      );
      
      // Should include commerce-specific templates
      const templateNames = templates.coreTemplates.map(t => t.name);
      expect(templateNames).toContain('commerce-architecture');
      expect(templateNames).toContain('payment-processing');
      expect(templateNames).toContain('product-catalog');
      
      // Should include cross-cutting templates for commerce requirements
      const crossCuttingNames = templates.crossCuttingTemplates.map(t => t.name);
      expect(crossCuttingNames).toContain('security-compliance');
      expect(crossCuttingNames).toContain('performance-optimization');
      expect(crossCuttingNames).toContain('analytics-integration');
    });

    it('should generate commerce-appropriate tasks', async () => {
      const tasks = await taskGenerator.generateTasks(
        commerceProjectBrief,
        StageId.IMPLEMENTATION,
        await stateManager.getProjectState(commerceProjectBrief.projectId)
      );
      
      // Should generate commerce-specific implementation tasks
      const taskTitles = tasks.map(t => t.title.toLowerCase());
      expect(taskTitles.some(title => title.includes('product'))).toBe(true);
      expect(taskTitles.some(title => title.includes('cart') || title.includes('shopping'))).toBe(true);
      expect(taskTitles.some(title => title.includes('payment'))).toBe(true);
      expect(taskTitles.some(title => title.includes('inventory'))).toBe(true);
      
      // Tasks should be properly sized and context-agnostic
      for (const task of tasks) {
        expect(task.estimatedTokens).toBeLessThan(2000);
        expect(task.contextReferences.length).toBeGreaterThan(0);
        expect(task.dependencies.length).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe('Commerce-Specific Validations', () => {
    it('should validate PCI-DSS compliance requirements', async () => {
      const validation = await qualityGate.validateComplianceRequirements(
        commerceProjectBrief,
        ['PCI-DSS']
      );
      
      expect(validation.compliant).toBe(true);
      expect(validation.requirements.some(req => req.includes('payment'))).toBe(true);
      expect(validation.requirements.some(req => req.includes('encryption'))).toBe(true);
      expect(validation.requirements.some(req => req.includes('audit'))).toBe(true);
    });

    it('should validate e-commerce architecture patterns', async () => {
      const architectureValidation = await qualityGate.validateArchitecturalPatterns(
        commerceProjectBrief,
        'commerce'
      );
      
      expect(architectureValidation.valid).toBe(true);
      expect(architectureValidation.patterns).toContain('microservices');
      expect(architectureValidation.patterns).toContain('event-driven');
      expect(architectureValidation.patterns).toContain('api-gateway');
    });

    it('should validate commerce integration requirements', async () => {
      const integrationValidation = await qualityGate.validateIntegrationRequirements(
        commerceProjectBrief,
        commerceProjectBrief.requirements.integrations
      );
      
      expect(integrationValidation.valid).toBe(true);
      expect(integrationValidation.integrations.length).toBe(commerceProjectBrief.requirements.integrations.length);
      
      // Should validate payment gateway integrations
      const paymentIntegrations = integrationValidation.integrations.filter(
        i => i.category === 'payment'
      );
      expect(paymentIntegrations.length).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should recover from payment integration failures', async () => {
      const error = {
        type: 'integration-failure',
        stage: StageId.IMPLEMENTATION,
        component: 'payment-gateway',
        message: 'Stripe API integration failed',
        context: commerceProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.length).toBeGreaterThan(0);
      expect(recovery.recoverySteps.some(step => step.includes('fallback'))).toBe(true);
      expect(recovery.alternativeApproaches.length).toBeGreaterThan(0);
    });

    it('should recover from inventory management conflicts', async () => {
      const error = {
        type: 'data-conflict',
        stage: StageId.IMPLEMENTATION,
        component: 'inventory-system',
        message: 'Concurrent inventory updates causing data inconsistency',
        context: commerceProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => step.includes('lock') || step.includes('queue'))).toBe(true);
    });

    it('should recover from scalability bottlenecks', async () => {
      const error = {
        type: 'performance-issue',
        stage: StageId.OPTIMIZATION,
        component: 'product-search',
        message: 'Product search performance degraded under load',
        context: commerceProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('cache') || step.includes('index') || step.includes('optimize')
      )).toBe(true);
    });
  });

  describe('State Management and Resumability', () => {
    it('should maintain state consistency during commerce pipeline execution', async () => {
      const projectId = commerceProjectBrief.projectId;
      
      // Initialize and execute first few stages
      await stateManager.initializeProject(projectId, commerceProjectBrief.projectName, commerceProjectBrief);
      
      const stages = [StageId.INTAKE, StageId.ANALYSIS, StageId.ARCHITECTURE];
      
      for (const stage of stages) {
        const tasks = await taskGenerator.generateTasks(commerceProjectBrief, stage, 
          await stateManager.getProjectState(projectId));
        
        const stageResult = await pipelineController.executeStage(stage, 
          await stateManager.getProjectState(projectId), { tasks, templates: [] });
        
        await stateManager.updateStage(projectId, stage, stageResult.outputs);
      }
      
      // Verify state consistency
      const currentState = await stateManager.getProjectState(projectId);
      expect(currentState.completedStages).toEqual(stages);
      expect(currentState.currentStage).toBe(StageId.DESIGN);
      
      // Verify resumability
      const canResume = await stateManager.canResumeExecution(projectId);
      expect(canResume).toBe(true);
      
      const resumeContext = await stateManager.getResumeContext(projectId);
      expect(resumeContext.nextStage).toBe(StageId.DESIGN);
      expect(resumeContext.availableContext.length).toBeGreaterThan(0);
    });

    it('should handle commerce-specific state transitions', async () => {
      const projectId = commerceProjectBrief.projectId;
      
      // Test transition from architecture to design with commerce-specific outputs
      const architectureOutputs = [
        {
          type: 'architecture-document',
          content: 'Commerce microservices architecture with payment gateway integration',
          stage: StageId.ARCHITECTURE
        },
        {
          type: 'api-specification',
          content: 'REST API specification for product catalog and order management',
          stage: StageId.ARCHITECTURE
        }
      ];
      
      await stateManager.initializeProject(projectId, commerceProjectBrief.projectName, commerceProjectBrief);
      await stateManager.updateStage(projectId, StageId.ARCHITECTURE, architectureOutputs);
      
      const state = await stateManager.getProjectState(projectId);
      expect(state.outputs.length).toBe(architectureOutputs.length);
      expect(state.outputs.every(output => output.stage === StageId.ARCHITECTURE)).toBe(true);
      
      // Verify next action is properly set for design stage
      expect(state.nextAction.nextStage).toBe(StageId.DESIGN);
      expect(state.nextAction.contextFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Documentation and Traceability', () => {
    it('should maintain complete traceability for commerce requirements', async () => {
      const projectId = commerceProjectBrief.projectId;
      
      // Track commerce-specific requirements
      const requirements = [
        'secure-payment-processing',
        'scalable-product-catalog',
        'real-time-inventory-tracking',
        'multi-vendor-support',
        'analytics-integration'
      ];
      
      for (const req of requirements) {
        await documentation.trackRequirement(req, `Commerce requirement: ${req}`, StageId.ANALYSIS, projectId);
      }
      
      // Add implementation tasks
      for (const req of requirements) {
        await documentation.addTaskReference(
          `implement-${req}`,
          `Implement ${req}`,
          StageId.IMPLEMENTATION,
          [req],
          [],
          projectId
        );
      }
      
      // Generate coverage report
      const coverage = await documentation.generateCoverageReport(projectId);
      expect(coverage.totalRequirements).toBe(requirements.length);
      expect(coverage.coveredRequirements).toBe(requirements.length);
      expect(coverage.coveragePercentage).toBe(100);
      
      // Verify traceability matrix
      const matrix = await documentation.getTraceabilityMatrix(projectId);
      expect(matrix.length).toBe(requirements.length); // One link per requirement
      
      for (const link of matrix) {
        expect(link.relationship).toBe('implements');
        expect(link.targetType).toBe('requirement');
        expect(requirements).toContain(link.targetId);
      }
    });

    it('should generate comprehensive commerce project documentation', async () => {
      const projectId = commerceProjectBrief.projectId;
      
      // Initialize project with commerce-specific state
      const projectState = await stateManager.initializeProject(
        projectId, 
        commerceProjectBrief.projectName, 
        commerceProjectBrief
      );
      
      // Add some requirements and tasks
      await documentation.trackRequirement('payment-security', 'Secure payment processing', StageId.ANALYSIS, projectId);
      await documentation.addTaskReference('implement-stripe', 'Implement Stripe integration', StageId.IMPLEMENTATION, ['payment-security'], [], projectId);
      
      // Generate documentation
      const docs = await documentation.generateProjectDocumentation(projectState);
      
      expect(docs.projectName).toBe(commerceProjectBrief.projectName);
      expect(docs.overview).toContain('commerce');
      expect(docs.requirements.length).toBeGreaterThan(0);
      expect(docs.tasks.length).toBeGreaterThan(0);
      
      // Export to markdown
      const markdown = await documentation.exportToMarkdown(docs);
      expect(markdown).toContain(commerceProjectBrief.projectName);
      expect(markdown).toContain('payment');
      expect(markdown).toContain('Stripe');
    });
  });

  describe('Performance and Optimization', () => {
    it('should optimize context for commerce-specific content', async () => {
      const largeCommerceContext = {
        ...commerceProjectBrief,
        features: [
          ...commerceProjectBrief.features,
          'advanced-search', 'recommendation-ai', 'loyalty-program',
          'multi-currency', 'tax-calculation', 'shipping-integration',
          'customer-service-chat', 'social-commerce', 'mobile-app-integration'
        ],
        detailedRequirements: 'A'.repeat(5000) // Large content to test optimization
      };
      
      const tasks = await taskGenerator.generateTasks(
        largeCommerceContext,
        StageId.IMPLEMENTATION,
        await stateManager.getProjectState(commerceProjectBrief.projectId)
      );
      
      const optimized = await contextOptimizer.optimizeForStage(
        largeCommerceContext,
        StageId.IMPLEMENTATION,
        tasks
      );
      
      expect(optimized.tokenCount).toBeLessThan(8000);
      expect(optimized.chunks.length).toBeGreaterThan(1);
      expect(optimized.optimizationApplied).toBe(true);
      
      // Should preserve essential commerce information
      const combinedContent = optimized.chunks.map(c => c.content).join(' ');
      expect(combinedContent).toContain('payment');
      expect(combinedContent).toContain('product');
      expect(combinedContent).toContain('commerce');
    });

    it('should handle large commerce feature sets efficiently', async () => {
      const startTime = Date.now();
      
      const templates = await templateComposer.selectTemplates(
        'commerce',
        StageId.IMPLEMENTATION,
        commerceProjectBrief.features
      );
      
      const selectionTime = Date.now() - startTime;
      
      // Should complete template selection quickly even with many features
      expect(selectionTime).toBeLessThan(1000); // 1 second
      expect(templates.coreTemplates.length).toBeGreaterThan(0);
      expect(templates.crossCuttingTemplates.length).toBeGreaterThan(0);
    });
  });
});