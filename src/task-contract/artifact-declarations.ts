import * as path from 'node:path';
/** Bounded omission detector, never a staging authority or shell interpreter.
 * Package-relative references must have a unique matching declared suffix. */
export function undeclaredTestTargets(command: string | undefined, declared: string[]): string[] {
  if (!command) return [];
  const targets = [...command.matchAll(/(?:^|[\s`'"=])((?:\.?\.?\/)?[\w@./-]+\.(?:test|spec)\.[cm]?[jt]sx?)(?=$|[\s`'";,)&|])/g)].map(m => path.posix.normalize(m[1]).replace(/^\.\//, ''));
  return [...new Set(targets)].filter(target => {
    if (target.startsWith('../') || path.posix.isAbsolute(target)) return true;
    const matches = declared.map(p => path.posix.normalize(p).replace(/^\.\//, '')).filter(p => p === target || p.endsWith('/' + target));
    return new Set(matches).size !== 1;
  });
}
