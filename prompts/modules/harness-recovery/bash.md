# Bash Harness Recovery

Companion to `bash.yaml`. Used by drill-down Step 3 when generating shell-script tasks (build scripts, dev-setup scripts, CI helpers).

## Crash artifact locations

| Artifact | Path | Parser |
|---|---|---|
| Exit code | the script's exit status | numeric |
| Captured stderr | piped via `--stderr <file>` to diagnose | line scan |
| Linux core dumps | `coredumpctl list --since '5 minutes ago'` if available | line scan |
| macOS Console crashes | `~/Library/Logs/DiagnosticReports/*.crash` | (rare — most bash failures are non-segfault) |

## Classification categories

- `harness_crash` — Process killed by signal 9 (likely external OOM). One-shot retry is reasonable; if it persists, escalate.
- `code_crash_known` — Command not found, permission denied (missing `+x` or wrong shebang). One-line patch.
- `code_crash_unknown` — Segfault in a native binary the script invokes, pipefail trip. Surface the failing command name; the AI step diagnoses the upstream.

## Planning-time guidance

When generating shell-script tasks, the task prompt should already:

- Start every script with `#!/usr/bin/env bash` and `set -uo pipefail`. The library prefers `-uo pipefail` over `-eo pipefail` so the script can react to per-command failures intentionally rather than die unpredictably.
- Verify required tools at the top with explicit checks: `command -v <tool> >/dev/null || { echo "❌ install <tool>"; exit 2; }`. This converts "command not found" into a helpful error rather than a cryptic line-number.
- Use exit codes consistently: 0 success, 1 logic failure, 2 environment/setup failure, 3+ for specific categories. The catalog assumes this discipline.

## Hard rules

1. **Never auto-retry on segfault.** A native binary segfault is never transient.
2. **`chmod +x` is the only auto-applicable file-system change.** Other catalog `code_fix` recipes always go through the AI executor — chmod is the exception because it can't lose information.
3. **`set -e` is opt-out, not opt-in.** The library prefers `set -uo pipefail` so scripts can choose what to do on each failure. Catalog `code_fix` patches must not add `set -e` to a script that wasn't using it.
