/**
 * Documentation Generator
 *
 * Automatically generates API documentation, usage examples, and
 * deployment guides from the registered components and their metadata.
 *
 * Validates: Requirements 8.4, 13.4
 */

import { ComponentRegistration } from './integration-layer';

/**
 * Generated documentation structure
 */
export interface GeneratedDocs {
  apiReference: string;
  usageExamples: string;
  deploymentGuide: string;
  changeLog: string;
}

export class DocumentationGenerator {
  /**
   * Generates complete documentation for all components
   */
  public async generate(components: ComponentRegistration[]): Promise<GeneratedDocs> {
    return {
      apiReference: this.generateApiReference(components),
      usageExamples: this.generateUsageExamples(components),
      deploymentGuide: this.generateDeploymentGuide(components),
      changeLog: this.generateChangeLog(components)
    };
  }

  private generateApiReference(components: ComponentRegistration[]): string {
    let doc = '# API Reference\n\n';
    for (const c of components) {
      doc += `## ${c.name}\n`;
      doc += `- **Version:** ${c.version}\n`;
      doc += `- **Interfaces:** ${c.providedInterfaces.join(', ') || 'N/A'}\n\n`;
    }
    return doc;
  }

  private generateUsageExamples(components: ComponentRegistration[]): string {
    let doc = '# Usage Examples\n\n';
    for (const c of components) {
      doc += `## ${c.name}\n`;
      doc += '```typescript\n';
      doc += `import { ${c.name} } from './${c.id}';\n`;
      doc += `const instance = new ${c.name}();\n`;
      doc += '```\n\n';
    }
    return doc;
  }

  private generateDeploymentGuide(components: ComponentRegistration[]): string {
    let doc = '# Deployment Guide\n\n';
    doc += '## Prerequisites\n- Node.js >= 18\n- npm >= 9\n\n';
    doc += '## Components\n';
    for (const c of components) {
      doc += `- ${c.name} v${c.version}\n`;
    }
    doc += '\n## Steps\n1. `npm install`\n2. `npm run build`\n3. `npm start`\n';
    return doc;
  }

  private generateChangeLog(components: ComponentRegistration[]): string {
    let doc = '# Changelog\n\n';
    for (const c of components) {
      doc += `## ${c.name} – v${c.version}\n- Initial release\n\n`;
    }
    return doc;
  }
}
