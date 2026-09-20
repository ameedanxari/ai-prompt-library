#!/usr/bin/env bash
# Run the instantiation validator against an engine output directory
# and produce a `revise-report.md` with a machine-parseable YAML
# frontmatter. Used by drill-down-engine / audit-and-remediate as
# the mandatory revise step.
#
# Usage:
#   bash scripts/revise.sh [prompts/outputs/current]
#
# Exit codes:
#   0  validator passed, revise-report.md written with executor_gate: pass
#   1  validator failed, revise-report.md written with executor_gate: fail
#      (re-run the engine for the offending files, then re-invoke revise.sh)
#   2  preconditions missing (no plan files at all, no scripts dir, etc.)

set -uo pipefail

TARGET_DIR="${1:-prompts/outputs/current}"
resolve_script_dir() {
  local source="${BASH_SOURCE[0]}"
  while [ -L "$source" ]; do
    local dir
    dir="$(cd -P "$(dirname "$source")" && pwd)"
    local target
    target="$(readlink "$source")"
    case "$target" in
      /*) source="$target" ;;
      *) source="$dir/$target" ;;
    esac
  done
  cd -P "$(dirname "$source")" && pwd
}
SCRIPT_DIR="$(resolve_script_dir)"
VALIDATOR="$SCRIPT_DIR/validate-instantiation.sh"
PHASE_VALIDATOR="$SCRIPT_DIR/validate-phase-order.sh"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ $TARGET_DIR does not exist" >&2
  exit 2
fi

if [ ! -x "$VALIDATOR" ]; then
  echo "❌ validator not found or not executable: $VALIDATOR" >&2
  exit 2
fi

if [ ! -x "$PHASE_VALIDATOR" ]; then
  echo "❌ phase-order validator not found or not executable: $PHASE_VALIDATOR" >&2
  exit 2
fi

# Infer engine from what's present. The revise-report frontmatter names it.
shopt -s nullglob
remediation_files=("$TARGET_DIR"/remediation-*.md)
tasks_files=("$TARGET_DIR"/tasks-*.md)

if [ ${#remediation_files[@]} -gt 0 ]; then
  engine="audit-and-remediate"
  plan_count=${#remediation_files[@]}
elif [ ${#tasks_files[@]} -gt 0 ]; then
  engine="drill-down-engine"
  plan_count=${#tasks_files[@]}
else
  echo "❌ no remediation-*.md or tasks-*.md in $TARGET_DIR — run an engine first" >&2
  exit 2
fi

REPORT="$TARGET_DIR/revise-report.md"
NOW=$(date -u +%Y-%m-%dT%H:%M:%SZ)

# Run validator, capture both exit code and output.
# Tell the validator not to check revise-report.md's existing gate
# value — we are computing the NEW gate value from the other checks.
# Reading the old value creates a circular fail (see validator 0a).
VAL_OUT_FILE=$(mktemp)
VALIDATOR_SKIP_GATE_CHECK=1 "$VALIDATOR" "$TARGET_DIR" > "$VAL_OUT_FILE" 2>&1
INSTANTIATION_EXIT=$?
{
  echo ""
  echo "=== phase-order validator ==="
  bash "$PHASE_VALIDATOR" "$TARGET_DIR"
} >> "$VAL_OUT_FILE" 2>&1
PHASE_EXIT=$?

VAL_EXIT=0
if [ "$INSTANTIATION_EXIT" -ne 0 ] || [ "$PHASE_EXIT" -ne 0 ]; then
  VAL_EXIT=1
fi

if [ "$VAL_EXIT" -eq 0 ]; then
  gate="pass"
else
  gate="fail"
fi

# Build a YAML-safe list of failing files from the validator output.
# Each "❌ <path>:" line names a failing file. Deduplicate.
# Exclude revise-report.md itself and coverage-gap pseudo-entries —
# coverage-gap file names are captured in a separate block in the body.
failed_files=$(grep -E "^❌ " "$VAL_OUT_FILE" \
  | sed -E 's/^❌ ([^:]+):.*/\1/' \
  | grep -v "revise-report\.md$" \
  | grep -v "missing required companion$" \
  | grep -v "^phase-order$" \
  | grep -v "^coverage$" \
  | sort -u || true)

# Extract the coverage-gap list (indented "- tasks-<slug>.md" bullets
# under the coverage error). These are features without tasks files.
coverage_gaps=$(awk '
  /^❌ coverage:/ { inblk = 1; next }
  inblk && /^   - / { sub(/^   - /, ""); print; next }
  inblk && !/^   / { inblk = 0 }
' "$VAL_OUT_FILE" | sort -u)
failed_yaml="[]"
if [ -n "$failed_files" ]; then
  failed_yaml="["
  first=1
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    base=$(basename "$f")
    if [ $first -eq 1 ]; then
      failed_yaml="${failed_yaml}\"${base}\""
      first=0
    else
      failed_yaml="${failed_yaml}, \"${base}\""
    fi
  done <<< "$failed_files"
  failed_yaml="${failed_yaml}]"
fi

# Build remaining_issues: a machine-readable list of what still fails.
# Each entry is either {file: "<basename>", issue: "<first validator
# complaint for that file>"} or {coverage_gap: "<missing tasks-<slug>.md>"}.
# The agent loop reads this (not the prose body) to decide regenerations.
# Empty ([]) when the gate passes.
build_remaining_issues_yaml() {
  local entries=()
  local f base first_issue
  while IFS= read -r f; do
    [ -z "$f" ] && continue
    base=$(basename "$f")
    first_issue=$(grep -E "^❌ " "$VAL_OUT_FILE" | grep -F -- "${f}:" | head -n 1 \
      | sed -E 's/^❌ [^:]+:[[:space:]]*//' | cut -c1-160)
    first_issue=${first_issue//\\/\\\\}
    first_issue=${first_issue//\"/\\\"}
    [ -z "$first_issue" ] && first_issue="see Validator output section"
    entries+=("  - {file: \"$base\", issue: \"$first_issue\"}")
  done <<< "$failed_files"
  local g
  while IFS= read -r g; do
    [ -z "$g" ] && continue
    entries+=("  - {coverage_gap: \"$g\"}")
  done <<< "$coverage_gaps"
  if [ ${#entries[@]} -eq 0 ]; then
    echo "remaining_issues: []"
  else
    echo "remaining_issues:"
    printf "%s\n" "${entries[@]}"
  fi
}
remaining_issues_yaml=$(build_remaining_issues_yaml)

# Derive machine-readable check names from the captured validator output.
# Each ❌ line maps to the check that emitted it:
#   "❌ coverage:" mentioning feature(s)/tasks-      → C2
#   "❌ coverage:" mentioning gap(s)/remediation-    → C3
#   "❌ baseline coverage:"                          → C5
#   "❌ phase-order:"                                → C11
#   "❌ <path>:" per-file schema complaints          → C4
#   companion / regulated-architecture / task-contract / tamper lines,
#   and anything else with no clean C-number          → the validator script name
# (per the checks_run comment below: script names cover mechanical checks
# with no clean C-number). checks_failed is the sorted unique set;
# checks_passed is the honest checks_run set minus checks_failed.
derive_failed_checks() {
  grep -E "^❌ " "$VAL_OUT_FILE" | awk '
    /^❌ coverage:/ {
      if ($0 ~ /gap\(s\)|remediation-/) print "C3"; else print "C2"; next;
    }
    /^❌ baseline coverage:/ { print "C5"; next; }
    /^❌ phase-order:/ { print "C11"; next; }
    /^❌ (missing required companion|regulated-architecture|task contract|revise-report)/ \
      { print "validate-instantiation.sh"; next; }
    /[Tt]amper/ { print "validate-instantiation.sh"; next; }
    /^❌ [^:]+:/ { print "C4"; next; }
    { print "validate-instantiation.sh"; }
  ' | sort -u || true
}

# Honest checks_run: only checks the two validators invoked above actually
# perform. C2 feature→task coverage, C3 gap→remediation coverage (only
# when gap-list.md exists), C4 task-schema fields, C5 baseline-topic
# markers, C6 external-services manifest, C7 user-story field presence,
# C11 phase fields (instantiation) + phase ordering (phase-order). The
# rest of the C1–C18 taxonomy (epic→feature semantics, platform coverage,
# regression judgment, UI quality, regulated architecture, …) requires
# agent judgment — see the mapping table in
# prompts/orchestrators/revise-outputs.md. The validator script names
# cover the mechanical checks with no clean C-number.
checks_run_list="C2 C4 C5 C6 C7 C11 validate-instantiation.sh validate-phase-order.sh"
if [ -f "$TARGET_DIR/gap-list.md" ]; then
  checks_run_list="C2 C3 C4 C5 C6 C7 C11 validate-instantiation.sh validate-phase-order.sh"
fi
checks_run_yaml=$(printf "%s\n" $checks_run_list | tr ' ' '\n' | sort -u | paste -sd, - | sed 's/,/, /g')

failed_checks=$(derive_failed_checks)
if [ -n "$failed_checks" ]; then
  checks_failed_yaml=$(printf "%s\n" "$failed_checks" | paste -sd, - | sed 's/,/, /g')
  checks_passed_yaml=$(comm -23 \
    <(printf "%s\n" $checks_run_list | tr ' ' '\n' | sort -u) \
    <(printf "%s\n" "$failed_checks" | sort -u) \
    | paste -sd, - | sed 's/,/, /g')
else
  checks_failed_yaml=""
  checks_passed_yaml="$checks_run_yaml"
fi

# Write the report.
{
  echo "---"
  echo "revised_at: $NOW"
  echo "engine: $engine"
  echo "plan_files: $plan_count"
  echo "report_schema_version: 2"
  echo "checks_run: [$checks_run_yaml]"
  if [ "$gate" = "pass" ]; then
    echo "checks_passed: [all]"
    echo "checks_failed: []"
  else
    echo "checks_passed: [$checks_passed_yaml]"
    echo "checks_failed: [$checks_failed_yaml]"
  fi
  echo "regenerations_performed: []"
  echo "$remaining_issues_yaml"
  echo "failing_files: $failed_yaml"
  if [ -n "$coverage_gaps" ]; then
    gap_count=$(printf "%s\n" "$coverage_gaps" | wc -l | tr -d ' ')
    echo "coverage_gap_count: $gap_count"
  else
    echo "coverage_gap_count: 0"
  fi
  echo "executor_gate: $gate"
  echo "---"
  echo ""
  echo "# Revise Report"
  echo ""
  echo "_Generated by \`scripts/revise.sh\` on $NOW._"
  echo ""
  if [ "$gate" = "pass" ]; then
    echo "All validator checks passed. The plan is cleared for execution."
    echo ""
    echo "Next step: invoke \`prompts/orchestrators/executor.md\` —"
    echo "its preflight will re-run this same validator and then"
    echo "start the execution loop."
  else
    failing_count=0
    if [ -n "$failed_files" ]; then
      failing_count=$(printf "%s\n" "$failed_files" | wc -l | tr -d ' ')
    fi
    gap_count=0
    if [ -n "$coverage_gaps" ]; then
      gap_count=$(printf "%s\n" "$coverage_gaps" | wc -l | tr -d ' ')
    fi
    total_fixes=$((failing_count + gap_count))

    if [ $total_fixes -ge 20 ]; then
      echo "## ⚠️  Large defect batch ($total_fixes items) — do NOT fix all at once"
      echo ""
      echo "Fixing >20 files in one agent session burns context before the"
      echo "job is done. This is the failure pattern the library has"
      echo "observed across multiple runs: agent tries to fix everything,"
      echo "loses track mid-way, starts reading non-existent files."
      echo ""
      echo "Work in batches:"
      echo ""
      echo "  1. Pick the FIRST 5 files from one of the sections below."
      echo "  2. Regenerate those 5 via drill-down-engine Step 3, one"
      echo "     feature at a time. Each regeneration must replace the"
      echo "     entire tasks-<feature>.md (or create it if missing)."
      echo "  3. Run: \`bash scripts/revise.sh $TARGET_DIR\`"
      echo "  4. Commit the 5 fixed files to git with a message like"
      echo "     \"fix(plan): regenerate 5 tasks files to satisfy schema\"."
      echo "  5. Repeat from step 1 with the next 5."
      echo ""
      echo "Do NOT try to process this list linearly by reading each file"
      echo "and hand-editing. Regenerate via the engine. See the two"
      echo "sections below for exactly which files need work."
      echo ""
    fi

    if [ -n "$failed_files" ]; then
      echo "## Failing files — files that EXIST but have schema violations"
      echo ""
      echo "These $failing_count file(s) are on disk but fail validation."
      echo "Regenerate each via drill-down-engine Step 3 scoped to that"
      echo "single feature. See \`## Validator output\` below for the"
      echo "specific defect per file. Do NOT hand-edit."
      echo ""
      while IFS= read -r f; do
        [ -z "$f" ] && continue
        echo "- \`$(basename "$f")\`"
      done <<< "$failed_files"
      echo ""
    fi
    if [ -n "$coverage_gaps" ]; then
      echo "## Coverage gaps — files that DO NOT EXIST YET"
      echo ""
      echo "These $gap_count file(s) are features declared in features-*.md"
      echo "but with no tasks-<feature>.md written yet. **Do not attempt"
      echo "to read them** — they do not exist. Step 3 was not run to"
      echo "completion."
      echo ""
      echo "Use the Step 3 progress script (\`bash scripts/step3-progress.sh"
      echo "$TARGET_DIR\`) to work through the list one feature at a time."
      echo "After generating each tasks-<feature>.md, re-run the progress"
      echo "script; when every line is \`- [x]\`, re-run THIS script."
      echo ""
      echo "Missing tasks files:"
      echo ""
      printf "%s\n" "$coverage_gaps" | sed 's/^/- /'
      echo ""
    fi
    echo "## What to do next"
    echo ""
    echo "1. Regenerate every file listed above via drill-down-engine Step 3"
    echo "   (scoped to one feature at a time). Do NOT hand-edit files one"
    echo "   at a time — regenerate the whole tasks-<feature>.md per feature."
    echo "2. Re-run: \`bash scripts/revise.sh $TARGET_DIR\`"
    echo "3. Repeat until this report shows \`executor_gate: pass\`."
    echo ""
    echo "Do NOT edit this report to change executor_gate manually. The"
    echo "next revise.sh run will overwrite it based on the live validator"
    echo "state."
    echo ""
  fi
  echo "## Validator output"
  echo ""
  echo '```'
  cat "$VAL_OUT_FILE"
  echo '```'
} > "$REPORT"

rm -f "$VAL_OUT_FILE"

if [ "$gate" = "pass" ]; then
  echo "✅ revise gate: pass — wrote $REPORT"
  exit 0
else
  echo "❌ revise gate: fail — wrote $REPORT"
  echo ""
  echo "Next steps (in order):"
  echo "  1. Open $REPORT."
  echo "  2. Regenerate every file listed under 'Failing files' or"
  echo "     'Coverage gaps' via the engine's Step 3 — one feature/gap"
  echo "     at a time. Do NOT hand-edit files to patch symptoms."
  echo "  3. Re-run THIS SCRIPT to refresh the report:"
  echo "       bash scripts/revise.sh $TARGET_DIR"
  echo "  4. Repeat until the script prints 'revise gate: pass'."
  echo ""
  echo "Do NOT manually edit executor_gate in the report — the next run"
  echo "of this script overwrites it based on the live validator state."
  exit 1
fi
