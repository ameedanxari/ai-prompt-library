#!/usr/bin/env bash
# Validate that task outputs are fully instantiated — no template references
# and no unreplaced placeholders.
set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
PATTERNS=(
  '\.ai-prompts/prompts/'
  '\{\{[^}]+\}\}'
  '<TBD>'
  '\[project name\]'
)

if [ ! -d "$TARGET_DIR" ]; then
  echo "ℹ️  no output directory at $TARGET_DIR — nothing to validate"
  exit 0
fi

shopt -s nullglob
files=("$TARGET_DIR"/tasks-*.md)
if [ ${#files[@]} -eq 0 ]; then
  echo "ℹ️  no tasks-*.md files in $TARGET_DIR — nothing to validate"
  exit 0
fi

fail=0
for f in "${files[@]}"; do
  for pat in "${PATTERNS[@]}"; do
    if grep -nE "$pat" "$f" >/dev/null 2>&1; then
      echo "❌ $f: matches forbidden pattern /$pat/"
      grep -nE "$pat" "$f" | sed 's/^/   /'
      fail=1
    fi
  done
done

if [ $fail -eq 0 ]; then
  echo "✅ all task outputs are fully instantiated"
  exit 0
else
  echo ""
  echo "🚨 incomplete instantiation detected — regenerate the offending task(s)"
  echo "   via drill-down-engine Step 3 with strict dissolution."
  exit 1
fi
