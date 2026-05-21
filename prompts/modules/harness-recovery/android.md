# Android Harness Recovery

Companion to `android.yaml`. Consulted by the drill-down engine when generating Android test tasks.

## Crash artifact locations

| Artifact | Path | Parser |
|---|---|---|
| Test reports (HTML) | `android/app/build/reports/tests/<task>/index.html` | grep over the surrounding XML |
| JUnit XML | `android/app/build/test-results/<task>/*.xml` | xmllint / grep |
| App runtime crash | `adb logcat -d -b crash` | piped scan |
| Gradle daemon log | `~/.gradle/daemon/<version>/daemon-*.out.log` | tail / grep |

## Classification categories

- `harness_crash` — Gradle daemon dead, adb server crashed, emulator boot timeout, transient ADB protocol fault. Recipe restores the host environment.
- `code_crash_known` — Missing manifest permission, Gradle JVM OOM (gradle.properties needs more heap). Catalog provides a structured patch description.
- `code_crash_unknown` — Kotlin compile error or runtime exception in app code. Surface the implicated source path; the AI step handles the fix in the next executor iteration.

## Planning-time guidance

When generating Android test tasks (especially permission-sensitive ones — Photos, Camera, Location), include in the prompt:

- Manifest entries required (`<uses-permission android:name=...>`) and the runtime-request hook in the relevant screen.
- The expected `**Test:**` command shape (`./gradlew :app:testDebugUnitTest --tests "..."`) and the `**File:**` paths pointing into `android/app/src/main/`.
- Acceptance criteria mentioning the manifest permissions explicitly so a missing one is caught at acceptance time, not at runtime.

## Hard rules

1. **Never `./gradlew clean` as part of a harness recovery recipe.** Clean wipes incremental build state, slows the next 5 builds, and rarely fixes harness issues.
2. **`adb kill-server` is safe but `adb root` is not.** Recipes never escalate.
3. **Gradle heap increase ceiling.** Auto-bump up to 4096m once. Beyond that, escalate to user — bigger heaps mask leaks instead of fixing them.
