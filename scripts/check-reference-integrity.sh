#!/usr/bin/env bash
# check-reference-integrity.sh — grep-based reference sweep for the prompt corpus.
#
# Fails the build when the corpus rots:
#   A. bare prompts/<asset>/ or scripts/<script> refs that should be
#      .ai-prompts/-qualified (installed layout: the library lives at
#      <project>/.ai-prompts/; bare refs resolve to <project>/prompts/,
#      where library assets do not exist).
#   B. docs/ refs (bare or .ai-prompts/-qualified) that do not resolve on disk.
#   C. output filenames whose documented producer never mentions them
#      (output filename with no producer).
#
# Conventions (stated once in prompts/AGENTS.md, "Path convention"):
#   - prompts/outputs/... is NEVER qualified (engine output-path convention;
#     hard rule 2 forbids the .ai-prompts/prompts/ string in generated outputs).
#   - fenced code blocks (``` / ~~~) are example output, never rewritten or flagged.
#   - scripts/<name> is only a library ref when <name> exists under scripts/
#     (generated-app scripts like scripts/dev-setup.sh stay bare).
#   - prompts/outputs/current/** is committed sample data, not corpus: skipped.
set -u
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT" || exit 1
fail=0
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# ---------------------------------------------------------------- files
# Corpus scope: prompts/** + docs/** markdown, scripts/** comments.
# Excludes: prompts/outputs/current/** (sample data), sibling-owned files
# pending their own normalization pass (see ALLOWED_BARE below).
mapfile -t MD_FILES < <(find prompts docs -name '*.md' -not -path 'prompts/outputs/current/*' | sort)
mapfile -t SH_FILES < <(find scripts -name '*.sh' | sort)

# Strip fenced code blocks from stdin (``` / ~~~ fenced regions removed).
strip_fences() {
  awk 'BEGIN{inf=0} /^\s*(`{3,}|~{3,})/{inf=!inf; next} !inf{print}'
}

# Comment lines of shell files (references live in comments, never in code).

# ---------------------------------------------------------------- A. bare refs
# Sibling-owned files whose normalization is tracked elsewhere; their bare
# refs are known and pending, not new rot.
# 2026-09-22: drill-down-engine.md and revise-outputs.md were normalized
# (bare scripts/*.sh and prompts/ refs qualified) and removed from this list.
ALLOWED_BARE="scripts/revise.sh
scripts/validate-instantiation.sh
docs/optional/COMMIT_GUIDELINES.md
docs/canary-promotion-protocol.md"

PROMPT_ASSETS='modules|orchestrators|review|working_copy|steering|security|deployment|desktop|testing|performance|monitoring|ai-native|technology-stacks'
# Top-level category dirs also addressable without the prompts/ prefix
# (e.g. `security/ai-security.md`); same qualification rule applies.
PROMPT_CATS="$PROMPT_ASSETS"

# Build alternation of real script basenames (scripts/<name> only counts
# when the script exists; generated-app scripts stay bare by design).
SCRIPT_NAMES="$(cd scripts || exit 1; find . -maxdepth 2 -name '*.sh' | sed 's|^\./||; s|\.sh$||' | paste -sd'|' -)"

echo "== A. bare prompts//scripts/ refs =="
: > "$work/bare.txt"
scan_bare() { # $1 = file ; reads content lines on stdin, emits file:lineno:match
  local f="$1"
  grep -n -o -E '(^|[^.a-zA-Z0-9_/-])prompts/('"$PROMPT_ASSETS"')/' /dev/stdin \
    | sed "s|^|${f}:|" >> "$work/bare.txt"
  grep -n -o -E '(^|[^.a-zA-Z0-9_/-])prompts/(AGENTS\.md|README\.md)' /dev/stdin \
    | sed "s|^|${f}:|" >> "$work/bare.txt"
  # bare <category>/<file>.md without the prompts/ prefix (prompts-root-relative
  # shorthand); only a violation when the target exists under prompts/
  grep -n -o -E '(^|[^.a-zA-Z0-9_/-])('"$PROMPT_CATS"')/[a-zA-Z0-9_./-]+\.md' /dev/stdin \
    | while IFS= read -r hit; do
        ref="$(printf '%s' "$hit" | grep -o -E '('"$PROMPT_CATS"')/[a-zA-Z0-9_./-]+\.md')"
        if [ -n "$ref" ] && [ -e "$REPO_ROOT/prompts/$ref" ]; then
          printf '%s:%s\n' "$f" "$hit" >> "$work/bare.txt"
        fi
      done
  grep -n -o -E '(^|[^.a-zA-Z0-9_/-])scripts/('"$SCRIPT_NAMES"')(\.sh)?([^a-zA-Z0-9_.-]|$)' /dev/stdin \
    | sed "s|^|${f}:|" >> "$work/bare.txt"
}
for f in "${MD_FILES[@]}"; do
  if ! printf '%s\n' "$ALLOWED_BARE" | grep -qxF "$f"; then
    # shellcheck disable=SC2094  # $f is only a label for scan_bare, which appends to $work/bare.txt
    strip_fences < "$f" | scan_bare "$f"
  fi
done
for f in "${SH_FILES[@]}"; do
  if ! printf '%s\n' "$ALLOWED_BARE" | grep -qxF "$f"; then
    grep -E '^[[:space:]]*#' "$f" | strip_fences | scan_bare "$f"
  fi
done
if [ -s "$work/bare.txt" ]; then
  echo "FAIL: bare library refs (qualify with .ai-prompts/):"
  sort -u "$work/bare.txt" | head -30
  fail=1
else
  echo "ok: no bare library refs"
fi

# ---------------------------------------------------------------- B. docs refs resolve
# A ref that MEANS a library doc is written .ai-prompts/docs/... (bare
# docs/... in corpus text is app-relative: the consumer project's own
# docs/, created at execution time). So: every .ai-prompts/docs/... ref
# must resolve under docs/, and bare docs/... refs inside docs/*.md
# (repo docs describing the repo) must resolve too.
echo "== B. docs/ refs resolve on disk =="
: > "$work/docsrefs.txt"
for f in "${MD_FILES[@]}"; do
  strip_fences < "$f" \
    | grep -o -E '(^|[^.a-zA-Z0-9_/-])\.ai-prompts/docs/[a-zA-Z0-9_./-]+' \
    | sed -E 's/^[^.a-zA-Z]//; s/[.,;:!?)"'"'"']+$//' \
    | sed "s|^|${f}::|" >> "$work/docsrefs.txt" || true
  case "$f" in
    docs/*.md)
      strip_fences < "$f" \
        | grep -o -E '(^|[^.a-zA-Z0-9_/-])docs/[a-zA-Z0-9_./-]+' \
        | sed -E 's/^[^a-zA-Z]//; s/[.,;:!?)"'"'"']+$//' \
        | sed "s|^|${f}::|" >> "$work/docsrefs.txt" || true
      ;;
  esac
done
: > "$work/bad-docs.txt"
while IFS= read -r line; do
  file="${line%%::*}"; ref="${line#*::}"
  target="${ref#.ai-prompts/}"
  [ "$target" = "docs/" ] && continue
  # directory refs (trailing /) are not file refs
  case "$target" in */) continue;; esac
  if [ ! -e "$REPO_ROOT/$target" ]; then
    echo "$file: $ref -> MISSING ($target)" >> "$work/bad-docs.txt"
  fi
done < "$work/docsrefs.txt"
if [ -s "$work/bad-docs.txt" ]; then
  echo "FAIL: docs refs that do not resolve:"
  sort -u "$work/bad-docs.txt" | head -30
  fail=1
else
  echo "ok: all docs refs resolve"
fi

# ---------------------------------------------------------------- C. outputs have producers
echo "== C. output filenames have producers =="
# filename-pattern | file that must mention it (the producer)
PRODUCERS=(
  "product-vision.md|prompts/orchestrators/product-vision.md"
  "source-ledger.md|prompts/orchestrators/research-and-fanout-policy.md"
  "epics.md|prompts/orchestrators/ai-agent-entry-point.md"
  "brief-keywords.md|prompts/AGENTS.md"
  "features-|prompts/AGENTS.md"
  "external-accounts.md|prompts/orchestrators/audit-and-remediate.md"
  "ui-reference-source-map.md|prompts/AGENTS.md"
  "architecture.md|prompts/orchestrators/architecture-blueprint.md"
  "ux-flows.md|prompts/orchestrators/ux-blueprint.md"
  "content-system.md|prompts/orchestrators/content-system.md"
  "tasks-|prompts/AGENTS.md"
  "delivery-order.md|scripts/build-delivery-order.sh"
  "release-plan.md|prompts/orchestrators/release-plan.md"
  "store-submission.md|prompts/orchestrators/store-submission.md"
  "audit-report.md|prompts/orchestrators/audit-and-remediate.md"
  "gap-list.md|prompts/orchestrators/audit-and-remediate.md"
  "remediation-|prompts/orchestrators/audit-and-remediate.md"
  "task-schema-repair-report.md|scripts/repair-task-schema-fields.sh"
  "path-ledger.md|scripts/finalize.sh"
  "task-contract.json|scripts/finalize.sh"
  "task-graph.json|scripts/build-task-graph.sh"
  "phase-order-report.md|scripts/finalize.sh"
  "baseline-task-coverage.md|scripts/finalize.sh"
  "user-review-checkpoints.md|scripts/finalize.sh"
  "revise-report.md|scripts/revise.sh"
  "execution-log.md|prompts/orchestrators/executor.md"
  "resumption-checkpoint.md|prompts/orchestrators/ai-agent-entry-point.md"
)
: > "$work/orphans.txt"
for row in "${PRODUCERS[@]}"; do
  name="${row%%|*}"; producer="${row#*|}"
  if ! grep -qF "$name" "$REPO_ROOT/$producer" 2>/dev/null; then
    echo "output '$name' has no mention in documented producer $producer" >> "$work/orphans.txt"
  fi
done
if [ -s "$work/orphans.txt" ]; then
  echo "FAIL: output filenames with no producer:"
  cat "$work/orphans.txt"
  fail=1
else
  echo "ok: every documented output is mentioned by its producer"
fi

echo "----------------------------------------"
if [ "$fail" -ne 0 ]; then
  echo "reference-integrity: FAIL"
  exit 1
fi
echo "reference-integrity: PASS"
