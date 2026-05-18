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
echo "[1/5] Purging stale state files…"
for f in "${STALE_ROOT_FILES[@]}"; do
  if [ -e "$f" ]; then
    rm -f "$f"
    echo "   removed: $f"
  fi
done

# 2. Refresh IDE steering (copies, overwriting old)
echo ""
echo "[2/5] Refreshing IDE steering files…"
STEERING_SRC="$LIB_DIR/prompts/steering"
for dest in .kiro/steering .cursor/rules .windsurf/rules .continue/rules .vscode/ai-steering .ai-steering; do
  if [ -d "$dest" ]; then
    cp -f "$STEERING_SRC"/*.md "$dest"/ 2>/dev/null || true
    echo "   refreshed: $dest/"
  fi
done

# 3. Rewrite project-level AGENTS.md
echo ""
echo "[3/5] Rewriting project-level AGENTS.md…"
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

Load these files (in order) before handling any non-trivial request:
1. `.ai-prompts/prompts/AGENTS.md` — authoritative instructions.
2. `.ai-prompts/prompts/orchestrators/ai-agent-entry-point.md` — entry point.
3. `.ai-prompts/prompts/orchestrators/drill-down-engine.md` — the 3-step engine.

If the user has provided designs / specs / existing code under `working_copy/`
or references external/reference material in `MY_PROJECT.md`, also load:
4. `.ai-prompts/prompts/orchestrators/external-input-handler.md`

Do NOT auto-load anything else under `.ai-prompts/prompts/orchestrators/` 
without following the entry-point routing. The core active files are 
the ones above plus `module-selection-index.md` (consulted as needed).

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
echo "[4/5] Clearing previous engine outputs…"
if [ -d prompts/outputs/current ]; then
  rm -f prompts/outputs/current/*.md
  echo "   cleared: prompts/outputs/current/"
else
  mkdir -p prompts/outputs/current
  echo "   created: prompts/outputs/current/"
fi

# 5. Ensure MY_PROJECT.md exists
echo ""
echo "[5/5] Ensuring MY_PROJECT.md exists…"
if [ -f MY_PROJECT.md ]; then
  echo "   kept: MY_PROJECT.md (unchanged)"
else
  cp "$LIB_DIR/MY_PROJECT.md.template" MY_PROJECT.md
  echo "   created: MY_PROJECT.md from template — edit it and fill in your brief"
fi

echo ""
echo "🟢 Reset complete."
echo ""
echo "AI agent: do NOT stop here. Proceed immediately to the entry point flow:"
echo "  1. Read .ai-prompts/prompts/AGENTS.md"
echo "  2. Read .ai-prompts/prompts/orchestrators/ai-agent-entry-point.md"
echo "  3. Follow its mode selection (greenfield vs gap-closure vs trivial)"
echo "  4. Execute the chosen engine until its next checkpoint."
echo "  5. Write outputs to prompts/outputs/current/"
echo ""
echo "Continue with the user's original request — reset is just a precondition,"
echo "not the whole task. Do not ask the user to re-prompt, but do stop at"
echo "the next checkpoint and wait for Continue."
