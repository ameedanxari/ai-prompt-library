#!/usr/bin/env bash
#
# fix-user-stories.sh — auto-fix mechanical "Closes user story" violations
#
# The canonical form is:
#     **Closes user story:** As <a|an|the> <role>, I <want|need> <outcome>, so that <value>.
#
# The two commas are mandatory. Weak models frequently emit a line with
# only the first comma, like:
#     As a user, I want to cancel so that I can stop the sync.
# which is missing a comma before "so that". The validator (rule 5 in
# scripts/validate-instantiation.sh) rejects it and the gate fails.
#
# This script scans tasks-*.md and remediation-*.md files in the target
# directory and inserts the missing comma. It touches only lines that:
#   - begin with "- **Closes user story:**"
#   - start with "As a|an|the <role>"
#   - contain "I want" or "I need"
#   - contain " so that " without a preceding comma
#
# Other variants are left alone — the validator will still flag them.
#
# Usage:
#   bash scripts/fix-user-stories.sh <target-dir>
#
# Exit codes:
#   0  files were scanned (whether or not any were modified)
#   1  wrong usage / target dir missing

set -euo pipefail

TARGET_DIR=${1:-prompts/outputs/current}
if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ target directory does not exist: $TARGET_DIR"
  echo "usage: bash scripts/fix-user-stories.sh <dir>"
  exit 1
fi

files_scanned=0
files_modified=0
lines_modified=0

for f in "$TARGET_DIR"/tasks-*.md "$TARGET_DIR"/remediation-*.md; do
  [ -f "$f" ] || continue
  files_scanned=$((files_scanned + 1))

  # Count matching lines before the edit so we can report them.
  before=$(awk '
    /^-[[:space:]]+\*\*Closes user story:\*\*/ {
      if ($0 ~ /As (a|an|the) / && $0 ~ /, I (want|need) / && $0 ~ / so that /) {
        # Look at just the segment from the second ", I " to end; if it has
        # no comma before "so that", this line needs fixing.
        line = $0
        sub(/.*, I (want|need) /, "I XY ", line)
        if (line !~ /,[[:space:]]*so that/ && line ~ /[[:space:]]so that/) n++
      }
    }
    END { print n + 0 }
  ' "$f")

  if [ "$before" -eq 0 ]; then
    continue
  fi

  # Apply the fix with awk (portable across BSD/GNU). Edit in place via
  # a tempfile to avoid sed -i differences.
  tmp=$(mktemp "${TMPDIR:-/tmp}/fix-us.XXXXXX")
  awk '
    /^-[[:space:]]+\*\*Closes user story:\*\*/ {
      if ($0 ~ /As (a|an|the) / && $0 ~ /, I (want|need) /) {
        head_end = match($0, /, I (want|need) /)
        if (head_end > 0) {
          prefix = substr($0, 1, head_end + RLENGTH - 1)
          rest   = substr($0, head_end + RLENGTH)
          sp = match(rest, / so that /)
          if (sp > 0) {
            before = substr(rest, 1, sp - 1)
            after  = substr(rest, sp)
            # Only insert the comma if there isn\''t already one at the end of `before`.
            if (substr(before, length(before), 1) != ",") {
              $0 = prefix before "," after
            }
          }
        }
      }
    }
    { print }
  ' "$f" > "$tmp"

  if ! cmp -s "$f" "$tmp"; then
    mv "$tmp" "$f"
    files_modified=$((files_modified + 1))
    lines_modified=$((lines_modified + before))
    echo "fixed $before line(s) in $f"
  else
    rm -f "$tmp"
  fi
done

echo ""
echo "fix-user-stories: scanned $files_scanned files, modified $files_modified, fixed $lines_modified line(s)"
echo "re-run bash scripts/revise.sh $TARGET_DIR to refresh the gate."
