#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validatePlanningIntegrity } from '../delivery/planning-integrity.js';
import { resolveDeliveryScope, readDeliveryRequirements, confined, sha256 } from '../delivery/index.js';
import { parsePlanTaskDirectory } from '../task-contract/task-parser.js';
import type { DeliveryStage } from '../delivery/types.js';
export function runPlanningCli(args: string[]): number {
  try {
    if (args.includes('--help')) { console.log('validate-planning-integrity <run-directory> [--stage plan|execute|advance|release] [--target-id ID] [--project-root PATH]'); return 0; }
    const target = path.resolve(args[0] ?? 'prompts/outputs/current');
    if (!fs.statSync(target).isDirectory()) throw new Error('target must be a directory');
    let root = target; let cursor = target;
    while (true) {
      if (['MY_PROJECT.md', '.git', 'AGENTS.md'].some(f => fs.existsSync(path.join(cursor, f)))) { root = cursor; break; }
      const parent = path.dirname(cursor); if (parent === cursor) break; cursor = parent;
    }
    let stage: DeliveryStage = 'execute'; let targetIds: string[] | undefined;
    for (let i = 1; i < args.length; i++) {
      if (args[i] === '--stage' && ['plan','execute','advance','release'].includes(args[i + 1])) stage = args[++i] as DeliveryStage;
      else if (args[i] === '--target-id' && args[i + 1]) targetIds = [...targetIds ?? [], args[++i]];
      else if (args[i] === '--project-root' && args[i + 1]) root = fs.realpathSync(args[++i]);
      else throw new Error(`unknown/incomplete argument ${args[i]}`);
    }
    const scope = resolveDeliveryScope(target);
    if (scope) root = scope.projectRoot;
    if (scope?.manifest.schemaVersion === 2) {
      const actual = scope.manifest.planningInputs!.map(b => {
        const file = confined(root, b.path);
        if (sha256(fs.readFileSync(file)) !== b.sha256) throw new Error(`planning: stale bound artifact ${b.path}`);
        return file;
      }).sort();
      const expected = ['planning-integrity.json','review-findings.json'].map(f => path.join(scope.runDirectory, f)).sort();
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('planning: both current run sidecars must be bound in planningInputs');
    }

    const source = scope ? readDeliveryRequirements(scope) : undefined;
    const declared = scope?.manifest.slices.flatMap(s => s.units) ?? [];
    const files = parsePlanTaskDirectory(target);
    const report = validatePlanningIntegrity({ projectRoot: root, runDirectory: scope?.runDirectory ?? target, stage, targetIds,
      required: scope?.manifest.schemaVersion === 2, originalSources: source?.originalSources, requirementIds: source?.requirements.map(r => r.id),
      knownTargets: scope ? [...scope.manifest.outcomes.map(o => o.id), ...scope.manifest.slices.flatMap(s => [s.id, ...s.units.map(u => u.id)])] : undefined,
      units: files.flatMap(f => f.units.map(u => ({ id: u.canonicalId, filePaths: u.filePaths, test: u.test, nodeIds: declared.find(d => d.id === u.canonicalId)?.planningNodeIds }))),
    });
    console.log(JSON.stringify(report, null, 2)); return report.valid ? 0 : 1;
  } catch (error) { console.error(`PLANNING_CHECKER_FAILED: ${String(error)}`); return 2; }
}
if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) process.exitCode = runPlanningCli(process.argv.slice(2));
