# Template Dependencies Management

## Purpose

This template provides comprehensive patterns for declaring, resolving, and managing template dependencies, enabling proper dependency graphs, version compatibility checking, and circular dependency detection across the AI Prompt Library.

## Context

Templates often depend on other templates for complete functionality. Effective dependency management ensures templates are composed correctly, version conflicts are detected early, and circular dependencies are prevented.

## Core Components

### Dependency Schema

## Examples

```typescript
interface TemplateDependency {
  templateId: string;
  version: string;
  versionConstraint: VersionConstraint;
  type: DependencyType;
  optional: boolean;
  reason?: string;
}

enum DependencyType {
  REQUIRED = 'required',
  OPTIONAL = 'optional',
  PEER = 'peer',
  DEV = 'dev',
  EXTENDS = 'extends',
  ENHANCES = 'enhances'
}

interface VersionConstraint {
  type: ConstraintType;
  version: string;
  maxVersion?: string;
}

enum ConstraintType {
  EXACT = 'exact',           // =1.0.0
  GREATER_THAN = 'gt',       // >1.0.0
  GREATER_EQUAL = 'gte',     // >=1.0.0
  LESS_THAN = 'lt',          // <2.0.0
  LESS_EQUAL = 'lte',        // <=2.0.0
  RANGE = 'range',           // >=1.0.0 <2.0.0
  COMPATIBLE = 'compatible', // ^1.0.0 (same major)
  APPROXIMATE = 'approximate' // ~1.0.0 (same minor)
}


interface DependencyGraph {
  nodes: Map<string, DependencyNode>;
  edges: DependencyEdge[];
}

interface DependencyNode {
  templateId: string;
  version: string;
  dependencies: TemplateDependency[];
  dependents: string[];
}

interface DependencyEdge {
  from: string;
  to: string;
  type: DependencyType;
  constraint: VersionConstraint;
}
```

### Dependency Manager Service

```typescript
interface DependencyManager {
  // Dependency Declaration
  declareDependency(templateId: string, dependency: TemplateDependency): Promise<void>;
  removeDependency(templateId: string, dependencyId: string): Promise<void>;
  getDependencies(templateId: string): Promise<TemplateDependency[]>;
  
  // Dependency Resolution
  resolveDependencies(templateId: string): Promise<ResolvedDependencies>;
  resolveAll(templateIds: string[]): Promise<ResolvedDependencies>;
  
  // Validation
  validateDependencies(templateId: string): Promise<ValidationResult>;
  checkCircularDependencies(templateId: string): Promise<CircularDependencyCheck>;
  checkVersionCompatibility(dependencies: TemplateDependency[]): Promise<CompatibilityResult>;
  
  // Graph Operations
  buildDependencyGraph(templateIds: string[]): Promise<DependencyGraph>;
  getTransitiveDependencies(templateId: string): Promise<string[]>;
  getDependents(templateId: string): Promise<string[]>;
}

class TemplateDependencyManager implements DependencyManager {
  private dependencies: Map<string, TemplateDependency[]> = new Map();
  private templateVersions: Map<string, string> = new Map();

  async declareDependency(templateId: string, dependency: TemplateDependency): Promise<void> {
    // Validate dependency exists
    if (!this.templateVersions.has(dependency.templateId)) {
      throw new DependencyError(`Dependency template not found: ${dependency.templateId}`);
    }

    // Check for circular dependency
    const circularCheck = await this.checkCircularDependencies(templateId);
    if (circularCheck.hasCircular) {
      throw new CircularDependencyError(circularCheck.cycle);
    }

    // Check version compatibility
    const currentVersion = this.templateVersions.get(dependency.templateId)!;
    if (!this.isVersionCompatible(currentVersion, dependency.versionConstraint)) {
      throw new VersionIncompatibleError(
        `Version ${currentVersion} does not satisfy constraint ${this.formatConstraint(dependency.versionConstraint)}`
      );
    }

    // Add dependency
    const deps = this.dependencies.get(templateId) || [];
    deps.push(dependency);
    this.dependencies.set(templateId, deps);
  }

  async resolveDependencies(templateId: string): Promise<ResolvedDependencies> {
    const resolved: ResolvedDependency[] = [];
    const unresolved: UnresolvedDependency[] = [];
    const visited = new Set<string>();

    const resolve = async (id: string, depth: number): Promise<void> => {
      if (visited.has(id)) return;
      visited.add(id);

      const deps = this.dependencies.get(id) || [];
      
      for (const dep of deps) {
        const version = this.templateVersions.get(dep.templateId);
        
        if (!version) {
          if (!dep.optional) {
            unresolved.push({
              templateId: dep.templateId,
              constraint: dep.versionConstraint,
              reason: 'Template not found'
            });
          }
          continue;
        }

        if (!this.isVersionCompatible(version, dep.versionConstraint)) {
          unresolved.push({
            templateId: dep.templateId,
            constraint: dep.versionConstraint,
            reason: `Version ${version} incompatible with ${this.formatConstraint(dep.versionConstraint)}`
          });
          continue;
        }

        resolved.push({
          templateId: dep.templateId,
          version,
          type: dep.type,
          depth
        });

        // Resolve transitive dependencies
        await resolve(dep.templateId, depth + 1);
      }
    };

    await resolve(templateId, 0);

    return {
      resolved,
      unresolved,
      order: this.topologicalSort(resolved)
    };
  }

  async checkCircularDependencies(templateId: string): Promise<CircularDependencyCheck> {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const path: string[] = [];

    const detectCycle = (id: string): string[] | null => {
      visited.add(id);
      recursionStack.add(id);
      path.push(id);

      const deps = this.dependencies.get(id) || [];
      
      for (const dep of deps) {
        if (!visited.has(dep.templateId)) {
          const cycle = detectCycle(dep.templateId);
          if (cycle) return cycle;
        } else if (recursionStack.has(dep.templateId)) {
          // Found cycle
          const cycleStart = path.indexOf(dep.templateId);
          return [...path.slice(cycleStart), dep.templateId];
        }
      }

      path.pop();
      recursionStack.delete(id);
      return null;
    };

    const cycle = detectCycle(templateId);

    return {
      hasCircular: cycle !== null,
      cycle: cycle || []
    };
  }

  async buildDependencyGraph(templateIds: string[]): Promise<DependencyGraph> {
    const nodes = new Map<string, DependencyNode>();
    const edges: DependencyEdge[] = [];

    for (const templateId of templateIds) {
      const deps = this.dependencies.get(templateId) || [];
      const version = this.templateVersions.get(templateId) || '0.0.0';

      nodes.set(templateId, {
        templateId,
        version,
        dependencies: deps,
        dependents: []
      });

      for (const dep of deps) {
        edges.push({
          from: templateId,
          to: dep.templateId,
          type: dep.type,
          constraint: dep.versionConstraint
        });
      }
    }

    // Calculate dependents
    for (const edge of edges) {
      const node = nodes.get(edge.to);
      if (node) {
        node.dependents.push(edge.from);
      }
    }

    return { nodes, edges };
  }

  private isVersionCompatible(version: string, constraint: VersionConstraint): boolean {
    const v = this.parseVersion(version);
    const c = this.parseVersion(constraint.version);

    switch (constraint.type) {
      case ConstraintType.EXACT:
        return version === constraint.version;
      
      case ConstraintType.GREATER_THAN:
        return this.compareVersions(v, c) > 0;
      
      case ConstraintType.GREATER_EQUAL:
        return this.compareVersions(v, c) >= 0;
      
      case ConstraintType.LESS_THAN:
        return this.compareVersions(v, c) < 0;
      
      case ConstraintType.LESS_EQUAL:
        return this.compareVersions(v, c) <= 0;
      
      case ConstraintType.COMPATIBLE:
        // Same major version
        return v.major === c.major && this.compareVersions(v, c) >= 0;
      
      case ConstraintType.APPROXIMATE:
        // Same major and minor version
        return v.major === c.major && v.minor === c.minor && this.compareVersions(v, c) >= 0;
      
      case ConstraintType.RANGE:
        if (!constraint.maxVersion) return false;
        const max = this.parseVersion(constraint.maxVersion);
        return this.compareVersions(v, c) >= 0 && this.compareVersions(v, max) < 0;
      
      default:
        return false;
    }
  }

  private parseVersion(version: string): ParsedVersion {
    const parts = version.replace(/^v/, '').split('.');
    return {
      major: parseInt(parts[0] || '0', 10),
      minor: parseInt(parts[1] || '0', 10),
      patch: parseInt(parts[2] || '0', 10)
    };
  }

  private compareVersions(a: ParsedVersion, b: ParsedVersion): number {
    if (a.major !== b.major) return a.major - b.major;
    if (a.minor !== b.minor) return a.minor - b.minor;
    return a.patch - b.patch;
  }

  private formatConstraint(constraint: VersionConstraint): string {
    const symbols: Record<ConstraintType, string> = {
      [ConstraintType.EXACT]: '=',
      [ConstraintType.GREATER_THAN]: '>',
      [ConstraintType.GREATER_EQUAL]: '>=',
      [ConstraintType.LESS_THAN]: '<',
      [ConstraintType.LESS_EQUAL]: '<=',
      [ConstraintType.COMPATIBLE]: '^',
      [ConstraintType.APPROXIMATE]: '~',
      [ConstraintType.RANGE]: ''
    };

    if (constraint.type === ConstraintType.RANGE) {
      return `>=${constraint.version} <${constraint.maxVersion}`;
    }

    return `${symbols[constraint.type]}${constraint.version}`;
  }

  private topologicalSort(dependencies: ResolvedDependency[]): string[] {
    const graph = new Map<string, string[]>();
    const inDegree = new Map<string, number>();

    // Build graph
    for (const dep of dependencies) {
      if (!graph.has(dep.templateId)) {
        graph.set(dep.templateId, []);
        inDegree.set(dep.templateId, 0);
      }
    }

    // Calculate in-degrees
    for (const dep of dependencies) {
      const deps = this.dependencies.get(dep.templateId) || [];
      for (const d of deps) {
        if (graph.has(d.templateId)) {
          graph.get(dep.templateId)!.push(d.templateId);
          inDegree.set(d.templateId, (inDegree.get(d.templateId) || 0) + 1);
        }
      }
    }

    // Kahn's algorithm
    const queue: string[] = [];
    const result: string[] = [];

    for (const [node, degree] of inDegree) {
      if (degree === 0) queue.push(node);
    }

    while (queue.length > 0) {
      const node = queue.shift()!;
      result.push(node);

      for (const neighbor of graph.get(node) || []) {
        const newDegree = (inDegree.get(neighbor) || 0) - 1;
        inDegree.set(neighbor, newDegree);
        if (newDegree === 0) queue.push(neighbor);
      }
    }

    return result;
  }
}

interface ParsedVersion {
  major: number;
  minor: number;
  patch: number;
}

interface ResolvedDependencies {
  resolved: ResolvedDependency[];
  unresolved: UnresolvedDependency[];
  order: string[];
}

interface ResolvedDependency {
  templateId: string;
  version: string;
  type: DependencyType;
  depth: number;
}

interface UnresolvedDependency {
  templateId: string;
  constraint: VersionConstraint;
  reason: string;
}

interface CircularDependencyCheck {
  hasCircular: boolean;
  cycle: string[];
}
```

## Implementation Patterns

### Dependency Declaration in Templates

```markdown
<!-- Template header with dependencies -->
# Payment Processing Template

## Dependencies

| Template | Version | Type | Required |
|----------|---------|------|----------|
| security/encryption | ^1.0.0 | required | Yes |
| commerce/order-management | >=2.0.0 | peer | Yes |
| analytics/transaction-tracking | ~1.2.0 | optional | No |

## Purpose
...
```

### Dependency Parser

```typescript
class DependencyParser {
  parseFromMarkdown(content: string): TemplateDependency[] {
    const dependencies: TemplateDependency[] = [];
    
    // Find dependencies section
    const depsMatch = content.match(/##\s+Dependencies\s*\n([\s\S]*?)(?=\n##|$)/);
    if (!depsMatch) return dependencies;

    // Parse table rows
    const tableRows = depsMatch[1].match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
    if (!tableRows) return dependencies;

    for (const row of tableRows.slice(2)) { // Skip header and separator
      const cells = row.split('|').map(c => c.trim()).filter(c => c);
      if (cells.length >= 4) {
        const [templateId, versionStr, typeStr, requiredStr] = cells;
        
        dependencies.push({
          templateId,
          version: this.extractVersion(versionStr),
          versionConstraint: this.parseVersionConstraint(versionStr),
          type: this.parseType(typeStr),
          optional: requiredStr.toLowerCase() !== 'yes'
        });
      }
    }

    return dependencies;
  }

  private parseVersionConstraint(versionStr: string): VersionConstraint {
    const trimmed = versionStr.trim();
    
    if (trimmed.startsWith('^')) {
      return { type: ConstraintType.COMPATIBLE, version: trimmed.slice(1) };
    }
    if (trimmed.startsWith('~')) {
      return { type: ConstraintType.APPROXIMATE, version: trimmed.slice(1) };
    }
    if (trimmed.startsWith('>=')) {
      return { type: ConstraintType.GREATER_EQUAL, version: trimmed.slice(2) };
    }
    if (trimmed.startsWith('>')) {
      return { type: ConstraintType.GREATER_THAN, version: trimmed.slice(1) };
    }
    if (trimmed.startsWith('<=')) {
      return { type: ConstraintType.LESS_EQUAL, version: trimmed.slice(2) };
    }
    if (trimmed.startsWith('<')) {
      return { type: ConstraintType.LESS_THAN, version: trimmed.slice(1) };
    }
    if (trimmed.startsWith('=')) {
      return { type: ConstraintType.EXACT, version: trimmed.slice(1) };
    }
    
    return { type: ConstraintType.EXACT, version: trimmed };
  }

  private extractVersion(versionStr: string): string {
    return versionStr.replace(/^[^0-9]*/, '');
  }

  private parseType(typeStr: string): DependencyType {
    const normalized = typeStr.toLowerCase().trim();
    const typeMap: Record<string, DependencyType> = {
      'required': DependencyType.REQUIRED,
      'optional': DependencyType.OPTIONAL,
      'peer': DependencyType.PEER,
      'dev': DependencyType.DEV,
      'extends': DependencyType.EXTENDS,
      'enhances': DependencyType.ENHANCES
    };
    return typeMap[normalized] || DependencyType.REQUIRED;
  }
}
```

### Dependency Visualization

```typescript
class DependencyVisualizer {
  generateMermaidDiagram(graph: DependencyGraph): string {
    const lines: string[] = ['graph TD'];

    // Add nodes
    for (const [id, node] of graph.nodes) {
      const label = `${id}\\nv${node.version}`;
      lines.push(`    ${this.sanitizeId(id)}["${label}"]`);
    }

    // Add edges
    for (const edge of graph.edges) {
      const style = this.getEdgeStyle(edge.type);
      lines.push(`    ${this.sanitizeId(edge.from)} ${style} ${this.sanitizeId(edge.to)}`);
    }

    return lines.join('\n');
  }

  private sanitizeId(id: string): string {
    return id.replace(/[^a-zA-Z0-9]/g, '_');
  }

  private getEdgeStyle(type: DependencyType): string {
    switch (type) {
      case DependencyType.REQUIRED:
        return '-->';
      case DependencyType.OPTIONAL:
        return '-.->'; 
      case DependencyType.PEER:
        return '==>';
      case DependencyType.EXTENDS:
        return '-->>>';
      default:
        return '-->';
    }
  }

  generateDependencyTree(templateId: string, resolved: ResolvedDependencies): string {
    const lines: string[] = [templateId];
    
    const addDeps = (deps: ResolvedDependency[], prefix: string, depth: number) => {
      const filtered = deps.filter(d => d.depth === depth);
      
      for (let i = 0; i < filtered.length; i++) {
        const dep = filtered[i];
        const isLast = i === filtered.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const childPrefix = isLast ? '    ' : '│   ';
        
        lines.push(`${prefix}${connector}${dep.templateId}@${dep.version}`);
        
        // Add children
        const children = deps.filter(d => d.depth === depth + 1);
        if (children.length > 0) {
          addDeps(deps, prefix + childPrefix, depth + 1);
        }
      }
    };

    addDeps(resolved.resolved, '', 0);
    return lines.join('\n');
  }
}
```

## Integration Points

### Composition Engine Integration

```typescript
class CompositionDependencyResolver {
  private dependencyManager: DependencyManager;

  async resolveForComposition(templateIds: string[]): Promise<CompositionOrder> {
    // Resolve all dependencies
    const allResolved = await this.dependencyManager.resolveAll(templateIds);

    // Check for conflicts
    const conflicts = this.detectVersionConflicts(allResolved.resolved);
    if (conflicts.length > 0) {
      throw new DependencyConflictError(conflicts);
    }

    // Return composition order
    return {
      order: allResolved.order,
      dependencies: allResolved.resolved,
      warnings: this.generateWarnings(allResolved)
    };
  }

  private detectVersionConflicts(resolved: ResolvedDependency[]): VersionConflict[] {
    const conflicts: VersionConflict[] = [];
    const versionMap = new Map<string, Set<string>>();

    for (const dep of resolved) {
      if (!versionMap.has(dep.templateId)) {
        versionMap.set(dep.templateId, new Set());
      }
      versionMap.get(dep.templateId)!.add(dep.version);
    }

    for (const [templateId, versions] of versionMap) {
      if (versions.size > 1) {
        conflicts.push({
          templateId,
          versions: Array.from(versions)
        });
      }
    }

    return conflicts;
  }

  private generateWarnings(resolved: ResolvedDependencies): string[] {
    const warnings: string[] = [];

    // Warn about optional unresolved dependencies
    for (const unresolved of resolved.unresolved) {
      warnings.push(`Optional dependency not found: ${unresolved.templateId}`);
    }

    // Warn about deep dependency chains
    const maxDepth = Math.max(...resolved.resolved.map(d => d.depth));
    if (maxDepth > 5) {
      warnings.push(`Deep dependency chain detected (depth: ${maxDepth})`);
    }

    return warnings;
  }
}

interface CompositionOrder {
  order: string[];
  dependencies: ResolvedDependency[];
  warnings: string[];
}

interface VersionConflict {
  templateId: string;
  versions: string[];
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Dependency Management Properties', () => {
  it('should detect all circular dependencies', () => {
    fc.assert(fc.property(
      fc.array(fc.tuple(fc.string(), fc.string()), { minLength: 2, maxLength: 10 }),
      async (edges) => {
        const manager = new TemplateDependencyManager();
        
        // Create templates
        const templates = new Set<string>();
        for (const [from, to] of edges) {
          templates.add(from);
          templates.add(to);
        }
        
        for (const t of templates) {
          manager.registerTemplate(t, '1.0.0');
        }

        // Add dependencies
        for (const [from, to] of edges) {
          try {
            await manager.declareDependency(from, {
              templateId: to,
              version: '1.0.0',
              versionConstraint: { type: ConstraintType.COMPATIBLE, version: '1.0.0' },
              type: DependencyType.REQUIRED,
              optional: false
            });
          } catch (e) {
            // Circular dependency detected
          }
        }

        // Verify no circular dependencies exist
        for (const t of templates) {
          const check = await manager.checkCircularDependencies(t);
          expect(check.hasCircular).toBe(false);
        }
      }
    ));
  });

  it('should resolve dependencies in correct order', () => {
    fc.assert(fc.property(
      fc.integer({ min: 2, max: 10 }),
      async (chainLength) => {
        const manager = new TemplateDependencyManager();
        
        // Create linear dependency chain
        for (let i = 0; i < chainLength; i++) {
          manager.registerTemplate(`template-${i}`, '1.0.0');
        }

        for (let i = 0; i < chainLength - 1; i++) {
          await manager.declareDependency(`template-${i}`, {
            templateId: `template-${i + 1}`,
            version: '1.0.0',
            versionConstraint: { type: ConstraintType.EXACT, version: '1.0.0' },
            type: DependencyType.REQUIRED,
            optional: false
          });
        }

        // Resolve from first template
        const resolved = await manager.resolveDependencies('template-0');
        
        // Verify order: dependencies should come before dependents
        for (let i = 0; i < resolved.order.length - 1; i++) {
          const current = parseInt(resolved.order[i].split('-')[1]);
          const next = parseInt(resolved.order[i + 1].split('-')[1]);
          expect(current).toBeGreaterThan(next);
        }
      }
    ));
  });
});
```

## Configuration Examples

### Dependency Configuration

```yaml
dependency_management:
  resolution:
    strategy: "newest"  # newest, oldest, exact
    allow_duplicates: false
    max_depth: 10
  
  validation:
    check_circular: true
    check_version_conflicts: true
    warn_on_optional_missing: true
  
  version_constraints:
    default_type: "compatible"  # ^x.y.z
    strict_mode: false
  
  caching:
    enabled: true
    ttl: 3600  # seconds
```

## Related Templates

- `template-metadata.md` - Metadata management
- `template-versioning.md` - Version management
- `composition-rules.md` - Composition rules
- `template-validation.md` - Validation patterns
