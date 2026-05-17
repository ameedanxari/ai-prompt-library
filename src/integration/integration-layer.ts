/**
 * Integration Layer
 *
 * Manages the integration of independently developed components,
 * ensuring interface compatibility and system coherence.
 *
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

/**
 * A component registration entry
 */
export interface ComponentRegistration {
  id: string;
  name: string;
  version: string;
  providedInterfaces: string[];
  requiredInterfaces: string[];
  metadata: Record<string, any>;
}

/**
 * Integration validation result
 */
export interface IntegrationValidation {
  valid: boolean;
  missingDependencies: string[];
  interfaceMismatches: string[];
  warnings: string[];
}

export interface IntegrationLayer {
  integrateComponent(component: ComponentRegistration): Promise<IntegrationValidation>;
  resolveConflicts(components: ComponentRegistration[]): Promise<string[]>;
  validateIntegration(): Promise<IntegrationValidation>;
  generateDocumentation(): Promise<string>;
}

export class DefaultIntegrationLayer implements IntegrationLayer {
  private components: Map<string, ComponentRegistration> = new Map();

  /**
   * Integrates a new component into the system
   */
  public async integrateComponent(component: ComponentRegistration): Promise<IntegrationValidation> {
    const validation = this.validateComponent(component);
    if (validation.valid) {
      this.components.set(component.id, component);
    }
    return validation;
  }

  /**
   * Resolves conflicts between components
   */
  public async resolveConflicts(components: ComponentRegistration[]): Promise<string[]> {
    const resolutions: string[] = [];
    const providedMap = new Map<string, string>();

    for (const c of components) {
      for (const iface of c.providedInterfaces) {
        if (providedMap.has(iface)) {
          resolutions.push(`Interface '${iface}' provided by both '${providedMap.get(iface)}' and '${c.name}' – using latest version`);
        }
        providedMap.set(iface, c.name);
      }
    }

    return resolutions;
  }

  /**
   * Validates the overall system integration
   */
  public async validateIntegration(): Promise<IntegrationValidation> {
    const allProvided = new Set<string>();
    const allRequired = new Set<string>();

    for (const c of this.components.values()) {
      c.providedInterfaces.forEach(i => allProvided.add(i));
      c.requiredInterfaces.forEach(i => allRequired.add(i));
    }

    const missing = Array.from(allRequired).filter(r => !allProvided.has(r));

    return {
      valid: missing.length === 0,
      missingDependencies: missing,
      interfaceMismatches: [],
      warnings: []
    };
  }

  /**
   * Generates integration documentation
   */
  public async generateDocumentation(): Promise<string> {
    let doc = '# System Integration Map\n\n';
    for (const c of this.components.values()) {
      doc += `## ${c.name} (v${c.version})\n`;
      doc += `- Provides: ${c.providedInterfaces.join(', ') || 'none'}\n`;
      doc += `- Requires: ${c.requiredInterfaces.join(', ') || 'none'}\n\n`;
    }
    return doc;
  }

  private validateComponent(component: ComponentRegistration): IntegrationValidation {
    const allProvided = new Set<string>();
    for (const c of this.components.values()) {
      c.providedInterfaces.forEach(i => allProvided.add(i));
    }

    const missing = component.requiredInterfaces.filter(r => !allProvided.has(r));

    return {
      valid: missing.length === 0,
      missingDependencies: missing,
      interfaceMismatches: [],
      warnings: []
    };
  }
}
