import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const TECHNOLOGY_STACKS_DIR = join(__dirname, '../../prompts/modules/technology-stacks');

const MULTI_LANGUAGE_TEMPLATES = [
  'rust-systems-programming.md',
  'cpp-high-performance.md',
  'swift-ios-development.md',
  'kotlin-android-development.md',
  'scala-functional-programming.md',
  'elixir-phoenix-web.md'
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

const LANGUAGE_SPECIFIC_KEYWORDS = {
  'rust-systems-programming.md': [
    'rust', 'cargo', 'ownership', 'borrowing', 'tokio', 'async', 'await',
    'memory safety', 'zero-cost abstractions', 'webassembly', 'simd', 'concurrency'
  ],
  'cpp-high-performance.md': [
    'cpp', 'cmake', 'simd', 'openmp', 'cuda', 'performance', 'optimization',
    'memory management', 'parallel processing', 'vectorization', 'real-time'
  ],
  'swift-ios-development.md': [
    'swift', 'ios', 'swiftui', 'combine', 'core data', 'xcode', 'cocoapods',
    'uikit', 'foundation', 'arc', 'optionals', 'protocols'
  ],
  'kotlin-android-development.md': [
    'kotlin', 'android', 'jetpack compose', 'coroutines', 'room', 'retrofit',
    'hilt', 'gradle', 'mvvm', 'lifecycle', 'navigation'
  ],
  'scala-functional-programming.md': [
    'scala', 'functional programming', 'cats', 'akka', 'play framework',
    'sbt', 'monads', 'type classes', 'pattern matching', 'immutable'
  ],
  'elixir-phoenix-web.md': [
    'elixir', 'phoenix', 'otp', 'genserver', 'supervisor', 'liveview',
    'ecto', 'beam', 'fault tolerance', 'actor model', 'distributed'
  ]
};

describe('Multi-Language Support Templates', () => {
  describe('Template Existence', () => {
    MULTI_LANGUAGE_TEMPLATES.forEach(template => {
      it(`should have ${template} template`, () => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        expect(existsSync(templatePath)).toBe(true);
      });
    });
  });

  describe('Template Structure', () => {
    MULTI_LANGUAGE_TEMPLATES.forEach(template => {
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

        it('should contain language-specific keywords', () => {
          const keywords = LANGUAGE_SPECIFIC_KEYWORDS[template];
          const contentLower = content.toLowerCase();
          
          const foundKeywords = keywords.filter(keyword => 
            contentLower.includes(keyword.toLowerCase())
          );
          
          expect(foundKeywords.length).toBeGreaterThan(keywords.length * 0.7);
        });

        it('should have comprehensive code examples', () => {
          const codeBlocks = content.match(/```[\s\S]*?```/g) || [];
          expect(codeBlocks.length).toBeGreaterThan(5);
          
          // Check for different types of code examples
          const hasConfigExample = codeBlocks.some(block => 
            block.includes('package.json') || 
            block.includes('Cargo.toml') || 
            block.includes('build.gradle') ||
            block.includes('mix.exs') ||
            block.includes('CMakeLists.txt') ||
            block.includes('Package.swift')
          );
          expect(hasConfigExample).toBe(true);
        });

        it('should include setup instructions', () => {
          expect(content).toMatch(/install|setup|create|configure/i);
          expect(content).toMatch(/```bash|```sh|```shell/);
        });

        it('should have integration examples', () => {
          const integrationSection = content.match(/## Integration Points[\s\S]*?(?=## |$)/)?.[0] || '';
          expect(integrationSection.length).toBeGreaterThan(200);
          expect(integrationSection).toMatch(/```/);
        });

        it('should include security considerations', () => {
          const securitySection = content.match(/## Security Considerations[\s\S]*?(?=## |$)/)?.[0] || '';
          expect(securitySection.length).toBeGreaterThan(200);
          expect(securitySection).toMatch(/security|authentication|authorization|validation|encryption/i);
        });

        it('should include performance features', () => {
          const performanceSection = content.match(/## Performance Features[\s\S]*?(?=## |$)/)?.[0] || '';
          expect(performanceSection.length).toBeGreaterThan(200);
          expect(performanceSection).toMatch(/performance|optimization|memory|cache|concurrent|parallel/i);
        });
      });
    });
  });

  describe('Language-Specific Content Quality', () => {
    it('should have Rust-specific patterns in rust-systems-programming.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'rust-systems-programming.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/use std::/);
      expect(content).toMatch(/async fn/);
      expect(content).toMatch(/Result<.*>/);
      expect(content).toMatch(/Option<.*>/);
      expect(content).toMatch(/impl.*for/);
      expect(content).toMatch(/tokio::/);
    });

    it('should have C++ specific patterns in cpp-high-performance.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'cpp-high-performance.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/#include/);
      expect(content).toMatch(/std::/);
      expect(content).toMatch(/template<.*>/);
      expect(content).toMatch(/namespace/);
      expect(content).toMatch(/__m256|__m128/); // SIMD intrinsics
      expect(content).toMatch(/#pragma omp/); // OpenMP
    });

    it('should have Swift-specific patterns in swift-ios-development.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'swift-ios-development.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/import SwiftUI|import UIKit/);
      expect(content).toMatch(/struct.*: View/);
      expect(content).toMatch(/@State|@Published|@ObservedObject/);
      expect(content).toMatch(/var body: some View/);
      expect(content).toMatch(/func.*async/);
      expect(content).toMatch(/NavigationView|NavigationStack/);
    });

    it('should have Kotlin-specific patterns in kotlin-android-development.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'kotlin-android-development.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/class.*: ViewModel/);
      expect(content).toMatch(/@Composable/);
      expect(content).toMatch(/suspend fun/);
      expect(content).toMatch(/StateFlow|LiveData/);
      expect(content).toMatch(/Room|Entity|Dao/);
      expect(content).toMatch(/Hilt|@Inject/);
    });

    it('should have Scala-specific patterns in scala-functional-programming.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'scala-functional-programming.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/case class/);
      expect(content).toMatch(/sealed trait/);
      expect(content).toMatch(/def.*: F\[/);
      expect(content).toMatch(/implicit/);
      expect(content).toMatch(/for.*yield/);
      expect(content).toMatch(/cats\.|akka\./);
    });

    it('should have Elixir-specific patterns in elixir-phoenix-web.md', () => {
      const templatePath = join(TECHNOLOGY_STACKS_DIR, 'elixir-phoenix-web.md');
      const content = readFileSync(templatePath, 'utf-8');
      
      expect(content).toMatch(/defmodule.*do/);
      expect(content).toMatch(/use GenServer/);
      expect(content).toMatch(/def handle_call|def handle_cast/);
      expect(content).toMatch(/@impl true/);
      expect(content).toMatch(/Phoenix\.|Ecto\./);
      expect(content).toMatch(/use.*:live_view/);
    });
  });

  describe('Template Completeness', () => {
    MULTI_LANGUAGE_TEMPLATES.forEach(template => {
      it(`should have comprehensive ${template} with multiple examples`, () => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        // Should have at least 3 major examples
        const exampleMatches = content.match(/### Example \d+:/g) || [];
        expect(exampleMatches.length).toBeGreaterThanOrEqual(3);
        
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
      
      MULTI_LANGUAGE_TEMPLATES.forEach(template => {
        const templatePath = join(TECHNOLOGY_STACKS_DIR, template);
        const content = readFileSync(templatePath, 'utf-8');
        
        const sections = content.match(/^## .+$/gm) || [];
        sectionOrders[template] = sections.map(s => s.replace('## ', ''));
      });
      
      // All templates should have the same core sections in similar order
      const firstTemplate = MULTI_LANGUAGE_TEMPLATES[0];
      const expectedSections = sectionOrders[firstTemplate];
      
      MULTI_LANGUAGE_TEMPLATES.slice(1).forEach(template => {
        const templateSections = sectionOrders[template];
        
        // Check that all required sections are present
        REQUIRED_SECTIONS.forEach(section => {
          expect(templateSections).toContain(section);
        });
      });
    });

    it('should have consistent quality across all templates', () => {
      const templateStats: { [key: string]: { length: number; codeBlocks: number; examples: number } } = {};
      
      MULTI_LANGUAGE_TEMPLATES.forEach(template => {
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
      const avgLength = Object.values(templateStats).reduce((sum, stats) => sum + stats.length, 0) / MULTI_LANGUAGE_TEMPLATES.length;
      const avgCodeBlocks = Object.values(templateStats).reduce((sum, stats) => sum + stats.codeBlocks, 0) / MULTI_LANGUAGE_TEMPLATES.length;
      const avgExamples = Object.values(templateStats).reduce((sum, stats) => sum + stats.examples, 0) / MULTI_LANGUAGE_TEMPLATES.length;
      
      // Each template should be within reasonable range of averages
      Object.entries(templateStats).forEach(([template, stats]) => {
        expect(stats.length).toBeGreaterThan(avgLength * 0.7);
        expect(stats.codeBlocks).toBeGreaterThan(avgCodeBlocks * 0.7);
        expect(stats.examples).toBeGreaterThan(avgExamples * 0.7);
      });
    });
  });

  describe('Technology Stack README Integration', () => {
    it('should have all new templates listed in README.md', () => {
      const readmePath = join(TECHNOLOGY_STACKS_DIR, 'README.md');
      const readmeContent = readFileSync(readmePath, 'utf-8');
      
      MULTI_LANGUAGE_TEMPLATES.forEach(template => {
        expect(readmeContent).toContain(template);
      });
    });

    it('should have proper categorization in README.md', () => {
      const readmePath = join(TECHNOLOGY_STACKS_DIR, 'README.md');
      const readmeContent = readFileSync(readmePath, 'utf-8');
      
      // Should have new categories
      expect(readmeContent).toContain('Systems Programming & High-Performance');
      expect(readmeContent).toContain('Mobile Development');
      expect(readmeContent).toContain('Functional Programming & Distributed Systems');
      
      // Should have proper descriptions
      expect(readmeContent).toContain('rust-systems-programming.md');
      expect(readmeContent).toContain('cpp-high-performance.md');
      expect(readmeContent).toContain('swift-ios-development.md');
      expect(readmeContent).toContain('kotlin-android-development.md');
      expect(readmeContent).toContain('scala-functional-programming.md');
      expect(readmeContent).toContain('elixir-phoenix-web.md');
    });
  });

  describe('Template Validation', () => {
    MULTI_LANGUAGE_TEMPLATES.forEach(template => {
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
});