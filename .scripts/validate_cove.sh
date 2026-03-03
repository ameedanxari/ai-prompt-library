#!/usr/bin/env bash
set -euo pipefail

# COVE-style validation for steering integration
SCRIPT_DIR="$(dirname "$0")"
. "$SCRIPT_DIR/lib.sh"

if validate_cove_internals; then
    echo "COVE Validation: ALL CHECKS PASSED"
    exit 0
else
    echo "COVE Validation: FAILED (see messages above)"
    exit 2
fi
