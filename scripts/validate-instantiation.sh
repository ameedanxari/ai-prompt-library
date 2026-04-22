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
USER_STORY_WELL_FORMED='\*\*Closes user story:\*\*\s+As (a|an|the)\s+.+,\s+I (want|need)\s+.+,\s+so that\s+.+'

# Schema required-field markers (post Phase 6a schema alignment).
# Every task must carry Change type + Test. The validator counts task
# headings (## T<n> or ## R<n>) vs these field markers.
CHANGE_TYPE_MARKER='^\s*[-*]?\s*\*\*Change type:\*\*'
TEST_MARKER='^\s*[-*]?\s*\*\*Test:\*\*'

# Depends-on must carry a Reason when not `none`. Both engines require
# this to prevent invented ordering between unrelated tasks.
DEPENDS_NONE='^[[:space:]]*[-*]?[[:space:]]*\*\*Depends on:\*\*[[:space:]]*none[[:space:]]*\.?[[:space:]]*$'
DEPENDS_WITH_REASON='^[[:space:]]*[-*]?[[:space:]]*\*\*Depends on:\*\*.*(reason|because|needs|requires|blocked by|\(|—|-[[:space:]])'

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

# 0b. Feature→task coverage (C2). If features-*.md files exist, every
# feature heading inside them must have a matching tasks-<slug>.md on
# disk. This catches the "agent generated 29 of 161 task files and
# declared done" failure. The slug mapping is lowercase, punctuation
# stripped, whitespace to hyphen.
shopt -s nullglob
feature_files=("$TARGET_DIR"/features-*.md)
if [ ${#feature_files[@]} -gt 0 ]; then
  declared=$(mktemp)
  produced=$(mktemp)
  for ff in "${feature_files[@]}"; do
    grep -E "^## " "$ff" | sed -E 's/^## +//' \
      | tr '[:upper:]' '[:lower:]' \
      | sed -E 's/[^a-z0-9 -]//g' \
      | tr -s ' ' '-' \
      | sed -E 's/^-+//; s/-+$//' \
      >> "$declared"
  done
  sort -u "$declared" -o "$declared"

  for tf in "$TARGET_DIR"/tasks-*.md; do
    base=$(basename "$tf" .md)
    echo "${base#tasks-}"
  done | sort -u > "$produced"

  missing=$(comm -23 "$declared" "$produced")
  if [ -n "$missing" ]; then
    missing_count=$(printf "%s\n" "$missing" | wc -l | tr -d ' ')
    echo "❌ coverage: $missing_count feature(s) declared but have no tasks-<feature>.md"
    echo "   Generate a tasks file for each of these via drill-down Step 3:"
    printf "%s\n" "$missing" | sed 's/^/   - tasks-/;s/$/.md/'
    echo "   Do NOT declare Step 3 complete until every feature has a"
    echo "   matching tasks file. Regenerate via the engine, not by hand."
    fail=1
  fi
  rm -f "$declared" "$produced"
fi

# 0. Required-companion-files check. When plan files exist, two more files
# MUST also exist in the same directory — skipping them is a structural
# defect that blocks execution regardless of per-task validity.
required_companions=(
  "$TARGET_DIR/external-accounts.md"
  "$TARGET_DIR/revise-report.md"
)
for rc in "${required_companions[@]}"; do
  if [ ! -f "$rc" ]; then
    echo "❌ missing required companion: $rc"
    echo "   When remediation-*.md / tasks-*.md exist, the engine must"
    echo "   also produce external-accounts.md (Step 3.5 / 2.5) AND"
    echo "   revise-report.md (Step 4.5 / Revise Gate). Re-run the engine"
    echo "   through to completion — not just Steps 1-3."
    fail=1
  fi
done

# 0d. Greenfield-only: brief-keywords.md must exist alongside epics.md.
# This is the Phase 6c brief-coverage gate. Audit-and-remediate flows
# don't produce epics.md, so the check is scoped to greenfield output.
if [ -f "$TARGET_DIR/epics.md" ]; then
  if [ ! -f "$TARGET_DIR/brief-keywords.md" ]; then
    echo "❌ missing required companion: $TARGET_DIR/brief-keywords.md"
    echo "   Greenfield runs (drill-down-engine) must emit brief-keywords.md"
    echo "   alongside epics.md, listing distinctive terms from the user's"
    echo "   brief with their status (covered|out-of-scope) and where they"
    echo "   land in the plan. Prevents silent dropout of specific"
    echo "   requirements like 'liquid glass' or 'on-device AI/ML'."
    fail=1
  else
    # Every keyword row must have a non-empty Status and Covered-by column.
    # Rows follow the schema: "| keyword | status | covered-by |"
    # with at least 3 non-empty pipe-delimited cells.
    empty_rows=$(awk -F'|' '
      # Skip non-rows, headers, and separator lines.
      /^[[:space:]]*\|/ {
        # Header row has "Keyword" or "Status" text; skip.
        if ($0 ~ /[Kk]eyword|[Ss]tatus/) next
        # Separator row has dashes only.
        if ($0 ~ /^[[:space:]]*\|[[:space:]]*-+[[:space:]]*\|/) next
        # Expect at least 4 fields (empty | keyword | status | rest).
        if (NF < 4) next
        # Trim cells.
        kw = $2; gsub(/^[[:space:]]+|[[:space:]]+$/, "", kw)
        st = $3; gsub(/^[[:space:]]+|[[:space:]]+$/, "", st)
        cv = $4; gsub(/^[[:space:]]+|[[:space:]]+$/, "", cv)
        if (kw == "" || st == "" || cv == "") {
          printf "line %d: %s\n", NR, $0
        } else {
          st_lc = tolower(st)
          if (st_lc != "covered" && st_lc != "out-of-scope") {
            printf "line %d (status must be covered|out-of-scope): %s\n", NR, $0
          }
        }
      }
    ' "$TARGET_DIR/brief-keywords.md")
    if [ -n "$empty_rows" ]; then
      echo "❌ $TARGET_DIR/brief-keywords.md: malformed keyword rows"
      echo "   Each row must follow: | <keyword> | covered|out-of-scope | <covered by epic/feature OR reason> |"
      echo "$empty_rows" | sed 's/^/   /'
      fail=1
    fi
    # Require at least 3 keyword rows — keeps a weak model from shipping
    # an empty 0-row table to satisfy the existence check.
    row_count=$(awk -F'|' '
      /^[[:space:]]*\|/ {
        if ($0 ~ /[Kk]eyword|[Ss]tatus/) next
        if ($0 ~ /^[[:space:]]*\|[[:space:]]*-+[[:space:]]*\|/) next
        if (NF < 4) next
        print
      }
    ' "$TARGET_DIR/brief-keywords.md" | wc -l | tr -d ' ')
    if [ "$row_count" -lt 3 ]; then
      echo "❌ $TARGET_DIR/brief-keywords.md: only $row_count keyword row(s); need >= 3"
      echo "   Most briefs contain many distinctive terms. If the brief is"
      echo "   truly generic, state that at the top of the file."
      fail=1
    fi
  fi
fi

# 0a. revise-report.md must be the canonical script output, not a
# hand-written narrative. The canonical form starts with a YAML
# frontmatter block (--- on line 1) and contains executor_gate: pass.
#
# When invoked from revise.sh itself (VALIDATOR_SKIP_GATE_CHECK=1),
# skip the executor_gate value check — revise.sh is computing the NEW
# gate value from the other checks, so reading the OLD value creates
# a circular dependency (old=fail causes new=fail forever). Still
# enforce the canonical-form (line 1 == "---") check though.
if [ -f "$TARGET_DIR/revise-report.md" ]; then
  first_line=$(head -n 1 "$TARGET_DIR/revise-report.md")
  if [ "$first_line" != "---" ]; then
    echo "❌ revise-report.md is not the canonical form (line 1 must be '---')"
    echo "   This file appears to be a hand-written narrative report."
    echo "   The ONLY valid way to produce revise-report.md is:"
    echo "       bash scripts/revise.sh prompts/outputs/current"
    echo "   Delete the current file and re-run the script."
    fail=1
  elif [ "${VALIDATOR_SKIP_GATE_CHECK:-0}" = "1" ]; then
    # revise.sh is about to rewrite the file — skip tamper checks on
    # the old contents to avoid a circular dependency (old-fail ⇒
    # new-fail forever). The NEW file revise.sh writes next will
    # contain real revised_at and check arrays.
    :
  else
    # Tamper-detection — hand-written files often mimic the YAML shape
    # but have placeholder timestamps and empty check arrays because the
    # writer has no live script output to copy from.
    head -n 30 "$TARGET_DIR/revise-report.md" > /tmp/revise-head.$$

    # 0a-i. `revised_at` must be within the last 48 hours of now OR
    # within 48 hours of the file's mtime. An obvious placeholder like
    # "2025-01-01T00:00:00Z" on a file last-modified today is a tell.
    revised_at=$(awk -F': *' '/^revised_at:/ {print $2; exit}' /tmp/revise-head.$$ | tr -d '[:space:]')
    if [ -z "$revised_at" ]; then
      echo "❌ revise-report.md: missing revised_at in frontmatter"
      echo "   The script writes this field; a hand-written report usually omits it."
      echo "   Delete the file and run: bash scripts/revise.sh prompts/outputs/current"
      fail=1
    else
      # Convert revised_at ISO-8601 to epoch seconds. Use python because
      # `date -d` syntax varies between BSD (macOS) and GNU (Linux).
      revised_epoch=$(python3 -c "
import sys, datetime
try:
    s = '$revised_at'.replace('Z', '+00:00')
    dt = datetime.datetime.fromisoformat(s)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=datetime.timezone.utc)
    print(int(dt.timestamp()))
except Exception:
    print('0')
" 2>/dev/null || echo "0")
      mtime_epoch=$(python3 -c "import os; print(int(os.path.getmtime('$TARGET_DIR/revise-report.md')))" 2>/dev/null || echo "0")
      now_epoch=$(date -u +%s)
      # Allow a 48-hour window relative to mtime (covers legitimate reruns).
      window=172800
      if [ "$revised_epoch" = "0" ]; then
        echo "❌ revise-report.md: revised_at ('$revised_at') is not a parseable ISO-8601 timestamp"
        fail=1
      else
        diff_mtime=$(( mtime_epoch - revised_epoch ))
        if [ $diff_mtime -lt 0 ]; then diff_mtime=$(( -diff_mtime )); fi
        diff_now=$(( now_epoch - revised_epoch ))
        if [ $diff_now -lt 0 ]; then diff_now=$(( -diff_now )); fi
        if [ $diff_mtime -gt $window ] && [ $diff_now -gt $window ]; then
          echo "❌ revise-report.md: revised_at ('$revised_at') is not within 48h of file mtime"
          echo "   This report looks hand-written with a placeholder timestamp."
          echo "   The script writes the real current timestamp; delete and run:"
          echo "       bash scripts/revise.sh prompts/outputs/current"
          fail=1
        fi
      fi
    fi

    # 0a-ii. `checks_passed` + `checks_failed` together must name at
    # least one check (C1, C2, etc.) OR the narrative body must list
    # per-check status. The script always writes real check names; empty
    # `[]` for both is impossible.
    if grep -qE "^checks_passed:[[:space:]]*\[\][[:space:]]*$" /tmp/revise-head.$$ \
       && grep -qE "^checks_failed:[[:space:]]*\[\][[:space:]]*$" /tmp/revise-head.$$ ; then
      echo "❌ revise-report.md: both checks_passed and checks_failed are empty"
      echo "   The script always writes the names of checks it ran (e.g. [C1, C2, C4])."
      echo "   An empty pair here means the report is a hand-written mimic."
      echo "   Delete the file and run: bash scripts/revise.sh prompts/outputs/current"
      fail=1
    fi

    # 0a-iii. executor_gate check.
    # (The enclosing branch only runs when VALIDATOR_SKIP_GATE_CHECK != 1,
    # so we always check the gate value here.)
    if grep -qE "^executor_gate:[[:space:]]*pass[[:space:]]*$" /tmp/revise-head.$$; then
      :  # passes — continue
    else
      gate_line=$(grep -E "^executor_gate:" /tmp/revise-head.$$ | head -n 1 || true)
      echo "❌ revise-report.md: executor_gate is not 'pass'"
      if [ -n "$gate_line" ]; then
        echo "   $gate_line"
      else
        echo "   (no executor_gate line found in frontmatter)"
      fi
      echo "   The plan has a failing check. Regenerate the offending"
      echo "   file(s) named in failing_files, then run:"
      echo "       bash scripts/revise.sh prompts/outputs/current"
      echo "   (the script rewrites this report from live validator state)"
      fail=1
    fi
    rm -f /tmp/revise-head.$$
  fi
fi

# 0c. execution-log.md, when present, must be the canonical executor
# output — YAML frontmatter with session_id, next_task, etc. A
# hand-written "Execution Log - Project Name" narrative is not valid.
if [ -f "$TARGET_DIR/execution-log.md" ]; then
  first_line=$(head -n 1 "$TARGET_DIR/execution-log.md")
  if [ "$first_line" != "---" ]; then
    echo "❌ execution-log.md is not the canonical form (line 1 must be '---')"
    echo "   This file appears to be a hand-written narrative summary."
    echo "   execution-log.md is written by the executor (executor.md),"
    echo "   with a YAML handoff envelope at the top:"
    echo "     ---"
    echo "     session_id: <uuid>"
    echo "     next_task: G1.R1"
    echo "     last_completed_task: null"
    echo "     ..."
    echo "     ---"
    echo "   If the executor has not run yet, delete this file."
    fail=1
  fi
fi

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

  # 4b. Acceptance-bullet count: per schema, each task needs ≥3
  # acceptance bullets. Compact one-line acceptances (common SWE 1.6
  # defect) slip past the tautology check because they're not literally
  # "tests pass" — they just describe everything in one sentence.
  # Scan per task section; count bullets between **Acceptance:** and the
  # next `- **X:**` field or the next `## ` heading.
  sparse_accept=$(awk '
    BEGIN { in_task = 0; task_title = ""; in_accept = 0; bullets = 0 }
    function flush() {
      if (in_task && in_accept_seen && bullets < 3) {
        printf "   %s — only %d acceptance bullet(s) (schema requires >= 3)\n", task_title, bullets
      }
    }
    /^## [RT][0-9]+/ {
      flush()
      in_task = 1; task_title = $0
      in_accept = 0; in_accept_seen = 0; bullets = 0
      next
    }
    /^-[[:space:]]*\*\*Acceptance:\*\*/ { in_accept = 1; in_accept_seen = 1; next }
    /^-[[:space:]]*\*\*/ { in_accept = 0; next }
    /^## / { flush(); in_task = 0; in_accept = 0; next }
    {
      if (in_accept) {
        if ($0 ~ /^[[:space:]]+-[[:space:]]+/) bullets++
      }
    }
    END { flush() }
  ' "$f")
  if [ -n "$sparse_accept" ]; then
    echo "❌ $f: task(s) with fewer than 3 acceptance bullets"
    printf "%s\n" "$sparse_accept"
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

  # 5a. Every task must carry **Change type:** (Phase 6a schema).
  change_type_markers=$(grep -cE "$CHANGE_TYPE_MARKER" "$f" || true)
  if [ "$task_headings" -gt 0 ] && [ "$change_type_markers" -lt "$task_headings" ]; then
    echo "❌ $f: $((task_headings - change_type_markers)) task(s) missing **Change type:** line"
    echo "   Required: **Change type:** create-new | modify-existing | delete | refactor"
    fail=1
  fi

  # 5b. Every task must carry **Test:** (Phase 6a schema).
  test_markers=$(grep -cE "$TEST_MARKER" "$f" || true)
  if [ "$task_headings" -gt 0 ] && [ "$test_markers" -lt "$task_headings" ]; then
    echo "❌ $f: $((task_headings - test_markers)) task(s) missing **Test:** line"
    echo "   Required: **Test:** <path to test> OR <command> — names the verifier"
    fail=1
  fi

  # 5c. `Depends on:` must be either `none` or carry a reason (Phase 6b).
  # A bare task-id list like "T1, T2" is a schema violation — invented
  # ordering without justification is what broke the MenuMaker run.
  # Use awk (no grep -n prefix, so ^ anchor behaves) to collect
  # the offending lines with their line numbers.
  bad_depends=$(awk '
    /^[[:space:]]*[-*]?[[:space:]]*\*\*Depends on:\*\*/ {
      none_match  = ($0 ~ /^[[:space:]]*[-*]?[[:space:]]*\*\*Depends on:\*\*[[:space:]]*none[[:space:]]*\.?[[:space:]]*$/)
      reason_match = ($0 ~ /^[[:space:]]*[-*]?[[:space:]]*\*\*Depends on:\*\*.*(reason|because|needs|requires|blocked by|\(|—|-[[:space:]])/)
      if (!none_match && !reason_match) {
        printf "%d:%s\n", NR, $0
      }
    }
  ' "$f")
  if [ -n "$bad_depends" ]; then
    echo "❌ $f: **Depends on:** lines lack a reason"
    echo "   Rule: when not 'none', a Depends-on line must include a reason"
    echo "   (e.g. parenthetical after the task ids, or an explicit"
    echo "    'Reason: <why this dependency is code-level>' line)."
    echo "   Offending lines:"
    echo "$bad_depends" | sed 's/^/     /'
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
      echo "❌ $f: Closes user story lines must use the canonical form"
      echo "   Required: **Closes user story:** As <a|an|the> <role>, I <want|need> <outcome>, so that <value>."
      echo "   Example:  **Closes user story:** As a user, I want to sign up with email, so that I can save my preferences."
      echo "   Rules:    start with 'As a', 'As an', or 'As the' (infrastructure tasks may use 'As the app' / 'As the developer' / 'As the maintainer'). Use 'I want' or 'I need'. Include the two commas."
      echo "   Tip:      the common \"missing comma before 'so that'\" case is mechanically fixable — run:"
      echo "               bash scripts/fix-user-stories.sh $TARGET_DIR"
      echo "   Offending lines:"
      echo "$bad_stories" | sed 's/^/     /'
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
  # Fires only on CAPTURE tasks (File path ends in an image extension).
  # Tooling tasks — a generator, organizer, or upload script whose File
  # is a source file like .kt / .swift / .sh — legitimately iterate
  # over locales internally and must NOT be flagged.
  # awk receives simple POSIX ERE (no \s, no \b).
  collapse_report=$(awk '
    function is_screenshot_title(line) {
      l = tolower(line)
      return (l ~ /screenshot/ || l ~ /app icon/ || l ~ /app-icon/ || l ~ /store listing/ || l ~ /store-listing/)
    }
    function is_image_file_line(line) {
      # Extract any backticked token, return 1 if any looks like an
      # image asset path (.png/.jpg/.jpeg/.webp/.heic/.gif/.svg).
      s = line
      while (match(s, /`[^`]+`/)) {
        token = tolower(substr(s, RSTART + 1, RLENGTH - 2))
        if (token ~ /\.(png|jpg|jpeg|webp|heic|gif|svg)([[:space:]]|$)/) return 1
        if (token ~ /\.(png|jpg|jpeg|webp|heic|gif|svg)$/) return 1
        s = substr(s, RSTART + RLENGTH)
      }
      return 0
    }
    function is_file_field(line) {
      l = tolower(line)
      return (l ~ /\*\*file:\*\*/ || l ~ /^[[:space:]]*-[[:space:]]*file:/)
    }
    function is_collapse_precise(line) {
      l = tolower(line)
      if (l !~ /precise change/) return 0
      return (l ~ /(each|all|every|multiple) [a-z ]*(device|locale|language|size|platform)/)
    }
    /^## / {
      if (in_sec && matched && captures_image) {
        printf "   %s\n      (capture task collapses multiple locales/devices — split into one task per locale x per device, each producing a single image file)\n", section_title
      }
      in_sec = is_screenshot_title($0) ? 1 : 0
      section_title = $0
      matched = 0
      captures_image = 0
      next
    }
    {
      if (in_sec) {
        if (is_collapse_precise($0)) matched = 1
        if (is_file_field($0) && is_image_file_line($0)) captures_image = 1
      }
    }
    END {
      if (in_sec && matched && captures_image) {
        printf "   %s\n      (capture task collapses multiple locales/devices — split into one task per locale x per device, each producing a single image file)\n", section_title
      }
    }
  ' "$f")
  if [ -n "$collapse_report" ]; then
    echo "❌ $f: screenshot / icon / store-listing capture task collapses multiple locales or devices"
    printf "%s\n" "$collapse_report"
    fail=1
  fi

  # 6b. Screenshot completeness check.
  # If the file name or any task title mentions screenshot work, the
  # file must contain at least one CAPTURE task (File path ending in
  # an image extension). A file of tooling-only tasks cannot satisfy
  # the app-store baseline by itself.
  fname_lower=$(echo "$f" | tr 'A-Z' 'a-z')
  needs_captures=0
  case "$fname_lower" in
    *screenshot*|*app-store*|*store-listing*|*store-metadata*|*app-icon*)
      needs_captures=1
      ;;
  esac
  if [ $needs_captures -eq 0 ]; then
    # Fall back to scanning task titles in the file
    title_screenshot=$(awk '
      /^## / {
        l = tolower($0)
        if (l ~ /screenshot/ || l ~ /app icon/ || l ~ /app-icon/) { print "yes"; exit }
      }
    ' "$f")
    if [ "$title_screenshot" = "yes" ]; then
      needs_captures=1
    fi
  fi
  if [ $needs_captures -eq 1 ]; then
    capture_count=$(awk '
      function is_image_path(token) {
        t = tolower(token)
        return (t ~ /\.(png|jpg|jpeg|webp|heic|gif|svg)$/)
      }
      /^[[:space:]]*-[[:space:]]*\*\*File:\*\*/ || /^[[:space:]]*-[[:space:]]*File:/ {
        s = $0
        while (match(s, /`[^`]+`/)) {
          token = substr(s, RSTART + 1, RLENGTH - 2)
          if (is_image_path(token)) { count++; break }
          s = substr(s, RSTART + RLENGTH)
        }
      }
      END { print count + 0 }
    ' "$f")
    if [ "$capture_count" -eq 0 ]; then
      echo "❌ $f: screenshot / store-listing task file has no capture tasks"
      echo "   A capture task names a specific image file path in its File field"
      echo "   (e.g., \`fastlane/screenshots/en-US/iphone-6.5/1_feature.png\`) and"
      echo "   describes one locale × one device combination. Add one capture"
      echo "   task per locale × per required device class alongside any"
      echo "   tooling tasks. See baseline-task-shapes.md §App-store prep."
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
