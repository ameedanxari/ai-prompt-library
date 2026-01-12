# Template Parameter Validation

## Purpose

This template provides comprehensive patterns for managing template parameters, including parameter type validation, default value handling, and parameter constraint enforcement across the AI Prompt Library.

## Context

Templates often accept parameters to customize their behavior. Proper parameter validation ensures templates receive valid inputs, provides meaningful error messages, and handles defaults appropriately.

## Core Components

### Parameter Schema

## Examples

```typescript
interface TemplateParameter {
  name: string;
  type: ParameterType;
  description: string;
  required: boolean;
  default?: unknown;
  constraints?: ParameterConstraint[];
  examples?: unknown[];
}

enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  ARRAY = 'array',
  OBJECT = 'object',
  ENUM = 'enum',
  DATE = 'date',
  URL = 'url',
  EMAIL = 'email',
  PATH = 'path'
}

interface ParameterConstraint {
  type: ConstraintType;
  value: unknown;
  message?: string;
}

enum ConstraintType {
  MIN = 'min',
  MAX = 'max',
  MIN_LENGTH = 'minLength',
  MAX_LENGTH = 'maxLength',
  PATTERN = 'pattern',
  ENUM_VALUES = 'enumValues',
  CUSTOM = 'custom'
}


interface ParameterValidationResult {
  valid: boolean;
  errors: ParameterError[];
  warnings: ParameterWarning[];
  resolvedValues: Map<string, unknown>;
}

interface ParameterError {
  parameter: string;
  message: string;
  providedValue?: unknown;
  expectedType?: string;
}

interface ParameterWarning {
  parameter: string;
  message: string;
}
```

### Parameter Validator Service

```typescript
interface ParameterValidator {
  // Validation
  validate(params: Record<string, unknown>, schema: TemplateParameter[]): ParameterValidationResult;
  validateSingle(value: unknown, parameter: TemplateParameter): SingleValidationResult;
  
  // Resolution
  resolveDefaults(params: Record<string, unknown>, schema: TemplateParameter[]): Record<string, unknown>;
  coerceTypes(params: Record<string, unknown>, schema: TemplateParameter[]): Record<string, unknown>;
  
  // Schema Operations
  parseSchema(templateContent: string): TemplateParameter[];
  generateSchema(params: Record<string, unknown>): TemplateParameter[];
}

class TemplateParameterValidator implements ParameterValidator {
  validate(params: Record<string, unknown>, schema: TemplateParameter[]): ParameterValidationResult {
    const errors: ParameterError[] = [];
    const warnings: ParameterWarning[] = [];
    const resolvedValues = new Map<string, unknown>();

    for (const param of schema) {
      const value = params[param.name];
      const hasValue = value !== undefined && value !== null;

      // Check required
      if (param.required && !hasValue) {
        errors.push({
          parameter: param.name,
          message: `Required parameter '${param.name}' is missing`,
          expectedType: param.type
        });
        continue;
      }

      // Use default if not provided
      if (!hasValue && param.default !== undefined) {
        resolvedValues.set(param.name, param.default);
        continue;
      }

      if (!hasValue) {
        continue;
      }

      // Validate type
      const typeResult = this.validateType(value, param.type);
      if (!typeResult.valid) {
        errors.push({
          parameter: param.name,
          message: typeResult.message,
          providedValue: value,
          expectedType: param.type
        });
        continue;
      }

      // Validate constraints
      if (param.constraints) {
        for (const constraint of param.constraints) {
          const constraintResult = this.validateConstraint(value, constraint);
          if (!constraintResult.valid) {
            errors.push({
              parameter: param.name,
              message: constraint.message || constraintResult.message,
              providedValue: value
            });
          }
        }
      }

      resolvedValues.set(param.name, value);
    }

    // Check for unknown parameters
    const knownParams = new Set(schema.map(p => p.name));
    for (const key of Object.keys(params)) {
      if (!knownParams.has(key)) {
        warnings.push({
          parameter: key,
          message: `Unknown parameter '${key}' will be ignored`
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      resolvedValues
    };
  }

  private validateType(value: unknown, type: ParameterType): { valid: boolean; message: string } {
    switch (type) {
      case ParameterType.STRING:
        return {
          valid: typeof value === 'string',
          message: `Expected string, got ${typeof value}`
        };

      case ParameterType.NUMBER:
        return {
          valid: typeof value === 'number' && !isNaN(value),
          message: `Expected number, got ${typeof value}`
        };

      case ParameterType.BOOLEAN:
        return {
          valid: typeof value === 'boolean',
          message: `Expected boolean, got ${typeof value}`
        };

      case ParameterType.ARRAY:
        return {
          valid: Array.isArray(value),
          message: `Expected array, got ${typeof value}`
        };

      case ParameterType.OBJECT:
        return {
          valid: typeof value === 'object' && value !== null && !Array.isArray(value),
          message: `Expected object, got ${typeof value}`
        };

      case ParameterType.URL:
        try {
          new URL(value as string);
          return { valid: true, message: '' };
        } catch {
          return { valid: false, message: 'Invalid URL format' };
        }

      case ParameterType.EMAIL:
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return {
          valid: typeof value === 'string' && emailRegex.test(value),
          message: 'Invalid email format'
        };

      case ParameterType.PATH:
        return {
          valid: typeof value === 'string' && /^[a-zA-Z0-9_\-./]+$/.test(value),
          message: 'Invalid path format'
        };

      case ParameterType.DATE:
        const date = new Date(value as string);
        return {
          valid: !isNaN(date.getTime()),
          message: 'Invalid date format'
        };

      default:
        return { valid: true, message: '' };
    }
  }

  private validateConstraint(value: unknown, constraint: ParameterConstraint): { valid: boolean; message: string } {
    switch (constraint.type) {
      case ConstraintType.MIN:
        return {
          valid: (value as number) >= (constraint.value as number),
          message: `Value must be at least ${constraint.value}`
        };

      case ConstraintType.MAX:
        return {
          valid: (value as number) <= (constraint.value as number),
          message: `Value must be at most ${constraint.value}`
        };

      case ConstraintType.MIN_LENGTH:
        const minLen = constraint.value as number;
        const actualMinLen = typeof value === 'string' ? value.length : (value as unknown[]).length;
        return {
          valid: actualMinLen >= minLen,
          message: `Length must be at least ${minLen}`
        };

      case ConstraintType.MAX_LENGTH:
        const maxLen = constraint.value as number;
        const actualMaxLen = typeof value === 'string' ? value.length : (value as unknown[]).length;
        return {
          valid: actualMaxLen <= maxLen,
          message: `Length must be at most ${maxLen}`
        };

      case ConstraintType.PATTERN:
        const pattern = new RegExp(constraint.value as string);
        return {
          valid: pattern.test(value as string),
          message: `Value must match pattern ${constraint.value}`
        };

      case ConstraintType.ENUM_VALUES:
        const allowedValues = constraint.value as unknown[];
        return {
          valid: allowedValues.includes(value),
          message: `Value must be one of: ${allowedValues.join(', ')}`
        };

      default:
        return { valid: true, message: '' };
    }
  }

  resolveDefaults(params: Record<string, unknown>, schema: TemplateParameter[]): Record<string, unknown> {
    const resolved = { ...params };

    for (const param of schema) {
      if (resolved[param.name] === undefined && param.default !== undefined) {
        resolved[param.name] = param.default;
      }
    }

    return resolved;
  }

  coerceTypes(params: Record<string, unknown>, schema: TemplateParameter[]): Record<string, unknown> {
    const coerced = { ...params };

    for (const param of schema) {
      const value = coerced[param.name];
      if (value === undefined) continue;

      coerced[param.name] = this.coerceValue(value, param.type);
    }

    return coerced;
  }

  private coerceValue(value: unknown, type: ParameterType): unknown {
    if (typeof value === type) return value;

    switch (type) {
      case ParameterType.STRING:
        return String(value);

      case ParameterType.NUMBER:
        const num = Number(value);
        return isNaN(num) ? value : num;

      case ParameterType.BOOLEAN:
        if (value === 'true' || value === '1') return true;
        if (value === 'false' || value === '0') return false;
        return Boolean(value);

      case ParameterType.ARRAY:
        if (typeof value === 'string') {
          try {
            return JSON.parse(value);
          } catch {
            return value.split(',').map(s => s.trim());
          }
        }
        return [value];

      default:
        return value;
    }
  }

  parseSchema(templateContent: string): TemplateParameter[] {
    const parameters: TemplateParameter[] = [];

    // Parse from Variables section
    const variablesMatch = templateContent.match(/##\s+Variables\s*\n([\s\S]*?)(?=\n##|$)/);
    if (variablesMatch) {
      const tableRows = variablesMatch[1].match(/\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|[^|]+\|/g);
      if (tableRows) {
        for (const row of tableRows.slice(2)) { // Skip header and separator
          const cells = row.split('|').map(c => c.trim()).filter(c => c);
          if (cells.length >= 5) {
            parameters.push({
              name: cells[0],
              description: cells[1],
              type: this.parseType(cells[2]),
              required: cells[3].toLowerCase() === 'yes',
              default: cells[4] !== 'N/A' ? this.parseDefault(cells[4], cells[2]) : undefined
            });
          }
        }
      }
    }

    // Parse from inline placeholders
    const placeholders = templateContent.match(/\{\{(\w+)\}\}/g) || [];
    const placeholderNames = new Set(placeholders.map(p => p.replace(/\{\{|\}\}/g, '')));
    
    for (const name of placeholderNames) {
      if (!parameters.find(p => p.name === name)) {
        parameters.push({
          name,
          type: ParameterType.STRING,
          description: `Parameter ${name}`,
          required: true
        });
      }
    }

    return parameters;
  }

  private parseType(typeStr: string): ParameterType {
    const normalized = typeStr.toLowerCase().trim();
    const typeMap: Record<string, ParameterType> = {
      'string': ParameterType.STRING,
      'number': ParameterType.NUMBER,
      'boolean': ParameterType.BOOLEAN,
      'array': ParameterType.ARRAY,
      'object': ParameterType.OBJECT,
      'string[]': ParameterType.ARRAY,
      'url': ParameterType.URL,
      'email': ParameterType.EMAIL,
      'path': ParameterType.PATH,
      'date': ParameterType.DATE
    };
    return typeMap[normalized] || ParameterType.STRING;
  }

  private parseDefault(defaultStr: string, typeStr: string): unknown {
    const type = this.parseType(typeStr);
    
    switch (type) {
      case ParameterType.NUMBER:
        return Number(defaultStr);
      case ParameterType.BOOLEAN:
        return defaultStr.toLowerCase() === 'true';
      case ParameterType.ARRAY:
        try {
          return JSON.parse(defaultStr);
        } catch {
          return defaultStr.split(',').map(s => s.trim());
        }
      default:
        return defaultStr;
    }
  }
}

interface SingleValidationResult {
  valid: boolean;
  error?: string;
  coercedValue?: unknown;
}
```

## Implementation Patterns

### Parameter Schema Definition

```markdown
## Variables

| Variable | Description | Type | Required | Default |
|----------|-------------|------|----------|---------|
| projectName | Name of the project | string | Yes | N/A |
| platform | Target platform | enum | Yes | N/A |
| enableAuth | Enable authentication | boolean | No | true |
| maxUsers | Maximum users | number | No | 1000 |
| features | Enabled features | string[] | No | [] |
```

### Parameter Interpolation

```typescript
class ParameterInterpolator {
  interpolate(template: string, params: Record<string, unknown>): string {
    let result = template;

    // Simple placeholder replacement: {{paramName}}
    result = result.replace(/\{\{(\w+)\}\}/g, (match, paramName) => {
      const value = params[paramName];
      if (value === undefined) {
        return match; // Keep placeholder if not provided
      }
      return this.formatValue(value);
    });

    // Conditional blocks: {{#if paramName}}...{{/if}}
    result = result.replace(/\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, paramName, content) => {
      const value = params[paramName];
      if (value && value !== false && value !== 0 && value !== '') {
        return content;
      }
      return '';
    });

    // Loop blocks: {{#each paramName}}...{{/each}}
    result = result.replace(/\{\{#each\s+(\w+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, paramName, content) => {
      const value = params[paramName];
      if (!Array.isArray(value)) return '';
      
      return value.map((item, index) => {
        let itemContent = content;
        itemContent = itemContent.replace(/\{\{this\}\}/g, this.formatValue(item));
        itemContent = itemContent.replace(/\{\{@index\}\}/g, String(index));
        return itemContent;
      }).join('');
    });

    return result;
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }
}
```

## Integration Points

### Composition Engine Integration

```typescript
class ParameterAwareComposition {
  private validator: ParameterValidator;
  private interpolator: ParameterInterpolator;

  async composeWithParameters(
    templates: TemplateWithParams[],
    globalParams: Record<string, unknown>
  ): Promise<CompositionResult> {
    const results: ProcessedTemplate[] = [];
    const errors: ParameterError[] = [];

    for (const template of templates) {
      // Merge global and template-specific params
      const mergedParams = { ...globalParams, ...template.params };

      // Parse schema from template
      const schema = this.validator.parseSchema(template.content);

      // Validate parameters
      const validation = this.validator.validate(mergedParams, schema);
      
      if (!validation.valid) {
        errors.push(...validation.errors);
        continue;
      }

      // Resolve defaults and interpolate
      const resolvedParams = Object.fromEntries(validation.resolvedValues);
      const processedContent = this.interpolator.interpolate(template.content, resolvedParams);

      results.push({
        templateId: template.id,
        content: processedContent,
        usedParams: resolvedParams
      });
    }

    return {
      success: errors.length === 0,
      templates: results,
      errors
    };
  }
}

interface TemplateWithParams {
  id: string;
  content: string;
  params: Record<string, unknown>;
}

interface ProcessedTemplate {
  templateId: string;
  content: string;
  usedParams: Record<string, unknown>;
}
```

## Testing Considerations

### Property-Based Tests

```typescript
describe('Parameter Validation Properties', () => {
  it('should validate required parameters consistently', () => {
    fc.assert(fc.property(
      fc.record({
        name: fc.string({ minLength: 1, maxLength: 50 }),
        required: fc.boolean()
      }),
      (paramDef) => {
        const validator = new TemplateParameterValidator();
        const schema: TemplateParameter[] = [{
          name: paramDef.name,
          type: ParameterType.STRING,
          description: 'Test parameter',
          required: paramDef.required
        }];

        // Empty params
        const result = validator.validate({}, schema);

        if (paramDef.required) {
          expect(result.valid).toBe(false);
          expect(result.errors.some(e => e.parameter === paramDef.name)).toBe(true);
        } else {
          expect(result.errors.filter(e => e.parameter === paramDef.name)).toHaveLength(0);
        }
      }
    ));
  });

  it('should apply defaults when values are missing', () => {
    fc.assert(fc.property(
      fc.string({ minLength: 1, maxLength: 100 }),
      (defaultValue) => {
        const validator = new TemplateParameterValidator();
        const schema: TemplateParameter[] = [{
          name: 'testParam',
          type: ParameterType.STRING,
          description: 'Test parameter',
          required: false,
          default: defaultValue
        }];

        const result = validator.validate({}, schema);
        
        expect(result.resolvedValues.get('testParam')).toBe(defaultValue);
      }
    ));
  });
});
```

## Configuration Examples

### Parameter Validation Configuration

```yaml
parameter_validation:
  strict_mode: true
  coerce_types: true
  allow_unknown: false
  
  type_coercion:
    string_to_number: true
    string_to_boolean: true
    string_to_array: true
  
  defaults:
    apply_defaults: true
    validate_defaults: true
```

## Related Templates

- `template-metadata.md` - Metadata management
- `template-validation.md` - Template validation
- `composition-rules.md` - Composition rules
- `composition-optimization.md` - Optimization strategies
