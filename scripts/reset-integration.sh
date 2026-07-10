#!/usr/bin/env bash
# Force-reset AI Prompt Library integration in a consumer project.
# Run this from the consumer project root (NOT from inside .ai-prompts/).
#
# What it does:
#   1. Purges stale library-integration state files at project root.
#   2. Refreshes IDE steering files from the current .ai-prompts/ submodule.
#   3. Rewrites project-level AGENTS.md to the current drill-down flow.
#   4. Clears prompts/outputs/current/ so the engine starts clean.
#   5. Leaves MY_PROJECT.md untouched if it exists; creates from template if not.
#   6. Writes clean-state-preflight.md with reset provenance and tool readiness.
#
# What it does NOT touch:
#   - Your application source (src/, backend/, frontend/, android/, ios/, …)
#   - MY_PROJECT.md (your brief)
#   - node_modules, vendored dependencies, build artifacts
#   - docs/ directories you created yourself
#
# Usage: bash .ai-prompts/scripts/reset-integration.sh [--yes]

set -euo pipefail

LIB_DIR="${LIB_DIR:-.ai-prompts}"
CONSENT="${1:-}"

if [ ! -d "$LIB_DIR" ]; then
  echo "❌ $LIB_DIR not found. Run from the project root that contains .ai-prompts/."
  exit 1
fi

if [ ! -f "$LIB_DIR/prompts/AGENTS.md" ]; then
  echo "❌ $LIB_DIR/prompts/AGENTS.md missing. Submodule may be stale."
  echo "   Try:  git submodule update --init --remote $LIB_DIR"
  exit 1
fi

STALE_ROOT_FILES=(
  NEXT_ACTION.md
  PROJECT_STATE.md
  PROJECT_STATUS.md
  DEVELOPMENT_LOG.md
  EXECUTION_PROGRESS.md
  IMPLEMENTATION_STATUS.md
  IMPLEMENTATION_SUMMARY.md
  PRODUCTION_COMPLETION_REPORT.md
  QUICK_STATUS.md
  COMPLETED_FEATURES.md
  ARCHITECTURE_DECISIONS.md
  KNOWN_ISSUES.md
)
OUTPUT_ROOT="prompts/outputs/current"
REMOVED_ARTIFACTS=()

echo "🧹 AI Prompt Library — reset integration"
echo "========================================"
echo ""
echo "About to purge these files at project root (if present):"
for f in "${STALE_ROOT_FILES[@]}"; do
  [ -e "$f" ] && echo "   - $f"
done
echo ""
echo "And rewrite (if present):"
echo "   - AGENTS.md  (fresh steering block)"
echo "   - prompts/outputs/current/*  (cleared)"
echo ""

if [ "$CONSENT" != "--yes" ]; then
  read -r -p "Proceed? [y/N] " answer
  case "$answer" in
    [yY]|[yY][eE][sS]) ;;
    *) echo "Aborted."; exit 1 ;;
  esac
fi

# 1. Purge stale state files
echo ""
echo "[1/6] Purging stale state files…"
for f in "${STALE_ROOT_FILES[@]}"; do
  if [ -e "$f" ]; then
    rm -f "$f"
    REMOVED_ARTIFACTS+=("$f")
    echo "   removed: $f"
  fi
done

# 2. Refresh IDE steering (copies, overwriting old)
echo ""
echo "[2/6] Refreshing IDE steering files…"
STEERING_SRC="$LIB_DIR/prompts/steering"
for dest in .kiro/steering .cursor/rules .windsurf/rules .continue/rules .vscode/ai-steering .ai-steering; do
  if [ -d "$dest" ]; then
    cp -f "$STEERING_SRC"/*.md "$dest"/ 2>/dev/null || true
    echo "   refreshed: $dest/"
  fi
done

# 3. Rewrite project-level AGENTS.md
echo ""
echo "[3/6] Rewriting project-level AGENTS.md…"
# Preserve user-written content under a "## Project-specific" section if it exists.
USER_BLOCK=""
if [ -f AGENTS.md ]; then
  if grep -q "^## Project-specific" AGENTS.md; then
    USER_BLOCK=$(awk '/^## Project-specific/,EOF' AGENTS.md)
  fi
fi

cat > AGENTS.md <<'EOF'
# AGENTS

Steering for AI coding agents working on this project.

## AI Prompt Library Steering (Auto-Managed — do not edit)

Before handling any non-trivial request, read this one file:
1. `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` — entry point.

The entry point's routing logic selects ONE of four modes and then loads
the matching engine on demand:
- **Trivial** (single-file edit) → no engine load.
- **Execute** (validated plan exists) → loads `.ai-prompts/prompts/orchestrators/executor.md`.
- **Gap-closure** (existing codebase, audit/finish requested) → loads `.ai-prompts/prompts/orchestrators/audit-and-remediate.md`.
- **Greenfield** (new project) → loads `.ai-prompts/prompts/orchestrators/drill-down-engine.md`.

If the user has provided designs / specs / existing code under `working_copy/`
or references external/reference material in `MY_PROJECT.md`, the entry
point also reads `.ai-prompts/prompts/orchestrators/external-input-handler.md`
before the chosen engine.

Do NOT auto-load anything else under `.ai-prompts/prompts/orchestrators/`
without following the entry-point routing. `module-selection-index.md` is
consulted by the engines on demand, not at startup.

**Resumption.** If the user says `Continue` (or any resumption verb), the
entry point picks the cheapest valid path automatically: checkpoint
resumption if `prompts/outputs/current/resumption-checkpoint.md` exists,
execution-phase fast path if `execution-log.md` has a non-null `next_task`,
or a full force-reload only when neither shortcut is available (or the
user explicitly asks for `rebuild` / `force reload`). If neither artifact
exists and the user said only `Continue`, the entry point surfaces an
ambiguous-resumption error.

Follow the entry point's checkpoint protocol exactly. At every engine
checkpoint, stop, summarize progress, and wait for the user to say
`Continue` before moving to the next step. Do not auto-advance across
planning checkpoints.

<!-- /AI Prompt Library Steering (Auto-Managed) -->
EOF

if [ -n "$USER_BLOCK" ]; then
  printf '\n%s\n' "$USER_BLOCK" >> AGENTS.md
  echo "   rewritten (preserved your ## Project-specific section)"
else
  echo "   rewritten"
fi

# 4. Clear engine outputs
echo ""
echo "[4/6] Clearing previous engine outputs…"
if [ -d "$OUTPUT_ROOT" ]; then
  while IFS= read -r artifact; do
    [ -n "$artifact" ] && REMOVED_ARTIFACTS+=("$artifact")
  done < <(find "$OUTPUT_ROOT" \( -type f -o -type l \) -print | LC_ALL=C sort)
  rm -rf "$OUTPUT_ROOT"
  mkdir -p "$OUTPUT_ROOT/planning/features" \
           "$OUTPUT_ROOT/planning/tasks" \
           "$OUTPUT_ROOT/execution/task-results" \
           "$OUTPUT_ROOT/logs/build-gate" \
           "$OUTPUT_ROOT/logs/harness" \
           "$OUTPUT_ROOT/logs/revise" \
           "$OUTPUT_ROOT/logs/safety"
  echo "   reset: $OUTPUT_ROOT/"
else
  mkdir -p "$OUTPUT_ROOT/planning/features" \
           "$OUTPUT_ROOT/planning/tasks" \
           "$OUTPUT_ROOT/execution/task-results" \
           "$OUTPUT_ROOT/logs/build-gate" \
           "$OUTPUT_ROOT/logs/harness" \
           "$OUTPUT_ROOT/logs/revise" \
           "$OUTPUT_ROOT/logs/safety"
  echo "   created: $OUTPUT_ROOT/"
fi

# 5. Ensure MY_PROJECT.md exists
echo ""
echo "[5/6] Ensuring MY_PROJECT.md exists…"
if [ -f MY_PROJECT.md ]; then
  echo "   kept: MY_PROJECT.md (unchanged)"
else
  cp "$LIB_DIR/MY_PROJECT.md.template" MY_PROJECT.md
  echo "   created: MY_PROJECT.md from template — edit it and fill in your brief"
fi

# 6. Prove the next run starts from authoritative inputs and clean outputs.
echo ""
echo "[6/6] Writing clean-state preflight report…"
LIBRARY_VERSION="${AI_PROMPT_LIBRARY_VERSION:-}"
if [ -z "$LIBRARY_VERSION" ] && [ -f "$LIB_DIR/package.json" ]; then
  LIBRARY_VERSION=$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$LIB_DIR/package.json" | head -n 1)
fi
LIBRARY_VERSION="${LIBRARY_VERSION:-unavailable}"

LIBRARY_REVISION="${AI_PROMPT_LIBRARY_REVISION:-}"
if [ -z "$LIBRARY_REVISION" ] && command -v git >/dev/null 2>&1; then
  LIBRARY_REVISION=$(git -C "$LIB_DIR" rev-parse --short HEAD 2>/dev/null || true)
fi
LIBRARY_REVISION="${LIBRARY_REVISION:-unavailable}"

tool_readiness() {
  local tool="$1"
  local resolved
  resolved=$(command -v "$tool" 2>/dev/null || true)
  if [ -n "$resolved" ]; then
    printf 'ready (`%s`)' "$resolved"
  else
    printf 'missing'
  fi
}

PREFLIGHT_PATH="$OUTPUT_ROOT/clean-state-preflight.md"
PREFLIGHT_TMP=$(mktemp "$OUTPUT_ROOT/.clean-state-preflight.XXXXXX")
cat > "$PREFLIGHT_TMP" <<EOF
# Clean-State Preflight

- **Generated at:** $(date -u +%Y-%m-%dT%H:%M:%SZ)
- **Library path:** \`$LIB_DIR\`
- **Library version:** \`$LIBRARY_VERSION\`
- **Library revision:** \`$LIBRARY_REVISION\`
- **Reset result:** pass

## Authoritative Inputs Retained

- \`MY_PROJECT.md\` — intended fresh brief; preserved byte-for-byte when pre-existing.
EOF

for input_dir in working_copy prompts/working_copy; do
  if [ -d "$input_dir" ]; then
    printf -- '- `%s/` — external/reference material retained outside generated outputs.\n' "$input_dir" >> "$PREFLIGHT_TMP"
  fi
done

cat >> "$PREFLIGHT_TMP" <<'EOF'

All prior files under `prompts/outputs/current/` are treated as generated state, including task graphs, envelopes, reports, and product assumptions. They are not authoritative inputs for the next canary.

## Removed Stale Artifacts

EOF

if [ "${#REMOVED_ARTIFACTS[@]}" -eq 0 ]; then
  echo "- None; the output tree was already clean." >> "$PREFLIGHT_TMP"
else
  for artifact in "${REMOVED_ARTIFACTS[@]}"; do
    printf -- '- `%s`\n' "$artifact" >> "$PREFLIGHT_TMP"
  done
fi

cat >> "$PREFLIGHT_TMP" <<EOF

## Expected Output Locations

- \`$OUTPUT_ROOT/planning/features/\`
- \`$OUTPUT_ROOT/planning/tasks/\`
- \`$OUTPUT_ROOT/execution/task-results/\`
- \`$OUTPUT_ROOT/logs/{build-gate,harness,revise,safety}/\`
- \`$PREFLIGHT_PATH\`

## Tool Readiness

- **bash:** $(tool_readiness bash)
- **git:** $(tool_readiness git)
- **node:** $(tool_readiness node)
- **npm:** $(tool_readiness npm)

Promotion evaluation must retain this report with the unchanged original brief and generated canary evidence.
EOF

mv "$PREFLIGHT_TMP" "$PREFLIGHT_PATH"
echo "   wrote: $PREFLIGHT_PATH"

echo ""
echo "🟢 Reset complete."
echo ""
echo "AI agent: do NOT stop here. Proceed immediately to the entry point flow:"
echo "  1. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md"
echo "  2. Follow its mode selection (greenfield vs gap-closure vs trivial)"
echo "  3. Execute the chosen engine until its next checkpoint."
echo "  4. Write outputs to prompts/outputs/current/"
echo ""
echo "Continue with the user's original request — reset is just a precondition,"
echo "not the whole task. Do not ask the user to re-prompt, but do stop at"
echo "the next checkpoint and wait for Continue."
