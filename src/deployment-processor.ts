import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DeploymentCapability {
  hasDeploymentScripts: boolean;
  hasAppStoreAssets: boolean;
  hasMonitoringConfiguration: boolean;
  hasInfrastructureAsCode: boolean;
  hasCICDPipeline: boolean;
}

export interface DeploymentArtifactStructure {
  hasInfrastructureConfig: boolean;
  hasPipelineConfig: boolean;
  hasSecurityConfig: boolean;
  hasMonitoringSetup: boolean;
  hasRollbackProcedures: boolean;
}

export class DeploymentProcessor {
  private promptsPath: string;
  private stagesPath: string;

  constructor(promptsPath: string = 'prompts/templates', stagesPath: string = 'prompts/stages') {
    this.promptsPath = promptsPath;
    this.stagesPath = stagesPath;
  }

  validateDeploymentCapability(): DeploymentCapability {
    return {
      hasDeploymentScripts: this.hasDeploymentScriptsPrompt(),
      hasAppStoreAssets: this.hasAppStoreAssetsPrompt(),
      hasMonitoringConfiguration: this.hasMonitoringConfigurationPrompt(),
      hasInfrastructureAsCode: this.hasInfrastructureAsCodePrompt(),
      hasCICDPipeline: this.hasCICDPipelinePrompt()
    };
  }

  private hasDeploymentScriptsPrompt(): boolean {
    const deploymentPromptPath = join(this.promptsPath, 'deployment-artifacts-generation.md');
    if (!existsSync(deploymentPromptPath)) return false;
    
    const content = readFileSync(deploymentPromptPath, 'utf-8');
    
    // Check for deployment script generation capabilities
    const scriptTypes = [
      'Deployment Script Generation',
      'Infrastructure as Code',
      'CI/CD Pipeline Configuration',
      'Container Deployment Configuration',
      'Rollback Procedures'
    ];
    
    return scriptTypes.every(type => 
      content.includes(type) || content.toLowerCase().includes(type.toLowerCase())
    );
  }

  private hasAppStoreAssetsPrompt(): boolean {
    const deploymentPromptPath = join(this.promptsPath, 'deployment-artifacts-generation.md');
    if (!existsSync(deploymentPromptPath)) return false;
    
    const content = readFileSync(deploymentPromptPath, 'utf-8');
    
    // Check for app store asset creation capabilities
    const assetTypes = [
      'App Store Asset Creation',
      'iOS App Store Assets',
      'Google Play Store Assets',
      'Multi-Language Asset Generation',
      'Screenshot Specifications'
    ];
    
    return assetTypes.every(type => 
      content.includes(type) || content.toLowerCase().includes(type.toLowerCase())
    );
  }

  private hasMonitoringConfigurationPrompt(): boolean {
    const deploymentPromptPath = join(this.promptsPath, 'deployment-artifacts-generation.md');
    if (!existsSync(deploymentPromptPath)) return false;
    
    const content = readFileSync(deploymentPromptPath, 'utf-8');
    
    // Check for monitoring configuration capabilities
    const monitoringTypes = [
      'Monitoring Configuration',
      'Application Performance Monitoring',
      'Infrastructure Monitoring',
      'Log Management',
      'Alerting Configuration'
    ];
    
    return monitoringTypes.every(type => 
      content.includes(type) || content.toLowerCase().includes(type.toLowerCase())
    );
  }

  private hasInfrastructureAsCodePrompt(): boolean {
    const deploymentStagesPath = join(this.stagesPath, 'stage-07-deployment');
    if (!existsSync(deploymentStagesPath)) return false;
    
    const platformAgnosticPath = join(deploymentStagesPath, 'platform-agnostic.md');
    if (!existsSync(platformAgnosticPath)) return false;
    
    const content = readFileSync(platformAgnosticPath, 'utf-8');
    
    // Check for infrastructure as code capabilities
    const iacFeatures = [
      'Infrastructure as Code',
      'Terraform',
      'CloudFormation',
      'Environment Configuration',
      'Security Configuration'
    ];
    
    return iacFeatures.some(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasCICDPipelinePrompt(): boolean {
    const deploymentStagesPath = join(this.stagesPath, 'stage-07-deployment');
    if (!existsSync(deploymentStagesPath)) return false;
    
    const platformAgnosticPath = join(deploymentStagesPath, 'platform-agnostic.md');
    if (!existsSync(platformAgnosticPath)) return false;
    
    const content = readFileSync(platformAgnosticPath, 'utf-8');
    
    // Check for CI/CD pipeline capabilities
    const pipelineFeatures = [
      'CI/CD Pipeline',
      'GitHub Actions',
      'Automated Testing',
      'Deployment Automation',
      'Build Artifacts'
    ];
    
    return pipelineFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  validateDeploymentArtifactStructure(): DeploymentArtifactStructure {
    const deploymentStagesPath = join(this.stagesPath, 'stage-07-deployment');
    if (!existsSync(deploymentStagesPath)) {
      return {
        hasInfrastructureConfig: false,
        hasPipelineConfig: false,
        hasSecurityConfig: false,
        hasMonitoringSetup: false,
        hasRollbackProcedures: false
      };
    }

    const platformAgnosticPath = join(deploymentStagesPath, 'platform-agnostic.md');
    if (!existsSync(platformAgnosticPath)) {
      return {
        hasInfrastructureConfig: false,
        hasPipelineConfig: false,
        hasSecurityConfig: false,
        hasMonitoringSetup: false,
        hasRollbackProcedures: false
      };
    }

    const content = readFileSync(platformAgnosticPath, 'utf-8');
    
    return {
      hasInfrastructureConfig: this.hasSection(content, 'Infrastructure as Code') || content.includes('Terraform'),
      hasPipelineConfig: this.hasSection(content, 'CI/CD Pipeline') || content.includes('GitHub Actions'),
      hasSecurityConfig: this.hasSection(content, 'Security') && content.includes('Configuration'),
      hasMonitoringSetup: this.hasSection(content, 'Monitoring') && content.includes('Observability'),
      hasRollbackProcedures: content.includes('rollback') || content.includes('Rollback')
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return sectionRegex.test(content) || content.includes(sectionName);
  }

  // Validate requirements 12.1, 12.2, 12.3, 12.4, 12.5
  validateRequirements(): {
    requirement_12_1: boolean; // Deployment scripts and configuration files
    requirement_12_2: boolean; // App store assets including screenshots
    requirement_12_3: boolean; // Release notes and user documentation
    requirement_12_4: boolean; // Setup scripts for development environment
    requirement_12_5: boolean; // Monitoring and alerting configurations
  } {
    const capability = this.validateDeploymentCapability();
    const artifactStructure = this.validateDeploymentArtifactStructure();
    
    return {
      requirement_12_1: capability.hasDeploymentScripts && capability.hasInfrastructureAsCode,
      requirement_12_2: capability.hasAppStoreAssets,
      requirement_12_3: this.hasReleaseDocumentation(),
      requirement_12_4: capability.hasDeploymentScripts && artifactStructure.hasPipelineConfig,
      requirement_12_5: capability.hasMonitoringConfiguration && artifactStructure.hasMonitoringSetup
    };
  }

  private hasReleaseDocumentation(): boolean {
    // Check if deployment stages include release documentation
    const deploymentStagesPath = join(this.stagesPath, 'stage-07-deployment');
    if (!existsSync(deploymentStagesPath)) return false;
    
    const platformAgnosticPath = join(deploymentStagesPath, 'platform-agnostic.md');
    if (!existsSync(platformAgnosticPath)) return false;
    
    const content = readFileSync(platformAgnosticPath, 'utf-8');
    
    return content.includes('release notes') || 
           content.includes('user documentation') || 
           content.includes('Release Notes') ||
           content.includes('User Documentation');
  }
}