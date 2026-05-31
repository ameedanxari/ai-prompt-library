#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildTaskContractReport,
  type TaskContractReport,
} from './task-contract-report.js';
import { parsePlanTaskDirectory } from './task-parser.js';

export function buildTaskContractFile(
  targetDir = 'prompts/outputs/current',
  outPath = path.join(targetDir, 'task-contract.json'),
): TaskContractReport {
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    throw new TaskContractCliError(
      `task contract: target directory does not exist: ${targetDir}`,
      2,
    );
  }

  const files = parsePlanTaskDirectory(targetDir);
  if (files.length === 0) {
    throw new TaskContractCliError(
      `task contract: no tasks-*.md or remediation-*.md in ${targetDir}`,
      2,
    );
  }

  const report = buildTaskContractReport(files, {
    sourceDirectory: targetDir,
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  return report;
}

class TaskContractCliError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number,
  ) {
    super(message);
  }
}

function main(argv: string[]): number {
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
    if (error instanceof TaskContractCliError) {
      console.error(error.message);
      return error.exitCode;
    }
    console.error(error instanceof Error ? error.message : String(error));
    return 2;
  }
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : '';
const currentPath = fileURLToPath(import.meta.url);

if (invokedPath === currentPath) {
  process.exitCode = main(process.argv.slice(2));
}
