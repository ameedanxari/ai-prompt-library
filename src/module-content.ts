import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { basename, dirname, join } from 'path';

/**
 * Reads a module as a whole: the core brief at `briefPath` plus every
 * expandable detail file alongside it (`<basename>.detail-*.md`, sorted).
 *
 * Long modules are split into a short core brief (the file at the original
 * path) and expandable detail files. Any reader that validates a module's
 * *content* (validators, property tests) must read the brief + details as
 * one unit; readers that only need the cheap overview read the brief alone.
 * When no detail files exist the result is exactly the brief's content.
 */
export function readModuleWithDetails(briefPath: string): string {
  const parts: string[] = [];
  try {
    if (existsSync(briefPath) && statSync(briefPath).isFile()) {
      parts.push(readFileSync(briefPath, 'utf-8'));
    }
  } catch {
    // fall through: no brief content
  }
  let details: string[] = [];
  try {
    const dir = dirname(briefPath);
    const base = basename(briefPath, '.md');
    details = readdirSync(dir)
      .filter((f) => f.startsWith(`${base}.detail-`) && f.endsWith('.md'))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      );
  } catch {
    // fall through: no detail files
  }
  for (const d of details) {
    try {
      parts.push(readFileSync(join(dirname(briefPath), d), 'utf-8'));
    } catch {
      // skip unreadable detail files
    }
  }
  return parts.join('\n');
}

/**
 * Lists the expandable detail files for a module brief (sorted), or [] when
 * the module has not been split. Useful for budget accounting and audits.
 */
export function listModuleDetailFiles(briefPath: string): string[] {
  try {
    const dir = dirname(briefPath);
    const base = basename(briefPath, '.md');
    return readdirSync(dir)
      .filter((f) => f.startsWith(`${base}.detail-`) && f.endsWith('.md'))
      .sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }),
      )
      .map((f) => join(dir, f));
  } catch {
    return [];
  }
}
