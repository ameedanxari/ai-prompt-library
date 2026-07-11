#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { validateSemanticReviewDirectory } from './semantic-review.js';

const [planDirectoryArg, outputArg] = process.argv.slice(2);
if (!planDirectoryArg || !outputArg) {
  process.stderr.write('usage: semantic-review-cli <plan-directory> <output-json>\n');
  process.exit(2);
}

const planDirectory = resolve(planDirectoryArg);
const output = resolve(outputArg);
const report = validateSemanticReviewDirectory(planDirectory);
writeFileSync(output, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
