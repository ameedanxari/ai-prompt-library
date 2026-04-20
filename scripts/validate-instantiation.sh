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

# Screenshot-collapse detector. A single task that says it creates
# screenshots for multiple device sizes OR multiple locales at once
# violates the baseline-task-shapes "per locale × per device" rule.
# Triggered only on task titles that mention screenshot/store/app-icon.
SCREENSHOT_TASK_TITLE='^##\s+R?T?[0-9]+.*\b(screenshot|store\s+listing|app\s+icon)s?\b'
SCREENSHOT_COLLAPSE_PRECISE='Precise change:.*\b(all|multiple|each|every)\b.*\b(device|locale|size|language)'

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

  # 6a. File-count-mismatch detector: if a task's Acceptance section
  # lists N distinct file paths and N > 1, and the task's File field
  # names only one file, the task is implicitly creating N files
  # — a covert collapse. Scan each task section.
  mismatch_report=$(awk '
    BEGIN { in_task = 0; in_accept = 0; task_title = ""; file_field = ""; accept_paths = ""; paths_n = 0 }
    function flush() {
      # Count distinct paths mentioned in the Accept section that differ
      # from the File field path. If > 1 distinct, flag.
      n = split(accept_paths, arr, ",")
      seen[""] = 1
      distinct = 0
      for (i = 1; i <= n; i++) {
        p = arr[i]
        if (p != "" && p != file_field && !(p in seen)) {
          seen[p] = 1; distinct++
        }
      }
      # Require: File field set, at least 2 distinct extra paths that
      # share the same parent directory shape as File field
      # (reduces false positives on general test references).
      if (file_field != "" && distinct >= 2) {
        printf "   %s\n      File: is one path but Acceptance names %d additional file paths (implicit collapse across files)\n", task_title, distinct
      }
      for (k in seen) delete seen[k]
      accept_paths = ""; distinct = 0
    }
    /^## / {
      if (in_task) flush()
      in_task = 1; in_accept = 0
      task_title = $0; file_field = ""; accept_paths = ""
      next
    }
    /^-[[:space:]]*\*\*File:\*\*/ {
      # Extract backticked path.
      if (match($0, /`[^`]+`/)) {
        file_field = substr($0, RSTART + 1, RLENGTH - 2)
      }
      in_accept = 0
      next
    }
    /^-[[:space:]]*\*\*Acceptance:\*\*/ { in_accept = 1; next }
    /^-[[:space:]]*\*\*/ { in_accept = 0; next }
    {
      if (in_accept) {
        # Only count a bullet when it is asserting that a specific path
        # must EXIST or be CREATED. Avoids false positives where the
        # bullet references a path for context (e.g. "coverage for
        # src/foo.ts increases", "npm test -- tests/foo.test.ts passes").
        l = tolower($0)
        creation_verb = 0
        if (l ~ /file[s]? exist/) creation_verb = 1
        else if (l ~ /(is|are)[[:space:]]+(png|jpg|jpeg|svg|gif|mp4|webm)[[:space:]]+(format|file)/) creation_verb = 1
        else if (l ~ /has[[:space:]]+dimensions/) creation_verb = 1
        else if (l ~ /is[[:space:]]+created/) creation_verb = 1
        else if (l ~ /directory[[:space:]]+contains/) creation_verb = 1
        else if (l ~ /(created|generated|added)[[:space:]]+at/) creation_verb = 1

        if (creation_verb) {
          s = $0
          while (match(s, /`[^`]+`/)) {
            token = substr(s, RSTART + 1, RLENGTH - 2)
            # Only count things that look like file paths with / and an extension.
            if (token ~ /\// && token ~ /\.[a-zA-Z0-9]+$/) {
              accept_paths = accept_paths token ","
            }
            s = substr(s, RSTART + RLENGTH)
          }
        }
      }
    }
    END { if (in_task) flush() }
  ' "$f")
  if [ -n "$mismatch_report" ]; then
    echo "❌ $f: task has File: one path but Acceptance lists multiple file paths"
    printf "%s\n" "$mismatch_report"
    fail=1
  fi

  # 6. Screenshot / app-icon / store-listing collapse detector.
  # Split the file into task sections at each "## " heading. For each
  # section whose heading mentions screenshot/icon/listing, scan the
  # section body for collapse words (each/all/multiple + device/locale/
  # size/language). awk receives simple POSIX ERE (no \s, no \b).
  collapse_report=$(awk '
    function is_screenshot_title(line) {
      l = tolower(line)
      return (l ~ /screenshot/ || l ~ /app icon/ || l ~ /app-icon/ || l ~ /store listing/ || l ~ /store-listing/)
    }
    function is_collapse_precise(line) {
      l = tolower(line)
      # Must be a Precise change line AND mention collapse-words.
      if (l !~ /precise change/) return 0
      return (l ~ /(each|all|every|multiple) [a-z ]*(device|locale|language|size|platform)/)
    }
    /^## / {
      if (in_sec && matched) {
        printf "   %s\n      (collapsed across devices/locales — split per locale x per device)\n", section_title
      }
      in_sec = is_screenshot_title($0) ? 1 : 0
      section_title = $0
      matched = 0
      next
    }
    { if (in_sec && is_collapse_precise($0)) matched = 1 }
    END {
      if (in_sec && matched) {
        printf "   %s\n      (collapsed across devices/locales — split per locale x per device)\n", section_title
      }
    }
  ' "$f")
  if [ -n "$collapse_report" ]; then
    echo "❌ $f: screenshot / icon / store-listing task collapses multiple locales or devices"
    printf "%s\n" "$collapse_report"
    fail=1
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
