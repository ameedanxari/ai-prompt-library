/**
 * Input Validator
 *
 * Validates and sanitises all inputs entering the agentic runtime
 * to prevent injection, path traversal, and other attack vectors.
 *
 * Validates: Requirements 10.1, 10.2, 10.3
 */

/**
 * Validation result for a single input
 */
export interface InputValidationResult {
  valid: boolean;
  sanitised: string;
  threats: string[];
}

export class InputValidator {
  private blocklist: RegExp[] = [
    /(<script\b[^>]*>[\s\S]*?<\/script>)/gi,          // XSS
    /(;\s*(rm|del|drop|truncate|exec)\s)/gi,            // Command injection
    /(\.\.\/(\.\.\\)*)/g,                                // Path traversal
    /(union\s+select|insert\s+into|delete\s+from)/gi,  // SQL injection
  ];

  /**
   * Validates a string input against known attack patterns
   */
  public validate(input: string): InputValidationResult {
    const threats: string[] = [];
    let sanitised = input;

    for (const pattern of this.blocklist) {
      if (pattern.test(input)) {
        threats.push(`Matched blocklist pattern: ${pattern.source}`);
        sanitised = sanitised.replace(pattern, '[BLOCKED]');
      }
      // Reset regex state
      pattern.lastIndex = 0;
    }

    return { valid: threats.length === 0, sanitised, threats };
  }

  /**
   * Validates a structured object by recursively checking all string values
   */
  public validateObject(obj: Record<string, any>): { valid: boolean; threats: string[] } {
    const threats: string[] = [];

    const walk = (o: any, path: string): void => {
      if (typeof o === 'string') {
        const result = this.validate(o);
        if (!result.valid) {
          threats.push(...result.threats.map(t => `${path}: ${t}`));
        }
      } else if (Array.isArray(o)) {
        o.forEach((item, idx) => walk(item, `${path}[${idx}]`));
      } else if (o && typeof o === 'object') {
        for (const [key, val] of Object.entries(o)) {
          walk(val, `${path}.${key}`);
        }
      }
    };

    walk(obj, '$');
    return { valid: threats.length === 0, threats };
  }

  /**
   * Adds a custom blocklist pattern
   */
  public addPattern(pattern: RegExp): void {
    this.blocklist.push(pattern);
  }
}
