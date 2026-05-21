# iOS Harness Recovery

Companion to `ios.yaml`. Consulted by the drill-down engine when
generating iOS test tasks so the task prompt already names the
recovery hooks the executor will use.

## Crash artifact locations the script reads

| Artifact | Path | Parser |
|---|---|---|
| Test result bundle | `~/Library/Developer/Xcode/DerivedData/<scheme>-*/Logs/Test/*.xcresult` | `xcrun xcresulttool get --path <p> --format json` |
| Simulator daemon log | `~/Library/Logs/CoreSimulator/CoreSimulator.log` | grep / line scan |
| Per-device system log | `~/Library/Logs/CoreSimulator/<UDID>/system.log` | grep / line scan |
| Process crash (.ips, modern format) | `~/Library/Logs/DiagnosticReports/*.ips` | plist read (line 1 is a JSON header, body is plist) |

The diagnose script walks these in priority order — first match wins — and writes structured fields into `harness-diagnosis.json`.

## Classification categories

- `harness_crash` — simulator failed to boot, derived-data corruption, xcresult unreadable. Recipe fixes the host environment; the task re-runs unchanged.
- `code_crash_known` — missing Info.plist usage description, code-signing misconfig, missing capability entitlement. Catalog provides a structured `code_fix` describing the patch. The executor's AI step applies the patch with full task context.
- `code_crash_unknown` — app threw an uncaught exception or trapped at runtime in a way the catalog can't classify. The diagnosis includes the parsed top frame and the full crash report path so the user / executor can read the implicated source.

## Planning-time guidance

When generating iOS test tasks in Step 3 of `drill-down-engine.md`, include in the prompt:

- Required Info.plist usage descriptions for any system service the feature touches (the catalog has the canonical key names).
- The expected `**Test:**` command shape that emits to a parseable xcresult (`xcodebuild test -resultBundlePath ...`).
- The acceptance check that the relevant xcresult exists under DerivedData.

Tasks generated with these hooks will recover cleanly when a harness crash is detected, because the script will know where to look.

## Hard rules

1. **Never `xcrun simctl erase all` unconditionally outside of a recipe.** That deletes user data on every simulator on the system. The catalog's recipe is bounded to the post-failure window.
2. **Never apply a code-fix that adds a usage-description with a generic string.** The fix description must reference the feature-spec text. If unknown, the script writes the fix description into the JSON but does NOT auto-apply — the AI step must source the copy from the feature spec.
3. **Crash report files are tamper-evident.** Do not edit them; only read.
