#!/usr/bin/env bash
# Step 3 progress checklist.
#
# Scans features-*.md for declared features, checks which
# tasks-<slug>.md files exist on disk, prints a checkbox list with the
# current state. The agent should run this after writing EACH tasks
# file so it knows what remains. The engine forbids advancing past
# Step 3 until every line is `- [x]`.
#
# Usage:
#   bash scripts/step3-progress.sh [prompts/outputs/current]
#
# Exit codes:
#   0  every declared feature has a matching tasks-*.md on disk
#   1  at least one feature is missing its tasks file
#   2  preconditions missing (no features-*.md yet)

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ $TARGET_DIR does not exist" >&2
  exit 2
fi

shopt -s nullglob
feature_files=("$TARGET_DIR"/features-*.md)
if [ ${#feature_files[@]} -eq 0 ]; then
  echo "❌ no features-*.md in $TARGET_DIR — run Step 2 of the engine first" >&2
  exit 2
fi

# Slug rule: lowercase, strip non-alphanumerics (keep spaces and hyphens),
# collapse whitespace to single hyphen, trim leading/trailing hyphens.
slugify() {
  printf "%s" "$1" \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9 -]//g' \
    | tr -s ' ' '-' \
    | sed -E 's/^-+//; s/-+$//'
}

# Gather every feature heading (## <Name>) and its source epic filename.
declared_slugs_file=$(mktemp)
feature_rows_file=$(mktemp)
for ff in "${feature_files[@]}"; do
  epic_base=$(basename "$ff" .md)
  epic_slug="${epic_base#features-}"
  while IFS= read -r line; do
    name=$(printf "%s" "$line" | sed -E 's/^## +//')
    [ -z "$name" ] && continue
    slug=$(slugify "$name")
    [ -z "$slug" ] && continue
    printf "%s\n" "$slug" >> "$declared_slugs_file"
    printf "%s|%s|%s\n" "$epic_slug" "$slug" "$name" >> "$feature_rows_file"
  done < <(grep -E "^## " "$ff" || true)
done

total=$(wc -l < "$declared_slugs_file" | tr -d ' ')
done_count=0
missing_count=0

# Build the checklist, grouped by epic.
echo "# Step 3 Progress"
echo ""
echo "_Generated from disk state; rerun this script any time._"
echo ""

current_epic=""
# Sort so rows are grouped by epic.
sort -t'|' -k1,1 -k3,3 "$feature_rows_file" > "${feature_rows_file}.sorted"
while IFS='|' read -r epic slug name; do
  if [ "$epic" != "$current_epic" ]; then
    [ -n "$current_epic" ] && echo ""
    echo "## $epic"
    current_epic="$epic"
  fi
  task_file="$TARGET_DIR/tasks-$slug.md"
  if [ -f "$task_file" ]; then
    echo "- [x] \`tasks-$slug.md\`  ($name)"
    done_count=$((done_count + 1))
  else
    echo "- [ ] \`tasks-$slug.md\`  ($name)"
    missing_count=$((missing_count + 1))
  fi
done < "${feature_rows_file}.sorted"

echo ""
echo "---"
echo ""
if [ "$total" -gt 0 ]; then
  pct=$((100 * done_count / total))
else
  pct=0
fi
echo "**Progress: $done_count / $total ($pct%)**"
echo ""

rm -f "$declared_slugs_file" "$feature_rows_file" "${feature_rows_file}.sorted"

if [ "$missing_count" -eq 0 ]; then
  echo "✅ Step 3 complete — every declared feature has a tasks file."
  echo "   Next: run \`bash scripts/revise.sh $TARGET_DIR\` to produce"
  echo "   the revise gate report."
  exit 0
else
  echo "⚠️  Step 3 incomplete — $missing_count file(s) still to generate."
  echo "   For each \`- [ ]\` entry above, run drill-down-engine Step 3"
  echo "   scoped to that one feature. After each file you write,"
  echo "   re-run this script to see updated progress."
  echo "   Do NOT advance to the Revise Gate until every line is \`- [x]\`."
  exit 1
fi
