import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TECHNOLOGY_STACKS_DIR = join(__dirname, '../../prompts/modules/technology-stacks');

const IOS_PRIORITY_TEMPLATES = [
  'ios-ui-ux-patterns.md',
  'ios-testing-comprehensive.md',
  'ios-deployment-distribution.md',
  'ios-performance-optimization.md'
];

const REQUIRED_SECTIONS = [
  'Purpose',
  'Context',
  'Examples',
  'Instructions',
  'Implementation Patterns',
  'Expected Output',
  'Integration Points',
  'Security Considerations',
  'Performance Features'
];

const TEMPLATE_KEYWORDS = {
  'ios-ui-ux-patterns.md': [
    'swiftui', 'uikit', 'human interface guidelines', 'accessibility', 'voiceover',
    'dark mode', 'dynamic type', 'navigation', 'gestures', 'animation'
  ],
  'ios-testing-comprehensive.md': [
    'xctest', 'xcuitest', 'unit testing', 'ui testing', 'snapshot testing',
    'integration testing', 'performance testing', 'testflight', 'ci/cd', 'fastlane'
  ],
  'ios-deployment-distribution.md': [
    'app store', 'testflight', 'code signing', 'provisioning', 'fastlane',
    'certificates', 'app store connect', 'distribution', 'deployment', 'release'
  ],
  'ios-performance-optimization.md': [
    'memory', 'cpu', 'battery', 'instruments', 'profiling', 'optimization',
    'performance', 'rendering', 'launch time', 'network'
  ]
};

describe('iOS Priority 1 Templates', () => {
  describe('Template Existence', () => {
    IOS_PRIORITY_TEMPLATES.forEach(template => {
      it(`should have ${template} template`, () => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        expect(existsSync(templatePath)).toBe(true);
      });
    });
  });

  describe('Template Structure', () => {
    IOS_PRIORITY_TEMPLATES.forEach(template => {
      describe(`${template}`, () => {
        let content: string;

        beforeAll(() => {
          const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
          content = readFileSync(templatePath, 'utf-8');
        });

        it('should have all required sections', () => {
          REQUIRED_SECTIONS.forEach(section => {
            expect(content).toMatch(new RegExp(`^## ${section}`, 'm'));
          });
        });

        it('should have proper markdown structure', () => {
          expect(content).toMatch(/^# .+ Template$/m);
          expect(content.split('\n')[0]).toMatch(/^# .+ Template$/);
        });

        it('should contain template-specific keywords', () => {
          const keywords = TEMPLATE_KEYWORDS[template];
          const contentLower = content.toLowerCase();
          
          const foundKeywords = keywords.filter(keyword => 
            contentLower.includes(keyword.toLowerCase())
          );
          
          expect(foundKeywords.length).toBeGreaterThan(keywords.length * 0.7);
        });

        it('should have comprehensive code examples', () => {
          const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
          expect(codeBlocks.length).toBeGreaterThan(8);
        });

        it('should have multiple examples', () => {
          const exampleMatches = content.match(/### Example \d+:/g) || [];
          expect(exampleMatches.length).toBeGreaterThanOrEqual(5);
        });

        it('should have substantial content', () => {
          expect(content.length).toBeGreaterThan(8000);
        });

        it('should have integration examples', () => {
          const integrationSection = content.match(/## Integration Points[\s\S]*?(?=## |$)/)?.[0] || '';
          expect(integrationSection.length).toBeGreaterThan(200);
          expect(integrationSection).toMatch(/```/);
        });

        it('should include security considerations', () => {
          const securitySection = content.match(/## Security Considerations[\s\S]*?(?=## |$)/)?.[0] || '';
          expect(securitySection.length).toBeGreaterThan(200);
          expect(securitySection).toMatch(/```/);
        });

        it('should include performance features', () => {
          const performanceSection = content.match(/## Performance Features[\s\S]*?(?=## |$)/)?.[0] || '';
          expect(performanceSection.length).toBeGreaterThan(200);
          expect(performanceSection).toMatch(/```/);
        });
      });
    });
  });

  describe('iOS-Specific Content Quality', () => {
    it('should have SwiftUI patterns in ios-ui-ux-patterns.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-ui-ux-patterns.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/import SwiftUI/);
      expect(content).toMatch(/struct.*: View/);
      expect(content).toMatch(/@State|@Published|@ObservedObject/);
      expect(content).toMatch(/var body: some View/);
      expect(content).toMatch(/NavigationStack|NavigationView/);
      expect(content).toMatch(/\.accessibility/);
    });

    it('should have XCTest patterns in ios-testing-comprehensive.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-testing-comprehensive.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/import XCTest/);
      expect(content).toMatch(/class.*: XCTestCase/);
      expect(content).toMatch(/func test.*\(\)/);
      expect(content).toMatch(/XCTAssert/);
      expect(content).toMatch(/XCUIApplication/);
      expect(content).toMatch(/async.*await/);
    });

    it('should have Fastlane patterns in ios-deployment-distribution.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-deployment-distribution.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/fastlane/i);
      expect(content).toMatch(/lane.*do/);
      expect(content).toMatch(/match|gym|pilot|deliver/);
      expect(content).toMatch(/app_store|testflight/i);
      expect(content).toMatch(/code.*sign/i);
    });

    it('should have Instruments patterns in ios-performance-optimization.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-performance-optimization.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/import os\.signpost|OSSignpostID/);
      expect(content).toMatch(/NSCache/);
      expect(content).toMatch(/DispatchQueue/);
      expect(content).toMatch(/async.*await/);
      expect(content).toMatch(/memory|cpu|battery/i);
      expect(content).toMatch(/performance|optimization/i);
    });
  });

  describe('Template Completeness', () => {
    IOS_PRIORITY_TEMPLATES.forEach(template => {
      it(`should have comprehensive ${template} with detailed examples`, () => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        // Should have at least 5 major examples
        const exampleMatches = content.match(/### Example \d+:/g) || [];
        expect(exampleMatches.length).toBeGreaterThanOrEqual(5);
        
        // Should have substantial content (at least 8000 characters)
        expect(content.length).toBeGreaterThan(8000);
        
        // Should have multiple code blocks
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        expect(codeBlocks.length).toBeGreaterThan(8);
      });
    });
  });

  describe('Cross-Template Consistency', () => {
    it('should have consistent section ordering across templates', () => {
      const sectionOrders: { [key: string]: string[] } = {};
      
      IOS_PRIORITY_TEMPLATES.forEach(template => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        const sections = content.match(/^## .+$/gm) || [];
        sectionOrders[template] = sections.map(s => s.replace('## ', ''));
      });
      
      // All templates should have the same core sections
      IOS_PRIORITY_TEMPLATES.forEach(template => {
        const templateSections = sectionOrders[template];
        
        // Check that all required sections are present
        REQUIRED_SECTIONS.forEach(section => {
          expect(templateSections).toContain(section);
        });
      });
    });

    it('should have consistent quality across all templates', () => {
      const templateStats: { [key: string]: { length: number; codeBlocks: number; examples: number } } = {};
      
      IOS_PRIORITY_TEMPLATES.forEach(template => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
        const examples = content.match(/### Example \d+:/g) || [];
        
        templateStats[template] = {
          length: content.length,
          codeBlocks: codeBlocks.length,
          examples: examples.length
        };
      });
      
      // Calculate averages
      const avgLength = Object.values(templateStats).reduce((sum, stats) => sum + stats.length, 0) / IOS_PRIORITY_TEMPLATES.length;
      const avgCodeBlocks = Object.values(templateStats).reduce((sum, stats) => sum + stats.codeBlocks, 0) / IOS_PRIORITY_TEMPLATES.length;
      const avgExamples = Object.values(templateStats).reduce((sum, stats) => sum + stats.examples, 0) / IOS_PRIORITY_TEMPLATES.length;
      
      // Each template should be within reasonable range of averages
      Object.entries(templateStats).forEach(([template, stats]) => {
        expect(stats.length).toBeGreaterThan(avgLength * 0.7);
        expect(stats.codeBlocks).toBeGreaterThan(avgCodeBlocks * 0.7);
        expect(stats.examples).toBeGreaterThan(avgExamples * 0.7);
      });
    });
  });

  describe('Template Validation', () => {
    IOS_PRIORITY_TEMPLATES.forEach(template => {
      it(`should have valid markdown syntax in ${template}`, () => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        // Check for balanced code blocks
        const codeBlockStarts = (content.match(/```/g) || []).length;
        expect(codeBlockStarts % 2).toBe(0);
        
        // Check for proper heading hierarchy
        const headings = content.match(/^#+\s+.+$/gm) || [];
        expect(headings.length).toBeGreaterThan(10);
        
        // Should start with h1
        expect(headings[0]).toMatch(/^# /);
        
        // Should have proper h2 sections
        const h2Headings = headings.filter(h => h.startsWith('## '));
        expect(h2Headings.length).toBeGreaterThanOrEqual(REQUIRED_SECTIONS.length);
      });
    });
  });

  describe('iOS Development Workflow Integration', () => {
    it('should reference Swift iOS Development template', () => {
      IOS_PRIORITY_TEMPLATES.forEach(template => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        // Should reference the main Swift iOS template
        expect(content).toMatch(/swift-ios-development\.md/i);
      });
    });

    it('should have cross-references between iOS templates', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-ui-ux-patterns.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      // UI/UX should reference testing and performance
      expect(content).toMatch(/ios-testing-comprehensive\.md|ios-performance-optimization\.md/i);
    });
  });

  describe('Practical Implementation Examples', () => {
    it('should have real-world code examples in each template', () => {
      IOS_PRIORITY_TEMPLATES.forEach(template => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        // Should have Swift code blocks
        expect(content).toMatch(/```swift/);
        
        // Should have configuration examples (YAML, Ruby, JSON, etc.)
        const hasConfig = /```(yaml|ruby|json|bash|sh)/i.test(content);
        expect(hasConfig).toBe(true);
      });
    });

    it('should include CI/CD examples where relevant', () => {
      const deploymentPath = join(TECHNOLOGY_STACKS_DIR, 'ios-deployment-distribution.md');
      const deploymentContent = readFileSync(deploymentPath, 'utf-8');
      
      expect(deploymentContent).toMatch(/github.*actions|\.yml|workflow/i);
      expect(deploymentContent).toMatch(/fastlane/i);
      
      const testingPath = join(TECHNOLOGY_STACKS_DIR, 'ios-testing-comprehensive.md');
      const testingContent = readFileSync(testingPath, 'utf-8');
      
      expect(testingContent).toMatch(/ci.*cd|continuous.*integration/i);
    });
  });

  describe('Apple Platform Compliance', () => {
    it('should reference Human Interface Guidelines in UI/UX template', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-ui-ux-patterns.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/human interface guidelines|hig/i);
      expect(content).toMatch(/accessibility/i);
      expect(content).toMatch(/voiceover/i);
    });

    it('should reference App Store guidelines in deployment template', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-deployment-distribution.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/app store/i);
      expect(content).toMatch(/review|submission/i);
      expect(content).toMatch(/testflight/i);
    });

    it('should reference Apple performance guidelines in optimization template', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'ios-performance-optimization.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/instruments/i);
      expect(content).toMatch(/60.*fps|frame.*rate/i);
      expect(content).toMatch(/launch.*time/i);
    });
  });
});
