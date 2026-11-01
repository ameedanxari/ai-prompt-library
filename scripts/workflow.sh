#!/usr/bin/env bash
set -euo pipefail
LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
if [ ! -f "$LIB_DIR/dist/cli.js" ]; then
  echo "Build the library first: cd '$LIB_DIR' && npm ci && npm run build" >&2
  exit 1
fi
exec node "$LIB_DIR/dist/cli.js" "$@"
