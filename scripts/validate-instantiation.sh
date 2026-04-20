#!/usr/bin/env bash
# Validate that engine outputs are fully instantiated:
#   - no template references or unreplaced placeholders,
#   - File: fields name a single concrete file, not a directory or
#     "multiple files",
#   - acceptance criteria are not tautological ("tests pass", "works").
#
# Scans both greenfield outputs (tasks-*.md from drill-down-engine) and
# gap-closure outputs (remediation-*.md from audit-and-remediate).
set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"

# Whole-file regex patterns that are always forbidden.
GLOBAL_PATTERNS=(
  '\.ai-prompts/prompts/'
  '\{\{[^}]+\}\}'
  '<TBD>'
  '\[project name\]'
)

# Per-line patterns that, when matched on a "File:" line, indicate the
# File field points at a directory or group rather than one file.
FILE_LINE_DIR_PATTERN='^\s*[-*]?\s*\*\*File:\*\*.*`[^`]+/`'
FILE_LINE_MULTI_PATTERN='^\s*[-*]?\s*\*\*File:\*\*.*\((multiple|several|various|all)\b'

# Tautological acceptance criteria — acceptance that just says "works",
# "tests pass", "no errors", etc. We look at bullet points under an
# **Acceptance:** header.
TAUTOLOGIES='^\s*[-*]\s+(it\s+(works?|passes?|runs?|builds?)|(the\s+|all\s+)?(tests?|everything)\s+pass(es)?|works?|builds?|runs?|no errors?|success(ful)?|done|functional|complete)\s*\.?\s*$'

# User-story line. Each task block must contain a **Closes user story:**
# line that uses the canonical "As a ... I want ... so that ..." form.
USER_STORY_MARKER='^\s*[-*]?\s*\*\*Closes user story:\*\*'
USER_STORY_WELL_FORMED='\*\*Closes user story:\*\*\s+As (a|an)\s+.+,\s+I want\s+.+,\s+so that\s+.+'

if [ ! -d "$TARGET_DIR" ]; then
  echo "ℹ️  no output directory at $TARGET_DIR — nothing to validate"
  exit 0
fi

shopt -s nullglob
files=("$TARGET_DIR"/tasks-*.md "$TARGET_DIR"/remediation-*.md)
if [ ${#files[@]} -eq 0 ]; then
  echo "ℹ️  no tasks-*.md or remediation-*.md files in $TARGET_DIR — nothing to validate"
  exit 0
fi

fail=0

for f in "${files[@]}"; do
  # 1. Global forbidden patterns (template refs, placeholders).
  for pat in "${GLOBAL_PATTERNS[@]}"; do
    if grep -nE "$pat" "$f" >/dev/null 2>&1; then
      echo "❌ $f: matches forbidden pattern /$pat/"
      grep -nE "$pat" "$f" | sed 's/^/   /'
      fail=1
    fi
  done

  # 2. File field pointing at a directory (backticked path ending in /).
  if grep -nE "$FILE_LINE_DIR_PATTERN" "$f" >/dev/null 2>&1; then
    echo "❌ $f: File: field points at a directory, not a file"
    grep -nE "$FILE_LINE_DIR_PATTERN" "$f" | sed 's/^/   /'
    fail=1
  fi

  # 3. File field that says "(multiple files ...)" or similar.
  if grep -niE "$FILE_LINE_MULTI_PATTERN" "$f" >/dev/null 2>&1; then
    echo "❌ $f: File: field names a group, not a single file"
    grep -niE "$FILE_LINE_MULTI_PATTERN" "$f" | sed 's/^/   /'
    fail=1
  fi

  # 4. Tautological acceptance bullets.
  if grep -niE "$TAUTOLOGIES" "$f" >/dev/null 2>&1; then
    echo "❌ $f: tautological acceptance criteria (nothing meaningful asserted)"
    grep -niE "$TAUTOLOGIES" "$f" | sed 's/^/   /'
    fail=1
  fi

  # 5. Every task block must carry a well-formed Closes-user-story line.
  # We assume one task per "## " section (after the title-level #). Count
  # task headings vs. user-story markers — any shortfall is a violation.
  task_headings=$(grep -cE "^##\s+(T|R)[0-9]+" "$f" || true)
  story_markers=$(grep -cE "$USER_STORY_MARKER" "$f" || true)
  if [ "$task_headings" -gt 0 ] && [ "$story_markers" -lt "$task_headings" ]; then
    echo "❌ $f: $((task_headings - story_markers)) task(s) missing **Closes user story:** line"
    fail=1
  fi
  # Every Closes user story that IS present must be well-formed.
  if grep -E "$USER_STORY_MARKER" "$f" >/dev/null 2>&1; then
    if ! grep -E "$USER_STORY_WELL_FORMED" "$f" >/dev/null 2>&1; then
      :  # no well-formed line matches — flag below
    fi
    # Flag lines that have the marker but don't match the well-formed shape.
    bad_stories=$(grep -nE "$USER_STORY_MARKER" "$f" | grep -vE "$USER_STORY_WELL_FORMED" || true)
    if [ -n "$bad_stories" ]; then
      echo "❌ $f: Closes user story lines must use 'As a ... I want ... so that ...' form"
      echo "$bad_stories" | sed 's/^/   /'
      fail=1
    fi
  fi
done

if [ $fail -eq 0 ]; then
  echo "✅ all engine outputs are fully instantiated"
  exit 0
else
  echo ""
  echo "🚨 instantiation issues detected — regenerate the offending task(s)."
  echo "   For tasks-*.md: re-run drill-down-engine Step 3 with strict dissolution."
  echo "   For remediation-*.md: re-run audit-and-remediate Step 3; each task"
  echo "   must name ONE concrete file and have non-tautological acceptance."
  exit 1
fi
