/**
 * Integration Tests: Fintech Application Pipeline
 * Tests pipeline execution with compliance requirements
 * Validates security and regulatory template inclusion
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

describe('Fintech Application Integration Tests', () => {
  let pipelineController: StagePipelineController;
  let stateManager: StateManager;
  let outputManager: OutputDirectoryManager;
  let taskGenerator: TaskGenerationEngine;
  let contextOptimizer: ContextOptimizationService;
  let templateComposer: TemplateCompositionEngine;
  let qualityGate: QualityGateSystem;
  let errorRecovery: ErrorRecoverySystem;
  let documentation: DocumentationTraceabilitySystem;

  const fintechProjectBrief = {
    projectId: 'fintech-platform-001',
    projectName: 'Digital Banking and Investment Platform',
    description: 'A comprehensive fintech platform with digital banking, investment management, cryptocurrency trading, and financial analytics',
    domain: 'fintech',
    platforms: ['web', 'mobile'],
    features: [
      'digital-banking',
      'investment-portfolio',
      'cryptocurrency-trading',
      'payment-processing',
      'loan-management',
      'financial-analytics',
      'risk-assessment',
      'compliance-reporting',
      'fraud-detection',
      'kyc-verification',
      'multi-currency-support',
      'regulatory-reporting'
    ],
    requirements: {
      security: 'critical',
      compliance: ['SOX', 'PCI-DSS', 'GDPR', 'KYC', 'AML', 'MiFID-II'],
      auditability: 'required',
      dataRetention: 'regulated',
      encryption: 'end-to-end',
      availability: '99.99%',
      integrations: ['banking-apis', 'payment-gateways', 'regulatory-systems', 'market-data']
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
    it('should execute full pipeline with fintech compliance requirements', async () => {
      const projectId = fintechProjectBrief.projectId;
      
      // Initialize project state
      const initialState = await stateManager.initializeProject(
        projectId,
        fintechProjectBrief.projectName,
        fintechProjectBrief
      );
      
      expect(initialState.projectId).toBe(projectId);
      expect(initialState.currentStage).toBe(StageId.INTAKE);
      
      // Execute pipeline with enhanced compliance validation
      const stages = Object.values(StageId);
      let currentState = initialState;
      
      for (const stage of stages) {
        // Generate fintech-specific tasks
        const tasks = await taskGenerator.generateTasks(
          fintechProjectBrief,
          stage,
          currentState
        );
        
        expect(tasks.length).toBeGreaterThan(0);
        
        // Validate compliance-focused tasks
        if (stage === StageId.SECURITY) {
          const taskTitles = tasks.map(t => t.title.toLowerCase());
          expect(taskTitles.some(title => title.includes('encryption') || title.includes('security'))).toBe(true);
          expect(taskTitles.some(title => title.includes('audit') || title.includes('compliance'))).toBe(true);
          expect(taskTitles.some(title => title.includes('kyc') || title.includes('aml'))).toBe(true);
        }
        
        // Select templates with regulatory compliance
        const templates = await templateComposer.selectTemplates(
          fintechProjectBrief.domain,
          stage,
          fintechProjectBrief.features
        );
        
        expect(templates.coreTemplates.length).toBeGreaterThan(0);
        
        // Fintech should include security and compliance templates
        if (stage === StageId.ARCHITECTURE || stage === StageId.SECURITY) {
          const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
          const templateNames = allTemplates.map(t => t.name);
          expect(templateNames.some(name => name.includes('security') || name.includes('encryption'))).toBe(true);
          expect(templateNames.some(name => name.includes('compliance') || name.includes('audit'))).toBe(true);
        }
        
        // Enhanced quality gates for fintech
        const validation = await qualityGate.validateStagePrerequisites(
          stage,
          currentState,
          tasks
        );
        
        expect(validation.canProceed).toBe(true);
        
        // Additional compliance validation for critical stages
        if ([StageId.SECURITY, StageId.TESTING, StageId.DEPLOYMENT].includes(stage)) {
          const complianceValidation = await qualityGate.validateComplianceRequirements(
            fintechProjectBrief,
            fintechProjectBrief.requirements.compliance
          );
          expect(complianceValidation.compliant).toBe(true);
        }
        
        // Execute stage
        const stageResult = await pipelineController.executeStage(
          stage,
          currentState,
          { tasks, templates }
        );
        
        expect(stageResult.success).toBe(true);
        
        // Update state with audit trail
        currentState = await stateManager.updateStage(
          projectId,
          stage,
          stageResult.outputs
        );
        
        expect(currentState.completedStages).toContain(stage);
        
        // Document compliance decisions
        await documentation.addTaskReference(
          `compliance-${stage}`,
          `Compliance validation for ${stage}`,
          stage,
          [`compliance-req-${stage}`],
          [],
          projectId
        );
      }
      
      expect(currentState.completedStages.length).toBe(stages.length);
    });

    it('should handle financial regulatory requirements', async () => {
      const templates = await templateComposer.selectTemplates(
        'fintech',
        StageId.ARCHITECTURE,
        ['regulatory-reporting', 'compliance-reporting', 'audit-trail']
      );
      
      // Should include regulatory compliance templates
      const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
      const templateNames = allTemplates.map(t => t.name);
      
      expect(templateNames.some(name => name.includes('regulatory') || name.includes('compliance'))).toBe(true);
      expect(templateNames.some(name => name.includes('audit') || name.includes('trail'))).toBe(true);
      expect(templateNames.some(name => name.includes('sox') || name.includes('mifid'))).toBe(true);
    });

    it('should generate appropriate fintech security tasks', async () => {
      const tasks = await taskGenerator.generateTasks(
        fintechProjectBrief,
        StageId.SECURITY,
        await stateManager.getProjectState(fintechProjectBrief.projectId)
      );
      
      // Should generate fintech-specific security tasks
      const taskTitles = tasks.map(t => t.title.toLowerCase());
      expect(taskTitles.some(title => title.includes('encryption') || title.includes('crypto'))).toBe(true);
      expect(taskTitles.some(title => title.includes('kyc') || title.includes('verification'))).toBe(true);
      expect(taskTitles.some(title => title.includes('fraud') || title.includes('detection'))).toBe(true);
      expect(taskTitles.some(title => title.includes('audit') || title.includes('logging'))).toBe(true);
      
      // Tasks should include compliance validation
      const complianceTasks = tasks.filter(task => 
        task.description.toLowerCase().includes('compliance') ||
        task.description.toLowerCase().includes('regulatory') ||
        task.description.toLowerCase().includes('sox') ||
        task.description.toLowerCase().includes('pci')
      );
      expect(complianceTasks.length).toBeGreaterThan(0);
    });
  });

  describe('Fintech-Specific Validations', () => {
    it('should validate financial compliance requirements', async () => {
      const validation = await qualityGate.validateComplianceRequirements(
        fintechProjectBrief,
        ['SOX', 'PCI-DSS', 'KYC', 'AML', 'MiFID-II']
      );
      
      expect(validation.compliant).toBe(true);
      expect(validation.requirements.some(req => req.includes('audit trail'))).toBe(true);
      expect(validation.requirements.some(req => req.includes('data encryption'))).toBe(true);
      expect(validation.requirements.some(req => req.includes('identity verification'))).toBe(true);
      expect(validation.requirements.some(req => req.includes('transaction monitoring'))).toBe(true);
    });

    it('should validate financial data security patterns', async () => {
      const securityValidation = await qualityGate.validateSecurityRequirements(
        fintechProjectBrief,
        'fintech'
      );
      
      expect(securityValidation.valid).toBe(true);
      expect(securityValidation.patterns).toContain('end-to-end-encryption');
      expect(securityValidation.patterns).toContain('zero-trust-architecture');
      expect(securityValidation.patterns).toContain('multi-factor-authentication');
      expect(securityValidation.patterns).toContain('audit-logging');
    });

    it('should validate financial integration requirements', async () => {
      const integrationValidation = await qualityGate.validateIntegrationRequirements(
        fintechProjectBrief,
        fintechProjectBrief.requirements.integrations
      );
      
      expect(integrationValidation.valid).toBe(true);
      
      // Should validate banking API integrations
      const bankingIntegrations = integrationValidation.integrations.filter(
        i => i.category === 'banking' || i.category === 'financial'
      );
      expect(bankingIntegrations.length).toBeGreaterThan(0);
      
      // Should validate regulatory system integrations
      const regulatoryIntegrations = integrationValidation.integrations.filter(
        i => i.category === 'regulatory' || i.category === 'compliance'
      );
      expect(regulatoryIntegrations.length).toBeGreaterThan(0);
    });

    it('should validate audit trail requirements', async () => {
      const auditValidation = await qualityGate.validateAuditRequirements(
        fintechProjectBrief
      );
      
      expect(auditValidation.valid).toBe(true);
      expect(auditValidation.features).toContain('immutable-logs');
      expect(auditValidation.features).toContain('transaction-tracking');
      expect(auditValidation.features).toContain('user-activity-logging');
      expect(auditValidation.features).toContain('compliance-reporting');
    });
  });

  describe('Error Recovery Scenarios', () => {
    it('should recover from compliance validation failures', async () => {
      const error = {
        type: 'compliance-failure',
        stage: StageId.TESTING,
        component: 'kyc-verification',
        message: 'KYC verification process fails regulatory compliance check',
        context: fintechProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('audit') || step.includes('review') || step.includes('compliance')
      )).toBe(true);
      expect(recovery.alternativeApproaches.some(approach => 
        approach.includes('manual') || approach.includes('enhanced')
      )).toBe(true);
    });

    it('should recover from payment processing failures', async () => {
      const error = {
        type: 'payment-failure',
        stage: StageId.IMPLEMENTATION,
        component: 'payment-gateway',
        message: 'Payment processing fails PCI-DSS compliance validation',
        context: fintechProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('tokenization') || step.includes('encryption') || step.includes('vault')
      )).toBe(true);
    });

    it('should recover from fraud detection system failures', async () => {
      const error = {
        type: 'security-breach',
        stage: StageId.IMPLEMENTATION,
        component: 'fraud-detection',
        message: 'Fraud detection system producing false positives',
        context: fintechProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('tuning') || step.includes('threshold') || step.includes('model')
      )).toBe(true);
    });

    it('should recover from regulatory reporting failures', async () => {
      const error = {
        type: 'reporting-failure',
        stage: StageId.DEPLOYMENT,
        component: 'regulatory-reporting',
        message: 'Automated regulatory reports failing validation',
        context: fintechProjectBrief
      };
      
      const recovery = await errorRecovery.handleError(error);
      
      expect(recovery.canRecover).toBe(true);
      expect(recovery.recoverySteps.some(step => 
        step.includes('validation') || step.includes('format') || step.includes('manual')
      )).toBe(true);
    });
  });

  describe('Security and Compliance Integration', () => {
    it('should integrate security templates across all stages', async () => {
      const securityCriticalStages = [
        StageId.ARCHITECTURE, StageId.DESIGN, StageId.SECURITY, 
        StageId.IMPLEMENTATION, StageId.TESTING, StageId.DEPLOYMENT
      ];
      
      for (const stage of securityCriticalStages) {
        const templates = await templateComposer.selectTemplates(
          'fintech',
          stage,
          ['encryption', 'audit-trail', 'fraud-detection']
        );
        
        const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
        const hasSecurityTemplate = allTemplates.some(t => 
          t.name.includes('security') || 
          t.name.includes('encryption') || 
          t.name.includes('audit')
        );
        
        expect(hasSecurityTemplate).toBe(true);
      }
    });

    it('should integrate compliance templates across regulatory stages', async () => {
      const complianceStages = [StageId.ANALYSIS, StageId.ARCHITECTURE, StageId.SECURITY, StageId.TESTING];
      
      for (const stage of complianceStages) {
        const templates = await templateComposer.selectTemplates(
          'fintech',
          stage,
          ['compliance-reporting', 'kyc-verification', 'regulatory-reporting']
        );
        
        const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
        const hasComplianceTemplate = allTemplates.some(t => 
          t.name.includes('compliance') || 
          t.name.includes('regulatory') || 
          t.name.includes('kyc') ||
          t.name.includes('sox') ||
          t.name.includes('mifid')
        );
        
        expect(hasComplianceTemplate).toBe(true);
      }
    });

    it('should integrate audit templates for traceability', async () => {
      const auditStages = [StageId.ARCHITECTURE, StageId.IMPLEMENTATION, StageId.TESTING, StageId.DEPLOYMENT];
      
      for (const stage of auditStages) {
        const templates = await templateComposer.selectTemplates(
          'fintech',
          stage,
          ['audit-trail', 'transaction-logging', 'compliance-reporting']
        );
        
        const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
        const hasAuditTemplate = allTemplates.some(t => 
          t.name.includes('audit') || 
          t.name.includes('logging') || 
          t.name.includes('trail')
        );
        
        expect(hasAuditTemplate).toBe(true);
      }
    });
  });

  describe('State Management for Compliance', () => {
    it('should maintain compliance audit trail in state', async () => {
      const projectId = fintechProjectBrief.projectId;
      
      // Initialize with fintech-specific context
      await stateManager.initializeProject(projectId, fintechProjectBrief.projectName, fintechProjectBrief);
      
      // Simulate security stage with compliance outputs
      const securityOutputs = [
        {
          type: 'encryption-specification',
          content: 'End-to-end encryption specification for financial data',
          stage: StageId.SECURITY,
          complianceFramework: 'PCI-DSS'
        },
        {
          type: 'audit-trail-design',
          content: 'Immutable audit trail design for transaction logging',
          stage: StageId.SECURITY,
          complianceFramework: 'SOX'
        },
        {
          type: 'kyc-verification-process',
          content: 'KYC verification process with AML compliance',
          stage: StageId.SECURITY,
          complianceFramework: 'AML'
        }
      ];
      
      await stateManager.updateStage(projectId, StageId.SECURITY, securityOutputs);
      
      const state = await stateManager.getProjectState(projectId);
      expect(state.outputs.length).toBe(securityOutputs.length);
      
      // Verify compliance-specific outputs are preserved
      const outputTypes = state.outputs.map(o => o.type);
      expect(outputTypes).toContain('encryption-specification');
      expect(outputTypes).toContain('audit-trail-design');
      expect(outputTypes).toContain('kyc-verification-process');
    });

    it('should track regulatory decisions across stages', async () => {
      const projectId = fintechProjectBrief.projectId;
      
      await stateManager.initializeProject(projectId, fintechProjectBrief.projectName, fintechProjectBrief);
      
      // Execute stages with regulatory context
      const regulatoryStages = [StageId.ANALYSIS, StageId.ARCHITECTURE, StageId.SECURITY];
      
      for (const stage of regulatoryStages) {
        const tasks = await taskGenerator.generateTasks(
          fintechProjectBrief,
          stage,
          await stateManager.getProjectState(projectId)
        );
        
        // Add regulatory decision to each stage
        const regulatoryOutput = {
          type: 'regulatory-decision',
          content: `Regulatory compliance decision for ${stage}`,
          stage,
          regulations: fintechProjectBrief.requirements.compliance
        };
        
        await stateManager.updateStage(projectId, stage, [regulatoryOutput]);
      }
      
      // Verify regulatory context is maintained
      const finalState = await stateManager.getProjectState(projectId);
      const regulatoryOutputs = finalState.outputs.filter(o => o.type === 'regulatory-decision');
      
      expect(regulatoryOutputs.length).toBe(regulatoryStages.length);
      expect(regulatoryOutputs.every(o => o.regulations)).toBe(true);
    });
  });

  describe('Documentation and Traceability', () => {
    it('should maintain complete regulatory traceability', async () => {
      const projectId = fintechProjectBrief.projectId;
      
      // Track regulatory requirements
      const regulations = fintechProjectBrief.requirements.compliance;
      
      for (const regulation of regulations) {
        await documentation.trackRequirement(
          regulation, 
          `Compliance with ${regulation} regulation`, 
          StageId.ANALYSIS, 
          projectId
        );
      }
      
      // Add implementation tasks for each regulation
      for (const regulation of regulations) {
        await documentation.addTaskReference(
          `implement-${regulation}`,
          `Implement ${regulation} compliance measures`,
          StageId.IMPLEMENTATION,
          [regulation],
          [],
          projectId
        );
      }
      
      // Verify complete regulatory coverage
      const coverage = await documentation.generateCoverageReport(projectId);
      expect(coverage.totalRequirements).toBe(regulations.length);
      expect(coverage.coveredRequirements).toBe(regulations.length);
      expect(coverage.coveragePercentage).toBe(100);
      
      // Verify regulatory traceability matrix
      const matrix = await documentation.getTraceabilityMatrix(projectId);
      expect(matrix.length).toBe(regulations.length);
      
      for (const link of matrix) {
        expect(link.relationship).toBe('implements');
        expect(link.targetType).toBe('requirement');
        expect(regulations).toContain(link.targetId);
      }
    });

    it('should document security and compliance decisions', async () => {
      const projectId = fintechProjectBrief.projectId;
      
      // Document security architecture decisions
      const securityDecision = {
        id: 'security-arch-001',
        title: 'Zero Trust Security Architecture',
        stage: StageId.ARCHITECTURE,
        decision: 'Implement zero trust security model for fintech platform',
        rationale: 'Required for financial data protection and regulatory compliance',
        alternatives: ['Traditional perimeter security', 'Hybrid security model'],
        impact: ['Enhanced security posture', 'Compliance with financial regulations'],
        timestamp: new Date()
      };
      
      await documentation.documentDecision(
        securityDecision,
        'Financial services require highest security standards',
        ['Improved regulatory compliance', 'Enhanced customer trust'],
        projectId
      );
      
      // Verify decision documentation
      const projectState = await stateManager.getProjectState(projectId);
      const docs = await documentation.generateProjectDocumentation(projectState);
      
      expect(docs.decisions.length).toBeGreaterThan(0);
      expect(docs.decisions[0].decision.title).toContain('Security');
    });

    it('should generate compliance audit reports', async () => {
      const projectId = fintechProjectBrief.projectId;
      
      // Track compliance requirements and implementations
      await documentation.trackRequirement('pci-dss-compliance', 'PCI-DSS compliance for payment processing', StageId.ANALYSIS, projectId);
      await documentation.addTaskReference('implement-pci-dss', 'Implement PCI-DSS controls', StageId.IMPLEMENTATION, ['pci-dss-compliance'], [], projectId);
      
      // Generate project documentation
      const projectState = await stateManager.getProjectState(projectId);
      const docs = await documentation.generateProjectDocumentation(projectState, true);
      
      // Export compliance report
      const complianceReport = await documentation.exportToMarkdown(docs);
      
      expect(complianceReport).toContain('PCI-DSS');
      expect(complianceReport).toContain('compliance');
      expect(complianceReport).toContain('Traceability Matrix');
    });
  });

  describe('Performance and Security Optimization', () => {
    it('should optimize for financial transaction performance', async () => {
      const performanceContext = {
        ...fintechProjectBrief,
        performanceRequirements: {
          transactionThroughput: '10,000 TPS',
          latency: '<100ms',
          availability: '99.99%',
          dataConsistency: 'ACID compliant'
        }
      };
      
      const tasks = await taskGenerator.generateTasks(
        performanceContext,
        StageId.OPTIMIZATION,
        await stateManager.getProjectState(fintechProjectBrief.projectId)
      );
      
      // Should generate performance-focused tasks
      const taskDescriptions = tasks.map(t => t.description.toLowerCase());
      expect(taskDescriptions.some(desc => 
        desc.includes('performance') || desc.includes('throughput') || desc.includes('latency')
      )).toBe(true);
      
      // Should include financial transaction optimization
      expect(taskDescriptions.some(desc => 
        desc.includes('transaction') || desc.includes('acid') || desc.includes('consistency')
      )).toBe(true);
    });

    it('should handle complex fintech compliance requirements efficiently', async () => {
      const startTime = Date.now();
      
      const complexComplianceFeatures = [
        ...fintechProjectBrief.features,
        'sox-reporting', 'mifid-ii-compliance', 'basel-iii-compliance',
        'fatca-reporting', 'crs-reporting', 'aml-monitoring',
        'sanctions-screening', 'transaction-monitoring', 'suspicious-activity-reporting'
      ];
      
      const templates = await templateComposer.selectTemplates(
        'fintech',
        StageId.SECURITY,
        complexComplianceFeatures
      );
      
      const selectionTime = Date.now() - startTime;
      
      // Should handle complex compliance efficiently
      expect(selectionTime).toBeLessThan(3000); // 3 seconds
      expect(templates.coreTemplates.length).toBeGreaterThan(0);
      expect(templates.crossCuttingTemplates.length).toBeGreaterThan(0);
      
      // Should include regulatory templates
      const allTemplates = [...templates.coreTemplates, ...templates.crossCuttingTemplates];
      const regulatoryTemplates = allTemplates.filter(t => 
        t.name.includes('sox') || 
        t.name.includes('mifid') || 
        t.name.includes('basel') ||
        t.name.includes('aml')
      );
      expect(regulatoryTemplates.length).toBeGreaterThan(0);
    });
  });
});