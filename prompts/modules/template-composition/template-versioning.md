# Template Versioning System

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->


## Purpose

This template provides comprehensive patterns for implementing semantic versioning for templates, managing version compatibility rules, and defining migration and upgrade paths across the AI Prompt Library.

## Context

Template versioning ensures backward compatibility, enables safe upgrades, and provides clear migration paths when templates evolve. This template establishes versioning standards, compatibility rules, and upgrade mechanisms.

## Core Components

### Version Schema

## Examples

```typescript
interface TemplateVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

interface VersionedTemplate {
  templateId: string;
  version: TemplateVersion;
  releaseDate: Date;
  changelog: ChangelogEntry[];
  compatibility: CompatibilityInfo;
  deprecation?: DeprecationInfo;
}

interface ChangelogEntry {
  version: string;
  date: Date;
  type: ChangeType;
  description: string;
  breakingChanges?: string[];
  migrationGuide?: string;
}

enum ChangeType {
  ADDED = 'added',
  CHANGED = 'changed',
  DEPRECATED = 'deprecated',
  REMOVED = 'removed',
  FIXED = 'fixed',
  SECURITY = 'security'
}


interface CompatibilityInfo {
  minVersion: string;
  maxVersion?: string;
  compatibleWith: string[];
  incompatibleWith: string[];
}

interface DeprecationInfo {
  deprecatedAt: string;
  removalVersion?: string;
  replacement?: string;
  migrationGuide: string;
}
```

### Version Manager Service

```typescript
interface VersionManager {
  // Version Operations
  parseVersion(versionString: string): TemplateVersion;
  formatVersion(version: TemplateVersion): string;
  compareVersions(a: TemplateVersion, b: TemplateVersion): number;
  
  // Version Queries
  getLatestVersion(templateId: string): Promise<TemplateVersion>;
  getAllVersions(templateId: string): Promise<TemplateVersion[]>;
  getVersionHistory(templateId: string): Promise<VersionedTemplate[]>;
  
  // Compatibility
  isCompatible(version: TemplateVersion, constraint: string): boolean;
  findCompatibleVersions(templateId: string, constraint: string): Promise<TemplateVersion[]>;
  
  // Upgrades
  canUpgrade(from: TemplateVersion, to: TemplateVersion): boolean;
  getUpgradePath(from: TemplateVersion, to: TemplateVersion): Promise<UpgradePath>;
  getMigrationGuide(from: string, to: string): Promise<MigrationGuide>;
}

class TemplateVersionManager implements VersionManager {
  private versions: Map<string, VersionedTemplate[]> = new Map();

  parseVersion(versionString: string): TemplateVersion {
    const regex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([a-zA-Z0-9.]+))?(?:\+([a-zA-Z0-9.]+))?$/;
    const match = versionString.match(regex);
    
    if (!match) {
      throw new VersionParseError(`Invalid version format: ${versionString}`);
    }

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5]
    };
  }

  formatVersion(version: TemplateVersion): string {
    let str = `${version.major}.${version.minor}.${version.patch}`;
    if (version.prerelease) str += `-${version.prerelease}`;
    if (version.build) str += `+${version.build}`;
    return str;
  }

  compareVersions(a: TemplateVersion, b: TemplateVersion): number {
    // Compare major
    if (a.major !== b.major) return a.major - b.major;
    
    // Compare minor
    if (a.minor !== b.minor) return a.minor - b.minor;
    
    // Compare patch
    if (a.patch !== b.patch) return a.patch - b.patch;
    
    // Compare prerelease (no prerelease > prerelease)
    if (a.prerelease && !b.prerelease) return -1;
    if (!a.prerelease && b.prerelease) return 1;
    if (a.prerelease && b.prerelease) {
      return a.prerelease.localeCompare(b.prerelease);
    }
    
    return 0;
  }

  isCompatible(version: TemplateVersion, constraint: string): boolean {
    const trimmed = constraint.trim();
    
    // Exact match
    if (trimmed.startsWith('=')) {
      const target = this.parseVersion(trimmed.slice(1));
      return this.compareVersions(version, target) === 0;
    }
    
    // Compatible (^) - same major, >= specified
    if (trimmed.startsWith('^')) {
      const target = this.parseVersion(trimmed.slice(1));
      return version.major === target.major && 
             this.compareVersions(version, target) >= 0;
    }
    
    // Approximate (~) - same major.minor, >= specified
    if (trimmed.startsWith('~')) {
      const target = this.parseVersion(trimmed.slice(1));
      return version.major === target.major && 
             version.minor === target.minor &&
             this.compareVersions(version, target) >= 0;
    }
    
    // Greater than or equal
    if (trimmed.startsWith('>=')) {
      const target = this.parseVersion(trimmed.slice(2));
      return this.compareVersions(version, target) >= 0;
    }
    
    // Greater than
    if (trimmed.startsWith('>')) {
      const target = this.parseVersion(trimmed.slice(1));
      return this.compareVersions(version, target) > 0;
    }
    
    // Less than or equal
    if (trimmed.startsWith('<=')) {
      const target = this.parseVersion(trimmed.slice(2));
      return this.compareVersions(version, target) <= 0;
    }
    
    // Less than
    if (trimmed.startsWith('<')) {
      const target = this.parseVersion(trimmed.slice(1));
      return this.compareVersions(version, target) < 0;
    }
    
    // Default: exact match
    const target = this.parseVersion(trimmed);
    return this.compareVersions(version, target) === 0;
  }

  canUpgrade(from: TemplateVersion, to: TemplateVersion): boolean {
    // Can always upgrade to newer version
    if (this.compareVersions(to, from) <= 0) {
      return false;
    }
    
    // Major version changes require explicit migration
    if (to.major > from.major) {
      return true; // Allowed but may need migration
    }
    
    return true;
  }

  async getUpgradePath(from: TemplateVersion, to: TemplateVersion): Promise<UpgradePath> {
    const steps: UpgradeStep[] = [];
    
    // If major version change, find intermediate major versions
    if (to.major > from.major) {
      for (let major = from.major + 1; major <= to.major; major++) {
        steps.push({
          fromVersion: major === from.major + 1 ? this.formatVersion(from) : `${major - 1}.0.0`,
          toVersion: major === to.major ? this.formatVersion(to) : `${major}.0.0`,
          type: 'major',
          requiresMigration: true
        });
      }
    } else {
      // Direct upgrade for minor/patch
      steps.push({
        fromVersion: this.formatVersion(from),
        toVersion: this.formatVersion(to),
        type: to.minor > from.minor ? 'minor' : 'patch',
        requiresMigration: false
      });
    }

    return {
      from: this.formatVersion(from),
      to: this.formatVersion(to),
      steps,
      estimatedEffort: this.estimateUpgradeEffort(steps)
    };
  }

  private estimateUpgradeEffort(steps: UpgradeStep[]): string {
    const majorSteps = steps.filter(s => s.type === 'major').length;
    
    if (majorSteps === 0) return 'low';
    if (majorSteps === 1) return 'medium';
    return 'high';
  }
}

interface UpgradePath {
  from: string;
  to: string;
  steps: UpgradeStep[];
  estimatedEffort: string;
}

interface UpgradeStep {
  fromVersion: string;
  toVersion: string;
  type: 'major' | 'minor' | 'patch';
  requiresMigration: boolean;
}

interface MigrationGuide {
  fromVersion: string;
  toVersion: string;
  breakingChanges: BreakingChange[];
  migrationSteps: MigrationStep[];
  codeExamples: CodeMigrationExample[];
}

interface BreakingChange {
  description: string;
  impact: 'high' | 'medium' | 'low';
  affectedAreas: string[];
}

interface MigrationStep {
  order: number;
  description: string;
  automated: boolean;
  command?: string;
}

interface CodeMigrationExample {
  description: string;
  before: string;
  after: string;
}
```

### Semantic Versioning Rules

```typescript
class SemanticVersioningRules {
  /**
   * MAJOR version: incompatible API changes
   * - Removing or renaming sections
   * - Changing required parameters
   * - Changing output format incompatibly
   * - Removing supported platforms
   */
  requiresMajorBump(changes: TemplateChange[]): boolean {
    return changes.some(change => 
      change.type === 'removed' ||
      change.type === 'renamed' ||
      change.breaking === true
    );
  }

  /**
   * MINOR version: backward-compatible functionality
   * - Adding new sections
   * - Adding optional parameters
   * - Adding new platforms
   * - Deprecating features (not removing)
   */
  requiresMinorBump(changes: TemplateChange[]): boolean {
    return changes.some(change =>
      change.type === 'added' ||
      change.type === 'deprecated'
    ) && !this.requiresMajorBump(changes);
  }

  /**
   * PATCH version: backward-compatible bug fixes
   * - Fixing typos
   * - Clarifying documentation
   * - Fixing code examples
   * - Performance improvements
   */
  requiresPatchBump(changes: TemplateChange[]): boolean {
    return changes.every(change =>
      change.type === 'fixed' ||
      change.type === 'documentation' ||
      change.type === 'performance'
    );
  }

  calculateNextVersion(current: TemplateVersion, changes: TemplateChange[]): TemplateVersion {
    if (this.requiresMajorBump(changes)) {
      return { major: current.major + 1, minor: 0, patch: 0 };
    }
    if (this.requiresMinorBump(changes)) {
      return { major: current.major, minor: current.minor + 1, patch: 0 };
    }
    return { major: current.major, minor: current.minor, patch: current.patch + 1 };
  }
}

interface TemplateChange {
  type: 'added' | 'removed' | 'renamed' | 'deprecated' | 'fixed' | 'documentation' | 'performance';
  description: string;
  breaking: boolean;
  affectedSection?: string;
}
```

## Implementation Patterns

### Version Header in Templates

```markdown
---
version: 2.1.0
released: 2025-01-10
compatibility:
  min: 2.0.0
  max: 3.0.0
deprecated: false
---

# Template Name

## Changelog

### 2.1.0 (2025-01-10)
- Added: New integration patterns for cloud providers
- Fixed: Code example syntax errors

### 2.0.0 (2024-12-01)
- Breaking: Renamed `config` section to `configuration`
- Added: Support for TypeScript 5.0
- Removed: Legacy JavaScript examples

### 1.5.0 (2024-10-15)
- Added: Mobile platform support
- Deprecated: `oldMethod()` in favor of `newMethod()`
```

### Version Comparison Utilities

```typescript
class VersionComparator {
  /**
   * Check if version satisfies a range
   * Examples:
   * - "1.0.0" satisfies "^1.0.0" -> true
   * - "2.0.0" satisfies "^1.0.0" -> false
   * - "1.5.0" satisfies ">=1.0.0 <2.0.0" -> true
   */
  satisfies(version: string, range: string): boolean {
    const v = this.parse(version);
    
    // Handle range with space (AND condition)
    if (range.includes(' ')) {
      const parts = range.split(' ').filter(p => p.trim());
      return parts.every(part => this.satisfiesSingle(v, part));
    }
    
    // Handle OR condition with ||
    if (range.includes('||')) {
      const parts = range.split('||').map(p => p.trim());
      return parts.some(part => this.satisfies(version, part));
    }
    
    return this.satisfiesSingle(v, range);
  }

  private satisfiesSingle(version: TemplateVersion, constraint: string): boolean {
    const manager = new TemplateVersionManager();
    return manager.isCompatible(version, constraint);
  }

  private parse(version: string): TemplateVersion {
    const manager = new TemplateVersionManager();
    return manager.parseVersion(version);
  }

  /**
   * Find the highest version that satisfies a constraint
   */
  maxSatisfying(versions: string[], range: string): string | null {
    const satisfying = versions
      .filter(v => this.satisfies(v, range))
      .sort((a, b) => {
        const va = this.parse(a);
        const vb = this.parse(b);
        return new TemplateVersionManager().compareVersions(vb, va);
      });
    
    return satisfying[0] || null;
  }

  /**
   * Find the lowest version that satisfies a constraint
   */
  minSatisfying(versions: string[], range: string): string | null {
    const satisfying = versions
      .filter(v => this.satisfies(v, range))
      .sort((a, b) => {
        const va = this.parse(a);
        const vb = this.parse(b);
        return new TemplateVersionManager().compareVersions(va, vb);
      });
    
    return satisfying[0] || null;
  }
}
```

### Deprecation Management

```typescript
class DeprecationManager {
  private deprecations: Map<string, DeprecationInfo> = new Map();

  deprecateTemplate(templateId: string, info: DeprecationInfo): void {
    this.deprecations.set(templateId, info);
  }

  isDeprecated(templateId: string): boolean {
    return this.deprecations.has(templateId);
  }

  getDeprecationInfo(templateId: string): DeprecationInfo | null {
    return this.deprecations.get(templateId) || null;
  }

  getDeprecationWarning(templateId: string): string | null {
    const info = this.deprecations.get(templateId);
    if (!info) return null;

    let warning = `Template '${templateId}' is deprecated since version ${info.deprecatedAt}.`;
    
    if (info.removalVersion) {
      warning += ` It will be removed in version ${info.removalVersion}.`;
    }
    
    if (info.replacement) {
      warning += ` Use '${info.replacement}' instead.`;
    }

    return warning;
  }

  checkForDeprecations(templateIds: string[]): DeprecationReport {
    const deprecated: DeprecatedTemplateInfo[] = [];
    const warnings: string[] = [];

    for (const id of templateIds) {
      const info = this.deprecations.get(id);
      if (info) {
        deprecated.push({ templateId: id, ...info });
        const warning = this.getDeprecationWarning(id);
        if (warning) warnings.push(warning);
      }
    }

    return {
      hasDeprecations: deprecated.length > 0,
      deprecated,
      warnings
    };
  }
}

interface DeprecatedTemplateInfo extends DeprecationInfo {
  templateId: string;
}

interface DeprecationReport {
  hasDeprecations: boolean;
  deprecated: DeprecatedTemplateInfo[];
  warnings: string[];
}
```

## Integration Points

### Composition Engine Integration

```typescript
class VersionAwareComposition {
  private versionManager: VersionManager;
  private deprecationManager: DeprecationManager;

  async composeWithVersionCheck(
    templateIds: string[],
    versionConstraints: Map<string, string>
  ): Promise<VersionedCompositionResult> {
    const resolvedVersions: Map<string, string> = new Map();
    const warnings: string[] = [];
    const errors: string[] = [];

    for (const templateId of templateIds) {
      const constraint = versionConstraints.get(templateId) || '*';
      const versions = await this.versionManager.getAllVersions(templateId);
      const versionStrings = versions.map(v => this.versionManager.formatVersion(v));
      
      const comparator = new VersionComparator();
      const bestVersion = comparator.maxSatisfying(versionStrings, constraint);
      
      if (!bestVersion) {
        errors.push(`No version of '${templateId}' satisfies constraint '${constraint}'`);
        continue;
      }

      resolvedVersions.set(templateId, bestVersion);

      // Check for deprecations
      if (this.deprecationManager.isDeprecated(templateId)) {
        const warning = this.deprecationManager.getDeprecationWarning(templateId);
        if (warning) warnings.push(warning);
      }
    }

    return {
      success: errors.length === 0,
      resolvedVersions,
      warnings,
      errors
    };
  }
}

interface VersionedCompositionResult {
  success: boolean;
  resolvedVersions: Map<string, string>;
  warnings: string[];
  errors: string[];
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Version Management Properties', () => {
  it('should correctly compare any two valid versions', () => {
    fc.assert(fc.property(
      fc.record({
        major: fc.integer({ min: 0, max: 100 }),
        minor: fc.integer({ min: 0, max: 100 }),
        patch: fc.integer({ min: 0, max: 100 })
      }),
      fc.record({
        major: fc.integer({ min: 0, max: 100 }),
        minor: fc.integer({ min: 0, max: 100 }),
        patch: fc.integer({ min: 0, max: 100 })
      }),
      (v1, v2) => {
        const manager = new TemplateVersionManager();
        const comparison = manager.compareVersions(v1, v2);
        
        // Comparison should be consistent
        const reverseComparison = manager.compareVersions(v2, v1);
        expect(comparison).toBe(-reverseComparison);
        
        // Equal versions should compare to 0
        expect(manager.compareVersions(v1, v1)).toBe(0);
      }
    ));
  });

  it('should satisfy compatible constraint for same major version', () => {
    fc.assert(fc.property(
      fc.integer({ min: 1, max: 10 }),
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 99 }),
      fc.integer({ min: 0, max: 99 }),
      (major, minor1, patch1, minor2, patch2) => {
        const manager = new TemplateVersionManager();
        const version: TemplateVersion = { major, minor: minor1 + minor2, patch: patch1 + patch2 };
        const constraint = `^${major}.${minor1}.${patch1}`;
        
        // Same major version with >= minor.patch should satisfy ^constraint
        expect(manager.isCompatible(version, constraint)).toBe(true);
      }
    ));
  });
});
```

## Configuration Examples

### Versioning Configuration

```yaml
versioning:
  format: "semver"
  
  rules:
    major_bump_triggers:
      - "removed_section"
      - "renamed_parameter"
      - "breaking_change"
    
    minor_bump_triggers:
      - "added_section"
      - "added_parameter"
      - "deprecated_feature"
    
    patch_bump_triggers:
      - "fixed_bug"
      - "documentation_update"
      - "performance_improvement"
  
  deprecation:
    warning_versions_before_removal: 2
    require_replacement: true
    require_migration_guide: true
  
  compatibility:
    default_constraint: "^"
    allow_prerelease: false
```

## Related Templates

- `template-metadata.md` - Metadata management
- `template-dependencies.md` - Dependency management
- `composition-rules.md` - Composition rules
- `template-validation.md` - Validation patterns
