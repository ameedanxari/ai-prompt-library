#!/usr/bin/env bash
# commit-task.sh — commit one coherent canonical task file set.
# Usage: commit-task.sh --task tasks-*.md [--unit T1] [--change-line text]
#        [--safety-report report.json] [--type feat|fix|test|chore|docs|refactor]
#        [--no-verify-hooks] (only when explicitly authorized)
# Exit: 0 committed/recovered, 1 no scoped changes, 2 precondition/commit failure.
# Unrelated staged paths block the commit. The original index is preserved on
# failure; task progress files are never advanced by this script.
set -uo pipefail
source_path="${BASH_SOURCE[0]}"
while [ -L "$source_path" ]; do
  source_dir="$(cd -P "$(dirname "$source_path")" && pwd)"
  link_target="$(readlink "$source_path")"
  case "$link_target" in
    /*) source_path="$link_target" ;;
    *) source_path="$source_dir/$link_target" ;;
  esac
done
SCRIPT_DIR="$(cd -P "$(dirname "$source_path")" && pwd)"
command -v python3 >/dev/null 2>&1 || { echo 'commit-task: python3 is required' >&2; exit 2; }
exec python3 "$SCRIPT_DIR/lib/commit_task.py" "$@"
