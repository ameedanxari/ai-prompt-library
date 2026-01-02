import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface SelfMaintenanceCapability {
  hasAgentsGeneration: boolean;
  hasDocumentationUpdates: boolean;
  hasChangelogMaintenance: boolean;
  hasVersioning: boolean;
  hasGapIdentification: boolean;
}

export interface AgentsFileStructure {
  hasProjectOverview: boolean;
  hasEnvironmentSetup: boolean;
  hasArchitectureSection: boolean;
  hasDevelopmentWorkflow: boolean;
  hasAIAgentGuidelines: boolean;
  hasKnownIssues: boolean;
  hasUsefulCommands: boolean;
  hasContactResources: boolean;
}

export class SelfMaintenanceProcessor {
  private promptsPath: string;

  constructor(promptsPath: string = 'prompts/templates') {
    this.promptsPath = promptsPath;
  }

  validateSelfMaintenanceCapability(): SelfMaintenanceCapability {
    return {
      hasAgentsGeneration: this.hasAgentsGenerationPrompt(),
      hasDocumentationUpdates: this.hasDocumentationUpdatesPrompt(),
      hasChangelogMaintenance: this.hasChangelogMaintenancePrompt(),
      hasVersioning: this.hasVersioningCapability(),
      hasGapIdentification: this.hasGapIdentificationCapability()
    };
  }

  private hasAgentsGenerationPrompt(): boolean {
    const agentsPromptPath = join(this.promptsPath, 'agents-generation.md');
    if (!existsSync(agentsPromptPath)) return false;
    
    const content = readFileSync(agentsPromptPath, 'utf-8');
    
    // Check for required sections in AGENTS.md generation prompt
    const requiredSections = [
      'Project Overview',
      'Development Environment Setup',
      'Architecture and Patterns',
      'Development Workflow',
      'AI Agent Guidelines',
      'Known Issues and Limitations',
      'Useful Commands',
      'Contact and Resources'
    ];
    
    return requiredSections.every(section => 
      content.includes(section) || content.toLowerCase().includes(section.toLowerCase())
    );
  }

  private hasDocumentationUpdatesPrompt(): boolean {
    const docUpdatesPath = join(this.promptsPath, 'documentation-updates.md');
    if (!existsSync(docUpdatesPath)) return false;
    
    const content = readFileSync(docUpdatesPath, 'utf-8');
    
    // Check for comprehensive documentation update capabilities
    const updateCapabilities = [
      'README.md Updates',
      'API Documentation',
      'User Guides and Tutorials',
      'Technical Documentation',
      'Change Documentation'
    ];
    
    return updateCapabilities.every(capability => 
      content.includes(capability) || content.toLowerCase().includes(capability.toLowerCase())
    );
  }

  private hasChangelogMaintenancePrompt(): boolean {
    const changelogPath = join(this.promptsPath, 'changelog-maintenance.md');
    if (!existsSync(changelogPath)) return false;
    
    const content = readFileSync(changelogPath, 'utf-8');
    
    // Check for standard changelog categories
    const changelogCategories = [
      'Added',
      'Changed', 
      'Deprecated',
      'Removed',
      'Fixed',
      'Security'
    ];
    
    return changelogCategories.every(category => content.includes(category));
  }

  private hasVersioningCapability(): boolean {
    const changelogPath = join(this.promptsPath, 'changelog-maintenance.md');
    if (!existsSync(changelogPath)) return false;
    
    const content = readFileSync(changelogPath, 'utf-8');
    
    // Check for versioning and migration guidance
    return content.includes('semantic versioning') && 
           content.includes('migration') &&
           content.includes('version');
  }

  private hasGapIdentificationCapability(): boolean {
    const agentsPromptPath = join(this.promptsPath, 'agents-generation.md');
    const docUpdatesPath = join(this.promptsPath, 'documentation-updates.md');
    
    if (!existsSync(agentsPromptPath) || !existsSync(docUpdatesPath)) return false;
    
    const agentsContent = readFileSync(agentsPromptPath, 'utf-8');
    const docContent = readFileSync(docUpdatesPath, 'utf-8');
    
    // Check for gap identification and improvement suggestions
    return (agentsContent.includes('gaps') || agentsContent.includes('improvements')) &&
           (docContent.includes('enhancement') || docContent.includes('improvement'));
  }

  validateAgentsFileStructure(agentsFilePath: string): AgentsFileStructure {
    if (!existsSync(agentsFilePath)) {
      return {
        hasProjectOverview: false,
        hasEnvironmentSetup: false,
        hasArchitectureSection: false,
        hasDevelopmentWorkflow: false,
        hasAIAgentGuidelines: false,
        hasKnownIssues: false,
        hasUsefulCommands: false,
        hasContactResources: false
      };
    }

    const content = readFileSync(agentsFilePath, 'utf-8');
    
    return {
      hasProjectOverview: this.hasSection(content, 'Project Overview'),
      hasEnvironmentSetup: this.hasSection(content, 'Development Environment Setup'),
      hasArchitectureSection: this.hasSection(content, 'Architecture'),
      hasDevelopmentWorkflow: this.hasSection(content, 'Development Workflow'),
      hasAIAgentGuidelines: this.hasSection(content, 'AI Agent Guidelines'),
      hasKnownIssues: this.hasSection(content, 'Known Issues'),
      hasUsefulCommands: this.hasSection(content, 'Useful Commands'),
      hasContactResources: this.hasSection(content, 'Contact and Resources')
    };
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return sectionRegex.test(content);
  }

  // Validate requirements 10.1, 10.2, 10.3, 10.4, 10.5
  validateRequirements(): {
    requirement_10_1: boolean; // AGENTS.md generation
    requirement_10_2: boolean; // Documentation updates
    requirement_10_3: boolean; // Changelog maintenance
    requirement_10_4: boolean; // Gap identification
    requirement_10_5: boolean; // Versioning and migration
  } {
    const capability = this.validateSelfMaintenanceCapability();
    
    return {
      requirement_10_1: capability.hasAgentsGeneration,
      requirement_10_2: capability.hasDocumentationUpdates,
      requirement_10_3: capability.hasChangelogMaintenance,
      requirement_10_4: capability.hasGapIdentification,
      requirement_10_5: capability.hasVersioning
    };
  }
}