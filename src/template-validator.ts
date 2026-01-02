import { readFileSync } from 'fs';
import { join } from 'path';

export interface TemplateStructure {
  hasRequiredBrief: boolean;
  hasOptionalFields: boolean;
  servesAsReadme: boolean;
  hasProjectBriefSection: boolean;
  hasOptionalConfigSection: boolean;
  hasReferenceAssetsSection: boolean;
  hasDryRunOption: boolean;
  hasGettingStartedSection: boolean;
  hasSystemCapabilitiesSection: boolean;
}

export class TemplateValidator {
  private templateContent: string;

  constructor(templatePath: string) {
    this.templateContent = readFileSync(templatePath, 'utf-8');
  }

  validateStructure(): TemplateStructure {
    const content = this.templateContent;
    
    return {
      hasRequiredBrief: this.hasRequiredBriefField(content),
      hasOptionalFields: this.hasOptionalFields(content),
      servesAsReadme: this.servesAsReadme(content),
      hasProjectBriefSection: this.hasSection(content, 'Project Brief'),
      hasOptionalConfigSection: this.hasSection(content, 'Optional Configuration'),
      hasReferenceAssetsSection: this.hasSection(content, 'Reference Assets'),
      hasDryRunOption: this.hasSection(content, 'Dry-Run Option'),
      hasGettingStartedSection: this.hasSection(content, 'Getting Started'),
      hasSystemCapabilitiesSection: this.hasSection(content, 'System Capabilities')
    };
  }

  private hasRequiredBriefField(content: string): boolean {
    // Check for "Project Brief (Required)" section
    const briefSectionRegex = /##\s*Project Brief\s*\(Required\)/i;
    const hasRequiredMarker = briefSectionRegex.test(content);
    
    // Check that Brief is the only required field by ensuring other sections are optional
    const optionalSectionRegex = /##\s*Optional Configuration/i;
    const hasOptionalSections = optionalSectionRegex.test(content);
    
    return hasRequiredMarker && hasOptionalSections;
  }

  private hasOptionalFields(content: string): boolean {
    // Check for comprehensive optional fields mentioned in requirements
    const optionalFields = [
      'Target Platforms',
      'Technology Preferences', 
      'Deployment Environment',
      'Localization and Accessibility',
      'Design and Branding',
      'Advanced Configuration'
    ];
    
    return optionalFields.every(field => 
      content.includes(field) || content.toLowerCase().includes(field.toLowerCase())
    );
  }

  private servesAsReadme(content: string): boolean {
    // Check for README-like elements: title, description, instructions
    const hasTitle = /^#\s+AI Prompt Library/m.test(content);
    const hasDescription = content.includes('serves as both your input form and project README');
    const hasInstructions = content.includes('Getting Started') || content.includes('Fill out');
    
    return hasTitle && hasDescription && hasInstructions;
  }

  private hasSection(content: string, sectionName: string): boolean {
    // Properly escape special regex characters in section name
    const escapedName = sectionName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const sectionRegex = new RegExp(`##\\s*${escapedName}`, 'i');
    return sectionRegex.test(content);
  }

  // Validate that template meets all requirements from 1.1, 1.3, 1.5
  validateRequirements(): { 
    requirement_1_1: boolean; // Brief as only required field
    requirement_1_3: boolean; // Comprehensive optional fields for power users  
    requirement_1_5: boolean; // Serves dual purpose as README and input form
  } {
    const structure = this.validateStructure();
    
    return {
      requirement_1_1: structure.hasRequiredBrief,
      requirement_1_3: structure.hasOptionalFields,
      requirement_1_5: structure.servesAsReadme
    };
  }
}
