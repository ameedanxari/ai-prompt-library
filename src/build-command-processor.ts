import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface BuildCommandCapability {
  hasCommandStorage: boolean;
  hasCommandHistory: boolean;
  hasContextFreeExecution: boolean;
  hasSuccessTracking: boolean;
  hasCommandValidation: boolean;
}

export interface CommandRegistryStructure {
  hasCurrentWorkingCommands: boolean;
  hasCommandHistory: boolean;
  hasPlatformSpecificCommands: boolean;
  hasEnvironmentRequirements: boolean;
  hasTroubleshootingGuide: boolean;
  hasValidationFramework: boolean;
  hasMaintenanceProtocols: boolean;
}

export class BuildCommandProcessor {
  private promptsPath: string;

  constructor(promptsPath: string = 'prompts/templates') {
    this.promptsPath = promptsPath;
  }

  validateBuildCommandCapability(): BuildCommandCapability {
    return {
      hasCommandStorage: this.hasCommandStorageCapability(),
      hasCommandHistory: this.hasCommandHistoryCapability(),
      hasContextFreeExecution: this.hasContextFreeExecutionCapability(),
      hasSuccessTracking: this.hasSuccessTrackingCapability(),
      hasCommandValidation: this.hasCommandValidationCapability()
    };
  }

  private hasCommandStorageCapability(): boolean {
    const buildCommandPath = join(this.promptsPath, 'build-command-preservation.md');
    if (!existsSync(buildCommandPath)) return false;
    
    const content = readFileSync(buildCommandPath, 'utf-8');
    
    // Check for command storage capabilities
    const storageFeatures = [
      'Build Command Registry',
      'Current Working Commands',
      'Build Commands',
      'Test Commands',
      'Development Commands',
      'Deployment Commands'
    ];
    
    return storageFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasCommandHistoryCapability(): boolean {
    const buildCommandPath = join(this.promptsPath, 'build-command-preservation.md');
    if (!existsSync(buildCommandPath)) return false;
    
    const content = readFileSync(buildCommandPath, 'utf-8');
    
    // Check for command history maintenance
    const historyFeatures = [
      'Command History Log',
      'Recent Successful Commands',
      'Command Evolution History',
      'Last successful',
      'timestamps'
    ];
    
    return historyFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasContextFreeExecutionCapability(): boolean {
    const buildCommandPath = join(this.promptsPath, 'build-command-preservation.md');
    if (!existsSync(buildCommandPath)) return false;
    
    const content = readFileSync(buildCommandPath, 'utf-8');
    
    // Check for context-free execution features
    const contextFreeFeatures = [
      'Environment Requirements',
      'Pre-Command Setup',
      'context-free',
      'Environment Variables',
      'System Dependencies'
    ];
    
    return contextFreeFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasSuccessTrackingCapability(): boolean {
    const buildCommandPath = join(this.promptsPath, 'build-command-preservation.md');
    if (!existsSync(buildCommandPath)) return false;
    
    const content = readFileSync(buildCommandPath, 'utf-8');
    
    // Check for success tracking and indicators
    const successFeatures = [
      'success indicators',
      'Last successful',
      'SUCCESS',
      'FAILED',
      'Command validation'
    ];
    
    return successFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  private hasCommandValidationCapability(): boolean {
    const buildCommandPath = join(this.promptsPath, 'build-command-preservation.md');
    if (!existsSync(buildCommandPath)) return false;
    
    const content = readFileSync(buildCommandPath, 'utf-8');
    
    // Check for command validation framework
    const validationFeatures = [
      'Command Validation Framework',
      'Command Success Verification',
      'Automated Command Testing',
      'validation script',
      'Command validation'
    ];
    
    return validationFeatures.every(feature => 
      content.includes(feature) || content.toLowerCase().includes(feature.toLowerCase())
    );
  }

  validateCommandRegistryStructure(registryPath: string): CommandRegistryStructure {
    if (!existsSync(registryPath)) {
      return {
        hasCurrentWorkingCommands: false,
        hasCommandHistory: false,
        hasPlatformSpecificCommands: false,
        hasEnvironmentRequirements: false,
        hasTroubleshootingGuide: false,
        hasValidationFramework: false,
        hasMaintenanceProtocols: false
      };
    }

    const content = readFileSync(registryPath, 'utf-8');
    
    return {
      hasCurrentWorkingCommands: this.hasSection(content, 'Current Working Commands'),
      hasCommandHistory: this.hasSection(content, 'Command History Log'),
      hasPlatformSpecificCommands: this.hasSection(content, 'Platform-Specific Commands'),
      hasEnvironmentRequirements: this.hasSection(content, 'Environment Requirements'),
      hasTroubleshootingGuide: this.hasSection(content, 'Command Troubleshooting'),
      hasValidationFramework: this.hasSection(content, 'Command Validation'),
      hasMaintenanceProtocols: this.hasSection(content, 'Command Registry Maintenance')
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return sectionRegex.test(content);
  }

  // Validate requirements 16.1, 16.2, 16.3, 16.4, 16.5
  validateRequirements(): {
    requirement_16_1: boolean; // Store successful build commands
    requirement_16_2: boolean; // Store successful test commands
    requirement_16_3: boolean; // Maintain commands history log
    requirement_16_4: boolean; // Reference stored commands for context-free execution
    requirement_16_5: boolean; // Update stored commands only on successful executions
  } {
    const capability = this.validateBuildCommandCapability();
    
    return {
      requirement_16_1: capability.hasCommandStorage && capability.hasSuccessTracking,
      requirement_16_2: capability.hasCommandStorage && capability.hasSuccessTracking,
      requirement_16_3: capability.hasCommandHistory,
      requirement_16_4: capability.hasContextFreeExecution,
      requirement_16_5: capability.hasSuccessTracking && capability.hasCommandValidation
    };
  }
}