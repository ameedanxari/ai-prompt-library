#!/usr/bin/env bash
# Public outcome-delivery gate. The TypeScript facade also checks executable tasks.
set -euo pipefail
delivery_source="${BASH_SOURCE[0]}"
while [ -L "$delivery_source" ]; do
  delivery_dir="$(cd -P "$(dirname "$delivery_source")" && pwd)"
  delivery_link="$(readlink "$delivery_source")"
  case "$delivery_link" in
    /*) delivery_source="$delivery_link" ;;
    *) delivery_source="$delivery_dir/$delivery_link" ;;
  esac
done
delivery_script_dir="$(cd -P "$(dirname "$delivery_source")" && pwd)"
delivery_package="$(cd "$delivery_script_dir/.." && pwd)"
# shellcheck source=lib/toolchain.sh
source "$delivery_script_dir/lib/toolchain.sh"
require_tool node resolve_node || exit 2
delivery_cli="$delivery_package/dist/execution/delivery-cli.js"
delivery_build=""
cleanup_delivery_build() {
  if [ -n "$delivery_build" ]; then rm -rf "$delivery_build"; fi
}
trap cleanup_delivery_build EXIT
# A checkout uses isolated compilation so edited sources cannot run stale dist;
# an installed package uses the already-built, published CLI.
if [ -f "$delivery_package/node_modules/typescript/bin/tsc" ]; then
  delivery_build="$(mktemp -d "${TMPDIR:-/tmp}/ai-prompt-delivery.XXXXXX")"
  delivery_build="$(cd "$delivery_build" && pwd -P)"
  printf '{"type":"module"}\n' > "$delivery_build/package.json"
  "$RESOLVED_NODE" "$delivery_package/node_modules/typescript/bin/tsc" \
    -p "$delivery_package/tsconfig.build.json" --outDir "$delivery_build" >&2
  delivery_cli="$delivery_build/execution/delivery-cli.js"
fi
if [ ! -f "$delivery_cli" ]; then
  echo 'Delivery CLI is unavailable; build or install the complete library package.' >&2
  exit 2
fi
"$RESOLVED_NODE" "$delivery_cli" "$@"
