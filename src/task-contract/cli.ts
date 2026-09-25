#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildTaskContractReport,
  type TaskContractReport,
} from './task-contract-report.js';
import { parsePlanTaskDirectory } from './task-parser.js';
import {
  TaskContractError,
  TaskContractUsageError,
  toTaskContractError,
} from './errors.js';

export function buildTaskContractFile(
  targetDir = 'prompts/outputs/current',
  outPath = path.join(targetDir, 'task-contract.json'),
): TaskContractReport {
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    throw new TaskContractUsageError(
      `task contract: target directory does not exist: ${targetDir}`,
    );
  }

  const files = parsePlanTaskDirectory(targetDir);
  if (files.length === 0) {
    throw new TaskContractUsageError(
      `task contract: no tasks-*.md or remediation-*.md in ${targetDir}`,
    );
  }

  const report = buildTaskContractReport(files, {
    sourceDirectory: targetDir,
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  return report;
}

const HELP_TEXT = `task-contract-cli — build the canonical machine-readable task contract.

Usage:
  task-contract-cli [target-dir] [output-json]

  target-dir   Directory containing tasks-*.md / remediation-*.md files
               (default: prompts/outputs/current)
  output-json  Where to write task-contract.json
               (default: <target-dir>/task-contract.json)

Exit codes:
  0  report written (even when the report contains issues;
     check summary.blocked / summary.issueCounts in the JSON)
  1  unexpected internal error
  2  usage error: bad arguments, missing target directory, or no task files found
  3  input error: inputs exist but are malformed or unreadable
`;

function main(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  const targetDir = argv[0] ?? 'prompts/outputs/current';
  const outPath = argv[1] ?? path.join(targetDir, 'task-contract.json');

  try {
    const report = buildTaskContractFile(targetDir, outPath);
    const { summary } = report;
    console.log(
      `task contract written: ${outPath} `
      + `(${summary.fileCount} files, `
      + `${summary.taskUnitCount} task units, `
      + `${summary.issueCounts.error} errors, `
      + `${summary.issueCounts.warning} warnings)`,
    );
    return 0;
  } catch (error) {
    const typed = toTaskContractError(error);
    console.error(`${typed.name}: ${typed.message}`);
    return typed.exitCode;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  process.exitCode = main(process.argv.slice(2));
}
