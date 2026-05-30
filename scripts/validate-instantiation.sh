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

# Empty or generic prompt — acceptance that just says "works",
# "tests pass", "no errors", etc. We look at bullet points under an
# **Acceptance:** header.
TAUTOLOGIES='^\s*[-*]\s+(it\s+(works?|passes?|runs?|builds?)|(the\s+|all\s+)?(tests?|everything)\s+pass(es)?|works?|builds?|runs?|no errors?|success(ful)?|done|functional|complete)\s*\.?\s*$'

HOLLOW_PROMPT_PATTERN='(?i)(Component details here|Implementation details for|Implementation guidance here|TODO:|TBD)'
GENERIC_UI_PATTERN='(make it beautiful|beautifully crafted|modern UI|polished UI|nice design|clean design)'
UI_TASK_PATTERN='(^|[^[:alpha:]])(frontend|screen|dashboard|chart|graph|tailwind|design[ -]system|app screen|web app|mobile app|visual design|ui design|ui surface|ui screen|ui component|ui reference|ui-heavy|component library|component inventory|component system|reusable component)([^[:alpha:]]|$)'
UI_EVIDENCE_PATTERN='(ui reference source map|reference source map|existing-style source map|existing style source|screen-fidelity|screen fidelity|design-system|design system|component inventory|token mapping|existing product style is authoritative|existing theme authority|current style source)'
DASHBOARD_PATTERN='(^|[^[:alpha:]])(dashboard|admin panel|analytics console|operational panel)([^[:alpha:]]|$)'
CHART_PATTERN='(^|[^[:alpha:]])(chart|graph|data visualization|visualization)([^[:alpha:]]|$)'
TAILWIND_PATTERN='(^|[^[:alpha:]])tailwind([^[:alpha:]]|$)'
HARDCODED_STYLE_PATTERN='(#[0-9a-fA-F]{3,8}|rgb[a]?\(|hsl[a]?\()'
TOKEN_STYLE_PATTERN='(token|@theme|var\(--|tailwind\.config|theme variable|css variable|designTokens)'
UNRELATED_REDESIGN_PATTERN='(new visual language|unrelated visual|replace the existing theme|replace current theme|from scratch visual system|new unrelated palette|new palette)'
REDESIGN_APPROVAL_PATTERN='(redesign requested|redesign approval|explicit redesign|rebrand|migration approved|user requested redesign|user requested rebrand)'
MOBILE_CLEANUP_PATTERN='(memory cleanup|storage cleanup|storage cleaner|free up space|photo/video cleanup|phone cleanup|cleanup app)'
CAPABILITY_MATRIX_PATTERN='(os capability matrix|capability matrix|iOS Support|Android Support|Fallback Behavior|Store Policy Risk|User-Facing Copy Constraint)'

# User-story line. Each task block must contain a **Closes user story:**
# line that uses the canonical "As a ... I want ... so that ..." form.
USER_STORY_MARKER='^\s*[-*]?\s*\*\*Closes user story:\*\*'
USER_STORY_WELL_FORMED='\*\*Closes user story:\*\*\s+As (a|an|the)\s+.+,\s+I (want|need)\s+.+,\s+so that\s+.+'

# Schema required-field markers (post Phase 6a schema alignment).
# Every task must carry Change type + Test. The validator counts task
# headings (## T<n> or ## R<n>) vs these field markers.
CHANGE_TYPE_MARKER='^\s*[-*]?\s*\*\*Change type:\*\*'
TEST_MARKER='^\s*[-*]?\s*\*\*Test:\*\*'
FILE_MARKER='^\s*[-*]?\s*\*\*File:\*\*'
DEPENDS_MARKER='^\s*[-*]?\s*\*\*Depends on:\*\*'
LOC_MARKER='^\s*[-*]?\s*\*\*Estimated LOC:\*\*'

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
ui_design_gate_needed=0

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

  # 0b-ii. Reverse check — orphan tasks files. A tasks-<slug>.md whose
  # slug does not appear as a feature heading in any features-*.md is a
  # defect: the model either (a) wrote a task file for a feature that
  # was deleted from the features list to game the gate, or (b) named
  # the file with a slug that doesn't match a declared feature. Both
  # cases break traceability — without a feature to trace back to, the
  # executor has no epic → feature → task chain.
  # Tolerated exceptions:
  #  - tasks-screenshots-{ios,android}.md emitted by
  #    scripts/scaffold-screenshot-captures.sh are accepted even if no
  #    matching feature heading exists, because the scaffolder output
  #    is canonical platform-split and the App Store Release Prep epic
  #    is expected to expand into these platform variants.
  orphan=$(comm -13 "$declared" "$produced")
  # Filter tolerated scaffolder output.
  if [ -n "$orphan" ]; then
    orphan=$(printf "%s\n" "$orphan" | awk '
      /^screenshots-(ios|android)$/ { next }
      /^screenshot-captures-(ios|android)$/ { next }
      { print }
    ')
  fi
  if [ -n "$orphan" ]; then
    orphan_count=$(printf "%s\n" "$orphan" | wc -l | tr -d ' ')
    echo "❌ coverage: $orphan_count tasks-<slug>.md file(s) have no matching feature heading"
    echo "   Either the feature was deleted from the features file to game"
    echo "   the gate, or the tasks file is mis-named. Fix by:"
    echo "     - restoring the feature heading in the appropriate"
    echo "       features-<epic>.md file (preferred if the work is real), OR"
    echo "     - deleting the orphan tasks file (if the work is genuinely"
    echo "       out of scope — but then also remove the feature from the"
    echo "       epic and document why in an ADR)."
    echo "   Orphan task files:"
    printf "%s\n" "$orphan" | sed 's/^/   - tasks-/;s/$/.md/'
    fail=1
  fi

  rm -f "$declared" "$produced"
fi

# 0. Required-companion-files check. When plan files exist, two more files
# MUST also exist in the same directory — skipping them is a structural
# defect that blocks execution regardless of per-task validity.
#
# When VALIDATOR_SKIP_GATE_CHECK=1 (revise.sh is the caller), we skip the
# revise-report.md presence check: revise.sh is about to write the file
# from the aggregated validator result, so demanding it exist first is a
# bootstrap paradox.
required_companions=(
  "$TARGET_DIR/external-accounts.md"
)
if [ "${VALIDATOR_SKIP_GATE_CHECK:-0}" != "1" ]; then
  required_companions+=("$TARGET_DIR/revise-report.md")
fi
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

# 0c-ii. Baseline feature-coverage — catches the "delete features to
# game the gate" pattern. For each baseline-epic features file, check
# that the minimum required feature keywords from baseline-task-shapes.md
# are present. These keyword families are intentionally forgiving:
# they accept any reasonable naming the model might pick. A baseline
# epic that truly doesn't apply to the project must declare so via an
# ADR task (see baseline-task-shapes.md §"When a baseline epic is
# genuinely N/A"), not by silently dropping features.
check_baseline_keywords() {
  # $1 = features-<slug>.md path
  # $2 = baseline label (for error messages)
  # $3 = ERE pattern; one required-keyword family per line (separated by |)
  local f="$1" label="$2" patterns="$3"
  [ -f "$f" ] || return 0
  # Concatenate feature headings into a lowercase blob for keyword search.
  local blob
  blob=$(grep -E "^## " "$f" | tr '[:upper:]' '[:lower:]')
  local missing=""
  while IFS= read -r pat; do
    [ -z "$pat" ] && continue
    # Each pattern is an ERE. If none of the feature headings match, flag.
    if ! printf "%s\n" "$blob" | grep -qE "$pat"; then
      # Extract a readable label — strip leading "(" and take everything
      # up to the first "|" or ")". E.g. "(screenshot)" → "screenshot";
      # "(sign|distribut|…)" → "sign".
      local desc
      desc=$(echo "$pat" | sed -E 's/^\(//; s/[|)].*//' | head -c 60)
      [ -z "$desc" ] && desc="$pat"
      missing="$missing\n     - $desc  (pattern: $pat)"
    fi
  done <<< "$patterns"
  if [ -n "$missing" ]; then
    echo "❌ baseline coverage: $label is missing required features"
    echo "   Declared features in $(basename "$f") do not cover these topics:"
    printf "%b\n" "$missing"
    echo "   Restore the missing feature headings (the tasks file for each"
    echo "   will need to follow). See baseline-task-shapes.md §$label."
    echo "   If the whole baseline is genuinely N/A for this project,"
    echo "   declare it via a single ADR task under docs/adr/ — do NOT"
    echo "   silently drop required features one by one."
    fail=1
  fi
}

# The required-keyword families. Each line is an ERE that any ONE
# feature heading in the epic's features file must match.
check_baseline_keywords \
  "$TARGET_DIR/features-app-store-release-prep.md" \
  "App Store Release Prep" \
  "$(cat <<'EOF'
(description|listing|copy|metadata)
(screenshot)
(icon|adaptive)
(privacy.+(label|nutrition|safety)|(label|nutrition|safety).+privacy)
(signing|signed|distribut|provision|keystore|testflight|play.*intern|app.*connect)
EOF
)"

check_baseline_keywords \
  "$TARGET_DIR/features-privacy-pii-compliance.md" \
  "Privacy, PII & compliance" \
  "$(cat <<'EOF'
(consent)
(export)
(delet)
(pii|classif)
EOF
)"

check_baseline_keywords \
  "$TARGET_DIR/features-testing-qa.md" \
  "Testing & QA" \
  "$(cat <<'EOF'
(unit)
(integrat)
(ui.*test|e2e|acceptance)
(coverage)
EOF
)"

check_baseline_keywords \
  "$TARGET_DIR/features-ci-cd-release.md" \
  "CI/CD & release" \
  "$(cat <<'EOF'
(workflow|actions|pipeline)
(lint)
(test)
(version|release|semver)
EOF
)"

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

  # 3b. File field with comma-separated backticked paths — another
  # one-task-per-file violation. Field test #6 surfaced 5 tasks like:
  #     **File:** `android/app/build.gradle.kts`, `ios/Cleaner/Config.xcconfig`
  # which read as "one task writes to two files" — exactly what check 3
  # intends to reject. Check 3's pattern missed it because the model
  # used real paths separated by ", ` " rather than the phrase
  # "(multiple files)". Explicit detection here.
  #
  # Phase 7 exemption: pipe-separated cross-platform paths
  # (`ios/path` | `android/path`) are the canonical format for
  # dual-platform tasks and are NOT a multi-file violation. The pipe
  # represents the SAME logical component on two platforms. Skip
  # detection when exactly 2 backticked paths are separated by " | ".
  multi_backtick=$(awk '
    /^[[:space:]]*-[[:space:]]*\*\*File:\*\*/ || /^[[:space:]]*-[[:space:]]*File:/ {
      # If the line uses the pipe separator for cross-platform paths,
      # exempt it from the multi-backtick check.
      if ($0 ~ /`[^`]+`[[:space:]]*\|[[:space:]]*`[^`]+`/) next
      # Count backticked tokens on this line.
      s = $0
      count = 0
      while (match(s, /`[^`]+`/)) {
        count++
        s = substr(s, RSTART + RLENGTH)
      }
      if (count > 1) printf "%d:%s\n", NR, $0
    }
  ' "$f")
  if [ -n "$multi_backtick" ]; then
    echo "❌ $f: File: field names more than one file path"
    printf "%s\n" "$multi_backtick" | sed 's/^/   /'
    echo "   Each task MUST write to exactly one file. Split this task"
    echo "   into N tasks, one per file, each with its own acceptance"
    echo "   criteria and test."
    echo "   Note: cross-platform paths using the pipe separator"
    echo "   (\`ios/path\` | \`android/path\`) are allowed — they represent"
    echo "   the same logical file on two platforms."
    fail=1
  fi


  # 4b. Hollow prompt detection.
  if grep -niE "$HOLLOW_PROMPT_PATTERN" "$f" >/dev/null 2>&1; then
    echo "❌ $f: hollow prompt detected (contains boilerplate placeholders)"
    grep -niE "$HOLLOW_PROMPT_PATTERN" "$f" | sed 's/^/   /'
    echo "   The prompt MUST contain actual, dissolved guidance from a module."
    echo "   Do NOT bypass Step 3 module loading."
    fail=1
  fi

  # 4. Tautological acceptance bullets.
  if grep -niE "$TAUTOLOGIES" "$f" >/dev/null 2>&1; then
    echo "❌ $f: tautological acceptance criteria (nothing meaningful asserted)"
    grep -niE "$TAUTOLOGIES" "$f" | sed 's/^/   /'
    fail=1
  fi

  # 4c. UI design-quality gate. UI-heavy task/remediation files must
  # carry design evidence before implementation begins. This prevents
  # generic "make it beautiful" prompts, dashboard/chart tasks without
  # real states, and existing-product work that invents a new theme
  # instead of following the audited one.
  if grep -Eiq "$UI_TASK_PATTERN" "$f" && ! echo "$(basename "$f")" | grep -Eiq 'screenshot'; then
    ui_design_gate_needed=1
    if ! grep -Eiq "$UI_EVIDENCE_PATTERN" "$f"; then
      echo "❌ $f: UI-heavy task lacks design evidence"
      echo "   UI tasks must include a UI reference source map, existing-style"
      echo "   source map, screen-fidelity reference, component inventory, token"
      echo "   mapping, or explicit note that existing product style is authoritative."
      echo "   Do not implement screen-level UI from generic taste alone."
      fail=1
    fi

    if grep -Eiq "$GENERIC_UI_PATTERN" "$f"; then
      echo "❌ $f: generic UI styling language detected"
      grep -niE "$GENERIC_UI_PATTERN" "$f" | sed 's/^/   /'
      echo "   Replace generic design adjectives with concrete source-map,"
      echo "   component, token, state, responsive, and accessibility guidance."
      fail=1
    fi

    missing_ui_states=""
    for state in default loading empty error disabled success; do
      if ! grep -Eiq "(^|[^[:alpha:]])${state}([^[:alpha:]]|$)" "$f"; then
        missing_ui_states="$missing_ui_states $state"
      fi
    done
    if [ -n "$missing_ui_states" ]; then
      echo "❌ $f: UI-heavy task missing required state coverage:$missing_ui_states"
      echo "   Include a state matrix for default, loading, empty, error,"
      echo "   disabled, and success before implementation."
      fail=1
    fi

    if grep -Eiq "$TAILWIND_PATTERN" "$f" \
       && grep -Eq "$HARDCODED_STYLE_PATTERN" "$f" \
       && ! grep -Eiq "$TOKEN_STYLE_PATTERN" "$f"; then
      echo "❌ $f: Tailwind task appears to use hardcoded styles without token/theme mapping"
      echo "   Tailwind work must derive colors and spacing from tokens,"
      echo "   @theme variables, CSS variables, designTokens, or the existing"
      echo "   tailwind.config setup."
      fail=1
    fi

    if grep -Eiq "$UNRELATED_REDESIGN_PATTERN" "$f" \
       && ! grep -Eiq "$REDESIGN_APPROVAL_PATTERN" "$f"; then
      echo "❌ $f: existing-product UI task proposes unrelated redesign without approval"
      grep -niE "$UNRELATED_REDESIGN_PATTERN" "$f" | sed 's/^/   /'
      echo "   Existing product theming is authoritative unless the user"
      echo "   explicitly requested redesign, rebrand, or a Tailwind/theme migration."
      fail=1
    fi
  fi

  if grep -Eiq "$DASHBOARD_PATTERN" "$f" && ! echo "$(basename "$f")" | grep -Eiq 'screenshot'; then
    ui_design_gate_needed=1
    missing_dashboard_terms=""
    for term in kpi filter chart table; do
      if ! grep -Eiq "(^|[^[:alpha:]])${term}([^[:alpha:]]|$)" "$f"; then
        missing_dashboard_terms="$missing_dashboard_terms $term"
      fi
    done
    for state in loading empty error; do
      if ! grep -Eiq "(^|[^[:alpha:]])${state}([^[:alpha:]]|$)" "$f"; then
        missing_dashboard_terms="$missing_dashboard_terms $state"
      fi
    done
    if [ -n "$missing_dashboard_terms" ]; then
      echo "❌ $f: dashboard task missing required planning terms:$missing_dashboard_terms"
      echo "   Dashboard tasks must define KPI, filter, chart, table, loading,"
      echo "   empty, and error behavior."
      fail=1
    fi
  fi

  if grep -Eiq "$CHART_PATTERN" "$f" && ! echo "$(basename "$f")" | grep -Eiq 'screenshot'; then
    ui_design_gate_needed=1
    missing_chart_terms=""
    for term in tooltip legend loading empty error; do
      if ! grep -Eiq "(^|[^[:alpha:]])${term}([^[:alpha:]]|$)" "$f"; then
        missing_chart_terms="$missing_chart_terms $term"
      fi
    done
    if [ -n "$missing_chart_terms" ]; then
      echo "❌ $f: chart/graph task missing required planning terms:$missing_chart_terms"
      echo "   Chart/graph tasks must define tooltip, legend, loading, empty,"
      echo "   and error behavior."
      fail=1
    fi
  fi

  if grep -Eiq "$MOBILE_CLEANUP_PATTERN" "$f" && ! grep -Eiq "$CAPABILITY_MATRIX_PATTERN" "$f"; then
    echo "❌ $f: mobile cleanup/storage task lacks an OS capability matrix"
    echo "   Storage, memory cleanup, photo/video cleanup, and free-space"
    echo "   tasks must declare platform support before implementation:"
    echo "   iOS Support, Android Support, Required Permissions, OS API,"
    echo "   Fallback Behavior, User-Facing Copy Constraint, and Store Policy Risk."
    echo "   This prevents promising capabilities the OS or store policy does not allow."
    fail=1
  fi


  # 5. Metadata completeness check (Phase 7 — StorageCleaner field test).
  # Every task file must carry ALL 6 required metadata fields. Missing fields
  # were the #1 schema-alignment defect: 9 of 78 files shipped without any
  # metadata, and the engine never caught it because each field was checked
  # in isolation but the "all present" invariant was never enforced.
  missing_fields=""
  grep -qE "$USER_STORY_MARKER" "$f"     || missing_fields="$missing_fields Closes-user-story"
  grep -qE "$CHANGE_TYPE_MARKER" "$f"    || missing_fields="$missing_fields Change-type"
  grep -qE "$FILE_MARKER" "$f"           || missing_fields="$missing_fields File"
  grep -qE "$DEPENDS_MARKER" "$f"        || missing_fields="$missing_fields Depends-on"
  grep -qE "$TEST_MARKER" "$f"           || missing_fields="$missing_fields Test"
  grep -qE "$LOC_MARKER" "$f"            || missing_fields="$missing_fields Estimated-LOC"
  if [ -n "$missing_fields" ]; then
    echo "❌ $f: missing required metadata field(s):$missing_fields"
    echo "   Every task file MUST carry all 6 metadata fields:"
    echo "     - **Closes user story:** As a <role>, I <want|need> <action>, so that <value>."
    echo "     - **Change type:** <create-new | modify-existing>"
    echo "     - **File:** \`<path>\`"
    echo "     - **Depends on:** <tasks-other.md | none> (reason)"
    echo "     - **Test:** <verification command or steps>"
    echo "     - **Estimated LOC:** <+N | -N | ~N>"
    echo "   Run the Schema Alignment Pass (schema-alignment-pass.md) to inject"
    echo "   the missing fields from the narrative content."
    fail=1
  fi

  # 5b. Cross-platform path check (Phase 7 — StorageCleaner field test).
  # When the project targets multiple platforms (detected from epics.md),
  # task files that touch app source code MUST carry paths for EACH platform
  # using the pipe separator: `ios/path | android/path`.
  # Files that are legitimately single-platform (xcprivacy, CI configs,
  # Fastlane metadata) are exempted by path pattern.
  if [ -f "$TARGET_DIR/epics.md" ]; then
    platforms_line=$(grep -i 'project platforms' "$TARGET_DIR/epics.md" 2>/dev/null | head -n1 || true)
    is_multiplatform=0
    if echo "$platforms_line" | grep -qi 'android' && echo "$platforms_line" | grep -qi 'ios'; then
      is_multiplatform=1
    fi
    if [ $is_multiplatform -eq 1 ]; then
      file_line=$(grep -E "$FILE_MARKER" "$f" | head -n1 || true)
      if [ -n "$file_line" ]; then
        # Exempt legitimately single-target files:
        # - CI/CD: .github/, fastlane/, .swiftlint, detekt
        # - iOS-only: .xcprivacy, .xcassets, .xcodeproj, .plist
        # - Android-only: AndroidManifest.xml
        # - Shared docs: docs/, README
        is_exempt=0
        lower_line=$(echo "$file_line" | tr 'A-Z' 'a-z')
        case "$lower_line" in
          *.github/*|*fastlane/*|*.swiftlint*|*detekt*) is_exempt=1 ;;
          *.xcprivacy*|*.plist*) is_exempt=1 ;;
          *docs/*|*readme*) is_exempt=1 ;;
          *release/*|*tools/*|*scripts/*|*privacy/*|*store-assets/*|*fixtures/*|*test-fixtures/*|*build/reports/*) is_exempt=1 ;;
        esac
        # Check: non-exempt files must have the pipe separator
        if [ $is_exempt -eq 0 ] && ! echo "$file_line" | grep -q '|'; then
          echo "❌ $f: File: field has only one platform path on a multi-platform project"
          echo "   Project targets both iOS and Android. Dual-platform task files should"
          echo "   carry paths for both: \`ios/path\` | \`android/path\`"
          echo "   Shared/release/docs/tooling artifacts are exempt by path pattern."
          echo "   If this file is legitimately single-platform, move it to an exempt"
          echo "   artifact path or split the task by platform with explicit dependencies."
          echo "   Current: $(echo "$file_line" | sed 's/^[[:space:]]*//')"
          fail=1
        fi
      fi
    fi
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

  # 5c-ii. Every `tasks-<slug>.md` referenced in a Depends-on line must
  # exist on disk. Field test #6 surfaced a task that depended on
  # `tasks-progress-tracking-resume.md` — which was the *features* file
  # name, not a tasks file. The executor would have blocked on that
  # chain forever. Collect every backticked-or-bare tasks-<slug>.md
  # reference; flag any that don't resolve.
  dangling_depends=$(awk -v dir="$TARGET_DIR" '
    /^[[:space:]]*[-*]?[[:space:]]*\*\*Depends on:\*\*/ {
      line = $0
      while (match(line, /tasks-[a-z0-9][a-z0-9-]*\.md/)) {
        token = substr(line, RSTART, RLENGTH)
        if (!seen[token]++) refs[token] = NR
        line = substr(line, RSTART + RLENGTH)
      }
    }
    END {
      for (t in refs) {
        cmd = "test -f " dir "/" t
        if (system(cmd) != 0) printf "%d:%s\n", refs[t], t
      }
    }
  ' "$f")
  if [ -n "$dangling_depends" ]; then
    echo "❌ $f: **Depends on:** references tasks-*.md file(s) that do not exist"
    printf "%s\n" "$dangling_depends" | sed 's/^/   /'
    echo "   The referenced task files do not exist in $TARGET_DIR."
    echo "   Common cause: referencing the features file name"
    echo "   (features-<epic>.md) by mistake, or a task file that was"
    echo "   renamed. Fix the reference or generate the missing file."
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
    function is_collapse_text(line) {
      # Collapse language anywhere within a task section body.
      # Matches phrases like "each device", "all locales", "multiple
      # device sizes", "every language", plus the equally-common
      # list-of-axes pattern ("iPhone 6.7\", 6.5\", 5.5\"" or
      # "phone and tablet sizes" — five+ screenshots per size, etc.).
      l = tolower(line)
      if (l ~ /(each|all|every|multiple) [a-z ]*(device|locale|language|size|platform|form factor|frame|scenario|screen)/) return 1
      # "for each size", "for each locale", "for each device" are the
      # giveaway forms in Acceptance bullets.
      if (l ~ /for each (size|locale|language|device|platform|frame|scenario|screen)/) return 1
      # "at least N screenshots are provided" without a specific path
      # is also a collapse signal — it promises N artefacts without
      # splitting them into tasks.
      if (l ~ /at least [0-9]+ screenshots? (are|is) (provided|generated|created|captured)/) return 1
      return 0
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
        # Scan BOTH precise-change and acceptance bullets. Previously
        # we only looked at precise-change; models worked around it by
        # collapsing in acceptance ("At least 5 screenshots are
        # provided for each device size").
        if (is_collapse_text($0)) matched = 1
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
  # If the file is specifically a screenshot-capture task file, it must
  # contain at least one CAPTURE task (File path ending in an image
  # extension). Tooling-only files of that topic fail this check.
  #
  # Scope is intentionally narrow: only filenames containing
  # "screenshot" or task titles containing "screenshot" / "app icon"
  # trigger the check. Other app-store topics (listing copy, store
  # metadata, app-icon generation as a build-time asset pipeline) do
  # not automatically need PNG File fields — they may be text, scripts,
  # or SVG-to-PNG generators.
  fname_lower=$(echo "$f" | tr 'A-Z' 'a-z')
  needs_captures=0
  case "$fname_lower" in
    *screenshot*)
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
      echo "   Tip: generate the full locale × device matrix in one shot:"
      echo "       bash scripts/scaffold-screenshot-captures.sh \\"
      echo "            --target $TARGET_DIR --platform <ios|android> --app-name <AppName>"
      fail=1
    elif case "$fname_lower" in *screenshots*) true ;; *) false ;; esac && [ "$capture_count" -lt 3 ]; then
      # A file specifically named tasks-*screenshots*.md with only 1-2
      # image-File tasks is effectively a collapsed "generate all" task
      # with a single token path. Even the smallest real matrix
      # (2 locales × 2 devices = 4) produces more. Baseline requires
      # per-locale × per-device, so <3 is always wrong.
      echo "❌ $f: screenshot task file has only $capture_count capture task(s) — too few"
      echo "   A screenshot-capture file must carry one task per locale × per"
      echo "   device class. Even a minimal matrix (2 locales × 2 devices) has"
      echo "   4 tasks. This file has $capture_count. That is almost certainly a"
      echo "   single collapsed task with a token path, not the full matrix."
      echo "   Tip: generate the full locale × device matrix in one shot:"
      echo "       bash scripts/scaffold-screenshot-captures.sh \\"
      echo "            --target $TARGET_DIR --platform <ios|android> --app-name <AppName>"
      fail=1
    fi
    if case "$fname_lower" in *screenshots*) true ;; *) false ;; esac && [ "$capture_count" -gt 1 ]; then
      frame_count=$(awk '
        function frame_from_path(token) {
          n = split(token, segs, "/")
          base = segs[n]
          sub(/\.(png|jpg|jpeg|webp|heic|gif|svg)$/, "", base)
          sub(/^[0-9]+[_-]/, "", base)
          return base
        }
        function is_image_path(token) {
          t = tolower(token)
          return (t ~ /\.(png|jpg|jpeg|webp|heic|gif|svg)$/)
        }
        /^[[:space:]]*-[[:space:]]*\*\*File:\*\*/ || /^[[:space:]]*-[[:space:]]*File:/ {
          s = $0
          while (match(s, /`[^`]+`/)) {
            token = substr(s, RSTART + 1, RLENGTH - 2)
            if (is_image_path(token)) {
              frames[frame_from_path(token)] = 1
              break
            }
            s = substr(s, RSTART + RLENGTH)
          }
        }
        END { for (f in frames) count++; print count + 0 }
      ' "$f")
      if [ "$frame_count" -lt 2 ] && ! grep -Eiq 'single-frame-ok|single frame ok|single-frame reference|one-frame reference' "$f"; then
        echo "❌ $f: screenshot matrix covers only one frame/scenario"
        echo "   App-store screenshots must span the store-safe product flow,"
        echo "   not repeat the same screen on every device. Include multiple"
        echo "   frames such as privacy permission, dashboard, smart groups,"
        echo "   swipe review, and cleanup results. If this file is intentionally"
        echo "   a single-frame reference artifact, add a single-frame-ok note"
        echo "   with a concrete reason."
        fail=1
      fi
    fi
  fi
done

# 6c-0. Central UI reference source-map check. Greenfield UI-heavy plans
# need one shared design research artifact unless external input or an
# existing-project audit already supplied authoritative design context.
if [ "$ui_design_gate_needed" -eq 1 ]; then
  has_design_context=0
  if [ -f "$TARGET_DIR/project-context.md" ] && grep -qE '^## Design Context' "$TARGET_DIR/project-context.md"; then
    has_design_context=1
  fi
  if [ -f "$TARGET_DIR/audit-report.md" ] && grep -qiE 'Design system and UI theme|Existing theme authority' "$TARGET_DIR/audit-report.md"; then
    has_design_context=1
  fi
  if [ -f "$TARGET_DIR/ui-reference-source-map.md" ]; then
    has_design_context=1
    missing_cols=""
    for col in "Row ID" "Evidence Row" "Reference Category" "Observed Pattern" "Product Decision" "Non-copy Boundary" "Components Affected" "Tokens Affected" "States Affected" "Responsive Notes" "Accessibility Notes"; do
      if ! grep -q "$col" "$TARGET_DIR/ui-reference-source-map.md"; then
        missing_cols="$missing_cols '$col'"
      fi
    done
    if [ -n "$missing_cols" ]; then
      echo "❌ $TARGET_DIR/ui-reference-source-map.md: missing required source-map column(s):$missing_cols"
      echo "   Greenfield UI source maps must include the full schema so"
      echo "   task prompts can cite reference category, product decision,"
      echo "   non-copy boundary, components, tokens, states, responsive notes,"
      echo "   and accessibility notes."
      fail=1
    fi
    missing_evidence_cols=""
    for col in "Source Type" "Product / File" "Flow / Screen" "URL / Path / Availability" "Inspected At" "Evidence Quality"; do
      if ! grep -q "$col" "$TARGET_DIR/ui-reference-source-map.md"; then
        missing_evidence_cols="$missing_evidence_cols '$col'"
      fi
    done
    if [ -n "$missing_evidence_cols" ]; then
      echo "❌ $TARGET_DIR/ui-reference-source-map.md: missing required reference-evidence column(s):$missing_evidence_cols"
      echo "   Greenfield UI source maps must record inspected reference evidence"
      echo "   (or an explicit research-unavailable rationale), not only broad"
      echo "   reference categories."
      fail=1
    fi
    if ! grep -Eq 'REF-[0-9]+' "$TARGET_DIR/ui-reference-source-map.md" \
       && ! grep -qi 'research-unavailable' "$TARGET_DIR/ui-reference-source-map.md"; then
      echo "❌ $TARGET_DIR/ui-reference-source-map.md: no reference evidence rows found"
      echo "   Add 3-5 inspected references with REF-* row IDs, or record"
      echo "   research-unavailable with a concrete reason and fallback source."
      fail=1
    fi
  fi
  if [ "$has_design_context" -eq 0 ]; then
    echo "❌ UI-heavy plan has no central design context artifact"
    echo "   Add prompts/outputs/current/ui-reference-source-map.md for"
    echo "   greenfield UI planning, or provide project-context.md with a"
    echo "   Design Context / audit-report.md with Existing theme authority."
    echo "   Task-level UI notes are not enough; the run needs one shared"
    echo "   design source map before execution."
    fail=1
  fi
fi

# 6c. DAG cycle detection (Phase 7 — StorageCleaner field test).
# The Depends-on graph must be a DAG. A cycle means the executor would
# deadlock — task A waits for B, B waits for C, C waits for A. This was
# never checked mechanically; the StorageCleaner schema alignment relied
# on a manual Python script to verify acyclicity.
if [ ${#files[@]} -gt 0 ]; then
  dag_result=$(python3 -c "
import sys, os, re
from collections import defaultdict, deque

target_dir = sys.argv[1]
graph = {}
for fn in os.listdir(target_dir):
    if not fn.startswith('tasks-') or not fn.endswith('.md'):
        continue
    deps = []
    with open(os.path.join(target_dir, fn)) as fh:
        for line in fh:
            if '**Depends on:**' in line:
                refs = re.findall(r'tasks-[a-z0-9][a-z0-9-]*\.md', line)
                deps.extend(refs)
                break
    graph[fn] = deps

# Kahn's algorithm
in_degree = defaultdict(int)
adj = defaultdict(list)
all_nodes = set(graph.keys())
for node, deps in graph.items():
    for dep in deps:
        adj[dep].append(node)
        in_degree[node] += 1
        all_nodes.add(dep)

queue = deque([n for n in all_nodes if in_degree[n] == 0])
ordered = []
while queue:
    n = queue.popleft()
    ordered.append(n)
    for nb in adj[n]:
        in_degree[nb] -= 1
        if in_degree[nb] == 0:
            queue.append(nb)

if len(ordered) == len(all_nodes):
    print('ok')
else:
    cycle_nodes = sorted(all_nodes - set(ordered))
    print('cycle:' + ','.join(cycle_nodes))
" "$TARGET_DIR" 2>/dev/null || echo "skip")

  case "$dag_result" in
    ok)
      ;;
    skip)
      echo "⚠️  DAG cycle check skipped (python3 not available)"
      ;;
    cycle:*)
      cycle_list=${dag_result#cycle:}
      echo "❌ dependency cycle detected in Depends-on graph"
      echo "   The following tasks form a cycle — the executor cannot determine"
      echo "   a valid execution order:"
      echo "$cycle_list" | tr ',' '\n' | sed 's/^/   - /'
      echo "   Fix by removing or reversing one dependency in the cycle."
      fail=1
      ;;
  esac
fi

# 7. Cross-file create-new collision detector. If N tasks across all
# tasks-*.md declare **Change type: create-new** for the same File,
# only one of them can actually do so — the executor will error the
# moment the second task tries to create an already-existing file.
# This was field-test #6's most severe defect: 6 tasks all claimed
# create-new for `.github/workflows/ci.yml`, 7 for
# `android/app/build.gradle.kts`, 5 for
# `ios/Cleaner/Cleaner.xcodeproj/project.pbxproj`. The correct shape
# is ONE create-new plus N-1 modify-existing, with Depends-on chained
# so the creator runs first.
if [ ${#files[@]} -gt 0 ]; then
  # Build a tab-separated inventory: <file> <task-title> <File path> <Change type>.
  # One row per task section.
  inventory=$(mktemp)
  for tf in "${files[@]}"; do
    awk -v src="$(basename "$tf")" '
      function emit() {
        if (have_file && have_change) {
          printf "%s\t%s\t%s\t%s\n", src, title, cur_file, cur_change
        }
        have_file = 0; have_change = 0
        cur_file = ""; cur_change = ""
      }
      /^## / {
        emit()
        title = $0
        sub(/^## */, "", title)
        next
      }
      /^[[:space:]]*-[[:space:]]*\*\*File:\*\*/ {
        if (match($0, /`[^`]+`/)) {
          cur_file = substr($0, RSTART + 1, RLENGTH - 2)
          have_file = 1
        }
      }
      /^[[:space:]]*-[[:space:]]*\*\*Change type:\*\*/ {
        ct = $0
        sub(/.*Change type:\*\*[[:space:]]*/, "", ct)
        sub(/[[:space:]].*$/, "", ct)
        cur_change = ct
        have_change = 1
      }
      END { emit() }
    ' "$tf"
  done > "$inventory"

  # Group rows where Change type = create-new by File path; count.
  collision_report=$(awk -F'\t' '
    $4 == "create-new" {
      creators[$3] = creators[$3] "\n   - " $1 " · " $2
      counts[$3]++
    }
    END {
      for (f in counts) {
        if (counts[f] > 1) {
          printf "%s (x%d):%s\n", f, counts[f], creators[f]
        }
      }
    }
  ' "$inventory" | sort)
  rm -f "$inventory"
  if [ -n "$collision_report" ]; then
    echo "❌ create-new collision: multiple tasks declare 'Change type: create-new' for the same file"
    printf "%s\n" "$collision_report" | sed 's/^/   /'
    echo "   Only ONE task can create-new a given file. The rest must be"
    echo "   'Change type: modify-existing' and should Depends-on the"
    echo "   creator task so the executor runs them in order."
    echo "   Example: one 'github-actions-pipeline-setup' task creates"
    echo "   .github/workflows/ci.yml; subsequent android-build-step /"
    echo "   ios-build-step / lint-step tasks modify-existing the file"
    echo "   and depend on the setup task."
    fail=1
  fi
fi

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
