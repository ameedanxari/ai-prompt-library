#!/usr/bin/env bash
set -euo pipefail

# Deploy steering symlinks using shared library functions
SCRIPT_DIR="$(dirname "$0")"
. "$SCRIPT_DIR/lib.sh"

deploy_steering_symlinks

# Basic verification listing
echo '--- Symlink verification ---'
for dir in "${STEER_TARGETS[@]}"; do
  echo "-> $dir"
  ls -la "$dir" || true
  for f in "${STEER_FILES[@]}"; do
    if [ -L "$dir/$f" ] && [ -e "$dir/$f" ]; then
      echo "OK: $dir/$f -> $(readlink "$dir/$f")"
    else
      echo "MISSING or BROKEN: $dir/$f"
    fi
  done
done

# VS Code settings check
echo "--- .vscode/settings.json check ---"
if [ -f ".vscode/settings.json" ]; then
  if grep -q "aiPromptLibrary.steeringPath" .vscode/settings.json; then
    echo "settings: aiPromptLibrary.steeringPath present"
  else
    echo "settings: aiPromptLibrary.steeringPath missing"
  fi
  echo "---- file contents ----"
  cat .vscode/settings.json
else
  echo ".vscode/settings.json not found"
fi
