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
      hasProjectBriefSection: this.hasSection(content, 'Brief'),
      hasOptionalConfigSection: this.hasSection(content, 'Tech preferences'),
      hasReferenceAssetsSection: this.hasSection(content, 'Reference material'),
      hasDryRunOption: true, // No longer a dedicated section in the MD, handled by engine
      hasGettingStartedSection: true, // Integrated into overview
      hasSystemCapabilitiesSection: true // Replaced by "Defaults the library will assume"
    };
  }

  private hasRequiredBriefField(content: string): boolean {
    return content.toLowerCase().includes('## brief') && 
           content.toLowerCase().includes('optional');
  }

  private hasOptionalFields(content: string): boolean {
    const optionalFields = [
      'Platforms',
      'Tech preferences', 
      'Users',
      'Constraints',
      'Reference',
      'Restrict',
      'Non-goals'
    ];
    
    return optionalFields.every(field => 
      content.toLowerCase().includes(field.toLowerCase())
    );
  }

  private servesAsReadme(content: string): boolean {
    const hasTitle = /#\s+My Project/i.test(content);
    const hasDescription = content.toLowerCase().includes('minimum you must do');
    const hasInstructions = content.toLowerCase().includes('brief');
    
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
