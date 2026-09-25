#!/usr/bin/env node
import { realpathSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateSemanticReviewDirectory } from './semantic-review.js';
import {
  TaskContractUsageError,
  toTaskContractError,
} from '../task-contract/errors.js';

const HELP_TEXT = `semantic-review-cli — validate the semantic review reports for a plan directory.

Usage:
  semantic-review-cli <plan-directory> <output-json>

  plan-directory  Directory containing the review/ report files
  output-json     Where to write the validation report JSON

Exit codes:
  0  report written (even when the report contains issues)
  1  unexpected internal error
  2  usage error: missing or invalid arguments
  3  input error: inputs exist but are malformed or unreadable
`;

function main(argv: string[]): number {
  if (argv.includes('--help') || argv.includes('-h')) {
    process.stdout.write(HELP_TEXT);
    return 0;
  }

  const [planDirectoryArg, outputArg] = argv;
  if (!planDirectoryArg || !outputArg) {
    const error = new TaskContractUsageError(
      'usage: semantic-review-cli <plan-directory> <output-json>',
    );
    process.stderr.write(`${error.name}: ${error.message}\n`);
    return error.exitCode;
  }

  try {
    const planDirectory = resolve(planDirectoryArg);
    const output = resolve(outputArg);
    const report = validateSemanticReviewDirectory(planDirectory);
    writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    return 0;
  } catch (error) {
    const typed = toTaskContractError(error);
    process.stderr.write(`${typed.name}: ${typed.message}\n`);
    return typed.exitCode;
  }
}

// Compare real paths: callers can reach this file through a symlinked path
// (macOS $TMPDIR sits under /var, which resolves to /private/var), whereas
// import.meta.url is already real-path resolved by the module loader.
function isEntryPoint(): boolean {
  if (!process.argv[1]) return false;
  try {
    return (
      realpathSync(resolve(process.argv[1])) ===
      realpathSync(fileURLToPath(import.meta.url))
    );
  } catch {
    return false;
  }
}

if (isEntryPoint()) {
  process.exitCode = main(process.argv.slice(2));
}
