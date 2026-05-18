#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

failures=0

section() {
  printf '\n%s\n' "$1"
}

fail() {
  printf 'ERROR: %s\n' "$1"
  failures=$((failures + 1))
}

section "Checking Markdown artifacts"

artifact_matches=$(
  git grep -nE '(^|[^[:alnum:]_])(TODO|FIXME|DEBUG|TEMP|XXX)[[:space:]]*(:|-)' -- \
    '*.md' \
    ':!docs/archive/**' \
    ':!prompts/outputs/**' \
    ':!prompts/working_copy/**' || true
)

if [ -n "$artifact_matches" ]; then
  printf '%s\n' "$artifact_matches"
  fail "Found actionable debugging markers in active Markdown"
fi

empty_markdown=$(
  git ls-files '*.md' | while IFS= read -r file; do
    if [ ! -s "$file" ]; then
      printf '%s\n' "$file"
    fi
  done
)

if [ -n "$empty_markdown" ]; then
  printf '%s\n' "$empty_markdown"
  fail "Found empty Markdown files"
fi

if git ls-files '*.md' | sed 's#.*/##' | sort | uniq -d | grep -q .; then
  printf 'WARNING: Found potential duplicate Markdown basenames\n'
fi

section "Checking repository structure"

required_paths=(
  "README.md"
  "docs/optional/PREVENTION_CHECKLIST.md"
  "prompts/orchestrators"
)

for path in "${required_paths[@]}"; do
  if [ ! -e "$path" ]; then
    fail "Missing required path: $path"
  fi
done

section "Checking GitHub Actions versions"

workflow_files=$(git ls-files '.github/workflows/*.yml' '.github/workflows/*.yaml')
if [ -n "$workflow_files" ]; then
  outdated_checkout=$(grep -nE 'uses:[[:space:]]*actions/checkout@v[0-5]([[:space:]#]|$)' $workflow_files || true)
  if [ -n "$outdated_checkout" ]; then
    printf '%s\n' "$outdated_checkout"
    fail "actions/checkout must use v6 or newer for the Node 24 runtime"
  fi
fi

if [ "$failures" -gt 0 ]; then
  printf '\nReview enforcement failed with %s issue(s).\n' "$failures"
  exit 1
fi

printf '\nReview enforcement checks passed.\n'
