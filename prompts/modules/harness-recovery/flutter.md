# Flutter Harness Recovery

Companion to `flutter.yaml`. Used by drill-down Step 3 when generating Flutter test tasks.

## Crash artifact locations

| Artifact | Path | Parser |
|---|---|---|
| Machine-readable test events | stdout of `flutter test --machine` (recommend piping to `.flutter-test.json`) | `jq` if present |
| `flutter doctor` snapshot | run on-demand by the diagnose script (`flutter doctor -v`) | grep |
| Native iOS crash dump | delegates to iOS catalog when target=iOS | see `ios.md` |
| Native Android crash dump | delegates to Android catalog when target=Android | see `android.md` |

## Classification categories

- `harness_crash` — Pub cache corruption, Flutter engine/SDK mismatch, device disconnected mid-test.
- `code_crash_known` — Missing pubspec dependency, MissingPluginException (forgot to register a platform channel), uninitialised FlutterFire.
- `code_crash_unknown` — Dart isolate crash, uncaught Dart exception in feature code. Surface symbolicated stack.

## Planning-time guidance

When generating Flutter test tasks, include in the prompt:

- The `**Test:**` command must be `flutter test --machine > .flutter-test.json 2>&1`, so the diagnose script has a stable JSON event stream to parse on failure.
- For native-platform feature tasks (camera, photos, location), the task spec must include both the platform-channel registration AND the underlying iOS/Android manifest entries (covered by the iOS/Android catalogs respectively).
- Acceptance criteria must reference the test machine output, not just human-readable stdout.

## Hard rules

1. **`flutter clean` is destructive.** Use only in the `flutter-engine-version-mismatch` recipe; never as a default reset.
2. **Stack symbolication requires obfuscation maps.** If the project builds with `--obfuscate`, the `code_crash_unknown` path must point the AI at the matching `dSYM` / debug-info files.
3. **Plugin registration crashes are not "missing dependency".** A package may be in `pubspec.yaml` but still throw `MissingPluginException` if hot-restart wasn't run. The catalog entry covers this distinction.
