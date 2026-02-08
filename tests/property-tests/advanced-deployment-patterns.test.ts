import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const DEPLOYMENT_MODULES_PATH = join(process.cwd(), 'prompts', 'modules', 'deployment');

const ADVANCED_DEPLOYMENT_TEMPLATES = [
  'edge-computing-deployment.md',
  'serverless-orchestration-scale.md',
  'multi-cloud-deployment-strategies.md',
  'gitops-advanced-workflows.md',
  'infrastructure-as-code-evolution.md',
  'zero-trust-deployment-architectures.md'
];

const REQUIRED_SECTIONS = [
  '# ',
  '## Purpose',
  '## Context',
  '## Examples',
  '## Instructions',
  '## Implementation Patterns',
  '## Expected Output',
  '## Integration Points',
  '## Security Considerations',
  '## Performance Features'
];

const ADVANCED_DEPLOYMENT_KEYWORDS = [
  'intelligent',
  'ai-driven',
  'optimization',
  'automation',
  'orchestration',
  'security',
  'performance',
  'scalability',
  'monitoring',
  'compliance'
];

describe('Advanced Deployment Patterns Templates', () => {
  ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
    describe(`${template}`, () => {
      const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
      
      it('should exist', () => {
        expect(existsSync(templatePath)).toBe(true);
      });

      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8');

        it('should have all required sections', () => {
          REQUIRED_SECTIONS.forEach(section => {
            expect(content).toContain(section);
          });
        });

        it('should have comprehensive examples', () => {
          const examplesSection = content.split('## Examples')[1]?.split('## Instructions')[0];
          expect(examplesSection).toBeDefined();
          expect(examplesSection.length).toBeGreaterThan(1000);
          
          // Should have multiple examples
          const exampleCount = (examplesSection.match(/### Example \d+:/g) || []).length;
          expect(exampleCount).toBeGreaterThanOrEqual(3);
        });

        it('should include TypeScript/JavaScript code examples', () => {
          const codeBlocks = content.match(/```typescript|```javascript|```ts|```js/g) || [];
          expect(codeBlocks.length).toBeGreaterThanOrEqual(3);
        });

        it('should include infrastructure code examples', () => {
          const infraCodeBlocks = content.match(/```yaml|```hcl|```terraform|```dockerfile/g) || [];
          expect(infraCodeBlocks.length).toBeGreaterThanOrEqual(2);
        });

        it('should have detailed implementation patterns', () => {
          const implementationSection = content.split('## Implementation Patterns')[1]?.split('## Expected Output')[0];
          expect(implementationSection).toBeDefined();
          expect(implementationSection.length).toBeGreaterThan(800);
        });

        it('should include expected output examples', () => {
          const outputSection = content.split('## Expected Output')[1]?.split('## Integration Points')[0];
          expect(outputSection).toBeDefined();
          expect(outputSection.length).toBeGreaterThan(500);
          
          // Should include JSON output examples
          expect(outputSection).toMatch(/```json/);
        });

        it('should have CI/CD integration examples', () => {
          const integrationSection = content.split('## Integration Points')[1]?.split('## Security Considerations')[0];
          expect(integrationSection).toBeDefined();
          expect(integrationSection).toContain('CI/CD');
          expect(integrationSection).toMatch(/```yaml|```yml/);
        });

        it('should include security considerations', () => {
          const securitySection = content.split('## Security Considerations')[1]?.split('## Performance Features')[0];
          expect(securitySection).toBeDefined();
          expect(securitySection.length).toBeGreaterThan(300);
          expect(securitySection.toLowerCase()).toContain('security');
        });

        it('should include performance features', () => {
          const performanceSection = content.split('## Performance Features')[1];
          expect(performanceSection).toBeDefined();
          expect(performanceSection.length).toBeGreaterThan(300);
          expect(performanceSection.toLowerCase()).toContain('performance');
        });

        it('should contain advanced deployment keywords', () => {
          const lowerContent = content.toLowerCase();
          const foundKeywords = ADVANCED_DEPLOYMENT_KEYWORDS.filter(keyword => 
            lowerContent.includes(keyword)
          );
          expect(foundKeywords.length).toBeGreaterThanOrEqual(8);
        });

        it('should have proper markdown structure', () => {
          // Check for proper heading hierarchy
          const headings = content.match(/^#{1,6}\s+.+$/gm) || [];
          expect(headings.length).toBeGreaterThanOrEqual(10);
          
          // Should start with h1
          expect(content).toMatch(/^# /);
        });

        it('should include monitoring and observability patterns', () => {
          const lowerContent = content.toLowerCase();
          expect(lowerContent).toMatch(/monitoring|observability|metrics|alerting|dashboard/);
        });

        it('should include AI and machine learning features', () => {
          const lowerContent = content.toLowerCase();
          expect(lowerContent).toMatch(/ai|artificial intelligence|machine learning|ml|intelligent|optimization/);
        });
      }
    });
  });

  describe('Template-specific validations', () => {
    it('edge-computing-deployment.md should include edge-specific features', () => {
      const templatePath = join(DEPLOYMENT_MODULES_PATH, 'edge-computing-deployment.md');
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        expect(content).toContain('edge');
        expect(content).toContain('cdn');
        expect(content).toContain('latency');
        expect(content).toContain('global');
        expect(content).toMatch(/cloudflare|aws cloudfront|azure cdn/);
      }
    });

    it('serverless-orchestration-scale.md should include serverless-specific features', () => {
      const templatePath = join(DEPLOYMENT_MODULES_PATH, 'serverless-orchestration-scale.md');
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        expect(content).toContain('serverless');
        expect(content).toContain('function');
        expect(content).toContain('lambda');
        expect(content).toContain('event-driven');
        expect(content).toMatch(/aws lambda|azure functions|google cloud functions/);
      }
    });

    it('multi-cloud-deployment-strategies.md should include multi-cloud features', () => {
      const templatePath = join(DEPLOYMENT_MODULES_PATH, 'multi-cloud-deployment-strategies.md');
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        expect(content).toContain('multi-cloud');
        expect(content).toContain('aws');
        expect(content).toContain('azure');
        expect(content).toContain('gcp');
        expect(content).toContain('provider');
        expect(content).toContain('cross-cloud');
      }
    });

    it('gitops-advanced-workflows.md should include GitOps-specific features', () => {
      const templatePath = join(DEPLOYMENT_MODULES_PATH, 'gitops-advanced-workflows.md');
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        expect(content).toContain('gitops');
        expect(content).toContain('git');
        expect(content).toContain('argocd');
        expect(content).toContain('flux');
        expect(content).toContain('rollback');
        expect(content).toContain('promotion');
      }
    });

    it('infrastructure-as-code-evolution.md should include IaC-specific features', () => {
      const templatePath = join(DEPLOYMENT_MODULES_PATH, 'infrastructure-as-code-evolution.md');
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        expect(content).toContain('infrastructure as code');
        expect(content).toContain('terraform');
        expect(content).toContain('pulumi');
        expect(content).toContain('self-healing');
        expect(content).toContain('drift');
        expect(content).toContain('compliance');
      }
    });

    it('zero-trust-deployment-architectures.md should include zero-trust features', () => {
      const templatePath = join(DEPLOYMENT_MODULES_PATH, 'zero-trust-deployment-architectures.md');
      if (existsSync(templatePath)) {
        const content = readFileSync(templatePath, 'utf-8').toLowerCase();
        expect(content).toContain('zero-trust');
        expect(content).toContain('identity');
        expect(content).toContain('micro-segmentation');
        expect(content).toContain('continuous verification');
        expect(content).toContain('threat detection');
        expect(content).toContain('authentication');
      }
    });
  });

  describe('Integration and consistency', () => {
    it('should have consistent structure across all templates', () => {
      const structures = ADVANCED_DEPLOYMENT_TEMPLATES.map(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (!existsSync(templatePath)) return null;
        
        const content = readFileSync(templatePath, 'utf-8');
        return {
          template,
          sections: REQUIRED_SECTIONS.filter(section => content.includes(section)),
          codeBlocks: (content.match(/```/g) || []).length,
          examples: (content.match(/### Example \d+:/g) || []).length
        };
      }).filter(Boolean);

      // All templates should have the same required sections
      structures.forEach(structure => {
        expect(structure.sections.length).toBe(REQUIRED_SECTIONS.length);
        expect(structure.codeBlocks).toBeGreaterThanOrEqual(10);
        expect(structure.examples).toBeGreaterThanOrEqual(3);
      });
    });

    it('should reference integration with other modules', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          // Should reference integration with other systems
          expect(content).toMatch(/integration|monitoring|security|analytics|testing/);
        }
      });
    });

    it('should include comprehensive error handling', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          expect(content).toMatch(/error|exception|failure|rollback|recovery/);
        }
      });
    });

    it('should include scalability considerations', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          expect(content).toMatch(/scal|performance|optimization|efficiency/);
        }
      });
    });
  });

  describe('Advanced features validation', () => {
    it('should include AI and machine learning integration', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          const aiFeatures = content.match(/ai|artificial intelligence|machine learning|ml|intelligent|optimization|predictive/g) || [];
          expect(aiFeatures.length).toBeGreaterThanOrEqual(5);
        }
      });
    });

    it('should include automation and orchestration features', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          expect(content).toMatch(/automat|orchestrat|intelligent|self-healing|adaptive/);
        }
      });
    });

    it('should include comprehensive monitoring and observability', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          expect(content).toMatch(/monitoring|observability|metrics|alerting|dashboard|prometheus|grafana/);
        }
      });
    });

    it('should include security best practices', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          expect(content).toMatch(/security|encryption|authentication|authorization|compliance|audit/);
        }
      });
    });

    it('should include cost optimization features', () => {
      ADVANCED_DEPLOYMENT_TEMPLATES.forEach(template => {
        const templatePath = join(DEPLOYMENT_MODULES_PATH, template);
        if (existsSync(templatePath)) {
          const content = readFileSync(templatePath, 'utf-8').toLowerCase();
          expect(content).toMatch(/cost|optimization|efficiency|savings|budget/);
        }
      });
    });
  });
});