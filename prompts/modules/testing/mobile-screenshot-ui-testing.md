# Mobile Screenshot UI Testing Template

<!-- INSTANTIATION RULES
When the drill-down engine (or any orchestrator) uses this template:
1. Every placeholder — including {{variables}}, <TBD>, [project name], and generic
   field/function/endpoint names — MUST be replaced with project-specific values
   before output is written to prompts/outputs/current/.
2. The template filename MUST NOT appear in task output. Dissolve the template
   into concrete content; do not reference its source.
3. No strings beginning with ".ai-prompts/prompts/" may appear in the output
   (validated by scripts/validate-instantiation.sh).
4. Outputs must contain real data shapes, real endpoints, real file paths, and
   real function signatures specific to the project.
-->

## Purpose

This template provides robust native mobile screenshot UI testing patterns for iOS and Android apps. It covers deterministic screenshot scenario rendering, locale and RTL coverage, light/dark theme coverage, simulator and emulator orchestration, artifact collection, debug capture, and CI-ready failure reporting for App Store, Play Store, visual QA, and release review workflows.

Use this template when a mobile project needs high-quality screenshots captured from native UI tests rather than hand-run device sessions or ad hoc simulator screenshots.

## Instructions

1. Identify every screenshot scenario as a concrete screen state with deterministic data, locale coverage, theme coverage, and device class coverage.
2. Add one native screenshot harness per platform:
   - iOS: XCUITest with app-scoped launch environment, forced language, mocked backend payloads, and PNG writes from `XCUIScreen`.
   - Android: instrumentation or Compose UI tests with deterministic screen state, locale/RTL configuration, theme configuration, and PNG writes through `additionalTestOutputDir`.
3. Add a runner script that owns device cleanup, run locking, device selection, timeout handling, debug artifacts, and final pass/fail summary.
4. Add localization completeness checks before screenshot capture so missing copy fails before visual artifacts are produced.
5. Store artifacts under stable paths that encode platform, device class, locale, scenario, and theme.
6. Verify screenshots with file existence, dimensions, non-empty image content, locale-specific visible text, and baseline diff where baselines exist.
7. Keep screenshots free of secrets, real account data, production network calls, and unreproducible timestamps.

## Context

Native mobile screenshot testing has more failure modes than browser screenshot capture: simulator state leaks between runs, Android can select the wrong connected device, locale forcing can destabilize global device settings, and visual output often depends on live APIs unless the app has deterministic test seams.

The tested pattern is to treat screenshot capture as a first-class UI test product:
- A native harness renders a curated scenario matrix.
- Test launch state is controlled by environment variables, instrumentation arguments, or mocked ViewModels.
- Each capture writes a real PNG to a predictable artifact directory.
- The runner handles simulator and emulator lifecycle instead of assuming a clean machine.
- Failure output includes logs, device state, and at least one last-known screenshot.

## Core Components

### Screenshot Matrix Contract

```typescript
interface MobileScreenshotMatrix {
  appName: string;
  platforms: Array<'ios' | 'android'>;
  locales: string[];
  deviceClasses: MobileDeviceClass[];
  scenarios: ScreenshotScenario[];
  themes: Array<'light' | 'dark'>;
  outputRoot: string;
  baselineRoot?: string;
}

interface MobileDeviceClass {
  id: string;
  platform: 'ios' | 'android';
  role: 'phone' | 'tablet';
  preferredNames: string[];
  expectedSize: {
    width: number;
    height: number;
  };
}

interface ScreenshotScenario {
  id: string;
  screenName: string;
  requiredSelectors: string[];
  localizedCopyKeys: string[];
  fixtureName: string;
  allowsNetwork: false;
  masksSensitiveValues: true;
}
```

### Native Harness Responsibilities

```typescript
interface NativeScreenshotHarness {
  configureLocale(locale: string): Promise<void>;
  configureTheme(theme: 'light' | 'dark'): Promise<void>;
  loadScenario(scenarioId: string): Promise<void>;
  waitUntilStable(selectors: string[]): Promise<void>;
  captureScreenshot(destination: string): Promise<void>;
  emitDiagnostic(event: ScreenshotDiagnosticEvent): void;
}

interface ScreenshotDiagnosticEvent {
  platform: 'ios' | 'android';
  device: string;
  locale: string;
  theme: 'light' | 'dark';
  scenarioId: string;
  failureClass: 'selector_mismatch' | 'locale_missing' | 'capture_failed' | 'device_unavailable';
  observedState: string;
}
```

### Runner Responsibilities

```typescript
interface MobileScreenshotRunner {
  acquireRunLock(): Promise<void>;
  prepareArtifacts(root: string): Promise<void>;
  cleanupDevices(platforms: Array<'ios' | 'android'>): Promise<void>;
  selectIOSDestinations(candidates: string[]): Promise<IOSDestination[]>;
  selectAndroidAvds(candidates: AndroidAvdCandidate[]): Promise<AndroidAvd[]>;
  runPlatformMatrix(matrix: MobileScreenshotMatrix): Promise<MobileScreenshotRunResult>;
  captureDebugBundle(reason: string): Promise<void>;
}
```

## Examples

### Example 1: iOS XCUITest Harness

```swift
import XCTest

final class StoreScreenshotUITests: LocalizedScreenshotUITestCase {
    func testStoreScreenshots() throws {
        for theme in ["light", "dark"] {
            launchApp(
                scenario: "dashboard_populated",
                theme: theme,
                environment: [
                    "UITEST_FIXTURE": "dashboard_populated",
                    "UITEST_DISABLE_NETWORK": "1"
                ]
            )

            assertElementExists(
                app.staticTexts["dashboardTitle"],
                selector: "dashboardTitle",
                scenario: "dashboard_populated"
            )
            saveScreenshot(name: "dashboard_populated", theme: theme)
        }
    }
}

class LocalizedScreenshotUITestCase: XCTestCase {
    var app: XCUIApplication!
    private(set) var currentLanguage = "en"

    class var supportedLanguages: [String] { ["en", "ar", "ur"] }

    override func setUpWithError() throws {
        try super.setUpWithError()
        continueAfterFailure = false
        app = XCUIApplication()
    }

    override func invokeTest() {
        let requested = ProcessInfo.processInfo.environment["UITEST_LANGUAGES"]?
            .split(separator: ",")
            .map { $0.trimmingCharacters(in: .whitespacesAndNewlines).lowercased() }
            .filter { !$0.isEmpty }

        for language in requested ?? Self.supportedLanguages {
            currentLanguage = language
            setenv("FORCED_LANGUAGE", language, 1)
            super.invokeTest()
        }
    }

    func launchApp(scenario: String, theme: String, environment: [String: String]) {
        app.terminate()
        app.launchArguments = ["-UI-Testing", "-Language", currentLanguage]
        if theme == "dark" {
            app.launchArguments += ["-AppleInterfaceStyle", "Dark"]
        }
        app.launchEnvironment = environment.merging([
            "FORCED_LANGUAGE": currentLanguage,
            "UITEST_SCENARIO": scenario,
            "SCREENSHOT_THEME": theme
        ]) { _, new in new }
        app.launch()
    }

    func saveScreenshot(name: String, theme: String) {
        let screenshot = XCUIScreen.main.screenshot()
        let outputRoot = ProcessInfo.processInfo.environment["SCREENSHOT_OUTPUT_DIR"] ?? "/tmp/mobile-screenshots"
        let device = ProcessInfo.processInfo.environment["SIMULATOR_DEVICE_NAME"] ?? "ios-simulator"
        let safeDevice = device.replacingOccurrences(of: " ", with: "_")
        let suffix = theme == "dark" ? "_dark" : ""
        let path = "\(outputRoot)/ios/\(safeDevice)/\(currentLanguage)/\(name)\(suffix).png"

        let url = URL(fileURLWithPath: path)
        try? FileManager.default.createDirectory(
            at: url.deletingLastPathComponent(),
            withIntermediateDirectories: true
        )
        try? screenshot.pngRepresentation.write(to: url, options: .atomic)
        add(XCTAttachment(screenshot: screenshot))
        print("SCREENSHOT_PATH: \(path)")
    }

    func assertElementExists(_ element: XCUIElement, selector: String, scenario: String) {
        if !element.waitForExistence(timeout: 5) {
            print("UITEST_DIAGNOSTIC: platform=ios locale=\(currentLanguage) scenario=\(scenario) selector=\(selector)")
            XCTFail("Missing required screenshot element: \(selector)")
        }
    }
}
```

### Example 2: Android Compose Screenshot Harness

```kotlin
package com.example.app.screenshots

import android.content.Context
import android.content.res.Configuration
import android.graphics.Bitmap
import android.os.Build
import android.text.TextUtils
import android.view.ContextThemeWrapper
import androidx.activity.ComponentActivity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.mutableStateOf
import androidx.compose.ui.graphics.asAndroidBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.test.captureToImage
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onRoot
import androidx.compose.ui.unit.LayoutDirection
import androidx.core.view.drawToBitmap
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.filters.LargeTest
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import java.io.File
import java.io.FileOutputStream
import java.util.Locale

@LargeTest
@RunWith(AndroidJUnit4::class)
class StoreScreenshotTest {
    @get:Rule
    val composeRule = createAndroidComposeRule<ComponentActivity>()

    private data class Scenario(
        val id: String,
        val locale: String,
        val title: String,
        val isDark: Boolean
    )

    private val scenarios = listOf(
        Scenario("dashboard_populated", "en", "Storage dashboard", false),
        Scenario("dashboard_populated", "ar", "لوحة التخزين", false),
        Scenario("dashboard_populated", "ur", "اسٹوریج ڈیش بورڈ", false),
        Scenario("dashboard_populated", "en", "Storage dashboard", true),
        Scenario("dashboard_populated", "ar", "لوحة التخزين", true),
        Scenario("dashboard_populated", "ur", "اسٹوریج ڈیش بورڈ", true)
    )

    private var localeContext: Context? = null

    @Test
    fun captureStoreScreenshots() {
        val args = InstrumentationRegistry.getArguments()
        val localeFilter = args.getString("locale")
        val outputRoot = args.getString("additionalTestOutputDir")
            ?: System.getenv("SCREENSHOT_OUTPUT_DIR")
            ?: composeRule.activity.getExternalFilesDir("screenshots")?.absolutePath
            ?: composeRule.activity.filesDir.resolve("screenshots").absolutePath
        val device = (System.getenv("SCREENSHOT_DEVICE") ?: Build.MODEL ?: "android").replace(" ", "_")
        val active = scenarios.filter { localeFilter == null || it.locale == localeFilter }
        val current = mutableStateOf(active.first())

        setLocale(current.value.locale, current.value.isDark)
        composeRule.setContent {
            val scenario = current.value
            val isRtl = scenario.locale in setOf("ar", "ur", "fa", "he")
            val direction = if (isRtl) LayoutDirection.Rtl else LayoutDirection.Ltr
            val context = localeContext ?: composeRule.activity

            MaterialTheme {
                CompositionLocalProvider(
                    LocalLayoutDirection provides direction,
                    LocalContext provides context
                ) {
                    Surface {
                        Text(text = scenario.title)
                    }
                }
            }
        }

        active.forEach { scenario ->
            setLocale(scenario.locale, scenario.isDark)
            current.value = scenario
            composeRule.waitForIdle()

            val suffix = if (scenario.isDark) "_dark" else ""
            val target = File(outputRoot, "android/$device/${scenario.locale}/${scenario.id}$suffix.png")
            target.parentFile?.mkdirs()
            saveImage(captureBitmap(), target)
        }
    }

    private fun captureBitmap(): Bitmap {
        return try {
            composeRule.onRoot().captureToImage().asAndroidBitmap()
        } catch (_: Throwable) {
            composeRule.runOnIdle {
                composeRule.activity.findViewById<android.view.View>(android.R.id.content).drawToBitmap()
            }
        }
    }

    private fun saveImage(bitmap: Bitmap, file: File) {
        FileOutputStream(file).use { out ->
            bitmap.compress(Bitmap.CompressFormat.PNG, 100, out)
        }
    }

    private fun setLocale(tag: String, isDark: Boolean) {
        val locale = Locale.forLanguageTag(tag)
        Locale.setDefault(locale)
        composeRule.activityRule.scenario.onActivity { activity ->
            val config = Configuration(activity.resources.configuration)
            config.setLocale(locale)
            config.setLayoutDirection(locale)
            localeContext = ContextThemeWrapper(activity, activity.theme).apply {
                applyOverrideConfiguration(config)
            }
            activity.window.decorView.layoutDirection =
                if (TextUtils.getLayoutDirectionFromLocale(locale) == android.view.View.LAYOUT_DIRECTION_RTL) {
                    android.view.View.LAYOUT_DIRECTION_RTL
                } else {
                    android.view.View.LAYOUT_DIRECTION_LTR
                }
        }
    }
}
```

### Example 3: Runner Command Contract

```bash
#!/usr/bin/env bash
set -euo pipefail

artifacts_dir="${1:-artifacts/mobile-screenshots}"
mkdir -p "$artifacts_dir/debug"

run_ios() {
  xcodebuild test \
    -project ios/ExampleApp.xcodeproj \
    -scheme ExampleApp \
    -destination "platform=iOS Simulator,name=iPhone 16 Pro Max" \
    -only-testing:ExampleAppUITests/StoreScreenshotUITests \
    SCREENSHOT_OUTPUT_DIR="$PWD/$artifacts_dir" \
    -resultBundlePath "$artifacts_dir/debug/ios.xcresult"
}

run_android() {
  ANDROID_SERIAL="${ANDROID_SERIAL:-emulator-5554}" \
    ./android/gradlew -p android :app:connectedDebugAndroidTest \
    -Pandroid.testInstrumentationRunnerArguments.class=com.example.app.screenshots.StoreScreenshotTest \
    -Pandroid.testInstrumentationRunnerArguments.locale=en
}

run_ios
run_android
```

## Implementation Patterns

### Deterministic Scenario Rendering

- Use mocked backend responses, fake repositories, test-only launch arguments, or direct Compose/ViewModel rendering.
- Do not depend on production accounts, live API latency, current date text, random recommendations, or device-local user data.
- Capture both success and failure states for critical flows.
- Include at least one long-copy state per locale to expose clipping and line-break failures.
- Include at least one RTL locale when the app supports Arabic, Hebrew, Persian, or Urdu.

### Locale and Theme Fan-Out

- iOS should keep language forcing app-scoped through launch arguments and launch environment.
- Android should apply `Locale`, `Configuration`, and layout direction inside the instrumentation test process.
- Capture dark mode as an explicit scenario dimension, not as an ambient machine setting.
- Keep file names stable: `<platform>/<device>/<locale>/<scenario>[_dark].png`.

### Device Lifecycle and Isolation

- Use a run lock so two screenshot jobs cannot fight over simulators or emulators.
- Shut down booted simulators and emulators before and after the run.
- On Android, set `ANDROID_SERIAL` and disconnect unrelated TCP devices so Gradle does not pick the wrong target.
- Use a run-scoped derived data or Gradle output directory when possible.
- Capture debug logs, result bundles, and a last-known screenshot on failure.

### Validation Gates

- Pre-capture: localization key parity for iOS `.strings` and Android `strings.xml`.
- During capture: required selector exists before writing the screenshot.
- Post-capture: PNG exists, dimensions match the device class, image is non-empty, and baseline diff is within tolerance.
- Review: OCR or manual review confirms localized copy and no sensitive data.

## Configuration

### Screenshot Matrix YAML

```yaml
platforms:
  ios:
    project: ios/ExampleApp.xcodeproj
    scheme: ExampleApp
    testTarget: ExampleAppUITests
    testClass: StoreScreenshotUITests
    devices:
      - id: iphone-6.7
        preferredNames: ["iPhone 16 Pro Max", "iPhone 15 Pro Max"]
        expectedSize: { width: 1290, height: 2796 }
      - id: ipad-13
        preferredNames: ["iPad Pro 13-inch (M4)", "iPad Pro 12.9-inch (6th generation)"]
        expectedSize: { width: 2048, height: 2732 }
  android:
    projectDir: android
    packageName: com.example.app
    testClass: com.example.app.screenshots.StoreScreenshotTest
    avds:
      - id: phone
        preferredNames: ["ExampleApp_Phone", "Pixel_8"]
        expectedSize: { width: 1080, height: 2400 }
      - id: tablet
        preferredNames: ["ExampleApp_Tablet", "Pixel_Tablet"]
        expectedSize: { width: 1600, height: 2560 }
locales: ["en", "ar", "ur"]
themes: ["light", "dark"]
scenarios:
  - id: dashboard_populated
    screenName: Dashboard
    requiredSelectors: ["dashboardTitle", "storageSummaryCard"]
    localizedCopyKeys: ["dashboard.title", "dashboard.storageSummary"]
  - id: error_recovery
    screenName: Error Recovery
    requiredSelectors: ["errorBanner", "retryButton"]
    localizedCopyKeys: ["error.network", "common.retry"]
```

### CI Workflow Shape

```yaml
name: Mobile screenshots

on:
  workflow_dispatch:
  pull_request:
    paths:
      - "ios/**"
      - "android/**"
      - "scripts/run-mobile-screenshot-tests.sh"

jobs:
  ios-screenshots:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Capture iOS screenshots
        run: scripts/run-mobile-screenshot-tests.sh --ios --artifacts artifacts/mobile-screenshots
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: ios-mobile-screenshots
          path: artifacts/mobile-screenshots

  android-screenshots:
    runs-on: macos-latest
    steps:
      - uses: actions/checkout@v4
      - name: Capture Android screenshots
        run: scripts/run-mobile-screenshot-tests.sh --android --artifacts artifacts/mobile-screenshots
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: android-mobile-screenshots
          path: artifacts/mobile-screenshots
```

## Integration Points

- Combine with `test-automation.md` for broader unit, integration, and end-to-end strategy.
- Combine with `accessibility-testing.md` to add dynamic type, screen reader labels, contrast, and hit-target checks to screenshot scenarios.
- Combine with `ci-cd-testing.md` for artifact upload, flaky test retry policy, and release gates.
- Combine with `cross-platform/parity-validation-tests.md` when iOS and Android screenshots must demonstrate feature parity.
- Use project assets from `project-templates/testing/mobile-screenshot-ui/` when scaffolding concrete runner scripts or native harness files.

## Security Considerations

- Disable production networking during screenshot capture.
- Use synthetic accounts, redacted emails, and fake tokens.
- Never write secrets into `launchEnvironment`, instrumentation arguments, screenshots, result bundles, or logs.
- Mask user-generated private data in deterministic fixtures.
- Delete temporary screenshots and derived data after runs unless they are stored as CI artifacts with controlled retention.
- Keep debug bundles out of public release packages.

## Testing Considerations

- Unit test the runner's matrix expansion and path generation.
- Add shell tests for missing tool handling, lock behavior, and artifact directory cleanup.
- Add platform smoke tests that run one locale, one device, and one scenario before enabling the full matrix.
- Fail fast when required localization keys are missing.
- Track flake rate separately for simulator boot, app launch, selector wait, and image write failures.
- Record the exact simulator runtime, emulator API level, app version, commit SHA, and matrix configuration in a run manifest.

## Reusable Project Templates

- `project-templates/testing/mobile-screenshot-ui/run-mobile-screenshot-tests.sh` - generic runner with platform flags, lock handling, cleanup, debug artifacts, and summaries.
- `project-templates/testing/mobile-screenshot-ui/check-mobile-localization.sh` - iOS and Android localization key parity checker.
- `project-templates/testing/mobile-screenshot-ui/ios/LocalizedScreenshotUITestCase.swift.template` - XCUITest base class for locale fan-out and PNG output.
- `project-templates/testing/mobile-screenshot-ui/ios/StoreScreenshotUITests.swift.template` - iOS screenshot scenario harness.
- `project-templates/testing/mobile-screenshot-ui/android/StoreScreenshotTest.kt.template` - Android Compose screenshot scenario harness.
