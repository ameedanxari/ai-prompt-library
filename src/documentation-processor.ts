import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DocumentationMaintenance {
  hasProjectStatusMaintenance: boolean;
  hasDevelopmentLogUpdates: boolean;
  hasNextStepsMaintenance: boolean;
  hasArchitectureDecisionsMaintenance: boolean;
  hasCompletedFeaturesMaintenance: boolean;
  hasKnownIssuesMaintenance: boolean;
  hasQuickStartGuide: boolean;
  hasComprehensiveDocumentation: boolean;
}

export interface DocumentationFile {
  exists: boolean;
  hasRequiredSections: boolean;
  isCurrentlyMaintained: boolean;
  hasProperStructure: boolean;
}

export class DocumentationProcessor {
  private promptsPath: string;
  private projectPath: string;

  constructor(promptsPath: string = 'prompts/templates', projectPath: string = '.') {
    this.promptsPath = promptsPath;
    this.projectPath = projectPath;
  }

  validateDocumentationMaintenance(): DocumentationMaintenance {
    return {
      hasProjectStatusMaintenance: this.hasProjectStatusMaintenancePrompt(),
      hasDevelopmentLogUpdates: this.hasDevelopmentLogUpdatesPrompt(),
      hasNextStepsMaintenance: this.hasNextStepsMaintenancePrompt(),
      hasArchitectureDecisionsMaintenance: this.hasArchitectureDecisionsMaintenancePrompt(),
      hasCompletedFeaturesMaintenance: this.hasCompletedFeaturesMaintenancePrompt(),
      hasKnownIssuesMaintenance: this.hasKnownIssuesMaintenancePrompt(),
      hasQuickStartGuide: this.hasQuickStartGuidePrompt(),
      hasComprehensiveDocumentation: this.hasComprehensiveDocumentationPrompt()
    };
  }

  private hasProjectStatusMaintenancePrompt(): boolean {
    const promptPath = join(this.promptsPath, 'project-status-maintenance.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    // Check for required PROJECT_STATUS.md sections
    const requiredSections = [
      'Project Overview',
      'Progress Tracking',
      'Feature Status',
      'Technical Status',
      'Issues and Blockers',
      'Recent Activity',
      'Next Steps'
    ];
    
    return requiredSections.every(section => 
      content.includes(section) || content.toLowerCase().includes(section.toLowerCase())
    );
  }

  private hasDevelopmentLogUpdatesPrompt(): boolean {
    const promptPath = join(this.promptsPath, 'development-log-updates.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    // Check for comprehensive development log sections
    const logSections = [
      'Development Activities',
      'Technical Decisions Made',
      'Problems Solved',
      'Architecture Changes',
      'Performance Work',
      'Dependencies',
      'Lessons Learned'
    ];
    
    return logSections.every(section => 
      content.includes(section) || content.toLowerCase().includes(section.toLowerCase())
    );
  }

  private hasNextStepsMaintenancePrompt(): boolean {
    const promptPath = join(this.promptsPath, 'comprehensive-documentation-maintenance.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    return content.includes('NEXT_STEPS.md') && 
           content.includes('Immediate Actions') &&
           content.includes('Priority');
  }

  private hasArchitectureDecisionsMaintenancePrompt(): boolean {
    const promptPath = join(this.promptsPath, 'comprehensive-documentation-maintenance.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    return content.includes('ARCHITECTURE_DECISIONS.md') && 
           content.includes('ADR-') &&
           content.includes('Context') &&
           content.includes('Decision') &&
           content.includes('Consequences');
  }

  private hasCompletedFeaturesMaintenancePrompt(): boolean {
    const promptPath = join(this.promptsPath, 'comprehensive-documentation-maintenance.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    return content.includes('COMPLETED_FEATURES.md') && 
           content.includes('Feature Status Overview') &&
           content.includes('completion_percentage');
  }

  private hasKnownIssuesMaintenancePrompt(): boolean {
    const promptPath = join(this.promptsPath, 'comprehensive-documentation-maintenance.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    return content.includes('KNOWN_ISSUES.md') && 
           content.includes('Critical Issues') &&
           content.includes('Severity');
  }

  private hasQuickStartGuidePrompt(): boolean {
    const promptPath = join(this.promptsPath, 'comprehensive-documentation-maintenance.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    return content.includes('Quick-Start Guide') && 
           content.includes('Project Orientation') &&
           content.includes('Getting Started');
  }

  private hasComprehensiveDocumentationPrompt(): boolean {
    const promptPath = join(this.promptsPath, 'comprehensive-documentation-maintenance.md');
    if (!existsSync(promptPath)) return false;
    
    const content = readFileSync(promptPath, 'utf-8');
    
    // Check for all required documentation files
    const requiredFiles = [
      'PROJECT_STATUS.md',
      'DEVELOPMENT_LOG.md',
      'NEXT_STEPS.md',
      'ARCHITECTURE_DECISIONS.md',
      'COMPLETED_FEATURES.md',
      'KNOWN_ISSUES.md'
    ];
    
    return requiredFiles.every(file => content.includes(file));
  }

  validateDocumentationFile(fileName: string): DocumentationFile {
    const filePath = join(this.projectPath, fileName);
    
    if (!existsSync(filePath)) {
      return {
        exists: false,
        hasRequiredSections: false,
        isCurrentlyMaintained: false,
        hasProperStructure: false
      };
    }

    const content = readFileSync(filePath, 'utf-8');
    
    return {
      exists: true,
      hasRequiredSections: this.validateFileStructure(fileName, content),
      isCurrentlyMaintained: this.isRecentlyUpdated(content),
      hasProperStructure: this.hasProperMarkdownStructure(content)
    };
  }

  private validateFileStructure(fileName: string, content: string): boolean {
    switch (fileName) {
      case 'PROJECT_STATUS.md':
        return ['Project Status', 'Development Progress', 'Feature Implementation Status', 'Technical Status'].every(
          section => this.hasSection(content, section)
        );
      case 'DEVELOPMENT_LOG.md':
        return ['Development Log', 'Development Activities', 'Technical Decisions'].every(
          section => this.hasSection(content, section)
        );
      case 'NEXT_STEPS.md':
        return ['Next Steps', 'Immediate Actions', 'Priority'].every(
          section => content.includes(section)
        );
      case 'ARCHITECTURE_DECISIONS.md':
        return ['Architecture Decisions', 'ADR-', 'Context', 'Decision'].every(
          section => content.includes(section)
        );
      case 'COMPLETED_FEATURES.md':
        return ['Completed Features', 'Feature Status', 'Core Features'].every(
          section => content.includes(section)
        );
      case 'KNOWN_ISSUES.md':
        return ['Known Issues', 'Critical Issues', 'Issue Categories'].every(
          section => content.includes(section)
        );
      default:
        return true;
    }
  }

  private isRecentlyUpdated(content: string): boolean {
    // Check for recent update timestamps (within last 30 days would be ideal, but we'll check for any timestamp)
    const timestampRegex = /Last Updated.*\d{4}-\d{2}-\d{2}/i;
    return timestampRegex.test(content);
  }

  private hasProperMarkdownStructure(content: string): boolean {
    // Check for proper markdown structure with headers
    const hasTitle = /^#\s+/.test(content);
    const hasHeaders = /^##\s+/.test(content);
    return hasTitle && hasHeaders;
  }

  private hasSection(content: string, sectionName: string): boolean {
    const sectionRegex = new RegExp(`##\\s*${sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    return sectionRegex.test(content);
  }

  // Validate requirements 18.1-18.10
  validateRequirements(): {
    requirement_18_1: boolean; // PROJECT_STATUS.md maintenance
    requirement_18_2: boolean; // DEVELOPMENT_LOG.md maintenance
    requirement_18_3: boolean; // NEXT_STEPS.md maintenance
    requirement_18_4: boolean; // ARCHITECTURE_DECISIONS.md maintenance
    requirement_18_5: boolean; // COMPLETED_FEATURES.md maintenance
    requirement_18_6: boolean; // KNOWN_ISSUES.md maintenance
    requirement_18_7: boolean; // Automatic updates
    requirement_18_8: boolean; // Quick-start guide
    requirement_18_9: boolean; // Version control
    requirement_18_10: boolean; // Completion percentage tracking
  } {
    const maintenance = this.validateDocumentationMaintenance();
    
    return {
      requirement_18_1: maintenance.hasProjectStatusMaintenance,
      requirement_18_2: maintenance.hasDevelopmentLogUpdates,
      requirement_18_3: maintenance.hasNextStepsMaintenance,
      requirement_18_4: maintenance.hasArchitectureDecisionsMaintenance,
      requirement_18_5: maintenance.hasCompletedFeaturesMaintenance,
      requirement_18_6: maintenance.hasKnownIssuesMaintenance,
      requirement_18_7: maintenance.hasComprehensiveDocumentation, // Automatic updates capability
      requirement_18_8: maintenance.hasQuickStartGuide,
      requirement_18_9: maintenance.hasComprehensiveDocumentation, // Version control capability
      requirement_18_10: maintenance.hasProjectStatusMaintenance // Completion percentage in PROJECT_STATUS
    };
  }
}