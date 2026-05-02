#!/usr/bin/env bash
# build-path-ledger.sh — derive prompts/outputs/current/path-ledger.md
# from every tasks-*.md / remediation-*.md File: field.
#
# Why this exists: field tests have shown weak executors invent new
# folder paths partway through a run (filter/ vs filters/, classifier/
# vs scanner/), producing dozens of duplicate classes and a non-building
# project. The plan itself is usually consistent — the executor just
# stops consulting it. The ledger gives the executor one authoritative
# file it must read before writing any source file.
#
# The script also refuses to pass when the plan itself declares
# collisions: two tasks naming the same path, or the same basename in
# two different directories of the same platform's source tree (which
# is the duplicate pattern that broke the StorageCleaner field test).
#
# Usage:
#   bash scripts/build-path-ledger.sh [prompts/outputs/current]
#
# Exit codes:
#   0  ledger written, no collisions
#   1  ledger written, collisions detected (listed in output)
#   2  preconditions missing (no plan files at all)

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ $TARGET_DIR does not exist" >&2
  exit 2
fi

shopt -s nullglob
# Use the ${var[@]+"${var[@]}"} guard to keep `set -u` happy on macOS
# bash 3.2 when the arrays are empty (nullglob leaves the array unset
# rather than an empty array there).
tasks_files=("$TARGET_DIR"/tasks-*.md)
remediation_files=("$TARGET_DIR"/remediation-*.md)
plan_files=(
  ${tasks_files[@]+"${tasks_files[@]}"}
  ${remediation_files[@]+"${remediation_files[@]}"}
)

if [ ${#plan_files[@]} -eq 0 ]; then
  echo "❌ no tasks-*.md or remediation-*.md in $TARGET_DIR — run an engine first" >&2
  exit 2
fi

LEDGER="$TARGET_DIR/path-ledger.md"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Extract one row per task: feature-slug|task-id|path
# The task-id is the nearest preceding "## T<n>" or "## R<n>" heading.
rows_file=$(mktemp)
for pf in "${plan_files[@]}"; do
  base=$(basename "$pf" .md)
  # tasks-<slug>.md → <slug>; remediation-<slug>.md → <slug>
  slug="${base#tasks-}"
  slug="${slug#remediation-}"
  awk -v slug="$slug" '
    /^## [TR][0-9]+/ {
      # Grab the task id (T1, R2, …)
      match($0, /[TR][0-9]+/)
      if (RSTART) {
        tid = substr($0, RSTART, RLENGTH)
      } else {
        tid = "?"
      }
      next
    }
    /\*\*File:\*\*/ {
      line = $0
      # Strip backticks if the path is wrapped (`path`) and any leading
      # "- **File:**" prefix, collapse trailing whitespace.
      sub(/.*\*\*File:\*\*[[:space:]]*/, "", line)
      gsub(/`/, "", line)
      sub(/[[:space:]]+$/, "", line)
      # Skip N/A, none, TBD, obvious non-paths. macOS awk does not
      # support the /re/i flag, so normalise with tolower() first.
      lower = tolower(line)
      if (line == "" || lower == "n/a" || lower == "none" || lower == "tbd" || line == "—") next
      # Handle pipe-separated cross-platform paths (Phase 7):
      # e.g. "ios/StorageCleaner/Foo.swift | android/app/.../Foo.kt"
      # Split on " | " and emit one row per platform path.
      n = split(line, parts, /[[:space:]]*\|[[:space:]]*/)
      for (i = 1; i <= n; i++) {
        p = parts[i]
        # Strip any remaining leading/trailing whitespace per segment.
        gsub(/^[[:space:]]+|[[:space:]]+$/, "", p)
        # Skip empty segments or segments that still look like prose.
        if (p == "") continue
        if (p ~ /[[:space:]]/) continue
        printf("%s|%s|%s\n", slug, tid, p)
      }
    }
  ' "$pf" >> "$rows_file"
done

total_paths=$(wc -l < "$rows_file" | tr -d ' ')

# ---- Collision detection ----------------------------------------------
#
# Collision A: the same path is claimed by two different (slug, tid)
# pairs. This is the "two tasks write the same file" case.
collision_a=$(awk -F'|' '{
  key = $3
  pairs[key] = pairs[key] ? pairs[key]"; "$1":"$2 : $1":"$2
  count[key]++
} END {
  for (k in count) if (count[k] > 1) print k"\t"pairs[k]
}' "$rows_file" | sort)

# Collision B: the same basename is declared in two different
# directories under the same platform root (android/, ios/, src/,
# backend/, frontend/, infrastructure/), AND both paths share an
# architectural role. This is the filter/ vs filters/ case that broke
# the StorageCleaner field test.
#
# We bucket each path into an architectural role so that legitimate
# pairs — a data class under models/ alongside a behaviour class of
# the same name under storage/ or ui/, or a main source file and a
# test of the same name — are NOT flagged as collisions. Only
# same-role variants trip the detector.
#
#   models    — path contains /models/ or /Models/
#   tests     — path contains /test/, /Test/, /tests/, /Tests/,
#               /androidTest/, /UITests/
#   prod      — everything else (the default role)
#
# Two paths collide only when (platform-root, basename, role) all match
# but the directory differs.
# Collision B applies to SOURCE CODE files only. Asset trees (screenshots,
# fastlane metadata, localization strings) legitimately reuse basenames
# across device/locale/size directories — those are not collisions, they
# are per-variant artifacts. Limiting the detector to code extensions
# keeps false positives out.
collision_b=$(awk -F'|' '
  function role(p) {
    if (p ~ /\/([Mm]odels)\//) return "models"
    if (p ~ /\/([Tt]ests?|androidTest|UITests)\//) return "tests"
    return "prod"
  }
  function is_source(p) {
    return p ~ /\.(kt|swift|ts|tsx|js|jsx|py|go|java|rs|rb|cs|cpp|c|h|hpp|mm|m|php|sol)$/
  }
  {
    path = $3
    if (!is_source(path)) next
    n = split(path, segs, "/")
    if (n < 2) next
    root = segs[1]
    basename = segs[n]
    dir = path; sub("/"basename"$", "", dir)
    r = role(path)
    key = root"|"basename"|"r
    if (seen[key] && seen[key] != dir) {
      printf("%s\t(%s role in both %s and %s)\n", basename, r, seen[key], dir)
    }
    seen[key] = dir
  }
' "$rows_file" | sort -u)

has_collisions=0
if [ -n "$collision_a" ] || [ -n "$collision_b" ]; then
  has_collisions=1
fi

# ---- Write the ledger -------------------------------------------------
{
  echo "---"
  echo "generated_at: $NOW"
  echo "generated_by: scripts/build-path-ledger.sh"
  echo "plan_files: ${#plan_files[@]}"
  echo "total_paths: $total_paths"
  if [ $has_collisions -eq 0 ]; then
    echo "collisions: 0"
    echo "ledger_state: clean"
  else
    a_count=0
    b_count=0
    [ -n "$collision_a" ] && a_count=$(printf "%s\n" "$collision_a" | wc -l | tr -d ' ')
    [ -n "$collision_b" ] && b_count=$(printf "%s\n" "$collision_b" | wc -l | tr -d ' ')
    echo "collisions: $((a_count + b_count))"
    echo "ledger_state: collisions_detected"
  fi
  echo "---"
  echo ""
  echo "# Canonical File Paths"
  echo ""
  echo "_Derived from every \`**File:**\` field in \`tasks-*.md\` /"
  echo "\`remediation-*.md\`. **Read this before writing any source file.**"
  echo "If the path you are about to write is not listed here, stop:_"
  echo ""
  echo "1. Check whether a close variant IS listed (e.g. \`filter/\` vs"
  echo "   \`filters/\`, \`classifier/\` vs \`scanner/\`). If yes, the"
  echo "   canonical name is the one in the ledger — use it."
  echo "2. If no variant is listed, the plan does not own that path."
  echo "   Do not invent one. Open the source \`tasks-*.md\`, decide whether"
  echo "   the path was genuinely missing, and update the plan before"
  echo "   writing code."
  echo ""

  if [ $has_collisions -ne 0 ]; then
    echo "## ⚠️  Plan collisions detected"
    echo ""
    echo "The plan itself is internally inconsistent. Resolve these"
    echo "before the executor starts — each collision is a place where"
    echo "the executor would have to guess, and guesses produce the"
    echo "duplicate-class failures the ledger exists to prevent."
    echo ""
    if [ -n "$collision_a" ]; then
      echo "### Same path claimed by multiple tasks"
      echo ""
      echo '| Path | Tasks |'
      echo '|---|---|'
      while IFS=$'\t' read -r p tasks; do
        [ -z "$p" ] && continue
        echo "| \`$p\` | $tasks |"
      done <<< "$collision_a"
      echo ""
    fi
    if [ -n "$collision_b" ]; then
      echo "### Same basename under two directories (same platform root)"
      echo ""
      echo '| Basename | Conflict |'
      echo '|---|---|'
      while IFS=$'\t' read -r bn detail; do
        [ -z "$bn" ] && continue
        echo "| \`$bn\` | $detail |"
      done <<< "$collision_b"
      echo ""
    fi
    echo "**Fix:** regenerate the offending \`tasks-*.md\` via"
    echo "drill-down-engine Step 3 so both tasks agree on one canonical"
    echo "path. Re-run this script to refresh the ledger."
    echo ""
  fi

  echo "## Paths by feature"
  echo ""
  if [ "$total_paths" -eq 0 ]; then
    echo "_No file paths declared yet._"
  else
    current_slug=""
    # Sort rows by slug then task id then path for a stable ledger.
    sort -t'|' -k1,1 -k2,2 -k3,3 "$rows_file" | while IFS='|' read -r slug tid path; do
      if [ "$slug" != "$current_slug" ]; then
        [ -n "$current_slug" ] && echo ""
        echo "### $slug"
        echo ""
        current_slug="$slug"
      fi
      echo "- \`$path\` — tasks-$slug.md:$tid"
    done
  fi
  echo ""
} > "$LEDGER"

rm -f "$rows_file"

if [ $has_collisions -eq 0 ]; then
  echo "✅ path ledger: clean ($total_paths paths across ${#plan_files[@]} plan files) — wrote $LEDGER"
  exit 0
else
  echo "❌ path ledger: collisions detected — wrote $LEDGER"
  echo ""
  echo "Open $LEDGER and resolve the collisions listed there before"
  echo "running the executor. The collisions are produced by the plan"
  echo "itself — two tasks claiming the same path or basename — and"
  echo "letting the executor run against them will produce duplicate"
  echo "source files that break the build."
  exit 1
fi
