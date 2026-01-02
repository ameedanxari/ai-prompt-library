/**
 * Design System Processor
 * 
 * Processes and validates design system templates and generated design specifications
 * to ensure comprehensive design system consistency, white-label support, and responsive design.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export interface DesignSystemStructure {
  hasComprehensiveColorSchemes: boolean;
  hasTypographySystem: boolean;
  hasComponentLibrary: boolean;
  hasWhiteLabelComponents: boolean;
  hasDarkLightThemes: boolean;
  hasDesignTokens: boolean;
  hasResponsiveSpecifications: boolean;
  hasConsistentPatterns: boolean;
  hasAccessibilityCompliance: boolean;
  hasThemeCustomization: boolean;
  hasSpacingSystem: boolean;
  hasBorderRadiusSystem: boolean;
  hasShadowSystem: boolean;
  hasBreakpointSystem: boolean;
  hasFluidTypography: boolean;
}

export interface DesignSystemRequirements {
  requirement_13_1: boolean; // Comprehensive design system with color schemes, typography, and component libraries
  requirement_13_2: boolean; // White-label ready UI components that can be easily rebranded
  requirement_13_3: boolean; // Support both dark and light mode themes by default
  requirement_13_4: boolean; // CSS custom properties or design tokens for easy theme customization
  requirement_13_5: boolean; // Responsive design specifications for all screen sizes and devices
  requirement_13_6: boolean; // Consistent design patterns across all platforms
}

export interface DesignSystemContent {
  colorSystemSection: string;
  typographySection: string;
  componentLibrarySection: string;
  whiteLabelSection: string;
  themeSystemSection: string;
  responsiveDesignSection: string;
  designTokensSection: string;
  accessibilitySection: string;
  customizationSection: string;
  documentationSection: string;
}

export class DesignSystemProcessor {
  private templatePaths: string[];

  constructor() {
    this.templatePaths = [
      'prompts/templates/design-system-generation.md'
    ];
  }

  /**
   * Validates the structure of design system templates
   */
  validateDesignSystemStructure(): DesignSystemStructure {
    const structure: DesignSystemStructure = {
      hasComprehensiveColorSchemes: false,
      hasTypographySystem: false,
      hasComponentLibrary: false,
      hasWhiteLabelComponents: false,
      hasDarkLightThemes: false,
      hasDesignTokens: false,
      hasResponsiveSpecifications: false,
      hasConsistentPatterns: false,
      hasAccessibilityCompliance: false,
      hasThemeCustomization: false,
      hasSpacingSystem: false,
      hasBorderRadiusSystem: false,
      hasShadowSystem: false,
      hasBreakpointSystem: false,
      hasFluidTypography: false
    };

    // Check all template files exist and have required content
    for (const templatePath of this.templatePaths) {
      if (!existsSync(templatePath)) {
        continue;
      }

      const content = readFileSync(templatePath, 'utf-8').toLowerCase();
      
      // Check for comprehensive color schemes
      if (content.includes('color system') && content.includes('primary') && content.includes('secondary') && content.includes('semantic')) {
        structure.hasComprehensiveColorSchemes = true;
      }
      
      // Check for typography system
      if (content.includes('typography system') && content.includes('font-family') && content.includes('font-size') && content.includes('line-height')) {
        structure.hasTypographySystem = true;
      }
      
      // Check for component library
      if (content.includes('component library') && content.includes('button') && content.includes('input') && content.includes('card')) {
        structure.hasComponentLibrary = true;
      }
      
      // Check for white-label components
      if (content.includes('white-label') && content.includes('customizable') && content.includes('rebrand')) {
        structure.hasWhiteLabelComponents = true;
      }
      
      // Check for dark and light themes
      if (content.includes('dark') && content.includes('light') && content.includes('theme') && content.includes('data-theme')) {
        structure.hasDarkLightThemes = true;
      }
      
      // Check for design tokens
      if (content.includes('design token') && content.includes('css custom properties') && content.includes(':root')) {
        structure.hasDesignTokens = true;
      }
      
      // Check for responsive specifications
      if (content.includes('responsive') && content.includes('breakpoint') && content.includes('mobile-first') && content.includes('@media')) {
        structure.hasResponsiveSpecifications = true;
      }
      
      // Check for consistent patterns
      if (content.includes('consistent') && content.includes('pattern') && content.includes('platform')) {
        structure.hasConsistentPatterns = true;
      }
      
      // Check for accessibility compliance
      if (content.includes('accessibility') && content.includes('wcag') && content.includes('focus') && content.includes('contrast')) {
        structure.hasAccessibilityCompliance = true;
      }
      
      // Check for theme customization
      if (content.includes('theme') && content.includes('customization') && content.includes('themebuilder') && content.includes('themeprovider')) {
        structure.hasThemeCustomization = true;
      }
      
      // Check for spacing system
      if (content.includes('spacing system') && content.includes('--space-') && content.includes('rem')) {
        structure.hasSpacingSystem = true;
      }
      
      // Check for border radius system
      if (content.includes('border radius') && content.includes('--radius-') && content.includes('rounded')) {
        structure.hasBorderRadiusSystem = true;
      }
      
      // Check for shadow system
      if (content.includes('shadow system') && content.includes('--shadow-') && content.includes('box-shadow')) {
        structure.hasShadowSystem = true;
      }
      
      // Check for breakpoint system
      if (content.includes('breakpoint') && content.includes('--breakpoint-') && content.includes('min-width')) {
        structure.hasBreakpointSystem = true;
      }
      
      // Check for fluid typography
      if (content.includes('fluid typography') && content.includes('clamp') && content.includes('vw')) {
        structure.hasFluidTypography = true;
      }
    }

    return structure;
  }

  /**
   * Validates requirements compliance for design system
   */
  validateDesignSystemRequirements(): DesignSystemRequirements {
    const structure = this.validateDesignSystemStructure();
    
    return {
      requirement_13_1: structure.hasComprehensiveColorSchemes && 
                        structure.hasTypographySystem && 
                        structure.hasComponentLibrary,
      requirement_13_2: structure.hasWhiteLabelComponents && 
                        structure.hasThemeCustomization,
      requirement_13_3: structure.hasDarkLightThemes,
      requirement_13_4: structure.hasDesignTokens && 
                        structure.hasThemeCustomization,
      requirement_13_5: structure.hasResponsiveSpecifications && 
                        structure.hasBreakpointSystem && 
                        structure.hasFluidTypography,
      requirement_13_6: structure.hasConsistentPatterns
    };
  }

  /**
   * Extracts and validates design system content sections
   */
  extractDesignSystemContent(): DesignSystemContent {
    const content: DesignSystemContent = {
      colorSystemSection: '',
      typographySection: '',
      componentLibrarySection: '',
      whiteLabelSection: '',
      themeSystemSection: '',
      responsiveDesignSection: '',
      designTokensSection: '',
      accessibilitySection: '',
      customizationSection: '',
      documentationSection: ''
    };

    for (const templatePath of this.templatePaths) {
      if (!existsSync(templatePath)) {
        continue;
      }

      const fileContent = readFileSync(templatePath, 'utf-8');
      
      // Extract sections based on headers and content
      const sections = this.extractSections(fileContent);
      
      // Map sections to content structure
      if (sections['color system'] || sections['design token foundation']) {
        content.colorSystemSection = sections['color system'] || sections['design token foundation'] || '';
      }
      
      if (sections['typography system'] || sections['typography']) {
        content.typographySection = sections['typography system'] || sections['typography'] || '';
      }
      
      if (sections['component library'] || sections['component']) {
        content.componentLibrarySection = sections['component library'] || sections['component'] || '';
      }
      
      if (sections['white-label'] || sections['white-label component']) {
        content.whiteLabelSection = sections['white-label'] || sections['white-label component'] || '';
      }
      
      if (sections['theme'] || sections['theme system']) {
        content.themeSystemSection = sections['theme'] || sections['theme system'] || '';
      }
      
      if (sections['responsive'] || sections['responsive design']) {
        content.responsiveDesignSection = sections['responsive'] || sections['responsive design'] || '';
      }
      
      if (sections['design token'] || sections['token']) {
        content.designTokensSection = sections['design token'] || sections['token'] || '';
      }
      
      if (sections['accessibility'] || sections['accessibility integration']) {
        content.accessibilitySection = sections['accessibility'] || sections['accessibility integration'] || '';
      }
      
      if (sections['customization'] || sections['theme customization']) {
        content.customizationSection = sections['customization'] || sections['theme customization'] || '';
      }
      
      if (sections['usage instructions'] || sections['documentation']) {
        content.documentationSection = sections['usage instructions'] || sections['documentation'] || '';
      }
    }

    return content;
  }

  /**
   * Validates that design system has comprehensive coverage
   */
  validateComprehensiveDesignSystemCoverage(): boolean {
    const structure = this.validateDesignSystemStructure();
    const requirements = this.validateDesignSystemRequirements();
    
    // All structure elements must be present
    const structureComplete = Object.values(structure).every(value => value === true);
    
    // All requirements must be satisfied
    const requirementsComplete = Object.values(requirements).every(value => value === true);
    
    return structureComplete && requirementsComplete;
  }

  /**
   * Validates design system quality and completeness
   */
  validateDesignSystemQuality(): {
    isComplete: boolean;
    hasAllRequiredSections: boolean;
    hasWhiteLabelSupport: boolean;
    hasResponsiveDesign: boolean;
    hasAccessibilityCompliance: boolean;
    hasThemeCustomization: boolean;
    score: number;
  } {
    const structure = this.validateDesignSystemStructure();
    const content = this.extractDesignSystemContent();
    
    const hasAllRequiredSections = structure.hasComprehensiveColorSchemes &&
                                  structure.hasTypographySystem &&
                                  structure.hasComponentLibrary &&
                                  structure.hasDesignTokens;
    
    const hasWhiteLabelSupport = structure.hasWhiteLabelComponents &&
                                structure.hasThemeCustomization &&
                                content.whiteLabelSection.length > 0;
    
    const hasResponsiveDesign = structure.hasResponsiveSpecifications &&
                               structure.hasBreakpointSystem &&
                               structure.hasFluidTypography;
    
    const hasAccessibilityCompliance = structure.hasAccessibilityCompliance &&
                                      content.accessibilitySection.length > 0;
    
    const hasThemeCustomization = structure.hasThemeCustomization &&
                                 structure.hasDarkLightThemes &&
                                 content.customizationSection.length > 0;
    
    const isComplete = hasAllRequiredSections && hasWhiteLabelSupport && 
                      hasResponsiveDesign && hasAccessibilityCompliance;
    
    // Calculate quality score (0-100)
    let score = 0;
    if (hasAllRequiredSections) score += 30;
    if (hasWhiteLabelSupport) score += 25;
    if (hasResponsiveDesign) score += 20;
    if (hasAccessibilityCompliance) score += 15;
    if (hasThemeCustomization) score += 10;
    
    return {
      isComplete,
      hasAllRequiredSections,
      hasWhiteLabelSupport,
      hasResponsiveDesign,
      hasAccessibilityCompliance,
      hasThemeCustomization,
      score
    };
  }

  /**
   * Extract sections from markdown content
   */
  private extractSections(content: string): Record<string, string> {
    const sections: Record<string, string> = {};
    const lines = content.split('\n');
    let currentSection = '';
    let currentContent: string[] = [];
    
    for (const line of lines) {
      if (line.startsWith('#')) {
        // Save previous section
        if (currentSection) {
          sections[currentSection.toLowerCase()] = currentContent.join('\n');
        }
        
        // Start new section
        currentSection = line.replace(/^#+\s*/, '').trim();
        currentContent = [];
      } else {
        currentContent.push(line);
      }
    }
    
    // Save last section
    if (currentSection) {
      sections[currentSection.toLowerCase()] = currentContent.join('\n');
    }
    
    return sections;
  }

  /**
   * Get all template file paths for testing
   */
  getTemplatePaths(): string[] {
    return this.templatePaths;
  }

  /**
   * Check if all required template files exist
   */
  allTemplatesExist(): boolean {
    return this.getTemplatePaths().every(path => existsSync(path));
  }
}